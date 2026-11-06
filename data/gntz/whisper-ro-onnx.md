# Gntz/whisper-ro-onnx

## Resumen

`Gntz/whisper-ro-onnx` es una conversión al formato ONNX del modelo `readerbench/whisper-ro`, un Whisper small reentrenado para rumano por el equipo ReaderBench. El autor de esta conversión, Gntz, la publica empaquetada siguiendo la estructura de ficheros que espera Transformers.js v4 para la tarea `automatic-speech-recognition`, con el objetivo de habilitar la transcripción de notas de voz directamente en el navegador (WASM o WebGPU) dentro de la aplicación SIA Teren.

El modelo no introduce cambios en los pesos más allá del export a ONNX y la cuantización: la arquitectura subyacente es la de Whisper small, un transformer encoder-decoder orientado a reconocimiento automático del habla, especializado en rumano mediante fine-tuning sobre el modelo original de OpenAI. El repositorio ocupa 1,5 GB e incluye variantes fp32, q8 (cuantización dinámica de onnxruntime) y q4 (MatMulNBits con block_size=32).

Su relevancia es acotada pero concreta: cubre un nicho poco atendido (ASR en rumano) y lo hace en un formato pensado para inferencia en el cliente, sin necesidad de backend. La licencia Apache-2.0 se mantiene respecto al modelo original. No hay resultados de benchmarks publicados todavía; el propio autor indica que la medición de WER está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (transformer encoder-decoder) exportado a ONNX (opset 18, decoder merged con `use_cache_branch`) |
| Parametros totales | no disponible (Whisper small, tamano no detallado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio tipica de Whisper, `chunk_length_s: 30` en el ejemplo de uso) |
| Tipos de cuantizacion | fp32, q8 (dynamic quantization de onnxruntime), q4 (MatMulNBitsQuantizer, block_size=32, symmetric) |
| Idiomas soportados | rumano (`ro`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `encoder_model_quantized.onnx`, `encoder_model_q4.onnx`, `decoder_model_merged.onnx`, `decoder_model_merged_quantized.onnx`, `decoder_model_merged_q4.onnx`) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper small, un modelo encoder-decoder basado en transformer que procesa audio (mel-spectrogramas) y genera texto de forma autorregresiva. El export se realizó con `optimum-cli export onnx --model readerbench/whisper-ro --task automatic-speech-recognition-with-past`, con opset 18, decoder fusionado con `use_cache_branch` y embeddings atados de-duplicados. La cuantización sigue la receta de Transformers.js (`scripts/quantize.py`): q8 mediante cuantización dinámica de onnxruntime (pesos del encoder en QUInt8, del decoder en QInt8, `per_channel=false`, `reduce_range=false`, `EnableSubgraph`) y q4 mediante `MatMulNBitsQuantizer` con `block_size=32` y modo simétrico.

El entrenamiento original corresponde a ReaderBench, que reentrenó Whisper small sobre rumano. La información proporcionada no detalla el volumen de datos, la composición del dataset ni si hubo etapas de RLHF o DPO; en el contexto de un modelo ASR, esos datos no son habituales. No se describen innovaciones técnicas adicionales más allá del pipeline de export y cuantización para Transformers.js. Las versiones de herramientas empleadas son optimum 2.1.0, optimum-onnx 0.1.0, transformers 4.57.6, torch 2.15.0+cpu, onnx 1.23.2 y onnxruntime 1.31.1, sobre la revisión `a2fd10c2cccb72bbec7f77781d4d34dab4c2241e` del modelo base.

## Capacidades

- Reconocimiento automático del habla (ASR) en rumano, con la tarea `transcribe`.
- Transcripción de audio de 16 kHz en formato float32, procesado por fragmentos de hasta 30 segundos (`chunk_length_s: 30`).
- Inferencia en navegador mediante Transformers.js v4, con backend WASM o WebGPU.
- Soporte de cuantización q8 y q4 para reducir el tamaño y el coste de cómputo en el cliente.
- No se documentan capacidades de traducción, diarización, detección de idioma, tool calling ni razonamiento multi-paso; el modelo está orientado exclusivamente a transcripción.
- Capacidad multilingüe: no, solo rumano.

