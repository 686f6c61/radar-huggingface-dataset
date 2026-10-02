# LancerLSY/sentinel-smolvla-so100

## Resumen

Sentinel SmolVLA SO100 es un *overlay* entrenable evaluado sobre el modelo base SmolVLA, orientado a la predicción de acciones para el brazo robótico SO100 en tareas de tipo PickPlace. Lo desarrolla LancerLSY dentro de la línea de trabajo Sentinel-EVC y se apoya en el ecosistema LeRobot. No es un modelo independiente: adapta únicamente el *action expert* y las proyecciones de estado/acción, manteniendo congelado el *backbone* visión-lenguaje subyacente, por lo que requiere descargar por separado el modelo base y el VLM original para poder cargarse.

El modelo parte de `lerobot/smolvla_base` como base fijada y de `HuggingFaceTB/SmolVLM2-500M-Video-Instruct` como *backbone* visión-lenguaje, con revisiones de commit concretas. Se ha afinado sobre el *dataset* `lerobot/svla_so100_pickplace` mediante 5.000 actualizaciones de optimizador con batch 8 y autocast en bfloat16, resultando en 99.880.992 parámetros entrenables. La evaluación emparejada reporta una reducción del MAE de acción normalizada del 63,46 % frente al modelo base, aunque el propio autor advierte que esa métrica mide reconstrucción de acciones y no éxito de tarea.

Su relevancia actual reside en que ejemplifica el patrón de afinado eficiente de VLA compactos sobre hardware de consumo: el entrenamiento se realizó en una RTX 4090 D de 24 GB y la inferencia medida ofrece latencias P50/P95 de 229,26/236,90 ms por bloque de acción de 50×6. Es, por tanto, un artefacto de investigación reproducible antes que un *policy* listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action): backbone VLM SmolVLM2-500M + action expert entrenado con flow matching |
| Parametros totales | no disponible (overlay entrenable de 99.880.992 parametros sobre el base congelado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`trainable_state.pt`); el bundle no incluye los pesos congelados del upstream |

## Arquitectura y entrenamiento

SmolVLA es un VLA compacto formado por un VLM preentrenado de tamano reducido y un *action expert* entrenado con *flow matching*. Dada una o varias imagenes y una instruccion en lenguaje natural, el modelo emite un *chunk* de acciones; en este caso, un bloque de 50×6 correspondiente a 50 pasos de accion con 6 grados de libertad por paso. En esta variante Sentinel, el *backbone* vision-lenguaje (SmolVLM2-500M-Video-Instruct) permanece congelado y solo se entrenan el *action expert* y las proyecciones de estado/accion. El bundle incluye el *overlay* seleccionado, metadatos de caracteristicas originales, estadisticas de normalizacion calculadas solo con datos de entrenamiento, identidades de split/run y el codigo de carga y evaluacion; excluye el estado del optimizador y del RNG, los videos originales y los pesos congelados del upstream.

El entrenamiento se realizo sobre el dataset `lerobot/svla_so100_pickplace` (revision fijada `728583b5eaf9e739a7f119e2def466fa1d552402`) con 5.000 actualizaciones de optimizador, batch 8, *autocast* en bfloat16 y 99.880.992 parametros entrenables. La seleccion por *dev* eligio la actualizacion 3750 con una perdida de 0,161077. El reparto de episodios fue de 30 de entrenamiento, 5 de *dev*, 10 de calibracion reservada y 5 de test, con normalizacion ajustada unicamente sobre datos de entrenamiento. La evaluacion emparejada de *held-out* compara el modelo base fijado (MAE de accion nativa 13,321098; MAE/desviacion estandar de accion de entrenamiento 0,673166) con el *fine-tune* seleccionado (MAE 4,472850; ratio 0,245984), lo que supone una reduccion del 63,46 % del MAE normalizado. Cinco episodios *held-out* contienen 1.926 ventanas solapadas, con el episodio como unidad independiente. Las unidades fisicas nativas del dataset estan sin declarar.

## Capacidades

