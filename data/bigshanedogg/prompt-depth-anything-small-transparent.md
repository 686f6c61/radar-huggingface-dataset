# bigshanedogg/Prompt-Depth-Anything-Small-Transparent

## Resumen

Prompt-Depth-Anything-Small-Transparent es un port no oficial a `transformers` del modelo Prompt Depth Anything (PromptDA), desarrollado originalmente por Haotong Lin, Sida Peng y colaboradores en el paper *"Prompting Depth Anything for 4K Resolution Accurate Metric Depth Estimation"* (CVPR 2025). El modelo estima profundidad métrica (en metros) a partir de una imagen RGB y un prompt de profundidad de baja resolución, como el que proporciona el sensor LiDAR de un iPhone (típicamente 192 × 256). El autor de este port es `bigshanedogg`.

La arquitectura combina un backbone DINOv2 ViT-S/14 con una cabeza DPT condicionada por el prompt de profundidad, sumando 25.083.079 parámetros. El checkpoint ha sido ajustado durante 10.000 pasos adicionales sobre el dataset HAMMER con la simulación de LiDAR de iPhone de los autores, orientado a objetos transparentes. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache-2.0.

Su relevancia radica en que expone el modelo original en el ecosistema `transformers` con salidas verificadas bit a bit frente al código oficial, lo que facilita su integración en pipelines de visión por computador sin depender del repositorio original de PyTorch Lightning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-S/14 (backbone) + cabeza DPT condicionada por prompt de profundidad |
| Parametros totales | 25.083.079 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen con lado mayor de hasta 1008 px, múltiplo de 14) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PromptDA: un backbone DINOv2 ViT-S/14 extrae características de la imagen RGB y una cabeza DPT condicionada por el prompt de profundidad de baja resolución genera un mapa de profundidad métrica a la resolución procesada. El port mantiene los submódulos y buffers oficiales (`pretrained`, `depth_head`, `_mean`, `_std`) y ejecuta el `PromptDA.forward` original, devolviendo un `DepthEstimatorOutput` con `predicted_depth` en metros. El código se ha vendorizado desde DepthAnything/PromptDA en el commit 9161547c, con cambios mínimos en imports y en el uso de `NestedTensorBlock`.

El checkpoint base fue entrenado por los autores originales; este port ha sido ajustado durante 10.000 pasos adicionales sobre el dataset HAMMER con la simulación de LiDAR de iPhone de los autores, especializándose en objetos transparentes. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición completa del dataset más allá de la mención a HAMMER. La verificación frente al código oficial (mismo proceso, GPU V100) confirma que el preprocesado, `predicted_depth`, `predict`, los hidden states y las salidas en autocast fp16 son bit-idénticos.

## Capacidades

- Estimación de profundidad métrica (en metros) a partir de una imagen RGB y un prompt de profundidad de baja resolución (por ejemplo, LiDAR de iPhone a 192 × 256).
- Condicionamiento por prompt: la profundidad de entrada guía la predicción para mejorar la precisión métrica absoluta.
- Especialización en objetos transparentes gracias al ajuste fino adicional sobre HAMMER.
- Salida a resolución de imagen procesada (lado mayor de hasta 1008 px, múltiplo de 14), sin reescalado posterior.
- Soporte de `output_hidden_states=True` para acceder a las características de DINOv2 que consume la cabeza.
- Soporte de `return_dict=False` para obtener una tupla en lugar de un objeto de salida.
- Compatible con autocast fp16.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un modelo puramente visual).

## Casos de uso

