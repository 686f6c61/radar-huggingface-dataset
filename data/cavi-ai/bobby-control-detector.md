# cavi-ai/bobby-control-detector

## Resumen

bobby-control-detector es un modelo de detección de objetos especializado en localizar controles interactivos en capturas de pantalla de páginas web. Es un fine-tune de PekingU/rtdetr_v2_r18vd, la implementación RT-DETRv2 con backbone ResNet-18, adaptado por Sasan Sotoodehfar (CAVI AI) para el runtime de automatización bobby-browser. El modelo resuelve un problema concreto: dado el screenshot de una página, devuelve las cajas de todos los elementos con los que un usuario puede interactuar (botones, enlaces, campos de texto, buscadores, selects, checkboxes, radios, switches y pestañas), agrupados bajo una única clase `interactable`.

La relevancia práctica está en el parseo visual de interfaces para agentes de automatización web: en lugar de depender exclusivamente del DOM (que puede estar ofuscado, virtualizado o inaccesible en iframes y canvas), el modelo opera directamente sobre píxeles. Con 20,1 millones de parámetros y un checkpoint de 80,5 MB en float32, es lo bastante ligero para ejecutarse en CPU o en GPU de consumo, y su exportación ONNX (opset 17) permite integrarlo en motores de inferencia sin PyTorch.

El modelo no nombra ni clasifica el rol de los controles: solo detecta su posición. Está entrenado únicamente con páginas sintéticas etiquetadas desde el DOM, sin capturas de sitios reales ni datos personales, lo que acota su dominio de aplicación y explica la brecha de rendimiento entre el conjunto sintético de validación y las páginas de prueba construidas a mano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (transformer detector end-to-end) con backbone ResNet-18 |
| Parametros totales | 20.108.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints publicados en float32) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers, float32) y ONNX (opset 17, float32) |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector end-to-end que sustituye el esquema clásico de anchors y NMS por un decodificador transformer que predice directamente un conjunto fijo de cajas. En esta variante el backbone es ResNet-18, lo que da un modelo compacto de 20,1 M de parámetros. La entrada es la captura RGB redimensionada por interpolación bilineal a 1024×544 (anchura × altura) y escalada a 0–1 sin normalización de media ni desviación. La salida son 300 consultas con `logits` de forma `[1, 300, 1]` y `pred_boxes` de forma `[1, 300, 4]` en formato centro x, centro y, ancho, altura normalizados; la puntuación de cada caja es la sigmoide del logit y no requiere NMS.

El entrenamiento se hizo en dos rondas sobre páginas sintéticas generadas con `generate_pages.py`: barras de navegación, formularios, tarjetas, tablas, barras de herramientas, pestañas, listas de resultados, filtros, banners, prosa y paginadores, con temas claros y oscuros aleatorios, tipografías, tamaños, radios de esquina y espaciados variables. Se dejaron sin etiquetar elementos que parecen controles pero no lo son (badges de estado, cabeceras de tabla, texto plano) para que el modelo aprenda a descartarlos. Cada página se renderizó en Chromium headless a 1900×980 con DPR 1 y las cajas se leyeron del DOM, resultando en 52.718 controles (22.884 enlaces, 19.008 botones, 3.441 pestañas, 2.332 checkboxes, 2.269 campos de texto, 1.089 radios, 858 buscadores, 498 selects y 339 switches); se descartaron cajas con lado inferior a 4 píxeles. La ronda 1 usó 1.500 páginas (1.350 de entrenamiento, 150 de validación) con learning rate 1e-4 (1e-5 en el backbone), one-cycle planificado a 30 épocas y detenido a las 9. La ronda 2 usó 3.000 páginas (2.700/300), continuó desde el mejor checkpoint de la ronda 1 con learning rate 5e-5 (5e-6 en el backbone) y one-cycle de 10 épocas; el checkpoint publicado es la época 7, la mejor por F1 de validación. En ambas rondas: AdamW, clipping de gradiente a 0,1, batch de 4, entrada 1024×544. El entrenamiento completo llevó unos 50 minutos en una GPU Apple M5 Max con PyTorch MPS.

