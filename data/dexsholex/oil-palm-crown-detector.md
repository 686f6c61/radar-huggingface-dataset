# dexsholex/oil-palm-crown-detector

## Resumen

Oil palm crown detector (YOLOv8s) es un detector de objetos especializado desarrollado por Oluwasola Oyinloye (GitHub @Dexsholex) para localizar coronas individuales de palma de aceite en ortomosaicos RGB de drones (UAV). El modelo convierte un ortomosaico georreferenciado en un inventario de palmas: un punto y una caja por cada palma detectada. Se ha utilizado en producción para contar 718.751 palmas en 12.166,6 ha de una plantación comercial en África Occidental, lo que lo convierte en una herramienta de referencia para inventarios forestales y agrícolas basados en teledetección.

Técnicamente es un detector YOLOv8s (variante small de Ultralytics) con una sola clase (`oil_palm`) y entrada de 1280 × 1280 píxeles. Se distribuye en dos formatos equivalentes: pesos PyTorch (`.pt`) para inferencia y fine-tuning con Ultralytics, y ONNX (`.onnx`) para su uso en QGIS mediante el plugin Deepness, ONNX Runtime u otras herramientas. La licencia es AGPL-3.0, heredada de Ultralytics YOLOv8. Su relevancia actual radica en que aborda un problema concreto y costoso (conteo de palmas en plantaciones) con un pipeline open source completo, resultados de validación publicados y una demo interactiva en Hugging Face Spaces.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (detector de objetos, una clase: `oil_palm`) |
| Parametros totales | no disponible (YOLOv8s tiene ~11 M de parametros segun la familia Ultralytics, pero no consta en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo pesos en precision original) |
| Idiomas soportados | no aplica (modelo de deteccion de objetos, sin componente textual) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`), ambos del mismo run de entrenamiento (run 9) |

## Arquitectura y entrenamiento

El modelo parte de un YOLOv8s preentrenado en COCO y se ha refinado a lo largo de sucesivas ejecuciones de entrenamiento. El checkpoint publicado (run 9) fue fine-tuned desde el run 4. Los hiperparametros del run 9 son: tamano de imagen 1280 px, batch 6, optimizador AdamW, learning rate inicial 0,0002, hasta 150 epocas con early stopping (paciencia 30); el entrenamiento se detuvo en la epoca 92 y el mejor checkpoint corresponde a la epoca 62. El entrenamiento se realizo en una sola NVIDIA RTX 4070 Laptop GPU de 8 GB, lo que lo hace reproducible con hardware modesto.

Los datos de entrenamiento proceden de ortomosaicos RGB de UAV de una plantacion comercial de palma de aceite en Africa Occidental (imagenes y etiquetas propietarias, no publicadas). Se anotaron 435 tiles de 1280 × 1280 px con solapamiento de 256 px, con una caja por corona visible, sumando 4.041 cajas. La particion train/validacion/test (70/15/15) se hizo por sector espacial determinista, no por tiles aleatorios, garantizando que validacion y test provienen de terreno no visto en entrenamiento. La plantacion es joven: la altura de dosel mediana es de 2,33 m (percentiles 5-95: 0,92-3,81 m). Como aumento de datos se uso rotacion de ±180°, volteos horizontal y vertical y mosaic; se desactivaron perspectiva y shear por no ser fisicamente plausibles en imagenes nadir.

## Capacidades

- Deteccion de coronas individuales de palma de aceite en tiles de ortomosaicos RGB nadir de UAV, con resolucion cercana a ~2 cm/px.
- Salida estructurada: en ONNX, tensor `1×5×33600` (centro x, y, ancho, alto, score) antes de supresion de no maximos; en PyTorch, cajas con scores via Ultralytics.
- Conteo de palmas: integrado con el pipeline open source asociado, genera inventarios georreferenciados en GeoPackage/CSV (un punto y una caja por palma).
- Uso directo en SIG: el ONNX incorpora parametros por defecto (2,13 cm/px, tiles de 1280 px, solapamiento 20%, confianza 0,25, IoU 0,45) y funciona en QGIS con el plugin Deepness sin escribir codigo.
- Punto de partida para fine-tuning sobre otras plantaciones o para preetiquetado que los anotadores corrigen en lugar de dibujar cajas desde cero.
- No soporta imagenes satelitales, fotos oblicuas, otras especies de arboles ni conteos sin verificacion muestral contra conteo manual (fuera del uso previsto).

## Casos de uso

- Inventario comercial de plantaciones: procesamiento de ortomosaicos completos de miles de hectareas para obtener recuentos por bloque, como el despliegue real de 718.751 palmas en 12.166,6 ha.
- Control de calidad post-plantacion: deteccion de palmas recien plantadas (el dataset de entrenamiento incluye palmas jovenes) para verificar tasas de supervivencia y detectar huecos de replantacion.
- Preetiquetado para anotacion asistida: los anotadores corrigen cajas existentes en lugar de dibujarlas, acelerando la creacion de datasets para nuevas plantaciones.
- Integracion en flujos SIG sin codigo: agronomos y tecnicos de SIG pueden ejecutar la deteccion directamente en QGIS con Deepness y obtener capas vectoriales de palmas sobre el ortomosaico.
- Monitoreo de densidad de dosel y maleza: el entrenamiento incluye escenas con maleza, caminos y suelo desnudo, por lo que discrimina palmas en condiciones de campo reales.
- Verificacion de pagos o subsidios agrarios: conteo auditable por bloques con resultados por bloque publicados en el repositorio del pipeline.
- Investigacion en teledeteccion agricola: base reproducible (pesos, pipeline, metricas) para experimentos de conteo de arboles con UAV.

## Benchmarks y rendimiento

Resultados en el split de test reservado (79 tiles, 716 coronas etiquetadas, nunca usado para entrenar ni para elegir checkpoint):

| Model | Precision | Recall | mAP@0.5 | mAP@0.5:0.95 |
|---|---|---|---|---|
| Este modelo (run 9) | 0,845 | 0,774 | 0,844 | 0,350 |
| Baseline anterior (run 4) | 0,727 | 0,637 | 0,698 | 0,279 |

Precision y recall se miden a la confianza que maximiza F1 (Ultralytics `val`), no a la confianza 0,25 usada en el pipeline. El mAP@0.5:0.95 bajo refleja principalmente el ajuste estricto de las cajas a los bordes de la corona, menos relevante para el conteo. Los datos de conteo contra conteo manual aparecen truncados en la informacion disponible, por lo que no se reproducen aqui.

## Requisitos de hardware

- Entrenamiento: se completo en una NVIDIA RTX 4070 Laptop GPU de 8 GB con batch 6 a 1280 px; cualquier GPU consumer moderna con 8 GB de VRAM es suficiente para fine-tuning similar.
- Inferencia: YOLOv8s es ligero; una GPU con 4-6 GB de VRAM (por ejemplo RTX 3060 o superior) procesa tiles de 1280 × 1280 px con holgura. Tambien es viable CPU via ONNX Runtime, con mayor latencia.
- Consumer GPUs: cabe comodamente en RTX 3060/4060/4070 y equivalentes; no requiere A100 ni H100.
- Despliegue: Ultralytics (Python), ONNX Runtime, QGIS con plugin Deepness (que instala ONNX Runtime automaticamente), y el pipeline propio del autor para ortomosaicos completos. No se menciona soporte para vLLM, TGI u Ollama (no aplicables a un detector de vision).
- Latencia y throughput exactos: no disponibles; el tamano del repo (~0,1 GB) y la arquitectura YOLOv8s sugieren inferencia rapida en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Aspecto | Oil palm crown detector (YOLOv8s) | YOLOv8n (base Ultralytics) | YOLOv8m (base Ultralytics) |
|---|---|---|---|
| Parametros | ~11 M (YOLOv8s) | ~3,2 M | ~25,9 M |
| Tarea | Deteccion especializada en coronas de palma (1 clase) | Deteccion generica (80 clases COCO) | Deteccion generica (80 clases COCO) |
| Entrada | 1280 × 1280 px | 640 × 640 px por defecto | 640 × 640 px por defecto |
| Entrenamiento especifico | 4.041 cajas anotadas en plantacion real de palma | Solo COCO | Solo COCO |
| Licencia | AGPL-3.0 | AGPL-3.0 | AGPL-3.0 |
| Metricas publicadas | Precision 0,845, Recall 0,774, mAP@0.5 0,844 en su dominio | no disponible para este dominio | no disponible para este dominio |

Frente a alternativas genericas, la ventaja de este modelo es el ajuste de dominio: un YOLOv8 base sin fine-tuning no detectaria coronas de palma en imagenes nadir de UAV. Modelos competidores especificos de conteo de palmas no se han identificado en la informacion disponible.

## Limitaciones y advertencias

- Dominio estrecho: entrenado solo con imagenes nadir RGB de UAV a ~2 cm/px de una plantacion en Africa Occidental con dosel joven (mediana 2,33 m). No es adecuado para imagenes satelitales, fotos oblicuas, otras especies ni plantaciones maduras con caracteristicas muy distintas.
- Sesgo geografico y de edad del cultivo: todos los datos proceden de una sola plantacion; el rendimiento en otras regiones, suelos o edades de palma puede degradarse y requiere fine-tuning.
- Recall del 77,4%: el modelo no encuentra aproximadamente 23 de cada 100 palmas etiquetadas; los conteos deben validarse muestreando contra conteos manuales antes de usarse en decisiones de negocio.
- La model card advierte explicitamente contra el uso de conteos sin verificacion muestral.
- Datos de entrenamiento propietarios: las imagenes y etiquetas no se publican, lo que limita la auditoria completa del dataset.
- Licencia AGPL-3.0: obliga a compartir el codigo fuente de obras derivadas si se ofrece el software como servicio; puede ser restrictivo para productos comerciales cerrados.
- Riesgo de duplicados en ortomosaicos: el solapamiento entre tiles requiere la fase de deduplicacion del pipeline; usar el modelo aislado sobre tiles sin gestion de solapamiento produce conteos incorrectos.
- Metricas de precision/recall medidas a la confianza que maximiza F1, no a la configuracion por defecto del pipeline (0,25), por lo que los numeros de produccion pueden diferir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dexsholex/oil-palm-crown-detector
- Pipeline completo y resultados por bloque: https://github.com/Dexsholex/oil-palm-crown-detection
- Demo en navegador (Oil Palm Counter, ejecucion local): https://huggingface.co/spaces/dexsholex/oil-palm-counter
- Perfil del autor en GitHub: https://github.com/Dexsholex
- ORCID del autor: https://orcid.org/0009-0003-4990-9944
