# 08semi/lekiwi_act2

## Resumen

`08semi/lekiwi_act2` es una política de imitación para robótica entrenada con el método Action Chunking with Transformers (ACT) y publicada en el Hub mediante la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visomotor que consume el estado articular del robot y dos flujos de vídeo (cámara frontal y de muñeca) para producir directamente comandos de acción de 9 dimensiones. El modelo lo publica el usuario `08semi` y está asociado al robot `lekiwi_client`, una plataforma móvil de bajo coste del ecosistema LeKiwi.

El interés técnico es limitado pero representativo del flujo actual de robótica open source: un transformer de 51,67 millones de parámetros entrenado con 1000 pasos sobre un único episodio de 806 fotogramas a 30 FPS. Es, por tanto, una prueba de concepto de pipeline de aprendizaje por imitación más que un modelo listo para producción. Su relevancia radica en que ejemplifica cómo LeRobot permite grabar teleoperación, entrenar una política ACT y desplegarla con `lerobot-rollout` en pocos comandos.

La ficha describe sus especificaciones reales, sus entradas y salidas, las limitaciones derivadas del dataset de entrenamiento y las opciones de despliegue. No se han publicado resultados de evaluación en robot real ni benchmarks, y la licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.674.761 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación de la política) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las instrucciones de tarea son texto libre) |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors |
| Tipo de robot | `lekiwi_client` |
| Cámaras de entrada | `front` (3, 480, 640) y `wrist` (3, 640, 480) |
| Estado de observación | `observation.state` de forma `(9,)` |
| Salida de acción | `action` de forma `(9,)` |
| Dataset de entrenamiento | `08semi/dataset19`: 1 episodio, 806 fotogramas, 30 FPS |
| Pasos de entrenamiento | 1000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Versión de LeRobot | 0.7.1 |
| Tamaño del repositorio | 0,6 GB |
| Descargas | 78 |
| Likes | 0 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705 que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales. La arquitectura combina un codificador de imágenes (típicamente un ResNet preentrenado) que procesa las dos cámaras, una proyección del estado articular de 9 dimensiones y un transformer codificador-decodificador que genera la secuencia de acciones. La predicción por chunks reduce el error de acumulación y mitiga el problema de las pausas en datos de teleoperación, lo que suele traducirse en tasas de éxito más altas que políticas paso a paso.

El entrenamiento se realizó con LeRobot 0.7.1 durante 1000 pasos, con batch de 8, AdamW y learning rate 1e-05 sobre el dataset `08semi/dataset19`. Ese dataset contiene un único episodio de 806 fotogramas a 30 FPS, es decir, unos 27 segundos de teleoperación, con la descripción de tarea genérica «My task description». No se documenta composición del dataset, aumentos de datos, número de tokens ni fases de RLHF o DPO (no aplicables en este paradigma). Tampoco se especifica si se congelaron las capas del backbone visual ni la configuración exacta de la pérdida.

## Capacidades

- Control visomotor de un robot móvil LeKiwi a partir de dos cámaras y del estado articular de 9 dimensiones.
- Generación de acciones de 9 grados de libertad en forma de chunks, lo que suaviza la ejecución y reduce el jitter.
- Aprendizaje por imitación a partir de teleoperación: reproduce la política demostrada en el episodio de entrenamiento.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con `--strategy.type=base`.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No dispone de razonamiento multi-paso simbólico ni planificación de tareas; la «tarea» es una cadena de texto que se pasa como condicionamiento.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento.
- No se han documentado capacidades de generalización a objetos, posiciones o iluminación distintas de las del entrenamiento.

## Casos de uso

