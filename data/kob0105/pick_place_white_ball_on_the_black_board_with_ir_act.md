# kob0105/pick_place_white_ball_on_the_black_board_with_ir_act

## Resumen

El modelo `kob0105/pick_place_white_ball_on_the_black_board_with_ir_act` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. Lo publica el usuario kob0105 en Hugging Face usando la librería LeRobot de Hugging Face, y está especializado en una única tarea de manipulación: recoger una pelota blanca situada sobre una superficie negra y colocarla en otro punto.

A diferencia de los modelos de lenguaje, no procesa texto: consume el estado articular de un brazo robótico `so_follower` (vector de 6 dimensiones) junto con dos flujos de imagen de 480x640 píxeles (cámara global y cámara de muñeca) y devuelve un vector de acción de 6 dimensiones. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo pequeño que puede ejecutarse en hardware de consumo, incluso en CPU para pruebas de baja frecuencia.

Su relevancia es práctica más que arquitectónica: sirve como ejemplo reproducible de entrenamiento ACT con LeRobot 0.6.1 (100.000 pasos, batch 8, learning rate 1e-5, semilla 1000) sobre un dataset propio de 50 episodios y 27.875 fotogramas a 30 FPS, y como punto de partida para ajustar una política a un montaje concreto de cámara y robot.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), aprendizaje por imitación; transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: no es un modelo de lenguaje; consume una observación fija (estado de 6 dimensiones + dos imágenes de 3x480x640) y produce un chunk de acciones de 6 dimensiones |
| Tipos de cuantizacion | No disponible (el repositorio solo publica pesos en safetensors, sin variantes GGUF, INT8 ni cuantizaciones documentadas) |
| Idiomas soportados | No disponible / no aplica (el modelo no procesa lenguaje natural; la tarea se especifica con la cadena "pick place white ball NoIR") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el artículo arXiv:2304.13705. La política combina un codificador visual (que procesa las dos cámaras, `global` y `palm`, a 480x640) con un transformer que modela la secuencia de acciones, y predice un chunk de acciones de corto horizonte en lugar de una única acción por paso. Esta estrategia reduce el error de acumulación típico de las políticas reactivas y permite un control más suave, a costa de requerir datos de teleoperación de calidad.

Los datos de entrenamiento provienen del dataset `kob0105/pick_place_white_ball_on_black_board_NoIR_20260916_134610`: 50 episodios, 27.875 fotogramas, 30 FPS, con la tarea "pick place white ball NoIR". La configuración declarada es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000, todo con LeRobot 0.6.1. El nombre del repositorio y del dataset indican el uso de una cámara sin filtro IR (NoIR), lo que condiciona la distribución de color y la iluminación de las imágenes vistas durante el entrenamiento. No se documenta ningún tipo de ajuste por refuerzo, DPO ni RLHF: es aprendizaje supervisado a partir de demostraciones.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 6 grados de libertad para un brazo `so_follower` a partir de observaciones visuales y de estado.
- Percepción multimodal de dos vistas: integra una cámara global (contexto de la escena) y una cámara en la muñeca (`palm`), útil para el momento del agarre.
- Ejecución de una tarea concreta: "pick place white ball NoIR" (recoger una pelota blanca y colocarla).
- Predicción por chunks de acciones: salida secuenciada en lugar de paso a paso, lo que favorece movimientos continuos.
- Integración con LeRobot: se ejecuta con `lerobot-rollout` sobre hardware `so_follower` y se puede reentrenar con `lerobot-train`.
- No dispone de tool calling, function calling, razonamiento multi-paso simbólico, visión general, audio ni modo de pensamiento: sus capacidades están limitadas a la política entrenada.

## Casos de uso

- Automatización de pick-and-place en laboratorio o línea de montaje: el modelo recoge una pieza (en este caso una pelota blanca) de una superficie negra y la deposita en la posición aprendida durante la teleoperación, usando la cámara global para localizar el objeto y la de muñeca para afinar el agarre.
- Punto de partida para fine-tuning con datos propios: con 51,7 millones de parámetros y 100.000 pasos de entrenamiento documentados, una configuración equivalente es asequible en una sola GPU; se puede reentrenar con `lerobot-train` sobre un dataset propio de unas pocas decenas de episodios.
- Replicación sobre una flota de brazos SO-100/SO-101: al ser una política `so_follower` con licencia Apache 2.0, se puede desplegar en varias unidades del mismo modelo de robot para tareas repetitivas de clasificación de objetos.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible (semilla 1000, batch 8, lr 1e-05, LeRobot 0.6.1) para comparar variantes de ACT, número de episodios o resolución de cámara en condiciones controladas.
- Operación con iluminación reducida o cámaras sin filtro IR: al haberse entrenado con datos NoIR, es adecuado en montajes donde se emplean cámaras sin filtro infrarrojo y con luz artificial estable, siempre que la distribución visual se mantenga cercana a la del dataset.
- Docencia y prototipado en robótica: el flujo completo (grabar con `lerobot-rollout`, entrenar, evaluar) se puede reproducir en un aula o taller con un brazo de bajo coste y una GPU de gama media.
- Generación de datos sintéticos o de evaluación interna: usar la política como baseline en un pipeline de evaluación por tareas, comparando tasas de éxito ante cambios de posición del objeto o de iluminación.
- Manipulación con oclusión parcial: la combinación de vista global y vista de muñeca ayuda cuando el objeto queda parcialmente oculto por la propia garra durante la aproximación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación vacía, con el texto explícito de que todavía no se han proporcionado resultados de evaluación para esta política. Tampoco hay tasas de éxito, número de ensayos ni métricas de latencia en la información proporcionada.

