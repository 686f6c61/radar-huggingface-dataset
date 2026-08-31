# NostraEmpire/mirror-qwen2.5-coder-7b-instruct

## Resumen

Este repositorio es un espejo (mirror) del modelo Qwen2.5-Coder-7B-Instruct, desarrollado originalmente por Alibaba Cloud (equipo Qwen). NostraEmpire lo aloja en Hugging Face sin modificaciones sobre los pesos ni la configuración, por lo que las capacidades y el comportamiento son idénticos a los del modelo original. Se trata de un modelo de lenguaje causal especializado en tareas de código, entrenado sobre una base de Qwen2.5 y ajustado mediante instrucciones (chat).

El modelo resuelve problemas de generación, razonamiento y corrección de código, así como tareas generales de conversación y matemáticas. Su relevancia actual radica en ofrecer un equilibrio entre tamaño (7,61 mil millones de parámetros) y rendimiento, superando en razonamiento de código a modelos más grandes como CodeStral-22B o DeepSeek-Coder-33B-Instruct, según el informe técnico oficial. Soporta una ventana de contexto de hasta 131 072 tokens mediante la técnica YaRN, y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

La arquitectura es un transformer causal con RoPE, SwiGLU, RMSNorm y atención con bias en QKV, utilizando atención multi-consulta agrupada (GQA). El modelo tiene 28 capas y 28 cabezas de atención para consultas y 4 para claves/valores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y Attention QKV bias |
| Parametros totales | 7 615 616 512 (7,61B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 131 072 tokens (configuración por defecto: 32 768; requiere YaRN para longitudes superiores) |
| Tipos de cuantizacion | No disponible en este mirror (solo safetensors; el modelo original ofrece GGUF) |
| Idiomas soportados | Inglés (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal estándar con mejoras introducidas en la serie Qwen2.5: incorpora codificación posicional rotatoria (RoPE), activación SwiGLU, normalización RMSNorm y atención con bias en las proyecciones Q, K y V. Para eficiencia en memoria, usa atención multi-consulta agrupada (GQA) con 28 cabezas de consulta y 4 de clave/valor. La configuración de contexto por defecto es de 32 768 tokens, pero mediante la técnica YaRN (Yet another RoPE extensioN) se puede ampliar hasta 131 072 tokens, tal y como se documenta en el artículo arXiv:2309.00071.

El entrenamiento combina una fase de pre-entrenamiento y otra de post-entrenamiento (ajuste por instrucciones). Según el informe técnico de Qwen2.5-Coder (arXiv:2409.12186), el modelo se pre-entrenó sobre un corpus de más de 5,5 billones de tokens que incluye código fuente, datos de anclaje texto-código y datos sintéticos. No se especifica en la información disponible si se utilizaron técnicas de RLHF o DPO, aunque el ajuste por instrucciones sugiere un proceso de alineación supervisado. El modelo base es Qwen/Qwen2.5-Coder-7B, y esta versión instruct está optimizada para seguir instrucciones y mantener un formato conversacional.

## Capacidades

- Generación de código en múltiples lenguajes de programación, incluyendo autocompletado, generación de funciones y scripts completos.
- Razonamiento sobre código: explicación de fragmentos, detección de errores lógicos y sugerencias de corrección.
- Corrección de código (code fixing) a partir de descripciones del problema o de código defectuoso.
- Soporte de conversación multi-turno con plantilla de chat (system, user, assistant).
- Capacidades generales de razonamiento matemático y competencias lingüísticas heredadas de Qwen2.5.
- Extensión de contexto hasta 128K tokens mediante YaRN, útil para analizar repositorios completos o documentación extensa.
- No se documenta en la información proporcionada un soporte explícito de tool calling ni function calling, aunque el modelo original de Qwen2.5-Coder sí lo incluye en versiones posteriores; para este mirror no hay confirmación.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code o JetBrains para autocompletar código, explicar fragmentos o sugerir refactorizaciones, aprovechando su ventana de contexto de 32K tokens (o 128K con YaRN) para analizar archivos completos.
- Generación de código en pipelines de CI/CD: gracias a su capacidad de razonamiento y corrección, puede utilizarse para generar pruebas unitarias, scripts de despliegue o documentación técnica a partir de especificaciones.
- Chatbot técnico de soporte: al estar ajustado por instrucciones, puede mantener conversaciones multi-turno sobre dudas de programación, APIs o arquitectura de software, con un tono profesional y respuestas concisas.
- Análisis y revisión de código: el modelo puede recibir un diff o un archivo fuente y señalar posibles bugs, vulnerabilidades o mejoras de estilo, lo que facilita la revisión entre pares.
- Educación en programación: sirve como tutor virtual que explica conceptos, genera ejemplos y evalúa soluciones propuestas por estudiantes, ayudando a comprender algoritmos y estructuras de datos.
- Generación de documentación a partir de código: puede convertir comentarios o firmas de funciones en documentación legible, o resumir un repositorio completo en un README estructurado.
- Prototipado rápido: en fases iniciales de desarrollo, el modelo puede generar esqueletos de aplicaciones, endpoints de API o consultas SQL a partir de descripciones en lenguaje natural, acelerando la iteración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este mirror concreto. Sin embargo, el informe técnico de Qwen2.5-Coder (arXiv:2409.12186) indica que el modelo Qwen2.5-Coder-7B-Instruct supera a CodeStral-22B y DeepSeek-Coder-33B-Instruct en tareas de razonamiento de código, a pesar de su menor tamaño. No se proporcionan cifras numéricas específicas en los materiales consultados, por lo que se recomienda consultar el blog oficial de Qwen para métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión FP16: aproximadamente 15-16 GB (el tamaño del repositorio es de 15,2 GB en safetensors).
- Con cuantización a 8 bits, la VRAM requerida ronda los 8 GB; con 4 bits, unos 4-5 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM para FP16 (por ejemplo, RTX 4090, A100 40GB, L4). Para cuantización, una RTX 3060 de 12 GB o superior es suficiente.
- Sí cabe en GPUs de consumo: una RTX 3080/3090 o RTX 4070/4080 puede ejecutar el modelo con cuantización sin problemas.
- Opciones de despliegue compatibles: vLLM (recomendado por el equipo Qwen para producción), llama.cpp, Ollama, Hugging Face TGI y transformers estándar.
- Latencia y throughput: no disponible en la información proporcionada. Se puede estimar que en una A100, la generación de tokens alcanza decenas de tokens por segundo, pero depende de la implementación y el batch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento en código |
|---|---|---|---|---|---|
| Qwen2.5-Coder-7B-Instruct (este mirror) | 7,61B | 131K (YaRN) | Apache 2.0 | safetensors | Supera a CodeStral-22B y DS-Coder-33B en razonamiento (según informe técnico) |
| CodeStral-22B (Mistral) | 22B | 32K (extensible a 128K) | Apache 2.0 | safetensors, GGUF | Buen rendimiento, pero inferior al de Qwen2.5-Coder-7B en razonamiento |
| DeepSeek-Coder-33B-Instruct | 33B | 16K (extensible a 128K) | DeepSeek License (uso comercial permitido) | safetensors | Comparativamente inferior en razonamiento según el informe de Qwen |
| CodeLlama-7B-Instruct | 7B | 16K | Llama 2 Licencia (uso comercial con restricciones) | safetensors, GGUF | Rendimiento inferior en tareas de código frente a Qwen2.5-Coder-7B |

Nota: la comparativa se basa en información pública del informe técnico y de las fichas de los modelos. No se disponen de benchmarks numéricos estandarizados en los materiales consultados.

## Limitaciones y advertencias

- El modelo está entrenado principalmente en inglés; su rendimiento en otros idiomas, incluido el español, puede ser inferior y no está garantizado.
- Riesgo de alucinación en código: puede generar código sintácticamente válido pero semánticamente incorrecto, especialmente en contextos poco comunes o con especificaciones ambiguas.
- La extensión de contexto a 128K tokens mediante YaRN puede degradar el rendimiento en secuencias cortas si se activa la configuración de escalado, tal y como advierte el equipo Qwen en su documentación.
- Este mirror no incluye versiones cuantizadas (GGUF, GPTQ, AWQ); si se necesita desplegar en entornos con poca VRAM, habrá que cuantizar manualmente o recurrir al repositorio original de Qwen.
- Al ser un espejo, no hay garantía de mantenimiento por parte del autor original; las actualizaciones del modelo original podrían no reflejarse aquí.
- La licencia Apache 2.0 permite uso comercial y modificación, pero se debe conservar la atribución al equipo Qwen y a Alibaba Cloud según los términos de la licencia.
- No se ha verificado el comportamiento del modelo en tareas de tool calling o agentes en este mirror específico; se recomienda probar antes de integrarlo en sistemas productivos.

## Enlaces

- Repositorio del mirror: https://huggingface.co/NostraEmpire/mirror-qwen2.5-coder-7b-instruct
- Modelo original Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Versión GGUF del modelo original: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct-GGUF
- Informe técnico Qwen2.5-Coder (arXiv): https://arxiv.org/abs/2409.12186
- Blog oficial de Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Repositorio GitHub de Qwen2.5-Coder: https://github.com/QwenLM/Qwen2.5-Coder
- Documentación de Qwen (vLLM y despliegue): https://qwen.readthedocs.io/en/latest/
