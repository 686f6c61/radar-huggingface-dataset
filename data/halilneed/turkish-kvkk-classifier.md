# halilneed/turkish-kvkk-classifier

## Resumen

El modelo halilneed/turkish-kvkk-classifier es un clasificador de texto multilabel en turco desarrollado por el usuario halilneed. Su funcion es detectar que categorias de datos personales aparecen en un texto, cubriendo las 14 categorias del registro VERBIS turco y las 10 categorias de datos de caracter especial recogidas en el articulo 6 de la KVKK (la ley turca de proteccion de datos). Se construye como un ajuste fino sobre dbmdz/bert-base-turkish-cased (BERTurk), un transformer encoder de aproximadamente 110 millones de parametros.

El problema que resuelve es la fase de clasificacion previa a la anonimizacion: en lugar de aplicar un unico enmascarador ciego, el modelo permite identificar primero que tipo de dato personal contiene un texto, seleccionar despues la politica adecuada y enmascarar solo lo que corresponda. Esto es relevante para equipos que construyen pipelines de cumplimiento (KVKK o, por analogia, RGPD) en turco y necesitan distinguir entre informacion generica o estadistica y datos ligados a una persona concreta, incluida la deteccion de categorias sensibles.

Con 110.635.800 parametros y un tamano de repositorio de 0,4 GB, es un modelo ligero que se ejecuta en CPU a unos 22 ms por texto (Intel i5-12400F, 8 hilos, texto medio de 126 caracteres). La informacion disponible no detalla el espacio de contexto efectivo mas alla del limite de 320 tokens usado en entrenamiento. La licencia es MIT y el pipeline declarado es text-classification.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT), ajuste fino de dbmdz/bert-base-turkish-cased |
| Parametros totales | 110.635.800 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible de forma explicita; entrenamiento con max. 320 tokens (modelo base BERT, limite habitual 512) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | turco (tr) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un ajuste fino de BERTurk (dbmdz/bert-base-turkish-cased), un transformer encoder de tipo BERT con enmascaramiento de tokens y atencion bidireccional, sobre el que se anade una cabeza de clasificacion. El modelo se entrena como clasificacion multilabel: la salida es una probabilidad independiente por etiqueta, calculada con activacion sigmoid y funcion de perdida BCE (binary cross-entropy). El conjunto de etiquetas combina 14 categorias generales de VERBIS (identidad, contacto, localizacion, curriculum, procedimiento legal, operaciones con clientes, seguridad fisica, seguridad de operaciones, gestion de riesgos, finanzas, experiencia profesional, marketing, imagen y sonido, vehiculo) y 10 categorias de caracter especial del articulo 6 de la KVKK (salud, biometria, genetica, vida sexual, condenas penales, religion o creencias filosoficas, opinion politica, origen racial o etnico, pertenencia a asociaciones o sindicatos, y apariencia o vestimenta).

El entrenamiento se realizo durante 5 epocas con learning rate 3e-5, precision bf16 y una longitud maxima de 320 tokens. El corpus de entrenamiento consta de 36.000 ejemplos sinteticos generados a partir de 3.276 plantillas; estas plantillas combinan las del modelo de enmascaramiento asociado (con mapeo deterministico de categoria a partir de las ranuras de PII y anotacion contextual por plantilla) y frases contextuales sin valores, con un 21 por ciento de ejemplos trampa sin etiqueta. La particion de datos se hizo a nivel de plantilla mediante hash, garantizando que las plantillas de test no aparezcan en entrenamiento. No se menciona el uso de RLHF ni DPO, algo esperable en un encoder de clasificacion.

## Capacidades

