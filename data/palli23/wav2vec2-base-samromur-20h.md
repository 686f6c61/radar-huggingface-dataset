# palli23/wav2vec2-base-samromur-20h

## Resumen

wav2vec2-base-samromur-20h es un modelo de reconocimiento automático del habla (ASR) en islandés publicado por el usuario palli23 en HuggingFace. Se trata de un ajuste fino de wav2vec2-base (94.402.472 parámetros) sobre un subconjunto anidado de 20 horas del corpus samromur-500h, identificado en la model card como "Miljón/samromur-500h scaling pool". El modelo forma parte de un conjunto de checkpoints de escalado asociados al trabajo "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), cuyo objetivo es medir cómo rinde un modelo pequeño específico de idioma frente a sistemas ASR multilingües de gran tamaño.

La relevancia del modelo es doble. Por un lado, es un punto de datos dentro de un estudio de escalado: permite comparar el efecto del volumen de datos de entrenamiento (20 h frente a 500 h) sobre el WER/CER en islandés. Por otro, ilustra una vía práctica para lenguas de recursos limitados: en lugar de desplegar un modelo multilingüe de más de mil millones de parámetros, se ajusta un encoder de 94 M parámetros con datos específicos del idioma, con un coste de inferencia muy inferior y posible ejecución en CPU.

