# jramduran/animals10-efficientnetv2s

## Resumen

Animals-10 · EfficientNetV2-S es un clasificador de imágenes de dominio específico publicado por el usuario jramduran en Hugging Face. Resuelve una tarea acotada: asignar una fotografía a una de diez clases de animales (mariposa, gato, pollo, vaca, perro, elefante, caballo, oveja, araña y ardilla). No es un modelo generativo ni un modelo de propósito general: es un cabezal de clasificación entrenado sobre un backbone EfficientNetV2-S preentrenado en ImageNet mediante transfer learning.

El modelo se distribuye en formato nativo de Keras (`model.keras`) y depende del backend de Keras, habiendo sido entrenado y probado con el backend de PyTorch. El repositorio ocupa aproximadamente 0,1 GB y no registra descargas ni likes en el momento de la consulta, lo que lo sitúa como un artefacto de proyecto académico o de portafolio más que como un modelo de producción con adopción comunitaria.

Su relevancia es limitada fuera de su dominio: sirve como ejemplo reproducible de transfer learning con EfficientNetV2-S, con métricas declaradas sobre un conjunto de test reservado (accuracy 0,983, F1 macro 0,980 sobre 2.618 imágenes) y con el código de entrenamiento publicado en GitHub. Para cualquier uso real de clasificación de animales a mayor escala o con más clases, sería necesario reentrenar o recurrir a modelos con mayor cobertura taxonómica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNetV2-S (CNN) con cabezal de clasificación de 10 clases; transfer learning desde pesos ImageNet |
| Parámetros totales | no disponible (el repo ocupa 0,1 GB, coherente con EfficientNetV2-S, ~21,5 M de parámetros, pero el dato no se declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224) |
| Tipos de cuantización | no disponible (se distribuye en formato Keras nativo; no se documentan variantes GGUF, ONNX ni cuantizadas) |
| Idiomas soportados | no aplica (clasificación de imágenes; etiquetas en inglés) |
| Licencia | no disponible |
| Formato de pesos | `model.keras` (Keras v3) más `model_info.json` con etiquetas y tamaño de entrada |

## Arquitectura y entrenamiento

La arquitectura es una EfficientNetV2-S, una red convolucional con bloques MBConv y Fused-MBConv, escalado compuesto y entrenamiento eficiente en GPU. El backbone parte de pesos preentrenados en ImageNet y se sustituye la cabeza original por un clasificador de 10 salidas. El entrenamiento es en dos fases: primero se entrena el cabezal con el backbone congelado y después se afinan las últimas 60 capas con una tasa de aprendizaje baja.

Los datos provienen del dataset Animals-10 (26.177 fotos) con partición estratificada 80/10/10 (entrenamiento, validación para early stopping y test intacto). La entrada es de 224x224 píxeles en RGB, sin normalización explícita (píxeles crudos en rango 0-255, según el ejemplo de uso de la model card). El entrenamiento completo constó de 8 épocas y se ejecutó en una NVIDIA GeForce RTX 5060 Laptop GPU en 16,5 minutos. No se documenta uso de RLHF, DPO ni aumentación de datos más allá de lo implícito en el pipeline.

## Capacidades

