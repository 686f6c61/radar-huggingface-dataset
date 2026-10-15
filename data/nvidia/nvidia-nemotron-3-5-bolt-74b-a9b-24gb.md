# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B-24GB es un modelo de visión-lenguaje (VLM) desarrollado por NVIDIA Corporation, publicado como versión cuantizada del modelo base NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16. Su objetivo es ejecutar tareas agénticas cotidianas en local: el empaquetado completo ocupa 24 GB, de modo que puede convivir con otras aplicaciones en la misma máquina sin desplazamientos a la nube. La model card lo posiciona explícitamente como un compromiso entre velocidad e inteligencia, con la pretensión de ser más rápido que modelos densos populares y más capaz que MoE de huella de memoria similar.

La arquitectura es un híbrido Mamba-2–Transformer con capas LatentMoE y un codificador de visión C-RADIO v4-H, identificado en la librería como `nemotron_h_omni`. La model card declara 74B parámetros totales con 9B activos, contexto de hasta 256K tokens y entrada multimodal de texto, imagen y vídeo. La cuantización nativa es IQ2 (2 bits con entrenamiento consciente de cuantización), aunque el repositorio incluye la etiqueta `8-bit` y soporte de ModelOpt.

Es relevante ahora porque combina tres tendencias simultáneas: despliegue local en GPU única de 24 GB, decodificación especulativa integrada (borrador LiLiCorr vía DFlash con 7 tokens especulativos) y modo de razonamiento conmutable desde el chat template (`enable_thinking=True/False`). Se distribuye bajo licencia OpenMDW-1.1 y está preparado para uso comercial, según declara el propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2–Transformer con LatentMoE y codificador de visión C-RADIO v4-H (`nemotron_h_omni`) |
| Parámetros totales | 74B según model card; el recuento de safetensors del repositorio cuantizado indica 22.367.086.600 |
| Parámetros activos | 9B (designación A9B) |
| Longitud de contexto | Hasta 256.000 tokens (vLLM configurado con `--max-model-len 262144`) |
| Tipos de cuantización | IQ2 (2 bits con QAT) en esta versión; el modelo base es BF16; etiquetas `8-bit` y `modelopt` en el repositorio |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (librería transformers, `custom_code`, `trust_remote_code` requerido) |

## Arquitectura y entrenamiento

El modelo es un híbrido Mamba-2–Transformer con mezcla de expertos latente (LatentMoE), lo que combina estado recurrente selectivo para el modelado secuencial con atención Transformer y enrutamiento disperso a expertos. La componente de visión es un codificador C-RADIO v4-H, lo que permite tomar texto, imágenes y vídeo como entrada y producir texto como salida. Esta ficha corresponde a la variante cuantizada a IQ2 del modelo BF16 `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16`, con relación `base_model_relation: quantized`; el entrenamiento consciente de cuantización (QAT) se aplicó para preservar calidad a 2 bits.

Los datos de entrenamiento declarados son los conjuntos `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`. La model card sitúa las fechas de desarrollo entre diciembre de 2025 y mayo de 2026, con fecha de corte de los datos de post-entrenamiento en mayo de 2026. No se detalla en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO de forma explícita. Como innovaciones técnicas destacan la decodificación especulativa LiLiCorr mediante DFlash (7 tokens especulativos en las recetas oficiales de vLLM), el modo de razonamiento conmutable por chat template y el empaquetado a 24 GB con kernels específicos b12x para capas lineales y MoE.

## Capacidades

