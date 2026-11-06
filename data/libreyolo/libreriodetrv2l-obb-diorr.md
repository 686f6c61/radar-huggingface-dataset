# LibreYOLO/LibreRiODETRv2l-obb-diorr

## Resumen

LibreRiODETRv2l-obb-diorr es un detector de objetos orientados (oriented object detection, OBB) derivado de RiO-DETRv2-L y entrenado sobre el conjunto de datos DIOR-R, con 20 clases y entrada de 800 píxeles. El modelo lo publica el proyecto LibreYOLO como un port listo para su librería homónima, manteniendo los pesos originales del autor upstream (RicePasteM). La relevancia principal no está en la arquitectura en sí, sino en el trabajo de empaquetado y en la trazabilidad de licencia: se toma el commit inicial de RiO-DETRv2, publicado bajo Apache-2.0, y se preserva esa concesión frente a la relicenciación posterior a AGPL-3.0 del repositorio original.

El modelo pertenece a la familia RiO-DETRv2, una evolución de los detectores DETR con atención orientada pensada para imágenes aéreas y de teledetección, donde los objetos aparecen rotados y en densidades altas. La variante "l" corresponde al tamaño grande de la familia, con backbone HGNetv2. La conversión a LibreYOLO implica remapeo de claves del state-dict, eliminación del proyector de destilación usado solo en entrenamiento y adición de metadatos, sin modificar ningún parámetro aprendido: según la model card, las salidas crudas coinciden exactamente con las del modelo upstream (max_abs_diff 0).

El interés práctico es doble. Por un lado, ofrece un detector OBB de teledetección con licencia Apache-2.0 y formato `.pt` consumible mediante una API unificada (`LibreYOLO(...)`). Por otro, sirve como ejemplo de cómo portar pesos de familias con licencias cambiantes sin arrastrar restricciones copyleft, algo relevante para equipos que integran visión por computador en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2 (DETR con atención orientada), backbone HGNetv2-L |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 800 px) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión, sin capacidades de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (state-dict convertido para LibreYOLO; pesos upstream en `.pth`) |

## Arquitectura y entrenamiento

RiO-DETRv2 es un detector basado en transformer con mecanismo DETR, en el que la predicción se formula como un conjunto de consultas que se refinan iterativamente mediante atención. La variante "obb" indica que las cajas se predicen como rectángulos orientados (con ángulo), lo que es necesario en imágenes aéreas donde los objetos no están alineados con los ejes de la imagen. El backbone es HGNetv2 en su escala L, y la entrada de inferencia es de 800 píxeles.

El entrenamiento se realizó sobre DIOR-R, un benchmark de teledetección con 20 clases y anotaciones en cajas orientadas. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en detección). La innovación destacable del port es de ingeniería: remapeo de claves del state-dict, eliminación del proyector de destilación exclusivo de entrenamiento y verificación de equivalencia numérica con el modelo original (diferencia absoluta máxima de 0 en las salidas crudas). El código fuente se fija al commit `ab8b22df5d800a927774c8c67e77fd29c0fe6967`, correspondiente a la release inicial Apache-2.0 de RiO-DETRv2.

## Capacidades

- Detección de objetos orientados (OBB) en imágenes aéreas y de teledetección.
- Predicción de cajas rotadas con ángulo, adecuada para objetos no alineados con los ejes.
- Clasificación en 20 clases del conjunto DIOR-R.
- Inferencia sobre imágenes de 800 píxeles de entrada.
- Integración con la API unificada de LibreYOLO (`model("image.jpg", save=True)`).
- Exportación y evaluación mediante las utilidades de la librería LibreYOLO.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- Capacidades multilingües: no aplica.

## Casos de uso

