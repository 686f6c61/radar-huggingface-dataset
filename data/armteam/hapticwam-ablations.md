# armteam/hapticwam-ablations

## Resumen

HapticWAM ablations es un repositorio de artefactos de investigación publicado por el equipo `armteam` en Hugging Face. No contiene un modelo desplegado, sino el conjunto completo de brazos de entrenamiento que no forman parte del profesor desplegado, del estudiante desplegado ni de las líneas base principales, junto con los barridos de evaluación completos de todos ellos. El dominio declarado es la robótica, con etiquetas específicas de manipulación y percepción táctil.

El repositorio ocupa 20,8 GB y se distribuye bajo licencia Apache-2.0, con pesos en formato PyTorch y etiquetado adicional como safetensors. Se organiza en cuatro bloques: brazos de profesor (`teacher_v5_ftA`, `teacher_v6_ftA`, `teacher_v6_ft_video1p0`, `teacher_v6_simft_multitask`), brazos de estudiante y controles (`hid_mt`, `hid_2k_ftA`, `hid_r2_ftA`, `hid_v6_r2`, `ctrl_v6`, `ctl_ftA_2k`), brazos comparativos externos (`cosmos_nodistill_v1`, `cosmos_visiononly_v1`, `pi05_phantom_expert_v1_resume60k`) y seis carpetas de evaluación con 86 ficheros JSON y logs en total.

