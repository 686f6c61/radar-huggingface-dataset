# Donghyun1228/pi05-libero-main-module-lr-view-medium-v1-e0p03-1000-20261015

## Resumen

Este repositorio contiene un checkpoint de robótica de la familia `openpi`, publicado por el usuario Donghyun1228 bajo el identificador `Donghyun1228/pi05-libero-main-module-lr-view-medium-v1-e0p03-1000-20261015`. Se trata de una variante experimental de ajuste fino sobre la pila `pi05` (prefijo que remite a la familia pi0.5 de Physical Intelligence) orientada al benchmark LIBERO, con la etiqueta adicional `inverse-dynamics`. El repositorio ocupa 6,9 GB y la licencia declarada es Apache-2.0.

El modelo resuelve una tarea muy concreta dentro de un proceso de investigación: es un candidato de búsqueda de hiperparámetros. Según la model card, solo se modificaron los multiplicadores de actualización de un módulo ("module update multipliers"): el multiplicador *post-Adam* de la torre de visión se fijó en 1,0, el del *expert* en 0,03 y el LLM se mantuvo congelado (`LLM frozen`). El resto del grafo nativo, la inicialización de la fuente y la normalización se conservaron sin cambios.

El interés para un desarrollador o investigador es acotado y experimental: el propio autor indica que la evaluación está pendiente y que no se reclama ninguna tasa de éxito (*"Evaluation is pending; no success rate is claimed"*). Es, por tanto, un artefacto de investigación reproducible (1000 actualizaciones, batch 32, semilla 42) más que un modelo listo para producción. Además, la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo: los resultados obtenidos eran contenido no relacionado, por lo que no se ha podido ampliar la información más allá de la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (prefijo `pi05` y libreria `openpi`; la model card menciona tres modulos diferenciados: torre de vision, *expert* de acciones y LLM) |
| Parametros totales | no disponible (el repositorio ocupa 6,9 GB; el autor no publica el recuento) |
| Parametros activos | no aplica / no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card no lo especifica; las tareas de LIBERO se formulan con instrucciones en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repo de 6,9 GB; ecosistema `openpi`) |

Otros metadatos del repositorio: `pipeline: robotics`, `library_name: openpi`, `region: us`, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-10-14 y actualizado el 2026-10-14.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura completa. Por las etiquetas y el contenido de la model card se deduce que se trata de un modelo de robotica del ecosistema `openpi` con al menos tres componentes entrenables o parcialmente entrenables: una torre de vision (`vision`), un modulo `expert` (asociado a la generacion de acciones, dado el tag `inverse-dynamics`) y un backbone LLM que en este candidato permanece congelado. No se especifica si la generacion de acciones usa *flow matching*, difusion o decodificacion autorregresiva, ni el numero de parametros de cada modulo.

En cuanto al entrenamiento, la model card es infrecuentemente precisa y permite reproducir el experimento: 1000 actualizaciones sobre el conjunto "raw999", batch de tamano 32 y semilla 42. Los unicos hiperparametros modificados respecto a la configuracion base son los multiplicadores de actualizacion de modulo: multiplicador *post-Adam* de vision 1,0 y del *expert* 0,03 (es decir, una tasa de aprendizaje del experto fuertemente reducida). Se mantienen los datos densos de contacto existentes, el pre-adapt original, el grafo nativo sin cambios, y la inicializacion y normalizacion de la fuente. En inferencia se emplea la muneca (*wrist*) original de la fuente. El autor afirma que el checkpoint esta completo y que los pesos congelados han sido verificados de forma independiente.

La innovacion tecnica que documenta el autor no es arquitectonica sino metodologica: aislar el efecto de los multiplicadores de actualizacion por modulo durante un ajuste fino con el backbone LLM congelado, dentro de una busqueda de hiperparametros "explicitamente autorizada". El autor senala que la fase de cribado (*screening*) puede servir para seleccionar candidatos posteriores.

## Capacidades

- Control robotico por politicas de accion: el modelo pertenece al pipeline `robotics` y esta orientado a la ejecucion de tareas de manipulacion del benchmark LIBERO.
- Modelado de dinamica inversa: el tag `inverse-dynamics` sugiere que el modelo aprende a inferir acciones a partir de observaciones, util para *rollouts* sinteticos, filtrado de datos o *reward modeling*.
- Percepcion visual: la model card menciona explicitamente una torre de vision (`view_medium`) y el uso de la camara de muneca del robot en inferencia.
- Generacion de texto, razonamiento, codigo o matematicas: no disponible; no se documentan capacidades de proposito general mas alla del backbone LLM subyacente.
- Soporte de *tool calling* o *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo *thinking*, vision, audio): solo se documenta vision; no hay constancia de audio ni de modo de razonamiento explicito.
- Tasa de exito en tareas: no disponible; el autor indica explicitamente que la evaluacion esta pendiente.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el candidato documenta semilla, batch, numero de actualizaciones y multiplicadores, lo que permite replicar el entrenamiento y comprobar si la congelacion del LLM con un LR de 0,03 en el experto es estable.
- Cribado de hiperparametros por modulos: util como punto de comparacion frente a otros candidatos que varian el multiplicador de vision o del experto, para aislar la contribucion de cada modulo.
- Investigacion en dinamica inversa: entrenar o evaluar modelos que infieren acciones a partir de estados y observaciones, por ejemplo para anotar trayectorias de robot sin acciones explicitas.
- Benchmarking en LIBERO: base para medir tasas de exito en las suites de LIBERO una vez que el autor (o un tercero) complete la evaluacion pendiente.
- Estudio de congelacion de backbone en VLA: analizar cuanto rendimiento se conserva cuando el LLM permanece congelado y solo se adaptan vision y experto de acciones.
- Generacion de datos de manipulacion: uso del modelo como politica de referencia para producir *rollouts* que alimenten un pipeline posterior de aprendizaje por imitacion.
- Analisis de robustez ante datos densos de contacto: al conservar los datos densos de contacto y el pre-adapt original, sirve para estudiar el comportamiento en escenarios de contacto fisico estrecho.

