# Pipe1213/act_obj_t2_n20_s3

## Resumen

`Pipe1213/act_obj_t2_n20_s3` es una política robótica ACT (Action Chunking Transformer, Zhao et al., 2023) entrenada desde cero con LeRobot sobre una única tarea del benchmark LIBERO-Object: "coger la mantequilla y colocarla en la cesta" (task id 6). No es un modelo de lenguaje ni un VLA de propósito general: es un checkpoint de investigación de 51,7 millones de parámetros publicado para hacer reproducible el estudio comparativo [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que contrasta una política entrenada desde cero (ACT) frente a un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) con las mismas pocas demostraciones.

El modelo se ha entrenado con 20 episodios de demostración del dataset `lerobot/libero` (855, 873, 881, 907, 914, 917, 927, 938, 961, 1012, 1026, 1059, 1076, 1118, 1124, 1183, 1185, 1186, 1212, 1220), batch size 8, 10.000 pasos y semilla 3000, en 0,36 horas sobre una RTX 4050 de portátil (6 GB). El repositorio raíz contiene el checkpoint final (paso 10.000); los checkpoints intermedios (6.000 y 8.000) están en `checkpoints/<step>/pretrained_model`.

Su relevancia es metodológica, no de producto: sirve como referencia empírica de hasta dónde llega la imitación desde cero con pocos datos en simulación. El propio autor advierte que no debe usarse como política de propósito general. El rendimiento es bajo: 7,3% de éxito medio sobre los tres checkpoints evaluados (11 de 150 episodios), frente al 33,1% agregado de ACT y el 74,2% de SmolVLA en el conjunto del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones visuales de 256x256 y estado del robot) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice trozos (*chunks*) de 100 acciones a partir de observaciones visuales y del estado del robot, con un encoder de imágenes ResNet-18 inicializado con pesos de ImageNet; el resto de la red se entrena desde cero. La configuración es la predeterminada de LeRobot (versión 0.6.2, commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`), sin ajuste específico para la tarea. La única modificación respecto a los valores por defecto se aplica en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usa 20 episodios de `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 3000. No hay RLHF, DPO ni ajuste por preferencias: es imitación supervisada pura sobre demostraciones. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los 20 episodios seleccionados (comportamiento por defecto de LeRobot). El coste computacional declarado es de 0,36 horas en una RTX 4050 de 6 GB.

## Capacidades

- Control robótico de manipulación en simulación para una única tarea: coger un objeto (mantequilla) y depositarlo en una cesta.
- Predicción de secuencias de acciones en chunks de 100 pasos, con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones visuales RGB de 256x256 píxeles junto con el estado del robot.
- Ejecución en el entorno LIBERO (`env.type=libero`, `env.task=libero_object`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni planificación de agentes.
- No tiene capacidades multilingües ni entrada de lenguaje natural: la instrucción está implícita en el entrenamiento.
- No dispone de modo *thinking*, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de imitación desde cero: replicar el entrenamiento con el comando `lerobot-train` documentado y comparar curvas de éxito con los checkpoints publicados (6.000, 8.000 y 10.000 pasos).
- Referencia base en estudios de comparación VLA frente a políticas desde cero: usar este checkpoint como línea base ACT del par (tarea, semilla) en el estudio `vla-vs-scratch`, junto con SmolVLA entrenado sobre las mismas demostraciones.
- Docencia y formación en robótica de imitación: ilustra el flujo completo de LeRobot (dataset, entrenamiento, evaluación en MuJoCo) con un coste de cómputo de 0,36 horas en una GPU de consumo.
- Validación de pipelines de evaluación en LIBERO: sirve para comprobar que la integración de `lerobot-eval` con `env.init_states=true` y los 50 estados iniciales fijos funciona antes de lanzar modelos más caros.
- Análisis de variabilidad entre checkpoints: el autor documenta que checkpoints del mismo entrenamiento rinden de forma muy distinta (en 30 de 36 ejecuciones ACT del estudio); este modelo permite estudiar ese fenómeno con tres puntos de control.
- Pruebas de infraestructura de simulación: al ser un modelo pequeño (51,7 M de parámetros, repo de 0,6 GB), es adecuado para verificar entornos WSL2 con renderizado MuJoCo en CPU y GPUs de 6 GB.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 50 estados iniciales fijos de LIBERO (tarea 6), 256x256, replanificación cada 10 acciones, semilla de evaluación 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 1 de 50 | 2% |
| 8.000 | 2 de 50 | 4% |
| 10.000 (raíz del repo) | 8 de 50 | 16% |
| Media de los 3 checkpoints (puntuación del estudio) | 11 de 150 | 7,3% (intervalo de Wilson al 95%: 4-13%) |

Contexto agregado del estudio (3 tareas, todas las semillas de entrenamiento): ACT con 20 demostraciones por tarea, 33,1%; SmolVLA con las mismas demostraciones, 74,2%. El propio autor señala que el intervalo de Wilson solo cubre el muestreo de evaluación y que las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, y no proceden para este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB con los pesos en precisión completa (51,7 M de parámetros); el repo completo ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB; el entrenamiento se completó en una RTX 4050 de portátil (6 GB) en 0,36 horas.
- Cabe en GPU de consumo: sí, en RTX 4050, RTX 3060, RTX 4060 y superiores; también en GPUs de portátil de gama media.
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path`) y evaluación en LIBERO con MuJoCo; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La evaluación se realizó con `eval.batch_size=1` y renderizado MuJoCo en CPU bajo WSL2, sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT `act_obj_t2_n20_s3` (este) | 51,7 M | Observación 256x256 + estado; tarea única | 7,3% medio (16% en el checkpoint final) | Apache 2.0 | Hugging Face, 27 descargas |
| ACT agregado del estudio (3 tareas, todas las semillas, 20 demos) | 51,7 M por política | Igual | 33,1% | Apache 2.0 | Checkpoints del estudio en el repo `vla-vs-scratch` |
| SmolVLA ajustado (mismas 20 demos por tarea) | no disponible en la información | Entrada visión-lenguaje-acción | 74,2% | no disponible en la información | Checkpoints del estudio en el repo `vla-vs-scratch` |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren también en tamaño, arquitectura y entrada de lenguaje, como advierte el autor. No se dispone de datos de otros modelos comparables (por ejemplo, Diffusion Policy) en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- Rendimiento muy bajo en términos absolutos: 7,3% de éxito medio y 16% en el mejor checkpoint, sobre 50 escenas fijas.
- Alta variabilidad entre checkpoints del mismo entrenamiento: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta; hay que evaluar cada checkpoint antes de usarlo.
- La instrucción de la tarea está fijada en el entrenamiento; el modelo no acepta lenguaje natural ni cambia de tarea.
- Normalización con estadísticas de todo `lerobot/libero`, no solo de las 20 demostraciones, lo que puede introducir desajustes de escala.
- Sin ajuste de hiperparámetros para la tarea: se usaron los valores por defecto de LeRobot.
- Las tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que condiciona la generalización de los resultados.
- Sesgos conocidos: no documentados por el autor; al entrenarse solo con 20 demostraciones de un simulador, hereda los sesgos de esas trayectorias y del renderizado de MuJoCo.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí en el de predicciones de acción no válidas fuera de la distribución de las demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no es apto para producción por su alcance y rendimiento; el autor lo publica explícitamente con fines de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t2_n20_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada (referenciado en la model card sin enlace)
- LeRobot: no disponible en la información proporcionada (referenciado como librería y versión 0.6.2)
