# dacntt-kltn/Resnet18-HAM10000-v3

## Resumen

Resnet18-HAM10000-v3 es un clasificador de imágenes de lesiones cutáneas publicado por el usuario dacntt-kltn en HuggingFace. Se trata de un ajuste fino (fine-tuning) de una ResNet18 preentrenada en ImageNet sobre un subconjunto del dataset HAM10000, orientado a distinguir tres clases diagnósticas: `bkl` (queratosis benigna), `mel` (melanoma) y `nv` (nevus melanocítico). El modelo se distribuye bajo la librería PyTorch con el pipeline `image-classification` y un repositorio de 4,1 GB, presumiblemente ocupado por checkpoints y estados de optimizador.

El problema que aborda es la clasificación automática de lesiones dermatológicas a partir de imágenes dérmicas, un caso de uso clásico en la literatura de deep learning aplicado a dermatología. Frente a los entrenamientos típicos sobre las siete clases completas del HAM10000, este modelo reduce el problema a tres clases y entrena con 1.000 imágenes por clase y un split 80/10/10 realizado por `lesion_id`, lo que evita fugas de datos entre particiones. El checkpoint final reporta una accuracy de 0,7423, un macro-F1 de 0,7426 y un macro-AUC de 0,9172 sobre el conjunto de test.

Es relevante ahora sobre todo como referencia reproducible de un pipeline de clasificación médica con ResNet18, entrada a 256 px, normalización ImageNet integrada en el propio modelo y EMA con decay 0,99. No obstante, conviene subrayar que se trata de un modelo con cero descargas y cero likes en el momento de redactar esta ficha, licencia no declarada y sin documentación sobre sesgos, procedencia de datos clínicos o validación externa, por lo que no debe considerarse apto para uso clínico sin una validación adicional muy exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet18 (red convolucional residual de 18 capas, preentrenada en ImageNet) |
| Parametros totales | no disponible en la model card (la ResNet18 estandar tiene aproximadamente 11,7 millones) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de visión; entrada de imagen fija de 256 x 256 px) |
| Tipos de cuantizacion | no disponibles (no se documentan pesos GGUF, ONNX cuantizado ni INT8) |
| Idiomas soportados | no aplicable (clasificacion de imagen; etiquetas en ingles: bkl, mel, nv) |
| Licencia | no disponible |
| Formato de pesos | no disponible; repositorio PyTorch de 4,1 GB (probablemente `state_dict` o checkpoint completo con EMA y optimizador) |

## Arquitectura y entrenamiento

La arquitectura es una ResNet18, es decir, una CNN con bloques residuales de dos convoluciones 3x3 y conexiones de atajo (`skip connections`), tal y como se describe en el paper original de He et al. (2015). El autor indica que se parte de pesos preentrenados en ImageNet y que la normalización ImageNet está incorporada dentro del modelo, de modo que la entrada esperada es una imagen RGB en el rango [0,1] a 256 x 256 px, sin preprocesado externo adicional. La cabeza de clasificación se sustituye por una capa lineal de tres salidas, cuyo orden de logits es `['bkl', 'mel', 'nv']`.

Los datos de entrenamiento provienen del dataset de Kaggle `kmader/skin-cancer-mnist-ham10000`, del que se toman 1.000 imágenes por clase (3.000 en total) con un reparto 80/10/10 estratificado por `lesion_id`, práctica correcta para evitar que imágenes de la misma lesión aparezcan simultáneamente en entrenamiento y test. El autor documenta las siguientes decisiones de regularización y aumento: `label_smoothing=0.0`, `dropout=0.0` aplicado antes de la capa fully-connected, `weight_decay=0.0001`, `RandomResizedCrop`, volteos horizontales y verticales, `TrivialAugmentWide=False` (y, según el texto, se descarta la variación de color), `RandomErasing` con probabilidad 0.0 y uso de pesos promediados exponencialmente (EMA) con decay 0,99. El mejor checkpoint se selecciona según la métrica F1. No se documenta el número de épocas, el optimizador, el scheduler ni el tamaño de batch, y tampoco hay mención a RLHF, DPO ni a ningún tipo de ajuste por preferencias, algo esperable en un modelo de clasificación.

## Capacidades

