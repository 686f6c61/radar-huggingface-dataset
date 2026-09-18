# LeiGong/vlm_3d_tracking_annotator_opensource_checkpoints

## Resumen

`LeiGong/vlm_3d_tracking_annotator_opensource_checkpoints` no es un modelo individual, sino un repositorio espejo (mirror) que agrupa 16 snapshots de checkpoints vision-lenguaje de distintos proveedores, copiados byte a byte desde sus repositorios originales en Hugging Face en la revision concreta que se utilizo para evaluar. El repositorio pertenece al usuario LeiGong y da soporte al pipeline `open_source_vlm_test` del proyecto https://github.com/XuweiyiChen/vlm_3d_tracking_annotator, en la rama `lei/open-source-vlm-eval`, cuyo objetivo es anotar y seguir puntos en 3D sobre video.

La utilidad del repositorio es de trazabilidad: los repositorios originales pueden actualizarse, cambiar de licencia o retirarse, mientras que este espejo fija las revisiones evaluadas. Incluye familias muy dispares en tamano y arquitectura, desde `Qwen3.5-0.8B` (1,6 GB) hasta `InternVL3-38B-AWQ` (28,5 GB), junto con variantes cuantizadas en FP8 y AWQ, lo que permite comparar modelos pequenos, medianos y grandes bajo las mismas condiciones de evaluacion. El repositorio completo ocupa 304,8 GB.

Cada carpeta conserva su LICENSE y sus terminos originales, por lo que la licencia del conjunto es heterogenea (`mixed-upstream-licenses`). El pipeline declarado es `image-text-to-text` y el formato de pesos es safetensors. No hay informacion sobre idiomas soportados, benchmarks publicados ni detalles de entrenamiento de los checkpoints espejados dentro de esta ficha.

## Especificaciones tecnicas

Los valores de esta tabla corresponden al repositorio espejo en su conjunto. Al agrupar 16 modelos distintos, varios parametros no tienen un valor unico.

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (coleccion heterogenea; cada subcarpeta corresponde a una arquitectura distinta de su proveedor de origen) |
| Parametros totales | variable por subcarpeta: 0,8B, 1B, 2B, 4B, 8B, 9B, 14B, 27B, 31B y 38B segun el nombre del checkpoint |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 sin cuantizar en la mayoria de carpetas; FP8 (`Qwen3.5-27B-FP8`, `Qwen3.8-27B-FP8`, `gemma-4-31B-it-FP8-dynamic`) y AWQ de 4 bits (`InternVL3-38B-AWQ`) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | `other` / `mixed-upstream-licenses`; se aplica sin cambios la licencia de cada repositorio de origen, incluida en cada carpeta |
| Formato de pesos | safetensors |
| Tamano del repositorio | 304,8 GB |
| Pipeline declarado | image-text-to-text |
| Etiquetas | safetensors, mirror, vision-language, point-tracking, tap-vid-davis |
| Fecha de creacion | 2026-09-18 |
| Ultima actualizacion | 2026-09-18 |
| Descargas / likes | 0 / 0 |

Contenido del espejo, con la revision upstream fijada:

| Carpeta | Repositorio de origen | Commit upstream | Tamano |
|---|---|---|---|
| `OpenGVLab--InternVL3-14B-hf/` | OpenGVLab/InternVL3-14B-hf | `e22931943e53` | 28,2 GB |
| `OpenGVLab--InternVL3-1B-hf/` | OpenGVLab/InternVL3-1B-hf | `014c0583a0d4` | 1,8 GB |
| `OpenGVLab--InternVL3-2B-hf/` | OpenGVLab/InternVL3-2B-hf | `cb57a075cb75` | 3,9 GB |
| `OpenGVLab--InternVL3-38B-AWQ/` | OpenGVLab/InternVL3-38B-AWQ | `beec2dad850e` | 28,5 GB |
| `OpenGVLab--InternVL3-8B-hf/` | OpenGVLab/InternVL3-8B-hf | `259a3b64a146` | 14,8 GB |
| `OpenGVLab--InternVL3-9B/` | OpenGVLab/InternVL3-9B | `5f618513e35a` | 17,0 GB |
| `Qwen--Qwen3.5-0.8B/` | Qwen/Qwen3.5-0.8B | `2fc06364715b` | 1,6 GB |
| `Qwen--Qwen3.5-27B-FP8/` | Qwen/Qwen3.5-27B-FP8 | `97f5941bf617` | 28,8 GB |
| `Qwen--Qwen3.5-2B/` | Qwen/Qwen3.5-2B | `15852e8c1636` | 4,3 GB |
| `Qwen--Qwen3.5-4B/` | Qwen/Qwen3.5-4B | `851bf6e806ef` | 8,7 GB |
| `Qwen--Qwen3.5-9B/` | Qwen/Qwen3.5-9B | `c20223623576` | 18,0 GB |
| `Qwen--Qwen3.8-27B-FP8/` | Qwen/Qwen3.8-27B-FP8 | `017b9c7af6b5` | 28,8 GB |
| `RedHatAI--gemma-4-31B-it-FP8-dynamic/` | RedHatAI/gemma-4-31B-it-FP8-dynamic | `d4ab4f579dd3` | 31,0 GB |
| `allenai--MolmoPoint-8B/` | allenai/MolmoPoint-8B | `188130f961c8` | 32,4 GB |
| `deepseek-ai--deepseek-vl2-small/` | deepseek-ai/deepseek-vl2-small | `6033e16432a1` | 30,1 GB |
| `deepseek-ai--deepseek-vl2-tiny/` | deepseek-ai/deepseek-vl2-tiny | `66c54660eae7` | 6,3 GB |

