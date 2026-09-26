# openroboto-ai/pi05-axis-baseline

## Resumen

`openroboto-ai/pi05-axis-baseline` es un checkpoint de inferencia de un modelo visión-lenguaje-acción (VLA) basado en Pi0.5, publicado por el proyecto OpenRoboto. Se trata de un ajuste fino sobre reproducciones renderizadas de los entrenamientos de AXIS, no de un entrenamiento nuevo: el autor indica explícitamente que la release preserva los pesos y los ficheros de normalización del modelo subyacente. El repositorio ocupa 12,4 GB y los pesos están en formato nativo de OpenPI (JAX / Orbax OCDBT), con el directorio `params/` en la raíz.

El modelo resuelve control robótico de manipulación: recibe la imagen RGB `camera0` de la escena, el estado articular nativo de 9 dimensiones y una instrucción de tarea en lenguaje natural, y devuelve objetivos articulares absolutos de 9 dimensiones. Es importante no confundirlo con las salidas relativas de 7 dimensiones sobre efector final típicas del benchmark LIBERO; el contrato de salida aquí es distinto y está documentado en la guía AXIS.

Su relevancia es doble. Por un lado, es un ejemplo de release centrada únicamente en inferencia, con una revisión fijada y verificada (`55f8b28ed021f7ee0bef02cde114a7b5dcae9d5c`), checksums distribuidos y un arnés de evaluación público. Por otro, incluye un resultado histórico de referencia de 448 aciertos sobre 600 episodios (74,67 %) bajo el protocolo `axis_v0.2`, que sirve como línea base reproducible para comparar variantes posteriores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en Pi0.5; detalles de capas, atención y cabezas: no disponibles |
| Parámetros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; los pesos se distribuyen en el formato nativo de OpenPI |
| Idiomas soportados | en (inglés) |
| Licencia | `other` con `license_name: gemma`; se aplican los Gemma Terms of Use, incluida la sección 3.2 |
| Formato de pesos | JAX / Orbax OCDBT (OpenPI), con `params/` en la raíz del repositorio; `norm_stats.json` en JSON |
| Tamaño del repositorio | 12,4 GB |
| Modalidad de entrada | Imagen RGB `camera0`, estado articular nativo de 9D, instrucción de tarea en lenguaje natural |
| Modalidad de salida | Objetivos articulares absolutos de 9D (no acciones relativas de 7D sobre EEF) |
| Configuración de evaluación | `pi05_axis_joint` (arnés OpenRoboto) |
| Estadísticas de normalización | `assets/axis-v0.1-task501-runtime-v1/norm_stats.json` |
| Revisión verificada | `55f8b28ed021f7ee0bef02cde114a7b5dcae9d5c` |
| Integridad | `CHECKSUMS.sha256` con los ficheros de inferencia y licencia distribuidos |
| Uso permitido por diseño | Solo inferencia; no se distribuyen metadatos de la ruta de entrenamiento ni el estado del optimizador |

## Arquitectura y entrenamiento

La model card describe el artefacto como un checkpoint Pi0.5 ajustado (fine-tuning) sobre reproducciones renderizadas de los entrenamientos de AXIS, con pesos nativos de OpenPI en JAX / Orbax OCDBT. No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon etapas de RLHF o DPO. Tampoco se detallan la configuración de capas, el mecanismo de atención ni el esquema de generación de acciones más allá del hecho de que las salidas son objetivos articulares absolutos de 9D y que el estado de entrada es el estado articular nativo de 9D.

Lo que sí está documentado es el contrato de inferencia y la reproducibilidad. El proyecto conserva los pesos y los ficheros de normalización, publica `CHECKSUMS.sha256` y mantiene `LICENSE_GEMMA.txt`, `LICENSE_OPENPI.txt` y `NOTICE`. Los metadatos internos de la ruta de entrenamiento y el estado del optimizador se excluyen de forma deliberada, con el argumento de que no son necesarios para el contrato de inferencia liberado. El preprocesado de imágenes y estados, así como el renderizado de las reproducciones con OSMesa, se documentan en la guía AXIS del repositorio de evaluación.

## Capacidades

