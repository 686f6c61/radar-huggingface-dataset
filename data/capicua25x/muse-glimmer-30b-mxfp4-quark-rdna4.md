# Capicua25x/Muse-Glimmer-30B-MXFP4-Quark-RDNA4

## Resumen

Muse-Glimmer-30B-MXFP4-Quark-RDNA4 es una cuantización MXFP4 del modelo abierto Muse-Glimmer-30B de Meta, realizada por Capicua25x con AMD Quark 0.12 específicamente para servidores vLLM sobre hardware RDNA4 (gfx12). El modelo base es un transformer denso multimodal de 30B parámetros (aunque los pesos cuantizados suman 19.409.880.064), licencia Apache-2.0, diseñado por Meta para agentes locales siempre activos con tool calling nativo, razonamiento multi-paso y soporte de imagen.

Esta versión cuantizada reduce el peso de ~60 GB bf16 a 28 GB en disco, lo que permite servir el modelo en dos perfiles: uno con ventana de contexto extendida a 1.048.576 tokens mediante YaRN (factor 8) para concurrencia de hasta ~16 usuarios en dos GPUs de 32 GB, y otro de un solo stream con un drafter DFlash2 incluido para decodificación especulativa, que duplica el throughput en generación. La cuantización aplica MXFP4 solo a los MLP del modelo de lenguaje (156 módulos), manteniendo en bf16 atención, vision tower, lm_head, normas y embeddings. Es relevante porque permite ejecutar un modelo multimodal de 30B con ventana de millón de tokens en hardware consumer de gama alta, algo que los modelos MoE de similar capacidad no logran.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + imagen), atención híbrida con 13 cabezas globales y 39 de ventana deslizante, 2 KV heads |
| Parametros totales | 19.409.880.064 (según safetensors; el modelo base se anuncia como 30B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 (config por defecto, YaRN factor 8 sobre 131.072 nativo); config alternativa nativa de 131.072 |
| Tipos de cuantizacion | MXFP4 (fp4 e2m1, group size 32, escalas compartidas e8m0) en MLP; atención, vision tower y lm_head en bf16; opción de KV cache fp8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantización real de Quark, `quant_method: quark`, `pack_method: reorder`) |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer denso multimodal desarrollado por Meta, con una arquitectura de atención híbrida que combina 13 cabezas de atención global y 39 cabezas de ventana deslizante, junto con 2 cabezas de KV para reducir el tamaño de la caché KV y permitir ventanas de contexto largas. Incluye una torre de visión independiente para procesar imágenes. No se dispone de detalles sobre el dataset de entrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base en la información proporcionada.

La cuantización aquí descrita aplica MXFP4 (formato de microescala OCP, fp4 e2m1 con escalas compartidas e8m0, group size 32) a los 52 bloques MLP del modelo de lenguaje (gate_proj, up_proj, down_proj, 156 módulos en total). Quark también declara cuantización dinámica de entrada MX fp4 para esos módulos, mientras que las activaciones en el resto de la red se mantienen en bf16. Se excluyen de la cuantización todas las proyecciones de atención y sus gates, la torre de visión, lm_head, normas y embeddings (564 exclusiones). El export se realiza con pesos `real_quantized` y `pack_method: reorder`. Además, se incluye un drafter DFlash2 (Apache-2.0, sin modificar) para decodificación especulativa, y dos configuraciones de contexto: una con YaRN ×8 (1M) y otra nativa de 131k.

## Capacidades

- Generación de texto y razonamiento multi-paso, con un canal de razonamiento separado controlable mediante `reasoning_strength` (low/medium/high/xhigh) en la plantilla de chat.
- Tool calling nativo (`--enable-auto-tool-choice`, parser `muse_glimmer`), diseñado para agentes autónomos.
- Capacidades multimodales: acepta imágenes como entrada (la torre de visión no está cuantizada, pero no ha sido verificada en esta versión).
- Soporte de agentes con recuperación de fallos y ejecución de tareas largas, según la descripción del modelo base de Meta.
- Decodificación especulativa con drafter DFlash2 incluido, que alcanza una tasa de aceptación de 1.55-2.08 tokens por paso según la carga.
- Ventana de contexto extendida a 1.048.576 tokens (config por defecto) mediante YaRN, con la posibilidad de volver a la ventana nativa de 131.072 tokens copiando `config.json.bak-native131k`.
- Multilingüe: no se especifican idiomas concretos, pero el modelo base de Meta es multilingüe (sin confirmación en esta cuantización).

