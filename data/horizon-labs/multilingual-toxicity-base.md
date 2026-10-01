# Horizon-Labs/multilingual-toxicity-base

## Resumen

Multilingual Toxicity (base, 308M) es un clasificador multietiqueta de comentarios toxicos desarrollado por Horizon-Labs. Reutiliza las siete etiquetas del conocido proyecto Detoxify (toxicity, severe_toxicity, obscene, threat, insult, identity_attack, sexual_explicit) y las extiende a 33 idiomas ademas del ingles, con una unica cabecera de clasificacion. Esta construido sobre jhu-clsp/mmBERT-base, un encoder de la familia ModernBERT afinado especificamente para cobertura multilingue, y suma 307.535.623 parametros (unos 308M).

El problema que resuelve es concreto: la mayoria de los clasificadores de toxicidad de referencia (toxic-bert, unbiased-toxic-roberta) solo funcionan en ingles, mientras que las alternativas multilingues suelen reducirse a una unica etiqueta binaria toxic/no toxic. Este modelo ofrece el esquema completo de siete etiquetas de Detoxify en 34 idiomas, con probabilidad independiente por etiqueta mediante sigmoide, lo que permite umbrales distintos por categoria y por idioma.

Es relevante ahora porque la moderacion de contenido en plataformas con audiencias multilingues es exigida por normativas como la DSA europea, y porque el modelo se distribuye bajo licencia Apache-2.0 con pesos en safetensors y ONNX, incluyendo una version cuantizada a int8 de 641 MB que puede ejecutarse en CPU y directamente en el navegador con transformers.js. La model card reporta un AUC de 0,854 en el benchmark multilingue TextDetox (15 idiomas) y un AUC de 0,988 en la media de seis etiquetas de Civil Comments. El repositorio se publicó el 1 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia ModernBERT, derivado de jhu-clsp/mmBERT-base) |
| Parametros totales | 307.535.623 (aproximadamente 308M) |
| Parametros activos | no aplica: no es un modelo MoE |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (ONNX, embeddings cuantizados); no se documentan otras |
| Idiomas soportados | 33 codigos en los metadatos (en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, fi, hu, el, tr, ar, he, fa, hi, bn, ur, zh, ja, ko, vi, th, id, sw, am, tt); el autor indica ingles mas otros 33 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (onnx/model_quantized.onnx) |
| Tarea (pipeline) | text-classification (clasificacion multietiqueta) |
| Numero de etiquetas | 7 (toxicity, severe_toxicity, obscene, threat, insult, identity_attack, sexual_explicit) |
| Modelo base | jhu-clsp/mmBERT-base |
| Dataset de entrenamiento | google/civil_comments (CC0) mas traducciones |
| Tamano del repositorio | 3,1 GB |
| Libreria | transformers |
| Fecha de publicacion | 1 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT afinado como clasificador multietiqueta. Parte de mmBERT-base, la variante multilingue de la familia ModernBERT, y anade una cabeza de clasificacion con siete salidas independientes activadas por sigmoide, el mismo esquema que Detoxify. Esto significa que las etiquetas no son mutuamente excluyentes: un mismo comentario puede recibir simultaneamente valores altos en obscene, insult y threat, y cada una se evalua con su propio umbral.

Los datos de entrenamiento provienen del corpus Civil Comments (licencia CC0), que es en ingles, complementado con traducciones para cubrir el resto de idiomas. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta de las traducciones ni si se aplicaron etapas de RLHF o DPO, algo que tampoco tendria sentido en un clasificador supervisado. La evaluacion se realizo con los benchmarks excluidos del entrenamiento: la model card afirma que se eliminaron los textos de entrenamiento que aparecian en los conjuntos de evaluacion. El autor reporta medias sobre dos semillas de entrenamiento, lo que aporta una estimacion de estabilidad.

El artefacto de despliegue mas ligero es onnx/model_quantized.onnx, con embeddings cuantizados a int8 y un tamano de 641 MB; la model card indica que las probabilidades difieren de las de fp32 en 0,0008 de media sobre 448 textos de prueba. Existe tambien una variante reducida, Horizon-Labs/multilingual-toxicity-small (141M), y un modelo hermano orientado a peticiones daninas a LLM, Horizon-Labs/content-safety-guard-small.

## Capacidades

