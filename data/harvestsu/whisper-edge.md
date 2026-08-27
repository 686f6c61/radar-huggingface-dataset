# harvestsu/whisper-edge

## Resumen

El repositorio `harvestsu/whisper-edge` no contiene un modelo de lenguaje entrenado desde cero, sino un conjunto de artefactos de inferencia derivados de los modelos Whisper de OpenAI (variantes `tiny` y `base`), compilados específicamente para aceleradores de borde (edge) como Hailo-8, Rockchip RK3588/RK3576 y NVIDIA Jetson. El autor, harvestsu, lo publica como parte del proyecto openvoicestream, un sistema de voz de código abierto que consume estos ficheros a través de su backend `voxedge.backends.whisper`.

La propuesta técnica es inusual: el encoder de Whisper se ejecuta en el acelerador NPU/GPU, mientras que el decoder se ejecuta deliberadamente en CPU como un grafo ONNX. Según las mediciones documentadas, esta combinación resulta más rápida y precisa que ejecutar el decoder en el acelerador, debido a que los compiladores NPU de Hailo y Rockchip no implementan una caché KV eficiente. El repositorio incluye ficheros `.hef`, `.rknn` y `.onnx` para distintos tamaños de ventana temporal (5, 10, 20 y 30 segundos), junto con los decoders correspondientes y los vocabularios en inglés y chino.

