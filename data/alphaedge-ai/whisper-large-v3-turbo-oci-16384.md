# alphaedge-ai/whisper-large-v3-turbo-oci-16384

## Resumen
`whisper-large-v3-turbo-oci-16384` es una variante recortada (trimmed) del modelo de reconocimiento automatico del habla `openai/whisper-large-v3-turbo`, publicada por el usuario `alphaedge-ai`. El modelo mantiene la arquitectura encoder-decoder transformer de Whisper, pero reduce el vocabulario del tokenizer de 51.865 a 16.384 tokens para optimizar el rendimiento en occitano (codigo de idioma `oc`). El resultado es un modelo de 763.461.120 parametros (frente a los 808.878.080 del original, una reduccion del 5,61%) y un repositorio de 1,5 GB en formato safetensors.

La tecnica de trimming consiste en identificar los tokens del vocabulario que realmente se utilizan en un idioma o conjunto de idiomas objetivo y eliminar el resto, conservando los pesos del modelo base. Para el minado de tokens se emplearon 70.426 textos del dataset `lbourdois/fineweb-2-trimming`. El modelo resultante deberia comportarse de forma similar al original en occitano, con una huella de memoria notablemente menor, pero degradara su rendimiento en otros idiomas porque los tokens especificos de esos idiomas ya no estan en el vocabulario.

