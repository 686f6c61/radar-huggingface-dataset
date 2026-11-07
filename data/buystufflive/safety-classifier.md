# buystufflive/safety-classifier

## Resumen

Live Safety Classifier es un modelo de clasificación de imágenes desarrollado por el usuario buystufflive y publicado en Hugging Face. Su función es asignar a cada imagen una de tres categorías de seguridad de contenido: `hot`, `nsfw` o `safe`. Se trata de un fine-tuning del modelo `timm/mobilenetv4_conv_medium.e250_r384_in12k`, una CNN ligera de la familia MobileNetV4 preentrenada en ImageNet-12k, lo que le permite operar con un coste computacional muy bajo.

El modelo resuelve un problema concreto: el filtrado rápido de imágenes antes de ejecutar análisis más costosos. Con 8.537.003 parámetros totales y un tamaño de repositorio de 0,2 GB, está pensado para desplegarse en CPU o servidores sin GPU dedicada. La exportación a ONNX (FP32 y FP16) y la inclusión de helpers de inferencia en Python y TypeScript facilitan su integración en pipelines de moderación.

Es relevante por su perfil de rendimiento: alcanza una accuracy de 0,9575 en el conjunto de test completo (23.615 imágenes) y una accuracy balanceada de 0,8957 en un test equilibrado por clase (3.000 imágenes), con una latencia media de aproximadamente 50 ms por imagen en CPU (Apple M4 Max). La licencia no está declarada en la información disponible, lo que supone una advertencia importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV4 Conv Medium, familia timm) |
| Parametros totales | 8.537.003 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificación de imágenes) |
| Tipos de cuantizacion | FP32 y FP16 (exportaciones ONNX); no se documentan otras |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `timm/mobilenetv4_conv_medium.e250_r384_in12k`, una red convolucional MobileNetV4 en su variante Conv Medium, preentrenada por el equipo de timm sobre ImageNet-12k durante 250 épocas con resolución de 384 píxeles. Sobre esa base se ha ajustado una cabeza de clasificación de seguridad con tres clases (`hot`, `nsfw`, `safe`). El modelo conserva además una cabeza secundaria de clasificación de teléfono (salida `screen`) que no se utiliza en inferencia; solo se lee la salida `safety`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables en un clasificador de imágenes). El repositorio incluye `train.json`, descrito como una receta de entrenamiento saneada para reproducción o post-entrenamiento, y `preprocess.json`, que fija el contrato de preprocesado: orientación EXIF, conversión a RGB, redimensionado del lado mayor a 1024 píxeles manteniendo aspecto, sin recorte ni volteo horizontal, normalización con media y desviación estándar declaradas, y padding por lote hasta múltiplos de 32. El modelo exportado acepta batch, alto y ancho dinámicos.

## Capacidades

- Clasificación de imágenes en tres categorías de seguridad de contenido: `hot`, `nsfw` y `safe`.
- Inferencia con `argmax` sobre los logits de la salida `safety`.
- Procesamiento por lotes (`classify_batch`) con padding dinámico por lote.
- Soporte de entrada con dimensiones variables (alto y ancho dinámicos) y batch dinámico.
- Exportación ONNX para inferencia en CPU y servidor, con variante FP16 opcional.
- Helpers de inferencia listos para usar en Python (numpy, pillow, onnxruntime) y TypeScript (sharp, onnxruntime-node).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües de texto; es exclusivamente un clasificador visual.

## Casos de uso

- Moderación previa en plataformas de contenido generado por usuarios: el modelo actúa como primer filtro para descartar o marcar imágenes antes de revisiones más caras, con una latencia media de 50 ms por imagen en CPU.
- Filtrado en pipelines de subida de imágenes: integrado en el backend, clasifica cada archivo al recibirlo y deriva los casos `nsfw` a revisión humana o a bloqueo automático.
- Moderación en aplicaciones móviles o de escritorio: la exportación ONNX y el helper en TypeScript permiten ejecutar la clasificación en el cliente o en un servicio Node sin GPU.
- Pre-filtrado en sistemas de búsqueda o recomendación: descarta contenido no apto antes de indexar o mostrar resultados, reduciendo el coste de análisis posteriores.
- Automatización de colas de revisión: con la salida por lotes, se pueden clasificar miles de imágenes en segundo plano y priorizar la cola de revisión según la categoría asignada.
- Control de cumplimiento en entornos con recursos limitados: al caber en CPU y ocupar 0,2 GB de repositorio, es viable en contenedores pequeños o instancias sin acelerador.
- Etiquetado asistido de datasets: la clasificación automática puede servir para preetiquetar grandes volúmenes de imágenes antes de una revisión manual.

## Benchmarks y rendimiento

