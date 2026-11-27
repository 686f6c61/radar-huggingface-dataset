# nelikCode/NBDetect

## Resumen

NBDetect es un clasificador de imágenes binario basado en MobileNetV3-Large (torchvision) que determina, a partir de un fotograma de webcam, si una persona se está mordiendo las uñas. Lo desarrolla nelikCode y se distribuye como parte de NailBiteMenu, una aplicación de barra de menús para macOS que monitoriza la webcam en segundo plano. El modelo resuelve una tarea de clasificación visual muy acotada (dos clases: `not_biting` y `biting`) con un coste computacional mínimo: el export a Core ML ocupa 8,8 MB y procesa un fotograma en aproximadamente 0,5 ms en Apple silicon.

La relevancia del modelo no está en su escala —es un MobileNetV3-Large con cabeza de dos clases, sin capacidades generativas— sino en su enfoque de despliegue: entrenado con datos de webcam reales a 1280×720, exportado a Core ML e integrado en una app de escritorio con lógica de suavizado temporal y detección de episodios. Es un ejemplo de modelo de visión pequeño, especializado y listo para producción local, no de un modelo de propósito general.

El checkpoint PyTorch pesa 17,5 MB y el paquete Core ML 8,8 MB. El repositorio completo ocupa 0,1 GB. La licencia es Apache 2.0 y el único idioma declarado es inglés, aunque al ser un clasificador visual el idioma no afecta a la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Large (torchvision) con cabeza de 2 clases |
| Parametros totales | no disponible (MobileNetV3-Large, ~5,4 M en la variante estándar; no confirmado por el autor) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imagen) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos PyTorch y export Core ML) |
| Idiomas soportados | en (declarado; irrelevante para la tarea visual) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (`.pt`) y Core ML (`.mlpackage`) |

## Arquitectura y entrenamiento

El modelo es un MobileNetV3-Large preentrenado en ImageNet al que se le sustituye la cabeza por una capa de dos clases. La entrada PyTorch es un fotograma RGB redimensionado para que el lado corto mida 224 px manteniendo la relación 16:9 (398×224 para un fotograma de 1280×720), normalizado con media y desviación típica de ImageNet. En el export Core ML la entrada es directamente una imagen RGB de 398×224 y la normalización ocurre dentro del modelo, con salida `p_biting` (probabilidad de la clase positiva).

El entrenamiento usó sesiones de webcam grabadas a 1280×720 con dos cámaras de MacBook, etiquetadas fotograma a fotograma como mordida o no mordida. Las sesiones negativas incluyen gestos que se parecen a morderse las uñas (beber de una taza, sostener un objeto junto a la boca) para reducir falsos positivos. La receta: pesos preentrenados en ImageNet, 12 épocas de AdamW con learning rate 1e-3 dividido por 5 en las épocas 6 y 9, función de pérdida balanceada por clase, recorte aleatorio 16:9 con escala de 0,6 a 1,0 y conservación de la última época. No se menciona RLHF ni DPO (no aplica a clasificación).

## Capacidades

