# cwolff/qwen3.5-2b-grpo-sqale

## Resumen

M_SQaLe es un modelo de text-to-SQL de 2.274 millones de parámetros obtenido por ajuste fino del modelo base Qwen3.5-2B mediante aprendizaje por refuerzo con GRPO. Lo desarrolla el autor cwolff dentro del proyecto SQaLe (trl-lab) y está diseñado específicamente para resolver consultas SQL sobre bases de datos SQLite con esquemas grandes y realistas, con una mediana de 113 tablas y 538 columnas por esquema. Su particularidad es que funciona como agente: no recibe el esquema en el prompt, sino que explora la base de datos mediante llamadas a herramientas, consulta valores y prueba la consulta antes de enviarla.

El modelo se entrena exclusivamente con RL sobre el conjunto SQaLe, compuesto por 1.408.056 preguntas y 176.761 consultas SQL sobre 9.259 esquemas reales de SchemaPile, sin arranque supervisado ni trazas de razonamiento destiladas de un profesor mayor. Esta aproximación es relevante porque demuestra que un modelo pequeño y especializado puede competir con modelos generalistas de 9-12B en una tarea concreta cuando el corpus de entrenamiento es adecuado y el entorno de agente está bien diseñado.

La ficha se basa en la model card y los metadatos públicos del repositorio. El modelo está publicado con licencia Apache 2.0, solo soporta inglés y su uso previsto es la generación de SQL en entornos agénticos con ejecución de herramientas contra la base de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), ajustado con GRPO en entorno agéntico; arquitectura interna detallada no disponible |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only de 2.274 millones de parámetros. Sobre esa base se aplica un ajuste con GRPO (Group Relative Policy Optimization) en un bucle agéntico: el modelo recibe la pregunta y un conjunto de herramientas, explora el esquema mediante llamadas (listar tablas, describir columnas, consultar valores), ejecuta SQL de prueba y finalmente envía la consulta con `submit_sql`. El esquema nunca forma parte del prompt, lo que obliga al modelo a descubrirlo activamente y reduce el coste de entrada en bases de datos con cientos de tablas.

El entrenamiento es puramente de refuerzo: no hay warm start supervisado, ni destilación de trazas de un profesor mayor, ni andamiaje en tiempo de evaluación. El corpus SQaLe contiene 1.408.056 preguntas y 176.761 consultas SQL sobre 9.259 esquemas de SchemaPile. La familia SQaLe entrena el mismo Qwen3.5-2B con la misma receta (entorno, herramientas, recompensa, objetivo GRPO, pasos, batch size y protocolo de evaluación) sobre tres corpus distintos (SQaLe, BIRD train y SynSQL-2.5M), variando solo el corpus y la intensidad del currículo de longitud, lo que permite aislar el efecto de los datos. En SQaLe se usa un currículo completo de cuatro cubos de longitud.

## Capacidades

- Generación de consultas SQL (SQLite) a partir de preguntas en lenguaje natural.
- Comportamiento agéntico multi-turno: exploración de esquema, inspección de columnas y consulta de valores mediante herramientas.
- Ejecución y validación iterativa de consultas antes de la respuesta final, con fallback a la última consulta funcional.
- Tool calling / function calling dentro del bucle de agente definido en `sqale_agent.py`.
- Manejo de esquemas grandes (mediana de 113 tablas y 538 columnas) sin incluir el esquema en el prompt.
- Lectura de valores literales desde los datos: consulta el 88% de los literales de cadena de los que depende la respuesta gold, frente al 35% del modelo base sin entrenar.
- Localización de tablas relevantes: abre todas las tablas gold en el 89,7% de los episodios sobre esquemas de tamaño completo del test de SQaLe.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- No se declaran capacidades de visión, audio ni modo de razonamiento explícito, pese a la etiqueta `image-text-to-text` del repositorio.

## Casos de uso

- Asistentes de análisis de datos internos: el modelo se conecta en modo solo lectura a una base SQLite corporativa y responde preguntas de negocio en lenguaje natural, descubriendo el esquema por sí mismo gracias a las herramientas de exploración.
- Generación de SQL en pipelines de BI: integrado en un servicio que traduce preguntas de usuarios no técnicos a consultas ejecutables, con validación previa contra la base de datos para reducir errores de sintaxis y de nombres de columnas.
- Agentes de soporte a analistas: un bucle multi-turno permite refinar la consulta a partir de errores de ejecución, algo útil en esquemas con cientos de tablas donde el prompt no puede contener el DDL completo.
- Automatización de informes periódicos: el modelo puede resolver preguntas recurrentes sobre ventas, inventario o pedidos contra réplicas de solo lectura, con el fallback a la última consulta válida como red de seguridad.
- Evaluación y benchmarking de text-to-SQL: sirve como referencia pequeña y reproducible para comparar corpus de entrenamiento (SQaLe, BIRD, SynSQL) manteniendo constante la receta de RL.
- Docencia e investigación en RL para agentes: el repositorio incluye un bucle de referencia autocontenido que reproduce el entorno de entrenamiento, útil para estudiar GRPO aplicado a tool use.
- Extracción de datos asistida en dominios con esquemas reales: por ejemplo, consultas sobre registros clínicos (el paper evalúa en EHRSQL) o sobre catálogos de proveedores, siempre que la base esté en SQLite y el idioma sea inglés.

## Benchmarks y rendimiento

Exactitud de ejecución (%) sobre 300 preguntas por benchmark, en el entorno agéntico de entrenamiento, con esquema oculto y sin andamiaje en test.

