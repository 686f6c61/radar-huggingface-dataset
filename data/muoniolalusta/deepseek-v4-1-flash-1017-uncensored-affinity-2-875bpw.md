# Muoniolalusta/DeepSeek-V4.1-Flash-1017-UNCENSORED-affinity-2.875bpw

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-affinity-2.875bpw es un contenedor cuantizado en formato `.aff` del checkpoint comunitario `dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8`, a su vez derivado del modelo oficial `deepseek-ai/DeepSeek-V4.1-Flash` en su revisión del 17 de octubre (1017). Lo publica el usuario Muoniolalusta (Yuri de Jager) y no es una release oficial ni de DeepSeek ni del motor affinity: es una cuantización personal de un checkpoint «abliterated», es decir, con los mecanismos de rechazo eliminados por la comunidad.

El paquete pesa 191,32 GiB repartidos en cinco partes y aplica una cuantización por codebook de 2,875 bits por peso a los expertos enrutados de la mezcla de expertos (MoE), manteniendo las capas densas en FP8 y el embedding y la cabeza de salida en BF16. Se acompaña de una cabeza de decodificación especulativa DSpark (5,22 GiB) y un sidecar de n-gramas «engram» de 506 KiB.

Su relevancia es doble: por un lado documenta la revisión 1017 del modelo base, que corrige el tool calling DSML con namespaces de doble dos puntos e introduce tokens numéricos de esfuerzo de razonamiento; por otro, es uno de los pocos artefactos publicados para el motor affinity sobre GPUs AMD Radeon AI PRO R9700 (`gfx1201`) con ROCm, un ecosistema fuera del circuito habitual CUDA/vLLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) de tipo transformer; número de capas, expertos y mecanismo de atención no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (MoE confirmado por las etiquetas del repo) |
| Longitud de contexto | 524 288 tokens (`--kv-size 524288` en la configuración de referencia); una fuente secundaria cita 1M de tokens para el modelo base, no confirmado en la model card |
| Tipos de cuantización | Expertos enrutados a 2,875 bpw con codebook de 2×1024 entradas; capas densas en FP8; embedding y cabeza de salida en BF16; cabeza draft DSpark en INT4 |
| Idiomas soportados | no disponible |
| Licencia | `deepseek-license` (`license: other`) |
| Formato de pesos | Contenedor `.aff` (motor affinity) en 5 partes, `.dspark.aff` para la cabeza especulativa, `.engram` para el sidecar de n-gramas y `.raw` para el codebook |
| Tamaño del repositorio | 211,0 GB (191,32 GiB de contenedor + 5,22 GiB de draft head) |
| Motor de inferencia compatible | affinity v1.1.0 con el port a R9700; no carga en llama.cpp, vLLM ni SGLang |

## Arquitectura y entrenamiento

El modelo base es una mezcla de expertos de DeepSeek en su variante Flash, revisión 1017, que la documentación del autor describe como una actualización menor sobre la 0925 con mejoras en razonamiento, código, tareas agénticas y benchmarks visuales, además de reducción de tiempo de ejecución y de longitud de salida. La model card de esta cuantización no detalla el número de capas, de expertos, la composición del dataset ni las etapas de alineación (RLHF/DPO); esos datos no están disponibles en la información consultada.

La innovación técnica de este artefacto está en la tubería de cuantización y decodificación, no en el entrenamiento. Los expertos enrutados se codifican contra un codebook de 2×1024 entradas a 2,875 bpw, mientras que las capas densas se conservan en FP8 para limitar la degradación. Sobre eso se monta una cabeza de decodificación especulativa DSpark con pesos INT4 (`AFF_DRAFT_HEAD_INT4=1`, que reduce un 3,88x las lecturas de memoria de la draft LM-head), taps fusionados (`AFF_FUSE_HC_TAP=1`) y un esquema de rechazo de muestreo limitado con decaimiento por longitud (`AFF_CACTUS_DELTA=0.35`, `AFF_CACTUS_CAP_R=0.5`). Se añade un sidecar «engram» de n-gramas y una caché de prefijo persistente en NVMe de 64 GiB.

La revisión 1017 incorpora además tokens numéricos de esfuerzo de razonamiento (`low: 50`, `medium: 75`, `high: 75`, `max: 100`) y corrige el tool calling DSML para nombres de herramienta con namespaces de doble dos puntos (`namespace::name`) sin corromper los envoltorios XML.

## Capacidades

