# MahoCommerce/Real_HAT_GAN_sharper-ONNX

## Resumen

Real_HAT_GAN_sharper-ONNX es una exportación a formato ONNX del modelo de superresolución de imagen `Real_HAT_GAN_SRx4_sharper.pth`, perteneciente a la familia HAT (Hybrid Attention Transformer) del repositorio XPixelGroup/HAT. El modelo original fue desarrollado por Xiangyu Chen, Xintao Wang, Jiantao Zhou, Yu Qiao y Chao Dong y presentado en el artículo "Activating More Pixels in Image Super-Resolution Transformer" (CVPR 2023). Esta conversión concreta la publica MahoCommerce para integrarla en el editor de imágenes de su plataforma Maho, y está pensada para ejecutarse en el navegador mediante transformers.js.

No se trata de un modelo de lenguaje sino de una red de imagen a imagen especializada en reescalado 4×. Recibe un tensor `pixel_values` de forma fija `[1, 3, 192, 192]` con valores en el rango 0-1 y devuelve un tensor `reconstruction` de forma `[1, 3, 768, 768]`. La exportación se realizó con spandrel 0.4.2 y `torch.onnx.export` con opset 17, y el repositorio ocupa aproximadamente 0,2 GB.

Su relevancia práctica es acotada pero clara: permite añadir superresolución 4× de calidad GAN en aplicaciones web sin backend, a coste de una ventana de entrada fija de 192 × 192 píxeles que obliga a trocear las imágenes grandes y de una restricción estricta a fp32, ya que en fp16 el modelo produce valores NaN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HAT (Hybrid Attention Transformer) con discriminador GAN; exportada con `model_type` declarado como `swin2sr` para compatibilidad con transformers.js |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 192 × 192 píxeles) |
| Tipos de cuantizacion | solo fp32; fp16 produce valores NaN |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo subyacente es HAT, un transformer híbrido para superresolución que combina atención por ventanas con atención por canales y una rama convolucional, con el objetivo declarado de "activar más píxeles" en el proceso de reconstrucción. La variante `Real_HAT_GAN_SRx4_sharper` corresponde a un modelo entrenado con pérdida adversaria (GAN) y factor de escala 4×, orientado a producir resultados visualmente más nítidos que las variantes puramente regresivas. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO (no aplicables en este dominio).

La innovación técnica relevante de esta ficha no está en el modelo sino en su empaquetado: la exportación a ONNX con spandrel y la declaración de `model_type` como `swin2sr` en `config.json` permiten que transformers.js cargue el archivo con `AutoModelForImageToImage` aunque la arquitectura real sea HAT. La forma de entrada está fijada en compilación, lo que implica que cualquier imagen mayor debe dividirse en teselas de 192 × 192 píxeles antes de la inferencia.

## Capacidades

- Superresolución de imagen con factor de escala 4×: entrada 192 × 192, salida 768 × 768.
- Reconstrucción de detalle fino orientada a nitidez, gracias al entrenamiento con pérdida adversaria.
- Ejecución en navegador mediante transformers.js y ONNX Runtime Web.
- Compatibilidad con el pipeline `image-to-image` de la librería transformers.js.
- Procesamiento por teselas para imágenes de mayor resolución que la ventana fija.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá del reescalado.

## Casos de uso