- Clasificacion multietiqueta de toxicidad con siete etiquetas independientes: toxicity, severe_toxicity, obscene, threat, insult, identity_attack y sexual_explicit.
- Cobertura multilingue declarada de 33 idiomas ademas del ingles, incluyendo arabe, hebreo, persa, hindi, bengali, urdu, chino, japones, coreano, vietnamita, thai, indonesio, suajili, amharico y tatara, entre otros.
- Deteccion de toxicidad por identidad (identity_attack), relevante para moderacion de discurso de odio.
- Inferencia por lotes a traves de la API pipeline de transformers con top_k=None para obtener todas las etiquetas.
- Ejecucion en CPU y en navegador: los ficheros ONNX cuantizados permiten desplegar el modelo del lado del cliente con transformers.js (dtype "q8").
- Umbral configurable por plataforma: la model card sugiere 0,5 como punto de partida, pero recomienda ajustarlo, especialmente en idiomas distintos del ingles.
- No soporta tool calling ni function calling: es un encoder de clasificacion, no un modelo generativo.
- No soporta razonamiento multi-paso, agentes, generacion de codigo, matematicas ni vision.
- No genera texto: su salida son probabilidades por etiqueta, no explicaciones ni resumenes.
- El modelo esta pensado para comentarios ofensivos, no para peticiones peligrosas a un LLM (armas, autolesion); para ese caso el autor remite a Horizon-Labs/content-safety-guard-small.

## Casos de uso

- Moderacion de comentarios en plataformas multilingues: el modelo puntua cada comentario en siete categorias con una sola pasada de encoder, lo que permite aplicar reglas distintas (por ejemplo, ocultar automaticamente threat por encima de 0,8 y enviar a revision humana insult por encima de 0,5) sin mantener un modelo separado por idioma.
- Cumplimiento normativo en plataformas europeas: para obligaciones de moderacion de contenido bajo la DSA, el modelo aporta trazabilidad por etiqueta y funciona bajo licencia Apache-2.0, lo que evita las restricciones de uso comercial de las licencias OpenRAIL en despliegues corporativos.
- Moderacion en el navegador o en el borde de la red: con onnx/model_quantized.onnx (641 MB) y transformers.js, la clasificacion puede ejecutarse en el cliente, de modo que el texto del usuario no sale del dispositivo, util para aplicaciones de mensajeria o foros con requisitos estrictos de privacidad.
- Pre-filtrado en colas de anotacion humana: el modelo actua como primera etapa para ordenar por probabilidad de toxicidad y reducir el volumen que revisan los moderadores, usando el vector completo de siete etiquetas para priorizar las categorias mas graves.
- Investigacion en ciencias sociales y medios: medicion comparable de toxicidad sobre corpus en 33 idiomas con un unico modelo, en lugar de mezclar clasificadores en ingles con traducciones automaticas que introducen sesgo.
- Deteccion de discurso de odio por identidad: la etiqueta identity_attack permite construir paneles de seguimiento especificos para ataques dirigidos a colectivos, siempre que se calibre el umbral por idioma debido al menor F1 reportado en textos no ingleses.
- Filtro previo en pipelines de datos para entrenamiento de LLM: descartar o etiquetar comentarios toxicos en un corpus multilingue antes de usarlo como datos de preentrenamiento o de ajuste, con coste de computo muy bajo al ser un encoder de 308M.
- Analitica de comunidad en tiempo real: al ser un modelo pequeno, puede desplegarse con ONNX Runtime en CPU junto al backend de la aplicacion para puntuar cada mensaje en el momento de publicacion y alimentar metricas de salud de la comunidad.

## Benchmarks y rendimiento

Los datos proceden de la model card. La evaluacion en Civil Comments usa 20.000 comentarios aleatorios en ingles con etiquetas binarizadas a un umbral de 0,5 y ROC AUC por etiqueta; la media se calcula sobre las seis etiquetas que tienen al menos 20 positivos (severe_toxicity no alcanza ese umbral). La evaluacion TextDetox usa el dataset textdetox/multilingual_toxicity_dataset, con clasificacion binaria toxic/no toxic en 15 idiomas y 1.000 textos equilibrados por idioma.

