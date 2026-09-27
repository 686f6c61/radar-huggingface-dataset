# amyrmahdy/decima-small

## Resumen

Decima-small es un modelo de decisión de 122 millones de parámetros desarrollado por A. M. Madani (@amyrmahdy). No es un modelo generativo: recibe una situación, una pregunta y un conjunto de opciones en texto libre, y devuelve una distribución de probabilidades calibrada sobre esas opciones. Está construido sobre el encoder multilingüe intfloat/multilingual-e5-small y se distribuye en formato ONNX cuantizado a int8, con un tiempo de inferencia de aproximadamente 20 ms por decisión en un solo núcleo x86 (4 opciones, entrada corta).

Su relevancia práctica está en dos propiedades poco habituales en modelos abiertos de este tipo: invariancia a la permutación de opciones (0 % de cambios de respuesta al reordenar las opciones, frente al 10-27 % de otros modelos de decisión abiertos comparados) y bajo error de calibración tal como se distribuye (ECE de 0,063 y 0,056 en las comparativas por pares reportadas). Ambas cosas importan cuando el software necesita no solo una etiqueta, sino una confianza numérica que se pueda umbralizar.

El modelo cubre 20 idiomas, soporta cuatro tipos de pregunta (choose, score, verify y rank) y permite que el estado, la pregunta y las opciones estén en idiomas distintos. Se publica bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder heredado de intfloat/multilingual-e5-small, con late interaction y dos capas de cross-attention para puntuar opciones |
| Parametros totales | 122M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (ONNX); pesos safetensors en precision no indicada |
| Idiomas soportados | en, fa, ar, ru, de, fr, es, pt, tr, hi, ta, zh, ja, ko, sw, ur, vi, th, el, bg (20) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (int8) y safetensors |
| Modelo base | intfloat/multilingual-e5-small |
| Libreria | onnx |
| Pipeline | zero-shot-classification |
| Tamano del repositorio | 1,1 GB |
| Autor | amyrmahdy (A. M. Madani) |
| Fecha de creacion / actualizacion | 27 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo sigue un esquema de late interaction. El estado (junto con la pregunta) se codifica una sola vez en estados de token H_s. Cada opción k se codifica por separado y lee el estado a través de dos capas de cross-attention, produciendo una puntuación s_k = f(H_s, H_k) que depende únicamente de esa pareja estado-opción. Esta construcción implica invariancia a la permutación por diseño: reordenar las opciones no altera la puntuación de cada una, lo que explica el 0 % de cambios de respuesta medido en las pruebas de barajado.

Los pesos parten del encoder multilingüe intfloat/multilingual-e5-small. Según la model card, Decima se entrenó sobre los splits de entrenamiento de MASSIVE (los 51 locales) y de XNLI/MNLI, lo que el propio autor señala explícitamente al advertir que varias filas de sus tablas de evaluación son in-distribution para Decima y no zero-shot en sentido estricto. No se detallan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni si hubo fases de RLHF o DPO. El autor publica un informe técnico en el repositorio de GitHub (docs/TECHNICAL-REPORT.md) con el desarrollo de estas ideas.

## Capacidades

