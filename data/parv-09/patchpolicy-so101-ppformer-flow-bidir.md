# Parv-09/patchpolicy-so101-ppformer-flow-bidir

## Resumen

El modelo `patchpolicy-so101-ppformer-flow-bidir`, desarrollado por Parv-09, es una política visuomotora para el brazo robótico SO-101, entrenada mediante aprendizaje por imitación. Su arquitectura combina un trunk DINOv2 ViT-S/14 congelado que extrae tokens de parche densos de tres cámaras, y un head transformer de política de parche (Patch Policy transformer) que predice secuencias de acciones articulares usando *flow matching* con atención bidireccional entre tokens de acción. El modelo forma parte de una ablación controlada de ocho variantes que comparten trunk, datos, semilla y optimizador, diferenciándose únicamente en el head de acción y el patrón de atención.

Con aproximadamente 31,6 millones de parámetros totales (22,1 M del trunk congelado y 9,5 M entrenables), el modelo procesa observaciones de 3 cámaras en 2 instantes temporales, generando un chunk de 24 pasos de 6 articulaciones en grados. Su relevancia radica en demostrar que la atención bidireccional en el head de acción supera consistentemente a la causal en todas las configuraciones evaluadas, y que el enfoque Patch Policy con *flow matching* aventaja a arquitecturas expert de mayor profundidad. Está publicado bajo licencia Apache-2.0 y utiliza el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (trunk congelado) + Patch Policy transformer (head) con flow matching |
| Parametros totales | 31 588 614 (22 056 576 trunk + 9 532 038 head) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vision para robotica; procesa 2 timesteps x 3 camaras) |
| Tipos de cuantizacion | No disponible (checkpoint en formato pickle de PyTorch) |
| Idiomas soportados | No disponible (no es modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | Pickle (nn.Module completo) |

## Arquitectura y entrenamiento

La arquitectura se compone de dos bloques diferenciados. El trunk es un DINOv2 ViT-S/14 preentrenado y congelado (22 056 576 parámetros, 0 entrenables) que procesa cada imagen de 210x280 píxeles, dividiéndola en parches de 14x14 y produciendo 300 tokens de 384 dimensiones por cámara. Las tres cámaras (muñeca, frontal y superior) generan 900 tokens de parche, a los que se añade un token de estado, formando una memoria de 901 tokens por frame. Con dos timesteps de entrada, la memoria total es de 1802 tokens (B, 1802, 384). El head es un transformer de política de parche con atención bidireccional entre tokens de acción, entrenado con el objetivo de *flow matching*. Predice 48 pasos de acción (6 articulaciones en grados) y devuelve los primeros 24 para ejecución.

El entrenamiento se realizó sobre el dataset `phi_so101_cubes_cylinder_recovery_v1`, compuesto por 143 episodios (120 de teleoperación y 23 de recuperación ante fallos), con 81 943 fotogramas a 30 fps y 3 cámaras. Se usaron 113 episodios para entrenamiento y 30 para validación. Los hiperparámetros incluyen semilla 1000, batch de 64, 29 épocas (29 493 pasos), optimizador Adam con betas (0.9, 0.95), tasa de aprendizaje 1e-4 con decaimiento coseno y 500 pasos de calentamiento, weight decay 1e-6, grad clip 10.0 y EMA. Se aplicó recorte aleatorio en entrenamiento y recorte central en evaluación. La pérdida final de entrenamiento fue 0.019813 y la pérdida held-out 0.042783.

## Capacidades

- Control visuomotor por imitacion: genera secuencias de acciones articulares (24 pasos x 6 articulaciones) a partir de observaciones visuales de 3 camaras.
- Manejo de multiples camaras: procesa simultaneamente imagenes de camara de muñeca, frontal y superior, con un orden fijo de canales.
- Prediccion de chunks de accion: produce 48 pasos y ejecuta los primeros 24, lo que permite movimientos suaves y anticipatorios.
- Aprendizaje de recuperacion ante fallos: el dataset incluye episodios de recovery, lo que permite al modelo corregir errores durante la ejecucion.
- Atencion bidireccional en el head de accion: mejora la coherencia temporal de las acciones predichas frente a la atencion causal.
- Integracion con LeRobot: compatible con el ecosistema de robotica de Hugging Face.
- Entrenamiento con flow matching: utiliza un objetivo generativo moderno que modela la distribucion de acciones condicionada a la observacion.

## Casos de uso

- Manipulacion de objetos en entornos controlados: el modelo puede ejecutar tareas de recoger y recolocar cubos y cilindros sobre una superficie, usando las tres camaras para localizar y alcanzar los objetos. Es adecuado porque su chunk de 24 pasos permite movimientos precisos y su atencion bidireccional mantiene la coherencia de la trayectoria.
- Aprendizaje por imitacion con recuperacion de fallos: gracias a los 23 episodios de recovery incluidos en el dataset, el modelo puede aprender a reaccionar ante errores de agarre o desplazamiento, siendo util para desplegar politicas robustas en entornos reales sin necesidad de un simulador.
- Evaluacion de arquitecturas de accion en robotica: al ser parte de una ablacion controlada de 8 brazos, este checkpoint sirve como referencia para comparar el impacto de la atencion bidireccional frente a la causal, y del head Patch Policy frente a variantes expert, en igualdad de condiciones de datos y entrenamiento.
- Investigacion en flow matching para politicas visuomotoras: el modelo constituye un ejemplo practico de aplicacion de flow matching a control robotico, permitiendo estudiar sus ventajas frente a objetivos DDPM en terminos de perdida held-out y estabilidad de entrenamiento.
- Control de brazo robotico en tiempo real: con una memoria de 1802 tokens por frame y un head ligero de 9,5 M parametros, el modelo puede ejecutar inferencia a frecuencias compatibles con control en bucle cerrado, siempre que se disponga de una GPU con suficiente capacidad.
- Benchmarking de politicas visuomotoras: investigadores pueden usar este checkpoint como punto de comparacion para nuevas arquitecturas de accion, ya que se publican las perdidas de entrenamiento y held-out junto con los hiperparametros completos.

## Benchmarks y rendimiento

El autor publica resultados de perdida held-out para las 8 variantes de la ablacion, con la atencion bidireccional ganando en todos los pares:

| Par (head + objetivo) | Perdida causal | Perdida bidireccional |
|---|---|---|
| ppformer + DDPM | 0.037980 | **0.016703** |
| ppformer + flow | 0.067604 | **0.042783** |
| expert8w288 + flow | 0.079359 | **0.051919** |
| expert16w216 + flow | 0.081903 | **0.052711** |

Entre las tres variantes con flow matching (mismo objetivo de perdida), el Patch Policy transformer supera a ambas configuraciones expert, y duplicar la profundidad expert no mejoro los resultados. No se han publicado metricas de exito de tarea en el mundo real, ya que SO-101 no dispone de simulador.

## Requisitos de hardware

- VRAM estimada: el modelo completo tiene ~31,6 M parametros, lo que en FP32 ocupa ~126 MB. Con el batch de inferencia tipico (B=1) y las entradas de imagen, la memoria total necesaria es inferior a 1 GB, por lo que cabe en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU de consumo moderna (NVIDIA RTX 3060 o superior) es suficiente para inferencia. Para entrenamiento desde cero, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060 Ti o superior).
- Compatibilidad con consumer GPU: si, el modelo es ligero y puede ejecutarse en GPUs de gama media.
- Opciones de despliegue: al ser un checkpoint pickled de PyTorch, el despliegue requiere un entorno Python con PyTorch y las clases del modelo importables. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje. Se puede usar con LeRobot o con un script de inferencia propio.
- Latencia y throughput: no se han publicado datos de latencia. Dado el tamano del modelo y la memoria de 1802 tokens, se estima una inferencia en el orden de milisegundos en una GPU moderna, suficiente para control en tiempo real.

