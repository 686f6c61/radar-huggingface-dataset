# digitalartdynamics/facadelab-vision-assist

## Resumen

FacadeLab Vision Assist es una copia cuantizada a 4 bits del modelo multimodal Qwen/Qwen3.5-4B, publicada por Digital Art Dynamics para el componente de lectura de imágenes de su producto FacadeLab Vision Assist. El repositorio no contiene pesos nuevos ni ajuste fino: es una conversión determinista del modelo base (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) en la que las capas `Linear` del modelo de lenguaje se cuantizan con bitsandbytes NF4 y doble cuantización, mientras que la torre de visión (`model.visual`) y `lm_head` se mantienen en bf16 sin tocar.

El modelo cuenta con 4.539.265.536 parámetros reales según el archivo safetensors y ocupa 3,78 GB en disco, lo que lo sitúa en el rango de los modelos de visión-lenguaje pequeños que pueden ejecutarse en GPUs de consumo. La licencia es Apache 2.0, heredada del modelo original de Alibaba Cloud, y el pipeline declarado es `image-text-to-text`, es decir, entrada de imagen más texto y salida de texto.

Su relevancia es fundamentalmente práctica: ofrece un punto de partida reproducible (build fijado con transformers 5.2.0, bitsandbytes 0.49.2 y torch 2.9.1, con `facadelab_build.json` que registra receta, stack y sha256 de cada archivo) para desplegar un VLM de ~4,5B en hardware modesto. No hay resultados de evaluación, idiomas declarados ni longitud de contexto documentados en la información disponible, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Modelo de visión-lenguaje (tag `qwen3_5`) con torre de visión (`model.visual`), modelo de lenguaje transformer y `lm_head`; cuantizado con bitsandbytes NF4 |
| Parámetros totales | 4.539.265.536 (≈4,54B) según safetensors |
| Longitud de contexto | No disponible |
| Tipos de cuantización | 4-bit NF4 de bitsandbytes con doble cuantización y dtype de cómputo bf16. Torre de visión y `lm_head` en bf16 sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (Copyright 2026 Alibaba Cloud; archivo `LICENSE` sin modificar) |
| Formato de pesos | safetensors (`model.safetensors`, 3.782.105.770 bytes) con `config.json` de transformers |
| Modelo base | Qwen/Qwen3.5-4B |
| Revisión del modelo base | 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Tarea (pipeline) | image-text-to-text |
| Tamaño del repositorio | 3,8 GB |
| Software de construcción | transformers 5.2.0, bitsandbytes 0.49.2, torch 2.9.1, compilado sobre CUDA |
| Idiomas de la librería / idiomas no declarados | Etiquetas de HuggingFace: `transformers`, `safetensors`, `qwen3_5`, `image-text-to-text`, `bitsandbytes`, `nf4`, `4-bit`, `conversational`, `endpoints_compatible`, `region:us` |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo base más allá de lo que se deduce del repositorio: se trata de un modelo de visión-lenguaje con una torre visual accesible como `model.visual`, un modelo de lenguaje con capas `Linear` y una cabeza `lm_head`, acompañado de `processor_config.json`, `tokenizer.json` y `chat_template.jinja`, lo que confirma soporte de conversación multimodal con plantilla de chat. Los detalles sobre tipo de atención, número de capas, dimensionalidad o mecanismos concretos no están disponibles en la información proporcionada.

En cuanto al proceso de construcción, este repositorio no documenta ningún entrenamiento: es una cuantización posterior al entrenamiento (PTQ) de los pesos originales. La receta aplicada es fija y determinista: cuantización NF4 con doble cuantización en las capas `Linear` del modelo de lenguaje, con bf16 como dtype de cómputo, dejando intactos en bf16 tanto la torre de visión como `lm_head`. El archivo `facadelab_build.json` (3.489 bytes) registra el repositorio y la revisión de origen, la receta, el stack de software y el tamaño y sha256 de cada archivo del repositorio, lo que permite auditar y reproducir la conversión.

## Capacidades

- Generación de texto condicionada por imagen: el pipeline declarado es `image-text-to-text`, por lo que acepta una o varias imágenes junto con una instrucción textual y produce texto.
- Descripción y lectura de imágenes: el nombre del repositorio ("picture reader") indica que su uso previsto es interpretar el contenido visual y responder preguntas sobre él.
- Conversación multimodal multi-turno: la presencia de `chat_template.jinja` y la etiqueta `conversational` apuntan a diálogo con historial, aunque el número de turnos soportados depende del contexto, que no está documentado.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que el repositorio puede desplegarse en la infraestructura de Inference Endpoints de HuggingFace.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara ningún idioma.
- Capacidades especiales (modo thinking, audio, vídeo): no disponible en la información proporcionada.

## Casos de uso

