# snkii/Sori-1B-MCQ

## Resumen

Sori-1B-MCQ es un modelo multimodal de audio y texto publicado en HuggingFace por el usuario snkii. Está orientado a tareas de elección múltiple sobre contenido de audio con salida de probabilidades calibradas: su pipeline declarado es `audio-text-to-text` y sus etiquetas incluyen `audio-question-answering`, `decision-model`, `calibrated-probabilities` y `feature-extraction`. Cuenta con 1.033.301.889 parámetros (aproximadamente 1,03 mil millones) en pesos safetensors, y el repositorio ocupa 13,8 GB.

Según los metadatos del repositorio, el modelo se construye mediante fusión (merge) de dos modelos base: `LiquidAI/LFM2.5-Embedding-350M` y `nvidia/audio-flamingo-next-hf`. Esto apunta a una arquitectura compuesta por un codificador de audio acoplado a un backbone de lenguaje de la familia LFM2.5, aunque la información disponible no detalla la composición interna ni la estrategia exacta de fusión.

El acceso está restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo, y la licencia es `sori-academic-license` (etiquetada como `license:other`). Su interés práctico es acotado pero específico: los modelos de decisión que devuelven distribuciones de probabilidad calibradas sobre entradas de audio son poco frecuentes, y resultan útiles para enrutado, evaluación automática y clasificación con umbrales de confianza.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fusión (merge) de `LiquidAI/LFM2.5-Embedding-350M` y `nvidia/audio-flamingo-next-hf`; detalles internos no disponibles |
| Parámetros totales | 1.033.301.889 (≈1,03 B), según safetensors |
| Parámetros activos | No aplica (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible; el repositorio solo declara pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `sori-academic-license` (etiqueta `license:other`); texto completo no disponible |
| Formato de pesos | safetensors |
| Pipeline | audio-text-to-text |
| Modalidades de entrada | Audio y texto |
| Código personalizado | Sí (`custom_code`), requiere `trust_remote_code=True` en transformers |
| Acceso | Restringido (gated) |
| Tamaño del repositorio | 13,8 GB |
| Descargas / likes | 0 descargas, 2 likes |
| Fecha de creación / actualización | 18/09/2026 / 19/09/2026 |

## Arquitectura y entrenamiento

La información disponible no incluye una descripción técnica de la arquitectura, del proceso de entrenamiento ni del volumen o composición del dataset. Los únicos datos estructurales son los modelos base declarados: `LiquidAI/LFM2.5-Embedding-350M`, un modelo de embeddings de la familia LFM2.5 de Liquid AI (el nombre sugiere 350 millones de parámetros), y `nvidia/audio-flamingo-next-hf`, un modelo de audio de NVIDIA. La etiqueta `merge` indica que Sori-1B-MCQ se ha construido combinando ambos, probablemente acoplando la torre de audio al backbone de lenguaje, pero no se especifica la técnica de fusión, el congelamiento de capas ni si hubo entrenamiento posterior.

Tampoco se documentan fases de ajuste como SFT, RLHF o DPO, ni innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.). Las etiquetas sí delimitan el propósito del modelo: `sori_mcq`, `multiple-choice`, `decision-model` y `calibrated-probabilities` sugieren que la cabeza de salida está diseñada para puntuar opciones discretas y devolver probabilidades calibradas, en lugar de generar texto libre. Dado que el repositorio incluye `custom_code`, la implementación efectiva del modelo (clase de configuración, cabezas y preprocesado de audio) reside en el propio repositorio y debe revisarse antes de usarlo.

## Capacidades

