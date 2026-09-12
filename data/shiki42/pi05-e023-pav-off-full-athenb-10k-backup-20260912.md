# Shiki42/pi05-e023-pav-off-full-athenb-10k-backup-20260912

## Resumen

Este repositorio contiene un checkpoint de inferencia de política robótica basado en PI0.5 (familia openpi), publicado por el usuario Shiki42. Se trata de un ajuste fino completo desde PI0.5 Base con dos expertos de acción forzados a abrirse (PAV off), entrenado sobre el conjunto de datos `robotwin_putcab_fixed_leftDrawer_rightObject_AthenB_50` para una tarea de manipulación concreta de RobotWin. El artefacto corresponde al microstep 40000, equivalente a 10000 actualizaciones del optimizador con cuatro microsteps acumulados por actualización.

Su relevancia es acotada y de carácter histórico: E023 no completó las 30000 actualizaciones originalmente planificadas, y este backup se publica de forma separada del posterior experimento comparativo Train50 de un solo experto. No es un checkpoint reanudable de entrenamiento, ya que el estado del optimizador fue eliminado a petición del usuario; solo se conservan los parámetros de inferencia, los activos de normalización del dataset, los metadatos originales del checkpoint y la configuración resuelta.

El repositorio ocupa 14,0 GB y declara compatibilidad con un commit concreto del código fuente de OpenPI (`50c7234cf18e90c069660d40c5ec3e3da21689c0`) y con el runtime ParallelVLA2026-08-22.2. Antes de su publicación se verificó una recarga completa de parámetros en CPU y una comprobación de valores finitos, pero no se ejecutó ninguna actualización del optimizador ni una nueva evaluación de la política. La información pública disponible (descargas: 0, likes: 0, licencia e idiomas no declarados) es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 con dos expertos de accion forzados a abrirse (dual-expert, PAV off), ajuste fino completo desde PI0.5 Base |
| Parametros totales | no disponible |
| Parametros activos | no aplicable: no es un modelo MoE; la arquitectura declara dos expertos de accion (PAV off) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene parametros de inferencia, activos de normalizacion del dataset, metadatos del checkpoint original y la configuracion resuelta; el formato concreto de serializacion no se especifica) |
| Libreria | openpi |
| Tamano del repositorio | 14,0 GB |
| Tarea | robotics (inferencia de politica) |
| Actualizaciones del optimizador | 10000 (microstep 40000, 4 microsteps acumulados por actualizacion) |
| Dataset de entrenamiento | Shiki42/robotwin_putcab_fixed_leftDrawer_rightObject_AthenB_50, revision 793556b0d670af13653dcb6a4ba99864fd985c59 |
| Batch efectivo | 16 |
| EMA | 0,99 |
| Semilla | 87431 |
| Commit compatible de OpenPI | 50c7234cf18e90c069660d40c5ec3e3da21689c0 |
| Runtime | ParallelVLA2026-08-22.2 |

## Arquitectura y entrenamiento

La arquitectura se describe como PI0.5 con dos expertos de accion forzados a abrirse y PAV desactivado, partiendo de un ajuste fino completo desde PI0.5 Base. La model card no detalla el numero de parametros, la disposicion interna de las cabezas de accion, el mecanismo de atencion ni la composicion exacta del dataset de entrenamiento (numero de episodios, tokens o modalidades), por lo que esos datos deben considerarse no disponibles. Se trata de un modelo de vision-lenguaje-accion orientado a inferencia de politica, no de un modelo de lenguaje de proposito general.

El entrenamiento se realizo sobre el dataset `robotwin_putcab_fixed_leftDrawer_rightObject_AthenB_50` en una revision fijada, con batch efectivo 16, EMA de 0,99 y semilla 87431. La model card indica que E023 no alcanzo las 30000 actualizaciones planificadas y que la configuracion historica incluida en `resolved-config.json` refleja el presupuesto previsto, no el numero real de actualizaciones de este checkpoint. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. Tampoco se declaran innovaciones adicionales mas alla de la configuracion de doble experto con PAV off.

Un aspecto operativo relevante es que el estado del optimizador se elimino para liberar espacio en disco y que el estado del cargador de datos no esta incluido. Por tanto, este artefacto sirve exclusivamente para restauracion de inferencia (componente de parametros), no para reanudar un entrenamiento ni para una restauracion compuesta de estado de entrenamiento.

