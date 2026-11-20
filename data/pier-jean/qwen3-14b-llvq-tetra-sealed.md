# Pier-Jean/Qwen3-14B-LLVQ-Tetra-sealed

## Resumen

Qwen3-14B-LLVQ-Tetra-sealed es una cuantización extrema del modelo Qwen3-14B de Alibaba Qwen, publicada por el desarrollador independiente Pier-Jean. El modelo comprime los 14.000 millones de parámetros del original en un único fichero de 5,09 GB, lo que equivale a 2,73 bits por parámetro de media, mediante una combinación de códigos sobre el retículo de Leech Λ₂₄ (método Tetra) para 181 de las 280 proyecciones lineales, cuantización int4 para el resto de proyecciones y para el embedding y la cabeza de salida, y f16 para las normas. La innovación principal es el formato de empaquetado: bloques de 24 pesos codificados en 48 bits con una escala por fila, decodificados y multiplicados en una única pasada por un kernel CUDA fusionado.

El modelo no es un checkpoint convencional: no se carga con `transformers`, sino con el motor en Rust del proyecto LLVQ, que incluye el lector del formato y los binarios de evaluación. El autor publica el SHA-256 del fichero y lo vincula a su artículo técnico (paper 2), de modo que el artefacto es reproducible y verificable. Está pensado para escenarios de despliegue con memoria muy restringida donde se acepta una pérdida modesta de calidad a cambio de reducir el peso en GPU de 29,54 GB (FP16) a 5,04 GB.

La relevancia actual reside en que demuestra que la cuantización a menos de 3 bits por parámetro con retículos de alta dimensionalidad puede mantener MMLU en 75,66 y GSM8K en 92,04, a solo 3,22 y 3,26 puntos del FP16 respectivamente, con velocidades de decodificación superiores a vLLM en FP16 sobre una NVIDIA L40S. Las limitaciones son igualmente concretas: solo hay un lector (el motor Rust), no se ha probado en GPUs de consumo, el rendimiento en A100 es inferior al FP16 y la evaluación se restringe a batch 1 y contexto corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B original), sin cambios arquitectónicos; los pesos se recodifican en el formato LLVQ Tetra |
| Parametros totales | 14.000 millones (heredados de Qwen3-14B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base Qwen3-14B soporta contextos largos, pero la ficha no lo confirma para esta cuantización) |
| Tipos de cuantizacion | 2,73 bits por parámetro de media: códigos Tetra sobre retículo de Leech Λ₂₄ (48 bits por bloque de 24 pesos, una escala por fila) en 181 de 280 proyecciones; int4 con grupos de 128 en `v_proj`/`o_proj` de todas las capas y `down_proj` de capas 10 a 28; int4 con grupos de 64 en embedding y cabeza de salida; f16 en normas |
| Idiomas soportados | Inglés (según la model card y los tags); no se documentan otros idiomas para esta cuantización |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3-14B, fichero LICENSE sin modificar) |
| Formato de pesos | Fichero único propietario `.bin` (`qwen3-14b-sealed.bin`) leído por el motor Rust de LLVQ; no compatible con safetensors, GGUF ni `transformers` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-14B, un transformer denso de 14.000 millones de parámetros. La cuantización no altera la arquitectura: sustituye los tensores de las 280 proyecciones lineales de los bloques del transformer por representaciones comprimidas y mantiene el resto de tensores (normas) en f16. La pieza central es Tetra, un esquema de cuantización vectorial que agrupa 24 pesos y los codifica como un punto del retículo de Leech Λ₂₄ usando 48 bits por bloque, con una escala por fila. El kernel CUDA fusionado decodifica el código y realiza la multiplicación matriz-vector en una sola pasada, evitando materializar los pesos en memoria.

El proceso de ajuste se realizó en dos etapas sobre 131.072 tokens de DCLM-Edu con correcciones de estilo GPTQ. Primero se ajustaron los códigos Tetra (MMLU 72,53), después se reentrenaron las escalas de fila con los códigos congelados (MMLU 74,20) y finalmente se aplicó int4 a `o_proj`, `down_proj` de las capas 10 a 28 y al embedding y la cabeza de salida (MMLU 75,66). Solo se entrenan las escalas de fila, nunca los códigos, y no hay cambios arquitectónicos. El autor advierte que la ventana int4 se fijó con una regla previa a la medición, pero esa regla derivó de decisiones tomadas sobre MMLU en el modelo de 4B, por lo que la puntuación MMLU arrastra un sesgo de selección no medido.

## Capacidades

