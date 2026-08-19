# deytiyas01/Prithvi-EO-2.0-600M-TL

## Resumen

Prithvi-EO-2.0-600M-TL es un modelo fundacional de observación de la Tierra (EO) desarrollado conjuntamente por IBM, NASA y el Jülich Supercomputing Centre. Se trata de la segunda generación de la familia Prithvi-EO, diseñada para aprender representaciones ricas y reutilizables a partir de imágenes satelitales multiespectrales y multitemporales. A diferencia de los modelos de lenguaje, este es un encoder visual basado en la arquitectura Vision Transformer (ViT) preentrenado con un enfoque de autoencoder enmascarado (MAE), con modificaciones específicas para manejar datos espacio-temporales.

La variante -TL incorpora embeddings de tiempo y localización geográfica, lo que permite al modelo explotar la información de fecha y coordenadas de cada imagen durante el preentrenamiento y el ajuste fino. Con 600 millones de parámetros, es el modelo más grande de la familia Prithvi-EO-2.0 y está preentrenado sobre el producto HLS V2 de NASA (resolución de 30 m) con 4,2 millones de muestras y seis bandas espectrales. Su relevancia actual radica en que supera al anterior Prithvi-EO en un 8% de media en GEO-bench y a otros seis modelos fundacionales geoespaciales en tareas de distintas resoluciones (de 0,1 m a 15 m), posicionándose como una opción de referencia para aplicaciones de teledetección y monitorización del territorio.

El modelo se distribuye bajo licencia Apache-2.0 y está disponible a través de la librería TerraTorch, con pesos publicados en Hugging Face. Aunque el repositorio consultado pertenece a un usuario particular (deytiyas01), es un espejo del modelo oficial publicado por IBM y NASA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con autoencoder enmascarado (MAE), embeddings 3D y embeddings temporales y de localizacion |
| Parametros totales | 600 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision por computadora; procesa secuencias de imagenes) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de vision, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible (probablemente safetensors o pytorch_model.bin) |

## Arquitectura y entrenamiento

Prithvi-EO-2.0 se basa en la arquitectura ViT preentrenada con un enfoque de autoencoder enmascarado (MAE). Dos modificaciones principales lo diferencian del ViT estándar. En primer lugar, los patch embeddings y los embeddings posicionales 2D se sustituyen por versiones 3D para soportar entradas con características espacio-temporales, es decir, una secuencia de T imágenes de tamaño (H, W). Los patch embeddings 3D consisten en una capa convolucional 3D que divide la entrada en cubos no solapados de tamaño (t, h, w) para las dimensiones de tiempo, altura y anchura. Los embeddings posicionales 3D se generan combinando codificaciones sin/cos 1D independientes para cada dimensión.

En segundo lugar, las versiones -TL incorporan geolocalización (latitud y longitud del centro) y fecha de adquisición (año y día del año, de 1 a 365) durante el preentrenamiento. Tanto el encoder como el decoder reciben esta información y la codifican mediante codificaciones sin/cos 2D, que se añaden a los tokens embebidos mediante una suma ponderada con pesos aprendidos (uno para tiempo y otro para localización, con pesos separados para encoder y decoder). Para manejar la ausencia de estos metadatos en la práctica, se aplica un mecanismo de dropout aleatorio durante el preentrenamiento que elimina la geolocalización y/o los datos temporales, enseñando al modelo a funcionar sin ellos.

El preentrenamiento se realizó en el Jülich Supercomputing Centre con el producto HLS V2 de NASA (granularidad de 30 m), utilizando 4,2 millones de muestras con seis bandas en el siguiente orden: Blue, Green, Red, Narrow NIR, SWIR 1 y SWIR 2, en unidades de reflectancia.

## Capacidades

- Representacion de imagenes satelitales multiespectrales y multitemporales: el modelo extrae caracteristicas densas y semanticas de secuencias de imagenes de la misma ubicacion en diferentes fechas.
- Ajuste fino (fine-tuning) para tareas downstream de vision por computadora en el dominio geoespacial: clasificacion, segmentacion semantica, segmentacion de instancias y regresion.
- Soporte de informacion temporal y geolocalizacion: las versiones -TL pueden utilizar metadatos de fecha y coordenadas para mejorar la precision, aunque tambien funcionan sin ellos gracias al mecanismo de dropout.
- Multi-resolucion: el modelo ha sido validado en tareas que van desde 0,1 m hasta 15 m de resolucion espacial, mostrando robustez frente a diferentes escalas.
- No es un modelo generativo de texto ni de imagenes; no soporta tool calling, agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.

## Casos de uso

- Segmentacion multitemporal de cultivos: el modelo puede distinguir tipos de cultivo y su evolucion a lo largo de la temporada usando secuencias de imagenes HLS. Gracias a sus embeddings temporales, es adecuado para monitorizar el ciclo de crecimiento y detectar anomalias. Se ajusta con TerraTorch sobre un conjunto etiquetado de parcelas.
- Deteccion de deslizamientos de tierra: a partir de imagenes de antes y despues de un evento, el modelo puede segmentar las areas afectadas. Su capacidad multitemporal permite comparar estados del terreno y identificar cambios abruptos. El repositorio oficial incluye un notebook de ejemplo con el conjunto de datos Landslide4Sense.
- Prediccion de flujo de carbono: como tarea de regresion, el modelo puede estimar variables biofisicas como el flujo de carbono neto del ecosistema a partir de series temporales de imagenes. La informacion temporal y de localizacion ayuda a modelar la dependencia estacional y geografica.
- Monitorizacion de incendios forestales: analizando secuencias de imagenes en el infrarrojo de onda corta (SWIR), el modelo puede identificar areas quemadas y seguir su evolucion temporal, apoyando la gestion de emergencias.
- Cartografia de usos del suelo: mediante clasificacion por pixel, el modelo puede generar mapas de cobertura terrestre (urbano, agricola, bosque, agua) a partir de imagenes multiespectrales. Su robustez a distintas resoluciones lo hace util para integrar datos de diferentes satelites.
- Deteccion de cambios y analisis de series temporales: el modelo puede servir como extractor de caracteristicas para detectar cambios en el territorio (deforestacion, urbanizacion, cambios hidrologicos) comparando representaciones de diferentes fechas, sin necesidad de etiquetas densas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos detallados en la informacion disponible. La model card indica que Prithvi-EO-2.0-600M-TL supera al anterior Prithvi-EO en un 8% de media en el conjunto de evaluacion GEO-bench, y que tambien supera a otros seis modelos fundacionales geoespaciales cuando se evalua en tareas de teledeteccion de diferentes dominios y resoluciones (de 0,1 m a 15 m). No se proporcionan cifras concretas por tarea ni comparaciones tabulares.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Para un modelo de 600 millones de parametros en precision FP32, se estima un uso de memoria de aproximadamente 2,4 GB solo para los pesos, aunque la inferencia sobre secuencias de imagenes puede requerir memoria adicional para los tensores intermedios. Se recomienda una GPU con al menos 8 GB de VRAM para un uso comodo.
- GPU recomendadas: no hay especificaciones oficiales. GPUs de gama media como la NVIDIA RTX 3060 (12 GB) o superiores (RTX 4090, A100, H100) son adecuadas. El ajuste fino puede requerir GPUs con mayor memoria, especialmente con lotes grandes o secuencias largas.
- Compatibilidad con GPU de consumo: si, modelos de 600M pueden ejecutarse en GPUs de consumo con 8-12 GB de VRAM, aunque el entrenamiento completo puede necesitar mas recursos.
- Opciones de despliegue: el modelo se integra con TerraTorch (libreria de IBM para modelos de observacion de la Tierra) y se puede utilizar con PyTorch estandar. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa se realiza con las otras variantes de la misma familia Prithvi-EO-2.0, ya que no se dispone de datos de modelos externos comparables en la informacion proporcionada.

| Modelo | Parametros | Embeddings temporales/localizacion | Resolucion de preentrenamiento | Mejora sobre Prithvi-EO (GEO-bench) |
|---|---|---|---|---|
| Prithvi-EO-2.0-tiny-TL | 5M | Si | 30 m | No especificada |
| Prithvi-EO-2.0-100M-TL | 100M | Si | 30 m | No especificada |
| Prithvi-EO-2.0-300M | 300M | No | 30 m | No especificada |
| Prithvi-EO-2.0-300M-TL | 300M | Si | 30 m | No especificada |
| Prithvi-EO-2.0-600M | 600M | No | 30 m | No especificada |
| Prithvi-EO-2.0-600M-TL | 600M | Si | 30 m | +8% (media) |

No se dispone de informacion sobre otros modelos geoespaciales como Clay, SatMAE o Scale-MAE para una comparativa directa.

## Limitaciones y advertencias

- Sesgos de datos: el modelo se preentrena exclusivamente con el producto HLS V2 de NASA, que cubre principalmente regiones con datos Landsat/Sentinel-2 disponibles. Puede tener un rendimiento inferior en areas con cobertura nubosa frecuente o con caracteristicas espectrales poco representadas en el conjunto de entrenamiento.
- Resolucion limitada: la resolucion de preentrenamiento es de 30 m, por lo que el modelo puede no capturar detalles finos en imagenes de muy alta resolucion (por ejemplo, 0,1 m) sin un ajuste fino especifico.
- Alucinacion y errores de prediccion: como cualquier modelo de vision, puede producir falsos positivos o negativos en tareas de segmentacion o clasificacion, especialmente en condiciones de iluminacion, atmosfera o estacionalidad atipicas.
- Dependencia de metadatos: aunque las versiones -TL pueden funcionar sin geolocalizacion ni fecha gracias al mecanismo de dropout, el rendimiento puede degradarse si estos metadatos no estan disponibles o son incorrectos.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, modificacion y redistribucion, siempre que se mantenga el aviso de copyright y se indiquen los cambios realizados. No hay restricciones conocidas adicionales.
- No es un modelo multimodal: no procesa texto ni audio; esta disenado exclusivamente para imagenes satelitales multiespectrales. No debe utilizarse para tareas de lenguaje natural.

## Enlaces

- Modelo oficial en Hugging Face: [ibm-nasa-geospatial/Prithvi-EO-2.0-600M-TL](https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-2.0-600M-TL)
- Repositorio espejo consultado: [deytiyas01/Prithvi-EO-2.0-600M-TL](https://huggingface.co/deytiyas01/Prithvi-EO-2.0-600M-TL)
- Repositorio GitHub oficial: [NASA-IMPACT/Prithvi-EO-2.0](https://github.com/NASA-IMPACT/Prithvi-EO-2.0)
- Libreria TerraTorch: [IBM/terratorch](https://github.com/IBM/terratorch)
- Paper (arXiv): [2412.02732](https://arxiv.org/abs/2412.02732)
- Demo interactiva (para la variante 300M-TL): [Prithvi-EO-2.0-Demo](https://huggingface.co/spaces/ibm-nasa-geospatial/Prithvi-EO-2.0-Demo)
- Documentacion de ArcGIS sobre el modelo: [Introduction to Prithvi-EO-2.0-600M](https://doc.arcgis.com/en/pretrained-models/latest/imagery/introduction-to-prithvi-eo-2-0-600m.htm)
