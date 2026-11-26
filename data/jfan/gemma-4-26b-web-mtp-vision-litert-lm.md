# jfan/gemma-4-26b-web-mtp-vision-litert-lm

## Resumen

Gemma 4 26B-A4B en formato LiteRT-LM optimizado para ejecución en navegador mediante WebGPU. Se trata de una conversión del modelo `gemma-4-26B-it` de Google DeepMind realizada por el usuario jfan, empaquetada con la cadena oficial de conversión de Google (exportadores de ViT y adaptador de visión, `converter_main` y `litertlm_builder_cli`). El resultado son cuatro variantes `.litertlm` autocontenidas que incorporan decodificación especulativa mediante Multi-Token Prediction (MTP), visión con presupuestos de tokens configurables y, opcionalmente, audio.

La relevancia de este artefacto es fundamentalmente de despliegue: traslada un modelo multimodal de 26.000 millones de parámetros al entorno del navegador, un escenario históricamente reservado a modelos mucho más pequeños. Para ello se apoya en pesos cuantizados (Int8 con recuperación QAT en el codificador visual, FP16 en WebGPU) y en un decodificador con MTP que reduce el número de pasos de decodificación necesarios.

La nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4.000 millones de parámetros activos, aunque la model card no detalla la configuración de expertos ni la longitud de contexto. El repositorio ocupa 513,8 GB, muy por encima del tamaño de cada variante individual (entre 16,0 y 16,8 GB), lo que indica que aloja múltiples artefactos y posiblemente material intermedio de conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4) con decodificación especulativa MTP; encoder de visión ViT y encoder de audio Conformer USM |
| Parametros totales | 26B (según nomenclatura del modelo; no detallado en la model card) |
| Parametros activos | ~4B (según nomenclatura "A4B"; configuración de expertos no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Int8 con recuperación de pesos QAT (encoder de visión); FP16 (WebGPU, encoder de audio); cuantización del decodificador no especificada |
| Idiomas soportados | no disponible |
| Licencia | Gemma (términos de uso de Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM); variantes de 16,0 a 16,8 GB |

## Arquitectura y entrenamiento

El modelo base es `gemma-4-26B-it`, un transformer multimodal de la familia Gemma 4. La nomenclatura "26B-A4B" apunta a una arquitectura de mezcla de expertos con 26.000 millones de parámetros totales y alrededor de 4.000 millones activos por token, si bien la model card no proporciona el número de expertos, el mecanismo de enrutamiento ni los detalles de entrenamiento (volumen de tokens, composición del corpus, fases de RLHF o DPO). Tampoco se documenta la longitud de contexto nativa.

La innovación principal de este empaquetado es la integración de Multi-Token Prediction (MTP) como mecanismo de decodificación especulativa, que permite proponer varios tokens por paso y verificarlos en paralelo. El pipeline visual emplea un encoder ViT exportado con múltiples firmas (`vision_70`, `vision_140`, `vision_280`, `vision_560`, `vision_1120`), atención con troceado de consultas (`max_query_chunk_size = 630`, k=16 en el presupuesto de 1120 tokens) y normalización RMS sin parámetros (`mm_standardize_soft_tokens`). El adaptador de visión pliega la escala RMS de salida en la proyección lineal para preservar la precisión en FP16 sobre WebGPU. El audio se procesa con un encoder Conformer USM en FP16 y un adaptador restringido a CPU.

## Capacidades

- Generación de texto y conversación multi-turno en el navegador mediante WebGPU.
- Comprensión de imágenes con presupuesto de tokens configurable (70, 140, 280, 560 o 1120 tokens visuales), lo que permite ajustar coste y detalle por consulta.
- Comprensión de audio mediante encoder Conformer USM y adaptador específico (solo en las variantes con audio).
- Decodificación especulativa con Multi-Token Prediction para acelerar la generación.
- Ejecución local en el cliente sin backend de inferencia dedicado, gracias al runtime LiteRT-LM.
- Capacidades de tool calling, agentes, razonamiento matemático o generación de código: no documentadas en la información disponible.

## Casos de uso

- Asistentes web con privacidad por diseño: la inferencia ocurre en el dispositivo del usuario vía WebGPU, de modo que el contenido de las conversaciones no se envía a un servidor; adecuado para aplicaciones de productividad o salud con requisitos estrictos de confidencialidad.
- Descripción y análisis de imágenes en el navegador: con el presupuesto `vision_280` o `vision_560` se pueden procesar capturas, documentos escaneados o fotografías sin subirlas a la nube, ajustando el coste computacional al nivel de detalle requerido.
- Subtitulado y análisis de audio en local: la variante con audio permite transcribir o interpretar clips cortos dentro de una aplicación web, útil en herramientas de accesibilidad o reuniones.
- Demostraciones interactivas de modelos grandes: investigadores pueden publicar demos de un modelo de 26B sin infraestructura GPU propia, aprovechando la decodificación MTP para mantener una latencia aceptable.
- Procesamiento de documentos con componentes visuales: extracción de información de formularios, tablas o diagramas combinando OCR implícito del encoder visual con el decodificador de texto.
- Prototipado de agentes multimodales en el cliente: la combinación de visión, audio y texto en un único artefacto permite construir flujos que reaccionan a la pantalla o al micrófono del usuario sin backend.
- Evaluación comparativa de cuantizaciones: las cuatro variantes permiten medir el coste real de añadir visión o audio sobre el mismo decodificador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM: cada variante pesa entre 16,0 GB (texto+MTP) y 16,8 GB (visión+audio); el runtime necesita memoria adicional para el contexto KV y los buffers de WebGPU, por lo que conviene disponer de al menos 20-24 GB de memoria unificada o de sistema.
- GPU de escritorio: se recomienda una GPU con soporte WebGPU maduro y 16 GB o más de VRAM (RTX 4080/4090, RX 7900 XTX). En A100 o H100 la ejecución sería posible pero desaprovecha el objetivo del artefacto, orientado a cliente.
- GPU de portátil: viable en equipos Apple Silicon con memoria unificada de 24 GB o más y en portátiles con RTX 4080/4090 Mobile.
- GPU de consumo: no cabe en tarjetas de 8-12 GB en su forma actual; requeriría cuantizaciones más agresivas no publicadas en este repositorio.
- Despliegue: runtime LiteRT-LM con backend WebGPU; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no consumen el formato `.litertlm`.
- Latencia y throughput: no disponibles; la decodificación MTP está diseñada para reducirlos, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| Gemma 4 26B-A4B (esta ficha) | 26B totales / ~4B activos | no disponible | Texto, visión, audio | `.litertlm` (WebGPU) | Gemma |
| Gemma 3 27B | 27B densos | 128K | Texto, visión | safetensors, GGUF | Gemma |
| Qwen2.5-VL 32B | 32B densos | 128K | Texto, visión | safetensors, GGUF | Apache 2.0 |
| Llama 3.3 70B | 70B densos | 128K | Solo texto | safetensors, GGUF | Llama |

La comparación con Gemma 3 27B y Qwen2.5-VL 32B es la más directa por rango de parámetros; ambos ofrecen contextos documentados de 128K y pesos en formatos estándar, mientras que esta variante prioriza el despliegue en navegador a costa de un ecosistema de herramientas más reducido. Frente a Llama 3.3 70B, el modelo aquí descrito es mucho más ligero y añade multimodalidad, aunque no se dispone de datos de rendimiento para cuantificar la diferencia.

## Limitaciones y advertencias

- La model card no documenta sesgos, datos de entrenamiento ni evaluaciones de seguridad; no hay base para estimar el riesgo de alucinación más allá de lo habitual en modelos de su clase.
- Longitud de contexto e idiomas soportados no están especificados, lo que impide planificar despliegues con requisitos de ventana larga o multilingüismo.
- El formato `.litertlm` limita la interoperabilidad: no es compatible con los runtimes de inferencia habituales (vLLM, llama.cpp, TGI), lo que restringe las opciones de servicio en servidor.
- El tamaño de 16-17 GB por variante excluye la mayoría de GPU de consumo y exige memoria unificada o VRAM alta; el rendimiento real en WebGPU depende del navegador y del driver.
- La licencia Gemma impone términos de uso de Google que deben revisarse antes de un uso comercial; no es una licencia de código abierto permisiva.
- El adaptador de audio está restringido a CPU, lo que puede convertirse en cuello de botella en las variantes con audio.
- El repositorio (513,8 GB) contiene artefactos de gran tamaño; conviene descargar solo la variante necesaria.
- Es una conversión de terceros: no hay garantía de que el comportamiento coincida exactamente con el modelo original de Google.

## Enlaces

- Hugging Face: https://huggingface.co/jfan/gemma-4-26b-web-mtp-vision-litert-lm
- LiteRT-LM (runtime): https://github.com/google-ai-edge/LiteRT-LM
- LiteRT (antes TensorFlow Lite): https://github.com/google-ai-edge/LiteRT
- WebGPU: https://www.w3.org/TR/webgpu/
- Familia Gemma de Google: https://ai.google.dev/gemma
- Términos de licencia Gemma: https://ai.google.dev/gemma/terms
