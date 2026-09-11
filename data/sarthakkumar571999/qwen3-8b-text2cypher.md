# SarthakKumar571999/qwen3-8b-text2cypher

## Resumen

Qwen3 8B Text2Cypher es un ajuste fino del modelo Qwen3-8B orientado a una única tarea: traducir preguntas en lenguaje natural a consultas Cypher ejecutables sobre bases de datos de grafos Neo4j. El modelo lo publica el usuario SarthakKumar571999 en HuggingFace y se ha entrenado con QLoRA de Unsloth partiendo de `unsloth/Qwen3-8B-unsloth-bnb-4bit`; posteriormente el adaptador LoRA se fusionó en el modelo base y se publicó en 16 bits.

El problema que resuelve es concreto y bien delimitado: dado un esquema de grafo (etiquetas de nodo, propiedades, tipos de relación y direcciones válidas) y una pregunta del usuario, el modelo devuelve únicamente la consulta Cypher necesaria, sin explicaciones ni bloques de Markdown. Está pensado para integrarse en aplicaciones que exponen un esquema dinámico, como asistentes de análisis sobre grafos, herramientas de BI o pipelines de recuperación aumentada sobre knowledge graphs.

La relevancia de la ficha es doble. Por un lado, el autor declara una metodología de evaluación poco habitual y más fiable que el simple *string matching*: las consultas generadas se ejecutan contra bases Neo4j reales y se comparan los resultados como multiconjuntos. Por otro, los datos de entrenamiento incluyen un conjunto *heldout* con dominios de grafo excluidos antes del split (stackoverflow, stackoverflow2, network y bluesky), lo que permite medir generalización a esquemas no vistos. No obstante, no se publican cifras de rendimiento en la información disponible, el repositorio tiene 0 descargas y la licencia no está declarada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen3), ajustado con QLoRA y adaptador fusionado |
| Parámetros totales | Aproximadamente 8.000 millones (heredados del modelo base Qwen3-8B; no se detalla en la model card) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | Publicado en 16 bits tras fusionar el adaptador; el ajuste se realizó sobre una base de 4 bits (`bnb-4bit`). No se publican versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (los ejemplos de la model card están en inglés) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | unsloth/Qwen3-8B-unsloth-bnb-4bit |
| Tarea (pipeline) | text-generation |
| Librería | transformers |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación / actualización | 2026-09-11 / 2026-09-11 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder-only denso de aproximadamente 8.000 millones de parámetros. El ajuste fino se realizó con QLoRA de Unsloth sobre la variante cuantizada a 4 bits `unsloth/Qwen3-8B-unsloth-bnb-4bit`, y el adaptador resultante se fusionó en el modelo base para producir una versión final en 16 bits. No se documentan en la model card el rango del LoRA, la tasa de aprendizaje, el número de épocas, el presupuesto de cómputo ni si hubo etapas adicionales de RLHF o DPO; estos datos figuran como no disponibles.

El entrenamiento se apoya en un dataset de Text-to-Cypher producido por el propio pipeline de preparación del proyecto, con 29.191 filas de entrenamiento, 8.499 de test (split estratificado 80/20 agrupado por complejidad de consulta) y 2.561 de *heldout*. El conjunto *heldout* se construyó eliminando cuatro dominios de grafo antes de crear los splits de train y test, de modo que mide generalización a esquemas no vistos; se compone de 2.177 consultas fáciles, 330 medias y 54 complejas. La innovación metodológica destacable no está en la arquitectura, sino en el formato de tarea (esquema + pregunta como entrada, Cypher puro como salida) y en la evaluación por ejecución real contra Neo4j en lugar de por similitud de cadenas.

## Capacidades

- Generación de consultas Cypher a partir de lenguaje natural, con o sin agregaciones (count, sum, avg, min, max, top N con ORDER BY y LIMIT).
- Traducción de preguntas a patrones MATCH que respetan la dirección declarada en el esquema (`(:LabelA)-[:REL]->(:LabelB)`).
- Resolución de rutas multi-salto: la propia model card indica que las preguntas suelen requerir atravesar más de un tipo de relación.
- Filtrado por propiedad: nombres, fechas, categorías y umbrales mapeados a la propiedad correcta de la etiqueta correcta.
- Proyecciones selectivas de propiedades frente a devolución de nodos completos, según lo que pida la pregunta.
- Salida limpia y directamente ejecutable: solo la consulta, sin explicaciones, sin fences de Markdown y sin comentarios.
- Ajuste al esquema inyectado en el prompt, que es la única fuente de verdad declarada para etiquetas, relaciones y propiedades.
- Generación conversacional/text-generation genérica (pipeline declarado), aunque el ajuste está especializado en la tarea Text2Cypher.
- No se documenta soporte de tool calling, function calling, uso de agentes, capacidades multimodales, audio, visión ni modo de razonamiento explícito (*thinking mode*).
- No se documentan capacidades multilingües ni idiomas distintos del inglés de los ejemplos.