Es relevante para desarrolladores que necesiten ASR en occitano con un modelo ligero y desplegable en entornos con recursos limitados o en la region EU (la etiqueta `region:eu` sugiere un enfoque de cumplimiento europeo), aunque su adopcion actual es muy baja (33 descargas, 0 likes). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), recortado por trimming de vocabulario |
| Parametros totales | 763.461.120 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper procesa ventanas de audio de 30 s; el nombre "16384" se refiere al tamano de vocabulario, no al contexto) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en precision original; no se listan variantes GGUF/INT8) |
| Idiomas soportados | Occitano (`oc`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,5 GB |
| Vocabulario | 16.384 tokens (reduccion del 68,41% respecto al original) |
| Modelo base | openai/whisper-large-v3-turbo |
| Dataset de minado | lbourdois/fineweb-2-trimming (70.426 textos) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Whisper large-v3-turbo: un transformer encoder-decoder con atencion estandar, entrenado originalmente por OpenAI mediante supervision debil a gran escala sobre pares audio-transcripcion. Whisper convierte el audio en espectrogramas Mel de 80 canales y los procesa en ventanas de 30 segundos. La variante "turbo" del modelo base reduce el numero de capas del decoder respecto a large-v3, lo que disminuye la latencia de inferencia a costa de una ligera perdida de precision.

Este checkpoint concreto no ha sido reentrenado: es el resultado de aplicar trimming sobre el vocabulario. El proceso consiste en minar los tokens efectivamente usados en occitano a partir de 70.426 textos, conservar solo esos tokens (hasta un maximo de 16.384) y recortar las matrices de embedding y de la capa de salida en consecuencia. No se documentan fases de RLHF, DPO ni fine-tuning adicional sobre audio. La innovacion tecnica es, por tanto, la compresion del vocabulario, no cambios arquitectonicos.

## Capacidades
- Reconocimiento automatico del habla (transcripcion) en occitano, incluyendo el pipeline `automatic-speech-recognition` de transformers.
- Transcripcion de audio con ventanas de hasta 30 segundos por segmento, con capacidad de procesar audio mas largo mediante chunking del pipeline.
- Tarea de traduccion de audio a texto (el tokenizer conserva los tokens de tarea `transcribe` y `translate` del original, aunque no se garantiza su calidad fuera del occitano).
- Deteccion de idioma limitada: el vocabulario recortado elimina tokens de idiomas no occitanos, por lo que la deteccion automatica de idioma puede fallar o sesgarse hacia `oc`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (es un modelo puramente ASR).
- No soporta vision ni audio generativo; solo entrada de audio y salida de texto.
- Compatible con endpoints (etiqueta `endpoints_compatible`) y con la libreria transformers.

## Casos de uso
- Transcripcion de archivos de audio en occitano para archivos sonoros, radios locales o patrimonio oral: el modelo convierte grabaciones en texto con un footprint de 1,5 GB, adecuado para servidores modestos.
- Subtitulado automatico de contenido audiovisual en occitano: se puede integrar en pipelines que segmentan el audio en ventanas de 30 s y generan subtitulos con marcas temporales.
- Digitalizacion de entrevistas o testimonios en occitano para investigacion linguistica: el vocabulario reducido elimina ruido de tokens de otros idiomas y simplifica el post-procesado.
- Asistentes de voz para aplicaciones regionales: al ser un modelo pequeno (763 M parametros), puede desplegarse en una sola GPU consumer para inferencia en tiempo casi real en streaming por segmentos.
- Generacion de transcripciones para motores de busqueda o indexacion de audio en occitano: el modelo permite convertir horas de audio en texto indexable con un coste de computo bajo.
- Prototipado de sistemas de accesibilidad (subtitulos en directo) en entornos con recursos limitados, aprovechando la licencia Apache 2.0 para uso comercial y la compatibilidad con transformers.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta estadisticas de tamano (reduccion de vocabulario del 68,41% y de parametros del 5,61%) y afirma que el modelo "deberia rendir de forma similar al original" en occitano, sin cifras de WER, MMLU ni otras metricas.

## Requisitos de hardware
- VRAM estimada para inferencia en FP32: aproximadamente 3,1 GB solo para pesos (763 M parametros x 4 bytes), mas activaciones y buffers de audio; en la practica, unos 4-6 GB.
- En FP16/BF16: unos 1,6 GB de pesos; cabe holgadamente en GPUs consumer de 8 GB o mas.
- En cuantizacion INT8 (si se genera): alrededor de 0,8 GB de pesos, aunque el repositorio no incluye variantes cuantizadas.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para inferencia comoda; A100/H100 no son necesarias pero acelerarian el throughput en lotes grandes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas; tambien puede ejecutarse en CPU con latencia mayor.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (Whisper no es un modelo de texto autoregresivo estandar y su soporte en esos motores es limitado).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-oci-16384 | 763 M | 16.384 | Occitano | Apache 2.0 | Ventanas de 30 s |
| openai/whisper-large-v3-turbo | 809 M | 51.865 | Multilingue (99 idiomas) | Apache 2.0 | Ventanas de 30 s |
| openai/whisper-large-v3 | 1.550 M | 51.865 | Multilingue (99 idiomas) | Apache 2.0 | Ventanas de 30 s |
| openai/whisper-small | 244 M | 51.865 | Multilingue | Apache 2.0 | Ventanas de 30 s |

El modelo recortado ofrece un 5,61% menos de parametros y un 68,41% menos de vocabulario que su base, a cambio de perder cobertura multilingue. Frente a whisper-small, es mas grande pero conserva la calidad del large-v3-turbo en occitano. No se dispone de datos de WER comparativos para cuantificar la diferencia real de rendimiento.

## Limitaciones y advertencias
- El vocabulario recortado elimina tokens de otros idiomas; el modelo no es fiable fuera del occitano y la deteccion automatica de idioma puede fallar.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no occitana, comportamiento heredado de Whisper.
- No se han publicado evaluaciones de WER ni benchmarks; la afirmacion de rendimiento "similar al original" no esta cuantificada.
- El nombre "16384" se refiere al tamano de vocabulario, no a la longitud de contexto; no debe interpretarse como una ventana de 16.384 tokens.
- No se incluyen variantes cuantizadas (GGUF, INT8) en el repositorio, lo que limita el despliegue en entornos de muy bajos recursos sin conversion manual.
- Sesgos: al estar especializado en occitano, puede infrarepresentar variantes dialectales o registros no presentes en el dataset de minado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo tiene muy baja adopcion (33 descargas) y no ha sido validado por la comunidad.
- La fecha de creacion (2026-06-01) y actualizacion (2026-11-18) indican un modelo reciente y poco probado en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-oci-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
