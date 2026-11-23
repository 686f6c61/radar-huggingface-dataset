# GiovanniManzoni/nemotron-unified-asr-0.6b-sherpa-onnx

## Resumen

Nemotron Unified ASR 0.6B — sherpa-onnx (int8) es una conversion del modelo de reconocimiento automatico del habla `nvidia/nemotron-labs-unified-asr-0.6b` de NVIDIA al formato transducer de sherpa-onnx, con cuantizacion int8. El trabajo de conversion lo realizo el usuario pisar y este repositorio es una copia byte a byte de esa conversion, publicada por GiovanniManzoni para garantizar la disponibilidad de los ficheros que consume la aplicacion de dictado Pisar en Android y la app complementaria Learn Like a Legend.

El modelo resuelve el problema de ejecutar ASR de forma local en dispositivos moviles sin depender de servicios en la nube, empaquetando el encoder, decoder y joiner en ficheros ONNX independientes y cuantizados. Incorpora un mecanismo de prompt de idioma mediante un vector de sesgo (`bias.bin` + `langs.txt`) que se inyecta en el encoder en tiempo de carga, lo que permite seleccionar el idioma de reconocimiento sin recargar el modelo.

Es relevante porque demuestra el patron de despliegue de modelos ASR de NVIDIA en el ecosistema sherpa-onnx, con un tamano de repositorio de 0,7 GB y pesos int8, adecuado para inferencia en CPU en dispositivos de gama media. La licencia es OpenMDW 1.1, con copyright de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer (encoder, decoder, joiner) exportado a ONNX |
| Parametros totales | 0,6 B (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantizacion dinamica de MatMul unicamente) |
| Idiomas soportados | prompt de idioma multiple mediante `bias.bin` y `langs.txt`; lista concreta de idiomas no disponible |
| Licencia | OpenMDW 1.1 (copyright NVIDIA) |
| Formato de pesos | ONNX (`encoder.onnx`, `decoder.onnx`, `joiner.onnx`), mas `tokens.txt`, `bias.bin`, `langs.txt` |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR de tipo transducer de 0,6 B de parametros desarrollado por NVIDIA. La version aqui descrita no es un reentrenamiento, sino una exportacion a ONNX con las matrices de las capas MatMul cuantizadas dinamicamente a int8. La arquitectura se divide en tres componentes desplegables por separado: encoder, decoder y joiner, el esquema clasico de los transducers RNN-T.

La innovacion principal de esta conversion es la integracion del prompt de idioma como un vector de sesgo estatico (`bias.bin`) que se escribe en el encoder en el momento de la carga, con una entrada por idioma listada en `langs.txt`. Esto elimina la necesidad de pasar el idioma como entrada dinamica al grafo ONNX y simplifica la integracion en sherpa-onnx. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO.

## Capacidades

- Reconocimiento automatico del habla (ASR) en formato transducer con salida de transcripcion.
- Seleccion de idioma en tiempo de carga mediante el vector de sesgo del encoder.
- Inferencia en CPU gracias a la cuantizacion int8 y al formato ONNX.
- Integracion nativa con sherpa-onnx, lo que permite su uso en Android, iOS, Linux y otros entornos soportados por esa libreria.
- Ejecucion local sin conexion a red.
- No se ha documentado soporte de tool calling, agentes, vision, audio mas alla del ASR ni modo de razonamiento explicito.

## Casos de uso

- Dictado por voz en Android: la app Pisar utiliza directamente estos ficheros para transcribir voz a texto en el dispositivo, sin enviar audio a servidores externos.
- Aplicaciones de notas por voz offline: integracion del modelo via sherpa-onnx para transcribir grabaciones en dispositivos sin conectividad.
- Subtitulado local de reuniones: procesamiento de audio capturado en el dispositivo con el encoder int8, adecuado para portatiles de gama media.
- Asistentes de voz embebidos: el modelo puede alimentar un pipeline de comandos de voz donde la transcripcion se pasa a un modulo de NLU local.
- Accesibilidad: transcripcion en tiempo real para personas con dificultades auditivas en entornos sin acceso a la nube.
- Prototipado de ASR multilingue: el mecanismo de prompt de idioma permite cambiar de lengua sin recargar los pesos, util para experimentar con distintos idiomas en una misma sesion.
- Aplicaciones educativas: la app Learn Like a Legend descarga estos ficheros verificados por SHA-256 para funciones de dictado en su entorno de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo esta pensado para inferencia en CPU. El repositorio ocupa 0,7 GB, por lo que la huella en memoria ronda ese orden de magnitud con los pesos int8 cargados.
- GPU recomendadas: no disponibles; el formato ONNX int8 esta orientado a CPU. Cualquier GPU compatible con ONNX Runtime podria ejecutarlo, pero no se documentan requisitos.
- Cabe en GPU de consumo: si, en principio cualquier GPU con al menos 1-2 GB de memoria libre, aunque no se han publicado pruebas.
- Opciones de despliegue: sherpa-onnx (principal), ONNX Runtime. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron Unified ASR 0.6B sherpa-onnx int8 (este) | 0,6 B | ONNX int8 | no disponible | OpenMDW 1.1 | Hugging Face |
| nvidia/nemotron-labs-unified-asr-0.6b | 0,6 B | safetensors (original) | no disponible | OpenMDW 1.1 | Hugging Face |
| pisar/nemotron-unified-asr-0.6b-sherpa-onnx | 0,6 B | ONNX int8 | no disponible | OpenMDW 1.1 | Hugging Face |

No se dispone de informacion sobre otros modelos ASR comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- El repositorio es una copia sin modificaciones de la conversion de pisar; no aporta mejoras ni correcciones sobre el original.
- La cuantizacion int8 solo afecta a las matrices MatMul, por lo que puede introducir una perdida de precision frente al modelo original en safetensors.
- No se documentan los idiomas concretos soportados ni el rendimiento por idioma.
- No hay informacion sobre sesgos, tasa de alucinacion ni comportamiento en audio con ruido o acentos.
- La licencia OpenMDW 1.1 incluye condiciones especificas; es necesario revisar `LICENSE.md` antes de un uso comercial.
- El modelo esta optimizado para el pipeline de sherpa-onnx; su uso fuera de ese ecosistema requiere adaptar la carga del prompt de idioma y los tres grafos ONNX.
- No se han publicado benchmarks, por lo que no es posible comparar su calidad con alternativas de forma objetiva.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/GiovanniManzoni/nemotron-unified-asr-0.6b-sherpa-onnx
- Conversion original: https://huggingface.co/pisar/nemotron-unified-asr-0.6b-sherpa-onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/nemotron-labs-unified-asr-0.6b
