# DJLougen/LFM2.5-VL-3B-DSpark-MLX-bf16

## Resumen

El modelo `DJLougen/LFM2.5-VL-3B-DSpark-MLX-bf16` es una conversión nativa al framework MLX del borrador (*drafter*) DFlash de cuatro capas de Liquid AI, derivado de `LiquidAI/LFM2.5-VL-3B-DSpark`. No es un modelo de chat ni un modelo visión-lenguaje autónomo: es un modelo borrador de decodificación especulativa que propone varios tokens por paso para que el modelo objetivo los verifique. Su único propósito es acelerar la inferencia del modelo objetivo `LFM2.5-VL-3B` dentro del runtime MLX-VLM.

La relevancia de esta conversión es de nicho pero concreta: el checkpoint original de DSpark se distribuye en un formato orientado a SGLang, y esta conversión lo adapta al layout del runtime DFlash de MLX-VLM para que los usuarios de Apple Silicon puedan cargarlo junto a un modelo objetivo LFM. El modelo pesa 279.468.801 parámetros y ocupa un único fichero `model.safetensors` de 558.942.944 bytes en BF16.

La idea subyacente de DFlash es que el modelo objetivo conserva siempre la autoridad sobre la salida: a temperatura cero (greedy), las pruebas realizadas produjeron el mismo texto que la decodificación sin borrador. El beneficio es de velocidad, no de calidad, y no se materializa en todos los escenarios: la ganancia medida es grande en prompts cortos con objetivo BF16 y marginal con objetivo de 8 bits.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Borrador (*draft*) DFlash de decodificación especulativa, 4 capas, conversión MLX nativa; el repo incluye la etiqueta `qwen3` y las etiquetas `mlx-vlm`, `speculative-decoding`, `dflash`, `draft-model`, `lfm2-vl` |
| Parámetros totales | 279.468.801 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | BF16 (este repositorio). La familia objetivo dispone de variantes MLX BF16 y MLX 8 bits; el borrador solo se distribuye aquí en BF16 |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (metadatos de HuggingFace: `lfm1.0`; el código del repositorio fuente tiene licencia Apache-2.0, que no se aplica a los pesos) |
| Formato de pesos | safetensors (MLX); fichero `model.safetensors`, 558.942.944 bytes, SHA-256 `80d4396d7e407f12794a151065e053206b19261c0c48c688fb0c550e5ac8f635` |

## Arquitectura y entrenamiento

Se trata de un modelo borrador de cuatro capas para decodificación especulativa del tipo DFlash. En lugar de generar un único token candidato, DFlash propone un bloque de varios tokens por cada paso de verificación del modelo objetivo; si la propuesta se acepta, se avanza varios tokens de golpe y el modelo objetivo sigue siendo el que determina la salida final. El tamaño medido (279,4 M de parámetros) corresponde a ese borrador compacto, no al modelo objetivo `LFM2.5-VL-3B`, que es un VLM que combina un backbone de la familia LFM2.5-2.6B con un codificador de imagen SigLIP2 NaFlex.

El repositorio no documenta el proceso de entrenamiento del borrador (número de tokens, composición del dataset, uso de RLHF o DPO), porque es una conversión de pesos, no un entrenamiento nuevo. La conversión toma el checkpoint `LiquidAI/LFM2.5-VL-3B-DSpark` (fijado en la revisión `af77e9306a26e8625fde74d2a3051ab6d21bd955`) y lo remapea del formato orientado a SGLang al layout del runtime DFlash de MLX-VLM. La innovación técnica relevante no está en el propio modelo, sino en el mecanismo de especulación: la verificación del modelo objetivo garantiza que la salida no cambie, de modo que se obtiene aceleración sin degradación de calidad en decodificación greedy.

## Capacidades

- Modelo borrador de decodificación especulativa: propone bloques de tokens para que el modelo objetivo `LFM2.5-VL-3B` los verifique.
- No genera texto de forma autónoma: no es un modelo de chat ni un VLM independiente.
- Preserva la salida del modelo objetivo: en las pruebas a temperatura cero, el texto seleccionado coincidió con el de la decodificación sin borrador.
- Específico para la familia objetivo `LFM2.5-VL-3B`: no es un borrador genérico ni un borrador Qwen3 de propósito general, pese a la etiqueta `qwen3` presente en los metadatos.
- Solo funciona en modo greedy: la especulación DFlash del runtime es únicamente greedy, por lo que se debe usar temperatura cero.
- Requiere `mlx-vlm >= 0.7.2` (las mediciones se hicieron con `mlx-vlm==0.7.3`, `mlx 0.32.2` y `transformers 5.17.0`).
- No dispone de *tool calling*, capacidades multilingües propias, modo *thinking*, visión ni audio por sí mismo: todas esas capacidades residen en el modelo objetivo.

