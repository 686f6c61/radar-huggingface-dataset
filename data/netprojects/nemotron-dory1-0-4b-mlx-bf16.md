# netprojects/nemotron-dory1.0-4b-mlx-bf16

## Resumen

Nemotron-Labs Dory 1.0 4B es un modelo de razonamiento de NVIDIA publicado el 16 de octubre de 2026, con 3.974.103.040 parámetros y una arquitectura poco habitual: un *looped language model* en el que un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto). Ese bucle actúa como un dial entre velocidad y precisión usando un único conjunto de pesos, lo que permite ajustar el coste computacional en tiempo de inferencia sin cambiar de modelo.

La ficha que nos ocupa no es el checkpoint original, sino la conversión a formato MLX en bf16 (sin cuantización) realizada por NetProjects para Apple Silicon. El repo ocupa 8,0 GB y se ejecuta mediante el paquete `dory-mlx`, que añade la arquitectura `dory` a MLX. Está pensado para desarrolladores que quieran ejecutar el modelo en Macs con chip M-series, con cifras de rendimiento medidas y verificadas por el autor de la conversión.

El modelo genera una cadena de razonamiento dentro de etiquetas `<think>...</think>` antes de dar la respuesta final, por lo que es adecuado para tareas que requieren razonamiento multi-paso. Solo soporta inglés, tanto de entrada como de salida, y se distribuye bajo licencia OpenMDW-1.1, la misma que el modelo original de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido y bucle (looped language model); implementación MLX |
| Parametros totales | 3.974.103.040 (~4B) |
| Parametros activos | No aplica (no es MoE); el bucle reutiliza el mismo bloque de capas 1-4 veces |
| Longitud de contexto | No disponible en la información proporcionada (verificado con prompts de hasta 24K tokens; benchmarks con prompts de 32K) |
| Tipos de cuantizacion | Este repo es bf16 sin cuantizar; existe build de 8 bits del mismo autor y build NVFP4 (`netprojects/nemotron-dory1.0-4b-mlx-nvfp4`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | OpenMDW-1.1 (misma que el modelo original de NVIDIA) |
| Formato de pesos | safetensors con layout fusionado (query/key/value/gate en una matriz; gate/up del MLP en una matriz), librería MLX |

## Arquitectura y entrenamiento

Dory 1.0 4B es un *looped language model*: un bloque compartido de capas se ejecuta repetidamente (de 1 a 4 veces, 2 por defecto) en lugar de apilar capas independientes. Esto significa que un único conjunto de pesos ofrece un dial explícito entre velocidad y calidad: con 1 bucle el modelo es más rápido y con 4 bucles produce perplejidad menor. La conversión de NetProjects mantiene el layout fusionado de pesos del checkpoint original (QKV+gate en una matriz, gate/up del MLP en otra) para acelerar la decodificación, y reconstruye los pesos desde el original de NVIDIA mediante `scripts/convert.py` de `dory-mlx`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en la información proporcionada. La model card de la conversión remite a la model card original de NVIDIA para los resultados de precisión y los detalles de entrenamiento. La verificación técnica realizada por el autor de la conversión incluye comparación de logits contra una implementación independiente en fp32 PyTorch (acuerdo top-1 del 100 %, deriva KL de 0,001 a 0,003 con pesos reales, 2 bucles, 55 tokens) y validación de las cachés de ventana deslizante (acuerdo top-1 de al menos 98,7 %, KL máximo de 0,0006).

## Capacidades

- Generación de texto en inglés con cadena de razonamiento explícita dentro de `<think>...</think>` antes de la respuesta final.
- Razonamiento multi-paso: el modo de razonamiento es el comportamiento por defecto, con temperatura 1.0 y top_p 0.95 recomendados por NVIDIA.
- Aritmética y problemas matemáticos (la model card usa como ejemplo "What is 17 * 23?").
- Ajuste de esfuerzo computacional mediante el parámetro `loops` (1-4) en tiempo de inferencia.
- Generación por lotes mediante MLX-LM (con la propuesta de soporte Dory en MLX-LM, PR 1988).
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Razonamiento matemático interactivo en local: el modelo resuelve operaciones y problemas paso a paso mostrando la cadena de razonamiento, adecuado para un asistente de escritorio en un Mac con Apple Silicon sin depender de la nube.
- Prototipado de aplicaciones de razonamiento en Apple Silicon: con `dory-mlx` y el dial de bucles, un desarrollador puede probar el mismo modelo con 1 bucle (58 tokens/s) para iterar rápido y con 4 bucles (23 tokens/s) para la versión final, sin cambiar de checkpoint.
- Procesamiento de documentos largos en local: con prompts de 32K tokens leídos a 2.180 tokens/s (2 bucles) y 12,6 GB de memoria pico, es viable resumir o analizar documentos extensos en un portátil de gama alta.
- Servicio de generación por lotes en un Mac: mediante MLX-LM con la propuesta de soporte Dory se alcanzan unos 200 tokens/s agregados con 4 peticiones simultáneas y 450 tokens/s con 16 (8 bits, 2 bucles), suficiente para un backend interno de baja concurrencia.
- Evaluación e investigación de arquitecturas looped: el modelo permite estudiar empíricamente el compromiso entre número de bucles y perplejidad (12,17 / 11,76 / 11,69 en WikiText-2 para 1/2/4 bucles en bf16).
- Base para experimentos de cuantización: el mismo autor publica builds de 8 bits y NVFP4 (2,6 GB, ~1,4x más rápido que 8 bits con la misma perplejidad que bf16), útiles para comparar fidelidad y rendimiento en hardware Apple.
- Asistente conversacional de un solo idioma: al ser un modelo de chat con plantilla conversacional, puede integrarse en interfaces de chat locales para usuarios angloparlantes que prioricen privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card de la conversión remite a la model card original de NVIDIA para los resultados de precisión. Los datos verificados por el autor de la conversión son los siguientes:

| Prueba | Resultado |
|---|---|
| Logits vs implementación fp32 PyTorch (2 bucles, 55 tokens) | Acuerdo top-1 100 %, KL 0,001-0,003 |
| Build 8 bits vs bf16 (5 textos cortos, 2 bucles) | Acuerdo top-1 98 %, KL 0,003 |
| Perplejidad WikiText-2 (primeros 64K tokens, ventanas de 1.024), bucles 1/2/4 | 12,17 / 11,76 / 11,69 (8 bits: 12,18 / 11,77 / 11,70) |
| Cachés de ventana deslizante (ventana 64) | Acuerdo top-1 ≥ 98,7 %, KL ≤ 0,0006 |

Rendimiento medido en MacBook Pro M5 Max (128 GB), 20 de octubre de 2026:

| Bucles | Generación, prompt corto | Generación tras prompt de 32K | Lectura de prompt de 32K | Memoria pico, prompt de 32K |
|---|---|---|---|---|
| 1 | 58 tokens/s | 55 tokens/s | 3.270 tokens/s (10 s) | 11,3 GB |
| 2 | 39 tokens/s | 36 tokens/s | 2.180 tokens/s (15 s) | 12,6 GB |
| 4 | 23 tokens/s | 22 tokens/s | 1.270 tokens/s (26 s) | 15,1 GB |

Con MLX-LM directamente (bf16, 2 bucles, decodificación greedy, mediana de 3 ejecuciones, límite de caché MLX de 1 GiB):

| Prompt → respuesta | Lectura del prompt | Generación | Memoria pico |
|---|---|---|---|
| 25 → 512 tokens | 308 tokens/s | 39,0 tokens/s | 8,2 GB |
| 4.096 → 192 tokens | 3.063 tokens/s | 39,0 tokens/s | 12,6 GB |
| 16.384 → 192 tokens | 2.550 tokens/s | 37,8 tokens/s | 12,6 GB |
| 32.768 → 192 tokens | 2.161 tokens/s | 36,0 tokens/s | 12,6 GB |

## Requisitos de hardware

- VRAM/memoria unificada estimada: 8,2 GB con prompts cortos y 12,6 GB con prompts de 32K en bf16 a 2 bucles; 11,3 GB (1 bucle) y 15,1 GB (4 bucles) con prompts de 32K.
- Hardware de referencia: Apple M5 Max con 128 GB de memoria unificada; el repo está pensado exclusivamente para Apple Silicon (librería MLX).
- No cabe en GPUs consumer NVIDIA con este formato: la conversión es MLX y no se distribuye en GGUF ni safetensors estándar para CUDA.
- Despliegue: paquete `dory-mlx` (pip desde GitHub) o MLX-LM con la propuesta de soporte Dory (PR 1988). No se documentan opciones vLLM, TGI, llama.cpp u Ollama para esta conversión concreta.
- Throughput: 58/39/23 tokens/s en generación con 1/2/4 bucles; con MLX-LM por lotes, ~200 tokens/s agregados con 4 peticiones y ~450 tokens/s con 16 (8 bits, 2 bucles).
- Alternativa de menor huella: build NVFP4 de 2,6 GB, aproximadamente 1,4x más rápido que el de 8 bits.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato/hardware | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/nemotron-dory1.0-4b-mlx-bf16 | 3,97B | No disponible | MLX bf16, Apple Silicon | OpenMDW-1.1 | Conversión de referencia, 8,0 GB |
| netprojects/nemotron-dory1.0-4b-mlx-nvfp4 | 3,97B | No disponible | MLX NVFP4, Apple Silicon | OpenMDW-1.1 | 2,6 GB, ~1,4x más rápido que 8 bits, misma perplejidad que bf16 |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | 3,97B | No disponible | Safetensors bf16 (original) | OpenMDW-1.1 | Checkpoint original de NVIDIA; referencia de precisión |
| netprojects/h2o-lightning-4b-mlx-q8 | No disponible | No disponible | MLX 8 bits, Apple Silicon | No disponible | Otro build MLX del mismo autor, citado en la model card |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas, incluido el castellano.
- Las respuestas incluyen la cadena de razonamiento completa, por lo que son más largas que las de un modelo de chat convencional y consumen más tokens de salida.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan evaluaciones de sesgo ni de robustez en la información disponible.
- La longitud máxima de contexto no se especifica en la información proporcionada; las verificaciones se hicieron con prompts de hasta 24K tokens y los benchmarks con 32K.
- La licencia OpenMDW-1.1 debe revisarse en el archivo `LICENSE` del repo antes de un uso comercial; no se detallan aquí sus restricciones concretas.
- Esta conversión está limitada a Apple Silicon vía MLX; no es portable a CUDA sin reconvertir desde el checkpoint original.
- El autor de la conversión no está afiliado a NVIDIA; la precisión de referencia debe contrastarse con la model card original.
- El soporte en MLX-LM depende de una propuesta (PR 1988) no necesariamente fusionada; el uso estable requiere el paquete `dory-mlx`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-bf16
- Modelo base original: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build NVFP4: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-nvfp4
- Repositorio dory-mlx: https://github.com/internet-projects/dory-mlx
- MLX: https://github.com/ml-explore/mlx
- Propuesta de soporte Dory en MLX-LM: https://github.com/ml-explore/mlx-lm/pull/1988
- Organización NetProjects en Hugging Face: https://huggingface.co/netprojects
- Colección de builds MLX de NetProjects: https://huggingface.co/collections/netprojects/netprojects-mlx-builds-6ae3b2683a59a1b4fc4c0c3a
- H2O-Lightning-4B en MLX: https://huggingface.co/netprojects/h2o-lightning-4b-mlx-q8
- Artículo sobre H2O-Lightning-4B en Apple Silicon: https://netprojects.com/insights/h2o-lightning-4b-on-apple-silicon-mlx
- NetProjects: https://netprojects.com
- Estándares de IA de NetProjects: https://netprojects.com/standards/ai