- Clasificación de imágenes dermatológicas en tres categorías: `bkl`, `mel` y `nv`.
- Entrada de imagen RGB a 256 x 256 px con normalización ImageNet integrada en el propio módulo.
- Salida de logits en orden fijo (`bkl`, `mel`, `nv`), directamente utilizable con `argmax` o con `softmax` para obtener probabilidades por clase.
- Pesos EMA aplicados en el checkpoint final, lo que suele estabilizar ligeramente las predicciones.
- No soporta tool calling ni function calling: es un modelo puramente discriminativo de visión.
- No soporta agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de procesamiento de lenguaje: las etiquetas están en inglés y no hay componente textual.
- No dispone de modo "thinking", ni visión más allá de la clasificación, ni entrada de audio.

## Casos de uso

- Prototipado académico de pipelines de clasificación dermatológica: sirve como punto de partida reproducible para comparar arquitecturas convolucionales sobre HAM10000 con un split por `lesion_id` y métricas ya reportadas (macro-F1 0,7426, macro-AUC 0,9172).
- Triaje asistido en investigación clínica: el modelo puede usarse para priorizar imágenes con alta probabilidad de la clase `mel` dentro de un estudio retrospectivo, siempre como herramienta de cribado y nunca como diagnóstico autónomo.
- Etiquetado previo de datasets: al clasificar 3.000 imágenes en tres clases con un AUC superior a 0,9, puede emplearse para preanotar lotes de imágenes dérmicas antes de la revisión por dermatólogos, reduciendo el coste de anotación manual.
- Docencia y prácticas de transfer learning: al ser una ResNet18 con pesos ImageNet, es un ejemplo asequible para enseñar fine-tuning, EMA, aumento de datos y evaluación por macro-F1 en datos desbalanceados.
- Comparación de arquitecturas sobre HAM10000: el mismo autor publica `dacntt-kltn/mobilenetv4-ham10000`, por lo que este modelo permite contrastar el rendimiento de ResNet18 frente a MobileNetV4 en la misma tarea y dataset.
- Pruebas de integración en aplicaciones móviles o de borde: una ResNet18 a 256 px es lo bastante ligera para ejecutarse en CPU o en GPU integrada, lo que permite validar el flujo de inferencia antes de invertir en modelos mayores.
- Evaluación de robustez ante clases minoritarias: útil para estudiar cómo se comporta una CNN estándar cuando se concentra el problema en tres clases y se aplican estrategias de balanceo o de muestreo por `lesion_id`.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de test incluidas en la model card. No se han publicado resultados comparativos con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Accuracy | 0,7423 |
| Balanced accuracy | 0,7414 |
| Macro-F1 | 0,7426 |
| Macro-AUC | 0,9172 |
| Conjunto de evaluacion | split de test 10 % del subconjunto de 3 clases (1.000 imagenes por clase) |
| Clases evaluadas | bkl, mel, nv |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de lenguaje, ya que el modelo no procesa texto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Una ResNet18 en fp32 ocupa del orden de 45-50 MB de pesos, por lo que la inferencia cabe holgadamente en menos de 1 GB de VRAM a 256 x 256 px. La cifra exacta no está documentada por el autor.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, RTX 3060, RTX 4090 o incluso una GPU integrada son suficientes. Para lotes grandes, A100 o H100 aumentarían el throughput pero están sobredimensionadas para esta arquitectura.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo con al menos 2 GB de VRAM, e incluso en CPU con latencias razonables para uso individual.
- Opciones de despliegue: al estar etiquetado como `pytorch`, lo esperable es cargarlo con `torch.load` o mediante un `state_dict` y una definición propia de ResNet18, o bien exportarlo a TorchScript u ONNX para producción. No hay confirmación de compatibilidad con `transformers`, vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo salvo TGI en modo clasificación de imagen, extremo no documentado.
- Latencia y throughput estimados: no disponibles. Como referencia arquitectónica general, una ResNet18 a 256 px suele procesar cientos de imágenes por segundo en una GPU moderna y del orden de decenas por segundo en CPU, pero el autor no publica mediciones.

## Comparativa con modelos similares

No hay datos comparativos publicados por el autor ni benchmarks comunes que permitan una comparación rigurosa. En los resultados de búsqueda aparecen proyectos relacionados, pero con protocolos, número de clases y conjuntos de datos distintos, por lo que no son directamente comparables.

