# SchumiPres/parakeet-tdt-0.6b-v3-int8

## Resumen

SchumiPres/parakeet-tdt-0.6b-v3-int8 es una exportacion cuantizada a int8 del modelo de reconocimiento automatico del habla (ASR) Parakeet TDT 0.6B v3 de NVIDIA, empaquetada en formato ONNX para su uso con la libreria sherpa-onnx. No es un modelo nuevo: es una derivacion del checkpoint fp32 de sherpa-onnx (`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3`) en la que solo se cuantizan las multiplicaciones de matrices (MatMul) del encoder, manteniendo en fp32 las capas convolucionales, el decoder y el joiner. El objetivo declarado es preservar la precision en habla degradada (ruidosa, apagada o con filtrado de banda) frente a otras exportaciones int8 publicas que tambien cuantizan las convoluciones.

El modelo base es un transducer TDT (Token-and-Duration Transducer) de NVIDIA, de aproximadamente 0,6 mil millones de parametros, entrenado para transcripcion multilingue en cinco idiomas: frances, ingles, aleman, espanol e italiano. Esta pensado para inferencia offline (transcripcion de ficheros completos) sobre CPU, sin necesidad de GPU, gracias al formato ONNX y a la cuantizacion int8.

Su relevancia practica es doble: por un lado, reduce el tamano del artefacto de 2,55 GB (fp32) a 954 MB, lo que facilita el despliegue en entornos con recursos limitados; por otro, el autor documenta un conjunto de evaluacion propio sobre habla francesa degradada en el que esta exportacion obtiene un WER del 9,9 % frente al 18,6 % de la exportacion int8 publica alternativa, a costa de un mayor tamano (954 MB frente a 671 MB). La licencia es CC BY 4.0, heredada del modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer transducer con decodificacion TDT (Token-and-Duration Transducer), exportado a ONNX |
| Parametros totales | ~0,6 mil millones (0.6B, segun el nombre del modelo base) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR offline; la model card no especifica limite de duracion de audio) |
| Tipos de cuantizacion | int8 dinamico (QInt8, per-channel) solo en operaciones MatMul del encoder; decoder, joiner y convoluciones en fp32 |
| Idiomas soportados | fr, en, de, es, it |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.onnx`, `joiner.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

El modelo base es un transducer neuronal de NVIDIA (familia NeMo) con decodificacion TDT, una variante del RNN-T en la que el predictor emite conjuntamente tokens y duraciones, lo que reduce el numero de pasos de decodificacion y mejora la eficiencia frente al RNN-T clasico. La arquitectura se compone de encoder, decoder (predictor) y joiner, tal como refleja el empaquetado ONNX de sherpa-onnx. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste supervisado adicional; esa informacion corresponderia a la model card del modelo original de NVIDIA, no incluida aqui.

La innovacion tecnica de esta ficha concreta es la estrategia de cuantizacion. Partiendo del export fp32 de sherpa-onnx (commit `5fcc012`) y con ONNX Runtime 1.22.1, el autor aplica `quantize_dynamic` con `op_types_to_quantize=["MatMul"]`, `per_channel=True` y `weight_type=QuantType.QInt8`, dejando intactos `decoder.onnx`, `joiner.onnx` y `tokens.txt`. El rationale documentado es que cuantizar tambien las convoluciones degrada notablemente la robustez frente a ruido: en su conjunto de prueba de habla francesa degradada, la exportacion int8 publica (que si cuantiza convoluciones) duplica aproximadamente la tasa de error de palabra respecto al fp32. El conjunto de evaluacion consta de 58 frases de Google FLEURS `fr_fr` (split de validacion), cada una en 7 variantes (limpia, -20 dB, paso bajo a 3 kHz, ruido rosa a 10 dB, ralentizada, todas combinadas y lejana), totalizando 406 clips, con busqueda greedy y 4 hilos de CPU.

## Capacidades

- Reconocimiento automatico del habla offline (transcripcion de audio a texto) en frances, ingles, aleman, espanol e italiano.
- Decodificacion TDT con emision conjunta de tokens y duraciones, orientada a eficiencia en CPU.
- Robustez declarada frente a habla degradada: ruido de fondo, filtrado de banda, nivel bajo (-20 dB), habla ralentizada y grabaciones lejanas, segun el conjunto de evaluacion del autor.
- Inferencia en CPU sin GPU mediante ONNX Runtime a traves de sherpa-onnx.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento: es exclusivamente un modelo ASR.
- Capacidades multilingues limitadas a los cinco idiomas listados; no se documenta deteccion automatica de idioma ni code-switching.

## Casos de uso

