# M-hilani/gemma-2-2B-it-thinking-function_calling-V0

## Resumen

Este modelo es un fine-tuning de `google/gemma-2-2b-it` realizado por el usuario M-hilani, con el objetivo de añadir una capa de razonamiento explícito ("thinking") antes de realizar llamadas a funciones. Según modelos homónimos publicados por otros autores, esta variante incorpora un proceso de pensamiento intermedio que precede a la invocación de herramientas, lo que mejora la fiabilidad de las respuestas en escenarios de agentes. El entrenamiento se realizó mediante Supervised Fine-Tuning (SFT) utilizando el framework TRL de Hugging Face.

El modelo hereda la arquitectura base de Gemma 2 (transformer decoder-only de aproximadamente 2.6 mil millones de parámetros), con un tamaño de repositorio de 2.5 GB en formato safetensors. Es relevante porque aborda una limitación habitual de los modelos pequeños: la tendencia a invocar funciones sin razonar previamente sobre la necesidad o los argumentos de la llamada. Al añadir un paso de razonamiento explícito, se busca reducir errores en flujos de automatización y agentes conversacionales.

Cabe señalar que el repositorio no incluye información sobre el dataset de entrenamiento, la licencia exacta ni resultados de evaluación, y cuenta con cero descargas y cero likes en el momento de su publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) |
| Parametros totales | ~2.6 mil millones (heredados del modelo base google/gemma-2-2b-it) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (heredada del modelo base, no confirmada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base soporta principalmente ingles y multiples idiomas con rendimiento variable) |
| Licencia | No disponible (la model card indica "license" sin especificar; el modelo base usa Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint `google/gemma-2-2b-it` mediante entrenamiento supervisado (SFT). La arquitectura base es un transformer decoder-only con atención local y global alternada, característica de la familia Gemma 2. El entrenamiento se realizó con el framework TRL (versión 1.10.0), Transformers 5.15.0, PyTorch 2.11.0+cu128 y Datasets 5.0.1, según la model card.

La innovación principal reside en la incorporación de una "capa de pensamiento" (thinking layer) que precede a las llamadas de función. Aunque la model card del autor no detalla el proceso, los modelos homónimos de otros autores (AaronShih, Sellid) describen el mismo enfoque: el modelo genera un razonamiento interno explícito antes de emitir la llamada a la herramienta. Esto se implementa probablemente mediante tokens especiales o un formato de prompt específico que induce al modelo a pensar en voz alta antes de producir la invocación. No se especifica el dataset utilizado ni el número de tokens de entrenamiento.

## Capacidades

- Generación de texto: hereda las capacidades de generación del modelo base Gemma 2 2B, incluyendo respuesta a preguntas, resumen y diálogo conversacional.
- Function calling con razonamiento previo: el modelo está entrenado para emitir un paso de "thinking" antes de invocar una función, lo que permite decidir si la llamada es necesaria y construir los argumentos de forma más fiable.
- Razonamiento multi-paso: la capa de pensamiento explícita facilita el razonamiento encadenado antes de actuar, útil en tareas de agentes.
- Soporte de chat: compatible con el formato de chat de Gemma 2 mediante el pipeline de transformers con roles de usuario y asistente.
- Capacidades multilingües: no documentadas en este fine-tuning; el modelo base tiene soporte multilingüe limitado con predominio del inglés.

## Casos de uso

- Agentes conversacionales con herramientas: el modelo puede integrarse en asistentes que necesitan consultar APIs o bases de datos, razonando primero sobre qué función invocar y con qué parámetros, reduciendo llamadas erróneas.
- Automatización de tareas de back-office: en pipelines que requieren extraer información de documentos o sistemas externos, el modelo puede decidir cuándo llamar a una función de búsqueda o actualización y cuándo responder directamente.
- Asistentes de soporte técnico: integrado en sistemas de ticketing, el modelo puede razonar sobre el problema del usuario y decidir si escalar, buscar en la base de conocimiento o responder directamente, usando tool calling para consultar la KB.
- Generación de código con verificación previa: el modelo puede razonar sobre los requisitos de una tarea de programación antes de invocar funciones de ejecución o búsqueda de snippets, mejorando la calidad de las respuestas en IDEs asistidos.
- Prototipado de agentes con presupuesto reducido: al ser un modelo de 2B, puede desplegarse en hardware modesto, permitiendo experimentar con arquitecturas de agentes con function calling sin necesidad de GPUs de gran tamaño.
- Educación e investigación en alineación de agentes: sirve como base para estudiar cómo el razonamiento explícito afecta a la calidad de las llamadas a herramientas en modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo base o con otros fine-tunes de function calling. Tampoco se documentan pruebas específicas de precisión en llamadas a funciones.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~2.6 mil millones de parámetros en precisión FP16, se necesitan aproximadamente 5-6 GB de VRAM. Con cuantización a 4 bits (no publicada por el autor, pero posible mediante herramientas externas), se puede reducir a ~2-3 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, o GPUs de datacenter como A10 o L4. El modelo cabe en la mayoría de GPUs de consumo actuales.
- Compatibilidad con GPU de consumo: sí, es viable en GPUs con 8 GB o más de VRAM, especialmente con cuantización.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierten los pesos a GGUF), Ollama o directamente con el pipeline de transformers.
- Latencia y throughput estimados: no disponibles. Como referencia orientativa, un modelo de 2B en una RTX 4090 puede generar entre 50 y 100 tokens por segundo en FP16, pero no hay datos medidos para este fine-tuning concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| M-hilani/gemma-2-2B-it-thinking-function_calling-V0 | ~2.6B | 8192 (heredado) | Thinking + function calling | No especificada | Hugging Face |
| google/gemma-2-2b-it (modelo base) | ~2.6B | 8192 | Chat general, sin thinking explícito | Gemma Terms of Use | Hugging Face |
| Sellid/gemma-2-2B-it-thinking-function_calling-V0 | ~2.6B | 8192 (heredado) | Thinking + function calling | No especificada | Hugging Face |
| AaronShih/gemma-2-2B-it-thinking-function_calling-V0 | ~2.6B | 8192 (heredado) | Thinking + function calling | No especificada | Hugging Face |

