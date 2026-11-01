# Pipe1213/act_obj_t2_n20_s2

## Resumen

Pipe1213/act_obj_t2_n20_s2 es una política de imitación para robótica entrenada con el algoritmo ACT (Action Chunking with Transformers, Zhao et al., 2023) sobre la tarea 6 de LIBERO-Object, "coger la mantequilla y colocarla en la cesta". No es un modelo de lenguaje: es un controlador visomotor que mapea observaciones de imagen (256x256) y estado del robot a secuencias de acciones de 7 grados de libertad en el simulador MuJoCo.

El modelo forma parte de un estudio comparativo denominado vla-vs-scratch, que enfrenta una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) sobre exactamente las mismas 20 demostraciones. Con 51,7 millones de parámetros, un encoder ResNet-18 inicializado con pesos de ImageNet y bloques transformer para la predicción de acciones, ACT representa la línea base "from scratch" del estudio.

Su relevancia es metodológica más que práctica: se publica para hacer reproducible la comparación, no como política de propósito general. Los resultados del autor muestran una tasa de éxito media del 19,3% (29 de 150 episodios) en los tres checkpoints evaluados, frente al 74,2% de SmolVLA en el conjunto del estudio, lo que ilustra la brecha entre entrenar desde cero y partir de un modelo preentrenado con pocas demostraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): encoder visual ResNet-18 + transformer de predicción de acciones |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; predice chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT combina un encoder de imágenes ResNet-18 inicializado con pesos de ImageNet con un transformer que predice chunks de 100 acciones de forma conjunta, una técnica que reduce el error de compounding en el control visomotor. Todo el modelo, salvo el encoder visual, se entrena desde cero. La entrada incluye imágenes de 256x256 y el estado del robot; la salida son acciones normalizadas con estadísticas del dataset completo `lerobot/libero`.

El entrenamiento usó 20 episodios de demostración (IDs 855, 873, 881, 907, 914, 917, 927, 938, 961, 1012, 1026, 1059, 1076, 1118, 1124, 1183, 1185, 1186, 1212 y 1220) del dataset `lerobot/libero` en la revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`. Se emplearon los ajustes por defecto de LeRobot 0.6.2 (commit `b9cb121`): batch de 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 2000 y 4 workers. El coste computacional fue de 0,43 horas en una RTX 4050 de portátil con 6 GB de VRAM. La única desviación respecto a los valores por defecto se produce en evaluación: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

## Capacidades

- Control visomotor de un brazo robótico simulado para una única tarea de manipulación: coger un objeto (mantequilla) y depositarlo en una cesta.
- Predicción de chunks de 100 acciones con replanificación configurable (10 acciones en la evaluación publicada).
- Procesamiento de observaciones visuales RGB de 256x256 junto con el estado articular del robot.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.
- No dispone de modo thinking, visión general, audio ni ninguna capacidad fuera del dominio de control entrenado.

## Casos de uso

- Reproducción de experimentos de imitación en robótica: sirve como línea base "from scratch" para comparar con modelos preentrenados tipo VLA bajo idénticas demostraciones y presupuesto de entrenamiento.
- Estudio de la brecha preentrenamiento vs. desde cero: permite cuantificar cuánto aporta un VLM preentrenado (SmolVLA) frente a ACT con 20 demostraciones en LIBERO-Object.
- Docencia y formación en aprendizaje por imitación: el modelo y su comando de entrenamiento (`lerobot-train`) documentan de forma completa un flujo ACT reproducible en hardware de consumo.
- Validación de pipelines de evaluación en LeRobot: el comando `lerobot-eval` con estados iniciales fijos (0 a 49) sirve para verificar entornos de simulación MuJoCo y métricas de éxito.
- Análisis de variabilidad entre checkpoints: el autor documenta que checkpoints de la misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones ACT del estudio), lo que lo convierte en un caso útil para estudiar selección de checkpoints.
- Prototipado rápido de políticas de manipulación en simulación antes de invertir en modelos mayores o en transferencia a robot real.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados 0 a 49), 256x256, replanificación cada 10 acciones, semilla de evaluación 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 15 de 50 | 30% |
| 8.000 | 1 de 50 | 2% |
| 10.000 | 13 de 50 | 26% |
| Media de los 3 checkpoints | 29 de 150 | 19,3% (IC Wilson 95%: 14-26%) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento): ACT con 20 demostraciones por tarea alcanzó 33,1%, mientras que SmolVLA con las mismas demostraciones alcanzó 74,2%. El intervalo de Wilson cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el entrenamiento completo cupo en 6 GB (RTX 4050 de portátil), por lo que la inferencia requiere bastante menos.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4-6 GB de VRAM; una RTX 3060, RTX 4060 o superior es suficiente. Para evaluación en paralelo, A100 o H100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe holgadamente en GPU de consumo: RTX 4050 (6 GB) ya entrenó el modelo en 0,43 horas.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno `libero` y MuJoCo; el renderizado de MuJoCo en la evaluación publicada se ejecutó en CPU bajo WSL2.
- Latencia y throughput: no disponibles como cifras publicadas; el cuello de botella en evaluación es la simulación MuJoCo en CPU, no la inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | chunks de 100 acciones, replanificación cada 10 | 19,3% en esta tarea (33,1% agregado con 20 demos) | Apache 2.0 | HuggingFace, LeRobot |
| SmolVLA (referencia del estudio) | no disponible en la información | no disponible | 74,2% agregado con 20 demos | no disponible en la información | checkpoint LIBERO publicado |
| ACT con otras semillas/checkpoints | 51,7 M | idéntico | alta varianza (30 de 36 ejecuciones con diferencias grandes entre checkpoints) | Apache 2.0 | dentro del repositorio del estudio |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: ambos difieren en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no probado en robot real.
- La comparación ACT vs. SmolVLA mezcla preentrenamiento con diferencias de tamaño, arquitectura y entrada lingüística, por lo que la brecha no puede atribuirse solo al preentrenamiento.
- Las 3 tareas del estudio se eligieron entre tareas de LIBERO-Object que un checkpoint SmolVLA publicado ya resolvía, lo que sesga los resultados hacia esas tareas.
- Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Alta varianza entre checkpoints de la misma ejecución: evaluar siempre el checkpoint concreto antes de usarlo.
- No apto para uso comercial como política general: la licencia Apache 2.0 lo permite legalmente, pero su ámbito es la reproducibilidad de un estudio, no el despliegue productivo.
- Riesgo de alucinación no aplicable en el sentido de modelos de lenguaje; el fallo se manifiesta como acciones incorrectas o agarres fallidos.
- Sesgos conocidos: no documentados más allá de las limitaciones del benchmark y del conjunto de demostraciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t2_n20_s2
- Repositorio del estudio vla-vs-scratch: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset lerobot/libero: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada.
