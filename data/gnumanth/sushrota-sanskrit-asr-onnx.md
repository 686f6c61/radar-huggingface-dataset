# gnumanth/sushrota-sanskrit-asr-onnx

## Resumen

Su-śrotā es un modelo de reconocimiento automático de voz (ASR) específico para sánscrito, desarrollado originalmente por el Prof. Prathosh A P en el Indian Institute of Science (IISc) de Bengaluru. Esta versión concreta, publicada por gnumanth, es una exportación a formato ONNX con cuantización INT8 del modelo `prathoshap/sushrota-sanskrit-asr`, diseñada para ejecutarse íntegramente en el navegador mediante `onnxruntime-web` (WebGPU/WASM) o localmente en Python sin necesidad de PyTorch ni NeMo.

Arquitectónicamente se basa en un modelo Conformer-CTC, concretamente en la variante IndicConformer-CTC adaptada al sánscrito, con aproximadamente 115 millones de parámetros activos. El repositorio incluye también un preprocesador neuronal que convierte audio PCM mono de 16 kHz en espectrogramas Mel de 80 bandas, lo que permite ejecutar todo el pipeline sin dependencias externas. Su relevancia radica en la posibilidad de realizar transcripción de sánscrito en tiempo real y sin servidor, con latencias muy bajas, lo que facilita aplicaciones educativas y de conservación lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer-CTC (IndicConformer, slice de sánscrito) |
| Parametros totales | ~115 millones (activos, según el autor) |
| Longitud de contexto | No disponible (modelo ASR, no aplica) |
| Tipos de cuantizacion | INT8 (MatMul) |
| Idiomas soportados | Sánscrito (sa) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (modelo principal y preprocesador) |

## Arquitectura y entrenamiento

El modelo original es un sistema de reconocimiento de voz basado en Conformer, una arquitectura híbrida que combina capas de atención con convoluciones, entrenado con un objetivo CTC (Connectionist Temporal Classification) para alineación automática de secuencias. La versión publicada aquí corresponde a la variante "v13b", que parte de un fine-tuning del modelo base "v5" con datos de usuarios reales consentidos, según se documenta en el repositorio del autor. El modelo original fue entrenado como parte del proyecto IndicConformer, del que se extrajo el subconjunto dedicado al sánscrito.

La exportación a ONNX incluye dos componentes: el modelo ASR cuantizado a INT8 (aproximadamente 178 MB) y un preprocesador neuronal que calcula el espectrograma Mel de 80 bandas a partir de audio PCM de 16 kHz. Esta separación permite que tanto el preprocesado como la inferencia se ejecuten sin frameworks de deep learning tradicionales, usando únicamente `onnxruntime` en Python o `onnxruntime-web` en el navegador. No se han publicado detalles sobre el tamaño exacto del dataset de entrenamiento ni sobre la composición de los datos más allá de la mención a datos de usuarios consentidos.

## Capacidades

- Transcripción de audio en sánscrito mediante decodificación CTC greedy (argmax + colapso de tokens repetidos + eliminación del token blank).
- Ejecución 100% en el navegador usando WebAssembly o WebGPU, sin necesidad de servidor ni de dependencias de PyTorch o NeMo.
- Ejecución local en Python con `onnxruntime`, `soundfile` y `numpy` únicamente.
- Incluye un preprocesador neuronal de audio a espectrograma Mel, lo que simplifica el pipeline completo.
- Baja latencia: aproximadamente 0,10 segundos para 3 segundos de audio en CPU de Mac (RTF 0,03) y 0,25 segundos para 2 segundos de audio en WebAssembly (RTF 0,12).
- Soporte de entrada de audio PCM mono a 16 kHz en coma flotante (Float32Array en JavaScript, array de NumPy en Python).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo de reconocimiento de voz puro.

## Casos de uso

- Transcripción de recitaciones védicas: el modelo puede convertir grabaciones de mantras y recitaciones en texto sánscrito, facilitando el estudio y la conservación de textos orales. Su baja latencia permite procesar audios largos de forma incremental.

- Dictado de textos en sánscrito para académicos: investigadores y estudiantes pueden dictar pasajes en sánscrito y obtener una transcripción inmediata, útil para redactar artículos o anotar manuscritos sin necesidad de teclado.

- Aplicaciones web educativas de pronunciación: al ejecutarse en el navegador, el modelo puede integrarse en plataformas de aprendizaje de sánscrito para evaluar la pronunciación del estudiante en tiempo real, comparando su audio con la transcripción esperada.

- Herramientas de accesibilidad para personas con discapacidad visual: un lector de pantalla que utilice ASR en sánscrito permitiría a usuarios con discapacidad visual dictar comandos o textos en esta lengua.