- Comprensión de audio: el modelo acepta entradas de audio y las procesa junto con texto, según el pipeline `audio-text-to-text` y las etiquetas `audio-understanding` y `audio-language-model`.
- Respuesta a preguntas sobre audio (audio question answering): formular preguntas sobre un clip y obtener una respuesta.
- Elección múltiple sobre audio (`sori_mcq`, `multiple-choice`): puntuar un conjunto de opciones predefinidas a partir de una entrada acústica.
- Decisión con probabilidades calibradas (`calibrated-probabilities`, `decision-model`): la salida esperada es una distribución de probabilidad sobre opciones, apta para umbrales de confianza y enrutado.
- Extracción de características (`feature-extraction`): uso del modelo como extractor de representaciones, aprovechando su componente de embeddings.
- Generación de texto condicionada por audio, dado el pipeline declarado.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma `en`.
- Tool calling, function calling, razonamiento multi-paso y modo de pensamiento explícito: no disponibles en la información proporcionada.
- Visión, vídeo o audio generativo: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación automática de respuestas en benchmarks de audio: el modelo puede recibir un clip y varias opciones de respuesta y devolver una distribución de probabilidad, lo que permite calcular exactitud y calibrar umbrales sin intervención humana.
- Enrutado de decisiones en asistentes de voz: dada una consulta hablada y un conjunto cerrado de intenciones, el modelo puntúa cada intención y el sistema deriva la conversación al flujo correspondiente aprovechando las probabilidades calibradas.
- Clasificación de contenido sonoro con nivel de confianza: catalogar clips (tipo de evento, idioma, tono) y descartar automáticamente los casos con baja confianza para revisión manual.
- Búsqueda semántica audio-texto: emplear el modelo como extractor de características para indexar audio y recuperar clips a partir de consultas de texto, gracias a su componente de embeddings.
- Investigación académica en modelos de decisión multimodal: servir de referencia reproducible para estudiar calibración y comportamiento de modelos de audio de ~1 B de parámetros en tareas de elección múltiple.
- Moderación asistida de audio en pipelines de contenido: clasificar fragmentos con opciones predefinidas y priorizar la revisión humana según la probabilidad asignada a las categorías sensibles.
- Preprocesado en pipelines de accesibilidad: generar respuestas y etiquetas sobre audio para alimentar sistemas de subtitulado o descripción, siempre que el contenido esté en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Peso de los parámetros (1.033.301.889), calculado a partir del recuento real: aproximadamente 4,13 GB en FP32, 2,07 GB en FP16/BF16, 1,03 GB en INT8 y 0,52 GB en INT4. A estas cifras hay que sumar el codificador de audio, el búfer de audio y el overhead del runtime.
- El repositorio ocupa 13,8 GB, muy por encima del peso teórico del modelo; conviene verificar si contiene varias copias de pesos, estados de optimizador o activos adicionales antes de planificar el almacenamiento.
- GPU consumer: el modelo debería caber en GPUs de 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060, RTX 4070) en FP16, y con margen amplio en 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) o 24 GB (RTX 3090, RTX 4090). Estas estimaciones son teóricas: no se han publicado requisitos oficiales.
- GPU de datacenter: A100 (40/80 GB), H100 y L40S son suficientes con holgura para una sola instancia; no se documenta soporte multi-GPU.
- CPU: la inferencia en CPU es viable en términos de memoria (≈4 GB en FP32), pero no hay datos publicados de latencia.
- Despliegue: el repositorio declara la librería transformers y requiere cargar código personalizado (`trust_remote_code=True`), por lo que ese es el único camino confirmado. No se confirma compatibilidad con vLLM, TGI, llama.cpp, Ollama ni LM Studio, y al no existir variantes GGUF no es posible el despliegue directo en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El rendimiento dependerá en gran medida de la duración del audio de entrada y del coste del codificador acústico.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparativa de rendimiento. La siguiente tabla recoge únicamente lo que consta en la información del repositorio y en los nombres de sus modelos base; el resto de campos figuran como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Acceso | Uso principal |
|---|---|---|---|---|---|
| snkii/Sori-1B-MCQ | 1,03 B | No disponible | `sori-academic-license` (académica) | Restringido (gated) | Elección múltiple y decisión sobre audio |
| LiquidAI/LFM2.5-Embedding-350M | ≈350 M (según nombre) | No disponible | No disponible | No disponible | Embeddings de texto |
| nvidia/audio-flamingo-next-hf | No disponible | No disponible | No disponible | No disponible | Comprensión de audio |
| Alternativas de audio-LLM de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia `sori-academic-license`: el uso comercial parece restringido por el propio nombre de la licencia. Es imprescindible leer el texto completo (no incluido en la información disponible) antes de cualquier despliegue en producción.
- Acceso restringido: la descarga requiere aceptar condiciones en HuggingFace, lo que puede impedir su uso en entornos automatizados o en organizaciones que no acepten dichos términos.
- Idiomas: solo se declara inglés (`en`). El rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Código personalizado: la etiqueta `custom_code` implica ejecutar código del repositorio al cargar el modelo, lo que supone un riesgo de seguridad y complica la auditoría y el despliegue en infraestructuras gestionadas.
- Riesgo de alucinación: no hay información sobre evaluación de fidelidad. En modelos de elección múltiple el fallo típico no es inventar texto, sino asignar probabilidades altas a opciones incorrectas, por lo que la calibración debe validarse en el dominio propio.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos, acústicos o de acento. La representación de voces no nativas o de audio con ruido es una incógnita.
- Longitud de contexto: desconocida. No es posible garantizar el procesamiento de audios largos ni de conversaciones multi-turno extensas.
- Madurez del proyecto: 0 descargas y 2 likes en el momento de la consulta, con fechas de creación y actualización de septiembre de 2026. Se trata de una publicación reciente y sin validación comunitaria.
- Cuantización: al no existir variantes GGUF, AWQ o GPTQ, no hay una ruta sencilla para reducir memoria o acelerar la inferencia.
- Trazabilidad: no se publican detalles del dataset de entrenamiento ni de la técnica de fusión, lo que dificulta reproducir resultados o auditar el modelo.
- Los resultados de la búsqueda web realizada no contienen información relacionada con este modelo: todas las referencias encontradas tratan sobre YouTube y son irrelevantes para esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snkii/Sori-1B-MCQ
- Modelo base declarado: https://huggingface.co/LiquidAI/LFM2.5-Embedding-350M
- Modelo base declarado: https://huggingface.co/nvidia/audio-flamingo-next-hf
- Paper, blog, repositorio o demo del modelo: no disponible
- Resultados de búsqueda web relevantes: no disponible (las referencias recuperadas no guardan relación con el modelo)
