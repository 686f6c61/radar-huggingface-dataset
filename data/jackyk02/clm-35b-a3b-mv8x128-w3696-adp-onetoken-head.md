# jackyk02/clm-35b-a3b-mv8x128-w3696-adp-onetoken-head

## Resumen

CLM-35B-A3B multi-vector head (8 x 128, 50M) es una cabeza contrastiva de post-entrenamiento desarrollada por el usuario jackyk02, sucesora de un head previo de la misma familia. No es un modelo generativo autonomo, sino un componente de scoring que opera sobre embeddings congelados de Qwen/Qwen3.6-35B-A3B-FP8. Su funcion es puntuar pares (estado, accion) mediante similitud multi-vectorial, empleando torres MLP de profundidad 3 y anchura 3.696, con 8 vectores unitarios de 128 dimensiones por lado y un total de 50,06 millones de parametros entrenables.

La innovacion principal de esta version es el uso de negativos de un solo token en todas las etapas de entrenamiento. Cuando la respuesta correcta de una fila es un unico token (por ejemplo, "Yes", "B" o "3"), el modelo la evalua contra todas las demas respuestas de un token presentes en los almacenes de entrenamiento (35.420 en Diverse-QA), en lugar de limitarse a los negativos del lote. Esto se implementa mediante `OneTokenPool` con `one_token_negs=-1` en `clm_train`.

