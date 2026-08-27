# lwanming/depth-anything-v2-small

## Resumen

Depth-Anything-V2-Small es un modelo de estimación de profundidad monocular desarrollado por el equipo Depth Anything (Lihe Yang et al.) y presentado en NeurIPS 2024. Este modelo, basado en un backbone DINOv2 con arquitectura ViT-small, genera mapas de profundidad densos a partir de una única imagen, superando a su predecesor V1 en precisión de detalles finos y robustez. La versión alojada en este repositorio es una conversión a formato ONNX (FP16) realizada por lwanming, que resuelve un problema de compatibilidad al convertir los tensores 5D de la atención QKV fusionada en tensores 4D, facilitando su integración en entornos de inferencia estándar.

El modelo original fue entrenado con 595 000 imágenes sintéticas etiquetadas y más de 62 millones de imágenes reales sin etiquetar, lo que le confiere una gran capacidad de generalización. Su tamaño reducido (el archivo ONNX ocupa 0,1 GB) lo hace adecuado para despliegue en dispositivos con recursos limitados, manteniendo un equilibrio entre velocidad y precisión. Es una opción relevante para aplicaciones en tiempo real como robótica, realidad aumentada o conducción autónoma, donde la estimación de profundidad es un componente crítico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 backbone (ViT-small) con decodificador Depth Anything V2 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP16 (archivo ONNX) |
| Idiomas soportados | no aplica |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (model_fp16.onnx) |

## Arquitectura y entrenamiento

Depth-Anything-V2-Small emplea un encoder ViT-small preentrenado con DINOv2, que extrae características visuales de alta calidad, y un decodificador que produce mapas de profundidad con canales de salida [48, 96, 192, 384]. El entrenamiento se realizó en dos fases: primero con 595 000 imágenes sintéticas etiquetadas (con profundidad ground truth) y posteriormente con más de 62 millones de imágenes reales sin etiquetar, utilizando un modelo profesor de mayor capacidad para generar pseudo-etiquetas. Esta estrategia mejora la precisión en detalles finos y la robustez frente a variaciones de iluminación y textura.

La innovación técnica de esta versión ONNX radica en la conversión de los tensores de atención QKV fusionada de 5D a 4D, lo que resuelve problemas de compatibilidad con ciertos runtimes de inferencia. El modelo original en PyTorch utiliza una implementación con tensores 5D, que puede no ser soportada por todos los motores ONNX; la conversión mantiene la equivalencia funcional pero con una representación más estándar.

## Capacidades

- Estimación de profundidad monocular: genera mapas de profundidad densos y de alta resolución a partir de una única imagen RGB.
- Precisión en detalles finos: captura bordes nítidos y estructuras delgadas, superando a Depth Anything V1 en calidad visual.
- Robustez a condiciones adversas: funciona bien con imágenes de baja iluminación, texturas repetitivas y escenas complejas.
- Inferencia eficiente: al ser un modelo pequeño (ViT-small) y en formato ONNX, puede ejecutarse en CPU y GPU con baja latencia.
- Compatibilidad multiplataforma: el formato ONNX permite su uso con ONNX Runtime, TensorRT, OpenVINO y otros motores.
- No incluye capacidades de texto, tool calling ni agentes; es exclusivamente un modelo de visión.

## Casos de uso

- Robótica móvil: el modelo puede integrarse en sistemas de navegación para evitar obstáculos, estimando la distancia a objetos en tiempo real a partir de cámaras monoculares. Su baja latencia permite actualizaciones frecuentes del mapa de profundidad.
- Realidad aumentada: en aplicaciones de superposición de objetos virtuales, la estimación de profundidad permite ocluir correctamente los elementos virtuales con el entorno real, mejorando la sensación de integración.
- Conducción autónoma: como complemento a sensores LiDAR, el modelo puede proporcionar información de profundidad densa para la detección de peatones, vehículos y bordes de carretera, especialmente en escenarios urbanos.
- Reconstrucción 3D: a partir de secuencias de imágenes, los mapas de profundidad generados pueden fusionarse para crear modelos tridimensionales de escenas, útiles en fotogrametría y digitalización de entornos.
- Edición de imágenes y video: en herramientas de postproducción, la profundidad permite aplicar efectos de desenfoque selectivo (bokeh), reiluminación o composición de elementos con perspectiva correcta.
- Agricultura de precisión: drones equipados con cámaras pueden usar el modelo para estimar la altura de cultivos o detectar irregularidades en el terreno, optimizando el riego y la fumigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original Depth-Anything-V2 reporta mejoras significativas frente a V1 en métricas como RMSE y δ1 en conjuntos como KITTI y NYUv2, pero estos datos no están incluidos en la documentación de esta versión ONNX.

