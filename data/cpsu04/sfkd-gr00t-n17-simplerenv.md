# cpsu04/sfkd-gr00t-n17-simplerenv

## Resumen

SF-KD (scene-flow distillation) es un conjunto de cuatro checkpoints de robótica derivados de NVIDIA GR00T N1.7-3B, un modelo visión-lenguaje-acción (VLA) de 3.000 millones de parámetros. El autor, identificado como `cpsu04`, los ha ajustado sobre datos de SimplerEnv, un conjunto de entornos simulados para evaluar políticas de manipulación robótica, y publica tanto los pesos como el código de evaluación y las versiones fijadas del entorno.

La aportación técnica central es la destilación de características de flujo de escena (scene-flow) desde un profesor hacia el estudiante GR00T N1.7. El estudiante extrae características de la capa 8 del LLM (64 tokens) y las alinea con las del profesor mediante una pérdida InfoNCE por token con 2.048 negativos y temperatura 0,1, ponderada con α = 0,1. El profesor solo interviene en el entrenamiento, de modo que la inferencia no requiere ningún componente adicional.

El repositorio incluye dos pares de checkpoints: uno con destilación (KD) y otro con la misma receta pero sin destilación (E0), sobre dos benchmarks (Fractal con robot Google y Bridge con WidowX). Los resultados reportados muestran mejoras de 4,5 a 15,4 puntos porcentuales frente a los checkpoints oficiales de NVIDIA en las tareas evaluadas. El modelo base es `nvidia/Cosmos-Reason2-2B` como backbone.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-acción (VLA) basada en transformer; backbone `nvidia/Cosmos-Reason2-2B` |
| Parametros totales | 3B (según el nombre del modelo base GR00T-N1.7-3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | safetensors |
| Tamano del repo | 27,8 GB |
| Pipeline | robotics |
| Checkpoints incluidos | `weights/fractal_kd`, `weights/fractal_e0`, `weights/bridge_kd`, `weights/bridge_e0` |
| Entrenamiento | 8 GPUs, batch global 640 (80 por GPU), seed 42 |

## Arquitectura y entrenamiento

El modelo es un VLA construido sobre GR00T N1.7-3B, cuyo backbone es `nvidia/Cosmos-Reason2-2B`. La innovación del ajuste es la destilación de características de flujo de escena: el estudiante toma las activaciones de la capa 8 del LLM (64 tokens) y las alinea con las características del profesor, que usa una rejilla de 8×10. La pérdida es InfoNCE por token con 2.048 negativos, temperatura 0,1 y peso α = 0,1. El profesor se emplea únicamente durante el entrenamiento, por lo que la inferencia es idéntica a la de un GR00T N1.7 estándar.

Los cuatro checkpoints se entrenaron con 8 GPUs y un batch por GPU de 80 (batch global 640), semilla 42. Los checkpoints KD de Fractal y Bridge se entrenaron 23.764 pasos; el E0 de Fractal, 20.000 pasos; el E0 de Bridge, 23.764 pasos. El repositorio incluye 14 commits de parches sobre `NVIDIA/Isaac-GR00T` en el commit `51d4c89`, más un cambio sin commitear relativo a hilos de FFmpeg. No se especifica la composición del dataset de entrenamiento más allá de que proviene de SimplerEnv (Fractal y Bridge), ni si hubo RLHF o DPO.

## Capacidades

- Control robótico de manipulación en entornos simulados (Fractal/Google robot y Bridge/WidowX).
- Política visión-lenguaje-acción: recibe observaciones visuales e instrucciones en lenguaje natural y emite acciones motoras.
- Ejecución de acciones por chunks: 8 pasos por chunk en el protocolo oficial de Bridge, con ejecución configurable de 1 o 4 pasos.
- Ensemble de acciones en el cliente: promedio ponderado exponencialmente de las predicciones de los dos últimos chunks (`ACT_ENSEMBLE=adaptive:2:0.1`).
- Evaluación reproducible con SimplerEnv: hasta 300 pasos por episodio, 5 entornos paralelos, éxito en cualquier paso.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modalidades de audio.

## Casos de uso

- Evaluación de investigación en manipulación robótica: permite reproducir los resultados de SimplerEnv en Fractal y Bridge con los scripts incluidos (`run_local_eval.sh`), útil para comparar técnicas de destilación frente a baselines oficiales.
- Estudio de destilación de características: los pares KD/E0 con la misma receta permiten aislar el efecto de la pérdida InfoNCE de flujo de escena sobre el rendimiento final.
- Desarrollo de políticas VLA en simulación: sirve como punto de partida para ajustar GR00T N1.7 a nuevas tareas de SimplerEnv con datos propios.
- Benchmarking de ensembles de acciones: el hook `code/pyhooks/act_ensemble.py` permite probar estrategias de agregación de chunks sin modificar el código de GR00T.
- Validación de pipelines de evaluación: los parches incluyen correcciones de conteo exacto de episodios, registro por episodio (`EPISODE_LOG`) y manejo limpio de errores de workers, reutilizables en otras evaluaciones.
- Reproducibilidad de entornos: las versiones fijadas en `env/` (Python 3.12, torch 2.9.0+cu128, flash-attn 2.8.3 en servidor; Python 3.10, sapien 2.2.2, numpy 1.26.4 en cliente) facilitan replicar el entorno exacto en clústeres con H100.

## Benchmarks y rendimiento

| Benchmark | KD | E0 | GR00T N1.7 oficial |
|---|---|---|---|
| Fractal, ensemble a2, 6 tareas × 100 episodios | **75,8%** | 71,3% | 69,2% |
| Bridge, protocolo oficial (execute 4), 7 tareas × 120 episodios | **71,7%** | 56,3% | 62,9% |
| Bridge, 4 tareas (carrot / basket / stack / spoon) | **76,7%** | 64,6% | 59,8% |

Valores p de tests exactos de Fisher bilaterales sobre éxitos agrupados, KD frente a cada modelo: Fractal frente a E0 p = 0,089 y frente al oficial p = 0,012; Bridge de 7 tareas frente a E0 p = 7e-11 y frente al oficial p = 1,5e-4. Sobre 3 semillas de entrenamiento KD, Fractal a2 promedia 72,1% ± 3,7; los pesos publicados corresponden a la semilla 42. Cada tarea se evaluó una sola vez con colocaciones aleatorias de SimplerEnv y sin semilla de evaluación fija.

## Requisitos de hardware

- GPU NVIDIA con driver que exponga Vulkan (SAPIEN renderiza con Vulkan); en contenedor, `NVIDIA_DRIVER_CAPABILITIES=all`.
- Las tareas de cajón usan el trazador de rayos de SAPIEN con el denoiser OptiX, que requiere `/usr/share/nvidia/nvoptix.bin` del driver.
- Evaluación ejecutada en H100, un proceso de evaluación (servidor + 5 entornos) por GPU; con más evaluaciones por GPU en un nodo cargado, el renderizador de SAPIEN arranca demasiado lento y agota el tiempo.
- Entorno de servidor: Python 3.12, torch 2.9.0+cu128, flash-attn 2.8.3, contenedor NGC PyTorch 24.08.
- Entorno de cliente: Python 3.10, sapien 2.2.2, numpy 1.26.4.
- Dependencias del sistema: `git`, `uv` y bibliotecas compartidas de FFmpeg 4–7 (torchcodec en el entorno del servidor).
- Acceso a `nvidia/Cosmos-Reason2-2B` en Hugging Face (el servidor carga su procesador; puede requerir `huggingface-cli login`).
- No se proporcionan estimaciones de VRAM por cuantización, opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) ni cifras de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Fractal a2 | Bridge 7 tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SF-KD (este) | 3B | no disponible | 75,8% | 71,7% | NVIDIA Open Model License | Hugging Face (`cpsu04/sfkd-gr00t-n17-simplerenv`) |
| GR00T N1.7 oficial (SimplerEnv) | 3B | no disponible | 69,2% | 62,9% | NVIDIA Open Model License | Hugging Face (`nvidia/GR00T-N1.7-SimplerEnv-Fractal`, `nvidia/GR00T-N1.7-SimplerEnv-Bridge`) |
| E0 (ablación sin destilación) | 3B | no disponible | 71,3% | 56,3% | NVIDIA Open Model License | Incluido en este repositorio |

