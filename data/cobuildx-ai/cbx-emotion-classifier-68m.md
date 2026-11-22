# CobuildX-AI/cbx-emotion-classifier-68M

## Resumen

cbx-emotion-classifier-68M es un clasificador de emociones en ingles desarrollado por CobuildX-AI. Se trata de un fine-tuning del encoder Ettin de 68 millones de parametros (jhu-clsp/ettin-encoder-68m) sobre el conjunto de datos GoEmotions de Google Research, con el objetivo de asignar a un texto corto una o varias de las seis emociones basicas de Ekman mas la categoria `neutral`: `anger`, `disgust`, `fear`, `joy`, `sadness`, `surprise` y `neutral`.

El modelo resuelve un problema de clasificacion multietiqueta: un mismo comentario, publicacion o resena puede expresar varias emociones simultaneamente (por ejemplo, `joy` y `surprise`). Para ello utiliza una salida sigmoide independiente por etiqueta, con umbrales ajustados por etiqueta sobre el conjunto de validacion, en lugar de una unica softmax excluyente. La ventana de contexto es de 128 tokens, suficiente para comentarios y mensajes cortos, que es el dominio para el que fue entrenado.

Su relevancia practica radica en la relacion entre tamano y rendimiento: con 68,1 millones de parametros alcanza un macro F1 de 0,635 en el test de GoEmotions, ligeramente por encima de BERT-base (110M) segun la referencia del paper original (0,64 con umbral fijo de 0,3) y muy por encima de una linea base TF-IDF con regresion logistica (0,571). Al ser un encoder pequeno, es apto para inferencia en CPU con latencias de decenas de milisegundos, lo que lo hace util para procesamiento de texto a gran escala sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, base jhu-clsp/ettin-encoder-68m) |
| Parametros totales | 68.148.231 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (texto superior se trunca) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, fp32; compatible con text-embeddings-inference) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de texto multietiqueta (7 etiquetas) |
| Etiquetas | anger, disgust, fear, joy, sadness, surprise, neutral |
| Tamano del repositorio | 0,3 GB |
| Modelo base | jhu-clsp/ettin-encoder-68m |

## Arquitectura y entrenamiento

El modelo parte del encoder Ettin de 68M, una arquitectura ModernBERT orientada a representaciones de texto eficientes. Sobre esa base se anade una cabeza de clasificacion con una salida sigmoide por etiqueta, lo que permite la asignacion multietiqueta: cada etiqueta recibe una probabilidad independiente y se predice cuando supera su umbral especifico, ajustado sobre el conjunto de validacion para maximizar el macro F1.

El entrenamiento se realizo exclusivamente sobre el split de entrenamiento de GoEmotions (43.410 comentarios de Reddit etiquetados por humanos), mapeando las 27 emociones originales a las 7 etiquetas mediante la agrupacion de Google. No se usaron datos adicionales, etiquetas generadas por LLM ni texto sintetico. Los umbrales se ajustaron por etiqueta sobre el split de validacion (5.426 comentarios). El split de test original (5.427 comentarios) no se uso ni en entrenamiento ni en ninguna decision de diseno. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un encoder de clasificacion.

## Capacidades

- Clasificacion de emociones multietiqueta en ingles sobre textos cortos (comentarios, mensajes, resenas, publicaciones).
- Asignacion de probabilidad independiente por etiqueta, con umbrales ajustados por etiqueta o un umbral unico configurable por el usuario.
- Manejo de textos con multiples emociones simultaneas (por ejemplo, `joy` y `surprise`).
- Deteccion de ausencia de emocion mediante la etiqueta `neutral`, que puede coexistir con otra emocion (como en el 3% de los textos de entrenamiento).
- Procesamiento por lotes: la API acepta una lista de textos y devuelve una lista de resultados.
- Indicacion de truncamiento (`"truncated": True`) cuando el texto supera los 128 tokens.
- Compatibilidad con text-embeddings-inference y endpoints compatibles.
- No soporta tool calling, agentes, vision, audio ni modo de razonamiento: es un clasificador, no un modelo generativo.

## Casos de uso

- Moderacion de comunidades y foros: clasificar comentarios de Reddit u otras plataformas por emocion para detectar toxicidad, frustracion o conflicto y priorizar la revision humana. Su entrenamiento sobre Reddit lo hace especialmente adecuado para este dominio.
- Analisis de sentimiento granular en atencion al cliente: procesar encuestas y transcripciones de soporte para separar `anger` de `sadness` o `fear`, permitiendo enrutar casos urgentes o escalados segun la emocion detectada.
- Monitorizacion de reputacion de marca: analizar en lote resenas y menciones en redes para cuantificar la proporcion de `joy` frente a `disgust` o `anger` a lo largo del tiempo, con la ventaja de que el modelo corre en CPU y abarata el procesamiento masivo.
- Analisis de experiencia de usuario en productos digitales: etiquetar comentarios de feedback y tickets para identificar fricciones emocionales (por ejemplo, `surprise` con `anger` ante un cambio inesperado) y priorizar mejoras.
- Investigacion en ciencias sociales y psicolinguistica: anotar corpus de texto en ingles con las seis emociones de Ekman de forma reproducible y a bajo coste, usando los umbrales ajustados o umbrales propios segun el criterio del estudio.
- Filtrado y enriquecimiento de datasets: preetiquetar grandes volumenes de texto antes de una revision humana, reduciendo el coste de anotacion; el modelo esta pensado para textos cortos, por lo que encaja en pipelines de preprocesado.
- Sistemas de alerta temprana en soporte tecnico: detectar `fear` o `sadness` en mensajes de usuarios para activar respuestas de contencion o derivacion a agentes especializados.

