# Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003

## Resumen

Este repositorio contiene una adaptación del modelo pi0.5 (pi-zero point five), una política visión-lenguaje-acción (VLA) para control robótico, ajustada sobre el benchmark LIBERO en su variante de contacto denso con desplazamiento de yaw de 10 grados. Lo publica el usuario Donghyun1228 y se distribuye como un checkpoint final (paso 9999 de 10 000 actualizaciones) junto con los activos de normalización necesarios para ejecutar la política. Se trata de un artefacto de investigación muy específico, orientado a experimentos de manipulación robótica, no a un modelo de lenguaje de propósito general.

El entrenamiento combina dos señales: un modelo de dinámica inversa (IDM) con horizonte H=10 promediado de forma acumulativa, y una destilación de representaciones (KD) sobre las imágenes de cámara base, las imágenes de muñeca y el prompt, con pesos relativos 1/1/0.25. La política completa, incluido el "action expert", se entrena de extremo a extremo. El ajuste parte de un checkpoint fuente preservado y cada variante de yaw arranca de forma independiente desde ese mismo punto.

Su relevancia es acotada y experimental: apenas tiene descargas ni interacciones, no declara licencia y no publica resultados de benchmarks en la información disponible. Su interés principal radica en documentar una receta concreta de entrenamiento VLA con JAX sobre LIBERO y en servir como referencia reproducible para quien trabaje en adaptación de políticas pi0.5 a cambios de punto de vista y contacto denso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción (VLA) basada en pi0.5; configuración `pi05_libero_action_frame_shared_decoder_idm_scale_matched_translation_sweep_cumulative_average_paired_vlm_kd` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; la entrada de prompt no se documenta) |
| Licencia | no disponible |
| Formato de pesos | parámetros de política en formato JAX (formato exacto no especificado); se incluyen activos de normalización |
| Tamano del repositorio | 12,4 GB |
| Framework | JAX (etiqueta del repositorio) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

El modelo pertenece a la familia pi0.5, una arquitectura VLA que combina un backbone visión-lenguaje con un módulo experto en acciones, y que en su formulación original genera acciones mediante flow matching. La configuración declarada incluye un decodificador compartido (`shared_decoder`) y un experto de acción que se entrena de forma completa, no congelada. El entrenamiento se realizó en JAX con particionado tipo FSDP sobre 4 GPU, con lotes globales de 32 tanto para el IDM como para la destilación de representaciones, una tasa de aprendizaje de 1e-5 y 500 pasos de calentamiento.

La receta de entrenamiento tiene dos componentes destacables. Por un lado, un modelo de dinámica inversa con horizonte H=10 cuyo promedio es acumulativo, lo que aporta una señal de aprendizaje ligada a la predicción de acciones a partir de transiciones. Por otro, una destilación de conocimiento sobre representaciones de la imagen de cámara base, la imagen de muñeca y el prompt, con pesos 1/1/0.25 respectivamente. Las características del profesor de punto de vista original se reutilizan mediante un emparejamiento auditado de H=10 común. La recolección, reproducción y evaluación preservan MuJoCo 3.2.3, la semilla 7 y densidad 2. La evaluación emplea las cámaras originales, un yaw de la base del robot de 10 grados, compensación de articulaciones del estado inicial y rotación de las acciones al marco desplazado. Los estados del optimizador y los checkpoints originales no se distribuyen; solo se publican los parámetros de la política y los activos de normalización.

## Capacidades

- Generación de acciones de control robótico en el benchmark LIBERO bajo la variante de contacto denso con yaw desplazado 10 grados.
- Percepción multimodal de entrada mediante cámaras base y de muñeca, más un prompt textual.
- Ejecución de políticas entrenadas por imitación/destilación, no de conversación general ni de razonamiento en lenguaje natural.
- Capacidad declarada de operar con un marco de acciones rotado y con compensación de estado inicial.
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso en lenguaje natural.
- No se documentan capacidades multilingües ni modos especiales como thinking, visión general o audio.

## Casos de uso