- Transcripcion por lotes de reuniones y entrevistas en entornos sin GPU: el modelo puede procesar ficheros de audio completos en CPU con sherpa-onnx, lo que permite desplegarlo en servidores modestos o en estaciones de trabajo sin acelerador.
- Subtitulado de contenido audiovisual multilingue: al cubrir fr, en, de, es e it, un mismo pipeline puede generar subtitulos para catalogos en esos cinco idiomas, con la ventaja de un unico artefacto de 954 MB.
- Asistentes de voz y dictado en aplicaciones de escritorio o moviles: el formato ONNX int8 y la inferencia en CPU facilitan la integracion en aplicaciones locales con requisitos de privacidad, sin enviar audio a la nube.
- Analisis de llamadas de atencion al cliente: la robustez frente a audio degradado (ruido, banda telefonica) es relevante para grabar y transcribir llamadas con calidad variable; el autor reporta 9,9 % de WER en su conjunto de habla francesa degradada.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de archivos para construir indices de texto consultables en archivos de medios, con throughput razonable en CPU multihilo.
- Preprocesado para pipelines de NLP: convertir audio a texto como paso previo a resumen, clasificacion o extraccion de entidades en aplicaciones de investigacion y prototipado.
- Evaluacion comparativa de cuantizaciones: util como referencia para estudiar el impacto de estrategias de cuantizacion (solo MatMul frente a cuantizacion completa) en la precision ASR sobre habla degradada.

## Benchmarks y rendimiento

El autor publica un unico conjunto de resultados, sobre su test set propio de habla francesa degradada (406 clips, FLEURS `fr_fr` validation, 7 variantes de degradacion, busqueda greedy, 4 hilos de CPU):

| Export | Tamano | WER, habla francesa degradada (406 clips) |
|---|---|---|
| fp32 (`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3`) | 2,55 GB | 9,6 % |
| Esta exportacion int8 | 954 MB | 9,9 % |
| Export int8 publica (`csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8`) | 671 MB | 18,6 % |

No se han publicado en la informacion disponible resultados en benchmarks estandar (LibriSpeech, Common Voice, MLS, etc.) para esta exportacion concreta. No se dispone de datos de latencia ni throughput mas alla de la configuracion de prueba indicada (4 hilos de CPU).

## Requisitos de hardware

- VRAM: no aplica para el caso de uso previsto; el modelo esta disenado para inferencia en CPU mediante ONNX Runtime. En GPU, la memoria necesaria seria del orden del tamano del artefacto (menos de 1 GB para el encoder int8, mas decoder y joiner en fp32), aunque no se documentan requisitos oficiales.
- GPU recomendadas: no disponible; no es el escenario objetivo de esta exportacion.
- CPU: cualquier CPU x86-64 moderna con soporte AVX2 es suficiente; el autor usa 4 hilos en su evaluacion. El tamano de 954 MB permite ejecutarlo en dispositivos con poca RAM.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos ~1-2 GB de memoria libre, aunque el despliegue natural es en CPU.
- Opciones de despliegue: sherpa-onnx (libreria nativa y bindings de Python), ONNX Runtime directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a modelos ASR de este tipo.
- Latencia y throughput: no disponibles de forma cuantificada; la unica referencia es la configuracion de evaluacion (busqueda greedy, 4 hilos de CPU) sin tiempos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato / tamano | WER habla francesa degradada (test del autor) | Licencia |
|---|---|---|---|---|---|
| Esta exportacion (SchumiPres int8) | ~0,6B | fr, en, de, es, it | ONNX, 954 MB | 9,9 % | CC BY 4.0 |
| `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3` (fp32) | ~0,6B | fr, en, de, es, it | ONNX, 2,55 GB | 9,6 % | CC BY 4.0 |
| `csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8` (int8 publica) | ~0,6B | fr, en, de, es, it | ONNX, 671 MB | 18,6 % | CC BY 4.0 |
| Whisper (variantes de tamano comparable) | no disponible en la informacion proporcionada | multilingue | no disponible | no disponible | MIT (modelo original de OpenAI) |

La comparativa se limita a las tres exportaciones del mismo modelo base documentadas en la model card. No se dispone de datos de benchmarks que permitan comparar con alternativas de otros autores (Whisper, wav2vec 2.0, Canary, etc.) en igualdad de condiciones.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR: no genera texto libre, no razona, no soporta tool calling ni agentes.
- El conjunto de evaluacion del autor es reducido (58 frases, 406 clips) y se limita al frances; los resultados de robustez no estan validados en ingles, aleman, espanol o italiano.
- No se han publicado resultados en benchmarks estandar, por lo que el rendimiento absoluto en condiciones reales no esta cuantificado de forma independiente.
- La cuantizacion int8 puede degradar la precision en dominios no cubiertos por el test del autor (acentos, jerga, audio musical, solapamiento de hablantes); no hay evaluacion al respecto.
- Riesgo de alucinacion y de omision de palabras en audio muy degradado, inherente a los modelos ASR; el autor documenta que la exportacion int8 publica "pierde palabras" en habla degradada, lo que ilustra la sensibilidad de estas variantes.
- Licencia CC BY 4.0: permite uso comercial con atribucion a NVIDIA (modelo original) y al autor de la cuantizacion; es necesario conservar la atribucion y el aviso de licencia.
- El modelo base es de NVIDIA y el export ONNX es del proyecto sherpa-onnx (k2-fsa); esta ficha es una derivacion de terceros (SchumiPres) sin validacion oficial por parte de NVIDIA ni de k2-fsa.
- Sin garantias de soporte ni mantenimiento: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa adopcion y ausencia de comunidad de usuarios.
- No se documenta deteccion de idioma automatica; el uso multilingue requiere conocer o fijar el idioma del audio de antemano.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SchumiPres/parakeet-tdt-0.6b-v3-int8
- Modelo base (NVIDIA): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Export fp32 de referencia en sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3
- Export int8 publica alternativa: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8
- Repositorio sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
