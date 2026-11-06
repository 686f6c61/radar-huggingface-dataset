# scasella91/Qwen3.5-0.8B-toolpatch-g23v4-ONNX

## Resumen

Qwen3.5-0.8B-toolpatch-g23v4-ONNX es una exportación a formato ONNX en fp16 del modelo Qwen3.5-0.8B de Alibaba Qwen, modificada mediante edición de pesos en forma cerrada por el autor independiente scasella91. El objetivo del parche es corregir el comportamiento de llamada a herramientas (tool calling): el modelo editado aprende a abstenerse de invocar herramientas cuando no procede (respondiendo `NO_TOOL`), a solicitar aclaración ante peticiones ambiguas (`NEED_CLARIFICATION`) y, en esta versión g23v4, a detectar peticiones con dos valores sin resolver en lugar de emitir un `<tool_call>` incorrecto.

La edición afecta a 12.281 pesos en BF16 distribuidos en dos capas del decodificador (neuronas L22:2525, L23:3468, L23:3421 y L23:2331), actuando como una compuerta de lectura sobre direcciones del flujo residual ajustadas con las activaciones del modelo base. El repositorio incluye dos decodificadores fp16: el original byte a byte idéntico al de onnx-community y el editado, además de un manifiesto de parches que permite reconstruir la versión modificada en memoria a partir del original.

El modelo está empaquetado específicamente para Transformers.js y WebGPU, lo que permite ejecutar inferencia en el navegador. Su tamaño reducido (0,8 mil millones de parámetros) y su licencia Apache 2.0 lo hacen relevante para experimentación con agentes ligeros y tool calling en entornos de cliente, aunque su evaluación se limita al protocolo sintético de las campañas del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), exportado a ONNX |
| Parametros totales | 0,8 mil millones (modelo base Qwen3.5-0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 (decodificador); q4f16 y fp16 en embeddings; vision_encoder en fp16 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (decoder_model_merged_fp16.onnx + _data; decoder_model_merged_g23v4_fp16.onnx + _data) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-0.8B, un transformer decoder-only de 0,8 mil millones de parámetros. Sobre él se aplica una edición de pesos en forma cerrada (g23v4) que modifica 12.281 entradas BF16 en las capas 22 y 23 del decodificador, concretamente en tensores MLP de las neuronas L22:2525, L23:3468, L23:3421 y L23:2331. No se trata de un reentrenamiento ni de un fine-tuning: los pesos editados se calculan analíticamente como una compuerta de lectura de direcciones del flujo residual, ajustadas sobre las activaciones BF16 del modelo original.

La exportación se realizó con el script `export_webgpu_onnx.py` a partir de `onnx-community/Qwen3.5-0.8B-ONNX`, sin reexportar ni recuantizar el modelo base. El repositorio incluye un `patch_manifest.json` con los desplazamientos de bytes y los valores editados, de modo que un cliente puede descargar el original una vez y generar la versión g23v4 en memoria, verificando el SHA-256 del resultado. El autor justifica el uso de fp16 frente a 4 bits: con un backbone de 4 bits la entrada a la capa 23 se desvía lo suficiente (coseno 0,888 frente a 0,988 en fp16) como para que las compuertas se cierren y las neuronas editadas no se activen.

## Capacidades

- Generación de texto conversacional en formato chat.
- Tool calling nativo con emisión de `<tool_call>` en formato estructurado.
- Abstención explícita de llamada a herramienta mediante la respuesta `NO_TOOL`.
- Solicitud de aclaración ante información ambigua o ausente mediante `NEED_CLARIFICATION`.
- Detección de peticiones con dos valores sin resolver (específico de la edición g23v4).
- Procesamiento de entradas image-text-to-text (el repositorio incluye vision_encoder en fp16).
- Ejecución en navegador mediante Transformers.js y WebGPU.
- Modo thinking desactivable mediante `enable_thinking: false` en la plantilla de chat.
- Generación determinista con decodificación greedy (`do_sample: false`).

## Casos de uso

- Prototipado de agentes de tool calling en el navegador: al ejecutarse con Transformers.js y WebGPU, permite construir demos interactivas de agentes que deciden cuándo invocar una herramienta sin necesidad de backend, usando la abstención `NO_TOOL` para evitar llamadas innecesarias.
- Validación de pipelines de function calling: el modelo editado sirve como banco de pruebas para verificar que un orquestador maneja correctamente las respuestas de abstención y de solicitud de aclaración antes de desplegar modelos mayores.
- Investigación en edición de pesos e interpretabilidad: el repositorio documenta los offsets exactos y los valores editados, lo que permite reproducir el experimento y estudiar cómo una compuerta de lectura sobre el flujo residual modifica el comportamiento de decisión.
- Asistentes ligeros de consulta con aclaración: en escenarios donde la petición del usuario es ambigua (por ejemplo, dos fechas o dos identificadores sin especificar), el modelo responde `NEED_CLARIFICATION` en lugar de ejecutar una herramienta con parámetros incorrectos.
- Evaluación comparativa de precisión numérica: los dos decodificadores incluidos (original y editado) permiten medir el impacto de fp16 frente a 4 bits en la fidelidad del mecanismo de compuerta, útil para decidir cuantizaciones en producción.
- Demostraciones educativas de tool calling: el blog y la comparación interactiva del autor usan este repositorio para ilustrar en vivo el comportamiento antes y después del parche, sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor únicamente reporta métricas de deriva numérica del backbone, no de rendimiento en tareas:

| Backbone | Coseno a la entrada BF16, media (mín.) | Concordancia de signo de la compuerta de abstención |
|---|---|---|
| Decodificador fp16, embeddings q4f16 (el enviado) | 0,988 (mín. 0,986) | 8/8 |
| Decodificador q4f16 (MLP editados en fp16) | 0,888 (mín. 0,865) | 5/8 |
| Decodificador q4 (MLP editados en fp32) | 0,888 (mín. 0,865) | 5/8 |

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 3,9 GB en total, incluyendo ambos decodificadores fp16 (1,5 GB cada uno) y el vision_encoder. En inferencia solo se carga un decodificador, por lo que el consumo efectivo ronda 1,5-2 GB en fp16.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el despliegue en navegador; para servidor, GPU con al menos 4 GB de VRAM.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante).
- Opciones de despliegue: Transformers.js con WebGPU (soporte oficial del repositorio), ONNX Runtime, y cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-toolpatch-g23v4-ONNX | 0,8 B | No disponible | ONNX fp16 | Apache 2.0 | Tool calling corregido por edición de pesos, navegador |
| Qwen/Qwen3.5-0.8B | 0,8 B | No disponible | Safetensors | Apache 2.0 | Modelo base sin parche |
| onnx-community/Qwen3.5-0.8B-ONNX | 0,8 B | No disponible | ONNX | Apache 2.0 | Exportación ONNX oficial sin edición |

