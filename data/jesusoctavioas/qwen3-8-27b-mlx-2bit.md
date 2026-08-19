# jesusoctavioas/Qwen3.8-27B-mlx-2Bit

## Resumen

El modelo `jesusoctavioas/Qwen3.8-27B-mlx-2Bit` es una conversión al formato MLX del modelo Qwen3.8-27B de Alibaba, cuantizado a 2 bits. Esta versión está pensada para ejecutarse en hardware Apple Silicon (chips M1, M2, M3 y M4) mediante la librería `mlx-lm`, reduciendo drásticamente el uso de memoria respecto al modelo original. El modelo base es un transformer denso de 27 000 millones de parámetros con capacidades multimodales (entrada de imagen y texto), razonamiento configurable y una ventana de contexto nativa de 262 000 tokens, lo que lo hace adecuado para tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte.

La relevancia de esta conversión radica en que permite ejecutar un modelo de 27B en equipos Apple con memoria unificada de 16 GB o más, sin necesidad de GPUs dedicadas. El repositorio ocupa 8,4 GB, lo que lo hace viable para despliegues locales en portátiles y estaciones de trabajo. Al estar basado en el modelo Qwen3.8-27B, hereda sus capacidades de visión, tool calling y razonamiento, aunque la cuantización a 2 bits introduce una pérdida de precisión que debe tenerse en cuenta en entornos de producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, visión-lenguaje (image-text-to-text) |
| Parametros totales | 27B (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (según documentación del modelo base) |
| Tipos de cuantizacion | 2-bit (MLX) |
| Idiomas soportados | No disponible en la información proporcionada; el modelo base es multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros desarrollado por Alibaba, con capacidades de visión y lenguaje. Incorpora un modo de razonamiento configurable (similar a un "thinking mode") y está optimizado para tareas agénticas de largo horizonte, con mejor planificación y manejo de feedback de herramientas y entornos. La conversión a MLX mantiene la arquitectura original, pero los pesos se cuantizan a 2 bits, lo que reduce el tamaño del modelo de aproximadamente 54 GB (en FP16) a 8,4 GB. No se dispone de detalles específicos sobre el proceso de entrenamiento del modelo base (datos, técnicas de RLHF o DPO) en la información proporcionada.

## Capacidades

- Generación de texto y chat conversacional multilingüe.
- Razonamiento configurable: puede activarse un modo de pensamiento para tareas complejas.
- Comprensión de imágenes: entrada de imagen-texto para análisis visual, capturas de pantalla, diagramas, etc.
- Soporte de tool calling y function calling, permitiendo integración con APIs y entornos externos.
- Capacidades agénticas de largo horizonte: planificación y ejecución de múltiples pasos con retroalimentación de herramientas.
- Generación de código y asistencia en programación, incluyendo tareas de codificación agéntica.
- Manejo de contexto largo (262K tokens) para procesar documentos extensos o conversaciones prolongadas.

## Casos de uso

- Asistente de programación local en Mac: gracias a la cuantización 2-bit, el modelo puede ejecutarse en una Mac con 16 GB de RAM unificada, ofreciendo autocompletado, generación de código y revisión de código sin conexión a internet.
- Análisis de documentos e imágenes: al ser multimodal, puede procesar capturas de pantalla, gráficos o diagramas para extraer información estructurada, útil en entornos de investigación o soporte técnico.
- Automatización de tareas agénticas: con soporte de tool calling y razonamiento de largo horizonte, puede planificar y ejecutar flujos de trabajo complejos, como la gestión de archivos, ejecución de comandos o interacción con APIs.
- Chat con contexto extenso: su ventana de 262K tokens permite mantener conversaciones largas o analizar documentos completos (manuales, informes, contratos) en una sola pasada.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: los desarrolladores pueden integrar el modelo en aplicaciones macOS o iOS mediante el ecosistema MLX, sin depender de servicios en la nube.
- Entorno educativo y de experimentación: al ser local y gratuito, permite a estudiantes e investigadores probar un modelo de 27B con capacidades multimodales sin costes de API ni requisitos de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión cuantizada a 2 bits. Los datos siguientes corresponden al modelo base Qwen3.8-27B sin cuantizar, según la documentación disponible:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42,2 |
| Terminal Bench | 73,0 |
| OSWorld | 84,3 |

Es importante señalar que la cuantización a 2 bits puede degradar el rendimiento en tareas complejas, aunque no se dispone de mediciones cuantitativas para esta versión.

## Requisitos de hardware

- Requiere Apple Silicon (M1, M2, M3, M4 o posteriores); no es compatible con GPUs NVIDIA o AMD.
- Memoria unificada estimada: al menos 12-16 GB para cargar los 8,4 GB de pesos más overhead de ejecución. Se recomienda 16 GB o más para un uso fluido.
- El modelo cabe en Macs con 16 GB de RAM, como MacBook Air M2/M3 o Mac mini M2/M3.
- Opciones de despliegue: mediante `mlx-lm` (librería oficial de MLX), que permite carga y generación con pocas líneas de código. También puede integrarse en aplicaciones usando el ecosistema MLX de Apple.
- Latencia y throughput: no disponibles para esta versión cuantizada; dependerán del chip concreto y de la longitud de la secuencia.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. La comparación más relevante es con el modelo base Qwen3.8-27B sin cuantizar, que ofrece el mismo rendimiento pero requiere aproximadamente 54 GB de memoria en FP16, lo que lo hace inviable para la mayoría de equipos Apple. Otras alternativas de tamaño similar (por ejemplo, Qwen2.5-27B) no han sido mencionadas en las fuentes consultadas, por lo que no se incluyen datos comparativos.

| Modelo | Parámetros | Contexto | Cuantización | Memoria requerida | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | FP16 | ~54 GB | Apache 2.0 |
| Qwen3.8-27B-mlx-2Bit (este) | 27B | 262K | 2-bit MLX | ~8,4 GB | Apache 2.0 |

## Limitaciones y advertencias

- La cuantización a 2 bits introduce una pérdida significativa de precisión, que puede afectar a tareas de razonamiento complejo, generación de código avanzado o comprensión visual detallada.
- El modelo solo funciona en Apple Silicon; no es portable a entornos con GPUs NVIDIA o AMD sin una conversión adicional.
- No se han publicado benchmarks específicos de esta versión cuantizada, por lo que el rendimiento real en tareas concretas es incierto.
- El modelo base puede presentar sesgos, alucinaciones o errores en contextos ambiguos, como cualquier LLM. La cuantización puede amplificar estos problemas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de las dependencias de MLX.
- La ventana de contexto de 262K tokens es la del modelo base; la cuantización puede afectar a la capacidad de manejar secuencias muy largas de forma estable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jesusoctavioas/Qwen3.8-27B-mlx-2Bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Documentación de Unsloth sobre Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
- Página de LM Studio: https://lmstudio.ai/models/qwen3.8
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Repositorio de instalación local: https://github.com/qwen3-8-27b/qwen3-8-27b
- Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-8-27b/
