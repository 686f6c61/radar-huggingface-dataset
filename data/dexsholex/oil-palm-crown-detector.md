# dexsholex/oil-palm-crown-detector

## Resumen

Oil palm crown detector es un modelo de deteccion de objetos basado en YOLOv8s, desarrollado por Oluwasola Oyinloye (dexsholex), especializado en la identificacion y conteo de coronas de palma aceitera en ortomosaicos RGB capturados por drones (UAV). El modelo resuelve un problema concreto de agricultura de precision: transformar imagenes aereas georreferenciadas en inventarios de palmas, generando una caja y un punto por cada corona detectada. Se distribuye con una unica clase (`oil_palm`) y una resolucion de entrada de 1280 x 1280 px.

El modelo ha sido validado en produccion sobre 718.751 palmas en 12.166,6 hectareas de una plantacion comercial en Africa Occidental, lo que le otorga una trazabilidad de uso real poco habitual en modelos de deteccion remota. Se ofrece en dos formatos: PyTorch (`.pt`) para inferencia y ajuste fino con Ultralytics, y ONNX (`.onnx`) para su integracion en QGIS mediante el plugin Deepness o cualquier runtime ONNX. Ademas, la version 1.2.0 incorpora un segundo checkpoint entrenado conjuntamente con datos de Africa Occidental y Peru.

La relevancia actual del modelo radica en su caracter practico: incluye parametros por defecto embebidos en el ONNX (2,13 cm/px, tiles de 1280 px, 20% de solapamiento, confianza 0,25, IoU 0,45) y un pipeline de codigo abierto que automatiza el teselado, la conversion a coordenadas de mapa, la eliminacion de duplicados y la exportacion a GeoPackage/CSV. Todo ello bajo licencia AGPL-3.0, heredada de Ultralytics YOLOv8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible (variante "s" de YOLOv8; el numero exacto no se indica en la informacion) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 1280 x 1280 px) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos PyTorch y ONNX en precision original) |
| Idiomas soportados | no aplica (modelo de vision, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch/Ultralytics) y `.onnx` (ONNX Runtime, QGIS Deepness) |

## Arquitectura y entrenamiento

La arquitectura es YOLOv8s, un detector de objetos de una etapa basado en CNN con cabeza de deteccion ancla-libre, una sola clase de salida (`oil_palm`) y entrada de 1280 x 1280 px. El checkpoint liberado (run 9) parte de pesos preentrenados en COCO y se ajusto de forma sucesiva: primero hasta el run 4 y despues desde este hasta el run 9. El entrenamiento empleo tamaño de imagen 1280, batch 6, optimizador AdamW con learning rate inicial 0,0002, hasta 150 epocas con paciencia de early stopping de 30; se detuvo en la epoca 92, con el mejor resultado en la 62.

Los datos de entrenamiento proceden de ortomosaicos RGB de UAV de una plantacion comercial de palma aceitera en Africa Occidental (imagenes y etiquetas propietarias, no liberadas). Se anotaron manualmente 435 tiles de 1280 x 1280 px con solapamiento de 256 px, sumando 4.041 cajas de corona. La particion 70/15/15 se realizo por sector espacial mediante un hash determinista, no por tiles aleatorios, de modo que validacion y test provienen de terreno no visto: 313 tiles/2.898 cajas en entrenamiento, 43/427 en validacion y 79/716 en test. La aumentacion incluyo rotacion de hasta ±180 grados, volteos horizontal y vertical, y mosaic; se desactivaron perspectiva y shear por no ser fisicamente plausibles en imagenes nadir. El ajuste se realizo en una unica GPU NVIDIA RTX 4070 Laptop de 8 GB.

La innovacion tecnica destacable no reside en la arquitectura, sino en el diseno del split espacial y en la calibracion del pipeline: el ONNX exportado se verifico contra el modelo PyTorch, con coordenadas de caja que coinciden en 0,001 px y puntuaciones identicas. La version 1.2.0 añade un modelo conjunto (`oil_palm_crown_joint.pt`) entrenado con datos de dos sitios (Africa Occidental y Peru) para mejorar la generalizacion en imagenes de primer plano de 800 x 600 px.

## Capacidades

- Deteccion de coronas de palma aceitera en ortomosaicos RGB nadir de UAV, con una caja delimitadora y una puntuacion de confianza por palma.
- Conteo e inventario de palmas a escala de plantacion: el pipeline asociado convierte detecciones a coordenadas de mapa y genera GeoPackage/CSV.
- Eliminacion de duplicados en zonas de solapamiento entre tiles dentro del pipeline.
- Inferencia en Python mediante Ultralytics (`model.predict`) o en ONNX Runtime.
- Integracion sin codigo en QGIS a traves del plugin Deepness, con parametros por defecto embebidos en el archivo ONNX.
- Pre-etiquetado de imagenes nuevas para que los anotadores corrijan cajas en lugar de dibujarlas desde cero.
- Punto de partida para ajuste fino en otras plantaciones (fine-tuning sobre el checkpoint liberado).
- Capacidades multilingues, tool calling, agentes, vision general, audio y modo thinking: no aplica; es un detector de objetos de dominio especifico.

## Casos de uso

