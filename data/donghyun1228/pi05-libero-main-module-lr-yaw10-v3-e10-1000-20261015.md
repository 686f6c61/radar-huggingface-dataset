# Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e10-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de ajuste fino del modelo π₀.₅ (Pi05), un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence y publicado a través del ecosistema openpi. El artefacto concreto lo publica el usuario Donghyun1228 y está especializado en tareas del benchmark LIBERO mediante un módulo de dinámica inversa (inverse dynamics model, IDM). No se trata de un modelo nuevo desde cero, sino de un candidato experimental dentro de una búsqueda de hiperparámetros autorizada.

El checkpoint corresponde a la variante "main-module LR" con configuración yaw10, donde solo se modifican los multiplicadores de tasa de aprendizaje tras el paso por Adam: 3.0 para la torre de visión y 10.0 para el módulo experto, manteniendo el LLM congelado. El entrenamiento se realizó durante 1000 actualizaciones (raw999) con batch de 32 y semilla 42, partiendo de la inicialización y normalización originales del modelo fuente y conservando el grafo nativo sin modificar.

Su relevancia es doble: por un lado documenta una línea de investigación reproducible sobre ajuste selectivo de módulos en VLA para robótica; por otro, su utilidad práctica está todavía por confirmar, ya que el propio autor indica que la evaluación está pendiente y no se reclama ninguna tasa de éxito. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05) con cabeza de acción por flow-matching y modulo de dinamica inversa (IDM); grafo nativo sin modificar |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla de precisiones en el entrenamiento: modulos entrenables en FP32 (vision23, LLM9, expert11) y modulos congelados en BF16 (native frozen8, source wrist23); cuantizaciones de inferencia no documentadas |
| Idiomas soportados | no disponible (modelo orientado a control robotico y vision, no a lenguaje general) |
| Licencia | apache-2.0 |
| Formato de pesos | Checkpoint nativo de openpi (raw checkpoint); no se indican pesos en safetensors ni GGUF. Tamano del repositorio: 7.7 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura π₀.₅ de Physical Intelligence, un modelo Vision-Language-Action que combina una torre de visión, un LLM y un modulo experto de accion, y que emplea una cabeza de accion basada en flow-matching. Sobre esa base, este checkpoint entrena un modulo de dinamica inversa (IDM) orientado a las tareas de LIBERO. La informacion disponible indica que el entrenamiento parte de la inicializacion y los activos de normalizacion originales, con el grafo nativo sin cambios y con datos de contacto denso preexistentes.

