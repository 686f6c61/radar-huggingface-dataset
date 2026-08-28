# salohcin714/granite-4.2-30b-mxfp8-mlx

## Resumen

El modelo `salohcin714/granite-4.2-30b-mxfp8-mlx` es una conversión no oficial del modelo `ibm-granite/granite-4.2-30b` de IBM al formato MLX, optimizado para ejecutarse en Apple Silicon. La conversión aplica cuantización MXFP8 (microscaling floating-point, 8 bits) sobre los pesos originales, reduciendo el tamaño del repositorio a 30,2 GB. El modelo base Granite 4.2 es una familia de modelos densos decoder-only de 30B parámetros, con capacidades de razonamiento chain-of-thought, modos de pensamiento flexibles y tool calling aumentado con razonamiento. Esta conversión no incluye fine-tuning ni datos de entrenamiento adicionales, y se distribuye bajo licencia Apache 2.0.

La relevancia de este artefacto radica en que permite ejecutar un modelo de 30B parámetros en hardware Apple Silicon mediante la librería `mlx-lm`, con una huella de memoria reducida gracias a la cuantización de 8 bits. Es útil para desarrolladores que trabajan en ecosistemas macOS y necesitan un modelo de razonamiento y generación de texto multilingüe sin depender de servicios en la nube. No obstante, al ser una conversión de terceros, los benchmarks publicados por IBM corresponden al modelo original y no a esta versión cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Granite 4.2) |
| Parametros totales | 30B (modelo base); el archivo safetensors reporta 8.234.471.424, posible discrepancia |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (microscaling floating-point, 8 bits) |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (layout MLX) |

## Arquitectura y entrenamiento

El modelo base Granite 4.2 30B es un transformer denso decoder-only, post-entrenado sobre los modelos base Granite 4.1. Según la documentación de IBM, incorpora razonamiento chain-of-thought integrado, modos de pensamiento flexibles (thinking mode) y tool calling aumentado con razonamiento. La conversión a MLX no modifica la arquitectura, solo transforma los pesos al formato safetensors de MLX y aplica cuantización MXFP8 mediante redondeo al más cercano, sin calibración. Se elimina el `lm_head` redundante cuando el modelo ata las embeddings de entrada y salida. No se añadió ningún dato de entrenamiento ni fine-tuning.

## Capacidades

- Generación de texto y conversación multilingüe en 12 idiomas (incluido español, inglés, francés, alemán, etc.).
- Razonamiento chain-of-thought integrado, con modos de pensamiento flexibles (pensamiento rápido o profundo según la tarea).
- Tool calling / function calling aumentado con razonamiento, útil para agentes que necesitan decidir cuándo y cómo invocar herramientas.
- Soporte de agentes y razonamiento multi-paso, gracias a la capacidad de generar cadenas de razonamiento antes de responder.
- Capacidad de procesar instrucciones complejas y tareas de codificación, matemáticas y análisis lógico (según las capacidades del modelo base).
- Integración nativa con el ecosistema MLX de Apple, permitiendo ejecución local eficiente en Macs con chip M-series.

## Casos de uso

- Asistente de programación local en macOS: un desarrollador puede ejecutar el modelo en su MacBook Pro con chip M-series para obtener sugerencias de código, explicaciones y refactorización sin enviar datos a la nube. La cuantización de 8 bits permite cargar el modelo en memoria unificada de 32 GB o más.
- Chatbot de atención al cliente multilingüe: gracias a su soporte de 12 idiomas y generación de texto fluida, puede desplegarse en entornos empresariales que requieran respuestas en varios idiomas, con la ventaja de ejecutarse en hardware local para cumplir requisitos de privacidad.
- Agente de automatización de tareas con tool calling: el modelo puede integrarse en pipelines que invocan APIs, bases de datos o scripts, usando su capacidad de razonamiento para decidir qué herramienta llamar y en qué orden, ideal para automatizar flujos de trabajo internos.
- Generación de documentación técnica: a partir de especificaciones o código fuente, el modelo puede redactar documentación coherente y detallada, aprovechando su contexto multilingüe y su capacidad de razonamiento estructurado.
- Análisis de datos y generación de informes: con su capacidad de razonamiento, puede procesar datos estructurados (en formato texto) y generar resúmenes, conclusiones o informes ejecutivos, útil en entornos de consultoría o análisis de negocio.
- Prototipado rápido de aplicaciones conversacionales: los desarrolladores pueden usar `mlx-lm` para cargar el modelo y probar ideas de chatbots o asistentes virtuales en local, iterando rápidamente sin costes de inferencia en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que los benchmarks publicados por IBM corresponden al modelo original `ibm-granite/granite-4.2-30b` y no deben interpretarse como resultados de esta conversión cuantizada. No se dispone de datos de rendimiento (latencia, throughput) para esta versión MLX.

## Requisitos de hardware

- Memoria unificada estimada: al ser un modelo de 30B cuantizado a 8 bits, el tamaño del repositorio es de 30,2 GB, por lo que se recomienda un Mac con al menos 32 GB de RAM unificada para cargar el modelo y dejar margen para el sistema y el contexto de generación.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con suficiente memoria unificada. Los chips con más núcleos de GPU (M1 Pro/Max, M2 Pro/Max, M3 Max, etc.) ofrecerán mejor rendimiento.
- Compatibilidad con consumer GPU: no aplica, ya que MLX está diseñado exclusivamente para Apple Silicon. No se puede ejecutar en GPUs NVIDIA o AMD.
- Opciones de despliegue: `mlx-lm` (librería de Python), que permite carga y generación con pocas líneas de código. También se puede integrar en aplicaciones Swift mediante el framework MLX.
- Latencia y throughput: no disponibles. Dependerá del chip concreto, la memoria disponible y la longitud de la secuencia generada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos similares. El modelo es una conversión específica de Granite 4.2 30B a MLX, y no se han encontrado datos de rendimiento ni benchmarks comparativos en la información proporcionada. Existen otras conversiones del mismo modelo base (por ejemplo, `nightmedia/granite-4.2-30b-mxfp8-mlx`), pero no se dispone de detalles sobre diferencias o ventajas relativas.

## Limitaciones y advertencias

- La cuantización MXFP8 puede introducir una ligera degradación en la calidad de las respuestas en comparación con el modelo original en precisión completa, especialmente en tareas de razonamiento complejo o matemáticas.
- Esta conversión no está afiliada ni respaldada por IBM. Los benchmarks y capacidades documentadas por IBM se refieren al modelo original, no a este artefacto cuantizado.
- El modelo puede presentar sesgos y alucinaciones inherentes a los modelos de lenguaje entrenados con datos web. Se recomienda validar las respuestas en aplicaciones críticas.
- La longitud de contexto no está documentada en esta conversión; se desconoce si la cuantización afecta al manejo de contextos largos.
- El uso comercial está permitido bajo licencia Apache 2.0, pero se debe conservar la atribución correspondiente al modelo original de IBM.
- Al ser un modelo de 30B, requiere hardware Apple Silicon con al menos 32 GB de RAM unificada; no es adecuado para equipos con menos memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/salohcin714/granite-4.2-30b-mxfp8-mlx
- Modelo base original: https://huggingface.co/ibm-granite/granite-4.2-30b
- Documentación de IBM Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Página principal de IBM Granite: https://www.ibm.com/granite
- Repositorio GitHub de Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