## Capacidades

- Detección de controles interactivos en capturas de pantalla web: botones, enlaces, campos de texto, buscadores, selects, checkboxes, radios, switches y pestañas, todos bajo una única clase `interactable` (id 0).
- Localización precisa de cajas en píxeles de la captura original, con puntuaciones de confianza por caja y umbral recomendado de 0,6.
- Discriminación de elementos que parecen controles pero no lo son (badges, cabeceras de tabla, texto plano), gracias al etiquetado selectivo del conjunto de entrenamiento.
- Detección end-to-end sin NMS: las 300 consultas se filtran directamente por umbral de score.
- Ejecución en dos runtimes: transformers (`RTDetrV2ForObjectDetection`) y ONNX Runtime (opset 17), lo que permite despliegue sin PyTorch.
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un detector visual.
- No tiene capacidades multilingües ni procesa lenguaje; el emparejamiento con texto requiere OCR o DOM externos.
- No dispone de modo thinking, visión general, audio ni otras modalidades más allá de la imagen de entrada.

## Casos de uso

- Automatización web con agentes: el runtime bobby-browser usa las cajas detectadas para localizar el botón o campo sobre el que debe actuar un agente; el modelo aporta la posición y el agente resuelve la intención con el DOM o con OCR.
- Parseo visual de interfaces ofuscadas: en páginas con DOM virtualizado, componentes en canvas o iframes inaccesibles, el detector opera sobre píxeles y evita depender de selectores frágiles.
- Localización de formularios para rellenado automático: detecta campos de texto, buscadores, selects y checkboxes, que un pipeline posterior puede emparejar con etiquetas obtenidas por OCR para completar el formulario.
- Extracción de elementos de navegación para crawling guiado: identifica enlaces y pestañas en la barra de navegación y en paginadores, lo que permite construir un grafo de navegación a partir de screenshots.
- Testing visual de regresiones de UI: comparar las cajas detectadas entre versiones de una página para verificar que los controles siguen presentes y en la misma posición aproximada.
- Preprocesado para modelos de comprensión de pantalla: el detector reduce la imagen a regiones candidatas, lo que abarata el coste de un modelo multimodal posterior que solo necesita inspeccionar las zonas interactivas.
- Indexación de documentación y manuales con capturas: detectar controles en imágenes de manuales para generar anotaciones o resaltados automáticos sobre los elementos mencionados en el texto.

## Benchmarks y rendimiento

Resultados medidos por el autor en Apple M5 Max, con umbral de score 0,6 e IoU 0,5 para considerar una detección correcta (emparejamiento uno a uno):

| Conjunto | Paginas | Precision | Recall | F1 |
|---|---|---|---|---|
| Paginas sinteticas reservadas | 300 | 0,986 | 0,975 | 0,980 |
| Paginas de prueba construidas a mano de bobby-browser | 13 | 0,674 | 0,864 (95/110) | 0,757 |

