# mlx-community/flint-oQ2.7e

## Resumen

flint-oQ2.7e es una cuantización extrema (2,7 bits por peso de media) del modelo Recursive Flint, publicado por la comunidad mlx-community para su ejecución en Apple Silicon mediante la librería MLX. El modelo base, RecursiveSI/flint, es un modelo MoE de 40B de parámetros totales con unos 2,5B activos por token, diseñado para generación de texto, código y tareas de agente con razonamiento. Esta variante reduce el tamaño en disco de 79,6 GB (bf16) a 16,2 GB, haciéndolo ejecutable en Macs de 24 GB de memoria unificada.

La cuantización emplea oQ2.7e, un esquema de precisión mixta guiada por datos del proyecto oMLX, con recorte de rangos calibrado mediante matriz de importancia (imatrix). El resultado mantiene respuestas coherentes según el autor, aunque con una pérdida de fidelidad notable frente a bf16 (perplexidad +8), por lo que se posiciona como opción para hardware limitado más que como variante de máxima calidad.

Es relevante porque permite ejecutar un MoE de 40B en hardware de consumo de Apple a más de 100 tokens/s, con contexto nativo de 262k tokens, bajo licencia Apache 2.0 que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (49 capas: 2 densas + 47 MoE), con atención híbrida deslizante |
| Parametros totales | 39.785.299.488 (~40B) |
| Parametros activos | ~2,5B por token (256 expertos enrutados, top-6 + 1 experto compartido) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | oQ2.7e (precisión mixta: expertos a 2 bits, down_proj y gate/up_proj de las 11 capas MoE más sensibles a 3 bits, atención, experto compartido, capas densas, embed_tokens y lm_head a 8 bits; grupo de 64, cuantización afín con imatrix) |
| Idiomas soportados | no disponible (el corpus de evaluación de la cuantización es prosa en inglés; consultar la ficha del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (cuantización afín estándar de MLX, sin kernels personalizados) |

## Arquitectura y entrenamiento

El modelo base Recursive Flint es un transformer de mezcla de expertos con 49 capas: 2 densas y 47 MoE. Cada capa MoE contiene 256 expertos enrutados de los que se activan 6 por token, más 1 experto compartido siempre activo, lo que da unos 2,5B de parámetros activos por token sobre 40B totales. La atención es híbrida: 35 capas usan ventana deslizante de 513 tokens y 14 capas usan atención completa, lo que habilita la ventana de contexto de 262k tokens.

Sobre esta arquitectura, la variante oQ2.7e aplica el esquema de cuantización oQ nivel 2,7 mejorado ("e") de oMLX: un asignador mide la sensibilidad de cada capa sobre los pesos bf16 y distribuye los bits en consecuencia, manteniendo a 8 bits todo lo que se lee en cada token (atención, experto compartido, capas densas, embeddings y lm_head). La "e" añade una pasada de imatrix con 128 muestras de calibración que ajusta el rango de recorte de cada grupo según la importancia de las activaciones; no cambia el reparto de bits, solo las escalas internas. Sobre los datos de entrenamiento del modelo base (tokens, composición del dataset, RLHF/DPO) no se proporciona información en esta ficha; remitirse a la model card de RecursiveSI/flint.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tags conversational y text-generation).
- Generación de código (tag code en la model card; el ejemplo de uso genera una función Python).
- Comportamiento de agente (tag agent) con soporte de tool calling: el servidor oMLX expone una API compatible con OpenAI que admite llamadas a herramientas.
- Razonamiento explícito: el servidor devuelve el razonamiento en el campo `reasoning_content`; razonamiento y respuesta comparten el presupuesto de salida, recomendándose 32k tokens o más para problemas difíciles.
- Contexto muy largo: 262k tokens con atención híbrida de ventana deslizante.
- Multilingüe: no disponible (sin datos en la información proporcionada).
- Visión: el modelo se cuantiza a través de la clase de modelo de mlx-vlm y carga con mlx-vlm ≥ 0.7.10, aunque la información disponible no confirma capacidades multimodales del modelo base.

## Casos de uso

- Ejecución local en Macs de 24 GB: con 16,2 GB en disco y picos de memoria de ~16,3-17,8 GB, es la variante pensada para portátiles Apple Silicon con 24 GB de memoria unificada, algo inviable con los pesos bf16 (79,6 GB).
- Asistentes y agentes locales con herramientas: mediante `omlx serve` se obtiene una API compatible con OpenAI con tool calls, útil para integrar el modelo en pipelines de agentes multi-paso sin depender de la nube.
- Generación y refactorización de código en local: el ejemplo oficial muestra generación de funciones Python; el presupuesto de salida amplio (32k+) permite razonamiento extenso antes de la respuesta final.
- Procesamiento de documentos largos: la ventana de 262k tokens permite resumir o analizar repositorios, contratos o corpus extensos en una sola sesión.
- Prototipado de razonamiento multi-turno: la recomendación de mantener el razonamiento devuelto en el historial de conversación permite construir flujos de diálogo con trazas de razonamiento persistentes.
- Despliegue en servidores Apple Silicon de gama alta: en un MacBook Pro M5 Max de 128 GB se midieron 123 tok/s a contexto corto y 105 tok/s a 16k de contexto, con margen para múltiples sesiones o modelos co-residentes.
- Investigación sobre cuantización extrema: la serie flint-oQ (de oQ2e a oQ8e) con métricas KL y perplexidad publicadas sirve como banco de pruebas para estudiar el impacto de precisión mixta en MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) para esta variante; el autor indica explícitamente no haberlos ejecutado aún. Sí se han publicado métricas de fidelidad frente a bf16 (64 fragmentos de 2048 tokens, 65.472 posiciones puntuadas, KL truncado al top-256 de bf16):

