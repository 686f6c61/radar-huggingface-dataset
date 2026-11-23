# Shro23/my-item-detector

## Resumen

My Item Detector es un detector de objetos basado en YOLO26n de Ultralytics, desarrollado por el usuario Shro23 como proyecto de fin de formación en el bootcamp CodingBN (sesiones 14 y 15). El modelo se ha afinado sobre un conjunto de aproximadamente 50 fotografías tomadas por el propio autor y etiquetadas manualmente en Roboflow, con tres clases personalizadas: `Humanoid`, `Mount` y `NonHumanoid`. Se publica en Hugging Face con el pipeline `object-detection` y la librería `ultralytics`.

El modelo no es un modelo de lenguaje: es un detector de objetos de la familia YOLO, por lo que su función es localizar y clasificar instancias visuales en imágenes, no generar texto. Su relevancia es limitada y de carácter demostrativo: sirve como ejemplo de flujo de trabajo de anotación y fine-tuning con Ultralytics, no como componente listo para producción. El repositorio ocupa 0.0 GB según la ficha de Hugging Face, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el tamaño es inferior a la precisión de medida de la plataforma.

La información disponible es muy escasa: no se publican resultados de benchmarks (la propia model card deja un marcador "add your mAP50 here"), no se detallan hiperparámetros de entrenamiento ni la resolución de entrada, y no se especifican idiomas (dato no aplicable a un detector). Cualquier evaluación rigurosa exige descargar los pesos y medir sobre un conjunto propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible (librería `ultralytics`; presumiblemente `.pt`, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura es YOLO26n, la variante "nano" de la familia YOLO26 de Ultralytics. Se trata de un detector de objetos de una sola etapa, típicamente con backbone convolucional, cuello de agregación de características y cabeza de detección, optimizado para bajo coste computacional. No se dispone de detalles adicionales sobre el número de capas, la resolución de entrada ni el número de parámetros en la información proporcionada.

El entrenamiento consistió en un fine-tuning del checkpoint YOLO26n preentrenado sobre aproximadamente 50 imágenes propias, capturadas con un único teléfono en una única habitación y anotadas en Roboflow con tres clases. No se documentan epochs, tamaño de lote, aumentos de datos, partición train/val ni técnicas de regularización. No hay evidencia de RLHF, DPO ni de ningún proceso de alineación, algo por otra parte ajeno a un detector. La innovación técnica destacable es nula más allá del uso del pipeline estándar de Ultralytics; el valor del artefacto es formativo.

## Capacidades

- Detección de objetos en imágenes con tres clases cerradas: `Humanoid`, `Mount` y `NonHumanoid`.
- Localización mediante cajas delimitadoras (bounding boxes) con puntuación de confianza por instancia.
- Inferencia sobre imágenes individuales a través de la librería `ultralytics` (API de Python) y, presumiblemente, exportación a otros formatos compatibles con Ultralytics (no confirmado).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión multimodal descriptiva, audio ni ninguna capacidad generativa.

## Casos de uso

- Docencia y demostración de fine-tuning: reproducir el flujo completo de anotación en Roboflow, entrenamiento con Ultralytics y evaluación, usando este modelo como referencia de un pipeline mínimo viable con 50 imágenes.
- Prototipado rápido de detección en entornos controlados: validar la viabilidad de detectar las tres clases en una escena concreta (una habitación, una iluminación) antes de invertir en un dataset mayor.
- Prueba de concepto de clasificación de entidades en imágenes de un dominio propio: útil para comprobar si la taxonomía `Humanoid`/`Mount`/`NonHumanoid` es separable antes de escalar la anotación.
- Generación de datos sintéticos o aumentados: emplear las detecciones como filtro preliminar para seleccionar imágenes candidatas a etiquetar en un dataset mayor.
- Integración en un cuaderno de experimentos o artículo técnico: servir como ejemplo reproducible de un detector de tres clases entrenado con Ultralytics y publicado en Hugging Face.
- Evaluación comparativa de infraestructura de inferencia: medir latencia y throughput de YOLO26n en distintas GPUs o en CPU con este checkpoint como carga de trabajo de referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un marcador de posición ("add your mAP50 here") en lugar del valor de mAP50, y no se aportan métricas de precisión, recall, mAP50-95 ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por la variante "nano" de YOLO, es previsible que quepa en GPUs de gama baja, pero el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño reducido del repo (0.0 GB) y la variante nano, es plausible, pero no verificable con los datos disponibles.
- Opciones de despliegue: librería `ultralytics` (Python); exportación a otros runtimes no confirmada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| My Item Detector (YOLO26n fine-tuned) | no disponible | no aplica | mAP50 no publicado | AGPL-3.0 | Hugging Face |
| YOLO26n (Ultralytics, checkpoint base) | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 / Enterprise | Ultralytics |
| YOLOv8n (Ultralytics) | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 / Enterprise | Ultralytics |
| YOLO11n (Ultralytics) | no disponible | no aplica | no disponible en esta ficha | AGPL-3.0 / Enterprise | Ultralytics |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada; la comparativa se limita a la licencia y la disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo (unas 50 imágenes) y de un único dominio: una habitación y un teléfono. La generalización a otros fondos, iluminaciones y objetos es previsiblemente muy pobre.
- Taxonomía cerrada de tres clases: cualquier objeto fuera de `Humanoid`, `Mount` o `NonHumanoid` se ignorará o se clasificará erróneamente.
- Sin métricas publicadas: no es posible conocer el mAP50 real ni el equilibrio precisión/recall del modelo.
- Sesgos desconocidos: no se documenta la composición demográfica ni la variedad de escenas del dataset, por lo que no se pueden evaluar sesgos de representación.
- Riesgo de falsos positivos y negativos alto por el reducido tamaño muestral; no apto para decisiones automatizadas sin validación humana.
- Licencia AGPL-3.0: el uso comercial requiere cumplir la AGPL o adquirir una licencia Enterprise de Ultralytics. La model card indica explícitamente que no es para uso comercial ni para sistemas de seguridad crítica.
- Repositorio de 0.0 GB: conviene verificar que los pesos están efectivamente disponibles antes de integrar el modelo en cualquier flujo.
- Sin garantías de mantenimiento: el autor no publica versionado, changelog ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/Shro23/my-item-detector
- Ultralytics (librería y documentación): https://docs.ultralytics.com/
- Roboflow (anotación): https://roboflow.com/
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
