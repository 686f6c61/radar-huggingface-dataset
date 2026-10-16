# emonHasan01/qwen2.5-3b-text2sql

## Resumen

qwen2.5-3b-text2sql es un ajuste fino supervisado del modelo instructivo unsloth/Qwen2.5-3B-Instruct orientado exclusivamente a la tarea de text-to-SQL: convertir una pregunta en lenguaje natural junto con un esquema `CREATE TABLE` en una unica consulta SQL. Lo desarrolla Md. Emon Hasan (usuario `emonHasan01`) y se publica bajo licencia Apache 2.0. El modelo resuelve un problema muy concreto: los modelos instructivos genericos responden con vallas de markdown, preambulos y explicaciones, y ademas alucinan nombres de columnas que no existen en el esquema, lo que rompe cualquier integracion automatizada.

Tecnicamente se trata de un transformer decoder-only de la familia Qwen2 de 3.085.938.688 parametros (3,1B), ajustado mediante LoRA de 16 bits con Unsloth sobre el dataset `b-mc2/sql-create-context`. El entrenamiento movio solo 29.933.568 parametros (0,97% del total) con rango 16, alpha 16 y dropout 0 sobre los modulos `q,k,v,o,gate,up,down`, en 500 pasos y unos 16 minutos sobre una Tesla T4. El resultado declarado es un salto de 7,7% a 74,3% de exact match sobre 300 consultas retenidas, medido sobre AST normalizado con `sqlglot`.

Su relevancia practica es la de un modelo pequeno, desplegable en una GPU de consumo, que convierte lenguaje natural en SQL valido con una tasa declarada del 100% de sintaxis correcta. Frente a alternativas mucho mayores, su interes no esta en el conocimiento general sino en la forma de la salida: una unica sentencia, sin ruido y ajustada al esquema proporcionado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, derivada de Qwen2.5-3B-Instruct); atencion por RoPE y SwiGLU |
| Parametros totales | 3.085.938.688 (3,1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens heredados de la arquitectura Qwen2.5-3B-Instruct; el ajuste fino se realizo con secuencias maximas de 512 tokens |
| Tipos de cuantizacion | no especificados por el autor; pesos publicados en FP16 (16-bit) y compatibles con cuantizacion posterior a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16, 16-bit); repositorio de 6,3 GB, coherente con un merge del adaptador LoRA sobre los pesos base |

## Arquitectura y entrenamiento

La base es Qwen2.5-3B-Instruct, un transformer decoder-only denso de 3,1B parametros de la familia Qwen2, con atencion agrupada (GQA), embeddings rotatorios (RoPE) y bloques MLP con activacion SwiGLU. Sobre ese modelo se aplica un LoRA de 16 bits gestionado por Unsloth, con rango 16, alpha 16 y dropout 0, apuntando a los modulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. La tasa de aprendizaje es 2e-4 con planificador lineal y optimizador `adamw_8bit`; el tamano de lote efectivo es 8 (2 x 4) durante 500 pasos con secuencias de como maximo 512 tokens. El pico de VRAM fue de 6,9 GB sobre 15,0 GB disponibles en una Tesla T4.

El conjunto de entrenamiento es `b-mc2/sql-create-context`, que empareja un unico `CREATE TABLE` con una pregunta y su consulta SQL de referencia. No se menciona RLHF ni DPO: es un ajuste fino supervisado puro. La innovacion practica del trabajo no esta en la arquitectura, sino en el diagnostico de la tarea: el autor argumenta que el ajuste fino rinde cuando la salida de la base no coincide en *forma* con el objetivo (vallas de markdown, prosa introductoria, columnas inexistentes) y no cuando se intenta inyectar capacidades nuevas. Cita como contraejemplo un experimento previo que destilo trazas de razonamiento en Llama-3.2-3B y degradо GSM8K de 75,0% a 65,0%. Tanto el prompt de sistema como la plantilla de usuario quedaron fijados en todos los ejemplos de entrenamiento y se publican en `prompt_format.json`.

