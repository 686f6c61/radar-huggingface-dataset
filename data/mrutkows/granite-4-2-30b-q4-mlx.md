# mrutkows/granite-4.2-30b-q4-mlx

## Resumen

El repositorio `mrutkows/granite-4.2-30b-q4-mlx` contiene una conversión del modelo base `ibm-granite/granite-4.2-30b` al formato MLX, cuantizado a 4 bits (group-size 64). Esta variante está diseñada para ejecutarse de forma nativa en hardware Apple Silicon (M1/M2/M3/M4) mediante la librería `mlx-lm`, que ofrece inferencia y fine-tuning optimizados para la memoria unificada de los Mac. El modelo base pertenece a la familia Granite 4.2 de IBM, una serie de modelos densos decoder-only publicados bajo licencia Apache 2.0, con capacidades multilingües, codificación, retrieval-augmented generation (RAG), tool calling, salida JSON estructurada y un modo de razonamiento integrado (thinking mode).

La relevancia de esta variante radica en que permite ejecutar un modelo de 30 mil millones de parámetros en equipos con 8 GB de memoria unificada, gracias a la cuantización 4-bit, manteniendo un equilibrio entre calidad y eficiencia. Es una opción práctica para desarrolladores que trabajan en entornos Apple y necesitan un modelo de razonamiento local con soporte de herramientas y agentes, sin depender de servicios en la nube. El repositorio incluye instrucciones claras de instalación y uso, así como parámetros de generación recomendados (temperatura 0.7, top-p 0.9) y opciones para activar o desactivar el modo de pensamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense decoder-only transformer |
| Parametros totales | 30 mil millones (30B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit (group-size 64) en este repo; también disponibles variantes q8 y bf16 |
| Idiomas soportados | No disponible (el modelo base declara capacidades multilingües, pero no se especifican los idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2-30B es un transformer denso decoder-only, post-entrenado sobre los modelos base Granite 4.1. Según la documentación de IBM, el proceso de entrenamiento se diseñó específicamente para escenarios empresariales, incorporando evaluaciones de gobernanza, riesgo y cumplimiento (GRC), junto con procedimientos estándar de limpieza de datos y revisión de calidad documental. La familia Granite 4.2 incluye tres tamaños (3B, 8B y 30B) y se caracteriza por un modo de razonamiento integrado (chain-of-thought) que puede activarse o desactivarse mediante parámetros del chat template (`enable_thinking` y `reasoning_effort`).

La conversión a MLX realizada por `mrutkows` no modifica la arquitectura subyacente, sino que adapta los pesos al formato optimizado para Apple Silicon. La cuantización 4-bit con group-size 64 reduce el tamaño del modelo a aproximadamente 16.5 GB en el repositorio, frente a los ~60 GB que ocuparía la versión bf16. No se dispone de información detallada sobre el dataset de entrenamiento específico de esta variante cuantizada, ya que es una conversión del modelo base.

## Capacidades

- Generación de texto y razonamiento multilingüe, con soporte de chain-of-thought integrado (thinking mode) que produce respuestas razonadas antes de la respuesta final.
- Codificación en una amplia gama de lenguajes de programación, orientada a tareas de desarrollo y depuración.
- Retrieval-augmented generation (RAG): capacidad de integrar información externa en las respuestas.
- Tool calling y function calling: el modelo puede invocar herramientas externas, con razonamiento aumentado para decidir cuándo y cómo usarlas.
- Salida JSON estructurada, útil para integraciones con APIs y sistemas automatizados.
- Modo de pensamiento configurable: `enable_thinking` (true/false) y `reasoning_effort` (low/high) permiten ajustar la profundidad del razonamiento.
- Capacidades multilingües declaradas por el modelo base, aunque no se especifican los idiomas concretos.

## Casos de uso

- Asistentes de atención al cliente locales: el modelo puede gestionar conversaciones multi-turno con contexto largo (la longitud exacta no está disponible) y razonar antes de responder, lo que mejora la coherencia en interacciones complejas. Su ejecución local en Apple Silicon evita la latencia de red y los costes de API.
- Generación de código en entornos de desarrollo: con soporte de tool calling, puede integrarse en pipelines de CI/CD para generar tests, documentar funciones o refactorizar código, ejecutándose directamente en la máquina del desarrollador.
- Agentes autónomos con razonamiento: el thinking mode permite al modelo planificar pasos intermedios antes de llamar a herramientas, adecuado para tareas de automatización como gestión de calendarios, envío de correos o consulta de bases de datos.
- Análisis de documentos empresariales: combinado con RAG, puede resumir informes, extraer datos clave o responder preguntas sobre documentación interna, manteniendo los datos en local por motivos de privacidad.
- Prototipado rápido de aplicaciones de IA: al ser un modelo Apache 2.0, se puede usar comercialmente sin restricciones, ideal para startups que necesitan validar ideas sin invertir en infraestructura cloud.
- Educación y formación técnica: su capacidad de razonamiento explicado (thinking mode) lo hace útil para generar explicaciones paso a paso de conceptos de programación o matemáticas, con control sobre el nivel de detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) para esta variante cuantizada, y la model card del modelo base no proporciona datos numéricos en el material consultado.

## Requisitos de hardware

- Hardware: Apple Silicon (M1, M2, M3, M4 o posterior). No compatible con CPUs Intel o GPUs NVIDIA.
- Memoria unificada: la variante q4 está recomendada para equipos con 8 GB de memoria unificada, según la model card. La variante q8 requiere más memoria y la bf16 al menos 16 GB.
- Tamaño del repositorio: 16.5 GB para los pesos en 4-bit.
- Software: Python ≥ 3.9 y la librería `mlx-lm` (instalable con `pip install mlx-lm` o mediante `uvx`).
- Opciones de despliegue: inferencia local con `mlx_lm.generate` o integración en scripts Python con `mlx_lm.load` y `mlx_lm.generate`. No se menciona soporte para vLLM, llama.cpp u Ollama en esta variante específica.
- Latencia y throughput: no disponibles. Dependerán del modelo de chip (M1 vs M4) y de la memoria disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para esta variante. Como referencia estructural, la familia Granite 4.2 incluye los tamaños 3B, 8B y 30B, todos con arquitectura densa decoder-only y licencia Apache 2.0. La variante 30B aquí descrita ofrece mayor capacidad de razonamiento que las versiones 3B y 8B, pero requiere más memoria. No se han encontrado comparaciones con otros modelos de razonamiento locales (por ejemplo, Llama 3.1, Qwen 2.5) en la información proporcionada.

## Limitaciones y advertencias

- La cuantización 4-bit puede degradar ligeramente la calidad de las respuestas en comparación con la versión bf16, especialmente en tareas de razonamiento complejo o generación de código.
- El modelo está limitado a hardware Apple Silicon; no se puede ejecutar en GPUs NVIDIA o AMD sin una conversión adicional a otros formatos (GGUF, etc.).
- No se especifican los idiomas soportados ni la longitud de contexto exacta, lo que puede dificultar la planificación de despliegues en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede heredar sesgos de los datos de entrenamiento del modelo base, que no se detallan en esta documentación.
- El modo de pensamiento (thinking mode) aumenta el número de tokens generados, lo que incrementa la latencia y el consumo de memoria; debe desactivarse para respuestas directas si la velocidad es prioritaria.
- No se han publicado benchmarks independientes que validen el rendimiento de esta variante cuantizada, por lo que se recomienda realizar pruebas propias antes de usarla en entornos críticos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrutkows/granite-4.2-30b-q4-mlx
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-30b
- Colección Granite 4.2 en HuggingFace: https://huggingface.co/collections/ibm-granite/granite-42-language-models
- Documentación oficial de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Repositorio GitHub de los modelos Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Blog de Laurence Moroney sobre Granite 4.2: https://laurencemoroney.com/2026/08/26/ibm-granite-42-local-reasoning.html
- Documentación de mlx-lm: https://github.com/ml-explore/mlx-examples/tree/main/llms
