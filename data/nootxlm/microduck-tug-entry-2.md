# nootxlm/microduck-tug-entry-2

## Resumen

microduck-tug-entry-2 es una política de control motriz para el robot cuadrúpedo microduck de Pollen Robotics, publicada por el usuario nootxlm como un fine-tune del modelo jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7. No se trata de un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que se carga en una ranura de política del daemon del robot y genera acciones de locomoción a 50 Hz a partir de observaciones de 61 dimensiones. El modelo está etiquetado como pipeline de robótica y se distribuye con la librería propietaria `microduck`.

El modelo se presenta como una política "perpetua": una marcha que se ejecuta de forma continua hasta que se le indique lo contrario. Su propósito declarado es participar en una competición de tirar de la cuerda ("tug-of-war") dentro de la arena de pruebas de microduck. La modificación respecto al modelo base consiste en una capa externa de búsqueda exacta por observación (139 filas) que sustituye los finales de las semillas 4 y 5 por trayectorias re-grabadas mediante búsqueda de coordenadas.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0,0 GB (lo que sugiere que los pesos no están realmente alojados o son de tamaño despreciable) y una licencia no especificada. Es un artefacto de experimentación en robótica de bajo nivel, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso, control a 50 Hz |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX, presumiblemente float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 del manifiesto de políticas de microduck |
| Entradas | Observación bruta de 61 dimensiones (normalizador incluido en el ONNX) |
| Salidas | 14 acciones |
| Frecuencia de control | 50 Hz |
| Modelo base | jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7 (fine-tune, pesos base conservados byte a byte) |
| Librería | `microduck` |
| Repositorio de entrenamiento | `pollen-robotics/microduck_rl`, rama `develop`, commit `b02fdea49` |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal subyacente (número de capas, anchura, tipo de encoder). Lo que sí se documenta es el pipeline de entrenamiento: aprendizaje por refuerzo sobre el repositorio `pollen-robotics/microduck_rl` (rama `develop`, commit `b02fdea49`). El modelo base `microduck-tug-cup3-l6e-s4-de128ff7` se conserva íntegro, byte a byte, y el fine-tune añade una capa externa de búsqueda exacta por observación con 139 filas.

La innovación técnica declarada no está en la red sino en el post-procesado: los finales de las semillas 4 y 5 se re-grabaron mediante búsqueda de coordenadas. La semilla 5 proviene de una búsqueda final de 15 llamadas; la semilla 4 se extendió con una búsqueda final de 25 llamadas, con escalas desde 0,003 hasta 3e-06, rondas de Jacobi con combinaciones verificadas y aritmética float32 en todo el proceso. El resultado declarado en la réplica oficial local es una media de suelo de 168,906037 cm sobre 5 semillas, con todas las victorias por caída en foso ("pit wins"). No se especifican el número de tokens, la composición del dataset ni si hubo RLHF o DPO, conceptos que además no aplican a este dominio.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha perpetua que se ejecuta hasta recibir una orden de parada.
- Control a 50 Hz con observaciones de 61 dimensiones y 14 acciones, adecuado para el bucle de control de bajo nivel del robot.
- Normalización de observaciones integrada en el propio `policy.onnx`: acepta observaciones en bruto sin preprocesado externo.
- Comportamiento especializado en la prueba de tirar de la cuerda de la arena de microduck, con finales optimizados para las semillas 4 y 5.
- Carga directa en una ranura de política mediante `robotctl policy load <slot> nootxlm/microduck-tug-entry-2`.
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni capacidades multilingües.

## Casos de uso

- Competición de tirar de la cuerda en la arena de microduck: la política está entrenada y ajustada específicamente para esta prueba, con finales re-grabados para mejorar el resultado en las semillas 4 y 5; es su uso principal y declarado.
- Evaluación comparativa de políticas de locomoción: sirve como referencia de línea base frente a otras políticas del mismo repositorio base para medir distancia media de suelo y victorias por foso en réplicas locales.
- Pruebas de integración del daemon de microduck: al ajustarse al esquema 2 del manifiesto de políticas, permite validar el flujo `robotctl policy load` y la carga de políticas ONNX en ranuras.
- Reproducción de experimentos de RL: el repositorio de entrenamiento, la rama y el commit están documentados, lo que permite reconstruir el pipeline y comparar el efecto de la capa de búsqueda exacta por observación.
- Demostraciones de locomoción perpetua en robots cuadrúpedos de bajo coste: útil en entornos de laboratorio o educativos para mostrar marchas continuas de 50 Hz sin infraestructura de inferencia pesada.
- Investigación sobre post-procesado de políticas: la capa de búsqueda exacta con 139 filas y las rondas de Jacobi documentadas sirven como caso de estudio de sustitución de trayectorias finales sin reentrenar la red.
- No es adecuado para atención al cliente, generación de código, análisis de documentos ni ninguna tarea de procesamiento de lenguaje natural.

## Benchmarks y rendimiento

El autor declara un único resultado en la réplica oficial local: media de suelo de 168,906037 cm sobre 5 semillas, con todas las victorias por caída en foso. No se aportan resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark estándar, que además no aplican a este tipo de modelo.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Distancia media de suelo | 168,906037 cm | Réplica oficial local, 5 semillas |
| Victorias por foso | Todas | Réplica oficial local, 5 semillas |

No se han publicado resultados de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB y no se detalla el tamaño del grafo ONNX ni el número de parámetros.
- GPU recomendadas: no disponible; al ser una política de control a 50 Hz con observaciones de 61 dimensiones, es plausible que se ejecute en CPU, pero la información no lo confirma.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos sobre requisitos mínimos.
- Opciones de despliegue: el daemon de microduck mediante `sudo robotctl policy load <slot> nootxlm/microduck-tug-entry-2`; también es posible cargar el `policy.onnx` con cualquier runtime compatible con ONNX (ONNX Runtime, por ejemplo), aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles; la única referencia temporal es la frecuencia de control de 50 Hz del robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nootxlm/microduck-tug-entry-2 | no disponible | 61-D de observacion, 14 acciones, 50 Hz | 168,906037 cm de media de suelo en 5 semillas (declarado) | no disponible | Hugging Face, 0 descargas |
| jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7 | no disponible | 61-D de observacion, 14 acciones, 50 Hz | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de información sobre otras políticas comparables de la misma categoría en la documentación proporcionada, por lo que la comparativa se limita al modelo base del que deriva.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos de comportamiento ni modos de fallo de la política.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero existe riesgo de comportamiento impredecible fuera de las condiciones de la arena de entrenamiento.
- Limitaciones de contexto o idioma: la política está especializada en la prueba de tirar de la cuerda de la arena de microduck; no se garantiza su transferencia a otras tareas, terrenos o configuraciones del robot.
- Restricciones de licencia para uso comercial: la licencia es no disponible, por lo que no puede asumirse permiso de uso comercial; es necesario contactar con el autor antes de cualquier despliegue productivo.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0,0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o son de extensión mínima; verificar la integridad del artefacto antes de usarlo.
- El modelo base se conserva byte a byte y la modificación es una capa externa de búsqueda exacta sobre 139 filas: el comportamiento fuera de las observaciones cubiertas por esa capa depende enteramente del modelo base.
- Los resultados declarados (168,906037 cm de media) provienen de una réplica oficial local del propio autor sobre 5 semillas; no hay validación independiente.
- El esquema del manifiesto es la versión 2; versiones distintas del daemon pueden requerir adaptaciones.
- No se especifican los idiomas soportados ni requisitos de seguridad física; el despliegue en un robot real implica riesgos mecánicos que deben evaluarse aparte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nootxlm/microduck-tug-entry-2
- Modelo base: https://huggingface.co/jrubiosainz/microduck-tug-cup3-l6e-s4-de128ff7
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `develop`, commit `b02fdea49` (no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
