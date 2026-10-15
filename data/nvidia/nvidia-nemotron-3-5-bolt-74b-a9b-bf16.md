# nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B es un modelo de vision-lenguaje (VLM) de pesos abiertos desarrollado por NVIDIA, disenado para ejecutar tareas agenticas cotidianas en local. Se trata de la version en precision completa (BF16), pensada principalmente para personalizacion y post-entrenamiento en lugar de inferencia directa en produccion. Su arquitectura combina un backbone hibrido Mamba-2 y Transformer con un LatentMoE, al que se anade un codificador visual C-RADIO v4-H.

El modelo cuenta con 74.885.081.096 parametros totales (aproximadamente 74B) de los cuales solo 9B estan activos por token, gracias a su diseno de mezcla de expertos. Soporta hasta 262.144 tokens de contexto (256K) y acepta como entrada texto, imagenes y video, devolviendo texto como salida. Esta disponible en seis idiomas: ingles, castellano, frances, aleman, italiano y japones.

Es relevante ahora porque NVIDIA ofrece junto al modelo un ecosistema completo: recetas de despliegue en vLLM, decodificacion especulativa mediante un drafter LiLiCorr sobre DFlash, datasets de pre-entrenamiento y post-entrenamiento publicados, y una variante cuantizada de 24GB con cuantizacion nativa de 2 bits para ejecucion local junto a otras aplicaciones. La licencia OpenMDW-1.1 permite uso comercial y no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba-2-Transformer hybrid LatentMoE con encoder de vision C-RADIO v4-H |
| Parametros totales | 74.885.081.096 (aproximadamente 74B) |
| Parametros activos | 9B |
| Longitud de contexto | Hasta 262.144 tokens (256K) |
| Tipos de cuantizacion | BF16 (pesos completos); variante de 24GB con cuantizacion nativa de 2 bits (IQ2) |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (BF16); GGUF en la variante de 24GB |

## Arquitectura y entrenamiento

La arquitectura es un hibrido LatentMoE que combina capas Mamba-2 con capas Transformer, lo que permite un coste de atencion mas eficiente sobre contextos largos de hasta 256K tokens, manteniendo 9B parametros activos sobre un total de 74B. El componente de vision es un encoder C-RADIO v4-H, que habilita la entrada de imagenes y video ademas de texto. La decodificacion especulativa se implementa con un drafter LiLiCorr sobre DFlash, configurado con 7 tokens especulativos en las recetas de vLLM proporcionadas.

El modelo se construye sobre nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16 y ha sido entrenado con los datasets nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3. La fecha de corte de los datos de post-entrenamiento es mayo de 2026, con un periodo de desarrollo del modelo entre diciembre de 2025 y mayo de 2026. El numero de tokens de entrenamiento y la composicion exacta del dataset no estan disponibles en la informacion proporcionada. El modo de razonamiento se controla desde la plantilla de chat mediante el parametro `enable_thinking=True/False`, heredado del cliente Super 3.5 VL.

## Capacidades

- Generacion de texto y razonamiento multimodal, con soporte para entradas de texto, imagen y video.
- Modo de razonamiento explicito activable o desactivable mediante la plantilla de chat (`enable_thinking`).
- Soporte de tool calling y function calling, con parser de herramientas `qwen3_coder` y eleccion automatica de herramienta en vLLM.
- Capacidades agenticas orientadas a tareas multi-paso, con benchmarks especificos de uso de herramientas (MCP-Atlas, PinchBench, Terminal-Bench).
- Razonamiento sobre contextos muy largos de hasta 262.144 tokens.
- Capacidades multilingues en ingles, castellano, frances, aleman, italiano y japones.
- Procesamiento de video con parametros de muestreo configurables (fps y numero de fotogramas) y tasa de pruning de video.

## Casos de uso

- Agentes locales de automatizacion de escritorio y terminal: el modelo rinde en Terminal-Bench 2.1 (53,93 en BF16) y puede integrarse en flujos de ejecucion de comandos y edicion de ficheros con soporte de tool calling.
- Atencion al cliente multimodal: gestiona conversaciones multi-turno con contexto de hasta 256K tokens e incorpora capturas o imagenes enviadas por el usuario como entrada.
- Analisis de documentos extensos con imagenes: por ejemplo, revision de informes tecnicos o financieros con tablas escaneadas, aprovechando la ventana de contexto y la entrada visual.
- Generacion y revision de codigo asistida por herramientas: con SciCode (44,49 en BF16) y soporte de function calling, encaja en pipelines de CI/CD y asistentes de repositorio.
- Analisis de video para tareas de monitorizacion o resumen: acepta video como entrada con control de fps y numero de fotogramas, util para extraer descripciones o eventos.
- Base para post-entrenamiento y fine-tuning especializado: al ser la version BF16 completa, esta pensada para personalizacion y para producir variantes cuantizadas (por ejemplo, GGUF destinadas a llama.cpp).
- Despliegue de asistentes con memoria de proyecto larga: la ventana de 256K permite mantener documentacion o historiales extensos sin truncado agresivo.
- Tareas de razonamiento cientifico y matematico: con GPQA Diamond (88,83) y HLE sin herramientas (28,73) como referencia de su rendimiento en dominios tecnicos.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna final corresponde a este modelo en BF16.

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
| MCP-Atlas | 51,20* | no disponible | no disponible (dato truncado en la fuente) | no disponible | no disponible |

