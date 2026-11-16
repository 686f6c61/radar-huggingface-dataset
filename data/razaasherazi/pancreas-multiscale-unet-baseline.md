# razaasherazi/pancreas-multiscale-unet-baseline

## Resumen

El modelo `razaasherazi/pancreas-multiscale-unet-baseline` es una red neuronal convolucional de segmentación semántica diseñada para la detección y delineación de anomalías pancreáticas (típicamente tumores) en imágenes de tomografía computarizada (CT). Lo desarrolla el usuario de Hugging Face razaasherazi como primer experimento (baseline) de una línea de trabajo sobre imagen médica, y se apoya en la arquitectura Multi-Scale U-Net descrita por Qiu et al. en *Frontiers in Oncology* (2024).

El modelo resuelve una tarea de segmentación binaria píxel a píxel sobre volúmenes CT del dataset público Task07_Pancreas (Medical Segmentation Decathlon), distinguiendo tejido pancreático anómalo del fondo. No es un modelo de lenguaje ni un transformer generativo: es una U-Net multiescala pura de visión por computador, sin capacidades de texto, tool calling ni razonamiento.

Su relevancia es acotada y experimental: se publica como referencia reproducible de un baseline con métricas de validación declaradas (Dice 0.7113, IoU 0.5573, sensibilidad 0.8273, especificidad 0.9976 tras 15 épocas), útil para investigadores que quieran comparar variantes posteriores sobre el mismo dataset. El repositorio ocupa 2,9 GB, coherente con un checkpoint de segmentación 3D o con pesos en precisión completa, aunque el autor no detalla el número de parámetros ni el formato exacto de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multi-Scale U-Net (Qiu et al., Frontiers in Oncology, 2024); CNN encoder-decoder con conexiones skip multiescala |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de imagen médica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 2,9 GB; el autor no especifica safetensors, PyTorch ni otro) |

## Arquitectura y entrenamiento

La arquitectura es una Multi-Scale U-Net, es decir, una U-Net clásica en la que el bloque de extracción de características opera a varias escalas espaciales en paralelo o en cascada, lo que permite capturar tanto estructuras pancreáticas pequeñas como su contexto anatómico circundante. El modelo se entrena para segmentación binaria sobre cortes o volúmenes CT del dataset Task07_Pancreas, con funciones de pérdida habituales en segmentación médica (el autor no detalla la composición exacta de la pérdida ni si combina Dice con entropía cruzada).

El entrenamiento declarado comprende 15 épocas, con una pérdida de entrenamiento final de 0.4780 y una pérdida de validación de 0.5102, sin indicios de sobreajuste severo en las curvas reportadas. No se documenta el número de tokens ni de vóxeles de entrenamiento, la composición exacta del split, el uso de aumentación de datos, ni si hubo ajuste fino posterior o validación cruzada. Tampoco se especifican innovaciones técnicas adicionales como decodificación especulativa o atención lineal, que no aplican a este tipo de modelo.

## Capacidades

- Segmentación semántica de anomalías pancreáticas en imágenes CT, produciendo una máscara binaria píxel a píxel.
- Detección implícita de regiones tumorales mediante la máscara de segmentación (sensibilidad reportada de 0.8273).
- Discriminación de fondo con especificidad muy alta (0.9976), lo que reduce falsos positivos en tejido sano.
- Procesamiento de imágenes médicas 2D o 3D según el pipeline de inferencia que se adopte (el autor no especifica si opera por cortes o por volúmenes completos).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Investigación en segmentación pancreática: sirve como baseline reproducible para comparar arquitecturas o estrategias de aumentación sobre Task07_Pancreas, gracias a métricas de validación declaradas y a un checkpoint público.
- Preprocesado de pipelines de radiómica: la máscara generada puede alimentar la extracción de características de textura y forma del tumor para modelos predictivos posteriores.
- Apoyo a la delineación manual en estudios retrospectivos: el modelo puede proponer una máscara inicial que el radiólogo revise y corrija, reduciendo el tiempo de anotación en cohortes de investigación.
- Docencia y formación en imagen médica: útil para demostrar el flujo completo de una U-Net multiescala sobre datos CT reales del Medical Segmentation Decathlon.
- Evaluación de técnicas de aumento de datos: al ser un baseline con 15 épocas, permite medir la ganancia de estrategias como elastic deformation, mixup o entrenamiento con parches 3D.
- Reproducción de resultados académicos: investigadores que quieran replicar el artículo de Qiu et al. (2024) pueden partir de este checkpoint en lugar de entrenar desde cero.
- Prototipado de sistemas de triaje: con la sensibilidad de 0.8273 y la especificidad de 0.9976 reportadas, puede explorarse como filtro preliminar en estudios de investigación, nunca como dispositivo médico.