- Prediccion de acciones roboticas: genera *chunks* de accion de forma [1,50,6] para el brazo SO100, integrando dos camaras (`observation.images.top` y `observation.images.wrist`), imagenes CHW RGB, seis campos de estado y una instruccion de tarea en lenguaje.
- Condicionamiento por lenguaje: acepta instrucciones textuales de tarea junto a las observaciones visuales y de estado.
- Percepcion visual multi-camara: consume la vista superior y la de muneca en el orden de canales especificado.
- Inferencia offline verificable: el cargador comprueba los hashes de los ficheros upstream, los enlaces entre fuente y *checkpoint*, la normalizacion calculada solo con datos de entrenamiento y los 155 tensores exactos del overlay.
- *Fine-tuning* eficiente sobre base congelada: demuestra la adaptacion de solo el *action expert* y las proyecciones, sin reentrenar el VLM.
- No consta soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso ni modo de pensamiento.
- No se declaran capacidades multilingues ni idiomas soportados.

## Casos de uso

- Investigacion en VLA compactos: reproducir el afinado de SmolVLA sobre el dataset SVLA SO100 PickPlace para estudiar la transferencia de un VLM congelado a tareas de manipulacion, dado que el bundle documenta revisiones, hashes y splits.
- Evaluacion de reconstruccion de acciones: usar la metrica de MAE emparejada frente al modelo base para medir la mejora del *action expert* sin tocar el *backbone*.
- Prototipado en hardware de consumo: entrenar y ejecutar variantes sobre una unica GPU de 24 GB (RTX 4090 D), con latencia de inferencia medida inferior a 240 ms por *chunk* en configuracion de cuatro hilos y batch uno.
- Bancos de pruebas de PickPlace: ejercitar politicas entrenadas sobre `svla_so100_pickplace` en entornos simulados o de laboratorio, siempre con validacion empirica de exito de tarea, ya que el modelo no lo mide.
- Comparacion de estrategias de normalizacion: aprovechar las estadisticas calculadas solo con entrenamiento para estudiar el efecto de la normalizacion sobre la estabilidad del afinado.
- Integracion en pipelines de investigacion en robotica: emplear el cargador `load_smolvla_overlay.py` para verificar integridad de artefactos antes de conectar la politica a un controlador.
- Estudio de latencia en borde: usar los percentiles P50/P95 como referencia para dimensionar requisitos de control en tiempo cuasi real.

## Benchmarks y rendimiento

| Metrica | Base original (fijado) | Fine-tune seleccionado |
|---|---:|---:|
| MAE de accion nativa | 13,321098 | 4,472850 |
| MAE / desviacion estandar de accion de entrenamiento | 0,673166 | 0,245984 |

Reduccion del MAE de accion normalizado: 63,46 % en una evaluacion emparejada *held-out* (5 episodios, 1.926 ventanas solapadas, unidad independiente = episodio, objetivo con *padding* excluido). Estas cifras miden reconstruccion de acciones, no tasa de exito de tarea ni precision fisica sobre robot. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- GPU de entrenamiento utilizada: RTX 4090 D con 24 GB.
- VRAM estimada para inferencia: no declarada de forma explicita; el entrenamiento se completo en 24 GB y la inferencia usa batch uno. RTX 5090 figura como objetivo futuro sin mediciones.
- GPU recomendadas: la unica configuración con datos verificados es RTX 4090 D (24 GB). Otras GPU no estan medidas.
- Inferencia en GPU de consumo: si, con al menos 24 GB segun la configuracion de entrenamiento documentada (no se confirma el minimo exacto para inferencia).
- Software de despliegue: `lerobot[smolvla]==0.6.1` con Python 3.12 o superior y PyTorch 2.8.0+cu128. Se usa un cargador propio (`load_smolvla_overlay.py`); el bundle no es un directorio `from_pretrained` autonomo. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia medida: P50/P95 de 229,26/236,90 ms en inferencia imagen-a-accion con cuatro hilos, batch uno y datos en memoria, incluyendo preprocesado y desnormalizacion, excluyendo decodificacion de video, transporte y actuacion.
- *Throughput*: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base / backbone | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Sentinel SmolVLA SO100 (LancerLSY) | Overlay entrenable | lerobot/smolvla_base + SmolVLM2-500M | 99.880.992 entrenables (total no disponible) | no disponible | Apache-2.0 | Bundle en HuggingFace, requiere upstream por separado |
| `lerobot/smolvla_base` | Policy VLA | SmolVLM2 | no disponible | no disponible | Apache-2.0 | HuggingFace / LeRobot |
| Beilinghamburger/smolvla_so100_vla | Fine-tune SmolVLA | SmolVLA | no disponible | no disponible | no disponible | HuggingFace (via LeRobot) |
| lucarrr/smolvla_so100_finetuned | Fine-tune SmolVLA | SmolVLA | no disponible | no disponible | no disponible | HuggingFace |

