# helmo/DecidaBERT-large-v1.1

## Resumen

DecidaBERT-large-v1.1 es un modelo de clasificación de texto basado en ModernBERT-large-nli, desarrollado por el usuario helmo, que implementa un modelo de decisión de un solo pase hacia delante (one-forward-pass). A diferencia de los modelos generativos, no produce tokens: recibe un estado textual y un conjunto de preguntas tipadas (sí/no, elección entre N etiquetas y puntuación en una rúbrica ordenada) y devuelve una distribución de probabilidad para cada pregunta en una única pasada. Esto lo sitúa en la categoría de "system-one": decisiones rápidas, probabilísticas y calibradas, sin razonamiento autoregresivo.

El modelo cuenta con 397.939.715 parámetros (395M según la model card), 28 capas y una ventana de contexto de 8.192 tokens. Está afinado a partir de tasksource/ModernBERT-large-nli, un ModernBERT-large entrenado en inferencia de lenguaje natural. Es la versión 1.1 de la familia DecidaBERT-large, hermana de v2 (misma arquitectura y forma de petición) y sucesora de v1. Según el autor, v1.1 y v2 están empatados en precisión global dentro del margen de error, pero difieren en fortalezas por subgrupo: v1.1 destaca en procesamiento de facturas y v2 en incidentes de seguridad y preguntas de sí/no.

Su relevancia actual reside en la propuesta de interfaz `POST /v1/systemone` y en el énfasis en la calibración: además de la distribución cruda, cada respuesta incluye una `confidence` con temperatura por tipo ajustada sobre 200 casos retenidos, lo que permite usar umbrales fiables para enrutamiento y automatización. La licencia Apache 2.0 y el formato safetensors facilitan su integración en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer bidireccional (ModernBERT-large-nli, 28 capas) |
| Parámetros totales | 397.939.715 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamaño del repositorio | 1,6 GB |

## Arquitectura y entrenamiento

El backbone es tasksource/ModernBERT-large-nli, un ModernBERT-large (395M parámetros, 28 capas) entrenado adicionalmente en inferencia de lenguaje natural. La arquitectura es bidireccional, lo que permite atender el estado completo en una sola lectura. El mecanismo de decisión funciona así: el estado se lee una vez y cada pregunta con sus opciones se concatena en la misma secuencia; un token marcador por opción (y uno por pregunta de sí/no) permite que tres cabezas pequeñas (sí/no, elección y puntuación) proyecten los estados de los marcadores a puntuaciones, y un softmax (o sigmoide) produce la distribución. Una petición con muchas preguntas cuesta una sola pasada, no una por pregunta.

El entrenamiento consistió en una única ejecución de dos épocas sobre la mezcla completa de datos a la vez (v2 se entrenó por etapas, con una edición de pesos dirigida y un ajuste final sobre el split de entrenamiento del benchmark). El checkpoint se eligió sobre 200 casos retenidos del split de entrenamiento. Los datos incluyen los conjuntos LocalLLaMA/typed-decisions, helmo/synthetic-typed-decisions, frontier-infra/jebadiah-synth-v2 y kgrozdanovski/assistant-decisions. El autor indica explícitamente que ningún split de test de ningún benchmark se usó para entrenamiento, calibración ni selección de checkpoint, y que se eliminaron estados de entrenamiento que coincidían con estados de test o retenidos. No se menciona RLHF ni DPO; el ajuste es supervisado sobre tareas de decisión tipadas.

## Capacidades

- Clasificación probabilística tipada: responde preguntas de sí/no (`noul`), elección entre N etiquetas (`choice`) y puntuación en rúbrica ordenada (`score`), devolviendo una distribución de probabilidad por pregunta.
- Decisión en un solo pase: procesa el estado una vez y responde todas las preguntas de la petición en una única pasada hacia delante, sin generar tokens.
- Calibración explícita: cada respuesta incluye `confidence`, la probabilidad de la respuesta top tras aplicar una temperatura por tipo ajustada sobre 200 casos retenidos; el error de calibración en test es 0,024 (frente a 0,155 en crudo).
- Contexto largo: ventana de 8.192 tokens para leer estados extensos (trazas de agente, conversaciones, documentos).
- Interfaz de servicio: adopta la forma de petición `POST /v1/systemone`.
- Compatibilidad con text-embeddings-inference y endpoints compatibles (según tags del repositorio).
- Capacidades multilingües: no disponibles; solo inglés.
- Tool calling, agentes multi-paso, visión o audio: no disponibles; el modelo no genera texto ni ejecuta herramientas.

