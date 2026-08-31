# ApolloRaines/Qwen2.5-Coder-14B-Instruct-Jbliterated

## Resumen

El modelo `ApolloRaines/Qwen2.5-Coder-14B-Instruct-Jbliterated` es una variante del modelo de código `Qwen/Qwen2.5-Coder-14B-Instruct` de Alibaba, sometida a un proceso de "jbliteration" (una forma avanzada de abliteración) que elimina quirúrgicamente los comportamientos de rechazo a nivel de pesos. Desarrollado por ApolloRaines, este modelo está pensado para desarrolladores e investigadores que necesitan un asistente de código sin las restricciones de seguridad del modelo original, manteniendo intactas las capacidades de razonamiento, matemáticas y generación de código.

La arquitectura es un transformer decoder-only de la familia Qwen2, con 14.770 millones de parámetros y una ventana de contexto de 128.000 tokens heredada del modelo base. El proceso de jbliteration aplica 5 direcciones de eliminación por capa en las 48 capas del modelo, con restricciones de espacio nulo y preservación de norma para no degradar el rendimiento en tareas técnicas. El resultado es un modelo "uncensored" que responde sin evasivas ni advertencias, aunque con los riesgos éticos y legales que ello conlleva.

La relevancia actual radica en la creciente demanda de modelos de código sin censura para investigación en alineación, pruebas de robustez y desarrollo de agentes autónomos. Sin embargo, su uso en producción debe evaluarse cuidadosamente por las implicaciones de seguridad y cumplimiento normativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 14.770.033.664 (14,7 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base) |
| Tipos de cuantizacion | No disponible (el repositorio incluye pesos en safetensors y GGUF, pero no se especifican los tipos de cuantizacion) |
| Idiomas soportados | Ingles (segun la ficha del autor; el modelo base soporta mas idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen2.5-Coder-14B-Instruct`, un transformer decoder-only con 48 capas, atención multi-cabeza y normalización RMSNorm, entrenado por Alibaba con un corpus extenso de código y texto técnico. La variante jbliterated no se entrena desde cero; en su lugar, se aplica una intervención post-entrenamiento sobre los pesos del modelo base. El proceso, descrito en la model card, elimina 5 direcciones de rechazo por capa en todas las 48 capas, utilizando restricciones de espacio nulo para preservar las capacidades de matemáticas, código y razonamiento, y con preservación de norma para mantener la estabilidad numérica.

No se dispone de información detallada sobre el dataset de entrenamiento original ni sobre el proceso de fine-tuning del modelo base. La técnica de jbliteration es una evolución de la abliteración estándar, que elimina no solo la respuesta superficial de rechazo sino también los comportamientos indirectos como la reinterpretación de prompts, la inyección de descargos o la omisión estratégica de información.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, incluyendo Python, Java, C++, JavaScript y otros, con soporte para completado, generacion y explicacion de codigo.
- Razonamiento logico y matematico avanzado, heredado del modelo base, con capacidad para resolver problemas complejos de programacion competitiva.
- Soporte de tool calling y function calling, lo que permite integrar el modelo en pipelines de agentes que invocan APIs o ejecutan acciones externas.
- Capacidad de seguir instrucciones multi-turno en conversaciones largas, gracias a la ventana de contexto de 128K tokens.
- Generacion de contenido sin rechazo: el modelo responde a preguntas que el modelo base rechazaria, incluyendo temas sensibles, aunque con los riesgos asociados.
- No incluye capacidades de vision ni audio; es exclusivamente texto.

## Casos de uso

- Asistente de programacion en entornos de desarrollo integrado (IDE): el modelo puede completar codigo, sugerir refactorizaciones y explicar fragmentos complejos, aprovechando su contexto largo para mantener el estado del proyecto.
- Generacion de codigo en pipelines de CI/CD: gracias al soporte de tool calling, puede integrarse en flujos automatizados para generar tests, documentacion o parches, reduciendo la intervencion manual.
- Investigacion en alineacion y seguridad de IA: el modelo sirve como banco de pruebas para estudiar como se comporta un sistema sin mecanismos de rechazo, permitiendo analizar sesgos, robustez y estrategias de mitigacion.
- Red teaming y pruebas de adversario: los equipos de seguridad pueden usar el modelo para identificar vulnerabilidades en sistemas de moderacion o para generar contenido que evite filtros, mejorando asi los sistemas defensivos.
- Desarrollo de agentes autonomos de codigo: con su capacidad de razonamiento multi-paso y tool calling, puede actuar como agente que planifica, ejecuta y verifica tareas de programacion de forma autonoma.
- Educacion en programacion sin restricciones: en entornos controlados, puede utilizarse para ensenar conceptos avanzados o para explorar temas que los modelos comerciales evitan, aunque con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para esta variante jbliterated. El modelo base `Qwen2.5-Coder-14B-Instruct` reporta resultados en HumanEval, MBPP y otros benchmarks de codigo, pero no se puede asumir que esta variante mantenga exactamente esos valores, ya que la intervencion sobre los pesos puede alterar el rendimiento. Se recomienda evaluar el modelo en el caso de uso especifico antes de desplegarlo.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp16, el modelo ocupa aproximadamente 29,5 GB (14,7 B x 2 bytes). Con cuantizacion GGUF Q4_K_M, el uso de VRAM se reduce a unos 8-10 GB; con Q8, alrededor de 15-16 GB.
- GPU recomendadas: para fp16 se necesitan GPUs profesionales como A100 (40/80 GB) o H100. Con cuantizacion, es viable en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB). Para Q4, incluso una RTX 3060 (12 GB) podria ser suficiente.
- El modelo cabe en GPUs de consumo si se utiliza cuantizacion, pero no en precision completa.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI y Transformers de Hugging Face. El autor tambien menciona DeepswapLLM, una herramienta que permite ejecutar el modelo en GPUs con poca memoria mediante streaming de capas.
- Latencia y throughput: no disponible en la informacion proporcionada; dependera del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (base) | 14,7 B | 128K | Apache 2.0 | Hugging Face | Modelo original con mecanismos de rechazo |
| Qwen2.5-Coder-14B-Instruct-Jbliterated | 14,7 B | 128K | Apache 2.0 | Hugging Face | Variante sin rechazo, misma arquitectura |
| CodeLlama-13B-Instruct | 13 B | 16K | Llama 2 license | Hugging Face | Modelo de Meta, con restricciones de uso comercial |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16K | MIT | Hugging Face | Mas ligero, pero con menor capacidad de razonamiento |

La comparativa se centra en modelos de codigo de tamano similar. El jbliterated se diferencia del base unicamente en la eliminacion de rechazo, manteniendo el mismo rendimiento teorico en tareas de codigo. CodeLlama y DeepSeek-Coder son alternativas con licencias mas restrictivas o menor capacidad.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso. Su uso debe limitarse a entornos de investigacion controlados y con supervision humana.
- La eliminacion de rechazo no garantiza la ausencia total de sesgos; el modelo puede reflejar los sesgos presentes en los datos de entrenamiento del modelo base.
- Riesgo de alucinacion en codigo: como cualquier LLM, puede generar codigo incorrecto o inseguro, especialmente en contextos largos o ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue debe asumir la responsabilidad legal y etica del contenido generado.
- No se han publicado evaluaciones de seguridad ni de rendimiento especificas para esta variante; los resultados del modelo base no son directamente extrapolables.
- El proceso de jbliteration puede degradar ligeramente el rendimiento en tareas que requieren matices de seguridad, aunque el autor afirma que se preservan las capacidades tecnicas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Qwen2.5-Coder-14B-Instruct-Jbliterated
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Modelo base Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Documentacion de Qwen2.5-Coder (referencia): https://dev.co/ai/llms/qwen2-5-coder-14b-instruct
