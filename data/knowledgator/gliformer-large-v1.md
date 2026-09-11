# knowledgator/gliformer-large-v1

## Resumen

GLiFormer Large v1 es un modelo encoder de 575,6 millones de parametros desarrollado por Knowledgator. Se presenta como un unico encoder capaz de resolver de forma simultanea varias tareas de comprension documental: reconocimiento de entidades nombradas (NER), clasificacion de texto, extraccion de relaciones, extraccion estructurada de registros y generacion de embeddings de texto. La innovacion principal es que las etiquetas de tarea y los esquemas de extraccion se especifican en tiempo de inferencia, de modo que no hace falta reentrenar ni desplegar un modelo distinto por caso de uso.

El modelo comparte un encoder basado en DeBERTa con distintas cabezas de tarea, y su arquitectura es sensible al layout, por lo que admite entradas de texto y de disposicion documental (por ejemplo, documentos PDF). La model card indica que los ejemplos de uso y los resultados de calidad publicados se centran en tareas de texto. Los pesos ocupan 2,3 GB en el repositorio de HuggingFace y el modelo se distribuye con la libreria propia `gliformer`, que requiere Python 3.10 o superior.

Es relevante ahora porque agrupa en un solo checkpoint tareas que tradicionalmente exigen varios modelos especializados (NER, clasificacion, relation extraction, structuring y embeddings), con soporte de esquemas anidados validados con Pydantic. Su licencia no esta declarada en la informacion disponible, lo que condiciona cualquier evaluacion para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo DeBERTa con cabezas de tarea compartidas y capacidad de procesamiento de layout documental |
| Parametros totales | 575,6 millones |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (carga mediante la libreria `gliformer` sobre PyTorch) |
| Dimension de embeddings | 1024 |
| Tamano del repositorio | 2,3 GB |
| Pipeline declarado | token-classification |
| Libreria | gliformer (Python 3.10+) |
| Atencion | Eager en CPU; kernels CUDA opcionales con extra `flash` |

## Arquitectura y entrenamiento

GLiFormer Large v1 utiliza un encoder DeBERTa compartido entre multiples cabezas de tarea. El modelo acepta en inferencia tanto etiquetas de tarea (tipos de entidad, clases de clasificacion) como esquemas de extraccion definidos por el usuario, incluidos esquemas Pydantic anidados que permiten construir registros multinivel con relaciones padre-hijo. La arquitectura esta disenada para ser sensible al layout, de forma que soporta entradas de texto plano y de estructura documental; la model card senala explicitamente que los ejemplos y las evaluaciones publicadas se centran en tareas de texto. El checkpoint dispone de una cabeza de relaciones conjuntas, lo que permite extraer entidades y relaciones en una sola pasada con la opcion `joint_relations`; el metodo `predict_relations` requiere una cabeza de relaciones abierta que este checkpoint no incluye.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card solo describe la evaluacion reportada sobre 26 conjuntos de datos de NER (131.156 ejemplos), 5 dominios de CrossNER (2.505 ejemplos), 13 conjuntos de clasificacion (79.828 ejemplos) y 500 ejemplos de estructuracion multinivel. El propio autor advierte que esos resultados historicos no registran hashes de checkpoint, por lo que no puede establecerse una coincidencia binaria exacta con esta release concreta.

## Capacidades

- Reconocimiento de entidades nombradas con tipos definidos en tiempo de inferencia; cada entidad devuelve `text`, `label`, `start`, `end` y `score`, con offsets de caracter y fin exclusivo.
- Clasificacion de texto con etiquetas arbitrarias, incluidos grupos con nombre (por ejemplo, `{"sentiment": [...], "topic": [...]}`).
- Extraccion de relaciones conjunta: entidades y relaciones se suministran juntas mediante `joint_relations`.
- Extraccion estructurada directa a diccionarios de Python, con esquemas planos o anidados y validacion opcional mediante Pydantic (`validate_output=True`).
- Ejecucion de multiples tareas en una sola llamada: NER, clasificacion y structuring comparten el mismo `inference`.
- Generacion de embeddings de texto de 1024 dimensiones para similitud semantica.
- Extraccion de caracteristicas (feature extraction) y comprension documental con entrada sensible al layout.
- Procesamiento por lotes: se puede pasar una lista de textos con `batch_size` (por ejemplo, 8) para extraccion por lotes.
- No dispone de generacion de texto autoregresiva, tool calling, capacidades de agente, vision, audio ni modo de razonamiento explicito, segun la informacion disponible.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Extraccion de entidades en documentos corporativos: el modelo permite declarar en cada llamada los tipos de entidad relevantes (persona, organizacion, ubicacion), de modo que un mismo despliegue sirve para contratos, facturas o informes cambiando solo la lista de etiquetas.
- Digitalizacion de PDF con layout: al ser sensible al layout, se puede emplear para procesar documentos PDF estructurados donde la posicion del texto aporta informacion, manteniendo un unico encoder para varias tareas posteriores.
- Construccion de registros estructurados: con `structure` y esquemas Pydantic anidados se pueden generar objetos como empresa > departamento > empleado directamente desde texto no estructurado, lo que encaja en pipelines de ingesta de datos.
- Analisis de sentimiento y tematizacion: la clasificacion con grupos con nombre permite obtener simultaneamente polaridad y tematica sobre resenas o tickets de soporte en una sola pasada.
- Extraccion de relaciones para grafos de conocimiento: la cabeza de relaciones conjuntas facilita construir tripletas (cabeza, relacion, cola) como `Alice - works_at - Acme` para alimentar bases de grafos.
- Busqueda semantica y deduplicacion: los embeddings de 1024 dimensiones permiten indexar documentos y calcular similitud por coseno para recuperacion o agrupamiento.
- Anonimizacion y enmascarado de datos: combinando NER con offsets de caracter se pueden localizar y sustituir identificadores personales en textos antes de almacenarlos.
- Enriquecimiento de pipelines de analitica documental: al ejecutar NER, clasificacion y structuring en una unica llamada (`inference`), se reduce el numero de modelos en produccion y el coste de orquestacion.

