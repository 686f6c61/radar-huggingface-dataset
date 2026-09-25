# Arihant0902/wastewise-garbage-cls

## Resumen

WasteWise Garbage Classifier es un modelo de clasificacion de imagenes publicado por el usuario Arihant0902 en HuggingFace, consistente en un YOLOv8n-cls afinado para segregar residuos en ocho categorias (battery, biological, cardboard, glass, metal, paper, plastic y trash). El autor lo distribuye exclusivamente como artefacto ONNX (opset 17) de aproximadamente 5,5 MB, lo que lo convierte en un modelo orientado al despliegue en el borde mas que a la experimentacion en entrenamiento.

El modelo se entrena sobre un dataset propio denominado garbage_office, con unas 15.000 imagenes repartidas en las ocho clases, durante 50 epocas con el pipeline de aumento de datos estandar de Ultralytics y entradas de 224x224 pixeles en RGB normalizadas a [0,1]. El autor declara un 94,4% de top-1 sobre el conjunto de validacion, aunque no publica la composicion exacta del split ni metricas por clase.

Su relevancia practica reside en el caso de uso: forma parte de WasteWise, un kiosco de segregacion de residuos con IA construido sobre SAP BTP. Se trata, por tanto, de un componente de vision embebido en un sistema mayor, no de un modelo de proposito general. El repositorio no tiene descargas ni likes en el momento de la consulta, y no se han encontrado fuentes externas, papers ni documentacion adicional mas alla de la propia model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n-cls (cabecera de clasificacion, Ultralytics YOLOv8) |
| Parametros totales | no disponible (el autor no lo especifica; el artefacto ONNX ocupa ~5,5 MB) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, no procesa texto) |
| Tipos de cuantizacion | no disponible (se distribuye un unico artefacto ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (no es un modelo linguistico); las etiquetas de clase estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17), ~5,5 MB |

Datos adicionales declarados por el autor: entrada RGB de 224x224 normalizada a [0,1]; salida de 8 probabilidades softmax; framework de entrenamiento Ultralytics YOLOv8 con exportacion posterior a ONNX.

| Parametro de entrada | Valor |
|---|---|
| Resolucion | 224x224 |
| Canales | 3 (RGB) |
| Normalizacion | division por 255, rango [0,1] |
| Layout del tensor | [1, 3, 224, 224] (NCHW) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8n-cls, la variante "nano" de la familia YOLOv8 de Ultralytics configurada para clasificacion de imagen completa en lugar de deteccion de objetos. Esto implica que el modelo no localiza bounding boxes ni aplica supresion de no maximos: recibe la imagen entera y devuelve una distribucion softmax sobre ocho clases. En la practica, el pipeline real (kiosco) debe encuadrar previamente el objeto, ya que el modelo asume que la imagen de entrada contiene un unico residuo dominante.

El entrenamiento se realizo sobre el dataset propietario garbage_office, con aproximadamente 15.000 imagenes y ocho clases, durante 50 epocas a 224x224, usando el pipeline de aumento estandar de Ultralytics y exportando despues el checkpoint a ONNX opset 17. No se documenta en la informacion disponible el numero total de tokens o muestras por clase, la composicion exacta del split de validacion, la resolucion original de las imagenes, si hubo inicializacion desde pesos preentrenados en ImageNet, ni si se aplicaron tecnicas de ajuste fino adicionales como destilacion, calibracion de temperatura o poda. Tampoco se especifica si el modelo fue cuantizado tras la exportacion.

## Capacidades

- Clasificacion de imagenes en ocho categorias cerradas de residuos: battery, biological, cardboard, glass, metal, paper, plastic y trash.
- Salida de probabilidades softmax por clase, lo que permite aplicar umbrales de confianza y derivar a revision manual los casos de baja certeza.
- Inferencia en el borde: el artefacto ONNX de ~5,5 MB es ejecutable con ONNX Runtime en CPU, sin necesidad de GPU.
- Integracion en sistemas de kiosco o aplicacion movil mediante un preprocesado sencillo (redimensionado a 224x224 y division por 255).
- Capacidad de servir como pre-anotador en pipelines de etiquetado de imagenes de residuos.
- No dispone de tool calling, function calling, razonamiento multi-paso, generacion de texto, vision general, audio ni modo "thinking": es un clasificador visual de dominio estrecho.
- No tiene capacidades multilingues (no procesa lenguaje).