## Benchmarks y rendimiento

Resultados en el test de GoEmotions (5.427 comentarios, 33% neutral, 8% con mas de una etiqueta), con el mapeo de Google a 7 etiquetas:

| Modelo | Macro F1 (umbrales ajustados) | Macro F1 (umbral 0,3) | Macro F1 (6 emociones) | Micro F1 |
|---|---:|---:|---:|---:|
| cbx-emotion-classifier-68M | 0,635 | 0,637 | 0,627 | 0,698 |
| Variante 17M (misma familia) | 0,609 | 0,599 | 0,599 | 0,677 |
| TF-IDF + regresion logistica | 0,571 | 0,499 | 0,559 | 0,645 |

Referencia externa: el paper de GoEmotions (Demszky et al., 2020, Tabla 6) reporta macro F1 de 0,64 para BERT-base (110M) en el mismo test y agrupacion con umbral fijo de 0,3; este modelo obtiene 0,637 en ese mismo regimen.

Rendimiento por etiqueta en el test de GoEmotions:

| Etiqueta | F1 | Precision | Recall | Umbral |
|---|---:|---:|---:|---:|
| anger | 0,55 | 0,55 | 0,55 | 0,42 |
| disgust | 0,50 | 0,63 | 0,41 | 0,41 |
| fear | 0,69 | 0,67 | 0,70 | 0,26 |
| joy | 0,82 | 0,81 | 0,83 | 0,43 |
| sadness | 0,59 | 0,64 | 0,55 | 0,46 |
| surprise | 0,62 | 0,57 | 0,68 | 0,26 |
| neutral | 0,68 | 0,59 | 0,81 | 0,23 |

Con los umbrales ajustados, el 1,0% de los textos del test no recibe ninguna etiqueta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los pesos del modelo (68,1M de parametros, repositorio de 0,3 GB); en fp16 aproximadamente 0,14 GB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de memoria libre es suficiente; el modelo no requiere A100 ni H100. Una RTX 4090 o similar queda sobredimensionada para esta tarea.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 3060, RTX 4060, etc.) e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU viable: el autor reporta unos 11 ms por texto corto (13 tokens) y unos 31 ms para un texto completo de 128 tokens en CPU de 8 hilos en fp32.
- Opciones de despliegue: transformers, text-embeddings-inference (tag del repositorio), endpoints compatibles; el autor incluye un wrapper propio (`cbx_emotion.EmotionClassifier`) y un `example.py`. No se documenta soporte explicito de vLLM, llama.cpp ni Ollama para este modelo.
- Throughput: no se publica una cifra agregada de throughput; a partir de la latencia por texto en CPU (11-31 ms) se puede estimar un orden de decenas de textos por segundo por hilo en CPU, sin datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro F1 (GoEmotions test) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| cbx-emotion-classifier-68M | 68,1M | 128 tokens | 0,635 | Apache-2.0 | Hugging Face |
| Variante 17M (misma familia) | 17M (aprox.) | no disponible | 0,609 | no disponible | Hugging Face (misma familia) |
| BERT-base (referencia del paper GoEmotions) | 110M | 512 tokens (BERT estandar) | 0,64 (umbral 0,3) | Apache-2.0 (BERT) | Hugging Face |
| TF-IDF + regresion logistica | no aplica | no aplica | 0,571 | no disponible | linea base local |

El modelo ofrece un rendimiento cercano a BERT-base con un 38% menos de parametros y una latencia en CPU muy inferior, a costa de una ventana de contexto de solo 128 tokens. Frente a la variante de 17M de la misma familia, gana 0,026 puntos de macro F1 con cuatro veces mas parametros.

## Limitaciones y advertencias

- Las etiquetas de GoEmotions son ruidosas: los anotadores discreparon con frecuencia y muchos textos admiten juicio. La mayoria de errores se producen entre una emocion y `neutral`.
- El modelo solo soporta ingles; no se ha entrenado ni evaluado en otros idiomas.
- Ventana de contexto limitada a 128 tokens: textos mas largos se truncan y se marca `"truncated": True`, lo que puede perder informacion emocional relevante.
- Entrenado sobre comentarios de Reddit: el dominio de aplicacion ideal son textos cortos e informales; el rendimiento en generos formales o tecnicos no esta documentado.
- Riesgo de alucinacion no aplica en sentido generativo (no genera texto), pero si hay riesgo de falsos positivos y negativos en la clasificacion, especialmente en etiquetas con F1 bajo como `disgust` (0,50) y `anger` (0,55).
- La etiqueta `joy` agrupa un conjunto amplio de emociones positivas (aprobacion, gratitud, amor, optimismo, etc.), por lo que su semantica es mas gruesa que la de las emociones negativas.
- El 1,0% de los textos puede quedar sin etiqueta con los umbrales ajustados; en produccion conviene gestionar el caso de lista vacia.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite a la seccion "Intended use and disclaimer" de la model card, que no se incluye completa en la informacion disponible; conviene revisarla antes de desplegar.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado en noviembre de 2026, por lo que carece de validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CobuildX-AI/cbx-emotion-classifier-68M
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Paper GoEmotions (Demszky et al., ACL 2020): https://arxiv.org/abs/2005.00547 (referencia citada en la model card)
