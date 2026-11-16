# LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15 es una conversión del checkpoint oficial `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4` realizada por LTM-Lab, que añade una capa de memoria episódica persistente sobre el modelo base sin modificar sus pesos. El modelo conserva la arquitectura `nemotron_h_omni` (multimodal de texto, imagen, vídeo y audio) y el pipeline `image-text-to-text`, con 65.769.840.138 parámetros reales según los safetensors y cuantización NVFP4 de 8 bits (modelopt_mixed) del checkpoint original.

La innovación de esta variante no está en los pesos, que son idénticos byte a byte al modelo base, sino en dos ficheros de código (`configuration_nemotron_h_v15.py` y `modeling_nemotron_h_v15.py`) que implementan la clase `NemotronHV15ForConditionalGeneration` y un almacén de memoria en disco que persiste entre peticiones y reinicios del servidor. El mecanismo escribe eventos de hasta 128 tokens con sus claves/valores de atención y un "engrama" de bajo rango del estado recurrente, y los recupera en peticiones posteriores mediante una votación sobre las claves, sin insertar texto en el prompt. Requiere servirse con una imagen Docker modificada de SGLang (`lovewin10/sglang-v15:nightly-dev-cu13-20260924-ffac53d7-v15`).

Es relevante ahora porque propone una vía de memoria a largo plazo en LLM sin entrenamiento adicional y sin recuperación textual tipo RAG: la memoria se compone directamente en el estado recurrente del modelo. La versión V15 elimina el "world model" de V14 (predictores ajustados al almacén que no aportaban mejora medible) e introduce un ciclo de "sueño" en el que el propio modelo, en reposo, reorganiza, fusiona, corrige y conecta los recuerdos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_omni` (transformer híbrido multimodal con capas recurrentes); clase de esta variante: `NemotronHV15ForConditionalGeneration` |
| Parametros totales | 65.769.840.138 (dato real de safetensors); el nombre comercial indica 120B-A12B |
| Parametros activos | no disponible (el nombre sugiere 12B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 con `modelopt_mixed` (8-bit según tags); el almacén de memoria usa un formato de 4 bits para eventos retirados o fusionados |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (referenciada como `license: other` con `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (librería transformers, `custom_code`, `auto_map`) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de la familia Nemotron 3.5 con capacidades ómnibus (texto, imagen, vídeo y audio) y capas recurrentes cuyo estado es aprovechado por el mecanismo de memoria. La cuantización NVFP4 del checkpoint original se conserva intacta: esta conversión no entrena, no fusiona y no recuantiza nada. Los pesos son idénticos byte a byte al modelo de NVIDIA.

La capa añadida por LTM-Lab funciona en tiempo de inferencia. Durante la lectura de un prompt, las claves y valores de las capas de atención se segmentan en eventos de hasta 128 tokens y se escriben en un almacén en disco junto a un engrama de bajo rango del estado de las capas recurrentes. En una petición posterior, el prompt se lee una vez para determinar qué solicita, se recuperan por votación (una sola votación para todas las capas y cabezas) los eventos cuyas claves captarían su atención, sus engramas se componen en el estado recurrente de la petición y el prompt se relee con las claves y valores recuperados fusionados en la atención. No se recupera texto ni se añade nada al prompt.

La innovación de V15 frente a V14 es el ciclo de "sueño", que se activa tras 10 minutos sin peticiones de usuario y usa el propio modelo servido a través de la API del servidor. Consta de seis fases: replay (relectura de eventos recientes y descarte de preguntas sin respuesta), merging (fusión de eventos con el mismo texto), correction (retirada de eventos antiguos que un evento posterior contradice, con dos confirmaciones), dreams (generación de preguntas que los eventos responderían para proponer puentes), bridges (conexión de notas que nombran la misma persona, cosa o lugar, con umbral `linked_ratio` de 0,35) y downscaling (degradación de puentes no usados en 0,9 por sueño). Nada se entrena, los sueños y respuestas del modelo no se escriben en el almacén y ningún evento se borra: los retirados o fusionados permanecen en disco en formato de 4 bits. Las peticiones con imagen, vídeo o audio se sirven como el modelo plano: no leen ni escriben memoria.

## Capacidades

- Generación de texto conversacional multi-turno con memoria episódica persistente entre conversaciones separadas y entre reinicios del servidor.
- Comprensión de imagen, vídeo y audio (pipeline `image-text-to-text`), servida por el modelo base sin intervención del mecanismo de memoria.
- Recuperación de hechos dichos en conversaciones anteriores sin inserción de texto en el prompt ni pipeline RAG externo.
- Consolidación autónoma de memoria en reposo: fusión de duplicados, corrección de hechos obsoletos y creación de puentes entre notas relacionadas.
- Multilingüismo en inglés, español, francés, alemán, italiano y japonés.
- Compatibilidad con decodificación especulativa EAGLE, CUDA graph y caché de prefijos de SGLang, que permanecen activos.
- Tool calling, function calling y razonamiento multi-paso: no disponible en la información proporcionada para esta variante.

