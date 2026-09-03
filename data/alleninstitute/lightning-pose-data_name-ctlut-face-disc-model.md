# AllenInstitute/lightning-pose-data_name-ctlut-face-disc-model

## Resumen

El modelo `AllenInstitute/lightning-pose-data_name-ctlut-face-disc-model` es un sistema de estimación de pose facial para animales, desarrollado por el Allen Institute for Neural Dynamics. Está construido sobre la librería Lightning Pose, una herramienta de código abierto para el entrenamiento y despliegue de modelos de seguimiento de puntos anatómicos en vídeo. El modelo detecta 18 puntos clave en la cara de un animal (ojos, pupilas, nariz, bigotes, etc.) a partir de una única vista, utilizando un backbone ResNet50 preentrenado en el dataset AP10K de poses animales.

La relevancia de este modelo radica en su aplicación en neurociencia y etología: permite cuantificar automáticamente la posición de la mirada, la actividad de los bigotes y otros rasgos faciales en experimentos de comportamiento. El modelo fue entrenado durante 300 épocas con una partición train/validación de 0.95/0.05, alcanzando un RMSE supervisado de 0.64 píxeles reescalados en validación. Aunque la ficha técnica es escasa (no se especifican parámetros totales, licencia ni formato de pesos), el modelo está disponible públicamente en Hugging Face y puede integrarse en pipelines de análisis de vídeo con Lightning Pose.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (backbone) + cabeza de regresión de keypoints, pérdida PCA single-view |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente checkpoint de PyTorch, no confirmado) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone ResNet50 preentrenado en el dataset AP10K (Animal Pose Estimation), que extrae características de la imagen de entrada. Sobre estas características se aplica una cabeza de regresión que predice las coordenadas de 18 keypoints faciales. La pérdida empleada es `pca_singleview`, una variante de la pérdida PCA (Principal Component Analysis) que aprovecha la estructura de correlación entre keypoints para mejorar la consistencia de las predicciones en una sola vista. El entrenamiento se realizó durante 300 épocas con una partición de 95% para entrenamiento y 5% para validación. No se especifican detalles sobre el dataset de entrenamiento (solo se menciona un placeholder `DATA_NAME`), ni sobre técnicas de aumento o regularización adicionales.

## Capacidades

- Estimación de pose facial en animales: detecta 18 puntos anatómicos (párpados, pupilas, nariz, bigotes, etc.) en imágenes de una sola cámara.
- Seguimiento de mirada y actividad de bigotes: los keypoints de pupilas y bigotes permiten inferir dirección de atención y movimientos exploratorios.
- Integración con Lightning Pose: compatible con el ecosistema de entrenamiento, evaluación y despliegue de la librería.
- Procesamiento de vídeo: al ser un modelo de regresión por imagen, puede aplicarse frame a frame para análisis temporal.
- No soporta generación de texto, razonamiento, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- Investigación en neurociencia del comportamiento: cuantificar la orientación de la mirada y la actividad de los bigotes en roedores durante experimentos de libre movimiento, usando el modelo para extraer coordenadas de pupilas y bigotes en cada frame.
- Estudios de atención visual en animales: analizar hacia dónde dirige la mirada un animal en tareas de discriminación visual, utilizando los keypoints de pupilas para estimar la dirección de la mirada.
- Análisis de interacciones sociales: medir la posición de los ojos y la nariz en vídeos de interacciones entre individuos para correlacionar con comportamientos sociales.
- Automatización de etiquetado en laboratorios: reemplazar la anotación manual de puntos faciales en grandes volúmenes de vídeo, reduciendo tiempo y error humano.
- Validación de modelos de comportamiento: comparar las predicciones del modelo con anotaciones humanas para evaluar la fiabilidad de métricas conductuales.
- Integración en pipelines de análisis de vídeo con Lightning Pose: combinar este modelo con otros módulos de la librería para seguimiento multi-animal o corrección de errores.

## Benchmarks y rendimiento

Según la model card, el rendimiento se mide con el RMSE supervisado (en píxeles reescalados, sobre la imagen de entrenamiento reescalada). Los valores provienen de los logs de TensorBoard:

| Set | RMSE final | RMSE mejor |
|---|---|---|
| Entrenamiento | 0.34 | 0.29 |
| Validación | 0.77 | 0.64 |

No se han publicado comparaciones con otros modelos de estimación de pose en la información disponible.

## Requisitos de hardware

- No se especifican requisitos oficiales. Dado que el backbone es ResNet50, se estima que la inferencia requiere al menos 4-8 GB de VRAM en FP32, dependiendo de la resolución de entrada.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM (p. ej., NVIDIA RTX 2070, RTX 3060, A100) para un rendimiento fluido en vídeo.
- Es posible ejecutar en CPU con baja resolución y sin tiempo real, pero no es recomendable para análisis de vídeo extenso.
- Opciones de despliegue: Lightning Pose ofrece scripts de inferencia y soporte para exportar a ONNX o TensorRT, aunque no se detalla en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se recomienda consultar benchmarks de estimación de pose animal (p. ej., AP-10K, Animal Pose) para comparar con otros backbones como HRNet o ViT.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset específico (no identificado en la ficha) y puede no generalizar bien a otras especies, ángulos de cámara o condiciones de iluminación.
- El RMSE se mide en píxeles reescalados, no en píxeles originales, lo que puede dificultar la comparación con otros modelos.
- No se especifica la licencia, por lo que el uso comercial podría estar restringido; se recomienda contactar con el Allen Institute para aclarar los términos.
- No se han documentado sesgos específicos, pero al ser un modelo de visión, puede fallar en imágenes con oclusiones, baja resolución o movimiento rápido.
- La ausencia de información sobre el formato de pesos y la versión de Lightning Pose puede complicar la reproducción exacta de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AllenInstitute/lightning-pose-data_name-ctlut-face-disc-model
- Librería Lightning Pose: https://github.com/paninski-lab/lightning-pose (no confirmado en la búsqueda, pero es el repositorio oficial conocido)
