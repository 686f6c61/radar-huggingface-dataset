# jwcwn/zl-lite-body-1

## Resumen

zl-lite-body-1 es un modelo de decisión de tipo "system-one" desarrollado por el usuario jwcwn, un fine-tune de Qwen/Qwen3.5-0.8B-Base con 852.985.920 parámetros (aproximadamente 0.85B). No es un modelo generativo: lee un estado de entrada (una cadena o cualquier valor JSON) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una distribución de probabilidad calibrada para cada pregunta. Admite tres formatos de pregunta: Choice (entre 2 y 255 opciones, opcionalmente descritas), Score (entre 2 y 10 niveles descritos) y Noul (probabilidad de sí).

El modelo forma parte de la familia "decider", una serie de modelos de decisión con la misma interfaz (`decider.infer.Decider`, endpoint `POST /v1/systemone` en formato de TypeSafe) y el mismo protocolo de lectura: logits de letra en un slot de respuesta, softmax sobre las opciones. Según la model card, el entrenamiento consistió en una época sobre una mezcla completa de 1.47M ejemplos y 455M tokens, partiendo del modelo base Qwen3.5-0.8B-Base.

Su relevancia radica en que sustituye la generación de texto libre por una salida estructurada y calibrada, con probabilidades directamente utilizables en sistemas de enrutado, clasificación o juicio automatizado, sin necesidad de decodificación ni de parseo posterior. Es el miembro más pequeño de la familia, pensado para enrutado, decisiones sí/no y consultas sobre estados cortos, con una velocidad aproximadamente 1.5 veces superior a la del decider-2b.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B-Base), con cabeza de lectura sobre logits de letra en slot de respuesta |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16, 1.4 GB) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B-Base, un transformer decoder-only denso de aproximadamente 0.85B parámetros, y se entrena con un objetivo de decisión en lugar de generación de texto. La salida se obtiene leyendo los logits de las letras asociadas a cada opción en un slot de respuesta y aplicando softmax sobre ellas, lo que produce una distribución de probabilidad calibrada por pregunta en un solo forward pass, sin decodificación autoregresiva ni parseo de la salida.

El entrenamiento consistió en una época sobre la mezcla completa del proyecto decider: 1.47M ejemplos y 455M tokens, con un tiempo de cómputo declarado de 4.5 horas sobre una GH200. La receta es la misma que la del decider-2b (`scripts/train.sh full`), lo que según el autor hace que la calibración se mantenga en todos los tamaños. La temperatura óptima ajustada sobre datos in-task resultó ser 1.03, idéntica a la del 2B. No se especifica en la información disponible si hubo etapas de RLHF o DPO; la model card menciona que las variantes de 4B y 35B "no tienen etapa de RL", pero no detalla el caso del 0.8B.

## Capacidades

