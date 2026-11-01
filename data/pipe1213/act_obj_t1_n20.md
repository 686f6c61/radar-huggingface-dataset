# Pipe1213/act_obj_t1_n20

## Resumen

`Pipe1213/act_obj_t1_n20` es una política de imitación basada en ACT (Action Chunking with Transformers, Zhao et al., 2023) entrenada desde cero por el usuario Pipe1213 para una única tarea de manipulación robótica en simulación: recoger una salsa barbacoa y depositarla en una cesta dentro del benchmark LIBERO-Object. No es un modelo de lenguaje ni un modelo de propósito general: es un artefacto de investigación publicado para hacer reproducible un estudio comparativo entre políticas entrenadas desde cero y modelos visión-lenguaje-acción preentrenados (VLA).

El modelo forma parte de los 60 checkpoints del proyecto `vla-vs-scratch`, que compara SmolVLA (un VLA preentrenado) con ACT entrenado desde cero sobre las mismas pocas demostraciones. Esta ficha concreta corresponde a la variante con 20 demostraciones y semilla 1000. Cuenta con 51,7 millones de parámetros, codifica acciones en chunks de 100 pasos y usa un codificador visual ResNet-18 inicializado con pesos de ImageNet; el resto de la red se entrena desde cero con 20 episodios del dataset `lerobot/libero`.

Su relevancia es metodológica más que práctica: permite verificar y replicar los resultados del estudio, y sirve como referencia de lo que consigue una política ligera entrenada con datos escasos frente a un VLA preentrenado. El autor advierte explícitamente de que no está pensado como política de propósito general y de que solo se ha evaluado en simulación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con codificador visual ResNet-18 |
| Parametros totales | 51.671.687 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje; entrada visual y de estado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es una arquitectura de imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza la ejecución. En esta implementación se usa la configuración por defecto de LeRobot: 52M parámetros, chunks de 100 acciones y un codificador de imagen ResNet-18 inicializado con pesos de ImageNet. El resto de los componentes (transformer de política, decodificador de acciones) se entrena desde cero. La única desviación respecto a los valores por defecto se produce en evaluación: la política replanifica cada 10 acciones en lugar de ejecutar el chunk completo.

El entrenamiento usa 20 episodios concretos del dataset `lerobot/libero` (revisión `a1aaacb7f6cd6ee5fb43120f673cebb0cfea7dd4`), con batch size 8, 10.000 pasos, checkpoint cada 2.000 pasos y semilla 1000. Se ejecutó con LeRobot 0.6.2 (commit `b9cb121cb7d4e3e26ec5c906d08dda68d151ba52`) y consumió 0,44 horas en una RTX 4050 de portátil con 6 GB de VRAM. No se documenta uso de RLHF, DPO ni ajuste fino posterior; es imitación supervisada pura sobre demostraciones. Los estados y acciones se normalizan con estadísticas de todo el dataset `lerobot/libero`, no solo de los episodios seleccionados.

## Capacidades

- Ejecución de una única tarea de manipulación en simulación: "pick up the bbq sauce and place it in the basket" (LIBERO-Object, task id 3).
- Predicción de chunks de 100 acciones con replanificación cada 10 acciones en evaluación.
- Procesamiento de observaciones visuales a 256x256 píxeles y estado del robot como entrada.
- Aprendizaje por imitación a partir de pocas demostraciones (20 episodios).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la percepción visual necesaria para la política.

## Casos de uso

- Reproducción del estudio `vla-vs-scratch`: descargar el checkpoint y ejecutar el comando `lerobot-eval` documentado para verificar la tasa de éxito del 46% en el checkpoint de 10.000 pasos sobre los 50 estados iniciales fijos de LIBERO.
- Referencia base para comparativas de políticas: sirve como línea base de ACT entrenado desde cero frente a SmolVLA u otros VLA en la misma tarea y con las mismas demostraciones.
- Investigación en aprendizaje por imitación con datos escasos: permite estudiar cómo varía el rendimiento entre checkpoints de una misma ejecución (de 30% a 60% en este caso) y la sensibilidad a la semilla.
- Docencia y formación en robótica: ejemplo completo y ligero (0,6 GB, entrena en 0,44 h en una GPU consumer) para ilustrar el pipeline de LeRobot con ACT y LIBERO.
- Análisis de la brecha entre políticas desde cero y VLA preentrenados: cuantificar cuánto aporta el preentrenamiento frente a arquitectura, tamaño y entrada de lenguaje.
- Pruebas de infraestructura de evaluación en simulación: validar entornos MuJoCo, renderizado a 256x256 y protocolos de evaluación con estados iniciales fijos antes de escalar a otros modelos.
- Punto de partida para experimentos de ajuste fino o aumento de datos en la misma tarea, dado que la licencia Apache 2.0 lo permite.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los 50 estados iniciales fijos de LIBERO-Object (task id 3), 50 episodios por checkpoint:

