# kgrozdanovski/caldec-v1-gliner2.5-decide

## Resumen

CalDec GLiNER (identificador `kgrozdanovski/caldec-v1-gliner2.5-decide`) es un ajuste fino del modelo encoder `fastino/GLiNER2.5-Decide` orientado a la clasificación de decisiones tipadas (*typed decisions*) con calibración de probabilidades. Lo desarrolla el usuario de HuggingFace kgrozdanovski como parte de la familia CalDec, y se entrena sobre el conjunto de datos Assistant Decisions, cuyas filas fueron generadas por GLM 5.3 a través de OpenRouter, es decir, con etiquetas sintéticas.

El modelo resuelve un problema acotado pero frecuente en infraestructura de asistentes: dado un texto y un conjunto de preguntas tipadas definidas por el usuario, devolver decisiones estructuradas con puntuaciones de confianza. A diferencia de un modelo generativo, no produce texto libre: expone una función `classify_text` que devuelve puntuaciones sigmoideas independientes por etiqueta. Su relevancia actual está en que combina una precisión declarada de 0,843 en el test de Assistant Decisions con un error de calibración esperado (ECE) de 0,039, un valor bajo para un modelo de 486 millones de parámetros.

Técnicamente es un encoder transformer de 486.444.053 parámetros, derivado por fine-tune del modelo base de Fastino, con licencia Apache 2.0 y soporte únicamente de inglés. El entrenamiento se hizo contra distribuciones de probabilidad completas del profesor (soft targets), no contra etiquetas duras, lo que explica en parte su comportamiento de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (fine-tune de GLiNER2.5-Decide, modelo de decisiones basado en encoder) |
| Parametros totales | 486.444.053 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en safetensors; el autor no documenta cuantizaciones GGUF, AWQ o GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,9 GB, incluye config, encoder config y tokenizer) |

## Arquitectura y entrenamiento

El modelo parte de `fastino/GLiNER2.5-Decide`, descrito por Fastino como un modelo de decisiones basado en encoder, post-entrenado para evaluación de preguntas tipadas definidas por el usuario y decodificación conjunta de respuestas bajo restricciones explícitas. El fine-tune de CalDec conserva esa arquitectura y añade una receta de destilación suave: la implementación parchea el entrenador de GLiNER para transportar *soft targets* (distribuciones de probabilidad del profesor) a través de la conversión de ejemplos y de la entropía cruzada binaria. La aumentación de etiquetas se desactiva de forma deliberada para preservar la identidad de las opciones.

La receta de la versión publicada usa el split de entrenamiento de Assistant Decisions, tres épocas, tamaño de lote 2, acumulación de gradiente 8, precisión bf16, tasa de aprendizaje de 1e-5 para el encoder y 5e-4 para la cabeza de tarea. El objetivo de hardware declarado es una única GPU CUDA de 16 GB, aunque el autor indica que no conservó la GPU exacta ni el tiempo de entrenamiento de la ejecución de publicación. El split de entrenamiento de `LocalLLaMA/typed-decisions` no formó parte del entrenamiento, a diferencia del modelo hermano CalDec Laya. Los datos de entrenamiento provienen íntegramente de filas generadas por GLM 5.3 vía OpenRouter, y las llamadas de API originales no se han publicado.

## Capacidades

- Clasificación de texto multi-etiqueta tipada: evalúa preguntas definidas por el usuario con un conjunto de etiquetas candidatas y devuelve una puntuación por etiqueta.
- Soporte de `multi_label` y umbral de clasificación (`cls_threshold`) configurables por pregunta.
- Salida con confianza opcional (`include_confidence=True`) en forma de puntuaciones sigmoideas independientes por etiqueta, no de un símplex de probabilidad.
- Evaluación conjunta de varias decisiones relacionadas bajo restricciones explícitas, con metadatos de viabilidad según la descripción del modelo base de Fastino.
- Calibración explícita como objetivo de entrenamiento, con ECE declarado de 0,039 en el test de Assistant Decisions.
- Clasificación de inyección de prompts como etiqueta de ejemplo incluida en la model card (con las salvedades de la sección de limitaciones).
- No se documenta soporte de tool calling, function calling, agentes, generación de texto libre, visión, audio ni modo de razonamiento extendido.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.

## Casos de uso