| Modelo | Licencia | Civil Comments, AUC medio (6 etiquetas) | Civil Comments, AUC toxicidad | TextDetox (15 idiomas), AUC | TextDetox, F1 @ 0,5 | Etiquetas |
|---|---|---|---|---|---|---|
| multilingual-toxicity-base (308M, este modelo) | Apache-2.0 | 0,988 | 0,971 | 0,854 | 0,433 | 7 etiquetas Detoxify, multilingue |
| Horizon-Labs/multilingual-toxicity-small (141M) | Apache-2.0 | 0,988 | 0,972 | 0,835 | 0,547 | 7 etiquetas Detoxify, multilingue |
| unitary/unbiased-toxic-roberta (125M) | Apache-2.0 | 0,985 | 0,969 | 0,588 | 0,086 | 7 etiquetas Detoxify + etiquetas de identidad, ingles |
| unitary/toxic-bert (110M) | Apache-2.0 | 0,946 | 0,926 | 0,623 | 0,142 | 6 etiquetas, ingles |
| s-nlp/roberta_toxicity_classifier (125M) | OpenRAIL++ | 0,975 | 0,975 | 0,642 | 0,092 | binaria, ingles |
| martin-ha/toxic-comment-model (67M) | no indicada | 0,943 | 0,943 | 0,572 | 0,160 | binaria, ingles |
| unitary/multilingual-toxic-xlm-roberta (278M) | Apache-2.0 | 0,961 | 0,961 | 0,678 | 0,352 | 1 etiqueta, multilingue |
| citizenlab/distilbert-base-multilingual-cased-toxicity (135M) | no indicada | 0,843 | 0,843 | 0,698 | 0,277 | binaria, multilingue |
| textdetox/xlmr-large-toxicity-classifier (560M) | OpenRAIL++ | 0,869 | 0,869 | 0,922 | 0,878 | binaria, multilingue; entrenado con datos TextDetox |

Notas de la model card sobre estos resultados:
- Las medias sobre dos semillas de entrenamiento son: small, Civil Comments AUC medio 0,988 / toxicidad 0,972 / TextDetox 0,838; base, 0,988 / 0,972 / 0,855.
- Segun el autor, ningun modelo supera a este en la media de AUC de seis etiquetas de Civil Comments, aunque advierte que los modelos de una sola etiqueta se puntuan sobre esa unica etiqueta, por lo que la columna de toxicidad debe leerse en paralelo.
- roberta_toxicity_classifier supera a este modelo en AUC de toxicidad en Civil Comments, y xlmr-large-toxicity-classifier lo supera en AUC de TextDetox, aunque este ultimo fue entrenado con los datos de ese mismo benchmark.
- Los modelos en ingles se entrenaron con datos Jigsaw/Civil Comments, la misma fuente que el conjunto de prueba.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,23 GB solo de pesos; con activaciones y lotes pequenos, alrededor de 1,5-2 GB.
- VRAM estimada en fp16: aproximadamente 615 MB de pesos; alrededor de 1 GB con margen de trabajo.
- VRAM estimada en int8 (ONNX): el fichero onnx/model_quantized.onnx ocupa 641 MB; es viable con menos de 1 GB de memoria.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (RTX 3050, GTX 1660, T4, L4). Para lotes grandes en produccion, una T4 o L4 ya ofrece margen amplio; no se necesita A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en iGPU gracias a la ruta ONNX/CPU.
- CPU: es la opcion natural para este tamano. El modelo cuantizado a int8 esta pensado para inferencia en CPU y en navegador.
- Despliegue: pipeline de transformers, ONNX Runtime, transformers.js en el navegador y text-embeddings-inference (los metadatos del repositorio incluyen endpoints_compatible y text-embeddings-inference).
- vLLM y llama.cpp: no se documenta soporte en la informacion disponible; ambas herramientas estan orientadas a modelos generativos, no a encoders de clasificacion.
- Latencia y throughput: no disponible en la informacion proporcionada. El autor solo cuantifica la diferencia de precision de la version int8 (0,0008 de media sobre 448 textos respecto a fp32).
- Almacenamiento: el repositorio completo ocupa 3,1 GB por incluir pesos en varios formatos; para desplegar solo hace falta el subconjunto safetensors o el ONNX cuantizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Civil Comments, AUC medio | TextDetox (15 idiomas), AUC | Etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| multilingual-toxicity-base | 308M | no disponible | 0,988 | 0,854 | 7, multilingue | Apache-2.0 | HuggingFace (safetensors + ONNX) |
| multilingual-toxicity-small | 141M | no disponible | 0,988 | 0,835 | 7, multilingue | Apache-2.0 | HuggingFace |
| unitary/unbiased-toxic-roberta | 125M | no disponible | 0,985 | 0,588 | 7 + etiquetas de identidad, solo ingles | Apache-2.0 | HuggingFace |
| unitary/multilingual-toxic-xlm-roberta | 278M | no disponible | 0,961 | 0,678 | 1 (toxic), multilingue | Apache-2.0 | HuggingFace |
| textdetox/xlmr-large-toxicity-classifier | 560M | no disponible | 0,869 | 0,922 | 1 (toxic), multilingue | OpenRAIL++ | HuggingFace |

