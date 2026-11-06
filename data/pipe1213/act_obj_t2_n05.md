# Pipe1213/act_obj_t2_n05

## Resumen

Pipe1213/act_obj_t2_n05 es una política robótica entrenada desde cero con el algoritmo ACT (Action Chunking with Transformers, Zhao et al., 2023) sobre una única tarea del benchmark LIBERO-Object: "coger la mantequilla y colocarla en la cesta" (task id 6). No es un modelo de lenguaje ni un VLA de propósito general: es un checkpoint de imitación de 51,7 millones de parámetros publicado para reproducir un estudio comparativo entre políticas entrenadas desde cero (ACT) y modelos visión-lenguaje-acción preentrenados (SmolVLA) con muy pocas demostraciones.

El modelo forma parte de la suite de 60 políticas del proyecto vla-vs-scratch, que entrena ambos enfoques sobre las mismas demostraciones y evalúa con los mismos escenarios iniciales fijos de LIBERO. Su rendimiento es deliberadamente modesto: 4 éxitos sobre 150 episodios (2,7 %, intervalo de Wilson del 95 % entre 1 y 7 %) promediando los tres checkpoints evaluados, frente al 78 % agregado de SmolVLA en las mismas condiciones.

Es relevante ahora porque documenta de forma reproducible el coste de entrenar desde cero con datos escasos: 5 episodios, 10.000 pasos, 0,42 horas en una RTX 4050 de portátil y un resultado cercano al azar. Sirve como referencia metodológica y como ejemplo de buenas prácticas de evaluación (checkpoints intermedios, escenarios fijos, intervalos de confianza), no como política desplegable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con encoder visual ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; chunks de 100 acciones) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no recibe entrada de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un transformer que predice secuencias de acciones (chunks de 100 acciones) a partir de observaciones visuales y del estado del robot, con un encoder de imágenes ResNet-18 inicializado con pesos de ImageNet; el resto de la red se entrena desde cero. La política no consume instrucciones en lenguaje: la tarea queda fijada por el conjunto de demostraciones. En evaluación se re-planifica cada 10 acciones en lugar de ejecutar el chunk completo, único cambio respecto a los valores por defecto de LeRobot.

El entrenamiento usa 5 episodios del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`, episodios 938, 961, 1124, 1183 y 1185), batch de 8, 10.000 pasos, semilla 1000 y checkpoints cada 2.000 pasos, con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`). El coste computacional fue de 0,42 horas en una RTX 4050 de portátil con 6 GB de VRAM. No hay RLHF, DPO ni ajuste fino posterior; los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.

## Capacidades

- Generación de secuencias de acciones de 7 grados de libertad (formato de control de LIBERO) a partir de observaciones RGB de 256×256 y del estado proprioceptivo.
- Ejecución de una única tarea de manipulación en simulación: coger la mantequilla y depositarla en la cesta.
- Aprendizaje por imitación con muy pocas demostraciones (5 episodios), sin preentrenamiento en robótica.
- Re-planificación periódica cada 10 acciones para corregir desviaciones durante la ejecución.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni entrada en lenguaje natural.
- No tiene capacidades multilingües ni de visión general: el encoder visual se usa solo como extractor de características para la política.

## Casos de uso

- Reproducción de experimentos de imitación: replicar el entrenamiento con el comando documentado para verificar los resultados del estudio vla-vs-scratch en una máquina con GPU de consumo.
- Línea base de comparación: usar este checkpoint como referencia de "entrenado desde cero" frente a SmolVLA u otros VLA preentrenados en la misma tarea y con las mismas demostraciones.
- Estudio del efecto del número de demostraciones: al estar anidadas las configuraciones del estudio, comparar este resultado de 5 episodios con los de 10, 25 o 50 episodios del mismo autor.
- Análisis de variabilidad entre checkpoints: evaluar los checkpoints de 6.000, 8.000 y 10.000 pasos para ilustrar cómo checkpoints de una misma ejecución rinden de forma muy distinta (0 %, 0 % y 8 %).
- Docencia en aprendizaje por imitación: ejemplo mínimo y ejecutable en portátil de un pipeline completo LeRobot (entrenamiento, evaluación en MuJoCo, métricas con intervalos de confianza).
- Validación de infraestructura de evaluación: probar el entorno `lerobot-eval` con LIBERO y estados iniciales fijos antes de lanzar experimentos más costosos.
- Referencia negativa en selección de políticas: documentar por qué no basta con entrenar desde cero con 5 demostraciones para una tarea de manipulación.

