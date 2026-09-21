# Crystalbullet/lunar_project

## Resumen

`Crystalbullet/lunar_project` es un clasificador binario de imágenes desarrollado por el usuario Crystalbullet bajo el título «The Pareidolia Paradox — Lunar Terrain Classification». Su tarea es determinar si una observación de terreno lunar corresponde a una depresión (`0 = Depth`) o a una elevación (`1 = Rise`), a partir de una imagen en escala de grises de 256×256 píxeles acompañada de su ángulo de acimut solar en el momento de la adquisición. El modelo se publica como un artefacto de PyTorch orientado a un pipeline de `image-classification` y forma parte de un proyecto de investigación sobre si la apariencia del terreno lunar es clasificable de forma fiable cuando se aporta la dirección de iluminación como metadato.

La arquitectura es una fusión de dos ramas: un backbone ResNet18 preentrenado en ImageNet para la imagen y un perceptrón multicapa que codifica el ángulo de acimut solar como `[sin(θ), cos(θ)]`. Las características de ambas ramas se concatenan y pasan por un clasificador `528 → 128 → 1`. Se trata, por tanto, de un modelo pequeño de visión, no de un modelo de lenguaje: no tiene ventana de contexto en tokens ni capacidades generativas.

La relevancia del proyecto es metodológica más que de rendimiento. El autor documenta de forma explícita que el modelo neuronal final (76,40 % de exactitud balanceada en el holdout reservado) no supera a una línea base trivial de ángulo fijo (78,29 % en ese mismo holdout), y presenta el resultado como una advertencia sobre la interpretación de imágenes de terreno lunar y el fenómeno de pareidolia. El repositorio tiene 0 descargas y 1 «like» en el momento de la consulta, y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión bimodal: ResNet18 de torchvision preentrenado en ImageNet (rama de imagen) + MLP `2 → 32 → 16` sobre `[sin(θ), cos(θ)]` del acimut solar (rama de metadatos) + clasificador `528 → 128 → 1` |
| Parametros totales | No declarado en la model card; la rama de imagen es un ResNet18 estándar de torchvision (aproximadamente 11,7 M de parámetros) más el MLP y el clasificador de fusión |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes; entrada de 256×256 píxeles en escala de grises) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no aplica a la tarea) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (`best_model.pt` alojado en Hugging Face; el autor identifica `inference.pt` como checkpoint final auditado en local) |

Otros datos del repositorio: etiquetas `pytorch`, `computer-vision`, `image-classification`, `lunar-terrain`, `region:us`; tamaño del repositorio 0,1 GB; creado el 21 de septiembre de 2026 y actualizado el mismo día; pipeline declarado `image-classification`.

## Arquitectura y entrenamiento

El modelo sigue un esquema de fusión tardía por concatenación de características. La rama de imagen es un ResNet18 preentrenado en ImageNet al que se le alimentan las imágenes replicadas a tres canales y normalizadas con las estadísticas de ImageNet. La rama de metadatos recibe el ángulo de acimut solar codificado de forma cíclica como seno y coseno, lo que evita discontinuidades en la representación angular, y lo procesa mediante un MLP de dos capas ocultas (32 y 16 unidades). Las características resultantes se concatenan y se introducen en un clasificador `528 → 128 → 1` que produce un logit binario.

La variante de producción se denomina `raw_fusion`: no se rotan los píxeles y se entrega al modelo el ángulo de adquisición original. El autor probó como alternativa controlada una canonicalización por rotación (rotando la imagen alrededor de su centro con OpenCV, tanto con `-sun_azimuth_angle` como con el signo opuesto, usando un lienzo de 256×256 y relleno gris neutro), pero la convención física del ángulo en el conjunto de datos no está documentada, por lo que la rotación no se asumió correcta. La validación cruzada de cinco folds seleccionó la fusión sin rotar: 76,67 % de exactitud balanceada media frente a 76,09 % de la variante canonicalizada.

En cuanto a los datos, de 7.854 filas de entrenamiento se consideraron elegibles 7.852; dos filas con imagen y ángulo idénticos pero etiquetas contradictorias se pusieron en cuarentena sin reetiquetarse. Se conservaron las observaciones del mismo ángulo y de ángulos distintos de una misma imagen dentro del mismo grupo para evitar fugas de información. El entrenamiento usó `BCEWithLogitsLoss` ponderada por clase, optimizador AdamW con tasas de aprendizaje de `3e-5` para el backbone y `3e-4` para la cabeza de fusión, decaimiento de peso `1e-4`, dropout de `0.3` en el clasificador, tamaño de lote 32 y AMP en CUDA, con programación de coseno y dos épocas de calentamiento del backbone. Las ejecuciones de desarrollo usaron un límite de ocho épocas con parada temprana de paciencia cuatro; el reajuste final seleccionado usó un calendario fijo de cuatro épocas sobre todas las filas elegibles. El umbral de decisión se calibró a partir de predicciones out-of-fold de desarrollo y se congeló en `0,48025015` antes de evaluar el holdout. No se documenta ningún uso de RLHF, DPO ni ajuste por preferencias, algo por otra parte ajeno a esta tarea.

