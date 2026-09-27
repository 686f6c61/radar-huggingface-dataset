# iniquitous/indic-transcribe-flex-onnx

## Resumen

Indic-Transcribe-Flex (sherpa-onnx ONNX export) es una conversión a ONNX en precisión fp32 del modelo bodhan-ai/indic-transcribe-flex, un sistema de reconocimiento automático del habla (ASR) construido sobre la arquitectura NVIDIA Canary: un encoder FastConformer seguido de un decoder Transformer autorregresivo. El modelo original, desarrollado por Bodhan AI con ascendencia técnica de AI4Bharat y NVIDIA, está afinado para 27 lenguas indias y para inglés con acento indio, lo que lo sitúa en el nicho de ASR multilingüe para el subcontinente.

La relevancia de esta ficha concreta no está en el modelo en sí, sino en el formato: se trata de un export a ONNX pensado para ejecutarse con sherpa-onnx, la herramienta de inferencia de k2-fsa orientada a despliegue local, sin GPU obligatoria y sin dependencias de NeMo ni de PyTorch. Eso permite integrar un ASR de calidad en aplicaciones de escritorio, móviles o edge, algo complicado con el stack nativo de NVIDIA.

El repositorio ocupa 14,3 GB e incluye tres artefactos: `encoder.onnx` con datos externos en `encoder.onnx.data` (unos 3,1 GB de pesos), `decoder.onnx` autocontenido (unos 1,6 GB) y `tokens.txt` con un vocabulario agregado de 7152 tokens. El autor advierte que solo se publica fp32: la cuantización dinámica a int8 corrompe la salida (la decodificación se detiene tras uno o dos tokens) y la conversión a fp16 chocó con un fallo de `onnxconverter-common` sobre este grafo. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer + decoder Transformer autorregresivo (familia NVIDIA Canary) |
| Parametros totales | no disponible (el autor no publica el recuento; pesos ONNX fp32: ~3,1 GB encoder + ~1,6 GB decoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de audio; no se especifica la duracion maxima de clip soportada) |
| Tipos de cuantizacion | Solo fp32. Int8 dinamica descartada por corrupcion de salida; fp16 no completado por un fallo de herramienta |
| Idiomas soportados | 27 lenguas indias mas ingles con acento indio |
| Licencia | Indic Open Model License v1.0 (campo `license: other` en HuggingFace) |
| Formato de pesos | ONNX (`encoder.onnx` + `encoder.onnx.data` en formato de datos externos, `decoder.onnx`), mas `tokens.txt` |
| Tamano del repositorio | 14,3 GB |
| Muestreo de audio | 16 kHz mono, float32 |
| Vocabulario | 7152 tokens (tokenizer agregado) |

## Arquitectura y entrenamiento

La arquitectura es la de NVIDIA Canary: un encoder FastConformer, variante de Conformer con convoluciones depthwise y atencion eficiente que reduce el coste computacional frente a un Conformer estandar, acoplado a un decoder Transformer que genera la transcripcion de forma autorregresiva. El modelo acepta etiquetas de idioma de origen y destino (`src_lang` / `tgt_lang`), un mecanismo heredado de Canary que permite tanto transcripcion monolingüe como traduccion de voz dentro del mismo grafo. El export mantiene el tokenizer agregado, con 7152 entradas que cubren los alfabetos de las lenguas indias soportadas mas el ingles.

Sobre el entrenamiento, esta ficha no aporta información: la model card del export no detalla el número de tokens de audio, la composición del dataset, ni si hubo etapas de ajuste fino supervisado, RLHF o DPO. Lo único verificable es la procedencia: el modelo base es bodhan-ai/indic-transcribe-flex, a su vez derivado de nvidia/canary-1b-v2 (licencia CC-BY-4.0), y la licencia resultante exige atribución a Bodhan AI / AI4Bharat y a NVIDIA.

