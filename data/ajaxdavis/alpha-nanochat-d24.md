# ajaxdavis/alpha-nanochat-d24

## Resumen

alpha-nanochat-d24 es un modelo base (pretrained) de tipo GPT desarrollado por ajaxdavis como reproducción del récord de entrenamiento (speedrun) del proyecto nanochat de Andrej Karpathy. Se trata de una ejecución concreta del modelo d24 de nanochat, con 1.384.122.122 parámetros, entrenada íntegramente con el compilador Alpha (thomasdavis/alpha) que genera código máquina sm_90 sin usar el runtime de CUDA, NCCL ni PyTorch en la ruta de entrenamiento. El modelo es relevante como registro técnico de un experimento de entrenamiento de bajo nivel: demuestra que es posible reproducir el throughput de nanochat (247.865 tokens/s frente a 247.886 del original) con una pila de software propia.

El entrenamiento consistió en 5.568 pasos de 2^20 tokens cada uno (5.838.471.168 tokens de ClimbMix), con productos matriciales en FP8 y optimizadores Muon + AdamW, ejecutado en 2 GPU H100 SXM durante 6 horas y 32 minutos. El modelo se distribuye como checkpoint nativo de nanochat (`.pt`) junto con el tokenizador entrenado para esta ejecución, no en formatos estándar como safetensors o GGUF.

