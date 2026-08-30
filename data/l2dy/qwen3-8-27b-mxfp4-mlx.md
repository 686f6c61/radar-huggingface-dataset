# l2dy/Qwen3.8-27B-MXFP4-mlx

## Resumen

Qwen3.8-27B-MXFP4-mlx es una cuantización en formato MLX (Apple Silicon) del modelo Qwen3.8-27B de Alibaba, un modelo denso de 27 000 millones de parámetros de la familia Qwen3.5, especializado en visión-lenguaje, generación de código, flujos de trabajo agénticos y automatización de oficina. Esta versión concreta, publicada por el usuario l2dy, es una traducción al formato MLX de la receta de cuantización mixta MXFP4/MXFP8 desarrollada por Unsloth, aplicada sobre los pesos originales en BF16 sin calibración adicional. El resultado es un checkpoint de 23,3 GB que cabe en equipos Apple Silicon con memoria unificada suficiente y que conserva la arquitectura completa del modelo base, incluida la torre de visión y una capa MTP para decodificación especulativa nativa.

La relevancia de este modelo radica en que permite ejecutar un modelo multimodal de 27B en hardware local de Apple, aprovechando la aceleración MLX y la cuantización mixta de bajo bit (4 y 8 bits) sin necesidad de GPU NVIDIA. Su ventana de contexto nativa de 262 000 tokens y el soporte para razonamiento configurable lo hacen adecuado para tareas de análisis de documentos largos, agentes autónomos y generación de código en entornos de desarrollo. No obstante, al ser una conversión sin calibración, no se garantiza la paridad numérica con el modelo original y no se han publicado evaluaciones de rendimiento para esta versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-family, densa, 64 capas (48 linear-attention, 16 full-attention), torre de visión BF16, capa MTP preservada |
| Parametros totales | 27B (declarados por el modelo base); safetensors reporta 7.510.897.392 (posible discrepancia) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativa del modelo base) |
| Tipos de cuantizacion | MXFP4 (4 bits, grupo 32) y MXFP8 (8 bits, grupo 32) en tensores específicos; BF16 para embeddings, normas, MTP y torre de visión |
| Idiomas soportados | No disponible (no se especifica en la informacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX weight-only quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas de la familia Qwen3.5, con una mezcla de 48 capas de atención lineal y 16 capas de atención completa, lo que reduce el coste computacional en secuencias largas. Incluye una torre de visión en BF16 para entrada de imágenes y una capa MTP (Multi-Token Prediction) que permite decodificación especulativa. El entrenamiento original del modelo base no se detalla en la información proporcionada, pero se sabe que está orientado a tareas de codificación, agentes y automatización de oficina, con razonamiento configurable (modo pensamiento activable o desactivable).

La cuantización aplicada en este repositorio es una traducción al formato MLX de la receta Unsloth NVFP4, pero usando MXFP4 y MXFP8 con grupos de 32. Es una conversión data-free y weight-only: no se usó imatrix, dataset de calibración, pre-escalado AWQ ni calibración de caché KV. Los tensores de las capas FFN densas (capas 0-55) se almacenan en MXFP4, mientras que las últimas 8 capas FFN, las proyecciones de atención completa y lineal, y el `lm_head` se almacenan en MXFP8. Los embeddings, normas, tensores de estado GDN, convoluciones y la capa MTP completa se mantienen en BF16. Esta selección de clases de tensores es fija y no se ha calibrado, por lo que no se garantiza paridad de rendimiento con la versión original.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta imágenes y texto, y produce respuestas textuales (pipeline image-text-to-text).
- Codificación: el modelo base está optimizado para tareas de programación, generación y depuración de código.
- Agentes y flujos de trabajo agénticos: soporta razonamiento multi-paso y tareas de larga duración gracias a su ventana de contexto de 262K tokens.
- Razonamiento configurable: permite activar o desactivar el modo de razonamiento paso a paso según la tarea.
- Decodificación especulativa nativa: la capa MTP preservada se detecta automáticamente en mlx-node y se activa por defecto, acelerando la generación.
- Capacidades multilingües: no se especifican idiomas concretos, pero el modelo base de Qwen suele soportar múltiples lenguas; no hay confirmación en la información disponible.
- Soporte de tool calling / function calling: no se menciona explícitamente en la información, aunque los modelos Qwen3 suelen incluirlo; no confirmado para esta versión.

## Casos de uso

- Asistente de programación local: el modelo puede generar, revisar y explicar código en múltiples lenguajes. Su capacidad para ejecutarse en Apple Silicon con MLX permite integrarlo en IDEs o herramientas CLI sin depender de la nube.
- Automatización de oficina: procesamiento de documentos largos (informes, contratos, actas) con extracción de información y resumen, gracias a los 262K tokens de contexto que permiten manejar documentos extensos completos.
- Agente autónomo de investigación: con razonamiento configurable y soporte para tareas multi-paso, puede planificar y ejecutar búsquedas de información, leer documentos y sintetizar resultados en un solo flujo.
- Análisis de imágenes y capturas: al ser multimodal, puede interpretar diagramas, capturas de pantalla o gráficos y generar descripciones o código a partir de ellos.
- Prototipado rápido de aplicaciones de chat: al ser Apache-2.0 y ejecutable localmente, permite desarrollar asistentes conversacionales sin costes de API y con control total de los datos.
- Decodificación especulativa para baja latencia: la capa MTP nativa acelera la generación en equipos Apple, útil para aplicaciones interactivas en tiempo real como chat o autocompletado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las pruebas realizadas fueron solo de humo (carga del checkpoint y generación de unos pocos tokens) y no validan calidad del modelo, comportamiento en contexto largo, calidad de visión ni rendimiento en tareas estándar. Por tanto, no se pueden aportar cifras comparativas fiables.

## Requisitos de hardware

- Tamaño del checkpoint: 23,3 GB en disco (safetensors).
- Memoria unificada estimada: al menos 24 GB de RAM unificada en Apple Silicon para cargar el modelo en memoria (el peso cuantizado ocupa ~23 GB, más overhead de activaciones y caché KV). Se recomienda 32 GB o más para trabajar con contexto largo.
- GPU compatibles: exclusivo para Apple Silicon (M1, M2, M3, M4 y superiores) con soporte de MLX. No es compatible con GPU NVIDIA o AMD.
- Opciones de despliegue: mediante la librería `@mlx-node/lm` y `@mlx-node/core` versión 0.0.10 o superior, con API en TypeScript/JavaScript. También puede ejecutarse con otras herramientas que soporten MLX (por ejemplo, LM Studio en Apple Silicon, aunque no se confirma en la información).
- Latencia y throughput: no se proporcionan datos. La decodificación especulativa MTP puede mejorar la velocidad de generación, pero no hay cifras concretas.

## Comparativa con modelos similares

La comparativa se realiza a nivel de formato y cuantización, ya que no hay datos de rendimiento para esta versión. Se compara con el modelo base y con otras cuantizaciones MLX del mismo modelo.

| Modelo | Formato | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen/Qwen3.8-27B (original) | BF16 | 27B | 262K | Apache-2.0 | Modelo base, requiere ~54 GB en BF16 |
| l2dy/Qwen3.8-27B-MXFP4-mlx (este) | MLX MXFP4/MXFP8 | 27B | 262K | Apache-2.0 | Cuantización mixta, ~23 GB, para Apple Silicon |
| deresolution/Qwen3.8-27B-DFlash2-mxfp4 | MLX MXFP4 | 27B | 262K | Apache-2.0 | Otra cuantización MXFP4, sin MTP mencionado |

No se dispone de datos de rendimiento para comparar numéricamente. La elección entre estas variantes dependerá de la disponibilidad de memoria y de la necesidad de decodificación especulativa.

## Limitaciones y advertencias

- Cuantización sin calibración: la conversión es data-free y no utiliza imatrix, AWQ ni calibración de caché KV, por lo que puede haber pérdida de precisión respecto al modelo BF16 original, especialmente en tareas de razonamiento complejo o matemáticas.
- Rendimiento no validado: no se han publicado benchmarks de calidad, ni pruebas de visión, ni de comportamiento en contexto largo para esta versión cuantizada. Las pruebas realizadas son solo de carga y generación básica.
- Requisito de hardware específico: solo funciona en Apple Silicon con MLX, no es portable a otras arquitecturas sin reconversión.
- Dependencia de versiones de librería: requiere `@mlx-node/lm` y `@mlx-node/core` 0.0.10 o superior; versiones anteriores pueden no cargar el checkpoint.
- Posible discrepancia en el número de parámetros: el archivo safetensors reporta 7.510.897.392 parámetros, mientras que el modelo base declara 27B. Esta discrepancia no está explicada y podría deberse a un error en la conversión o en el etiquetado; se recomienda verificar antes de usar en producción.
- Sin garantía de soporte de tool calling: aunque es probable que el modelo base lo soporte, no se confirma en la información de este repositorio.
- Riesgo de alucinación y sesgos: al ser un modelo de lenguaje, puede generar contenido incorrecto o sesgado; no se han realizado evaluaciones específicas para esta versión.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/l2dy/Qwen3.8-27B-MXFP4-mlx
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Colección Unsloth NVFP4 Tensor-Class Recipe for MLX: https://huggingface.co/collections/Brooooooklyn/unsloth-nvfp4-tensor-class-recipe-for-mlx-macos-dgx-6a5e3a893ae031d023e72ccf
- Blog de AMD sobre ejecución de Qwen3.8-27B en hardware AMD: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de LM Studio para Qwen3.8: https://lmstudio.ai/models/qwen3.8