## Casos de uso

- Asistente de consulta sobre un grafo Neo4j corporativo: se inyecta el esquema del grafo en el *system prompt* y el usuario formula preguntas en lenguaje natural; el modelo devuelve Cypher listo para ejecutar contra la base, sin que el usuario tenga que conocer el modelo de datos.
- Integración en herramientas de BI y notebooks: el analista escribe la pregunta de negocio y el modelo genera la consulta que alimenta el panel o el dataframe, reduciendo la barrera de entrada a Cypher para perfiles no técnicos.
- Recuperación aumentada sobre grafos (GraphRAG): uso del modelo como capa de traducción pregunta→consulta para recuperar subgrafos relevantes que después se pasan a un LLM generador de la respuesta final.
- Autocompletado y sugerencia en editores de Cypher (Neo4j Browser, Bloom o plugins de IDE): el modelo recibe el esquema activo y propone la consulta completa a partir de una descripción breve, acelerando la escritura manual.
- Automatización de informes periódicos: consultas de agregación (totales, medias, mínimos, máximos, rankings con LIMIT) generadas a partir de plantillas de pregunta fijas y ejecutadas en un *job* programado.
- Auditoría y gobierno del dato: al traducir preguntas de negocio a consultas legibles y ejecutables, el equipo de datos puede revisar exactamente qué se consulta y con qué filtros antes de autorizar su ejecución en producción.
- Extracción de subgrafos para ciencia de datos: investigadores que necesitan muestras del grafo pueden describir el subconjunto deseado en lenguaje natural y obtener el MATCH correspondiente en lugar de aprender el esquema completo.
- Entornos multi-tenant con esquemas variables: al recibir el esquema como parte de la entrada, el mismo modelo puede servir a varias bases con modelos de datos distintos siempre que se le proporcione el esquema correcto en cada petición.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card describe la metodología de evaluación, pero el fragmento disponible se interrumpe antes de exponer las cifras.

Metodología declarada por el autor (sin valores asociados):

- Métrica principal: *live result accuracy*, obtenida ejecutando tanto la predicción como el Cypher de referencia contra la misma base Neo4j.
- Comparación de registros como multiconjuntos que preservan duplicados.
- El orden de columnas dentro de un registro se ignora.
- Las devoluciones de nodo completo y las proyecciones de propiedades no se consideran equivalentes de forma automática.
- Las correcciones de dirección de relación solo se aplican cuando el esquema las autoriza.
- No se usa el *exact match* a nivel de cadena Cypher como métrica principal.
- Se excluyen del cálculo estricto las filas con alias de base de datos no disponible o con ejecución fallida.

Tamaños de los conjuntos de evaluación (datos sí disponibles):

| Split | Filas | Descripción |
|---|---:|---|
| Train | 29.191 | Usado para el ajuste fino |
| Test | 8.499 | Split estratificado 80/20 del mismo pool que train, agrupado por complejidad |
| Heldout | 2.561 | Cuatro dominios de grafo eliminados antes del split train/test (2.177 fáciles, 330 medias, 54 complejas) |

## Requisitos de hardware

