# Inferact/Qwen3.8-Flash-Next-NVFP4

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje multimodal de código abierto desarrollado por el equipo de Qwen (Alibaba), presentado como una vista previa experimental de la arquitectura que sustentará Qwen4. El modelo combina una arquitectura híbrida de atención con Gated DeltaNet y Qwen Sparse Attention (QSA), junto con n-gram embedding y un esquema de residual gated, con el objetivo de escalar la capacidad del modelo manteniendo una eficiencia computacional alta. Es un modelo de tipo MoE ultra-disperso con 125B parámetros totales y 6B activos por token, más una tabla de embeddings de n-gramas de 51B y un módulo MTP de 4B.

El repositorio Inferact/Qwen3.8-Flash-Next-NVFP4 contiene los pesos del modelo cuantizados en formato NVFP4 (punto flotante de 4 bits de NVIDIA), lo que reduce significativamente el tamaño en disco y los requisitos de VRAM en comparación con los pesos en BF16. El modelo soporta una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.000.000, y acepta entradas tanto de texto como de imagen. La licencia es qwen-community-1.0, que permite uso comercial con condiciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida: Gated DeltaNet + Qwen Sparse Attention (QSA) |
| Parametros totales | 125B (6B activos + 51B n-gram embedding + 4B MTP); en safetensors: 118.343.712.659 |
| Parametros activos | 6B |
| Longitud de contexto | 262.144 nativo, extensible hasta 1.000.000 |
| Tipos de cuantizacion | NVFP4 (4-bit floating point de NVIDIA) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (compatible con transformers, vLLM, SGLang, TokenSpeed) |

## Arquitectura y entrenamiento

Qwen3.8-Flash-Next introduce varias innovaciones arquitectónicas clave. La atención es híbrida: tres de cada cuatro capas usan Gated DeltaNet, una atención lineal que comprime el historial, y la cuarta capa usa Qwen Sparse Attention (QSA), que opera a nivel de micro-bloques en lugar de tokens individuales, reduciendo la latencia en contextos largos. El modelo incorpora además Gated Residual, que modula el flujo de información a través de ramas residuales ampliadas con puertas de lectura dependientes de datos y puertas de escritura escalares por rama, mejorando la expresividad sin perder estabilidad en el entrenamiento. La capa de embedding se escala mediante n-gramas (bigramas y trigramas en la capa 2), indexando 20.000.000 de entradas, lo que permite escalar parámetros de forma más eficiente que un MoE. El entrenamiento usa una receta personalizada con optimizadores Muon y AdamW aplicados a categorías específicas de pesos, eliminando el calentamiento de batch size y partiendo directamente del tamaño objetivo, lo que reduce el número de pasos de optimizador.

El modelo se entrenó en dos etapas: pre-entrenamiento y post-entrenamiento, con un encoder de visión para procesar imágenes. La configuración de capas es de 48 capas, con un layout de 12 × (3 × (Gated DeltaNet → MoE) → 1 × (QSA → MoE)). El MoE tiene 512 expertos, de los que se activan 10 enrutados más 1 compartido, con dimensión intermedia de 640. El modelo incluye un módulo MTP (Multi-Token Prediction) de 1 capa entrenado con multi-step.

## Capacidades

- Generación de texto y razonamiento con contexto largo (262K nativo, hasta 1M).
- Comprensión de imágenes (pipeline image-text-to-text), aunque no se especifica si admite vídeo o audio.
- Razonamiento avanzado y resolución de problemas matemáticos y de código.
- Soporte de tool calling y function calling (el modelo base Qwen3.8-Flash-Next lo incluye, según la documentación de Qwen).
- Capacidad para tareas de agente con multi-step reasoning y uso de herramientas externas.
- Multilingüismo: no se detallan los idiomas soportados en la información proporcionada.
- Eficiencia en inferencia de contexto largo gracias a la atención híbrida Gated DeltaNet + QSA.

## Casos de uso

