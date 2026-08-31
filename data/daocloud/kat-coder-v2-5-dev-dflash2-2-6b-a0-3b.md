# DaoCloud/KAT-Coder-V2.5-Dev-DFlash2-2.6B-A0.3B

## Resumen

KAT-Coder-V2.5-Dev-DFlash2-2.6B-A0.3B es un modelo de borrador (drafter) diseñado para decodificación especulativa, desarrollado por DaoCloud. Su función es acelerar la inferencia del modelo objetivo Kwaipilot/KAT-Coder-V2.5-Dev, un modelo MoE de 35B parámetros totales y 3B activos orientado a tareas de codificación agéntica. Este drafter aplica una estructura MoE dispersa, con aproximadamente 2.6B parámetros totales y 0.3B activados por token, siguiendo precedentes como DeepSeek-V3 MTP o DeepSeek-V4-Flash DSpark.

El modelo se publica bajo licencia Apache 2.0, en formato safetensors, y está pensado para integrarse en vLLM mediante el método de especulación DFlash. No es un modelo de lenguaje autónomo: requiere emparejarse con KAT-Coder-V2.5-Dev (o una versión cuantizada compatible) para funcionar. Su relevancia radica en reducir la latencia de generación en entornos de producción donde el modelo objetivo es grande y costoso de ejecutar, aprovechando la dispersión de expertos tanto en el drafter como en el modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE DFlash2 drafter (3 capas de borrador, 256 expertos enrutados top-8, 1 experto compartido) |
| Parametros totales | 2.638.551.808 |
| Parametros activos | 298.130.176 (aproximadamente 0.3B por token) |
| Longitud de contexto | 262.144 (nativa) |
| Tipos de cuantizacion | no disponible (el checkpoint se publica en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un drafter MoE con 3 capas de borrador, hidden size 2048, 256 expertos enrutados con top-8 routing y un experto compartido. La atención usa 32 cabezas Q y 4 cabezas KV con dimensión de cabeza 128, ventana deslizante de 2048 y RoPE theta 1e7. Incluye convolución dinámica (kernel 2, grupo 16) y un selector de candidatos con rango 256 y top-k 16. El bloque de borrador genera 7 tokens por paso de verificación, con `sample_from_anchor=true`. El vocabulario de borrador es de 248.320 tokens.

No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El modelo se basa en Kwaipilot/KAT-Coder-V2.5-Dev, que a su vez deriva de Qwen3.6-35B-A3B, pero los detalles del entrenamiento del drafter no se han publicado.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: produce hasta 7 tokens por paso de verificación, que el modelo objetivo valida y acepta o rechaza.
- Aceleración de inferencia: reduce la latencia de generación del modelo KAT-Coder-V2.5-Dev en modos thinking y non-thinking, según los resultados de Accepted Length publicados.
- Integración con vLLM: requiere una build específica con los PRs #54154 y #54475 para soportar el layout de consulta DFlash y MoE DFlash2.
- Compatibilidad con modelos cuantizados: puede emparejarse con versiones cuantizadas de KAT-Coder-V2.5-Dev, aunque no se especifican los formatos soportados.
- No es un modelo de generación autónoma: no genera texto final por sí mismo, solo actúa como acelerador del modelo objetivo.

## Casos de uso

- Despliegue de servicios de codificación con baja latencia: al emparejar este drafter con KAT-Coder-V2.5-Dev en vLLM, se reduce el tiempo de respuesta en tareas de generación de código, lo que mejora la experiencia en asistentes de programación en tiempo real.
- Integración en pipelines de CI/CD: la aceleración de inferencia permite ejecutar pruebas de generación de código o revisión automática de pull requests con menor coste computacional por solicitud.
- Entornos con restricciones de memoria: al activar solo 0.3B parámetros por token, el drafter puede ejecutarse en sistemas con VRAM limitada, siempre que el modelo objetivo quepa o se use con offloading de expertos.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de drafters MoE en modelos grandes, comparando con MTP de DeepSeek-V3 o DSpark de DeepSeek-V4-Flash.
- Optimización de costes en inferencia a escala: en datacenters con paralelismo de expertos, el drafter reduce el número de pasos de verificación y, por tanto, el uso de recursos por token generado.
- Evaluación de técnicas de verificación adaptativa: el modelo está diseñado para futuras mejoras en verificación adaptativa, lo que lo hace útil para experimentos en este ámbito.

## Benchmarks y rendimiento

La model card publica la métrica Accepted Length (AL) para varios benchmarks, calculada como `1 + accepted_tokens / draft_calls`. Esta métrica indica cuántos tokens del drafter son aceptados por el modelo objetivo en promedio por llamada de verificación. Valores más altos implican mayor eficiencia de la decodificación especulativa. No se reportan métricas de calidad (MMLU, HumanEval, etc.) porque el drafter no es un modelo de generación final.

| Benchmark | Muestras | AL (thinking) | AL (non-thinking) |
|---|---|---|---|
| AA-LCR | 100 | 2.8870 | 3.3894 |
| AIME26 | 30 | 2.8959 | 4.1591 |
| GSM8K | 1.319 | 4.2453 | 5.2930 |
| HumanEval | 164 | 4.0568 | 5.9836 |
| LiveCodeBench | 1.055 | 2.7090 | 3.5688 |
| LongBench-v2 | 402 | 2.4484 | 2.8255 |
| MATH500 | 500 | 3.6183 | 4.7679 |
| MBPP | 257 | 3.6543 | 4.5800 |
| MT-Bench | 80 | 2.5998 | 2.8009 |
| SWE-bench Pro | 731 | 3.1425 | 3.4428 |
| SpeedBench / coding | 80 | 3.3456 | 4.0887 |
| SpeedBench / humanities | 80 | 2.2735 | 2.7807 |
| SpeedBench / math | 80 | 2.4900 | 3.3639 |
| SpeedBench / multilingual | 80 | 3.0767 | 3.0240 |
| SpeedBench / qa | 80 | 2.5138 | 2.4313 |
| SpeedBench / rag | 80 | 3.3953 | 3.5579 |
| SpeedBench / reasoning | 80 | 2.8214 | 3.1751 |
| SpeedBench / roleplay | 80 | 1.8487 | 1.8848 |
| SpeedBench / stem | 80 | 2.3774 | 3.0061 |
| SpeedBench / summarization | 80 | 3.0177 | 2.6967 |
| SpeedBench / writing | 80 | 2.2223 | 2.3711 |

Las condiciones de medición: vLLM, NVIDIA H200, TP1, concurrencia 1, target en BF16, 7 tokens de borrador por paso, contexto nativo 262.144, max new tokens 4.096. Los modos thinking y non-thinking usan parámetros de muestreo distintos.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 5.3 GB en BF16 (2.6B parámetros × 2 bytes). Sin embargo, al ejecutarse junto al modelo objetivo KAT-Coder-V2.5-Dev (35B totales, 3B activos), la VRAM total depende del modelo principal y de su cuantización.
- GPU recomendada: NVIDIA H200 (usada en las pruebas), aunque cualquier GPU con suficiente VRAM para el modelo objetivo y el drafter puede servir. Para el drafter solo, una GPU consumer con 8 GB o más sería suficiente, pero el modelo objetivo requiere más.
- En consumer GPU: el drafter cabe en GPUs como RTX 4090 (24 GB) o RTX 3090 (24 GB) si el modelo objetivo se cuantiza adecuadamente, pero no hay datos oficiales de cuantización para el drafter.
- Opciones de despliegue: vLLM con los PRs #54154 y #54475. No se mencionan otros motores (llama.cpp, Ollama, TGI) en la documentación.
- Latencia y throughput: no se publican valores absolutos de tokens por segundo; solo la métrica Accepted Length, que indica la eficiencia relativa de la decodificación especulativa.

## Comparativa con modelos similares

El drafter se compara con otros sistemas de decodificación especulativa basados en MoE, aunque no hay datos públicos de rendimiento directo de estos competidores en las mismas condiciones.

| Modelo | Tipo | Parametros totales | Parametros activos | Contexto | Licencia |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev-DFlash2-2.6B-A0.3B | Drafter MoE DFlash2 | 2.6B | 0.3B | 262.144 | Apache 2.0 |
| DeepSeek-V3 MTP | Drafter (multi-token prediction) | no disponible | no disponible | no disponible | no disponible |
| DeepSeek-V4-Flash DSpark | Drafter MoE | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente sobre los drafters de DeepSeek para una comparación cuantitativa. El modelo objetivo KAT-Coder-V2.5-Dev (35B totales, 3B activos) es el componente principal; este drafter es un complemento.

## Limitaciones y advertencias

- No es un modelo de lenguaje autónomo: no puede generar texto por sí mismo. Debe emparejarse con KAT-Coder-V2.5-Dev o un modelo compatible.
- Requiere una build específica de vLLM con los PRs #54154 y #54475; sin ellos, el modelo no funciona. Esto limita su portabilidad a otros motores de inferencia.
- No se han publicado datos sobre sesgos, alucinaciones o comportamiento en idiomas distintos del inglés. Al ser un drafter, estos riesgos recaen en el modelo objetivo, no en el drafter.
- La licencia Apache 2.0 permite uso comercial, pero el modelo objetivo KAT-Coder-V2.5-Dev también debe cumplir su propia licencia (Apache 2.0 según la búsqueda web).
- El contexto nativo de 262.144 tokens es el del modelo objetivo; el drafter no gestiona contexto por sí mismo.
- No hay información sobre cuantización del drafter; solo se publica el checkpoint BF16. Si se necesita reducir VRAM, habrá que experimentar con cuantización propia, sin garantías de compatibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DaoCloud/KAT-Coder-V2.5-Dev-DFlash2-2.6B-A0.3B
- Modelo base KAT-Coder-V2.5-Dev: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- vLLM PR #54154 (sample_from_anchor): https://github.com/vllm-project/vllm/pull/54154
- vLLM PR #54475 (MoE DFlash2): https://github.com/vllm-project/vllm/pull/54475
- Artículo sobre KAT-Coder-V2.5-Dev (HackerNoon): https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
- Página del proyecto KAT-Coder: https://kwaipilot.github.io/KAT-Coder/
