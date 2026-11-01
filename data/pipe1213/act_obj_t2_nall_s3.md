# Pipe1213/act_obj_t2_nall_s3

## Resumen

`Pipe1213/act_obj_t2_nall_s3` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger la mantequilla y colocarla en la cesta", correspondiente a la tarea 6 del benchmark LIBERO-Object. El modelo forma parte del estudio comparativo [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que enfrenta una política entrenada desde cero (ACT) contra un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) sobre las mismas demostraciones.

La relevancia del modelo es metodológica, no de producto: se publica para hacer reproducible un experimento controlado sobre cuánto aporta el preentrenamiento a gran escala en políticas robóticas con pocos datos. Con 51.671.687 parámetros (aproximadamente 52M, según la model card), un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y el resto de la red entrenada desde cero, el modelo cabe en GPUs de consumo: el entrenamiento completo (10.000 pasos, batch de 8) consumió 0,38 horas en una RTX 4050 de portátil con 6 GB de VRAM.

No es un modelo de propósito general: no procesa lenguaje, no soporta tool calling ni razonamiento multi-paso, y solo produce acciones de robot en el entorno LIBERO. Su utilidad práctica se limita a la investigación en aprendizaje por imitación y a la replicación del estudio citado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual ResNet-18 y decodificador de acciones por chunks |
| Parametros totales | 51.671.687 (aprox. 52M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; usa observaciones visuales de 256x256 y estado del robot) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio LeRobot, 0,6 GB) |

## Arquitectura y entrenamiento

