# pavan0202/swedish-grammaticality

## Resumen

`pavan0202/swedish-grammaticality` es un modelo de clasificación de texto en sueco que emite una puntuación escalar de gramaticalidad entre 0 y 1. Lo desarrolla el usuario de Hugging Face `pavan0202` como prototipo de investigación para una asignación de selección de tesis, y se construye sobre el encoder `AI-Sweden-Models/ModernBERT-base`, que permanece congelado durante el entrenamiento. La única parte entrenada es una cabeza de regresión ridge con 769 parámetros ajustados, sobre un total de 149.605.633 parámetros del modelo completo.

La propuesta es poco convencional: en lugar de un ajuste fino completo o un clasificador con softmax, se congelan el encoder y la cabeza de predicción preentrenada, se aplica *mean pooling* sobre las representaciones y se ajusta una regresión ridge (alpha=1000) sobre 1.257 ejemplos originales y alterados sintéticamente de UD Swedish-Talbanken r2.17. El resultado es un modelo extremadamente ligero de entrenar (solo 769 parámetros) pero con capacidad limitada: los resultados locales reportados son modestos (AUC 0.678 en el conjunto sintético de validación).

Es relevante ahora como ejemplo de enfoque de bajo coste para evaluación gramatical automática en lenguas de recursos medios como el sueco, y como referencia metodológica sobre los límites de las cabezas lineales sobre encoders congelados. No es un modelo listo para producción ni para evaluación lingüística con consecuencias reales, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base) congelado + cabeza de regresión ridge |
| Parametros totales | 149.605.633 |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenados | 769 (cabeza de regresión ridge) |
| Longitud de contexto | 128 tokens (truncado en tokenización; el base ModernBERT soporta más, pero este modelo se usa con max_length=128) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el repo contiene safetensors en fp32/fp16 según pesos base) |
| Idiomas soportados | sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | text-classification (regresión escalar) |
| Modelo base | AI-Sweden-Models/ModernBERT-base (revisión 0bf738233da3c1bd32bc88cdbeb2c2c01dbac0eb) |
| Dataset de entrenamiento | pavan0202/talbanken-synthetic-grammaticality (derivado de UD Swedish-Talbanken r2.17, CC BY-SA 4.0) |
| Tamaño del repo | 0.6 GB |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT-base (transformer bidireccional con atención eficiente y RoPE, aproximadamente 149 M de parámetros) que se mantiene completamente congelado. Sobre las representaciones del encoder se aplica *mean pooling* y una cabeza de predicción preentrenada del modelo base, seguida de una regresión ridge ajustada analíticamente con alpha=1000, valor seleccionado sobre 632 ejemplos de validación. El escalador de la regresión está plegado dentro de la cabeza, de modo que la salida es directamente un logit único que debe recortarse al intervalo [0,1]; no se aplica sigmoide.

El entrenamiento usa 1.257 ejemplos de UD Swedish-Talbanken r2.17 (licencia CC BY-SA 4.0) más versiones alteradas sintéticamente para generar etiquetas binarias de gramaticalidad. No hay ajuste fino del encoder, ni RLHF, ni DPO, ni destilación. La innovación técnica es precisamente la minimalidad: solo 769 parámetros ajustados, entrenamiento prácticamente instantáneo y sin necesidad de GPU. La contrapartida es que el modelo no aprende representaciones específicas para la tarea y depende por completo de la calidad del encoder base y de la cabeza preentrenada.

## Capacidades

- Puntuación escalar de gramaticalidad en sueco: devuelve un valor continuo en [0,1] que indica cuán gramatical parece un texto.
- Clasificación binaria derivada: aplicando un umbral sobre la puntuación se obtiene una etiqueta gramatical/no gramatical.
- Detección de ciertos errores de concordancia y orden de palabras, aunque el autor advierte que puede pasarlos por alto.
- Inferencia en CPU: al ser un encoder de 149 M con solo una cabeza lineal, la inferencia es viable sin GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio.
- No genera correcciones: la salida es una puntuación, no una versión corregida del texto.
- Multilingüismo limitado: entrenado y validado solo en sueco; puede fallar fuera de ese idioma.

## Casos de uso

