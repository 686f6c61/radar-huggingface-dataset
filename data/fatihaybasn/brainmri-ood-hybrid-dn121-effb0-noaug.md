# Fatihaybasn/brainmri-ood-hybrid-dn121-effb0-noaug

## Resumen

Este modelo es un clasificador binario de imágenes de resonancia magnética cerebral (MRI) que distingue entre presencia y ausencia de tumor. Fue desarrollado por Fatih Aybasan como parte de un proyecto de curso comparativo titulado "Brain MRI Tumor vs No-Tumor - OOD Generalization (10 Models)", cuyo objetivo es evaluar cómo distintas arquitecturas de redes neuronales se comportan ante cambios de distribución (out-of-distribution, OOD) y variaciones de resolución en imágenes médicas.

La arquitectura es un híbrido entre DenseNet121 y EfficientNet-B0, con un total de 11.677.662 parámetros y entrada de 256x256 píxeles. El checkpoint publicado corresponde a la variante entrenada sin aumento de datos (no augmentation), y forma parte de un benchmark de 13 checkpoints que cubre 10 arquitecturas diferentes. El modelo está pensado exclusivamente para investigación y educación, no para diagnóstico clínico, y se distribuye bajo licencia MIT.

La relevancia de este modelo radica en que aborda un problema crítico en imagen médica: la generalización ante cambios de resolución y fuente de adquisición. Los resultados OOD muestran una precisión del 100% en la clase tumor, aunque con una sensibilidad moderada (68,4%), lo que indica un comportamiento conservador con umbral de decisión muy bajo (0.009). El repositorio incluye trazabilidad completa del entrenamiento, métricas por experimento y código fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida DenseNet121 + EfficientNet-B0 |
| Parametros totales | 11.677.662 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | MIT |
| Formato de pesos | Safetensors (tensor-only) |

## Arquitectura y entrenamiento

La arquitectura combina las características de DenseNet121 y EfficientNet-B0 mediante un esquema de fusión híbrido. Aunque la model card no detalla el mecanismo exacto de combinación, el nombre `hybrid_dn121_effb0` sugiere que se concatenan o integran los mapas de características de ambas redes antes de la capa de clasificación final. El modelo tiene 11,7 millones de parámetros, un tamaño moderado que permite su ejecución en hardware de gama media.

El entrenamiento se realizó con 11.500 imágenes de resonancia magnética a resoluciones fijas de 256 y 512 píxeles, sin aplicar aumento de datos (no augmentation). La evaluación externa OOD se llevó a cabo con 3.500 imágenes de resoluciones variables entre 190 y 800 píxeles, lo que introduce un cambio de distribución significativo. No se menciona el uso de técnicas como RLHF o DPO, al tratarse de un problema de clasificación supervisada estándar. El umbral de decisión óptimo se fijó en 0.009, un valor inusualmente bajo que maximiza la precisión (100%) a costa de reducir la sensibilidad.

## Capacidades

- Clasificación binaria de imágenes MRI cerebrales en dos clases: `no_tumor` (0) y `tumor` (1).
- Detección de presencia de tumor, sin capacidad de identificar tipo, localización, grado ni pronóstico.
- Generalización a imágenes con resoluciones diferentes a las del entrenamiento (190-800 px), aunque con degradación de rendimiento.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No es un modelo multimodal ni generativo; su única entrada son imágenes y su salida es una probabilidad.

## Casos de uso

- Investigación académica en generalización OOD: el modelo sirve como punto de referencia para estudiar cómo las arquitecturas híbridas se comportan ante cambios de resolución y distribución en imagen médica.
- Benchmark de arquitecturas: al pertenecer a un conjunto de 10 modelos comparados bajo las mismas condiciones, es útil para evaluar el rendimiento relativo de DenseNet121, EfficientNet-B0 y sus combinaciones.
- Desarrollo de pipelines de preprocesado: permite probar estrategias de normalización de resolución y su impacto en la clasificación.
- Formación y docencia: su código y configuración están publicados, lo que facilita su uso en cursos de deep learning aplicado a medicina.
- Experimentación con umbrales de decisión: el umbral de 0.009 ofrece un caso práctico de calibración para priorizar precisión frente a sensibilidad.
- Auditoría de sesgos en modelos médicos: el repositorio documenta limitaciones y posibles sesgos, sirviendo como material de análisis crítico.

## Benchmarks y rendimiento

Los resultados corresponden a la evaluación externa OOD con 3.500 imágenes. Se presentan las métricas del checkpoint publicado junto con el resto del benchmark para contexto comparativo.

