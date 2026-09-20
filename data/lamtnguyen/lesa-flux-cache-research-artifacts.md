# LamTNguyen/LESA-FLUX-cache-research-artifacts

## Resumen

LESA-FLUX-cache-research-artifacts no es un modelo generativo nuevo, sino un repositorio de artefactos de investigación reproducible publicados por el usuario LamTNguyen en HuggingFace. Contiene checkpoints entrenados, una caché de características de profesor (teacher) de 100x50, manifiestos de prompts y semillas, planificaciones de solver, registros de ejecución, imágenes y métricas de los conjuntos DB50 y DB200, resultados de HPSv2.1, hojas cualitativas y ejecuciones invalidadas conservadas en carpetas de procedencia con nombres explícitos. El material sirve de soporte a dos campañas concretas: una campaña de inferencia sin calentamiento (zero-warmup) sobre FLUX.1-dev en A100 y una reproducción emparejada por datos de LearniBridge-100.

El interés del repositorio es metodológico: documenta cómo reutilizar cachés de características para acelerar la inferencia de un modelo de difusión basado en FLUX.1-dev sin calentamiento previo. Todas las filas de comparación válidas emplean inferencia zero-warmup, con el backbone completo en los pasos `0, N, 2N, ...` y reutilización de caché a partir del paso 1 del solver. Esta convención es relevante porque permite comparar métodos de caching en condiciones homogéneas.

Los pesos originales de FLUX.1-dev no se redistribuyen: deben obtenerse por separado desde `black-forest-labs/FLUX.1-dev` bajo su propia licencia. El repositorio publica la revisión exacta y el SHA256 correspondientes en `ARTIFACT_MANIFEST.json`, lo que facilita la trazabilidad de los experimentos. El tamaño del repositorio es de 149,6 GB y la licencia declarada es `other`, sin idiomas soportados declarados ni métricas de adopción (0 descargas y 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefactos de investigación construidos sobre FLUX.1-dev; no se describe la arquitectura en la información proporcionada) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica / no disponible (modelo de generación de imágenes, no de texto) |
| Tipos de cuantizacion | no disponible para los checkpoints; la caché de características del profesor se almacena en `uint16` (`z_pre.uint16`, `velocity.uint16`) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | checkpoints de PyTorch (`library_name: pytorch`); caché en `uint16`; no disponible el listado completo de formatos |
| Tamaño del repositorio | 149,6 GB |
| Modelo base | FLUX.1-dev (pesos no redistribuidos; obtenerlos en `black-forest-labs/FLUX.1-dev`) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación (según el repositorio) | 2026-09-20 |
| Fecha de actualización (según el repositorio) | 2026-09-20 |
| Etiquetas | pytorch, flux, feature-caching, learnibridge, image-generation, region:us |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de los checkpoints publicados. El repositorio se apoya en FLUX.1-dev como modelo base para la generación de imágenes, e incorpora una técnica de caching de características orientada a reducir el coste computacional de la inferencia. El mecanismo documentado consiste en ejecutar el backbone completo en los pasos `0, N, 2N, ...` del solver y reutilizar la caché de características a partir del paso 1, en un régimen denominado zero-warmup. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO.

El repositorio incluye dos campañas: `a100_zero_warmup` y `learnibridge_100_matched`. La segunda corresponde a una reproducción de LearniBridge-100 emparejada por datos (data-matched), lo que sugiere un control explícito de la correspondencia entre conjuntos de datos para permitir comparaciones justas. También se publica una caché de características de profesor con estructura 100x50, con los tensores `z_pre.uint16` y `velocity.uint16` acompañados de un `manifest.json`. Se conservan además ejecuciones invalidadas en carpetas de procedencia nombradas explícitamente, lo que aporta trazabilidad sobre qué resultados no deben usarse.

## Capacidades

