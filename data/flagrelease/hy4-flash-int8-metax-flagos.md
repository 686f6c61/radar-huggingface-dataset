# FlagRelease/Hy4-flash-INT8-metax-FlagOS

## Resumen

Hy4 Flash es un modelo multimodal de tipo texto-imagen desarrollado por Tencent Hunyuan (Grupo Tencent) y redistribuido en esta ficha a través de la comunidad FlagRelease sobre el stack de software multi-chip FlagOS. Se trata de un modelo de aproximadamente 220.000 millones de parámetros totales, de los cuales unos 12.000 millones se activan por token, con una longitud de contexto máxima de 1 millón de tokens. Está diseñado para cargas de trabajo de oficina: búsqueda profunda, procesamiento de documentos, generación de presentaciones y Computer Use.

La relevancia de esta variante concreta radica en su adaptación Day 0 a nueve fabricantes de chips (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX) mediante FlagOS 2.2, con una mejora declarada de hasta el 35,9% en throughput de salida y una reducción de hasta el 29,1% en latencia hasta el primer token frente al stack nativo de NVIDIA sobre H100. Los pesos publicados en este repositorio son una cuantización INT8 W8A8 en formato compressed-tensors, orientada a despliegue en hardware MetaX C550.

Arquitectónicamente combina atención híbrida, Latent MoE y una arquitectura denominada Engram, con una huella de KV Cache declarada de una sexta parte de la de Hy4. En el benchmark interno WorkIndex de Tencent Hunyuan obtiene 42,1 frente a los 39,7 de Hy4 Preview, con un coste por tarea inferior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida, Latent MoE y Engram |
| Parámetros totales | 220.251.201.958 (aprox. 220 B, incluyendo unos 64 B de parámetros Engram) |
| Parámetros activos | Aprox. 12 B por token |
| Longitud de contexto | 1.000.000 tokens (máximo) |
| Tipos de cuantización | INT8 W8A8 (pesos y activaciones) en formato compressed-tensors |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8-bit, compressed-tensors); 148 shards, 268,6 GiB |
| Tipo de modelo | `hy_v4_flash`; 42 capas, hidden size 3072, 512 expertos, top-16, VL (vision-language), sin MTP |
| Modalidades | Entrada texto e imagen; salida texto |
| Tamaño del repositorio | 288,6 GB |

## Arquitectura y entrenamiento

Hy4 Flash emplea una arquitectura híbrida que combina mecanismos de atención con un esquema Latent MoE de 512 expertos y activación top-16, más un componente propietario denominado Engram que, según la model card, requiere 126,9 GB de memoria host fijada (pinned) durante la inferencia. El modelo tiene 42 capas con un tamaño oculto de 3072 y está configurado como modelo vision-language (VL) sin Multi-Token Prediction (MTP). La atención híbrida y el diseño de KV Cache reducen la huella de caché a una sexta parte de la del modelo Hy4, lo que resulta determinante para sostener un contexto de 1 millón de tokens en despliegues reales.

No se dispone de información detallada sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la documentación proporcionada. La model card sí menciona optimizaciones de rendimiento en FlagOS 2.2 y una adaptación específica a MetaX mediante el plugin vllm-plugin-FL, con kernels propios para operaciones como `fused_moe`, `grouped_topk`, `hy4_flash_fwht_quant_fp8`, `hy4_flash_gated_pool` y `hy4_flash_rotate_indexer`, entre otras.

## Capacidades

- Generación de texto y razonamiento de propósito general en chino e inglés.
- Comprensión de imágenes como entrada (modelo multimodal VL) con salida exclusivamente textual.
- Procesamiento de documentos extensos gracias a una ventana de contexto de hasta 1 millón de tokens.
- Búsqueda profunda (deep search) y recuperación de información sobre grandes corpus.
- Generación de presentaciones (PPT) y tareas de productividad ofimática.
- Computer Use: interacción con entornos de escritorio y aplicaciones para automatización de tareas.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso más allá de las capacidades de Computer Use mencionadas.
- No se documenta modo de razonamiento explícito (thinking mode), audio ni otras modalidades adicionales.

## Casos de uso

- Procesamiento de documentos largos: análisis, resumen y extracción de información de contratos, informes o expedientes de cientos de miles de tokens en una sola pasada, aprovechando el contexto de 1 millón de tokens y la naturaleza multimodal para documentos escaneados.
- Búsqueda profunda sobre corpus internos: el modelo puede razonar sobre grandes volúmenes de texto recuperado y sintetizar respuestas con contexto amplio, adecuado para asistentes de investigación corporativa.
- Generación automática de presentaciones: a partir de un documento o conjunto de datos, el modelo produce el contenido textual de las diapositivas, encajando en flujos de oficina descritos por el autor.
- Automatización de Computer Use: agentes que operan interfaces gráficas para tareas repetitivas de oficina (rellenado de formularios, extracción de datos de aplicaciones), apoyados en la entrada visual.
- Asistentes documentales multilingües chino-inglés: atención a usuarios en ambos idiomas dentro de una misma organización, con la ventana de contexto larga como ventaja para historiales extensos.
- Despliegue en infraestructura heterogénea: organizaciones con clústeres mixtos (NVIDIA, Ascend, MetaX, Hygon, etc.) pueden usar la misma imagen FlagOS sobre distintos proveedores, reduciendo el coste de portabilidad.
- Evaluación e integración en pipelines de oficina: el modelo se puede servir con vLLM 0.32.0 a través del plugin FlagOS, con scripts de inferencia preconfigurados para un arranque rápido.

