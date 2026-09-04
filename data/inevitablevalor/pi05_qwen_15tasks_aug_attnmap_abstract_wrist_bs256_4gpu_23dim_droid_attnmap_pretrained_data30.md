# Inevitablevalor/pi05_qwen_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained_data30

## Resumen

Este modelo es un checkpoint de entrenamiento de un sistema de políticas de visión-lenguaje-acción (VLA) desarrollado por Inevitablevalor, basado en el backbone Qwen. Está diseñado para controlar robots manipuladores a partir de imágenes y prompts abstractos, y pertenece a una curva de escalado de datos de la que solo utiliza el 30 % de los episodios disponibles. Su relevancia radica en permitir estudiar el efecto de la cantidad de datos en el rendimiento de modelos VLA, ya que es un punto intermedio entre un hermano con el 50 % de los datos y el modelo padre con el 100 %.

El modelo fue preentrenado con datos DROID y afinado en 15 tareas de comportamiento aumentadas. Se entrenó durante 48 horas en 4 GPUs H100 SXM, alcanzando el paso 119.927 de un esquema de 140.000 pasos. Los checkpoints publicados cubren los pasos 90.000, 100.000, 110.000 y 115.000. No se proporcionan datos sobre el número total de parámetros, la longitud de contexto ni la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con backbone Qwen; detalles de arquitectura no especificados |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (max_token_len = 448 segun la config) |
| Tipos de cuantizacion | no disponible (los pesos estan en bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un modelo de políticas de visión-lenguaje-acción (VLA) con backbone Qwen. El nombre de la config sugiere que utiliza mapas de atención (attn-map), prompts abstractos e imágenes de muñeca en infrarrojos (wrist IR). No se han publicado detalles tecnicos sobre la atencion, la fusion de modalidades ni el espacio de acciones.

El entrenamiento parte de un warm start desde el checkpoint de preentrenamiento DROID en el paso 100.000. Se utiliza un subconjunto del 30 % de los episodios (1.660 de 5.532) del dataset `behavior_15tasks_aug`, manteniendo el mismo esquema de 140.000 pasos que el run con datos completos. El modelo reutiliza estadisticas de normalizacion del dataset completo. Los checkpoints guardados son 90k, 100k, 110k y 115k; el run se detuvo en el paso 119.927 por un limite de tiempo de 48 horas, a 73 pasos del checkpoint 120k. La config especifica `with_wrist_ir=True`, lo que obliga a activar `WITH_WRIST_IR=1` tanto en servidor como en cliente.

## Capacidades

- Genera acciones de control para manipulacion robotica a partir de seis imagenes de entrada, incluyendo mapas de atencion e imagen de muñeca IR.
- Acepta prompts abstractos que describen la tarea a realizar.
- No es un modelo de lenguaje general: no genera texto, no soporta tool calling ni function calling.
- No tiene capacidades multilingues documentadas.
- Capacidad especial: integra informacion visual de muñeca en infrarrojos y mapas de atencion para mejorar la precision de las acciones.
- Requiere un servidor y un cliente que compartan la configuracion `WITH_WRIST_IR=1`; sin ello, la inferencia falla con un `KeyError`.

## Casos de uso

- Investigacion sobre escalado de datos en VLA: permite comparar el rendimiento de un modelo entrenado con el 30 % de los episodios frente a sus variantes con el 50 % y el 100 %, ayudando a trazar curvas de eficiencia de datos.
- Seleccion de checkpoints por sobreajuste: al ser el punto mas propenso a sobreajuste de la curva, puede utilizarse para estudiar metodos de seleccion de checkpoints basados en evaluacion simulada (SIM-EVAL) en lugar de la perdida de entrenamiento.
- Validacion de infraestructura de despliegue: sirve como caso de prueba para verificar que el servidor y el cliente manejan correctamente el renderizado de los centros de la muñeca IR mediante `WITH_WRIST_IR`.
- Benchmark de rendimiento en GPU H100: al haberse entrenado en 4xH100 SXM, puede emplearse para medir latencia y throughput de inferencia en configuraciones multigpu.
- Experimentacion con prompts abstractos: permite evaluar como el modelo interpreta descripciones de tareas de alto nivel frente a instrucciones mas explicitas.
- Reanudacion de entrenamiento desde checkpoints intermedios: los checkpoints 90k, 100k, 110k y 115k permiten continuar el entrenamiento desde diferentes puntos, utiles para estudiar el efecto de la interrupcion prematura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni metricas de manipulacion robotica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: el entrenamiento se realizo en 4xH100 SXM con 1.63 s/it. No se indica si la inferencia requiere una GPU concreta.
- Compatibilidad con GPUs de consumo: no disponible.
- Opciones de despliegue: no especificadas. El checkpoint incluye pesos en bf16 y requiere un servidor que gestione `WITH_WRIST_IR=1`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Subconjunto de datos | Checkpoints disponibles | Notas |
|---|---|---|---|
| `pi05_qwen_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained_data30` (este) | 30 % (1.660 episodios) | 90k, 100k, 110k, 115k | Se detuvo en 119.927 por limite de tiempo |
| `pi05_qwen_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained_data50` | 50 % | 90k, 100k, 110k, 120k | Hermano con mas datos; el checkpoint 120k no existe en la version 30 % |
| `pi05_qwen_behavior_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained` | 100 % | no listado | Modelo padre con datos completos |

No se dispone de metricas comparativas de rendimiento.

## Limitaciones y advertencias

- Riesgo de sobreajuste elevado: al usar el 30 % de los datos con un esquema de 140k pasos, se alcanzan aproximadamente 3.3 veces las epocas del run con datos completos. La propia config recomienda seleccionar checkpoints mediante SIM-EVAL y no confiar en la perdida de entrenamiento.
- Sin licencia: el repositorio no especifica licencia, por lo que su uso comercial requiere consultar al autor.
- Sin benchmarks publicados: no es posible evaluar su rendimiento frente a otros modelos sin ejecutar evaluaciones propias.
- Requiere configuracion especial: `WITH_WRIST_IR=1` debe activarse en servidor y cliente; de lo contrario la inferencia falla y los clientes se cuelgan en el warm-up.
- No es un modelo de lenguaje: no puede usarse para generacion de texto, chat ni razonamiento general.
- Sesgos y riesgos de seguridad no documentados.
- El checkpoint 115k no es el final del esquema de entrenamiento: el run se detuvo 73 pasos antes del checkpoint 120k, lo que puede afectar a la comparacion directa con el hermano del 50 % de datos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Inevitablevalor/pi05_qwen_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained_data30
- Repositorio hermano con datos al 50 %: https://huggingface.co/Inevitablevalor/pi05_qwen_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained_data50
- Repositorio padre con datos completos: https://huggingface.co/Inevitablevalor/pi05_qwen_behavior_15tasks_aug_attnmap_abstract_wrist_bs256_4gpu_23dim_droid_attnmap_pretrained
- Codigo mencionado en la model card: `openpi-spatialvla` en el commit `ed44632` (sin URL publica en la informacion disponible).
