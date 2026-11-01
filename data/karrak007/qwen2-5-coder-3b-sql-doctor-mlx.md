# KarRak007/qwen2.5-coder-3b-sql-doctor-mlx

## Resumen

`qwen2.5-coder-3b-sql-doctor-mlx` es un modelo de lenguaje pequeno (SLM) especializado en diagnostico de rendimiento de consultas SQL, reescritura de queries y recomendacion de indices, desarrollado por Kartik Raktate (KarRak007) mediante fine-tuning de `mlx-community/Qwen2.5-Coder-3B-Instruct-4bit`. El objetivo declarado por el autor es ofrecer un "DBA senior en local": analizar consultas lentas y esquemas de tablas sin enviar informacion sensible a servicios en la nube, algo relevante para entornos empresariales con esquemas y logica de negocio confidenciales.

El modelo parte de la arquitectura Qwen 2.5 Coder de 3B parametros (3.085.938.688 parametros segun los pesos en safetensors) y se distribuye cuantizado a 4 bits en formato MLX, con un peso aproximado de 1,7 GB en el repositorio. El fine-tuning se realizo con adaptadores LoRA sobre atencion y MLP (r=8, alpha=16), manteniendo una ventana de contexto de 32.768 tokens.

Su relevancia actual radica en el nicho: ejecucion 100% offline sobre Apple Silicon mediante el framework MLX, con una huella de memoria de aproximadamente 2,1 GB en memoria unificada. Esta pensado para integrarse en herramientas CLI, IDEs locales y pipelines de CI/CD sin dependencia de API externas, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen 2.5 Coder 3B Instruct), fine-tuning con LoRA |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | 4-bit INT4 group-wise (unico formato publicado) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), cuantizacion 4-bit |
| Capas entrenadas | LoRA en atencion y MLP (r=8, alpha=16) |
| Framework de inferencia | Apple MLX (`mlx-lm`) |
| Huella de memoria | ~2,1 GB en memoria unificada |
| Dialectos SQL | PostgreSQL, MySQL, ANSI SQL |
| Tamano del repositorio | 1,7 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen 2.5 Coder 3B Instruct, un modelo base entrenado por Alibaba para generacion de codigo. Sobre esa base, el autor aplico un fine-tuning con adaptadores LoRA (r=8, alpha=16) en las capas de atencion y MLP, partiendo de la version ya cuantizada a 4 bits de `mlx-community/Qwen2.5-Coder-3B-Instruct-4bit`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset de fine-tuning ni si se emplearon tecnicas de RLHF o DPO adicionales.

La innovacion principal no es arquitectonica sino de despliegue: la cuantizacion group-wise a INT4 junto con el framework MLX permite ejecutar el modelo en memoria unificada de Apple Silicon con aceleracion Metal, manteniendo la ventana de contexto completa de 32.768 tokens. El modelo esta orientado a generar salidas estructuradas en tres bloques fijos: diagnostico de causa raiz, query optimizada y DDL de indice recomendado (`CREATE INDEX CONCURRENTLY ...` para PostgreSQL o MySQL).

## Capacidades

- Generacion de texto tecnico estructurado en formato de informe (diagnostico, query optimizada, indice recomendado).
- Diagnostico de causas de lentitud en consultas SQL: escaneos secuenciales, spills de memoria, cuellos de botella de CPU.
- Reescritura de consultas para eliminar antipatrones: `SELECT *`, subconsultas sin indice, funciones aplicadas sobre columnas indexadas.
- Recomendacion de indices, incluyendo indices GIN con `pg_trgm` para busquedas `LIKE` con comodin inicial en PostgreSQL.
- Soporte de dialectos PostgreSQL, MySQL y ANSI SQL.
- Conversacion multi-turno mediante plantilla de chat (rol system/user).
- Capacidades de generacion de codigo heredadas del modelo base Qwen 2.5 Coder.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo thinking explicito: no disponible.

## Casos de uso