- Clasificación y enrutado con opciones tipadas: Choice entre 2 y 255 opciones, con descripciones opcionales por opción.
- Puntuación ordinal: Score con 2 a 10 niveles descritos, devolviendo una distribución sobre los niveles.
- Juicios binarios probabilísticos: Noul (probabilidad de sí) para preguntas de tipo sí/no.
- Salida estructurada y calibrada en un único forward pass, sin generación de texto ni parseo.
- Soporte de múltiples preguntas simultáneas en una misma llamada (multi-task), devolviendo una distribución por pregunta.
- Consultas sobre estados JSON, incluyendo localización de registros por ruta (con y sin índices escritos).
- Clasificación con conjuntos amplios de etiquetas (hasta 219 etiquetas evaluadas en la model card).
- Capacidad de responder preguntas sobre artículos largos (evaluado en QuALITY con 5-8k tokens).
- Sin soporte declarado de tool calling, agentes multi-paso, visión, audio ni modo thinking.
- Idiomas: únicamente inglés según la model card.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el texto del ticket como estado y un conjunto de preguntas Choice con las categorías de equipo (facturación, técnico, otros); devuelve la distribución de probabilidad por equipo en un solo paso, lo que permite umbrales de confianza y derivación a humano cuando la probabilidad es baja.
- Clasificación de intención en asistentes conversacionales: con preguntas Choice sobre intenciones predefinidas, se obtiene la intención más probable y su confianza, útil para decidir la siguiente acción del diálogo sin generar texto.
- Detección de solicitudes concretas: mediante preguntas Noul (por ejemplo, "¿el cliente pide un reembolso?"), se obtiene la probabilidad de que la condición se cumpla, integrable en flujos de negocio automatizados.
- Puntuación de sentimiento o frustración: con preguntas Score de 2 a 10 niveles descritos, se obtiene una distribución ordinal sobre el nivel de frustración, útil para priorización de colas de atención.
- Extracción de registros de estados JSON: dado un JSON con múltiples registros, el modelo puede indicar qué registro coincide con una ruta o descripción, con una precisión declarada de 0.58 sobre 16 registros y 0.52 sobre 64 (0.62 con índices escritos).
- Clasificación multietiqueta sobre conjuntos amplios: evaluado con 64, 50, 70 y 219 etiquetas simultáneas (HWU64, TREC-fine, DBpedia L2 y L3), adecuado para taxonomías amplias donde se necesita una distribución completa y no solo la etiqueta top-1.
- Filtrado y moderación con decisiones binarias calibradas: preguntas Noul sobre políticas concretas permiten aplicar umbrales de probabilidad para decidir si un contenido requiere revisión.
- Respuesta a preguntas sobre documentos largos: con estados de 5-8k tokens (evaluado en QuALITY), puede seleccionar la opción correcta entre varias para preguntas de comprensión sobre el artículo completo.

## Benchmarks y rendimiento

Los datos de la model card comparan el modelo con el decider-2b bajo el mismo protocolo de una sola ejecución. "Held-out" indica que no se entrenó con ejemplos de ese dataset.

| Tarea | decider-0.8b | decider-2b |
|---|---|---|
| Precisión in-task / ECE (69 tareas) | 0.776 / 0.032 | 0.809 / 0.030 |
| Precisión held-out / ECE (24 tareas) | 0.707 / 0.096 | 0.739 / 0.086 |
| Esquema primero (cacheable), in-task / held-out | 0.770 / 0.699 | 0.790 / 0.707 |
| Preguntas personalizadas del profesor, dominios held-out: noul / choice / score | 0.94 / 0.95 / 0.81 | 0.98 / 0.97 / 0.83 |
| Enrutado por buckets escuetos, held-out: genérico / específico / catch-all | 0.87 / 0.93 / 0.84 | 0.91 / 0.94 / 0.92 |
| Estado JSON, 1 de 16 / 64 registros por ruta (64 con índices) | 0.58 / 0.52 (0.62) | 0.59 / 0.53 (0.63) |
| 64 / 50 / 70 / 219 etiquetas a la vez: HWU64, TREC-fine, DBpedia L2, L3 (held-out) | 0.81 / 0.63 / 0.66 / 0.83 | 0.85 / 0.76 / 0.72 / 0.86 |
| QuALITY, artículo completo (5-8k tokens) | 0.63 | 0.68 |
| Niveles Score aislados vs listwise (dominios held-out) | 0.83 vs 0.82, suma 1.02 | 0.84 vs 0.84 |
| Batería escrita a mano: opción genérica correcta / catch-all correcto | 0.95 / 0.95 | 0.90 / 0.85 |

Caídas más pronunciadas frente al 2B en tareas de conocimiento: TruthfulQA (0.41 vs 0.55), OpenBookQA (0.67 vs 0.81), HellaSwag (0.76 vs 0.88) y ARC (0.74 vs 0.86). En tareas de agente, Pong y Breakout se mantienen al nivel del profesor scripted, CliffWalking falla y Freeway held-out obtiene 0.

## Requisitos de hardware

