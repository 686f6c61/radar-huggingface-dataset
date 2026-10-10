# egyx/hydroflow-water-segmentation

## Resumen

HydroFlow Water Segmentation es un modelo de segmentación semántica binaria de agua sobre imágenes satelitales multiespectrales Sentinel-2, publicado por el usuario egyx en Hugging Face bajo licencia MIT. Se distribuye como una plataforma completa (aplicación Flask, API REST y pesos) más que como un modelo aislado, e incluye los pesos en PyTorch y ONNX junto con un motor de inferencia autocontenido. El modelo resuelve la delimitación automática de masas de agua (lagos, ríos, embalses, arroyos y marismas) a partir de 12 canales de entrada, una tarea relevante para monitorización de inundaciones, gestión hídrica y agricultura de precisión.

La arquitectura es una U-Net con encoder ResNet-34 preentrenado y 12 canales de entrada, construida sobre segmentation_models_pytorch (SMP). El autor reporta un rendimiento global de 81,66 % de IoU, 91,48 % de precisión y 89,91 % de F1-Score. La inferencia se acelera con ONNX Runtime multihilo, alcanzando latencias declaradas por debajo de 25 ms por tesela (22,45 ms en el ejemplo de la API), con caché LRU de teselas y pooling de conexiones HTTP para la recuperación de imágenes satelitales.

El modelo se publica dentro de un ecosistema de despliegue (Hugging Face Spaces, Dockerfile, scripts de exportación a ONNX y suite de tests) que facilita su uso como servicio. Es un modelo de visión por computador de tamano reducido (pesos de aproximadamente 93-98 MB), lo que permite desplegarlo en hardware modesto, pero con un alcance limitado a la segmentación de agua y sin capacidades generativas ni de lenguaje.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net con encoder ResNet-34 preentrenado, definida con segmentation_models_pytorch (SMP) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; en los ejemplos de la API la entrada es de 12 canales x 128 x 128 píxeles por tesela |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de segmentación de imagen, sin entrada de texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`weights/best_model.pth`, ~98 MB) y ONNX (`weights/best_model.onnx`, ~93 MB) |

## Arquitectura y entrenamiento

El modelo es una U-Net de segmentación semántica con encoder ResNet-34 preentrenado, adaptada a una entrada de 12 canales en lugar de los 3 canales RGB habituales. La entrada de 12 bandas corresponde a datos multiespectrales de Sentinel-2, lo que permite explotar información fuera del espectro visible (por ejemplo, infrarrojo) para discriminar agua frente a otras coberturas. La definición del modelo se encuentra en `models/pretrained_smp.py` y la calibración de las 12 bandas en `config.py`. La salida es una máscara binaria de agua, con un umbral configurable (por defecto 0,50 en la API).

No se han publicado en la información disponible detalles sobre el conjunto de datos de entrenamiento (número de teselas, composición exacta, regiones geográficas o balance de clases), ni sobre el uso de técnicas de ajuste como RLHF o DPO, que no aplican a este tipo de modelo. La información sí menciona tres escenas de validación empaquetadas procedentes del split de test (lago, río y arroyo) con sus métricas de referencia. La innovación técnica declarada es de despliegue y eficiencia más que de arquitectura: exportación a ONNX con ejes dinámicos, ejecución multihilo en ONNX Runtime con latencias por debajo de 25 ms, caché LRU en memoria de 128 teselas y pooling de conexiones con `requests.Session` para la descarga de imágenes satelitales.

## Capacidades

- Segmentación semántica binaria de agua (máscara de agua / no agua) sobre imágenes multiespectrales de 12 canales de Sentinel-2.
- Procesamiento de teselas de imagen con dimensiones de ejemplo de 128 x 128 píxeles y 12 bandas.
- Cálculo de telemetría por inferencia: porcentaje de agua, recuento de píxeles de agua, píxeles totales, confianza media y latencia.
- Exportación de resultados en dos formatos: máscara PNG binaria en streaming o payload JSON con vistas base64.
- Ajuste de umbral de decisión en la llamada a la API (parámetro `threshold`).
- Integración con mapas interactivos mediante Leaflet.js y Esri World Imagery para recuperar imágenes bajo demanda y superponer la predicción.
- API REST autocontenida con endpoints `/predict`, `/predict_geo`, `/samples` y `/health`.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, funciones de agente ni capacidades multilingües, por tratarse de un modelo de visión especializado.

## Casos de uso

- Monitorización de inundaciones: dada una imagen Sentinel-2 de una zona afectada, el modelo devuelve la extensión de la lámina de agua en segundos (latencias declaradas por debajo de 25 ms por tesela), lo que permite generar cartografía de emergencia casi en tiempo real a partir del endpoint con formato JSON.
- Gestión de embalses y recursos hídricos: el porcentaje de agua devuelto por la API (`X-Water-Percentage`) permite hacer seguimiento de la superficie inundada de un embalse a lo largo del tiempo y estimar variaciones estacionales de volumen superficial.
- Agricultura de precisión y riego: la delimitación de canales, acequias y balsas de riego facilita la planificación de infraestructura hídrica y la detección de cambios en la red de distribución de agua.
- Detección de cambios en costas y riberas: comparando máscaras de agua entre distintas fechas se puede cuantificar la erosión o sedimentación en orillas, deltas y zonas de marisma.
- Vigilancia de cauces fluviales: el modelo distingue ríos y afluentes estrechos (el ejemplo de arroyo reporta 8,02 % de cobertura real con 87,38 % de IoU), útil para inventariado hidrográfico y seguimiento de caudales superficiales.
- Cartografía hidrológica para SIG: la salida como máscara PNG o como payload JSON con coordenadas permite integrar las predicciones en pipelines de QGIS, PostGIS o cualquier sistema de información geográfica.
- Seguimiento de sequías: la evolución del porcentaje de agua por tesela a lo largo de una serie temporal sirve como indicador proxy del estrés hídrico de una región.
- Validación y benchmarking interno: la plataforma incluye tres escenas de validación con ground truth empaquetadas, lo que permite reproducir las métricas y comparar contra futuros modelos en un pipeline propio.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| IoU global | 81,66 % |
| Precisión | 91,48 % |
| F1-Score | 89,91 % |
| Latencia (ONNX Runtime) | 22,45 ms en el ejemplo de la API (el autor declara por debajo de 25 ms) |