## Casos de uso

- Agentes locales siempre activos: el modelo está optimizado para ejecutarse en una GPU consumer y mantener conversaciones de larga duración con herramientas, gracias a su ventana de 1M tokens y su tool calling nativo. Un asistente personal podría gestionar tareas de calendario, correo o domótica sin depender de la nube.
- Atención al cliente automatizada: con la ventana de contexto extendida, el modelo puede mantener el historial completo de una conversación de soporte de varias horas y acceder a documentación extensa, mientras invoca APIs de CRM o ticketing mediante tool calling.
- Generación de código en producción: soporta tool calling y puede integrarse en pipelines de CI/CD para revisar pull requests, generar tests o autocompletar funciones, con una latencia de ~28 tokens/s en single-stream y mayor throughput con el drafter.
- Análisis de documentos largos: la ventana de 1M tokens permite procesar libros técnicos, informes anuales o expedientes judiciales completos en una sola pasada, extrayendo resúmenes o respondiendo preguntas específicas.
- Asistente de investigación multimodal: al aceptar imágenes, puede analizar figuras, gráficos o capturas de pantalla junto con texto largo, útil para revisar papers científicos o documentación técnica.
- Despliegue en entornos con restricciones de hardware: al ocupar solo 28 GB en disco y caber en dos GPUs de 32 GB (o una sola con cuantización más agresiva), es viable para estaciones de trabajo sin acceso a clusters.

## Benchmarks y rendimiento

La model card proporciona resultados de IFEval (subset n=80) para las dos configuraciones de contexto, medida con lm-eval, chat template, temperatura 0.6, top-p 0.95, top-k 20, `reasoning_strength: low`, 5 semillas (1234-1238). Se muestran mediana y rango.

| Suite | Config 1M (por defecto) | Config nativa 131k |
|---|---|---|
| IFEval inst-strict | 0.9062 [0.8828–0.9297] | 0.9297 [0.9219–0.9453] |
| IFEval prompt-strict | 0.8625 [0.8375–0.8875] | 0.90 (valor incompleto en la fuente) |

También se midió el throughput en 2×Radeon AI PRO R9700 (TP2, vLLM con backend TRITON_ATTN y moe_backend triton_unfused). Resumen:

| Perfil / forma | c1 | c4 | c8 | c16 | c32 | Techo práctico* |
|---|---|---|---|---|---|---|
| Config 1M · prompts cortos | 28.4 tok/s | – | – | 351 agg (22.0/user) | 615 agg (19.2/user) | ~16 usuarios |
| Config 1M · prefill 6k | 27.9 | 102 agg | 161 agg | 328 agg (20.5/user) | 579 agg (18.2/user) | ~16 usuarios |
| DFlash2 · prompts cortos (131k) | **57.0** (acept. 1.55/step, 2.53 tok/step) | – | – | – | – | single-stream |
| DFlash2 · prefill 6k (131k) | **57.7** (1.65 / 2.64) | 144 agg (1.97 / 2.98) | 296 agg (2.08 / 3.08) | – | – | ~8 usuarios |

\* Por usuario ≥ 20 tok/s. La tasa de aceptación del drafter aumenta con la carga (de 1.55 a 2.08 tokens por paso de c1 a c8), por lo que el perfil DFlash mantiene el rendimiento hasta c8 en tráfico con prefill de 6k.

Nota: no se han publicado benchmarks estándar como MMLU, HumanEval o GSM8K para esta cuantización concreta en la información disponible.

## Requisitos de hardware

