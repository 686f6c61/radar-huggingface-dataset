# jaredpalmer/kev-4b

## Resumen

Kev-4B es un modelo de decisión desarrollado por Jared Palmer (TypeSafe) que responde preguntas tipadas sobre un documento en una sola pasada forward, sin generar texto. Dado un estado (el documento) y un conjunto de preguntas con opciones nombradas, devuelve una distribución de probabilidad calibrada sobre las opciones de cada pregunta, lo que permite aplicar umbrales y derivar los casos inciertos a revisión humana. Implementa la API pública System One de TypeSafe (`POST /v1/systemone`), de modo que el SDK de TypeSafe funciona sin cambios contra el modelo.

Técnicamente es un adaptador LoRA de rango 16 sobre el backbone congelado Qwen3.5-4B-Base (32 capas, 24 de Gated DeltaNet con atención lineal y 8 de atención completa, hidden size 2.560), más una cabeza pointer que puntúa el token de cierre de cada opción contra el token final de la pregunta. El adaptador aporta 33,8M de parámetros y el conjunto cabe en una GPU de 24 GB o en un Mac Apple Silicon de 32 GB. La versión Kev 1.0 se publicó el 24 de septiembre de 2026 bajo licencia Apache-2.0.

Su relevancia actual está en el nicho de clasificación y enrutado con probabilidades fiables: frente a un LLM generativo, evita la generación de texto y expone directamente una confianza calibrada (temperatura T = 2,41 fijada en `head.pt`), lo que facilita pipelines de automatización con umbrales congelados sobre una muestra etiquetada del propio flujo de trabajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (24 capas Gated DeltaNet de atención lineal + 8 de atención completa) con adaptador LoRA y cabeza pointer; backbone congelado |
| Parametros totales | Backbone Qwen3.5-4B (tamaño exacto no disponible) + 33,8M del adaptador LoRA |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Estados de hasta 65.536 tokens servidos, más al menos 8.192 tokens por pregunta; longitud validada: 8.192 tokens |
| Tipos de cuantizacion | No disponible (servido en bf16; evaluación en fp32) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (adaptador y cabeza); modelo base Apache-2.0 |
| Formato de pesos | safetensors (librería PEFT); cabeza en `head.pt` |

## Arquitectura y entrenamiento

El modelo no es un generador de texto: el backbone Qwen3.5-4B-Base (revisión `1001bb4d`) se ejecuta en modo prefill-only y permanece congelado. Sobre él se entrena un adaptador LoRA de rango 16 y α 32 aplicado a las proyecciones de atención, MLP y DeltaNet, con 33,8M de parámetros. La cabeza pointer consta de dos proyecciones que puntúan el token de cierre de cada opción contra el token final de la pregunta; un softmax sobre esas puntuaciones produce las probabilidades. El estado se computa una sola vez y se cachea, y cada pregunta se responde como una fila independiente que continúa desde el estado compartido, de forma que las preguntas no pueden influirse entre sí.

El entrenamiento se realizó con autocast bf16 sobre pesos fp32, con estados de entrenamiento de como máximo 7.552 tokens. La calibración se resolvió con una única temperatura, T = 2,41, almacenada en `head.pt` y aplicada en el momento de la carga. El adaptador se fusiona en el modelo base al cargar y se sirve en bf16. Los datasets declarados en la model card incluyen banking77, boolq, ag_news, multi_nli, sst5, yelp_review_full, trec, dbpedia_14, amazon_reviews_multi_en, imdb, commitpackft, Aegis-AI-Content-Safety-Dataset-2.0 y consumer-finance-complaints-large. No se detalla en la información disponible el número total de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF o DPO.

El modelo admite tres tipos de pregunta: `choice` (de 1 a 255 opciones nombradas, con descripción opcional, que devuelve probabilidad por opción, la más probable y una confianza), `score` (de 1 a 255 niveles ordenados, con probabilidad por nivel e índice esperado) y `noul` (sí/no con descripciones opcionales, que devuelve la probabilidad de sí).

