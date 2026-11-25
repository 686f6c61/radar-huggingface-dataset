# clementoeee/whisper-large-v3-turbo-timestamped-webgpu

## Resumen

`clementoeee/whisper-large-v3-turbo-timestamped-webgpu` es una exportación ONNX del modelo de reconocimiento automático de voz Whisper large-v3 turbo de OpenAI, optimizada específicamente para el execution provider WebGPU de onnxruntime. El autor, clementoeee, parte de la exportación de onnx-community que expone las cross-attentions del decoder como salidas, lo que permite obtener marcas temporales a nivel de palabra, y la modifica para almacenar los pesos grandes en fp16 casteándolos a fp32 en tiempo de carga.

El problema que resuelve es concreto: el execution provider WebGPU de onnxruntime computa los modelos fp16 en fp16, incluidas las sumas, lo que provoca que la salida del encoder derive capa a capa y que, a partir de la capa 20, algunas activaciones alcancen valores de 275, generando errores suficientes para descolocar líneas enteras de letras de canciones. La exportación fp32 es correcta en WebGPU pero duplica el tamano en disco. Esta versión mantiene el tamano del export fp16 y computa en fp32, produciendo en el procesador exactamente la misma salida que el export fp32, bit a bit.

El modelo es relevante para desarrolladores que necesitan transcripción con timestamps por palabra ejecutándose en el navegador o en Node.js mediante transformers.js y onnxruntime, sin depender de hardware dedicado en la nube. El repo ocupa 1,6 GB y la licencia es MIT, heredada del modelo original de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | no disponible (repo de 1,6 GB; encoder 1.274.458.162 bytes, decoder 370.513.322 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de 30 s (estandar de Whisper) |
| Tipos de cuantizacion | pesos fp16 con cast a fp32 en carga; computo en fp32 |
| Idiomas soportados | no disponible en la informacion proporcionada (Whisper large-v3 turbo es multilingue, pero la ficha no lista idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (`onnx/encoder_model.onnx`, `onnx/decoder_model_merged.onnx`) |
| Libreria | transformers.js |
| Pipeline | automatic-speech-recognition |
| Modelo base | onnx-community/whisper-large-v3-turbo_timestamped (a su vez derivado de openai/whisper-large-v3-turbo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Whisper large-v3 turbo de OpenAI, un transformer encoder-decoder descrito en Radford et al., "Robust Speech Recognition via Large-Scale Weak Supervision" (arXiv:2212.04356), entrenado con supervision debil a gran escala. La exportacion ONNX modifica el decoder para exponer las cross-attentions como salidas, lo que habilita la alineacion temporal a nivel de palabra mediante dynamic time warping sobre las matrices de atencion. No se dispone en la informacion proporcionada de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO.

La innovacion tecnica de esta ficha concreta es la estrategia de almacenamiento: el script `convert.py` construye cada fichero a partir del export fp32 (encoder con su `.onnx_data` y `decoder_model_merged.onnx`, en el commit `b3f77bf9a8c4d5ea3415827033d1ffea7955fd9a`) y produce los mismos bytes en cada ejecucion. Todo inicializador fp32 con 1.024 valores o mas se almacena en fp16 seguido de un Cast de vuelta a fp32; el resto del grafo queda sin cambios, por lo que entradas, salidas y tipos coinciden con el export fp32. Como los pesos originales de turbo ya eran fp16, almacenarlos en fp16 no pierde informacion. La configuracion y los ficheros del tokenizer son los de onnx-community, sin modificar.

## Capacidades

- Reconocimiento automatico de voz (ASR) sobre audio en ventanas de 30 s.
- Marcas temporales a nivel de palabra mediante cross-attentions del decoder y dynamic time warping.
- Ejecucion en WebGPU (navegador) y DirectML (Windows) a traves de onnxruntime, con paridad numerica respecto al computo en CPU.
- Integracion con transformers.js para despliegue en JavaScript/TypeScript.
- Uso en Node.js mediante onnxruntime-node (el motor karaoke de Ondalys lo emplea para colocar letras de canciones palabra por palabra).
- Capacidades multilingues: no detalladas en la informacion proporcionada.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision ni audio mas alla del ASR.

## Casos de uso

- Karaoke y sincronizacion de letras: el modelo expone las cross-attentions y permite alinear cada palabra de una cancion a su instante exacto mediante DTW; el motor de Ondalys lo usa en produccion a traves de onnxruntime-node sobre voces separadas.
- Transcripcion en el navegador: con transformers.js y WebGPU, se puede ofrecer dictado o subtitulado en cliente sin enviar audio a un servidor, reduciendo latencia y cumplimiento de privacidad.
- Subtitulado con timestamps por palabra: la salida temporal milimetrica permite generar ficheros de subtitulos con sincronizacion fina para video.
- Edicion de audio y video en aplicaciones web: la paridad bit a bit con el computo en CPU permite previsualizar transcripciones en WebGPU y renderizar el resultado final en servidor sin discrepancias.
- Investigacion en alineacion forzada: las cross-attentions exportadas sirven para estudiar o implementar alineadores palabra-audio sobre Whisper.
- Despliegue en Windows con DirectML: aplicaciones de escritorio pueden usar la GPU del sistema (verificado en AMD Radeon RX 9070 XT) con 81,8 dB SNR y 0,47 s por ventana de 30 s.
- Pipelines de accesibilidad: generacion de transcripciones sincronizadas para contenido multimedia en tiempo casi real en equipos de consumo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las comprobaciones del autor sobre onnxruntime-node 1.31.1 en Windows con AMD Radeon RX 9070 XT, tomando como referencia el export fp32 en procesador. Se miden en SNR (dB) y tiempo por ventana de 30 s.

| Encoder | WebGPU | DirectML |
|---|---|---|
| onnx-community fp16 | 13,2 dB SNR | 32,8 dB SNR |
| Esta version | 83,0 dB SNR, 0,41 s por ventana de 30 s | 81,8 dB SNR, 0,47 s |

Prueba de alineacion: sobre una cancion de 3 min 53 s (257 palabras) con voces separadas, el autor coloca las letras usando cross-attentions y DTW. Con estos ficheros, WebGPU, DirectML y el procesador sitúan cada palabra en el mismo instante al milisegundo. Con los ficheros fp16 de onnx-community en WebGPU, solo el 47 % de las palabras caen a menos de 20 ms del tiempo del procesador y algunas se desvian mas de 30 s.

No se han publicado resultados de benchmarks estandar (WER, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el encoder ocupa 1.274.458.162 bytes y el decoder 370.513.322 bytes en disco, y el modelo carga los pesos en fp32, por lo que la huella en memoria es superior al tamano de los ficheros.
- GPU verificada por el autor: AMD Radeon RX 9070 XT con DirectML y WebGPU (0,41-0,47 s por ventana de 30 s).
- GPU recomendadas: no disponibles en la informacion proporcionada; al ser WebGPU, funciona sobre cualquier GPU con soporte del navegador o de onnxruntime, pero no se detallan modelos concretos.
- Cabe en GPU de consumo: si, segun la prueba del autor en una RX 9070 XT; no se confirma para otras GPU de consumo.
- Opciones de despliegue: transformers.js (navegador), onnxruntime-node (Node.js), execution providers WebGPU y DirectML; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,41 s por ventana de 30 s en WebGPU y 0,47 s en DirectML sobre la GPU indicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Timestamps por palabra | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (whisper-large-v3-turbo-timestamped-webgpu) | no disponible (repo 1,6 GB) | ventanas de 30 s | Si (cross-attentions) | MIT | ONNX fp16 con computo fp32 |
| onnx-community/whisper-large-v3-turbo_timestamped (fp16) | no disponible | ventanas de 30 s | Si | MIT | ONNX fp16 |
| onnx-community/whisper-large-v3-turbo_timestamped (fp32) | no disponible | ventanas de 30 s | Si | MIT | ONNX fp32 |
| openai/whisper-large-v3-turbo (original) | no disponible en la informacion | ventanas de 30 s | No de forma nativa | MIT | PyTorch |

La diferencia clave frente a las exportaciones de onnx-community es la precision numerica en WebGPU: 83,0 dB SNR frente a 13,2 dB SNR del fp16, con el mismo tamano en disco que este ultimo. Frente al export fp32, ofrece la misma salida en procesador con la mitad de tamano.

## Limitaciones y advertencias

- El modelo hereda los sesgos de Whisper large-v3 turbo; no se documentan sesgos especificos en la informacion proporcionada.
- Riesgo de alucinacion inherente a Whisper, especialmente en audio con ruido, silencios largos o dominios alejados del entrenamiento.
- La ventana de contexto es de 30 s por segmento; audios mas largos requieren troceado y gestion de solapamientos.
- No se detalla la lista de idiomas soportados en la informacion disponible.
- El rendimiento verificado se limita a onnxruntime-node 1.31.1 en Windows con una AMD Radeon RX 9070 XT; el comportamiento en otras GPU, navegadores o versiones de onnxruntime puede diferir.
- El computo en fp32 incrementa la huella de memoria respecto al export fp16 puro, lo que puede ser limitante en dispositivos con poca VRAM.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.
- Licencia MIT: permite uso comercial, pero conviene conservar los avisos de copyright de OpenAI y onnx-community.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/clementoeee/whisper-large-v3-turbo-timestamped-webgpu
- Modelo base ONNX: https://huggingface.co/onnx-community/whisper-large-v3-turbo_timestamped
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://arxiv.org/abs/2212.04356
