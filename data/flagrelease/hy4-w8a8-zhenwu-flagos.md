# FlagRelease/Hy4-W8A8-zhenwu-FlagOS

## Resumen

Hy4-W8A8-zhenwu-FlagOS es una distribucion cuantizada a 8 bits (W8A8) del modelo multimodal Hy4 de Tencent Hunyuan, publicada por la comunidad FlagOS. El modelo original esta disenado para escenarios de productividad real y combina percepcion visual, razonamiento y uso de herramientas para abordar tareas como interpretacion de graficos complejos, operacion de software profesional y flujos de trabajo de investigacion cientifica. Esta version concreta aplica cuantizacion W8A8 mediante compressed-tensors sobre los pesos originales, reduciendo el peso del repositorio a 789,6 GB con 774.434.002.142 parametros totales.

La relevancia de esta publicacion radica en su enfoque de portabilidad hardware: FlagOS ha completado una adaptacion cross-chip en Day-0 que cubre nueve fabricantes de aceleradores (Hygon, Kunlunxin, T-Head, NVIDIA, Huawei Ascend, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX). Segun la model card, en pruebas con doble nodo y 16 GPU sobre plataformas NVIDIA, la pila FlagOS 2.2 logro incrementar el throughput de salida hasta un 32,1% y reducir la latencia media por token hasta un 39,2% frente a la solucion nativa de NVIDIA.

El modelo incorpora por primera vez en la familia Hy4 capacidades de comprension visual y operacion de computadora, ademas de mejoras en seguimiento de instrucciones, comprension de texto largo, ejecucion de tareas de horizonte largo e investigacion profunda. La licencia Apache 2.0 facilita su adopcion comercial, aunque el despliegue requiere infraestructura de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de pipeline: hy_v4_vl, multimodal) |
| Parametros totales | 774.434.002.142 |
| Parametros activos | no disponible |
| Longitud de contexto | 65.536 tokens (configurado en el servidor de inferencia de referencia) |
| Tipos de cuantizacion | W8A8 (8-bit, compressed-tensors) |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo mas alla de su caracter multimodal (etiqueta `hy_v4_vl`) y de las referencias a percepcion visual, razonamiento y uso de herramientas. La model card indica que la version oficial de Hy4 amplia tanto el preentrenamiento como el postentrenamiento respecto a la version preview, e introduce por primera vez comprension visual y capacidad de operacion de computadora. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion es la capa de adaptacion de FlagOS: la pila FlagOS 2.2 incluye cooptimizacion a nivel de framework y de operadores especifica para Hy4, con una imagen Docker preconfigurada (FlagOS-T-Head) que permite despliegue en minutos. El servidor de referencia usa vLLM 0.24.0 con tensor-parallel de 16, `--enable-prefix-caching`, `--max-num-seqs 64`, `--max-num-batched-tokens 2048` y modo de captura CUDA graph `FULL_DECODE_ONLY`. La variante desplegada en el ejemplo se denomina `Hy4-testing-3-W8A8-no-MTP`, lo que sugiere la ausencia de multi-token prediction en esta build.

## Capacidades

- Generacion de texto y razonamiento en chino e ingles.
- Comprension visual: el servidor de referencia admite hasta 16 imagenes y 1 video por prompt (`--limit-mm-per-prompt '{"image":16,"video":1}'`).
- Interpretacion de graficos complejos y documentos visuales.
- Operacion de computadora: control de software profesional y ejecucion de tareas de interfaz.
- Uso de herramientas (tool use) combinado con razonamiento para tareas de productividad.
- Ejecucion de tareas de horizonte largo (long-horizon task execution).
- Investigacion profunda (deep research) y comprension de texto largo.
- Seguimiento de instrucciones mejorado respecto a la version preview.
- Soporte de agentes y razonamiento multi-paso implicitamente derivado de las capacidades anteriores.
- Servicio compatible con la API OpenAI (`/v1/chat/completions`).

## Casos de uso

- Analisis de graficos financieros: el modelo puede recibir imagenes de dashboards y tablas complejas (hasta 16 por prompt) y extraer conclusiones combinando percepcion visual y razonamiento, adecuado para equipos de analisis que trabajan con informes escaneados o capturas de herramientas de BI.
- Automatizacion de oficina financiera: con capacidad de operacion de computadora, puede ejecutar flujos en software profesional (hojas de calculo, ERP) reduciendo la intervencion manual en tareas repetitivas de back-office.
- Desarrollo front-end y de videojuegos: la combinacion de comprension visual y generacion de codigo permite interpretar mockups o capturas de UI y producir codigo asociado, asi como asistir en tareas de depuracion visual.
- Investigacion cientifica asistida: con contexto de 65.536 tokens y capacidad de deep research, puede procesar articulos largos, figuras y tablas para resumir hallazgos y contrastar resultados.
- Agentes de automatizacion de escritorio: la ejecucion de tareas de horizonte largo y el uso de herramientas permiten construir agentes que completan flujos multi-paso sobre aplicaciones reales.
- Atencion al cliente multimodal: puede gestionar conversaciones multi-turno con contexto largo e incorporar imagenes enviadas por el usuario (capturas de error, facturas) para resolver incidencias.
- Despliegue en infraestructura no-NVIDIA: gracias a la adaptacion cross-chip de FlagOS, organizaciones con aceleradores Hygon, Ascend, T-Head o Moore Threads pueden servir el modelo sin depender de GPU NVIDIA.