- Prueba de concepto de pipeline de imitación: grabar un episodio con LeKiwi, entrenar con `lerobot-train` y desplegar con `lerobot-rollout` para validar la cadena completa de LeRobot antes de invertir en datasets mayores.
- Reproducción de una tarea única de manipulación o navegación: al haberse entrenado con un solo episodio, sirve para replicar exactamente la secuencia demostrada en condiciones similares de iluminación y posición de objetos.
- Docencia y talleres de robótica: el modelo y su dataset asociado permiten ilustrar el flujo de ACT con un ejemplo mínimo y comprensible en una sesión práctica.
- Base para fine-tuning: los pesos safetensors pueden servir como inicialización para reentrenar con un dataset propio de LeKiwi, aprovechando el backbone visual ya ajustado.
- Validación de hardware y calibración: ejecutar la política permite comprobar que las cámaras, el puerto del robot y las claves de observación (`observation.images.front`, `observation.images.wrist`, `observation.state`) están correctamente configurados.
- Comparación de métodos de imitación: sirve como referencia ACT frente a otras políticas de LeRobot (por ejemplo, Diffusion Policy) sobre el mismo robot y dataset.
- Demostración en entornos controlados: presentaciones o vídeos donde se necesita un comportamiento repetible y acotado, sin requisitos de robustez ante variaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: «No evaluation results have been provided for this policy yet». No hay tasas de éxito en robot real, ni comparaciones con otras políticas sobre el mismo dataset, ni métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,67 millones de parámetros en safetensors; en FP32 ocupa aproximadamente 0,2 GB de pesos, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más, incluidas GTX 1650, RTX 3050 y superiores.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente; para entrenamiento se recomienda al menos una RTX 3060 de 12 GB o superior, aunque el entrenamiento documentado (batch 8, 1000 pasos) es viable en GPUs de gama media.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU consumer modernas; también podría ejecutarse en CPU, aunque con mayor latencia por frame.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=08semi/lekiwi_act2`; el resto de la pila (vLLM, llama.cpp, Ollama, TGI) no aplica porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. La política debe ejecutarse a 30 FPS para coincidir con la frecuencia del dataset, pero no se documenta el tiempo de inferencia por chunk ni el hardware utilizado.

## Comparativa con modelos similares

| Modelo | Método | Parámetros | Dataset | Robot | Licencia | Evaluación publicada |
|---|---|---|---|---|---|---|
| `08semi/lekiwi_act2` | ACT | 51,67 M | 1 episodio, 806 frames | lekiwi_client | no disponible | no |
| Políticas ACT de referencia en LeRobot | ACT | ~50 M (depende de backbone) | variable, típicamente decenas de episodios | SO-100, Koch, Aloha | Apache 2.0 (código LeRobot) | variable |
| Diffusion Policy en LeRobot | Diffusion Policy | variable (UNet o transformer) | variable | SO-100, PushT, etc. | Apache 2.0 (código LeRobot) | variable |

No se dispone de datos públicos de benchmarks que permitan comparar el rendimiento de `08semi/lekiwi_act2` con alternativas sobre la misma tarea. La comparación se limita a método, tamaño y configuración de entrenamiento.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo: un solo episodio de 806 fotogramas (unos 27 segundos) y 1000 pasos de entrenamiento; la política probablemente sobreajusta y no generaliza a posiciones, objetos o iluminación distintas.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no puede afirmarse que la política funcione de forma fiable.
- Descripción de tarea genérica («My task description»): el condicionamiento textual no aporta información semántica útil y puede degradar el comportamiento si se cambia la cadena en inferencia.
- Licencia no especificada: la model card indica «More Information Needed»; no hay garantía de uso comercial y conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin información sobre sesgos: al ser un modelo de control robótico, los sesgos relevantes son los del dataset de teleoperación (posiciones, velocidades, objetos), no sesgos lingüísticos.
- Riesgo de fallo silencioso: una política de imitación puede ejecutar acciones incorrectas sin señal de error; es necesario supervisión humana y paradas de emergencia en el robot.
- Dependencia de la configuración exacta: las cámaras deben llamarse `front` y `wrist` y tener las resoluciones indicadas; cualquier cambio en la disposición de sensores invalida la política.
- Sin soporte de cuantización documentado: los pesos están en safetensors sin variantes GGUF u ONNX publicadas.
- Repositorio pequeño (0,6 GB) y con 78 descargas: ecosistema de validación muy limitado, sin issues ni discusiones públicas conocidas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/08semi/lekiwi_act2
- Dataset de entrenamiento: https://huggingface.co/datasets/08semi/dataset19
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=08semi/dataset19
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