- Mejora de miniaturas en un editor de imágenes web: el modelo se carga con transformers.js y procesa teselas de 192 × 192 en el cliente, sin enviar la imagen a un servidor, lo que reduce latencia percibida y coste de infraestructura.
- Reescalado de imágenes de producto en comercio electrónico: MahoCommerce lo integra en su editor para generar versiones 4× de fotografías de catálogo, aprovechando la nitidez que aporta el entrenamiento GAN.
- Restauración de capturas y material gráfico de baja resolución: útil para imágenes que se han comprimido o reducido y necesitan recuperar detalle antes de imprimirse o publicarse.
- Preprocesado en pipelines de visión por computador: aumentar la resolución de recortes pequeños antes de pasarlos a un detector o clasificador que rinda mejor con entradas de mayor tamaño.
- Procesamiento por lotes en el navegador para aplicaciones de edición fotográfica: al ejecutarse en ONNX Runtime Web, permite ofrecer la función sin backend dedicado, troceando la imagen y recomponiendo las teselas.
- Prototipado rápido de funciones de superresolución en demos y herramientas internas: la licencia Apache-2.0 y el formato ONNX facilitan la integración en cualquier stack JavaScript sin dependencias de Python en producción.
- Mejora de imágenes en aplicaciones de archivo o patrimonio digital: reescalado 4× de fotografías escaneadas de baja resolución antes de su catalogación, siempre que se acepte el procesamiento por teselas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB y el modelo solo admite fp32, por lo que el peso en memoria es moderado pero superior al de una versión fp16 equivalente.
- GPU recomendadas: no disponible. Al ejecutarse vía transformers.js y ONNX Runtime Web, puede correr en GPU integradas o dedicadas a través de WebGPU/WebGL del navegador, así como en CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU de consumo moderna, dado el tamaño del repositorio y la ventana de entrada fija de 192 × 192; no se dispone de cifras concretas de consumo.
- Opciones de despliegue: transformers.js (vía `AutoModelForImageToImage`), ONNX Runtime Web y, en general, cualquier runtime compatible con ONNX opset 17 en fp32.
- Latencia y throughput: no disponibles. La inferencia por teselas implica que el tiempo total escala con el número de teselas de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Escala | Entrada | Formato | Licencia |
|---|---|---|---|---|---|
| Real_HAT_GAN_sharper-ONNX (este) | HAT + GAN | 4× | 192 × 192 fija | ONNX fp32 | Apache-2.0 |
| Real_HAT_GAN_SRx4_sharper (original) | HAT + GAN | 4× | no disponible | PyTorch (.pth) | Apache-2.0 |
| Swin2SR (referencia de compatibilidad) | Swin2SR | variable | no disponible | varios | no disponible |

La comparación con alternativas de la misma categoría (por ejemplo, otros exportadores ONNX de modelos de superresolución como Real-ESRGAN o SwinIR) no está disponible en la información proporcionada. El único punto de comparación documentado es el modelo original en PyTorch del que deriva esta exportación, con la diferencia de que la versión ONNX impone forma de entrada fija y fp32 obligatorio.

## Limitaciones y advertencias

- Entrada de forma fija: solo acepta tensores `[1, 3, 192, 192]`; las imágenes mayores deben trocearse manualmente, lo que puede introducir costuras visibles entre teselas.
- Solo fp32: en fp16 el modelo devuelve NaN, lo que descarta optimizaciones de memoria y velocidad habituales en despliegues de producción.
- `model_type` declarado como `swin2sr` aunque la arquitectura real es HAT: es un truco de compatibilidad con transformers.js que puede confundir a quien inspeccione el `config.json` o intente cargar el modelo con otras herramientas.
- Riesgo de artefactos propios de los modelos GAN de superresolución: texturas inventadas, halos o detalles plausibles pero falsos, especialmente en zonas con mucho ruido o compresión.
- Sesgos: no documentados en la información disponible; al ser un modelo visual, puede comportarse de forma desigual según el tipo de contenido de la imagen.
- Idiomas: no aplica, pero conviene señalar que no procesa texto ni metadatos.
- Licencia Apache-2.0: permite uso comercial y modificación, pero exige conservar los avisos de copyright y la atribución a los autores originales de HAT.
- Advertencia de producción: al ejecutarse en el navegador, el rendimiento depende del dispositivo del usuario y de la disponibilidad de WebGPU/WebGL; conviene prever una ruta de fallback en CPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MahoCommerce/Real_HAT_GAN_sharper-ONNX
- Repositorio original de HAT: https://github.com/XPixelGroup/HAT
- Sitio de MahoCommerce: https://mahocommerce.com
- Artículo: Chen, X., Wang, X., Zhou, J., Qiao, Y. y Dong, C. "Activating More Pixels in Image Super-Resolution Transformer", CVPR 2023 (referencia bibtex incluida en la model card; no se proporciona URL directa).
