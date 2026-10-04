# ishaan-g/whisper-hinglish-swift_timestamped

## Resumen

Whisper Hindi2Hinglish Swift (ONNX, con timestamps a nivel de palabra) es una exportacion a formato ONNX del modelo `Oriserve/Whisper-Hindi2Hinglish-Swift`, que a su vez es un ajuste fino de `openai/whisper-base`. El modelo original transcribe audio en hindi y hinglish escribiendo la salida en alfabeto latino (romanizado), en lugar de devolver texto en devanagari. Esta version concreta, publicada por el usuario ishaan-g, anade las salidas de atencion cruzada necesarias para que la marca `return_timestamps: "word"` funcione en Transformers.js.

Su proposito es ejecutar reconocimiento automatico de voz (ASR) directamente en el navegador, sin backend, apoyandose en WebGPU o WebAssembly. El modelo esta pensado para integraciones ligeras tipo subtitulado automatico de video, y de hecho lo utiliza el producto CaptionsEasy para generar subtitulos de video en el cliente. No introduce cambios en los pesos respecto al modelo de Oriserve: se trata unicamente de una conversion y cuantizacion para el ecosistema transformers.js.

La relevancia actual del modelo reside en su tamano reducido (heredado de whisper-base), su licencia Apache-2.0 y su doble juego de pesos cuantizados (fp16 para WebGPU y 8 bits para CPU/WASM), que permiten inferencia local en dispositivos sin GPU dedicada. La fecha de creacion del repositorio es el 4 de octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), exportado a ONNX |
| Parametros totales | ~74 M (heredados de `openai/whisper-base`) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | ventana de audio de 30 s por inferencia (caracteristica de Whisper); contexto de texto no disponible |
| Tipos de cuantizacion | fp16 (WebGPU), quantized 8-bit (WASM/CPU), q4f16 |
| Idiomas soportados | hi, en (salida en alfabeto latino / hinglish romanizado) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model_fp16.onnx`, `decoder_model_merged_q4f16.onnx`, `encoder_model_quantized.onnx`, `decoder_model_merged_quantized.onnx`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder que recibe una representacion log-mel del audio y genera tokens de texto de forma autoregresiva. La variante base de OpenAI, sobre la que se construye este modelo, emplea 6 capas en el encoder y 6 en el decoder, con una ventana de entrada de 30 segundos de audio. La innovacion de esta publicacion no esta en la arquitectura, sino en el proceso de exportacion: se ha utilizado el script `scripts/convert.py` de transformers.js con la opcion `--output_attentions`, tomando las cabezas de alineamiento de whisper-base para habilitar los timestamps a nivel de palabra. Posteriormente se aplicaron las cuantizaciones fp16, q8 y q4f16.

Respecto a los datos de entrenamiento del ajuste fino original (Oriserve/Whisper-Hindi2Hinglish-Swift), no se dispone de informacion detallada en la documentacion proporcionada: no se especifican el numero de tokens, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. Si se sabe que el modelo fue entrenado usando el token de idioma ingles, de modo que la salida es hinglish en alfabeto latino. La proyeccion de salida comparte pesos con el embedding de tokens (como en `onnx-community/whisper-base_timestamped`), por lo que el tamano de descarga es equivalente al de un Whisper base estandar.

## Capacidades

- Reconocimiento automatico de voz (ASR) sobre audio en hindi y en ingles, con salida en hinglish romanizado (alfabeto latino).
- Generacion de timestamps a nivel de palabra gracias a la exportacion con salidas de atencion cruzada; la marca `return_timestamps: "word"` funciona correctamente.
- Ejecucion en el navegador mediante Transformers.js, tanto en WebGPU (fp16 / q4f16) como en WASM/CPU (8 bits).
- Transcripcion de audio mono a 16 kHz, la frecuencia de muestreo esperada por el pipeline de Whisper.
- Capacidad multilingue limitada a los dos idiomas declarados (hi, en); no se documentan otros idiomas.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento explicito. Es un modelo puramente de ASR.

## Casos de uso

- Subtitulado automatico de video en el navegador: el modelo esta disenado explicitamente para generar subtitulos a nivel de palabra en el cliente, tal como lo emplea CaptionsEasy, evitando enviar el audio a un servidor.
- Transcripcion de contenido en hindi e hinglish romanizado: util para creadores que publican en redes y necesitan subtitulos en alfabeto latino, mas faciles de leer y editar para audiencias que no dominan el devanagari.
- Edicion de video asistida por timestamps de palabra: la granularidad de los timestamps permite alinear subtitulos con cortes, animaciones o efectos a nivel de palabra en herramientas de postproduccion.
- Aplicaciones de accesibilidad offline: transcripcion en tiempo real o diferida que funciona sin conexion, aprovechando el modelo de 74 M de parametros y los pesos cuantizados.
- Sistemas de busqueda y indexacion de audio: al producir texto romanizado y timestamps, se puede indexar el contenido de podcasts o grabaciones y permitir busquedas por fragmentos.
- Prototipado rapido de pipelines ASR en JavaScript/TypeScript: integrable con `@huggingface/transformers` sin necesidad de infraestructura Python ni GPU en servidor.
- Preprocesado de datasets de voz para tareas de NLP posteriores: conversion de audio hindi/hinglish a texto romanizado como paso previo a analisis de sentimiento, resumen o clasificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de WER, MMLU, HumanEval ni ninguna otra, y los resultados de busqueda web recuperados no guardan relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida, coherente con un modelo de ~74 M de parametros. El repo ocupa 0,3 GB en total.
- Pesos fp16: aproximadamente 150 MB; pesos 8 bits: aproximadamente 80 MB; pesos q4f16: aproximadamente 40 MB (estimaciones derivadas del numero de parametros, no confirmadas en la documentacion).
- GPU recomendadas: cualquier GPU con soporte WebGPU para la ruta acelerada; no requiere A100, H100 ni RTX 4090. Una GPU integrada moderna o una tarjeta de gama de entrada pueden ser suficientes.
- Cabe en GPU de consumo: si, y tambien en CPU. La ruta WASM/CPU con cuantizacion de 8 bits esta prevista explicitamente en los archivos publicados.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `device: "webgpu"` o WASM/CPU; el modelo base admite otros runners de Whisper (por ejemplo, llama.cpp/whisper.cpp) solo si se reexportan los pesos, ya que este repositorio solo publica ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ishaan-g/whisper-hinglish-swift_timestamped | ~74 M | 30 s de audio | hi, en (salida romanizada) | Apache-2.0 | ONNX (fp16, q8, q4f16) |
| Oriserve/Whisper-Hindi2Hinglish-Swift | ~74 M | 30 s de audio | hi, en (salida romanizada) | Apache-2.0 | safetensors / transformers |
| openai/whisper-base | ~74 M | 30 s de audio | multilingue (99 idiomas) | Apache-2.0 | safetensors / transformers |
| openai/whisper-small | ~244 M | 30 s de audio | multilingue (99 idiomas) | Apache-2.0 | safetensors / transformers |

La diferencia clave frente al Whisper base original no es el rendimiento bruto, sino la especializacion en la salida romanizada para hindi/hinglish y la disponibilidad de pesos ONNX cuantizados listos para el navegador. Frente a whisper-small, este modelo es mas ligero y adecuado para ejecucion en cliente, a costa de una menor capacidad general. No se dispone de comparativas de WER entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ningun analisis de sesgo en la model card.
- Riesgo de alucinacion: inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o dominios alejados del entrenamiento. No se cuantifica en la documentacion.
- Limitacion de idioma: el modelo declara unicamente hindi e ingles; la salida se fuerza a alfabeto latino, lo que puede no ser deseable si se necesita devanagari. No se garantiza un rendimiento correcto fuera de esos idiomas.
- Ventana de audio limitada a 30 segundos por pasada; los audios mas largos requieren segmentacion externa.
- Este repositorio concreto tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en octubre de 2026; no cuenta con validacion de la comunidad ni con resultados de evaluacion publicados.
- Licencia Apache-2.0: permite uso comercial, pero se debe mantener la atribucion. El autor indica que todo el credito del modelo original corresponde a Oriserve.
- Dependencia del modelo base: cualquier limitacion o sesgo del ajuste fino de Oriserve se hereda sin cambios, ya que este repositorio solo reexporta los pesos.
- Solo se publican pesos ONNX; para otros runtimes (whisper.cpp, vLLM, TGI) seria necesario reconvertir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ishaan-g/whisper-hinglish-swift_timestamped
- Modelo base: https://huggingface.co/Oriserve/Whisper-Hindi2Hinglish-Swift
- Modelo de referencia para la exportacion con timestamps: https://huggingface.co/onnx-community/whisper-base_timestamped
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-base
- Producto que lo utiliza: https://www.captionseasy.com
- Paper de Whisper: no disponible en la informacion proporcionada.
