# linagora/linto_stt_fr_fastconformer_pc

## Resumen

El modelo `linagora/linto_stt_fr_fastconformer_pc` es un sistema de reconocimiento automático del habla (ASR) especializado en francés, desarrollado por LINAGORA a partir del modelo base `nvidia/stt_fr_fastconformer_hybrid_large_pc`. Se trata de un ajuste fino (fine-tuning) sobre la arquitectura FastConformer híbrida de NVIDIA, que combina decodificación Transducer (por defecto) y CTC en un único modelo de 114 millones de parámetros. El objetivo es ofrecer transcripción de audio en francés con puntuación y mayúsculas, algo que el modelo base no garantiza de forma nativa.

La relevancia de este modelo radica en su entrenamiento sobre más de 10.000 horas de habla francesa transcrita manualmente y con puntuación, procedente de fuentes diversas como Common Voice, Multilingual LibriSpeech, Vox Populi, FLEURS, corpus del CNRS (PFC, CFPP, CLAPI, Les Vocaux, ACSYNT), francés con acento africano y el corpus médico SIMSAMU. Esto lo convierte en una alternativa open source (licencia CC-BY-4.0) para pipelines de transcripción en producción, con un tamaño contenido que permite despliegue en hardware modesto.

El modelo se distribuye en formato safetensors (0,9 GB) y es compatible tanto con la librería Transformers (a través de `ParakeetForRNNT`, que requiere Transformers >= 5.0) como con el toolkit NeMo de NVIDIA. Su enfoque en un único idioma y su tamaño compacto lo sitúan como una opción eficiente frente a modelos multilingües de mayor tamaño para tareas de ASR en francés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrido (Transducer + CTC), transformer con atención convolucional aumentada |
| Parametros totales | 114.113.025 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio dependiente del segmento de entrada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | francés (fr) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura FastConformer, una variante del transformer que sustituye parte de las capas de autoatención por capas convolucionales depthwise para reducir el coste computacional y mejorar la eficiencia en el procesamiento de secuencias de audio largas. La variante híbrida incorpora dos cabezas de decodificación: una Transducer (RNN-T), que es la estrategia por defecto, y una CTC (Connectionist Temporal Classification), seleccionable mediante `change_decoding_strategy(decoder_type="ctc")` en NeMo. Esta dualidad permite al usuario elegir entre mayor precisión (Transducer) o mayor velocidad y simplicidad (CTC).

El ajuste fino se realizó sobre más de 10.000 horas de audio en francés transcrito manualmente y con puntuación. Los conjuntos de datos empleados incluyen Common Voice 17.0, Multilingual LibriSpeech, Vox Populi, FLEURS, PFC, CFPP, CLAPI, Les Vocaux, ACSYNT (corpus del CNRS), francés con acento africano (`gigant/african_accented_french`) y el corpus médico SIMSAMU (`medkit/simsamu`). No se especifica en la información disponible si se aplicaron técnicas de RLHF o DPO, ni el número exacto de tokens de entrenamiento. La innovación principal respecto al modelo base es la incorporación de puntuación y mayúsculas en las transcripciones, así como la ampliación de la diversidad de acentos y dominios (incluido el médico).

## Capacidades

- Reconocimiento automático del habla en francés con salida puntuada y con mayúsculas.
- Decodificación híbrida: Transducer (por defecto) y CTC (seleccionable).
- Procesamiento de audio mono a 16 kHz.
- Inferencia por lotes (batched inference) mediante `AutoProcessor` y `ParakeetForRNNT`.
- Integración con la API LinTO STT para despliegue como servicio de transcripción.
- Compatibilidad con NeMo para inferencia y ajuste fino adicional.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR.
- Modelo monolingüe: no soporta otros idiomas distintos del francés.

## Casos de uso

- **Transcripción de reuniones y actas**: el modelo genera texto puntuado y con mayúsculas directamente, lo que reduce el postprocesado necesario para actas o resúmenes. Su entrenamiento en corpus conversacionales (CLAPI, Les Vocaux) lo hace adecuado para habla espontánea.
- **Subtitulado automático de vídeo y audio**: integrado en pipelines de medios, permite generar subtítulos en francés con puntuación. El modelo es lo bastante ligero (114 M de parámetros, 0,9 GB) para ejecutarse en servidores sin GPU dedicada de gama alta.
- **Atención al cliente y centros de contacto**: transcripción de llamadas para análisis de calidad, búsqueda de palabras clave y cumplimiento normativo. La licencia CC-BY-4.0 permite uso comercial con atribución.
- **Documentación clínica**: el corpus médico SIMSAMU en el entrenamiento lo orienta a transcripción de consultas o notas médicas en francés, aunque requiere validación adicional por el riesgo de errores en terminología especializada.
- **Investigación lingüística y sociolingüística**: el modelo cubre acentos africanos y corpus del CNRS, lo que facilita estudios de variación dialectal y fonética del francés.
- **Despliegue soberano en infraestructura propia**: al ser open source y de tamaño contenido, encaja en arquitecturas on-premise o cloud privada para organizaciones que no pueden enviar audio a servicios externos (sanidad, administración pública).
- **Ajuste fino adicional**: al ser compatible con NeMo, sirve como punto de partida para especializar en dominios concretos (jurídico, técnico) con pocas horas de datos adicionales.