## Casos de uso

- Asistentes conversacionales con memoria de cliente: el almacén persiste entre sesiones y reinicios, de modo que un usuario puede retomar una conversación días después y el modelo recupera hechos previos sin que se le reinyecten en el prompt.
- Atención al cliente multi-canal: las notas de incidencias anteriores de un mismo cliente se recuperan por similitud de claves de atención, y el ciclo de corrección retira automáticamente datos obsoletos (por ejemplo, una dirección actualizada) cuando un evento posterior los contradice.
- Agentes personales de larga duración: el mecanismo de puentes conecta notas sobre la misma persona, lugar o cosa, lo que permite responder preguntas que cruzan conversaciones distintas sin un grafo de conocimiento construido a mano.
- Análisis de reuniones y documentación corporativa: los eventos de hasta 128 tokens con engramas asociados permiten recordar decisiones y contextos de reuniones anteriores al responder consultas nuevas, con la corrección automática cuando una decisión cambia ("la reunión se movió al jueves").
- Investigación sobre memoria en LLM: la variante es un banco de pruebas reproducible para estudiar recuperación por claves/valores frente a RAG textual, con código de memoria separado del modelo y pesos sin modificar.
- Despliegue de un único modelo multimodal con estado: al servirse en una GPU de 96 GB con SGLang, cubre texto, imagen, vídeo y audio, y la memoria solo interviene en peticiones de texto, lo que simplifica la infraestructura frente a pipelines separados de visión y recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona "resultados medidos y limitaciones conocidas" en una sección no incluida en la información proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM: se requiere una GPU de 96 GB según la model card; el repositorio ocupa 75,0 GB en safetensors NVFP4.
- GPU recomendadas: RTX PRO 6000 (96 GB), según los argumentos de servicio del cookbook de SGLang citados para este checkpoint; A100 y H100 no se mencionan en la información disponible.
- GPU de consumo: no cabe en GPU de consumo convencionales (24 GB o menos) por el tamaño del checkpoint y el requisito de 96 GB indicado.
- Despliegue: SGLang mediante la imagen Docker `lovewin10/sglang-v15:nightly-dev-cu13-20260924-ffac53d7-v15`, con runtime NVIDIA y un directorio escribible para el almacén de memoria. vLLM, llama.cpp, Ollama y TGI no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La decodificación especulativa EAGLE, CUDA graph y la caché de prefijos permanecen activos; la opción `recall_while_decoding` está desactivada en este directorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Memoria persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15 | 65.769.840.138 (safetensors) | no disponible | Sí, episódica en disco con ciclo de sueño | openmdw-1.1 | Hugging Face, requiere SGLang modificado |
| LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v14 | no disponible | no disponible | Sí, con world model (predictores ajustados) | openmdw-1.1 | Hugging Face |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 | no disponible | no disponible | No | openmdw-1.1 | Hugging Face |

## Limitaciones y advertencias

- La recuperación es por votación sobre claves de atención: una pregunta que no solicita nada del almacén recupera poco o nada, pero un evento almacenado que solo se parezca a la pregunta puede pasar la votación, con riesgo de recuperación espuria.
- Las peticiones con imagen, vídeo o audio no leen ni escriben memoria; la memoria solo opera sobre texto.
- La opción `recall_while_decoding` está desactivada en este directorio por limitaciones no detalladas en la información proporcionada.
- El ciclo de sueño usa el propio modelo servido a través de la API del servidor: consume recursos de inferencia en reposo y puede interrumpirse por una petición de usuario, reanudándose en el siguiente periodo de inactividad.
- Los eventos retirados o fusionados no se borran del disco (quedan en formato de 4 bits), lo que implica crecimiento del almacén y consideraciones de privacidad y retención de datos.
- El modelo requiere una GPU de 96 GB y una imagen Docker modificada de SGLang; no es desplegable con las herramientas estándar de transformers, vLLM o llama.cpp sin trabajo adicional.
- Licencia openmdw-1.1: deben revisarse sus términos para uso comercial; la model card la referencia como `license: other`.
- No se han publicado benchmarks en la información disponible, por lo que no hay evidencia cuantitativa de calidad frente al modelo base.
- Riesgo de alucinación y sesgos del modelo base: no documentado en la información proporcionada.

## Enlaces

- [Hugging Face: LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15](https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v15)
- [Modelo base: nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4](https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4)
- [Versión anterior: LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v14](https://huggingface.co/LTM-Lab/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-v14)
- [Imagen Docker de SGLang modificada: lovewin10/sglang-v15](https://hub.docker.com/r/lovewin10/sglang-v15)
- [Licencia OpenMDW 1.1](https://openmdw.ai/license/1-1/)
