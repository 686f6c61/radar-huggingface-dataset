# Humantwin/dexflow-v5-stage2-tasks

## Resumen

DexFlow-v5 Phase-2 Stage-2 Tasks es un checkpoint de política robótica publicado por la organización Humantwin en Hugging Face, etiquetado con los tags robotics, imitation-learning, flow-matching y dexterous-manipulation. Se trata de la segunda etapa de un pipeline de dos fases para manipulación diestra: un encoder de interacción mano-objeto (HO) de fase 1 alimenta una cabeza de acción de fase 2 basada en flow matching con un stub de DiT. El modelo no es un modelo de lenguaje: es un generador de acciones de control.

El contrato de acción declarado es un tensor de forma `[30, 41]`, correspondiente a 29 dimensiones de cuerpo (Body29) más 12 de mano (Hand12), emitido a 30 Hz. El entrenamiento declarado se realizó sobre datos de robot plásticos y, en esta release, únicamente sobre la tarea `bottle_upright_cam30_right_crop/robot_stage2`. El checkpoint publicado es `stage2_step15000.pt`, con una pérdida de entrenamiento aproximada de 0.60 en el paso 15k, frente a 0.47 en el paso 30k.

Su relevancia es limitada pero concreta: es un artefacto de investigación reproducible bajo licencia Apache 2.0, útil para quien trabaje en políticas de imitación con flow matching sobre espacios de acción cuerpo-mano. No se han publicado resultados de benchmarks, el repositorio no incluye código de inferencia y el modelo acumula cero descargas y cero likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Flow matching con cabeza de acción tipo DiT (stub) sobre encoder HO de fase 1; detalle de capas no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`): `plastic/stage2_step15000.pt`, con `latest.pt` como enlace simbólico |
| Espacio de acción | `[30, 41]` = Body29 + Hand12 |
| Frecuencia de control | 30 Hz |
| Checkpoint publicado | 15k (planificado hasta 30k) |
| Ficheros auxiliares | `norm_stats.json` (MEAN_STD, compartido con core4 bottle_upright) |
| Pipeline declarado | robotics |
| Biblioteca | pytorch |
| Tamano del repositorio | 0.0 GB (según Hugging Face) |

## Arquitectura y entrenamiento

La información publicada describe un esquema de dos fases. La fase 1 consiste en un encoder de interacción mano-objeto (HO), cuya salida alimenta la fase 2, que genera la acción. La fase 2 se describe como un stub de DiT de acción con flow matching, complementado con consistencia y solapamiento (consistency + overlap) y una interfaz de interacción congelada. No se especifica el número de capas, la dimensión oculta, el número de parámetros ni el mecanismo exacto de condicionamiento del DiT.

En cuanto a los datos, la model card indica que la fase 2 se entrenó sobre datos de robot plásticos y, en esta release, solo sobre la tarea `bottle_upright_cam30_right_crop/robot_stage2`. Las estadísticas de normalización (`norm_stats.json`) son MEAN_STD compartidas con «core4 bottle_upright», lo que implica que el rango de normalización no está ajustado específicamente a esta tarea. No se indica el número de trayectorias, el volumen de tokens ni si hubo etapas de RLHF o DPO, que en cualquier caso no aplicarían a este tipo de modelo. La evolución de la pérdida reportada es de 0.60 en el paso 15k, con descenso hasta 0.47 en el paso 30k (la model card la describe literalmente como «from 25 → 0.47 by 30k»).

## Capacidades

- Generación de acciones de control continuas en el espacio `[30, 41]` (cuerpo y mano) a 30 Hz.
- Manipulación diestra: el reparto Body29 + Hand12 indica control simultáneo de la base o brazo y de una mano con 12 grados de libertad.
- Aprendizaje por imitación: el modelo se entrena a partir de demostraciones, no por refuerzo explícito.
- Generación por flow matching: produce acciones mediante integración de un campo de flujo, con componentes declarados de consistencia y solapamiento entre pasos.
- Condicionamiento por observación: consume la salida de un encoder de interacción mano-objeto de fase 1.
- Soporte de tool calling / function calling: no aplica.
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales (modo thinking, visión, audio): no disponibles; el modelo es una política de acción, no un modelo generativo de texto.

## Casos de uso

- Investigación en políticas de imitación con flow matching: el checkpoint sirve como referencia reproducible para comparar variantes de cabeza de acción DiT frente a arquitecturas de difusión o regresión directa, gracias a que la pérdida por paso está documentada.
- Manipulación diestra con mano de 12 DoF: el subespacio Hand12 permite integrar el modelo en plataformas con manos antropomorfas para tareas de agarre y recolocación de objetos, siempre que el entorno coincida con la tarea de entrenamiento.
- Control a 30 Hz en lazo cerrado: con un contrato temporal fijo de 33,3 ms por paso, el modelo encaja en bucles de control donde el presupuesto de inferencia es conocido y acotado.
- Reproducción de la tarea `bottle_upright`: dado que el entrenamiento se limitó a esa tarea y cámara, es directamente utilizable para reproducir el experimento de mantener una botella en posición vertical.
- Punto de partida para fine-tuning: al ser Apache 2.0 y un único fichero `.pt`, es apto como inicialización para ajustar la fase 2 a nuevas tareas, reutilizando o recalculando las estadísticas de normalización.
- Evaluación de esquemas de normalización compartida: al usar MEAN_STD de «core4 bottle_upright», permite estudiar el impacto de reutilizar estadísticas de un conjunto de tareas en otro distinto.
- Docencia y prototipado en robótica: útil como ejemplo mínimo de pipeline en dos fases (encoder HO y cabeza de acción) sin coste de licencia.
- Investigación sobre consistencia y solapamiento en flow matching: el modelo incorpora explícitamente esos dos componentes en la fase 2, lo que lo hace adecuado para ablaciones sobre el número de pasos de integración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico reportado es la pérdida de entrenamiento:

| Metrica | Valor |
|---|---|
| Train loss @ 15k pasos | ≈ 0.60 |
| Train loss @ 30k pasos | 0.47 (la model card indica «from 25 → 0.47 by 30k») |
| Tasa de éxito en tarea | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no aplica (modelo de robótica) |

No se dispone de comparaciones con otras políticas sobre el mismo entorno.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio se reporta como 0.0 GB, lo que sugiere un checkpoint pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, aunque el tamaño de repositorio reportado apunta a que el checkpoint cabría sin problemas; se trata de una inferencia cualitativa, no de un dato verificado.
- Opciones de despliegue: PyTorch. Las herramientas habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables porque el modelo no genera texto. El repositorio no incluye código de inferencia, por lo que el despliegue requiere integrar el checkpoint en un bucle de control propio.
- Latencia y throughput: no disponibles. El contrato de acción a 30 Hz implica un presupuesto de 33,3 ms por paso de control, pero no se documenta si el modelo cumple ese margen en hardware concreto.
- Entrenamiento: no se especifica el hardware utilizado para alcanzar los pasos 15k/30k, ni el tiempo de entrenamiento.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras políticas de manipulación, ni datos de parámetros, contexto o rendimiento de alternativas que permitan establecer una tabla comparativa fiable.

## Limitaciones y advertencias

- Cobertura de una sola tarea: el entrenamiento de fase 2 se limita a `bottle_upright_cam30_right_crop/robot_stage2`. Cualquier uso fuera de esa tarea o configuración de cámara carece de garantías.
- Checkpoint intermedio: el artefacto publicado corresponde al paso 15k de un plan de 30k, con una pérdida de 0.60 frente a 0.47 al final. No es el punto de mejor rendimiento del run.
- Normalización no ajustada: `norm_stats.json` reutiliza MEAN_STD de «core4 bottle_upright», no específicas de esta tarea, lo que puede degradar el comportamiento en rangos de observación distintos.
- Ausencia de código de inferencia: el layout publicado solo contiene el checkpoint y las estadísticas de normalización. No hay script de evaluación, ni definición del encoder de fase 1, ni instrucciones de reproducción.
- Dependencia de la fase 1: el contrato indica que un encoder HO de fase 1 alimenta la fase 2. Si ese encoder no se distribuye por separado, el checkpoint no es utilizable de forma autónoma.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta, sin resultados de éxito reportados en ninguna tarea.
- Riesgo de alucinación: no aplica en el sentido de generación de texto falso, pero sí existe riesgo de deriva o sobreajuste en las acciones predichas, especialmente fuera de la distribución de entrenamiento.
- Idiomas: no disponible, y no relevante para un modelo de control.
- Licencia: Apache 2.0 permite uso comercial, modificación y redistribución, con inclusión de concesión de patentes, siempre que se conserven los avisos de copyright y se documenten los cambios. No se declaran restricciones adicionales de uso aceptable.
- Ambigüedad en la documentación: la pérdida se describe como «0.60» en el paso 15k y «from 25 → 0.47 by 30k», cifra inicial que no concuerda con el 0.60 previo; conviene verificar el dato antes de usarlo como referencia.
- Fechas: la model card declara creación y actualización el 16 de septiembre de 2026, pocos minutos antes de la publicación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Humantwin/dexflow-v5-stage2-tasks
- Organización: https://huggingface.co/Humantwin
- Paper, blog o repositorio de código: no disponible.
- Demo o espacio interactivo: no disponible.
- Nota sobre la búsqueda web: los resultados devueltos corresponden a TP Fay, un fabricante británico de resistencias y elementos calefactores (https://www.tpfay.co.uk/), y no guardan relación alguna con el modelo. No se ha localizado documentación técnica adicional del proyecto DexFlow-v5.
