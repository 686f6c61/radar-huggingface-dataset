# Michi-Tsubaki/MolmoAct2-NEXTAGE-Forceps

## Resumen

MolmoAct2-NEXTAGE-Forceps es un ajuste fino completo del modelo base allenai/MolmoAct2, desarrollado por Michi-Tsubaki para controlar un robot bimanual NEXTAGE en una tarea concreta de entrega de fórceps quirúrgicos. El modelo pertenece a la categoría de modelos visión-lenguaje-acción (VLA), que integran percepción visual, razonamiento lingüístico y generación de comandos motores en un único sistema. Su relevancia radica en que demuestra cómo un modelo VLA abierto puede especializarse mediante fine-tuning en una tarea robótica específica, con un pipeline de entrenamiento reproducible y orientado a investigación.

El checkpoint contiene un experto de acción continua y metadatos de normalización específicos del robot, y requiere `trust_remote_code=True` para cargarse con Transformers. Con 5.447 millones de parámetros, es un modelo de tamaño medio que puede ejecutarse en hardware de gama alta para consumo, aunque su uso previsto es la investigación en robótica, no la inferencia generalista. No se dispone de información sobre licencia, idiomas o longitud de contexto en la documentación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (Vision-Language-Action) basado en MolmoAct2, no se especifican detalles adicionales |
| Parametros totales | 5.447.439.088 (5,4 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de MolmoAct2, un modelo de razonamiento de acción para despliegue real en robots, desarrollado por el Allen Institute for AI. MolmoAct2 combina un backbone de modelo de lenguaje visual (VLM) con una cabeza de acción que genera comandos de control articular. En esta variante, el entrenamiento se realizó sobre un dataset propio de entrega de fórceps, con 3.000 pasos de entrenamiento y un tamaño de lote global de 64. Las observaciones provienen de dos cámaras (vista superior y muñeca derecha) junto con el estado del robot, y el control se realiza en modo de posición articular absoluta, con un horizonte de acción de 30 pasos ejecutados.

El dataset utilizado, `Michi-Tsubaki/hand_over_the_forceps_to_the_hand`, contiene demostraciones de la tarea de entrega de fórceps entre dos brazos del robot NEXTAGE. El repositorio incluye un archivo `norm_stats.json` con las estadísticas de normalización específicas de la configuración `nextage_forceps`, necesarias para interpretar correctamente las salidas del modelo. No se mencionan técnicas como RLHF o DPO; el entrenamiento es supervisado sobre las demostraciones.

## Capacidades

- Generación de comandos de posición articular absoluta para el robot NEXTAGE a partir de observaciones visuales y estado del robot.
- Percepción multimodal con dos cámaras: vista superior y cámara de muñeca derecha.
- Ejecución de tareas de manipulación bimanual, específicamente la entrega de un fórceps entre dos brazos.
- Razonamiento de acción integrado con el modelo base MolmoAct2, que incluye una variante con razonamiento adaptativo (MolmoAct2-Think) aunque esta variante no está presente en este checkpoint.
- No soporta tool calling, agentes generales ni generación de texto libre; su salida está restringida al espacio de acciones del robot.
- Capacidades multilingües no documentadas; el modelo está orientado a la robótica, no al procesamiento de lenguaje natural general.

## Casos de uso

- Investigación en robótica quirúrgica: el modelo puede utilizarse para estudiar políticas de entrega de instrumentos en entornos simulados, validando la coordinación bimanual antes de cualquier prueba en hardware real.
- Desarrollo de sistemas de control para robots NEXTAGE: sirve como punto de partida para fine-tuning en tareas similares de manipulación, aprovechando la representación visual y de estado ya aprendida.
- Evaluación de modelos VLA en tareas específicas: permite comparar el rendimiento de un modelo especializado frente a políticas genéricas o basadas en otros paradigmas de control.
- Generación de datos de entrenamiento sintéticos: al ejecutar el modelo en simulación, se pueden recolectar trayectorias adicionales para ampliar el dataset original.
- Benchmarking de latencia y precisión en control articular: útil para medir el coste computacional de un VLA de 5,4 B en un robot real o simulado.
- Formación y docencia en robótica: como ejemplo de fine-tuning de un modelo VLA abierto, puede emplearse en cursos avanzados de robótica y aprendizaje por refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito, precisión de control ni comparaciones con otros modelos. Se recomienda consultar el paper de MolmoAct2 (arxiv:2605.02881) para conocer el rendimiento del modelo base, aunque los resultados de este fine-tuning específico no están documentados.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 5,4 B parámetros. En FP16, el peso ocuparía aproximadamente 10,9 GB, pero el repositorio ocupa 21,8 GB, lo que sugiere que los pesos están en FP32 (21,8 GB). Para inferencia en FP16 se necesitaría al menos 12 GB de VRAM, y en FP32 al menos 24 GB.
- GPU recomendadas: para FP16, una RTX 4090 (24 GB) o A100 (40/80 GB) sería suficiente. Para FP32, se requiere una GPU con 24 GB o más, como A100 o H100.
- En consumer GPU: sí, una RTX 4090 puede ejecutar el modelo en FP16, aunque no se han publicado cuantizaciones oficiales. El uso de cuantización 8-bit o 4-bit podría reducir los requisitos, pero no hay información al respecto.
- Opciones de despliegue: al ser un modelo de Transformers con código personalizado, se puede cargar con `transformers` usando `trust_remote_code=True`. No se mencionan integraciones con vLLM, llama.cpp u Ollama; el despliegue está pensado para el stack de MolmoAct2.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la implementación de la cabeza de acción.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este fine-tuning con otros modelos VLA de la misma categoría. El modelo base MolmoAct2 es la referencia directa, pero no se han publicado especificaciones detalladas de este checkpoint en la documentación. Alternativas como OpenVLA o RT-2 existen en el espacio VLA, pero no hay datos comparativos en la información proporcionada. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- El modelo es un experto de acción continua específico para el robot NEXTAGE y la tarea de entrega de fórceps; no es una política generalista y no debe usarse fuera de ese contexto.
- No se ha publicado información sobre sesgos del dataset, pero al ser un dataset de demostraciones robóticas, puede heredar sesgos de las trayectorias de demostración (por ejemplo, preferencias de agarre o velocidad).
- Riesgo de alucinación en la generación de acciones: como cualquier modelo generativo, puede producir comandos inválidos o inseguros si las observaciones están fuera de distribución.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; debe validarse en un entorno aislado.
- Para uso en hardware real, es obligatorio aplicar límites de seguridad en el controlador (posición, velocidad, par, fuerzas de contacto) y mantener supervisión humana, tal como indica la model card.
- No se dispone de información sobre la longitud de contexto ni sobre el soporte de idiomas, lo que limita su uso en aplicaciones que requieran interacción en lenguaje natural.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Michi-Tsubaki/MolmoAct2-NEXTAGE-Forceps
- Dataset de entrenamiento: https://huggingface.co/datasets/Michi-Tsubaki/hand_over_the_forceps_to_the_hand
- Modelo base: https://huggingface.co/allenai/MolmoAct2
- Repositorio oficial de MolmoAct2: https://github.com/allenai/molmoact2
- Paper de MolmoAct2: https://arxiv.org/abs/2605.02881
- Repositorio de MolmoAct (versión anterior): https://github.com/allenai/molmoact
