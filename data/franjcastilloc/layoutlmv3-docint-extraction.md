# FranJCastilloC/layoutlmv3-docint-extraction

## Resumen

`FranJCastilloC/layoutlmv3-docint-extraction` es un modelo de token classification construido sobre `microsoft/layoutlmv3-base` y afinado para extraer campos de cabecera en documentos de negocio escaneados: facturas, ordenes de compra y certificados de analisis. Con 125.947.559 parametros, el modelo resuelve el problema de la extraccion de informacion estructurada (information extraction) a partir de OCR mas layout, devolviendo etiquetas BIO que un decodificador posterior convierte en campos con nombre.

La arquitectura es un transformer multimodal de LayoutLMv3: combina embeddings de texto con embeddings de parches de imagen y se preentrena con objetivos unificados de enmascaramiento de texto e imagen, sin CNN para las representaciones visuales. El afinamiento del autor cubre 39 clases BIO sobre 19 entidades semanticas compartidas entre tipos de documento (`DOC_NUMBER`, `DOC_DATE`, `PARTY_NAME`, `TOTAL_AMOUNT`...), una decision deliberada para evitar fragmentar el conjunto de etiquetas en 67 clases con muy pocos ejemplos.

Su relevancia ahora es doble. Por un lado, es un ejemplo publico del patron de extraccion de campos en documentos con licencia MIT, formato safetensors y compatibilidad con `transformers`. Por otro, la propia model card documenta con honestidad su limitacion principal: el modelo memoriza el layout. Sobre plantillas vistas alcanza un token-F1 de 96,5 y un field exact-match de 0,920, pero sobre plantillas nuevas cae a 68,1-72,5 de F1 y 0,508-0,522 de exact-match, por debajo de un extractor por reglas (0,580). Es, por tanto, una pieza util como referencia metodologica y para prototipado controlado, no un modelo listo para produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (LayoutLMv3, texto + parches de imagen con enmascaramiento unificado) |
| Parametros totales | 125.947.559 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite del encoder de LayoutLMv3-base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `LayoutLMv3ForTokenClassification` con el backbone `microsoft/layoutlmv3-base`. LayoutLMv3 es un transformer multimodal que introduce dos innovaciones principales: un objetivo unificado de enmascaramiento de texto e imagen, y una alineacion palabra-parche que obliga al modelo a aprender correspondencias entre tokens textuales y regiones de la imagen. Es el primer modelo de Document AI multimodal que prescinde de CNN para los embeddings de imagen, lo que reduce el numero de parametros y elimina la necesidad de anotaciones de region. El encoder tiene un limite de 512 tokens, suficiente para cabeceras de factura, ordenes de compra y certificados, pero no para documentos de muchas paginas sin fragmentacion previa.

El afinamiento se hizo exclusivamente con datos sinteticos: 929 documentos generados con ReportLab y Faker, distribuidos en tres familias de plantilla, con degradacion que simula escaneo (rotacion, ruido, desenfoque, artefactos JPEG y sombras). Las etiquetas se derivaron alineando el ground truth del generador contra los tokens del OCR, y los documentos con etiquetado dudoso se excluyeron en lugar de marcarse como `O`, una decision de calidad de datos que evita introducir ruido en clases negativas. No se uso ningun documento real de ninguna empresa. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de alineacion posterior al afinamiento supervisado.

El espacio de etiquetas son 39 clases BIO sobre 19 entidades semanticas compartidas entre tipos de documento. La entidad es agnostica al tipo de papel (`DOC_NUMBER`), y es el decodificador el que la mapea al nombre de campo concreto segun el documento (`invoice_number` en factura, `po_number` en orden de compra). Esta comparticion de entidades es una decision explicita para no dispersar el aprendizaje en 67 clases con pocas decenas de ejemplos cada una.

## Capacidades

