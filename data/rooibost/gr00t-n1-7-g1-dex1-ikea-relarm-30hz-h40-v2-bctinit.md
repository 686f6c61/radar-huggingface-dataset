# RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-bctinit

## Resumen
El modelo `RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-bctinit` es un fine-tuning del modelo base `nvidia/GR00T-N1.7-3B`, un modelo vision-language-action (VLA) de codigo abierto desarrollado por NVIDIA para habilidades robotizadas generales en humanoides. Este checkpoint especifico, creado por el usuario RooibosT, esta especializado en una tarea de ensamblaje de una mesa infantil (tarea IKEA) con un robot Unitree G1 equipado con pinzas Dex1.

El modelo se distingue por su estrategia de inicializacion: arranca desde un checkpoint previo (round-2, ckpt-15000) de un fine-tuning anterior, en lugar de partir del modelo base. La configuracion de entrenamiento usa un horizonte de 40 pasos a 30 Hz, con tres camaras (dos en las muñecas y una alta) y un espacio de accion de 16 dimensiones. El backbone (LLM y encoder visual) permanece congelado, entrenando solo la cabeza de accion. Los resultados en validacion muestran una precision de brazo de 1.455 grados (pasos 1-8) y un error de posicion de muñeca de 12.10 mm, con una mejora notable en la precision de la pinza (-9.6% respecto al baseline) a costa de una ligera perdida en la del brazo (+1.2%).