ACT es una arquitectura de aprendizaje por imitación que combina un encoder visual convolucional (ResNet-18 preentrenado en ImageNet) con un transformer que predice chunks de 100 acciones futuras a partir de la observación actual. En esta implementación se usan los ajustes por defecto de LeRobot 0.6.2 (commit `b9cb121`): chunks de 100 acciones, batch size 8 y 10.000 pasos de entrenamiento con checkpoints cada 2.000 pasos. La única desviación respecto a los valores por defecto está en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento se realizó sobre 45 episodios de demostración del dataset [`lerobot/libero`](https://huggingface.co/datasets/lerobot/libero) (revisión `a1aaacb7`), correspondientes a la tarea 6 de LIBERO-Object, con semilla 3000. Se usó la normalización de estados y acciones con estadísticas del dataset completo, no solo de los episodios seleccionados. No hay RLHF, DPO ni ajuste fino posterior: es entrenamiento supervisado puro sobre demostraciones. El coste computacional fue de 0,38 horas en una RTX 4050 de 6 GB.

## Capacidades

- Control robótico de manipulación en simulación: predice acciones de 7 grados de libertad (posición, orientación y pinza) para la tarea de coger la mantequilla y depositarla en la cesta.
- Aprendizaje por imitación a partir de demostraciones: reproduce comportamientos observados en 45 episodios.
- Procesamiento visual: encoder ResNet-18 sobre imágenes de 256x256 píxeles.
- Predicción por chunks de acciones: genera secuencias de hasta 100 acciones, con replanificación configurable (cada 10 acciones en la evaluación del estudio).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la observación visual del entorno.

## Casos de uso

- Replicación del estudio vla-vs-scratch: descargar el checkpoint y ejecutar `lerobot-eval` con los parámetros documentados para verificar la tasa de éxito del 30% del checkpoint final en las 50 escenas fijas de LIBERO.
- Baseline en investigación de aprendizaje por imitación: usar este modelo como referencia de "entrenamiento desde cero" al comparar con políticas preentrenadas (SmolVLA u otras VLA) sobre el mismo conjunto de demostraciones.
- Estudio del efecto del número de demostraciones: el modelo forma parte de una cuadrícula con conjuntos anidados de episodios (el estudio entrena variantes con menos demostraciones), lo que permite analizar curvas de rendimiento frente a datos.
- Análisis de variabilidad entre checkpoints: dado que los checkpoints del mismo run rinden de forma muy distinta (34%, 76% y 30% en los pasos 6.000, 8.000 y 10.000), sirve para estudiar la estabilidad del entrenamiento de ACT y la necesidad de evaluar checkpoint a checkpoint.
- Docencia y divulgación: ejemplo ligero (52M parámetros, 0,38 h de entrenamiento en una GPU de portátil) para explicar pipelines de LeRobot, formatos de dataset y evaluación en MuJoCo.
- Pruebas de infraestructura de evaluación robótica: validar entornos LIBERO, renderizado MuJoCo en CPU y flujos de `lerobot-eval` antes de escalar a políticas más grandes.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre las 50 escenas iniciales fijas de LIBERO-Object tarea 6 (estados iniciales 0 a 49):

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 17 de 50 | 34% |
| 8.000 | 38 de 50 | 76% |
| 10.000 (raíz del repo) | 15 de 50 | 30% |
| Media de los 3 checkpoints | 70 de 150 | 46,7% (intervalo de Wilson 95%: 39-55%) |

Contexto agregado del estudio (3 tareas, todas las semillas): ACT con todas las demostraciones (45-50 por tarea) obtuvo 55,4%, frente al 87,3% de SmolVLA con las mismas demostraciones.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en safetensors (52M parámetros en fp32 ocupan unos 207 MB; el repositorio completo pesa 0,6 GB).
- GPU recomendadas: cualquier GPU con al menos 6 GB; el entrenamiento documentado se hizo en una RTX 4050 de portátil (6 GB). Para evaluación basta una GPU modesta o incluso CPU, aunque el renderizado MuJoCo del estudio se ejecutó en CPU bajo WSL2.
- Cabe en GPU de consumo: sí, en RTX 4050, RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path=Pipe1213/act_obj_t2_nall_s3`), entorno LIBERO con MuJoCo. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El estudio solo reporta tiempos de entrenamiento (0,38 h) y evaluación con batch size 1 y replanificación cada 10 acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Rendimiento en el estudio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 51,7M | Imágenes 256x256 + estado; sin lenguaje | 46,7% medio en 3 checkpoints (tarea 6) | Apache 2.0 | HuggingFace, LeRobot |
| SmolVLA (referencia del estudio) | No disponible en la información proporcionada | Visión + lenguaje + acción | 87,3% agregado en 3 tareas con todas las demostraciones | No disponible en la información proporcionada | No disponible en la información proporcionada |
| ACT agregado del estudio (todas las tareas y semillas) | 52M | Igual que este modelo | 55,4% con 45-50 demostraciones por tarea | Apache 2.0 (presumible, mismo pipeline) | Repositorio del estudio |

La comparación directa entre ACT y SmolVLA no aísla el efecto del preentrenamiento: los dos métodos difieren en tamaño, arquitectura y uso de entrada de lenguaje, tal como advierte la propia model card.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object, tarea 6); no generaliza a otras tareas ni entornos.
- Alta variabilidad entre checkpoints del mismo entrenamiento: 34%, 76% y 30% en pasos consecutivos. En 30 de 36 runs de ACT del estudio se observó este patrón; es imprescindible evaluar cada checkpoint antes de usarlo.
- La normalización de estados y acciones usa estadísticas del dataset completo `lerobot/libero`, no solo de los 45 episodios seleccionados, lo que puede introducir desajustes si se reutiliza fuera de ese dataset.
- ACT se entrenó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Las tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, lo que sesga la comparación hacia tareas favorables al modelo preentrenado.
- Sin capacidades de lenguaje: no acepta instrucciones en texto ni puede adaptarse a nuevas tareas mediante prompts.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de acciones erráticas fuera de la distribución de demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo carece de utilidad práctica fuera de investigación y replicación.
- No se documentan sesgos demográficos ni lingüísticos por ausencia de datos de lenguaje o humanos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t2_nall_s3
- Repositorio del estudio vla-vs-scratch: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos del estudio: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis detallado: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- Documentación de LeRobot: no disponible en la información proporcionada
