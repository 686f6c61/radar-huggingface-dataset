# kenantabak/yolo26s-wildfire-smoke-early-detection-tr

## Resumen

El modelo `yolo26s-wildfire-smoke-early-detection-tr` es un detector de objetos de una sola clase (`smoke`) desarrollado por Kenan Tabak y entrenado sobre la plataforma EVREN (SSYZ) para la deteccion temprana de humo de incendios forestales. Emplea la arquitectura `yolo26s` de Ultralytics (variante Small de YOLO26) y se distribuye bajo licencia CC BY 4.0, con pesos en PyTorch, ONNX y TFLite. Su proposito es alimentar sistemas de vigilancia en torres forestales, drones e IP camaras rurales que necesitan identificar columnas de humo incipientes antes de que el fuego se propague.

El modelo es relevante por su caracter especializado y ligero: con un peso de 18.5 MB y entrenamiento de apenas 0.058 GPU-horas, alcanza un mAP@50 del 93.96 % y un F1 del 90.00 % en su conjunto de validacion. No es un modelo de lenguaje ni un modelo multimodal generalista, sino un detector visual de un unico objeto, lo que lo hace adecuado para despliegue en el borde (edge) y en pipelines de alerta temprana. Su limitacion principal es la escasez de validacion externa: los resultados declarados por el autor no estan verificados de forma independiente y el mAP@50-95 aparece como 0.00 en el model-index, en contradiccion con el 53.05 % que figura en la model card.

