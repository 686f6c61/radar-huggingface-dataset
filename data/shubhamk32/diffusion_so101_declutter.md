# ShubhamK32/diffusion_so101_declutter

## Resumen

El modelo `ShubhamK32/diffusion_so101_declutter` es una política de control visuomotor basada en Diffusion Policy, entrenada con la librería LeRobot de Hugging Face. Desarrollado por Shubham Kanitkar, el modelo resuelve una tarea concreta de manipulación robótica: recoger un plumero azul de una superficie y depositarlo en un contenedor. Utiliza un proceso generativo de difusión para producir trayectorias de acción suaves y multi-paso, una técnica especialmente eficaz en tareas de manipulación que requieren contacto físico.

El modelo se entrenó sobre un conjunto de datos propio (`ShubhamK32/so101_declutter_v1`) compuesto por 51 episodios teleoperados y 22 899 fotogramas a 30 FPS, con dos cámaras (vista superior y vista de muñeca). Con 277,8 millones de parámetros, es una política compacta que puede ejecutarse en hardware de consumo. Su relevancia radica en demostrar la aplicación práctica de Diffusion Policy en robótica real con un pipeline de entrenamiento abierto y reproducible, y en servir como punto de partida para tareas similares de pick-and-place y ordenación de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (UNet + proceso de difusion) |
| Parametros totales | 277 840 246 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control visuomotor, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, presentado en el articulo de arXiv 2303.04137. En lugar de predecir directamente una accion, el modelo trata el control visuomotor como un proceso generativo de difusion: parte de ruido gaussiano y lo refina iterativamente para producir una secuencia de acciones (trayectoria) que maximiza la probabilidad de exito en la tarea. Esta formulacion permite generar movimientos suaves y coherentes, incluso en tareas que requieren contacto fisico y manipulacion precisa.

El entrenamiento se realizo con LeRobot version 0.6.1 sobre el dataset `ShubhamK32/so101_declutter_v1`, que contiene 51 episodios de teleoperacion (22 899 fotogramas a 30 FPS) de la tarea "pick up the duster and place it into the bin". La configuracion de entrenamiento incluyo 14 000 pasos, batch size de 8, optimizador Adam con learning rate de 0.0001 y semilla 1000. Las observaciones de entrada son el estado del robot (6 dimensiones) y dos imagenes RGB de 480x640 (vista superior y vista de muñeca); la salida es un vector de accion de 6 dimensiones. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitacion supervisada.

## Capacidades

- Control visuomotor para manipulacion robotica: genera trayectorias de accion de 6 grados de libertad a partir de observaciones de estado e imagenes.
- Ejecucion de tareas de pick-and-place especificas: entrenado para recoger un plumero y colocarlo en un contenedor, con precision en tareas de contacto.
- Generacion de trayectorias suaves y multi-paso gracias al proceso de difusion, lo que reduce la variabilidad y mejora la estabilidad del movimiento.
- Integracion con el ecosistema LeRobot: compatible con el robot `so_follower` y con el flujo de trabajo de entrenamiento, evaluacion y despliegue de LeRobot.
- No soporta tool calling, agentes conversacionales ni procesamiento de lenguaje natural; su unica funcion es la generacion de acciones motoras.
- Capacidad multilingue: no aplica, al no procesar texto.

## Casos de uso

- Automatizacion de tareas de ordenacion en entornos domesticos o industriales: el modelo puede ejecutar la tarea de recoger un objeto (en este caso un plumero) y depositarlo en un contenedor, lo que sirve como base para sistemas de decluttering automatizado.
- Prototipado rapido de politicas de manipulacion: al estar entrenado con LeRobot, permite a desarrolladores e investigadores replicar el flujo de trabajo completo (captura de datos, entrenamiento y despliegue) para otras tareas similares.
- Investigacion en aprendizaje por imitacion: el modelo y su dataset asociado son un recurso util para estudiar tecnicas de diffusion aplicadas a control robotico, comparar con otros metodos (BC, ACT, etc.) y analizar el efecto de la cantidad de datos.
- Evaluacion de hardware robotico: al ser una politica compacta (277 M parametros), puede ejecutarse en GPUs de consumo, lo que facilita pruebas de controladores, camaras y sistemas de teleoperacion en laboratorios con recursos limitados.
- Generacion de datos sinteticos para entrenamiento: las trayectorias generadas por el modelo pueden usarse para aumentar datasets o para validar simuladores antes de entrenar politicas mas complejas.
- Educacion y formacion en robotica: sirve como ejemplo didactico de como entrenar y desplegar una politica de diffusion con LeRobot, con una tarea concreta y un dataset publico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been provided for this policy yet"). No se dispone de datos de tasa de exito en el robot real ni comparaciones con otros metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay datos oficiales. Dado el tamano del modelo (277 M parametros) y que se trata de una red de difusion con UNet, se estima que puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en precision FP32, y menos con cuantizacion (aunque no se proporcionan pesos cuantizados).
- GPU recomendadas: cualquier GPU moderna de consumo con soporte CUDA (por ejemplo, NVIDIA RTX 3060 o superior) deberia ser suficiente para inferencia en tiempo real. Para entrenamiento, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070/4070 o superior).
- Compatibilidad con hardware de consumo: si, el modelo es lo bastante pequeno para ejecutarse en GPUs de gama media.
- Opciones de despliegue: el modelo se integra con LeRobot, que soporta inferencia via `lerobot-rollout` y puede ejecutarse en el robot `so_follower`. Tambien es posible exportar los pesos a otros formatos (por ejemplo, ONNX) para despliegue en edge, aunque no se documenta en la model card.
- Latencia y throughput: no se proporcionan datos. Al ser un modelo de difusion, la latencia depende del numero de pasos de denoising configurados; tipicamente se usan entre 10 y 100 pasos, lo que puede requerir optimizaciones para tiempo real.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoria, ya que se trata de una politica especifica para una tarea robotica concreta y no existe un estandar de referencia en la informacion proporcionada. Modelos como ACT (Action Chunking with Transformers) o VLA (Vision-Language-Action) podrian ser alternativas, pero no se han evaluado en este contexto. Se indica "no disponible".

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea "pick up the duster and place it into the bin" y no generaliza a otras tareas u objetos sin reentrenamiento.
- No se han publicado resultados de evaluacion en el robot real, por lo que se desconoce su tasa de exito y robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- El dataset de entrenamiento es pequeno (51 episodios), lo que puede limitar la capacidad de generalizacion y aumentar el riesgo de sobreajuste.
- Al ser un modelo de difusion, la generacion de acciones puede ser lenta si se usan muchos pasos de denoising; es necesario ajustar el numero de pasos para equilibrar calidad y latencia.
- No procesa lenguaje natural ni instrucciones textuales; la tarea esta fijada en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de LeRobot y de hardware especifico (robot `so_follower`), lo que puede limitar su portabilidad.
- No se proporcionan pesos cuantizados ni formatos alternativos (GGUF, ONNX), por lo que el despliegue en entornos sin PyTorch o CUDA puede ser complejo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ShubhamK32/diffusion_so101_declutter
- Dataset de entrenamiento: https://huggingface.co/datasets/ShubhamK32/so101_declutter_v1
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil del autor: https://huggingface.co/ShubhamK32
