# cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4

## Resumen

Qwen3.8-Flash-Next es un modelo experimental de Qwen (Alibaba) que anticipa la arquitectura que sustentará Qwen4. Se trata de un modelo causal multimodal (texto e imagen) que introduce cuatro innovaciones arquitectónicas: atención híbrida con Qwen Sparse Attention (QSA) a nivel de micro-bloque, Gated Residual con puertas de lectura y escritura, N-gram Embedding para escalar parámetros sin recurrir exclusivamente a MoE, y una receta de entrenamiento que combina Muon y AdamW con eliminación del warmup de batch size. El objetivo declarado es mejorar la eficiencia en contextos largos y cargas agénticas, no solo escalar el número de parámetros.

La ficha que nos ocupa, `cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4`, no es el modelo original sino una cuantización AWQ de 4 bits publicada por cyankiwi. Los pesos originales suman 78.550.400.915 parámetros según los safetensors, y la versión cuantizada ocupa 188,29 GB según la model card del autor de la cuantización. El repositorio completo pesa 376,7 GB, lo que incluye pesos originales y cuantizados.

Es relevante ahora porque permite ejecutar un modelo de ~78,5B parámetros multimodales en infraestructura más modesta que la requerida por los pesos en BF16, y porque la calibración AWQ se ha realizado específicamente con datos de dominios STEM y agénticos, lo que busca preservar el rendimiento en razonamiento y uso de herramientas. La licencia es `qwen-community-1.0`, una licencia comunitaria con condiciones específicas que deben revisarse antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; atención híbrida Gated DeltaNet + Qwen Sparse Attention (QSA), Gated Residual y N-gram Embedding |
| Parámetros totales | 78.550.400.915 (pesos originales); la cuantización AWQ INT4 ocupa 188,29 GB |
| Parámetros activos | no disponible (no se confirma que sea MoE; la model card menciona MoE solo como comparación con N-gram Embedding) |
| Longitud de contexto | no disponible para los pesos abiertos; la versión oficial Qwen3.8-Flash en Qwen Cloud ofrece 1M de contexto por defecto |
| Tipos de cuantización | AWQ INT4 (esta versión); el modelo base admite otros formatos no detallados |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors, compatible con transformers, compressed-tensors; la model card indica compatibilidad con vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

El modelo es un transformer causal con encoder de visión, entrenado en dos fases: pre-entrenamiento y post-entrenamiento. La innovación principal es la sustitución del emparejamiento Gated DeltaNet + Gated Attention por Gated DeltaNet + Qwen Sparse Attention (QSA). QSA no selecciona tokens individuales, sino que opera a nivel de micro-bloque, lo que reduce la latencia en contextos largos, un punto crítico para cargas agénticas. Además, incorpora Gated Residual, que modula el flujo de información en los residuales mediante una puerta de lectura elemento a elemento dependiente de los datos y una puerta escalar de escritura por rama, manteniendo la estabilidad del entrenamiento con bajo coste en inferencia.

La segunda palanca de escalado es N-gram Embedding: indexar con n-gramas cortos permite escalar parámetros con menos cómputo y con mayor facilidad de offloading que MoE, algo relevante en aceleradores con memoria limitada. La receta de entrenamiento aplica Muon y AdamW a categorías de pesos específicas, elimina los warmups tradicionales de batch size empezando directamente en el tamaño objetivo, y utiliza learning rates más altos guiados por leyes de escalado reajustadas. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La cuantización AWQ INT4 de cyankiwi (versión 26.05.01) se calibró con el dataset `cyankiwi/calibration`, orientado a STEM y dominios agénticos.

## Capacidades