No se dispone de datos de benchmarks que permitan comparar el rendimiento en tareas frente a estas alternativas.

## Limitaciones y advertencias

- Los resultados de las campañas se midieron sobre pesos BF16 en MLX con decodificación greedy; la reproducción en fp16 ONNX sobre WebGPU mantiene el mecanismo, pero pequeñas diferencias numéricas pueden alterar salidas individuales.
- La evaluación se limita al protocolo sintético de las campañas del autor; no hay validación en conjuntos de datos públicos de tool calling.
- Con backbone de 4 bits las compuertas de abstención se cierran y el modelo vuelve a llamar a herramientas de forma indebida: la edición solo es fiable en fp16.
- El modelo no está afinado para uso comercial en producción; la licencia Apache 2.0 lo permite, pero no hay garantías de robustez fuera del protocolo evaluado.
- Riesgo de alucinación inherente a un modelo de 0,8 mil millones de parámetros, no cuantificado en la información disponible.
- Idiomas soportados no documentados en la model card.
- Longitud de contexto no especificada en la información proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v4-ONNX
- Modelo base del parche: https://huggingface.co/scasella91/Qwen3.5-0.8B-toolpatch-g23v4
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Exportación ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX
- Blog del autor: https://scasella.github.io/qwen3.5-toolpatch/blog.html
- Comparación interactiva: https://scasella.github.io/qwen3.5-toolpatch/
- Código: https://github.com/scasella/qwen3.5-toolpatch
