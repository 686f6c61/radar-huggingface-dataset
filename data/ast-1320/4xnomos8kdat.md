# AST-1320/4xNomos8kDAT

## Resumen

El modelo **4xNomos8kDAT** es un modelo de super-resolucion de imagenes basado en la arquitectura DAT (Dual Aggregation Transformer). Fue desarrollado por **Philip Hofmann** y publicado originalmente el 13 de agosto de 2023. La version disponible en el repositorio `AST-1320/4xNomos8kDAT` de Hugging Face es una copia de ese modelo, creada en 2026. Su proposito es ampliar fotografias por un factor de 4 (`scale: 4`) para obtener resultados realistas en la restauracion y mejora de imagenes.

Se trata de un modelo de tipo `image-to-image`, entrenado como ajuste fino (`finetune`) del modelo oficial `DAT_x4.pth` sobre el dataset **Nomos8k_sfw**, compuesto por 6118 imagenes fotograficas. El entrenamiento incluyo aumentaciones de datos "on the fly" (compresion JPEG, desenfoque y redimensionado), lo que lo hace especialmente robusto frente a imagenes comprimidas o con artefactos. No se especifican el numero de parametros ni la ventana de contexto, ya que es un modelo puramente visual y no multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DAT (Dual Aggregation Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo image-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | no disponible (se mencionan ficheros .pth y .onnx en la model card) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura **DAT**, un transformer de restauracion de imagenes que combina mecanismos de atencion por ventanas y agregacion dual para capturar dependencias locales y globales. En concreto, `4xNomos8kDAT` parte del modelo preentrenado `DAT_x4.pth` y se entrena como un ajuste fino durante 110000 iteraciones, 71 epocas y un `batch_size` de 4. La altura y anchura de las imagenes de alta resolucion usadas en entrenamiento es de 128 pixeles (`HR_size: 128`).

El conjunto de entrenamiento es el dataset **Nomos8k_sfw**, con un total de 6118 imagenes. Durante el entrenamiento se aplico una tecnica de aumentacion "on the fly" (OTF) que incluye compresion JPEG, desenfoque y redimensionado. Esta estrategia esta pensada para que el modelo aprenda a reconstruir imagenes que han sufrido degradaciones reales, como las que aparecen en fotografias comprimidas o reproducidas en pantalla. No hay informacion sobre uso de RLHF, DPO ni alineamiento por preferencias, ya que no es un modelo de lenguaje.

## Capacidades

- Realiza upscaling de imagenes fotograficas por un factor de 4 (`scale: 4`).
- Es un modelo de restauracion de imagenes orientado a super-resolucion realista, no a estilizacion ni generacion artistica.
- Ha sido entrenado con aumentaciones OTF de compresion JPEG, desenfoque y redimensionado, por lo que tiene cierta tolerancia a artefactos de compresion.
- No soporta generacion de texto, ni tool calling / function calling, ni razonamiento multimodal.
- No soporta capacidad de agentes ni multi-step reasoning.
- No aplica a idiomas, al ser un modelo puramente de vision en la modalidad image-to-image.
- El repositorio tiene un tamano de 0.2 GB, lo que sugiere un modelo relativamente ligero en comparacion con arquitecturas mas grandes.

## Casos de uso

- **Restauracion de fotografias antiguas**: puede utilizarse para ampliar digitalizaciones de baja resolucion antes de un proceso de limpieza o edicion. Al estar entrenado sobre fotografia real, conserva mejor las texturas naturales.
- **Postproduccion de fotografia de producto**: las imagenes de catalogo a menudo llegan comprimidas; este modelo puede ampliarlas x4 y reducir el aspecto borroso producido por la compresion JPEG.
- **Preprocesado para vision artificial**: en pipelines de deteccion o clasificacion, puede ampliar imagenes pequenas para que un modelo posterior detecte mejor objetos de pocos pixeles. No sustituye a un detector, pero aumenta el detalle util.
- **Impresion en gran formato**: para carteles o laminas a partir de capturas de camara de menor resolucion, el upscaling x4 permite alcanzar una densidad de pixeles suficiente sin recurrir a interpolacion simple.
- **Recuperacion de imagenes de redes sociales**: muchas fotos descargadas de redes sociales estan muy comprimidas. El modelo puede usarse como paso previo a la recompresion para mejorar la nitidez aparente.
- **Integracion en flujos de edicion fotografica**: al ofrecer ficheros ONNX, puede integrarse en herramientas de escritorio o scripts en Python como parte de un batch de procesamiento de imagenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos oficiales de PSNR, SSIM, perceptual metrics ni comparaciones frente a otros modelos de super-resolucion en la model card ni en los resultados de la busqueda web. La calidad debe evaluarse visualmente caso a caso.

## Requisitos de hardware

- **VRAM estimada**: no disponible. El modelo no publica el numero de parametros, por lo que no es posible calcular un requisito exacto.
- **GPU recomendadas**: no disponible. Dado que el repositorio ocupa 0.2 GB, es probable que quepa en una GPU de consumo, pero no hay confirmacion oficial.
- **Compatibilidad con GPU consumer**: probable, aunque no confirmado. El modelo puede ejecutarse con pesos Pytorch o en version ONNX.
- **Opciones de despliegue**: puede cargarse en un entorno Pytorch, usando ONNX Runtime para inferencia, o a traves del pipeline `image-to-image` de Hugging Face.
- **Latencia y throughput**: no disponible. No se han publicado mediciones oficiales de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Arquitectura | Escala | Licencia | Disponibilidad |
|---|---|---|---|---|
| 4xNomos8kDAT (AST-1320) | DAT | 4 | CC BY 4.0 | Hugging Face, GitHub |
| Phips/4xNomos8kDAT | No disponible | No disponible | No disponible | Hugging Face |
| AST-1320/UltraSharpV2 | No disponible | No disponible | CC BY-NC-SA 4.0 | Hugging Face |

No se dispone de especificaciones completas de los modelos comparables en la informacion proporcionada. `Phips/4xNomos8kDAT` es el mismo modelo publicado por otro usuario. `AST-1320/UltraSharpV2` es otro modelo de super-resolucion con licencia no comercial (CC BY-NC-SA 4.0), lo que limita su uso en entornos profesionales o de pago.

## Limitaciones y advertencias

- No se han publicado datos sobre el numero de parametros ni sobre la cantidad exacta de VRAM necesaria, lo que dificulta dimensionar la inferencia en produccion.
- El modelo se ha entrenado sobre el dataset `Nomos8k_sfw`, cuyo contenido no esta descrito en detalle en la ficha. Puede arrastrar sesgos del dominio concreto de imagenes que contiene.
- Riesgo de alucinacion visual: en zonas ambiguas o con perdida severa de detalle, un modelo de super-resolucion puede generar texturas o estructuras que no existen en la imagen original.
- La licencia **CC BY 4.0** permite el uso comercial con atribucion, siempre que se acredite al autor. Sin embargo, los derechos de las imagenes del dataset de entrenamiento no estan documentados; conviene verificar antes de un uso comercial.
- No soporta generacion de texto, idiomas, tool calling, agentes ni razonamiento por pasos. Es estrictamente un modelo image-to-image.
- No se han publicado evaluaciones de sesgos ni estudios de robustez frente a entradas adversarias.
- No existen benchmarks oficiales, por lo que el rendimiento debe validarse manualmente en el caso de uso concreto.

## Enlaces

- [AST-1320/4xNomos8kDAT en Hugging Face](https://huggingface.co/AST-1320/4xNomos8kDAT)
- [Phips/4xNomos8kDAT en Hugging Face](https://huggingface.co/Phips/4xNomos8kDAT)
- [Release oficial en GitHub](https://github.com/Phhofm/models/releases/tag/4xNomos8kDAT)
- [Repositorio de DAT](https://github.com/zhengchen1999/DAT)
- [Modelo preentrenado DAT_x4.pth](https://drive.google.com/file/d/1pEhXmg--IWHaZOwHUFdh7TEJqt2qeuYg)
- [Ejemplo Imgsli 1](https://imgsli.com/MTk4Mjg1)
- [Ejemplo Imgsli 2](https://imgsli.com/MTk4Mjg2)
- [Ejemplo Imgsli 3](https://imgsli.com/MTk4Mjk5)
- [AST-1320/UltraSharpV2](https://huggingface.co/AST-1320/UltraSharpV2)
