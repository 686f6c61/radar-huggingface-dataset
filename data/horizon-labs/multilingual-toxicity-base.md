# Horizon-Labs/multilingual-toxicity-base

## Resumen

Multilingual Toxicity (base) es un clasificador multi-etiqueta de comentarios tóxicos desarrollado por Horizon-Labs. Se construye sobre el encoder multilingüe mmBERT-base de JHU (307,5 millones de parámetros) y reproduce el conjunto de etiquetas de Detoxify: toxicity, severe_toxicity, obscene, threat, insult, identity_attack y sexual_explicit. Cada etiqueta recibe una probabilidad independiente mediante sigmoide, por lo que el modelo puede marcar simultáneamente varias dimensiones de toxicidad en un mismo texto.

El modelo resuelve un problema concreto de moderación de contenido en entornos multilingües: los clasificadores de toxicidad de referencia (unitary/unbiased-toxic-roberta, unitary/toxic-bert) están entrenados y evaluados casi exclusivamente en inglés, y su rendimiento cae drásticamente fuera de ese idioma. Esta versión cubre inglés y otras 33 lenguas, incluido español, y se distribuye con licencia Apache-2.0, pesos safetensors y ONNX (incluida una variante int8 para CPU y navegador mediante transformers.js).

Su relevancia actual radica en que es un reemplazo directo de Detoxify en pipelines existentes: las etiquetas coinciden con las que esperan los escáneres de toxicidad de LLM Guard, lo que permite moderar prompts y respuestas de LLM en múltiples idiomas sin cambiar la lógica de integración. Existe además una variante más pequeña y rápida (multilingual-toxicity-small, 141M).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, mmBERT-base) para clasificación de texto multi-etiqueta |
| Parametros totales | 307.535.623 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card usa truncation a 512 tokens en los ejemplos de LLM Guard) |
| Tipos de cuantizacion | ONNX int8 (model_quantized.onnx, 641 MB, embeddings int8); pesos fp32 en safetensors; dtype q8 en transformers.js |
| Idiomas soportados | Multilingüe: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, fi, hu, el, tr, ar, he, fa, hi, bn, ur, zh, ja, ko, vi, th, id, sw, am, tt (34 lenguas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT, concretamente una adaptación de jhu-clsp/mmBERT-base, con una cabeza de clasificación multi-etiqueta de siete salidas y activación sigmoide independiente por etiqueta. No es un modelo generativo: produce probabilidades por clase, no texto. La elección de un encoder de 308M parámetros sitúa el modelo en un punto intermedio entre los clasificadores ligeros de ~110-125M (toxic-bert, unbiased-toxic-roberta) y modelos mucho más grandes, buscando mejor cobertura multilingüe sin disparar el coste de inferencia.

El entrenamiento combina el dataset Civil Comments (licencia CC0) con traducciones multilingües publicadas como Horizon-Labs/civil-comments-multilingual. La model card indica que los benchmarks se usaron solo para evaluación y que se eliminaron del entrenamiento los textos que también aparecen en ellos. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición precisa del dataset traducido ni si se aplicaron técnicas de ajuste adicionales (RLHF/DPO no aplican a un clasificador; no se menciona destilación ni calibración específica más allá de la cuantización int8). La innovación técnica destacable es la cuantización int8 de embeddings en ONNX, con una desviación media de 0,0008 en probabilidad respecto a fp32 sobre 448 textos de prueba, lo que habilita despliegue en CPU y en navegador.

## Capacidades

- Clasificación multi-etiqueta de toxicidad con siete etiquetas independientes: toxicity, severe_toxicity, obscene, threat, insult, identity_attack y sexual_explicit.
- Detección de toxicidad en inglés y 33 lenguas adicionales, incluido español, con ejemplos explícitos en alemán y español en la model card.
- Puntuación por umbral configurable: la recomendación por defecto es marcar con toxicity >= 0.5, pero la model card advierte que los textos no ingleses tienden a puntuar más bajo, por lo que sugiere umbrales inferiores para contenido multilingüe.
- Integración con LLM Guard como escáner de entrada y salida (input_scanners.Toxicity y output_scanners.Toxicity), sustituyendo el modelo inglés por defecto.
- Ejecución en navegador mediante transformers.js con dtype q8.
- Inferencia en CPU mediante los ficheros ONNX incluidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderación de comentarios en foros y redes sociales: el modelo puntúa cada comentario con siete etiquetas y permite aplicar políticas diferenciadas (por ejemplo, bloquear insultos automáticamente y revisar manualmente identity_attack) en comunidades multilingües sin desplegar un clasificador por idioma.
- Moderación de prompts y respuestas de LLM: integrado en LLM Guard como escáner de entrada y salida, filtra contenido tóxico en las interacciones con un chatbot en varios idiomas; la model card confirma pruebas correctas con llm-guard 0.3.16 en inglés, alemán, español y ruso.
- Moderación en el navegador o en el cliente: los ficheros ONNX int8 y el soporte de transformers.js permiten ejecutar la clasificación localmente en la web, sin enviar el texto del usuario a un servidor, lo que reduce latencia y mejora la privacidad.
- Filtrado previo de datasets de entrenamiento: al ser un clasificador rápido y multilingüe, puede usarse para limpiar corpus de comentarios antes de entrenar modelos generativos, marcando ejemplos con alta probabilidad de insulto, amenaza u obscenidad.
- Triaje en sistemas de atención al cliente: clasificar mensajes de usuarios en español y otras lenguas para enrutar automáticamente los casos con threat o identity_attack a equipos de escalado, reduciendo el tiempo de respuesta ante abusos.
- Investigación en detección de toxicidad multilingüe: el modelo sirve como línea base reproducible (Apache-2.0, pesos abiertos, benchmarks publicados sobre Civil Comments y TextDetox) para comparar nuevas aproximaciones en 15 lenguas.
- Análisis de reputación y monitorización de menciones de marca: procesar grandes volúmenes de comentarios públicos en múltiples idiomas con inferencia por lotes en CPU (ONNX) y agregar las puntuaciones por etiqueta para detectar picos de toxicidad.

## Benchmarks y rendimiento

Datos publicados en la model card. Civil Comments test: 20.000 comentarios en inglés, ROC AUC por etiqueta con binarización a >= 0,5; la media se calcula sobre las 6 etiquetas con al menos 20 positivos (severe_toxicity no alcanza ese umbral). TextDetox (textdetox/multilingual_toxicity_dataset): clasificación binaria tóxico/no tóxico en 15 lenguas, 1.000 textos balanceados por lengua; se reporta ROC AUC de la probabilidad de toxicity y F1 a umbral 0,5.

| Modelo | Licencia | Civil Comments, AUC medio (6 etiquetas) | Civil Comments, AUC toxicity | TextDetox (15 lenguas), AUC | TextDetox, F1 @ 0,5 | Etiquetas |
|---|---|---|---|---|---|---|
| multilingual-toxicity-base (308M) | Apache-2.0 | 0,988 | 0,971 | 0,854 | 0,433 | 7 etiquetas Detoxify, multilingüe |
| multilingual-toxicity-small (141M) | Apache-2.0 | 0,988 | 0,972 | 0,835 | 0,547 | 7 etiquetas Detoxify, multilingüe |
| unitary/unbiased-toxic-roberta (125M) | Apache-2.0 | 0,985 | 0,969 | 0,588 | 0,086 | 7 etiquetas Detoxify (+ identity), inglés |
| unitary/toxic-bert (110M) | Apache-2.0 | 0,946 | 0,926 | 0,623 | 0,142 | 6 etiquetas, inglés |
| s-nlp/roberta_toxicity_classifier (125M) | OpenRAIL++ | 0,975 | 0,970 | No disponible | No disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2-1,5 GB para los 307,5M parámetros más activaciones; en la práctica, un clasificador de este tamaño cabe en cualquier GPU consumer con 4 GB o más.
- VRAM estimada con ONNX int8: en torno a 0,6-0,8 GB (el fichero model_quantized.onnx ocupa 641 MB), apto para CPU sin GPU.
- GPU recomendadas: no requiere GPU dedicada para uso moderado; para alto throughput, A100, H100, L40S o RTX 4090/3090. En consumer, cualquier RTX con 4-8 GB es suficiente.
- Cabe en GPU consumer: sí, en todas las RTX y GTX modernas con al menos 4 GB; también en CPU y en navegador vía transformers.js.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime, transformers.js, LLM Guard (rutas PyTorch y ONNX), y despliegue como endpoint compatible con text-embeddings-inference según los tags del repositorio.
- Latencia y throughput: no se publican cifras en la información disponible. La model card solo indica que la variante small (141M) es más pequeña y rápida, y que la cuantización int8 introduce una desviación media de 0,0008 en probabilidad frente a fp32.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| multilingual-toxicity-base | 307,5M | No disponible | 34 | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| multilingual-toxicity-small | 141M | No disponible | Multilingüe (mismo conjunto de etiquetas) | Apache-2.0 | Hugging Face |
| unitary/unbiased-toxic-roberta | 125M | No disponible | Inglés | Apache-2.0 | Hugging Face |
| unitary/toxic-bert | 110M | No disponible | Inglés | Apache-2.0 | Hugging Face |
| s-nlp/roberta_toxicity_classifier | 125M | No disponible | Inglés | OpenRAIL++ | Hugging Face |

En rendimiento, multilingual-toxicity-base iguala o supera ligeramente a unbiased-toxic-roberta en Civil Comments (AUC medio 0,988 frente a 0,985) y lo supera con claridad en TextDetox multilingüe (0,854 frente a 0,588), a cambio de casi el triple de parámetros. Frente a su propia variante small, el base obtiene mejor AUC en TextDetox (0,854 frente a 0,835) pero peor F1 a umbral 0,5 (0,433 frente a 0,547), lo que sugiere que el small está mejor calibrado para el umbral por defecto y el base requiere ajuste de umbral.

## Limitaciones y advertencias

- Los textos no ingleses tienden a puntuar más bajo que los ingleses (véase el F1 @ 0,5 de 0,433 en TextDetox), por lo que el umbral de 0,5 puede producir falsos negativos en contenido multilingüe; la model card recomienda calibrar el umbral sobre datos propios.
- Es un clasificador de comentarios tóxicos, no un detector de peticiones peligrosas a un LLM (armas, autolesión, etc.); para ese caso el autor remite a content-safety-guard-small.
- Para discurso de odio con identificación del grupo objetivo, el autor remite a multilingual-hate-speech-base; identity_attack aquí no desglosa el grupo atacado.
- Riesgo de sesgo: al entrenarse sobre Civil Comments y traducciones, hereda los sesgos de anotación de ese corpus y de los procesos de traducción; la model card no documenta auditorías de sesgo por lengua.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos en la clasificación, especialmente en jerga, ironía, dialectos y lenguas con pocos datos.
- El contexto máximo no está documentado; los ejemplos de LLM Guard truncan a 512 tokens, por lo que textos más largos pueden perder información.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero conviene revisar las condiciones de los datasets de origen (Civil Comments es CC0) y de las traducciones.
- La cuantización int8 altera ligeramente las probabilidades (desviación media de 0,0008), aceptable para moderación pero a validar si se usan umbrales muy ajustados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Horizon-Labs/multilingual-toxicity-base
- Variante small: https://huggingface.co/Horizon-Labs/multilingual-toxicity-small
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Detector de seguridad de contenido: https://huggingface.co/Horizon-Labs/content-safety-guard-small
- Detector de discurso de odio: https://huggingface.co/Horizon-Labs/multilingual-hate-speech-base
- Detoxify (Unitary AI): https://github.com/unitaryai/detoxify
- unbiased-toxic-roberta: https://huggingface.co/unitary/unbiased-toxic-roberta
- toxic-bert: https://huggingface.co/unitary/toxic-bert
- s-nlp/roberta_toxicity_classifier: https://huggingface.co/s-nlp/roberta_toxicity_classifier
- LLM Guard: https://github.com/protectai/llm-guard
- Dataset Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset Civil Comments multilingüe: https://huggingface.co/datasets/Horizon-Labs/civil-comments-multilingual
- Dataset TextDetox multilingüe: https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset
