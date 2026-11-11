# Odeyfox/quivra-cohere-transcribe-arabic-int8

## Resumen

quivra-cohere-transcribe-arabic-int8 es una conversion a ONNX con cuantizacion int8 de CohereLabs/cohere-transcribe-arabic-07-2026, un modelo de reconocimiento automatico del habla (ASR) especializado en arabe y en situaciones de code-switching arabe-ingles. La conversion la firma Odeyfox (Fox Labs) y esta empaquetada para sherpa-onnx, el runtime de inferencia de k2-fsa orientado a despliegues ligeros en produccion y en dispositivos. El modelo base lo desarrolla CohereLabs y se distribuye bajo licencia Apache 2.0.

El objetivo de esta version es ofrecer un artefacto listo para desplegar con sherpa-onnx, con el mismo diseno de ficheros y la misma interfaz que la conversion oficial de sherpa-onnx del modelo base de 14 idiomas. El repositorio ocupa 2,8 GB e incluye tres piezas: un encoder Conformer en int8 que emite las claves y valores de cross-attention para el decoder, un decoder int8 con cache KV de self-attention y el vocabulario en `tokens.txt`, identico al del modelo base.

Su relevancia practica esta en el nicho: ASR para arabe con mezcla de ingles, cuantizado a int8 y ejecutable en el runtime sherpa-onnx. Esto permite integrar transcripcion en aplicaciones de dictado (el caso declarado es la app Quivra) sin depender de GPUs ni de infraestructura pesada. La informacion publicada no detalla parametros, contexto ni datos de entrenamiento del modelo base, por lo que varios apartados de esta ficha quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder Conformer + decoder con cross-attention y cache KV de self-attention (tipo de modelo "Cohere Transcribe" en sherpa-onnx) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinamico de ONNX Runtime (pesos de MatMul); el modelo base admite otras cuantizaciones no documentadas aqui |
| Idiomas soportados | arabe (ar) e ingles (en), con soporte de code-switching arabe-ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `encoder.int8.onnx.data`, `decoder.int8.onnx`) + `tokens.txt` |
| Tamano del repositorio | 2,8 GB |
| Runtime / libreria | sherpa-onnx |
| Modelo base | CohereLabs/cohere-transcribe-arabic-07-2026 |
| Tarea | automatic-speech-recognition (ASR) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema encoder-decoder de los modelos de transcripcion tipo Conformer: el encoder procesa la señal acustica y genera las representaciones que el decoder consume mediante cross-attention, mientras el decoder mantiene una cache KV de self-attention para la generacion autorregresiva de tokens. En esta conversion, el encoder emite explicitamente las claves y valores de cross-attention que necesita el decoder, y ambos componentes se han cuantizado a int8 con la cuantizacion dinamica de ONNX Runtime aplicada a los pesos de las operaciones MatMul. La conversion altera el formato numerico de los pesos, no la arquitectura ni el comportamiento del modelo.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus, el uso de RLHF o DPO, ni innovaciones tecnicas del modelo base mas alla de su especializacion en arabe y code-switching. El autor indica que el vocabulario es identico al del modelo base y que la interfaz y el diseno de ficheros replican la conversion oficial de sherpa-onnx del modelo de 14 idiomas, lo que facilita sustituir un artefacto por otro en un pipeline existente.

## Capacidades

- Transcripcion de voz a texto en arabe, con soporte de palabras en ingles intercaladas (code-switching arabe-ingles).
- Reconocimiento en ingles dentro de un contexto predominantemente arabe.
- Seleccion explicita de idioma: el autor recomienda indicar `ar` al modelo para obtener el mejor comportamiento.
- Ejecucion en el runtime sherpa-onnx, con despliegue en CPU y en dispositivos de recursos limitados gracias a la cuantizacion int8.
- Interfaz compatible con la conversion oficial de sherpa-onnx del modelo base multilingue de 14 idiomas.
- No se documentan capacidades de tool calling, agentes, vision, audio mas alla de ASR, thinking mode ni razonamiento multi-paso; se trata de un modelo puramente de reconocimiento del habla.

## Casos de uso

