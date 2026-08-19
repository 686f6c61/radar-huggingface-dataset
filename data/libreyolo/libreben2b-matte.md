# LibreYOLO/LibreBEN2b-matte

## Resumen

LibreBEN2b-matte es un modelo de segmentación de imágenes diseñado específicamente para la eliminación de fondos y la predicción de mattes blandos (alpha matte) en resolución fija de 1024x1024 píxeles. Es una adaptación del modelo BEN2 Base de Prama LLC, reempaquetado por el proyecto LibreYOLO para su integración nativa en el ecosistema de la librería `libreyolo`, bajo la tarea `matte`. El modelo se distribuye bajo licencia MIT, lo que facilita su uso comercial y académico sin restricciones significativas.

El modelo resuelve el problema de la segmentación dicotómica de imágenes (DIS), es decir, la separación precisa del objeto principal del fondo. Su relevancia radica en que ofrece una alternativa ligera y de código abierto para tareas de recorte de imágenes, con un peso de solo 0.4 GB, manteniendo los parámetros aprendidos del BEN2 original sin modificaciones. La adaptación se limita a un envoltorio de metadatos del state-dict, garantizando que la salida del modelo en fp32 coincide exactamente con la red original de BEN2 Base, con una diferencia absoluta máxima de cero para tamaños de lote 1 y 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de segmentación dicotómica (BEN2 Base) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de visión) |
| Tipos de cuantizacion | fp32 nativo; cuantizaciones adicionales no especificadas |
| Idiomas soportados | no disponible (modelo de visión, sin texto) |
| Licencia | MIT |
| Formato de pesos | `.pt` (LibreYOLO), safetensors no especificado |

## Arquitectura y entrenamiento