## Casos de uso

- Aceleración de asistentes visuales en Mac: cargando el borrador junto al objetivo `LFM2.5-VL-3B-MLX-bf16` con `--draft-block-size 8` y temperatura cero, se ha medido un incremento de 2,99x en velocidad de decodificación sobre prompts cortos con imagen, lo que reduce la latencia percibida en un asistente interactivo.
- Descripción de imágenes en local sobre Apple Silicon: para peticiones cortas del tipo "Describe esta imagen" con límite de 128 tokens, el uso del borrador elevó el throughput de 43,6 a 130,7 tok/s en un M3 Max de 36 GB, adecuado para prototipos de captioning on-device.
- Comprensión de pantalla y documentos en flujos interactivos: en tareas de grounding y lectura de documentos donde las respuestas son breves, el borrador puede recortar el tiempo de respuesta sin alterar el texto final, algo útil en herramientas de accesibilidad o automatización de escritorio.
- Bucles agentic de pocos pasos: en pipelines que encadenan varias consultas cortas al VLM, la ganancia por paso se acumula; conviene verificar el ratio end-to-end en cada caso, dado que el borrador añade trabajo.
- Evaluación y *benchmarking* de decodificación especulativa: el repositorio fuente y `results/sweep.json` sirven como material reproducible para medir ratios de aceptación y aceleración en hardware Apple.
- Servicio de baja concurrencia en un Mac: para implementaciones single-machine orientadas a desarrolladores que ya dispongan de un objetivo BF16, el borrador es la vía soportada dentro de MLX-VLM para habilitar especulación.
- No es adecuado para: contextos largos (a partir de 32k y 64k tokens de contexto de libro, el borrador resultó más lento que la decodificación sin él), objetivos de 8 bits con ganancia marginal (1,07x de decodificación, 1,06x end-to-end) ni entornos CUDA/SGLang, para los que existe el checkpoint original.

## Benchmarks y rendimiento

Medición local en una sola máquina: Apple M3 Max con 36 GB de memoria unificada, Python 3.12, `mlx 0.32.2`, `mlx-vlm 0.7.3` y `transformers 5.17.0`. Pantalla de prompts cortos: tres instrucciones sobre la misma imagen, generación greedy y dos repeticiones por prompt/configuración. Se retiene la ejecución de menor tiempo total por prompt/configuración y luego se promedian throughput y ratios entre prompts; la selección mejor-de-dos puede ser optimista.

| Precisión del objetivo | Bloque del borrador | Decodificación solo objetivo (media) | Con este borrador (media) | Ratio de velocidad de decodificación | Ratio end-to-end | Tokens aceptados por ronda |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 8 | 43,6 tok/s | 130,7 tok/s | 2,99x | 2,41x | 4,30 |
| 8 bits | 4 | 74,9 tok/s | 79,2 tok/s | 1,07x | 1,06x | 2,97 |

La salida seleccionada del borrador para cada prompt coincidió con el texto de la decodificación solo con objetivo. Son resultados locales, no un benchmark del fabricante ni una promesa de velocidad en otra máquina. El barrido de contexto completo probado usó objetivo BF16 y borrador BF16 y encontró que la especulación era más lenta que la decodificación sin borrador con 32k y 64k tokens de contexto de libro. Los resultados de 16k del benchmark fuente presentaron una varianza elevada entre ejecuciones, por lo que no se ofrece recomendación estable para esa longitud. No se proporcionan en la información disponible resultados de calidad (MMLU, HumanEval, GSM8K u otros) para este borrador.

## Requisitos de hardware