## Benchmarks y rendimiento

Evaluación sobre los 50 estados iniciales fijos de LIBERO (init states 0 a 49), imágenes de 256×256, re-planificación cada 10 acciones, semilla 1000, renderizado MuJoCo en CPU:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 0 de 50 | 0 % |
| 8.000 | 0 de 50 | 0 % |
| 10.000 (raíz del repo) | 4 de 50 | 8 % |
| Media de los 3 checkpoints (puntuación del estudio) | 4 de 150 | 2,7 % (IC 95 % de Wilson: 1-7 %) |

Contexto agregado del estudio, con 3 tareas y todas las semillas de entrenamiento: ACT con 5 demostraciones por tarea alcanzó 17,9 % y SmolVLA con las mismas demostraciones, 78 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB con los pesos en safetensors (51,7 M de parámetros); el repositorio completo ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; el entrenamiento documentado se hizo en una RTX 4050 de portátil con 6 GB.
- Cabe holgadamente en GPU de consumo: RTX 3050, RTX 4050, RTX 4060, RTX 4090 y equivalentes; también es viable en CPU para evaluación, aunque el cuello de botella será el renderizado MuJoCo.
- Opciones de despliegue: LeRobot (`lerobot-eval --policy.path=Pipe1213/act_obj_t2_n05`) con el entorno `libero`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una política robótica.
- Latencia y throughput: no disponibles de forma explícita; el coste de entrenamiento fue de 0,42 h para 10.000 pasos, lo que da una idea del orden de magnitud del cómputo por paso en una GPU de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Preentrenamiento | Entrada de lenguaje | Contexto / horizonte | Tasa de éxito (estudio, 5 demos) | Licencia |
|---|---|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | No (desde cero, ResNet-18 ImageNet) | No | Chunks de 100 acciones, re-planificación cada 10 | 2,7 % en esta tarea; 17,9 % agregado | Apache 2.0 |
| SmolVLA (referencia del estudio) | no disponible en la información | Sí (VLA preentrenado) | Sí | no disponible | 78 % agregado | no disponible |
| Otras políticas ACT del estudio | 51,7 M | No | No | Igual que este modelo | Variable; 17,9 % agregado en 3 tareas | Apache 2.0 |

La comparación no es limpia por diseño: SmolVLA y ACT difieren en preentrenamiento, tamaño, arquitectura y entrada de lenguaje, por lo que la brecha no puede atribuirse solo al preentrenamiento, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object, task id 6); no generaliza a otras tareas ni a variaciones del entorno.
- Rendimiento cercano al azar (2,7 % de media, 8 % en el mejor checkpoint); no es una política utilizable en producción.
- Gran variabilidad entre checkpoints de una misma ejecución: en 30 de 36 ejecuciones ACT del estudio los checkpoints rinden de forma muy distinta; hay que evaluar cada checkpoint antes de usarlo.
- Normalización de estados y acciones con estadísticas de todo el dataset `lerobot/libero`, no solo de las demostraciones seleccionadas, lo que puede introducir desajustes de escala.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para esta tarea.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA para LIBERO ya resolvía, lo que sesga la comparación.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje, pero la política puede producir acciones erráticas fuera de la distribución de las demostraciones.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para ningún uso real y el autor lo publica solo con fines de reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pipe1213/act_obj_t2_n05
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada
- Documentación de LeRobot: no disponible en la información proporcionada
