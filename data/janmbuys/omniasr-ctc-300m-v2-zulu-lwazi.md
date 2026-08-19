# janmbuys/omniASR-CTC-300m-v2-Zulu-Lwazi

## Resumen

omniASR-CTC-300m-v2-Zulu-Lwazi es un modelo de reconocimiento automático del habla (ASR) para isiZulu, especializado en audio telefónico de banda estrecha (8 kHz). Desarrollado por Jan Buys (Universidad de Ciudad del Cabo), el modelo parte del checkpoint base `uctnlp/omniASR-CTC-300m-v2-Zulu-Baseline` y le aplica una adaptación LoRA (r=16, α=32) sobre atención y FFN, con los pesos ya fusionados en el checkpoint final. El modelo se complementa con un modelo de lenguaje KenLM de 6-gramas sobre subpalabras BPE-32k, e incluye el léxico necesario para decodificación con integración de LM.

El modelo tiene 326 millones de parámetros y emite caracteres a nivel de salida CTC (10.288 clases, de las cuales solo 39 son alcanzables desde el léxico). Está diseñado para cargarse directamente con `from_pretrained` sin necesidad de PEFT ni descargas adicionales. Su relevancia radica en abordar el ASR para una lengua africana de bajos recursos (isiZulu) en un dominio especialmente difícil: audio telefónico espontáneo con alta tasa de OOV, donde consigue reducir el WER del 53,36 % al 31,58 % respecto al baseline sin adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2ForCTC (Transformer encoder con CTC) |
| Parametros totales | 325.983.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio fija de Wav2Vec2, típicamente 20-30 s) |
| Tipos de cuantizacion | no disponible (pesos en fp32) |
| Idiomas soportados | isiZulu (zu) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (1,3 GB fp32) |

## Arquitectura y entrenamiento

El modelo es un `Wav2Vec2ForCTC` estándar: un encoder Transformer convolucional que procesa audio de 16 kHz y produce posteriores por frame mediante pérdida CTC (Connectionist Temporal Classification). A diferencia de lo que sugiere la model card del checkpoint base, la salida es a nivel de caracteres: las 10.284 entradas no especiales del vocabulario son caracteres individuales, no subpalabras. El token de blank CTC es `pad_token_id` = 0.

La adaptación al dominio telefónico se realizó con LoRA (r=16, α=32) sobre las capas de atención y FFN, con 7,1 millones de parámetros entrenables (2,1 % del total). El entrenamiento se hizo sobre el split de entrenamiento de Lwazi isiZulu: 4.562 utterances (~7 horas de audio). El adaptador LoRA se ha fusionado en los pesos finales del checkpoint, aunque se conserva una copia en `lora/` por trazabilidad.

El modelo se complementa con un LM KenLM de 6-gramas sobre subpalabras SentencePiece BPE-32k, entrenado con MzansiText isiZulu (71,6 millones de palabras) más 5,9 millones de palabras en inglés (7,6 %). La integración del LM se realiza mediante un decodificador Flashlight LexiconDecoder que usa un léxico que puentea subpalabras y caracteres. Las reglas de decodificación incluyen: anteponer un frame de espacio al inicio, usar `sil` = blank (no espacio), `lm_weight` óptimo de 0,75 y reducción de emisiones a solo 39 clases alcanzables desde el léxico (con `keep_ids.npy`), lo que acelera la decodificación ~250×.

## Capacidades

- Reconocimiento de voz en isiZulu para audio telefónico de banda estrecha (8 kHz), con normalización de audio a 16 kHz.
- Transcripción greedy sin LM usando solo `transformers`, y decodificación con LM KenLM de 6-gramas para mayor precisión.
- Corrección del tokenizador: el `tokenizer_config.json` incluido corrige el `word_delimiter_token` a un espacio literal (id 4), evitando el mapeo a `<unk>` que rompe el entrenamiento.
- Soporte de decodificación con léxico reducido: solo 39 de las 10.288 clases de salida son necesarias, lo que permite inferencia mucho más rápida.
- Incluye un ejemplo de inferencia (`inference_example.py`) y todos los artefactos del LM (binario KenLM, léxico, tokens, modelo SentencePiece).
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo puramente de ASR.

## Casos de uso

- Transcripción de llamadas de atención al cliente en isiZulu: el modelo está adaptado específicamente a audio telefónico de banda estrecha, por lo que es adecuado para transcribir conversaciones de contact centers. La integración con KenLM mejora la precisión en habla espontánea con OOV.
- Archivado y búsqueda de audio histórico: grabaciones telefónicas en isiZulu pueden transcribirse para indexación y búsqueda posterior. El modo greedy permite procesamiento rápido sin dependencias adicionales.
- Subtitulado de contenido hablado en isiZulu: aunque el modelo está optimizado para teléfono, también funciona en audio de estudio a 48 kHz (21,16 % → 17,10 % WER con LM), por lo que puede usarse para subtitular entrevistas o noticiarios.
- Investigación en ASR de bajos recursos: el modelo sirve como baseline fuerte para isiZulu y como referencia para estudiar técnicas de adaptación de dominio (LoRA) y decodificación con LM de subpalabras.
- Desarrollo de asistentes de voz en isiZulu: la arquitectura CTC permite inferencia en streaming y bajo consumo, apta para integración en pipelines de voz en tiempo real.
- Evaluación comparativa de modelos ASR multilingües: al ser un checkpoint público con pesos fusionados y artefactos de LM completos, es reproducible para comparar con otros sistemas ASR para lenguas africanas.