## Capacidades

- Clasificación y enrutado de documentos con salida de probabilidad calibrada por opción, umbralizable.
- Preguntas tipadas de elección múltiple (`choice`) con hasta 255 opciones nombradas y descripciones opcionales.
- Puntuación ordinal (`score`) con hasta 255 niveles ordenados y devolución del índice de nivel esperado.
- Preguntas booleanas (`noul`) con probabilidad de sí y descripciones opcionales.
- Extracción de decisiones sobre documentos de varios miles de tokens (clasificación, routing, triage, elección de extracción, comprobación de políticas y elegibilidad).
- Evaluación de una respuesta propuesta contra criterios declarados.
- Procesamiento de estados en texto plano o en JSON (objeto o array) renderizado como texto etiquetado.
- Caché del estado compartido entre preguntas, con independencia garantizada entre ellas.
- No soporta generación de texto, chat, resumen ni question answering abierto.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Triage de tickets de soporte: el modelo clasifica cada ticket contra un conjunto de categorías y devuelve una probabilidad por categoría; los casos por debajo de un umbral congelado sobre una muestra etiquetada del propio backlog se enrutan a revisión humana.
- Enrutado de solicitudes en un backend: con preguntas `choice` sobre el texto de la solicitud se decide a qué cola o equipo va, aprovechando la independencia entre preguntas para evaluar varios criterios en una sola pasada sobre el estado cacheado.
- Moderación de contenido: usando el dataset Aegis-AI-Content-Safety entre los datos declarados, se puede preguntar por la probabilidad de que un texto incumpla una política concreta y automatizar solo los casos de alta confianza.
- Verificación de políticas y elegibilidad: dada una política escrita como estado y una propuesta de decisión, se pregunta si cumple cada criterio mediante preguntas `noul`; la salida calibrada permite distinguir entre cumplimiento claro, incumplimiento claro y caso dudoso.
- Clasificación de reseñas y feedback de producto: con las fuentes de reviews declaradas (yelp, amazon, sst5, imdb), se puede puntuar la polaridad en escala ordinal con `score` y obtener el nivel esperado, útil para agregados y alertas.
- Revisión de cambios de código: con commitpackft entre los datos declarados, se puede preguntar por la categoría de un commit o por si un cambio toca un área sensible, como filtro previo en pipelines de CI/CD.
- Sustitución autoalojada de un endpoint System One: al implementar la API pública de TypeSafe, el SDK existente funciona sin cambios, lo que permite migrar cargas de trabajo a hardware modesto (una GPU de 24 GB).
- Punto de partida para ajuste fino: `kev.train --init_from jaredpalmer/kev-4b` permite adaptar el modelo a las etiquetas propias de un dominio concreto.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card (no verificados):

