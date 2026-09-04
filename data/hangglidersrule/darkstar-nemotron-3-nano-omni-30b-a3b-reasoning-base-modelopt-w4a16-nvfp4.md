# HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Base-ModelOpt-W4A16-NVFP4

## Resumen

El modelo Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Base-ModelOpt-W4A16-NVFP4 es una cuantizacion W4A16-NVFP4 del modelo nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16, desarrollada por HangGlidersRule. Se presenta como un artefacto de control de la familia Darkstar Nemotron-3-Nano-Omni: misma revision de origen, mismo contrato de cuantizacion y sin ediciones en el comportamiento de rechazo. El modelo base es un sistema multimodal (image-text-to-text) con arquitectura hibrida Nemotron-H, que combina un trunk de lenguaje con proyecciones MoE y una ruta Mamba2/SSM, ademas de torres de vision y audio.

La cuantizacion se aplica exclusivamente a las proyecciones de expertos del MoE (routed y shared, 5.894 modulos) y a lm_head, que se almacenan en W4A16-NVFP4 group 16; el resto de la red (Mamba2/SSM, atencion, normas, embeddings y las torres de vision/audio) permanece en BF16. Los tensores totales en safetensors suman 16.484.881.856 parametros, y el repositorio ocupa 39,6 GB. El modelo esta pensado para servirse con vLLM, con una ventana de contexto de 131.072 tokens y un rendimiento de 259,75 tokens/s en un solo stream sin decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Nemotron-H: MoE (expertos routed + shared) con ruta Mamba2/SSM, atencion, normas y embeddings; multimodal image-text-to-text con torres de vision y audio |
| Parametros totales | 16.484.881.856 (16,48B) |
| Parametros activos | no disponible (la nomenclatura del modelo base sugiere 3B activos, pero no se confirma en los metadatos) |
| Longitud de contexto | 131.072 tokens (configuracion de vLLM validada) |
| Tipos de cuantizacion | W4A16-NVFP4 group 16 para proyecciones MoE y lm_head; BF16 para Mamba2/SSM, atencion, normas, embeddings y torres de vision/audio |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un Nemotron-H, un diseño hibrido que integra un trunk de lenguaje con capas MoE (5.894 modulos de proyeccion de expertos, tanto routed como shared) y una ruta Mamba2/SSM. El modelo es multimodal, ya que incorpora torres de vision y audio que se mantienen intactas en la cuantizacion. La cuantizacion se realizo sobre el trunk de lenguaje extraido del wrapper VLM como un checkpoint nemotron_h independiente, de modo que los tensores de las torres son byte-identicos al upstream.

El proceso de cuantizacion uso NVIDIA ModelOpt 0.46.0rc2 con algoritmo de calibracion MSE (fp8_scale_sweep). La calibracion se ejecuto con los datasets cnn_dailymail y nemotron-post-training-dataset-v2, 512 muestras de cada uno, longitud de secuencia 2048, semilla 1234, batch 1 y cuantizacion del KV-cache deshabilitada (BF16). No se aplicaron tecnicas de alineacion como RLHF o DPO en esta fase, ya que se trata de una cuantizacion post-entrenamiento, no de un entrenamiento desde cero.

## Capacidades

- Generacion de texto y razonamiento: el modelo soporta un modo de pensamiento (thinking ON) que se activo en la evaluacion GPQA Diamond, donde alcanzo 42,4% de aciertos.
- Multimodalidad: al heredar las torres de vision y audio del modelo base, puede procesar entradas image-text-to-text, siempre que se sirva con el wrapper VLM adecuado.
- Cuantizacion eficiente: la combinacion de W4A16-NVFP4 en el trunk de lenguaje y BF16 en el resto permite reducir el peso de las proyecciones MoE y lm_head sin perder las rutas de atencion y SSM.
- Despliegue con vLLM: validado con vLLM 0.27.1 (build aeon), backend MARLIN NvFp4 MoE, Flash Attention y BF16 KV cache.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y multi-step reasoning: no disponible explicitamente, aunque el modo thinking sugiere capacidades de razonamiento encadenado.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue de asistentes multimodales en produccion: el modelo puede procesar imagenes, audio y texto, lo que lo hace adecuado para sistemas de atencion al cliente que necesitan analizar capturas de pantalla, documentos escaneados o mensajes de voz. La cuantizacion NVFP4 reduce la VRAM necesaria respecto al BF16.
- Razonamiento cientifico y tecnico: con 42,4% en GPQA Diamond (thinking ON), el modelo puede responder preguntas de nivel experto en fisica, quimica y biologia, por lo que es util en entornos de investigacion o educacion tecnica.
- Servir modelos de contexto largo: la ventana de 131.072 tokens permite procesar documentos extensos, informes tecnicos o transcripciones largas en una sola pasada, lo que facilita tareas de resumen y extraccion de informacion.
- Investigacion sobre cuantizacion y compresion: al ser un artefacto de control sin ediciones de comportamiento, sirve como referencia para estudiar como afecta la cuantizacion W4A16-NVFP4 al rendimiento y a la alineacion de un modelo multimodal.
- Evaluacion de alineacion y seguridad: el modelo se puede comparar con la variante Abliterated de la misma familia para medir el impacto de las ediciones de rechazo en el comportamiento, sin que la cuantizacion introduzca variables adicionales.
- Integracion en pipelines de RAG con vLLM: el comando vllm serve incluido en la documentacion permite desplegar el modelo con prefetching de prefijos y chunked prefill, lo que resulta adecuado para sistemas de generacion aumentada por recuperacion con multiples consultas concurrentes.

