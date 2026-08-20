# AMD-PAVS-AI/CenterPose

## Resumen

CenterPose es un estimador de pose de objetos 6-DoF de una sola etapa, basado en keypoints, que recupera cajas delimitadoras 3D y la rotación/traslación completa a partir de una única imagen RGB. Este repositorio, publicado por AMD-PAVS-AI, empaqueta el modelo para inferencia y evaluación en PyTorch, validado específicamente para plataformas AMD ROCm, tanto en GPUs Instinct y Radeon como en CPUs AMD. La relevancia actual radica en que ofrece una alternativa optimizada para hardware AMD, sin necesidad de extensiones CUDA compiladas, al reemplazar la operación DCNv2 por `torchvision.ops.deform_conv2d`.

El modelo está diseñado para la tarea de detección de objetos con estimación de pose 6-DoF, y su salida se compone de siete cabezas (hm, wh, hps, reg, hm_hp, hp_offset, scale). El tamaño del repositorio es de 0.3 GB, y la licencia se indica como "other" sin especificar términos concretos. No se proporcionan detalles sobre la arquitectura troncal, el número de parámetros ni el proceso de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Estimador de pose de una sola etapa basado en keypoints (red convolucional con deformable convolutions, no se especifica la red troncal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (solo se menciona FP32) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (terminos no especificados) |
| Formato de pesos | no disponible (repositorio PyTorch, 0.3 GB) |

## Arquitectura y entrenamiento

La arquitectura de CenterPose es de una sola etapa y basada en keypoints, diseñada para predecir directamente la pose 6-DoF de objetos desde una imagen RGB. La implementación incluida en este repositorio utiliza `torchvision.ops.deform_conv2d` en lugar de la extensión DCNv2 original, lo que elimina la necesidad de compilar código CUDA y facilita la ejecución en entornos ROCm. La entrada es un tensor de forma `(1, 3, 512, 512)` en FP32, y la salida consta de siete mapas de características: hm (heatmap central), wh (dimensiones), hps (keypoints), reg (offset), hm_hp (heatmap de keypoints), hp_offset (offset de keypoints) y scale.

No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens (no aplica), ni sobre técnicas como RLHF o DPO. El repositorio se centra en la inferencia y evaluación, no en el proceso de entrenamiento. La adaptación para AMD ROCm no requiere cambios de código respecto a la implementación original, solo configuración de entorno.

## Capacidades

- Estimación de pose 6-DoF de objetos a partir de una única imagen RGB.
- Detección de objetos con salida de cajas delimitadoras 3D y rotación/traslación completa.
- Generación de siete cabezas de salida: heatmap central, dimensiones, keypoints, offset, heatmap de keypoints, offset de keypoints y escala.
- Inferencia en FP32 tanto en CPU como en GPU AMD (ROCm) con resultados numéricamente consistentes entre dispositivos.
- Soporte de evaluación con métricas como 3D IoU, error de proyección 2D, errores angulares (azimuth, elevación), ADD normalizado y precisión media (AP) en varios umbrales.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Robótica de manipulación: el modelo puede estimar la pose de objetos en una escena para guiar a un brazo robótico en tareas de agarre y ensamblaje, utilizando la salida de rotación y traslación para planificar movimientos.
- Realidad aumentada: superposición de objetos virtuales sobre objetos reales en tiempo real, aprovechando la estimación de pose 6-DoF para alinear correctamente el contenido digital con la escena física.
- Navegación autónoma de vehículos: detección y pose de obstáculos o señales en entornos urbanos, mejorando la comprensión espacial del entorno.
- Inspección industrial: verificación de la orientación y posición de piezas en líneas de producción, permitiendo detectar desalineaciones o defectos de montaje.
- Interacción humano-ordenador: seguimiento de objetos sostenidos por el usuario para controlar aplicaciones mediante gestos, basado en la pose estimada.
- Logística y almacenamiento: localización de paquetes o contenedores en estanterías, facilitando tareas de picking automatizado con robots móviles.

## Benchmarks y rendimiento

Los resultados presentados en la model card corresponden a un conjunto de muestra de Objectron (9 imágenes, 12 detecciones) y sirven como validación de consistencia entre CPU y GPU, no como comparativa con otros modelos.

| Device | Precision | 3D IoU | 2D MPE (px) | Azimuth (deg) | Elevation (deg) | AP@15° | AP@IoU50 | ADD |
|--------|-----------|--------|-------------|---------------|-----------------|--------|----------|-----|
| CPU | FP32 | 1.0000 | 0.00 | 0.00 | 0.00 | 1.0000 | 1.0000 | 0.00000 |
| GPU | FP32 | 0.9587 | 1.22 | 0.12 | 0.14 | 1.0000 | 1.0000 | 0.00960 |

Nota: los resultados en CPU son perfectos porque la verdad de referencia se genera a partir de la inferencia en CPU. Los valores en GPU muestran una desviación mínima, lo que confirma la consistencia numérica entre dispositivos. No se han publicado resultados de benchmarks en conjuntos estándar como LineMOD o YCB-Video en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación proporcionada.
- El modelo está validado para GPUs AMD Instinct y Radeon con ROCm, así como para CPUs AMD.
- Dado el tamaño del repositorio (0.3 GB) y la entrada de 512x512 en FP32, es probable que quepa en GPUs de consumo con al menos 4 GB de VRAM, pero este dato no está confirmado.
- Opciones de despliegue: PyTorch nativo (CPU o GPU ROCm). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros estimadores de pose 6-DoF como PoseCNN, PVNet o HybridPose en la documentación proporcionada. No se puede realizar una comparación cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- La licencia "other" no especifica términos claros; se recomienda revisar el repositorio original antes de uso comercial.
- El modelo está optimizado para AMD ROCm; aunque el código es compatible con CUDA, no se ha validado en ese entorno.
- Los resultados de rendimiento se basan en un conjunto de muestra muy pequeño (9 imágenes) y no representan el rendimiento en escenarios reales.
- No se proporcionan detalles sobre sesgos o limitaciones del modelo original; al ser un modelo de visión, los riesgos de alucinación no aplican, pero puede fallar en condiciones de iluminación, oclusión o variaciones de apariencia no representadas en el entrenamiento.
- No se indica el conjunto de datos de entrenamiento, por lo que la generalización a categorías de objetos fuera de las evaluadas (cup, chair) es incierta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/AMD-PAVS-AI/CenterPose)
- [Repositorio GitHub con scripts y configuración](https://github.com/AMD-PAVS/physical_ai_sdk/blob/main/models/CenterPose)
