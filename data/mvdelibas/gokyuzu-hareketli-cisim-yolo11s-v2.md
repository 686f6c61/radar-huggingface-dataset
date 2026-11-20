# mvdelibas/gokyuzu-hareketli-cisim-yolo11s-v2

## Resumen

Gokyuzu-hareketli-cisim-yolo11s-v2 es un detector de objetos basado en la arquitectura YOLO11s de Ultralytics, ajustado para identificar objetos en movimiento y rayos cósmicos en imágenes astronómicas. Lo publica el usuario mvdelibas en Hugging Face y su propósito concreto es procesar recortes del Sloan Digital Sky Survey (SDSS) organizados como pilas de tres fotogramas consecutivos codificados en los canales R, G y B de una imagen RGB de 512 x 512 píxeles.

El modelo distingue dos clases: `hareketli_cisim` (objeto en movimiento, típicamente asteroides) y `kozmik_isin` (rayo cósmico de un solo fotograma). Se entrenó exclusivamente sobre el dataset sintético `mvdelibas/gokyuzu-hareketli-cisim-v2`, que combina recortes reales del SDSS DR17 en banda r con movimiento sintético inyectado. Esta decisión de diseño es clave para interpretar sus resultados: las métricas de validación son altas, pero proceden de la misma distribución sintética que el entrenamiento y no de catálogos reales de asteroides.

Es relevante ahora porque ejemplifica una tendencia práctica en astronomía computacional: usar detectores ligeros y desplegables (YOLO11s) para tareas de triaje sobre grandes volúmenes de imágenes, en lugar de pipelines especializados más pesados. No obstante, su validación pendiente contra datos reales limita por ahora su uso a prototipado y experimentación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 512 x 512, inferencia a 640 px) |
| Tipos de cuantización | no disponible (pesos distribuidos en formato PyTorch `.pt`) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | cc-by-4.0 (según model card); la arquitectura y el código de entrenamiento de Ultralytics son AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, cargable con Ultralytics); archivo `gokyuzu-hareketli-cisim-temiz.pt` |

## Arquitectura y entrenamiento

Se trata de un detector YOLO11s, la variante "small" de la familia YOLO11 de Ultralytics, adaptada a una tarea de detección binaria (dos clases). La entrada es una imagen RGB de 512 x 512 en la que los canales R, G y B corresponden a tres fotogramas consecutivos (t-1, t, t+1); el movimiento se codifica implícitamente como diferencias entre canales. El entrenamiento se realizó durante 40 épocas a 640 píxeles de resolución de entrada y con un tamaño de lote de 24.

El conjunto de entrenamiento es `mvdelibas/gokyuzu-hareketli-cisim-v2` (4.000 imágenes, divididas en 3.200 / 400 / 400 por campo de origen). Los fondos provienen de 160 campos del SDSS DR17 en banda r, sobre los que se añadió movimiento sintético. El autor advierte explícitamente de que los tres fotogramas se derivan de una única exposición real más ruido sintético, no de tres exposiciones independientes, y que la diversidad de fondos es limitada (160 campos). No se documenta uso de RLHF, DPO ni técnicas de alineación, al no ser aplicables a un detector.

## Capacidades

- Detección de objetos en movimiento (`hareketli_cisim`) en pilas de tres fotogramas codificadas como canales RGB.
- Detección de rayos cósmicos de un solo fotograma (`kozmik_isin`).
- Salida estándar de detección: cajas delimitadoras (`boxes.xyxy`) y puntuaciones de confianza (`boxes.conf`), con umbral configurable (ejemplo del autor: `conf=0.25`).
- Inferencia sobre imágenes individuales mediante la API de Ultralytics (`model.predict`).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un detector de visión puro.
- No tiene capacidades multilingües ni de generación de texto; las etiquetas de clase están en turco y la documentación en inglés.
- No dispone de modo "thinking", visión general, audio ni otras capacidades multimodales más allá de la entrada de imagen.

## Casos de uso

