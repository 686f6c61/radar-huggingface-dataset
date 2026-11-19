# hrl-imerse/doug-act-stack-best1

## Resumen

`doug-act-stack-best1` es un checkpoint de política robótica entrenado con el algoritmo ACT (Action Chunking with Transformers) para una tarea de apilado de bloques con un brazo manipulador SO-101. Lo publica el usuario `hrl-imerse` dentro de un flujo de trabajo de investigación en robótica de manipulación, y corresponde a la "ronda 1" de un proceso iterativo de DAgger (Dataset Aggregation) sobre un modelo base entrenado con 50 demostraciones de teleoperación. El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras ejecutables en hardware de consumo.

El problema que resuelve es concreto: controlar un brazo robótico para apilar tres bloques (naranja, verde y morado) en una torre, usando únicamente una cámara de muñeca de 480x640 a 30 fps como entrada visual y un vector de estado de 6 dimensiones. La salida es un chunk de 100 acciones de 6 dimensiones (posiciones articulares absolutas en grados más apertura de pinza de 0 a 100). Es relevante ahora porque documenta un ciclo real de mejora iterativa con DAgger en robótica de bajo coste, y porque el propio autor lo marca explícitamente como superado por `doug-act-stack-best2`.

La model card es inusualmente detallada y actúa casi como un cuaderno de laboratorio: describe el proceso de entrenamiento, las recetas de fine-tuning, los fallos observados en el brazo real y las lecciones aprendidas. Este checkpoint concreto (BEST1) agarraba los tres bloques y apilaba el verde, pero retenía los bloques sobre la torre entre 20 y 40 segundos sin abrir la pinza; ese fallo motivó la ronda 2 de DAgger que produjo BEST2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje; chunk de acción de 100 pasos) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente fp32/bf16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; recibe una cadena de tarea en inglés: `Stack the orange, green and purple blocks into a tower.`) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para imitación en robótica que predice chunks de acciones (100 pasos en este caso) en lugar de acciones individuales, lo que reduce el error de acumulación y suaviza el control. La entrada combina `observation.state` (6 dimensiones: posiciones articulares y pinza), una imagen de muñeca de 480x640x3 a 30 fps y una cadena de tarea en lenguaje natural. La salida es `action` (6 dimensiones: objetivos articulares absolutos en grados más pinza en escala 0-100). El entrenamiento usa aumento de imagen (`image_transforms.enable=true`), precisión mixta bf16 y batch de 8.

El proceso documentado es el siguiente: primero se entrenó `act_stack_v3` durante 100.000 pasos sobre 50 demostraciones de teleoperación, y se seleccionó el checkpoint de 60.000 pasos como mejor en brazo real (val loss 0,2375). Después se aplicó DAgger ronda 1 sobre ese checkpoint: 72 correcciones centradas en fallos de elección y agarre de bloque, seguidas de un fine-tune de 10.000 pasos sobre la mezcla de 72 correcciones más las 50 demos. Ese resultado es BEST1, con val loss 0,2275. El fine-tune tarda unos 10 minutos en un portátil con RTX 3500 Ada a aproximadamente 17 pasos por segundo. La evaluación en brazo se hace con ensembling de coeficiente 0,01 y límite de episodio de 90 segundos.

## Capacidades

- Control robótico de manipulación: genera trayectorias articulares de 6 grados de libertad para apilar bloques.
- Percepción visual monocular: usa exclusivamente la cámara de muñeca, sin cámara externa.
- Ejecución de instrucciones en lenguaje natural mediante una cadena de tarea fija.
- Predicción de chunks de acción de 100 pasos con ensembling temporal.
- Generalización limitada a variaciones de color y posición de los bloques dentro de la distribución de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico.
- No es multilingüe ni procesa texto libre; la cadena de tarea es fija.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en imitación robótica: sirve como punto de partida reproducible para experimentos de DAgger, ya que la model card documenta la receta completa de fine-tuning y mezcla de datasets.
- Apilado de bloques en banco de pruebas: el modelo ejecuta la tarea de torre de tres bloques sobre un SO-101, útil para medir tasas de éxito y tiempos de liberación de pinza.
- Comparación de checkpoints en brazo real: al ser un checkpoint intermedio (BEST1) frente a BEST2, permite estudiar cómo cambios pequeños en el dataset de correcciones afectan al comportamiento físico.
- Docencia y formación en robótica de bajo coste: el flujo completo (teleoperación, DAgger, fine-tuning en portátil) es replicable con hardware asequible y un portátil con GPU consumer.
- Generación de datos de corrección: las políticas intermedias como BEST1 se usan para recolectar rollouts que luego se corrigen con el brazo líder, alimentando rondas posteriores de DAgger.
- Validación de pipelines de despliegue LeRobot: el modelo se ejecuta con scripts de evaluación y bucles DAgger del ecosistema LeRobot, por lo que sirve para probar integraciones de adquisición, normalización y control en tiempo real.
- Estudio de fallos de liberación: al retener bloques 20-40 segundos, es un caso de análisis útil para diseñar correcciones específicas de apertura de pinza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, ya que no es un modelo de lenguaje. Los únicos datos cuantitativos aportados son de validación interna y comportamiento en brazo real:

| Metrica | Valor |
|---|---|
| Val loss (checkpoint 60k base) | 0,2375 |
| Val loss BEST1 (ronda 1 DAgger) | 0,2275 |
| Val loss BEST2 (ronda 2 DAgger) | 0,2295 |
| Val loss ronda 3 (peor en brazo) | 0,2251 |
| Pasos de entrenamiento del fine-tune | 10.000 |
| Correcciones DAgger ronda 1 | 72 |
| Episodios de entrenamiento BEST2 | 154 (72 r1 + 32 r2 + 50 demos) |
| Tiempo de fine-tune | ~10 min en RTX 3500 Ada |
| Throughput de entrenamiento | ~17 pasos/s |
| Comportamiento en brazo de BEST1 | agarra los 3 bloques, apila el verde, retiene bloques 20-40 s sin abrir pinza |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB con 51,7 millones de parámetros en bf16 o fp32; el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve para inferencia; el entrenamiento documentado se hizo en una RTX 3500 Ada (portátil).
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-train`, scripts `3_eval_rollouts.sh` y `dagger_loop.sh`), con normalizador incluido en el checkpoint (`policy_preprocessor_step_3_normalizer_processor.safetensors`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles de forma explícita; el control se ejecuta a la frecuencia del bucle de evaluación con ensembling 0,01 y episodios limitados a 90 segundos.
- Requiere calibración del brazo líder (`so_leader`) y verificar que la cámara de muñeca no esté bloqueada antes de cada evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / chunk | Rendimiento en brazo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `doug-act-stack-best1` | 51,7 M | chunk de 100 acciones | Apila verde pero retiene bloques 20-40 s | no disponible | Hugging Face |
| `doug-act-stack-best2` | no disponible (mismo linaje ACT) | chunk de 100 acciones | Libera tras 0,6-0,8 s; "casi perfecto" | no disponible | Hugging Face |
| `act_stack_v3` checkpoint 60k | no disponible | chunk de 100 acciones | Base; val loss 0,2375 | no disponible | Local (no publicado como modelo) |
| Ronda 3 (`doug-stack-dagger-r3`) | no disponible | chunk de 100 acciones | Peor en brazo pese a menor val loss (0,2251) | no disponible | Solo dataset de referencia |

No se dispone de comparación con políticas ACT de otros autores ni con alternativas como Diffusion Policy o VQ-BeT en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint superado: el propio autor indica que BEST1 está reemplazado por BEST2 y que los nuevos experimentos deben partir de BEST2.
- Fallo de liberación documentado: retiene los bloques sobre la torre entre 20 y 40 segundos sin abrir la pinza, lo que hace la tarea poco fiable en producción.
- Sesgo de distribución: entrenado con una disposición fija de bloques (tres ranuras a la derecha de la bandeja) y un orden de apilado fijo (naranja, verde, morado), con colores barajados pero geometría constante.
- Dependencia de una sola cámara de muñeca: una lente bloqueada provoca episodios a ciegas, como se documenta en la model card.
- La val loss sobre 5 demos reservadas no predice el éxito en brazo real; la ronda 3 tuvo la menor val loss y el peor comportamiento físico.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Sin datos de sesgos sociales, alucinación o multilingüismo por no ser un modelo de lenguaje; los riesgos son de seguridad física en el brazo.
- El listener de teclado de LeRobot es global: escribir en cualquier ventana puede terminar o descartar ensayos durante la evaluación.
- Requiere ensembling 0,01 y un límite de episodio de 90 segundos para reproducir las condiciones documentadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hrl-imerse/doug-act-stack-best1
- Modelo sucesor BEST2: https://huggingface.co/hrl-imerse/doug-act-stack-best2
- Dataset de entrenamiento de BEST2: https://huggingface.co/datasets/hrl-imerse/doug-stack-v3-best2-train
- Demos originales de teleoperación: https://huggingface.co/datasets/hrl-imerse/doug-stack-v3-trimmed
- Correcciones DAgger ronda 1: https://huggingface.co/datasets/hrl-imerse/doug-stack-dagger-r1
- Correcciones DAgger ronda 2: https://huggingface.co/datasets/hrl-imerse/doug-stack-dagger-r2
- Correcciones DAgger ronda 3: https://huggingface.co/datasets/hrl-imerse/doug-stack-dagger-r3
