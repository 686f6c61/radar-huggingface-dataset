# dashi/microduck-sprint-daily-20261027

## Resumen

`dashi/microduck-sprint-daily-20261027` es una política de control motriz (locomoción) entrenada por refuerzo para el robot educativo [microduck](https://github.com/pollen-robotics/microduck) de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo multimodal: es una red de política exportada a ONNX que consume observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, destinada a ocupar el slot `walk` del demonio de control del robot. El autor la describe como una política **perpetua**: una vez cargada, genera marcha de forma continua hasta que se le indique lo contrario.

Se trata de una reentrada diaria (*daily re-entry*) del modelo `dashi/microduck-sprint-remix-r844`, del que se cita una puntuación de 0,844, y es a su vez un *remix* por fine-tuning de `jrubiosainz/microduck-game-sprinter-remix3`. El repositorio se publicó el 27 de octubre de 2026, ocupa 0,0 GB según HuggingFace y no registra descargas en el momento de la consulta. Su relevancia es acotada pero concreta: ejemplifica el flujo de trabajo de *policy zoo* para robótica de bajo coste, donde políticas pequeñas en ONNX se versionan en HuggingFace y se despliegan en el robot con un solo comando (`robotctl policy load walk ...`), con la normalización de observaciones embebida en el propio grafo ONNX.

La información pública disponible es muy escasa: no se documentan parámetros, licencia, idiomas ni resultados de evaluación más allá de la cifra de reentrada citada. Esta ficha refleja por tanto únicamente lo verificable en la model card y en los metadatos del repositorio, marcando explícitamente como «no disponible» todo lo demás.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red de política de reinforcement learning exportada a ONNX; topología interna (capas, activaciones) no disponible |
| Parámetros totales | No disponible (el repositorio ocupa 0,0 GB y la política se distribuye como `policy.onnx`, sin fichas de pesos separadas) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; no es un modelo de contexto. Entrada fija de 61 dimensiones de observación por paso de control |
| Tipos de cuantización | No disponible; se distribuye un único `policy.onnx` con la normalización de observaciones embebida en el grafo |
| Idiomas soportados | No disponible / no aplica (política de control motriz, sin entrada ni salida de texto) |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` conforme al esquema 2 del *policy manifest* de microduck |
| Frecuencia de control | 50 Hz (20 ms por paso) |
| Espacio de observación | 61 dimensiones, en crudo (la normalización está horneada en el ONNX) |
| Espacio de acciones | 14 acciones |
| Slot del demonio | `microduck-slot:walk` |
| Modelo base | `jrubiosainz/microduck-game-sprinter-remix3` (relación: finetune) |
| Predecesor citado | `dashi/microduck-sprint-remix-r844` (puntuación 0,844) |
| Fecha de publicación | 2026-10-27 |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

La model card no describe la topología de la red. Por el pipeline declarado (`robotics`), la librería (`microduck`) y el formato de salida (ONNX con normalizador embebido), se trata de una política de control entrenada por refuerzo y exportada para inferencia determinista en el robot, que mapea un vector de observación de 61 dimensiones a 14 acciones a 50 Hz. El tamaño del repositorio (0,0 GB) es coherente con una red de pocos cientos de miles de parámetros como máximo, aunque el número exacto no está publicado y no debe inferirse.

El entrenamiento se realizó con el *codebase* `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. No se especifican el número de pasos de entorno, la composición del dataset, el algoritmo de RL, ni si hubo etapas de ajuste fino supervisado o *reward shaping*. La model card solo indica que es una reentrada diaria del modelo `dashi/microduck-sprint-remix-r844` y un *remix* por fine-tuning de `jrubiosainz/microduck-game-sprinter-remix3`. Como innovación operativa destacable, la normalización de observaciones va incluida dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo sin preprocesado adicional, y el `manifest.json` sigue el esquema 2 del manifiesto de políticas del demonio.

## Capacidades

- Generación de marcha perpetua para el slot `walk`: la política no tiene condición de parada interna; corre hasta que el operador la detenga o la sustituya.
- Control reactivo a 50 Hz sobre un espacio de observación de 61 dimensiones y 14 acciones, adecuado para el bucle de control de bajo nivel del microduck.
- Carga directa en el robot mediante `robotctl policy load walk dashi/microduck-sprint-daily-20261027`, sin pasos de exportación ni calibración adicional del normalizador.
- Compatibilidad con el ecosistema de manifiestos de microduck (esquema 2), lo que permite sustituirla por otra política del mismo slot.
- Punto de partida para *fine-tuning* con `microduck_rl` (rama `roll-backward`).
- No soporta *tool calling*, ni razonamiento multi-paso, ni generación de texto, ni visión, ni audio, ni capacidades multilingües: es exclusivamente una política motriz.

## Casos de uso

- **Marcha por defecto en el robot microduck**: cargar la política en el slot `walk` para obtener una marcha continua en demonstrations y actividades educativas, aprovechando que el normalizador está embebido y no requiere *pipeline* de preprocesado.
- **Comparación A/B de políticas de locomoción**: al ocupar el mismo slot que otras políticas (`walk`), permite alternar mediante `robotctl` entre esta reentrada y sus predecesoras para medir estabilidad y deriva en sesiones largas.
- **Pruebas de estabilidad a largo plazo**: su carácter perpetuo la hace útil para *soak tests* de decenas de minutos u horas, verificando que la marcha no degrada ni consume recursos progresivamente en el demonio de control.
- **Reproducción de experimentos de RL**: la model card fija repositorio, rama (`roll-backward`) y commit (`83599404a`), lo que permite reconstruir el entorno de entrenamiento y comparar la política publicada con una reevaluación local.
- **Base para *fine-tuning* específico de tarea**: partir de estos pesos y reentrenar con `microduck_rl` para ajustar la marcha a una superficie, carga útil o calibración de servos concretas del robot.
- **Despliegue en flotas o aulas con hardware modesto**: al ser un ONNX de tamaño mínimo, la inferencia puede ejecutarse en CPU dentro del propio robot o en un equipo de laboratorio, sin GPU dedicada, lo que simplifica el despliegue en varios robots simultáneamente.
- **Validación en CI de robótica**: integrar la carga de la política con `robotctl` en un *pipeline* previo a la actualización del robot, verificando que el manifiesto es válido y que la política arranca y produce acciones dentro de rango.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No aplican métricas de NLP (MMLU, HumanEval, GSM8K); el único dato numérico es la puntuación del predecesor citada por el autor:

| Métrica | Valor | Contexto |
|---|---|---|
| Puntuación de `dashi/microduck-sprint-remix-r844` | 0,844 | Cifra citada en la model card como origen de esta reentrada diaria; no se especifica la escala, el entorno ni el protocolo de evaluación |
| Puntuación de esta política | No disponible | No se publica evaluación propia |
| Throughput / latencia medidos | No disponible | Solo se declara la frecuencia de control de 50 Hz, no latencias reales |

## Requisitos de hardware

- **VRAM estimada**: no aplica en la práctica; una política ONNX de este tipo (repositorio de 0,0 GB) puede ejecutarse en CPU. No se publica el número de parámetros, por lo que no se da una cifra de memoria exacta.
- **GPU recomendadas**: ninguna necesaria. No hay datos que justifiquen GPU dedicada; A100, H100 o RTX 4090 no aportan nada a una política de 14 acciones a 50 Hz.
- **Consumer GPU**: irrelevante; el cuello de botella es el bucle de control en tiempo real, no el cómputo.
- **Presupuesto temporal**: a 50 Hz, cada inferencia debe completarse en 20 ms; una red de este tamaño en CPU queda muy por debajo de ese margen en la mayoría de plataformas, aunque no se publican mediciones.
- **Opciones de despliegue**: el demonio de microduck vía `robotctl` (ruta soportada oficialmente), u ONNX Runtime si se integra en un *host* propio respetando el contrato de 61 entradas / 14 salidas y el normalizador embebido.
- **Latencia y throughput**: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Contexto | Slot | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261027` | Esta ficha | No disponible | No aplica | `walk` | No disponible | HuggingFace, 0 descargas |
| `dashi/microduck-sprint-remix-r844` | Predecesor citado (puntuación 0,844) | No disponible | No aplica | No disponible en la información | No disponible | HuggingFace |
| `jrubiosainz/microduck-game-sprinter-remix3` | Modelo base del *finetune* | No disponible | No aplica | No disponible en la información | No disponible | HuggingFace |

No se dispone de datos de otros modelos comparables de la misma categoría (políticas de locomoción para microduck) en la información proporcionada; la comparación se limita a la línea de descendencia declarada por el autor.

## Limitaciones y advertencias

- **Licencia sin especificar**: no se declara licencia, por lo que no puede asumirse uso comercial. Cualquier despliegue en producto requiere contactar con el autor o con Pollen Robotics.
- **Documentación mínima**: no hay parámetros, topología, dataset de entrenamiento ni protocolo de evaluación publicados; la reproducibilidad depende del commit `83599404a` del repositorio `microduck_rl`.
- **Sin evaluación independiente**: la única cifra (0,844) proviene del autor, sin escala ni metodología descritas. No debe compararse con métricas de otros modelos.
- **Política perpetua sin parada interna**: requiere supervisión externa; el operador debe detenerla explícitamente. No incorpora capas de seguridad, límites de par ni detección de caídas.
- **Específica de un robot y una calibración**: está entrenada para el microduck con su espacio de 61 observaciones y 14 acciones; cambios de hardware, desgaste de servos o superficies distintas pueden degradar la marcha (*sim-to-real gap*).
- **Slot único**: solo cubre `walk`; no aporta otros comportamientos ni razonamiento de alto nivel.
- **Sin sesgos lingüísticos ni de alucinación aplicables**: al no procesar texto, los riesgos típicos de LLM no aplican; el riesgo equivalente es una marcha inestable o no intencionada.
- **Señales de madurez bajas**: 0 descargas y 1 *like* en el momento de la consulta, y una fecha de creación registrada como 2026-10-27; conviene verificar la integridad del `manifest.json` y del ONNX antes de usarla en un robot físico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/dashi/microduck-sprint-daily-20261027)
- [Modelo base: jrubiosainz/microduck-game-sprinter-remix3](https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3)
- [Repositorio del robot microduck (Pollen Robotics)](https://github.com/pollen-robotics/microduck)
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl`, rama `roll-backward`, commit `83599404a` (sin URL directa en la model card)
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces encontrados trataban sobre el caldo japonés *dashi* y no se incluyen por no guardar relación con el contenido de la ficha.