- Inventario de plantaciones de palma aceitera: procesar ortomosaicos GeoTIFF completos con `scripts/process_block.py` para obtener una base de datos geoespacial de palmas por bloque, con una caja y un punto por corona. Es adecuado porque el modelo fue validado en produccion sobre 718.751 palmas en 12.166,6 ha.
- Monitorizacion de densidad de plantacion y deteccion de calvas: comparar el conteo detectado con el esperado por bloque para identificar zonas con palmas faltantes o replantadas, aprovechando que el entrenamiento cubrio canopia densa y palmas recien plantadas.
- Planificacion de labores agricolas: usar el inventario georreferenciado para asignar rutas de cosecha, fertilizacion o inspeccion por sectores del mapa, dado que las detecciones se exportan como features vectoriales con coordenadas de mapa.
- Pre-etiquetado para anotacion humana: ejecutar el modelo sobre imagenes nuevas de otra plantacion y entregar las cajas como borrador a los anotadores, reduciendo el coste de dibujar cada corona manualmente.
- Integracion en flujos QGIS de equipos sin perfil de programacion: cargar `oil_palm_crown.onnx` en el plugin Deepness, seleccionar el area y ejecutar, obteniendo cada palma como feature vectorial sin escribir codigo.
- Ajuste fino para nuevas plantaciones o especies: partir de `oil_palm_crown.pt` y reentrenar con imagenes y etiquetas propias cuando la resolucion, la edad de la plantacion o la region difieran de las condiciones de entrenamiento (~2 cm/px, Africa Occidental).
- Investigacion en teledeteccion agricola: usar el modelo como linea base reproducible en experimentos de conteo de arboles con UAV, dado que la particion espacial por sector y las metricas de test estan documentadas.

## Benchmarks y rendimiento

Evaluacion sobre el split de test reservado (79 tiles, 716 coronas etiquetadas, nunca usadas en entrenamiento ni en seleccion de checkpoint):

| Modelo | Precision | Recall | mAP@0.5 | mAP@0.5:0.95 |
|---|---|---|---|---|
| Este modelo (run 9) | 0,845 | 0,774 | 0,844 | 0,350 |
| Linea base anterior (run 4) | 0,727 | 0,637 | 0,698 | 0,279 |

Aproximadamente el 85% de las detecciones corresponden a palmas reales y el modelo encuentra unas 77 de cada 100 palmas etiquetadas. No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con otros modelos de deteccion de palma aceitera.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el entrenamiento se realizo en una RTX 4070 Laptop de 8 GB, lo que indica que la inferencia en precision original cabe holgadamente en GPUs consumer de 8 GB.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 8 GB para inferencia comoda; el entrenamiento documentado uso una RTX 4070 Laptop (8 GB). Para procesar ortomosaicos grandes en lote, se recomienda una GPU de mayor VRAM (A100, H100) para paralelizar tiles, aunque no se aportan cifras de throughput.
- Cabe en GPU consumer: si, segun la evidencia del entrenamiento en RTX 4070 Laptop de 8 GB.
- Opciones de despliegue: Ultralytics (PyTorch, `.pt`), ONNX Runtime (`.onnx`), QGIS con plugin Deepness, y el pipeline propio de Python (`scripts/process_block.py`).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables de deteccion de coronas de palma aceitera en la informacion proporcionada. Como referencia estructural, se compara con la linea base interna del mismo autor:

| Modelo | Arquitectura | Clase | Entrada | mAP@0.5 | Licencia |
|---|---|---|---|---|---|
| Oil palm crown detector (run 9) | YOLOv8s | 1 (`oil_palm`) | 1280 x 1280 | 0,844 | AGPL-3.0 |
| Linea base run 4 (mismo autor) | YOLOv8s | 1 (`oil_palm`) | 1280 x 1280 | 0,698 | AGPL-3.0 |
| Otros detectores de palma aceitera | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenado exclusivamente con imagenes nadir de UAV a ~2 cm/px; no es adecuado para imagenes de satelite, fotos oblicuas ni otras especies de arboles.
- Los datos de entrenamiento son propietarios y no se liberan, lo que limita la reproducibilidad exacta del ajuste.
- El modelo se entreno en una plantacion joven (altura mediana de copa 2,33 m en 1.226 coronas del primer lote), por lo que el rendimiento en plantaciones maduras o con dosel muy cerrado puede degradarse.
- Precision 0,845 y recall 0,774 en test: aproximadamente un 15% de detecciones son falsos positivos y un 23% de palmas no se detectan; los conteos deben verificarse contra un muestreo manual antes de usarse en decisiones operativas.
- La licencia AGPL-3.0 impone obligaciones de copyleft sobre el codigo derivado que se distribuya o se ofrezca como servicio en red; debe revisarse antes de un uso comercial propietario.
- No se documentan sesgos demograficos (no aplica), pero si un sesgo de dominio geografico y de condiciones de captura (resolucion, iluminacion, estacionalidad) no cubiertas en el conjunto de entrenamiento.
- El modelo conjunto v1.2.0 se entrena con dos sitios (Africa Occidental y Peru); su rendimiento especifico por sitio no se detalla en la informacion disponible.
- No se proporcionan datos de latencia, throughput ni consumo de VRAM en inferencia, lo que dificulta la planificacion de capacidad en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dexsholex/oil-palm-crown-detector
- Demo en el navegador (Oil Palm Counter): https://huggingface.co/spaces/dexsholex/oil-palm-counter
- Repositorio del pipeline: https://github.com/Dexsholex/oil-palm-crown-detection
- Perfil del autor en GitHub: https://github.com/Dexsholex
- ORCID del autor: https://orcid.org/0009-0003-4990-9944
