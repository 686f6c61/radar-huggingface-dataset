# amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4

## Resumen

Muse-Spark-Open-816B-A42B-Quark-MXFP4 es una versión cuantizada del modelo multimodal Muse-Spark-Open-816B-A42B, publicada por AMD. El checkpoint original lo desarrolla meta-models y acepta entradas de texto, imagen, vídeo y audio, con salida únicamente de texto. AMD ha aplicado su herramienta de cuantización AMD-Quark (v0.12) para reducir el coste de memoria de los expertos MoE del modelo, manteniendo el resto de capas en bf16.

La relevancia de esta publicación es doble. Por un lado, demuestra el flujo de cuantización MXFP4 de AMD sobre un modelo de gran escala (435.489.473.024 parámetros reales según los safetensors del repo, aunque el nombre comercial del modelo base indica 816B totales y 42B activos). Por otro, incluye recetas de despliegue específicas para hardware AMD Instinct MI350/MI355 con SGLang y vLLM sobre ROCm, lo que convierte el checkpoint en una referencia práctica para servir modelos MoE grandes en infraestructura AMD.

El repo ocupa 1014 GB y se distribuye bajo la licencia propietaria muse-model-license, con soporte oficial limitado a GPUs AMD Instinct MI350/MI355 y Linux. No se han publicado en la información disponible datos sobre idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MuseSparkForConditionalGeneration (transformer MoE multimodal, según model card) |
| Parametros totales | 435.489.473.024 (safetensors del repo cuantizado); el nombre del modelo base indica 816B totales |
| Parametros activos | 42B (según el identificador del modelo base, A42B) |
| Longitud de contexto | no disponible (la receta vLLM limita el servicio a 32.768 tokens) |
| Tipos de cuantizacion | MXFP4 (OCP) en pesos estáticos y activaciones dinámicas de los expertos MoE; resto en bf16 |
| Idiomas soportados | no disponible |
| Licencia | muse-model-license (other) |
| Formato de pesos | safetensors (8-bit, cuantización Quark) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal de tipo MuseSparkForConditionalGeneration que procesa texto, imagen, vídeo y audio y genera texto. El checkpoint de AMD no reentrena el modelo: aplica cuantización post-entrenamiento con AMD-Quark v0.12. Concretamente, cuantiza los expertos MoE enrutados a OCP MXFP4 (pesos estáticos y activaciones dinámicas), excluyendo las capas 0 y 61, y mantiene en bf16 el resto de componentes: lm_head, módulos de atención, gates MoE, proyecciones pre/post expertos, torres de visión y audio y el resto del language model.

La receta de cuantización incluye conversores de pesos que separan los expertos fusionados (gate_up_proj y down_proj) antes de cuantizar, mediante SplitFusedExperts. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo RLHF o DPO. La innovación destacable de esta publicación es el propio pipeline de cuantización MXFP4 sobre MoE y las recetas de servicio optimizadas para ROCm, que incluyen decodificación especulativa DFlash V2 con el draft model RadixArk/Muse-Spark-Open-DFlash2 en SGLang, kernels AITER, backend FlyDSL para MoE y chunked prefill en vLLM.

## Capacidades

- Generación de texto a partir de entradas multimodales: texto, imagen, vídeo y audio (la salida es solo texto).
- Razonamiento con modo de esfuerzo configurable: la API de ejemplo acepta el parámetro `reasoning_effort` con valor `high`, y las recetas incluyen `--reasoning-parser muse`.
- Tool calling / function calling: las recetas de SGLang y vLLM activan `--tool-call-parser muse` y, en vLLM, `--enable-auto-tool-choice`.
- Capacidades de agente y razonamiento multi-paso: no documentadas explícitamente en la información disponible, aunque el soporte de reasoning parser y tool parser es compatible con ese uso.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales: entrada de vídeo y audio, decodificación especulativa DFlash V2 en el despliegue SGLang y cuantización MXFP4 de expertos MoE.

## Casos de uso

