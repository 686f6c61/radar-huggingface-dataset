# lesj0610/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next-NVFP4 es una cuantización post-entrenamiento del modelo Qwen3.8-Flash-Next, desarrollada por el usuario lesj0610 mediante NVIDIA TensorRT Model Optimizer y la receta oficial NVFP4 de NVIDIA. El modelo base, creado por Alibaba Qwen, es un MoE ultra-sparse multimodal de 125B parámetros (6B activos por token) que anticipa la arquitectura de Qwen4, combinando atención Gated DeltaNet (GDN) y Qwen Sparse Attention (QSA) para comprimir el historial y realizar recuperación de largo alcance. Esta versión cuantizada reduce los pesos de los expertos enrutados a NVFP4 (4 bits en coma flotante) y la caché KV a FP8, pasando de 360 GB a 186,4 GB, lo que facilita el despliegue en entornos con restricciones de memoria.

La relevancia de este modelo radica en que ofrece una versión optimizada de una arquitectura de vanguardia, con una reducción de tamaño significativa (aproximadamente 48% menos que el BF16 original) manteniendo la precisión en los componentes críticos. Está diseñado para desarrolladores que necesitan ejecutar un modelo multimodal de gran escala con requisitos de hardware más asequibles, aunque sigue siendo un modelo pesado que requiere GPUs de alta gama con soporte FP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse híbrida: Gated DeltaNet (GDN) + Qwen Sparse Attention (QSA), con tabla n-gram, vision tower y MTP |
| Parametros totales | 119.6B (según safetensors del repo; el modelo base reporta 125B incluyendo 51B de tabla n-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits float, E2M1) para expertos enrutados; KV cache FP8 (E4M3); resto en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (cuantización modelopt) |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8-Flash-Next combina cuatro innovaciones principales: atención híbrida GDN + QSA (tres de cada cuatro capas usan Gated DeltaNet para comprimir el historial, la cuarta usa Qwen Sparse Attention para recuperación precisa de largo alcance), MoE ultra-sparse con 512 expertos por capa y 6B activos por token, una tabla n-gram de 51B parámetros que actúa como memoria externa, y hyper-connections con mezcla residual gated. El modelo incluye además un bloque MTP (multi-token prediction) y una torre de visión para entrada multimodal.

En esta versión cuantizada, solo los expertos enrutados (gate_proj, up_proj, down_proj) se cuantizan a NVFP4 con bloque de 16, mientras que la caché KV se declara FP8. El resto de componentes (atención, Gated DeltaNet, indexador QSA, expertos compartidos, routers, hyper-connections, tabla n-gram, vision tower y MTP) se mantienen en BF16. La receta de cuantización es la oficial de NVIDIA (`nvfp4_experts_only_input_scale1-kv_fp8_cast.yaml`), aplicada sin modificaciones salvo cuatro exclusiones específicas para submodulos de esta arquitectura. No se utilizó dataset de calibración; los pesos exportados son independientes de los datos.

## Capacidades

- Modelo multimodal: acepta entrada de imágenes y texto, generando texto como salida (pipeline image-text-to-text).
- Generación de texto y razonamiento: al estar basado en Qwen3.8-Flash-Next, hereda las capacidades de razonamiento, comprensión y generación de la familia Qwen, aunque no se especifican detalles concretos en la información disponible.
- Arquitectura ultra-sparse: activa solo 6B de sus 125B parámetros por token, lo que permite un throughput elevado en inferencia.
- Memoria a largo plazo: la tabla n-gram de 51B parámetros actúa como memoria externa de alta capacidad, mejorando la retención de información factual.
- Soporte de tool calling y agentes: no confirmado explícitamente en la documentación, pero es una característica habitual en los modelos Qwen recientes.
- MTP (multi-token prediction): el bloque MTP permite predecir varios tokens a la vez, acelerando la generación.

## Casos de uso

