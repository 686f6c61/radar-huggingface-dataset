# matthieulel/vgg16-galaxy10-decals-full-v2

## Resumen

`vgg16-galaxy10-decals-full-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face matthieulel. Se trata de una adaptación de la red convolucional VGG16 de torchvision (pesos originales de ImageNet-1k, `IMAGENET1K_V1`) mediante ajuste fino completo (todos los parámetros actualizados) sobre el conjunto de datos Galaxy10 DECaLS, que distingue diez clases morfológicas de galaxias.

El modelo forma parte de una colección más amplia de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) descrita en el artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). Su relevancia actual radica en que sirve como referencia reproducible y comparable dentro de un benchmark estandarizado de modelos de visión aplicados a datos astronómicos, con protocolo de entrenamiento idéntico entre todos los backbones evaluados.

Con 134.301.514 parámetros y un tamaño de repositorio de 0,5 GB, es un modelo compacto orientado exclusivamente a clasificación de imágenes (pipeline `image-classification`), sin capacidades generativas ni de texto. La entrada de evaluación es de 224x224 píxeles y la salida es un vector de 10 logits, uno por clase morfológica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG16 (red neuronal convolucional, torchvision `vgg16`, pesos `IMAGENET1K_V1`) con cabeza lineal de 10 salidas |
| Parametros totales | 134.301.514 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; entrada de 224x224 px) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es una VGG16 estándar de torchvision, es decir, una CNN profunda con bloques convolucionales de kernels 3x3 y capas de pooling, seguida de un clasificador denso. La única modificación respecto al modelo original es la sustitución de la capa final `classifier[6]` por una capa lineal de 10 salidas, correspondientes a las diez clases de morfología galáctica de Galaxy10 DECaLS. El régimen de adaptación es ajuste fino completo: se actualizan todos los parámetros, no solo la cabeza.

El entrenamiento se realizó sobre Galaxy10 DECaLS (17.736 imágenes), con el split público de test (1.774 imágenes) reservado como conjunto de evaluación held-out y el split público de train dividido de forma estratificada por clase en 14.188 imágenes de entrenamiento y 1.774 de validación. La receta es idéntica para los 40 backbones del benchmark: AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), tasa de aprendizaje 5e-5, schedule lineal con 10% de warm-up, lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo 256), 30 épocas, precisión simple (fp32, TF32 desactivado) y una sola GPU. El aumento de datos consiste en random resized crop a la resolución de entrada y volteo horizontal aleatorio; la evaluación aplica resize y center crop a 224x224 px con la normalización del image processor del checkpoint. La época seleccionada es la de mínima pérdida de validación (época 17 de 30), y la semilla principal es 42, con semillas 1 y 2 usadas para el cálculo de media y desviación típica.

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica (Galaxy10 DECaLS).
- Extracción de características visuales mediante el backbone convolucional VGG16 preentrenado en ImageNet-1k y ajustado al dominio astronómico.
- Inferencia determinista sobre imágenes de 224x224 px con normalización ImageNet estándar.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesamiento de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.
- Integración directa con PyTorch y torchvision mediante carga de safetensors.

## Casos de uso

- Clasificación morfológica automatizada de galaxias en pipelines de análisis astronómico: el modelo recibe recortes de 224x224 px y devuelve una de las diez clases de Galaxy10 DECaLS, lo que permite procesar lotes de imágenes de surveys de forma reproducible.
- Etiquetado asistido de catálogos: uso del clasificador para preetiquetar imágenes antes de la revisión humana, reduciendo el coste de anotación en proyectos con grandes volúmenes de recortes.
- Referencia de baseline en investigación: al formar parte de un benchmark de 80 configuraciones con receta idéntica, sirve para comparar arquitecturas CNN clásicas frente a modelos fundacionales de visión en tareas astronómicas.
- Validación de pipelines de preprocesado: su protocolo de evaluación (resize + center crop a 224x224 y normalización ImageNet) permite comprobar la coherencia de transformaciones en cadenas de procesamiento de imágenes.
- Docencia y experimentación: modelo ligero (0,5 GB) y de arquitectura conocida, adecuado para prácticas de ajuste fino y evaluación en visión por computador aplicada a astronomía.
- Despliegue en entornos con recursos limitados: al ser una CNN de 134M de parámetros en fp32, puede ejecutarse en GPU de gama media o incluso en CPU para inferencia por lotes de baja frecuencia.
- Reproducibilidad de resultados: la integridad del checkpoint está verificada (predicciones idénticas en el 100% de las primeras 96 imágenes de test, diferencia máxima de logits de 2,29e-05), lo que facilita su uso como referencia en comparaciones.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, campo `verified: false`), sobre el split de test held-out de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 17 de 30) | 83,65% |
| F1 ponderado (semilla 42, época 17 de 30) | 83,42% |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 83,26% +/- 0,43 |
| F1 ponderado media +/- desviación típica (semillas 42, 1, 2) | 82,97% +/- 0,57 |

No se han publicado en la información disponible resultados comparativos con otros modelos en la misma tabla de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,54 GB solo para pesos (134,3M parámetros x 4 bytes), más activaciones y memoria del framework; en la práctica, menos de 2 GB para lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó con una sola GPU sin especificar modelo. Para inferencia por lotes, una RTX 3090, RTX 4090, A100 o H100 ofrecen margen sobrado.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4060 y superiores) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: PyTorch nativo con torchvision y safetensors (procedimiento documentado por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros backbones del mismo benchmark ni de modelos comparables con métricas sobre Galaxy10 DECaLS. La colección *Vision Foundation Models Benchmark* del mismo autor incluye 40 backbones preentrenados, pero sus resultados individuales no se detallan en esta ficha.

| Modelo | Parametros | Contexto | Accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vgg16-galaxy10-decals-full-v2 | 134.301.514 | no aplica (visión, 224x224 px) | 83,65% | BSD-3-Clause | Hugging Face |
| Otros backbones del benchmark | no disponible | no disponible | no disponible | no disponible | colección del autor |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en clasificación de imágenes de galaxias de Galaxy10 DECaLS; no es un modelo de propósito general ni procesa texto.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Riesgo de degradación fuera de distribución: imágenes con resoluciones, instrumentos o preprocesados distintos del protocolo (resize + center crop a 224x224 y normalización ImageNet) pueden producir predicciones poco fiables.
- Posibles sesgos heredados del conjunto Galaxy10 DECaLS y de los pesos ImageNet-1k originales, no cuantificados en la información disponible.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en clases morfológicamente ambiguas.
- Limitaciones de idioma no aplican; el modelo no tiene componente lingüístico.
- Licencia BSD-3-Clause: permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad; conviene revisar los términos del dataset Galaxy10 DECaLS por separado.
- El artículo asociado está en revisión para *Astronomy and Computing*; la cita definitiva no está disponible aún.
- Solo se documenta una semilla principal (42) con pesos publicados; las semillas 1 y 2 se usan únicamente para media y desviación típica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vgg16-galaxy10-decals-full-v2
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de métricas por época y splits: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (en revisión; sin enlace disponible)
