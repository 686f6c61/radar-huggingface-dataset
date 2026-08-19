# bartowski/darkc0de_Muse-Glimmer-30B-heretic-GGUF

## Resumen

Este repositorio contiene las cuantizaciones GGUF del modelo `darkc0de/Muse-Glimmer-30B-heretic`, una versión modificada del modelo multimodal `Muse-Glimmer-30B` desarrollado por el Meta Superintelligence Lab. El modelo original es un sistema de 30 000 millones de parámetros (27,85 mil millones reales) diseñado para tareas agénticas autónomas: razonamiento multi‑paso, uso de herramientas, generación de código, comprensión de imágenes y recuperación de errores. La variante "heretic", creada por el usuario darkc0de, ha sido sometida a un proceso de *abliteration* que elimina los mecanismos de rechazo y censura del modelo base, dando lugar a un asistente sin restricciones de contenido.

El repositorio de bartowski ofrece 17 cuantizaciones distintas (desde `IQ3_M` hasta `bf16`), todas generadas con `llama.cpp` y calibradas con *imatrix* para optimizar la calidad en baja precisión. Esto permite ejecutar el modelo en hardware de consumo, desde tarjetas con 16 GB de VRAM hasta configuraciones profesionales. El modelo acepta entradas de texto e imagen (mediante un archivo `mmproj` separado) y utiliza un formato de prompt específico con etiquetas `|<start>|`, `|<message>|`, etc.

La relevancia de este lanzamiento radica en combinar tres características poco habituales: multimodalidad, capacidades agénticas y ausencia de censura, todo bajo licencia Apache 2.0. Para desarrolladores que necesitan un asistente local capaz de interpretar capturas de pantalla, razonar sobre ellas y ejecutar acciones mediante herramientas, esta es una opción a considerar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (arquitectura exacta no especificada en la informacion disponible) |
| Parametros totales | 27.854.794.240 (27,85 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q4_0, IQ4_NL, Q3_K_XL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo original) |

## Arquitectura y entrenamiento

El modelo base `Muse-Glimmer-30B` es un transformer multimodal desarrollado por Meta Superintelligence Lab, destilado a partir del modelo más grande `Muse Spark`. Incorpora un codificador de visión (archivo `mmproj`) que permite procesar imágenes junto con texto. La arquitectura interna no se detalla en la información proporcionada, pero por el tamaño y la familia se presume similar a la de otros modelos Llama‑3 de Meta (atención por ventanas, RMSNorm, etc.). No se dispone de datos sobre el número de tokens de entrenamiento ni la composición del dataset.

La versión "heretic" de darkc0de aplica una técnica de *abliteration* (eliminación de direcciones de rechazo) sobre el modelo original, lo que elimina las respuestas de negativa ante solicitudes de contenido sensible. Este proceso no modifica los pesos de forma destructiva, sino que redirige el comportamiento del modelo hacia una generación sin filtros. El repositorio de bartowski añade la cuantización GGUF con `llama.cpp` versión b10362 y calibración *imatrix*, que mejora la distribución de los pesos cuantizados para reducir la pérdida de calidad.

## Capacidades

- **Multimodal**: acepta imágenes y texto como entrada, lo que permite analizar capturas, diagramas, fotografías, etc.
- **Razonamiento multi‑paso**: el modelo está entrenado para descomponer problemas complejos en pasos intermedios, como se indica en la descripción del proyecto Muse Glimmer.
- **Tool calling / function calling**: puede invocar herramientas externas, integrándose en flujos de agentes.
- **Agentes autónomos**: diseñado para ejecutar tareas de forma independiente, con recuperación de errores y planificación.
- **Generación de código**: soporta lenguajes de programación y puede ayudar en tareas de desarrollo.
- **Conversacional**: mantiene diálogos multi‑turno con el formato de prompt especificado.
- **Sin censura**: al ser una versión *abliterated*, no rechaza solicitudes de contenido explícito o sensible (con los riesgos asociados).
- **Reproducible**: las cuantizaciones se generan con un proceso reproducible, como indica la etiqueta.

## Casos de uso

