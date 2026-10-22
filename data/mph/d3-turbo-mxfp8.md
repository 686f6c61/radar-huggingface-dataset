# mph/d3-turbo-MXFP8

## Resumen

d3-turbo-MXFP8 es una cuantización en MXFP8 del modelo vllm-sr/d3-turbo, publicada por el usuario mph con NVIDIA TensorRT Model Optimizer (ModelOpt) v0.47.0. No es un modelo generativo al uso: se presenta como un "decision model" que recibe una entrada (texto o JSON, opcionalmente con imágenes y vídeo) y responde a preguntas sobre ella —elección entre opciones, sí/no, puntuación, caja delimitadora o seguimiento— devolviendo una probabilidad para cada opción. Su pipeline declarado en HuggingFace es `zero-shot-classification`.

El checkpoint tiene 26.845.547.760 parámetros (unos 26,85 B) y ocupa 28,6 GB en el repositorio. La arquitectura corresponde a la familia Qwen3.5 según los tags, con atención completa combinada con capas Gated DeltaNet (atención lineal) y una torre visual, además de una cabeza de lectura de 255 vías que codifica las respuestas. El backbone no incluye `lm_head` ni módulos MTP, por lo que no genera texto libre.

La relevancia de esta ficha es doble: por un lado documenta un formato de cuantización de bloque (MXFP8) que reduce a la mitad la memoria de pesos frente a BF16 manteniendo granularidad fina de escala; por otro, advierte de que el cálculo MXFP8 nativo exige GPU NVIDIA Blackwell (SM100/SM120), lo que condiciona por completo el despliegue. El modelo se distribuye con licencia Apache 2.0 y requiere `trust_remote_code=True` para cargarse.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención completa y capas Gated DeltaNet (atención lineal), más torre visual; familia Qwen3.5 según el tag `qwen3_5` |
| Parámetros totales | 26.845.547.760 (~26,85 B), dato real de safetensors |
| Parámetros activos | No aplica: la información disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | MXFP8 (FP8 E4M3 con escala compartida E8M0 de potencia de dos por bloque de 32 elementos). Quedan en BF16: `language_model.embed_tokens`, la convolución de Gated DeltaNet y `in_proj_a`/`in_proj_b`, y todos los módulos de visión (`visual.*`). El readout de 255 vías (`readout.safetensors`) permanece en FP32. La KV cache se mantiene en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `modelopt_state.pth` + `readout.safetensors`), con `custom_code` y carga mediante `trust_remote_code=True` |

## Arquitectura y entrenamiento

