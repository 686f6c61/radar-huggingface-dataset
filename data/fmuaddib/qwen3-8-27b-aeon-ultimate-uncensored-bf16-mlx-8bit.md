# Fmuaddib/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-mlx-8Bit

## Resumen

El modelo **Fmuaddib/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-mlx-8Bit** es una conversión al formato **MLX** (optimizado para Apple Silicon) con cuantización de 8 bits del modelo base **AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16**, una versión "abliterated" (sin rechazos) del Qwen3.8-27B de Alibaba. El objetivo de esta variante es ofrecer un modelo de 27 000 millones de parámetros con capacidades de visión, razonamiento y tool calling, pero sin los filtros de seguridad que limitan las respuestas en el modelo original. La conversión MLX permite ejecutarlo de forma eficiente en ordenadores Mac con chips Apple Silicon, ampliando el acceso a este tipo de modelos a hardware de consumo.

El modelo base Qwen3.8-27B es un modelo denso de 27B con arquitectura híbrida (atención con Gated DeltaNet), ventana de contexto nativa de 262 000 tokens, soporte multimodal (imagen y vídeo) y licencia Apache 2.0. La versión AEON elimina los mecanismos de rechazo mediante técnicas de abliteración, lo que la hace adecuada para casos de uso donde se requiere una generación sin restricciones temáticas, aunque con los riesgos asociados. Esta conversión MLX 8-bit mantiene todas las capacidades del modelo base, pero reduce los requisitos de memoria para su ejecución en Mac.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (dense, hybrid attention con Gated DeltaNet) |
| Parametros totales | 7 566 401 024 (según safetensors; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (nativo) |
| Tipos de cuantizacion | 8-bit (MLX) |
| Idiomas soportados | Inglés, chino, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors en formato MLX) |

## Arquitectura y entrenamiento

El modelo es una conversión MLX del checkpoint **AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16**, que a su vez deriva del Qwen3.8-27B original. La arquitectura subyacente es la de Qwen3.8: un transformer denso con atención híbrida que combina mecanismos de atención clásicos con capas de Gated DeltaNet, lo que mejora la eficiencia en contextos largos. El modelo base incorpora un codificador de visión que permite procesar imágenes y vídeo, además de texto. El proceso de "abliteration" aplicado por AEON-7 elimina los patrones de rechazo aprendidos durante el entrenamiento con RLHF, de modo que el modelo responde a solicitudes que el original podría bloquear. No se dispone de detalles específicos sobre el dataset de entrenamiento de la versión AEON, pero se asume que es el mismo que el del Qwen3.8-27B, con ajuste fino adicional para eliminar los rechazos. La conversión MLX se realizó con mlx-lm 0.31.2 y no altera los pesos, solo los reempaqueta en formato optimizado para Apple Silicon.

## Capacidades

- Generación de texto y conversación multilingüe (inglés, chino y otros idiomas).
- Razonamiento complejo con modo "thinking" configurable (el modelo puede generar cadenas de razonamiento antes de responder).
- Comprensión de imágenes y vídeo (entrada multimodal nativa).
- Generación de código y asistencia en tareas de programación.
- Soporte de function calling y tool calling para integración con APIs y agentes.
- Capacidad para tareas agénticas de largo horizonte gracias a la ventana de contexto de 262K tokens.
- Ausencia de filtros de rechazo (versión "uncensored"), lo que permite respuestas sin restricciones temáticas.

## Casos de uso

- **Asistentes de programación sin restricciones**: el modelo puede generar código, explicar vulnerabilidades o escribir exploits en entornos de investigación de seguridad, donde el modelo original podría rechazar la solicitud. Su soporte de tool calling permite conectarlo a editores o CLIs.
- **Análisis de documentos extensos**: con 262K tokens de contexto, puede procesar libros técnicos completos, informes financieros o bases de código enteras para extraer información o resumir.
- **Agentes autónomos de automatización**: gracias a su capacidad de razonamiento multi-paso y function calling, puede orquestar tareas como gestión de correos, navegación web o interacción con APIs, sin las limitaciones de contenido que imponen otros modelos.
- **Generación de contenido creativo sin filtros**: escritura de ficción, guiones o material de marketing con temáticas adultas o controvertidas, donde un modelo censurado se negaría a colaborar.
- **Investigación en alineación y seguridad de IA**: al ser una versión abliterated, sirve como caso de estudio para analizar cómo la eliminación de rechazos afecta al comportamiento del modelo y para desarrollar técnicas de detección de contenido no seguro.
- **Despliegue local en Mac**: al estar en formato MLX 8-bit, puede ejecutarse en portátiles Apple Silicon con 32 GB de RAM unificada, permitiendo prototipado y desarrollo offline sin depender de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión MLX 8-bit ni para la versión AEON-7. El modelo base Qwen3.8-27B reporta los siguientes resultados en su documentación oficial (según la búsqueda web):

