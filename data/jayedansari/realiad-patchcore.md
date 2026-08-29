# JayedAnsari/realiad-patchcore

## Resumen

El modelo `JayedAnsari/realiad-patchcore` es un sistema de detección y localización de anomalías industriales no supervisado, desarrollado por JayedAnsari sobre el dataset Real-IAD. Emplea una arquitectura estilo PatchCore con un backbone Wide ResNet-50-2 preentrenado y bancos de memoria específicos por categoría de objeto. El objetivo es identificar defectos en imágenes de productos industriales utilizando únicamente muestras normales durante el entrenamiento, un enfoque habitual en control de calidad automatizado.

La relevancia de este modelo radica en su aplicación práctica en entornos de fabricación donde los defectos son raros y difíciles de etiquetar. Al basarse en PatchCore, ofrece un equilibrio entre precisión y eficiencia computacional, siendo adecuado para inspección visual en tiempo real. El repositorio tiene un tamaño de 1,1 GB, lo que sugiere que los pesos del modelo están almacenados en formato de precisión completa o cuantización ligera, aunque no se especifica el formato exacto.

La información pública es limitada: la model card solo incluye la licencia MIT y no se detallan métricas de rendimiento ni especificaciones técnicas completas. Aun así, la implementación está disponible en GitHub con un notebook de ejemplo, lo que facilita su reproducción y adaptación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PatchCore (memoria de vecinos más cercanos) con backbone Wide ResNet-50-2 |
| Parametros totales | no disponible (el backbone Wide ResNet-50-2 tiene ~68M de parámetros, pero el modelo completo no se especifica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors o .pt, no se indica en la documentación) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PatchCore, un método de detección de anomalías basado en la comparación de características mediante vecinos más cercanos. El backbone es una Wide ResNet-50-2 preentrenada en ImageNet, de la que se extraen características de diferentes capas para construir un banco de memoria con las representaciones de imágenes normales. Durante la inferencia, se calcula la distancia entre las características de la imagen de prueba y las del banco de memoria; una distancia elevada indica una anomalía.

El entrenamiento se realiza de forma no supervisada, utilizando únicamente imágenes normales de cada categoría del dataset Real-IAD. Se construyen bancos de memoria específicos por categoría, lo que permite adaptar el modelo a distintos tipos de objetos industriales. No se menciona el uso de técnicas de refuerzo o ajuste fino adicional más allá del preentrenamiento del backbone. El dataset Real-IAD incluye múltiples vistas y alta resolución, lo que contribuye a la robustez del sistema.

## Capacidades

- Detección de anomalías en imágenes industriales: identifica si una imagen contiene un defecto o no.
- Localización de defectos: genera mapas de anomalías que señalan la región aproximada donde se encuentra el defecto.
- Entrenamiento no supervisado: solo requiere imágenes normales, sin necesidad de etiquetas de defectos.
- Adaptación por categoría: bancos de memoria específicos para cada tipo de objeto (por ejemplo, botellas, placas de circuito, etc.).
- Inferencia eficiente: al usar vecinos más cercanos, la inferencia es relativamente rápida en comparación con métodos generativos.
- Integración sencilla: el notebook proporcionado facilita la reproducción y el uso del modelo.

## Casos de uso