## Limitaciones y advertencias

- Cada tarea se evaluó una sola vez, con colocaciones aleatorias y sin semilla de evaluación fija; la variabilidad entre ejecuciones no está cuantificada salvo por el ±3,7 de las 3 semillas de entrenamiento en Fractal.
- La mejora en Fractal frente a E0 no es estadísticamente significativa (p = 0,089); solo es significativa frente al checkpoint oficial (p = 0,012).
- El modelo está ajustado exclusivamente para SimplerEnv (Fractal y Bridge); no se documenta su comportamiento en entornos reales ni en otras tareas.
- No se especifican sesgos conocidos, tasas de alucinación ni comportamiento multilingüe; los idiomas soportados figuran como no disponibles.
- La licencia NVIDIA Open Model License condiciona el uso comercial; los pesos son derivados de GR00T N1.7 y Cosmos-Reason2, y los parches de código son Apache 2.0.
- El repositorio pesa 27,8 GB e incluye cuatro checkpoints, código y entornos; no es un modelo listo para despliegue en producción sin el stack de Isaac-GR00T.
- La evaluación requiere Vulkan, OptiX y una GPU H100 por proceso de evaluación en la configuración reportada, lo que limita la reproducibilidad en hardware de consumo.
- Los checkpoints KD requieren el código de modelo de destilación incluido en `code/patches/` para cargarse correctamente.

## Enlaces

- Hugging Face: https://huggingface.co/cpsu04/sfkd-gr00t-n17-simplerenv
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Backbone: https://huggingface.co/nvidia/Cosmos-Reason2-2B
- Baseline oficial Fractal: https://huggingface.co/nvidia/GR00T-N1.7-SimplerEnv-Fractal
- Baseline oficial Bridge: https://huggingface.co/nvidia/GR00T-N1.7-SimplerEnv-Bridge
- Repositorio de código base: https://github.com/NVIDIA/Isaac-GR00T
- Paper de referencia CogACT: https://arxiv.org/abs/2411.19650
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
