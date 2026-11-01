# Pipe1213/act_obj_t1_n05_s2

## Resumen

`Pipe1213/act_obj_t1_n05_s2` es una política de robótica entrenada desde cero con el algoritmo ACT (Action Chunking Transformer, Zhao et al., 2023) mediante la librería LeRobot, sobre una única tarea del benchmark LIBERO-Object: "pick up the bbq sauce and place it in the basket". El modelo forma parte de un estudio reproducible de 60 políticas (`vla-vs-scratch`) que compara un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero (ACT) sobre las mismas pocas demostraciones en simulación.

No es un modelo de propósito general: es un artefacto experimental publicado para hacer reproducible la comparación. Tiene 51,7 millones de parámetros, usa un encoder de imagen ResNet-18 inicializado con pesos de ImageNet, genera trozos (chunks) de 100 acciones y se entrenó con solo 5 episodios de demostración (889, 893, 932, 1067 y 1077) del dataset `lerobot/libero`.

Su relevancia es metodológica: documenta con un intervalo de confianza de Wilson explícito (17,3 %, IC 95 % 12-24 %) el rendimiento de ACT con pocas demostraciones, frente al 78 % de SmolVLA en el conjunto del estudio. Sirve como referencia para quien quiera evaluar el coste real de entrenar desde cero frente a partir de un VLA preentrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) con encoder de imagen ResNet-18 (init ImageNet) y transformer de decodificación de acciones |
| Parametros totales | 51.671.687 (≈52 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo LeRobot; checkpoints en `checkpoints/<step>/pretrained_model`) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (action chunking) condicionado en observaciones visuales y estado propioceptivo. En esta configuración concreta se usa el encoder ResNet-18 de LeRobot inicializado con pesos de ImageNet; el resto de la red se entrena desde cero. La política produce chunks de 100 acciones y, en evaluación, replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usó los ajustes por defecto de LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`): batch de 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 2000, sobre 5 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`). El coste computacional fue de 0,43 h en una RTX 4050 de portátil (6 GB). No se aplicó ajuste fino específico para la tarea; los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.

## Capacidades

- Control robótico de una única tarea de manipulación en simulación: coger un objeto (salsa BBQ) y depositarlo en una cesta.
- Predicción de secuencias de acciones (action chunking) con horizonte de 100 acciones y replanificación cada 10.
- Procesamiento de observaciones visuales a 256 × 256 píxeles mediante ResNet-18.
- Entrada de estado propioceptivo del robot, normalizado con estadísticas del dataset completo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No tiene modo de razonamiento (thinking), visión general, audio ni generación de texto.

## Casos de uso

- Reproducción de experimentos de comparación VLA frente a entrenamiento desde cero: sirve para replicar exactamente los resultados del estudio `vla-vs-scratch` con la misma semilla, dataset y configuración.
- Línea base (baseline) para nuevas políticas en LIBERO-Object: al estar publicada con el comando de entrenamiento y evaluación, permite medir mejoras de forma controlada en la tarea de la salsa BBQ.
- Estudio del efecto del número de demostraciones: el modelo es parte de una rejilla con distintos tamaños de conjunto de demostraciones (los conjuntos pequeños están anidados en los grandes), lo que permite analizar curvas de aprendizaje con pocos datos.
- Análisis de variabilidad entre checkpoints: el propio autor advierte que checkpoints de la misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones ACT del estudio), por lo que es un caso útil para estudiar la estabilidad del entrenamiento y la necesidad de evaluar cada checkpoint.
- Docencia e introducción a LeRobot: con 0,43 h de entrenamiento en una GPU de consumo de 6 GB, sirve como ejemplo práctico de entrenamiento y evaluación de una política ACT en MuJoCo.
- Validación de pipelines de evaluación en simulación: el comando `lerobot-eval` con estados iniciales fijos (0 a 49) permite comprobar la infraestructura de evaluación antes de pasar a modelos mayores.

## Benchmarks y rendimiento

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 10 de 50 | 20 % |
| 8.000 | 6 de 50 | 12 % |
| 10.000 | 10 de 50 | 20 % |
| Media de los 3 checkpoints | 26 de 150 | 17,3 % (IC 95 % Wilson 12-24 %) |

Contexto del estudio: agregando las 3 tareas y todas las semillas, ACT con 5 demostraciones por tarea obtuvo 17,9 %, frente a 78 % de SmolVLA con las mismas demostraciones. La evaluación usó 50 episodios por checkpoint desde los estados iniciales fijos de LIBERO, imágenes de 256 × 256, replanificación cada 10 acciones, semilla 1000 y renderizado MuJoCo en CPU (WSL2).

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida por el tamaño del modelo (≈52 M parámetros, repo de 0,6 GB); cabe holgadamente en cualquier GPU de consumo actual.
- GPU recomendadas: cualquier GPU con al menos 6 GB; el entrenamiento documentado se hizo en una RTX 4050 de portátil (6 GB) en 0,43 h.
- Cabe en GPU de consumo: sí, incluidas RTX 4050, RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path`), con entorno `libero` y renderizado MuJoCo; no se documentan opciones vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Pipe1213/act_obj_t1_n05_s2` (ACT desde cero) | 51,7 M | Imagen 256×256 + estado; chunk de 100 acciones | 17,3 % (IC 95 % 12-24 %) en esta tarea; 17,9 % agregado del estudio | Apache 2.0 | HuggingFace (LeRobot) |
| SmolVLA (VLA preentrenado, misma configuración del estudio) | no disponible en la información | Entrada visión-lenguaje-acción | 78 % agregado con las mismas demostraciones | no disponible en la información | no disponible en la información |
| ACT con otros tamaños de demostración (resto de la rejilla del estudio) | ≈52 M | Igual que este modelo | Variable según número de demostraciones | Apache 2.0 (presumible por el estudio) | Repositorio `vla-vs-scratch` |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento: ambos difieren también en tamaño, arquitectura y entrada de lenguaje, como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no se ha probado en un robot real.
- La comparación del estudio mezcla preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje; no permite atribuir la brecha solo al preentrenamiento.
- Las 3 tareas del estudio se eligieron entre tareas de LIBERO-Object que un checkpoint SmolVLA publicado ya resolvía, por lo que los resultados describen esas tareas y no el benchmark completo.
- Estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas.
- ACT usó los valores por defecto de LeRobot y no se ajustó para esta tarea.
- Los checkpoints de una misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones ACT del estudio); hay que evaluar un checkpoint concreto antes de usarlo.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje, pero la política puede fallar de forma impredecible fuera de las condiciones de entrenamiento.
- Licencia Apache 2.0: permite uso comercial con las obligaciones habituales de atribución y aviso; no hay restricciones adicionales documentadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t1_n05_s2
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados del estudio: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis de resultados: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset usado: https://huggingface.co/datasets/lerobot/libero
