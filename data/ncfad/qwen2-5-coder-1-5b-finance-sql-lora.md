# ncfad/qwen2.5-coder-1.5b-finance-sql-lora

## Resumen

Qwen2.5-Coder-1.5B Finance SQL (LoRA) es un adaptador PEFT de tipo LoRA desarrollado por el usuario ncfad sobre el modelo base Qwen/Qwen2.5-Coder-1.5B-Instruct. Resuelve una tarea muy concreta: la generación de consultas SQL de solo lectura a partir de una pregunta en lenguaje natural y un esquema de base de datos proporcionado en el propio prompt (text-to-SQL con anclaje al esquema). El adaptador se ha afinado específicamente para preguntas de finanzas personales, complementado con datos generales de estructura SQL y de anclaje a esquemas.

El modelo es relevante por su enfoque de bajo coste: se entrenó con QLoRA en una única GPU de portátil (NVIDIA RTX 3050, 4,3 GB) durante 5 horas y 20 minutos, con solo un 1,18% de parámetros entrenables (18,46 millones sobre 1.562 millones). Esto lo convierte en un ejemplo práctico de especialización de un modelo pequeño para una tarea vertical, desplegable en hardware muy modesto.

La arquitectura subyacente es la del transformer decoder-only de Qwen2.5-Coder 1.5B Instruct, con formato de prompt ChatML de Qwen. El adaptador se distribuye en formato safetensors mediante la librería PEFT y está pensado para cargarse sobre el modelo base, no como modelo autónomo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Coder 1.5B Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 1.562.179.072 (modelo base); adaptador LoRA: 18.464.768 parámetros entrenables (1,18%) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (longitud máxima de secuencia en entrenamiento: 512 tokens) |
| Tipos de cuantizacion | Base cuantizado en 4-bit NF4 durante entrenamiento; el adaptador se distribuye en safetensors. Otras cuantizaciones del base: no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | other (no especificada en detalle; ver limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder 1.5B Instruct, un transformer decoder-only. El entrenamiento usó QLoRA con TRL `SFTTrainer` y pérdida de solo completación (completion-only loss): los tokens del prompt se enmascaran y solo se optimizan los tokens SQL. La base se cuantizó en 4-bit NF4 con cómputo en bf16. La configuración LoRA es r=16, alpha=32, dropout 0,05 y target `all-linear`. El entrenamiento usó batch efectivo de 4, una época (2.781 pasos), learning rate 2e-4 con schedule coseno y 3% de warmup, optimizador Paged AdamW 8-bit, longitud máxima de secuencia 512 y semilla 42.

Los datos de entrenamiento combinan tres fuentes: Gretel `synthetic_text_to_sql` en dominio financiero (2.835 filas, repetidas 3 veces para sobremuestrear el dominio objetivo), Spider mediante `GRAST-SQL-Spider` (600 filas, para joins, anidamiento y estructura entre dominios) y WikiSQL desde la release de GitHub de Salesforce con verificación SHA-256 (8.000 filas, para anclaje a esquemas de tabla única). Tras eliminar 309 objetivos que no eran `SELECT` y 4 filas demasiado largas, se usaron 11.122 ejemplos de solo completación. La validación usó 1.976 filas y el split de test financiero de Gretel (72 filas) nunca se usó en entrenamiento. Cuando un esquema excedía el presupuesto de contexto, se priorizaba el DDL de las tablas referenciadas por el SQL objetivo. Se obtuvo una pérdida de validación de 0,1321 y una precisión de token de validación del 95,88%.

## Capacidades

- Generación de sentencias SQL `SELECT` de solo lectura a partir de una pregunta en lenguaje natural y un esquema DDL proporcionado en el prompt.
- Anclaje al esquema: cada ejemplo de entrenamiento llevaba su propio DDL, por lo que el adaptador no está atado a un esquema de demostración concreto.
- Manejo de SQL básico, agregaciones, joins simples y funciones de ventana (con rendimiento desigual, ver benchmarks).
- Formato de prompt ChatML de Qwen mediante `tokenizer.apply_chat_template`, con mensajes de sistema y usuario.
- Capacidades heredadas del base Qwen2.5-Coder 1.5B Instruct (generación de texto, código) en la medida en que el adaptador no las degrade; no evaluadas en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el adaptador está orientado a una única consulta por turno.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Asistente de consultas financieras personales: el modelo recibe el esquema de tablas de gastos, ingresos o presupuestos y una pregunta como "¿cuál es el gasto total por categoría?", devolviendo una consulta `SELECT` ejecutable. Es adecuado por su ajuste específico al dominio financiero con datos Gretel sobremuestreados.
- Generación de SQL en herramientas de BI internas: integrado como paso previo a la ejecución en un motor SQLite o similar, permite a usuarios no técnicos formular preguntas en lenguaje natural sobre sus datos. El anclaje a esquemas arbitrarios vía DDL en el prompt facilita reutilizarlo con distintos esquemas.
- Prototipado rápido en entornos con hardware limitado: al requerir solo una GPU de 4,3 GB para el entrenamiento y ser un adaptador de 18 millones de parámetros, es viable desplegarlo o reentrenarlo en portátiles y estaciones de trabajo modestas.
- Filtro o generador de consultas de solo lectura en pipelines de análisis: al estar entrenado exclusivamente con objetivos `SELECT`, reduce el riesgo de generar sentencias de escritura, lo que encaja en flujos de consulta de solo lectura sobre réplicas de bases de datos.
- Base para investigación en text-to-SQL de bajo coste: sirve como punto de partida reproducible (semilla 42, hiperparámetros documentados, fuentes de datos verificadas) para experimentos de especialización con QLoRA.
- Educación y demostraciones: permite ilustrar cómo un modelo pequeño puede especializarse en una tarea vertical con datos sintéticos y una GPU de consumo, mostrando el flujo completo de prompt con esquema y pregunta.

## Benchmarks y rendimiento

Evaluación sobre el split de test financiero de Gretel (72 ejemplos, de los cuales 48 tienen SQL de referencia ejecutable en su fixture SQLite; los otros 24 se reportan como errores de ejecución del gold y se excluyen del denominador). Decodificación greedy, 256 tokens nuevos.

| Modelo | Exact match | SQL válido | Ejecución (n=48) | Pérdida de test |
|---|---:|---:|---:|---:|
| Qwen2.5-Coder 1.5B base | 12,5% | 62,5% | 52,1% | 0,476 |
| Este adaptador | 22,2% | 68,1% | 56,2% | 0,235 |

Desglose por complejidad (adaptador): SQL básico 30,2% exact match / 57,1% ejecución; agregación 10,0% / 62,5%; join simple 11,1% / 57,1%; funciones de ventana 20,0% / 33,3%; subconsultas y CTEs siguen siendo débiles (sin cifras concretas en la información disponible). El propio autor advierte que el conjunto de test es pequeño y sintético (un ejemplo equivale a unos 2,1 puntos de ejecución) y que las cifras deben tratarse como señal de desarrollo, no como precisión de producción. Exact match es normalización a nivel de token, no equivalencia semántica; SQL válido significa que `EXPLAIN QUERY PLAN` acepta la consulta contra una base solo con esquema.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 1.5B ocupa aproximadamente 3 GB en bf16/fp16 y en torno a 1-1,5 GB en cuantización de 4 bits; el adaptador LoRA añade unos 18,5 millones de parámetros (decenas de MB). Cifras orientativas, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para el base en bf16; el entrenamiento se realizó en una NVIDIA RTX 3050 Laptop (4,3 GB), lo que da una referencia realista del mínimo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3050, RTX 3060, RTX 4060 o superiores; también en cuantizaciones de 4 bits en GPUs con 4 GB o más.
- Opciones de despliegue: carga mediante `transformers` + `peft` (flujo documentado en la model card); para servir el base fusionado o cuantizado podrían usarse vLLM, llama.cpp, Ollama o TGI, aunque no se documentan recetas específicas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada. El entrenamiento completo requirió 5 horas y 20 minutos en una RTX 3050 Laptop.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-Coder 1.5B Instruct) | 1.562 M base + 18,5 M adaptador | No disponible (entrenado a 512) | Text-to-SQL financiero con anclaje a esquema | other | Hugging Face (PEFT) |
| Qwen2.5-Coder 1.5B Instruct (base) | 1.562 M | No disponible en la información | Generación de código general | Ver licencia de Qwen | Hugging Face |
| Alternativas de text-to-SQL de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos comparativos con otros adaptadores o modelos especializados en text-to-SQL del mismo tamaño; la única comparación documentada es contra el modelo base (ver tabla de benchmarks).

