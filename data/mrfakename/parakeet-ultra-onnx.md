# mrfakename/parakeet-ultra-ONNX

## Resumen

parakeet-ultra-ONNX es una exportación a ONNX del modelo de reconocimiento automático de voz (ASR) moondream/parakeet-ultra, un sistema de 627 millones de parámetros basado en la arquitectura Parakeet TDT (token-and-duration transducer) de NVIDIA, concretamente sobre parakeet-tdt-0.6b-v3. Lo publica el usuario mrfakename y su objetivo principal es ejecutar transcripción de voz directamente en el navegador mediante onnxruntime-web con el proveedor de ejecución WebGPU.

La aportación de esta ficha no es un modelo nuevo, sino una conversión optimizada: el encoder se reescribe para sustituir convoluciones pointwise 1x1 por MatMul y se cuantiza en 4 y 8 bits (MatMulNBits), el decoder y el joint se exportan en int8 dinámico, y el preprocesador (frontend log-mel de 128 bins estilo NeMo) se ajusta para que la STFT use float32 en lugar de float64 y sea compatible con onnxruntime-web.

Es relevante ahora porque permite desplegar ASR multilingüe de calidad sobre GPUs de consumo e incluso integradas mediante WebGPU, sin depender de infraestructura de servidor, con artefactos que van de 393 MB (encoder q4) a 650 MB (encoder q8) y un decoder int8, y con una degradación de WER mínima respecto a fp32 en las pruebas publicadas. Soporta 25 lenguas europeas y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | NeMo Conformer TDT (token-and-duration transducer), encoder Conformer + decoder/joint TDT |
| Parametros totales | 627 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; la longitud depende de la señal de audio de entrada) |
| Tipos de cuantizacion | Encoder: fp32, q8 (MatMulNBits, bloque 64), q4 (MatMulNBits RTN, bloque 32, asimetrico). Decoder/joint: fp32 e int8 dinamico |
| Idiomas soportados | 25 lenguas europeas (segun la model card del modelo base) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (onnxruntime / onnxruntime-web) |
| Tamano del repo | 3,4 GB |
| Dimension de entrada del encoder | features [1,128,T] (128 bins log-mel) |
| Dimension de salida del encoder | outputs [1,1024,T/8] |
| Vocabulario del decoder | 8193 tokens (blank = 8192) + 5 logits de duracion (0-4) |
| Submuestreo temporal | factor 8 |

## Arquitectura y entrenamiento

El modelo base es un Parakeet TDT de NVIDIA, una arquitectura transducer que combina un encoder Conformer con un decoder y un joint entrenados con el objetivo token-and-duration. La señal de entrada es audio mono a 16 kHz convertido a features log-mel de 128 bins mediante el frontend preprocessor. El encoder aplica un submuestreo temporal de factor 8 (T -> T/8) y produce representaciones de 1024 dimensiones. El decoder/joint genera, en cada paso, 8193 logits de token mas 5 logits de duracion (0 a 4), lo que permite al modelo predecir simultaneamente el token y cuantos frames avanza, una caracteristica propia de los transductores TDT.

Esta ficha concreta no incluye datos de entrenamiento propios: es una exportación del modelo base moondream/parakeet-ultra, que a su vez deriva de parakeet-tdt-0.6b-v3 de NVIDIA. Por tanto, no se dispone de informacion sobre volumen de tokens de audio, composicion del dataset, ni si se aplicaron etapas de RLHF/DPO (no aplicables habitualmente a ASR). La innovacion tecnica destacable esta en la conversion a ONNX: reescritura de convoluciones pointwise 1x1 como MatMul para permitir MatMulNBits, cuantizacion a 4 y 8 bits con RTN (bloque 32 asimetrico y bloque 64 respectivamente), decoder/joint en int8 dinamico, y ajuste del preprocesador para que la STFT use float32 en lugar de float64 (diferencia maxima absoluta de 2e-5 frente al original). El resultado se ejecuta en el proveedor WebGPU de onnxruntime-web.

## Capacidades

- Reconocimiento automatico de voz (ASR) en tiempo casi real sobre audio mono a 16 kHz.
- Transcripcion multilingue en 25 lenguas europeas segun el modelo base.
- Decodificacion TDT con prediccion conjunta de token y duracion, lo que permite saltos de frames variables.
- Ejecucion en navegador mediante WebGPU (onnxruntime-web) y en CPU mediante onnxruntime.
- Inferencia con cuantizacion de 4 y 8 bits manteniendo el WER cercano al de fp32.
- Incluye frontend log-mel (128 bins) empaquetado como grafo ONNX, sin dependencias externas de extraccion de features.
- No dispone de tool calling ni de capacidades de agente: es un modelo puramente de transcripcion, no generativo de texto libre.
- No tiene modo thinking, vision ni audio de salida.

## Casos de uso

