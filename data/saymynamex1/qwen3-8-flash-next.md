# saymynameX1/Qwen3.8-Flash-Next

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de tipo MoE (Mixture of Experts) desarrollado por el equipo Qwen, publicado como vista previa experimental de la arquitectura que sustentará Qwen4. El modelo combina un codificador de visión con un núcleo de lenguaje híbrido que integra Gated DeltaNet, atención sparse (Qwen Sparse Attention, QSA) y capas MoE, junto con innovaciones como Gated Residual y n-gram embedding. Con 125 mil millones de parámetros en el modelo de lenguaje (6 mil millones activos por token), más 51 mil millones en embeddings de n-gramas y 4 mil millones en el módulo MTP, el total de pesos asciende a aproximadamente 180 mil millones.

El modelo está diseñado para manejar contextos largos de forma eficiente: soporta 262 144 tokens de forma nativa y es extensible hasta 1 000 000. Su arquitectura híbrida reduce la latencia en tareas agénticas y de razonamiento multi-paso, al tiempo que mantiene un coste de inferencia bajo gracias a la activación selectiva de parámetros. La liberación de pesos en abierto bajo licencia qwen-community-1.0 permite su ejecución local con frameworks como Transformers, vLLM, SGLang o TokenSpeed, y representa un hito en la evolución hacia modelos más eficientes y escalables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) + MoE, con vision encoder |
| Parametros totales | ~180 000 millones (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6 000 millones (más activación parcial del n-gram embedding) |
| Longitud de contexto | 262 144 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | No disponible (se mencionan cuantizaciones en Unsloth, sin detallar) |
| Idiomas soportados | No disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next presenta una arquitectura híbrida que combina atención lineal recurrente (Gated DeltaNet) con atención sparse por micro-bloques (QSA). El modelo se organiza en 48 capas con un patrón repetido de 12 bloques, cada uno compuesto por 3 sub-bloques de Gated DeltaNet seguidos de MoE, y un sub-bloque final de QSA seguido de MoE. La atención sparse opera a nivel de micro-bloques (512 bloques o 2048 tokens de presupuesto), lo que reduce significativamente la latencia en contextos largos frente a la selección token a token. El MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido por token.

El entrenamiento combina los optimizadores Muon y AdamW aplicados a categorías específicas de pesos, guiado por leyes de escalado reajustadas. Se elimina el warmup de tamaño de lote, comenzando directamente con el tamaño objetivo, lo que reduce el número de pasos de optimización y permite tasas de aprendizaje mayores. El modelo incorpora además un módulo MTP (Multi-Token Prediction) de una capa entrenado con multi-step, y un sistema de n-gram embedding que indexa bigramas y trigramas en la capa 2, permitiendo escalar parámetros con menor coste computacional y facilitando la descarga en aceleradores con memoria limitada. La etapa de post-entrenamiento incluye ajuste por instrucciones y alineación, aunque no se especifican detalles de RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento multimodal: acepta entradas de imagen y texto, y produce respuestas de texto.
- Razonamiento multi-paso y tareas agénticas: la combinación de atención sparse y MoE reduce la latencia en cadenas de razonamiento largas.
- Soporte de tool calling y function calling: no se detalla explícitamente, pero el modelo está orientado a cargas de trabajo agénticas y es compatible con frameworks de inferencia que soportan estas funciones.
- Capacidades multilingües: no se especifican los idiomas soportados en la información disponible.
- Contexto largo: 262 144 tokens nativos, extensible a 1 000 000, adecuado para análisis de documentos extensos y conversaciones multi-turno.
- Eficiencia de inferencia: solo 6 000 millones de parámetros activos por token, lo que permite ejecución en hardware de gama media.
- Compatibilidad con múltiples motores de inferencia: Transformers, vLLM, SGLang, TokenSpeed y Unsloth.

## Casos de uso

- Agentes autónomos con razonamiento multi-paso: el modelo puede encadenar llamadas a herramientas y razonar sobre resultados intermedios gracias a su baja latencia en contextos largos y su soporte para cargas agénticas. Es adecuado para sistemas que requieren planificación y ejecución de tareas complejas.
- Análisis de documentos extensos: con 262 144 tokens de contexto nativo, puede procesar libros completos, expedientes legales o informes financieros de una sola pasada, extrayendo información relevante y resumiendo secciones específicas.
- Asistencia multimodal en atención al cliente: al aceptar imágenes y texto, puede interpretar capturas de pantalla, facturas o fotografías de productos y responder consultas de soporte con contexto visual.
- Generación de código asistida por visión: puede leer diagramas de arquitectura, esquemas o capturas de pantalla de interfaces y generar o corregir código relacionado, combinando comprensión visual y de programación.
- Búsqueda y recuperación de información en corpus largos: su atención sparse permite consultar bases de conocimiento extensas sin perder rendimiento, útil para sistemas de pregunta-respuesta sobre documentación técnica.
- Despliegue en entornos con recursos limitados: al activar solo 6 000 millones de parámetros, puede ejecutarse en GPUs de consumo (por ejemplo, RTX 4090 con cuantización) o en configuraciones con offloading de memoria, como se menciona en la comunidad (por ejemplo, en Mac con 128 GB de RAM unificada).

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. Las fuentes mencionan evaluaciones en JobBench, CoWorkBench, IFBench y Agent's Last Exam, pero no se proporcionan las puntuaciones concretas. Se recomienda consultar el informe técnico oficial para obtener datos detallados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Con 6 000 millones de parámetros activos, una cuantización de 4 bits podría requerir aproximadamente 8-12 GB de VRAM para el modelo de lenguaje, más espacio para el n-gram embedding y el vision encoder.
- GPU recomendadas: se menciona que el modelo puede ejecutarse en hardware de gama media; la comunidad reporta compatibilidad con Mac de 128 GB de RAM unificada mediante offloading. Para servidores, GPUs como A100 o H100 serían adecuadas para throughput alto.
- Compatibilidad con GPUs de consumo: sí, con cuantización y posible offloading. Unsloth ofrece versiones cuantizadas para ejecución local.
- Opciones de despliegue: Transformers, vLLM, SGLang, TokenSpeed, Unsloth (para cuantización y ejecución local), y el servicio gestionado Qwen Cloud para la versión oficial Qwen3.8-Flash.
- Latencia y throughput: no disponibles en la información proporcionada. La arquitectura QSA está diseñada para reducir la latencia en contextos largos, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| Qwen3.8-Flash-Next | ~180B totales, 6B activos | 262K (ext. 1M) | Híbrida Gated DeltaNet + QSA + MoE | qwen-community-1.0 |
| Qwen3.8-27B | 27B (no se especifica si es MoE) | No disponible | No disponible | No disponible |
| Qwen3.8-Flash (versión oficial) | Misma base que Flash-Next | 1M por defecto | Misma arquitectura | API gestionada |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La versión oficial Qwen3.8-Flash añade características de producción como herramientas integradas y contexto de 1M por defecto, pero no se detallan diferencias de rendimiento.

## Limitaciones y advertencias

- Modelo experimental: es una vista previa de la arquitectura Qwen4, por lo que puede presentar comportamientos inestables o cambios en versiones futuras.
- Sesgos y alucinaciones: no se han publicado evaluaciones específicas de sesgos; como todo LLM, puede generar información falsa o sesgada, especialmente en dominios poco representados en sus datos de entrenamiento.
- Idiomas: no se especifican los idiomas soportados; el rendimiento fuera de los idiomas principales puede ser inferior.
- Licencia qwen-community-1.0: es una licencia de código abierto específica de Qwen; es necesario revisar sus términos para uso comercial, especialmente en lo relativo a la generación de servicios derivados o alojamiento para terceros.
- Requisitos de memoria: aunque los parámetros activos son solo 6B, el n-gram embedding de 51B y el MTP de 4B requieren gestión de memoria cuidadosa; el repositorio ocupa 360 GB en FP32, por lo que se necesita cuantización para despliegues locales.
- Sin garantías de producción: al ser una versión experimental, no se recomienda su uso directo en entornos críticos sin validación previa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/saymynameX1/Qwen3.8-Flash-Next
- Repositorio GitHub oficial: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Blog oficial de Qwen: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Guía de ejecución local con Unsloth: https://unsloth.ai/docs/models/qwen3.8-next
- Análisis de ExplainX: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- Seguimiento de lanzamiento: https://aireleasetracker.com/model/qwen/qwen3.8-flash-next
