# snupilab/theta-bench-act-sim-3003

## Resumen

THETA Bench ACT es un checkpoint de policy de robotica entrenado en simulacion dentro del benchmark THETA. Lo publica el equipo snupilab y corresponde a la etapa de entrenamiento con 3.003 segmentos, con un objetivo de 40.000 actualizaciones del optimizador. El repositorio contiene el checkpoint final validado de un entrenamiento ACT (Action Chunking Transformer) orientado a manipulacion condicionada por lenguaje, segun se deduce de las dependencias que declara la model card (openai/clip-vit-large-patch14 y torchvision ResNet18).

El modelo resuelve el problema de generar acciones de control a partir de observaciones y una instruccion en lenguaje natural, empleando el dataset de teleoperacion `snupilab/theta-bench-teleop` (1.200 demostraciones exitosas L1/L2 y 1.803 prefijos L0 extraidos, repartidos en 18 condiciones). Es relevante porque forma parte de una linea de checkpoints de referencia para reproducir resultados de THETA Bench, aunque no se reclama ninguna puntuacion de evaluacion con su publicacion.

Se distribuye unicamente en safetensors (0,2 GB de repositorio) y no es compatible con cargadores genericos de Transformers ni con cargadores de simulacion arbitrarios: requiere el adaptador nativo THETA y dependencias fijadas a commits concretos. No se especifica licencia, el autor no reporta descargas ni valoraciones y el unico idioma declarado es el ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) para robotica; la model card referencia un backbone de vision ResNet18 y condicionamiento por lenguaje con openai/clip-vit-large-patch14 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la longitud de secuencia de acciones no se especifica) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Pipeline (HuggingFace) | robotics |
| Etapa de entrenamiento | Simulacion, 3.003 segmentos |
| Actualizaciones objetivo del optimizador | 40.000 |
| Batch por GPU / GPUs / batch global | 16 / 8 / 128 |
| Acumulacion de gradiente | 1 |
| Condiciones por batch global | 18 |
| Revision del dataset | 8b2cd31e107b64cb13f812ea217a63a20845c78a |

## Arquitectura y entrenamiento

La model card identifica el componente como un constructor ACT, lo que situa el checkpoint dentro de la familia Action Chunking Transformer: una policy que predice fragmentos de acciones (chunks) en lugar de acciones individuales, con un backbone de vision ResNet18 y condicionamiento por lenguaje mediante CLIP ViT-L/14. El constructor ACT solicita explicitamente `torchvision ResNet18_Weights.IMAGENET1K_V1` antes de la carga estricta del estado entrenado, y la card exige precargar `openai/clip-vit-large-patch14` en el commit `32bd64288804d66eefd0ccbe215aa642df71cc41`. No se detalla si el entrenamiento incluyo RLHF, DPO u otras fases de ajuste; tampoco se especifica el numero total de tokens ni la composicion exacta del dataset mas alla del desglose por niveles.

Los datos proceden del dataset `snupilab/theta-bench-teleop`, fijado a la revision `8b2cd31e107b64cb13f812ea217a63a20845c78a`. El pool de simulacion comprende 1.200 demostraciones exitosas L1/L2 y 1.803 prefijos L0 extraidos, en 18 condiciones; la card advierte de forma explicita que los 3.003 segmentos no equivalen a 3.003 demostraciones independientes. El entrenamiento empleo optimizadores de modelo independientes y ejecucion compartida de GPU a traves de MPS, y la publicacion se realizo desde un cargador de CPU tras la validacion final del checkpoint.

## Capacidades

- Generacion de acciones de control para robotica de manipulacion a partir de observaciones visuales.
- Condicionamiento por lenguaje: la card menciona un "language-conditioning receipt" obligatorio en `launch.json`, lo que implica que las instrucciones en lenguaje natural forman parte de la entrada del modelo.
- Prediccion por chunks de acciones (patron propio de ACT), que reduce el coste de inferencia en bucle cerrado frente a politicas paso a paso.
- Entrenamiento en simulacion con Mujoco (etiqueta `mujoco`), orientado a tareas del benchmark THETA.
- Normalizacion serializada: se conservan los limites de normalizacion y el `dataset_statistics.json` para la resolucion explicita durante la ejecucion.
- No se documentan capacidades de tool calling, function calling, agentes, vision general, audio ni modo de razonamiento; son funciones fuera del ambito de una policy de robotica.

## Casos de uso

- Evaluacion reproducible del benchmark THETA: permite reproducir el checkpoint final de la etapa de 3.003 segmentos usando el adaptador nativo y el directorio `run` con el paso 40000, sin necesidad de reentrenar.
- Manipulacion simulada condicionada por lenguaje: el modelo puede recibir instrucciones en ingles y generar chunks de acciones en entornos Mujoco, util para prototipar tareas antes de trasladarlas a hardware.
- Generacion de datos sinteticos de politica: usar las trayectorias producidas en simulacion para aumentar datasets de teleoperacion existentes o comparar distribuciones de acciones.
- Investigacion en sim-to-real: el checkpoint sirve como punto de partida para estudiar la transferencia de politicas entrenadas en simulacion a robots fisicos, dado que se distribuye con estadisticas de normalizacion conservadas.
- Comparacion de etapas de entrenamiento: al fijar la revision del dataset y el numero de actualizaciones (40.000), se puede contrastar frente a otros checkpoints THETA con distinto numero de segmentos o condiciones.
- Reproducibilidad de pipelines de entrenamiento: los hiperparametros conocidos (batch por GPU 16, 8 GPU, batch global 128, 18 condiciones por batch global) permiten auditar o replicar la configuracion de entrenamiento.
- Integracion en entornos de evaluacion internos: al requerir el adaptador THETA y dependencias fijadas, encaja en pipelines controlados de CI para validar checkpoints de robotica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se reclama ninguna puntuacion de evaluacion con la publicacion del checkpoint, por lo que no se presentan cifras de MMLU, HumanEval, GSM8K ni metricas especificas de manipulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El unico dato de ejecucion mencionado es el uso de ejecucion compartida de GPU a traves de MPS durante el entrenamiento, no en inferencia.
- Compatibilidad con GPU de consumo: no disponible. El tamano del repositorio (0,2 GB) corresponde unicamente a los pesos en safetensors y no permite por si solo determinar el consumo de memoria en ejecucion.
- Dependencias obligatorias: codigo fuente de Psi0 fijado, adaptador THETA y precarga de `openai/clip-vit-large-patch14` (commit `32bd64288804d66eefd0ccbe215aa642df71cc41`) y de `torchvision ResNet18_Weights.IMAGENET1K_V1`.
- Formato de carga: estructura `run/checkpoints/ckpt_40000`; adaptador nativo THETA con directorio `run` y paso 40000.
- Opciones de despliegue: no se mencionan vLLM, llama.cpp, Ollama ni TGI; la card excluye explicitamente la compatibilidad con cargadores genericos de Transformers y con cargadores de simulacion arbitrarios.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye referencias a otros checkpoints de THETA Bench ni a politicas ACT comparables con parametros, contexto, rendimiento o licencia publicados, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican condiciones de uso comercial, redistribucion ni modificacion.
- Unico idioma declarado: ingles. No hay soporte multilingue documentado.
- Sin puntuacion de evaluacion: el autor no reclama metricas, por lo que el rendimiento real de la policy no esta acreditado.
- Compatibilidad restringida: la card advierte que el repositorio no sustituye una policy preentrenada upstream y que no es compatible con cargadores genericos de Transformers ni de simulacion.
- Dependencias fijadas a commits y rutas concretas (`run/checkpoints/ckpt_40000`, `launch.json`, `dataset_statistics.json`); cualquier desviacion puede impedir la carga o alterar la normalizacion.
- Los 3.003 segmentos no son 3.003 demostraciones independientes: 1.200 son demostraciones L1/L2 y 1.803 prefijos L0 extraidos, lo que puede introducir correlacion en los datos.
- Riesgo de brecha sim-to-real: al tratarse de entrenamiento en simulacion (Mujoco), el comportamiento en un robot fisico no esta garantizado.
- No se documentan sesgos especificos ni tasas de alucinacion; en el contexto de robotica, el riesgo se traduce en acciones fuera de distribucion o fallos de manipulacion.
- Modelo con 0 descargas y 0 valoraciones en el momento de la consulta, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snupilab/theta-bench-act-sim-3003
- Dataset de teleoperacion: https://huggingface.co/datasets/snupilab/theta-bench-teleop
- Revision fijada del dataset: https://huggingface.co/datasets/snupilab/theta-bench-teleop/tree/8b2cd31e107b64cb13f812ea217a63a20845c78a/raw
- Dependencia de condicionamiento por lenguaje (CLIP ViT-L/14, commit indicado): https://huggingface.co/openai/clip-vit-large-patch14/tree/32bd64288804d66eefd0ccbe215aa642df71cc41
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
