# FlagRelease/Hy4-W8A8-metax-FlagOS

## Resumen

Hy4-W8A8-metax-FlagOS es una distribucion cuantizada a 8 bits (W8A8) del modelo multimodal Hy4 de Tencent Hunyuan, publicada por la comunidad FlagOS (FlagRelease) junto con el stack de software unificado multi-chip FlagOS 2.2. El modelo base Hy4 es un modelo multimodal de gran escala orientado a escenarios de productividad real: combina percepcion de imagen, razonamiento y uso de herramientas para operar software profesional, interpretar graficos complejos y ejecutar tareas de investigacion profunda. Esta version concreta anade la adaptacion "Day-0" a plataformas MetaX y un contenedor de despliegue listo para produccion.

El peso real de los safetensors publicados es de 774.434.002.142 parametros (unos 774 mil millones), con un repositorio de 789,6 GB distribuido en 246 shards y 122.940 tensores, lo que lo situa en la categoria de modelos frontera multimodales. La nomenclatura del identificador interno (`hy_v4_vl`, clase `HYV4VLForConditionalGeneration`) confirma la naturaleza vision-lenguaje del modelo. La cuantizacion W8A8 (activaciones y pesos en INT8) se distribuye en formato `compressed-tensors`, con licencia Apache 2.0 e idiomas declarados chino e ingles.

