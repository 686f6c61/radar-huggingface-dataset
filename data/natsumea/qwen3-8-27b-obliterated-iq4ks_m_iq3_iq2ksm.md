# Natsumea/Qwen3.8-27B-OBLITERATED-IQ4KS_M_IQ3_IQ2KSM

## Resumen

El modelo `Natsumea/Qwen3.8-27B-OBLITERATED-IQ4KS_M_IQ3_IQ2KSM` es una versión cuantizada y modificada del modelo Qwen3.8-27B, desarrollado originalmente por el equipo Qwen de Alibaba. Qwen3.8-27B es un modelo multimodal denso de 27 000 millones de parámetros, diseñado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina, con capacidades nativas de visión y lenguaje. La variante "OBLITERATED" aplica una técnica de abliteración que elimina los mecanismos de rechazo del modelo, dando lugar a una versión sin censura a nivel de pesos, no solo mediante instrucciones.

Esta ficha concreta, publicada por el usuario Natsumea, combina cuantizaciones IQ (IQ4_K_S, IQ3, IQ2_K_S) en un solo archivo, lo que permite ejecutar el modelo en hardware con recursos limitados, como portátiles con GPU de consumo o Apple Silicon. Aunque el modelo base se distribuye bajo licencia Apache 2.0, esta versión cuantizada no especifica su propia licencia, por lo que se debe consultar al autor antes de un uso comercial. La relevancia actual radica en ofrecer una alternativa local, rápida y sin restricciones de contenido para desarrolladores que necesitan un modelo multimodal de 27B en entornos con poca VRAM.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) |
| Parametros totales | 27 000 millones (27B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base soporta 32 768 tokens, pero esta versión no lo especifica) |
| Tipos de cuantizacion | IQ4_K_S, IQ3, IQ2_K_S (mezcla en un solo archivo) |
| Idiomas soportados | no disponible (el modelo base soporta múltiples idiomas, incluido español) |
| Licencia | no disponible (el modelo base es Apache 2.0) |
| Formato de pesos | GGUF (mezcla de cuantizaciones IQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con arquitectura multimodal, capaz de procesar texto e imágenes de forma conjunta. Se entrenó con un corpus masivo de datos multilingües y multimodales, con un enfoque específico en tareas de codificación, razonamiento y automatización de oficina. La versión "OBLITERATED" se obtiene mediante abliteración, una técnica que identifica y elimina las direcciones en el espacio de activaciones responsables de los comportamientos de rechazo, de modo que el modelo deja de negarse a responder a ciertas solicitudes. Esta modificación se realiza a nivel de pesos, no mediante prompts, y se ha aplicado sobre el modelo original sin reentrenamiento adicional.

La cuantización IQ (I-quant) utilizada en esta ficha combina varios niveles de precisión (IQ4_K_S, IQ3, IQ2_K_S) para optimizar el equilibrio entre tamaño, velocidad y calidad. El archivo resultante es un GGUF, formato estándar para ejecución en llama.cpp, Ollama y otros motores de inferencia locales. No se dispone de información sobre el proceso exacto de cuantización ni sobre los datos de entrenamiento de la versión abliterada.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica y matemáticas.
- Generación y comprensión de código en múltiples lenguajes de programación, con soporte para tool calling y flujos agénticos.
- Procesamiento de imágenes: el modelo base es nativamente multimodal, por lo que puede describir imágenes, responder preguntas visuales y realizar tareas de OCR.
- Automatización de oficina: redacción de documentos, resúmenes, generación de informes y análisis de datos.
- Capacidad multilingüe, aunque el alcance exacto en esta versión no está documentado.
- Al estar abliterado, no presenta rechazo a contenido considerado sensible o no seguro, lo que permite su uso en investigación de seguridad y red teaming.

## Casos de uso

- Asistente de programación local: el modelo puede integrarse en un IDE o CLI para autocompletar código, explicar fragmentos y refactorizar, gracias a su entrenamiento específico en coding y su capacidad de tool calling.
- Automatización de tareas de oficina: redacción de correos, generación de presentaciones y resúmenes de documentos, aprovechando su capacidad multimodal para procesar capturas de pantalla o PDFs.
- Agente autónomo en entornos sin conexión: al ser un modelo de 27B cuantizado, puede ejecutarse en una estación de trabajo con GPU de 16 GB, permitiendo la creación de agentes que interactúan con APIs y herramientas locales.
- Análisis de imágenes en entornos industriales: descripción de defectos en fotografías de producto, lectura de etiquetas o verificación visual, gracias a su componente de visión.
- Investigación en seguridad y red teaming: al ser una versión sin censura, es útil para estudiar comportamientos de modelos, generar contenido adversarial o probar sistemas de moderación.
- Despliegue en edge computing: con cuantizaciones IQ2 e IQ3, el modelo puede caber en dispositivos con 8-10 GB de RAM, como portátiles con Apple Silicon o GPU de gama media, habilitando inferencia multimodal en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-27B reporta mejoras en tareas de codificación y productividad de oficina frente a su predecesor, pero no se dispone de cifras concretas para esta versión cuantizada y abliterada.

## Requisitos de hardware

- VRAM estimada: según la información de la comunidad, la cuantización Q4_K_M del modelo base ocupa aproximadamente 16,8 GB en Windows con CUDA, y Q3_K_M unos 13,5 GB en Mac M5 Pro con Metal. Esta versión con mezcla IQ4/IQ3/IQ2 probablemente se sitúe en un rango de 10-15 GB, dependiendo de la proporción de capas de cada nivel.
- GPU recomendadas: RTX 3090, RTX 4090, A100, o Apple Silicon con 16 GB o más de memoria unificada.
- En consumer GPU: sí, cabe en tarjetas con 12-16 GB de VRAM, como RTX 3060 12GB o RTX 4070, usando cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o cualquier motor compatible con GGUF. También se puede usar con MLX en Apple Silicon para un rendimiento 30-50 % superior.
- Latencia y throughput: no disponible, pero al ser un modelo de 27B cuantizado, se espera una generación de 10-30 tokens por segundo en hardware moderno, dependiendo de la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 32 768 | Sí | Apache 2.0 | Safetensors, GGUF |
| Qwen3.8-27B-OBLITERATED (versión abliterada) | 27B | 32 768 | Sí | Apache 2.0 | Safetensors, GGUF |
| Natsumea/Qwen3.8-27B-OBLITERATED-IQ4KS_M_IQ3_IQ2KSM | 27B | no disponible | Sí (heredado) | no disponible | GGUF (IQ mixto) |
| Llama 3.1 8B (para comparar tamaño menor) | 8B | 128K | No | Llama 3.1 | Safetensors, GGUF |

La comparativa muestra que esta versión cuantizada ofrece una alternativa más ligera que el modelo original, manteniendo las capacidades multimodales y la ausencia de censura, a costa de una calidad de salida potencialmente reducida por la cuantización agresiva.

## Limitaciones y advertencias

- Al ser una versión abliterada, el modelo puede generar contenido ofensivo, ilegal o peligroso sin filtros. No debe utilizarse en aplicaciones orientadas al público sin una capa de moderación externa.
- La cuantización mixta IQ2/IQ3 puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código largo.
- No se especifica la licencia de esta versión concreta; aunque el modelo base es Apache 2.0, la modificación y cuantización pueden tener restricciones adicionales. Se recomienda contactar al autor antes de un uso comercial.
- No se dispone de información sobre la longitud de contexto efectiva tras la cuantización; es posible que se reduzca respecto al valor original de 32 768 tokens.
- El modelo no ha sido evaluado formalmente en benchmarks, por lo que su rendimiento real en tareas específicas es incierto.
- La fecha de creación (2026) sugiere que es un modelo reciente, pero no hay evidencia de mantenimiento o soporte por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Natsumea/Qwen3.8-27B-OBLITERATED-IQ4KS_M_IQ3_IQ2KSM
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Versión OBLITERATED original: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Archivo GGUF de referencia: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/blob/main/Qwen3.8-27B-OBLITERATED-IQ4_XS.gguf
- Guía de uso en GitHub (uncensored): https://github.com/Wassimyounes01/qwen38-uncensored
- Página de QwenCloud sobre el modelo: https://www.qwencloud.com/models/qwen3.8-27b