| Benchmark | Resultado |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos datos corresponden al Qwen3.8-27B original y no son directamente extrapolables a la versión uncensored ni a la conversión MLX, aunque es razonable esperar un rendimiento similar en tareas estándar, salvo en aquellas donde el filtro de seguridad afecte a la respuesta.

## Requisitos de hardware

- **VRAM estimada**: el repositorio ocupa 28.6 GB. En formato MLX 8-bit, el modelo de 27B requiere aproximadamente 27 GB de memoria para los pesos, más overhead de activaciones y KV cache. Se recomienda un mínimo de 32 GB de memoria unificada en Apple Silicon.
- **GPUs compatibles**: exclusivamente Apple Silicon (M1 Pro/Max/Ultra, M2, M3, M4 y superiores). No es compatible con GPUs NVIDIA o AMD en este formato.
- **Opciones de despliegue**: mediante `mlx-lm` (Python) o aplicaciones como LM Studio que soportan MLX. También se puede convertir a otros formatos (GGUF, etc.) si se desea usar en CPU o GPUs convencionales, pero esa conversión no está incluida en este repositorio.
- **Latencia y throughput**: no se dispone de datos medidos. En un Mac Studio M2 Ultra con 64 GB, se espera una generación de varios tokens por segundo, pero depende de la longitud de la secuencia y del uso del modo thinking.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Particularidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262K | Apache 2.0 | Transformers, GGUF, MLX | Con filtros de seguridad |
| AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 | 27B | 262K | Apache 2.0 | Transformers | Sin rechazos (abliterated) |
| Fmuaddib/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-mlx-8Bit | 27B (7.5B según safetensors) | 262K | Apache 2.0 | MLX 8-bit | Conversión MLX del anterior |

La comparativa con otros modelos de 27B como Gemma 2 27B o Llama 3.1 8B no es directa por diferencias de arquitectura y licencia. Este modelo se distingue por su combinación de multimodalidad, contexto largo y ausencia de censura, algo poco común en el ecosistema open source.

## Limitaciones y advertencias

- **Riesgo de contenido inapropiado**: al eliminar los rechazos, el modelo puede generar contenido violento, sexual, discriminatorio o ilegal. No debe usarse en aplicaciones públicas sin moderación adicional.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede inventar información o reflejar sesgos presentes en sus datos de entrenamiento. La ausencia de filtros no corrige estos problemas.
- **Dato de parámetros inconsistente**: el archivo safetensors reporta 7 566 401 024 parámetros, muy inferior a los 27B declarados. Esto puede deberse a un error en la conversión o a una subida incompleta. Se recomienda verificar la integridad del modelo antes de usarlo en producción.
- **Limitación de hardware**: el formato MLX solo funciona en Apple Silicon. Para otros entornos es necesario convertir los pesos a otro formato, lo que puede requerir herramientas adicionales.
- **Licencia Apache 2.0**: permite uso comercial, pero no exime de responsabilidad legal por el contenido generado. El usuario es responsable del cumplimiento normativo.
- **Sin garantías de rendimiento**: al ser una conversión no oficial, no hay soporte técnico y los resultados pueden diferir ligeramente del modelo base.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/Fmuaddib/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16-mlx-8Bit)
- [Modelo base AEON-7](https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16)
- [Artículo de AMD sobre Qwen3.8 27B](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
- [Página de LM Studio para Qwen3.8](https://lmstudio.ai/models/qwen3.8)
- [Guía de Yottalabs sobre Qwen3.8 27B](https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026)
- [Guía completa de Lovableapp sobre Qwen3.8-27B](https://lovableapp.org/blog/qwen3-8-27b)