Las 300 páginas sintéticas reservadas no estuvieron en el entrenamiento de ninguna de las dos rondas. De las 46 cajas extra en las páginas construidas a mano, 15 corresponden a una página de verificación con rejilla de imágenes cuya verdad de referencia no lista controles, y 6 a controles detrás de un diálogo modal abierto que la verdad de referencia omite. El generador de páginas se amplió después de la ronda 1 porque esta fallaba en las páginas manuales (listas de resultados, checkboxes sin etiqueta, buscadores de cabecera, cabeceras de tabla).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint float32 ocupa 80,5 MB (transformers) y 80,7 MB (ONNX); con activaciones para una entrada 1024×544 el consumo es de unos cientos de MB, por lo que cabe en cualquier GPU de consumo y en CPU.
- GPU recomendadas: cualquier GPU moderna sirve; el autor entrenó y evaluó en una Apple M5 Max con PyTorch MPS. Para producción en servidor, una T4 o L4 es más que suficiente; A100 o H100 solo tienen sentido para lotes grandes.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1–2 GB de VRAM libre, e incluso en CPU con ONNX Runtime.
- Opciones de despliegue: transformers (`pipeline("object-detection")`), ONNX Runtime, tract y otros motores ONNX; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector visual.
- Latencia y throughput: no se han publicado mediciones de latencia o throughput por imagen en la información disponible. El entrenamiento completo de dos rondas llevó unos 50 minutos en M5 Max, lo que da una idea del coste de cómputo, pero no del rendimiento en inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bobby-control-detector | 20,1 M | 1024×544 | Deteccion de controles web (1 clase) | apache-2.0 | HuggingFace, safetensors y ONNX |
| PekingU/rtdetr_v2_r18vd (modelo base) | no disponible | no disponible | Deteccion de objetos general (COCO) | no disponible | HuggingFace |
| Otros detectores de UI especializados | no disponible | no disponible | Deteccion de elementos de interfaz | no disponible | no disponible |

El modelo base RT-DETRv2 con ResNet-18 es un detector general de objetos entrenado sobre COCO; bobby-control-detector lo reemplaza por una cabeza de una sola clase entrenada sobre páginas web sintéticas. No se dispone de datos de benchmarks de alternativas especializadas en parseo de UI en la información proporcionada, por lo que la comparativa cuantitativa con otros modelos de la misma categoría queda como no disponible.

## Limitaciones y advertencias

- El modelo solo detecta la posición de los controles: no los nombra ni indica su rol. Para saber si una caja es un botón, un buscador o un checkbox hay que combinar la salida con OCR o con el DOM de la página.
- El entrenamiento se hizo exclusivamente con páginas sintéticas generadas por el propio autor; no incluye capturas de sitios reales. La caída de F1 de 0,980 en sintético a 0,757 en páginas manuales indica un riesgo claro de brecha de dominio en producción.
- El generador de páginas se amplió después de la ronda 1 al detectarse fallos en listas de resultados, checkboxes sin etiqueta, buscadores de cabecera y cabeceras de tabla; pueden persistir patrones de UI no cubiertos.
- Los controles detrás de diálogos modales abiertos y las rejillas de imágenes sin controles listados generan cajas extra; hay que prever filtrado o postprocesado en esos escenarios.
- El umbral de score de 0,6 es el valor con el que se midieron los resultados; cambiarlo altera el equilibrio precisión/recall y conviene recalibrarlo por dominio.
- La entrada se estira a 1024×544 sin mantener la relación de aspecto; capturas con proporciones muy distintas a las de entrenamiento (1900×980) pueden degradar la detección.
- No procesa texto ni lenguaje, por lo que no hay sesgos lingüísticos que evaluar, pero tampoco capacidades multilingües.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución y aviso de cambios; el autor declara no estar afiliado ni respaldado por los autores de RT-DETR.
- No se documentan sesgos demográficos ni de contenido porque el conjunto de entrenamiento no contiene datos personales ni capturas reales; el riesgo de sesgo se traslada a los patrones de diseño de UI sintéticos, que pueden no reflejar la diversidad de interfaces reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cavi-ai/bobby-control-detector
- Modelo base: https://huggingface.co/PekingU/rtdetr_v2_r18vd
- Repositorio bobby-browser: https://github.com/cavi-ai/bobby-browser
- Script de generación de páginas: https://github.com/cavi-ai/bobby-browser/blob/main/scripts/perception/generate_pages.py
- Script de entrenamiento: https://github.com/cavi-ai/bobby-browser/blob/main/scripts/perception/train_detector.py
- Script de evaluación y exportación ONNX: https://github.com/cavi-ai/bobby-browser/blob/main/scripts/perception/eval_detector.py
- Paper RT-DETRv2 (arXiv:2407.17140): https://arxiv.org/abs/2407.17140
- Sitio del autor: https://cavi-ai.xyz
