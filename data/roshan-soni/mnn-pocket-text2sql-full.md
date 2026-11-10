# roshan-soni/mnn-pocket-text2sql-full

## Resumen

MNN-Pocket-0.3B-Text2SQL es un modelo de lenguaje causal de 302,8 millones de parámetros, ajustado específicamente para la tarea de traducción de lenguaje natural a SQL (text-to-SQL). Lo desarrolla el usuario de Hugging Face roshan-soni y parte del modelo base `taobao-mnn/MNN-Pocket-0.3B-Base`, un modelo de 0,3B parámetros diseñado por el equipo de Taobao (Alibaba) para despliegue en dispositivos de borde mediante el runtime MNN.

El modelo resuelve un problema acotado y muy concreto: generar consultas SQL de tipo `SELECT` y agregación a partir de una pregunta en inglés, siempre que se le proporcione explícitamente el esquema de la base de datos (sentencias `CREATE TABLE`) en el mensaje de sistema. Su orientación a edge computing lo hace relevante para escenarios donde no hay conectividad o donde la privacidad impide enviar datos a la nube.

La arquitectura es un transformer causal estándar, ajustado mediante QLoRA sobre una base cuantizada en 4 bits con HQQ. El contexto máximo de entrenamiento es de 512 tokens y el modelo solo soporta inglés. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) |
| Parametros totales | 302.830.976 (0,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia en entrenamiento) |
| Tipos de cuantizacion | 4-bit (HQQ, block 64) para exportación a MNN; el checkpoint publicado está en safetensors (bf16/fp16) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); exportable a MNN |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only de 0,3B parámetros, heredado del base `taobao-mnn/MNN-Pocket-0.3B-Base`. El ajuste fino se realizó con QLoRA sobre una base cuantizada en 4 bits con HQQ (Half-Quadratic Quantization), con rango de LoRA 16 y alpha 32. Se entrenaron 7.168.000 de los 65.942.912 parámetros del adaptador (10,87% del total del módulo LoRA), durante 3 épocas, con learning rate 2e-4, batch efectivo de 8 (1 por dispositivo × acumulación de gradiente 8), precisión bf16 y longitud máxima de secuencia de 512 tokens.

Los datos de entrenamiento provienen del dataset `gretelai/synthetic_text_to_sql`, con 100.000 pares sintéticos texto↔SQL repartidos en 100+ dominios, verificados por LLM para corrección y cumplimiento de estándares. Cada ejemplo incluye `sql_prompt` (pregunta en lenguaje natural), `sql_context` (DDL e inserts de ejemplo) y la consulta SQL de referencia. Se usó un split 95.000/5.000 para entrenamiento y validación. El dialecto objetivo es SQLite, tal como lo proporciona el esquema del dataset. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de consultas SQL `SELECT` y de agregación (AVG, COUNT, SUM, GROUP BY, etc.) a partir de preguntas en inglés y un esquema DDL explícito.
- Formato de prompt conversacional con roles system/user/assistant, compatible con `tokenizer.apply_chat_template`.
- Ejecución en dispositivos de borde mediante exportación a MNN con cuantización 4-bit (Android, iOS, Linux embebido).
- Capacidad de razonamiento limitada: funciona bien en consultas con hasta 3–4 joins; pierde precisión con subconsultas anidadas, CTEs múltiples y funciones de ventana complejas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo: solo inglés.

## Casos de uso

- **Asistentes de consulta en aplicaciones móviles offline**: el modelo puede empaquetarse con MNN en una app Android o iOS para que el usuario formule preguntas en inglés sobre una base de datos SQLite local y reciba la consulta SQL generada sin conexión a internet, con la ventaja de que los datos no salen del dispositivo.
- **Generación de SQL en herramientas de BI embebidas**: integrado en un editor de consultas, el modelo traduce preguntas de negocio a SQL para que analistas no técnicos obtengan consultas de agregación sobre tablas conocidas, siempre que la herramienta inyecte el DDL en el mensaje de sistema.
- **Prototipado rápido de pipelines text-to-SQL**: por su tamaño reducido (0,6 GB de repo) y licencia Apache 2.0, sirve como baseline ligero para validar una arquitectura de text-to-SQL antes de invertir en modelos mayores, o como componente de respaldo cuando el modelo principal no está disponible.
- **Sistemas de consulta en dispositivos IoT o embedded Linux**: en entornos industriales o de domótica donde se consultan bases SQLite locales, el modelo puede ejecutarse en CPU con cuantización 4-bit y generar consultas de filtrado o agregación a partir de comandos en lenguaje natural.
- **Educación y demostraciones de text-to-SQL**: su tamaño permite ejecutarlo en portátiles sin GPU dedicada, lo que lo hace útil para talleres, tutoriales y demostraciones de cómo funciona un pipeline text-to-SQL completo (esquema → prompt → SQL → ejecución).
- **Preprocesamiento de consultas en asistentes de voz para bases de datos**: combinado con un motor de reconocimiento de voz en inglés, puede transformar preguntas habladas en consultas SQL ejecutables contra una base SQLite local, útil en quioscos o terminales de consulta sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación está pendiente ("Status: pending") y que se reportará *execution accuracy* sobre el split de validación de 5.000 ejemplos, no BLEU/ROUGE. La tabla de precisión por configuración de decodificación (greedy, beam-4, beam-8) figura como "TBD".

