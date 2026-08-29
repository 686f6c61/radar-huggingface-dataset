# senfu/Qwen3.8-Flash-Next-NVFP4

## Resumen

`senfu/Qwen3.8-Flash-Next-NVFP4` es un checkpoint de cuantización mixta derivado de `RadixArk/Qwen3.8-Flash-Next-NVFP4`, que a su vez cuantiza el modelo multimodal `Qwen/Qwen3.8-Flash-Next` de Alibaba. El objetivo principal es reducir el ancho de banda de memoria consumido durante la decodificación autoreresiva, especialmente en escenarios de baja concurrencia (batch 1), donde el camino denso (atención, proyecciones Gated DeltaNet y expertos compartidos) domina el tráfico de pesos. Frente al checkpoint base, este reduce los bytes de pesos leídos por token generado de 9,95 GB a 6,13 GB (-38,4%), manteniendo intactos los resultados en GSM8K (97,27) y AIME26 majority@8 (100).

El modelo base es un MoE ultra-sparse de 125B parámetros totales (incluyendo una tabla de n-gramas de 51B), con 6B parámetros activos por token, arquitectura híbrida GDN + QSA (Gated DeltaNet en tres de cada cuatro capas y Qwen Sparse Attention en la cuarta) y una ventana de contexto de 262.144 tokens. Este checkpoint concreto requantiza el camino denso a FP8 W8A8 (estático por tensor, con escalas de activación calibradas) y el LM head a NVFP4 W4A16, dejando los expertos enrutados y las tablas PLE byte-idénticos al base. Está diseñado para servir en un único DGX Spark, aunque las mediciones publicadas se realizaron en 2×B200.

