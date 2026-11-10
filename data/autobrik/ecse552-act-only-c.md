# Autobrik/ecse552-act-only-C

## Resumen

`Autobrik/ecse552-act-only-C` es un checkpoint de robótica basado en ACT (Action Chunking with Transformers), el algoritmo de imitation learning publicado por Tony Zhao en el repositorio `tonyzhaozh/act`. El modelo lo publica el usuario Autobrik como parte del proyecto de la asignatura ECSE 552 de la Universidad McGill, titulado *Learning to Manipulate a New Object from Action-Free Videos*. No se trata de un modelo de lenguaje: es una política visomotora entrenada para controlar un brazo robótico a partir de imágenes de cámara.

El checkpoint se entrena sobre el conjunto de datos `Autobrik/ecse552-ocbench-block` (revisión `f7396350f5d70d2d48361fda552028e5a2590774`) y reproduce la arquitectura ACT sin modificaciones, con dos diferencias clave: solo consume imágenes (el estado del robot se pone a cero) y trabaja con 7 dimensiones de acción rellenadas con ceros hasta las 14 del ACT original. Las acciones son objetivos articulares absolutos, con chunks de 20 pasos a 10 Hz (2 segundos), frente a los 100 pasos a 50 Hz del ACT canónico.

Su relevancia es acotada y experimental: sirve como referencia reproducible para investigar manipulación robótica aprendida a partir de vídeos sin acciones, y como punto de partida para comparar variantes (el sufijo `C` sugiere una configuración dentro de una familia de experimentos). No hay información sobre idiomas, contexto ni benchmarks estándar de NLP porque no aplican a este tipo de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de NLP; ventana de observación visual y chunk de 20 pasos a 10 Hz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | checkpoints PyTorch (`.ckpt`: `policy_best.ckpt`, `policy_last.ckpt`, `selected.ckpt`) |
| Entrada | imágenes de cámara (estado del robot a cero) |
| Dimensión de acción | 7 (objetivos articulares absolutos), rellenada a 14 |
| Frecuencia de control | 10 Hz (chunk de 20 pasos = 2 s) |
| Dataset de entrenamiento | `Autobrik/ecse552-ocbench-block` |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura ACT sin modificar respecto al repositorio original de Zhao: un transformer que combina un codificador visual (típicamente ResNet) con un codificador de estado y un decodificador que predice secuencias de acciones (*action chunks*). La innovación central de ACT es predecir bloques de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza la ejecución. En este caso, el chunk es de 20 pasos a 10 Hz, equivalente a 2 segundos de trayectoria, frente a los 100 pasos a 50 Hz del ACT original.

El entrenamiento es de imitation learning supervisado sobre demostraciones del dataset `ecse552-ocbench-block`. Las diferencias declaradas por el autor son: entrada exclusivamente visual (el vector de estado del robot se anula), acciones de 7 dimensiones rellenadas con ceros hasta 14, episodios de longitud variable y uso de múltiples colecciones de datos (etiquetas oracle o pseudo-etiquetadas según la variante). Cada directorio `n<demos>/seed<k>/` contiene `policy_best.ckpt` (menor pérdida de validación), `policy_last.ckpt`, `selected.ckpt` (el mejor de los dos según rollouts de validación en el dominio fuente) y metadatos (`dataset_stats.pkl`, `act_run.json`, `history.json`, `provenance.json`). No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicó RLHF o DPO (no aplica en imitation learning).

## Capacidades

