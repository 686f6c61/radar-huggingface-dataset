# kapitsaprime/Nanbeige4.3-33B-MLX-8bit

## Resumen

Nanbeige4.3-33B-MLX-8bit es una cuantización en 8 bits para Apple silicon del modelo Nanbeige4.3-33B, publicado por el usuario kapitsaprime y medido por Nace AI con su herramienta Kapitsa. El modelo base, desarrollado por Nanbeige, es un transformer denso de tipo Llama con 33,1 mil millones de parámetros y una longitud de contexto de 512K tokens, orientado a generación de texto conversacional en inglés y chino.

Esta versión empaqueta el modelo en formato MLX safetensors con cuantización afín de 8 bits (grupo 64) para todas las capas lineales, el embedding y el LM head, ocupando 35,2 GB en disco (8,50 bits por peso). Según las mediciones del autor, reproduce el 98,6% de los próximos tokens idénticos al modelo bf16, con una KL media de 0,0155 nats por posición, lo que lo sitúa muy cerca del modelo original en calidad. Es relevante para quienes necesitan ejecutar un modelo denso de 33B con contexto muy largo en Macs con Apple silicon, sin depender de GPUs de datacenter.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 capas, 56 cabezas de consulta, 8 cabezas KV) |
| Parámetros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no disponible (modelo denso: todos los parámetros activos) |
| Longitud de contexto | 512K tokens (modelo base) |
| Tipos de cuantización | MLX afín 8 bits, tamaño de grupo 64, escalas y biases en bf16 (8,50 bits por peso); existen también variantes 4-bit AWQ y bf16 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder denso de estilo Llama con 52 capas, 56 cabezas de atención para consultas y 8 para clave-valor (agrupación GQA 7:1, que reduce el tamaño de la caché KV). El contexto del modelo base alcanza los 512K tokens. La caché KV ocupa 208 KB por token en fp16, lo que explica los requisitos de memoria a contextos largos.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) no se han publicado detalles en la información disponible. Sí se documenta la plantilla de chat: el razonamiento se emite en etiquetas `<think>` y está activado por defecto (desactivable con `enable_thinking: false`), y las llamadas a herramientas usan XML dentro de `<tool_call>`, lo que indica un post-entrenamiento orientado a razonamiento y uso de agentes. La cuantización se realizó con `mlx_lm.convert` (mlx-lm 0.32.2, mlx 0.32.4) usando cuantización afín de 8 bits con grupos de 64 pesos y escala y bias en bf16.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo "thinking": emite el razonamiento en `<think>`, activado por defecto y desactivable por plantilla.
- Tool calling mediante XML en `<tool_call>`, con recomendación de temperature 1,0 y top-p 0,95 para uso agéntico.
- Contexto extremadamente largo (512K) útil para documentos extensos y repositorios de código.
- Generación de código (las mediciones de calidad se realizaron sobre código Python).
- Compatibilidad con servidores con API compatible con OpenAI (Kapitsa, mlx-lm server).

## Casos de uso

- Asistentes conversacionales locales en Mac: el modelo cabe en un Mac de 48 GB con contexto corto y sirve vía API compatible con OpenAI mediante Kapitsa o mlx-lm, ideal para despliegues on-device sin nube.
- Análisis de documentos muy largos: con 512K de contexto puede procesar contratos, informes o libros completos; para 64K tokens se recomienda un Mac de 64 GB y para 128K uno de 96 GB.
- Razonamiento paso a paso (chain-of-thought): el modo `<think>` activado por defecto lo hace adecuado para tareas de matemáticas, planificación y resolución de problemas donde se quiera inspeccionar el razonamiento.
- Agentes con llamadas a herramientas: soporta tool calling en XML y parámetros recomendados para uso agéntico, útil para orquestación local de funciones y flujos multi-paso.
- Generación y comprensión de código en inglés y chino: las mediciones de fidelidad se hicieron sobre código Python, y el contexto largo permite trabajar con bases de código amplias.
- Procesamiento bilingüe chino-inglés: útil para equipos que trabajan con documentación y comunicación en ambos idiomas sin cambiar de modelo.
- Comparación de métodos de cuantización: el repositorio incluye mediciones KL y de coincidencia de top token frente a bf16 y GGUF, útil como referencia para elegir cuantización en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni para el modelo base ni para esta cuantización.

Sí se han publicado mediciones de fidelidad de la cuantización frente al modelo bf16 (768 posiciones de próximo token en 8 ventanas de código Python, KL en nats por posición, calculadas con Kapitsa en un M5 Max):

| Pack | Tamaño | Bits/peso | KL media | KL mediana | KL p99 | Mismo top token |
|---|---:|---:|---:|---:|---:|---:|
| MLX 8-bit (este pack) | 35,2 GB | 8,50 | 0,0155 | 0,00003 | 0,18 | 98,6% |
| llama.cpp Q8_0 | 35,2 GB | 8,50 | 0,0059 | 0,00001 | 0,12 | 99,0% |
| MLX 4-bit AWQ | 19,8 GB | 4,79 | 0,163 | 0,0015 | 3,77 | 92,3% |
| llama.cpp Q4_K_M | 20,1 GB | 4,84 | 0,144 | 0,0010 | 2,65 | 93,5% |

