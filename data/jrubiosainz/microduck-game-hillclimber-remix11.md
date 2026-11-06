# jrubiosainz/microduck-game-hillclimber-remix11

## Resumen

`microduck-game-hillclimber-remix11` es una política de control para robots cuadrúpedos MicroDuck, publicada por el usuario jrubiosainz en Hugging Face. No es un modelo de lenguaje: es un artefacto de robótica en formato ONNX que implementa un controlador de locomoción para la prueba "1.5 m Hill Climb" de la Microduck Arena, un entorno de simulación de código abierto mantenido por Pollen Robotics. El modelo resuelve el problema de generar comandos articulares (14 salidas) a partir de observaciones del estado del robot (61 entradas) para completar una subida de colina en el menor tiempo posible.

Técnicamente es un composite: combina una política base propia (`hillclimber-remix9`, 0.741 s de media) con una capa de búsqueda por coincidencia exacta extraída de un modelo de terceros (`HlibPlakhtii/microduck-hill-quicksilver-v3`, Apache-2.0) que reproduce su carrera en la semilla 1. El resultado es una mejora marginal en la media del tablero (0.739 s frente a 0.741 s), lograda únicamente en la semilla 1 y solo dentro del simulador.

Es relevante como ejemplo de ingeniería de composites en robótica simulada: demuestra cómo se puede injertar una trayectoria pregrabada en una política neuronal mediante una capa `Where` sin alterar el comportamiento fuera de los estados memorizados. El repositorio ocupa 0.0 GB y el archivo `policy.onnx` pesa 979.524 bytes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal feedforward exportada a ONNX (detalles de capas no disponibles); composite con capa de lookup por coincidencia exacta |
| Parametros totales | No disponible (el archivo ONNX contiene 51 inicializadores en la base; el recuento total de parámetros no se declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de 61 dimensiones, sin secuencia) |
| Tipos de cuantizacion | No disponible (pesos en el ONNX, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | No aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Mixta: partes del donante bajo Apache-2.0; base sin licencia declarada; repositorio no etiquetado como Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`, 979.524 bytes, sha256 `7f6f38aa...`) + `manifest.json` (schema 2 de Pollen) |

## Arquitectura y entrenamiento

La base `hillclimber-remix9` es una red neuronal feedforward exportada a ONNX con 51 inicializadores y 80 operadores en orden, que mapea una observación de 61 dimensiones a 14 objetivos articulares. Su entrenamiento original no está documentado en la información disponible; la model card indica que fue "buscada" (search) y que proviene de una ejecución con identificador `01M5ZT10KKJZ5AYGXF4P72`. El modelo base a su vez es un fine-tune de `jrubiosainz/microduck-game-hillclimber-remix9`, según los tags de Hugging Face.

La innovación del composite es una capa de lookup superpuesta: se almacenan 62 observaciones y 62 filas de objetivos articulares (62×61 y 62×14) procedentes de la carrera de la semilla 1 del donante. En inferencia, cada observación se compara contra las filas almacenadas con tolerancia 1e-7 en la diferencia absoluta máxima; si hay coincidencia, se emite la fila almacenada y se alimenta a la base con una observación fija (su primera observación de la semilla 1) para evitar que indexe fuera de sus tablas. Si no hay coincidencia, la base procesa la observación viva y su salida es la acción. Las columnas 48–60 de la observación se enmascaran en la coincidencia, salvo la columna 48 (velocidad comandada), que se fija a 0.3 m/s para que la capa solo se active a esa velocidad.

## Capacidades

- Generación de comandos articulares para locomoción de un cuadrúpedo MicroDuck en simulación (14 salidas de control).
- Ejecución de la prueba "1.5 m Hill Climb" de la Microduck Arena a 0.3 m/s.
- Reproducción exacta de la carrera de la semilla 1 del donante mediante lookup de observaciones.
- Comportamiento idéntico a la base en cualquier estado no memorizado (semillas 6 a 60, 55 de 55 idénticas).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No procesa texto, visión ni audio.

## Casos de uso

- Evaluación de composites en la Microduck Arena: sirve para estudiar cómo una capa de lookup afecta a la media del tablero sin reentrenar la política base, comparando tiempos por semilla.
- Investigación sobre injerto de trayectorias: permite analizar el efecto de superponer una carrera pregrabada sobre una política neuronal y medir la degradación fuera de distribución (semillas 6–60).
- Benchmark de robustez en simulación: al ser idéntico a la base en estados no memorizados, se puede usar como control en experimentos que midan el impacto de la memorización en métricas agregadas.
- Docencia sobre licencias y atribución: el repositorio incluye `NOTICE` y `LICENSE` separados para las partes Apache-2.0, útil como caso práctico de cumplimiento en composites.
- Pruebas de integración del runner de la Arena: el `manifest.json` en schema 2 permite validar pipelines de carga de políticas en el espacio de Pollen Robotics.
- Estudio de sobreajuste a semillas: la comparación entre la mejora en semilla 1 (0.730 s) y la ausencia de mejora en semillas 2–5 ilustra el riesgo de optimizar contra un subconjunto de evaluaciones.

## Benchmarks y rendimiento

Tiempos de carrera (s) en las semillas oficiales del evento, Arena runner versión 5, x86-64:

| Semilla | remix9 (base, 0.3 m/s) | quicksilver-v3 (donante, 0.15 m/s) | Este composite (0.3 m/s) |
|---|---|---|---|
| 1 | 0.740 | 0.730 | 0.730 |
| 2 | 0.745 | 0.745 | 0.745 |
| 3 | 0.740 | 0.740 | 0.740 |
| 4 | 0.740 | 0.735 | 0.740 |
| 5 | 0.740 | 0.740 | 0.740 |
| Media del tablero | 0.741 | 0.738 | 0.739 |

Resultados in-sample: la capa de lookup solo se activa en estados de la semilla 1 a 0.3 m/s. En semillas 6 a 60 a 0.3 m/s el composite es idéntico a remix9 (55 de 55 carreras idénticas). No se han publicado resultados en hardware real.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB; el archivo ONNX pesa 979.524 bytes y la entrada es un vector de 61 floats.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) es sobredimensionada para este modelo.
- Cabe en cualquier GPU consumer y en sistemas embebidos con ONNX Runtime.
- Opciones de despliegue: ONNX Runtime, el runner `arena.evaluate` de la Microduck Arena, o cualquier intérprete ONNX compatible.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del grafo (80 operadores, 51 inicializadores) se espera latencia de microsegundos en CPU, pero no se declara cifra alguna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media del tablero | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-game-hillclimber-remix11` | No disponible | No aplica | 0.739 s | Mixta (parcial Apache-2.0) | Hugging Face |
| `jrubiosainz/microduck-game-hillclimber-remix9` | No disponible | No aplica | 0.741 s | Sin licencia declarada | Hugging Face |
| `HlibPlakhtii/microduck-hill-quicksilver-v3` | No disponible | No aplica | 0.738 s | Apache-2.0 | Hugging Face |
| `rumezhak/microduck-hill-remix-leader3` | No disponible | No aplica | No disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo evaluado en el simulador de la Microduck Arena; no se ha probado en hardware físico. La model card advierte explícitamente: "Do not load it on a physical MicroDuck".
- El contador de pasos y el identificador de rama de la base viajan en el objetivo `head_pitch`, y las filas almacenadas están temporizadas para una única carrera oficial; esto hace inviable su uso fuera de la semilla 1.
- La mejora en la media (0.741 s a 0.739 s) es marginal y proviene exclusivamente de la semilla 1; en semillas 2–5 el rendimiento es igual o peor que el del donante.
- Riesgo de sobreajuste severo: la capa de lookup memoriza 62 observaciones exactas y no generaliza.
- Licencia ambigua: las partes del donante son Apache-2.0, pero la base no declara licencia y el repositorio en conjunto no está etiquetado como Apache-2.0. El uso comercial requiere revisión legal.
- El autor se compromete a retirar el repositorio si algún autor original objeta.
- No hay datos de sesgos, alucinación ni comportamiento fuera de distribución más allá de la verificación en semillas 6–60.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix11
- Modelo base (remix9): https://huggingface.co/jrubiosainz/microduck-game-hillclimber-remix9
- Donante (quicksilver-v3): https://huggingface.co/HlibPlakhtii/microduck-hill-quicksilver-v3
- Upstream del donante (leader3): https://huggingface.co/rumezhak/microduck-hill-remix-leader3
- Microduck Arena (espacio de Pollen Robotics): https://huggingface.co/spaces/pollen-robotics/microduck-arena
- Perfil del autor del donante: https://huggingface.co/HlibPlakhtii
