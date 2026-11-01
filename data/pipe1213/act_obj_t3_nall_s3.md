# Pipe1213/act_obj_t3_nall_s3

## Resumen

`Pipe1213/act_obj_t3_nall_s3` es una política de control robótico entrenada desde cero con el algoritmo ACT (Action Chunking with Transformers, Zhao et al., 2023) sobre una única tarea del benchmark LIBERO-Object: "pick up the chocolate pudding and place it in the basket" (tarea de simulador con id 8). No es un modelo de lenguaje ni un VLA de propósito general: es un checkpoint de imitación de 51,7 millones de parámetros que mapea observaciones visuales y estado proprioceptivo a secuencias de acciones de 7 grados de libertad en un entorno MuJoCo.

El modelo forma parte de un estudio comparativo reproducible (`vla-vs-scratch`) que contrasta un VLA preentrenado afinado (SmolVLA) contra una política entrenada desde cero (ACT) sobre exactamente las mismas demostraciones. Este checkpoint concreto corresponde a la configuración con las 50 demostraciones completas de la tarea y semilla 3000, y se publica para permitir la reproducción del experimento, no como política reutilizable fuera de su tarea.

Su relevancia es metodológica: documenta con detalle el pipeline de entrenamiento (LeRobot 0.6.2), el coste computacional (0,38 h en una RTX 4050 de 6 GB) y la variabilidad entre checkpoints de una misma ejecución, un fenómeno poco reportado en la literatura de imitación robótica. La tasa de éxito agregada de sus tres checkpoints evaluados es del 55,3 % (83 de 150 episodios), frente al 87,3 % de SmolVLA en las mismas condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con encoder visual ResNet-18 preentrenado en ImageNet y cabeza de predicción de chunks de acciones |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por paso, no contexto textual) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea está fijada en el entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato LeRobot) |
| Chunk de acciones | 100 acciones por predicción; reevaluación cada 10 acciones en inferencia |
| Resolución de observación | 256 x 256 píxeles |
| Dataset de entrenamiento | `lerobot/libero`, revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`, 50 episodios |
| Tamaño del repositorio | 0,6 GB |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación diseñada para predecir secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la política. En este checkpoint, el encoder visual es una ResNet-18 inicializada con pesos de ImageNet; el resto de la red (transformer y cabezas de predicción) se entrena desde cero. La política produce chunks de 100 acciones, aunque en evaluación se re-planifica cada 10 acciones, un cambio respecto a los valores por defecto de LeRobot que el autor documenta explícitamente.

El entrenamiento usa 50 episodios de demostración de la tarea LIBERO-Object id 8, con batch size 8, 10.000 pasos, checkpoints cada 2.000 pasos y semilla 3000. El coste total fue de 0,38 horas en una RTX 4050 de 6 GB, lo que da una idea de la ligereza del régimen de entrenamiento. No se documenta uso de RLHF, DPO ni ningún ajuste por preferencias: es imitación supervisada pura sobre demostraciones. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados, siguiendo el comportamiento por defecto de LeRobot.

## Capacidades

- Control robótico simulado de una única tarea: recoger el pudin de chocolate y depositarlo en la cesta, en el entorno LIBERO-Object.
- Predicción de chunks de 100 acciones a partir de observaciones visuales de 256 x 256 y estado proprioceptivo.
- Ejecución con re-planificación cada 10 acciones para mayor reactividad.
- Entrenamiento e inferencia reproducibles mediante LeRobot 0.6.2 (comandos `lerobot-train` y `lerobot-eval` documentados).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa instrucciones en lenguaje natural: la tarea está codificada en los pesos, no en un prompt.
- No incluye visión general, audio ni modos de pensamiento.

## Casos de uso

- Reproducción de experimentos de imitación robótica: sirve como referencia exacta de una configuración ACT con 50 demostraciones y semilla 3000 para comparar contra otros métodos bajo el mismo protocolo de evaluación.
- Estudio de la variabilidad entre checkpoints: permite analizar por qué checkpoints de la misma ejecución rinden de forma muy distinta (36 %, 64 % y 66 % en los pasos 6.000, 8.000 y 10.000), un fenómeno relevante para diseñar protocolos de selección de modelos.
- Baseline de políticas desde cero en robótica: útil para investigadores que quieran medir la brecha entre políticas entrenadas desde cero y VLAs preentrenados en tareas de manipulación con pocas demostraciones.
- Docencia y formación en aprendizaje por imitación: el coste de entrenamiento (0,38 h en una GPU de portátil de 6 GB) lo hace viable en entornos académicos con hardware limitado.
- Validación de pipelines de LeRobot: el modelo y sus comandos sirven para verificar instalaciones, versiones y flujos de evaluación en simulación MuJoCo.
- Pruebas de infraestructura de evaluación en robótica: con 50 estados iniciales fijos y semilla de evaluación 1000, permite comparar implementaciones de evaluación de forma determinista.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 50 estados iniciales fijos de LIBERO-Object (tarea 8), 50 episodios por checkpoint:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 18 de 50 | 36 % |
| 8.000 | 32 de 50 | 64 % |
| 10.000 | 33 de 50 | 66 % |
| Media de los 3 checkpoints | 83 de 150 | 55,3 % (intervalo de Wilson del 95 %: 47-63 %) |

Comparación agregada del estudio (3 tareas, todas las semillas de entrenamiento):

| Método | Demostraciones por tarea | Tasa de éxito agregada |
|---|---|---:|
| ACT desde cero | 45-50 | 55,4 % |
| SmolVLA afinado | 45-50 | 87,3 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, y no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en fp32 para los 51,7 M de parámetros, más el coste del encoder ResNet-18 y del renderizado; el autor entrenó en una GPU de 6 GB, por lo que la inferencia cabe holgadamente en GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el autor usó una RTX 4050 de 6 GB para entrenamiento. Para evaluación, el renderizado MuJoCo se ejecutó en CPU (WSL2), no en GPU.
- Cabe en GPU consumer: sí, en RTX 3050/4050/4060 y superiores; también en GPUs de portátil de gama media.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con el entorno `libero`; no se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma explícita; el entrenamiento completo de 10.000 pasos requirió 0,38 h en una RTX 4050, lo que da una referencia del orden de magnitud del coste por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Pipe1213/act_obj_t3_nall_s3` (ACT) | 51,7 M | Tarea única LIBERO-Object id 8 | 55,3 % (media de 3 checkpoints) | Apache 2.0 | HuggingFace, 26 descargas |
| SmolVLA (referencia del estudio) | no disponible en la información proporcionada | VLA preentrenado, afinado en las mismas tareas | 87,3 % agregado en el estudio | no disponible en la información proporcionada | Referenciado en el repositorio del estudio |
| ACT con menos demostraciones (mismo estudio) | 51,7 M | Misma tarea, subconjuntos de episodios | No disponible por configuración en la información proporcionada | Apache 2.0 | Repositorio del estudio |

