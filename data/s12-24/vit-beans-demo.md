# S12-24/vit-beans-demo

## Resumen

vit-beans-demo es un modelo de clasificación de imágenes publicado en HuggingFace por el usuario S12-24. Se trata de un ajuste fino (fine-tuning) del modelo google/vit-base-patch16-224-in21k, un Vision Transformer de tipo base con parches de 16x16 y entrada de 224x224 píxeles. Los pesos safetensors del repositorio suman 85.800.963 parámetros y el repositorio ocupa 1,7 GB. La licencia declarada es Apache 2.0 y la librería de referencia es transformers.

El modelo se distribuye con la etiqueta generated_from_trainer y con compatibilidad declarada para endpoints de inferencia. La model card indica que se entrenó sobre un conjunto de datos no especificado ("on an unknown dataset") y reporta una pérdida de validación de 0,1467 y una exactitud (accuracy) de 0,9688 en el conjunto de evaluación. No se documentan las clases de salida, el número de ejemplos, el origen de las imágenes ni el dominio de aplicación real.

Su relevancia es limitada y de carácter demostrativo: acumula 0 descargas y 0 "likes", carece de documentación sustancial ("More information needed" en todas las secciones) y no publica resultados de benchmarks comparativos. Resulta útil principalmente como plantilla reproducible de fine-tuning de un ViT con HuggingFace Trainer y como posible punto de partida para tareas de clasificación de imágenes en el ámbito agrícola, dado el nombre "beans" (judías), si bien esto no se confirma en ninguna parte de la ficha oficial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) de tipo base, parches de 16x16; fine-tuning de google/vit-base-patch16-224-in21k |
| Parámetros totales | 85.800.963 (según los pesos safetensors del repositorio) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; clasificación de imágenes con entrada de 224x224 píxeles según el identificador del modelo base |
| Tipos de cuantización | No disponible (el repositorio no declara versiones cuantizadas) |
| Idiomas soportados | No aplica / no disponible (modelo de visión sin componente textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Tarea (pipeline) | image-classification |
| Clases de salida | No disponible |
| Modelo base | google/vit-base-patch16-224-in21k |
| Tamaño del repositorio | 1,7 GB |
| Fecha de creación / actualización | 2026-09-15 / 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar: la imagen de entrada se divide en parches de 16x16 píxeles que se proyectan linealmente y se procesan mediante un codificador transformer con atención global, seguido de una cabeza de clasificación. El modelo base, google/vit-base-patch16-224-in21k, fue preentrenado en ImageNet-21k (de ahí el sufijo "in21k" del identificador), lo que le proporciona representaciones visuales genéricas que el fine-tuning adapta a la tarea concreta. No se detalla en la model card si la cabeza de clasificación se reinicializó, cuántas clases tiene ni qué resolución efectiva de entrada se usó durante el ajuste.

El entrenamiento se realizó con HuggingFace Trainer durante 4 épocas, con un total de 260 pasos (65 pasos por época), batch de 16 tanto en entrenamiento como en evaluación, learning rate de 5e-5, optimizador AdamW (variante fused) con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con warmup del 10 %, y semilla 42. Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1. No se menciona composición del dataset, número de ejemplos, técnicas de aumento de datos, ni fases de RLHF o DPO (no aplicables a un clasificador). No se declara ninguna innovación técnica adicional (atención lineal, decodificación especulativa u otras).

## Capacidades

- Clasificación de imágenes: asignación de una etiqueta a una imagen de entrada de 224x224 píxeles, con una única salida de logits sobre un conjunto de clases no especificado.
- Transfer learning: al derivar de un ViT preentrenado en ImageNet-21k, puede reutilizarse como inicialización para fine-tuning en otros dominios visuales.
- Despliegue en endpoints: la etiqueta endpoints_compatible indica compatibilidad con el servicio de Inference Endpoints de HuggingFace.
- Integración con el ecosistema transformers: uso directo mediante pipeline("image-classification") o AutoModelForImageClassification.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multimodales de entrada/salida de lenguaje.
- No soporta tool calling, function calling, uso como agente ni razonamiento multi-paso.
- No dispone de modo "thinking", ni de capacidades de audio, vídeo o visión-lenguaje.
- El soporte multilingüe no aplica al no existir componente textual.

## Casos de uso

- Clasificación de imágenes de hojas de cultivo en agricultura de precisión: el modelo puede etiquetar imágenes capturadas con cámara o móvil para categorizar el estado de la planta, siempre que la taxonomía de clases del dataset de entrenamiento coincida con la del escenario real (dato no disponible).
- Pre-etiquetado asistido de datasets: dado su bajo coste computacional (85,8 M de parámetros), puede usarse como anotador preliminar de grandes lotes de imágenes, dejando la revisión humana para los casos de baja confianza.
- Prototipado rápido y docencia: sirve como ejemplo reproducible de fine-tuning de un ViT con Trainer, con hiperparámetros documentados (4 épocas, lr 5e-5, batch 16) y versiones de framework registradas.
- Punto de partida para fine-tuning específico: al ser un ViT base con licencia Apache 2.0, puede reentrenarse con nuevas clases sobre un conjunto propio sin restricciones de licencia del modelo.
- Triaje en pipelines de inspección visual en campo: integrado en un sistema que capture imágenes con dron o cámara fija, puede priorizar qué muestras requieren inspección agronómica detallada.
- Validación de calidad en línea de envasado o clasificación de producto: aplicable si las clases aprendidas corresponden a categorías de producto; requiere verificar previamente las clases reales del modelo.
- Servicio de inferencia ligero en endpoints: desplegable en HuggingFace Inference Endpoints o en servidores propios con CPU, ya que el modelo cabe holgadamente en memoria convencional.

## Benchmarks y rendimiento

El model-index del repositorio no contiene resultados: la lista "results" está vacía, por lo que no se han publicado resultados de benchmarks comparativos (MMLU, ImageNet, etc.) en la información disponible.

El autor únicamente reporta métricas de evaluación del propio entrenamiento. El resultado final declarado es: pérdida de validación 0,1467 y exactitud 0,9688. La evolución por épocas documentada en la model card es la siguiente:

| Época | Paso | Pérdida de entrenamiento | Pérdida de validación | Exactitud |
|---|---|---|---|---|
| 1,0 | 65 | 0,2884 | 0,2054 | 0,9699 |
| 2,0 | 130 | 0,1449 | 0,1170 | 0,9624 |
| 3,0 | 195 | 0,1006 | 0,1642 | 0,9624 |
| 4,0 | 260 | 0,1171 | 0,1029 | 0,9699 |

Advertencia metodológica: se desconoce el tamaño del conjunto de evaluación, el número de clases y si el reparto de datos es representativo, por lo que la exactitud de ~0,97 no es extrapolable a otros dominios.

## Requisitos de hardware

- Memoria de pesos en FP32: aproximadamente 343 MB (85,8 M de parámetros x 4 bytes).
- Memoria de pesos en FP16/BF16: aproximadamente 172 MB.
- Memoria de pesos en int8: aproximadamente 86 MB.
- VRAM total estimada para inferencia: menos de 1 GB con batch pequeño, sumando pesos y activaciones de una imagen de 224x224.
- Cabe sin problema en GPU de consumo: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o más de VRAM.
- Ejecutable en CPU: sí, con latencias del orden de decenas de milisegundos por imagen en procesadores modernos (no se publican cifras concretas).
- GPU de centro de datos (A100, H100, L40S) no son necesarias; solo tendrían sentido para lotes muy grandes o entrenamiento.
- Opciones de despliegue: pipeline de transformers (PyTorch), exportación a ONNX/ONNX Runtime mediante Optimum, TorchScript, NVIDIA Triton Inference Server, TorchServe y HuggingFace Inference Endpoints (etiqueta endpoints_compatible).
- No hay soporte documentado para vLLM (orientado a modelos generativos), ni pesos GGUF, por lo que llama.cpp y Ollama no son aplicables en su estado actual.
- Throughput y latencia concretos: no disponibles (no se publican mediciones).

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados para este modelo, y la model card no ofrece datos del dataset que permitan una comparación justa. La siguiente tabla recoge únicamente la información disponible:

| Modelo | Parámetros | Entrada | Licencia | Rendimiento declarado | Disponibilidad |
|---|---|---|---|---|---|
| S12-24/vit-beans-demo | 85.800.963 | 224x224 píxeles | Apache 2.0 | Exactitud 0,9688 y pérdida 0,1467 en validación (dataset desconocido) | Repositorio HuggingFace, 0 descargas |
| google/vit-base-patch16-224-in21k (modelo base) | No disponible en la información proporcionada (es la referencia del fine-tuning) | 224x224 píxeles | No disponible en la información proporcionada | No disponible; es un checkpoint preentrenado, no un clasificador final de tarea específica | Público en HuggingFace |
| Alternativas de clasificación de imágenes de tamaño similar (por ejemplo, otras familias ViT/CNN de ~85 M de parámetros) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la búsqueda web modelos comparables de la misma categoría ni resultados que permitan situar este fine-tuning frente a alternativas.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "on an unknown dataset", por lo que no se puede verificar el dominio, el número de clases, el equilibrio entre clases ni la calidad de las anotaciones.
- Métricas no contextualizadas: la exactitud de 0,9688 corresponde a un conjunto de evaluación de tamaño y composición no publicados; no es extrapolable a datos reales.
- Ausencia de validación comunitaria: 0 descargas y 0 "likes" en el momento de la consulta, y fechas de creación y actualización el mismo día (2026-09-15), lo que sugiere un experimento de demostración sin revisión externa.
- Riesgo de sobreajuste al dominio de captura: al no documentarse el origen de las imágenes, es probable que el modelo sea sensible a condiciones de iluminación, fondo, resolución o cámara distintas de las del entrenamiento.
- Sesgos potenciales: imposibles de evaluar sin conocer la distribución del dataset; cabe esperar sesgos de muestreo geográfico, de variedad de cultivo o de condiciones de captura.
- Alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en imágenes fuera de la distribución de entrenamiento (comportamiento típico de los clasificadores softmax).
- Documentación incompleta: las secciones de descripción, usos previstos, limitaciones y datos de entrenamiento figuran como "More information needed".
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero la procedencia de las imágenes de entrenamiento es desconocida, lo que traslada un riesgo legal no resuelto al usuario que lo explote comercialmente.
- Ausencia de versiones cuantizadas o formatos alternativos (GGUF, ONNX preexportado) en el repositorio, lo que obliga a realizar la conversión por cuenta propia.
- Idiomas: no aplica, al ser un modelo puramente visual.
- No apto como componente de sistemas generativos, agentes o asistentes conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/S12-24/vit-beans-demo
- Modelo base: https://huggingface.co/google/vit-base-patch16-224-in21k
- Paper de referencia de ViT (no citado en la model card, referencia general de la arquitectura): no disponible en la información proporcionada
- Repositorio de código, demo o blog del autor: no disponible
- La búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los enlaces obtenidos corresponden a servicios educativos sin relación con el modelo.