- Extraccion de campos de cabecera en documentos de negocio escaneados: numero de documento, fecha, nombre de las partes, importe total, numero de lote, fecha de caducidad, estado del resultado y otras entidades del espacio de 19.
- Token classification con etiquetado BIO, procesable por un decodificador posterior que agrupa spans en campos con nombre.
- Procesamiento multimodal de texto y layout: usa las palabras del OCR y sus cajas normalizadas al rango 0-1000.
- Generalizacion entre tres tipos de documento (factura, orden de compra, certificado de analisis) mediante entidades compartidas.
- Tolerancia parcial a degradaciones de escaneo aprendidas durante el entrenamiento (rotacion, ruido, desenfoque, JPEG, sombra).
- No soporta tool calling ni function calling en la informacion disponible.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de tokens, no un modelo generativo.
- El idioma de entrenamiento no esta documentado como campo estructurado; el material de referencia esta redactado en castellano y las plantillas se generaron con Faker, pero la model card no declara lista de idiomas.
- No dispone de modo thinking, vision generativa, audio ni ninguna capacidad especial adicional.

## Casos de uso

- Prototipado de pipelines de extraccion documental: sirve para validar de punta a punta la cadena OCR mas layout mas decodificador antes de invertir en datos reales anotados, dado su tamano contenido (126 M de parametros) y su licencia MIT.
- Extraccion en facturas de proveedores con plantilla estable: cuando el proveedor emite siempre el mismo formato, el modelo puede alcanzar valores cercanos al 0,920 de field exact-match observado en plantillas vistas, integrándose como microservicio de token classification.
- Procesamiento de ordenes de compra dentro de un ERP: el decodificador mapea `DOC_NUMBER` a `po_number` y `PARTY_NAME` a proveedor, de modo que una unica pasada del modelo alimenta varios campos del sistema.
- Revision de certificados de analisis: las entidades `LOT_NUMBER`, `EXPIRY_DATE` y `RESULT_STATUS` cubren la cabecera tipica de un certificado de calidad, util para cotejar lotes y caducidades en industria o laboratorio.
- Baseline academico o de investigacion: al publicar resultados por plantilla vista, dev y test, y compararlos contra un extractor por reglas, es un punto de partida reproducible para estudiar la memorizacion de layout en modelos de Document AI.
- Generacion de datos de evaluacion: el pipeline de datos sinteticos (ReportLab mas Faker con degradacion) descrito en la model card se puede reutilizar para crear conjuntos de validacion adicionales antes de entrenar una version con mas variedad de plantillas.
- Investigacion sobre comparticion de entidades: el diseno de 19 entidades compartidas frente a 33 campos especificos es un caso de estudio sobre como reducir el numero de clases en escenarios con pocos ejemplos por campo.
- Preanotacion asistida por humano: aunque no es apto para produccion sin supervision, puede generar candidatos de etiquetado para acelerar la revision manual de documentos con plantillas ya conocidas.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Conjunto | token-F1 | Field exact-match end-to-end |
|---|---|---|
| Plantilla vista en entrenamiento | 96,5 | 0,920 |
| Plantilla nueva (dev) | 68,1 | 0,522 |
| Plantilla nueva (test) | 72,5 | 0,508 |
| Extractor por reglas (referencia, plantilla nueva) | no disponible | 0,580 |

Comparacion directa entre el modelo en plantilla nueva y un extractor por reglas bien construido: 0,508-0,522 de field exact-match frente a 0,580 del extractor por reglas. La model card atribuye esta diferencia a que, con solo tres familias de plantilla en entrenamiento, aprender la posicion fija de un campo en la pagina resulta mas barato que aprender su relacion con la etiqueta precedente. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32, 0,25 GB en FP16 y en torno a 0,13 GB en INT8 para los pesos, mas el consumo del OCR y del tokenizador. En la practica el modelo ocupa una fraccion minima de cualquier GPU moderna.
- GPU recomendadas: funciona en cualquier GPU con al menos 2-4 GB de VRAM. No necesita A100 ni H100; una T4, una GTX 1650 o una RTX 3060 son suficientes. Las GPU de gama alta solo aportan throughput adicional en lotes grandes.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales y tambien en muchas integradas, dado el reducido numero de parametros.
- Inferencia en CPU: viable para volumenes bajos o medianos, ya que el cuello de botella real suele ser el motor de OCR, no el modelo.
- Opciones de despliegue: `transformers` es la via documentada en la model card. No se ha confirmado soporte en vLLM, llama.cpp, Ollama ni TGI en la informacion disponible. Al ser un modelo de token classification con entrada multimodal (texto mas cajas mas imagen), no encaja en los runners orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisito de integracion importante: hay que instanciar el procesador con `LayoutLMv3ImageProcessor(apply_ocr=False)` y aportar las palabras y las cajas del OCR propio, con las cajas normalizadas al rango 0-1000. El modelo no realiza OCR por si mismo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Field exact-match (plantilla nueva) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FranJCastilloC/layoutlmv3-docint-extraction | 125.947.559 | 512 tokens | Token classification para campos de factura, orden de compra y certificado | 0,508-0,522 | MIT | HuggingFace, 0 descargas |
| microsoft/layoutlmv3-base | Aproximadamente 125 M | 512 tokens | Preentrenamiento multimodal de proposito general (requiere afinamiento) | No disponible | No disponible en la informacion proporcionada | HuggingFace |
| Extractor por reglas (referencia del autor) | No aplica | No aplica | Extraccion determinista por patrones | 0,580 | No aplica | Codigo propio del autor |
| Otros modelos de Document AI de la familia LayoutLM (LayoutLMv2, LayoutXLM) | No disponible en la informacion proporcionada | No disponible | Token classification y otras tareas documentales | No disponible | No disponible | HuggingFace |