- Clasificación de imágenes en 10 clases cerradas: `butterfly`, `cat`, `chicken`, `cow`, `dog`, `elephant`, `horse`, `sheep`, `spider`, `squirrel`.
- Salida de probabilidades por clase (softmax sobre 10 logits), lo que permite umbralizar confianza y descartar predicciones de baja certeza.
- Inferencia sobre imágenes RGB redimensionadas a 224x224; no requiere normalización adicional de píxeles.
- Integración con el ecosistema Keras 3 y con el backend de PyTorch (backend con el que fue entrenado y probado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión general, audio ni modo de pensamiento (thinking).
- No es un modelo zero-shot: solo reconoce las 10 clases del dataset de entrenamiento.

## Casos de uso

- Clasificación de fotos en una aplicación de galería doméstica: el modelo etiqueta automáticamente imágenes de mascotas o animales de granja entre las 10 clases disponibles, con la ventaja de que su tamaño reducido (repo de 0,1 GB) permite empaquetarlo dentro de una app de escritorio o móvil sin infraestructura adicional.
- Filtrado previo en un pipeline de moderación o curación de datasets: dado que devuelve probabilidades por clase, se puede usar como primer filtro para separar imágenes de animales de otras categorías y derivar el resto a un modelo mayor, reduciendo coste computacional.
- Prototipo educativo de transfer learning: sirve como referencia reproducible (código en GitHub, partición fija, métricas sobre test reservado) para enseñar fine-tuning de EfficientNetV2-S con Keras, comparando las cuatro variantes del mismo proyecto sobre la misma partición.
- Clasificación en dispositivos con recursos limitados: al ser una CNN de ~21,5 M de parámetros y entrada 224x224, es viable en CPU o en GPU de gama de entrada para lotes pequeños, sin necesidad de servidores de inferencia dedicados.
- Etiquetado asistido de imágenes en un flujo de anotación humana: el modelo propone una clase y una confianza, y el anotador solo revisa los casos de baja probabilidad, acelerando la construcción de datasets etiquetados de animales.
- Demo o ejercicio de despliegue de modelos Keras en Hugging Face: el formato `model.keras` más `model_info.json` facilita montar una API mínima de inferencia con FastAPI o un endpoint de Hugging Face Spaces para validar el ciclo completo de carga y predicción.

## Benchmarks y rendimiento

Métricas declaradas por el autor sobre el conjunto de test reservado (n=2.618), según la model card:

| Métrica | Valor |
|---|---|
| Accuracy | 0,983 |
| F1 macro | 0,980 |
| Precision macro | 0,980 |
| Recall macro | 0,980 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks estándar) en la información disponible, ni tampoco resultados de las otras tres variantes del proyecto que permitan una comparación directa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del backbone (EfficientNetV2-S, ~21,5 M de parámetros) y la entrada 224x224, la inferencia en FP32 requiere del orden de 1-2 GB de VRAM, aunque este dato no está confirmado en la documentación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; el autor entrenó en una NVIDIA GeForce RTX 5060 Laptop GPU, lo que indica que el modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: sí, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: Keras 3 con backend PyTorch (configuración documentada), TensorFlow/Keras, exportación a ONNX o TFLite no documentada pero técnicamente posible; no se proporcionan artefactos para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de imágenes.
- Latencia y throughput: no disponibles. El único dato temporal es el entrenamiento completo (8 épocas) en 16,5 minutos sobre una RTX 5060 Laptop.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Clases | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| jramduran/animals10-efficientnetv2s | CNN EfficientNetV2-S fine-tuned | no disponible (~21,5 M estimados) | 10 | 224x224 | no disponible | Hugging Face, Keras |
| EfficientNetV2-S (ImageNet) | CNN preentrenada | ~21,5 M | 1.000 | 224x224 | Apache 2.0 (según la implementación original de Google) | TensorFlow/Keras, torchvision |
| ResNet-50 (ImageNet) | CNN preentrenada | ~25,6 M | 1.000 | 224x224 | BSD-3 / Apache 2.0 según implementación | Amplia disponibilidad |
| CLIP ViT-B/32 | Vision-language zero-shot | ~151 M | abierta (texto libre) | 224x224 | MIT (según OpenAI) | Hugging Face, ONNX |

La comparación es aproximada: los tres modelos alternativos son de propósito general y no están especializados en las 10 clases de Animals-10, por lo que sus métricas no son directamente comparables con las del modelo de jramduran. La ventaja del modelo especializado es su precisión en el dominio concreto; su desventaja es la cobertura cerrada y la ausencia de licencia declarada, que impide evaluar su uso comercial.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset Animals-10 contiene imágenes de calidad y distribución heterogéneas (fotos web, posibles duplicados y desbalanceo entre clases); el modelo hereda esos sesgos y puede fallar en clases poco representadas o en condiciones de iluminación y encuadre distintas.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con alta confianza en imágenes fuera de distribución (animales que no son de las 10 clases, dibujos, imágenes borrosas).
- Limitaciones de contexto e idioma: no hay contexto textual; las etiquetas están en inglés y el modelo no procesa texto. Solo reconoce las 10 clases del dataset.
- Restricciones de licencia: la licencia no está declarada, por lo que no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de integrarlo en un producto.
- Caveats para producción: el repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; no se documentan versiones cuantizadas ni artefactos ONNX/TFLite; el modelo depende del backend de Keras configurado (entrenado y probado con PyTorch) y no se garantiza compatibilidad con otros backends sin validación.
- El modelo no ha sido evaluado en dominios distintos al de Animals-10; su uso fuera de ese dominio requiere reentrenamiento o fine-tuning adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jramduran/animals10-efficientnetv2s
- Dataset Animals-10: https://huggingface.co/datasets/34data/animal-10
- Código de entrenamiento: https://github.com/JTiiz/CNN-project (carpeta `training/`)
- Matriz de confusión: `confusion_matrix.png` dentro del repositorio del modelo
