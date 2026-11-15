# ordnaryai/meridian-blur

## Resumen

Meridian Blur 1 es un modelo de deteccion de objetos especializado en privacidad, desarrollado por Ordnary y publicado bajo licencia Apache 2.0. Su funcion es localizar caras y matriculas de vehiculos en imagenes y video para poder anonimizarlas antes de almacenar, compartir o publicar el material. No es un modelo generativo ni un LLM: es un detector de dos clases (`0` cara, `1` matricula) empaquetado en ONNX y pensado para ejecutarse con ONNX Runtime tanto en CPU como en GPU.

Tecnicamente se basa en RF-DETR Small (Apache 2.0), afinado por Ordnary sobre imagenes de Open Images V7. La entrada es RGB redimensionada a 640 x 640, con tiling adicional de 960 px en imagenes grandes. El repositorio ocupa 0,3 GB e incluye pesos en ONNX (fp32 e int8) y safetensors, ademas de un script `inference.py` que gestiona el padding de las cajas y la persistencia temporal de detecciones en video.

Su relevancia practica esta en la metrica que reporta: la *leak rate*, es decir, el porcentaje de caras y matriculas etiquetadas que quedan cubiertas menos del 60% por la redaccion. Frente a la combinacion YuNet + YOLOv9-t, reduce la fuga en caras del 15,5% al 3,6% y en el conjunto de objetos del 15,0% al 4,6%, manteniendo un coste de inferencia superior pero asumible en CPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Small (fine-tuned por Ordnary) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | fp32 e int8 (ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (modelo y codigo) |
| Formato de pesos | ONNX (fp32, int8) y safetensors |

| Parametro adicional | Valor |
|---|---|
| Tarea | Object detection para redaccion de privacidad |
| Clases | `0` face, `1` license_plate |
| Entrada | RGB, resize a 640 x 640, mas tiles de 960 px en imagenes grandes |
| Runtime | ONNX Runtime (CPU o GPU) |
| Tamano del repo | 0,3 GB |
| Dataset de entrenamiento | Open Images V7 (clases "Human face" y "Vehicle registration plate") |
| Umbral de score | 0,3 con tiling |

## Arquitectura y entrenamiento

El modelo parte de RF-DETR Small, un detector basado en transformer (DETR) con licencia Apache 2.0, y fue afinado por Ordnary para dos clases concretas: caras y matriculas. La inferencia se realiza sobre imagenes redimensionadas a 640 x 640, con un esquema de tiling de 960 px que se aplica a imagenes grandes para mejorar la deteccion de objetos pequenos. El pipeline incluye padding de cajas antes del desenfoque (35% para caras, 12% para matriculas) y persistencia de cajas durante varios frames en video para evitar que una cara se descubra si el modelo falla en un frame aislado.

El entrenamiento se realizo sobre 30.158 imagenes de Open Images V7 con 75.134 caras y 7.543 matriculas etiquetadas. Ademas, se anadieron 12.381 caras que Open Images dejaba sin etiquetar, detectadas con YuNet (OpenCV Zoo, MIT) a un umbral de score alto. El conjunto de validacion fue de 800 imagenes. El afinado se ejecuto durante 20 epochs en una unica NVIDIA H100, con un tiempo total de 90 minutos. Las anotaciones de Open Images estan bajo CC BY 4.0 de Google y las imagenes bajo CC BY 2.0 de sus autores en Flickr; los IDs exactos se listan en `image_ids.txt` y la atribucion completa en `DATA_SOURCES.md`. No se usaron imagenes de clientes.

## Capacidades

- Deteccion de caras humanas en imagenes y video.
- Deteccion de matriculas de vehiculos en imagenes y video.
- Redaccion (desenfoque) de las regiones detectadas mediante el metodo `blur` del script de inferencia.
- Padding automatico de cajas: 35% para caras y 12% para matriculas, para cubrir pelo, orejas y linea de la mandibula.
- Persistencia temporal de cajas en video: mantiene cada caja durante varios frames tras la ultima deteccion.
- Procesamiento por tiling en imagenes grandes (tiles de 960 px) para mejorar la deteccion de objetos pequenos.
- Ejecucion en CPU o GPU a traves de ONNX Runtime.
- Interfaz de linea de comandos para imagenes y videos (`python inference.py entrada salida`).
- API programatica en Python: `MeridianBlur.detect(image)` devuelve lista de `(kind, x0, y0, x1, y1, score)` y `MeridianBlur.blur(image, boxes)` devuelve la imagen redactada.

## Casos de uso

- Anonimizacion de footage de dashcam antes de almacenarlo: el modelo detecta caras y matriculas en cada frame y aplica desenfoque con padding, de modo que el material grabado en via publica puede conservarse cumpliendo minimizacion de datos del RGPD.
- Publicacion de fotos de eventos o via publica: se ejecuta el detector sobre las imagenes antes de subirlas a una web o red social, redactando automaticamente las caras de transeuntes que no han dado consentimiento.
- Pipeline de privacidad por diseno en productos que capturan imagenes: integracion del ONNX en el backend para redactar antes de persistir en almacenamiento, con la version int8 para reducir coste de CPU.
- Procesamiento de video de vigilancia privada: redaccion de caras y matriculas en grabaciones de camaras de empresa antes de compartirlas con terceros o con autoridades, usando la persistencia temporal de cajas para evitar fugas entre frames.
- Conjuntos de datos para investigacion: anonimizacion de datasets de imagenes de dominio publico antes de su publicacion o comparticion, con la metrica de leak rate como criterio de aceptacion.
- Cumplimiento normativo en estudios de campo: redaccion de material audiovisual capturado en espacios publicos antes de entregarlo a un cliente o archivo, con la version fp32 cuando la precision prima sobre la latencia.
- Preprocesado en pipelines de vision por computador: ejecutar el detector como primer paso para eliminar regiones sensibles antes de pasar las imagenes a otros modelos de analitica.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente). Evaluados sobre 14.431 imagenes de validacion y test de Open Images V7 (3.639 de validacion, 10.792 de test) con 21.251 caras y 3.808 matriculas etiquetadas. La *leak rate* es el porcentaje de objetos etiquetados que quedan cubiertos menos del 60% por la redaccion con padding.

