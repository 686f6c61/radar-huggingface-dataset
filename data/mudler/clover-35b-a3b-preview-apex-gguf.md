# mudler/Clover-35B-A3B-Preview-APEX-GGUF

## Resumen

Clover-35B-A3B-Preview-APEX-GGUF es una colección de cuantizaciones APEX (Adaptive Precision for EXpert Models) del modelo Diffuspace/Clover-35B-A3B-Preview, publicada por mudler junto al equipo de LocalAI. El modelo base es un híbrido de difusión por bloques y Mixture-of-Experts (arquitectura `clover_moe`) con 34,7 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, lo que permite inferencia eficiente manteniendo la capacidad de un modelo de gran tamaño.

La relevancia de esta ficha de cuantización radica en dos aspectos. Primero, APEX aplica una estrategia de cuantización específica para MoE: clasifica cada tensor por su rol (experto enrutado, experto compartido, atención) y aplica un gradiente de precisión por capa, comprimiendo con más agresividad los expertos enrutados —que solo activan unos pocos expertos por token— mientras mantiene alta precisión en la atención, el experto compartido y las capas primera y última. Segundo, el modelo base es un híbrido de difusión por bloques con atención mixta lineal/completa, una arquitectura novedosa cuyo soporte en llama.cpp aún está en fase de pull request.

