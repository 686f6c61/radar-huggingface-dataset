# DenRakEiw/microduck-twelve-parsec-duck_0897

## Resumen

`microduck-twelve-parsec-duck_0897` es una política de control robótico entrenada mediante aprendizaje por refuerzo (RL) y posteriormente refinada con estrategias evolutivas (ES, *evolution strategies*). La desarrolla el usuario DenRakEiw y está pensada para el robot cuadrúpedo de código abierto **microduck** de Pollen Robotics. No es un modelo de lenguaje: es un controlador neuronal exportado a ONNX que traduce observaciones de 61 dimensiones en 14 acciones de control a 50 Hz.

El modelo se distribuye como un artefacto de política ("policy") que se carga directamente en el daemon del robot mediante `robotctl`, con el normalizador de observaciones embebido dentro del propio grafo ONNX. La política se describe como "perpetua": ejecuta una marcha (gait) de forma continua hasta que se le indica lo contrario, lo que la orienta a locomoción sostenida más que a tareas episódicas.

Por su naturaleza, esta ficha difiere de las de modelos generativos: no hay datos de benchmarks, idiomas, contexto ni cuantización en el sentido habitual. La información pública disponible es mínima (repo de 0.0 GB, sin licencia declarada, sin descargas ni likes en el momento de la consulta), por lo que varias especificaciones se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de política para control (RL + ES); topología interna no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 61-D de observación) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, cuantización no declarada) |
| Idiomas soportados | no disponible (no aplica; no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del policy manifest de microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Libreria | `microduck` |
| Pipeline (Hugging Face) | robotics |

## Arquitectura y entrenamiento

La política se entrena en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw-070`, commit `6c0b5d452`. El autor indica que el entrenamiento combina RL propio ("own RL") con un pulido posterior mediante estrategias evolutivas ("ES polish"). La exportación se realizó desde un *checkout* con cambios sin confirmar, lo que implica que el artefacto publicado no corresponde necesariamente de forma exacta a un estado reproducible del código fuente.

El modelo se exporta a ONNX con el normalizador de observaciones integrado en el grafo, de modo que el consumidor debe alimentar observaciones en bruto. El manifiesto sigue el schema 2 del *policy manifest* de microduck (documentado en `docs/policy-manifest.md` del repositorio del daemon). No se dispone de información sobre número de parámetros, volumen de datos de entrenamiento, recompensas utilizadas ni detalles del proceso de ES.

## Capacidades

- Control de locomoción de un robot cuadrúpedo microduck a 50 Hz con observaciones de 61 dimensiones y 14 acciones.
- Ejecución de una marcha continua ("perpetua") hasta recibir instrucción de parada.
- Carga directa en el daemon del robot mediante `robotctl policy load <slot> ...`.
- Inferencia en ONNX con normalización de observaciones embebida (acepta observaciones en bruto).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No dispone de *tool calling*, *function calling* ni capacidades de agente multi-paso.
- Capacidades multilingües: no aplica.

## Casos de uso

- **Locomoción sostenida de microduck en entornos controlados**: cargar la política en un *slot* del daemon y dejar que el robot mantenga una marcha continua para pruebas de desplazamiento prolongado, gracias a su diseño "perpetuo" hasta parada explícita.
- **Investigación en RL aplicado a robótica de bajo coste**: usar la política como línea base o punto de partida en experimentos con `microduck_rl`, dado que procede de una rama concreta del repositorio oficial de entrenamiento.
- **Comparación de estrategias de entrenamiento (RL vs RL+ES)**: emplear el artefacto para contrastar el efecto del pulido mediante estrategias evolutivas frente a políticas entrenadas solo con RL, siempre que se disponga de otras políticas comparables.
- **Despliegue en hardware embebido con ONNX Runtime**: al ser un grafo ONNX con normalización integrada, encaja en pipelines de inferencia ligeros sobre CPU o aceleradores modestos del propio robot.
- **Demostraciones y docencia de robótica cuadrúpeda**: integrar la política en talleres o demos con microduck para ilustrar el ciclo completo de entrenamiento, exportación y carga en robot.
- **Pruebas de robustez de marcha en distintas superficies**: ejecutar la política en entornos variados para observar el comportamiento de la marcha ante perturbaciones, teniendo en cuenta que no se han publicado métricas de robustez.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad de marcha, robustez ni tasa de éxito, y tampoco se dispone de comparaciones con otras políticas del ecosistema microduck.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repo es de 0.0 GB, lo que sugiere un artefacto muy pequeño, pero no se confirma el número de parámetros ni el tamaño exacto de `policy.onnx`.
- GPU recomendadas: no disponible; por la naturaleza del modelo (política de control a 50 Hz en robot embebido) es plausible inferencia en CPU, pero no consta en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: daemon de microduck mediante `robotctl policy load`; inferencia ONNX (runtime no especificado en la información disponible).
- Latencia y throughput estimados: no disponibles; el único dato temporal conocido es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

No se dispone de información sobre políticas comparables del ecosistema microduck ni de otros modelos de la misma categoría con datos verificables. Se indica "no disponible".

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-twelve-parsec-duck_0897 | no disponible | no aplica (obs. 61-D) | no disponible | no disponible | Hugging Face (repo 0.0 GB) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de licencia declarada: no se puede asumir permiso para uso comercial ni para redistribución; conviene contactar con el autor antes de cualquier uso productivo.
- Reproducibilidad comprometida: el autor indica que la exportación proviene de un *checkout* con cambios sin confirmar, por lo que el artefacto puede no corresponder exactamente al commit `6c0b5d452`.
- Sin métricas publicadas: no hay evidencia de robustez, tasa de éxito ni comportamiento en entornos distintos de los de entrenamiento.
- Diseño "perpetuo": la política mantiene la marcha hasta recibir parada; en producción exige mecanismos externos de supervisión y parada de seguridad.
- Entrenamiento con "energía solar" mencionado en la model card sin detalle técnico; no debe interpretarse como garantía de eficiencia energética.
- Ámbito muy restringido: solo aplica al robot microduck con observación de 61-D y 14 acciones a 50 Hz; no es reutilizable como modelo general.
- Cero tracción comunitaria en el momento de la consulta (0 descargas, 0 likes), lo que reduce la validación externa del artefacto.
- No se han identificado sesgos en el sentido de modelos de lenguaje; los riesgos se refieren a comportamiento físico impredecible del robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DenRakEiw/microduck-twelve-parsec-duck_0897
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `denrakeiw-070`, commit `6c0b5d452`)
- Documentación del policy manifest: `docs/policy-manifest.md` en el repositorio del daemon de microduck