- Generación de texto y razonamiento multimodal: entrada de texto, imagen y vídeo, salida de texto, con pipeline declarado `image-text-to-text`.
- Modo de razonamiento explícito, activable o desactivable mediante el chat template (`enable_thinking=True/False`), heredado del cliente Super 3.5 VL.
- Tool calling y function calling nativos: la receta oficial de vLLM habilita `--enable-auto-tool-choice` con parser `qwen3_coder`.
- Flujos agénticos y razonamiento multi-paso, con benchmarks orientados a agentes como Terminal-Bench 2.1 y Tau3 Banking en la model card.
- Procesamiento de vídeo con control de muestreo (`fps`, `num_frames`), limitación a una imagen y un vídeo por prompt y tasa de poda de vídeo configurable.
- Capacidades multilingües en inglés, español, francés, alemán, italiano y japonés.
- Decodificación especulativa con borrador LiLiCorr, pensada para reducir latencia en generación autorregresiva.
- Contexto largo de hasta 256K tokens con caché KV en fp8 y prefill troceado (`enable_chunked_prefill`).

## Casos de uso

- Asistentes agénticos locales: el modelo cabe en 24 GB y soporta tool calling con parser dedicado, por lo que puede orquestar llamadas a APIs, ejecutar comandos y mantener bucles multi-paso en una estación de trabajo sin enviar datos a terceros.
- Automatización de terminal y DevOps: sus resultados en Terminal-Bench 2.1 (50,98) lo sitúan como candidato para agentes que interpretan salida de shell, editan ficheros y ejecutan pipelines de CI/CD sobre repositorios reales.
- Análisis de documentos y capturas con contexto largo: la ventana de 256K tokens permite ingerir manuales, contratos o informes extensos junto a imágenes asociadas y responder preguntas cruzadas entre ambos.
- Atención al cliente multi-turno: la combinación de contexto largo y modo de razonamiento conmutable permite alternar respuestas rápidas de bajo coste con respuestas razonadas cuando la consulta lo exige, todo en el mismo despliegue.
- Revisión de código y generación asistida: con SciCode en 41,02 y soporte de function calling, encaja en pipelines que analizan diffs, sugieren parches y validan contra tests.
- Procesamiento de vídeo para inspección o vigilancia: la entrada de vídeo con muestreo configurable (fps y número de frames) y la poda al 50 % permiten resumir o etiquetar clips sin infraestructura en la nube.
- Investigación en razonamiento y evaluación de alucinación: el modo thinking explícito y las métricas de no alucinación de AA-Omniscience lo hacen utilizable como sujeto de estudio en experimentos reproducibles sobre GPU única.
- Prototipado en estaciones con GPU de 24 GB: al no requerir clúster, sirve para validar productos de IA antes de escalar a despliegues mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | Qwen3.6-35B-A3B BF16 | Gemma4 26B-A4B-BF16 | Nemotron 3.5 Lightning 30B-A3B-BF16 | Nemotron 3.5 Bolt 74B-A9B-24GB (IQ2) |
|---|---:|---:|---:|---:|
| GDPVal-AA-V2 | 25,75 | 15,33 | 18,26 | **28,47** |
| Terminal-Bench 2.1 | 44,38 | 37,22 | 23,46 | **50,98** |
| Tau3 Banking | 10,52 | 14,02 | 9,48 | **17,01** |
| HLE (sin herramientas) | 19,56 | 17,42 | 10,47 | **25,30** |
| AA-Omniscience accuracy | 19,47 | **22,17** | 16,63 | 16,90 |
| SciCode | 35,33 | 40,28 | 31,38 | **41,02** |
| GPQA Diamond | 83,40 | 79,61 | 75,57 | **86,43** |
| AA-LCR | 61,06 | 57,56 | 49,19 | **64,06** |
| AA-Omniscience no alucinación | — | — | — | 65 (dato truncado en la información disponible) |

