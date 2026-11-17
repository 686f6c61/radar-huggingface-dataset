# hadeelbkh/sitr-hijab-densenet121

## Resumen

SITR Hijab Classifier es un modelo de clasificación binaria de imágenes desarrollado por hadeelbkh (Hadeel Bkhaitan) que predice si una mujer en una fotografía lleva hiyab o no. Forma parte de SITR, un sistema de compartición de imágenes con conciencia de identidad y preservación de la privacidad descrito en un artículo publicado en el *International Journal of Advanced Computer Science and Applications* (IJACSA) en 2026. El modelo constituye la tercera etapa de ese sistema: tras la detección de rostros con MTCNN y la verificación de identidad mediante embeddings de FaceNet, este clasificador decide si debe difuminarse el rostro y el cuello antes de compartir la imagen.

Técnicamente es un DenseNet121 preentrenado en ImageNet (checkpoint `timm/densenet121.tv_in1k`) con la cabeza de clasificación sustituida por `Dropout(0.3) → Linear(1024, 1)`, lo que da un total de 7.038.529 parámetros. La salida es un único logit cuya sigmoide representa P(no hiyab). El modelo se entrenó sobre un dataset propio de 2.191 imágenes y alcanza un 92,16 % de accuracy y un ROC-AUC de 0,967 en el conjunto de test.

Su relevancia es acotada pero clara: es un componente de un pipeline mayor de privacidad, publicado con licencia MIT, pesos en safetensors y código de inferencia reproducible. No es un modelo de propósito general ni compite con los grandes modelos multimodales, sino una pieza especializada y ligera para una tarea de visión concreta con implicaciones culturales y de privacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DenseNet121 (CNN con conexiones densas), cabeza `Dropout(0.3) → Linear(1024, 1)` |
| Parámetros totales | 7.038.529 (~7,0 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224×224 RGB) |
| Tipos de cuantización | no disponible (pesos publicados en fp32; compatible con cuantización estándar de PyTorch/torchvision) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente textual) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, 28 MB, fp32) |

## Arquitectura y entrenamiento

La arquitectura es una DenseNet121 estándar de torchvision, inicializada con pesos de ImageNet (`timm/densenet121.tv_in1k`). Cada bloque denso concatena las salidas de todas las capas anteriores, lo que favorece la reutilización de características y mantiene un número de parámetros bajo para su profundidad. La cabeza original de 1.000 clases se reemplaza por un dropout del 30 % seguido de una capa lineal de 1.024 a 1 salida. La entrada es RGB redimensionada a 224×224 con normalización ImageNet (media `[0.485, 0.456, 0.406]`, desviación `[0.229, 0.224, 0.225]`).

El entrenamiento se realizó sobre el SITR Hijab Dataset limpiado: 2.191 imágenes (1.248 de entrenamiento, 63 de validación y 880 de test; 1.236 con hiyab y 955 sin hiyab). Se usó Adam con `BCEWithLogitsLoss`, tasa de aprendizaje 1e-5, weight decay 1e-6, batch size 4 y un máximo de 20 épocas, conservando el mejor checkpoint por validación (el publicado corresponde a la época 8). No se aplicó aumento de datos, solo redimensionado y normalización. Los hiperparámetros se seleccionaron mediante búsqueda en rejilla sobre 19 configuraciones. El hardware de entrenamiento fue una NVIDIA T4 en Google Colab. El artículo también evalúa una variante con atención ECA, que superó a la línea base sin ajustar pero quedó por debajo del DenseNet121 ajustado que se publica aquí.

## Capacidades

- Clasificación binaria de imágenes: predice hiyab (etiqueta 0) frente a no hiyab (etiqueta 1) a partir de una imagen RGB de 224×224.
- Salida probabilística calibrable: devuelve un logit cuya sigmoide es P(no hiyab), lo que permite ajustar el umbral de decisión según el coste de los errores.
- Integración en pipelines de privacidad: diseñado para ejecutarse solo sobre rostros previamente detectados y verificados como familiares.
- Inferencia ligera: ~7 M de parámetros y 28 MB de pesos permiten ejecución en CPU o GPU modesta.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni capacidades multilingües.
- No dispone de modo *thinking* ni de generación de texto.

## Casos de uso

- Filtrado automático en aplicaciones de compartición familiar: el modelo se ejecuta tras la detección de rostros y la verificación de identidad para decidir si debe difuminarse el rostro y el cuello de una familiar antes de publicar la foto; su ROC-AUC de 0,967 permite fijar umbrales conservadores.
- Módulo de privacidad en plataformas de álbumes compartidos: integrado como etapa 3 de SITR, evita exponer imágenes de familiares sin hiyab en contextos donde ello sería culturalmente inapropiado.
- Preprocesado por lotes en servidores modestos: con 7 M de parámetros y pesos de 28 MB, puede procesar lotes en CPU o en una GPU de gama de entrada sin infraestructura dedicada.
- Investigación en visión por computador culturalmente sensible: sirve como línea base reproducible (licencia MIT, código de inferencia incluido) para comparar arquitecturas en esta tarea concreta.
- Prototipado rápido de clasificadores binarios de atributos: su pipeline de carga con `torchvision` + `safetensors` y su script `inference.py` facilitan la experimentación.
- Auditoría de sesgos en sistemas de moderación de imágenes: permite medir tasas de falsos negativos en el subconjunto crítico (no hiyab clasificado como hiyab) y ajustar umbrales (0,5 → 0,3 → 0,2) según la política de privacidad.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test (880 imágenes), no verificados de forma independiente:

| Modelo | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|
| ResNet50 (baseline) | 75,63 | 60,91 | 77,89 | 66,52 |
| MobileNetV2 (baseline) | 73,18 | 55,87 | 60,36 | 57,84 |
| EfficientNet-B0 (baseline) | 78,69 | 67,63 | 60,73 | 64,95 |
| DenseNet121 (baseline) | 79,49 | 73,48 | 62,69 | 65,67 |
| DenseNet121 + ECA (sin ajustar) | 86,62 | 79,91 | 74,91 | 77,32 |
| **DenseNet121 ajustado (este modelo)** | **92,16** | **91,63** | **81,72** | **86,39** |

Métricas adicionales del checkpoint publicado (recalculadas desde los pesos): ROC-AUC 0,967; precisión/recall/F1 por clase: hiyab 92,36 / 96,73 / 94,49; no hiyab 91,63 / 81,72 / 86,39; macro F1 90,44. Matriz de confusión (filas = real, columnas = predicho): hiyab→hiyab 592, hiyab→no hiyab 20, no hiyab→hiyab 49, no hiyab→no hiyab 219.

Ajuste de umbral sobre P(no hiyab):

| Umbral | Accuracy | Precision no hiyab | Recall no hiyab |
|---|---|---|---|
| 0,5 (por defecto) | 92,16 | 91,63 | 81,72 |
| 0,3 | 92,05 | 87,50 | 86,19 |
| 0,2 | 91,14 | 83,69 | 88 (dato truncado en la información disponible) |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para un batch pequeño; el modelo ocupa 28 MB en disco.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor entrenó en una NVIDIA T4. Funciona también en CPU.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluidas series 20xx, 30xx, 40xx) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: PyTorch + torchvision + safetensors (vía oficial documentada); exportable a TorchScript u ONNX para servir con ONNX Runtime; no se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **SITR Hijab DenseNet121** | ~7,0 M | 224×224 RGB | 92,16 | MIT | Hugging Face |
| DenseNet121 baseline (mismo dataset) | ~7,0 M | 224×224 RGB | 79,49 | MIT (torchvision) | torchvision |
| DenseNet121 + ECA (sin ajustar) | ~7,0 M | 224×224 RGB | 86,62 | MIT | no publicada como checkpoint |
| EfficientNet-B0 baseline | ~5,3 M | 224×224 RGB | 78,69 | Apache 2.0 (timm) | timm |
| ResNet50 baseline | ~25,6 M | 224×224 RGB | 75,63 | BSD-3 (torchvision) | torchvision |

La comparación se limita a las líneas base evaluadas en el propio artículo; no se dispone de otros clasificadores públicos específicos de detección de hiyab en la información proporcionada.

## Limitaciones y advertencias

- El error crítico para la privacidad es clasificar una imagen sin hiyab como con hiyab (49 de 268, un 18,3 % en test), ya que esa imagen se trataría como segura para compartir. Bajar el umbral a 0,3 o 0,2 reduce estos falsos negativos a costa de precisión.
- El conjunto de test es pequeño (880 imágenes) y proviene del mismo dataset que el entrenamiento; no hay validación externa ni verificación independiente de las métricas (`verified: false`).
- El conjunto de validación es muy reducido (63 imágenes), lo que hace frágil la selección de checkpoint.
- No se aplicó aumento de datos, lo que puede limitar la generalización a condiciones de iluminación, pose, resolución o estilo de hiyab distintos.
- Riesgo de sesgo demográfico y cultural: el dataset no está descrito en composición étnica ni geográfica en la información disponible; el modelo puede fallar en poblaciones subrepresentadas.
- Uso sensible: la clasificación automática de atributos religiosos o culturales sobre personas plantea riesgos éticos y legales en algunas jurisdicciones; debe emplearse solo en el contexto previsto (filtrado de privacidad con consentimiento) y con supervisión humana.
- Licencia MIT permite uso comercial, pero no exime del cumplimiento de normativas de protección de datos (RGPD y similares) al procesar imágenes de personas.
- No apto para tareas fuera de la clasificación binaria de hiyab; no procesa texto ni mantiene contexto conversacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hadeelbkh/sitr-hijab-densenet121
- Dataset: https://huggingface.co/datasets/hadeelbkh/sitr-hijab-dataset
- Código: https://github.com/hadeelbkh/hijab-detection
- Demo (Space): https://huggingface.co/spaces/hadeelbkh/sitr-hijab-detection
- Artículo (IJACSA, vol. 17, nº 4, 2026): https://thesai.org/Publications/ViewPaper?Volume=17&Issue=4&Code=IJACSA&SerialNo=88
- Modelo base: https://huggingface.co/timm/densenet121.tv_in1k