- Control de calidad en líneas de fabricación: el modelo puede inspeccionar productos en tiempo real para detectar rayones, abolladuras o decoloraciones. Su naturaleza no supervisada permite entrenarlo con imágenes de productos sin defectos, evitando la costosa recopilación de ejemplos defectuosos.
- Inspección visual de componentes electrónicos: placas de circuito, conectores y otros elementos pueden ser analizados para detectar soldaduras defectuosas o componentes mal colocados. La localización de anomalías ayuda a los operarios a identificar la zona exacta del fallo.
- Mantenimiento predictivo en maquinaria: mediante cámaras fijas, el modelo puede monitorizar el estado de piezas mecánicas y alertar sobre desgaste o daños incipientes antes de que provoquen fallos mayores.
- Auditoría de calidad en alimentos y bebidas: detección de envases dañados, etiquetas mal impresas o contaminación visual en productos envasados. La capacidad de trabajar con múltiples categorías permite adaptarse a distintos formatos.
- Inspección de textiles y superficies: identificación de irregularidades en telas, cuero o materiales laminados, como agujeros, manchas o variaciones de color. El modelo puede integrarse en sistemas de visión existentes.
- Investigación académica en detección de anomalías: sirve como punto de partida para comparar con otros métodos o para estudiar el comportamiento de PatchCore en el dataset Real-IAD, que es más desafiante que datasets sintéticos como MVTec.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de GitHub no incluye métricas cuantitativas (como AUROC o F1) ni comparaciones con otros métodos. Se recomienda consultar el notebook para reproducir los resultados o contactar con el autor para obtener datos adicionales.

## Requisitos de hardware

- VRAM estimada: dado que el modelo pesa 1,1 GB en el repositorio, se estima que la inferencia requiere entre 2 y 4 GB de VRAM en precisión FP32, y menos si se cuantiza. Sin embargo, no se dispone de datos exactos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como una NVIDIA GTX 1650, RTX 3050 o superior, debería ser suficiente para inferencia. Para entrenamiento, se recomienda una GPU con 8 GB o más, como RTX 3070 o A100.
- Compatibilidad con consumer GPU: sí, el modelo es ligero y cabe en GPUs de gama media.
- Opciones de despliegue: al ser un modelo de visión basado en PyTorch, puede desplegarse con TorchServe, ONNX Runtime o mediante una API REST con FastAPI. No se menciona soporte para vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible. La latencia dependerá del hardware y del tamaño de las imágenes de entrada (Real-IAD usa 1024×1024, lo que puede aumentar el tiempo de procesamiento).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de detección de anomalías. Sin embargo, se puede contextualizar con alternativas conocidas:

| Modelo | Arquitectura | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|
| PatchCore (original) | ResNet-50 + memoria | MVTec AD | MIT | Código abierto |
| PaDiM | ResNet-18/50 + distribución gaussiana | MVTec AD | Apache 2.0 | Código abierto |
| Real-IAD PatchCore (este modelo) | Wide ResNet-50-2 + memoria | Real-IAD | MIT | Código abierto |

La principal diferencia es el dataset de entrenamiento: Real-IAD es más realista y desafiante que MVTec, con múltiples vistas y mayor variabilidad. El uso de Wide ResNet-50-2 en lugar de ResNet-50 puede ofrecer características más ricas, aunque no se han publicado resultados comparativos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo con imágenes normales de Real-IAD, el modelo puede no generalizar bien a objetos o condiciones de iluminación muy diferentes a las del dataset.
- Riesgo de alucinación: no aplica, al ser un modelo de visión no genera texto, pero puede producir falsos positivos (marcar como anómalo algo que no lo es) o falsos negativos.
- Limitaciones de contexto: el modelo está diseñado para imágenes de resolución 1024×1024; usar otras resoluciones puede degradar el rendimiento.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero no se proporciona garantía ni soporte oficial.
- Caveat para producción: la falta de benchmarks publicados dificulta evaluar su fiabilidad en entornos reales. Se recomienda validar el modelo con datos propios antes de implementarlo en una línea de producción.

## Enlaces

- HuggingFace: https://huggingface.co/JayedAnsari/realiad-patchcore
- Repositorio GitHub: https://github.com/Jayed08/realiad-patchcore-anomaly-detection
- Notebook de ejemplo: https://github.com/Jayed08/realiad-patchcore-anomaly-detection/blob/main/real-iad-anomaly-detection.ipynb
- Dataset Real-IAD: https://realiad4ad.github.io/Real-IAD/