## Comparativa con modelos similares

No se dispone de modelos publicos directamente comparables para el brazo SO-101 en la informacion proporcionada. La propia ablacion interna del autor sirve como comparativa de referencia:

| Variante | Head | Objetivo | Atencion | Perdida held-out |
|---|---|---|---|---|
| patchpolicy-so101-ppformer-flow-bidir | Patch Policy transformer | flow matching | bidireccional | **0.042783** |
| patchpolicy-so101-ppformer-flow-causal | Patch Policy transformer | flow matching | causal | 0.067604 |
| patchpolicy-so101-expert8w288-flow-bidir | Expert (8 capas, 288 dim) | flow matching | bidireccional | 0.051919 |
| patchpolicy-so101-expert16w216-flow-bidir | Expert (16 capas, 216 dim) | flow matching | bidireccional | 0.052711 |

No se han encontrado modelos de terceros con la misma tarea y hardware en la informacion disponible.

## Limitaciones y advertencias

- Resultados con una sola semilla (1000): no hay barras de error ni analisis de variabilidad, por lo que las diferencias entre variantes podrian no ser estadisticamente significativas.
- La perdida held-out no equivale a exito de tarea: SO-101 no tiene simulador, por lo que la validacion real requiere despliegues fisicos en el brazo.
- No se deben comparar directamente las perdidas de DDPM y flow matching: minimizan objetivos distintos, y un valor numerico menor no implica una mejor politica.
- El checkpoint es un objeto pickled de PyTorch: requiere que las clases del modelo sean importables en el entorno de ejecucion, lo que limita su portabilidad fuera del repositorio companion.
- El orden de las camaras es fijo: cada camara tiene asignada una porcion de tokens en la memoria; intercambiarlas produce entradas incorrectas.
- No es un modelo generalista: esta entrenado exclusivamente para el brazo SO-101 y la tarea de manipulacion de cubos y cilindros; no es transferible a otros robots o tareas sin reentrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero el codigo companion debe mantener la atribucion correspondiente.

## Enlaces

- HuggingFace: https://huggingface.co/Parv-09/patchpolicy-so101-ppformer-flow-bidir
- Repositorio companion con codigo e `infer.py`: mencionado en la model card, pero no se proporciona URL explicita en la informacion disponible.
