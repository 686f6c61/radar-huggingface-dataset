# lphatnguyen/microduck-tug-of-war-v2

## Resumen

Microduck-tug-of-war-v2 es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo educativo microduck de Pollen Robotics. El modelo, publicado por el usuario lphatnguyen, resuelve una tarea concreta de locomoción: el llamado "tug of war" (tira y afloja), implementada como una política perpetua que se ejecuta de forma continua hasta recibir una orden de parada. Se distribuye como un único archivo ONNX con el normalizador de observaciones embebido, lo que permite alimentar observaciones en crudo directamente desde el robot.

La política opera a 50 Hz, consume observaciones de 61 dimensiones y emite 14 acciones de control. Según la model card, el entrenamiento combina una política de self-play de liga con un mecanismo de fallback (lg21-5400) y una tabla de semillas, construida sobre trabajos previos de otros autores de la comunidad (jrubiosainz h7p1b, greecree tug-super-v11, Unique007 tug-dat-v4 y la herramienta de búsqueda de HlibPlakhtii). No se especifican parámetros, arquitectura de red ni longitud de contexto, ya que no se trata de un modelo de lenguaje sino de una política de control.

Su relevancia es acotada pero clara para el ecosistema microduck: es un ejemplo de política de locomoción lista para desplegar mediante el daemon `robotctl`, con manifest en el esquema 2 del proyecto, y demuestra el flujo de trabajo de entrenamiento por refuerzo del repositorio `pollen-robotics/microduck_rl` en su rama `tug-of-war-selfplay`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control por aprendizaje por refuerzo, exportada a ONNX (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX sin indicar precisión) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna de la red neuronal en la información disponible. Se trata de una política de control entrenada con aprendizaje por refuerzo para el robot microduck, que recibe observaciones de 61 dimensiones y produce 14 acciones a 50 Hz. El normalizador de observaciones está embebido en el propio grafo ONNX, de modo que el consumidor debe pasar observaciones sin normalizar.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `tug-of-war-selfplay`, commit `1ba8b7e4f`. La model card describe la estrategia como "league self-play fallback (lg21-5400) + seed table": una política de self-play de liga con un mecanismo de respaldo y una tabla de semillas que combina aportaciones de otros modelos de la comunidad. No se especifican el número de pasos de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de ajuste posteriores.

## Capacidades

- Locomoción continua del robot microduck para la tarea de "tug of war": la política se ejecuta de forma perpetua hasta que se le indica lo contrario.
- Control a 50 Hz con 14 acciones y observaciones de 61 dimensiones.
- Normalización de observaciones integrada en el modelo ONNX: acepta observaciones en crudo.
- Carga directa en una ranura de política del daemon mediante `robotctl policy load`.
- Compatibilidad con el manifiesto de políticas del proyecto (esquema 2).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, por no ser un modelo de lenguaje.

## Casos de uso

- Demostración de locomoción en el robot microduck: cargar la política en una ranura con `robotctl` y ejecutar el comportamiento de tira y afloja en una sesión de laboratorio o aula.
- Docencia de aprendizaje por refuerzo: usar la política como resultado de referencia del flujo de entrenamiento de la rama `tug-of-war-selfplay` para comparar con políticas propias.
- Investigación en self-play de liga: servir de base o punto de partida para experimentos de entrenamiento competitivo en robots cuadrúpedos de bajo coste.
- Pruebas de integración del daemon: validar el pipeline de carga de políticas, el esquema 2 de manifiestos y la inferencia ONNX en el robot.
- Benchmarking de control: medir latencia y estabilidad de una política perpetua a 50 Hz frente a alternativas de la comunidad como tug-super-v11 o tug-dat-v4.
- Reproducción de resultados: al estar vinculada a un commit concreto del repositorio de entrenamiento, permite reproducir o auditar el proceso que generó la política.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control en ONNX, el requisito es mínimo y probablemente ejecutable en CPU.
- GPU recomendadas: no disponible; no se requiere GPU dedicada para la inferencia según la información disponible.
- Ejecución en GPU de consumo: no disponible; por el tamaño del repositorio (0.0 GB) y la naturaleza del modelo, es plausible su ejecución en CPU o GPU integrada, aunque no se confirma.
- Opciones de despliegue: daemon `robotctl` del proyecto microduck (carga en ranura de política); inferencia ONNX Runtime u otro runtime compatible con ONNX.
- Latencia y throughput: no disponibles; el modelo está diseñado para operar a 50 Hz, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-tug-of-war-v2 (este) | Política RL | Tug of war | ONNX | no disponible | Hugging Face |
| greecree tug-super-v11 | Política RL | Tug of war | no disponible | no disponible | Referenciado en la model card |
| Unique007 tug-dat-v4 | Política RL | Tug of war | no disponible | no disponible | Referenciado en la model card |
| jrubiosainz h7p1b | Política RL | Tug of war | no disponible | no disponible | Referenciado en la model card |

No se dispone de parámetros, contexto ni rendimiento de las alternativas para una comparación cuantitativa; la comparativa se limita a la categoría y la disponibilidad.

## Limitaciones y advertencias

- Ámbito muy restringido: es una política específica para una tarea y un robot concretos (microduck, tarea tug of war); no es reutilizable fuera de ese contexto.
- Licencia no especificada: no se puede confirmar el uso comercial ni la redistribución; conviene contactar con el autor antes de usarla en producción.
- Sin datos de benchmarks ni métricas de éxito: no hay evidencia publicada de robustez, estabilidad o tasa de éxito de la política.
- Dependencia de la infraestructura microduck: requiere el daemon `robotctl` y el esquema 2 de manifiestos; no es un modelo autónomo fuera de ese ecosistema.
- Sin información sobre sesgos, alucinación o limitaciones de idioma: no aplica al no ser un modelo de lenguaje, pero tampoco se documentan fallos de control, deriva o comportamientos inseguros.
- Repositorio de 0.0 GB y sin descargas ni likes: no hay señales de validación por parte de la comunidad.
- Fecha de creación futura (2026-11-13) en los metadatos: posible inconsistencia que conviene verificar antes de confiar en la trazabilidad del artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lphatnguyen/microduck-tug-of-war-v2
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `tug-of-war-selfplay`, commit `1ba8b7e4f` (sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)