El modelo no incluye pipeline declarado en la ficha de HuggingFace, no publica métricas en su model card y remite al paper para los resultados de WER/CER. La información disponible es escasa: se conocen la arquitectura base, el tamaño, el idioma, la licencia y el origen del corpus de ajuste, pero no los hiperparámetros de entrenamiento, la composición exacta del subconjunto ni los resultados numéricos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2-base (encoder convolucional de extraccion de caracteristicas + encoder transformer de 12 capas; ajuste fino con cabecera CTC para ASR) |
| Parametros totales | 94.402.472 (94 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; wav2vec2-base no define una ventana de contexto textual. En la practica se procesa audio por segmentos (tipicamente decenas de segundos), pero la model card no especifica un limite |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors y no se documentan variantes cuantizadas (INT8, GGUF, ONNX) |
| Idiomas soportados | islandes (is) |
| Licencia | cc-by-sa-4.0 (Creative Commons Attribution-ShareAlike 4.0) |
| Formato de pesos | safetensors (tamano del repositorio: 61,6 GB) |
| Pipeline declarado | no disponible (la model card y el nombre indican ASR, pero no hay tag de pipeline) |
| Corpus de ajuste | subconjunto anidado de 20 h del pool de escalado "Miljón/samromur-500h" |
| Descargas / likes | 19 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de wav2vec2-base: un encoder convolucional que transforma la forma de onda cruda en representaciones latentes cada 20 ms, seguido de un transformer de 12 capas con 768 dimensiones de modelo. El preentrenamiento original de wav2vec2 es auto-supervisado (prediccion de unidades discretizadas enmascaradas sobre audio sin etiquetar) y el ajuste fino para ASR se realiza con una cabecera lineal y funcion de perdida CTC sobre el vocabulario de caracteres del idioma destino. Con 94 M de parametros, el modelo se situa en el rango "base" de la familia wav2vec2.

Segun la model card, el ajuste fino se hizo sobre un subconjunto de 20 horas anidado dentro de un pool mayor de 500 horas (samromur-500h). El termino "nested subset" sugiere que el conjunto de 20 h esta contenido en el de 500 h y probablemente en los intermedios, de modo que la comparabilidad entre checkpoints queda garantizada por construccion. No se especifican en la informacion disponible el numero de pasos, el esquema de LR, el uso de especulacion, ni si hubo etapas de RLHF/DPO (procedimiento poco habitual en ASR). Tampoco se documenta ninguna innovacion tecnica adicional (attention lineal, decodificacion especulativa ni similares) mas alla del estudio de escalado.

## Capacidades

- Reconocimiento de voz en islandes (transcripcion de audio a texto) mediante decodificacion CTC.
- Transcripcion de audio de un solo canal; el modelo no realiza diarizacion ni separacion de hablantes.
- Ajuste especifico a dominio acustico de lectura/corpus (SAMRÓMUR), segun el origen de los datos de entrenamiento descritos.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo "thinking", razonamiento multi-paso, vision ni audio generativo.
- Capacidades multilingues: no. El tag de idioma es unicamente `is`; no hay evidencia de transferencia a otras lenguas con este checkpoint.
- No se documenta normalizacion de puntuacion, mayusculas ni marcas de tiempo.

## Casos de uso

- Transcripcion de audio en islandes para archivado: el modelo convierte grabaciones (entrevistas, sesiones, material oral) en texto plano en islandes, con un coste de inferencia bajo por su tamano de 94 M de parametros.
- Subtitulado automatico en islandes: integrado en un pipeline de ASR con segmentacion previa por VAD, permite generar subtitulos para videos en islandes; requiere un paso posterior de puntuacion y sincronizacion, ya que el modelo no los produce.
- Investigacion en escalado de datos ASR: sirve como checkpoint de 20 h para comparar curvas de WER/CER frente a los checkpoints de 50 h, 100 h o 500 h del mismo pool, replicando la metodologia del paper citado.
- Base para ajuste fino adicional: al ser un modelo pequeno con licencia CC-BY-SA-4.0, se puede reentrenar con datos propios de un dominio concreto (por ejemplo, terminologia medica o legal en islandes) sobre una GPU de gama media.
- Transcripcion en el borde (edge) o en local: con pesos en fp32 de ~378 MB (y ~189 MB en fp16), es viable ejecutarlo en CPU o en una GPU integrada, sin enviar audio a servicios externos.
- Prototipado rapido de productos de voz para el mercado islandes: dado el bajo coste de despliegue, permite validar un MVP de ASR antes de invertir en un modelo grande o en un servicio en la nube.
- Anotacion asistida de corpus: generacion de transcripciones preliminares que despues se corrigen manualmente, reduciendo el coste de crear nuevos corpus etiquetados en islandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de WER/CER deben consultarse en el paper "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027), cuyo enlace no figura en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,4 GB en fp32 (378 MB de pesos), ~0,2 GB en fp16 (189 MB), ~0,1 GB en INT8 (94 MB) si se cuantiza manualmente. Con activaciones y buffers de audio, un presupuesto de 1-2 GB es holgado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de memoria sirve. Una NVIDIA RTX 3060, RTX 4090, T4 o L4 es mas que suficiente; A100/H100 no aportan ventaja apreciable para este tamano, salvo por procesamiento en lote masivo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, y tambien en CPU moderna (inferencia en tiempo real probable con 4-8 nucleos, aunque no hay datos medidos en la informacion disponible).
- Opciones de despliegue: HuggingFace Transformers (clase `Wav2Vec2ForCTC`), pipelines con `torchaudio`, exportacion a ONNX Runtime y motores de inferencia ASR basados en ONNX como sherpa-onnx. Los servidores orientados a LLM (vLLM, TGI) no son la via natural para un modelo CTC de este tipo.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota sobre el repositorio: el tamano declarado del repo es de 61,6 GB para un modelo de 378 MB en fp32, lo que sugiere que contiene multiples checkpoints u otros artefactos. Conviene revisar los archivos antes de descargar el repositorio completo.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / ambito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| palli23/wav2vec2-base-samromur-20h | 94 M | Islandes (is) | ASR mono-idioma, ajuste con 20 h | CC-BY-SA-4.0 | HuggingFace (19 descargas) |
| facebook/wav2vec2-xls-r-300m | 300 M | 128 idiomas (incluye islandes por transferencia) | ASR multilingue, preentrenamiento masivo | MIT (referencia general, no verificada en esta busqueda) | HuggingFace |
| openai/whisper-large-v3 | ~1.550 M | ~99 idiomas (incluye islandes) | ASR + traduccion + marcas de tiempo | Apache-2.0 (referencia general, no verificada en esta busqueda) | HuggingFace |
| facebook/mms-1b-all | ~1.000 M | mas de 1.100 idiomas | ASR multilingue masivo | CC-BY-NC-4.0 (referencia general, no verificada en esta busqueda) | HuggingFace |

No se dispone de comparativas de WER entre estos modelos y el presente checkpoint en la informacion proporcionada; los datos de licencia y tamano de los modelos alternativos se incluyen como referencia general y no han sido verificados en esta busqueda.

## Limitaciones y advertencias

- Monolingue: solo islandes. Cualquier intento de usarlo con otro idioma producira salidas inutilizables.
- Entrenamiento con solo 20 horas de audio: es un regimen de datos muy bajo. Es esperable un WER claramente superior al de sistemas ajustados con cientos o miles de horas, pero no hay cifras publicadas en la informacion disponible.
- Dominio restringido: los datos provienen de SAMRÓMUR, un corpus de habla leida y grabada por voluntarios. El rendimiento en habla espontanea, telefonia de banda estrecha, ruido de fondo o acentos muy marcados no esta documentado y probablemente degrade.
- Sesgo de hablantes y de equipo de grabacion: la distribucion de voces, edades y microfonos del corpus condiciona el modelo; no se documenta ningun analisis de sesgo.
- Sin puntuacion ni mayusculas: la salida CTC en caracteres no incluye estos elementos, lo que exige post-procesado con un modelo de puntuacion.
- Riesgo de alucinacion acustica: como todo modelo CTC, puede producir texto plausible en segmentos con silencio, ruido musical o voz no islandesa.
- Licencia CC-BY-SA-4.0: permite uso comercial, pero impone atribucion y obligacion de compartir bajo la misma licencia las obras derivadas (por ejemplo, un modelo reentrenado a partir de este). Es una restriccion importante para productos propietarios que no quieran liberar sus pesos.
- Metadatos incompletos: no hay pipeline declarado, ni metricas, ni ficha de uso. Antes de llevarlo a produccion conviene validar el vocabulario, el tokenizer y el formato de entrada exactos.
- Fechas de creacion y actualizacion del repositorio inusuales (2026) segun los metadatos; no se puede verificar la procedencia de ese dato. El modelo tiene 19 descargas y 0 likes, por lo que no existe validacion comunitaria amplia.
- El estudio del que forma parte esta fechado en ICASSP 2027 y el paper no esta enlazado en la informacion disponible; los resultados de WER/CER no son verificables aqui.

## Enlaces

- HuggingFace: https://huggingface.co/palli23/wav2vec2-base-samromur-20h
- Paper citado en la model card: "Scaling Smaller ASR Models Against Multilingual ASR Giants" (ICASSP 2027) — enlace no disponible en la informacion proporcionada.
- Corpus de escalado citado: "Miljón/samromur-500h" — enlace no disponible en la informacion proporcionada.
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian a recetas de reposteria en aleman y no guardan relacion con el modelo.
