# jodijhouranda/ayata-quran-ctc-v2

## Resumen

ayata-quran-ctc-v2 es un modelo de reconocimiento automatico del habla (ASR) especializado en recitacion coranica, desarrollado por el usuario jodijhouranda y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino (fine-tuning) del modelo HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr, que a su vez deriva de la arquitectura wav2vec2-base de Meta. El modelo resuelve la tarea de transcripcion palabra por palabra de audio recitado del Coran, empleando una cabeza CTC (Connectionist Temporal Classification), tal como indica el sufijo "ctc" en su nombre.

Con 94,4 millones de parametros, es un modelo compacto orientado a inferencia eficiente, incluso en hardware modesto. Su relevancia actual radica en la escasez de herramientas ASR especializadas en recitacion coranica con soporte para despliegue ligero y exportacion a ONNX, lo que facilita su integracion en aplicaciones educativas, herramientas de memorizacion (hifz) y sistemas de verificacion de recitacion.

La informacion publicada por el autor es muy limitada: la model card es la generada automaticamente por el Trainer de Transformers y no incluye descripcion, datos de evaluacion ni resultados de benchmarks. El repositorio tiene un tamano de 2,7 GB y registra 62 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec2 (transformer convolucional + encoder transformer, cabeza CTC) |
| Parametros totales | 94.420.159 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana tipica de wav2vec2 de ~10-30 s por segmento, no confirmada por el autor) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | arabe (recitacion coranica); no declarado explicitamente en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura wav2vec2, un modelo de speech preentrenado de forma auto-supervisada que combina un extractor de caracteristicas convolucional con un encoder transformer, y que en este caso se remata con una cabeza de clasificacion CTC para la transcripcion. El ajuste fino parte del modelo base HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr, ya especializado en reconocimiento palabra por palabra de recitacion coranica, y se entrena sobre un dataset denominado "generator" del que no se ofrece ninguna descripcion ni composicion.

Los hiperparametros documentados en la model card son los siguientes: learning rate de 3e-5, batch size de entrenamiento de 16 con acumulacion de gradientes de 2 pasos (batch efectivo de 32), optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal con 250 pasos de warmup, 3500 pasos de entrenamiento totales, semilla 42 y precision mixta nativa (AMP). El entrenamiento se realizo con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el numero de tokens de audio, la composicion del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se detalla ninguna innovacion tecnica adicional mas alla del ajuste fino del modelo base.

## Capacidades

- Reconocimiento automatico del habla (ASR) sobre audio de recitacion coranica, con salida a nivel de palabra segun el modelo base.
- Transcripcion mediante decodificacion CTC (greedy o beam search, segun la implementacion del usuario).
- Exportacion a ONNX, lo que permite inferencia fuera del ecosistema PyTorch (ONNX Runtime, navegador, movil).
- Compatibilidad con la libreria transformers y con endpoints de Hugging Face (tag endpoints_compatible).
- Especializacion linguistica en arabe coranico; no se declaran capacidades multilingues generales.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio mas alla del ASR.

## Casos de uso

- Herramientas de memorizacion del Coran (hifz): el modelo transcribe la recitacion del estudiante palabra por palabra para compararla con el texto canonico y detectar errores u omisiones, aprovechando su especializacion en recitacion coranica.
- Verificacion de recitacion en aplicaciones moviles: gracias a su tamano reducido (94 M de parametros) y a la exportacion ONNX, puede ejecutarse en dispositivos con recursos limitados sin conexion.
- Generacion de subtitulos sincronizados para grabaciones de recitacion: la salida CTC a nivel de palabra permite alinear el audio con el texto para producir subtitulos o transcripciones temporizadas.
- Investigacion en procesamiento de habla arabe: sirve como punto de partida para experimentos de ajuste fino o comparacion de arquitecturas ASR en dominio religioso.
- Indexacion y busqueda de audio coranico: transcribir archivos de recitacion permite construir indices de texto buscables sobre bibliotecas de audio.
- Sistemas de evaluacion educativa automatizada: integrado en plataformas de ensenanza, puede puntuar la pronunciacion y fluidez de los alumnos comparando la transcripcion con la referencia.
- Prototipado rapido de pipelines ASR: al ser compatible con transformers y ONNX, se puede desplegar en servicios de inferencia sencillos para validar productos antes de invertir en modelos mayores.

## Benchmarks y rendimiento

El model-index del autor declara una entrada para ayata-quran-ctc-v2 con la lista de resultados vacia. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,4 GB solo para pesos (94,4 M de parametros), con overhead adicional de activaciones y buffers segun la longitud del audio.
- VRAM estimada en fp16: aproximadamente 0,2 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer (GTX 1060 6 GB, RTX 3060, RTX 4090) e incluso en CPU para audios cortos.
- GPU recomendadas para produccion con alta concurrencia: A100, H100 o L4; para desarrollo, cualquier GPU con al menos 2 GB de VRAM.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime (pesos ONNX incluidos), y potencialmente servidores compatibles con modelos transformers; no se documenta soporte especifico de vLLM, TGI o llama.cpp.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (audio) | Benchmarks publicados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayata-quran-ctc-v2 | 94,4 M | no disponible | ninguno | Apache 2.0 | Hugging Face (safetensors + ONNX) |
| HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr (modelo base) | ~94 M (wav2vec2-base) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |
| wav2vec2-base (Meta, original) | 95 M | ventana de audio de ~10-30 s segun configuracion | WER en LibriSpeech documentado en el paper original (no verificado aqui) | Apache 2.0 | Hugging Face |

La comparacion con alternativas especializadas en recitacion coranica mas alla del modelo base no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card es la generada automaticamente por el Trainer y no documenta el dataset de entrenamiento ("generator"), por lo que se desconoce la composicion, calidad y cobertura del mismo.
- No se han publicado metricas de evaluacion (WER, CER) ni resultados de benchmarks, lo que impide valorar su calidad objetiva frente al modelo base.
- Al ser un ajuste fino sobre un modelo ya especializado, puede heredar sesgos y limitaciones del modelo base, incluyendo posibles sesgos en la representacion de estilos de recitacion (tajwid, qira'at) no cubiertos en los datos.
- Riesgo de alucinacion en la transcripcion: la decodificacion CTC puede producir palabras incorrectas o fusiones en audio con ruido, solapamiento de voces o recitacion no canonica.
- El modelo esta especializado en arabe coranico; no se declara soporte para arabe conversacional ni otros idiomas, y su uso fuera de dominio probablemente degrade gravemente el rendimiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni documentacion sobre el origen de los datos de entrenamiento, lo que conviene verificar antes de un despliegue en produccion.
- No se documentan limitaciones de longitud de audio; wav2vec2 suele requerir segmentacion de audios largos, pero el autor no lo especifica.
- El repositorio tiene un tamano de 2,7 GB, superior al esperado solo para los pesos safetensors, presumiblemente por incluir tambien los pesos ONNX; conviene revisar los archivos antes de la descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jodijhouranda/ayata-quran-ctc-v2
- Modelo base: https://huggingface.co/HamzaSidhu786/wav2vec2-base-word-by-word-quran-asr
- Paper original de wav2vec2 (Meta AI): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada
