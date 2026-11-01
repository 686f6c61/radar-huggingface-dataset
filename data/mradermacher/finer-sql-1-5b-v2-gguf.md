# mradermacher/FINER-SQL-1.5B-v2-GGUF

## Resumen

FINER-SQL-1.5B-v2-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo thanhdath/FINER-SQL-1.5B-v2, realizadas por el cuantizador mradermacher. El modelo base es un modelo de texto a SQL de 1.540 millones de parámetros, entrenado con GRPO (Group Relative Policy Optimization, una técnica de aprendizaje por refuerzo) según los tags del repositorio, y orientado a la generación de consultas SQL a partir de lenguaje natural, con menciones al dataset core-db.

La relevancia de esta ficha radica en el formato: las cuantizaciones GGUF permiten ejecutar el modelo en hardware de consumo, incluso en CPU, mediante llama.cpp, Ollama u otras runtimes compatibles. Con versiones desde 0,8 GB (Q2_K) hasta 3,2 GB (f16), es un candidato para integrar generación de SQL en aplicaciones locales sin depender de APIs externas. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer, según la librería transformers) |
| Parametros totales | 1.543.714.304 (≈1,54 B) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas; el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La informacion publicada sobre la arquitectura del modelo base es escasa. Se trata de un modelo de la familia de los transformers de tamaño 1,5B, derivado de thanhdath/FINER-SQL-1.5B-v2, especializado en tareas de texto a SQL. El tag `grpo` en el repositorio indica que el entrenamiento incorporó GRPO (Group Relative Policy Optimization), un método de ajuste por refuerzo popularizado por el entrenamiento de modelos de razonamiento, que optimiza respuestas comparando grupos de generaciones sin necesidad de un modelo de recompensa entrenado aparte. El tag `core-db` sugiere el uso de un dataset o benchmark de bases de datos relacionales para el ajuste, aunque no hay detalles publicados sobre su composición.

Sobre el número de tokens de entrenamiento, la composición del corpus, el uso de RLHF/DPO adicional u otras innovaciones técnicas (atención lineal, decodificación especulativa, etc.) no hay datos disponibles en la model card. La versión cuantizada de mradermacher no modifica los pesos del modelo: son conversiones estáticas de precisión (k-quants e i-quants) que reducen el tamaño manteniendo la arquitectura original.

## Capacidades

- Generacion de consultas SQL a partir de lenguaje natural (text-to-sql), su tarea principal según los tags del repositorio.
- Ajuste fino mediante GRPO, lo que sugiere optimización por refuerzo de la calidad de las consultas generadas.
- Generacion de texto conversacional (tag `conversational`), aunque su especialización es SQL y el rendimiento en tareas generales puede verse degradado.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el idioma declarado es únicamente el inglés, por lo que las consultas en castellano pueden tener peor rendimiento.
- Capacidades multimodales (visión, audio): no disponibles; es un modelo solo de texto.

## Casos de uso

