# PocketWeights/PocketWeights-Qwen2.5-14B-Coder-Creative

## Resumen

PocketWeights-Qwen2.5-14B-Coder-Creative es un modelo de lenguaje de 14,7 mil millones de parámetros creado mediante fusión de pesos (weight merge) por el proyecto PocketWeights. El objetivo es resolver el dilema entre especialización en código y libertad de uso: los modelos de código suelen rechazar tareas de ciberseguridad o narrativa técnica, mientras que los modelos "abliterados" (sin censura) pierden precisión sintáctica. Para ello se combina la lógica de programación de Qwen2.5-Coder-14B-Instruct con la base sin restricciones de Qwen2.5-14B-Instruct-1M-abliterated, utilizando el algoritmo DARE-TIES con una densidad de 0,65 y un peso de 0,45 para el componente coder.

La arquitectura es un transformer decoder-only de la familia Qwen2.5, con 14.770.033.664 parámetros en formato bfloat16. El contexto máximo no está documentado explícitamente en el modelo fusionado, aunque el modelo base abliterated indica una ventana extendida de 1M de tokens. El modelo se distribuye bajo licencia Apache-2.0 y está orientado a desarrolladores e investigadores que necesitan un asistente de código sin fricciones de moderación para entornos locales o de pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 14.770.033.664 (14,7B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base abliterated indica 1M tokens, pero no se confirma en el merge) |
| Tipos de cuantizacion | No publicados (la model card menciona Q8_0 y Q4_K_M como estimaciones, pero no hay archivos GGUF en el repositorio) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión de pesos mediante la herramienta MergeKit, usando el método DARE-TIES. Se parte de un modelo base abliterado (qq591503/Qwen2.5-14B-Instruct-1M-abliterated) al que se inyectan los pesos de Qwen2.5-Coder-14B-Instruct con una densidad de 0,65 y un peso de 0,45. No se realizó ningún entrenamiento adicional: la fusión conserva la arquitectura original de Qwen2.5, un transformer denso con atención causal y normalización RMSNorm. La abliteración del modelo base elimina los circuitos de rechazo de contenido, lo que permite respuestas sin restricciones en tareas de seguridad y narrativa.

El modelo base Qwen2.5-Coder-14B-Instruct fue preentrenado con hasta 18 billones de tokens e incluye soporte para generación de código en múltiples lenguajes. El modelo abliterado, por su parte, proviene de Qwen2.5-14B-Instruct con contexto extendido a 1M de tokens. La fusión busca conservar la precisión sintáctica del coder y la libertad del abliterado, aunque no se han publicado métricas que verifiquen el equilibrio logrado.

## Capacidades

- Generación de código en Python, C++, Rust y shell scripting, con razonamiento lógico y sintaxis precisa heredada del modelo coder.
- Comportamiento sin rechazos (refusal-free) para tareas de ciberseguridad, red-teaming, scripting técnico y narrativa con contenido sensible.
- Conversación multi-turno mediante el chat template de Qwen2.5, con soporte para instrucciones de sistema personalizadas.
- No se especifica soporte explícito para tool calling o function calling en la documentación del modelo, aunque el modelo base Qwen2.5-Coder-Instruct lo implementa; no se confirma su preservación en la fusión.
- Capacidades multilingües no documentadas; probablemente heredadas del modelo base Qwen2.5, pero sin confirmación.

## Casos de uso

- Generación de scripts de automatización: el modelo puede escribir scripts de shell o Python para administración de sistemas, tareas de DevOps o procesamiento de datos, aprovechando su precisión sintáctica y su capacidad de seguir instrucciones complejas.
- Pruebas de penetración en entornos controlados: gracias a su naturaleza sin restricciones, permite generar payloads, analizar tráfico de red o redactar exploits para laboratorios de seguridad, como el ejemplo de scapy incluido en la documentación.
- Red-teaming de modelos de IA: se puede usar para generar prompts adversarios o escenarios de ataque que evalúen la robustez de otros sistemas, sin las limitaciones de censura de los modelos convencionales.
- Prototipado rápido de herramientas de línea de comandos: el modelo puede producir código funcional para utilidades de análisis, parsers o scripts de monitorización, acelerando el desarrollo inicial.
- Asistente de programación sin restricciones en entornos de desarrollo local: ideal para equipos que necesitan respuestas directas sobre código vulnerable, debugging avanzado o técnicas de bajo nivel sin filtros de seguridad.
- Narrativa técnica creativa: puede redactar documentación técnica, manuales o incluso ficción con elementos técnicos detallados, sin las restricciones habituales de contenido.
- Educación en ciberseguridad: permite generar ejemplos realistas de código malicioso o técnicas de ataque para fines didácticos, siempre que se utilice en laboratorios aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K u otras métricas para este modelo fusionado. Se recomienda realizar evaluaciones propias antes de usarlo en producción.

