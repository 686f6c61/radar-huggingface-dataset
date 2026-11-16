# sonnyhuang/qwen2.5-coder-3b-nflsql-lora

## Resumen

El modelo `sonnyhuang/qwen2.5-coder-3b-nflsql-lora` es un adaptador LoRA publicado por el usuario sonnyhuang sobre el modelo base `mlx-community/Qwen2.5-Coder-3B-Instruct-8bit`. Su funcion es especializar un modelo Qwen2.5-Coder de 3.000 millones de parametros en la generacion de SQL para PostgreSQL a partir de preguntas en lenguaje natural sobre datos de la NFL, dentro del proyecto NFL Text-to-SQL Agent. No es un modelo completo, sino un adaptador que debe cargarse junto al modelo base cuantizado a 8 bits en formato MLX.

El interes practico reside en que demuestra un flujo de ajuste fino eficiente (LoRA de rango 16 sobre las proyecciones de atencion y MLP de los 16 bloques superiores) para una tarea vertical muy concreta, con validacion de ejecucion contra la base de datos real. El autor reporta una precision de ejecucion del 94,5% en preguntas plantilla reservadas y del 63,4% en preguntas escritas a mano, cifras que suben al 98,2% y 67,0% respectivamente al combinarse con recuperacion aumentada (RAG).

El modelo esta pensado para ejecutarse en hardware Apple Silicon mediante MLX-LM, lo que lo hace accesible en equipos de sobremesa y portatiles con memoria unificada. Su licencia es la Qwen Research License, lo que restringe el uso a fines no comerciales de investigacion o evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder) con adaptador LoRA |
| Parametros totales | 3.000 millones (modelo base) + adaptador LoRA de rango 16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | 8 bits (modelo base MLX); el adaptador se aplica sobre esa cuantizacion |
| Idiomas soportados | no disponible |
| Licencia | Qwen Research License Agreement (uso no comercial) |
| Formato de pesos | MLX (adaptador LoRA para MLX-LM) |
| Modelo base | mlx-community/Qwen2.5-Coder-3B-Instruct-8bit |
| Rango LoRA | 16, sobre proyecciones de atencion y MLP de los 16 bloques superiores |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros especializado en codigo. El ajuste se realizo con MLX-LM mediante LoRA de rango 16 sobre todas las proyecciones de atencion y MLP de los 16 bloques superiores del modelo. El entrenamiento consistio en una sola epoca sobre 3.400 ejemplos sinteticos, cada uno ejecutado contra la base de datos para validar la correccion del SQL generado, y la perdida se calculo unicamente sobre la completitud del SQL, no sobre el prompt.

Los datos de entrenamiento derivan de nflverse (licencia CC BY 4.0). El adaptador esta disenado para usarse con un formato de prompt especifico definido en el proyecto (system prompt mas un esquema compacto de la base de datos), por lo que su rendimiento depende de respetar ese formato en inferencia.

## Capacidades

- Generacion de consultas SQL para PostgreSQL a partir de preguntas en lenguaje natural sobre el esquema `nfl`.
- Traduccion de preguntas de negocio (estadisticas de jugadores, equipos, partidos) a SQL ejecutable.
- Ajuste verticalizado: el modelo esta especializado en un unico esquema y no esta pensado como generador SQL generico.
- Funcionamiento con y sin RAG: el autor reporta mejoras al combinar el adaptador con recuperacion de contexto.
- Inferencia local en Apple Silicon mediante MLX-LM.
- No se documentan capacidades de tool calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Consultas analiticas sobre datos NFL: un analista escribe "que quarterback lanzo mas yardas en 2023" y el modelo genera el SQL correspondiente contra el esquema `nfl`, eliminando la necesidad de conocer las tablas y columnas.
- Integracion en el agente NFL Text-to-SQL: el adaptador se carga dentro del proyecto FinetunedSQLAgent, donde el agente gestiona la conversacion y este modelo produce las consultas.
- Prototipado de interfaces de lenguaje natural a base de datos: sirve como referencia para construir un text-to-SQL verticalizado sobre un esquema propio, sustituyendo el dataset NFL por otro.
- Evaluacion de tecnicas LoRA en MLX: util como caso de estudio de ajuste fino eficiente en hardware Apple, con un pipeline de validacion por ejecucion.
- Generacion asistida de SQL en cuadernos de analisis: el modelo puede sugerir consultas que el analista revisa antes de ejecutar, reduciendo el tiempo de escritura manual.
- Docencia e investigacion sobre text-to-SQL: el proyecto incluye comparativas con y sin RAG que sirven para estudiar el impacto de la recuperacion en tareas de generacion de codigo SQL.
- Despliegue local sin conexion: al ejecutarse con MLX en un equipo Apple, permite consultas sobre datos NFL en entornos sin acceso a APIs externas.