El modelo es relevante para la comunidad de robotica porque aborda el problema del ensamblaje autonomo de muebles con robots humanoides, una tarea compleja que requiere coordinacion bimanual, manipulacion precisa y razonamiento visual. Publicado bajo licencia Apache 2.0, permite uso comercial y es un ejemplo de como la comunidad de codigo abierto esta adaptando modelos VLA de NVIDIA a tareas concretas del mundo real.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en transformer, backbone Cosmos-Reason2-2B |
| Parametros totales | 3.144.016.000 (3.1B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura GR00T N1.7 de NVIDIA, un VLA que toma entradas multimodales (lenguaje e imagenes) y genera acciones de manipulacion. En este fine-tune, el backbone (tanto el LLM como el encoder visual) esta congelado (`tune_llm=False`, `tune_visual=False`), entrenando unicamente las capas de accion.

El entrenamiento se realizo sobre el dataset `carroll511/IKEA_table_assembly` (conversion v2), que contiene grabaciones de un robot Unitree G1 con pinzas Dex1 ensamblando una mesa infantil desde una posicion fija de pie. El espacio de accion es de 16 dimensiones: 7 para el brazo izquierdo (relativo), 7 para el brazo derecho (relativo) y 2 para las pinzas (absoluto). El modelo procesa 3 vistas de camara (`cam_left_high`, `cam_left_wrist`, `cam_right_wrist`) con un horizonte de 40 pasos a 30 Hz.

El entrenamiento se realizo con un batch efectivo de 64 (global 16 x acumulacion 4) durante 20.000 pasos en 2 GPUs A100 con DDP. La configuracion de estado tiene 46 dimensiones, con un orden de claves identico al checkpoint de inicializacion, lo que permite que el encoder de estado se alinee correctamente. La estrategia de inicializacion con un checkpoint previo (round-2) se describe como "BCT warm-start".

## Capacidades
- **Control robotico bimanual**: genera acciones de 16 dimensiones para coordinar dos brazos y dos pinzas simultaneamente.
- **Vision-language-action**: procesa entradas visuales de tres camaras y las convierte en comandos de actuacion.
- **Razonamiento de manipulacion**: especializado en tareas de ensamblaje de muebles (insertar patas, rotar piezas para apretar).
- **Generacion de acciones relativas**: el espacio de accion para los brazos es relativo (delta), lo que facilita la integracion con controladores de bajo nivel.
- **Control de pinza absoluto**: las acciones de las pinzas son absolutas, lo que permite un control preciso del agarre.
- **Ejecucion de tareas de larga duracion**: con un horizonte de 40 pasos a 30 Hz, puede ejecutar secuencias de aproximadamente 1,3 segundos de movimiento.
- **Sin control de cintura**: el modelo no comanda la cintura del robot, ya que los datos de entrenamiento provienen de una posicion fija.

## Casos de uso
- **Ensamblaje automatizado de muebles**: el caso de uso principal. El modelo puede controlar un robot Unitree G1 para ensamblar una mesa infantil, insertando patas en la base, recogiendolas y rotandolas para apretarlas. Su precision de brazo de 1.455 grados (pasos 1-8) lo hace adecuado para operaciones que requieren alineacion fina.
- **Manipulacion bimanual en robotica**: el modelo puede transferirse a otras tareas que requieran coordinacion de dos brazos, como el montaje de piezas pequenas o la manipulacion de objetos flexibles, aunque su especializacion en la tarea IKEA puede limitar la generalizacion.
- **Investigacion en aprendizaje por demostracion**: al ser un modelo abierto con pesos disponibles, puede utilizarse como punto de partida para estudiar tecnicas de fine-tuning en VLA, especialmente la estrategia de "warm-start" con checkpoints intermedios.
- **Desarrollo de sistemas de control de robot en lazo abierto**: el modelo se evalua en modo open-loop, por lo que puede servir como referencia para sistemas de control que requieren prediccion de acciones en un horizonte de tiempo corto.
- **Benchmarking de modelos VLA**: el modelo proporciona metricas de referencia (arm MAE, wrist position error, gripper MAE) que pueden compararse con otros fine-tunes del mismo modelo base en la misma tarea.
- **Entrenamiento de politicas de robot en simulacion**: el modelo puede integrarse en pipelines de aprendizaje por refuerzo como un maestro o como una politica de inicializacion para acelerar el entrenamiento en tareas similares.

## Benchmarks y rendimiento
Se evaluo en el conjunto de validacion `_v2_val` (26 episodios, 697 ventanas, stride 10, 4 pasos de denoising, semilla fija). Los resultados de open-loop son:

| Metrica | checkpoint-20000 | media de 16k/18k/20k |
|---|---:|---:|
| Arm MAE, pasos 1-8 (grados) | 1.455 | 1.457 |
| Arm MAE, todos los 40 pasos (grados) | 3.340 | 3.338 |
| Error de posicion de muñeca, pasos 1-8 (mm) | 12.10 | 12.11 |
| Error de posicion de muñeca, todos los 40 (mm) | 20.96 | 20.98 |
| Gripper MAE | 0.2083 | 0.2104 |

| Tarea | n | Arm (grados) | EE8 (mm) | Gripper |
|---|---:|---:|---:|---:|
| Insertar pata de mesa en la base | 182 | 2.837 | 13.58 | 0.1568 |
| Recoger pata de mesa | 180 | 2.862 | 9.36 | 0.1975 |
| Rotar pata para apretar | 335 | 3.870 | 12.77 | 0.2420 |

El modelo presenta una mejora del -9.9% en la precision de la pinza respecto al baseline, pero una perdida del +1.2% en la precision del brazo. Las metricas de validacion no son comparables con el modelo anterior (`...-30hz-h40`) porque se evaluaron en un split diferente.

## Requisitos de hardware
- **VRAM estimada para inferencia**: no disponible. Con 3.1B parametros en F32, el peso ocupa aproximadamente 12.6 GB en disco. Para inferencia en FP32 se estiman unos 13-14 GB de VRAM, pero no se han publicado datos oficiales.
- **GPU recomendadas**: el entrenamiento se realizo con 2x A100. Para inferencia, una GPU con 24 GB de VRAM (como una RTX 4090) o superior deberia ser suficiente. Una A100 o H100 ofreceria margen para latencias menores.
- **GPU consumer**: si, una RTX 4090 con 24 GB podria alojar el modelo en FP32, aunque se recomienda cuantizar a FP16 o int8 para mayor eficiencia.
- **Opciones de despliegue**: dado que es un modelo de robotica, no se usa con los frameworks de inferencia de texto habituales (vLLM, llama.cpp). Se utiliza en el ecosistema de NVIDIA Isaac GR00T, que proporciona herramientas de despliegue para robotica. El modelo se ejecuta como parte de un pipeline de robotica que procesa imagenes y genera acciones.
- **Latencia y throughput**: no disponible. No se han publicado datos de latencia o throughput para este modelo.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Precision (arm MAE 1-8) |
|---|---|:---:|---|---|---|
| `RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-bctinit` (este modelo) | 3.1B | no disponible | Fine-tune de GR00T-N1.7-3B sobre IKEA v2 | Apache 2.0 | 1.455 grados |
| `CK-Sung/gr00t-n17-g1-ikea-rel-60k` | 3.1B | no disponible | Fine-tune de GR00T-N1.7-3B sobre IKEA (60k pasos) | no disponible | no disponible |
| `nvidia/GR00T-N1.7-3B` (modelo base) | 3.1B | no disponible | Modelo base VLA de NVIDIA | Apache 2.0 | no disponible |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- **Evaluacion open-loop**: el modelo solo se ha evaluado en modo open-loop. Su comportamiento en lazo cerrado sobre hardware real no esta verificado y podria degradarse significativamente.
- **Espacio de accion mixto**: los brazos se controlan con acciones relativas (delta), pero las pinzas se controlan con acciones absolutas. `get_action()` devuelve valores absolutos sin normalizar, lo que requiere un post-procesado cuidadoso.
- **Sin control de cintura**: el modelo no comanda la cintura del robot. Cualquier tarea que requiera movimiento de la base o la cintura no sera soportada.
- **Especializacion limitada**: el modelo esta especializado en la tarea de ensamblaje de la mesa IKEA. No se ha probado en otras tareas y puede no generalizar bien.
- **Dependencia de la inicializacion**: el rendimiento depende de la calidad del checkpoint inicial (BCT warm-start). Si el usuario parte del modelo base, los resultados pueden variar.
- **Riesgo de alucinacion**: como modelo VLA, puede generar acciones incoherentes si la entrada visual o de lenguaje no se corresponde con el contexto de entrenamiento.
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe verificar la licencia de los datasets subyacentes y del modelo base.

## Enlaces
- [HuggingFace: RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-bctinit](https://huggingface.co/RooibosT/gr00t-n1.7-g1-dex1-ikea-relarm-30hz-h40-v2-bctinit)
- [GitHub: NVIDIA/Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T)
- [GitHub: AldrinLake/Isaac-GR00T-N1.7](https://github.com/AldrinLake/Isaac-GR00T-N1.7)
- [HuggingFace: CK-Sung/gr00t-n17-g1-ikea-rel-60k](https://huggingface.co/CK-Sung/gr00t-n17-g1-ikea-rel-60k)
