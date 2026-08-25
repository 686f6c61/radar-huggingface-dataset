# openroboto-ai/lingbot-vla-v2-6b-libero-goal7

## Resumen

LingBot-VLA 2.0 6B — LIBERO Goal-7 es un checkpoint de post-entrenamiento del modelo fundacional de visión-lenguaje-acción (VLA) LingBot-VLA 2.0, desarrollado por openroboto-ai sobre la base `robbyant/lingbot-vla-v2-6b`. Este modelo está específicamente ajustado para la tarea `turn on the stove` del benchmark LIBERO, utilizando únicamente 50 demostraciones estándar (4.454 fotogramas) del dataset `lerobot/libero`. Su propósito principal es demostrar que el modelo base puede ser fine-tuneado y servido a través del validador OpenRoboto con éxito real en rollouts de LIBERO-Pro, sirviendo como prueba de concepto para pipelines de entrenamiento y evaluación de VLA.

Con 6.375.907.511 parámetros (aproximadamente 6,38 mil millones), el modelo emplea una arquitectura de transformer multimodal que combina percepción visual, comprensión de lenguaje y generación de acciones de bajo nivel. Aunque el checkpoint está deliberadamente sobreajustado a una única tarea, su relevancia radica en validar la viabilidad de fine-tuning eficiente sobre LingBot-VLA 2.0 y en documentar defectos corregidos en el pipeline de entrenamiento, como el filtrado de episodios y el enmascarado de pérdida para acciones de padding.

La licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace accesible para investigación y desarrollo en robótica. Sin embargo, no es un modelo generalista: su rendimiento se limita a la tarea específica para la que fue entrenado, y no debe interpretarse como una solución completa para LIBERO o LIBERO-Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, con backbone de lenguaje y vision (probablemente Qwen3-VL-4B como procesador/tokenizer, no confirmado) |
| Parametros totales | 6.375.907.511 (6,38 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (6 shards) |

## Arquitectura y entrenamiento

LingBot-VLA 2.0 es un modelo fundacional de visión-lenguaje-acción diseñado para pasar de un pre-entrenamiento a gran escala a aplicaciones robóticas reales. La arquitectura combina un codificador visual, un modelo de lenguaje (posiblemente basado en Qwen3-VL-4B, segun se infiere del requisito de cargar ese modelo para el procesador/tokenizer) y un head de accion unificado de 55 dimensiones. En este checkpoint, la accion se define como un delta relativo del efector final de 7D (xyz + axis-angle + gripper) y el estado como 8D (eef xyz + axis-angle + gripper qpos). Se utilizan dos camaras: `camera_top` (vista del agente) y `camera_wrist` (eye-in-hand), con un action chunk de 50 pasos.

El entrenamiento se realizo sobre 50 episodios de la tarea goal task 7 del dataset LIBERO, con un batch efectivo de 7 distribuido en 7 GPUs A100 de 80 GB. Se libero el checkpoint en el paso 1200, tras corregir dos defectos en el pipeline: el filtrado de episodios de LeRobot comparaba un indice de muestra relativo contra limites absolutos de episodio, y `action_is_pad` no se aplicaba a la mascara de perdida del VLA. El checkpoint final incluye 200 actualizaciones corregidas tras reanudar en el paso 1000 con un nuevo programa de tasa de aprendizaje. No se menciona el uso de RLHF o DPO; el entrenamiento es de fine-tuning supervisado estandar.

## Capacidades

- Ejecucion de tareas de manipulacion robotica de un solo brazo, especificamente encender una estufa en el entorno LIBERO.
- Percepcion visual multimodal a partir de dos camaras (vista del agente y eye-in-hand).
- Comprension de instrucciones en lenguaje natural para guiar la politica de acciones.
- Generacion de secuencias de acciones de 7D (posicion, orientacion y apertura del gripper) con un horizonte de 50 pasos.
- Integracion con el validador OpenRoboto para evaluacion de rollouts en bucle cerrado.
- Capacidad de fine-tuning sobre el modelo base LingBot-VLA 2.0, demostrando que el checkpoint puede adaptarse a tareas especificas con pocos datos.
- No incluye soporte para tool calling, agentes conversacionales ni razonamiento de alto nivel; su funcion es puramente motora y perceptiva.

## Casos de uso

- Investigacion en fine-tuning de VLA: este checkpoint sirve como referencia para estudiar como adaptar un modelo fundacional de VLA a una tarea concreta con un numero reducido de demostraciones, incluyendo la correccion de defectos en el pipeline de entrenamiento.
- Validacion de pipelines de evaluacion robotica: el modelo se ha utilizado para probar el validador OpenRoboto con rollouts reales en LIBERO-Pro, demostrando la viabilidad de cerrar el bucle entre entrenamiento y evaluacion.
- Desarrollo de politicas de manipulacion para entornos simulados: puede emplearse como punto de partida para tareas similares en LIBERO, aunque requiere re-entrenamiento para otras tareas.
- Benchmarking de infraestructura de entrenamiento: el proceso de entrenamiento en 7 A100 80GB y la gestion de datos pueden replicarse para evaluar la escalabilidad de pipelines de VLA.
- Educacion y demostracion tecnica: util para ensenar conceptos de VLA, accionamiento de robots y evaluacion de politicas en entornos estandarizados.
- Prueba de concepto para despliegue en robotica real: aunque limitado a una tarea, demuestra que un modelo de 6B puede generar acciones de control en bucle cerrado con exito, lo que orienta el diseno de sistemas de produccion.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a evaluaciones con el validador OpenRoboto, utilizando estados iniciales oficiales de LIBERO, semilla 7, limite de 300 pasos y rollouts en bucle cerrado. No se han publicado resultados de benchmarks generales como MMLU o HumanEval, ya que el modelo no esta disenado para tareas de lenguaje o razonamiento generico.

| Suite / tarea | Trials | Exitos | Tasa de exito |
|---|---:|---:|---:|
| `libero_goal/task7` | 1 | 1 | 100% |
| `libero_goal_object/task7` (fast gate) | 1 | 1 | 100% |
| `libero_goal_object/task7` (confirmacion) | 5 | 5 | 100% |
| `libero_goal_lan/task7` | 1 | 1 | 100% |
| `libero_goal_swap/task7` | 1 | 0 | 0% |

La confirmacion de cinco ensayos completo todos los episodios Object-Pro en 72-110 pasos de entorno. El gate de una sola prueba en cuatro suites fue de 3/4 en total. Estos numeros no deben interpretarse como una puntuacion completa de LIBERO o de las 16 suites de LIBERO-Pro.

## Requisitos de hardware

- No se especifican requisitos de inferencia en la informacion disponible.
- El entrenamiento se realizo con 7 GPUs A100 de 80 GB, pero la inferencia puede requerir menos recursos.
- Dado el tamano del modelo (6,38 B parametros) y la naturaleza multimodal (procesamiento de imagenes), se estima que se necesita una GPU con al menos 24 GB de VRAM para inferencia en precision completa (fp32 o fp16). Una RTX 4090 o A100 podria ser suficiente, pero no hay datos confirmados.
- El despliegue puede realizarse con frameworks compatibles con transformers, como vLLM o TGI, aunque no se mencionan opciones especificas.
- El modelo requiere cargar el procesador/tokenizer de Qwen3-VL-4B-Instruct, cuyos pesos no estan incluidos en este release, por lo que se necesita acceso a ese modelo adicional.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos VLA en la informacion proporcionada. Modelos como OpenVLA (7B) o RT-2 podrian ser comparables en tamano y proposito, pero no se han publicado resultados comparativos directos. La unica referencia es el modelo base `robbyant/lingbot-vla-v2-6b`, del cual este checkpoint es un fine-tuning especifico. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El checkpoint esta deliberadamente sobreajustado a una unica tarea estandar de LIBERO (`turn on the stove`); no ha sido entrenado conjuntamente con las otras 39 tareas estandar.
- No es un generalista de LIBERO ni de LIBERO-Pro; la evaluacion completa de las 16 suites de LIBERO-Pro queda pendiente.
- La suite `libero_goal_swap/task7` fallo en el unico ensayo registrado, lo que indica sensibilidad a variaciones de la tarea.
- No se han evaluado sesgos o alucinaciones, ya que el modelo no genera texto libre, sino acciones de control.
- El modelo requiere el procesador/tokenizer de Qwen3-VL-4B-Instruct, que no se incluye en el release; sin el, la inferencia no es posible.
- La licencia Apache 2.0 permite uso comercial, pero el modelo esta limitado a una tarea especifica y no es adecuado para produccion general sin re-entrenamiento.
- Los resultados de exito se basan en un numero muy reducido de ensayos (1-5), por lo que la significancia estadistica es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openroboto-ai/lingbot-vla-v2-6b-libero-goal7
- Repositorio de LingBot-VLA 2.0: https://github.com/Robbyant/lingbot-vla-v2
- Repositorio de LingBot-VLA 1.0: https://github.com/Robbyant/lingbot-vla
- Pagina de tecnologia de Robbyant: https://technology.robbyant.com/lingbot-vla-v2
- Modelos cuantizados de la base (referencia): https://huggingface.co/models?other=base_model:quantized:robbyant/lingbot-vla-v2-6b
