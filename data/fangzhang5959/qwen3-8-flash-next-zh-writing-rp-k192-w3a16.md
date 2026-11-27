# FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K192-W3A16

## Resumen

Qwen3.8-Flash-Next-ZH-Writing-RP-K192-W3A16 es una versión podada y cuantizada del modelo Qwen3.8-Flash-Next, publicada por el usuario FangZhang5959. Se trata de un ajuste vertical orientado exclusivamente a la escritura creativa en chino y al roleplay (RP), construido mediante una poda de expertos de 512 a 192 (manteniendo top-10) sobre el modelo base, con un parche de expertos no enrutados derivado de la variante abliterated de huihui-ai.

La arquitectura subyacente es un transformer MoE con 48 capas y 192 expertos enrutados con top-10, empaquetado en formato `compressed-tensors` con cuantización W3A16 (uint3b4, group-64) sobre los expertos y capas sensibles en BF16 original. El repositorio ocupa 53,981 GiB repartidos en 21 shards y 84.604 tensores, y está diseñado para desplegarse con `vllm==0.34.0` y el backend Humming, con decodificación especulativa MTP opcional.

Su relevancia es acotada pero clara: demuestra una cadena de compresión agresiva (poda de expertos más cuantización de 3 bits calibrada por activaciones) que reduce el peso a unos 27,1 GiB de VRAM en GPU manteniendo un rendimiento declarado alto en su nicho (Elo 1626 en escritura china, Elo 1592 en RP chino). Como contrapartida, el propio autor advierte de una degradación severa fuera de dominio (Pass@1 en código del 0,0 %, 18,3 % en百科 chino).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen4ExpForConditionalGeneration`, transformer MoE de 48 capas, 192 expertos enrutados, top-10 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-10 de 192 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W3A16 (uint3b4, group-64, backend Humming) en expertos; BF16 en capas sensibles; PLE en NVFP4 |
| Idiomas soportados | chino (zh) |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | safetensors (`compressed-tensors`), 21 shards, 84.604 tensores |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.8-Flash-Next`, un MoE de 48 capas con 512 expertos enrutados y top-10, al que se le aplica una poda de expertos de 512 a 192 conservando el top-10, mediante la máscara `v3_M2d` y la técnica REAP (referenciada en los tags). Sobre los expertos no enrutados se aplica un parche derivado de `huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2`, lo que elimina parte de los rechazos del modelo original. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset de ajuste.

La innovación técnica principal está en la compresión: los expertos se cuantizan a W3A16 con calibración por activaciones (segundo momento sobre `corpus_v3`), aplicando un recorte de rango de 48 puntos en `[0.22..1.05]` y un refinamiento de escalas Lloyd-Max WLS en 2 pasos, lo que según el autor reduce el MSE ponderado por activaciones un 75,3 % frente a un RTN sin calibrar. Las capas sensibles (`lm_head`, `embed_tokens`, `model.visual.*`, `hyper_connection`, `linear_attn`, `self_attn`, `mlp.gate`, `shared_expert`) se conservan en BF16 byte a byte. La tabla PLE/Engram se mantiene en NVFP4 nativo (26,822 GiB) con `cpu_offload=True` por defecto en Linux, y se soporta decodificación especulativa MTP con el checkpoint independiente `Qwen3.8-Flash-Next-MTP512-BF16`.

## Capacidades

