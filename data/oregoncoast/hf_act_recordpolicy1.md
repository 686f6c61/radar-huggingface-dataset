# oregoncoast/hf_act_recordpolicy1

## Resumen

`oregoncoast/hf_act_recordpolicy1` es una política de robótica basada en ACT (Action Chunking with Transformers), el método de aprendizaje por imitación publicado por Zhao et al. (arXiv:2304.13705) y reimplementado en la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un controlador visuomotor que consume el estado articular del robot y una imagen de cámara frontal, y produce comandos de acción de 6 grados de libertad. El checkpoint lo publica el usuario `oregoncoast` y está entrenado para una única tarea: recoger un bloque de Lego y depositarlo en un contenedor.

El modelo tiene 51.668.614 parámetros (unos 51,7 millones) y ocupa 0,2 GB en el repositorio, en formato safetensors. Se entrenó con el dataset `oregoncoast/lego-pick-place_20261006_140138`, compuesto por 50 episodios teleoperados y 27.257 fotogramas a 30 FPS, sobre un robot de tipo `so_follower` con una sola cámara (`front`) a resolución 240x320. La salida es un vector de acción de dimensión 6.

Su relevancia es la de un ejemplo típico de política de imitación de bajo coste: demuestra el flujo completo de LeRobot (grabación de datos, entrenamiento y despliegue con `lerobot-rollout`) sobre hardware asequible. Es un artefacto de investigación reproducible, no un modelo de propósito general: no tiene licencia declarada, no incluye evaluación publicada y está especializado en un entorno concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con variable latente estilo CVAE y codificador visual convolucional |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política robótica paso a paso; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; pesos en precisión completa) |
| Idiomas soportados | no aplica: la política no está condicionada por lenguaje; la tarea está fijada en la cadena "Pick up the Lego block and place it in the bin" |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors (librería `lerobot`) |

Datos adicionales relevantes de la política:

| Parametro | Valor |
|---|---|
| Tipo de robot | `so_follower` |
| Camaras | `front` (una sola) |
| Entrada `observation.state` | STATE, forma `(6,)` |
| Entrada `observation.images.front` | VISUAL, forma `(3, 240, 320)` |
| Salida `action` | ACTION, forma `(6,)` |
| Pipeline | robotics |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

ACT es un método de imitación que predice *chunks* de acciones (varios pasos futuros de una sola vez) en lugar de un único paso, lo que reduce el problema de acumulación de error y la dependencia de una frecuencia de inferencia alta. La arquitectura combina un codificador visual convolucional para la imagen (3x240x320), un encoder transformer que fusiona la observación visual con el estado articular de 6 dimensiones, y un decoder transformer que genera la secuencia de acciones. Durante el entrenamiento se utiliza una formulación tipo CVAE: una variable latente de estilo se infiere a partir de la secuencia de acciones objetivo y se regulariza con un término KL, de modo que en inferencia el modelo puede generar comportamiento multimodal en lugar de promediar demostraciones distintas. En la ejecución suele aplicarse *temporal ensembling* para suavizar las predicciones solapadas de chunks consecutivos. Estos elementos son características del método descrito en el paper de ACT y de su implementación en LeRobot.

Los datos de entrenamiento proceden exclusivamente de teleoperación humana: 50 episodios, 27.257 fotogramas a 30 FPS, correspondientes a una sola tarea ("Pick up the Lego block and place it in the bin") sobre un robot `so_follower`. La configuración declarada es de 100.000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.6.2. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, algo esperable en una política de imitación. Tampoco se especifican en la información disponible el tamaño de chunk, la dimensión oculta del transformer ni el peso del término KL, que habitualmente son configurables en LeRobot.

## Capacidades

- Control visuomotor de un brazo robótico de 6 grados de libertad (`so_follower`) a partir de una imagen frontal de 240x320 y del estado articular.
- Ejecución de una tarea de pick-and-place concreta: recoger un bloque de Lego y depositarlo en un contenedor.
- Predicción de chunks de acciones, lo que permite un control más estable que la predicción paso a paso.
- Generación de trayectorias multimodales gracias a la variable latente de estilo del esquema CVAE.
- Ejecución en bucle cerrado sobre el robot real mediante `lerobot-rollout`, con la tarea pasada como cadena de texto.
- Compatibilidad con el flujo de LeRobot para grabar datos, reentrenar (`lerobot-train`) y desplegar la política.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso simbólico ni planificación de tareas: ejecuta la política aprendida, sin descomposición explícita de subtareas.
- No dispone de capacidades multilingües, de visión general (VQA, OCR, descripción de imágenes) ni de audio.
- No tiene modo de razonamiento (*thinking mode*) ni condicionamiento por instrucciones en lenguaje natural más allá de la etiqueta de tarea fija.

## Casos de uso

