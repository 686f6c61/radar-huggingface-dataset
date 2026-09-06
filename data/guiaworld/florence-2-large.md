# GuiAworld/Florence-2-large

## Resumen

Florence-2-large es un modelo fundacional de visión desarrollado originalmente por Microsoft, que unifica múltiples tareas de visión y lenguaje mediante un enfoque basado en prompts. Esta versión concreta, publicada por GuiAworld, es un continuo pretraining del modelo original con una longitud de contexto ampliada a 4.096 tokens. El autor advierte que solo se han utilizado 0.100 millones de muestras para este ajuste adicional, por lo que el modelo podría no estar completamente entrenado. La arquitectura es secuencia a secuencia y el modelo tiene 776,7 millones de parámetros, con un tamaño de repositorio de 3,1 GB en formato safetensors. Está diseñado para tareas como captioning, detección de objetos, grounding de frases y OCR, y se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer secuencia a secuencia (encoder-decoder) |
| Parametros totales | 776.721.497 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Florence-2-large es un modelo de visión fundacional basado en una arquitectura secuencia a secuencia que procesa imágenes y texto de forma conjunta. El modelo original fue entrenado por Microsoft con el dataset FLD-5B, que contiene 5.400 millones de anotaciones sobre 126 millones de imágenes, lo que le permite abordar múltiples tareas mediante el uso de prompts específicos como `<OD>`, `<CAPTION>` o `<DENSE_REGION_CAPTION>`. Esta versión de GuiAworld parte del modelo original y realiza un continuo pretraining con 0,1 mil millones de muestras adicionales, ampliando la longitud de contexto a 4.096 tokens y actualizando la tarea de OCR para incluir separadores de línea. No se han publicado detalles sobre datos de entrenamiento adicionales ni sobre procesos de alineación como RLHF o DPO.

## Capacidades

- Generacion de descripciones de imagenes en tres niveles: `<CAPTION>`, `<DETAILED_CAPTION>` y `<MORE_DETAILED_CAPTION>`.
- Deteccion de objetos mediante el prompt `<OD>`, que devuelve bounding boxes y etiquetas.
- Grounding de frases a regiones de la imagen con `<CAPTION_TO_PHRASE_GROUNDING>`, que localiza los elementos mencionados en una frase.
- Captioning denso de regiones con `<DENSE_REGION_CAPTION>`, que genera descripciones por regiones.
- Reconocimiento optico de caracteres (OCR) actualizado con separadores de linea.
- Enfoque unificado basado en prompts para tareas de vision y lenguaje, lo que permite cambiar de tarea sin modificar los pesos.
- No se ha indicado soporte para tool calling, agentes o razonamiento multi-paso.

## Casos de uso

- Accesibilidad en aplicaciones web: se puede usar el prompt `<CAPTION>` para generar descripciones alternativas de imagenes de forma automatica, mejorando la experiencia de usuarios con discapacidad visual.
- Gestion de inventario en almacenes: con `<OD>` se pueden localizar y contar productos en fotografias, facilitando el control de stock y la automatizacion de inventarios.
- Digitalizacion de documentos: el modelo puede extraer texto de recibos, facturas o formularios mediante la tarea de OCR, integrable en flujos de trabajo de archivo y busqueda documental.
- Anotacion de datos para entrenamiento: usar `<OD>` y `<DENSE_REGION_CAPTION>` para generar automaticamente bounding boxes y etiquetas, reduciendo el coste de anotacion manual en pipelines de vision artificial.
- Busqueda visual por descripcion: con `<CAPTION_TO_PHRASE_GROUNDING>` se puede localizar un objeto concreto mencionado en una frase dentro de una imagen, util en motores de busqueda de productos o catalagos.
- Inspeccion industrial de componentes: el modelo puede detectar defectos o piezas en imagenes de fabricacion mediante `<OD>`, y generar descripciones detalladas de las zonas detectadas para reportes de calidad.
- Catalogacion de imagenes en fotografia: generar descripciones detalladas con `<MORE_DETAILED_CAPTION>` para etiquetar y organizar bancos de imagenes.

## Benchmarks y rendimiento

Segun la informacion disponible, el modelo alcanza un AP de 39.8 en COCO object detection. No se han publicado otros resultados de benchmarks ni comparativas con modelos similares en la documentacion proporcionada.

| Tarea | Resultado |
|---|---|
| COCO object detection (AP) | 39.8 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 2-3 GB para inferencia en float16, dado que el modelo tiene 776,7 millones de parametros. En float32 puede requerir alrededor de 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como RTX 3060, RTX 4060, RTX 4090 o A100. Tambien puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con GPU de consumo: si, el modelo cabe en tarjetas de gama media y alta.
- Opciones de despliegue: se puede cargar con la libreria `transformers` usando `trust_remote_code=True`. Tambien puede desplegarse en Hugging Face Inference Endpoints o en servidores con vLLM si se adapta correctamente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GuiAworld/Florence-2-large | 776,7 M | 4.096 | COCO OD AP 39.8 | MIT | HuggingFace |
| microsoft/Florence-2-base | 0,23 B | no disponible | no disponible | MIT | HuggingFace |
| microsoft/Florence-2-large | 0,77 B | no disponible | no disponible | MIT | HuggingFace |
| microsoft/Florence-2-large-ft | 0,77 B | no disponible | no disponible | MIT | HuggingFace |

## Limitaciones y advertencias

- El autor indica que esta version es un continuo pretraining con solo 0,1 mil millones de muestras, por lo que "podria no estar bien entrenada" y su rendimiento puede ser inferior al modelo original.
- Riesgo de alucinacion en las tareas de captioning, especialmente si la imagen es ambigua o contiene elementos poco frecuentes.
- La longitud de contexto esta limitada a 4.096 tokens, lo que puede ser insuficiente para imagenes muy grandes o descripciones extensas.
- No se han especificado los idiomas soportados; el modelo original esta optimizado principalmente para ingles, por lo que su rendimiento en otros idiomas puede ser limitado.
- La licencia MIT permite uso comercial, pero no se ofrecen garantias sobre el rendimiento ni la seguridad del modelo en produccion.
- Posibles sesgos derivados del dataset de entrenamiento FLD-5B, que pueden afectar a la deteccion o descripcion de ciertos grupos o tipos de objetos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GuiAworld/Florence-2-large
- Modelo original de Microsoft: https://huggingface.co/microsoft/Florence-2-large
- Comunidad Florence: https://huggingface.co/florence-community/Florence-2-large
- Informe tecnico de Florence-2: https://arxiv.org/abs/2311.06242
- Notebook de ejemplo del modelo original: https://huggingface.co/microsoft/Florence-2-large/blob/main/sample_inference.ipynb
