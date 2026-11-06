# Pipe1213/act_obj_t1_n20_s2

## Resumen

Pipe1213/act_obj_t1_n20_s2 es una política de imitación basada en ACT (Action Chunking Transformer, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger la salsa barbacoa y colocarla en la cesta", correspondiente al ID 3 del benchmark LIBERO-Object. Lo publica el usuario Pipe1213 como parte del estudio comparativo vla-vs-scratch, que contrasta una política entrenada desde cero (ACT) con un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) sobre exactamente las mismas 20 demostraciones por tarea.

El modelo tiene 51.671.687 parámetros (52M), emplea un encoder visual ResNet-18 inicializado con pesos de ImageNet y predice trozos de 100 acciones. Se entrenó con 20 episodios del dataset lerobot/libero durante 10.000 pasos con batch size 8, en 0,43 horas sobre una GPU de portátil RTX 4050 de 6 GB. No es un modelo de propósito general: su valor es la reproducibilidad de un experimento controlado sobre el coste real del preentrenamiento en robótica.

La relevancia actual es metodológica: el estudio mide si merece la pena partir de un VLA preentrenado frente a entrenar desde cero con pocas demostraciones. En la comparación agregada del estudio, ACT con 20 demostraciones por tarea obtuvo un 33,1% de éxito frente al 74,2% de SmolVLA en las mismas condiciones, aunque este checkpoint concreto alcanzó un 68% de media en su tarea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 (52M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa observaciones de imagen 256x256 y estado del robot) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; política puramente visomotora) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imagen RGB de 256x256 y estado propioceptivo del robot) a un chunk de 100 acciones futuras, con un encoder visual ResNet-18 preentrenado en ImageNet y el resto de la red entrenada desde cero. La predicción por chunks reduce el error de compounding y suaviza la política frente a métodos paso a paso. El checkpoint raíz del repositorio corresponde al paso 10.000; los checkpoints intermedios (6.000 y 8.000) están en `checkpoints/<step>/pretrained_model`.

El entrenamiento usó 20 episodios concretos del dataset lerobot/libero (revisión a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4), con batch size 8, 10.000 pasos, semilla 2000 y LeRobot 0.6.2 (commit b9cb121cb7d4e3e26ec5c906d08dda68d151ba52). No hay RLHF, DPO ni ajuste fino posterior: es imitación supervisada pura sobre demostraciones. La única desviación respecto a los valores por defecto de LeRobot es en evaluación, donde la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo. Las estadísticas de normalización de estados y acciones provienen de todo el dataset lerobot/libero, no solo de los episodios seleccionados.

## Capacidades

- Control visomotor de un brazo robótico en simulación MuJoCo para una tarea de pick-and-place específica.
- Predicción de chunks de 100 acciones con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones de imagen a 256x256 píxeles junto con el estado del robot.
- Ejecución de una única instrucción implícita (la tarea de la salsa barbacoa); no acepta instrucciones en lenguaje natural.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, código, matemáticas, visión general ni audio.
- No dispone de modo thinking ni de ninguna capacidad cognitiva más allá de la política de control.

## Casos de uso

- Reproducción de experimentos de imitation learning: sirve como referencia exacta de ACT con 20 demostraciones y semilla 2000 para replicar los resultados del estudio vla-vs-scratch sin reentrenar.
- Baseline en comparativas de políticas robóticas: permite medir la brecha entre un método desde cero y un VLA preentrenado sobre las mismas demostraciones y escenas iniciales fijas.
- Estudio del efecto del número de demostraciones: al estar anidado con los conjuntos de 10 y 50 episodios del estudio, permite aislar la curva de rendimiento frente a la cantidad de datos.
- Docencia y formación en robótica: el modelo cabe en una GPU de 6 GB y se entrena en menos de media hora, lo que lo hace apto para prácticas de imitation learning en hardware de consumo.
- Validación de pipelines de LeRobot: útil para comprobar que una instalación de LeRobot 0.6.2 y el entorno LIBERO evalúan correctamente antes de lanzar experimentos propios.
- Análisis de variabilidad entre checkpoints: al incluir tres checkpoints con rendimientos muy distintos (46%, 88% y 70%), sirve para estudiar la inestabilidad de ACT y diseñar protocolos de selección de checkpoint.
- Investigación sobre sim-to-real: como punto de partida para estudiar qué falla al transferir una política entrenada solo en LIBERO-Object a un robot físico.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de LIBERO (estados iniciales 0 a 49), 256x256 píxeles, replanificación cada 10 acciones, semilla de evaluación 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 23 de 50 | 46% |
| 8.000 | 44 de 50 | 88% |
| 10.000 (raíz del repo) | 35 de 50 | 70% |
| Media de los 3 checkpoints | 102 de 150 | 68% (intervalo de Wilson 95%: 60-75%) |

Contexto agregado del estudio (3 tareas, todas las semillas): ACT con 20 demostraciones por tarea, 33,1%; SmolVLA con las mismas demostraciones, 74,2%.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 6 GB; el entrenamiento completo ocupó una RTX 4050 de 6 GB, por lo que la inferencia cabe holgadamente en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA; una RTX 4050, RTX 3060 o superior es suficiente tanto para entrenar como para inferir.
- Cabe en GPU de consumo: sí, confirmado por el propio autor (RTX 4050 de 6 GB, 0,43 h de entrenamiento).
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno LIBERO y MuJoCo; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; la evaluación se ejecutó con batch size 1 y renderizado MuJoCo en CPU (WSL2), lo que sugiere que el cuello de botella es el simulador, no la red.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 52M | Imagen 256x256 + estado; chunks de 100 acciones | 68% medio (3 checkpoints) en la tarea de la salsa barbacoa | apache-2.0 | Hugging Face, LeRobot |
| SmolVLA (referencia del estudio) | no disponible en la información proporcionada | Entrada multimodal con lenguaje | 74,2% agregado en 3 tareas del estudio | no disponible en la información proporcionada | Referencia citada en el estudio |
| ACT con 10 demostraciones (mismo estudio) | 52M | Igual que este modelo | Inferior; valor exacto no disponible en la información proporcionada | apache-2.0 | Mismo repositorio del estudio |
| ACT con 50 demostraciones (mismo estudio) | 52M | Igual que este modelo | Valor exacto no disponible en la información proporcionada | apache-2.0 | Mismo repositorio del estudio |

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real, y no hay evidencia de transferencia sim-to-real.
- Una única tarea de un único benchmark (LIBERO-Object, ID 3); no generaliza a otras instrucciones ni objetos.
- No procesa lenguaje: la tarea está codificada implícitamente en los pesos, no en una instrucción de entrada.
- Alta variabilidad entre checkpoints de la misma ejecución: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rinden de forma muy distinta (aquí, del 46% al 88%). Es obligatorio evaluar el checkpoint antes de usarlo.
- La comparación con SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren también en tamaño, arquitectura y entrada de lenguaje.
- Las tareas se eligieron entre las que un checkpoint SmolVLA ya resolvía, lo que sesga los resultados hacia esas tareas.
- Normalización de estados y acciones calculada sobre todo el dataset lerobot/libero, no solo sobre las 20 demostraciones, lo que introduce información del resto del dataset.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para esta tarea.
- El intervalo de Wilson del 68% solo cubre el muestreo de evaluación; la variabilidad entre semillas de entrenamiento es mayor.
- Licencia apache-2.0: permite uso comercial, pero el modelo no tiene utilidad comercial fuera del ámbito de investigación en robótica y simulación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t1_n20_s2
- Repositorio del estudio vla-vs-scratch: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos del estudio: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis detallado: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset lerobot/libero: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
