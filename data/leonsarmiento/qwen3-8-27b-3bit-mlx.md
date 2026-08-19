# leonsarmiento/Qwen3.8-27B-3bit-mlx

## Resumen

`leonsarmiento/Qwen3.8-27B-3bit-mlx` es una conversión al formato MLX del modelo vision-language Qwen3.8-27B, cuantizada de forma mixta a 3 bits con el objetivo de ejecutarse de manera eficiente en hardware local, especialmente en Apple Silicon y GPUs con memoria limitada. El autor, leonsarmiento, aplica una receta de cuantización que preserva la torre de visión a 8 bits y los embeddings y la cabeza de predicción a 4 bits, mientras que el resto de capas del transformador se cuantizan a 3 bits con group_size=64. Esto reduce el tamaño del modelo a aproximadamente 12,7 GB y permite un uso de memoria pico de unos 15,6 GB durante la inferencia, según las pruebas publicadas.

El modelo base, Qwen3.8-27B, es un VLM denso con arquitectura híbrida de atención (48 capas de atención lineal y 16 de atención completa), 64 capas en total, una ventana de contexto nativa de 262 000 tokens y una capa de predicción multi-token (MTP) opcional. Esta conversión mantiene todas las capacidades multimodales del original, incluida la comprensión de imágenes, y añade un ajuste en la plantilla de chat que fija `reasoning_effort` a `low` por defecto, lo que acelera la primera respuesta a costa de cadenas de razonamiento más cortas. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que ofrece una alternativa cuantizada de alta calidad para desplegar un VLM de 27B en entornos con recursos limitados, con un equilibrio entre rendimiento, velocidad de decodificación y consumo de memoria, respaldado por benchmarks comparativos frente a la versión 4-bit uniforme.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense hybrid-attention VLM (48 capas de atención lineal + 16 de atención completa), 64 capas, capa MTP |
| Parametros totales | 3,67B según safetensors; el modelo base Qwen3.8-27B tiene 27B (dato inconsistente, posible checkpoint parcial) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens |
| Tipos de cuantizacion | Mixta: embeddings 4-bit, lm_head 4-bit, vision tower 8-bit, resto 3-bit; group_size=64 en todos los casos |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero no se especifica en esta conversión) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

Qwen3.8-27B es un modelo denso con una arquitectura híbrida de atención: de las 64 capas del transformador, 48 utilizan atención lineal (más eficiente en memoria y cómputo) y 16 utilizan atención completa. Esta combinación permite manejar ventanas de contexto muy largas (262K tokens) con un coste computacional reducido en comparación con un transformer estándar. Además, incorpora una capa de predicción multi-token (MTP) que puede usarse para decodificación especulativa, acelerando la generación cuando se combina con un modelo drafter separado.

La conversión a MLX no modifica la arquitectura subyacente; solo reempaqueta los pesos y aplica cuantización. La cuantización es mixta: la torre de visión se mantiene a 8 bits para preservar la calidad de la comprensión de imágenes, mientras que los embeddings y la cabeza de salida se cuantizan a 4 bits y el resto de capas a 3 bits, todo con group_size=64. Esta elección busca minimizar la pérdida de precisión en las partes más sensibles del modelo. No se dispone de información sobre los datos de entrenamiento originales (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) para el modelo base.

## Capacidades

- Comprensión y generación de texto en múltiples dominios, incluyendo razonamiento, código, matemáticas y tareas profesionales.
- Procesamiento de imágenes: el modelo es un VLM, por lo que puede responder a preguntas sobre imágenes, realizar OCR, describir contenido visual, etc.
- Razonamiento configurable: la plantilla de chat acepta los flags `enable_thinking`, `preserve_thinking` y `reasoning_effort`, permitiendo alternar entre modo instructivo (sin razonamiento explícito) y modo pensamiento con esfuerzo bajo, medio o alto.
- Ejecución de tareas agénticas de largo horizonte: según la documentación del modelo base, está optimizado para planificación autónoma y manejo de feedback del entorno.
- Soporte de tool calling y function calling: no se menciona explícitamente en la model card de esta conversión, pero el modelo base Qwen3.8 lo incluye; se asume que la cuantización no elimina esta capacidad.
- Multilingüismo: no confirmado en esta conversión, pero el modelo base Qwen3.8 es multilingüe.
- Decodificación especulativa MTP: opcional, requiere un modelo drafter separado (`leonsarmiento/Qwen3.8-27B-MTP-4bit-mlx`).

## Casos de uso

- Asistente de visión local en dispositivos Apple Silicon: gracias al formato MLX y la cuantización 3-bit, el modelo puede ejecutarse en una Mac con 16 GB de RAM unificada, permitiendo consultas sobre imágenes sin conexión a internet.
- Análisis de documentos extensos: con una ventana de 262K tokens, puede procesar libros completos, informes largos o bases de código enteras para resumir, extraer información o responder preguntas específicas.
- Generación de código con razonamiento controlado: en modo pensamiento con esfuerzo medio o alto, puede abordar problemas de programación complejos; el ajuste de `reasoning_effort` a `low` por defecto acelera tareas sencillas.
- Chatbot de atención al cliente multimodal: puede interpretar capturas de pantalla, fotos de productos o documentos escaneados y mantener conversaciones multi-turno con contexto largo.
- Agente autónomo en entornos controlados: su capacidad para manejar feedback del entorno y planificar pasos múltiples lo hace adecuado para tareas de automatización, como navegación web o uso de APIs.
- Desarrollo de aplicaciones de visión por computador: como backend local para clasificación de imágenes, generación de descripciones o respuesta a preguntas visuales en entornos con requisitos de privacidad.

