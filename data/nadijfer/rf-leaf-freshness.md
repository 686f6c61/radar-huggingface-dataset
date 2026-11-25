# nadijfer/RF-Leaf-Freshness

## Resumen

RF-Leaf-Freshness es un clasificador de tipo Random Forest desarrollado por nadijfer (Nadhif Rif'at Rasendriya y colaboradores de la Facultad de Informática de la Universidad de Brawijaya) para categorizar hojas de plantas en tres estados fisiológicos: sana (`sehat`), amarilleando (`menguning`) y seca (`kering`). No es un modelo de lenguaje ni una red neuronal profunda: es un pipeline clásico de `scikit-learn` que opera sobre características hechas a mano (color y textura) extraídas de imágenes preprocesadas.

El modelo se enmarca en un proyecto final de la asignatura de Procesamiento Digital de Imágenes y Visión por Computador (PCD-CV / CIF61339) y se entrenó con un conjunto de datos primario recogido en el campus de la UB. Su relevancia es limitada y académica: sirve como ejemplo reproducible de un flujo clásico de visión por computador (preprocesado, extracción de características, clasificación) con métricas honestas y control de fuga de datos mediante validación agrupada.

El artefacto distribuido es un único fichero `.pkl` (bundle de `joblib`) que contiene el pipeline entrenado, la lista ordenada de 28 características y los parámetros de preprocesado. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random Forest (pipeline de scikit-learn) sobre 28 características hechas a mano |
| Parametros totales | no disponible (300 árboles, profundidad máxima 6; el bundle no publica recuento de nodos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (no hay pesos neuronales; el `.pkl` se serializa con `joblib`) |
| Idiomas soportados | en, id (etiquetas y documentación; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.pkl` (bundle `joblib` con pipeline, `feature_cols`, `classes`, `target_l`) |

## Arquitectura y entrenamiento

El modelo es un `RandomForestClassifier` de `scikit-learn` encapsulado en un `Pipeline`. La entrada no es una imagen cruda, sino un vector de 28 características calculadas por un pipeline de procesamiento digital de imágenes denominado `v2`: redimensionado con preservación de relación de aspecto (`long_side=800`), gamma adaptativa en el espacio L* con objetivo `target_l=0.716`, ecualización adaptativa de histograma (CLAHE), filtro bilateral y segmentación de ROI. De esas 28 características, 12 son de color (HSV y CIE-LAB) y 16 de textura (GLCM y LBP).

Los hiperparámetros son `n_estimators=300`, `max_depth=6`, `max_features='sqrt'` y `min_samples_leaf=2`. El entrenamiento se realizó sobre 619 imágenes preprocesadas derivadas de 127 fotos primarias del campus de la UB. La evaluación emplea validación cruzada anidada de 5 pliegues con `StratifiedGroupKFold(groups=parent_id)`, de modo que las imágenes derivadas de una misma foto original nunca se reparten entre entrenamiento y validación; esta decisión mitiga la fuga de datos típica en datasets aumentados. No se documenta uso de RLHF, DPO ni técnicas de aprendizaje profundo.

## Capacidades

- Clasificación de imágenes de hojas en tres clases: `sehat` (sana), `menguning` (amarilleando) y `kering` (seca).
- Salida de probabilidades por clase mediante `pipeline.predict_proba(X)`.
- Extracción implícita de características de color (HSV, CIE-LAB) y textura (GLCM, LBP) a partir del pipeline `v2`.
- Inferencia muy rápida: aproximadamente 0,93 ms por imagen según la model card.
- Reproducibilidad del preprocesado mediante los parámetros serializados (`pcd_version='v2'`, `target_l=0.716`).
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni visión genérica más allá del dominio de hojas.

## Casos de uso

- Monitorización de salud vegetal en jardines botánicos o campus: el modelo clasifica hojas capturadas con cámara y permite etiquetar automáticamente estados fisiológicos para inventarios de vegetación, con latencia inferior a 1 ms por imagen.
- Agricultura de precisión en cultivos de hoja: integrado en un pipeline de captura con dron o cámara fija, detecta hojas amarilleando o secas para priorizar riego o tratamiento, siempre que las condiciones de iluminación se normalicen con el preprocesado `v2`.
- Docencia y reproducción de flujos clásicos de visión por computador: sirve como referencia didáctica de extracción de características (color y textura) y validación agrupada sin fuga de datos.
- Prototipado rápido en dispositivos de bajo consumo: al ser un modelo de árboles con inferencia en CPU y ~1 ms por imagen, cabe en Raspberry Pi o microcontroladores con Python para sistemas de alerta temprana.
- Etiquetado asistido de datasets botánicos: el modelo puede preetiquetar imágenes de hojas para que un anotador humano revise y corrija, reduciendo el coste de curación.
- Investigación en fenología vegetal: permite comparar la evolución de estados foliares a lo largo del tiempo en parcelas monitorizadas, con métricas de probabilidad por clase para análisis estadístico.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Macro F1-Score (CV anidada 5 pliegues, agrupada) | 92,70 ± 4,70 % |
| Accuracy (CV anidada 5 pliegues, agrupada) | 92,89 ± 4,57 % |
| Latencia de inferencia | ~0,93 ms / imagen |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier equipo consumer: portátil, Raspberry Pi o contenedor ligero con Python y `scikit-learn`.
- Opciones de despliegue: `joblib` + `scikit-learn` en scripts de Python, API con FastAPI o Flask, o integración en pipelines de procesamiento por lotes.
- Latencia estimada: ~0,93 ms por imagen en el hardware de referencia del autor; el throughput depende del coste del preprocesado `v2` (CLAHE, filtro bilateral, GLCM, LBP), que suele dominar el tiempo total frente a la predicción del bosque.
- Memoria: el repositorio ocupa 0,0 GB; el bundle `.pkl` es de tamaño reducido y no requiere GPU ni cuantización.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RF-Leaf-Freshness | Random Forest sobre 28 características | 300 árboles, profundidad 6 | no aplica | Macro F1 92,70 % (CV agrupada) | MIT | Hugging Face |
| MobileNetV2 (fine-tuning) | CNN | ~3,4 M | no aplica | no disponible en esta ficha | Apache 2.0 | TensorFlow/Keras, TF Hub |
| ResNet-50 (fine-tuning) | CNN | ~25,6 M | no aplica | no disponible en esta ficha | MIT (pesos ImageNet) | PyTorch, torchvision |
| EfficientNet-B0 (fine-tuning) | CNN | ~5,3 M | no aplica | no disponible en esta ficha | Apache 2.0 | PyTorch, timm |

La comparación es cualitativa: no se dispone de resultados de estos modelos sobre el mismo dataset de hojas de la UB, por lo que no es posible afirmar superioridad o inferioridad en accuracy. La diferencia principal es que RF-Leaf-Freshness depende de características hechas a mano y de un preprocesado específico, mientras que las CNN aprenden representaciones directamente de la imagen.

## Limitaciones y advertencias

- Dominio muy restringido: solo clasifica hojas en tres estados fisiológicos y fue entrenado con imágenes del campus de la UB; la generalización a otras especies, cámaras o condiciones de iluminación no está validada.
- Dependencia crítica del preprocesado: la entrada debe generarse con el pipeline `v2` exacto (`target_l=0.716`, CLAHE, filtro bilateral, ROI); alterar estos pasos degrada la validez de las 28 características.
- Dataset pequeño: 619 imágenes derivadas de 127 fotos primarias; la varianza de las métricas (±4,70 % en F1) refleja esta limitación.
- Riesgo de falsos negativos en estados intermedios: la frontera entre `menguning` y `kering` puede ser ambigua según la especie y la estación.
- Sin capacidades de texto, razonamiento ni agentes: no debe presentarse como un modelo de lenguaje ni usarse fuera de la clasificación tabular de características de imagen.
- Sesgo geográfico y de especie: la recolección se limitó a un campus; no hay evaluación de sesgos por especie, iluminación o fondo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene auditar el bundle antes de desplegarlo en producción.
- Sin mantenimiento documentado: 0 descargas y 0 likes en el momento de la consulta; no hay historial de versiones ni issues públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nadijfer/RF-Leaf-Freshness
- Repositorio de la asignatura PCD-CV / CIF61339 (Universitas Brawijaya): no disponible
- Paper o memoria del proyecto: no disponible
- Demo o Space asociado: no disponible
