# mstrasser/jeff-adapter-query-route

## Resumen

`jeff-adapter-query-route` es un adaptador LoRA de tipo PEFT desarrollado por el usuario mstrasser para `jeff-base` v1.4, un modelo de decisión abierto y de pequeño tamaño que, según la model card, es un fine-tune de Qwen3.5-0.8B. El adaptador resuelve una tarea muy concreta: la selección de fuente de búsqueda (query routing). Dado un menú de fuentes documentales, índices, bases de datos o herramientas descritas con nombre y descripción, y una consulta del usuario, el modelo devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto que haya que parsear.

La relevancia de este adaptador radica en su enfoque de "decision model": en lugar de emplear un LLM generativo para elegir herramienta o fuente, se apoya en un clasificador calibrado que produce directamente una distribución de probabilidad sobre las etiquetas del menú. Esto simplifica la integración en pipelines de recuperación aumentada (RAG) y sistemas de agentes, donde la latencia y la fiabilidad de la decisión importan más que la generación libre. El adaptador permite además indicar explícitamente dos casos especiales: `none` (ninguna fuente del menú responde a la consulta o no hace falta búsqueda) y `several` (la respuesta requiere combinar varias fuentes).

El modelo está publicado bajo licencia Apache 2.0, soporta únicamente inglés y su repositorio ocupa aproximadamente 0,1 GB, lo que refleja que se trata de un adaptador y no de un modelo completo. En el momento de la consulta no registra descargas ni likes, y fue creado el 5 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre `mstrasser/jeff-base` v1.4 (fine-tune de Qwen3.5-0.8B, según model card) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 0,8B según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT que se carga sobre `jeff-base` en su revisión v1.4. Según la model card, `jeff-base` es un fine-tune de Qwen3.5-0.8B, por lo que la arquitectura subyacente es un transformer decoder de pequeño tamaño. El adaptador no genera texto: expone una función de decisión (`jeff.retrieval.query-route.source`) que, a partir de un contexto con el menú de fuentes y una consulta, devuelve una probabilidad calibrada por etiqueta en un solo forward pass. El motor rechaza adaptadores entrenados sobre otra base, de modo que este adaptador solo carga sobre la revisión v1.4 indicada.

El adaptador fue entrenado el 25 de octubre de 2026. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; esa información no está disponible. La evaluación reportada se apoya en dos conjuntos de test internos generados por el mismo generador que los datos de entrenamiento (2.000 filas cada uno), lo que, como advierte la propia model card, mide menos que un test público o con documentos reales. Se incluye además un conjunto de calibración de 2.000 filas con un umbral de confianza de 0,343, una precisión del 98,7 % y una cobertura del 100,0 % para la función `source`.

## Capacidades

- Clasificación de consultas sobre un menú de fuentes: selecciona qué colección documental, índice, base de datos o herramienta debe atender una consulta.
- Salida calibrada por etiqueta: devuelve una probabilidad para cada opción del menú en un único forward pass, sin texto generado que parsear.
- Etiquetas definidas por el llamador: el menú admite hasta 13 etiquetas, cada una con una clave y su texto descriptivo.
- Etiquetas especiales `none` y `several`: indica que ninguna fuente del menú responde a la consulta o que se necesitan varias fuentes para responder.
- Decisión basada en el contenido de las fuentes: la model card indica que se juzga por lo que contiene cada fuente, no por palabras compartidas con su nombre.
- Confianza utilizable en producción: la calibración permite aplicar un umbral (0,343 en la función `source`) para distinguir respuestas confiables.
- Integración vía SDK de Python (`jeff.Jeff.local` o `jeff.Jeff.remote`) y API remota con clave.
- No soporta generación de texto, reescritura de consultas ni tool calling generativo; su alcance es exclusivamente la selección de fuente.

## Casos de uso