- Aplicaciones de dictado por voz en arabe: el modelo esta pensado para la app Quivra, de modo que puede transcribir dictado continuo en movil o escritorio con un runtime ligero como sherpa-onnx y pesos int8 que reducen el consumo de memoria.
- Subtitulado y transcripcion de reuniones con hablantes arabes que intercalan terminos tecnicos en ingles: el soporte de code-switching evita tener que cambiar de modelo a mitad de la transcripcion.
- Asistentes de voz y comandos hablados en productos para el mundo arabe: la inferencia en CPU con ONNX permite integrar ASR en aplicaciones de escritorio o embebidas sin GPU.
- Transcripcion de contenido audiovisual (podcasts, videos, clases) en arabe para generar subtitulos o indices de busqueda, con un postprocesado que normalice las palabras inglesas escritas en caracteres arabes.
- Digitalizacion de notas de voz y entrevistas en entornos con recursos limitados: el tamano de 2,8 GB y la cuantizacion int8 permiten desplegarlo en servidores modestos o en el borde.
- Prototipado rapido de pipelines ASR en sherpa-onnx: al compartir interfaz con la conversion oficial del modelo base de 14 idiomas, sirve para comparar el rendimiento especializado en arabe frente al modelo multilingue sin cambiar de integracion.
- Sistemas de atencion al cliente por voz en arabe: la transcripcion en tiempo real con un runtime optimizado facilita alimentar analisis de intencion o registros de conversacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; al ser un modelo ONNX int8 ejecutable en CPU, no requiere GPU para funcionar. El repositorio ocupa 2,8 GB, por lo que se necesita al menos ese espacio en disco y una cantidad de RAM del orden de varios GB para cargar encoder y decoder.
- GPU recomendadas: no disponibles; el autor no publica requisitos de GPU. El runtime sherpa-onnx esta orientado a CPU y a despliegues ligeros.
- Compatibilidad con GPU de consumo: no documentada. Al no requerir GPU, el modelo puede ejecutarse en equipos sin tarjeta grafica; no hay datos sobre aceleracion en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: sherpa-onnx (runtime nativo para el que esta empaquetado). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo ASR de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| quivra-cohere-transcribe-arabic-int8 | no disponible | no disponible | ar, en | Apache 2.0 | ONNX int8 (sherpa-onnx) | Conversion especializada en arabe del modelo Cohere Transcribe |
| CohereLabs/cohere-transcribe-arabic-07-2026 | no disponible | no disponible | ar, en | Apache 2.0 | no disponible | Modelo base original; esta conversion deriva de el |
| Conversion oficial de sherpa-onnx del modelo base de 14 idiomas | no disponible | no disponible | 14 idiomas | no disponible | ONNX (sherpa-onnx) | Misma interfaz y diseno de ficheros; cobertura mas amplia de idiomas, sin especializacion declarada en arabe |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparados, por lo que la comparacion se limita a licencia, idiomas, formato y relacion de derivacion.

## Limitaciones y advertencias

- El autor advierte que las palabras en ingles pronunciadas dentro de arabe suelen transcribirse con caracteres arabes; se recomienda un paso de postprocesado para normalizarlas.
- Es necesario indicar el idioma (`ar`) al modelo para obtener el comportamiento esperado; no se documenta deteccion automatica de idioma.
- La cuantizacion int8 dinamica puede introducir una perdida de precision frente al modelo base en float; no se publican metricas que cuantifiquen esa degradacion.
- No hay informacion publicada sobre sesgos, tasas de alucinacion o errores en acentos y dialectos arabes concretos.
- La cobertura linguistica se limita a arabe e ingles; no sirve para otros idiomas.
- El repositorio no tiene descargas ni likes y fue creado y actualizado el mismo dia, por lo que no hay evidencia publica de validacion por terceros.
- Licencia Apache 2.0: permite uso comercial con atribucion y conservacion del aviso de licencia; el autor pide mantener los terminos originales de Cohere.
- Para produccion conviene validar el modelo con un conjunto propio de audio arabe real, dado que no existen benchmarks publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Odeyfox/quivra-cohere-transcribe-arabic-int8
- Modelo base: https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