- Control visomotor de un brazo robótico a partir de imágenes de cámara, sin usar el estado articular como entrada.
- Predicción de secuencias de acciones (action chunking) de 20 pasos a 10 Hz, con acciones como objetivos articulares absolutos de 7 dimensiones.
- Ejecución de tareas de manipulación aprendidas por imitación sobre el objeto del dataset `ecse552-ocbench-block`.
- Carga programática mediante `action_free.act_original.ActPolicy("n300/seed0/selected.ckpt", device)`.
- Múltiples variantes entrenadas con distinto número de demostraciones (`n<demos>`) y semillas (`seed<k>`), lo que permite estudiar la sensibilidad al volumen de datos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Investigación en imitation learning: reproducir el experimento del proyecto ECSE 552 comparando el rendimiento de ACT con distintas cantidades de demostraciones (`n<demos>`) y semillas, usando los checkpoints `policy_best.ckpt` y `policy_last.ckpt` junto con `history.json` para analizar curvas de pérdida.
- Aprendizaje de manipulación a partir de vídeos sin acciones: el checkpoint sirve como política base entrenada con etiquetas oracle o pseudo-etiquetadas, permitiendo evaluar si las etiquetas derivadas de vídeos action-free son suficientes para controlar el brazo.
- Benchmark de referencia para variantes: al ser ACT sin modificar, permite aislar el efecto de cambios posteriores (nuevas arquitecturas, representaciones o esquemas de etiquetado) frente a una línea base conocida.
- Evaluación en simulación o laboratorio con OCBench: el dataset `ecse552-ocbench-block` y las colecciones listadas en `act_run.json` permiten montar rollouts de validación y test reproducibles con `selected.ckpt`.
- Estudio de robustez visual: al depender solo de imágenes, se puede analizar cómo afectan cambios de iluminación, oclusión o punto de vista a la política, algo relevante para transferencia sim-a-real.
- Docencia y formación: ejemplo completo y ligero de pipeline de robótica (dataset, entrenamiento, selección de checkpoint por validación, evaluación en test) para cursos de aprendizaje automático aplicado a robótica.
- Punto de partida para fine-tuning: al estar bajo licencia MIT, se puede reentrenar sobre un dataset propio de demostraciones para una tarea de manipulación concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en tareas, tasas de acierto ni comparaciones numéricas con otras políticas; solo menciona que `selected.ckpt` es el mejor checkpoint según rollouts de validación en el dominio fuente y que es el evaluado en test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. ACT es una política relativamente ligera (codificador visual tipo ResNet más transformer), pero el tamaño exacto de los checkpoints no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. Por la naturaleza del modelo, una GPU consumer moderna (por ejemplo, RTX 3060 o superior) sería en principio suficiente para inferencia en tiempo real a 10 Hz, pero no hay datos confirmados.
- Compatibilidad con GPU consumer: probablemente sí, dado el tamaño típico de ACT, aunque no se confirma en la información disponible.
- Opciones de despliegue: carga mediante el adaptador `action_free.act_original.ActPolicy` del repositorio `BrikHMP18/ecse-552-project`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Acciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Autobrik/ecse552-act-only-C | ACT original | Solo imágenes | 7 dims, chunk 20 a 10 Hz | MIT | Hugging Face |
| tonyzhaozh/act (original) | ACT | Imágenes + estado | 14 dims, chunk 100 a 50 Hz | MIT | GitHub |
| Variantes del mismo proyecto (configs A/B, etc.) | ACT con adaptaciones | Según configuración | Según configuración | MIT | Repositorio del proyecto |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: solo funciona para la tarea y el objeto del dataset `ecse552-ocbench-block`; no generaliza a otras tareas sin reentrenamiento.
- Dependencia exclusiva de imágenes: al anular el estado del robot, la política puede ser más sensible a variaciones visuales (iluminación, oclusión, cámara) y a errores de percepción.
- Sin benchmarks publicados: no hay evidencia numérica de tasa de éxito ni de robustez, lo que impide comparar objetivamente con otras políticas.
- Riesgo de sobreajuste a las demostraciones: con `n<demos>` limitado y múltiples semillas, el rendimiento puede variar notablemente entre checkpoints; conviene evaluar `selected.ckpt` y no asumir que `policy_best.ckpt` es el mejor en test.
- Sin información sobre sesgos: no se documentan sesgos conocidos, pero al ser un modelo entrenado con datos limitados de un entorno concreto, puede heredar sesgos de las demostraciones.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; el uso en producción requeriría validación propia.
- Fecha de creación futura (2026-11-10) en los metadatos: conviene verificar la integridad y procedencia de los archivos antes de usarlos.
- Sin soporte de idiomas ni de texto: no debe emplearse como modelo de lenguaje ni para tareas de NLP.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Autobrik/ecse552-act-only-C
- Dataset: https://huggingface.co/datasets/Autobrik/ecse552-ocbench-block
- Repositorio ACT original: https://github.com/tonyzhaozh/act
- Código del proyecto: https://github.com/BrikHMP18/ecse-552-project