- Reconstrucción 3D con LiDAR de consumo: combinar la imagen RGB de un iPhone con su mapa de profundidad LiDAR de baja resolución para obtener mapas métricos densos y precisos, útiles en escaneo de interiores y fotogrametría móvil.
- Robótica móvil y navegación: generar profundidad métrica fiable a partir de una cámara RGB más un sensor de profundidad de bajo coste, permitiendo planificación de trayectorias y evitación de obstáculos con distancias absolutas.
- Realidad aumentada: anclar objetos virtuales con escala métrica correcta usando la profundidad estimada a partir de la cámara del dispositivo y su sensor LiDAR.
- Manipulación robótica de objetos transparentes: el ajuste fino sobre HAMMER está orientado a superficies transparentes (cristal, plásticos), un caso donde los modelos de profundidad monocular suelen fallar.
- Digitalización de escenas a 4K: el modelo está diseñado para estimación de profundidad métrica de alta resolución, adecuado para captura de entornos con detalle fino.
- Integración en pipelines de visión con `transformers`: al cargarse con `AutoModelForDepthEstimation` y `trust_remote_code=True`, se puede incorporar en servicios de inferencia existentes basados en `transformers` sin adaptar el código original de PromptDA.
- Evaluación e investigación: servir como referencia reproducible en `transformers` para comparar frente al código oficial, dado que las salidas son bit-idénticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 25 M de parámetros, el peso en fp32 ocupa aproximadamente 100 MB y en fp16 unos 50 MB, por lo que la VRAM dominante proviene de las activaciones de la imagen de entrada (hasta 1008 px de lado mayor).
- GPU recomendadas: el autor verificó el modelo en una V100; cualquier GPU con suficiente VRAM para procesar imágenes de hasta 1008 px es apta.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna (RTX 3060 o superior), aunque no se proporcionan cifras oficiales de VRAM.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; requiere además `opencv-python` e `imageio`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo de salida | Prompt de profundidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Depth-Anything-Small-Transparent (este) | 25.083.079 | Profundidad métrica (metros) | Sí (LiDAR de baja resolución) | Apache-2.0 | HuggingFace, `transformers` con `trust_remote_code` |
| Prompt Depth Anything original (`depth-anything/prompt-depth-anything-vits-transparent`) | no disponible en la información proporcionada | Profundidad métrica (metros) | Sí | Apache-2.0 | Repositorio oficial DepthAnything/PromptDA |
| Depth Anything (monocular) | no disponible en la información proporcionada | Profundidad relativa/métrica sin prompt | No | no disponible en la información proporcionada | HuggingFace |

No se dispone de datos de benchmarks que permitan comparar el rendimiento numérico frente a estas alternativas.

## Limitaciones y advertencias

- Es un port no oficial: el autor lo declara explícitamente como no publicado por los autores originales de PromptDA.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de usarlo en producción.
- Depende de un prompt de profundidad de baja resolución; sin él, el modelo no está pensado para operar como estimador monocular puro.
- La salida se produce a la resolución de imagen procesada (lado mayor de hasta 1008 px, múltiplo de 14) sin reescalado automático a la resolución original.
- El ajuste fino adicional se ha realizado sobre HAMMER con simulación de LiDAR de iPhone; el rendimiento puede degradarse con otros sensores o distribuciones de escena distintas.
- No se han publicado evaluaciones cuantitativas ni benchmarks en la información disponible, por lo que no se puede avalar su precisión frente a alternativas.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de profundidad monocular: superficies reflectantes, texturas repetitivas o iluminación extrema pueden producir estimaciones erróneas.
- No se documentan limitaciones idiomáticas ni de contexto porque el modelo no procesa lenguaje.
- Licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución indicada en el NOTICE y citar el trabajo original de PromptDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bigshanedogg/Prompt-Depth-Anything-Small-Transparent
- Modelo base en HuggingFace: https://huggingface.co/depth-anything/prompt-depth-anything-vits-transparent
- Repositorio oficial PromptDA: https://github.com/DepthAnything/PromptDA
- Paper *"Prompting Depth Anything for 4K Resolution Accurate Metric Depth Estimation"* (CVPR 2025): https://arxiv.org/abs/2412.14015 (referencia de arXiv indicada en la citación; no verificada en la información proporcionada)
