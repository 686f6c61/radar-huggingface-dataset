# heni86/Qwen3.8-27B_exl3-8bpwh8

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso de 27 000 millones de parámetros desarrollado por Alibaba (equipo Qwen), publicado dentro de la serie Qwen3.8 en agosto de 2026. Se trata de un modelo nativo de visión-lenguaje que acepta imágenes y vídeo como entrada, con una arquitectura híbrida que combina capas de atención lineal (Gated DeltaNet) con capas de atención clásica con RoPE. La versión alojada en este repositorio (`heni86/Qwen3.8-27B_exl3-8bpwh8`) es una cuantización de 8 bits en formato exl3, subida por un usuario de la comunidad, no por el equipo original.

El modelo destaca por su ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, y por incorporar un modo de pensamiento configurable (`reasoning_effort`, `preserve_thinking`) que permite ajustar la profundidad del razonamiento. Según los benchmarks publicados por el autor, rinde a nivel de modelos mucho más grandes en tareas de codificación agéntica y razonamiento complejo, lo que lo convierte en una opción atractiva para despliegues locales con requisitos de hardware moderados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM con vision encoder; híbrida: 16 bloques de (3 × Gated DeltaNet → FFN) + (1 × Gated Attention → FFN) |
| Parametros totales | 27B (declarado por el autor); el archivo safetensors reporta 14 670 918 896 (~14,67B), posible discrepancia por pesos compartidos o formato |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | exl3 8-bit (esta versión); también disponible FP8 según fuentes externas |
| Idiomas soportados | No disponible (presumiblemente multilingüe, como otros modelos Qwen, pero no se especifica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-27B utiliza una arquitectura de transformer causal con un codificador de visión integrado. El bloque principal se organiza en 64 capas con un patrón repetido de 16 unidades, cada una compuesta por tres sub-bloques de Gated DeltaNet seguidos de una FFN, y un sub-bloque de Gated Attention con FFN. La Gated DeltaNet es una capa de atención lineal con 48 cabezas para V y 16 para QK (dimensión de cabeza 128), mientras que la Gated Attention emplea 24 cabezas para Q y 4 para KV (dimensión 256) con RoPE de 64 dimensiones. La FFN tiene una dimensión intermedia de 17 408. El modelo fue entrenado con predicción multi-token (MTP) en varias etapas, e incluye pre-entrenamiento y post-entrenamiento con ajuste por refuerzo y datos de preferencias.

El modo de pensamiento está activado por defecto y puede desactivarse por petición; además, se puede ajustar el esfuerzo de razonamiento (`reasoning_effort`) y conservar el contexto de razonamiento histórico (`preserve_thinking`). El modelo soporta entrada de imágenes y vídeo de hasta una hora de duración, con comprensión de diagramas STEM, documentos y escenas complejas.

## Capacidades

- Generación de texto y razonamiento multi-paso con control de profundidad de pensamiento.
- Comprensión de imágenes y vídeo (visión nativa): diagramas, documentos, capturas, vídeo de larga duración.
- Codificación agéntica: planificación autónoma y manejo de feedback del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling y function calling (integrado en el entrenamiento).
- Capacidades de agente: ejecución de tareas de largo horizonte con múltiples pasos.
- Multilingüismo: no confirmado oficialmente, pero la familia Qwen suele cubrir decenas de idiomas.
- Modo de pensamiento flexible: activable/desactivable por petición, con parámetros `reasoning_effort` y `preserve_thinking`.
- Compatibilidad con múltiples motores de inferencia: transformers, vLLM, SGLang, TokenSpeed.

## Casos de uso

- Asistente de codificación en terminal: gracias a su rendimiento en Terminal Bench 2.1, puede ejecutar comandos, interpretar errores y corregir código de forma autónoma en entornos de línea de comandos.
- Agente de automatización de tareas de oficina: con soporte de tool calling y visión, puede procesar documentos, hojas de cálculo y correos, ejecutando acciones en aplicaciones mediante APIs.
- Análisis de vídeo de vigilancia o contenido multimedia: su capacidad de entender vídeo de hasta una hora permite resumir, buscar eventos o extraer información de grabaciones.
- Generación de código en producción: integrable en pipelines de CI/CD para revisión de pull requests, generación de tests y refactorización, gracias a su contexto largo y precisión en coding.
- RAG con contexto muy largo: los 262K tokens nativos permiten indexar manuales técnicos, bases de conocimiento o libros completos sin truncamiento.
- Asistente de investigación científica: lectura de papers con figuras y tablas (visión), razonamiento matemático y generación de resúmenes con citas.
- Chat conversacional con memoria extendida: puede mantener conversaciones de larga duración sin perder el hilo, útil para atención al cliente o tutoría.

## Benchmarks y rendimiento

Los datos de benchmarks publicados en la model card son parciales (la tabla se corta en la información disponible). Según fuentes externas (blogs de análisis), el modelo obtiene:

| Benchmark | Resultado |
|---|---|
| DeepSWE (resolución de issues de software) | 42,2 |
| Terminal Bench 2.1 (Terminus) | 73,0 |
| OSWorld (tareas de sistema operativo) | 84,3 |

La tabla original de la model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores completos no están disponibles en la información proporcionada. Se recomienda consultar la model card original para obtener la tabla completa.

## Requisitos de hardware

- El repositorio pesa 29,4 GB (cuantización exl3 8-bit), por lo que se necesita al menos 32 GB de VRAM para cargar el modelo completo en GPU.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB) con offloading a CPU, o A100/H100 (40/80 GB) para inferencia sin offloading.
- En GPUs de 24 GB es posible ejecutar con cuantización de 4 bits o con offloading de capas a RAM.
- Soporte Day 0 en AMD Ryzen AI Max y Radeon (según blog de AMD), ejecutable con LM Studio.
- Motores de inferencia compatibles: vLLM, SGLang, TokenSpeed, transformers, llama.cpp (si se convierte a GGUF).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