## Casos de uso

- Procesamiento de facturas: el modelo obtiene 0,832 de precisión en el subgrupo de invoice processing del benchmark Typed Decisions, el mejor de la familia. Se usaría para clasificar documentos y responder preguntas tipadas sobre campos (¿es una factura?, ¿qué categoría de gasto?, ¿qué nivel de riesgo?), aprovechando la calibración para enrutar casos dudosos a revisión humana.
- Observabilidad de trazas de agente: con 0,732 en agent trace observability, puede etiquetar trazas largas (hasta 8.192 tokens) con preguntas tipadas sobre si una acción fue correcta, qué tipo de fallo ocurrió o qué severidad tiene, en una sola pasada por traza.
- Enrutamiento y triaje en atención al cliente: con 0,810 en customer service, permite decidir en un pase si un ticket requiere escalado, qué cola le corresponde y con qué confianza, usando `confidence` para umbrales de derivación.
- Detección y clasificación de incidentes: aunque v1.1 rinde algo por debajo de v2 en security incidents (0,750 frente a 0,786), sigue siendo útil para preguntas tipadas de severidad, categoría y necesidad de escalado sobre informes de incidentes.
- Filtrado y control de calidad en pipelines de datos: dado un texto y un conjunto de preguntas de sí/no y elección, decidir si un registro cumple criterios, qué etiqueta le corresponde y con qué probabilidad, integrable como etapa de clasificación por lotes.
- Moderación y políticas: evaluar contenido frente a rúbricas ordenadas (`score`) para asignar niveles de riesgo, con la ventaja de que la puntuación está a un nivel del gold el 98,3% de las veces.
- Evaluación automática de asistentes: dado un estado de conversación, responder preguntas tipadas sobre calidad, adecuación y cumplimiento de políticas, sustituyendo a un juez generativo en casos donde se busca latencia baja y calibración.

## Benchmarks y rendimiento

Resultados en el split de test de Typed Decisions (400 casos, 2.000 preguntas), en modo especialista (entrenados sobre el split de entrenamiento del benchmark):

| Tipo de pregunta | Preguntas | DecidaBERT-large (v1) | DecidaBERT-large-v2 | DecidaBERT-large-v1.1 | Intervalo 95% v1.1 | Azar |
|---|---|---|---|---|---|---|
| choice | 600 | 0,722 | **0,747** | **0,747** | 0,710–0,780 | 0,233 |
| score | 800 | 0,694 | **0,759** | 0,755 | 0,724–0,784 | 0,244 |
| yes/no (`noul`) | 600 | 0,830 | **0,868** | 0,850 | 0,819–0,876 | 0,500 |
| **global** | 2.000 | 0,743 | **0,788** | 0,781 | 0,762–0,799 | — |

Métricas del scorer propio del benchmark:

| Modelo | Accuracy ↑ | KL desde gold ↓ | Brier ↓ | ECE ↓ |
|---|---|---|---|---|
| DecidaBERT-large-v2 | **0,7835** | 0,0861 | **0,0473** | **0,1435** |
| DecidaBERT-large-v1.1 | 0,776 | **0,0852** | 0,0475 | 0,150 |

Comparación por subgrupo v1.1 frente a v2 (mismas 2.000 preguntas):

| Subgrupo | v2 | v1.1 | Diferencia | Solo v2 acierta | Solo v1.1 acierta | p |
|---|---|---|---|---|---|---|
| global | 0,788 | 0,781 | −0,007 | 99 | 85 | 0,34 |
| agent trace observability | 0,730 | 0,732 | +0,002 | 11 | 12 | 1,00 |
| customer service | 0,830 | 0,810 | −0,020 | 29 | 19 | 0,19 |
| invoice processing | 0,806 | **0,832** | +0,026 | 18 | 31 | 0,09 |
| security incidents | **0,786** | 0,750 | −0,036 | 41 | 23 | 0,03 |