- Hardware de referencia de las mediciones: Apple M3 Max con 36 GB de memoria unificada.
- Peso del borrador: fichero BF16 de 558.942.944 bytes (aproximadamente 0,56 GB en disco); el repositorio completo ocupa 0,6 GB. A esto hay que sumar la memoria del modelo objetivo `LFM2.5-VL-3B`.
- Plataforma: exclusivamente Apple Silicon mediante MLX; no se distribuye versión CUDA ni GGUF en este repositorio, por lo que no se aplica a GPUs NVIDIA de consumo (RTX 4090, etc.) ni a A100/H100 desde este artefacto.
- Software necesario: builds compatibles de MLX y MLX-VLM en Apple Silicon; `mlx-vlm >= 0.7.2`, con las mediciones realizadas sobre `mlx-vlm==0.7.3`, `mlx 0.32.2` y `transformers 5.17.0`.
- Opciones de despliegue: `mlx_vlm.generate` con los argumentos `--model`, `--draft-model`, `--draft-block-size 8` y `--temperature 0`. El checkpoint original de DSpark está orientado a SGLang, pero esta conversión no reclama soporte en ese runtime.
- Latencia y throughput medidos: 130,7 tok/s con objetivo BF16 y bloque 8 frente a 43,6 tok/s sin borrador; 79,2 tok/s con objetivo de 8 bits y bloque 4 frente a 74,9 tok/s sin borrador. En contextos de 32k y 64k tokens, el borrador fue más lento que la decodificación solo con objetivo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `DJLougen/LFM2.5-VL-3B-DSpark-MLX-bf16` (este) | Borrador DFlash VL convertido a MLX | 279.468.801 | No disponible | LFM Open License v1.0 | MLX/MLX-VLM, Apple Silicon |
| `LiquidAI/LFM2.5-VL-3B-DSpark` | Borrador DFlash VL original (upstream) | No disponible en la información proporcionada | No disponible | LFM Open License v1.0 | Formato orientado a SGLang |
| LFM2.5-DSpark para modelos de texto (LFM2.5-1.2B-Instruct, LFM2.5-2.6B, LFM2.5-8B-A1B) | Borradores de decodificación especulativa para LLM de texto | No disponible | No disponible | No disponible | Día uno con llama.cpp y SGLang; hasta 3,18x en GPU y 2,87x on-device |
| `LiquidAI/LFM2.5-VL-3B` (objetivo) | VLM con backbone LFM2.5-2.6B y codificador SigLIP2 NaFlex | No disponible | No disponible | No disponible | HuggingFace y docs de Liquid |

Los borradores de texto de la familia LFM2.5-DSpark son el referente más cercano en concepto (aceleración por especulación sin cambiar la calidad), pero están pensados para modelos de lenguaje de texto y no para el VLM. No se dispone de datos comparables de otros borradores VL en MLX dentro de la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no sirve para chat ni para visión-lenguaje por sí solo; está atado a la familia objetivo `LFM2.5-VL-3B`.
- No es un borrador Qwen3 de propósito general, pese a la etiqueta `qwen3` de los metadatos.
- La especulación puede ser más lenta que la decodificación solo con objetivo, especialmente en contextos largos o cuando el objetivo ya es rápido.
- Las mediciones de contexto largo se hicieron solo con borrador BF16 y no establecen el rendimiento en contexto largo para otras variantes de objetivo.
- Los resultados de 16k presentaron una varianza alta entre ejecuciones; no hay recomendación estable para esa longitud.
- Los resultados de 8 bits son apenas mejores que sin borrador (1,07x de decodificación), por lo que no compensa en ese caso.
- La selección mejor-de-dos en el benchmark puede ser optimista y los números son de una única máquina (M3 Max), no extrapolables a otro hardware.
- En modo greedy únicamente: no funciona con muestreo por temperatura.
- Licencia: los pesos se distribuyen bajo la LFM Open License v1.0, con las restricciones que imponga dicha licencia para uso comercial; la licencia Apache-2.0 del repositorio de código no se aplica a los pesos.
- Riesgo de alucinación, sesgos y limitaciones idiomáticas: no evaluables en este artefacto, ya que dependen del modelo objetivo `LFM2.5-VL-3B`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJLougen/LFM2.5-VL-3B-DSpark-MLX-bf16
- Modelo borrador upstream: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-DSpark
- Modelo objetivo LFM2.5-VL-3B: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- Documentación de Liquid sobre LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Blog de Liquid sobre LFM2.5-VL-DSpark: https://www.liquid.ai/blog/lfm2-5-vl-dspark
- Blog de HuggingFace sobre LFM2.5-DSpark: https://huggingface.co/blog/LiquidAI/lfm25-dspark
- Blog de Liquid sobre LFM2.5-DSpark: https://www.liquid.ai/blog/lfm2.5-dspark
- Repositorio de conversión y evaluación: https://github.com/DJLougen/lfm25-vl-3b
- Resultados del barrido: https://github.com/DJLougen/lfm25-vl-3b/blob/main/results/sweep.json
- Licencia (LFM Open License v1.0), referenciada como `LICENSE` en el repositorio del modelo.
