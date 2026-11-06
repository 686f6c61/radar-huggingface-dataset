# Pipe1213/act_obj_t2_n10

## Resumen

`Pipe1213/act_obj_t2_n10` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero para una única tarea de manipulación robótica en simulación: "coger la mantequilla y dejarla en la cesta", correspondiente a la tarea 6 del benchmark LIBERO-Object. El modelo lo publica el usuario Pipe1213 como parte del estudio reproducible [vla-vs-scratch](https://github.com/Pipe1213/vla-vs-scratch), que compara un modelo visión-lenguaje-acción preentrenado y ajustado (SmolVLA) frente a una política entrenada desde cero (ACT) con las mismas pocas demostraciones.

El modelo tiene 51.671.687 parámetros (52M según la model card), emplea un encoder de imagen ResNet-18 inicializado con pesos de ImageNet y predice bloques de 100 acciones. Se entrenó con solo 10 episodios del dataset `lerobot/libero` durante 10.000 pasos, con un coste de cómputo de 0,43 horas en una RTX 4050 de portátil (6 GB). No es una política de propósito general: su interés es metodológico y de reproducibilidad.

Su relevancia actual es acotada pero clara: sirve como referencia empírica del rendimiento de ACT en el régimen de pocas demostraciones. En la evaluación del estudio, este checkpoint concreto obtiene una tasa de éxito media del 5,3% (8 de 150 episodios, intervalo de Wilson del 95%: 3-10%), frente al 34,6% agregado de ACT y el 82,4% de SmolVLA en el conjunto del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de imitación; no procesa contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (sin entrada de lenguaje; condicionada solo por observaciones visuales y estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato LeRobot, `pretrained_model`) |

## Arquitectura y entrenamiento

ACT es un transformer que mapea observaciones (imágenes de 256x256 píxeles y estado del robot) a secuencias de acciones. En esta implementación se usa la configuración por defecto de LeRobot: encoder de imagen ResNet-18 con pesos inicializados de ImageNet, predicción de chunks de 100 acciones y el resto de la red entrenada desde cero. La única desviación respecto a los valores por defecto se produce en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento utilizó 10 episodios concretos del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`): 873, 914, 927, 938, 961, 1012, 1124, 1183, 1185 y 1212. Se emplearon batch size 8, 10.000 pasos, checkpoints cada 2.000 pasos y semilla 1000, con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). No se aplicó RLHF, DPO ni ajuste fino posterior; es aprendizaje por imitación supervisado puro. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.

## Capacidades

- Generación de acciones de manipulación robótica en un entorno simulado (MuJoCo) para una única tarea de pick-and-place.
- Procesamiento de observaciones visuales RGB de 256x256 píxeles mediante encoder ResNet-18.
- Predicción de secuencias de acciones en chunks de 100, con replanificación configurable (cada 10 acciones en la evaluación publicada).
- Aprendizaje por imitación con muy pocas demostraciones (10 episodios).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso en lenguaje ni uso como agente conversacional.
- No tiene capacidades multilingües ni entrada de instrucciones en lenguaje natural.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la observación visual del entorno.

## Casos de uso

- Reproducción de experimentos de investigación: permite replicar exactamente los resultados del estudio vla-vs-scratch ejecutando `lerobot-eval` con la configuración documentada, útil para validar metodologías de comparación entre políticas preentrenadas y desde cero.
- Línea base de referencia en benchmarks de pocas demostraciones: sirve como punto de comparación cuantitativo (5,3% de éxito) para nuevas políticas evaluadas en la tarea 6 de LIBERO-Object con 10 demostraciones.
- Estudio de la varianza entre checkpoints: la model card documenta que checkpoints de la misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones de ACT del estudio), por lo que este modelo es útil para analizar la estabilidad del entrenamiento de ACT.
- Docencia y formación en robótica de imitación: ejemplo completo y ligero (0,6 GB) para ilustrar el flujo de LeRobot, desde el entrenamiento hasta la evaluación en simulación.
- Pruebas de infraestructura de evaluación: al ser un modelo pequeño y rápido de ejecutar, permite validar pipelines de evaluación con MuJoCo y LIBERO antes de lanzar experimentos costosos.
- Análisis de la brecha preentrenamiento vs. desde cero: empleado junto a los checkpoints de SmolVLA del mismo estudio, permite estudiar qué parte de la diferencia de rendimiento se atribuye a la inicialización y cuál a arquitectura o tamaño.

## Benchmarks y rendimiento

Evaluación sobre las 50 escenas iniciales fijas de la tarea (estados iniciales 0 a 49 de LIBERO), 256x256 píxeles, replanificación cada 10 acciones, semilla 1000:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 3 de 50 | 6% |
| 8.000 | 3 de 50 | 6% |
| 10.000 | 2 de 50 | 4% |
| Media de los 3 checkpoints | 8 de 150 | 5,3% (IC 95% Wilson: 3-10%) |

Contexto agregado del estudio (3 tareas, todas las semillas): ACT con 10 demostraciones por tarea, 34,6%; SmolVLA con las mismas demostraciones, 82,4%.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB para los pesos (51,7M parámetros en fp32, ~0,2 GB) más las activaciones del encoder ResNet-18 y del transformer; en la práctica cabe holgadamente en GPUs de 4-6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el entrenamiento documentado se completó en una RTX 4050 de portátil (6 GB) en 0,43 horas.
- Cabe en GPU de consumo: sí, en RTX 4050, RTX 3060, RTX 4060 y superiores; también es viable en CPU para inferencia, aunque la renderización de MuJoCo en la evaluación se ejecutó en CPU (WSL2) según la model card.
- Opciones de despliegue: LeRobot (`lerobot-eval`, `lerobot-train`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma explícita; el coste de entrenamiento de 0,43 h en RTX 4050 da una idea del orden de magnitud, pero no se publican métricas de latencia por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada de lenguaje | Preentrenamiento | Tasa de éxito (estudio, 10 demos) | Licencia |
|---|---|---:|---|---:|---|
| `Pipe1213/act_obj_t2_n10` (ACT) | 51,7M | No | Desde cero (ResNet-18 ImageNet) | 5,3% en esta tarea; 34,6% agregado ACT | Apache 2.0 |
| SmolVLA (ajustado, mismo estudio) | no disponible en la información | Sí | VLA preentrenado | 82,4% agregado | no disponible en la información |
| ACT con más demostraciones (mismo estudio) | 51,7M | No | Desde cero | no disponible por tarea en la información | Apache 2.0 |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento: los modelos difieren también en tamaño, arquitectura y entrada de lenguaje, tal como advierte la propia model card.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object, tarea 6); no es una política de propósito general.
- Tasa de éxito muy baja (5,3% de media, 4% en el checkpoint raíz), lo que la hace inadecuada para uso práctico.
- Alta varianza entre checkpoints de la misma ejecución: en 30 de 36 ejecuciones de ACT del estudio los checkpoints rinden de forma muy distinta; es imprescindible evaluar el checkpoint concreto antes de usarlo.
- Normalización de estados y acciones con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas, lo que puede introducir desajustes.
- ACT se entrenó con los valores por defecto de LeRobot sin ajuste específico para la tarea.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA ya resolvía, por lo que los resultados describen ese subconjunto.
- Sesgos conocidos: no documentados en la información disponible; al ser imitación sobre 10 episodios, hereda los sesgos de esas demostraciones concretas.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de acciones erróneas o fuera de distribución ante observaciones no vistas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción ni para robots reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t2_n10
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset utilizado: https://huggingface.co/datasets/lerobot/libero