## Arquitectura y entrenamiento

No hay informacion en la documentacion proporcionada sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens o las tecnicas de alineacion (RLHF, DPO) de los checkpoints espejados. El repositorio no entrena ni modifica ningun modelo: se limita a copiar snapshots. Cualquier dato de arquitectura debe consultarse en el repositorio upstream correspondiente, que sigue siendo la fuente canonica.

Lo unico que puede deducirse del listado de carpetas es la composicion del conjunto evaluado: una mayoria de modelos de la familia InternVL3 de OpenGVLab (1B, 2B, 8B, 9B, 14B y 38B en AWQ), varios modelos de la familia Qwen3.5 (0.8B, 2B, 4B, 9B y 27B en FP8) mas un Qwen3.8-27B en FP8, un Gemma-4-31B-it en FP8 dinamico de RedHatAI, MolmoPoint-8B de AllenAI y dos variantes de DeepSeek-VL2 (tiny y small). La presencia de una carpeta especifica de point-tracking (`allenai--MolmoPoint-8B`) y de la etiqueta `tap-vid-davis` indica que el caso de evaluacion principal es el seguimiento de puntos en video sobre los conjuntos de referencia TAP-Vid y DAVIS.

El proyecto que origina el espejo, `vlm_3d_tracking_annotator`, tiene como finalidad usar modelos vision-lenguaje para anotar trayectorias de puntos en 3D sobre secuencias de video, una tarea auxiliar para generar datos de entrenamiento y evaluacion en vision por computador. El espejo garantiza que la comparativa entre los 16 checkpoints sea reproducible en el tiempo.

## Capacidades

Las capacidades concretas dependen de cada checkpoint espejado y no estan documentadas en este repositorio. A partir de las etiquetas y del pipeline declarado, las capacidades compartidas del conjunto son:

- Procesamiento conjunto de imagen y texto (`image-text-to-text`), con entrada de imagenes o fotogramas acompanados de instrucciones en lenguaje natural.
- Seguimiento de puntos en video (`point-tracking`), orientado al seguimiento de ubicaciones concretas a lo largo de fotogramas.
- Evaluacion sobre los conjuntos de referencia de la etiqueta `tap-vid-davis` (TAP-Vid y DAVIS) para tareas de tracking denso.
- Salida de texto que describe o localiza elementos visuales, util como capa de anotacion automatica.
- Soporte de tool calling, function calling, modo de razonamiento explicito o capacidades multimodales adicionales (audio, video nativo): no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible en la informacion proporcionada.
- Compatibilidad de carga con `transformers` y con `vllm serve`, segun indica la propia model card.

## Casos de uso

- Anotacion de trayectorias de puntos sobre video: el caso de uso central del proyecto de origen. Se toma un fotograma con puntos marcados y el modelo genera o valida la posicion de esos puntos en fotogramas sucesivos, reduciendo el trabajo manual de anotacion en conjuntos tipo DAVIS.
- Construccion de datasets de tracking para entrenamiento: las anotaciones generadas con estos modelos pueden usarse como preetiquetado que despues se revisa y corrige, lo que acelera la creacion de corpus de tracking 3D de gran volumen.
- Evaluacion comparativa reproducible de modelos vision-lenguaje: al fijar los commits upstream, se puede repetir la misma bateria de pruebas sobre los 16 checkpoints y comparar resultados sin que una actualizacion silenciosa del modelo de origen invalide la comparativa.
- Rotoscopia y postproduccion de video: seguimiento de puntos y regiones sobre planos para tareas de seguimiento de movimiento, estabilizacion o integracion de elementos graficos, usando los checkpoints mayores (14B, 27B, 31B o 38B) cuando se requiere mas precision.
- Robotica y manipulacion: seguimiento de puntos de referencia en escenas captadas por camara para estimar el movimiento de objetos; los modelos pequenos (1B, 2B, 4B) permiten ejecucion en hardware embarcado o en una sola GPU de gama media.
- Analisis de video deportivo o biomecanico: extraccion de trayectorias de articulaciones y objetos a lo largo de una secuencia para calcular velocidades, desplazamientos o patrones de movimiento.
- Investigacion en grounding lenguaje-video: uso de los checkpoints para estudiar como distintos tamanos de modelo resuelven instrucciones que referencian objetos concretos en el espacio visual.
- Despliegue en pipelines de anotacion con recursos limitados: las variantes cuantizadas (`InternVL3-38B-AWQ`, `Qwen3.5-27B-FP8`, `gemma-4-31B-it-FP8-dynamic`) permiten servir modelos grandes en GPUs de 24 a 48 GB en lugar de requerir nodos de 80 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas especificas de TAP-Vid o DAVIS, y los resultados de busqueda web disponibles no contienen datos tecnicos del repositorio. Cualquier cifra de rendimiento debe obtenerse ejecutando el pipeline `open_source_vlm_test` del repositorio de GitHub asociado o consultando los repositorios upstream de cada checkpoint.

