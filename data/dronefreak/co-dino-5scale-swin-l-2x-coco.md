# dronefreak/co-dino-5scale-swin-l-2x-coco

## Resumen

El modelo `co-dino-5scale-swin-l-2x-coco` es un detector de objetos basado en la arquitectura Co-DINO, que combina el modelo DETR/DINO con el esquema de entrenamiento colaborativo de Co-DETR. Este checkpoint concreto utiliza un backbone Swin-Large, una pirámide de características de 5 escalas y un horario de entrenamiento de 24 épocas (2x) sobre el dataset COCO. Según los datos declarados por el autor del repositorio, alcanza un box AP de 59.8 en la partición de validación de COCO 2017.

El modelo original fue desarrollado por Zhuofan Zong, Guanglu Song y Yu Liu, del laboratorio SenseTime X-Lab, y presentado en ICCV 2023. Este repositorio en HuggingFace es un espejo no oficial del checkpoint publicado originalmente en Google Drive. Su principal valor es proporcionar un acceso estable, versionado y con resumen de verificaciones a unos pesos que de otro modo serían difíciles de descargar de forma automatizada.

A nivel técnico, el modelo tiene 219.2 millones de parámetros en inferencia (según el badge de la model card), y no tiene ventana de contexto en el sentido de modelos de lenguaje, ya que se trata de un modelo puramente visual. Su salida son cajas delimitadoras con clases y puntuaciones para las 80 categorías de COCO.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Co-DINO (DETR con DINO encoders/decoders y entrenamiento colaborativo de Co-DETR) con backbone Swin-Large y 5 escalas |
| Parámetros totales | 219.2M (según el badge de la model card, correspondientes a la inferencia) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de visión; no procesa texto) |
| Tipos de cuantización | No disponible (solo checkpoint FP32/FP16 en PyTorch, sin cuantizaciones publicadas) |
| Idiomas soportados | No aplica (tareas de visión; documentación en inglés) |
| Licencia | Unknown / undetermined (estado de la licencia de los pesos no determinado) |
| Formato de pesos | .pth (checkpoint de PyTorch compatible con MMDetection) |

## Arquitectura y entrenamiento

La arquitectura se basa en el framework DETR, más concretamente en la variante DINO, que utiliza un decoder con queries de anclaje y de-noising. Co-DETR extiende este esquema añadiendo, durante el entrenamiento, cabezales auxiliares con asignación uno-a-muchos: un cabezal ATSS y un cabezal RoI estilo Faster R-CNN. Estos cabezales generan propuestas positivas que se inyectan de vuelta en el decoder de DETR como queries adicionales, junto al matching húngaro uno-a-uno propio de DETR. Esta colaboración entre asignaciones mejora la discriminatividad de las características del encoder y acelera la convergencia.

El entrenamiento se realizó sobre el dataset COCO (con identificador `detection-datasets/coco`) durante 24 épocas (horario 2x). No se especifican técnicas de ajuste post-entrenamiento como RLHF o DPO, ya que no son aplicables a la detección de objetos. En inferencia, la configuración del checkpoint activa `eval_module='detr'`, por lo que solo se utilizan los módulos Co-DINO (encoder + decoder) y los cabezales auxiliares no participan.

## Capacidades

- Detección de objetos con cajas delimitadoras (bounding boxes) en imágenes y vídeos, sobre las 80 clases de COCO.
- Alta precisión en el benchmark COCO 2017 val: box AP 59.8 (valor reportado, no verificado).
- No requiere supresión de máximos no máximos (NMS) post-procesado, gracias al matching húngaro del decoder DETR.
- Soporta imágenes de alta resolución mediante la pirámide de 5 escalas.
- Al ser un modelo visual puro, no ofrece generación de texto, tool calling, soporte de agentes ni razonamiento multi-paso.
- Puede ejecutarse por fotograma sobre vídeo o webcam mediante el script de inferencia incluido en el fork de Co-DETR.

## Casos de uso

- Vigilancia de vídeo: proceso de fotogramas de cámaras de tráfico o cámaras industriales para detectar personas, vehículos u objetos de interés. El modelo tiene una precisión alta y el fork de Co-DETR incluye una utilidad para inferencia en vídeo y webcam.
- Conteo de inventario en almacenes: detección de paquetes o productos sobre estanterías para automatizar el recuento. La capacidad de detectar múltiples instancias con confianza hace que sea adecuado para este escenario.
- Control de calidad en manufactura: re-entrenar el modelo en un dataset propio de defectos para detectar anomalías en líneas de producción. La integración con MMDetection facilita el ajuste fino en datasets personalizados.
- Asistencia a la conducción (ADAS): el repositorio incluye un vídeo de demostración con grabaciones de dashcam, lo que muestra su aplicabilidad a la detección de otros vehículos y peatones en escenarios urbanos.
- Percepción en robótica: uso del modelo como módulo de visión en robots móviles para localizar obstáculos u objetos manipulables. Su diseño DETR permite obtener un conjunto de detecciones sin NMS, lo que simplifica la integración en pipelines de control.
- Etiquetado automático de datasets: generar cajas de anotación en imágenes domésticas o industriales para construir datasets de entrenamiento. Con un box AP de 59.8, reduce la carga de anotación manual.
- Videovigilancia avanzada con seguimiento: las detecciones por fotograma pueden alimentar un tracker para seguir objetos a lo largo del tiempo, por ejemplo en escenarios de seguridad perimetral.

