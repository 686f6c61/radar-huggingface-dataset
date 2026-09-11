# florianfelix/canary-1b-v2-onnx

## Resumen

Canary 1B v2 en formato ONNX es una conversion del modelo de reconocimiento automatico del habla `nvidia/canary-1b-v2` de NVIDIA, publicada por el usuario florianfelix. El modelo original es un sistema NeMo Conformer AED (encoder Conformer mas decoder autorregresivo) de aproximadamente 1.000 millones de parametros, orientado a transcripcion multilingue y traduccion directa de voz a texto. Esta version no reentrena ni modifica los pesos: unicamente los exporta a ONNX para que puedan ejecutarse con la libreria `onnx-asr`.

La relevancia de esta ficha esta en el formato, no en el modelo en si. Al estar en ONNX, el modelo se puede desplegar sobre ONNX Runtime sin depender del stack completo de NeMo ni de PyTorch, lo que simplifica el empaquetado en servicios ligeros, contenedores pequenos y entornos de CPU. Es una pieza util para equipos que quieren un ASR multilingue de tamano medio sin arrastrar dependencias de entrenamiento.

Cubre 25 idiomas europeos, entre ellos espanol, ingles, frances, aleman, italiano, portugues, neerlandes, polaco, ruso y ucraniano, y admite tanto transcripcion en el idioma de origen como traduccion a un idioma objetivo. La licencia es CC-BY-4.0, lo que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer AED (encoder Conformer + decoder autorregresivo), segun el tag `nemo-conformer-aed` |
| Parametros totales | Aproximadamente 1.000 millones (cifra exacta no disponible; se deduce de la denominacion "1B" del modelo base) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo de audio; la ventana de audio maxima no se detalla en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos ONNX, pero no se enumeran variantes cuantizadas) |
| Idiomas soportados | 25: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX |
| Tamano del repositorio | 5,0 GB |
| Pipeline | automatic-speech-recognition (con soporte adicional de traduccion de voz) |
| Modelo base | nvidia/canary-1b-v2 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia NeMo Conformer AED, que combina un encoder Conformer (convoluciones locales mas atencion global) con un decoder Transformer autorregresivo. Esta es la arquitectura habitual de los modelos Canary de NVIDIA: el encoder procesa los fotogramas acusticos y el decoder genera la secuencia de tokens de texto, lo que permite unificar transcripcion y traduccion en el mismo modelo variando el token de idioma objetivo.

No se dispone de informacion sobre el entrenamiento en la documentacion proporcionada. No se especifican el numero de tokens de audio utilizados, la composicion del dataset, ni si hubo etapas de ajuste con RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones tecnicas concretas de esta conversion. Lo unico documentado es el proceso de exportacion a ONNX y su integracion con `onnx-asr` mediante la llamada `onnx_asr.load_model("nemo-canary-1b-v2")`.

## Capacidades

- Reconocimiento automatico del habla (ASR) en 25 idiomas europeos.
- Traduccion directa de voz a texto: acepta un parametro `target_language` que permite transcribir en un idioma distinto al hablado.
- Ejecucion sobre ONNX Runtime, tanto en CPU como en configuraciones con aceleracion por GPU, a traves de `onnx-asr`.
- Carga simplificada mediante una unica llamada de libreria, sin necesidad de instalar NeMo ni PyTorch.
- Entrada de audio en formato WAV en los ejemplos documentados.
- No se documentan en la informacion disponible capacidades de diarizacion de hablantes, marcas de tiempo a nivel de palabra, deteccion de idioma automatica sin indicacion explicita, tool calling ni comportamiento de agente.

## Casos de uso

- Transcripcion de reuniones multilingues: al cubrir 25 idiomas europeos en un solo modelo, una empresa con equipos repartidos por Europa puede transcribir reuniones en espanol, aleman, polaco y frances sin desplegar un modelo distinto por idioma.
- Subtitulado de contenido audiovisual: la salida de texto se puede postprocesar para generar subtitulos en el idioma original, y la funcion de traduccion permite producir una segunda pista de subtitulos en otro idioma a partir del mismo audio.
- Traduccion de voz para atencion al cliente: en un centro de soporte que recibe llamadas en varios idiomas, el modelo puede transcribir y traducir la llamada en una sola pasada, alimentando un sistema de tickets o de resumen automatico.
- Despliegue en entornos sin GPU: dado que el formato ONNX se ejecuta sobre ONNX Runtime en CPU, encaja en servidores modestos, appliances locales o despliegues en el borde donde no hay acelerador disponible.
- Integracion en contenedores ligeros: al no requerir el stack de NeMo, reduce el tamano de la imagen y el numero de dependencias, lo que simplifica el mantenimiento de pipelines de transcripcion.
- Archivado y busqueda de audio historico: permite transcribir grabaciones o archivos de audio acumulados para hacerlos buscables por texto, con soporte multilingue para fondos documentales heterogeneos.
- Accesibilidad: generacion de transcripciones en tiempo casi real para personas con discapacidad auditiva en entornos con hablantes de distintos idiomas.
- Preprocesado para analitica de voz: la transcripcion sirve como primer paso para clasificacion de intenciones, analisis de sentimiento o extraccion de entidades sobre conversaciones de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio se limita a describir la conversion a ONNX y el uso basico con `onnx-asr`, sin incluir metricas de WER, BLEU ni comparaciones numericas con otros sistemas.