## Requisitos de hardware

Estimaciones basadas en el tamano de cada snapshot y en la correspondencia habitual entre parametros y precision de pesos. No son datos medidos.

- Modelos muy pequenos (1B y 0,8B, carpetas de 1,6 a 1,8 GB): inferencia en BF16 con menos de 4 GB de VRAM; caben comodamente en GPUs consumer de 8 GB o incluso en CPU con llama.cpp si se convirtieran a GGUF (no se incluye GGUF en el repositorio).
- Modelos de 2B y 4B (3,9 GB y 8,7 GB): aproximadamente 5-10 GB de VRAM en BF16; viables en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090.
- Modelos de 8B y 9B (14,8 GB, 17,0 GB y 18,0 GB): entorno a 16-20 GB de VRAM en BF16; encajan en RTX 4090 de 24 GB, L4 o A10G, y con cuantizacion de 4 bits en GPUs de 8-12 GB.
- MolmoPoint-8B (32,4 GB): snapshot considerablemente mayor que su numero de parametros, por el codificador visual y los ficheros adicionales; requiere en la practica 40-48 GB o cuantizacion agresiva.
- InternVL3-14B-hf (28,2 GB): aproximadamente 28 GB en BF16; recomendable A100 40 GB, L40S 48 GB o dos RTX 4090.
- DeepSeek-VL2-tiny (6,3 GB) y DeepSeek-VL2-small (30,1 GB): el primero cabe en GPUs consumer de 12 GB; el segundo requiere 40-80 GB o cuantizacion.
- Variantes FP8 (`Qwen3.5-27B-FP8`, `Qwen3.8-27B-FP8`, `gemma-4-31B-it-FP8-dynamic`, 28,8-31,0 GB): pensadas para H100, H200, L40S y GPUs Ada/Hopper con soporte nativo de FP8; tambien pueden cargarse en A100 con rendimiento menor.
- InternVL3-38B-AWQ (28,5 GB): cuantizacion de 4 bits, por lo que puede servirse en una sola GPU de 40 GB (A100 40 GB) o en RTX 4090 de 24 GB con margen ajustado.
- Opciones de despliegue declaradas: `vllm serve` apuntando al subdirectorio local y carga con `transformers`; la descarga selectiva se hace con `huggingface_hub.snapshot_download(repo_id, allow_patterns=['<carpeta>/*'])`. No se mencionan Ollama, TGI ni llama.cpp, ni se incluyen pesos GGUF.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera de la GPU, la cuantizacion y la resolucion de los fotogramas de entrada.
- Almacenamiento: 304,8 GB si se descarga el repositorio completo; conviene descargar solo la carpeta necesaria mediante `allow_patterns`.

## Comparativa con modelos similares

Este repositorio no es comparable como modelo unico, ya que contiene 16 modelos. La comparativa relevante es entre las familias incluidas, tomando el checkpoint de mayor difusion de cada una. Los datos de contexto, licencia y benchmarks por familia no estan disponibles en la informacion proporcionada.

