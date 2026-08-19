# OMAAPP/qwen2.5-coder-1.5b-gguf

## Resumen

OMAAPP/qwen2.5-coder-1.5b-gguf es un mirror del modelo Qwen2.5-Coder-1.5B-Instruct-GGUF, publicado por el usuario OMAAPP. Se trata de una copia exacta del archivo cuantizado `qwen2.5-coder-1.5b-instruct-q5_k_m.gguf` del repositorio oficial de Qwen, verificada mediante el hash SHA-256 incluido en la model card. El modelo original, desarrollado por Alibaba Cloud, es un modelo de lenguaje especializado en código de 1.500 millones de parámetros, diseñado para tareas de generación, explicación y refactorización de código, así como para razonamiento matemático y comprensión de lenguaje natural.

Este mirror es relevante porque permite acceder al modelo en formato GGUF, optimizado para inferencia local en CPU y GPU con recursos limitados. Al tratarse de una cuantización de 5 bits (q5_k_m), ofrece un equilibrio entre tamaño y calidad de salida, lo que lo hace adecuado para despliegues en entornos de desarrollo, asistentes de código embebidos o prototipos rápidos. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

El archivo tiene un tamaño de 1,3 GB y el repositorio no incluye pesos en safetensors, solo el GGUF. Aunque el mirror no añade ninguna modificación técnica, su existencia facilita la descarga en regiones con acceso limitado a HuggingFace, ya que el autor indica "region:us" en los tags.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Qwen2.5) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo original soporta 32.768 tokens, pero no se confirma en este mirror) |
| Tipos de cuantizacion | q5_k_m (único archivo incluido) |
| Idiomas soportados | no disponible (el modelo original soporta múltiples idiomas, pero no se detalla en el mirror) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no incluido) |

## Arquitectura y entrenamiento

El modelo original Qwen2.5-Coder-1.5B-Instruct es un transformer decoder-only con arquitectura estándar de la familia Qwen2.5. No se dispone de información detallada sobre el número de capas, dimensiones ocultas o atención en la información proporcionada. El entrenamiento del modelo original se realizó con un corpus masivo de código y datos de texto, con un enfoque en mejorar las capacidades de generación de código frente a la versión anterior CodeQwen1.5. Se sabe que la serie Qwen2.5-Coder cubre tamaños de 0.5B a 32B, y que el modelo de 1.5B está optimizado para entornos con restricciones de memoria.

El mirror no incluye información adicional sobre el proceso de entrenamiento, ni sobre técnicas como RLHF o DPO. La cuantización q5_k_m fue aplicada por el equipo de Qwen para reducir el tamaño del modelo manteniendo una calidad aceptable. No se documentan innovaciones técnicas específicas en este mirror, más allá de la propia cuantización.

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, JavaScript, Java, C++, etc.), a partir de descripciones en lenguaje natural o fragmentos incompletos.
- Explicación de código: puede describir qué hace un fragmento de código y sugerir mejoras.
- Completado de código: dado un contexto parcial, sugiere continuaciones coherentes.
- Razonamiento matemático básico y resolución de problemas algorítmicos.
- Soporte de instrucciones en lenguaje natural gracias a su entrenamiento como modelo instruct.
- No se confirma soporte de tool calling, function calling, agentes o capacidades multimodales en la información disponible.

## Casos de uso

- Autocompletado de código en editores: el modelo puede integrarse en plugins de VS Code o Neovim para sugerir líneas o bloques de código mientras el desarrollador escribe, gracias a su tamaño reducido y baja latencia en CPU.
- Generación de scripts de automatización: dado un requisito en lenguaje natural ("crea un script que renombre archivos en un directorio"), el modelo produce un script funcional en Python o Bash.
- Asistente de aprendizaje de programación: estudiantes pueden usarlo para obtener explicaciones de conceptos o depuración de errores sencillos, sin necesidad de GPU dedicada.
- Refactorización de código legacy: el modelo puede sugerir reescrituras de funciones simples o renombrar variables de forma consistente, aunque con limitaciones por su tamaño.
- Prototipado rápido de APIs: a partir de una especificación breve, genera esqueletos de endpoints en frameworks como Flask o Express.
- Entornos con recursos limitados: ideal para ejecutarse en Raspberry Pi, portátiles antiguos o contenedores Docker con menos de 2 GB de RAM, donde otros modelos de 7B no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El mirror no incluye métricas de evaluación y la búsqueda web no proporciona datos concretos de MMLU, HumanEval u otros tests. Se recomienda consultar el repositorio oficial de Qwen2.5-Coder para obtener resultados comparativos, aunque no están disponibles en esta ficha.

## Requisitos de hardware

- El archivo GGUF ocupa 1,3 GB en disco, por lo que cabe en cualquier sistema con al menos 2 GB de almacenamiento libre.
- Inferencia en CPU: posible con 4-6 GB de RAM total, utilizando llama.cpp o herramientas compatibles. La velocidad será modesta (10-20 tokens por segundo en un procesador moderno de 4 núcleos).
- Inferencia en GPU: puede ejecutarse en GPUs con 2-4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o incluso iGPUs con suficiente memoria compartida. Con una RTX 3090 se alcanzan velocidades de 100+ tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, o servidores compatibles con GGUF como llama-cpp-python.
- No se requieren GPUs de datacenter; el modelo está pensado para hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (este mirror) | 1.5B | no disponible (original 32K) | Apache-2.0 | GGUF |
| DeepSeek-Coder-1.3B-Instruct | 1.3B | 16K | MIT | safetensors, GGUF |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 license (uso comercial permitido con restricciones) | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la información proporcionada. En términos de tamaño y licencia, este modelo es más permisivo que CodeLlama (Apache-2.0 vs licencia Llama) y ligeramente más grande que DeepSeek-Coder-1.3B, aunque ambos son comparables en capacidades para tareas de código. La disponibilidad en GGUF facilita su uso en entornos locales.

## Limitaciones y advertencias

- Al ser un modelo de 1.5B, su capacidad de razonamiento complejo es limitada. Puede generar código incorrecto o incompleto en tareas que requieran lógica avanzada o comprensión profunda del contexto.
- Riesgo de alucinación: puede inventar APIs, funciones o sintaxis que no existen, especialmente en lenguajes poco comunes.
- El contexto máximo no está confirmado en este mirror; aunque el original soporta 32K, el archivo GGUF podría tener limitaciones en la práctica según el runtime utilizado.
- El mirror no incluye información sobre sesgos o limitaciones idiomáticas. Se asume que el modelo funciona mejor en inglés y lenguajes de programación populares, pero no hay datos verificados.
- No se recomienda su uso en producción sin pruebas exhaustivas, dado su tamaño reducido y la falta de benchmarks disponibles.
- La cuantización q5_k_m introduce una ligera pérdida de calidad frente al modelo original en fp16, aunque en tareas de código suele ser aceptable.
- No hay garantía de que el mirror esté actualizado con el modelo original; aunque el hash SHA-256 confirma que coincide con el archivo oficial, futuras actualizaciones de Qwen no se reflejarán automáticamente en este repositorio.

## Enlaces

- Repositorio del mirror: https://huggingface.co/OMAAPP/qwen2.5-coder-1.5b-gguf
- Repositorio original de Qwen: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF
- Repositorio de QuantFactory (alternativa): https://huggingface.co/QuantFactory/Qwen2.5-Coder-1.5B-GGUF
- GitHub oficial de Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- Página en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF
