# sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_10k

## Resumen

Este repositorio contiene un *policy* de robótica (visión-lenguaje-acción) obtenido por *fine-tuning* del modelo base `lerobot/pi05_base`, publicado por el usuario `sam-guided-vlas`. π₀.₅ (Pi05) es un modelo visión-lenguaje-acción desarrollado por Physical Intelligence y orientado a la generalización en entornos abiertos; la implementación que se usa aquí procede del repositorio OpenPI adaptado por LeRobot.

El modelo consume observaciones multimodales (estado propioceptivo de 9 dimensiones y tres cámaras de 224x224) y produce acciones de 7 dimensiones, por lo que no es un modelo de lenguaje conversacional sino un controlador de manipulacion para un robot Franka Panda. Tiene 4.143.404.816 parametros (~4,14 mil millones) y pesa 9,4 GB en el repositorio.

Es relevante en el contexto de la investigacion en *vision-language-action*: se trata de un experimento de *fine-tuning* reproducible (10 000 pasos, semilla 0, LeRobot 0.6.0) sobre un conjunto de datos de simulacion con 200 episodios y 69 392 fotogramas para 20 tareas de recogida de objetos. Su interes principal es metodologico (evaluacion de estrategias guiadas por SAM y de esquemas de *overlay* de mascaras) mas que de produccion, dado que no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅; detalles internos de la red no disponibles en la informacion proporcionada |
| Parametros totales | 4.143.404.816 (~4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, presumiblemente en precision completa o bf16) |
| Idiomas soportados | no aplica como modelo de lenguaje; las etiquetas de tarea del dataset estan en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | Panda (Franka Emika) |
| Camaras | `agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2` |
| Entrada de estado | `observation.state`, forma `(9,)` |
| Entradas visuales | 3 imagenes RGB de `(3, 224, 224)` |
| Salida | `action`, forma `(7,)` |
| Modelo base | `lerobot/pi05_base` |
| Tamano del repositorio | 9,4 GB |

## Arquitectura y entrenamiento

La model card indica que π₀.₅ es un modelo visión-lenguaje-acción de Physical Intelligence disenado para generalizar a entornos y situaciones no vistos durante el entrenamiento, y que evoluciona el modelo π₀. La implementacion empleada aqui es la de LeRobot, adaptada del repositorio OpenPI. No se detalla en la informacion disponible la composicion exacta del *backbone* (codificador visual, torre de lenguaje, cabecera de acciones), el numero de capas ni el mecanismo de atencion, por lo que esos datos se consideran no disponibles.

El *fine-tuning* se realizo con LeRobot 0.6.0 sobre el dataset `sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live`: 200 episodios, 69 392 fotogramas a 20 FPS y 20 tareas de recogida (entre ellas "basket", "can", "hamburger", "lemon", "kettle", "potato", "scone"). La configuracion de entrenamiento fue de 10 000 pasos, tamano de lote 16, optimizador AdamW, tasa de aprendizaje 5e-05 y semilla 0. No se especifica en la informacion proporcionada si hubo RLHF, DPO u otra fase de alineamiento adicional.

## Capacidades

- Control de manipulacion robotica: genera trayectorias de accion de 7 dimensiones (posicion y orientacion del efector mas pinza) a partir de observaciones visuales y de estado.
- Fusión multimodal de tres camaras simultaneas: vista de agente y dos vistas de muneca (`eye_in_hand`), lo que permite razonamiento espacial desde multiples puntos de vista.
- Ejecucion de tareas de recogida (*pick*) sobre 20 categorias de objetos distintos definidas como etiquetas de tarea.
- Politica de imitacion entrenada por *behavior cloning* sobre demostraciones, sin necesidad de recompensa explicita.
- Inferencia en tiempo real a 20-30 FPS de captura, compatible con el bucle de control de un Panda.
- No se documenta soporte de *tool calling*, function calling, agentes multi-paso ni modo de razonamiento explicito.
- No se documentan capacidades multilingues, de vision general, audio ni generacion de texto libre.

## Casos de uso

