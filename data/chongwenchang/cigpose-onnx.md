# ChongwenChang/cigpose-onnx

## Resumen

CIGPose (Causal Intervention Graph Pose) es un modelo de estimación de pose de cuerpo completo (whole-body pose estimation) que aborda el problema del confundimiento visual: los estimadores de pose tienden a confundirse por el contexto visual, como una mano cerca de una taza o un hombro detrás de otra persona. El modelo aplica intervención causal para mitigar este efecto y mejorar la precisión en escenarios con oclusiones y fondos complejos. El repositorio `cigpose-onnx` proporciona modelos ONNX pre-exportados y un script de inferencia ligero, sin necesidad de PyTorch ni MMPose, lo que facilita su integración en producción. El modelo original fue desarrollado por el equipo de 53mins y los pesos provienen del pipeline de entrenamiento original basado en MMPose. La conversión a ONNX y el wrapper de inferencia han sido publicados por namas191297, y la versión en HuggingFace está alojada por ChongwenChang bajo licencia Apache 2.0. El modelo alcanza un 67.5 de Whole AP en COCO-WholeBody.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo top-down de estimación de pose, basado en CIGPose) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (modelos pre-exportados) |

## Arquitectura y entrenamiento

La arquitectura interna de CIGPose no se detalla en la información disponible. Se sabe que es un enfoque top-down de estimación de pose que utiliza intervención causal (causal intervention) para reducir el efecto del contexto visual confundente. El modelo original fue entrenado con el pipeline de MMPose, aunque no se especifican los datos de entrenamiento ni el número de tokens (al ser visión, no aplica). La conversión a ONNX se realizó a partir de los pesos del modelo original, y el repositorio `cigpose-onnx` ofrece un script de inferencia de un solo archivo que no requiere dependencias de PyTorch ni MMPose, solo ONNX Runtime.

## Capacidades

- Estimación de pose de cuerpo completo (cara, manos, cuerpo y pies) en imágenes.
- Inferencia ligera mediante ONNX Runtime, sin necesidad de PyTorch ni MMPose.
- Manejo de oclusiones y fondos complejos gracias al enfoque de intervención causal.
- Integración sencilla en pipelines de visión por computador mediante CLI o API.
- Compatible con múltiples plataformas (CPU y GPU) gracias al formato ONNX.

## Casos de uso

- Seguimiento de personas en vídeo: el modelo puede estimar la pose de varias personas en tiempo real, útil para análisis de actividad o seguridad. Su robustez ante oclusiones permite mantener el seguimiento incluso cuando partes del cuerpo quedan ocultas.
- Realidad aumentada y filtros: la estimación de manos y cara permite superponer elementos virtuales sobre el cuerpo humano, por ejemplo en aplicaciones de maquillaje virtual o avatares animados.
- Análisis de movimiento en deporte o rehabilitación: al detectar puntos clave del cuerpo, se pueden calcular ángulos articulares y métricas de movimiento, con aplicaciones en biomecánica o fisioterapia.
- Interacción humano-computador: el modelo puede servir como entrada para sistemas de control por gestos, donde la posición de las manos se utiliza para manejar interfaces sin contacto físico.
- Automatización de procesos de etiquetado: en entornos de anotación de datos, el modelo puede pre-anotar poses de cuerpo completo para acelerar la creación de datasets de entrenamiento.
- Robótica colaborativa: la estimación de pose en tiempo real permite a un robot adaptar su comportamiento según la postura de un operario, mejorando la seguridad en entornos industriales.

## Benchmarks y rendimiento

El modelo reporta un 67.5 de Whole AP en el conjunto de datos COCO-WholeBody. No se han publicado resultados comparativos con otros modelos en la información disponible.

| Benchmark | Resultado |
|---|---|
| COCO-WholeBody (Whole AP) | 67.5 |

## Requisitos de hardware

- Al ser un modelo ONNX, puede ejecutarse en CPU con un rendimiento aceptable para inferencia por imagen, aunque en tiempo real se recomienda GPU.
- No se especifica la VRAM necesaria; depende del tamaño del modelo ONNX, que no se indica en la información disponible.
- Se puede desplegar con ONNX Runtime en Python, C++ o mediante el CLI proporcionado en el repositorio.
- Para integración en producción, es posible usar ONNX Runtime con aceleración GPU (CUDA) o TensorRT, aunque no se documentan configuraciones específicas.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de estimación de pose (como OpenPose, MediaPipe o MMPose). La única métrica disponible es el Whole AP de 67.5 en COCO-WholeBody, que puede servir como referencia, pero sin datos de otros modelos no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o limitaciones específicas del modelo. Al ser un modelo de visión, puede presentar errores en condiciones de iluminación extrema, oclusiones severas o con personas de ciertas etnias o tipos de cuerpo si el dataset de entrenamiento no era diverso.
- El modelo es una conversión ONNX; no se garantiza que el rendimiento sea idéntico al del modelo original en PyTorch, aunque la conversión suele ser fiel.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo original y de MMPose por si hubiera restricciones adicionales.
- El repositorio no incluye documentación sobre el tamaño de los modelos ni requisitos de memoria, lo que dificulta la planificación de despliegue.
- No se proporcionan garantías de soporte o mantenimiento del repositorio; es un proyecto de terceros.

## Enlaces

- Repositorio GitHub: https://github.com/namas191297/cigpose-onnx
- Paquete PyPI: https://pypi.org/project/cigpose-onnx/
- Documentación en DeepWiki: https://deepwiki.com/namas191297/cigpose-onnx
- Modelo en HuggingFace: https://huggingface.co/ChongwenChang/cigpose-onnx
