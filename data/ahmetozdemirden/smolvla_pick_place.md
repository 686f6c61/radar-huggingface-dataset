# ahmetozdemirden/smolvla_pick_place

## Resumen

Este modelo es un fine-tuning de SmolVLA, un modelo vision-language-action (VLA) compacto de 450 millones de parámetros desarrollado por Hugging Face y descrito en el artículo arXiv:2506.01844. El ajuste fino se ha realizado con el framework LeRobot (versión 0.6.2) sobre el dataset so101/pick_place, que contiene 5 episodios y 828 fotogramas a 10 FPS, para ejecutar la tarea de recoger una caja verde y colocarla sobre un plato gris con un robot SO-101.

La relevancia de este modelo radica en que SmolVLA está diseñado para ejecutarse en hardware de consumo, reduciendo drásticamente el coste computacional frente a otros VLA de mayor tamaño. Este repositorio concreto sirve como ejemplo práctico de fine-tuning de la base lerobot/smolvla_base para una tarea de manipulación específica, y demuestra el flujo completo de entrenamiento y despliegue con LeRobot. El modelo consume tres entradas visuales de 256x256 píxeles (cámara de muñeca, superior y una tercera) junto con el estado del robot (6 dimensiones) y produce acciones de control de 6 dimensiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no aplicable (modelo de accion robotica, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-language-action que combina un codificador visual con un modelo de lenguaje compacto para producir acciones de control continuo a partir de observaciones multimodales. En este fine-tuning concreto, el modelo recibe como entrada tres imágenes de 256x256 píxeles procedentes de las cámaras del robot SO-101 (muñeca, superior y una tercera) junto con un vector de estado de 6 dimensiones, y genera un vector de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset so101/pick_place, que contiene 5 episodios y 828 fotogramas grabados a 10 FPS. La configuración de entrenamiento fue de 500 pasos con batch size 8, optimizador AdamW con learning rate de 0.0001 y semilla 1000. El modelo parte de los pesos preentrenados de lerobot/smolvla_base, que ya incorpora el conocimiento general de manipulación aprendido durante el preentrenamiento. No se dispone de información sobre técnicas adicionales como RLHF o DPO en este fine-tuning.

## Capacidades

- Ejecucion de tareas de pick-and-place robotico por aprendizaje por imitacion: recoger una caja verde y colocarla sobre un plato gris.
- Procesamiento multimodal de vision: acepta tres flujos de imagen simultaneos a 256x256 píxeles junto con el estado del robot.
- Control de acciones continuas en 6 dimensiones (posicion y orientacion del efector final).
- Integracion nativa con el ecosistema LeRobot: entrenamiento, evaluacion y despliegue mediante comandos CLI estandarizados.
- Fine-tuning especifico sobre la base SmolVLA, lo que permite adaptar el modelo a tareas concretas con pocos datos (5 episodios en este caso).
- Inferencia en hardware de consumo, segun las caracteristicas publicadas de SmolVLA.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni generacion de texto, al ser un modelo puramente orientado a control robotico.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos de laboratorio: el modelo puede controlar un robot SO-101 para recoger objetos de una posicion fija y depositarlos en un destino concreto, lo que resulta util para lineas de montaje sencillas o estaciones de clasificacion.
- Investigacion en aprendizaje por imitacion: este repositorio sirve como referencia reproducible del flujo completo de fine-tuning de SmolVLA con LeRobot, desde la grabacion del dataset hasta el despliegue, facilitando la comparacion de configuraciones de entrenamiento.
- Prototipado rapido de politicas robotica: con solo 5 episodios de demostracion, el modelo demuestra que es posible obtener una politica funcional con un esfuerzo de recoleccion de datos minimo, lo que acelera el ciclo de desarrollo en proyectos de robotica.
- Educacion y formacion en robotica: al ejecutarse en hardware de consumo y distribuirse bajo licencia Apache 2.0, este modelo permite a estudiantes e investigadores experimentar con VLA sin necesidad de infraestructura costosa.
- Benchmarking de modelos VLA compactos: al ser un fine-tuning publico con configuracion de entrenamiento documentada, puede utilizarse como punto de referencia para comparar el rendimiento de SmolVLA frente a otros VLA en tareas de manipulación simples.
- Base para fine-tuning en tareas similares: los pesos de este modelo pueden servir como punto de partida para adaptar SmolVLA a variantes de la misma tarea, como cambiar el objeto o la posicion de destino, reduciendo el numero de demostraciones necesarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"). No se dispone de metricas como tasa de exito en robot real, MMLU, HumanEval ni otros indicadores estandar.

## Requisitos de hardware

- SmolVLA esta disenado para despliegue en hardware de consumo, segun la documentacion oficial del modelo base.
- No se proporcionan datos especificos de VRAM estimada para este fine-tuning en la informacion disponible.
- El robot objetivo es un SO-101 (so101_follower) con tres camaras (muñeca, superior y una tercera).
- El despliegue se realiza mediante el framework LeRobot, utilizando el comando `lerobot-rollout` con la estrategia `base`.
- Para el entrenamiento se requiere una GPU compatible con CUDA, indicada mediante `--policy.device=cuda` en el flujo de LeRobot.
- No se especifican GPUs concretas recomendadas, ni datos de latencia o throughput en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Estado |
|---|---|---|---|---|
| ahmetozdemirden/smolvla_pick_place | 450M | Pick-and-place (caja verde a plato gris) | so101/pick_place (5 episodios) | Fine-tuning publicado |
| lerobot/smolvla_base | 450M | Preentrenamiento general VLA | No especificado | Modelo base oficial |
| SSatoya/smolvla_pen_pick_and_place | 450M | Pick-and-place (boligrafo) | No especificado | Fine-tuning similar |
| abhishek31an/smolvla-pick-place | 450M | Pick-and-place | No especificado | Fine-tuning similar |

Los tres fine-tunings comparten la misma arquitectura SmolVLA de 450M de parámetros y licencia Apache 2.0, diferenciandose principalmente en el dataset y la tarea concreta. No se dispone de datos comparativos de rendimiento entre ellos, ya que ninguno publica resultados de evaluacion.

## Limitaciones y advertencias

- El dataset de entrenamiento es extremadamente reducido: solo 5 episodios y 828 fotogramas, lo que limita la generalizacion del modelo a variaciones de posicion, iluminacion o presencia de distractores no contemplados en las demostraciones.
- No se han publicado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real de la politica.
- El modelo esta entrenado para una tarea muy especifica (recoger una caja verde y colocarla en un plato gris); cualquier cambio en el objeto, la posicion o el entorno requerira un nuevo fine-tuning.
- Las entradas de camara deben coincidir exactamente con las claves de observacion utilizadas durante el entrenamiento (tres camaras a 256x256), lo que condiciona el hardware de captura necesario.
- El modelo no es un asistente de lenguaje ni genera texto: su unica salida es un vector de accion de 6 dimensiones, por lo que no es adecuado para tareas fuera del control robotico.
- Al ser un fine-tuning reciente (creado en agosto de 2026) con cero descargas y cero likes en el momento de la consulta, no existe comunidad que valide su comportamiento en otros entornos.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento ni soporte tecnico.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ahmetozdemirden/smolvla_pick_place
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/so101/pick_place
- Articulo de SmolVLA (arXiv): https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion general de LeRobot: https://huggingface.co/docs/lerobot/index
- Sitio oficial de SmolVLA: https://smolvla.net/index_en
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Fine-tuning similar (boligrafo): https://huggingface.co/SSatoya/smolvla_pen_pick_and_place
- Fine-tuning similar (pick-place): https://huggingface.co/abhishek31an/smolvla-pick-place
