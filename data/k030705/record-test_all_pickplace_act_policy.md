# k030705/record-test_all_pickplace_act_policy

## Resumen

`k030705/record-test_all_pickplace_act_policy` es una política de imitación para robótica entrenada con el método **ACT (Action Chunking with Transformers)**, publicado en el paper arXiv 2304.13705. El modelo ha sido entrenado y publicado en Hugging Face mediante la librería **LeRobot** de Hugging Face, y está asociado al dataset de demostraciones teleoperadas `k030705/record-test_all_pickplace`. No es un modelo de lenguaje: es un modelo de control robótico que mapea observaciones (estado del robot e imágenes de dos cámaras) a acciones de un manipulador.

La política consume el estado articular de 6 dimensiones (`observation.state`) y dos flujos de imagen RGB de 480x640 procedentes de las cámaras `wrist` y `front`, y produce un vector de acción de 6 dimensiones. El objetivo declarado en la model card es la tarea "Tool" sobre un robot de tipo `so_follower` (el seguidor del brazo open source SO-100/SO-101 de LeRobot). El repositorio ocupa 0,2 GB y contiene 51.668.614 parámetros en formato safetensors.

Su relevancia es acotada: se trata de una política experimental de un usuario individual, sin resultados de evaluación publicados, sin licencia declarada y con cero descargas en el momento de la consulta. Es útil como ejemplo reproducible de entrenamiento ACT con LeRobot y como punto de partida para quien quiera replicar el pipeline, pero no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de chunks de acciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje; política de horizonte de acción por chunk) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo lingüístico; la tarea se especifica con la etiqueta `"Tool"`) |
| Licencia | no disponible (la model card indica `[More Information Needed]`) |
| Formato de pesos | safetensors |
| Libreria | lerobot 0.7.1 |
| Tipo de robot | `so_follower` |
| Camaras | `wrist`, `front` |
| Entrada estado | `observation.state`, shape `(6,)` |
| Entrada visual | `observation.images.wrist` y `observation.images.front`, shape `(3, 480, 640)` |
| Salida | `action`, shape `(6,)` |
| Dataset de entrenamiento | `k030705/record-test_all_pickplace` (103 episodios, 233.662 frames, 30 FPS) |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que, en lugar de predecir una acción por paso, predice un *chunk* de acciones futuras de forma conjunta. La arquitectura combina un codificador visual (para los dos flujos de cámara) con un transformer que procesa la secuencia de observaciones y un decodificador que emite el chunk de acciones. Esta formulación reduce el error de composición que aparece en políticas paso a paso y suele mejorar la tasa de éxito en tareas de manipulación. El modelo está implementado en LeRobot y exportado en safetensors con 51,7 M de parámetros, un tamaño coherente con una política ACT de resolución 480x640 con dos cámaras.

El entrenamiento se realizó sobre el dataset `k030705/record-test_all_pickplace`, compuesto por 103 episodios teleoperados y 233.662 frames a 30 FPS, todos asociados a la tarea "Tool". La configuración reportada es de 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, con LeRobot 0.7.1. No se documenta en la información disponible el número de tokens ni si hubo aumento de datos, regularización temporal o técnicas adicionales de estabilización; tampoco se indica si se aplicó algún tipo de RLHF o ajuste posterior, algo que, por otra parte, no es habitual en ACT.

## Capacidades

- Control robótico de manipulación por imitación: genera comandos de acción de 6 dimensiones a partir del estado articular y de dos vistas de cámara.
- Predicción de chunks de acciones, lo que permite ejecutar secuencias cortas de movimiento de forma coherente.
- Fusión multimodal visión + estado: integra dos cámaras RGB (muñeca y frontal) con la propriocepción del robot.
- Ejecución en tiempo real sobre el robot `so_follower` mediante el comando `lerobot-rollout` con `--strategy.type=base`.
- Tarea específica "Tool": la política está condicionada a esa etiqueta de tarea; no se documenta generalización a otras tareas.
- No soporta tool calling, function calling, razonamiento multi-paso simbólico, generación de texto, código, matemáticas, visión general, audio ni modo *thinking*: no es un modelo de lenguaje ni un VLM.

## Casos de uso

