# shimbaaa/shifu-smart-gguf

## Resumen

Shifu-Smart es un modelo de lenguaje pequeño (268 millones de parámetros) desarrollado por el usuario shimbaaa, que parte del modelo base `google/functiongemma-270m-it` de Google y se ajusta finamente sobre el conjunto de datos `SystemChat`. El modelo está orientado a tareas conversacionales y de function calling, y se distribuye en formato GGUF, lo que permite su ejecución en entornos con recursos limitados, incluidas CPU y GPUs de gama baja.

La relevancia de este modelo radica en su tamaño reducido y su especialización en llamadas a funciones, lo que lo convierte en una opción interesante para prototipos y aplicaciones ligeras que necesiten integración con herramientas externas. Al estar basado en la familia Gemma, hereda la arquitectura transformer decoder-only de Google, aunque con una ventana de contexto y capacidades limitadas por su escala. Su licencia Gemma permite uso comercial bajo ciertas condiciones, aunque el proyecto no presenta aún una comunidad activa ni descargas registradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Gemma 3 text) |
| Parametros totales | 268.098.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, no especificadas) |
| Idiomas soportados | no disponible |
| Licencia | Gemma |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Shifu-Smart se construye sobre `functiongemma-270m-it`, un modelo de Google diseñado específicamente para function calling y generación de respuestas estructuradas. La arquitectura es un transformer decoder-only con aproximadamente 268 millones de parámetros, perteneciente a la familia Gemma 3 text. El ajuste fino se realizó sobre el dataset `SystemChat`, que no está documentado públicamente en la información disponible, pero por el nombre se infiere que contiene conversaciones con instrucciones de sistema.

El modelo utiliza el rol `developer` para las instrucciones del sistema, una convención heredada de la versión instruct de FunctionGemma. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. El proceso de cuantización a GGUF se realizó con la herramienta Unsloth, según los tags del repositorio, lo que facilita su despliegue en entornos de inferencia locales.

## Capacidades

- Generación de texto conversacional: responde en formato de diálogo multi-turno, adecuado para chatbots y asistentes.
- Function calling: al estar basado en FunctionGemma, soporta la generación de llamadas a funciones estructuradas (JSON) para integración con APIs y herramientas.
- Instrucciones de sistema: utiliza el rol `developer` para configurar el comportamiento del modelo, permitiendo personalizar el tono y las reglas de la conversación.
- Compatibilidad con GGUF: puede ejecutarse en CPU y GPUs modestas mediante llama.cpp, Ollama u otros motores compatibles.
- Multilingüismo: no se han publicado datos sobre los idiomas soportados; se asume que hereda las capacidades del modelo base, pero no está confirmado.

## Casos de uso

- Asistentes conversacionales ligeros: el modelo puede integrarse en aplicaciones de chat en tiempo real, como bots de Telegram o Slack, donde el bajo consumo de recursos permite ejecutarlo en un VPS pequeño o incluso en un Raspberry Pi.
- Prototipado de agentes con function calling: gracias a su capacidad para generar llamadas a funciones, es útil para validar flujos de agentes que consultan APIs (clima, calendario, bases de datos) antes de migrar a modelos más grandes.
- Automatización de tareas de soporte: puede gestionar consultas frecuentes de usuarios, derivando a herramientas externas cuando sea necesario, aunque su tamaño limita la complejidad de las respuestas.
- Educación y experimentación: por su pequeño tamaño, es ideal para enseñar conceptos de fine-tuning, cuantización y despliegue de modelos en entornos académicos o de investigación.
- Edge computing: su formato GGUF y su bajo peso permiten desplegarlo en dispositivos con poca memoria, como routers o dispositivos IoT, para tareas de procesamiento de lenguaje natural básico.
- Evaluación de pipelines de function calling: los desarrolladores pueden usarlo como modelo de referencia para probar infraestructuras de tool calling (por ejemplo, con vLLM o llama.cpp) sin incurrir en costes de cómputo elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo. Tampoco se han encontrado comparativas con otros modelos en la documentación pública.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 268M parámetros, una cuantización GGUF de 4 bits ocupa aproximadamente 150-200 MB, por lo que puede ejecutarse en GPUs con 2 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2050, o integradas como Apple Silicon M1). También funciona en CPU con 4-8 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU moderna, incluidas las de portátiles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, o servidores de inferencia como vLLM (con adaptación a GGUF). También puede ejecutarse en CPU pura con una latencia aceptable para tareas interactivas.
- Latencia y throughput: no se han publicado mediciones oficiales. En una CPU moderna, se espera una generación de 10-20 tokens por segundo; en una GPU de gama media, 50-100 tokens por segundo, aunque son estimaciones orientativas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros modelos de la misma categoría. El modelo base `functiongemma-270m-it` es su referencia directa, pero no se han encontrado datos de rendimiento comparativo. Alternativas teóricas serían otros modelos pequeños de function calling como `phi-2` (2.7B) o `tinyllama` (1.1B), pero no se dispone de benchmarks que permitan una comparación objetiva.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo muy pequeño, es propenso a generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Limitaciones de contexto: la ventana de contexto no está documentada, pero por el tamaño del modelo se estima que es corta (probablemente 2K-4K tokens), lo que limita conversaciones largas o documentos extensos.
- Idiomas: no se ha confirmado el soporte multilingüe; es probable que el rendimiento fuera del inglés sea deficiente.
- Licencia: la licencia Gemma permite uso comercial, pero con restricciones (por ejemplo, no usar para ciertos fines prohibidos). Se recomienda revisar los términos completos de la licencia Gemma antes de producción.
- Madurez del proyecto: el modelo tiene 0 descargas y 1 like, lo que indica que no ha sido validado por la comunidad. No hay garantías de calidad ni soporte.
- Dependencia del dataset SystemChat: al no estar documentado, no se puede evaluar la calidad de los datos de entrenamiento ni su posible sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shimbaaa/shifu-smart-gguf
- Perfil del autor: https://huggingface.co/shimbaaa
- Modelo base: https://huggingface.co/google/functiongemma-270m-it