La relevancia actual radica en que permite ejecutar un modelo de razonamiento de última generación en hardware de memoria unificada limitada, reduciendo la presión sobre el ancho de banda sin sacrificar calidad en las tareas evaluadas. El checkpoint ocupa 131,4 GB (frente a 135,2 GB del base) y requiere SGLang con un pull request específico para su arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (GDN + QSA, MoE ultra-sparse) |
| Parametros totales | 119.284.154.259 (según safetensors; el modelo base declara 125B incluyendo 51B de tabla de n-gramas) |
| Parametros activos | 6B (según documentación del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | NVFP4 (expertos enrutados y LM head), FP8 W8A8 (camino denso), FP8 E4M3 (tablas PLE) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | safetensors (cuantización ModelOpt MIXED_PRECISION, servido con SGLang) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` combina dos mecanismos de atención: Gated DeltaNet (GDN) en 36 de las 48 capas, que comprime el historial de forma recurrente, y Qwen Sparse Attention (QSA) en las 12 restantes, para recuperación precisa de contexto largo. La capa de MoE contiene 512 expertos enrutados (con top-10 activos por token), 48 expertos compartidos y una tabla de n-gramas (PLE) de 51B parámetros que actúa como memoria externa. El modelo es multimodal (image-text-to-text) y fue entrenado por Qwen con técnicas de optimización propias.

Este checkpoint no es un entrenamiento nuevo, sino una cuantización post-entrenamiento. El checkpoint base de RadixArk ya había cuantizado los expertos enrutados a NVFP4 W4A4 y las tablas PLE a FP8 E4M3, dejando el camino denso en BF16. `senfu/Qwen3.8-Flash-Next-NVFP4` va un paso más allá: requantiza las proyecciones del camino denso (GDN `in_proj_qkv`, `in_proj_z`, `out_proj`; QSA `q/k/v/o_proj`; expertos compartidos `gate/up/down_proj`) a FP8 W8A8 con escalas de activación estáticas calibradas a partir de activaciones capturadas en servido real, y el LM head a NVFP4 W4A16 (solo pesos, sin escala de activación). En total, 301 tensores son requantizados y 1.562 permanecen byte-idénticos al base. No se aplicaron técnicas de RLHF o DPO en este proceso.

## Capacidades

- Generación de texto y razonamiento matemático: mantiene un 97,27 en GSM8K y 100 en AIME26 majority@8, lo que indica una capacidad sólida para problemas aritméticos y de competición.
- Razonamiento de contexto largo: con 262.144 tokens de ventana y atención sparse, puede procesar documentos extensos y mantener coherencia a lo largo de la conversación.
- Multimodalidad: el pipeline declarado es `image-text-to-text`, aunque la model card no detalla las capacidades de visión específicas de este checkpoint.
- Eficiencia en decode: la cuantización del camino denso reduce el tráfico de pesos en un 38,4% a baja concurrencia, lo que permite mayor throughput en hardware con ancho de banda limitado.
- Compatibilidad con SGLang: requiere el PR #36497 de SGLang, que añade soporte para la arquitectura `Qwen4ExpForConditionalGeneration` y la cuantización mixta ModelOpt.
- No se documentan capacidades explícitas de tool calling, agentes o modo thinking en la información disponible.

## Casos de uso

- Servicio de razonamiento matemático en un solo DGX Spark: el checkpoint está diseñado para este hardware, donde la tabla PLE se transmite desde SSD y el camino denso cuantizado reduce la presión sobre el ancho de banda. Un caso típico sería un asistente de resolución de problemas de competición (AIME, GSM8K) en un entorno de laboratorio o educativo.
- Inferencia de baja concurrencia con contexto largo: en aplicaciones como análisis de documentos legales o científicos, donde se procesan secuencias de hasta 262K tokens y la concurrencia es baja (batch 1), la reducción de 9,95 a 6,13 GB/token en decode permite respuestas más rápidas sin degradar la calidad.
- Despliegue en estaciones de trabajo con memoria unificada: al ocupar 131,4 GB, puede caber en sistemas como DGX Spark (128 GB unificados) o similares, habilitando inferencia local de un modelo de 125B sin necesidad de un clúster multi-GPU.
- Evaluación de modelos cuantizados: sirve como referencia para estudiar el impacto de FP8 W8A8 en el camino denso de arquitecturas híbridas GDN+QSA, comparando con el base BF16 y con el checkpoint de RadixArk.
- Generación de texto con requisitos de latencia estrictos: en aplicaciones de chat o generación en tiempo real donde el decode es el cuello de botella, la reducción de bytes leídos por token se traduce en menor latencia por paso.
- Procesamiento de imágenes con texto (pipeline multimodal): aunque no se detallan las capacidades de visión, el pipeline `image-text-to-text` sugiere que puede usarse para tareas como captioning o VQA, siempre que se verifique el comportamiento real.

## Benchmarks y rendimiento

La model card publica los siguientes resultados, medidos en SGLang con TP2 sobre 2×B200, siguiendo los protocolos del modelo base:

| Evaluacion | Base (publicado) | Este checkpoint |
|---|---|---|
| GSM8K | 97,27 | 97,27 |
| AIME26 pass@1 | 98,75 | 97,50 |
| AIME26 majority@8 | 100 | 100 |
| AIME26 stop rate | 99,17 | 99,17 |

Además, se reporta el tráfico de pesos en decode a baja concurrencia (batch 1, top-10 de 512 expertos activos):

| Metrica | Base | Este checkpoint |
|---|---:|---:|
| Bytes de pesos leidos por token | 9,95 GB | 6,13 GB (-38,4%) |

No se proporcionan métricas de latencia o throughput en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 131,4 GB en disco, por lo que se necesita al menos esa cantidad de memoria para cargar los pesos. En la práctica, con SGLang y memoria estática al 80%, se requiere un sistema con memoria unificada o VRAM suficiente (por ejemplo, DGX Spark con 128 GB, aunque el modelo supera ligeramente esa cifra; las pruebas se realizaron en 2×B200 con 2×192 GB).
- GPU recomendadas: 2×B200 (usadas en las mediciones) o un DGX Spark (diseño objetivo). No se indica compatibilidad con GPUs de consumo como RTX 4090, dado el tamaño del modelo.
- Opciones de despliegue: SGLang con el PR #36497 (no está en mainline). No se menciona soporte para vLLM, llama.cpp u Ollama para este checkpoint específico.
- Latencia y throughput: no se publican números concretos; solo se reporta la reducción de tráfico de pesos en decode.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | GSM8K | AIME26 pass@1 | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B (incl. 51B n-gramas) | 6B | 262K | BF16 | 97,27 | 98,75 | Qwen Community 1.0 |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | 125B | 6B | 262K | NVFP4 (expertos) + BF16 (denso) | 97,27 | 98,75 | Qwen Community 1.0 |
| senfu/Qwen3.8-Flash-Next-NVFP4 | 119,3B (safetensors) | 6B | 262K | NVFP4 + FP8 W8A8 | 97,27 | 97,50 | Qwen Community 1.0 |

La comparativa muestra que este checkpoint sacrifica 1,25 puntos en AIME26 pass@1 respecto al base, pero mantiene GSM8K y majority@8, a cambio de una reducción del 38% en tráfico de pesos en decode. No se dispone de datos de otros modelos comparables (por ejemplo, DeepSeek-V3 o Llama 4) en la información proporcionada.

## Limitaciones y advertencias

- La licencia Qwen Community 1.0 permite obras derivadas, pero exige que la licencia y el aviso de copyright viajen con ellas. Operar un negocio de Model-as-a-Service o AI Work Assistant requiere un acuerdo separado con Qwen.
- La cuantización FP8 introduce una ligera degradación en AIME26 pass@1 (de 98,75 a 97,50), aunque majority@8 se mantiene en 100. Para aplicaciones donde la precisión exacta es crítica, conviene evaluar el impacto.
- El modelo requiere SGLang con un PR específico (no en mainline), lo que complica el despliegue en entornos de producción estandarizados.
- No se documentan los idiomas soportados ni posibles sesgos. Al ser un modelo derivado de Qwen, es probable que herede las capacidades multilingües del base, pero no hay confirmación en la model card.
- El tamaño del checkpoint (131,4 GB) limita el hardware a sistemas con memoria unificada de al menos esa capacidad; no es viable en GPUs de consumo convencionales.
- La calibración de escalas de activación se realizó con datos de servido real, pero no se especifica el conjunto de calibración ni su representatividad, lo que podría afectar a la precisión en dominios fuera de distribución.
- No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Enlaces

- Repositorio HuggingFace del checkpoint: https://huggingface.co/senfu/Qwen3.8-Flash-Next-NVFP4
- Checkpoint base (RadixArk): https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Modelo original (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Pull request de SGLang para soporte de la arquitectura: https://github.com/sgl-project/sglang/pull/36497
- Análisis técnico de Qwen3.8 Flash Next (Kaitchup): https://kaitchup.substack.com/p/qwen38-flash-next-review-benchmarks
- Recetas de vLLM para el modelo base: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
