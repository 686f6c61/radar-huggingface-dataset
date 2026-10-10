# fanqi-robo/groot_n17_insert_gear_in_gripper_lr2x_s1000

## Resumen

`groot_n17_insert_gear_in_gripper_lr2x_s1000` es un ajuste fino del modelo fundacional de robotica `nvidia/GR00T-N1.7-3B`, publicado por el usuario `fanqi-robo` a traves de la libreria LeRobot. No es un modelo de lenguaje generalista, sino una politica visio-lenguaje-accion (VLA) especializada en una unica tarea de manipulacion bimanual: insertar un engranaje en una pinza (`insert_gear_in_gripper`) sobre un montaje YAM bimanual con estado y accion conjuntos de 14 grados de libertad y tres camaras de 720x1280.

El modelo conserva los 3.144.016.000 parametros del GR00T-N1.7-3B original y se ha entrenado sobre el conjunto `fanqi-robo/insert_gear_in_gripper` (50 episodios, 27.228 fotogramas), con validacion sobre 5 episodios retenidos (2.245 fotogramas). Se distribuye bajo la licencia NVIDIA, que restringe el uso a investigacion o evaluacion y prohibe el uso comercial. Es relevante como referencia reproducible de ajuste fino de una politica robotica con cabecera de difusion y como punto de comparacion dentro de un benchmark propio del autor.

El checkpoint publicado en la rama `main` corresponde a la actualizacion 20000 y se define explicitamente como el punto de comparacion del benchmark, no como el de menor perdida de validacion (ese seria el checkpoint de la actualizacion 7659). El repositorio ocupa 25,2 GB y la inferencia declarada tarda 178,1 ms.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (visio-lenguaje-accion) heredada de GR00T-N1.7-3B: vision tower, language model, projector, cabecera de accion de difusion y layer norm VL entrenables |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; parametros fp32 bajo autocast bf16 durante el entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (license_name: nvidia-license): solo investigacion o evaluacion, sin uso comercial |
| Formato de pesos | safetensors |
| Libreria / pipeline | LeRobot 0.6.1; pipeline_tag: robotics |
| Modelo base | nvidia/GR00T-N1.7-3B (revision 2fc962b9) |
| Tarea | insert_gear_in_gripper, YAM bimanual, estado y accion de 14 dimensiones, tres camaras de 720x1280 |
| Chunk de acciones | 40 acciones predichas, 40 ejecutadas |
| Tamano del repositorio | 25,2 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de GR00T-N1.7-3B, un modelo fundacional para robots que combina un componente visio-linguistico (torre de vision, modelo de lenguaje y proyector) con una cabecera de generacion de acciones. En este ajuste fino se entrenaron simultaneamente cinco bloques: el modelo de lenguaje, la torre de vision, el proyector, la cabecera de accion de difusion y la capa de normalizacion VL. La generacion de acciones se formula como flow matching (la perdida de validacion es el error cuadratico medio de flow matching enmascarado de `policy.forward`), y el modelo produce y ejecuta chunks de 40 acciones.

El entrenamiento se realizo durante 20000 actualizaciones del optimizador con un batch efectivo de 32 (32 x 1, una sola GPU), optimizador AdamW y un schedule coseno de diffusers con un calentamiento del 5 % de las actualizaciones y decaimiento hasta 0. La tasa de aprendizaje se fijo en `optimizer_lr=2e-05` (el doble de la tasa inicial, de ahi el sufijo `lr2x`), con semilla 1000 y sin aumento de datos de imagen. La normalizacion de estado y accion usa minimos y maximos del conjunto de entrenamiento recortados a [-1, 1], siguiendo el comportamiento del puerto de LeRobot 0.6.1 para `new_embodiment` (no quantiles q01/q99). Se entreno bajo el slot generico `new_embodiment`; no se conoce preentrenamiento especifico para la plataforma YAM. El entrenamiento consumio 10,2 GPU-horas en una NVIDIA H200, con un pico de VRAM de 87,2 GB.

## Capacidades

- Generacion de acciones motoras: predice chunks de 40 pasos de accion de 14 dimensiones para el montaje YAM bimanual, ejecutandolos de forma consecutiva.
- Percepcion visual multivista: procesa tres camaras simultaneas a 720x1280 como entrada.
- Control bimanual coordinado: maneja estado y accion conjuntos de 14 grados de libertad, incluyendo las dos extremidades y las pinzas.
- Ejecucion de una tarea especifica: insercion de un engranaje en la pinza, aprendida por imitacion (behavior cloning).
- Salida calibrada mediante flow matching: la cabecera de difusion genera trayectorias de accion por muestreo.
- No soporta tool calling ni function calling.
- No implementa agentes ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingues: no disponibles (no es un modelo de proposito conversacional).
- Capacidad especial: politica robotica de imitacion con chunking de acciones, no un modo de razonamiento de texto.

