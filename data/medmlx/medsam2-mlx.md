# MedMLX/medsam2-mlx

## Resumen

MedMLX/medsam2-mlx es una conversión de los pesos de MedSAM2 al formato MLX, el framework de Apple para ejecutar modelos de aprendizaje automático de forma nativa en chips de la serie M. El paquete incluye cinco checkpoints del grafo `sam2.1_hiera_t512` (`MedSAM2_latest`, `MedSAM2_2411`, `MedSAM2_CTLesion`, `MedSAM2_MRI_LiverLesion` y `MedSAM2_US_Heart`), cada uno en un fichero safetensors en precisión float32. La conversión se realizó desde `wanglab/MedSAM2` (revisión `e4a6f35edd7e091619cbc0750f462f1574e23955`) sin reentrenamiento, preservando nombres, formas y valores de los parámetros originales.

MedSAM2 es un modelo de segmentación de imágenes médicas derivado de SAM 2 (Segment Anything Model 2) y ajustado para dominios clínicos como TC, RM y ecografía. El problema que resuelve es la segmentación interactiva y automática de estructuras anatómicas y lesiones en imágenes médicas, una tarea crítica para planificación quirúrgica, cuantificación de volumen tumoral y anotación asistida de datasets. La relevancia de esta variante MLX radica en que permite ejecutar el modelo en local sobre Apple Silicon, sin depender de GPUs NVIDIA ni de servicios en la nube, lo que facilita prototipado e investigación en equipos de sobremesa y portátiles Mac.

El repositorio ocupa aproximadamente 0,8 GB y está etiquetado como `research`, con licencia CC BY-SA 4.0. No se proporcionan datos sobre número de parámetros, longitud de contexto (no aplica en segmentación de imagen) ni idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (Hiera-T, variante `sam2.1_hiera_t512`), adaptada a MLX; segmentación de imagen/vídeo con encoder jerárquico y prompt encoder |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de segmentación de imagen; resolución de entrada 512 px según el grafo `t512`) |
| Tipos de cuantización | float32 (safetensors); no se documentan otras precisiones en el repo |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0; uso restringido a investigación y educación según la model card upstream |
| Formato de pesos | safetensors (float32), 5 checkpoints independientes |
| Framework | MLX (Apple Silicon) |
| Modelo base | wanglab/MedSAM2 (revisión `e4a6f35edd7e091619cbc0750f462f1574e23955`) |
| Tamaño del repo | ~0,8 GB |
| Pipeline | image-segmentation |

## Arquitectura y entrenamiento

La arquitectura subyacente es SAM 2.1 con backbone Hiera-T y configuración `sam2.1_hiera_t512`, es decir, un transformer jerárquico para extracción de características multiescala, un prompt encoder que acepta puntos, cajas o máscaras como indicaciones, y un mask decoder que produce máscaras de segmentación. MedSAM2 ajusta este modelo base sobre datos médicos para mejorar la segmentación en modalidades clínicas; los cinco checkpoints incluidos corresponden a variantes generales (`latest`, `2411`) y especializadas por modalidad o estructura (`CTLesion`, `MRI_LiverLesion`, `US_Heart`).

Esta conversión no introduce reentrenamiento: se limita a trasladar los pesos originales de PyTorch a safetensors float32 compatibles con MLX, manteniendo la semántica del modelo. No se dispone en la información proporcionada de detalles sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO (no aplicable a segmentación) ni innovaciones técnicas adicionales más allá de las propias de SAM 2.1 (memoria de vídeo, segmentación con prompts). La model card cita el paper de MedSAM2 (arXiv:2504.03600) como referencia técnica.

## Capacidades

