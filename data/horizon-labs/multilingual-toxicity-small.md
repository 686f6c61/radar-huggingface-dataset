# Horizon-Labs/multilingual-toxicity-small

## Resumen

Multilingual Toxicity (small) es un clasificador multietiqueta de comentarios toxicos desarrollado por Horizon-Labs. Se construye sobre el encoder multilingue jhu-clsp/mmBERT-small (arquitectura ModernBERT) y reproduce las siete etiquetas de Detoxify / unitary/unbiased-toxic-roberta: toxicity, severe_toxicity, obscene, threat, insult, identity_attack y sexual_explicit. Con 140.644.231 parametros, esta pensado como sustituto directo ("drop-in") de Detoxify en plataformas de moderacion que operan en mas de un idioma.

El problema que resuelve es concreto: la mayoria de los clasicos de toxicidad estan entrenados solo en ingles (unbiased-toxic-roberta, toxic-bert, roberta_toxicity_classifier) y pierden eficacia al aplicarse a otros idiomas. Este modelo se entrena sobre Civil Comments (CC0) mas traducciones, y declara soporte para 33 idiomas, con licencia Apache-2.0, lo que elimina la friccion legal de las licencias OpenRAIL++ usadas por varios competidores.

Su relevancia practica viene del formato de despliegue: el repositorio incluye pesos safetensors y ficheros ONNX, incluido un modelo cuantizado en int8 de 268 MB apto para CPU y para el navegador mediante transformers.js. Para peticiones daninas dirigidas a un LLM (armas, autolesion) el propio autor remite a un modelo distinto, content-safety-guard-small.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base jhu-clsp/mmBERT-small) |
| Parametros totales | 140.644.231 (141M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | int8 (onnx/model_quantized.onnx, 268 MB; desviacion media de 0,0009 frente a fp32 sobre 448 textos de prueba), fp32 en safetensors y q8 en transformers.js |
| Idiomas soportados | 33 codigos declarados: en, de, fr, es, pt, it, nl, pl, ru, uk, cs, ro, sv, da, fi, hu, el, tr, ar, he, fa, hi, bn, ur, zh, ja, ko, vi, th, id, sw, am, tt (etiqueta "multilingual") |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX (incluye variante cuantizada int8) |
| Tarea | text-classification, clasificacion multietiqueta (sigmoide independiente por etiqueta) |
| Etiquetas | toxicity, severe_toxicity, obscene, threat, insult, identity_attack, sexual_explicit |
| Modelo base | jhu-clsp/mmBERT-small |
| Dataset de entrenamiento | google/civil_comments (CC0) mas traducciones |
| Tamano del repositorio | 1,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo ModernBERT, heredado de mmBERT-small, con una cabeza de clasificacion multietiqueta. Cada una de las siete etiquetas recibe una probabilidad independiente calculada con sigmoide, siguiendo el esquema de Detoxify, en lugar de una softmax sobre clases mutuamente excluyentes. Esto permite que un mismo comentario active simultaneamente insult, obscene y toxicity.

El entrenamiento parte de Civil Comments (licencia CC0) en ingles, complementado con traducciones para cubrir el resto de idiomas. La model card indica que los conjuntos de evaluacion se usaron solo para evaluar y que se eliminaron los textos de entrenamiento que aparecian tambien en ellos, lo que reduce el riesgo de contaminacion entre train y test. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del corpus traducido ni si hubo etapas de RLHF o DPO; al tratarse de un clasificador encoder, lo esperable es un ajuste supervisado con entropia cruzada binaria por etiqueta, pero ese detalle no aparece documentado. La model card si reporta medias sobre dos semillas de entrenamiento: en small, AUC media en Civil Comments de 0,988, AUC de toxicity de 0,972 y AUC en TextDetox de 0,838.

## Capacidades

- Clasificacion multietiqueta de toxicidad en texto con siete categorias independientes, con umbral de decision configurable por el usuario.
- Moderacion multilingue: cubre 33 idiomas declarados, incluidos aleman, frances, espanol, portugues, italiano, neerlandes, polaco, ruso, ucraniano, checo, rumano, sueco, danes, finlandes, hungaro, griego, turco, arabe, hebreo, persa, hindi, bengali, urdu, chino, japones, coreano, vietnamita, tailandes, indonesio, suajili, amharico y tatar.
- Inferencia en CPU y en navegador gracias a los ficheros ONNX y al soporte de transformers.js con dtype q8.
- Compatibilidad con la API de pipeline de transformers (text-classification con top_k=None) y con despliegues tipo text-embeddings-inference / endpoints compatibles, segun los tags del repositorio.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso.
- No dispone de capacidades de vision ni de audio.
- Capacidad especial: sustituto directo de los modelos Detoxify manteniendo los mismos nombres de etiqueta, lo que simplifica la migracion de umbrales y dashboards existentes.

## Casos de uso

- Moderacion de comentarios en plataformas multilingues: el modelo puntua cada comentario entrante con siete probabilidades y permite aplicar una regla como toxicity >= 0,5 para encolar contenido en revision humana. Al compartir etiquetas con Detoxify, se puede sustituir el clasificador anterior sin reescribir la logica de negocio.
- Filtrado previo a un LLM en produccion: actuar como primera barrera de bajo coste que descarta o marca entradas toxicas antes de enviarlas al modelo generativo, reduciendo el gasto en tokens y el riesgo de respuestas que amplifiquen el insulto.
- Moderacion en el navegador con transformers.js: al existir ONNX int8 de 268 MB, la clasificacion puede ejecutarse en el cliente y evitar enviar el texto del usuario al servidor, lo que ayuda con requisitos de privacidad y reduce latencia de red.
- Analisis retrospectivo de comunidades: procesar en lote un historico de comentarios para medir la prevalencia de identity_attack o threat por idioma y por periodo, y decidir donde reforzar la moderacion.
- Enrutado de tickets de soporte: detectar automaticamente mensajes con insult o threat en un sistema de atencion al cliente y dirigirlos a un equipo especializado antes de que un agente los lea.
- Investigacion en deteccion de discurso toxico multilingue: usar el checkpoint como linea base reproducible en 15 idiomas sobre TextDetox, o como punto de partida para fine-tuning en dominios especificos con licencia Apache-2.0.
- Monitorizacion de comunidades de videojuegos o chat en vivo donde el contenido llega en varios idiomas a la vez y se necesita una unica tuberia de inferencia en lugar de un modelo por lengua.
- Etiquetado asistido para construir datasets: puntuar grandes volumenes de texto y seleccionar los positivos de mayor confianza para revision humana, acelerando la anotacion.

## Benchmarks y rendimiento

Los datos siguientes proceden de la model card. Los conjuntos de evaluacion se usaron solo para evaluar y se eliminaron del entrenamiento los textos coincidentes. La evaluacion en Civil Comments usa 20.000 comentarios aleatorios en ingles con AUC ROC por etiqueta binarizada a >= 0,5; la media se calcula sobre las 6 etiquetas con al menos 20 positivos (severe_toxicity no tiene ninguno en ese umbral). TextDetox usa 1.000 textos equilibrados por idioma en 15 lenguas, con AUC sobre la probabilidad de toxicity y F1 a 0,5.

| Modelo | Licencia | Civil Comments, AUC media (6 etiquetas) | Civil Comments, AUC toxicity | TextDetox (15 idiomas), AUC | TextDetox, F1 @ 0,5 | Etiquetas |
|---|---|---|---|---|---|---|
| Este modelo (141M) | Apache-2.0 | 0,988 | 0,972 | 0,835 | 0,547 | 7 etiquetas Detoxify, multilingue |
| Horizon-Labs/multilingual-toxicity-base (308M) | Apache-2.0 | 0,988 | 0,971 | 0,854 | 0,433 | 7 etiquetas Detoxify, multilingue |
| unitary/unbiased-toxic-roberta (125M) | Apache-2.0 | 0,985 | 0,969 | 0,588 | 0,086 | 7 etiquetas Detoxify (+ identity), ingles |
| unitary/toxic-bert (110M) | Apache-2.0 | 0,946 | 0,926 | 0,623 | 0,142 | 6 etiquetas, ingles |
| s-nlp/roberta_toxicity_classifier (125M) | OpenRAIL++ | 0,975 | 0,975 | 0,642 | 0,092 | binaria, ingles |
| martin-ha/toxic-comment-model (67M) | no indicada | 0,943 | 0,943 | 0,572 | 0,160 | binaria, ingles |
| unitary/multilingual-toxic-xlm-roberta (278M) | Apache-2.0 | 0,961 | 0,961 | 0,678 | 0,352 | 1 etiqueta, multilingue |
| citizenlab/distilbert-base-multilingual-cased-toxicity (135M) | no indicada | 0,843 | 0,843 | 0,698 | 0,277 | binaria, multilingue |
| textdetox/xlmr-large-toxicity-classifier (560M) | OpenRAIL++ | 0,869 | 0,869 | 0,922 | 0,878 | binaria, multilingue; entrenada con datos TextDetox |

Medias sobre dos semillas de entrenamiento segun la model card: en small, Civil Comments AUC media 0,988, toxicity 0,972 y TextDetox 0,838; en base, 0,988 / 0,972 / 0,855. El modelo por delante en AUC de toxicity en Civil Comments es roberta_toxicity_classifier (0,975), mientras que en TextDetox AUC lidera xlmr-large-toxicity-classifier (0,922), aunque esta ultima fue entrenada con los datos de TextDetox. El desglose por etiqueta en Civil Comments aparece truncado en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,6 GB en fp32 (141M parametros), unos 0,3 GB en fp16 y unos 0,27 GB para el fichero ONNX int8 de 268 MB. El repositorio completo ocupa 1,4 GB.
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 o incluso iGPU recientes; tambien funciona en CPU sin GPU dedicada.
- Despliegue recomendado: pipeline de transformers, ONNX Runtime, transformers.js en el navegador y entornos compatibles con text-embeddings-inference / endpoints compatibles, segun los tags del repositorio.
- No se mencionan pesos en formato GGUF, por lo que no hay soporte documentado para llama.cpp u Ollama.
- Para lotes grandes en servidor, GPU tipo T4, L4, A10 o A100 permiten tasas de procesamiento muy altas dado el tamano del encoder, pero la informacion proporcionada no incluye cifras de latencia ni de throughput medidos.
- El modelo base de 308M (Horizon-Labs/multilingual-toxicity-base) es la alternativa si se necesita mas precision, a costa de duplicar aproximadamente el consumo de memoria y de tiempo de inferencia.

## Comparativa con modelos similares

| Criterio | multilingual-toxicity-small | multilingual-toxicity-base | unbiased-toxic-roberta | xlmr-large-toxicity-classifier |
|---|---|---|---|---|
| Parametros | 141M | 308M | 125M | 560M |
| Etiquetas | 7 (Detoxify) | 7 (Detoxify) | 7 (+ identity), ingles | 1, binaria |
| Idiomas | 33 declarados | multilingue | ingles | multilingue (15 en TextDetox) |
| Civil Comments AUC media | 0,988 | 0,988 | 0,985 | 0,869 |
| Civil Comments AUC toxicity | 0,972 | 0,971 | 0,969 | 0,869 |
| TextDetox AUC | 0,835 | 0,854 | 0,588 | 0,922 |
| TextDetox F1 @ 0,5 | 0,547 | 0,433 | 0,086 | 0,878 |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 | OpenRAIL++ |
| Formato | safetensors, ONNX (int8) | no disponible en la informacion | safetensors | no disponible en la informacion |

Frente a los clasificadores de toxicidad en ingles, la ventaja no esta en el AUC sobre Civil Comments, donde las diferencias son de centesimas, sino en el salto de TextDetox (0,835 frente a 0,588 de unbiased-toxic-roberta y 0,642 de roberta_toxicity_classifier) y en la licencia Apache-2.0. Frente a xlmr-large-toxicity-classifier, que gana claramente en TextDetox, hay que tener en cuenta que ese modelo fue entrenado con los propios datos de TextDetox y su licencia es OpenRAIL++, mas restrictiva para uso comercial.

## Limitaciones y advertencias

- Las puntuaciones en textos no ingleses tienden a ser mas bajas que en ingles, como refleja el F1 @ 0,5 de 0,547 en TextDetox. El propio autor recomienda calibrar un umbral mas bajo para contenido multilingue y validarlo con datos propios.
- Los umbrales publicados no son universales: la eleccion de toxicity >= 0,5 es solo una sugerencia y depende del equilibrio entre falsos positivos y falsos negativos que tolere cada plataforma.
- Riesgo de sesgo: el entrenamiento parte de Civil Comments, un corpus en ingles con sesgos conocidos de anotacion, y las traducciones anaden posibles sesgos de traduccion automatica. No se documenta ninguna auditoria de sesgo por subgrupo demografico en la informacion disponible.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea (falsos positivos sobre ironia, citas, discurso academico o lenguaje recuperado) y de falsos negativos sobre formas de toxicidad no representadas en el corpus.
- Dominio limitado: el modelo esta disenado para comentarios toxicos. Para peticiones daninas a un LLM (armas, autolesion), el autor remite explicitamente a content-safety-guard-small, no a este checkpoint.
- Cobertura de identidad: la etiqueta identity_attack sigue el esquema Detoxify original; no se incluyen las etiquetas de identidad adicionales presentes en unbiased-toxic-roberta.
- Cobertura idiomatica desigual: la evaluacion multilingue publica cubre 15 idiomas, frente a los 33 declarados, por lo que el rendimiento en los idiomas no evaluados no esta cuantificado.
- Licencia Apache-2.0, sin restricciones de uso comercial documentadas. Conviene verificar, no obstante, la licencia del modelo base jhu-clsp/mmBERT-small y de los datos de entrenamiento.
- Modelo muy reciente y con cero descargas y cero likes en el momento de la consulta: la comunidad no ha validado aun su comportamiento fuera de los benchmarks del autor.
- El fichero ONNX int8 introduce una desviacion media de 0,0009 en las probabilidades respecto a fp32 sobre 448 textos de prueba, lo que puede alterar clasificaciones cercanas al umbral.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Horizon-Labs/multilingual-toxicity-small
- Version de 308M: https://huggingface.co/Horizon-Labs/multilingual-toxicity-base
- Modelo complementario para peticiones daninas: https://huggingface.co/Horizon-Labs/content-safety-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Detoxify (repositorio): https://github.com/unitaryai/detoxify
- Esquema de etiquetas de referencia: https://huggingface.co/unitary/unbiased-toxic-roberta
- Dataset de entrenamiento: https://huggingface.co/datasets/google/civil_comments
- Dataset de evaluacion multilingue: https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset
- Clasificador de referencia en TextDetox: https://huggingface.co/textdetox/xlmr-large-toxicity-classifier
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