Su relevancia inmediata radica en dos factores: por un lado, es una de las primeras distribuciones publicas de Hy4 en INT8 con adaptacion a hardware no NVIDIA (MetaX C550); por otro, el autor reporta mejoras medibles de rendimiento frente al stack nativo de NVIDIA (hasta +32,1% de throughput de salida y -39,2% de latencia media por token en una prueba de doble nodo, 16 GPU y 64 peticiones concurrentes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (clase `HYV4VLForConditionalGeneration`, familia `hy_v4_vl`); detalles internos de capas y atencion no disponibles |
| Parametros totales | 774.434.002.142 (segun safetensors); `total_size` reportado por el autor: 793.129.169.524 B |
| Parametros activos | no disponible (no se indica que sea MoE, aunque el layout por experto `mlp.experts.<id>.{gate,up,...}` sugiere estructura de mezcla de expertos; no confirmado) |
| Longitud de contexto | no disponible como cifra oficial; el perfil de evaluacion Long-CoT usa 64K de contexto con CoT de ~16K tokens por peticion |
| Tipos de cuantizacion | W8A8 (INT8 en pesos y activaciones), formato `compressed-tensors`; no se listan otros formatos (GGUF, FP8, etc.) |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (246 shards, 122.940 tensores), cuantizacion `compressed-tensors` 8-bit |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la clase de implementacion (`HYV4VLForConditionalGeneration`) y la presencia de un layout por experto en la capa MLP (`mlp.experts.<id>.{gate,up,...}`), lo que apunta a una estructura de mezcla de expertos (MoE) en el bloque de alimentacion hacia delante, aunque el numero de expertos, el ratio de activacion y la dimension oculta no se publican en la informacion proporcionada. El modelo es multimodal: incorpora un codificador visual y un modulo de proyeccion hacia el espacio del lenguaje, dado que la model card menciona percepcion de imagen, comprension de graficos y operacion de interfaces.

Respecto al entrenamiento, la model card indica que la version oficial de Hy4 escala tanto el preentrenamiento como el postentrenamiento respecto a la version preview, e introduce por primera vez capacidades de comprension visual y operacion de ordenador. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. La innovacion tecnica destacable de esta publicacion no esta en el modelo base sino en el stack de inferencia: la adaptacion Day-0 de FlagOS a nueve fabricantes de chips (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX), con cooptimizacion a nivel de framework y de operadores, y el uso de `FULL_DECODE_ONLY` como modo de cudagraph recomendado para decodificacion.

## Capacidades

- Generacion de texto y razonamiento de largo alcance (long-horizon task execution) en chino e ingles.
- Razonamiento matematico de alto nivel: Math-500 de 96,0 en la version FlagOS-MetaX.
- Razonamiento cientifico y de dominio: GPQA_Diamond de 92,55 en la version FlagOS-MetaX.
- Comprension visual: mmbench 91,2 y mmstar 79,67 en la version NVIDIA nativa; en MetaX marcados como "Evaluating".
- Percepcion e interpretacion de graficos complejos y documentos visuales.
- Operacion de ordenador (computer use) y control de software profesional: AutomationBench v1.0.6 sube de 36,3 (preview) a 56,2.
- Ejecucion de tareas en terminal y entornos de linea de comandos: Terminal-Bench 4.0 sube de 26,3 (preview) a 44,4.
- Uso de herramientas (tool calling) combinado con razonamiento y percepcion, segun la descripcion del modelo.
- Modo de razonamiento extendido (Long-CoT) con `reasoning_effort=high` y contextos de 64K.
- Capacidades de investigacion profunda (deep research) y seguimiento de instrucciones mejorado.

## Casos de uso

- Atencion al cliente multimodal: el modelo puede procesar capturas de pantalla o documentos adjuntos junto con texto en conversaciones multi-turno, aprovechando su ventana de contexto extendida (perfil de 64K en evaluacion) para mantener el hilo de incidencias largas en chino e ingles.
- Automatizacion de operaciones de software: con capacidad de computer use y un AutomationBench v1.0.6 de 56,2, puede pilotar interfaces de aplicaciones de oficina, rellenar formularios y ejecutar flujos repetitivos en entornos controlados.
- Agente de terminal y CI/CD: su Terminal-Bench 4.0 de 44,4 lo hace util para tareas de linea de comandos, diagnostico de builds y ejecucion de scripts en pipelines, siempre con supervision humana.
- Analisis de informes financieros y graficos: la combinacion de percepcion visual (mmbench 91,2) y razonamiento matematico (Math-500 96,0) permite extraer tablas, interpretar series temporales y responder preguntas cuantitativas sobre documentos escaneados.
- Desarrollo front-end y de videojuegos asistido: puede interpretar mockups y capturas de interfaz, generar codigo asociado y razonar sobre el estado de una aplicacion en ejecucion, cubriendo el ciclo diseno-implementacion-verificacion.
- Investigacion cientifica asistida: con GPQA_Diamond de 92,55 y modo Long-CoT, es adecuado para explorar hipotesis, resumir literatura tecnica y encadenar razonamientos de varios pasos con citas de contexto largo.
- Despliegue en infraestructura no NVIDIA: al estar adaptado a MetaX C550 y otros ocho fabricantes via FlagOS, permite servir un modelo frontera multimodal en centros de datos con requisitos de soberania tecnologica o sin acceso a GPU NVIDIA.

## Benchmarks y rendimiento

Resultados de calidad reportados por el autor (Hy4-Nvidia-Origin frente a Hy4-MetaX-FlagOS):

| Benchmark | Hy4-Nvidia-Origin | Hy4-MetaX-FlagOS |
|---|---|---|
| Math-500 | 96,2 | 96,0 |
| GPQA_Diamond | 93,65 | 92,55 |
| mmbench | 91,2 | Evaluating |
| mmstar | 79,67 | Evaluating |

Resultados de rendimiento de inferencia (64 concurrentes, 4K entrada / 1K salida, `vllm bench serve` con dataset aleatorio, TP8×PP4):

| Modo cudagraph | Mean TTFT | P99 TTFT | Output tok/s | Total tok/s | Mean TPOT |
|---|---|---|---|---|---|
| `NONE` (solo inductor) | 220,5 s | 539,7 s | 52,31 | 261,56 | 931 ms |
| `FULL_DECODE_ONLY` (recomendado) | 227,2 s | 391,1 s | 80,98 | 404,91 | 568 ms |

El autor reporta que `FULL_DECODE_ONLY` frente a `NONE` supone +55% de throughput de salida, -39% de TPOT medio y -35% de tiempo total; el tramo puro de decodificacion pasa de 96 a 158 tok/s de motor (1,63x). El TTFT incluye encolamiento (64 peticiones inyectadas a la vez; el prefill admite ~2×4K por paso a ~900 tok/s).

Perfil de evaluacion Long-CoT (`reasoning_effort=high`, contexto 64K, CoT por peticion ~16K tokens):

| Concurrencia | Motor en ejecucion | tok/s agregados | Tasa por peticion |
|---|---|---|---|
| 8 | 8 | 26 tok/s | ~3,3 tok/s |
| 13 | 13 | 42-53 tok/s | ~3,2 tok/s |

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial; con 774 mil millones de parametros en W8A8 (INT8) el peso de los pesos ronda los 774 GB, por lo que la inferencia requiere agregacion de memoria en multiples GPU. El autor reporta 739 GiB de pesos en 246 shards sobre NFS compartido.
- Configuracion de referencia medida: 32 GPU MetaX C550 de 64 GB (8 por nodo, 4 nodos), con TP8×PP4.
- GPU recomendadas: MetaX C550 64GB (plataforma validada); el modelo base se ha adaptado tambien a Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, Moore Threads, Tsing Micro e Iluvatar CoreX, aunque no se detallan configuraciones minimas por plataforma.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, etc.) por el tamano del modelo; requiere despliegue multi-GPU de centro de datos.
- Opciones de despliegue: imagen Docker `harbor.baai.ac.cn/flagrelease-public/vllm0.24.0-metax-maca3.8.1.3:2.2.0-gems-main`, con vLLM `0.24.0+flagos`, torch `2.10.0+metax3.8.1.0`, FlagTree/Triton `3.6.0`, transformers `5.17.0` y ray `2.59.0`; componentes vllm-plugin-FL (`day0-hy4-1022-metax-full-decode-graph` @ `530e41a`), FlagGems (`master` @ `83f84f7`) y FlagGems-vllm (@ `ffd0029`).
- Red e interconexion: inbond1 50 GbE (control) y `bnxt_re4` 400 GbE RoCE (datos); el contenedor no incluye `libibverbs`/`bnxt_re`, hay que inyectarlos desde el host o usar `MCCL_IB_DISABLE=1` para caer a socket sobre inbond1 (mas lento).
- Latencia y throughput medidos: 80,98 tok/s de salida y 568 ms de TPOT medio en la configuracion de 32 GPU con `FULL_DECODE_ONLY`; en Long-CoT, 26 tok/s agregados con 8 peticiones concurrentes.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La model card unicamente compara Hy4 con su propia version preview (Terminal-Bench 4.0: 26,3 → 44,4; AutomationBench v1.0.6: 36,3 → 56,2) y con el stack nativo de NVIDIA, no con otros modelos de la competencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy4-W8A8-metax-FlagOS | 774,4 B (W8A8) | no disponible (64K en evaluacion) | Apache 2.0 | Hugging Face / ModelScope (pendiente) | Multimodal, adaptado a MetaX y 9 fabricantes |
| Hy4-Nvidia-Origin | no disponible | no disponible | Apache 2.0 | no disponible en la informacion | Referencia de calidad y rendimiento nativo NVIDIA |
| Hy4 preview | no disponible | no disponible | no disponible | no disponible | Version previa; sin vision ni computer use |

