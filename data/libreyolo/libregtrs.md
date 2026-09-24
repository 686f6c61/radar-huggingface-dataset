# LibreYOLO/LibreGTRs

## Resumen
LibreGTRs es un checkpoint de deteccion de objetos publicado por el proyecto LibreYOLO. Se trata de los pesos GTR-S entrenados sobre COCO y convertidos al formato de la libreria LibreYOLO, de modo que puedan cargarse con la misma API que el resto de detectores soportados. El artefacto no es un entrenamiento nuevo: reempaqueta el estado del modelo original anadiendo metadatos de esquema LibreYOLO v1.0 y descartando el estado de entrenamiento y del optimizador.

El modelo procede de la implementacion oficial GTR de Intellindust-AI-Lab y del checkpoint publicado en el repositorio de pesos de Phoenix8125. La model card indica que el soporte de la familia GTR esta previsto para LibreYOLO v1.6.0, por lo que las versiones anteriores de la libreria en PyPI pueden no reconocerlo. La entrada por defecto es de 640 x 640 pixeles y la tarea declarada es unicamente deteccion.

La relevancia de esta ficha es acotada y conviene ser explicito: el repositorio registra cero descargas y cero likes, no se publican parametros, contexto ni resultados de benchmarks, y la propia model card aclara que no se reclaman cifras de precision o latencia reproducidas de forma independiente. Es, por tanto, un artefacto de conversion y no un modelo con validacion de rendimiento publicada.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (detector de objetos de la familia GTR, variante S) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision; entrada de 640 x 640 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) con metadatos de esquema LibreYOLO v1.0 |
| Tarea | deteccion de objetos (object-detection) |
| Entrada por defecto | 640 x 640 px |
| Dataset declarado | detection-datasets/coco |
| Libreria | libreyolo (soporte GTR previsto para v1.6.0) |
| Tamano del repositorio | 0.0 GB |
| Revision de origen (GTR-S COCO) | 9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo (numero de capas, tipo de backbone, mecanismo de atencion ni estrategia de asignacion de etiquetas). Lo que si se documenta es el proceso de conversion: se selecciono el state dict correspondiente al promedio exponencial de pesos (EMA) del checkpoint original `gtr_s_coco.pth`, se anadio metadata de esquema LibreYOLO v1.0 y se elimino el estado de entrenamiento y del optimizador. Los parametros aprendidos y las claves del state dict no se modificaron, y la conversion se realizo con el script `weights/convert_gtr_weights.py` del repositorio de LibreYOLO.

El entrenamiento original corresponde a la variante GTR-S sobre COCO, segun el dataset declarado en los metadatos. No se especifican en la ficha el numero de tokens o imagenes vistas, la composicion exacta del dataset, ni si hubo fases de ajuste fino con tecnicas de preferencia o refuerzo; en deteccion de objetos esas fases no son habituales y no se mencionan. Tampoco se documentan innovaciones tecnicas propias de esta conversion mas alla del reempaquetado de pesos.

## Capacidades
- Deteccion de objetos en imagenes con entrada de 640 x 640 px, sobre las categorias del dataset COCO declarado.
- Inferencia en CPU verificada durante la validacion del artefacto.
- Carga mediante la API unificada de LibreYOLO (`LibreYOLO("LibreGTRs.pt")` seguido de `predict`), lo que permite alternar con otros detectores de la misma libreria sin cambiar el codigo de integracion.
- Compatibilidad con el ecosistema de exportacion de LibreYOLO (entrenamiento, prediccion y exportacion bajo una misma API), aunque no se detallan en la ficha los formatos de exportacion validados para este checkpoint concreto.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues: no procesa texto.
- No dispone de modo de razonamiento, vision-lenguaje, audio ni generacion de texto.
- No se documentan capacidades de segmentacion, pose, profundidad u OCR para este checkpoint.

