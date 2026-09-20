# fahooody10/tsa-intent-classifier

## Resumen

`fahooody10/tsa-intent-classifier` es un modelo de clasificación de texto publicado en Hugging Face por el usuario fahooody10, cuyo nombre sugiere una especialización en la clasificación de intenciones dentro del dominio TSA (Transportation Security Administration, la agencia de seguridad del transporte aéreo de Estados Unidos). Se distribuye como un checkpoint de la librería `transformers` con pesos en formato `safetensors` y una etiqueta de arquitectura `distilbert`, lo que lo sitúa en la familia de encoders transformer destilados de tipo BERT, diseñados para tareas de comprensión del lenguaje con un coste computacional reducido.

El dato objetivo más relevante es su tamaño: 66.959.624 parámetros según los pesos publicados, una cifra consistente con la arquitectura DistilBERT de referencia (aproximadamente 66 millones de parámetros), lo que lo convierte en un modelo ligero apto para inferencia en CPU o en GPUs de gama baja y con requisitos de latencia estrictos. El repositorio ocupa 0,3 GB e incluye únicamente los pesos y una model card autogenerada por la plataforma, sin información sobre datos de entrenamiento, etiquetas, número de clases ni métricas.

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente de advertencia: se trata de un checkpoint sin documentación (0 descargas y 0 likes en el momento de la consulta), sin licencia declarada y sin benchmarks, por lo que cualquier evaluación seria exige inspeccionar el `config.json` del repositorio, la cabecera de clasificación y el dataset de entrenamiento antes de considerarlo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder basado en DistilBERT (segun el tag `distilbert` del repositorio); la configuracion concreta no esta documentada en la model card |
| Parametros totales | 66.959.624 (dato extraido de los pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; la arquitectura DistilBERT de referencia admite 512 tokens |
| Tipos de cuantizacion | No documentados; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada en el repositorio) |
| Formato de pesos | safetensors |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,3 GB |
| Libreria | transformers |
| Fecha de creacion / actualizacion | 2026-09-19 / 2026-09-19 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

La unica informacion tecnica fiable disponible es la etiqueta `distilbert` asociada al repositorio y el recuento de parametros (66.959.624). DistilBERT es un encoder transformer destilado a partir de BERT-base mediante destilacion de conocimiento, con 6 capas, dimension oculta de 768, 12 cabezas de atencion y un vocabulario WordPiece de 30.522 tokens en su configuracion canonica; el checkpoint aqui descrito anade una cabeza de clasificacion secuencial sobre la representacion del token `[CLS]`. No se ha publicado la configuracion concreta del modelo (numero de capas efectivas, dimension de la cabeza, numero de etiquetas de salida), por lo que esta descripcion debe interpretarse como la arquitectura de referencia de la familia, no como una confirmacion documental del checkpoint.

Tampoco hay informacion sobre el procedimiento de entrenamiento: se desconoce el dataset, el numero de tokens, la composicion de las clases, si hubo ajuste fino supervisado, si se aplicaron tecnicas de balanceo o si se uso RLHF/DPO (tecnicas, por otra parte, poco habituales en clasificadores de este tamano). La model card es la plantilla autogenerada de Hugging Face con todos los campos marcados como `[More Information Needed]`. El unico tag adicional reseñable es `arxiv:1910.09700`, que corresponde al articulo de Lacoste et al. sobre el calculador de impacto deMachine Learning citado en la propia plantilla, y no a un paper del modelo; tambien aparecen los tags `text-embeddings-inference` y `endpoints_compatible`, que simplemente indican compatibilidad de despliegue con la infraestructura de Hugging Face, no caracteristicas del modelo.

## Capacidades

- Clasificacion de texto: la tarea declarada en el pipeline es `text-classification`, es decir, asignacion de una o varias etiquetas a una secuencia de entrada. El numero y la semantica de las etiquetas no estan documentados.
- Clasificacion de intenciones (inferida del nombre): el identificador del modelo apunta a un uso de deteccion de intencion en el dominio TSA, presumiblemente para enrutar consultas o incidencias relacionadas con seguridad aeroportuaria. No hay confirmacion documental de las clases.
- Generacion de texto: no. Es un encoder discriminativo, no un modelo generativo; no produce texto libre.
- Razonamiento complejo, matematicas o codigo: no. La arquitectura y el tamano no estan orientados a estas tareas y no hay evidencia de entrenamiento en ellas.
- Tool calling / function calling: no soportado de forma nativa.
- Capacidades de agente o razonamiento multi-paso: no soportadas.
- Capacidades multilingues: no disponibles; se desconoce el idioma o idiomas de entrenamiento.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Embeddings de frases: no confirmado; el tag `text-embeddings-inference` hace referencia a la compatibilidad con el motor de inferencia de Hugging Face, no implica que el modelo genere embeddings de calidad contrastada.

## Casos de uso

Advertencia previa: al no existir documentacion sobre las etiquetas ni el dominio exacto del ajuste fino, los siguientes casos son aplicaciones plausibles de un clasificador de intenciones de este tamano, condicionadas a validar previamente el `config.json` y el comportamiento real del modelo.