## Casos de uso

- Referencia de benchmark de ajuste fino: sirve como punto de comparacion fijo (checkpoint 20000) frente a otras configuraciones de entrenamiento de la misma tarea, gracias a las curvas de perdida y a la evaluacion en bucle abierto publicadas.
- Baseline para nuevas tecnicas de ajuste: al estar entrenado con tasa 2x y semilla 1000, permite medir el efecto de cambios de hiperparametros (tasa, semilla, aumento de datos) sobre la misma tarea y el mismo dataset.
- Punto de partida para tareas de insercion similares: se puede reajustar sobre otros datasets de montaje con pinza bimanual, reutilizando el conocimiento visio-motor del base GR00T-N1.7-3B.
- Evaluacion de politicas en bucle abierto: la tabla de error de chunk de accion (MAE@10, MAE@30) permite estudiar la degradacion de la prediccion con el horizonte temporal sin necesidad de robot fisico.
- Estudio de normalizacion y representacion de estado/accion: el uso de min/max recortado frente a quantiles permite comparar el impacto de la normalizacion en tareas con acciones de 14 dimensiones.
- Despliegue experimental en brazos YAM bimanuales: en laboratorio y con supervisio humana, para validar la politica en hardware real a partir de las tres camaras de 720x1280.
- Analisis de transferencia sim-a-real y de recogida de datos: el modelo ayuda a dimensionar cuantos episodios (aqui 50) bastan para una tarea de insercion de precision.

## Benchmarks y rendimiento

Evaluacion en bucle abierto sobre los episodios retenidos `villekuosmanen/insert_gear_in_gripper_val` (423 consultas, un fotograma de cada 5), en las unidades articulares del dataset. La linea base `hold` (mantener la pose actual) obtiene MAE@30 = 2,60. Se muestran checkpoints representativos; la curva completa esta en `metrics.jsonl`.

| Update | MAE@10 | MAE@30 | k=1 | k=30 | arm | grip rec | grip dt |
|---|---|---|---|---|---|---|---|
| 851 | 6,14 | 6,39 +/- 0,31 | 5,96 | 6,86 | 0,92 | 0,35 | 3,4 |
| 3404 | 3,42 | 3,82 +/- 0,50 | 3,38 | 4,52 | 0,96 | 0,67 | 4,1 |
| 7659 (mejor val loss) | 2,63 | 3,02 +/- 0,58 | 2,50 | 3,70 | 0,99 | 0,79 | 4,6 |
| 10212 | 2,43 | 2,93 +/- 0,48 | 2,26 | 3,76 | 1,00 | 0,62 | 3,9 |
| 20000 (final, rama main) | 2,41 | 2,86 +/- 0,60 | 2,27 | 3,62 | 1,00 | 0,70 | 4,7 |
| hold (referencia) | no disponible | 2,60 | no disponible | no disponible | no disponible | no disponible | no disponible |

Perdidas del entrenamiento y la validacion:

| Metrica | Valor |
|---|---|
| Perdida de validacion (final, update 20000) | 0,0917025 |
| Mejor perdida de validacion | 0,0478538 (update 7659) |
| Perdida de entrenamiento (ultima ventana) | 0,00479408 |
| Latencia de inferencia | 178,1 ms |
| Pico de VRAM (entrenamiento) | 87,2 GB |