- Generación de texto creativo en chino: narrativa literaria, descripción de escenas, diálogo y estilo.
- Roleplay multi-turno en chino, con mantenimiento de personaje y tono.
- Escritura asistida de ficción y guiones en chino.
- Decodificación especulativa MTP para acelerar la generación (requiere checkpoint MTP separado).
- Despliegue en vLLM con backend Humming y cuantización W3A16.
- Capacidades fuera de dominio muy limitadas: código (Pass@1 0,0 %), conocimiento enciclopédico chino (18,3 %) y razonamiento lógico (LogiQA2 52,4 %).
- No se documenta soporte de tool calling, function calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Escritura de ficción y narrativa en chino: el modelo está ajustado específicamente para prosa literaria en chino, con un Elo de 1626 en escritura creativa china según la evaluación del autor, lo que lo hace adecuado para generar borradores de relatos, capítulos y descripciones.
- Roleplay conversacional: con Elo 1592 en RP chino, puede sostener interacciones de personaje multi-turno en aplicaciones de entretenimiento o prototipos de chatbots de rol, siempre que el contexto se mantenga dentro de su ventana (no disponible).
- Asistencia a guionistas y autores: generación de variantes de escena, diálogos alternativos y reescritura estilística en chino, aprovechando el ajuste fino sobre corpus literario.
- Prototipado de experiencias interactivas: integración en demos de novela visual o juegos de texto en chino, con despliegue local en una GPU de 27,1 GiB de VRAM para el backbone.
- Investigación sobre compresión de MoE: el checkpoint sirve como caso de estudio reproducible de poda de expertos (512→192) y cuantización W3A16 calibrada por activaciones, con auditoría SHA-256 de los 21 shards.
- Evaluación de decodificación especulativa: permite medir el impacto de MTP512-BF16 sobre un MoE podado y cuantizado en vLLM 0.34.0, con métricas declaradas de 84,73 tok/s en la puerta de validación del autor.
- Generación de contenido editorial en chino para blogs o newsletters, con revisión humana obligatoria por el riesgo de alucinación y la degradación fuera de dominio.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| Escritura creativa china (Elo, blind) | 1626 | Evaluación del autor, misma máscara que GGUF `v1b` |
| Puntuación literaria china | 6,84 | Evaluación del autor |
| Roleplay chino (Elo, blind) | 1592 | Evaluación del autor |
| Puntuación RP china | 7,91 | Evaluación del autor |
| Código Pass@1 | 0,0 % | Degradación severa fuera de dominio |
| Chinese-SimpleQA (百科) | 18,3 % | Degradación severa fuera de dominio |
| LogiQA2 | 52,4 % | Razonamiento lógico limitado |
| Throughput (vLLM 0.34.0, Humming + MTP512-BF16) | 84,73 tok/s | Puerta de validación del autor, 114,5 s, 8,95 GiB VRAM en la prueba de 3 capas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM del backbone en GPU: aproximadamente 27,1 GiB con la tabla PLE en memoria del sistema (`cpu_offload=True`).
- VRAM adicional si se usa decodificación especulativa MTP: 7,2 GiB para el checkpoint `MTP512-BF16`.
- VRAM total estimada del repositorio en disco: 53,981 GiB (21 shards); la tabla PLE NVFP4 ocupa 26,822 GiB.
- GPU recomendadas: A100 80 GB, H100 80 GB o GPUs con al menos 40 GB para alojar backbone y MTP con margen; en GPUs de 24 GB no cabe el backbone completo sin offload adicional.
- No cabe en GPUs de consumo de 24 GB en configuración estándar; requiere al menos una GPU de 40 GB o particionado con offload.
- Despliegue: `vllm==0.34.0` con `--moe-backend humming`, `transformers>=5.22.2`, `compressed-tensors>=0.17.0`, `humming-kernels>=0.1.19`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Throughput declarado: 84,73 tok/s en la prueba de validación del autor (3 capas, 114,5 s, 8,95 GiB VRAM); no hay datos de latencia para el modelo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-ZH-Writing-RP-K192-W3A16 | no disponible (MoE 192 expertos, top-10) | no disponible | Escritura y RP en chino, cuantizado W3A16 | qwen-community-1.0 | Hugging Face, ModelScope, GitHub |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible (MoE 512 expertos, top-10) | no disponible | Modelo generalista | qwen-community-1.0 | Hugging Face |
| Huihui-Qwen3.8-Flash-Next-abliterated-v2 | no disponible | no disponible | Generalista sin rechazos | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de nicho: el autor declara explícitamente que no debe usarse para programación, enciclopedias técnicas ni tareas generales en inglés; el rendimiento en esos dominios es muy bajo (Pass@1 0,0 %, Chinese-SimpleQA 18,3 %).
- Solo soporta chino; no hay soporte documentado de otros idiomas (los tracks en inglés están previstos para una V2).
- Riesgo de alucinación elevado fuera del dominio literario y de RP, dado el ajuste vertical y la poda de expertos.
- La poda de expertos (512→192) y la cuantización W3A16 pueden introducir degradaciones no medidas en tareas distintas de las evaluadas por el autor.
- El parche abliterated elimina rechazos del modelo original, lo que aumenta el riesgo de generar contenido inapropiado; se requiere moderación en producción.
- Licencia Qwen Community License 1.0: uso personal y local permitido con conservación de avisos de copyright; el uso comercial como MaaS o en productos comerciales de asistencia a programación/ofimática requiere autorización adicional de Qwen.
- Requiere versiones muy concretas de vLLM, transformers, compressed-tensors y humming-kernels; la incompatibilidad de versiones puede impedir la carga.
- El modelo depende de `cpu_offload` para la tabla PLE, lo que añade latencia y requiere memoria del sistema suficiente.
- Sin datos publicados de contexto máximo, parámetros totales ni composición del dataset de ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/FangZhang5959/Qwen3.8-Flash-Next-ZH-Writing-RP-K192-W3A16
- GitHub del proyecto: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP
- README técnico en inglés: https://github.com/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP/blob/main/README_EN.md
- ModelScope (espejo): https://modelscope.cn/models/FangZhangTNS/Qwen3.8-Flash-Next-ZH-Writing-RP-K192-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Parche abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-Flash-Next-abliterated-v2
