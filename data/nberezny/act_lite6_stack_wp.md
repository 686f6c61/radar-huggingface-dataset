# nberezny/act_lite6_stack_wp

## Resumen

`nberezny/act_lite6_stack_wp` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada con la librería LeRobot de Hugging Face para el robot UFactory Lite 6 en un entorno de simulación (`ufactory_lite6_sim_hybrid_wp`). El modelo resuelve una tarea concreta de manipulación: apilar tres bloques en un orden específico ("stack the blocks: red at the bottom, yellow, blue on top"). No es un modelo de lenguaje general, sino un controlador visomotor que consume dos cámaras (overhead y wrist) más el estado del robot y emite comandos de acción de 11 dimensiones.

La arquitectura es un transformer ACT con 51.582.603 parámetros, que predice trozos de acción (*action chunks*) en lugar de pasos individuales, una técnica que mejora la estabilidad y la tasa de éxito en tareas de imitación. El entrenamiento se realizó sobre 800 episodios y 36.151 fotogramas grabados a 20 FPS, durante 100.000 pasos con batch size 8 y optimizador AdamW.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible y de bajo coste computacional (repo de 0,8 GB) que sirve como referencia para quien quiera entrenar o evaluar políticas ACT en LeRobot con el robot Lite 6, no como un modelo de propósito general. La model card no incluye resultados de evaluación ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer visomotor |
| Parametros totales | 51.582.603 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (no aplica; entrada visual y de estado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Entradas | `observation.images.overhead` (3, 240, 320), `observation.images.wrist` (3, 240, 320), `observation.state` (16,) |
| Salidas | `action` (11,) |
| Robot objetivo | `ufactory_lite6_sim_hybrid_wp` |
| Libreria | lerobot 0.7.0 |
| Tamano del repo | 0,8 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (procesa las dos cámaras a 240x320 píxeles), un codificador del estado del robot (vector de 16 dimensiones) y un decoder transformer que genera secuencias de acciones de longitud fija en lugar de un único paso. Esta predicción por *chunks* mitiga el problema de la varianza en el comportamiento y la acumulación de errores típica de los controladores paso a paso. La innovación principal del método, descrita en el paper arXiv:2304.13705, es precisamente esa decodificación por trozos junto con un mecanismo de *temporal ensembling* durante la inferencia.

El entrenamiento se realizó con LeRobot 0.7.0 sobre el dataset `nberezny/lite6_stack_wp`: 800 episodios de teleoperación, 36.151 fotogramas a 20 FPS, una única tarea de apilado de bloques. La configuración fue de 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. No se documenta el uso de RLHF, DPO ni datos adicionales; es aprendizaje supervisado puro a partir de demostraciones. El modelo opera en simulación, no en un robot físico, según el identificador del tipo de robot.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 11 dimensiones a partir de dos vistas de cámara y del estado del robot.
- Ejecución de una tarea específica de apilado de bloques en orden de colores (rojo abajo, amarillo, azul arriba).
- Predicción de trozos de acción (*action chunking*), que aporta estabilidad temporal en la ejecución.
- Fusión de información de cámara cenital (*overhead*) y de muñeca (*wrist*) para el control.
- Integración nativa con el ecosistema LeRobot: `lerobot-rollout` para inferencia y `lerobot-train` para reentrenamiento.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni capacidades multilingües. Es exclusivamente una política de control.

## Casos de uso

- Reproducción de experimentos ACT: sirve como referencia para validar una instalación de LeRobot 0.7.0 y comprobar el pipeline completo de inferencia con el robot Lite 6 simulado antes de entrenar políticas propias.
- Base para *fine-tuning* en tareas de apilado: al estar entrenado en una tarea de stacking, puede servir de inicialización para variantes con otros objetos o posiciones, reduciendo el número de episodios necesarios.
- Evaluación de infraestructura de simulación: útil para probar entornos `ufactory_lite6_sim_hybrid_wp` y verificar la configuración de cámaras (nombres e índices deben coincidir con las claves de observación).
- Docencia y formación en aprendizaje por imitación: ejemplo completo y de bajo coste (0,8 GB) para ilustrar el flujo teleoperación-dataset-entrenamiento-despliegue en robótica.
- Comparación de métodos de imitación: punto de partida para contrastar ACT con alternativas como Diffusion Policy o VQ-BeT dentro del mismo entorno y dataset.
- Pruebas de integración de hardware: sirve para validar la calibración del robot y de las dos cámaras antes de desplegar políticas más complejas, aunque el modelo está entrenado en simulación y su transferencia a hardware real no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 millones de parámetros, el modelo en safetensors ocupa del orden de 0,2 GB en precisión FP32, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior es más que adecuada. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas actuales, e incluso en CPU para inferencia a baja frecuencia (no documentado).
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot) con `--policy.path=nberezny/act_lite6_stack_wp`; el entrenamiento se realiza con `lerobot-train`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La captura de datos se realizó a 20 FPS, pero no se documenta la frecuencia de inferencia del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nberezny/act_lite6_stack_wp` | 51,6 M | Apilado de bloques con Lite 6 (sim) | no aplica | no disponible | Hugging Face |
| ACT (paper original, arXiv:2304.13705) | no disponible | Manipulación con chunking | no aplica | no disponible | Paper y código de referencia |
| Diffusion Policy | no disponible | Políticas de imitación por difusión | no aplica | no disponible | Repositorios públicos |
| VQ-BeT | no disponible | Políticas de imitación con cuantización | no aplica | no disponible | Repositorios públicos |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada; la comparación se limita a categoría de método y disponibilidad.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo ejecuta la tarea y el orden de apilado para el que fue entrenado; no generaliza a otras tareas sin reentrenamiento.
- Entrenado en simulación: el identificador del robot (`ufactory_lite6_sim_hybrid_wp`) sugiere un entorno simulado; no hay evidencia documentada de transferencia a un Lite 6 físico.
- Sin resultados de evaluación: no se reportan tasas de éxito, por lo que no es posible estimar su fiabilidad en producción.
- Licencia no declarada: la model card indica "[More Information Needed]" y la ficha de Hugging Face no especifica licencia; el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Dependencia de la configuración de cámaras: los nombres e índices de cámara deben coincidir exactamente con las claves de observación (`overhead`, `wrist`) y con la resolución 240x320 esperada.
- Riesgo de sobreajuste al dataset: con 800 episodios de una sola tarea, la política puede fallar ante cambios de iluminación, posiciones iniciales de los objetos o distracciones no presentes en los datos.
- Sin sesgos lingüísticos ni de alucinación en el sentido habitual: al no ser un modelo de lenguaje, los riesgos son de comportamiento físico (colisiones, agarres fallidos), no de contenido generado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_lite6_stack_wp
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/lite6_stack_wp
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/lite6_stack_wp
