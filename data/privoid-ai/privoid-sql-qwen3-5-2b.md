# Privoid-ai/Privoid-SQL-Qwen3.5-2B

## Resumen

Privoid SQL (Qwen3.5-2B) es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-2B, desarrollado por Privoid-ai, especializado en la tarea de text-to-SQL para SQLite. El modelo recibe como entrada un esquema de base de datos SQLite (sentencias CREATE TABLE, opcionalmente con filas de ejemplo en comentarios) junto con una pregunta en lenguaje natural, y devuelve una única consulta SQLite que responde a esa pregunta. Su proposito es resolver el problema de traduccion de lenguaje natural a SQL en el contexto de bases de datos SQLite, un escenario muy comun en aplicaciones ligeras, prototipos y herramientas de analisis embebidas.

El modelo se distribuye como adaptador PEFT (LoRA) sobre el modelo base Qwen3.5-2B, con un tamano de repositorio de aproximadamente 0.1 GB, lo que refleja que solo se publican los pesos del adaptador y no el modelo completo. Los pesos del modelo base deben obtenerse por separado. Adicionalmente, el autor publica una version en formato GGUF en un repositorio separado para su uso con llama.cpp.

La relevancia de este modelo radica en su enfoque acotado: en lugar de competir en capacidades generales, se centra en una tarea concreta y reporta una mejora sustancial en precision de ejecucion sobre el modelo base en el conjunto de validacion de Spider (del 53.5% al 72.0%), con un coste de entrenamiento muy bajo (240 actualizaciones en 39.3 minutos en una unica GPU NVIDIA L4). Esto lo hace interesante como ejemplo de ajuste fino eficiente para tareas de nicho y como herramienta practica para generar consultas SQLite.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-2B) con adaptador LoRA (r=16, alpha=32) sobre capas de atencion lineal, atencion y MLP |
| Parametros totales | No disponible (el adaptador LoRA se publica sobre un modelo base de 2B; el numero exacto de parametros del modelo base no se especifica en la informacion disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; se publica una version GGUF (incluye al menos Q8_0 segun el ejemplo de uso con llama.cpp) |
| Idiomas soportados | No disponible |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo es un ajuste fino con LoRA del modelo base Qwen/Qwen3.5-2B (revision `15852e8c`). El adaptador LoRA tiene rango r=16 y alpha=32, y se aplica sobre las capas de atencion lineal, atencion y MLP del modelo base. El entrenamiento se realizo en una unica GPU NVIDIA L4 durante 39.3 minutos, con 240 actualizaciones y una perdida de entrenamiento que descendio de 0.589 a 0.152. El entrenamiento se detuvo por limite de tiempo, por lo que solo se procesaron 240 de 518 lotes, es decir, aproximadamente el 46% del conjunto de entrenamiento, una sola vez.

El conjunto de entrenamiento combina 6918 filas de Spider train (con esquemas y dos filas de ejemplo por tabla) y 3150 filas del dataset sintetico Gretel text-to-SQL, conservando unicamente aquellas que se ejecutan correctamente en SQLite. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre pares pregunta-consulta SQL. La innovacion tecnica principal es el enfoque acotado a SQLite y la inclusion de filas de ejemplo en los comentarios del esquema, ademas de la desactivacion del modo thinking (`enable_thinking=False`) para obtener respuestas directas de una sola consulta.

## Capacidades

- Generacion de consultas SQLite a partir de un esquema de base de datos y una pregunta en lenguaje natural.
- Acepta esquemas con sentencias CREATE TABLE y, opcionalmente, filas de ejemplo incluidas en comentarios `/* */`.
- Devuelve una unica consulta SQLite por respuesta, sin explicaciones adicionales.
- Modo thinking desactivable (`enable_thinking=False`), recomendado para este caso de uso.
- Soporte de ejecucion mediante llama.cpp con plantilla Jinja (`--jinja`) y paso de `chat_template_kwargs`.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling, function calling, agentes y multi-step reasoning: no disponibles en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponibles en la informacion proporcionada.

## Casos de uso

- Generacion de consultas en aplicaciones con SQLite embebido: el modelo traduce preguntas de usuario a consultas SQLite directamente sobre el esquema de la base de datos local, adecuado para aplicaciones de escritorio, moviles o herramientas de analisis que usan SQLite como motor de almacenamiento.
- Asistentes de analisis de datos para pequenos equipos: un usuario sin conocimientos de SQL puede formular preguntas en lenguaje natural sobre una base de datos SQLite y obtener la consulta correspondiente para ejecutarla y revisar los resultados.
- Prototipado rapido de interfaces de consulta: al requerir solo un adaptador LoRA de ~0.1 GB y una GPU modesta (se entreno en una L4), es viable desplegarlo en entornos de desarrollo para validar flujos de text-to-SQL antes de invertir en modelos mayores.
- Generacion asistida de consultas en herramientas de BI ligeras: el modelo puede integrarse como paso previo a la ejecucion de consultas en paneles o dashboards que operan sobre SQLite, con revision humana de la consulta generada antes de ejecutarla.
- Educacion y formacion en SQL: dado un esquema de ejemplo, el modelo produce consultas que pueden usarse como referencia o punto de partida para explicar como se construye una consulta SQLite a partir de un enunciado.
- Automatizacion de tareas de extraccion de datos en pipelines internos: para bases de datos SQLite de configuracion o analisis, el modelo puede generar consultas de seleccion que alimenten scripts de procesamiento, siempre con acceso de solo lectura a la base de datos.
- Evaluacion comparativa de tecnicas de ajuste fino: por su bajo coste de entrenamiento (39.3 minutos en una L4) y su mejora medida en Spider dev, sirve como referencia para estudiar el impacto de LoRA en tareas de text-to-SQL acotadas.

## Benchmarks y rendimiento

Resultados reportados por el autor en el conjunto de validacion de Spider (execution accuracy), con el mismo prompt y decodificacion greedy, con thinking desactivado:

| Modelo | Resultados correctos | Consulta ejecutada sin error |
|---|---|---|
| Qwen3.5-2B (base) | 53.5% (553/1034) | 82.1% |
| Privoid SQL | 72.0% (744/1034) | 93.7% |

Notas del autor: todas las preguntas del conjunto Spider dev cuya consulta de referencia se ejecuta correctamente sobre las bases de datos SQLite reales; ninguna de estas bases de datos se uso en entrenamiento. Una consulta se considera correcta cuando sus filas de resultado coinciden con las de la consulta de referencia; el orden solo cuenta cuando la referencia usa `ORDER BY`. El ajuste fino corrigio 254 preguntas que el modelo base fallaba y rompio 63 que el modelo base acertaba. El autor advierte que esta comprobacion es mas simple que la evaluacion oficial con test-suite de Spider, por lo que los numeros no son directamente comparables con la tabla de clasificacion oficial de Spider. Los resultados por pregunta estan en `benchmark/results.json` del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Al tratarse de un modelo base de 2B parametros, la VRAM dependera de la cuantizacion; la version GGUF Q8_0 mencionada en el ejemplo de uso con llama.cpp requiere aproximadamente 2-3 GB, aunque este dato no se confirma en la model card.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo en una NVIDIA L4, lo que sugiere que el modelo es ligero, pero no se especifican GPU recomendadas para inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamano del modelo base (2B), es plausible que quepa en GPU de consumo, pero no se aporta dato verificado.
- Opciones de despliegue: llama.cpp mediante `llama-server -m Privoid-SQL-Qwen3.5-2B-Q8_0.gguf --jinja` con `chat_template_kwargs: {"enable_thinking": false}`. Otras opciones como vLLM, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. La unica comparacion disponible es con el modelo base Qwen3.5-2B, recogida en la seccion de benchmarks:

| Modelo | Parametros | Contexto | Spider dev (execution accuracy) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid SQL (Qwen3.5-2B) | Adaptador LoRA sobre base de 2B | No disponible | 72.0% | CC BY-SA 4.0 | HuggingFace (adaptador y GGUF) |
| Qwen3.5-2B (base) | 2B | No disponible | 53.5% | Apache-2.0 | HuggingFace |
| Otros modelos text-to-SQL | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo SQLite: el modelo no ha sido probado en otros dialectos SQL ni con esquemas muy grandes.
- Devuelve una unica consulta por respuesta, sin explicaciones ni desglose.
- Puede devolver consultas que se ejecutan sin error pero responden a una pregunta ligeramente distinta; el autor recomienda verificar los resultados antes de confiar en ellos.
- Se debe ejecutar el SQL generado con acceso de solo lectura a la base de datos para evitar modificaciones no deseadas.
- El entrenamiento se detuvo por limite de tiempo tras procesar aproximadamente el 46% del conjunto de entrenamiento una sola vez, lo que puede dejar margen de mejora.
- Sesgos conocidos: no disponibles en la informacion proporcionada. Al entrenarse con Spider y Gretel synthetic text-to-SQL, puede heredar sesgos de esos datasets.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el autor advierte de consultas sintacticamente validas pero semanticamente incorrectas.
- Restricciones de licencia: CC BY-SA 4.0, derivada de que los datos de entrenamiento incluyen Spider (CC BY-SA 4.0). Esto implica obligaciones de compartir bajo la misma licencia las obras derivadas; revisar compatibilidad para uso comercial.
- Idiomas soportados: no disponibles; no se confirma el soporte multilingue.
- La evaluacion reportada es mas simple que la evaluacion oficial con test-suite de Spider, por lo que no es directamente comparable con la tabla de clasificacion oficial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Privoid-ai/Privoid-SQL-Qwen3.5-2B
- Version GGUF: https://huggingface.co/Privoid-ai/Privoid-SQL-Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Dataset Spider: https://yale-lily.github.io/spider
- Dataset Spider (re-host de bases de datos): https://huggingface.co/datasets/HAL-9001/spider-databases
- Dataset Gretel synthetic text-to-SQL: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