## Capacidades

- Generacion de consultas SQL (SQLite) a partir de una pregunta en ingles y un esquema `CREATE TABLE` de una sola tabla.
- Salida limpia por diseno: una unica sentencia SQL, sin explicaciones, sin markdown y sin comentarios, si se respeta el prompt de sistema.
- Condicionamiento estricto al esquema: el entrenamiento busca reducir la invencion de columnas y tablas fuera del `CREATE TABLE` proporcionado.
- Sintaxis SQL valida en el 100% de las 300 consultas de evaluacion declaradas por el autor.
- Formato conversacional compatible con la plantilla de chat de Qwen2.5 (`apply_chat_template`).
- No se declaran capacidades de tool calling, function calling, uso de agentes, vision, audio ni razonamiento multi-paso.
- Capacidad multilingue limitada: el modelo esta etiquetado unicamente como `en` y el dataset de entrenamiento es en ingles.
- Decodificacion greedy recomendada: el muestreo introduce nombres de columna y tabla que no existen en el esquema.

## Casos de uso

- Asistente de consultas sobre bases de datos internas: dado el DDL de una tabla y una pregunta de un usuario no tecnico, el modelo devuelve la sentencia SQL lista para ejecutar contra SQLite, eliminando la necesidad de que el usuario conozca el esquema.
- Generacion de SQL en herramientas de analitica tipo BI: integrable como paso previo a un ejecutor de consultas, con la ventaja de que las 300 pruebas declaradas producen SQL sintacticamente valido en el 100% de los casos.
- Prototipado rapido de interfaces de lenguaje natural a base de datos: al ocupar unos pocos GB en FP16, se puede servir en una unica GPU de consumo durante el desarrollo sin depender de APIs externas.
- Preprocesamiento en pipelines de datos: convertir descripciones en lenguaje natural de informes recurrentes a consultas parametrizables que alimenten un orquestador tipo Airflow.
- Evaluacion comparativa y docencia: por su tamano y su licencia Apache 2.0, sirve como referencia reproducible de ajuste fino con LoRA y Unsloth, con el codigo de entrenamiento y los puntos de control documentados.
- Filtrado o generacion de consultas en entornos de solo lectura: al restringirse a una unica sentencia y a una sola tabla, encaja en flujos donde se valida la consulta antes de ejecutarla contra un snapshot de datos.
- Chatbot interno sobre catalogos de datos pequenos: cuando el esquema cabe en pocos cientos de tokens, el modelo responde en un unico turno con la consulta final, simplificando la integracion conversacional.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de `b-mc2/sql-create-context` (300 consultas retenidas). El exact match se calcula sobre AST normalizado con `sqlglot`, no sobre cadenas literales; ambos modelos pasaron por la misma limpieza de salida (retirada de vallas de markdown, prosa inicial eliminada y primera sentencia conservada). Los resultados no estan verificados de forma independiente (`verified: false`).

| Modelo | Exact match (AST) | SQL valido | Token F1 | Media de caracteres de salida |
|---|---|---|---|---|
| unsloth/Qwen2.5-3B-Instruct (base) | 7,7% | 98,7% | 83,1 | 75 |
| qwen2.5-3b-text2sql | 74,3% | 100,0% | 97,5 | 75 |

Desglose por consulta (300 consultas):

| Resultado | Numero de consultas |
|---|---|
| Correctas en ambos modelos | 22 |
| Solo correctas en este modelo | 201 |
| Solo correctas en el modelo base | 1 |
| Incorrectas en ambos | 76 |

La progresion se midio en tres puntos: sin entrenar, paso 150 y paso 500. No se han publicado en la informacion disponible resultados en MMLU, HumanEval, GSM8K ni en otros benchmarks generales.

## Requisitos de hardware