El modelo es relevante para quienes trabajan en seleccion de acciones, agentes con tool calling y evaluacion contrastiva de respuestas cortas, donde los clasificadores tradicionales de similitud coseno muestran limitaciones. Su licencia es "other", sin idiomas declarados, y el repositorio ocupa 0,2 GB (solo contiene el checkpoint de la cabeza, no los pesos del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza contrastiva multi-vectorial: torres MLP de profundidad 3, anchura 3.696, sobre embeddings congelados de Qwen/Qwen3.6-35B-A3B-FP8 |
| Parametros totales | 50,06 M (solo la cabeza; el modelo base Qwen3.6-35B-A3B-FP8 es aparte) |
| Parametros activos | No aplica (el backbone subyacente es MoE A3B, pero esta cabeza no es MoE) |
| Longitud de contexto | No disponible (heredada del backbone Qwen3.6-35B-A3B-FP8; el dataset asociado menciona 256k) |
| Tipos de cuantizacion | No disponible (la cabeza se distribuye en bf16; el backbone referenciado es FP8) |
| Idiomas soportados | No disponibles |
| Licencia | other |
| Formato de pesos | `best_head.pt` (checkpoint de `clm_train`, cargable con `clm_train.models.heads.build`) |

## Arquitectura y entrenamiento

La cabeza sustituye la similitud coseno clasica por un scoring multi-vectorial: cada lado del par (estado, accion) se representa mediante 8 vectores unitarios de 128 dimensiones, y la puntuacion final se calcula con distancia Chamfer en lugar de un producto escalar de vectores aplanados. Las torres son MLP de profundidad 3 con anchura 3.696, entrenadas en bf16 sobre embeddings congelados de Qwen/Qwen3.6-35B-A3B-FP8. El entrenamiento se realizo en tres etapas sobre una H100 por etapa, con batch de 16.384 y learning rate 1e-3.

La primera etapa continuo el pre-entrenamiento del head predecesor sobre todo Nemotron-CC-v2 Diverse-QA durante 98.196 pasos adicionales, detenidos manualmente. La segunda (mid-training) uso HQ-DQA con negativos duros y un 40% de replay de Diverse-QA, durante 3 epocas y 18.570 pasos (mejor checkpoint en el paso 18.250). La tercera (post-training) aplico ADP con sus 8 negativos duros y un 20% de HQ-DQA (con negativos) mas un 20% de replay de Diverse-QA, durante 7.000 pasos. En todas las etapas se emplearon negativos de un solo token mediante `OneTokenPool`, y las secuencias de un token usan la tabla `jackyk02/qwen3.6-35b-a3b-fp8-single-token-embeddings` tanto en entrenamiento como en inferencia.

## Capacidades

- Scoring contrastivo de pares (estado, accion) mediante distancia Chamfer sobre representaciones multi-vectoriales.
- Discriminacion reforzada de respuestas de un solo token: distingue correctamente entre opciones cortas como "Yes", "B" o "3".
- Seleccion top-1 con negativos duros: identifica la respuesta correcta frente a un conjunto de candidatos negativos.
- Integracion con el pipeline `clm_train` para servir y evaluar cabezas contrastivas.
- Compatibilidad con embeddings de Qwen3.6-35B-A3B-FP8, incluyendo contextos largos (el dataset asociado menciona 256k).
- No es un modelo generativo: no produce texto, solo puntuaciones de similitud.
- No se declaran capacidades de tool calling, agentes, vision ni audio propias de la cabeza.

## Casos de uso

- Seleccion de acciones en agentes: dado un estado y un conjunto de acciones candidatas, la cabeza puntua cada par y permite elegir la mejor accion. Es adecuado porque fue post-entrenada con negativos duros de ADP y datos de tool calling.
- Clasificacion de respuestas cortas: en tareas donde la salida es "si/no", una letra o un numero, el modelo distingue entre opciones de un token con precision del 0,908 en HQ-DQA y 0,873 en Diverse-QA.
- Evaluacion de politicas en RLHF/DPO: sirve como reward model contrastivo para comparar respuestas generadas por otros modelos, usando los embeddings del backbone congelado.
- Recuperacion semantica multi-vectorial: los 8 vectores de 128 dimensiones por lado permiten representaciones mas ricas que un unico embedding, utiles en busqueda de documentos o memoria de agentes.
- Filtrado de datos sinteticos: puede puntuar pares (pregunta, respuesta) para descartar ejemplos de baja calidad antes de usarlos en fine-tuning, aprovechando su capacidad de discriminacion con negativos.
- Sistemas de decision en entornos con acciones discretas: en juegos, simulaciones o interfaces de automatizacion donde las acciones son finitas y etiquetadas, la cabeza actua como modulo de seleccion.
- Deteccion de respuestas ambiguas: al comparar contra todos los negativos de un token, senala cuando una respuesta corta es confundible con otras, util para control de calidad.

## Benchmarks y rendimiento

| Metrica | Esta cabeza | Predecesora |
|---|---|---|
| ADP: gold beats all its negatives | 0,881 | 0,883 |
| ADP: top-1 with negatives | 0,805 | 0,805 |
| HQ-DQA: gold beats all its negatives | 0,689 | 0,685 |
| HQ-DQA: top-1 with negatives | 0,690 | 0,683 |
| HQ-DQA: plain in-batch loss / top-1 | 0,567 / 0,893 | 0,579 / 0,891 |
| HQ-DQA: one-token answer beats every other one-token answer | 0,908 | ~0,80 |
| Diverse-QA: one-token answer beats every other one-token answer | 0,873 | ~0,83-0,86 |

Los datos de la predecesora para one-token provienen de evaluaciones de esa cabeza en los mismos conjuntos reservados en ejecuciones separadas, no de su propio log de entrenamiento. Ninguna de las dos cabezas ha sido evaluada con el Jev Decision Index. La validacion corresponde al mejor checkpoint, con una sola semilla y sin conjunto de test separado.

## Requisitos de hardware

- VRAM para la cabeza: al ser 50,06 M de parametros en bf16, ocupa aproximadamente 0,1 GB. Es despreciable frente al backbone.
- Backbone requerido: Qwen/Qwen3.6-35B-A3B-FP8, un MoE de 35B parametros totales y 3B activos. En FP8 necesita del orden de 35 GB de VRAM; en cuantizaciones de 4 bits puede reducirse a ~18-20 GB.
- GPU recomendadas: H100 o A100 para el backbone en FP8 sin cuantizar. En consumer, una RTX 4090 (24 GB) puede alojar el backbone en 4 bits, aunque con limitaciones de contexto.
- Despliegue: la cabeza se sirve con `clm_train` mediante `clm-serve`, apuntando a un endpoint de embeddings (`--emb-url-35b`). El backbone puede servirse con vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles. La temperatura esta en su tope (logit scale 100), por lo que las probabilidades softmax son muy agudas; se recomienda pasar un `temperature` mayor para suavizarlas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CLM-35B-A3B mv8x128 ADP one-token | 50,06 M (cabeza) | No disponible | Contrastivo multi-vectorial, negativos de un token | other | Hugging Face |
| jackyk02/clm-35b-a3b-mv8x128-w3696-adp-head | 50,06 M (cabeza) | No disponible | Contrastivo multi-vectorial, negativos estandar | other | Hugging Face |
| Edge0 | No disponible | No disponible | Streaming de pesos MoE desde SSD | No disponible | GitHub |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas, solo puntuaciones de similitud entre pares.
- Requiere el backbone Qwen/Qwen3.6-35B-A3B-FP8 para funcionar; la cabeza sola no es utilizable.
- La validacion se hizo con una sola semilla y sin conjunto de test separado, por lo que los numeros pueden no generalizar.
- No se han declarado idiomas soportados; el comportamiento multilingue es desconocido.
- La licencia es "other", sin terminos explicitos en la model card; es necesario revisar las condiciones antes de uso comercial.
- Los datos de entrenamiento (Nemotron-CC-v2, neulab/agent-data-collection) tienen sus propios terminos, que deben respetarse.
- La temperatura esta en su tope (logit scale 100), lo que produce probabilidades muy agudas; en produccion puede requerir ajuste.
- No ha sido evaluada con el Jev Decision Index, lo que limita la comparacion con otros sistemas de decision.
- Riesgo de sesgo heredado de los embeddings de Qwen3.6-35B-A3B-FP8 y de los datasets de entrenamiento.
- El repositorio solo contiene la cabeza (0,2 GB); no incluye los pesos del backbone.

## Enlaces

- Hugging Face: https://huggingface.co/jackyk02/clm-35b-a3b-mv8x128-w3696-adp-onetoken-head
- Predecesora: https://huggingface.co/jackyk02/clm-35b-a3b-mv8x128-w3696-adp-head
- Tabla de embeddings de un token: https://huggingface.co/jackyk02/qwen3.6-35b-a3b-fp8-single-token-embeddings
- Dataset de embeddings de agente: https://huggingface.co/datasets/jackyk02/nemotron-sft-agentic-v4-qwen3.6-35b-a3b-fp8-embeddings-256k
- Dataset Nemotron-CC-v2: https://huggingface.co/datasets/nvidia/Nemotron-CC-v2
- Dataset agent-data-collection: https://huggingface.co/datasets/neulab/agent-data-collection
- Repositorio Edge0 (referencia externa): https://github.com/Edge0-AI/Edge0