| Benchmark | Resultado |
|---|---|
| Evaluación en robot real (tasa de éxito) | No disponible |
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | No aplica (no es un modelo de lenguaje) |

El artículo de ACT (arXiv:2304.13705) reporta resultados del método en distintos entornos, pero no constituyen una evaluación de esta política concreta.

## Requisitos de hardware

- Peso del modelo: 51.668.614 parámetros; aproximadamente 0,21 GB en fp32 y 0,10 GB en fp16 (estimación a partir del recuento real de parámetros). El repositorio completo ocupa 0,2 GB.
- VRAM estimada para inferencia: por debajo de 2 GB en fp32 incluyendo las activaciones de dos imágenes de 3x480x640 (estimación; no hay medición publicada).
- GPU recomendadas: cualquier GPU con soporte CUDA sirve; no se necesitan A100 ni H100. Una RTX 3060, RTX 4070 o RTX 4090 es más que suficiente, y también son viables Apple Silicon (MPS) y CPU para pruebas lentas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna con al menos 4 GB de VRAM; en CPU la inferencia es posible pero puede no sostener el bucle de control a 30 FPS.
- Opciones de despliegue: `lerobot-rollout` con `--strategy.type=base` sobre un robot `so_follower`; el entrenamiento se realiza con `lerobot-train` y `--policy.device=cuda`. No aplican servidores de inferencia de LLM como vLLM, TGI u Ollama, porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia del montaje, el control se ejecuta a 30 FPS, lo que fija un presupuesto de 33 ms por paso, aunque el chunking permite inferir con menor frecuencia que la del bucle de control.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos comparativos (parámetros, contexto, tasas de éxito, licencia) de otras políticas ACT o de métodos alternativos. Se indican a continuación alternativas de la misma categoría, con los campos marcados como no disponibles al no figurar en la documentación consultada.

| Modelo | Tipo | Parametros | Contexto / observacion | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| kob0105/pick_place_white_ball_on_the_black_board_with_ir_act | ACT (imitación) | 51.668.614 | Estado 6D + 2 imágenes 3x480x640; salida de acción 6D | apache-2.0 | Hugging Face (LeRobot) | No disponible |
| Otras políticas ACT publicadas en LeRobot | ACT (imitación) | No disponible | Depende del dataset | No disponible | Hugging Face (LeRobot) | No disponible |
| Diffusion Policy (familia de políticas por difusión) | Imitación generativa | No disponible | Depende del dataset | No disponible | Repositorios de investigación | No disponible |
| SmolVLA (familia de VLA pequeños) | Vision-Language-Action | No disponible | Depende del modelo | No disponible | Hugging Face | No disponible |

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea ("pick place white ball NoIR") sobre una superficie negra concreta; cambiar de objeto, color de fondo o posición de trabajo degradará el comportamiento de forma impredecible.
- Dataset reducido: 50 episodios y 27.875 fotogramas son un volumen bajo, con riesgo alto de sobreajuste a la disposición exacta de la escena y a las trayectorias del operador que teleoperó.
- Sin evaluación publicada: no hay tasa de éxito, número de ensayos ni condiciones de prueba, por lo que no se puede estimar su fiabilidad en producción.
- Dependencia del montaje de sensores: las claves de observación (`observation.images.global`, `observation.images.palm`) y las resoluciones (480x640) deben coincidir exactamente con el hardware de despliegue; modificar cámaras, índices o frecuencia de captura invalida la política.
- Sensibilidad a la iluminación y al sensor: al haberse entrenado con datos NoIR (sin filtro infrarrojo), cambios en el espectro de la luz, en el balance de blancos o en el sensor pueden alterar la distribución visual de entrada.
- Sin capacidades de lenguaje ni de razonamiento simbólico: no admite instrucciones en lenguaje natural, tool calling ni planificación multi-paso; la tarea se fija mediante la cadena `--task` y debe coincidir con la del entrenamiento.
- Riesgo físico: es una política de control de un brazo real; una predicción errónea puede provocar colisiones, agarres fallidos o movimientos bruscos. Requiere límites de par, paradas de emergencia y espacio de trabajo despejado.
- Idiomas y sesgos: no disponibles; al no procesar lenguaje, no aplican sesgos lingüísticos, pero sí sesgos derivados de la escena y de las demostraciones humanas.
- Licencia: apache-2.0 permite uso comercial y modificación, pero no exime de cumplir la normativa de seguridad aplicable a robots y de citar el método (arXiv:2304.13705) y LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kob0105/pick_place_white_ball_on_the_black_board_with_ir_act
- Dataset de entrenamiento: https://huggingface.co/datasets/kob0105/pick_place_white_ball_on_black_board_NoIR_20260916_134610
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kob0105/pick_place_white_ball_on_black_board_NoIR_20260916_134610
- Artículo de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

Nota: las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces listados proceden de la información de Hugging Face y de la propia model card.