- Clasificacion multilabel de texto en turco: asigna de forma simultanea varias categorias de datos personales a un mismo fragmento.
- Deteccion de categorias de caracter especial (articulo 6 KVKK): devuelve una senal especifica de si el texto contiene datos sensibles, con precision 0,960 y sensibilidad 0,884 en el conjunto held-out.
- Distincion entre dato personal y contenido generico: frases informativas, reglas, anuncios o estadisticas no reciben etiqueta aunque contengan terminos medicos o sensibles (por ejemplo, "semana de concienciacion sobre la insuficiencia renal" no se marca como salud).
- Uso como etapa previa a un enmascarador: el autor lo posiciona delante de halilneed/turkish-pii-detection para la secuencia clasificar, elegir politica y enmascarar.
- Umbrales por etiqueta: incorpora un archivo thresholds.json ajustado en el conjunto de desarrollo, con umbrales que no superan 0,5 en las etiquetas de caracter especial para priorizar la sensibilidad.
- Inferencia en CPU: aproximadamente 22 ms por texto en un Intel i5-12400F con 8 hilos, sin necesidad de GPU.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Cumplimiento KVKK en procesos documentales: clasificar los textos antes de anonimizarlos para decidir que politica de enmascaramiento aplicar segun la categoria detectada, evitando tratar de forma uniforme datos identificativos y datos de salud.
- Etiquetado previo en pipelines de anonimizacion: colocar el clasificador delante de halilneed/turkish-pii-detection para que el enmascarador aplique reglas especificas a cada categoria, mejorando la precision al no enmascarar terminos que no son datos personales.
- Triaje de bandejas de entrada y tickets de soporte: detectar automaticamente si un mensaje de cliente contiene datos sensibles (salud, biometria, condenas) antes de que se almacene o derive a un equipo, ayudando a decidir si requiere tratamiento reforzado.
- Construccion y auditoria de inventarios VERBIS: procesar lotes de registros internos y agregar que categorias de datos aparecen en cada flujo, para contrastar el inventario declarado con el contenido real de los documentos.
- Filtrado en sistemas de registro (logs y formularios): analizar en tiempo casi real el texto introducido por usuarios y marcar entradas que contengan categorias de caracter especial, dado que el modelo corre en CPU a 22 ms por texto y puede integrarse en servicios ligeros.
- Revision de conjuntos de datos para entrenamiento o publicacion: identificar que categorias de datos personales contiene un corpus turco antes de compartirlo, especialmente para detectar datos de salud o religiosos que suelen pasar desapercibidos.
- Evaluacion de riesgos en flujos de marketing: distinguir contenido promocional generico de textos que contienen datos personales asociados a una persona, para decidir si procede consentimiento especifico.
- Enrutado de peticiones de derechos (acceso, supresion): clasificar solicitudes entrantes en turco para detectar rapidamente si contienen datos sensibles y priorizar su gestion.

## Benchmarks y rendimiento

El autor publica dos conjuntos de evaluacion. El principal es un conjunto held-out independiente de 1.125 textos escritos por un autor que no participo en el entrenamiento y reetiquetados a ciegas por un segundo anotador; de ellos, 987 textos con coincidencia exacta entre anotadores constituyen el conjunto de referencia (acuerdo del 87,7 por ciento, kappa de Cohen por etiqueta entre 0,84 y 1,00). El segundo es un conjunto de test disjunto a nivel de plantilla con 771 ejemplos de 333 plantillas no usadas en entrenamiento.

| Metrica | Held-out (987) | Test disjunto (771) |
|---|---|---|
| micro-F1 | 0,874 | 0,895 |
| macro-F1 | 0,856 | 0,875 |
| Precision de "contiene caracter especial" | 0,960 | 0,955 |
| Sensibilidad de "contiene caracter especial" | 0,884 | 0,955 |
| Coincidencia exacta (todas las etiquetas correctas) | 0,717 | 0,733 |