Advertencia: ninguno de estos casos cuenta con validacion publicada por el autor; deben tratarse como lineas de trabajo, no como usos verificados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica literalmente que la evaluacion esta pendiente y que no se reclama ninguna tasa de exito (*"Evaluation is pending; no success rate is claimed"*). No se deben asumir cifras de LIBERO ni de ningun otro benchmark para este checkpoint.

| Benchmark | Resultado |
|---|---|
| LIBERO (u otros) | no disponible (evaluacion pendiente segun el autor) |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. Como referencia orientativa, un repositorio de 6,9 GB sugiere pesos en el orden de miles de millones de parametros en precision de 16-32 bits; en `bfloat16` los pesos ocuparian del orden de 3,5-7 GB, a lo que hay que sumar activaciones y buffers de vision.
- GPU recomendadas: no disponibles. Dado que es un modelo de robotica con torre de vision y politica de acciones, se espera necesidad de GPU de datacenter (A100, H100) o GPU de gama alta para entrenamiento; para inferencia, una GPU con suficiente memoria podria bastar.
- Compatibilidad con GPU de consumo: no confirmada. No se puede afirmar que quepa en una RTX 4090 o similar sin datos de parametros exactos y sin cuantizacion documentada.
- Opciones de despliegue: no disponibles en la model card. El ecosistema `openpi` es la libreria declarada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, y es poco probable que un modelo de politica robotica se sirva con esos *runtimes* de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones ni resultados frente a otras politicas. Se ofrece una comparativa estructural con familias del mismo ambito, marcando como "no disponible" todo aquello que no consta en la informacion consultada.

| Modelo | Ambito | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Este checkpoint (`pi05-libero-main-module-lr-view-medium-v1`) | VLA para LIBERO, busqueda de hiperparametros | no disponible | no disponible | apache-2.0 | Experimental, evaluacion pendiente |
| Familia pi0 / pi0.5 (Physical Intelligence, ecosistema `openpi`) | VLA de proposito general | no disponible en la informacion consultada | no disponible | no disponible en la informacion consultada | Publica |
| OpenVLA | VLA de proposito general | no disponible en la informacion consultada | no disponible en la informacion consultada | no disponible en la informacion consultada | Publica |
| Otros candidatos del mismo autor (`Donghyun1228`) | VLA para LIBERO | no disponible | no disponible | apache-2.0 | Varios checkpoints experimentales |

No se dispone de datos verificados de rendimiento para ninguno de los terminos de la comparacion en la informacion consultada, por lo que no es posible establecer una jerarquia de calidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor declara explicitamente que la evaluacion esta pendiente y que no se reclama tasa de exito. No debe presentarse como un modelo validado.
- Artefacto de investigacion: pertenece a una busqueda de hiperparametros autorizada y esta pensado para cribado, no para despliegue en produccion.
- Sin datos de sesgo: la model card no documenta analisis de sesgo alguno; no hay informacion sobre sesgos demograficos, de genero o culturales.
- Riesgo de alucinacion: no evaluado. En modelos de politica robotica el fallo tipico no es la alucinacion textual, sino la ejecucion de acciones incorrectas o inseguras; no hay datos al respecto.
- Idioma: no se documentan idiomas soportados; las instrucciones de LIBERO se formulan en ingles y no hay evidencia de soporte multilingue.
- Contexto: no se publica la longitud de contexto, lo que impide valorar tareas de horizonte largo.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el propio estado experimental del checkpoint desaconseja su uso productivo sin validacion adicional.
- Verificacion: el autor afirma que los pesos congelados fueron verificados de forma independiente, pero no se aporta el metodo ni el resultado de dicha verificacion.
- Integridad del repositorio: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso por terceros ni de replicacion.
- Resultados de busqueda no relevantes: la busqueda web asociada no devolvio ninguna fuente relacionada con el modelo; toda la informacion de esta ficha proviene de la model card y de los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donghyun1228/pi05-libero-main-module-lr-view-medium-v1-e0p03-1000-20261015
- Repositorio de la libreria `openpi` (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Benchmark LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO/lifelong-robot-learning/LIBERO
- Resultados de la busqueda web: no se encontro ningun enlace relevante; los resultados devueltos eran contenido no relacionado con el modelo.