La innovación técnica del repositorio es puramente de despliegue: la conversión a ONNX con datos externos para el encoder y el soporte del pipeline `OfflineRecognizer.from_nemo_canary` en sherpa-onnx. El autor verificó la conversión contra un clip de narración en inglés de 12 segundos, obteniendo una coincidencia casi exacta con la salida de `model.transcribe()` de NeMo, con una única discrepancia en un nombre propio poco frecuente.

## Capacidades

- Transcripcion automatica del habla en 27 lenguas indias y en ingles con acento indio.
- Traduccion de voz dentro del mismo modelo mediante los parametros `src_lang` y `tgt_lang` (herencia de la arquitectura Canary), aunque el autor no documenta ni ejemplifica esta modalidad en la model card.
- Decodificacion offline por lotes o por flujo, integrada en sherpa-onnx.
- Ejecucion en CPU y en GPU segun los proveedores de ejecucion de ONNX Runtime disponibles.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento explicito.
- No se documentan capacidades de diarizacion de hablantes, deteccion de idioma automatica ni puntuacion con restauracion de mayusculas.

## Casos de uso

- Transcripcion local en aplicaciones de escritorio para lenguas indias: el modelo se carga mediante sherpa-onnx sin necesidad de instalar NeMo ni PyTorch, lo que simplifica el empaquetado de una utilidad de dictado o de subtitulado en hindi, tamil, bengali u otras lenguas cubiertas.
- Servicio de subtitulado para contenido audiovisual indio: el soporte de 27 lenguas y de ingles con acento indio permite generar subtitulos de forma uniforme para catalogos con material multilingüe, evitando encadenar varios modelos monoidioma.
- Indexacion y busqueda de archivos de audio y video: transcripcion masiva de un corpus para construir indices de texto buscables, aprovechando que la inferencia en CPU abarata el procesamiento por lotes sin GPU.
- Atencion al cliente en centros de contacto del subcontinente: transcripcion de grabaciones de llamadas para analitica, control de calidad y generacion de actas, con la ventaja de que los datos no salen de la infraestructura local.
- Despliegue en dispositivos edge o entornos aislados: al no requerir el stack de NeMo y disponer de un runtime ONNX, puede ejecutarse en equipos sin conectividad o con requisitos estrictos de residencia de datos, habituales en administraciones publicas indias.
- Sistemas de accesibilidad: subtitulado en vivo o diferido de clases, conferencias y actos publicos en lenguas indias, donde el coste de licencia por uso de APIs comerciales resulta prohibitivo.
- Investigacion en ASR multilingüe: el export sirve como referencia reproducible para comparar la degradacion de la precision al convertir un modelo NeMo a ONNX, un problema recurrente en la literatura de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del export no incluye cifras de WER, CER ni comparaciones cuantitativas con otros sistemas; la unica validacion reportada es cualitativa, sobre un clip de audio en ingles de 12 segundos, donde la salida coincide casi exactamente con la de NeMo salvo una palabra poco frecuente.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 suman aproximadamente 4,7 GB (3,1 GB de encoder mas 1,6 GB de decoder), a lo que hay que anadir el espacio de trabajo de activaciones y el runtime, por lo que conviene prever del orden de 6 a 8 GB de VRAM para inferencia en GPU. Es una estimacion derivada del tamano de los ficheros, no una cifra publicada por el autor.
- Almacenamiento: el repositorio completo ocupa 14,3 GB, muy por encima de la suma de los pesos, por lo que hay que reservar espacio en disco en consecuencia.
- GPU recomendadas: no disponibles. Cualquier GPU con al menos 8 GB de memoria puede alojar los pesos en fp32 sin cuantizar; para lotes grandes o audio de duracion elevada se recomienda una GPU de clase profesional (A100, H100) o una consumer de gama alta.
- GPU de consumo: sí cabe, en tarjetas con 8 GB o mas de VRAM. No se dispone de datos de rendimiento especificos.
- CPU: al ser un modelo de aproximadamente mil millones de parametros en fp32, la inferencia en CPU es viable pero notablemente mas lenta que en GPU; sherpa-onnx esta disenado precisamente para ese escenario.
- Opciones de despliegue: sherpa-onnx (unico camino documentado, mediante `OfflineRecognizer.from_nemo_canary`). Tambien seria teoricamente posible usar ONNX Runtime de forma directa, pero el autor no lo documenta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Indic-Transcribe-Flex ONNX (este modelo) | no disponible | 27 lenguas indias + ingles con acento indio | ONNX fp32 | Indic Open Model License v1.0 | Export orientado a sherpa-onnx, 14,3 GB de repositorio, sin benchmarks publicados |
| nvidia/canary-1b-v2 | aproximadamente 1B | Multilingue europeo, no especificamente indio | NeMo (`.nemo`), PyTorch | CC-BY-4.0 | Arquitectura de la que deriva este modelo; requiere stack NeMo |
| Whisper large-v3 | aproximadamente 1550M | Multilingue amplio, cobertura limitada en lenguas indias | PyTorch, ONNX, GGUF segun la distribucion | MIT | Referencia habitual en ASR multilingüe; los datos de parametros son valores de referencia publicos, no extraidos de la informacion de esta busqueda |
| AI4Bharat IndicWhisper / modelos Indic | no disponible | Lenguas indias | depende de la distribucion | depende de la distribucion | Alternativas del ecosistema indio; no se dispone de datos verificados en esta busqueda |

