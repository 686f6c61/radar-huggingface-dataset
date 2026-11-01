# Pipe1213/act_obj_t3_n20_s2

## Resumen

ACT (Action Chunking Transformer) entrenado desde cero sobre una única tarea de manipulación robótica en simulación: "coger el pudin de chocolate y colocarlo en la cesta", correspondiente a la tarea 8 de LIBERO-Object. Lo publica el usuario Pipe1213 como parte del estudio reproducible [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que compara un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero (ACT) sobre las mismas pocas demostraciones. No es una política de propósito general: es un artefacto de investigación para reproducir un experimento concreto.

El modelo tiene 51,7 millones de parámetros, usa un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y predice trozos (chunks) de 100 acciones. Se entrenó con 20 episodios del dataset `lerobot/libero` durante 10.000 pasos (0,42 h en una RTX 4050 de 6 GB). La relevancia es metodológica: cuantifica cuánto rinde la imitación desde cero frente a un VLA preentrenado en el régimen de pocos datos, un punto clave para quien evalúe si merece la pena adoptar un VLA preentrenado en lugar de entrenar una política ligera propia.

El checkpoint raíz del repositorio es el paso 10.000, con un 62% de éxito sobre 50 escenas fijas de LIBERO. La puntuación del estudio para esta configuración (media de los checkpoints 6.000, 8.000 y 10.000) es del 51,3% (77 de 150 episodios, intervalo de Wilson del 95%: 43-59%).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder de imagen ResNet-18 preentrenado en ImageNet y transformer de predicción de acciones |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; consume observaciones de imagen y estado, y predice chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada por el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo `lerobot`, 0,6 GB) |

## Arquitectura y entrenamiento

ACT sigue el diseño de Zhao et al. (2023): un encoder visual ResNet-18 inicializado desde ImageNet extrae características de la imagen de 256x256, y un transformer codificador-decodificador genera un chunk de 100 acciones condicionado por el estado del robot. Todo el modelo salvo el encoder visual se entrena desde cero. Se usan los hiperparámetros por defecto de LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`): batch de 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 2000, 4 workers. La única desviación respecto a los valores por defecto está en evaluación: se replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

Los datos son 20 episodios de `lerobot/libero` en la revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4` (episodios 840, 841, 847, 878, 910, 918, 953, 966, 972, 975, 977, 1048, 1081, 1106, 1138, 1149, 1168, 1210, 1250 y 1259). No hay RLHF ni DPO: es imitación supervisada pura. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados. El entrenamiento completo costó 0,42 h en una RTX 4050 de 6 GB.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: coger el pudin de chocolate y colocarlo en la cesta (LIBERO-Object, task id 8).
- Control visomotor a partir de imágenes RGB de 256x256 y del estado del robot.
- Predicción de chunks de 100 acciones con replanificación cada 10 acciones en evaluación.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni entrada de lenguaje: la instrucción está implícita en el entrenamiento.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: sirve como baseline ACT desde cero para comparar con SmolVLA sobre las mismas 20 demostraciones y las mismas 50 escenas iniciales de LIBERO.
- Referencia de rendimiento en el régimen de pocos datos: útil para estimar qué éxito cabe esperar (~51% de media en esta configuración) antes de invertir en un VLA preentrenado.
- Docencia y experimentación con imitación robótica: el modelo entrena en 0,42 h en una GPU de portátil de 6 GB, lo que permite reproducir el pipeline completo de LeRobot en un equipo de consumo.
- Validación de infraestructura de evaluación: el comando `lerobot-eval` con `--env.type=libero` permite comprobar que el entorno MuJoCo y el renderizado funcionan antes de lanzar experimentos mayores.
- Estudio de la variabilidad entre checkpoints: con checkpoints en los pasos 6.000, 8.000 y 10.000 (20%, 72% y 62% de éxito), es un caso práctico para ilustrar por qué hay que evaluar cada checkpoint y no fiarse del último.
- Punto de partida para ajuste fino en una tarea propia: al ser Apache 2.0 y estar en formato LeRobot, se puede reentrenar con un conjunto pequeño de demostraciones propias como prueba de concepto en simulación.
- Análisis de ablaciones de datos: los conjuntos menores del estudio están anidados en este de 20 episodios, lo que facilita comparar curvas de aprendizaje con 5, 10 y 20 demostraciones.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados 0 a 49), imágenes de 256x256, replanificación cada 10 acciones, semilla de evaluación 1000, MuJoCo en CPU (WSL2).

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 10 de 50 | 20% |
| 8.000 | 36 de 50 | 72% |
| 10.000 (raíz del repo) | 31 de 50 | 62% |
| Media de los 3 checkpoints | 77 de 150 | 51,3% (IC 95% Wilson: 43-59%) |

Comparación agregada del estudio (3 tareas, todas las semillas, 20 demostraciones por tarea):

| Método | Tasa de éxito agregada |
|---|---:|
| ACT desde cero | 33,1% |
| SmolVLA preentrenado | 74,2% |

El intervalo de Wilson solo cubre el muestreo de evaluación; la variabilidad entre semillas de entrenamiento es mayor, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo tiene 51,7 M de parámetros (~207 MB en fp32, ~104 MB en fp16), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; el entrenamiento se hizo en una RTX 4050 de 6 GB y la evaluación corre con MuJoCo en CPU.
- Cabe en cualquier GPU consumer moderna (RTX 3050/4050 en adelante) e incluso en iGPU para inferencia, aunque el cuello de botella real es el simulador.
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--env.type=libero`), con renderizado MuJoCo en CPU; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. El coste dominante es la simulación física y el renderizado, no la red neuronal.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Preentrenamiento | Tasa de éxito (estudio, 20 demos) | Licencia |
|---|---|---:|---|---:|---|
| ACT (este modelo) | 51,7 M | Imagen + estado | Ninguno (solo ImageNet en el encoder) | 33,1% agregado; 51,3% en esta tarea | Apache 2.0 |
| SmolVLA (referencia del estudio) | no disponible en la información proporcionada | Imagen + estado + lenguaje | VLA preentrenado | 74,2% agregado | no disponible en la información proporcionada |

No se dispone de datos de otros modelos comparables en la información proporcionada. La comparación directa con SmolVLA está confundida por diferencias de tamaño, arquitectura y entrada de lenguaje, tal como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- No es una política de propósito general: la instrucción está fijada por el entrenamiento y no acepta comandos en lenguaje.
- La comparación con SmolVLA mezcla preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje; el autor advierte explícitamente que la brecha no se puede atribuir solo al preentrenamiento.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint público de SmolVLA para LIBERO ya resolvía, lo que sesga los resultados hacia esas tareas.
- Los estados y acciones se normalizan con estadísticas de todo `lerobot/libero`, no solo de las demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste para esta tarea.
- Alta varianza entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rinden de forma muy distinta (aquí, del 20% al 72%). Hay que evaluar cada checkpoint antes de usarlo.
- Riesgo de sobreajuste a las 20 demostraciones y a las condiciones del simulador; no hay garantía de transferencia a variaciones de iluminación, objetos o cámara.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción ni para operar maquinaria real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t3_n20_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Documentación de LeRobot: no disponible en la información proporcionada
