# ketiswp/onnx-model-zoo-MobileNetV2-ImageNet-opset12-fp32-onnx

## Resumen

Este repositorio aloja una versión del modelo MobileNetV2 del ONNX Model Zoo, convertida al formato ONNX con precisión FP32 y opset 12, preparada para su uso con ONNX Runtime. El modelo original fue desarrollado por el equipo de ONNX Model Zoo y está entrenado con el conjunto de datos ImageNet para tareas de clasificación de imágenes en 1000 categorías. Su relevancia radica en su eficiencia computacional y reducido tamaño, lo que lo hace idóneo para entornos embebidos, móviles y aplicaciones en el borde, donde el consumo de recursos es crítico. La versión aquí publicada, mantenida por el usuario ketiswp, ofrece una alternativa de alto nivel de precisión (FP32) frente a su contraparte INT8, y facilita su integración en pipelines de visión artificial mediante el ecosistema ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (red neuronal convolucional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | FP32 (tambien disponible una version INT8) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin soporte de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 12) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura MobileNetV2, una red neuronal convolucional que emplea bloques residuales invertidos con cuellos de botella lineales, optimizada para reducir el coste computacional y el número de parámetros sin sacrificar precisión. El entrenamiento se realizó sobre el conjunto de datos ImageNet, que contiene 1000 clases de objetos, y el modelo resultante se exportó al formato ONNX con opset 12. No se han proporcionado detalles adicionales sobre el proceso de entrenamiento (número de tokens, técnicas de ajuste fino, etc.) en la información disponible.

## Capacidades

- Clasificación de imágenes: asigna una etiqueta entre 1000 categorías predefinidas de ImageNet a una imagen de entrada.
- Eficiencia computacional: diseño ligero, apto para ejecución en tiempo real en dispositivos con recursos limitados.
- Compatibilidad multiplataforma: al estar en formato ONNX, puede ejecutarse con ONNX Runtime, TensorRT, OpenVINO y otros runtime que soporten ONNX.
- Soporte de tool calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable, ya que es un modelo de visión puro.

## Casos de uso

- Clasificación de imágenes en aplicaciones móviles: el modelo puede integrarse en apps de Android o iOS mediante ONNX Runtime Mobile para clasificar objetos en tiempo real, aprovechando su eficiencia y tamaño reducido.
- Sistemas de moderación de contenido: se puede utilizar para filtrar automáticamente imágenes en plataformas sociales, identificando categorías como contenido explícito o no apropiado.
- Asistentes de accesibilidad: sirve para describir imágenes en aplicaciones de ayuda a personas con discapacidad visual, clasificando el objeto principal de la escena.
- Control de calidad en industria: en líneas de producción, puede detectar defectos o clasificar productos en categorías predefinidas a partir de imágenes capturadas por cámaras.
- Análisis de cultivos en agricultura: clasificar plantas o frutas según su tipo o estado de madurez, usando imágenes tomadas por drones o sensores.
- Educación y demostraciones de visión artificial: adecuado para prototipos y laboratorios donde se requiera un modelo de clasificación de imágenes de bajo coste y fácil despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, aunque al ser FP32 y de arquitectura ligera, se espera un uso reducido de memoria.
- GPU recomendadas: no disponible, pero es probable que funcione en GPUs de gama baja o incluso en CPUs modernas.
- Compatibilidad con GPU de consumo: sí, puede ejecutarse en tarjetas como RTX 2060 o superiores, aunque también es viable en CPU para lotes pequeños.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, ONNX.js para navegador, y ONNX Runtime Mobile para dispositivos móviles.
- Latencia y throughput: no disponible, pero se espera un rendimiento rápido por el diseño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| MobileNetV2 FP32 (este) | no disponible | no aplica | no disponible | Apache 2.0 |
| MobileNetV2 INT8 (versión emparejada) | no disponible | no aplica | no disponible | Apache 2.0 |
| MobileNetV2 original (ONNX Model Zoo) | no disponible | no aplica | no disponible | Apache 2.0 |

La comparación directa no es posible por falta de datos. Sin embargo, la versión INT8 del mismo modelo, disponible en el repositorio, ofrece una menor huella de memoria y mayor velocidad a costa de una ligera pérdida de precisión. El modelo original del ONNX Model Zoo es la fuente de esta versión, por lo que su comportamiento es idéntico salvo por el empaquetado y la cuantización.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con ImageNet, que contiene sesgos culturales y geográficos en las categorías y las imágenes de entrenamiento, por lo que puede tener un rendimiento deficiente en ciertos contextos o grupos de objetos.
- Riesgo de alucinación: como todo clasificador, puede asignar etiquetas incorrectas con alta confianza, especialmente en imágenes ambiguas o fuera de la distribución de entrenamiento.
- Limitaciones de contexto: no maneja texto ni lenguaje natural; solo clasifica imágenes en las 1000 clases de ImageNet.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe incluir el aviso de copyright correspondiente.
- Caveat para producción: la versión FP32 puede ser demasiado pesada para dispositivos embebidos extremos; se recomienda evaluar la versión INT8 o cuantizaciones adicionales si la memoria es crítica.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/ketiswp/onnx-model-zoo-MobileNetV2-ImageNet-opset12-fp32-onnx
- Versión INT8 emparejada: https://huggingface.co/ketiswp/onnx-model-zoo-MobileNetV2-ImageNet-opset12-int8-onnx
- Modelo original en ONNX Model Zoo: https://github.com/onnx/models/tree/4f43949841cb55a0b98dc8fcd045431ccafd9f96/validated/vision/classification/mobilenet
- Repositorio ONNX Model Zoo: https://github.com/onnx/models
- Página de modelos ONNX en Hugging Face: https://huggingface.co/onnxmodelzoo/mobilenetv2-12
