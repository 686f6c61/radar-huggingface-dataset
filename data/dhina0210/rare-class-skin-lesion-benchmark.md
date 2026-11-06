# dhina0210/rare-class-skin-lesion-benchmark

## Resumen

`rare-class-skin-lesion-benchmark` es un repositorio de Hugging Face publicado por el usuario `dhina0210` que contiene un clasificador de imágenes dermatoscópicas basado en EfficientNet-B0, ajustado para clasificar lesiones cutáneas en siete categorías diagnósticas (akiec, bcc, bkl, df, mel, nv, vasc) sobre los conjuntos de datos HAM10000 y DermaMNIST. El problema que aborda es el desequilibrio extremo de clases en dermatología: la clase mayoritaria (nevus melanocíticos) supone el 67 % de los casos, mientras que el dermatofibroma apenas representa el 1,15 % (115 imágenes). El repositorio se presenta explícitamente como un benchmark académico de estrategias de aumento de datos y funciones de pérdida sensibles al coste, no como un producto clínico.

El modelo es una CNN de 7 clases con entrada de 128×128 píxeles RGB, entrenada con validación cruzada estratificada por paciente (`StratifiedGroupKFold`) para evitar fugas de datos entre entrenamiento y evaluación. Incluye una puerta de derivación por incertidumbre (umbral T = 0,70) que marca las predicciones de baja confianza para revisión clínica. El repositorio tiene un tamaño de 0,0 GB en el momento de la consulta y no registra descargas ni likes.

