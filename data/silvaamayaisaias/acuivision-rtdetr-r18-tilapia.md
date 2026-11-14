# silvaamayaisaias/acuivision-rtdetr-r18-tilapia

## Resumen

AcuiVision RT-DETR R18 Tilapia es un modelo de deteccion de objetos basado en la arquitectura RT-DETR (Real-Time Detection Transformer) con backbone ResNet-18, afinado especificamente para detectar peces de la especie tilapia en entornos de acuicultura. Lo desarrolla el usuario silvaamayaisaias y se publica bajo licencia Apache-2.0. El modelo parte de los pesos preentrenados de PekingU/rtdetr_r18vd y sustituye el clasificador original de COCO por una unica clase "pez", sin reclasificar categorias existentes.

El modelo resuelve la tarea de localizacion y conteo de peces en imagenes y fotogramas de video procedentes de piscinas y sistemas de recirculacion acuicola (RAS). Con 20.108.244 parametros totales y un checkpoint de aproximadamente 80 MB, es un modelo ligero pensado para inferencia en tiempo real sobre GPU de gama media. La model card lo etiqueta explicitamente como experimental y advierte que las metricas publicadas corresponden a un piloto sobre un unico video retenido, no a una validacion de produccion.

Es relevante ahora porque demuestra el uso de arquitecturas transformer de deteccion en tiempo real aplicadas a un dominio vertical concreto (acuicultura) y porque publica un protocolo de evaluacion reproducible con identificador de protocolo, latencias y consumo de VRAM medidos. No es un clasificador de especies ni un modelo de segmentacion: solo detecta cajas delimitadoras de peces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR con backbone ResNet-18 (rtdetr_r18vd) |
| Parametros totales | 20.108.244 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen; maximo comun 640 px en la evaluacion) |
| Tipos de cuantizacion | no disponible (la model card solo documenta inferencia en float32) |
| Idiomas soportados | es, en (etiquetas de metadatos; el modelo no procesa texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

RT-DETR es un detector transformer end-to-end que elimina la necesidad de anclas y de supresion no maxima (NMS) posterior. El modelo usa un backbone ResNet-18 para extraer caracteristicas, un encoder transformer para fusionar informacion multiescala y un decoder con consultas de objeto que predice directamente cajas y clases. El checkpoint base es PekingU/rtdetr_r18vd (Apache-2.0), con el clasificador COCO reemplazado por una cabeza de una sola clase.

El afinamiento se realizo en Kaggle sobre 256 imagenes originales del conjunto TilapiaVision y 32 fotogramas originales de RAS. La supervision de mascaras utiliza exclusivamente poligonos reales de RAS, aunque el modelo final solo emite detecciones, no mascaras. La validacion principal se hizo sobre el video GX020206 (16 fotogramas) y el test sobre el video independiente GX020019 (16 fotogramas); el entrenamiento uso GX010206, GX030013 y el subconjunto de entrenamiento de TilapiaVision. La model card indica que no hay fuga de datos entre hermanos aumentados y que el test nunca se uso para seleccionar el checkpoint. No se documentan tokens de entrenamiento, composicion completa del dataset ni etapas de RLHF o DPO, que no aplican a un detector.

## Capacidades

- Deteccion de objetos de una unica clase: pez (tilapia) mediante cajas delimitadoras.
- Procesamiento de imagenes individuales y fotogramas de video de camaras de acuicultura.
- Conteo aproximado de peces por fotograma a partir de las detecciones.
- Inferencia en tiempo real: latencia mediana de 0,0399 s por imagen en Tesla T4 con float32.
- Compatibilidad con el pipeline object-detection de transformers y con endpoints compatibles.
- No soporta segmentacion ni mascaras (la model card lo indica explicitamente).
- No es un clasificador de especies: solo distingue "pez" frente a fondo.
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades de texto, audio o vision general.
- Etiquetas de idioma es/en solo como metadatos; el modelo no procesa lenguaje natural.

## Casos de uso

- Monitorizacion de biomasa en piscinas: el modelo puede ejecutarse sobre fotogramas periodicos de camaras fijas para estimar el numero de peces visibles y detectar cambios bruscos en el conteo, usando la metrica count_mae como referencia de error esperado.
- Deteccion de eventos de mortalidad o agrupamiento: al comparar conteos entre fotogramas consecutivos se pueden identificar descensos anomalos o concentraciones de peces que indiquen estres, con la latencia de 40 ms por imagen que permite procesar video casi en tiempo real en una T4.
- Alimentacion automatizada basada en actividad: las detecciones por fotograma permiten calcular la densidad de peces en la zona de alimentacion y ajustar la dosificacion de pienso en sistemas RAS.
- Control de calidad en granjas de recirculacion (RAS): el modelo se entrena con fotogramas de RAS y puede integrarse en paneles de supervision para verificar presencia y distribucion de peces en cada tanque.
- Prototipado e investigacion en acuicultura: al ser ligero (80 MB de checkpoint) y Apache-2.0, sirve como punto de partida para reentrenar con nuevos dominios o especies con pocos recursos de GPU.
- Despliegue en el borde con GPU de consumo: su tamano reducido permite ejecutarlo en estaciones con GPU modesta junto a la camara, sin enviar video a la nube, reduciendo latencia y coste de ancho de banda.
- Generacion de datasets anotados: las detecciones pueden usarse como preetiquetado para acelerar la anotacion manual de nuevos videos de acuicultura, revisando posteriormente las cajas de baja confianza.

## Benchmarks y rendimiento

Resultados del piloto publicado en la model card (16 imagenes del video retenido GX020019, Tesla T4, float32, tres calentamientos, max 640 px, confianza 0,3, IoU de caja 0,5):

| Metrica | Valor |
|---|---|
| mAP@50 | 0,2886 |
| mAP@50-95 | 0,1508 |
| Precision | 0,0955 |
| Recall | 0,525 |
| MAE de conteo | 11,625 |
| IoU medio | no disponible |
| Dice medio | no disponible |
| Latencia mediana (s) | 0,0399 |
| VRAM pico (bytes) | 194.312.192 |
| Tamano del checkpoint (bytes) | 80.498.392 |

La model card advierte que se trata de un protocolo piloto sobre un unico video retenido y que no se pueden extrapolar claims de robustez a toda la granja. No se publican metricas para trucha ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 194 MB en pico medidos en float32 con entrada de 640 px; en la practica se recomienda al menos 2 GB libres para el runtime de PyTorch y el preprocesado.
- GPU recomendadas: Tesla T4 es la plataforma de referencia medida; cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente (RTX 3050, RTX 4060, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna; tambien podria ejecutarse en CPU con mayor latencia, aunque no se han publicado mediciones en CPU.
- Opciones de despliegue: transformers con pipeline object-detection, endpoints compatibles con la libreria, y exportacion a otros runtimes no documentada en la model card.
- Latencia y throughput: latencia mediana de 39,9 ms por imagen en T4 float32; el throughput no se publica, pero a partir de la latencia se puede estimar del orden de 25 imagenes por segundo en esa GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | mAP@50 (piloto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AcuiVision RT-DETR R18 Tilapia | 20,1 M | imagen 640 px | 0,2886 | Apache-2.0 | Hugging Face |
| PekingU/rtdetr_r18vd (base) | no disponible en la informacion | imagen 640 px | no disponible | Apache-2.0 | Hugging Face |
| Otros detectores especificos de peces | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa con detectores especializados en acuicultura no esta disponible.

## Limitaciones y advertencias

- Modelo experimental: la model card lo etiqueta como tal y limita sus conclusiones a un piloto sobre un unico video retenido de 16 fotogramas.
- Precision muy baja (0,0955) con recall moderado (0,525): el modelo genera muchas detecciones falsas positivas, lo que limita su uso directo en produccion sin postprocesado o umbrales ajustados.
- MAE de conteo de 11,6 peces: el conteo por fotograma no es fiable para estimaciones de biomasa sin calibracion adicional.
- No es un clasificador de especies: solo detecta la clase generica "pez"; no distingue tilapia de trucha u otras especies.
- No soporta segmentacion ni mascaras, a pesar de haberse entrenado con supervision de poligonos RAS.
- Sesgos conocidos: el entrenamiento usa un numero reducido de imagenes (256 de TilapiaVision y 32 de RAS) y dos videos concretos, por lo que el rendimiento puede degradarse en otras camaras, iluminaciones, calidades de agua o densidades de peces.
- Riesgo de alucinacion: como todo detector, puede producir cajas sobre texturas o reflejos que no corresponden a peces, especialmente con umbrales de confianza bajos.
- Limitaciones de contexto e idioma: no procesa texto; las etiquetas es/en son solo metadatos.
- Licencia Apache-2.0: permite uso comercial, pero los datasets de origen (TilapiaVision y Tilapia-RAS) son CC BY 4.0 y exigen atribucion; conviene revisar las obligaciones de atribucion al redistribuir derivados.
- No se han publicado mediciones en CPU, cuantizaciones ni otros formatos de pesos distintos de safetensors.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/silvaamayaisaias/acuivision-rtdetr-r18-tilapia
- Modelo base: https://huggingface.co/PekingU/rtdetr_r18vd/tree/ac77a11ff0170a41b771c03264987f8ce2b0d753
- Dataset TilapiaVision (de Oliveira et al., 2026, CC BY 4.0): https://data.mendeley.com/datasets/bnst7jsdcx/1
- Dataset Tilapia-RAS (Aragon-Banderas et al., 2025, CC BY 4.0): https://zenodo.org/records/17518786