- Generación de texto en inglés con calidad cercana al FP16: MMLU 5-shot de 75,66 frente a 78,88 del original.
- Razonamiento matemático: GSM8K zero-shot de 92,04 frente a 95,30 en FP16, ejecutado a través del kernel fusionado.
- Razonamiento de sentido común y conocimiento general evaluado con MMLU sobre 14.042 preguntas.
- Decodificación de tokens consistente con la reconstrucción densa hasta la posición 78 en una generación de 256 tokens; a partir de ahí los tokens greedy difieren por causas no medidas.
- Inferencia en un único fichero sin checkpoint externo ni acceso a red: el fichero incluye embedding, cabeza de salida, tokenizer y `config.json` copiados byte a byte del original.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni modo thinking para esta cuantización concreta; deben asumirse las del modelo base Qwen3-14B solo en la medida en que el motor LLVQ las implemente, extremo que la ficha no confirma.

## Casos de uso

- Despliegue en GPUs con memoria limitada: el fichero ocupa 5,04 GB en GPU frente a 29,54 GB en FP16, lo que permite servir un modelo de 14B en tarjetas donde el checkpoint original no cabe, a costa de 3,22 puntos de MMLU.
- Evaluación reproducible de cuantización: el SHA-256 publicado y los binarios `gsm8k` y `mmlu` del repositorio permiten reproducir las métricas del artículo en la misma configuración (`qwen3-14b-tetra-e4.json`).
- Investigación en cuantización vectorial: sirve como artefacto de referencia para estudiar el retículo de Leech aplicado a pesos de LLM y comparar con AWQ o GPTQ a bits por parámetro equivalentes.
- Generación de texto en inglés en entornos aislados: al abrirse sin checkpoint ni red, encaja en despliegues air-gapped donde no se pueden descargar pesos adicionales.
- Prototipado de motores de inferencia: el formato y el kernel fusionado permiten medir el coste de decodificar códigos de retículo en tiempo real sobre hardware NVIDIA (57,2 tok/s en L40S, batch 1).
- Benchmarking de matemáticas a bajo coste de memoria: el binario `gsm8k` ejecuta las 1.319 preguntas con el kernel fusionado, útil para validar pipelines de evaluación con presupuesto de VRAM reducido.
- Comparación de compromisos calidad/memoria: con MMLU 75,66 y WikiText-2 perplexity 8,44, permite decidir si la pérdida frente a FP16 (78,88 y 7,98) es aceptable para una tarea concreta antes de invertir en el original.

## Benchmarks y rendimiento

| Metrica | Este fichero (2,73 bits) | FP16 | AWQ w4g128 |
|---|---|---|---|
| Bits por parámetro, modelo completo | 2,73 | 16,00 | 5,40 |
| Bytes de pesos en GPU | 5,04 GB | 29,54 GB | 9,98 GB |
| Decodificación, batch 1, NVIDIA L40S | 57,2 tok/s (motor LLVQ) | 25,8 tok/s (vLLM) | 77,8 tok/s (vLLM) |
| MMLU, 5-shot, 14.042 preguntas | 75,66 | 78,88 | 78,12 |
| GSM8K, zero-shot, 1.319 problemas | 92,04 | 95,30 | 95,38 |
| Perplexity WikiText-2 | 8,44 | 7,98 | 8,29 |

Intervalos al 95 % publicados por el autor: 3,22 puntos MMLU [2,69; 3,75] y 3,26 puntos GSM8K [1,93; 4,59] por debajo de FP16; 2,46 [1,92; 3,00] y 3,34 [2,12; 4,55] por debajo de AWQ. Cada formato se ejecuta en su propio motor, por lo que las velocidades no son directamente comparables entre sí. En una NVIDIA A100 el fichero decodifica a 39,0 tok/s, por debajo de los 52,7 tok/s de FP16 en vLLM.

## Requisitos de hardware

