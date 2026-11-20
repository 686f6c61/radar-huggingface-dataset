# FlagRelease/Hy4-W8A8-mthreads-FlagOS

## Resumen

Hy4-W8A8-mthreads-FlagOS es una distribucion cuantizada en 8 bits (W8A8) del modelo multimodal Hy4 de Tencent Hunyuan, publicada por la comunidad FlagOS. El modelo original Hy4 esta disenado para escenarios de productividad real: combina percepcion de imagen, razonamiento y uso de herramientas para operar software profesional, interpretar graficos complejos y asistir en tareas de desarrollo front-end, videojuegos, oficina financiera e investigacion cientifica. Esta version concreta es la adaptacion de FlagOS para plataformas Moore Threads (MTT S5000), con pesos comprimidos mediante `compressed-tensors` y orientada a despliegue multi-nodo.

El modelo cuenta con 774.434.002.142 parametros totales (segun los safetensors del repositorio), lo que lo situa en la categoria de modelos frontera de gran escala. La model card indica que Hy4 incorpora por primera vez comprension visual y capacidad de operacion de ordenador respecto a la version preview, ademas de mejoras en seguimiento de instrucciones, comprension de texto largo, ejecucion de tareas de horizonte largo e investigacion profunda. Segun las evaluaciones publicadas por Tencent Hunyuan, la puntuacion en Terminal-Bench 4.0 sube de 26,3 (preview) a 44,4, y en AutomationBench v1.0.6 de 36,3 a 56,2.

La relevancia de esta ficha radica en que FlagOS ha realizado una adaptacion Day-0 a traves de su pila de software multi-chip unificada, cubriendo 9 fabricantes de chips (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX). En pruebas de doble nodo con 16 GPU y 64 peticiones concurrentes sobre plataformas NVIDIA, la version FlagOS reporta hasta un 32,1 % mas de throughput de salida y hasta un 39,2 % menos de latencia media por token frente a la solucion nativa de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Hy4 de Tencent Hunyuan; detalles internos no disponibles) |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | 49.152 tokens (configuracion de servidor en la model card) |
| Tipos de cuantizacion | W8A8 (8 bits pesos y activaciones), formato `compressed-tensors` |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion 8-bit) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su naturaleza multimodal y su pertenencia a la familia Hy4 de Tencent Hunyuan. La model card menciona que la version oficial escala tanto el pre-entrenamiento como el post-entrenamiento respecto a la preview, e introduce por primera vez comprension visual y capacidad de operacion de ordenador. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable en esta publicacion es la capa de optimizacion de FlagOS: la pila FlagOS 2.2 incluye co-optimizacion a nivel de framework y de operadores especifica para Hy4, con soporte para backends de atencion `dsa` (con `flashmla_sparse` para prefill y decode), decodificacion especulativa mediante parsers de razonamiento y tool calling (`hy_v4`), y cuantizacion KV-cache en `fp8_e4m3`. El despliegue documentado usa SGLang 0.5.6 con `tp-size 8`, `pp-size 2` y `dp-size 1` sobre dos nodos.

## Capacidades

- Generacion de texto y razonamiento multimodal: procesa imagenes junto con texto para interpretar graficos complejos y documentos visuales.
- Comprension visual: capacidad de percepcion de imagen incorporada por primera vez en la version oficial de Hy4.
- Operacion de ordenador: el modelo puede interactuar con software profesional, segun la model card.
- Razonamiento y matematicas: puntuaciones altas en Math-500 (95,6 en la version FlagOS) y GPQA Diamond (88,38).
- Tool calling / function calling: soportado mediante el parser `hy_v4` configurado en el servidor de inferencia.
- Razonamiento multi-paso y tareas de horizonte largo: mejoras declaradas en ejecucion de tareas largas e investigacion profunda.
- Capacidades multilingues: chino e ingles.
- Modo de razonamiento: el parser `--reasoning-parser hy_v4` sugiere soporte de cadenas de razonamiento explicitas.
- Desarrollo front-end y de videojuegos: caso de uso declarado por el autor.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto de hasta 49.152 tokens, suficiente para incorporar historiales extensos y documentacion de producto en la misma ventana.
- Generacion de codigo en produccion: el soporte de tool calling y el parser dedicado permiten integrarlo en pipelines de CI/CD para generar, revisar y corregir codigo con acceso a herramientas externas.
- Analisis de graficos y documentos financieros: su capacidad de percepcion visual permite extraer e interpretar datos de graficos complejos en tareas de oficina financiera.
- Operacion automatizada de software profesional: la capacidad de computer operation declarada permite automatizar flujos en aplicaciones de escritorio o entornos profesionales.
- Investigacion cientifica asistida: el razonamiento multi-paso y las puntuaciones en GPQA Diamond lo hacen adecuado para tareas de analisis y sintesis en dominios cientificos.
- Desarrollo de videojuegos y front-end: puede asistir en la generacion de codigo, documentacion y analisis de assets visuales en estos dominios.
- Despliegue en infraestructura no-NVIDIA: gracias a la adaptacion multi-chip de FlagOS, puede ejecutarse en plataformas como Moore Threads, Huawei Ascend, Hygon o T-Head cuando el hardware NVIDIA no esta disponible.

