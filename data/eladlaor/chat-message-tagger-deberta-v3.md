# eladlaor/chat-message-tagger-deberta-v3

## Resumen

Chat-message-tagger-deberta-v3 es un clasificador de texto multi-etiqueta desarrollado por eladlaor que asigna 15 etiquetas semanticas independientes a mensajes de chats de grupo. Se construye sobre `microsoft/deberta-v3-base` (184,3 millones de parametros) mediante un fine-tuning en dos fases: primero un head de clasificacion con el backbone congelado y despues una adaptacion LoRA con rango 16 que se fusiona en los pesos finales. El modelo resuelve el problema de enriquecer datos de conversacion no estructurados con senales semanticas estructuradas, algo relevante para analitica de comunidades, curación de newsletters, ranking de discusiones y herramientas de moderacion.

Cada mensaje de entrada produce 15 puntuaciones sigmoideas independientes (una por etiqueta), de modo que varias etiquetas pueden estar activas simultaneamente: `professional`, `question`, `experience_sharing`, `resource`, `opinion`, `how_to`, `humor`, `announcement`, `off_group_topic`, `reaction`, `substantive`, `discussion_init`, `emotional`, `disagreement` y `positive_reinforcement`. El modelo se distribuye con umbrales por etiqueta optimizados en validacion y una taxonomia de etiquetas en JSON, lo que facilita su integracion en pipelines de analisis.