- VRAM estimada: 5,04 GB de pesos en GPU según el autor; el fichero completo en disco es de 5,1 GB. No se documenta el overhead adicional del motor (activaciones, KV cache).
- GPU validadas: NVIDIA L40S (57,2 tok/s, batch 1) y NVIDIA A100 (39,0 tok/s). El autor indica que en A100 el modelo es más lento que el FP16 en vLLM y que, con el embedding en f16, es más lento que su propia ruta densa f16.
- GPU de consumo: no se probó ninguna. El autor lo declara explícitamente como limitación; no hay datos de RTX 4090 ni similares.
- Apple Silicon: solo funciona la reconstrucción densa; la ruta fusionada de Metal se detiene a un ancho de entrada de 8.192 y `down_proj` tiene 17.408 columnas.
- Opciones de despliegue: exclusivamente el motor Rust de LLVQ con la feature `cuda` (`cargo run --release -p llvq-llm --features cuda --bin chat`). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 57,2 tok/s en L40S y 39,0 tok/s en A100, ambos en batch 1 y contexto corto; no se midieron peticiones concurrentes ni prompts largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Bits/parámetro | Peso en GPU | MMLU | GSM8K | Licencia | Motor |
|---|---|---|---|---|---|---|---|
| Qwen3-14B-LLVQ-Tetra-sealed | 14B | 2,73 | 5,04 GB | 75,66 | 92,04 | Apache 2.0 | LLVQ (Rust) |
| Qwen3-14B FP16 | 14B | 16,00 | 29,54 GB | 78,88 | 95,30 | Apache 2.0 | vLLM, transformers |
| Qwen3-14B AWQ w4g128 | 14B | 5,40 | 9,98 GB | 78,12 | 95,38 | Apache 2.0 | vLLM |
| Qwen3-4B-LLVQ-Tetra-sealed | 4B | No disponible | No disponible | No disponible | No disponible | Apache 2.0 | LLVQ (Rust) |
| Qwen3-8B-LLVQ-Tetra-sealed | 8B | No disponible | No disponible | No disponible | No disponible | Apache 2.0 | LLVQ (Rust) |

Los hermanos de 4B y 8B se citan en la model card como parte de la misma familia de publicaciones, pero no se aportan métricas de ellos en la información disponible. La comparación relevante es frente a FP16 y AWQ del mismo modelo base: Tetra gana en memoria (5,04 GB frente a 9,98 GB de AWQ) y pierde 2,46 puntos de MMLU y 3,34 de GSM8K frente a AWQ, con un throughput en L40S inferior al de AWQ en vLLM (57,2 frente a 77,8 tok/s).

## Limitaciones y advertencias

- Un solo lector: únicamente el código Rust del repositorio LLVQ lee y escribe el fichero; no hay integración con `transformers`, vLLM, llama.cpp ni Ollama.
- Rendimiento dependiente de GPU: en A100 decodifica a 39,0 tok/s, por debajo de FP16 en vLLM (52,7), y con embedding en f16 es más lento que la propia ruta densa f16 del autor. No hay datos de GPUs de consumo.
- Divergencia de tokens: en una generación de 256 tokens, el kernel fusionado y la reconstrucción densa eligen por primera vez un token distinto en la posición 78; la causa no se midió.
- Evaluación restringida: solo batch 1 y contexto corto; no se midieron peticiones concurrentes ni prompts largos.
- Una sola muestra de calibración: las puntuaciones varían con el texto de calibración y los intervalos publicados no cubren toda esa dispersión.
- Sesgo de selección en MMLU: la ventana int4 se fijó con una regla previa, pero esa regla derivó de decisiones tomadas sobre MMLU en el modelo de 4B; el sesgo no se cuantificó. GSM8K y perplexity no implicaron selección.
- Idioma: la model card declara solo inglés; no se documenta el comportamiento multilingüe de esta cuantización.
- Apple Silicon: la ruta fusionada de Metal no cubre `down_proj` (ancho 17.408), por lo que solo está disponible la reconstrucción densa.
- Licencia: Apache 2.0 permite uso comercial, pero se hereda de Qwen3-14B y el fichero LICENSE es el de Qwen sin modificar; conviene revisar las condiciones del modelo base.
- Riesgo de alucinación: no se documenta una evaluación específica de factualidad para esta cuantización; la pérdida de 3,22 puntos de MMLU frente a FP16 sugiere degradación en conocimiento factual que debe validarse en el dominio de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pier-Jean/Qwen3-14B-LLVQ-Tetra-sealed
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Repositorio del motor LLVQ: https://github.com/pjmalandrino/llvq
- Paper 2, "Tetra: Serving Leech-Lattice Quantized LLMs at 2.7 Bits per Parameter": https://huggingface.co/papers/2609.35465
- Paper 1 (layout anterior), DOI: https://doi.org/10.5281/zenodo.22133606
- Método de referencia, van der Ouderaa et al.: https://arxiv.org/abs/2603.11021
- Hermano Qwen3-4B-LLVQ-Tetra-sealed: https://huggingface.co/Pier-Jean/Qwen3-4B-LLVQ-Tetra-sealed
- Hermano Qwen3-8B-LLVQ-Tetra-sealed: https://huggingface.co/Pier-Jean/Qwen3-8B-LLVQ-Tetra-sealed
