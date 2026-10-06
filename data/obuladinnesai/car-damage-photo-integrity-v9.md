# obuladinnesai/car-damage-photo-integrity-v9

## Resumen

Car Damage Photo Integrity Detector v9 es un modelo de segmentacion de imagenes desarrollado por Sai Charan Obuladinne (usuario obuladinnesai) que detecta y localiza ediciones generadas por IA en fotografias de danos de automoviles. Su funcion es identificar regiones que han sido retocadas mediante inpainting para anadir, eliminar o exagerar danos en un vehiculo, devolviendo para cada foto un mapa de calor por pixel y una puntuacion global (a mayor valor, mayor probabilidad de manipulacion).

Tecnicamente se apoya en un encoder ConvNeXt-Tiny (inicializado con `timm/convnext_tiny.fb_in22k`, pesos de ImageNet-22k) combinado con un segundo flujo de residual de ruido basado en filtros SRM y filtros aprendidos de 5x5, fusionados ambos por un decoder de tipo FPN/U-Net. Con 29.430.892 parametros (~29,4 M) y 118 MB en safetensors fp32, es un modelo ligero que procesa la imagen a resolucion completa en una sola pasada.

Su relevancia actual radica en el contexto de las reclamaciones de seguros: con la generalizacion de la edicion fotografica mediante difusion (Stable Diffusion 1.5, SDXL, Kandinsky 2.2, LaMa), disponer de una senal automatica de triaje que marque posibles fotos manipuladas permite priorizar la revision humana. El modelo esta publicado bajo licencia Apache-2.0 y viene acompanado de scripts de inferencia, entrenamiento y evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder ConvNeXt-Tiny (timm `convnext_tiny.fb_in22k`) + flujo de residual de ruido (filtros SRM + filtros aprendidos 5x5, stages a strides 2-16) + decoder FPN/U-Net; salida de mapa de logits de 1 canal a media resolucion (stride 2) |
| Parametros totales | 29.430.892 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, procesa la imagen a resolucion completa en una sola pasada) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos en fp32; no se documentan versiones cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, ~118 MB) |

## Arquitectura y entrenamiento

El modelo combina dos flujos de caracteristicas. El primero es un encoder ConvNeXt-Tiny preentrenado en ImageNet-22k, que aporta representaciones semanticas de la imagen. El segundo es un flujo de residual de ruido compuesto por filtros SRM de paso alto fijos junto con filtros aprendidos de 5x5, con etapas convolucionales a strides de 2 a 16, pensado para captar las huellas de baja frecuencia que deja el inpainting. Un decoder de tipo FPN/U-Net fusiona ambos flujos y produce un mapa de logits de manipulacion de 1 canal a media resolucion (stride 2). La puntuacion de imagen se obtiene como la media de los 256 logits mas altos del mapa, es decir, los aproximadamente 1.000 pixeles mas sospechosos.

El entrenamiento utiliza 3.298 fotos editadas por inpainting a partir de imagenes de CarDD-train, generadas con Stable Diffusion 1.5 (1.474), SDXL (564), Kandinsky 2.2 (466) y LaMa (589); las mascaras de pixel se derivan de la diferencia entre cada inpaint y su foto original. Aproximadamente el 20% de cada lote se compone de ediciones sinteticas de pegado de parches minusculos. Como fotos reales se emplean CarDD train (2.607), Open Images (3.000) y 1.500 fotos privadas no publicadas. Se aplica una comprobacion de fugas por casi duplicados contra el conjunto de evaluacion, y la perdida combina BCE por pixel mas Dice sobre el mapa, junto con una perdida a nivel de imagen sobre la puntuacion top-256. El entrenamiento consta de 20.000 pasos con batch de 8, recortes a resolucion completa de 512 px y aumentacion de JPEG, redimensionado y desenfoque tanto en fotos reales como editadas; el checkpoint liberado corresponde al paso 16.000, elegido por mejor rendimiento en una particion de validacion reservada.

## Capacidades

