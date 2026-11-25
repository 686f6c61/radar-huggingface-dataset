# Asilarkness/blender-agent-inkling2-mini-lora-v1

## Resumen

`blender-agent-inkling2-mini-lora-v1` es un adaptador LoRA desarrollado por Asilarkness sobre el modelo base `thinkingmachines/Inkling-2-Mini`. Su propósito es especializar al modelo en la resolución de tareas de automatización dentro de Blender mediante la API `bpy`, es decir, generar scripts en Python que manipulen escenas 3D y verifiquen el resultado. El adaptador se entrenó con episodios de autoiteración (expert iteration) filtrados por verificadores de resultado, con el objetivo de mejorar la capacidad del modelo base para completar tareas de modelado, rigging, geometría nodal y texturizado procedural.

El resultado publicado por el propio autor es explícitamente negativo: el adaptador empeora el rendimiento del modelo base en las familias de tareas no vistas durante el entrenamiento. La tasa de éxito final cae del 74,1% al 62,0% (−12,1 puntos, IC 95% [−21,5, −3,2]) y la tasa de "mejor de los turnos" baja del 75,3% al 62,0%. El autor recomienda no usar el adaptador y lo etiqueta como `negative-result`, lo que lo convierte en un caso de estudio útil sobre los riesgos del ajuste fino con datos de rechazo y selección por episodio más corto.