| Modelo | SQaLe test | BIRD dev | EHRSQL |
|---|:-:|:-:|:-:|
| M_SQaLe (este modelo) | 66,3 | 52,3 | 23,7 |
| M_BIRD | 54,0 | 54,7 | 23,7 |
| M_SynSQL | 50,7 | 44,3 | 13,3 |
| Qwen3.5-2B (sin entrenar) | 38,7 | 19,3 | 8,2 |
| Qwen3.6-27B (sin entrenar) | 76,0 | 69,3 | 55,0 |

Ganancias respecto al base sin entrenar: +27,6 puntos en SQaLe test, +33,0 en BIRD dev y +15,5 en EHRSQL. La misma receta sobre BIRD añade 15,3 puntos y sobre SynSQL 12,0 puntos en SQaLe test.

En 100 preguntas moderadas del test de SQaLe, el modelo alcanza un 52% con 224 TFLOPs por pregunta; todos los modelos generalistas de 9-12B salvo Qwen3.5-9B quedan por debajo, y Qwen3.5-27B está 11 puntos por delante con 1.710 TFLOPs por pregunta. Sobre esquemas de tamaño completo del test, abre todas las tablas gold en el 89,7% de los episodios y consulta el 88% de los literales de cadena necesarios (frente al 35% del base).

## Requisitos de hardware

- VRAM estimada para inferencia: unos 4,5 GB en FP16/BF16 (2.274 millones de parámetros); alrededor de 2,5 GB en cuantización de 8 bits y 1,5-2 GB en 4 bits, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con 8 GB o más para BF16; A100, H100 o L40S para servir varias sesiones concurrentes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, con margen amplio en BF16.
- Opciones de despliegue: el quickstart oficial usa vLLM; también es compatible con TGI y transformers. Para cuantización en CPU o GPU de gama baja sería necesario generar GGUF y usar llama.cpp u Ollama, no publicados por el autor.
- Latencia y throughput: no disponibles. El coste computacional reportado es de 224 TFLOPs por pregunta en las 100 preguntas moderadas del test de SQaLe, lo que da una referencia relativa frente a modelos mayores, pero no una latencia absoluta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SQaLe test | BIRD dev | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| M_SQaLe | 2,27B | no disponible | 66,3 | 52,3 | Apache 2.0 | Hugging Face |
| M_BIRD | 2,27B | no disponible | 54,0 | 54,7 | Apache 2.0 (según familia) | Hugging Face |
| M_SynSQL | 2,27B | no disponible | 50,7 | 44,3 | Apache 2.0 (según familia) | Hugging Face |
| Qwen3.5-2B (base) | 2,27B | no disponible | 38,7 | 19,3 | Apache 2.0 | Hugging Face |
| Qwen3.6-27B (generalista) | 27B aprox. | no disponible | 76,0 | 69,3 | no disponible | Hugging Face |

La comparación relevante es interna a la familia SQaLe, ya que los tres modelos comparten receta y solo cambian los datos. Frente a modelos generalistas, M_SQaLe ofrece una exactitud notablemente superior a su tamaño con un coste de 224 TFLOPs por pregunta, aunque queda por debajo de Qwen3.6-27B en los tres benchmarks.

## Limitaciones y advertencias

- Solo soporta inglés; las preguntas en otros idiomas no están cubiertas por el entrenamiento.
- Diseñado para SQLite: el conjunto de herramientas y el dialecto SQL del entorno de entrenamiento son específicos de SQLite, por lo que su uso con PostgreSQL, MySQL u otros motores requiere adaptación y no está validado.
- Requiere un bucle de agente: sin las herramientas de exploración y el protocolo de turnos, el modelo no rinde como en la evaluación. Usarlo en modo generación directa sin herramientas degrada gravemente los resultados.
- Riesgo de alucinación: puede inventar tablas, columnas o valores si la exploración es incompleta; el fallback a la última consulta funcional mitiga parcialmente el problema, pero no lo elimina.
- Rendimiento en dominios muy específicos: en EHRSQL, un benchmark de dominio único sobre registros clínicos, la exactitud es de 23,7%, lejos de los modelos grandes, lo que indica poca generalización fuera de la distribución de SQaLe.
- Sesgos: no se documentan análisis de sesgo; al entrenarse sobre esquemas reales de SchemaPile, puede heredar sesgos de nomenclatura y de dominio de esos datos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene validar el modelo en el dominio propio antes de producción.
- Datos no disponibles: no se publican longitud de contexto, cuantizaciones oficiales, latencias medidas ni detalles de la composición exacta del dataset más allá de las cifras agregadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cwolff/qwen3.5-2b-grpo-sqale
- Modelo en Hugging Face (organización trl-lab, referenciado en el quickstart): https://huggingface.co/trl-lab/qwen3.5-2b-grpo-sqale
- Página del proyecto SQaLe: https://trl-lab.github.io/sqale
- Dataset SQaLe (preguntas): https://huggingface.co/datasets/trl-lab/SQaLe-2-text-to-SQL-Queries
- Dataset SQaLe (esquemas): https://huggingface.co/datasets/trl-lab/SQaLe-2-text-to-SQL-Schemas
- Colección con los tres modelos de la familia: https://huggingface.co/collections/trl-lab/sqale-project
- Modelo M_BIRD: https://huggingface.co/trl-lab/qwen3.5-2b-grpo-bird
- Modelo M_SynSQL: https://huggingface.co/trl-lab/qwen3.5-2b-grpo-synsql
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset SynSQL-2.5M: https://huggingface.co/datasets/seeklhy/SynSQL-2.5M
- Benchmark BIRD: https://bird-bench.github.io/
- Benchmark EHRSQL: https://github.com/glee4810/EHRSQL
