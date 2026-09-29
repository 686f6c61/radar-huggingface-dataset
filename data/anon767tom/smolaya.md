# anon767tom/smolaya

## Resumen

smolaya es un modelo de clasificacion y decision tipada publicado por el usuario anon767tom en HuggingFace. Se trata de una variante reducida de convaiinnovations/laya, un modelo de decision no autorregresivo: en lugar de generar texto, recibe un documento y un conjunto de opciones etiquetadas y devuelve, en una sola pasada forward, una probabilidad para cada opcion. La arquitectura es un encoder ModernBERT-large truncado a sus primeras 20 de 28 capas, con 323.235.590 parametros (frente a los 421M de laya), el mismo tokenizador, la misma cabeza de decision y el mismo formato de entrada que el modelo base.

El problema que resuelve es el de la clasificacion y seleccion de opciones en entornos con restricciones de latencia y coste, especialmente en CPU. Segun la model card, supera a laya en las cinco tareas evaluadas (pooled 0.839 frente a 0.812) y es aproximadamente 2,8 veces mas rapido en CPU con cuantizacion int8 (0,26 s por item frente a 0,71 s). Ademas, mejora notablemente la calibracion: el ECE top-1 baja de 0,261 a 0,047.

Es relevante ahora porque demuestra que un modelo de decision de 323M puede ejecutarse en hardware modesto (el autor mide sobre un AMD Ryzen 3 4300U de 4 nucleos) manteniendo precision competitiva en tareas como analisis de sentimiento, inferencia de lenguaje natural, QA de opcion multiple y clasificacion de intenciones. El repositorio tiene 0 descargas y 0 likes, por lo que carece por completo de validacion externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT-large truncado a 20 de 28 capas, con cabeza de decision tipada (decision engine no autorregresivo) |
| Parametros totales | 323.235.590 (323M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 384 tokens (longitud maxima empleada en el entrenamiento); no se documenta otro limite de inferencia |
| Tipos de cuantizacion | Pesos originales en fp32/fp16; int8 dinamico per-channel de PyTorch sobre attn.Wqkv, attn.Wo y mlp.Wi (mlp.Wo se mantiene en fp32) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tarea declarada (pipeline) | text-classification |
| Modelo base | convaiinnovations/laya |
| Tamano del repositorio | 0,6 GB |
| Libreria de carga | paquete `laya` (probado con laya==0.3.20) y torch |

## Arquitectura y entrenamiento

smolaya reutiliza la arquitectura de laya: un encoder ModernBERT-large (desarrollado por Answer.AI) al que se recorta el numero de capas, conservando las capas 0 a 19 de 28. El modelo conserva el tokenizador, la cabeza de decision tipada y el formato de entrada del modelo original, de modo que es un reemplazo directo ("drop-in") que se carga con `laya.load("anon767tom/smolaya")`. La cabeza `act_head` (decision de actuar o escalar) se hereda sin cambios de laya y no fue reentrenada.

El ajuste fino se realizo sobre aproximadamente 201.000 ejemplos procedentes de SST-2, BoolQ, MNLI, SNLI, Yelp Polarity, ANLI, QNLI, CLINC150 (como listas de 8 intenciones), TweetEval offensive y hate, jailbreak-classification, SciQ, OpenBookQA, QASC y CommonsenseQA, usando unicamente los splits de entrenamiento y convirtiendo cada ejemplo al formato `choice` de laya. ARC y AG News se excluyeron del conjunto de entrenamiento y se eliminaron los duplicados exactos de preguntas de ARC. La funcion de perdida combina 0,5 x entropia cruzada sobre la etiqueta gold y 0,5 x divergencia KL hacia la distribucion de respuestas de laya, promediada sobre todos los desplazamientos ciclicos del orden de opciones, con permutacion aleatoria de las opciones en cada ejemplo. La optimizacion uso AdamW (weight decay 0,01), learning rate 2e-5 en el encoder y 5e-5 en la cabeza, 200 pasos de warmup con decaimiento lineal, batch de 16, longitud maxima de 384 tokens, 6.412 pasos (unos 103.000 ejemplos vistos) y precision mixta fp16 sobre una unica GPU T4.

La cuantizacion int8 se aplica con el script `quantize_int8.py`, que usa cuantizacion dinamica per-channel de PyTorch sobre las proyecciones del encoder. Las proyecciones `mlp.Wo` se dejan en fp32 deliberadamente: sus entradas presentan valores atipicos de activacion que las escalas per-tensor no pueden representar, y cuantizarlas cuesta varios puntos de precision.

## Capacidades

- Clasificacion de texto zero-shot y multiple-choice: dada una pregunta sobre un texto y un conjunto de opciones, devuelve una probabilidad por opcion en una unica pasada forward.
- Analisis de sentimiento binario y de polaridad (SST-2, Yelp Polarity).
- Inferencia de lenguaje natural: implicacion, contradiccion y neutralidad (MNLI, SNLI, ANLI, QNLI).
- Preguntas de comprension lectora de respuesta si/no (BoolQ).
- Preguntas de conocimiento y sentido comun de opcion multiple (SciQ, OpenBookQA, QASC, CommonsenseQA).
- Clasificacion de intenciones en listas cortas de 8 clases (formatos tipo CLINC150).
- Moderacion de contenido: deteccion de lenguaje ofensivo y de odio (TweetEval) y clasificacion de intentos de jailbreak.
- Cabeza de decision actuar/escalar (`act_head`) heredada de laya, no reentrenada.
- No dispone de generacion de texto libre, tool calling, function calling, razonamiento multi-paso como agente, vision, audio ni modo de razonamiento explicito.
- Soporte multilingue: no disponible; solo ingles.

## Casos de uso

- Moderacion de contenido en produccion: el modelo clasifica comentarios como ofensivos o no ofensivos en una sola pasada forward y con un ECE de 0,047, lo que permite fijar umbrales de confianza fiables y derivar a revision humana solo los casos dudosos.
- Enrutado de intenciones en asistentes conversacionales: con listas cortas de intenciones (formato CLINC150 de 8 clases) puede decidir la intencion del usuario y activar la habilidad correspondiente; su cabeza actuar/escalar permite decidir cuando derivar a un humano.
- Analisis de sentimiento sobre resenas y tickets de soporte: con 0,942 de exactitud en SST-2 y buena calibracion, es adecuado para etiquetado automatico masivo de feedback de clientes en lotes.
- Deteccion de intentos de jailbreak y prompt injection: la tarea de jailbreak-classification esta en su mezcla de entrenamiento, por lo que puede usarse como filtro previo a un LLM generativo en una arquitectura de guardarrailes.
- Clasificacion de relaciones textuales para busqueda y deduplicacion: mediante NLI (0,892 en MNLI) puede determinar si dos fragmentos se implican, se contradicen o son neutros, util para agrupar documentos o validar respuestas.
- Precribado de preguntas de opcion multiple en plataformas educativas: dada una pregunta y sus opciones, asigna probabilidades que permiten estimar la dificultad del item o detectar opciones mal formuladas, con la advertencia de que en tareas de conocimiento intensivo su exactitud baja a 0,602 (ARC).
- Despliegue en entornos sin GPU: al ejecutarse en CPU a 0,26 s por item en int8 sobre un Ryzen 3 4300U de 4 nucleos, encaja en dispositivos de borde, portatiles y contenedores sin acelerador.
- Anotacion automatica de corpus para entrenamiento: puede preetiquetar grandes volumenes de texto en tareas de sentimiento, NLI o intenciones, reduciendo el coste de anotacion humana antes de una revision posterior.

## Benchmarks y rendimiento

Evaluacion del autor sobre 12.398 items de cinco tareas publicas, con cada conjunto de opciones en su orden original y una pasada forward por item. Los valores de AG News y BoolQ usan items reservados, pero ambos conjuntos forman parte de la mezcla de entrenamiento original de laya.

| Tarea | n | laya | smolaya | smolaya int8 (CPU) |
|---|---|---|---|---|
| SST-2 | 832 | 0,918 | 0,942 | 0,939 |
| ARC | 2.336 | 0,511 | 0,602 | 0,596 |
| BoolQ | 3.230 | 0,835 | 0,851 | 0,849 |
| MNLI | 3.000 | 0,883 | 0,892 | 0,891 |
| AG News | 3.000 | 0,923 | 0,929 | 0,924 |
| Pooled | 12.398 | 0,812 | 0,839 | 0,836 |

Diferencias declaradas: pooled frente a laya +2,7 pt (IC 95% +2,2 a +3,2) en fp y +2,3 pt (+1,8 a +2,8) en int8, con bootstrap pareado sobre items. int8 frente a fp: -0,4 pt (-0,6 a -0,1).

Velocidad en CPU (batch 1, 4 hilos, AMD Ryzen 3 4300U de 4 nucleos, segundos medios por item):

| Modelo | SST-2 | ARC | BoolQ | MNLI | AG News | Media |
|---|---|---|---|---|---|---|
| laya (fp32) | 0,44 | 0,57 | 1,16 | 0,71 | 0,70 | 0,71 |
| smolaya int8 | 0,14 | 0,19 | 0,45 | 0,26 | 0,25 | 0,26 |

Calibracion (ECE top-1, 15 bins, sobre los mismos 12.398 items, softmax crudo sobre los logits de opcion):

| Modelo | Exactitud | Confianza media | ECE |
|---|---|---|---|
| laya (logits crudos) | 0,812 | 0,553 | 0,261 |
| smolaya | 0,839 | 0,878 | 0,047 |

## Requisitos de hardware

- VRAM estimada para inferencia (valores calculados a partir del numero de parametros, no publicados por el autor): aproximadamente 1,3 GB en fp32, 0,65 GB en fp16 y 0,32 GB en int8 solo para pesos, mas el coste de activaciones con secuencias de hasta 384 tokens.
- Cabe sobradamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090 o similares, con uso de memoria muy por debajo de sus limites.
- No requiere GPU: el autor reporta el rendimiento sobre una CPU AMD Ryzen 3 4300U de 4 nucleos con 4 hilos, lo que lo hace apto para portatiles, mini-PC y dispositivos de borde.
- GPU de entrenamiento de referencia: una unica NVIDIA T4, en precision mixta fp16.
- Opciones de despliegue: el paquete oficial `laya` (pip install laya==0.3.20) mas PyTorch, en CPU o GPU. El script `quantize_int8.py` permite aplicar la cuantizacion int8 dinamica para CPU.
- No hay soporte documentado para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, ya que no es un modelo generativo autorregresivo con pesos compatibles con esos runners.
- Latencia medida en CPU int8, batch 1 y 4 hilos: entre 0,14 s por item (SST-2) y 0,45 s por item (BoolQ), con una media de 0,26 s. En GPU no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Exactitud pooled en las 5 tareas | Velocidad CPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| smolaya | 323M | Encoder ModernBERT truncado a 20 capas + cabeza de decision | 0,839 | 0,26 s/item (int8) | Apache-2.0 | HuggingFace (0 descargas) |
| convaiinnovations/laya | 421M | Encoder ModernBERT-large completo + cabeza de decision | 0,812 | 0,71 s/item (fp32) | Apache-2.0 (segun la model card de smolaya) | HuggingFace |
| ModernBERT-large (Answer.AI) | No disponible en la informacion proporcionada | Encoder | No disponible | No disponible | No disponible en la informacion proporcionada | HuggingFace |

No se dispone de datos de benchmarks comparables con otros modelos de clasificacion en la informacion proporcionada, mas alla de la comparacion directa con laya que realiza el autor.

## Limitaciones y advertencias

- Solo ingles. La variante multilingue de laya no fue modificada ni incluida.
- El conocimiento factual y el razonamiento de opcion multiple son debiles: 0,602 de exactitud en ARC.
- Sensibilidad al orden de las opciones: invertir las opciones cambia la respuesta en aproximadamente el 22% de los items de ARC (en laya era el 34%). El modelo mitiga el problema, pero no lo elimina.
- Sobreconfianza en preguntas de comprension lectora de si/no: en BoolQ la confianza media es 0,97 frente a una exactitud de 0,85. Por este motivo el `rl_agent_config.json` incluido fija todas las temperaturas a 1,0; las temperaturas ajustadas por tipo de laya no son aplicables.
- Riesgo de contaminacion en la evaluacion: AG News y BoolQ forman parte de la mezcla de entrenamiento original de laya, por lo que los resultados en esas tareas pueden estar inflados. ARC no estaba en los datos de ajuste y se eliminaron duplicados exactos de preguntas, pero el modelo base pudo haber visto datos similares.
- La evaluacion se limita a benchmarks publicos; el propio autor recomienda validar en la tarea propia antes de confiar en el modelo.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni razonamiento multi-paso como agente, y no puede usarse como sustituto de un LLM conversacional.
- El modelo no tiene descargas ni likes y procede de un autor anonimo, sin publicacion ni revision por pares. No hay validacion independiente de las cifras reportadas.
- Los conjuntos de datos de ajuste fino conservan sus propias licencias, que pueden imponer condiciones adicionales al uso comercial aunque los pesos sean Apache-2.0.
- La licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y la atribucion a convaiinnovations/laya y a Answer.AI (encoder ModernBERT-large).
- La cuantizacion int8 pierde 0,4 pt de exactitud pooled respecto a fp, con un intervalo de confianza que no incluye el cero.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/anon767tom/smolaya
- Modelo base convaiinnovations/laya: https://huggingface.co/convaiinnovations/laya
- Los resultados de busqueda web disponibles no contienen ningun enlace relevante al modelo, a su paper ni a su repositorio; el resto de enlaces (paper, blog, repositorio, demo) no esta disponible en la informacion proporcionada.
