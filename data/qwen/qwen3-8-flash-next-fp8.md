# Qwen/Qwen3.8-Flash-Next-FP8

## Resumen

Qwen3.8-Flash-Next-FP8 es la versión cuantizada en FP8 del modelo Qwen3.8-Flash-Next, un modelo experimental de Qwen que sirve como avance de la arquitectura que sustentará Qwen4. Se trata de un modelo de lenguaje causal multimodal (image-text-to-text) con un diseño de Mezcla de Expertos (MoE) ultra dispersa: 125 mil millones de parámetros totales con solo 6 mil millones activos por token, más una tabla de embeddings de n-gramas de 51 mil millones de parámetros y un módulo MTP (Multi-Token Prediction) de 4 mil millones. El repositorio FP8 contiene los pesos cuantizados con cuantización fina de bloque 128, compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed.

La relevancia de este modelo radica en su arquitectura innovadora, que introduce tres componentes clave: atención híbrida con Qwen Sparse Attention (QSA) que opera a nivel de micro-bloques, Gated Residual para modular el flujo de información en los residual streams, y N-gram Embedding como alternativa eficiente al escalado de parámetros vía MoE. El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y está diseñado para cargas de trabajo agénticas de larga duración. La versión FP8 mantiene un rendimiento casi idéntico al original según la documentación oficial, con un tamaño de repositorio de 185,6 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, MoE ultra dispersa con Gated DeltaNet, Qwen Sparse Attention (QSA), Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (125B MoE + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B por token (10 expertos enrutados + 1 experto compartido de 512) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 (cuantizacion fina con bloque de 128) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next representa un rediseño fundamental de los componentes de los LLM modernos. El bloque oculto se organiza en 48 capas con un layout de 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)). La atención híbrida combina Gated DeltaNet (48 cabezas lineales para V y 16 para QK, dimensión 128) con Qwen Sparse Attention (24 cabezas Q y 2 KV, dimensión 256, presupuesto de 512 bloques o 2048 tokens). QSA opera a nivel de micro-bloques en lugar de tokens individuales, lo que reduce significativamente la latencia en contextos largos. El componente MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. El Gated Residual modula el flujo de información mediante un read gate dependiente de datos y un write gate escalar por rama, con 4 ramas y bottleneck rank de 320.

La innovación principal es el N-gram Embedding: una tabla de 20.000.000 de bigramas/trigramas en la capa 2 que permite escalar parámetros de forma eficiente en memoria, más adecuada para offloading que MoE. El entrenamiento utiliza una receta adaptada que aplica los optimizadores Muon y AdamW a categorías específicas de pesos, elimina el warmup de batch size comenzando directamente en el tamaño objetivo, y emplea scaling laws reajustadas para permitir learning rates mayores. El modelo incluye un módulo MTP (Multi-Token Prediction) de 1 capa entrenado con multi-steps. La etapa de entrenamiento comprende pre-training y post-training, aunque no se especifican los datos de entrenamiento ni el número de tokens utilizados.

## Capacidades

- Generación de texto multimodal: procesa entradas de imagen y texto, generando respuestas de texto (pipeline image-text-to-text).
- Razonamiento y comprensión de contexto largo: ventana nativa de 262.144 tokens, extensible a 1.000.000, diseñada para cargas de trabajo agénticas de larga duración.
- Generación de código y tareas de programación: el modelo base Qwen3.8 está orientado a coding, trabajo profesional e investigación.
- Ejecución de tareas agénticas multi-paso: la arquitectura con atención dispersa y bajo coste de inferencia está optimizada para agentes que requieren múltiples pasos de razonamiento.
- Capacidades multilingües: no se especifican los idiomas soportados en la documentación disponible.
- Tool calling y function calling: la versión oficial Qwen3.8-Flash incluye herramientas integradas; se espera compatibilidad en este modelo base.
- Multi-Token Prediction (MTP): el módulo MTP permite predecir múltiples tokens por paso, acelerando la inferencia.

## Casos de uso