- Generación de texto y razonamiento en un modelo causal de gran escala (~78,5B parámetros).
- Comprensión de imagen y texto: el pipeline declarado es `image-text-to-text`, con encoder de visión integrado.
- Conversación multi-turno, según la etiqueta `conversational`.
- Compatibilidad con endpoints y despliegue en servidores de inferencia (etiqueta `endpoints_compatible`).
- Soporte de tool calling y flujos agénticos: la arquitectura QSA está explícitamente orientada a cargas agénticas y la calibración AWQ incluye datos agénticos; la versión oficial Qwen3.8-Flash incluye herramientas integradas, pero no se detalla qué herramientas incorporan los pesos abiertos.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Agentes autónomos multi-paso: la atención QSA a nivel de micro-bloque reduce la latencia en contextos largos, lo que lo hace adecuado para bucles agénticos con historial extenso de herramientas y observaciones.
- Automatización de documentación técnica con imágenes: al ser image-text-to-text, puede procesar capturas, diagramas y texto en un mismo prompt para generar resúmenes o extraer especificaciones.
- Asistencia en código y matemáticas en pipelines de CI/CD: la calibración AWQ sobre datos STEM busca preservar el rendimiento en razonamiento técnico tras la cuantización, lo que permite integrarlo en revisión de código o generación de tests.
- Análisis de informes científicos y tablas: el pipeline multimodal y la ventana de contexto (no confirmada para los pesos abiertos) permiten procesar figuras y texto de papers en una sola pasada.
- Atención al cliente con contexto largo: conversaciones multi-turno con historial extenso, aprovechando la reducción de latencia en contextos largos que aporta QSA.
- Despliegue en infraestructura con VRAM limitada: la versión INT4 de 188,29 GB permite servir el modelo en nodos multi-GPU donde los pesos BF16 no cabrían, usando vLLM o SGLang.
- Evaluación e investigación de arquitecturas post-transformer: al ser un preview de la arquitectura de Qwen4, sirve para estudiar el comportamiento de QSA, Gated Residual y N-gram Embedding en cargas reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos AWQ INT4 ocupan 188,29 GB, por lo que se necesita al menos esa cantidad de memoria para los pesos, más overhead de KV cache y activaciones. En la práctica, un nodo de 8×GPU de 24 GB (192 GB) queda al límite; se recomienda 4×H100 80 GB o 8×A100 80 GB para margen operativo.
- GPU recomendadas: H100 80 GB, A100 80 GB, y en general GPUs con soporte para AWQ y compressed-tensors en vLLM o SGLang.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones de una sola GPU de consumo. Sería necesario un clúster multi-GPU, y no se dispone de datos sobre si la cuantización es compatible con llama.cpp u Ollama.
- Opciones de despliegue: la model card cita compatibilidad con Hugging Face Transformers, vLLM, SGLang y TokenSpeed. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4 | 78,55B (INT4, 188,29 GB) | no disponible | qwen-community-1.0 | safetensors AWQ INT4 en HF |
| Qwen/Qwen3.8-Flash-Next (base) | 78,55B | no disponible | qwen-community-1.0 | safetensors BF16 en HF |
| Qwen3.8-Flash (Qwen Cloud) | no disponible | 1M por defecto | servicio gestionado | API, con herramientas integradas |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que no es posible comparar rendimiento.

## Limitaciones y advertencias

- Modelo experimental: la model card lo describe como un preview de la arquitectura de Qwen4, no como un modelo de producción estable.
- La cuantización AWQ INT4 puede degradar la calidad respecto a los pesos BF16, especialmente en tareas de razonamiento fino; la calibración STEM/agéntica mitiga pero no elimina este riesgo.
- Licencia `qwen-community-1.0`: es una licencia comunitaria con condiciones específicas; debe revisarse el archivo LICENSE antes de cualquier uso comercial.
- No se dispone de información sobre sesgos, tasas de alucinación ni idiomas soportados.
- La longitud de contexto de los pesos abiertos no está confirmada; el dato de 1M corresponde a la versión oficial en Qwen Cloud, que puede diferir.
- El tamaño de 188,29 GB en INT4 exige infraestructura multi-GPU; no es desplegable en hardware de consumo.
- No se confirma si el modelo es MoE; la presencia de N-gram Embedding como alternativa a MoE sugiere que el escalado de parámetros no sigue el patrón denso convencional, pero no hay confirmación.

## Enlaces

- Hugging Face: https://huggingface.co/cyankiwi/Qwen3.8-Flash-Next-AWQ-INT4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Dataset de calibración: https://huggingface.co/datasets/cyankiwi/calibration
- Web de cyankiwi: https://cyan.kiwi/
- Perfil de cyankiwi en Hugging Face: https://huggingface.co/cyankiwi
- ModelScope de cyankiwi: https://www.modelscope.ai/organization/cyankiwi
