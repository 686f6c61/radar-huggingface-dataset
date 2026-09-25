# beaunix/oryza-mind

## Resumen

Oryza Mind es un modelo de segmentacion de instancias basado en YOLOv11, desarrollado por el usuario de HuggingFace beaunix (Bryan David Castano) como proyecto academico orientado a agricultores de arrozales. Su tarea concreta es detectar y segmentar lesiones y regiones de enfermedad en imagenes de hojas de arroz, devolviendo mascaras por instancia que despues se envian a una capa de razonamiento basada en Gemini para generar recomendaciones de tratamiento. El modelo forma parte de un agente mayor denominado Oryza Mind, cuyo repositorio de proyecto y demo en vivo se enlazan mas abajo.

A diferencia de los modelos de lenguaje, no procesa texto ni mantiene contexto conversacional: es un modelo puramente de vision, entrenado con Ultralytics YOLO y distribuido en dos formatos, un checkpoint PyTorch (.pt) para inferencia o reentrenamiento y una exportacion ONNX (.onnx) para despliegue con ONNX Runtime en cualquier lenguaje. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamano declarado de 0,0 GB, por lo que se trata de una publicacion reciente y sin traccion comunitaria.

Su relevancia es acotada pero clara: cubre un nicho agrotecnico (diagnostico fitopatologico del arroz) con un modelo pequeno y exportable, y ejemplifica el patron de arquitectura "vision especializada + LLM de razonamiento" que se esta extendiendo en aplicaciones de campo con conectividad limitada. La model card no especifica la variante exacta de YOLOv11 (n, s, m, l o x), por lo que el numero de parametros no puede determinarse a partir de la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv11 en configuracion de segmentacion de instancias (Ultralytics) |
| Parametros totales | no disponible (la model card no indica la variante n/s/m/l/x) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; no procesa texto) |
| Tipos de cuantizacion | no disponible; se distribuyen pesos en precision original (.pt) y exportacion ONNX sin detalle de precision |
| Idiomas soportados | no aplica (modelo de imagen); la model card esta redactada en ingles |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt) y ONNX (.onnx) |
| Tarea | Segmentacion de instancias (image-segmentation) |
| Libreria | ultralytics |
| Dominio | Agricultura, enfermedad del arroz (rice-disease) |
| Entrada | Imagenes de hojas de arroz (forma de entrada no documentada en la model card) |
| Salida | Mascaras de segmentacion por instancia |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento

La arquitectura es YOLOv11 en su cabeza de segmentacion, implementada y entrenada con el framework Ultralytics. Se trata de un detector de un solo paso con rama de mascaras por instancia, lo que permite localizar simultaneamente la region afectada y su contorno a nivel de pixel. La model card no detalla el backbone, el numero de capas, el tamano de entrada, ni si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino sobre pesos preentrenados en COCO.

En cuanto a los datos, el modelo se entreno sobre una combinacion de dos conjuntos de segmentacion de hojas de arroz publicados en Roboflow Universe. El primero es el "Rice-Leaf-Disease Dataset" (Roboflow Universe, 2026), publicado bajo CC BY 4.0; el autor indica que este proyecto se bifurco originalmente de otro conjunto de Roboflow Universe cuya fuente upstream ya no es rastreable desde la pagina publica tras cambios recientes del sitio. El segundo conjunto se referencia como "rice-leaf-segmentation-cgcgd" en la misma cuenta de Roboflow. No se documentan el numero de imagenes, la distribucion de clases, el split train/val/test, el numero de epocas ni las metricas de validacion (mAP de caja o de mascara, IoU). Tampoco se menciona ningun tipo de ajuste por refuerzo, DPO ni RLHF, algo que no aplica a un modelo de vision.

## Capacidades