- Generación de imágenes: los artefactos se vinculan a un flujo de trabajo de generación con FLUX.1-dev, aunque los pesos del modelo base no se incluyen.
- Caching de características (feature caching): implementación reproducible de reutilización de caché con la convención zero-warmup (backbone completo en `0, N, 2N, ...`, caché desde el paso 1).
- Reproducibilidad experimental: manifiestos exactos de prompts, semillas y planificaciones de solver.
- Registro de procedencia: `ARTIFACT_MANIFEST.json` con revisión exacta y SHA256 del modelo base, y carpetas de procedencia para ejecuciones invalidadas.
- Evaluación de calidad de imagen: se incluyen resultados de HPSv2.1 y conjuntos de imágenes DB50 y DB200 con sus métricas.
- Entrenamiento de estudiantes o destilación: la caché de profesor (`z_pre`, `velocity`) permite entrenar modelos o aproximaciones que reproduzcan el comportamiento del profesor.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica / no disponible.
- Capacidades especiales: modo *thinking*, visión o audio: no disponible; el ámbito es generación de imágenes y caching de características.

## Casos de uso

- Reproducción de experimentos de aceleración en difusión: un grupo de investigación puede descargar los manifiestos de prompts y semillas y volver a ejecutar la campaña `a100_zero_warmup` con la misma configuración de solver, obteniendo resultados comparables paso a paso.
- Entrenamiento de modelos estudiantes: la caché de profesor de 100x50 (`z_pre.uint16`, `velocity.uint16`) permite entrenar aproximaciones que imiten al backbone completo sin necesidad de ejecutarlo en cada paso, reduciendo el coste de experimentación.
- Comparación metodológica entre técnicas de caching: la reproducción `learnibridge_100_matched` emparejada por datos ofrece una base controlada para contrastar métodos alternativos bajo las mismas condiciones de datos y de warmup.
- Auditoría y verificación de resultados: gracias a `ARTIFACT_MANIFEST.json` (revisión y SHA256 del modelo base) y a las carpetas de procedencia con ejecuciones invalidadas, un revisor puede reconstruir qué se ejecutó y descartar resultados no válidos.
- Evaluación automática de calidad de imagen: los resultados de HPSv2.1 y las métricas de DB50/DB200 permiten incorporar una verificación objetiva en pipelines de investigación que comparen variantes del método.
- Análisis de latencia y coste en GPU de centro de datos: la campaña está diseñada sobre A100, de modo que sirve como referencia para estimar el ahorro de cómputo del caching en entornos con ese tipo de acelerador.
- Docencia y formación técnica: el conjunto de logs, planificaciones y hojas cualitativas puede usarse como material didáctico para explicar cómo funciona la reutilización de caché en modelos de difusión.
- Base para investigación en reducción de pasos de solver: los artefactos permiten estudiar la interacción entre el intervalo `N` de recomputación del backbone y la calidad final medida con HPSv2.1.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El repositorio referencia explícitamente los ficheros donde residen las métricas, pero no incluye sus valores en la model card:

| Evaluación | Conjunto / métrica | Resultado | Ubicación de los datos |
|---|---|---|---|
| Campaña A100 zero-warmup | métricas agregadas de la campaña | no disponible en la información | `campaigns/a100_zero_warmup/results/metrics/summary.json` |
| LearniBridge-100 emparejado | resumen de la reproducción | no disponible en la información | `campaigns/learnibridge_100_matched/results/summary.json` |
| LearniBridge-100 emparejado | tabla de resultados | no disponible en la información | `campaigns/learnibridge_100_matched/results/summary.csv` |
| Calidad de imagen | HPSv2.1 | no disponible en la información (se menciona su existencia) | no disponible |
| Imágenes generadas | DB50 y DB200 | no disponible en la información | carpetas de la campaña correspondiente |
| Evaluación cualitativa | hojas cualitativas | no disponible en la información | carpetas de la campaña correspondiente |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al no redistribuirse los pesos de FLUX.1-dev ni documentarse el uso de memoria, no puede estimarse a partir de la información proporcionada.
- GPU empleada en los experimentos: NVIDIA A100 (la propia campaña se denomina `a100_zero_warmup`).
- GPU recomendadas: no disponible más allá de la A100 citada. No se documentan requisitos para H100, RTX 4090 u otras tarjetas.
- Viabilidad en GPU de consumo: no disponible.
- Almacenamiento: el repositorio ocupa 149,6 GB, por lo que se requiere espacio en disco de ese orden (además de los pesos de FLUX.1-dev obtenidos por separado).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. El único marco declarado es PyTorch.
- Latencia y throughput: no disponibles. El diseño zero-warmup implica que la reutilización de caché comienza en el paso 1 del solver, pero no se publican cifras de aceleración en la información disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación cuantitativa. Como referencia contextual, el único modelo citado es FLUX.1-dev, que actúa como modelo base y cuyos pesos no se redistribuyen en este repositorio:

| Elemento | Tipo | Pesos incluidos | Licencia | Disponibilidad |
|---|---|---|---|---|
| LESA-FLUX-cache-research-artifacts | conjunto de artefactos de investigación (checkpoints, cachés, métricas) | checkpoints del método y caché; no los pesos base | other | HuggingFace |
| FLUX.1-dev | modelo de generación de imágenes (modelo base) | sí, en su propio repositorio | la de `black-forest-labs/FLUX.1-dev` | HuggingFace, por separado |

## Limitaciones y advertencias

- No es un modelo listo para producción: se trata de artefactos de investigación (checkpoints, cachés, métricas, logs) y no de un modelo empaquetado con pipeline declarado.
- Dependencia del modelo base: los pesos de FLUX.1-dev no se redistribuyen; sin ellos los checkpoints publicados no son utilizables de forma directa. La revisión y el SHA256 deben verificarse en `ARTIFACT_MANIFEST.json`.
- Licencia `other`: no se especifican en la información los términos exactos. Es imprescindible revisar la licencia del repositorio y, de forma independiente, la de FLUX.1-dev antes de cualquier uso comercial.
- Ausencia de validación comunitaria: 0 descargas y 0 likes, sin métricas de terceros que respalden los resultados.
- Resultados no verificables numéricamente desde la model card: las métricas y los resultados de HPSv2.1 residen en ficheros internos y no se reproducen en la documentación pública.
- Presencia de ejecuciones invalidadas: se conservan bajo carpetas de procedencia nombradas; es necesario filtrarlas para no mezclarlas con las filas de comparación válidas.
- Cuantización de la caché en `uint16`: puede introducir pérdida de precisión frente a representaciones en coma flotante; no se documenta el error asociado.
- Ámbito restringido: no hay soporte de texto, tool calling, agentes, visión general ni audio; las capacidades multilingües no aplican.
- Consumo de recursos: 149,6 GB de repositorio más los pesos del modelo base, lo que exige infraestructura de almacenamiento considerable.
- Inconsistencia temporal: las marcas de fecha del repositorio (creación y actualización el 2026-09-20) no permiten validar la antigüedad ni el mantenimiento del proyecto con los criterios habituales.
- Cambio de licencia: los usos permitidos dependen de la licencia del modelo base, que puede actualizarse de forma independiente a este repositorio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/LamTNguyen/LESA-FLUX-cache-research-artifacts
- Modelo base FLUX.1-dev (pesos no redistribuidos aquí): https://huggingface.co/black-forest-labs/FLUX.1-dev
- Manifiesto de artefactos con revisión y SHA256: `ARTIFACT_MANIFEST.json` (en la raíz del repositorio)
- Resultados de la campaña A100 zero-warmup: `campaigns/a100_zero_warmup/results/metrics/summary.json`
- Resultados de la reproducción LearniBridge-100: `campaigns/learnibridge_100_matched/results/summary.json` y `campaigns/learnibridge_100_matched/results/summary.csv`
- Caché de características del profesor: `campaigns/a100_zero_warmup/results/teacher_cache/z_pre.uint16`, `campaigns/a100_zero_warmup/results/teacher_cache/velocity.uint16` y `campaigns/a100_zero_warmup/results/teacher_cache/manifest.json`
- Búsqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces recuperados corresponden a hilos de soporte de un servicio de televisión y no guardan relación con el repositorio.
