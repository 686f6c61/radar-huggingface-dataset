# jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340-reentry-20261106

## Resumen

Microduck Hill Climb - HV3x-678af340 es una política de control para robótica en simulación, publicada por el usuario jrubiosainz en Hugging Face. No se trata de un modelo de lenguaje ni de un modelo fundacional: es un grafo ONNX de 917.966 bytes que implementa una política de locomoción para el benchmark Microduck Arena, concretamente la prueba de ascenso de colina de 1,5 m. Su función es generar comandos de control a partir de observaciones del entorno simulado, y su interés es acotado: sirve como entrada en una competición de simulación, no como componente de producción.

El modelo deriva del policy público HlibPlakhtii/microduck-hill-quicksilver-v3 (Apache-2.0), que a su vez es un remix de rumezhak/microduck-hill-remix-leader3. Sobre esa base, el autor aplicó una búsqueda CMA-ES separable restringida a la semilla oficial 2 y a partir del paso de control 30, añadiendo 32 filas de observación/acción grabadas en bucle cerrado como una tabla de búsqueda adicional dentro del grafo ONNX. El resto del modelo base permanece intacto, byte a byte.

La relevancia de esta ficha es documental y metodológica: ilustra cómo se publican variantes mínimas de políticas de control para benchmarks de simulación, con trazabilidad criptográfica (SHA256) y declaración explícita de que las mediciones son locales y no oficiales. La entrada es además una "reentrada metadata-only" del 6 de noviembre de 2026, que solo añade una entrada de metadatos al ONNX sin cambiar el comportamiento ni reclamar mejora alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control en grafo ONNX; no es un transformer ni un modelo de lenguaje. Estructura interna no documentada en la información disponible |
| Parametros totales | No disponible (el artefacto pesa 917.966 bytes; no se declara recuento de parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política de control por paso; no hay ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible; se distribuye como ONNX en precisión nativa del grafo |
| Idiomas soportados | No disponible; no procesa lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) |

## Arquitectura y entrenamiento

El artefacto es un grafo ONNX que actúa como controlador: recibe observaciones del entorno simulado y emite acciones de control. La arquitectura interna del grafo base no se detalla en la model card; lo que sí se documenta es el mecanismo de modificación. El autor reutilizó la función `overlay()` del script `search_race.py` del autor base para añadir una tabla de búsqueda de 32 filas observación/acción, con tensores prefijados como `search2_`. Cualquier observación que no coincida con esas filas se resuelve con el controlador base sin modificar.

El "entrenamiento" consistió en una búsqueda CMA-ES separable sobre los objetivos articulares, ejecutada el 4 de noviembre de 2026, limitada a la semilla oficial 2 y comenzando en el paso de control 30 (los pasos iniciales y el asentamiento no cronometrado quedan iguales). Las 32 filas se grabaron en bucle cerrado sobre el runner nativo x86. No hay datos sobre volumen de entrenamiento, composición de dataset ni técnicas de RLHF/DPO, porque no se trata de un modelo entrenado con esos paradigmas. La innovación técnica destacable es la trazabilidad: se documentan SHA256 del modelo base, del candidato y del artefacto reentregado, y se verifica que el grafo, inicializadores, imports de operadores, firmas de entrada/salida y metadatos previos son idénticos byte a byte al origen.

## Capacidades