- Pesos en bf16: 1.4 GB, según la model card (el repositorio ocupa 1.7 GB).
- VRAM estimada para inferencia: no disponible de forma explícita; con pesos bf16 de 1.4 GB, la inferencia cabe holgadamente en GPUs de consumo con 8 GB o más, aunque la cifra exacta no está publicada.
- GPU recomendadas: no especificadas en la información disponible; el entrenamiento se realizó en una GH200.
- Cabe en GPU de consumo: sí, por tamaño de pesos (1.4 GB en bf16), aunque no se detallan modelos concretos.
- Opciones de despliegue: paquete `decider` (pip install git+https://github.com/Mapika/decider), con `decider.infer.Decider`, `decide_batch`, `schema` y `decider.serve` (endpoint `POST /v1/systemone`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica que el conjunto de regresión corre aproximadamente 1.5 veces más rápido que en el 2B; no se publica una cifra absoluta de latencia para este modelo.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Pesos | Licencia | Precisión (in-task / held-out) |
|---|---|---|---|---|---|
| zl-lite-body-1 (decider-0.8b) | Qwen3.5-0.8B-Base | 852.985.920 | 1.4 GB bf16 | apache-2.0 | 0.776 / 0.707 |
| decider-2b | Qwen3.5-2B-Base | no disponible | 3.5 GB bf16 | no disponible en la información | 0.809 / 0.739 |
| decider-4b | Qwen3.5-4B-Base | no disponible | 8.4 GB bf16 | no disponible en la información | 0.834 / 0.788 |
| decider-35b-a3b | Qwen3.5-35B-A3B-Base (3B activos) | no disponible | 65 GB bf16 | no disponible en la información | 0.855 / 0.810 |

El modelo se sitúa como el miembro más pequeño de la familia decider: pierde entre 1 y 4 puntos frente al 2B en enrutado, clasificación, juicios sí/no y consultas JSON sobre estados cortos, y pierde más en tareas que requieren conocimiento (TruthfulQA, OpenBookQA, HellaSwag, ARC) y en conjuntos de etiquetas amplios con distinciones finas (TREC-fine). A cambio, es aproximadamente 1.5 veces más rápido y ocupa 1.4 GB en bf16 frente a los 3.5 GB del 2B.

## Limitaciones y advertencias

- Modelo débil en conocimiento factual: caídas notables frente al 2B en TruthfulQA (0.41 vs 0.55), OpenBookQA (0.67 vs 0.81), HellaSwag (0.76 vs 0.88) y ARC (0.74 vs 0.86).
- Rendimiento limitado en conjuntos de etiquetas amplios con distinciones finas: TREC-fine 0.63 frente a 0.76 del 2B.
- Consultas sobre estados JSON con muchos registros: precisión de 0.52 sobre 64 registros (0.62 con índices escritos), lejos de ser fiable para extracción exacta a gran escala.
- Rendimiento pobre en tareas de agente: CliffWalking falla y Freeway held-out obtiene 0; Pong y Breakout se mantienen al nivel del profesor scripted.
- Calibración peor en dominios held-out: ECE de 0.096 frente a 0.086 del 2B, lo que implica mayor desviación entre probabilidad declarada y acierto fuera de distribución.
- Solo soporta inglés según la model card; no se declaran otros idiomas.
- No es un modelo generativo: no produce texto libre, tool calling, agentes multi-paso ni razonamiento encadenado; su salida está restringida a las opciones definidas.
- Longitud de contexto no documentada; la evaluación con artículos largos se limita a 5-8k tokens (QuALITY).
- Licencia apache-2.0, que permite uso comercial, pero se desconoce si el modelo base Qwen3.5-0.8B-Base impone condiciones adicionales no reflejadas en la información disponible.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración deficiente: las probabilidades pueden no reflejar la incertidumbre real en dominios alejados de los datos de entrenamiento.
- No se han publicado datos sobre sesgos demográficos o sociales del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/jwcwn/zl-lite-body-1
- Repositorio y código de la familia decider: https://github.com/Mapika/decider
- decider-2b: https://huggingface.co/Mapika/decider-2b
- decider-4b: https://huggingface.co/Mapika/decider-4b
- decider-35b-a3b: https://huggingface.co/Mapika/decider-35b-a3b
- decider-35b-a3b-nvfp4: https://huggingface.co/Mapika/decider-35b-a3b-nvfp4
- decider-0.8b: https://huggingface.co/Mapika/decider-0.8b
- decider-2b-vision: https://huggingface.co/Mapika/decider-2b-vision
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
