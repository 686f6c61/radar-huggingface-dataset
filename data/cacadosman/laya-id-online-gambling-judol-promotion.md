# cacadosman/laya-id-online-gambling-judol-promotion

## Resumen

Laya Indonesian Online-Gambling Promotion Detector es un modelo de clasificación de texto afinado a partir de `convaiinnovations/laya-multilingual`, un encoder multilingüe basado en `jhu-clsp/mmBERT-base`. Lo desarrolla el usuario `cacadosman` y su tarea concreta es detectar comentarios de YouTube y mensajes de donación de Saweria en indonesio y javanés que promocionan el juego online ilegal, conocido localmente como `JUDOL`. No es un modelo generativo: devuelve una decisión binaria (`JUDOL` o `NON_JUDOL`) con probabilidades en un único forward pass.

El modelo resuelve un problema de moderación muy específico del ecosistema digital indonesio: el spam de promoción de casinos y sitios de apuestas en directos y chats de donación. A diferencia de un filtro por palabras clave, clasifica la intención completa del comentario, de modo que una mención aislada de términos como `slot`, `gacor` o `freebet` no basta para etiquetarlo como promoción. Esto reduce falsos positivos en conversaciones normales, quejas o peticiones de moderación.

Con 321.908.998 parámetros y un repositorio de 0,7 GB, es un modelo compacto pensado para despliegue en producción con baja latencia. Su relevancia actual radica en que ofrece una alternativa ligera y de licencia Apache-2.0 frente a soluciones propietarias de moderación, con métricas publicadas sobre un benchmark externo y un mecanismo opcional de guardas deterministas para reducir falsos positivos en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base `jhu-clsp/mmBERT-base` vía `convaiinnovations/laya-multilingual`) |
| Parámetros totales | 321.908.998 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (el repo contiene safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | indonesio (`id`), javanés (`jv`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `convaiinnovations/laya-multilingual`, cuyo encoder es `jhu-clsp/mmBERT-base`. Sobre esa base se añade una cabeza de clasificación binaria para la tarea `judol_detection`, que devuelve la etiqueta `JUDOL` o `NON_JUDOL` junto con sus probabilidades. El checkpoint subido corresponde a la versión "V8 data-only", es decir, los pesos afinados sin la capa de guardas deterministas que el autor ofrece por separado.

El entrenamiento se realizó con 4.598 filas sintéticas en indonesio y javanés, balanceadas 2.299 / 2.299, durante 2 épocas, con micro-batch 2 y acumulación de gradiente 8. Se usó un learning rate de `2.5e-5` para el encoder y `1e-4` para la cabeza, longitud máxima de 512 tokens y entropía cruzada suave (soft cross-entropy). No se emplearon filas de Kaggle para el entrenamiento; los datos externos se reservaron para evaluación y para evitar coincidencias exactas con el conjunto de entrenamiento. El autor advierte que el modelo se entrenó con datos sintéticos, por lo que puede sufrir deriva frente a datos reales.

## Capacidades

- Clasificación binaria de texto: devuelve `JUDOL` o `NON_JUDOL` con probabilidades en un solo forward pass.
- Detección de promoción explícita e indirecta de juego online: reclutamiento, referencias a sitios de apuestas o slots, ofertas de freebet o depósito, y mensajes de donantes/TTS que promocionan servicios de apuestas.
- Distinción entre promoción y menciones neutras: no basta una palabra clave aislada; se clasifica la intención del comentario completo.
- Manejo de comentarios de YouTube y mensajes de donación de Saweria en indonesio y javanés.
- Entrada de texto plano: el modelo espera texto sin envolver en estructuras JSON; el autor advierte que serializar un diccionario altera la distribución de entrada.
- Capa opcional de guardas deterministas (`apply_policy_guard.py`) que suprime falsos positivos en chat ordinario y quejas claras; solo puede convertir `JUDOL` en `NON_JUDOL`, nunca al contrario.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de chat en directo de YouTube: el modelo puede clasificar en tiempo real cada comentario entrante y marcar los que promocionan apuestas, con una latencia baja gracias a sus 321 millones de parámetros y a una sola pasada de inferencia.
- Moderación de mensajes de donación en Saweria: permite filtrar mensajes de donantes que incluyen promociones de sitios de apuestas o referencias a slots, un vector habitual de spam en directos indonesios.
- Pre-filtro en pipelines de moderación humana: el modelo actúa como primera capa que prioriza los comentarios sospechosos para revisión manual, reduciendo la carga de los moderadores sin automatizar el baneo.
- Detección de campañas de spam coordinado: al clasificar grandes volúmenes de comentarios, permite identificar patrones de promoción repetidos y generar listas de cuentas o términos para revisión.
- Análisis de toxicidad y spam en comunidades de gaming: útil para equipos de confianza y seguridad que necesitan cuantificar la prevalencia de promoción de juego en sus plataformas.
- Investigación sobre moderación en lenguas de bajos recursos: el modelo sirve como referencia para estudiar la detección de spam en indonesio y javanés, idiomas con pocos recursos anotados.
- Integración en sistemas de comentarios propios: cualquier plataforma indonesia con sección de comentarios puede usar el modelo como servicio de clasificación vía `transformers` o endpoints compatibles.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card.

| Split / benchmark | Accuracy | Macro-F1 | Precision JUDOL | Recall JUDOL |
|---|---:|---:|---:|---:|
| Validación sintética | 99,71% | 99,71% | 99,42% | 100,00% |
| Test sintético | 99,33% | 99,33% | 98,68% | 100,00% |

Benchmark externo `yaemico/deteksi-judi-online` (2.695 filas deduplicadas, con cuatro comentarios corregidos a `NON_JUDOL` según la política del modelo):

| Pipeline | Accuracy | Precision | Recall | F1 | FP | FN |
|---|---:|---:|---:|---:|---:|---:|
| V8 data-only | 99,37% | 65,31% | 100,00% | 79,01% | 17 | 0 |
| V8 + guarda opcional | 99,81% | 86,49% | 100,00% | 92,75% | 5 | 0 |

Sonda de recall: de los 36 positivos externos únicos excluidos del entrenamiento, el modelo detecta 30/30 ejemplos genuinamente promocionales (100% de recall según la política); los cuatro restantes son quejas, peticiones de moderación o menciones de marca sin intención promocional que la política etiqueta como `NON_JUDOL`. En los 24 comentarios de chat ordinario del benchmark, con la guarda se obtienen 0/24 falsos positivos; sin ella, 2/24.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,3 GB para los pesos (321,9 M de parámetros); en fp16 aproximadamente 0,65 GB. La memoria real depende del batch y de la longitud de secuencia.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en fp16 con batches pequeños; una RTX 3060, RTX 4060 o superior es suficiente.
- Cabe en GPU de consumo: sí, en modelos como RTX 3050, RTX 3060, RTX 4060, RTX 4090, así como en Apple Silicon y en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con PyTorch, `laya` (librería indicada en la model card), y endpoints compatibles con Hugging Face. No se documentan variantes GGUF para llama.cpp u Ollama, ni integración con vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo y la longitud máxima de 512 tokens, se espera una latencia de milisegundos por lote en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con alternativas equivalentes en la información proporcionada. Como referencia estructural, el modelo se apoya en `jhu-clsp/mmBERT-base` y en `convaiinnovations/laya-multilingual`, ambos encoders multilingües de tamaño base; sin embargo, no se conocen modelos de clasificación de promoción de juego en indonesio/javanés con métricas comparables en esta ficha.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Laya ID Online-Gambling Judol (este) | 321,9 M | 512 | Clasificación binaria judol | Apache-2.0 | Hugging Face |
| `convaiinnovations/laya-multilingual` (base) | no disponible | no disponible | Modelo base multilingüe | Apache-2.0 | Hugging Face |
| `jhu-clsp/mmBERT-base` (encoder subyacente) | no disponible | no disponible | Encoder multilingüe | no disponible | Hugging Face |

## Limitaciones y advertencias

- Entrenado con datos sintéticos: el autor advierte de posible deriva frente a datos reales de producción.
- Diseñado para comentarios cortos en indonesio y javanés; su rendimiento fuera de esos idiomas o en textos largos no está validado.
- El benchmark externo contiene ruido de etiquetas; algunos falsos positivos restantes parecen promocionales pero están etiquetados como `NON_JUDOL`.
- No debe usarse para banear o borrar comentarios de forma autónoma: el autor lo plantea como apoyo a la moderación humana.
- La guarda opcional está ajustada para chat ordinario y quejas claras; no es un motor genérico de políticas de contenido.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas en casos límite o de sarcasmo.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones de la licencia del modelo base y del encoder subyacente.
- Solo 15 descargas y 0 likes en el momento de la ficha: ecosistema de validación todavía muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cacadosman/laya-id-online-gambling-judol-promotion
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Encoder subyacente: https://huggingface.co/jhu-clsp/mmBERT-base
- Benchmark externo: https://huggingface.co/datasets/yaemico/deteksi-judi-online
