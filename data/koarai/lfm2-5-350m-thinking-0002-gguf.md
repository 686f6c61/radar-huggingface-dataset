# KoarAI/LFM2.5-350M-Thinking-0002-GGUF

## Resumen

KoarAI/LFM2.5-350M-Thinking-0002-GGUF es la versión cuantizada en formato GGUF del modelo KoarAI/LFM2.5-350M-Thinking, un fine-tuning del modelo LFM2.5-350M de Liquid AI orientado a razonamiento explícito (thinking mode) y cadenas de pensamiento (CoT). El modelo base, desarrollado por Liquid AI, es el más pequeño de la familia LFM2.5 y está diseñado para dispositivos con recursos limitados, combinando una arquitectura híbrida de convoluciones y atención con un preentrenamiento extendido de 28 billones de tokens y refuerzo a gran escala.

Esta versión de KoarAI ha sido sometida a un fine-tuning de parámetros completos durante 9 épocas con destilación multi-dataset, incluyendo trazas de razonamiento, uso de herramientas, CoT multi-paso y problemas de matemáticas de nivel olímpico. El resultado se distribuye en dos cuantizaciones GGUF (f16 y Q8_0) pensadas para su uso directo con llama.cpp y Ollama, lo que permite ejecutar el modelo en CPU, GPU de gama baja o incluso en dispositivos edge. Con 354 millones de parámetros y una ventana de contexto de 32 000 tokens, ofrece una relación entre capacidad y coste computacional muy atractiva para tareas de razonamiento ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (híbrida convolución + atención) |
| Parametros totales | 354 483 968 (354 M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32 000 tokens |
| Tipos de cuantizacion | f16 (~678 MB), Q8_0 (~347 MB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el modelo base) |

## Arquitectura y entrenamiento

El modelo base LFM2.5-350M emplea la arquitectura LFM2 de Liquid AI, una combinación híbrida de capas convolucionales y atención que reduce el coste computacional frente a un transformer denso equivalente, manteniendo una calidad competitiva para su tamaño. El preentrenamiento se realizó con 28 billones de tokens (frente a los 10 billones de la versión anterior LFM2-350M) y se complementó con un pipeline de aprendizaje por refuerzo a gran escala para mejorar el seguimiento de instrucciones, el chat y el uso de herramientas.

Sobre esta base, KoarAI aplicó un fine-tuning de parámetros completos durante 9 épocas con un enfoque de destilación multi-dataset. Los datos incluyen trazas de razonamiento, ejemplos de tool calling, cadenas de pensamiento de varios pasos y problemas de matemáticas de nivel olímpico. El objetivo es inducir un modo de "thinking" explícito en el que el modelo genera una secuencia de razonamiento antes de dar la respuesta final, siguiendo el formato de chat con tokens especiales `<|im_start|>` y `<|im_end|>`.

## Capacidades

- Generación de texto con razonamiento explícito: el modelo produce cadenas de pensamiento internas antes de responder, lo que mejora la precisión en problemas aritméticos y lógicos.
- Tool calling y function calling: soporta invocación de herramientas, heredado del modelo base LFM2.5-350M.
- Razonamiento multi-paso: entrenado específicamente con CoT de varios pasos y problemas de olimpiadas matemáticas.
- Chat conversacional: formato de mensajes con roles system, user y assistant, compatible con plantillas de llama.cpp y Ollama.
- Capacidades multilingües: no especificadas por el autor; el modelo base de Liquid AI no documenta idiomas concretos.
- Inferencia eficiente: al ser un modelo de 354 M parámetros, puede ejecutarse en CPU sin GPU y en dispositivos con poca memoria.

## Casos de uso

- Asistentes de razonamiento matemático en educación: el modelo puede resolver problemas aritméticos y algebraicos paso a paso, mostrando el proceso de pensamiento, lo que resulta útil para plataformas de tutoría automatizada.
- Chatbots de atención al cliente en entornos con recursos limitados: su tamaño reducido permite desplegarlo en servidores modestos o en el edge, gestionando conversaciones multi-turno con contexto de hasta 32 000 tokens.
- Generación de código con verificación lógica: aunque no está especializado en código, su capacidad de razonamiento estructurado puede ayudar a depurar fragmentos pequeños o a explicar algoritmos.
- Prototipado rápido de agentes con tool calling: gracias a su soporte nativo de herramientas, se puede integrar en pipelines de automatización que requieran llamadas a APIs o consultas a bases de datos.
- Aplicaciones de razonamiento en dispositivos móviles o IoT: al caber en menos de 400 MB en Q8_0, puede ejecutarse en Raspberry Pi, teléfonos o microcontroladores con suficiente RAM.
- Evaluación de modelos de razonamiento en entornos académicos: su licencia Apache 2.0 y su formato GGUF facilitan su uso en experimentos de investigación sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión KoarAI/LFM2.5-350M-Thinking-0002-GGUF en la información disponible. El modelo base LFM2.5-350M de Liquid AI reporta mejoras frente a LFM2-350M en tareas de chat, instrucciones y tool calling, pero no se dispone de cifras concretas (MMLU, HumanEval, GSM8K) en los materiales consultados. Se recomienda consultar el blog oficial de Liquid AI para obtener datos comparativos del modelo base.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 ocupa ~347 MB y el f16 ~678 MB. En GPU, cabe en cualquier tarjeta con al menos 1 GB de VRAM (por ejemplo, GTX 1050, Raspberry Pi con GPU integrada, o incluso iGPU).
- GPU recomendadas: no se requiere GPU dedicada; el modelo puede ejecutarse en CPU con 4-8 GB de RAM. En GPU, cualquier modelo moderno (RTX 3060, A100, etc.) funcionará sin problemas.
- Compatibilidad con consumer GPU: sí, cualquier GPU con soporte CUDA o Vulkan puede ejecutarlo, así como Apple Silicon con Metal.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (mediante Modelfile), vLLM (según las recetas oficiales de vLLM para LFM2.5-350M), y TGI si se convierte a safetensors.
- Latencia y throughput: al ser un modelo pequeño, la generación es muy rápida. En CPU moderna se pueden alcanzar decenas de tokens por segundo; en GPU, cientos. No se dispone de cifras exactas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| KoarAI/LFM2.5-350M-Thinking-0002-GGUF | 354 M | 32 000 | LFM2 híbrida | Apache 2.0 | GGUF |
| LiquidAI/LFM2.5-350M | 354 M | 32 000 | LFM2 híbrida | Apache 2.0 | Safetensors |
| LiquidAI/LFM2-350M | 354 M | 32 000 | LFM2 híbrida | Apache 2.0 | Safetensors |
| Qwen2.5-0.5B-Instruct | 494 M | 32 768 | Transformer denso | Apache 2.0 | Safetensors, GGUF |

La versión de KoarAI se diferencia del modelo base de Liquid AI por su fine-tuning específico en razonamiento y su formato GGUF listo para usar. Frente a Qwen2.5-0.5B, ofrece una arquitectura más eficiente (híbrida) y un enfoque explícito en CoT, aunque Qwen tiene un contexto ligeramente mayor y un ecosistema más amplio de herramientas.

## Limitaciones y advertencias

- Tamaño reducido: con solo 354 M parámetros, el conocimiento factual y la capacidad de razonamiento complejo son limitados en comparación con modelos de 7B o más.
- Riesgo de alucinación: como cualquier modelo pequeño, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.
- Idioma no especificado: no se documenta qué idiomas soporta; probablemente esté optimizado para inglés, pero no hay garantía.
- Dependencia del modo "thinking": el formato de prompt requiere incluir la palabra "thinking" tras el token de assistant para activar el razonamiento; si se omite, el modelo puede comportarse como un chat estándar.
- Sin benchmarks publicados: no hay evidencia independiente del rendimiento real de esta versión fine-tuned.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base de Liquid AI puede tener condiciones adicionales; se recomienda revisar la documentación oficial.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/KoarAI/LFM2.5-350M-Thinking-0002-GGUF
- Modelo base (safetensors): https://huggingface.co/LiquidAI/LFM2.5-350M
- Documentación oficial de Liquid AI: https://docs.liquid.ai/lfm/models/lfm25-350m
- Blog de Liquid AI sobre LFM2.5-350M: https://www.liquid.ai/blog/lfm2-5-350m-no-size-left-behind
- Recetas vLLM para LFM2.5-350M: https://recipes.vllm.ai/LiquidAI/LFM2.5-350M
- Modelo anterior LFM2-350M: https://huggingface.co/LiquidAI/LFM2-350M