La comparacion relevante es doble. Frente a los clasificadores en ingles (unbiased-toxic-roberta, toxic-bert), este modelo iguala o mejora ligeramente el AUC en Civil Comments y ademas cubre 33 idiomas con el mismo esquema de etiquetas. Frente a los multilingues binarios (multilingual-toxic-xlm-roberta, citizenlab, xlmr-large), gana en granularidad (siete etiquetas frente a una) y en AUC de TextDetox salvo frente a xlmr-large-toxicity-classifier, que alcanza 0,922 pero fue entrenado con los datos de ese benchmark y usa licencia OpenRAIL++ en lugar de Apache-2.0.

## Limitaciones y advertencias

- Rendimiento desigual por idioma: la propia model card advierte que las puntuaciones en textos no ingleses tienden a ser mas bajas que en ingles. El F1 a 0,5 en TextDetox es de 0,433, muy por debajo del AUC de 0,854, lo que indica que el umbral por defecto no es adecuado para contenido multilingue y hay que recalibrarlo por idioma.
- Umbral dependiente del dominio: el 0,5 recomendado es solo un punto de partida. En produccion conviene ajustarlo con datos propios, sobre todo si el trafico no se parece a Civil Comments.
- Etiqueta severe_toxicity poco fiable: en el conjunto de prueba de Civil Comments no alcanza los 20 positivos al umbral 0,5, por lo que no entra en la media reportada. Su comportamiento en ese extremo no esta validado por los datos publicados.
- Sesgos heredados del corpus: Civil Comments es un dataset en ingles con sesgos conocidos de anotacion y de composicion demografica. Al aumentar el modelo con traducciones, esos sesgos pueden propagarse a otros idiomas, y no se documenta ninguna auditoria de equidad por idioma.
- Riesgo de falsos positivos por traduccion: no se detalla el proceso de traduccion ni su calidad, por lo que parte del comportamiento multilingue depende de datos sinteticos o automaticos no descritos.
- Ambito limitado: clasifica comentarios ofensivos, no peticiones peligrosas a un LLM. El propio autor remite a otro modelo para ese caso, de modo que usarlo como unico guardrail de seguridad seria insuficiente.
- No genera texto ni explicaciones: no puede justificar por que un comentario es toxico, algo que complica la apelacion de decisiones de moderacion.
- Sin datos de contexto: la model card no especifica la longitud maxima de secuencia soportada, lo que impide garantizar el comportamiento en documentos largos o hilos completos.
- Licencia permisiva: Apache-2.0 permite uso comercial sin restricciones adicionales, a diferencia de las alternativas OpenRAIL++ de la comparativa.
- Madurez: el repositorio tiene 0 descargas y 0 likes y fue publicado en octubre de 2026, por lo que no existe aun validacion independiente de los resultados reportados por el autor.
- Contaminacion potencial en la comparativa: los modelos en ingles se entrenaron con Jigsaw/Civil Comments, la misma fuente que el conjunto de prueba de Civil Comments, lo que favorece sus numeros en esa columna; conviene usar TextDetox como referencia mas neutral.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-toxicity-base
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base
- Variante reducida: https://huggingface.co/Horizon-Labs/multilingual-toxicity-small
- Modelo hermano para peticiones daninas a LLM: https://huggingface.co/Horizon-Labs/content-safety-guard-small
- Repositorio Detoxify (origen del esquema de etiquetas): https://github.com/unitaryai/detoxify
- Esquema de etiquetas de referencia: https://huggingface.co/unitary/unbiased-toxic-roberta
- Dataset de entrenamiento Civil Comments: https://huggingface.co/datasets/google/civil_comments
- Dataset de evaluacion multilingue TextDetox: https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset
- Clasificador multilingue de referencia entrenado con TextDetox: https://huggingface.co/textdetox/xlmr-large-toxicity-classifier
- Alternativa multilingue de una sola etiqueta: https://huggingface.co/unitary/multilingual-toxic-xlm-roberta
- Clasificador binario de toxicidad en ingles: https://huggingface.co/s-nlp/roberta_toxicity_classifier
- Clasificador binario pequeno en ingles: https://huggingface.co/martin-ha/toxic-comment-model
- Clasificador binario multilingue de Citizen Lab: https://huggingface.co/citizenlab/distilbert-base-multilingual-cased-toxicity
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js

La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio de HuggingFace.
