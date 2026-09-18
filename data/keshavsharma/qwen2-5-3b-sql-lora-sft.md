# keshavsharma/qwen2.5-3b-sql-lora-sft

## Resumen

`keshavsharma/qwen2.5-3b-sql-lora-sft` es un adaptador LoRA de ajuste supervisado (SFT) sobre `Qwen/Qwen2.5-3B-Instruct`, especializado en la tarea text-to-SQL: recibe un esquema de base de datos expresado con sentencias `CREATE TABLE` junto con una pregunta en lenguaje natural y devuelve la consulta SQL correspondiente. Lo publica el usuario keshavsharma en HuggingFace y el repositorio ocupa 0,2 GB, coherente con un adaptador PEFT y no con los pesos completos del modelo base.

Técnicamente no es un modelo nuevo, sino un delta entrenado con LoRA de rango 32 y alpha 64 sobre los módulos de atención (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de la MLP (`gate_proj`, `up_proj`, `down_proj`), lo que supone aproximadamente un 1,9% de parámetros entrenables. El entrenamiento usó el dataset `b-mc2/sql-create-context` durante 2 épocas, con BF16, AdamW fused y una longitud máxima de secuencia de 512 tokens.

Su relevancia es acotada pero clara: es un ejemplo reproducible y de bajo coste de cómo adaptar un modelo denso de 3B a una tarea verticalizada con recursos mínimos. Sin embargo, el repositorio no declara licencia, idiomas soportados, pipeline ni métricas de evaluación, y acumula 0 descargas y 0 "likes", por lo que debe considerarse un artefacto experimental sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con adaptador LoRA sobre el modelo base |
| Parametros totales | ~3,09 B en el modelo base (Qwen2.5-3B-Instruct); el adaptador LoRA no se cuantifica en la model card |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros entrenables (LoRA) | ~1,9% del total; rango r=32, alpha=64, dropout=0,05 |
| Longitud de contexto | 512 tokens de secuencia maxima durante el entrenamiento; el modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos |
| Tipos de cuantizacion | No disponible (la model card no documenta cuantizaciones del adaptador; el modelo base admite FP16, BF16, INT8 e INT4 en formatos GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible; el dataset de entrenamiento (`b-mc2/sql-create-context`) esta en ingles |
| Licencia | No disponible en el repositorio del adaptador; el modelo base Qwen2.5-3B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT); no se publican pesos fusionados ni GGUF |
| Metodo de ajuste | SFT con LoRA / PEFT |
| Dataset de entrenamiento | `b-mc2/sql-create-context` (dividido 90% train / 10% eval, seed 42) |
| Epocas y optimizacion | 2 epocas, lr 2e-4, scheduler coseno, warmup 0,03, weight decay 0,01, BF16, AdamW fused |
| Batch size | 12 por dispositivo en train y eval, sin acumulacion de gradientes |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-18 |

## Arquitectura y entrenamiento

El punto de partida es Qwen2.5-3B-Instruct, un transformer decoder-only denso con atención causal y normalizacion RMSNorm. El autor no modifica la arquitectura: congela todos los pesos del modelo base e inserta matrices de bajo rango en siete proyecciones por bloque (las cuatro de atención y las tres de la MLP), lo que permite alterar tanto el comportamiento atencional como las transformaciones feed-forward con un coste de entrenamiento muy reducido. La configuración LoRA es r=32, alpha=64, dropout=0,05, `bias="none"` y `task_type="CAUSAL_LM"`.

El entrenamiento es SFT puro sobre `b-mc2/sql-create-context`, un dataset de tripletas (contexto de esquema, pregunta, SQL objetivo). Se aplica enmascaramiento estricto del prompt: los tokens del system prompt, del esquema y de la pregunta se etiquetan con `-100` y solo se calcula la perdida sobre los tokens de la respuesta SQL. Este detalle es relevante en produccion porque el modelo aprende a emitir exclusivamente la consulta, sin repetir el esquema de entrada. El prompt sigue la plantilla de chat de Qwen con un system prompt fijo ("You are a text-to-SQL assistant..."). No se documenta ninguna fase de RLHF, DPO ni decodificacion especulativa; la seleccion del mejor checkpoint se hizo por `eval_loss` con `EarlyStoppingCallback` (paciencia 5, umbral 0,001).

## Capacidades

- Generacion de consultas SQL a partir de un esquema `CREATE TABLE` y una pregunta en lenguaje natural, en un unico turno.
- Consultas de agregacion (`AVG`, `COUNT`, `SUM`), filtrado con `WHERE` y seleccion de columnas, segun el ejemplo incluido en la model card.
- Salida restringida a SQL: el enmascaramiento de perdida y el system prompt empujan al modelo a responder solo con la consulta.
- Seguimiento de la plantilla de chat de Qwen (system + user + assistant), imprescindible para reproducir el comportamiento entrenado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta thinking mode, vision, audio ni otras modalidades.
- Capacidad multilingue: no disponible; el entrenamiento es exclusivamente en ingles.

## Casos de uso

- Asistente de analitica self-service: el modelo traduce preguntas de negocio en lenguaje natural a SQL sobre un esquema fijo, de modo que usuarios no tecnicos obtengan resultados sin escribir consultas. Es adecuado por su formato de salida limpio y su bajo coste de inferencia.
- Generacion asistida en notebooks y entornos de ciencia de datos: un plugin consulta el esquema de la base de datos mediante `information_schema`, lo inyecta en el prompt y el modelo propone la consulta, que el analista revisa antes de ejecutar.
- Integracion en herramientas de BI: el adaptador se sirve detras de una API y se invoca desde un editor de consultas para autocompletar o corregir SQL a partir de la pregunta del usuario.
- Documentacion y catalogo de datos: dado el esquema, generar consultas canonicas de ejemplo para cada tabla o vista, utiles como material de onboarding y como tests de humo del catalogo.
- Migracion y refactor de consultas: usar el modelo para producir una primera version de la consulta equivalente tras cambios de esquema, siempre con validacion humana, dado que el entrenamiento no cubre dialectos especificos.
- Educacion y formacion en SQL: generar la consulta de referencia para un enunciado y un esquema dados, como apoyo en cursos o entornos de practica con correccion automatica.
- Preprocesado en pipelines de datos: convertir descripciones funcionales en borradores de consultas para su revision en un pull request, aprovechando que la salida es exclusivamente SQL y encaja en un pipeline de CI.

En todos los casos conviene recordar que el modelo solo ha visto secuencias de hasta 512 tokens: esquemas grandes con muchas tablas no caben en el prompt sin truncado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona el uso de `eval_loss` como metrica de seleccion del mejor checkpoint y la funcion de early stopping, pero no incluye cifras de exactitud de ejecucion (execution accuracy), coincidencia exacta de la consulta ni resultados sobre Spider, BIRD, WikiSQL u otros conjuntos de evaluacion text-to-SQL. Tampoco se publican curvas de perdida ni el valor numerico final de `eval_loss`.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,2 GB): la inferencia requiere descargar y cargar aparte `Qwen/Qwen2.5-3B-Instruct`.
- VRAM estimada con el modelo base: aproximadamente 6-7 GB en FP16/BF16, unos 3,5-4 GB en INT8 y unos 2-2,5 GB en cuantizacion de 4 bits. El adaptador anade un coste marginal.
- GPU recomendadas para produccion: NVIDIA A100 40 GB, H100 80 GB, L40S o A10G, con margen para lotes grandes.
- Cabe con holgura en GPU de consumo: RTX 4090, RTX 4080, RTX 3090 (24 GB) e incluso RTX 4070/3060 de 12 GB si se usa cuantizacion de 4 bits.
- Opciones de despliegue: vLLM o TGI para servir el modelo base con el adaptador LoRA cargado en caliente; llama.cpp u Ollama si se fusionan previamente los pesos y se convierten a GGUF; transformers + PEFT para prototipado.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni latencia extremo a extremo. Como referencia cualitativa, un modelo denso de 3B en una GPU moderna suele responder en decimas de segundo para salidas de decenas de tokens, pero no hay datos verificables en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-sql-lora-sft (este) | ~3,09 B base + adaptador LoRA (1,9% entrenable) | 512 tokens en entrenamiento | Text-to-SQL | No disponible en el repositorio del adaptador | HuggingFace, 0 descargas |
| Qwen2.5-3B-Instruct (modelo base) | ~3,09 B | 32.768 tokens nativos | Proposito general, instrucciones | Apache 2.0 | HuggingFace, ampliamente utilizado |
| Otros ajustes de text-to-SQL sobre `sql-create-context` | No disponible | No disponible | Text-to-SQL | No disponible | No disponible |
| SQLCoder, NSQL y similares | No disponible | No disponible | Text-to-SQL | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la informacion proporcionada. La unica diferencia verificable frente al modelo base es la especializacion en text-to-SQL y la restriccion de formato de salida; no hay evidencia publicada de que supere al modelo base en exactitud de ejecucion.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo completo: sin el modelo base `Qwen/Qwen2.5-3B-Instruct` no es utilizable, y hay que respetar la plantilla de chat de Qwen y el system prompt exacto del entrenamiento.
- La licencia del adaptador no esta declarada. El modelo base es Apache 2.0, pero la ausencia de licencia explicita en el repositorio deja en el aire el uso comercial del delta entrenado; conviene aclararlo con el autor antes de desplegarlo.
- Longitud de secuencia limitada a 512 tokens durante el entrenamiento: esquemas de base de datos extensos, con muchas tablas o columnas, no caben y provocaran truncado o respuestas incorrectas.
- Riesgo de alucinacion de esquema: el modelo puede referenciar tablas o columnas que no existen en el contexto proporcionado, o inventar sintaxis propia de un dialecto no visto.
- Ambiguedad de dialecto: `b-mc2/sql-create-context` contiene SQL generico; no hay garantia de correccion en dialectos especificos como PostgreSQL, MySQL, T-SQL o BigQuery.
- Cobertura de tareas limitada: el dataset esta sesgado hacia consultas relativamente sencillas; no se documenta soporte para subconsultas complejas, CTEs, funciones de ventana o razonamiento multi-paso.
- Idiomas: no hay datos sobre rendimiento fuera del ingles; las preguntas en castellano probablemente degraden la calidad de la consulta generada.
- Ausencia total de validacion: 0 descargas, 0 likes y ninguna metrica de evaluacion publicada; no hay evidencia externa de que el ajuste mejore al modelo base.
- Sin sesgos auditados: no se ha publicado ningun analisis de sesgos, aunque en una tarea text-to-SQL el riesgo principal es de correccion funcional, no de contenido sensible.
- Para produccion se recomienda validar sintacticamente el SQL generado (por ejemplo, con un parser o un `EXPLAIN`), ejecutarlo en modo solo lectura y limitar los recursos de la consulta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/keshavsharma/qwen2.5-3b-sql-lora-sft
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Paper, blog o repositorio adicional del autor: no disponible
- Demo o espacio interactivo: no disponible

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces recuperados correspondian a servicios generales de video y no guardan relacion con la ficha.
