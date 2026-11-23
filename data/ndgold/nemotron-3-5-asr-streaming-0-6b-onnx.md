# ndgold/nemotron-3.5-asr-streaming-0.6b-onnx

## Resumen

Nemotron 3.5 ASR Streaming 0.6B en formato int8 ONNX es un paquete de inferencia para reconocimiento automatico del habla (ASR) en streaming, publicado por el usuario `ndgold` como espejo (mirror) byte a byte del paquete usado por la aplicacion Live Linguist para subtitulado en directo en dispositivo. No se trata de un modelo entrenado por el autor del repositorio, sino de una conversion a ONNX int8 del modelo NVIDIA Nemotron 3.5 ASR Streaming 0.6B, generada con el tooling de sherpa-onnx (Apache-2.0). El repositorio ocupa 0.7 GB y contiene unicamente los artefactos de inferencia: encoder, decoder y joiner en int8 ONNX, mas el vocabulario `tokens.txt`.

El modelo cubre 40 pares idioma-region, de los cuales 32 transcriben de forma nativa sin ajuste adicional; la aplicacion selecciona el idioma por flujo de audio. La arquitectura subyacente es un modelo transducer (encoder-decoder-joiner), tipico de los sistemas ASR en streaming de la familia Nemotron/NeMo, con un total de aproximadamente 0.6 mil millones de parametros segun indica el nombre del modelo.

Su relevancia practica radica en que ofrece un paquete ONNX int8 autocontenido (682.215.356 bytes en total) pensado para ejecucion on-device con baja latencia y verificacion por SHA-256 en el catalogo de modelos de la aplicacion, lo que facilita despliegues reproducibles en entornos de subtitulado en tiempo real. La informacion publica disponible es escasa: no hay pipeline declarado, ni benchmarks, ni detalles de entrenamiento en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer ASR (encoder-decoder-joiner) en streaming, exportado a ONNX int8 |
| Parametros totales | 0.6B (segun denominacion del modelo; no se detalla desglose) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (unica variante publicada en este repo) |
| Idiomas soportados | 40 pares idioma-region; 32 con transcripcion nativa out-of-the-box |
| Licencia | NVIDIA Open Model License (OpenMDW-1.1) para los pesos; tooling de conversion sherpa-onnx bajo Apache-2.0 |
| Formato de pesos | ONNX int8 (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por la denominacion y el conjunto de ficheros (`encoder`, `decoder`, `joiner`) se trata de un modelo transducer para ASR en streaming, con codificacion incremental del audio y decodificacion conjunta mediante un joiner. El paquete publicado es exclusivamente de inferencia: no incluye scripts de entrenamiento ni pesos en precision completa.

No se dispone de informacion sobre volumen de datos de entrenamiento, composicion del corpus, tecnicas de alineacion o ajuste (RLHF/DPO no aplica a un ASR puro), ni innovaciones tecnicas especificas mas alla del propio formato de despliegue. La conversion a int8 ONNX fue realizada por sherpa-onnx, y los ficheros se declaran byte-identicos al release `asr-models` de sherpa-onnx, verificados por SHA-256 en el catalogo de la aplicacion Live Linguist.

## Capacidades

- Transcripcion de voz a texto en streaming (subtitulado en directo) con baja latencia, disenada para ejecucion on-device.
- Cobertura de 40 pares idioma-region, con 32 idiomas que transcriben de forma nativa sin ajuste adicional.
- Seleccion de idioma por flujo de audio en la aplicacion anfitriona.
- Inferencia en CPU mediante runtime ONNX (sherpa-onnx), sin requerir GPU.
- Verificacion de integridad por SHA-256 de cada artefacto.
- Capacidades de vision, audio generativo, tool calling o razonamiento multi-paso: no disponibles (es un modelo ASR).

## Casos de uso

- Subtitulado en directo en escritorio: integrado en la aplicacion Live Linguist mediante sherpa-onnx, el modelo transcribe audio en streaming y genera leyendas en tiempo real con el encoder int8 de 657 MB, apto para equipos sin GPU dedicada.
- Reuniones y videoconferencias transcritas localmente: al ejecutarse on-device, el audio no sale del equipo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Accesibilidad para personas con discapacidad auditiva: generacion de subtitulos en vivo en multiples idiomas (hasta 32 nativos) sobre una unica instalacion de modelo.
- Notas de voz y dictado multilingue: transcripcion por lotes de grabaciones cortas en aplicaciones de productividad, seleccionando el locale por fichero.
- Transcripcion de contenido multimedia offline: procesado de podcasts o videos en local sin depender de servicios en la nube, con un paquete de 0.7 GB facilmente distribuible.
- Integracion en pipelines de CI/CD para validacion de ASR: el paquete ONNX reproducible y verificado por hash permite pruebas de regresion deterministas de la capa de reconocimiento de voz.
- Kioscos y dispositivos embebidos: la cuantizacion int8 y el runtime ONNX facilitan el despliegue en hardware modesto para comandos de voz o transcripcion puntual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona "560 ms" en el titulo, sin especificar si corresponde a latencia, tamano de chunk o ventana de streaming, por lo que no se presenta como metrica de rendimiento verificada.

## Requisitos de hardware

- VRAM estimada: no aplica en el modo previsto (inferencia ONNX en CPU); en GPU, el paquete int8 ocupa aproximadamente 0.68 GB en disco y un consumo de memoria del orden de ese tamano mas overhead del runtime (estimacion, no confirmada por el autor).
- GPU recomendadas: no disponibles; el paquete esta orientado a ejecucion on-device, presumiblemente en CPU.
- Cabe en GPU consumer: si, por tamano (0.6B int8), aunque no se documenta soporte GPU especifico.
- Opciones de despliegue: sherpa-onnx (runtime de referencia); otros runtimes ONNX no estan documentados en la model card.
- Latencia y throughput: no disponibles; el "560 ms" del titulo no se explica en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (este repo) | 0.6B | no disponible | 40 locales (32 nativos) | OpenMDW-1.1 | ONNX int8 |
| Whisper (variantes small/medium) | 244M / 769M | 30 s de audio | ~99 idiomas | MIT (segun variante) | safetensors, GGUF, ONNX |
| Alternativas ASR en streaming de sherpa-onnx | no disponible | no disponible | no disponible | variable | ONNX |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se documentan sesgos conocidos del modelo ni del corpus de entrenamiento.
- Riesgo de alucinacion y errores de transcripcion inherente a los sistemas ASR; no cuantificado en la informacion disponible.
- Solo 32 de los 40 locales transcriben de forma nativa; el resto requiere mecanismos adicionales no especificados.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la model card no detalla restricciones adicionales.
- El repositorio es un mirror de terceros: el autor advierte de que los ficheros no deben editarse y que su integridad se verifica por SHA-256; cualquier modificacion invalida la verificacion.
- No hay informacion sobre el pipeline declarado, idiomas en metadatos ni benchmarks, lo que limita la evaluacion previa a produccion.
- El "560 ms" del titulo no esta definido; no debe interpretarse como latencia garantizada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ndgold/nemotron-3.5-asr-streaming-0.6b-onnx
- Aplicacion Live Linguist: https://github.com/ngoldbla/livelinguist-pc
- Licencia NVIDIA Open Model License (OpenMDW-1.1): https://openmdw.ai/license/1-1/
- Tooling sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