## Capacidades

- Generacion de acciones de politica para una tarea robotica concreta de manipulacion (entorno RobotWin, tarea `putcab` con cajon izquierdo y objeto derecho).
- Inferencia de vision-lenguaje-accion: el modelo consume observaciones e instrucciones y produce acciones, segun el modo de uso estandar de la familia PI0.5.
- Configuracion de doble experto de accion con PAV desactivado, lo que puede habilitar comparaciones controladas frente a configuraciones de experto unico.
- Carga de parametros y comprobacion de valores finitos en CPU verificada antes de la publicacion.
- Restauracion de inferencia con activos de normalizacion incluidos en el repositorio, lo que permite reproducir el preprocesado esperado por el checkpoint.
- Compatibilidad declarada con un commit concreto de OpenPI y con el runtime ParallelVLA2026-08-22.2.

No se documentan en la informacion disponible capacidades de tool calling, function calling, razonamiento multi-paso de tipo agente, soporte multilingue, modo de razonamiento explicito, vision general, audio ni otras capacidades especiales distintas de la inferencia de politica robotica.

## Casos de uso

- Reproduccion de experimentos historicos: cargar los parametros de inferencia con el commit compatible de OpenPI (`50c7234cf18e90c069660d40c5ec3e3da21689c0`) y el runtime ParallelVLA2026-08-22.2 para recrear el estado exacto de E023 en el microstep 40000, dado que se conservan metadatos, configuracion resuelta y activos de normalizacion.
- Comparacion de configuraciones de experto: al tratarse de un checkpoint dual-expert con PAV off, permite contrastar su comportamiento frente al posterior Train50 de experto unico mencionado en la model card, aislando el efecto de la configuracion de expertos.
- Punto de partida para ajuste fino adicional: los parametros de inferencia pueden servir como inicializacion para nuevos entrenamientos sobre tareas RobotWin relacionadas, teniendo en cuenta que no existe estado de optimizador ni del cargador de datos.
- Evaluacion de politicas en simulacion RobotWin: la tarea `putcab_fixed_leftDrawer_rightObject` sugiere un escenario de apertura y colocacion en cajon izquierdo con objeto en el lado derecho, apto para medir tasas de exito de la politica en ese entorno simulado.
- Auditoria de artefactos de investigacion: el repositorio incluye metadatos originales y configuracion historica, lo que lo hace util para verificar trazabilidad de experimentos mediante `SHA256SUMS` y revisiones fijadas.
- Verificacion de integridad de pesos: la carga completa en CPU con comprobacion de valores finitos puede integrarse en canalizaciones de validacion previas al despliegue de politicas roboticas.
- Referencia para destilacion o compresion de politicas: al ser un checkpoint de 14,0 GB con ajuste fino completo, puede emplearse como profesor en procesos de destilacion hacia variantes mas ligeras, siempre que la licencia lo permita, extremo que no esta declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint. La model card indica explicitamente que antes de la publicacion solo se realizo una recarga de parametros en CPU y una comprobacion de valores finitos, sin nuevas evaluaciones de politica.

Como referencia contextual, la model card menciona resultados reportados para E024 en tres condiciones: FixedRole100 49/100, BHalf100 30/100 y Fixed100 25/100, y senala que dichos resultados siguen pendientes de auditoria. Estos valores corresponden a E024, no a este checkpoint, y no deben atribuirse a E023.

| Modelo | FixedRole100 | BHalf100 | Fixed100 | Estado |
|---|---|---|---|---|
| E023 (este checkpoint) | no disponible | no disponible | no disponible | sin evaluacion de politica publicada |
| E024 (referencia en la model card) | 49/100 | 30/100 | 25/100 | pendiente de auditoria |

## Requisitos de hardware

