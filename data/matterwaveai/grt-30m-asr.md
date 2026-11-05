# MatterWaveAI/grt-30m-asr

## Resumen

GRT-30M-ASR es un modelo de reconocimiento automatico del habla (ASR) desarrollado por MatterWaveAI, construido sobre la arquitectura Geometric Rotation Transformer (GRT) y publicado bajo licencia Apache 2.0. Se trata de un fine-tune especializado del modelo multimodal MatterWaveAI/grt-30m-omni, orientado a la transcripcion de voz a texto. Su rasgo mas distintivo es que no contiene ninguna capa `nn.Linear` ni `nn.Conv1d`: toda la computacion se realiza mediante rotaciones de Givens y algebra de Clifford, lo que lo convierte en una prueba de concepto de una arquitectura de fundacion puramente rotacional.

Con 32.594.470 parametros totales (3.288.972 en la torre de audio y 29.305.498 en el backbone de lenguaje), el modelo procesa formas de onda de 16 kHz mediante analisis de Fourier de corto tiempo, las transforma a coordenadas polares log-magnitud/fase y las decodifica en texto a traves de un backbone rotacional de 12 capas. Su relevancia es fundamentalmente investigadora: demuestra que es posible entrenar un sistema ASR sin capas lineales convencionales, con un perplexity de validacion de 1.0693 tras el fine-tune especializado.

El modelo esta pensado para experimentacion en el ecosistema `transformers` y para explorar alternativas arquitectonicas a los transformers convencionales. No obstante, su tamano reducido y la ausencia de benchmarks estandar publicos lo sitúan como una pieza de investigacion mas que como un sistema ASR listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRTASRForConditionalGeneration (`model_type = "grt_asr"`), transformer rotacional con Givens butterfly stem y algebra de Clifford |
| Parametros totales | 32.594.470 (audio_tower: 3.288.972; language_model: 29.305.498) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (referenciado en tags); niveles concretos no disponibles |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo sigue un pipeline de cuatro etapas. Primero, la forma de onda de 16 kHz se transforma mediante analisis de Fourier de corto tiempo en coordenadas polares (r = log(1 + |X|), r·cos φ, r·sin φ). Despues, un stem de audio Givens butterfly de 11 etapas (`GRTPolarAudioStem`) rota estas representaciones. A continuacion, cuatro bloques encoder rotacionales bidireccionales (`GRTAudioModel`) contextualizan la senal, y un merger temporal (`GRTTemporalRotationalMerger`) pliega la secuencia 2× en el tiempo para producir 64 tokens de audio en pares planares. Finalmente, un backbone de lenguaje rotacional de 12 capas (`GRTModel` + `GRTCosineHead`) decodifica la transcripcion.

El entrenamiento emplea el optimizador `HessianPairAdam` (Sophia-Torus), basado en curvatura analitica de Gauss-Newton. La model card reporta una evolucion del perplexity de validacion desde 29312.46 (modelo no alineado) hasta 1.0693 tras la especializacion, con val_loss de 0.0670. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La innovacion principal es la "pureza rotacional": cero capas lineales y cero convoluciones en toda la red.

## Capacidades