- Detección de vehículos y aeronaves en imágenes satelitales: el modelo predice cajas orientadas, lo que permite localizar aviones en pistas o barcos en puertos con independencia de su rumbo, algo que un detector de cajas alineadas a ejes no resuelve bien.
- Inventario de infraestructura en ortofotos: con 20 clases DIOR-R se pueden contabilizar elementos como puentes, presas o campos deportivos en mosaicos aéreos de 800 px por tesela, integrando el modelo en un pipeline de teselado y post-procesado.
- Monitorización de cambios urbanos: ejecutar el detector sobre pares de imágenes de la misma zona en fechas distintas y comparar las detecciones orientadas para identificar nuevas construcciones o movimientos de vehículos.
- Análisis de imágenes de drones para agricultura: detección de parcelas, invernaderos o maquinaria con orientación arbitraria respecto al marco de la imagen, aprovechando la invariancia rotacional implícita del enfoque OBB.
- Prototipado rápido en investigación de teledetección: al estar empaquetado en LibreYOLO con una API de una línea, sirve como baseline reproducible frente a detectores YOLO orientados en experimentos comparativos.
- Integración en productos comerciales: la licencia Apache-2.0 del commit inicial permite su uso en software propietario sin obligaciones copyleft, a diferencia de la versión AGPL-3.0 posterior del repositorio upstream, lo que facilita su incorporación en soluciones de análisis geoespacial de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 0,1 GB, lo que sugiere un checkpoint compacto, pero no se detalla el número de parámetros ni el consumo real.
- GPU recomendadas: no disponible. Al ser un modelo de visión de tamaño "l" con entrada de 800 px, es esperable que quepa en GPUs de consumo, pero no hay datos confirmados.
- Cabe en consumer GPU: no confirmado por falta de datos de parámetros y VRAM.
- Opciones de despliegue: librería LibreYOLO (`pip install libreyolo`) con la API `LibreYOLO("LibreRiODETRv2l-obb-diorr.pt")`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de visión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2l-obb-diorr | RiO-DETRv2 + HGNetv2-L, OBB | no disponible | imagen 800 px | Apache-2.0 | Hugging Face (LibreYOLO) |
| RiO-DETRv2 upstream (`diorr/riov2_hgnetv2_l_diorr.pth`) | RiO-DETRv2 + HGNetv2-L, OBB | no disponible | imagen 800 px | Apache-2.0 en el commit inicial; AGPL-3.0 en versiones posteriores | Hugging Face (RicePasteM) y GitHub |
| Detectores YOLO orientados (familia YOLO-OBB) | CNN, OBB | no disponible | variable | variable según implementación | múltiples |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en teledetección: su rendimiento fuera del dominio DIOR-R (imágenes naturales, interiores, escenas urbanas a pie de calle) no está validado y probablemente sea deficiente.
- Solo 20 clases: cualquier aplicación que requiera otras categorías necesita reentrenamiento o fine-tuning.
- Entrada fija de 800 px: objetos muy pequeños o muy grandes respecto a esa resolución pueden degradar la detección; no se documentan estrategias de multi-escala.
- Riesgo de alucinación: como todo detector, puede producir falsos positivos en regiones ambiguas o con oclusiones; no se han publicado métricas de precisión/recall en la información disponible.
- Sesgos: el conjunto DIOR-R tiene una distribución geográfica y de sensores concreta; el modelo puede estar sesgado hacia esas condiciones de captura e iluminación.
- Licencia: los pesos y el código del commit inicial son Apache-2.0, pero el repositorio upstream se relicenció a AGPL-3.0 sin cambios de código. Cualquier uso debe apoyarse en la concesión Apache-2.0 del commit `ab8b22d`, no en versiones posteriores.
- Datos de entrenamiento: DIOR-R tiene sus propios términos de uso, que no se detallan en la model card y deben verificarse antes de un uso comercial.
- Sin datos de benchmarks, latencia ni VRAM: la evaluación en producción requiere una validación propia antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2l-obb-diorr
- Pesos upstream: https://huggingface.co/RicePasteM/RiO-DETRv2
- Código upstream (commit Apache-2.0): https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada del código: https://github.com/LibreYOLO/RiO-DETRv2
- Repositorio de LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de LibreYOLO: https://www.libreyolo.com/docs