- Triaje de consultas de pasajeros: el modelo puede clasificar mensajes entrantes (formularios web, correo, chat) en categorias como equipaje prohibido, liquidos, documentacion o tiempos de espera, y enrutarlos al equipo correspondiente. Su tamano de 67 millones de parametros permite ejecutarlo en el mismo servidor de aplicacion sin GPU dedicada.
- Enrutado de tickets en un sistema de soporte: integrado como primer paso de un pipeline de atencion al cliente, etiqueta cada ticket con una intencion y lo asigna a la cola adecuada antes de que intervenga un modelo generativo mayor, reduciendo el coste por peticion.
- Pre-filtrado y enrutado en arquitecturas RAG: dado que es un clasificador rapido, puede decidir si una consulta requiere recuperacion documental o puede resolverse con una respuesta plantilla, actuando como router barato delante de un LLM.
- Analisis de reclamaciones y encuestas de satisfaccion: clasificacion por lotes de miles de comentarios de pasajeros para agrupar motivos de queja y calcular su frecuencia relativa por aeropuerto o franja horaria.
- Moderacion y clasificacion de reportes de seguridad: separar avisos operativos reales de mensajes irrelevantes o spam en canales de reporte, dejando a un operador humano la revision de los casos marcados como criticos.
- Deteccion de urgencia o criticidad: si el ajuste incluye clases de prioridad, el modelo puede marcar mensajes que requieren atencion inmediata y disparar alertas automatizadas.
- Procesamiento por lotes de bajo coste: al ser un encoder de 67 millones de parametros, es apto para jobse nocturnos de clasificacion masiva sobre CPU, sin necesidad de infraestructura GPU.
- Clasificacion en el borde o en local: su tamano permite ejecutarlo en portatiles o en dispositivos con recursos limitados mediante cuantizacion a INT8, util para prototipos y demos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion cumplimentada (`[More Information Needed]`), no se declaran metricas de exactitud, F1, precision o recall, y no se especifica el conjunto de test utilizado.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| GLUE / SST-2 | No disponible |
| F1 de clasificacion de intenciones | No disponible |
| Cualquier otra metrica | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 268 MB en fp32 (67 millones de parametros) y unos 134 MB en fp16. Estas cifras son calculadas a partir del recuento de parametros, no medidas publicadas.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es sobredimensionado para una RTX 4090, A100 o H100, que quedarian infrautilizadas. Una GPU integrada o una GTX 1650 son suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos diez anos, y tambien en CPU.
- Despliegue: compatible con la libreria `transformers`, con `text-embeddings-inference` y con endpoints de Hugging Face segun los tags del repositorio. Tambien es exportable a ONNX y ejecutable con `llama.cpp` no aplica (no es un modelo generativo), pero si con librerias de clasificacion como `sentence-transformers` (si se confirma su uso como encoder) o directamente con `pipeline("text-classification")`.
- Latencia y throughput: no hay mediciones publicadas. Por el tamano del modelo, es razonable esperar latencias de milisegundos por secuencia en CPU moderna y throughput elevado con batching en GPU, pero son estimaciones cualitativas no verificadas.
- Memoria en disco: 0,3 GB para el repositorio completo.
- Requisitos de entrenamiento o ajuste fino adicional: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fahooody10/tsa-intent-classifier | 66.959.624 | No disponible (referencia DistilBERT: 512 tokens) | Clasificacion de intenciones (dominio no documentado) | No declarada | Hugging Face, 0 descargas |
| distilbert-base-uncased | ~66 millones | 512 tokens | Encoder generalista para ajuste fino | Apache 2.0 | Hugging Face, ampliamente usado |
| bert-base-uncased | ~110 millones | 512 tokens | Encoder generalista para ajuste fino | Apache 2.0 | Hugging Face, ampliamente usado |
| roberta-base | ~125 millones | 512 tokens | Encoder generalista para ajuste fino | MIT | Hugging Face, ampliamente usado |

La comparacion de rendimiento no es posible porque el modelo no publica benchmarks. La diferencia practica frente a las alternativas es de documentacion y licencia: los tres modelos de referencia tienen licencias permisivas explicitas y documentacion completa, mientras que este checkpoint no declara licencia ni datos de entrenamiento, lo que limita su uso comercial sin una revision legal adicional.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada, sin descripcion, datos de entrenamiento, hiperparametros ni evaluacion. No es posible conocer que etiquetas predice ni con que fiabilidad.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara de uso comercial; en la practica, el modelo se distribuye con todos los derechos reservados por defecto hasta que el autor aclare la licencia.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de clasificaciones erroneas con alta confianza, especialmente fuera de la distribucion de entrenamiento; sin metricas publicadas no puede acotarse.
- Sesgos desconocidos: al no documentarse el dataset, no puede evaluarse el sesgo por origen, idioma, genero o tipo de redaccion. En un dominio de seguridad aeroportuaria, este punto es especialmente sensible por las implicaciones sobre personas.
- Limitaciones de idioma: se desconoce si el modelo esta entrenado en ingles, en castellano o en varios idiomas. Un clasificador monoidioma fallara silenciosamente en entradas en otros idiomas si no se controla.
- Contexto limitado: si se confirma la configuracion DistilBERT estandar, la ventana util es de 512 tokens, insuficiente para documentos largos sin troceado previo.
- Modelo de clasificacion, no generativo: no puede redactar respuestas, razonar en varios pasos ni invocar herramientas; solo asigna etiquetas.
- Riesgo de seguridad en produccion: en un dominio critico como el de seguridad del transporte, delegar decisiones en un clasificador no documentado y sin evaluacion publicada es desaconsejable; debe usarse como apoyo con revision humana.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de terceros.
- Metadatos temporales anomalos: las fechas de creacion y actualizacion (2026-09-19) son posteriores a la fecha habitual de referencia y deben tomarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fahooody10/tsa-intent-classifier
- Paper de DistilBERT (arquitectura de referencia): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en Hugging Face: https://huggingface.co/docs/transformers/model_doc/distilbert
- Paper citado en el tag `arxiv:1910.09700` (calculador de impacto de Machine Learning, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculador de impacto de Machine Learning: https://mlco2.github.io/impact
- Nota: los resultados de la busqueda web realizada no contienen informacion relacionada con este modelo (corresponden a paginas de un grado en matematicas de la Universidad Eotvos Lorand), por lo que no se han utilizado como fuente.
