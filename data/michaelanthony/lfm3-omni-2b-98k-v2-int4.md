# MichaelAnthony/LFM3-Omni-2B-98K-V2-INT4

## Resumen

LFM3-Omni-2B-98K-V2-INT4 es una cuantización comunitaria de tipo W4A16 (pesos empaquetados a 4 bits, activaciones a 16 bits) del modelo LiquidAI/LFM3-Omni-2B, publicada por el usuario MichaelAnthony. Se trata de un checkpoint afinado con LoRA fusionado para inferencia y refinado de forma supervisada a partir de la rama `checkpoint424-anti-loop-v19-r3`, con el objetivo declarado de mejorar el razonamiento supervisado, la decisión de uso de herramientas, la recuperación tras errores y el cierre correcto de respuestas en flujos de automatización.

El modelo parte de la arquitectura nativa LFM3 Omni de Liquid AI, que combina capas de convolución, atención completa y cinco capas de atención deslizante con ventana de 256 tokens. La etiqueta "98K" hace referencia a una configuración de servicio de 98.304 tokens verificada en la build Q8, aunque el techo arquitectónico es de 128.000 posiciones. El autor advierte explícitamente que no se garantiza fiabilidad en todas las posiciones de una conversación de 98K.

La relevancia de esta ficha es doble: por un lado, documenta un modelo multimodal y de audio de pequeño tamaño (2.166.928.384 parámetros) con capacidades de tool calling y razonamiento; por otro, es un ejemplo de release comunitario con validación limitada, cuyos propios resultados agregados no superan al checkpoint padre en la suite reducida de pruebas. Es, por tanto, un artefacto que requiere evaluación propia antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3 Omni (convolución + atención completa + 5 capas de atención deslizante con ventana de 256 tokens) |
| Parametros totales | 2.166.928.384 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 98.304 tokens en configuración de servicio verificada (Q8); techo arquitectónico de 128.000 posiciones |
| Tipos de cuantizacion | INT4 W4A16 (esta build); familia completa: BF16, FP16, FP8, INT8, INT4, GGUF |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (other) |
| Formato de pesos | safetensors con compressed-tensors (custom_code); también disponible GGUF en el repositorio hermano |

## Arquitectura y entrenamiento

El modelo base es LFM3 Omni de Liquid AI, una arquitectura híbrida que intercala capas convolucionales, capas de atención completa y cinco capas de atención deslizante con ventana de 256 tokens. Esta build V2 emplea el layout de atención nativo, a diferencia de V1, que requería una conversión a atención completa. Los ajustes rotatorios y los metadatos de atención se conservan del modelo base seleccionado. La cuantización INT4 sigue el esquema compressed-tensors W4A16 con una receta incluida en `recipe.yaml`; convolución, encoders, proyectores, decodificador de profundidad y cabeza de salida quedan excluidos de los objetivos de cuantización.

El entrenamiento consiste en ocho actualizaciones supervisadas desde el checkpoint 424, con continuación completa del estado de Adam y una tasa de aprendizaje que decae de 8e-7 a 2e-7. La mezcla de entrenamiento incluye razonamiento, respuestas visibles, tokens terminales, llamadas a herramientas dependientes, ejemplos de recuperación, retención del modelo original y retención multimodal y de voz nativa. El autor aclara que se trata de refinamiento supervisado y no de un resultado de RL nuevo. Los encoders, proyectores y codec se preservan, y el repositorio nativo incluye el tokenizador de audio congelado y el código de carga personalizado. El SHA-256 del adaptador de origen es `6ee09c6841ef2cdcedd30c2f5fc89d62340787b71386b5454b0e999fc577bcaf`.

## Capacidades

- Generación de texto y razonamiento supervisado, con sección de razonamiento formateada y cerrada cuando el modo thinking está activado.
- Decisión de uso de herramientas (tool decision) y emisión de llamadas a herramientas dependientes, con ejemplos de recuperación tras fallos.
- Cierre terminal nativo de la respuesta (native terminal stop) y refinamiento de parada.
- Capacidades multimodales nativas heredadas del modelo base, con encoders, proyectores y codec preservados.
- Capacidades de audio y voz nativas, con tokenizador de audio congelado incluido en el repositorio nativo.
- Soporte de contexto largo en configuración de servicio de 98.304 tokens.
- Retención del modelo original y de las capacidades multimodales y de voz en la mezcla de entrenamiento.

## Casos de uso