- **Asistente de desarrollo con visión**: un programador puede enviar una captura de pantalla de un error de compilación y pedir al modelo que identifique el problema y proponga una corrección. Gracias al tool calling, el modelo podría ejecutar comandos de diagnóstico en un entorno sandbox.
- **Automatización de tareas de oficina**: el modelo puede analizar documentos escaneados o imágenes de facturas, extraer datos estructurados y generar informes, integrándose con APIs mediante function calling.
- **Agente de atención al cliente sin filtros**: para entornos controlados donde se requiere un asistente que no rechace preguntas sobre temas delicados (por ejemplo, en investigación de psicología o educación sexual). El modelo puede mantener conversaciones largas con contexto.
- **Análisis de imágenes médicas (investigación)**: aunque no está validado para uso clínico, puede ayudar a investigadores a interpretar radiografías o histologías en entornos de estudio, combinando la comprensión visual con razonamiento.
- **Generación de contenido creativo**: escritura de guiones, novelas o diálogos sin restricciones de tema, aprovechando la ausencia de censura para explorar narrativas adultas o controvertidas.
- **Prototipado de agentes locales**: desarrolladores que quieran probar arquitecturas agénticas multimodales en su propio hardware, sin depender de APIs externas, pueden usar este modelo como base para experimentos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otros. Tampoco se encontraron datos comparativos en las búsquedas web. Por tanto, no es posible evaluar cuantitativamente el rendimiento del modelo frente a alternativas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: depende de la cuantización y del contexto. Como referencia, los tamaños de archivo son:
  - `Q4_K_M`: 17,31 GB → requiere al menos 20 GB de VRAM (RTX 3090, RTX 4090, A100 40 GB, etc.) para contexto corto.
  - `Q5_K_M`: 20,11 GB → al menos 24 GB de VRAM.
  - `Q6_K`: 23,41 GB → al menos 28 GB de VRAM.
  - `Q8_0`: 29,61 GB → al menos 36 GB de VRAM.
  - `bf16`: 55,73 GB → requiere GPU profesional (A100 80 GB, H100) o múltiples GPUs.
- **GPU recomendadas**: para uso en consumer, una RTX 4090 (24 GB) puede ejecutar `Q4_K_M` o `Q5_K_M` con contexto moderado. Para `Q6_K` o superiores, se necesitan GPUs de estación de trabajo (A6000, A100).
- **CPU y RAM**: si se usa offloading parcial, se necesita RAM suficiente para el modelo completo (por ejemplo, 32 GB para `Q4_K_M`).
- **Opciones de despliegue**: `llama.cpp` (el formato GGUF es nativo), `Ollama` (compatible con GGUF), `LM Studio`, `vLLM` (con soporte experimental para GGUF), `text-generation-webui`.
- **Latencia y throughput**: no se han publicado cifras. En una RTX 4090 con `Q4_K_M`, se puede esperar una velocidad de generación de 20‑40 tokens por segundo para contexto corto, pero depende de la implementación.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables con otros modelos de la misma categoría. El modelo base `Muse-Glimmer-30B` es una propuesta de Meta relativamente nueva, y la versión "heretic" es una modificación no oficial. Se podría comparar con modelos como `Qwen-2.5-32B` o `Mistral-Small-24B`, pero no se han encontrado benchmarks que permitan una comparación objetiva. La única comparación clara es con el `Muse-Glimmer-30B` original, del que difiere únicamente en la eliminación de rechazos (abliteration) y en las cuantizaciones. En cuanto a licencia, ambos usan Apache 2.0, pero el original no tiene la etiqueta "uncensored".

## Limitaciones y advertencias

- **Contenido sin filtrar**: al ser una versión *abliterated*, el modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. No debe usarse en entornos de producción sin moderación adicional.
- **Alucinaciones**: como todos los modelos generativos, puede inventar información, especialmente en temas especializados. La ausencia de censura no implica mayor precisión.
- **Contexto no especificado**: se desconoce la longitud máxima de contexto soportada. En la práctica, puede variar según la cuantización y la memoria disponible.
- **Idiomas**: no se han declarado los idiomas soportados. El modelo base probablemente funciona bien en inglés, pero el rendimiento en otros idiomas es incierto.
- **Riesgo de sesgos**: el proceso de *abliteration* no elimina los sesgos subyacentes del entrenamiento; puede amplificar estereotipos o generar respuestas discriminatorias.
- **Licencia**: aunque la licencia es Apache 2.0, el uso de contenido generado sin filtro puede tener implicaciones legales en ciertas jurisdicciones.
- **Compatibilidad**: el archivo `mmproj` para la parte multimodal debe descargarse por separado; sin él, el modelo solo funcionará con texto.

## Enlaces

- Repositorio GGUF en HuggingFace: [bartowski/darkc0de_Muse-Glimmer-30B-heretic-GGUF](https://huggingface.co/bartowski/darkc0de_Muse-Glimmer-30B-heretic-GGUF)
- Modelo base original (versión "heretic"): [darkc0de/Muse-Glimmer-30B-heretic](https://huggingface.co/darkc0de/Muse-Glimmer-30B-heretic)
- Proyecto Muse Glimmer en GitHub: [cobusgreyling/Muse-Glimmer](https://github.com/cobusgreyling/Muse-Glimmer)
- Página de descarga en SourceForge: [Muse Glimmer](https://sourceforge.net/projects/muse-glimmer/)
