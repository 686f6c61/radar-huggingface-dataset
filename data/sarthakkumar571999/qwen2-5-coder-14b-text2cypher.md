# SarthakKumar571999/qwen2-5-coder-14b-text2cypher

## Resumen

Qwen2.5-Coder 14B Text2Cypher es un ajuste fino del modelo Qwen2.5-Coder-14B-Instruct, publicado por el usuario SarthakKumar571999, que traduce preguntas en lenguaje natural a consultas Cypher ejecutables sobre una base de datos de grafos Neo4j. El modelo recibe como entrada el esquema del grafo (etiquetas de nodo, propiedades con sus tipos, tipos de relación y su dirección) junto con la pregunta, y devuelve únicamente la consulta Cypher, sin explicaciones ni bloques de código.

El problema que resuelve es la capa de consulta en arquitecturas GraphRAG y en analítica sobre grafos de conocimiento: escribir Cypher correcto exige conocer el esquema y la dirección de las relaciones, algo que un usuario no técnico no maneja. El ajuste se realizó con QLoRA/LoRA sobre el dataset neo4j/text2cypher-2024v1, con 29.191 ejemplos de entrenamiento, 8.499 de test y 2.561 en un split heldout formado por dominios de grafo excluidos antes del ajuste.

Es relevante porque su evaluación no se limita a similitud de cadenas: la consulta predicha y la de referencia se ejecutan contra la misma instancia de Neo4j y los registros devueltos se comparan como multiconjuntos. Con ese criterio, sobre 4.873 casos comparables, obtiene un 59,92% de coincidencias estrictas y un 81,84% de exactitud final tras incorporar casos verificados por un LLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia Qwen2.5, heredada del modelo base Qwen2.5-Coder-14B-Instruct; ajuste mediante adaptador QLoRA/LoRA. No se detalla en la model card |
| Parametros totales | 14B nominales (modelo base). El repositorio ocupa 0,1 GB, un tamaño compatible con un adaptador LoRA y no con pesos fusionados de 14B |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No indicada en la model card. El modelo base Qwen2.5-Coder-14B-Instruct declara 32.768 tokens de contexto nativo |
| Tipos de cuantizacion | No se publican variantes cuantizadas (GGUF, AWQ, GPTQ). El entrenamiento empleó QLoRA, es decir, cuantización en 4 bits durante el ajuste |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | Qwen/Qwen2.5-Coder-14B-Instruct |
| Dataset de entrenamiento | neo4j/text2cypher-2024v1 |
| Pipeline | text-generation |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 descargas / 1 like en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only denso de la familia Qwen2.5, tomado del instructivo Qwen2.5-Coder-14B-Instruct y adaptado mediante QLoRA/LoRA para una tarea de generación estructurada. El autor no documenta en la model card detalles como el número de capas, la configuración de atención, el uso de RoPE o la estrategia de decodificación, por lo que esos datos quedan como no disponibles. El entrenamiento se realizó sobre el dataset neo4j/text2cypher-2024v1, con 29.191 filas de entrenamiento, 8.499 de test y 2.561 en el split heldout; los dominios `stackoverflow`, `stackoverflow2`, `network` y `bluesky` se eliminaron antes del ajuste y del particionado, de modo que el heldout mide generalización a dominios de grafo no vistos. No se especifica si hubo fases adicionales de RLHF o DPO.

La innovación técnica destacable no está en el bloque de atención, sino en el protocolo de evaluación. Cada ejemplo incluye esquema, pregunta, consulta de referencia y consulta predicha, además de un alias de base de datos cuando está disponible. La evaluación principal es de ejecución en vivo: ambas consultas se lanzan contra el mismo Neo4j y los registros se comparan como multiconjuntos preservando duplicados, sin considerar automáticamente equivalentes una proyección de propiedades y la devolución del nodo completo. Se aplica además una corrección de dirección de relación autorizada por el esquema, evaluada por separado, que rescató 3 casos adicionales. La similitud de cadenas (BLEU, ROUGE, chrF) se reporta como métrica secundaria y no como medida semántica principal.

## Capacidades