- Servicio de inferencia multimodal en infraestructura AMD: el checkpoint está pensado para desplegarse con SGLang o vLLM sobre MI350/MI355, de modo que un equipo con GPUs AMD Instinct puede servir un MoE de gran escala con pesos MXFP4 y reducir el consumo de memoria frente al modelo en bf16.
- Asistentes que combinan imagen y texto: al aceptar entradas de imagen y generar texto, el modelo puede emplearse en tareas de descripción de imágenes, extracción de información de documentos escaneados o respuesta a preguntas sobre capturas, siempre que el despliegue incluya las torres de visión (que se mantienen en bf16).
- Análisis de vídeo y audio con salida textual: la entrada de vídeo y audio permite construir pipelines de transcripción, resumen o etiquetado de contenido audiovisual, con la salida en texto.
- Razonamiento de alta exigencia con `reasoning_effort: high`: útil en tareas de análisis, planificación o resolución de problemas donde interesa que el modelo dedique más cómputo al razonamiento antes de responder.
- Integración en agentes con tool calling: el soporte de `--tool-call-parser muse` y `--enable-auto-tool-choice` permite conectar el modelo a herramientas externas (APIs, bases de datos, ejecución de código) en flujos de automatización.
- Despliegue de baja latencia con decodificación especulativa: la receta SGLang con DFlash V2 y el draft model DFlash2 está orientada a escenarios interactivos donde la latencia por token es crítica, como chat en producción.
- Evaluación de cuantización MXFP4 en MoE: investigadores que estudien el impacto de MXFP4 en calidad y rendimiento pueden usar este checkpoint como referencia reproducible, ya que la model card incluye el script de cuantización completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo cuantizado ocupa 1014 GB; con pesos MXFP4 en los expertos y bf16 en el resto, el despliegue requiere un nodo multi-GPU de gran capacidad. Las recetas oficiales usan TP4 + EP4 (SGLang) o TP8 (vLLM) sobre MI355X.
- GPU recomendadas: AMD Instinct MI350 y MI355 (microarquitectura soportada oficialmente). No se documenta soporte para otras GPUs.
- GPU de consumo: no cabe en GPUs de consumo; el tamaño del checkpoint y el soporte limitado a MI350/MI355 lo impiden.
- Opciones de despliegue: SGLang (`lmsysorg/sglang-rocm:muse-spark-open`) y vLLM (`vllm/vllm-openai-rocm:muse-spark-open`), ambos sobre ROCm. La receta SGLang usa AITER attention, FlyDSL MoE, page size 16, mem-fraction-static 0.85 y decodificación especulativa DFlash V2. La receta vLLM usa AITER FA, chunked prefill, max-model-len 32768, max-num-seqs 128 y gpu-memory-utilization 0.90.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Muse-Spark-Open-816B-A42B-Quark-MXFP4 (este) | 435B en safetensors (816B/42B activos según nombre base) | no disponible | MXFP4 en expertos MoE | muse-model-license | AMD MI350/MI355 |
| Muse-Spark-Open-816B-A42B (base) | 816B totales / 42B activos | no disponible | bf16 | muse-model-license | no disponible |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Licencia propietaria muse-model-license: es necesario revisar LICENSE.md antes de cualquier uso comercial; no es una licencia open source estándar.
- Soporte de hardware restringido: solo se documentan AMD Instinct MI350/MI355 y Linux; no hay recetas para NVIDIA ni para GPUs de consumo.
- La cuantización MXFP4 afecta solo a los expertos MoE enrutados (excepto capas 0 y 61); el resto se mantiene en bf16, por lo que el ahorro de memoria es parcial y el checkpoint sigue siendo muy grande (1014 GB).
- La receta vLLM limita el servicio a 32.768 tokens con `--max-model-len`, lo que puede ser inferior a la ventana de contexto real del modelo base; no se documenta la longitud de contexto nativa.
- No se han publicado datos de benchmarks ni de evaluación de calidad tras la cuantización, por lo que se desconoce la degradación introducida por MXFP4.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse antes de usar el modelo en producción.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento adecuado en castellano sin evaluación previa.
- El repo tiene pocas señales de adopción (2 likes, 4851 descargas) y la model card no incluye información sobre el entrenamiento del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Muse-Spark-Open-816B-A42B-Quark-MXFP4
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- AMD-Quark: https://quark.docs.amd.com/latest/index.html
- SGLang cookbook (Muse Spark Open): https://lmsysorg.mintlify.app/cookbook/autoregressive/Meta/MuseSparkOpen#hw=mi355x&strategy=low-latency&quant=mxfp4
- Receta vLLM: https://recipes.vllm.ai/meta-models/Muse-Spark-Open-816B-A42B?hardware=mi355x&variant=mxfp4
- Anuncio de soporte AMD en SGLang: https://www.lmsys.org/blog/2026-10-15-meta-muse-spark-open#amd-support
- Draft model DFlash2: https://huggingface.co/RadixArk/Muse-Spark-Open-DFlash2
- Licencia: LICENSE.md en el repositorio de Hugging Face
