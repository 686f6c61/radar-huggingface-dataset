# smshahbaj/RIFA-Edge-0.6B

## Resumen

RIFA Edge 0.6B es un modelo de lenguaje compacto orientado a generación de código con conciencia de seguridad, desarrollado por SM Shahbaj como parte de la serie RIFA. Se trata de un fine-tune del modelo Qwen3-0.6B, ajustado mediante QLoRA y posterior fusión a FP16, con un enfoque específico en escritura, depuración y explicación de código, así como en la identificación de patrones inseguros y la sugerencia de alternativas más seguras. El modelo está diseñado para funcionar en entornos con recursos limitados, como GPUs modestas o CPU cuantizada, y ofrece soporte multilingüe para inglés, bengalí (বাংলা) y banglish.

Su relevancia actual radica en la creciente demanda de asistentes de código ligeros que puedan ejecutarse localmente, sin depender de servicios en la nube, y que además incorporen buenas prácticas de seguridad en las sugerencias generadas. Con aproximadamente 596 millones de parámetros, RIFA Edge se posiciona como una opción práctica para desarrolladores que necesitan ayuda con código en contextos de baja latencia o con privacidad de datos. La licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-0.6B) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificado en la documentación) |
| Tipos de cuantizacion | FP16 (safetensors), GGUF: F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés, bengalí (বাংলা), banglish |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de Qwen3-0.6B, un modelo causal de lenguaje con atención estándar. El entrenamiento se realizó mediante QLoRA con cuantización de 4 bits (NF4), seguido de una fase de LoRA con r=32 y α=64, y posterior fusión de los adaptadores al modelo base en FP16. La pérdida se calculó únicamente sobre los turnos de asistente (completion-only loss), lo que permite un ajuste más dirigido a la generación de respuestas.

El conjunto de datos de entrenamiento incluye instrucciones de código de alta calidad, problemas de estilo open source, ejemplos educativos de codificación segura (patrones vulnerables y sus correcciones), datos generales ligeros y contenido en bengalí, además de repeticiones de la identidad del modelo. El modo de pensamiento (thinking) está deshabilitado, por lo que el modelo responde directamente sin razonamiento intermedio explícito.

## Capacidades

- Generación de código en múltiples lenguajes de programación, con énfasis en Python y otros lenguajes comunes.
- Depuración de código: identificación de errores y sugerencias de corrección.
- Explicación de conceptos de programación y fragmentos de código.
- Conciencia de seguridad: detección de patrones vulnerables (inyección, secretos expuestos, autenticación débil) y recomendación de alternativas seguras.
- Soporte multilingüe: conversación y generación de código en inglés, bengalí y banglish.
- Estilo de respuesta directo, sin modo de razonamiento extendido.
- Compatible con el formato de chat de Transformers (apply_chat_template) y con generación de texto estándar.

## Casos de uso

- Asistente de codificación local: un desarrollador puede ejecutar RIFA Edge en su portátil con GPU modesta o CPU cuantizada para obtener sugerencias de código sin conexión a internet, ideal para entornos con restricciones de red o privacidad.
- Aprendizaje de buenas prácticas de seguridad: el modelo puede usarse como herramienta educativa para enseñar a programadores noveles a evitar vulnerabilidades comunes, mostrando ejemplos de código inseguro y su versión corregida.
- Chat de soporte técnico en bengalí: gracias a su soporte multilingüe, puede integrarse en aplicaciones de atención al cliente o foros de desarrollo donde los usuarios se comunican en bengalí o banglish.
- Generación de scripts de automatización: útil para crear scripts de administración de sistemas, procesamiento de datos o tareas de CI/CD, con recomendaciones de seguridad integradas.
- Revisión de código en entornos de desarrollo: puede utilizarse como complemento en editores de código para señalar posibles problemas de seguridad en tiempo real, aunque se recomienda una revisión humana posterior.
- Prototipado rápido de funciones: para generar esqueletos de funciones o clases a partir de descripciones en lenguaje natural, acelerando el desarrollo inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. Se recomienda evaluar el modelo en tareas específicas de generación de código y seguridad antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener ~0.6B parámetros, en FP16 ocupa aproximadamente 1,2 GB de memoria, y en cuantización Q4_K_M alrededor de 0,5 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y pueden variar según la implementación.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar el modelo en FP16; para cuantizaciones GGUF, incluso GPUs integradas o CPUs modernas son suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas como GTX 1060 6GB, RTX 2060, RTX 3060, etc., y también en Apple Silicon con MLX.
- Opciones de despliegue: Transformers (Python), llama.cpp, Ollama, vLLM (si se adapta), text-generation-inference (endpoints compatibles según los tags).
- Latencia y throughput: no se dispone de datos medidos; en una GPU moderna se espera una generación de decenas de tokens por segundo, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| RIFA Edge 0.6B | 596M | no disponible | Apache 2.0 | Código + seguridad, multilingüe (en/bn) |
| RIFA Nano 0.5B | ~0.5B | no disponible | Apache 2.0 (presumible) | Código, parte de la serie RIFA |
| RIFA Flash 1.7B | ~1.7B | no disponible | Apache 2.0 (presumible) | Código, parte de la serie RIFA |
| Qwen3-0.6B (base) | ~0.6B | no disponible | Apache 2.0 | Modelo base generalista |

No se dispone de datos de rendimiento comparativo. La comparativa se limita a parámetros y enfoque declarado. Se recomienda consultar la documentación de Qwen3-0.6B para conocer el contexto original, aunque no se ha confirmado si RIFA Edge mantiene la misma longitud de contexto.

## Limitaciones y advertencias

- Modelo pequeño: su capacidad es limitada para razonamiento de múltiples archivos o APIs poco comunes; puede fallar en tareas complejas de ingeniería de software.
- Sin conocimiento en vivo: el modelo no tiene acceso a información actualizada y puede responder con una línea fija de disculpa cuando no sabe algo.
- Riesgo de alucinación: como todo modelo generativo, puede producir código incorrecto o inseguro; siempre debe revisarse antes de su uso en producción.
- La guía de seguridad es educativa y no sustituye una auditoría profesional de seguridad.
- No se especifica la longitud de contexto, por lo que puede haber limitaciones en conversaciones muy largas o en la entrada de código extenso.
- El modelo está ajustado para responder directamente (sin modo de pensamiento), lo que puede reducir la calidad en tareas que requieren razonamiento paso a paso.
- Aunque la licencia es Apache 2.0, se recomienda verificar los términos de uso del modelo base Qwen3-0.6B, aunque este también es Apache 2.0.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/smshahbaj/RIFA-Edge-0.6B
- Sitio del autor: https://smshahbaj.com
- Perfil de GitHub del autor: https://github.com/smshahbaj-official/
- Modelo relacionado RIFA-CODE-0.6B: https://huggingface.co/smshahbaj/RIFA-CODE-0.6B
