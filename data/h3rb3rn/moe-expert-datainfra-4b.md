# h3rb3rn/moe-expert-datainfra-4b

## Resumen

`moe-expert-datainfra-4b` es un modelo de lenguaje pequeño (SLM) de 4 mil millones de parámetros, especializado en ingeniería de datos, optimización de consultas SQL analíticas y gestión de infraestructura de bases de datos. Ha sido desarrollado por el autor h3rb3rn como parte de la arquitectura compuesta "MoE Sovereign", donde actúa como experto en infraestructura de datos. El modelo se ha obtenido mediante destilación de los modelos DeepSeek-V3 y Qwen2.5-72B-Instruct, utilizando el supercomputador LUMI-G con 8 GPU AMD Instinct MI250X de 128 GB cada una.

La arquitectura base es Qwen3.5-4B, un modelo híbrido que combina atención lineal y capas Mamba, lo que permite un procesamiento eficiente de secuencias largas. El modelo está optimizado para tareas de alta precisión en SQL, incluyendo PostgreSQL, DuckDB y ClickHouse, con capacidades como diagnóstico de planes de ejecución, recomendación de índices y migraciones de esquema sin tiempo de inactividad. Su relevancia radica en que aborda un dominio donde la verificación objetiva (validación de sintaxis, ejecución de `EXPLAIN ANALYZE`, rollback de migraciones) permite un ajuste fino orientado a resultados medibles.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y GGUF (cuantizaciones Q4_K_M y Q8_0), y soporta los idiomas inglés y alemán.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención lineal + Mamba (base Qwen3.5-4B) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en, de |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, que combina atención lineal con capas Mamba, un diseño híbrido que reduce el coste computacional frente a la atención completa y permite manejar contextos largos de forma eficiente. Sobre esta base se ha aplicado un proceso de destilación desde dos modelos maestros: DeepSeek-V3 y Qwen2.5-72B-Instruct. El entrenamiento se realizó en el supercomputador LUMI-G con 8 GPU AMD Instinct MI250X de 128 GB, utilizando DeepSpeed ZeRO-2, ROCm 7.0 y PyTorch 2.6.

El conjunto de datos de entrenamiento (SFT) contiene 33.200 trayectorias de ingeniería de bases de datos validadas mediante ejecución real contra motores PostgreSQL, DuckDB y ClickHouse. Se empleó LoRA con rango r=16 y alpha=32, aplicado a los módulos q, k, v, o, gate, up y down. El entrenamiento se realizó durante 3 épocas con un tamaño de lote efectivo de 128 (micro-lote 4 × 8 GPUs × acumulación de gradientes 4). Tras el entrenamiento, los adaptadores LoRA se fusionaron en CPU en BF16 y se exportaron a GGUF con cuantizaciones Q4_K_M y Q8_0.

## Capacidades

- Generación de SQL analítico y relacional complejo: CTEs, funciones de ventana (LEAD, LAG, DENSE_RANK), agregaciones analíticas para PostgreSQL, DuckDB y ClickHouse.
- Diagnóstico de planes de consulta: identifica escaneos secuenciales, derrames de hash join, cuellos de botella en bitmap heap scan y sugiere índices compuestos o de cobertura.
- Migraciones de esquema deterministas: genera DDL compatible con versiones anteriores, como `ADD COLUMN ... DEFAULT` sin bloqueos exclusivos de tabla, y creación concurrente de índices.
- Dimensionamiento de infraestructura de datos: calcula asignaciones de memoria para `work_mem`, `shared_buffers` y claves de particionado de almacenamiento.
- Soporte de tool calling: no se menciona explícitamente, pero el modelo está diseñado para integrarse en pipelines de ejecución de consultas.
- Multilingüe limitado: inglés y alemán.
- Modo de razonamiento: no se especifica un modo de pensamiento explícito, pero la destilación de modelos grandes sugiere capacidades de razonamiento multi-paso.

## Casos de uso

- Optimización de consultas lentas en producción: el modelo analiza el plan de ejecución de una consulta PostgreSQL mediante `EXPLAIN (ANALYZE, BUFFERS)` y sugiere reescrituras o índices que reducen el coste medido en lecturas de buffer.
- Generación de informes analíticos en DuckDB: permite crear consultas que aprovechan el escaneo de archivos Parquet y funciones específicas de OLAP, reduciendo el tiempo de desarrollo.
- Migraciones de esquema sin tiempo de inactividad: genera scripts DDL que utilizan `CREATE INDEX CONCURRENTLY` y `ADD CONSTRAINT ... NOT VALID` seguido de `VALIDATE CONSTRAINT`, evitando bloqueos de tabla en entornos de alta disponibilidad.
- Recomendación de índices para cargas de trabajo mixtas: a partir de un esquema y un conjunto de consultas frecuentes, el modelo propone índices compuestos con cláusulas `INCLUDE` para cubrir consultas sin acceder a la tabla.
- Dimensionamiento de recursos de base de datos: ayuda a calcular valores adecuados para `work_mem` y `shared_buffers` según el tamaño del dataset y el tipo de consultas, mejorando el rendimiento global.
- Automatización de pipelines de integración continua: el modelo puede integrarse en un pipeline CI/CD para validar que los cambios de esquema son compatibles y que las consultas nuevas pasan pruebas de ejecución contra una base de datos de prueba.
- Soporte técnico especializado: como asistente para administradores de bases de datos, proporciona respuestas concretas sobre sintaxis SQL específica de cada motor y estrategias de particionado.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre un conjunto de pruebas de 1.000 tareas de infraestructura de datos y optimización SQL, ejecutadas contra PostgreSQL 16, DuckDB 1.1 y ClickHouse 24.8, con temperatura 0.05 y 3 semillas independientes. Los resultados comparan el modelo destilado con el modelo base Qwen 3.5 4B:

| Metrica | Qwen 3.5 4B base | moe-expert-datainfra-4b | Delta |
|---|---|---|---|
| Validez de sintaxis SQL (multi-dialecto) | 76,4 % | 99,2 % | +22,8 % |
| Tasa de SQL ejecutable (compatible con esquema) | 69,1 % | 96,8 % | +27,7 % |
| Tasa de victoria en optimizacion de planes | 48,3 % | 89,4 % | +41,1 % |
| Precision en recomendacion de indices | 58,0 % | 95,2 % | +37,2 % |
| Invariantes de migracion de esquema seguras | 54,2 % | 97,6 % | +43,4 % |
| Correccion en funciones de ventana analiticas | 62,5 % | 93,8 % | +31,3 % |

No se proporcionan resultados de benchmarks estándar como MMLU o HumanEval en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (aproximadamente 4 bits por peso), el modelo ocupa alrededor de 2,5 GB de memoria, por lo que cabe en GPUs con 4 GB o más. Con Q8_0, el uso de memoria sube a unos 4,5 GB, requiriendo al menos 6 GB de VRAM.
- GPU recomendadas: para ejecucion local en consumer, una RTX 3060 (12 GB) o superior es suficiente. Para despliegue en servidor, una A10G o A100 (40 GB) permite ejecutar multiples instancias o lotes grandes.
- Compatibilidad con consumer GPU: sí, el modelo puede ejecutarse en GPUs de gama media como RTX 3060, RTX 4060 Ti o similares gracias a su tamaño reducido y cuantizaciones GGUF.
- Opciones de despliegue: al estar disponible en formato GGUF, puede usarse con llama.cpp, Ollama, LM Studio o vLLM (con adaptacion). Tambien es compatible con el ecosistema transformers de HuggingFace.
- Latencia y throughput estimados: no se han publicado datos especificos. En una RTX 4090, se espera una generacion de 50-100 tokens/segundo con Q4_K_M, aunque depende de la longitud de la secuencia.

## Comparativa con modelos similares

El modelo se compara directamente con su base, Qwen3.5-4B, y con los modelos maestros de los que se destila, aunque estos ultimos tienen un tamano muy superior. No se dispone de datos de otros modelos especializados en SQL del mismo tamano para una comparativa directa.

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| moe-expert-datainfra-4b | 4,2 B | no disponible | SQL, PostgreSQL, DuckDB, ClickHouse, migraciones | Apache-2.0 |
| Qwen3.5-4B (base) | 4,2 B | no disponible | Generico | Apache-2.0 |
| DeepSeek-V3 (maestro) | 671 B (MoE) | 128 K | Generico y codigo | MIT |
| Qwen2.5-72B-Instruct (maestro) | 72 B | 128 K | Generico e instructivo | Apache-2.0 |

El modelo destilado supera claramente a su base en las tareas especializadas, como se muestra en la tabla de benchmarks. No hay alternativas de tamano similar con el mismo enfoque en la informacion disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo especializado, puede generar SQL sintacticamente correcto pero semanticamente incorrecto en casos limite no cubiertos por el dataset de entrenamiento. Se recomienda validar siempre las consultas generadas en un entorno de pruebas.
- Limitaciones de idioma: solo soporta ingles y aleman. No se ha entrenado para otros idiomas, por lo que las consultas o instrucciones en espanol, frances, etc. pueden producir resultados degradados.
- Contexto limitado: no se ha especificado la longitud de contexto soportada. Dado que la arquitectura híbrida con Mamba suele manejar contextos largos, pero sin dato oficial, se debe asumir un limite conservador.
- Dependencia de la validacion: el modelo esta optimizado para tareas verificables, pero no garantiza que todas las sugerencias de optimizacion sean correctas en entornos de produccion con datos y cargas especificas.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener la atribucion correspondiente.
- Despliegue: el modelo requiere un motor compatible con GGUF o transformers. No se ha probado en todos los frameworks, por lo que se recomienda verificar la compatibilidad antes de usar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/h3rb3rn/moe-expert-datainfra-4b
- Dataset de entrenamiento: https://huggingface.co/datasets/moe-sovereign/expert-datainfra-sft (mencionado en la model card, no se proporciona URL directa)
- Supercomputador LUMI-G: https://www.lumi-supercomputer.eu/
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B (referenciado en la model card)