Es relevante ahora porque los modelos encoder pequenos y especializados siguen siendo la opcion mas eficiente en coste para tareas de clasificacion a gran escala, donde un LLM generativo resultaria entre uno y dos ordenes de magnitud mas caro por inferencia. Su licencia Apache 2.0 y su compatibilidad con text-embeddings-inference lo hacen desplegable en infraestructura estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa v3, atencion desacoplada y embedding compartido en DeBERTa-v3-base) |
| Parametros totales | 184.363.023 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible de forma explicita; los ejemplos de uso truncan a `max_length=256` |
| Tipos de cuantizacion | no disponible; el autor entrena y evalua en fp32 (DeBERTa v3 produce NaN en fp16/bf16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados con LoRA incorporado); tokenizer.json con 7 tokens especiales |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-base`, un encoder transformer con atencion desacoplada (contenido y posicion calculados por separado) y un embedding compartido entre la capa de entrada y el head de enmascaramiento de lenguaje. Sobre ese backbone se anade una cabeza de clasificacion multi-etiqueta con 15 salidas y activacion sigmoidea, configurada con `problem_type=multi_label_classification`.

El entrenamiento se realizo en dos fases: una primera con el backbone congelado y solo el head entrenable (learning rate 1e-3), seguida de una adaptacion LoRA de rango 16 con learning rate 2e-5. La funcion de perdida es `BCEWithLogitsLoss` con `pos_weight` por etiqueta para compensar el desbalance de las clases raras. El conjunto de entrenamiento consta de 3.842 muestras procedentes de chats de grupo de comunidades tecnicas profesionales, originalmente en hebreo y traducidas al ingles. El dataset no se ha publicado para proteger la privacidad de los participantes. Los pesos finales se distribuyen con la LoRA fusionada en el fichero `model.safetensors`.

## Capacidades

- Clasificacion de texto multi-etiqueta con 15 categorias semanticas independientes por mensaje.
- Deteccion de intencion conversacional: preguntas (`question`), peticiones de ayuda, iniciacion de discusion (`discussion_init`).
- Deteccion de contenido sustantivo: `professional`, `substantive`, `resource`, `how_to`, `experience_sharing`.
- Deteccion de tono: `humor`, `emotional`, `disagreement`, `positive_reinforcement`.
- Deteccion de contenido fuera de tema (`off_group_topic`) y de mensajes de reaccion (`reaction`).
- Soporte de tokens especiales para URLs y menciones (7 tokens especiales en el tokenizer), lo que permite normalizar enlaces y usuarios antes de la clasificacion.
- Umbrales por etiqueta optimizados en validacion, distribuidos en `thresholds.json`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder de clasificacion, no un modelo generativo.
- No soporta vision ni audio.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Analitica de comunidades en Slack, Discord, Telegram o WhatsApp: clasificar cada mensaje en las 15 etiquetas para construir dashboards de actividad, medir proporcion de preguntas frente a recursos compartidos y detectar periodos de baja sustancia.
- Curación automatizada de newsletters: filtrar mensajes con `substantive` y `resource` activos para alimentar un resumen automatico de los hilos de mayor valor de la semana.
- Ranking de discusiones: enriquecer cada mensaje con senales semanticas antes de pasarlo a un sistema de ranking o a un LLM que genere resumenes, reduciendo el volumen de texto que procesa el modelo generativo.
- Moderacion asistida: marcar mensajes con `off_group_topic` o `disagreement` para revision humana, sin aplicar acciones automaticas.
- Enrutamiento de soporte comunitario: identificar mensajes con `question` y `how_to` para dirigirlos a los canales o miembros adecuados.
- Investigacion sobre dinamicas de grupo: analizar la distribucion de tipos de mensaje por canal, por hora o por miembro para estudiar participacion y cohesion.
- Preprocesado para sistemas RAG sobre historicos de chat: etiquetar los mensajes antes de indexarlos para permitir filtros semanticos en la recuperacion.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados) sobre el split de test del dataset `chat-message-multilabel`:

| Metrica | Valor |
|---|---|
| Mean F1 (macro) | 0,5979 |
| Hamming Loss | 0,1231 |
| Mean AUC-ROC | 0,8826 |
| Subset Accuracy | 0,193 |
| Mean ECE | 0,136 |

Resultados por etiqueta en test (F1 / AUC-ROC):

| Etiqueta | F1 | AUC-ROC |
|---|---|---|
| professional | 0,839 | 0,882 |
| question | 0,889 | 0,977 |
| experience_sharing | 0,631 | 0,844 |
| resource | 0,746 | 0,928 |
| opinion | 0,626 | 0,853 |
| how_to | 0,530 | 0,844 |
| humor | 0,347 | 0,792 |
| announcement | 0,723 | 0,969 |
| off_group_topic | 0,258 | 0,753 |
| reaction | 0,725 | 0,950 |
| substantive | 0,787 | 0,963 |
| discussion_init | 0,706 | 0,870 |
| emotional | 0,437 | 0,852 |
| disagreement | 0,123 | 0,889 |
| positive_reinforcement | 0,603 | 0,873 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,75 GB en fp32 (184 millones de parametros × 4 bytes) mas overhead de activaciones; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna; para alto throughput, A100, H100 o L4. Para desarrollo local, RTX 3060, RTX 4060, RTX 4090 o incluso CPU.
- Cabe holgadamente en GPU consumer; tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: `transformers` (referencia del autor), Text Embeddings Inference (el modelo esta marcado como `text-embeddings-inference` y `endpoints_compatible`), y en general cualquier runtime compatible con safetensors y arquitectura DeBERTa v3. No se documenta soporte GGUF ni llama.cpp.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota importante: usar fp32; DeBERTa v3 produce NaN en fp16 y bf16 segun el autor.

## Comparativa con modelos similares

No se han publicado comparativas con modelos alternativos en la informacion disponible. Como referencia estructural, el modelo hereda el tamano y la arquitectura de `microsoft/deberta-v3-base` (184 millones de parametros, licencia MIT), pero la comparativa de rendimiento frente a otros clasificadores de mensajes de chat no esta documentada.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| chat-message-tagger-deberta-v3 | 184,3 M | no disponible (ejemplos a 256 tokens) | Clasificacion multi-etiqueta de mensajes de chat (15 etiquetas) | Apache 2.0 |
| microsoft/deberta-v3-base | 184 M aprox. | 512 tokens (estandar del backbone) | Modelo base, sin fine-tuning para esta tarea | MIT |
| Alternativas de clasificacion de chat | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo ingles: el modelo no soporta otros idiomas, a pesar de que los datos originales estaban en hebreo y se tradujeron.
- Rendimiento muy desigual por etiqueta: `disagreement` (F1 0,123) y `off_group_topic` (F1 0,258) son practicamente inutilizables para decisiones automaticas; `humor` (0,347) y `emotional` (0,437) tambien son debiles.
- Subset Accuracy de 0,193: la probabilidad de acertar exactamente la combinacion completa de etiquetas activas es baja, por lo que el modelo debe usarse etiqueta a etiqueta y no como clasificador de conjunto.
- Calibracion moderada: Mean ECE de 0,136 indica que las probabilidades no estan bien calibradas; usar los umbrales de `thresholds.json` en lugar de un corte fijo de 0,5.
- Riesgo de alucinacion no aplica en sentido generativo, pero si hay riesgo de falsos positivos y falsos negativos sistematicos en las etiquetas con bajo F1.
- Sesgos potenciales derivados del corpus: 3.842 muestras de comunidades tecnicas profesionales, traducidas del hebreo; puede no generalizar a otros dominios, registros o culturas conversacionales.
- El dataset de entrenamiento no es publico, lo que limita la reproducibilidad y la auditoria del modelo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en dominios distintos al de entrenamiento.
- En produccion, usar fp32: fp16 y bf16 producen NaN en DeBERTa v3 segun el autor, lo que descarta optimizaciones de precision habituales.
- El modelo esta pensado como senal de enriquecimiento, no como decision final en moderacion; el autor lo presenta como soporte a revision humana.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eladlaor/chat-message-tagger-deberta-v3
- Modelo base: https://huggingface.co/microsoft/deberta-v3-base
- No se han encontrado en la informacion disponible otros enlaces a papers, blogs, repositorios o demos.
