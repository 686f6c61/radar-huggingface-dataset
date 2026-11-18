# atasoglu/gemma4-e2b-it-ConvFill-TR-ONNX

## Resumen

`atasoglu/gemma4-e2b-it-ConvFill-TR-ONNX` es la exportacion a ONNX, cuantizada en q4f16, del modelo `atasoglu/gemma4-e2b-it-ConvFill-TR`, un ajuste fino de `google/gemma-4-E2B-it` orientado a una tarea concreta: el *conversational infill* en turco. Es decir, el modelo esta entrenado para rellenar huecos dentro de un turno de conversacion, lo que lo hace util como motor de respuestas cortas en asistentes de voz donde el usuario dicta una frase parcial y el sistema debe completarla de forma coherente.

El desarrollo corre a cargo del usuario de Hugging Face `atasoglu`, que parte de los pesos oficiales de Gemma 4 E2B instruct y los somete a un ajuste fino supervisado con el dataset `atasoglu/convfill-dataset-tr-10k`. La metodologia se describe en el paper ConvFill (arXiv:2511.07397). El modelo base pertenece a la familia Gemma 4 de Google, con arquitectura transformer y licencia Gemma.

La relevancia de esta variante concreta es practica: es una exportacion ONNX pensada para ejecutarse en el navegador mediante transformers.js 4.x sobre WebGPU, con pesos cuantizados a 4 bits en las capas lineales. El repositorio ocupa 3,1 GB y esta disenado para descarga directa en cliente, sin servidor de inferencia. No obstante, el modelo solo soporta turco y su ambito funcional esta limitado a la tarea de infill conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E2B instruct); exportacion ONNX con grafos de `onnx-community/gemma-4-E2B-it-ONNX` |
| Parametros totales | no disponible (el nombre E2B sugiere ~2B efectivos, sin confirmacion en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q4f16: capas lineales a 4 bits (MatMulNBits, block size 32), embeddings sin cuantizar, activaciones en fp16 |
| Idiomas soportados | turco (tr) |
| Licencia | Gemma (incluye Prohibited Use Policy) |
| Formato de pesos | ONNX (q4f16), consumible con transformers.js 4.x |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Gemma 4, en su variante E2B instruct, ajustado mediante supervisión sobre el dataset `atasoglu/convfill-dataset-tr-10k`. La tarea de entrenamiento es el *conversational infill*: dado un contexto de conversacion con un hueco en el turno del asistente, el modelo genera el fragmento que falta. El paper ConvFill (arXiv:2511.07397) describe la metodologia; la model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales.

La exportacion a ONNX se realizo transplantando los pesos ajustados dentro de los grafos de `onnx-community/gemma-4-E2B-it-ONNX`. Las capas lineales se recuantizaron a 4 bits con MatMulNBits (block size 32) y los embeddings se mantuvieron sin cuantizar. Segun el autor, la cuantizacion introduce un coste de aproximadamente +0,02 bits por byte (0,3867 frente a 0,3663 en los primeros 500 ejemplos de validacion). El resultado es un artefacto que requiere soporte de `shader-f16` en el navegador y una descarga de unos 3 GB.

## Capacidades

- Generacion de texto en turco dentro de un contexto conversacional.
- Relleno de huecos (*conversational infill*): completar el fragmento que falta en un turno del asistente dado el historial previo.
- Orientacion a asistentes de voz: respuestas cortas y coherentes con el turno parcial del usuario.
- Ejecucion en navegador sobre WebGPU mediante transformers.js 4.x.
- Inferencia local sin servidor, con los pesos descargados en el cliente.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision, audio ni modo *thinking* en la informacion proporcionada.

## Casos de uso

- **Asistente de voz en turco embebido en web**: el modelo completa el turno del asistente a partir de la transcripcion parcial del usuario, lo que permite respuestas de baja latencia directamente en el navegador sin backend.
- **Autocompletado de respuestas en interfaces de chat**: dado un historial y una respuesta a medio escribir, el modelo sugiere la continuacion en turco, util en herramientas de atencion al cliente con agentes humanos.
- **Demostraciones y prototipos sin infraestructura**: al ejecutarse con transformers.js sobre WebGPU, permite publicar una demo interactiva en una pagina estatica sin servidor de inferencia.
- **Procesamiento local con privacidad**: al no requerir envio de datos a un servidor, encaja en escenarios donde la conversacion no puede salir del dispositivo del usuario.
- **Sistemas de dictado conversacional**: integrado en un pipeline de reconocimiento de voz a texto, completa frases dictadas de forma incompleta en turco.
- **Evaluacion de tecnicas de cuantizacion en navegador**: sirve como referencia practica para medir el coste de q4f16 en un modelo Gemma 4 E2B, con la metrica de bits por byte reportada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta metricas de cuantizacion y latencia:

| Metrica | Valor |
|---|---|
| Bits por byte (primeros 500 ejemplos de validacion) | 0,3867 (q4f16) frente a 0,3663 (referencia sin cuantizar) |
| Prefill de 263 tokens | ~0,3 s |
| Generacion por token | ~28 ms |
| Entorno de medida | GPU de escritorio, Chrome, WebGPU |

## Requisitos de hardware

- Descarga de pesos: ~3 GB (repositorio de 3,1 GB).
- VRAM estimada: no disponible de forma explicita; el modelo esta pensado para ejecutarse en GPU integrada o dedicada a traves de WebGPU, con pesos de 4 bits y activaciones fp16.
- Requiere soporte de `shader-f16` en el navegador (WebGPU).
- GPU de escritorio en Chrome: latencia reportada de ~0,3 s de prefill para 263 tokens y ~28 ms por token generado.
- Despliegue: transformers.js 4.x con `dtype: "q4f16"` y `device: "webgpu"`. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada de forma explicita; el autor cita "desktop GPU" sin especificar modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| `atasoglu/gemma4-e2b-it-ConvFill-TR-ONNX` (este) | no disponible | no disponible | tr | Gemma | ONNX q4f16 |
| `atasoglu/gemma4-e2b-it-ConvFill-TR` (base del ajuste) | no disponible | no disponible | tr | Gemma | safetensors (presumible, no confirmado) |
| `google/gemma-4-E2B-it` (modelo original) | no disponible | no disponible | multilingue | Gemma | safetensors |
| `onnx-community/gemma-4-E2B-it-ONNX` (grafos de referencia) | no disponible | no disponible | multilingue | Gemma | ONNX |

La comparacion se limita a la familia Gemma 4 E2B porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones detalladas de alternativas de otros proveedores.

## Limitaciones y advertencias

- **Idioma unico**: solo turco; no se garantiza un comportamiento correcto en otros idiomas.
- **Tarea restringida**: el ajuste esta orientado a *conversational infill*; su uso como modelo de proposito general no esta validado.
- **Riesgo de alucinacion**: no se documenta ninguna mitigacion especifica en la informacion disponible.
- **Sesgos**: no se documentan evaluaciones de sesgo ni de seguridad en la model card.
- **Licencia Gemma**: el uso comercial esta sujeto a los terminos de Gemma y a la Prohibited Use Policy de Google; es necesario revisarlos antes de desplegar en produccion.
- **Dependencia de WebGPU**: requiere navegador con soporte de `shader-f16`; no funciona en entornos sin WebGPU.
- **Cuantizacion**: la perdida de calidad medida es de +0,02 bits por byte, pero no se reportan evaluaciones cualitativas adicionales.
- **Contexto y parametros no confirmados**: la model card no detalla la longitud de contexto ni el numero exacto de parametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atasoglu/gemma4-e2b-it-ConvFill-TR-ONNX
- Modelo base del ajuste: https://huggingface.co/atasoglu/gemma4-e2b-it-ConvFill-TR
- Modelo original de Google: https://huggingface.co/google/gemma-4-E2B-it
- Grafos ONNX de referencia: https://huggingface.co/onnx-community/gemma-4-E2B-it-ONNX
- Dataset de entrenamiento: https://huggingface.co/datasets/atasoglu/convfill-dataset-tr-10k
- Paper ConvFill: https://arxiv.org/abs/2511.07397
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- transformers.js: https://github.com/huggingface/transformers.js