Los detalles de entrenamiento documentados son: 1000 actualizaciones (raw999), batch de 32, semilla 42 y configuracion yaw10. Lo unico que varia respecto a la referencia son los multiplicadores de tasa de aprendizaje aplicados tras Adam, fijados en 3.0 para vision y 10.0 para el experto, mientras que el LLM permanece congelado. En inferencia se utiliza la muñeca (wrist) del modelo fuente original. El resultado es un checkpoint en estado crudo (no EMA) con verificacion independiente de los pesos congelados. No se documentan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Control robotico mediante Vision-Language-Action: genera acciones a partir de observaciones visuales e instrucciones, siguiendo el paradigma de π₀.₅.
- Aprendizaje de dinamica inversa: el modulo IDM entrena la relacion entre estados y acciones, objeto central de este candidato.
- Ejecucion de tareas del benchmark LIBERO, un conjunto estandar de manipulacion robotica de horizonte largo.
- Ajuste selectivo de modulos: la configuracion demuestra que es posible modificar solo los multiplicadores de LR de vision y experto manteniendo el LLM congelado.
- Soporte de tool calling / function calling: no aplicable (no es un modelo de lenguaje conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales: candidato dentro de una busqueda de hiperparametros; pesos crudos con verificacion de congelacion; compatibilidad con la libreria openpi.

## Casos de uso

- Investigacion en ajuste fino de VLA: el checkpoint sirve como punto de partida o referencia para estudiar como afectan los multiplicadores de LR por modulo (vision, experto, LLM) al aprendizaje de politicas roboticas.
- Reproduccion de experimentos de busqueda de hiperparametros: dado que documenta configuracion, semilla, batch y numero de actualizaciones, permite reproducir la rama "main-module LR" sobre el modelo Pi05.
- Benchmarking sobre LIBERO: aunque la evaluacion esta pendiente, el checkpoint esta pensado para medir tasas de exito en tareas LIBERO una vez completada la evaluacion.
- Estudio de dinamica inversa en robotica: el modulo IDM permite analizar la relacion observacion-accion en tareas de contacto denso.
- Comparacion de estrategias de congelacion de pesos: al mantener el LLM congelado y verificar los pesos congelados, es util para analizar el impacto de no actualizar ciertos modulos.
- Base para candidatos posteriores: el propio autor indica que el exito en el cribado (screening) de este candidato puede seleccionar candidatos posteriores, por lo que actua como eslabon de una cadena experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion esta pendiente y que no se reclama ninguna tasa de exito (success rate). No se debe asumir ningun rendimiento sobre LIBERO ni sobre otras tareas.

## Requisitos de hardware

- Tamano del repositorio: 7.7 GB, lo que da una cota minima del espacio necesario para almacenar los pesos.
- VRAM estimada para inferencia: no disponible de forma oficial. A partir del tamano del repositorio (7.7 GB mezclando FP32 y BF16) puede requerirse en torno a 8-16 GB solo para los pesos, mas memoria adicional para activaciones y la cabeza de accion; esta cifra es una estimacion orientativa, no un dato publicado.
- GPU recomendadas: no disponible en la informacion proporcionada. Por el tipo de modelo (VLA) es razonable esperar GPUs de gama alta para entrenamiento (por ejemplo, A100 o H100), pero el autor no lo especifica.
- Compatibilidad con GPU de consumo: no confirmada; dependeria de la precision final de los pesos y del consumo de activaciones.
- Opciones de despliegue: la libreria declarada es openpi (no vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje). El repositorio openpi de Physical Intelligence incluye utilidades de ajuste fino e inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar de forma cuantitativa. A continuacion se comparan variantes del mismo linaje (todas de Donghyun1228 sobre π₀.₅ / LIBERO) con la informacion disponible:

| Modelo | Configuracion | Entrenamiento | Evaluacion | Licencia |
|---|---|---|---|---|
| pi05-libero-main-module-lr-yaw10-v3-e10-1000 (este) | yaw10, LR vision 3.0, experto 10.0, LLM congelado | 1000 updates, B32, seed42, raw; multis post-Adam modificados | Pendiente, sin tasa de exito | apache-2.0 |
| pi05-libero-all-module-relation-retention-yaw30-1000 | yaw30, retencion, lambda=1, vision23/LLM9/expert11 entrenables FP32 | 1000 updates, parametros raw no EMA | Sin evaluacion de politica | apache-2.0 |
| pi05-libero-source-free-raw-common-vision-yaw30-1000 | yaw30, actualizacion IDM solo sobre objetivo | 1000 updates IDM, raw (no EMA) | Sin evaluacion de politica | apache-2.0 |

Fuera de este linaje, la alternativa de referencia es π₀.₅ (Pi05) base, publicado por Physical Intelligence y distribuido tambien via LeRobot (pi05_libero_base). No se dispone de parametros, contexto ni rendimiento comparables en la informacion proporcionada para ninguno de ellos.

## Limitaciones y advertencias

- Checkpoint sin evaluar: el autor indica que la evaluacion esta pendiente y que no se reclama ninguna tasa de exito. No debe presentarse como modelo funcional validado.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la ficha, sin evidencia externa de uso o validacion por terceros.
- Artefacto experimental: pertenece a una busqueda de hiperparametros autorizada; su finalidad es servir de cribado, no de despliegue final.
- Especificidad: ajustado para LIBERO y para un modulo de dinamica inversa, con la muñeca del modelo fuente fijada en inferencia. No es un modelo de proposito general.
- Sesgos conocidos: no disponibles.
- Riesgo de alucinacion: no disponible en el sentido de lenguaje; el modelo esta orientado a control, por lo que el riesgo relevante es el fallo en la ejecucion de politicas, no la generacion de texto.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: apache-2.0 permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y atribucion. Conviene ademas respetar la licencia del modelo base π₀.₅ del que deriva.
- Caveat para produccion: al ser pesos crudos (raw, no EMA) y sin evaluacion, no es recomendable usarlo en produccion sin validacion propia.
- Verificacion de pesos: el autor afirma haber verificado de forma independiente la congelacion de los pesos, lo que refuerza la trazabilidad del experimento pero no su rendimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-yaw10-v3-e10-1000-20261015
- Variante relacionada (all-module relation retention): https://huggingface.co/Donghyun1228/pi05-libero-all-module-relation-retention-yaw30-1000-20261014
- Variante relacionada (source-free raw common vision): https://huggingface.co/Donghyun1228/pi05-libero-source-free-raw-common-vision-yaw30-1000-20261011
- Repositorio openpi de Physical Intelligence con ejemplos LIBERO: https://github.com/Physical-Intelligence/openpi/blob/main/examples/libero/README.md
- Repositorio openpi05 (fine-tuning e inferencia de pi05): https://github.com/Integer003/openpi05/tree/main/examples/libero
- π₀.₅ base en ModelScope (LeRobot, pi05_libero_base): https://www.modelscope.cn/models/lerobot/pi05_libero_base
