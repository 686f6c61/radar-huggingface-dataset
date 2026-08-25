# pthennakoon25/skinvision-ai-model

## Resumen

SkinVision AI es un modelo de clasificación de imágenes médicas desarrollado por pthennakoon25, basado en EfficientNet-B0 y fine-tuneado sobre el dataset HAM10000 para identificar siete categorías de lesiones cutáneas. El proyecto se presenta como una herramienta educativa y de demostración, no como un dispositivo de diagnóstico clínico. Su relevancia radica en ofrecer un ejemplo accesible de aplicación de transfer learning en dermatología, con un rendimiento moderado en un conjunto de test de 1.431 imágenes.

El modelo se distribuye con licencia MIT y está implementado mediante la librería `timm`, lo que facilita su integración en pipelines de visión por computador. Aunque no se especifican detalles sobre el tamaño de entrada ni la arquitectura interna más allá del nombre, se trata de un modelo ligero y adecuado para entornos con recursos limitados. La ausencia de métricas adicionales y de documentación sobre el proceso de entrenamiento limita su evaluación, pero los resultados publicados (accuracy del 82,4 % y ROC-AUC macro de 0,953) indican una capacidad discriminativa razonable para las clases consideradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (via `timm`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (modelo de vision, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (se carga con `torch.load` desde un archivo `.pth`) |

## Arquitectura y entrenamiento

El modelo se basa en EfficientNet-B0, una arquitectura convolucional escalable que utiliza compound scaling para equilibrar profundidad, anchura y resolución. Se emplea la implementación de `timm` con pesos preentrenados en ImageNet y se fine-tunea sobre el dataset HAM10000, compuesto por imágenes dermatoscópicas de lesiones cutáneas. El entrenamiento se realizó durante 15 épocas, aunque no se detallan hiperparámetros, estrategia de aumento de datos ni partición exacta del conjunto. La salida es una capa fully connected con 7 neuronas y activación softmax para las categorías: akiec, bcc, bkl, df, mel, nv y vasc.

No se menciona el uso de técnicas como RLHF, DPO o decodificación especulativa, ya que es un modelo de clasificación de imágenes, no generativo. Tampoco se especifica el tamaño de las imágenes de entrada ni el número total de parámetros, aunque EfficientNet-B0 tiene alrededor de 5,3 millones de parámetros en su configuración estándar (dato no confirmado en la documentación proporcionada).

## Capacidades

- Clasificación de imágenes de lesiones cutáneas en 7 categorías diagnósticas: carcinoma de queratosis actínica (akiec), carcinoma basocelular (bcc), queratosis benigna (bkl), dermatofibroma (df), melanoma (mel), nevo melanocítico (nv) y lesión vascular (vasc).
- Inferencia sobre imágenes dermatoscópicas, con soporte para explicabilidad mediante Grad-CAM (según el repositorio asociado).
- Integración sencilla con `timm` y PyTorch, permitiendo cargar los pesos y ejecutar predicciones en pocas líneas de código.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multimodales más allá de la entrada visual.

## Casos de uso

- Demostración educativa en cursos de deep learning aplicado a la salud: el modelo sirve como ejemplo práctico de fine-tuning de un backbone preentrenado sobre un dataset médico real, con código de inferencia y visualización de Grad-CAM disponible en el repositorio.
- Investigación académica en clasificación de lesiones cutáneas: permite reproducir experimentos baseline sobre HAM10000 y comparar con otros enfoques, gracias a su licencia MIT y a la disponibilidad de los pesos.
- Prototipado de aplicaciones de triaje visual: aunque no es apto para uso clínico, puede integrarse en demos de software para ilustrar cómo un sistema de IA podría asistir en la revisión de imágenes dermatológicas.
- Evaluación de técnicas de explicabilidad: al incluir Grad-CAM, el modelo facilita el estudio de mapas de activación para entender qué regiones de la imagen influyen en la decisión.
- Benchmarking de eficiencia computacional: al ser un modelo ligero, es adecuado para medir latencia y consumo de recursos en dispositivos con CPU o GPU de baja gama.
- Desarrollo de pipelines de clasificación de imágenes médicas: su formato estándar de PyTorch y su integración con `timm` permiten usarlo como componente en flujos de trabajo más amplios, como sistemas de gestión de imágenes o APIs de demostración.

## Benchmarks y rendimiento

Según la model card, el modelo fue evaluado en un conjunto de test retenido de 1.431 imágenes. Los resultados publicados son:

| Metrica | Valor |
|---|---|
| Accuracy | 82,4 % |
| Macro F1 | 0,663 |
| Macro ROC-AUC (OVR) | 0,953 |

No se proporcionan comparaciones con otros modelos ni desglose por clase. Tampoco se indican métricas adicionales como precisión, recall o matriz de confusión.

## Requisitos de hardware

No se especifican requisitos de hardware en la documentación proporcionada. Dado que EfficientNet-B0 es un modelo compacto, es razonable esperar que pueda ejecutarse en CPU y en GPUs con poca memoria, pero no se dispone de datos concretos de VRAM, latencia o throughput. Para inferencia, se puede utilizar PyTorch estándar o servidores como vLLM o TGI, aunque estos últimos están orientados a modelos de lenguaje y no son necesarios para clasificación de imágenes. La opción más sencilla es cargar el modelo con `timm` y ejecutar la inferencia localmente.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se podría comparar con otros clasificadores de lesiones cutáneas basados en EfficientNet o ResNet, pero no hay datos disponibles en la fuente. Por tanto, esta sección se considera no disponible.

## Limitaciones y advertencias

- El modelo es explícitamente un proyecto educativo y no debe utilizarse como herramienta de diagnóstico médico. La model card lo indica claramente.
- El dataset HAM10000 presenta un desequilibrio de clases conocido (la clase `nv` es mayoritaria), lo que puede influir en el rendimiento por clase y explicar el macro F1 relativamente bajo (0,663) en comparación con la accuracy.
- No se documentan sesgos específicos, pero al entrenarse sobre imágenes dermatoscópicas, el modelo puede tener un rendimiento limitado en fotografías de campo amplio o con condiciones de iluminación diferentes.
- No se especifican restricciones de uso comercial más allá de la licencia MIT, que permite uso comercial con atribución.
- No se proporcionan detalles sobre el preprocesamiento de imágenes (tamaño, normalización), lo que dificulta la reproducibilidad exacta.
- La ausencia de información sobre el número de parámetros, el tamaño de entrada y el proceso de entrenamiento completo limita la evaluación rigurosa del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pthennakoon25/skinvision-ai-model
- Repositorio del autor (código de inferencia, Grad-CAM y app): https://github.com/Pabodha123/Skin-Vision-AI
- Dataset HAM10000 (paper original): https://doi.org/10.1038/sdata.2018.161
