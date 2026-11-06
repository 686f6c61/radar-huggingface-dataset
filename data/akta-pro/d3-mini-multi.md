# akta-pro/d3-mini-multi

## Resumen
d3-mini-multi es un ajuste fino de vllm-sr/d3-mini, un modelo de decisión ("system-one") construido sobre Qwen/Qwen3.5-4B que responde preguntas estructuradas en una sola pasada hacia delante. Lo desarrolla akta-pro y añade un cuarto tipo de pregunta, `multi`, que responde "¿cuáles de estas opciones aplican?" devolviendo de cero a muchas etiquetas, cada una con una puntuación calibrada y un umbral (cutoff) calculado por el propio modelo a partir de la entrada. Los otros tres tipos (`choice`, `score`, `noul`) se mantienen intactos.

La innovación es tratar el umbral como una opción más: el cutoff se puntúa en el mismo softmax que las etiquetas, de modo que el modelo fija un umbral distinto para cada entrada sin necesidad de tuning manual. Esto resuelve el problema clásico de la clasificación multietiqueta, donde un umbral global fijo funciona mal cuando el número de etiquetas positivas varía mucho entre entradas.

Con 4.539 millones de parámetros en BF16 y licencia Apache-2.0, es relevante para pipelines de clasificación de alto rendimiento donde se requiere una sola pasada por entrada en lugar de una por etiqueta, con resultados competitivos en dominios vistos y no vistos durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-4B base), readout de decisión con código personalizado (`custom_code`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de vllm-sr/d3-mini, que a su vez se construye sobre Qwen/Qwen3.5-4B. La arquitectura es un transformer con una cabeza de lectura (readout) específica del framework d3 que formula cada pregunta como una elección entre códigos: el readout puntúa hasta 255 códigos por pregunta y, en el caso de `multi`, uno de esos códigos es el cutoff. El cutoff se puntúa en el mismo softmax que las etiquetas y se conservan todas las etiquetas cuya puntuación lo supera, lo que produce un umbral adaptativo por entrada.

El ajuste fino se realizó sobre una mezcla de 14 datasets públicos: GoEmotions, arXiv abstracts, Civil Comments, LexGLUE, DBpedia-14, abstracts médicos, MASSIVE, Measuring Hate Speech, TweetTopic, BoolQ, CommonsenseQA, OpenBookQA, QASC y SNLI. Los pesos están en BF16; el readout, tokenizer, configuración y ficheros de runtime d3 se copian sin cambios de vllm-sr/d3-mini (revisión 97dd054), y solo difieren los pesos del modelo de lenguaje. No se documenta el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades
- Clasificación multietiqueta en una sola pasada: devuelve todas las etiquetas aplicables con puntuación calibrada y cutoff por entrada.
- Cuatro tipos de pregunta: `choice` (una opción), `score` (nivel en escala ordenada), `noul` (probabilidad de verdad de una afirmación) y `multi` (conjunto de opciones aplicables).
- Umbral adaptativo sin tuning: el cutoff se calcula a partir de la entrada; existe un parámetro `offset` para ajustes por tarea.
- Preguntas mixtas: los cuatro tipos pueden compartir una misma petición.
- Clasificación zero-shot y multi-label declaradas en el pipeline.
- Servicio compatible con endpoints mediante proxy sobre vLLM.
- Capacidad limitada a 254 opciones por pregunta (el readout puntúa 255 códigos, uno reservado al cutoff).
- Sin soporte documentado de tool calling, agentes, visión, audio ni modo thinking.
- Multilingüe: no disponible; solo se ha validado en inglés.

## Casos de uso
- Enrutamiento de tickets de soporte: una única pregunta `multi` con criterios por equipo (devoluciones, facturación, técnico, envío) devuelve todos los equipos que deben actuar, con puntuaciones como 0.9867 y 0.9108 en el ejemplo de la model card, permitiendo asignaciones múltiples sin una llamada por equipo.
- Moderación de comentarios: sobre Civil Comments alcanza micro-F1 de 0.78 con siete atributos de toxicidad, lo que permite etiquetar simultáneamente varias dimensiones de toxicidad en una sola pasada.
- Clasificación temática de documentos científicos: con 155 categorías de arXiv obtiene micro-F1 de 0.67, adecuado para indexación multietiqueta de preprints.
- Etiquetado jurídico: en ECtHR-A y ECtHR-B (artículos violados y alegados) logra 0.75 y 0.80, útil para triaje de demandas que citan varios artículos a la vez.
- Análisis de emociones en redes sociales: GoEmotions con 28 etiquetas y micro-F1 de 0.56, para análisis de sentimiento granular donde un texto expresa varias emociones.
- Clasificación de dominios no vistos: en UNFAIR-ToS (nunca visto en entrenamiento) alcanza 0.66 sin tuning, lo que permite desplegarlo en dominios nuevos con revisión humana por su precisión de 0.51.
- Catalogación de productos o contenidos: DBpedia-14 con micro-F1 de 0.98 demuestra viabilidad para taxonomías jerárquicas donde cada ítem pertenece a varias categorías.

## Benchmarks y rendimiento
Micro-F1 sobre datos de test reservados, sin tuning de umbral en ninguno de los lados. "1 pass" indica una pasada por entrada.

| Conjunto de test | Etiquetas | Base: un `noul` por etiqueta (p > 0.5) | Base: `choice` top-1 | d3-mini-multi (1 pass) |
|---|---|---|---|---|
| arXiv categories | 155 | 0.29 | 0.65 | 0.67 |
| Civil Comments (toxicidad) | 7 | 0.59 | 0.41 | 0.78 |
| DBpedia-14 | 14 | 0.90 | 0.97 | 0.98 |
| ECtHR-A (artículos violados) | 10 | 0.66 | 0.69 | 0.75 |
| ECtHR-B (artículos alegados) | 10 | 0.69 | 0.72 | 0.80 |
| GoEmotions | 28 | 0.40 | 0.56 | 0.56 |
| UNFAIR-ToS (no visto en entrenamiento) | 8 | 0.60 | 0.19 | 0.66 |
| TweetTopic (no visto en entrenamiento) | 19 | 0.63 | 0.68 | 0.68 |
| Hate-speech targets (no visto en entrenamiento) | 8 | 0.69 | 0.76 | 0.72 |

En el Decision Index público, sobre 10.763 peticiones (29.053 preguntas) de 42 benchmarks, d3-mini-multi obtiene 55.10 frente a 55.05 del modelo base, una diferencia de +0.01 puntos con error estándar de 0.22, lo que indica que los tipos `choice`, `score` y `noul` conservan su precisión.

## Requisitos de hardware
- VRAM estimada para inferencia en BF16: aproximadamente 9,1 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 16-24 GB para servicio con concurrencia moderada.
- GPU recomendadas: A100 40/80 GB o H100 para producción con alto throughput; L40S o RTX 6000 Ada como alternativas de 48 GB.
- En GPU de consumo: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16 con concurrencia limitada; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Despliegue: vLLM es el runtime de referencia (`vllm serve akta-pro/d3-mini-multi --no-enable-prefix-caching`), con el proxy `d3multi.serve` del repositorio GitHub delante para el endpoint `/v1/systemone`. No se documentan opciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; la ventaja estructural es una sola pasada por entrada frente a una por etiqueta en el enfoque `noul` base.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| d3-mini-multi | 4.539 M | no disponible | Clasificación multietiqueta en 1 pasada con cutoff adaptativo | Apache-2.0 | Hugging Face + GitHub |
| vllm-sr/d3-mini (base) | no disponible | no disponible | Preguntas `choice`, `score`, `noul`; sin `multi` | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (raíz) | ~4 B | no disponible | LLM generativo de propósito general | no disponible en la información | Hugging Face |

La comparativa con clasificadores multietiqueta dedicados (por ejemplo, basados en encoders tipo BERT) no está disponible en la información proporcionada; los benchmarks de la model card solo comparan contra el propio modelo base.

## Limitaciones y advertencias
- Dominios no vistos: en UNFAIR-ToS, `multi` sin tuning alcanza recall 0.94 pero precisión 0.51, etiquetando en exceso entradas donde el 89 % no tiene etiqueta.
- En hate-speech targets, donde la mayoría de comentarios apuntan a un solo grupo, `choice` top-1 supera a `multi` (0.76 frente a 0.72).
- Límite de 254 opciones por pregunta; el readout puntúa 255 códigos y uno se reserva para el cutoff.
- Márgenes casi nulos: opciones muy próximas al cutoff pueden cambiar de selección según la forma del batch o la precisión numérica.
- Solo validado en inglés; no se probaron otros idiomas ni preguntas `multi` sobre imágenes o vídeo.
- Riesgo de alucinación en el sentido de falsos positivos de etiquetado, especialmente en dominios fuera de la distribución de entrenamiento.
- Sesgos: no documentados explícitamente por el autor; los datasets de entrenamiento incluyen corpus de toxicidad y hate speech, cuyo sesgo inherente puede propagarse.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base d3-mini es Copyright 2026 vLLM Semantic Router Team y se construye sobre Qwen/Qwen3.5-4B, cuyos términos deben verificarse por separado.
- En producción, requiere el proxy del repositorio GitHub para el tipo `multi`; vLLM por sí solo no expone el endpoint `/v1/systemone`.
- No se documentan cuantizaciones alternativas ni requisitos de contexto, lo que limita la planificación de despliegues con recursos ajustados.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/akta-pro/d3-mini-multi
- Modelo base: https://huggingface.co/vllm-sr/d3-mini
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio GitHub (código y proxy): https://github.com/akta-pro/d3-multi
- Paper (blog): https://akta.pro/blog/the-cutoff-is-an-option-single-pass-multi-label-classification-with-adaptive-thresholding
- Resultados ampliados en GitHub: https://github.com/akta-pro/d3-multi#results
