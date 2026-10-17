# ahmedbassuni61/DinoDental

## Resumen

DinoDental es un detector de objetos basado en YOLO26, desarrollado por el usuario ahmedbassuni61 y publicado en HuggingFace con el identificador `ahmedbassuni61/DinoDental`. Su tarea especifica es la deteccion de las 32 piezas dentales segun la nomenclatura FDI (Federation Dentaire Internationale) en fotografias intraorales, es decir, clasifica y localiza cada diente con su numero FDI correspondiente en una unica pasada de inferencia. El modelo esta entrenado sobre el conjunto de datos clinico IOP-Compass, compuesto por 700 pacientes y 3.500 fotografias, y se distribuye bajo licencia AGPL-3.0.

Se trata de un modelo de vision por computador para deteccion de objetos, no de un modelo de lenguaje, por lo que conceptos como ventana de contexto, cuantizacion GGUF o soporte multilingue no aplican directamente. El checkpoint publicado alcanza, en la epoca 14 de entrenamiento, un mAP@50 de 0,9349 y un mAP@50-95 de 0,8839 sobre el conjunto evaluado, con una precision de 0,8998 y un recall de 0,8920.

Su relevancia actual radica en que automatiza una tarea de anotacion dental que tradicionalmente se realiza de forma manual y que es un cuello de botella en flujos de odontologia digital: la identificacion pieza a pieza sobre imagenes intraorales. No obstante, la informacion publicada es limitada (no se detalla la arquitectura exacta, el numero de parametros ni el procedimiento de entrenamiento mas alla del dataset y las metricas), y el repositorio pesa 22,5 GB, un tamano elevado que sugiere la presencia de multiples artefactos ademas del checkpoint final, aunque este extremo no esta confirmado en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector de objetos de la familia YOLO (etiquetado como YOLO26 por el autor); no se detalla el backbone ni la cabeza de deteccion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos, sin contexto textual) |
| Tipos de cuantizacion | no disponible (la model card solo documenta el uso de `best.pt` en PyTorch) |
| Idiomas soportados | no aplica (vision por computador, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`, compatible con la libreria Ultralytics) |

## Arquitectura y entrenamiento

La model card define el modelo como un detector end-to-end de 32 clases FDI, construido sobre YOLO26 (etiqueta declarada por el autor) y entrenado con el conjunto clinico IOP-Compass, formado por 700 pacientes y 3.500 fotografias clínicas. No se especifica en la informacion disponible el backbone concreto, el mecanismo de asignacion de etiquetas, la funcion de perdida, la resolucion de entrada, el numero de parametros ni el numero de tokens o imagenes efectivamente utilizadas por epoca. Tampoco se documenta si hubo tecnicas de aumento de datos, balanceo de clases o ajuste fino posterior.

El unico dato de entrenamiento publicado es el del mejor checkpoint, correspondiente a la epoca 14, con las metricas mAP@50 = 0,9349, mAP@50-95 = 0,8839, precision = 0,8998 y recall = 0,8920. No se indica el tamano de los splits de entrenamiento, validacion y test, ni si estas metricas corresponden a validacion o a un conjunto de prueba independiente, por lo que deben interpretarse como cifras autoinformadas por el autor y no verificadas de forma externa. El nombre "DinoDental" podria sugerir el uso de un backbone tipo DINO, pero no hay ninguna confirmacion de ello en la informacion proporcionada.

## Capacidades

- Deteccion de objetos en fotografias intraorales: localiza cada pieza dental mediante cajas delimitadoras y le asigna una de las 32 clases FDI.
- Clasificacion dental segun nomenclatura FDI (numeracion internacional de dientes permanentes).
- Inferencia end-to-end en una sola pasada, propia de la familia YOLO, sobre imagenes individuales.
- Integracion directa con Ultralytics: el modelo se carga con `YOLO('best.pt')` y se ejecuta con `model(ruta_imagen, conf=0.25)`.
- Uso como etapa de preprocesado en pipelines mayores de vision dental (por ejemplo, recorte de regiones de interes antes de un modelo de segmentacion o de diagnostico).
- Capacidades de tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision general, audio o modo "thinking": no aplica, ya que no es un modelo de lenguaje ni un modelo multimodal generativo.
- Capacidades multilingues: no aplica.

## Casos de uso

- Odontograma digital automatico: a partir de una fotografia intraoral, el modelo devuelve cada diente con su numero FDI, lo que permite generar o actualizar un odontograma sin anotacion manual. Es adecuado porque la tarea exacta del modelo es precisamente esa correspondencia pieza-etiqueta.
- Triaje y documentacion clinica: en una consulta dental, las fotografias tomadas al paciente se procesan automaticamente para etiquetar las piezas visibles, reduciendo el tiempo de documentacion y los errores de transcripcion manual.
- Teledontologia y segunda opinion remota: el modelo preanota las imagenes antes de enviarlas a un especialista remoto, de modo que este recibe las piezas ya identificadas y puede centrarse en el juicio clinico en lugar de en la numeracion.
- Control de calidad de conjuntos de datos: dado que funciona como anotador automatico con mAP@50 cercano a 0,93, puede usarse para detectar imagenes mal etiquetadas o inconsistentes en bases de datos odontologicas, comparando la salida del modelo con las anotaciones existentes.
- Preprocesado para modelos de diagnostico: el recorte por pieza dental que produce el detector sirve como entrada para clasificadores especificos de patologia (caries, restauraciones, fracturas), que trabajan mejor sobre regiones pequenas y centradas.
- Formacion de estudiantes de odontologia: una aplicacion docente puede mostrar sobre la fotografia la numeracion FDI correcta de cada pieza, sirviendo como herramienta de autoevaluacion de la nomenclatura dental.
- Investigacion epidemiologica: sobre fotografias intraorales a gran escala, el modelo permite extraer de forma automatica que piezas estan presentes o ausentes, generando variables estructuradas para estudios poblacionales.
- Aplicaciones moviles de seguimiento del paciente: un usuario podria fotografiar su boca y obtener una identificacion preliminar de las piezas visibles, siempre con caracter orientativo y sin valor diagnostico.

## Benchmarks y rendimiento

Los unicos datos disponibles son los autoinformados por el autor en la model card para el mejor checkpoint (epoca 14). No se proporcionan resultados comparativos con otros modelos ni se especifica el split de evaluacion.

| Metrica | Valor |
|---|---|
| mAP@50 | 0,9349 |
| mAP@50-95 | 0,8839 |
| Precision | 0,8998 |
| Recall | 0,8920 |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K ni equivalentes para deteccion) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. La model card no indica tamano del modelo, numero de parametros ni consumo de memoria.
- GPU recomendadas: no disponible. No se especifica ningun requisito de GPU por parte del autor.
- Compatibilidad con GPU de consumo: no confirmada. Dado que la familia YOLO suele incluir variantes ligeras, es plausible que una variante de este detector quepa en GPU de consumo (por ejemplo, RTX 3060 o superiores), pero no hay ningun dato publicado que lo confirme para este checkpoint concreto.
- Opciones de despliegue: la model card solo documenta la carga del archivo `best.pt` mediante la libreria Ultralytics en Python. Cualquier otro formato de despliegue requeriria exportar el modelo desde Ultralytics, algo que no se detalla en la informacion disponible.
- Latencia y throughput estimados: no disponible.
- Nota sobre almacenamiento: el repositorio ocupa 22,5 GB, por lo que conviene verificar antes de la descarga que artefactos contiene realmente (checkpoints, pesos duplicados u otros ficheros), ya que el checkpoint de inferencia (`best.pt`) puede ser mucho mas pequeno que el total del repositorio.

## Comparativa con modelos similares

No disponible. En la informacion proporcionada no se incluyen modelos comparables de deteccion dental con numeracion FDI, ni resultados de benchmarks cruzados que permitan establecer una comparacion rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta la distribucion demografica del conjunto IOP-Compass (700 pacientes, 3.500 fotografias) ni como puede afectar a la generalizacion a otras poblaciones, tipos de camara o condiciones de iluminacion.
- Riesgo de falsos positivos y falsos negativos: con precision 0,8998 y recall 0,8920, aproximadamente una de cada diez detecciones o piezas esperadas puede ser incorrecta, lo que es relevante si la salida se usa directamente en un contexto clinico.
- Limitacion de dominio: el modelo esta entrenado exclusivamente sobre fotografias clinicas intraorales de IOP-Compass, por lo que no hay evidencia de que funcione sobre radiografias, tomografias (CBCT), escaneos intraorales 3D u otras modalidades de imagen dental.
- Procedencia de las metricas: las cifras de rendimiento son autoinformadas por el autor y no se especifica el conjunto de evaluacion, por lo que no equivalen a una validacion externa independiente.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se distribuye el software o se ofrece el modelo como servicio en red, la AGPL exige poner a disposicion el codigo fuente correspondiente bajo la misma licencia. Conviene revisar las implicaciones antes de integrarlo en un producto propietario.
- Uso clinico: el modelo es una herramienta de deteccion de piezas dentales, no un dispositivo medico ni un sistema de diagnostico. No debe utilizarse para tomar decisiones terapeuticas sin supervision profesional y sin cumplir la normativa aplicable (por ejemplo, marcado CE como producto sanitario en la Union Europea).
- Madurez del repositorio: 0 descargas y 1 like en el momento de la consulta, con una unica version publicada, lo que indica un proyecto sin validacion por parte de la comunidad.
- Datos de idioma y contexto: no aplicables, ya que no es un modelo de lenguaje.
- Ausencia de informacion sobre el pipeline de entrenamiento: no se detalla la estrategia de aumento de datos, el manejo de clases desbalanceadas ni el criterio de seleccion del checkpoint, lo que dificulta evaluar la robustez del modelo.

## Enlaces

- HuggingFace: https://huggingface.co/ahmedbassuni61/DinoDental
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada.
- Los resultados de busqueda web facilitados no contienen informacion relacionada con este modelo (corresponden a contenido no pertinente sobre tablaturas de guitarra), por lo que no se incluye ningun otro enlace.