- Filtrado de corpus suecos: puntuar automáticamente frases de un corpus web o de un dataset de entrenamiento para descartar aquellas con baja gramaticalidad antes de usarlas en el preentrenamiento de otro modelo. Es adecuado por su bajo coste computacional y su capacidad de procesar grandes volúmenes en CPU.
- Señal auxiliar en pipelines de generación: usar la puntuación como *reward* o filtro de reranking en un sistema que genera texto en sueco, descartando candidatos con puntuación baja. Requiere calibrar el umbral con datos propios.
- Investigación lingüística comparativa: estudiar la correlación entre la puntuación del modelo y juicios humanos de gramaticalidad en sueco, como línea base metodológica en trabajos sobre evaluación automática de lenguas de recursos medios.
- Docencia y prototipado rápido: servir como ejemplo didáctico de cómo construir un clasificador con encoder congelado y regresión ridge, sin necesidad de infraestructura de entrenamiento.
- Detección de anomalías en textos sintéticos: identificar frases generadas por modelos que violan restricciones gramaticales del sueco, como paso previo a una revisión humana.
- Benchmark de referencia para tareas de gramaticalidad en sueco: comparar enfoques más complejos (ajuste fino completo, clasificadores con softmax) contra esta línea base lineal y medir la ganancia real de esos enfoques.

## Benchmarks y rendimiento

Resultados locales reportados por el autor (no son el test oculto del organizador):

| Conjunto | Métrica | Valor |
|---|---|---|
| Sintético held-out (5.273 ejemplos) | AUC | 0.678 |
| Sintético held-out (5.273 ejemplos) | Spearman | 0.248 |
| Sintético held-out (5.273 ejemplos) | MAE | 0.299 |
| Starter (120 ejemplos) | AUC | 0.689 |
| Starter (120 ejemplos) | Spearman | 0.400 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y no serían aplicables a un modelo de esta naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.6 GB en fp32 (149 M de parámetros × 4 bytes), unos 0.3 GB en fp16. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) es más que suficiente.
- Cabe en consumer GPU: sí, en todas las GPU con al menos 1 GB de memoria.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification` en modo eager attention; también es compatible con Text Embeddings Inference (tag `text-embeddings-inference`) y con `optimum` para exportación a ONNX.
- Latencia y throughput: no disponible en la información proporcionada. El autor remite al informe acompañante para datos de velocidad y hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pavan0202/swedish-grammaticality | 149,6 M (769 entrenados) | 128 tokens | Regresión de gramaticalidad en sueco | Apache 2.0 | Hugging Face |
| AI-Sweden-Models/ModernBERT-base | ~149 M | 8.192 tokens (según el modelo base) | Encoder general para sueco | Apache 2.0 | Hugging Face |
| Modelos de gramaticalidad tipo BERT ajustados (p. ej. variantes fine-tuned de KB-BERT) | ~110-150 M | 512 tokens típicamente | Clasificación de aceptabilidad | variable | Hugging Face |

La comparación directa con alternativas específicas de gramaticalidad en sueco no está disponible en la información proporcionada. El modelo base ModernBERT-base ofrece mayor contexto (8.192 tokens frente a los 128 usados aquí) y capacidades generales, pero no está especializado en gramaticalidad. Los ajustes finos completos de BERT suecos suelen superar a las cabezas lineales sobre encoders congelados, aunque no hay datos públicos comparables en esta ficha.

## Limitaciones y advertencias

- El autor advierte explícitamente que las etiquetas binarias automáticas no calibran la puntuación escalar respecto a la gramaticalidad humana.
- Puede pasar por alto errores de concordancia y de orden de palabras.
- Puntúa mal textos gramaticales pero poco familiares para el modelo.
- Trunca textos largos a 128 tokens, por lo que solo evalúa el primer fragmento.
- Puede fallar fuera del sueco; no hay validación con hablantes nativos.
- No se auditó el solapamiento entre el preentrenamiento del modelo base y el texto público de UD, lo que introduce riesgo de contaminación en las métricas.
- No soporta evaluación lingüística con consecuencias reales (admisiones, certificaciones, etc.).
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento es CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre derivados del dataset.
- El proyecto contó con asistencia de Codex en la creación y evaluación, y el autor indica que se requiere revisión del solicitante.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de puntuaciones poco fiables fuera de la distribución de entrenamiento.
- Sin descargas ni likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pavan0202/swedish-grammaticality
- Dataset de entrenamiento: https://huggingface.co/datasets/pavan0202/talbanken-synthetic-grammaticality
- Modelo base: https://huggingface.co/AI-Sweden-Models/ModernBERT-base
- UD Swedish-Talbanken r2.17: https://universaldependencies.org/treebanks/sv_talbanken/
- Repositorio con código CLI e informe: no disponible como enlace directo en la información proporcionada (el autor lo menciona como "repositorio acompañante")
