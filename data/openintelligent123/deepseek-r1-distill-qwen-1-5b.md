# Openintelligent123/DeepSeek-R1-Distill-Qwen-1.5B

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B es un modelo de lenguaje de razonamiento de 1.500 millones de parámetros, destilado por DeepSeek a partir de su modelo de razonamiento DeepSeek-R1 sobre la base Qwen2.5-1.5B. El modelo está diseñado para resolver problemas complejos de matemáticas, código y lógica mediante cadenas de pensamiento (chain-of-thought) generadas de forma explícita, siguiendo la línea de los modelos de razonamiento tipo OpenAI-o1. Esta versión concreta, publicada por el usuario Openintelligent123 en HuggingFace, es una copia del checkpoint oficial de DeepSeek, con licencia MIT y pesos en formato safetensors.

El interés de este modelo radica en su tamaño reducido, que permite ejecutarlo en hardware de consumo, manteniendo capacidades de razonamiento que superan a las de modelos base de tamaño similar. Es relevante para desarrolladores que necesitan un modelo de razonamiento ligero, desplegable en entornos con recursos limitados, y que puede servir como base para experimentación o para tareas de inferencia en tiempo real. La arquitectura es un transformer denso (no MoE), con una longitud de contexto heredada de Qwen2.5, aunque el dato exacto no se especifica en la ficha del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen2.5-1.5B) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5, presumiblemente 128k) |
| Tipos de cuantizacion | no disponible (pesos originales en safetensors; se pueden cuantizar a GGUF, AWQ, etc.) |
| Idiomas soportados | no disponible (se espera multilingue, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso con arquitectura Qwen2.5, que emplea atención por ventanas deslizantes y RoPE (rotary position embeddings). Fue entrenado mediante destilación: DeepSeek utilizó 800.000 muestras de razonamiento generadas por el modelo DeepSeek-R1 (de 671B parámetros) para ajustar el modelo base Qwen2.5-1.5B mediante fine-tuning supervisado. Este proceso de destilación transfiere los patrones de razonamiento del modelo grande al pequeño, logrando un rendimiento superior al que se obtendría entrenando directamente con RL sobre un modelo pequeño. No se aplicó RLHF ni DPO en esta versión destilada; el entrenamiento se centró en imitar las cadenas de pensamiento del modelo profesor.

El modelo genera respuestas con un formato de razonamiento explícito: primero produce una cadena de pensamiento interna (entre etiquetas `thinking`) y después la respuesta final. Esto es una característica clave de la familia DeepSeek-R1.

## Capacidades

- Razonamiento matemático: resuelve problemas aritméticos, algebraicos y de lógica con pasos intermedios.
- Generación de código: escribe y depura código en varios lenguajes, con explicaciones paso a paso.
- Razonamiento lógico y de sentido común: aborda puzzles, preguntas de opción múltiple y tareas de inferencia.
- Generación de texto general: puede mantener conversaciones, resumir y responder preguntas factuales, aunque su especialidad es el razonamiento.
- No soporta tool calling ni function calling de forma nativa (no se menciona en la documentación).
- No tiene capacidades multimodales (solo texto).
- Multilingüe limitado: al estar basado en Qwen2.5, soporta varios idiomas, pero no se especifica la lista exacta.

## Casos de uso

- Asistente de razonamiento en dispositivos edge: al ser un modelo de 1,5B, puede ejecutarse en Raspberry Pi o en móviles con cuantización, proporcionando respuestas razonadas sin conexión.
- Tutor de matemáticas y ciencias: el modelo puede explicar paso a paso la resolución de problemas, útil en aplicaciones educativas o chatbots de ayuda al estudio.
- Generación de código en entornos con recursos limitados: integrable en IDEs ligeros o herramientas de autocompletado que requieran razonamiento sobre el contexto del código.
- Automatización de tareas de análisis de datos: puede interpretar tablas, calcular métricas y generar informes sencillos a partir de datos estructurados.
- Prototipado rápido de agentes conversacionales: su tamaño permite iterar rápidamente en el desarrollo de chatbots con capacidades de razonamiento, antes de escalar a modelos mayores.
- Investigación académica: útil para estudiar técnicas de destilación, comparar rendimiento de modelos pequeños y analizar el comportamiento de cadenas de pensamiento en modelos compactos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el modelo DeepSeek-R1-Distill-Qwen-1.5B en la información disponible. El artículo de DeepSeek reporta que la versión de 32B supera a OpenAI-o1-mini en varios benchmarks, pero no se proporcionan cifras para el modelo de 1,5B. Se recomienda consultar el paper original para datos de la familia completa, aunque no se incluyen aquí por falta de datos concretos.

## Requisitos de hardware

- VRAM estimada: en FP16, el modelo ocupa aproximadamente 3,5 GB (1,78B parámetros × 2 bytes). Con cuantización a 8 bits, ~1,8 GB; a 4 bits, ~0,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, GTX 1650, RTX 3050, RTX 4090, A10, etc.). En cuantización 4 bits, puede ejecutarse en GPUs con 2 GB o incluso en CPU con suficiente RAM.
- Compatible con consumer GPU: sí, es uno de los modelos de razonamiento más pequeños disponibles.
- Opciones de despliegue: compatible con transformers, vLLM, llama.cpp (mediante conversión a GGUF), Ollama, TGI y otros frameworks que soporten modelos Qwen2.5.
- Latencia y throughput: en una GPU moderna (RTX 4090), la generación de una respuesta con razonamiento (típicamente 500-1000 tokens) puede completarse en 1-3 segundos. En CPU, la latencia es mayor, del orden de 10-30 segundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | no disponible | MIT | Razonamiento destilado |
| DeepSeek-R1-Distill-Qwen-7B | 7,6B | 128k (según arquitectura) | MIT | Razonamiento destilado |
| Qwen2.5-1.5B-Instruct | 1,78B | 128k | Apache 2.0 | Instrucción general, sin razonamiento explícito |
| Llama-3.2-1B-Instruct | 1,23B | 128k | Llama 3.2 | Instrucción general, sin razonamiento explícito |

