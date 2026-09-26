# AIArchiveInfo/ModernBERT-large-zeroshot-v2.0

## Resumen

ModernBERT-large-zeroshot-v2.0 es un modelo de clasificación de texto (encoder-only) basado en answerdotai/ModernBERT-large, afinado para clasificación zero-shot siguiendo la metodología de la colección Zeroshot Classifiers de MoritzLaurer. La ficha que nos ocupa, AIArchiveInfo/ModernBERT-large-zeroshot-v2.0, no es un entrenamiento nuevo: es una copia espejo byte a byte del repositorio original, archivada el 25 de septiembre de 2026 para preservación, sin modificar pesos, licencia ni configuración.

El modelo cuenta con 395.833.346 parámetros (395,8 M) y una ventana de contexto de 8k tokens. Su propósito es resolver tareas de clasificación arbitrarias sin necesidad de reentrenamiento: basta con formular las etiquetas como hipótesis de inferencia de lenguaje natural (NLI). Es relevante porque ofrece una alternativa más rápida y ligera en memoria que DeBERTa-v3, soporta exportación a ONNX y safetensors, y mantiene licencia Apache-2.0 para uso comercial.

El autor original señala que el modelo es varias veces más rápido y consume varias veces menos memoria que DeBERTav3, aunque rinde ligeramente peor en la media de las tareas evaluadas. Está en preparación una versión nueva que aproveche plenamente el contexto de 8k y mejore el mix de datos sintéticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (derivado de answerdotai/ModernBERT-large), cabecera de clasificación de texto |
| Parametros totales | 395.833.346 (395,8 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (8k) |
| Tipos de cuantizacion | No disponible en detalle; el repositorio incluye pesos ONNX además de safetensors. El autor indica que habilitar bf16 (en lugar de fp16) da un incremento de velocidad de ~2x |
| Idiomas soportados | No disponible (la model card no declara idiomas; el mix de entrenamiento incluye el dataset MASSIVE, de naturaleza multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

Se trata de un transformer encoder-only de tipo BERT modernizado (ModernBERT) con una cabeza de clasificación de secuencias. No es un modelo generativo ni dispone de mecanismo de decodificación autoregresiva. El modelo base es answerdotai/ModernBERT-large, y esta variante se ha afinado sobre el mismo mix de datos que el resto de modelos `zeroshot-v2.0` de la colección Zeroshot Classifiers, que combina tareas de NLI (MNLI, FEVER-NLI, ANLI, WANLI, LingNLI), clasificación de sentimiento, detección de toxicidad, clasificación de temas, emociones, intenciones, spam y sesgos, entre otras.

Los hiperparámetros de entrenamiento declarados son: learning rate 9e-06, train_batch_size 16, eval_batch_size 32, gradient_accumulation_steps 2 (batch total 32), optimizador adamw_torch con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con warmup ratio 0.06, 2 épocas y semilla 42. El stack de entrenamiento fue Transformers 4.48.0.dev0, PyTorch 2.5.1+cu124, Datasets 3.2.0 y Tokenizers 0.21.0.

La innovación práctica no está en el algoritmo sino en la eficiencia: el modelo aprovecha la arquitectura ModernBERT para consumir mucha menos memoria que DeBERTav3, permitir lotes mayores y habilitar bf16 con ganancia de velocidad (~2x). No se proporcionan en la información disponible datos sobre número total de tokens de entrenamiento, composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicable en un clasificador).

## Capacidades

- Clasificación de texto zero-shot: permite definir etiquetas arbitrarias en tiempo de inferencia sin reentrenar.
- Clasificación multi-clase y multi-etiqueta, útil para categorización temática, sentimiento o intención.
- Inferencia de lenguaje natural (NLI), base de su funcionamiento zero-shot (entailment / neutral / contradiction).
- Análisis de sentimiento binario y por polaridad (rottentomatoes, amazonpolarity, imdb, yelpreviews, appreviews).
- Detección de toxicidad, odio y contenido ofensivo (hatexplain, wikitoxic, hateoffensive).
- Detección de spam en textos cortos (spam, trueteacher).
- Clasificación de intenciones de usuario (banking77, MASSIVE).
- Clasificación de emociones (emotiondair, emocontext, empathetic).
- Etiquetado de temas de noticias (agnews, yahootopics).
- Análisis de sesgos en textos (biasframes: sexo, ofensa, intención).
- Clasificación de documentos financieros y de manifiestos (financialphrasebank, manifesto).
- Capacidad multilingüe potencial vía MASSIVE, aunque no declarada oficialmente.
- No soporta tool calling ni function calling (no es un modelo de instrucciones).
- No soporta agentes ni razonamiento multi-paso (no es generativo).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de contenido en plataformas: usar el modelo para detectar toxicidad, obscenidad, amenazas e identidad de odio con etiquetas configurables, aprovechando los subconjuntos wikitoxic y hatexplain sobre los que se ha evaluado, con alto rendimiento (accuracy 0,90-0,96 en varios subconjuntos).
- Análisis de sentimiento en reseñas de producto: clasificación zero-shot de reseñas de Amazon, Yelp, IMDB o tiendas de aplicaciones sin necesidad de datos etiquetados, gracias a la ventana de 8k tokens para reseñas largas.
- Enrutamiento de intenciones en chatbots: clasificar la consulta del usuario en categorías como las de banking77 o MASSIVE para dirigirla al flujo o al agente adecuado, con latencias de miles de textos por segundo en GPU.
- Detección de spam y phishing en textos cortos: uso sobre correos, SMS o mensajes de foros con etiquetas ajustables, apoyándose en los buenos resultados del subconjunto spam (accuracy 0,989).
- Análisis de emociones en encuestas o redes sociales: clasificación de emociones por categorías (emotiondair, emocontext) y detección de textos empáticos, útil para estudios de opinión o atención al cliente emocional.
- Etiquetado zero-shot de documentos financieros: clasificación de frases o párrafos financieros en categorías regulatorias o de riesgo sin etiquetas propias, usando financialphrasebank como referencia (accuracy 0,913).
- Clasificación temática de noticias y contenidos editoriales: categorización de artículos en temas como los de AG News o Yahoo Topics, para sistemas de recomendación o indexación.
- Filtrado de consultas mal formadas: detección de queries inválidas o mal construidas (wellformedquery, accuracy 0,815) antes de pasarlas a un motor de búsqueda.
- Auditoría de sesgos en producción: análisis de sesgo de género, ofensa o intención en textos generados o recopilados, usando los subconjuntos biasframes como referencia.
- Clasificación de textos políticos o de manifiestos: análisis de encuadre temático, aunque con rendimiento bajo en el subconjunto manifesto (accuracy 0,497), por lo que requiere validación específica.

## Benchmarks y rendimiento

La model-index oficial está vacía, pero la model card incluye una tabla de resultados de entrenamiento con accuracy, F1 macro y velocidad de inferencia (textos/segundo en una A100 40 GB, batch=32) sobre 38 conjuntos de datos.

| Dataset | Accuracy | F1 macro | Textos/seg (A100 40GB, batch=32) |
|---|---|---|---|
| Mean | 0,85 | 0,834 | 1116 |
| Mean w/o NLI | 0,851 | 0,835 | 1104 |
| mnli_m | 0,942 | 0,935 | 1039 |
| mnli_mm | 0,944 | 0,938 | 1241 |
| fevernli | 0,894 | 0,882 | 1138 |
| anli_r1 | 0,812 | 0,795 | 1102 |
| anli_r2 | 0,717 | 0,688 | 1124 |
| anli_r3 | 0,716 | 0,676 | 1133 |
| wanli | 0,836 | 0,823 | 1251 |
| lingnli | 0,909 | 0,898 | 1240 |
| wellformedquery | 0,815 | 0,814 | 1263 |
| rottentomatoes | 0,899 | 0,899 | 1231 |
| amazonpolarity | 0,964 | 0,964 | 1054 |
| imdb | 0,951 | 0,951 | 559 |
| yelpreviews | 0,984 | 0,984 | 795 |
| hatexplain | 0,814 | 0,77 | 1238 |
| massive | 0,8 | 0,753 | 1312 |
| banking77 | 0,744 | 0,763 | 1285 |
| emotiondair | 0,752 | 0,69 | 1273 |
| emocontext | 0,802 | 0,805 | 1268 |
| empathetic | 0,544 | 0,533 | 992 |
| agnews | 0,899 | 0,899 | 1222 |
| yahootopics | 0,735 | 0,729 | 894 |
| biasframes_sex | 0,934 | 0,925 | 1176 |
| biasframes_offensive | 0,864 | 0,864 | 1194 |
| biasframes_intent | 0,877 | 0,877 | 1197 |
| financialphrasebank | 0,913 | 0,901 | 1206 |
| appreviews | 0,953 | 0,953 | 1166 |
| hateoffensive | 0,921 | 0,855 | 1227 |
| trueteacher | 0,821 | 0,821 | 541 |
| spam | 0,989 | 0,983 | 1199 |
| wikitoxic_toxicaggregated | 0,901 | 0,901 | 1045 |
| wikitoxic_obscene | 0,927 | 0,927 | 1054 |
| wikitoxic_identityhate | 0,931 | 0,931 | 1020 |
| wikitoxic_threat | 0,959 | 0,952 | 1005 |
| wikitoxic_insult | 0,911 | 0,911 | 1063 |
| manifesto | 0,497 | 0,362 | 1214 |
| capsotu | 0,73 | 0,662 | 1220 |

No se han publicado en la información disponible resultados de benchmarks comparativos directos (por ejemplo, frente a DeBERTa-v3) más allá de la afirmación cualitativa del autor de que el modelo rinde "ligeramente peor en media" que DeBERTav3 en las tareas evaluadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp32, ~0,8 GB en fp16/bf16 y ~0,4 GB en int8 (cálculo a partir de los 395,8 M de parámetros; cifras orientativas). Hay que sumar la memoria de activaciones y el lote.
- GPU recomendadas: A100 40 GB para máximo throughput (~1100-1300 textos/seg con batch=32); H100 y L40S también adecuadas.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 6 GB o más. Funciona en RTX 3060 12 GB, RTX 4070, RTX 4090 e incluso en GPUs de gama baja con cuantización.
- CPU: viable para lotes pequeños o entornos sin GPU, dado el tamaño reducido del modelo.
- Opciones de despliegue: transformers (pipeline de text-classification), ONNX Runtime (el repo incluye exportación ONNX), text-embeddings-inference (etiqueta del repositorio) y Hugging Face Inference Endpoints (etiqueta endpoints_compatible). No es un modelo adecuado para vLLM, que está orientado a decodificación generativa.
- Latencia y throughput: en A100 40 GB con batch=32 se alcanzan entre ~540 y ~1312 textos/segundo según el dataset; la media es de 1116 textos/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento relativo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT-large-zeroshot-v2.0 (este, copia espejo) | 395,8 M | 8k | Baseline; media accuracy 0,85, F1 macro 0,834 | Apache-2.0 | Hugging Face (repo espejo) |
| MoritzLaurer/ModernBERT-large-zeroshot-v2.0 (original) | 395,8 M | 8k | Idéntico (copia byte a byte) | Apache-2.0 | Hugging Face |
| DeBERTa-v3-large-zeroshot-v2.0 (referencia citada en la model card) | No disponible en la información proporcionada | No disponible | El autor indica que este modelo rinde "ligeramente peor" que DeBERTav3 en media | No disponible | Hugging Face |
| ModernBERT-base-zeroshot-v2.0 (referencia de menor tamaño) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | Hugging Face |

## Limitaciones y advertencias

- Se trata de una copia espejo de archivo: no se han entrenado ni modificado pesos; cualquier mérito corresponde a los autores originales.
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- El propio autor advierte de que rinde ligeramente peor que DeBERTav3 en la media de las tareas evaluadas.
- Riesgo de clasificación errónea: en clasificación zero-shot el resultado depende fuertemente de cómo se formulan las etiquetas; etiquetas ambiguas o mal redactadas degradan la precisión.
- El subconjunto manifesto obtiene un rendimiento muy bajo (accuracy 0,497, F1 macro 0,362), por lo que no es fiable para clasificación de textos políticos sin validación adicional.
- El subconjunto empathetic también es débil (accuracy 0,544), lo que limita su uso en detección de empatía.
- Idiomas no declarados oficialmente: aunque el mix incluye MASSIVE (multilingüe), no hay garantía de calidad en idiomas distintos del inglés.
- Aunque el modelo base soporta 8k de contexto, el autor reconoce que la versión actual no aprovecha plenamente esa ventana y está preparando una nueva versión con mejor mix de datos.
- Sesgos potenciales: la model card no documenta una evaluación de sesgos más allá de los subconjuntos biasframes, por lo que conviene auditar el modelo antes de usarlo en decisiones sensibles.
- Licencia Apache-2.0: permite uso comercial y modificación, siempre que se conserve la atribución y el aviso de licencia.
- Repositorio con 0 descargas y 0 likes y sin model-index de benchmarks publicada: no cuenta con validación comunitaria ni resultados oficiales más allá de la tabla de entrenamiento.
- Alucinación: no aplica en el sentido generativo, pero sí puede asignar etiquetas incorrectas con alta confianza en dominios fuera de su distribución de entrenamiento.

## Enlaces

- Hugging Face (copia espejo): https://huggingface.co/AIArchiveInfo/ModernBERT-large-zeroshot-v2.0
- Repositorio original: https://huggingface.co/MoritzLaurer/ModernBERT-large-zeroshot-v2.0
- Revisión exacta archivada del original: https://huggingface.co/MoritzLaurer/ModernBERT-large-zeroshot-v2.0/tree/a51e07b524299e309dd2b88d48b0cfa2bd9ec598
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-large
- Colección Zeroshot Classifiers: https://huggingface.co/collections/MoritzLaurer/zeroshot-classifiers-6548b4ff407bb19ff5c3ad6f
