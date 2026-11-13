# remiavelo/sherpa-onnx-lite-whisper-large-v3-turbo-acc-int8

## Resumen

`sherpa-onnx-lite-whisper-large-v3-turbo-acc-int8` es una conversión experimental del modelo de reconocimiento automático de voz `efficient-speech/lite-whisper-large-v3-turbo-acc` al formato ONNX para su uso con el runtime [sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) 2.0.1. Lo publica el usuario `remiavelo` en Hugging Face bajo licencia Apache-2.0, y deriva de la familia Whisper large-v3-turbo de OpenAI, en concreto de una variante "lite" con capas de bajo rango (low-rank) propuesta en el artículo arXiv:2502.20583.

El objetivo es ofrecer un ASR (automatic speech recognition) empaquetado en ONNX cuantizado a int8 que pueda ejecutarse en dispositivos modestos, incluidos teléfonos móviles, mediante sherpa-onnx. El repositorio ocupa 1,2 GB y contiene tres ficheros: encoder, decoder y vocabulario de tokens. La nomenclatura y las entradas siguen las del modelo `csukuangfj/sherpa-onnx-whisper-turbo` (128 bins mel).

La relevancia de esta ficha es doble: por un lado, muestra el estado del arte en compresión de Whisper para despliegue en el borde; por otro, es un ejemplo de conversión problemática, ya que el autor documenta que la cuantización int8 estándar rompe las capas de bajo rango del encoder y requiere mantener en fp32 139 nodos MatMul. El resultado es un encoder más grande (799 MB frente a 675 MB) y aproximadamente un 25 % más lento que el turbo int8 de referencia, con transcripciones de calidad similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo con capas de bajo rango, "lite") |
| Parametros totales | no disponible (repo de 1,2 GB; encoder int8 799 MB + decoder int8 361 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s típica de Whisper, no confirmada en la información) |
| Tipos de cuantizacion | int8 dinámica con 139 nodos MatMul del encoder en fp32 (h @ W2); decoder int8 |
| Idiomas soportados | no disponible (el autor prueba con 7 clips cortos en francés con idioma forzado) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder y decoder int8), vocabulario en `turbo-tokens.txt` |

## Arquitectura y entrenamiento

El modelo subyacente es `efficient-speech/lite-whisper-large-v3-turbo-acc`, una variante de Whisper large-v3-turbo descrita en el artículo arXiv:2502.20583. Whisper large-v3-turbo es un transformer encoder-decoder con 128 bins mel de entrada y decodificación autorregresiva; la variante "lite" introduce capas de bajo rango (low-rank) en el encoder para reducir el coste computacional y el número de parámetros. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La conversión a sherpa-onnx se realizó para la versión 2.0.1 del runtime. El autor documenta un problema técnico relevante: las capas de bajo rango del encoder no sobreviven a una cuantización dinámica int8 estándar (la salida se reduce a "..."), por lo que los MatMul que parten de la representación de bajo rango (`h @ W2`, 139 nodos) se mantienen en fp32 y el resto se cuantiza a int8. El decoder sí se cuantiza íntegramente a int8. Los nombres de fichero y las entradas siguen los del modelo `csukuangfj/sherpa-onnx-whisper-turbo` con 128 bins mel.

## Capacidades

- Reconocimiento automático de voz (ASR) en formato encoder-decoder tipo Whisper.
- Transcripción de audio con idioma forzado (el autor lo prueba con francés).
- Ejecución en sherpa-onnx 2.0.1, lo que permite despliegue en C++, Python, móvil y otros bindings del runtime.
- Entrada de 128 bins mel, compatible con los ficheros y utilidades de `csukuangfj/sherpa-onnx-whisper-turbo`.
- No se documentan capacidades de traducción, diarización, tool calling ni agentes; es un modelo puramente ASR.
- Idiomas soportados: no disponible en la información (Whisper large-v3-turbo es multilingüe, pero la conversión no especifica la cobertura efectiva).

## Casos de uso

