# bumblebeer/dgg2-latent-code-graphs-adapters

## Resumen

`dgg2-latent-code-graphs-adapters` es una colección de pesos auxiliares (adaptadores LoRA, cabezas de lectura y checkpoints de control) publicada por el usuario `bumblebeer` como material reproducible del trabajo *Latent Roadmaps: Soft-Token Re-Feeding in DiffusionGemma for Code Graphs*. No es un modelo generativo autónomo: los pesos están diseñados para cargarse sobre `google/diffusiongemma-26B-A4B-it` (y, en un experimento preliminar, sobre `google/gemma-4-26B-A4B-it`) y evaluar la capacidad de re-alimentar tokens latentes en un modelo de difusión para reconstruir y refactorizar grafos de llamadas (AST call-graphs) representados como rejillas de 16x16.

El interés del artefacto es metodológico: documenta dos semillas de entrenamiento (`seed42`, `seed1337`), controles con base congelada, baselines no-difusivos y un `ImageDecoder` congelado de 34,15M de parámetros que traduce representaciones latentes de 256x1152 a imágenes RGB de 768x768. El repositorio ocupa 7,1 GB y se distribuye bajo licencia Apache-2.0.

La relevancia es acotada pero específica: sirve a investigadores que quieran auditar o extender el protocolo experimental de *soft-token re-feeding* en modelos de difusión aplicados a código, con predicciones crudas y arneses de evaluación publicados por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA y cabezas de lectura sobre transformer de difusión latente (base `google/diffusiongemma-26B-A4B-it`); incluye baseline autorregresivo sobre `google/gemma-4-26B-A4B-it` y un `ImageDecoder` ViT+Conv |
| Parametros totales | No disponible como cifra única; el repo contiene múltiples checkpoints. Adaptadores LoRA: ~150M (r=64) + cabeza de lectura 2816→1152; LoRA autorregresivo: 74,3M (LM) con torre de visión congelada; `ImageDecoder`: 34,15M |
| Parametros activos | No disponible (el modelo base es A4B, pero el número de parámetros activos no se declara en la información proporcionada) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se distribuyen en `.pt.gz` y `.npy`, no en formatos cuantizados) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt.gz` (checkpoints PyTorch comprimidos), `.npy` (predicciones crudas), directorios de LoRA (`expA_gemma4_ar/gemma4_ar_lora_r64_s42/`) |

## Arquitectura y entrenamiento

El núcleo experimental se apoya en `google/diffusiongemma-26B-A4B-it`, un transformer de difusión latente. Sobre él se entrenan adaptadores LoRA con rango 64 (≈150M de parámetros) más una cabeza de lectura puntual de 2816→1152 dimensiones, durante 4.824 pasos, sobre rejillas de adyacencia de grafos de llamadas AST de 16x16. El conjunto de entrenamiento declarado cubre tres repositorios: `fastapi`, `requests` y `rich`. La torre de visión SigLIP y `embed_vision` permanecen congeladas. Se documentan dos semillas independientes (`seed42`, `seed1337`) y un control con la base de 26B completamente congelada en el que solo se entrena la cabeza de lectura.

El Experimento B introduce un adaptador de entrada modificado (`LayerNorm(384) + Linear(384, 2816)`) junto con LoRA y una cabeza de lectura 2816→384, orientado a refactorización con vectores de símbolos continuos. Se reportan métricas de `26,4±0,3%` en slots vistos, `27,6±1,0%` en no vistos y una deriva de `17,9±0,1x` en slots sin cambios. Además se incluye un LoRA autorregresivo multimodal sobre `google/gemma-4-26B-A4B-it` (r=64, 74,3M de parámetros en el LM, torre de visión congelada) que recibe imágenes RGB de 16x16 más instrucción y emite 256 IDs de celda separados por espacios; este entrenamiento se detuvo en el paso 354 de 4.824 previstos (≈7% del calendario de DiffusionGemma, una sola semilla). También se publican baselines no difusivos (transformers espaciales) con dos semillas y el `ImageDecoder` congelado de 34,15M de parámetros que mapea 256x1152 a 768x768 RGB.

## Capacidades

- Reconstrucción y predicción de grafos de llamadas AST codificados como rejillas de adyacencia 16x16.
- Refactorización de código mediante vectores de símbolos continuos (Experimento B).
- Re-alimentación de tokens latentes (*soft-token re-feeding*) en un pipeline de difusión latente.
- Decodificación de representaciones latentes a imágenes RGB de 768x768 mediante el `ImageDecoder` congelado.
- Baseline autorregresivo multimodal (imagen 16x16 + instrucción → 256 IDs de celda) sobre Gemma 4 26B-A4B-it.
- Evaluación controlada con semillas pareadas y controles de base congelada.
- No se declaran capacidades de tool calling, agentes, multilingüismo ni thinking mode.

## Casos de uso

- Reproducción de experimentos de difusión latente sobre código: cargar los adaptadores `expA_dg/` sobre `google/diffusiongemma-26B-A4B-it` y ejecutar el arnés de `bumblebeers/dgg2-latent-code-graphs` para replicar las métricas de las dos semillas.
- Auditoría de controles: comparar los adaptadores LoRA frente a `cg_frozen_dg_ep3_slim_ckpt.pt.gz` (base congelada, solo cabeza entrenada) para aislar la contribución del ajuste fino.
- Investigación en refactorización con representaciones continuas: usar `expB_dg/cg_expB_lora_dg_seed42_ep3_slim_ckpt.pt.gz` y el adaptador de entrada LayerNorm+Linear para estudiar la sustitución de símbolos discretos por vectores.
- Estudio de baselines no difusivos: emplear `expA_nondg/` y `expB_nondg/` como referencia para medir si la difusión aporta ventaja frente a transformers espaciales en la misma tarea.
- Análisis de drift en slots no modificados: las predicciones `.npy` de `bumblebeer/dgg2-code-graph-benchmarks` permiten recalcular la deriva de `17,9±0,1x` y estudiar su origen.
- Evaluación de decodificación latente a imagen: usar `parent_frozen/decoder.pt` como decodificador fijo en pipelines que necesiten visualizar representaciones 256x1152.
- Estudio preliminar de adaptación multimodal autorregresiva: el LoRA `expA_gemma4_ar/gemma4_ar_lora_r64_s42/` sirve como punto de partida (truncado al 7%) para comparar difusión frente a generación autorregresiva.

## Benchmarks y rendimiento

El `model-index` de la model card declara una entrada sin resultados (`results: []`). No se han publicado resultados de benchmarks en la información disponible. Las únicas cifras reportadas son métricas internas del Experimento B, no comparables con benchmarks estándar:

| Metrica (Exp. B) | Valor |
|---|---|
| Slots vistos | 26,4 ± 0,3% |
| Slots no vistos | 27,6 ± 1,0% |
| Deriva en slots sin cambios | 17,9 ± 0,1x |

## Requisitos de hardware

- El repositorio pesa 7,1 GB, pero la inferencia requiere cargar la base `google/diffusiongemma-26B-A4B-it` (26B) o `google/gemma-4-26B-A4B-it`, no incluida en este repo.
- VRAM estimada para la base: no disponible en la información proporcionada; por el tamaño (26B) no cabe en GPUs de consumo en precisión completa.
- GPU recomendadas: no disponible explícitamente; por tamaño de base se requiere hardware de clase A100/H100 o superior.
- Consumer GPU: no es viable con la base de 26B en FP16/BF16; los adaptadores por sí solos (≈150M) sí son ligeros, pero no funcionan sin la base.
- Opciones de despliegue: los pesos están en `.pt.gz` y `.npy`, sin formato GGUF ni integración declarada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bumblebeer/dgg2-latent-code-graphs-adapters` | Adaptadores ~150M + base 26B | No disponible | Grafos de código / refactorización | Apache-2.0 | Hugging Face (repo de adaptadores) |
| `google/diffusiongemma-26B-A4B-it` | 26B (A4B) | No disponible | Modelo base de difusión | No disponible | Hugging Face |
| `google/gemma-4-26B-A4B-it` | 26B (A4B) | No disponible | Modelo base autorregresivo | No disponible | Hugging Face |