- Generación de texto y razonamiento multi-paso con control numérico del esfuerzo de razonamiento (niveles bajo, medio, alto y máximo), lo que permite ajustar latencia y longitud de salida por petición.
- Generación de código y tareas de ingeniería de software, con la revisión 1017 orientada a reducir tiempo de ejecución y longitud de salida.
- Tool calling / function calling mediante el formato DSML, con soporte corregido de namespaces de doble dos puntos.
- Flujos agénticos de múltiples pasos con contexto muy largo: el autor reporta sesiones reales sostenidas entre 163,5k y 170,7k tokens.
- Decodificación especulativa con draft head DSpark y aceptación medida del 79,9 % (3,69 tokens por bloque de media, hasta 4,37).
- Recuperación de contexto mediante sidecar «engram» de n-gramas y caché de prefijo persistente entre sesiones.
- Entrada de imagen nativa en el modelo base según fuentes secundarias (LM Studio y ModelScope); el contenedor se sirve con una imagen Docker etiquetada `v41-vision`, pero la model card no documenta ni verifica la ruta de visión en esta cuantización.
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes autónomos de larga duración: con 524 288 tokens de ventana y sesiones verificadas a ~170k tokens, el modelo puede mantener el estado de una tarea agéntica (objetivos, resultados de herramientas, trazas de error) sin resumir ni truncar el historial, lo que reduce la pérdida de información entre pasos.
- Asistencia sobre repositorios completos: la caché de prefijo persistente de 64 GiB respaldada en NVMe permite reutilizar el árbol de código entre turnos y peticiones, con un prefijo que se restaura desde disco (más de 330 bloques) a ~1000 tok/s de prefill.
- Red-teaming y estudio de alineación: al ser un checkpoint «abliterated», sirve para analizar qué comportamientos emergen al retirar los mecanismos de rechazo, siempre en un entorno aislado y con supervisión humana.
- Procesamiento documental por lotes: expedientes, contratos o normativa de cientos de miles de tokens que se ingieren una vez y se consultan repetidamente aprovechando la caché de prefijo.
- Integración de herramientas en pipelines internos: el soporte corregido de `namespace::name` en DSML facilita registrar funciones con espacios de nombres (por ejemplo `crm::buscar_cliente`, `db::ejecutar_consulta`) sin romper el envoltorio XML.
- Generación de datos sintéticos sin filtrado previo para ajuste fino posterior, usando el control de esfuerzo de razonamiento para producir cadenas de razonamiento más o menos detalladas según el objetivo del dataset.
- Despliegue on-premise sobre hardware AMD: entornos que ya operan clústeres con Radeon AI PRO R9700 y ROCm pueden servir el modelo sin depender de GPUs NVIDIA ni de licencias de software propietario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos medidos son de rendimiento de inferencia, obtenidos por el autor en dos AMD Radeon AI PRO R9700 (32 GiB cada una, ROCm 7.14) con sesiones agénticas reales a 163,5k–170,7k tokens de contexto:

| Métrica | Valor medido |
|---|---|
| Throughput de decodificación ponderado | 21,96 tok/s (+28,6 % sobre la línea base v1.0.0 de 17,08 tok/s) |
| Pico de ráfaga | 27,80 tok/s (1 341 tokens en 48,15 s a 166,3k de contexto) |
| Latencia por bloque especulativo | 166,7 ms/bloque de mediana (−20,4 %), mínimo de 156,8 ms/bloque |
| Aceptación del draft | 79,9 % (3,69 tokens/bloque de media, hasta 4,37) |
| Velocidad de prefill | ~1000 tok/s con restauración de prefijo persistente desde NVMe |

## Requisitos de hardware

