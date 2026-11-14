# Hooshaai/llava-qwen-0.5b-progressive-token-pruning-scienceqa

## Resumen

`llava-qwen-0.5b-progressive-token-pruning-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una tecnica de poda progresiva de tokens de atencion (Progressive Token Pruning, PTP v2) implementada en el framework NeuralOps. El autor es Hooshaai y el modelo se distribuye con licencia MIT. Su proposito es servir como artefacto de investigacion dentro de una "Attention Surgery Zoo": no es un modelo base nuevo, sino un delta quirurgico que modifica unicamente las capas de auto-atencion de 18 de las 24 capas del decoder Qwen2, manteniendo congelados el vision tower SigLIP, el proyector MLP y los MLPs del decoder.

La relevancia de este checkpoint reside en que demuestra que es posible reducir drasticamente el coste de atencion (poda de keys/values por capa segun una red de scoring) y, al mismo tiempo, recuperar parte de la calidad perdida mediante destilacion de conocimiento offline. El resultado reportado es un artefacto de solo 372,89 MB (frente a 1,66 GB del base en FP16, un 78,1 % menos) que alcanza 41,25 % de accuracy en el subconjunto con imagen de ScienceQA (validation), frente al 30,00 % del modelo podado sin destilacion y al 63,75 % del teacher original.

El modelo esta pensado para experimentacion en investigacion sobre eficiencia de atencion y compresion de VLM, no como sustituto directo del modelo base en produccion. Su tamano (0,5B parametros en el decoder) y su ventana de contexto heredada de LLaVA-Interleave-Qwen-0.5B lo hacen manejable en GPUs de consumo, pero su rendimiento absolute sigue siendo modesto en tareas STEM multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA multimodal: vision tower SigLIP congelado (27 capas) + proyector MLP de 2 capas + decoder Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atencion modificada con Progressive Token Pruning en 18/24 capas |
| Parametros totales | 0,5B en el decoder Qwen2 (no se especifica el total incluyendo vision tower) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de `llava-hf/llava-interleave-qwen-0.5b-hf`) |
| Tipos de cuantizacion | pesos serializados en FP16 (`attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 372,89 MB) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LLaVA-Interleave-Qwen-0.5B: un vision encoder SigLIP congelado de 27 capas, un proyector MLP de 2 capas que mapea embeddings visuales al espacio del lenguaje, y un decoder transformer Qwen2 de 24 capas con dimension 1024, 16 cabezas y head_dim 64. La intervencion quirurgica sustituye la auto-atencion estandar por `ProgressiveTokenPruning` (familia `adaptive`) en 18 de las 24 capas, segun un esquema `hybrid_3_1`; las 6 capas restantes (`[3, 7, 11, 15, 19, 23]`) se mantienen como "anclas cuadraticas" con atencion completa. El mecanismo PTP puntua cada token mediante una red de scoring por capa, fuerza la retencion del primer token (BOS/CLS), selecciona `k = ceil(L * keep_ratio)` tokens (top-k en encoder bidireccional; primeros + ultimos en decoder causal para evitar fuga de futuro) y calcula atencion solo sobre el subconjunto reducido de keys/values, devolviendo la forma original (B, L, D). Cuando no hay poda efectiva y no hay cache, se usa la ruta rapida SDPA.

El entrenamiento se realizo mediante destilacion de conocimiento offline con la arquitectura de cache de representaciones de NeuralOps (§21.1), sobre una NVIDIA RTX 3090 de 24 GB, con 0 MB de VRAM de teacher en GPU. Se ejecutaron 135 pasos de optimizacion (16 en stage 1 y 119 en stage 2) en 120,2 segundos, con un pico de VRAM de 15.329 MB. Los componentes modificados y guardados son las 18 capas de auto-atencion del decoder mas los layernorms entrenados; quedan congelados y excluidos el vision tower, el proyector multimodal, las 6 capas ancla, los MLPs del decoder y los embeddings. El dataset de evaluacion es ScienceQA (subconjunto con imagen, split validation) de `derek-thomas/ScienceQA`.

## Capacidades

- Generacion de texto e image-text-to-text: responde a preguntas en lenguaje natural sobre imagenes de contenido STEM (ciencia, tecnologia, ingenieria y matematicas).
- Razonamiento visual multimodal basico: interpreta diagramas, esquemas y graficos cientificos incluidos en las preguntas de ScienceQA.
- Conversacion multi-turno: hereda la plantilla de chat de LLaVA-Interleave-Qwen-0.5B (`chat_template.json`).
- Compresion de atencion en tiempo de inferencia: la poda progresiva de tokens reduce el coste de atencion por capa segun `keep_ratio`.
- No se documenta soporte de tool calling / function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles (unico idioma declarado).
- No se documentan modos especiales como thinking mode, vision de alta resolucion, audio ni video.

## Casos de uso