Resultados publicados en la model card:

| Modelo | Test | Accuracy | Balanced Acc | Macro F1 | Top-2 | Imágenes |
|---|---|---|---|---|---|---|
| fp32 | full test | 0,9575 | 0,8941 | 0,8600 | 0,9921 | 23.615 |
| fp32 | safety-balanced test | 0,8957 | 0,8957 | 0,8947 | 0,9847 | 3.000 |
| fp16 | full test | 0,9575 | 0,8941 | 0,8600 | 0,9921 | 23.615 |
| fp16 | safety-balanced test | 0,8957 | 0,8957 | 0,8947 | 0,9847 | 3.000 |

Tiempos en CPU (ONNX Runtime, `CPUExecutionProvider`, Apple M4 Max con 16 núcleos lógicos):

| Modelo | Imágenes/s | Carga media | Modelo media | Total media | Total mediana | Total P95 |
|---|---|---|---|---|---|---|
| fp32 | 20,0538 | 0,12 ms | 49,52 ms | 49,87 ms | 57,84 ms | 85,82 ms |
| fp16 | 20,8351 | 0,11 ms | 47,69 ms | 48,00 ms | 48,60 ms | 63,65 ms |

No se han publicado comparaciones con otros clasificadores de seguridad en la información disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en CPU; en GPU, el modelo (8,5 M de parámetros) ocupa del orden de decenas de MB en FP32 y la mitad en FP16, por lo que cualquier GPU con memoria libre suficiente es válida.
- GPU recomendadas: no se especifican; el modelo está pensado para CPU. Cualquier GPU consumer (por ejemplo, RTX 4090) puede ejecutarlo sobradamente, pero no se documentan cifras de throughput en GPU.
- Cabe en cualquier GPU consumer y en CPU sin acelerador; los tiempos publicados corresponden a CPU (Apple M4 Max).
- Opciones de despliegue: ONNX Runtime (CPU), con helpers de Python y TypeScript; también se puede cargar el state dict de safetensors con timm para inferencia en PyTorch.
- Latencia y throughput: aproximadamente 20 imágenes/s en CPU según la model card, con latencia total media de 49,87 ms (FP32) y 48,00 ms (FP16), y P95 de 85,82 ms y 63,65 ms respectivamente.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Live Safety Classifier (buystufflive) | Clasificador de imágenes (CNN) | 8,5 M | no aplica | Accuracy 0,9575 (full test), balanced acc 0,8957 | no disponible | Hugging Face |
| Shieldstral (Mistral AI) | Clasificador de seguridad texto e imagen | 3.000 M | no disponible | no disponible | open weights | Hugging Face |
| timm/mobilenetv4_conv_medium.e250_r384_in12k | Clasificador de imágenes (ImageNet-12k) | no disponible | no aplica | no comparable (tarea distinta) | no disponible | Hugging Face / timm |

Shieldstral se incluye como referencia de la categoría de clasificadores de seguridad, pero opera con políticas de moderación en lenguaje natural y un tamaño muy superior, por lo que no es directamente comparable en coste ni en tarea. No se dispone de otros clasificadores de seguridad de imágenes comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de desplegarlo en producción.
- Modelo de tres clases con una definición de categorías (`hot`, `nsfw`, `safe`) que puede no ajustarse a las políticas de moderación de cada organización.
- Riesgo de falsos negativos y positivos: la accuracy balanceada (0,8957) es inferior a la accuracy global (0,9575), lo que sugiere desequilibrio entre clases en el test completo.
- No se documentan sesgos demográficos, culturales ni de otro tipo; no hay información sobre la composición del dataset de entrenamiento.
- No se dispone de información sobre el rendimiento en dominios distintos al de entrenamiento (ilustraciones, capturas, imágenes médicas, etc.).
- La cabeza `screen` (clasificación de teléfono) está presente pero no debe usarse; solo la salida `safety` es válida.
- El preprocesado es parte del contrato del modelo: alterar el redimensionado, la normalización o aplicar volteo horizontal puede degradar los resultados.
- El modelo es exclusivamente visual; no procesa texto ni proporciona explicaciones de sus decisiones.
- No se han publicado resultados de benchmarks frente a alternativas, ni datos de calibración de probabilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/buystufflive/safety-classifier
- Modelo base: https://huggingface.co/timm/mobilenetv4_conv_medium.e250_r384_in12k
- Referencia de la categoría (Shieldstral, Mistral AI): https://www.unite.ai/mistrals-shieldstral-packs-policy-adaptive-safety-screening-into-3b-parameters/
- Repositorio timm: https://github.com/huggingface/pytorch-image-models
- ONNX Runtime: https://onnxruntime.ai/
