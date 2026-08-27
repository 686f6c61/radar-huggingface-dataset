# FastFlowLM/Qwen3.5-0.8B-gguf

## Resumen

Qwen3.5-0.8B es el modelo multimodal más pequeño de la familia Qwen3.5, desarrollado por Alibaba. Este repositorio concreto, publicado por FastFlowLM, ofrece una versión cuantizada en formato GGUF del modelo base, optimizada para su ejecución en NPUs AMD Ryzen AI y en entornos con recursos limitados. El modelo combina un codificador de visión con un modelo de lenguaje causal de 0.8B parámetros, alcanzando una ventana de contexto nativa de 262.144 tokens.

La relevancia de este lanzamiento radica en su doble vertiente: por un lado, demuestra que es posible ejecutar un modelo multimodal con capacidades de razonamiento y visión en hardware de consumo (NPUs, GPUs de gama baja); por otro, sirve como punto de partida para prototipado y fine-tuning específico, dado su reducido tamaño. La arquitectura híbrida, que combina Gated Delta Networks con atención dispersa, promete alta eficiencia de inferencia con baja latencia, aunque los benchmarks publicados muestran un rendimiento inferior al de sus hermanos mayores en tareas de conocimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder (híbrida: Gated DeltaNet + Gated Attention + FFN) |
| Parametros totales | 752.982.848 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (nativa) |
| Tipos de cuantizacion | q4_k (pesos del LM) con q8_0 (LM head); proyector de visión en BF16 |
| Idiomas soportados | 201 idiomas y dialectos (según el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (dos archivos: modelo de lenguaje y proyector multimodal) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B emplea una arquitectura híbrida que intercala capas de atención lineal (Gated DeltaNet) con capas de atención completa (Gated Attention). El layout de las 24 capas sigue el patrón 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La Gated DeltaNet utiliza 16 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128; la Gated Attention usa 8 cabezas para Q y 2 para KV, con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 3584, y el embedding de tokens está atado a la salida (248320 tokens, con padding). Se incluye además un módulo de Multi-Token Prediction (MTP) entrenado con múltiples pasos.

El entrenamiento combina pre-entrenamiento y post-entrenamiento, con un énfasis en el escalado de reinforcement learning en entornos de millones de agentes con distribuciones de tareas progresivamente complejas. La fusión temprana de tokens multimodales durante el entrenamiento permite que el modelo alcance paridad con Qwen3-VL en tareas de razonamiento, código, agentes y comprensión visual. Los datos específicos de entrenamiento (número de tokens, composición del dataset) no se han publicado en la información disponible.

## Capacidades

- Generación de texto y razonamiento: el modelo puede producir texto coherente y resolver tareas de razonamiento, aunque con menor precisión que modelos más grandes de la misma familia.
- Visión: procesamiento de imágenes mediante un proyector multimodal (archivo mmproj-BF16.gguf), lo que permite tareas de image-text-to-text como descripción de imágenes, respuesta a preguntas visuales y OCR básico.
- Multilingüe: soporte para 201 idiomas y dialectos, según la documentación del modelo base.
- Modo thinking: la tabla de benchmarks distingue entre "non-thinking mode" y (implícitamente) un modo de razonamiento extendido, aunque no se detallan los resultados de este último.
- Capacidades de agente y codificación: la model card menciona rendimiento en tareas de agentes y código, aunque los benchmarks publicados no incluyen métricas específicas para estas áreas.
- Eficiencia de inferencia: gracias a la arquitectura híbrida y a la cuantización GGUF, el modelo puede ejecutarse en hardware de bajo consumo, incluyendo NPUs AMD Ryzen AI.

## Casos de uso

- Prototipado rápido de aplicaciones multimodales: al ser un modelo pequeño y cuantizado, permite validar ideas de producto (chat con imágenes, análisis de documentos) sin necesidad de infraestructura GPU costosa. Se puede integrar en un entorno de desarrollo local con llama.cpp u Ollama.
- Fine-tuning específico para tareas de visión-lenguaje: su tamaño reducido (752M parámetros) lo hace adecuado para ajuste fino en datasets pequeños, por ejemplo para clasificación de imágenes industriales o generación de informes médicos a partir de radiografías.
- Despliegue en dispositivos edge con NPU AMD Ryzen AI: gracias al empaquetado de FastFlowLM, el modelo puede ejecutarse en portátiles con NPU, ofreciendo inferencia multimodal sin conexión a la nube. Esto es útil para asistentes personales, traducción en tiempo real o accesibilidad.
- Asistente de atención al cliente con contexto largo: la ventana de 262K tokens permite mantener conversaciones multi-turno extensas, incluyendo el historial completo del cliente y documentos adjuntos (facturas, capturas de pantalla). El modelo puede responder consultas y extraer información relevante de las imágenes.
- Análisis de documentos con imágenes: combinando la entrada de texto e imagen, el modelo puede extraer datos de formularios escaneados, recibos o tarjetas de visita, y estructurarlos en formato JSON para su posterior procesamiento.
- Investigación académica en eficiencia de modelos pequeños: sirve como banco de pruebas para estudiar el equilibrio entre tamaño, rendimiento y consumo energético en arquitecturas híbridas, así como para comparar estrategias de cuantización.

## Benchmarks y rendimiento

La model card publica resultados en modo "non-thinking" para dos benchmarks de conocimiento general, comparados con otros modelos de la familia Qwen:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69.6 | 40.2 | 55.3 | 29.7 |
| MMLU-Redux | 84.2 | 64.4 | 69.2 | 48.5 |

No se han publicado resultados adicionales (HumanEval, GSM8K, etc.) en la información disponible. El blog de codersera.com señala que el modelo tiene "fuerte recall pero débil precisión de código", recomendando Qwen3.5 4B para tareas de programación.

## Requisitos de hardware

- VRAM estimada: con la cuantización q4_k, el modelo de lenguaje ocupa aproximadamente 0.4-0.5 GB (752M parámetros × 4 bits ≈ 376 MB), más el proyector de visión en BF16 (~0.1 GB). En total, se necesitan menos de 1 GB de VRAM para inferencia multimodal.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3060, RTX 4060) puede ejecutar el modelo sin problemas. También es compatible con NPUs AMD Ryzen AI (serie Ryzen AI 300 o superior) mediante FastFlowLM.
- Cabe en consumer GPU: sí, incluso en GPUs integradas de portátiles modernos, aunque la velocidad dependerá de la memoria y el ancho de banda.
- Opciones de despliegue: llama.cpp (para GGUF), Ollama (comando `ollama run qwen3.5:0.8b`), FastFlowLM (para NPUs AMD), y vLLM/SGLang (usando el formato Transformers del modelo base).
- Latencia y throughput: no se han publicado cifras oficiales. En una NPU AMD Ryzen AI, se espera una generación de varios tokens por segundo, pero los valores exactos dependen del hardware y de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | MMLU-Redux | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (este) | 0.8B | 262K | 29.7 | 48.5 | Apache 2.0 |
| Qwen3-1.7B | 1.7B | 256K | 40.2 | 64.4 | Apache 2.0 |
| Qwen3.5-2B | 2B | 262K | 55.3 | 69.2 | Apache 2.0 |

