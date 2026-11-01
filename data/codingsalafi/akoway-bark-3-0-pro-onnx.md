# codingSalafi/akoway-bark-3.0-pro-onnx

## Resumen

Akoway Bark 3.0 Pro ONNX es una conversion al formato ONNX del modelo de reconocimiento automatico del habla ConwayResearch/Underdog-Bark-3.0-Pro, publicada por el desarrollador codingSalafi para su uso dentro de Akoway, un teclado por voz gratuito y offline para Windows. El modelo resuelve la transcripcion de audio a texto en ingles sobre CPU, sin necesidad de GPU ni de conexion a internet, y esta empaquetado en cuatro grafos ONNX (preprocesador, encoder, decoder y joiner) mas un vocabulario SentencePiece.

La relevancia de esta ficha no esta en el modelo base, sino en el proceso de cuantizacion y exportacion: el autor demuestra que una conversion a ONNX con pesos MatMul en int8 mantiene exactamente el WER de la referencia en fp32 (4,00 % sobre 73 clips de LibriSpeech clean), mientras que cuantizar todas las capas a int8 lo degrada hasta el 4,70 %. Es, por tanto, un caso practico de cuantizacion selectiva para ASR en produccion.

Arquitectonicamente hereda el diseno de NVIDIA Parakeet TDT 0.6B v3: encoder FastConformer, red de prediccion LSTM y decodificacion TDT (Token-and-Duration Transductive) voraz. El repositorio ocupa 0,9 GB y solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + LSTM (prediction network) + joint network, decodificacion TDT |
| Parametros totales | no disponible (el modelo base se describe como derivado de parakeet-tdt-0.6b-v3, ~0,6 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio no documentada en la informacion proporcionada) |
| Tipos de cuantizacion | int8 en pesos MatMul del encoder; convoluciones en fp32; decoder y joiner en fp32 |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (preprocessor.onnx, encoder.int8.onnx, decoder.onnx, joiner.onnx) + tokens.txt |

## Arquitectura y entrenamiento

El modelo es una conversion ONNX de Underdog-Bark-3.0-Pro, que a su vez deriva de nvidia/parakeet-tdt-0.6b-v3 (NVIDIA) y moondream/parakeet-ultra (Moondream). La topologia es la clasica de Parakeet TDT: un encoder FastConformer que transforma la onda de 16 kHz en representaciones latentes, una red de prediccion LSTM que consume un token por llamada y una red conjunta (joiner) que produce 8193 logits de vocabulario mas 5 logits de duracion. La decodificacion es TDT voraz con 0,25 s de silencio inicial, replicando el script de referencia de Underdog.

El preprocesador se ha exportado tambien como grafo ONNX: convierte la onda de 16 kHz en caracteristicas log-mel normalizadas de 128 bins con las mismas matematicas que ParakeetFeatureExtractor. El cambio principal respecto al original es la cuantizacion: solo los pesos MatMul del encoder se han pasado a int8 (839 MB), dejando las convoluciones en fp32; el decoder (49 MB) y el joiner (21 MB) permanecen en fp32. No se documenta en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, audio de 16 kHz mono.
- Transcripcion offline sobre CPU mediante ONNX Runtime, sin dependencia de red.
- Decodificacion TDT con prediccion conjunta de token y duracion, lo que reduce el numero de pasos frente a CTC.
- Integracion como teclado por voz: dictado en cualquier aplicacion de Windows a traves de Akoway.
- Preprocesado de audio embebido como grafo ONNX (no requiere una libreria externa de features).
- No soporta tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.
- No dispone de modo thinking ni de capacidades multimodales.

## Casos de uso