El repositorio ofrece nueve niveles de cuantización en formato GGUF, desde 10,58 GB (I-Micro) hasta 25,27 GB (Balanced), con mediciones de perplexity, divergencia KL y benchmarks de tareas múltiples realizados sobre un NVIDIA GB10. El estado es explícitamente de preview, con resultados de primera pasada y muestras pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrido block-diffusion MoE (`clover_moe`), 256 expertos enrutados, atención híbrida lineal/completa |
| Parametros totales | 34.661.350.848 (34,7 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 9 niveles APEX: Quality, I-Quality, Balanced, I-Balanced, Compact, I-Compact, I-Mini, I-Nano, I-Micro |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors con tensores de difusión en F32 |

## Arquitectura y entrenamiento

Clover-35B-A3B-Preview es un modelo híbrido de difusión por bloques con arquitectura MoE. Su disposición de tensores coincide con la familia Qwen3.5 MoE: 256 expertos enrutados y un esquema de atención híbrido que combina atención lineal y completa. Los tensores de difusión se mantienen en F32 incluso en las cuantizaciones, lo que sugiere que son sensibles a la pérdida de precisión. No se ha publicado información sobre los datos de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

La cuantización APEX, desarrollada por el proyecto apex-quant de LocalAI, es la innovación técnica destacable de este repositorio. APEX clasifica cada tensor según su rol en el modelo (experto enrutado, experto compartido, atención) y aplica un gradiente de precisión por capa: las capas primera y última conservan mayor precisión, las capas intermedias se comprimen con más intensidad, y el experto compartido —activo en todos los tokens— permanece en precisión alta. La justificación es que los expertos enrutados concentran la mayoría de los pesos pero solo unos pocos se activan por token, por lo que toleran menor precisión que los componentes por los que pasa todo el flujo. Las variantes con prefijo `I-` utilizan una matriz de importancia (imatrix) calibrada con datos diversos: conversación, código, razonamiento, tool-calling, trazas agénticas y Wikipedia.

## Capacidades

- Generación de texto conversacional (el repositorio está etiquetado como `conversational`).
- Razonamiento y generación por bloques mediante difusión, una alternativa a la generación autorregresiva pura.
- Compatible con cargas de tool-calling y trazas agénticas, según los datos de calibración de la imatrix (no se confirma soporte nativo de function calling).
- Eficiencia de inferencia gracias a la activación de solo ~3 B de parámetros por token sobre 34,7 B totales.
- Despliegue local en formato GGUF, con soporte en llama.cpp pendiente de fusión (PR 31306).
- No hay información disponible sobre capacidades de visión, audio ni modalidades adicionales.

## Casos de uso

- Experimentación con arquitecturas de difusión híbridas: al ser uno de los primeros MoE block-diffusion cuantizados para llama.cpp, es adecuado para investigadores que quieran evaluar el comportamiento de esta arquitectura en hardware local.
- Chatbots locales en GPU de consumo: la variante Compact (16,54 GB) cabe en GPUs de 24 GB como una RTX 3090 o 4090, permitiendo despliegues conversacionales sin servidor remoto.
- Inferencia en equipos con memoria unificada amplia: las variantes Balanced (25,27 GB) son adecuadas para dispositivos como el NVIDIA DGX Spark (122 GB de memoria unificada), donde se realizaron las mediciones.
- Prototipado de agentes con restricciones de hardware: la imatrix se calibró con trazas agénticas y de tool-calling, lo que sugiere idoneidad para pipelines de agentes locales, aunque en fase preview.
- Selección de punto de equilibrio calidad/tamaño: la tabla de nueve niveles permite elegir el tier según la VRAM disponible, con datos de divergencia KL para cuantificar la degradación respecto a BF16.
- Benchmarking de cuantizaciones MoE: los archivos y metodología APEX (disponibles en el proyecto apex-quant) sirven de referencia para comparar estrategias de cuantización en modelos de expertos.

## Benchmarks y rendimiento

Mediciones del autor con una compilación de llama.cpp del PR 31306 (head `4838ffb`) sobre un NVIDIA GB10. Perplexity y KL sobre wikitext-2 (580 chunks); las tareas múltiples usan el modo multiple-choice de llama.cpp con 400 tareas cada una (ruido de ±2 a 2,5 puntos, por lo que los seis primeros tiers no son separables en estas). Velocidad en tokens por segundo (pp512 / tg128).

| Tier | Tamaño | PPL ↓ | KL mean ↓ | HellaSwag | Winogrande | ARC | MMLU | TruthfulQA | pp512 | tg128 |
|---|---|---|---|---|---|---|---|---|---|---|
| BF16 (referencia) | 69 GB | 11.478 | — | — | — | — | — | — | — | — |
| Quality | 22,8 GB | 11.536 | 0.0853 | 71.75 | 66.00 | 52.84 | 40.96 | 36.60 | 1504 | 17.97 |
| I-Quality | 22,8 GB | 11.460 | 0.0752 | 70.50 | 68.25 | 51.51 | 40.44 | 35.74 | 1504 | 18.10 |
| Balanced | 25,3 GB | 11.360 | 0.0826 | 72.50 | 67.50 | 52.17 | 40.50 | 37.21 | 1485 | 17.75 |
| I-Balanced | 25,3 GB | 11.283 | 0.0740 | 71.75 | 66.25 | 50.50 | 40.05 | 37.09 | 1478 | 17.91 |
| Compact | 16,5 GB | 11.603 | 0.1890 | 70.25 | 68.00 | 51.51 | 39.53 | 35.37 | 1419 | 21.02 |
| I-Compact | 16,5 GB | 11.674 | 0.1583 | 69.25 | 66.00 | 52.51 | 39.60 | 35.25 | 1559 | 20.84 |
| I-Mini | 13,5 GB | 13.876 | 0.3114 | 68.50 | 64.50 | 49.16 | 38.76 | 34.88 | 1441 | 22.07 |
| I-Nano | 11,5 GB | 15.729 | 0.3990 | 66.50 | 62.75 | 45.15 | 37.66 | 32.31 | 1620 | 22.20 |
| I-Micro | 10,6 GB | 16.854 | 0.4593 | 65.00 | 58.50 | 41.47 | 36.56 | 31.46 | 922 | 22.37 |

Notas del autor: las variantes con imatrix reducen la divergencia KL en todos los tamaños donde existen ambas versiones. Balanced e I-Balanced muestran perplexity inferior a BF16 en wikitext-2, algo que el propio autor atribuye a un artefacto del texto de prueba. La divergencia KL es más alta que en MoE con atención densa de tamaño similar, incluso en los tiers mayores; al ser un híbrido de difusión, conviene comparar los tiers entre sí y no con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 10,58 GB (I-Micro) hasta 25,27 GB (Balanced), más margen para el contexto y los buffers de llama.cpp. La referencia BF16 ocupa 69 GB.
- GPU recomendadas: para las variantes Balanced y Quality, GPUs con 32 GB o más (A100, RTX 5090) o memoria unificada amplia (DGX Spark, Mac con memoria unificada). Para Compact, GPUs de consumo de 24 GB (RTX 3090, RTX 4090). Para I-Mini, I-Nano e I-Micro, GPUs de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) o 12 GB con descarga parcial a CPU.
- Cabe en GPU de consumo: sí, a partir de 24 GB con Compact, y en 16 GB con los tiers Mini/Nano/Micro.
- Opciones de despliegue: llama.cpp mediante el PR 31306 (la rama master aún no carga la arquitectura `clover_moe`); LocalAI, proyecto del mismo equipo, es un candidato natural aunque no se confirma explícitamente. No se menciona soporte en vLLM, TGI ni Ollama.
- Rendimiento medido en GB10: procesamiento de prompt (pp512) entre 922 y 1620 tokens/s; generación (tg128) entre 17,75 y 22,37 tokens/s. La generación apenas mejora por debajo de 16 GB de tamaño, y I-Micro procesa prompts más lentamente que el resto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Clover-35B-A3B-Preview-APEX-GGUF | 34,7 B | ~3 B | no disponible | Apache 2.0 | Híbrido block-diffusion MoE, GGUF APEX, requiere PR de llama.cpp |
| Qwen3-30B-A3B | 30,5 B | ~3 B | 32k (ampliable a 128k) | Apache 2.0 | MoE autorregresivo denso en atención, maduro en llama.cpp/vLLM |
| Qwen3.5 MoE (familia) | no disponible | no disponible | no disponible | no disponible | Familia cuya disposición de tensores comparte Clover, según el autor |
| Llama 3.3 70B | 70 B | 70 B (denso) | 128k | Licencia Llama 3.3 | Denso, sin activación dispersa; mayor VRAM y menor throughput por parámetro activo |