- Agentes autónomos con contexto largo: el modelo puede mantener conversaciones multi-turno de hasta 1M tokens, ideal para agentes que procesan documentos extensos, historiales de chat o código completo de un repositorio.
- Análisis de documentos multimodales: al aceptar imágenes, permite extraer información de capturas, diagramas, gráficos o documentos escaneados y razonar sobre ellos en una misma conversación.
- Generación de código en producción: con soporte de tool calling y razonamiento matemático, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o autocompletado avanzado.
- Asistente de investigación científica: para procesar y resumir papers largos, comparar resultados y razonar sobre tablas y figuras, gracias a su ventana de contexto y capacidad multimodal.
- Automatización de atención al cliente: puede gestionar conversaciones complejas con historial extenso, recuperando información de la base de conocimiento y llamando a APIs externas mediante function calling.
- Análisis de datos y BI: dado un dataset en texto o capturas de pantalla de dashboards, puede generar consultas SQL, explicar tendencias y producir informes resumidos.

## Benchmarks y rendimiento

La model card del repositorio incluye una tabla de benchmarks para la sección "Language", pero el contenido HTML se ha proporcionado truncado y no se han podido extraer los valores numéricos. No se han publicado resultados de benchmarks en la información disponible de forma completa.

## Requisitos de hardware

- VRAM estimada: al estar cuantizado en NVFP4, el modelo ocupa aproximadamente 182.8 GB en disco, lo que sugiere un peso de pesos de unos 118B parámetros en FP4. Para inferencia, se recomienda al menos 128 GB de VRAM en GPUs NVIDIA con soporte FP4 (H100, H200, B200, RTX 4090 no soporta FP4 de forma nativa para NVFP4; se requieren arquitecturas Hopper o Blackwell).
- GPU recomendadas: NVIDIA H100 (80GB) o A100 (80GB) en configuración multi-GPU; también GPUs Blackwell como B200.
- Opciones de despliegue: compatible con vLLM, SGLang, TokenSpeed y transformers. También puede ejecutarse en CPU con memoria unificada (según unsloth, requiere ~78GB de RAM/unified memory sin VRAM), aunque con latencia mucho mayor.
- Latencia: no hay datos publicados de latencia para esta cuantización específica. El modelo base en BF16 tiene un throughput de aproximadamente 50-70 tokens/s por GPU H100, pero la cuantización FP4 puede reducir la memoria y mejorar el throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B n-gram | 6B | 262K (1M ext.) | qwen-community-1.0 | Open weights |
| Qwen3.8-Flash-NVFP4 (este) | 118B (cuantizado) | 6B | 262K (1M ext.) | qwen-community-1.0 | Open weights |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | Open weights |
| Llama 3.1 405B | 405B | 405B | 128K | Llama 3.1 | Open weights |

No se dispone de datos de benchmark comparables para esta cuantización específica. La comparativa se centra en características de arquitectura y disponibilidad.

## Limitaciones y advertencias

- Modelo experimental: Qwen3.8-Flash-Next es una vista previa de la arquitectura Qwen4 y puede no ser estable para producción.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o no verificada, especialmente en tareas de razonamiento largo.
- Sesgos: no se han publicado análisis de sesgos o evaluación de seguridad para esta versión.
- Licencia: qwen-community-1.0 no es Apache 2.0; es una licencia de Qwen con condiciones de uso comercial específicas. Se debe revisar el texto completo de la licencia antes de uso comercial.
- Cuantización NVFP4: requiere hardware NVIDIA compatible con FP4 (Hopper/Blackwell); no es compatible con GPUs antiguas ni con CUDA en versiones anteriores. El formato puede perder precisión frente a BF16.
- Contexto de 1M tokens: la extensión del contexto más allá de 262K puede degradar la calidad de generación y requiere técnicas de interpolación de RoPE; no se garantiza en este repositorio.
- No se detallan los idiomas soportados en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8-Flash-Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Receta de vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