## Benchmarks y rendimiento

| Benchmark | Resultado | Nota |
|---|---|---|
| COCO 2017 val (val2017) - box AP | 59.8 | Valor declarado por el autor del modelo en el model-index, no verificado |

La documentación de DeepWiki sobre Co-DINO menciona que las variantes de la familia Co-DINO alcanzan hasta 66.0 AP en COCO test-dev, pero ese valor corresponde a checkpoints distintos (usualmente ViT-L) y no a este modelo Swin-L de 5 escalas. No se dispone de resultados de benchmarks adicionales para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: los 219.2 millones de parámetros en FP32 ocupan alrededor de 0.88 GB. En la práctica, la inferencia con un lote pequeño y una imagen de resolución moderada requiere entre 2 y 4 GB de VRAM (estimación no medida, por activaciones y buffers).
- GPU recomendadas: para un uso cómodo, una GPU con al menos 8 GB de VRAM (RTX 3070, RTX 2080 Ti, A10G). Para batch grandes o imágenes de alta resolución, se recomienda una A100 o H100.
- Compatibilidad con GPU de consumo: sí, es viable en tarjetas de 8 GB o más. No se publican versiones cuantizadas en el repositorio.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI. Requiere el entorno de MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, junto con el código de Co-DETR (fork de dronefreak/Co-DETR). No se proporciona soporte para ONNX en este repositorio.
- Latencia y throughput: no disponible. El autor no publica mediciones de rendimiento.

## Comparativa con modelos similares

| Modelo | AP COCO | Parámetros | Características |
|---|---|---|---|
| Co-DINO (Swin-L, 5-scale, 2x) | 59.8 (COCO val) | 219.2M (inferencia) | Entrenamiento colaborativo (ATSS + RoI) sobre DINO |
| DINO (Swin-L, 5-scale, 12e) | no disponible | no disponible | Precursor sin el esquema Co-DETR |
| Deformable DETR (Swin-L, 5-scale) | no disponible | no disponible | Modelo DETR anterior, sin de-noising ni asignaciones colaborativas |

No se han encontrado resultados de benchmarks publicados para las alternativas en la información disponible. El modelo es comparable a las variantes de DINO con backbone Swin-L y a otros detectores DETR, pero la comparación directa requiere ejecutar ambos en el mismo protocolo de evaluación.

## Limitaciones y advertencias

- Licencia: los pesos están marcados como "unknown" en HuggingFace y "undetermined" en el README. El uso comercial no se puede garantizar sin confirmar el estado de la licencia con los autores originales.
- Repositorio no oficial: este espejo no es mantenido por los autores del modelo. Podría ser retirado o perder el acceso en cualquier momento. La integridad de los pesos depende de la disponibilidad del creador del espejo.
- Entorno técnico anticuado: el modelo requiere MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, lo que puede entrar en conflicto con versiones modernas de PyTorch (2.x) y dificultar la integración en proyectos actuales.
- No es compatible con la librería `transformers`, lo que impide usarlo con las APIs estándar de HuggingFace para inferencia y cuantización.
- Limitado a las 80 clases de COCO: no reconoce clases fuera de ese conjunto sin re-entrenamiento. Puede fallar en dominios muy específicos (por ejemplo, defectos industriales, imágenes médicas).
- Riesgo de falsos positivos en condiciones de oclusión, objetos pequeños o iluminación desfavorable, como es habitual en detectores de una sola etapa. En vídeo, las detecciones pueden ser inestables entre fotogramas.
- El modelo es de 2023 y no incorpora avances posteriores como RT-DETR, los modelos de segmentación SAM o los embeddings DINOv2, que podrían ofrecer prestaciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-swin-l-2x-coco
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Repositorio oficial de Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno de instalación: https://github.com/dronefreak/Co-DETR
- Documentación de Co-DINO en DeepWiki: https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models
- Config de este checkpoint: https://huggingface.co/dronefreak/co-dino-5scale-swin-l-2x-coco/resolve/main/co_dino_5scale_swin_large_2x_coco.py
