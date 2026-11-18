# alphaedge-ai/whisper-base-amh-16384

## Resumen

whisper-base-amh-16384 es una variante podada de openai/whisper-base, el modelo de reconocimiento automático del habla (ASR) publicado por OpenAI en 2022. Lo desarrolla alphaedge-ai y aplica la técnica de *trimming* de vocabulario descrita por Hugging Face para especializar el modelo en amárico (am), reduciendo el vocabulario de 51.865 a 16.384 tokens. El resultado es un checkpoint un 25,02 % más pequeño en parámetros (54.427.648 frente a 72.593.920) y un 68,41 % menos de entradas en el vocabulario.

El problema que resuelve es el sobredimensionamiento del vocabulario multilingüe de Whisper cuando solo se necesita un idioma: los tokens no utilizados en amárico se eliminan, lo que reduce el peso en disco (repo de 0,1 GB), la memoria de la matriz de embeddings y el coste de decodificación. La arquitectura subyacente es el transformer encoder-decoder de Whisper, con entrada de audio a 16 kHz y contexto de 30 segundos por ventana, entrenado originalmente con supervisión débil a gran escala.

Es relevante ahora porque demuestra una vía de bajo coste para desplegar ASR en idiomas de bajos recursos como el amárico en entornos con recursos limitados, manteniendo la licencia Apache 2.0 del original. No obstante, el modelo no publica métricas de calidad (WER) y su adopción es aún muy baja (58 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con poda de vocabulario por trimming |
| Parametros totales | 54.427.648 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ventanas de audio de 30 s (estándar de Whisper); contexto textual derivado del vocabulario podado a 16.384 tokens |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precisión original) |
| Idiomas soportados | am (amárico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un transformer encoder-decoder con atención estándar, que procesa espectrogramas log-Mel de 80 canales extraídos de audio a 16 kHz y genera transcripciones token a token. El modelo original tiene 72,6 M de parámetros; esta variante conserva la práctica totalidad de los pesos del encoder y decoder y solo reduce la matriz de embeddings del vocabulario, quedando en 54,4 M de parámetros. No se ha reentrenado el modelo desde cero: se parte de openai/whisper-base y se recorta el vocabulario, de modo que la relación con el modelo base es de cuantización/poda declarada (`base_model_relation: quantized`).

La selección de tokens se hizo mediante minería sobre 200.000 textos del dataset lbourdois/fineweb-2-trimming, conservando los 16.384 tokens más relevantes para amárico. No hay información sobre ajuste fino posterior, RLHF/DPO ni datos de audio específicos de amárico en la información disponible; el conocimiento del idioma proviene del entrenamiento multilingüe original de Whisper. La innovación técnica es, por tanto, exclusivamente la reducción de vocabulario, no cambios en el mecanismo de atención ni en la decodificación.

## Capacidades

- Reconocimiento automático del habla (transcripción) en amárico, con pipeline `automatic-speech-recognition`.
- Procesamiento de audio a 16 kHz en ventanas de hasta 30 segundos, con posibilidad de segmentación para audios más largos mediante el pipeline de transformers.
- Tareas de traducción y transcripción del formato Whisper (parámetro `task`), aunque solo el amárico está validado por el autor.
- Integración nativa con `transformers` (`AutoModelForSpeechSeq2Seq`, `AutoProcessor`, `pipeline`).
- Compatible con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento explícito: es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones y entrevistas en amárico: el modelo convierte audio de hasta 30 s por ventana en texto, adecuado para actas y subtitulado cuando se segmenta el audio con solapamiento.
- Subtitulado automático de vídeo en amárico: generación de pistas SRT a partir de la salida del pipeline, con la ventaja de un peso de 0,1 GB que permite ejecutarlo en el mismo servidor que el codificador de vídeo.
- Atención al cliente en centros de contacto etíopes: transcripción de llamadas grabadas para análisis de calidad y búsqueda de texto completo, con un coste de inferencia bajo gracias a los 54,4 M de parámetros.
- Archivado y accesibilidad de material audiovisual: conversión de archivos de radio o televisión en amárico a texto indexable, desplegable en CPU por su reducido tamaño.
- Investigación en ASR de bajos recursos: punto de partida para *fine-tuning* en amárico con datasets propios, al ser un checkpoint Apache 2.0 y un 25 % más ligero que el original.
- Despliegue en dispositivos de borde o entornos con poca memoria: al ocupar 0,1 GB en safetensors, cabe en contenedores pequeños y en GPUs de gama baja, útil para dictado offline.
- Preprocesamiento de corpus de voz para minería de datos: transcripción masiva de audio amárico antes de pasarlo a un LLM para tareas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER ni comparaciones cuantitativas con el modelo original; solo aporta las cifras de reducción de vocabulario (68,41 %) y de parámetros (25,02 %).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (54,4 M de parámetros, ~218 MB de pesos) más el buffer de activaciones del encoder; en la práctica, menos de 2 GB en total.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4 o A100 es más que suficiente. El modelo también funciona en CPU.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales e incluso en iGPU con memoria compartida.
- Opciones de despliegue: `transformers` con pipeline de ASR, endpoints de Hugging Face, y exportación a otros runtimes (ONNX, CTranslate2) aunque no se documenta en la model card. No se menciona soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; no se publican mediciones. Por tamaño, se espera una latencia muy baja en GPU, pero no hay cifras verificables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-amh-16384 | 54,4 M | ventanas de 30 s | am | apache-2.0 | Hugging Face, 58 descargas |
| openai/whisper-base | 72,6 M | ventanas de 30 s | multilingüe (99 idiomas) | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-small | ~244 M | ventanas de 30 s | multilingüe (99 idiomas) | apache-2.0 | Hugging Face, ampliamente usado |
| openai/whisper-tiny | ~39 M | ventanas de 30 s | multilingüe (99 idiomas) | apache-2.0 | Hugging Face, ampliamente usado |

No hay datos de WER para comparar la calidad real frente a whisper-base o whisper-small en amárico; la comparación disponible es únicamente de tamaño, cobertura de idiomas y licencia.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens no usados en amárico: el modelo probablemente no funcione bien en otros idiomas, incluidos los que el Whisper original sí cubría.
- No se publican métricas de WER ni evaluaciones de calidad; no hay evidencia de que la poda preserve la precisión del modelo base en amárico.
- Riesgo de alucinación típico de Whisper: en audio con ruido, silencios o dominio no visto puede generar texto inventado o repetir frases.
- El amárico es un idioma de bajos recursos en el corpus de entrenamiento de Whisper, por lo que la cobertura y la calidad esperadas son inferiores a las de idiomas mayoritarios.
- Ventana de 30 s por segmento: requiere segmentación y solapamiento para audios largos, con riesgo de errores en las fronteras.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Adopción muy baja (58 descargas, 0 likes) y sin validación de terceros: conviene evaluarlo con un conjunto propio antes de usarlo en producción.
- El nombre del repo indica 16.384 tokens, pero no se documenta el impacto de la poda en la matriz de embeddings del decoder ni posibles efectos en la estabilidad de la decodificación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-amh-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introducción a trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minería: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
