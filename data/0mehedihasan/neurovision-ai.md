# 0mehedihasan/neurovision-ai

## Resumen

NeuroVision AI es un sistema de inteligencia artificial explicable orientado a la clasificación de tumores cerebrales mediante imágenes médicas. El modelo, desarrollado por el autor 0mehedihasan, emplea una arquitectura EfficientNet-B0 como extractor de características y técnicas Grad-CAM para generar mapas de activación que explican las decisiones del clasificador. El proyecto nace con el objetivo de cerrar la brecha de confianza en el diagnóstico asistido por IA: no solo detecta anomalías, sino que visualiza qué regiones de la imagen han influido en la decisión, facilitando su uso en entornos clínicos.

La ficha que se presenta a continuación se basa exclusivamente en la información pública disponible en Hugging Face y en el repositorio de GitHub vinculado al autor. Dado que el modelo no dispone de una model card completa ni de métricas de rendimiento publicadas, la mayor parte de los parámetros técnicos se indican como "no disponible". A pesar de ello, se documentan las características conocidas y se ofrecen orientaciones prácticas para su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (clasificador de imágenes) con Grad-CAM para explicabilidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (entrada de imágenes) |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura EfficientNet-B0, una red convolucional eficiente que logra un buen equilibrio entre precisión y coste computacional. La capa final se adapta para la clasificación de tumores cerebrales, y se integra Grad-CAM para generar mapas de activación de las últimas capas convolucionales, que se superponen a la imagen original para visualizar las regiones que contribuyen a la decisión. No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de épocas ni el proceso de optimización. La licencia MIT permite el uso comercial y la modificación libre, aunque la ausencia de documentación técnica limita su reproducibilidad.

## Capacidades

- Clasificación de imágenes médicas, específicamente para la detección de tumores cerebrales.
- Explicabilidad mediante mapas de calor Grad-CAM, que señalan las regiones de la imagen que influyen en la predicción.
- No se han documentado capacidades adicionales como detección de otros tipos de lesiones, segmentación semántica o soporte de múltiples modalidades de imagen.
- Al ser un modelo de visión, no ofrece generación de texto, razonamiento lingüístico ni tool calling.

## Casos de uso

- **Diagnóstico asistido en radiología**: el modelo puede procesar resonancias magnéticas (RM) para clasificar si existe un tumor cerebral y, mediante Grad-CAM, mostrar al radiólogo las áreas de la imagen que han determinado la decisión, facilitando la revisión y la confianza en el resultado.
- **Segundo análisis clínico**: como herramienta de apoyo, el sistema puede ofrecer una segunda opinión automática sobre imágenes sospechosas, siempre bajo supervisión médica.
- **Investigación en imagen médica**: los mapas de Grad-CAM pueden utilizarse para estudiar qué patrones visuales asocia el modelo con la presencia de tumores, ayudando a comprender mejor las características radiológicas.
- **Formación de profesionales sanitarios**: la visualización de las regiones activadas permite a los estudiantes de medicina comparar sus propias observaciones con las del modelo, mejorando la comprensión de los signos radiológicos.
- **Desarrollo de pipelines de diagnóstico**: al ser un modelo ligero (EfficientNet-B0), puede integrarse en sistemas de triaje automático que prioricen imágenes sospechosas para su revisión manual.
- **Evaluación de la explicabilidad**: sirve como caso de estudio para comparar técnicas de explicabilidad (Grad-CAM frente a otras como SHAP o LIME) en el dominio de la imagen médica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, sensibilidad, especificidad o AUC en conjuntos de datos estándar (p. ej., BraTS, TCGA). Tampoco se han comparado con otros modelos de clasificación de tumores. Por lo tanto, no se pueden presentar datos cuantitativos de rendimiento.

## Requisitos de hardware

- No se han especificado requisitos de hardware por el autor.
- Dado que EfficientNet-B0 es un modelo compacto, es probable que pueda ejecutarse en una GPU de gama media (por ejemplo, NVIDIA GTX 1660 o RTX 2060) con 6-8 GB de VRAM para inferencia en lote.
- Para entrenamiento o fine-tuning se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior).
- El despliegue puede realizarse con frameworks estándar de PyTorch o TensorFlow, así como con herramientas de servicio como TorchServe o TensorFlow Serving.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. No se han identificado otras implementaciones de clasificación de tumores cerebrales con la misma arquitectura y explicabilidad en el repositorio del autor. Por lo tanto, no se puede ofrecer una comparativa numérica.

## Limitaciones y advertencias

- No se ha publicado información sobre los datos de entrenamiento, lo que impide conocer posibles sesgos en las imágenes utilizadas (procedencia, distribución de edades, tipo de scanner, etc.).
- La explicabilidad de Grad-CAM es aproximada y puede no reflejar la causalidad real; las regiones destacadas no siempre son las únicas relevantes.
- El modelo está orientado a la clasificación de tumores cerebrales, pero no se ha validado clínicamente. No debe utilizarse como único criterio diagnóstico sin supervisión médica.
- La ausencia de documentación sobre el preprocesamiento de imágenes, el tamaño de entrada esperado y el formato de las imágenes (por ejemplo, dimensiones, canales) limita la reproducibilidad.
- No se ha publicado ningún resultado de evaluación, por lo que se desconoce su precisión real y su comportamiento en casos difíciles.
- La licencia MIT permite el uso comercial, pero no incluye ninguna garantía de exactitud o seguridad para el uso médico.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/0mehedihasan/neurovision-ai)
- [Repositorio en GitHub](https://github.com/0mehedihasan/neurovision-ai)
- [Proyecto NeuroVision AI (GitHub)](https://github.com/neurovision-ai) - organización con proyectos relacionados
- [Demo en Vercel (Alzheimer's detection)](https://neurovision-ai.vercel.app/) - proyecto diferente pero relacionado con la iniciativa
- [Devpost - NeuroVision AI (tumor)](https://devpost.com/software/neurovision-ai-oie6u3) - descripción del proyecto en hackathon
- [Devpost - NeuroVision (segmentación)](https://devpost.com/software/neurovision-gp64ej) - otro proyecto de la misma iniciativa con U-Net