F1 por etiqueta en el conjunto held-out (segun el autor): identidad 0,97; contacto 0,97; vehiculo 0,96; religion o creencias filosoficas 0,93; salud 0,92; apariencia o vestimenta 0,91; procedimiento legal 0,89; asociaciones y sindicatos 0,89; biometria 0,88; vida sexual 0,86; finanzas 0,85; opinion politica 0,85; curriculum 0,84; condenas penales 0,84; marketing 0,83; seguridad fisica 0,83; seguridad de operaciones 0,83; gestion de riesgos 0,82; origen racial o etnico 0,82; experiencia profesional 0,80; genetica 0,79; imagen y sonido 0,79; operaciones con clientes 0,75; localizacion 0,74.

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo es un clasificador de tarea especifica y no un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: los siguientes valores son estimaciones calculadas a partir del numero de parametros (110,6 millones) y del tamano del repositorio (0,4 GB), no cifras publicadas por el autor. En fp32, aproximadamente 0,45 GB de pesos; en fp16/bf16, en torno a 0,25 GB; sumando activaciones y overhead de runtime, una GPU con 2 GB o mas es suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 a 4 GB de memoria es valida, incluidas RTX 3050, RTX 3060, RTX 4090 o superiores. No requiere A100 ni H100; usarlas seria sobredimensionado para este tamano.
- Viabilidad en GPU de consumo: si, cabe sobradamente en cualquier GPU de consumo moderna e incluso en graficas integradas con memoria compartida. Tambien es viable en CPU, que es el escenario medido por el autor.
- Opciones de despliegue: transformers (referencia principal), text-embeddings-inference (segun los tags del repositorio) y endpoints compatibles. Al ser un modelo BERT de 110M, es compatible con librerias de inferencia estandar de HuggingFace; no se documentan pesos GGUF ni soporte explicito de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: el autor reporta aproximadamente 22 ms por texto en CPU (Intel i5-12400F, 8 hilos, texto medio de 126 caracteres, batch 1). En GPU la latencia seria inferior, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de cifras de rendimiento de modelos alternativos comparables (clasificadores multilabel de categorias de datos personales en turco), por lo que la comparacion se limita a caracteristicas estructurales. No se inventan datos de rendimiento.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| halilneed/turkish-kvkk-classifier | 110,6 M | no disponible (entrenado a 320 tokens) | turco | MIT | Clasificacion multilabel de categorias VERBIS + KVKK art. 6 |
| dbmdz/bert-base-turkish-cased (modelo base) | 110 M | 512 tokens | turco | no disponible en esta ficha | Encoder BERT general en turco, sin cabeza de clasificacion especifica |
| halilneed/turkish-pii-detection | no disponible | no disponible | turco | no disponible | Deteccion y enmascaramiento de PII, complementario a este modelo |
| Clasificadores multilabel multilingues genericos (p. ej. basados en XLM-R) | no disponible | no disponible | multiples | variable | Categoria distinta; no se aportan datos comparables |

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos (36.000 ejemplos de 3.276 plantillas); el propio autor advierte de que no debe colocarse en una ruta critica sin medirlo antes sobre texto real de la organizacion.
- Las etiquetas mas debiles son localizacion (F1 0,74), operaciones con clientes (0,75) e imagen y sonido (0,79): son categorias inferidas del contexto y con fronteras difusas.
- El modelo produce una senal de categoria, no una calificacion juridica. La elaboracion del inventario VERBIS y el cumplimiento de la KVKK son responsabilidad de quien lo utiliza.
- Riesgo de alucinacion en el sentido de clasificacion: puede asignar categorias de forma incorrecta por umbrales ajustados a la sensibilidad, especialmente en las etiquetas de caracter especial, donde los umbrales se situan por debajo de 0,5 para priorizar la deteccion, lo que puede elevar los falsos positivos.
- Ambito linguistico limitado al turco; no se documenta soporte multilingue.
- La cobertura de categorias es especifica del ordenamiento turco (VERBIS y articulo 6 KVKK); su traslado directo al RGPD u otras jurisdicciones requiere validacion.
- Licencia MIT: permite uso comercial y modificacion, pero debe conservarse el aviso de copyright y la licencia.
- El limite de contexto no esta declarado de forma explicita mas alla de los 320 tokens usados en entrenamiento; procesar textos mas largos puede requerir truncado o segmentacion, con posible perdida de categorias al final del texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/halilneed/turkish-kvkk-classifier
- Modelo complementario de deteccion de PII: https://huggingface.co/halilneed/turkish-pii-detection
- Conjunto de evaluacion: https://huggingface.co/datasets/halilneed/turkish-kvkk-classification-benchmark
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