## Limitaciones y advertencias

- El conjunto de evaluación es pequeño (72 ejemplos, 48 ejecutables) y sintético; las métricas no deben interpretarse como precisión de producción.
- Rendimiento débil en subconsultas y CTEs, y moderado en funciones de ventana (33,3% de ejecución); no es fiable para SQL complejo.
- Entrenado solo con objetivos `SELECT`: no genera `INSERT`, `UPDATE`, `DELETE` ni DDL, lo que es una restricción deliberada pero también un límite funcional.
- Solo inglés; no se documenta soporte multilingüe.
- Licencia "other": no se detallan en la model card las condiciones exactas de uso comercial; deben verificarse antes de un despliegue en producción. Además, los datos de entrenamiento incluyen WikiSQL y Spider, con sus propias condiciones de licencia.
- Riesgo de alucinación: puede generar SQL sintácticamente válido pero semánticamente incorrecto, o referenciar tablas y columnas inexistentes si el esquema no está bien delimitado en el prompt.
- El adaptador requiere cargar el modelo base por separado; no es un modelo autónomo.
- Longitud máxima de secuencia en entrenamiento de 512 tokens: esquemas largos pueden truncarse, con la consiguiente pérdida de contexto.
- No se documentan evaluaciones de sesgo ni de robustez frente a prompts adversarios.
- El repositorio tiene un tamaño de 0,0 GB reportado y muy pocas descargas (15) y likes (0), lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ncfad/qwen2.5-coder-1.5b-finance-sql-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Código del proyecto: https://github.com/fadnc/Finance-Text-to-SQL
- Dataset Gretel synthetic_text_to_sql: https://huggingface.co/datasets/gretelai/synthetic_text_to_sql
- Dataset GRAST-SQL-Spider: https://huggingface.co/datasets/griffith-bigdata/GRAST-SQL-Spider
- Release de WikiSQL en GitHub de Salesforce: https://github.com/salesforce/WikiSQL