La comparacion solo es concluyente en un punto documentado por el propio autor: sobre plantillas no vistas, el extractor por reglas supera al modelo afinado. No hay datos publicados que permitan situar este modelo frente a alternativas afinadas de la misma familia en terminos de rendimiento end-to-end.

## Limitaciones y advertencias

- Memorizacion de layout: la limitacion principal documentada. El modelo aprende la posicion de los campos en las tres familias de plantilla vistas y cae bruscamente al enfrentarse a formatos nuevos. La model card advierte explicitamente: no usar en produccion sin entrenar con muchas mas variedades de layout.
- El 0,920 de field exact-match solo aplica a plantillas que el modelo ya vio durante el entrenamiento. No es extrapolable a documentos de proveedores nuevos.
- Por debajo de un extractor por reglas en plantillas nuevas (0,508-0,522 frente a 0,580), por lo que en ese escenario un sistema basado en reglas puede ser preferible.
- Entrenamiento exclusivamente con 929 documentos sinteticos de tres plantillas. No se uso ningun documento real de ninguna empresa, lo que limita la variabilidad de estilos, idiomas, tipografias y calidades de escaneo.
- Riesgo de sesgo de generador: los documentos provienen de ReportLab y Faker, por lo que los patrones de nombres, importes y fechas heredan las distribuciones de esas librerias y no la diversidad de documentos reales.
- Riesgo de alucinacion en el sentido de spans mal delimitados o entidades asignadas a texto que no corresponde, especialmente fuera de la distribucion de plantillas.
- Dependencia del OCR externo: el modelo no hace OCR. Si el OCR entrega palabras o cajas malas, o cajas fuera del rango 0-1000, el resultado se degrada.
- Limite de 512 tokens: cabeceras muy largas o documentos completos de varias paginas requieren fragmentacion o seleccion previa de region, con el consiguiente riesgo de perder campos.
- Idiomas: la model card no declara una lista de idiomas soportados. No hay garantia de comportamiento fuera del idioma de las plantillas de entrenamiento.
- Licencia MIT: permisiva y compatible con uso comercial, sin obligacion de atribucion mas alla de conservar el aviso de copyright. Aun asi, la limitacion tecnica de memorizacion de layout pesa mas que la licencia a la hora de decidir un despliegue en produccion.
- Adopcion practica: 0 descargas y 0 likes en el momento de la consulta, sin senales de uso en produccion por terceros.
- Fechas de publicacion y actualizacion poco convencionales (2026-09-25), sin que la informacion disponible aclare el contexto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FranJCastilloC/layoutlmv3-docint-extraction
- Repositorio de codigo del autor: https://github.com/FranJCastilloC/Clasificaci-n-y-extracci-n-OCR-de-documentos
- Modelo base: https://huggingface.co/microsoft/layoutlmv3-base
- Paper de LayoutLMv3 (arXiv): https://arxiv.org/abs/2204.08387
- Paper de LayoutLMv3 (ar5iv, HTML): https://ar5iv.labs.arxiv.org/html/2204.08387
- Documentacion de LayoutLMv3 en Transformers: https://huggingface.co/docs/transformers/main/en/model_doc/layoutlmv3
- Repositorio oficial unilm de Microsoft: https://github.com/microsoft/unilm/blob/master/layoutlmv3/README.md
