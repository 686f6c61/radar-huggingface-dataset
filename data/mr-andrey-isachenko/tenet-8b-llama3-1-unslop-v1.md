# mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1

## Resumen

Tenet-8B-Llama3.1-Unslop-v1 es un ajuste fino (fine-tune) del modelo `meta-llama/Llama-3.1-8B-Instruct` publicado por el usuario de Hugging Face `mr-andrey-isachenko` bajo el paraguas de la familia "Tenet". El modelo aplica una tecnica propietaria denominada Lancet, descrita por el autor como "cirugia de subespacios bi-proyectada que preserva la norma", cuyo objetivo es eliminar la direccion de rechazo (refusal) tanto en la proyeccion de entrada (residual stream) como en la de salida (unembedding), restaurando exactamente la norma residual para mantener las activaciones en la variedad original.

Sobre esa cirugia se aplica un pase de GRPO ("gated unslop GRPO") que penaliza patrones de estilo considerados "slop" (prosa recargada, preambulos moralizantes, vocabulario grandilocuente) solo en las regiones donde la cirugia debilito los circuitos de rechazo, con el objetivo declarado de reforzar razonamiento y codigo en lugar de degradarlos. El checkpoint se distribuye en FP8 (E4M3) y tambien como GGUF, sin codigo personalizado ni `trust_remote_code`, lo que facilita su despliegue directo en vLLM, proveedores de OpenRouter y llama.cpp.

