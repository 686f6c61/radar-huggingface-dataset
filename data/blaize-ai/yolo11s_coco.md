# Blaize-AI/YOLO11s_COCO

## Resumen

YOLO11s_COCO es un modelo de deteccion de objetos derivado de YOLO11 Small (Ultralytics), optimizado por Blaize-AI para su despliegue en aceleradores de IA Blaize Xplorer mediante el SDK Picasso. No se trata de un modelo de lenguaje, sino de un detector convolucional de una sola etapa entrenado sobre COCO 2017 y compilado a un formato propietario `.bm` que se ejecuta sobre el Graph Streaming Processor (GSP) de Blaize, una arquitectura orientada a inferencia en el borde con enfasis en eficiencia energetica y baja latencia.

El repositorio distribuye cuatro variantes de cuantizacion e resolucion de entrada (416×256, 416×416, 640×384 y 640×640), todas con cuantizacion AMP (mezcla de INT8 y BF16). El modelo original esta en PyTorch y procede del repositorio de Ultralytics; Blaize no ha modificado el codigo fuente, solo ha realizado optimizaciones especificas para su hardware.

Su relevancia es acotada: no es un modelo de proposito general ni ejecutable en GPUs convencionales, sino un artefacto de despliegue para el ecosistema hardware/software de Blaize. Resulta util unicamente si se dispone de un acelerador Xplorer y del SDK Picasso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN de deteccion de objetos de una etapa (YOLO11 Small, Ultralytics) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | INT8, BF16, AMP (mezcla INT8/BF16) |
| Idiomas soportados | no aplica |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.bm` (formato propietario Blaize); modelo original en PyTorch |

## Arquitectura y entrenamiento

El modelo subyacente es YOLO11 Small de Ultralytics, un detector de objetos de una etapa basado en una red troncal convolucional y un cabezal de prediccion densa que produce cajas delimitadoras y clases en una sola pasada. La variante "s" corresponde al tamano pequeno de la familia YOLO11. El entrenamiento se realizo sobre el dataset COCO 2017 (licencia CC-BY-4.0), con 80 clases de objetos. No se dispone de informacion sobre el numero de tokens, composicion exacta del dataset ni tecnicas de ajuste fino empleadas por Ultralytics en la informacion proporcionada.

La aportacion de Blaize-AI consiste en la compilacion y optimizacion del grafo del modelo para el GSP, un procesador de flujo de grafos que ejecuta operaciones en un diseno basado en grafos para reducir latencia y consumo. El resultado se empaqueta en archivos `.bm` que solo se cargan mediante el SDK Picasso. Las variantes AMP combinan capas en INT8 (con escalado de punto fijo) y BF16 para equilibrar precision y velocidad; el repositorio tambien menciona variantes puras INT8 y BF16 como metodos de cuantizacion disponibles, aunque los archivos publicados son todos AMP.

## Capacidades

- Deteccion de objetos en imagenes con 80 clases de COCO (personas, vehiculos, animales, objetos cotidianos).
- Prediccion de cajas delimitadoras y etiquetas de clase en una sola pasada.
- Ejecucion en hardware de borde Blaize Xplorer mediante el SDK Picasso.
- Cuatro resoluciones de entrada precompiladas: 416×256, 416×416, 640×384 y 640×640.
- Inspeccion del modelo mediante la utilidad `blaize-modeltool`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No incluye vision-lenguaje ni generacion de texto; es exclusivamente vision por computador.

## Casos de uso

- Deteccion de personas y vehiculos en videovigilancia en el borde: la variante 640×640 AMP permite procesar fotogramas en un acelerador Xplorer sin enviar video a la nube, reduciendo latencia y ancho de banda.
- Conteo de objetos en lineas de produccion industrial: la resolucion 416×256 reduce el coste computacional para inspeccionar piezas en cintas transportadoras con requisitos de tiempo real.
- Analisis de aforo en espacios publicos: el modelo detecta personas y permite estimar ocupacion en camaras fijas desplegadas con hardware de bajo consumo.
- Deteccion de obstaculos en robots moviles o drones: la baja latencia del GSP y las variantes de resolucion reducida facilitan la integracion en bucles de control embebidos.
- Monitorizacion de trafico en ciudades: deteccion de coches, motos, autobuses y camiones en camaras urbanas con inferencia local en el dispositivo.
- Inspeccion agricola: deteccion de frutos, plagas o animales en imagenes capturadas por dispositivos de campo con conectividad limitada.
- Preprocesado para pipelines de analitica de video: el modelo actua como primer filtro de deteccion antes de etapas mas costosas ejecutadas en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Requiere un acelerador de IA Blaize Xplorer; no se ejecuta en GPU convencional ni en CPU con los archivos `.bm` publicados.
- El SDK Picasso debe estar instalado y configurado para cargar los modelos.
- VRAM estimada: no aplica (hardware dedicado, no GPU).
- GPU recomendadas: no aplica; el modelo esta compilado exclusivamente para GSP.
- Compatibilidad con GPU de consumo: no.
- Opciones de despliegue: SDK Picasso de Blaize y la utilidad `blaize-modeltool`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no son aplicables a un detector de objetos).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrada | Licencia | Despliegue |
|---|---|---|---|---|---|
| YOLO11s_COCO (Blaize) | no disponible | no aplica | 416×256 a 640×640 | AGPL-3.0 | Solo Blaize Xplorer + Picasso SDK |
| YOLO11s (Ultralytics, original) | no disponible en la informacion | no aplica | configurable | AGPL-3.0 / licencia enterprise | PyTorch, ONNX, TensorRT, etc. |
| YOLOv8s (Ultralytics) | no disponible en la informacion | no aplica | configurable | AGPL-3.0 / licencia enterprise | PyTorch, ONNX, TensorRT, etc. |
| SSD MobileNet (referencia generica) | no disponible en la informacion | no aplica | configurable | variable | multi-framework |

La comparativa se limita a senalar que el modelo de Blaize es una compilacion especifica de YOLO11s para su hardware; el original de Ultralytics es portable a multiples backends, mientras que esta version queda restringida al ecosistema Blaize. No se dispone de datos de precision (mAP) ni de latencia para comparar numericamente.

## Limitaciones y advertencias

- Modelo de vision, no de lenguaje: no genera texto, no razona y no soporta conversacion ni tool calling.
- Restringido al hardware Blaize Xplorer y al SDK Picasso; inutilizable en GPUs o CPUs convencionales.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el codigo fuente; Ultralytics ofrece una licencia enterprise alternativa para el modelo original.
- El modelo original YOLO11s puede tener sesgos derivados de COCO 2017 (clases desequilibradas, sesgos geograficos y demograficos en las imagenes).
- Riesgo de falsos positivos y negativos inherente a la deteccion de objetos; no se han publicado metricas de precision para estas variantes cuantizadas.
- La cuantizacion AMP puede degradar ligeramente la precision respecto al modelo en punto flotante original; no se documenta el impacto exacto.
- Blaize declara que no revisa ni avala el modelo de terceros y no ofrece garantias sobre su funcionamiento ni sobre infraccion de derechos de propiedad intelectual.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validacion comunitaria.
- No se dispone de informacion sobre el numero de parametros ni sobre el rendimiento real en el GSP.

## Enlaces

- HuggingFace: https://huggingface.co/Blaize-AI/YOLO11s_COCO
- Repositorio original de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO: https://cocodataset.org
- Blaize: https://www.blaize.com
