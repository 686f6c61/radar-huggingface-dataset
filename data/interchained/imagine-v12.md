# Interchained/imagine-v12

## Resumen

imagine-v12 es un modelo de generación de texto de aproximadamente 1.346 millones de parámetros (1,35B), desarrollado por Interchained como parte del proyecto `imagine`. Su especialidad es la traducción de lenguaje natural a SQL para PostgreSQL (NL2SQL), con un protocolo de salida propio basado en bloques centinela (`<<<SQL>>>`, `<<<UNANSWERABLE>>>`, `<<<CLARIFY>>>`) que permite distinguir entre una consulta generada, una petición que el esquema no puede responder y una petición ambigua. Está etiquetado con la arquitectura `llama` y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo se construyó mediante un ajuste fino en dos etapas a partir de `Interchained/imagine-v11`, sobre una NVIDIA B200 en metal desnudo. La primera etapa fue un fine-tuning completo sobre un corpus de 131.400 filas con un reparto exacto de 33% identidad, 20% protocolo y 47% SQL; la segunda fue un refinamiento con LoRA de rango 16 que se plegó manualmente en el checkpoint final. La novedad declarada de la v12 respecto a la v11 es la "identidad nativa": el modelo responde a preguntas sobre quién es adoptando la identidad de Imagine, construida por Interchained, con tratamiento explícito de peticiones de identidad falsa.