- Automatización de pick-and-place en líneas de montaje o celdas de ensayo: la política ejecuta la secuencia completa de recogida y depósito a 30 FPS, integrándose en un bucle de control con `lerobot-rollout` sobre el mismo tipo de brazo con el que se entrenó.
- Base de partida para un proyecto de aprendizaje por imitación en investigación: el repositorio y su dataset permiten reproducir el entrenamiento, variar hiperparámetros y comparar con otras políticas de LeRobot sin partir de cero.
- Docencia y formación en robótica: sirve como ejemplo mínimo y ejecutable del ciclo completo teleoperación-dataset-entrenamiento-despliegue, con un modelo de solo 51,7 millones de parámetros que cabe en cualquier GPU de consumo.
- Clasificación y manipulación de objetos pequeños en entornos controlados: el modelo está especializado en objetos tipo bloque y contenedores, adecuado para tareas de bin picking de piezas ligeras con posición relativamente predecible.
- Prototipado rápido de demos para validar hardware: al requerir una sola cámara y un brazo `so_follower`, permite comprobar la calibración, la latencia del lazo de control y la integración de cámaras antes de invertir en datasets mayores.
- Reentrenamiento para una tarea nueva con pocos datos: el flujo de LeRobot permite grabar 50 episodios nuevos de otra tarea y reentrenar la política, usando este checkpoint como referencia de configuración y de tiempos de entrenamiento.
- Evaluación de robustez frente a cambios de iluminación, posición de objeto o distractores: al no haber resultados de evaluación publicados, el propio checkpoint es un banco de pruebas para medir la degradación de la tasa de éxito en condiciones no vistas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la sección de evaluación con la frase "No evaluation results have been provided for this policy yet", por lo que no existe una tasa de éxito medida en robot real para esta política.

| Metrica | Resultado |
|---|---|
| Tasa de exito en robot real | no disponible (sin evaluacion publicada) |
| Numero de ensayos | no disponible |
| Benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) | no aplica (no es un modelo de lenguaje) |
| Resultados del paper de ACT | el paper arXiv:2304.13705 reporta tasas de exito en sus propias tareas; no son trasladables a este checkpoint ni se dispone de sus cifras en la informacion proporcionada |

## Requisitos de hardware

- Peso de los parametros: 51.668.614 parametros equivalen a aproximadamente 207 MB en precisión completa de 32 bits, coherente con el tamaño de repositorio de 0,2 GB.
- VRAM estimada para inferencia: del orden de 1 a 2 GB contando pesos, el codificador visual y las activaciones intermedias. Es una estimación por tamaño de modelo, no un dato publicado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sobradamente. Para despliegue embebido, una Jetson Orin es una opción razonable si se exporta el modelo a un runtime optimizado.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna. Incluso es viable ejecutarlo en CPU para pruebas, aunque probablemente no a los 30 FPS que requiere el lazo de control.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=oregoncoast/hf_act_recordpolicy1` es la vía documentada. No se detallan en la información disponible exportaciones a ONNX, TensorRT, vLLM, llama.cpp, Ollama o TGI; estas últimas no aplican a un modelo de robótica.
- Latencia y throughput: el dataset se grabó a 30 FPS, por lo que el lazo de control de referencia es de 30 Hz. La predicción por chunks reduce la frecuencia de inferencia necesaria, pero no se publican cifras de latencia ni de throughput para este checkpoint.
- Requisito de integración: los nombres de cámara configurados en el rollout deben coincidir con las claves de observación del entrenamiento (`observation.images.front`), y el robot debe ser del tipo `so_follower`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observacion | Datos de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| oregoncoast/hf_act_recordpolicy1 | ACT (imitacion con chunks de acciones) | 51.668.614 | estado (6,) + imagen 3x240x320 | 50 episodios, 27.257 fotogramas | no disponible | Hugging Face, libreria lerobot |
| Diffusion Policy (Chi et al.) | politica por difusion | no disponible | depende de la implementacion | no disponible | no disponible | implementaciones publicas, no necesariamente en formato LeRobot |
| Otras politicas ACT de LeRobot | ACT | varia segun checkpoint | tipicamente estado + una o varias camaras | depende del dataset | depende del autor | Hugging Face, libreria lerobot |
| VQ-BeT u otras politicas de imitacion | discretizacion de acciones | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye cifras comparativas de rendimiento entre estas alternativas, por lo que la comparación se limita a metodología, formato y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: entrenada con 50 episodios de una única tarea; es previsible un mal rendimiento fuera de "Pick up the Lego block and place it in the bin" y con objetos, posiciones o contenedores distintos.
- Sin evaluación publicada: no hay tasa de éxito medida, ni condiciones de prueba documentadas, por lo que no puede afirmarse ningún nivel de fiabilidad en producción.
- Sensibilidad al entorno: cambios de iluminación, color de fondo, tipo de objeto o presencia de distractores pueden degradar el comportamiento; no se documenta ningún entrenamiento con aumentación o variabilidad controlada.
- Dependencia del hardware: la política asume un robot `so_follower` y una cámara `front` con la clave de observación exacta. Cambiar la configuración de cámaras o el robot invalida el modelo.
- Licencia no especificada: al no declararse licencia, no hay autorización explícita de uso comercial ni condiciones claras de redistribución. Conviene contactar con el autor antes de cualquier uso fuera de investigación.
- Riesgo de sobreajuste: sin información sobre regularización, aumentación de datos ni división de validación, no puede descartarse memorización de las demostraciones.
- Sin condicionamiento por lenguaje: la cadena de tarea es una etiqueta fija, no una instrucción interpretada; no se pueden dar órdenes nuevas al modelo.
- Sin capacidades de razonamiento ni de recuperación ante errores: si el agarre falla, la política no replanifica de forma explícita; la recuperación depende únicamente de la distribución de datos vista.
- Trazabilidad limitada: el repositorio no incluye vídeo de demostración, informe de evaluación ni detalles de hiperparámetros más allá de los indicados.
- Los resultados de la búsqueda web realizada no contienen información relevante sobre este modelo: los enlaces devueltos no guardan relación con robótica ni con LeRobot y se han descartado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oregoncoast/hf_act_recordpolicy1
- Dataset de entrenamiento: https://huggingface.co/datasets/oregoncoast/lego-pick-place_20261006_140138
- Visualizador del dataset en LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=oregoncoast/lego-pick-place_20261006_140138
- Paper de ACT (Action Chunking with Transformers): https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
