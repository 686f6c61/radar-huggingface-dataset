# Discourse/Discourse-STT

## Resumen

Discourse-STT es un conjunto de dos modelos de reconocimiento automatico del habla (ASR) publicados por Discourse para su plugin de voz. Se trata de exportaciones ONNX de los modelos Parakeet Ultra y Parakeet Redux de M87 Labs (Moondream), que a su vez son versiones post-entrenadas de nvidia/parakeet-tdt-0.6b-v3. El objetivo es ofrecer subtitulos y transcripciones en directo ejecutandose integramente en el navegador mediante onnxruntime-web sobre WebGPU, sin enviar audio a ningun servidor.

La arquitectura subyacente es un encoder FastConformer (aproximadamente 0,6 mil millones de parametros) combinado con un decoder TDT (Token-and-Duration Transducer), el mismo diseno, tokenizer y cobertura de 25 idiomas europeos que el modelo original de NVIDIA. El repositorio ocupa 0,6 GB e incluye dos variantes cuantizadas: Ultra (por defecto, encoder en 4 bits) y Redux (mas ligera, encoder en 2 bits con pesos ternarios).

Su relevancia radica en el despliegue en el lado del cliente: con descargas de entre 199 MB y 393 MB y soporte de WebGPU, permite transcripcion multilingue en tiempo real dentro del propio navegador, lo que reduce costes de infraestructura y mejora la privacidad al no salir el audio del dispositivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT (Token-and-Duration Transducer, decoder y red joint) |
| Parametros totales | Aproximadamente 0,6 mil millones (heredados de parakeet-tdt-0.6b-v3) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR; entrada de 128 bins log-mel a 16 kHz; ventana de audio no especificada) |
| Tipos de cuantizacion | Encoder Ultra: 4-bit MatMulNBits (block 32); encoder Redux: 2-bit MatMulNBits (block 128, sin perdida para sus pesos ternarios); decoder joint: int8 dinamico en ambos |
| Idiomas soportados | 25 idiomas europeos: bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, ru, sk, sl, es, sv, uk |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (encoder-model.onnx, decoder_joint-model.int8.onnx, vocab.txt) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del parakeet-tdt-0.6b-v3 de NVIDIA: un encoder FastConformer que consume caracteristicas log-mel de 128 bins a 16 kHz y una cabeza TDT que combina la prediccion de tokens con la prediccion de duraciones. El vocabulario es un SentencePiece de 8193 tokens con blank id 8192, identico en ambas variantes. El encoder se distribuye en un unico archivo ONNX sin datos externos, y el decoder joint (red de prediccion y red joint) se cuantiza dinamicamente a int8.

Los modelos no se entrenan desde cero en este repositorio: son exportaciones y post-entrenamiento derivados. Parakeet Ultra y Parakeet Redux son versiones post-entrenadas de M87 Labs sobre el modelo base de NVIDIA, y Discourse empaqueta exportaciones ONNX realizadas por mrfakename y Olicorne. La unica modificacion declarada es que el sesgo de salida de la red joint para el token `<unk>` (token 0) se fija en -1e4 en ambos decoders, de modo que el modelo no puede emitir `<unk>`, que de otro modo apareceria para simbolos ausentes del vocabulario como `°` o `+`. El resto de archivos son identicos byte a byte a sus fuentes. No se documentan en la informacion disponible detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) con encoder FastConformer y decoder TDT.
- Transcripcion multilingue en 25 idiomas europeos, incluidos espanol, ingles, frances, aleman, italiano, portugues, polaco, ruso y ucraniano.
- Ejecucion integramente en el navegador mediante onnxruntime-web sobre WebGPU, sin backend de servidor.
- Subtitulos en directo y transcripciones para el plugin de voz de Discourse.
- Entrada de audio estandarizada en caracteristicas log-mel de 128 bins a 16 kHz.
- Dos perfiles segun recursos: Ultra (mayor precision, 4 bits) y Redux (menor tamano, 2 bits).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Subtitulos en directo en comunidades Discourse: el plugin de voz usa el worker de `discourse_voice_assets` para cargar el modelo en el navegador y generar subtitulos mientras el audio se reproduce, sin depender de un servicio externo.
- Transcripcion de reuniones y conversaciones con privacidad: al ejecutarse en el cliente, el audio no abandona el dispositivo, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Accesibilidad en foros y plataformas comunitarias: generacion de transcripciones de audio publicado por los usuarios para personas con discapacidad auditiva.
- Despliegue sin coste de servidor: al no requerir GPU en el backend, se puede ofrecer transcripcion en aplicaciones web estaticas o autoalojadas.
- Aplicaciones web progresivas y herramientas de escritorio basadas en navegador: el modelo puede integrarse alli donde WebGPU este disponible y no se quiera enviar audio a la nube.
- Flujos de transcripcion multilingue en Europa: cobertura de 25 idiomas permite atender comunidades con usuarios de distintas lenguas sin cambiar de modelo.
- Autoalojamiento corporativo: cualquier host HTTPS con CORS habilitado puede servir las carpetas y fijarse mediante `voice_stt_model_base_url` en el plugin de voz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las model cards de Moondream para consultar las metricas; los unicos datos cuantitativos aportados son los tamanos de descarga (aproximadamente 393 MB para Ultra y 199 MB para Redux) y la indicacion de que Redux presenta peor precision en varios idiomas (incluidos frances y aleman) y en audio con ruido.