La tabla de benchmarks de la model card incluye comparaciones con Qwen3.6-27B (misma familia y tamaño), Qwen3.7-Plus (modelo propietario), Muse Glimmer-30B (modelo de otra compañía) y Opus4.6 Max (modelo propietario de Anthropic). No se dispone de los valores numéricos completos. Como referencia cualitativa, el autor afirma que Qwen3.8-27B supera a Qwen3.6-27B en todas las categorías evaluadas y se acerca a Opus4.6 Max en tareas de codificación.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B | 27B | 262K | Apache-2.0 | Abierto |
| Qwen3.6-27B | 27B | 262K (presumible) | Apache-2.0 | Abierto |
| Qwen3.7-Plus | No disponible | No disponible | Propietaria | API |
| Muse Glimmer-30B | 30B | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones específicos de este modelo; como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- El modo de pensamiento activado por defecto aumenta la latencia y el consumo de tokens; hay que desactivarlo explícitamente para casos de uso de baja latencia.
- La discrepancia entre los 27B declarados y los ~14,67B reportados en safetensors sugiere que el repositorio puede contener pesos compartidos o una versión parcial; verificar la integridad antes de usar en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo puede tener restricciones adicionales si se redistribuye; consultar los términos de Qwen.
- El soporte de vídeo de larga duración requiere memoria adicional y puede degradar el rendimiento en hardware limitado.
- Los idiomas soportados no están documentados; para aplicaciones multilingües críticas, se recomienda validar con datos propios.

## Enlaces

- Repositorio HuggingFace (esta versión cuantizada): https://huggingface.co/heni86/Qwen3.8-27B_exl3-8bpwh8
- Repositorio oficial de Qwen3.8 en GitHub: https://github.com/QwenLM/Qwen3.8
- Blog de AMD sobre soporte Day 0: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Análisis en explainx.ai: https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Guía completa en lovableapp.org: https://lovableapp.org/blog/qwen3-8-27b
- Información de la serie Qwen3.8 en OpenLM.ai: https://openlm.ai/qwen3.8/
