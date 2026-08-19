# Nadeem-Shoukath115113/spiral-so101-cloth-fold-sarm

## Resumen

SPIRAL es un método de aprendizaje por refuerzo offline que entrena un actor-crítico residual ligero sobre un modelo de visión-lenguaje-acción (VLA) preentrenado y congelado. Este checkpoint concreto, `spiral-so101-cloth-fold-sarm`, aplica SPIRAL al doblado bimanual de camisetas en un robot SO-101, utilizando una señal de recompensa densa generada por el modelo SARM (Stage-Aware Reward Modeling) en lugar de las etiquetas RoboMeter empleadas en ejecuciones anteriores del mismo pipeline.

El modelo se entrenó sobre 41 episodios (12.641 fotogramas a 15 fps) del dataset `cloth_folder_v20`, con 2.500 pasos de optimización y un lote de 16. El checkpoint contiene únicamente el actor residual y el crítico; no es una política independiente, sino un complemento que mejora las predicciones del VLA base pi0.5 manteniéndose cerca de su distribución. Su relevancia radica en demostrar cómo refinar políticas VLA con RL offline sin necesidad de reentrenar el modelo base, un enfoque prometedor para la robótica de manipulación de largo horizonte.

La arquitectura exacta (número de parámetros, capas, etc.) no se especifica en la documentación disponible, aunque el tamaño del repositorio (0,4 GB) sugiere un modelo ligero. La licencia es Apache 2.0 y el código se integra en el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Actor-crítico residual (SPIRAL) sobre VLA pi0.5 congelado |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de control; horizonte de accion de 16 pasos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio LeRobot, probablemente safetensors) |

## Arquitectura y entrenamiento

SPIRAL entrena un actor residual y un conjunto de críticos sobre demostraciones offline, dejando el VLA base (pi0.5) completamente congelado. El crítico se ajusta a una señal de progreso densa por fotograma (recompensa en [0, 1]) y el actor residual se optimiza a través del crítico para mejorar los chunks de acción del VLA, con una regularización de comportamiento (BC) que lo mantiene cerca de la distribución original. En esta ejecución se utilizó un conjunto de 5 críticos, un objetivo de crítico tipo `blend` (0,5 × Monte Carlo + 0,5 × Temporal Difference), un factor de descuento de 0,9995, un coeficiente de regularización BC de 30,0, 4 muestras de ruido y un horizonte de acción de 16 pasos.

La recompensa fue generada por un modelo SARM entrenado en modo `dual` (2 etapas dispersas, 3 etapas densas) sobre un dataset fusionado de 101 episodios de doblado de ropa, y luego aplicada fotograma a fotograma sobre `cloth_folder_v20`. El resultado es una señal de progreso densa con rango [0,000, 0,996] y media 0,417, frente a la media 0,661 de las etiquetas RoboMeter originales. El valor terminal medio alcanza 0,980. El entrenamiento se realizó durante 2.500 pasos con un lote de 16, alcanzando el checkpoint `step_00002499`.

## Capacidades

- Generacion de acciones de control bimanual para doblado de camisetas en un robot SO-101, con chunks de accion de 16 pasos.
- Mejora de la politica base pi0.5 sin modificar sus pesos, actuando como un actor residual que corrige o refina las predicciones del VLA.
- Aprendizaje por refuerzo offline a partir de demostraciones, sin necesidad de interaccion en el entorno real durante el entrenamiento.
- Integracion con el ecosistema LeRobot y con el repositorio `openspiral` para entrenamiento y evaluacion.
- No es un modelo de lenguaje ni de vision; no soporta tool calling, agentes conversacionales ni procesamiento multimodal autonomo.
- No es una politica standalone: requiere el checkpoint base pi0.5 congelado para funcionar.

## Casos de uso

