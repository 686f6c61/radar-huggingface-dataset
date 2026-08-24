# BrokenCompute/IDK-v1

## Resumen

IDK-v1 es un modelo de lenguaje de 4.500 millones de parámetros desarrollado por BrokenCompute como un ajuste fino de Qwen3.5-4B. Su propósito principal es reducir la fabricación de información (alucinaciones) mediante un mecanismo de abstención explícito: cuando el modelo no está seguro de una respuesta, emite un marcador `[IDK]` seguido de una breve razón en lugar de inventar contenido. Además, integra soporte para herramientas de búsqueda web, lo que le permite consultar fuentes externas antes de responder.

El modelo se presenta como una solución práctica para entornos de producción donde la confiabilidad de las respuestas es crítica, como atención al cliente, diagnóstico técnico o consulta de información factual. Con solo 4.500 millones de parámetros, es ligero y puede ejecutarse en GPUs de consumo con cuantización (por ejemplo, Q4_K_M ocupa ~2,7 GB). Su licencia Apache-2.0 permite uso comercial sin restricciones, aunque se advierte que es un modelo experimental y puede seguir equivocándose.

La arquitectura base es Qwen3.5-4B, un modelo de lenguaje multimodal (visión y texto), aunque el ajuste fino solo entrena la ruta textual, por lo que el modelo se trata como un modelo de texto puro. El entrenamiento utiliza QLoRA de 4 bits con 8.763 ejemplos de un corpus de abstención, con trazas de razonamiento y una subconjunto de ejemplos de uso de herramientas de búsqueda.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-4B, multimodal originalmente, pero fine-tune solo texto) |
| Parametros totales | 4.539.265.536 (4,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no se especifica en la documentación) |
| Tipos de cuantizacion | BF16, Q4_K_M (GGUF), BF16 GGUF |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (merged bf16), GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado de Qwen3.5-4B, un transformer multimodal de 4.500 millones de parámetros. El fine-tuning se realizó con QLoRA de 4-bit, con rank 32 y alpha 32, durante 2 épocas y una tasa de aprendizaje de 2e-4, sobre un dataset de 8.763 ejemplos de abstención. Todos los ejemplos incluyen una traza de razonamiento, y una subconjunto enseña el uso de la herramienta `web_search(query)`. No se utilizó RLHF ni DPO en este checkpoint.

El entrenamiento se realizó en una sola GPU RTX 5060 Ti de 16 GB, con una pérdida final de aproximadamente 0,95. El modelo está diseñado para ser usado con el razonamiento activado (thinking mode), ya que la calibración y el seguimiento de instrucciones mejoran significativamente con el razonamiento habilitado. La abstención se comporta de forma dependiente de la dificultad: declina más en preguntas difíciles y reserva `[IDK]` para información genuinamente no encontrable cuando dispone de herramienta de búsqueda.

## Capacidades