## Benchmarks y rendimiento

Resultados publicados en la model card comparando la pila nativa de NVIDIA con la pila FlagOS sobre T-Head:

| Metrica | hy4-Nvidia-Origin | hy4-T-Head-FlagOS |
|---|---|---|
| Math-500 | 96,2 | 96,2 |
| GPQA_Diamond | 93,65 | 88,89 |
| mmbench | 91,2 | 90,9 |
| mmstar | 79,67 | 79,47 |

Resultados de capacidad del modelo oficial frente a la version preview, segun la model card:

| Benchmark | Hy4 preview | Hy4 oficial |
|---|---|---|
| Terminal-Bench 4.0 | 26,3 | 44,4 |
| AutomationBench v1.0.6 | 36,3 | 56,2 |

Rendimiento de inferencia (doble nodo, 16 GPU, 64 concurrencia, plataformas NVIDIA): la pila FlagOS 2.2 logro hasta un 32,1% mas de throughput de salida y hasta un 39,2% menos de latencia media por token que la solucion nativa de NVIDIA.

## Requisitos de hardware

- VRAM estimada: con 774.434 millones de parametros en W8A8, el peso en memoria ronda los 774 GB; el despliegue de referencia usa 16 aceleradores PPU-ZW810E en tensor-parallel de 16, es decir, aproximadamente 48-50 GB por dispositivo solo para pesos, mas cache KV y overhead.
- GPU recomendadas: configuracion multi-nodo con 16 aceleradores; en el ejemplo se emplean PPU-ZW810E (plataforma china) y se mencionan plataformas NVIDIA, Huawei Ascend, Hygon, T-Head, Kunlunxin, MetaX, Moore Threads, Tsing Micro e Iluvatar CoreX.
- Consumer GPU: no es viable en GPU de consumo; el modelo no cabe en una RTX 4090 (24 GB) ni en configuraciones multi-GPU de consumo realistas.
- Opciones de despliegue: vLLM 0.24.0 (referencia oficial), imagen Docker FlagOS-T-Head, y descarga de pesos via ModelScope. No se documentan opciones llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: la model card reporta mejoras relativas (hasta -39,2% de latencia por token y +32,1% de throughput frente a la pila nativa de NVIDIA) pero no publica valores absolutos de tokens por segundo.
- Configuracion del servidor de referencia: `--tensor-parallel-size 16`, `--max-model-len 65536`, `--max-num-seqs 64`, `--max-num-batched-tokens 2048`, `--gpu-memory-utilization 0.90`, `--enable-prefix-caching`.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La model card unicamente compara Hy4 con su propia version preview y con la pila nativa de NVIDIA, por lo que no es posible establecer una comparativa fiable con alternativas de la misma categoria sin inventar datos.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Hy4-W8A8-zhenwu-FlagOS | 774,4 B | 65.536 (config. referencia) | Apache 2.0 | Hugging Face / ModelScope |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo chino e ingles declarados; el rendimiento en castellano no esta garantizado ni evaluado.
- La cuantizacion W8A8 puede introducir degradacion respecto al modelo original; la propia model card muestra una caida en GPQA_Diamond de 93,65 a 88,89 al comparar pilas, lo que evidencia sensibilidad al backend de ejecucion.
- Riesgo de alucinacion inherente a modelos de este tamano y a tareas de razonamiento profundo; no se documentan mitigaciones especificas.
- La variante desplegada en el ejemplo (`no-MTP`) omite multi-token prediction, lo que puede afectar al throughput frente a otras builds.
- Requiere infraestructura multi-nodo de gran escala; el coste de despliegue es elevado y no apto para entornos con recursos limitados.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base subyacente (Hy4 de Tencent Hunyuan) deberia verificarse por si impone terminos adicionales no reflejados en esta distribucion.
- La adaptacion cross-chip se valida con benchmarks limitados (Math-500, GPQA_Diamond, mmbench, mmstar); no hay evidencia publica sobre otros dominios en plataformas no-NVIDIA.
- No se dispone de informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-W8A8-zhenwu-FlagOS
- ModelScope (descarga de pesos): `modelscope download --model FlagRelease/Hy4-W8A8-zhenwu-FlagOS`
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/hy4-pp001-gems0.0-tree0.6.2-cxnone-plugin0.0.0-vllm0.24.0-cp312-pt210-hggc130-x64-2.1.1-rbd225:202611201641`
- AnythingLLM (integracion mencionada en la model card): https://anythingllm.com
