# dronefreak/emsanet-r34-nbt1d-nyuv2

## Resumen

EMSANet es una red neuronal diseñada para el análisis multi-tarea de escenas RGB-D en interiores. El modelo aquí presentado es un espejo no oficial de los pesos publicados por el grupo de Neuroinformática y Robótica Cognitiva de la TU Ilmenau (Daniel Seichter et al.), originalmente alojados en Google Drive y redistribuidos en Hugging Face junto con una copia en formato `safetensors` y un `config.json`. Resuelve el problema de la percepción visual eficiente en robótica móvil y domótica: a partir de un par de imágenes de color y profundidad, predice simultáneamente segmentación semántica, de instancias y panóptica, orientación de instancias y clasificación de escena.

La arquitectura emplea dos codificadores ResNet34-NBt1D (uno para RGB y otro para profundidad) con fusión basada en atención, sumando 64,3 millones de parámetros. Está entrenado sobre NYUv2 con 40 clases semánticas e inicializado con pesos de ImageNet. Su relevancia actual radica en que ofrece un rendimiento multi-tarea competitivo con un coste computacional contenido, lo que lo hace apto para plataformas robóticas con recursos limitados. La licencia Apache-2.0 facilita su uso comercial e integración en productos.

Es importante señalar que este repositorio no es una release oficial: los pesos son idénticos a los originales, pero el mantenimiento y el soporte dependen del espejo comunitario. Para evaluación y despliegue se debe usar el código oficial del repositorio de GitHub de TUI-NICR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EMSANet: dos codificadores ResNet34-NBt1D (RGB y profundidad) con fusión por atención y cabezas multi-tarea |
| Parametros totales | 64.311.874 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` (`model.safetensors`), PyTorch (`r34_NBt1D.pth`), checkpoint ImageNet del codificador (`pretrained/imagenet_r34_NBt1D.pth`) |

## Arquitectura y entrenamiento

EMSANet es una red convolucional multi-tarea con dos ramas de codificación independientes, una para la imagen RGB y otra para el mapa de profundidad, ambas basadas en la variante ResNet34-NBt1D (bloques residuales con normalización por lotes y convoluciones 1D). Las características de ambas ramas se combinan mediante un mecanismo de fusión basado en atención, tras lo cual una serie de cabezas específicas por tarea producen las predicciones de segmentación semántica, instancias, panóptica, orientación de instancias y clasificación de escena. El diseño busca maximizar la compartición de cómputo entre tareas para reducir el coste total frente a ejecutar modelos independientes.

El entrenamiento se realizó sobre el dataset NYUv2 con 40 clases semánticas, partiendo de pesos de ImageNet para el codificador. La model card no detalla el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de ajuste fino por refuerzo; esa información debe consultarse en el paper original (IJCNN 2022). La innovación principal es la fusión multimodal por atención dentro de un esquema multi-tarea eficiente, que permite obtener varias salidas densas con un único pase hacia delante.

## Capacidades

- Segmentación semántica densa de escenas interiores con 40 clases sobre NYUv2.
- Segmentación de instancias y segmentación panóptica.
- Estimación de orientación de instancias (predicción angular por objeto).
- Clasificación de escena a nivel de imagen.
- Procesamiento conjunto de modalidades RGB y profundidad con fusión por atención.
- Ejecución multi-tarea en un único pase, con cabezas compartidas sobre un tronco común.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo puramente visual.
- Capacidades multilingües no aplicables.

## Casos de uso

- Percepción para robots móviles de interior: el modelo proporciona mapas semánticos y de instancias a partir de RGB-D, adecuados para navegación y evitación de obstáculos en robots domésticos o de servicio.
- Manipulación robótica asistida: la orientación de instancias y la segmentación panóptica permiten localizar y orientar objetos sobre una mesa para tareas de agarre.
- Inventario y auditoría de espacios: clasificación de escena más segmentación semántica para identificar estancias y objetos en imágenes de viviendas u oficinas.
- Realidad aumentada y reconstrucción 3D: las máscaras densas por clase e instancia sirven para etiquetar nubes de puntos o mallas generadas a partir de sensores de profundidad.
- Asistencia a personas con discapacidad visual: descripción estructurada del entorno interior mediante etiquetas semánticas e instancias detectadas.
- Análisis de vídeo de vigilancia en interiores: segmentación panóptica para seguimiento de personas y objetos en escenas controladas.
- Dataset curation y anotación semiautomática: generación de preetiquetas para acelerar el etiquetado de nuevos datos RGB-D de interiores.

## Benchmarks y rendimiento

Resultados reportados por los autores para EMSANet (ResNet34-NBt1D) sobre NYUv2:

| Metrica | Valor |
|---|---|
| mIoU (segmentación semántica) | 50,97 |
| PQ (panoptic quality) | 43,56 |
| RQ (recognition quality) | 52,20 |
| SQ (segmentation quality) | 82,48 |
| orientation MAAE | 16,38 |
| scene bAcc | 76,46 |

No se han publicado en la informacion disponible resultados comparativos adicionales frente a otros modelos en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 64,3 M de parámetros en FP32 el peso ronda los 257 MB, por lo que la huella de memoria es moderada y depende del tamaño de las imágenes de entrada y del batch.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre debería poder ejecutar el modelo.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas tipo RTX 3060/4060 o superiores, aunque no hay cifras oficiales de latencia ni de throughput en la informacion disponible.
- Opciones de despliegue: el modelo se ejecuta con el código oficial de TUI-NICR/EMSANet (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EMSANet R34-NBt1D (este) | 64,3 M | RGB-D | Semántica, instancias, panóptica, orientación, escena | Apache-2.0 | Pesos en HF (espejo) y código oficial en GitHub |
| Otros modelos multi-tarea RGB-D de interior | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones de modelos alternativos comparables, por lo que la comparativa cuantitativa queda pendiente.

## Limitaciones y advertencias

- Es un espejo no oficial: los pesos son idénticos a los originales, pero el mantenimiento, las actualizaciones y el soporte dependen de un tercero.
- Entrenado exclusivamente sobre NYUv2 (interiores, 40 clases); el rendimiento fuera de ese dominio (exteriores, otras cámaras, otras distribuciones de profundidad) no está garantizado.
- No es un modelo de lenguaje: no admite prompts textuales, tool calling ni razonamiento multi-paso.
- Riesgo de errores en escenas con oclusiones, iluminación adversa o sensores de profundidad ruidosos; las métricas reportadas (mIoU 50,97) reflejan un margen de error considerable.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de las métricas del paper.
- Para uso comercial, verificar la licencia Apache-2.0 del repositorio oficial y citar el paper de los autores según lo solicitado.
- La fecha de creación del repositorio (2026-11-22) y el contador de descargas (0) indican que se trata de un artefacto reciente y sin validación comunitaria amplia.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dronefreak/emsanet-r34-nbt1d-nyuv2
- Paper (IJCNN 2022): https://arxiv.org/abs/2207.04526
- Codigo oficial: https://github.com/TUI-NICR/EMSANet
- Resultados y pesos oficiales: https://github.com/TUI-NICR/EMSANet#results--weights
- Dataset NYUv2 (espejo en el Hub): https://huggingface.co/datasets/dronefreak/NYUv2
