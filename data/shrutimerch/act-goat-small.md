# shrutimerch/act-goat-small

## Resumen

`shrutimerch/act-goat-small` es una política de robótica basada en ACT (Action Chunking with Transformers), un método de aprendizaje por imitación que predice fragmentos de acciones (*action chunks*) en lugar de pasos individuales. Lo publica el usuario shrutimerch en HuggingFace Hub y está entrenada y exportada con la librería LeRobot de HuggingFace. No es un modelo de lenguaje: es un *policy* de control robótico que consume estado de articulaciones e imágenes de cámara y emite comandos de acción.

El modelo ocupa aproximadamente 15,6 millones de parámetros (15.614.726 según el fichero de safetensors) y un repositorio de 0,1 GB, lo que lo sitúa en la gama ligera de políticas manipulativas. Está especializado en una única tarea concreta: "Pick up the goat and place it in the bucket" (recoger el objeto y depositarlo en un cubo), sobre un robot de tipo `so_follower` con dos cámaras (muñeca y exocéntrica). No se trata de un modelo de propósito general, sino de un *checkpoint* afinado para un entorno y un hardware específicos.

Su relevancia es práctica: demuestra el flujo completo de LeRobot para grabar datos de teleoperación, entrenar una política ACT y desplegarla en un robot real con pocos recursos de cómputo. Para desarrolladores e investigadores en robótica de bajo coste, sirve como referencia reproducible de un pipeline de imitación extremo a extremo, aunque su ámbito de aplicación es muy acotado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con componente CVAE y codificadores visuales |
| Parametros totales | 15.614.726 (~15,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre ventanas de observación y predice chunks de acción) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; el modelo produce acciones, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de *behavior cloning* que combina un transformer encoder-decoder con un autoencoder variacional condicional (CVAE). El modelo ingiere observaciones multimodales (estado de las articulaciones, representado aquí por un vector de dimensión 6, y dos flujos de imagen RGB: `wrist` a 480x640 y `exocentric` a 720x1280) y genera un *chunk* de acciones de dimensión 6. La decodificación por chunks reduce el error de acumulación típico de las políticas que predicen un único paso, y el componente latente del CVAE ayuda a modelar la variabilidad de las demostraciones humanas. La innovación principal de ACT, descrita en el paper 2304.13705, es lograr manipulación fina con hardware de bajo coste mediante esta formulación.

Según la model card, el entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El conjunto de datos `shrutimerch/goat-pickup-v3-clean` contiene 49 episodios y 31.906 fotogramas a 30 FPS, todos correspondientes a la tarea única de recoger el objeto y dejarlo en el cubo. No se documentan fases de RLHF, DPO ni otras técnicas de alineación, algo esperable en una política de imitación.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 grados de libertad a partir de estado y visión.
- Predicción por chunks de acción, que mejora la estabilidad frente a la predicción paso a paso.
- Fusión multimodal de dos cámaras (muñeca y exocéntrica) más el estado de las articulaciones.
- Ejecución de la tarea específica "recoger el objeto y colocarlo en el cubo" sobre un robot `so_follower`.
- Despliegue en tiempo real a 30 FPS mediante el comando `lerobot-rollout`.
- Reentrenamiento reproducible con el comando `lerobot-train` sobre nuevos conjuntos de datos.
- No soporta *tool calling*, razonamiento multi-paso simbólico, generación de texto, código, matemáticas ni visión interpretativa: está limitada al control motor.

## Casos de uso