- Automatizacion de tareas de lavanderia en entornos domesticos o industriales: el modelo puede controlar un robot bimanual para doblar prendas, reduciendo la intervencion humana en tareas repetitivas.
- Investigacion en aprendizaje por refuerzo offline para robotica: sirve como banco de pruebas para estudiar como los actores residuales mejoran politicas VLA preentrenadas sin reentrenamiento completo.
- Refinamiento de politicas VLA en produccion: empresas que ya despliegan pi0.5 pueden anadir este actor residual para mejorar el rendimiento en tareas especificas de manipulacion, manteniendo el modelo base intacto.
- Desarrollo de sistemas de recompensa basados en modelos de etapa (SARM): el checkpoint demuestra como integrar recompensas densas y dispersas en un pipeline de RL offline, util para disenar nuevos sistemas de recompensa.
- Entrenamiento de politicas para robots de bajo coste: al ser un modelo ligero (0,4 GB), puede ejecutarse en hardware modesto, facilitando experimentos en laboratorios con recursos limitados.
- Evaluacion de robustez en tareas de largo horizonte: permite analizar como el actor residual maneja secuencias largas de manipulacion (16 pasos de accion) y si la regularizacion BC previene derivas en la distribucion de acciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que el modelo no ha sido evaluado en hardware y que no se reivindica ninguna tasa de exito. Por tanto, no hay datos cuantitativos de rendimiento (exito en tarea, tasa de error, etc.) que presentar.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentacion proporcionada.
- Dado el tamano del repositorio (0,4 GB) y que se trata de un actor residual ligero, es plausible que pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmacion oficial.
- El VLA base pi0.5, que es necesario para la inferencia, probablemente requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, A10 o superior), pero este dato tampoco se proporciona.
- Opciones de despliegue: el modelo se integra con LeRobot y el repositorio `openspiral`; no se mencionan compatibilidades con vLLM, llama.cpp u Ollama, que son herramientas para modelos de lenguaje, no para politicas de robotica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (actores residuales para VLA en tareas de manipulacion). La literatura menciona enfoques como Diffuser Policy, ACT o RT-2, pero no hay datos de rendimiento ni especificaciones publicas de este checkpoint que permitan una comparacion rigurosa. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- **Dependencia del VLA base**: este checkpoint no es una politica independiente; requiere el checkpoint pi0.5 congelado (`residual_rl_pi05_so101_fold`) y las herramientas del repositorio `openspiral`. Sin ellos, el modelo no puede generar acciones.
- **Subtareas densas poco informativas**: los limites de las subtareas densas estan cerca de tercios iguales del tiempo (en 82 de 101 episodios, dentro del 10% de tercios exactos), por lo que la senal de progreso densa se aproxima al tiempo transcurrido mas que al estado real de la tarea. Esto limita la calidad de la recompensa.
- **Ruido en el progreso por fotograma**: solo ~62% de los fotogramas consecutivos son no decrecientes, con una variacion media de ~0,011 frente a un valor ideal de ~0,0033. Aunque el sumatorio descontado de 16 pasos mitiga parte del ruido, la senal sigue siendo imperfecta.
- **Sin evaluacion en hardware**: no se ha probado en un robot real, por lo que no hay garantias de exito en el mundo fisico. Cualquier despliegue en produccion requiere validacion previa.
- **Licencia Apache 2.0**: permite uso comercial, pero el modelo depende de pi0.5, cuya licencia puede tener restricciones adicionales no especificadas aqui. Se recomienda verificar la licencia del VLA base.
- **Idiomas**: no aplica, al ser un modelo de robotica sin capacidades linguisticas.

## Enlaces

- [HuggingFace - Nadeem-Shoukath115113/spiral-so101-cloth-fold-sarm](https://huggingface.co/Nadeem-Shoukath115113/spiral-so101-cloth-fold-sarm)
- [Paper SARM - arXiv:2509.25358](https://arxiv.org/abs/2509.25358)
- Repositorio `openspiral` (referenciado en la model card, sin URL directa disponible)