## Casos de uso

- Kiosco de segregacion de residuos en oficinas: es el escenario original del modelo. El kiosco captura una imagen del objeto depositado, la clasifica en una de las ocho categorias y guia al usuario hacia el contenedor correcto o abre la compuerta correspondiente.
- Despliegue en dispositivos de borde sin GPU: al pesar ~5,5 MB y exportarse a ONNX, puede ejecutarse con ONNX Runtime en una Raspberry Pi, un mini-PC industrial o una placa con acelerador ligero, lo que abarata el coste por punto de recogida frente a soluciones basadas en la nube.
- Pre-triaje en plantas de reciclaje: como primera etapa de clasificacion sobre imagenes de cinta transportadora, derivando los elementos de baja confianza a un clasificador de mayor capacidad o a inspeccion humana.
- Aplicacion movil de escaneo domestico: integrado en una app que, a partir de la camara del telefono, indique al usuario en que contenedor depositar cada residuo, con el modelo ejecutandose localmente y sin enviar imagenes a un servidor.
- Pre-anotacion de datasets de residuos: usar las predicciones como etiquetas iniciales que un anotador revisa, reduciendo el coste de construir nuevos conjuntos de datos en dominios similares.
- Analitica y reporting de sostenibilidad: registrar la distribucion de categorias recogidas en un campus u oficina para alimentar cuadros de mando y metricas de reciclaje o informes ESG.
- Educacion ambiental y gamificacion: incorporar el clasificador en actividades interactivas donde el usuario compite por clasificar correctamente, usando la prediccion del modelo como referencia inmediata.
- Control de calidad de contenedores: clasificar imagenes capturadas dentro de un contenedor para detectar contaminacion cruzada (por ejemplo, plasticos en el flujo de papel) y avisar al personal.

## Benchmarks y rendimiento

La informacion disponible solo incluye la metrica declarada por el autor, sin desglose por clase ni comparacion con lineas base.

| Metrica | Valor | Conjunto | Notas |
|---|---|---|---|
| Top-1 accuracy | 94,4% | Validacion de garbage_office | Dato declarado por el autor; no se especifica el tamano del split ni si hubo test independiente |

No se han publicado resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K, que en cualquier caso no aplican a un clasificador de imagenes) en la informacion disponible. Tampoco se publican matriz de confusion, precision/recall por clase ni curvas de calibracion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos razonables, dado que el artefacto ONNX ocupa ~5,5 MB y la entrada es de 224x224. La inferencia en CPU es viable sin GPU dedicada.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada para este modelo; resultan mas apropiadas plataformas de borde como NVIDIA Jetson Nano o Jetson Orin Nano, Intel NCS, Coral Edge TPU (previa conversion) o simplemente CPU.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo e incluso en GPUs integradas; tambien en Raspberry Pi 4/5 y dispositivos similares.
- Opciones de despliegue: ONNX Runtime (referencia del autor), Ultralytics (carga directa del modelo), TensorRT, OpenVINO, ONNX Runtime Web o movil, y contenedores ligeros en el borde. No aplican servidores de inferencia de gran escala como vLLM, TGI o llama.cpp, orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponible. No se publican mediciones. Dado el tamano del artefacto y la resolucion de entrada, la latencia en CPU moderna deberia ser de orden de milisegundos, pero se trata de una estimacion no verificada y dependiente del hardware y del runtime.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de alternativas en la misma tarea dentro de la informacion proporcionada, por lo que las celdas numericas quedan como "no disponible". La comparacion se limita a caracteristicas verificables de categoria y formato.

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Formato | Benchmarks en residuos |
|---|---|---|---|---|---|---|
| wastewise-garbage-cls (este modelo) | YOLOv8n-cls, clasificacion de residuos, 8 clases | no disponible (ONNX ~5,5 MB) | 224x224 RGB | Apache 2.0 | ONNX opset 17 | 94,4% top-1 en validacion (autor) |
| MobileNetV3 / EfficientNet-B0 ajustados a residuos | CNN de clasificacion para borde | no disponible | variable | variable segun implementacion | PyTorch / ONNX / TFLite | no disponible |
| ResNet-18 / ResNet-50 ajustados a residuos | CNN de clasificacion generica | no disponible | variable (habitualmente 224x224) | variable | PyTorch / ONNX | no disponible |
| TrashNet y derivados publicos | Conjuntos de datos y modelos de clasificacion de residuos (6 clases tipicas) | no disponible | variable | variable | variable | no disponible |