El modelo tiene 8.030.261.248 parametros (8B densos, no MoE) y hereda la ventana de contexto de Llama 3.1 (128.000 tokens, aunque este dato no se explicita en la model card y se infiere del modelo base). Su relevancia actual radica en el nicho de modelos "abliterated"/"uncensored" orientados a uso agentico con tool calling y SQL, donde el autor reclama una retencion de capacidades muy superior a la abliteracion ingenua. La licencia es Apache-2.0 segun los metadatos, aunque el modelo base Llama 3.1 tiene su propia licencia comunitaria de Meta, lo que introduce una advertencia importante (ver limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.1 soporta 128.000 tokens |
| Tipos de cuantizacion | FP8 (E4M3) como checkpoint principal; GGUF (cuantizaciones no detalladas); safetensors BF16/FP8 |
| Idiomas soportados | no disponible (los del modelo base: predominantemente ingles y multilingue limitado) |
| Licencia | apache-2.0 (metadatos); sujeto ademas a la licencia comunitaria de Llama 3.1 de Meta por herencia del modelo base |
| Formato de pesos | safetensors, GGUF; compatible con MLX segun la model card |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer denso con atencion por cabezas agrupadas (GQA) y RoPE, sin modificaciones estructurales declaradas. La innovacion del release no esta en la arquitectura sino en el pipeline de post-entrenamiento. El autor describe tres etapas: (1) cirugia Lancet, que identifica la direccion de rechazo en las proyecciones de entrada y salida, elimina el componente de forma bidireccional y restaura la norma residual exactamente; (2) GRPO con puertas ("gated unslop GRPO"), una optimizacion de preferencias por grupos cuya recompensa penaliza patrones de "slop" solo donde la cirugia debilito el rechazo; y (3) fusion TIES "subspace-safe" y cuantizacion FP8 (E4M3).

Los datos de entrenamiento no se detallan en la informacion disponible: no se indica el numero de tokens, la composicion del dataset ni la procedencia de las preferencias usadas en GRPO. Si se mencionan metricas internas del pipeline (`final_metrics.json`) que miden deriva KL colateral, retencion de capacidades (IFEval), robustez tras cuantizacion FP8 y retencion tras la fusion TIES. El autor no publica detalles del dataset ni del codigo de entrenamiento mas alla del repositorio `tenet-lab` en GitHub. No se declara el uso de RLHF clasico ni DPO; el metodo de alineacion es exclusivamente GRPO con recompensas basadas en reglas y estilo.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct.
- Razonamiento estructurado y codificacion, con refuerzo declarado via GRPO para preservar estas capacidades tras la cirugia.
- Tool calling y function calling: el autor etiqueta el modelo como "tool-use" y "agentic", y reporta retencion del 0.98 en el subespacio de anclaje tool/SQL.
- Generacion de SQL y tareas de recuperacion de incidentes SQL (metrica "SQL-Incident Retention" de 0.98).
- Reduccion de rechazos falsos positivos ante peticiones benignas (supresion de rechazo reportada de 0.99 en BF16 y 1.00 en FP8).
- Mitigacion de "AI slop" estilistico: prosa recargada, preambulos moralizantes y vocabulario grandilocuente.
- Capacidades multilingues: no disponibles de forma explicita; las del modelo base (ingles dominante, multilingue limitado).
- No se declaran capacidades de vision, audio ni modo "thinking" explicito.

## Casos de uso

- Asistentes conversacionales sin friccion: el modelo reduce rechazos falsos positivos ante peticiones benignas, lo que resulta util en atencion al cliente o asistentes internos donde la abliteracion ingenua degrada la experiencia con negativas innecesarias.
- Generacion de SQL en produccion: la retencion reportada de 0.98 en el subespacio tool/SQL lo hace candidato para pipelines de text-to-SQL y asistentes de analitica que requieren llamadas a herramientas y consultas estructuradas.
- Agentes con tool calling: la orientacion "agentic" y la compatibilidad con vLLM y proveedores de OpenRouter permiten integrarlo en orquestadores de agentes que encadenan llamadas a funciones.
- Asistencia a la programacion: el refuerzo declarado de codigo tras el GRPO lo situa como alternativa a Llama 3.1 Instruct en autocompletado, revision de codigo y generacion de tests, con menor tendencia a preambulos moralizantes.
- Despliegue en infraestructura propia con vLLM: el checkpoint FP8 (E4M3) sin codigo personalizado se carga directamente en vLLM, lo que simplifica el servicio en produccion con throughput alto.
- Ejecucion local con llama.cpp u Ollama: la disponibilidad de GGUF permite desplegarlo en estaciones de trabajo y equipos consumer, util para prototipado y evaluacion offline.
- Generacion de contenido creativo sin "slop": la penalizacion de prosa recargada y vocabulario grandilocuente lo hace adecuado para redaccion asistida donde se busca un estilo sobrio.

## Benchmarks y rendimiento

Los unicos datos publicados son las metricas internas del pipeline del autor (`final_metrics.json`), no benchmarks estandar de la comunidad. No se han publicado resultados de MMLU, HumanEval, GSM8K ni similares en la informacion disponible.

| Metrica (etapa) | Valor | Direccion |
|---|---|---|
| Lancet KL Collateral (H9) | 0.01 | Menor es mejor |
| Naive KL Collateral (H9) | 0.13 | Menor es mejor |
| KL Reduction Ratio (H9) | 0.90 | Mayor es mejor |
| Target Suppression Ratio (H9) | 0.99 | Mayor es mejor |
| Gated GRPO IFEval Score (H10) | 0.81 | Mayor es mejor |
| Gated vs Naive/Additive Gain (H10) | 0.25 | Mayor es mejor |
| Slop & Refusal Rate (H10) | 0.04 | Menor es mejor |
| Post-Merge Suppression Retention (H10) | 1.00 | Mayor es mejor |
| FP8 Retention Ratio (H11) | 0.99 | Mayor es mejor |
| FP8 KL Reduction vs Naive (H11) | 0.43 | Mayor es mejor |
| FP8 Subspace Re-Leakage Lancet (H11) | 0.03 | Menor es mejor |
| FP8 Subspace Re-Leakage Naive (H11) | 0.50 | Menor es mejor |
| SQL-Incident Retention (H12) | 0.98 | Mayor es mejor |
| Unslop Retention (H12) | 1.00 | Mayor es mejor |
| Subspace-Safe Merge Re-Leakage (H12) | 2.16e-07 | Menor es mejor |
| TIES Bi-Projected vs Naive Gain (H12) | 0.80 | Mayor es mejor |

El autor menciona ademas una comparativa "Model Fight Card 16" (2026-11-20) en la que el modelo habria quedado primero con 50 HP frente a Llama-3.1-8B, Mistral-7B, Gemma-3-12B, Qwen3-14B y GPT-OSS-20B, pero esa evaluacion es de un sitio de terceros no verificado y no se aportan los resultados numericos por benchmark estandar.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; se recomienda 24 GB o mas para contexto largo.
- VRAM estimada en FP8 (E4M3): aproximadamente 8-9 GB de pesos; con cache KV para 8.000-32.000 tokens, un rango realista de 16-24 GB.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 5-6 GB de pesos; cabe en GPUs consumer de 8 GB con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S, RTX 4090 (24 GB) para FP8 con contexto amplio; RTX 3090/4080 (16-24 GB) para FP8 con contexto moderado.
- Cabe en GPU consumer: si, en RTX 4090 (FP8/BF16 con contexto moderado) y en GPUs de 8-12 GB usando GGUF cuantizado.
- Opciones de despliegue: vLLM (soporte nativo declarado), llama.cpp, Ollama (via GGUF), MLX, Text Generation Inference (tag `text-generation-inference`), proveedores de OpenRouter.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Tenet-8B-Llama3.1-Unslop-v1 | 8.03B densos | no disponible (base: 128k) | apache-2.0 (metadatos) + licencia Llama 3.1 | Abliteracion quirurgica + GRPO anti-slop + FP8 | Hugging Face, GGUF, vLLM |
| meta-llama/Llama-3.1-8B-Instruct | 8.03B densos | 128k | Licencia comunitaria Llama 3.1 | Modelo base alineado | Hugging Face, amplio ecosistema |
| Mistral-7B-Instruct | 7.2B densos | 32k | Apache-2.0 | Modelo generalista alineado | Hugging Face, amplio ecosistema |
| Qwen3-14B | 14B densos | 32k-128k segun variante | Apache-2.0 | Modelo generalista multilingue | Hugging Face |

No se dispone de comparativas de rendimiento estandar (MMLU, HumanEval) entre estos modelos en la informacion proporcionada; la unica comparacion publicada es la "Model Fight Card 16" del autor, cuyos resultados numericos por benchmark no se detallan.

## Limitaciones y advertencias

- La eliminacion de la direccion de rechazo puede aumentar la probabilidad de generar contenido que el modelo base rechazaria; el autor declara explicitamente fuera de alcance el cibercrimen ofensivo, la generacion de malware y el contenido ilegal, pero no se aportan evaluaciones de seguridad independientes.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion; al ser un fine-tune de 8B, el riesgo es comparable al del modelo base.
- Las metricas publicadas son internas del pipeline del autor y no han sido verificadas por terceros; la "Model Fight Card 16" procede de un sitio no contrastado.
- La licencia declarada en metadatos es Apache-2.0, pero al derivar de Llama 3.1 8B Instruct se heredan las restricciones de la licencia comunitaria de Meta (incluida la politica de uso aceptable y la clausula de nomenclatura para productos derivados); conviene revisar ambas antes de uso comercial.
- No se detallan los idiomas soportados; el modelo base esta optimizado para ingles y su rendimiento en castellano puede ser inferior.
- No se especifica la longitud de contexto efectiva tras el fine-tune; se asume la del modelo base, pero no hay confirmacion.
- El modelo tiene muy poca traccion (1 like, ~1.200 descargas) y fue publicado recientemente; no hay evidencia de uso en produccion ni auditorias de robustez.
- El checkpoint FP8 (E4M3) puede presentar pequenas diferencias de comportamiento frente a BF16; el autor reporta retencion del 0.99, pero no se detallan las condiciones de la medicion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de codigo y reporte tecnico: https://github.com/mrAndreyIsachenko/tenet-lab
- Space de auditoria (FP8 & Abliteration Inspector): https://huggingface.co/spaces/mr-andrey-isachenko/fp8-abliteration-inspector
- Coleccion de la familia Tenet v1: https://huggingface.co/mr-andrey-isachenko
- Discusion con la evaluacion "Peer Eval": https://huggingface.co/mr-andrey-isachenko/Tenet-8B-Llama3.1-Unslop-v1/discussions/1
- Model Fight Card 16 (sitio de terceros): https://onlymodels.gg/cards/2026-11-20.html
- Artefactos de la serie House: https://onlymodels.gg/data/card-2026-11-20.json