Los tres fine-tunes con el mismo nombre persiguen el mismo objetivo: añadir razonamiento explícito antes de las llamadas a funciones sobre la base Gemma 2 2B. No se dispone de datos comparativos de rendimiento entre ellos ni frente al modelo base.

## Limitaciones y advertencias

- Sin datos de evaluación: no hay benchmarks publicados, por lo que el rendimiento real del modelo es desconocido. No se recomienda su uso en producción sin una evaluación previa.
- Licencia ambigua: la model card indica "license" sin especificar los términos. El modelo base usa Gemma Terms of Use, que imponen restricciones de uso comercial; se debe verificar la licencia aplicable antes de cualquier despliegue.
- Cero adopción: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad.
- Riesgo de alucinación: como todo modelo de 2B, presenta riesgo de generar información falsa o argumentos inventados en las llamadas a funciones.
- Sesgos no documentados: no se ha publicado información sobre sesgos del dataset de fine-tuning; los sesgos del modelo base se mantienen.
- Limitaciones de contexto: la ventana de 8192 tokens puede ser insuficiente para agentes que necesiten mantener historiales largos de conversación o documentos extensos.
- Soporte multilingüe limitado: el modelo base tiene mejor rendimiento en inglés; no se ha verificado el comportamiento en español u otros idiomas.
- Dependencia de la capa de thinking: si el formato de prompt para el thinking no se respeta exactamente, el modelo podría comportarse de forma impredecible o no invocar funciones correctamente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/M-hilani/gemma-2-2B-it-thinking-function_calling-V0
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Variante similar de AaronShih: https://huggingface.co/AaronShih/gemma-2-2B-it-thinking-function_calling-V0
- Variante similar de Sellid: https://huggingface.co/Sellid/gemma-2-2B-it-thinking-function_calling-V0
- Documentación de Google sobre thinking mode en Gemma: https://ai.google.dev/gemma/docs/capabilities/thinking
- Página de Gemma en Google DeepMind: https://deepmind.google/models/gemma/
- Framework TRL: https://github.com/huggingface/trl
