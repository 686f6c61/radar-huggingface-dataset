# BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF

## Resumen

Qwen3-TTS-12Hz-0.6B-GGUF es la versión cuantizada en formato GGUF del modelo de síntesis de voz Qwen3-TTS-12Hz-0.6B-Base de Alibaba Qwen, publicada por el usuario BricksDisplay. Se trata de un sistema de text-to-speech con clonación de voz que cubre diez idiomas (ingles, chino, japones, coreano, frances, aleman, espanol, italiano, portugues y ruso) y que mantiene el caracter offline del ecosistema llama.cpp.

La particularidad de este empaquetado es que el modelo se distribuye en dos ficheros complementarios: un backbone de lenguaje (el LM de TTS) que ejecuta llama.cpp, y un fichero de codec que contiene el decodificador/vocoder, los encoders de hablante y el adaptador entre ambos, ejecutado por codec.cpp. Esta separacion permite reutilizar la infraestructura de llama.cpp para la parte linguistica y delegar la sintesis de audio a un runtime especializado.

El modelo base cuenta con 661.281.985 parametros y esta pensado para despliegue local en CPU o GPU (CUDA, Vulkan, Metal) sin conexion. La relevancia actual radica en que ofrece clonacion de voz multilingue con un peso reducido (desde 1,06 GB en la configuracion mas ligera) y bajo licencia Apache 2.0, lo que facilita su integracion en aplicaciones de escritorio, moviles y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje para TTS (backbone) + codec/vocoder separado; inferencia via llama.cpp y codec.cpp |
| Parametros totales | 661.281.985 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | q2_k, q3_k_s, q3_k_m, q3_k_l, q4_0, q4_1, q4_k_s, q4_k_m, q5_0, q5_1, q5_k_s, q5_k_m, q6_k, q8_0, f16, bf16, f32 (backbone); f32, f16, q8_0, q5_k_m, q4_k_m, q8_0-lm-q4_k_m (codec) |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, it, pt, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema en dos grafos. El backbone es un modelo de lenguaje de 0,6B parametros que genera tokens discretos de audio a partir del texto de entrada y, opcionalmente, de un audio de referencia para clonacion de voz. El codec es un modulo independiente que incluye el decodificador/vocoder, los encoders de hablante y el adaptador que conecta la salida del LM con el dominio de audio. La frecuencia de trabajo es de 12 Hz, lo que implica un frame rate bajo de tokens de audio por segundo, coherente con el nombre del modelo.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO. La model card del repositorio cuantizado no documenta estos aspectos, y el modelo base original no aporta esa informacion en los datos facilitados. La innovacion tecnica destacable es la separacion backbone/codec, que permite ejecutar cada parte con un runtime distinto y reutilizar llama.cpp como host del LM, ademas de soportar streaming de audio mediante `tts.stream(text)` en Python.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto en diez idiomas.
- Clonacion de voz mediante audio de referencia (`--ref-audio` / `ref_audio=`), con cualquier frecuencia de muestreo de entrada.
- Guardado y reutilizacion de voces clonadas (`--save-speaker`).
- Streaming de audio generado token a token en la API Python.
- Ejecucion totalmente offline en CPU y GPU (CUDA, Vulkan, Metal).
- Soporte de despliegue en movil via llama.rn (iOS y Android).
- Aplicacion de parametros de muestreo recomendados embebidos en metadatos GGUF (temperatura 0.9, top-k 50, top-p 1.0, min-p 0, penalizacion de repeticion 1.05, ventana 4096).
- No dispone de voces integradas: requiere siempre audio de referencia para clonar.

## Casos de uso

