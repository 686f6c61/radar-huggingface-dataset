# blackshell69/Qwen3.5-9B-distilled-coding-agentic

## Resumen

`blackshell69/Qwen3.5-9B-distilled-coding-agentic` es un adaptador LoRA (PEFT) diseñado para el modelo base `Qwen/Qwen3.5-9B`, desarrollado por el usuario blackshell69. Su objetivo es reforzar las capacidades de generación de código y de uso de herramientas agentic (function calling) mediante destilación de conocimiento a nivel de secuencia desde un modelo profesor más grande, `Qwen3.8-27B`, servido localmente con llama.cpp. El resultado es un adaptador ligero de 58 millones de parámetros que, combinado con el modelo base de 9B, permite ejecutar tareas de codificación y razonamiento con herramientas en hardware de consumo.

La relevancia de este adaptador radica en que ofrece una vía práctica para dotar a un modelo de 9B de capacidades propias de modelos mucho mayores (27B) sin necesidad de reentrenar el modelo completo. El entrenamiento con QLoRA (4-bit NF4, rank 32) y la inclusión de un archivo GGUF del adaptador permiten su uso directo con llama.cpp, lo que facilita su integración en entornos locales con GPUs de gama media. Publicado bajo licencia Apache 2.0, es una opción atractiva para desarrolladores que buscan un modelo de código abierto con capacidades agentic sin depender de APIs comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen3.5-9B (transformer denso) |
| Parametros totales | 58.195.968 (adaptador) + 9B (modelo base) |
| Parametros activos | no disponible (modelo base denso, no MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | Adaptador: GGUF F16; modelo base: no especificado (se puede cuantizar con llama.cpp) |
| Idiomas soportados | no disponible (heredados del modelo base, probablemente multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y GGUF (LoRA F16) |

## Arquitectura y entrenamiento

El adaptador se entrena mediante QLoRA sobre el modelo base `Qwen/Qwen3.5-9B`, congelado en 4-bit NF4. Se aplican LoRA de rango 32 a todas las proyecciones lineales (`q/k/v/o_proj`, `gate/up/down_proj`) con cómputo en bf16. El entrenamiento utiliza destilación de conocimiento a nivel de secuencia: el profesor `Qwen3.8-27B` genera completions completas a partir de prompts de dos datasets: `ise-uiuc/Magicoder-OSS-Instruct-75K` para codificación (descartando las soluciones de referencia) y `glaiveai/glaive-function-calling-v2` para conversaciones multi-turno con tool calls, regenerando cada turno del asistente en formato OpenAI `tools`/`tool_calls`.

El schedule de entrenamiento comprende 2 épocas con decaimiento coseno de la tasa de aprendizaje y pérdida solo sobre los tokens del profesor (completion-only loss). El resultado reportado es una pérdida final de 0.176 y una precisión media por token del 94.5%. El entrenamiento se realizó en una única RTX 5060 Ti de 16GB con TRL, PEFT y bitsandbytes, usando atención SDPA.

## Capacidades

- Generación de código: el adaptador mejora la capacidad del modelo base para escribir código a partir de instrucciones en lenguaje natural, gracias a la destilación desde el profesor de 27B.
- Function calling / tool calling: entrenado específicamente con conversaciones de `glaive-function-calling-v2`, soporta el formato OpenAI de `tools` y `tool_calls`, permitiendo que el modelo invoque funciones externas en flujos multi-turno.
- Razonamiento agentic: al regenerar las respuestas del asistente condicionadas al historial, el modelo aprende a encadenar llamadas a herramientas y a responder tras la ejecución de estas.
- Conversación multi-turno: el entrenamiento con datos de diálogo preserva y refuerza la capacidad de mantener contextos conversacionales.
- Compatibilidad con llama.cpp: el adaptador GGUF incluido permite su uso directo con el runtime nativo de llama.cpp, sin necesidad de fusionar pesos.
- Capacidades heredadas del modelo base: al ser un adaptador sobre Qwen3.5-9B, conserva las capacidades generales de generación de texto, razonamiento y multilingüismo del modelo original (aunque no se detallan en la documentación).

## Casos de uso

- Asistente de codificación local: un desarrollador puede integrar el modelo en un IDE o CLI (por ejemplo, con llama.cpp) para obtener sugerencias de código y completar funciones, aprovechando la mejora específica en generación de código sin depender de servicios en la nube.
- Agente de automatización de tareas: gracias al soporte de function calling, el modelo puede actuar como un agente que invoca herramientas (ejecutar comandos, leer archivos, consultar APIs) en un bucle de razonamiento multi-paso, ideal para pipelines de automatización.
- Chatbot técnico con acceso a herramientas: en un servicio de atención al cliente o soporte técnico, el modelo puede gestionar conversaciones multi-turno y, cuando sea necesario, llamar a funciones internas (consulta de bases de datos, envío de tickets) para resolver consultas.
- Generación de código en CI/CD: el adaptador puede integrarse en pipelines de integración continua para generar tests unitarios, documentación de código o incluso parches simples, gracias a su capacidad de seguir instrucciones y producir código sintácticamente válido.
- Prototipado rápido de agentes con OpenAI-compatible API: al usar el formato `tools`/`tool_calls`, el modelo puede sustituir a modelos comerciales en entornos de desarrollo que ya usan la API de OpenAI, reduciendo costes y latencia.
- Entornos con recursos limitados: al ser un adaptador ligero sobre un modelo de 9B, es adecuado para ejecutarse en portátiles con GPUs de 8-16GB, permitiendo experimentación y desarrollo offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (pérdida final 0.176, precisión media por token 94.5%), pero no hay comparaciones con otros modelos en tareas estándar como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo en el caso de uso específico antes de desplegarlo en producción.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA añade solo 58M de parámetros, por lo que el requisito principal viene del modelo base Qwen3.5-9B. En bf16, el modelo base requiere aproximadamente 18GB de VRAM; con cuantización 4-bit (por ejemplo, GGUF Q4_K_M) se reduce a unos 5-6GB.
- GPU recomendadas: el entrenamiento se realizó en una RTX 5060 Ti de 16GB, por lo que cualquier GPU con 16GB o más (RTX 4080, RTX 4090, A100, etc.) es suficiente. Con cuantización 4-bit, una RTX 3060 de 12GB o incluso una RTX 4060 de 8GB podrían ser viables.
- Compatibilidad con consumer GPU: sí, el modelo base de 9B cuantizado a 4-bit cabe en GPUs de consumo de gama media (8-12GB).
- Opciones de despliegue: llama.cpp (con el adaptador GGUF incluido), vLLM (fusionando el adaptador PEFT con el base), Ollama (si se convierte a formato compatible), y Transformers + PEFT para integración en Python.
- Latencia y throughput: no se han publicado datos específicos. En una RTX 5060 Ti, un modelo de 9B cuantizado a 4-bit suele generar entre 20-40 tokens por segundo, dependiendo de la longitud de la secuencia y el número de herramientas activas.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| blackshell69/Qwen3.5-9B-distilled-coding-agentic | Qwen3.5-9B | 9B + 58M LoRA | no disponible | Apache 2.0 | Destilación desde Qwen3.8-27B para coding y agentic |
| empero-ai/Qwable-9B-Claude-Fable-5 | Qwen3.5-9B | 9B (full fine-tune) | no disponible | no disponible | Fine-tune completo sobre trazas de Claude Fable 5 y GPT-5.5 |
| Qwen/Qwen3.5-9B (base) | - | 9B | no disponible | Apache 2.0 | Modelo base sin fine-tune específico |

La comparativa se limita a otros fine-tunes de Qwen3.5-9B encontrados en la búsqueda web. No se dispone de datos de rendimiento comparativos entre ellos. El adaptador de blackshell69 se distingue por su método de destilación y su formato GGUF listo para llama.cpp, mientras que Qwable-9B-Claude-Fable-5 es un fine-tune completo con un enfoque distinto (traces de modelos propietarios).

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo destilado, puede heredar sesgos del profesor (Qwen3.8-27B) y del propio modelo base. No se han realizado evaluaciones de sesgo específicas.
- Riesgo de alucinación en código: aunque el entrenamiento mejora la generación de código, el modelo puede producir código sintácticamente válido pero funcionalmente incorrecto, especialmente en lógica compleja. Es necesario validar el código generado.
- Dependencia del profesor: la calidad del adaptador está limitada por la del profesor (Qwen3.8-27B). Si el profesor tiene errores sistemáticos, estos se propagan al estudiante.
- Contexto limitado: no se especifica la longitud de contexto del modelo base. Si Qwen3.5-9B tiene un contexto estándar (por ejemplo, 32K tokens), el adaptador no lo amplía. Para tareas con historiales muy largos, puede ser insuficiente.
- Idiomas: no se documentan los idiomas soportados. Aunque Qwen suele ser multilingüe, no hay garantía de que el adaptador mantenga el mismo rendimiento en todos los idiomas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base Qwen3.5-9B también es Apache 2.0, por lo que no hay impedimento legal. Sin embargo, se recomienda verificar los términos de los datasets utilizados (Magicoder-OSS-Instruct-75K y glaive-function-calling-v2) para asegurar el cumplimiento.
- Producción: al ser un adaptador entrenado con un número reducido de muestras (9.640) y solo 2 épocas, su rendimiento en dominios muy específicos puede ser inferior al de modelos más grandes o fine-tunes más extensos. Se recomienda evaluar en el caso de uso concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/blackshell69/Qwen3.5-9B-distilled-coding-agentic
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Guía de Qwen 3.5 (benchmarks y setup local): https://techie007.substack.com/p/qwen-35-the-complete-guide-benchmarks
- Guía de Qwen3.5 con Claude Code: https://codersera.com/blog/run-install-and-benchmark-qwen35-claude-code-free-local-ai-coding-agent/
- Repositorio de setup local de Qwen3.5-9B: https://github.com/maxrenke/qwen35-local-setup
