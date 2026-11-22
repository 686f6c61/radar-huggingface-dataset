# dronefreak/bdd100k-scenario-mobilenetv4_conv_small

## Resumen

MobileNetV4-Conv-Small finetuneado para clasificación de escenarios de conducción sobre el dataset BDD100K. Lo desarrolla el usuario de Hugging Face `dronefreak` como parte de BDD100K-Toolkit, un conjunto de herramientas para preparar BDD100K, entrenar modelos sobre él y evaluarlos con las mismas métricas y particiones. El modelo resuelve una tarea de clasificación de imagen en 7 clases (ciudad, autopista, residencial, aparcamiento, gasolinera, túnel y desconocido) derivada del campo `attributes.scene` de BDD100K.

Se trata de un clasificador convolucional ligero: MobileNetV4-Conv-Small con 2.527.079 parámetros totales, construido sobre el checkpoint `timm/mobilenetv4_conv_small.e2400_r224_in1k` y ajustado con la librería `timm`. Su relevancia radica en el tamaño reducido, que lo hace apto para inferencia en dispositivos con recursos limitados dentro de pipelines de conducción autónoma, y en que el autor publica una comparativa reproducible contra otros clasificadores (EfficientViT, YOLO11, TinyViT) sobre la misma partición de test.

La tarea es no oficial y sigue el dataset de Kaggle del mismo nombre. El rendimiento es desigual: la accuracy top-1 alcanza el 78,2 %, pero el F1 macro cae al 52,89 % por el fuerte desbalance de clases y porque el modelo no acierta ninguna imagen de la clase `unknown`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MobileNetV4-Conv-Small (CNN, familia MobileNetV4) |
| Parámetros totales | 2.527.079 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen; entrada 224x224 según `pretrained_cfg`) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización no documentada por el autor) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (checkpoint de entrenamiento adicional `best.pt` con pesos EMA) |

## Arquitectura y entrenamiento

MobileNetV4-Conv-Small es una red neuronal convolucional de la familia MobileNetV4, diseñada para eficiencia computacional en visión por computador. El modelo parte del checkpoint preentrenado en ImageNet-1k `timm/mobilenetv4_conv_small.e2400_r224_in1k` y se ajusta (finetune) sobre el dataset `dronefreak/BDD100K-Scenario-Classification`, derivado de BDD100K. La entrada sigue la configuración de `pretrained_cfg` de timm (resolución 224 y normalización estándar de ImageNet), y las etiquetas de clase se exponen a través de `config.json`.

No se detalla en la información disponible el número de tokens o imágenes de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de aumento de datos, balanceo de clases o regularización específicas. El checkpoint publicado como `best.pt` incluye pesos con media móvil exponencial (EMA) y metadatos de entrenamiento. La evaluación se realiza sobre la partición `test` de 10.000 imágenes. No se documentan innovaciones arquitectónicas adicionales más allá del propio diseño de MobileNetV4.

## Capacidades

- Clasificación de imagen en 7 clases de escenario de conducción: `city street`, `highway`, `residential`, `parking lot`, `gas stations`, `tunnel` y `unknown`.
- Inferencia sobre imágenes RGB individuales con preprocesado estándar de timm (redimensionado a 224, normalización con media y desviación de ImageNet).
- Integración directa con `timm.create_model("hf-hub:...")` y salida de logits sobre los que aplicar softmax.
- Etiquetas de clase accesibles desde la configuración del modelo (`pretrained_cfg["label_names"]`).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión generativa; es un clasificador discriminativo.
- No dispone de modo thinking, audio ni otras modalidades.

## Casos de uso

- Etiquetado automático de escenarios en pipelines de datos de conducción: el modelo clasifica fotogramas de vídeo de vehículos en una de las 7 categorías, lo que permite segmentar grandes volúmenes de grabaciones por tipo de entorno antes de un etiquetado manual más fino.
- Enrutado de datos para entrenamiento de modelos mayores: dado su tamaño de 2,5 M de parámetros, puede ejecutarse sobre lotes masivos de imágenes en CPU o GPU de gama baja para filtrar y organizar datasets por escenario (por ejemplo, separar autopista de ciudad).
- Preprocesado en sistemas embebidos: su reducido coste computacional permite desplegarlo en dispositivos con recursos limitados (Raspberry Pi, Jetson Nano) para clasificar el entorno en tiempo real como señal auxiliar de un sistema de asistencia a la conducción.
- Detección de cambios de contexto en flotas de vehículos: clasificar secuencias de imágenes para identificar transiciones entre túnel, autopista y ciudad, útil en análisis de logs de conducción o en sistemas de geolocalización aproximada.
- Filtrado de datasets para investigación en percepción: seleccionar subconjuntos equilibrados por escenario para experimentos controlados, usando las predicciones del modelo como criterio de muestreo.
- Componente de bajo coste en prototipos de conducción autónoma: como clasificador de escena previo a módulos de planificación o de selección de política de conducción, siempre que se acepte su limitada precisión en clases minoritarias.
- Evaluación comparativa de arquitecturas: sirve como baseline ligero en estudios que comparan CNNs pequeñas frente a ViT o detectores reutilizados como clasificadores sobre BDD100K.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre la partición `test` (10.000 imágenes) del dataset `dronefreak/BDD100K-Scenario-Classification`. No verificados de forma independiente.

| Métrica | Valor |
|---|---|
| Top-1 accuracy | 78,20 % |
| Top-5 accuracy | 99,94 % |
| F1 macro | 52,89 % |
| Balanced accuracy | 48,69 % |
| Precisión macro | 61,41 % |
| Recall macro | 48,69 % |

