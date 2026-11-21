# BennyDaBall/LFM3-1.7B-NVFP4

## Resumen

LFM3-1.7B-NVFP4 (Schur Replay) es una cuantizacion de 4 bits en formato NVFP4 del modelo LiquidAI/LFM3-1.7B, desarrollada por el usuario independiente BennyDaBall. El modelo base es un transformer de tipo "liquid" de 1.728.801.536 parametros (aproximadamente 1,7 mil millones) creado por Liquid AI. Esta version mantiene el mismo mapa de capas, formato de fichero y velocidad que la cuantizacion NVFP4 oficial de Liquid AI, pero reemplaza el solver de cuantizacion round-to-nearest por una pila propia basada en GPTQ, Schur Replay y Four Over Six.

El problema que resuelve es la perdida de fidelidad respecto al modelo BF16 original al comprimir a 4 bits. Segun las mediciones del autor, esta version queda un 28% mas cerca del BF16 que el fichero oficial del fabricante bajo el camino W4A4 (KLD medio de 0,0433 frente a 0,0628), con el mismo tamano (1,86 GiB de pesos) y velocidad practicamente identica. Es relevante para desarrolladores que despliegan el modelo en GPUs Blackwell (por ejemplo, RTX 5090) con vLLM o SGLang y quieren minimizar la degradacion de calidad sin renunciar al rendimiento del formato FP4 nativo.

La ficha se centra en esta cuantizacion concreta; las capacidades funcionales heredan del modelo base LFM3-1.7B de Liquid AI, aunque muchos detalles de entrenamiento y benchmarks del original no estan disponibles en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo "liquid" (LFM3), con atencion y convoluciones en BF16; capas feed-forward en NVFP4 W4A4 |
| Parametros totales | 1.728.801.536 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (W4A4 en feed-forward; W4A16 como vista de solo pesos); GGUF disponible en repo gemelo |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (ModelOpt NVFP4); GGUF en repo separado |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de la familia "liquid" de Liquid AI. En esta cuantizacion, el mapa de capas es identico al de la version NVFP4 oficial: los pesos y activaciones de las capas feed-forward del lenguaje se cuantizan a NVFP4 (W4A4), mientras que la atencion, las convoluciones, los embeddings, la cabeza de salida y las normalizaciones permanecen en BF16. Las activaciones usan un `input_scale` estatico por tensor y escalas dinamicas por bloque de 16.

La innovacion tecnica esta en el solver de cuantizacion. En lugar del round-to-nearest por defecto de ModelOpt, el autor aplica GPTQ combinado con Schur Replay (arXiv 2609.36654): dentro del bucle GPTQ, cada bloque de 16 pesos prueba una ventana de codigos de escala E4M3 mas el mapa Four Over Six (arXiv 2512.02010), y cada candidato se puntua por su perdida GPTQ real (el complemento de Schur de las columnas aun no cuantizadas). Tras el solver, un post-pass hace descenso por coordenadas sobre los codigos y vuelve a elegir las escalas E4M3 de cada bloque. Las matrices Hessianas se calculan con 599.000 tokens de calibracion (llamadas a herramientas, chat, razonamiento y texto plano); las respuestas de chat, tool-call y razonamiento son generaciones del propio modelo BF16. No se dispone de informacion sobre el numero de tokens de preentrenamiento, la composicion del dataset original ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional y texto plano.
- Razonamiento con modo "thinking" activado por defecto.
- Llamadas a herramientas (tool calling) mediante el formato XML de Liquid.
- Razonamiento multi-paso y uso en agentes (heredado del modelo base, segun los tags y la model card).
- Capacidades matematicas y STEM (la model card recomienda parametros de muestreo especificos para math/STEM).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue de bajo consumo en GPUs Blackwell: el modelo ocupa 1,86 GiB de pesos y un pico de 4.001 MiB de VRAM en una RTX 5090, lo que permite ejecutarlo junto a otros servicios en la misma GPU.
- Servicio de chat conversacional de alta concurrencia: con 402 tok/s de decodificacion y 53.368 tok/s de prefill (prompt de 2,3k) en vLLM, es adecuado para atender muchas sesiones simultaneas en una sola GPU consumer de gama alta.
- Agentes con tool calling: el modelo conserva el formato XML de Liquid y el autor reporta un KLD de 0,0220 en la categoria de tool calls, la mas fiel al BF16, lo que lo hace apto para pipelines de agentes que invocan funciones.
- Razonamiento asistido en local: el modo thinking por defecto permite usarlo en tareas de razonamiento y STEM con los parametros de muestreo recomendados (temperature 1.0, top_p 0.95, top_k 20).
- Evaluacion e investigacion de cuantizacion: sirve como referencia practica de tecnicas GPTQ + Schur Replay + Four Over Six frente al round-to-nearest, con metricas KLD publicadas.
- Prototipado en estaciones de trabajo con una sola RTX 5090: permite iterar sobre prompts y flujos de agente sin infraestructura de servidor, gracias a su huella de memoria reducida.
- Despliegue en llama.cpp o LM Studio: mediante el repo GGUF gemelo (1,28 GB), para entornos sin soporte de NVFP4 nativo.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card (KLD respecto al BF16, menor es mejor; 150 secuencias, 124.790 tokens evaluados):