| Modelo | Tamaño | bpw | KL medio ↓ | Perplexidad ↓ | Acuerdo top-1 ↑ |
|---|---|---|---|---|---|
| bf16 (referencia) | 79,6 GB | 16 | 0 | 14,30 | 100% |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 14,86 | 78,3% |
| flint-oQ3e | 18,5 GB | 3,71 | 0,650 | 16,92 | 64,6% |
| **flint-oQ2.7e (este repo)** | 16,2 GB | 3,26 | **1,140** | **22,38** | **55,3%** |
| flint-oQ2e | 13,9 GB | 2,80 | 1,519 | 28,99 | 50,2% |

Velocidad de generación (decodificación greedy, 256 tokens, mediana de 3 ejecuciones, oMLX con kernel fusionado de MoE, MacBook Pro M5 Max 128 GB):

| Contexto | Tokens/s |
|---|---|
| ~30 tokens | 123 |
| 4k | 112 |
| 16k | 105 |

## Requisitos de hardware

- Memoria estimada: 16,2 GB en disco; pico de memoria en generación de ~16,3 GB a contexto corto y ~17,8 GB a 16k de contexto. Pensado para Macs de 24 GB de memoria unificada como mínimo.
- Hardware verificado: MacBook Pro M5 Max de 128 GB (40 núcleos GPU), donde se cuantizó y probó. No hay datos de GPUs NVIDIA; al ser formato MLX, el despliegue nativo es en Apple Silicon.
- Consumer hardware: cabe en Macs de 24 GB (M3/M4/M5 Pro o superiores); en Macs de 32 GB o más hay margen adicional para contextos largos. No es ejecutable de forma nativa en GPUs de consumo NVIDIA (formato MLX, no GGUF).
- Despliegue: oMLX (recomendado, `omlx serve`, API compatible con OpenAI con tool calls y `reasoning_content`) y mlx-vlm ≥ 0.7.10. No compatible con mlx-lm estándar sin adaptación, ya que los pesos llevan el prefijo `language_model.`.
- Rendimiento: 123 tok/s a contexto corto y 105 tok/s a 16k en M5 Max; el autor advierte de deriva de hasta ~10% entre sesiones. No es más rápido que oQ4e: por debajo de oQ4e, menos bits ahorran memoria pero no velocidad, al estar la decodificación limitada por el overhead de lanzamiento de kernels con ~2,5B de parámetros activos.

## Comparativa con modelos similares

Comparativa entre las variantes cuantizadas de la misma familia disponibles en mlx-community (todas sobre RecursiveSI/flint, Apache 2.0):

| Modelo | Tamaño | bpw | KL medio vs bf16 | Perplexidad | Tok/s (ctx corto) | Memoria pico |
|---|---|---|---|---|---|---|
| flint-oQ2.7e (este repo) | 16,2 GB | 3,26 | 1,140 | 22,38 | 123 | 16,3-17,8 GB |
| flint-oQ3e | 18,5 GB | 3,71 | 0,650 | 16,92 | 109 | 18,5-20,0 GB |
| flint-oQ4e | 23,4 GB | 4,70 | 0,222 | 14,86 | 120 | 23,5-25,0 GB |
| RecursiveSI/flint (bf16) | 79,6 GB | 16 | 0 (ref.) | 14,30 | no disponible | 79,6 GB+ |

La elección depende del hardware: oQ2.7e es la opción para Macs de 24 GB; oQ4e ofrece fidelidad muy superior (KL 0,222 frente a 1,140) si se dispone de 32 GB; oQ3e es un punto intermedio. No se incluyen modelos de otras familias por falta de datos comparables en la información disponible.

## Limitaciones y advertencias

- Pérdida de fidelidad significativa: perplexidad 22,38 frente a 14,30 de bf16 (+8) y acuerdo top-1 del 55,3%. El autor advierte de "fuerte pérdida frente a bf16": responde coherentemente en sus pruebas, pero cabe esperar más errores.
- Sesgos: no disponibles datos específicos; consultar la model card del modelo base.
- Riesgo de alucinación: aumentado respecto al modelo bf16 por la agresividad de la cuantización (2 bits en los expertos enrutados), según la propia advertencia del autor.
- Idiomas: la evaluación de fidelidad se hizo sobre prosa en inglés y el corpus no está garantizado como disjunto de los datos de calibración de oQ; las métricas sirven para ordenar variantes, no como puntuación de calidad en datos nuevos.
- Sin benchmarks de tareas publicados para esta variante; no se ha validado su rendimiento en tareas concretas (código, agentes, matemáticas) de forma medible.
- Compatibilidad: los pesos usan prefijo `language_model.` (vía mlx-vlm), por lo que no cargan en mlx-lm estándar; requieren oMLX o mlx-vlm ≥ 0.7.10.
- Muestreo recomendado: temperatura 1.0, top-p 0.95, top-k 20 y presupuesto de salida de al menos 32k tokens para problemas difíciles; desviarse de estos parámetros puede degradar los resultados.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque deben respetarse los términos de atribución y la nota de la licencia del modelo base.

## Enlaces

- Ficha del modelo: https://huggingface.co/mlx-community/flint-oQ2.7e
- Modelo base (bf16): https://huggingface.co/RecursiveSI/flint
- oMLX (herramienta de cuantización y servidor): https://github.com/jundot/omlx
- Variantes de la serie: https://huggingface.co/mlx-community/flint-oQ8e, https://huggingface.co/mlx-community/flint-oQ6e, https://huggingface.co/mlx-community/flint-oQ5e, https://huggingface.co/mlx-community/flint-oQ4e, https://huggingface.co/mlx-community/flint-oQ3e, https://huggingface.co/mlx-community/flint-oQ2.5e, https://huggingface.co/mlx-community/flint-oQ2e