| Experimento | Accuracy | AUC | F1 | Recall | Precision | Kappa |
|---|---:|---:|---:|---:|---:|---:|
| **hybrid_dn121_effb0_noaug (este modelo)** | **0.839** | **0.939** | **0.812** | **0.684** | **1.000** | **0.680** |
| custom_msaf_effb0_0.3_augmentation | 0.908 | 0.988 | 0.901 | 0.822 | 0.998 | 0.817 |
| hybrid_dn121_effb0_0.3_augmentation | 0.861 | 0.967 | 0.841 | 0.726 | 1.000 | 0.723 |
| custom_msaf_effb0_noaug | 0.805 | 0.936 | 0.764 | 0.618 | 0.999 | 0.613 |
| hybrid_swinT_effb0_0.3_augmentation | 0.795 | 0.975 | 0.748 | 0.599 | 0.997 | 0.593 |
| resnet34_noaug | 0.794 | 0.954 | 0.747 | 0.596 | 0.999 | 0.591 |
| densenet121 | 0.785 | 0.984 | 0.732 | 0.578 | 1.000 | 0.573 |
| convnext_tiny | 0.775 | 0.960 | 0.716 | 0.557 | 1.000 | 0.553 |
| hybrid_swinT_effb0_noaug | 0.745 | 0.956 | 0.665 | 0.498 | 1.000 | 0.494 |
| resnet50_noaug | 0.719 | 0.962 | 0.619 | 0.448 | 1.000 | 0.444 |
| inception_v3_noaug | 0.710 | 0.901 | 0.602 | 0.430 | 1.000 | 0.426 |
| efficientnet_b0 | 0.693 | 0.903 | 0.568 | 0.397 | 0.997 | 0.392 |
| mobilenetv2_100_noaug | 0.639 | 0.889 | 0.450 | 0.290 | 1.000 | 0.286 |

El modelo ocupa la tercera posición en accuracy dentro del benchmark, superado por las variantes con aumento de datos. Su precisión perfecta en la clase tumor indica que cuando predice tumor, acierta siempre, pero su sensibilidad limitada implica que muchos tumores reales no son detectados.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 (11,7 millones de parámetros, entrada 256x256). Cabe en cualquier GPU comercial desde 2016.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). También puede ejecutarse en CPU con razonable latencia.
- Compatible con GPUs de consumo: sí, incluidas tarjetas integradas con suficiente memoria.
- Opciones de despliegue: PyTorch con safetensors, librería timm. No se han publicado configuraciones para vLLM, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia estimada: no disponible, pero al ser una red convolucional de tamaño medio, la inferencia en GPU moderna debería ser inferior a 10 ms por imagen.

## Comparativa con modelos similares

El benchmark del propio proyecto proporciona comparaciones directas con arquitecturas estándar y otras híbridas bajo las mismas condiciones de entrenamiento y evaluación OOD.

| Modelo | Parametros | Accuracy OOD | AUC OOD | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| **hybrid_dn121_effb0_noaug (este)** | 11,7 M | 0.839 | 0.939 | MIT | HuggingFace |
| densenet121 | 8,0 M aprox. | 0.785 | 0.984 | MIT | HuggingFace (checkpoint) |
| efficientnet_b0 | 5,3 M aprox. | 0.693 | 0.903 | MIT | HuggingFace (checkpoint) |
| resnet34_noaug | 21,3 M aprox. | 0.794 | 0.954 | MIT | HuggingFace (checkpoint) |
| hybrid_swinT_effb0_noaug | no disponible | 0.745 | 0.956 | MIT | HuggingFace (checkpoint) |

La comparativa muestra que el híbrido DenseNet121 + EfficientNet-B0 supera a sus componentes individuales en accuracy, aunque con un AUC ligeramente inferior al de DenseNet121 puro. La variante con aumento de datos del mismo híbrido alcanza mejores resultados (0.861 accuracy), lo que sugiere que la ausencia de aumento limita el potencial del modelo.

## Limitaciones y advertencias

- Clasificación binaria exclusiva: no identifica tipo de tumor, localización, grado ni pronóstico.
- Rendimiento OOD medido en un conjunto específico del proyecto; puede no transferirse a poblaciones clínicas o protocolos de adquisición distintos.
- Riesgo de sesgos por el dataset de entrenamiento: variaciones en la fuente de imágenes, artefactos y posible fuga de sujetos pueden afectar los resultados.
- Umbral de decisión extremadamente bajo (0.009) implica que el modelo clasifica casi cualquier imagen como tumor si la probabilidad supera ese valor; en la práctica, esto produce una precisión del 100% pero una sensibilidad del 68%, lo que puede no ser adecuado para cribado clínico.
- Sin validación clínica ni revisión regulatoria: no debe usarse para diagnóstico ni toma de decisiones médicas.
- No se han publicado detalles sobre el dataset de entrenamiento (procedencia, equilibrio de clases, etc.), lo que limita la reproducibilidad externa.
- La licencia MIT permite uso comercial, pero el autor declara explícitamente que el uso es solo para investigación y educación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fatihaybasn/brainmri-ood-hybrid-dn121-effb0-noaug
- Repositorio del proyecto (notebooks, informes, métricas): https://github.com/fatihaybsn/BrainMRI-OOD-10Models
- Commit de referencia: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/commit/a9920408189230b886773a64d113eb35bcba1971
- Archivo de citación: https://github.com/fatihaybsn/BrainMRI-OOD-10Models/blob/main/CITATION.cff
