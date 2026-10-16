# Daemori/audio_cls_hhd

## Resumen

audio_cls_hhd es un modelo de clasificacion de audio publicado en HuggingFace por el usuario Daemori. Se trata de un ajuste fino (fine-tuning) del modelo Kkonjeong/wav2vec2-base-korean, un wav2vec2 de tamano base preentrenado con audio en coreano, sobre un conjunto de datos que el autor no identifica en la model card. El modelo cuenta con 94.572.174 parametros reales (verificados en los pesos safetensors) y el repositorio ocupa 0,4 GB. La model card esta generada de forma automatica por el Trainer de HuggingFace y no incluye descripcion, usos previstos ni composicion del dataset.

El modelo resuelve una tarea de clasificacion de audio (pipeline `audio-classification`), es decir, asignar una o varias etiquetas a un fragmento de audio. El autor declara una perdida de validacion de 1,1661 y una exactitud (accuracy) de 0,8067 tras 10 epocas de entrenamiento. No se especifican las clases de salida, el numero de etiquetas, el dominio del audio ni el idioma de los datos de entrenamiento.

Su relevancia es limitada y de caracter practico: es un ejemplo tipico de ajuste fino comunitario sobre un backbone wav2vec2, con documentacion minima, cero descargas y cero likes en el momento de la consulta. Resulta util como referencia de reproducibilidad (hiperparametros completos y curva de validacion publicados) y como punto de partida para reentrenar un clasificador de audio sobre audio coreano, pero no debe considerarse un modelo listo para produccion sin una evaluacion previa sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (encoder convolucional de extraccion de caracteristicas + encoder Transformer) |
| Parametros totales | 94.572.174 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en tokens: consume forma de onda en bruto con tramas de 20 ms; longitud maxima de audio no declarada |
| Tipos de cuantizacion | no disponible (solo se publican los pesos originales; no hay GGUF ni versiones cuantizadas) |
| Idiomas soportados | no disponibles (el modelo base esta preentrenado con audio en coreano) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (pipeline) | audio-classification |
| Modelo base | Kkonjeong/wav2vec2-base-korean |
| Metrica declarada | accuracy |
| Tamano del repositorio | 0,4 GB |
| Numero de clases de salida | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es wav2vec 2.0 en su variante base. El modelo recibe la forma de onda en bruto y la procesa con un encoder convolucional de 7 capas (512 canales, anchos de kernel 10, 3, 3, 3, 3, 2, 2 y strides 5, 2, 2, 2, 2, 2, 2), que produce una secuencia de representaciones con un campo receptivo de 25 ms y un paso de 20 ms. Sobre esa secuencia se aplica un encoder Transformer de 12 capas, dimension oculta 768, 12 cabezas de atencion y red feed-forward de 3072, con embedding posicional convolucional (kernel 128, 16 grupos). El preentrenamiento original de wav2vec 2.0 se basa en prediccion contrastiva de tramas enmascaradas sobre representaciones cuantizadas con Gumbel softmax, mas una perdida de diversidad sobre el libro de codigos. El modelo base fue adaptado al coreano por el usuario Kkonjeong; se desconoce el volumen y la composicion de ese corpus.

El ajuste fino publicado anade una cabeza de clasificacion sobre las representaciones del encoder (con reduccion temporal) y se entrena con entropia cruzada. Los hiperparametros declarados son: learning rate 1e-4 con scheduler lineal, batch de entrenamiento 8, batch de evaluacion 8, acumulacion de gradientes 4 (batch efectivo 32), 10 epocas, seed 42, optimizador AdamW (variante `torch_fused`) con betas (0,9, 0,999) y epsilon 1e-08, y precision mixta nativa (AMP). El entrenamiento completo consta de 150 pasos, lo que implica del orden de 15 pasos por epoca y, con un batch efectivo de 32, aproximadamente 480 ejemplos por epoca en el conjunto de entrenamiento; el tamano real del dataset no se declara. La perdida de validacion desciende de forma monotona (2,6117 en la epoca 1 a 1,1661 en la epoca 10), mientras que la exactitud alcanza su maximo en la epoca 9 (0,8235) y baja ligeramente en la epoca 10 (0,8067), sin que se documente parada temprana ni seleccion del mejor checkpoint. No se menciona uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en una tarea discriminativa.

## Capacidades

