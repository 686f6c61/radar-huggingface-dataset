# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B es un modelo de lenguaje y visión (VLM) desarrollado por NVIDIA, diseñado para ejecutar tareas agénticas cotidianas en local. Se trata de la versión en precisión completa (BF16) de la familia Bolt, pensada principalmente para personalización y post-entrenamiento más que para inferencia directa en producción. La versión de 24 GB del mismo modelo emplea cuantización nativa de 2 bits para caber en memoria junto a otras aplicaciones.

El modelo combina una arquitectura híbrida Mamba-2–Transformer con un LatentMoE (mezcla de expertos latente) y un codificador visual C-RADIO v4-H. Cuenta con 74 000 millones de parámetros totales y 9 000 millones activos, lo que lo sitúa en la categoría de MoE disperso de gran escala pero con coste de inferencia contenido. Soporta hasta 256 000 tokens de contexto y acepta entradas de texto, imagen y vídeo.

Su relevancia actual radica en la combinación de contexto largo, capacidades multimodales, modo de razonamiento conmutable mediante plantilla de chat y decodificación especulativa integrada (LiLiCorr drafter vía DFlash con 7 tokens especulativos en las recetas de vLLM). Todo ello bajo licencia OpenMDW-1.1, que permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2–Transformer híbrida con LatentMoE y codificador visual C-RADIO v4-H |
| Parametros totales | 74 885 081 096 (74B) |
| Parametros activos | 9B |
| Longitud de contexto | Hasta 256K tokens (262 144 en la receta de vLLM) |
| Tipos de cuantizacion | BF16 (esta versión); existe variante nativa de 2 bits (IQ2) de 24 GB y GGUF de 24 GB |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial) |
| Formato de pesos | safetensors (BF16), repo de 149,8 GB |
| Entradas / salidas | Texto, imagen y vídeo / texto |
| Modo de razonamiento | Conmutable vía plantilla de chat (`enable_thinking=True/False`) |
| Decodificacion especulativa | LiLiCorr drafter vía DFlash, 7 tokens especulativos |
| Muestreo recomendado | Texto: temperatura 1.0, top_p 0.95 |
| Fecha de corte de datos | Mayo de 2026 |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 |

## Arquitectura y entrenamiento

La arquitectura es una híbrida Mamba-2–Transformer con capas de mezcla de expertos latente (LatentMoE). Esta combinación busca reducir el coste computacional del mecanismo de atención en contextos largos mediante el componente de espacio de estados (Mamba-2), mientras el Transformer aporta capacidad de modelado de dependencias globales. El LatentMoE activa 9B de los 74B parámetros totales, lo que permite un throughput alto con un coste de memoria y cómputo por token relativamente bajo. El codificador visual es C-RADIO v4-H, que procesa imágenes y vídeo.

El modelo se ha entrenado sobre los conjuntos de datos publicados por NVIDIA (`nemotron-pre-training-datasets` y `nemotron-post-training-v3`), con fecha de corte de post-entrenamiento en mayo de 2026. La model card no detalla el número exacto de tokens de entrenamiento ni la composición pormenorizada del dataset, ni especifica si se emplearon RLHF o DPO. Sí se documenta la herencia del cliente Super 3.5 VL en cuanto a modo de razonamiento y parámetros de muestreo. La innovación técnica destacable es la decodificación especulativa integrada con el drafter LiLiCorr vía DFlash (7 tokens especulativos en las recetas de vLLM), además del soporte de backends FlashInfer para atención y Mamba, y chunked prefill para contextos largos.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento conmutable (`enable_thinking`).
- Comprensión de imágenes y vídeo (pipeline image-text-to-text), con límite de 1 imagen y 1 vídeo por prompt en la receta de vLLM y poda de vídeo configurable (`--video-pruning-rate 0.5`, 2 fps, 256 frames).
- Soporte de tool calling / function calling (`--enable-auto-tool-choice`, parser `qwen3_coder`).
- Razonamiento multi-paso y flujos agénticos, con parser de razonamiento dedicado (`ultra_v3_reasoning_parser.py`).
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Contexto largo de hasta 256K tokens, útil para documentos extensos y conversaciones multi-turno prolongadas.
- Capacidad de código y matemáticas (avalada por resultados en SciCode y GPQA Diamond, ver benchmarks).
- Base para post-entrenamiento y generación de variantes cuantizadas.

## Casos de uso

- Agentes locales de automatización: el modelo puede ejecutar tareas multi-paso con tool calling y contexto de 256K, adecuado para orquestar APIs y sistemas operativos en entornos de escritorio con la variante de 24 GB.
- Atención al cliente multimodal: gestión de conversaciones multi-turno con imágenes adjuntas (capturas, documentos escaneados) gracias al codificador C-RADIO v4-H y a la ventana de contexto larga.
- Análisis de documentos y vídeo: procesamiento de vídeo a 2 fps con 256 frames y poda al 50 %, útil para resúmenes de reuniones o inspección visual de material grabado.
- Generación de código en producción: integrable en pipelines de CI/CD mediante tool calling y el parser `qwen3_coder`, con resultados destacados en Terminal-Bench 2.1 (53,93 en BF16).
- Investigación y post-entrenamiento: al ser la versión BF16, sirve como base para fine-tuning, destilación o generación de cuantizaciones propias (GGUF, IQ2) orientadas a despliegue.
- Asistencia financiera y de back-office: los resultados en Tau3 Banking (17,01) lo sitúan como candidato para agentes que operan sobre sistemas bancarios simulados.
- Razonamiento científico y técnico: GPQA Diamond de 88,83 y SciCode de 44,49 lo hacen apto para asistencia en dominios de ciencia e ingeniería.
- Despliegue en entornos con recursos limitados: la variante de 24 GB (IQ2) permite ejecutar el modelo junto a otras aplicaciones en una sola GPU consumer o workstation.

