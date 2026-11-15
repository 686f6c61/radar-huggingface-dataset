# iapp/OpenThai-SystemOne-GGUF

## Resumen

OpenThai-SystemOne es un modelo de decisión de tipo "System One" desarrollado por iApp y lanzado junto con AIEAT, dentro de la familia OpenThai (anteriormente OpenThaiGPT). A diferencia de un modelo generativo convencional, responde a preguntas tipadas sobre un texto o un estado JSON en un único pase hacia delante: elección entre hasta 255 opciones (`choice`), puntuación ordinal (`score`) y sí/no (`noul`), devolviendo probabilidades calibradas y sin generar texto libre.

La arquitectura combina una torre de texto Qwen3.5-0.8B con preentrenamiento continuado en tailandés y una cabeza de decisión de 256 ranuras. El modelo resultante tiene 752.412.480 parámetros y está orientado a tareas de clasificación y enrutamiento con baja latencia, lo que lo hace adecuado para moderación, análisis de sentimiento, enrutamiento de intenciones o etiquetado estructurado en producción.

Este repositorio en concreto contiene la versión cuantizada en GGUF (v0.3, commit `f3709948`) para su ejecución con llama.cpp. La cuantización afecta a la torre (capas Linear y embeddings del tokenizador); la cabeza de decisión y las temperaturas por tipo se mantienen en fp32 en `head.safetensors`, de modo que la cuantización solo perturba el estado oculto que lee la cabeza. Es relevante ahora porque permite desplegar un clasificador estructurado tailandés-inglés en hardware modesto con una degradación de precisión mínima (0,7 puntos de macro en el banco público de 13 subconjuntos y 0,5 en los conjuntos tailandeses).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (torre Qwen3.5-0.8B) + cabeza de decisión de 256 ranuras |
| Parametros totales | 752.412.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 (cabeza de decisión en fp32) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (torre) + safetensors (cabeza de decisión) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder basado en Qwen3.5-0.8B con preentrenamiento continuado en tailandés, al que se le añade una cabeza de decisión de 256 ranuras que se aplica sobre el estado oculto final. La cabeza calcula `softmax((h @ W.T + b) / exp(log_temperature[qtype]))` sobre las primeras k ranuras más la ranura 255, con una temperatura específica por tipo de pregunta (`choice`, `score`, `noul`). El modelo no genera texto: la cabeza del LM está atada al embedding de entrada y no se usa para la decisión, por lo que ejecutar el GGUF aislado en `llama-cli` produce texto sin sentido.

En la variante GGUF, llama.cpp ejecuta únicamente la torre y devuelve los estados ocultos finales (`embedding=True, pooling_type=NONE`); un cliente Python incluido en el repositorio aplica la cabeza de decisión sobre esos estados, de forma que las respuestas tienen la misma forma que en el modelo PyTorch original. La cuantización se aplica a todas las capas Linear y a los embeddings del tokenizador, mientras que la cabeza y las temperaturas permanecen en fp32. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Clasificación de texto mediante preguntas tipadas: elección entre hasta 255 opciones (`choice`), puntuación ordinal (`score`) y sí/no (`noul`).
- Respuesta en un único pase hacia delante con probabilidades calibradas por tipo de pregunta, sin generación de texto.
- Procesamiento de entradas de texto y de estados JSON.
- Capacidades multilingües limitadas a tailandés e inglés.
- Integración con llama.cpp para ejecución en CPU y GPU (CUDA, Metal).
- Cliente Python con backend llama.cpp que reproduce la interfaz del modelo PyTorch.
- No soporta tool calling ni function calling en el sentido de los modelos generativos.
- No soporta razonamiento multi-paso ni modos de "thinking": es un modelo de decisión de un solo paso.

## Casos de uso

- Análisis de sentimiento en reseñas tailandesas: el modelo clasifica el texto en categorías (`บวก`, `ลบ`, `กลาง`) con probabilidades calibradas en unos 35 ms por decisión de tres preguntas, lo que permite procesar grandes volúmenes de reseñas en tiempo real.
- Puntuación ordinal de calidad: con preguntas de tipo `score` puede asignar estrellas o niveles de relevancia y consistencia, útil para evaluar reseñas, resúmenes o respuestas generadas.
- Moderación de contenido: preguntas de tipo `noul` permiten detectar toxicidad, urgencia o incumplimiento de políticas sobre comentarios y publicaciones, con umbrales ajustables gracias a las probabilidades devueltas.
- Enrutamiento de intenciones en asistentes conversacionales: la pregunta `choice` sobre hasta 255 opciones permite clasificar la intención del usuario y dirigir la conversación al flujo adecuado, con latencia de milisegundos.
- Clasificación de tickets de soporte: sobre un estado JSON con metadatos del ticket, el modelo puede decidir categoría, prioridad y necesidad de escalado en una sola llamada.
- Etiquetado estructurado de datos para entrenamiento: genera etiquetas y probabilidades sobre grandes corpus tailandeses e ingleses para construir datasets de clasificación o filtrar datos de entrenamiento.
- Verificación de consistencia y relevancia en pipelines de generación aumentada: las preguntas de tipo `score` permiten evaluar si un resumen o una respuesta es consistente con la fuente antes de mostrarla al usuario.

## Benchmarks y rendimiento

Precisión macro del Q4_K_M frente al original en bf16, sobre los mismos registros (primeros 800 de cada conjunto, un solo orden de opciones):