- Lectura de imágenes en productos de asistencia visual: el modelo recibe una fotografía y una pregunta en lenguaje natural y devuelve una descripción textual. Es adecuado porque el pipeline `image-text-to-text` está pensado exactamente para esta tarea y el peso de 3,78 GB permite ejecutarlo en una GPU de gama media.
- Atención al cliente con imágenes adjuntas: un usuario envía la foto de un producto defectuoso y el modelo describe el estado aparente y responde en varios turnos. La plantilla de chat incluida facilita mantener el historial de la conversación, aunque la ventana de contexto real no está documentada.
- Pre-etiquetado de datasets de visión: generar descripciones y pares pregunta-respuesta sobre grandes lotes de imágenes antes de la revisión humana. El coste por imagen es bajo al ser un modelo de ~4,5B cuantizado a 4 bits, lo que permite ejecutar el proceso en una sola GPU.
- Inspección de fachadas y activos construidos (contexto FacadeLab): describir elementos visibles, estado aparente y anomalías a partir de fotografías de campo, con derivación a un revisor humano para cualquier decisión. El modelo actúa como primera pasada de triaje, nunca como fuente única de una decisión técnica.
- Extracción de información de documentos fotografiados: transcribir y estructurar datos de tickets, carteles o formularios capturados con el móvil. Es un uso plausible del pipeline declarado, pero no hay benchmarks de OCR publicados que permitan estimar su precisión.
- Prototipado e investigación con VRAM limitada: validar un flujo multimodal completo (procesador, torre de visión, LM, plantilla de chat) en una estación de trabajo con GPU de consumo antes de escalar a un modelo mayor.
- Moderación o revisión previa de contenido visual: primera clasificación y descripción automática de imágenes en colas de trabajo con revisión humana posterior, aprovechando el bajo coste de inferencia del modelo cuantizado.
- Demostraciones locales y entornos sin conectividad: al caber en una GPU de consumo y no requerir pesos adicionales, puede desplegarse en una máquina aislada para pruebas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones, no declara métricas de MMLU, HumanEval, GSM8K, MMMU ni similares, y no ofrece comparaciones con el modelo base en bf16 que permitan medir la degradación introducida por la cuantización NF4.

## Requisitos de hardware

- Peso en disco y en memoria: el archivo `model.safetensors` ocupa 3,78 GB, por lo que el footprint de pesos en VRAM ronda los 4 GB antes de contar caché de atención, activaciones y buffers del framework.
- Estimación de VRAM para inferencia: aproximadamente 4-6 GB con contexto corto y lotes pequeños, en función de la longitud de contexto real (no documentada) y del número de imágenes por petición.
- GPU de consumo compatibles (estimación): RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. En GPUs de 8 GB (RTX 3060 Ti, 4060, 3070) sería viable con contexto reducido y lote 1. En GPUs de 6 GB el margen es muy ajustado.
- GPU de datacenter: A100, H100 o L40S no son necesarias para una sola secuencia; tienen sentido para servir muchas peticiones concurrentes o lotes grandes.
- Requisito de software: al estar los pesos en NF4 de bitsandbytes, la inferencia eficiente requiere `bitsandbytes` con kernels CUDA; no es una carga de precisión completa estándar.
- Opciones de despliegue: `transformers` con `bitsandbytes` es la ruta soportada explícitamente por el repositorio. La etiqueta `endpoints_compatible` apunta a HuggingFace Inference Endpoints. El soporte en vLLM o TGI de pesos NF4 pre-cuantizados no está confirmado. No se incluyen pesos GGUF, por lo que no hay ruta directa con llama.cpp u Ollama.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| digitalartdynamics/facadelab-vision-assist | 4,54B (safetensors) | No disponible | 4-bit NF4 de bitsandbytes, bf16 en visión y `lm_head` | Apache 2.0 | Repositorio HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (modelo base) | No disponible en la información proporcionada | No disponible | bf16 de precisión completa | Apache 2.0 | Repositorio HuggingFace del modelo original |
| Otras alternativas de la misma categoría (VLM de ~3-7B) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables en la documentación facilitada, más allá de la relación directa con el modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- Pérdida por cuantización: al ser una conversión PTQ a 4 bits, la calidad de salida puede degradarse respecto al modelo base en bf16. No hay ninguna evaluación publicada que cuantifique esa pérdida.
- Ahorro parcial de memoria: la torre de visión y `lm_head` se mantienen en bf16, por lo que el ahorro de VRAM no es proporcional al de un modelo completamente cuantizado a 4 bits.
- Riesgo de alucinación: como cualquier modelo de visión-lenguaje, puede describir objetos o detalles que no están en la imagen. Es imprescindible validación humana en usos con consecuencias.
- Idiomas no declarados: el repositorio no especifica idiomas soportados. No se puede asumir un rendimiento correcto en castellano sin evaluarlo.
- Contexto desconocido: la longitud de contexto no está documentada, lo que impide planificar conversaciones largas o entradas con muchas imágenes.
- Sin evaluación ni tracción: 0 descargas y 0 likes, sin benchmarks ni métricas de calidad, lo que obliga a validar el modelo en el dominio propio antes de usarlo en producción.
- Dependencia de bitsandbytes y CUDA: el formato NF4 exige esta librería y kernels GPU para un rendimiento razonable; no se pueden cargar los pesos con transformadores puros estándar.
- Sin ruta CPU/GGUF: al no publicarse pesos GGUF, no hay una vía directa con llama.cpp, Ollama o LM Studio para ejecución en CPU o en GPUs sin CUDA.
- Soporte de proveedores de serving no confirmado: no hay evidencia de que vLLM o TGI carguen estos pesos NF4 empaquetados.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de copyright de Alibaba Cloud y se indique que el modelo fue modificado por Digital Art Dynamics. El archivo `LICENSE` se distribuye sin cambios.
- Reproducibilidad: la build es determinista y está documentada con hashes, pero cualquier re-cuantización posterior con otra versión de bitsandbytes o transformers puede producir resultados distintos.
- Trazabilidad limitada: el autor no publica informes de evaluación, datos de entrenamiento del modelo base ni análisis de sesgos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/digitalartdynamics/facadelab-vision-assist
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Revisión concreta del modelo base utilizada: https://huggingface.co/Qwen/Qwen3.5-4B/tree/851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Librería bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de transformers: https://huggingface.co/docs/transformers
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