El modelo tiene relevancia para investigadores que trabajen en agentes de código con verificación externa, en ajuste fino de modelos pequeños para dominios de herramientas específicas (tool-use) y en la evaluación de LoRAs sobre modelos con razonamiento explícito. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador, no el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer del modelo base `thinkingmachines/Inkling-2-Mini` |
| Parámetros totales | no disponible (el adaptador LoRA tiene r=32, alpha=64; el recuento exacto de parámetros del adaptador no se publica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantización | el adaptador se distribuye en safetensors; el modelo base se sirve en NVFP4/MXFP8 según la model card; el adaptador fusionado se evaluó en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 64 aplicado sobre las proyecciones de atención del modelo base `thinkingmachines/Inkling-2-Mini`. Se entrenó sobre episodios generados por el propio modelo base resolviendo tareas de Blender generadas automáticamente, filtrados mediante verificadores de resultado (outcome verifiers). La selección de datos siguió una estrategia de rechazo: solo se conservaron los episodios que pasaron los verificadores, se eligió el episodio exitoso más corto por tarea y se mantuvo el razonamiento intermedio. A ello se añadieron datos generales auto-destilados. El entrenamiento consistió en 1 época y 75 pasos de optimizador sobre aproximadamente 900 episodios.

La evaluación se realizó sobre 8 familias de tareas no vistas durante el entrenamiento (`add_without_breaking`, `bridge`, `follow_path`, `geonodes_scatter_params`, `ik_chain`, `procedural_texture`, `quadruped_rig`, `room_with_furniture`), con 40 especificaciones de test por familia, una muestra por especificación y dos niveles de esfuerzo de razonamiento (0,9 y 0,2), hasta 4 turnos, con una chuleta de API en el prompt de sistema y verificadores ejecutados en Blender 5.2.2. El modelo base se sirvió en su forma cuantizada NVFP4/MXFP8, mientras que el adaptador fusionado se evaluó en bf16, lo que introduce una posible fuente de sesgo en la comparación.

## Capacidades

- Generación de scripts Python para la API `bpy` de Blender orientados a tareas de modelado, rigging, geometría nodal y texturizado procedural.
- Razonamiento multi-turno con reparación de errores: el modelo puede recibir el resultado de la ejecución y corregir el script en turnos posteriores.
- Uso de una chuleta de API en el prompt de sistema para guiar las llamadas a `bpy`.
- Declaración de finalización de tarea mediante respuestas "DONE" cuando el modelo considera que la escena cumple los requisitos.
- Razonamiento explícito con niveles de esfuerzo configurables (0,9 y 0,2 en la evaluación).
- Capacidades generales heredadas del modelo base `Inkling-2-Mini` (no detalladas en la información disponible).
- No se documentan capacidades de visión, audio ni tool calling genérico más allá del uso de `bpy`.

## Casos de uso

- Investigación sobre ajuste fino con datos de rechazo: el adaptador sirve como caso controlado para estudiar por qué la selección por "episodio exitoso más corto" degrada el razonamiento y provoca declaraciones prematuras de finalización.
- Estudio de agentes de código con verificación externa: permite analizar cómo un verificador de resultados en Blender 5.2.2 afecta a la tasa de éxito de un agente que genera y repara scripts.
- Evaluación de la brecha entre entrenamiento y generalización: las 8 familias de tareas no vistas permiten medir la transferencia de un LoRA entrenado en tareas específicas a tareas con llamadas de API distintas.
- Análisis de eficiencia de tokens de razonamiento: el adaptador reduce los tokens de finalización por episodio de 8.493 a 3.363, lo que permite estudiar la relación entre longitud de razonamiento y tasa de éxito.
- Benchmark de formatos de servicio: la comparación entre base cuantizado (NVFP4/MXFP8) y adaptador fusionado en bf16 documenta el impacto del formato de servicio en la evaluación.
- Referencia negativa en pipelines de selección de adaptadores: útil para equipos que deciden si publicar o descartar un LoRA tras una ronda de expert iteration, mostrando la importancia de evaluar en familias no vistas.
- Docencia sobre buenas prácticas de model cards: ejemplo de documentación rigurosa de un resultado negativo con intervalos de confianza y análisis por familia.

## Benchmarks y rendimiento

Evaluación sobre 8 familias de tareas no vistas, 40 especificaciones por familia, ambos niveles de esfuerzo agrupados, hasta 4 turnos, verificadores en Blender 5.2.2. Intervalos de confianza al 95% por bootstrap agrupado sobre familias e instancias.

| Métrica (ambos esfuerzos agrupados) | Base | + adaptador v1 | Diferencia (IC 95%) |
|---|---|---|---|
| pass@1 (el primer script pasa) | 55,2% | 52,2% | −3,0 [−11,0, +5,3] |
| final (el último script pasa) | 74,1% | 62,0% | −12,1 [−21,5, −3,2] |
| mejor de los turnos | 75,3% | 62,0% | −13,4 [−23,0, −3,7] |
| respuestas DONE con escena correcta | 84,9% | 63,7% | −21,2 [−32,3, −11,6] |
| tokens de finalización por episodio | 8.493 | 3.363 | −5.129 |

Resultados por nivel de esfuerzo (métrica final):

| Esfuerzo | Base | + adaptador v1 | Diferencia (IC 95%) |
|---|---|---|---|
| 0,9 | 83,4% | 67,1% | −16,3 [−26,5, −7,3] |
| 0,2 | 70,9% | 57,2% | −13,7 [−21,9, −5,9] |

Resultados por familia (métrica final):

| Familia | Base | + adaptador v1 |
|---|---|---|
| quadruped_rig | 93,8% | 60,8% |
| geonodes_scatter_params | 75,0% | 55,0% |
| ik_chain | 97,5% | 81,2% |
| room_with_furniture | 97,5% | 80,0% |
| add_without_breaking | 100% | 86,2% |
| procedural_texture | 92,5% | 86,2% |
| bridge | 35,0% | 27,5% |
| follow_path | ~0% | 0% |

El adaptador empeora o iguala en todas las familias. La tasa de acierto en el primer turno no muestra diferencia significativa (el IC incluye 0); la pérdida aparece en los turnos de reparación y en la declaración prematura de DONE. El modelo ajustado razona 2,5 veces menos y produce más respuestas vacías con esfuerzo 0,2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base `Inkling-2-Mini`, cuyo tamaño no se detalla en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el adaptador es un LoRA PEFT en safetensors que puede cargarse con la librería `peft` y fusionarse con el modelo base en bf16; el modelo base se sirve en NVFP4/MXFP8 según la model card, lo que sugiere soporte de cuantización de baja precisión en el servicio original.
- Latencia y throughput: no disponibles; la evaluación reporta 3.363 tokens de finalización por episodio para el adaptador frente a 8.493 del base, lo que implica una reducción de coste por episodio, aunque a costa de menor tasa de éxito.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento en tareas Blender | Disponibilidad |
|---|---|---|---|---|---|
| `blender-agent-inkling2-mini-lora-v1` | LoRA r=32 sobre Inkling-2-Mini | no disponible | Apache 2.0 | final 62,0%; mejor de turnos 62,0% | Hugging Face (0 descargas) |
| `thinkingmachines/Inkling-2-Mini` (base) | no disponible | no disponible | no disponible | final 74,1%; mejor de turnos 75,3% | Hugging Face |
| Adaptador v0 del mismo autor | LoRA sobre Inkling-2-Mini | no disponible | no disponible | mismo resultado negativo según la model card | no disponible |
| Otros agentes de código para Blender | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros adaptadores o modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que el adaptador es peor que el modelo base y recomienda no usarlo.
- La tasa de finalización correcta cae 12,1 puntos y la de "mejor de los turnos" 13,4 puntos, con intervalos de confianza que excluyen el cero.
- El adaptador declara DONE prematuramente en muchos más casos (63,7% frente a 84,9% de acierto en esa declaración), lo que puede producir escenas incompletas sin aviso.
- El razonamiento se reduce 2,5 veces, lo que se asocia a menor capacidad de reparación en turnos posteriores.
- Con esfuerzo 0,2 produce más respuestas vacías.
- La evaluación usa una sola muestra por especificación, lo que limita la potencia estadística.
- 25 de 320 episodios con esfuerzo 0,9 del modelo ajustado fallaron por errores de infraestructura y se descartaron por pares en la comparación.
- El modelo base se sirvió cuantizado (NVFP4/MXFP8) mientras que el adaptador fusionado se evaluó en bf16, por lo que parte de la diferencia podría atribuirse al formato de servicio.
- Las causas del fallo son hipótesis no testadas: una época sobre ~900 episodios, selección por episodio más corto que enseña razonamiento breve y DONE temprano, y familias no vistas que requieren llamadas de API distintas.
- Licencia Apache 2.0 permite uso comercial, pero el rendimiento degradado hace desaconsejable su uso en producción.
- No se documentan sesgos específicos ni cobertura de idiomas; la evaluación se centra en tareas de Blender en inglés técnico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Asilarkness/blender-agent-inkling2-mini-lora-v1
- Dataset y harness de entrenamiento: https://huggingface.co/datasets/Asilarkness/blender-agent-sft
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
