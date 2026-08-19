# mr56/Qwen3.8-27B

## Resumen

Qwen3.8-27B es un modelo de lenguaje denso multimodal nativo desarrollado por el equipo Qwen de Alibaba, presentado como la generación más capaz de la familia abierta Qwen hasta la fecha. Se trata de un modelo de visión-lenguaje que comprende imágenes y vídeos, con control flexible del modo de razonamiento, diseñado para tareas complejas de múltiples pasos con alta fiabilidad. El modelo se distribuye con licencia Apache 2.0 y pesos abiertos.

Construido sobre la base arquitectónica de Qwen3.5, incorpora un bloque híbrido de atención lineal (Gated DeltaNet) y atención con mecanismo de compuerta (Gated Attention), junto con predicción multi-token (MTP). Con 27 781 427 952 parámetros y una ventana de contexto nativa de 262 144 tokens, extensible hasta 1 000 000, el modelo está orientado a codificación, trabajo profesional, investigación y tareas agénticas de largo alcance. Su tamaño compacto permite despliegue en hardware local, y es compatible con Transformers, vLLM, SGLang y TokenSpeed.

La relevancia actual del modelo radica en su capacidad de combinar comprensión multimodal (imagen y vídeo) con razonamiento agéntico avanzado en un paquete denso de 27B, lo que lo sitúa como una opción atractiva para entornos de producción que requieren autonomía, planificación y manejo de contexto extenso sin depender de infraestructura masiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, bloques híbridos Gated DeltaNet + Gated Attention |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 144 nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer causal con un codificador de visión integrado. La capa de lenguaje se organiza en 64 capas con una dimensión oculta de 5120 y una capa de embedding de 248 320 tokens (padded). El layout interno sigue el patrón: 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). El bloque Gated DeltaNet utiliza 48 cabezas de atención lineal para V y 16 para QK, con dimensión de cabeza 128. El bloque Gated Attention emplea 24 cabezas para Q y 4 para KV, con dimensión de cabeza 256 y RoPE de 64 dimensiones. La FFN tiene dimensión intermedia de 17 408. Se entrenó con predicción multi-token (MTP) en múltiples pasos.

El entrenamiento comprende dos etapas: pre-entrenamiento y post-entrenamiento. La model card no especifica el número exacto de tokens de entrenamiento ni la composición del dataset. No se menciona el uso de RLHF o DPO explícitamente, aunque el modelo incorpora un modo de pensamiento configurable con parámetros como `reasoning_effort` y `preserve_thinking`, lo que sugiere técnicas de alineación avanzadas no detalladas en la documentación disponible.

## Capacidades

- Generación de texto con modo de razonamiento (thinking) activado por defecto, desactivable por petición; la profundidad del razonamiento se ajusta mediante `reasoning_effort`.
- Comprensión nativa de imágenes y vídeos, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración.
- Planificación autónoma y manejo de feedback del entorno para tareas agénticas de largo alcance, con ejecución fiable de principio a fin.
- Soporte para tool calling y function calling, integrable en flujos de agentes y pipelines de automatización.
- Capacidades multilingües no especificadas en la documentación, aunque se asume cobertura amplia por la familia Qwen.
- Compatibilidad con múltiples frameworks de inferencia: Hugging Face Transformers, vLLM, SGLang y TokenSpeed.
- Retención de contexto de razonamiento histórico mediante `preserve_thinking`, útil para conversaciones multi-turno con memoria de razonamiento previo.

## Casos de uso