- Revision de consultas en CLI de desarrollo: el modelo se integra en la herramienta `sql-doctor` para analizar una query y su esquema desde la terminal, devolviendo diagnostico, reescritura y DDL de indice sin salir del entorno local.
- Diagnostico offline en entornos con datos sensibles: equipos con esquemas de produccion confidenciales pueden analizar consultas sin enviarlas a APIs de terceros, cumpliendo requisitos de compliance y evitando costes recurrentes de API.
- Analisis en pipelines de CI/CD: dado que corre en local con ~2,1 GB de memoria, puede incorporarse como paso de validacion que detecte antipatrones SQL en migraciones o consultas nuevas antes de desplegar.
- Asistencia en IDEs locales: extensiones o plugins en macOS pueden invocar el modelo via `mlx-lm` para sugerir indices y reescrituras mientras el desarrollador edita SQL, con latencia baja gracias a la aceleracion Metal.
- Formacion y revision de codigo: revisar consultas heredadas de sistemas legacy y obtener explicaciones de por que un plan de ejecucion es ineficiente, util para onboarding de desarrolladores en equipos de datos.
- Optimizacion de busquedas con `LIKE`: el modelo propone soluciones concretas como extensiones `pg_trgm` e indices GIN para patrones con comodin inicial, un caso frecuente en tablas de logs y auditoria.
- Estandarizacion de practicas SQL: usar el modelo como revisor consistente en revisiones de codigo para aplicar reglas de optimizacion de forma uniforme en el equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un ejemplo cualitativo de evaluacion (consulta sobre `audit_logs` con `LIKE '%login_failed%'`), pero no cifras de MMLU, HumanEval, GSM8K ni metricas especificas de optimizacion SQL.

## Requisitos de hardware

- VRAM / memoria unificada estimada: ~2,1 GB segun el autor (formato 4-bit INT4).
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con memoria unificada; el modelo usa MLX y aceleracion Metal.
- GPU NVIDIA (A100, H100, RTX 4090): no soportadas de forma nativa por este artefacto, que esta en formato MLX; seria necesario convertir los pesos a otro formato.
- Cabe en cualquier Mac con Apple Silicon con al menos 8 GB de memoria unificada, dado el peso de 1,7 GB del repositorio y los ~2,1 GB de huella declarada.
- Opciones de despliegue: `mlx-lm` (Python), `python3 -m mlx_lm.chat` para chat interactivo en terminal. vLLM, llama.cpp, Ollama y TGI no estan soportados por este formato sin conversion previa.
- Latencia: el autor declara "sub-second latency" y generacion de tokens "instantanea" mediante Metal, sin cifras concretas de throughput (tokens/s) ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| qwen2.5-coder-3b-sql-doctor-mlx | 3,09 B | 32.768 | 4-bit INT4 (MLX) | Apache 2.0 | SQL doctor, offline en Apple Silicon |
| Qwen2.5-Coder-3B-Instruct (base) | 3,09 B | 32.768 | multi (incl. GGUF, safetensors) | Apache 2.0 | Codigo general |
| Modelos SQL especializados de mayor tamano | no disponible | no disponible | no disponible | no disponible | Optimizacion SQL |

El modelo base Qwen2.5-Coder-3B-Instruct es la alternativa directa cuando no se necesita la especializacion en SQL ni el formato MLX; ofrece la misma ventana de contexto y licencia, con mayor disponibilidad de formatos de despliegue. No se dispone de datos de benchmarks comparativos entre este fine-tuning y alternativas especializadas en SQL.

## Limitaciones y advertencias

- El modelo solo declara soporte de ingles; las respuestas en castellano u otros idiomas no estan garantizadas.
- Al ser un fine-tuning de 3B parametros, la precision en esquemas SQL complejos, joins multiples o dialectos exoticos puede ser limitada en comparacion con modelos mayores.
- Riesgo de alucinacion en nombres de columnas, tipos de datos o sintaxis DDL no presentes en el esquema de entrada; las recomendaciones de indices deben validarse antes de ejecutarlas en produccion.
- El DDL recomendado incluye `CREATE INDEX CONCURRENTLY`, que puede fallar o comportarse de forma distinta segun la version y el motor; requiere revision humana.
- El artefacto esta en formato MLX y cuantizado a 4 bits: no es directamente utilizable en GPUs NVIDIA ni en frameworks como vLLM o llama.cpp sin conversion.
- La cuantizacion 4-bit puede degradar la calidad respecto al modelo base en tareas fuera del dominio SQL.
- No hay informacion publicada sobre sesgos, datos de entrenamiento del fine-tuning ni evaluaciones cuantitativas; el modelo tiene 0 descargas y 1 like en el momento de la consulta, lo que indica un artefacto reciente y poco validado por la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen 2.5 Coder antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KarRak007/qwen2.5-coder-3b-sql-doctor-mlx
- Perfil del autor: https://huggingface.co/KarRak007
- Modelo base: https://huggingface.co/mlx-community/Qwen2.5-Coder-3B-Instruct-4bit
- Framework MLX: https://github.com/ml-explore/mlx
- Libreria `mlx-lm`: no disponible (enlace no incluido en la informacion proporcionada)
- Repositorio de la herramienta `sql-doctor`: no disponible (enlace no incluido en la informacion proporcionada)