- Replicación del pipeline ACT con LeRobot: sirve como referencia reproducible para verificar que la instalación, la calibración del robot `so_follower` y las dos cámaras funcionan antes de entrenar políticas propias.
- Evaluación de infraestructura de inferencia robótica: permite probar `lerobot-rollout` con `--strategy.type=base`, medir latencia de inferencia y comprobar el emparejamiento de nombres de cámara con las claves de observación del modelo.
- Docencia y formación en aprendizaje por imitación: al estar entrenado sobre un dataset pequeño y público (103 episodios), es un caso de estudio manejable para explicar chunking de acciones, sobreajuste y evaluación en robot real.
- Punto de partida para *fine-tuning*: se puede reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio y comparar curvas de pérdida y comportamiento frente a esta política base.
- Pruebas de integración de hardware: útil para validar el cableado, el *framerate* de 30 FPS y la resolución 480x640 de las cámaras antes de invertir en un dataset mayor.
- Demostración de tareas de pick-and-place en entornos controlados: la tarea "Tool" sugiere manipulación de objetos tipo herramienta; puede emplearse en demostraciones de laboratorio con posiciones de objeto fijas, siempre que se valide empíricamente la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explícitamente la frase «No evaluation results have been provided for this policy yet», por lo que no existen tasas de éxito en robot real, ni comparaciones con otras políticas, ni métricas de pérdida reportadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 51,7 M de parámetros; en FP32 ocupa aproximadamente 0,2 GB de pesos, y en FP16 alrededor de 0,1 GB. A ello hay que sumar las activaciones de los dos codificadores visuales a 480x640, que dominan el consumo; una estimación conservadora sitúa el total por debajo de 2 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior permite inferencia en tiempo real. Para entrenamiento, una RTX 4090 o A100 acelera los 20.000 pasos, aunque el modelo es lo bastante pequeño para entrenar en GPUs de gama media.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM; también es viable en CPU para inferencia a baja frecuencia, aunque no se recomienda para control en tiempo real.
- Opciones de despliegue: `lerobot-rollout` (inferencia sobre robot) y `lerobot-train` (entrenamiento) son las vías oficiales documentadas. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia por chunk ni de frecuencia de control efectiva.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `k030705/record-test_all_pickplace_act_policy` | 51,7 M | ACT (LeRobot) | chunk de acciones, valor no disponible | no disponible | Hugging Face, 0 descargas |
| Políticas ACT de referencia en LeRobot (p. ej. `lerobot/act_*`) | del orden de decenas de millones | ACT (LeRobot) | chunk de acciones | normalmente Apache-2.0 | Hugging Face, mantenidas por Hugging Face |
| Políticas Diffusion Policy en LeRobot | del orden de decenas de millones | Diffusion Policy | horizonte de difusión | normalmente Apache-2.0 | Hugging Face |
| Políticas π0 / OpenVLA | miles de millones | VLA | contexto lingüístico + visión | variable según versión | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: este modelo no publica tasas de éxito, y las alternativas citadas sí suelen incluir evaluaciones en robot real. La diferencia principal frente a ACT de referencia es la licencia (aquí no declarada) y la ausencia de evaluación; frente a VLA como OpenVLA o π0, la diferencia es de escala (51,7 M frente a miles de millones de parámetros) y de alcance (tarea única frente a instrucciones en lenguaje natural).

## Limitaciones y advertencias

- Sin licencia declarada: la model card indica `[More Information Needed]`, por lo que no se puede asumir permiso de uso comercial. Es un bloqueo legal para producción.
- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito, robustez ni generalización; cualquier uso en robot real requiere validación propia.
- Tarea única y condicionada: entrenada exclusivamente para la tarea "Tool" sobre el dataset `record-test_all_pickplace`; no se documenta generalización a otras tareas u objetos.
- Dataset pequeño y de un solo operador: 103 episodios y 233.662 frames procedentes de teleoperación; es probable sobreajuste a posiciones de objeto, iluminación y configuración de cámara del entorno de grabación.
- Dependencia de hardware específico: requiere robot `so_follower` y dos cámaras con nombres `wrist` y `front` que coincidan exactamente con las claves de observación; cualquier cambio de resolución, montaje o calibración degrada el comportamiento.
- Riesgo de alucinación en sentido robótico: como toda política de imitación, puede generar acciones plausibles pero incorrectas ante estados fuera de distribución, sin señal de incertidumbre calibrada.
- Sesgos: no evaluados. Al provenir de un único operador y un único entorno, hereda sus sesgos de estilo de manipulación y de posicionamiento.
- Repositorio sin actividad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni mantenimiento documentado; la fecha de creación indicada (2026-11-27) debe tratarse con cautela.
- No apto para tareas lingüísticas: no genera texto, no soporta tool calling ni razonamiento simbólico; usarlo fuera del pipeline LeRobot no tiene sentido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k030705/record-test_all_pickplace_act_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/k030705/record-test_all_pickplace
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=k030705/record-test_all_pickplace
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
