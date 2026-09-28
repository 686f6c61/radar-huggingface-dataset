# coder543/nemotron-3.5-asr-streaming-0.6b-coreai

## Resumen

Nemotron 3.5 ASR Streaming 0.6B Core AI es una conversion del modelo de reconocimiento automatico del habla (ASR) `nvidia/nemotron-3.5-asr-streaming-0.6b` a los formatos nativos de Apple Core AI, publicada por el usuario `coder543`. El modelo original lo desarrolla NVIDIA y esta disenado para transcripcion multilingue en streaming de baja latencia y en modo batch de alto rendimiento, con puntuacion y mayusculas generadas de forma nativa sin postprocesado. Se trata de un modelo de aproximadamente 600 millones de parametros (0,6 B), especializado exclusivamente en voz a texto y no en generacion de texto general.

Lo relevante de este repositorio concreto no es el modelo base, sino el empaquetado: assets `.aimodel` orientados al Neural Engine (ANE) de Apple, con un encoder cuantizado W8A16, subsampling causal en FP16, predictor recurrente en FP16 y grafos de vocabulario. El bundle consume 1,12 segundos de audio nuevo a 16 kHz mono por actualizacion, manteniendo persistentes entre actualizaciones el estado de atencion, convolucion, subsampling y decodificador recurrente, lo que permite transcripcion continua sin recalcular el historial completo.

Esta pensado para dispositivos fisicos con Apple Silicon que ejecuten macOS 27 o iOS 27. No es una aplicacion autonoma ni un modelo Core ML precompilado: el host debe implementar la extraccion continua de caracteristicas, preservar los estados de los grafos y ejecutar la decodificacion voraz recurrente. Su interes practico es que acerca un ASR multilingue de 28 idiomas a la inferencia local en el ANE, con una velocidad medida de 64,1x RTFx sobre un discurso de 18 minutos en un M3 MacBook Air.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No se nombra explicitamente en la informacion disponible; el bundle describe un encoder, un subsampling causal, un predictor recurrente y grafos de vocabulario con decodificacion voraz |
| Parametros totales | Aproximadamente 600 millones (0,6 B), segun el nombre del modelo y la documentacion de NVIDIA |
| Longitud de contexto | No aplica como contexto de texto: ventana de 1,12 s de audio nuevo por actualizacion; se conservan 56 posiciones de historial (`past positions`) de la configuracion oficial de Transformers |
| Tipos de cuantizacion | W8A16 en el encoder de streaming; FP16 en subsampling causal, predictor recurrente y grafos de vocabulario |
| Idiomas soportados | 28 idiomas: arabe, bulgaro, checo, danes, aleman, ingles, espanol, estonio, finlandes, frances, hindi, croata, hungaro, italiano, japones, coreano, noruego bokmal, neerlandes, polaco, portugues, rumano, ruso, eslovaco, sueco, turco, ucraniano, vietnamita y chino |
| Licencia | openmdw-1.1 (el campo `license` del repo figura como `other`, con `license_name: openmdw-1.1`) |
| Formato de pesos | Assets `.aimodel` de Apple Core AI (`metadata.json`, grafos de vocabulario y coeficientes de frontend); no safetensors ni GGUF en este repositorio |
| Tamano del repositorio | 0,7 GB |
| Revision del modelo base | `nvidia/nemotron-3.5-asr-streaming-0.6b`, revision `ea30d66debe3740a08b573244286791d423d6b3e` |
| Plataformas objetivo | Apple Silicon fisico con macOS 27 o iOS 27 |
| Descargas / likes | 0 / 0 en el momento de la consulta; creado el 2026-09-27 |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento ni la composicion del dataset, y no indica si hubo RLHF, DPO u otra fase de alineacion. Lo que si detalla es la topologia del bundle convertido: un encoder de streaming orientado a ANE en W8A16, un subsampling causal en FP16, un predictor recurrente en FP16 orientado a ANE y grafos de vocabulario, junto con el vocabulario y los coeficientes de frontend. El encoder seleccionado tiene una unica forma de entrada, y el asset de subsampling mas pequeno comparte pesos entre el punto de entrada inicial y los posteriores. La geometria de ejecucion y los prompts de idioma se encuentran en `metadata.json`.

El aspecto tecnico mas destacable es la preservacion de estado: atencion, convolucion, subsampling y estado del decodificador recurrente persisten entre actualizaciones de 1,12 s de audio, lo que evita reprocesar el historial. La decodificacion es voraz y recurrente. Los autores advierten que los frames de emision de tokens no constituyen alineaciones a nivel de palabra cualificadas. Ademas, este bundle conserva las 56 posiciones de historial de la configuracion oficial de Transformers, frente a las 42 que declara el bundle FluidAudio, por lo que la comparacion de rendimiento entre ambos no es una comparacion controlada de grafos identicos.

## Capacidades

