# fastino/gliner2.5-base-v1

## Resumen

GLiNER2.5 Base es un modelo de extraccion de informacion unificada basada en esquemas, desarrollado por Fastino Labs. Sustituye la enumeracion clasica de spans candidatos por una arquitectura de prediccion de limites (boundary), lo que permite escalar linealmente con la longitud del documento y soportar spans de cualquier longitud dentro de la ventana codificada. Con 194 millones de parametros sobre un encoder DeBERTa-v3-base, es capaz de realizar reconocimiento de entidades nombradas, clasificacion de texto, extraccion de registros estructurados, atributos de span y extraccion de relaciones en una sola pasada.

El modelo esta pensado para inferencia local sin GPU dedicada: funciona en CPU, CUDA o MPS mediante la libreria `gliner2[local]`. Su arquitectura de decodificacion restringida permite imponer restricciones entre tareas (Classifier) y construir grafos de entidades con relaciones tipadas (JointIE). Se distribuye bajo licencia Apache-2.0 y es el checkpoint por defecto en ingles para tareas multi-tarea, con una puntuacion media de F1 de 54,87 en 16 benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BoundaryExtractor sobre encoder DeBERTa-v3-base |
| Parametros totales | 193.581.591 (194 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16 (via `quantize=True` en GPU) |
| Idiomas soportados | ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLiNER2.5 Base abandona el enfoque clasico de enumerar candidatos de spans con una cuadricula de anchos fijos. En su lugar, predice directamente los limites de inicio y fin de cada entidad mediante un emparejamiento sparse de pares start/end, lo que permite cualquier longitud de span dentro de la ventana codificada y un escalado lineal con la longitud del documento. El checkpoint base usa DeBERTa-v3-base como encoder y se carga a traves de `AutoExtractor`, que selecciona automaticamente la clase `BoundaryExtractor` segun el campo `architecture` de la configuracion.

El entrenamiento cubre multiples tareas en un solo esquema: extraccion de entidades, clasificacion de texto, registros estructurados, relaciones y atributos de spans. La decodificacion restringida se implementa mediante `Classifier` para imponer restricciones entre etiquetas de distintas tareas y `JointIE` para generar grafos de entidades con relaciones tipadas. No se han publicado detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion disponible.

## Capacidades

- Extraccion de entidades nombradas (NER) con etiquetas libres definidas por el usuario, incluyendo descripciones de dominio especifico para mejorar la precision.
- Clasificacion de texto independiente por tarea, con decodificacion restringida para imponer constraints entre etiquetas.
- Extraccion de registros estructurados y generacion de JSON desde texto no estructurado.
- Extraccion de relaciones tipadas entre entidades mediante `JointIE`.
- Atributos de spans (scoring de atributos sobre entidades detectadas).
- Decodificacion con restricciones (constrained decoding) para garantizar coherencia entre tareas.
- Inferencia local en CPU, CUDA o MPS sin API externa.
- Soporte de spans de cualquier longitud gracias a la arquitectura boundary.

## Casos de uso

- **Extraccion de entidades en documentos clinicos**: el modelo puede extraer medicamentos, dosis, sintomas y tiempos de una nota medica usando etiquetas con descripciones personalizadas, como se muestra en la documentacion oficial, y devolver offsets de caracteres para integracion directa en pipelines de historias clinicas electronicas.
- **Enriquecimiento de datos de producto**: dado un texto de catalogo, extraer nombres de producto, precios, fabricante y disponibilidad en un solo paso, estructurando la salida como JSON para alimentar sistemas de e-commerce o marketplaces.
- **Clasificacion de tickets de soporte**: clasificar mensajes de clientes en intenciones (reembolso, cancelacion, incidencia tecnica) con restricciones entre categorias para evitar resultados contradictorios.
- **Extraccion de relaciones en textos legales**: detectar pares de entidades (empresa-proveedor, persona-cargo) y sus relaciones tipadas mediante `JointIE`, util para automatizar la revision de contratos y acuerdos.
- **Monitorizacion de noticias y alertas**: extraer organizaciones, personas y ubicaciones de feeds de noticias en tiempo real con inferencia en CPU, sin depender de APIs externas, para alimentar sistemas de alertas tempranas.
- **Generacion de registros estructurados para bases de datos**: convertir texto libre en registros JSON con campos fijos (fecha, importe, entidad, tipo de operacion) para su ingreso directo en bases de datos relacionales o NoSQL.

## Benchmarks y rendimiento

Se ha publicado que el modelo obtiene una puntuacion media de F1 de 54,87 en un conjunto de 16 benchmarks de extraccion de informacion. No se han publicado desgloses por benchmark individual en la informacion disponible.

| Benchmark | F1 |
|---|---|
| Media de 16 benchmarks de extraccion de informacion | 54,87 |

## Requisitos de hardware

- VRAM estimada: con 194 M de parametros en fp16, la inferencia requiere aproximadamente 400-500 MB de VRAM en GPU; en CPU con fp32, unos 800 MB de RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, RTX 3050, GTX 1660) es suficiente; no requiere GPU de data center.
- Compatible con consumer GPU: si, incluidas tarjetas de gama baja y equipos sin GPU (inferencia en CPU).
- Opciones de despliegue: `gliner2[local]` con PyTorch, soporte de `torch.compile` para acelerar la primera pasada, cuantizacion fp16 en GPU.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque el diseno boundary elimina la enumeracion de spans, lo que reduce la complejidad computacional respecto a arquitecturas span-grid.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Tareas |
|---|---|---|---|---|---|
| fastino/gliner2.5-base-v1 | 194 M | Boundary + DeBERTa-v3-base | no disponible | Apache-2.0 | NER, clasificacion, relaciones, registros |
| fastino/gliner2.5-small-v1 | 74 M | Boundary + DeBERTa-v3-xsmall | no disponible | Apache-2.0 | NER, clasificacion, relaciones |
| fastino/gliner2.5-multi-v1 | 287 M | Boundary + mDeBERTa-v3-base | no disponible | Apache-2.0 | NER, clasificacion, relaciones (multilingue) |

