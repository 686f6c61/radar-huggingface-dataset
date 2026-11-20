# FlagRelease/Hy4-W8A8-hygon-FlagOS

## Resumen

Hy4-W8A8-hygon-FlagOS es una distribucion cuantizada del modelo multimodal Hy4 de Tencent Hunyuan, publicada por la comunidad FlagOS. El modelo original es un modelo multimodal disenado para escenarios de productividad real, que combina percepcion de imagen, razonamiento y uso de herramientas para manejar graficos complejos, operar software profesional y servir a tareas de desarrollo front-end, desarrollo de videojuegos, oficina financiera e investigacion cientifica. Esta version concreta corresponde a la adaptacion Day-0 de FlagOS sobre la pila de software unificada multi-chip, en este caso orientada a aceleradores Hygon DCU.

La relevancia de esta publicacion reside en la cuantizacion W8A8 (8 bits para pesos y activaciones) mediante el formato `compressed-tensors`, que reduce el peso del modelo respecto a los pesos en bfloat16 y facilita el despliegue en hardware no-NVIDIA. Segun la model card, en pruebas de doble nodo con 16 GPU y 64 peticiones concurrentes sobre plataformas NVIDIA, la version FlagOS logro hasta un 32,1 % mas de throughput de salida y redujo la latencia media por token hasta un 39,2 % frente a la solucion nativa de NVIDIA.

El modelo cuenta con 774.434.002.142 parametros totales (segun los safetensors del repositorio), un repositorio de 789,6 GB, soporte de chino e ingles, licencia Apache 2.0 y una longitud de contexto configurada en los scripts de despliegue de hasta 131.072 tokens. La model card menciona capacidades de comprension visual y operacion de ordenador introducidas por primera vez en la version oficial respecto al preview.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia `hy_v4_vl`); detalles internos no disponibles |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (valor de `--max-model-len` en los scripts de despliegue) |
| Tipos de cuantizacion | W8A8 (8 bits pesos y activaciones) con `compressed-tensors` |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantizacion W8A8) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su identificacion como `hy_v4_vl`, es decir, un modelo multimodal de la familia Hy4 de Tencent Hunyuan con capacidad de vision. Los scripts de despliegue hacen referencia a componentes tecnicos concretos que permiten inferir algunos aspectos: se activa un backend MoE en Triton (`VLLM_FL_HYGON_W8A8_MOE_BACKEND=triton`, `--moe-backend triton`), lo que indica una arquitectura de mezcla de expertos; se menciona una implementacion de atencion dispersa (`VLLM_FL_SPARSE_ATTN_IMPL=triton`) y una variable `VLLM_FL_HYV4_MLA_WHEEL`, que sugiere el uso de atencion multi-cabeza latente (MLA). Tambien aparece `--reasoning-parser hy_v4`, lo que confirma soporte de modo de razonamiento con parser dedicado.

Respecto al entrenamiento, la model card indica que la version oficial de Hy4 amplia tanto el pre-entrenamiento como el post-entrenamiento respecto al preview, e incorpora por primera vez comprension visual y capacidad de operacion de ordenador. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas concretas de RLHF o DPO. La innovacion tecnica destacable de esta publicacion no es el modelo en si, sino la adaptacion cross-chip de FlagOS: la pila FlagOS 2.2, junto con optimizaciones a nivel de framework y de operadores especificas para Hy4, permite ejecutar el modelo sobre aceleradores de nueve fabricantes (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX).

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Comprension visual: percepcion de imagenes y manejo de graficos y diagramas complejos.
- Operacion de ordenador: capacidad de interactuar con software profesional, introducida en la version oficial respecto al preview.
- Uso de herramientas (tool calling) combinado con razonamiento y percepcion.
- Ejecucion de tareas de horizonte largo (long-horizon task execution).
- Investigacion profunda (deep research) y comprension de textos largos.
- Modo de razonamiento con parser dedicado (`--reasoning-parser hy_v4` en vLLM).
- Soporte de inferencia multimodal dentro de un stack vLLM con backend MoE en Triton y atencion dispersa.

## Casos de uso

- Desarrollo front-end asistido: el modelo puede interpretar capturas o mockups de interfaz y generar o modificar codigo, apoyandose en su comprension visual y en el uso de herramientas para consultar el estado del proyecto.
- Desarrollo de videojuegos: analisis de recursos visuales, generacion de logica de juego y asistencia en pipelines de contenido, aprovechando la combinacion de vision y generacion de codigo.
- Oficina financiera: extraccion y razonamiento sobre tablas y graficos financieros complejos, con capacidad de manejar documentos largos dentro de la ventana de 131.072 tokens.
- Operacion automatizada de software profesional: el modelo puede ejecutar secuencias de acciones sobre aplicaciones de escritorio, util para automatizar flujos repetitivos en entornos corporativos.
- Investigacion cientifica asistida: lectura de articulos y figuras, sintesis de resultados y apoyo a tareas de deep research con contexto largo.
- Agentes multi-paso con tool calling: integracion en pipelines donde el modelo planifica, invoca herramientas y verifica resultados, con soporte de razonamiento explicito mediante el parser `hy_v4`.
- Despliegue en infraestructura no-NVIDIA: organizaciones con aceleradores Hygon DCU, Huawei Ascend, T-Head o Moore Threads pueden servir el modelo con la imagen FlagOS-Hygon y la pila vLLM adaptada, evitando depender de GPU NVIDIA.

