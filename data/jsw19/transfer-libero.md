# jsw19/transfer-libero

## Resumen

El repositorio `jsw19/transfer-libero` contiene checkpoints del modelo pi0.5 RoboTwin, específicamente los parámetros finales de dos conjuntos de entrenamiento: transferencia de conocimiento entre tareas y una variante con el VLM congelado (freeze-VLM). El autor, jsw19, ha publicado estos pesos bajo licencia Apache-2.0 con el objetivo de facilitar la reproducibilidad de experimentos de transferencia en manipulación robótica, aparentemente vinculados al benchmark LIBERO, que estudia la transferencia de conocimiento en aprendizaje multitarea y lifelong para robots.

El repositorio incluye 146 directorios de checkpoints de transferencia (que representan 143 pares únicos fuente-objetivo, con tres variantes duplicadas) y 24 checkpoints de la línea freeze-VLM. Los activos se organizan por tarea objetivo bajo `assets/`, y los manifiestos en `manifests/` documentan las rutas originales. Con un tamaño total de 1087.3 GB, es un repositorio de gran volumen destinado a investigadores que necesitan pesos preentrenados para evaluar transferencia entre tareas de manipulación.

La relevancia actual radica en que pi0.5 es una arquitectura de política visomotora que combina un VLM preentrenado con acciones de control fino, y este repositorio ofrece una colección de checkpoints que permiten estudiar cómo se transfiere el conocimiento entre tareas y qué efecto tiene congelar el VLM durante el entrenamiento. Sin embargo, la información pública es limitada: no se proporcionan especificaciones de arquitectura, parámetros ni benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 RoboTwin (VLM con acciones de control; detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de pi0.5 RoboTwin. Por el nombre y el contexto del benchmark LIBERO, se infiere que se trata de una política visomotora basada en un modelo de lenguaje y visión (VLM) que procesa observaciones de cámara e instrucciones en lenguaje natural para generar acciones de control del robot. El repositorio distingue dos variantes de entrenamiento: una con transferencia completa entre pares de tareas (146 checkpoints) y otra con el VLM congelado (24 checkpoints), lo que sugiere un estudio sobre el impacto de la congelación del backbone lingüístico-visual en la transferencia de habilidades.

No se especifican los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El manifiesto `transfer_144.tsv` (histórico) y `transfer_146.tsv` (actual) documentan las rutas originales de los checkpoints, lo que indica que el entrenamiento se realizó en un clúster con rutas bajo `/share/project/xsw/openpi/checkpoints`. La fecha de creación (junio 2026) y la actualización (agosto 2026) sugieren un proyecto de investigación activo.

## Capacidades

- Manipulación robótica: los checkpoints están entrenados para tareas de manipulación física, presumiblemente con un brazo robotico, siguiendo el benchmark LIBERO.
- Transferencia de conocimiento entre tareas: los checkpoints de transferencia permiten evaluar cómo una política entrenada en una tarea fuente se adapta a una tarea objetivo.
- Congelación de VLM: los checkpoints freeze-VLM permiten estudiar el efecto de mantener fijo el backbone de lenguaje-visión durante el entrenamiento de la política.
- Integración con RoboTwin: el nombre sugiere compatibilidad con el framework RoboTwin, aunque no se documenta en el repositorio.
- No se reportan capacidades de generación de texto, tool calling, agentes, ni multilingüismo; el modelo está orientado a control robótico, no a diálogo.

## Casos de uso

- Investigacion en transferencia de aprendizaje robotico: los 146 checkpoints de transferencia permiten reproducir experimentos de transferencia entre pares de tareas LIBERO, comparando el rendimiento de la política en la tarea objetivo tras el fine-tuning desde la fuente.
- Estudio del efecto de congelar el VLM: los 24 checkpoints freeze-VLM sirven como línea base para medir si actualizar el backbone mejora o degrada la transferencia, un factor crítico en entornos con recursos limitados.
- Evaluacion de generalizacion a nuevas tareas: un investigador puede cargar un checkpoint de transferencia y probarlo en una tarea no vista para medir la capacidad de generalizacion zero-shot o few-shot.
- Desarrollo de politicas de manipulacion de largo horizonte: los checkpoints pueden integrarse en pipelines de entrenamiento para tareas que requieren planificacion multi-paso, como las del benchmark LIBERO.
- Comparacion de estrategias de inicializacion: los pesos permiten comparar el rendimiento de una politica inicializada desde cero frente a una inicializada con transferencia, cuantificando la ganancia en muestras de entrenamiento.
- Reproducibilidad de experimentos publicados: al ser un repositorio publico con manifiestos, otros grupos pueden replicar exactamente los mismos checkpoints y resultados sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, tasas de éxito en tareas LIBERO ni comparaciones con otros modelos. Se desconoce si los checkpoints alcanzan los resultados reportados en el paper original de pi0.5 o RoboTwin.

## Requisitos de hardware

- Tamano del repositorio: 1087.3 GB, lo que implica que la descarga completa requiere un disco de al menos 1.1 TB libres.
- VRAM estimada: no disponible. Dado que pi0.5 es un modelo visomotor con un VLM, se espera que necesite al menos 24-48 GB de VRAM en FP16 para inferencia, pero sin datos oficiales no se puede confirmar.
- GPU recomendadas: no disponible. Probablemente se requieran GPUs de datacenter (A100, H100) para cargar los checkpoints completos, o cuantizacion para GPUs de consumo (RTX 4090).
- Opciones de despliegue: no se documentan frameworks soportados (vLLM, llama.cpp, etc.). Dado que es un modelo de robotica, probablemente se use con el framework RoboTwin o OpenPI, pero no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en el mismo repositorio ni en la busqueda web. El benchmark LIBERO se usa con multiples politicas (p. ej., BC-Transformer, RoboFlamingo, OpenVLA), pero no hay datos de rendimiento de este modelo especifico frente a ellos. Se indica "no disponible" por falta de datos publicados.

## Limitaciones y advertencias

- Informacion tecnica incompleta: la model card no especifica arquitectura, parametros, contexto ni idiomas; cualquier uso en produccion requiere consultar la documentacion de pi0.5 y RoboTwin por separado.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas LIBERO; los usuarios deben evaluar los checkpoints por su cuenta antes de confiar en ellos.
- Volumen de datos enorme: 1087.3 GB de checkpoints hacen que la descarga y el almacenamiento sean costosos; no es adecuado para entornos con ancho de banda o disco limitados.
- Riesgo de sesgos y alucinaciones: al ser un modelo de robotica, no se aplican los mismos riesgos que en modelos de texto, pero la politica puede fallar en entornos no vistos; no hay evaluacion de robustez publicada.
- Licencia Apache-2.0: permite uso comercial, pero hay que verificar que los pesos de pi0.5 base (si se derivan de un modelo preentrenado) no tengan restricciones adicionales; el autor no lo aclara.
- Fechas futuras: el repositorio fue creado en junio de 2026 y actualizado en agosto de 2026, lo que sugiere que es un proyecto reciente y posiblemente en evolucion; los manifiestos pueden cambiar.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jsw19/transfer-libero
- Arbol de archivos: https://huggingface.co/jsw19/transfer-libero/tree/main
- Benchmark LIBERO (GitHub): https://github.com/Lifelong-Robot-Learning/LIBERO
- Benchmark LIBERO (variante zhanglei-web): https://github.com/zhanglei-web/LIBERO-
- Proyecto LIBERO (web): https://libero-project.github.io/research
