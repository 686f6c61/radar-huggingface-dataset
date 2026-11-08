# goto4711/resnet-50-untrained-ONNX

## Resumen

`goto4711/resnet-50-untrained-ONNX` es una exportación a ONNX de la arquitectura ResNet-50 con pesos aleatorios (sin entrenar, semilla 0), publicada por el usuario goto4711 para su uso con Transformers.js. Mantiene la misma arquitectura, el mismo preprocesado y las mismas 1.000 etiquetas de ImageNet que el modelo base `microsoft/resnet-50`, pero sustituye los pesos entrenados por inicializaciones aleatorias. El modelo se creó para el proyecto Difference Suite (Deep Culture, University of Amsterdam) con el objetivo didáctico de comparar el comportamiento de una red antes y durante el entrenamiento.

Se trata, por tanto, de un artefacto de investigación y docencia, no de un clasificador de imágenes funcional. Al no haber sido entrenado, sus predicciones sobre imágenes reales son esencialmente aleatorias y no deben interpretarse como clasificaciones válidas. Su interés radica en servir como línea base de control en experimentos sobre aprendizaje y representación.

La relevancia actual es limitada fuera de ese contexto: resulta útil para demostrar empíricamente qué aporta el entrenamiento a una CNN, para depurar pipelines de exportación ONNX/Transformers.js o para validar infraestructura de inferencia sin depender de pesos con licencias o tamaños mayores. El repositorio ocupa 0.0 GB según los metadatos, lo que sugiere que los pesos pueden no estar completamente subidos o que el tamaño es muy reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-50 (CNN con conexiones residuales, 50 capas) |
| Parametros totales | no disponible (la arquitectura ResNet-50 estándar ronda los 25,6 M, dato no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el tag `base_model:quantized:microsoft/resnet-50` sugiere algún grado de cuantización, sin detalle) |
| Idiomas soportados | no disponible (clasificación de imágenes, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado para Transformers.js) |

## Arquitectura y entrenamiento

La arquitectura es ResNet-50, una red neuronal convolucional con bloques residuales y 50 capas, idéntica a la del modelo base `microsoft/resnet-50`. Incluye el mismo preprocesado de imagen y el mismo vocabulario de 1.000 etiquetas de ImageNet. La diferencia fundamental es que los pesos son aleatorios (semilla 0) y no han pasado por ningún proceso de entrenamiento supervisado, ajuste fino, RLHF ni destilación.

El script de exportación se encuentra en `scripts/export-learning-models.py` dentro del repositorio Difference Suite (github.com/deep-culture/difference-suite). El propósito declarado es didáctico: mostrar el comportamiento de la red antes y durante el entrenamiento en el marco del proyecto Difference Suite. No se documentan innovaciones técnicas adicionales, datasets de entrenamiento ni detalles de cuantización más allá del tag de modelo cuantizado heredado del base.

## Capacidades

- Clasificación de imágenes en 1.000 categorías de ImageNet a nivel de arquitectura, pero sin capacidad predictiva útil al carecer de entrenamiento.
- Exportación ONNX compatible con Transformers.js para inferencia en navegador o Node.js.
- Reutilización del preprocesado y las etiquetas de `microsoft/resnet-50`.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión generativa; es un clasificador discriminativo.
- Sirve como línea base de control para experimentos de aprendizaje.

## Casos de uso

- Docencia sobre aprendizaje profundo: usar el modelo como referencia de "red sin entrenar" para comparar sus activaciones y predicciones con las de un ResNet-50 entrenado, ilustrando el efecto del entrenamiento.
- Depuración de pipelines ONNX/Transformers.js: validar que la carga del modelo, el preprocesado y la inferencia funcionan correctamente sin depender de pesos entrenados de gran tamaño.
- Pruebas de infraestructura de despliegue: verificar latencia, memoria y compatibilidad en entornos web o edge antes de sustituir por un modelo entrenado.
- Investigación en el Difference Suite: reproducir los experimentos del proyecto Deep Culture sobre diferencias de representación antes y durante el entrenamiento.
- Benchmarking de exportación: comprobar el correcto funcionamiento de scripts de exportación de PyTorch a ONNX para arquitecturas ResNet.
- Demostraciones educativas interactivas: mostrar en un navegador cómo una red no entrenada produce salidas sin sentido frente a una entrenada, gracias a Transformers.js.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de precisión sobre ImageNet sería equivalente a azar y no resulta informativa.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un ResNet-50 estándar en FP32 ocupa aproximadamente 100 MB de pesos, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU, GPU integrada o incluso en navegador mediante Transformers.js.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090) y en dispositivos edge.
- Opciones de despliegue: Transformers.js (principal), ONNX Runtime, y potencialmente conversión a otros runtimes ONNX.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser una CNN pequeña, la latencia sería del orden de milisegundos en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Formato |
|---|---|---|---|---|---|
| goto4711/resnet-50-untrained-ONNX | no disponible (~25,6 M arquitectura) | no aplica | No (pesos aleatorios) | Apache 2.0 | ONNX |
| microsoft/resnet-50 | no disponible (~25,6 M arquitectura) | no aplica | Sí (ImageNet) | Apache 2.0 | PyTorch / safetensors |
| onnxmodelzoo/resnet50-v2-7 | no disponible | no aplica | Sí (ImageNet) | no disponible | ONNX |

La diferencia clave frente a las alternativas es que este modelo no está entrenado, por lo que no es comparable en rendimiento predictivo. Su utilidad es exclusivamente como referencia de control o para pruebas técnicas.

## Limitaciones y advertencias

- Los pesos son aleatorios: las predicciones no tienen valor semántico y no deben usarse en producción para clasificación real.
- Riesgo total de "alucinación" en el sentido de salidas arbitrarias: el modelo asignará clases ImageNet sin relación con la imagen de entrada.
- No apto para uso comercial como clasificador; la licencia Apache 2.0 permite el uso, pero el modelo carece de funcionalidad práctica.
- El tamaño del repositorio indicado (0.0 GB) sugiere que los pesos pueden no estar completamente disponibles; conviene verificar la integridad de los archivos antes de usarlo.
- No se documentan sesgos específicos porque no hay entrenamiento que los introduzca, pero tampoco hay garantías de comportamiento.
- El tag `base_model:quantized:microsoft/resnet-50` indica una posible cuantización no detallada, lo que podría afectar a la reproducibilidad.
- Sin soporte de idiomas ni de texto; cualquier expectativa de procesamiento lingüístico es infundada.

## Enlaces

- Hugging Face: https://huggingface.co/goto4711/resnet-50-untrained-ONNX
- Modelo base: https://huggingface.co/microsoft/resnet-50
- Repositorio Difference Suite: https://github.com/deep-culture/difference-suite
- ONNX Model Zoo ResNet-50: https://github.com/onnx/models/blob/main/validated/vision/classification/resnet/model/resnet50-v2-7.onnx
- ONNX Model Zoo en Hugging Face: https://huggingface.co/onnxmodelzoo/resnet50-v2-7
