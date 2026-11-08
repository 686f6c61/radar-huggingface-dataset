# mc-harris/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4 es la versión cuantizada en NVFP4 del modelo vision-lenguaje Nemotron 3.5 Super VL de NVIDIA, distribuida en Hugging Face por el usuario mc-harris. Se trata de un modelo multimodal que acepta texto, imágenes y vídeo como entrada y genera texto, orientado a razonamiento, generación de código, uso de herramientas, comprensión de documentos y comprensión de vídeo. La cuantización NVFP4 (mixed-precision) reduce los requisitos de memoria respecto al checkpoint BF16 original, del que se ha destilado con quantization-aware distillation.

El modelo combina capas intercaladas de Mamba-2, Mixture-of-Experts (MoE) y atención, junto con un codificador visual C-RADIO y un conector visión-lenguaje. Declara 120B parámetros totales y 12B activos, con una longitud de contexto de hasta 1M tokens. Incorpora Multi-Token Prediction (MTP) para decodificación especulativa nativa y un modo de razonamiento configurable mediante la plantilla de chat (`enable_thinking`).

Es relevante ahora porque ofrece despliegue eficiente de agentes texto-visión en hardware relativamente contenido (desde 1× DGX Spark hasta 1× H200, 2× H100 o 1× GB200) y porque NVIDIA publica pesos, datos de entrenamiento y recetas bajo licencia OpenMDW-1.1, lo que facilita su uso comercial. No obstante, la ficha de Hugging Face corresponde a un repositorio de terceros con 0 descargas y 0 likes en el momento de la consulta, por lo que conviene verificar la procedencia frente al repositorio oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2–Transformer con Mixture-of-Experts y codificador visual C-RADIO |
| Parametros totales | 120B (según model card); 65.769.840.138 según safetensors del repo |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1M tokens |
| Tipos de cuantizacion | NVFP4 (mixed-precision, modelopt_mixed, 8-bit según tags) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (librería transformers, custom_code) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido que intercala capas Mamba-2 (modelo de espacio de estados), capas de atención y capas Mixture-of-Experts, complementado con un codificador visual C-RADIO y un conector visión-lenguaje. El modelo declara 120B parámetros totales con 12B activos, lo que reduce el coste computacional por token frente a un transformer denso del mismo tamaño. Incorpora Multi-Token Prediction (MTP), que habilita decodificación especulativa nativa; la configuración de vLLM de la model card usa además un modelo draft separado (NVFP4-LiLiCorr) con 7 tokens especulativos y método `dflash`.

Esta variante NVFP4 se obtiene mediante quantization-aware distillation a partir del checkpoint BF16 `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16`. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO; la model card remite a un informe técnico de NVIDIA para esos detalles. El modo de razonamiento es configurable (`off`, `on (medium)`, `on`) a través de la plantilla de chat, con un presupuesto de razonamiento ajustable.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (`enable_thinking=True/False`) y niveles off, medium y on.
- Comprensión de imágenes y de vídeo (pipeline `image-text-to-text`; entrada de texto, imágenes y vídeo).
- Generación de código y razonamiento sobre código.
- Uso de herramientas y function calling: la configuración de vLLM habilita `--enable-auto-tool-choice` con parser `qwen3_coder`.
- Comprensión de documentos.
- Capacidades de agente y razonamiento multi-paso.
- Soporte multilingüe para inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa nativa mediante Multi-Token Prediction (MTP).
- Procesamiento de vídeo con control de muestreo (fps y número de frames) y pruning de vídeo configurable.

## Casos de uso