- Manipulación pick-and-place sobre robot SO-100/SO-101: la política ejecuta la tarea de recoger un objeto y depositarlo en un cubo, adecuada para entornos domésticos o de laboratorio de bajo coste.
- Base de referencia para comparar métodos de imitación: sirve como *baseline* ACT reproducible frente a Diffusion Policy u otras políticas de LeRobot sobre el mismo dataset.
- Prototipado de pipelines de teleoperación: permite validar el flujo completo grabar-calibrar-entrenar-desplegar antes de invertir en tareas más complejas.
- Automatización de tareas repetitivas de clasificación: con un dataset equivalente, se puede reentrenar para separar objetos por tipo o color depositándolos en contenedores distintos.
- Investigación en aprendizaje por imitación: útil para estudiar sensibilidad a la posición del objeto, iluminación o número de episodios de demostración.
- Demostraciones educativas de robótica: al ocupar solo 0,1 GB, se puede ejecutar en portátiles con GPU modesta para docencia y talleres.
- Integración en cadenas de recogida y ordenación: combinada con una lógica externa de reposicionamiento, puede encadenar múltiples ciclos de pick-and-place.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito, número de ensayos ni condiciones de evaluación en robot real o simulación. No se inventan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 15,6 M de parámetros, los pesos ocupan aproximadamente 62 MB en fp32 y unos 31 MB en fp16, a los que se suma la memoria de los codificadores visuales y los búferes de imagen (dos flujos a 480x640 y 720x1280).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente en la práctica; una RTX 3060, RTX 4090 o incluso una GPU integrada moderna pueden ejecutar la política. No se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo reciente; también es viable en CPU para pruebas, aunque con mayor latencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia y `lerobot-train` para entrenamiento). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles de forma explícita; el sistema está diseñado para operar a 30 FPS, lo que implica un presupuesto de aproximadamente 33 ms por ciclo de control.
- Almacenamiento: el repositorio ocupa 0,1 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| shrutimerch/act-goat-small | ACT (imitación) | ~15,6 M | Tarea única pick-and-place, 2 cámaras | Apache 2.0 | HuggingFace Hub |
| Diffusion Policy (LeRobot) | Política por difusión | Mayor que ACT (órdenes de decenas de millones según configuración) | Tareas de manipulación, condicionada por imágenes | Apache 2.0 (LeRobot) | HuggingFace Hub / LeRobot |
| VQ-BeT (LeRobot) | Behavior transformer vector-cuantizado | no disponible | Manipulación multimodal | Apache 2.0 (LeRobot) | HuggingFace Hub / LeRobot |
| Otras políticas ACT en LeRobot | ACT (imitación) | ~15-50 M según configuración | Tareas específicas por dataset | Apache 2.0 | HuggingFace Hub |

Las cifras de parámetros de alternativas distintas de ACT no se detallan aquí porque no están en la información proporcionada. ACT y Diffusion Policy son los dos métodos de imitación más habituales en LeRobot; ACT suele ser más rápido en inferencia y más sencillo de entrenar, mientras que Diffusion Policy tiende a manejar mejor la multimodalidad de las demostraciones.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "Pick up the goat and place it in the bucket" y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: asume un robot `so_follower` con dos cámaras concretas (`wrist` y `exocentric`) y un vector de estado de dimensión 6; cambiar de robot o de cámaras invalida el modelo.
- Sin resultados de evaluación: no hay tasas de éxito publicadas, por lo que se desconoce su robustez real ante variaciones de posición, iluminación o distracciones.
- Sensibilidad al entorno: al provenir de solo 49 episodios y 31.906 fotogramas, es probable que sea sensible a cambios de iluminación, fondo u objetos no vistos durante el entrenamiento.
- Riesgo de sobreajuste: con 20.000 pasos sobre un dataset reducido, existe riesgo de memorizar posiciones concretas en lugar de aprender una política general.
- Sesgos: hereda los sesgos de las demostraciones de teleoperación, incluidas las trayectorias particulares del operador que grabó los datos.
- Alucinación no aplica en el sentido lingüístico, pero sí puede producir acciones erráticas o inseguras al salir de la distribución de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda verificar los requisitos de cita indicados en la model card (paper de ACT y LeRobot).
- Advertencias de producción: al operar sobre hardware físico, es imprescindible contar con paradas de emergencia, límites de par y supervisión humana, ya que una política defectuosa puede causar daños materiales o personales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shrutimerch/act-goat-small
- Dataset de entrenamiento: https://huggingface.co/datasets/shrutimerch/goat-pickup-v3-clean
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=shrutimerch/goat-pickup-v3-clean