- Transcripcion en el navegador sin servidor: gracias al encoder q4 de 393 MB y la ejecucion en WebGPU, se puede integrar dictado o subtitulado en una aplicacion web sin enviar el audio a un backend, lo que reduce latencia y mejora la privacidad.
- Subtitulado automatico de video: el modelo convierte pistas de audio a texto para generar subtitulos en 25 lenguas europeas, con la ventaja de ejecutarse en cliente sobre la propia GPU del usuario.
- Asistentes de voz locales: la salida TDT token+duracion facilita la transcripcion incremental en streaming, util para interfaces de voz que necesitan texto parcial con baja latencia.
- Accesibilidad y dictado: aplicaciones de escritorio o web que ofrecen entrada por voz para personas con movilidad reducida, ejecutando el modelo en local con int8 o q8 segun el equilibrio entre memoria y precision.
- Analitica de llamadas y reuniones: procesamiento por lotes con onnxruntime en CPU para transcribir grabaciones largas, aprovechando el frontend log-mel integrado y el submuestreo 8x del encoder.
- Investigacion en ASR multilingue: al ser una exportacion ONNX reproducible y de licencia permisiva, sirve como banco de pruebas para comparar variantes de cuantizacion (q4, q8, fp32) sobre el mismo pipeline.
- Integracion en pipelines de CI/CD de datos de voz: transcripcion por lotes en servidores sin GPU dedicada mediante onnxruntime CPU con el decoder int8.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card del exportador, medidos sobre 23 clips (JFK, LibriSpeech test-clean y MLS en de/fr/es/it/nl/pt/pl) con decodificacion TDT greedy en onnxruntime CPU. El propio autor advierte que el conjunto de prueba es pequeno y que diferencias por debajo de ~0,5 WER son ruido.

| Encoder | Decoder | WER en | WER MLS | Coseno del encoder vs fp32 |
|---|---|---|---|---|
| fp32 | fp32 | 3,56 | 4,73 | 1,0 |
| fp32 | int8 | 3,91 | 4,50 | 1,0 |
| q8 | fp32 | 3,56 | 4,95 | 0,9996 |
| q4 (rtn, b32, asim) | fp32 | 3,20 | 4,50 | 0,977 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval o GSM8K (no aplicables a un modelo ASR), ni comparativas WER frente a otros sistemas ASR.

## Requisitos de hardware

- Encoder q4: 393 MB de artefacto; encoder q8: 650 MB; decoder/joint int8 y fp32 adicionales; el repositorio completo ocupa 3,4 GB.
- Con la variante q4 + decoder int8, la huella de memoria en tiempo de ejecucion se mantiene por debajo de ~1 GB, lo que permite ejecucion en navegador y en dispositivos de gama media.
- GPU recomendadas: cualquier GPU con soporte WebGPU en navegador (integradas modernas, RTX 4090 y superiores). En servidor, A100 o H100 no son necesarias por el tamano del modelo, pero funcionan sin problema con onnxruntime.
- Cabe en GPU de consumo: si. La variante q4 esta pensada precisamente para GPUs de consumo y graficos integrados compatibles con WebGPU.
- Opciones de despliegue: onnxruntime-web (WebGPU y WASM), onnxruntime CPU, y transformers.js. La demo de referencia es el Space parakeet-redux-webgpu.
- Latencia y throughput estimados: no disponibles. No se publican cifras de RTF ni de velocidad de inferencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrfakename/parakeet-ultra-ONNX | 627 M | 25 lenguas europeas | CC-BY-4.0 | ONNX (fp32/q8/q4/int8) | Optimizado para WebGPU en navegador; WER de referencia en la model card |
| moondream/parakeet-ultra | 627 M | 25 lenguas europeas | CC-BY-4.0 | safetensors (formato original NeMo) | Modelo base del que deriva esta exportacion |
| NVIDIA parakeet-tdt-0.6b-v3 | ~600 M | no disponible en la informacion | CC-BY-4.0 | NeMo / safetensors | Origen arquitectonico de la familia Parakeet TDT |
| OpenAI Whisper large-v3 | ~1.550 M | multilingue amplio | MIT | safetensors / GGUF / ONNX | Alternativa ASR de referencia; no se dispone de comparativa WER en esta informacion |

No se dispone de comparativas de WER ni de latencia frente a estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos especificos, pero al ser un modelo entrenado sobre corpus de habla predominantemente europea puede rendir peor en acentos no representados.
- Riesgo de alucinacion: como todo sistema ASR, puede generar texto plausible en segmentos con ruido, silencio o audio degradado.
- El WER publicado se obtuvo sobre solo 23 clips; el propio autor advierte que el conjunto es pequeno y que las diferencias inferiores a ~0,5 WER no son significativas.
- La calidad en lenguas fuera de las 25 europeas no esta garantizada y no se especifica la lista exacta de idiomas en la informacion disponible.
- Requiere audio mono a 16 kHz; otras frecuencias de muestreo o canales multiples necesitan preprocesado previo.
- El soporte WebGPU depende del navegador y del sistema operativo; en entornos sin WebGPU hay que recurrir al backend WASM o a CPU, con menor rendimiento.
- Licencia CC-BY-4.0: permite uso comercial pero exige atribucion al modelo base (moondream/parakeet-ultra) y a NVIDIA parakeet-tdt-0.6b-v3.
- La cuantizacion q4 reduce la similitud coseno del encoder a 0,977 frente a fp32; aunque el WER medido no empeora en la muestra, conviene validar en el dominio objetivo antes de produccion.
- No es un modelo generativo de texto: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mrfakename/parakeet-ultra-ONNX
- Modelo base: https://huggingface.co/moondream/parakeet-ultra
- Exportacion ONNX de referencia (fp32): https://huggingface.co/Olicorne/parakeet-tdt-0.6b-v3-ultra-onnx
- Demo Parakeet Redux WebGPU: https://huggingface.co/spaces/mrfakename/parakeet-redux-webgpu
- Documentacion de onnxruntime-web: https://onnxruntime.ai/docs/tutorials/web/