- Automatización de oficina: el modelo puede procesar documentos con formato complejo (tablas, diagramas) y generar resúmenes, extraer datos o redactar informes, gracias a su comprensión multimodal de imágenes y texto.
- Agentes de codificación en terminal: con un rendimiento de 73.0 en Terminal Bench 2.1, puede ejecutar tareas de codificación agéntica en entornos de terminal, como instalar dependencias, ejecutar tests y corregir errores de forma autónoma.
- Ingeniería de software asistida: su puntuación de 42.2 en DeepSWE (benchmark de ingeniería de software profunda) lo hace adecuado para tareas de resolución de issues complejos en repositorios, generación de parches y refactorización de código.
- Automatización de flujos de trabajo en escritorio: con OSWorld 84.3, puede controlar aplicaciones de escritorio (navegadores, editores, hojas de cálculo) para completar tareas administrativas o de gestión de datos.
- Análisis de vídeo de larga duración: su capacidad de procesar vídeos de hasta una hora permite aplicaciones de vigilancia, revisión de grabaciones de reuniones o análisis de contenido audiovisual.
- Asistente de investigación: puede leer artículos científicos con figuras y tablas, razonar sobre ellos y generar resúmenes o responder preguntas, combinando comprensión visual y razonamiento matemático.
- Soporte técnico multimodal: integrado en sistemas de atención al cliente, puede interpretar capturas de pantalla, diagramas de error y guiar al usuario paso a paso con razonamiento multi-turno.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa con modelos como Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero los valores completos no están disponibles en la información extraída. De los resultados de búsqueda web se conocen los siguientes datos:

| Benchmark | Qwen3.8-27B |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench 2.1 (Terminus) | 73.0 |
| OSWorld | 84.3 |

No se dispone de resultados para MMLU, HumanEval, GSM8K u otros benchmarks estándar en la información proporcionada. La model card menciona también MathVision, pero el valor numérico no está incluido en el extracto.

## Requisitos de hardware

- VRAM estimada: con 27 781 millones de parámetros en fp16, el modelo requiere aproximadamente 55.6 GB de memoria solo para los pesos. Con cuantización a 8 bits se reduciría a unos 28 GB, y a 4 bits a unos 14 GB, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en fp16 se necesitan GPUs con al menos 60 GB de VRAM, como A100 80GB, H100 80GB o RTX A6000 48GB (insuficiente para fp16 completo). Con cuantización 4-bit cabría en RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. También se puede usar con llama.cpp u Ollama si se generan archivos GGUF, aunque no se proporcionan oficialmente.
- Latencia y throughput: no disponible. Dependerá del hardware y del framework de inferencia.

## Comparativa con modelos similares

La model card compara Qwen3.8-27B con Qwen3.6-27B, Qwen3.7-Plus, Muse Glimmer-30B y Opus4.6 Max, pero no se incluyen los valores numéricos en el extracto disponible. A partir de los datos conocidos:

| Modelo | Parametros | Contexto | Licencia | Rendimiento destacado |
|---|---|---|---|---|
| Qwen3.8-27B | 27.8B | 262K (ext. 1M) | Apache 2.0 | DeepSWE 42.2, Terminal Bench 73.0, OSWorld 84.3 |
| Qwen3.6-27B | 27B (estimado) | no disponible | Apache 2.0 (presumible) | no disponible |
| Qwen3.7-Plus | no disponible | no disponible | no disponible | no disponible |
| Muse Glimmer-30B | 30B (estimado) | no disponible | no disponible | no disponible |
| Opus4.6 Max | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para una comparación detallada con alternativas de la misma categoría. Se recomienda consultar la tabla completa en la model card original.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos conocidos ni evaluación de sesgos en la información disponible.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente en tareas de razonamiento multimodal donde la interpretación de imágenes puede ser incorrecta.
- La ventana de contexto nativa de 262K tokens es amplia pero la extensión a 1M puede degradar la calidad en tramos muy largos; se recomienda validar en el caso de uso concreto.
- No se especifican los idiomas soportados oficialmente, aunque por la familia Qwen se espera soporte multilingüe amplio; verificar antes de usar en producción.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero es recomendable revisar los términos de la licencia de los pesos y cualquier condición adicional del repositorio.
- El modelo está pensado para tareas agénticas, lo que implica que puede ejecutar acciones en entornos simulados o reales; debe usarse con supervisión adecuada para evitar efectos no deseados.
- No se proporcionan cuantizaciones oficiales; los usuarios deberán generarlas o esperar versiones comunitarias, lo que puede afectar al rendimiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mr56/Qwen3.8-27B
- Repositorio oficial Qwen en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
- GitHub oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- GitHub de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Guía completa (blog): https://lovableapp.org/blog/qwen3-8-27b
- Seguimiento de lanzamiento: https://aireleasetracker.com/model/qwen/qwen3.8-27b