- Investigacion en eficiencia de atencion: el checkpoint sirve como artefacto reproducible para estudiar el trade-off entre `keep_ratio`, accuracy y perplexity en un VLM de 0,5B, comparando directamente contra el teacher y contra el modelo podado sin destilacion.
- Destilacion de VLM en hardware de consumo: al entrenarse en una RTX 3090 con 0 MB de VRAM de teacher, el flujo NeuralOps permite replicar experimentos de knowledge distillation offline en equipos de gama alta consumer.
- Experimentos de compresion de modelos: el delta de 372,89 MB (frente a 1,66 GB del base) es un caso de estudio util para medir cuanta calidad se retiene al guardar solo las capas de atencion modificadas.
- Evaluacion comparativa en ScienceQA: sirve como baseline quirurgico para comparar distintas tecnicas de poda de tokens (top-k, umbral adaptativo, etc.) sobre el mismo subconjunto con imagen.
- Prototipado de asistentes educativos STEM: con 41,25 % de accuracy en ScienceQA, puede usarse como componente inicial en demos de tutoria cientifica con imagenes, siempre con validacion humana.
- Benchmarking de pipelines de despliegue: permite medir latencia y throughput de un VLM de 0,5B con atencion podada frente a atencion cuadratica completa en frameworks como vLLM o llama.cpp (si bien la libreria nativa es `neuralops`).

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 30,00 | 41,25 | +11,25 |
| Perplexity (PPL) en el mismo subconjunto | 2,45 | 4,63 | 1,82 | -2,81 |

El checkpoint final recupera 11,25 puntos de accuracy respecto al modelo podado sin destilacion, pero queda 22,5 puntos por debajo del teacher original. La perplexity final (1,82) es inferior a la del teacher (2,45), lo que sugiere que la destilacion ajusto la distribucion de salida al subconjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto de pesos ocupa 372,89 MB en FP16; el modelo base completo en FP16 ocupa 1,66 GB, por lo que la inferencia con el base cargado mas el delta requiere del orden de 2-3 GB de VRAM, dependiendo del framework y del tamaño de lote.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para el modelo base de 0,5B en FP16; se ha documentado entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB) con pico de 15.329 MB.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes.
- Opciones de despliegue: la libreria nativa es `neuralops`; el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` es compatible con transformers, vLLM, TGI y llama.cpp (para el base, no necesariamente para la atencion podada, que requiere el operador `ProgressiveTokenPruning` de NeuralOps).
- Latencia y throughput: no disponible en la informacion proporcionada; solo se documenta que el entrenamiento de destilacion completo tardo 120,2 s en 135 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llava-qwen-0.5b-progressive-token-pruning-scienceqa` (este) | 0,5B decoder | no disponible | 41,25 % accuracy / 1,82 PPL en ScienceQA image subset | MIT | Hugging Face, libreria neuralops |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (base/teacher) | 0,5B decoder | no disponible | 63,75 % accuracy / 2,45 PPL en el mismo subconjunto | no disponible en la informacion | Hugging Face, transformers |
| Version podada sin destilacion (Pre-KD) | 0,5B decoder | no disponible | 30,00 % accuracy / 4,63 PPL | MIT (mismo zoo) | Artefacto intermedio del mismo experimento |

No se dispone de datos de benchmarks para otros VLM de 0,5B comparables (por ejemplo, variantes de Qwen2-VL o SmolVLM) en la informacion proporcionada, por lo que la comparativa se limita a las tres filas anteriores.

## Limitaciones y advertencias

- Rendimiento absolute modesto: 41,25 % de accuracy en ScienceQA frente al 63,75 % del teacher, una caida de 22,5 puntos que limita su uso en tareas STEM reales sin supervision.
- Especializado en un unico dataset: la destilacion y la evaluacion se realizaron exclusivamente sobre ScienceQA (subconjunto con imagen); no hay evidencia de generalizacion a otros dominios visuales.
- Solo ingles: el unico idioma declarado es `en`; no se garantiza calidad en castellano ni en otros idiomas.
- Artefacto quirurgico, no modelo autonomo: el repo contiene unicamente `attention_weights.safetensors` (786 tensores) y un manifiesto; para inferencia completa es necesario cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar el delta con NeuralOps.
- Dependencia de la libreria `neuralops`: el operador `ProgressiveTokenPruning` no forma parte de transformers estandar, por lo que el checkpoint no es directamente cargable en vLLM, TGI o llama.cpp sin portar la atencion.
- Riesgo de alucinacion: inherente a los VLM de 0,5B, especialmente agravado por la poda de tokens que puede descartar informacion visual relevante en imagenes con muchos objetos o texto.
- Sesgos: no se documentan sesgos conocidos; el dataset ScienceQA y el modelo base pueden introducir sesgos de dominio cientifico y cultural.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en produccion; los resultados del model-index estan marcados como `verified: false`.
- Fecha de creacion futura (2026-11-11) y solo 30 descargas: modelo de investigacion con muy poca validacion externa por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-progressive-token-pruning-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementacion del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/progressive_token_pruning.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