## Casos de uso

- Transcripción de notas de voz en el navegador: la aplicación SIA Teren lo usa para convertir notas habladas en texto directamente en el dispositivo, sin enviar audio a un servidor, aprovechando la inferencia WASM/WebGPU de Transformers.js.
- Aplicaciones web de dictado en rumano: un editor o formulario puede integrar el pipeline `automatic-speech-recognition` y transcribir entradas de voz sin backend, con la variante q8 para equilibrar calidad y tamaño.
- Herramientas de accesibilidad para hablantes de rumano: subtitulado o transcripción en tiempo casi real de audio corto en el cliente, útil cuando no se puede depender de servicios en la nube por privacidad.
- Procesamiento por lotes de audios cortos en local: con la variante fp32 o q8 y onnxruntime, se pueden transcribir ficheros de hasta 30 segundos por fragmento en un script de escritorio.
- Prototipado rápido de productos ASR en rumano: al estar empaquetado para Transformers.js, se puede probar el modelo en una página web con pocas líneas de código antes de decidir una arquitectura de producción.
- Aplicaciones offline o de campo: escenarios con conectividad limitada donde la transcripción debe ocurrir en el dispositivo, como la propia app SIA Teren.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la medición de WER en el pipeline de navegador de Transformers.js está pendiente. Como nota cualitativa, el autor advierte de que el modelo tiende a escribir los números con letras (por ejemplo, "o mie nouă sute șaizeci" para "1960"), lo que se contabiliza como errores frente a las referencias de FLEURS.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio completo ocupa 1,5 GB, por lo que la variante fp32 es la más pesada y las variantes q8 y q4 reducen sustancialmente el espacio en memoria.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo está pensado para ejecutarse en el navegador con WebGPU o WASM, no para servir desde GPU de datacenter.
- ¿Cabe en GPU de consumo? El diseño apunta a inferencia en el cliente (navegador), lo que implica que debe caber en hardware de usuario final; no se detallan modelos concretos de GPU.
- Opciones de despliegue: Transformers.js v4 (`@huggingface/transformers`) con `device: 'wasm'` o `device: 'webgpu'`; también onnxruntime de forma directa, dado que los ficheros son ONNX estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Gntz/whisper-ro-onnx | no disponible (Whisper small) | no disponible | rumano | Apache-2.0 | ONNX (fp32/q8/q4) | Conversión para Transformers.js, uso en navegador |
| readerbench/whisper-ro | no disponible (Whisper small) | no disponible | rumano | Apache-2.0 | safetensors (presumiblemente) | Modelo base original de ReaderBench |
| openai/whisper-small | no disponible | no disponible | multilingüe | Apache-2.0 | safetensors, ONNX en la comunidad | Referencia general de ASR; no especializado en rumano |

La información proporcionada no incluye datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- Solo soporta rumano; no es un modelo multilingüe.
- El WER no está medido ni publicado; no hay evidencia cuantitativa de calidad frente a alternativas.
- Tendencia conocida a escribir números con letras, lo que puede inflar el WER frente a referencias que usan dígitos y requerir normalización posterior.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido, silencios largos o habla no rumana.
- Sesgos: no documentados en la información proporcionada; al ser un fine-tuning sobre rumano, puede reflejar sesgos del corpus de entrenamiento original.
- Licencia Apache-2.0, que permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- La conversión no modifica los pesos más allá del export y la cuantización, por lo que hereda las limitaciones del modelo base.
- Orientado a inferencia en cliente; no se documentan prestaciones para despliegue en servidor con vLLM o TGI (formatos no soportados de forma nativa para este pipeline).
- Fecha de creación del repositorio: 2026-11-01; sin descargas ni likes, lo que sugiere poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Gntz/whisper-ro-onnx
- Modelo base: https://huggingface.co/readerbench/whisper-ro
- Transformers.js: https://github.com/huggingface/transformers.js
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
