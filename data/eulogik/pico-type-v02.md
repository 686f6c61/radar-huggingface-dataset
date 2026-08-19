# eulogik/pico-type-v02

## Resumen

pico-type es un clasificador de contenido de nivel de byte, extremadamente ligero, desarrollado por eulogik, una empresa de infraestructura de IA. Con aproximadamente 1,5 millones de parámetros y un tamaño de archivo ONNX de unos 9 MB en FP32, el modelo es capaz de clasificar cualquier contenido directamente desde los bytes crudos, sin necesidad de tokenizador ni preprocesamiento. Esto le permite operar sobre cualquier idioma y formato de archivo, desde texto plano hasta binarios.

El modelo resuelve el problema de la identificación rápida y eficiente del tipo de contenido en sistemas donde el rendimiento y el consumo de recursos son críticos, como aplicaciones de borde, navegadores web mediante WebAssembly o funciones serverless. Su arquitectura multi-cabeza permite obtener en una sola pasada la categoría general, la modalidad, el subtipo, el lenguaje de programación, el idioma del texto, el tipo MIME y banderas de riesgo. La versión v02, publicada en Hugging Face, incorpora entrenamiento con datos reales que mejora sustancialmente la precisión en la detección de lenguajes de código y de texto respecto a la versión inicial.

La relevancia actual de pico-type radica en su combinación de tamaño mínimo, inferencia rápida en CPU (unos 18 ms) y capacidad de despliegue en entornos muy restringidos, lo que lo convierte en una opción práctica para pipelines de preprocesado, herramientas de línea de comandos, asistentes de desarrollo y aplicaciones de análisis de contenido en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ByteEmbed + 3×Conv1D + 2×BiAttention (RoPE) + Pool + 7 cabezas de clasificación Matryoshka |
| Parametros totales | 1,43M (tiny) / 1,45M (small) / 1,48M (base) / 1,56M (pro) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre secuencias de bytes variables; no se especifica límite) |
| Tipos de cuantizacion | FP32 (exportado); no se mencionan cuantizaciones adicionales |
| Idiomas soportados | 30 idiomas para detección de texto (text_lang); 62 lenguajes de programación para code_lang; al operar sobre bytes, soporta cualquier idioma en la entrada |
| Licencia | Apache 2.0 (según la model card; la metadata de Hugging Face indica "no disponible") |
| Formato de pesos | ONNX (single-file FP32, ~9 MB; graph-only ~203-206 KB) |

## Arquitectura y entrenamiento

El modelo procesa los bytes de entrada directamente. Cada valor de byte (0-255) se asigna a un vector aprendido de 96 dimensiones mediante un ByteEmbed sin lookup table. A continuación, tres convoluciones unidimensionales paralelas con kernels de ancho 3, 5 y 7 extraen patrones locales, seguidas de dos capas de atención bidireccional con embeddings rotatorios (RoPE) y 4 cabezas. Tras un pooling que concatena media, máximo y desviación estándar, se obtiene una representación fija que alimenta siete cabezas de clasificación independientes. La arquitectura Matryoshka permite seleccionar la dimensión de la representación (16, 64, 192 o 576) según el nivel de granularidad deseado, compartiendo el mismo tronco.

El entrenamiento de la versión v02 utiliza datos reales: el dataset The Heap para detección de lenguajes de programación (24 lenguajes reales, 1.200 muestras) y Wikipedia para detección de idiomas (30 idiomas, 1.500 muestras). La versión v0.1 se entrenó solo con datos sintéticos y obtenía una precisión de 3% en code_lang y 19% en text_lang; la v2 mejora estos valores en 57 y 79 puntos porcentuales respectivamente. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado de clasificación.

## Capacidades

- Clasificación de contenido en 7 categorías simultáneas en una sola pasada: tipo general (12 clases), modalidad (8 clases), subtipo (24 clases), lenguaje de programación (62 clases), idioma del texto (30 clases), tipo MIME (90 clases) y banderas de riesgo (6 clases).
- Detección de lenguaje de programación con alta precisión en lenguajes como C++ (96%), Dart (98%), Erlang (98%), Rust (98%), R (94%), Swift (92%) y Python (88%).
- Detección de idioma natural con precisión media del 98,3% sobre 30 idiomas.
- Operación directa sobre bytes UTF-8, sin tokenizador ni preprocesamiento, lo que permite procesar cualquier contenido binario o textual.
- Inferencia rápida en CPU: aproximadamente 18 ms por pasada con ONNX Runtime.
- Disponible en cuatro niveles de dimensión (tiny, small, base, pro) que permiten equilibrar precisión y velocidad.
- Interfaz CLI, API de Python, servidor MCP (Model Context Protocol) y espacio Gradio para integración en herramientas como Claude Desktop o Cursor.
- Compatible con despliegue en navegador mediante WebAssembly/ONNX Runtime Web.

## Casos de uso

