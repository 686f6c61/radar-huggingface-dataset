# mvdelibas/mars-landslide-seg-yolo11s

## Resumen

Mars-landslide-seg-yolo11s es un modelo de segmentación de instancias basado en Ultralytics YOLO11s-seg, ajustado por el usuario mvdelibas para detectar y segmentar depósitos de deslizamientos (movimientos en masa) en el sistema de cañones de Valles Marineris, en Marte. Forma parte de la tarea mb-mmls del benchmark Mars-Bench y resuelve el problema de identificar y delimitar automáticamente máscaras de deslizamientos en parches de imagen orbital, una tarea que tradicionalmente requiere interpretación manual por parte de geólogos planetarios.

El modelo es una red neuronal convolucional de la familia YOLO11 en su variante small para segmentación (yolo11s-seg), con aproximadamente 10 millones de parámetros (cifra típica de la variante s, no confirmada explícitamente en la información disponible). Se ha entrenado sobre parches de 320 px procedentes de imágenes del instrumento CTX de la sonda MRO, con 120 épocas de entrenamiento y un conjunto de validación de 31 imágenes. La relevancia actual radica en que ofrece un punto de partida reproducible y ligero para tareas de teledetección planetaria, aunque con precisión moderada y alcance limitado al sensor y la región de entrenamiento.

La model card es explícita sobre el carácter exploratorio del modelo: los resultados deben tratarse como candidatos a revisión, no como mapas definitivos. La licencia AGPL-3.0 (heredada de Ultralytics) y la licencia CC BY 4.0 de los datos de entrenamiento condicionan su uso y redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ultralytics YOLO11s-seg (CNN, segmentación de instancias) |
| Parametros totales | no disponible (variante s de YOLO11-seg) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible (pesos en formato PyTorch .pt) |
| Idiomas soportados | en, tr (etiquetas de clase en turco) |
| Licencia | AGPL-3.0 (pesos); datos de entrenamiento CC BY 4.0 |
| Formato de pesos | PyTorch (.pt), archivo `mars-heyelan-seg-yolo11s-seg-v2.pt` |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura YOLO11s-seg de Ultralytics, una red convolucional de una sola etapa que predice simultáneamente cajas delimitadoras y máscaras de instancia. Se ha inicializado desde los pesos preentrenados oficiales de YOLO11s-seg y se ha ajustado (fine-tuning) sobre el conjunto Mars-Bench mb-mmls. El entrenamiento se realizó a 320 px de resolución, con 120 épocas (mejor resultado en la época 99), tasa de aprendizaje inicial lr0 = 0.001 y un 90 % de recorte (CR, probablemente copy-paste o mosaic augmentation según la nomenclatura de Ultralytics).

Los datos de entrenamiento provienen del conjunto Mars-Bench mb-mmls (Zenodo 17402803, CC BY 4.0), compuesto por menos de 1.000 imágenes. Los parches originales son de 7 canales (imagen más capas derivadas), pero el modelo utiliza únicamente los 3 primeros canales RGB, lo que puede producir tonalidades atípicas (azuladas). Tras eliminar 6 imágenes duplicadas entre train y test, el conjunto de entrenamiento quedó en 269 imágenes y el de test sin fuga de datos. No se aplicaron aumentos por duplicación o rotación para incrementar el volumen de datos. No se documenta uso de RLHF/DPO (no aplica a un modelo de visión) ni innovaciones técnicas adicionales más allá del fine-tuning estándar de YOLO.

## Capacidades

- Segmentación de instancias: genera simultáneamente cajas delimitadoras y máscaras para cada deslizamiento detectado.
- Detección de una única clase: `heyelan` (deslizamiento en turco).
- Procesamiento de imágenes RGB de parches orbitales CTX/MRO a 320 px.
- Inferencia rápida y ligera, adecuada para barrido de grandes volúmenes de parches.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües de texto ni de visión general; su ámbito es exclusivamente la teledetección planetaria de deslizamientos.
- No incluye modo thinking, audio ni otras modalidades.

## Casos de uso

