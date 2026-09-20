# robertteleng/ingredient-detector-yolo-coreml

## Resumen

`robertteleng/ingredient-detector-yolo-coreml` es un detector de objetos derivado de YOLO26n y ajustado para reconocer 53 clases de ingredientes de nevera y cocina. No es un modelo de lenguaje: es un modelo de vision por computador de la familia YOLO (deteccion en una sola etapa, variante nano), convertido a CoreML en formato `.mlpackage` para ejecutarse en el Apple Neural Engine dentro de una aplicacion iOS. A diferencia de otras conversiones publicadas por el mismo autor, en este caso se trata de un modelo entrenado, no de un simple cambio de formato.

El modelo parte de los pesos `yolo26n.pt` de Ultralytics y se ha ajustado (fine-tuning) durante 100 epocas sobre el dataset Roboflow "Fridge Object" v3, compuesto por 9.874 imagenes y 53 clases, sin filtrado de clases. El autor fijo un objetivo previo al entrenamiento (mAP@0.5 superior a 0,60) y lo supero, alcanzando 0,665 en mAP@0.5 y 0,497 en mAP@0.5:0,95 sobre la particion de validacion del propio dataset.

Su relevancia practica esta en el despliegue en dispositivo: al exportarse a CoreML, permite inferencia local en iPhone y iPad sin enviar imagenes a la nube, lo que encaja en aplicaciones de inventario domestico, sugerencia de recetas o control de stock donde la privacidad y la latencia importan. El repositorio figura con 0 descargas y 0 likes, y con un tamano declarado de 0,0 GB, por lo que se trata de una publicacion reciente y sin validacion externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO de deteccion de objetos en una sola etapa (single-stage), variante nano (YOLO26n) segun el nombre de los pesos de partida `yolo26n.pt`. El detalle interno de la arquitectura YOLO26 no se especifica en la informacion disponible |
| Parametros totales | No disponible. La model card no publica el recuento de parametros |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No aplica. Es un detector de imagenes, no procesa secuencias de texto. La resolucion de entrada no se documenta en la informacion disponible |
| Tipos de cuantizacion | Exportacion en FP16 (indicada por el autor). No se documentan otras cuantizaciones (INT8, palettization) para este artefacto |
| Idiomas soportados | No aplica. Modelo de vision; no procesa lenguaje natural |
| Licencia | AGPL-3.0, heredada de Ultralytics YOLO26 |
| Formato de pesos | CoreML (`.mlpackage`). Pesos de origen en PyTorch (`.pt`) usados en entrenamiento y exportacion |
| Tarea | Deteccion de objetos (`pipeline: object-detection`) |
| Numero de clases | 53 (ingredientes de nevera y cocina) |
| Modelo base | Ultralytics/YOLO26 (pesos `yolo26n.pt`) |
| Libreria | coreml |

## Arquitectura y entrenamiento

La arquitectura es un detector YOLO de una sola etapa en su variante nano, heredada de Ultralytics YOLO26. El autor no detalla en la model card la composicion interna de la red (bloques, mecanismos de asignacion de etiquetas o si la inferencia es end-to-end sin NMS); lo unico verificable en la informacion proporcionada es el punto de partida (`yolo26n.pt`) y que el resultado se exporta a CoreML para el Apple Neural Engine.

El entrenamiento consistio en un fine-tuning de 100 epocas ejecutado sobre una RTX 5060 Ti, con un objetivo fijado de antemano: superar 0,60 de mAP@0.5. Los datos proceden del dataset Roboflow "Fridge Object" v3, con 9.874 imagenes etiquetadas en 53 clases y sin necesidad de filtrar clases. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo que no aplica a un detector. El flujo de reproduccion documentado usa `yolo detect train model=yolo26n.pt data=data/ingredients.yaml epochs=100` y despues el script `scripts/export_ingredient_yolo.py` de `robertteleng/coreml-forge` para generar el artefacto CoreML. La exportacion en FP16 introduce diferencias numericas leves respecto a los pesos originales de PyTorch.

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica instancias de 53 clases de ingredientes de nevera y cocina, devolviendo cajas delimitadoras con su etiqueta.
- Inferencia en dispositivo: el artefacto CoreML esta pensado para ejecutarse en el Apple Neural Engine de iPhone y iPad, sin conexion a servicios externos.
- Integracion con el ecosistema Apple: al ser `.mlpackage` con `library_name: coreml`, se integra en proyectos Xcode y puede consumirse desde el framework Vision.
- Vocabulario cerrado y especifico: solo reconoce las 53 clases del dataset de entrenamiento; no hay deteccion de clases abiertas ni zero-shot.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa texto.
- No incorpora modo de razonamiento (thinking mode), vision-language, audio ni OCR.

## Casos de uso

- Aplicacion iOS de inventario de nevera: el usuario fotografia el interior de su nevera y el modelo devuelve las cajas y etiquetas de los ingredientes presentes, generando un inventario editable. Es adecuado porque funciona en dispositivo, con latencia baja y sin subir fotos del hogar a la nube.
- Sugerencia de recetas a partir de lo disponible: tras detectar los ingredientes, la app puede cruzarlos con un recetario local y priorizar recetas que encajen con lo detectado. El requisito de correccion humana que admite el propio autor encaja bien en un flujo de sugerencia revisable.
- Generacion automatica de la lista de la compra: comparando el inventario detectado con una lista objetivo, la app puede marcar que falta por comprar. La deteccion se usa como estimacion, no como fuente de verdad contable.
- Reduccion del desperdicio alimentario: registro periodico del contenido de la nevera para avisar de productos que llevan tiempo sin consumirse; el modelo aporta la capa de reconocimiento visual y el seguimiento temporal se resuelve en la aplicacion.
- Control de stock en hosteleria o pequeno comercio: conteo asistido de ingredientes en camaras o almacenes con la misma taxonomia de 53 clases, siempre con validacion humana dado que no se ha evaluado en entornos reales.
- Asistente de cocina manos libres en el iPad de la cocina: el modelo identifica los ingredientes colocados sobre la encimera y los muestra en pantalla o los lee en voz alta, evitando que el usuario tenga que teclear.
- Aplicaciones de nutricion y dietetica: deteccion de alimentos base para precargar un registro de comidas que el usuario despues corrige y completa con cantidades.
- Base para fine-tuning adicional: al estar publicado como modelo entrenado sobre una taxonomia concreta, puede servir como punto de partida para dominios cercanos (despensa, congelador, almacen de restaurante) con una licencia que exige liberar el codigo derivado.