No se dispone de datos suficientes para comparar con otras políticas ACT públicas ni con alternativas como Diffusion Policy en las mismas condiciones.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark; no generaliza a otras tareas ni a variaciones del entorno.
- El estudio compara ACT y SmolVLA, pero difieren en preentrenamiento, tamaño, arquitectura y entrada de lenguaje, por lo que la brecha de rendimiento no puede atribuirse únicamente al preentrenamiento.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint SmolVLA publicado ya resolvía, lo que sesga la selección.
- La normalización de estados y acciones usa estadísticas de todo `lerobot/libero`, no solo de los episodios seleccionados.
- ACT se entrenó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Alta variabilidad entre checkpoints de la misma ejecución: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta; es imprescindible evaluar cada checkpoint antes de usarlo.
- El intervalo de Wilson del 55,3 % cubre solo el muestreo de evaluación; la variabilidad entre semillas de entrenamiento es mayor.
- Riesgo de alucinación no aplica en el sentido habitual, pero sí existe riesgo de acciones erráticas fuera de la distribución de demostraciones.
- Licencia Apache 2.0 permite uso comercial del código y pesos, pero el modelo no está validado para producción ni para seguridad en robots reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t3_nall_s3
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- LeRobot: no disponible en la información proporcionada (referenciado como versión 0.6.2, commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`)