- Dictado por voz en Windows: Akoway descarga los ficheros en el primer arranque y ejecuta la inferencia en CPU con ONNX Runtime, permitiendo escribir en cualquier campo de texto sin enviar audio a la nube.
- Transcripcion de reuniones y notas de voz offline: al no requerir GPU ni conexion, encaja en equipos corporativos con restricciones de privacidad donde el audio no puede salir del dispositivo.
- Subtitulado local de contenido en ingles: la decodificacion voraz TDT con 0,25 s de silencio inicial facilita el troceado por segmentos y la generacion de subtitulos en tiempo casi real en CPU.
- Asistencia a personas con movilidad reducida: el modelo actua como capa de entrada por voz en herramientas de accesibilidad, sin coste de API y con licencia CC-BY-4.0 que permite redistribucion con atribucion.
- Prototipado de pipelines ASR en entornos sin GPU: sirve como referencia para validar preprocesado log-mel de 128 bins y decodificacion TDT antes de escalar a un despliegue con GPU.
- Evaluacion de tecnicas de cuantizacion: el repositorio documenta que int8 solo en MatMul mantiene el WER y que int8 total lo degrada, lo que lo convierte en un banco de pruebas para estrategias de cuantizacion selectiva en ASR.
- Transcripcion en dispositivos de bajos recursos: con 0,9 GB de repo y ejecucion en CPU, es viable en portatiles sin GPU dedicada.

## Benchmarks y rendimiento

| Metrica | Referencia transformers (fp32) | Estos ficheros ONNX |
|---|---:|---:|
| WER en LibriSpeech clean (73 clips con transcripcion) | 4,00 % | 4,00 % |
| WER con cuantizacion int8 en todas las capas | no disponible | 4,70 % |

La evaluacion se realizo sobre 74 clips de LibriSpeech clean (73 con transcripcion) mas una grabacion de dictado con ruido, en CPU. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la informacion disponible, ya que el modelo es exclusivamente ASR.

## Requisitos de hardware

- Inferencia en CPU con ONNX Runtime; no se documenta soporte GPU en esta conversion.
- VRAM estimada: no aplica para el flujo principal; en caso de ejecutarse en GPU, el encoder int8 de 839 MB mas decoder y joiner requeriria aproximadamente 1 GB de memoria, aunque este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible (el modelo esta disenado para CPU).
- Cabe en cualquier PC consumer: el repo completo ocupa 0,9 GB y el encoder es de 839 MB.
- Opciones de despliegue: ONNX Runtime (flujo oficial de Akoway), con posible uso de otros runtimes compatibles con ONNX; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Akoway Bark 3.0 Pro ONNX | no disponible (~0,6 B por herencia) | no disponible | en | CC-BY-4.0 | ONNX int8/fp32 | Conversion CPU-first, WER 4,00 % en LibriSpeech clean |
| nvidia/parakeet-tdt-0.6b-v3 | ~0,6 B | no disponible | multilingue (segun version) | no disponible | NeMo / safetensors | Modelo base de la cadena; referencia de arquitectura |
| ConwayResearch/Underdog-Bark-3.0-Pro | no disponible | no disponible | en | CC-BY-4.0 | no disponible | Modelo original del que deriva esta conversion |
| moondream/parakeet-ultra | no disponible | no disponible | no disponible | no disponible | no disponible | Ancestro declarado en la cadena de derivacion |

Los datos de los modelos comparables no estan disponibles en la informacion proporcionada mas alla de su mencion como ancestros; no se aportan cifras de rendimiento de esos modelos.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- El WER de referencia (4,00 %) se ha medido sobre LibriSpeech clean, un corpus limpio de lectura; el rendimiento en audio con ruido, acentos o habla espontanea no esta cuantificado (solo se menciona una grabacion ruidosa sin cifra).
- La cuantizacion int8 total degrada el WER al 4,70 %, por lo que modificar la estrategia de cuantizacion del repositorio puede empeorar la precision.
- El modelo esta pensado para el flujo de Akoway con decodificacion TDT voraz y 0,25 s de silencio inicial; otros modos de decodificacion no estan validados.
- Riesgo de alucinacion en pasajes ambiguos o con silencio prolongado, comun en modelos ASR; no cuantificado en la informacion disponible.
- Sesgos: no documentados en la informacion proporcionada.
- Licencia CC-BY-4.0: permite uso comercial y modificacion con atribucion a Conway Research, NVIDIA y Moondream; es obligatorio conservar LICENSE-NOTICE.txt.
- No es un modelo de lenguaje: no admite tool calling, agentes ni generacion de texto libre.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.

## Enlaces

- HuggingFace: https://huggingface.co/codingSalafi/akoway-bark-3.0-pro-onnx
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Repositorio de Akoway: https://github.com/codingSalafi/akoway
- Script de comparacion ONNX: https://github.com/codingSalafi/akoway/tree/main/tools/bark-onnx
- Ancestro NVIDIA: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Ancestro Moondream: https://huggingface.co/moondream/parakeet-ultra
