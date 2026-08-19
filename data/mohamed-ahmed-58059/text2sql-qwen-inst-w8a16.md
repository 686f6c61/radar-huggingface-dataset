# mohamed-ahmed-58059/text2sql-qwen-inst-w8a16

## Resumen

El modelo `text2sql-qwen-inst-w8a16` es una adaptación del modelo base Qwen2.5-Coder-7B-Instruct, afinado mediante QLoRA para la tarea de conversión de texto a SQL (text-to-SQL). Desarrollado por el usuario mohamed-ahmed-58059, el modelo ha sido fusionado con el checkpoint-1400 del adaptador QLoRA y posteriormente cuantizado a int8 (weight-only, W8A16) para reducir su huella de memoria y facilitar su despliegue en entornos de producción con recursos limitados.

El modelo está entrenado y evaluado en los benchmarks Spider y BIRD, obteniendo una precisión de ejecución del 81,5 % en el conjunto de test de Spider y del 66,1 % en la combinación de Spider y BIRD dev. Con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y una ventana de contexto configurada a 8192 tokens, el modelo es capaz de generar consultas SQL en dialecto SQLite a partir de un esquema de base de datos y una pregunta en lenguaje natural. Su licencia Apache 2.0 permite uso comercial, aunque el autor lo declara como un proyecto de investigación y portafolio, no un sistema de producción.

