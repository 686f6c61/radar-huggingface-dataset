# FamilyOrang/Qwen3.8-Flash-Next-FP8

## Resumen

Qwen3.8-Flash-Next-FP8 es la versión cuantizada en FP8 del modelo experimental Qwen3.8-Flash-Next, publicado por FamilyOrang sobre los pesos base de Qwen (Alibaba). Se trata de un modelo causal multimodal (texto e imagen) que sirve como avance de la arquitectura que sustentará Qwen4, combinando atención híbrida, mezcla de expertos (MoE) y una innovadora incrustación de n-gramas para escalar parámetros sin disparar el coste computacional.

El modelo totaliza 180 mil millones de parámetros (125B del LM con 6B activos, más 51B de n-gram embedding y 4B de MTP), con una ventana de contexto nativa de 262.144 tokens extensible hasta 1.000.000. Su relevancia actual radica en que es la primera publicación de pesos abiertos bajo esta arquitectura y en que la cuantización FP8 con bloques de 128 reduce el peso del repositorio a 185,6 GB manteniendo, según el autor, métricas de rendimiento casi idénticas a las del modelo original.

La ficha describe tanto las capacidades del modelo base como las particularidades de esta variante cuantizada, pensada para despliegue en infraestructura propia con vLLM, SGLang o Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con encoder de visión; atención híbrida Gated DeltaNet + Qwen Sparse Attention (QSA), MoE, Gated Residual y N-gram Embedding |
| Parametros totales | 179.999.981.459 (125B LM + 51B n-gram embedding + 4B MTP) |
| Parametros activos | 6B (10 expertos enrutados + 1 compartido de 512 totales) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | FP8 con cuantización fina por bloques de 128 (esta variante); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (FP8), compatible con Transformers, vLLM, SGLang y TokenSpeed |

## Arquitectura y entrenamiento

La arquitectura se organiza en 48 capas con un layout oculto de 12 × (3 × (Gated DeltaNet → MoE) → 1 × (Qwen Sparse Attention → MoE)). La Gated DeltaNet emplea 48 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128, mientras que QSA usa 24 cabezas para Q y 2 para KV con dimensión 256 y RoPE de 64 dimensiones, con un indexador MQA de 4 cabezas de consulta y 1 cabeza de clave compartida (dimensión 128) y un presupuesto de 512 bloques o 2.048 tokens. La MoE cuenta con 512 expertos de dimensión intermedia 640, de los que se activan 10 enrutados más 1 compartido. El Gated Residual tiene 4 ramas con rango de cuello de botella 320, y la incrustación de n-gramas indexa 20 millones de bigramas/trigramas en la capa 2. La dimensión oculta es 2560 y el vocabulario de salida es 248.320 (con padding).

El entrenamiento combina preentrenamiento y postentrenamiento, con una receta que aplica Muon y AdamW a categorías específicas de pesos, elimina los warmups tradicionales de batch size y arranca directamente en el tamaño objetivo para reducir pasos de optimizador. La innovación clave es QSA, que opera a nivel de micro-bloque en lugar de seleccionar tokens individuales, recortando la latencia en contexto largo para cargas agénticas. La variante FP8 aplica cuantización por bloques de 128 sobre los pesos postentrenados; no se detalla en la información disponible si hubo RLHF o DPO explícitos.

## Capacidades

- Generación de texto y razonamiento multi-turno con contexto muy largo (hasta 262K tokens nativos).
- Comprensión de imagen y texto (pipeline image-text-to-text) gracias al encoder de visión.
- Razonamiento matemático y generación de código, según el perfil del modelo base.
- Soporte de tool calling y function calling (la versión oficial Qwen3.8-Flash incluye herramientas integradas; en esta variante no se detalla).
- Capacidades agénticas y razonamiento multi-paso, favorecidas por QSA y la ventana extendida.
- Decodificación especulativa mediante la cabeza MTP (1 capa entrenada con múltiples pasos).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 262K tokens de contexto, manteniendo coherencia en hilos largos sin truncar información previa.
- Análisis de documentos extensos con imágenes: al combinar encoder de visión y contexto largo, permite extraer información de informes, contratos o manuales con figuras y tablas en una sola pasada.
- Generación de código en producción: su naturaleza causal y su compatibilidad con vLLM/SGLang permiten integrarlo en pipelines de CI/CD para revisión, autocompletado y generación de tests.
- Agentes autónomos multi-paso: la arquitectura orientada a cargas agénticas (QSA reduce latencia en contexto largo) lo hace adecuado para bucles de planificación y ejecución de herramientas.
- Asistencia en investigación: resumen y comparación de artículos científicos con material visual, aprovechando la ventana de 1M tokens extensible.
- Procesamiento por lotes de imágenes y texto: clasificación y descripción de grandes volúmenes de pares imagen-texto en infraestructura con GPUs de 80 GB o superiores.
- Despliegue en entornos con memoria limitada: la cuantización FP8 reduce el peso a 185,6 GB, permitiendo servir el modelo en nodos multi-GPU sin recurrir a cuantizaciones de menor precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que las métricas de la versión FP8 son "casi idénticas" a las del modelo original, pero no incluye cifras concretas (MMLU, HumanEval, GSM8K u otras) en el contenido proporcionado.

## Requisitos de hardware

- VRAM estimada: aproximadamente 180 GB en FP8 para los pesos, más overhead de activaciones y KV cache; se recomienda un nodo con al menos 4× H100 80 GB o 8× A100 80 GB.
- GPU recomendadas: H100 80 GB, H200, A100 80 GB; el modelo no cabe en GPUs de consumo individuales.
- GPU de consumo: no es viable en RTX 4090 (24 GB) ni en configuraciones de 2-4 GPUs consumer sin cuantizaciones adicionales no publicadas.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y TokenSpeed (según la model card); llama.cpp y Ollama no están confirmados para este formato FP8.
- Latencia y throughput: no disponibles en la información proporcionada; QSA está diseñada para reducir la latencia en contexto largo, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 | 180B (6B activos) | 262K nativo / 1M extensible | qwen-community-1.0 | Pesos abiertos en HF |
| Qwen3.8-Flash-Next (base) | 180B (6B activos) | 262K nativo / 1M extensible | qwen-community-1.0 | Pesos abiertos en HF |
| Qwen3.8-Flash (oficial) | no disponible | 1M por defecto | no disponible | API gestionada en Qwen Cloud |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo experimental ("experimental preview") de la arquitectura Qwen4; su estabilidad en producción no está garantizada.
- Riesgo de alucinación inherente a los modelos generativos de gran tamaño; no se han publicado evaluaciones específicas de fidelidad.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- La licencia qwen-community-1.0 ("other") impone condiciones que deben revisarse antes de uso comercial; no se detallan restricciones concretas en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria de la cuantización.
- El tamaño de 185,6 GB exige infraestructura multi-GPU; no apto para entornos con recursos limitados.
- No se especifican sesgos conocidos ni limitaciones de contexto más allá de las nativas.

## Enlaces

- Hugging Face: https://huggingface.co/FamilyOrang/Qwen3.8-Flash-Next-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog oficial: https://qwen.ai/blog?id=qwen3.8-flash-next
- Informe técnico: https://github.com/QwenLM/Qwen3.8-Flash-Next/blob/main/tech_report.pdf
- Qwen Cloud (Qwen3.8-Flash): https://www.qwencloud.com/models/qwen3.8-flash
- Repositorio GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next
