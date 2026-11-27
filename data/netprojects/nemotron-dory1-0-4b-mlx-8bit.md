# netprojects/nemotron-dory1.0-4b-mlx-8bit

## Resumen

Dory 1.0 4B es un modelo de razonamiento de NVIDIA construido sobre una arquitectura de tipo *looped language model*: un bloque compartido de capas se ejecuta entre 1 y 4 veces (2 por defecto), de modo que un unico conjunto de pesos ofrece un dial ajustable entre velocidad y precision. El modelo original se publico en BF16 el 16 de octubre de 2026 bajo el identificador `nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16`.

La ficha que nos ocupa, `netprojects/nemotron-dory1.0-4b-mlx-8bit`, es una conversion a 8 bits (cuantizacion afina, tamano de grupo 64) realizada por NetProjects (Internet Projects Ltd) para Apple Silicon mediante MLX. No esta afiliada a NVIDIA. El repositorio ocupa 4,2 GB y contiene 3.975.229.440 parametros. Se distribuye con la libreria `mlx` y anade el soporte de la arquitectura `dory` a traves del paquete `dory-mlx`.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de razonamiento de 4B en Macs de 8 GB de memoria unificada; por otro, el mecanismo de bucles repetidos permite al usuario elegir en tiempo de inferencia entre 1 bucle (mayor velocidad) y 4 bucles (menor perplejidad) sin cambiar de pesos. El modelo esta orientado exclusivamente a texto en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bloque de capas compartido y bucle configurable (*looped language model*), implementado en MLX |
| Parametros totales | 3.975.229.440 (aproximadamente 4B) |
| Parametros activos | no disponible (no es MoE; el bucle reutiliza el mismo bloque de pesos) |
| Longitud de contexto | no disponible de forma explicita; verificado con prompts de hasta 24K tokens y con cache de ventana deslizante |
| Tipos de cuantizacion | 8 bits afina con tamano de grupo 64 (esta build); existen builds bf16 y NVFP4 4-bit del mismo autor |
| Idiomas soportados | Ingles (`en`) |
| Licencia | OpenMDW 1.1 (`openmdw-1.1`, etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (layout fusionado: query/key/value/gate en una matriz y gate/up del MLP en otra) |

## Arquitectura y entrenamiento

La innovacion central es el bucle de capas: en lugar de apilar decenas de capas distintas, Dory comparte un bloque y lo recorre de 1 a 4 veces. Esto reduce el numero de parametros necesarios para una profundidad efectiva dada y convierte el numero de bucles en un hiperparametro de inferencia. Los pesos de esta conversion usan un layout fusionado para acelerar la decodificacion y se reconstruyen desde el checkpoint original de NVIDIA con `scripts/convert.py` del repositorio `dory-mlx`.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de tokens, la composicion de la mezcla ni las fases de RLHF o DPO en la informacion proporcionada. El modelo produce cadenas de razonamiento dentro de etiquetas `` antes de la respuesta final, lo que sugiere un entrenamiento orientado a razonamiento explicito. La conversion a 8 bits ha sido validada por el autor: frente a una implementacion independiente en fp32 con PyTorch, la coincidencia top-1 es del 100 % con una divergencia KL de 0,001 a 0,003; frente a la build bf16 en MLX, la coincidencia top-1 es del 98 % con KL de 0,003.

## Capacidades

- Generacion de texto conversacional en ingles con cadena de razonamiento explicita en ``.
- Razonamiento multi-paso: el modo de bucles multiples (2 o 4) mejora la perplejidad y, segun NVIDIA, la precision.
- Aritmetica y problemas de matematicas simples y de varios pasos (el ejemplo de la model card es `17 * 23`).
- Ajuste de esfuerzo computacional en tiempo de inferencia mediante el parametro `loops` (1 a 4).
- Generacion por streaming token a token a traves de `dory_mlx.chat`.
- Cache de ventana deslizante con prefill troceado y decodificacion token a token, validada con coincidencia top-1 de al menos el 98,7 % y KL maxima de 0,0006.
- Servicio por lotes mediante MLX-LM (PR 1988): aproximadamente 200 tokens/s agregados con 4 peticiones y 450 tokens/s con 16.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es solo texto.
- Capacidades multilingues: limitadas al ingles.

## Casos de uso

- Razonamiento local en Macs de 8 GB: con 4,2 GB de pesos y un pico de 7,7 GB con prompts de 32K tokens y 1 bucle, el modelo cabe en equipos con memoria unificada ajustada, algo impensable para modelos de razonamiento de mayor tamano.
- Asistente de programacion en el portatil: el modelo puede razonar sobre fragmentos de codigo y explicar errores; la ventana verificada de 24K tokens permite pegar varios ficheros, aunque el soporte de tool calling no esta documentado.
- Tutoria y explicaciones paso a paso: la salida incluye la cadena de razonamiento, util para entornos educativos donde interesa ver el proceso y no solo la respuesta.
- Procesamiento por lotes de documentos largos en Apple Silicon: con 2 bucles y MLX-LM se leen prompts de 32K tokens a 1.874 tokens/s (17,5 s) y se generan 53 tokens/s, adecuado para resumir o clasificar lotes de informes en local.
- Prototipado de agentes de razonamiento sin GPU dedicada: el dial de bucles permite experimentar con el equilibrio coste/precision (1 bucle a 101 tokens/s frente a 4 bucles a 39 tokens/s en prompt corto) antes de escalar a hardware mayor.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir builds bf16, 8-bit y NVFP4 4-bit del mismo modelo, sirve como banco de pruebas para medir el impacto de la cuantizacion en tareas de razonamiento (perplejidad WikiText-2 de 11,77 en 8-bit frente a 11,76 en bf16 con 2 bucles).
- Inferencia por lotes en servidor Mac: con la integracion propuesta en MLX-LM se pueden atender 16 peticiones concurrentes a unos 450 tokens/s agregados, suficiente para un equipo pequeno o un entorno de desarrollo interno.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en esta model card; remite a la model card original de NVIDIA para las cifras de precision. Los datos disponibles son de calidad de cuantizacion y de rendimiento en hardware concreto.

| Metrica | Resultado |
|---|---|
| Perplejidad WikiText-2 (64K tokens, ventanas de 1.024), 1 / 2 / 4 bucles | 12,18 / 11,77 / 11,70 (bf16: 12,17 / 11,76 / 11,69) |
| Coincidencia top-1 frente a fp32 PyTorch (2 bucles, 55 tokens) | 100 %; KL 0,001 a 0,003 |
| Coincidencia top-1 frente a bf16 MLX (5 textos, 2 bucles) | 98 %; KL 0,003; perdida 1,278 frente a 1,271 |
| Coincidencia top-1 con cache de ventana deslizante (ventana 64) | al menos 98,7 %; KL maxima 0,0006 |

Rendimiento en MacBook Pro M5 Max (128 GB), 8 bits, medianas de ejecuciones repetidas:

| Bucles | Generacion, prompt corto | Generacion tras prompt de 32K | Lectura de prompt de 32K | Memoria pico con 32K |
|---|---|---|---|---|
| 1 | 101 tokens/s | 82 tokens/s | 3.200 tokens/s (10 s) | 7,7 GB |
| 2 | 69 tokens/s | 54 tokens/s | 1.980 tokens/s (17 s) | 9,0 GB |
| 4 | 39 tokens/s | 31 tokens/s | 1.070 tokens/s (31 s) | 11,5 GB |

Con MLX-LM (PR 1988, 8 bits, 2 bucles, decodificacion codiciosa): 68,0 tokens/s con prompt de 25 tokens y 4,39 GB de pico; 64,4 tokens/s con prompt de 4.096; 59,6 tokens/s con 16.384; 53,0 tokens/s con 32.768 (pico de 8,97 GB en los tres ultimos). En un MacBook Pro M1 Pro de 16 GB, una medicion independiente del equipo Kapitsa con la build 4-bit y 2 bucles da 27,9 tokens/s con contexto de 1K y 19,3 tokens/s con 32K.

## Requisitos de hardware

- VRAM o memoria unificada: 4,2 GB de pesos; pico medido de 4,39 GB con prompts cortos, 8,97 GB con prompts de 4K a 32K y 2 bucles, y 11,5 GB con 32K y 4 bucles.
- Cabe en Macs de 8 GB de memoria unificada (build recomendada para ese caso); la build NVFP4 de 2,6 GB es la opcion mas ligera.
- GPU dedicadas: no aplica; esta build es exclusiva de Apple Silicon mediante MLX. Para CUDA seria necesario usar los pesos originales de NVIDIA en otro runtime.
- Apple Silicon recomendado: M5 Max para las cifras anteriores; M1 Pro de 16 GB validado de forma independiente con la build 4-bit.
- Despliegue: paquete `dory-mlx` (CLI y API Python) o MLX-LM con el soporte propuesto en el PR 1988. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta build.
- Latencia y throughput: 101 tokens/s (1 bucle) a 39 tokens/s (4 bucles) en generacion con prompt corto en M5 Max; lectura de 32K tokens en 10 a 31 s segun bucles; servicio por lotes de 200 tokens/s con 4 peticiones y 450 tokens/s con 16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| netprojects/nemotron-dory1.0-4b-mlx-8bit | 3,98B | verificado hasta 24K | safetensors 8-bit, MLX | OpenMDW 1.1 | Esta ficha; 4,2 GB; dial de 1 a 4 bucles |
| netprojects/Nemotron-Dory-1.0-4B-MLX-nvfp4 | 3,98B | no disponible | NVFP4 4-bit, MLX | OpenMDW 1.1 | 2,6 GB, aproximadamente 1,4 veces mas rapido que 8 bits, misma perplejidad que bf16 |
| netprojects/Nemotron-Dory-1.0-4B-MLX-bf16 | 3,98B | no disponible | bf16, MLX | OpenMDW 1.1 | 8,0 GB; referencia de calidad para 16 GB o mas |
| nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16 | 3,98B | no disponible | bf16, PyTorch | no disponible en la informacion | Modelo base original de NVIDIA |

No se dispone de datos de benchmarks comparativos con modelos de otras familias (por ejemplo, Qwen o Llama de tamano similar) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo procesa y genera texto en ingles; no hay soporte multilingue documentado.
- Las respuestas incluyen la cadena de razonamiento completa, por lo que son mas largas y consumen mas tokens que las de un modelo de chat convencional.
- Riesgo de alucinacion inherente a los modelos generativos; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- La licencia OpenMDW 1.1 se etiqueta como `other`; conviene revisar el fichero LICENSE antes de un uso comercial, ya que las condiciones no se detallan en la model card.
- Esta build esta pensada exclusivamente para Apple Silicon con MLX; no funciona en CUDA ni en CPU sin convertir los pesos.
- El soporte de tool calling y de agentes no esta documentado; no debe asumirse.
- La integracion en MLX-LM depende de un PR (1988) no necesariamente fusionado; el paquete `dory-mlx` es la via estable.
- La memoria pico crece con la longitud del prompt y el numero de bucles: 11,5 GB con 32K tokens y 4 bucles, lo que descarta Macs de 8 GB en ese regimen.
- El autor no esta afiliado a NVIDIA; la calidad de la conversion depende de sus verificaciones, aunque estas son detalladas y reproducibles.
- La fecha de creacion del repositorio (17 de octubre de 2026) y el modelo base son muy recientes; el ecosistema de herramientas en torno a la arquitectura `dory` puede ser inmaduro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/nemotron-dory1.0-4b-mlx-8bit
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-BF16
- Build NVFP4 4-bit: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-nvfp4
- Build bf16: https://huggingface.co/netprojects/Nemotron-Dory-1.0-4B-MLX-bf16
- Repositorio del autor en Hugging Face: https://huggingface.co/netprojects
- Paquete dory-mlx: https://github.com/internet-projects/dory-mlx
- MLX: https://github.com/ml-explore/mlx
- PR de soporte Dory en MLX-LM: https://github.com/ml-explore/mlx-lm/pull/1988
- Medicion independiente en M1 Pro (Kapitsa): https://github.com/nace-ai/kapitsa/issues/296
- NetProjects: https://netprojects.com