La comparación directa es limitada: al tratarse de un híbrido de difusión con KL divergente de los MoE convencionales, el propio autor recomienda no comparar sus benchmarks con otros modelos.

## Limitaciones y advertencias

- Estado preview: los resultados son una primera pasada con muestras pequeñas y ruido de ±2 a 2,5 puntos en las tareas múltiples; los seis primeros tiers no son estadísticamente separables en esos benchmarks.
- Soporte incompleto: llama.cpp master no carga estos archivos; es necesario compilar desde el PR 31306, lo que puede romperse con actualizaciones.
- Divergencia KL notablemente superior a la de MoE con atención densa de tamaño similar, incluso en los tiers de mayor calidad; la calidad de generación respecto a otros modelos no está garantizada.
- Los tensores de difusión permanecen en F32, lo que limita la compresión máxima alcanzable.
- La generación apenas gana velocidad en cuantizaciones por debajo de 16 GB, e I-Micro sufre en procesamiento de prompts, por lo que los tiers pequeños ofrecen poco beneficio práctico.
- Longitud de contexto, idiomas soportados, datos de entrenamiento y soporte de function calling: no disponible; deben verificarse en el modelo base antes de uso en producción.
- Licencia Apache 2.0: permite uso comercial sin restricciones relevantes, pero conviene revisar también la licencia del modelo base Diffuspace/Clover-35B-A3B-Preview.
- No se ha publicado información sobre sesgos ni tasas de alucinación del modelo base.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mudler/Clover-35B-A3B-Preview-APEX-GGUF
- Modelo base: https://huggingface.co/Diffuspace/Clover-35B-A3B-Preview
- Proyecto APEX (recetas y scripts): https://github.com/localai-org/apex-quant
- Pull request de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp#31306
- LocalAI: https://github.com/mudler/LocalAI
- Patrocinio del autor: https://www.patreon.com/cw/mudler | https://www.buymeacoffee.com/mudler | https://github.com/sponsors/mudler