| Modelo | Tarea | Clases | Contexto o entrada | Metricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| dacntt-kltn/Resnet18-HAM10000-v3 | Clasificacion de lesiones cutaneas | 3 (bkl, mel, nv) | Imagen 256 x 256 px | acc 0,7423, macro-F1 0,7426, macro-AUC 0,9172 | no disponible | HuggingFace |
| dacntt-kltn/mobilenetv4-ham10000 | Clasificacion de lesiones cutaneas | no disponible | no disponible | no disponible en la informacion recogida | no disponible | HuggingFace |
| Notebook de Kaggle citado en findmariammariaa/skin-cancer-detection-ham10000 | Clasificacion de lesiones cutaneas | no disponible (CNN con ResNet18 y ResNet34) | no disponible | 85,02 % de accuracy reportada, protocolo no comparable | no disponible | Kaggle |
| Estudio comparativo IEEE 10425889 | Clasificacion de 7 tipos de cancer de piel sobre HAM10000 | 7 | no disponible | no disponible en la informacion recogida | no disponible | IEEE Xplore |

La cifra del 85,02 % procede de un notebook de Kaggle referenciado por un tercero y corresponde a un protocolo distinto (probablemente siete clases y sin split por `lesion_id`), por lo que no debe interpretarse como una comparación directa con el 74,23 % de accuracy de este modelo.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución, lo que supone un riesgo legal relevante en producción.
- Modelo de uso exclusivamente investigador o educativo: no hay validación clínica externa, ni metadatos sobre la población de origen de las imágenes, ni análisis de equidad por fototipo de piel.
- Sesgos potenciales no evaluados: el HAM10000 procede de una muestra limitada y con desequilibrios conocidos entre clases; el autor no publica análisis por subgrupos ni matrices de confusión.
- Riesgo de alucinación en sentido clínico: como clasificador puede asignar alta probabilidad a `mel` en lesiones benignas o viceversa, y las métricas de test (accuracy 0,7423) son demasiado bajas para cualquier uso diagnóstico. Un error en la clase `mel` tiene consecuencias graves.
- Limitación a tres clases: las categorías más frecuentes del HAM10000 completo (por ejemplo `bcc`, `akiec`, `df` y `vasc`) no están cubiertas, por lo que una imagen de esas clases será forzada a una de las tres etiquetas disponibles.
- Rendimiento limitado por el tamaño del conjunto de entrenamiento: 1.000 imágenes por clase es un volumen pequeño para una tarea dermatológica.
- Sin información sobre el número de épocas, el optimizador ni el proceso de selección del checkpoint, lo que dificulta reproducir exactamente el resultado.
- Deuda técnica en el repositorio: 4,1 GB para una arquitectura de ~11,7 millones de parámetros sugiere que se incluyen checkpoints y estados de optimizador innecesarios, lo que complica la descarga y el despliegue.
- Ausencia de documentación sobre formatos de exportación (ONNX, TorchScript) y sobre cuantización, lo que obliga a reconstruir el pipeline de inferencia a mano.
- Riesgo de sobreajuste al dataset: sin validación cruzada ni test externo, las métricas reportadas pueden no generalizar a imágenes de otras fuentes, cámaras o poblaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dacntt-kltn/Resnet18-HAM10000-v3
- Perfil del autor en HuggingFace: https://huggingface.co/dacntt-kltn
- Modelo relacionado del mismo autor: https://huggingface.co/dacntt-kltn/mobilenetv4-ham10000
- Dataset HAM10000 en Kaggle: https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000
- Proyecto de detección de cáncer de piel sobre HAM10000 en GitHub: https://github.com/findmariammariaa/skin-cancer-detection-ham10000
- Pipeline de clasificación de lesiones cutáneas en GitHub: https://github.com/MalekSum/ham10000-skin-lesion-classification
- Estudio comparativo sobre HAM10000 en IEEE Xplore: https://ieeexplore.ieee.org/abstract/document/10425889
- Paper original de ResNet (He et al., 2015): https://arxiv.org/abs/1512.03385
- Paper del dataset HAM10000 (Tschandl et al., 2018): https://arxiv.org/abs/1803.10417