- Agentes autónomos de larga duración: el modelo puede ejecutar tareas multi-paso con razonamiento encadenado gracias a su ventana de contexto de 262K tokens nativos y su atención dispersa QSA, que reduce la latencia en secuencias largas. Es adecuado para agentes que necesitan mantener estado y contexto durante horas de interacción.
- Análisis de documentos extensos: con capacidad de procesar hasta 1M tokens, puede analizar libros completos, expedientes legales o informes financieros extensos, extrayendo información y respondiendo preguntas sobre el contenido.
- Asistencia multimodal en entornos profesionales: al ser un modelo image-text-to-text, puede procesar capturas de pantalla, diagramas o fotografías junto con texto, útil para soporte técnico, análisis de imágenes médicas o revisión de diseños.
- Generación de código en producción: con soporte para tool calling y su orientación a coding, puede integrarse en pipelines de CI/CD para generar, revisar y documentar código, o como asistente de programación en IDE.
- Despliegue en entornos con memoria limitada: la versión FP8 reduce los requisitos de VRAM frente al modelo original, permitiendo ejecutar el modelo en hardware más asequible sin pérdida significativa de rendimiento.
- Investigación en arquitecturas de LLM: al ser un preview de la arquitectura Qwen4, es útil para investigadores que quieran estudiar el comportamiento de Gated DeltaNet, QSA y N-gram Embedding en tareas reales.

## Benchmarks y rendimiento

La model card incluye una sección de resultados de benchmarks, pero el contenido citado en la información proporcionada está truncado y no se pueden extraer los datos numéricos. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio FP8 ocupa 185,6 GB, por lo que se necesitan al menos 2 GPUs de 96 GB o 4 de 48 GB para cargar los pesos en memoria. Con cuantización adicional (por ejemplo, INT4) podría reducirse, pero no se proporcionan datos oficiales.
- GPU recomendadas: GPUs de data center con soporte FP8 como NVIDIA H100, H200 o A100 (con soporte FP8 en H100). Para consumer, no es viable en una sola GPU.
- Opciones de despliegue: compatible con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. También está disponible la API gestionada de Qwen Cloud para el modelo Qwen3.8-Flash.
- Latencia y throughput: no se proporcionan datos específicos. La arquitectura con 6B parámetros activos y atención dispersa está diseñada para baja latencia en contexto largo, pero las cifras concretas no están disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 | 180B (125B+51B+4B) | 6B | 262K (1M ext.) | qwen-community-1.0 | Hugging Face |
| Qwen3.8-Flash-Next | 180B (125B+51B+4B) | 6B | 262K (1M ext.) | qwen-community-1.0 | Hugging Face (proximamente) |
| Qwen3.8 (serie) | no disponible | no disponible | no disponible | no disponible | GitHub/QwenLM |

No se dispone de información suficiente sobre modelos comparables de la misma categoría (MoE ultra dispersa multimodal con contexto de 1M) en la información proporcionada. La comparativa con modelos como DeepSeek-V3 o Mixtral no es posible sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Modelo experimental: es un preview de la arquitectura Qwen4, no una versión estable. Puede contener comportamientos inesperados o cambios en versiones futuras.
- Licencia qwen-community-1.0: es una licencia de comunidad que puede tener restricciones para uso comercial. Es necesario revisar los términos completos antes de desplegar en producción.
- Sesgos y alucinaciones: no se han publicado evaluaciones de sesgos. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en dominios especializados.
- Idiomas no especificados: no se indica qué idiomas soporta el modelo, lo que limita la evaluación de su cobertura multilingüe.
- Requisitos de hardware elevados: a pesar de la cuantización FP8, el tamaño total de 185,6 GB requiere infraestructura de data center, no es viable en GPUs de consumo.
- Datos de entrenamiento no publicados: no se especifica la composición del dataset ni el número de tokens de entrenamiento, lo que dificulta evaluar posibles sesgos o limitaciones de conocimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Qwen/Qwen3.8-Flash-Next-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe tecnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Repositorio GitHub Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Receta vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Articulo de ExplainX: https://www.explainx.ai/blog/qwen3-8-flash-next-125b-moe-release-august-2026
- API Qwen Cloud: https://www.qwencloud.com/models/Qwen3.8-Flash
