# NoxNotreve/Qwen2.5-Coder-0.5B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-0.5B-Instruct-GGUF es la conversión a formato GGUF del modelo de instrucción de código Qwen2.5-Coder-0.5B-Instruct, desarrollado por Alibaba Cloud. Esta versión específica ha sido cuantizada por el usuario NoxNotreve para facilitar su ejecución en entornos locales con llama.cpp, Ollama u otros motores compatibles con GGUF. El modelo pertenece a la familia Qwen2.5-Coder, una serie de modelos de lenguaje especializados en generación y comprensión de código, que en su versión de 32B alcanza un rendimiento comparable a GPT-4o en tareas de programación.

Con 0.49B de parámetros, 24 capas y una ventana de contexto de 32.768 tokens, este modelo está diseñado para tareas de generación de código, razonamiento y corrección de errores en entornos con recursos limitados. Su tamaño compacto lo hace adecuado para ejecutarse en hardware de consumo, incluso en CPU, y su licencia Apache 2.0 permite uso comercial sin restricciones. La cuantización GGUF ofrece varias opciones (q2_K, q4_K_M, q5_K_M, etc.) para ajustar el equilibrio entre rendimiento y precisión según el hardware disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm, Attention QKV bias y embeddings atados |
| Parametros totales | 0.49B (según la model card; el archivo safetensors del modelo base indica 630.167.424, pero el repo GGUF no incluye safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (extensible a 131.072 con YARN solo en vLLM y modelos no GGUF) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Inglés (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-Coder-0.5B-Instruct es un transformer causal denso con 24 capas, atención de consulta agrupada (GQA) con 14 cabezas de consulta y 2 de clave/valor, y una ventana de contexto de 32.768 tokens. La serie Qwen2.5-Coder fue preentrenada con 5.5 billones de tokens, incluyendo código fuente, datos de enlace texto-código y datos sintéticos, según la model card. La versión instruct se sometió a un post-entrenamiento adicional con datos de instrucciones para mejorar el seguimiento de comandos y las capacidades de conversación. No se especifica si se utilizó RLHF o DPO, aunque el modelo muestra una buena capacidad de chat.

La conversión a GGUF no modifica la arquitectura ni los pesos, solo cambia el formato de empaquetado para permitir la cuantización y la ejecución eficiente en CPU y GPU con llama.cpp u otros motores compatibles.

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, C++, Java, JavaScript, etc.) con sintaxis correcta.
- Razonamiento sobre código: explicar, resumir y responder preguntas sobre fragmentos de código.
- Corrección de errores (code fixing): identificar y sugerir correcciones en código defectuoso.
- Razonamiento matemático y capacidades generales heredadas de Qwen2.5, aunque en menor medida que los modelos más grandes de la familia.
- Conversación multi-turno en inglés, con soporte para instrucciones de chat.
- No se menciona en la model card el soporte de tool calling o function calling, aunque la familia Qwen2.5-Coder en versiones instruct lo soporta según documentación oficial; esta versión GGUF no lo confirma explícitamente.

## Casos de uso

- Asistente de programación integrado en editores de texto: el modelo puede autocompletar código, sugerir implementaciones y explicar fragmentos complejos, gracias a su tamaño reducido que permite ejecutarse localmente en tiempo real.
- Educación y aprendizaje de programación: los estudiantes pueden hacer preguntas sobre conceptos de programación, recibir ejemplos de código y obtener explicaciones paso a paso sin depender de servicios en la nube.
- Corrección de errores en proyectos pequeños: dado su conocimiento de patrones de código, puede identificar y proponer soluciones para bugs comunes en scripts o funciones sencillas.
- Automatización de tareas de desarrollo con recursos limitados: ejecutar en dispositivos de bajo consumo (Raspberry Pi, portátiles antiguos) para generar plantillas de código o refactorizar fragmentos simples.
- Entornos de desarrollo offline: usar el modelo en entornos sin conexión a internet, donde la privacidad o la seguridad exigen no enviar código a servicios externos.
- Prototipado rápido de soluciones: generar esqueletos de código para APIs, funciones o algoritmos básicos en una sesión interactiva, sin necesidad de un modelo de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo de 0.5B en la model card. La documentación de la serie Qwen2.5-Coder remite a un blog y a un reporte técnico, pero no se incluyen cifras concretas en la información proporcionada. Los benchmarks del modelo de 32B muestran rendimiento comparable a GPT-4o, pero los resultados del 0.5B no se detallan.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 0.49B parámetros. En cuantización q4_K_M, el tamaño del archivo GGUF es aproximadamente 0.3-0.4 GB. La VRAM necesaria para la inferencia completa es de alrededor de 1-2 GB, incluyendo buffers y overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2050, o incluso integradas modernas (Intel Iris Xe, AMD Radeon Vega). Una RTX 3060 o superior ofrecerá una latencia muy baja.
- Cabe en GPU de consumo: sí, es uno de los modelos más pequeños de la serie y puede ejecutarse en casi cualquier hardware actual, incluso en CPU con 4-8 GB de RAM.
- Opciones de despliegue: llama.cpp (con `llama-cli`), Ollama (si se convierte a formato compatible), vLLM (para GPU, aunque requiere pesos safetensors), y cualquier framework que soporte GGUF, como llama-cpp-python.
- Latencia y throughput: no se proporcionan datos oficiales, pero por su tamaño, la generación de tokens es muy rápida en GPU; en CPU, la velocidad depende del número de hilos y la cuantización, pero suele ser de varios tokens por segundo en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwen2.5-Coder-0.5B-Instruct (este) | 0.49B | 32K | Apache 2.0 | GGUF | Código y chat |
| Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | safetensors, GGUF | Código y chat |
| CodeLlama-7B | 7B | 16K | Llama 2 license | safetensors, GGUF | Código y chat |
| StarCoder2-3B | 3B | 16K | BigCode OpenRAIL-M | safetensors | Código |

El modelo de 0.5B es el más pequeño de la serie Qwen2.5-Coder, ideal para entornos con recursos muy limitados. Comparado con CodeLlama-7B y StarCoder2-3B, tiene una ventaja en tamaño y velocidad, aunque su capacidad de razonamiento es menor. La licencia Apache 2.0 es más permisiva que la de CodeLlama.

## Limitaciones y advertencias

- Al ser un modelo de 0.5B, su capacidad de razonamiento complejo es limitada; puede fallar en tareas de código muy complejas o con dependencias largas.
- Riesgo de alucinación: como todos los LLM, puede generar código incorrecto o explicaciones plausibles pero erróneas. Se recomienda verificar el código generado.
- Solo soporta inglés según la model card, aunque puede tener conocimiento multilingüe de código (los identificadores suelen ser en inglés), pero la conversación está limitada al inglés.
- La ventana de contexto de 32K tokens es amplia, pero la extensión a 131K solo es posible con vLLM y modelos no-GGUF, por lo que con GGUF no se puede aprovechar.
- La conversión GGUF puede tener una ligera pérdida de precisión dependiendo de la cuantización elegida; las cuantizaciones más bajas (q2_K) reducen la calidad de salida.
- No se especifica el soporte de tool calling en esta versión GGUF, por lo que para aplicaciones que requieran agentes con funciones, se recomienda usar el modelo original en safetensors.

## Enlaces

- Repositorio de Hugging Face de esta conversión: https://huggingface.co/NoxNotreve/Qwen2.5-Coder-0.5B-Instruct-GGUF
- Repositorio oficial del modelo base (safetensors): https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Repositorio oficial GGUF de Qwen (para comparación): https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF
- Blog de la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentación de llama.cpp: https://qwen.readthedocs.io/en/latest/run_locally/llama.cpp.html
- Reporte técnico (arXiv:2409.12186): https://arxiv.org/abs/2409.12186
- Reporte técnico de Qwen2 (arXiv:2407.10671): https://arxiv.org/abs/2407.10671