## Benchmarks y rendimiento

| Metrica | Hy4-Nvidia-Origin | Hy4-Mthreads-FlagOS |
|---|---|---|
| Math-500 | 96,2 | 95,6 |
| GPQA Diamond | 93,65 | 88,38 |
| MMBench | 91,2 | en evaluacion |
| MMStar | 79,67 | en evaluacion |

Datos adicionales reportados en la model card: Terminal-Bench 4.0 pasa de 26,3 (preview) a 44,4 en la version oficial, y AutomationBench v1.0.6 de 36,3 a 56,2. En pruebas de doble nodo con 16 GPU y 64 peticiones concurrentes sobre NVIDIA, la version FlagOS reporta hasta un 32,1 % mas de throughput de salida y hasta un 39,2 % menos de latencia media por token frente a la solucion nativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 774.434 millones de parametros en W8A8, el peso de los pesos ronda los 774 GB; el repositorio ocupa 789,6 GB. Se requiere agregacion de memoria entre multiples GPU.
- GPU recomendadas: el despliegue documentado usa 16 GPU Moore Threads MTT S5000 en dos nodos, con `tp-size 8` y `pp-size 2`.
- Cabe en GPU consumer: no. El tamano del modelo exige un cluster multi-GPU multi-nodo.
- Opciones de despliegue: SGLang 0.5.6 (documentado en la model card) sobre la imagen Docker de FlagOS; el stack menciona tambien vLLM 0.10.1 en la imagen. No se documenta soporte de llama.cpp u Ollama para este tamano.
- Latencia y throughput: no se publican valores absolutos de latencia o throughput; solo mejoras relativas (hasta 32,1 % mas de throughput y 39,2 % menos de latencia por token frente a la version nativa NVIDIA en el escenario de prueba indicado).
- Configuracion de servidor documentada: `--context-length 49152`, `--max-running-requests 64`, `--max-total-tokens 344064`, `--mem-fraction-static 0.88`, KV-cache en `fp8_e4m3`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-W8A8-mthreads-FlagOS | 774,4 B | 49.152 tokens (config. documentada) | Apache 2.0 | Hugging Face (FlagRelease) |
| Hy4 (NVIDIA origin) | no disponible | no disponible | Apache 2.0 | Referenciado en la model card como solucion nativa |
| Hy4 preview | no disponible | no disponible | Apache 2.0 | Version previa de Tencent Hunyuan |

No se dispone de datos de benchmarks ni especificaciones de modelos alternativos de terceros en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa con otras familias.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una publicacion muy reciente y sin validacion comunitaria amplia.
- Los benchmarks de MMBench y MMStar figuran como "Evaluating" en la version FlagOS, por lo que su rendimiento multimodal no esta confirmado en esta distribucion.
- La diferencia en GPQA Diamond entre la version nativa (93,65) y la FlagOS (88,38) es notable (5,27 puntos), lo que sugiere cierta degradacion por la cuantizacion o la adaptacion de plataforma.
- Solo se declaran idiomas chino e ingles; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente a los modelos de gran escala; no se documentan medidas especificas de mitigacion.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente (Hy4 de Tencent Hunyuan) deberia verificarse por si tuviera terminos adicionales no reflejados en esta distribucion.
- El despliegue requiere hardware especializado (Moore Threads MTT S5000 u otras plataformas soportadas por FlagOS) y una configuracion multi-nodo compleja; no es apto para entornos de una sola GPU.
- La model card esta parcialmente en chino y la documentacion de parametros internos es escasa.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-mthreads-FlagOS
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/hy4_preview-mthreads001-gems5.3.0-tree0.6.1-cx0.13.0-pluginnone-vllm0.10.1-sglang0.0.0-sglangfl0.1.0-cp310-pt29-musa43-x64-3.3.5-server:202610230915-clean`
- Descarga via ModelScope: `modelscope download --model FlagRelease/Hy4-W8A8-mthreads-FlagOS`
- No se han proporcionado enlaces adicionales a papers, blogs o demos en la informacion disponible.