- Precribado de imágenes CTX: el modelo puede procesar grandes lotes de parches de Valles Marineris para generar candidatos de deslizamiento que los geólogos revisan manualmente, reduciendo el tiempo de interpretación visual.
- Análisis de estabilidad de laderas: los mapas de máscara permiten cuantificar la extensión de depósitos de movimiento en masa y apoyar estudios sobre la evolución del cañón.
- Benchmarking de métodos de segmentación planetaria: al estar integrado en Mars-Bench mb-mmls, sirve como línea base reproducible para comparar nuevas arquitecturas.
- Etiquetado asistido: las máscaras generadas pueden servir como preanotaciones para acelerar la creación de nuevos conjuntos de datos anotados por expertos.
- Docencia y divulgación: modelo ligero y de código abierto útil para demostrar pipelines de segmentación en teledetección planetaria con Ultralytics.
- Prototipado rápido en investigación: su tamaño reducido permite ejecutarlo en hardware modesto para experimentos exploratorios antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados reportados en el split de validación (31 imágenes):

| Metrica | Valor |
|---|---|
| Box mAP50 | 52.9 % |
| Box mAP50-95 | 38.7 % |
| Mask mAP50 | 56.7 % |
| Mask mAP50-95 | 29.5 % |
| Precision (caja) | 76.1 % |
| Recall (caja) | 45.6 % |
| Precision (máscara) | 81.4 % |
| Recall (máscara) | 48.6 % |
| AP50 clase `heyelan` | 52.7 % |

No se han publicado resultados en el split de test en la información disponible. El autor advierte que el rendimiento en otros sensores, regiones o estilos de imagen será inferior.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 2 GB en FP32 para la variante s a 320 px (estimación basada en el tamaño típico de YOLO11s-seg; no confirmada en la información disponible).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; también A100/H100 para despliegues a gran escala.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Ultralytics (Python), exportación a ONNX, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mars-landslide-seg-yolo11s | YOLO11s-seg | no disponible (variante s) | 320 px | AGPL-3.0 | Hugging Face |
| YOLO11s-seg (Ultralytics, preentrenado COCO) | YOLO11s-seg | no disponible | 640 px típico | AGPL-3.0 | Ultralytics / Hugging Face |
| Otros modelos de Mars-Bench mb-mmls | no disponible | no disponible | no disponible | variable | Zenodo / benchmark |

No se dispone de datos comparativos de rendimiento con alternativas específicas de segmentación de deslizamientos marcianos en la información proporcionada.

## Limitaciones y advertencias

- Precisión moderada: recall de caja del 45.6 % y de máscara del 48.6 %, lo que implica que se pierden más de la mitad de los deslizamientos reales; los resultados deben revisarse manualmente.
- Conjunto de datos pequeño (menos de 1.000 imágenes, 269 de entrenamiento): insuficiente para un modelo de propósito general.
- Entrenado solo con parches CTX/MRO de 7 canales reducidos a RGB; no es fiable con otras cámaras, resoluciones o sensores.
- Colores potencialmente irreales (tonos azulados) por el uso exclusivo de los 3 primeros canales.
- Etiquetas de clase en turco (`heyelan`), lo que puede complicar la integración en pipelines en otros idiomas.
- Uso previsto exclusivamente de investigación; no debe emplearse como único criterio para cartografía científica o toma de decisiones de misión.
- Licencia AGPL-3.0: cualquier uso en red o redistribución derivada obliga a liberar el código bajo la misma licencia; revisar implicaciones para uso comercial.
- Obligación de atribuir los datos de entrenamiento (CC BY 4.0) según la cita indicada por el autor.
- Riesgo de falsos positivos y de generalización deficiente fuera de Valles Marineris.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mvdelibas/mars-landslide-seg-yolo11s
- Dataset Mars-Bench mb-mmls (Zenodo): https://doi.org/10.5281/zenodo.17402803
- Ultralytics YOLO11: https://docs.ultralytics.com/models/yolo11/
- Repositorio Ultralytics: https://github.com/ultralytics/ultralytics
- Cita: Purohit, M.; Gajera, B.; Malaviya, V.; Mehta, I.; Kasodekar, K.; Adler, J.; Lu, S.; Rebbapragada, U.; Kerner, H. Mars-Bench: mb-mmls (Mars Mass-movement / Landslide Segmentation). Zenodo, 2025.