- Generacion de consultas SQL en herramientas de BI: integración en paneles de análisis donde el usuario formula preguntas en lenguaje natural y el modelo traduce la petición a SQL sobre el esquema de la base de datos.
- Asistentes de datos locales y privados: gracias al formato GGUF y a su tamaño de ~1 GB en Q4_K_M, puede ejecutarse en portátiles o servidores sin GPU, útil en entornos donde los datos no pueden salir de la red local.
- Autocompletado de consultas en IDEs de bases de datos: su baja latencia en hardware modesto lo hace adecuado para sugerencias en tiempo real mientras se escribe una consulta.
- Prototipado rápido de capas text-to-sql: al ser ligero y Apache 2.0, permite validar la viabilidad de un asistente SQL antes de invertir en modelos mayores.
- Agentes de consulta sobre esquemas conocidos: en pipelines donde el esquema se inyecta en el prompt, el modelo puede generar las consultas que un agente posterior ejecuta y verifica.
- Documentación y explicación de esquemas: generación de consultas de ejemplo a partir de definiciones de tablas para documentar APIs de datos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado se limita a describir las conversiones GGUF y no incluye métricas; tampoco la ficha del modelo base aporta datos de evaluación en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: el tamaño del archivo es una buena aproximación. Q2_K ocupa 0,8 GB, Q4_K_M 1,1 GB, Q6_K 1,4 GB, Q8_0 1,7 GB y f16 3,2 GB. Añadiendo el KV cache, cualquier GPU con 4 GB de VRAM o más ejecuta el modelo sin problemas.
- GPU recomendadas: no requiere GPU dedicada. En consumer GPUs funciona sobradamente en una RTX 3060 de 12 GB, RTX 4060 o superior; en servidor, cualquier GPU moderna (A100, L4, T4) ofrece alto throughput para este tamaño.
- CPU: totalmente viable. Con 8 GB de RAM se ejecutan todas las cuantizaciones; con 4 GB bastan las versiones Q2_K a Q4_K_M. Es un caso idóneo para inferencia en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, GPT4All, llama-cpp-python y cualquier runtime compatible con GGUF. El modelo base en safetensors puede desplegarse con vLLM, TGI o transformers.
- Latencia y throughput: no disponibles como cifras publicadas; por tamaño (1,5B) y cuantizaciones de 4 bits, se esperan velocidades altas incluso en CPU de gama media, pero no hay medidas oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Especializacion | Licencia |
|---|---|---|---|---|
| FINER-SQL-1.5B-v2 (este) | 1,54 B | GGUF (0,8–3,2 GB) | text-to-sql con GRPO | Apache 2.0 |
| Qwen2.5-Coder-1.5B | 1,5 B | safetensors / GGUF | codigo general (incluye SQL) | Qwen Research / Apache 2.0 (variantes) |
| SQLCoder-7B (defog) | 7 B | safetensors / GGUF | text-to-sql | CC-BY-SA-4.0 (base) |
| Llama-3.2-1B/3B | 1–3 B | safetensors / GGUF | general | Llama 3.2 Community |

FINER-SQL-1.5B-v2 se sitúa en el extremo ligero de los modelos text-to-sql dedicados: frente a SQLCoder-7B ofrece un tamaño mucho menor y ejecución en CPU a cambio de presumiblemente menor precisión en esquemas complejos. Frente a modelos generales de código de tamaño similar como Qwen2.5-Coder-1.5B, aporta un ajuste específico en SQL mediante GRPO, aunque sin benchmarks publicados no es posible cuantificar la diferencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al tratarse de un modelo ajustado por refuerzo sobre un modelo base de 1,5B, hereda los sesgos de su modelo fundacional, no identificado en la informacion disponible.
- Riesgo de alucinacion: típico y elevado en tareas text-to-sql con modelos pequeños; puede generar columnas, tablas o sintaxis inexistentes. Se recomienda validar siempre las consultas antes de ejecutarlas en producción, idealmente con un verificador de esquema.
- Limitaciones de idioma: el idioma declarado es únicamente el inglés. Consultas en castellano pueden funcionar de forma irregular; conviene evaluarlo antes de usarlo con usuarios hispanohablantes.
- Longitud de contexto: no publicada; esquemas muy grandes pueden no caber en el prompt.
- Restricciones de licencia: Apache 2.0, sin restricciones de uso comercial relevantes. La cuantización de mradermacher mantiene la misma licencia.
- Estas son cuantizaciones estáticas sin imatrix (matriz de importancia); las cuantizaciones ponderadas podrían ofrecer mejor calidad a igual tamaño. En cuantizaciones agresivas (Q2_K, Q3_K_M) la degradación de calidad puede ser significativa en un modelo ya pequeño.
- La model card del modelo base es mínima: faltan detalles de entrenamiento, benchmarks y plantilla de chat, lo que complica su integración correcta.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/FINER-SQL-1.5B-v2-GGUF
- Modelo base: https://huggingface.co/thanhdath/FINER-SQL-1.5B-v2
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#FINER-SQL-1.5B-v2-GGUF
- Guia de uso de GGUF (referenciada en la model card): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuants (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Paper, blog o demo: no disponibles.
