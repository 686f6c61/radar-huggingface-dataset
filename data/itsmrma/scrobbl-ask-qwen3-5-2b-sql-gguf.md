# itsmrma/scrobbl-ask-qwen3.5-2b-sql-GGUF

## Resumen

scrobbl-ask-qwen3.5-2b-sql-GGUF es un ajuste fino del modelo Qwen3.5-2B (1.881.825.088 parametros) publicado por itsmrma, orientado especificamente a la traduccion de lenguaje natural a SQL (text-to-SQL) en ingles e italiano. El modelo genera consultas SQLite de solo lectura contra la proyeccion "Ask" del proyecto scrobbl-rs, una aplicacion de seguimiento musical de codigo abierto. El ajuste se realizo mediante LoRA sobre el modelo base en bf16 y se distribuye exclusivamente en formato GGUF cuantizado Q4_K_M (1.274.396.512 bytes, aproximadamente 1,3 GB de repositorio).

El modelo resuelve un problema acotado pero critico en el contexto de scrobbl-rs: permitir que un usuario formule preguntas sobre su historial musical en lenguaje natural y obtener consultas SQL validas y seguras, sin exponer operaciones de escritura ni consultas fuera de dominio. La evaluacion publicada por el autor muestra una mejora sustancial frente al modelo base: 22 casos correctos de 26 frente a 15, con cero fallos "honestos" frente a cuatro, y un rechazo del 6/6 en sondas fuera de alcance frente a 4/6 del base.

La relevancia actual del modelo radica en su tamano reducido (2B parametros) combinado con un rendimiento especializado solido en una tarea concreta, lo que permite despliegue local en hardware consumer. La licencia Apache 2.0 facilita su integracion en productos comerciales. El modelo esta etiquetado con `endpoints_compatible` y `conversational`, y su contexto de evaluacion se fijo en 8192 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-2B; detalles internos del base no disponibles) |
| Parametros totales | 1.881.825.088 (aprox. 1,88 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens usados en evaluacion; contexto maximo del base no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada); F16 disponible como paso intermedio de conversion |
| Idiomas soportados | en, it |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); F16 GGUF como origen de conversion |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-2B en bf16, un transformer decoder-only de aproximadamente 1,88 mil millones de parametros. El ajuste fino emplea LoRA con rango y alpha iguales a 32, loss solo sobre completions (completion-only loss), 3 epocas y learning rate coseno de 2e-4. Los datos de entrenamiento son un conjunto sintetico de SFT para la tarea "Ask" (scripts/ask-training/ask-sft.zip) con 1.940 ejemplos de entrenamiento y 100 de validacion, generados con `--samples 4 --seed 2026` y sin datos personales de archivo.

La fusion se realizo en bfloat16 y la conversion a GGUF F16 mediante llama.cpp (commit 0fb8f1577, flag `--no-nextn`, 320 tensores) para garantizar compatibilidad tanto con llama-cpp-2 0.1.161 como con versiones mas recientes de llama.cpp. Posteriormente se cuantizo a Q4_K_M. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa; la innovacion principal es la especializacion estrecha del modelo en una tarea de text-to-SQL con rechazo explicito de consultas fuera de alcance.

## Capacidades

- Generacion de consultas SQLite de solo lectura a partir de preguntas en lenguaje natural, en ingles e italiano.
- Traduccion de intenciones sobre historial musical (escrobados, artistas, generos, fechas) a SQL contra la proyeccion Ask de scrobbl-rs.
- Rechazo explicito de peticiones fuera de alcance: 6/6 sondas "unsupported" rechazadas (clima, peticiones de escritura, genero musical fuera de dominio).
- Capacidad conversacional (etiqueta `conversational` en el repo).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Multilingue limitado a en e it; no se documentan otras lenguas.
- No se documentan capacidades de tool calling generico, agentes multi-paso, vision, audio ni modo thinking; el modelo esta especializado en una unica tarea.

## Casos de uso

