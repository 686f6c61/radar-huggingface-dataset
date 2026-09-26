# krut42/voice-parakeet-tdt-110m-en-int8

## Resumen

Este repositorio contiene una copia fichero a fichero de la build ONNX en int8 del modelo de reconocimiento automatico del habla (ASR) *Parakeet TDT-CTC 110M* de NVIDIA, exportada por el proyecto k2-fsa/sherpa-onnx y redistribuida por el usuario krut42. No es un modelo entrenado de cero ni un ajuste fino: es el mismo modelo base, convertido a ONNX y cuantizado dinamicamente a int8, dividido en tres grafos (encoder, decoder y joiner) correspondientes a la cabeza transducer TDT. El autor lo publica porque la aplicacion Android «Слышно» descarga y verifica los ficheros uno a uno, mientras que el proyecto sherpa-onnx solo publica esta build como un unico archivo `.tar.bz2`.

El modelo resuelve transcripcion de voz en ingles sobre dispositivo, sin conexion a red y sin GPU. Con alrededor de 110 millones de parametros en el modelo base (unos 136,5 MB de ficheros ONNX en total), esta pensado para moviles y hardware embebido: las mediciones incluidas en la model card dan un factor de tiempo real (RTF) de 0,13-0,30 en SoCs como Snapdragon 835, Helio G85 o Kirin 710, con un pico de memoria residente de 322-374 MB. La salida incluye puntuacion, mayusculas y marcas de tiempo por token, lo que lo hace util para subtitulado y para pipelines que necesitan alineacion temporal.

Su relevancia actual es doble: por un lado, demuestra que un modelo ASR de calidad puede ejecutarse completamente en el borde en hardware de gama media-baja; por otro, es un ejemplo de redistribucion de pesos con licencia permisiva (CC BY 4.0) en un formato (ONNX int8) directamente consumible por runtimes ligeros. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de un espejo practicamente sin uso, no de una publicacion de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (Token-and-Duration Transducer) exportado a ONNX como encoder, decoder y joiner; el modelo base combina cabezas TDT y CTC, pero el export solo incluye la cabeza transducer |
| Parametros totales | 110 M (modelo base); los ficheros int8 suman ~136,5 MB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de un LLM; es un reconocedor offline que procesa el enunciado completo (las mediciones se hicieron con fragmentos de 25 s) |
| Tipos de cuantizacion | int8 (cuantizacion dinamica aplicada durante la exportacion a ONNX) |
| Idiomas soportados | ingles (`en`) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX int8: `encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx` |
| Tamano del encoder | 131.113.202 bytes (sha256 `0f35509d...11d657`) |
| Tamano del decoder | 3.955.863 bytes (sha256 `f7c331c5...1da19`) |
| Tamano del joiner | 1.411.403 bytes (sha256 `bf7dff69...c782f6`) |
| Vocabulario | `tokens.txt`, 9.953 bytes |
| Entrada de audio | 16 kHz mono, caracteristicas de 80 dimensiones |
| Salida | texto con puntuacion y mayusculas, con marcas de tiempo por token |
| Runtime | sherpa-onnx 1.13.8 (tipo de modelo `nemo_transducer`, `OfflineRecognizer`) |
| Modelo base | nvidia/parakeet-tdt_ctc-110m |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base es un transducer de la familia Parakeet de NVIDIA con 110 millones de parametros. Un transducer combina un encoder acustico, un decoder o predictor y una red joiner que produce la distribucion conjunta sobre tokens y, en la variante TDT (*Token-and-Duration Transducer*), tambien sobre la duracion de cada emision. Esta ultima innovacion permite que el decoder emita varios tokens por paso, reduciendo el coste de decodificacion frente a un RNN-T clasico. El nombre `tdt_ctc` del modelo base indica que durante el entrenamiento se optimizaron simultaneamente una cabeza TDT y una cabeza CTC; el export que redistribuye este repositorio conserva unicamente la cabeza TDT, dividida en los tres grafos ONNX. La arquitectura interna del encoder (por ejemplo, si emplea bloques FastConformer) no se detalla en la informacion proporcionada.

No hay datos en la informacion disponible sobre el numero de horas de audio, la composicion del dataset ni el proceso de alineacion o filtrado empleado por NVIDIA para entrenar el modelo base. Tampoco se documenta ningun proceso de ajuste con preferencias humanas (RLHF/DPO), algo que en cualquier caso no aplica a un sistema ASR puro. Los cambios introducidos en esta publicacion son exclusivamente de formato y precision: exportacion a ONNX de los tres componentes del transducer y cuantizacion dinamica a int8 mediante sherpa-onnx, sin modificacion posterior de los ficheros. Como caracteristica practica destacable, el decodificador produce puntuacion, mayusculas y timestamps al nivel de token, y el reconocedor es offline (procesa el audio completo en lugar de emitir resultados en streaming).

