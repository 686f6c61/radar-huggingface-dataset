# Shaq2/kerb-rdd-nano-china-motorbike

## Resumen

kerb-rdd-nano-china-motorbike es un modelo de deteccion de objetos especializado en daños en la calzada (road damage), publicado por el usuario Shaq2 en Hugging Face. Se trata de un fine-tune de RF-DETR Nano (la variante pequena de la familia RF-DETR, basada en la arquitectura DETR con backbone ligero) partiendo del checkpoint `Shaq2/kerb-rdd-nano`, que a su vez habia sido ajustado sobre el subconjunto de Japon del dataset RDD2022. Este checkpoint concreto se ha especializado en el subconjunto China_MotorBike del mismo dataset.

El modelo resuelve el problema de la adaptacion regional en deteccion de daños viales: un detector entrenado en una region geografica (Japan) pierde rendimiento al aplicarse sobre otra (China_MotorBike), y este fine-tune recupera y supera el rendimiento en la region objetivo. Segun la model card, el mAP50 en el conjunto golden de China_MotorBike pasa de 0,2954 a 0,7866, una mejora de 0,4912 puntos absolutos, validada mediante un proceso de "gate" (M4 RegionGate) que comprueba que no se degrada el rendimiento en la region original.

Es relevante para desarrolladores que trabajan en inspeccion automatizada de infraestructuras viarias con modelos ligeros desplegables en edge, ya que se distribuye en formato ONNX y esta pensado para servir enrutado por region (region-routed serving) como estrategia de despliegue multi-region.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Nano (transformer DETR con backbone ligero) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo es un RF-DETR en su variante Nano, un detector de objetos de la familia DETR (Detection Transformer) que combina un backbone convolucional ligero con un decoder transformer para la prediccion de cajas y clases. La model card no detalla el numero de parametros ni la composicion exacta del backbone, pero la designacion "Nano" indica la variante de menor coste computacional de la familia, orientada a inferencia en hardware modesto.

El entrenamiento consistio en un fine-tune desde `Shaq2/kerb-rdd-nano` (champion de la region Japan) sobre N=1000 imagenes del subconjunto China_MotorBike, excluyendo las imagenes del conjunto golden para evitar fuga de datos. Se realizaron 6 epocas con learning rate 5e-5 y batch size 8, usando la libreria rfdetr 1.12.1 sobre Kaggle T4x2. El checkpoint fue promovido por el llamado M4 RegionGate, un criterio de aceptacion que exige que el mAP de la region no empeore mas de 0,5 puntos respecto al champion, que ninguna clase pierda mas de 2 puntos de recall y que haya al menos 50 cajas golden por clase. Los datos proceden de RDD2022, distribuido bajo la misma licencia CC BY-SA 4.0, con la atribucion correspondiente en el dataset `Shaq2/kerb-rdd2022-splits`.

## Capacidades

- Deteccion de objetos en imagenes de calzada, orientada a daños viales (grietas, baches y categorias del dataset RDD2022).
- Especializacion regional: rendimiento optimizado para el subconjunto China_MotorBike.
- Salida en formato ONNX, lo que permite inferencia en runtime sin dependencia de PyTorch.
- Inferencia ligera apta para despliegue en edge o en pipelines de inspeccion automatizada.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: es exclusivamente un detector visual.
- No se documentan capacidades multilingues ni modos especiales (thinking, vision-language, audio).

## Casos de uso

- Inspeccion automatizada de firmes viarios en China: el modelo detecta daños en imagenes de calzada capturadas por vehiculos de inspeccion, aprovechando su fine-tune especifico sobre China_MotorBike para reducir falsos negativos en esa region.
- Despliegue en edge sobre vehiculos o drones: al distribuirse en ONNX y ser la variante Nano de RF-DETR, puede ejecutarse en dispositivos con recursos limitados para deteccion en tiempo casi real durante el recorrido.
- Serving enrutado por region: combinado con el checkpoint de Japan (`Shaq2/kerb-rdd-nano`), permite enrutar cada imagen al modelo de su region de origen, mitigando el olvido entre regiones documentado en `metrics.json`.
- Priorizacion de mantenimiento municipal: las detecciones se agregan por tramo para generar rankings de reparacion segun densidad y tipo de daño detectado.
- Control de calidad de obras: comparacion de imagenes antes y despues de una reparacion para verificar que el daño ha sido corregido.
- Generacion de datasets etiquetados: uso del modelo como pre-etiquetador en un pipeline de anotacion asistida para ampliar el conjunto de entrenamiento de la region China.
- Integracion en plataformas GIS: exportacion de detecciones georreferenciadas para su visualizacion en mapas de estado de la red viaria.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del conjunto golden de China_MotorBike:

| Metrica | Antes (champion Japan) | Despues (este checkpoint) | Delta |
|---|---|---|---|
| mAP50 region golden (China_MotorBike) | 0,2954 | 0,7866 | +0,4912 |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni metricas comparables, al no tratarse de un modelo linguistico. Tampoco se detallan resultados por clase ni la matriz completa de olvido entre regiones, que se referencia en `metrics.json` pero no se reproduce en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ser la variante Nano de RF-DETR y distribuirse en ONNX, se espera un consumo bajo, aunque no se documentan cifras.
- GPU recomendadas: el entrenamiento se realizo en Kaggle T4x2; para inferencia no se especifican GPU concretas.
- Cabe en GPU consumer: previsiblemente si, dada la designacion Nano y el tamano del repositorio (0,2 GB), aunque no se confirma en la model card.
- Opciones de despliegue: ONNX Runtime como via principal por el formato de pesos; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | mAP50 China_MotorBike | Licencia | Formato |
|---|---|---|---|---|---|
| kerb-rdd-nano-china-motorbike | no disponible | no aplica | 0,7866 (golden) | CC BY-SA 4.0 | ONNX |
| Shaq2/kerb-rdd-nano (champion Japan) | no disponible | no aplica | 0,2954 (golden China) | CC BY-SA 4.0 | no disponible |
| RF-DETR Nano base | no disponible | no aplica | no disponible | no disponible | no disponible |

La comparativa mas directa es con el checkpoint del que deriva (`Shaq2/kerb-rdd-nano`), que sirve como linea base y muestra el salto de rendimiento en la region China. No se dispone de datos de otros detectores de daños viales (YOLO, Faster R-CNN) en la informacion proporcionada para establecer una comparacion cuantitativa adicional.

## Limitaciones y advertencias

- El modelo esta especializado en China_MotorBike; su rendimiento en otras regiones puede degradarse, como evidencia la matriz de olvido entre regiones referenciada en `metrics.json`.
- La estrategia recomendada por el autor es el serving enrutado por region; usarlo de forma global sin enrutado puede reducir la precision.
- Riesgo de sesgo geografico y de dominio: las imagenes de RDD2022 no cubren todas las condiciones de iluminacion, clima o tipo de via posibles en produccion.
- Riesgo de alucinacion en el sentido de detecciones falsas positivas en texturas que se parezcan a daños (sombras, juntas, marcas viales); no se documentan umbrales de confianza recomendados.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- No se documentan parametros, composicion del dataset de entrenamiento mas alla de N=1000 imagenes, ni resultados por clase, lo que limita la evaluacion previa al despliegue.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shaq2/kerb-rdd-nano-china-motorbike
- Checkpoint base (champion Japan): https://huggingface.co/Shaq2/kerb-rdd-nano
- Dataset de splits RDD2022: https://huggingface.co/datasets/Shaq2/kerb-rdd2022-splits