- Transcripcion de voz a texto en streaming multilingue con soporte de 28 idiomas.
- Puntuacion y mayusculas nativas en la salida, sin postprocesado segun la documentacion de NVIDIA.
- Procesamiento incremental: cada actualizacion consume 1,12 s de audio nuevo a 16 kHz mono.
- Persistencia de estado (atencion, convolucion, subsampling y decodificador recurrente) entre actualizaciones.
- Prompts de idioma explicitos ademas de la deteccion automatica; la card del modelo base distingue idiomas listos para transcripcion con cobertura amplia de otros slots de prompt pensados para adaptacion.
- Modo batch de alto rendimiento ademas del modo streaming de baja latencia, segun la documentacion del modelo base.
- Ejecucion en el Neural Engine de Apple: en una traza corta calentada se registraron 435 predicciones ANE en 435 llamadas de grafo, con cero intervalos de GPU en el proceso objetivo.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio mas alla de la transcripcion.

## Casos de uso

- Dictado y transcripcion en tiempo real dentro de aplicaciones nativas de macOS 27 o iOS 27: el bundle procesa bloques de 1,12 s con estado persistente, por lo que encaja en un flujo de voz continua sin cortes perceptibles.
- Subtitulado en directo para accesibilidad: la velocidad de 64,1x RTFx medida en un M3 permite generar subtitulos muy por delante del tiempo real en un dispositivo de consumo.
- Notas de reunion y actas automaticas: la salida incluye puntuacion y mayusculas de forma nativa, lo que reduce el trabajo de limpieza posterior antes de indexar o resumir el texto.
- Transcripcion batch de grabaciones largas: el discurso completo de JFK (18 minutos y 15 segundos) se proceso en 17,097 s, lo que lo hace adecuado para procesar archivos de audio extensos en local.
- Analitica de contact center en el dispositivo: al ejecutarse en el ANE y no requerir nube, permite transcribir llamadas sin enviar audio a servidores de terceros, util en entornos con requisitos de privacidad.
- Indexado y busqueda en archivos de audio y podcasts: la transcripcion multilingue en 28 idiomas facilita generar texto buscable para bibliotecas de audio.
- Aplicaciones sin conectividad: al ser un modelo local para Apple Silicon, sirve para escenarios de campo o con redes restringidas donde no se puede depender de una API remota.
- Flujos multilingues: con prompts de idioma explicitos y deteccion automatica, se puede usar en entornos donde conviven varios idiomas en una misma sesion de audio.

## Benchmarks y rendimiento

Precision sobre el discurso completo de JFK, con normalizacion Whisper de WER:

| Modelo | WER (discurso completo) | Errores / total |
|---|---|---|
| Este bundle Core AI | 3,20 % | 71 / 2.220 |
| Fuente oficial FP32 (Transformers 5.16.0, CPU/SDPA) | 3,20 % | 71 / 2.220 |

Velocidad en un M3 MacBook Air de 16 GB con macOS 27 y runtime Release (medianas de tres ejecuciones tras un calentamiento, PCM precargado, sin pausas de tiempo real; incluye extraccion de caracteristicas, llamadas a grafos, decodificacion recurrente, recuperacion de transcripcion parcial y volcado final; excluye carga y E/S de archivos):

| Runtime | Extracto de 20 s | Discurso completo (1.095,3 s) | RTFx completo |
|---|---|---|---|
| Este bundle Core AI | 0,300 s | 17,097 s | 64,1x |
| FluidAudio 1.12s | 0,444 s | 25,258 s | 43,4x |

Otros datos de rendimiento:

- Preparacion completa observada: 26,54 s la primera vez y 0,061 s con cache en un proceso nuevo (incluye carga y cualquier especializacion solicitada, antes del calentamiento).
- Traza corta calentada: 435 predicciones ANE en 435 llamadas de grafo, con cero intervalos de GPU en el proceso objetivo. Esto acredita participacion del ANE en esas llamadas, no ocupacion de unidades aritmeticas ni ausencia de trabajo en CPU.
- Pruebas cortas en siete idiomas con prompts automaticos y explicitos: 11 de 13 casos coinciden exactamente con los token IDs de la fuente; los otros dos difieren en puntuacion alemana y en un caracter chino.
- El error numerico proyectado del encoder supero una puerta del 5 %, alcanzando aproximadamente un 17 % de RMS relativo en un fixture de diagnostico. Un calculo independiente en FP32 con los mismos pesos W8 dequantizados reprodujo la amplificacion, y el error nativo contra esa referencia cuantizada fue de 0,18-1,99 %.
- No se aporta ninguna afirmacion sobre consumo energetico. El rendimiento en iPhone no esta cualificado.

## Requisitos de hardware

