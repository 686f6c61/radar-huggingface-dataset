# Kashif-Mahmood007/peanut-leaf-disease-classifiers

## Resumen

Peanut leaf disease classifiers es una colección de modelos de clasificación de imágenes entrenados específicamente para identificar cinco enfermedades y estados en hojas de cacahuete (groundnut, *Arachis hypogaea*): mancha foliar por Alternaria, hoja sana, mancha foliar temprana y tardía, roseta y roya. Lo desarrolla Kashif-Mahmood007 como material reproducible del estudio "Deep learning-based peanut leaf disease classification using transfer learning under leakage-controlled cross-validation", actualmente en revisión. El modelo está pensado para investigación agronómica y no para diagnóstico operativo.

El repositorio no contiene un único modelo, sino cinco configuraciones de backbone (ConvNeXt-Base, EfficientNet-B0, EfficientNet-B4 y ResNet-50) entrenadas mediante validación cruzada estratificada por grupos de 5 folds, con un modelo por fold. Cada configuración se ha evaluado en su propio fold de test, con separación estricta de imágenes casi duplicadas entre train, validation y test, lo que evita la fuga de datos típica de splits aleatorios sobre datasets con imágenes muy parecidas.

Su relevancia actual es metodológica: demuestra que es posible mantener precisiones superiores al 97% en clasificación de enfermedades foliares cuando se aplica control de fuga por grupos, un aspecto infravalorado en mucha literatura agronómica de deep learning. La licencia CC BY 4.0 permite reutilización con atribución, aunque el propio autor advierte que las métricas reportadas constituyen un límite superior para uso de campo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN con transfer learning: ConvNeXt-Base, EfficientNet-B0, EfficientNet-B4, ResNet-50 (torchvision) |
| Parámetros totales | no disponible (depende del backbone: ConvNeXt-Base ~88M, EfficientNet-B4 ~19M, EfficientNet-B0 ~5,3M, ResNet-50 ~25,6M según torchvision, no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantización | no disponible; pesos en float16, cargados en float32 |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (float16 en almacenamiento, float32 en carga) |
| Entrada | imagen RGB, redimensionada a 448×448 y luego al tamaño de entrada del backbone (224×224 o 380×380) con normalización ImageNet |
| Pipeline | image-classification |
| Clases | Alternaria leaf spot, Healthy, Leaf spot (early and late), Rosette, Rust |
| Tamaño del repo | 2,2 GB |
| Librería | PyTorch (torchvision) |

## Arquitectura y entrenamiento

Se trata de un conjunto de clasificadores de imagen basados en transfer learning desde pesos ImageNet de torchvision. Se han explorado cuatro backbones: ConvNeXt-Base, EfficientNet-B0, EfficientNet-B4 y ResNet-50. Para cada backbone se ha aplicado validación cruzada estratificada por grupos de 5 folds (`fold0`–`fold4`), con agrupación de fotografías casi idénticas para que un mismo grupo no aparezca en más de un conjunto por fold. Esta decisión metodológica es el núcleo del trabajo: elimina la fuga de datos que infla artificialmente las métricas en datasets con imágenes duplicadas o casi duplicadas.

Se han definido dos recetas de entrenamiento. La receta P congela todo el backbone y entrena solo la última etapa más una cabeza nueva de dos capas, con muestreo balanceado, entropía cruzada ponderada por clase, optimizador Adam con OneCycle y aumentación de flip, rotación, color, traslación y random erasing. La receta B entrena todas las capas con cabeza lineal, label smoothing de 0,2, AdamW con cosine warm restarts y aumentación más agresiva (incluye random resized crop y escala de grises). Ambas recetas usan 25 épocas. La selección de cada fold se hace por máximo macro-F1 en validación, con un único test final sobre su fold correspondiente. Los detalles completos están en el `config.json` de cada configuración.

No se conservaron los pesos de tres configuraciones (EfficientNet-B0 receta B, EfficientNet-B4 receta B y ResNet-50 receta B); sus resultados se reportan en el artículo y se pueden reproducir con el código. Para ConvNeXt-Base receta B se reentrenó con los mismos hiperparámetros y semillas, obteniendo predicciones idénticas en 1720 de 1720 imágenes de test (McNemar exacto, p = 1). Antes del upload se verificó que 8599 de 8600 predicciones coincidían con las registradas durante el entrenamiento original, lo que da una idea del cuidado del autor en la reproducibilidad.

## Capacidades

- Clasificación de imágenes de hojas de cacahuete en cinco categorías: Alternaria leaf spot, Healthy, Leaf spot (early and late agrupadas), Rosette y Rust.
- Predicción probabilística por clase mediante `predict_proba`, útil para umbralizar o para análisis de incertidumbre.
- Agregación de los cinco modelos de fold para predicción promediada en inferencia (`--fold all`).
- Lectura de orientación EXIF y preprocesado automático (resize, normalización ImageNet) integrado en `inference.py`.
- Reproducibilidad de los splits mediante `cv_splits.csv`, `images.csv` y `cv_splits_meta.json`.
- No soporta tool calling, agentes, texto, audio ni multimodalidad: es estrictamente visión.
- No detecta múltiples enfermedades en una misma hoja, no separa mancha temprana de tardía y no estima severidad.

## Casos de uso

- Investigación agronómica reproducible: usar los cinco modelos por fold y los splits publicados para comparar nuevas arquitecturas bajo el mismo protocolo de control de fuga, garantizando comparaciones justas.
- Docencia en visión artificial aplicada: ejemplo realista de transfer learning, aumentación y validación cruzada por grupos, con código de inferencia y CSVs de splits listos para usar.
- Prefiltrado en anotación de datasets: desplegar el clasificador para priorizar imágenes que un experto debe revisar, reduciendo el coste de etiquetado en campañas de recolección de datos.
- Prueba de concepto en apps de campo: integrar `inference.py` en una aplicación móvil o web que capture una hoja y devuelva la clase predicha con su probabilidad, siempre como herramienta de apoyo y no de diagnóstico.
- Benchmark de backbones en agricultura: comparar ConvNeXt-Base, EfficientNet-B0/B4 y ResNet-50 con la misma tubería de datos para decidir qué arquitectura conviene en un nuevo proyecto de clasificación foliar.
- Detección temprana de roya y roseta en programas de monitorización: usar el modelo como señal de alarma para activar inspección humana en parcelas, con las cautelas de generalización indicadas por el autor.
- Análisis de robustez: reentrenar o evaluar los modelos sobre imágenes de otros dispositivos, regiones o cultivares para medir la caída de rendimiento fuera de distribución, aprovechando que los pesos y splits son reproducibles.

## Benchmarks y rendimiento

Resultados reportados en la model card (media ± desviación típica sobre los 5 folds; aciertos pooled sobre 1720 imágenes de test):

| Configuración | Backbone | Receta | Entrada (px) | Accuracy (%) | Macro-F1 (%) | Correctas / test |
|---|---|---|---|---|---|---|
| `convnext_base__B` | ConvNeXt-Base | B | 224 | 99,31 ± 0,42 | 99,16 ± 0,52 | 1708 / 1720 |
| `convnext_base__P` | ConvNeXt-Base | P | 224 | 98,11 ± 0,99 | 98,10 ± 0,59 | 1688 / 1720 |
| `efficientnet_b0__P` | EfficientNet-B0 | P | 224 | 97,45 ± 0,72 | 97,72 ± 0,89 | 1676 / 1720 |
| `efficientnet_b4__P` | EfficientNet-B4 | P | 380 | 98,67 ± 0,50 | 98,57 ± 0,97 | 1697 / 1720 |
| `resnet50__P` | ResNet-50 | P | 224 | 97,90 ± 0,65 | 97,83 ± 0,62 | 1684 / 1720 |

No hay resultados publicados de MMLU, HumanEval, GSM8K ni benchmarks de texto: es un modelo de visión. Tampoco se reportan métricas por clase (precisión, recall, matriz de confusión) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre ~1 y ~2 GB para EfficientNet-B0 en float32, ~2-3 GB para ResNet-50/EfficientNet-B4 y ~4-6 GB para ConvNeXt-Base en float32 con batch pequeño (estimación orientativa; la model card no la especifica).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM puede ejecutar los backbones pequeños; ConvNeXt-Base se beneficia de 8 GB o más. Para entrenamiento o evaluación completa de los 5 folds, se recomienda A100, H100, L4 o RTX 4090.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y superiores para todas las configuraciones con batch moderado.
- Opciones de despliegue: PyTorch nativo con `inference.py`, TorchServe o FastAPI para servicio HTTP. No hay pesos GGUF ni ONNX publicados en el repositorio, aunque la conversión a ONNX o TorchScript es viable.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Entrada | Accuracy reportada | Licencia |
|---|---|---|---|---|---|
| Peanut leaf disease classifiers (este) | CNN transfer learning (4 backbones) | 5 enfermedades de cacahuete | 224/380 | hasta 99,31% | CC BY 4.0 |
| Modelos genéricos de clasificación de enfermedades vegetales (p. ej. PlantVillage-based en Hugging Face) | CNN transfer learning | decenas de cultivos y enfermedades | 224 | variable, con fuga de datos frecuente | variable |
| CLIP / SigLIP zero-shot | Vision-language | abierto | 224 | no específico para enfermedades | MIT / Apache 2.0 |

No se dispone de comparaciones publicadas en la información proporcionada frente a otros modelos específicos de enfermedades del cacahuete. La comparación con clasificadores genéricos de enfermedades vegetales debe hacerse con cautela, porque este modelo está restringido a cinco clases de una sola especie y no se ha evaluado fuera de su distribución.

## Limitaciones y advertencias

- Origen único de datos: todas las imágenes provienen de un dataset público tomado con un único smartphone en una región de India, con luz natural. La precisión en otras regiones, cultivares, dispositivos o condiciones de cultivo es desconocida y probablemente inferior.
- Límite superior: el propio autor indica que las precisiones reportadas son un límite superior para uso de campo.
- Una etiqueta por imagen: el modelo no detecta varias enfermedades en una misma hoja, no separa mancha foliar temprana de tardía y no estima severidad.
- Clasificación forzada: imágenes de otros cultivos, otras enfermedades o que no sean hojas reciben igualmente una de las cinco clases, sin opción de rechazo.
- No validado para diagnóstico ni para decisiones de manejo agronómico; úsese solo en investigación.
- Licencia CC BY 4.0: permite uso comercial con atribución, pero los pesos derivan de pesos ImageNet de torchvision (BSD-3-Clause) y del dataset de Mendeley (CC BY 4.0). Conviene revisar la atribución exigida por cada upstream.
- Riesgo de alucinación: no aplica en el sentido de texto, pero sí de falsos positivos confiados; la probabilidad softmax no está calibrada ni se reporta calibración.
- Idiomas: no aplica; no procesa texto ni etiquetas en lenguaje natural.
- Los pesos de tres configuraciones (receta B) no se conservaron; solo están disponibles las que aparecen en la tabla del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Kashif-Mahmood007/peanut-leaf-disease-classifiers
- Dataset original: https://doi.org/10.17632/x6x5jkk873.2
- Repositorio de código: enlace pendiente de publicación según la model card (no disponible)
- Artículo: en revisión, citación pendiente de actualización (no disponible)
