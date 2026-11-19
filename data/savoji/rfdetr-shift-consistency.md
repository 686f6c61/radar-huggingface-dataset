# savoji/rfdetr-shift-consistency

## Resumen

`rfdetr-shift-consistency` es un repositorio de experimentos y checkpoints publicado por el usuario savoji en torno a un problema concreto del detector de objetos RF-DETR de Roboflow: la inestabilidad de las puntuaciones de confianza cuando un objeto se desplaza una fracción de la rejilla de parches del modelo. No es un modelo base nuevo, sino un conjunto de pesos RF-DETR-N afinados y de resultados reproducibles que documentan qué técnicas mitigan ese jitter y cuáles no.

El problema que aborda es relevante en producción: RF-DETR divide la imagen en parches de 16x16 píxeles (12x12 en las variantes de segmentación), de modo que un objeto que se desplaza menos de un parche puede cambiar su score lo suficiente como para cruzar el umbral de decisión. En inspección de defectos esto implica que el mismo defecto se conserva o se descarta según su posición exacta en la imagen, un comportamiento inaceptable para pipelines automatizados.

La contribución práctica es doble: por un lado, un análisis cuantificado del origen del problema y de la eficacia de distintas estrategias de entrenamiento; por otro, la validación de una solución en tiempo de inferencia (`shift_tta`, promediado de varias pasadas con la imagen desplazada), que reduce las inversiones de decisión unas seis veces con un coste de 4x en tiempo de inferencia y sin pérdida de precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (detector DETR con backbone y patch embedding tipo ViT); variante afinada RF-DETR-N |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada en resolución de imagen, no disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de detección de objetos, sin componente lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repo de 1.0 GB; la model card no detalla safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente es RF-DETR, un detector de la familia DETR que procesa la imagen como una rejilla de parches cuadrados de 16x16 píxeles (12x12 en los modelos de segmentación). El repositorio parte de pesos preentrenados en COCO y afina la variante RF-DETR-N sobre `deeppcb`, un dataset de defectos en placas de circuito impreso de RF100-VL con 1050 imágenes de entrenamiento, 300 de validación y 150 de test (995 defectos anotados). Los experimentos de entrenamiento se ejecutaron en GPU de Colab con 12 y 15 épocas según la configuración.

El trabajo compara varias estrategias: fine-tuning estándar, aumento de datos con copias desplazadas aleatoriamente, una pérdida adicional que exige la misma puntuación en ambas copias (en una y en dos direcciones, con pesos 0.5 y 2) y un suavizado del patch embedding inicial ("anti-aliased"). Los resultados muestran que ninguna modificación de entrenamiento se acerca al promediado en inferencia: el suavizado del primer layer es la única que reduce las inversiones (del 18,9% al 16,2% con 15 épocas), pero a costa de unos 0,035-0,05 puntos de mAP50-95. El análisis de features revela que la similitud entre una imagen y su copia desplazado medio parche es de 0,63 tras el primer layer, 0,93 tres bloques después y 0,97 al final; ese ~3% residual es el que produce el jitter de scores.

## Capacidades

- Detección de objetos con cajas delimitadoras y puntuaciones de confianza (pipeline `object-detection`).
- Inferencia con desplazamiento y promediado (`predict(..., shift_tta=N)`) para estabilizar scores: `shift_tta=2` y `shift_tta=4`.
- Evaluación de estabilidad posicional: medición de "flips" (defectos conservados en unas posiciones y descartados en otras) sobre desplazamientos de 0 a 16 píxeles.
- Emparejamiento de detecciones entre pasadas con criterio de máxima puntuación solapada (no máxima IoU), detalle crítico para no degradar el score promediado.
- Fine-tuning sobre datasets de inspección de defectos con anotaciones densas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un detector visual puro.

## Casos de uso

- Inspección de defectos en fabricación: el modelo detecta defectos en placas de circuito impreso y el promediado `shift_tta=4` reduce las inversiones del 21,0% al 3,7%, de modo que la decisión de aceptar o rechazar una pieza deja de depender de la posición exacta del defecto en la imagen.
- Control de calidad con umbral fijo: al reducir el "score swing" mediano de 0,057 a 0,018 y el del peor decil de 0,63 a 0,17, permite fijar un umbral de confianza estable sin recalibración por posición.
- Segmentación de imágenes grandes por teselado: elegir un stride de tesela que no sea múltiplo del tamaño de parche (por ejemplo 388 px en lugar de 384) proporciona el promediado de 2 pasadas gratis en las zonas de solape.
- Pipelines de inspección visual en CPU: con 55 ms por imagen en M1 para inferencia simple y 254 ms con `shift_tta=4`, es viable en estaciones de inspección sin GPU dedicada cuando el throughput requerido es moderado.
- Detección sobre datasets de dominio específico: los checkpoints afinados sobre `deeppcb` sirven como punto de partida para fine-tuning en otras tareas de inspección con anotaciones densas y objetos pequeños.
- Investigación de robustez en detectores DETR: el repositorio documenta metodología reproducible (medición de flips, similitud de features por capa, reglas de parada predefinidas) útil para estudiar equivarianza a traslaciones en otros detectores.

## Benchmarks y rendimiento