## Requisitos de hardware

- VRAM estimada: partiendo de aproximadamente 1.000 millones de parametros, la inferencia en FP32 requiere del orden de 4 GB de memoria para los pesos, mas el overhead del runtime y de las activaciones. En FP16 la cifra se reduce a unos 2 GB, y en INT8 a alrededor de 1 GB. Son estimaciones derivadas del numero de parametros, no datos publicados por el autor.
- El repositorio ocupa 5,0 GB, coherente con pesos en precision completa o con varias variantes incluidas; conviene verificar los archivos concretos antes de dimensionar el despliegue.
- GPU: el modelo cabe sin problema en GPUs de consumo como una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090. Tambien es apto para GPUs de datacenter como A100 o H100, aunque en ese caso estara infrautilizada desde el punto de vista de memoria.
- CPU: al ser un modelo de aproximadamente 1.000 millones de parametros, la inferencia en CPU es viable pero notablemente mas lenta. Es util para procesamiento por lotes de ficheros ya grabados mas que para transcripcion en tiempo real.
- Opciones de despliegue: la via documentada es `onnx-asr` con ONNX Runtime (`pip install onnx-asr[cpu,hub]`). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no son aplicables a un modelo de audio de este tipo.
- Latencia y throughput: no disponibles. No se proporcionan mediciones de RTF (real-time factor), latencia por minuto de audio ni throughput en ninguna configuracion de hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| florianfelix/canary-1b-v2-onnx | ~1.000 M | 25 | ONNX | CC-BY-4.0 | Conversion comunitaria para `onnx-asr` |
| nvidia/canary-1b-v2 | ~1.000 M | 25 | NeMo / PyTorch | CC-BY-4.0 | Modelo original; requiere stack NeMo |
| OpenAI Whisper large-v3 | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | PyTorch, entre otros | no disponible en la informacion proporcionada | Alternativa de referencia para ASR multilingue; los datos concretos deben verificarse en su propia ficha |

No se dispone de resultados de benchmarks que permitan comparar la calidad de transcripcion entre estas opciones dentro de la informacion proporcionada, por lo que la tabla se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Este repositorio es una conversion de formato, no un modelo nuevo. Cualquier limitacion de calidad, sesgo o cobertura del modelo original `nvidia/canary-1b-v2` se hereda sin cambios.
- No se documentan en el repositorio evaluaciones de sesgo linguistico ni de equidad entre los 25 idiomas cubiertos. Es razonable esperar diferencias de calidad entre idiomas con muchos recursos (ingles, frances, espanol) y otros con menos, pero no hay datos que lo confirmen.
- Riesgo de alucinacion: no se documenta el comportamiento del modelo ante audio de baja calidad, ruido, musica o silencio. Como en cualquier sistema de transcripcion autorregresivo, existe riesgo de generar texto plausible que no corresponde al audio. No hay datos publicados al respecto en la informacion disponible.
- La ventana de audio maxima no esta documentada en el repositorio. Para audios largos habra que segmentar, y no se especifica como se comporta el modelo en los limites de segmento.
- Licencia CC-BY-4.0: permite uso comercial, pero exige atribucion. Conviene verificar las condiciones de la licencia del modelo base `nvidia/canary-1b-v2` antes de un despliegue en produccion, ya que este repositorio es un derivado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado recientemente. No hay historial de uso ni validacion por parte de la comunidad que respalde su fiabilidad en produccion.
- La integracion depende de la libreria de terceros `onnx-asr`. Cambios en esa libreria o en el export podrian afectar a la compatibilidad.
- Para produccion, es recomendable comparar el resultado de esta conversion ONNX con el modelo original en NeMo para descartar perdidas de precision introducidas por la exportacion, algo que no esta documentado.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/florianfelix/canary-1b-v2-onnx
- Modelo base: https://huggingface.co/nvidia/canary-1b-v2
- Libreria onnx-asr: https://github.com/istupakov/onnx-asr
- No se han encontrado en la busqueda web enlaces adicionales relevantes (papers, blogs tecnicos o demos) asociados a este modelo.