## Benchmarks y rendimiento

Resultados publicados en la model card (comparativa entre la version nativa NVIDIA y la version Hygon-FlagOS):

| Metrica | Hy4-Nvidia-Origin | Hy4-Hygon-FlagOS |
|---|---|---|
| Math-500 | 96,2 | 96,2 |
| GPQA_Diamond | 93,65 | En evaluacion |
| mmbench | 91,2 | En evaluacion |
| mmstar | 79,67 | En evaluacion |

Resultados de tareas de agente citados en la model card (version oficial frente al preview):

| Benchmark | Hy4 preview | Hy4 oficial |
|---|---|---|
| Terminal-Bench 4.0 | 26,3 | 44,4 |
| AutomationBench v1.0.6 | 36,3 | 56,2 |

Datos de eficiencia de la adaptacion FlagOS (doble nodo, 16 GPU, 64 peticiones concurrentes, plataformas NVIDIA):

| Metrica | Mejora frente a solucion nativa NVIDIA |
|---|---|
| Throughput de salida | hasta +32,1 % |
| Latencia media por token | hasta -39,2 % |

No se han publicado en la informacion disponible resultados de benchmarks para MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- El repositorio de pesos ocupa 789,6 GB en formato W8A8; el despliegue en bfloat16 requiere memoria adicional para activaciones y cache KV.
- Configuracion de referencia documentada: 2 nodos con 8 Hygon DCU BW1101 por nodo (16 aceleradores en total), cada DCU con 143,98 GiB (147.440 MiB) de memoria.
- Tensor parallel de 16 en la configuracion de referencia, con `--gpu-memory-utilization 0.88`, `--max-num-seqs 64` y `--max-num-batched-tokens 8192`.
- No se documenta despliegue en GPU de consumo (RTX 4090 u otras); por el tamano del modelo (774.000 millones de parametros) no es viable en una unica GPU de consumo.
- Opciones de despliegue: vLLM 0.24.0 con `vllm-plugin-fl` 0.3.0rc2.post1, FlagGems 5.5.0, FlagGems-vllm 0.3.0, FlagTree 0.7.0 y PyTorch 2.10.0 sobre DTK 26.04, todo dentro de la imagen Docker `harbor.baai.ac.cn/flagrelease-public/hy4-hygon001-gems5.5.0-tree0.7.0-...`.
- Backend MoE en Triton y atencion dispersa en Triton; `VLLM_FL_HYV4_MLA_WHEEL=0` en la configuracion documentada.
- No se publican cifras absolutas de latencia ni throughput (solo mejoras relativas frente a la solucion nativa NVIDIA).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hy4-W8A8-hygon-FlagOS | 774,4 B | 131.072 tokens | Apache 2.0 | Version cuantizada W8A8 para Hygon DCU; benchmarks parciales publicados |
| Hy4 (Tencent Hunyuan, version oficial) | no disponible | no disponible | Apache 2.0 (segun esta publicacion) | Modelo original multimodal; referencia de calidad (Math-500 96,2; GPQA_Diamond 93,65; mmbench 91,2; mmstar 79,67) |
| Hy4 preview | no disponible | no disponible | no disponible | Version previa; Terminal-Bench 4.0 26,3 y AutomationBench v1.0.6 36,3 |

No se dispone en la informacion proporcionada de datos sobre otros modelos multimodales comparables (por ejemplo, de otros fabricantes) que permitan una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- Solo se declaran idiomas chino e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Los benchmarks de GPQA_Diamond, mmbench y mmstar para la version Hygon-FlagOS figuran como "Evaluating"; no hay validacion publicada de que la cuantizacion W8A8 preserve la calidad en todas las tareas.
- El modelo es extremadamente grande (774.000 millones de parametros, repositorio de 789,6 GB): requiere infraestructura multi-nodo y no es desplegable en hardware de consumo.
- La configuracion documentada esta ligada a Hygon DCU BW1101 y a versiones muy concretas de DTK, vLLM y plugins; la reproducibilidad fuera de ese stack no esta garantizada.
- No se detallan sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo original de Tencent Hunyuan y de los componentes de la pila FlagOS antes de un uso comercial.
- El modelo tiene capacidad de operar software y ejecutar acciones; en produccion debe acompanarse de sandboxing y supervision, dado el riesgo inherente a agentes que controlan aplicaciones.
- La model card incluye referencias a una version "preview" y a un modelo distinto en el segundo nodo (`Hy4-testing-3-W8A8-no-MTP`), lo que sugiere que la configuracion publicada puede corresponder a un entorno de pruebas y no a un despliegue final consolidado.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-hygon-FlagOS
- Imagen Docker FlagOS-Hygon: `harbor.baai.ac.cn/flagrelease-public/hy4-hygon001-gems5.5.0-tree0.7.0-cxnone-plugin0.3.0-gemsvllm0.3.0-vllm0.24.0-cp310-pt210-dtk2604-x64-6.4.0-v1.7.0c:202611171553`
- Descarga de pesos via ModelScope: `modelscope download --model FlagRelease/Hy4-W8A8-hygon-FlagOS`
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
