# mobilint/YOLOv8n

## Resumen

YOLOv8n es la variante "nano" de la familia YOLOv8 de Ultralytics, un detector de objetos de una sola etapa basado en una red neuronal convolucional (CNN) con arquitectura CSPDarknet como backbone y un cabezal de deteccion desacoplado (decoupled head) con asignacion dinamica de etiquetas. Este repositorio concreto, publicado por mobilint, no contiene los pesos originales en PyTorch, sino una reproduccion compilada y cuantizada del modelo en formato MXQv7 para su despliegue sobre el runtime propietario qbruntime y el compilador qbcompiler de mobilint, orientado a aceleradores de inferencia (NPU) de esa plataforma.

El modelo resuelve la tarea de deteccion de objetos en tiempo real: localiza y clasifica instancias de 80 categorias COCO en una imagen, devolviendo cajas delimitadoras y puntuaciones de confianza. Su interes practico radica en que es un artefacto de despliegue listo para produccion en hardware mobilint, con metricas de evaluacion reproducibles y verificacion criptografica de integridad (SHA-256), lo que facilita la trazabilidad en pipelines de inferencia embebida o de borde.

La relevancia de esta ficha es acotada: no es un modelo de lenguaje ni un modelo fundacional, sino un detector convolucional pequeno (del orden de 3,2 millones de parametros en su version original YOLOv8n) empaquetado para un runtime especifico. Su utilidad depende completamente de disponer de la plataforma mobilint; fuera de ella, el formato MXQv7 no es directamente ejecutable con herramientas estandar como ONNX Runtime, TensorRT o llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de una etapa (YOLOv8, backbone CSPDarknet y cabezal desacoplado), compilada a MXQv7 |
| Parametros totales | no disponible en la informacion proporcionada (YOLOv8n original: aproximadamente 3,2 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | cuantizacion propia del pipeline qbcompiler 1.4.0; variante declarada "c0923-gptq"; no se detallan esquemas (int8, etc.) en la informacion disponible |
| Idiomas soportados | no aplica (modelo de vision); etiquetas de clase en ingles (COCO) |
| Licencia | AGPL-3.0 |
| Formato de pesos | MXQv7 (archivo .mxq, 5.649.818 bytes), compilado con qbcompiler 1.4.0; el repositorio tambien incluye artefactos ONNX segun los tags |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8n de Ultralytics: una red convolucional de una etapa con backbone CSPDarknet, cuello de tipo PAN-FPN y cabezal de deteccion desacoplado que predice simultaneamente regresion de cajas y clasificacion. Es un modelo anchor-free con asignacion dinamica de etiquetas durante el entrenamiento, disenado para inferencia de baja latencia en dispositivos con recursos limitados.

Este repositorio no documenta el proceso de entrenamiento original (numero de tokens o imagenes, composicion del dataset, tecnicas de aumento de datos ni si hubo destilacion). Lo que si documenta es el proceso de compilacion y cuantizacion: el modelo se reprodujo desde la carpeta publica de arXiv de mobilint y se compilo con qbcompiler 1.4.0 en la imagen `mobilint/qbcompiler:1.4-cuda12.8.1-ubuntu22.04` (digest sha256:7910f1661605b82eb9616f6ac99fd6461dbb865dcadaa810cce22c638ceffd44) usando `--inference-scheme all`, lo que habilita los modos de nucleo `single`, `multi`, `global4` y `global8`. La evaluacion se realizo con qbruntime 1.5.0 en modo `async` sobre las 5000 imagenes de COCO, con auditoria de identidad de datos verificada (hashes de anotaciones y de lista de muestras incluidos en los metadatos).

## Capacidades

- Deteccion de objetos en imagenes: localiza y clasifica instancias de las 80 categorias del dataset COCO, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Inferencia en modos de nucleo multiples: soporta los modos `single`, `multi`, `global4` y `global8`, lo que permite ajustar el esquema de ejecucion al hardware movilint disponible.
- Ejecucion asincrona: el runtime qbruntime 1.5.0 admite el modo `async`, util para solapar inferencia con otras tareas del pipeline.
- Verificabilidad: el artefacto incluye SHA-256 y metadatos de compilacion y evaluacion, lo que permite auditar la integridad del binario descargado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni vision multimodal mas alla de la deteccion de objetos.
- Capacidades multilingues: no aplica; las etiquetas de clase son las del dataset COCO en ingles.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos de borde: el modelo es la variante nano de YOLOv8, pensada para baja latencia y bajo consumo, por lo que encaja en camaras inteligentes, drones o unidades de vigilancia que ejecuten el runtime mobilint.
- Control de aforo y conteo de personas: sobre imagenes o secuencias de video, el detector permite contar instancias de la clase "person" y derivar metricas de ocupacion en espacios publicos.
- Inspeccion visual industrial: deteccion de defectos o piezas fuera de posicion en lineas de produccion, siempre que las clases de interes esten cubiertas por COCO o se reentrene el modelo base.
- Analisis de trafico y aparcamiento: deteccion de vehiculos, senales de trafico y peatones en imagenes de camaras de vigilancia, con integracion en sistemas de gestion de movilidad.
- Preprocesado en pipelines de vision por computador: uso como etapa de deteccion previa a un clasificador o a un modelo de reconocimiento, reduciendo el area de analisis a las regiones de interes.
- Prototipado rapido de aplicaciones de deteccion: gracias a su tamano reducido y a las metricas de evaluacion publicadas, sirve para validar la viabilidad de un producto antes de invertir en modelos mayores.
- Verificacion de integridad en despliegues regulados: el SHA-256 y los metadatos de compilacion permiten demostrar que el binario desplegado es el evaluado, util en entornos con requisitos de trazabilidad.

## Benchmarks y rendimiento

| Metrica | Valor | Dataset | Protocolo |
|---|---|---|---|
| mAP50-95 | 0,36927 | COCO (5000 muestras) | qbruntime 1.5.0, modo `async` |
| mAP50 | 0,52181 | COCO (5000 muestras) | qbruntime 1.5.0, modo `async` |
| Retencion de mAP50-95 | 98,91 % | COCO | respecto al modelo de referencia |

Los datos anteriores son los unicos publicados en la model card. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el artefacto es un binario compilado para hardware mobilint, no para GPU de proposito general.
- GPU recomendadas: no se especifican GPU convencionales; el modelo esta compilado para la plataforma mobilint (runtime qbruntime 1.5.0). La compilacion se realizo en un contenedor con CUDA 12.8.1, pero la ejecucion depende del acelerador movilint.
- Compatibilidad con GPU de consumo: no confirmada; el formato MXQv7 no es ejecutable directamente con CUDA, ROCm ni Metal sin el runtime propietario.
- Opciones de despliegue: qbruntime 1.5.0 (runtime oficial de mobilint); el repositorio incluye artefactos ONNX segun los tags, pero la model card no documenta su uso independiente.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Nota de compatibilidad: la carpeta legacy `aries/` fue eliminada; mblt-model-zoo version 2.12 o anterior debe fijar una revision antigua del repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50-95 (COCO) | Licencia | Formato |
|---|---|---|---|---|---|
| YOLOv8n (este repositorio, mobilint) | aprox. 3,2 M (original) | imagen (640 px tipico) | 0,36927 | AGPL-3.0 | MXQv7 |
| YOLOv8n (Ultralytics, original) | aprox. 3,2 M | imagen | no disponible en esta ficha | AGPL-3.0 | PyTorch, ONNX, etc. |
| YOLOv5n (Ultralytics) | no disponible | imagen | no disponible en esta ficha | GPL-3.0 / AGPL-3.0 | PyTorch, ONNX |
| YOLOv8s (Ultralytics) | no disponible | imagen | no disponible en esta ficha | AGPL-3.0 | PyTorch, ONNX |

La comparativa se limita a la categoria de detectores de objetos ligeros; los datos de los modelos alternativos no se han verificado en la informacion proporcionada y se indican como no disponibles.

## Limitaciones y advertencias

- Dependencia de plataforma: el binario MXQv7 solo se ejecuta con qbruntime de mobilint; no es portable a ONNX Runtime, TensorRT ni otras herramientas estandar.
- Sesgos: al entrenarse sobre COCO, hereda los sesgos de representacion de ese dataset (predominio de escenas urbanas occidentales, desequilibrio entre clases, etc.).
- Riesgo de falsos positivos y negativos: como todo detector de una etapa, puede fallar en objetos pequenos, ocluidos o en condiciones de iluminacion adversas; el mAP50-95 de 0,369 no es alto y debe validarse en el dominio de despliegue.
- Limitaciones de idioma: no aplica, pero las etiquetas de clase estan en ingles y limitadas a las 80 categorias de COCO.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente derivado; conviene revisar las implicaciones antes de integrarlo en productos propietarios.
- Versionado: la eliminacion de la carpeta `aries/` rompe la compatibilidad con mblt-model-zoo 2.12 o anterior, que debe fijar una revision antigua.
- Trazabilidad: el archivo `aries-rb/best_result.json` contiene valores de compilacion heredados y se conserva solo por compatibilidad con los valores por defecto de mblt-vision-python; no debe tomarse como fuente de metricas actuales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/mobilint/YOLOv8n
- Codigo fuente de Ultralytics: https://github.com/ultralytics/ultralytics
- Carpeta de referencia en mblt-model-arxiv: https://github.com/mobilint/mblt-model-arxiv/tree/main/models/object_detection/YOLOv8n
- Modelo base en HuggingFace: https://huggingface.co/Ultralytics/YOLOv8
