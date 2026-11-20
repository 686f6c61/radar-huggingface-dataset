# mvdelibas/gokyuzu-uydu-izi-obb-yolo11s-v2

## Resumen

Gokyuzu uydu izi OBB YOLO11s v2 es un detector de objetos basado en YOLO11s con cajas orientadas (oriented bounding boxes, OBB) especializado en la identificacion de estelas de satelite, aeronaves y meteoros, asi como impactos de rayos cosmicos, sobre imagenes de campo estelar de 512 x 512 px procedentes de telescopios automatizados. Lo desarrolla el usuario mvdelibas y se distribuye bajo licencia CC-BY-4.0 a traves de Hugging Face, con la libreria Ultralytics como dependencia de ejecucion.

El modelo aborda un problema concreto de la astronomia observacional: la contaminacion de imagenes cientificas por trazas de satelites y artefactos, que degrada la fotometria y la deteccion de fuentes debiles. Para ello emplea dos clases, `uydu_izi` (estela) y `kozmik_isin` (impacto cosmico), y devuelve cajas orientadas con angulo, lo que permite ajustar la geometria alargada de las trazas mucho mejor que una caja axis-aligned.

Es relevante por su enfoque declaradamente honesto sobre el dominio de validacion: se entrena y evalua con inyecciones sinteticas sobre recortes reales de SDSS DR17, no sobre un catalogo real de estelas de satelite. Con 12.000 imagenes y un backbone YOLO11s, es un modelo ligero y rapido, pensado como componente de preprocesado o filtrado en pipelines de imagen astronomica mas que como solucion final de produccion cientifica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s con cabeza OBB (oriented bounding boxes), Ultralytics |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 640 px en entrenamiento, imagenes de 512 x 512 px) |
| Tipos de cuantizacion | no disponible (pesos `.pt` de Ultralytics; convertible a ONNX/TensorRT/FP16 mediante herramientas de Ultralytics) |
| Idiomas soportados | en (etiquetas de clase y documentacion) |
| Licencia | cc-by-4.0 (pesos y datos); la arquitectura y el codigo de entrenamiento son AGPL-3.0 de Ultralytics |
| Formato de pesos | `.pt` (PyTorch, Ultralytics), fichero `gokyuzu-uydu-izi-obb-v2.pt` |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11s con cabeza de cajas orientadas, es decir, una red convolucional de una etapa que predice, para cada instancia, centro, dimensiones, angulo y clase. Se entreno durante 40 epocas a 640 px de resolucion de entrada, con batch 24 y optimizador AdamW, sobre el dataset `mvdelibas/gokyuzu-uydu-izi-obb-v1` (release v2): 12.000 imagenes divididas en 9.600 de entrenamiento, 1.200 de validacion y 1.200 de test, con particion por campo de origen sobre un total de 360 campos.

Los datos de fondo son recortes reales de SDSS DR17 en banda r, sobre los que se inyectan de forma sintetica las estelas, los rayos cosmicos y otros artefactos. Todas las instancias positivas, tanto en entrenamiento como en test, provienen del mismo generador sintetico, lo que constituye la limitacion metodologica principal del modelo. No se documenta uso de RLHF, DPO ni tecnicas de refinamiento posteriores; es un entrenamiento supervisado convencional de deteccion.

## Capacidades

- Deteccion de estelas alargadas con cajas orientadas (clase `uydu_izi`), incluyendo trazas de satelite, aeronaves y meteoros, agrupadas bajo una misma etiqueta de "estela o artefacto".
- Deteccion de impactos de rayos cosmicos (clase `kozmik_isin`) sobre el campo estelar.
- Salida con geometria completa: centro, ancho, alto, angulo y confianza por instancia (`result.obb.xywhr`, `result.obb.conf`).
- Procesamiento de imagenes de 512 x 512 px de telescopios automatizados, con inferencia a 640 px.
- Integracion directa con el ecosistema Ultralytics: prediccion, validacion, exportacion a otros formatos y despliegue por linea de comandos o API de Python.
- Capacidad de filtrado por umbral de confianza (`conf`) para ajustar el equilibrio entre falsos positivos y falsos negativos.
- No soporta tool calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking: es exclusivamente un detector de objetos de dominio astronomico.

## Casos de uso

