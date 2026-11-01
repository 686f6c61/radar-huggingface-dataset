# Pipe1213/act_obj_t1_nall

## Resumen

Pipe1213/act_obj_t1_nall es una política de imitación para robótica entrenada desde cero con el algoritmo ACT (Action Chunking with Transformers, Zhao et al., 2023) sobre la tarea de simulación "pick up the bbq sauce and place it in the basket" del benchmark LIBERO-Object. No es un modelo de lenguaje ni un VLA de propósito general: es un checkpoint de 51,7 millones de parámetros que mapea observaciones visuales (imágenes de 256x256) y estado del robot a secuencias de acciones, publicado para hacer reproducible un estudio comparativo entre políticas entrenadas desde cero y modelos VLA preentrenados.

El modelo forma parte del proyecto vla-vs-scratch, que compara ACT entrenado desde cero con SmolVLA ajustado sobre las mismas demostraciones. Este checkpoint concreto usa las 46 demostraciones completas de la tarea (semilla 1000) y alcanza un 94 % de éxito en el checkpoint de 10.000 pasos sobre los 50 estados iniciales fijos de LIBERO, con una media del 77,3 % entre los tres checkpoints evaluados. Su relevancia es metodológica: sirve como referencia de línea base para medir cuánto aporta realmente el preentrenamiento en tareas con pocas demostraciones.

La arquitectura es un transformer ligero con codificador visual ResNet-18 preentrenado en ImageNet y el resto de pesos entrenados desde cero, con chunks de 100 acciones. El contexto no es textual sino una ventana de observaciones; los "idiomas soportados" no aplican. La licencia es Apache 2.0 y el repositorio pesa 0,6 GB en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con codificador visual ResNet-18 |
| Parametros totales | 51.671.687 (52 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones por paso y chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice chunks de acciones (100 pasos por chunk) a partir de observaciones visuales y del estado del robot. El codificador de imagen es un ResNet-18 inicializado con pesos de ImageNet; el resto de la red (transformer y cabezas de acción) se entrena desde cero. Se usan los ajustes por defecto de LeRobot 0.6.2 (commit b9cb121), con la única modificación en evaluación de replanificar cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento emplea 46 episodios de demostración del dataset lerobot/libero (revisión a1aaacb7), con batch size 8, 10.000 pasos, semilla 1000 y checkpoints cada 2.000 pasos. El coste computacional fue de 0,45 horas en una GPU de portátil RTX 4050 con 6 GB de VRAM. No hay RLHF ni DPO: es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas del dataset completo lerobot/libero, no solo de los episodios seleccionados (comportamiento por defecto de LeRobot).

## Capacidades

- Control robótico de manipulación en simulación: agarra un objeto concreto (salsa BBQ) y lo deposita en una cesta.
- Predicción de chunks de 100 acciones con replanificación cada 10 pasos en evaluación.
- Procesamiento de observaciones visuales RGB de 256x256 píxeles junto con el estado del robot.
- Aprendizaje por imitación con pocas demostraciones (46 episodios).
- No soporta tool calling, function calling ni agentes multi-step.
- No tiene capacidades multilingües, de texto, visión general, audio ni modo de razonamiento.
- No es un modelo de propósito general: está especializado en una única tarea de un único benchmark.

## Casos de uso

- Línea base en investigación de imitación: sirve para cuantificar la ganancia real del preentrenamiento VLA frente a entrenar desde cero, replicando el protocolo del estudio vla-vs-scratch con los mismos estados iniciales y semillas.
- Reproducibilidad de experimentos: el checkpoint y el comando exacto de entrenamiento permiten regenerar los resultados en 0,45 h en una RTX 4050, útil para validar pipelines de LeRobot antes de escalar a modelos mayores.
- Docencia y formación en robótica: ejemplo completo y ligero de un pipeline ACT con LeRobot, desde el dataset hasta la evaluación en MuJoCo, ejecutable en hardware de consumo.
- Pruebas de infraestructura de evaluación: al ser pequeño y rápido, sirve para validar entornos de simulación LIBERO, renderizado en CPU y scripts de evaluación antes de desplegar políticas más costosas.
- Estudio de variabilidad entre checkpoints: el modelo documenta que checkpoints del mismo entrenamiento rinden de forma muy distinta (30 de 36 ejecuciones ACT en el estudio), por lo que es útil para diseñar protocolos de selección de checkpoint.
- Comparación de estrategias de replanificación: permite experimentar con la frecuencia de replanificación (10 acciones frente a chunk completo) y medir su impacto en la tasa de éxito en una tarea de manipulación concreta.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO-Object (tarea 3), 50 episodios por checkpoint, imágenes de 256x256, replanificación cada 10 acciones, semilla 1000.

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 31 de 50 | 62 % |
| 8.000 | 38 de 50 | 76 % |
| 10.000 | 47 de 50 | 94 % |
| Media de los 3 checkpoints | 116 de 150 | 77,3 % (IC Wilson 95 %: 70-83 %) |

Contexto del estudio (agregado sobre 3 tareas y todas las semillas de entrenamiento): ACT con todas las demostraciones (45-50 por tarea) obtuvo un 55,4 %; SmolVLA con las mismas demostraciones, un 87,3 %. El intervalo de Wilson cubre solo el muestreo de evaluación; la variabilidad entre semillas de entrenamiento es mayor, especialmente en ACT.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, por debajo de 2 GB; el entrenamiento completo cupo en una RTX 4050 de 6 GB.
- GPU recomendadas: cualquier GPU consumer con 4-6 GB o más (RTX 4050, RTX 3060, RTX 4060, RTX 4090). No requiere A100 ni H100.
- Cabe en GPU consumer: sí, con margen amplio, incluida la gama de entrada portátil.
- Despliegue: LeRobot (lerobot-eval) con entorno LIBERO y MuJoCo; el renderizado de evaluación puede ejecutarse en CPU (probado en WSL2).
- Latencia y throughput: no se publican métricas de latencia; el entrenamiento de 10.000 pasos tarda 0,45 h en una RTX 4050.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Tasa de éxito (estudio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo) | 52 M | Observaciones 256x256 + estado, chunks de 100 acciones | 77,3 % (media de 3 checkpoints, tarea BBQ) | Apache 2.0 | HuggingFace (LeRobot) |
| SmolVLA (referencia del estudio) | no disponible en la información proporcionada | VLA con entrada de lenguaje | 87,3 % (agregado del estudio) | no disponible en la información proporcionada | HuggingFace |
| ACT con todas las demostraciones (agregado del estudio) | 52 M | Igual que este modelo | 55,4 % (agregado 3 tareas, todas las semillas) | Apache 2.0 | Repositorio del estudio |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: ambos difieren en tamaño, arquitectura y entrada de lenguaje, como advierte el propio autor.

## Limitaciones y advertencias

- Solo simulación y una única tarea de un único benchmark; no probado en un robot real.
- La comparación con SmolVLA mezcla preentrenamiento con diferencias de tamaño, arquitectura y entrada de lenguaje; no puede atribuirse la brecha solo al preentrenamiento.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint SmolVLA ya resolvía, por lo que los resultados describen esas tareas concretas.
- Normalización de estados y acciones con estadísticas del dataset completo lerobot/libero, no solo de las demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Alta variabilidad entre checkpoints del mismo entrenamiento (30 de 36 ejecuciones ACT en el estudio): es imprescindible evaluar un checkpoint antes de usarlo.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje, pero la política puede fallar de forma impredecible fuera de los estados iniciales de evaluación.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción ni para entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t1_nall
- Repositorio del estudio vla-vs-scratch: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset lerobot/libero: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada
