# bartowski/ZoomGain-9B-GGUF

## Resumen

ZoomGain-9B es un modelo multimodal de tipo image-text-to-text desarrollado por inclusionAI, con aproximadamente 8.950 millones de parámetros. El repositorio que nos ocupa, bartowski/ZoomGain-9B-GGUF, es una cuantización comunitaria del modelo original realizada por bartowski usando llama.cpp (release b12180), pensada para facilitar su despliegue en hardware de consumo mediante el formato GGUF. El modelo procesa entradas de texto e imagen (esta última requiere un archivo mmproj adicional) y genera respuestas conversacionales.

La relevancia de esta publicación radica en que permite ejecutar localmente un modelo multimodal de 9B parámetros con opciones de cuantización que van desde bf16 completo (17,92 GB) hasta IQ3_M (4,85 GB), lo que abre su uso en GPUs consumer y en equipos con RAM limitada. El modelo incluye soporte de tool calling mediante un formato XML específico y un modo de razonamiento interno delimitado por etiquetas `<think>`.

La información disponible sobre el modelo base es limitada: no se han publicado detalles sobre licencia, idiomas soportados, longitud de contexto ni datos de entrenamiento en la información proporcionada. Esta ficha se centra en lo que sí está documentado, principalmente las características de la cuantización y el formato de prompt.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text) |
| Parámetros totales | 8.953.803.264 (~9B) |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL, Q4_K_S, Q4_0, IQ4_XS, IQ3_M, Q3_K_L, Q3_K_M (y variantes inferiores) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con archivo mmproj para visión) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo base inclusionAI/ZoomGain-9B en la información proporcionada. Se sabe que es un modelo multimodal que acepta texto e imagen como entrada, con un total de 8.953.803.264 parámetros según los pesos en safetensors del checkpoint original. El formato de prompt emplea el esquema ChatML (`<|im_start|>` / `<|im_end|>`) con un bloque `<think>` al inicio de la respuesta del asistente, lo que sugiere un modo de razonamiento explícito.

La cuantización de bartowski utiliza llama.cpp release b12180 con calibración imatrix, lo que mejora la calidad de las cuantizaciones de baja precisión. No se especifica si el modelo base empleó RLHF, DPO u otras técnicas de alineación, ni la composición del dataset de entrenamiento. Tampoco se documenta el uso de decodificación especulativa (el autor indica explícitamente "Speculative decoding: no").

## Capacidades

- Generación de texto conversacional multi-turno con formato ChatML.
- Comprensión de imágenes (image-text-to-text) mediante el archivo mmproj, que debe cargarse junto al modelo para habilitar la entrada visual.
- Razonamiento explícito mediante el modo `<think>`, que permite al modelo exponer su cadena de pensamiento antes de la respuesta final.
- Tool calling / function calling con un formato XML estructurado (`<tool_call>`, `<function=...>`, `<parameter=...>`), incluyendo la posibilidad de razonar en lenguaje natural antes de la llamada a función.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de código, matemáticas o agentes multi-paso: no documentadas explícitamente en la información disponible.

## Casos de uso

- Asistente local con comprensión de imágenes: cargando el modelo GGUF junto con el archivo mmproj en llama.cpp u Ollama, se puede desplegar un asistente que responda preguntas sobre capturas de pantalla, fotografías o diagramas sin depender de servicios en la nube.
- Automatización de atención al cliente con soporte visual: un chatbot que reciba imágenes enviadas por el usuario (por ejemplo, fotos de productos defectuosos) y genere respuestas contextualizadas, ejecutándose en infraestructura propia.
- Integración en pipelines de agentes con tool calling: el formato XML documentado permite conectar el modelo a funciones externas (consultas a APIs, bases de datos) en flujos de razonamiento multi-paso, con el bloque `<think>` como traza de razonamiento.
- Procesamiento de documentos escaneados en local: al aceptar entrada de imagen, puede emplearse para extraer y razonar sobre información de facturas, formularios o tickets en entornos con requisitos de privacidad que impidan usar APIs externas.
- Prototipado rápido en estaciones de trabajo con GPU consumer: la cuantización Q4_K_M (5,84 GB) permite ejecutar el modelo en GPUs de 8 GB de VRAM, facilitando pruebas de concepto de aplicaciones multimodales.
- Despliegue en entornos con RAM limitada: las cuantizaciones IQ3_M (4,85 GB) y Q3_K_M permiten ejecutar el modelo en CPU con RAM moderada, útil para demos o entornos de desarrollo sin GPU dedicada.
- Investigación sobre razonamiento multimodal: el modo `<think>` facilita el estudio de cadenas de razonamiento en tareas que combinan texto e imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contar KV cache ni el proyector visual):
  - bf16: ~17,92 GB.
  - Q8_0: ~9,55 GB.
  - Q6_K: ~7,79 GB.
  - Q5_K_M: ~6,88 GB.
  - Q4_K_M: ~5,84 GB.
  - IQ4_XS: ~5,23 GB.
  - IQ3_M: ~4,85 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño de pesos, una RTX 4090 (24 GB) puede alojar bf16; GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) admiten cómodamente Q5-Q8; GPUs de 8 GB (RTX 3070, RTX 4060 Ti) admiten Q4_K_M con margen limitado para el contexto.
- Cabe en GPU consumer: sí, con cuantizaciones Q4 y Q5 en GPUs de 8-12 GB; las cuantizaciones Q3 e IQ3 permiten ejecución en CPU con RAM moderada.
- Opciones de despliegue: llama.cpp (versión b12180 o superior, usada para la cuantización), Ollama y otros frontends compatibles con GGUF. Para el modo multimodal es necesario cargar también el archivo mmproj. No se documenta compatibilidad con vLLM o TGI para estos pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base (contexto, licencia, idiomas) que permitan una comparación rigurosa con alternativas. La siguiente tabla recoge únicamente los datos verificables del propio modelo:

| Modelo | Parámetros | Contexto | Licencia | Formato | Multimodal |
|---|---|---|---|---|---|
| ZoomGain-9B (esta ficha) | ~9B | no disponible | no disponible | GGUF (cuantizado) | Sí (texto + imagen) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia del modelo no está disponible en la información proporcionada; antes de cualquier uso comercial debe verificarse la licencia del modelo base inclusionAI/ZoomGain-9B.
- No se documentan los idiomas soportados; el rendimiento en castellano es desconocido y debe evaluarse empíricamente.
- No se dispone de la longitud de contexto máxima, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos de evaluación que cuantifiquen este riesgo.
- El modo multimodal requiere cargar el archivo mmproj junto con el GGUF; un despliegue que solo cargue el modelo de lenguaje perderá la capacidad de visión.
- Las cuantizaciones de baja precisión (Q3, IQ3) degradan la calidad de forma notable; para producción se recomienda Q4_K_M o superior.
- El formato de tool calling es específico (XML con etiquetas `<tool_call>` y `<function=...>`); las herramientas que esperen JSON nativo requerirán adaptación.
- El autor indica que no se emplea decodificación especulativa, por lo que no se obtienen las ganancias de latencia asociadas a esa técnica.
- No hay resultados de benchmarks publicados en la información disponible, por lo que las afirmaciones sobre calidad deben tratarse con cautela.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/ZoomGain-9B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/ZoomGain-9B
- llama.cpp (release usada para la cuantización): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