Resultados de estabilidad y precisión sobre el test de `deeppcb` (150 imágenes, 995 defectos), con el modelo estándar de 12 épocas y el código real de `predict(..., shift_tta=N)`:

| `predict(...)` | mAP50-95 | mAP50 | Mejor F1 (umbral) | Flips | Score swing mediana / peor 10% | Tiempo por imagen (CPU M1) |
|---|---|---|---|---|---|---|
| plain | 0,702 | 0,949 | 0,919 (0,55) | 21,0% | 0,057 / 0,63 | 55 ms |
| `shift_tta=2` | 0,699 | 0,966 | 0,938 (0,40) | 7,4% | 0,032 / 0,34 | 120 ms |
| `shift_tta=4` | 0,708 | 0,972 | 0,945 (0,40) | 3,7% | 0,018 / 0,17 | 254 ms |

Comparativa de estrategias de entrenamiento (12 épocas, salvo indicación):

| Entrenamiento | mAP50-95 | Flips | Flips con promediado de 4 pasadas |
|---|---|---|---|
| Fine-tuning estándar | 0,702 | 22,0% | 4,7% |
| + copias desplazadas aleatorias | 0,707 | 20,8% | 4,0% |
| + pérdida de misma puntuación, ambas direcciones | 0,686 | 23,0% (scores ~0,3) | 7,0% |
| + pérdida de misma puntuación, una dirección, peso 0,5 | 0,707 | 23,2% | 6,2% |
| + pérdida de misma puntuación, una dirección, peso 2 | 0,711 | 20,4% | 3,9% |
| Primer layer suavizado | 0,669 | 15,4% | 4,9% |
| Fine-tuning estándar (15 épocas) | 0,709 | 18,9% | 3,9% |
| Primer layer suavizado (15 épocas) | 0,674 | 16,2% | 5,0% |

Sobre el modelo COCO preentrenado en CPU: mAP50-95 entre 0,568 y 0,573 para cinco offsets distintos de la rejilla, lo que confirma que el problema es jitter por objeto y no pérdida de precisión media. Suavizar el primer layer sin reentrenar degrada el mAP de 0,58 a 0,37.

## Requisitos de hardware

- Inferencia en CPU viable: 55 ms por imagen (plain) y 254 ms con `shift_tta=4` en un Apple M1.
- GPU: los experimentos de fine-tuning se ejecutaron en GPU de Colab (aproximadamente 4,3 unidades de cómputo en total); no se especifica el modelo de GPU.
- No cabe esperar requisitos de VRAM elevados al tratarse de la variante RF-DETR-N (la más pequeña de la familia), aunque el repositorio no publica cifras de VRAM.
- Despliegue: el repositorio referencia el paquete `rf-detr` de Roboflow y el PR roboflow/rf-detr#1726 que añade `shift_tta` a `predict()`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector visual).
- Throughput: el promediado de 4 pasadas multiplica por 4 el coste de inferencia; el de 2 pasadas, por 2.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precisión en `deeppcb` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| savoji/rfdetr-shift-consistency (RF-DETR-N afinado) | no disponible | parches 16x16 | mAP50-95 0,702-0,708 | Apache 2.0 | Hugging Face |
| RF-DETR preentrenado COCO (roboflow/rf-detr) | no disponible | parches 16x16 | no evaluado en `deeppcb`; mAP50-95 COCO 0,568-0,573 según offset | no disponible en la información | GitHub / Roboflow |
| Alternativas de detección (YOLO, DINO-DETR) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos con otros detectores en la información proporcionada.

## Limitaciones y advertencias

- El repositorio es material experimental ligado a un issue concreto (roboflow/rf-detr#1599), no un modelo con soporte ni garantías de mantenimiento.
- Cero descargas y cero likes en Hugging Face en el momento de la consulta: no hay validación por parte de la comunidad.
- El promediado `shift_tta=4` no elimina por completo las inversiones (quedan en 3,7%) y multiplica por 4 el tiempo de inferencia.
- El suavizado del patch embedding reduce las inversiones pero cuesta precisión (aproximadamente 0,035-0,05 mAP50-95); el autor detuvo el entrenamiento en la época 15 al no cerrarse la brecha según su regla de parada predefinida.
- La pérdida de misma puntuación en ambas direcciones degrada todas las puntuaciones a ~0,3, lo que rompe la calibración del umbral.
- El emparejamiento de detecciones entre pasadas debe hacerse por máxima puntuación solapada, no por máxima IoU; el script `cpu/eval_tta_clean.py` mantiene el criterio antiguo, lo que puede infravalorar los resultados.
- Los resultados están medidos en un único dataset de dominio específico (`deeppcb`) y con la variante N; no hay evidencia de generalización a otros dominios ni a modelos mayores de la familia.
- Licencia Apache 2.0 permite uso comercial, pero el modelo hereda los sesgos y limitaciones de los datos de preentrenamiento COCO y de `deeppcb`, no documentados en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/savoji/rfdetr-shift-consistency
- Repositorio de código y resultados: https://github.com/SajjadPSavoji/rfdetr-shift-consistency
- Issue original: https://github.com/roboflow/rf-detr/issues/1599
- Pull request con la opción `shift_tta` en `predict()`: https://github.com/roboflow/rf-detr/pull/1726
- Dataset RF100-VL (`deeppcb`): https://github.com/roboflow/rf100-vl
