# LibreYOLO/LibreViTMattes-matte

## Resumen

LibreViTMattes-matte es un modelo de matting de imágenes guiado por trimap, desarrollado por LibreYOLO. Se basa en la arquitectura ViTMatte, un Vision Transformer especializado en la extracción de alpha mattes, y ha sido entrenado en el dataset Adobe Composition-1k. El modelo toma como entrada una imagen y un trimap (que marca regiones de fondo, desconocido y primer plano) y produce un alpha matte suave en formato float32, forzando los píxeles conocidos a exactamente 0 y 1.

La relevancia de este checkpoint radica en su integración nativa en el ecosistema LibreYOLO, ofreciendo una API sencilla para tareas de matting. Es una conversión del checkpoint original de ViTMatte (hustvl/vitmatte-small-composition-1k) sin modificar los tensores aprendidos, solo añadiendo metadatos de versión. El tamaño del repositorio es de 0.1 GB, lo que indica un modelo ligero, aunque no se especifican los parámetros totales. Su licencia es no comercial, derivada del acuerdo del dataset Adobe Deep Image Matting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViTMatte (Vision Transformer) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | adobe-deep-image-matting-dataset-license (no comercial) |
| Formato de pesos | .pt (PyTorch) y safetensors (original) |

## Arquitectura y entrenamiento

El modelo emplea un Vision Transformer como backbone, siguiendo la arquitectura ViTMatte, que combina un encoder de tipo ViT con un decodificador ligero para predecir el alpha matte. El entrenamiento se realizó sobre el dataset Adobe Composition-1k, que contiene imágenes con alpha mattes reales y trimaps asociados. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión. La conversión a LibreYOLO no altera los pesos aprendidos; únicamente añade metadatos de checkpoint v1 y garantiza una paridad bit-exact en el preprocesamiento y en la generación del alpha matte con la implementación de referencia de Transformers.

## Capacidades

- Generacion de alpha matte suave a partir de una imagen y un trimap.
- Soporte de trimap con valores exactos 0/128/255 o normalizados 0/0.5/1.
- Salida en float32 sobre el lienzo original de la imagen.
- Forzado de píxeles conocidos (fondo y primer plano) a exactamente 0 y 1.
- No incluye capacidades de texto, codigo, tool calling ni agentes; es exclusivamente un modelo de segmentacion de imagenes.

## Casos de uso

- Edicion fotografica profesional: recorte de sujetos con pelo, pelaje o detalles finos donde los metodos de segmentacion binaria fallan. El modelo produce bordes suaves y precisos, adecuado para retoques en Photoshop o GIMP.
- Composicion de video: integracion de actores o objetos en fondos virtuales. El alpha matte permite separar el sujeto con transparencia realista, util en produccion audiovisual.
- Realidad aumentada: superposicion de objetos virtuales sobre escenas reales con bordes exactos, mejorando la sensacion de integracion en aplicaciones moviles o de escritorio.
- Fotografia de producto: extraccion del fondo para catalogos o tiendas online. El trimap puede generarse automaticamente con un modelo de segmentacion previo, y el matting refina los contornos.
- Diseño grafico: creacion de mascaras para ilustraciones, collages o carteles. El modelo permite aislar elementos con control fino sobre las areas desconocidas.
- Aplicaciones de retoque automatico: integracion en flujos de trabajo que requieren recortes de alta calidad, como apps de edicion de fotos o herramientas de composicion en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM, GPU recomendadas o latencia.
- El checkpoint pesa aproximadamente 103 MB (archivo safetensors original), lo que sugiere que es un modelo ligero, pero no se confirma si cabe en GPUs de consumo sin cuantizacion.
- No se indican opciones de despliegue especificas (vLLM, llama.cpp, etc.), aunque al ser un modelo de vision probablemente se ejecute con PyTorch o el runtime de LibreYOLO.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se puede mencionar que el modelo original es ViTMatte, pero no hay datos de rendimiento relativo.

## Limitaciones y advertencias

- Licencia no comercial: el checkpoint solo puede usarse y distribuirse para fines no comerciales, segun el acuerdo del dataset Adobe Deep Image Matting. No puede venderse ni utilizarse en productos comerciales.
- Requiere un trimap de entrada: es necesario un paso previo de segmentacion para generar el trimap, lo que anade complejidad al flujo de trabajo.
- Entrenado en un dataset especifico (Adobe Composition-1k): la generalizacion a otros dominios (por ejemplo, imagenes medicas o escenas con iluminacion extrema) puede ser limitada.
- No se documentan sesgos especificos, pero al ser un modelo de vision, podria presentar errores en imagenes con oclusiones complejas o transparencias multiples.
- La restriccion de licencia aplica al checkpoint preentrenado, no al codigo de LibreYOLO (MIT) ni a pesos entrenados independientemente con datos propios.

## Enlaces

- [HuggingFace - LibreYOLO/LibreViTMattes-matte](https://huggingface.co/LibreYOLO/LibreViTMattes-matte)
- [Checkpoint original - hustvl/vitmatte-small-composition-1k](https://huggingface.co/hustvl/vitmatte-small-composition-1k)
- [Repositorio ViTMatte (hustvl/ViTMatte)](https://github.com/hustvl/ViTMatte)
- [Licencia del modelo](https://huggingface.co/LibreYOLO/LibreViTMattes-matte/blob/main/LICENSE)