- VRAM: el autor ejecuta el modelo en 2× AMD Radeon AI PRO R9700 de 32 GiB (64 GiB en total) con `--gpu-headroom-mib 1024`; los pesos ocupan 191,32 GiB, por lo que el resto se descarga en memoria del host mediante `--host-pool-mib 200000` (unos 200 GB de pool).
- Memoria del sistema: se debe reservar del orden de 200 GB de RAM para el pool de host, más 64 GiB de disco rápido para la caché de prefijo persistente.
- GPUs compatibles: solo se documenta `gfx1201` (RDNA4, Radeon AI PRO R9700) con ROCm 7.14. No se documenta soporte CUDA ni de otras arquitecturas AMD.
- GPU de consumo: no cabe en ninguna GPU de consumo de 24 GB o menos con esta cuantización; el contenedor completo requiere el pool de host descrito.
- Despliegue: exclusivamente el motor affinity v1.1.0 con el port y los parches del repositorio complementario, distribuido como imagen Docker (`affinity:v41-vision`) con acceso a `/dev/kfd` y `/dev/dri`. No es compatible con llama.cpp, vLLM, SGLang, Ollama ni TGI.
- Latencia y throughput: 21,96 tok/s sostenidos y ~1000 tok/s de prefill en la configuración de referencia; el rendimiento decae con la longitud de contexto y depende del acierto de la decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Formato | Cuantización | Contexto | Licencia | Hardware documentado |
|---|---|---|---|---|---|
| Este contenedor (1017-UNCENSORED, affinity) | `.aff` + DSpark + engram | 2,875 bpw codebook en expertos, FP8 denso, BF16 embedding/head | 524 288 tokens en la configuración de referencia | `deepseek-license` | 2× R9700 32 GiB + ~200 GB host |
| `dealignai/DeepSeek-V4.1-Flash-UNCENSORED-FP8` | no disponible | FP8 | no disponible | no disponible | no disponible |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` (oficial) | no disponible | no disponible (el nombre de la variante FP8 aparece en el repo base) | 1M tokens según fuentes secundarias | `deepseek-license` | no disponible |
| DeepSeek-V4.1-Flash 0925 (revisión anterior) | no disponible | no disponible | no disponible | `deepseek-license` | no disponible |

Frente a la revisión 0925, la 1017 corrige el tool calling DSML con namespaces y añade tokens numéricos de esfuerzo de razonamiento. Frente al checkpoint FP8 del que deriva, este contenedor reduce el peso de los expertos de 8 a 2,875 bits por peso a cambio de una pérdida de calidad no cuantificada públicamente, y limita el despliegue al motor affinity.

## Limitaciones y advertencias

- Modelo «uncensored»/abliterated: se han retirado o atenuado los mecanismos de rechazo, por lo que puede producir contenido dañino, ilegal o sexualmente explícito sin filtros. No es apto para exposición directa a usuarios finales sin una capa de moderación propia.
- Cuantización con pérdida: los expertos enrutados se codifican a 2,875 bpw contra un codebook de 2×1024 entradas; no se ha publicado ninguna evaluación de la degradación frente al checkpoint FP8 original.
- Ecosistema cerrado: solo carga en affinity v1.1.0 con el port a R9700. No hay ruta a llama.cpp, vLLM, SGLang, Ollama ni TGI, lo que dificulta la integración en plataformas estándar y el escalado horizontal.
- Requisitos de infraestructura elevados: ~191 GiB de pesos, ~200 GB de pool de host y ROCm 7.14 sobre `gfx1201`; no hay soporte documentado para CUDA ni para GPUs de consumo.
- Throughput bajo para uso interactivo: 21,96 tok/s sostenidos implican varios segundos por respuesta de longitud media en generación abierta.
- Vision no verificada: el modelo base es multimodal según fuentes secundarias y la imagen Docker se etiqueta `v41-vision`, pero la model card no documenta el pipeline de imagen de este contenedor.
- Idiomas soportados no documentados; no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Licencia `deepseek-license`: las condiciones concretas de uso comercial no se detallan en la información disponible; hay que revisar el texto oficial antes de cualquier despliegue en producción.
- Procedencia: repositorio personal con 0 descargas y 0 likes, sin revisión por pares; el autor declara explícitamente que no es una release oficial. La integridad se verifica solo con `SHA256SUMS.parts` tras reensamblar las cinco partes con `cat`.
- Fechas del repositorio (creación 2026-10-27) y ausencia de benchmarks de calidad: conviene tratar cualquier afirmación de rendimiento del modelo base como no verificada en esta cuantización.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Muoniolalusta/DeepSeek-V4.1-Flash-1017-UNCENSORED-affinity-2.875bpw
- Perfil del autor: https://huggingface.co/Muoniolalusta/models
- Repositorio complementario con parches del motor, unidad de despliegue y release v1.1.0: https://github.com/drwolfen/deepseek-v4.1-flash-r9700-affinity
- Motor de inferencia affinity: https://codeberg.org/StillDeadcode/affinity
- Modelo base oficial (revisión 1017) en ModelScope: https://www.modelscope.cn/models/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Ficha del modelo base en LM Studio: https://lmstudio.ai/models/deepseek-v4.1-flash-1017
- Análisis de la revisión 1017 frente a V4 Pro: https://omniakey.com/blog/deepseek-v4-1-flash-1017-review
- Informe técnico del modelo base: referenciado en ModelScope, sin URL directa disponible en la información consultada.