- Triaje de recortes astronómicos: procesar lotes de recortes del SDSS empaquetados como pilas de tres fotogramas para priorizar candidatos a objeto en movimiento antes de una inspección humana o un pipeline más costoso.
- Detección de rayos cósmicos en imágenes de campo amplio: usar la clase `kozmik_isin` para marcar y descartar artefactos de un solo fotograma antes del análisis fotométrico.
- Prototipado de pipelines de búsqueda de asteroides: servir como primer filtro rápido en un sistema de detección de objetos móviles sobre archivos de imágenes, con la advertencia de que requiere validación con datos reales.
- Pruebas de concepto en investigación: evaluar la viabilidad de detectores YOLO ligeros frente a métodos clásicos (por ejemplo, sustracción de fondo y umbralización) en tareas de astronomía.
- Generación de datos sintéticos y aumento de datasets: el modelo y su dataset asociado sirven como referencia para construir conjuntos sintéticos con movimiento controlado y medir el comportamiento del detector.
- Despliegue educativo o de demostración: integrar el modelo en notebooks o demos interactivas que ilustren detección de movimiento en imágenes astronómicas con Ultralytics.
- Filtrado previo en pipelines de observación: en un contexto controlado y tras validación, usar el detector para reducir el volumen de imágenes que llegan a etapas de análisis más lentas.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el split de validación (400 imágenes, una sola ejecución, mejor época 39):

| Métrica | Valor |
|---|---|
| mAP50 | 99,46 % |
| mAP50-95 | 70,0 % |
| Precisión | 99,1 % |
| Recall | 99,2 % |
| AP50 `hareketli_cisim` | 99,5 % |
| AP50 `kozmik_isin` | 99,4 % |

No se reporta resultado sobre split de test. El autor advierte de que la validación procede del mismo generador sintético que el entrenamiento, por lo que estas cifras no deben interpretarse como rendimiento sobre asteroides reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; por el tamaño de YOLO11s (variante "small"), es previsible que quepa en GPUs de consumo, pero no se aporta una cifra concreta.
- GPU recomendadas: no disponible; al ser un modelo ligero, cabría esperar buen rendimiento en RTX 4090, A100 o H100, pero no hay datos publicados.
- Compatibilidad con GPU de consumo: probable por la variante "small" de YOLO11, aunque no confirmada con cifras en la información disponible.
- Opciones de despliegue: la model card solo documenta el uso mediante la librería `ultralytics` con `hf_hub_download` y `YOLO(...).predict(...)`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparativas publicadas en la información proporcionada para confrontar este modelo con alternativas de la misma categoría. Como referencia estructural, podría compararse con otras variantes de la familia YOLO11 (n, m, l, x) o con detectores genéricos de objetos, pero no hay cifras disponibles para establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gokyuzu-hareketli-cisim-yolo11s-v2 | no disponible (variante s de YOLO11) | no aplica (imagen 512 x 512) | mAP50 99,46 % en validación sintética | cc-by-4.0 (pesos); AGPL-3.0 (Ultralytics) | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Validación sobre datos sintéticos: el split de validación procede del mismo generador que el entrenamiento; el rendimiento sobre asteroides reales puede diferir sustancialmente.
- Los tres fotogramas se derivan de una única exposición real más ruido sintético, no de tres exposiciones independientes, lo que reduce el realismo del movimiento.
- Diversidad de fondos limitada a 160 campos del SDSS DR17 en banda r; puede generalizar mal a otros sondeos, bandas o condiciones de observación.
- No validado contra catálogos reales de asteroides, según admite el propio autor.
- Riesgo de falsos positivos en escenarios reales no representados en el conjunto sintético (artefactos, saturación, ruido instrumental).
- Licencia dual a considerar: los pesos se publican como cc-by-4.0, pero la arquitectura y el código de entrenamiento de Ultralytics son AGPL-3.0; conviene revisar esa licencia para uso comercial o distribución.
- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; sin comunidad ni soporte documentado más allá de la model card.
- Sin resultados en split de test ni comparativas con líneas base, lo que dificulta evaluar su valor real frente a métodos clásicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/gokyuzu-hareketli-cisim-yolo11s-v2
- Dataset de entrenamiento: `mvdelibas/gokyuzu-hareketli-cisim-v2` (referenciado en la model card)
- Ultralytics (arquitectura y código): https://github.com/ultralytics/ultralytics
- Sloan Digital Sky Survey DR17 (origen de los fondos): https://www.sdss.org/dr17/