Nota: no se ha encontrado en la busqueda web ningun material relacionado con este modelo ni comparativas independientes.

## Limitaciones y advertencias

- Taxonomia cerrada de ocho clases. No cubre categorias habituales en normativas locales (por ejemplo, residuo organico industrial, residuos peligrosos especificos, textiles, vidrio por colores o electronicos mas alla de "battery"), lo que puede forzar clasificaciones incorrectas.
- Clase "trash" ambigua: actua como cajon de sastre y puede absorber ejemplos de otras categorias, degradando la precision real en produccion aunque el top-1 global sea alto.
- Dominio de entrenamiento restringido ("office"): las 15.000 imagenes proceden de un unico dataset propietario. Es esperable una caida de rendimiento con iluminacion, fondos, camaras o tipos de residuo distintos de los del conjunto original (desplazamiento de dominio).
- No hay metricas por clase, matriz de confusion ni evaluacion sobre un conjunto de test independiente publicadas. El 94,4% declarado no es verificable de forma externa.
- Riesgo de sobreajuste al split de validacion: sin un test reservado, no puede descartarse que el dato declarado este inflado por seleccion de epoca o por solapamiento con el entrenamiento.
- Sin informacion sobre calibracion de confianza: no hay garantia de que una probabilidad del 90% corresponda realmente a una tasa de acierto del 90%, algo critico si se usa un umbral para derivar a revision humana.
- Sesgos: no disponible. El autor no documenta analisis de sesgo por tipo de material, iluminacion, color de fondo ni origen geografico de las imagenes.
- Alucinacion: en sentido estricto no aplica, pero el modelo siempre devolvera una de las ocho clases con una probabilidad, incluso ante una imagen sin residuo o completamente fuera de dominio. Es imprescindible anadir una clase de rechazo o un umbral de confianza externo.
- Una unica imagen por inferencia con un objeto dominante: no realiza deteccion ni segmentacion, por lo que no resuelve escenas con varios residuos.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de copyright y licencia. Conviene verificar la licencia del modelo base YOLOv8 de Ultralytics y el regimen de uso del dataset garbage_office, que el autor no detalla.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin issues ni validacion de la comunidad, lo que reduce la garantia de mantenimiento y soporte.
- Sin versionado ni pesos fuente publicados mas alla del ONNX: reentrenar o ajustar el modelo no es posible con los artefactos disponibles.
- Fecha de creacion registrada como 2026-09-25 y de ultima actualizacion identica; no hay historial de versiones ni cambios posteriores.
- Compatibilidad: el artefacto requiere un runtime con soporte de ONNX opset 17; conversiones a TensorRT, OpenVINO o TFLite deben validarse y pueden alterar ligeramente las predicciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Arihant0902/wastewise-garbage-cls
- Perfil del autor en HuggingFace: https://huggingface.co/Arihant0902
- Ultralytics YOLOv8 (framework de entrenamiento y exportacion): https://github.com/ultralytics/ultralytics
- ONNX Runtime (runtime de inferencia referenciado en la model card): https://onnxruntime.ai/

Nota sobre la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (corresponden a perfiles de una locutora de internet surcoreana). No se han encontrado papers, blogs, repositorios ni demos asociados a wastewise-garbage-cls o al proyecto WasteWise.
