# amritrajbhagat31/plant-disease-vit

## Resumen

Plant disease classifier (ViT-B/16) es un modelo de clasificación de imágenes desarrollado por Amrit Raj Bhagat (D Y Patil International University, Pune) que identifica 38 clases de enfermedades y estados sanos en 14 cultivos a partir de fotografías de hojas. El modelo parte del checkpoint preentrenado `vit_base_patch16_224.augreg2_in21k_ft_in1k` de la librería `timm` y se ajusta finamente sobre una combinación de imágenes de laboratorio de PlantVillage y fotografías de campo de PlantDoc, con el objetivo explícito de mejorar la generalización fuera del laboratorio.

El problema que aborda es la brecha de dominio típica en visión artificial agrícola: los modelos entrenados con PlantVillage alcanzan precisiones cercanas al 99% en condiciones controladas pero degradan drásticamente con imágenes reales de campo (fondos variables, iluminación, oclusiones). El autor reporta 99,1% de top-1 en PlantVillage y 69,1% de top-1 (97,0% top-5) en el conjunto de test de PlantDoc con TTA, lo que cuantifica explícitamente esa brecha.

La relevancia actual del modelo es doble: por un lado, ofrece una comparación controlada CNN vs. ViT para esta tarea; por otro, publica pesos en dos formatos operativos (PyTorch fp16 y ONNX int8) y una demo en navegador, lo que lo hace directamente desplegable en entornos con recursos limitados. El repositorio ocupa 0,3 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16 (base, patch size 16, resolución 224x224) |
| Parametros totales | no disponible (ViT-B/16 estándar, aproximadamente 86 M, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224 RGB) |
| Tipos de cuantizacion | fp16 (checkpoint PyTorch) e int8 (ONNX, capas MatMul int8 con patch embedding en fp32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas de clase están en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`model_fp16.pt`) y ONNX (`model_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un Vision Transformer de tipo base con parches de 16x16 y resolución de entrada 224x224, inicializado desde el checkpoint `vit_base_patch16_224.augreg2_in21k_ft_in1k` de `timm`, que combina preentrenamiento en ImageNet-21k con regularización aumentada (AugReg) y ajuste fino en ImageNet-1k. Sobre esa base se realiza un ajuste fino supervisado para 38 clases de salida correspondientes a 14 cultivos.

Los datos de entrenamiento combinan fotografías de laboratorio de PlantVillage con fotografías de campo de PlantDoc. El conjunto de test de PlantDoc empleado para evaluar (236 imágenes de campo) no se utilizó durante el entrenamiento, según indica el autor. La evaluación reportada aplica Test-Time Augmentation (TTA). No se especifica en la información disponible el número de épocas, la tasa de aprendizaje, el tamaño exacto del conjunto de entrenamiento ni si se aplicaron técnicas adicionales como mixup, cutmix o destilación. El preprocesado es el estándar de ImageNet: redimensionar el lado corto a 256, recorte central a 224 y normalización con media y desviación típica de ImageNet.

## Capacidades

- Clasificación de imágenes de hojas en 38 clases que cubren 14 cultivos y distinguen entre estados sanos y distintas enfermedades.
- Inferencia en CPU y navegador mediante el modelo ONNX int8, sin necesidad de GPU.
- Inferencia en PyTorch con pesos fp16 para despliegue en servidor.
- Evaluación con Test-Time Augmentation documentada por el autor.
- Generalización a imágenes de campo medida explícitamente sobre PlantDoc (no usadas en entrenamiento).
- No dispone de tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No es un modelo multimodal generativo: no genera texto, solo devuelve la clase predicha (y, presumiblemente, probabilidades por clase).

## Casos de uso

- Diagnóstico asistido en aplicaciones móviles de agricultura: el modelo ONNX int8 puede ejecutarse en el navegador o en dispositivos de gama media, permitiendo al agricultor fotografiar una hoja y obtener una predicción de enfermedad sin conexión a un servidor.
- Triaje en campo con drones o robots agrícolas: la entrada 224x224 y el bajo coste computacional de un ViT-B/16 permiten procesar lotes de recortes de hojas capturados por cámaras multiespectrales o RGB en tiempo casi real.
- Segunda opinión para técnicos agrícolas: integrado en una herramienta de escritorio que muestra las 5 clases más probables (top-5 del 97,0% en PlantDoc) para que el técnico confirme el diagnóstico.
- Filtrado previo en pipelines de anotación: usar el modelo para preetiquetar grandes volúmenes de imágenes de campo y reducir el coste de anotación manual, revisando solo los casos de baja confianza.
- Investigación comparativa CNN vs. ViT en visión agrícola: el checkpoint y el artículo asociado sirven como línea base reproducible para estudiar la brecha laboratorio-campo.
- Monitorización de cultivos en invernadero: despliegue en una Raspberry Pi o mini-PC con ONNX Runtime para detectar brotes tempranos sobre imágenes capturadas periódicamente por cámaras fijas.
- Docencia y demos interactivas: la demo de Hugging Face Spaces permite ilustrar el funcionamiento de un transformer de visión en un contexto aplicado sin infraestructura propia.

## Benchmarks y rendimiento

| Conjunto de test | Top-1 | Top-5 | Condiciones |
|---|---|---|---|
| PlantDoc test (236 fotos de campo, no vistas en entrenamiento) | 69,1% | 97,0% | Con TTA |
| PlantVillage test (fotos de laboratorio) | 99,1% | no disponible | No se especifica si con TTA |

No se han publicado en la información disponible resultados comparativos frente a arquitecturas CNN en los mismos conjuntos, ni métricas por clase, matriz de confusión o latencia medida.

## Requisitos de hardware

- VRAM estimada para inferencia: un ViT-B/16 a 224x224 en fp16 requiere aproximadamente 0,2-0,5 GB de VRAM para lotes pequeños; en int8 el consumo es aún menor y puede ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no aprovecha GPUs de gama alta por su reducido tamaño.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada e incluso en iGPU modernas.
- Opciones de despliegue: PyTorch con `timm` (carga mediante `timm.create_model` y `load_state_dict`), ONNX Runtime para el modelo int8, y despliegue web vía ONNX Runtime Web (la demo oficial funciona en navegador).
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Clases | Test campo (top-1) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| plant-disease-vit (este modelo) | ViT-B/16 | no disponible (~86 M) | 38 (14 cultivos) | 69,1% en PlantDoc con TTA | MIT | Hugging Face, PyTorch + ONNX |
| PlantVillage CNN típico (p. ej. ResNet-50 ajustado) | CNN | ~25 M | variable | típicamente inferior en campo, sin cifra comparable en esta ficha | variable | múltiples en HF |
| Modelos especializados en PlantDoc (literatura) | CNN/ViT | variable | variable | no disponible en esta información | variable | no disponible |

No se dispone en la información proporcionada de comparaciones directas con alternativas concretas bajo el mismo protocolo de evaluación; la fila de CNN es indicativa y no debe tomarse como resultado medido.

## Limitaciones y advertencias

- Brecha laboratorio-campo notable: la precisión cae del 99,1% en PlantVillage al 69,1% en PlantDoc, por lo que no debe presentarse como un clasificador fiable en condiciones reales sin validación adicional.
- Solo 38 clases y 14 cultivos: cualquier cultivo o enfermedad fuera de ese conjunto se clasificará erróneamente en una de las clases conocidas, sin opción de "desconocido".
- El conjunto de test de campo es pequeño (236 imágenes), lo que implica alta varianza en las métricas reportadas.
- Riesgo de sesgo hacia las condiciones de PlantVillage (fondos uniformes, iluminación controlada), que dominan el entrenamiento.
- No se documentan sesgos geográficos, de variedad de cultivo ni de condiciones climáticas; la aplicabilidad fuera de los conjuntos de origen es incierta.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni asume responsabilidad por diagnósticos incorrectos.
- No debe utilizarse como única fuente para decisiones fitosanitarias críticas (tratamientos, cuarentenas) sin supervisión de un experto.
- No hay información sobre calibración de probabilidades; las confianzas del modelo pueden estar mal calibradas.
- El modelo no procesa texto ni mantiene contexto conversacional; cualquier integración debe gestionar la lógica de diálogo externamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amritrajbhagat31/plant-disease-vit
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/amritrajbhagat31/plant-disease-detector
- Paper asociado: *From Lab to Field: Evaluating CNN and Vision Transformer Generalization for Image-Based Plant Disease Recognition*, Amrit Raj Bhagat, D Y Patil International University, Pune (no se proporciona URL en la información disponible)
- Checkpoint base de `timm`: `vit_base_patch16_224.augreg2_in21k_ft_in1k` (repositorio de `timm` en GitHub: https://github.com/huggingface/pytorch-image-models)
- Conjunto PlantVillage: no se proporciona URL en la información disponible
- Conjunto PlantDoc: no se proporciona URL en la información disponible
