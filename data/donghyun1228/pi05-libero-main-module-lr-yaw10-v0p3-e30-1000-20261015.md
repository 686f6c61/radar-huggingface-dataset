# Donghyun1228/pi05-libero-main-module-lr-yaw10-v0p3-e30-1000-20261015

# pi05 libero main module lr yaw10 v0p3 e30 (Donghyun1228)

## Resumen
Este repositorio contiene un checkpoint de un modelo de vision-lenguaje-accion (VLA) construido sobre la arquitectura pi05 (π₀.₅) y ajustado sobre tareas del benchmark LIBERO. Lo publica el usuario Donghyun1228 bajo la libreria openpi, y su proposito declarado es servir como candidato dentro de una busqueda de hiperparametros sobre la tasa de aprendizaje efectiva de distintos modulos del modelo. No es un modelo final ni una version validada en produccion, sino una instantanea intermedia de un proceso de exploracion.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigacion orientado a robotica (pipeline robotics) con 0 descargas y 0 likes en el momento de la consulta, y sin evaluacion de politicas completada. El propio autor indica explicitamente que "evaluation is pending; no success rate is claimed", de modo que no existen metricas de exito publicadas para esta variante concreta.

El modelo se apoya en un backbone tipo VLM con una cabeza de accion basada en flow-matching (segun las referencias encontradas sobre pi05), con el LLM congelado y solo los multiplicadores de actualizacion de ciertos modulos modificados. El tamano del repositorio es de 7,7 GB. No se dispone de datos publicos sobre numero de parametros, longitud de contexto ni idiomas soportados para este checkpoint especifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en pi05 (π₀.₅) con cabeza de accion de flow-matching; grafo nativo sin cambios (segun model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 7,7 GB; libreria openpi) |

## Arquitectura y entrenamiento
El checkpoint se describe como un candidato de "module LR" (learning rate por modulo) sobre la metodologia pi05. La model card indica que se mantienen los datos de contacto denso ("dense-contact data") y el pre-adapt original, con el grafo nativo, la inicializacion de origen y la normalizacion sin cambios. El unico factor alterado respecto a la configuracion base son los multiplicadores de actualizacion por modulo: multiplicador post-Adam de 0.3 para el modulo de vision, 30.0 para el experto y LLM congelado. La variante se etiqueta como "yaw10".

El entrenamiento se realizo durante 1000 actualizaciones (raw999), con tamano de lote (B32) y semilla 42, y usa la muneca ("wrist") de la fuente original en inferencia. El autor afirma que se trata de un checkpoint "raw" completado, con los pesos congelados verificados de forma independiente y reabiertos y hasheados contra la auditoria del estado de entrenamiento. No se especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO. La evaluacion esta pendiente y no se reclama ninguna tasa de exito.

## Capacidades
- Generacion de acciones roboticas: al ser un modelo VLA, su salida principal son comandos de accion para control de robot, no texto libre.
- Manipulacion guiada por instrucciones: integra vision y lenguaje para ejecutar tareas de manipulacion (el backbone pi05 es multimodal).
- Aprendizaje por imitacion / inverse dynamics: las etiquetas del repositorio incluyen "inverse-dynamics", lo que sugiere entrenamiento orientado a predecir acciones a partir de observaciones.
- Ejecucion de tareas del benchmark LIBERO: el ajuste se realiza sobre dicho conjunto de tareas de manipulacion de horizonte largo.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): vision como entrada en el marco VLA; el resto no disponible.

