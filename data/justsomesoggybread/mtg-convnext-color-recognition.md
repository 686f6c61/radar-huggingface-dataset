# JustSomeSoggyBread/mtg-convnext-color-recognition

## Resumen

`mtg-convnext-color-recognition` es un modelo de clasificacion de imagenes desarrollado por JustSomeSoggyBread, resultado de un fine-tuning de `facebook/convnext-tiny-224` sobre un dataset de cartas de Magic: The Gathering. El modelo resuelve un problema de clasificacion multi-etiqueta: dado el escaneo o fotografia de una carta, predice los colores presentes entre los cinco del juego (blanco, azul, negro, rojo y verde). Es relevante porque permite automatizar tareas de catalogacion, inventario y organizacion de colecciones de MTG sin intervencion manual.

La arquitectura base es ConvNeXt-tiny, una CNN moderna desarrollada por Facebook AI Research que incorpora elementos de diseno de los Vision Transformers (patchify stem, normalizacion por capa, kernel sizes mayores) manteniendo la eficiencia de las redes convolucionales. El modelo tiene 27,8 millones de parametros y acepta imagenes de 224x224 pixeles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

La model card fue generada automaticamente por el Trainer de HuggingFace y varias secciones (descripcion, usos previstos, datos de entrenamiento) aparecen como "More information needed". El dataset de entrenamiento se indica como "None", por lo que no se dispone de informacion publica sobre su composicion ni tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-tiny (CNN con elementos de Vision Transformer) |
| Parametros totales | 27.823.973 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de 224x224 pixeles) |
| Tipos de cuantizacion | no disponible (solo safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ConvNeXt-tiny es una red neuronal convolucional propuesta en el articulo "A ConvNet for the 2020s" de Facebook AI Research. Moderniza las CNN clasicas incorporando elementos de los Vision Transformers: stem con kernel 4x4 y stride 4, normalizacion por capa en lugar de batch norm, kernel sizes de 7x7 en las capas profundas, y activaciones GELU. El modelo base fue preentrenado en ImageNet-1k y posteriormente fine-tuneado para la tarea de reconocimiento de colores de cartas MTG.

El entrenamiento se realizo con el Trainer de HuggingFace durante 5 epocas, con un total de 14.240 pasos (2.848 pasos por epoca, lo que sugiere un dataset de entrenamiento de aproximadamente 45.568 muestras con batch size 16). Se uso el optimizador AdamW (fused) con learning rate de 5e-05, scheduler lineal, seed 42 y mixed precision nativa (AMP). La funcion de perdida es una loss de clasificacion multi-etiqueta (los resultados muestran metricas por clase individual, lo que indica una formulacion one-vs-rest). No se documenta el uso de tecnicas como RLHF o DPO, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion multi-etiqueta de colores de cartas de Magic: The Gathering, prediciendo simultaneamente la presencia de los cinco colores: blanco (W), azul (U), negro (B), rojo (R) y verde (G).
- Procesamiento de imagenes de 224x224 pixeles en formato RGB.
- Salida de probabilidades independientes por color, lo que permite umbralizar para decidir la presencia o ausencia de cada color.
- Inferencia eficiente gracias al tamano reducido del modelo (27,8 M de parametros), adecuado para despliegue en entornos con recursos limitados.
- No soporta tool calling, generacion de texto, razonamiento multimodal ni capacidades de agente: es exclusivamente un clasificador de vision.

## Casos de uso

- Catalogacion automatica de colecciones: un usuario puede escanear sus cartas con una camara o escaner y el modelo asigna los colores de cada carta automaticamente, facilitando la creacion de inventarios digitales.
- Gestion de inventario en tiendas especializadas: integrado en un pipeline de captura de imagenes, el modelo clasifica las cartas por color para organizar el stock en expositores o bases de datos.
- Asistencia en aplicaciones de deckbuilding: al fotografiar una carta, la app puede sugerir el color o colores de la misma para filtrar busquedas en bases de datos de mazos.
- Filtrado y busqueda en archivos de imagenes: dado un lote de escaneos de cartas, el modelo etiqueta cada imagen con sus colores, permitiendo busquedas por color en repositorios locales.
- Automatizacion de procesos de compraventa: en plataformas de reventa de cartas, el modelo puede verificar que el color declarado por el vendedor coincide con el de la imagen subida.
- Clasificacion de cartas en proyectos de investigacion: util para estudios que necesiten agrupar cartas por color a partir de imagenes sin metadatos, por ejemplo en analisis de distribucion de colores en colecciones historicas.

## Benchmarks y rendimiento

Los resultados declarados por el autor sobre el conjunto de evaluacion son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0,3715 |
| Micro F1 | 0,5170 |
| Macro F1 | 0,5144 |
| Exact Match Accuracy | 0,4596 |
| Hamming Accuracy | 0,8426 |
| Precision W (blanco) | 0,6248 |
| Recall W (blanco) | 0,3821 |
| F1 W (blanco) | 0,4742 |
| Precision U (azul) | 0,6838 |
| Recall U (azul) | 0,4075 |
| F1 U (azul) | 0,5107 |
| Precision B (negro) | 0,6798 |
| Recall B (negro) | 0,3190 |
| F1 B (negro) | 0,4343 |
| Precision R (rojo) | 0,6890 |
| Recall R (rojo) | 0,4585 |
| F1 R (rojo) | 0,5506 |
| Precision G (verde) | 0,7318 |
| Recall G (verde) | 0,5115 |
| F1 G (verde) | 0,6022 |

La evolucion del entrenamiento muestra una mejora progresiva desde la epoca 1 (Micro F1 0,3689) hasta la epoca 4 (Micro F1 0,5170), con una ligera regresion en la epoca 5 (Micro F1 0,5123). El mejor punto de validacion se alcanzo en la epoca 4 (step 11.392). No se han publicado resultados comparativos con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 112 MB en FP32 (27,8 M parametros x 4 bytes) y 56 MB en FP16. Con overhead de activaciones y preprocesado, cabe comodamente en menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores ejecutan la inferencia sin problemas. Tambien es viable en hardware Apple Silicon via CoreML o en CPU con ONNX Runtime.
- Cabe en GPU consumer: si, en todas las GPU consumer modernas, incluso en las de gama de entrada.
- Opciones de despliegue: transformers (pipeline `image-classification`), ONNX Runtime, TorchScript, TensorRT Lite, o exportacion a CoreML para iOS. Al ser un modelo pequeno, tambien puede ejecutarse en CPU con latencias de decenas de milisegundos por imagen.
- Latencia estimada: en una GPU moderna (RTX 3060 o superior), la inferencia de una imagen de 224x224 deberia completarse en 5-15 ms. En CPU, entre 50 y 200 ms dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| mtg-convnext-color-recognition | 27,8 M | ConvNeXt-tiny | 224x224 | Apache 2.0 | Fine-tune especifico para colores MTG |
| facebook/convnext-tiny-224 | 27,8 M | ConvNeXt-tiny | 224x224 | MIT | Modelo base preentrenado en ImageNet-1k, sin fine-tune para MTG |
| ResNet-18 (torchvision) | 11,7 M | CNN residual | 224x224 | BSD-3 | Alternativa clasica, requiere fine-tune para la tarea MTG |
| MobileNetV2 | 3,4 M | CNN ligera | 224x224 | Apache 2.0 | Mucho mas ligero, adecuado para despliegue en edge, requiere fine-tune |

No se dispone de datos de benchmarks comparativos de estos modelos sobre la tarea especifica de reconocimiento de colores de cartas MTG. La comparativa se limita a caracteristicas arquitectonicas y de licencia.

## Limitaciones y advertencias

- El dataset de entrenamiento no esta documentado: la model card indica "None dataset", por lo que se desconoce su composicion, tamano, procedencia y posibles sesgos en la seleccion de imagenes.
- Rendimiento moderado: el Micro F1 de 0,5170 y el Exact Match Accuracy de 0,4596 indican que el modelo falla en aproximadamente la mitad de las predicciones exactas. Los recalls son especialmente bajos en las clases negro (0,3190) y blanco (0,3821), lo que sugiere dificultad para detectar estos colores en ciertas condiciones de iluminacion o diseno de carta.
- La model card fue generada automaticamente y carece de informacion sobre usos previstos, limitaciones declaradas por el autor y descripcion del problema.
- Riesgo de alucinacion no aplica al ser un modelo discriminativo de vision, pero si existe riesgo de clasificacion erronea en imagenes con condiciones de iluminacion adversas, cartas desgastadas o arte con paletas de colores ambiguas.
- No se garantiza el rendimiento fuera del dominio de cartas MTG: el modelo no es un clasificador general de imagenes y su uso en otros dominios producira resultados sin sentido.
- La licencia Apache 2.0 permite uso comercial, pero al no documentarse el dataset de entrenamiento, el usuario debe verificar que los datos utilizados no infringen derechos de terceros (las imagenes de cartas MTG son propiedad de Wizards of the Coast).
- No se proporcionan pesos cuantizados (GGUF, ONNX int8, etc.), por lo que el despliegue en hardware muy limitado requerira un proceso de cuantizacion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JustSomeSoggyBread/mtg-convnext-color-recognition
- Documentacion de ConvNeXt en HuggingFace: https://huggingface.co/docs/transformers/model_doc/convnext
- Repositorio oficial de ConvNeXt (Facebook Research): https://github.com/facebookresearch/ConvNeXt
- Documentacion de ConvNeXt en Torchvision: https://docs.pytorch.org/vision/main/models/convnext.html
- Articulo "A ConvNet for the 2020s": https://arxiv.org/abs/2201.03545
- Modelo base facebook/convnext-tiny-224: https://huggingface.co/facebook/convnext-tiny-224