El modelo destilado de 1,5B ofrece capacidades de razonamiento superiores a las de un modelo base de instrucción del mismo tamaño, pero inferior a las versiones más grandes de la misma familia. Su licencia MIT permite uso comercial y modificaciones sin restricciones.

## Limitaciones y advertencias

- Al ser un modelo pequeño, puede presentar alucinaciones en tareas factuales o de conocimiento general, especialmente fuera de su dominio de razonamiento.
- La generación de cadenas de pensamiento largas puede aumentar la latencia y el consumo de tokens, lo que encarece la inferencia en APIs.
- No se especifican los idiomas soportados; aunque Qwen2.5 es multilingüe, el rendimiento en idiomas distintos del inglés puede ser inferior.
- El modelo no tiene soporte nativo para tool calling ni funciones de agente, por lo que no es adecuado para pipelines que requieran interacción con APIs externas.
- La licencia MIT permite uso comercial, pero se recomienda revisar los términos de la licencia de los modelos base (Qwen2.5 es Apache 2.0, compatible).
- No se han publicado evaluaciones de sesgos o seguridad específicas para esta versión; se recomienda auditar el modelo antes de usarlo en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Openintelligent123/DeepSeek-R1-Distill-Qwen-1.5B
- Modelo oficial de DeepSeek (1.5B): https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Colección DeepSeek-R1 en HuggingFace: https://huggingface.co/collections/deepseek-ai/deepseek-r1
- Repositorio GitHub de DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- Paper de DeepSeek-R1 (arXiv:2501.12948): https://arxiv.org/abs/2501.12948
- Guía comparativa de los seis modelos destilados: https://deepseekai.guide/models/deepseek-r1-distill/