Es relevante ahora porque propone un enfoque de calidad basado en verificación por ejecución real en lugar de similitud de cadenas: cada candidato SQL del corpus pasó por una puerta L0-L4 con parser real de PostgreSQL, EXPLAIN sobre esquema vivo, ejecución cronometrada y comparación de resultado idéntico contra una referencia. Es un checkpoint de investigación, no un modelo de producción, y sus evaluaciones held-out están marcadas como pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo `llama` (según tag del repositorio) |
| Parametros totales | 1.346.471.936 (~1,35B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el ejemplo de carga documentado usa `torch_dtype=torch.bfloat16`; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 2,7 GB |
| Descargas / likes | 0 descargas / 1 like |
| Fecha de creacion | 2026-10-12 |
| Ultima actualizacion | 2026-10-12 |

## Arquitectura y entrenamiento

La model card etiqueta el modelo como `llama`, con pipeline de `text-generation`. No se detalla la configuración interna (número de capas, cabezas, dimensión oculta ni longitud de contexto). La línea genealógica declarada es DeepSeek-Coder como parte del linaje ascendente, atravesando v8 → v9 → v10 → v11 → v12, aunque la identidad desplegada es Imagine. El fine-tuning se ejecutó en dos etapas sobre `Interchained/imagine-v11`.

La etapa 1 fue un ajuste fino completo sobre 131.400 filas con reparto exacto: 43.362 filas de identidad (33%), 26.280 de protocolo (20%) y 61.758 de SQL (47%). El entrenamiento tenía 3 épocas planificadas, pero el disco se llenó en el paso 3600 de 5664 (checkpoints de modelo completo cada 100 pasos a 2,7 GB cada uno). Se verificó la cargabilidad del checkpoint del paso 3500, se limpiaron los antiguos y se reanudó durante una época final: pérdida media de época 0,0136 y pérdida final 0,0107, con unos 22,5 minutos en el tramo reanudado a 39k tok/s. La etapa 2 aplicó LoRA con rango 16, tasa de aprendizaje 5e-6 y schedule coseno, ejecutando 1 de 3 épocas antes de detenerse para conservar horas de GPU (pérdida media de época 0,0131); el adaptador se plegó manualmente en el checkpoint completo (`models/imagine-v12-lora`).

La innovación técnica central no está en el entrenamiento sino en la construcción del corpus: el SQL se forjó con 3.289 candidatos, de los que se admitieron 3.284 (99,85% de tasa de admisión), con 68 de 68 comportamientos de puerta en verde. La puerta de ejecución L0-L4 exige: L0 parser real de PostgreSQL (no regex), L1 solo lectura y acotado (sin escrituras ni esperas), L2 `EXPLAIN` sobre esquema vivo (donde mueren las alucinaciones), L3 ejecución cronometrada y limitada con filas reales, y L4 comprobación de resultado idéntico contra la referencia. El principio declarado es que el esquema va en el prompt, no en los pesos.

## Capacidades

- Generación de consultas PostgreSQL a partir de lenguaje natural, con sintaxis completa y envoltura en bloques `<<<SQL>>> ... <<<END>>>`.
- Refuerzo de la disciplina de protocolo: bloques `<<<UNANSWERABLE>>>` cuando el esquema no puede responder la petición y `<<<CLARIFY>>>` cuando la petición es ambigua.
- Identidad nativa: responde a preguntas sobre su propia identidad como Imagine, construido por Interchained, con manejo honesto de prompts de identidad falsa.
- Generación de consultas de lectura con agregaciones, `JOIN` (incluido `LEFT JOIN`), `COALESCE`, `GROUP BY` y `ORDER BY`, según el ejemplo de la model card.
- Ejecución local sin clave de API y sin inferencia medida por consumo.
- Capacidad conversacional declarada mediante el tag `conversational`.
- Modo de generación determinista documentado (`do_sample=False`) en el ejemplo de uso.

No se documentan capacidades de visión, audio, tool calling, function calling, uso de agentes ni multi-step reasoning en la información disponible.

## Casos de uso

- Asistente de consultas sobre bases de datos PostgreSQL: el modelo recibe el esquema en el prompt y devuelve SQL de lectura listo para revisar, con la ventaja de que el protocolo de bloques permite descartar automáticamente respuestas truncadas.
- Generación de SQL para herramientas internas de analítica: integrado en un editor o cuaderno, el bloque `<<<CLARIFY>>>` sirve para pedir al usuario que concrete filtros o columnas cuando la petición es ambigua, en lugar de generar una consulta silenciosamente incorrecta.
- Enrutado de peticiones no respondibles: el bloque `<<<UNANSWERABLE>>>` permite que la aplicación detecte cuándo el esquema entregado no cubre la pregunta y redirija al usuario en vez de inventar columnas.
- Prototipado de pipelines NL2SQL en local: al ser un modelo de ~1,35B que cabe en hardware de consumo, permite iterar sin coste de API ni dependencia de nube.
- Generación de consultas de informes con agregaciones: el ejemplo documentado (suma de gasto por cliente con `LEFT JOIN` y `COALESCE`) ilustra el tipo de informe repetitivo que se puede automatizar con revisión humana posterior.
- Formación y evaluación de metodología NL2SQL: la puerta de ejecución L0-L4 y la métrica de "mismo resultado que la referencia" son un caso práctico de cómo medir exactitud por ejecución en lugar de por similitud de cadenas.
- Investigación sobre identidad y comportamiento de modelos: el corpus de 43.362 pares de identidad y el tratamiento de prompts de identidad falsa lo hacen útil para estudiar cómo se comporta un modelo pequeño ante preguntas de autoidentificación.

## Benchmarks y rendimiento

La model card incluye la tabla de evaluaciones de telemetría del linaje `imagine`. Los valores de v12 están marcados explícitamente como pendientes. Se reproduce tal cual:

| Modelo | Held-out (telemetry) | Protocolo | Execute rate | Columnas inventadas |
|---|---|---|---|---|
| imagine-v8 | 50,0% (20/40) | 100% | — | — |
| imagine-v9 | 90,0% (36/40) | 100% | 97,5% | 0 |
| imagine-v10 | 100,0% (40/40) | 100% | 100% | 0 |
| imagine-v11 | 100,0% (40/40) | 100% | 100% | 0 |
| imagine-v12 | pendiente | pendiente | — | — |

El tamaño de la muestra held-out es de 40 casos, lo que limita mucho la potencia estadística de las cifras (cada caso equivale a 2,5 puntos porcentuales). No se publican resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar en la información disponible. Tampoco hay datos de latencia ni de throughput más allá de los 39k tok/s registrados durante el tramo de entrenamiento reanudado, que no son una medida de inferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16 (formato del ejemplo de carga) los pesos ocupan aproximadamente 2,7 GB, más el espacio de activaciones y caché KV; en 8 bits rondaría 1,4 GB y en 4 bits en torno a 0,7-0,9 GB. Estas cifras son estimaciones derivadas del recuento de parámetros, ya que no hay cuantizaciones publicadas.
- GPU recomendadas: no se especifican requisitos oficiales. El entrenamiento se realizó en una NVIDIA B200, pero eso corresponde al fine-tuning completo, no a la inferencia.
- Cabe en GPU de consumo: sí, con los pesos en bfloat16 (~2,7 GB) cabe con holgura en tarjetas de 8 GB o más, como una RTX 3060, 4060 o superiores. En CPU también es viable, como sugiere el lema "No GPU" de la model card.
- Opciones de despliegue: el único método documentado es `transformers` con `AutoModelForCausalLM` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput de inferencia: no disponibles.

## Comparativa con modelos similares

No se han proporcionado datos de modelos alternativos comparables en la información disponible. La única referencia interna es el propio linaje `imagine`, cuyos resultados se recogen en la tabla de benchmarks anterior; la v12 es el eslabón más reciente y aún sin evaluar. El linaje ascendente incluye DeepSeek-Coder, pero no se facilitan especificaciones ni métricas de ese modelo para establecer una comparación.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| imagine-v12 | 1,35B | no disponible | Apache 2.0 | checkpoint de investigacion, evaluacion pendiente |
| imagine-v11 | no disponible | no disponible | no disponible | predecesor directo, 100% held-out declarado |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card se describe a sí misma como "research checkpoint", no como modelo listo para producción.
- Puede generar SQL incorrecto ante patrones nuevos no vistos durante el ajuste.
- Puede malinterpretar peticiones ambiguas.
- Puede producir sentencias de escritura con cláusulas `WHERE` incorrectas; se advierte explícitamente de revisar antes de ejecutar, con especial énfasis en las escrituras.
- Una generación truncada no es una respuesta válida: un bloque sin terminar se extrae como nada. Cualquier integración debe verificar que el bloque cierra correctamente.
- El modelo solo está entrenado y etiquetado en inglés; no hay soporte multilingüe declarado.
- Las evaluaciones held-out de la v12 están pendientes, por lo que su rendimiento real es desconocido en el momento de publicar esta ficha.
- La muestra de evaluación del linaje es de solo 40 casos, insuficiente para extrapolar con confianza.
- Seguridad en base de datos: la model card insiste en no depender solo del comportamiento del modelo. Se recomienda imponer roles de mínimo privilegio, tiempos de espera y límites de filas, validación de consultas y restricciones de esquema, autorización a nivel de aplicación, registro de auditoría y aprobación humana para toda sentencia de escritura.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan condiciones adicionales del autor más allá de la propia licencia.
- Riesgo de alucinación de columnas: aunque la puerta de construcción del corpus persigue cero columnas inventadas, no hay métricas publicadas de v12 sobre este punto.
- No se documentan sesgos específicos. Dado que no hay datos demográficos de entrenamiento disponibles, no es posible evaluar sesgos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Interchained/imagine-v12
- Modelo predecesor citado: https://huggingface.co/Interchained/imagine-v11 (referenciado como base del ajuste en dos etapas)
- Paper, blog, repositorio o demo: no disponible en la información proporcionada. Los resultados de la búsqueda web facilitados no guardan relación con el modelo y no se incluyen.
