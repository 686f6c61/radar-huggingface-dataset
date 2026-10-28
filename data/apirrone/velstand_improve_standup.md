# apirrone/velstand_improve_standup

## Resumen

`velstand_improve_standup` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics. No es un modelo de lenguaje: es una red neuronal que mapea una observación de 61 dimensiones (estado de sensores y articulaciones) a 14 acciones de control a 50 Hz, y se distribuye exportada a ONNX junto con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas del daemon de microduck. Su función concreta dentro del ecosistema es ocupar el slot `walk`: una marcha perpetua que se ejecuta hasta recibir orden de parada.

El autor (apirrone) la describe como una corrección del problema de levantarse ("get-up fix") centrada en dos fallos: la falta de holgura del pie en vuelo durante el ciclo de marcha (swing-foot clearance) y el bloqueo lateral ("no side freeze"). El identificador del checkpoint es `dk50vhok@5000`, correspondiente a la ejecución `pollen-robotics/mjlab_microduck/dk50vhok` en el paso 5000.

Su relevancia es de nicho pero práctica: se trata de un artefacto listo para desplegar en hardware real mediante un único comando (`sudo robotctl policy load walk apirrone/velstand_improve_standup`), con la normalización de observaciones ya embebida en el ONNX, de modo que el robot puede alimentar observaciones en crudo. El repositorio no incluye documentación adicional, licencia declarada ni métricas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política entrenada por refuerzo (RL), exportada a ONNX; topología interna (capas, activaciones) no disponible |
| Parametros totales | no disponible (tamaño del repositorio: 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política reactiva sin ventana de contexto; entrada de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Slot de política | `walk` |
| Comportamiento temporal | perpetuo (se ejecuta hasta recibir orden de parada) |
| Normalizador de observaciones | embebido en `policy.onnx` (admite observaciones en crudo) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red (número de capas, anchura, función de activación ni si emplea recurrencia). Lo que sí se documenta es el pipeline de entrenamiento: la tarea se identifica como `Mjlab-VelStand-Rough-Backlash-MicroDuck`, dentro del repositorio `pollen-robotics/microduck_rl`, rama `standup_foot_catch`, commit `12cfed24d`, y la ejecución de entrenamiento es `pollen-robotics/mjlab_microduck/dk50vhok` en el checkpoint 5000. El prefijo "Mjlab" y el nombre de la tarea apuntan a un entrenamiento en simulación física (familia MuJoCo/mjlab) con condiciones de terreno rugoso ("Rough") y presencia de holgura mecánica modelada ("Backlash"), aunque el contenido exacto del dominio de entrenamiento no se explicita.

El resultado se exporta a ONNX con el normalizador de observaciones fusionado en el propio grafo, lo que elimina la necesidad de replicar la media y desviación del entrenamiento en el lado del robot. No se documentan número de tokens (no aplica), composición de dataset, ni si hubo etapas de ajuste tipo RLHF/DPO (no aplicables a una política de control). Las innovaciones declaradas son de comportamiento, no de arquitectura: mejora de la holgura del pie en vuelo y eliminación del bloqueo lateral durante la secuencia de levantarse y caminar.

## Capacidades

- Control locomotor de tipo marcha perpetua para el microduck, ejecutada en el slot `walk` hasta recibir una orden de parada.
- Mapeo directo de observación cruda de 61 dimensiones a 14 acciones a 50 Hz, sin preprocesado externo gracias al normalizador embebido.
- Secuencia de incorporación ("stand up") corregida: mayor holgura del pie en vuelo y ausencia de congelación del movimiento lateral.
- Robustez declarada frente a terreno rugoso y holgura mecánica, según la configuración de la tarea de entrenamiento.
- Integración con el daemon de microduck mediante `robotctl` y el manifiesto de políticas en esquema 2.
- No soporta tool calling, function calling, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües: no es un modelo de propósito general.

## Casos de uso

- **Despliegue directo en robot físico**: cargar la política con `sudo robotctl policy load walk apirrone/velstand_improve_standup` para sustituir la marcha por defecto del microduck por una versión con mejor despeje del pie en vuelo, reduciendo enganchones en superficies irregulares.
- **Recuperación tras caída en demostraciones**: al corregir el bloqueo lateral durante la incorporación, la política es adecuada para secuencias de levantarse en vivo ante público, donde un fallo de lateralidad resulta muy visible.
- **Validación de pipeline de políticas en CI**: el formato ONNX con normalizador embebido y manifiesto en esquema 2 permite cargar la política en un runner automático y comprobar que la observación de 61-D produce acciones de 14-D coherentes antes de flashear el robot.
- **Investigación en simulación-a-realidad**: sirve como punto de partida reproducible (commit y checkpoint documentados) para comparar estrategias de robustez frente a backlash y terreno rugoso en la pila `microduck_rl`.
- **Docencia y talleres de RL aplicado a robótica**: el flujo completo —tarea en mjlab, repositorio de entrenamiento, checkpoint y despliegue con un comando— es un caso cerrado y de bajo coste computacional para explicar el ciclo entrenamiento-exportación-despliegue.
- **Pruebas de estrés de la mecánica del microduck**: al ser una marcha perpetua, permite dejar el robot caminando de forma continua para medir calentamiento de servos, desgaste y deriva de la holgura en sesiones largas.
- **Banco de pruebas de sustitución de slots**: útil para evaluar la interoperabilidad del daemon al intercambiar políticas en el slot `walk` sin reiniciar el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasa de éxito de incorporación, velocidad de marcha, consumo ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- **VRAM estimada**: no aplica en el sentido habitual; la política se ejecuta en el cómputo embebido del microduck a 50 Hz y el tamaño del modelo no se declara (repositorio de 0.0 GB, coherente con un ONNX de pocos cientos de kilobytes, aunque este dato no se confirma).
- **GPU recomendadas**: no se especifica ninguna; el entrenamiento referenciado se ejecutó en la infraestructura del proyecto `pollen-robotics/mjlab_microduck`, sin detalles de hardware publicados.
- **Compatibilidad con GPU de consumo**: no disponible. Para reentrenamiento, el simulador mjlab/MuJoCo puede ejecutarse en CPU, pero no hay datos publicados de requisitos ni de tiempos.
- **Opciones de despliegue**: daemon de microduck mediante `robotctl` (comando documentado) y ejecución del ONNX con un runtime ONNX estándar. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- **Latencia y throughput**: el bucle de control está fijado a 50 Hz (20 ms por paso); no se publican latencias medidas ni margen de cómputo disponible en el robot.

## Comparativa con modelos similares

No se dispone de información sobre otras políticas publicadas para el microduck con la que comparar parámetros, contexto, rendimiento o licencia. La model card no referencia alternativas ni establece líneas base.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `apirrone/velstand_improve_standup` | no disponible | no aplica | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) |
| Otras políticas del ecosistema microduck | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita, el uso comercial, la redistribución y la creación de obras derivadas quedan en una situación jurídica ambigua; conviene contactar con el autor antes de cualquier uso en producción.
- **Ausencia total de métricas**: no hay tasas de éxito, ni evaluaciones en hardware real, ni comparaciones con la política base; el reclamo de mejora ("swing-foot clearance + no side freeze") no está cuantificado.
- **Documentación mínima**: la model card se limita a cuatro secciones breves; no se describe la topología de red, el dominio de entrenamiento ni el procedimiento de evaluación.
- **Especificidad de hardware**: la política está entrenada para el microduck concreto (61-D de observación, 14 acciones); no es transferible a otra plataforma sin reentrenamiento.
- **Riesgo de fallo en el mundo real**: una política entrenada en simulación con terreno rugoso y backlash modelados puede presentar comportamientos no previstos ante condiciones no representadas (superficies deslizantes, cargas externas, desgaste real de servos).
- **Fecha de creación anómala**: el repositorio figura como creado el 2026-10-28; conviene verificar la procedencia y el estado del artefacto antes de desplegarlo.
- **Sin soporte de lenguaje**: no debe evaluarse con criterios de LLM (contexto, idiomas, alucinación); no procesa texto en ninguna forma.
- **Advertencia operativa**: la carga se realiza con `sudo` sobre el daemon del robot; un manifiesto o checkpoint incorrecto puede dejar el robot en un estado de marcha no deseado. Verificar en banco de pruebas antes de operar con el robot libre.

## Enlaces

- HuggingFace: https://huggingface.co/apirrone/velstand_improve_standup
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento (referenciado en la model card): `pollen-robotics/microduck_rl`, rama `standup_foot_catch`, commit `12cfed24d` (no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` dentro del repositorio del daemon (no se proporciona URL directa)
- Ejecución de entrenamiento: `pollen-robotics/mjlab_microduck/dk50vhok`, checkpoint 5000 (no se proporciona URL directa)