- Análisis de documentos multimodales: el modelo puede procesar imágenes junto con texto, permitiendo extraer información de informes escaneados, diagramas técnicos o capturas de pantalla. Su tabla n-gram de gran tamaño ayuda a retener datos específicos del dominio.
- Asistente de código con contexto largo: gracias a la atención híbrida GDN+QSA, puede manejar repositorios extensos, manteniendo el contexto de archivos completos y generando código coherente. La cuantización NVFP4 reduce la memoria necesaria para servir el modelo en producción.
- Generación de contenido visual: dado que acepta imágenes como entrada, puede describir imágenes, generar alt-text o crear descripciones detalladas para accesibilidad.
- Razonamiento matemático y científico: los modelos Qwen suelen tener buenas capacidades en matemáticas y ciencias; este modelo puede usarse para resolver problemas complejos con entrada multimodal (por ejemplo, ecuaciones escritas a mano).
- Búsqueda semántica en corpus grandes: la combinación de QSA y la tabla n-gram permite recuperar información relevante de documentos largos, útil para sistemas RAG.
- Experimentación con arquitecturas MoE: los investigadores pueden usar esta versión cuantizada para estudiar el comportamiento de modelos ultra-sparse sin necesidad de los 360 GB del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 186,5 GB en disco. Para inferencia, se necesitan al menos 200 GB de VRAM (pesos + overhead de activaciones y KV cache). Con cuantización adicional (por ejemplo, GGUF de menor precisión) podría reducirse, pero no hay datos al respecto.
- GPUs recomendadas: GPUs NVIDIA con soporte FP4 nativo, como las de arquitectura Blackwell (B200, RTX 5090) o Ampere/Ada con emulación. No cabe en una GPU consumer estándar (RTX 4090 tiene 24 GB); se requieren múltiples GPUs o soluciones de memoria compartida.
- Opciones de despliegue: vLLM, SGLang, TensorRT-LLM y llama.cpp (si se convierte a GGUF). La integración con TensorRT Model Optimizer sugiere compatibilidad con el ecosistema NVIDIA.
- Latencia y throughput: no disponibles. El modelo activa solo 6B parámetros por token, lo que sugiere un throughput alto en comparación con modelos densos de tamaño similar, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con alternativas. Como referencia estructural, el modelo base Qwen3.8-Flash-Next (125B-A6B) compite con otros MoE ultra-sparse como DeepSeek-V3 (671B-A37B) o Qwen3-235B-A22B, pero esta versión cuantizada es específica para entornos con restricciones de memoria. No hay información suficiente para una comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantización NVFP4 puede degradar ligeramente la precisión en tareas sensibles a los pesos, especialmente en razonamiento matemático o generación de código, aunque los componentes críticos se mantienen en BF16.
- La licencia qwen-community-1.0 es una licencia comunitaria de Qwen, no una licencia open source estándar. Debe revisarse si permite uso comercial y qué restricciones impone sobre redistribución o modificaciones.
- El modelo es muy grande (186,5 GB) y requiere hardware especializado con soporte FP4; no es adecuado para despliegues en edge o GPUs de consumo.
- No se ha publicado información sobre sesgos o alucinaciones específicas de este modelo. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en dominios poco representados en sus datos de entrenamiento.
- La tabla n-gram de 51B parámetros permanece en BF16 y ocupa 102,4 GB, lo que limita la reducción total de memoria. Esto es intencional para preservar la calidad, pero implica que el modelo no es tan ligero como cabría esperar de una cuantización 4-bit.
- El contexto máximo no está documentado en la información disponible; se recomienda verificar la documentación del modelo base antes de usarlo con ventanas largas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/lesj0610/Qwen3.8-Flash-Next-NVFP4
- Modelo base (Qwen/Qwen3.8-Flash-Next): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Página de vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Review técnica (kaitchup): https://kaitchup.substack.com/p/qwen38-flash-next-review-benchmarks
- Artículo de Unite.ai: https://www.unite.ai/qwen3-8-flash-next-previews-qwen4-architecture-with-6b-active-parameters/