- Agentes de atención al cliente multimodal: el modelo puede gestionar conversaciones multi-turno con imágenes adjuntas (capturas, fotos de producto) y contexto de hasta 1M tokens, manteniendo el historial completo de la interacción.
- Análisis de documentos: extracción y razonamiento sobre documentos escaneados o con tablas, combinando el codificador visual C-RADIO con el modo de razonamiento para responder preguntas sobre el contenido.
- Generación de código en producción: con soporte de tool calling y parser dedicado, puede integrarse en pipelines que invocan herramientas externas (compiladores, linters, APIs) dentro de flujos de CI/CD.
- Comprensión de vídeo: análisis de contenido audiovisual con muestreo configurable (por ejemplo, 2 fps y 256 frames) y pruning del 50 %, adecuado para resumen o inspección de grabaciones.
- Asistentes de agente autónomo: razonamiento multi-paso con presupuesto de pensamiento ajustable, útil para tareas que requieren planificación y ejecución de varias llamadas a herramientas.
- Despliegue en hardware contenido: al ser NVFP4, puede servirse en una sola DGX Spark (GB10), una RTX PRO 6000, una H200, dos H100 o una GB200, lo que permite agentes texto-visión en entornos de laboratorio o edge con GPU profesional.
- Automatización multilingüe: atención y generación en seis idiomas (en, es, fr, de, it, ja) para flujos de soporte o documentación internacional.

## Benchmarks y rendimiento

La información disponible solo incluye resultados parciales de una comparación entre el checkpoint BF16 y el NVFP4 (con configuraciones y harness idénticos), sin contexto completo de la tabla:

| Benchmark | BF16 | NVFP4 |
|---|---|---|
| GDP.pdf [offline] | 6.6 (AA 6.6) | no disponible |
| Terminal Bench 4 [offline] | 1 | 1.5 |
| DeepSWE [offline] | 24.65 | 18.2 |

No se han publicado en la información disponible resultados completos de MMLU, HumanEval, GSM8K u otros benchmarks estándar, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 75,0 GB en safetensors, lo que da una referencia del peso en disco de los pesos NVFP4 (el consumo en VRAM depende de la configuración de caché Mamba, KV cache y contexto).
- GPU recomendadas según la model card: 1× DGX Spark (GB10), 1× NVIDIA RTX PRO 6000, 1× H200, 2× H100 o 1× GB200.
- Cabe en GPU consumer: no se indica compatibilidad con GPUs consumer; el mínimo declarado es una DGX Spark o una RTX PRO 6000 (gama profesional).
- Opciones de despliegue: vLLM (imagen `vllm/vllm-openai:v0.32.0` o nightly indicada) con `--trust-remote-code`, backend Mamba `flashinfer`, caché Mamba en float16 con stochastic rounding y `--block-size 64`; SGLang también aparece mencionado en la model card.
- Latencia y throughput: no disponible; la configuración de referencia de vLLM usa `--max-num-seqs 1` y 7 tokens especulativos por draft, lo que sugiere un despliegue orientado a baja concurrencia en DGX Spark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3.5-Super-VL-120B-A12B-NVFP4 (esta ficha) | 120B totales / 12B activos | 1M tokens | OpenMDW-1.1 | Hugging Face (repo de terceros) |
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 | 120B totales / 12B activos | 1M tokens | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio consultado pertenece al usuario mc-harris, no a NVIDIA, y registra 0 descargas y 0 likes; conviene validar la integridad de los pesos frente al repositorio oficial `nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4`.
- La cuantización NVFP4 puede degradar la precisión frente al BF16: en DeepSWE se observa una caída de 24,65 a 18,2 en los datos disponibles.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan tasas específicas en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- El contexto máximo de 1M tokens requiere configuraciones de despliegue específicas y puede no estar disponible en todos los backends.
- La licencia OpenMDW-1.1 permite uso comercial según la model card, pero es una licencia "other" que debe revisarse en el enlace oficial antes de su adopción.
- El despliegue requiere `--trust-remote-code` y `custom_code`, lo que implica ejecutar código del repositorio.
- El soporte de idiomas se limita a en, es, fr, de, it, ja; no se garantiza calidad en otros idiomas.
- La configuración de referencia de vLLM está pensada para DGX Spark con una sola secuencia concurrente, lo que limita el throughput en cargas de alta concurrencia.

## Enlaces

- Hugging Face (repo consultado): https://huggingface.co/mc-harris/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Hugging Face (repo oficial NVIDIA): https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Modelo draft especulativo: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Informe técnico: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Super-and-Lightning-Technical-Report.pdf
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- NVIDIA NIM model card: https://build.nvidia.com/nvidia/nemotron-3.5-super-vl-120b-a12b/modelcard
- Discord NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