- Transcripcion de voz a texto (speech-to-text) a partir de formas de onda de 16 kHz.
- Generacion de texto condicionada a audio mediante el pipeline `automatic-speech-recognition` de `transformers`.
- Perfilado de voz: la model card reporta un 100.0% de precision en "voice profile accuracy".
- Deteccion de contorno de prosodia: 83.3% de precision reportada.
- Coincidencia exacta de frase completa: 83.3% reportado.
- Generacion autoregresiva con decodificacion greedy (`do_sample=False`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio adicional: no disponible.

## Casos de uso

- Transcripcion de audio corto en investigacion: el modelo acepta formas de onda de aproximadamente 1,27 s (20.320 muestras a 16 kHz) y devuelve una transcripcion; adecuado para experimentos controlados con clips breves.
- Prototipado de pipelines ASR en `transformers`: permite integrar un modelo sin capas lineales en flujos existentes mediante `GRTASRForConditionalGeneration`, util para comparar arquitecturas alternativas.
- Investigacion sobre arquitecturas rotacionales: sirve como banco de pruebas para estudiar el comportamiento de rotaciones de Givens y algebra de Clifford en tareas de audio.
- Analisis de prosodia y perfil de voz: con un 83.3% de precision en contorno de prosodia, puede emplearse en estudios de entonacion o clasificacion de estilo vocal en entornos de laboratorio.
- Educacion y divulgacion: ejemplo didactico de un modelo de fundacion sin `nn.Linear` ni `nn.Conv1d`, util para cursos sobre arquitecturas alternativas.
- Pruebas de cuantizacion GGUF: los tags indican soporte GGUF, lo que permite experimentar con despliegue ligero en entornos de recursos limitados (niveles concretos no disponibles).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplexity de validacion (no alineado → especializado) | 29312.46 → 1.0693 |
| val_loss | 0.0670 |
| Precision de transcripcion de frase | 100.0% |
| Precision de perfil de voz | 100.0% |
| Precision de contorno de prosodia | 83.3% |
| Coincidencia exacta de frase completa | 83.3% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, LibriSpeech WER, etc.) en la informacion disponible. Las metricas anteriores proceden de la evaluacion interna del autor y no son directamente comparables con benchmarks publicos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 32,6 M de parametros en fp32, el modelo ocupa aproximadamente 130 MB de pesos; en cuantizacion de 8 bits rondaria los 33 MB y en 4 bits unos 17 MB (estimacion a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en tarjetas con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, etc.).
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: `transformers` (soporte nativo con `GRTASRForConditionalGeneration`); los tags indican compatibilidad con endpoints y formato GGUF, lo que sugiere despliegue via llama.cpp u Ollama, aunque no se detallan instrucciones.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MatterWaveAI/grt-30m-asr | 32,6 M | No disponible | Apache 2.0 | HuggingFace |
| OpenAI Whisper tiny | 39 M | 30 s de audio | MIT | HuggingFace, ampliamente adoptado |
| OpenAI Whisper base | 74 M | 30 s de audio | MIT | HuggingFace, ampliamente adoptado |
| wav2vec2-base | 95 M | No aplica (frame-level) | Apache 2.0 | HuggingFace |

La comparacion con Whisper y wav2vec2 es orientativa por tamano y tarea, no por rendimiento: no se dispone de WER comparables para grt-30m-asr. Whisper y wav2vec2 cuentan con benchmarks publicos en LibriSpeech y otros corpus multilingues, mientras que grt-30m-asr solo reporta metricas internas del autor.

## Limitaciones y advertencias

- No se han publicado resultados en benchmarks estandar de ASR (WER en LibriSpeech, Common Voice, etc.), por lo que su rendimiento real en transcripcion abierta es desconocido.
- Los ejemplos de la model card muestran sustituciones ("declarative" → "calm") que indican que el modelo no reproduce literalmente el audio en todos los casos.
- El modelo esta entrenado aparentemente sobre un dominio muy acotado (frases de sintesis con voces y estilos controlados); su generalizacion a audio real, ruido o acentos no esta documentada.
- Idiomas soportados no especificados; no hay evidencia de capacidad multilingue.
- Longitud de audio de entrada limitada en los ejemplos a aproximadamente 1,27 s; el comportamiento con audios mas largos no esta documentado.
- Riesgo de alucinacion en la transcripcion no cuantificado.
- Sesgos conocidos: no disponibles.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de documentacion sobre el dataset de entrenamiento desaconseja su uso en produccion sin evaluacion previa.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario practicamente inexistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MatterWaveAI/grt-30m-asr
- Modelo base: https://huggingface.co/MatterWaveAI/grt-30m-omni
- Modelo causal base: https://huggingface.co/MatterWaveAI/grt-30m
- Fine-tune de chat: https://huggingface.co/MatterWaveAI/grt-30m-chat
- Mixture-of-Rotations: https://huggingface.co/MatterWaveAI/grt-30m-mor
- Embedding: https://huggingface.co/MatterWaveAI/grt-30m-embedding
- Reranker: https://huggingface.co/MatterWaveAI/grt-30m-reranker
- Vision-Language: https://huggingface.co/MatterWaveAI/grt-30m-vl
- Tokenizer: https://huggingface.co/MatterWaveAI/grt-30m-tokenizer
- Text-to-Speech: https://huggingface.co/MatterWaveAI/grt-30m-tts
- Omni multimodal: https://huggingface.co/MatterWaveAI/grt-30m-omni
- LoRA rotacional: https://huggingface.co/MatterWaveAI/grt-30m-lora
- Whitepaper: https://huggingface.co/MatterWaveAI/grt-30m/resolve/main/GRT_Whitepaper.pdf
