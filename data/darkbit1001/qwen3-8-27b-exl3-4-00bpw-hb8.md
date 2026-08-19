# darkbit1001/Qwen3.8-27B-exl3-4.00bpw-hb8

## Resumen

Este repositorio contiene una cuantización en formato EXL3 del modelo Qwen3.8-27B de Alibaba, publicada por el usuario darkbit1001. Qwen3.8-27B es un modelo denso multimodal de 27 mil millones de parámetros que integra un codificador de visión nativo, pensamiento configurable y una arquitectura híbrida que combina atención lineal (Gated DeltaNet) con atención completa (Gated Attention). La cuantización presentada aquí usa 4,00 bits por peso con 8 bits para la cabecera (head bits), lo que reduce el tamaño del modelo a 17,2 GB y permite su ejecución en GPUs de consumo con 24 GB de VRAM mediante ExLlamaV3.

La relevancia de esta ficha reside en que ofrece una versión lista para producción del modelo Qwen3.8-27B, que destaca por su contexto nativo de 262.144 tokens extensible a 1 millón, soporte de razonamiento con modo de pensamiento configurable, y capacidades de visión (imagen y vídeo). La licencia Apache 2.0 permite uso comercial sin restricciones, y el formato EXL3 optimiza la inferencia en GPUs con un uso de memoria reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (Causal LM denso con vision encoder; hibrida: Gated DeltaNet + Gated Attention) |
| Parametros totales | 27B (modelo base); safetensors reporta 8.589.178.096 (conteo parcial, probablemente sin embeddings/visor) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativo; extensible a 1.000.000 |
| Tipos de cuantizacion | 4.00 bpw, head bits 8, codebook mul1, formato exl3 |
| Idiomas soportados | No disponible (multilingue presumible, no confirmado) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato exl3 para ExLlamaV3) |

## Arquitectura y entrenamiento

Qwen3.8-27B presenta una arquitectura híbrida de 64 capas con dimensión oculta 5120. El layout interno es de 16 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de un bloque de FFN, y un sub-bloque final de Gated Attention con FFN. La atención lineal (Gated DeltaNet) utiliza 48 cabezas para V y 16 para QK con dimensión de cabeza 128, mientras que la atención completa (Gated Attention) usa 24 cabezas para Q y 4 para KV con dimensión de cabeza 256 y RoPE de dimensión 64. El FFN tiene dimensión intermedia de 17.408 y el modelo incluye predicción multi-token (MTP) entrenada con múltiples pasos.

El entrenamiento se realizó en dos etapas (pre-entrenamiento y post-entrenamiento), pero los detalles específicos sobre el volumen de datos, composición del dataset o técnicas de alineación como RLHF o DPO no están disponibles en la información proporcionada. La cuantización EXL3 se generó con ExLlamaV3 1.4.1, usando 250 filas y 2048 columnas para calibración, con escalas de salida siempre activadas y codebook mul1.

## Capacidades

- Generación de texto general, razonamiento y resolución de problemas complejos de varios pasos.
- Codificación de alto nivel: genera, explica y depura código en múltiples lenguajes.
- Comprensión multimodal: procesa imágenes y vídeos, incluyendo diagramas STEM, documentos escaneados y vídeos de larga duración (hasta una hora).
- Modo de pensamiento configurable: el razonamiento profundo se activa por defecto y puede desactivarse por petición; admite `reasoning_effort` para ajustar la profundidad y `preserve_thinking` para conservar el contexto de razonamiento en conversaciones.
- Soporte de agentes: planificación autónoma, manejo de retroalimentación del entorno y ejecución de tareas de larga duración con múltiples pasos.
- Predicción multi-token (MTP) para acelerar la generación en comparación con modelos de un solo token.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones de varios turnos con contexto largo, gracias a su ventana de 262K tokens, y derivar consultas complejas a herramientas externas mediante tool calling.
- Generación de código en producción: su capacidad de codificación y soporte de herramientas permite integrarlo en pipelines de CI/CD para revisión de código, generación de tests o autocompletado en IDEs.
- Análisis de documentos técnicos y científicos: el visor de visión permite extraer información de diagramas STEM, fórmulas matemáticas y documentos escaneados, con razonamiento profundo para explicar conclusiones.
- Automatización de oficina: puede resumir correos, generar informes, rellenar plantillas y ejecutar tareas administrativas complejas que requieren múltiples pasos y acceso a datos.
- Análisis de vídeo de vigilancia o contenido: su capacidad de procesar vídeos de hasta una hora permite detectar eventos, resumir secuencias y responder preguntas sobre el contenido.
- Agentes autónomos de investigación: con su modo de pensamiento y soporte de herramientas, puede planificar experimentos, consultar bases de datos y redactar informes de investigación con razonamiento largo.

## Benchmarks y rendimiento

La model card original del modelo Qwen3.8-27B incluye una tabla de benchmarks comparando con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores numéricos no están disponibles en el extracto proporcionado. No se han publicado resultados de benchmarks específicos para esta cuantización EXL3. No se inventan datos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17-20 GB (peso de 17,2 GB a 4 bits + overhead de KV cache y activaciones).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB), H100 (80 GB).
- Cabe en GPU de consumo: sí, en tarjetas con 24 GB de VRAM o más.
- Opciones de despliegue: exclusivamente ExLlamaV3 (formato exl3). No es compatible con vLLM, SGLang, llama.cpp ni Ollama sin conversión previa.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

La model card original del modelo Qwen3.8-27B compara con Qwen3.6-27B, Qwen3.7-Plus, Muse Spark 30B y Opus4.6 Max. Sin embargo, no se dispone de datos de rendimiento ni especificaciones detalladas de estos modelos en el extracto. Se puede indicar que todos son modelos densos de la familia Qwen o competidores del mismo rango de tamaño, pero no hay datos verificables.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K (extensible 1M) | Apache 2.0 | HuggingFace, GitHub |
| Qwen3.6-27B | 27B (no confirmado) | No disponible | Apache 2.0 (presumido) | HuggingFace |
| Qwen3.7-Plus | No disponible | No disponible | No disponible | No disponible |
| Muse Spark 30B | 30B (por nombre) | No disponible | No disponible | No disponible |
| Opus4.6 Max | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- La cuantización a 4 bits puede introducir una ligera degradación de la calidad en tareas de razonamiento complejo o en la salida multimodal, en comparación con los pesos completos.
- El componente de visión del modelo cuantizado requiere que ExLlamaV3 soporte el vision encoder; no se confirma en la información disponible si esta funcionalidad está operativa en el formato EXL3.
- El contexto de 262K tokens implica una demanda elevada de memoria KV cache; en hardware de consumo (24 GB) el contexto útil se verá reducido significativamente.
- No se han publicado datos sobre sesgos o alucinaciones; como todo modelo de lenguaje, puede generar información falsa o sesgada, especialmente en tareas de razonamiento largo.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero el modelo base incluye componentes de visión que pueden tener dependencias adicionales (no especificadas).
- El formato EXL3 es propietario de ExLlamaV3 y no es interoperable con otros motores de inferencia sin re-cuantización.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/darkbit1001/Qwen3.8-27B-exl3-4.00bpw-hb8
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub de Alibaba: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guía de especificaciones y hardware (YottaLabs): https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Análisis de la familia Qwen3.8 (OpenLM): https://openlm.ai/qwen3.8/
- Variante cuantizada con 4.500 bpw: https://huggingface.co/darkbit1001/Qwen-3.8-27B-exl3-4.500bpw-hb6
