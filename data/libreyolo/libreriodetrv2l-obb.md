# LibreYOLO/LibreRiODETRv2l-obb

## Resumen

LibreRiODETRv2l-obb es un detector de objetos orientados (oriented object detection, OBB) derivado de RiO-DETRv2-L, el modelo de la familia RT-DETR desarrollado por el grupo de investigación de RicePasteM. Detecta objetos del dataset DOTA-v1.0 en 15 clases (aviones, barcos, vehículos, campos de tenis, etc.) trabajando sobre imágenes aéreas de 1024 píxeles de entrada, y devuelve cajas delimitadoras rotadas en lugar de rectangulares, lo que es imprescindible en teledetección donde los objetos aparecen con orientaciones arbitrarias.

El modelo lo publica LibreYOLO, un proyecto que empaqueta y redistribuye detectores de código abierto bajo licencias permisivas para su uso con la librería `libreyolo`. Esta versión concreta es una conversión de los pesos originales de RiO-DETRv2 (revisión `5f578f5`) sin cambios en los parámetros aprendidos: solo se ha rehecho el mapeo de claves del state-dict, se ha eliminado el proyector de destilación usado únicamente en entrenamiento y se han añadido metadatos de LibreYOLO. La verificación del autor indica `max_abs_diff 0` frente al modelo original.

La relevancia de esta ficha está en la licencia: el repositorio original de RiO-DETRv2 se relicenció a AGPL-3.0 después de su primera release, y este port se apoya explícitamente en la concesión Apache-2.0 de ese primer commit (`ab8b22d`). Para equipos que necesiten un detector OBB con licencia permisiva y no puedan asumir AGPL, es una de las pocas opciones verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2 (transformer detector DETR-like con atención deformable y backbone HGNetv2-L) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, entrada de imagen 1024 px) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt`) |
| Idiomas soportados | no disponible (modelo de visión, sin componente de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (PyTorch state-dict convertido para LibreYOLO) |

## Arquitectura y entrenamiento

RiO-DETRv2 es un detector de la familia DETR (Detection Transformer) que combina un backbone convolucional HGNetv2-L con un encoder-decodificador transformer y consultas de objeto aprendidas. La variante "obb" (oriented bounding box) añade una cabeza que predice el ángulo de rotación de cada caja, de modo que la salida es un conjunto de cajas rotadas con clase y puntuación. El modelo trabaja a resolución fija de 1024 píxeles, un tamaño habitual en teledetección para preservar la visibilidad de objetos pequeños.

El entrenamiento se realizó sobre DOTA-v1.0 con 15 clases, según indica la model card. No se detalla en la información disponible el número de tokens de imagen, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (poco habituales en detección). La innovación técnica destacable de esta publicación no está en el modelo en sí, sino en el proceso de conversión: remapeo de claves del state-dict, eliminación del proyector de destilación (solo usado en entrenamiento) y preservación exacta de los pesos aprendidos, con verificación de igualdad numérica frente al modelo upstream.

## Capacidades

- Detección de objetos orientados (cajas rotadas) en imágenes aéreas y de satélite.
- Clasificación en 15 clases de DOTA-v1.0 (avión, barco, almacén, campo de tenis, piscina, vehículo pequeño, vehículo grande, grúa, puente, puerto, campo de fútbol, campo de baloncesto, pista de atletismo, molino, helicóptero).
- Inferencia a 1024 px de entrada, con pipeline de detección estándar.
- Salida compatible con la API de `libreyolo` (`model("imagen.jpg", save=True)`), lo que permite integrarlo en flujos de post-procesado y visualización existentes.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No se documentan modos especiales (thinking, visión en lenguaje natural, audio) en la información disponible.

## Casos de uso

- Análisis de imágenes satelitales para inventario de infraestructuras: el modelo detecta puertos, puentes y grandes vehículos con cajas orientadas, lo que evita las imprecisiones de las cajas axis-aligned en objetos alargados o inclinados.
- Monitorización de tráfico aéreo y marítimo: las clases avión y barco permiten contar y localizar aeronaves y embarcaciones en ortofotos de alta resolución, con la orientación de cada objeto como dato adicional para seguimiento.
- Planificación urbanística y catastral: detección de almacenes, molinos y piscinas en ortofotos municipales para actualizar bases de datos geoespaciales.
- Gestión de instalaciones deportivas: identificación de campos de tenis, fútbol, baloncesto y pistas de atletismo en imágenes aéreas para inventarios y planificación de mantenimiento.
- Automatización de pipelines de teledetección: al integrarse con `libreyolo` y exponer una API de inferencia simple, puede encadenarse tras etapas de teselado y georreferenciación de imágenes grandes.
- Investigación en detección orientada: sirve como referencia Apache-2.0 para comparar arquitecturas DETR frente a detectores YOLO-OBB en benchmarks de DOTA sin las restricciones de licencia del upstream.
- Prototipado rápido en entornos con requisitos de licencia permisiva: equipos que no pueden adoptar AGPL pueden usar este port como base para experimentos o productos derivados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 0,1 GB, lo que sugiere que los pesos en sí ocupan ese orden de magnitud, pero no se especifica la huella en memoria durante la inferencia.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el backbone HGNetv2-L y la resolución de 1024 px sugieren requisitos moderados-altos, pero no hay datos publicados.
- Opciones de despliegue: la vía documentada es `libreyolo` (`pip install libreyolo`). No se mencionan exportaciones a ONNX, TensorRT, vLLM, llama.cpp ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2l-obb | no disponible | 1024 px | no disponible | Apache-2.0 | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (upstream) | no disponible | 1024 px | no disponible | AGPL-3.0 (tras la release inicial) | GitHub y Hugging Face (RicePasteM) |
| Detectores YOLO-OBB | no disponible | variable | no disponible | depende de la familia | múltiples repositorios |

No se dispone de datos de rendimiento comparativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en DOTA-v1.0; su rendimiento fuera de dominio (imágenes no aéreas, otras resoluciones, otras clases) no está garantizado y no se documenta.
- No se han publicado métricas de precisión (mAP) en la información disponible, por lo que no es posible evaluar su calidad objetiva frente a alternativas.
- Riesgo de sesgo geográfico y de dominio: DOTA-v1.0 está compuesto por imágenes aéreas de regiones concretas; la distribución de clases y estilos visuales puede no representar otros entornos.
- La licencia Apache-2.0 de este port se apoya en la concesión del commit inicial `ab8b22d` del repositorio original. Aunque el autor documenta la base legal, conviene revisar el NOTICE y el estado del upstream antes de un uso comercial a gran escala.
- Los datos de entrenamiento DOTA-v1.0 tienen sus propios términos de uso, independientes de la licencia del modelo.
- No hay información sobre cuantizaciones, exportaciones a formatos de inferencia optimizados ni latencias, lo que dificulta planificar un despliegue en producción.
- El modelo no procesa texto ni mantiene conversaciones; cualquier expectativa de uso como modelo de lenguaje es incorrecta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2l-obb
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Documentación de modelos LibreYOLO: https://www.libreyolo.com/docs/models
- Código original RiO-DETRv2: https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada del código Apache-2.0: https://github.com/LibreYOLO/RiO-DETRv2
- Pesos originales RiO-DETRv2: https://huggingface.co/RicePasteM/RiO-DETRv2