| Checkpoint (paso) | Éxitos | Tasa de éxito |
|---|---:|---:|
| 6.000 | 15 de 50 | 30% |
| 8.000 | 30 de 50 | 60% |
| 10.000 | 23 de 50 | 46% |
| Media de los 3 checkpoints | 68 de 150 | 45,3% (intervalo de Wilson 95%: 38-53%) |

Contexto del estudio: agregando las 3 tareas y todas las semillas, ACT con 20 demostraciones por tarea alcanzó 33,1% y SmolVLA con las mismas demostraciones alcanzó 74,2%. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) porque no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy inferior a 6 GB; el entrenamiento completo cupo en una RTX 4050 de 6 GB en 0,44 h, por lo que la inferencia es viable en GPUs consumer modestas.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM para entrenamiento; para inferencia basta con GPUs consumer de gama media o incluso CPU para evaluación en simulación.
- Cabe en GPU consumer: sí, confirmado en RTX 4050 (6 GB) para entrenamiento; la evaluación se realizó con renderizado MuJoCo en CPU bajo WSL2.
- Opciones de despliegue: LeRobot (`lerobot-eval`) con entorno `libero`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. La evaluación usa batch size 1 y replanificación cada 10 acciones, pero no se publican tiempos por episodio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT (este modelo, 20 demos) | 51,7M | no aplica | 45,3% medio (33,1% agregado en el estudio) | Apache 2.0 | HuggingFace, LeRobot |
| SmolVLA (20 demos, mismo estudio) | no disponible en la información | no aplica | 74,2% agregado en el estudio | no disponible en la información | Referenciado en el estudio |
| ACT con más demostraciones (estudio) | 51,7M | no aplica | no disponible por variante | Apache 2.0 | HuggingFace, LeRobot |

La comparación directa con SmolVLA no aísla el efecto del preentrenamiento, ya que ambos difieren en tamaño, arquitectura y entrada de lenguaje, tal como advierte el autor.

## Limitaciones y advertencias

- Solo simulación: no se ha probado en un robot real.
- Una única tarea de un único benchmark (LIBERO-Object, task id 3); no generaliza a otras tareas.
- Los checkpoints de una misma ejecución rinden de forma muy distinta (en 30 de 36 ejecuciones de ACT del estudio); hay que evaluar cada checkpoint antes de usarlo.
- La comparación con SmolVLA no atribuye la diferencia únicamente al preentrenamiento, porque también cambian tamaño, arquitectura y entrada de lenguaje.
- Las 3 tareas del estudio se eligieron entre las que un checkpoint publicado de SmolVLA para LIBERO ya resolvía, lo que sesga el conjunto de resultados.
- La normalización de estados y acciones usa estadísticas de todo `lerobot/libero`, no solo de las demostraciones seleccionadas.
- ACT se usó con los valores por defecto de LeRobot, sin ajuste específico para la tarea.
- Riesgo de alucinación y sesgos: no aplica en el sentido habitual de modelos de lenguaje; el riesgo es de fallo de la política ante escenas fuera de distribución.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está validado para producción ni para entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Pipe1213/act_obj_t1_n20
- Repositorio del estudio: https://github.com/Pipe1213/vla-vs-scratch
- Resultados completos: https://github.com/Pipe1213/vla-vs-scratch#results
- Análisis: https://github.com/Pipe1213/vla-vs-scratch/blob/main/results/analysis.md
- Dataset: https://huggingface.co/datasets/lerobot/libero
- Paper de ACT (Zhao et al., 2023): no disponible en la información proporcionada.