| W4A4 (vLLM / SGLang) | KLD medio | Mediana | p99 | Top-1 agree | Tool | Chat | Reasoning | Raw |
|---|---|---|---|---|---|---|---|---|
| Liquid NVFP4 | 0,0628 | 0,0187 | 0,584 | 90,3% | 0,0353 | 0,0707 | 0,0378 | 0,0870 |
| Este repo | 0,0433 | 0,0129 | 0,404 | 92,0% | 0,0220 | 0,0487 | 0,0245 | 0,0627 |

| Vista solo pesos (W4A16) | KLD medio | Top-1 agree |
|---|---|---|
| Liquid NVFP4 | 0,0332 | 92,9% |
| Este repo | 0,0176 | 95,0% |

| Rendimiento (RTX 5090, vLLM 0.32.0) | Decode tok/s | Prefill tok/s (2,3k) | Pesos | VRAM pico |
|---|---|---|---|---|
| BF16 | 290 | 33.555 | 3,36 GiB | 5.424 MiB |
| Liquid NVFP4 | 379 | 54.685 | 1,86 GiB | 3.945 MiB |
| Este repo | 402 | 53.368 | 1,86 GiB | 4.001 MiB |

En SGLang (PR 46858): BF16 345 tok/s, Liquid NVFP4 513 tok/s, este repo 457 tok/s de decodificacion. El autor indica que la diferencia entre ambas NVFP4 cambia de signo segun el runtime y que el tiempo total de kernel difiere en torno al 2%, por lo que deben considerarse de la misma velocidad.

IFEval en vLLM: 95,0 con temperature 0,6 y 94,3 en greedy (BF16: 95,6 y 94,1).

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar del modelo base.

## Requisitos de hardware

- VRAM estimada: 1,86 GiB de pesos; pico medido de 4.001 MiB con KV pool de 1 GiB y 512 tokens en una RTX 5090.
- GPU recomendadas: GPUs Blackwell con soporte de FP4 nativo (RTX 5090, y por extension la familia SM120); los kernels usados son CUTLASS SM120 block-scaled FP4 GEMMs.
- Cabe en GPU consumer: si, en RTX 5090 (y presumiblemente en otras Blackwell); no se dispone de datos para GPUs sin soporte FP4 nativo.
- Opciones de despliegue: vLLM 0.32.0 con el PR 64959 de vllm-project/vllm; SGLang nightly con el PR 46858; llama.cpp o LM Studio mediante el repo GGUF gemelo.
- Latencia y throughput: 402 tok/s de decodificacion y 53.368 tok/s de prefill (prompt de 2,3k) en vLLM sobre RTX 5090; 457 tok/s de decodificacion en SGLang.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KLD vs BF16 (W4A4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repo (LFM3-1.7B-NVFP4 Schur Replay) | 1,73B | no disponible | 0,0433 | lfm1.0 | Hugging Face + GGUF gemelo |
| LiquidAI/LFM3-1.7B-NVFP4 | 1,73B | no disponible | 0,0628 | lfm1.0 | Hugging Face (oficial) |
| LiquidAI/LFM3-1.7B (BF16) | 1,73B | no disponible | referencia | lfm1.0 | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria o tamano en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado no oficial: no esta afiliado ni respaldado por Liquid AI; los pesos feed-forward fueron recuantizados por un tercero.
- La licencia lfm1.0 puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de desplegar en produccion.
- Requiere hardware Blackwell y versiones muy concretas de runtime (vLLM 0.32.0 + PR 64959, o SGLang nightly + PR 46858); LFM3 no estaba en una release estable de vLLM ni SGLang en la fecha de publicacion (1 de noviembre de 2026).
- La cuantizacion introduce degradacion respecto al BF16: KLD medio de 0,0433 y p99 de 0,404; no es equivalente al modelo original.
- La vista W4A16 empeoro ligeramente en la actualizacion del 11-11-2026 (de 0,0172 a 0,0176) porque el solver se optimizo para W4A4.
- Riesgo de alucinacion y sesgos: no disponible en la informacion proporcionada.
- Idiomas soportados y longitud de contexto: no disponibles en la informacion proporcionada.
- El rendimiento relativo frente a la NVFP4 oficial varia segun el runtime (vLLM vs SGLang), por lo que las cifras de velocidad deben tomarse con cautela.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- NVFP4 oficial de Liquid AI: https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4
- GGUF gemelo: https://huggingface.co/BennyDaBall/LFM3-1.7B-NVFP4-GGUF
- Paper Schur Replay: arXiv 2609.36654
- Paper Four Over Six: arXiv 2512.02010
- PR de vLLM: vllm-project/vllm PR 64959
- PR de SGLang: sgl-project/sglang PR 46858
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Ko-fi del autor: https://ko-fi.com/bennydaball
