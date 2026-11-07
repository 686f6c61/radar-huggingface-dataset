# razz-123/ViT_bloodmnist_std_15-18

## Resumen

ViT_bloodmnist_std_15-18 es un modelo de clasificación de imágenes obtenido mediante fine-tuning supervisado de google/vit-base-patch16-224 sobre el conjunto de datos medmnist-v2 en su configuración bloodmnist. Lo publica el usuario razz-123 en Hugging Face y su propósito es clasificar imágenes de células sanguíneas en ocho categorías diagnósticas. El modelo emplea la arquitectura Vision Transformer (ViT) estándar, con 85,8 millones de parámetros y una resolución de entrada de 224x224 píxeles dividida en parches de 16x16.

El interés de esta ficha es acotado: se trata de un checkpoint de investigación, con cero descargas y cero likes en el momento de la consulta, y una model card generada automáticamente por el Trainer de Hugging Face que deja sin documentar las secciones de descripción, usos previstos y limitaciones. Aun así, reporta métricas concretas sobre el split de validación de BloodMNIST (accuracy 0,9699 y F1 0,9662) y un historial de entrenamiento completo de 10.000 pasos, lo que permite evaluar su comportamiento y su estabilidad.

Es relevante ahora porque BloodMNIST es un benchmark habitual para experimentos de clasificación médica ligera, y este checkpoint demuestra que un ViT-Base preentrenado en ImageNet y ajustado durante tres épocas con un learning rate bajo alcanza una precisión cercana al 97 % en validación. No obstante, no hay evidencia de evaluación en el split de test ni de validación externa, por lo que debe tratarse como un artefacto experimental y no como un modelo listo para producción clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-Base, patch 16, resolución 224x224) |
| Parametros totales | 85.804.808 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin ventana de texto) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar de tipo ViT-Base: la imagen de entrada se divide en parches de 16x16 píxeles, cada parche se proyecta linealmente a un embedding de dimensión 768 y se procesa mediante una pila de bloques transformer con atención multi-cabeza. La cabeza de clasificación se sustituye por una capa lineal con ocho salidas, correspondientes a las clases de BloodMNIST. El modelo parte de los pesos de google/vit-base-patch16-224, preentrenado en ImageNet-21k y ajustado en ImageNet-1k, y se ha afinado de extremo a extremo sobre el dataset medmnist-v2 (configuración bloodmnist).

El entrenamiento se realizó con el Trainer de Hugging Face (Transformers 4.45.1, PyTorch 2.4.0, Datasets 3.0.1) durante 3 épocas, con batch de entrenamiento de 32, batch de evaluación de 8, optimizador Adam (betas 0,9 y 0,999, epsilon 1e-8), learning rate de 5e-5 con scheduler lineal y semilla 42. El historial registra 10.000 pasos con una pérdida de entrenamiento que desciende de 0,4602 a 0,0001 y una pérdida de validación que oscila entre 0,0762 y 0,2846, con cierta inestabilidad en los primeros pasos y estabilización a partir de la segunda época. No se documenta ninguna innovación técnica adicional: no hay decodificación especulativa, atención lineal, destilación ni técnicas de aumento de datos más allá del preprocesado estándar del procesador de imágenes de ViT.

## Capacidades

- Clasificación de imágenes de frotis sanguíneo en ocho clases, correspondientes a los tipos celulares de BloodMNIST.
- Extracción de características visuales mediante el encoder ViT, reutilizable como backbone para tareas de transferencia.
- Inferencia sobre imágenes de 224x224 píxeles con el procesador ViTImageProcessor de google/vit-base-patch16-224.
- Integración con la API de transformers (ViTForImageClassification) y con la pipeline de image-classification.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión generativa, audio ni otras modalidades.

## Casos de uso

- Clasificación automatizada de células sanguíneas en investigación hematológica: el modelo recibe imágenes de frotis y devuelve una de las ocho clases de BloodMNIST, lo que permite preetiquetar grandes lotes de imágenes antes de la revisión manual por un especialista.
- Prototipado rápido de pipelines de diagnóstico asistido: al ser un ViT-Base estándar, se integra directamente en transformers y sirve como línea base frente a la que comparar arquitecturas más específicas.
- Transferencia a tareas relacionadas: el encoder puede reutilizarse como extractor de características congelado para clasificación de otras modalidades de imágenes médicas de baja resolución, dado su preentrenamiento en ImageNet.
- Docencia y experimentación con MedMNIST: el checkpoint y su historial de entrenamiento permiten reproducir el experimento y estudiar el efecto del learning rate, el número de épocas y el scheduler en un benchmark médico accesible.
- Evaluación comparativa de modelos de visión en dominios médicos: sirve como referencia ViT-Base frente a CNN, Swin o modelos específicos en el benchmark BloodMNIST.
- Despliegue en entornos con recursos limitados para pruebas de concepto: con 85,8 millones de parámetros y un repositorio de 0,3 GB, cabe en una GPU de consumo y permite validar una arquitectura completa antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), sin verificación independiente:

| Metrica | Valor | Dataset | Split |
|---|---|---|---|
| Accuracy | 0,9699 | medmnist-v2 (bloodmnist) | validation |
| F1 | 0,9662 | medmnist-v2 (bloodmnist) | validation |
| Loss | 0,1123 | medmnist-v2 (bloodmnist) | validation |

Evolución durante el entrenamiento (selección de hitos del historial):

| Paso | Epoca | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 200 | 0,0595 | 0,2846 | 0,9019 | 0,8995 |
| 2000 | 0,5945 | 0,1379 | 0,9579 | 0,9519 |
| 5000 | 1,4863 | 0,1063 | 0,9720 | 0,9694 |
| 7600 | 2,2592 | 0,1032 | 0,9801 | 0,9792 |
| 10000 | 2,9727 | 0,1001 | 0,9813 | 0,9796 |

No se han publicado resultados en el split de test ni comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,35 GB para los pesos (85,8 M de parámetros) más el espacio de activaciones, que depende del batch; con batch 8 el consumo total ronda 1-2 GB.
- En fp16 o bf16 los pesos ocupan unos 0,17 GB, lo que reduce aún más el requisito.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090, A100 y H100; el modelo no aprovecha las GPU de gama alta por su tamaño reducido.
- Cabe holgadamente en GPU de consumo, incluidas las integradas con soporte CUDA de gama baja y las GPU de portátil con 4 GB o más.
- Opciones de despliegue: transformers con PyTorch, pipeline de image-classification, TorchScript o exportación a ONNX; también es viable servirlo con TGI o con un endpoint de inferencia de Hugging Face.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViT_bloodmnist_std_15-18 (este) | 85,8 M | imagen 224x224 | Accuracy 0,9699 y F1 0,9662 en validación de BloodMNIST | apache-2.0 | Hugging Face |
| google/vit-base-patch16-224 | 85,8 M | imagen 224x224 | Preentrenado en ImageNet; sin métricas en BloodMNIST | apache-2.0 | Hugging Face |
| KiViDrag/ViT_bloodmnist_std_15 | no disponible | imagen 224x224 | Accuracy 0,9699 y F1 0,9662 en validación de BloodMNIST (mismas métricas declaradas) | no disponible | Hugging Face |

No se dispone de datos de benchmarks de alternativas CNN o Swin específicas para BloodMNIST en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin documentación de usos previstos ni limitaciones en la model card; las secciones correspondientes están marcadas como "More information needed".
- Métricas reportadas únicamente sobre el split de validación; no hay evaluación en test ni validación externa, por lo que el rendimiento en datos reales no está contrastado.
- El historial de entrenamiento muestra oscilaciones en la pérdida de validación (de 0,0762 a 0,2846) y un posible sobreajuste en las últimas épocas, con pérdida de entrenamiento cercana a 0,0001.
- Entrenado sobre BloodMNIST, un dataset de imágenes de 28x28 píxeles reescaladas; el dominio de aplicación es estrecho y no cubre otras modalidades de imagen médica.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en clases poco representadas o en imágenes fuera de distribución.
- No debe utilizarse como herramienta de diagnóstico clínico sin validación prospectiva, revisión regulatoria y supervisión médica.
- Sesgos conocidos: no disponibles; no se documenta la composición demográfica ni la procedencia de las imágenes de BloodMNIST.
- Licencia apache-2.0, que permite uso comercial, pero la ausencia de garantías y de validación clínica desaconseja cualquier despliegue en producción sanitaria.
- El repositorio tiene cero descargas y cero likes, sin evidencia de uso o revisión por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/razz-123/ViT_bloodmnist_std_15-18
- Modelo base: https://huggingface.co/google/vit-base-patch16-224
- Checkpoint con métricas idénticas: https://huggingface.co/KiViDrag/ViT_bloodmnist_std_15
- Notebook de referencia sobre BloodMNIST con ViT: https://github.com/arindam369/MedMNIST-ViT/blob/main/BloodMNIST.ipynb
- Descripción del benchmark BloodMNIST: https://www.emergentmind.com/topics/bloodmnist