## Benchmarks y rendimiento

La model card incluye comparativas frente a la versión 4-bit uniforme (`mlx-community/Qwen3.8-27B-4bit`) en un entorno con oMLX. Los resultados de conocimiento general son:

| Benchmark | Qwen3.8-27B-3bit-mlx | Qwen3.8-27B-4bit |
|---|---|---|
| MMLU (50 muestras) | 76,0% | 78,0% |
| MMLU_PRO (50 muestras) | 58,0% | 56,0% |

En rendimiento de inferencia (batch 1, contexto 1024, generación 128 tokens, oMLX):

| Metrica | 3-bit | 4-bit |
|---|---|---|
| TTFT (ms) | 9966,9 | 10289,6 |
| TPOT (ms) | 52,26 | 56,44 |
| Throughput (tok/s) | 69,3 | 65,9 |
| Pico de memoria (GB) | 15,61 | 19,06 |

La versión 3-bit decodifica un 7,8% más rápido (19,3 vs 17,9 tok/s) y consume 3,4 GB menos de memoria, con una pérdida de 2 puntos en MMLU pero una ganancia de 2 puntos en MMLU_PRO. No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 15,6 GB de pico de memoria para contexto de 1024 tokens y generación de 128 tokens; 16,7 GB para contexto de 4096 tokens. Se recomienda al menos 16 GB de VRAM o memoria unificada, y 24 GB para mayor margen.
- GPUs compatibles: Apple Silicon (vía MLX), GPUs AMD (Ryzen AI Max, Radeon) y NVIDIA (a través de LM Studio u otros runners que soporten MLX). No se especifican GPUs concretas, pero cualquier tarjeta con 16 GB o más puede ejecutarlo.
- Opciones de despliegue: mlx-vlm (biblioteca Python), LM Studio (con soporte para especulación MTP), oMLX (motor de inferencia), y posiblemente vLLM o SGLang según la publicación de Yottalabs.
- Latencia y throughput: TTFT de ~10 segundos para 1024 tokens de prompt, TPOT de ~52 ms (19,3 tok/s) en batch 1; con continuous batching, el throughput escala hasta 64,7 tok/s con batch 4.
- El modelo drafter MTP (4-bit, 258 MB) requiere ser descargado por separado para usar decodificación especulativa; no se recomienda para tareas de razonamiento largo, donde puede degradar la precisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | MMLU | Pico de memoria | Licencia |
|---|---|---|---|---|---|---|
| leonsarmiento/Qwen3.8-27B-3bit-mlx | 27B (base) | 262K | Mixta 3/4/8-bit | 76% | 15,6 GB | Apache 2.0 |
| mlx-community/Qwen3.8-27B-4bit | 27B | 262K | Uniforme 4-bit | 78% | 19,1 GB | Apache 2.0 |
| Qwen/Qwen3.8-27B (original) | 27B | 262K | Sin cuantizar | No disponible | >30 GB (estimado) | Apache 2.0 |

La versión 3-bit ofrece el menor consumo de memoria y mayor velocidad de decodificación, a costa de una ligera pérdida de precisión en MMLU. Frente al modelo original, la cuantización permite ejecutarlo en hardware de consumo, aunque no se dispone de benchmarks directos del modelo sin cuantizar en esta información.

## Limitaciones y advertencias

- La cuantización 3-bit puede introducir degradación de calidad en tareas que requieren precisión numérica o razonamiento complejo; los benchmarks muestran una pérdida de 2 puntos en MMLU frente a la versión 4-bit.
- El `reasoning_effort` está fijado a `low` por defecto en la plantilla de chat; para problemas difíciles es necesario pasar explícitamente `medium` o `xhigh`, lo que puede no ser evidente para usuarios finales.
- La decodificación especulativa MTP no es recomendable en modo pensamiento: puede aumentar el tiempo de respuesta y degradar la precisión (medido en −7 puntos en MATHQA en otro modelo de la familia).
- El dato de parámetros totales en safetensors (3,67B) es inconsistente con la denominación de 27B del modelo base; podría tratarse de un checkpoint parcial o de un error en los metadatos, lo que conviene verificar antes de usar el modelo en producción.
- No se dispone de información sobre sesgos específicos, riesgos de alucinación o limitaciones idiomáticas de esta conversión; se heredan las del modelo base Qwen3.8-27B.
- La licencia Apache 2.0 permite uso comercial, pero es recomendable revisar los términos del modelo base y de la conversión para confirmar que no hay restricciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/leonsarmiento/Qwen3.8-27B-3bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo drafter MTP (4-bit): https://huggingface.co/leonsarmiento/Qwen3.8-27B-MTP-4bit-mlx
- Colección de quants MLX de Qwen3.8 27B: https://huggingface.co/collections/lukaskremla/qwen-38-27b-mlx-quants-vision-text-only-and-mtp
- Página de LM Studio del modelo: https://lmstudio.ai/models/qwen/qwen3.8-27b
- Artículo de Yottalabs sobre especificaciones y requisitos: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