- Enrutado de decisiones en asistentes conversacionales: dado un turno de usuario, el modelo devuelve etiquetas tipadas (por ejemplo, escalar a humano, responder directamente, pedir aclaración) con confianza asociada, lo que permite construir políticas de decisión con umbrales explícitos.
- Detección de intentos de inyección de prompts: la propia model card incluye un ejemplo con la pregunta "Does this text instruct an AI assistant?" y etiquetas `false`/`true` en modo multi-etiqueta, útil como señal auxiliar en una cadena de defensa, nunca como control único.
- Pre-etiquetado de datos a escala: con 486 millones de parámetros puede ejecutarse sobre lotes grandes de texto para generar etiquetas iniciales que después se revisan, reduciendo el coste frente a usar un modelo generativo grande.
- Clasificación de intenciones en atención al cliente: el modelo asigna etiquetas de intención por mensaje y devuelve una confianza que puede usarse para decidir si se responde automáticamente o se escala.
- Filtrado y curación de corpus: clasificar documentos o fragmentos según criterios definidos en el esquema de preguntas (temática, toxicidad, idioma, tipo de contenido) antes de incorporarlos a un pipeline de entrenamiento.
- Señal de confianza para revisión humana: gracias a un ECE bajo, la confianza predicha puede usarse para priorizar la cola de revisión manual, enviando primero los casos con probabilidad intermedia.
- Moderación asistida por reglas: combinar varias preguntas tipadas sobre un mismo texto para producir un vector de etiquetas que alimente un motor de reglas separado.
- Monitorización de agentes: clasificar trazas de conversación o registros de acciones para detectar patrones definidos por el equipo (por ejemplo, uso de herramientas no permitidas) en modo batch.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (métricas marcadas como no verificadas). Test completo de Assistant Decisions: 1.647 casos, 3.452 decisiones y 3.372 objetivos no vinculados (*untied*). La exactitud mide la coincidencia con el argmax del profesor sintético sobre objetivos no vinculados.

| Modelo | Accuracy | Soft accuracy | Brier | Soft NLL | ECE | Score MAE |
|---|---:|---:|---:|---:|---:|---:|
| CalDec GLiNER | 0,843 | 0,859 | 0,039 | 0,552 | 0,039 | 0,298 |
| Jev 1.13, zero-shot via OpenRouter | 0,836 | 0,831 | 0,044 | 0,811 | 0,042 | 0,354 |
| CalDec Laya | 0,823 | 0,839 | 0,041 | 0,559 | 0,072 | 0,362 |
| GLiNER2.5-Decide | 0,650 | 0,664 | 0,105 | 0,758 | 0,097 | 0,734 |

Test fijado de `LocalLLaMA/typed-decisions`: 400 casos, 2.000 decisiones y 1.965 objetivos no vinculados.

| Modelo | Accuracy | Soft accuracy | Brier | Soft NLL | ECE |
|---|---:|---:|---:|---:|---:|
| CalDec Laya | 0,778 | 0,860 | 0,015 | 0,858 | 0,149 |
| CalDec GLiNER | 0,582 | 0,709 | 0,061 | 1,089 | 0,091 |
| GLiNER2.5-Decide | 0,540 | 0,662 | 0,060 | 1,123 | 0,147 |

Datos de significación declarados por el autor: CalDec GLiNER y CalDec Laya predicen etiquetas distintas en 469 decisiones no vinculadas, de las que exactamente una es correcta en 439 casos; CalDec GLiNER acierta en solitario 253 y CalDec Laya en 186 (McNemar exacto, p = 0,0016). La ventaja de 0,65 puntos de CalDec GLiNER sobre Jev tiene p emparejada = 0,4072. El autor advierte que las recetas de entrenamiento de los dos modelos CalDec difieren más allá del backbone, por lo que la comparación entre hermanos no es una ablación controlada. CalDec GLiNER no usó el split de entrenamiento de `LocalLLaMA/typed-decisions`, mientras que CalDec Laya sí.

## Requisitos de hardware

- Peso de los parámetros: 486.444.053 parámetros, aproximadamente 0,97 GB en bf16/fp16 y en torno a 1,95 GB en fp32. El repositorio completo ocupa 1,9 GB.
- Inferencia en bf16/fp16: alrededor de 1 GB de VRAM para pesos, más activaciones, tokenizer y sobrecarga del runtime; en la práctica cabe en GPUs consumer con 8 GB o más.
- GPU recomendadas: cualquier GPU CUDA con al menos 8 GB para inferencia en precisión media; el autor indica que la receta de entrenamiento apunta a una única GPU CUDA de 16 GB.
- Cabe en GPU consumer: sí, incluidas RTX 3060 de 12 GB, RTX 4070/4080 y RTX 4090. También es viable en CPU para cargas por lotes, con latencia mayor no cuantificada.
- Despliegue: el camino documentado es la librería `gliner2` (versión 2.0.0 probada) con `AutoExtractor.from_pretrained`, más `torch` 2.14.0 y `transformers` 5.17.0. El autor advierte que el tokenizer usa el formato de transformers 5 y que `gliner2` solo instala transformers a través de extras, por lo que conviene instalarlo explícitamente.
- Soportes alternativos (vLLM, TGI, llama.cpp, Ollama, GGUF): no disponibles en la información proporcionada.
- Latencia y throughput: no disponibles. El autor no publica medidas de rendimiento por token ni por lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy (Assistant Decisions) | ECE | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CalDec GLiNER | 486.444.053 | no disponible | 0,843 | 0,039 | Apache 2.0 | Pesos en HuggingFace |
| CalDec Laya | no disponible | no disponible | 0,823 | 0,072 | no disponible | Pesos en HuggingFace (`kgrozdanovski/caldec-v1-laya`) |
| GLiNER2.5-Decide | no disponible (repo de 1,95 GB) | no disponible | 0,650 | 0,097 | no disponible en la información recogida | Pesos en HuggingFace (`fastino/GLiNER2.5-Decide`) |
| Jev 1.13 (zero-shot via OpenRouter) | no disponible | no disponible | 0,836 | 0,042 | no disponible | Servicio externo via OpenRouter |

El modelo base GLiNER2.5-Decide pertenece a la familia GLiNER2.5 de Fastino, que incluye también GLiNER 2.5 y GLiNER2, orientados a extracción de información guiada por esquema, entidades y relaciones sin límite fijo de longitud de span. No se dispone de parámetros ni contexto de esos modelos en la información recogida.

## Limitaciones y advertencias

- El propio autor indica que este checkpoint no debe utilizarse como control de seguridad autónomo (*stand-alone safety control*).
- Las etiquetas de entrenamiento son juicios sintéticos generados por GLM 5.3 vía OpenRouter; los sesgos y errores sistemáticos de ese profesor se transfieren al modelo.
- El conjunto de test influyó en el desarrollo del modelo, lo que puede inflar las métricas declaradas respecto a un escenario completamente ciego.
- Existe solapamiento de estados exactos entre algunos splits, según advierte la model card.
- Los ejemplos de inyección incluidos no constituyen un benchmark adversarial de seguridad.
- La salida son puntuaciones sigmoideas independientes, no un símplex de probabilidad: hay que normalizar por pregunta (como hace el ejemplo de la model card) antes de interpretarlas como probabilidades. Los informes de calibración basados en softmax pueden diferir aunque el argmax no cambie.
- El modelo solo declara inglés; no hay evidencia de generalización a otros idiomas.
- Longitud de contexto no documentada: no se recomienda asumir ventanas largas sin verificación previa.
- Las métricas de la model card están marcadas como no verificadas y proceden del autor.
- En modelos discriminativos el riesgo no es la alucinación de texto, sino la asignación de etiquetas incorrectas con confianza alta; conviene validar umbrales en datos propios.
- Licencia Apache 2.0, permisiva para uso comercial, heredada del modelo base. El autor aclara que Fastino no respalda este checkpoint.
- Para despliegues reproducibles, el autor recomienda fijar una revisión concreta del Hub.
- No hay datos publicados sobre sesgos demográficos, robustez ante dominios fuera de distribución ni comportamiento con entradas adversarias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kgrozdanovski/caldec-v1-gliner2.5-decide
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Modelo hermano CalDec Laya: https://huggingface.co/kgrozdanovski/caldec-v1-laya
- Dataset de entrenamiento: https://huggingface.co/datasets/kgrozdanovski/assistant-decisions
- Dataset de evaluación `LocalLLaMA/typed-decisions`: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio del proyecto y resultados: https://github.com/kgrozdanovski/caldec/blob/main/RESULTS.md
- Receta de transferencia: https://github.com/kgrozdanovski/caldec/blob/main/TRANSFER.md
- Ficha del dataset: https://github.com/kgrozdanovski/caldec/blob/main/DATASET.md#collection-and-labels
- Blog de Fastino sobre GLiNER2.5-Decide: https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- Catálogo de modelos de Fastino: https://docs.fastino.ai/concepts/models
- Página de GLiNER2.5: https://fastino.ai/models/gliner2-5