La familia GLiNER2.5 comparte la misma API publica; la version base es el checkpoint por defecto en ingles, la small esta optimizada para inferencia rapida en CPU y la multi cubre multiples idiomas con mas parametros.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas de forma nativa.
- Sesgos: no se han publicado evaluaciones especificas de sesgos de genero, raza o edad en la informacion disponible.
- Riesgo de alucinacion: al ser un modelo de extraccion basado en encoder, no genera texto libre, pero puede producir falsos positivos en la deteccion de entidades si las etiquetas son ambiguas o demasiado generales.
- Longitud de contexto: no se ha publicado el tamano de la ventana de contexto; los spans estan limitados por la ventana codificada del encoder.
- Licencia: Apache-2.0 permite uso comercial, pero requiere incluir la atribucion de la licencia y el aviso de cambios si se modifica el modelo.
- Dependencia de la libreria `gliner2`: el checkpoint solo se carga con `AutoExtractor`; el cargador heredado `GLiNER2.from_pretrained(...)` no es compatible.
- Python 3.10 o superior es obligatorio para usar la libreria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/fastino/gliner2.5-base-v1
- Paper (arXiv): https://arxiv.org/abs/2507.18546
- Repositorio GitHub de GLiNER2: https://github.com/fastino-ai/GLiNER2
- Sitio de Fastino Labs: https://fastino.ai/
- Pagina del modelo en Fastino: https://fastino.ai/models/gliner2-5
- Ficha del modelo en There's An AI For That: https://theresanaiforthat.com/model/gliner2-5-base-v1/
- Modelo base GLiNER2 (version anterior): https://huggingface.co/fastino/gliner2-base-v1
