# abhijit2k01/medgaze-adapters

## Resumen

MedGaze adapters es un conjunto de adaptadores LoRA de rango 8 publicados por abhijit2k01 bajo licencia MIT, disenados para modificar el comportamiento atencional de modelos de vision-lenguaje aplicados a imagenes medicas. El artefacto no es un modelo completo: son adaptadores que se aplican sobre las filas de query de las 100 cabezas de atencion principales, denominadas por los autores "fixation heads", es decir, las cabezas que miran donde apunta la pregunta formulada sobre la imagen.

El entrenamiento se realizo sobre preguntas cerradas del conjunto SLAKE, combinando una perdida de respuesta con un termino de atencion supervisado por mascara (receta "V-g", 400 pasos). El objetivo es doble: mejorar la precision en tareas de VQA medica dentro de dominio y, sobre todo, hacer que la atencion del modelo sea interpretable y alineada con las regiones clinicamente relevantes de la imagen.

El repositorio esta orientado a investigacion en interpretabilidad de VLMs medicos. La propia model card advierte que la ganancia de precision es solo en dominio y no se transfiere a VQA-RAD, y que el artefacto es de uso exclusivamente investigador y no constituye un dispositivo medico. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su tamano es de 0.0 GB, coherente con un conjunto de adaptadores de bajo rango mas ficheros de metadatos y rankings.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (rango 8) sobre las filas de query de las 100 fixation heads principales; se aplican a un modelo base de vision-lenguaje |
| Modelo base de ejemplo | Qwen/Qwen3-VL-2B-Instruct (segun el ejemplo de la model card) |
| Parametros totales | no disponible (adaptadores LoRA; el repositorio ocupa 0.0 GB) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (se descargan con `snapshot_download`; `index.json` incluye checksum de cada adaptador) |
| Libreria de integracion | medgaze (requiere `GAZEMED_ADAPTERS` apuntando al directorio descargado) |

## Arquitectura y entrenamiento

La innovacion principal no esta en el modelo base sino en donde se inyectan los adaptadores. En lugar de aplicar LoRA de forma uniforme a todas las proyecciones de atencion, los autores identifican previamente un subconjunto de 100 cabezas de atencion, las "fixation heads", que son las que dirigen la mirada del modelo hacia las regiones de la imagen a las que apunta la pregunta. Sobre las filas de query de esas cabezas se insertan adaptadores LoRA de rango 8, lo que los hace parametricalmente muy ligeros y, en teoria, quirurgicos: solo se modifica la forma en que el modelo "mira", no el resto del conocimiento adquirido durante el preentrenamiento.

El procedimiento de entrenamiento ("decode-only") se realizo sobre preguntas cerradas del dataset SLAKE durante 400 pasos con la receta interna denominada "V-g". La funcion de perdida combina un termino de respuesta (answer loss) con un termino de atencion supervisado por mascara (mask-supervised attention term), de modo que el modelo no solo aprende a acertar la respuesta, sino a concentrar su atencion en las zonas marcadas como relevantes. El repositorio incluye un directorio `rankings/` con las clasificaciones de fixation heads usadas para entrenar los adaptadores y un `index.json` que documenta cada adaptador con su checksum, su comportamiento medido y sus limitaciones declaradas.

## Capacidades

- Alineacion de la atencion visual: desplaza las cabezas de atencion seleccionadas hacia las regiones de la imagen que la pregunta senala, segun el termino de supervision por mascara.
- VQA medica cerrada: entrenado especificamente sobre preguntas cerradas de SLAKE.
- Interpretabilidad: los rankings de fixation heads incluidos permiten analizar y auditar que cabezas usa el modelo para localizar hallazgos.
- Modificacion quirurgica del modelo base: al ser LoRA de rango 8 sobre las filas de query, permite comparar el mismo modelo base con y sin adaptadores.
- Integracion programatica: API `GazeModel.from_pretrained(..., gaze="auto")` con la libreria medgaze y funcion `describe()` para inspeccionar el modelo.
- Trazabilidad: `index.json` con checksum y caveats por adaptador.
- No se documentan capacidades de tool calling, function calling, uso agentico, generacion de codigo, matematicas, audio ni modo de razonamiento explicito.
- Idiomas soportados: no disponible.

## Casos de uso