- Abstención explícita: emite un marcador `[IDK]` seguido de una razón breve cuando no puede responder con confianza, en lugar de adivinar.
- Tool calling: soporta la llamada a una herramienta `web_search(query)` para buscar información externa y fundamentar la respuesta en resultados reales.
- Razonamiento de múltiples pasos: cada ejemplo de entrenamiento incluye una traza de razonamiento, lo que permite a el modelo razonar internamente antes de responder.
- Conversación multi-turno: funciona en formato de chat, con un system prompt que otorga la opción de declinar con `[IDK]`.
- Multilingüe: limitado a inglés, aunque la base Qwen3.5 tiene capacidades multilingües, el fine-tuning solo se enfocó en inglés.
- No multimodal: aunque la base es vision-language, este fine-tune solo entrenó la ruta textual; la torre de visión se hereda sin modificar y no está probada.
- Calibración de confianza: el modelo ajusta su abstención según la dificultad de la pregunta, mostrando mayor abstención en preguntas difíciles.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar consultas de soporte en dominios como salud, derecho o software, y cuando no esté seguro, declinar con `[IDK]` en lugar de dar información errónea. Su capacidad de tool calling permite integrarlo con una API de búsqueda para resolver consultas factuales en tiempo real.
- Verificación de hechos y consulta de datos: en periodismo o investigación, el modelo puede usarse para responder preguntas factuales, con la opción de buscar en fuentes externas mediante `web_search` y fundamentar la respuesta en resultados reales, reduciendo el riesgo de desinformación.
- Soporte técnico de software: en un pipeline de soporte, el modelo puede responder preguntas sobre errores de programación, documentación de APIs o configuraciones, declinando con `[IDK]` cuando no conoce la solución y sugiriendo una búsqueda.
- Generación de código con verificación: aunque no se menciona específicamente, el modelo puede integrarse en un IDE o CLI para ayudar a programadores, usando el marcador `[IDK]` para indicar cuando no sabe una función o librería, evitando sugerencias incorrectas.
- Asistencia médica informativa: en un entorno de información médica, el modelo puede proporcionar respuestas educativas, pero con la capacidad de declinar cuando no tiene datos fiables, evitando diagnósticos erróneos. Requiere supervisión humana.
- Evaluación de modelos: se puede usar como modelo de referencia para estudiar la abstención y la calibración de confianza en sistemas de lenguaje, comparando su comportamiento con otros modelos en tareas de preguntas y respuestas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación indica que el modelo "abstiene más en preguntas difíciles" y que con razonamiento activo la calibración es mejor, pero no se proporcionan métricas cuantitativas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: el modelo en BF16 requiere aproximadamente 8 GB de VRAM (peso completo), mientras que la cuantización Q4_K_M (~2,7 GB) permite ejecutarse en GPUs con 8 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 4060, RTX 5060 Ti). Para BF16 completo, se recomienda 16 GB (como la RTX 5060 Ti usada en entrenamiento) para mayor margen.
- Compatibilidad con consumer GPUs: sí, el modelo está diseñado para ejecutarse en hardware de consumo, especialmente con cuantización Q4_K_M.
- Opciones de despliegue: Transformers (con `AutoModelForImageTextToText`), vLLM, llama.cpp, LM Studio, Ollama (si se convierte a GGUF).
- Latencia y throughput: no se proporcionan datos concretos; se recomienda el sampler `top_k 40`, `top_p 0.95`, `min_p 0.05`, `repeat_penalty 1.1`. La temperatura tiene un impacto mínimo en el comportamiento.

## Comparativa con modelos similares

No se dispone de información de benchmarks para comparar directamente con otros modelos de abstención. La única referencia comparable es el modelo base Qwen3.5-4B, del cual se deriva. A continuación se muestra una comparativa básica de características, pero sin datos de rendimiento:

| Modelo | Parámetros | Contexto | Licencia | Abstención | Tool calling |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,5B | no disponible | Apache-2.0 | No | No |
| IDK-v1 | 4,5B | no disponible | Apache-2.0 | Sí (`[IDK]`) | Sí (`web_search`) |

Otros modelos de abstención en la literatura no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: es una versión de investigación temprana, se proporciona tal cual, sin garantías de corrección, seguridad o idoneidad para ningún propósito.
- Puede seguir fabricando información: aunque más honesto que la mayoría, "más honesto" no es igual a "correcto". No debe usarse para decisiones médicas, legales o financieras.
- Sobreabstención sin herramientas: sin el uso de la herramienta de búsqueda, el modelo puede declinar demasiadas preguntas, incluso las que podría responder con conocimiento propio.
- Idioma limitado: entrenado solo en inglés, enfocado en dominios de Salud, Derecho y Ingeniería de Software.
- Modalidad visual no probada: la torre de visión de la base Qwen3.5-4B se hereda sin modificar y no ha sido probada en este fine-tune; se debe tratar como un modelo de texto puro.
- Dependencia del razonamiento: desactivar el razonamiento aumenta la sobreabstención; se recomienda mantener el modo de razonamiento activo.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo es experimental y el autor recomienda validar las salidas antes de confiar en ellas.

## Enlaces

- [HuggingFace - BrokenCompute/IDK-v1](https://huggingface.co/BrokenCompute/IDK-v1)
- [Archivo GGUF Q4_K_M](https://huggingface.co/BrokenCompute/IDK-v1/blob/main/IDK-v1-Q4_K_M.gguf)
- [Archivo GGUF BF16](https://huggingface.co/BrokenCompute/IDK-v1/blob/main/IDK-v1-BF16.gguf)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