## Casos de uso
- Pre-etiquetado de datasets de deteccion: el modelo puede generar cajas candidatas sobre imagenes no anotadas para que un equipo humano las revise y corrija, reduciendo el coste de anotacion en proyectos con vocabulario de clases alineado con COCO.
- Vision industrial en linea de produccion: integrado en un pipeline de inspeccion, el detector puede localizar piezas o defectos visibles en imagenes de camara a 640 x 640 px; su tamano de variante "small" lo hace apto para ejecucion en el propio puesto o en un servidor de planta.
- Analitica de video y conteo de objetos: combinado con un tracker externo, sirve para contar personas o vehiculos por fotograma en aplicaciones de aforo, retail o movilidad urbana.
- Automocion y robotica en prototipos: deteccion de peatones, vehiculos y senalizacion como modulo perceptivo en bancos de pruebas, siempre que la precision se valide antes de cualquier uso critico.
- Moderacion y filtrado visual: deteccion de objetos o categorias concretas en imagenes subidas por usuarios dentro de un flujo de revision automatica previo a la moderacion humana.
- Moderacion de contenido y cumplimiento: localizacion de elementos concretos en imagenes para auditoria de catalogos, por ejemplo verificacion de productos o marcado obligatorio en fotografias de e-commerce.
- Investigacion en vision por computador: punto de partida para reproducir resultados de la familia GTR o como baseline de deteccion dentro de comparativas con otros detectores soportados por LibreYOLO.
- Integracion en pipelines de CI/CD de vision: al cargarse con la misma API que el resto de familias de la libreria, permite ejecutar pruebas de regresion de deteccion sobre un conjunto fijo de imagenes en cada version del modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la validacion de paridad en CUDA, la precision independiente sobre COCO y la validacion de entrenamiento con RF1 quedan diferidas a las comprobaciones de la version LibreYOLO v1.6.0, y que no se reclama ninguna cifra de precision o latencia reproducida de forma independiente. La validacion realizada para este artefacto se limita a comprobar el esquema del checkpoint, la preservacion exacta de tensores, la carga estricta y la prediccion en CPU.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible como dato medido. Para una variante "small" de detector con entrada 640 x 640 px, una estimacion orientativa en FP16 con runtime eficiente se situa en el rango de 1 a 3 GB incluyendo activaciones y overhead; en FP32 esa cifra se duplica aproximadamente. Son estimaciones por clase de tamano, no mediciones de este checkpoint.
- GPU recomendadas: no disponibles de forma especifica. Por clase de modelo, cualquier GPU con al menos 4 GB de VRAM deberia bastar para inferencia en FP16; una A100 o H100 solo tiene sentido para procesamiento por lotes de alto volumen o para entrenamiento.
- GPU de consumo: previsiblemente cabe en tarjetas de gama media y alta (RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090) para inferencia a 640 x 640 px, aunque no se ha verificado en la informacion disponible.
- Despliegue: la via documentada es la libreria LibreYOLO (`from libreyolo import LibreYOLO`), que admite prediccion y exportacion. No se detallan integraciones validadas con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a un modelo de vision de este tipo.
- Latencia y throughput: no disponibles. No se ha publicado ninguna medicion de latencia ni de imagenes por segundo para este checkpoint.

## Comparativa con modelos similares
Los datos de parametros, contexto y rendimiento de los modelos comparables no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a categoria, licencia y disponibilidad.

| Modelo | Categoria | Parametros | Licencia | Disponibilidad |
|---|---|---|---|---|
| LibreGTRs | Deteccion de objetos (GTR-S, COCO, 640 x 640) | no disponible | MIT | Pesos en HuggingFace; requiere LibreYOLO v1.6.0 o superior |
| LibreYOLOXs / Xt / Xn | Deteccion de objetos (familia YOLOX) | no disponible | MIT (libreria LibreYOLO) | Pesos en la coleccion LibreYOLO de HuggingFace |
| RF-DETR | Deteccion de objetos (transformer) | no disponible | no disponible en la informacion proporcionada | Soportado por LibreYOLO segun la documentacion del proyecto |
| YOLO9 | Deteccion de objetos | no disponible | no disponible en la informacion proporcionada | Soportado por LibreYOLO segun la documentacion del proyecto |

## Limitaciones y advertencias
- Ausencia total de metricas: no hay precision, recall, mAP ni latencia publicadas para este checkpoint, ni reproducidas de forma independiente. No debe asumirse ningun nivel de rendimiento por el nombre de la familia.
- Validacion incompleta: la paridad en CUDA, la precision independiente sobre COCO y la validacion de entrenamiento con RF1 estan diferidas a la version v1.6.0; solo se verificaron esquema, preservacion de tensores, carga estricta y prediccion en CPU.
- Dependencia de version: el soporte de GTR se esta preparando para LibreYOLO v1.6.0. Las versiones anteriores publicadas en PyPI pueden no reconocer el modelo y fallar al cargarlo.
- Trazabilidad de la conversion: los pesos son un reempaquetado del state dict EMA del checkpoint original; cualquier cambio de comportamiento respecto al modelo fuente no esta caracterizado.
- Sesgos del dataset: al derivar de un entrenamiento sobre COCO, hereda los sesgos de composicion, geografia y anotacion de ese dataset, con cobertura desigual entre categorias y peor desempeno esperable en dominios alejados de sus imagenes.
- Riesgo de falsos positivos y negativos: como cualquier detector, puede fallar en objetos pequenos, ocluidos, con iluminacion adversa o de clases poco representadas; requiere umbrales de confianza calibrados por caso de uso.
- Ambito funcional limitado: solo deteccion de cajas. No segmenta, no estima pose, no describe escenas y no procesa texto ni audio.
- Licencia: MIT, con atribucion de copyright a Intellindust-AI-Lab (c) 2026. Conviene revisar los ficheros LICENSE y NOTICE del repositorio antes de un uso comercial, y respetar las condiciones del repositorio de pesos de origen.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, y un tamano de repositorio de 0.0 GB, lo que sugiere un artefacto de publicacion reciente y sin adopcion verificable.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la deteccion de objetos inexistentes con alta confianza.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/LibreYOLO/LibreGTRs
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Modulos de modelos de LibreYOLO: https://github.com/LibreYOLO/libreyolo/tree/release/libreyolo/models
- Implementacion oficial de GTR (Intellindust-AI-Lab): https://github.com/Intellindust-AI-Lab/GTR/tree/782e737efe2e6437ac537fbdcee089673d3376c1
- Checkpoint GTR-S COCO de origen: https://huggingface.co/Phoenix8125/GTR/blob/9fc62c8c2b2c976835d0f1c1ffc544dbc0f9e29f/det/gtr_s_coco.pth
- Sitio web de LibreYOLO: https://www.libreyolo.com/
- Documentacion de modelos de LibreYOLO: https://www.libreyolo.com/docs/models
- Coleccion de modelos LibreYOLO en HuggingFace: https://huggingface.co/collections/LibreYOLO/libreyolo-models
