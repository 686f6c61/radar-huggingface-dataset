# apexlabs-hq/sn44-dirtiness-v22

## Resumen

`apexlabs-hq/sn44-dirtiness-v22` es un detector de objetos en formato ONNX publicado por el usuario apexlabs-hq. No se trata de un modelo de lenguaje, sino de un modelo de vision por computador orientado a la deteccion de suciedad en entornos interiores, entrenado como detector para el modelo base `manako/Detect-room-dirtiness-detection`. El repositorio tiene un tamano de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y fue creado el 10 de noviembre de 2026.

El modelo detecta cinco clases de suciedad: derrames de liquido, papeleras, residuos, moho y manchas. Segun la model card, se sirve de extremo a extremo mediante `miner.py` usando onnxruntime, con un tamano de imagen de entrada de 736 pixeles y un umbral de confianza global de 0.05, con umbrales especificos por clase. Incluye ademas una logica de supresion de duplicados entre pares de clases.

La relevancia de esta ficha es limitada: la informacion publicada es muy escasa y no permite caracterizar el modelo en terminos de arquitectura, parametros, entrenamiento o rendimiento mas alla de los parametros de inferencia declarados. Se documenta aqui lo disponible de forma literal, marcando como "no disponible" todo aquello que no aparece en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (detector de objetos exportado a ONNX; arquitectura base no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tamano de imagen de entrada | 736 px (`imgsz: 736`) |
| Clases detectadas | liquid spillage, bin, litter, mould, stain |
| Umbral de confianza global | 0.05 |
| Umbrales por clase | {0: 0.3, 1: 0.5, 2: 0.3, 3: 0.3, 4: 0.3} |
| Supresion de duplicados entre clases | [(0, 3, 0.3), (0, 4, 0.3), (3, 4, 0.3)] |
| SHA256 de pesos | `2fd64a3fc2b706721f88bf764dbb53e4b3e1a7f4fc1082af93d3f4a28a971b66` |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo. La model card unicamente indica que se trata de un detector ONNX end-to-end servido por `miner.py` mediante onnxruntime, y que actua como detector para el modelo `manako/Detect-room-dirtiness-detection`. No se detalla si la arquitectura subyacente es una familia YOLO, DETR u otra, ni el numero de parametros, capas o cabezas de deteccion.

Tampoco se proporcionan datos sobre el conjunto de entrenamiento: numero de imagenes, composicion del dataset, proceso de anotacion, aumento de datos, funcion de perdida ni si hubo ajuste fino a partir de otro checkpoint. No se documenta ninguna innovacion tecnica adicional mas alla de la configuracion de inferencia (umbrales por clase y supresion de duplicados entre clases concretas).

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases: derrames de liquido, papeleras, residuos, moho y manchas.
- Inferencia end-to-end en formato ONNX mediante onnxruntime.
- Umbrales de confianza diferenciados por clase para ajustar la sensibilidad de cada categoria.
- Supresion de duplicados entre clases especificas (derrame/moho, derrame/mancha, moho/mancha) para evitar detecciones solapadas de fenomenos visualmente similares.
- No se documentan capacidades de segmentacion, clasificacion de imagen completa, generacion de texto, tool calling, agentes ni procesamiento de lenguaje.

## Casos de uso

- Auditoria de limpieza en hosteleria: el detector puede procesar capturas de camaras fijas en cocinas y comedores para localizar derrames, residuos y manchas, y generar alertas al personal de limpieza con las coordenadas de cada deteccion.
- Monitorizacion de moho en viviendas: la clase `mould` permite identificar visualmente zonas con posible proliferacion de moho en paredes y techos, util en inspecciones de mantenimiento de inmuebles.
- Gestion de residuos en espacios publicos: la clase `bin` junto con `litter` permite inventariar papeleras y detectar acumulacion de basura fuera de contenedor en estaciones, aeropuertos o campuses.
- Control de calidad en cadenas de limpieza profesional: integracion del ONNX en un pipeline de onnxruntime para verificar automaticamente el estado de una sala antes y despues del servicio, con umbrales por clase ajustables segun el tipo de estancia.
- Robots de servicio y aspiradoras autonomas: el modelo puede embeberse en el bucle de percepcion de un robot para identificar derrames de liquido y evitar zonas con residuos, gracias a su formato ONNX y a un tamano de entrada moderado de 736 px.
- Analisis retrospectivo de imagenes historicas: procesamiento por lotes de archivos fotograficos de inspecciones para cuantificar la evolucion de manchas y moho en una instalacion a lo largo del tiempo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y no se detalla el tamano real de los pesos ONNX.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; al ser un modelo ONNX de vision con entrada de 736 px, es plausible su ejecucion en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: onnxruntime (mencionado en la model card mediante `miner.py`). No se documentan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un detector de vision.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| apexlabs-hq/sn44-dirtiness-v22 | Detector ONNX | 5 (derrame, papelera, residuos, moho, mancha) | 736 px | no disponible | Hugging Face |
| manako/Detect-room-dirtiness-detection | Modelo base referenciado | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas genericas de deteccion (YOLO, DETR) | Detector | COCO u otros | variable | variable | amplia |

No se dispone de datos de rendimiento, parametros ni contexto de los modelos comparables en la informacion proporcionada, por lo que la comparativa se limita a la categoria y al formato de despliegue.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo; al entrenarse presumiblemente con imagenes de interiores, podria tener un rendimiento desigual segun iluminacion, tipo de superficie y sesgo geografico del dataset, pero esto no esta confirmado.
- Riesgo de alucinacion: en deteccion de objetos se traduce en falsos positivos; los umbrales por clase (0.3 y 0.5) y la supresion de duplicados entre clases sugieren que el autor ha observado solapamientos entre derrames, moho y manchas, lo que indica cierta confusion entre clases visualmente proximas.
- Limitaciones de contexto o idioma: no aplica como modelo de lenguaje, pero no se especifica el dominio visual exacto (tipo de habitaciones, materiales, condiciones de luz) para el que fue entrenado.
- Restricciones de licencia: la licencia no esta disponible, por lo que no puede confirmarse el uso comercial. Se recomienda contactar con el autor antes de desplegarlo en produccion.
- El repositorio presenta cero descargas y cero likes, y un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el modelo es de publicacion muy reciente; conviene verificar la integridad mediante el SHA256 indicado.
- No se documenta el proceso de entrenamiento ni la procedencia de los datos, lo que impide evaluar la robustez fuera del dominio de entrenamiento.
- La dependencia de `miner.py` como script de servicio implica que el contrato de entrada/salida no esta estandarizado fuera de ese entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/apexlabs-hq/sn44-dirtiness-v22
- Modelo base referenciado: https://huggingface.co/manako/Detect-room-dirtiness-detection
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.