La comparacion de rendimiento entre estas variantes no esta disponible: no se han publicado metricas comunes en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion offline: no se ha establecido tasa de exito de tarea, seguimiento multiobjeto ni integracion en tiempo de ejecucion con permisos de Sentinel.
- No es autonomo: requiere descargar por separado el modelo base y el VLM *backbone*; el bundle excluye los pesos congelados del upstream.
- Las metricas de MAE miden reconstruccion de acciones y no precision fisica sobre el robot; las unidades fisicas nativas del dataset estan sin declarar.
- Los resultados del estudio de simulacion con UR5e usan su propio controlador y no deben atribuirse a esta politica SO100.
- Evaluacion limitada: 5 episodios *held-out* y una unica evaluacion emparejada; la propia model card califica el resultado como «one paired held-out evaluation».
- Riesgo de sobreajuste al dataset especifico `lerobot/svla_so100_pickplace` y al brazo SO100; no se documenta generalizacion a otras tareas, objetos o robots.
- Sesgos conocidos: no documentados.
- Riesgo de alucinacion: no documentado para la salida de acciones; el modelo no genera texto libre.
- Limitaciones de contexto e idioma: no declaradas.
- Licencia Apache-2.0 en el modelo; los componentes upstream (SmolVLA, SmolVLM2, dataset) son Apache-2.0, y el codigo de carga/entrenamiento de Sentinel es MIT. Se desconoce si existe alguna restriccion adicional para uso comercial de la politica entrenada.
- Para produccion: exige Python 3.12+, `lerobot[smolvla]==0.6.1` y una compilacion CUDA compatible con el *host*; el *placeholder* de accion cero del ejemplo es un campo de preprocesado, no un comando de motor ni una observacion futura, por lo que no debe reutilizarse como tal.
- Orden de camaras obligatorio (`observation.images.top` y despues `observation.images.wrist`), imagenes CHW RGB, seis campos de estado e instruccion de tarea para que la inferencia sea valida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LancerLSY/sentinel-smolvla-so100
- Informe de resultados y limitaciones: https://github.com/LancerLSY/sentinel-evc-lab/blob/main/docs/gpu_training_results.md
- Artefactos originales: https://github.com/LancerLSY/sentinel-evc-lab/releases/tag/gpu-experiments-20261002
- Instrucciones de entrenamiento: https://github.com/LancerLSY/sentinel-evc-lab/tree/main/experiments/gpu
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Backbone VLM: https://huggingface.co/HuggingFaceTB/SmolVLM2-500M-Video-Instruct
- Dataset: https://huggingface.co/datasets/lerobot/svla_so100_pickplace
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion LeRobot: https://huggingface.co/docs/lerobot
- Repositorio de practicas SmolVLA/SO100: https://github.com/l2ktech/smolvla_project/tree/master/
- Fine-tune comunitario Beilinghamburger/smolvla_so100_vla: https://huggingface.co/Beilinghamburger/smolvla_so100_vla
- Fine-tune comunitario lucarrr/smolvla_so100_finetuned: https://huggingface.co/lucarrr/smolvla_so100_finetuned
