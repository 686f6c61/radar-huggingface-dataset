# kapitsaprime/Nanbeige4.3-33B-MLX-4bit

## Resumen

Nanbeige4.3-33B-MLX-4bit es una cuantización de la comunidad del modelo Nanbeige4.3-33B, publicado por el usuario kapitsaprime en Hugging Face. Se trata de una conversión a formato MLX (el framework de Apple para silicon de la serie M) con cuantización AWQ de 4 bits, pensada para ejecutar el modelo de forma local en Macs con Apple Silicon. El modelo base, desarrollado por Nanbeige, es un transformer denso tipo Llama de 33,1 mil millones de parámetros con una ventana de contexto de 512K tokens, una de las más amplias disponibles en modelos abiertos de este tamaño.

La relevancia de esta ficha radica en que hace accesible un modelo grande con contexto extremo en hardware de consumidor: con 19,8 GB en disco y 4,79 bits por peso, cabe en un Mac de 32 GB para contextos cortos y en uno de 64 GB para contextos de 128K. El autor ha publicado además mediciones de calidad (divergencia KL frente al modelo bf16) y benchmarks de velocidad comparando varios motores MLX y llama.cpp, algo poco habitual en cuantizaciones de comunidad. El modelo soporta razonamiento con modo "thinking" y llamadas a herramientas, con soporte de inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 capas, 56 cabezas de query, 8 cabezas KV) |
| Parametros totales | 33.118.977.024 (33,1B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512K tokens (modelo base) |
| Tipos de cuantizacion | AWQ 4 bits (group size 64) en capas decoder; embedding y LM head a 8 bits; bf16 en escalas y biases |
| Idiomas soportados | ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (cuantizacion afín, group size 64) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only denso de arquitectura Llama con 52 capas, 56 cabezas de atencion para queries y 8 cabezas KV (agrupacion de KV heads, tipo GQA), y 33,1B de parametros. Soporta una ventana de contexto de 512K tokens. No se dispone de informacion sobre los datos de entrenamiento, numero de tokens ni procesos de alineamiento (RLHF/DPO) del modelo base en la informacion proporcionada.

En cuanto a la cuantizacion, este pack aplica AWQ (Activation-aware Weight Quantization) mediante `mlx_lm.awq` con 128 muestras de calibracion de 512 tokens, group size 64 y una rejilla de 20 escalas. Las capas decoder van a 4 bits, mientras que el embedding y el LM head se re-cuantizaron a 8 bits desde el checkpoint bf16, lo que reduce la divergencia respecto a la version de 4 bits plana. El resultado ocupa 19,8 GB en disco (4,79 bits por peso). Según las mediciones del autor, AWQ elimina un tercio de la divergencia KL de la cuantización 4-bit plana, y los 8 bits en embedding y LM head otro diez por ciento adicional.

## Capacidades

- Generacion de texto conversacional con plantilla de chat basada en `<|im_start|>` (estilo Qwen)
- Razonamiento con modo "thinking": el razonamiento se emite en etiquetas `<think>` y esta activado por defecto; se desactiva con `enable_thinking: false`
- Tool calling mediante llamadas XML en etiquetas `<tool_call>`
- Uso agéntico (Nanbeige recomienda temperature 1.0 y top-p 0.95 para agentes, frente a 0.6/0.95 para chat y razonamiento)
- Contexto extremadamente largo (hasta 512K tokens en el modelo base), adecuado para documentos extensos
- Soporte bilingüe: ingles y chino
- Ejecucion local optimizada en Apple Silicon mediante MLX

## Casos de uso

- Analisis de documentos y repositorios largos: con 512K tokens de contexto (probado hasta 128K en Apple Silicon), permite resumir o consultar bases de codigo y colecciones de documentos completas sin RAG.
- Chat local privado en Mac: cabe en un Mac de 32 GB con contextos cortos y sirve una API compatible con OpenAI via Kapitsa o mlx-lm, util para entornos donde los datos no pueden salir del equipo.
- Agentes con tool calling: el formato XML de `<tool_call>` y los parametros recomendados para uso agéntico lo hacen apto para pipelines de varios pasos con llamadas a funciones.
- Razonamiento paso a paso: el modo thinking por defecto genera cadenas de razonamiento explicitas antes de la respuesta, util en matematicas y planificacion.
- Asistentes bilingües ingles-chino: el entrenamiento del modelo base cubre ambos idiomas, util para equipos que operan en ambos mercados.
- Generacion de codigo: las mediciones de calidad del pack se hicieron sobre codigo Python, y el prompt de ejemplo del propio README genera funciones Python.
- Prototipado de aplicaciones LLM en Apple Silicon: los ~28 tok/s de decodificacion en un M5 Max permiten desarrollo interactivo sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni para el modelo base ni para esta cuantizacion en la informacion disponible. El autor si publica mediciones de fidelidad de la cuantizacion (KL frente al bf16, en nats por posicion, sobre 768 posiciones en 8 ventanas de codigo Python) y de velocidad en un MacBook Pro M5 Max (128 GB):

Fidelidad de la cuantizacion:

| Pack | Tamano | Bits/peso | KL media | KL mediana | KL p99 | Mismo top token |
|---|---:|---:|---:|---:|---:|---:|
| MLX 8-bit (mismo autor) | 35,2 GB | 8,50 | 0,0155 | 0,00003 | 0,18 | 98,6% |
| llama.cpp Q8_0 | 35,2 GB | 8,50 | 0,0059 | 0,00001 | 0,12 | 99,0% |
| llama.cpp Q4_K_M | 20,1 GB | 4,84 | 0,144 | 0,0010 | 2,65 | 93,5% |
| **Este pack: AWQ 4-bit, emb/head 8-bit** | **19,8 GB** | **4,79** | **0,163** | **0,0015** | **3,77** | **92,3%** |
| 4-bit plana (`mlx_lm.convert -q`) | 18,6 GB | 4,50 | 0,267 | 0,0030 | 5,27 | 90,5% |

Velocidad en M5 Max (prefill/decodificacion en tok/s, este pack con Kapitsa y mlx-lm; Q4_K_M con llama.cpp):

| Contexto | Prefill: Kapitsa / mlx-lm / llama.cpp | Decode: Kapitsa / mlx-lm / llama.cpp |
|---:|---|---|
| 1K | 730 / 823 / 665 | 28,2 / 28,1 / 26,7 |
| 4K | 678 / 773 / 555 | 27,0 / 27,2 / 25,0 |
| 16K | 511 / 501 / 345 | 23,3 / 21,8 / 17,9 |
| 32K | 387 / 455 / 295 | 20,0 / 18,6 / 16,2 |
| 64K | 324 / 410 / 233 | 16,0 / 15,4 / 12,6 |
| 128K | 242 / 277 / 140 | 11,3 / 11,0 / 8,2 |

En prompts de chat reales (5K y 20K tokens), Kapitsa alcanza 28,8 tok/s de decodificacion con 25,3 GB de memoria pico. Las mediciones pueden variar hasta un 20% por calentamiento del chip.

## Requisitos de hardware

- Memoria unificada estimada (segun el model card): Mac de 32 GB para contextos cortos; 48 GB para 64K tokens; 64 GB para 128K tokens. La cache KV ocupa 208 KB por token en fp16.
- En chat real con prompts de 5K-20K tokens, la memoria pico medida fue de 25,3 GB (Kapitsa) hasta 40,6 GB (mlx-lm server).
- Hardware objetivo: exclusivamente Apple Silicon (serie M) con Metal; no es un pack para GPU NVIDIA. Un M5 Max de 128 GB ejecuta el modelo con holgura hasta 128K de contexto.
- No cabe en GPUs de consumidor NVIDIA convencionales con este formato; para esas plataformas habria que usar los GGUF del mismo checkpoint (Q4_K_M ocupa 20,1 GB, viable en una RTX 4090 de 24 GB con contexto limitado).
- Despliegue: Kapitsa (`kapitsa serve --model nanbeige`, API compatible con OpenAI), mlx-lm (`mlx_lm.generate` y `mlx_lm.server`), oMLX, mlx-vlm server y Ollama (via GGUF). No es compatible con vLLM ni TGI al ser formato MLX.
- Rendimiento esperado en M5 Max: ~28 tok/s de decodificacion con contexto corto, bajando a ~11 tok/s a 128K de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-4bit (este) | 33,1B | 512K | MLX 4-bit AWQ (19,8 GB) | Apache 2.0 | Solo Apple Silicon; thinking y tool calling |
| Qwen3-32B (referencia de categoria) | 32,8B | no disponible en la informacion proporcionada | GGUF/MLX/safetensors | Apache 2.0 | Misma clase de tamano, plantilla de chat similar |
| Nanbeige4.3-33B (bf16) | 33,1B | 512K | safetensors bf16 (66,3 GB) | Apache 2.0 | Modelo base sin cuantizar; referencia de calidad maxima |
| Nanbeige4.3-33B-MLX-8bit | 33,1B | 512K | MLX 8-bit (35,2 GB) | Apache 2.0 | Misma familia; KL media 10 veces menor, requiere mas memoria |

## Limitaciones y advertencias

- La cuantizacion a 4 bits introduce divergencia medible frente al bf16: KL media de 0,163 nats/posicion y coincidencia de top token del 92,3%; en las posiciones mas dificiles (p99) la divergencia sube a 3,77, lo que puede alterar respuestas sensibles a muestreo fino.
- En la bateria del autor, el Q4_K_M de llama.cpp obtiene mejor fidelidad (KL media 0,144) a tamano similar; si se prioriza calidad en 4 bits, puede preferirse la ruta GGUF.
- No hay benchmarks estandar publicados del modelo base, por lo que su calidad en razonamiento, codigo o matematicas no puede verificarse con datos publicos en la informacion disponible.
- Soporte de idiomas limitado a ingles y chino; otros idiomas no estan garantizados.
- El modo thinking esta activado por defecto y genera etiquetas `<think>`; las aplicaciones que no lo gestionen mostraran el razonamiento al usuario si no se filtra la salida.
- Las mediciones de velocidad varian hasta un 20% con la temperatura del chip; los datos de rendimiento corresponden a un M5 Max y no son extrapolables directamente a otros chips Apple Silicon.
- El pack solo funciona en Apple Silicon con MLX; no es utilizable en servidores con GPU NVIDIA en este formato.
- La licencia Apache 2.0 no impone restricciones al uso comercial.
- Como todo LLM, puede alucinar; no hay evaluaciones de sesgo publicadas en la informacion disponible.

## Enlaces

- Pack cuantizado (esta ficha): https://huggingface.co/kapitsaprime/Nanbeige4.3-33B-MLX-4bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Pack 8-bit del mismo autor: https://huggingface.co/kapitsaprime/Nanbeige4.3-33B-MLX-8bit
- mlx-lm (ejecucion): https://github.com/ml-explore/mlx-lm
- Kapitsa (motor y benchmarks): https://github.com/nace-ai/kapitsa
- Resultados y scripts de los benchmarks: https://github.com/nace-ai/kapitsa/tree/main/bench/results/2026-10-25-m5-max-nanbeige
- Organizacion de Nanbeige: https://huggingface.co/Nanbeige