## Benchmarks y rendimiento

Resultados en Lwazi isiZulu, evaluados contra referencias resueltas por fragmentos (`lm_weight=0,75`, `word_score=-0,5`, beam 100):

| Sistema | WER validación | CER validación |
|---|---|---|
| Base, greedy | 53,36 % | 18,58 % |
| Base + LM | 46,05 % | 18,57 % |
| + LoRA, greedy | 38,16 % | 9,44 % |
| + LoRA + LM | 31,58 % | 8,78 % |

Para referencia, el mismo LM aplicado a audio de estudio de 48 kHz (African Next Voices isiZulu dev, 3.063 utterances) produce 21,16 % → 17,10 % WER. Lwazi es un conjunto notablemente más difícil por ser audio telefónico de banda estrecha, habla espontánea y ~10 % de OOV.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en fp32 ocupa 1,3 GB; en fp16 cabría en ~700 MB. La inferencia greedy es viable en CPU con pocos GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., GTX 1650, RTX 3050) es suficiente para inferencia en lotes pequeños. Para decodificación con LM y beam 100, se recomienda una GPU con 8 GB o más.
- Sí cabe en GPU de consumo: RTX 3060, RTX 4070, etc. son suficientes.
- Opciones de despliegue: al ser un modelo estándar de `transformers`, puede servirse con Hugging Face Inference Endpoints, TGI o un pipeline propio con FastAPI. La decodificación con LM requiere el Flashlight LexiconDecoder (disponible en `flashlight` o `pyctcdecode` con adaptaciones).
- Latencia y throughput: no disponibles en la información proporcionada. La reducción de emisiones a 39 clases acelera la decodificación ~250×, lo que sugiere latencias bajas en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER (Lwazi) | Licencia | Formato |
|---|---|---|---|---|---|
| omniASR-CTC-300m-v2-Zulu-Lwazi (este) | 326M | no disponible | 31,58 % (con LM) | CC-BY-4.0 | safetensors |
| uctnlp/omniASR-CTC-300m-v2-Zulu-Baseline | ~326M | no disponible | 46,05 % (con LM) | no disponible | safetensors |
| Meta omniASR-CTC-300M (multilingüe) | ~300M | no disponible | no disponible | no disponible | no disponible |

El modelo supera claramente a su baseline sin adaptación LoRA (31,58 % vs 46,05 % WER con LM). La comparación con el omniASR-CTC-300M multilingüe de Meta no es directa porque este checkpoint está especializado en isiZulu telefónico, mientras que el de Meta cubre 1600+ idiomas con menor precisión por lengua.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con datos de Lwazi y MzansiText, que pueden no representar todas las variantes dialectales del isiZulu ni contextos sociales diversos.
- Riesgo de alucinación: como todo sistema ASR, puede producir transcripciones incorrectas, especialmente en audio con ruido, solapamiento de hablantes o vocabulario fuera del dominio.
- Limitaciones de contexto: la ventana de audio de Wav2Vec2 es limitada; para audios largos se requiere segmentación previa.
- El tokenizador del checkpoint base tiene un bug conocido (espacio mapeado a `<unk>`); este repositorio lo corrige, pero si se usa el base directamente hay que sobrescribir `word_delimiter_token` manualmente.
- El modelo es de nivel de caracteres, no de subpalabras; cualquier fine-tuning posterior debe respetar esta propiedad para no degradar el rendimiento.
- La decodificación con LM requiere seguir reglas específicas (anteponer frame de espacio, `sil` = blank, `lm_weight` ≈ 0,75); ignorarlas degrada notablemente los resultados.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero hay que verificar que los datos de entrenamiento (Lwazi, MzansiText) no tengan restricciones adicionales.
- El modelo solo soporta isiZulu; no es multilingüe.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/janmbuys/omniASR-CTC-300m-v2-Zulu-Lwazi
- Checkpoint base: https://huggingface.co/uctnlp/omniASR-CTC-300m-v2-Zulu-Baseline
- Página personal del autor (Jan Buys): https://www.janmbuys.com/
- Modelos fine-tuned del base (búsqueda en HF): https://huggingface.co/models?other=base_model:finetune:aadel4/omniASR-CTC-300M-v2
- Documentación de modelos CTC en omnilingual-asr: https://deepwiki.com/facebookresearch/omnilingual-asr/2.2.2-ctc-models-(fast-asr)
