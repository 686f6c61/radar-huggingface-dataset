# mradermacher/FINER-SQL-0.5B-v2-GGUF

## Resumen

FINER-SQL-0.5B-v2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo thanhdath/FINER-SQL-0.5B-v2, realizadas por el cuantizador mradermacher. El modelo base es un modelo de texto a SQL de tan solo 494 millones de parámetros, entrenado con GRPO (Group Relative Policy Optimization) según las etiquetas del repositorio, y orientado a la generación de consultas SQL a partir de lenguaje natural.

La relevancia de esta ficha radica en el tamaño del modelo: con menos de 500 millones de parámetros, es un candidato claro para ejecución local en hardware muy modesto, incluso sin GPU dedicada. Las cuantizaciones van desde 0,4 GB (Q2_K) hasta 1,1 GB (f16), lo que lo hace viable en portátiles, Raspberry Pi o cualquier máquina con pocos recursos.

Hay que destacar que la model card original del modelo base no está incluida en la información disponible, por lo que muchos detalles técnicos (arquitectura exacta, longitud de contexto, datos de entrenamiento, benchmarks) no están documentados aquí. La información sobre el modelo base es escasa y esta ficha refleja principalmente lo que se sabe del repositorio de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente derivado de Qwen2.5-0.5B, no confirmado) |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (etiquetado "en"; el SQL generado es agnostico al idioma en gran medida) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas; no hay imatrix/weighted quants disponibles) |

## Arquitectura y entrenamiento

La informacion sobre la arquitectura del modelo base es limitada. Por el numero de parametros (494 M) y el uso de GRPO como tecnica de post-entrenamiento, todo apunta a que se trata de un modelo transformer denso derivado de un modelo base pequeño de la familia Qwen (probablemente Qwen2.5-0.5B-Instruct), aunque esto no esta confirmado en la documentacion disponible. El tag "grpo" indica que el modelo fue afinado mediante Group Relative Policy Optimization, una tecnica de aprendizaje por refuerzo usada habitualmente para tareas estructuradas como generacion de codigo y SQL, donde se pueden definir recompensas verificables (por ejemplo, si la consulta generada ejecuta correctamente o devuelve el resultado esperado).

El tag "core-db" sugiere que el entrenamiento se realizo sobre un conjunto de datos o entorno de bases de datos concreto, pero no hay detalles publicados sobre el numero de tokens, la composicion del dataset ni el esquema de recompensas. No se dispone de informacion sobre RLHF clasico, DPO ni otras fases de alineamiento.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural (text-to-sql), su tarea principal.
- Razonamiento estructurado sobre esquemas de bases de datos, afinado con GRPO y recompensas presumiblemente verificables por ejecucion.
- Generacion de texto conversacional basica heredada del modelo base (etiquetado como "conversational"), aunque sin garantias de calidad fuera del dominio SQL.
- No hay evidencia de capacidades multimodales (vision, audio), tool calling ni soporte de agentes en la documentacion disponible.
- Capacidades multilingues: no disponible; el modelo esta etiquetado solo para ingles.

## Casos de uso

- Generacion de SQL para aplicaciones internas: un usuario de negocio puede formular preguntas en lenguaje natural ("ventas del ultimo trimestre por region") y el modelo traduce la peticion a una consulta SQL ejecutable sobre el esquema proporcionado en el prompt.
- Asistentes de datos embebidos en herramientas de BI: dado su tamaño minimo, puede integrarse en aplicaciones de escritorio o dashboards para autocompletar o generar consultas sin depender de APIs externas.
- Ejecucion en dispositivos con recursos limitados: con cuantizaciones de 0,4-0,5 GB, es viable en portatiles sin GPU, mini-PCs o entornos edge donde no cabe un modelo de 7B.
- Prototipado rapido de pipelines text-to-sql: ideal para validar la viabilidad de un asistente SQL en un proyecto antes de invertir en modelos mayores.
- Validacion y educacion: util como baseline ligero para comparar enfoques de text-to-sql o para ensenar como funciona el post-entrenamiento con GRPO en tareas verificables.
- Preprocesado de consultas en sistemas RAG sobre bases de datos: generar la consulta SQL que recupera el contexto antes de pasarlo a un modelo de lenguaje mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye metricas (accuracy de ejecucion SQL, Spider, Bird u otras), y la model card del modelo base no esta incluida en los datos proporcionados.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 0,4 GB (Q2_K) y 1,1 GB (f16) solo de pesos; con contexto y overhead de runtime, basta con 1-2 GB de RAM en las cuantizaciones mas comunes (Q4_K_M ocupa unos 0,5 GB).
- GPU recomendadas: no se necesita GPU dedicada; cualquier GPU moderna lo ejecuta con holgura. En CPU, un procesador moderno de escritorio es suficiente dado el tamaño del modelo.
- Consumer GPUs: cabe sobradamente en cualquier GPU consumer actual (RTX 3060, RTX 4060, RTX 4090, etc.); incluso GPUs integradas pueden manejarlo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, y cualquier runtime compatible con GGUF. El formato original en safetensors puede servirse con transformers o vLLM.
- Latencia y throughput: no disponibles; por tamaño (0,5B parametros), se espera inferencia muy rapida incluso en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| FINER-SQL-0.5B-v2 (base) | 494 M | text-to-sql, afinado con GRPO | apache-2.0 | safetensors y GGUF |
| Qwen2.5-Coder-1.5B | 1.500 M | codigo general (incluye SQL) | Qwen Research / apache-2.0 segun variante | safetensors y GGUF |
| Defog SQLCoder-7B-2 | 7.000 M | text-to-sql especializado | apache-2.0 | safetensors y GGUF |
| Phi-3-mini-4k-instruct | 3.800 M | general, razonable en SQL | MIT | safetensors y GGUF |

FINER-SQL-0.5B-v2 es el mas pequeño del grupo y el unico afinado especificamente con GRPO para text-to-sql a esta escala. A cambio de su tamaño minimo, cabe esperar un rendimiento inferior a SQLCoder-7B-2 en esquemas complejos, pero una ventaja clara en latencia y requisitos de hardware. Sin benchmarks publicados, la comparacion de rendimiento exacta no disponible.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible verificar la calidad de la generacion SQL frente a otros modelos antes de probarlo.
- La model card del modelo base es muy escasa: arquitectura, longitud de contexto, dataset de entrenamiento y esquema de recompensas de GRPO no estan documentados.
- Etiquetado solo para ingles: el rendimiento con prompts en espanol no esta garantizado, aunque el SQL generado en si es independiente del idioma.
- Riesgo de alucinacion tipico de modelos pequeños: puede generar columnas, tablas o sintaxis inexistentes; se recomienda validar siempre las consultas antes de ejecutarlas (especialmente en escritura: DELETE, UPDATE, DROP).
- Cuantizaciones bajas (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en un modelo ya pequeño; se recomiendan Q4_K_M o superiores.
- No hay cuantizaciones imatrix/weighted disponibles en el momento de la ficha.
- Licencia apache-2.0: sin restricciones relevantes para uso comercial, aunque conviene verificar la licencia del modelo base original.
- Para esquemas de bases de datos grandes o complejos, un modelo de 0,5B puede no seguir el contexto del esquema; evaluar con esquemas reales antes de pasar a produccion.

## Enlaces

- Repositorio de cuantizacion GGUF: https://huggingface.co/mradermacher/FINER-SQL-0.5B-v2-GGUF
- Modelo base: https://huggingface.co/thanhdath/FINER-SQL-0.5B-v2
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#FINER-SQL-0.5B-v2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
