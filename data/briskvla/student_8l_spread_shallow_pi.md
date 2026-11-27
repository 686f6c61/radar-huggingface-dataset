# briskVLA/student_8L_spread_shallow_pi

## Resumen

BriskVLA/student_8L_spread_shallow_pi es un checkpoint de política robótica (VLA, vision-language-action) derivado por destilación de lerobot/smolvla_libero. Lo publica el colectivo briskVLA como parte de una familia de "estudiantes" con profundidad reducida del experto de acciones de SmolVLA, orientados a evaluación sobre el benchmark LIBERO. No es un modelo de lenguaje general, sino un policy model que mapea observaciones visuales y consignas de tarea a acciones motoras de un manipulador.

El modelo conserva únicamente 8 capas del experto de acciones original (índices [0, 1, 4, 5, 8, 9, 12, 13]) con el ancho FFN por defecto (2048), bajo un layout canónico etiquetado como "spread". El objetivo declarado es reducir coste computacional y latencia de inferencia manteniendo el rendimiento del profesor sobre LIBERO, lo que resulta relevante para despliegue en robótica real donde los ciclos de control exigen respuestas rápidas.

El checkpoint pesa 0,8 GB y contiene 400.923.616 parámetros en formato safetensors, distribuido a través de la librería LeRobot. Su interés actual reside en las técnicas de compresión de VLA (destilación, poda de capas, fusión de FFN) que permiten llevar modelos de acción a hardware más modesto, así como en servir de base para compresiones posteriores (por ejemplo, de 8L a 4L).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (VLA basada en transformer con experto de acciones reducido a 8 capas), librería LeRobot |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un "student" destilado del profesor lerobot/smolvla_libero (commit a24f1f380461). La arquitectura subyacente es SmolVLA, un modelo vision-language-action que combina un codificador visual, un codificador de lenguaje y un experto de acciones que genera comandos motores. En este checkpoint, el experto de acciones se ha reducido a 8 capas seleccionadas del profesor (índices 0, 1, 4, 5, 8, 9, 12 y 13), manteniendo el ancho FFN por defecto de 2048. El layout canónico es "spread", una de las variantes de disposición de capas que el proyecto briskVLA explora.

No se detalla en la información disponible el volumen de datos de destilación, la composición del dataset ni si hubo fases de RLHF o DPO. El entrenamiento se enmarca en el pipeline briskVLA, que incluye scripts para evaluar (run_eval.sh con K=10 y K=1), medir latencia (latency.py), continuar la destilación (distill_student.py) y comprimir aún más el modelo (build_student.py, con opciones como group 2, keep alternate y ffn fuse para pasar de 8L a 4L). La destilación se apoya en el benchmark LIBERO, un conjunto de tareas de manipulación robótica de referencia.

## Capacidades

- Generación de acciones motoras para manipulación robótica a partir de observaciones visuales y consignas de tarea (pipeline robotics).
- Ejecución de tareas del benchmark LIBERO, con evaluación a K=10 y K=1 (múltiples muestras o una sola).
- Control de un manipulador en entornos simulados de LIBERO.
- Destilación adicional: puede usarse como fuente para generar estudiantes más pequeños (por ejemplo, 4L).
- Medición de latencia mediante el script incluido en el proyecto briskVLA.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modos de razonamiento extendido; se trata de un modelo específico de robótica, no de un LLM general.

## Casos de uso

- Evaluación de políticas VLA comprimidas: usar el checkpoint como estudiante de referencia para comparar rendimiento frente al profesor smolvla_libero en las tareas de LIBERO, con K=10 y K=1, empleando run_eval.sh.
- Despliegue en hardware de control con latencia ajustada: al reducir el experto de acciones a 8 capas, el modelo disminuye el coste de cómputo por paso de control, lo que lo hace adecuado para bucles de inferencia en tiempo real en simuladores o robots de laboratorio.
- Destilación en cascada: emplear el checkpoint como punto de partida para generar estudiantes de 4 capas mediante build_student.py (group 2, keep alternate, ffn fuse), explorando la frontera entre compresión y rendimiento.
- Investigación en compresión de VLA: servir de base para estudiar el efecto de la poda de capas y del layout "spread" frente a otras disposiciones sobre la tasa de éxito en LIBERO.
- Benchmarking de latencia: usar latency.py para medir el tiempo de inferencia por paso y compararlo con el profesor y con otras variantes de la familia briskVLA.
- Reproducibilidad de experimentos: al estar integrado en LeRobot y con scripts de evaluación y destilación publicados, permite reproducir y auditar resultados de compresión en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 400,9 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,8 GB en precisión de 16 bits; el consumo real depende del codificador visual, del codificador de lenguaje y de los buffers de inferencia, no detallados.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: librería LeRobot (lerobot); scripts del proyecto briskVLA (run_eval.sh, latency.py, distill_student.py, build_student.py). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el proyecto incluye una herramienta para medirlos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/student_8L_spread_shallow_pi | 400.923.616 | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| lerobot/smolvla_libero (profesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| Otras variantes briskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento ni de especificaciones completas del profesor o de las demás variantes en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Modelo especializado en robótica (LIBERO); no es un LLM de propósito general y no debe emplearse para tareas de texto, código o razonamiento lingüístico.
- Al ser un estudiante de 8 capas destilado, puede presentar una tasa de éxito inferior al profesor smolvla_libero; no se publican métricas que lo confirmen o cuantifiquen.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no disponibles: no se documenta el soporte multilingüe de las consignas de tarea.
- Sin datos de sesgos, alucinación o robustez fuera de la distribución de LIBERO; el comportamiento en entornos reales no está validado en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- La fecha de creación indicada (2026-11-27) es futura respecto a la redacción habitual de fichas; verificar la vigencia del checkpoint antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/student_8L_spread_shallow_pi
- Modelo base (profesor): https://huggingface.co/lerobot/smolvla_libero
- Librería LeRobot: https://github.com/huggingface/lerobot
- Benchmark LIBERO: no disponible en la información proporcionada
- Paper de SmolVLA: no disponible en la información proporcionada
- Repositorio del proyecto briskVLA: no disponible en la información proporcionada