No se dispone de información sobre alternativas directamente comparables en la misma tarea (adaptadores de grafos de código sobre modelos de difusión); se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar la base `google/diffusiongemma-26B-A4B-it` (o `google/gemma-4-26B-A4B-it` para el experimento autorregresivo).
- El LoRA autorregresivo `expA_gemma4_ar/` está truncado al paso 354 de 4.824 (≈7%) y con una sola semilla; sus resultados no son concluyentes.
- El conjunto de entrenamiento declarado son solo tres repositorios (`fastapi`, `requests`, `rich`), lo que limita la generalización a otros dominios de código.
- Las métricas del Experimento B (26,4% / 27,6%) son internas y no comparables con benchmarks estándar; no hay MMLU, HumanEval ni GSM8K.
- No se declaran idiomas soportados ni sesgos conocidos; no hay evaluación de alucinación.
- Los formatos `.pt.gz` y `.npy` requieren código propio de carga; no hay integración con runtimes de inferencia estándar.
- Licencia Apache-2.0 declarada, pero el uso comercial depende también de las licencias de los modelos base (`google/diffusiongemma-26B-A4B-it` y `google/gemma-4-26B-A4B-it`), no detalladas aquí.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/bumblebeer/dgg2-latent-code-graphs-adapters
- Modelo base (difusión): https://huggingface.co/google/diffusiongemma-26B-A4B-it
- Modelo base (autorregresivo): https://huggingface.co/google/gemma-4-26B-A4B-it
- Código y arnés de evaluación: https://github.com/bumblebeers/dgg2-latent-code-graphs
- Dataset de benchmarks y predicciones: https://huggingface.co/datasets/bumblebeer/dgg2-code-graph-benchmarks
- GitHub del autor: https://github.com/bumblebeers
