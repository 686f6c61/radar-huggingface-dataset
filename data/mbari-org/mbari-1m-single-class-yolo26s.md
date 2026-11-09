# MBARI-org/mbari-1m-single-class-yolo26s

## Resumen

MBARI-1M single-class YOLO26s es un modelo de deteccion de objetos de clase unica (class-agnostic) desarrollado por MBARI-org (Monterey Bay Aquarium Research Institute) y afinado a partir de Ultralytics/YOLO26. Su proposito es detectar organismos y objetos de interes biologico en imagenes submarinas y de aguas profundas, un dominio donde los detectores genericos entrenados con datasets terrestres rinden mal por la iluminacion, la turbidez, la baja relacion senal-ruido y la morfologia atipica de la fauna marina.

El modelo se presenta como un detector binario: no distingue entre especies ni categorias, sino que localiza "cualquier objeto biologico relevante" con una unica clase. Este enfoque es habitual en pipelines de analisis de video submarino, donde el primer paso es filtrar fotogramas con detecciones de interes antes de aplicar clasificadores o modelos mas costosos. El entrenamiento se realizo sobre el dataset interno MBARI VARS 1M, con una particion de validacion aleatoria a nivel de imagen.

La relevancia actual del modelo reside en su especializacion: es un componente practico para el procesamiento a gran escala de imagenes de vehiculos operados remotamente (ROV) y plataformas de observacion oceanica, con una licencia AGPL-3.0 que condiciona su uso comercial. El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentacion en ingles) |
| Licencia | AGPL-3.0 |
| Formato de pesos | no disponible (libreria ultralytics; pesos PyTorch `.pt` presumiblemente, no confirmado) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO26 de la familia Ultralytics, una arquitectura de deteccion de objetos de una etapa basada en red troncal convolucional con cuello de agregacion multiescala y cabecera de prediccion densa. La variante "s" corresponde al tamano small de la familia YOLO26. El modelo se ha afinado (finetune) desde los pesos preentrenados de Ultralytics/YOLO26, no se ha entrenado desde cero.

El entrenamiento se realizo sobre el dataset interno MBARI VARS 1M, con una particion de validacion aleatoria a nivel de imagen (random image-level validation split). No se dispone de informacion publica sobre el numero de tokens, la composicion exacta del dataset, ni sobre el uso de tecnicas de refinamiento como RLHF o DPO, que no aplican a un detector de objetos. Tampoco se documentan innovaciones tecnicas adicionales mas alla de las propias de la arquitectura YOLO26.

## Capacidades

- Deteccion de objetos de clase unica (class-agnostic) en imagenes submarinas y de aguas profundas.
- Localizacion de organismos y objetos biologicos de interes sin clasificacion taxonomica.
- Procesamiento de imagenes individuales y, por extension de la libreria ultralytics, de flujos de video.
- Integracion con el ecosistema Ultralytics (entrenamiento, validacion, exportacion a formatos de despliegue).
- Capacidades multilingues: no aplica; el modelo opera sobre imagenes, no sobre texto.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales: no se documentan modos de pensamiento, vision multimodal ni audio.

## Casos de uso

- Filtrado de fotogramas en video de ROV: el detector recorre el metraje y marca los fotogramas con presencia de objetos biologicos, reduciendo el volumen que debe revisar un biologo marino o un clasificador posterior. Su naturaleza de clase unica lo hace adecuado como primera etapa de un pipeline en cascada.
- Analisis de imagenes de plataformas de observacion oceanica: aplicacion sobre series temporales de camaras submarinas para cuantificar la actividad biologica y detectar eventos puntuales.
- Preetiquetado para anotacion humana: el modelo genera cajas candidatas que los anotadores revisan y corrigen, acelerando la construccion de datasets taxonomicos etiquetados.
- Monitorizacion de habitats bentonicos: deteccion de agregaciones de organismos sobre el fondo marino en estudios de ecologia y seguimiento de comunidades.
- Investigacion en biologia marina: extraccion de estadisticas de presencia y densidad a partir de archivos historicos de imagen submarina.
- Despliegue en plataformas con recursos limitados: al tratarse de una variante "s" de YOLO, es candidato para inferencia en hardware modesto o en el propio vehiculo, siempre que se valide el rendimiento en el dominio objetivo.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre el dataset interno MBARI VARS 1M con particion de validacion aleatoria a nivel de imagen:

| Metrica | Valor |
|---|---|
| mAP@0.50 | 0.738 |
| mAP@0.50:0.95 | 0.574 |
| Precision | 0.717 |
| Recall | 0.644 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; al ser una variante "s" de YOLO, la huella es moderada, pero no se confirma un valor concreto.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamano de la variante "s" es plausible, pero no se dispone de datos verificados.
- Opciones de despliegue: la libreria declarada es ultralytics, lo que habilita el flujo habitual de exportacion de Ultralytics (ONNX, TensorRT, etc.); no se confirman formatos concretos ni soporte de vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de comparacion con otros detectores en la informacion proporcionada. Como referencia cualitativa, el modelo se posiciona frente a alternativas genericas como los detectores YOLO preentrenados en COCO (no especializados en dominio submarino) y frente a detectores especializados de biologia marina, pero no se han publicado metricas comparables en la informacion disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mbari-1m-single-class-yolo26s | no disponible | no aplica | mAP@0.50 = 0.738 (validacion interna) | AGPL-3.0 | Gated en Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de clase unica: no distingue especies ni categorias; cualquier uso taxonomico requiere un clasificador adicional.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- La particion de validacion es aleatoria a nivel de imagen sobre un dataset interno; puede sobreestimar el rendimiento en imagenes correlacionadas del mismo entorno y no garantiza generalizacion a otras regiones, profundidades o condiciones de iluminacion.
- Sesgos conocidos: no documentados, pero es esperable un sesgo hacia la distribucion de imagenes de MBARI VARS 1M (fauna, camaras y condiciones de captura del instituto).
- Riesgo de falsos positivos y negativos en condiciones de baja visibilidad, turbidez o morfologias no representadas en el entrenamiento.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el software que incorpore el modelo y su uso en red; es necesario revisar su compatibilidad antes de un uso comercial o en productos propietarios.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de la descarga.
- No se documentan limitaciones de idioma porque el modelo no procesa texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MBARI-org/mbari-1m-single-class-yolo26s
- Modelo base: https://huggingface.co/Ultralytics/YOLO26
- DOI: https://doi.org/10.57967/hf/11536
- MBARI (homepage): https://www.mbari.org/
- MBARI (noticias): https://www.mbari.org/news/
- MBARI en Wikipedia: https://en.wikipedia.org/wiki/Monterey_Bay_Aquarium_Research_Institute
- Canal de YouTube de MBARI: https://www.youtube.com/@MBARIvideo