## Casos de uso
- Investigacion en robotica de manipulacion: usar el checkpoint como punto de partida para reproducir o comparar variantes de ajuste fino sobre LIBERO dentro del ecosistema openpi.
- Busqueda de hiperparametros de aprendizaje: sirve para estudiar el efecto de distintos multiplicadores de learning rate por modulo (vision vs. experto) manteniendo el LLM congelado.
- Evaluacion de estrategias de congelacion de pesos: al mantener el LLM congelado y verificar los pesos congelados de forma independiente, es util para analizar tecnicas de adaptacion eficiente en VLA.
- Reproduccion de experimentos con semilla fija: la configuracion (seed42, B32, 1000 updates) facilita la replicacion controlada de resultados en entornos de laboratorio.
- Benchmarking comparativo entre candidatos: el autor declara que el cribado ("screening") de exito puede seleccionar candidatos posteriores, por lo que este checkpoint encaja en flujos de seleccion automatizada de variantes.
- Docencia y prototipado academico: como ejemplo de pipeline de entrenamiento VLA sobre datos de contacto denso, puede usarse en cursos o proyectos de investigacion en aprendizaje robotico.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La propia model card afirma: "Evaluation is pending; no success rate is claimed", por lo que no existen tasas de exito ni metricas de LIBERO para este checkpoint.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El repositorio ocupa 7,7 GB, cifra que incluye el estado de entrenamiento, por lo que no equivale directamente al peso del modelo en inferencia.
- GPU recomendadas: no disponibles de forma especifica. Por el tipo de carga (VLA con backbone VLM y cabeza de accion), se requiere una GPU con soporte CUDA; una GPU de clase datacenter (A100, H100) es lo habitual para inferencia y evaluacion de modelos pi05.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible. Dependera del tamano real del backbone, que no se especifica.
- Opciones de despliegue: el repositorio usa la libreria openpi (ver ejemplos LIBERO en repos openpi05). No se mencionan soportes para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base / categoria | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw10-v0p3-e30 (este) | pi05 / LIBERO, variante yaw10 | no disponible | sin evaluacion (pendiente) | apache-2.0 | HuggingFace, 0 descargas |
| pi05-libero-main-module-lr-yaw30-v0p3-e3 (Donghyun1228) | pi05 / LIBERO, variante yaw30 | no disponible | sin evaluacion publicada | apache-2.0 | HuggingFace |
| pi05-libero-source-free-raw-common-vision-yaw30 (Donghyun1228) | pi05 / LIBERO, sin evaluacion de politica | no disponible | sin evaluacion de politica | apache-2.0 (presumible) | HuggingFace |
| pi05_libero_base (LeRobot) | pi05 base para LIBERO | no disponible | entrenado y evaluado en tareas LIBERO (segun ModelScope) | no disponible en la informacion | ModelScope |
| pi05_libero_finetuned (LeRobot) | pi05 ajustado en LIBERO | no disponible | evaluado en tareas LIBERO (segun ModelScope) | no disponible en la informacion | ModelScope |

## Limitaciones y advertencias
- Ausencia de evaluacion: no hay tasa de exito publicada; el propio autor declara que la evaluacion esta pendiente. No debe usarse como referencia de rendimiento.
- Artefacto de busqueda de hiperparametros: solo se modificaron multiplicadores de actualizacion por modulo, lo que limita su interpretacion como modelo independiente.
- Checkpoint "raw": segun las referencias, este tipo de checkpoint exporta el estado de entrenamiento y no es el checkpoint EMA, lo que puede afectar a la estabilidad de la politica.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no disponible para este tipo de modelo de accion; el riesgo relevante es de comportamiento fisico incorrecto, no de texto.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia apache-2.0, que permite uso comercial, pero el usuario debe verificar la licencia y condiciones de los modelos base pi05 y de los datos de entrenamiento subyacentes.
- Caveat para produccion: al no existir evaluacion ni verificacion de seguridad fisica, no es apto para despliegue en robots reales sin validacion adicional.
- Trazabilidad de la busqueda: el autor indica que el candidato pertenece a una busqueda de hiperparametros "explicitly authorized", dato contextual que no garantiza calidad del resultado.

## Enlaces
- HuggingFace (este modelo): https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw10-v0p3-e30-1000-20261015
- Variante relacionada yaw30: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw30-v0p3-e3-1000-20261015
- Variante source-free raw common vision yaw30: https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011
- Ejemplos LIBERO de openpi05 (GitHub): https://github.com/Integer003/openpi05/tree/main/examples/libero
- pi05_libero_base (ModelScope, LeRobot): https://www.modelscope.cn/models/lerobot/pi05_libero_base
- pi05_libero_finetuned (ModelScope, LeRobot): https://www.modelscope.cn/models/lerobot/pi05_libero_finetuned