- Automatización de correo con esquemas de herramientas tipo Gmail: el modelo fue probado con el conjunto real de 64 herramientas de Gmail y un caso simulado de búsqueda y envío. Es adecuado para flujos donde el servidor de herramientas realiza la codificación MIME/base64 y el modelo solo rellena los campos `to`, `subject` y `body`.
- Asistentes de automatización en escritorio (por ejemplo, Raycast): el autor reportó una búsqueda de solo lectura que localizó la dirección y terminó correctamente, aunque con evidencia más estrecha que un flujo completo de envío.
- Agentes multi-paso con recuperación de errores: los ejemplos de recuperación y las llamadas dependientes en la mezcla de entrenamiento permiten gestionar fallos de herramientas y reintentos controlados, siempre con límites y verificación a nivel de aplicación.
- Procesamiento de conversaciones largas: la configuración de 98.304 tokens permite mantener contexto extenso en tareas de recuperación de información, aunque el autor no garantiza fiabilidad en todas las posiciones.
- Procesamiento multimodal y de audio: al conservar encoders, proyectores y codec, el checkpoint puede emplearse en tareas que requieran entrada de audio o imagen, aunque la recalificación completa del runtime comprimido sigue pendiente.
- Despliegue en hardware limitado: al ser una cuantización INT4 de un modelo de 2,17 mil millones de parámetros, es apto para entornos con VRAM reducida, con la advertencia de que las pruebas de humo estructurales no prueban igual calidad entre precisiones.
- Investigación sobre cuantización y retención de capacidades: la familia de releases (BF16, FP16, FP8, INT8, INT4, GGUF) permite comparar el impacto de cada precisión en las mismas tareas.

## Benchmarks y rendimiento

Los únicos datos publicados son la validación del autor en BF16 nativo con decodificación greedy y 40 checkpoints de flujo simulados por modelo:

| Modelo | Decisión de tarea correcta | Sección de razonamiento válida (thinking activado) | Parada terminal nativa | Texto repetido detectado |
|---|---:|---:|---:|---:|
| Base original sin tocar | 40/40 | 0/20 | 40/40 | 0/40 |
| Checkpoint padre 424 | 33/40 | 19/20 | 40/40 | 0/40 |
| Checkpoint seleccionado 432 | 33/40 | 19/20 | 40/40 | 0/40 |

El autor indica que la validez de la sección de razonamiento comprueba formato y cierre, no calidad del razonamiento, y que esta suite pequeña no mostró mejora agregada sobre el checkpoint 424 ni reprodujo todos los fallos observados en un flujo de cliente completo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 2,6 GB en INT4, lo que sugiere un requisito de VRAM del orden de pocos GB, pero no se confirma en la información.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño de pesos empaquetados a 4 bits es plausible, pero el runtime debe soportar la arquitectura LFM3 Omni y el esquema compressed-tensors.
- Opciones de despliegue: el autor probó con Transformers 5.21.0, PyTorch 2.13.0+rocm7.1, safetensors 0.8.0, llmcompressor 0.15.0 y compressed-tensors 0.20.1; para GGUF se usó llama.cpp b11982. Otras combinaciones de versiones requieren su propia comprobación de compatibilidad.
- Latencia y throughput: no disponible.
- Advertencia: los formatos empaquetados no son checkpoints densos ordinarios; el runtime debe soportar tanto la arquitectura personalizada como el esquema compressed-tensors elegido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LFM3-Omni-2B-98K-V2-INT4 | 2.166.928.384 | 98.304 (servicio verificado); techo 128.000 | lfm-open-license | Hugging Face, comunidad |
| LiquidAI/LFM3-Omni-2B (base) | no disponible en la información | no disponible en la información | lfm-open-license | Hugging Face, oficial |
| LFM3-Omni-2B-98K-V2-BF16 (misma familia) | 2.166.928.384 | 98.304 | lfm-open-license | Hugging Face, comunidad |
| LFM3-Omni-2B-98K-V2-GGUF (misma familia) | 2.166.928.384 | 98.304 | lfm-open-license | Hugging Face, comunidad |

No se dispone de datos de rendimiento comparativo con modelos de otras familias en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que esta release no garantiza fiabilidad en todas las posiciones de una conversación de 98K; los resultados de recuperación de contexto largo de V1 no se han repetido en todos los formatos de V2.
- La suite de validación es pequeña (40 checkpoints simulados) y no mostró mejora agregada sobre el checkpoint padre 424.
- Se observaron fallos en variantes de prompt: razonamiento sin respuesta final, solicitud de dirección en lugar de búsqueda, o payloads de correo sin formato. F16 y Q8 mostraron resultados distintos.
- El autor advierte que V2 no elimina el riesgo de bucles ni de escrituras duplicadas.
- Para herramientas tipo Gmail, debe dejarse el campo opcional `raw` sin definir salvo que el llamador ya tenga un mensaje pre-codificado válido; la codificación MIME/base64 debe realizarla el servidor de herramientas.
- La ejecución de herramientas debe mantener límites y verificación a nivel de aplicación para efectos secundarios.
- Las comprobaciones de exportación estructural y las pruebas de generación simple no prueban igual calidad entre precisiones o cuantizaciones.
- La recalificación completa multimodal, de automatización con contexto largo y de runtime comprimido sigue incompleta.
- La licencia lfm-open-license es de tipo "other"; deben revisarse sus términos para uso comercial.
- No hay datos publicados sobre sesgos, idiomas soportados ni riesgos de alucinación específicos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja una validación comunitaria mínima.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Licencia: https://huggingface.co/LiquidAI/LFM3-Omni-2B/blob/main/LICENSE
- Release BF16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-BF16
- Release FP16: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP16
- Release FP8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-FP8
- Release INT8: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-INT8
- Release GGUF: https://huggingface.co/MichaelAnthony/LFM3-Omni-2B-98K-V2-GGUF
