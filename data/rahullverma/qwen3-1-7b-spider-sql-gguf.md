# rahullverma/qwen3-1.7b-spider-sql-GGUF

## Resumen

`rahullverma/qwen3-1.7b-spider-sql-GGUF` es un ajuste fino de Qwen3-1.7B orientado exclusivamente a la tarea de text-to-SQL sobre el conjunto de datos Spider. Lo desarrolla el usuario independiente rahullverma mediante QLoRA sobre el split de entrenamiento de Spider, fusionando los pesos resultantes y cuantizándolos a GGUF Q4_K_M (1,03 GiB) con llama.cpp build b11600. El entrenamiento se realizó en GPUs T4 gratuitas de Kaggle y el modelo está pensado para servirse en CPU.

El problema que aborda es la traducción de lenguaje natural a consultas SQLite a partir de un esquema relacional proporcionado en el propio prompt. Sobre el dev set de Spider (1.034 preguntas) el ajuste fino eleva la precisión de ejecución del 55,9% del modelo base al 64,7% en fp16, y la versión cuantizada Q4_K_M conserva el 64,3% servida con `llama-server` en CPU, una pérdida de 0,4 puntos no significativa (McNemar p = 0,76).

Su relevancia es acotada pero clara: demuestra que un modelo de 1.720 millones de parámetros, cuantizado a 4 bits y ejecutado en CPU, puede resolver una tarea estructurada concreta con una precisión razonable, sin necesidad de GPU. No es un modelo de propósito general ni multilingüe; es un artefacto especializado con limitaciones explícitas documentadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-1.7B), ajuste fino QLoRA |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (configuracion recomendada de servido); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF Q4_K_M (unico publicado, 1,03 GiB) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only de 1.720 millones de parámetros, y se ajusta mediante QLoRA sobre el split de entrenamiento de Spider (`xlangai/spider`), el benchmark de referencia para text-to-SQL sobre esquemas SQLite. Tras el ajuste, los adaptadores se fusionan con los pesos base y el resultado se convierte a GGUF Q4_K_M con llama.cpp build b11600. El entrenamiento se ejecutó en GPUs T4 gratuitas de Kaggle.

El formato de prompt es ChatML con el modo de razonamiento (thinking) desactivado. El mensaje de sistema fija la instruccion de responder con una unica consulta SQLite, y el mensaje de usuario coloca primero el esquema (`CREATE TABLE ...`) y despues la pregunta. Este orden no es casual: permite que la cache de prompt de `llama-server` reutilice el esquema entre preguntas sucesivas sobre la misma base de datos, reduciendo el coste de prefill. El autor recomienda `temperature 0`, `--parallel 1`, `--ctx-size 2048`, `--cache-ram 1024` y `--flash-attn on`.

## Capacidades

- Generacion de consultas SQLite a partir de un esquema `CREATE TABLE` y una pregunta en ingles.
- Salida restringida a una unica consulta SQL, sin explicaciones ni texto adicional, segun el formato de prompt entrenado.
- Modo thinking desactivado de forma explicita en la plantilla (`<think>\n\n</think>`), lo que evita tokens de razonamiento intermedios.
- Soporte de cache de prompt a nivel de servidor para reutilizar el esquema entre consultas.
- Compatible con endpoints de inferencia estilo OpenAI (`/v1/completions`) via `llama-server`.
- No se documentan capacidades de tool calling, agentes, vision, audio ni multilingues.

## Casos de uso

- Asistente SQL embebido en una herramienta de BI: el usuario escribe una pregunta en ingles sobre una base SQLite y el modelo devuelve la consulta, que se ejecuta con credenciales de solo lectura. El tamano de 1,03 GiB permite distribuirlo junto a la propia aplicacion.
- Generacion de consultas en pipelines de datos sobre SQLite: integrado via `llama-server` con `temperature 0`, produce SQL determinista para transformaciones repetibles sobre esquemas fijos.
- Prototipado de interfaces de consulta en lenguaje natural: util para validar rapidamente la viabilidad de una funcion text-to-SQL antes de invertir en un modelo mayor o en un servicio en la nube.
- Entorno educativo y de investigacion: sirve como referencia reproducible de un pipeline QLoRA + GGUF completo, con codigo de entrenamiento y evaluacion publicado en GitHub.
- Despliegue en hardware sin GPU: al ejecutarse en CPU con llama.cpp, encaja en servidores modestos, portatiles o entornos edge donde no hay acelerador disponible.
- Evaluacion comparativa de cuantizacion: el autor documenta la perdida de precision fp16 frente a Q4_K_M (64,7% frente a 64,3%), lo que lo convierte en un caso de estudio para medir el impacto real de la cuantizacion en tareas estructuradas.
- Generacion de SQL de apoyo con revision humana: dado que aproximadamente una de cada tres respuestas del dev set es incorrecta, encaja en flujos donde la consulta generada se revisa antes de ejecutarse.

## Benchmarks y rendimiento

Precision de ejecucion sobre el dev set de Spider (1.034 preguntas), segun la model card:

| Configuracion | Execution accuracy |
|---|---|
| Qwen3-1.7B base | 55,9% |
| Ajuste fino, fp16 | 64,7% |
| Este archivo (Q4_K_M), servido por llama-server en CPU | 64,3% |

La diferencia entre fp16 y Q4_K_M es de 0,4 puntos, con McNemar p = 0,76, es decir, no estadisticamente significativa. No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el archivo GGUF Q4_K_M ocupa 1,03 GiB y se ejecuta en CPU.
- GPU recomendadas: no aplica para el formato publicado; el autor lo sirve en CPU. Cualquier GPU con al menos 2 GB de memoria podria alojarlo mediante llama.cpp con offload, aunque no se documenta.
- Cabe en GPU de consumo: si, en cualquier GPU con 2 GB o mas de memoria si se usa offload a GPU; el caso documentado es CPU.
- Opciones de despliegue: `llama-server` (llama.cpp) con `--parallel 1 --ctx-size 2048 --cache-ram 1024 --flash-attn on`; tambien compatible con otros runners de llama.cpp y con Ollama, aunque no se documenta explicitamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Spider dev (exec. accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3-1.7B Spider Q4_K_M) | 1,72 B | 2.048 (servido) | 64,3% | Apache 2.0 | GGUF en HF |
| Qwen3-1.7B base | 1,72 B | No disponible | 55,9% | Apache 2.0 | HF |
| Otros ajustes text-to-SQL de 1-2 B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks de modelos alternativos de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente sobre Spider (SQLite, ingles); se espera menor precision en otros dialectos SQL y en esquemas reales desordenados.
- Aproximadamente una de cada tres respuestas del dev set es incorrecta; el autor recomienda revisar el SQL generado antes de ejecutarlo sobre datos relevantes.
- Ejecutar siempre las consultas generadas con credenciales de solo lectura.
- Modelo unicamente en ingles; no soporta otros idiomas.
- Ventana de contexto recomendada de 2.048 tokens, lo que limita el tamano de esquema y pregunta que se pueden pasar en un unico prompt.
- Sin datos publicados sobre sesgos, alucinacion fuera de dominio, tool calling ni capacidades de agente.
- El dataset Spider esta bajo licencia CC BY-SA 4.0, lo que conviene tener en cuenta si se redistribuyen derivados del conjunto de datos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rahullverma/qwen3-1.7b-spider-sql-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Codigo de entrenamiento y evaluacion: https://github.com/Rahulverma5/qwen-inference-optimization
- Dataset Spider: https://huggingface.co/datasets/xlangai/spider
- llama.cpp: https://github.com/ggml-org/llama.cpp
