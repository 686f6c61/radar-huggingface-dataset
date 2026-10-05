# Masterx/parakeet-tdt-0.6b-ultra-onnx

## Resumen

Parakeet Ultra 0.6B (ONNX, onnx-asr layout) es la exportacion a ONNX del modelo de reconocimiento automatico del habla (ASR) moondream/parakeet-ultra, un modelo post-entrenado sobre nvidia/parakeet-tdt-0.6b-v3. Lo publica el usuario Masterx en HuggingFace y su proposito es ofrecer una version optimizada para inferencia con onnxruntime, onnx-asr, DirectML y WinSTT sin necesidad de dependencias de NeMo ni de PyTorch en produccion.

El modelo mantiene la misma arquitectura y el mismo tokenizador que parakeet-tdt-0.6b-v3, con unos 600 millones de parametros. La unica diferencia respecto al checkpoint original es que los grafos ONNX reutilizan la estructura de istupakov/parakeet-tdt-0.6b-v3-onnx, sustituyendo todos los inicializadores por los pesos de Parakeet Ultra; el mapeo se valido reproduciendo los inicializadores del export v3 desde el checkpoint NVIDIA v3 con un error relativo maximo de 1,3e-7.

Es relevante porque empaqueta un modelo ASR multilingue de 25 idiomas europeos en formatos fp32, fp16 e int8, con nombres de fichero, tensores e IO identicos al export v3, de modo que puede desplegarse en hardware de consumo (incluida aceleracion DirectML) sin reescribir la integracion existente. La licencia es CC-BY-4.0, heredada de los modelos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (Token-and-Duration Transducer); encoder Conformer + red de prediccion LSTM + joint network |
| Parametros totales | ~0,6 mil millones (0.6B, segun denominacion del modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (encoder + decoder), fp16 (pesos fp16, IO fp32), int8 dynamic (per-tensor QUInt8) |
| Idiomas soportados | en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el, mt (25 idiomas) |
| Licencia | cc-by-4.0 |
| Formato de pesos | ONNX (encoder-model.onnx + encoder-model.onnx.data, decoder_joint-model.onnx; variantes .fp16 y .int8), mas vocab.txt y config.json |

## Arquitectura y entrenamiento

El modelo es un export ONNX de moondream/parakeet-ultra, que a su vez es un post-entrenamiento de nvidia/parakeet-tdt-0.6b-v3 con la misma arquitectura y tokenizador. La arquitectura subyacente es el transductor TDT (Token-and-Duration Transducer) de NVIDIA NeMo, que combina un encoder Conformer (transformer aumentado con convoluciones) con una red de prediccion basada en LSTM y una red conjunta que emite simultaneamente tokens y duraciones, lo que acelera la decodificacion frente a un RNN-T clasico. El export incluye dos grafos: el encoder y el decoder/joint.

En cuanto al proceso de exportacion, los grafos son los de istupakov/parakeet-tdt-0.6b-v3-onnx con cada inicializador reemplazado por los pesos de Parakeet Ultra. Durante ese proceso se volvieron a plegar las BatchNorm en las convoluciones depthwise y se reordenaron las puertas LSTM al orden de ONNX, de forma que los nombres de ficheros, nombres de tensores e IO son identicos al export v3. No se incluye la cabeza VAD presente en el checkpoint de origen. Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) sobre 25 idiomas europeos: en, de, fr, es, it, pt, ru, uk, hr, sl, lv, lt, et, fi, sv, da, nl, pl, cs, sk, hu, ro, bg, el y mt.
- Decodificacion por transductor TDT, que predice tokens y duraciones de forma conjunta.
- Inferencia via onnxruntime, con soporte especifico para DirectML (aceleracion en GPU en Windows) y compatibilidad con el ecosistema onnx-asr y WinSTT.
- Export en varias precisiones (fp32, fp16, int8) manteniendo el mismo IO, lo que permite intercambiar el fichero sin cambiar la integracion.
- Compatibilidad directa con cualquier integracion construida para istupakov/parakeet-tdt-0.6b-v3-onnx, al compartir nombres de tensores y estructura.
- No se documentan en la informacion disponible capacidades de generacion de texto, razonamiento, tool calling, agentes ni vision; se trata exclusivamente de un modelo ASR.

## Casos de uso