| Familia incluida | Checkpoints en el espejo | Rango de parametros | Tamano en disco | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| InternVL3 (OpenGVLab) | 6 | 1B a 38B | 1,8 a 28,5 GB | BF16 y AWQ 4 bits | no disponible en la informacion proporcionada | espejo en este repo; origen en OpenGVLab |
| Qwen3.5 / Qwen3.8 (Qwen) | 6 | 0,8B a 27B | 1,6 a 28,8 GB | BF16 y FP8 | no disponible en la informacion proporcionada | espejo en este repo; origen en Qwen |
| Gemma 4 (RedHatAI, FP8 dinamico) | 1 | 31B | 31,0 GB | FP8 dinamico | no disponible en la informacion proporcionada | espejo en este repo; origen en RedHatAI |
| MolmoPoint (AllenAI) | 1 | 8B | 32,4 GB | BF16 | no disponible en la informacion proporcionada | espejo en este repo; origen en allenai |
| DeepSeek-VL2 | 2 | tiny y small | 6,3 y 30,1 GB | BF16 | no disponible en la informacion proporcionada | espejo en este repo; origen en deepseek-ai |
| Alternativa de categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Como referencia de categoria, el espejo cubre el segmento de modelos vision-lenguaje de 1B a 38B parametros con soporte de imagen-texto, que es el mismo nicho que ocupan los modelos citados anteriormente en sus repositorios originales. Para una comparativa de rendimiento real habria que remitirse a los benchmarks publicados por cada proveedor, que no forman parte de esta informacion.

## Limitaciones y advertencias

- No es un modelo: es un espejo de checkpoints de terceros. No debe citarse como modelo propio de LeiGong ni como trabajo original.
- Licencia heterogenea: cada carpeta conserva la licencia de su origen, y el conjunto se declara como `mixed-upstream-licenses` con licencia `other`. Antes de cualquier uso comercial hay que revisar la licencia concreta de la carpeta que se vaya a utilizar; no hay una licencia unica que cubra todo el repositorio.
- Repositorio sin mantenimiento garantizado: las descargas y los likes son cero y las fechas de creacion y actualizacion son el mismo dia. No hay indicios de actualizacion posterior ni de soporte.
- Tamano de 304,8 GB: descargar el repositorio completo es costoso en ancho de banda y almacenamiento; se recomienda usar `allow_patterns` para bajar solo la carpeta necesaria.
- Riesgo de alucinacion y de error de localizacion espacial: los modelos vision-lenguaje pueden generar coordenadas o descripciones plausibles pero incorrectas en fotogramas ambiguos, con oclusiones o con movimiento rapido. En tareas de anotacion conviene mantener una fase de revision humana.
- Cobertura de idiomas no documentada: no hay informacion sobre que lenguas soporta cada checkpoint, por lo que no puede asumirse un comportamiento multilingue correcto.
- Idoneidad para produccion no evaluada: la model card no documenta latencia, throughput, estabilidad ni consumo de memoria medidos. Las estimaciones de hardware de esta ficha son calculos a partir del tamano de los ficheros.
- Dependencia de hardware especifico en las variantes cuantizadas: FP8 requiere arquitecturas Ada o Hopper para aprovecharse, y AWQ requiere kernels compatibles; en GPUs mas antiguas el rendimiento puede degradarse.
- Trazabilidad limitada a los commits listados: el espejo fija revisiones concretas, pero no aporta informacion sobre cambios posteriores en los repositorios de origen ni sobre problemas conocidos de esas revisiones.
- Sin resultados de benchmarks en la informacion disponible, por lo que no hay evidencia publicada aqui sobre la calidad de los modelos en las tareas de tracking objetivo.

## Enlaces

- Repositorio espejo en Hugging Face: https://huggingface.co/LeiGong/vlm_3d_tracking_annotator_opensource_checkpoints
- Manifiesto del espejo: `MIRROR_MANIFEST.json` dentro del propio repositorio
- Proyecto de origen: https://github.com/XuweiyiChen/vlm_3d_tracking_annotator
- Rama de evaluacion: rama `lei/open-source-vlm-eval` del repositorio anterior
- Upstreams espejados:
  - https://huggingface.co/OpenGVLab/InternVL3-14B-hf
  - https://huggingface.co/OpenGVLab/InternVL3-1B-hf
  - https://huggingface.co/OpenGVLab/InternVL3-2B-hf
  - https://huggingface.co/OpenGVLab/InternVL3-38B-AWQ
  - https://huggingface.co/OpenGVLab/InternVL3-8B-hf
  - https://huggingface.co/OpenGVLab/InternVL3-9B
  - https://huggingface.co/Qwen/Qwen3.5-0.8B
  - https://huggingface.co/Qwen/Qwen3.5-27B-FP8
  - https://huggingface.co/Qwen/Qwen3.5-2B
  - https://huggingface.co/Qwen/Qwen3.5-4B
  - https://huggingface.co/Qwen/Qwen3.5-9B
  - https://huggingface.co/Qwen/Qwen3.8-27B-FP8
  - https://huggingface.co/RedHatAI/gemma-4-31B-it-FP8-dynamic
  - https://huggingface.co/allenai/MolmoPoint-8B
  - https://huggingface.co/deepseek-ai/deepseek-vl2-small
  - https://huggingface.co/deepseek-ai/deepseek-vl2-tiny
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo en la busqueda realizada; los resultados obtenidos corresponden a un canal de television ajeno por completo al repositorio.
