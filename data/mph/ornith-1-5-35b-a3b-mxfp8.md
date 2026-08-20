# mph/ornith-1.5-35b-a3b-mxfp8

## Resumen

Ornith-1.5-35B-A3B-MXFP8 es una versión cuantizada en MXFP8 del modelo vision-language de código abierto ornith-ai/Ornith-1.5-35B-A3B, desarrollada por el usuario mph mediante TorchAO. El modelo base pertenece a la familia Ornith-1.5 de Ornith AI, que extiende el concepto de self-scaffolding hacia un bucle completo de auto-mejora. Es un modelo de mezcla de expertos (MoE) de aproximadamente 35 mil millones de parámetros totales que activa solo unos 3 mil millones por token, lo que le permite ofrecer un rendimiento cercano a modelos densos mucho más grandes con un coste computacional reducido.

La cuantización MXFP8 reduce el peso del checkpoint de unos 70 GB en bfloat16 a aproximadamente 37 GB en disco, manteniendo en bfloat16 los componentes de visión, la cabeza de lenguaje, las proyecciones fusionadas de Gated DeltaNet y los routers MoE. El resultado es un modelo multimodal que admite entrada de imagen y texto, con modo de razonamiento explícito (bloques de pensamiento) y una ventana de contexto de hasta 256K tokens. Su relevancia actual reside en que ofrece capacidades de agente y coding de nivel superior a su competidor directo Qwen 3.6-35B, con una licencia MIT que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language híbrida (Qwen3.5-MoE) con Gated DeltaNet y visión ViT + merger |
| Parametros totales | 35.107.181.936 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256K tokens (recomendado 2× 80GB VRAM) |
| Tipos de cuantizacion | MXFP8 (float8_e4m3fn, block size 32); variante NVFP4 disponible para DGX Spark |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (torchao-flattened, MXTensor qdata/scale + metadata) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE de 35B parámetros con aproximadamente 3B activos por token, basado en la arquitectura Qwen3.5-MoE. La variante cuantizada aquí descrita mantiene el backbone de texto en MXFP8: tanto las capas lineales (attention, proyecciones Gated DeltaNet, expertos compartidos) como los parámetros empaquetados de los expertos enrutados (`gate_up_proj` de forma [256, 1024, 2048] y `down_proj` de forma [256, 2048, 512]) se almacenan en MXFP8, mientras que los componentes de visión, la cabeza de lenguaje, las proyecciones fusionadas de Gated DeltaNet y los routers MoE permanecen en bfloat16. La cuantización se realizó una sola vez en GPU con TorchAO usando `MXDynamicActivationMXWeightConfig`, y al cargar no se vuelve a cuantizar; la cuantización dinámica de activaciones se aplica durante la inferencia.

Los datos de entrenamiento específicos (número de tokens, composición del dataset, si hubo RLHF o DPO) no están disponibles en la información proporcionada. La familia Ornith-1.5 se presenta como un avance sobre self-scaffolding hacia un bucle de auto-mejora, pero no se detallan los procedimientos de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito: el asistente abre con un bloque ` thinking …  response` antes de la respuesta final, configurable mediante `enable_thinking=False`.
- Comprensión de imágenes y texto (entrada multimodal): el modelo acepta imágenes junto con texto, lo que permite tareas de descripción, análisis y respuesta visual.
- Soporte de tool calling / function calling, según se indica en la variante NVFP4 para DGX Spark.
- Capacidades de agente y razonamiento multi-step, con rendimiento superior a Qwen 3.6-35B en benchmarks de coding y agentic.
- Generación de código: supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B en agentic coding.
- Multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada con contexto largo: el modelo puede mantener conversaciones multi-turno con memoria de hasta 256K tokens, lo que permite gestionar historiales extensos de soporte sin perder el hilo.
- Generación de código en producción: con soporte de tool calling y rendimiento superior en benchmarks de coding, puede integrarse en pipelines de CI/CD para generar, revisar y corregir código automáticamente.
- Asistentes de análisis de documentos técnicos: al ser multimodal, puede recibir capturas de pantalla, diagramas o documentos escaneados y responder preguntas sobre su contenido, combinando visión y razonamiento.
- Agentes autónomos multi-step: gracias a su modo de razonamiento y capacidades de tool calling, puede planificar y ejecutar secuencias de acciones complejas, como navegación web o gestión de APIs.
- Razonamiento matemático y científico: el modelo está diseñado para tareas de razonamiento, lo que lo hace adecuado para tutoría, resolución de problemas y análisis de datos.
- Despliegue de modelos de bajo coste en GPU Blackwell: con el checkpoint MXFP8 de ~37 GB, puede ejecutarse en GPUs de clase B200 o RTX Pro 6000, reduciendo el coste de inferencia frente al modelo bf16 completo.