- Análisis de corpus orales en sánscrito: investigadores de lingüística pueden procesar grandes volúmenes de grabaciones para crear transcripciones automáticas y construir corpus anotados, gracias a la facilidad de ejecución en CPU sin hardware especializado.

- Integración en asistentes de estudio de gramática sánscrita: una aplicación móvil o web podría combinar el ASR con herramientas de análisis morfológico, permitiendo al usuario recitar una frase y recibir su desglose gramatical.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que se trata de un modelo de ASR, no de un modelo de lenguaje general. Los datos de rendimiento disponibles se refieren a latencia y factor de tiempo real (RTF), medidos por el autor:

| Metrica | Valor |
|---|---|
| Latencia en CPU Mac (audio de 3,0 s) | ~0,10 s |
| RTF en CPU Mac | 0,03 (aprox. 30x más rápido que tiempo real) |
| Latencia en WebAssembly (audio de 2,0 s) | ~0,25 s |
| RTF en WebAssembly | 0,12 (aprox. 8x más rápido que tiempo real) |
| Tamano del modelo ONNX INT8 | ~178 MB |
| Tamano del preprocesador ONNX | ~149 KB |

## Requisitos de hardware

- VRAM estimada: no requiere GPU dedicada; el modelo INT8 ocupa aproximadamente 178 MB en memoria, por lo que puede ejecutarse en CPU o en la GPU integrada del navegador mediante WebGPU.
- GPU recomendadas: cualquier GPU compatible con WebGPU para ejecución en navegador; en local no se necesita GPU.
- Compatibilidad con GPU de consumo: sí, cualquier tarjeta moderna (RTX 20xx o superior) puede ejecutarlo, aunque no es necesario.
- Opciones de despliegue: `onnxruntime-web` (navegador, WASM/WebGPU), `onnxruntime` en Python (CPU), integración en aplicaciones móviles mediante ONNX Runtime Mobile.
- Latencia y throughput: los datos del autor indican RTF de 0,03 en CPU Mac y 0,12 en WebAssembly, lo que permite procesar audio más rápido que en tiempo real en ambos entornos.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Formato | Licencia | Dependencias |
|---|---|---|---|---|---|
| gnumanth/sushrota-sanskrit-asr-onnx | Conformer-CTC | ~115M | ONNX INT8 | Apache-2.0 | onnxruntime |
| prathoshap/sushrota-sanskrit-asr | Conformer-CTC | ~115M | NeMo / PyTorch | Apache-2.0 | PyTorch, NeMo |
| Whisper (genérico, no específico de sánscrito) | Transformer encoder-decoder | 39M-1.5B | Safetensors, GGUF | MIT | PyTorch, transformers |

No se dispone de datos comparativos de rendimiento entre estos modelos en la información proporcionada. La principal diferencia entre la versión ONNX y la original es la ausencia de dependencias de PyTorch/NeMo y la posibilidad de ejecución en navegador, mientras que Whisper es una alternativa multilingüe que podría transcribir sánscrito con menor precisión al no estar entrenado específicamente para esta lengua.

## Limitaciones y advertencias

- El modelo solo reconoce sánscrito; no es multilingüe ni admite otros idiomas.
- Requiere audio de entrada en formato PCM mono a 16 kHz; cualquier otra frecuencia o formato debe convertirse antes de la inferencia.
- La decodificación CTC greedy puede producir errores en palabras poco frecuentes o en variantes dialectales no representadas en los datos de entrenamiento.
- Al ser un modelo ASR, no genera texto por sí mismo ni mantiene contexto conversacional; su salida es una transcripción literal.
- No se han publicado evaluaciones de sesgos o de robustez frente a ruido, acentos o condiciones de grabación adversas.
- La licencia Apache-2.0 permite uso comercial, pero el usuario es responsable de cumplir con los términos de la licencia y de citar al autor original si redistribuye el modelo.
- El modelo se distribuye como una exportación ONNX; no se incluyen los pesos originales en formato NeMo, por lo que no es posible reentrenarlo directamente con las herramientas originales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/gnumanth/sushrota-sanskrit-asr-onnx
- Modelo original en HuggingFace: https://huggingface.co/prathoshap/sushrota-sanskrit-asr
- Repositorio del modelo original en GitHub: https://github.com/prathoshap/sushrota-sanskrit-asr/tree/main
- Repositorio de la exportación en GitHub: https://github.com/gurusura/sushrota-sanskrit-asr-prathoshap
- Documentación de `onnxruntime-web`: https://onnxruntime.ai/docs/tutorials/web/ (enlace genérico, no incluido en la información proporcionada)