Es importante señalar que esta versión está marcada como obsoleta por el propio autor: un defecto en la retropropagación FP8 del entrenador (issue thomasdavis/alpha#372) provocó que la mitad de los gradientes de cada bloque se direccionaran incorrectamente, dejando la pérdida 0,11 nats por token por encima de la versión corregida (v2). El modelo se conserva como registro de la primera ejecución y no alcanza el umbral de rendimiento del récord de nanochat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (nanochat d24) |
| Parametros totales | 1.384.122.122 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Checkpoint nativo de nanochat (`.pt`, state dict); tokenizador en `.pkl` y `.pt` |

## Arquitectura y entrenamiento

El modelo sigue la receta del modelo d24 de nanochat, un transformer decoder-only tipo GPT con 1.384 millones de parámetros. El entrenamiento utilizó la inicialización propia de nanochat para d24, el tokenizador entrenado específicamente para esta ejecución y el cargador de datos de nanochat sobre 170 shards de ClimbMix. Se realizaron 5.568 pasos (horizonte derivado por base_train con una ratio datos:parámetros de 8), cada uno de 2^20 tokens, sumando 5.838.471.168 tokens en total. Los productos matriciales se ejecutaron en FP8 y se emplearon los optimizadores Muon y AdamW con el estado del optimizador fragmentado según DistMuonAdamW de nanochat.

La innovación técnica principal es el uso del compilador Alpha, que genera directamente código máquina sm_90 (más host x86-64) para el entrenador, eliminando el runtime de CUDA, NCCL y PyTorch de la ruta de entrenamiento. El entrenamiento se ejecutó en 2 GPU H100 SXM con NVLink NV18 en RunPod, con dos rangos (uno por tarjeta) y pesos finales idénticos en ambos. El throughput alcanzado fue de 247.865 tokens/s, prácticamente idéntico al de nanochat (247.886). No se especifica en la información disponible si hubo fases de RLHF o DPO; se trata de un modelo base sin ajuste por instrucciones.

## Capacidades

- Generación de texto autoregresiva como modelo base (pretrained), sin ajuste por instrucciones.
- Razonamiento y conocimiento general limitados, según los resultados de CORE (0,2089).
- Capacidad de continuar texto y completar tareas de elección múltiple en formato few-shot (hellaswag, arc, piqa, etc.).
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Soporte de tool calling / function calling: no disponible en el modelo base.
- Soporte de agentes y razonamiento multi-paso: no disponible en el modelo base.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Existe una versión SFT (ajaxdavis/alpha-nanochat-d24-sft) con ajuste supervisado de nanochat para uso conversacional.

## Casos de uso

- Investigación sobre entrenamiento de bajo nivel: el modelo sirve como artefacto de referencia para estudiar el impacto del compilador Alpha y del defecto FP8 en la pérdida de entrenamiento, comparando curvas de pérdida y checkpoints con la versión v2.
- Reproducción de experimentos de speedrun: permite verificar la receta de nanochat (pasos, tokens, optimizadores) y comparar el throughput obtenido con el original usando los logs y eventos incluidos en el repositorio.
- Estudio de tokenizadores: el repositorio incluye el tokenizador entrenado y su tabla de bytes, útil para analizar decisiones de tokenización en modelos pequeños.
- Fine-tuning posterior como base: al ser un modelo base de 1.384 M de parámetros con licencia MIT, puede servir de punto de partida para ajustes supervisados en dominios concretos, aunque su rendimiento base es limitado.
- Evaluación comparativa de checkpoints: los scripts de base_eval de nanochat permiten reproducir las métricas CORE y bits por byte para comparar esta ejecución con otras del leaderboard.
- Docencia y divulgación: adecuado para explicar el ciclo completo de entrenamiento de un GPT pequeño (datos, tokenizador, optimizadores, evaluación) con artefactos verificables (hashes, logs, pérdidas por paso).
- Pruebas de infraestructura: útil para validar pipelines de entrenamiento propios contra una referencia conocida con throughput documentado en 2× H100.

## Benchmarks y rendimiento

Evaluación con `scripts.base_eval` de nanochat (commit a825e63) en 2× H100:

| Metrica | Este modelo | Referencia nanochat |
|---|---|---|
| train bits per byte | 0.7554 | no disponible |
| val bits per byte | 0.7544 | 0.718 (Runs 4–5, mismos datos ClimbMix) |
| CORE | 0.2089 | récord Run 6: 0.2626; GPT-2 1.6B: 0.2565 |

CORE por tarea (22 tareas, precisión centrada promediada):

| Tarea | Shots | Precision | Centrada |
|---|---|---|---|
| hellaswag_zeroshot | 0-shot | 0.4885 | 0.3181 |
| jeopardy | 10-shot | 0.0227 | 0.0227 |
| bigbench_qa_wikidata | 10-shot | 0.4006 | 0.4006 |
| arc_easy | 10-shot | 0.6566 | 0.5421 |
| arc_challenge | 10-shot | 0.3643 | 0.1524 |
| copa | 0-shot | 0.6600 | 0.3200 |
| commonsense_qa | 10-shot | 0.2154 | 0.0192 |
| piqa | 10-shot | 0.7280 | 0.4559 |
| openbook_qa | 0-shot | 0.3940 | 0.1920 |
| lambada_openai | 0-shot | 0.3681 | 0.3681 |
| hellaswag | 10-shot | 0.4877 | 0.3169 |
| winograd | 0-shot | 0.6154 | 0.2308 |
| winogrande | 0-shot | 0.5233 | 0.0466 |
| bigbench_dyck_languages | 10-shot | 0.0690 | 0.0690 |
| agi_eval_lsat_ar | 3-shot | 0.2435 | 0.0543 |
| bigbench_cs_algorithms | 10-shot | 0.3848 | 0.3848 |
| bigbench_operators | 10-shot | 0.1286 | 0.1286 |
| bigbench_repeat_copy_logic | 10-shot | 0.0312 | 0.0312 |
| squad | 10-shot | 0.2571 | 0.2571 |
| coqa | 0-shot | 0.2366 | 0.2366 |
| boolq | 10-shot | 0.5709 | -0.1291 |
| bigbench_language_identification | 10-shot | 0.2533 | 0.1785 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 1.384 M de parámetros en bfloat16 se requieren aproximadamente 2,8 GB solo para pesos, más memoria para activaciones y KV cache; en FP8, unos 1,4 GB.
- GPU recomendadas: el entrenamiento se realizó en 2× H100 SXM (NVLink NV18). Para inferencia, cualquier GPU con al menos 8 GB de VRAM debería poder cargar el modelo en precisión reducida, aunque no se documentan requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas como RTX 3060 12 GB, RTX 4070, RTX 4080 o RTX 4090, dado el tamaño del modelo, aunque no hay datos oficiales de compatibilidad.
- Opciones de despliegue: el checkpoint está en formato nativo de nanochat (`.pt`), por lo que requiere el código de nanochat para cargarlo. No se distribuyen pesos en GGUF, safetensors ni formatos compatibles con vLLM, llama.cpp, Ollama o TGI de forma directa.
- Latencia y throughput: no disponibles para inferencia. El throughput de entrenamiento documentado es de 247.865 tokens/s en 2× H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CORE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alpha-nanochat-d24 (este) | 1.384 M | no disponible | 0.2089 | MIT | Hugging Face (checkpoint nanochat) |
| alpha-nanochat-d24-v2 | no disponible | no disponible | no disponible | MIT | Hugging Face (versión corregida) |
| GPT-2 1.6B | 1.600 M | 1.024 tokens | 0.2565 | MIT | Hugging Face |
| nanochat récord Run 6 | no disponible | no disponible | 0.2626 | no disponible | Leaderboard nanochat |

## Limitaciones y advertencias

- Modelo obsoleto: el autor lo marca como superseded por alpha-nanochat-d24-v2; el defecto en la retropropagación FP8 (thomasdavis/alpha#372) degradó el entrenamiento en aproximadamente 0,15 nats por token desde el paso 50.
- No alcanza el umbral del récord: CORE de 0,2089 frente a 0,2565 de GPT-2 1.6B y 0,2626 del récord Run 6; los bits por byte de validación están un 5 % por encima de lo reportado por nanochat para d24.
- Es un modelo base, no ajustado por instrucciones: no es adecuado para uso conversacional directo sin SFT.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero esperables en un modelo base de este tamaño entrenado sobre ClimbMix.
- Idiomas soportados no documentados; el rendimiento multilingüe es incierto.
- Longitud de contexto no especificada en la información disponible.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye como checkpoint nativo de nanochat, lo que limita su integración en herramientas estándar sin conversión previa.
- No se distribuyen pesos en formatos cuantizados ni compatibles con motores de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ajaxdavis/alpha-nanochat-d24
- Versión corregida (v2): https://huggingface.co/ajaxdavis/alpha-nanochat-d24-v2
- Versión SFT: https://huggingface.co/ajaxdavis/alpha-nanochat-d24-sft
- Space del modelo base: https://huggingface.co/spaces/ajaxdavis/alpha-nanochat-d24-base
- Space de chat: https://huggingface.co/spaces/ajaxdavis/alpha-nanochat-d24-chat
- Repositorio nanochat de Karpathy: https://github.com/karpathy/nanochat
- Compilador Alpha: https://github.com/thomasdavis/alpha
- Issue del defecto FP8: https://github.com/thomasdavis/alpha/issues/372
- Registro del entrenamiento: https://lsalpha.com/training/speedrun
