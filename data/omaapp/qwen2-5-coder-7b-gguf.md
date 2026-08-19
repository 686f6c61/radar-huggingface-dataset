# OMAAPP/qwen2.5-coder-7b-gguf

## Resumen

Este repositorio aloja un espejo (mirror) del archivo GGUF cuantizado del modelo Qwen2.5-Coder-7B-Instruct, publicado por el usuario OMAAPP. El modelo original, desarrollado por Alibaba Cloud (Qwen team), es un modelo de lenguaje especializado en generación y comprensión de código, con 7.615 millones de parámetros y arquitectura transformer decoder-only. Este mirror proporciona el archivo `qwen2.5-coder-7b-instruct-q4_k_m.gguf`, una cuantización de 4 bits que reduce el tamaño a aproximadamente 4,7 GB, lo que permite su ejecución en hardware de consumo.

La relevancia de este repositorio radica en ofrecer una copia alternativa del GGUF oficial, con un checksum SHA-256 verificado, lo que facilita su distribución y descarga en entornos donde el acceso al repositorio original pueda estar restringido. El modelo base Qwen2.5-Coder-7B-Instruct destaca por su rendimiento en tareas de programación, soporte de contexto largo (128K tokens) y capacidades de tool calling, siendo una opción práctica para asistentes de código, agentes autónomos y pipelines de desarrollo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (dense) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 131.072 tokens (128K) según el modelo original |
| Tipos de cuantizacion | q4_k_m (archivo único) |
| Idiomas soportados | no disponible en este repo; el modelo original soporta inglés, chino y otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único) |

## Arquitectura y entrenamiento

El modelo Qwen2.5-Coder-7B-Instruct emplea una arquitectura transformer densa, con normalización RMSNorm, atención multi-cabeza con sesgo de atención (attention bias) y activación SwiGLU. Fue preentrenado con un dataset de aproximadamente 5,5 billones de tokens, con un 68,6% de datos relacionados con código y un 31,4% de datos de texto general. Posteriormente se realizó un ajuste fino supervisado (SFT) y un refinamiento mediante optimización de preferencias directa (DPO) para alinearlo con instrucciones y preferencias humanas. El modelo soporta una ventana de contexto de 128K tokens, lo que le permite manejar archivos de código extensos y conversaciones multi-turno largas.

La cuantización q4_k_m aplicada en este archivo GGUF utiliza el esquema de cuantización de llama.cpp que combina cuantización de 4 bits para la mayoría de las capas y de 6 bits para las capas de atención, logrando un equilibrio entre tamaño y calidad de salida. Este formato es compatible con motores de inferencia como llama.cpp, Ollama, LM Studio y vLLM (con soporte para GGUF).

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, Java, C++, JavaScript, TypeScript, Go, Rust, entre otros) con alta precisión sintáctica y semántica.
- Razonamiento y resolución de problemas matemáticos y algorítmicos, útil para tareas de programación competitiva.
- Comprensión y explicación de código existente, incluyendo depuración, refactorización y documentación automática.
- Soporte de tool calling y function calling, permitiendo que el modelo interactúe con APIs y herramientas externas en flujos de agente.
- Capacidad de procesar contextos largos de hasta 128K tokens, adecuado para analizar repositorios completos o archivos de gran tamaño.
- Multilingüismo: aunque el repo no especifica idiomas, el modelo original está entrenado principalmente en inglés y chino, con capacidades razonables en otros idiomas para tareas de código.
- Modo instruct: optimizado para seguir instrucciones y mantener conversaciones coherentes, con posibilidad de activar un modo de razonamiento extendido (thinking) en versiones posteriores, aunque no está confirmado en esta cuantización.

## Casos de uso