## Benchmarks y rendimiento

| Metrica | Valor | Base |
|---|---|---|
| GPQA Diamond (thinking on) | 84/198 = 42,4% | llm-inference-bench gpqa-diamond, chat template + thinking ON, temperatura 0, 198/198 puntuados, 0 errores |
| Cumplimiento de prompts daninos | no medido (control sin editar) | comportamiento de rechazo sin cambios por diseno |
| Sobre-rechazos seguros | no medido (control sin editar) | misma base |
| Throughput de un solo stream (sin decodificacion especulativa) | 259,75 tok/s ponderado | 4K 259,49 / 16K 259,68 / 48K 261,49; sin MTP ni drafter compatible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 39,6 GB, que incluye los pesos cuantizados del trunk y los tensores BF16 de las torres. La VRAM real depende de la configuracion de vLLM y del numero de secuencias simultaneas.
- GPU recomendadas: no especificadas en la informacion. El modelo se valido con vLLM 0.27.1 (build aeon), torch 2.13.0+cu130, backend MARLIN NvFp4 MoE y Flash Attention.
- Compatibilidad con GPU de consumo: no disponible. No se proporcionan datos sobre el uso en GPUs de consumo como RTX 4090 o similares.
- Opciones de despliegue: vLLM, validado con el comando proporcionado en la documentacion. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 259,75 tok/s ponderado en un solo stream sin decodificacion especulativa, con una variacion minima entre longitudes de 4K, 16K y 48K.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Base-ModelOpt-W4A16-NVFP4 | 16.484.881.856 | 131.072 | W4A16-NVFP4 group 16 | NVIDIA Open Model License | HuggingFace |
| nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16 | 30B-A3B (nominal) | no disponible | BF16 | NVIDIA Open Model License | HuggingFace |
| Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Abliterated-ModelOpt-W4A16-NVFP4 | no disponible | no disponible | W4A16-NVFP4 group 16 | NVIDIA Open Model License | HuggingFace |

La comparativa se basa en los datos disponibles en la informacion. No se dispone de benchmarks comparativos entre estos modelos.

## Limitaciones y advertencias

- La cuantizacion puede desplazar el comportamiento respecto al modelo BF16 original, por lo que los resultados de seguridad y alineacion no son directamente transferibles.
- No se han medido el cumplimiento de prompts daninos ni los sobre-rechazos seguros en este artefacto de control, aunque no se aplicaron ediciones de comportamiento.
- Solo se ha caracterizado el throughput de un solo stream; el rendimiento agregado concurrente no se ha evaluado.
- No se especifican los idiomas soportados, lo que limita las conclusiones sobre su uso multilingue.
- La licencia NVIDIA Open Model License puede imponer condiciones para uso comercial; es necesario revisar el texto completo antes de desplegarlo en produccion.
- El modelo solo se ha validado con la version 0.27.1 de vLLM. Otras versiones, incluida la rama cu130-nightly, pueden fallar al cargar checkpoints ModelOpt NVFP4 FusedMoE.
- La familia no incluye decodificacion especulativa (sin MTP ni drafter compatible), lo que limita el rendimiento en comparacion con modelos que si la soportan.

## Enlaces

- HuggingFace: https://huggingface.co/HangGlidersRule/Darkstar-Nemotron-3-Nano-Omni-30B-A3B-Reasoning-Base-ModelOpt-W4A16-NVFP4
- Modelo base: https://huggingface.co/nvidia/Nemotron-3-Nano-Omni-30B-A3B-Reasoning-BF16
- Source card: https://github.com/HangGlidersRule/model-forge/blob/main/models/nemotron-3-nano-omni-r1/model-card/base-nvfp4.md
- Recipe de cuantizacion: https://github.com/HangGlidersRule/model-forge/blob/main/recipes/nemotron-3-nano-omni/w4a16_nvfp4_lmhead_nemotron_h.yaml
- Release de la familia: https://github.com/HangGlidersRule/model-forge/releases/tag/darkstar-nemotron-3-nano-omni-v1.0.0
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/download/eula/pdf/NVIDIA_Open_Model_License.pdf
