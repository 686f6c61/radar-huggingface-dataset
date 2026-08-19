# cnuland/llm-d-sc-complexity

## Resumen

`llm-d-sc-complexity` es un modelo de embeddings de frases (sentence embeddings) de 384 dimensiones, desarrollado por cnuland como componente del proyecto llm-d-sc, un runtime de clasificación semántica para el enrutamiento de peticiones en el ecosistema llm-d (stack de inferencia distribuida sobre Kubernetes). El modelo no clasifica directamente: produce una representación vectorial que se compara por similitud coseno contra un conjunto de anclas etiquetadas (`anchors.json`) que definen cuatro niveles de complejidad de prompt: `SIMPLE`, `MEDIUM`, `COMPLEX` y `REASONING`.

Está fine-tuneado a partir de `sentence-transformers/all-MiniLM-L6-v2`, un transformer BERT de 6 capas con 22,7 millones de parámetros. Su propósito es servir como señal de enrutamiento: un prompt simple no necesita un modelo de frontera, mientras que uno de razonamiento formal sí. La taxonomía se mantiene como datos externos, no como cabezal de clasificación congelado, lo que permite reemplazar o ampliar las anclas sin reentrenar. Es un modelo ligero, pensado para inferencia de baja latencia en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT-style, 6 capas, 384 dims) |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, sin ventana de contexto generativa) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | Ingles (segun limitaciones declaradas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (via sentence-transformers) |

## Arquitectura y entrenamiento

El modelo parte de `all-MiniLM-L6-v2`, un transformer encoder de 6 capas con embeddings de 384 dimensiones, optimizado para similitud semantica y recuperacion de frases. Se fine-tuneo con `BatchAllTripletLoss` y muestreo de lotes agrupados por etiqueta (`group_by_label`) sobre 871 ejemplos sinteticos generados y verificados de forma cruzada por dos LLMs distintos. El pipeline de entrenamiento esta disponible en el repositorio `cnuland/hello-chris-sr-finetuned`.

La innovacion clave no esta en la arquitectura, sino en el diseno de inferencia: el modelo no tiene una cabeza de clasificacion fija. En su lugar, se comparan los embeddings de las frases contra un conjunto de anclas etiquetadas (media de los top-3 por nivel, argmax). Esto permite actualizar la taxonomia (anadir niveles, cambiar ejemplos) sin reentrenar el modelo. La evaluacion se realizo sobre 80 prompts independientes (20 por nivel) en dominios fuera del corpus de entrenamiento (vela, agricultura, transito, radiodifusion, museos, orquestas), con 20 casos frontera.

## Capacidades

- Genera embeddings de frases de 384 dimensiones normalizados, aptos para similitud coseno.
- Clasifica la complejidad de un prompt en cuatro niveles: `SIMPLE`, `MEDIUM`, `COMPLEX` y `REASONING`, mediante comparacion contra anclas.
- No emite una clase directamente, sino puntuaciones de similitud por nivel; el enrutamiento queda en manos del llamante.
- Soporta reemplazo o extension de la taxonomia sin reentrenamiento (las anclas son datos, no parametros).
- Especificamente disenado para senal de routing en sistemas de inferencia distribuida (llm-d-sc).
- No genera texto, no tiene capacidades de tool calling, ni vision, ni audio. Es un modelo de embedding puro.

## Casos de uso

- Enrutamiento de peticiones en inferencia distribuida: llm-d-sc lo usa para decidir si un prompt requiere un modelo de frontera o uno pequeno, reduciendo coste y latencia en clusters con multiples modelos.
- Priorizacion de colas en servidores de LLM: un prompt `SIMPLE` puede ir a una cola de baja prioridad, mientras que un `REASONING` se envia a una GPU de alta capacidad.
- Clasificacion previa de prompts en pipelines de agentes: antes de invocar un LLM, se puede clasificar la complejidad para seleccionar el modelo adecuado (por ejemplo, un modelo local de 7B para tareas simples y uno de 70B para razonamiento).
- Filtrado de solicitudes en APIs publicas: permite aplicar politicas de tarificacion o limites de uso segun la complejidad del prompt.
- Monitorizacion de carga: analizar la distribucion de complejidad de las peticiones entrantes para dimensionar la infraestructura.
- Benchmarking de sistemas de routing: comparar la precision de diferentes estrategias de seleccion de modelo usando la senal de complejidad como ground truth.

## Benchmarks y rendimiento

La evaluacion se realizo sobre un conjunto retenido de 80 prompts (20 por nivel) con casos frontera incluidos. Metodo: similitud coseno contra anclas, media de los top-3 por nivel, argmax.

| Modelo | Accuracy | Macro F1 | Casos frontera |
|---|---:|---:|---:|
| **llm-d-sc-complexity** | **0.9750** | **0.9749** | **0.9500** |
| `all-MiniLM-L6-v2` (base, mismas anclas) | 0.6250 | 0.6234 | 0.6500 |

Desglose por nivel:

| Nivel | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| SIMPLE | 1.000 | 1.000 | 1.000 | 20 |
| MEDIUM | 0.909 | 1.000 | 0.952 | 20 |
| COMPLEX | 1.000 | 0.900 | 0.947 | 20 |
| REASONING | 1.000 | 1.000 | 1.000 | 20 |

Los dos errores son `COMPLEX` predicho como `MEDIUM`. El modelo base muestra confianza casi uniforme (0.25-0.27), indicando que su espacio de embeddings no contiene estructura de complejidad. Latencia en CPU (un solo hilo, Apple M-series, embedding + ranking): p50 9.2 ms, p99 19.0 ms. Los numeros fueron producidos en un entorno homelab y no han sido reproducidos de forma independiente.

## Requisitos de hardware

- Inferencia en CPU: suficiente. El modelo tiene 22,7M de parametros y una latencia media de ~9 ms en CPU moderna (Apple M-series).
- VRAM estimada: inferior a 100 MB en fp32 (22,7M parametros * 4 bytes ≈ 91 MB). Cabe en cualquier GPU, incluso integradas.
- GPUs recomendadas: no requiere GPU dedicada; cualquier CPU moderna es suficiente para uso en produccion a baja tasa.
- Opciones de despliegue: compatible con sentence-transformers, Text Embeddings Inference (TEI) y endpoints de HuggingFace. Puede servirse con ONNX Runtime o llama.cpp si se convierte, aunque no es lo habitual para embeddings.
- Throughput: no se han publicado datos de throughput, pero por tamano y latencia, puede procesar cientos de peticiones por segundo en un solo nucleo CPU.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos de clasificacion de complejidad de prompts. La unica comparacion disponible es contra su modelo base, `all-MiniLM-L6-v2`, que sin fine-tuning obtiene un accuracy de 0.6250 con las mismas anclas. Otros modelos de embeddings pequenos (como `all-Mpnet-base-v2` o `e5-small`) podrian servir como alternativa, pero no hay datos de rendimiento en esta tarea especifica. La propuesta de `ComplexityNet` (arXiv:2312.11511) aborda un problema similar, pero con una arquitectura y objetivo distintos (predecir la probabilidad de respuesta correcta por modelo, no clasificar por niveles).

## Limitaciones y advertencias

- Solo soporta ingles. No hay datos de rendimiento en otros idiomas.
- Entrenado exclusivamente con datos sinteticos; no existe un conjunto de validacion etiquetado por humanos.
- La frontera entre `MEDIUM` y `COMPLEX` es genuinamente ambigua y concentra los errores residuales.
- La precision depende directamente de la calidad de las anclas en `anchors.json`. Reemplazar las anclas cambia el comportamiento sin reentrenar, lo que puede ser una ventaja o un riesgo si no se valida.
- No es un clasificador de clases duras: emite evidencias de similitud, no una decision final. El enrutamiento, la seleccion de endpoint y la afinidad de sesion son responsabilidad del llamante.
- Los resultados de evaluacion provienen de un entorno homelab y no han sido reproducidos de forma independiente.
- Licencia Apache-2.0, sin restricciones de uso comercial conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cnuland/llm-d-sc-complexity
- Repositorio de llm-d-sc (runtime de clasificacion): https://github.com/llm-d-incubation/llm-d-semantic-classifier
- Propuesta de incubacion de llm-d-sc: https://github.com/llm-d/llm-d/issues/2193
- Pipeline de entrenamiento: https://github.com/cnuland/hello-chris-sr-finetuned
- Sitio de llm-d (stack de inferencia distribuida): https://llm-d.ai/
- Referencia relacionada (ComplexityNet): https://arxiv.org/html/2312.11511v1