El unico valor con asterisco (MCP-Atlas, 51,20) aparece marcado asi en la model card original.

## Requisitos de hardware

- VRAM para BF16: el repositorio ocupa 149,8 GB, por lo que los pesos en precision completa requieren del orden de 150 GB de memoria, lo que implica despliegue multi-GPU con tensor parallelism. La receta oficial de vLLM usa `--tensor-parallel-size 1` para el arranque base, aunque el dimensionado real dependera del numero de GPUs disponible.
- Variante de 24GB: existe una version con cuantizacion nativa de 2 bits pensada para caber en 24GB de memoria y ejecutarse junto a otras aplicaciones. Es la recomendada por NVIDIA para inferencia optimizada en latencia y throughput.
- GPUs recomendadas por el fabricante: vLLM sobre NVIDIA Ampere (A100), Hopper (H100-80GB) o Blackwell. No se detallan requisitos para GPUs de consumo en BF16.
- Compatibilidad con GPU de consumo: la version BF16 no esta pensada para GPU de consumo por tamano; la variante de 24GB (IQ2 o GGUF) es la via para equipos con 24GB de VRAM.
- Opciones de despliegue: vLLM (con `--trust-remote-code`, backend de atencion FLASHINFER, backend mamba flashinfer y parser de razonamiento `ultra_v3`), y llama.cpp mediante la variante GGUF de 24GB.
- Ajustes de inferencia facilitados: decodificacion especulativa con 7 tokens especulativos, chunked prefill, `--max-num-seqs 1`, muestreo recomendado de temperatura 1,0 y top_p 0,95. No se publican cifras concretas de latencia ni throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Datos destacados |
|---|---|---|---|---|---|
| Nemotron 3.5 Bolt 74B-A9B (BF16) | 74B | 9B | 256K | OpenMDW-1.1 | GPQA Diamond 88,83; Terminal-Bench 2.1 53,93 |
| Qwen3.6-35B-A3B-BF16 | 35B | 3B | no disponible | no disponible | GPQA Diamond 83,40; Terminal-Bench 2.1 44,38 |
| Gemma4 26B-A4B-BF16 | 26B | 4B | no disponible | no disponible | GPQA Diamond 79,61; SciCode 40,28 |
| Nemotron 3.5 Lightning 30B-A3B-BF16 | 30B | 3B | no disponible | no disponible | GPQA Diamond 75,57; AA-Omniscience non-hallucination 68,81 |

Los datos de parametros activos y contexto de los modelos de comparacion no estan disponibles en la informacion proporcionada; solo se dispone de sus resultados de benchmark. La licencia y el contexto de Qwen3.6 y Gemma4 no se detallan en la model card original.

## Limitaciones y advertencias

- Esta version BF16 esta destinada a personalizacion y post-entrenamiento, no a inferencia directa en produccion; NVIDIA recomienda la variante de 24GB para despliegues optimizados en latencia y throughput.
- Riesgo de alucinacion: en AA-Omniscience non-hallucination el modelo BF16 obtiene 56,14, por debajo de Nemotron 3.5 Lightning 30B-A3B (68,81) y del propio Bolt en su variante IQ2 (61,27), lo que sugiere mayor propension a respuestas no sustentadas en la version de precision completa.
- No se detallan sesgos conocidos en la informacion disponible.
- El soporte de idiomas se limita a ingles, castellano, frances, aleman, italiano y japones; otros idiomas no estan cubiertos oficialmente.
- La fecha de corte de los datos de post-entrenamiento es mayo de 2026, por lo que el conocimiento posterior a esa fecha no esta incluido.
- La licencia es OpenMDW-1.1, gobernada por el acuerdo OpenMDW; el modelo esta declarado como apto para uso comercial y no comercial, pero deben revisarse los terminos completos del acuerdo para produccion.
- El despliegue requiere `--trust-remote-code` y codigo personalizado del repositorio, lo que implica ejecutar codigo del autor del modelo.
- La variante de 24GB emplea cuantizacion de 2 bits, con la perdida de precision que ello conlleva respecto a BF16.

## Enlaces

- HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Variante de 24GB: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Variante de 24GB en GGUF: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Repositorio de la licencia: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Paper (arXiv:2605.07182): https://arxiv.org/abs/2605.07182
- Pagina de desarrollador Nemotron: https://developer.nvidia.com/nemotron
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Coleccion de datasets de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