- Enrutamiento en asistentes RAG multi-fuente: cuando el asistente dispone de varias colecciones documentales (manuales, FAQ, contratos, tickets), el adaptador decide a cuál enviar cada consulta con una probabilidad calibrada, evitando búsquedas indiscriminadas en todas las fuentes.
- Selección de herramienta en agentes: con un menú de herramientas descritas por nombre y función, el modelo elige la herramienta adecuada para cada paso, lo que simplifica la orquestación frente a un LLM generativo que deba emitir JSON parseable.
- Detección de consultas que no requieren búsqueda: la etiqueta `none` permite filtrar saludos, agradecimientos o peticiones de reformulación antes de lanzar una consulta costosa a un índice vectorial.
- Enrutamiento multi-fuente para preguntas compuestas: la etiqueta `several` señala consultas que requieren combinar hechos de dos o más fuentes, lo que permite al orquestador planificar varias recuperaciones en lugar de una sola.
- Atención al cliente con catálogo de sistemas: en un escenario de posventa con fuentes como manuales de producto, términos de garantía, pedidos de clientes y precios, el adaptador dirige cada pregunta a la fuente correcta (por ejemplo, una consulta sobre garantía a `warranty_terms`).
- Clasificación de consultas en pipelines de datos: integrado como paso previo en un ETL o en un servicio de ingesta, etiqueta consultas entrantes para dirigirlas al procesador o índice correspondiente con bajo coste computacional.
- Filtrado previo en buscadores empresariales: antes de ejecutar la búsqueda, decide si la consulta debe ir a un índice de documentación técnica, a una base de datos de pedidos o a precios, reduciendo latencia y ruido en los resultados.

## Benchmarks y rendimiento

| Test | Filas | Exactitud |
|---|---:|---:|
| Test interno (generador) | 2.000 | 99,3 % |
| Segundo test interno de casos no vistos (generador) | 2.000 | 98,9 % |

| Función | Umbral | Precisión | Cobertura | Filas de calibración |
|---|---:|---:|---:|---:|
| `source` | 0,343 | 98,7 % | 100,0 % | 2.000 |

La model card advierte que los tests de tipo "generator" proceden del mismo generador que los datos de entrenamiento y, por tanto, miden menos que un test público o con documentos reales. No se han publicado resultados en benchmarks públicos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de un adaptador LoRA sobre un modelo base de 0,8B, la huella es reducida y apta para GPU de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible; por el tamaño del modelo base, cualquier GPU consumer reciente debería ser suficiente, pero no se confirma en la documentación.
- Cabe en GPU consumer: presumiblemente sí, dado el tamaño del modelo base (0,8B), aunque no se especifica en la información proporcionada.
- Opciones de despliegue: SDK de Python `jeff` con modo local (`jeff.Jeff.local`) o remoto (`jeff.Jeff.remote` contra `https://api.jeffhub.ai`); el motor y los SDK están en github.com/firelex/jeff. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mstrasser/jeff-adapter-query-route` | Adaptador LoRA de clasificación calibrada | no disponible (base 0,8B) | no disponible | Apache 2.0 | HuggingFace, SDK propio, API remota |
| LLM generativo con tool calling (p. ej. Qwen3.5-0.8B) | Generación + selección de herramienta vía prompt | 0,8B | no disponible | según modelo | Amplia |
| Clasificadores de intención tipo BERT | Clasificación supervisada | 0,1-0,3B típicamente | 512 tokens típicamente | variable | Amplia |

La comparación directa con alternativas concretas no está disponible en la información proporcionada. Frente a un LLM generativo que deba emitir una herramienta en texto, este adaptador ofrece una salida calibrada sin parseo, a costa de limitarse a la selección de fuente y no poder reformular la consulta.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- Alcance restringido: únicamente selecciona la fuente; no reescribe la consulta ni genera texto.
- El menú admite como máximo 13 etiquetas, lo que limita el número de fuentes simultáneas.
- Dependencia estricta de la revisión v1.4 de `jeff-base`: el motor rechaza el adaptador si la base no coincide.
- Los benchmarks reportados proceden de tests internos generados por el mismo generador que los datos de entrenamiento, por lo que pueden sobreestimar el rendimiento en documentos reales.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea cuando la consulta es ambigua o el menú de fuentes está mal descrito.
- La calibración reportada (precisión 98,7 % con cobertura 100 %) se midió sobre un conjunto de calibración interno; el comportamiento puede degradarse con distribuciones de consultas distintas.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base `jeff-base` y de Qwen3.5-0.8B subyacente.
- El repositorio no registra descargas ni likes y los paquetes del SDK no estaban en PyPI en el momento de la consulta, lo que implica instalarlos desde GitHub.
- No se documentan sesgos conocidos ni limitaciones de contexto específicas.

## Enlaces

- HuggingFace: https://huggingface.co/mstrasser/jeff-adapter-query-route
- Modelo base: https://huggingface.co/mstrasser/jeff-base
- Página del catálogo: https://jeffhub.ai/catalogue/jeff.retrieval.query-route
- Repositorio de código, servidor y SDKs: https://github.com/firelex/jeff
- Guía de instalación del SDK: https://jeffhub.ai/docs/sdk/install
- API remota: https://api.jeffhub.ai
- Plataforma: https://jeffhub.ai