- El repositorio ocupa 14,0 GB, lo que constituye el requisito minimo de almacenamiento para descargar los parametros y los activos de normalizacion; se recomienda espacio adicional para revisiones fijadas y verificacion de `SHA256SUMS`.
- VRAM para inferencia: no disponible de forma declarada. Como estimacion derivada del tamano del repositorio (14,0 GB), la carga de parametros en memoria requeriria del orden de 14 GB o mas, mas el espacio para activaciones y buffers del runtime; se trata de una estimacion, no de un dato publicado.
- GPU recomendadas: no disponibles. No se especifica ninguna GPU objetivo en la model card.
- Compatibilidad con GPU de consumo: no disponible. No se puede confirmar si cabe en tarjetas de gama de consumo sin una cuantizacion que el repositorio no documenta.
- Carga en CPU: verificada. La model card confirma que una recarga completa de parametros en CPU y una comprobacion de valores finitos se superaron antes de la publicacion, lo que habilita validacion en CPU aunque no se documenta rendimiento de inferencia en ese modo.
- Opciones de despliegue: la unica ruta documentada es la libreria openpi con el commit compatible `50c7234cf18e90c069660d40c5ec3e3da21689c0` y el runtime ParallelVLA2026-08-22.2. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles. No se publican mediciones de latencia, frecuencia de control ni tasa de exito de inferencia.

## Comparativa con modelos similares

La informacion disponible no incluye especificaciones tecnicas de los modelos comparables, por lo que las celdas cuantitativas quedan como no disponibles.

| Modelo | Relacion | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| E023 (este checkpoint) | objeto de la ficha; dual-expert, PAV off, 10000 actualizaciones | no disponible | no disponible | no disponible | no disponible | repositorio HuggingFace publico, 14,0 GB |
| PI0.5 Base | modelo de partida declarado en la model card | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| E024 | experimento de la misma linea, citado en la model card | no disponible | no disponible | 49/100, 30/100 y 25/100 en FixedRole100, BHalf100 y Fixed100 (auditoria pendiente) | no disponible | no disponible en la informacion proporcionada |
| Train50 single-expert | comparacion posterior mencionada en la model card | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos sobre OpenVLA, Octo, RDT ni otras politicas roboticas comparables dentro de la informacion suministrada.

## Limitaciones y advertencias

- No es un checkpoint reanudable: el estado del optimizador fue eliminado y el estado del cargador de datos no esta incluido. No debe intentarse una restauracion compuesta de estado de entrenamiento.
- Entrenamiento incompleto: E023 no alcanzo las 30000 actualizaciones planificadas; este artefacto refleja 10000 actualizaciones del optimizador (microstep 40000). La configuracion historica de `resolved-config.json` puede inducir a error sobre el presupuesto realmente ejecutado.
- Ausencia de evaluacion de politica: no se ejecuto ninguna evaluacion nueva para este backup, por lo que no hay evidencia publicada de tasa de exito o robustez en la tarea objetivo.
- Licencia no declarada: al no especificarse licencia, el uso comercial, la redistribucion y la creacion de obras derivadas quedan en un limbo juridico que debe aclararse con el autor antes de cualquier uso en produccion.
- Idiomas no declarados: no se documenta soporte linguistico de las instrucciones, lo que impide afirmar capacidades multilingues.
- Sesgos y alucinacion: no hay informacion disponible sobre sesgos del dataset ni sobre comportamientos de alucinacion. En politicas roboticas, el riesgo equivalente se traduce en acciones fisicamente invalidas o inseguras, y no se han publicado analisis al respecto.
- Dependencia estricta de versiones: la model card exige un commit concreto de OpenPI y un runtime especifico; usar otras versiones puede invalidar la carga de parametros o el significado de los activos de normalizacion.
- Metadatos potencialmente inconsistentes: la propia model card advierte que los metadatos originales pueden referirse a componentes del antiguo checkpoint completo, lo que exige verificar `SHA256SUMS` y fijar una revision publicada concreta.
- Trazabilidad limitada: con 0 descargas y 0 likes, el artefacto carece de validacion por parte de terceros.
- Los resultados de E024 citados en la model card estan pendientes de auditoria y no deben extrapolarse a este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Shiki42/pi05-e023-pav-off-full-athenb-10k-backup-20260912
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/robotwin_putcab_fixed_leftDrawer_rightObject_AthenB_50
- Revision del dataset: 793556b0d670af13653dcb6a4ba99864fd985c59
- Commit compatible de OpenPI: 50c7234cf18e90c069660d40c5ec3e3da21689c0
- Nota: las busquedas web realizadas no devolvieron resultados relevantes sobre este modelo; unicamente aparecieron paginas de soporte de Microsoft ajenas al contenido. No se dispone de papers, blogs, repositorios adicionales ni demos verificables en la informacion proporcionada.