- Limpieza de pipelines fotometricos: ejecutar el detector sobre cada frame antes de la extraccion de fuentes para enmascarar o descartar imagenes contaminadas por estelas, evitando que las trazas se confundan con objetos astronomicos reales.
- Control de calidad en telescopios roboticos: integrado en el bucle de adquisicion, el modelo puede marcar automaticamente frames afectados por satelites o rayos cosmicos y activar una reobservacion, gracias a su bajo coste computacional como YOLO11s.
- Filtrado previo de archivos historicos: procesar lotes de imagenes de archivo para cuantificar la tasa de contaminacion por estelas en funcion de la epoca y la posicion, un analisis relevante para estudios de impacto de constelaciones de satelites.
- Deteccion de rayos cosmicos en calibracion: usar la clase `kozmik_isin` para identificar impactos en el detector y separarlos de fuentes puntuales reales en la reduccion de datos.
- Prototipado de sistemas de alerta temprana: emplear el modelo como primera etapa rapida en un pipeline de dos fases, donde un segundo modelo mas costoso confirme o refine las detecciones sobre las regiones propuestas por las cajas orientadas.
- Generacion de datasets etiquetados: usar las predicciones sobre imagenes no anotadas como preetiquetado para acelerar la construccion de un catalogo real de estelas, con revision humana posterior.
- Investigacion metodologica: servir como referencia reproducible para comparar estrategias de deteccion de trazas (OBB frente a segmentacion o deteccion axis-aligned) sobre un conjunto sintetico controlado.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. La validacion de plataforma corresponde al split de validacion; el resto, al split de test v2 de 1.200 imagenes.

| Modelo | Subconjunto de test | mAP50 | mAP50-95 |
|---|---|---|---|
| v1 | test v1 antiguo (400) | 96,7% | 66,4% |
| v1 | anadido nuevo (800) | 75,5% | 48,3% |
| v2 (estos pesos) | test v1 antiguo (400) | 97,1% | 67,5% |
| v2 (estos pesos) | anadido nuevo (800) | 96,8% | 65,4% |
| v2 (estos pesos) | total (1.200) | 96,9% | 65,9% |

Validacion de plataforma (epoca 40): mAP50 97,1%, mAP50-95 67,9%. Por clase en el informe final: AP50 de `uydu_izi` 99,2% y de `kozmik_isin` 94,9%.

No se han publicado resultados sobre observaciones reales ni comparaciones con otros detectores en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del backbone YOLO11s y la entrada de 640 px, el modelo es apto para GPU de gama media y baja, aunque el autor no publica cifras.
- GPU recomendadas: no disponible. Cualquier GPU compatible con PyTorch y Ultralytics deberia poder ejecutarlo; el autor no especifica modelos concretos.
- GPU de consumo: previsiblemente cabe en GPU de consumo por tratarse de un YOLO11s, pero no hay confirmacion ni medidas publicadas.
- Opciones de despliegue: Ultralytics (Python y CLI), con exportacion a formatos como ONNX o TensorRT mediante las utilidades de la libreria; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado comparaciones con otros detectores de estelas de satelite en la informacion disponible. Como referencias de la misma familia arquitectonica, sin datos comparativos medidos:

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gokyuzu-uydu-izi-obb-yolo11s-v2 | no disponible | imagen 512/640 px | mAP50 96,9% (test sintetico) | CC-BY-4.0 (pesos), AGPL-3.0 (codigo) | Hugging Face |
| YOLO11s estandar (Ultralytics) | no disponible | imagen variable | no comparable (sin entrenamiento en este dominio) | AGPL-3.0 | Ultralytics |
| Detectores genericos de estelas en literatura astronomica | no disponible | no disponible | no disponible | variable | no disponible |

## Limitaciones y advertencias

- Todas las estelas, rayos cosmicos y artefactos son sinteticos y provienen del mismo generador en entrenamiento y test; los resultados no se trasladan uno a uno a observaciones reales.
- El modelo no ha sido validado sobre un catalogo real de estelas de satelite.
- La clase `uydu_izi` agrupa estelas de satelite, aeronaves y meteoros bajo una unica etiqueta; no distingue su origen fisico.
- Diversidad de fondo limitada: 360 campos de SDSS y una sola camara, lo que reduce la generalizacion a otros instrumentos, bandas o condiciones de cielo.
- Riesgo de falsos positivos y negativos en imagenes reales fuera de la distribucion sintetica; el umbral de confianza debe calibrarse en el dominio de destino.
- Licencia de los pesos CC-BY-4.0, que exige atribucion; la arquitectura y el codigo de entrenamiento son AGPL-3.0 de Ultralytics, con implicaciones relevantes para uso comercial y distribucion de software derivado.
- Las imagenes de fondo proceden de SDSS DR17 y el autor aclara que SDSS no respalda el modelo; debe mantenerse la atribucion correspondiente.
- Sin datos publicados de latencia, VRAM ni rendimiento en produccion; conviene medirlos en el hardware objetivo antes de desplegar.
- Modelo sin descargas ni validacion por parte de la comunidad en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/gokyuzu-uydu-izi-obb-yolo11s-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/mvdelibas/gokyuzu-uydu-izi-obb-v1
- Ultralytics (framework y licencia AGPL-3.0): https://github.com/ultralytics/ultralytics
- Sloan Digital Sky Survey DR17: https://www.sdss.org/dr17/
