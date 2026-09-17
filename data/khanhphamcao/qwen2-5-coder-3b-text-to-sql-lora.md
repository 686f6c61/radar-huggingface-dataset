# khanhphamcao/qwen2.5-coder-3b-text-to-sql-lora

## Resumen

El modelo `khanhphamcao/qwen2.5-coder-3b-text-to-sql-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado mediante supervisión fina (SFT) sobre el modelo base `Qwen/Qwen2.5-Coder-3B-Instruct`. Su propósito declarado, según el identificador del repositorio, es la traducción de lenguaje natural a SQL (text-to-SQL). No se trata por tanto de un modelo completo con pesos propios, sino de un conjunto de pesos de adaptador que debe cargarse junto al modelo base para poder ejecutarse.

El repositorio tiene un tamano aproximado de 0,1 GB y fue creado el 16 de septiembre de 2026. La model card publicada por el autor es la plantilla por defecto de Hugging Face y no ha sido cumplimentada: todos los campos relevantes (desarrollador, tipo de modelo, idiomas, licencia, datos de entrenamiento, hiperparámetros y evaluación) aparecen como «More Information Needed». Esto limita de forma severa la trazabilidad del entrenamiento y cualquier evaluación de idoneidad para producción.

La relevancia de esta ficha es, por tanto, doble: describe un adaptador especializado en generación de SQL que puede resultar útil para prototipado rápido sobre hardware de consumo, y documenta explícitamente la ausencia de información verificable sobre su entrenamiento y rendimiento, un aspecto crítico antes de integrarlo en cualquier flujo de trabajo real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso con decodificación autorregresiva (heredada del modelo base Qwen2.5-Coder-3B-Instruct); el adaptador aplica LoRA sobre las capas del modelo base |
| Parámetros totales | No disponible para el adaptador (el repositorio ocupa 0,1 GB). El modelo base declara 3,09 mil millones de parámetros |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información del adaptador. El modelo base Qwen2.5-Coder-3B-Instruct declara 32 768 tokens de contexto nativo |
| Tipos de cuantización | No disponible en la model card. El adaptador se distribuye en safetensors; la cuantización aplicable depende del modelo base (GPTQ, AWQ, GGUF, bitsandbytes) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (los metadatos de Hugging Face no indican licencia). La licencia del modelo base Qwen2.5-Coder-3B-Instruct es Apache 2.0, pero el adaptador no hereda automáticamente esa declaración |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Librería | PEFT 0.21.0 (con transformers y TRL en el entrenamiento) |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-Coder-3B-Instruct |
| Tipo de adaptador | LoRA, entrenado con SFT |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base Qwen2.5-Coder-3B-Instruct, un transformer denso de tipo decoder-only con Grouped Query Attention (16 cabezas de consulta y 2 cabezas de clave/valor según la configuración pública del modelo base), 36 capas y un vocabulario de 151 646 tokens. Sobre esa arquitectura, el autor ha aplicado un ajuste fino supervisado (SFT) con LoRA mediante la librería TRL, dejando congelados los pesos originales y entrenando únicamente matrices de bajo rango. Esta estrategia reduce drásticamente el coste de entrenamiento y el tamano del artefacto resultante, que se queda en torno a 0,1 GB.

No se dispone de información sobre el conjunto de datos utilizado, el número de tokens de entrenamiento, la composición del corpus (si incluye esquemas de bases de datos reales, pares pregunta-SQL de Spider, WikiSQL, BIRD u otros), la existencia de fases de RLHF o DPO, ni los hiperparámetros concretos (tasa de aprendizaje, rango de LoRA, alpha, dropout, precisión mixta utilizada). La model card no incluye ninguna sección cumplimentada al respecto, y la búsqueda web realizada no ha devuelto documentación técnica, paper ni entrada de blog asociada a este repositorio. Tampoco se documenta ninguna innovación técnica adicional más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto y de código: el modelo base está especializado en código y el adaptador lo orienta a la generación de sentencias SQL.
- Traducción de lenguaje natural a SQL (text-to-SQL): capacidad principal declarada por el identificador del repositorio, presumiblemente sobre esquemas de tablas proporcionados en el prompt.
- Razonamiento multi-turno conversacional: el modelo base es una variante «Instruct» con pipeline `conversational`, por lo que puede mantener diálogos de varios turnos para refinar una consulta.
- Generación de código general: heredada del modelo base Qwen2.5-Coder-3B-Instruct.
- Capacidades multilingües: no disponibles (no declaradas ni verificadas para este adaptador).
- Soporte de tool calling / function calling: no confirmado en este adaptador. El modelo base Qwen2.5-Coder-Instruct sí documenta soporte de function calling, pero no hay evidencia de que el ajuste lo preserve.
- Modo de razonamiento explícito (thinking mode), visión o audio: no disponible / no soportado.

## Casos de uso

- Asistente de consultas sobre bases de datos internas: el adaptador traduce preguntas en lenguaje natural a SQL sobre un esquema proporcionado en el prompt, lo que permite a perfiles no técnicos (análisis de negocio, soporte, operaciones) obtener datos sin escribir consultas manualmente.
- Prototipado rápido de copilotos SQL: al ocupar 0,1 GB, el adaptador se puede cargar sobre el modelo base cuantizado en un portátil con GPU de consumo para validar el concepto de un producto text-to-SQL antes de invertir en infraestructura.
- Generación de consultas de analítica ad hoc: integrado en un cuaderno o herramienta de BI, el modelo puede generar agregaciones, agrupaciones y uniones a partir de descripciones textuales de métricas de negocio.
- Documentación y explicación inversa de SQL existente: dado un modelo base de código competente, puede utilizarse en sentido inverso para comentar y resumir consultas ya escritas, ayudando a auditar repositorios analíticos heredados.
- Aprendizaje y formación: estudiantes de SQL pueden comparar la consulta generada con la suya propia y usarla como punto de partida, siempre con revisión humana, dado que no hay benchmarks publicados que respalden su exactitud.
- Preprocesado en pipelines de datos: generación de borradores de consultas de transformación (CTAS, vistas materializadas) que después pasan por revisión y validación automática de sintaxis antes de ejecutarse.
- Base para un ajuste adicional: al ser un adaptador LoRA, se puede combinar o continuar entrenando con datos propios de un dominio concreto (por ejemplo, esquemas específicos de una empresa) a un coste muy bajo.
- Extracción de datos desde texto para integración: convertir descripciones textuales de filtros en cláusulas `WHERE` parametrizadas para su uso en APIs internas, con validación previa mediante un parser SQL.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del adaptador no incluye ninguna sección de evaluación cumplimentada, no hay conjunto de test documentado (Spider, BIRD, WikiSQL, CoSQL u otros) ni métricas declaradas (execution accuracy, exact match). La búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo. En consecuencia, cualquier afirmación sobre su rendimiento en text-to-SQL carecería de respaldo verificable.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,1 GB en disco; en memoria, los pesos LoRA son de decenas de megabytes y el consumo dominante es el del modelo base.
- Modelo base en fp16/bf16: en torno a 6-7 GB de VRAM para los pesos, más la caché KV, que crece linealmente con la longitud de contexto (varios GB adicionales si se usan los 32 768 tokens completos).
- Modelo base en cuantización de 8 bits: aproximadamente 3,5-4 GB de pesos.
- Modelo base en cuantización de 4 bits: aproximadamente 2-2,5 GB de pesos, lo que permite ejecución con contexto moderado en GPUs de 6-8 GB.
- GPUs de consumo: cabe con holgura en una RTX 4090 (24 GB), RTX 4080/4070 Ti (16 GB), RTX 4070/3080 (10-12 GB) y, en cuantización de 4 bits con contexto reducido, en una RTX 3060 de 12 GB o una RTX 4060 de 8 GB.
- GPUs de centro de datos: A100, H100, L40S o L4 son suficientes y quedan muy sobredimensionadas para un modelo de 3B; se recomienda usarlas solo en escenarios de alto batcheo.
- Opciones de despliegue: vLLM o TGI para servicio concurrente (el adaptador LoRA se puede cargar en caliente en vLLM), llama.cpp/Ollama si se convierte el modelo fusionado a GGUF, y transformers + PEFT para uso directo en Python.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de latencia para este adaptador.

## Comparativa con modelos similares

La comparación se establece frente a alternativas de la misma categoría (modelos pequeños especializados en text-to-SQL o adaptadores equivalentes). Los datos de terceros proceden de su documentación pública y deben verificarse antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| khanhphamcao/qwen2.5-coder-3b-text-to-sql-lora | Adaptador LoRA sobre 3,09B (base) | No disponible en el adaptador; 32 768 tokens en el modelo base | No disponible | safetensors (PEFT/LoRA) | Requiere cargar el modelo base; sin evaluación publicada |
| Qwen/Qwen2.5-Coder-3B-Instruct (modelo base) | 3,09B | 32 768 tokens nativos | Apache 2.0 | safetensors, GGUF (comunidad) | Modelo generalista de código, no especializado en SQL |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7,6B aproximadamente | 32 768 tokens nativos | Apache 2.0 | safetensors, GGUF | Alternativa de mayor tamano del mismo fabricante, más costosa en VRAM |
| Adaptadores text-to-SQL de la comunidad sobre modelos de 3B-7B | Variable | Variable | Variable | PEFT/LoRA | Ecosistema muy heterogéneo, con documentación desigual |

No se dispone de datos de rendimiento comparativo (execution accuracy en Spider o BIRD) para ninguno de los modelos de la tabla, por lo que la comparativa se limita a características estructurales y de licencia.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es la plantilla por defecto. No se conocen datos de entrenamiento, hiperparámetros, composición del dataset ni metodología de evaluación.
- Licencia no declarada: los metadatos de Hugging Face no especifican licencia para el adaptador. La licencia Apache 2.0 del modelo base Qwen2.5-Coder-3B-Instruct no implica automáticamente que los pesos derivados del ajuste estén bajo los mismos términos, por lo que el uso comercial queda en una zona jurídica ambigua hasta que el autor lo aclare.
- Riesgo de alucinación de esquemas: como cualquier modelo generativo aplicado a SQL, puede inventar tablas, columnas o funciones que no existen en la base de datos de destino. Es imprescindible validar sintáctica y semánticamente cada consulta generada antes de ejecutarla.
- Riesgo de inyección SQL: si la salida del modelo se concatena directamente en una consulta, un prompt malicioso podría generar SQL peligroso. Debe tratarse como entrada no confiable y ejecutarse con permisos limitados.
- Idiomas no especificados: se desconoce si el ajuste se realizó con datos en castellano o únicamente en inglés, lo que afecta directamente a su utilidad en entornos hispanohablantes.
- Contexto limitado por el modelo base: 32 768 tokens, suficiente para esquemas pequeños o medianos, pero insuficiente para volcar esquemas completos de bases de datos empresariales grandes, que requerirán recuperación selectiva de tablas relevantes.
- Cero señales de validación social: el repositorio tiene 0 descargas y 0 «likes» en el momento de redactar esta ficha, y no hay resultados relevantes en la búsqueda web. No existen terceros que hayan reportado experiencias de uso.
- Tamano de 3B: en tareas de razonamiento SQL complejo (CTEs anidadas, ventanas, múltiples uniones) los modelos de este tamano suelen quedar por detrás de alternativas de 7B o superiores, aunque no hay datos que lo confirmen para este adaptador concreto.
- Deriva del modelo base: si el autor actualiza o elimina el adaptador, no hay garantía de continuidad ni de versionado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/khanhphamcao/qwen2.5-coder-3b-text-to-sql-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Librería PEFT: https://github.com/huggingface/peft
- Librería TRL: https://github.com/huggingface/trl
- Referencia citada en las etiquetas del repositorio (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- La búsqueda web realizada no ha devuelto ningún enlace relevante sobre este adaptador (paper, blog, repositorio o demo). No se dispone de más enlaces verificables.