- VRAM estimada: el perfil de 1M con `--gpu-memory-utilization 0.90` es estable en 2×32 GB (Radeon AI PRO R9700). Con KV cache fp8, se puede bajar a 0.80 de utilización, lo que sugiere que podría caber en una sola GPU de 32 GB en configuraciones más ligeras, aunque no está confirmado.
- GPUs recomendadas: 2×Radeon AI PRO R9700 (RDNA4, gfx12) para el perfil de 1M; en CUDA, vLLM ≥ 0.28 con soporte `muse_glimmer` funciona con los mismos flags.
- En consumer GPU: el modelo base de Meta está diseñado para una sola GPU de gama alta (por ejemplo, RTX 4090 de 24 GB), pero esta cuantización con 28 GB en disco y 19.4B parámetros requiere al menos 32 GB de VRAM para el perfil completo; podría intentarse con cuantización GGUF en una RTX 4090, aunque no se ha probado.
- Opciones de despliegue: vLLM (imagen prebuilt `capicua25x/vllm-rocm-rdna4` para RDNA4, o stock vLLM ≥ 0.28 en CUDA), con flags específicos para atención y MoE. No se menciona soporte para llama.cpp u Ollama.
- Latencia y throughput: 28-29 tok/s en single-stream sin drafter; 57-58 tok/s con DFlash2; agregado de 328-615 tok/s en concurrencia de 16-32 usuarios en el perfil de 1M.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base sin cuantizar para comparar directamente. Como referencia cualitativa:

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso típico |
|---|---|---|---|---|---|
| Muse-Glimmer-30B (base) | ~30B (dense) | 131k nativo | Apache-2.0 | bf16 | Agentes locales, multimodal, tool calling |
| Esta cuantización MXFP4 | 19.4B (pesos cuantizados) | 1M (YaRN) o 131k | Apache-2.0 | MXFP4 (Quark) | Servicio vLLM en RDNA4, decodificación especulativa |
| Otras cuantizaciones (p.ej. GGUF) | ~30B | Variable | Apache-2.0 | GGUF | Inferencia en CPU/GPU consumer con llama.cpp |

La principal diferencia frente al base es la reducción de peso (~60 GB → 28 GB) y la posibilidad de ventana de 1M, a costa de una pequeña pérdida en precisión de instrucciones (IFEval inst-strict 0.9062 vs 0.9297 en config nativa). No se han encontrado comparativas con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La entrada de imágenes no ha sido verificada en esta cuantización; la torre de visión está intacta en bf16, pero no se ha probado su funcionamiento tras el proceso de cuantización.
- La extensión de contexto a 1M tokens (YaRN ×8) reduce la precisión en el seguimiento de instrucciones: IFEval inst-strict cae de 0.9297 a 0.9062 en comparación con la config nativa. Para tareas que no requieran ventanas largas, se recomienda usar `config.json.bak-native131k`.
- El drafter DFlash2 solo funciona en el perfil de un solo stream (config nativa 131k); en el perfil de 1M, el dimensionado de la caché KV impide su uso con `--gpu-memory-utilization 0.92`; es necesario usar 0.90 o inferior.
- En ROCm gfx12 no se deben usar los backends por defecto (`auto`) para atención y MoE; los flags TRITON_ATTN y `triton_unfused` son los medidos y estables.
- El override de `rope_scaling` debe colocarse en la config de texto, no a nivel superior, o se ignora silenciosamente.
- No se han evaluado sesgos ni riesgos de alucinación específicos de esta cuantización; el modelo base puede heredar sesgos de su entrenamiento, no documentados en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base de Meta por si hubiera restricciones adicionales (no se mencionan en la model card).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Capicua25x/Muse-Glimmer-30B-MXFP4-Quark-RDNA4
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Imagen Docker para RDNA4: https://hub.docker.com/r/capicua25x/vllm-rocm-rdna4
- Código fuente de vLLM para RDNA4: https://github.com/Capicua25x/vllm-rocm-rdna4
- Página del modelo en Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Model card en NVIDIA NIM: https://build.nvidia.com/meta/muse-glimmer-30b/modelcard
- Sitio informativo sobre Muse Glimmer: https://museglimmer.site/
