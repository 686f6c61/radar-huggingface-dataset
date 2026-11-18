# amd/Qwen3.8-Flash-Next-Quark-MXFP4

## Resumen

AMD Qwen3.8-Flash-Next-Quark-MXFP4 es un checkpoint cuantizado del modelo multimodal Qwen3.8-Flash-Next de Alibaba Qwen, publicado por AMD mediante su herramienta de optimizacion AMD-Quark. El modelo original es un transformer de tipo Mixture-of-Experts (MoE) con arquitectura hibrida que combina atencion completa con proyecciones de atencion lineal de estilo Mamba, y acepta entradas de texto, imagen y video para producir texto. El checkpoint cuantizado mantiene 119.484 millones de parametros totales y ocupa 182,3 GB en el repositorio.

La aportacion de esta version es la cuantizacion de todos los expertos MoE (tanto los enrutados como el experto compartido) a OCP MXFP4, manteniendo el resto de componentes en bf16: atencion completa, proyecciones de atencion lineal, cabecera MTP, gates del router, vision tower, mixers de hiperconexion y `lm_head`. Esto reduce el coste de memoria y acelera la inferencia en hardware AMD Instinct MI350 y MI355 con ROCm 7.2.3, sin degradar de forma significativa la precision respecto al modelo original.

El interes practico radica en que permite desplegar un modelo de razonamiento multimodal de gran tamano en infraestructura AMD con vLLM, manteniendo una recuperacion de precision superior al 98 % en la mayoria de benchmarks evaluados. Es una pieza relevante para equipos que trabajan con el stack ROCm y necesitan un modelo de frontera cuantizado listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4ExpForConditionalGeneration (transformer MoE hibrido con atencion completa y atencion lineal estilo Mamba) |
| Parametros totales | 119.484.039.059 (119,48 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (OCP) en pesos de expertos MoE, estatica; MXFP4 en activaciones MoE, dinamica; resto en bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | other (enlace a LICENSE en el repositorio) |
| Formato de pesos | safetensors |
| Hardware soportado | AMD MI350 / MI355 |
| ROCm | 7.2.3 |
| PyTorch | 2.12.0+git6bbd260 |
| Transformers | 5.16.1 |
| Motor de inferencia | vLLM |
| Optimizador | AMD-Quark |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE con atencion hibrida: capas de atencion completa combinadas con proyecciones de atencion lineal de estilo Mamba, ademas de componentes adicionales como una cabecera MTP (multi-token prediction), gates de router, un gate de experto compartido, una ruta PLE basada en n-gramas, un vision tower para entradas de imagen y video, y mixers de hiperconexion. La cuantizacion realizada por AMD afecta exclusivamente a los pesos y activaciones de los expertos MoE (enrutados y compartido), dejando el resto de la red en bf16.

El proceso de cuantizacion se ejecuta con AMD-Quark mediante `ModelQuantizer.direct_quantize_checkpoint`, con un esquema `mxfp4` y una lista de exclusion que protege `lm_head`, gates, `mtp.*`, `model.visual.*`, componentes de hiperconexion, `ple.*`, `linear_attn.*` y `self_attn.*`. Los pesos fusionados de los expertos (`gate_up_proj`, `down_proj`) se separan previamente con `SplitFusedExperts` antes de cuantizar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de RLHF o DPO del modelo base en la informacion proporcionada.

## Capacidades

- Generacion de texto a partir de entradas multimodales: texto, imagen y video.
- Razonamiento complejo, incluyendo matematicas de competicion (AIME26) y preguntas cientificas de nivel doctorado (GPQA Diamond).
- Generacion y comprension de codigo, con soporte para tareas de SciCode.
- Capacidad multimodal avanzada: MMMU Pro en modos standard y vision.
- Soporte de tool calling / function calling, con parser `qwen3_coder` en vLLM y flag `--enable-auto-tool-choice`.
- Modo de razonamiento (reasoning parser `qwen3`) para cadenas de pensamiento extendidas.
- Manejo de contexto largo en tareas de razonamiento y recuperacion (AA-LCR).
- Seguimiento de instrucciones (IFBench).
- Capacidades multilingues limitadas al ingles segun la model card.

## Casos de uso

- Razonamiento matematico y cientifico asistido: el modelo obtiene 96,5 en GSM8K y 98,33 en AIME26, por lo que es adecuado para tutoria automatica, verificacion de demostraciones y generacion de problemas resueltos en entornos educativos o de investigacion.
- Analisis de documentos tecnicos con imagenes: gracias al vision tower y a MMMU Pro (80,00 en standard), puede extraer informacion de figuras, graficos y tablas en papers o informes, integrado en pipelines de procesamiento documental.
- Generacion de codigo en produccion: con soporte de tool calling y SciCode de 48,58, puede integrarse en asistentes de IDE o pipelines de CI/CD que necesiten invocar herramientas externas y razonar sobre subproblemas de programacion.
- Agentes multi-paso con contexto largo: la puntuacion de 80,63 en AA-LCR indica buena capacidad para tareas de recuperacion y razonamiento sobre contextos extensos, util en agentes que consultan multiples fuentes antes de responder.
- Atencion al cliente especializada en dominios tecnicos: el modelo puede gestionar conversaciones multi-turno con seguimiento de instrucciones robusto (82,67 en IFBench), adecuado para soporte de producto con documentacion adjunta en imagen o texto.
- Evaluacion automatizada de calidad y conformidad: su rendimiento en GPQA Diamond (91,67) permite usarlo como juez o verificador en procesos de revision de contenido cientifico o tecnico.
- Procesamiento de video para monitorizacion o analisis: al aceptar entradas de video, puede describir y resumir secuencias en aplicaciones de analisis de contenido, siempre que se despliegue en hardware MI350/MI355 con vLLM.

## Benchmarks y rendimiento

| Benchmark | Qwen3.8-Flash-Next (bf16) | Quark-MXFP4 (este modelo) | Recuperacion |
|---|---|---|---|
| GSM8K (5-shot) | 96,8 | 96,5 | 99,7 % |
| GPQA Diamond (mean@8) | 91,67 | 91,67 | 100,00 % |
| AIME26 (mean@16) | 99,17 | 98,33 | 99,15 % |
| MMMU Pro, standard (mean@1) | 79,65 | 80,00 | 100,44 % |
| MMMU Pro, vision (mean@1) | 78,38 | 77,40 | 98,75 % |
| SciCode, subproblem (mean@8) | 49,01 | 48,58 | 99,12 % |
| AA-LCR (mean@16) | 78,50 | 80,63 | 102,71 % |
| IFBench (mean@5) | 83,27 | 82,67 | 99,28 % |

Los resultados se obtuvieron con vLLM y EvalScope 1.14.1 sobre hardware AMD MI355X, con configuracion de generacion temperature 1.0 y top_p 0.95. La recuperacion media se situa por encima del 99 % en la mayoria de tareas, con una mejora aparente en AA-LCR y MMMU Pro standard atribuible a variabilidad entre ejecuciones.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 182,3 GB en safetensors con cuantizacion MXFP4 en expertos y bf16 en el resto; se requiere un minimo de dos aceleradores de 192 GB para el despliegue de referencia con tensor parallelism 2.
- GPU recomendadas: AMD Instinct MI350 y MI355 (microarquitectura soportada oficialmente). No se declara soporte para GPUs NVIDIA ni consumer.
- Cabe en consumer GPU: no. El tamano del checkpoint y el requisito de ROCm 7.2.3 con MI350/MI355 lo impiden.
- Opciones de despliegue: vLLM con imagen `vllm/vllm-openai-rocm:nightly-83c078d955cd6e0c63d3b12abe669c8de936a370`, frontend Rust (`VLLM_USE_RUST_FRONTEND=1`), AITER habilitado (`VLLM_ROCM_USE_AITER=1`, `VLLM_ROCM_USE_AITER_FUSION_SHARED_EXPERTS=1`), backend de prefill `aiter_flydsl`, `--enable-prefix-caching`, `--max-num-seqs 256` y `--gpu-memory-utilization 0.90`.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Hardware | Formato |
|---|---|---|---|---|---|
| amd/Qwen3.8-Flash-Next-Quark-MXFP4 | 119,48 mil M | no disponible | other | AMD MI350/MI355 | safetensors MXFP4/bf16 |
| Qwen/Qwen3.8-Flash-Next | 119,48 mil M (mismo base) | no disponible | no disponible | no disponible | safetensors bf16 |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa disponible en la informacion es con el modelo base sin cuantizar, que sirve como referencia de precision. No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: la model card declara unicamente ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia "other": es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se especifican terminos en la informacion disponible.
- Hardware restringido: solo se declara soporte para AMD MI350 y MI355 con ROCm 7.2.3; no hay garantia de funcionamiento en otras plataformas.
- Riesgo de alucinacion: como todo modelo generativo de gran escala, puede producir afirmaciones incorrectas, especialmente en dominios cientificos especializados.
- La cuantizacion MXFP4 introduce una perdida de precision pequena pero medible (hasta un 1,25 % en MMMU Pro vision y un 0,88 % en SciCode), relevante en aplicaciones que requieran exactitud estricta.
- No se dispone de informacion sobre sesgos conocidos, longitud de contexto ni parametros activos del modelo.
- El despliegue de referencia requiere tensor parallelism 2 y una configuracion especifica de vLLM; configuraciones distintas pueden alterar los resultados de los benchmarks.
- La fecha de creacion del repositorio (2026-08-26) y la version de Transformers requerida (5.16.1) implican dependencias muy recientes que pueden no estar estables en todos los entornos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/amd/Qwen3.8-Flash-Next-Quark-MXFP4/blob/main/LICENSE
- Documentacion de AMD-Quark: https://quark.docs.amd.com/latest/index.html
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- vLLM Recipes para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next?hardware=mi355x&variant=bf16&frontend=rust
- EvalScope: https://evalscope.readthedocs.io/en/latest/
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
