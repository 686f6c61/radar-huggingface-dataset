# ERISLab/iwdd2027-eris

## Resumen

ERISLab/iwdd2027-eris es el clasificador de ventanas (window classifier) presentado por el equipo ERIS al concurso International Contest on Illegal Waste Dumping Detection (IWDD 2027). No es un modelo de lenguaje, sino un modelo de visión por computador para clasificación de vídeo y detección de eventos: recibe ventanas de 3,2 segundos (16 fotogramas a 5 fps) y las clasifica como "normal" o "vertido ilegal". El modelo se describe en el artículo "Parameter-Efficient Image-to-Video Adaptation for Action Spotting of Illegal Waste Dumping" (WACV 2027 Workshops, WasteVision).

La arquitectura parte de un ViT-B/16 preentrenado en ImageNet-21k que permanece congelado, sobre el que se añaden adaptadores de cuello de botella (bottleneck adapters) y una cabeza transformer temporal. Un decodificador por umbral convierte las probabilidades por ventana en un único instante de inicio (onset) por vídeo. El repositorio pesa 0,4 GB y contiene el checkpoint `iwdd_s4.pth` con el `state_dict` del `VideoModel` definido en el `model.py` de la entrega.

Su relevancia es doble: por un lado, aborda un problema de vigilancia medioambiental concreto (detección de vertidos ilegales) y, por otro, demuestra una estrategia de adaptación imagen-a-vídeo eficiente en parámetros, reutilizando un backbone de imagen congelado en lugar de entrenar un modelo de vídeo completo. La licencia es MIT, lo que facilita su reutilización y reproducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 congelado (ImageNet-21k) + bottleneck adapters + cabeza transformer temporal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de 3,2 s (16 fotogramas a 5 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`.pth` con `{'model': state_dict}`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de ventanas para action spotting. El backbone es un ViT-B/16 preentrenado en ImageNet-21k que se mantiene congelado durante el entrenamiento; sobre él se insertan bottleneck adapters, un mecanismo de ajuste fino eficiente en parámetros que permite adaptar las representaciones de imagen al dominio de vídeo con un coste de entrenamiento reducido. Las características por fotograma se agregan mediante una cabeza transformer temporal que modela la evolución dentro de la ventana de 3,2 s (16 fotogramas a 5 fps).

La salida del clasificador es una probabilidad por ventana de que ocurra un vertido ilegal. Un decodificador por umbral transforma esa secuencia de probabilidades en un único onset por vídeo, es decir, el instante en que comienza el evento. El checkpoint publicado (`iwdd_s4.pth`) corresponde al `VideoModel` de la entrega del concurso, y el script `test.py` lo descarga automáticamente desde el repositorio si no se proporciona una copia local.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni sobre si se aplicaron técnicas de RLHF/DPO (no aplicables en este dominio). Tampoco se detallan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de ventanas de vídeo: normal frente a vertido ilegal.
- Detección de eventos (action spotting) con salida de un onset por vídeo mediante decodificador por umbral.
- Procesamiento de secuencias temporales cortas: ventanas de 3,2 s con 16 fotogramas a 5 fps.
- Adaptación imagen-a-vídeo eficiente en parámetros mediante adaptadores sobre un ViT congelado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multilingües ni de generación de texto.
- No incluye modo thinking, visión general, audio ni otras modalidades distintas del vídeo.

## Casos de uso

- Vigilancia medioambiental automatizada: el modelo analiza ventanas de 3,2 s de grabaciones de cámaras fijas o drones y marca posibles vertidos ilegales, permitiendo priorizar la revisión humana sobre horas de vídeo.
- Monitorización de puntos críticos: desplegado sobre streams de cámaras en vertederos controlados o solares, genera alertas cuando la probabilidad de vertido supera el umbral configurado.
- Triaje de archivos de vídeo: procesar grabaciones retrospectivas para localizar el instante de inicio de un vertido y reducir el tiempo de investigación de las autoridades.
- Integración en sistemas de denuncia ciudadana: clasificar automáticamente vídeos enviados por ciudadanos y derivar los que contienen indicios de vertido a los operadores.
- Investigación en action spotting: servir como línea base reproducible (licencia MIT y pesos públicos) para comparar métodos de adaptación imagen-a-vídeo en el dominio de vigilancia.
- Análisis de cumplimiento normativo: auditar grabaciones de contratistas de gestión de residuos para verificar que los vertidos se realizan en ubicaciones y momentos autorizados.
- Prototipado rápido: al ser un checkpoint de 0,4 GB con backbone congelado, permite experimentar en una sola GPU consumer sin reentrenar el ViT completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con un ViT-B/16 (aproximadamente 86 M de parámetros en el backbone) más adaptadores y cabeza temporal, el checkpoint de 0,4 GB sugiere que la inferencia cabe holgadamente en GPUs consumer de 8-12 GB.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, una RTX 3090, RTX 4090, A100 o H100 serían suficientes, e incluso GPUs de gama media podrían ejecutar la inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM, aunque no se confirma en la documentación.
- Opciones de despliegue: el repositorio del proyecto (https://github.com/arkel23/PEI2V_WasteVision27) proporciona `test.py` y `tools.train --test_only` para descargar los pesos y puntuar las ventanas del conjunto de test público. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada. Como referencia cualitativa, este modelo se sitúa en la categoría de action spotting en vídeo con adaptación eficiente de backbones de imagen, frente a alternativas como modelos de vídeo entrenados desde cero (p. ej., VideoMAE, TimeSformer) o adaptaciones completas de ViT, pero no se pueden ofrecer cifras comparativas sin datos publicados.

| Modelo | Parametros | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|
| ERISLab/iwdd2027-eris | no disponible | 3,2 s (16 frames a 5 fps) | MIT | Pesos en Hugging Face |
| Alternativas de action spotting | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en detección de vertidos ilegales en vídeo; no es un modelo de propósito general ni de lenguaje.
- El backbone ViT-B/16 está congelado y solo se entrenan adaptadores y cabeza temporal, lo que puede limitar la adaptación a dominios muy distintos del dataset de entrenamiento.
- La salida es un único onset por vídeo mediante decodificador por umbral; vídeos con múltiples eventos o eventos solapados pueden no representarse correctamente.
- No se documentan sesgos conocidos, pero al entrenarse para un concurso específico puede generalizar mal fuera de las condiciones de captura del dataset (iluminación, ángulo, resolución, tipo de residuo).
- Riesgo de falsos positivos y negativos inherente a la clasificación binaria por umbral; el umbral debe calibrarse para cada despliegue.
- No se especifican los idiomas ni la composición del dataset de entrenamiento, lo que dificulta evaluar su cobertura geográfica y cultural.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda citar los artículos asociados y verificar las licencias de los datos de entrenamiento originales, no detalladas.
- No hay información sobre cuantizaciones ni formatos optimizados para producción (ONNX, TensorRT, GGUF), por lo que el despliegue requeriría conversión manual desde PyTorch.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ERISLab/iwdd2027-eris
- Código del proyecto: https://github.com/arkel23/PEI2V_WasteVision27
- Artículo: Rios, Hu y Lai, "Parameter-Efficient Image-to-Video Adaptation for Action Spotting of Illegal Waste Dumping", WACV 2027 Workshops (WasteVision)
- Artículo del concurso: Greco et al., "The Evolution of Illegal Waste Dumping Detection in the Age of Foundation Models", WACV 2027 Workshops (WasteVision)
