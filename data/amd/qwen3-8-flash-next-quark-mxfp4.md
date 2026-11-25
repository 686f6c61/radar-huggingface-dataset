# amd/Qwen3.8-Flash-Next-Quark-MXFP4

## Resumen

AMD Qwen3.8-Flash-Next-Quark-MXFP4 es un checkpoint cuantizado del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicado por AMD y optimizado para su despliegue sobre aceleradores AMD Instinct MI350 y MI355 con ROCm. El modelo original es un transformer híbrido de tipo Qwen4ExpForConditionalGeneration que combina atención completa con proyecciones de atención lineal de estilo Mamba, e incorpora una arquitectura MoE (mixture of experts) en la capa de lenguaje, además de una torre de visión para entradas de imagen y vídeo. Cuenta con aproximadamente 119.484 millones de parámetros totales y un repositorio de 182,3 GB en precisión de origen.

La aportación de esta versión de AMD no es un nuevo entrenamiento, sino una cuantización de precisión reducida realizada con AMD-Quark (v0.13): todos los expertos MoE enrutados y el experto compartido se cuantizan a OCP MXFP4 (pesos estáticos y activaciones dinámicas), mientras que el resto de componentes —atención completa, proyecciones de atención lineal, cabezas MTP, gates del router, torre de visión, mixers de hiperconexión, ruta n-gram PLE y `lm_head`— permanecen en bf16. El resultado es una reducción sustancial del peso del modelo con una recuperación de precisión muy alta respecto al original en los benchmarks publicados.

Es relevante ahora porque permite ejecutar un modelo multimodal de escala ~120B con razonamiento, código y visión sobre hardware AMD con vLLM, un stack que hasta hace poco carecía de checkpoints cuantizados de referencia para modelos frontera. La licencia es "other", con enlace a un LICENSE propio que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (transformer híbrido: atención completa + atención lineal estilo Mamba, con MoE en la capa de lenguaje y torre de visión) |
| Parametros totales | 119.484.039.059 (~119,5B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los scripts de evaluación usan hasta 131.072 tokens de generación, pero no se especifica la ventana de contexto del modelo) |
| Tipos de cuantizacion | MXFP4 (OCP) en expertos MoE enrutados y compartido; bf16 en el resto de capas |
| Idiomas soportados | en |
| Licencia | other (ver LICENSE en el repositorio) |
| Formato de pesos | safetensors |
| Entradas | Texto, imagen, vídeo |
| Salida | Texto |
| Hardware soportado | AMD MI350 / MI355 |
| ROCm | 7.2.3 |
| PyTorch | 2.12.0+git6bbd260 |
| Transformers | 5.16.1 |
| Motor de inferencia | vLLM |
| Cuantizador | AMD-Quark v0.13 |
| Tamano del repositorio | 182,3 GB |
| Descargas | 16.867 |
| Likes | 12 |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura híbrida: capas de self-attention completa conviven con proyecciones de atención lineal de inspiración Mamba (referidas en la model card como `linear_attn`), lo que reduce el coste de atención en contextos largos. La capa de lenguaje es de tipo MoE, con expertos enrutados y un experto compartido; el checkpoint incluye además una cabeza MTP (multi-token prediction), gates de router y de experto compartido, mixers de hiperconexión y una ruta n-gram denominada PLE. La torre de visión (`model.visual`) habilita entradas de imagen y vídeo.