- Clasificación binaria de imagen: distingue `not_biting` (clase 0) de `biting` (clase 1) a partir de un fotograma de webcam.
- Inferencia en tiempo real: ~0,5 ms por fotograma en Apple silicon con Core ML.
- Export a Core ML con normalización integrada y salida de probabilidad directa.
- Checkpoint PyTorch cargable con el código del repositorio (`nbdetect/model.py`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general, audio ni modo thinking.
- Capacidad multilingüe: no aplica; el modelo no procesa texto.

## Casos de uso

- Monitorización de hábitos en escritorio: la app NailBiteMenu usa el modelo para detectar episodios de mordida de uñas en la webcam y alertar al usuario, aplicando suavizado temporal y lógica de episodios sobre las probabilidades por fotograma.
- Investigación conductual con visión local: permite registrar frecuencia y duración de episodios sin enviar vídeo a la nube, gracias a la inferencia en el dispositivo con Core ML.
- Prototipado de clasificadores de gestos: sirve como plantilla para adaptar MobileNetV3-Large a otras conductas similares (comer, fumar, tocarse la cara) reentrenando la cabeza con datos propios.
- Aplicaciones de bienestar en macOS: integración en apps de barra de menús con bajo consumo, ya que el modelo ocupa 8,8 MB y procesa fotogramas en sub-milisegundo.
- Filtrado de falsos positivos en pipelines de visión: el conjunto de entrenamiento incluye gestos parecidos (beber, sostener objetos), útil como referencia para diseñar negativos duros en tareas de detección de acciones.
- Evaluación de despliegue Core ML: ejemplo práctico de export de un clasificador PyTorch a Core ML con normalización embebida y salida calibrada para umbral fijo (0,75 en la app).

## Benchmarks y rendimiento

Resultados en el split de test reservado: 1.116 fotogramas, 9 episodios de mordida en ambas cámaras, umbral por defecto de NailBiteMenu de 0,75 y recuento de alertas replicando la lógica de suavizado y episodios de la app.

| Metrica | Modelo anterior | Este modelo |
|---|---|---|
| ROC AUC, primera camara | 0,978 | 0,984 |
| ROC AUC, segunda camara | 0,862 | 0,986 |
| Fotogramas de mordida detectados | 84% | 96% |
| Episodios de mordida alertados | 7/9 | 8/9 |
| Fotogramas parecidos por encima del umbral | 8,8% | 4,1% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, ImageNet) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del checkpoint (17,5 MB en PyTorch, 8,8 MB en Core ML) y la arquitectura MobileNetV3-Large, la huella es de decenas de MB, apta para cualquier GPU consumer.
- GPU recomendadas: no aplica para el caso principal; el modelo está pensado para Apple silicon vía Core ML (~0,5 ms por fotograma). En PyTorch puede ejecutarse en CPU o en cualquier GPU NVIDIA/AMD sin requisitos especiales.
- Cabe en GPU consumer: sí, en cualquier GPU consumer actual e incluso en CPU.
- Opciones de despliegue: Core ML (vía NailBiteMenu), PyTorch con el código de `nbdetect/model.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a un clasificador de imagen).
- Latencia y throughput: ~0,5 ms por fotograma en Apple silicon con Core ML según el autor; no se publican cifras para PyTorch en CPU o GPU.

## Comparativa con modelos similares

No se han publicado comparativas con otros modelos en la información disponible. Como referencia de categoría, un clasificador de imagen binario basado en MobileNetV3-Large se sitúa en la misma familia que otros backbones ligeros de torchvision (MobileNetV3-Small, EfficientNet-B0) o modelos de detección de acciones en vídeo, pero no hay datos comparativos publicados por el autor.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NBDetect | no disponible | no aplica | ROC AUC 0,984 / 0,986 en test propio | Apache 2.0 | Hugging Face |
| MobileNetV3-Large (ImageNet) | ~5,4 M (referencia) | no aplica | no comparable (tarea distinta) | BSD-3 (torchvision) | torchvision |
| EfficientNet-B0 | ~5,3 M (referencia) | no aplica | no comparable (tarea distinta) | Apache 2.0 | torchvision |

## Limitaciones y advertencias

- Datos muy estrechos: todas las grabaciones provienen de una sola persona, en interiores y con dos cámaras de MacBook; se espera menor precisión con otras personas, cámaras e iluminación.
- Los gestos parecidos siguen disparando falsos positivos ocasionales (4,1% de fotogramas por encima del umbral en test).
- Conjunto de test pequeño (1.116 fotogramas, 9 episodios): las métricas son orientativas, no concluyentes.
- Riesgo de sesgo por demografía, tono de piel, iluminación y ángulo de cámara no evaluado.
- No es un modelo generativo: no hay riesgo de alucinación textual, pero sí de clasificación errónea en condiciones fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Dependencia del código del repositorio para cargar el checkpoint PyTorch (`nbdetect/model.py`); el export Core ML es autocontenido.
- El umbral de 0,75 está calibrado para la app NailBiteMenu; otros usos requerirán recalibrar.

## Enlaces

- Hugging Face: https://huggingface.co/nelikCode/NBDetect
- Repositorio de entrenamiento: https://github.com/killian31/NBDetect
- App NailBiteMenu: https://github.com/killian31/NailBiteMenu