## Benchmarks y rendimiento

Los unicos datos de rendimiento publicados en la model card son los siguientes. No hay comparaciones con otros modelos en la informacion disponible.

| Metrica | Valor |
|---|---|
| mAP@0.5 | 0,665 |
| mAP@0.5:0.95 | 0,497 |
| Epocas de entrenamiento | 100 |
| Clases | 53 |
| Particion de evaluacion | Validacion del dataset Roboflow "Fridge Object" v3 |

No se han publicado resultados desglosados por clase, ni evaluaciones en imagenes reales de neveras, ni metricas de latencia o throughput en dispositivo.

## Requisitos de hardware

- Entrenamiento: la model card indica que se realizo en una RTX 5060 Ti. No se especifica la VRAM consumida ni el tiempo total de entrenamiento.
- Inferencia en dispositivo: requiere hardware Apple con Neural Engine (iPhone y iPad de generaciones compatibles). El artefacto esta pensado para CoreML, no para GPU de escritorio.
- VRAM estimada para inferencia en GPU: no disponible. Al tratarse de una variante nano exportada en FP16, el peso del modelo es reducido y cabe sin problema en cualquier GPU de consumo, pero no se publican cifras concretas.
- GPU recomendadas: no disponible para inferencia. Para reentrenamiento, el autor uso una RTX 5060 Ti; cualquier GPU consumer de gama media con suficiente VRAM para el lote configurado deberia ser suficiente, aunque no se documentan requisitos minimos.
- Despliegue: CoreML (`.mlpackage`) mediante Xcode y el framework Vision, generado con `coreml-forge` o con el exportador de Ultralytics. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se ha proporcionado informacion comparativa con otros modelos en la model card ni en los resultados de busqueda web, que no contienen referencias relevantes al modelo. La tabla siguiente recoge unicamente lo verificable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ingredient-detector-yolo-coreml | No disponible | No aplica (vision) | mAP@0.5 0,665; mAP@0.5:0,95 0,497 sobre validacion propia | AGPL-3.0 | HuggingFace, repo con 0 descargas y 0,0 GB declarados |
| Ultralytics/YOLO26 (base) | No disponible | No aplica (vision) | No disponible en la informacion proporcionada | AGPL-3.0 | Peso base declarado del fine-tuning |
| YOLOv8n / YOLO11n (alternativas de la misma familia) | No disponible | No aplica (vision) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |
| EfficientDet-Lite / MobileNet-SSD (detectores ligeros para movil) | No disponible | No aplica (vision) | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No se ha evaluado con fotografias reales de neveras: las metricas provienen unicamente de la particion de validacion del dataset de entrenamiento. Cabe esperar un rendimiento peor con estanterias desordenadas, iluminacion deficiente u objetos parcialmente ocultos.
- Un mAP@0.5 de 0,665 implica que, en ese umbral, aproximadamente un tercio de las detecciones son incorrectas. Es aceptable para sugerir ingredientes a una persona que puede corregirlos; no lo es para decisiones automaticas.
- No hay desglose por clase, por lo que las clases poco representadas en el dataset pueden rendir muy por debajo de la media.
- La exportacion en FP16 produce resultados numericamente algo distintos de los pesos de PyTorch.
- Vocabulario cerrado de 53 clases: cualquier ingrediente fuera de esa taxonomia no se detectara y puede confundirse con una clase conocida.
- Licencia AGPL-3.0 heredada de Ultralytics YOLO26: distribuir el modelo dentro de una aplicacion de codigo cerrado exige una licencia comercial de Ultralytics. No es una formalidad, es un requisito legal explicito del autor.
- Los terminos del dataset Roboflow "Fridge Object" v3 deben revisarse antes de redistribuir los datos o modelos derivados del mismo.
- El repositorio declara 0,0 GB de tamano, 0 descargas y 0 likes, lo que sugiere que los pesos podrian no estar efectivamente disponibles o gestionarse mediante LFS fuera del conteo. Conviene verificar la descarga real antes de integrarlo.
- No hay validacion externa ni resultados replicados por terceros.
- No aplica a tareas de lenguaje: no genera texto, no soporta herramientas ni agentes.
- Riesgo de sesgo de dominio: el modelo refleja la distribucion de un unico dataset (envases, marcas y tipos de producto concretos), que puede no representar otras regiones o formatos de envasado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/robertteleng/ingredient-detector-yolo-coreml
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- Repositorio Ultralytics YOLO: https://github.com/ultralytics/ultralytics
- Repositorio del flujo de conversion y exportacion: https://github.com/robertteleng/coreml-forge
- Dataset de entrenamiento (enlace generico aportado por el autor): https://universe.roboflow.com/
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo; corresponden a consultas no relacionadas sobre PotPlayer, Prime Video y Microsoft To-Do.
