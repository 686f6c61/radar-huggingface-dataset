# FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K192-NVFP4

## Resumen

Qwen3.8-Flash-Next-ZH-Writing-RP-K192-NVFP4 es un ajuste derivado de Qwen/Qwen3.8-Flash-Next, publicado por el usuario FangZhang5959, orientado de forma exclusiva a la escritura creativa en chino y al roleplay (RP). No se trata de un modelo nuevo entrenado desde cero, sino de un proceso de poda de expertos sobre un modelo MoE: se reduce el numero de expertos enrutados de 512 a 192 manteniendo el top-10 de enrutamiento, mediante la mascara `v3_M2d`, y se cuantiza el resultado en NVFP4 para su despliegue en servidores con vLLM 0.34.0. La arquitectura declarada es `Qwen4ExpForConditionalGeneration`, con 48 capas y 192 expertos enrutados.

El modelo se distribuye en formato safetensors, con 21 fragmentos y 112.252 tensores, y un peso neto de 60,532 GiB (60,579 GiB de directorio). Incorpora cuantizacion calibrada W4A16_NVFP4 por grupos de 16 para los expertos, mantiene en BF16 byte a byte las capas sensibles (`lm_head`, `embed_tokens`, `model.visual.*`, `hyper_connection`, `linear_attn`, `self_attn`, `mlp.gate` y `shared_expert`) y aplica NVFP4 nativo al vocabulario PLE/Engram, que pasa de 95,37 GiB a 26,822 GiB con `cpu_offload=True`.

Su relevancia es acotada y muy especifica: segun la model card, obtiene Elo 1784 en escritura china y 1643 en RP chino en evaluacion ciega con la misma mascara, frente a una linea base de 1500 con 512 expertos en IQ3_S. A cambio, el autor advierte de una degradacion severa fuera de dominio: Pass@1 en codigo del 0,0 %, 23,3 % en Wikipedia china y 66,7 % en LogiQA2, ademas de errores ortograficos en ingles. Es, por tanto, un peso vertical para creacion literaria local en chino, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration` (MoE, 48 capas, 192 expertos enrutados, top-10) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-10 sobre 192 expertos, sin recuento publicado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16_NVFP4 (group-16, E2M1 + escalas E4M3) en expertos; NVFP4 nativo en PLE/Engram; BF16 en capas sensibles |
| Idiomas soportados | chino (`zh`) |
| Licencia | Qwen Community License 1.0 (`license: other`) |
| Formato de pesos | safetensors (21 fragmentos, 112.252 tensores, 60,532 GiB netos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next, un transformer disperso (MoE) con 48 capas, y le aplica una poda de expertos de 512 a 192 conservando el top-10 de enrutamiento mediante la mascara `v3_M2d`. Sobre esa base se superpone un parche de 96 tensores no experto procedente de `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2`. No se documenta un entrenamiento adicional con datos propios ni fases de RLHF o DPO en la informacion disponible; el trabajo descrito es de compresion y cuantizacion, no de preentrenamiento.

La innovacion tecnica principal esta en la cuantizacion: los expertos se almacenan en W4A16_NVFP4 con calibracion ponderada por activaciones, grupos de 16 y una `weight_scale_2` compartida en FP32 para `gate_proj`/`up_proj`, lo que evita el conflicto de divisibilidad de grupo-128 con `moe_intermediate_size=640` bajo TP4/TP8. El vocabulario PLE/Engram usa NVFP4 nativo de vLLM 0.34.0 y se mantiene en memoria de CPU con `cpu_offload=True` (UVA en Linux), reduciendo su huella de 95,37 GiB a 26,822 GiB. Las capas sensibles se conservan en BF16 original byte a byte. El autor declara compatibilidad con decodificacion especulativa heterogenea mediante el modelo auxiliar `Qwen3.8-Flash-Next-MTP512-BF16`, sin parches sobre vLLM.

## Capacidades

- Generacion de texto creativo en chino: narrativa literaria, ficcion y prosa, con Elo 1784 en escritura china segun la model card.
- Roleplay multi-turno en chino: Elo 1643 y puntuacion 8,35 en la evaluacion ciega declarada.
- Estilo y voz narrativa: el ajuste esta orientado a mantener personajes y tono a lo largo de conversaciones.
- Decodificacion especulativa: soporta MTP con `Qwen3.8-Flash-Next-MTP512-BF16` para acelerar la generacion.
- Capacidades multilingues: limitadas al chino; el propio autor reporta errores ortograficos en ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Razonamiento multi-paso y agentes: no disponible; el rendimiento en LogiQA2 (66,7 %) sugiere capacidad limitada fuera de dominio.
- Vision: el checkpoint conserva `model.visual.*` en BF16, pero no se documenta su uso ni su calidad.

## Casos de uso

- Escritura literaria asistida en chino: generacion de capitulos, dialogos y descripciones con control de estilo mediante los parametros de muestreo recomendados (temperatura 0,7, top_p 0,8, top_k 20, min_p 0,1, repetition_penalty 1,1). Es adecuado porque el ajuste esta calibrado especificamente para prosa china.
- Roleplay y compania conversacional: mantener personajes coherentes en sesiones largas multi-turno, aprovechando la poda de expertos para reducir coste de inferencia sin perder el enrutamiento top-10.
- Generacion de guiones y ficcion serializada: produccion de borradores de novelas ligeras o web novels en chino, donde el Elo 1784 reportado indica preferencia humana frente a la linea base.
- Prototipado de narrativa interactiva: integracion en motores de ficcion interactiva o videojuegos narrativos en chino, con despliegue en vLLM 0.34.0 y decodificacion especulativa MTP para reducir latencia.
- Investigacion sobre poda de MoE: el checkpoint sirve como referencia reproducible de poda 512→192 con mascara `v3_M2d` y cuantizacion NVFP4, util para estudiar el impacto de la compresion en calidad literaria.
- Despliegue local en GPU de consumo: con PLE en memoria de CPU, el autor reporta una prueba en RTX 5070 Ti de 16 GiB (3 capas de主干 + MTP completo) a 34,68 tok/s, lo que permite experimentar en estaciones de trabajo modestas.
- Evaluacion comparativa de cuantizaciones: comparar NVFP4 frente a GGUF `v1a` con la misma mascara para medir la perdida de calidad introducida por la cuantizacion.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (evaluacion ciega y pruebas propias; no verificados de forma independiente):

| Benchmark | Resultado | Referencia |
|---|---|---|
| Elo escritura china (ciega) | 1784 | 1500 (512 expertos IQ3_S) |
| Puntuacion literaria china | 7,69 | no disponible |
| Elo RP chino (ciego) | 1643 | 1500 (512 expertos IQ3_S) |
| Puntuacion RP china | 8,35 | no disponible |
| Codigo Pass@1 | 0,0 % | no disponible |
| Chinese-SimpleQA (Wikipedia china) | 23,3 % | no disponible |
| LogiQA2 | 66,7 % | no disponible |
| Throughput (RTX 5070 Ti, 3 capas + MTP) | 34,68 tok/s | no disponible |
| VRAM en esa prueba | 9,38 GiB | no disponible |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 33,7 GiB para el tronco en GPU, con PLE/Engram en memoria de CPU (26,822 GiB en RAM paginada). Con el modelo MTP512-BF16 se anaden unos 7,2 GiB.
- GPU recomendadas: el peso total ronda los 60,5 GiB, por lo que el despliegue completo requiere GPUs de 40-80 GiB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU con TP4/TP8; la cuantizacion esta disenada para evitar conflictos de grupo bajo TP4/TP8.
- GPU de consumo: el autor valida una configuracion parcial (3 capas de tronco + MTP completo) en RTX 5070 Ti de 16 GiB bajo WSL2, con 9,38 GiB de VRAM y 34,68 tok/s. No cabe completo en GPU de consumo.
- Opciones de despliegue: vLLM 0.34.0 con backend Marlin (`--moe-backend marlin`), `transformers>=5.22.2` y `compressed-tensors>=0.17.0`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: 34,68 tok/s en la prueba de 3 capas con MTP; no hay mediciones publicadas para el modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ZH-Writing-RP-K192-NVFP4 | no disponible (MoE 48 capas, 192 expertos) | no disponible | Escritura y RP en chino, NVFP4 | Qwen Community License 1.0 | Hugging Face, ModelScope, GitHub |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible (MoE 512 expertos) | no disponible | Proposito general | Qwen Community License 1.0 | Hugging Face |
| Huihui-Qwen3.8-Flash-Next-abliterated-v2 | no disponible | no disponible | Base sin filtros de rechazo | no disponible | Hugging Face |
| Version GGUF `v1a` del mismo ajuste | no disponible | no disponible | Escritura y RP en chino, cuantizacion GGUF | Qwen Community License 1.0 | Hugging Face |

La comparativa se limita a la familia de origen porque no se dispone de datos de benchmarks de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion severa fuera de dominio: codigo Pass@1 del 0,0 %, Chinese-SimpleQA del 23,3 % y LogiQA2 del 66,7 %. No debe emplearse para programacion, ciencia, ingenieria ni consultas enciclopedicas.
- Ingles deficiente: el autor reporta errores ortograficos; el modelo solo declara soporte de chino.
- Riesgo de alucinacion: sin datos de evaluacion de factualidad; el uso previsto es creativo, donde la invencion es esperable pero no verificable.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el parche abliterated del modelo base puede alterar el comportamiento de rechazo.
- Licencia restrictiva: Qwen Community License 1.0 permite uso personal, local, modificacion y redistribucion con atribucion, pero el uso comercial como MaaS o en asistentes comerciales de programacion u ofimatica requiere autorizacion adicional de Qwen.
- Requisitos de despliegue estrictos: depende de vLLM 0.34.0, `transformers>=5.22.2` y `compressed-tensors>=0.17.0`; no hay soporte documentado para otros runtimes.
- Huella de memoria: requiere CPU con memoria paginada suficiente para el PLE/Engram (26,822 GiB) ademas de la VRAM del tronco.
- Madurez: publicado el 27 de noviembre de 2026, con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de los resultados declarados.

## Enlaces

- Hugging Face: https://huggingface.co/FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K192-NVFP4
- Repositorio GitHub: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP
- README tecnico en ingles: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP/blob/main/README_EN.md
- ModelScope: https://modelscope.cn/models/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP-K192-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Parche no experto (abliterated): https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2