- Deteccion de ediciones por IA en fotografias de danos de vehiculos, orientada especificamente a inpainting (anadir, eliminar o exagerar danos).
- Localizacion a nivel de pixel: genera un mapa de calor (heatmap) de manipulacion con valores en el rango [0, 1].
- Puntuacion global por imagen: un unico valor que indica la probabilidad de edicion, calculado como la media de los 256 logits mas altos del mapa.
- Clasificacion binaria mediante umbral ajustable por condicion de foto (`jpeg_q90`, `upload`, `native`).
- Procesamiento a resolucion completa en una sola pasada, sin redimensionado ni teselado (tiling).
- Deteccion de ediciones generadas con multiples modelos de difusion e inpainting (Stable Diffusion 1.5, SDXL, Kandinsky 2.2, LaMa).
- Salida en formato JSON con los campos `image`, `score`, `threshold`, `flagged`, `condition` y `max_heat`.
- No dispone de tool calling, capacidades de agente, razonamiento multi-paso ni procesamiento de lenguaje natural; es exclusivamente un modelo de vision para segmentacion.

## Casos de uso

- Triaje de reclamaciones de seguros de automovil: el modelo puntua cada foto de danos y marca las sospechosas por encima del umbral de 2% de falsos positivos, permitiendo que el perito humano revise primero las imagenes con mayor riesgo de manipulacion.
- Peritaje asistido: el mapa de calor localiza la region concreta manipulada, de modo que el perito puede inspeccionar visualmente la zona sospechosa y confirmar si el dano fue anadido o borrado.
- Verificacion en plataformas de venta de vehiculos: validar que las fotos subidas por el vendedor de danos no han sido retocadas antes de publicar el anuncio, reduciendo el fraude en la descripcion del estado del coche.
- Gestion de siniestros en flotas de alquiler o leasing: comprobar automaticamente las fotos de devolucion del vehiculo para detectar manipulaciones en la documentacion del estado del coche tras el uso.
- Auditoria de proveedores de tasacion: incorporar la deteccion de manipulacion como control de calidad en los informes de danos recibidos de terceros antes de aprobar un pago.
- Control forense de imagenes en disputas legales: aportar una senal tecnica objetiva (puntuacion y mapa) que complemente el analisis humano en casos de reclamaciones potencialmente fraudulentas.
- Automatizacion integrada en pipelines de tramitacion: llamar a `inference.py` desde un flujo de procesamiento por lotes que reciba las fotos de una reclamacion y emita una etiqueta de triaje junto con el heatmap para almacenamiento.

## Benchmarks y rendimiento

Los datos disponibles se miden con un umbral fijado a un 2% de tasa de falsos positivos sobre fotos reales (12 de las 600 fotos reales de test de CarDD val/test se marcan). El porcentaje indica la proporcion de fotos editadas detectadas a ese umbral, y el umbral se ajusta por separado para cada condicion de foto.

| Modelo | Condicion de foto | Fotos editadas detectadas @ 2% FPR | AUROC |
|---|---|---|---|
| v9 | Reguardado como JPEG calidad 90 | 85,3% | 0,948 |
| v9 | Ajuste de subida (lado maximo 1600 px + JPEG calidad 85) | 81,6% | 0,933 |
| v7 (mejor version anterior) | Archivos originales | 56,0% | 0,888 |
| v7 | Ajuste de subida | 52,9% | 0,870 |

En la condicion de subida, v9 marca aproximadamente 82 de cada 100 fotos editadas mientras que marca erroneamente unas 2 de cada 100 fotos reales.

Desglose adicional de subgrupos reportado por el autor:

| Subgrupo | Ajuste de subida | JPEG q90 |
|---|---|---|
| Ediciones pequenas (0,5-3% de la foto) | 61,3% detectadas | 67,8% detectadas |
| Escenas totalmente generadas por IA (text-to-image, no ediciones) | 41% | 45% |

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan unos 118 MB; el consumo total dependera de la resolucion de entrada y del batch. Para una sola imagen a resolucion completa con recortes de 512 px, la huella de activaciones se mantiene baja, por lo que el modelo cabe holgadamente en GPUs de consumo (estimacion inferior a 2 GB, sin cifra oficial publicada).
- GPU recomendadas: cualquier GPU moderna con suficiente memoria; dado el tamano (29,4 M de parametros), modelos consumer como RTX 3060, RTX 4090 o superiores lo ejecutan sin problema. Tambien es viable en GPU de datacenter (A100, H100) para procesamiento por lotes de alto volumen.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual gracias a su tamano reducido. Tambien es probable que funcione en CPU para inferencia puntual, aunque no se documentan tiempos.
- Opciones de despliegue: la libreria indicada es PyTorch con `timm`; el repo proporciona `inference.py` y `model_v9.py` como scripts de inferencia. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI (son frameworks fundamentalmente orientados a modelos de lenguaje, no aplicables directamente aqui).
- Latencia y throughput: no disponibles (no se publican mediciones de latencia ni de imagenes por segundo).

## Comparativa con modelos similares

El repositorio menciona dos lineas base con las que el autor compara su trabajo (TruFor y RADAR), incluidas como sondas de referencia en la carpeta `code/`. No se aportan resultados numericos comparativos frente a ellas en la informacion disponible, por lo que la comparacion se limita a la categoria.

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Car Damage Photo Integrity Detector v9 | Deteccion de manipulacion en fotos de danos de coche (ConvNeXt-Tiny + residual de ruido + FPN/U-Net) | 29,4 M | Imagen a resolucion completa en una pasada | Apache-2.0 | HuggingFace (obuladinnesai/car-damage-photo-integrity-v9) |
| TruFor | Deteccion de manipulacion de imagenes de proposito general | no disponible | no disponible | no disponible | referenciado como linea base en el repo |
| RADAR | Deteccion de imagenes generadas por IA / manipuladas | no disponible | no disponible | no disponible | referenciado como linea base en el repo |

No se dispone de datos suficientes sobre TruFor ni RADAR dentro de la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- No alcanza el objetivo del 90% de deteccion fijado por el autor.
- Punto debil en ediciones pequenas (0,5-3% de la foto): solo detecta el 61,3% en el ajuste de subida y el 67,8% tras JPEG q90.
- Escenas totalmente generadas por IA (text-to-image, no ediciones localizadas): solo detecta el 41% en el ajuste de subida y el 45% tras JPEG q90, mientras que la version v7 detectaba el 98-99% de esos casos. v9 esta disenado especificamente para ediciones localizadas, no para imagenes sinteticas completas.
- Es una senal de triaje para revision humana, no una prueba de edicion ni de fraude. No debe usarse como evidencia concluyente.
- La puntuacion depende de la condicion de preprocesado; comparar puntuaciones entre condiciones distintas (`native`, `jpeg_q90`, `upload`) no es fiable, y el propio autor desaconseja `native` para comparaciones.
- El umbral por defecto esta calibrado a un 2% de falsos positivos, lo que implica que aproximadamente 2 de cada 100 fotos reales se marcan erroneamente como editadas.
- El entrenamiento se apoya en un conjunto especifico (CarDD mas Open Images mas fotos privadas); no se documenta su comportamiento fuera de fotografias de danos de vehiculos.
- Una parte de los datos de entrenamiento (1.500 fotos privadas) no se ha publicado, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia Apache-2.0, que permite uso comercial, pero no se especifican garantias ni condiciones adicionales por parte del autor.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, con escasa validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/obuladinnesai/car-damage-photo-integrity-v9
- Repositorio de versiones anteriores (v5-v8, codigo e informes): https://huggingface.co/obuladinnesai/claim-photo-integrity-detector-v5
- Perfil del autor: https://huggingface.co/obuladinnesai
- Dataset de entrenamiento CarDD: https://huggingface.co/datasets/shawnmichael/CarDD
- Modelo base ConvNeXt-Tiny (timm): https://huggingface.co/timm/convnext_tiny.fb_in22k
- Informe completo de evaluacion v7 vs v9 (dentro del repo): `reports/report_v7_vs_v9.html`