## Limitaciones y advertencias

- Idiomas declarados solo chino e ingles; el rendimiento en castellano u otras lenguas no esta documentado y probablemente sea inferior.
- Riesgo de alucinacion inherente a un modelo de este tamano, especialmente en tareas de computer use y tool calling donde un error se propaga a acciones reales; se recomienda supervision y sandboxing.
- Sesgos no documentados: la model card no publica analisis de sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- La cuantizacion W8A8 introduce una degradacion medible: Math-500 baja de 96,2 a 96,0 y GPQA_Diamond de 93,65 a 92,55; en tareas mas sensibles la perdida podria ser mayor.
- Los benchmarks mmbench y mmstar de la version MetaX estan marcados como "Evaluating": no hay validacion publicada de calidad visual en esta plataforma.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente (20 de noviembre de 2026) sin validacion independiente de la comunidad.
- La distribucion de pesos se realiza via almacenamiento compartido de FlagRelease y ModelScope esta pendiente; el acceso puede ser menos directo que un repositorio estandar de Hugging Face.
- El despliegue exige inyeccion manual de librerias RDMA desde el host para la ruta RoCE; sin ello el rendimiento cae al enlace de 50 GbE.
- El perfil Long-CoT es lento: ~3,3 tok/s por peticion con 8 concurrentes, lo que limita su uso interactivo en razonamiento extendido.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Hy4 de Tencent Hunyuan y de los componentes FlagOS.
- No se publican cifras de contexto maximo oficial, numero de tokens de entrenamiento ni composicion del dataset, lo que dificulta evaluar su robustez fuera de los benchmarks reportados.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-metax-FlagOS
- ModelScope (publicacion pendiente segun la model card): `modelscope download --model FlagRelease/Hy4-W8A8-metax-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/vllm0.24.0-metax-maca3.8.1.3:2.2.0-gems-main`
- Repositorio de pesos en almacenamiento compartido: `/public-flash/models/Hy4-testing-W8A8`
- Documentacion de habilitacion RDMA: `RDMA-ENABLEMENT.md` (referenciada en la model card, no enlazada)
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