## Requisitos de hardware

- VRAM estimada: el archivo ONNX pesa 0,1 GB, por lo que la inferencia requiere menos de 1 GB de VRAM en FP16. En CPU, el uso de memoria RAM es similar.
- GPU recomendadas: cualquier GPU con soporte FP16, incluyendo NVIDIA GTX 10xx o superior, RTX 20xx/30xx/40xx, y también GPUs integradas modernas. Para CPU, se recomienda al menos 4 núcleos y 4 GB de RAM.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual, incluso en placas con 2 GB de VRAM.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT, OpenVINO, o mediante el pipeline de Transformers si se usa el modelo original en PyTorch. También puede integrarse en aplicaciones C++, Python o Java.
- Latencia y throughput: no se dispone de mediciones específicas, pero al ser un modelo ViT-small, se espera una latencia inferior a 10 ms en GPU moderna y alrededor de 50-100 ms en CPU para imágenes de 518x518 píxeles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Depth-Anything-V2-Small (este) | DINOv2 ViT-small | no disponible | no aplica | Apache-2.0 | ONNX |
| Depth-Anything-V2-Small (original) | DINOv2 ViT-small | no disponible | no aplica | Apache-2.0 | PyTorch |
| MiDaS (varios tamaños) | ResNet/ViT | 21M-345M | no aplica | MIT | PyTorch/ONNX |
| Depth Anything V1 (Small) | DINOv2 ViT-small | no disponible | no aplica | Apache-2.0 | PyTorch |

La comparativa se basa en la información pública de cada modelo. Depth-Anything-V2-Small destaca por su licencia permisiva y su formato ONNX optimizado, mientras que MiDaS ofrece múltiples tamaños y una larga trayectoria en la comunidad. No se dispone de datos de rendimiento comparativos en esta ficha.

## Limitaciones y advertencias

- Sesgos en datos de entrenamiento: el modelo fue entrenado principalmente con imágenes sintéticas y reales de entornos urbanos y naturales, por lo que puede tener un rendimiento inferior en escenas con objetos poco comunes o condiciones extremas (niebla densa, nieve, etc.).
- Riesgo de alucinación en profundidad: en regiones sin textura o con oclusiones complejas, el modelo puede producir estimaciones de profundidad incorrectas o inconsistentes.
- Limitaciones de resolución: aunque el modelo acepta imágenes de tamaño arbitrario, la precisión se degrada en resoluciones muy bajas o muy altas; se recomienda un preprocesamiento adecuado.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero se debe incluir el aviso de copyright y las condiciones de la licencia en las redistribuciones.
- Compatibilidad del formato ONNX: la conversión a 4D tensors puede introducir ligeras diferencias numéricas respecto al modelo original en PyTorch, aunque se mantiene la equivalencia funcional.
- No es un modelo multimodal: no procesa texto ni audio, solo imágenes RGB.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/lwanming/depth-anything-v2-small
- Repositorio original en GitHub: https://github.com/DepthAnything/Depth-Anything-V2
- Modelo original en HuggingFace: https://huggingface.co/depth-anything/Depth-Anything-V2-Small-hf
- Documentación de Transformers para Depth Anything V2: https://huggingface.co/docs/transformers/v4.56.1/en/model_doc/depth_anything_v2
- Página de análisis del modelo (aimodels.fyi): https://www.aimodels.fyi/models/huggingFace/depth-anything-v2-small-depth-anything