- Generación de comandos de control para locomoción en simulación, específicamente para la prueba de ascenso de colina de 1,5 m del Microduck Arena.
- Respuesta a observaciones del entorno simulado mediante una combinación de controlador base y tabla de búsqueda para 32 observaciones concretas.
- Ejecución en el runner oficial microduck-arena 0.7.0 x86, versión 5, con `command_vx = 0.15`.
- Inferencia en CPU con ONNX Runtime (probado con `onnx` 1.22.0 y ONNX Runtime 1.24.4, un hilo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento. No es un modelo de lenguaje.

## Casos de uso

- Evaluación comparativa en el Microduck Arena: la política se puede cargar en el runner oficial para reproducir la barrida de 18 velocidades y comparar tiempos de finalización frente al modelo base y otras entradas del benchmark.
- Investigación sobre búsqueda de políticas: sirve como ejemplo reproducible de cómo una búsqueda CMA-ES acotada a una semilla y a un tramo de pasos puede añadirse como capa de lookup sobre un controlador existente sin reentrenar el grafo.
- Verificación de trazabilidad de artefactos: el par de ficheros con SHA256 documentados permite practicar auditorías de integridad y comprobar que una reentrega metadata-only no altera el comportamiento.
- Docencia en robótica simulada: útil para mostrar el ciclo observación-acción en un grafo ONNX pequeño y ejecutable en CPU, sin necesidad de GPU.
- Pruebas de regresión de runners: las 2.827 observaciones fijas mencionadas (filas de las tablas, copias desplazadas, valores aleatorios con semilla y valores extremos) sirven como suite de comprobación de que un cargador de políticas no altera la inferencia.
- Referencia negativa para despliegue real: el propio autor advierte explícitamente de que no debe ejecutarse en un robot físico, lo que lo convierte en un caso de estudio sobre límites de validez de políticas entrenadas en simulación.

## Benchmarks y rendimiento

Los únicos datos disponibles son los tiempos de finalización locales del autor en el runner nativo x86, no resultados oficiales de la Arena.

| Semilla oficial | Base (s) | Esta entrada (s) |
|---|---:|---:|
| 1 | 0.730 | 0.730 |
| 2 | 0.745 | 0.740 |
| 3 | 0.740 | 0.740 |
| 4 | 0.735 | 0.735 |
| 5 | 0.740 | 0.740 |

Media local: 0.737 s frente a 0.738 s del base, con cinco finalizaciones. El autor indica que la entrada fuente fue aceptada por la Arena como ejecución `01M6K7F36P9SZ94M6XXV6T` (runner versión 5, `command_vx = 0.15`, cinco finalizaciones, media 0.737 s). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a este tipo de artefacto.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia se ejecuta en CPU. El artefacto pesa menos de 1 MB.
- GPU recomendadas: ninguna necesaria. El autor validó con ONNX Runtime en CPU, un solo hilo.
- Cabe en cualquier hardware consumer: el grafo de 917.966 bytes se ejecuta en CPU convencional.
- Opciones de despliegue: ONNX Runtime (versión probada 1.24.4) y el runner oficial microduck-arena 0.7.0 x86, versión 5. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de política.
- Latencia y throughput: no disponibles. Solo se reportan tiempos de finalización de la prueba (media 0.737 s), no latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340-reentry-20261106 | Política de control ONNX | No disponible | No aplica | Media local 0.737 s (5/5) | Apache-2.0 | Hugging Face |
| HlibPlakhtii/microduck-hill-quicksilver-v3 | Política de control ONNX (base directa) | No disponible | No aplica | Media local 0.738 s (5/5) | Apache-2.0 | Hugging Face |
| rumezhak/microduck-hill-remix-leader3 | Política de control ONNX (base de la base) | No disponible | No aplica | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |

## Limitaciones y advertencias

- El autor declara explícitamente: "Do not run this policy on a physical robot". La política está entrenada y medida solo en simulación.
- Las mediciones son locales y en muestra (solo las cinco semillas oficiales); no dicen nada sobre locomoción general ni sobre seguridad en robots reales.
- La búsqueda CMA-ES se limitó a la semilla 2 y al tramo desde el paso 30; el resto de semillas no se optimizó y la mejora es marginal (0.001 s de media).
- No es un resultado oficial de la Arena: el servidor es la autoridad y el autor no reclama aceptación, rango ni puntuación.
- La reentrada del 6 de noviembre de 2026 es metadata-only: añade una entrada `jrubiosainz.daily_entry` al ONNX, no cambia el grafo y no reclama mejora. Cualquier lectura de sus cifras debe referirse al fichero fuente, no a una nueva medición.
- Riesgo de alucinación, sesgos lingüísticos y limitaciones de contexto o idioma: no aplican, al no ser un modelo de lenguaje.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el `NOTICE` debe conservarse y declarar la modificación (§4(b)). El autor se compromete a retirar la publicación si algún autor upstream objeta.
- El modelo depende de la existencia y estabilidad del runner y del ecosistema Microduck Arena; fuera de ese entorno su utilidad es prácticamente nula.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340-reentry-20261106
- Entrada fuente (reentrega): https://huggingface.co/jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340/tree/8e3e56c725125d3bad501e30f5620e1dd9888cce
- Política fuente canónica: https://huggingface.co/jrubiosainz/microduck-hill-climb-1m5-hv3x-678af340/resolve/8e3e56c725125d3bad501e30f5620e1dd9888cce/policy.onnx
- Modelo base directo: https://huggingface.co/HlibPlakhtii/microduck-hill-quicksilver-v3/tree/65a137db5525b1c591450704241396e69368374d
- Base del base: https://huggingface.co/rumezhak/microduck-hill-remix-leader3/tree/cddaeebb6bcee5ef84729d9eb0838fc74097cf2c
- Microduck Arena y runner oficial: atribuidos a Pollen Robotics en la model card; no se proporciona URL directa en la información disponible.