Esta variante no ha sido reentrenada: es una cuantización post-entrenamiento realizada con AMD-Quark sobre el checkpoint original. La configuración excluye explícitamente de la cuantización `lm_head`, `*mlp.gate`, `*shared_expert_gate`, `mtp.*`, `model.visual.*`, `*hyper_connection*`, `*ple.*`, `*linear_attn.*` y `*self_attn.*`, de modo que solo los pesos y activaciones de los expertos MoE (incluido el compartido) se convierten a MXFP4. Los pesos fusionados `gate_up_proj` y `down_proj` se separan por experto con `SplitFusedExperts` antes de cuantizar. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento matemático de alta dificultad, evidenciado por los resultados en GSM8K, AIME26 y GPQA Diamond.
- Generación y razonamiento sobre código, con evaluación específica en SciCode.
- Comprensión multimodal de imagen y vídeo (entrada image-text-to-text), evaluada con MMMU Pro en modo estándar y visión.
- Seguimiento de instrucciones complejas, medido con IFBench.
- Razonamiento de largo contexto y recuperación de información, medido con AA-LCR.
- Soporte de tool calling / function calling: los comandos de despliegue de vLLM incluyen `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Modo de razonamiento explícito: el servidor se lanza con `--reasoning-parser qwen3`.
- Capacidad de decodificación multi-token gracias a la cabeza MTP presente en el checkpoint (mantenida en bf16).
- Soporte multilingüe limitado: la model card declara únicamente inglés (`en`).

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo obtiene 96,5 en GSM8K y 98,33 en AIME26 (mean@16), por lo que es adecuado para tutores automáticos, verificación de demostraciones y generación de problemas resueltos con trazas de razonamiento.
- Análisis de documentación técnica con imágenes: gracias a la torre de visión y a MMMU Pro (80,00 en modo estándar), puede procesar manuales, diagramas y capturas para extraer especificaciones o responder preguntas sobre ellos.
- Agentes de código en pipelines de CI/CD: con tool calling nativo y buen rendimiento en SciCode (48,58 en subproblem, mean@8), puede integrarse como agente que consulta repositorios, ejecuta tests y propone parches.
- Asistencia sobre vídeo e imagen en entornos industriales: la entrada de vídeo permite inspección visual automatizada, resumen de grabaciones o generación de informes descriptivos a partir de material audiovisual.
- Recuperación y síntesis sobre contextos largos: con AA-LCR en 80,63 (mean@16) y generaciones de hasta 131.072 tokens en las evaluaciones, encaja en tareas de análisis de corpus extensos, auditoría documental o resumen de expedientes.
- Despliegue de un asistente conversacional de altas prestaciones en infraestructura AMD: al estar cuantizado a MXFP4 y validado con vLLM sobre MI350/MI355, permite servir un modelo de ~120B con menor huella de memoria que la versión bf16 en clústeres con ROCm.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir la pérdida de precisión de MXFP4 frente a bf16 en modelos MoE multimodales, con recuperaciones publicadas entre el 98,75 % y el 102,71 % según benchmark.

## Benchmarks y rendimiento

| Benchmark | Qwen3.8-Flash-Next (bf16) | Quark-MXFP4 (este modelo) | Recuperación |
|---|---|---|---|
| GSM8K (5-shot) | 96,8 | 96,5 | 99,7 % |
| GPQA Diamond (mean@8) | 91,67 | 91,67 | 100,00 % |
| AIME26 (mean@16) | 99,17 | 98,33 | 99,15 % |
| MMMU Pro, standard (mean@1) | 79,65 | 80,00 | 100,44 % |
| MMMU Pro, vision (mean@1) | 78,38 | 77,40 | 98,75 % |
| SciCode, subproblem (mean@8) | 49,01 | 48,58 | 99,12 % |
| AA-LCR (mean@16) | 78,50 | 80,63 | 102,71 % |
| IFBench (mean@5) | 83,27 | 82,67 | 99,28 % |

Evaluación realizada con vLLM, EvalScope 1.14.1 y lm-evaluation-harness. Para SciCode se usó la imagen de sandbox `scicode-benchmark:7687150b169df5091c158abb`. Los resultados pueden variar entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio ocupa 182,3 GB, lo que da una cota inferior del espacio en disco necesario; en memoria, los expertos MoE en MXFP4 (4 bits) reducen aproximadamente a la mitad el peso de esas capas frente a bf16, mientras que atención, torre de visión, `lm_head` y el resto de componentes siguen en bf16.
- GPU soportadas oficialmente: AMD Instinct MI350 y MI355. La receta de vLLM se ejecuta con `--tensor-parallel-size 2`, es decir, dos aceleradores como mínimo en la configuración validada.
- GPU de consumo: no hay soporte declarado. El modelo no cabe en GPU consumer actuales por tamaño y por dependencia de ROCm 7.2.3 y del stack AITER en hardware Instinct.
- Software: ROCm 7.2.3, PyTorch 2.12.0+git6bbd260, Transformers 5.16.1, vLLM (imagen `vllm/vllm-openai-rocm:nightly-83c078d955cd6e0c63d3b12abe669c8de936a370`), AMD-Quark v0.13 para la cuantización. Sistema operativo Linux.
- Opciones de despliegue: vLLM con frontend Rust (`VLLM_USE_RUST_FRONTEND=1`), AITER habilitado (`VLLM_ROCM_USE_AITER=1`, `VLLM_ROCM_USE_AITER_FUSION_SHARED_EXPERTS=1`), backend de prefill `aiter_flydsl`, `--gpu-memory-utilization 0.90`, `--max-num-seqs 256` y `--enable-prefix-caching`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La configuración de referencia usa 256 secuencias máximas simultáneas y caché de prefijos, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Hardware objetivo | Formato |
|---|---|---|---|---|---|
| amd/Qwen3.8-Flash-Next-Quark-MXFP4 | ~119,5B | no disponible | other | AMD MI350 / MI355 | safetensors MXFP4 + bf16 |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | safetensors bf16 |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar de forma fiable esta variante con su modelo base. No se dispone de datos sobre alternativas de otros fabricantes con parámetros, contexto o licencia verificables en esta ficha.

## Limitaciones y advertencias

- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otras lenguas no está documentado.
- Licencia "other": es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial o redistribución; no se especifican términos en la información disponible.
- Dependencia de hardware: el checkpoint está validado exclusivamente sobre AMD MI350/MI355 con ROCm 7.2.3; no hay garantías de funcionamiento en otras arquitecturas ni con versiones distintas del stack.
- Cuantización agresiva en MoE: aunque la recuperación media es alta, MMMU Pro en modo visión cae al 98,75 % y SciCode al 99,12 %; en dominios sensibles a la precisión numérica conviene validar contra el modelo bf16.
- Riesgo de alucinación: no se documentan tasas de alucinación ni evaluaciones de factualidad; los benchmarks publicados son de razonamiento, código y multimodalidad, no de veracidad.
- Contexto: la longitud de contexto del modelo no se declara; los 131.072 tokens que aparecen en los scripts son límites de generación de la evaluación, no la ventana del modelo.
- Parámetros activos: al ser MoE, el coste de cómputo real depende del número de expertos activados, dato que no se proporciona.
- Reproducibilidad: la propia model card advierte de que los resultados pueden variar entre ejecuciones; las evaluaciones con mean@8 y mean@16 implican múltiples muestras y no son directamente comparables con evaluaciones de una sola pasada.
- Producción: el uso de imágenes nightly de vLLM y de variables de entorno específicas de AITER sugiere que el soporte puede ser inestable entre versiones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4/blob/main/LICENSE
- Documentación de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Documentación de vLLM: https://docs.vllm.ai/en/latest/
- Receta de vLLM para Qwen3.8-Flash-Next en MI355X: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next?hardware=mi355x&variant=bf16&frontend=rust
- EvalScope: https://evalscope.readthedocs.io/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