- Dispositivo fisico con Apple Silicon y macOS 27 o iOS 27. Los assets `.aimodel` se especializan en el dispositivo y no son binarios Core ML portables.
- Memoria: el bundle se midio en un M3 MacBook Air con 16 GB de RAM; no se publican requisitos minimos de memoria para otros equipos.
- Tamano en disco: 0,7 GB de repositorio.
- Uso del Neural Engine (ANE): en la traza medida toda la computacion registrada ocurrio en el ANE, sin intervalos de GPU en el proceso objetivo.
- Preparacion: la primera ejecucion puede requerir hasta 26,54 s de preparacion (carga y especializacion); con cache baja a 0,061 s.
- No hay soporte para GPUs NVIDIA ni opciones de despliegue tipo vLLM, llama.cpp, Ollama o TGI, ya que el formato de pesos es especifico de Apple Core AI. Existen conversiones GGUF del modelo base en otros repositorios, pero no forman parte de este bundle.
- Latencia y throughput medidos: 0,300 s para un extracto de 20 s y 17,097 s para 1.095,3 s de audio, equivalentes a 64,1x RTFx en el hardware de prueba.
- No se ha validado el rendimiento ni la colocacion en iPhone.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Historial | RTFx (JFK completo) | WER | Licencia |
|---|---|---|---|---|---|---|
| Este bundle (coder543) | ~600 M | Assets `.aimodel` Core AI | 56 posiciones | 64,1x | 3,20 % | openmdw-1.1 |
| nvidia/nemotron-3.5-asr-streaming-0.6b (fuente oficial) | ~600 M | Transformers FP32 CPU/SDPA | Configuracion oficial | No disponible | 3,20 % | No disponible en la informacion proporcionada |
| FluidAudio 1.12s | No disponible | No disponible | 42 posiciones | 43,4x | No disponible | No disponible |

La comparacion directa entre este bundle y la fuente oficial es significativa en precision: ambos obtienen un WER de 3,20 % sobre el mismo discurso. La comparacion de velocidad con FluidAudio no es una comparacion controlada, ya que los grafos y el numero de posiciones de historial difieren (56 frente a 42). Para alternativas de la misma categoria fuera de este ecosistema no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias

- El WER de 3,20 % se ha medido en una unica grabacion (el discurso de JFK); los propios autores advierten que una sola grabacion no establece una clasificacion general de precision.
- Las pruebas multilingues son limitadas: siete idiomas y trece casos, de los cuales dos difieren de la fuente en puntuacion alemana y un caracter chino. No hay validacion amplia de WER multilingue.
- Error numerico de conversion: el encoder proyectado supera la puerta del 5 % de error, llegando a ~17 % de RMS relativo en un fixture de diagnostico. El error nativo contra la referencia cuantizada se situa entre 0,18 % y 1,99 %. Las comparaciones de transcripcion frente a la fuente sin cuantizar se reportan por separado de las comprobaciones numericas de conversion.
- Los frames de emision de tokens no son alineaciones de frontera de palabra cualificadas, por lo que no son aptos para tareas que requieran timestamps por palabra precisos.
- No es una aplicacion autonoma: el host debe implementar la extraccion continua de caracteristicas, preservar los estados de los grafos y ejecutar decodificacion voraz recurrente.
- Dependencia de plataforma: requiere Apple Silicon fisico con macOS 27 o iOS 27. El rendimiento y la colocacion en iPhone no estan cualificados, y no se formula ninguna afirmacion energetica.
- La licencia es openmdw-1.1 (campo `license: other`). Deben revisarse los terminos de uso comercial en `LICENSE` y `NOTICE` antes de integrarlo en un producto.
- La identidad del checkpoint fuente de la revision del modelo base convertido (`1a41b75758b0337ff67db7d5408280aaaf23074e`) no fue verificada de forma independiente.
- El repositorio no registra descargas ni likes y fue creado el 2026-09-27, por lo que no existe un historial de uso en produccion que respalde su fiabilidad.
- No se documentan sesgos especificos ni tasas de alucinacion del modelo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/coder543/nemotron-3.5-asr-streaming-0.6b-coreai
- Modelo base en HuggingFace: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Revision concreta del modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/tree/ea30d66debe3740a08b573244286791d423d6b3e
- Model card de NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
- Repositorio GitHub de referencia (nemotron-asr): https://github.com/weyan618/nemotron-asr/blob/main/nemotron-asr/nemotron-3.5-asr-streaming-0.6b/README.md
- Implementacion en GitHub (tehtommeh): https://github.com/tehtommeh/nemotron-asr-streaming
- Texto de referencia de stt-bench-matrix: https://github.com/coder543/stt-bench-matrix/blob/4689df1aec5dd0e96b223caf3a9a176675c10fa5/samples/jfk_rice_16k.txt
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Tutorial sobre despliegue GGUF del modelo base: https://aiindigo.com/tutorials/getting-started-with-nemotron-3-5-asr-streaming-0-6b-gguf-real-time-local-transcrip