- Clasificación y decisión con opciones en texto libre elegidas en tiempo de llamada: no hay conjunto fijo de etiquetas ni reentrenamiento.
- Cuatro tipos de pregunta: `choose` (una de N), `score` (niveles ordenados, con cabeza ordinal), `verify` (sí/no) y `rank` (probabilidad independiente por opción).
- Salida de probabilidades calibradas mediante `decide`, y log-probabilidades mediante `decide_logits` (con softmax para `choose`/`verify`/`score` y exp para `rank`).
- Multilingüe en 20 idiomas, con posibilidad de mezclar idiomas entre estado, pregunta y opciones (por ejemplo, un mensaje en persa puntuado contra opciones en inglés).
- Normalización de texto para persa y árabe activable con `Question(..., lang="fa")`.
- Caché de las codificaciones de opciones por conjunto, de modo que las preguntas repetidas sobre el mismo conjunto solo pagan el coste del estado.
- Enrutamiento, triaje, intención, tema, sentimiento, verificación y ranking como tareas objetivo.
- No soporta generación de texto, tool calling, agentes, visión, audio ni razonamiento multi-paso; no es un modelo de lenguaje generativo.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del usuario y un conjunto de colas (facturación, soporte técnico, ventas, seguridad de cuenta) y devuelve probabilidades que el sistema puede umbralizar para asignar automáticamente o escalar a un humano. El ejemplo de la model card sobre un inicio de sesión desde otro país devuelve 0,962 para seguridad de cuenta.
- Triaje de correo entrante: clasificación de mensajes en categorías definidas por el equipo en cada momento, sin reentrenamiento, aprovechando que las opciones son texto libre.
- Detección de intención en asistentes conversacionales: el modelo decide entre intenciones candidatas con una confianza numérica que permite activar un flujo de fallback cuando la probabilidad máxima queda por debajo de un umbral.
- Análisis de sentimiento con niveles ordenados: usando la cabeza ordinal de `score`, se obtienen niveles graduados en lugar de una etiqueta plana.
- Verificación de afirmaciones contra un contexto acotado: con `verify` se obtiene una probabilidad sí/no, útil para comprobaciones binarias donde se necesita una decisión con confianza.
- Ranking de candidatos: con `rank` se puntúan independientemente múltiples opciones (por ejemplo, respuestas candidatas o productos) y se ordenan por probabilidad.
- Clasificación multilingüe en producción: al soportar 20 idiomas y mezcla de idiomas entre campos, permite un único modelo para tráfico internacional en lugar de un clasificador por idioma.
- Moderación de categorías cerradas y etiquetado de temas en pipelines de datos, donde la invariancia al orden de las opciones evita sesgos por el orden en que se listan las etiquetas.

## Benchmarks y rendimiento

Datos de la model card. Todas las cifras son exactitud (accuracy) salvo donde se indica; medidas por el autor con un único harness e idénticas entradas para todos los modelos, ejecutando los checkpoints de la competencia en local.

| Metrica | Decima-small | Kev-0.5B | Kev-0.8B | Laya | Laya-multilingual |
|---|---:|---:|---:|---:|---:|
| Parametros totales | 122M | 494M | 753M | 421M | 322M |
| Protocolo MASSIVE + XNLI de Laya, 29 suites / 19 idiomas (in-distribution para Decima) | 0,764 | 0,527 | — | 0,445 | 0,607 |
| Protocolo publicado de Kev, 8 suites | 0,768 | 0,779 | 0,794 | 0,681 | 0,580 |
| Decima bench, 12 suites, EN/FA/AR/RU (in-distribution para Decima) | 0,785 | — | 0,661 | 0,439 | 0,554 |
| Cambios de respuesta al barajar las opciones | 0,0 % | 21,9 % | 10,3 % | 27,2 % | 21,4 % |

Error de calibración tal como se distribuye (ECE de 15 bins, media sobre las suites que ambos modelos ejecutaron, FarsTail excluido; menor es mejor):

| Comparacion | Decima-small | Alternativa | Suites |
|---|---:|---:|---:|
| vs Kev-0.5B | 0,063 | 0,117 | 39 |
| vs Kev-0.8B | 0,056 | 0,158 | 21 |
| vs Laya | 0,056 | 0,370 | 50 |
| vs Laya-multilingual | 0,056 | 0,251 | 50 |

Resultado adicional reportado: 0,852 en intención MASSIVE sobre 13 idiomas no ingleses bajo el protocolo publicado de Laya y reejecutado por el autor, frente a 0,451 de Laya-multilingual. El autor advierte que Decima se entrenó con los splits de entrenamiento de MASSIVE y XNLI/MNLI, por lo que las filas marcadas como in-distribution no deben citarse como resultado zero-shot.

## Requisitos de hardware

