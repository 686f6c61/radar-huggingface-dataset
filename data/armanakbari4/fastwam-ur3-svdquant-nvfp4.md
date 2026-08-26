# armanakbari4/fastwam-ur3-svdquant-nvfp4

## Resumen

Este checkpoint es una exportación cuantizada del modelo FastWAM UR3 3-task (fine-tune en el paso 7000), aplicando la técnica SVDQuant (Li et al., ICLR 2025) en formato numérico NVFP4 en lugar de INT4. El objetivo es reducir el consumo de memoria del modelo de 12,55 GiB a 4,94 GiB en pesos, manteniendo una fidelidad de salida cercana al original en bf16, para su ejecución nativa en GPUs Blackwell como la RTX 5090. El modelo es un world-action model para robótica: recibe observaciones de cámara y propriocepción de un brazo UR3 y genera secuencias de acciones para tres tareas de manipulación (cajón, cesta azul y apilado de cubos).

La cuantización cubre 600 capas Lineales (5,914 mil millones de parámetros) correspondientes a los bloques de atención y feed-forward de ambos expertos, mientras que embeddings, cabezas, codificadores de acción y propriocepción permanecen en bf16. El archivo es autocontenido: no requiere el checkpoint bf16 original de 11,2 GiB para inferencia. La relevancia actual radica en que es uno de los primeros modelos de robótica world-action cuantizados con NVFP4, el formato de 4 bits que las GPUs Blackwell ejecutan de forma nativa, lo que permite desplegar controladores robóticos en hardware de consumo con requisitos de memoria reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastWAM (world-action model) con bloques transformer duales (experto en acciones y experto en mundo), cuantizado con SVDQuant |
| Parametros totales | No disponible (5,914 B parametros cuantizados en 600 Lineales; el total incluye embeddings, cabezas y codificadores en bf16) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (horizon de accion de 64 pasos; el experto de acciones procesa 64 tokens) |
| Tipos de cuantizacion | NVFP4 (E2M1, block 16, escalas de bloque E4M3), W4A4 |
| Idiomas soportados | No disponible (modelo de robotica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (.pt), autocontenido con Lineales cuantizados y tensores bf16 |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de FastWAM sobre el dataset `armanakbari4/ur3-3task-lerobot`, con 30 episodios de calibracion (10 por tarea, seed 42). La cuantizacion aplica SVDQuant, que descompone los pesos en un componente de bajo rango (rank 32) y un residuo que se cuantiza, absorbiendo outliers. La exportacion NVFP4 usa el empaquetado de DeepCompressor (`convert_to_nunchaku_w4x4y16_linear_weight` con `float_point=True`), con codebook E2M1 y swizzle de escalas fp8 de referencia.

La diferencia principal frente a la exportacion INT4 es que el parametro de suavizado alpha se busca por capa mediante grid search sobre `{0.25, 0.375, 0.5, 0.625, 0.75}`, evaluando el error de salida de cada capa contra activaciones reales de calibracion. Solo 193 de 600 capas eligieron 0.5. Los absmax de activacion se recuperaron analiticamente de la exportacion INT4 (`a = s^2 * w_absmax`), por lo que alpha es la unica diferencia entre ambas exportaciones. La captura de activaciones uso PyAV en lugar de torchcodec por restricciones de FFmpeg en el entorno de compilacion.

## Capacidades

- Control robotico de brazo UR3: genera secuencias de acciones (chunks de hasta 64 pasos) a partir de observaciones visuales y proprioceptivas.
- Ejecucion de tres tareas de manipulacion: apertura de cajon, recogida en cesta azul y apilado de cubos.
- Cuantizacion W4A4 con NVFP4: pesos y activaciones en 4 bits con escalas de bloque E4M3, ejecutable nativamente en GPUs Blackwell.
- Inferencia autocontenida: no requiere el checkpoint bf16 original; incluye todos los tensores necesarios.
- Compatibilidad con Nunchaku: usa kernels `SVDQW4A4Linear` con precision `nvfp4` para aceleracion en RTX 5090.
- Integracion con runtime FastWAM: funcion `install_nvfp4` en `QuantWAM/adapters/fastwam/` para carga directa del checkpoint.

## Casos de uso

- Despliegue de controladores roboticos en GPUs de consumo: con 4,94 GiB de pesos, el modelo cabe en tarjetas Blackwell de gama media, permitiendo ejecutar el controlador en el mismo equipo que la camara y el brazo sin servidores dedicados.
- Prototipado rapido de tareas de manipulacion: al ser un fine-tune de 3 tareas con dataset LeRobot, sirve como punto de partida para validar pipelines de aprendizaje por demostracion en UR3 antes de escalar a mas tareas.
- Investigacion en cuantizacion de modelos de robotica: el checkpoint documenta el proceso completo (calibracion, busqueda de alpha, verificacion) y puede usarse como referencia para comparar NVFP4 vs INT4 en modelos world-action.
- Evaluacion de fidelidad de cuantizacion en lazo abierto: las metricas NRMSE y correlacion publicadas permiten reproducir la verificacion del modelo cuantizado frente al bf16 en secuencias reales de robot.
- Sistemas de robotica asistida en entornos con restriccion de memoria: la reduccion de 2,5x en memoria de pesos habilita ejecutar multiples instancias del modelo en una sola GPU para simulacion paralela o ensamblajes multi-robot.
- Benchmarking de kernels Nunchaku en Blackwell: el checkpoint sirve para medir el rendimiento de los kernels NVFP4 en M=64 (el regimen del experto de acciones) y comparar con bf16, documentando el punto de cruce en M=512.

## Benchmarks y rendimiento

Verificacion en lazo abierto contra bf16 en fotogramas reales de robot, horizon 64, N = 12:

| Metrica | Valor |
|---|---|
| NRMSE ventana ejecutada (pasos 0:16) | 0,0008 |
| NRMSE chunk completo (0:64) | 0,0027 |
| Correlacion | 0,999952 |

Contra teleoperacion grabada en episodios held-out (N = 54, horizon 32, ventana ejecutada):

| Variante | Error vs grabado |
|---|---|
| bf16 | 0,00781 |
| Este checkpoint (NVFP4) | 0,00771 |
| Deflated-ASP NVFP4 | 0,00782 |

El autor advierte que las tres variantes caen dentro de 1e-4 entre si sobre una base de 7,8e-3, y que el error del modelo frente al demostrador humano es aproximadamente 6 veces el error de cuantizacion, por lo que esta metrica esta saturada y no distingue entre brazos W4A4. No se ha medido tasa de exito en lazo cerrado con este checkpoint.

## Requisitos de hardware

- GPU Blackwell obligatoria: el formato NVFP4 se ejecuta nativamente en RTX 5090 (y GPUs Blackwell equivalentes); no funciona en arquitecturas anteriores.
- VRAM estimada: 4,94 GiB en pesos (frente a 12,55 GiB en bf16), mas overhead de activaciones y runtime.
- Runtime: Nunchaku con build NVFP4 y el adaptador `fastwam_nvfp4_runtime` de QuantWAM.
- Latencia medida en RTX 5090 (inferencia completa `infer_action`, CUDA-graph replay): 178 ms frente a 131 ms en bf16, es decir, 1,36x mas lento.
- El rendimiento de los kernels NVFP4 es plano entre M=16 y M=256; el punto de cruce con bf16 esta en M=512 y a M=1024 alcanza 1,4x de speedup.
- No se documenta soporte para vLLM, Ollama o llama.cpp: el despliegue es exclusivamente via Nunchaku y el runtime de FastWAM.

## Comparativa con modelos similares

| Modelo | Formato | BPW | Pesos | Latencia (RTX 5090) | Licencia |
|---|---|---|---|---|---|
| Este checkpoint (NVFP4) | NVFP4 W4A4, block 16 | 4,8353 | 4,94 GiB | 178 ms | Apache 2.0 |
| `arashakb/FastWAM_UR3` (INT4) | INT4 W4A4, group 64 | 4,5798 | No disponible | No disponible | No disponible |
| `armanakbari4/fastwam-ur3-3task` (bf16) | bf16 | 16 | 12,55 GiB | 131 ms | MIT |

La exportacion NVFP4 consume mas bits que la INT4 (4,84 vs 4,58 BPW) debido a la granularidad mas fina: una escala fp8 por cada 16 pesos mas una escala bf16 por canal de salida, frente a una escala fp16 por cada 64 pesos. La diferencia en NRMSE entre ambas variantes cuantizadas no se ha medido directamente en el mismo conjunto de verificacion.

## Limitaciones y advertencias

- No se ha medido tasa de exito en lazo cerrado: la verificacion es exclusivamente en lazo abierto, que el propio autor califica como condicion necesaria pero no suficiente.
- Rendimiento inferior a bf16 en el regimen de uso real: a M=64 (el tamano del experto de acciones), el checkpoint es 1,36x mas lento que bf16; la cuantizacion compra memoria, no velocidad, en este escenario.
- Requiere hardware Blackwell: sin una GPU con soporte NVFP4 nativo, el checkpoint no es ejecutable.
- La calibracion de alpha se realizo sobre una submuestra de 1663 observaciones (reservoir-sampled a 256 filas por Linear), no sobre las 9908 observaciones completas; el autor lo documenta como una desviacion deliberada.
- Los absmax de activacion se recuperaron analiticamente de la exportacion INT4, no se re-midieron; 37 de 1.781.760 canales quedaron fijados en el clamp de 1e-5 de `compute_smooth`.
- Riesgo residual de diferencias de pixel por el decode con PyAV/libdav1d frente a torchcodec (posible diferencia de +/-1 LSB en swscale).
- La metrica de error contra teleoperacion esta saturada: no distingue entre variantes cuantizadas y bf16, por lo que no debe usarse como criterio de seleccion entre ellas.
- Modelo especifico para UR3 y tres tareas: no es un modelo generalista; su uso fuera de ese dominio requiere fine-tuning adicional.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/armanakbari4/fastwam-ur3-svdquant-nvfp4
- Modelo base bf16: https://huggingface.co/armanakbari4/fastwam-ur3-3task
- Exportacion INT4 companion: https://huggingface.co/arashakb/FastWAM_UR3
- Dataset de calibracion: https://huggingface.co/datasets/armanakbari4/ur3-3task-lerobot
- Paper SVDQuant (ICLR 2025): https://arxiv.org/abs/2411.05007
- Repositorio SVDQuant: https://github.com/dbw6/svdquant
- Repositorio Nunchaku (kernels): https://github.com/Nunchaku-AI/Nunchaku
