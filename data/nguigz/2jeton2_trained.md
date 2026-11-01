# nguigz/2jeton2_trained

## Resumen

`nguigz/2jeton2_trained` es una política de imitación entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. No es un modelo de lenguaje: es un controlador robótico que mapea observaciones (estado articular de 6 dimensiones y dos cámaras RGB de 240x320) a comandos de acción de 6 dimensiones, pensado para el robot `so_follower` del ecosistema LeRobot de Hugging Face. El autor es el usuario `nguigz`, y el modelo se distribuye con licencia Apache 2.0.

El modelo resuelve una tarea concreta de manipulación: "mettre le jeton dans le bac" (introducir una ficha en una bandeja). Se entrenó sobre un dataset propio de 48 episodios y 14.294 fotogramas a 30 FPS, con 100.000 pasos de entrenamiento y batch size 8. Con 51.668.614 parámetros y un repo de 0,2 GB, es un modelo compacto que cabe en cualquier GPU consumer moderna.

Su relevancia es acotada y práctica: sirve como ejemplo reproducible de un pipeline completo de imitation learning con LeRobot (grabación de datos, entrenamiento con ACT, despliegue con `lerobot-rollout`), no como un modelo generalista. Cualquier evaluación de rendimiento en robot real está pendiente: la model card indica explícitamente que no se han proporcionado resultados de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; consume observaciones por paso) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica como cadena de texto fija) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

ACT es un transformer de imitación que predice chunks de acciones (varios pasos futuros de una vez) en lugar de una acción por paso, lo que reduce el error de acumulación y suaviza el control. El modelo consume `observation.state` de forma `(6,)` y dos imágenes `observation.images.front` y `observation.images.top` de forma `(3, 240, 320)`, y produce `action` de forma `(6,)`. La implementación concreta corresponde a LeRobot 0.6.2.

El entrenamiento se realizó sobre el dataset `nguigz/2jeton2`: 48 episodios, 14.294 fotogramas a 30 FPS, una única tarea. Configuración: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000. No se documenta en la información disponible el número de tokens de entrenamiento (no aplica), la composición del dataset más allá del recuento de episodios, ni si hubo fases de RLHF/DPO (no aplica a imitation learning). Tampoco se detalla la arquitectura interna del codificador visual más allá de lo que define ACT.

## Capacidades

- Control robótico por imitación para el robot `so_follower` con dos cámaras (`front`, `top`).
- Predicción de chunks de acciones de 6 dimensiones a partir de estado articular e imágenes.
- Ejecución de una tarea específica: introducir una ficha en una bandeja.
- Integración con el CLI de LeRobot (`lerobot-rollout` para despliegue, `lerobot-train` para reentrenamiento).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en el sentido de agentes LLM; el "razonamiento" es la política de control.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales fuera de las dos cámaras de entrada.

## Casos de uso

- Reproducción de un pipeline de imitation learning: usar este repo como referencia para grabar un dataset propio, entrenar con `lerobot-train` y desplegar con `lerobot-rollout`, verificando el flujo completo con una tarea sencilla antes de escalar.
- Automatización de una celda de pick-and-place de laboratorio: la política ejecuta la tarea de colocar una ficha en una bandeja sobre un `so_follower`, adecuada para demostraciones controladas con posiciones de objeto estables.
- Benchmark interno de hardware robótico: servir como carga de trabajo fija (51,7 M de parámetros, dos cámaras a 240x320) para medir latencia de inferencia y estabilidad de un `so_follower` recién montado.
- Docencia y formación: ejemplo mínimo y reproducible de ACT con un dataset pequeño (48 episodios) para explicar chunking de acciones, codificación visual y evaluación en robot real.
- Base para fine-tuning: punto de partida para reentrenar con más episodios o variaciones de la tarea, dado que la licencia Apache 2.0 permite uso comercial y modificación.
- Prueba de integración de cámaras: validar la configuración de dos cámaras OpenCV a 30 FPS y la coincidencia de claves de observación (`front`, `top`) en un setup nuevo.
- Prototipado de evaluación: usar la política como sujeto de pruebas para diseñar protocolos de éxito/fracaso por tarea (10 ensayos, tasa de éxito), que la model card deja pendientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con la nota "No evaluation results have been provided for this policy yet." No se dispone de tasas de éxito, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros y pesos en safetensors (repo de 0,2 GB), la huella es muy reducida y cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA para PyTorch; el entrenamiento se realizó con `--policy.device=cuda`. No se especifica el modelo de GPU usado.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se detalla el mínimo verificado.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con `--strategy.type=base`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguigz/2jeton2_trained` (ACT) | 51.668.614 | no aplica | Colocar ficha en bandeja (`so_follower`) | Apache 2.0 | Hugging Face, 21 descargas |
| ACT (paper arXiv:2304.13705) | no disponible | no aplica | Metodo general de imitation learning | no disponible en la informacion | Paper |
| Otros modelos LeRobot ACT en el Hub | no disponible | no aplica | Multiples tareas | variable | Hugging Face |

No se dispone en la información proporcionada de datos de rendimiento de alternativas comparables (por ejemplo, Diffusion Policy u otras políticas de LeRobot) que permitan una comparación cuantitativa. La comparación queda limitada a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay evidencia documentada de tasa de éxito en robot real.
- Dataset muy pequeño (48 episodios, 14.294 fotogramas): alta probabilidad de sobreajuste a posiciones, iluminación y configuración concretas de la mesa de grabación.
- Tarea única y específica: no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware exacto: robot `so_follower` y dos cámaras con claves `front` y `top`; cambios de cámara, montaje o calibración pueden degradar el comportamiento.
- Riesgo de alucinación en el sentido de acciones erráticas o inseguras: como toda política de imitación, puede producir comandos fuera de distribución ante objetos o escenas no vistas.
- Sesgos: no se documentan sesgos demográficos (no procesa personas ni lenguaje), pero sí sesgo de distribución por el dataset limitado.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con las obligaciones habituales de atribución y aviso.
- En producción: requiere supervisión humana, límites de seguridad en el robot y validación previa en el entorno real; la model card no documenta protocolos de seguridad.
- Idiomas: no disponible porque el modelo no procesa lenguaje; la instrucción de tarea es una cadena fija.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguigz/2jeton2_trained
- Dataset de entrenamiento: https://huggingface.co/datasets/nguigz/2jeton2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nguigz/2jeton2
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
