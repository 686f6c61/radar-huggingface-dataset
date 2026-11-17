# MONAI/checkpoints

## Resumen

MONAI/checkpoints es un repositorio de Hugging Face mantenido por el proyecto MONAI (Medical Open Network for AI) que actúa como ubicación de almacenamiento para diversos checkpoints y pesos preentrenados utilizados en el ecosistema de imagen médica. No se trata de un modelo único con una arquitectura definida, sino de una colección heterogénea de pesos de distintos modelos de visión por computador, algunos de ellos específicamente adaptados al dominio médico.

El repositorio incluye pesos de ResNet50 preentrenados en RadImageNet y MedicalNet (entrenados sobre 23 conjuntos de datos médicos), así como los pesos estándar de ResNet50 de torchvision y los modelos de AlexNet, SqueezeNet y VGG empleados por LPIPS (Learned Perceptual Image Patch Similarity) para el cálculo de similitud perceptual. Estos checkpoints se emplean habitualmente como inicialización para tareas de clasificación, segmentación y detección en imágenes radiológicas, o como componentes auxiliares en métricas de evaluación.

Su relevancia radica en que agrupa en un único punto de descarga pesos que de otro modo estarían dispersos en repositorios de GitHub con licencias distintas (BSD 3-Clause, BSD 2-Clause), facilitando su uso en pipelines de MONAI y en flujos de trabajo de investigación en imagen médica. El repositorio no documenta arquitecturas propias ni procesos de entrenamiento originales más allá de la procedencia de cada fichero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Coleccion de CNNs (ResNet50, AlexNet, SqueezeNet, VGG) |
| Parametros totales | no disponible (depende de cada checkpoint) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelos de vision, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 (repo); pesos individuales bajo BSD 3-Clause y BSD 2-Clause segun procedencia |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: agrupa pesos de modelos convolucionales ya existentes. Los checkpoints `RadImageNet-ResNet50_notop.pth` y `resnet50-11ad3fa6.pth` corresponden a variantes de ResNet50; los ficheros `medicalnet_resnet50_23datasets.pth` y `medicalnet_resnet_10_23dataset.pth` son pesos de MedicalNet entrenados sobre 23 conjuntos de datos médicos; y `alex.pth`, `squeeze.pth` y `vgg.pth` son los modelos de referencia de LPIPS para cálculo de distancia perceptual.

No se proporciona en la información disponible el número de tokens, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF/DPO (no aplicable en modelos de visión). Tampoco se detallan innovaciones técnicas específicas más allá de la procedencia de cada checkpoint (RadImageNet, MedicalNet, torchvision, LPIPS).

## Capacidades

- Extracción de características visuales mediante ResNet50 preentrenado en dominios médicos (RadImageNet, MedicalNet) o en ImageNet (torchvision).
- Inicialización de modelos para clasificación, segmentación y detección en imagen médica.
- Cálculo de similitud perceptual entre imágenes mediante los modelos LPIPS (AlexNet, SqueezeNet, VGG).
- Integración con el ecosistema MONAI para pipelines de preprocesamiento y entrenamiento.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingües (no procesa texto).
- Sin modo thinking, visión generativa ni audio.

## Casos de uso

- Clasificación de imágenes radiológicas: usar `RadImageNet-ResNet50_notop.pth` como extractor de características congelado o para fine-tuning en tareas de clasificación de radiografías, TC o RM, aprovechando el preentrenamiento en dominio médico.
- Segmentación médica con inicialización transferida: emplear `medicalnet_resnet50_23datasets.pth` como backbone en arquitecturas tipo U-Net para segmentación de órganos o lesiones, reduciendo la necesidad de datos anotados.
- Evaluación de calidad de imágenes generadas: usar los pesos LPIPS (`alex.pth`, `squeeze.pth`, `vgg.pth`) para medir similitud perceptual en tareas de reconstrucción o síntesis de imágenes médicas.
- Baseline en investigación: comparar el rendimiento de un modelo propio frente a ResNet50 preentrenado en ImageNet (`resnet50-11ad3fa6.pth`) como referencia estándar.
- Pipelines de MONAI: cargar los checkpoints directamente en flujos de trabajo de MONAI Bundle para experimentación reproducible.
- Prototipado rápido en visión médica: disponer de pesos listos para usar sin necesidad de rastrear múltiples repositorios de GitHub con licencias distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma agregada; depende del checkpoint concreto. ResNet50 en FP32 requiere aproximadamente 100 MB de pesos, mientras que VGG para LPIPS puede superar los 500 MB.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia con estos modelos; para entrenamiento se recomienda RTX 3090/4090, A100 o H100 según el tamaño del batch.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660, RTX 3060 en adelante).
- Opciones de despliegue: PyTorch nativo, MONAI, TorchScript, ONNX Runtime; no aplican vLLM, llama.cpp ni Ollama (no son modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MONAI/checkpoints | Variable (ResNet50, AlexNet, SqueezeNet, VGG) | no aplica | Vision medica y general | Apache 2.0 (repo); BSD en pesos | Hugging Face |
| torchvision weights | ResNet50, VGG, etc. | no aplica | Vision general (ImageNet) | BSD 3-Clause | PyTorch Hub |
| RadImageNet (repo original) | ResNet50 | no aplica | Radiologia | BSD 3-Clause | GitHub |
| MedicalNet (repo original) | ResNet (varias profundidades) | no aplica | Imagen medica 3D | MIT | GitHub |

## Limitaciones y advertencias

- No es un modelo único: la calidad y el comportamiento dependen del checkpoint concreto que se cargue.
- Los pesos de RadImageNet y MedicalNet están entrenados en dominios médicos específicos; su transferencia a otras modalidades puede degradarse.
- Riesgo de sesgo inherente a los conjuntos de datos de entrenamiento originales (poblaciones, equipos y protocolos de adquisición concretos).
- Licencias mixtas: aunque el repositorio se declara Apache 2.0, los pesos individuales proceden de proyectos con licencias BSD 3-Clause y BSD 2-Clause; conviene verificar la licencia aplicable antes de uso comercial.
- No apto para tareas de lenguaje, agentes ni razonamiento simbólico.
- No se documentan métricas de rendimiento ni validación clínica; no debe usarse en producción médica sin validación adicional.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción limitada o reciente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MONAI/checkpoints
- MONAI (proyecto principal): https://monai.io/
- Repositorio MONAI en GitHub: https://github.com/Project-MONAI/MONAI
- pretrained-models.pytorch (origen de pesos RadImageNet/MedicalNet/ResNet50): https://github.com/cadene/pretrained-models.pytorch
- LPIPS / PerceptualSimilarity (origen de alex.pth, squeeze.pth, vgg.pth): https://github.com/richzhang/PerceptualSimilarity
- RadImageNet: https://github.com/BMEII-AI/RadImageNet
- MedicalNet: https://github.com/Tencent/MedicalNet