- Transcripcion de reuniones y notas de voz: al ser un modelo de 0,6B en ONNX, puede ejecutarse en local con onnxruntime para convertir audio a texto sin enviar datos a la nube, util para entornos con requisitos de privacidad.
- Subtitulado multilingue: los 25 idiomas europeos cubiertos permiten generar subtitulos en ingles, aleman, frances, espanol, italiano, portugues, neerlandes, polaco, sueco, etc. con un unico modelo.
- Dictado en aplicaciones de escritorio en Windows: gracias al soporte DirectML y a la compatibilidad con WinSTT/onnx-asr, se puede integrar en herramientas de dictado nativas sin GPU dedicada de gama alta.
- Servicio de transcripcion en backend ligero: el formato ONNX permite desplegar el modelo en contenedores sin NeMo ni PyTorch, reduciendo el tamano de la imagen y las dependencias.
- Procesado por lotes de archivos de audio: al disponer de variante int8, es viable transcribir grandes volumenes con menor coste de memoria y computo, integrandolo en pipelines de datos.
- Migracion desde istupakov/parakeet-tdt-0.6b-v3-onnx: si ya existe una integracion basada en ese export, se puede sustituir por este modelo cambiando unicamente los pesos, ya que el IO es identico.
- Investigacion y evaluacion de ASR en idiomas minoritarios europeos: cobertura de idiomas como estonio, letón, lituano, croata, esloveno o maltes, menos frecuentes en otros modelos ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de ~0,6B parametros; no confirmada por el autor): fp32 en torno a 2,4 GB de pesos mas overhead de activaciones; fp16 en torno a 1,2 GB; int8 dynamic en torno a 0,6 GB. El repo completo ocupa 4,5 GB porque incluye las tres precisiones.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime; con DirectML se contemplan GPUs de AMD, Intel y NVIDIA en Windows. Para maxima comodidad, GPUs con al menos 2-4 GB de VRAM dedicada cubren el modelo en fp16/int8.
- Compatibilidad con GPU de consumo: si, el modelo es de 0,6B y cabe en GPU de consumo (por ejemplo, gamas con 4 GB o mas de VRAM) en fp16 o int8. No se proporcionan modelos concretos verificados.
- Opciones de despliegue: onnxruntime (CPU y GPU), DirectML (Windows), onnx-asr, WinSTT. Los nombres de tensores son compatibles con el export de istupakov v3.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: la cabeza VAD del checkpoint de origen no esta incluida, por lo que la deteccion de actividad de voz debe aportarse por separado si se necesita.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma(s) | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Masterx/parakeet-tdt-0.6b-ultra-onnx | ~0,6B | 25 idiomas europeos | no disponible | cc-by-4.0 | ONNX (fp32, fp16, int8) |
| moondream/parakeet-ultra | ~0,6B | 25 idiomas europeos | no disponible | cc-by-4.0 | pesos originales (modelo base) |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6B | 25 idiomas europeos | no disponible | cc-by-4.0 | NeMo / checkpoint NVIDIA |
| istupakov/parakeet-tdt-0.6b-v3-onnx | ~0,6B | 25 idiomas europeos | no disponible | no disponible | ONNX (misma estructura de grafos) |

Los datos de parametros, idiomas y licencia de las alternativas se derivan de la informacion proporcionada en esta ficha; no se dispone de datos de rendimiento comparativo entre ellas. No se dispone de informacion sobre modelos comparables de otros desarrolladores en la documentacion facilitada.

## Limitaciones y advertencias

- Es un modelo exclusivamente de ASR: no genera texto libre, no razona y no soporta tool calling ni uso como agente.
- No se han publicado benchmarks, por lo que no hay evidencia cuantitativa de precision (WER) ni de rendimiento por idioma en la informacion disponible.
- El rendimiento puede variar de forma notable entre los 25 idiomas declarados; no se documenta el grado de cobertura real ni la calidad por idioma.
- El modelo se distribuye sin la cabeza VAD del checkpoint de origen, por lo que en audio largo o con silencios puede requerir un componente adicional de segmentacion.
- Riesgo de alucinacion y de errores de transcripcion inherente a los sistemas ASR, especialmente en audio con ruido, solapamiento de voces o acentos no representados en el entrenamiento.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a la atribucion de los autores del modelo original (moondream/parakeet-ultra y nvidia/parakeet-tdt-0.6b-v3). Conviene revisar los terminos de los modelos base antes de produccion.
- El repo no incluye informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento, lo que dificulta evaluar su comportamiento en dominios especificos.
- El modelo no presenta descargas ni likes en el momento de la consulta, por lo que no cuenta con validacion de la comunidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Masterx/parakeet-tdt-0.6b-ultra-onnx
- Modelo base (moondream/parakeet-ultra): https://huggingface.co/moondream/parakeet-ultra
- Modelo NVIDIA de origen (nvidia/parakeet-tdt-0.6b-v3): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export ONNX de referencia (istupakov/parakeet-tdt-0.6b-v3-onnx): https://huggingface.co/istupakov/parakeet-tdt-0.6b-v3-onnx
- Repositorio onnx-asr: https://github.com/istupakov/onnx-asr
