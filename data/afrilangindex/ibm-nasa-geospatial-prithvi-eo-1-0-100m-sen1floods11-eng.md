# AfriLangIndex/ibm-nasa-geospatial-prithvi-eo-1-0-100m-sen1floods11-eng

## Resumen

Prithvi-EO-1.0-100M-sen1floods11 es un modelo de vision por satelite de tipo transformer (ViT) desarrollado originalmente por IBM Research y NASA, especializado en teledeteccion. Este repositorio concreto es una redistribucion alojada por AfriLangIndex dentro de la African NLP Data Library, con revisión del equipo Masakhane (referencia SUB-20261122-FA5F). El modelo resuelve la tarea de segmentacion de inundaciones (image classification a nivel de pixel) sobre imagenes Sentinel-2 del dataset Sen1Floods11, con una resolucion espacial de 100 m por pixel.

La arquitectura es un Vision Transformer de 100 millones de parametros, preentrenado con datos multiespectrales de la mision HLS (Harmonized Landsat-Sentinel) de la NASA. El modelo es relevante porque demuestra la aplicacion de transformers a datos de observacion de la Tierra (EO) con bandas espectrales multiples, un dominio donde los modelos de vision convencionales (entrenados en RGB) no funcionan directamente.

Este repositorio tiene 1,2 GB de tamano y no registra descargas ni likes en el momento de la consulta. La model card es minima: no incluye hiperparametros de entrenamiento, resultados de benchmarks ni instrucciones de uso detalladas. La informacion disponible sobre el modelo original es limitada en este repositorio, por lo que muchos campos tecnicos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT), segun el nombre del modelo (Prithvi-EO-1.0-100M); detalles no disponibles |
| Parametros totales | 100M (segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | eng (ingles, segun metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible |
| Tarea | image-classification (segmentacion de inundaciones) |
| Resolucion espacial | 100 m por pixel (segun el nombre) |
| Dataset de referencia | Sen1Floods11 |
| Modalidad | imagen multiespectral (Sentinel-2) |
| Tamano del repo | 1,2 GB |
| Dominio | GIS / teledeteccion |

## Arquitectura y entrenamiento

El modelo se basa en un Vision Transformer de aproximadamente 100 millones de parametros, disenado para procesar imagenes satelitales multiespectrales. El nombre indica que trabaja a 100 m de resolucion espacial y que esta especializado en el dataset Sen1Floods11, un benchmark de segmentacion de inundaciones construido a partir de imagenes Sentinel-2 y etiquetas de agua/inundacion. El preentrenamiento original de Prithvi-EO-1.0 se realizo con datos HLS de la NASA (combinacion armonizada de Landsat 8/9 y Sentinel-2), lo que permite al modelo manejar multiples bandas espectrales mas alla del RGB.

No se dispone en este repositorio de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO (no aplicable a un modelo de vision) ni innovaciones tecnicas concretas como atencion lineal o decodificacion especulativa. La model card solo indica que se trata de un dataset GIS de IBM fechado en 2025, con 120 muestras aproximadas y contribuido por Olamide Teslim Shogbamu. Cualquier detalle adicional sobre la arquitectura interna, el proceso de fine-tuning sobre Sen1Floods11 o las tecnicas de aumento de datos debe consultarse en la documentacion del modelo original de IBM/NASA, no incluida aqui.

## Capacidades

- Clasificacion de imagenes satelitales multiespectrales (Sentinel-2) a nivel de pixel.
- Segmentacion binaria de agua/inundacion sobre el dataset Sen1Floods11.
- Procesamiento de imagenes de observacion de la Tierra a 100 m de resolucion.
- Manejo de multiples bandas espectrales (no solo RGB), segun el diseno del modelo original Prithvi-EO.
- No se documenta soporte de tool calling, function calling ni agentes.
- No se documenta capacidad multilingue mas alla del ingles en metadatos.
- No se documenta modo thinking, vision general, audio ni otras modalidades.
- No se documenta razonamiento de multiples pasos ni generacion de texto.

## Casos de uso

- Monitorizacion de inundaciones a escala regional: el modelo clasifica pixeles de imagenes Sentinel-2 como agua o no agua, permitiendo generar mapas de extension de inundaciones a 100 m de resolucion para evaluacion de danos y respuesta a emergencias.
- Evaluacion de riesgo hidrologico: integrado en pipelines de teledeteccion, puede procesar series temporales de imagenes para detectar cambios en la cobertura de agua y alimentar modelos de riesgo de avenidas.
- Validacion de productos de inundacion existentes: sirve como referencia para comparar mapas de inundacion generados por otros metodos (sensores SAR, modelos hidrologicos) sobre las mismas areas del dataset Sen1Floods11.
- Investigacion en teledeteccion: base para experimentos de fine-tuning sobre nuevos eventos de inundacion o regiones geograficas, dado que el modelo esta preentrenado en datos HLS multiespectrales.
- Seguros y evaluacion de siniestros: analisis post-evento de imagenes satelitales para estimar areas afectadas por inundaciones en zonas aseguradas.
- Agricultura y gestion de recursos hidricos: deteccion de superficies inundadas en tierras de cultivo para planificacion de riego y evaluacion de perdidas de cosecha.
- Docencia y prototipado en EO: ejemplo reproducible de aplicacion de Vision Transformers a datos satelitales multiespectrales, con licencia Apache-2.0 que facilita su uso academico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de IoU, precision, recall ni comparaciones con otros modelos sobre Sen1Floods11.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision. Para un ViT de 100M parametros en precision FP32 se estiman aproximadamente 0,4 GB solo de pesos; con activaciones y procesamiento por teselas de imagenes satelitales, el consumo real puede ser mayor y depende del tamano de lote y de la resolucion de las teselas.
- GPU recomendadas: no disponible. Por tamano, cabria en GPUs consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB), asi como en A100/H100 para procesamiento por lotes a gran escala, pero no hay confirmacion en la documentacion.
- Cabe en GPU consumer: probablemente si, dado el tamano de 100M parametros, aunque no se documenta oficialmente.
- Opciones de despliegue: no disponible. Al ser un modelo de vision, no aplican vLLM, llama.cpp u Ollama; el despliegue tipico seria con PyTorch, TorchScript o ONNX Runtime, pero no se especifica en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prithvi-EO-1.0-100M-sen1floods11 (este repo) | 100M | 100 m/pixel, Sentinel-2 | Segmentacion de inundaciones | Apache-2.0 | Hugging Face (AfriLangIndex) |
| Prithvi-EO-1.0-100M (original IBM/NASA) | 100M | 100 m/pixel, HLS | Preentrenamiento EO general | Apache-2.0 (segun repo original) | Hugging Face (ibm-nasa-geospatial) |
| Prithvi-EO-2.0-300M | 300M | 30 m/pixel | Segmentacion EO multiple | Apache-2.0 (segun repo original) | Hugging Face (ibm-nasa-geospatial) |
| Modelos de segmentacion de inundaciones basados en U-Net / ResNet | variable | variable | Segmentacion de inundaciones | variable | variable |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. La comparativa se limita a parametros, resolucion y licencia; los valores de los modelos alternativos provienen de conocimiento general de la familia Prithvi y no de este repositorio, por lo que deben verificarse en sus respectivas model cards.

## Limitaciones y advertencias

- La model card es minima y no documenta el proceso de entrenamiento, los hiperparametros ni las metricas de validacion; no es posible evaluar la calidad del modelo solo con este repositorio.
- El modelo esta especializado en el dataset Sen1Floods11 y en imagenes Sentinel-2 a 100 m; su generalizacion a otras regiones, sensores o resoluciones no esta documentada.
- Riesgo de alucinacion en el sentido de falsos positivos/negativos en la clasificacion de pixeles: sin metricas publicadas no se puede cuantificar.
- Sesgos potenciales derivados de la distribucion geografica del dataset Sen1Floods11, que no cubre uniformemente todas las regiones del mundo; el rendimiento puede degradarse en areas subrepresentadas.
- Limitacion idiomatica: los metadatos solo declaran ingles; la documentacion y las etiquetas estan en ingles.
- Licencia Apache-2.0 permite uso comercial y modificacion, pero se recomienda verificar la procedencia de los datos de entrenamiento (Sentinel-2 es de acceso abierto, pero las etiquetas de Sen1Floods11 tienen sus propias condiciones).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente de esta redistribucion concreta.
- La fecha de creacion indicada (2026-11-22) es posterior a la fecha actual en la mayoria de contextos; conviene verificar la integridad y procedencia del repositorio antes de usarlo en produccion.
- No se especifica el formato de pesos ni las dependencias de software, lo que anade friccion a la integracion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AfriLangIndex/ibm-nasa-geospatial-prithvi-eo-1-0-100m-sen1floods11-eng
- Modelo original (referencia en la model card): https://huggingface.co/ibm-nasa-geospatial/Prithvi-EO-1.0-100M-sen1floods11
- Organizacion IBM/NASA en Hugging Face: https://huggingface.co/ibm-nasa-geospatial
- Dataset Sen1Floods11: no disponible en la informacion proporcionada
- Paper de Prithvi: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
