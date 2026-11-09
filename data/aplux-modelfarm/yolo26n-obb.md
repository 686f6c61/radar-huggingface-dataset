# APLUX-ModelFarm/YOLO26n-OBB

## Resumen

YOLO26n-OBB es un modelo publicado en Hugging Face por el usuario APLUX-ModelFarm bajo licencia Apache 2.0. Por la nomenclatura del identificador, se trata de una variante de la familia YOLO (deteccion de objetos en tiempo real) en su version "26", con el sufijo "n" que tradicionalmente designa el tamano "nano" dentro de las escalas de YOLO (n, s, m, l, x), y el sufijo "OBB" que corresponde a *Oriented Bounding Boxes* (cajas delimitadoras orientadas), es decir, deteccion de objetos rotados en imagen.

La relevancia de este tipo de modelos radica en su aplicacion a escenarios donde los objetos no aparecen alineados con los ejes de la imagen: imagenes aereas y de satelite, inspeccion industrial, documentos escaneados o robotica. Las cajas orientadas permiten ajustar la geometria del objeto con un angulo adicional, lo que mejora la localizacion en objetos alargados o rotados respecto a las cajas axis-aligned clasicas.

No obstante, la informacion disponible sobre este repositorio concreto es practicamente nula: la model card no contiene descripcion, no se declaran resultados de benchmarks, no se especifican datos de entrenamiento ni el numero de parametros, y el repositorio tiene un tamano de 0.0 GB con cero descargas. Todos los datos tecnicos que no aparecen en la informacion proporcionada se indican como "no disponible" en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (por nomenclatura, familia YOLO con deteccion OBB) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica a tareas de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio figura con 0.0 GB) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna, el numero de parametros, la composicion del dataset de entrenamiento ni el procedimiento de optimizacion en la model card del repositorio. Por el identificador "YOLO26n-OBB" se infiere que sigue el paradigma de deteccion de objetos en una sola etapa propio de la familia YOLO, con una cabeza de prediccion adaptada a cajas orientadas (parametrizacion con angulo, habitualmente en representaciones como le90, le135 o csIou). El sufijo "n" sugiere la variante de menor coste computacional de la familia.

No hay informacion sobre si se emplearon tecnicas de aumento de datos especificas para objetos rotados (rotaciones arbitrarias, mosaico, mezcla), ni sobre el dataset de entrenamiento (DOTA, HRSC2016, DIOR-R u otros habituales en OBB). Tampoco se documenta si el modelo parte de pesos preentrenados de otra version de YOLO o se entrena desde cero.

## Capacidades

- Deteccion de objetos con cajas delimitadoras orientadas (OBB), adecuada para objetos rotados o alargados.
- Inferencia en una sola etapa, orientada a tiempo real por la variante "n" (nano).
- No se documentan capacidades de segmentacion, clasificacion, seguimiento, tool calling, agentes ni generacion de texto.
- No se documenta soporte multilingue (no aplica a un detector de objetos).
- No se documenta ninguna capacidad especial (thinking mode, vision-lenguaje, audio) en la informacion disponible.

## Casos de uso

- Deteccion de vehiculos y barcos en imagenes aereas o de satelite: las cajas orientadas permiten ajustar la orientacion real de objetos alargados, algo que las cajas axis-aligned no capturan con precision.
- Inspeccion industrial automatizada: localizacion de componentes rotados en lineas de produccion o en imagenes de control de calidad, donde la orientacion del objeto es relevante para el analisis posterior.
- Analisis de documentos escaneados: deteccion de regiones de texto o tablas que aparecen inclinadas por el proceso de escaneo, con cajas que siguen la orientacion real del contenido.
- Robotica y manipulacion: estimacion de la pose planar de objetos sobre una superficie para alimentar un brazo robotico que necesita conocer el angulo de agarre.
- Teledeteccion y cartografia: extraccion de edificios, pistas de aterrizaje o infraestructuras lineales en ortofotos, donde la orientacion es un atributo esencial del objeto.
- Vision embebida en dispositivos de borde: al tratarse presumiblemente de la variante nano, el modelo estaria pensado para despliegue en hardware con recursos limitados (Jetson, Raspberry Pi con acelerador, NPUs), aunque no se confirma en la informacion disponible.

En todos los casos, la idoneidad concreta no puede validarse sin datos de rendimiento publicados ni pesos verificables en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el numero de parametros ni el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por la variante "n" (nano) cabria esperar que si, pero no se confirma.
- Opciones de despliegue: no disponible; en la familia YOLO son habituales Ultralytics, ONNX Runtime, TensorRT y OpenVINO, pero no se documenta ninguno para este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26n-OBB (este) | no disponible | no aplica | Deteccion OBB | Apache 2.0 | Hugging Face (repo vacio, 0 descargas) |
| YOLOv8n-OBB (Ultralytics) | no disponible en la informacion | no aplica | Deteccion OBB | AGPL-3.0 / comercial | Hugging Face, Ultralytics Hub |
| YOLO11n-OBB (Ultralytics) | no disponible en la informacion | no aplica | Deteccion OBB | AGPL-3.0 / comercial | Hugging Face, Ultralytics Hub |
| RT-DETR (variantes ligeras) | no disponible en la informacion | no aplica | Deteccion axis-aligned | Apache 2.0 | Hugging Face, repos oficiales |

La comparativa se limita a la categoria y licencia; no se dispone de datos de rendimiento ni de parametros de este repositorio para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El repositorio figura con 0.0 GB de tamano y cero descargas: no hay evidencia de que contenga pesos utilizables. Antes de integrarlo en cualquier pipeline, es imprescindible verificar la presencia real de artefactos.
- La model card no contiene descripcion, dataset, metricas ni instrucciones de uso; no es posible evaluar su calidad ni su comportamiento.
- No se documentan sesgos conocidos, pero cualquier detector entrenado con un dataset no declarado hereda los sesgos de dicho dataset (por ejemplo, sesgo geografico en teledeteccion).
- Riesgo de alucinacion: en deteccion de objetos se traduce en falsos positivos; sin metricas publicadas no puede acotarse.
- No se especifican limitaciones de idioma ni de contexto (no aplica a un detector).
- La licencia Apache 2.0 permite uso comercial, pero al no haber pesos verificables ni documentacion, el uso en produccion no es recomendable sin una validacion previa exhaustiva.
- El identificador "YOLO26" no corresponde a ninguna version publicada y ampliamente conocida de la familia YOLO en el momento de redactar esta ficha; conviene tratar la nomenclatura con cautela hasta que el autor publique documentacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/APLUX-ModelFarm/YOLO26n-OBB
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