- Inferencia en CPU: el modelo está pensado para ejecutarse en CPU con ONNX Runtime. Aproximadamente 20 ms por decisión en un solo núcleo x86 con 4 opciones y entrada corta.
- VRAM estimada: no aplica en el modo de referencia, que es CPU. Si se carga en GPU, los pesos int8 ocupan del orden de 122 MB y los safetensors en fp32 del orden de 490 MB, más el espacio de activaciones y del tokenizador.
- GPU: cualquier GPU consumer reciente sirve por memoria; el modelo no requiere A100 ni H100. No se han publicado cifras de latencia o throughput en GPU.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en equipos sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime, que es la ruta soportada por el paquete `decima` (instalable desde el repositorio de GitHub). El runtime no importa PyTorch, solo ONNX Runtime, numpy y un tokenizador; el autor señala que el paquete actual todavía instala las dependencias de entrenamiento (torch, sentence-transformers, datasets) y que hay un paquete solo de runtime planificado.
- No compatible con llama.cpp, Ollama, vLLM o TGI en el formato distribuido (no hay GGUF y no es un modelo generativo con KV cache de decodificación).
- Latencia: aproximadamente 20 ms por decisión (4 opciones, entrada corta, un núcleo x86). Las codificaciones de opciones se cachean por conjunto, por lo que consultas repetidas solo pagan el coste del estado.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Cambios al barajar opciones | ECE (vs Decima) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Decima-small | 122M | Modelo de decision (late interaction + cross-attention) | 0,0 % | 0,063 / 0,056 | Apache 2.0 | HuggingFace (ONNX int8 + safetensors) |
| Kev-0.5B | 494M | Modelo de decision abierto | 21,9 % | 0,117 | no disponible | checkpoint publico, ejecutado en local por el autor |
| Kev-0.8B | 753M | Modelo de decision abierto | 10,3 % | 0,158 | no disponible | checkpoint publico, ejecutado en local por el autor |
| Laya | 421M | Modelo de decision abierto | 27,2 % | 0,370 | no disponible | checkpoint publico, ejecutado en local por el autor |
| Laya-multilingual | 322M | Modelo de decision abierto | 21,4 % | 0,251 | no disponible | checkpoint publico, ejecutado en local por el autor |

La información disponible no incluye contexto, licencia ni detalles de entrenamiento de Kev ni Laya más allá de los datos de la tabla comparativa de la model card.

## Limitaciones y advertencias

- No es un modelo generativo: no escribe texto, no responde preguntas abiertas, no hace aritmética, no aporta conocimiento del mundo y no resuelve razonamiento multi-paso largo.
- No es fiable para seguridad de tool calling ni de comandos de shell. En las comprobaciones del propio autor, clasificó `rm -rf /var/lib/postgresql/data` como no destructivo con una probabilidad de 0,693.
- Contaminación de evaluación declarada: el modelo se entrenó con los splits de entrenamiento de MASSIVE (51 locales) y de XNLI/MNLI, por lo que las filas marcadas como in-distribution en su tabla de benchmarks no son resultados zero-shot y no deben citarse como tales.
- Las comparaciones con Kev y Laya han sido ejecutadas por el autor del modelo, no por terceros independientes. No hay replicación externa publicada.
- Adopción nula hasta la fecha: 0 descargas y 0 likes, sin validación comunitaria ni informes de uso en producción.
- Calibración: el error ECE de 0,063-0,056 es bajo en términos relativos, pero no es cero; cualquier umbralización en producción debe validarse sobre datos propios.
- Sesgos: no se documenta ningún análisis de sesgos en la información disponible. Al entrenarse sobre MASSIVE y XNLI/MNLI, puede heredar los sesgos de esos corpus, y el reparto de idiomas de esos datasets no es uniforme.
- Idiomas: aunque se declaran 20, el soporte efectivo puede variar; no se publican métricas por idioma individual en la información disponible.
- Longitud de contexto: no disponible, lo que impide dimensionar entradas largas con antelación.
- Licencia Apache 2.0: permite uso comercial y modificación, con las obligaciones habituales de atribución y conservación de avisos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amyrmahdy/decima-small
- Repositorio y paquete: https://github.com/amyrmahdy/decima
- Informe tecnico: https://github.com/amyrmahdy/decima/blob/main/docs/TECHNICAL-REPORT.md
- Documentacion de evaluacion, protocolos y procedencia de datos: https://github.com/amyrmahdy/decima/blob/main/docs/EVAL.md
- Perfil del autor en GitHub: https://github.com/amyrmahdy
- Sitio web del autor: https://amyrmahdy.github.io
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la informacion de HuggingFace y de la model card.