## Benchmarks y rendimiento

| Metrica | Valor (epoch 15/15) |
|---|---|
| Best validation Dice | 0.7113 |
| Latest validation Dice | 0.7109 |
| Latest validation IoU | 0.5573 |
| Sensitivity | 0.8273 |
| Specificity | 0.9976 |
| Latest train loss | 0.4780 |
| Latest validation loss | 0.5102 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para una U-Net de segmentación médica típica en FP32 se sitúa habitualmente entre 4 y 12 GB según resolución de entrada y si el procesamiento es 2D por cortes o 3D por volúmenes.
- GPU recomendadas: no especificadas por el autor; por el tamaño del repo (2,9 GB) y la naturaleza de la tarea, una GPU consumer como RTX 3060, RTX 4070 o RTX 4090 es suficiente para inferencia 2D, mientras que el procesamiento 3D completo puede requerir A100 o H100 para lotes grandes.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 (12 GB) o superiores para inferencia por cortes; el dato exacto no está confirmado.
- Opciones de despliegue: PyTorch nativo, TorchServe, ONNX Runtime o MONAI Label son las vías habituales para este tipo de checkpoint; vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Tarea | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pancreas-multiscale-unet-baseline (este) | Multi-Scale U-Net | Segmentación pancreática en CT | Imágenes CT (resolución no especificada) | no disponible | Hugging Face, 0 descargas |
| nnU-Net (Isensee et al.) | U-Net adaptativa auto-configurada | Segmentación médica general | Volúmenes 3D arbitrarios | Apache 2.0 (código) | GitHub, ampliamente adoptado |
| Swin UNETR (MONAI) | Transformer jerárquico con skip CNN | Segmentación médica 3D | Volúmenes 3D | Apache 2.0 (código) | MONAI Model Zoo |
| U-Net original (Ronneberger et al.) | U-Net clásica | Segmentación biomédica 2D | Imágenes 2D | Código público | Múltiples implementaciones |

La comparación cuantitativa con estas alternativas no está disponible en la información proporcionada; los tres modelos de referencia son estándares de la literatura, no necesariamente evaluados sobre el mismo split de Task07_Pancreas.

## Limitaciones y advertencias

- Modelo experimental de un único autor, con 0 descargas y 1 like en el momento de la ficha: no ha pasado por revisión por pares ni validación externa.
- Entrenado solo 15 épocas: es un baseline, no un modelo listo para producción clínica.
- La licencia no está declarada, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue comercial.
- No es un dispositivo médico y no ha pasado validación regulatoria (CE, FDA); su uso en diagnóstico clínico no está autorizado.
- Riesgo de sobreajuste al dataset Task07_Pancreas: la generalización a otras poblaciones, equipos CT o protocolos de adquisición es desconocida.
- La sensibilidad de 0.8273 implica que aproximadamente un 17 % de las lesiones podrían no detectarse en validación, cifra insuficiente para cribado clínico.
- La especificidad de 0.9976 puede estar inflada por el fuerte desbalance de clases típico en segmentación médica (mucho fondo frente a poco tumor); conviene revisar métricas por clase y curvas precisión-recall.
- No se documentan sesgos demográficos, pero el dataset Task07_Pancreas tiene composición limitada y puede no representar diversidad poblacional.
- No se especifica el formato de pesos ni el preprocesado exacto, lo que dificulta la reproducibilidad directa.
- No dispone de model card completa: faltan detalles de entrenamiento, split, aumentación e hiperparámetros.

## Enlaces

- Hugging Face: https://huggingface.co/razaasherazi/pancreas-multiscale-unet-baseline
- Paper de referencia de la arquitectura: Qiu et al., "Multi-Scale U-Net for Pancreatic Tumor Segmentation", Frontiers in Oncology, 2024 (referenciado en la model card; enlace directo no disponible)
- Dataset Task07_Pancreas (Medical Segmentation Decathlon): http://medicaldecathlon.com/
- nnU-Net (referencia comparativa): https://github.com/MIC-DKFZ/nnUNet
- MONAI (framework de imagen médica): https://monai.io/
- Swin UNETR en MONAI Model Zoo: https://github.com/Project-MONAI/model-zoo