## Benchmarks y rendimiento

Resultados declarados por el autor (WER, menor es mejor). La evaluación se realizó sin puntuación ni mayúsculas, sobre subconjuntos de los splits de test:

| Dataset | Split / subconjunto | WER (%) |
|---|---|---|
| Common Voice 18.0 (fr) | test, 15% (2424 filas, 3,9 h) | 7,88 |
| Multilingual LibriSpeech (french) | test, 33% (800 filas, 3,3 h) | 4,57 |
| Vox Populi (french) | test, 33% (678 filas, 1,6 h) | 10,14 |
| SUMM-RE (fr) | test, 33% (1004 filas, 2 h, solo segmentos > 4 s) | 19,80 |

El dataset SUMM-RE se usó exclusivamente para evaluación (out-of-domain). El autor indica que el modelo mantiene un rendimiento robusto en todos los conjuntos, cercano al mejor en cada caso. No se han publicado en la información disponible resultados comparativos numéricos frente a otros modelos en estos mismos subconjuntos.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 114 M de parámetros en precisión FP32, los pesos ocupan aproximadamente 0,45 GB; en FP16, unos 0,23 GB. La VRAM total para inferencia con batches pequeños se estima por debajo de 2 GB, aunque no se proporcionan cifras oficiales.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM es suficiente; se puede ejecutar en RTX 3060, RTX 4090, A100, H100 sin problema. También es viable en CPU para inferencia no masiva.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo actual (GTX 1650 en adelante) e incluso en CPU para transcripciones puntuales.
- **Opciones de despliegue**: Transformers (pipeline o `ParakeetForRNNT`), NeMo Toolkit, API LinTO STT. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR de este tipo).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| linagora/linto_stt_fr_fastconformer_pc | 114 M | fr | ASR híbrido Transducer+CTC, con puntuación | CC-BY-4.0 | Hugging Face |
| nvidia/stt_fr_fastconformer_hybrid_large_pc (modelo base) | ~115 M | fr | ASR híbrido Transducer+CTC | no disponible en la información | Hugging Face |
| Whisper large-v3 (OpenAI) | ~1550 M | multilingüe | ASR seq2seq | MIT (según información pública, no verificada aquí) | Hugging Face |
| Otros modelos ASR franceses de LINAGORA (familia LinTO) | variable | fr | ASR | variable | Hugging Face / LinTO |

No se dispone de datos de benchmarks comparativos directos en la información proporcionada más allá del modelo base. El modelo base de NVIDIA es el punto de referencia natural; este ajuste añade puntuación y un corpus de entrenamiento ampliado (10.000+ horas). Frente a Whisper large-v3, el modelo de LINAGORA es aproximadamente 13 veces más pequeño, lo que reduce requisitos de hardware, a costa de ser monolingüe y no cubrir tareas de traducción o ASR multilingüe.

## Limitaciones y advertencias

- **Monolingüe**: solo transcribe francés; no soporta otros idiomas ni code-switching documentado.
- **Riesgo de alucinación**: como todo modelo ASR, puede generar texto plausible en segmentos con ruido, silencios o audio de baja calidad; el WER de 19,8% en SUMM-RE (out-of-domain) indica degradación fuera del dominio de entrenamiento.
- **Puntuación y mayúsculas**: aunque el modelo las genera, no se garantiza su corrección gramatical; se recomienda revisión en producciones críticas.
- **Sesgos**: el entrenamiento incluye corpus diversos (acentos africanos, corpus médicos, habla espontánea), pero no se documenta un análisis de sesgos por género, edad o origen regional; el rendimiento puede variar según el acento.
- **Licencia CC-BY-4.0**: permite uso comercial con atribución; es necesario citar a LINAGORA y conservar la licencia en redistribuciones.
- **Dependencia de Transformers >= 5.0**: la clase `ParakeetForRNNT` requiere esa versión, lo que puede suponer un problema en entornos con versiones anteriores.
- **Formato de audio**: requiere audio mono a 16 kHz; no se documenta soporte nativo para otros formatos o frecuencias de muestreo sin remuestreo previo.
- **Sin datos de cuantización**: no se publican pesos GGUF, ONNX ni cuantizaciones oficiales, lo que limita el despliegue en entornos con restricciones de memoria muy estrictas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/linagora/linto_stt_fr_fastconformer_pc
- Modelo base NVIDIA: https://huggingface.co/nvidia/stt_fr_fastconformer_hybrid_large_pc
- Leaderboard ASR francés de LINAGORA: https://linagora-labs.github.io/asr_benchmark/
- Repositorio de evaluación ASR: https://github.com/linagora-labs/asr_benchmark
- Dataset SUMM-RE: https://huggingface.co/datasets/linagora/SUMM-RE
- API LinTO STT: https://github.com/linto-ai/linto-stt/tree/master/nemo
- NeMo Speech Toolkit: https://github.com/NVIDIA-NeMo/Speech
- LINAGORA (web corporativa): https://linagora.com/
- LINAGORA.AI: https://www.linagora.ai/
- Paper FastConformer (arXiv 2305.05084): https://arxiv.org/abs/2305.05084
- Paper relacionado (arXiv 2207.08292): https://arxiv.org/abs/2207.08292