## Requisitos de hardware

- BF16 (formato original): aproximadamente 30 GB de VRAM, requiriendo una RTX 3090/4090 con 24 GB más offload de CPU, o dos GPUs de 16 GB.
- Cuantización Q8_0 (estimada, no publicada): alrededor de 16 GB de VRAM, compatible con RTX 4080 de 16 GB o Apple Silicon con 24 GB de memoria unificada.
- Cuantización Q4_K_M (estimada, no publicada): alrededor de 9 GB de VRAM, ejecutable en RTX 3060 de 12 GB, RTX 4070 de 12 GB o Apple Silicon de 16 GB.
- No se incluyen archivos GGUF en el repositorio; si se desea cuantizar, habrá que generarlos con herramientas como llama.cpp o AutoGPTQ.
- Opciones de despliegue: transformers con `device_map="auto"` y vLLM para inferencia de alto rendimiento, como se muestra en el quickstart. También es compatible con TGI si se configura el endpoint.
- La latencia y el throughput dependen del hardware y la cuantización; no se proporcionan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Caracteristicas |
|---|---|---|---|---|
| PocketWeights-Qwen2.5-14B-Coder-Creative | 14,7B | No disponible (base abliterated 1M) | Apache-2.0 | Fusion coder + abliterado, sin censura |
| Qwen2.5-Coder-14B-Instruct | 14,7B | 32K | Apache-2.0 | Especializado en codigo, con moderacion |
| Qwen2.5-14B-Instruct-1M-abliterated | 14,7B | 1M | Apache-2.0 | Sin censura, contexto largo, menos precision en codigo |

La comparación muestra que este modelo ocupa un punto intermedio: conserva el contexto extendido del abliterado y la capacidad de código del coder, aunque no hay métricas que demuestren que mantiene el rendimiento original. Para casos de uso que requieran garantías de calidad, los modelos base son más fiables.

## Limitaciones y advertencias

- No hay evaluación independiente de benchmarks: el rendimiento real es desconocido y puede degradarse respecto a los modelos base debido al proceso de fusión.
- La abliteración elimina los mecanismos de rechazo, lo que implica que el modelo puede generar contenido dañino, ilegal o éticamente cuestionable. Es responsabilidad del usuario utilizarlo solo en entornos legales y controlados.
- El contexto de 1M tokens del modelo base abliterado no está confirmado en el modelo fusionado; puede verse reducido por la fusión o requerir configuraciones específicas.
- No se documentan los idiomas soportados ni la calidad del multilingüismo tras la fusión.
- No hay archivos de cuantización oficiales; las estimaciones de VRAM de la model card son orientativas y requieren verificación.
- La licencia Apache-2.0 permite uso comercial, pero no exime de responsabilidad legal por el uso indebido del contenido generado.
- Al ser un modelo sin censura, puede producir alucinaciones más fácilmente en temas sensibles, por lo que se recomienda validar cualquier salida crítica.

## Enlaces

- HuggingFace: https://huggingface.co/PocketWeights/PocketWeights-Qwen2.5-14B-Coder-Creative
- MergeKit (herramienta de fusión): https://github.com/arcee-ai/mergekit
- Modelo base Qwen2.5-Coder-14B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct
- Modelo base abliterado: https://huggingface.co/qq591503/Qwen2.5-14B-Instruct-1M-abliterated
- Repositorio de Qwen2.5 (GitHub): https://github.com/mx4ai/qwen2.5
