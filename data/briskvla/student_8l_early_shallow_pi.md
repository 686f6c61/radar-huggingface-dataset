# briskVLA/student_8L_early_shallow_pi

## Resumen

BriskVLA `student_8L_early_shallow_pi` es un checkpoint de política robótica de tipo Vision-Language-Action (VLA) obtenido por destilación y reducción de profundidad a partir de `lerobot/smolvla_libero`. Lo desarrolla el usuario `briskVLA` y se publica dentro del ecosistema LeRobot, con el objetivo de ofrecer una variante más ligera del experto de acciones de SmolVLA manteniendo el comportamiento sobre el benchmark LIBERO. Su rol declarado es `student`, es decir, un modelo destilado que aprende de un `teacher` congelado.

El modelo conserva la arquitectura SmolVLA pero reduce el experto de acciones a 8 capas (`8L`, índices `[0..7]`) con el layout canónico `early` y un ancho de FFN por defecto de 2048. Cuenta con 400.923.616 parámetros en formato safetensors y un repositorio de 0,8 GB, lo que lo sitúa en un rango manejable para experimentación en robótica de manipulación. Está pensado para evaluarse sobre LIBERO con protocolos de K=10 y K=1 pasos y para medir latencia de inferencia.

Su relevancia es acotada pero concreta: sirve como pieza base para pipelines de destilación progresiva (por ejemplo, de 8L a 4L) y para estudiar el compromiso entre profundidad del experto de acciones, latencia y tasa de éxito en tareas de manipulación. No es un modelo de propósito general ni un LLM conversacional; es un componente de control robótico entrenado para un benchmark específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (Vision-Language-Action) con experto de acciones reducido a 8 capas, layout `early`, FFN de ancho 2048 |
| Parametros totales | 400.923.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

El modelo es un checkpoint `student` destilado del `teacher` `lerobot/smolvla_libero` (revisión `a24f1f380461`). La modificación estructural principal es la reducción del experto de acciones a 8 capas, manteniendo el layout canónico `early` y el ancho de FFN por defecto de 2048. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; el contexto de entrenamiento es el benchmark LIBERO de manipulación robótica.

La model card documenta explícitamente el flujo de destilación y compresión posterior: es posible continuar el entrenamiento o destilar desde este checkpoint (`distill_student.py`) y reducir aún más la profundidad, por ejemplo de 8L a 4L, mediante agrupación de capas (`--group 2 --keep alternate`) y fusión de FFN (`--ffn fuse`). Esta cadena de herramientas sugiere un diseño orientado a la compresión iterativa de políticas VLA.

## Capacidades

- Control robótico de manipulación: genera acciones (política) a partir de observaciones visuales y de estado, orientado al benchmark LIBERO.
- Ejecución de políticas VLA dentro del ecosistema LeRobot, con integración nativa en sus scripts de evaluación.
- Evaluación con protocolos de múltiples pasos (K=10 y K=1) para medir tasa de éxito.
- Medición de latencia de inferencia mediante la utilidad `latency.py`.
- Destilación y compresión adicional: sirve como punto de partida para generar variantes de menor profundidad.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo ni modalidades de audio.

## Casos de uso

- Evaluación comparativa de políticas VLA en LIBERO: ejecutar el checkpoint con `run_eval.sh` en configuraciones K=10 y K=1 para obtener tasas de éxito y compararlas con el teacher y otras variantes.
- Estudio de latencia en robótica: usar `latency.py` para caracterizar el coste de inferencia de un experto de 8 capas frente al modelo completo, útil para decidir despliegues en tiempo real.
- Destilación progresiva: emplear `distill_student.py` para continuar el entrenamiento del student sobre nuevos datos o tareas, partiendo de un modelo ya comprimido.
- Compresión a 4L: aplicar `build_student.py` con `--group 2 --keep alternate --ffn fuse` para obtener una variante de 4 capas y medir la pérdida de rendimiento.
- Investigación en arquitecturas VLA: analizar el efecto del layout `early` y del ancho de FFN en el comportamiento del experto de acciones.
- Base para fine-tuning en tareas de manipulación específicas: al ser un checkpoint ligero (0,8 GB), es adecuado para iterar rápidamente en entornos con recursos limitados.
- Referencia en pipelines de CI para robótica: integrar la evaluación automatizada en LIBERO como test de regresión de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 400,9 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,8 GB en precisión de origen, por lo que la VRAM necesaria será moderada pero depende del runtime y de las observaciones de entrada.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: previsiblemente sí por tamaño de pesos, aunque no se confirma en la información disponible.
- Opciones de despliegue: scripts del ecosistema LeRobot (`run_eval.sh`, `latency.py`, `distill_student.py`, `build_student.py`) ejecutados con `uv`.
- Latencia y throughput: no disponibles; la model card incluye una utilidad específica para medirlos.

## Comparativa con modelos similares

| Modelo | Rol | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| briskVLA/student_8L_early_shallow_pi | Student destilado, 8L | 400.923.616 | no disponible | no disponible | Hugging Face (LeRobot) |
| lerobot/smolvla_libero | Teacher | no disponible | no disponible | no disponible | Hugging Face (LeRobot) |
| Variante 4L derivada (`build_student.py`) | Student comprimido | no disponible | no disponible | no disponible | Generable a partir de este checkpoint |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en el benchmark LIBERO; no es un modelo de propósito general ni un LLM conversacional.
- No se documentan sesgos conocidos, pero al ser una política entrenada en un entorno de simulación, puede no generalizar a entornos reales.
- Riesgo de alucinación no aplicable en el sentido habitual; el riesgo relevante es la ejecución de acciones incorrectas en manipulación.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas no disponibles: no se especifican capacidades lingüísticas.
- Sin resultados de benchmarks publicados: no es posible validar su rendimiento sin ejecutar la evaluación.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación limitado.
- La reducción de profundidad a 8 capas puede implicar pérdida de capacidad respecto al teacher; no se cuantifica en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/briskVLA/student_8L_early_shallow_pi
- Modelo base (teacher): https://huggingface.co/lerobot/smolvla_libero
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