- Recogida y clasificacion de objetos en simulacion: el modelo puede ejecutar tareas de *pick* sobre las 20 categorias del dataset (alimentos, utensilios, envases) en un entorno simulado con robot Panda, sirviendo como linea base reproducible para comparar variantes.
- Investigacion en *vision-language-action*: al estar entrenado desde `lerobot/pi05_base` con hiperparametros y semilla fijados, permite reproducir y aislar el efecto de cambios en el dataset (por ejemplo, el uso de mascaras SAM y *overlay* al 75 %) sobre el rendimiento final.
- Estudio de esquemas de aumento de datos: el nombre del dataset sugiere variantes de mascaras y superposicion; el modelo puede usarse para medir si esas transformaciones mejoran la generalizacion en tareas de apilado.
- Prototipado de pipelines de imitacion con LeRobot: sirve como ejemplo de referencia para validar el flujo completo (`lerobot-train`, `lerobot-rollout`) antes de pasar a datos reales.
- Automatizacion de recogida en linea de laboratorio simulado: integrable en un bucle de control que ejecuta ciclos de 60 segundos con `--strategy.type=base` sin grabacion de episodios.
- Evaluacion comparativa de *checkpoints*: dado que solo se han entrenado 10 000 pasos, es util para analizar la curva de aprendizaje frente a *checkpoints* intermedios o al modelo base sin ajustar.
- Docencia y formacion en robotica: permite demostrar el ciclo completo de percepcion, decision y accion sobre un robot Franka Panda con hardware estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la nota «No evaluation results have been provided for this policy yet», por lo que no existe tabla de tareas, numero de ensayos ni tasa de exito.

## Requisitos de hardware

- VRAM estimada para inferencia (4,14 mil millones de parametros): aproximadamente 8,3 GB en bf16/fp16, unos 16,6 GB en fp32 y alrededor de 4,2 GB con cuantizacion int8. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- El repositorio ocupa 9,4 GB, coherente con pesos en bf16 o fp32 mas optimizador.
- GPU recomendadas: cualquier GPU con al menos 8-12 GB de VRAM para bf16; una RTX 4090 (24 GB), A100 (40/80 GB) o H100 ofrecen margen holgado para lotes mayores y procesamiento de tres flujos de imagen.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070, RTX 4090), siempre que se use bf16 y se controle el tamano de lote.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path` y `--policy.device=cuda`), PyTorch con CUDA. No se documenta soporte para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. El modelo se usa con camaras a 20-30 FPS, pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi05 fine-tuned) | 4.143.404.816 | no disponible | sin evaluacion publicada | apache-2.0 | HuggingFace, libreria `lerobot` |
| `lerobot/pi05_base` | no disponible en la informacion proporcionada | no disponible | no disponible | apache-2.0 (heredada) | HuggingFace |
| `lerobot/pi0_base` (π₀) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Otros VLA de manipulacion (p. ej. OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion: se desconoce la tasa de exito real del *policy* en cualquiera de sus 20 tareas.
- Entrenado sobre datos de simulacion (el nombre del dataset incluye `sim`), por lo que la transferencia a un robot fisico no esta validada y probablemente requiera ajuste adicional.
- Las 20 tareas estan limitadas a objetos y escenas concretas del dataset; no hay evidencia de generalizacion a objetos, iluminacion o disposiciones nuevas.
- Solo se han ejecutado 10 000 pasos de entrenamiento sobre 69 392 fotogramas, una cantidad reducida que puede implicar infraajuste.
- Las camaras deben coincidir exactamente con las claves de observacion del entrenamiento (`agentview`, `robot0_eye_in_hand`, `robot0_eye_in_hand_2`); un cambio de montaje o de nombre rompe la politica.
- Asociado especificamente al robot Franka Panda con estado de 9 dimensiones; no es portable directamente a otras morfologias.
- No es un modelo de lenguaje: no soporta dialogo, generacion de texto, *tool calling* ni agentes.
- Riesgo de sobreajuste al entorno simulado y de *distribution shift* ante cambios de dinamica (friccion, masas, latencias) al pasar a hardware real.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales que conviene verificar antes de un despliegue en produccion.
- Sesgos: no evaluados ni documentados por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live__pi05__seed_0__steps_10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=sam-guided-vlas/train_1_2_pile__mask__overlay_a75__sim__all_cameras__live
- Blog de π₀.₅ (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio OpenPI: no se proporciona URL directa en la informacion disponible