Velocidad medida en MacBook Pro M5 Max (128 GB), en tokens/s (las cifras pueden variar hasta un 20% por temperatura del chip):

| Contexto | Prefill: Kapitsa / mlx-lm / llama.cpp | Decode: Kapitsa / mlx-lm / llama.cpp |
|---:|---|---|
| 1K | 665 / 725 / 708 | 15,6 / 15,8 / 16,3 |
| 4K | 652 / 699 / 575 | 15,1 / 15,3 / 15,8 |
| 16K | 510 / 461 / 360 | 13,9 / 13,7 / 12,8 |
| 32K | 397 / 433 / 311 | 12,8 / 12,7 / 12,4 |

## Requisitos de hardware

- Memoria unificada estimada: 48 GB mínimo con contexto corto; 64 GB para contextos de 64K tokens; 96 GB para 128K tokens (la caché KV es de 208 KB por token en fp16).
- Solo compatible con Apple silicon (formato MLX); no funciona en GPUs NVIDIA con este pack.
- Macs recomendados: MacBook Pro o Mac Studio con M3/M4/M5 Max o Ultra con 48–128 GB de memoria unificada. No cabe en GPUs de consumo tipo RTX 4090 (24 GB) en este formato.
- Despliegue: Kapitsa 0.2.18 o superior (`kapitsa serve --model nanbeige:8bit`, API compatible con OpenAI) o mlx-lm (`mlx_lm.generate` / `mlx_lm.server`).
- Rendimiento esperado: decode de unos 15-16 tokens/s a contexto corto y 12-13 tokens/s a 32K en un M5 Max; prefill de 400-700 tokens/s según longitud.
- Alternativas más ligeras: la variante 4-bit AWQ del mismo autor ocupa 19,8 GB y puede funcionar en Macs de 24-32 GB con pérdida de calidad mayor (92,3% de coincidencia con bf16).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Tamaño | Licencia |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-8bit (este) | 33,1B | 512K | MLX 8-bit | 35,2 GB | Apache 2.0 |
| Nanbeige4.3-33B-MLX-4bit (mismo autor) | 33,1B | 512K | MLX 4-bit AWQ | 19,8 GB | Apache 2.0 |
| Nanbeige4.3-33B (bf16, oficial) | 33,1B | 512K | Safetensors bf16 | 66,3 GB | Apache 2.0 |
| GGUF Q8_0 del mismo checkpoint | 33,1B | 512K | GGUF (llama.cpp) | 35,2 GB | Apache 2.0 |

En calidad, el Q8_0 de llama.cpp se sitúa ligeramente más cerca del bf16 (KL media 0,0059 frente a 0,0155), atribuido a que los bloques de 32 pesos de Q8_0 comparten una única escala fp16 mientras que los grupos de 64 de MLX almacenan escala y bias en bf16. En velocidad sobre Apple silicon, Kapitsa y mlx-lm superan a llama.cpp a contextos de 16K y 32K tanto en prefill como en decode.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, hereda sus sesgos, no publicados.
- Riesgo de alucinación: no cuantificado con benchmarks estándar; el modo thinking activado por defecto puede aumentar la latencia y el consumo de tokens en respuestas simples si no se desactiva.
- Idioma: soporte centrado en inglés y chino; el rendimiento en castellano u otros idiomas no está documentado.
- Memoria: el contexto de 512K teórico exige memoria unificada muy elevada por la caché KV (208 KB/token en fp16); a 128K tokens se necesita un Mac de 96 GB.
- Plataforma: el formato MLX solo funciona en Apple silicon; para NVIDIA u otras plataformas hay que recurrir al modelo base o a conversiones GGUF.
- Velocidad de decode moderada (12-16 tokens/s en M5 Max), insuficiente para aplicaciones de alto throughput; las mediciones pueden variar un 20% por térmica.
- Licencia Apache 2.0: sin restricciones para uso comercial.
- Este pack es una cuantización de terceros (kapitsaprime / Nace AI), no oficial de Nanbeige; las descargas son escasas (242) y el soporte comunitario es limitado.

## Enlaces

- Modelo cuantizado (este pack): https://huggingface.co/kapitsaprime/Nanbeige4.3-33B-MLX-8bit
- Modelo base oficial: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante 4-bit AWQ: https://huggingface.co/kapitsaprime/Nanbeige4.3-33B-MLX-4bit
- mlx-lm (repositorio): https://github.com/ml-explore/mlx-lm
- Kapitsa (repositorio): https://github.com/nace-ai/kapitsa
- Resultados y scripts de las mediciones: https://github.com/nace-ai/kapitsa/tree/main/bench/results/2026-10-25-m5-max-nanbeige
- Página de Nanbeige en Hugging Face: https://huggingface.co/Nanbeige