El modelo se deriva del repositorio [PramaLLC/BEN2](https://github.com/PramaLLC/BEN2) en el commit `2c99a5da477b5523585bfa5c893888a6e818a8f6`, utilizando el checkpoint publicado en HuggingFace en la revisión `e48a20765fb421d19dcdb0bf3cc61e802ca5ec8f`. La arquitectura subyacente corresponde a la red BEN2 Base, diseñada para segmentación dicotómica de imágenes, que predice un matte suave de opacidad en el rango [0, 1] para cada píxel.

La modificación realizada por LibreYOLO consiste únicamente en un envoltorio de metadatos del state-dict; los parámetros aprendidos permanecen inalterados. El puerto devuelve logits crudos para el postprocesado compartido de mattes de LibreYOLO y no incluye los ayudantes opcionales de refinamiento de medios o de primer plano que ofrece BEN2. Los datos de entrenamiento, el número de tokens o épocas y cualquier técnica de alineación como RLHF o DPO no se detallan en la información disponible.

## Capacidades

- Predicción de mattes blandos (alpha matte) de alta calidad para segmentación de objetos en imágenes.
- Resolución nativa fija de 1024x1024 píxeles, lo que simplifica el preprocesado y garantiza consistencia en la salida.
- Generación de imágenes PNG con fondo transparente a partir de la predicción del matte.
- Integración directa con la API de LibreYOLO mediante una sola llamada a `model.predict()`.
- Compatibilidad con tamaños de lote 1 y 2 verificada con diferencia máxima nula frente al modelo original.
- Funciona exclusivamente como modelo de visión; no soporta entrada de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- Eliminación de fondos en fotografía de producto: el modelo puede recortar automáticamente el objeto principal de una imagen de catálogo, generando un PNG transparente listo para su uso en tiendas online o materiales publicitarios. Su resolución fija de 1024x1024 es adecuada para imágenes de producto estándar.
- Preparación de activos para diseño gráfico: los diseñadores pueden integrar el modelo en flujos de trabajo de batch processing para extraer sujetos de cientos de imágenes, acelerando la creación de composiciones, carteles o presentaciones.
- Generación de datasets para entrenamiento: investigadores pueden utilizar el modelo para crear máscaras de segmentación y mattes para otros modelos de visión, aprovechando la licencia MIT para redistribuir los resultados.
- Automatización de flujos de edición de vídeo: aunque el modelo trabaja con imágenes estáticas, puede aplicarse fotograma a fotograma para generar mattes de objetos en secuencias de vídeo, facilitando tareas de composición o reemplazo de fondos.
- Aplicaciones de realidad aumentada: el matte suave permite superponer objetos virtuales sobre el sujeto recortado con bordes precisos, útil en aplicaciones de prueba de productos o filtros interactivos.
- Recorte de imágenes médicas o científicas: la segmentación dicotómica puede aplicarse a imágenes de dominios específicos para aislar estructuras de interés, siempre que el objeto se distinga claramente del fondo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo carece de métricas como mIoU, F1-score o comparativas con otros modelos de segmentación en la documentación proporcionada.

## Requisitos de hardware

- Tamaño del repositorio: 0.4 GB, lo que sugiere que el modelo es relativamente ligero.
- VRAM estimada: no disponible oficialmente, pero para inferencia en fp32 a 1024x1024 con tamaño de lote 1, se estima un consumo de 4-8 GB de VRAM, dependiendo de la implementación.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060/3070, RTX 4060/4070, o GPUs de datacenter como A10 o A100. Podría ejecutarse en GPUs con 4 GB con optimizaciones, aunque no está verificado.
- Compatibilidad con GPU de consumo: sí, es plausible que funcione en GPUs de gama media de NVIDIA, aunque no se ha confirmado oficialmente.
- Opciones de despliegue: el modelo se usa a través de la librería `libreyolo`; también puede convertirse a otros formatos como ONNX o TensorRT para inferencia optimizada, aunque no se documenta explícitamente.
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación de inferencia.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas oficiales con otros modelos de eliminación de fondos. Sin embargo, por su naturaleza, puede compararse cualitativamente con alternativas populares:

| Modelo | Tipo | Licencia | Resolución | Observaciones |
|---|---|---|---|---|
| LibreBEN2b-matte | Segmentación dicotómica | MIT | 1024x1024 | Derivado de BEN2, ligero y abierto |
| rembg (U2-Net) | Segmentación de saliencia | MIT | Variable | Muy usado, pero produce máscaras binarias, no mattes blandos |
| BiRefNet | Segmentación dicotómica | MIT | Variable | Estado del arte en DIS, pero más pesado y menos accesible |

La comparativa exacta no es posible sin datos de rendimiento publicados.

## Limitaciones y advertencias

- Resolución fija de 1024x1024: las imágenes de mayor o menor resolución deben redimensionarse, lo que puede degradar la calidad del matte en objetos pequeños o imágenes de baja resolución.
- Sin ayudantes de refinamiento: el puerto no incluye las utilidades opcionales de BEN2 para refinar medios tonos o mejorar el primer plano, lo que puede afectar a casos con cabello, pelaje o bordes complejos.
- Sesgos desconocidos: no se documentan sesgos específicos, pero como modelo entrenado con datos de BEN2, puede presentar un rendimiento subóptimo en ciertos dominios (por ejemplo, objetos poco comunes o imágenes muy texturizadas).
- Riesgo de alucinación: al ser un modelo de visión, puede generar mattes incorrectos o incompletos en imágenes ambiguas, sin que exista un mecanismo de verificación.
- Limitaciones de idioma: no aplica, al ser un modelo puramente visual.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero se debe mantener el aviso de copyright de Prama LLC y de LibreYOLO según los archivos LICENSE y NOTICE.
- Para producción, se recomienda validar el rendimiento en el dominio específico antes de desplegar, dado que no hay benchmarks publicados.

## Enlaces

- [Página del modelo en HuggingFace](https://huggingface.co/LibreYOLO/LibreBEN2b-matte)
- [Repositorio original de BEN2](https://github.com/PramaLLC/BEN2)
- [Checkpoint original de BEN2 en HuggingFace](https://huggingface.co/PramaLLC/BEN2)
- [Repositorio fuente de LibreYOLO](https://github.com/LibreYOLO/libreyolo)