| Modelo | Leak caras | Leak matriculas | Leak total | mAP50 caras | mAP50 matriculas |
|---|---:|---:|---:|---:|---:|
| Meridian Blur 1 | 3,6% | 10,6% | 4,6% | 0,903 | 0,857 |
| Meridian Blur 1, int8 | 3,7% | 10,9% | 4,8% | 0,903 | 0,858 |
| YuNet + YOLOv9-t | 15,5% | 12,1% | 15,0% | 0,698 | 0,845 |

Leak rate por tamano del objeto (lado largo de la caja: pequeno < 32 px, mediano 32-96 px, grande > 96 px):

| Modelo | Caras pequenas | Caras medianas | Caras grandes | Matriculas pequenas | Matriculas medianas | Matriculas grandes |
|---|---:|---:|---:|---:|---:|---:|
| Meridian Blur 1 | 17,6% | 4,1% | 2,1% | 44,8% | 5,3% | 1,5% |
| Meridian Blur 1, int8 | 18,6% | 4,3% | 2,2% | 45,8% | 5,6% | 1,5% |
| YuNet + YOLOv9-t | 26,0% | 15,0% | 14,9% | 51,3% | 6,4% | 1,4% |

Latencia en CPU (4 nucleos, ONNX Runtime, mediana de 15 ejecuciones):

| Modelo | Imagen de 1280 px de ancho | Imagen de 2400 px de ancho |
|---|---:|---:|
| Meridian Blur 1, con tiling | 895 ms | 2.077 ms |
| Meridian Blur 1, int8, con tiling | 519 ms | 1.203 ms |
| Meridian Blur 1, int8, solo imagen completa | 189 ms | 194 ms |
| YuNet + YOLOv9-t | 137 ms | 330 ms |