Rendimiento por clase:

| Clase | Precisión | Recall | F1 | Imágenes de test |
|---|---|---|---|---|
| city street | 80,38 % | 87,35 % | 83,72 % | 6112 |
| gas stations | 50,00 % | 14,29 % | 22,22 % | 7 |
| highway | 77,15 % | 70,51 % | 73,68 % | 2499 |
| parking lot | 64,29 % | 36,73 % | 46,75 % | 49 |
| residential | 66,76 % | 54,19 % | 59,82 % | 1253 |
| tunnel | 91,30 % | 77,78 % | 84,00 % | 27 |
| unknown | 0,00 % | 0,00 % | 0,00 % | 53 |

Comparativa del model zoo del autor sobre la misma partición de test (ordenada por top-1):

| Modelo | Top-1 | F1 macro | Balanced acc | Precisión macro |
|---|---|---|---|---|
| EfficientViT-B3 | 79,32 % | 57,70 % | 53,59 % | 71,54 % |
| YOLO11n | 78,58 % | 49,47 % | 46,05 % | 60,98 % |
| YOLO11s | 78,58 % | 49,18 % | 45,24 % | 61,98 % |
| MobileNetV4-Conv-Small | 78,20 % | 52,89 % | 48,69 % | 61,41 % |
| MobileNetV4-Conv-Large | 78,15 % | 50,00 % | 45,48 % | 63,03 % |
| EfficientViT-B1 | 78,01 % | 54,15 % | 49,41 % | 70,13 % |
| TinyViT-21M | 77,99 % | no disponible | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el modelo (2,5 M de parámetros, unos 10 MB de pesos); el consumo real lo dominan los buffers de activación y el tamaño de lote.
- GPU recomendadas: cualquier GPU moderna sirve; para alto throughput, A100, H100, L4 o RTX 4090 con lotes grandes. Para despliegue embebido, Jetson Nano, Jetson Orin Nano o Raspberry Pi (CPU).
- Cabe holgadamente en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060 y superiores, e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: `timm` con PyTorch (vía `hf-hub`), exportación a ONNX, TensorRT o TorchScript para producción; también es viable en `torchvision`/`timm` sobre CPU.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el reducido número de parámetros y la resolución de entrada de 224x224, se espera un throughput elevado en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

Comparación con alternativas del mismo model zoo del autor, todas evaluadas sobre la misma partición de test de BDD100K Scenario Classification:

| Modelo | Parámetros | Top-1 | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MobileNetV4-Conv-Small (este) | 2,53 M | 78,20 % | 52,89 % | Apache-2.0 | Hugging Face (timm) |
| MobileNetV4-Conv-Large | no disponible | 78,15 % | 50,00 % | no disponible | Hugging Face (timm) |
| EfficientViT-B1 | no disponible | 78,01 % | 54,15 % | no disponible | Hugging Face (timm) |
| EfficientViT-B3 | no disponible | 79,32 % | 57,70 % | no disponible | Hugging Face (timm) |
| YOLO11n | no disponible | 78,58 % | 49,47 % | no disponible | Ultralytics |
| YOLO11s | no disponible | 78,58 % | 49,18 % | no disponible | Ultralytics |
| TinyViT-21M | no disponible | 77,99 % | no disponible | no disponible | Hugging Face (timm) |

EfficientViT-B3 obtiene el mejor top-1 y F1 macro del conjunto, mientras que MobileNetV4-Conv-Small destaca por su reducidísimo tamaño de parámetros (2,5 M), lo que lo hace competitivo en eficiencia frente a alternativas con más parámetros.

## Limitaciones y advertencias

- La clase `unknown` no se predice correctamente en ninguna de las 53 imágenes de test (F1 de 0 %); debe considerarse no soportada.
- Fuerte desbalance de clases: `city street` y `highway` concentran la mayoría de las imágenes de test, mientras que `gas stations`, `parking lot` y `tunnel` tienen muy pocas (7, 49 y 27 respectivamente), lo que hace que sus métricas sean poco fiables.
- El F1 macro (52,89 %) y el balanced accuracy (48,69 %) son notablemente bajos pese al 78,2 % de top-1, lo que indica mal rendimiento en clases minoritarias.
- Riesgo de sesgo hacia las clases mayoritarias (`city street`, `highway`) en producción, especialmente con imágenes de escenarios poco representados.
- La tarea es no oficial y derivada del campo `attributes.scene` de BDD100K; puede no coincidir con definiciones de escenario de otros sistemas.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false`).
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones de BDD100K para el uso de los datos subyacentes.
- No se documentan sesgos demográficos ni geográficos específicos, pero al entrenarse sobre BDD100K (grabaciones en entornos urbanos y de carretera) el modelo puede generalizar mal a regiones o condiciones de iluminación no representadas.
- No apto para tareas generativas, de razonamiento o de lenguaje; es exclusivamente un clasificador de imagen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/bdd100k-scenario-mobilenetv4_conv_small
- Dataset: https://huggingface.co/dronefreak/BDD100K-Scenario-Classification
- Repositorio BDD100K-Toolkit: https://github.com/dronefreak/bdd100k-toolkit
- Modelo base en timm: https://huggingface.co/timm/mobilenetv4_conv_small.e2400_r224_in1k
- Paper de MobileNetV4 (arXiv:2404.10518): https://arxiv.org/abs/2404.10518
- Paper de BDD100K (arXiv:1805.04687): https://arxiv.org/abs/1805.04687
- Demo (vídeo de predicciones): https://huggingface.co/dronefreak/bdd100k-scenario-mobilenetv4_conv_small/resolve/main/assets/demo_banner.mp4