Los datos de comparacion de modelos de terceros proceden de conocimiento general y no de la informacion proporcionada, por lo que deben verificarse antes de citarlos en produccion. No hay cifras de WER comparadas disponibles para este modelo.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay cifras de WER que permitan estimar la calidad real por idioma, y el rendimiento puede variar mucho entre las 27 lenguas cubiertas.
- Solo se distribuye en fp32. La cuantizacion int8 dinamica corrompe la salida del modelo, y fp16 no llego a completarse, por lo que no existen alternativas mas ligeras si el espacio o la memoria son un problema.
- El repositorio ocupa 14,3 GB, lo que dificulta su distribucion en aplicaciones con restricciones de tamano.
- Riesgo de alucinacion inherente a los modelos seq2seq de ASR: en audio con ruido, silencios largos o solapamiento de hablantes puede generar texto no presente en la senal. Se recomienda validar con umbrales de confianza y deteccion de voz.
- El modelo esta especializado en lenguas indias e ingles con acento indio; su rendimiento en otras lenguas no esta documentado y probablemente sea deficiente.
- No se documentan mecanismos de puntuacion, mayusculas, marcas de tiempo ni diarizacion, capacidades que suelen necesitarse en pipelines de subtitulado y que habria que anadir por separado.
- Licencia restrictiva: Indic Open Model License v1.0 exige atribucion a Bodhan AI / AI4Bharat y a NVIDIA. No es una licencia permisiva tipo Apache 2.0 o MIT; conviene revisar los terminos completos antes de un uso comercial.
- El modelo es un trabajo derivado y su licencia final es la del modelo fuente, no la de NVIDIA Canary (CC-BY-4.0), que solo aplica a la arquitectura base.
- Sin descargas ni validacion de la comunidad en el momento de redactar esta ficha: es un artefacto reciente y sin rodaje en produccion.
- No se documenta el comportamiento con audio que supere cierta duracion; la arquitectura FastConformer tiene limites practicos de ventana que la model card no explicita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/iniquitous/indic-transcribe-flex-onnx
- Modelo base: https://huggingface.co/bodhan-ai/indic-transcribe-flex
- Arquitectura de origen: https://huggingface.co/nvidia/canary-1b-v2
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Terminos de licencia: https://huggingface.co/bodhan-ai/indic-transcribe-flex
