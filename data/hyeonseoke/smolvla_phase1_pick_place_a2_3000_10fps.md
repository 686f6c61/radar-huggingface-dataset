# HyeonseokE/smolvla_phase1_pick_place_A2_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico por imitación. Este repositorio concreto, `HyeonseokE/smolvla_phase1_pick_place_A2_3000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` para ejecutar la tarea de pick-and-place: recoger un bloque rojo y colocarlo en un plato azul. El modelo fue entrenado por HyeonseokE utilizando el framework LeRobot, con un dataset propio de 100 episodios grabados a 10 FPS.

El modelo tiene 450 millones de parámetros y está pensado para desplegarse en hardware de consumo, lo que lo hace accesible para laboratorios y desarrolladores con recursos limitados. Su arquitectura integra procesamiento visual (tres cámaras), estado del robot y generación de acciones en un único modelo, siguiendo el enfoque SmolVLA descrito en el artículo arxiv 2506.01844. Este fine-tune se publica bajo licencia Apache 2.0, facilitando su uso y modificación tanto en investigación como en aplicaciones comerciales.

La relevancia de este modelo radica en que demuestra cómo un VLA compacto puede especializarse en una tarea robótica concreta mediante fine-tuning, manteniendo un coste computacional reducido. Es un ejemplo práctico de la tendencia hacia modelos de robótica más pequeños y eficientes, entrenados con pocos datos y desplegables en GPUs de gama media.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion), basado en `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de control robotico, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles (procesa imagenes y estados, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para producir comandos motores directamente a partir de observaciones. La arquitectura exacta interna no se detalla en la informacion disponible, pero se referencia al paper arxiv 2506.01844, donde se describe como un VLA compacto y eficiente diseñado para funcionar en hardware de consumo. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este repositorio es un fine-tuning especifico para la tarea pick-and-place.

El entrenamiento se realizo con el framework LeRobot (version 0.6.0) sobre el dataset `HyeonseokE/phase1_pick_place_A2_10fps`, que contiene 100 episodios y 31.526 frames grabados a 10 FPS. La configuracion de entrenamiento incluye 24.600 pasos, batch size de 64, optimizador AdamW con learning rate de 0.0001 y semilla 3000. El modelo recibe como entrada el estado del robot (6 dimensiones) y tres imagenes de camaras (top, left_wrist y otra no especificada) de 256x256 píxeles, y produce una accion de 6 dimensiones. No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitacion supervisada.

## Capacidades

- Control robotico por imitacion: genera acciones de 6 grados de libertad (posicion y orientacion del efector final) a partir de observaciones visuales y de estado.
- Integracion multi-camara: procesa simultaneamente tres imagenes (camara superior, camara de muñeca izquierda y una tercera) para percibir el entorno.
- Ejecucion de tareas pick-and-place: especificamente entrenado para recoger un bloque rojo y colocarlo en un plato azul.
- Inferencia en tiempo real: al ser un modelo compacto, puede ejecutarse en hardware de consumo con latencia adecuada para control robotico.
- Compatibilidad con LeRobot: integrado con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue en robots SO-101 (so101_follower).
- No es un modelo de lenguaje general: no genera texto, ni soporta tool calling, ni razonamiento conversacional; su unica salida es la accion robotica.

## Casos de uso

- Automatizacion de tareas de pick-and-place en laboratorios: el modelo puede controlar un brazo robotico SO-101 para mover objetos entre posiciones fijas, util en experimentos de manipulacion repetitiva.
- Prototipado rapido de politicas robotica: al ser un fine-tuning con solo 100 episodios, sirve como referencia para que otros desarrolladores aprendan a entrenar sus propios modelos SmolVLA con LeRobot.
- Investigacion en aprendizaje por imitacion: permite estudiar como un VLA compacto se especializa en una tarea concreta, comparando con otros fine-tunes del mismo autor (por ejemplo, con distinta semilla o numero de episodios).
- Demostraciones educativas de robotica con IA: por su tamano reducido y licencia permisiva, es adecuado para cursos y talleres donde se ensena a desplegar politicas neuronales en robots reales.
- Evaluacion de robustez en entornos controlados: dado que la tarea es simple y el dataset tiene una unica instruccion, puede usarse para probar la capacidad del modelo ante variaciones de iluminacion, posicion de objetos o angulos de camara.
- Base para fine-tuning adicional: los pesos publicados pueden servir como punto de partida para adaptar el modelo a tareas similares (por ejemplo, cambiar el color del objeto o la posicion del plato) mediante entrenamiento con nuevos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye una tabla de evaluacion en robot real, y no se encontraron metricas de exito (success rate) ni comparaciones con otros modelos en la documentacion del repositorio.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware para este modelo especifico.
- Dado que el modelo tiene 450 millones de parametros (0.45B), el peso en safetensors ocupa aproximadamente 0.9 GB, lo que sugiere que puede cargarse en GPUs con al menos 4 GB de VRAM en precision FP32, o menos si se cuantiza (aunque no se proporcionan cuantizaciones).
- GPUs recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores serian suficientes para inferencia. No hay datos sobre requisitos de entrenamiento, pero el entrenamiento se realizo con batch size 64, lo que probablemente requirio una GPU de gama alta (por ejemplo, A100) o varias GPU.
- Opciones de despliegue: el modelo esta integrado en LeRobot, por lo que puede ejecutarse con el comando `lerobot-rollout` usando la estrategia `base`. Tambien es compatible con el flujo de trabajo estandar de LeRobot para inferencia en robot real.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos en la informacion disponible. El autor ha publicado otros fine-tunes de SmolVLA para la misma tarea con diferentes semillas o configuraciones (por ejemplo, `smolvla_phase1_pick_place_A2_2000_10fps`), pero no se proporcionan metricas comparativas. El modelo base `lerobot/smolvla_base` es el punto de referencia, pero no se ofrecen resultados de rendimiento en esta ficha. Se recomienda consultar el paper de SmolVLA (arxiv 2506.01844) para comparaciones generales con otros VLA.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo ha sido entrenado para una tarea concreta (pick and place de un bloque rojo en un plato azul) con un robot y configuracion de camaras especificos. No generalizara a otras tareas, objetos o entornos sin reentrenamiento.
- Datos limitados: el entrenamiento se realizo con 100 episodios, lo que puede provocar sobreajuste y falta de robustez ante variaciones no vistas (cambios de iluminacion, posiciones de objetos, etc.).
- Sin evaluacion reportada: la model card indica explicitamente que no hay resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real del modelo.
- Sesgos del dataset: el dataset fue recopilado por un unico operador y en un entorno especifico, lo que puede introducir sesgos en la politica aprendida (por ejemplo, trayectorias particulares o dependencia de la posicion de la camara).
- Riesgo de alucinacion de acciones: como cualquier modelo de imitacion, puede producir acciones incorrectas o inseguras si las observaciones se alejan de la distribucion de entrenamiento. Es necesario implementar salvaguardas de seguridad en entornos reales.
- Sin soporte de lenguaje: aunque SmolVLA es un modelo vision-lenguaje-accion, este fine-tune no procesa instrucciones textuales; la tarea esta fijada en el momento del entrenamiento.
- Restricciones de hardware: aunque es compacto, desplegarlo requiere un robot SO-101 compatible y camaras con los nombres exactos (`top`, `left_wrist`, y una tercera) tal como se definieron en el entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_pick_place_A2_3000_10fps
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_pick_place_A2_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arxiv 2506.01844)
- Documentacion de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