Nota del autor: Open Images etiqueta caras y matriculas de una forma concreta y el modelo se entreno con imagenes etiquetadas igual, por lo que la comparacion favorece a Meridian Blur 1. Falta un conjunto de test verificado manualmente de otras fuentes.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El modelo es pequeno (repo de 0,3 GB) y esta pensado para ejecutarse en CPU; en GPU la huella seria modesta, pero el autor no publica cifras de VRAM.
- GPU recomendadas: no disponibles en la informacion proporcionada. El entrenamiento se realizo en una NVIDIA H100, pero no se especifican GPU de inferencia.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del repo y el soporte de ONNX Runtime en GPU, aunque no hay confirmacion en la model card.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con pesos fp32 e int8. El repositorio incluye `inference.py` para uso por linea de comandos o como modulo Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector de vision).
- Latencia en CPU (4 nucleos): 895 ms con tiling en imagen de 1280 px; 2.077 ms con tiling en imagen de 2400 px; 519 ms y 1.203 ms respectivamente en int8; 189 ms y 194 ms en int8 sin tiling.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Leak total | mAP50 caras | Licencia | Formato |
|---|---|---|---:|---:|---|---|
| Meridian Blur 1 | RF-DETR Small fine-tuned | cara, matricula | 4,6% | 0,903 | Apache 2.0 | ONNX, safetensors |
| Meridian Blur 1 int8 | RF-DETR Small fine-tuned, cuantizado | cara, matricula | 4,8% | 0,903 | Apache 2.0 | ONNX |
| YuNet + YOLOv9-t | Pipeline de dos detectores | cara (YuNet), matricula (YOLOv9-t) | 15,0% | 0,698 | YuNet MIT; YOLOv9-t no disponible | no disponible |

La comparacion con YuNet + YOLOv9-t es la unica que publica el autor. Meridian Blur 1 mejora la fuga total en 10,4 puntos porcentuales y el mAP50 de caras en 0,205, a costa de mayor latencia en CPU (895 ms frente a 137 ms en imagen de 1280 px con tiling; 519 ms frente a 137 ms en int8 con tiling). No se dispone de comparacion con otros detectores especializados en privacidad.

## Limitaciones y advertencias

- Las matriculas pequenas y lejanas son dificiles: el 44,8% de las matriculas de menos de 32 px presentan fuga, y el 5,3% de las medianas (32-96 px).
- Las caras pequenas tambien presentan fuga elevada: 17,6% por debajo de 32 px, frente a 4,1% en medianas y 2,1% en grandes.
- La comparacion con YuNet + YOLOv9-t puede estar sesgada a favor del modelo porque ambos se evaluaron sobre el mismo estilo de etiquetado de Open Images con el que se entreno.
- Falta un conjunto de test verificado manualmente a partir de otras fuentes; los resultados actuales no estan verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinacion no aplica en el sentido generativo, pero si hay falsos positivos que provocan redacciones innecesarias (el autor senala que desenfocar una farola no tiene coste, pero conviene revisar el ratio de falsos positivos en produccion).
- Uso fuera de alcance prohibido por el autor: identificar, reconocer o rastrear personas, leer matriculas para seguir vehiculos, construir sistemas de vigilancia o perfilado, o tomar decisiones sobre personas. Consultar la AI Usage Policy de Ordnary.
- La licencia Apache 2.0 permite uso comercial, pero las imagenes de entrenamiento tienen licencias propias (CC BY 2.0 de autores de Flickr, anotaciones CC BY 4.0 de Google) que deben respetarse en la atribucion.
- El modelo solo detecta dos clases; no cubre otras regiones sensibles (documentos, pantallas, uniformes, voces).
- No se publican datos de sesgo por demografia, iluminacion, angulo de camara ni dominio; el rendimiento en footage nocturno, CCTV de baja calidad o dominios no representados en Open Images es desconocido.
- La persistencia temporal de cajas en video puede mantener redacciones sobre regiones ya sin objeto durante varios frames, lo que afecta a la fidelidad visual del material.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ordnaryai/meridian-blur
- Ordnary (desarrollador): https://ordnary.com
- Politica de uso de IA de Ordnary: https://ordnary.com/legal/technologies/ai-usage-policy
- Open Images V7: https://storage.googleapis.com/openimages/web/index.html
- YuNet (OpenCV Zoo): no disponible en los datos proporcionados
- YOLOv9-t (open-image-models): no disponible en los datos proporcionados