## Requisitos de hardware

- **VRAM estimada para inferencia**: el checkpoint en bf16 ocupa aproximadamente 0,6 GB; en fp16, similar. La inferencia en transformers requiere alrededor de 1–2 GB de VRAM incluyendo overhead de activaciones y caché KV para 512 tokens.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona en RTX 3060, RTX 4060, RTX 4090, A100 y H100 sin problema; en estas últimas el modelo queda sobredimensionado y el cuello de botella será el overhead de lanzamiento de kernels.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años, e incluso en iGPU con memoria unificada.
- **CPU**: es viable en CPU gracias a su tamaño; con cuantización 4-bit vía MNN está pensado para ejecutarse en dispositivos móviles y embebidos.
- **Opciones de despliegue**: transformers (con `trust_remote_code=True`), MNN runtime (exportación con `llmexport.py`, `--quant_bit 4 --quant_block 64 --hqq`). No se mencionan vLLM, llama.cpp, Ollama ni TGI en la documentación; dado el tamaño, llama.cpp u Ollama podrían requerir conversión manual a GGUF no documentada.
- **Latencia y throughput**: no disponibles. La model card no publica mediciones de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-Text2SQL | 0,3B | 512 | inglés | Apache 2.0 | text-to-SQL en edge |
| taobao-mnn/MNN-Pocket-0.3B-Base | 0,3B | no disponible | no disponible | no disponible | modelo base generalista para edge |
| Modelos text-to-SQL de mayor tamaño (p. ej. familias 7B) | 7B+ | 2K–8K típicamente | multilingüe | variable | text-to-SQL en servidor |

La comparación con alternativas de la misma categoría (text-to-SQL de 0,3B optimizados para edge) no está disponible en la información proporcionada. El modelo base del que deriva es la referencia más directa, pero no se han publicado métricas comparativas entre ambos.

## Limitaciones y advertencias

- **Capacidad de razonamiento limitada por tamaño**: con 0,3B parámetros, el modelo falla en subconsultas anidadas, CTEs múltiples y funciones de ventana complejas; la precisión cae bruscamente más allá de 3–4 joins.
- **Esquema obligatorio y explícito**: el modelo no recupera el esquema; hay que inyectar las sentencias `CREATE TABLE` relevantes en el mensaje de sistema. Con esquemas que excedan los 512 tokens, el rendimiento se degrada.
- **Datos de entrenamiento sintéticos**: el dataset `gretelai/synthetic_text_to_sql` es completamente sintético, por lo que la generalización a esquemas empresariales reales (nombres inconsistentes, estructuras heredadas, particularidades de dialecto) puede ser imperfecta.
- **Sesgo hacia SQLite**: el dataset está sesgado hacia el dialecto SQLite; las consultas generadas pueden no ser portables a PostgreSQL, MySQL u otros motores sin revisión.
- **Riesgo de alucinación**: como todo modelo generativo, puede producir columnas o tablas inexistentes o sintaxis inválida; se recomienda validar y ejecutar la SQL generada antes de usarla en producción.
- **Solo inglés**: no soporta preguntas en castellano ni en otros idiomas.
- **Evaluación pendiente**: no hay métricas publicadas de execution accuracy, por lo que no es posible cuantificar su fiabilidad real frente a alternativas.
- **Licencia**: Apache 2.0 permite uso comercial sin restricciones adicionales, pero conviene verificar la licencia del modelo base `taobao-mnn/MNN-Pocket-0.3B-Base` y del dataset de entrenamiento antes de un despliegue comercial.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/roshan-soni/mnn-pocket-text2sql-full
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Runtime MNN: https://github.com/alibaba/MNN