## Capacidades

- Reconocimiento de voz en ingles con salida de texto plano, incluyendo puntuacion y capitalizacion automaticas.
- Emision de marcas de tiempo por token, utiles para alineacion, subtitulado y navegacion por el audio.
- Ejecucion completamente offline en CPU, sin acelerador grafico y sin conexion a red.
- Despliegue en movil y embebido: probado en arquitecturas arm64 y armeabi-v7a con 2 GB de RAM.
- Integracion mediante la API `OfflineRecognizer` de sherpa-onnx con configuracion transducer (`model_type = "nemo_transducer"`).
- No se documenta soporte de *tool calling*, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni deteccion de idioma; son capacidades fuera del alcance de un modelo ASR.
- No se documenta traduccion de voz ni diarizacion de hablantes.

## Casos de uso

- **Transcripcion en aplicaciones moviles sin conexion**: es el escenario real para el que se publica esta build; la app descarga los tres ficheros ONNX, los verifica por sha256 y ejecuta la inferencia en el dispositivo con 2 hilos, sin enviar audio a ningun servidor.
- **Dictado de notas de voz con privacidad estricta**: al no requerir red ni GPU, encaja en aplicaciones de productividad o salud donde el audio no puede salir del dispositivo; el coste de memoria medido (322-374 MB de pico) es asumible en moviles de gama media.
- **Subtitulado y alineacion temporal**: los timestamps por token permiten generar subtitulos con sincronizacion aproximada a nivel de palabra, partiendo de fragmentos de audio de unos 25 s.
- **Preprocesado de audio en pipelines de analitica**: transcripcion rapida en CPU para indexar o clasificar grandes volumenes de audio en ingles antes de aplicar etapas mas costosas (busqueda semantica, resumen con un LLM, moderacion).
- **Procesamiento por lotes en servidores sin GPU**: al ser ONNX int8, puede ejecutarse en instancias CPU de bajo coste; el throughput dependera del numero de hilos y del hardware, no documentado en la model card.
- **Integracion en dispositivos embebidos y sistemas empotrados**: con un RTF de 1,06 en un MT6737m (armeabi-v7a, 2 GB de RAM) el modelo sigue siendo funcional para transcripcion diferida, aunque no para tiempo real.
- **Accesibilidad y transcripcion en vivo asistida**: en SoCs de gama media como Snapdragon 835 o Helio G85 (RTF 0,13-0,15) el margen permite transcripcion casi en tiempo real si se segmenta el audio en fragmentos cortos.
- **Prototipado rapido de funciones de voz**: al distribuirse como ficheros ONNX sueltos y no como un archivo comprimido, es sencillo integrarlo en scripts de evaluacion o en pruebas de concepto multiplataforma con sherpa-onnx.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de error de palabra (WER) ni comparaciones de precision con otros modelos, por lo que no es posible evaluar la calidad de transcripcion frente a alternativas.

Las unicas metricas publicadas son de eficiencia, medidas con sherpa-onnx 1.13.8 sobre fragmentos de 25 s con 2 hilos:

| Plataforma | RTF | Pico de memoria residente |
|---|---:|---:|
| Snapdragon 835 | 0,15 | 341 MB |
| Helio G85 | 0,13 | 374 MB |
| Kirin 710 | 0,30 | 341 MB |
| MT6737m (armeabi-v7a, 2 GB RAM) | 1,06 | 322 MB |