## Benchmarks y rendimiento

Resultados declarados en la model card (evaluación FlagEval vía plataforma Auto-Evaluation):

| Métrica | HY4-flash-Nvidia-Origin | HY4-flash-MetaX-FlagOS |
|---|---|---|
| Math-500 | 96 | 98,2 |
| GPQA-Diamond | 92,42 | 91 |
| MMBench | 92,6 | En evaluación |
| MMStar | 80,93 | En evaluación |

Benchmark interno del autor:

| Benchmark | Hy4 Flash | Hy4 Preview |
|---|---|---|
| WorkIndex | 42,1 | 39,7 |

Rendimiento de inferencia medido (4k entrada / 1k salida, `vllm bench serve --num-prompts 8 --request-rate inf`, TP8, graph, max-len 65536):

| Configuración | Output tok/s | Total tok/s | TTFT medio | TPOT medio |
|---|---|---|---|---|
| 8 concurrentes | 50,14 | 255,53 | 32,18 s | 127,09 ms |
| 16 concurrentes | 71,95 | 366,66 | 57,25 s | 164,45 ms |

Nota: la model card indica que el lote NLP de FlagEval terminó con estado `C` (0/2, sin muestras) y el lote MM seguía en ejecución en el momento de la publicación, por lo que parte de los resultados deben considerarse provisionales.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; los pesos INT8 ocupan 268,6 GiB en 148 shards, por lo que se requiere un despliegue multi-GPU (TP8 en la configuración de referencia).
- GPU de referencia en la model card: 8 × MetaX C550 de 64 GB (512 GB agregados).
- Memoria host: ≥ 512 GB, con 126,9 GB de memoria fijada (pinned) necesarios para el componente Engram.
- Disco: ≥ 300 GB para los pesos.
- No cabe en GPU de consumo (RTX 4090, etc.) por el tamaño del modelo y la necesidad de tensor parallelism de 8 vías.
- Opciones de despliegue: vLLM 0.32.0 con vllm-plugin-FL y FlagGems sobre el stack FlagOS; imagen Docker `harbor.baai.ac.cn/flagrelease-public/vllm0.24.0-metax-maca3.8.1.3:hy4-flash-metax-graph-20261118` (graph, recomendada) o la variante eager como fallback.
- Latencia y throughput: ver tabla de benchmarks; TTFT medio de 32,18 s con 8 concurrentes y 57,25 s con 16, TPOT de 127,09 ms y 164,45 ms respectivamente.
- Entorno validado: Ubuntu 22.04.5 LTS, kernel 5.15.0-119-generic, driver 3.8.1 (mx-smi 2.3.1), SDK MACA 3.8.1.3, Docker 29.1.3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hy4 Flash (esta ficha) | ~220 B totales / ~12 B activos | 1.000.000 | Apache 2.0 | Multimodal texto-imagen, arquitectura Engram, adaptado a FlagOS |
| Hy4 Preview | No disponible | No disponible | No disponible | Versión previa del mismo autor; WorkIndex 39,7 frente a 42,1 |
| Hy4 (referencia citada) | No disponible | No disponible | No disponible | La model card indica que la KV Cache de Flash es una sexta parte de la de Hy4 |

No se dispone en la información proporcionada de datos suficientes sobre modelos comparables de otros fabricantes (parámetros, contexto, benchmarks) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Idiomas limitados a chino e inglés; no se documenta soporte de castellano ni de otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de error ni evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no documentados en la model card.
- Resultados de FlagEval parciales: el lote NLP terminó sin muestras y el lote MM seguía en evaluación en el momento de la publicación; los números deben tratarse con cautela.
- El repositorio muestra 0 descargas y 0 likes, lo que sugiere un estado de publicación muy reciente y poca validación comunitaria.
- La distribución de pesos se realiza mediante almacenamiento compartido de FlagRelease; la publicación en ModelScope estaba pendiente según la model card.
- Requisitos de infraestructura elevados: 8 GPU de 64 GB, 512 GB de RAM host y 300 GB de disco; no apto para entornos de consumo.
- Configuración de despliegue frágil: la model card advierte que el directorio de trabajo debe estar fuera de `/workspace` para evitar fallos de importación de vLLM.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del stack FlagOS y de los kernels asociados.
- El modelo no incluye MTP (Multi-Token Prediction), lo que puede limitar optimizaciones de decodificación especulativa.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-metax-FlagOS
- ModelScope (publicación pendiente según la model card): `modelscope download --model FlagRelease/Hy4-flash-INT8-metax-FlagOS`
- Imagen Docker (graph): `harbor.baai.ac.cn/flagrelease-public/vllm0.24.0-metax-maca3.8.1.3:hy4-flash-metax-graph-20261118`
- Imagen Docker (eager, fallback): `harbor.baai.ac.cn/flagrelease-public/vllm0.24.0-metax-maca3.8.1.3:hy4-flash-metax-20261118`
- Repositorio de FlagOS / FlagGems: no disponible en la información proporcionada
- Paper o blog técnico de Hy4 Flash: no disponible en la información proporcionada