- Control robótico de manipulación: genera objetivos articulares absolutos de 9D a partir de una instrucción de tarea y del estado actual.
- Condicionamiento visual: consume la imagen RGB de la cámara `camera0` de la escena como entrada principal de percepción.
- Condicionamiento por lenguaje: acepta instrucciones de tarea en inglés (único idioma declarado en la model card).
- Control continuo con replanificación: el protocolo de evaluación replanifica cada 10 pasos de control a 5 Hz, lo que implica inferencias periódicas dentro de un bucle cerrado.
- Ejecución de tareas multi-paso: el protocolo histórico cubre 30 tareas distintas con escenas fijas y un límite de 120 pasos por episodio.
- Integración con un arnés de evaluación reproducible: configuración `pi05_axis_joint`, benchmarks `axis_v1.0` y `axis_v0.2`, y revisión fijada del evaluador.
- Sin soporte declarado de tool calling, function calling, visión general de propósito abierto, audio ni modo de razonamiento explícito (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Evaluación comparativa de políticas VLA: sirve como línea base reproducible (74,67 % en `axis_v0.2`) contra la que medir variantes posteriores de ajuste fino, usando el mismo arnés, semilla de política y límite de pasos.
- Investigación en manipulación con estado articular completo: al consumir estado de 9D y producir objetivos absolutos de 9D, encaja en plataformas cuyo controlador espera consignas articulares en lugar de deltas de efector final.
- Replicación de resultados en laboratorio: la revisión verificada y los `CHECKSUMS.sha256` permiten reconstruir exactamente el artefacto evaluado y auditar diferencias entre ejecuciones.
- Prototipado de políticas condicionadas por lenguaje en inglés: el modelo acepta una instrucción textual por episodio, lo que facilita barrer variantes de enunciado sobre una misma escena fija.
- Desarrollo de infraestructura de inferencia VLA: el formato Orbax OCDBT y los ficheros de normalización asociados permiten construir y validar servidores de inferencia para modelos de la familia OpenPI antes de invertir en entrenamiento propio.
- Docencia y divulgación técnica: el tamaño del repositorio (12,4 GB) y la disponibilidad de un arnés público lo hacen abordable para demostrar un pipeline completo de VLA en un curso de robótica, siempre que se cumplan los términos de la licencia Gemma.
- Validación de guards de seguridad en robótica: al ser un checkpoint de solo inferencia con salidas articulares absolutas, resulta útil para probar capas de limitación de par, velocidad y rango antes de desplegar políticas en hardware real.

## Benchmarks y rendimiento

| Protocolo | Tareas | Ensayos | Aciertos | Tasa de éxito | Condiciones |
|---|---|---|---|---|---|
| `axis_v0.2` (histórico) | 30 | 20 por tarea (600 totales) | 448 | 74,67 % | Escenas de tareas de entrenamiento, semilla de política 20260907, límite de 120 pasos, replanificación cada 10 controles, control a 5 Hz |
| `axis_v1.0` | no disponible | no disponible | no disponible | no disponible | El repositorio solo proporciona el comando de evaluación; no publica resultados |

Advertencia del propio autor: el resultado histórico se obtuvo sobre escenas empleadas en el entrenamiento, por lo que no constituye una medida de generalización a escenas no vistas ni una evaluación nueva del protocolo *competition-6*. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de lenguaje en la información disponible, y en cualquier caso no serían representativos para un modelo de control robótico.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio contiene 12,4 GB de pesos, por lo que se necesita al menos ese orden de magnitud de memoria para cargarlos sin conversión; el requerimiento real depende de la precisión de cómputo y del batching, y no está documentado.
- GPU recomendadas: no disponible. El comando de ejemplo del autor acepta `--gpus 0`, lo que indica que la evaluación funciona con GPU seleccionables por índice, pero no especifica modelo ni VRAM mínima.
- GPU de consumo: no confirmado. No hay declaración del autor sobre si el checkpoint cabe en una GPU de gama de consumo; dado el tamaño de los pesos, una GPU con 24 GB de VRAM es el mínimo razonable a considerar, pero debe verificarse empíricamente.
- Opciones de despliegue: el único camino documentado es el arnés público OpenRoboto con la configuración `pi05_axis_joint`. Los pesos son nativos de OpenPI (JAX / Orbax OCDBT), por lo que los runners habituales de GGUF (llama.cpp, Ollama) no son aplicables sin una conversión no documentada; soporte de vLLM o TGI: no disponible.
- Dependencias de sistema: el renderizado de reproducciones de entrenamiento requiere OSMesa y el almacenamiento en caché previo de los recursos de escena antes de cualquier evaluación offline.
- Latencia y throughput: no se publican cifras de latencia ni de tokens por segundo. La única referencia temporal es la del protocolo de evaluación: control a 5 Hz con replanificación cada 10 controles, lo que fija un presupuesto de aproximadamente 2 segundos por inferencia en el bucle de control de esa configuración.

## Comparativa con modelos similares

No se incluyen datos comparativos en la información proporcionada. La tabla siguiente se limita a lo que puede afirmarse a partir de la ficha y de la categoría del modelo; los huecos se marcan como no disponibles en lugar de estimarse.

| Modelo | Parámetros | Salidas de acción | Licencia | Disponibilidad |
|---|---|---|---|---|
| `openroboto-ai/pi05-axis-baseline` | no disponible | 9D articulares absolutas | Gemma Terms of Use (`other`) | HuggingFace, 12,4 GB, revisión verificada |
| Pi0.5 upstream (familia OpenPI) | no disponible | no disponible | no disponible | Referenciado por la model card como origen del ajuste fino |
| Otros VLA de manipulación de la misma categoría | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la información disponible comparaciones directas de exactitud, tasa de éxito ni coste de inferencia frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Uso restringido a inferencia: el autor indica explícitamente que no es un entrenamiento nuevo y que no se distribuyen metadatos de la ruta de entrenamiento ni el estado del optimizador.
- El resultado del 74,67 % procede de escenas de tareas de entrenamiento y de un protocolo anterior (`axis_v0.2`). No es una puntuación de generalización a escenas no vistas ni una evaluación nueva del protocolo *competition-6*, y no debe citarse como tal.
- Cero descargas y cero «likes» en el momento de la consulta: el artefacto no tiene validación comunitaria independiente registrada.
- Idioma único declarado: inglés. El rendimiento en instrucciones en castellano u otras lenguas no está documentado.
- Contrato de salida específico: objetivos articulares absolutos de 9D. Reutilizar el modelo con pipelines que esperan acciones relativas de 7D sobre efector final (por ejemplo, LIBERO) requiere adaptación y no está soportado de forma directa.
- Normalización obligatoria: hay que usar las estadísticas en `assets/axis-v0.1-task501-runtime-v1/norm_stats.json`; omitirlas o sustituirlas invalida el contrato de inferencia documentado.
- Dependencia de recursos de escena en caché y de OSMesa para el renderizado: sin ese paso previo, la evaluación offline no funciona.
- Licencia: se aplican los Gemma Terms of Use, incluida la sección 3.2, a este modelo y a sus derivados. Cualquier uso comercial debe revisarse contra esos términos y contra `LICENSE_OPENPI.txt` y `NOTICE`.
- Riesgo de alucinación y sesgos: no hay evaluación publicada de sesgos ni de comportamiento ante instrucciones ambiguas o fuera de distribución; en robótica esto se traduce directamente en riesgo físico, por lo que se recomienda validar con límites de par, velocidad y rango antes de cualquier despliegue en hardware.
- Reproducibilidad sujeta a versiones: el comando de evaluación exige fijar el evaluador al commit `2f69d117517f8b388d2d01a94964df63f1b6620e` y el modelo a la revisión `55f8b28ed021f7ee0bef02cde114a7b5dcae9d5c`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/openroboto-ai/pi05-axis-baseline
- Licencia Gemma aplicada: https://huggingface.co/openroboto-ai/pi05-axis-baseline/blob/main/LICENSE_GEMMA.txt
- Arnés de evaluación OpenRoboto: https://github.com/openroboto-ai/openroboto-evaluation
- Guía AXIS (instalación, transformaciones de imagen y estado, renderizado de reproducciones con OSMesa): https://github.com/openroboto-ai/openroboto-evaluation/blob/2f69d117517f8b388d2d01a94964df63f1b6620e/docs/axis.md
- Revisión verificada del modelo citada en la model card: https://huggingface.co/openroboto-ai/pi05-axis-baseline/tree/55f8b28ed021f7ee0bef02cde114a7b5dcae9d5c
- Estadísticas de normalización: `assets/axis-v0.1-task501-runtime-v1/norm_stats.json` (dentro del repositorio del modelo)
- Paper o informe técnico del modelo: no disponible
- Demo o espacio interactivo: no disponible