- Investigación en manipulación robótica sobre LIBERO: el checkpoint permite reproducir y comparar experimentos de adaptación de políticas pi0.5 en tareas de contacto denso con cambios de punto de vista.
- Estudio de robustez ante desplazamientos de la base del robot: al entrenarse con yaw 10 y rotación de acciones al marco desplazado, sirve para analizar la degradación o estabilidad de la política al variar la orientación.
- Experimentos de destilación de representaciones en VLA: la receta con KD sobre imagen base, imagen de muñeca y prompt es directamente reutilizable en trabajos que estudien transferencia de representaciones.
- Evaluación de dinámica inversa como señal auxiliar: el componente IDM con H=10 y promedio acumulativo puede analizarse de forma aislada para medir su impacto en el aprendizaje de políticas.
- Reproducción de pipelines JAX/FSDP en robótica: el repositorio documenta comandos, commits de código y la identidad de los datos en `training_configuration.json`, lo que facilita replicar el flujo de entrenamiento en clústeres de 4 GPU.
- Base para comparativas de adaptación de dominio: al partir de un checkpoint fuente preservado y variar solo el yaw, permite aislar el efecto de esa transformación en el rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe la configuración de entrenamiento y evaluación (LIBERO, MuJoCo 3.2.3, semilla 7, densidad 2, yaw 10), sin incluir tasas de éxito ni tablas comparativas.

## Requisitos de hardware

- Entrenamiento declarado: FSDP sobre 4 GPU (modelo de particionado en el texto de la model card).
- VRAM de inferencia: no disponible. El tamaño del repositorio es de 12,4 GB, lo que da una referencia aproximada del espacio en disco de los parámetros y activos, pero no equivale directamente al consumo de VRAM.
- GPU recomendadas: no disponible de forma explícita. Por el volumen de parámetros y el uso de JAX, es razonable esperar GPU de datacenter (A100, H100 o similares) para inferencia cómoda, aunque no se confirma en la documentación.
- Ejecución en GPU de consumo: no disponible. No se indica compatibilidad con RTX 4090 ni con GPU de gama doméstica.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser una política VLA en JAX, el despliegue previsible sería mediante código propio de inferencia robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05-libero-dense-contact-d2-wrist-kd-yaw10) | VLA pi0.5 ajustada a LIBERO | no disponible | no disponible | no disponible | HuggingFace, 12,4 GB, 0 descargas |
| pi0.5 base (Physical Intelligence) | VLA pi0.5 original | no disponible en esta ficha | no disponible | no disponible | no verificado en la información proporcionada |
| pi0 (Physical Intelligence) | VLA predecesora | no disponible en esta ficha | no disponible | no disponible | no verificado en la información proporcionada |

No se dispone de datos comparativos verificados en la información proporcionada para establecer una comparación cuantitativa de rendimiento, parámetros o contexto con alternativas.

## Limitaciones y advertencias

- Licencia ausente: no se declara licencia, por lo que no puede asumirse uso comercial ni redistribución sin contactar con el autor.
- Ausencia de benchmarks: no hay tasas de éxito ni métricas publicadas, de modo que su rendimiento real en LIBERO es desconocido.
- Especialización extrema: está ajustado a un escenario concreto (contacto denso, yaw 10, densidad 2, semilla 7) y no se espera que generalice fuera de ese dominio sin reentrenamiento.
- Dependencia del entorno: la recolección, reproducción y evaluación fijan MuJoCo 3.2.3, lo que puede introducir discrepancias si se usa otra versión del simulador.
- Documentación incompleta: no se especifican parámetros, contexto, idiomas, cuantizaciones ni formato exacto de pesos.
- Riesgo de sobreajuste al emparejamiento: la reutilización de características del profesor depende de un emparejamiento auditado de H=10 común, un detalle frágil que conviene verificar en réplicas.
- Sin estados del optimizador: el repositorio no incluye estados del optimizador ni los checkpoints originales, lo que limita continuar el entrenamiento desde este punto.
- Cero tracción: 0 descargas y 0 interacciones, por lo que no existe validación externa conocida.
- Riesgo de alucinación: no aplica en el sentido de lenguaje natural, pero sí existe riesgo de acciones incorrectas o inseguras si se despliega en un robot físico real.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-dense-contact-d2-wrist-kd-yaw10-20261003
- Dataset objetivo: https://huggingface.co/datasets/Donghyun1228/libero-dense-contact-sweep-d2-yaw10-20261003
- Dataset fuente: `Donghyun1228/libero-dense-contact-sweep-d2-20261002` (commit `9f8f600ce0e8f5df51c0e847c65a1e09f29d8494`)
- Archivo de configuración de entrenamiento: `training_configuration.json` (incluido en el repositorio)
- Paper de referencia de la familia pi0.5: no disponible en la información proporcionada
