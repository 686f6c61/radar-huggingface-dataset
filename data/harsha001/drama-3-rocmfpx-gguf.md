# Harsha001/Drama-3-ROCmFPX-GGUF

## Resumen

Drama 3 es un modelo de texto a voz (TTS) desarrollado por Fish Audio, con 35.774 millones de parametros totales y arquitectura de mezcla de expertos (MoE) en la que solo 3.000 millones estan activos por token. Genera audio a 44,1 kHz con soporte para 83 idiomas y permite escenas de hasta 16 hablantes distintos, incluyendo indicaciones expresivas como `[laughs]` en el texto de entrada. El modelo base es `fishaudio/drama-3`.

La ficha que nos ocupa no contiene los pesos originales, sino una cuantizacion comunitaria publicada por el usuario Harsha001 bajo el formato ROCmFPX, disenada especificamente para ejecutarse en `speech.cpp` con un fork de ggml optimizado para hardware AMD (ROCm, Strix Halo). Cada fichero GGUF incluye el modelo completo, su decodificador de audio y el codec de 44,1 kHz, lo que simplifica el despliegue.

La relevancia de esta publicacion es doble: por un lado, ofrece una via practica para ejecutar un TTS de 35B en equipos con memoria unificada y GPU AMD; por otro, documenta con mediciones de CER/WER el impacto de cada nivel de cuantizacion, algo poco habitual en el ecosistema de modelos de voz. La version final (31 de octubre de 2026) corrige los ficheros de preview e introduce escalas tensoriales que reducen el error del fichero de 8 bits del 3,69 % al 1,94 % de CER.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, con decodificador de audio y codec integrados |
| Parametros totales | 35.774.408.084 (aproximadamente 35B) |
| Parametros activos | Aproximadamente 3B (35B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ROCmFPX: Q8_0_ROCMFPX, Q6_0_ROCMFPX (etiquetado Q6_K), Q4_0_ROCMFP4, Q4_0_ROCMFP4_FAST, Q4_0_ROCMI4; embeddings en Q8_0 estandar |
| Idiomas soportados | 83 idiomas (segun la model card del autor); lista concreta no disponible |
| Licencia | Fish Audio Community License 1.0 |
| Formato de pesos | GGUF (ROCmFPX), exclusivo para speech.cpp con fork de ggml y parche |
| Tamano del repositorio | 255,6 GB |
| Frecuencia de muestreo de audio | 44,1 kHz |
| Hablantes por generacion | 1 o escena de hasta 16 |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos de 35B parametros totales y unos 3B activos por token, orientado a sintesis de voz. Integra en un unico grafo el modelo de lenguaje, el decodificador de audio y el codec a 44,1 kHz. La model card de esta cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO; esa informacion corresponderia a la model card del modelo base `fishaudio/drama-3`, no incluida aqui.

La contribucion tecnica de esta publicacion es el proceso de cuantizacion. Se parte de un GGUF F32 de 143 GB generado con `convert.py` de speech.cpp v0.8.10 (revision `78e5ab7`), con los expertos FP8 dequantizados como hace fish-speech. Sobre ese fichero se aplican los tipos ROCmFPX mediante un fork de ggml con soporte de escalas tensoriales: cada matriz de pesos (cada experto de una matriz MoE) se multiplica por una potencia de dos antes de cuantizar y se almacena la inversa en un tensor `<name>.scale` que speech.cpp vuelve a aplicar tras el producto matricial. Este esquema evita que los pesos de experto, muy pequenos, choquen con el limite inferior de las escalas de bloque. Las tablas de busqueda leidas por filas (embeddings de tokens y de codebook) se guardan como Q8_0 estandar. El repositorio incluye el parche `speechcpp-rocmfpx.patch` para speech.cpp v0.8.10.

## Capacidades

- Sintesis de voz de texto a audio a 44,1 kHz con un unico hablante o escenas de hasta 16 hablantes.
- Multilingue: 83 idiomas segun la model card del autor.
- Control expresivo mediante indicaciones en el texto, como `[laughs]`.
- Generacion de voz sin referencia de hablante (modo `--voice none` empleado en las pruebas).
- Codec y decodificador de audio incluidos en el mismo fichero GGUF, sin dependencias externas de audio.
- Inferencia en CPU (codigo portable de los tipos ROCmFPX) y en GPU AMD mediante kernels dedicados de ROCm.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio de entrada.

## Casos de uso

- Audiolibros y narracion larga: el modelo mantiene escenas de hasta 16 personajes con indicaciones expresivas, lo que permite asignar voces distintas por personaje en un mismo flujo de generacion sin cambiar de modelo.
- Doblaje y localizacion multilingue: con 83 idiomas declarados, se puede generar la misma locucion en varios idiomas desde el mismo pipeline, usando el fichero `Q4_0_ROCMFP4` (21,1 GB) para iterar rapido en una estacion AMD.
- Prototipado de asistentes de voz: el modo sin referencia de hablante permite generar locuciones de prueba inmediatas para validar guiones de interaccion antes de invertir en voces personalizadas.
- Investigacion en sintesis de voz: la publicacion incluye mediciones CER/WER por fichero y semilla, lo que la convierte en una base reproducible para estudiar el efecto de la cuantizacion en la calidad del audio.
- Generacion de contenido para video y podcast: la velocidad de 0,20x-0,49x tiempo real en CPU de 20 nucleos ARM permite producir clips cortos en local sin GPU.
- Despliegue en equipos con memoria unificada (Strix Halo, DGX Spark): los ficheros de 20-21 GB caben en configuraciones de 128 GB y evitan depender de GPUs de datacenter para un TTS de gran tamano.
- Evaluacion de hardware AMD: sirve como banco de pruebas para medir kernels ROCm en cargas de decodificacion de audio, aunque el autor advierte que aun no hay pruebas en GPU AMD.

## Benchmarks y rendimiento

Las metricas publicadas son CER y WER sobre 20 frases en ingles (unos 110 s de audio), transcritas con Qwen3-ASR 1.7B y promediadas sobre dos semillas. La referencia es el fichero F16 (no publicado).

| Fichero | Tamano | CER | WER | CER por semilla | Velocidad en CPU de prueba |
|---|---:|---:|---:|---|---:|
| F16 (referencia, no publicado) | 71,6 GB | 1,44 % | 1,66 % | 1,90 / 0,98 | 0,10x tiempo real |
| Q8_0_ROCMFPX | 37,4 GB | 1,94 % | 1,85 % | 2,89 / 0,98 | 0,39x tiempo real |
| Q6_0_ROCMFPX (Q6_K) | 29,8 GB | 1,31 % | 1,48 % | 1,64 / 0,98 | 0,02x tiempo real |
| Q4_0_ROCMFP4 (recomendado) | 21,1 GB | 1,18 % | 1,29 % | 0,98 / 1,38 | 0,20x tiempo real |
| Q4_0_ROCMFP4_FAST | 20,1 GB | 1,84 % | 2,03 % | 1,71 / 1,97 | 0,10x tiempo real |
| Q4_0_ROCMI4 | 20,1 GB | 1,50 % | 1,66 % | 0,98 / 2,03 | 0,10x tiempo real |
| Q4_K estandar (solo referencia) | 20,8 GB | 2,26 % | 2,58 % | 3,54 / 0,98 | 0,49x tiempo real |

Todas las variantes publicadas quedan dentro del ruido del F16 (variacion de aproximadamente un punto entre semillas). No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 37,4 GB para Q8_0, 29,8 GB para el 6 bits, 20-21 GB para las variantes de 4 bits. El F32 de conversion ocupa 143 GB y el F16 de referencia 71,6 GB.
- GPU recomendadas: el autor orienta la publicacion a GPU AMD con ROCm (menciona Strix Halo con 128 GB de memoria unificada); no se especifican modelos concretos como MI300, W7900 o Radeon RX.
- Consumer GPU: los ficheros de 20-21 GB pueden caber en GPUs de consumo con 24 GB de VRAM, pero no se han publicado pruebas al respecto.
- Despliegue: exclusivamente `speech.cpp` v0.8.10 compilado contra el fork ROCmFPX de ggml y con `speechcpp-rocmfpx.patch`. llama.cpp, LM Studio, Ollama y speech.cpp estandar no pueden cargar estos ficheros.
- Latencia y throughput: medidos en CPU ARM de 20 nucleos (DGX Spark), entre 0,02x y 0,49x tiempo real segun fichero. En GPU AMD no hay mediciones; el autor solicita reportes.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Drama 3 (esta cuantizacion, 35B-A3B) | 35B totales / 3B activos | 83 | GGUF ROCmFPX | Fish Audio Community License 1.0 | Requiere speech.cpp con fork ROCmFPX; CER 1,18-1,94 % en las variantes recomendadas |
| Drama 3 original (`fishaudio/drama-3`) | 35B totales / 3B activos | 83 | no disponible en esta informacion | Fish Audio Community License 1.0 | Pesos de referencia; el formato de despliegue no se detalla aqui |
| Qwen3-ASR 1.7B | 1,7B | no disponible | no disponible | no disponible | Usado solo como transcriptor de evaluacion, no es un TTS comparable |
| Alternativas TTS de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos de otros modelos TTS para comparar |

## Limitaciones y advertencias

- Dependencia estricta de un fork: sin el parche `speechcpp-rocmfpx.patch` y el fork ROCmFPX de ggml, los ficheros no cargan en ninguna herramienta estandar.
- Sin validacion en GPU AMD: el autor indica explicitamente que los ficheros no se han probado en hardware AMD; las velocidades publicadas corresponden a CPU ARM.
- El fichero de 6 bits no es un Q6_K estandar pese al nombre; usa el tipo `Q6_0_ROCMFPX` y sufre una penalizacion severa de velocidad en ARM (0,02x tiempo real).
- Riesgo de alucinacion acustica: el modelo puede producir audio que no corresponde al texto; las tasas CER/WER de 1,18-2,58 % cuantifican ese desajuste y conviene validar en produccion.
- Idiomas: se declaran 83, pero no hay lista ni evaluacion por idioma; el castellano no esta verificado en la informacion disponible.
- Licencia restrictiva: Fish Audio Community License 1.0 permite uso gratuito solo para investigacion y uso no comercial; el uso comercial se limita a empresas con ingresos anuales inferiores a 500.000 USD y prohibe servicios de voz alojados o de clonacion sin acuerdo separado.
- Clonacion de voz: prohibido imitar la voz de una persona real sin su consentimiento.
- Sesgos: no se documentan sesgos especificos de generacion de voz en la informacion disponible.
- Longitud de contexto: no disponible; no se puede planificar la generacion de textos largos sin este dato.
- Repositorio de 255,6 GB: la descarga completa es costosa; conviene bajar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/Drama-3-ROCmFPX-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Licencia: https://huggingface.co/Harsha001/Drama-3-ROCmFPX-GGUF/blob/main/LICENSE
- ROCmFPX (repositorio del autor): https://github.com/HarshaVardhan3002/ROCmFPX
- speech.cpp: https://github.com/nyosegawa/speech.cpp
- Qwen3-ASR 1.7B (transcriptor de evaluacion): https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Modelo destacado del autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