- Clonacion de voz personal para asistentes: el modelo permite generar respuestas habladas con la voz del usuario a partir de un clip corto de referencia, util en asistentes de escritorio o moviles que funcionan sin conexion.
- Audiolibros y narracion automatizada: con diez idiomas soportados y la posibilidad de guardar voces, se puede narrar texto largo con una voz consistente entre capitulos reutilizando el hablante guardado.
- Accesibilidad y lectura en voz alta: integracion en lectores de pantalla o aplicaciones de accesibilidad que necesiten sintesis local en dispositivos sin GPU dedicada, gracias a la configuracion q4_0 + codec q8_0-lm-q4_k_m de 1,06 GB.
- Doblaje y localizacion de contenido: el soporte multilingue (es, fr, de, it, pt, ru, en, zh, ja, ko) permite generar pistas de voz en distintos idiomas manteniendo un timbre de referencia comun.
- Prototipado de interfaces conversacionales: el streaming de audio y la ejecucion en CPU facilitan iterar sobre dialogos hablados en entornos de desarrollo sin infraestructura de GPU.
- Aplicaciones moviles offline: mediante llama.rn en iOS y Android se puede empaquetar el modelo en una app que sintetice voz sin enviar datos a servidores externos, relevante por privacidad.
- Generacion de contenido para videojuegos o podcasts: la clonacion de voz y el bajo peso permiten generar lineas de dialogo con voces de referencia en pipelines de produccion locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el peso del modelo en disco orienta el consumo. Configuracion recomendada (q8_0 backbone + codec q8_0): 1,9 GB. Configuracion mas pequena (q4_k_m + codec q4_k_m): 1,7 GB. Mejor calidad (f16 + f16): 2,6 GB. Configuracion para moviles (q4_0 + codec q8_0-lm-q4_k_m): 1,06 GB.
- GPU recomendadas: no se especifican modelos concretos; el modelo soporta CUDA, Vulkan y Metal, por lo que es compatible con GPUs NVIDIA, AMD e Intel via Vulkan y con Apple Silicon via Metal.
- Cabe en GPU de consumo: si, dado el reducido tamano (inferior a 3 GB en todas las configuraciones documentadas), es viable en GPUs de consumo con suficiente memoria libre.
- Opciones de despliegue: codec.cpp (`tts-cli`, `tts-server`), llama.cpp como host del backbone, paquete Python `codec_cpp`, y llama.rn para iOS y Android.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-TTS-12Hz-0.6B-GGUF (este) | 661 M | No disponible | 10 | Apache 2.0 | GGUF |
| Qwen3-TTS-12Hz-0.6B-Base | 661 M | No disponible | 10 | Apache 2.0 | Safetensors (original) |
| Alternativas de TTS open source | No disponible | No disponible | No disponible | No disponible | No disponible |

Solo se dispone de datos del modelo base original como referencia directa. No se han proporcionado datos de otros modelos TTS comparables en la informacion disponible.

## Limitaciones y advertencias

- El modelo es la variante Base: no incluye voces integradas, por lo que toda sintesis requiere un audio de referencia para clonar.
- Sin la penalizacion de repeticion (1.05) configurada, una voz clonada con transcripcion de referencia puede entrar en bucle en las cuantizaciones mas pequenas en lugar de terminar la generacion.
- No se documentan sesgos conocidos, pero al ser un modelo entrenado con datos no especificados, existe riesgo de sesgos en el timbre, prosodia o cobertura linguistica.
- Riesgo de alucinacion en la generacion de audio: no se documenta en la informacion disponible, aunque es un fenomeno comun en modelos generativos.
- La longitud de contexto no esta disponible, lo que limita la planificacion de textos largos sin pruebas previas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original y de los datos de entrenamiento no documentados.
- El despliegue requiere compilar codec.cpp con su llama.cpp embebido (CMake y compilador C++), lo que anade complejidad frente a un paquete Python puro.
- El repo ocupa 57,5 GB por incluir todas las cuantizaciones; conviene descargar solo los dos ficheros necesarios (backbone + codec).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BricksDisplay/Qwen3-TTS-12Hz-0.6B-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base
- codec.cpp: https://github.com/mybigday/codec.cpp
- Documentacion Python de codec.cpp: https://github.com/mybigday/codec.cpp/tree/main/python
- llama.cpp: https://github.com/ggml-org/llama.cpp
- llama.rn: https://github.com/mybigday/llama.rn
- Documentacion TTS de llama.rn: https://github.com/mybigday/llama.rn#text-to-speech-tts