La información disponible describe la estructura del checkpoint cuantizado, no el proceso de entrenamiento del modelo original. El backbone combina capas de atención completa (proyecciones `q/k/v/o` cuantizadas) con capas Gated DeltaNet, un mecanismo de atención lineal con estado recurrente cuyas proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` también se cuantizan, mientras que su convolución y las proyecciones `in_proj_a`/`in_proj_b` se dejan en BF16. A esto se suma una torre visual (`visual.*`) que permanece íntegramente en BF16 y una cabeza de lectura de 255 vías en FP32 que transforma el estado del backbone en un código de respuesta, sin `lm_head` ni módulos de predicción multi-token.

La innovación técnica de esta publicación es la cuantización: cada bloque de 32 elementos comparte una única escala E8M0 (potencia de dos), de modo que pesos y activaciones se almacenan en FP8 E4M3 con corrección de escala muy local. Los pesos lineales cuantizados se empaquetan en `MXFP8QTensor` y se restauran desde `model.safetensors` junto con `modelopt_state.pth`. El resultado es aproximadamente la mitad de memoria de pesos que en BF16 con una precisión declarada cercana, a costa de exigir hardware con soporte nativo de MXFP8. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Clasificación zero-shot: responde preguntas sobre una entrada devolviendo una probabilidad por cada opción disponible, con un readout de 255 vías.
- Formatos de respuesta múltiples: elección entre alternativas (`choice`), sí/no, puntuación (`score`), caja delimitadora (`box`) y seguimiento (`track`).
- Entrada multimodal: acepta texto, JSON, imágenes y vídeo como contexto de la decisión.
- Procesamiento de decisión único por invocación mediante el método `system_one`.
- No genera texto libre: al carecer de `lm_head`, su salida es una distribución de probabilidad sobre códigos de respuesta, no una secuencia de tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está diseñado para una decisión por llamada.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Moderación de contenido: dada una publicación y un conjunto de políticas, el modelo devuelve la probabilidad de cada categoría de infracción. La salida probabilística permite fijar umbrales por política en lugar de depender de una generación de texto libre.
- Triaje de tickets de soporte: con asunto y cuerpo del ticket como entrada, se obtiene una distribución sobre colas o niveles de urgencia, lo que permite enrutado automático con umbrales calibrados.
- Enrutado de consultas en un sistema RAG: clasificación zero-shot de la intención del usuario entre un conjunto fijo de rutas (búsqueda documental, consulta a base de datos, escalado a humano) antes de invocar el generador.
- Verificación documental con imagen: al aceptar imágenes, puede puntuar si un documento o una captura cumple un criterio (por ejemplo, presencia de sello, coincidencia de campos) devolviendo una probabilidad por criterio.
- Inspección visual de calidad: sobre imágenes o vídeo de una línea de producción, respuestas de tipo `box` permiten localizar defectos y `track` seguir su evolución entre fotogramas.
- Análisis de vídeo y seguimiento de objetos: la modalidad `track` sirve para etiquetar trayectorias en material grabado, con la ventaja de que la decisión se emite como probabilidad por opción y facilita el filtrado posterior.
- Anotación asistida de datasets: preetiquetado de decision sets (pregunta + opciones + respuesta esperada) con puntuaciones de confianza que permiten priorizar la revisión humana.
- Cumplimiento normativo y comprobaciones booleanas: preguntas de sí/no sobre contratos o formularios, con la probabilidad asociada como medida de riesgo antes de escalar el caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint solo documenta qué módulos se cuantizan y los requisitos de hardware; no incluye MMLU, HumanEval, GSM8K ni métricas de clasificación o detección, ni comparaciones con el modelo base en BF16. Tampoco se indican latencia ni throughput.

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan aproximadamente 27 GB (el repositorio completo son 28,6 GB). La model card indica que el runtime carga el modelo en un único dispositivo, por lo que se necesita una GPU de 32 GB o más, con margen adicional para activaciones de visión y la caché de estado por petición.
- Cálculo MXFP8 nativo: exclusivamente GPU NVIDIA Blackwell (SM100/SM120). Fuera de esa generación no hay soporte nativo del formato y habría que recurrir a descompresión a BF16, lo que aproximadamente duplicaría la memoria de pesos (estimación derivada de la propia model card, no un dato publicado).
- GPU recomendadas: Blackwell de centro de datos (B200, GB200) para producción con cálculo MXFP8 nativo; RTX 5090 (32 GB, SM120) como opción de gama alta de consumo, aunque el margen sobre los 27 GB de pesos es estrecho.
- GPU no viables: RTX 4090 y cualquier tarjeta de 24 GB o menos no pueden alojar los pesos en MXFP8; A100 y H100 no ofrecen cálculo MXFP8 nativo.
- Despliegue: carga con `transformers` y `trust_remote_code=True` invocando `system_one`; el tag `endpoints_compatible` sugiere compatibilidad con endpoints alojados. El checkpoint se generó con ModelOpt v0.47.0, por lo que el ecosistema TensorRT-LLM es la vía natural en Blackwell. Soporte en vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada (MXFP8 no es un formato habitual en llama.cpp/Ollama).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mph/d3-turbo-MXFP8 | 26,85 B | No disponible | MXFP8 (E4M3 + E8M0 por bloque de 32) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| vllm-sr/d3-turbo (base) | 26,85 B (misma arquitectura) | No disponible | BF16 (presumiblemente, no confirmado) | No disponible en la información consultada | HuggingFace |
| Otras alternativas de clasificación zero-shot o modelos de decisión de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la información disponible modelos directamente comparables con la misma combinación de decisión multimodal (texto, JSON, imagen y vídeo) y salida probabilística de 255 vías. La comparación más fiable es frente al checkpoint base: esta versión reduce a la mitad la memoria de pesos y añade la dependencia de hardware Blackwell.

## Limitaciones y advertencias

- No es un modelo generativo: no hay `lm_head` ni módulos MTP, de modo que no puede producir texto libre, resúmenes ni explicaciones. Cualquier caso de uso que requiera justificar la decisión necesita un modelo adicional.
- Ausencia total de benchmarks publicados: no hay evidencia pública sobre la degradación de precisión introducida por MXFP8 frente al BF16 original, ni sobre calibración de probabilidades.
- Dependencia dura de hardware: el cálculo MXFP8 nativo solo existe en Blackwell (SM100/SM120); en otras GPU el rendimiento o la viabilidad se degradan sin datos publicados que lo cuantifiquen.
- Ejecución de código remoto: la carga exige `trust_remote_code=True`, lo que implica ejecutar código del repositorio. Conviene auditar los ficheros de `custom_code` antes de desplegar en producción.
- Idiomas no declarados: no se especifica qué lenguas cubre el modelo base, por lo que su comportamiento en castellano es desconocido.
- Contexto no declarado: se desconoce la ventana máxima, algo crítico para entradas de vídeo o documentos largos.
- Sesgos y alucinación: no hay documentación sobre sesgos del modelo base ni sobre tasas de falsos positivos. En un clasificador, el fallo equivalente a la alucinación es una confianza alta sobre una etiqueta incorrecta, y sin métricas publicadas no puede calibrarse a priori.
- Madurez del artefacto: el repositorio se creó y actualizó el mismo día (21 de octubre de 2026), con 0 descargas y 0 likes; no hay validación de la comunidad.
- Licencia: el checkpoint se declara Apache 2.0, pero la información disponible no confirma la licencia del modelo base vllm-sr/d3-turbo; conviene verificarla antes de un uso comercial.
- Coste de memoria de la parte no cuantizada: la torre visual completa en BF16 y la caché de estado por petición añaden consumo sobre los ~27 GB de pesos, y el margen en GPU de 32 GB es reducido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mph/d3-turbo-MXFP8
- Modelo base: https://huggingface.co/vllm-sr/d3-turbo
- NVIDIA TensorRT Model Optimizer (ModelOpt): https://github.com/NVIDIA/TensorRT-Model-Optimizer
- Nota sobre la búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre el modelo; los resultados obtenidos corresponden a la unidad de velocidad "mph" (millas por hora) y se han descartado por no guardar relación con el artefacto. No se han encontrado papers, blogs, repositorios ni demos adicionales del modelo.
