# Pipe1213/act_obj_t3_n20

## Resumen

Pipe1213/act_obj_t3_n20 es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger el pudin de chocolate y colocarlo en la cesta" (LIBERO-Object, task id 8). Forma parte del estudio comparativo [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que contrasta un modelo visión-lenguaje-acción preentrenado (SmolVLA) con una política entrenada desde cero sobre las mismas pocas demostraciones. El modelo se publica para hacer reproducible el estudio, no como política de propósito general.

La arquitectura es un transformer ACT con 51.671.687 parámetros, encoder de imágenes ResNet-18 inicializado con pesos de ImageNet y el resto entrenado desde cero sobre 20 episodios de demostración del dataset `lerobot/libero`. Genera chunks de 100 acciones, aunque en evaluación se replantea cada 10 acciones. El entrenamiento completo requirió 0,40 horas en una GPU de portátil RTX 4050 de 6 GB, lo que lo convierte en un caso de referencia útil para quienes quieren evaluar el coste real de entrenar políticas de imitación desde cero.

Su relevancia es metodológica: proporciona un punto de comparación cuantificado (34,7% de tasa de éxito media sobre 3 checkpoints) frente al 74,2% de SmolVLA con las mismas demostraciones, y expone una advertencia práctica importante: los checkpoints de una misma ejecución de ACT varían mucho en rendimiento (en 30 de 36 ejecuciones del estudio), por lo que es imprescindible evaluar cada checkpoint antes de usarlo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder visual ResNet-18 |
| Parámetros totales | 51.671.687 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no LLM) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; entrada visual y de estado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imágenes de 256×256 píxeles y estado del robot) a secuencias de acciones. En este caso, el encoder de imágenes es un ResNet-18 inicializado con pesos de ImageNet y el resto de la red se entrena desde cero. La política predice chunks de 100 acciones; en evaluación se replantea cada 10 acciones, que es el único cambio respecto a los valores por defecto de LeRobot. El repositorio raíz contiene el checkpoint final (10.000 pasos).

El entrenamiento usó 20 episodios concretos de `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`): 840, 841, 847, 878, 910, 918, 953, 966, 972, 975, 977, 1048, 1081, 1106, 1138, 1149, 1168, 1210, 1250 y 1259. Configuración: batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos, semilla 1000, 4 workers, LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). No se aplicó ajuste fino de hiperparámetros ni RLHF/DPO; es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: coger el pudin de chocolate y colocarlo en la cesta (LIBERO-Object, task id 8).
- Control robótico a partir de observaciones visuales (imágenes de 256×256) y estado del robot.
- Generación de chunks de acciones con replanificación cada 10 acciones.
- Aprendizaje por imitación con muy pocas demostraciones (20 episodios).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa instrucciones en lenguaje natural.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Reproducción del estudio vla-vs-scratch: ejecutar `lerobot-eval` con el comando documentado para verificar el 54% de éxito del checkpoint final sobre los 50 estados iniciales fijos de LIBERO.
- Línea base para comparar políticas desde cero frente a VLA preentrenados: usar este modelo como referencia de ACT con 20 demostraciones al evaluar SmolVLA u otros modelos en la misma tarea.
- Estudio del efecto del número de demostraciones: los conjuntos menores del estudio están anidados en estos 20 episodios, lo que permite aislar la variable "cantidad de datos" manteniendo idénticas las semillas y la configuración.
- Análisis de variabilidad entre checkpoints: descargar las carpetas `checkpoints/006000`, `008000` y `010000` y evaluarlas para reproducir la dispersión 24% / 26% / 54% documentada.
- Docencia e investigación en aprendizaje por imitación: el coste de entrenamiento (0,40 h en una RTX 4050 de 6 GB) permite experimentar con ACT en hardware de consumo.
- Validación de pipelines de evaluación robótica: sirve para probar flujos de `lerobot-eval` con MuJoCo en CPU, renderizado a 256×256 y estados iniciales fijos antes de escalar a modelos mayores.
- Referencia de normalización de estados y acciones: útil para estudiar el impacto de usar estadísticas del dataset completo frente a las de los episodios seleccionados.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO (init states 0 a 49), 256×256 píxeles, replanificación cada 10 acciones, semilla 1000, renderizado MuJoCo en CPU:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 12 de 50 | 24% |
| 8.000 | 13 de 50 | 26% |
| 10.000 (raíz del repo) | 27 de 50 | 54% |
| Media de los 3 checkpoints | 52 de 150 | 34,7% (intervalo de Wilson 95%: 28–43%) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento): ACT con 20 demostraciones por tarea obtuvo 33,1% y SmolVLA con las mismas demostraciones, 74,2%. El intervalo de Wilson cubre solo el muestreo de evaluación; las diferencias entre semillas de entrenamiento son mayores, especialmente en ACT.

## Requisitos de hardware

- Entrenamiento: 0,40 h en una GPU de portátil RTX 4050 con 6 GB de VRAM, batch size 8 y 10.000 pasos.
- Inferencia: no se especifica VRAM concreta en la información disponible; con 51,7 M de parámetros y un ResNet-18, la huella es reducida y cabe holgadamente en GPUs de consumo.
- Evaluación: MuJoCo con renderizado en CPU (probado en WSL2), imágenes de 256×256, batch size 1.
- Despliegue: LeRobot 0.6.2 mediante `lerobot-eval` y `lerobot-train`; no se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de política).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Tasa de éxito (estudio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | Entrenado desde cero, imitación | 33,1% (agregado, 20 demos) | apache-2.0 | Hugging Face (LeRobot) |
| SmolVLA | no disponible en la información | VLA preentrenado + fine-tuning | 74,2% (agregado, 20 demos) | no disponible en la información | Hugging Face (LeRobot) |

La comparación directa debe interpretarse con cautela: SmolVLA y ACT difieren en preentrenamiento, tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse únicamente al preentrenamiento. No se dispone de datos de otras alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object, task id 8); no es una política de propósito general.
- Alta variabilidad entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rindieron de forma muy distinta; hay que evaluar antes de usar.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA para LIBERO ya resolvía, lo que condiciona la generalización de los resultados.
- Normalización con estadísticas de todo `lerobot/libero`, no solo de las demostraciones seleccionadas, lo que puede introducir desajustes en otros contextos.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Sin datos sobre sesgos, alucinación o restricciones de idioma (no aplican en el sentido habitual de un LLM); la licencia apache-2.0 permite uso comercial, pero el modelo no está validado para producción real.
- El intervalo de confianza del 34,7% cubre solo el muestreo de evaluación, no la variabilidad entre semillas de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t3_n20
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