- VRAM en 16 bits (formato publicado): aproximadamente 16-17 GB solo para los pesos, más la caché KV, que crece con la longitud de contexto y el número de secuencias concurrentes.
- VRAM en 8 bits: alrededor de 9 GB de pesos. En 4 bits (AWQ, GPTQ o GGUF Q4_K_M, previa conversión): aproximadamente 5-6 GB.
- GPU recomendadas para 16 bits: A100 40 GB, H100, L40S 48 GB o A6000 48 GB. En una RTX 4090 de 24 GB cabe en 16 bits, pero con muy poco margen para caché KV si se busca contexto largo o *batching* amplio.
- GPU de consumo: en 4 bits cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores, así como en equipos Apple Silicon con 16 GB de memoria unificada o más.
- Opciones de despliegue: vLLM y TGI para servicio en GPU con *batching* continuo; transformers con bitsandbytes para cargas cuantizadas; llama.cpp u Ollama si se convierte previamente a GGUF (no se publica conversión oficial). El repositorio está marcado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni comportamiento bajo carga concurrente.
- Advertencia de despliegue: el tamaño del repositorio (0,1 GB) es incompatible con un modelo fusionado en 16 bits de ~8.000 millones de parámetros (esperable en torno a 16 GB). Conviene verificar la lista de archivos antes de asumir que los pesos completos están publicados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SarthakKumar571999/qwen3-8b-text2cypher | ~8.000 M (denso) | No disponible | Text2Cypher (Neo4j) | No disponible | HuggingFace, 0 descargas |
| Qwen3-8B (base) | ~8.000 M (denso) | No disponible en esta búsqueda | Propósito general | No disponible en esta búsqueda | Ampliamente distribuido |
| neo4j/text2cypher (familia de modelos de Neo4j) | Varía según variante (7B-8B en las versiones basadas en Llama) | No disponible en esta búsqueda | Text2Cypher (Neo4j) | No disponible en esta búsqueda | HuggingFace, mantenido por Neo4j |
| Modelo de código generalista (por ejemplo, Qwen2.5-Coder-7B-Instruct) | ~7.000 M | No disponible en esta búsqueda | Código y SQL/Cypher en modo zero-shot | No disponible en esta búsqueda | Ampliamente distribuido |

No se dispone de cifras comparativas de rendimiento entre estas alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, especialización y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial está permitido. Aunque el modelo base Qwen3-8B se distribuye habitualmente bajo licencia permisiva, la ficha de este derivado no especifica términos, lo que supone un riesgo legal en producción.
- Riesgo de alucinación de esquema: pese a que el *system prompt* prohíbe explícitamente inventar etiquetas, tipos de relación o propiedades, es un fallo posible y esperable en modelos de este tamaño; toda consulta generada debería validarse contra el esquema antes de ejecutarse.
- Riesgo de consultas no ejecutables o costosas: una consulta sintácticamente correcta puede ser semánticamente errónea o producir un producto cartesiano sobre un grafo grande. Se recomienda ejecutar con límites de tiempo, de memoria y, en lo posible, en modo solo lectura.
- Dominio restringido: el ajuste está orientado exclusivamente a Cypher sobre Neo4j. No se documenta soporte para SQL, Gremlin, SPARQL ni para dialectos de otros motores de grafos.
- Idiomas no declarados: el campo de idiomas está vacío y los ejemplos de la model card están en inglés, por lo que el comportamiento en castellano no está verificado.
- Validación comunitaria inexistente: 0 descargas y 1 like en el momento de redactar esta ficha, sin issues ni discusiones públicas que permitan contrastar el comportamiento real.
- Posible solapamiento train/test: el conjunto de test procede del mismo pool que el de entrenamiento y solo se diferencia por una división estratificada por complejidad, por lo que sus resultados no miden generalización. La métrica relevante para esquemas nuevos es la del conjunto *heldout*.
- Cobertura limitada de dominios *heldout*: solo cuatro dominios (stackoverflow, stackoverflow2, network, bluesky) y únicamente 54 consultas complejas en ese split, lo que limita la significación estadística en el tramo de mayor dificultad.
- Opacidad del entrenamiento: no se publican hiperparámetros del LoRA, composición detallada del dataset, ni si hubo etapas de alineación posteriores, lo que dificulta la reproducibilidad.
- Integridad del repositorio: el tamaño de 0,1 GB es inconsistente con un modelo fusionado en 16 bits, por lo que conviene comprobar los archivos antes de integrarlo en un pipeline.
- Formato de salida estricto: el modelo está entrenado para devolver solo la consulta. Cualquier texto adicional debe tratarse como anomalía y filtrarse, y la ausencia de fences de Markdown implica que el parseo debe hacerse sobre el texto plano.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SarthakKumar571999/qwen3-8b-text2cypher
- Modelo base utilizado para el ajuste: https://huggingface.co/unsloth/Qwen3-8B-unsloth-bnb-4bit
- No se han encontrado enlaces adicionales relevantes (paper, blog, repositorio o demo) en la búsqueda web realizada; los resultados devueltos correspondían a páginas de ChatGPT y no guardan relación con este modelo.