- Asistente de programación integrado en IDE: el modelo puede completar código, sugerir correcciones y generar tests unitarios. Su contexto largo permite procesar el archivo abierto y parte del proyecto.
- Automatización de revisión de código (code review): analiza pull requests, detecta posibles errores, vulnerabilidades y sugiere mejoras, apoyándose en el contexto de todo el repositorio.
- Generación de documentación técnica: a partir de código fuente o APIs, el modelo produce comentarios, README y guías de uso, reduciendo el trabajo manual.
- Chatbot técnico de soporte: responde preguntas sobre lenguajes, frameworks y buenas prácticas, manteniendo conversaciones largas gracias a su ventana de 128K tokens.
- Agente autónomo de desarrollo: mediante tool calling, el modelo puede ejecutar comandos, consultar bases de código y modificar archivos, actuando como un agente de software.
- Educación y tutoría en programación: explica conceptos, resuelve ejercicios y proporciona retroalimentación personalizada a estudiantes, adaptándose al nivel de cada usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de evaluación y la búsqueda web no proporcionó datos numéricos específicos para esta cuantización. Para referencia, el modelo original Qwen2.5-Coder-7B-Instruct reporta resultados en HumanEval (88,4% pass@1), MBPP (82,2%) y otros benchmarks de código, pero estos valores no están verificados en este mirror y podrían variar con la cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF q4_k_m ocupa 4,7 GB, por lo que se recomienda al menos 6-8 GB de VRAM para cargar el modelo con margen para el contexto y la computación. En CPU, se necesitan alrededor de 8-10 GB de RAM.
- GPU recomendadas: tarjetas con 8 GB o más de VRAM, como NVIDIA RTX 3060/3070/4060/4070, RTX 3090/4090, o GPUs de datacenter como A10, A100 (aunque para 7B es sobredimensionado). También funciona en Apple Silicon con memoria unificada de 16 GB o más.
- Compatibilidad con GPU de consumo: sí, es uno de los puntos fuertes de la cuantización q4_k_m; puede ejecutarse en GPUs de gama media e incluso en CPU con buena velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF experimental), y cualquier motor compatible con el formato GGUF.
- Latencia y throughput estimados: en una RTX 4090, la generación típica es de 40-60 tokens/segundo; en una RTX 3060, 15-25 tokens/segundo. En CPU moderna (8 núcleos), 5-10 tokens/segundo. Estos valores son orientativos y dependen del tamaño del contexto y la configuración.

## Comparativa con modelos similares

No se dispone de datos de comparativa en la información proporcionada. No obstante, se puede contextualizar frente a otros modelos de código de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (este mirror) | 7,6B | 128K | Apache 2.0 | GGUF |
| CodeLlama-7B-Instruct | 6,7B | 16K | Llama 2 license (uso comercial permitido con condiciones) | GGUF, safetensors |
| DeepSeek-Coder-7B-Instruct | 6,9B | 16K | DeepSeek License (uso comercial permitido) | GGUF, safetensors |
| StarCoder2-7B | 7,3B | 16K | BigCode OpenRAIL-M | safetensors, GGUF |

Qwen2.5-Coder destaca por su contexto de 128K, superior a los 16K de sus competidores, y por su licencia Apache 2.0 sin restricciones de uso comercial. Sin embargo, los benchmarks específicos no están disponibles en este repositorio para comparar directamente.

## Limitaciones y advertencias

- El modelo puede alucinar APIs o funciones inexistentes, especialmente en lenguajes menos comunes o versiones recientes de bibliotecas.
- La cuantización q4_k_m introduce una degradación leve en la calidad de salida en comparación con el modelo en precisión completa, aunque suele ser aceptable para tareas de código.
- El contexto de 128K tokens consume mucha memoria; en hardware limitado, el uso de ventanas largas puede provocar desbordamiento de VRAM o una latencia elevada.
- No se garantiza la procedencia del archivo; aunque el checksum SHA-256 coincide con el original, se recomienda verificar la integridad antes de su uso en producción.
- El modelo original tiene sesgos potenciales derivados de sus datos de entrenamiento, que pueden reflejarse en respuestas sobre temas no técnicos.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero no se ofrece ninguna garantía por parte del autor del mirror.
- Para tareas de razonamiento complejo o generación de código crítico, se recomienda validar las salidas con tests automatizados y revisión humana.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/OMAAPP/qwen2.5-coder-7b-gguf
- Repositorio original de Qwen (GGUF): https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Repositorio alternativo de QuantFactory: https://huggingface.co/QuantFactory/Qwen2.5-Coder-7B-GGUF
- Página del modelo en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- GitHub del proyecto Qwen2.5-Coder: https://github.com/huggingface/Qwen2.5-Coder
- GitHub de Qwen2.5 (base): https://github.com/mx4ai/qwen2.5
