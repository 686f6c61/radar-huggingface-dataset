# Nairsiddharth/dino-classification

## Resumen

Este repositorio contiene una implementación compacta y personalizada de **DINO** (self-DIstillation with NO labels) adaptada para tareas de clasificación de imágenes, desarrollada por Nairsiddharth. Se trata de una configuración "small" pensada exclusivamente para revisión de código, pruebas de humo (smoke tests) y experimentos controlados a pequeña escala, no como un modelo preentrenado listo para producción. El checkpoint incluido (`model.safetensors`) es un punto de inicialización válido, pero no ha sido entrenado con datos reales ni presenta ningún resultado de benchmark.

La relevancia de este modelo es principalmente didáctica y de desarrollo: permite estudiar la arquitectura DINO en una implementación minimalista, probar el flujo de entrenamiento y verificar la integración con herramientas de serialización como safetensors. Con solo 16.576 parámetros, es un modelo extremadamente ligero que puede ejecutarse en cualquier hardware, incluso en CPU. No obstante, carece de utilidad práctica para clasificación real hasta que se entrene con un dataset adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINO (self-distillation con Vision Transformer) adaptada a clasificacion |
| Parametros totales | 16.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema DINO original, que emplea un Vision Transformer (ViT) entrenado mediante autosupervisión con destilación sin etiquetas. Sin embargo, esta implementación introduce variaciones propias: atención dilatada (dilated attention), fusión tensorial (tensor fusion), activación "approx gelu" y normalización por GroupNorm. Estas modificaciones buscan reducir el coste computacional y simplificar el código, pero no están validadas con resultados experimentales.

El repositorio incluye un `config.json` con la configuración generada y un `training_args.json` con la receta por defecto (optimizador Adam y programador de tasa de aprendizaje por pasos). No se proporciona información sobre el dataset de entrenamiento, número de tokens o pasos, porque el checkpoint actual es solo una inicialización aleatoria. No se ha realizado ningún entrenamiento supervisado ni ajuste fino.

## Capacidades

- Clasificacion de imagenes: la arquitectura está diseñada para producir logits de clasificación, pero el modelo no ha sido entrenado, por lo que no puede realizar inferencias útiles sobre imágenes reales.
- Extraccion de características: al ser una implementación DINO, en teoría podría generar embeddings visuales, pero sin pesos entrenados no tiene valor práctico.
- Ejecución de pruebas de humo: el script `main.py` incluye un ejemplo ejecutable que verifica el flujo forward y backward, útil para validar la integridad del código.
- Personalización: al ser un código compacto y abierto, permite modificar la arquitectura y experimentar con variantes de atención o normalización.
- No soporta tool calling, agentes, ni capacidades multimodales más allá de la entrada de imágenes (aunque sin entrenamiento no funciona).

## Casos de uso

- Pruebas de humo en desarrollo: ejecutar `python main.py --help` y el bloque `__main__` para verificar que el modelo compila y realiza una pasada forward/backward correctamente.
- Revisión de código educativo: analizar una implementación minimalista de DINO para comprender los componentes clave (atención, normalización, fusión) sin la complejidad de los repositorios oficiales.
- Experimentos de arquitectura: modificar la atención dilatada o la fusión tensorial y comparar el comportamiento en un entorno controlado con datos sintéticos.
- Integración con safetensors: probar la carga y guardado de pesos en formato safetensors dentro de un pipeline personalizado.
- Base para un entrenamiento desde cero: utilizar el checkpoint de inicialización como punto de partida para entrenar un clasificador pequeño en un dataset reducido (por ejemplo, CIFAR-10) y estudiar el efecto de las modificaciones arquitectónicas.
- Validación de herramientas de serialización: verificar que herramientas como `safetensors` funcionan correctamente con modelos de tamaño mínimo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación y que el checkpoint no está entrenado. Por tanto, no es posible comparar su rendimiento con otros modelos.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB, incluso en CPU. Con 16.576 parámetros, el modelo ocupa menos de 100 KB en memoria.
- GPU recomendadas: cualquier GPU moderna (incluso integradas) o simplemente CPU. No requiere aceleración específica.
- Compatibilidad con hardware de consumo: sí, cualquier ordenador portátil o de sobremesa puede ejecutarlo.
- Opciones de despliegue: al ser un script Python personalizado, no es compatible directamente con vLLM, Ollama o TGI. Requiere un adaptador para cargarlo con APIs estándar de HuggingFace, como se indica en la documentación.
- Latencia y throughput: no aplicable, ya que no hay inferencia real sin entrenamiento.

## Comparativa con modelos similares

No se dispone de modelos comparables directos, ya que este repositorio no es un modelo preentrenado sino una implementación de código con un checkpoint de inicialización. Las implementaciones oficiales de DINO (como DINOv2 de Meta) son modelos de gran escala con cientos de millones de parámetros y resultados de benchmark, por lo que no son comparables en propósito ni en escala. Se recomienda tratar este repositorio como una herramienta de desarrollo, no como un modelo de referencia.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado: no puede realizar clasificación ni extracción de características útiles.
- No se ha auditado su robustez, equidad ni capacidad de transferencia a dominios reales.
- La implementación es personalizada y no compatible con las APIs de carga automática de HuggingFace; se requiere un adaptador explícito.
- No se proporcionan datos de entrenamiento ni receta validada; los `training_args.json` son valores iniciales, no evidencia de un entrenamiento completado.
- Cualquier resultado futuro de un checkpoint entrenado debe documentarse por separado, sin atribuirlo a esta versión.
- La licencia MIT permite uso comercial, pero se debe revisar la procedencia de los datos externos si se usan para entrenamiento.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Nairsiddharth/dino-classification
- Información sobre DINO (AI Wiki): https://aiwiki.ai/wiki/dino_model
- Notebook de clasificación con DINOv2 (Colab): https://colab.research.google.com/github/pyresearch/notebooks/blob/main/notebook/dinov2_classification.ipynb
- Notebook de clasificación con DINOv2 (Roboflow): https://colab.research.google.com/github/roboflow-ai/notebooks/blob/main/notebooks/dinov2-classification.ipynb
- Guía de entrenamiento con DINOv3 (Algofly): https://algofly.ai/ghost-blog/how-to-train-an-image-classification-model-with-dinov3-on-a-custom-dataset/