- Segmentación de imágenes médicas en TC, RM y ecografía mediante prompts (puntos, cajas o máscaras).
- Cinco checkpoints especializados: general (`latest`, `2411`), lesiones en TC (`CTLesion`), lesiones hepáticas en RM (`MRI_LiverLesion`) y corazón en ecografía (`US_Heart`).
- Segmentación guiada por indicaciones interactivas, apta para flujos de anotación asistida.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de CUDA.
- Integración con `huggingface_hub` para descarga directa de los safetensors.
- No dispone de generación de texto, razonamiento lingüístico, tool calling, agentes ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Anotación asistida de datasets médicos: usar los checkpoints generales (`MedSAM2_latest`, `MedSAM2_2411`) para pregenerar máscaras sobre nuevas imágenes y reducir el tiempo de etiquetado manual por radiólogos, con revisión humana posterior.
- Cuantificación de lesiones en TC: emplear `MedSAM2_CTLesion` para delimitar lesiones y calcular área o volumen aproximado como apoyo a la monitorización de progresión tumoral.
- Análisis de lesiones hepáticas en RM: aplicar `MedSAM2_MRI_LiverLesion` para segmentar lesiones hepáticas en estudios de resonancia y facilitar comparativas longitudinales.
- Ecocardiografía: usar `MedSAM2_US_Heart` para segmentar estructuras cardíacas en ecografía y apoyar cálculos morfométricos preliminares.
- Prototipado en investigación sobre Mac: ejecutar el modelo en un MacBook o Mac Studio con MLX para validar pipelines de segmentación sin infraestructura GPU dedicada.
- Educación y docencia: demostrar técnicas de segmentación con prompts en asignaturas de imagen médica usando hardware de sobremesa Apple.
- Evaluación comparativa de checkpoints: probar los cinco pesos sobre un mismo conjunto de imágenes para seleccionar la variante más adecuada a una modalidad concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repo ocupa ~0,8 GB en float32 para los cinco checkpoints; un solo checkpoint requiere una fracción de ese tamaño, aunque la memoria en ejecución depende del tamaño de imagen y del batch.
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores) con MLX; no requiere GPU NVIDIA.
- Cabe en equipos consumer Apple: previsiblemente en Mac con 8 GB o más de memoria unificada, aunque no se documentan requisitos mínimos oficiales.
- Despliegue: MLX a través del repositorio `medsam2-mlx` (https://github.com/MedMLX/medsam2-mlx); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Modalidad | Formato / framework | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedMLX/medsam2-mlx | SAM 2.1 Hiera-T (MLX) | Imagen médica (TC, RM, US) | safetensors float32, MLX | CC BY-SA 4.0 (investigación/educación) | Hugging Face |
| wanglab/MedSAM2 | SAM 2.1 (PyTorch) | Imagen médica | PyTorch | CC BY-SA 4.0 (investigación/educación) | Hugging Face |
| SAM 2.1 (Meta) | SAM 2.1 Hiera | Imagen/vídeo general | PyTorch | Apache 2.0 (según versión) | GitHub/Meta |
| SAM (original) | ViT + prompt encoder | Imagen general | PyTorch | Apache 2.0 | GitHub/Meta |

No se dispone de datos de rendimiento comparativo (métricas Dice, IoU, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Uso restringido: la model card upstream indica que los pesos solo pueden usarse para investigación y educación; no se autoriza uso clínico ni comercial sin verificar los términos de la licencia CC BY-SA 4.0 y del modelo base.
- Los resultados requieren revisión humana: no deben emplearse como única fuente en decisiones clínicas.
- Riesgo de segmentaciones incorrectas en imágenes fuera de distribución (modalidades, equipos o protocolos distintos a los del entrenamiento).
- Solo disponible para Apple Silicon vía MLX; no hay soporte CUDA ni otros backends documentados en este repo.
- No se documentan sesgos específicos ni evaluaciones de robustez en la información disponible.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema incipiente y poca validación comunitaria.
- Al ser una conversión sin reentrenamiento, hereda todas las limitaciones del modelo base MedSAM2.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/MedMLX/medsam2-mlx
- Modelo base: https://huggingface.co/wanglab/MedSAM2
- Repositorio de código: https://github.com/MedMLX/medsam2-mlx
- Paper de MedSAM2: https://arxiv.org/abs/2504.03600
- Paper de MedMLX: https://doi.org/10.64898/2026.10.28.26366762
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/legalcode.en
