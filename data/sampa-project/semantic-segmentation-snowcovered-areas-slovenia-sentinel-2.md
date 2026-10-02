# sampa-project/semantic-segmentation-snowcovered-areas-Slovenia-sentinel-2

## Resumen

El modelo `sampa-project/semantic-segmentation-snowcovered-areas-Slovenia-sentinel-2` es un sistema de segmentación semántica binaria (nieve / no nieve) para imágenes multiespectrales Sentinel-2 de 13 bandas. Lo desarrollan Domen Kavran (Universidad de Maribor, FERI), Mihaela Triglav Čekada (Instituto Geodésico de Eslovenia) y Niko Lukač (Universidad de Maribor) en el marco del proyecto SAMPA, y se publica como material asociado al artículo "Semantična segmentacija zasneženih površin v Sloveniji na osnovi posnetkov Sentinel-2" (GIS v Sloveniji 18, 2026).

El repositorio no contiene un modelo generativo, sino dos variantes de red convolucional para segmentación densa: `GASSL-basic`, con codificador ResNet-50 inicializado mediante aprendizaje autosupervisado GASSL (MoCo sobre fMoW) y decodificador UPerNet, y `Unet`, con codificador ResNet-34 inicializado en ImageNet y decodificador U-Net. Ambas variantes consumen las 13 bandas de Sentinel-2 L1C (B1 a B12, incluida B8A) y producen logits de dos clases a 1024 × 1024 píxeles. La variante GASSL-basic obtuvo el mejor resultado publicado, con un IoU medio de 0,4027 sobre el conjunto de test independiente.