Un RTF inferior a 1 indica procesamiento mas rapido que el tiempo real. El valor de 1,06 en el MT6737m implica que ese dispositivo concreto no puede transcribir en tiempo real de forma sostenida.

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia objetivo es en CPU, por lo que la VRAM necesaria es 0 GB.
- Memoria del modelo: los ficheros int8 ocupan aproximadamente 125 MiB (encoder), 3,8 MiB (decoder) y 1,35 MiB (joiner), mas el vocabulario de 9,9 KiB.
- Memoria en ejecucion: pico medido de 322-374 MB de RSS en moviles, con 2 hilos de inferencia.
- GPU recomendadas: no aplica; no se documenta uso de GPU ni latencias sobre aceleradores. Si se ejecutase sobre GPU mediante ONNX Runtime, no hay cifras publicadas en la informacion disponible.
- Cabe en GPU de consumo: si, cualquier GPU de consumo moderna, pero es innecesario; el modelo esta disenado para CPU.
- CPU objetivo: ARM de 64 y 32 bits (arm64 y armeabi-v7a); tambien puede ejecutarse en x86 mediante los binarios de sherpa-onnx.
- Opciones de despliegue: sherpa-onnx (`OfflineRecognizer` con `model_type = "nemo_transducer"`), y en general cualquier runtime capaz de cargar los tres grafos ONNX int8 (ONNX Runtime). No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama, que no aplican a un modelo ASR.
- Latencia y throughput: no se publican cifras de latencia absoluta ni de throughput por lote; el unico dato disponible es el RTF por plataforma recogido en la tabla anterior, que en la practica implica latencias proporcionales a la duracion del audio multiplicada por el RTF.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / uso | Licencia | Formato y disponibilidad |
|---|---:|---|---|---|---|
| krut42/voice-parakeet-tdt-110m-en-int8 (esta ficha) | 110 M (base) | Ingles | ASR offline, audio en fragmentos (medido a 25 s) | CC BY 4.0 | ONNX int8 para sherpa-onnx; redistribucion de terceros |
| nvidia/parakeet-tdt_ctc-110m | 110 M | Ingles | ASR offline en NeMo | CC BY 4.0 | Pesos NeMo originales (no ONNX); mantenido por NVIDIA |
| nvidia/parakeet-tdt-0.6b-v2 | 600 M | Ingles | ASR offline, mayor capacidad | CC BY 4.0 | Pesos NeMo / ONNX en el ecosistema sherpa-onnx |
| openai/whisper-tiny | 39 M | Multilingue (99 idiomas) | ASR offline y por ventanas de 30 s | MIT | Pesos PyTorch y variantes comunitarias en ONNX/GGML |
| openai/whisper-base | 74 M | Multilingue (99 idiomas) | ASR offline y por ventanas de 30 s | MIT | Pesos PyTorch y variantes comunitarias en ONNX/GGML |

No hay datos de rendimiento (WER, RTF comparativo) en la informacion proporcionada que permitan comparar la precision de este modelo con la de las alternativas. Los datos de parametros, idiomas y licencia de los modelos de la tabla corresponden a sus model cards publicas; conviene verificarlos antes de tomar una decision de adopcion.

## Limitaciones y advertencias

- Solo soporta ingles (`en`). No hay soporte multilingue, deteccion de idioma ni traduccion.
- No se publican tasas de error (WER) para esta build int8. La cuantizacion dinamica a int8 puede degradar la precision respecto al modelo base en precision completa, pero no hay datos que cuantifiquen esa perdida.
- Riesgo de alucinacion inherente a los sistemas ASR: ante audio ruidoso, musica o silencios largos, el decoder puede generar texto plausible que no corresponde al audio. No se documentan mecanismos de mitigacion ni umbrales de confianza.
- El reconocedor es offline, no en streaming: la latencia percibida equivale a la duracion del fragmento multiplicada por el RTF, por lo que en hardware antiguo (RTF 1,06) puede superar el tiempo real.
- No hay diarizacion, puntuacion configurable, vocabulario personalizado documentado ni adaptacion a dominio.
- El repositorio es una redistribucion de terceros (usuario krut42), no una publicacion oficial de NVIDIA ni del proyecto sherpa-onnx. Tiene 0 descargas y 0 likes, y no hay garantia de mantenimiento, actualizacion o soporte.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribucion a NVIDIA Corporation (modelo original) y al proyecto k2-fsa/sherpa-onnx (exportacion a ONNX y cuantizacion). Es obligatorio conservar y mostrar dicha atribucion.
- Las marcas de tiempo por token pueden acumular desviacion en audios largos; la model card no especifica la precision de las mismas.
- El vocabulario esta fijado en `tokens.txt`; cualquier modificacion de ese fichero invalida la coherencia con los grafos ONNX y con los hashes publicados.
- La fecha de creacion del repositorio (2026-09-26) y la ausencia de descargas hacen recomendable verificar la integridad de los ficheros mediante los sha256 declarados antes de usarlos en produccion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/krut42/voice-parakeet-tdt-110m-en-int8
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
- Proyecto sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Releases de sherpa-onnx (asset `sherpa-onnx-nemo-parakeet_tdt_transducer_110m-en-36000-int8.tar.bz2`): https://github.com/k2-fsa/sherpa-onnx/releases