Calibración: error de calibración de `confidence` en test de 0,024 (crudo: 0,155). En preguntas `score`, v1.1 queda a un nivel del gold el 98,3% de las veces (v2: 97,6%, v1: 95,5%). Los dos modelos dan la misma respuesta top en el 90% de las preguntas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 397,9M parámetros, en fp32 ocupa aproximadamente 1,6 GB de pesos; en fp16/bf16 unos 0,8 GB; en int8 unos 0,4 GB. A ello hay que sumar memoria para activaciones y la ventana de 8.192 tokens, que puede ser el factor dominante en lotes grandes.
- GPU recomendadas: cualquier GPU con al menos 4–8 GB de VRAM para fp16 con lotes moderados; A100, H100 o L40S para despliegues de alto throughput con contexto completo.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, siempre que se ajuste el tamaño de lote a la memoria disponible.
- Opciones de despliegue: transformers, text-embeddings-inference (según tags) y endpoints compatibles; no se indica soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión global (Typed Decisions) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecidaBERT-large-v1.1 | 397,9M | 8.192 | 0,781 | Apache 2.0 | Hugging Face |
| DecidaBERT-large-v2 | no disponible | 8.192 (misma arquitectura) | **0,788** | Apache 2.0 | Hugging Face |
| DecidaBERT-large (v1) | no disponible | no disponible | 0,743 | Apache 2.0 | Hugging Face |
| ModernBERT-large-nli (base) | 395M | 8.192 | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de otros modelos comparables de la misma categoría (clasificación probabilística tipada) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües declaradas.
- No genera texto: no sirve para tareas generativas, tool calling ni razonamiento multi-paso; su función es clasificar y puntuar.
- Riesgo de alucinación: al ser un modelo discriminativo, el riesgo se traduce en respuestas de alta confianza incorrectas; la calibración mitiga pero no elimina este problema (ECE de 0,150 en crudo, 0,024 en `confidence`).
- Sesgos: no se documentan sesgos conocidos en la información disponible; al entrenarse sobre datos sintéticos y de asistentes, puede heredar sesgos de esas fuentes.
- Rendimiento por subgrupo: rinde peor que v2 en incidentes de seguridad (0,750 frente a 0,786, p = 0,03) y en preguntas de sí/no (0,850 frente a 0,868); el autor advierte que con siete subgrupos comparados la diferencia podría ser azar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento y del modelo base.
- Caveat de producción: el autor indica que las métricas se obtuvieron en modo especialista (entrenado sobre el split de entrenamiento del benchmark); el rendimiento en dominios distintos puede diferir. El modelo fue puntuado una vez sobre el test, y las métricas de v1.1 y v2 difieren ligeramente según cómo se lean los empates.
- Recomendación del autor: para un único modelo, empezar por v2; usar v1.1 donde sus fortalezas (procesamiento de facturas) encajen, o ejecutar ambos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/helmo/DecidaBERT-large-v1.1
- Modelo base: https://huggingface.co/tasksource/ModernBERT-large-nli
- ModernBERT-large: https://huggingface.co/answerdotai/ModernBERT-large
- DecidaBERT-large (v1): https://huggingface.co/helmo/DecidaBERT-large
- DecidaBERT-large-v2: https://huggingface.co/helmo/DecidaBERT-large-v2
- Dataset LocalLLaMA/typed-decisions: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset helmo/synthetic-typed-decisions: https://huggingface.co/datasets/helmo/synthetic-typed-decisions
- Dataset frontier-infra/jebadiah-synth-v2: https://huggingface.co/datasets/frontier-infra/jebadiah-synth-v2
- Dataset kgrozdanovski/assistant-decisions: https://huggingface.co/datasets/kgrozdanovski/assistant-decisions
- Predicciones de test: `eval/typed-decisions/predictions.jsonl` (en el repositorio del modelo)