| Evaluación | Conjunto | Preguntas | Accuracy | Brier score |
|---|---|---|---|---|
| Out-of-domain (test bloqueado, leído una vez) | transfer-v4: seis fuentes públicas nunca entrenadas y estructuras de política reservadas | 656 | 0,838 | 0,224 |
| Datasets públicos reservados (test) | breadth-v1: 14 datasets públicos reservados | 3.089 | 0,690 | no disponible |
| Familias de tareas reservadas (desarrollo) | tasksource-heldout-v1: 17 de 24 familias reservadas | 1.993 | 0,677 | no disponible |
| Registros de skill (test) | hard-v1: etiquetas programáticas, plantillas reservadas | 1.088 | 0,803 | 0,278 |
| Herramientas de desarrollo (test) | devtools-v1: seis fuentes públicas de tooling | 1.071 | 0,756 | 0,342 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada: el autor indica que el modelo cabe en una GPU de 24 GB o en un Mac Apple Silicon de 32 GB; el repositorio ocupa 0,9 GB (adaptador y cabeza), pero la inferencia requiere cargar el backbone Qwen3.5-4B completo en bf16.
- GPU recomendadas: no se especifican modelos concretos; por el requisito de 24 GB encajan A100 40/80 GB, H100, L40S y RTX 4090 (24 GB).
- GPU de consumo: sí, en tarjetas de 24 GB como la RTX 4090; no se indica viabilidad en tarjetas de 16 GB o menos.
- Opciones de despliegue: el modelo se sirve a través del stack propio de Kev (adaptador PEFT fusionado en el backbone al cargar, cabeza en `head.pt`) y expone la API System One (`POST /v1/systemone`) compatible con el SDK de TypeSafe. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El diseño prefill-only con estado cacheado y preguntas independientes reduce el coste por pregunta al reutilizar el cómputo del estado.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos alternativos en la información proporcionada. Como referencia estructural, el modelo se apoya en Qwen3.5-4B-Base (32 capas, hidden size 2.560, Apache-2.0), pero no se han facilitado datos de rendimiento de ese backbone ni de otros clasificadores comparables para establecer una tabla fiable.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kev-4B | Backbone 4B + 33,8M de adaptador | 65.536 tokens de estado; 8.192 validados | Decisiones tipadas con probabilidad calibrada | Apache-2.0 | Hugging Face (PEFT) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: no hay soporte declarado de otros idiomas.
- No genera texto: no sirve para chat, resumen, question answering abierto ni ninguna tarea que requiera producir contenido; únicamente puntúa las opciones que se le proporcionan.
- Uso fuera de alcance: decisiones totalmente automatizadas con consecuencias legales, médicas, financieras, laborales o similares.
- Longitud de contexto: aunque se sirven estados de hasta 65.536 tokens, la longitud validada es de 8.192 tokens y los estados de entrenamiento no superaron los 7.552 tokens; el rendimiento más allá de ese rango no está garantizado.
- Calibración dependiente del dominio: la temperatura es única (T = 2,41) y los umbrales deben congelarse sobre una muestra etiquetada de la carga de trabajo real; la calibración puede degradarse fuera de la distribución de entrenamiento.
- Riesgo de error en dominios alejados: la accuracy cae al 0,677 en familias de tareas reservadas y al 0,690 en datasets públicos reservados, frente al 0,838 en el test out-of-domain específico; conviene validar antes de desplegar en un dominio nuevo.
- Benchmarks no verificados: todos los resultados del model-index están marcados como `verified: false`, es decir, son declaraciones del autor sin verificación independiente.
- Dependencia del ecosistema: la API System One y el flujo de entrenamiento (`kev.train`) pertenecen al proyecto de TypeSafe; la portabilidad a otros stacks de serving no está documentada.
- Licencia: adaptador y cabeza son Apache-2.0 y el modelo base también, por lo que no se declaran restricciones adicionales para uso comercial; aun así, conviene revisar los términos de los datasets de entrenamiento citados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaredpalmer/kev-4b
- Repositorio del proyecto: https://github.com/jaredpalmer/kev
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Datasets citados: https://huggingface.co/datasets/legacy-datasets/banking77, https://huggingface.co/datasets/google/boolq, https://huggingface.co/datasets/fancyzhx/ag_news, https://huggingface.co/datasets/nyu-mll/multi_nli, https://huggingface.co/datasets/SetFit/sst5, https://huggingface.co/datasets/Yelp/yelp_review_full, https://huggingface.co/datasets/CogComp/trec, https://huggingface.co/datasets/fancyzhx/dbpedia_14, https://huggingface.co/datasets/SetFit/amazon_reviews_multi_en, https://huggingface.co/datasets/stanfordnlp/imdb, https://huggingface.co/datasets/bigcode/commitpackft, https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-2.0, https://huggingface.co/datasets/davidheineman/consumer-finance-complaints-large
- Paper, blog o demo adicionales: no disponible