No se han publicado en la información disponible los valores completos de AA-Omniscience no alucinación para los modelos comparados, ni resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: 24 GB para el modelo empaquetado, según la model card; el tamaño del repositorio es de 24,1 GB. El despliegue añade memoria para caché KV, que en las recetas oficiales se configura en fp8.
- GPU validadas por el autor: NVIDIA Ampere (A100), Hopper (H100-80GB) y Blackwell, ejecutando vLLM.
- GPU de consumo: no se confirma soporte oficial en la información disponible. El empaquetado de 24 GB es compatible en tamaño con tarjetas de 24 GB, pero la model card solo valida A100, H100-80GB y Blackwell.
- Opciones de despliegue: vLLM es la vía documentada, con una imagen nightly concreta (`vllm/vllm-openai:nightly-77154ca6116ae34cbfe314beef1016bde9b63989`), instalación del paquete `b12x` y descarga de kernels mediante `vllm download-kernels`. Requiere `--trust-remote-code`, backends `b12x` para lineal y MoE, FLASHINFER para atención y FlashInfer para Mamba.
- Configuración destacada: `--tensor-parallel-size 1`, `--max-num-seqs 1`, `--kv-cache-dtype fp8`, caché Mamba en bfloat16, `--video-pruning-rate 0.5` y `--limit-mm-per-prompt '{"video":1,"image":1}'`.
- Decodificación especulativa: borrador `nvidia/Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr` con método `dflash` y 7 tokens especulativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Punto fuerte declarado | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B-24GB | 74B totales / 9B activos (22,37B según safetensors) | 256K | OpenMDW-1.1 | Mejor media en agentes, código científico y GPQA del grupo comparado | HuggingFace, vLLM |
| Qwen3.6-35B-A3B | 35B totales / 3B activos | no disponible | no disponible | Segundo mejor en Terminal-Bench 2.1 y AA-LCR | no disponible |
| Gemma4 26B-A4B | 26B totales / 4B activos | no disponible | no disponible | Mejor en AA-Omniscience accuracy (22,17) y segundo en SciCode | no disponible |
| Nemotron 3.5 Lightning 30B-A3B | 30B totales / 3B activos | no disponible | no disponible | Familia y licencia equivalentes, menor huella | no disponible |

Los datos de parámetros y de licencia de los tres modelos de comparación no aparecen en la información proporcionada más allá de sus cifras de benchmark, por lo que se marcan como no disponibles.

## Limitaciones y advertencias

- Riesgo de alucinación: el propio autor publica una métrica de no alucinación de AA-Omniscience de 65 para este modelo, mientras que su precisión en ese benchmark (16,90) queda por debajo de Gemma4 26B-A4B (22,17); conviene verificar hechos en aplicaciones sensibles.
- Cuantización agresiva: la variante IQ2 a 2 bits puede degradar tareas de precisión fina respecto al modelo base BF16; la model card no publica una comparación directa IQ2 frente a BF16 en los benchmarks listados.
- Discrepancia de parámetros: la model card declara 74B totales y los safetensors del repositorio suman 22.367.086.600 parámetros; conviene tratar esta cifra con cautela al planificar capacidad.
- Idiomas: solo se declaran seis idiomas (en, es, fr, de, it, ja); no hay información sobre el rendimiento relativo entre ellos ni sobre otros idiomas.
- Sesgos: no se documentan en la información disponible sesgos conocidos ni evaluaciones de equidad.
- Licencia: OpenMDW-1.1 es una licencia de pesos abiertos con términos propios; aunque el autor declara uso comercial permitido, debe revisarse el texto completo antes de producción.
- Dependencia de infraestructura: el despliegue documentado exige una versión nightly concreta de vLLM, compilación de kernels propietarios (`b12x`) y `--trust-remote-code`, lo que añade riesgo de reproducibilidad y de cadena de suministro.
- Contexto: aunque se anuncian 256K tokens, no se detalla el rendimiento efectivo en toda la ventana ni el coste de memoria asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de post-entrenamiento v3: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Artículo arXiv 2605.07182: https://arxiv.org/abs/2605.07182
- Artículo arXiv 2601.20088: https://arxiv.org/abs/2601.20088
- Artículo arXiv 2502.02631: https://arxiv.org/abs/2502.02631
- Artículo arXiv 2502.05003: https://arxiv.org/abs/2502.05003