- Detección automática del lenguaje de programación en repositorios o fragmentos de código: el modelo puede clasificar código fuente en 62 lenguajes con una sola pasada, útil para herramientas de análisis estático, resaltado de sintaxis o migración de proyectos. Su precisión es alta en lenguajes populares como Python, Rust o C++, aunque floja en JavaScript o Scala.
- Clasificación de archivos por tipo MIME en sistemas de almacenamiento o transferencia: al operar sobre bytes, puede identificar el tipo MIME de archivos sin depender de extensiones, útil para validación de subidas, saneamiento de contenido o indexación.
- Moderación de contenido en tiempo real: las cabezas de riesgo y modalidad permiten detectar contenido potencialmente peligroso (secretos, binarios, archivos ejecutables) en flujos de datos, por ejemplo en chat o sistemas de correo.
- Preprocesado en pipelines de ingestión de datos: antes de enviar contenido a un modelo de lenguaje grande o a un sistema de análisis, pico-type puede clasificar rápidamente el tipo de dato (texto, código, JSON, CSV, etc.) y decidir el flujo de procesamiento adecuado.
- Asistentes de desarrollo con integración MCP: el servidor MCP permite que herramientas como Claude Desktop o Cursor consulten la clasificación de contenido directamente desde el portapapeles o archivos, facilitando la detección de lenguajes o la validación de formatos.
- Aplicaciones de borde y móviles: con un tamaño de 9 MB y latencia de 18 ms en CPU, el modelo puede ejecutarse en dispositivos embebidos o navegadores mediante WebAssembly, por ejemplo para clasificar imágenes, documentos o mensajes sin conexión.

## Benchmarks y rendimiento

La model card proporciona resultados de precisión por cabeza, evaluados con datos sintéticos y reales:

| Cabeza | Clases | Precisión | Dataset |
|---|---|---|---|
| coarse | 12 | 100% | Evaluación sintética |
| modality | 8 | 100% | Evaluación sintética |
| subtype | 24 | 93,8% | Evaluación sintética |
| code_lang | 62 | 60,3% | The Heap (24 lenguajes reales, 1.200 muestras) |
| text_lang | 30 | 98,3% | Wikipedia (30 idiomas, 1.500 muestras) |
| file_mime | 90 | 100% | Evaluación sintética |
| risk (mAP) | 6 | 100% | Evaluación sintética |

La precisión en code_lang varía notablemente por lenguaje: excelente (90%+) en cpp, dart, erlang, rust, r, swift, python y lua; buena (70-89%) en go, ruby, ocaml, php, csharp, java, kotlin y c; y deficiente (<50%) en perl, haskell, scala, javascript, clojure, elixir, julia y sql. El autor indica que los lenguajes con menos muestras de entrenamiento tienen menor precisión.

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: aproximadamente 18 ms por pasada con ONNX Runtime en hardware de consumo estándar.
- Tamaño del modelo: ~9 MB en FP32 (single-file ONNX), lo que lo hace apto para dispositivos con poca memoria.
- GPU: no necesaria; el modelo está diseñado para ejecutarse eficientemente en CPU.
- Compatible con despliegue en navegador mediante WebAssembly/ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (Python, C++, JavaScript), servidor MCP, CLI, espacio Gradio.
- No se proporcionan datos de latencia en GPU ni throughput específico.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros clasificadores de contenido de nivel de byte en la información proporcionada. Como referencia cualitativa, frente a soluciones tradicionales como fastText o langdetect, pico-type ofrece la ventaja de no requerir tokenización y de clasificar múltiples dimensiones (tipo, modalidad, MIME, riesgo) en una sola pasada, con un tamaño significativamente menor. Sin embargo, su precisión en detección de lenguajes de programación es inferior a la de herramientas especializadas como GitHub Linguist, que utilizan heurísticas y bases de datos extensas. No se dispone de datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias

- La precisión en detección de lenguaje de programación es baja en varios lenguajes comunes (JavaScript 2%, Scala 4%, SQL 0%, Julia 0%), lo que limita su uso en escenarios que requieran alta fiabilidad en esos lenguajes.
- El modelo no es un clasificador de propósito general; está especializado en clasificación de contenido a nivel de byte y no genera texto ni realiza razonamiento.
- No se especifica la longitud máxima de contexto; el modelo procesa secuencias de bytes variables, pero no hay datos sobre límites prácticos.
- La licencia aparece como Apache 2.0 en la model card, pero la metadata de Hugging Face indica "no disponible"; se recomienda verificar la licencia en el repositorio oficial antes de uso comercial.
- La evaluación de las cabezas coarse, modality, subtype, file_mime y risk se realizó con datos sintéticos, lo que puede no reflejar el rendimiento en datos reales.
- El modelo no incluye mecanismos de explicabilidad; las decisiones de clasificación son opacas.
- Al operar sobre bytes, el modelo puede verse afectado por ruido o codificaciones no estándar en la entrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eulogik/pico-type-v02
- Modelo principal en Hugging Face: https://huggingface.co/eulogik/pico-type
- Repositorio GitHub: https://github.com/eulogik/pico-type
- Sitio web del proyecto: https://eulogik.github.io/pico-type/
- Sitio web de eulogik: https://eulogik.com/
- Espacio Gradio: https://huggingface.co/spaces/eulogik/pico-type
- Dataset The Heap: https://huggingface.co/datasets/AISE-TUDelft/the-heap
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