## Benchmarks y rendimiento

La información disponible no incluye resultados numéricos detallados de benchmarks. Sin embargo, la documentación del modelo base indica que Ornith-1.5-35B-A3B supera significativamente a Qwen 3.6-35B en todos los benchmarks de coding y agentic, y supera a modelos densos como Gemma 4-31B y Muse Glimmer-30B en agentic coding. El perfil en BenchLM le otorga una puntuación pública de 49.27/100, ocupando el puesto 134 de 221 modelos evaluados, con 18 filas de benchmark visibles. No se han publicado resultados numéricos específicos de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- La inferencia con MXFP4 requiere una GPU NVIDIA de clase Blackwell (SM100+, major version ≥ 10), como B200, GB200 o RTX Pro 6000. No es compatible con Ampere, Hopper ni arquitecturas anteriores.
- El checkpoint MXFP4 ocupa ~37 GB en disco; en memoria, el modelo bf16 base ocupa ~70 GB, mientras que esta variante reduce el footprint sustancialmente.
- La recomendación oficial para contexto completo de 256K es de 2 GPUs de 80 GB.
- En vLLM, el loader FusedMoE no puede trocear los expertos MXFP8 empaquetados y los de-cuantiza a bf16 en la carga (~64 GB solo para expertos), salvo que se parchee el loader.
- Opciones de despliegue: Transformers con `experts_implementation="grouped_mm"` o `"batched_mm"`; vLLM con soporte TorchAO MXFP8 (≥ 0.19.1).
- Se recomienda `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True` para evitar fragmentación durante la carga o generación.
- Software necesario: `transformers>=5.8.1`, `torch`, `torchao`, `safetensors`.

## Comparativa con modelos similares

| Modelo | Params totales | Params activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (este) | ~35B | ~3B | 256K | MIT | MoE vision-language, supera a Qwen 3.6-35B en coding y agentic |
| Qwen 3.6-35B | ~35B | no disponible | no disponible | no disponible | Competidor directo, superado por Ornith-1.5 en benchmarks de coding y agentic |
| Gemma 4-31B | ~31B | ~31B (denso) | no disponible | no disponible | Modelo denso, superado por Ornith-1.5 en agentic coding |
| Muse Glimmer-30B | ~30B | ~30B (denso) | no disponible | no disponible | Modelo denso, superado por Ornith-1.5 en agentic coding |

Nota: los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La inferencia MXFP8 requiere exclusivamente hardware NVIDIA Blackwell (SM100+); no funciona en Ampere, Hopper ni arquitecturas anteriores.
- El modelo puede presentar alucinaciones, como cualquier LLM, especialmente en tareas de razonamiento complejo o con entradas de imagen ambiguas.
- La información sobre idiomas soportados y datos de entrenamiento no está disponible, por lo que no se puede garantizar un rendimiento multilingüe específico.
- El uso en vLLM requiere parchear el loader FusedMoE para evitar la de-cuantización a bf16, lo que aumenta el consumo de VRAM.
- La cuantización MXFP8 con activaciones dinámicas puede introducir una ligera degradación de precisión frente al modelo bf16 original, aunque no se han publicado datos comparativos.
- La licencia MIT permite uso comercial sin restricciones, pero el usuario debe verificar los términos de los componentes subyacentes (arquitectura Qwen3.5-MoE).

## Enlaces

- HuggingFace del modelo cuantizado: https://huggingface.co/mph/ornith-1.5-35b-a3b-mxfp8
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Variante MLX 6-bit: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-MLX-6bit
- Benchmark en BenchLM: https://benchlm.ai/models/ornith-1-5-35b-a3b
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Repositorio de la variante NVFP4 para DGX Spark: https://github.com/sojufx/Ornith-1.5-35B-A3B-NVFP4-DGX-Spark