Su relevancia es de trazabilidad metodológica: el autor declara explícitamente que el repositorio existe para que cada número de las tablas offline tenga un checkpoint detrás. Incluye una ablación de la ponderación de la pérdida de vídeo del modelo de mundo, un control sin destilación emparejado por pasos y un fichero `index.jsonl` con tamaño, sha256 en LFS y ruta de origen de cada fichero, lo que permite auditar la procedencia de cada artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; se mencionan pérdida de vídeo de un modelo de mundo, destilación profesor-estudiante y evaluaciones a NFE 1 y NFE 5) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el pipeline declarado es `robotics`, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`, según los nombres de fichero como `teacher_001200.pt`); el repositorio está etiquetado además con `safetensors` |
| Tipo de artefacto | repositorio de checkpoints y resultados de ablación, no un modelo desplegable |
| Pipeline | `robotics` |
| Tamano del repositorio | 20,8 GB |
| Numero de carpetas de evaluacion | 6 (`eval_r2` 40 ficheros, `eval_mt` 16, `eval_v6` 14, `eval_abl` 8, `eval_0906` 6, `eval4` 2) |
| Indice de ficheros | `index.jsonl`, con tamano, sha256 en LFS y ruta de origen de cada fichero |
| Descargas / likes | 0 / 0 |
| Creado | 2026-09-19 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La model card no especifica el tipo de arquitectura, el número de parámetros, la composición del dataset ni el número de tokens de entrenamiento. Lo que sí se deduce del texto es la existencia de un esquema de destilación profesor-estudiante (los brazos `hid_*` se describen como estudiantes destilados de profesores concretos), de una pérdida de vídeo asociada a un modelo de mundo (el brazo `teacher_v6_ft_video1p0` es "v6 with the video loss weighted 1.0") y de evaluaciones realizadas a distintos valores de NFE (número de evaluaciones de función), concretamente NFE 1 y NFE 5 para el profesor v6; la model card no detalla el esquema de muestreo ni la función de pérdida completa.

El diseño experimental sí está documentado con precisión. El repositorio incluye un control sin destilación (`ctrl_v6`, `teacher_001200.pt`) y, de forma destacable, un control emparejado por pasos (`ctl_ftA_2k`, `teacher_002000.pt`), entrenado sin destilación durante los mismos 2.000 pasos que el profesor desplegado, de modo que la comparación aísla el efecto de la destilación del efecto de la longitud de entrenamiento. También se incluyen brazos comparativos basados en Cosmos (con y sin destilación, y una variante solo visión) y un experto pi0.5 reanudado hasta 60.000 pasos. El autor advierte de que `hid_2k_ftA` y `hid_r2_ftA` comparten linaje, tamaños y nombre de log, y que deben tratarse como un único brazo hasta que se resuelva la ambigüedad.

## Capacidades

- Entrenamiento y evaluación de políticas de manipulación robótica en el dominio táctil, según las etiquetas `robotics`, `tactile` y `manipulation`.
- Soporte de experimentos de destilación profesor-estudiante: los brazos `hid_*` son estudiantes destilados y los `teacher_*` sus profesores.
- Ablación de la ponderación de la pérdida de vídeo del modelo de mundo (`teacher_v6_ft_video1p0`, pesos 1.0, pasos 500–2000, evaluado a NFE 1).
- Comparación con brazos basados en Cosmos, incluida una variante solo visión (`cosmos_visiononly_v1`) y otra sin destilación (`cosmos_nodistill_v1`).
- Reanudación de un experto pi0.5 hasta 60.000 pasos (`pi05_phantom_expert_v1_resume60k`, 7,47 GB).
- Evaluación a múltiples valores de NFE, lo que permite estudiar el compromiso entre coste de muestreo y calidad.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes, multilingüismo ni modo de pensamiento. No hay información sobre ventana de contexto ni sobre idiomas.

## Casos de uso

- Reproducción de tablas offline en artículos: cada fila numérica de las tablas del proyecto tiene un checkpoint asociado en este repositorio, lo que permite volver a ejecutar la evaluación y verificar la cifra publicada.
- Auditoría de procedencia de artefactos: el fichero `index.jsonl` registra tamaño, sha256 en LFS y ruta de origen de cada fichero, de modo que un revisor externo puede rastrear de dónde salió cada peso.
- Aislamiento del efecto de la destilación: el control `ctl_ftA_2k` está emparejado por pasos (2.000) con el profesor desplegado, lo que permite cuantificar la contribución de la destilación sin contaminarla con diferencias de duración de entrenamiento.
- Estudio de la ponderación de la pérdida de vídeo: el brazo `teacher_v6_ft_video1p0` con peso 1.0 y sus evaluaciones en `eval_abl/` permiten analizar qué aporta la componente de modelo de mundo al rendimiento final.
- Comparación con políticas externas: los brazos Cosmos (`cosmos_nodistill_v1`, `cosmos_visiononly_v1`) y el experto pi0.5 reanudado sirven como referencia para situar la línea propia frente a alternativas de terceros.
- Análisis del compromiso entre coste y calidad de muestreo: las evaluaciones a NFE 1 y NFE 5 del profesor v6 permiten estimar cuánto se pierde al reducir el número de evaluaciones de función.
- Docencia y formación en robótica: el conjunto de 86 ficheros de evaluación con sus logs asociados es material didáctico para explicar cómo se diseña un barrido de ablaciones con controles emparejados.
- Trazabilidad histórica del proyecto: el repositorio conserva rondas intermedias de destilación que ya no se despliegan, útiles para reconstruir la evolución del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card describe carpetas de evaluación y la cobertura de cada barrido, pero no reproduce las cifras. Se indica a continuación qué cubre cada barrido, sin valores:

| Carpeta de evaluacion | Ficheros | Cobertura declarada |
|---|---|---|
| `eval_r2/` | 40 | Todos los escalones de estudiante de ronda 2: `2k_student_*`, `r2_student_*`, `v6r2_student_*`, `nowrist_student_*`, `nowrist_cont_student_*`; JSON más log en cada uno |
| `eval_mt/` | 16 | `hid_mt_student_*` y `hid_simft_student_*` en pasos 250–1000 |
| `eval_v6/` | 14 | `v6_student_student_*` en pasos 500–2000, `v6_control` y el profesor v6 a NFE 1 y NFE 5 |
| `eval_abl/` | 8 | `teacher_v6_ft_video1p0` en pasos 500–2000, NFE 1 |
| `eval_0906/` | 6 | Comparativas ftA y v5.6 del 2026-09-06 |
| `eval4/` | 2 | Profesores ftA y v6_ftA a NFE 1 |

Se mencionan además ficheros de puntuación concretos sin cifras: `eval_baselines/B_nodistill_nfe1.json` puntúa `cosmos_nodistill_v1`, `eval_baselines/A_visiononly_nfe1.json` puntúa `cosmos_visiononly_v1` y `eval_pi05/eval_resume_*.json` puntúa el experto pi0.5 reanudado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, porque no se publican el número de parámetros ni la precisión de almacenamiento. Como referencia orientativa derivada del tamaño de los ficheros (no confirmada por el autor): los brazos pequeños pesan 0,37–0,39 GB (`ctrl_v6`, `ctl_ftA_2k`, `cosmos_*`), los brazos de estudiante 1,49 GB y los de profesor intermedios 1,57 GB, el profesor `teacher_v5_ftA` 2,36 GB y el experto pi0.5 7,47 GB.
- GPU recomendadas: no especificadas por el autor. Por el rango de tamaño de checkpoint, los brazos de menos de 2,5 GB son candidatos razonables a ejecutarse en GPU de consumo con 12–24 GB de VRAM; el brazo de 7,47 GB requiere como mínimo una GPU de 24 GB y, para barridos en paralelo o lotes grandes, se recomienda una A100 o una H100. Esta recomendación es una estimación, no un dato publicado.
- Cabe en GPU de consumo: probablemente sí para los brazos de hasta 2,36 GB (por ejemplo, RTX 3060 de 12 GB, RTX 4070/4080/4090); no confirmado por el autor.
- Opciones de despliegue: PyTorch como biblioteca declarada; el repositorio está etiquetado también con `safetensors`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y en principio no son aplicables porque no es un modelo de lenguaje. La model card tampoco publica el código del arnés de entrenamiento o evaluación, solo los checkpoints, los logs y los JSON de resultados.
- Latencia y throughput estimados: no disponible. La única referencia al coste computacional es la distinción entre evaluaciones a NFE 1 y NFE 5, que implica un régimen de muestreo cuyo coste escala con el número de evaluaciones de función; no se publican tiempos absolutos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de arquitectura que permitan comparar este repositorio con alternativas de la misma categoría. La comparación viable es entre repositorios hermanos del mismo proyecto:

| Repositorio | Rol | Contenido | Desplegado en el banco de pruebas | Licencia |
|---|---|---|---|---|
| `armteam/hapticwam-ablations` | Artefactos de ablación y ejecuciones de soporte | Brazos no desplegados, controles y barridos de evaluación completos (canónico según el autor) | No | Apache-2.0 |
| `armteam/hapticwam-teacher` | Profesor desplegado | Checkpoints desplegados más una copia parcial de las evaluaciones que los puntúan | Sí | no disponible en la información proporcionada |
| `armteam/hapticwam-student` | Estudiante desplegado | Checkpoints desplegados más una copia parcial de las evaluaciones que los puntúan | Sí | no disponible en la información proporcionada |
| `armteam/hapticwam-baselines` | Líneas base principales | Líneas base destacadas; contiene el brazo pi0.5 desplegado (paso 20.000) | Sí | no disponible en la información proporcionada |
| `armteam/phantom-checkpoints` | Repositorio histórico | Rondas obsoletas: rondas de destilación 0 y 1, profesores v2/v3/v4, controles de ronda 0 y barrido de sonda v5 | No | no disponible en la información proporcionada |

Sobre alternativas externas, el repositorio incluye artefactos derivados de Cosmos y un experto pi0.5, lo que indica que el proyecto los considera comparables, pero no se aportan cifras que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio no contiene modelos desplegables: el propio autor indica que "nothing here is deployed on the rig". Ningún resultado procedente de estos checkpoints debe presentarse como rendimiento del sistema en producción.
- Ambigüedad documentada entre brazos: `hid_2k_ftA` e `hid_r2_ftA` comparten linaje, tamaños y nombre de log, y el autor recomienda tratarlos como un único brazo hasta resolverlo. Cualquier análisis que los cuente por separado es inseguro.
- Procedencia singular de un artefacto: `ctl_ftA_2k` no se copió de otro repositorio de Hugging Face, sino que existía únicamente en una máquina del laboratorio. Su fila en `index.jsonl` registra una ruta de sistema de ficheros en lugar de una ruta del hub, lo que debilita su verificabilidad externa.
- Cobertura incompleta por diseño: faltan las rondas obsoletas (rondas de destilación 0 y 1, profesores v2/v3/v4, controles de ronda 0 y el barrido de sonda v5), que quedaron en `armteam/phantom-checkpoints`. No se puede reconstruir la historia completa desde este repositorio.
- Posible divergencia entre copias: los repositorios `-teacher`, `-student` y `-baselines` llevan copias parciales de los barridos. El autor indica que, en caso de discrepancia futura, la fuente fiable es este repositorio, lo que implica que las copias pueden quedar desincronizadas.
- Sin resultados numéricos publicados: la model card referencia tablas offline y ficheros JSON de puntuación, pero no incluye las cifras. No es posible evaluar el rendimiento real sin descargar y ejecutar las evaluaciones.
- Arquitectura, parámetros, contexto, idiomas y cuantizaciones no documentados. No hay información sobre sesgos, riesgo de alucinación ni comportamiento fuera de distribución, conceptos que además no aplican directamente a un artefacto de política robótica.
- Riesgo de licencias de terceros: aunque el repositorio se declara Apache-2.0, contiene brazos derivados de Cosmos y un experto pi0.5 cuyas licencias originales no se detallan en la model card. Antes de un uso comercial conviene verificar los términos aplicables a esos componentes.
- Idiomas: al ser un artefacto de robótica no se declara soporte lingüístico alguno; no debe asumirse capacidad multilingüe.
- Fechas de metadatos: la creación y la última actualización figuran como 2026-09-19 y 2026-09-20 respectivamente. Se reproducen tal cual aparecen en la información proporcionada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de terceros.

## Enlaces

- Repositorio principal: https://huggingface.co/armteam/hapticwam-ablations
- Profesor desplegado: https://huggingface.co/armteam/hapticwam-teacher
- Estudiante desplegado: https://huggingface.co/armteam/hapticwam-student
- Líneas base principales: https://huggingface.co/armteam/hapticwam-baselines
- Repositorio histórico de rondas obsoletas, citado en la model card: `armteam/phantom-checkpoints` (la model card lo menciona por nombre; no se ha proporcionado su URL completa)
- Índice de ficheros del repositorio: `index.jsonl` (tamaño, sha256 en LFS y ruta de origen de cada fichero)
- Resultados de puntuación citados sin URL: `eval_baselines/B_nodistill_nfe1.json`, `eval_baselines/A_visiononly_nfe1.json`, `eval_pi05/eval_resume_*.json`
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo, su proyecto ni su equipo; los resultados obtenidos trataban sobre las islas Malvinas y no guardan relación con el contenido de esta ficha. No se dispone por tanto de paper, blog, repositorio de código ni demo adicionales.
