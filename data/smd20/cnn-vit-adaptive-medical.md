# smd20/cnn-vit-adaptive-medical

## Resumen

CNN-ViT with Adaptive Attention es un modelo de clasificación de imágenes médicas desarrollado por S. M. Sohrab (publicado bajo el identificador `smd20` en Hugging Face). Combina una rama convolucional (CNN) para la extracción de características locales con una rama de Vision Transformer (ViT) para modelar dependencias globales, fusionando ambas representaciones mediante un mecanismo de atención adaptativa por muestra. El modelo está diseñado específicamente para escenarios de datos limitados en imagen médica.

El modelo resuelve la clasificación de 11 clases de órganos abdominales sobre el dataset OrganAMNIST (derivado de MedMNIST), con imágenes de entrada de 1×28×28 píxeles en escala de grises. Su propuesta central es que la fusión dinámica por muestra permite al modelo confiar selectivamente en la rama CNN o en la rama ViT según las características de cada imagen, lo que se traduce en una mejora de precisión frente a arquitecturas individuales y frente a ResNet-18, con un coste computacional muy inferior.

Es relevante por su eficiencia: con aproximadamente 0,54 M de parámetros y un tiempo de entrenamiento de 0,1 minutos, supera a ResNet-18 (11,2 M de parámetros) en precisión de test sobre OrganAMNIST. No obstante, se trata de un modelo de investigación, sin verificación independiente de sus resultados y con un repositorio de pesos de tamaño prácticamente nulo en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida CNN + Vision Transformer con atención adaptativa (fusión dinámica por muestra) |
| Parametros totales | ~0,54 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 1×28×28 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`cnn_vit_adaptive_best.pth`) |

## Arquitectura y entrenamiento

La arquitectura es un híbrido de dos ramas que procesa una imagen de entrada de 1×28×28. La rama CNN extrae características locales y las reduce mediante Global Average Pooling (GAP) a un vector de 128 dimensiones. La rama ViT modela dependencias globales mediante un encoder transformer de 2 capas y produce un token CLS también de 128 dimensiones. Sobre la concatenación de ambos vectores, un MLP calcula pesos `w_cnn` y `w_vit` mediante softmax, y la representación fusionada se obtiene como combinación lineal ponderada de ambas ramas. Finalmente, una capa fully-connected proyecta a las 11 clases de salida.

El entrenamiento se realiza sobre OrganAMNIST (clasificación de 11 clases de CT abdominal). No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables en un modelo de clasificación de imagen). La innovación técnica destacable es el mecanismo de atención adaptativa, que según el autor produce una distribución de atención bimodal: el modelo aprende a confiar plenamente en una u otra rama según la muestra. El autor reporta además análisis de interpretabilidad con Grad-CAM, con una ratio centro-borde de 1,23× y 12/12 predicciones correctas en las muestras visualizadas.

## Capacidades

- Clasificación de imágenes médicas en 11 clases de órganos abdominales (OrganAMNIST).
- Extracción de características locales mediante rama CNN y globales mediante rama ViT.
- Fusión adaptativa por muestra con pesos calculados dinámicamente mediante MLP y softmax.
- Interpretabilidad mediante Grad-CAM, con mapas de atención centrados en el órgano de interés.
- Entrenamiento eficiente en datos limitados (diseñado explícitamente para este escenario).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un clasificador de imagen, no un modelo generativo).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la clasificación de imagen en escala de grises.

## Casos de uso

- Investigación en arquitecturas híbridas CNN-ViT: el modelo sirve como referencia reproducible para estudiar mecanismos de fusión adaptativa en visión por computador con datos escasos, gracias a su reducido tamaño y a su licencia MIT.
- Prototipado rápido de clasificación de órganos en CT abdominal: con 0,54 M de parámetros y entrenamiento en 0,1 minutos, permite iterar sobre pipelines de preprocesado y aumentación de datos sin coste computacional significativo.
- Docencia y formación en deep learning médico: su arquitectura compacta y su interpretabilidad con Grad-CAM lo hacen adecuado para explicar conceptos de atención, fusión multimodal y evaluación en MedMNIST.
- Benchmarking de baselines ligeros: puede emplearse como baseline eficiente frente a ResNet-18 u otras arquitecturas en experimentos sobre OrganAMNIST y datasets derivados de MedMNIST.
- Análisis de interpretabilidad en imagen médica: los mapas Grad-CAM permiten estudiar qué regiones de la imagen activan la predicción, útil en investigación sobre explicabilidad en diagnóstico asistido.
- Validación de técnicas de atención adaptativa: el mecanismo de pesos por muestra puede evaluarse en otros dominios de imagen médica (por ejemplo, con fine-tuning sobre otros subconjuntos de MedMNIST) para estudiar su transferibilidad.
- Experimentos de eficiencia energética y computacional: al requerir un entrenamiento de 0,1 minutos y un tamaño de ~0,54 M de parámetros, es apto para estudios comparativos de coste frente a modelos más grandes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente) sobre OrganAMNIST, 11 clases, test:

| Modelo | Val Acc | Test Acc | Params | Tiempo de entrenamiento |
|---|---|---|---|---|
| Pure CNN | 93,76 % | 80,55 % | ~0,1 M | 0,6 min |
| Pure ViT | 95,05 % | 81,47 % | ~0,4 M | 1,6 min |
| ResNet-18 (baseline SOTA) | 97,13 % | 89,53 % | ~11,2 M | 2,0 min |
| CNN-ViT + Adaptive (este modelo) | 97,89 % | 92,71 % | ~0,54 M | 0,1 min |

Métricas adicionales declaradas para este modelo en el model-index: Test Accuracy 92,71 y Test F1 (Macro) 92,49, ambas marcadas como no verificadas (`verified: false`).

## Requisitos de hardware

- VRAM estimada para inferencia: mínima, inferior a 1 GB, dado el tamaño de ~0,54 M de parámetros y entradas de 1×28×28.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; una GPU integrada o incluso CPU es suficiente para inferencia. Para entrenamiento, una GTX 1650 o superior basta.
- Cabe en cualquier GPU de consumo, incluidas las de gama baja y entornos embebidos.
- Opciones de despliegue: PyTorch nativo (carga mediante `torch.load`), exportación a TorchScript u ONNX no documentada en la información disponible; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de imagen).
- Latencia y throughput: no disponibles en la información proporcionada; el autor solo reporta un tiempo de entrenamiento de 0,1 minutos.

## Comparativa con modelos similares

| Modelo | Params | Contexto/Entrada | Test Acc (OrganAMNIST) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CNN-ViT + Adaptive (este modelo) | ~0,54 M | 1×28×28 | 92,71 % | MIT | Hugging Face (`smd20/cnn-vit-adaptive-medical`) |
| Pure CNN | ~0,1 M | 1×28×28 | 80,55 % | no disponible | Referencia en la model card |
| Pure ViT | ~0,4 M | 1×28×28 | 81,47 % | no disponible | Referencia en la model card |
| ResNet-18 | ~11,2 M | 1×28×28 | 89,53 % | no disponible | Baseline estándar |

Los tres modelos comparables son los reportados por el propio autor en la model card; no se dispone de comparativas con otros modelos públicos sobre OrganAMNIST en la información proporcionada.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente sobre CT abdominal (OrganAMNIST); no generaliza a otras modalidades (rayos X, MRI) sin fine-tuning.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden únicamente del autor.
- Sesgos de datos: el rendimiento depende de la calidad y distribución del dataset original, que puede contener sesgos inherentes a su recolección.
- Uso previsto exclusivamente de investigación y educativo: no es un dispositivo médico y no debe emplearse para diagnóstico clínico.
- Entrada muy limitada: imágenes de 1×28×28 en escala de grises, lo que restringe la aplicabilidad a imágenes médicas de mayor resolución.
- Sin información sobre cuantización, latencia ni throughput en producción.
- Repositorio de pesos de tamaño 0,0 GB en el momento de la consulta, lo que puede indicar que los pesos no están disponibles o que el repositorio está vacío.
- Licencia MIT: permite uso comercial, pero el autor desaconseja explícitamente el uso clínico; conviene revisar la ausencia de garantías.

## Enlaces

- Hugging Face: https://huggingface.co/smd20/cnn-vit-adaptive-medical
- GitHub del autor: https://github.com/s-sohrab/cnn-vit-adaptive-medical
- Perfil del autor: https://github.com/s-sohrab
- Dataset MedMNIST: https://medmnist.com/
- Paper de MedMNIST (referencia del dataset): no disponible en la información proporcionada
- Visualización Grad-CAM: no disponible (la model card referencia un enlace de imagen no resuelto)