- Asistente local de consultas musicales: el usuario pregunta "que artistas escuche mas en marzo" y el modelo genera la consulta SQLite de solo lectura correspondiente contra la proyeccion Ask, con contexto de 8192 tokens suficiente para incluir el esquema y ejemplos.
- Integracion en scrobbl-rs: el modelo actua como capa NL-to-SQL dentro de la aplicacion, sustituyendo al modelo base y reduciendo fallos plausibles pero incorrectos (de 7 a 4 en la evaluacion).
- Despliegue en hardware consumer: al ser un GGUF Q4_K_M de aproximadamente 1,3 GB, puede ejecutarse en portatiles y equipos sin GPU dedicada mediante llama.cpp, Ollama o bindings llama-cpp-2.
- Filtrado de seguridad en produccion: el rechazo 6/6 de peticiones fuera de alcance permite usarlo como barrera que evita consultas de escritura o temas ajenos al dominio musical.
- Prototipado de interfaces conversacionales sobre bases SQLite: sirve como referencia para equipos que quieran replicar el pipeline LoRA + GGUF + evaluacion por corpus en otras verticales.
- Soporte bilingue en ingles e italiano: adecuado para aplicaciones de seguimiento musical dirigidas a usuarios de ambos idiomas, con 12/13 aciertos en italiano frente a 5/13 del base.
- Evaluacion comparativa de ajustes finos: el corpus de evaluacion (26 casos, fixture v2) y los scripts publicados permiten reproducir la comparacion base vs. ajustado en pipelines de CI.

## Benchmarks y rendimiento

Resultados publicados por el autor en `ask-eval` sobre corpus retenido (`evals/ask/sql_corpus.jsonl`, 26 casos, fixture v2, `--threads 8`, greedy, `context_tokens = 8192`):

| Modelo | Casos | Correctos | EN | IT | Fallo honesto | Incorrecto plausible | p50 | p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| qwen3.5-2b-q4_k_m (base) | 26 | 15 | 10/13 | 5/13 | 4 | 7 | 5251 ms | 21788 ms |
| scrobbl-ask-qwen3.5-2b-sql-q4_k_m | 26 | 22 | 10/13 | 12/13 | 0 | 4 | 4366 ms | 9024 ms |

Sondas fuera de alcance (`unsupported`): 6/6 rechazadas por el modelo ajustado frente a 4/6 del base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para los pesos Q4_K_M; con overhead de contexto de 8192 tokens, se recomienda al menos 2-3 GB de memoria disponible.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobredimensionadas pero validas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna y en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp (compatibilidad verificada con llama-cpp-2 0.1.161 y versiones posteriores), Ollama, bindings llama-cpp-2, endpoints compatibles.
- Latencia observada en la evaluacion: p50 de 4366 ms y p95 de 9024 ms con 8 hilos y contexto de 8192 tokens; el ajuste reduce la p95 a menos de la mitad frente al base (21788 ms).
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento text-to-SQL (26 casos) | Licencia | Formato |
|---|---|---|---|---|---|
| scrobbl-ask-qwen3.5-2b-sql (este) | 1,88 B | 8192 (evaluacion) | 22/26 correctos; 0 fallos honestos | Apache 2.0 | GGUF Q4_K_M |
| Qwen3.5-2B base | 1,88 B | no disponible | 15/26 correctos; 4 fallos honestos | Apache 2.0 (base) | bf16 / GGUF |
| Alternativas text-to-SQL de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio muy estrecho: solo genera SQL de lectura contra la proyeccion Ask de scrobbl-rs; no es un modelo generalista.
- Idiomas limitados a ingles e italiano; el rendimiento en italiano mejora mucho (12/13) pero sigue por debajo de ingles (10/13) en proporcion y el corpus es pequeno (26 casos), por lo que las cifras tienen alta varianza.
- Riesgo de alucinacion: 4 de 26 casos siguen siendo "incorrectos pero plausibles", lo que en produccion puede producir consultas sintacticamente validas pero semanticamente erroneas.
- Datos de entrenamiento sinteticos (1.940 ejemplos) sin datos personales; la cobertura del esquema real puede ser limitada.
- Sesgos: no documentados por el autor; al ser un ajuste sintetico sobre un dominio musical, se desconocen sesgos de genero, idioma o artistas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-2B y de los datos sinteticos generados.
- No se documentan garantias de seguridad SQL mas alla del rechazo de escrituras; se recomienda ejecutar las consultas generadas con permisos de solo lectura a nivel de base de datos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/itsmrma/scrobbl-ask-qwen3.5-2b-sql-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Repositorio scrobbl-rs: https://github.com/itsmrma/scrobbl-rs
- Documentacion de entrenamiento: https://github.com/itsmrma/scrobbl-rs/blob/main/docs/ask-training.md
- Informe de evaluacion del ajuste fino: https://github.com/itsmrma/scrobbl-rs/blob/main/docs/reports/ask-eval-sql-finetune.md
- Configuracion y catalogo de IA local: https://github.com/itsmrma/scrobbl-rs/blob/main/docs/ai.md