El Qwen3.5-0.8B es significativamente más pequeño que sus alternativas, lo que se refleja en un menor rendimiento en benchmarks de conocimiento. Sin embargo, su ventaja principal es la eficiencia: puede ejecutarse en hardware de muy bajo consumo y ofrece una ventana de contexto comparable a la de modelos más grandes. Para tareas que requieran alta precisión en razonamiento o código, los modelos de 2B o 4B son más adecuados.

## Limitaciones y advertencias

- Rendimiento limitado en tareas de código: según el análisis de codersera.com, la precisión en generación de código es débil; se recomienda usar Qwen3.5 4B o superior para estos casos.
- Riesgo de alucinación: como todo modelo de lenguaje pequeño, puede generar información plausible pero incorrecta, especialmente en dominios especializados.
- Sesgos no documentados: no se han publicado evaluaciones de sesgos específicas para este modelo; se recomienda auditar antes de un despliegue en producción.
- Dependencia de dos archivos GGUF: para entrada de imagen, es necesario cargar tanto el modelo de lenguaje como el proyector de visión; si se omite el segundo, el modelo solo funcionará en modo texto.
- Contexto largo con cuantización: aunque la ventana nativa es de 262K tokens, la cuantización q4_k puede degradar ligeramente la calidad en contextos muy largos; se recomienda probar con el caso de uso real.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales (consultar la documentación de Qwen).

## Enlaces

- Repositorio GGUF: https://huggingface.co/FastFlowLM/Qwen3.5-0.8B-gguf
- Modelo base (Transformers): https://huggingface.co/Qwen/Qwen3.5-0.8B
- Proyecto FastFlowLM (GitHub): https://github.com/ROCm/FastFlowLM
- Web de FastFlowLM: https://fastflowlm.com/
- Análisis y benchmark de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