- Segmentacion de instancias en imagenes de hojas de arroz: genera mascaras a nivel de pixel de las regiones o lesiones asociadas a enfermedad.
- Deteccion implicita de regiones afectadas: al producir mascaras por instancia, permite contar y localizar focos individuales dentro de una misma hoja.
- Exportacion a ONNX: la model card proporciona un ejemplo de inferencia con ONNX Runtime, lo que habilita despliegue en entornos sin PyTorch (C++, Java, JavaScript, C#, Rust mediante bindings).
- Reentrenamiento y ajuste fino: el checkpoint .pt es compatible con el flujo de entrenamiento de Ultralytics (`model.train(data="your_dataset.yaml", epochs=50)`), de modo que puede adaptarse a nuevos cultivos o patologias.
- Integracion con agentes: el autor la plantea como capa perceptiva que alimenta una capa de razonamiento basada en Gemini para emitir recomendaciones de tratamiento.
- Procesamiento por lotes: heredado del pipeline Ultralytics, permite inferir sobre multiples imagenes en una misma llamada.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, codigo ni matematicas: es un modelo exclusivamente visual.
- No tiene capacidades multilingues ni modo "thinking".

## Casos de uso

- Diagnostico en campo mediante movil: el agricultor fotografia una hoja con el telefono y la app ejecuta el modelo ONNX en el dispositivo o en un servidor ligero; las mascaras resultantes se envian a la capa de razonamiento para obtener un tratamiento recomendado, tal y como plantea el proyecto Oryza Mind.
- Extension agraria a escala regional: un servicio publico de asesoria puede procesar lotes de fotografias enviadas por cooperativas y clasificar la incidencia por plaga o patologia, generando informes agregados por municipio o parcela.
- Triaje previo a la visita tecnica: el modelo filtra que imagenes muestran lesiones y cuales no, de forma que un agronomo humano solo revisa los casos positivos, reduciendo el coste de inspeccion manual.
- Monitorizacion con drones o robots agricolas: al ser un modelo YOLO, es adecuado para inferencia en tiempo casi real sobre secuencias de video capturadas por plataformas aereas, permitiendo mapear la dispersion de la enfermedad en una parcela.
- Etiquetado asistido para nuevos datasets: las mascaras generadas pueden usarse como preanotaciones en Roboflow o CVAT y ser corregidas por anotadores humanos, acelerando la construccion de conjuntos de datos de otras patologias del arroz.
- Adaptacion a otros cultivos o enfermedades: al distribuirse el checkpoint .pt, un equipo de investigacion puede hacer fine-tuning con su propio `dataset.yaml` para trigo, maiz u otras lesiones foliares, reutilizando la arquitectura de segmentacion.
- Docencia y proyectos academicos: sirve como ejemplo completo de pipeline de segmentacion agrotecnica, desde el dataset de Roboflow hasta la exportacion ONNX con Ultralytics.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye valores de mAP (box o mask), IoU, precision, recall ni comparaciones con otros modelos de segmentacion. Ademas, no se especifica el numero de imagenes del conjunto de validacion, por lo que cualquier cifra seria no verificable.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. La model card no indica la variante de YOLOv11, y el consumo depende directamente de ella. A titulo orientativo y generico para la familia YOLOv11-seg, las variantes mas pequenas (n y s) se ejecutan en menos de 4 GB de VRAM, mientras que las mayores (l y x) pueden requerir entre 8 y 16 GB en funcion del tamano de entrada y del batch.
- GPU recomendadas: no disponibles para este modelo concreto. En terminos generales, la familia YOLOv11-seg es desplegable en GPUs de consumo (RTX 3060, RTX 4060, RTX 4090) en sus variantes pequenas y medianas, y en A100, H100, L4 o T4 para lotes grandes o las variantes mas pesadas.
- Compatibilidad con GPU de consumo: probable en las variantes n/s/m, no confirmable en l/x sin conocer la variante publicada y el tamano de entrada.
- Opciones de despliegue: Ultralytics (PyTorch) para inferencia y reentrenamiento; ONNX Runtime para inferencia en cualquier lenguaje, segun el ejemplo de la propia model card. No se documenta soporte explicito para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje y no aplican a este caso.
- Latencia y throughput: no disponibles. Dependen de la variante, del tamano de entrada, de la GPU y de si se ejecuta en modo ONNX Runtime o PyTorch, ninguno de los cuales se especifica.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para Oryza Mind, por lo que la comparacion se limita a caracteristicas estructurales y no a metricas.

| Modelo | Arquitectura | Tarea | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Oryza Mind (beaunix/oryza-mind) | YOLOv11-seg | Segmentacion de enfermedad en hoja de arroz | no disponible | AGPL-3.0 | HuggingFace (.pt, .onnx) |
| Ultralytics YOLOv11-seg (generico) | YOLOv11-seg | Segmentacion de instancias generica (COCO) | entre ~2,6 M (n) y ~62 M (x) segun variante | AGPL-3.0 | GitHub y pesos oficiales de Ultralytics |
| YOLOv8-seg | YOLOv8-seg | Segmentacion de instancias generica | entre ~3,2 M (n) y ~71 M (x) segun variante | AGPL-3.0 | GitHub y pesos oficiales de Ultralytics |
| Mask R-CNN | Detector de dos etapas con rama de mascaras | Segmentacion de instancias generica | tipicamente decenas de millones de parametros (p. ej. ~44 M con backbone ResNet-50-FPN) | Apache-2.0 / MIT segun implementacion | Detectron2, torchvision |

La ventaja diferencial de Oryza Mind no es el rendimiento, que no esta medido, sino su especializacion de dominio: es un modelo ajustado especificamente a lesiones de arroz, algo que los modelos genericos de la tabla no ofrecen. No se dispone de datos de ningun otro modelo de segmentacion especifico de enfermedades del arroz con el que compararlo directamente.

## Limitaciones y advertencias

- Ausencia total de metricas: no hay mAP, IoU, precision ni recall publicados, por lo que el rendimiento real es desconocido y no deberia asumirse que es adecuado para uso critico.
- Variante no especificada: la model card no indica si se trata de YOLOv11n, s, m, l o x, lo que impide estimar con precision el coste de inferencia, la latencia o la calidad esperada.
- Dataset opaco: no se documentan el numero de imagenes, las clases, la distribucion, el split ni el proceso de anotacion. Parte del origen de los datos se ha perdido ("the upstream source is no longer traceable"), lo que dificulta auditar la procedencia y detectar posibles fugas entre entrenamiento y validacion.
- Riesgo de sesgo de dominio: al entrenarse sobre un conjunto limitado de imagenes, es probable que degrade su precision ante variedades de arroz, condiciones de iluminacion, fondos, camaras o estadios de enfermedad no representados en los datos de entrenamiento.
- Riesgo de falsos negativos en produccion: en diagnostico fitosanitario, una mascara omitida puede traducirse en un tratamiento no aplicado y en perdida de cosecha. Se recomienda validacion humana de los resultados.
- Dependencia del agente externo: las recomendaciones de tratamiento no las genera este modelo, sino una capa basada en Gemini, de la que no se documentan version, prompts ni evaluacion. Cualquier alucinacion en esa capa es ajena al modelo de vision pero afecta al sistema completo.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. El uso comercial es posible, pero si se ofrece el modelo como servicio en red o se distribuye una obra derivada, la AGPL exige liberar el codigo fuente correspondiente bajo la misma licencia. Conviene revisar las implicaciones antes de integrarlo en un producto propietario o en un servicio SaaS.
- Sin soporte comunitario: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa, de issues resueltos y de mantenimiento conocido.
- Idiomas: no aplica al modelo, pero la documentacion solo esta en ingles y contiene erratas que dificultan su interpretacion.
- Advertencia de seguridad para modelos de vision: como cualquier red neuronal, es susceptible a ejemplos adversarios y a imagenes fuera de distribucion; no debe usarse como unica fuente de decision agronomica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/beaunix/oryza-mind
- Perfil del autor en HuggingFace: https://huggingface.co/beaunix
- Repositorio del proyecto en GitHub: https://github.com/BeauBryanDev/oryza_mind
- Agente en vivo: oryza.tensorgeek.com
- Dataset 1 (Rice-Leaf-Disease, Roboflow Universe, CC BY 4.0): https://universe.roboflow.com/landebeau7/rice-leaf-disease-s1asn-nzefl
- Dataset 2 (Rice Leaf Segmentation): https://app.roboflow.com/landebeau7/rice-leaf-segmentation-cgcgd
- Framework Ultralytics YOLO: https://github.com/ultralytics/ultralytics