- Transcripción en dispositivos móviles: el objetivo declarado del autor es probar el modelo en teléfonos; el formato ONNX y la cuantización int8 permiten integrarlo en apps Android/iOS mediante sherpa-onnx sin depender de la nube.
- Subtitulado offline de vídeo o audio: al ejecutarse en local con sherpa-onnx, se puede transcribir contenido sin enviar datos a servidores externos, útil por privacidad.
- Dictado por voz en aplicaciones de escritorio: integración con bindings de sherpa-onnx en Python o C++ para capturar micrófono y transcribir en tiempo real en equipos x86-64 modestos.
- Procesamiento por lotes de archivos de audio: el decoder int8 y el encoder parcialmente fp32 permiten ejecutar pipelines de transcripción en CPU de 4 núcleos, como reporta el autor.
- Evaluación de técnicas de cuantización: el repositorio sirve como caso de estudio de por qué la cuantización dinámica int8 falla en capas de bajo rango y cómo mitigarlo manteniendo nodos en fp32.
- Prototipado de asistentes de voz embebidos: combinado con un modelo de lenguaje pequeño, puede formar la etapa ASR de un asistente local en dispositivos con recursos limitados.
- Investigación en ASR multilingüe de bajo coste: permite comparar la variante "lite" frente a Whisper large-v3-turbo estándar en términos de calidad y latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una comparación cualitativa: en un host x86-64 de 4 núcleos, con 7 clips cortos en francés y idioma forzado, las transcripciones son cercanas a las de `large-v3-turbo` int8, pero el encoder es más grande (799 MB frente a 675 MB) y aproximadamente un 25 % más lento.

| Metrica | Este modelo | large-v3-turbo int8 (referencia) |
|---|---|---|
| Tamano del encoder | 799 MB | 675 MB |
| Tamano del decoder | 361 MB | no disponible |
| Latencia relativa | ~25 % más lento | línea base |
| Calidad de transcripción | cercana a la referencia (7 clips en francés) | línea base |

## Requisitos de hardware

- VRAM/RAM estimada: el repo completo son 1,2 GB; en ejecución hay que cargar encoder (799 MB) y decoder (361 MB), por lo que se recomienda al menos 2 GB de RAM libre para CPU, o VRAM equivalente en GPU.
- GPU recomendadas: no disponibles en la información; el autor solo prueba en CPU x86-64 de 4 núcleos.
- Cabe en GPU consumer: sí, cualquier GPU con 2 GB o más de VRAM debería poder alojar los pesos, aunque no se han publicado pruebas.
- Despliegue: sherpa-onnx 2.0.1 (runtime principal); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato ONNX.
- Latencia y throughput: el autor reporta que es aproximadamente un 25 % más lento que `large-v3-turbo` int8 en CPU de 4 núcleos; no hay cifras absolutas de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| `remiavelo/sherpa-onnx-lite-whisper-large-v3-turbo-acc-int8` | no disponible | no disponible | ONNX int8 (encoder parcial fp32) | Apache-2.0 | Experimental, encoder 799 MB, ~25 % más lento que turbo int8 |
| `csukuangfj/sherpa-onnx-whisper-turbo` | no disponible | no disponible | ONNX | Apache-2.0 | Referencia de nombres y entradas; encoder int8 de 675 MB |
| `efficient-speech/lite-whisper-large-v3-turbo-acc` | no disponible | no disponible | safetensors (presumiblemente) | Apache-2.0 | Modelo base sin cuantizar, paper arXiv:2502.20583 |
| Whisper large-v3-turbo (OpenAI) | no disponible | 30 s de audio | PyTorch/safetensors | MIT (según versión) | Modelo original del que deriva la familia |

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor: la cuantización int8 no es limpia y requiere mantener 139 nodos MatMul en fp32.
- El encoder resultante es más grande y más lento que el turbo int8 de referencia, por lo que no es una mejora en eficiencia.
- Solo se han probado 7 clips cortos en francés con idioma forzado; no hay evaluación sistemática de calidad, idiomas ni acentos.
- Idiomas soportados no documentados: aunque Whisper large-v3-turbo es multilingüe, la conversión no garantiza cobertura ni calidad por idioma.
- Riesgo de alucinación inherente a los modelos Whisper, especialmente en audio con ruido o silencios largos.
- Sesgos: no documentados en la información, pero heredados del corpus de entrenamiento de Whisper.
- Licencia Apache-2.0 permite uso comercial, pero el carácter experimental y la falta de benchmarks desaconsejan producción sin validación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por la comunidad.
- No se especifican requisitos de versión de sherpa-onnx más allá de 2.0.1; versiones distintas pueden no ser compatibles.

## Enlaces

- Hugging Face: https://huggingface.co/remiavelo/sherpa-onnx-lite-whisper-large-v3-turbo-acc-int8
- Modelo base: https://huggingface.co/efficient-speech/lite-whisper-large-v3-turbo-acc
- Paper: https://arxiv.org/abs/2502.20583
- sherpa-onnx: https://github.com/k2-fsa/sherpa-onnx
- Modelo de referencia de nombres: https://huggingface.co/csukuangfj/sherpa-onnx-whisper-turbo