La relevancia actual radica en que ofrece una ruta práctica para desplegar reconocimiento de voz Whisper en hardware de bajo consumo, con métricas de rendimiento reales (WER y RTF) medidas en cinco placas diferentes. No obstante, el modelo está pensado principalmente para inglés; el rendimiento en chino es deficiente (CER 35–56%), y el autor recomienda alternativas como Paraformer o SenseVoice para ese idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decodificador Transformer) compilado para aceleradores de borde; encoder en NPU/GPU, decoder en CPU |
| Parametros totales | no disponible (variantes `tiny` y `base` de Whisper, sin cifra publicada en el repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana fija de audio: 5 s, 10 s, 20 s o 30 s segun el fichero (compilada en tiempo de compilacion) |
| Tipos de cuantizacion | no disponible (los ficheros `.hef`, `.rknn` y `.onnx` usan formatos propietarios de cada acelerador; no se especifican cuantizaciones concretas) |
| Idiomas soportados | Ingles (principal); chino con rendimiento muy limitado (CER 35–56%) |
| Licencia | `other` (se indica que las licencias originales de cada componente se aplican: Hailo, Rockchip, OpenAI Whisper) |
| Formato de pesos | `.hef` (Hailo), `.rknn` (Rockchip), `.onnx` (Jetson/TensorRT y decoders CPU) |

## Arquitectura y entrenamiento

El modelo base es Whisper de OpenAI, un Transformer encoder-decodificador entrenado con supervisión débil sobre 680 000 horas de audio multilingüe. En este repositorio no se realiza ningún entrenamiento adicional; los ficheros son conversiones y compilaciones de los pesos originales para distintos aceleradores. El encoder se compila a grafos específicos de Hailo (`.hef`), Rockchip (`.rknn`) o TensorRT (`.onnx`), mientras que el decoder se exporta con `optimum` a ONNX y se ejecuta en CPU.

La decisión de ejecutar el decoder en CPU se justifica por las limitaciones de los compiladores NPU: Hailo compila una secuencia fija de 32 tokens sin caché KV, y Rockchip usa una ventana deslizante de 12 slots, lo que obliga a recomputar toda la secuencia en cada paso autoregresivo. Al mover el decoder a CPU, se observaron mejoras tanto en velocidad como en precisión (por ejemplo, en RK3588 el WER en inglés pasó de 10,44 % a 7,58 % y el RTF de 0,149 a 0,061). No se documentan técnicas de entrenamiento como RLHF o DPO, ya que no aplican.

## Capacidades

- Reconocimiento de voz automatico (ASR) en ingles, con soporte para transcripcion de audio de larga duracion (long-form) gracias a la ventana fija configurable (5–30 s).
- Inferencia en aceleradores de borde: Hailo-8, Rockchip RK3588/RK3576 y NVIDIA Jetson (via TensorRT).
- Decodificacion autoregresiva en CPU con grafo ONNX, lo que permite desplegar el modelo en placas sin NPU potente.
- Compatibilidad con el backend `voxedge.backends.whisper` del proyecto openvoicestream, que gestiona la descarga de modelos y la integracion con servidores de voz.
- Vocabularios separados para ingles (`vocab_en.txt`) y chino (`vocab_zh.txt`), aunque el rendimiento en chino es muy pobre.
- No se documenta soporte para tool calling, agentes, vision ni otros modos; es exclusivamente un sistema de transcripcion de voz.

## Casos de uso

- Transcripcion de voz en tiempo real en dispositivos IoT: un asistente de voz en un altavoz inteligente con Hailo-8 puede ejecutar el encoder en la NPU y el decoder en CPU, logrando un RTF de 0,061 en RK3588, lo que permite transcripcion casi en tiempo real con bajo consumo.
- Grabacion de reuniones en portatiles de bajo coste: con la variante `base` y ventana de 20 s, se puede transcribir audio de larga duracion en un mini-PC con RK3588, manteniendo un WER inferior al 8 % en ingles.
- Sistemas de dictado medico en clinicas rurales: al ejecutarse localmente, se evita enviar datos de pacientes a la nube, cumpliendo requisitos de privacidad; el modelo solo necesita una placa como Jetson Nano con TensorRT.
- Subtitulado automatico de videos en produccion: un pipeline que procesa archivos de audio con el encoder en acelerador y el decoder en CPU puede generar subtitulos en ingles con una latencia aceptable para edicion offline.
- Asistentes de voz para personas con discapacidad: integrado en un dispositivo de asistencia, el modelo permite comandos de voz en ingles sin conexion, con una huella de memoria reducida (los ficheros ocupan 0,8 GB en total).
- Evaluacion de rendimiento de hardware edge: el repositorio incluye documentacion de mediciones en cinco placas, por lo que sirve como referencia para ingenieros que comparan aceleradores NPU para tareas de ASR.

## Benchmarks y rendimiento

La model card proporciona datos de rendimiento medidos en placas reales, aunque no se detallan todos los resultados. Se mencionan los siguientes:

| Metrica | Placa | Configuracion | Resultado |
|---|---|---|---|
| WER (ingles, long-form) | RK3588 | decoder en NPU | 10,44 % |
| WER (ingles, long-form) | RK3588 | decoder en CPU | 7,58 % |
| RTF (real-time factor) | RK3588 | decoder en NPU | 0,149 |
| RTF (real-time factor) | RK3588 | decoder en CPU | 0,061 |
| CER (chino) | todas las placas | variantes tiny/base | 35–56 % |
| Similitud coseno (encoder Jetson fp16 vs onnxruntime) | Jetson | fp16 | 0,826 |
| Similitud coseno (encoder Jetson bf16 vs onnxruntime) | Jetson | bf16 | 0,9996 |

No se publican resultados de MMLU, HumanEval u otros benchmarks de NLP, ya que el modelo es exclusivamente de reconocimiento de voz. Los datos de WER y RTF son suficientes para evaluar su idoneidad en despliegues edge.

## Requisitos de hardware

- Placas soportadas: Hailo-8 (para los ficheros `.hef`), Rockchip RK3588 y RK3576 (para `.rknn`), y NVIDIA Jetson (para `.onnx` con compilacion TensorRT).
- VRAM estimada: no disponible; los ficheros del repositorio ocupan 0,8 GB en total, pero el consumo en memoria de cada acelerador no se especifica.
- GPU recomendadas: no se requieren GPUs de servidor; el modelo esta disenado para NPUs de borde y CPUs ARM. En Jetson, se recomienda compilar el motor TensorRT con `--bf16` en lugar de `--fp16` para evitar degradacion silenciosa.
- Opciones de despliegue: el backend `voxedge.backends.whisper` de openvoicestream gestiona la descarga e inferencia; tambien se puede usar directamente con los ficheros compilados en entornos personalizados.
- Latencia y throughput: los datos de RTF indican que en RK3588 con decoder en CPU se alcanza un RTF de 0,061, es decir, se procesa 1 segundo de audio en aproximadamente 61 ms, lo que permite transcripcion en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar directamente con otros modelos de ASR edge en el mismo repositorio. Como referencia general, se puede comparar con el Whisper original de OpenAI (mismo modelo base, pero sin compilacion para aceleradores) y con alternativas como Paraformer o SenseVoice, que el autor recomienda para chino. Sin embargo, no hay datos de rendimiento de estos ultimos en las mismas placas, por lo que la comparativa cuantitativa no es posible.

| Modelo | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| whisper-edge (este) | tiny/base | 5–30 s fijo | other (mixta) | Repositorio HuggingFace |
| Whisper (OpenAI) | tiny a large | 30 s (original) | MIT | HuggingFace, GitHub |
| Paraformer | no disponible | no disponible | no disponible | no disponible |
| SenseVoice | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo esta optimizado para ingles; el rendimiento en chino es muy pobre (CER 35–56 %) y el autor recomienda usar otros modelos para ese idioma.
- La ventana de audio es fija en tiempo de compilacion y debe coincidir con el nombre del fichero; una discrepancia produce salidas plausibles pero incorrectas sin error explicito.
- Los decoders `tiny` y `base` no son intercambiables: cruzarlos genera texto fluido pero sin sentido.
- En Jetson, compilar el encoder con `--fp16` produce una similitud coseno de 0,826 frente a onnxruntime y fallos silenciosos; se debe usar `--bf16` (similitud 0,9996).
- La licencia es `other` y se aplican las licencias originales de cada componente (Hailo, Rockchip, OpenAI), lo que puede implicar restricciones comerciales no documentadas en el repositorio.
- No se proporcionan garantias de soporte ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un proyecto incipiente.
- No se documentan sesgos especificos, pero al derivar de Whisper, puede heredar los sesgos de los datos de entrenamiento originales de OpenAI.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/harvestsu/whisper-edge
- Proyecto openvoicestream (GitHub): https://github.com/suharvest/openvoicestream
- Documentacion de rendimiento (referenciada en la model card): `docs/perf/whisper-cross-device-20260827.md` dentro del repositorio openvoicestream
- Whisper original de OpenAI: https://github.com/openai/whisper