## Benchmarks y rendimiento

| Metrica | Sin RAG | Con RAG |
|---|---|---|
| Precision de ejecucion en preguntas plantilla reservadas | 94,5% | 98,2% |
| Precision de ejecucion en preguntas escritas a mano | 63,4% | 67,0% |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores son las reportadas por el autor en la model card y corresponden a la tarea especifica de text-to-SQL sobre el esquema `nfl`.

## Requisitos de hardware

- El modelo base cuantizado a 8 bits ocupa aproximadamente 3 GB, por lo que se estima una VRAM o memoria unificada de unos 3-4 GB para inferencia, ademas del overhead del runtime.
- Requiere hardware Apple Silicon (M1, M2, M3, M4 o posteriores) con memoria unificada suficiente; el adaptador es especifico de MLX.
- Cabe en equipos consumer Apple con 8 GB de memoria unificada o mas, incluyendo MacBook Air y Mac mini.
- No es compatible directamente con CUDA, vLLM, TGI ni llama.cpp en su formato actual; el despliegue esta ligado a MLX-LM.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-coder-3b-nflsql-lora (este) | 3B + LoRA | no disponible | Text-to-SQL verticalizado NFL, MLX | Qwen Research (no comercial) | Hugging Face |
| Qwen2.5-Coder-3B-Instruct | 3B | no disponible | Generacion de codigo generico | Apache 2.0 (version original) | Hugging Face |
| Adaptadores text-to-SQL genericos | no disponible | no disponible | SQL multi-esquema | variable | Hugging Face |

La comparacion detallada con alternativas de la misma categoria no esta disponible en la informacion proporcionada. La diferencia principal frente al modelo base es la especializacion en un esquema concreto y el formato de prompt cerrado, a costa de perder generalidad.

## Limitaciones y advertencias

- Licencia Qwen Research: uso permitido unicamente para fines no comerciales de investigacion o evaluacion; no apto para produccion comercial sin autorizacion.
- El adaptador esta acoplado a un esquema concreto (`nfl`) y a un formato de prompt especifico; fuera de ese contexto su rendimiento cae drasticamente.
- La precision en preguntas escritas a mano es del 63,4% (67,0% con RAG), lo que implica una tasa de error significativa en consultas no plantilla.
- Entrenado con 3.400 ejemplos sinteticos y una sola epoca: riesgo de sobreajuste al estilo de las preguntas plantilla y de generalizacion limitada.
- Riesgo de alucinacion en nombres de columnas, tablas o funciones SQL no presentes en el esquema; se recomienda validar la ejecucion antes de usar los resultados.
- Dependencia de MLX y Apple Silicon: no hay pesos en safetensors ni GGUF para otros runtimes.
- No se documentan sesgos conocidos ni cobertura multilingue en la informacion disponible.
- El modelo base esta cuantizado a 8 bits, lo que puede introducir perdida de precision frente a la version en punto flotante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sonnyhuang/qwen2.5-coder-3b-nflsql-lora
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-Coder-3B-Instruct-8bit
- Repositorio del proyecto NFL Text-to-SQL Agent: https://github.com/sonnysideupp/FinetunedSQLAgent
- Datos NFL utilizados: https://github.com/nflverse/nflverse-data
- Licencia Qwen Research: incluida en el repositorio como LICENSE