- Clasificacion de audio: asigna etiquetas a fragmentos de audio mediante una cabeza de clasificacion sobre el encoder wav2vec2. El numero y la semantica de las clases no estan documentados.
- Procesamiento de forma de onda en bruto: no requiere extraccion de caracteristicas acusticas (MFCC, mel-espectrogramas) como paso previo.
- Audio en coreano: hereda del modelo base el preentrenamiento sobre audio coreano, por lo que el rendimiento esperado es mejor en ese idioma que en otros.
- Ajuste fino supervisado: entrena con etiquetas a nivel de clip (clasificacion de utterance completa), no con alineaciones a nivel de fotograma.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo de lenguaje.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), vision, audio generativo ni capacidades multimodales mas alla de la entrada de audio.
- Capacidades multilingues: no declaradas.

## Casos de uso

- Clasificacion de eventos sonoros: el modelo puede etiquetar clips de audio de pocos segundos en categorias acusticas (por ejemplo, entornos urbanos, maquinaria o alarmas), siempre que las clases de salida se verifiquen primero contra un conjunto de validacion propio, dado que no estan documentadas.
- Moderacion de contenido en audio: integrado en un pipeline de subida de archivos, puede actuar como primer filtro para marcar clips que requieran revision humana, con un coste de inferencia bajo (menos de 100 millones de parametros).
- Verificacion de calidad en centros de atencion telefonica: clasificar llamadas o tramos de llamada por tipologia (reclamacion, consulta, cancelacion) tras un reentrenamiento supervisado con las etiquetas del negocio, aprovechando el preentrenamiento en coreano del backbone.
- Deteccion de palabras clave o wake words: como clasificador binario o multiclase sobre ventanas cortas de audio, con la ventaja de operar sobre la senal en bruto y evitar un front-end de caracteristicas.
- Etiquetado automatico de corpus de audio: preanotar grandes colecciones de audio para reducir el trabajo manual de anotacion, aceptando una exactitud de referencia del orden del 80 % que debera revisarse.
- Monitorizacion industrial por sonido: deteccion de anomalias acusticas en maquinaria comparando la distribucion de etiquetas predichas frente a una linea base, con despliegue en GPU de gama media o incluso CPU.
- Filtrado de datasets de entrenamiento para otros modelos: descartar clips mal etiquetados o fuera de dominio antes de alimentar un pipeline de ASR o de sintesis de voz.
- Investigacion en representaciones de audio: servir como punto de partida (baseline) para comparar tecnicas de ajuste fino sobre wav2vec2 en idiomas distintos del ingles.

## Benchmarks y rendimiento

El campo `model-index` de la model card contiene una entrada (`audio_cls_hhd`) con la lista de resultados vacia, por lo que no hay benchmarks estandar publicados (MMLU, HumanEval, GSM8K y similares no aplican a un clasificador de audio). Los unicos datos disponibles son la perdida y la exactitud de validacion declaradas por el autor:

| Epoca | Paso | Perdida de validacion | Accuracy |
|---|---|---|---|
| 1,0 | 15 | 2,6117 | 0,0756 |
| 2,0 | 30 | 2,4606 | 0,2185 |
| 3,0 | 45 | 2,2091 | 0,3109 |
| 4,0 | 60 | 1,9651 | 0,4622 |
| 5,0 | 75 | 1,8113 | 0,4874 |
| 6,0 | 90 | 1,5591 | 0,6218 |
| 7,0 | 105 | 1,3952 | 0,7815 |
| 8,0 | 120 | 1,2866 | 0,7899 |
| 9,0 | 135 | 1,1935 | 0,8235 |
| 10,0 | 150 | 1,1661 | 0,8067 |