## Capacidades

- Clasificación binaria de imágenes de terreno lunar en las clases `0 = Depth` (depresión) y `1 = Rise` (elevación).
- Entrada multimodal: imagen en escala de grises de 256×256 píxeles más el ángulo de acimut solar de adquisición.
- Fusión de información visual e información geométrica de iluminación mediante concatenación de características.
- Salida de un único logit con umbral de decisión calibrado y congelado (`0,48025015`).
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades de visión general más allá de esta tarea de clasificación.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- El proyecto incorpora utilidades de diagnóstico asociadas al modelo: Grad-CAM y diagnósticos de desplazamiento de iluminación, además de validación de esquema CSV y recarga de checkpoints sobre las 2.000 filas de evaluación.

## Casos de uso

- Etiquetado automático de archivos de imágenes lunares: el modelo puede asignar las etiquetas Depth/Rise a imágenes de 256×256 con su ángulo de acimut asociado, lo que permite preanotar grandes volúmenes de observaciones antes de una revisión humana.
- Triaje previo a anotación manual en proyectos de teledetección planetaria: dado que el modelo procesa una observación en una sola pasada y es muy ligero, puede usarse como primer filtro para separar las imágenes ambiguas que requieren criterio de un experto.
- Investigación sobre percepción de relieve e iluminación: el modelo sirve como banco de pruebas controlado para comparar fusión de imagen con metadatos de ángulo frente a reglas heurísticas de ángulo fijo, tal y como documenta el propio autor.
- Estudio de pareidolia en interpretación de imágenes planetarias: permite cuantificar hasta qué punto la apariencia visual induce interpretaciones erróneas de profundidad o elevación cuando se aporta la dirección de la luz.
- Detección de artefactos en pipelines de adquisición: los diagnósticos de Grad-CAM y de desplazamiento de iluminación incluidos en el proyecto permiten inspeccionar qué regiones de la imagen sustentan la decisión y detectar dependencias no deseadas de la iluminación.
- Validación de convenciones de datos: el proyecto compara explícitamente la rotación canónica con signo positivo y negativo y la variante sin rotar, lo que resulta útil para verificar la convención de ángulos de un conjunto de datos lunar antes de fijar un pipeline de preprocesado.
- Componente de un clasificador jerárquico mayor: al ser un módulo pequeño y con salida binaria, puede integrarse como etapa intermedia dentro de un sistema de segmentación o cartografiado de terreno, siempre que se respete su umbral calibrado.

## Benchmarks y rendimiento

| Variante | Exactitud balanceada media (5 folds agrupados) | Exactitud balanceada en holdout (1.122 observaciones) |
|---|---|---|
| `raw_fusion` (modelo final, imagen sin rotar + ángulo original) | 76,67 % | 76,40 % |
| Fusión con imagen canonicalizada por rotación | 76,09 % | No disponible |
| Línea base de ángulo fijo | No disponible | 78,29 % |

Datos adicionales declarados: 7.852 observaciones etiquetadas elegibles para el reajuste final; métricas reportadas en el proyecto que incluyen exactitud balanceada, recall por clase, ROC-AUC, log loss, recuentos de la matriz de confusión e incertidumbre por bootstrap agrupado (no se publican los valores concretos de estas métricas). El autor advierte explícitamente de que la puntuación del holdout es exactitud balanceada, no exactitud ordinaria, y de que el modelo neuronal no debe describirse como superior a la línea base de ángulo fijo, que obtuvo 78,29 % en el mismo holdout.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Por la naturaleza del modelo (ResNet18 a 256×256 con lote pequeño), la inferencia cabe holgadamente en menos de 1 GB de VRAM en fp32, aunque esta cifra es una estimación derivada de la arquitectura y no un dato publicado por el autor.
- GPU recomendadas: no declaradas. Cualquier GPU con al menos 2 GB de memoria es suficiente en la práctica; el entrenamiento se realizó con AMP en CUDA según la model card.
- Cabe en GPU de consumo: sí, en la práctica cualquier GPU de consumo moderna (por ejemplo, serie GTX 10xx o superior) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch nativo (la model card solo documenta pesos `.pt`). No se documenta soporte de vLLM, TGI, llama.cpp, Ollama ni GGUF, formatos que además no aplican a un clasificador de visión. La exportación a TorchScript u ONNX sería viable técnicamente, pero no está documentada por el autor.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de imágenes por segundo.
- Tamaño del repositorio en Hugging Face: 0,1 GB.