La relevancia actual del modelo radica en la creciente demanda de soluciones de text-to-SQL eficientes y de bajo coste, especialmente en entornos donde no se dispone de GPUs de gran capacidad. Al estar cuantizado a int8, cabe en una GPU de 12 GB, lo que facilita su integración en aplicaciones locales o en servicios con recursos moderados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en el servidor vLLM) |
| Tipos de cuantizacion | int8 weight-only (W8A16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-Coder-7B-Instruct, un transformer autoregresivo con atención completa, optimizado para tareas de programación y razonamiento. El afinado se realizó mediante QLoRA (Quantized Low-Rank Adaptation) sobre el dataset `mohamed-ahmed-58059/text2sql-canonical-v3.1`, que contiene pares de esquemas de bases de datos, preguntas y consultas SQL correspondientes en dialecto SQLite. El adaptador resultante (checkpoint-1400) se fusionó con el modelo base y luego se cuantizó a int8 weight-only (W8A16) para reducir el tamaño del modelo a aproximadamente 7,6 GB de pesos.

No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas de RLHF/DPO. El proceso de afinamiento se documenta en el repositorio GitHub `hf-ml-platform-text2sql.finetune`, que describe una arquitectura de pipeline para preparación de datos, entrenamiento y evaluación. La cuantización int8 es una técnica de compresión de pesos que reduce el uso de memoria sin una pérdida significativa de precisión, lo que permite servir el modelo con recursos modestos.

## Capacidades

- Generación de consultas SQL a partir de una pregunta en lenguaje natural y un esquema de base de datos SQLite.
- Responde con SQL crudo, sin texto adicional, facilitando la integración directa en aplicaciones.
- Soporta el formato de chat ChatML, lo que permite interacciones multi-turno con el modelo.
- Capacidad de razonamiento sobre esquemas complejos y preguntas que requieren joins, subconsultas y agregaciones.
- Funciona exclusivamente con el dialecto SQLite; no está entrenado para otros motores de bases de datos.
- No incluye capacidades de visión, audio ni tool calling explícito.
- Modelo monolingüe en inglés; no se ha evaluado su rendimiento en otros idiomas.

## Casos de uso

- Asistente de consultas para equipos de datos: el modelo puede traducir preguntas en lenguaje natural a consultas SQL para bases SQLite, reduciendo el tiempo de desarrollo de informes y análisis. Su precisión en Spider (81,5 %) lo hace adecuado para tareas de consulta comunes.
- Integración en herramientas de BI: se puede conectar como un servicio que recibe preguntas del usuario y devuelve SQL para ejecutar en un sistema de reporting, permitiendo a usuarios no técnicos generar informes sin escribir código.
- Prototipado rápido de aplicaciones: los desarrolladores pueden usar el modelo para generar consultas SQL en fases de prototipo, acelerando el desarrollo de aplicaciones con bases de datos.
- Educación y formación en SQL: el modelo puede servir como tutor que explica cómo escribir consultas, generando SQL correcto a partir de descripciones de problemas.
- Automatización de tareas de mantenimiento de bases: por ejemplo, generar consultas de limpieza o actualización de datos a partir de descripciones de la operación deseada.
- Implementación en entornos con recursos limitados: gracias a la cuantización int8, el modelo puede desplegarse en GPUs de 12 GB, por lo que es viable en servidores de gama media o estaciones de trabajo locales sin acceso a infraestructura de alta gama.

## Benchmarks y rendimiento

Según la model card del autor, se midieron los siguientes resultados de precisión de ejecución (execution accuracy) sobre este modelo cuantizado:

| Benchmark | Execution accuracy |
|---|---|
| Spider test (2.147 registros) | 0,815 |
| Spider + BIRD dev (2.439 registros) | 0,661 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos resultados indican que el modelo mantiene un rendimiento competitivo para un modelo de 7,6B cuantizado a int8, aunque es importante notar que la evaluación se realizó solo sobre los datasets Spider y BIRD, ambos en inglés y con dialecto SQLite.

## Requisitos de hardware

- VRAM estimada: aproximadamente 7,6 GB para los pesos del modelo; con overhead de ejecución, se recomienda una GPU con al menos 12 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, o GPUs de centro de datos como A100 o H100 si se desea mayor concurrencia.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 12 GB (por ejemplo, RTX 3060, RTX 4070).
- Opciones de despliegue: vLLM es la opción recomendada (el autor proporciona el comando `vllm serve`), también compatible con text-generation-inference y endpoints compatibles con Hugging Face.
- Latencia y throughput: no se proporcionan datos concretos; depende del hardware y del tamaño del lote. La cuantización int8 reduce el uso de memoria y puede mejorar el throughput en comparación con el modelo sin cuantizar.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos text-to-SQL en la información proporcionada. Sin embargo, se puede mencionar que el mismo autor publicó un modelo similar basado en Llama-3.1-8B (con precisión de 0,915 en WikiSQL dev), pero no se han publicado comparaciones directas entre ambos. El modelo base Qwen2.5-Coder-7B-Instruct es más general y no está específicamente afinado para text-to-SQL, por lo que este modelo especializado ofrece mejor rendimiento en la tarea concreta, aunque con un alcance más limitado.

## Limitaciones y advertencias

- Entrenado únicamente en inglés; su rendimiento en otros idiomas no ha sido evaluado.
- Genera consultas en dialecto SQLite; no soporta otros dialectos como PostgreSQL, MySQL o SQL Server sin adaptación adicional.
- El proyecto se declara como de investigación y portafolio, no como un sistema de producción; no hay garantías de robustez en entornos de producción.
- Riesgo de alucinación en esquemas complejos o preguntas ambiguas; puede generar consultas sintácticamente válidas pero lógicamente incorrectas.
- La ventana de contexto de 8192 tokens puede ser insuficiente para esquemas de bases de datos muy grandes o preguntas que requieran un contexto extenso.
- No se han documentado sesgos específicos, pero al entrenarse en datasets de Spider y BIRD, puede heredar los sesgos de esos conjuntos de datos.
- El modelo no soporta tool calling, uso de agentes o interacción con otros sistemas; está diseñado para una tarea única.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohamed-ahmed-58059/text2sql-qwen-inst-w8a16
- Modelo base QLoRA: https://huggingface.co/mohamed-ahmed-58059/text2sql-qwen-inst-qlora
- Dataset de entrenamiento: https://huggingface.co/datasets/mohamed-ahmed-58059/text2sql-canonical-v3.1
- Repositorio de fine-tuning: https://github.com/mohamed-ahmed-58059/hf-ml-platform-text2sql.finetune
- Modelo relacionado con WikiSQL: https://huggingface.co/mohamed-ahmed-58059/Llama-3.1-8B-text2sql-wikisql
- Dataset WikiSQL: https://huggingface.co/datasets/mohamed-ahmed-58059/wikisql-text2sql
