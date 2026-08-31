# HyeonseokE/smolvla_phase1_sort_by_color_A1_3000_10fps

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto desarrollado por Hugging Face, diseñado para control robótico con un coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este repositorio concreto contiene un fine-tune del modelo base `lerobot/smolvla_base` realizado por el usuario HyeonseokE para una tarea específica de clasificación de bloques por color en un robot SO-101. El modelo recibe imágenes de varias cámaras, el estado del robot y una instrucción en lenguaje natural, y genera acciones de control de 6 dimensiones.

El modelo tiene 450 millones de parámetros, lo que lo sitúa en una categoría muy ligera frente a otros VLA como OpenVLA (7B) o RT-2 (55B). Se ha entrenado sobre un dataset de 100 episodios (74.322 frames a 10 FPS) recogido mediante simulación en Isaac Sim con etiquetas de habilidades en lenguaje natural. Su relevancia radica en demostrar que es posible adaptar un VLA preentrenado a una tarea robótica concreta con un dataset pequeño y recursos computacionales modestos, usando el ecosistema LeRobot.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas. No se han publicado resultados de evaluación en el repositorio, por lo que el rendimiento real en el robot no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) compacto, basado en SmolVLA (VLM preentrenado + action expert) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (probablemente ingles, no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un modelo de lenguaje y vision preentrenado con un "action expert" que genera comandos de control. La arquitectura exacta del modelo base no se detalla en la informacion disponible, pero se sabe que es un modelo compacto de 450M parametros, significativamente mas pequeno que otros VLA. El fine-tune se realizo con la libreria LeRobot (version 0.6.0) partiendo de `lerobot/smolvla_base`.

El entrenamiento se llevo a cabo durante 58.050 pasos con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0.0001, con semilla 3000. El dataset de entrenamiento, `HyeonseokE/phase1_sort_by_color_A1_10fps`, contiene 100 episodios y 74.322 frames a 10 FPS, recogidos mediante SCRAPE-IsaacLab en Isaac Sim, con la tarea "Sort the blocks onto the matching colored dishes". No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; se trata de un fine-tune por imitacion supervisada.

## Capacidades

- Control robotico de manipulacion: genera acciones de 6 dimensiones (posiciones o velocidades articulares) a partir de observaciones de estado y multiples vistas de camara.
- Comprension de instrucciones en lenguaje natural: la tarea se especifica mediante una frase ("Sort the blocks onto the matching colored dishes") que condiciona la generacion de acciones.
- Percepcion visual multi-camara: el modelo acepta tres imagenes de 256x256 píxeles (aunque la model card menciona dos camaras, el input define tres).
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y despliegue de LeRobot, incluyendo los comandos `lerobot-rollout` y `lerobot-train`.
- No incluye capacidades de generacion de texto, tool calling, agentes ni razonamiento multi-paso fuera del ambito robotico.

## Casos de uso

- Clasificacion automatizada de objetos por color en entornos industriales: el modelo puede controlar un brazo robotico para separar bloques de colores en platos correspondientes, una tarea tipica de logistica o reciclaje.
- Investigacion en aprendizaje por imitacion: sirve como ejemplo de fine-tune de un VLA base sobre un dataset pequeno, util para estudiar la transferencia de habilidades en robotica.
- Prototipado rapido de politicas robotica: con LeRobot, un investigador puede entrenar y desplegar esta politica en un robot SO-101 en pocas horas, sin necesidad de infraestructura de alto rendimiento.
- Validacion de algoritmos de control en simulacion: el modelo puede ejecutarse en entornos simulados (Isaac Sim) para probar estrategias antes de pasar al robot real.
- Educacion en robotica y VLA: al ser ligero y de codigo abierto, es adecuado para cursos y talleres donde se ensena a construir y evaluar modelos de vision-lenguaje-accion.
- Automatizacion de tareas repetitivas en entornos controlados: cualquier tarea de manipulacion que requiera seguir una instruccion simple y operar con pocas articulaciones puede beneficiarse de este enfoque.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been provided for this policy yet"). No se proporcionan metricas como tasa de exito, MMLU, HumanEval ni otras comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada: con 450M parametros, en precision fp32 se necesitan aproximadamente 1,8 GB de VRAM; en fp16, unos 0,9 GB. Esto permite ejecutar el modelo en GPUs de consumo como RTX 3060 (12 GB), RTX 4070, RTX 4090, o incluso en placas con menos memoria si se usa cuantizacion (aunque no se han publicado cuantizaciones).
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM es suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8-12 GB (por ejemplo, RTX 3080 o superior).
- Despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia en tiempo real con `lerobot-rollout`. No se menciona compatibilidad con vLLM, TGI u otros servidores de inferencia, ya que es un modelo de robotica, no de lenguaje.
- Latencia y throughput: no se proporcionan datos. Dado el tamano del modelo, se espera una latencia de pocos milisegundos por paso en una GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso |
|---|---|---|---|---|
| SmolVLA (este fine-tune) | 450M | no disponible | Apache 2.0 | Robotica, tarea especifica |
| OpenVLA | 7B | 2048 tokens | Apache 2.0 | Robotica generalista |
| RT-2 (Google) | 55B | no disponible | Propietaria | Robotica generalista |

SmolVLA es significativamente mas pequeno que OpenVLA y RT-2, lo que permite ejecutarlo en hardware de consumo y fine-tunearlo con datasets reducidos. Sin embargo, no se dispone de comparativas de rendimiento en tareas robotica estandarizadas. OpenVLA tiene una ventana de contexto de 2048 tokens y soporta instrucciones mas complejas, mientras que este fine-tune esta limitado a la tarea de clasificacion por color. La licencia Apache 2.0 de SmolVLA y OpenVLA permite uso comercial, a diferencia de RT-2.

## Limitaciones y advertencias

- No hay resultados de evaluacion: el rendimiento real en el robot no esta verificado; la model card indica que no se han proporcionado resultados.
- Dataset pequeno y especifico: 100 episodios de una sola tarea pueden provocar sobreajuste y falta de generalizacion a otras configuraciones, objetos o entornos.
- Dependencia de la simulacion: los datos se recogieron en Isaac Sim, por lo que puede haber una brecha de realidad (sim-to-real) al transferir al robot fisico.
- Sin soporte multilingue: no se especifican idiomas; probablemente solo ingles, y la instruccion esta fijada en ingles.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF u otras cuantizaciones, lo que limita el despliegue en hardware muy restringido.
- Sin capacidades de lenguaje general: no es un modelo de chat ni de generacion de texto; solo produce acciones de control.
- Posible inconsistencia en la model card: se mencionan dos camaras (top, left_wrist) pero el input define tres imagenes; esto puede indicar un error en la documentacion o una configuracion no estandar.

## Enlaces

- Repositorio del modelo: https://huggingface.co/HyeonseokE/smolvla_phase1_sort_by_color_A1_3000_10fps
- Paper de SmolVLA: https://arxiv.org/abs/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/phase1_sort_by_color_A1_10fps
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
