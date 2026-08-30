# nkemuduku/crop-disease-model

## Resumen

El modelo `nkemuduku/crop-disease-model` es un proyecto publicado en Hugging Face por el usuario `nkemuduku`, con licencia MIT y etiqueta regional `us`. Según el repositorio de GitHub asociado, se trata de un sistema de detección de enfermedades de cultivos basado en aprendizaje profundo, que clasifica enfermedades a partir de imágenes de hojas, proporciona confianza en las predicciones, explica las decisiones mediante SHAP/LIME y sirve las predicciones a través de una API REST con FastAPI. Sin embargo, la información disponible en Hugging Face es extremadamente limitada: el repositorio tiene un tamaño de 0.0 GB, lo que sugiere que no se han subido pesos del modelo ni archivos de configuración. No se especifica la arquitectura, el número de parámetros, la longitud de contexto ni los idiomas soportados. La model card solo contiene la licencia, sin detalles adicionales. Por tanto, esta ficha se basa principalmente en el repositorio de código y en la escasa metadata de Hugging Face, indicando explícitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio menciona deep learning, posiblemente CNN o ViT, pero sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo en HF está vacío, 0.0 GB) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura del modelo. El repositorio de GitHub indica que se utiliza aprendizaje profundo para clasificar enfermedades de plantas a partir de imágenes de hojas, pero no se detalla si se trata de una red convolucional (CNN), un Vision Transformer (ViT) u otra variante. Tampoco se han publicado datos sobre el conjunto de entrenamiento, el número de tokens (en este caso, píxeles) ni el proceso de optimización (RLHF, DPO, etc.). La ausencia de archivos en el repositorio de Hugging Face sugiere que el modelo no ha sido subido, o que solo se comparte el código fuente. No se conocen innovaciones técnicas específicas más allá de la mención a SHAP/LIME para explicabilidad, que es un componente del sistema, no del modelo en sí.

## Capacidades

- Clasificación de enfermedades de cultivos a partir de imágenes de hojas (según el repositorio de GitHub).
- Proporciona confianza en las predicciones (probabilidad de clase).
- Explicación de predicciones mediante SHAP/LIME (integración en el pipeline).
- Servicio de predicciones a través de una API REST (FastAPI).
- Interfaz interactiva (mencionada en el repositorio, aunque no se detalla).
- No se han documentado capacidades de generación de texto, razonamiento, tool calling, agentes ni multilingüismo; al ser un modelo de visión, estas capacidades no aplican.

## Casos de uso

- Agricultura de precisión: los agricultores pueden fotografiar hojas de cultivos y obtener un diagnóstico automático de enfermedades, lo que permite una intervención temprana y reduce pérdidas. El modelo está diseñado para clasificar enfermedades a partir de imágenes, con confianza asociada.
- Asistencia a agrónomos: los técnicos pueden usar el sistema como apoyo en campo, combinando la predicción con explicaciones SHAP/LIME para entender qué regiones de la hoja influyen en la decisión.
- Integración en plataformas de gestión agrícola: mediante la API REST, el modelo puede conectarse a aplicaciones móviles o web para ofrecer diagnóstico en tiempo real.
- Educación y formación: estudiantes de agronomía pueden utilizar el sistema para aprender a identificar enfermedades, gracias a las explicaciones generadas.
- Monitorización de cultivos a gran escala: con drones o cámaras fijas, las imágenes se procesan automáticamente y se generan alertas tempranas de brotes.
- Investigación en fitopatología: los datos de predicciones y explicaciones pueden servir para estudiar patrones de enfermedad y validar modelos.

Nota: estos casos se deducen del propósito del repositorio; no hay evidencia de que el modelo esté desplegado o validado en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de GitHub no incluye métricas de precisión, recall, F1 ni comparaciones con otros modelos. Tampoco hay informes de evaluación en la model card de Hugging Face.

## Requisitos de hardware

No se dispone de requisitos de hardware específicos para este modelo, ya que no se han publicado los pesos ni la arquitectura. De manera genérica, un modelo de clasificación de imágenes basado en deep learning (por ejemplo, una CNN o un ViT) podría requerir:

- Para inferencia en CPU: al menos 4-8 GB de RAM, dependiendo del tamaño de la imagen y del modelo.
- Para inferencia en GPU: una GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650 o superior) para modelos pequeños; modelos ViT medianos pueden necesitar 8-12 GB.
- Para entrenamiento: se recomienda una GPU con 8-16 GB de VRAM (RTX 3070/4080, A100, etc.), aunque el repositorio no especifica.
- Opciones de despliegue: dado que se menciona FastAPI, el despliegue puede hacerse en contenedores Docker, con frameworks como TensorFlow Serving o TorchServe. Para inferencia ligera, también podría usarse ONNX Runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay información suficiente para una comparativa rigurosa. Se conoce la existencia de `wambugu71/crop_leaf_diseases_vit`, un Vision Transformer ajustado para clasificar enfermedades de plantas, pero no se dispone de sus métricas ni especificaciones. Otros modelos de detección de enfermedades de cultivos existen en la literatura (p. ej., basados en ResNet, EfficientNet), pero no se pueden comparar sin datos. Por tanto, la comparativa se limita a indicar que no hay datos disponibles.

## Limitaciones y advertencias

- La información pública es insuficiente: no se han publicado los pesos, la arquitectura ni los detalles de entrenamiento, lo que impide evaluar su rendimiento y reproducibilidad.
- No hay evidencia de validación en condiciones reales de campo; el repositorio parece un proyecto de demostración, no un sistema probado en producción.
- Riesgo de sesgo en los datos de entrenamiento: al no conocer el dataset, no se puede descartar que esté desequilibrado o que no generalice a otras variedades de cultivos o condiciones climáticas.
- Posibles alucinaciones o errores de clasificación: como cualquier modelo de visión, puede fallar ante imágenes de baja calidad, iluminación variable o enfermedades poco representadas.
- La licencia MIT permite uso comercial y modificación, pero al no haber un modelo publicado, la licencia aplica solo al código del repositorio, no a pesos inexistentes.
- No se ha documentado el soporte multilingüe; la interfaz y las explicaciones probablemente estén en inglés, lo que limita su uso en regiones hispanohablantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkemuduku/crop-disease-model
- Repositorio de GitHub: https://github.com/nkemuduku/Crop-Disease-Detection
- README del repositorio: https://github.com/nkemuduku/Crop-Disease-Detection/blob/main/README.md
- Modelo similar (ViT para enfermedades de hojas): https://huggingface.co/wambugu71/crop_leaf_diseases_vit