## Requisitos de hardware

- Inferencia pensada para el navegador mediante WebGPU; no se especifican requisitos de VRAM en la informacion disponible.
- Tamano de descarga: aproximadamente 393 MB para `ultra-q4/` y 199 MB para `redux-w2a8/`.
- Al tratarse de un modelo de 0,6 B de parametros con encoder cuantizado a 4 y 2 bits, esta disenado para ejecutarse en equipos de consumo; cabe en GPUs de consumo y presumiblemente en GPUs integradas compatibles con WebGPU.
- Opciones de despliegue: onnxruntime-web sobre WebGPU (caso de uso objetivo); los archivos ONNX pueden consumirse tambien con otros runtimes compatibles con ONNX, aunque no se documenta soporte explicito.
- No se especifican en la informacion disponible valores de latencia ni throughput.
- Autoalojamiento: los archivos deben servirse por HTTPS con CORS habilitado y conservando el nombre y la estructura de carpetas; los navegadores cachean por URL, por lo que se recomienda publicar cambios bajo una URL nueva.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Discourse-STT (Ultra / Redux) | ~0,6 B | 25 europeos | CC-BY-4.0 | ONNX, WebGPU en navegador | Cuantizado a 4 y 2 bits; orientado a ejecucion en cliente |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | 25 europeos | CC-BY-4.0 | Pesos originales (no ONNX de navegador) | Modelo base del que derivan Ultra y Redux |
| moondream/parakeet-ultra y moondream/parakeet-redux | ~0,6 B | 25 europeos | no disponible en la informacion proporcionada | Pesos post-entrenados | Fuente directa de las exportaciones |
| Whisper large-v3 (OpenAI) | ~1,55 B | ~99 | MIT | Multiples (incluye ONNX y otros) | Alternativa ASR ampliamente usada; cifras de referencia no verificadas en la informacion disponible |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada, por lo que no es posible contrastar la precision frente a estas alternativas.

## Limitaciones y advertencias

- Redux presenta peor precision que Ultra en varios idiomas, incluidos frances y aleman, y en audio con ruido; Ultra es la variante por defecto.
- Ambos decoders tienen el sesgo de `<unk>` fijado en -1e4, por lo que no pueden emitir ese token; los simbolos ausentes del vocabulario (por ejemplo `°` o `+`) no se generan.
- Riesgo de errores de transcripcion en audio ruidoso o con acentos no cubiertos; no se documentan tasas de error.
- Cobertura limitada a 25 idiomas europeos; no se soportan otras lenguas.
- La ejecucion depende de WebGPU y de onnxruntime-web en el navegador; la disponibilidad y el rendimiento varian segun el dispositivo del usuario.
- Los archivos se cachean por URL en el navegador; sobrescribir un archivo en la misma URL puede dejar versiones obsoletas en cache.
- Licencia CC-BY-4.0: permite uso comercial con atribucion a NVIDIA, M87 Labs (Moondream), mrfakename, Olicorne y eschmidbauer; es necesario conservar la atribucion.
- No se documentan en la informacion disponible detalles sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Discourse/Discourse-STT
- Sitio de Discourse: https://www.discourse.org/
- Repositorio del gem con el worker: https://github.com/discourse/discourse_voice_assets
- Repositorio de Discourse: https://github.com/discourse/discourse
- onnxruntime-web: https://onnxruntime.ai
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Parakeet Ultra (Moondream): https://huggingface.co/moondream/parakeet-ultra
- Parakeet Redux (Moondream): https://huggingface.co/moondream/parakeet-redux
- Exportacion ONNX de Ultra: https://huggingface.co/mrfakename/parakeet-ultra-ONNX
- Exportacion ONNX de parakeet-tdt-0.6b-v3-ultra: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Exportacion ONNX de parakeet-tdt-0.6b-v3-redux: https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-redux-onnx
- Repositorio ONNX de referencia de Redux: https://huggingface.co/eschmidbauer/parakeet-redux-onnx
- Licencia CC-BY-4.0: https://creativecommons.org/licenses/by/4.0/