| Escena de validación | Cobertura ground truth | IoU |
|---|---|---|
| Sample 1 (lago / embalse) | 76,90 % | 93,88 % |
| Sample 2 (río / orilla) | 35,28 % | 96,15 % |
| Sample 3 (arroyo / marisma) | 8,02 % | 87,38 % |

No se han publicado en la información disponible comparaciones numéricas frente a otros modelos en los mismos conjuntos de datos de referencia (por ejemplo, MMLU, HumanEval o GSM8K no aplican a un modelo de segmentación).

## Requisitos de hardware

- VRAM estimada para inferencia: baja. Con pesos ONNX de ~93 MB y una ResNet-34 como encoder, el modelo cabe con holgura en GPUs de gama de entrada; no se proporciona una cifra oficial de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el modelo también puede ejecutarse en CPU. Se declara aceleración con ONNX Runtime multihilo, pero no se especifican modelos concretos de GPU.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo como las de la gama RTX (incluidas series 30 y 40) e incluso en hardware más modesto, dado el reducido tamano del modelo.
- Opciones de despliegue: ONNX Runtime y PyTorch para la inferencia; servidor Flask con Dockerfile incluido; desplegable en Hugging Face Spaces; incluye script `export_onnx.py` para reexportar a ONNX con ejes dinámicos.
- Latencia y throughput estimados: latencia declarada por debajo de 25 ms por tesela (22,45 ms en el ejemplo de la API). No se proporciona una cifra de throughput agregado.
- Almacenamiento: repositorio de aproximadamente 0,2 GB, incluyendo pesos, aplicación y escenas de ejemplo.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HydroFlow Water Segmentation (egyx) | U-Net ResNet-34, 12 canales Sentinel-2 | no disponible | 12 canales x 128 x 128 píxeles (ejemplo) | IoU 81,66 %, F1 89,91 %, precisión 91,48 % | MIT | Hugging Face |
| Modelos SAM / MobileSAM para segmentación de agua (hydrocam/water-segmentation) | Segment Anything y Segformer sobre imagen RGB | no disponible | RGB | no disponible | no disponible | GitHub |
| Habaek (arXiv 2410.15794) | Segmentación de agua de alto rendimiento | no disponible | imágenes de alta resolución | no disponible | no disponible | paper / código no confirmado |
| GeoAI water module | Segmentación a partir de satélite y aérea | no disponible | satélite y aérea | no disponible | no disponible | opengeoai.org |

La información disponible no permite una comparación cuantitativa directa entre estos modelos: solo HydroFlow publica métricas concretas (IoU, precisión y F1), mientras que las alternativas encontradas son repositorios o publicaciones sin cifras comparables en la misma fuente.

## Limitaciones y advertencias

- Alcance funcional restringido: solo realiza segmentación binaria de agua; no genera texto, no razona y no soporta tool calling ni agentes.
- Datos de entrenamiento no documentados: se desconoce la composición del dataset, la cobertura geográfica y el balance de clases, lo que dificulta evaluar posibles sesgos por región o tipo de masa de agua.
- Riesgo de degradación en masas de agua pequenas o de bajo contraste: la propia validación muestra que el escenario de arroyo (8,02 % de cobertura) obtiene un IoU de 87,38 %, inferior al de escenarios con más agua.
- Dependencia de la entrada multiespectral: el modelo espera 12 canales alineados con las bandas de Sentinel-2; usar imágenes RGB u otro satélite sin la calibración adecuada (`config.py`) puede producir resultados incorrectos.
- Dependencia de la calidad de la imagen de origen y de la resolución efectiva de la fuente satelital empleada (por ejemplo, Esri World Imagery en el explorador interactivo), que no es multispectral Sentinel-2 y puede introducir desajustes.
- Sensibilidad al umbral de decisión: la salida binaria depende del umbral configurado (0,50 por defecto), por lo que en producción conviene calibrarlo por escenario.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero el modelo se distribuye sin garantías explícitas de exactitud para aplicaciones críticas.
- No se han documentado procesos de validación en campo ni métricas operativas más allá del test interno del autor.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/egyx/hydroflow-water-segmentation
- Repositorio HydroFlow AI (referencia relacionada): https://github.com/ira4234/hydroflow_ai
- Repositorio hydrocam/water-segmentation (SAM y Segformer): https://github.com/hydrocam/water-segmentation
- Paper Habaek, segmentación de agua de alto rendimiento: https://arxiv.org/abs/2410.15794
- Evaluación de modelos de deep learning para segmentación automática de agua (IEEE): https://ieeexplore.ieee.org/document/9553345
- Módulo water de GeoAI: https://opengeoai.org/water/
