# amd/Kimi-K3-Quark-MXFP4-AttnFP8

## Resumen

El modelo `amd/Kimi-K3-Quark-MXFP4-AttnFP8` es una versión cuantizada del modelo multimodal `moonshotai/Kimi-K3`, desarrollada por AMD para ejecutarse de forma eficiente en sus GPUs Instinct (MI350/MI355) mediante el optimizador AMD-Quark. Con 1,41 billones de parámetros (1.412.120.544.000), es un modelo de escala masiva que acepta texto, imagen y vídeo como entrada y genera texto, con soporte para razonamiento y tool calling.

La cuantización combina dos esquemas: los pesos y activaciones de los expertos del MoE se reducen a OCP MXFP4 (4 bits), mientras que las capas de atención se cuantizan a PTPC-FP8 (8 bits). Esto reduce drásticamente el uso de memoria y acelera la inferencia en hardware AMD, manteniendo una recuperación de precisión del 99,52% en GSM8K respecto al modelo original. El modelo está pensado para despliegue con vLLM en entornos ROCm 7.1.1 y Linux, y su relevancia radica en hacer viable la ejecución de un modelo de este tamaño en GPUs de centro de datos AMD sin sacrificar rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | KimiK3ForConditionalGeneration (transformer con MoE, multimodal) |
| Parametros totales | 1.412.120.544.000 (1,41 billones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | OCP MXFP4 (expertos y shared_experts), PTPC-FP8 (self_attn) |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3 (licencia personalizada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `moonshotai/Kimi-K3` es un transformer con mezcla de expertos (MoE) y componentes multimodales: incluye un `vision_tower` y un `mm_projector` para procesar imágenes y vídeo, además de un `block_sparse_moe` con expertos enrutados. La versión cuantizada no modifica la arquitectura, sino que aplica una cuantización post-entrenamiento con AMD-Quark. Los pesos de los expertos y shared_experts se convierten a OCP MXFP4 (4 bits), mientras que las proyecciones de atención (q, k, v) se cuantizan a PTPC-FP8. Se excluyen de la cuantización las capas de gate, proyecciones de salida de expertos, `lm_head`, `vision_tower`, `mm_projector` y ciertas capas de residuo, para preservar la precisión crítica. No se dispone de información sobre el dataset de entrenamiento original ni sobre el proceso de alineación (RLHF/DPO) del modelo base.

## Capacidades

- Generación de texto multimodal: acepta texto, imagen y vídeo como entrada y produce texto.
- Razonamiento y modo thinking: el parser `kimi_k3` en vLLM sugiere soporte para cadenas de razonamiento explícitas.
- Tool calling / function calling: habilitado mediante `--enable-auto-tool-choice` y `--tool-call-parser kimi_k3`.
- Soporte para agentes: combinado con tool calling y razonamiento multi-paso, puede actuar como agente autónomo.
- Capacidades multilingües: no especificadas, pero probablemente heredadas del modelo base (no confirmado).
- Procesamiento de vídeo: la arquitectura acepta vídeo como entrada, lo que permite tareas de comprensión temporal.

## Casos de uso

- Asistentes virtuales multimodales en centros de datos: el modelo puede procesar consultas que incluyen imágenes o vídeo y responder con texto, aprovechando su gran capacidad de razonamiento y tool calling para integrarse con APIs externas.
- Análisis de vídeo en tiempo diferido: dado su soporte de entrada de vídeo, puede generar resúmenes, transcripciones descriptivas o detección de eventos en secuencias grabadas, siempre que se disponga de la infraestructura AMD adecuada.
- Agentes autónomos con razonamiento multi-paso: gracias al parser de razonamiento y tool calling, puede planificar y ejecutar tareas complejas (por ejemplo, búsqueda de información, generación de informes) en entornos de producción.
- Generación de código asistida por contexto visual: al aceptar capturas de pantalla o diagramas como entrada, puede ayudar a desarrolladores a entender y generar código a partir de representaciones visuales.
- Investigación en modelos a gran escala: sirve como referencia para estudiar el impacto de la cuantización MXFP4/FP8 en tareas de razonamiento matemático y multimodal, dado que se publican métricas de recuperación.
- Despliegue en infraestructura AMD Instinct: es un caso de uso en sí mismo, ya que demuestra cómo ejecutar un modelo de 1,4 billones de parámetros en GPUs MI350/MI355 con vLLM, optimizado para ROCm.

## Benchmarks y rendimiento

| Benchmark | moonshotai/Kimi-K3 | amd/Kimi-K3-Quark-MXFP4-AttnFP8 | Recuperacion |
|---|---|---|---|
| GSM8K (flexible-extract, 5-shot) | 96.82 | 96.36 | 99.52% |

No se han publicado resultados de otros benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU recomendadas: AMD Instinct MI350 o MI355 (microarquitectura CDNA 4). No se soportan GPUs de consumo.
- VRAM estimada: no disponible con exactitud, pero el tamaño del repositorio (1505,9 GB) sugiere que se necesitan múltiples GPUs con memoria HBM de gran capacidad (por ejemplo, 8 GPUs MI355X con 288 GB cada una).
- ROCm 7.1.1, PyTorch 2.10.0, Transformers 5.2.0, Linux.
- Motor de inferencia: vLLM (con soporte ROCm) o SGLang.
- Configuración típica: `--tensor-parallel-size 8`, `--gpu-memory-utilization 0.95`, `--mm-encoder-tp-mode data`.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño y a la dependencia de instrucciones MXFP4 nativas de CDNA 4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Hardware |
|---|---|---|---|---|---|
| moonshotai/Kimi-K3 (base) | 1,41 billones (estimado) | no disponible | FP16/BF16 | kimi-k3 | GPUs NVIDIA/AMD |
| amd/Kimi-K3-Quark-MXFP4-AttnFP8 | 1,41 billones | no disponible | MXFP4 + FP8 | kimi-k3 | AMD MI350/MI355 |
| Otros modelos cuantizados de gran escala | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa exhaustiva con alternativas de la misma categoría.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de precisión, aunque en GSM8K la recuperación es del 99,52%; en otras tareas podría ser menor.
- Requiere hardware AMD específico (MI350/MI355) con ROCm 7.1.1; no es portable a GPUs NVIDIA sin modificaciones.
- La licencia `kimi-k3` es personalizada y puede imponer restricciones de uso comercial; es necesario revisar sus términos antes de desplegar en producción.
- No se han documentado sesgos específicos, pero al ser un modelo de gran escala entrenado con datos web, es probable que herede sesgos sociales y culturales.
- Riesgo de alucinación en tareas de razonamiento o generación de código, especialmente con entradas ambiguas.
- El tamaño del modelo (1505,9 GB en disco) implica costes de almacenamiento y transferencia elevados.
- No se ha verificado el rendimiento en tareas multimodales más allá de GSM8K; los resultados en vídeo o imagen podrían diferir.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/amd/Kimi-K3-Quark-MXFP4-AttnFP8)
- [Modelo base moonshotai/Kimi-K3](https://huggingface.co/moonshotai/Kimi-K3)
- [Blog de Shakudo: despliegue de Kimi K3 en AMD GPUs](https://www.shakudo.io/blog/kimi-k3-amd-gpu-deployment)
- [Blog de Hugging Face: Kimi K3 Model Overview](https://huggingface.co/blog/ResterChed/kimi-k3-model-overview-mxfp4-quantization-open-wei)
- [Artículo de AMD: Day 0 Kimi-K3 en AMD Instinct](https://www.amd.com/en/developer/resources/technical-articles/2026/kimi-k3-on-amd-instinct-gpus.html)
- [Artículo de AMD: Kimi Code en MXFP4](https://www.amd.com/en/developer/resources/technical-articles/2026/kimi-code-in-mxfp4-on-amd-gpus.html)
