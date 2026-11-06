# FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit

## Resumen

Spark-X2.6-4B-abliterated-MLX-8bit es una conversión a formato MLX de 8 bits del modelo FrostWolfAI/Spark-X2.6-4B-abliterated, que a su vez es una variante "abliterated" (sin direcciones de rechazo) del modelo post-entrenado XHToken/Spark-X2.6-4B. El modelo original emplea la arquitectura `spark2_5`, un transformer de 36 capas con atención de ventana deslizante combinada con atención global en proporción 3:1 y un contexto declarado de 1.048.576 tokens. Con 4.112.079.360 parámetros, está diseñado para ejecución local en dispositivos Apple Silicon mediante la librería MLX.

La relevancia de esta ficha concreta es doble: por un lado, ofrece una ruta de despliegue nativa para macOS con cuantización de 8 bits que el autor describe como prácticamente sin pérdida frente a los pesos BF16; por otro, incorpora el proceso de abliteración mediante Arbitrary-Rank Ablation (ARA) con Heretic v2, que según la model card reduce los rechazos de 100/100 a 2/100 con una divergencia KL de 0,0177. Esto lo sitúa en el nicho de modelos locales orientados a agentes, tool calling y razonamiento sin restricciones de rechazo.

El modelo conserva el modo de pensamiento controlable (`enable_thinking`, `reasoning_effort`), el formato de tool calling `<tool_call>` y el soporte de contexto largo del modelo base. Está pensado para desarrolladores que trabajan en entornos locales con Apple Silicon y necesitan un modelo pequeño (4B), rápido de cargar y con comportamiento agéntico, asumiendo las implicaciones éticas y de seguridad de un modelo deliberadamente decensurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `spark2_5`: transformer de 36 capas, 27 de ventana deslizante (512 tokens) + 9 de atención global (proporción 3:1) |
| Parametros totales | 4.112.079.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (declarado) |
| Tipos de cuantizacion | 8-bit affine, group size 64 (8,503 bits/peso); existe release MLX de 4 bits (2,32 GB) y GGUF del mismo autor |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX safetensors (`model_type: spark2_5`), repo de 4,37 GB en disco |

## Arquitectura y entrenamiento

La arquitectura `spark2_5` combina 36 capas transformer con un esquema híbrido de atención: 27 capas usan atención de ventana deslizante de 512 tokens y 9 capas usan atención global, en proporción 3:1. La atención emplea 16 cabezas de consulta y 4 cabezas KV, dimensión de cabeza 256, QKV fusionado y una puerta de salida sigmoidea por cabeza. La dimensión oculta es 2560, la intermedia 10240, con MLP GELU y embeddings atados. El vocabulario es de 131.072 tokens. Las capas deslizantes usan una caché KV rotatoria de 512 tokens, de modo que en contexto largo la memoria solo crece con las 9 capas globales.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni los métodos de alineación (RLHF/DPO) del modelo base XHToken/Spark-X2.6-4B en la información proporcionada. La innovación documentada de esta variante es la abliteración: se aplicó Heretic v2 con Arbitrary-Rank Ablation (ARA) para eliminar las direcciones de rechazo, reduciendo los rechazos de 100/100 a 2/100 con una divergencia KL de 0,0177 respecto al modelo original, conservando arquitectura, contexto de 1M tokens, pensamiento controlable y formato de tool calling.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo de pensamiento controlable: bloque `<think>...</think>` por defecto, desactivable con `enable_thinking=False` y ajustable con `reasoning_effort="low"` o `"high"`.
- Tool calling / function calling mediante el formato `<tool_call>name<arg_key>k</arg_key><arg_value>v</arg_value></tool_call>`, con argumentos pasados como diccionario.
- Comportamiento agéntico y razonamiento multi-paso (etiquetas `agentic`, `tool-calling`).
- Contexto largo de hasta 1.048.576 tokens con gestión eficiente de memoria gracias a la caché KV rotatoria de las capas deslizantes.
- Modelo decensurado: responde a solicitudes que el modelo base rechazaría (comportamiento deliberado, ver limitaciones).
- No se documentan capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Asistentes locales en macOS: el modelo se carga con `mlx-lm` en un Mac con Apple Silicon y sirve como asistente conversacional privado sin salir del dispositivo, con un consumo de memoria de aproximadamente 4,6 GB en pico.
- Automatización de agentes con tool calling: integrado en un bucle agéntico que invoca funciones externas (APIs, scripts, herramientas del sistema) mediante el formato `<tool_call>`, adecuado por su etiquetado explícito como modelo agéntico.
- Análisis de documentos largos: con contexto de 1M tokens declarado, puede procesar repositorios de código, expedientes o transcripciones extensas en una sola pasada, aprovechando la caché KV rotatoria para limitar el crecimiento de memoria.
- Generación de código en local: útil para autocompletado, refactorización y scripting en entornos sin conexión o con requisitos de privacidad, ejecutándose a unos 8 tok/s de generación en un M3.
- Investigación sobre alineación y seguridad: la variante abliterated sirve como objeto de estudio para medir la eficacia de ARA/Heretic y analizar la supresión de rechazos, con la divergencia KL de 0,0177 como métrica de referencia.
- Servidor compatible con OpenAI en local: `mlx_lm.server` expone un endpoint en `:8080` que permite conectar clientes existentes (por ejemplo, LM Studio o herramientas que hablan la API de OpenAI) a un modelo local.
- Prototipado rápido en LM Studio: carga directa con el motor MLX para pruebas de prompts, comparación de cuantizaciones (4-bit frente a 8-bit) y evaluación de calidad antes de integrar en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). La model card solo incluye métricas de rendimiento de inferencia medidas en un Apple M3 (8 núcleos, 16 GB de memoria unificada) con `mlx-lm` 0.32.2:

| Etapa | Throughput |
|---|---|
| Procesamiento de prompt | ~120 tok/s |
| Generación | ~8 tok/s |
| Memoria pico | ~4,6 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: ~4,6 GB en pico para la versión de 8 bits (4,37 GB en disco); la versión de 4 bits del mismo autor ocupa 2,32 GB.
- Plataforma: exclusivamente Apple Silicon (Mac con macOS 13.5 o superior); MLX no funciona en GPU NVIDIA ni en CPU x86 convencional.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 8 GB de memoria unificada; el autor probó en M3 de 8 núcleos y 16 GB. Para contexto largo conviene más memoria unificada (16 GB o superior).
- Cabe en equipos de consumo: sí, en Macs con Apple Silicon; no es desplegable en GPUs de consumo tipo RTX sin recurrir a la versión GGUF.
- Opciones de despliegue: `mlx-lm` (>= 0.32) mediante API de Python, CLI `mlx_lm.generate`, servidor `mlx_lm.server` compatible con OpenAI, y LM Studio con motor MLX. Para llama.cpp/Ollama/LM Studio en formato GGUF debe usarse el repo GGUF del mismo autor.
- Latencia y throughput: ~120 tok/s de prefill y ~8 tok/s de generación en M3 (8 núcleos, 16 GB), según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B-abliterated-MLX-8bit (este) | 4,11B | 1.048.576 | MLX 8-bit | Apache-2.0 | Decensurado, pensamiento controlable, tool calling |
| FrostWolfAI/Spark-X2.6-4B-abliterated-MLX (4-bit) | 4,11B | 1.048.576 | MLX 4-bit | Apache-2.0 | Misma variante, 2,32 GB, recomendado en equipos de 16 GB o cuando prima la velocidad |
| FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF | 4,11B | 1.048.576 | GGUF | Apache-2.0 | Misma variante para llama.cpp/Ollama/LM Studio |
| XHToken/Spark-X2.6-4B | 4,11B | 1.048.576 | safetensors (BF16) | Apache-2.0 | Modelo base post-entrenado, con rechazos intactos |

No se dispone de datos de benchmarks para comparar el rendimiento de calidad frente a otras familias de modelos del mismo tamaño; la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Modelo deliberadamente decensurado: la supresión de rechazos es intencionada y no hay filtrado de seguridad adicional. El autor advierte explícitamente de no exponerlo en un endpoint público sin moderación.
- La abliteración elimina direcciones de rechazo, pero no añade capacidad ni criterio; el modelo puede responder a solicitudes que no debería atender.
- Riesgo de alucinación inherente a un modelo de 4B; no se han publicado evaluaciones de fidelidad factual.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- El contexto de 1M tokens es una cifra declarada; no se aportan evaluaciones de recuperación en contexto largo (long-context retrieval).
- Con el pensamiento activado por defecto, es necesario asignar un `max_tokens` generoso o las respuestas se truncarán a mitad del razonamiento.
- Dependencia exclusiva de Apple Silicon y `mlx-lm >= 0.32`; no es portable a otros entornos sin usar la versión GGUF.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de salvaguardas traslada al desplegador toda la responsabilidad sobre el contenido generado.
- El repositorio tiene un historial muy reciente (creado y actualizado el 2026-10-29), con 61 descargas y 0 likes; no hay evidencia de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX-8bit
- Modelo base BF16: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated
- Versión GGUF: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-GGUF
- Versión MLX 4-bit: https://huggingface.co/FrostWolfAI/Spark-X2.6-4B-abliterated-MLX
- Modelo original post-entrenado: https://huggingface.co/XHToken/Spark-X2.6-4B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
- MLX: https://github.com/ml-explore/mlx