| Subconjunto | bf16 original | Q4_K_M | Delta |
|---|---|---|---|
| aegis2 (noul) | 83.2 | 83.2 | +0.0 |
| boolq (noul) | 79.7 | 78.7 | -1.0 |
| civil_comments (noul) | 79.0 | 79.3 | +0.3 |
| helpsteer2 (score) | 41.6 | 42.0 | +0.4 |
| massive-de-DE (choice) | 88.3 | 86.6 | -1.7 |
| massive-en-US (choice) | 88.3 | 88.0 | -0.3 |
| multinli (choice) | 89.0 | 87.0 | -2.0 |
| paws (noul) | 94.0 | 93.6 | -0.4 |
| pubmedqa (choice) | 64.0 | 63.2 | -0.8 |
| squad2 (noul) | 89.3 | 86.6 | -2.7 |
| summeval-consistency (score) | 75.0 | 75.0 | +0.0 |
| summeval-relevance (score) | 21.7 | 21.7 | +0.0 |
| vitaminc-dev (choice) | 72.5 | 72.1 | -0.3 |
| Macro, banco público (13 subconjuntos) | 74.3 | 73.6 | -0.7 |
| banking77 (choice) | 59.1 | 59.2 | +0.1 |
| contrastive_th (choice) | 80.7 | 80.4 | -0.3 |
| contrastive_th (noul) | 83.5 | 83.1 | -0.4 |
| contrastive_th (score) | 78.6 | 78.6 | +0.0 |
| massive_th (choice) | 90.6 | 90.1 | -0.5 |
| prachathai (choice) | 98.3 | 98.1 | -0.2 |
| prachathai (noul) | 93.4 | 93.4 | -0.1 |
| sib200_th (choice) | 77.9 | 76.5 | -1.5 |
| wisesight (choice) | 48.9 | 49.6 | +0.8 |
| wongnai (score) | 64.5 | 63.9 | -0.6 |
| xlam_tools (choice) | 99.4 | 99.4 | +0.0 |
| xnli_th (choice) | 79.8 | 77.9 | -1.9 |
| xnli_th (noul) | 86.8 | 85.5 | -1.2 |
| Macro, conjuntos tailandeses | 80.1 | 79.7 | -0.5 |

Precisión macro por nivel de cuantización (banco público / tailandés): F16 74.2 / 80.2; Q8_0 74.1 / 80.0; Q6_K 74.1 / 80.0; Q5_K_M 74.1 / 80.1; Q4_K_M 73.6 / 79.7; Q4_0 73.8 / 79.5. Latencia medida en una H100 con llama-cpp-python 0.3.35 y CUDA: aproximadamente 35 ms por decisión de tres preguntas en tailandés, para todos los niveles de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB para Q4_0, 0,53 GB para Q4_K_M, 0,58 GB para Q5_K_M, 0,63 GB para Q6_K, 0,81 GB para Q8_0 y 1,5 GB para F16/BF16, sin contar el overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre puede ejecutar las cuantizaciones Q4; una H100 se usó para medir los 35 ms por decisión. También es viable en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX con 2 GB o más de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090), así como en Apple Silicon con Metal.
- Opciones de despliegue: llama.cpp mediante llama-cpp-python con el cliente `GGUFSystemOneClient` incluido; también es posible leer los estados ocultos con `--embeddings --pooling none` y aplicar `head.safetensors` de forma manual. El GGUF aislado en `llama-cli` o `llama-server` no produce decisiones correctas.
- Latencia y throughput: aproximadamente 35 ms por decisión de tres preguntas en tailandés sobre H100; el throughput exacto no está disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai-SystemOne v0.3 (GGUF) | 752 M | no disponible | Decisión tipada (choice/score/noul) | Apache-2.0 | Hugging Face, GGUF |
| OpenThai-SystemOne v0.3 (PyTorch) | 752 M | no disponible | Decisión tipada (choice/score/noul) | Apache-2.0 | Hugging Face |
| Qwen3.5-0.8B | 0.8 B | no disponible | Generación de texto | no disponible en la información | no disponible en la información |

No se dispone de datos de benchmarks de modelos alternativos comparables en la información proporcionada.

## Limitaciones y advertencias

- El GGUF contiene solo la torre: ejecutarlo en `llama-cli` o `llama-server` sin el cliente y la cabeza de decisión produce texto sin sentido.
- La cuantización degrada ligeramente la precisión: hasta 2,7 puntos en squad2 y 2,0 en multinli con Q4_K_M; las cuantizaciones Q8_0, Q6_K y Q5_K_M mantienen una precisión prácticamente idéntica al original.
- El modelo solo soporta tailandés e inglés; su rendimiento en otros idiomas no está documentado.
- Es un modelo de decisión, no generativo: no puede producir texto libre, razonar en varios pasos ni usar herramientas.
- Los resultados de benchmarks se calcularon con un solo orden de opciones y sobre los primeros 800 registros de cada conjunto, lo que puede no reflejar el rendimiento con otros órdenes o distribuciones.
- Algunos subconjuntos muestran precisión baja incluso en el original, como summeval-relevance (21,7), helpsteer2 (41,6) y wisesight (48,9), lo que indica limitaciones en tareas de puntuación fina y en ciertos dominios tailandeses.
- Riesgo de alucinación no aplicable en el sentido generativo, pero las probabilidades calibradas pueden ser poco fiables fuera de la distribución de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente.
- No se dispone de información sobre sesgos conocidos ni sobre la composición del dataset de entrenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/iapp/OpenThai-SystemOne-GGUF
- Modelo base: https://huggingface.co/iapp/OpenThai-SystemOne