La ficha se centra en sus especificaciones de deteccion, su uso practico en prevencion de desastres y sus requisitos de hardware, que son muy modestos en comparacion con modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `yolo26s` (Ultralytics YOLO26 Small), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; entrada de imagen 640 x 640 px |
| Tipos de cuantizacion | no disponible (exportacion a ONNX y TFLite; cuantizacion INT8 no documentada) |
| Idiomas soportados | tr, en (etiquetas y documentacion; el modelo no procesa texto) |
| Licencia | CC BY 4.0 (pesos); framework Ultralytics bajo AGPL-3.0 |
| Formato de pesos | PyTorch (`best.pt`), ONNX (`best.onnx`), TFLite (`best.tflite`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura YOLO26 en su variante Small, un detector de objetos de una etapa disenado para inferencia en tiempo real. Procesa imagenes de 640 x 640 px y produce cajas delimitadoras con una unica clase (`smoke`). El entrenamiento se realizo sobre el dataset `Orman Yangını Dumanı Tespiti (1 Sınıf)` (version v1.0) de la plataforma EVREN, catalogado como Grade A (100/100). Se empleo el optimizador `auto` con programacion de tasa de aprendizaje coseno y precision mixta automatica (AMP), durante 50 epocas, con un coste total de 0.058 GPU-horas en una NVIDIA H200 o A100. El mejor checkpoint se obtuvo en la epoca 50 de 50.

No se documenta el numero de imagenes del dataset, la composicion exacta (proporcion de imagenes con humo frente a negativas), ni si se aplicaron tecnicas de aumento de datos o ajuste fino adicional. Tampoco se especifica si el modelo incorpora innovaciones propias de YOLO26 como decodificacion sin NMS o atencion lineal; la model card solo indica la arquitectura base. El peso final es de 18.5 MB.

## Capacidades

- Deteccion de objetos de una sola clase: identifica columnas de humo (`smoke`) en imagenes RGB.
- Inferencia en tiempo real sobre imagenes de 640 x 640 px, apta para video en directo si se procesa fotograma a fotograma.
- Exportacion a multiples formatos: PyTorch, ONNX y TFLite, lo que facilita el despliegue en servidores, navegadores y dispositivos moviles o embebidos.
- Integracion con la libreria Ultralytics (`YOLO("best.pt")`), con API de prediccion, visualizacion (`results[0].show()`) y guardado de resultados.
- Capacidades multilingues limitadas a etiquetas y documentacion en turco e ingles; el modelo no procesa lenguaje natural.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general, audio ni modo thinking.

## Casos de uso

- Vigilancia en torres forestales: el modelo se ejecuta sobre el flujo de una camara fija y emite una alerta cuando detecta humo con confianza superior a 0.25, gracias a su mAP@50 del 93.96 % en el dominio de humo forestal.
- Monitorizacion con drones: al pesar 18.5 MB y exportarse a ONNX o TFLite, puede embarcarse en la carga util de un dron para detectar columnas de humo en vuelo y enviar coordenadas al puesto de mando.
- Red de IP camaras rurales: se despliega en un mini-PC o en el borde de la red para procesar varias camaras en paralelo, reduciendo el ancho de banda necesario al enviar solo eventos de deteccion.
- Sistema de alerta temprana para proteccion civil: integrado en un pipeline que cruza detecciones con datos meteorologicos (viento, humedad) para priorizar avisos a brigadas forestales.
- Analisis forense y post-incendio: procesamiento por lotes de imagenes historicas o grabaciones para reconstruir la evolucion temporal de una columna de humo y estimar el punto de ignicion.
- Investigacion en vision por computador aplicada a desastres: el modelo sirve como linea base reproducible (pesos publicos, licencia CC BY 4.0) para comparar tecnicas de deteccion temprana de humo en entornos turcos y mediterraneos.
- Prototipado rapido en aplicaciones moviles: la exportacion TFLite permite integrar la deteccion en una app Android o iOS para uso de voluntarios o guardas forestales en campo.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Metrica | Valor | Nota |
|---|---:|---|
| mAP@50 (%) | 93.96 | Declarado en model-index y model card |
| mAP@50-95 (%) | 0.00 en model-index / 53.05 en model card | Discrepancia entre ambas fuentes |
| F1 Score (%) | 90.00 | Declarado en model-index y model card |
| Precision (%) | 89.84 | Solo en model card |
| Recall (%) | 90.22 | Solo en model card |
| AP@50 clase `smoke` (%) | 93.99 | Solo en model card |
| Mejor epoca | 50 / 50 | Solo en model card |

No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores. No hay comparacion con otros detectores de humo ni con variantes YOLO de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con un peso de 18.5 MB y entrada de 640 x 640 px, la huella es del orden de cientos de MB, apta para GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El entrenamiento se realizo en H200 o A100, pero la inferencia no requiere ese hardware.
- Cabe en GPU consumer: si, practicamente en cualquier GPU dedicada moderna e incluso en iGPU recientes mediante ONNX Runtime o TFLite.
- Opciones de despliegue: Ultralytics (PyTorch), ONNX Runtime, TensorFlow Lite, y frameworks de inferencia compatibles con ONNX. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de FPS ni latencia por imagen.

## Comparativa con modelos similares

| Modelo | Tipo | Clase(s) | mAP@50 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `yolo26s-wildfire-smoke-early-detection-tr` | YOLO26 Small | 1 (`smoke`) | 93.96 % (declarado) | CC BY 4.0 | Hugging Face |
| YOLO11 Small (base Ultralytics) | YOLO11 Small | 80 (COCO) | no disponible en esta ficha | AGPL-3.0 | Ultralytics |
| Detectores de humo genericos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos de benchmarks de otros detectores de humo comparables en la informacion proporcionada, por lo que la comparativa cuantitativa con alternativas de la misma tarea no esta disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset de entrenamiento procede de la plataforma EVREN y esta orientado a entornos turcos; el rendimiento puede degradarse en otras regiones, tipos de vegetacion, condiciones de iluminacion o sensores distintos.
- Riesgo de falsos positivos y negativos: la clase unica `smoke` puede confundirse con niebla, nubes bajas, polvo o vapor industrial; no se documentan pruebas con negativos duros.
- Discrepancia en metricas: el mAP@50-95 figura como 0.00 en el model-index y como 53.05 % en la model card, lo que exige cautela al citar resultados.
- Resultados no verificados: todas las metricas son declaraciones del autor (`verified: false`); no hay validacion independiente ni conjunto de test externo.
- Limitaciones de contexto e idioma: el modelo no procesa texto ni lenguaje natural; las etiquetas de idioma (tr, en) se refieren a la documentacion, no a capacidades linguisticas.
- Restricciones de licencia: los pesos son CC BY 4.0 y permiten uso comercial con atribucion, pero el framework Ultralytics es AGPL-3.0, lo que puede imponer obligaciones adicionales si se integra el codigo de Ultralytics en un producto propietario.
- Caveat para produccion: al ser un detector de una sola clase y sin mediciones de latencia publicadas, es necesario validar el umbral de confianza, la tasa de falsas alarmas y el rendimiento en el hardware objetivo antes de desplegarlo en un sistema de alerta real.
- Sin soporte documentado de cuantizacion INT8 ni de optimizaciones especificas para edge, aunque la exportacion TFLite abre esa via.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kenantabak/yolo26s-wildfire-smoke-early-detection-tr
- Pagina del modelo en EVREN: https://evren.ssyz.org.tr/models/u19979974710e/orman-yangini-dumani-tespiti
- Dataset de entrenamiento en EVREN: https://evren.ssyz.org.tr/datasets/u19979974710e/orman-yangini-dumani-tespiti-1-sinif
- Perfil del desarrollador en EVREN: https://evren.ssyz.org.tr/profile/u19979974710e
- Catalogo de datasets de vision por computador en turco: https://huggingface.co/datasets/kenantabak/evren-turkish-computer-vision-316-datasets
- Framework Ultralytics: https://github.com/ultralytics/ultralytics