Es relevante ahora porque documenta de forma comparada cinco estrategias de mitigación del desequilibrio de clases (datos originales, aumento convencional, ponderación de clases, aumento con GAN y aumento con difusión) bajo un protocolo de evaluación libre de fugas, lo que resulta útil como referencia metodológica para investigadores que trabajan con datasets médicos desbalanceados. No obstante, conviene subrayar que no es un modelo de propósito general ni un dispositivo médico certificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, `timm.create_model("efficientnet_b0")`) |
| Parámetros totales | no disponible (EfficientNet-B0 estándar: ~5,3 M, dato no confirmado en la model card) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 128×128×3) |
| Tipos de cuantización | no disponible (pesos en `best_model.pt`, sin variantes GGUF/ONNX documentadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (`best_model.pt`, con posible clave `model_state_dict`) |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNet-B0 preentrenada y ajustada con `timm` para 7 clases de salida. La entrada se redimensiona a 128×128 y se normaliza con las medias y desviaciones estándar de ImageNet ([0,485, 0,456, 0,406] / [0,229, 0,224, 0,225]). El entrenamiento se realizó con `StratifiedGroupKFold` a nivel de paciente para garantizar que ninguna imagen del mismo paciente aparezca simultáneamente en entrenamiento y validación, lo que evita la fuga de datos típica en benchmarks dermatológicos.

Los datos de entrenamiento proceden de HAM10000 (`kmader/skin-cancer-mnist-ham10000`) y DermaMNIST (`medmnist/dermamnist`). La model card no especifica el número de tokens ni de imágenes exactas empleadas, la composición detallada del split ni si hubo ajuste fino con RLHF (no aplica en visión). La innovación técnica destacable es la comparación controlada de cinco estrategias frente al desequilibrio: datos originales, aumento convencional, pérdida ponderada por clase, aumento con GAN y aumento con difusión, todas evaluadas bajo el mismo protocolo sin fugas. También incorpora una puerta de derivación por incertidumbre con umbral de confianza del 70 %.

## Capacidades

- Clasificación de imágenes dermatoscópicas en 7 categorías: `akiec`, `bcc`, `bkl`, `df`, `mel`, `nv`, `vasc`.
- Salida de probabilidades por clase mediante `softmax`, apta para umbralización y análisis de calibración.
- Puerta de derivación por incertidumbre: predicciones con confianza < 70 % se marcan como `UNCERTAIN -> REFER FOR BIOPSY/EXPERT REVIEW`.
- Soporte de mapas de calor Grad-CAM (etiqueta `grad-cam` en el repositorio) para interpretabilidad visual.
- Entrenamiento con pérdidas sensibles al coste y ponderación de clases para mitigar el desequilibrio.
- No soporta tool calling, agentes, razonamiento multi-paso, texto, audio ni modo thinking: es exclusivamente un clasificador de imágenes.
- Capacidades multilingües: no aplica.

## Casos de uso

- Investigación sobre desequilibrio de clases en imágenes médicas: el repositorio sirve como referencia reproducible para comparar aumento convencional, ponderación de clases, GAN y difusión bajo un protocolo libre de fugas.
- Docencia y formación en visión artificial médica: el código de ejemplo en PyTorch permite a estudiantes cargar `best_model.pt`, preprocesar una imagen y obtener la clase predicha con su probabilidad.
- Prototipado de sistemas de triaje asistido: la puerta de incertidumbre al 70 % permite construir un flujo en el que las predicciones dudosas se derivan a revisión experta, siempre como herramienta de apoyo y nunca como diagnóstico autónomo.
- Análisis de interpretabilidad con Grad-CAM: útil para estudiar qué regiones de la lesión activan la decisión del modelo en cada clase, especialmente en la clase rara `df`.
- Evaluación comparativa de modelos preentrenados: sirve como baseline para probar otras arquitecturas (ResNet, ViT, ConvNeXt) sobre HAM10000 y DermaMNIST con el mismo split por paciente.
- Generación de informes de calibración: las probabilidades por clase permiten analizar curvas de fiabilidad y ajustar umbrales de derivación en estudios retrospectivos.
- Benchmark de aumento generativo: permite reproducir el efecto del aumento con GAN y con difusión sobre el recall de clases minoritarias como `df` (1,15 % de prevalencia).

## Benchmarks y rendimiento

Resultados publicados en la model card bajo protocolo de evaluación libre de fugas, comparando cinco estrategias:

| Estrategia | Accuracy | Precision | Recall | F1 | Balanced accuracy |
|---|---|---|---|---|---|
| Datos originales | 0,82 | 0,72 | 0,65 | 0,67 | 0,65 |
| Aumento convencional | 0,84 | 0,74 | 0,69 | 0,71 | 0,69 |
| Ponderación por clase | 0,81 | 0,70 | 0,72 | 0,70 | 0,72 |
| Aumento con GAN | 0,83 | 0,73 | 0,71 | 0,71 | 0,71 |
| Aumento con difusión | 0,83 | 0,74 | 0,72 | 0,72 | 0,72 |

No se han publicado en la información disponible resultados desagregados por clase (por ejemplo, recall específico de `df`), matrices de confusión ni comparaciones con otros modelos externos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para EfficientNet-B0 con entrada 128×128; no se dispone de cifras medidas en la model card.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también A100/H100 para evaluación por lotes a gran escala.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia individual; el cuello de botella es el preprocesado de imagen, no el modelo.
- Opciones de despliegue: PyTorch nativo con `timm`, exportación a TorchScript u ONNX (no documentada en el repositorio), o servicio HTTP con FastAPI/TorchServe. No hay pesos GGUF ni soporte de llama.cpp/Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Clases | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dhina0210/rare-class-skin-lesion-benchmark` | EfficientNet-B0 | no disponible (~5,3 M según arquitectura base) | 128×128×3 | 7 | MIT | Hugging Face, 0 descargas |
| EfficientNet-B0 (ImageNet, `timm`) | EfficientNet-B0 | ~5,3 M | 224×224×3 (configurable) | 1000 | Apache 2.0 (timm) | Amplia |
| ResNet-50 (ImageNet) | CNN residual | ~25,6 M | 224×224×3 | 1000 | BSD-3 / Apache según distribución | Amplia |
| Vision Transformer base (ViT-B/16) | Transformer | ~86 M | 224×224×3 | 1000 | Apache 2.0 (según checkpoint) | Amplia |

La comparación con modelos genéricos de ImageNet es solo orientativa: este repositorio está especializado en 7 clases dermatológicas y no es directamente intercambiable con clasificadores generalistas. No se dispone de comparativas publicadas frente a otros clasificadores dermatológicos específicos en la información proporcionada.

## Limitaciones y advertencias

- No es un dispositivo médico certificado; la model card prohíbe explícitamente su uso para diagnóstico clínico, triaje autónomo de pacientes o planificación de tratamiento.
- Riesgo de alucinación no aplica en sentido estricto, pero sí de falsos negativos y falsos positivos con consecuencias clínicas potencialmente graves.
- El desequilibrio de clases sigue siendo severo: `df` representa solo el 1,15 % de los casos, por lo que el recall en clases raras puede ser bajo pese a la balanced accuracy reportada (~0,72 en el mejor caso).
- La precisión global (0,81–0,84) puede enmascarar un rendimiento pobre en clases minoritarias; no se publican métricas desagregadas por clase.
- Entrada limitada a 128×128 píxeles, lo que puede perder detalle dermatoscópico fino relevante para el diagnóstico.
- No hay información sobre sesgos demográficos (tono de piel, edad, sexo) ni sobre la distribución de los datasets de entrenamiento.
- El umbral de derivación por incertidumbre (T = 0,70) no está validado clínicamente en la información disponible.
- Licencia MIT permite uso comercial del código y los pesos, pero ello no exime de las responsabilidades regulatorias aplicables a software médico.
- Repositorio con 0 descargas y 0 likes: sin validación externa ni adopción comunitaria documentada.

## Enlaces

- Hugging Face: https://huggingface.co/dhina0210/rare-class-skin-lesion-benchmark
- Dataset HAM10000: https://huggingface.co/datasets/kmader/skin-cancer-mnist-ham10000
- Dataset DermaMNIST: https://huggingface.co/datasets/medmnist/dermamnist
- PyTorch: https://pytorch.org/
- `timm` (PyTorch Image Models): https://github.com/huggingface/pytorch-image-models
- Licencia MIT: https://opensource.org/licenses/MIT
