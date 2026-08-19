# maedmatt/DREAM_SmolVLA_unfrozen

## Resumen

DREAM_SmolVLA_unfrozen es un modelo de robótica de tipo vision-language-action (VLA) desarrollado por el usuario maedmatt como un fine-tune del modelo base lerobot/smolvla_base de Hugging Face. Está entrenado para controlar un robot seguidor (so_follower) en la tarea concreta de llenar una pirámide con círculos, a partir de un dataset propio de 151 episodios y más de 81 000 fotogramas. El modelo pertenece a la familia SmolVLA, un enfoque compacto y eficiente de VLA que permite ejecutar políticas robóticas en hardware de consumo, reduciendo los costes computacionales frente a modelos más grandes.

El modelo se distribuye bajo licencia Apache 2.0 y se publica a través del ecosistema LeRobot, lo que facilita su integración en pipelines de aprendizaje por imitación. Con 450 millones de parámetros, es una opción ligera para experimentación robótica en entornos con recursos limitados. Aunque su alcance actual se limita a la tarea específica para la que fue entrenado, sirve como ejemplo práctico de fine-tuning de un VLA base con datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450 046 176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolVLA, descrita en el articulo arxiv 2506.01844, que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para generar comandos de control directamente a partir de observaciones visuales y del estado del robot. En este caso, el modelo recibe tres imagenes de camara (256x256 píxeles cada una) y un vector de estado de 6 dimensiones, y produce un vector de accion de 6 dimensiones que se aplica al robot.

El entrenamiento se realizo mediante aprendizaje por imitacion con LeRobot, partiendo de los pesos del modelo base lerobot/smolvla_base. Se utilizaron 20 000 pasos de entrenamiento con un tamaño de lote de 32, optimizador AdamW y una tasa de aprendizaje de 0.0001. El dataset de entrenamiento, maedmatt/DREAM-pyramid-circles, contiene 151 episodios y 81 266 fotogramas a 30 FPS, con la tarea "Fill the pyramid with circles". No se menciona el uso de tecnicas como RLHF o DPO; el proceso es de fine-tuning supervisado estandar.

## Capacidades

- Control de robot basado en vision: genera acciones de 6 grados de libertad a partir de imagenes y estado.
- Aprendizaje por imitacion: reproduce la politica demostrada en el dataset de entrenamiento.
- Ejecucion en tiempo real: disenado para inferencia a 30 FPS en hardware de consumo.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot.
- Soporte multi-camara: utiliza tres camaras simultaneas para la percepcion.
- Tarea especifica: optimizado para la manipulacion de circulos en una piramide, aunque el enfoque es transferible a otras tareas similares con fine-tuning adicional.

## Casos de uso

- Automatizacion de tareas repetitivas en laboratorio: el modelo puede ejecutar una politica de colocacion de objetos en una estructura determinada, liberando a un operador humano de tareas monotonas.
- Prototipado rapido de politicas roboticas: al ser un fine-tune de un modelo base, permite validar rapidamente si un VLA compacto resuelve una tarea concreta antes de escalar a modelos mayores.
- Investigacion en aprendizaje por imitacion: sirve como referencia para estudiar el efecto del fine-tuning en VLA pequeños con datasets limitados.
- Demostraciones educativas de robotica: por su tamano reducido y licencia permisiva, es adecuado para cursos y talleres donde se ensena control robotico basado en vision.
- Pruebas de concepto en entornos industriales: en lineas de montaje donde se requiere clasificar o colocar piezas, el modelo puede adaptarse con un dataset propio.
- Evaluacion de hardware de consumo: permite medir el rendimiento de GPUs de gama media ejecutando un VLA realista sin necesidad de infraestructura de alto coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: con 450 M de parametros y pesos en fp32, el modelo ocupa aproximadamente 1.8 GB; en fp16 se reduce a unos 0.9 GB. Para inferencia en tiempo real se recomienda al menos 4 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA, como RTX 3060, RTX 4090, A100 o H100. Tambien puede ejecutarse en CPU para pruebas no criticas en tiempo real.
- Compatibilidad con consumer GPU: si, el modelo cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB) sin problemas.
- Opciones de despliegue: LeRobot (rollout via `lerobot-rollout`), compatible con PyTorch. No se mencionan soporte para vLLM, Ollama o TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no se proporcionan datos oficiales; se espera que a 30 FPS sea viable en GPUs modernas, pero depende del hardware y del tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DREAM_SmolVLA_unfrozen | 450 M | VLA robotico | no aplica | Apache 2.0 | Hugging Face |
| OpenVLA | 7 B | VLA robotico | no aplica | MIT | Hugging Face |
| RT-2 (Google) | 55 B | VLA robotico | no aplica | propietaria | no publico |

Comparado con OpenVLA, que tiene 7 B de parametros, este modelo es significativamente mas ligero (450 M), lo que permite ejecutarlo en hardware de consumo y con menor latencia. Sin embargo, OpenVLA esta entrenado en un conjunto de tareas mucho mas amplio, mientras que este fine-tune se limita a una tarea especifica. RT-2 no esta disponible publicamente, por lo que no es una alternativa practica. La eleccion entre SmolVLA y OpenVLA depende del equilibrio entre generalidad y eficiencia: para tareas muy concretas con recursos limitados, SmolVLA es mas adecuado.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha sido entrenado para la tarea "Fill the pyramid with circles"; no es generalizable a otras tareas sin un nuevo fine-tuning.
- Sin evaluacion publicada: no hay resultados de exito en robot real, por lo que su rendimiento efectivo no esta verificado.
- Dependencia del dataset: la calidad de la politica depende de la calidad y diversidad de las demostraciones en el dataset de entrenamiento.
- Riesgo de sobreajuste: con solo 151 episodios, es probable que el modelo no generalice bien a variaciones de posicion, iluminacion o configuracion del robot.
- Sin capacidades de lenguaje: a diferencia de otros VLA, no procesa instrucciones textuales; solo actua sobre observaciones visuales y de estado.
- Requisitos de hardware especificos: necesita el robot so_follower y las camaras configuradas exactamente como en el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que deben verificarse.

## Enlaces

- Repositorio del modelo: https://huggingface.co/maedmatt/DREAM_SmolVLA_unfrozen
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/maedmatt/DREAM-pyramid-circles
- Documentacion de LeRobot (SmolVLA): https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