## Benchmarks y rendimiento

| Benchmark | Qwen3.6-35B-A3B-BF16 | Gemma4 26B-A4B-BF16 | Nemotron 3.5 Lightning 30B-A3B-BF16 | Nemotron 3.5 Bolt 74B-A9B-24GB (IQ2) | Nemotron 3.5 Bolt 74B-A9B (BF16) |
|---|---:|---:|---:|---:|---:|
| GDPVal-AA-V2 | 25,75 | 15,33 | 18,26 | 28,47 | 31,13 |
| Terminal-Bench 2.1 | 44,38 | 37,22 | 23,46 | 50,98 | 53,93 |
| Tau3 Banking | 10,52 | 14,02 | 9,48 | 17,01 | 17,01 |
| HLE (no tools) | 19,56 | 17,42 | 10,47 | 25,30 | 28,73 |
| AA-Omniscience accuracy | 19,47 | 22,17 | 16,63 | 16,90 | 21,80 |
| SciCode | 35,33 | 40,28 | 31,38 | 41,02 | 44,49 |
| GPQA Diamond | 83,40 | 79,61 | 75,57 | 86,43 | 88,83 |
| AA-LCR | 61,06 | 57,56 | 49,19 | 64,06 | 67,38 |
| AA-Omniscience non-hallucination | 65,85 | 14,22 | 68,81 | 61,27 | 56,14 |
| PinchBench | 88,07 | 74,70 | 83,43 | 87,82 | 90,35 |
| MCP-Atlas | 51,20* | 48,4 | no disponible | no disponible | no disponible |

\* El valor de MCP-Atlas para Qwen3.6-35B-A3B aparece truncado en la model card; el resto de la fila no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: el repo pesa 149,8 GB, por lo que se necesita al menos esa cantidad de memoria, repartida mediante tensor parallelism. No cabe en una sola GPU consumer.
- GPU recomendadas para BF16: NVIDIA Ampere (A100), Hopper (H100-80GB) o Blackwell, según la model card. Con H100-80GB se requieren al menos 2 GPUs para alojar los pesos en BF16.
- Variante de 24 GB: diseñada para caber en 24 GB de VRAM y ejecutarse junto a otras aplicaciones; apta para GPUs consumer de gama alta con 24 GB (por ejemplo, RTX 4090) o workstations.
- Despliegue: vLLM (versión mínima indicada en la model card, con `--trust-remote-code`, backend FlashInfer para atención y Mamba, chunked prefill y `--max-model-len 262144`), llama.cpp y Ollama mediante la variante GGUF de 24 GB, y SageMaker como endpoint gestionado.
- Latencia y throughput: no se han publicado cifras concretas de latencia o tokens por segundo en la información disponible. La decodificación especulativa con 7 tokens y el LatentMoE de 9B activos están orientados a mejorar throughput frente a modelos densos de tamaño comparable.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Resultado destacado |
|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B (BF16) | 74B / 9B | 256K | OpenMDW-1.1 | GPQA Diamond 88,83; Terminal-Bench 2.1 53,93 |
| Qwen3.6-35B-A3B-BF16 | 35B / 3B | no disponible | no disponible | GPQA Diamond 83,40; PinchBench 88,07 |
| Gemma4 26B-A4B-BF16 | 26B / 4B | no disponible | no disponible | SciCode 40,28; AA-Omniscience accuracy 22,17 |
| Nemotron 3.5 Lightning 30B-A3B-BF16 | 30B / 3B | no disponible | no disponible | AA-Omniscience non-hallucination 68,81 |

Los datos de contexto y licencia de los modelos comparables no están disponibles en la información proporcionada. El Bolt 74B-A9B supera a las alternativas en la mayoría de benchmarks de razonamiento y agentes, mientras que Gemma4 destaca en AA-Omniscience accuracy y Lightning en no-alucinación.

## Limitaciones y advertencias

- Esta versión BF16 está pensada para personalización y post-entrenamiento; para inferencia en producción se recomienda la variante de 24 GB (IQ2/GGUF) optimizada para latencia y throughput.
- Riesgo de alucinación: el resultado de AA-Omniscience non-hallucination en BF16 (56,14) es inferior al de la variante IQ2 (61,27) y al de Lightning (68,81), lo que indica una tendencia mayor a generar contenido no verificado en precisión completa.
- Sesgos: la model card no documenta sesgos específicos ni evaluaciones de sesgo; no disponible.
- Idiomas: solo se declaran seis idiomas (en, es, fr, de, it, ja); el rendimiento en el resto no está garantizado.
- Contexto: aunque soporta 256K tokens, el uso de contexto muy largo incrementa el consumo de memoria KV/Mamba y puede degradar la latencia; la receta de vLLM limita a 1 secuencia (`--max-num-seqs 1`).
- Multimodalidad limitada por prompt: la receta admite como máximo 1 imagen y 1 vídeo por prompt.
- Licencia OpenMDW-1.1: permite uso comercial, pero conviene revisar los términos completos del acuerdo antes de desplegar en producción.
- Fecha de corte de datos en mayo de 2026; la información posterior no está cubierta.
- Requiere `--trust-remote-code` y un parser de razonamiento externo (`ultra_v3_reasoning_parser.py`) para el modo thinking en vLLM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Variante de 24 GB para vLLM: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Variante GGUF de 24 GB para llama.cpp: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Página de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Colección de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Paper (arXiv:2605.07182): https://arxiv.org/abs/2605.07182
