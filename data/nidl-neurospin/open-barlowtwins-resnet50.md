# nidl-neurospin/open-barlowtwins-resnet50

## Resumen

Open-BarlowTwins ResNet-50 es un modelo fundacional auto-supervisado para resonancia magnética cerebral 3D, desarrollado por el equipo de nidl (NeuroSpin) y publicado bajo licencia CC-BY 4.0. Se trata de un encoder ResNet-50 adaptado a volúmenes 3D y entrenado con el método Barlow Twins sobre imágenes de RM cuasi-crudas (T1w, T2w y FLAIR) del dataset abierto OpenMind. Su propósito es servir como extractor de características genéricas para neuroimagen, de forma que tareas posteriores (regresión de edad, clasificación de patologías, segmentación) puedan resolverse con cabezas ligeras sobre características congeladas.

El modelo resuelve un problema clásico en neuroimagen: la escasez de datos etiquetados y la dificultad de comparar métodos de aprendizaje auto-supervisado bajo condiciones reproducibles. Al liberar datos, código, receta de entrenamiento y pesos, nidl permite reproducir el modelo, comparar nuevas propuestas contra una línea base pública y reutilizar el encoder en pipelines propios. Con 63 millones de parámetros totales (50,4 M en el encoder), 2048 dimensiones de características y una entrada de 128³ vóxeles, es un modelo compacto y manejable en una sola GPU.

Su relevancia actual radica en la tendencia hacia modelos fundacionales en imagen médica: encoders preentrenados que se reutilizan en múltiples tareas con ajuste mínimo. La evaluación publicada sobre OpenBHB (MAE de 4,12 años en predicción de edad con regresión ridge sobre características congeladas) lo sitúa como referencia práctica para experimentación en neuroimagen estructural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 3D (encoder convolucional) con método de preentrenamiento Barlow Twins |
| Parametros totales | 63.005.888 (encoder 50,4 M + cabeza de proyección) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D; entrada 1 × 128 × 128 × 128) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | CC-BY 4.0 |
| Formato de pesos | safetensors |
| Dimension de caracteristicas | 2048 |
| Entrada esperada | volumen 182 × 218 × 182 (MNI152 a 1 mm), preprocesado a 128³ |
| Libreria | nidl (`pip install nidl[pretrained]`) |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder ResNet-50 tridimensional entrenado con Barlow Twins, un método auto-supervisado que reduce la redundancia entre las representaciones de dos vistas aumentadas de la misma imagen. La pérdida empuja la matriz de correlación cruzada entre embeddings hacia la identidad, evitando el colapso de representaciones sin necesidad de pares negativos ni de un banco de memoria. El estimador concreto es `nidl.estimators.ssl.BarlowTwins`, que incluye el encoder y una cabeza de proyección; los pesos publicados contienen ambos, lo que permite continuar el preentrenamiento o hacer fine-tuning.

El preentrenamiento se realizó sobre el split de entrenamiento de OpenMind: 63.992 volúmenes cuasi-crudos T1w, T2w y FLAIR de 31.775 participantes procedentes de 787 datasets de OpenNeuro. Las imágenes están skull-stripped, corregidas en bias field y registradas linealmente a MNI152 a 1 mm. Se entrenó durante 100 épocas (999 pasos por época) en una única NVIDIA H100, con lotes de 64 imágenes y precisión `bf16-mixed`, usando AdamW (lr 0,0001, weight decay 0,0005), warmup lineal de 10 épocas desde 1e-06 y decaimiento coseno posterior. El preprocesado incluye `Resize` a 121 × 145 × 121, `CropOrPad` a 128³ y `ZNormalization`.

## Capacidades

- Extracción de características de RM cerebral estructural 3D: genera embeddings de 2048 dimensiones para volúmenes T1w, T2w y FLAIR.
- Aprendizaje auto-supervisado sin etiquetas: las características sirven para tareas posteriores con cabezas ligeras (regresión, clasificación) sobre el encoder congelado.
- Soporte de fine-tuning: los pesos incluyen la cabeza de proyección, lo que permite reanudar el preentrenamiento o ajustar el modelo a una tarea concreta.
- Preprocesado integrado: `model.get_preprocessing()` aplica resize, crop/pad y normalización de forma consistente con el entrenamiento.
- Procesamiento de volúmenes completos a resolución 1 mm (entrada nativa 182 × 218 × 182).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual de extracción de características.
- No tiene capacidades multilingües ni de audio.

## Casos de uso

