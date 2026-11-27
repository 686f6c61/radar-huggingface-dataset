# briskVLA/shallow_8L_spread

## Resumen

briskVLA/shallow_8L_spread es un checkpoint de un modelo de visión-lenguaje-acción (VLA) para robótica, derivado por destilación de profundidad del modelo base lerobot/smolvla_libero. Lo desarrolla el autor briskVLA y se publica dentro del ecosistema LeRobot de Hugging Face. El modelo resuelve la tarea de generar acciones motrices a partir de observaciones visuales e instrucciones en lenguaje natural, en el contexto del benchmark LIBERO de manipulación robótica.

La propuesta técnica es un "action expert" de profundidad reducida: conserva 8 de las capas del experto original (índices [0, 1, 4, 5, 8, 9, 12, 13]) manteniendo el ancho de FFN por defecto (2048). El rol declarado es `shallow` y el layout canónico es `spread`. Con 400.923.616 parámetros totales y un repositorio de 0,8 GB en safetensors, es un modelo compacto pensado para iterar rápido en evaluación y despliegue robótico.

Su relevancia es experimental: sirve como punto de partida para seguir destilando o comprimiendo (por ejemplo, de 8L a 4L) y para medir el compromiso entre éxito en LIBERO y latencia de inferencia. No es un modelo de propósito general ni un LLM conversacional; es un componente de política robótica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (action expert de profundidad reducida, 8 capas) |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de lerobot/smolvla_libero (commit `a24f1f380461`) y aplica una reducción de profundidad sobre el experto de acciones: se conservan las capas [0, 1, 4, 5, 8, 9, 12, 13], es decir, 8 capas frente a la profundidad del profesor. El ancho de FFN se mantiene en el valor por defecto (2048). El layout canónico es `spread`, un criterio de organización de la selección de capas que el autor etiqueta explícitamente. El rol es `shallow`.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset más allá de LIBERO, ni si hubo RLHF o DPO. El flujo de trabajo documentado incluye scripts de evaluación en LIBERO con K=10 y K=1, medición de latencia, destilación adicional (`distill_student.py`) y construcción de estudiantes más pequeños (`build_student.py`, con opciones como `--group 2 --keep alternate --ffn fuse` para pasar de 8L a 4L). No se documentan innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones robóticas a partir de observaciones visuales e instrucciones en lenguaje natural, en tareas de manipulación del benchmark LIBERO.
- Evaluación con distintos horizontes de acción (K=10 y K=1) mediante el script `run_eval.sh`.
- Medición de latencia de inferencia con `latency.py`.
- Destilación adicional a estudiantes de menor profundidad (por ejemplo, 8L a 4L) con `distill_student.py` y `build_student.py`.
- Integración con el ecosistema LeRobot (`library_name: lerobot`) y el pipeline de robótica de Hugging Face.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Evaluación comparativa de profundidad en VLA: usar el checkpoint como referencia `shallow` frente al profesor `lerobot/smolvla_libero` para cuantificar la pérdida de éxito en LIBERO al recortar capas del experto de acciones.
- Estudio de latencia en robótica: ejecutar `latency.py` para medir el coste de inferencia del experto de 8 capas y compararlo con variantes más profundas o más someras.
- Punto de partida para destilación progresiva: emplear `distill_student.py` para generar un estudiante de 4L a partir de este checkpoint y analizar la curva éxito-latencia.
- Investigación en selección de capas: el layout `spread` permite estudiar si una selección distribuida de capas preserva mejor el rendimiento que una selección contigua.
- Prototipado de políticas de manipulación en simulación LIBERO: validar pipelines de evaluación con K=1 (un paso) y K=10 antes de escalar a modelos mayores.
- Reproducibilidad de experimentos de compresión: el repositorio documenta comandos concretos, lo que facilita replicar el proceso de reducción de profundidad y ancho de FFN.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 400,9 M de parámetros y pesos en safetensors (0,8 GB de repo), la inferencia en precisión nativa requiere del orden de 1,6 GB solo para pesos, más memoria para activaciones y observaciones visuales.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de parámetros es plausible en GPUs consumer con suficiente VRAM, pero no se documenta.
- Opciones de despliegue: LeRobot (librería declarada), con scripts propios de evaluación y latencia (`run_eval.sh`, `latency.py`). No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible; el autor proporciona un script para medirla, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/shallow_8L_spread | 400.923.616 | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| lerobot/smolvla_libero (profesor) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| Otras variantes briskVLA (p. ej. 4L) | no disponible | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint especializado en manipulación robótica LIBERO; no es un modelo de lenguaje general ni un chatbot.
- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor o consultar el modelo base.
- Sin idiomas declarados: no hay garantía de soporte multilingüe en las instrucciones.
- Sin datos de benchmarks publicados: el rendimiento real en LIBERO no está verificado en la información disponible.
- Riesgo de sobreajuste al benchmark LIBERO y al layout `spread` concreto; la transferencia a otros entornos robóticos no está documentada.
- La reducción de profundidad puede degradar la precisión de las acciones frente al profesor; no se cuantifica esa pérdida.
- Riesgo de alucinación en la interpretación de instrucciones no vista; no se documentan evaluaciones de robustez.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni señales de uso en producción.
- No se documentan requisitos de hardware ni cuantizaciones soportadas, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/shallow_8L_spread
- Modelo base: https://huggingface.co/lerobot/smolvla_libero
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales.