## Comparativa con modelos similares

No se han identificado en la información disponible modelos públicos comparables de clasificación binaria de terreno lunar con fusión de ángulo de acimut solar. La única comparación cuantitativa disponible es interna al propio proyecto:

| Alternativa | Tipo | Balanced accuracy en holdout | Licencia | Disponibilidad |
|---|---|---|---|---|
| `raw_fusion` (este modelo) | ResNet18 + metadatos de ángulo | 76,40 % | No disponible | Pesos `.pt` en Hugging Face |
| Regla de ángulo fijo | Línea base heurística, sin aprendizaje | 78,29 % | No aplica | Descrita en la model card, sin artefacto publicado |
| Fusión canonicalizada | ResNet18 + metadatos, imagen rotada | No disponible | No disponible | Solo resultados de validación cruzada |

Para el resto de variantes mencionadas en el proyecto (solo imagen, solo ángulo) no se publican cifras concretas en la información disponible.

## Limitaciones y advertencias

- Rendimiento limitado: 76,40 % de exactitud balanceada en el holdout reservado, por debajo del 78,29 % de una línea base trivial de ángulo fijo. El propio autor indica que el modelo no debe presentarse como superior a esa línea base.
- Tarea muy restringida: clasificación binaria Depth/Rise sobre imágenes de 256×256 en escala de grises; no es un modelo de propósito general ni transferible sin reentrenamiento.
- Convención de ángulos no documentada: el conjunto de datos no especifica la convención física del ángulo de acimut solar, lo que impide asumir que la rotación canónica sea correcta y limita la interpretabilidad de la rama de metadatos.
- Dataset pequeño: 7.852 observaciones elegibles, con cinco folds agrupados y un holdout de 1.122 filas. La incertidumbre por bootstrap agrupado se reporta en el proyecto, pero sus valores no se publican en la información disponible.
- Duplicados contradictorios: dos filas con imagen y ángulo idénticos presentaban etiquetas en conflicto y se pusieron en cuarentena sin reetiquetar, lo que indica ruido de etiquetado en el origen de datos.
- Umbral fijo: la decisión depende de un umbral congelado (`0,48025015`) calibrado sobre predicciones out-of-fold de desarrollo; variar el umbral o el dominio de aplicación puede alterar de forma notable la precisión y el recall por clase.
- Riesgo de sesgo por iluminación: la tarea depende intrínsecamente de la dirección de la luz, y el proyecto dedica diagnósticos específicos a medir el desplazamiento por iluminación, lo que sugiere sensibilidad a este factor.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial ni para redistribución de los pesos o del artefacto.
- Idiomas no disponibles y no aplicables: el modelo no procesa texto.
- Ambigüedad sobre el artefacto publicado: la model card indica que el archivo alojado es `best_model.pt`, perteneciente a una etapa experimental anterior, mientras que el checkpoint final de producción (`runs/phasewise_v3/models/final_refit/inference.pt`) solo se referencia mediante una ruta local de Windows. Debe verificarse qué pesos corresponden realmente al modelo evaluado antes de usarlos en producción.
- Enlaces internos rotos: varias referencias del README apuntan a rutas locales del autor (`C:/Users/athar/...`) y no a recursos accesibles públicamente; tampoco se localiza la URL del CSV de envío.
- Sin datos de cuantización ni de optimización para despliegue: no se documentan versiones cuantizadas, exportaciones ONNX/TorchScript ni perfiles de latencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Crystalbullet/lunar_project
- Archivo de pesos alojado: `best_model.pt` (referenciado en la model card del repositorio de Hugging Face)
- Informe de evaluación completo: `IMPLEMENTATION_REPORT.md` (referenciado en la model card únicamente mediante ruta local, no accesible públicamente)
- Checkpoint final auditado: `runs/phasewise_v3/models/final_refit/inference.pt` (ruta local del autor, no accesible públicamente)
- CSV de envío: `submission.csv` (ruta local del autor; la URL pública en Google Drive no está disponible)
- Paper, blog técnico, repositorio de código o demo: no disponibles en la información proporcionada
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda no guardan relación con el modelo (contenido sobre Twitch y Reddit), por lo que no se incluyen como enlaces relevantes.