## Benchmarks y rendimiento

Resultados reportados por el autor (porcentajes). La model card indica que son mediciones historicas del proyecto GLiFormer-large, no reejecutadas para esta ficha, y que no registran hashes de checkpoint.

| Tarea | Metrica | Puntuacion |
|---|---|---|
| NER, 26 conjuntos de datos / 131.156 ejemplos | F1 estricto de entidad, media por conjunto | 50,91 |
| CrossNER, 5 dominios / 2.505 ejemplos | F1 estricto de entidad, media por dominio | 64,35 |
| Clasificacion, 13 conjuntos de datos / 79.828 ejemplos | Macro-F1 medio por conjunto | 75,03 |
| Estructuracion multinivel, 500 ejemplos | F1 JSON sin orden y tolerante a fronteras | 91,10 |

Notas metodologicas declaradas: las medias por conjunto ponderan todos los conjuntos por igual; en NER deben coincidir span y tipo; la macro-F1 de clasificacion promedia las F1 por clase dentro de cada conjunto; la metrica de estructuracion compara rutas de valores JSON aplanadas tras alinear registros sin exigir su orden original y con reparaciones limitadas de fronteras, por lo que no equivale a coincidencia JSON exacta. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 575,6 M de parametros, no publicada por el autor): en FP32 unos 2,3 GB solo de pesos; en FP16/BF16 unos 1,15 GB; en INT8 alrededor de 0,6 GB; en INT4 alrededor de 0,3 GB. Hay que sumar memoria para activaciones, tokenizador y lote.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con lotes pequenos. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 6 GB o mas en FP16 y en practicamente cualquier GPU moderna con cuantizacion de 8 o 4 bits; el dato no esta confirmado por el autor.
- CPU: soportada, con atencion eager. Se pueden instalar kernels CUDA opcionales de atencion con `pip install -e ".[flash]"` para acelerar en GPU.
- Opciones de despliegue: la libreria oficial `gliformer` (instalable con `pip install gliformer -U` o clonando el repositorio y ejecutando `pip install -e .`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLiFormer Large v1 | 575,6 M | no disponible | NER, clasificacion, relation extraction, structuring, embeddings | no disponible | HuggingFace + libreria `gliformer` |
| DeBERTa-v3-large (encoder base de referencia) | 435 M | 512 tokens de posicion maxima tipica | Modelo base de representacion, sin cabezas de extraccion listas para uso | MIT | HuggingFace, transformers |
| Modelos de la familia GLiNER (extraccion zero-shot de entidades) | no disponible en la informacion proporcionada | no disponible | NER zero-shot principalmente | no disponible en la informacion proporcionada | HuggingFace |

GLiFormer Large v1 se distingue de un encoder puro como DeBERTa-v3-large por incorporar cabezas de tarea y esquemas definidos en inferencia, y de los modelos centrados en NER zero-shot por cubrir tambien clasificacion, relaciones y estructuracion bajo el mismo checkpoint. La comparacion cuantitativa de rendimiento con esas alternativas no puede realizarse con los datos disponibles: el autor no publica comparativas directas y las metricas reportadas corresponden a medias agregadas sobre conjuntos propios.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no puede asumirse permiso para uso comercial ni para redistribucion; es un bloqueo potencial para produccion.
- Solo ingles: el modelo declara unicamente el idioma `en`, por lo que su uso en castellano u otros idiomas no esta soportado ni evaluado.
- Longitud de contexto desconocida: no se especifica la ventana maxima, lo que impide planificar con seguridad el procesamiento de documentos largos.
- Riesgo de alucinacion y de falsos positivos: la extraccion depende del esquema, la entrada y los umbrales (`threshold`) elegidos; umbrales bajos aumentan el ruido y altos pueden eliminar entidades validas.
- La validacion con Pydantic comprueba la conformidad con el esquema de salida, no la veracidad de los datos extraidos.
- La metrica de estructuracion reportada (F1 JSON sin orden y tolerante a fronteras) es mas laxa que una coincidencia JSON exacta, por lo que no debe interpretarse como precision perfecta.
- Trazabilidad de los resultados limitada: el autor advierte que los informes historicos no registran hashes de checkpoint y no puede garantizarse que correspondan exactamente a esta release.
- Uso de `predict_relations` no disponible en este checkpoint: hay que emplear `joint_relations`.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No se declaran sesgos conocidos ni auditorias de sesgo en la informacion disponible.
- Rendimiento dependiente del hardware: en CPU la atencion es eager y no usa los kernels CUDA opcionales, con la penalizacion de latencia correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/knowledgator/gliformer-large-v1
- Repositorio del framework GLiFormer: https://github.com/Knowledgator/GLiFormer
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo (los resultados obtenidos eran documentos legales en frances sin relacion con la ficha); no se dispone de enlace al paper o manuscrito, a demos ni a blogs adicionales.
