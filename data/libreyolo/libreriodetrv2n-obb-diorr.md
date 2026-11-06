# LibreYOLO/LibreRiODETRv2n-obb-diorr

## Resumen

LibreRiODETRv2n-obb-diorr es un detector de objetos orientados (oriented object detection, OBB) publicado por el colectivo LibreYOLO. Se trata de un port del modelo RiO-DETRv2-N, un transformer de deteccion de la familia DETR desarrollado originalmente por el autor RicePasteM, entrenado sobre el conjunto de datos DIOR-R (20 clases, imagenes de 800 px de entrada). El modelo se distribuye empaquetado para la libreria `libreyolo`, que actua como capa de inferencia compatible con el ecosistema de deteccion.

La relevancia de esta publicacion es doble. Por un lado, ofrece un detector DETR con cajas orientadas listo para usar sobre DIOR-R, un benchmark de teledeteccion con objetos rotados (aviones, barcos, vehiculos, puentes, etc.). Por otro, el port preserva deliberadamente la licencia Apache-2.0 de la release inicial del codigo original, ya que el repositorio upstream fue relicenciado a AGPL-3.0 posteriormente sin cambios en el codigo. Esto convierte a este checkpoint en una alternativa con licencia permisiva para uso comercial, algo poco habitual en detectores DETR de teledeteccion.

El modelo corresponde a la variante "n" (nano) de RiO-DETRv2, con backbone HGNetv2. La informacion disponible no detalla el numero exacto de parametros ni la longitud de contexto (no aplica en deteccion). El repositorio tiene un tamano de 0.0 GB en Hugging Face y registra 0 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RiO-DETRv2 (DETR con cajas orientadas), backbone HGNetv2, variante N |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de imagenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (vision; sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pt` (checkpoint para `libreyolo`) |
| Entrada | imagenes de 800 px |
| Clases | 20 (DIOR-R) |
| Dataset de entrenamiento | DIOR-R |
| Pipeline | object-detection |

## Arquitectura y entrenamiento

RiO-DETRv2 es un detector basado en la familia DETR (Detection Transformer), que combina un backbone convolucional con un encoder-decoder transformer y prediccion directa de conjuntos de cajas, eliminando la necesidad de anchors y de supresion no maxima (NMS) en el postprocesado. La variante empleada aqui, RiO-DETRv2-N, usa el backbone HGNetv2 en su configuracion nano y anade la cabeza de prediccion de cajas orientadas (OBB), que estima un angulo de rotacion ademas de las coordenadas del rectangulo. El entrenamiento se realizo sobre DIOR-R, un dataset de teledeteccion con 20 clases de objetos y anotaciones con orientacion.

El port a LibreYOLO no reentrena ni modifica los parametros aprendidos: aplica un remapeo de claves del state-dict, elimina el proyector de destilacion usado solo en entrenamiento y anade metadatos de LibreYOLO. Segun la model card, las salidas crudas coinciden exactamente con el modelo upstream (max_abs_diff 0). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF/DPO (no aplicables en deteccion). Tampoco se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Deteccion de objetos con cajas orientadas (oriented bounding boxes) en imagenes aereas y de satelite.
- Clasificacion y localizacion de 20 clases del dataset DIOR-R (aviones, barcos, vehiculos, puentes, estadios, etc.).
- Inferencia de imagen unica con API de una linea (`model("image.jpg", save=True)`).
- Salida compatible con el pipeline `object-detection` de Hugging Face.
- No soporta tool calling, function calling ni agentes.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision multimodal ni audio.

## Casos de uso

- Deteccion de aeronaves en imagenes satelitales: el modelo predice cajas orientadas que se ajustan a la orientacion real de los aviones en pista, algo que las cajas axis-aligned no capturan bien en escenas aereas.
- Monitorizacion de puertos y trafico maritimo: identificacion de barcos con orientacion variable para estimar rumbo y ocupacion de muelles en imagenes de alta resolucion.
- Inventario de infraestructura urbana: deteccion de puentes, estadios y grandes edificios en ortofotos para tareas de planificacion territorial.
- Analisis de imagenes de drones para agricultura o vigilancia: localizacion de vehiculos y maquinaria con orientacion arbitraria en tomas oblicuas.
- Preprocesado para pipelines GIS: extraccion de geometrias rotadas que se integran directamente en sistemas de informacion geografica sin postprocesado de NMS.
- Prototipado rapido en teledeteccion: al estar empaquetado para `libreyolo` y con licencia Apache-2.0, sirve como baseline para comparar detectores OBB en DIOR-R antes de invertir en entrenamiento propio.
- Integracion en aplicaciones de conteo y seguimiento: la salida OBB facilita el seguimiento de objetos rotados entre fotogramas en secuencias de video aereo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el numero de parametros; la variante "n" de RiO-DETRv2 sugiere un modelo ligero, pero no hay cifras confirmadas).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: probablemente si, dada la variante nano y la entrada de 800 px, pero no confirmado en la informacion proporcionada.
- Opciones de despliegue: `libreyolo` (libreria oficial, `pip install libreyolo`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un detector de imagenes).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Dataset | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LibreRiODETRv2n-obb-diorr | RiO-DETRv2-N, OBB | DIOR-R (20 clases) | 800 px | Apache-2.0 | Hugging Face (LibreYOLO) |
| LibreRTDETRv2n-obb | RT-DETRv2-N, OBB | DOTA | no disponible | Apache-2.0 | Hugging Face (LibreYOLO) |
| RiO-DETRv2 (upstream) | RiO-DETRv2, OBB | DIOR-R | 800 px | AGPL-3.0 (relicenciado) | GitHub / Hugging Face (RicePasteM) |

La comparativa se limita a los modelos mencionados en la informacion disponible. No se dispone de datos de rendimiento (mAP, FPS) para establecer una comparacion cuantitativa con alternativas como YOLOv8-OBB, YOLO11-OBB u otros detectores DETR orientados.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre DIOR-R (20 clases); no generaliza a clases fuera de ese dataset sin reentrenamiento.
- Posible sesgo hacia las condiciones de captura, sensores y regiones geograficas presentes en DIOR-R.
- Riesgo de falsos positivos y negativos en objetos pequenos u ocluidos, comun en detectores DETR nano.
- Sin informacion sobre calibracion de incertidumbre ni umbrales de confianza recomendados.
- La licencia Apache-2.0 se ampara en la release inicial del codigo upstream; el repositorio original fue relicenciado a AGPL-3.0 despues. Verificar la procedencia antes de redistribuir.
- Los datos de entrenamiento DIOR-R tienen sus propios terminos de uso, independientes de la licencia del modelo.
- No apto para tareas de texto, razonamiento, codigo o dialogo.
- Sin garantias de soporte ni mantenimiento por parte de LibreYOLO (proyecto desarrollado en tiempo libre segun su repositorio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LibreYOLO/LibreRiODETRv2n-obb-diorr
- Repositorio LibreYOLO: https://github.com/LibreYOLO/libreyolo
- Codigo original RiO-DETRv2: https://github.com/RicePasteM/RiO-DETRv2
- Copia preservada del codigo Apache-2.0: https://github.com/LibreYOLO/RiO-DETRv2
- Pesos upstream: https://huggingface.co/RicePasteM/RiO-DETRv2
- Modelo relacionado LibreRTDETRv2n-obb: https://huggingface.co/LibreYOLO/LibreRTDETRv2n-obb