- Pesos en FP16: aproximadamente 6,2 GB solo para los parametros (el repositorio ocupa 6,3 GB), mas la cache KV; en la practica requiere del orden de 7-8 GB de VRAM para inferencia comoda.
- Cuantizacion a INT8: alrededor de 3,5 GB de VRAM.
- Cuantizacion a INT4 (por ejemplo GGUF Q4_K_M): del orden de 2 GB de VRAM.
- GPUs de servidor: A100, H100, L40S o cualquier GPU con 16 GB o mas sirven el modelo en FP16 sin problemas; una T4 de 15 GB fue suficiente para el entrenamiento con LoRA.
- GPU de consumo: cabe en FP16 en tarjetas con 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070), y en 4 bits en GPUs de 4-6 GB.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (uso documentado por el autor), vLLM, Text Generation Inference y `llama.cpp`/Ollama tras convertir los pesos a GGUF. El modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput: no disponible en la informacion proporcionada. La decodificacion greedy es la recomendada, lo que reduce la latencia frente al muestreo al no requerir busquedas alternativas.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos con otros modelos de text-to-SQL en la informacion proporcionada, por lo que la unica comparacion con datos es contra el modelo base.

| Modelo | Parametros | Contexto | Licencia | Exact match (AST) en sql-create-context | Formato |
|---|---|---|---|---|---|
| qwen2.5-3b-text2sql | 3,1B | 32.768 tokens (ajuste a 512) | apache-2.0 | 74,3% | safetensors FP16 |
| unsloth/Qwen2.5-3B-Instruct | 3,1B | 32.768 tokens | apache-2.0 | 7,7% | safetensors FP16 |
| Qwen2.5-Coder-3B-Instruct | no disponible | no disponible | apache-2.0 | no disponible | safetensors |
| Modelos especializados de text-to-SQL de mayor tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con el modelo base es la mas significativa: la diferencia de 66,6 puntos de exact match se atribuye a la correccion del formato de salida y al condicionamiento al esquema, no a la adquisicion de conocimiento nuevo.

## Limitaciones y advertencias

- Esquemas sinteticos de una sola tabla: el dataset `sql-create-context` empareja un unico `CREATE TABLE` con una pregunta, por lo que no cubre joins entre tablas, CTEs ni vistas.
- No hay resultados documentados sobre esquemas de produccion reales; el rendimiento en bases de datos con decenas de tablas o columnas ambiguas es desconocido.
- El modelo esta etiquetado solo para ingles (`en`); las preguntas en castellano no estan soportadas explicitamente.
- Riesgo de alucinacion de identificadores: la decodificacion por muestreo genera nombres de columna y tabla que no existen en el esquema, segun advierte el propio autor; hay que usar decodificacion greedy.
- La metrica de exact match no ha sido verificada de forma independiente (`verified: false`) y procede del propio autor del modelo.
- El rendimiento se midio sobre 300 consultas retenidas, un tamano de muestra reducido; los intervalos de confianza no se publican.
- Los pesos son FP16 con licencia Apache 2.0, lo que permite uso comercial, pero no se ofrece ninguna garantia sobre la correccion del SQL generado en produccion. Es imprescindible validar y sanear las consultas antes de ejecutarlas contra sistemas reales.
- El autor indica que un intento previo de destilar razonamiento sobre Llama-3.2-3B degradо el rendimiento en matematicas, lo que sugiere que este ajuste es estrecho y puede degradar capacidades generales del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/emonHasan01/qwen2.5-3b-text2sql
- Perfil del autor en HuggingFace: https://huggingface.co/emonHasan01
- Modelo base: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/b-mc2/sql-create-context
- Plantilla de prompt: https://huggingface.co/emonHasan01/qwen2.5-3b-text2sql/blob/main/prompt_format.json
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- sqlglot (normalizacion de AST): https://github.com/tobymao/sqlglot
- GitHub del autor: https://github.com/Md-Emon-Hasan
- LinkedIn del autor: https://www.linkedin.com/in/md-emon-hasan-695483237/
- Portfolio del autor: https://emonlabs-ai.hitechparks.com/
