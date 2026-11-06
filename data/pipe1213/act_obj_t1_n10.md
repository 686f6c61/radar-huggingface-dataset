# Pipe1213/act_obj_t1_n10

## Resumen

`Pipe1213/act_obj_t1_n10` es una política robótica ACT (Action Chunking with Transformers) entrenada desde cero sobre una única tarea del benchmark LIBERO-Object: "coger la salsa barbacoa y colocarla en la cesta" (task id 3). Forma parte de un estudio reproducible de 60 políticas que compara un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero (ACT) usando exactamente las mismas 10 demostraciones por tarea. El modelo no es una política de propósito general: se publica para hacer reproducible la comparación.

La arquitectura es la implementación de ACT de LeRobot con los ajustes por defecto: 51.671.687 parámetros, encoder visual ResNet-18 inicializado con pesos de ImageNet, trozos de 100 acciones y el resto de componentes entrenados desde cero. El entrenamiento se realizó en 0,42 horas sobre una RTX 4050 de portátil (6 GB), lo que da una idea de la ligereza del modelo.

Su relevancia actual es metodológica: sirve como referencia cuantitativa de hasta dónde llega el aprendizaje por imitación desde cero con pocas demostraciones frente a un VLA preentrenado. El checkpoint final (10.000 pasos) alcanza un 70% de éxito en las 50 escenas fijas de la tarea, mientras que la media de los tres checkpoints evaluados es del 33,3%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 (~52 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; trozos de 100 acciones, re-planificación cada 10 acciones en evaluación) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; recibe instrucción fija por tarea) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo LeRobot, 0,6 GB) |

## Arquitectura y entrenamiento

ACT es una política de imitación basada en transformer que predice trozos de acciones (action chunks) en lugar de acciones individuales, lo que reduce el error de acumulación en tareas de manipulación. En esta implementación de LeRobot, el encoder visual es una ResNet-18 inicializada con pesos de ImageNet; el resto de la red se entrena desde cero. La configuración es la de por defecto de LeRobot: 52 M de parámetros y trozos de 100 acciones. La única desviación respecto a los valores por defecto se produce en evaluación, donde la política re-planifica cada 10 acciones en lugar de ejecutar el trozo completo.

El entrenamiento usa 10 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`): 843, 853, 871, 889, 893, 932, 1005, 1067, 1077 y 1235. Se emplearon batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 1000, con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). Los estados y acciones se normalizan con estadísticas del dataset completo `lerobot/libero`, no solo de los episodios seleccionados (comportamiento por defecto de LeRobot). No se aplicó ajuste fino de hiperparámetros ni RLHF/DPO: es aprendizaje por imitación supervisado puro.

## Capacidades

- Control robótico de manipulación en simulación: predice comandos de acción a partir de observaciones visuales de 256×256 píxeles y del estado del robot.
- Ejecución de una única tarea: "coger la salsa barbacoa y colocarla en la cesta" (LIBERO-Object, task id 3).
- Generación de trozos de 100 acciones con re-planificación configurable (10 acciones en la evaluación publicada).
- Aprendizaje por imitación con muy pocas demostraciones (10 episodios).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.
- No dispone de entrada de lenguaje libre; la instrucción está fijada por la tarea del benchmark.

## Casos de uso

- Reproducción de estudios comparativos VLA frente a políticas desde cero: el modelo se usa como baseline ACT con 10 demostraciones en la tarea 3 de LIBERO-Object, con la misma semilla y los mismos episodios que el resto del grid.
- Evaluación de robustez de checkpoints: permite medir la variabilidad entre checkpoints de un mismo entrenamiento (6.000, 8.000 y 10.000 pasos), un fenómeno documentado en 30 de las 36 ejecuciones ACT del estudio.
- Referencia de bajo coste computacional: entrenar una política comparable requiere 0,42 h en una GPU de 6 GB, útil para prototipado rápido en laboratorios con hardware limitado.
- Docencia y formación en aprendizaje por imitación: sirve para ilustrar el pipeline completo de LeRobot (`lerobot-train`, `lerobot-eval`) con un caso real y reproducible.
- Pruebas de infraestructura de evaluación en MuJoCo/LIBERO: el comando de evaluación publicado permite validar entornos de simulación y renderizado en CPU (WSL2) antes de escalar a modelos mayores.
- Análisis de la brecha entre preentrenamiento y entrenamiento desde cero: al compartir demostraciones con SmolVLA, el modelo permite cuantificar cuánto aporta el preentrenamiento frente a arquitectura, tamaño y entrada de lenguaje.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO-Object task 3 (estados iniciales 0 a 49), 256×256 píxeles, re-planificación cada 10 acciones, semilla 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 3 de 50 | 6% |
| 8.000 | 12 de 50 | 24% |
| 10.000 | 35 de 50 | 70% |
| Media de los 3 checkpoints | 50 de 150 | 33,3% (intervalo de Wilson 95%: 26-41%) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento): ACT con 10 demostraciones por tarea obtuvo un 34,6%, frente al 82,4% de SmolVLA con las mismas demostraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el entrenamiento completo cabe en 6 GB (RTX 4050 de portátil). La inferencia con 52 M de parámetros y entradas de 256×256 requiere previsiblemente menos de 2 GB, aunque no se publica una cifra exacta.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB para entrenamiento (RTX 4050, RTX 3060, RTX 4060). Para inferencia basta una GPU modesta; también es viable en CPU para pruebas puntuales.
- Cabe en GPU consumer: sí, con margen amplio; el estudio lo entrenó en una RTX 4050.
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path`), con entorno `libero` en MuJoCo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La evaluación se realizó con renderizado MuJoCo en CPU (WSL2) y batch size 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | ~52 M | Observación visual 256×256 + estado; sin lenguaje | 33,3% (media de 3 checkpoints, task 3) | Apache 2.0 | Hugging Face (LeRobot) |
| SmolVLA (referencia del estudio) | no disponible en la información proporcionada | VLA con entrada de lenguaje | 82,4% (agregado del estudio con 10 demos) | no disponible en la información proporcionada | Checkpoint LIBERO publicado según la model card |
| ACT agregado del estudio | ~52 M | Igual que este modelo | 34,6% (3 tareas, todas las semillas) | Apache 2.0 | Repositorio del estudio |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento: ambos difieren también en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object task 3); no generaliza a otras tareas ni objetos.
- Alta varianza entre checkpoints de la misma ejecución: en 30 de las 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta. Hay que evaluar el checkpoint concreto antes de usarlo.
- El intervalo de Wilson del 33,3% solo cubre el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.
- Normalización de estados y acciones con estadísticas del dataset completo `lerobot/libero`, no solo de las 10 demostraciones seleccionadas.
- Sin ajuste de hiperparámetros: se usaron los valores por defecto de LeRobot.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint SmolVLA publicado ya resolvía, lo que sesga la comparación hacia tareas favorables al VLA.
- No es una política de propósito general; el autor la publica únicamente para reproducibilidad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción ni para entornos físicos.
- Riesgo de alucinación no aplicable en el sentido de LLM; el riesgo equivalente es la ejecución de acciones incorrectas fuera de la distribución de las demostraciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t1_n10
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- Documentación de LeRobot: no disponible en la información proporcionada