No se han publicado resultados de benchmarks de proposito general (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que es un modelo de robotica y no un LLM. La metrica de validacion es el error cuadratico medio de flow matching enmascarado en modo eval, con un unico sorteo de ruido por batch y semilla fija; sirve para ordenar checkpoints de esta misma ejecucion y no es comparable entre politicas distintas.

## Requisitos de hardware

- VRAM de entrenamiento: 87,2 GB de pico en una NVIDIA H200 (configuracion observada). No cabe en GPUs de consumo para entrenamiento con esta configuracion.
- VRAM de inferencia: no especificada en la informacion disponible. Como referencia orientativa, los 3,144 G de parametros ocupan aproximadamente 6,3 GB en bf16 y aproximadamente 12,6 GB en fp32; a ello hay que sumar las activaciones de la torre de vision para tres camaras de 720x1280, la cache y la cabecera de accion de difusion, por lo que el consumo real sera superior. Estos valores son estimaciones, no datos confirmados.
- GPU recomendadas: H200 (usada para el entrenamiento). Para inferencia, GPU de datacenter (A100, H100, H200) o GPU profesionales con VRAM suficiente; no se dispone de datos confirmados para GPUs de consumo.
- Cabe en GPU de consumo: no confirmado. Con pesos en bf16 y activaciones reducidas podria ser viable en GPUs de gama alta con 24 GB o mas, siempre que la pila de inferencia de la politica lo permita, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: la libreria declarada es LeRobot 0.6.1. Los servidores de inferencia para LLM (vLLM, TGI, llama.cpp, Ollama) no son aplicables a una politica VLA como esta.
- Latencia: 178,1 ms por inferencia declarada por el autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / categoria | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fanqi-robo/groot_n17_insert_gear_in_gripper_lr2x_s1000 (este) | 3.144.016.000 | no disponible | Politica VLA para insert_gear_in_gripper (YAM bimanual) | NVIDIA License (solo investigacion) | HuggingFace (0 descargas, 0 likes en el momento del registro) |
| nvidia/GR00T-N1.7-3B (base) | 3.144.016.000 | no disponible | Modelo fundacional VLA para robots | NVIDIA License | HuggingFace |
| Otras politicas VLA de tamano similar (por ejemplo pi0, OpenVLA) | no disponible | no disponible | Politicas visio-lenguaje-accion | no disponible | no disponible |

No se dispone de resultados de rendimiento comparables entre este ajuste fino y otras politicas, ya que la metrica de perdida de validacion del autor no es comparable entre ejecuciones distintas. La unica comparacion directa disponible es contra la linea base `hold` de la propia tarea, reflejada en la seccion de benchmarks.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo la NVIDIA License, que limita el uso a investigacion o evaluacion y prohibe el uso comercial. Cualquier despliegue en produccion requeriria revisar y negociar la licencia.
- Especificidad de tarea: la politica esta ajustada unicamente para `insert_gear_in_gripper` sobre un montaje YAM bimanual; no se espera transferencia directa a otras tareas o plataformas sin reajuste.
- Rendimiento en bucle abierto frente a la referencia: en el horizonte de 30 pasos, el checkpoint final obtiene MAE@30 = 2,86, un valor peor que la linea base trivial `hold` (2,60). Esto indica que, a ese horizonte, la prediccion del chunk no supera a mantener la pose actual y hay que interpretar el resultado con cautela.
- Seleccion de checkpoint: la rama `main` contiene el checkpoint final (update 20000) con perdida de validacion 0,0917, mientras que el mejor checkpoint (update 7659) tiene 0,0479. El checkpoint publicado no es el de menor perdida de validacion.
- Riesgo de sobreajuste y de datos limitados: el ajuste se hizo con solo 50 episodios y 27.228 fotogramas, sin aumento de datos de imagen, lo que reduce la diversidad y puede provocar sobreajuste a las condiciones concretas de recogida.
- Sin preentrenamiento especifico de la plataforma: se entreno bajo el slot generico `new_embodiment` y no se conoce preentrenamiento especifico para YAM, lo que puede limitar la generalizacion.
- Normalizacion por min/max: el uso de minimos y maximos (en lugar de quantiles q01/q99) hace la politica sensible a valores atipicos en el estado o la accion.
- Naturaleza de la validacion: la perdida de validacion es el error de flow matching en modo eval, sin dropout, con un unico sorteo de ruido y semilla fija; no es comparable con otras politicas y no mide directamente la tasa de exito en el mundo real.
- Idiomas y capacidades conversacionales: no disponibles; no es un modelo de texto generalista.
- Advertencia general de robotica: no se recomienda su uso sin supervisio humana y sin medidas de seguridad, dado el riesgo fisico de un brazo bimanual en operacion real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fanqi-robo/groot_n17_insert_gear_in_gripper_lr2x_s1000
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Dataset de entrenamiento: https://huggingface.co/datasets/fanqi-robo/insert_gear_in_gripper
- Dataset de validacion: https://huggingface.co/datasets/villekuosmanen/insert_gear_in_gripper_val
- Ejecucion en Weights & Biases: https://wandb.ai/fanqi-robo-saferobotics/insert_gear_in_gripper_benchmark/runs/6uuvhcnq