- Generación de consultas Cypher a partir de una pregunta en lenguaje natural y un esquema Neo4j explícito, con respeto de la dirección de las relaciones.
- Traducción de filtros, agregaciones y ordenaciones: la model card indica que el modelo maneja `count`, totales, medias, mínimos, máximos y patrones de tipo "top N" con `ORDER BY` y `LIMIT`.
- Proyección selectiva de propiedades: devuelve solo los atributos nombrados en la pregunta y reserva la devolución del nodo completo para preguntas genéricas sobre una entidad.
- Salida restringida a la consulta: el prompt de sistema le exige devolver únicamente Cypher, sin explicaciones, fences de Markdown ni comentarios.
- Ejecución verificada en base de datos real: en el test, 4.880 de las predicciones con alias disponible se ejecutaron inicialmente, con solo 35 errores de ejecución.
- Formato conversacional: el repositorio declara el tag `conversational`, por lo que admite plantillas de chat con mensaje de sistema y mensaje de usuario.
- Compatibilidad con endpoints: el tag `endpoints_compatible` indica que puede servirse a través de la infraestructura de Inference Endpoints de Hugging Face.
- Capacidades no confirmadas: no hay información sobre tool calling, function calling, uso en agentes multi-paso, visión, audio, modo de razonamiento explícito ni cobertura multilingüe más allá de lo que herede del modelo base.

## Casos de uso

- Asistente de consulta sobre grafos de conocimiento: el usuario escribe una pregunta en lenguaje natural y el modelo genera el Cypher que la responde, inyectando el esquema como contexto. Es el caso de uso central y el único para el que hay métricas publicadas (81,84% de exactitud final sobre 4.873 casos comparables).
- Capa de recuperación en un pipeline GraphRAG: dado que el modelo devuelve solo la consulta, encaja como componente intermedio que alimenta la ejecución contra Neo4j y cuyos resultados se pasan después a un LLM generador. Su salida limpia evita el parseo de texto adicional.
- Analítica self-service para equipos no técnicos: permite a perfiles de negocio formular preguntas de conteo, promedio o ranking sobre un grafo sin conocer Cypher, apoyándose en la capacidad documentada de mapear agregaciones y `ORDER BY`/`LIMIT`.
- Exploración de un esquema desconocido: al recibir el esquema en el prompt, el modelo puede usarse para descubrir rutas de relación entre etiquetas de nodo, ya que el prompt de sistema le instruye a localizar el camino de relaciones que conecta el sujeto y el objeto de la pregunta.
- Generación de consultas de referencia para anotación: el equipo de datos puede usar las predicciones como borrador para construir conjuntos de evaluación de text2cypher, aprovechando que el 59,92% de las predicciones coinciden estrictamente con la referencia en el test.
- Validación de esquemas y documentación: un porcentaje relevante de fallos se debe a direcciones de relación incorrectas (solo 3 casos se rescataron con corrección de dirección, pero el criterio se evalúa aparte), lo que permite usar el modelo para detectar ambigüedades en cómo se documenta el esquema antes de exponerlo a usuarios finales.
- Integración en herramientas internas de BI sobre Neo4j: mediante endpoints compatibles, el modelo puede exponerse detrás de un chat interno y traducir preguntas recurrentes a consultas parametrizables, siempre con un usuario de base de datos de solo lectura.

## Benchmarks y rendimiento

Métricas de similitud declaradas en la model card para el split de test (8.499 filas):

| Metrica | Valor |
|---|---|
| BLEU-4 | 84,5642 |
| ROUGE-L F1 | 90,1142 |
| chrF | 95,9071 |
| Token F1 | No disponible (dato truncado en la model card) |

Evaluación principal mediante ejecución en vivo contra Neo4j:

| Metrica | Valor |
|---|---|
| Filas totales del test | 8.499 |
| Filas con alias de base de datos en vivo | 4.916 |
| Filas sin alias de base de datos | 3.583 |
| Predicciones que se ejecutan inicialmente | 4.880 |
| Errores iniciales de ejecución | 35 |
| Consultas de tipo escritura omitidas | 1 |
| Casos en que ambas consultas se ejecutan | 4.873 |
| Coincidencias estrictas | 2.920 / 4.873 = 59,92% |
| Coincidencias tras corrección de dirección autorizada por el esquema | 2.923 / 4.873 = 59,98% |
| Exactitud final (exactas + referencia contenida en la predicción + verificadas por LLM) | 3.988 / 4.873 = 81,84% |

Desglose final de la matriz de puntuación del test:

| Categoria | Casos |
|---|---|
| Coincidencias exactas de resultado tras corrección de dirección | 2.923 |
| Referencia contenida en la predicción (salida extra o alias de salida distinto) | 281 |
| Verificadas por LLM como respuesta correcta a la pregunta | 784 |
| Cuestionables | 104 |
| Incorrectas | 781 |
| Total de casos comparables | 4.873 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos en MMLU, HumanEval, GSM8K ni en conjuntos de referencia de text2cypher.

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,1 GB), por lo que hay que descargar además el modelo base Qwen2.5-Coder-14B-Instruct completo, en torno a 28-30 GB en safetensors de precisión completa, y fusionar el adaptador antes de servirlo.
- Inferencia en BF16/FP16: aproximadamente 28-30 GB solo de pesos, más la caché KV. Requiere una A100 de 40 GB, una H100 de 80 GB o varias GPU con paralelismo tensorial.
- Inferencia en INT8: en torno a 15-16 GB de pesos. Cabe en RTX 4090 (24 GB), L4 (24 GB) o A10G (24 GB).
- Inferencia en 4 bits (NF4, AWQ o GPTQ): en torno a 9-10 GB de pesos. Cabe en RTX 4090, RTX 3090 y, con contexto reducido, en GPU de 16 GB como la RTX 4080.
- En GPU de consumo: sí, en tarjetas de 16-24 GB con cuantización de 4 bits. En 12 GB solo con contexto muy corto o descarga parcial a CPU.
- La caché KV crece con la longitud de contexto; con ventanas largas (decenas de miles de tokens) hay que reservar varios GB adicionales sobre la estimación de pesos.
- Opciones de despliegue: vLLM, TGI o SGLang tras fusionar el adaptador; llama.cpp u Ollama requieren convertir el modelo fusionado a GGUF, formato que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-Coder 14B Text2Cypher (este modelo) | 14B | No disponible en la model card | Text2Cypher sobre Neo4j | No disponible | Adaptador en Hugging Face, 0 descargas y 1 like |
| Qwen2.5-Coder-14B-Instruct (modelo base) | 14B | 32.768 tokens según su model card | Código y texto general; sin ajuste específico para Cypher | No disponible en esta ficha; consultar el repositorio del modelo base | Ampliamente utilizado y desplegado |
| Otros ajustes finos de text2cypher sobre modelos de 7-14B | No disponible | No disponible | Text2Cypher | No disponible | No disponible |

No se dispone de resultados de benchmarks comparativos entre este modelo y alternativas de la misma categoría en la información proporcionada. La comparación con el modelo base solo puede hacerse a nivel de especificaciones, ya que la model card del base no reporta métricas de text2cypher.

## Limitaciones y advertencias

- La licencia no está especificada en el repositorio, lo que impide determinar si el uso comercial está permitido. Es un bloqueo legal potencial para producción.
- El modelo tiene 0 descargas y 1 like en el momento de la consulta: no cuenta con validación independiente por parte de la comunidad.
- Rendimiento real modesto: solo un 59,92% de coincidencias estrictas de resultado en el test. Sumando las categorías "incorrectas" (781) y "cuestionables" (104), en torno al 18% de los 4.873 casos comparables no puede considerarse correcto.
- Cobertura de evaluación parcial: de las 8.499 filas del test, 3.583 no tienen alias de base de datos en vivo y quedan fuera del denominador estricto, por lo que las cifras se calculan sobre 4.873 casos.
- El 81,84% de exactitud final incorpora 784 casos validados por un LLM, un criterio más laxo que la coincidencia exacta de resultados. Conviene citar ambas cifras por separado.
- Sensibilidad a la dirección de las relaciones: el protocolo de evaluación contempla una corrección de dirección autorizada por el esquema, lo que indica que el modelo puede invertir el sentido de un patrón cuando el esquema no es explícito.
- Dependencia estricta del esquema: el prompt de sistema prohíbe inventar etiquetas, relaciones o propiedades, pero si el esquema proporcionado está incompleto o desactualizado, el modelo puede alucinar nombres de propiedades o generar rutas inválidas.
- Generalización limitada: el heldout cubre únicamente los dominios `stackoverflow`, `stackoverflow2`, `network` y `bluesky`, y no se publican métricas desglosadas para ellos en la información disponible.
- Riesgo operativo: el modelo puede generar consultas de tipo escritura (se omitió 1 caso de este tipo en la evaluación). Debe ejecutarse con un usuario de Neo4j de solo lectura y con límites de recursos.
- Salida restringida: el modelo devuelve solo Cypher y no explica su razonamiento, por lo que no es adecuado como asistente conversacional general.
- Idiomas: no se declaran idiomas soportados; se desconoce si el ajuste degrada el multilingüismo del modelo base.
- Sesgos: no se han publicado análisis de sesgo en la información disponible.
- La model card aparece truncada (falta el valor de Token F1 y probablemente contenido posterior), lo que limita la reproducibilidad completa de su evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SarthakKumar571999/qwen2-5-coder-14b-text2cypher
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/neo4j/text2cypher-2024v1
- Paper, blog técnico, repositorio de código y demo: no disponibles.
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo (hilos de un foro de un operador de telecomunicaciones belga sobre problemas de conexión, phishing y latencia), por lo que no aportan información utilizable para esta ficha.
