# Sagarss9812/mediscan-efficientnet-b0

## Resumen

MediScan EfficientNet-B0 es un modelo de clasificación de imágenes médicas basado en la arquitectura EfficientNet-B0, desarrollado en el contexto del proyecto MediScan. El sistema está diseñado para clasificar radiografías de tórax y lesiones cutáneas, calcular puntuaciones de confianza y generar mapas de activación Grad-CAM para explicar las decisiones del modelo. El repositorio en HuggingFace, publicado por el usuario Sagarss9812, está vinculado a un proyecto más amplio descrito en GitHub y en un sitio web de demostración que presenta un conjunto de modelos (ensemble) para el análisis de radiografías de tórax, incluyendo detección con YOLOv12m, clasificación con EfficientNet-B0 y segmentación con una U-Net de Lungmask, abarcando 15 clases de enfermedades pulmonares.

El modelo se presenta como un componente de apoyo al diagnóstico clínico, con un enfoque en la interpretabilidad mediante Grad-CAM. EfficientNet-B0 es una red neuronal convolucional compacta, con alrededor de 5,3 millones de parámetros, lo que la hace adecuada para entornos con recursos computacionales limitados. Sin embargo, en el momento de la consulta, el repositorio de HuggingFace no contiene pesos descargables (tamaño 0.0 GB) y la model card está prácticamente vacía, por lo que la información operativa debe obtenerse de las fuentes externas del proyecto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN) |
| Parametros totales | ~5,3 millones (valor de referencia para EfficientNet-B0) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no aplica) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio muestra 0.0 GB) |

## Arquitectura y entrenamiento

EfficientNet-B0 es una red neuronal convolucional basada en el escalado compuesto de profundidad, anchura y resolución, introducida por Tan y Le en 2019. Su bloque principal es un MBConv (Mobile Inverted Bottleneck) con conexiones residuales. En el contexto de MediScan, se utiliza como clasificador de imágenes médicas mediante transfer learning. El proyecto menciona que se comparan arquitecturas ResNet50 y EfficientNet-B0 para la clasificación de radiografías de tórax y lesiones cutáneas, y que se emplea Grad-CAM para visualizar las regiones relevantes en la decisión.

No se han proporcionado detalles sobre el dataset de entrenamiento, el número de muestras, la composición de las clases ni el proceso de optimización. El sitio web del proyecto menciona un ensemble que incluye un modelo de detección YOLOv12m, un clasificador EfficientNet-B0 y un segmentador U-Net de Lungmask, capaz de leer radiografías de tórax y clasificar 15 enfermedades pulmonares. No hay información sobre entrenamiento con RLHF, DPO o técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Clasificación de imágenes médicas: radiografías de tórax y lesiones cutáneas.
- Cálculo de puntuaciones de confianza para cada predicción.
- Generación de mapas de activación Grad-CAM para visualizar las regiones de la imagen que influyen en la clasificación.
- Soporte para 15 clases de enfermedades pulmonares en el contexto del ensemble descrito en el sitio web del proyecto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step, al ser un modelo de visión.
- No presenta capacidades multilingües, ya que no procesa texto.

## Casos de uso

- Diagnóstico asistido por radiografía de tórax: el modelo puede clasificar radiografías en 15 clases de enfermedades pulmonares, proporcionando una puntuación de confianza y un mapa Grad-CAM para que el radiólogo revise las regiones de interés.
- Detección de lesiones cutáneas: MediScan también aborda la clasificación de lesiones de piel, lo que permite su uso en programas de cribado dermatológico con recursos limitados.
- Sistemas de apoyo a la decisión clínica en hospitales: al integrar clasificación y visualización interpretable, el modelo puede incorporarse a flujos de trabajo de triaje, señalando casos que requieren revisión prioritaria.
- Investigación en transfer learning para imágenes médicas: EfficientNet-B0 ofrece un punto de partida ligero para experimentar con arquitecturas y técnicas de interpretabilidad en datasets médicos.
- Despliegue en entornos con poca capacidad de cómputo: al ser un modelo de ~5,3 millones de parámetros, puede ejecutarse en CPU o en GPUs de gama baja, facilitando su uso en clínicas rurales o dispositivos edge.
- Comparación de arquitecturas en proyectos académicos: el proyecto MediScan utiliza EfficientNet-B0 frente a ResNet50 para evaluar qué arquitectura generaliza mejor en la clasificación de imágenes médicas, lo que sirve como caso de estudio metodológico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 para una imagen de 224x224, según el tamaño típico de EfficientNet-B0.
- GPU recomendada: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, RTX 2060, GTX 1660) es suficiente; también puede ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, incluyendo RTX 3060, RTX 4090 y similares.
- Opciones de despliegue: PyTorch, TensorFlow, ONNX; no se mencionan herramientas como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Uso en MediScan | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientNet-B0 | CNN | ~5,3 M | Clasificación de imágenes médicas | MIT (según repo HuggingFace) | Repositorio sin pesos |
| ResNet50 | CNN | ~25,6 M | Clasificación de imágenes médicas | no disponible | Mencionado en GitHub |
| YOLOv12m | Detección de objetos | no disponible | Detección en ensemble de radiografías | no disponible | Mencionado en sitio web |

No se dispone de datos de rendimiento comparativo publicados.

## Limitaciones y advertencias

- El repositorio de HuggingFace no contiene pesos descargables (tamaño 0.0 GB) y la model card está vacía, por lo que el modelo no es utilizable en su estado actual.
- La información sobre el entrenamiento es incompleta: no se especifica el dataset, la composición de las clases ni el protocolo de validación clínica.
- Los sesgos en los datos de imágenes médicas pueden afectar a la precisión en poblaciones no representadas, aunque no se proporciona información sobre la procedencia de los datos.
- Existe riesgo de errores de clasificación en un dominio crítico como el diagnóstico médico; el modelo debe usarse como apoyo, no como sustituto del criterio clínico.
- La licencia MIT permite uso comercial, pero no implica ninguna garantía de seguridad ni de aptitud para uso médico.
- Las fuentes externas del proyecto (GitHub y sitio web) no están necesariamente vinculadas de forma oficial al autor del repositorio de HuggingFace, lo que genera incertidumbre sobre la autoría y el mantenimiento.

## Enlaces

- HuggingFace: https://huggingface.co/Sagarss9812/mediscan-efficientnet-b0
- GitHub (README de MediScan): https://github.com/SahilPatil756/mediscan/blob/main/README.md
- Sitio web de demostración MediScan: https://michaelgetu.vercel.app/work/mediscan