Su relevancia es doble. Por un lado, aporta un caso práctico de transferencia desde un modelo de fundación de teledetección (GASSL) a una tarea de segmentación semántica concreta. Por otro, publica pesos, estadísticas por banda y código de inferencia que reconstruye el modelo sin dependencia de PyTorch Lightning ni de los ficheros de preentrenamiento originales, lo que facilita su reutilización en pipelines de observación de la Tierra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos variantes convolucionales: `GASSL-basic` (codificador ResNet-50 inicializado con GASSL, MoCo sobre fMoW, + decodificador UPerNet) y `Unet` (U-Net con codificador ResNet-34 inicializado en ImageNet) |
| Parametros totales | no disponible (la model card no publica el recuento; tamano del repositorio: 0,7 GB) |
| Longitud de contexto | no aplicable (modelo de segmentacion de imagenes): entrada fija de 512 × 512 px con 13 bandas, salida de 1024 × 1024 px |
| Tipos de cuantizacion | no disponible. Solo se distribuyen checkpoints sin cuantizar; no se publican versiones GGUF, ONNX ni INT8 |
| Idiomas soportados | en, sl (etiquetas de metadatos referidas a la documentacion; la entrada real son imagenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | Checkpoints de PyTorch Lightning `.ckpt` (`snow-best.ckpt`) mas `channel_stats.json` con medias y desviaciones tipicas por banda |
| Tarea | Segmentacion semantica binaria (nieve / no nieve), `pipeline_tag`: image-segmentation |
| Bandas de entrada | 13 bandas Sentinel-2 L1C en el orden B1, B2, B3, B4, B5, B6, B7, B8, B8A, B9, B10, B11, B12 |
| Formato de entrada | GeoTIFF Sentinel-2 L1C de reflectancia en techo de atmosfera (`COPERNICUS/S2_HARMONIZED`) |
| Preprocesado | Redimensionado bilineal a 512 × 512, recorte de negativos a 0, division por el maximo de la imagen (todas las bandas) y estandarizacion por banda con `channel_stats.json` (integrada en el modelo) |
| Salida | Logits de 2 clases a 1024 × 1024; el canal 1 tras softmax es la probabilidad de nieve |
| Umbral recomendado | τ = 0,25 para GASSL-basic (se evaluaron 0,01, 0,1, 0,25 y 0,5) |
| Etiquetas de entrenamiento | Dynamic World `snow_and_ice` con probabilidad ≥ 0,51 |
| Fecha de publicacion | 2 de octubre de 2026 (ultima actualizacion: 2 de octubre de 2026) |

## Arquitectura y entrenamiento

El modelo es un segmentador totalmente convolucional. La variante principal, `GASSL-basic`, combina un codificador ResNet-50 inicializado con pesos GASSL, un esquema de aprendizaje autosupervisado basado en MoCo entrenado sobre el conjunto fMoW de imagenes satelitales, con un decodificador UPerNet que realiza la agregacion multiescala de caracteristicas. La variante `Unet` emplea un codificador ResNet-34 inicializado con pesos de ImageNet y un decodificador U-Net clasico. Ambas se entrenaron con perdida de entropia cruzada sobre las 13 bandas, y el articulo reporta que usar las 13 bandas supera al uso exclusivo de RGB.

Los datos de entrenamiento son teselas de Sentinel-2 L1C de entre 0,5 y 4 km de lado a una escala base de 10 m, enmascaradas de nubes mediante el indice QA60. La referencia de verdad se genero de forma automatica a partir de Dynamic World, tomando la clase `snow_and_ice` con probabilidad mayor o igual a 0,51, por lo que no hubo anotacion manual. No se documenta en la informacion disponible ninguna fase de ajuste por refuerzo, DPO ni decodificacion especulativa; tampoco se indica el numero total de tokens de imagen, el numero de teselas ni la composicion exacta del conjunto de entrenamiento. El conjunto de test independiente corresponde a las montanas de Martuljek y Prisojnik, seleccionadas por mantener campos de nieve durante el verano, y las particiones se centran en Eslovenia y los Alpes Julianos.

## Capacidades

- Segmentacion semantica binaria de nieve frente a no nieve sobre imagenes Sentinel-2 L1C de 13 bandas.
- Aprovechamiento de bandas mas alla del visible, incluidas B8A, B9 (vapor de agua), B10 (cirrus), B11 y B12 (infrarrojo de onda corta), lo que mejora la separacion frente al uso exclusivo de RGB segun el articulo.
- Procesamiento de teselas georreferenciadas de 0,5 a 4 km de ancho a 10 m de resolucion base.
- Escritura de resultados como GeoTIFF binario conservando la georreferenciacion de la escena de entrada mediante `save_geotiff`.
- Inferencia sobre probabilidad continua de nieve, con umbral ajustable por el usuario para priorizar exhaustividad o precision.
- Distincion de neveros persistentes en verano en el area de evaluacion (Martuljek y Prisojnik).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente perceptivo de vision por satelite.
- No dispone de modo de pensamiento (thinking mode), vision generativa, audio ni capacidades conversacionales.

## Casos de uso

- Cartografia estacional de cobertura nival en los Alpes Julianos: el modelo genera mascaras binarias de nieve a partir de escenas Sentinel-2 completas, lo que permite construir series temporales de extension de nieve comparables entre fechas.
- Seguimiento de neveros permanentes en verano: el test independiente se diseno sobre zonas donde la nieve persiste en verano, de modo que el modelo es util para inventariar glaciares de escombros y campos de nieve residuales.
- Validacion cruzada de productos de nieve de menor resolucion: las mascaras a 10 m pueden usarse como referencia de alta resolucion para evaluar productos MODIS o Sentinel-3 a 500 m.
- Apoyo a modelos hidrologicos de deshielo: la mascara de nieve por cuenca y fecha alimenta modelos de escorrentia y estimacion de recursos hidricos en regiones alpinas.
- Gestion de riesgo de aludes y planificacion territorial: la delimitacion de areas nevadas persistentes sirve como capa auxiliar en analisis de estabilidad del manto nivoso y en planificacion de infraestructuras de montana.
- Monitorizacion climatica a largo plazo: la aplicacion sistematica sobre el archivo Sentinel-2 permite medir retrocesos o avances de la cobertura nival con un criterio homogeneo.
- Preprocesado en pipelines de teledeteccion en nube: la funcion de lectura de GeoTIFF y el guardado con georreferencia facilitan insertar el modelo en flujos por lotes que consumen exportaciones de Copernicus o de Google Earth Engine.
- Investigacion sobre transferencia de modelos de fundacion: la comparacion entre el codificador preentrenado con GASSL y un ResNet-34 de ImageNet permite estudiar el impacto del preentrenamiento especifico de dominio en tareas de segmentacion.

## Benchmarks y rendimiento

| Metrica | Variante | Conjunto | Resultado |
|---|---|---|---|
| IoU medio | GASSL-basic (ResNet-50 + UPerNet) | Test independiente (Martuljek y Prisojnik) | 0,4027 |
| IoU medio | Unet (ResNet-34 + U-Net) | Test independiente (Martuljek y Prisojnik) | no disponible |
| Umbral evaluado | GASSL-basic | Test independiente | τ = 0,25 (mejor de 0,01 / 0,1 / 0,25 / 0,5; no se publican los valores del resto) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que no son aplicables a este tipo de modelo. Tampoco se documentan metricas adicionales como precision, recall, F1 o exactitud por clase.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por los autores. Con codificadores ResNet-34 y ResNet-50 y entradas de 512 × 512 px con 13 canales, la inferencia cabe con holgura en GPU de consumo; una estimacion orientativa es inferior a 4 GB en precision de 32 bits con lote pequeno, aunque este dato no esta confirmado en la model card.
- GPU recomendadas: no disponibles en la documentacion. Por el tamano del repositorio (0,7 GB para dos checkpoints) y la arquitectura empleada, cualquier GPU con 8 GB o mas deberia ser suficiente; GPU de datacenter como A100 o H100 solo serian necesarias para procesar grandes volumenes en paralelo.
- Cabe en GPU de consumo: si, segun la estimacion anterior; no se especifica ninguna GPU concreta validada por los autores.
- Opciones de despliegue: PyTorch con `torchvision` y `segmentation-models-pytorch`; lectura de GeoTIFF con `rasterio`; descarga de pesos con `huggingface_hub`. El script `snow_model.py` reconstruye la clase `MyModel` sin PyTorch Lightning ni los ficheros de preentrenamiento del modelo de fundacion, de modo que los checkpoints cargan con `strict=True` y producen salidas identicas. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni formatos GGUF, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo por tesela ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GASSL-basic (este repositorio) | ResNet-50 (GASSL) + UPerNet | 13 bandas Sentinel-2 L1C | Entrada 512 × 512, salida 1024 × 1024 | IoU medio 0,4027 en test independiente | no disponible | Pesos `.ckpt` en HuggingFace |
| Unet (este repositorio) | ResNet-34 (ImageNet) + U-Net | 13 bandas Sentinel-2 L1C | Entrada 512 × 512, salida 1024 × 1024 | no disponible | no disponible | Pesos `.ckpt` en HuggingFace |
| Modelos de segmentacion de nieve de terceros | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado alternativas comparables en la informacion proporcionada |

La busqueda web realizada no devolvio resultados relacionados con este modelo: los enlaces recuperados corresponden a una empresa de recambios para vehiculos industriales ajena al proyecto. Por tanto, no es posible establecer una comparativa con modelos externos de la misma categoria con los datos disponibles.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento proceden de Dynamic World y no de anotacion manual, por lo que el modelo hereda los errores y sesgos de ese producto.
- Las nubes y las sombras de nubes pueden confundirse con nieve, lo que genera falsos positivos en escenas parcialmente cubiertas.
- El entrenamiento y la evaluacion se centraron en Eslovenia y los Alpes Julianos; el rendimiento fuera de esa region o en otros regimenes nivales no esta validado.
- El IoU medio de 0,4027 es moderado y refleja la dificultad de la tarea, especialmente en zonas de nieve persistente en verano; no es adecuado para aplicaciones que exijan alta precision sin una validacion previa en el area de interes.
- El umbral de decision es un hiperparametro critico: los autores recomiendan τ = 0,25 para GASSL-basic, y un valor distinto cambia de forma notable el equilibrio entre falsos positivos y falsos negativos.
- La licencia no esta declarada en la model card, lo que impide confirmar si se permite el uso comercial; conviene contactar con los autores antes de cualquier despliegue productivo.
- El modelo asume una entrada muy especifica: GeoTIFF Sentinel-2 L1C con las 13 bandas en el orden B1, B2, B3, B4, B5, B6, B7, B8, B8A, B9, B10, B11, B12, y estandarizacion con el `channel_stats.json` correspondiente. Cambiar el orden de bandas o el preprocesado invalida los resultados.
- El repositorio indica un identificador distinto en los ejemplos de codigo (`SAMPA-Project/snow-segmentation-slovenia-sentinel-2`) del identificador real de la pagina de HuggingFace (`sampa-project/semantic-segmentation-snowcovered-areas-Slovenia-sentinel-2`); hay que verificar la ruta al descargar los pesos.
- El modelo no ha recibido descargas ni interacciones en el momento de redactar esta ficha, por lo que no existe una comunidad de usuarios que haya reportado comportamientos en produccion.
- Existe una discrepancia entre la resolucion de entrada declarada en el preprocesado (512 × 512) y la resolucion de salida (1024 × 1024); conviene comprobarla con el cuaderno de demostracion antes de integrarlo en un pipeline.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/sampa-project/semantic-segmentation-snowcovered-areas-Slovenia-sentinel-2
- Repositorio de codigo en GitHub: https://github.com/SAMPA-Project/semantic-segmentation-snowcovered-areas-Slovenia-sentinel-2
- Conjunto de datos (Global Sentinel-2 Snow Semantic Segmentation Dataset with Dynamic World Labels): https://doi.org/10.5281/zenodo.19482842
- Articulo de referencia: Kavran, D., Triglav Čekada, M., Lukač, N., "Semantična segmentacija zasneženih površin v Sloveniji na osnovi posnetkov Sentinel-2", GIS v Sloveniji 18, 2026 (no se proporciona enlace directo en la informacion disponible)
- Contacto del autor principal: domen.kavran1@um.si
- Financiacion: Agencia Eslovena de Investigacion e Innovacion (ARIS), proyecto J7-50095 y programa P2-0041
- La busqueda web no devolvio ningun enlace relevante sobre este modelo; los resultados obtenidos corresponden a una empresa de recambios de automocion sin relacion con el proyecto.