- Predicción de edad cerebral: regresión ridge o MLP sobre las características congeladas del encoder; el propio autor reporta MAE de 4,12 años en OpenBHB, lo que lo hace directamente utilizable como línea base en estudios de envejecimiento.
- Clasificación de patologías neurológicas: extraer embeddings de cohortes clínicas (Alzheimer, esclerosis múltiple, epilepsia) y entrenar clasificadores ligeros con pocas etiquetas, aprovechando que el encoder ya ha aprendido representaciones anatómicas genéricas.
- Búsqueda y recuperación de imágenes similares: indexar los vectores de 2048 dimensiones de una base de estudios y recuperar casos anatómicamente parecidos por similitud coseno para revisión o control de calidad.
- Preentrenamiento inicial para segmentación: usar el encoder como backbone congelado o parcialmente ajustado en arquitecturas tipo U-Net para segmentación de estructuras cerebrales o lesiones, reduciendo la necesidad de datos anotados.
- Armonización y control de calidad de datos: detectar outliers o escaneos con artefactos comparando la distribución de embeddings frente a una cohorte de referencia.
- Investigación reproducible en SSL médico: servir como línea base pública para comparar nuevos métodos auto-supervisados bajo la misma receta, datos y preprocesado, algo poco habitual en neuroimagen.
- Extracción de biomarcadores para estudios longitudinales: generar representaciones compactas por visita que alimenten modelos de trayectoria clínica sin reentrenar el encoder.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Prediccion de edad (ridge sobre caracteristicas congeladas) | OpenBHB test (757 participantes) | MAE | 4,12 anos |
| Prediccion de edad (ridge sobre caracteristicas congeladas) | OpenBHB test (757 participantes) | R² | 0,71 |

No se han publicado en la informacion disponible resultados en benchmarks genericos tipo MMLU, HumanEval o GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder tiene 50,4 M parámetros; en fp32 ocupa unos 0,2 GB de pesos y en bf16 unos 0,1 GB. Con lotes pequeños y activaciones 3D, la inferencia cabe holgadamente en GPUs de 8-12 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia (RTX 3060/4060, RTX 4090, A100, H100). El entrenamiento original se hizo en una H100 con lotes de 64 y precisión `bf16-mixed`.
- Cabe en GPU de consumo: sí, en tarjetas de 8 GB o más para inferencia; el fine-tuning completo requiere más memoria por las activaciones 3D y el tamaño de lote.
- Opciones de despliegue: la librería nidl sobre PyTorch (`BarlowTwins.from_pretrained` y `model.transform(loader)`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Preentrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Open-BarlowTwins ResNet-50 (este) | 63,0 M (50,4 M encoder) | 128³ vóxeles | Barlow Twins sobre OpenMind | CC-BY 4.0 | Pesos, datos y receta públicos |
| Otros modelos SSL de RM 3D de nidl | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de la literatura (p. ej. encoders SSL preentrenados en UK Biobank u otros datasets) | no disponible | no disponible | no disponible | habitualmente no abiertas | no disponible |

No se dispone en la información proporcionada de datos comparativos verificables con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Modelo específico de RM cerebral estructural: no está diseñado para otras modalidades (TC, PET, RM funcional) ni para otras regiones anatómicas.
- Requiere un preprocesado estricto (skull-stripping, corrección de bias field, registro lineal a MNI152 a 1 mm); desviarse de él degrada las características.
- No genera texto ni tiene interfaz conversacional: es un extractor de características, no un modelo generativo.
- Riesgo de sesgo poblacional: OpenMind agrega 787 datasets de OpenNeuro con composición demográfica heterogénea y no controlada; el rendimiento puede variar en cohortes clínicas o poblaciones subrepresentadas.
- La evaluación publicada se limita a predicción de edad en OpenBHB; no hay validación documentada en tareas clínicas como diagnóstico de patologías.
- Licencia CC-BY 4.0: permite uso comercial con atribución, pero las imágenes de OpenMind conservan las licencias de sus datasets de OpenNeuro de origen, lo que puede imponer restricciones adicionales si se redistribuyen datos.
- Alucinación no aplica en el sentido generativo, pero las predicciones aguas abajo pueden ser erróneas si el encoder se aplica fuera de su dominio de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios todavía muy reducido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nidl-neurospin/open-barlowtwins-resnet50
- Dataset OpenMind: https://huggingface.co/datasets/neurospin/openmind
- Receta de preentrenamiento: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_open_models_pretraining.html
- Documentación de nidl: https://neurospin-deepinsight.github.io/nidl
- Ejemplo de evaluación en OpenBHB: https://neurospin-deepinsight.github.io/nidl/auto_examples/plot_pretrained_openbhb.html
- Repositorio de nidl: https://github.com/neurospin-deepinsight/nidl
- Paper OpenMind (ICCV 2025): https://arxiv.org/abs/2507.11571 (referencia de la cita; enlace no verificado en la información proporcionada)
- Paper Barlow Twins (ICML 2021): https://arxiv.org/abs/2103.03230 (referencia de la cita; enlace no verificado en la información proporcionada)
- Licencia CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/