- Investigacion en interpretabilidad de VLMs medicos: usar los adaptadores y los rankings de fixation heads para estudiar como un VLM localiza hallazgos en imagenes radiologicas y si esa atencion correlaciona con regiones clinicamente relevantes.
- Auditoria de atencion sesgada: comparar la atencion del modelo base con y sin adaptadores para detectar si el modelo mira zonas irrelevantes (artefactos, marcadores, bordes) antes y despues del ajuste.
- Visual grounding supervisado por mascara: reproducir la receta "V-g" sobre SLAKE como linea base para experimentos de supervision de atencion en otros conjuntos medicos.
- Docencia en IA medica: usar las visualizaciones de atencion para explicar a estudiantes como un modelo de vision-lenguaje relaciona una pregunta con regiones de una imagen.
- Experimentos de transferencia fuera de dominio: evaluar en VQA-RAD el comportamiento de adaptadores entrenados en SLAKE, dado que la propia ficha declara que la ganancia no se transfiere.
- Estudio de eficiencia de adaptacion: comparar LoRA de rango 8 restringido a 100 cabezas frente a LoRA completo, en coste de parametros y en precision dentro de dominio.
- Reproducibilidad de resultados: el `index.json` con checksums y la receta de 400 pasos permiten replicar exactamente cada adaptador publicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card unicamente afirma de forma cualitativa que la ganancia de precision es en dominio (SLAKE) y que no se transfiere a VQA-RAD. No se proporcionan valores de MMLU, HumanEval, GSM8K ni metricas concretas de VQA.

| Benchmark | Resultado |
|---|---|
| SLAKE (preguntas cerradas) | Mejora cualitativa en dominio, sin cifra publicada |
| VQA-RAD | Sin transferencia, sin cifra publicada |
| Otros (MMLU, GSM8K, HumanEval, etc.) | no disponible |

## Requisitos de hardware

- Los adaptadores son LoRA de rango 8 sobre 100 cabezas: su huella en disco y en memoria es minima (el repositorio ocupa 0.0 GB). El coste real de inferencia lo determina el modelo base, no los adaptadores.
- VRAM estimada para el modelo base de ejemplo (Qwen3-VL-2B-Instruct, ~2B parametros), como estimacion derivada del tamano: en bf16/fp16 en torno a 4-5 GB solo de pesos, mas activaciones de vision (aproximadamente 6-8 GB en total); en int8 en torno a 3 GB; en int4 en torno a 2 GB.
- GPU recomendadas: al ser un modelo de ~2B, cabe en GPUs de consumo como RTX 4090, RTX 4080 o RTX 3090 en bf16, y en GPUs de gama media con cuantizacion. Para lotes grandes o entrenamiento conviene una A100 o H100.
- Opciones de despliegue: la integracion documentada es mediante la libreria medgaze sobre Transformers; no se especifican en la informacion proporcionada soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedGaze adapters (sobre Qwen3-VL-2B-Instruct) | No disponible (LoRA rango 8; base ~2B) | no disponible | Adaptadores de atencion para interpretabilidad en VQA medica | MIT | HuggingFace, 0 descargas |
| Qwen3-VL-2B-Instruct sin adaptadores | ~2B | no disponible | VLM generalista de vision-lenguaje | no disponible | HuggingFace |
| Otros adaptadores LoRA para VQA medica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar con alternativas especificas de la misma categoria (por ejemplo, otros enfoques de interpretabilidad de atencion o adaptadores medicos sobre VLMs).

## Limitaciones y advertencias

- Uso exclusivamente investigador: la propia model card indica "research use only; not a medical device". No debe emplearse para diagnostico ni decision clinica.
- La ganancia de precision esta declarada como en dominio (SLAKE) y no se transfiere a VQA-RAD, lo que limita su generalizacion a otros conjuntos o dominios clinicos.
- No se publican cifras de benchmarks, por lo que no es posible cuantificar la mejora de forma independiente.
- Repositorio sin traccion: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Se desconoce la composicion exacta de idiomas, el contexto soportado y los formatos de cuantizacion, ya que no se declaran.
- Riesgo de alucinacion: heredado del modelo base de vision-lenguaje; el ajuste de atencion no garantiza correccion factual en imagenes fuera de la distribucion de entrenamiento.
- Sesgos: no documentados en la informacion disponible; los sesgos del conjunto SLAKE y del modelo base podrian propagarse al comportamiento atencional.
- Coexistencia de licencia MIT con la indicacion de "research use only": conviene revisar la intencion del autor antes de un uso comercial, pese a que la licencia publicada sea permisiva.
- Dependencia de la libreria medgaze y de la seleccion concreta de fixation heads; cambios en el modelo base pueden invalidar los adaptadores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abhijit2k01/medgaze-adapters
- Pagina del proyecto, paper y codigo: https://aj-das-research.github.io/GazeHeads-Medical-VLMs/
- Modelo base de ejemplo: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