Resultado final declarado: perdida de evaluacion 1,1661 y accuracy 0,8067. El tamano del conjunto de evaluacion no se especifica; a modo de referencia estadistica, si ese conjunto tuviera 120 muestras, el intervalo de confianza al 95 % de una accuracy de 0,8067 seria de aproximadamente mas/menos 7 puntos porcentuales, por lo que la cifra debe interpretarse con cautela. No se han publicado comparaciones con otros modelos ni resultados sobre conjuntos publicos como AudioSet, ESC-50 o Speech Commands.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,38 GB en fp32, 0,19 GB en fp16/bf16 y 0,09 GB en int8 (calculado a partir de los 94,57 millones de parametros, sin contar activaciones ni buffers de audio).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4090, T4, A100 o H100 funcionan sin problema; el modelo esta muy lejos de saturar cualquiera de ellas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, e incluso en CPU (la inferencia de un clip corto es viable en CPU con PyTorch).
- Opciones de despliegue: `transformers` (pipeline `audio-classification`), PyTorch en servidor propio, exportacion a ONNX Runtime o TorchScript mediante `optimum`, y despliegue serverless (por ejemplo, HuggingFace Inference Endpoints, dado el tag `endpoints_compatible`). No hay soporte nativo en llama.cpp, Ollama, vLLM ni TGI para este tipo de modelo (los dos ultimos no cubren wav2vec2 de clasificacion de audio).
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones. Con 94,57 millones de parametros, la inferencia esta dominada por el coste del encoder convolucional, que escala linealmente con la duracion del audio.
- Memoria durante el entrenamiento: con batch efectivo 32 y AMP, un ajuste fino completo cabe con holgura en una GPU de 8-12 GB, si bien el autor no indica el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea principal | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Daemori/audio_cls_hhd | 94,57 M | Clasificacion de audio (fine-tune) | Forma de onda en bruto, tramas de 20 ms | no disponible | HuggingFace, 0 descargas |
| facebook/wav2vec2-base (base de la familia) | 94,4 M aprox. | Preentrenamiento auto-supervisado / ASR tras fine-tune | Forma de onda en bruto | Apache-2.0 | HuggingFace, ampliamente utilizado |
| facebook/hubert-base-ls960 | 94,5 M aprox. | ASR y tareas de habla tras fine-tune | Forma de onda en bruto | MIT (verificar en la model card) | HuggingFace, muy extendido |
| microsoft/wavlm-base | 94,7 M aprox. | Habla y tareas de clasificacion de audio | Forma de onda en bruto | MIT (verificar en la model card) | HuggingFace, muy extendido |

Las cifras de parametros de los modelos alternativos son aproximadas y las licencias deben confirmarse en sus respectivas model cards antes de cualquier uso comercial. No se dispone de datos comparativos de rendimiento entre audio_cls_hhd y estas alternativas, ya que las tareas concretas de clasificacion (numero de clases, dominio) de este modelo no estan documentadas.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Hay que contactar con el autor antes de cualquier despliegue en produccion.
- Dataset de entrenamiento desconocido: la model card indica explicitamente "unknown dataset". Esto impide evaluar sesgos, cobertura de dominio y posibles solapamientos entre entrenamiento y evaluacion.
- Clases de salida no documentadas: se desconoce el numero de etiquetas, su nombre y su orden. Es imprescindible inspeccionar `config.json` (campo `id2label`) antes de usar el modelo.
- Riesgo de sobreajuste: el conjunto de entrenamiento parece muy reducido (del orden de 480 ejemplos por epoca, derivado de 150 pasos con batch efectivo 32), y la exactitud de validacion es inestable entre las epocas 9 y 10, sin parada temprana.
- Intervalo de confianza amplio: la accuracy de 0,8067 se calcula sobre un conjunto de validacion de tamano no especificado; con conjuntos pequenos el margen de error es de varios puntos porcentuales.
- Sesgo linguistico: el backbone se preentreno con audio en coreano. El rendimiento en otros idiomas no esta validado y previsiblemente sera inferior.
- Riesgo de alucinacion: no aplica en el sentido generativo (el modelo no produce texto), pero si existe riesgo de clasificaciones erroneas con alta confianza en audio fuera de dominio.
- Sin benchmarks publicos: no hay resultados sobre conjuntos de referencia, lo que impide comparar objetivamente con alternativas.
- Modelo sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta, model card autogenerada y sin revision manual, con fechas de creacion y actualizacion separadas por 24 segundos.
- Artefacto de investigacion: no recomendado como componente critico en produccion sin reentrenamiento y evaluacion sobre datos propios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Daemori/audio_cls_hhd
- Modelo base: https://huggingface.co/Kkonjeong/wav2vec2-base-korean
- Documentacion de wav2vec2 en transformers: https://huggingface.co/docs/transformers/model_doc/wav2vec2
- Articulo original de wav2vec 2.0 (Baevski et al., 2020): https://arxiv.org/abs/2006.11477
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) asociados a este modelo en la informacion disponible.
