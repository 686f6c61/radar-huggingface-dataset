# openbmb/MiniCPM-V-4.6-Thinking-GPTQ

## Resumen

MiniCPM-V 4.6 Thinking es un modelo multimodal ligero (MLLM) desarrollado por OpenBMB, diseñado para comprensión de imagen y vídeo de alta eficiencia en dispositivos de borde como teléfonos móviles. Esta variante Thinking genera una traza de razonamiento explícita (cadena de pensamiento) antes de producir la respuesta final, lo que mejora sustancialmente el rendimiento en tareas de razonamiento multimodal complejo, matemáticas y procesamiento OCR intensivo, manteniendo la misma arquitectura compacta que la versión Instruct.

El modelo combina un codificador visual SigLIP2-400M con un LLM Qwen3.5-0.8B, sumando un total de 1.300 millones de parámetros. Incorpora una compresión mixta de tokens visuales de 4x y 16x, lo que permite ajustar el equilibrio entre detalle y eficiencia según la tarea. El repositorio aloja la versión cuantizada GPTQ (W4A16) del modelo BF16 original, reduciendo el tamaño a aproximadamente 1,9 GB y facilitando su despliegue en entornos con recursos limitados.

La relevancia actual del modelo radica en su capacidad para ejecutar razonamiento multimodal avanzado en dispositivos de consumo, superando según sus autores a modelos más grandes como Gemma4-E2B-it, con un throughput de tokens aproximadamente 1,5 veces superior al de Qwen3.5-0.8B. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2-400M (vision encoder) + Qwen3.5-0.8B (LLM), compresion de tokens visuales mixta 4x/16x |
| Parametros totales | 1.300.428.016 (1,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ W4A16 (este repo); tambien disponibles cuantizaciones para llama.cpp/Ollama/LM Studio segun la pagina del modelo base |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (GPTQ 4-bit) |

## Arquitectura y entrenamiento

La arquitectura de MiniCPM-V 4.6 Thinking sigue el diseño de la serie MiniCPM-V: un codificador visual SigLIP2-400M extrae características de la imagen, que se comprimen mediante un mecanismo de pooling mixto de 4x y 16x antes de ser inyectadas en el LLM Qwen3.5-0.8B. La variante Thinking añade una etapa de razonamiento explícito: el modelo genera una cadena de pensamiento extensa antes de emitir la respuesta final, lo que mejora el rendimiento en tareas que requieren múltiples pasos de inferencia, cálculo matemático o lectura detallada de documentos.

No se han publicado en la información disponible datos concretos sobre el conjunto de entrenamiento (número de tokens, composición del dataset) ni sobre el proceso de alineación (RLHF, DPO, etc.). El modelo base BF16 está disponible en openbmb/MiniCPM-V-4.6-Thinking, y esta versión GPTQ es una cuantización post-entrenamiento que preserva las capacidades del original con una huella de memoria reducida. El modo de razonamiento no es conmutable en tiempo de ejecución: a diferencia de la versión 4.5, la variante Thinking es un checkpoint independiente que siempre genera la traza de razonamiento.

## Capacidades

- Razonamiento multimodal con cadena de pensamiento explícita: genera una traza de razonamiento antes de la respuesta final, mejorando tareas complejas de visión y lenguaje.
- Comprensión de imagen estática: descripción, respuesta a preguntas visuales, análisis de escenas y objetos.
- Comprensión de vídeo: procesamiento de secuencias de vídeo para tareas de pregunta-respuesta y resumen (requiere torchcodec o PyAV).
- OCR y lectura de documentos: reconocimiento de texto en imágenes, tablas, tickets, pantallas y documentos escaneados.
- Razonamiento matemático multimodal: resolución de problemas que combinan texto, fórmulas e imágenes.
- Dos modos de detalle visual: `downsample_mode="4x"` para detalles finos y `downsample_mode="16x"` para mayor eficiencia, con hasta 36 slices de imagen (`max_slice_nums`).
- Despliegue en dispositivos de borde: adaptado oficialmente para iOS, Android y HarmonyOS, con código de adaptación open source.
- Compatible con Flash Attention 2 para aceleración y ahorro de memoria en escenarios multi-imagen y vídeo.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente visual en móvil: integración en aplicaciones iOS, Android o HarmonyOS para responder preguntas sobre el entorno mediante la cámara, gracias a su tamaño compacto (1,3 B parámetros) y su soporte oficial de despliegue en estos sistemas.
- Digitalización de documentos: extracción de texto y estructura de tickets, facturas, tarjetas de visita y formularios escaneados, aprovechando el modo de detalle 4x para una lectura precisa del OCR.
- Análisis de vídeo en tiempo real: procesamiento de secuencias de vídeo para resumir contenido, detectar eventos o responder preguntas sobre escenas dinámicas, usando el modo 16x para maximizar el throughput.
- Tutoría de matemáticas: resolución de problemas que combinan enunciados textuales con diagramas o fórmulas, beneficiándose de la cadena de razonamiento explícita para explicar los pasos intermedios.
- Accesibilidad para personas con discapacidad visual: descripción de imágenes y lectura de texto en voz alta mediante una aplicación ligera que se ejecuta localmente en el dispositivo, sin depender de la nube.
- Automatización de tareas de oficina: análisis de capturas de pantalla, gráficos y presentaciones para extraer información clave, integrable en pipelines de productividad con la API pública gratuita ofrecida por OpenBMB.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card incluye gráficos comparativos de rendimiento general (Thinking vs. Instruct) y de eficiencia de inferencia (throughput y TTFT), pero los valores concretos no son accesibles en texto. Según la descripción del autor, el modelo supera a Gemma4-E2B-it (2 B parámetros) en rendimiento y es aproximadamente 1,5 veces más rápido en throughput de tokens que Qwen3.5-0.8B.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con cuantización GPTQ 4-bit (el repo pesa 1,9 GB), apta para GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 4060, etc.). Para vídeo o multi-imagen con Flash Attention 2 se recomienda una GPU con soporte para esta técnica (Ampere o superior).
- Cabe en GPU consumer: sí, incluso en tarjetas de gama baja y en dispositivos móviles (iOS, Android, HarmonyOS) según las adaptaciones oficiales.
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText`), vLLM (receta disponible en recipes.vllm.ai), llama.cpp, Ollama y LM Studio (cuantizaciones disponibles en la página del modelo base).
- Latencia y throughput: no disponibles en la información proporcionada, aunque el autor indica una eficiencia superior a Qwen3.5-0.8B (~1,5x token throughput).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-V 4.6 Thinking (este) | 1,3 B | SigLIP2-400M + Qwen3.5-0.8B | no disponible | Apache 2.0 | Hugging Face, vLLM, llama.cpp, Ollama |
| MiniCPM-V 4.6 (Instruct) | 1,3 B | SigLIP2-400M + Qwen3.5-0.8B | no disponible | Apache 2.0 | Hugging Face, vLLM |
| Gemma4-E2B-it | ~2 B (según autor) | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-0.8B | ~0,8 B | LLM puro (sin visión) | no disponible | no disponible | no disponible |

Según el autor, MiniCPM-V 4.6 Thinking supera a Gemma4-E2B-it en rendimiento multimodal y es más eficiente que Qwen3.5-0.8B, aunque estos datos no están respaldados por benchmarks numéricos públicos en la información disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como todo modelo multimodal, puede generar descripciones incorrectas o inventar detalles en imágenes ambiguas o de baja calidad; no se han publicado evaluaciones específicas de sesgos.
- Longitud de contexto: no se ha especificado el límite de contexto, por lo que en tareas con múltiples imágenes o vídeos largos puede haber degradación del rendimiento.
- Dependencia de la calidad del razonamiento: al ser la variante Thinking, siempre genera una traza de razonamiento, lo que aumenta la latencia frente a la versión Instruct; no es posible desactivar este comportamiento en tiempo de ejecución.
- Compatibilidad de librerías: requiere `transformers>=5.7.0` y `torchcodec` (con posibles problemas de compatibilidad con CUDA 12.x) o `PyAV` como alternativa; en entornos con CUDA 12.x puede ser necesario fijar la versión de torch.
- Idiomas: no se ha especificado la lista de idiomas soportados; el rendimiento en idiomas distintos del inglés no está garantizado.
- Licencia: Apache 2.0 permite uso comercial sin restricciones, pero el modelo base y sus pesos pueden estar sujetos a las condiciones de los modelos subyacentes (SigLIP2 y Qwen3.5), cuyas licencias no se detallan en la información proporcionada.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking-GPTQ
- Repositorio Hugging Face del modelo base BF16: https://huggingface.co/openbmb/MiniCPM-V-4.6-Thinking
- Repositorio Hugging Face de la versión Instruct: https://huggingface.co/openbmb/MiniCPM-V-4.6
- GitHub del proyecto MiniCPM-V: https://github.com/OpenBMB/MiniCPM-V
- Demo interactiva: https://huggingface.co/spaces/openbmb/MiniCPM-V-4.6-Thinking-GPTQ-Demo
- Receta vLLM: https://recipes.vllm.ai/openbmb/MiniCPM-V-4.6
- Documentación de la API pública: https://github.com/OpenBMB/MiniCPM-V/blob/main/docs/api.md
- Papers arxiv relacionados: 2604.27393, 2509.18154, 2408.01800, 2605.08985
- Wiki de MiniCPM (en chino): https://modelbest.feishu.cn/wiki/UtWxwcERfiRIpIkBOjuc3h9tn1D
- CookBook de MiniCPM-V: https://github.com/OpenSQZ/MiniCPM-V-CookBook
