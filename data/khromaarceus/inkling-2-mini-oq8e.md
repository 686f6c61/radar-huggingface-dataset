# KhromaArceus/Inkling-2-Mini-oQ8e

## Resumen

Inkling-2-Mini-oQ8e es una cuantización mixta del modelo Inkling-2-Mini, publicada por el usuario KhromaArceus en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint derivado en el que los pesos originales se han recomprimido con la herramienta oQ (oMLX v0.8.2), un esquema de cuantización de precisión mixta orientado al ecosistema MLX de Apple. El resultado es un artefacto de 26.388 millones de parámetros lógicos (26.707 millones contando el codificador visual) almacenado en 17,47 GiB, con un promedio efectivo de 5,619 bits por peso.

La relevancia de esta publicación es fundamentalmente práctica: demuestra cómo aplicar cuantización mixta agresiva (combinando NVFP4, MXFP8, affine 8-bit y BF16 según la sensibilidad de cada tensor) para reducir un modelo de aproximadamente 26B parámetros a un tamaño manejable en hardware de consumo con memoria unificada, sin recurrir a una cuantización uniforme de 4 bits que degradaría más la calidad. El modelo incluye un componente de visión de 0,318B parámetros, lo que indica capacidades multimodales.

La información pública disponible es muy limitada: la model card solo documenta el proceso de cuantización y el desglose de bits, sin especificar arquitectura base, contexto, idiomas, licencia ni datos de entrenamiento. Todo lo que sigue se limita a lo verificable en los metadatos y en la model card; el resto se marca explícitamente como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag `inkling2_loop` sugiere un transformer con mecanismo de bucle; sin confirmar) |
| Parametros totales | 26.388.646.400 (lenguaje); 26.707B contando vision (0.318B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: NVFP4 grupo 16 (76,33% de pesos), MXFP8 grupo 32 (15,27%), affine 8-bit grupo 64 (5,89%), BF16 (2,39%), FP32 (0,13%); media efectiva 5,619 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería `mlx`), repo de 18,8 GB |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Inkling-2-Mini ni sobre su proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). El tag `inkling2_loop` presente en el repositorio apunta a un diseño con algún tipo de mecanismo de bucle o recurrencia en las capas, pero no hay documentación que lo confirme. La presencia de un módulo de visión de 0,318B parámetros confirma que el modelo base es multimodal (texto e imagen), aunque se desconoce el detalle del codificador visual.

La innovación técnica documentada es exclusivamente la relativa a la cuantización. El esquema oQ distribuye la precisión de forma no uniforme: el 76,3% de los pesos (20.384B) se almacena en NVFP4 con grupo de 16, el formato más agresivo y el que domina el ahorro de memoria; un 15,3% (4.077B) se preserva en MXFP8 con grupo de 32, presumiblemente tensores más sensibles a la cuantización; un 5,9% (1.572B) en affine 8-bit con grupo de 64; y un 2,5% restante en BF16/FP32. El checkpoint resultante ocupa 17,47 GiB frente a los ~53 GB que ocuparía en BF16, una reducción de aproximadamente 3,3x. No hay información sobre si el modelo base fue sometido a decodificación especulativa, attention lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento: capacidades inferidas del tamaño del modelo base, no verificadas con evaluaciones publicadas.
- Procesamiento de imagen: confirmado por la presencia de un módulo de visión de 0,318B parámetros en el checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Inferencia local en Mac con memoria unificada: el formato MLX y el tamaño de 17,47 GiB permiten cargar el modelo en equipos Apple Silicon con 24 GB o más de RAM unificada, algo inviable con el checkpoint BF16 original. Adecuado para prototipado y experimentación en local.
- Procesamiento de documentos con componente visual: al incluir codificador de visión, puede emplearse para tareas de comprensión de imágenes y texto combinados (extracción de información de capturas, descripción de gráficos), siempre que se valide su calidad real.
- Evaluación comparativa de esquemas de cuantización: el repositorio documenta con precisión la distribución de bits, lo que lo convierte en un caso de estudio útil para investigadores que analicen el impacto de la cuantización mixta frente a la uniforme.
- Despliegue en entornos de investigación con restricciones de memoria: para equipos que necesiten un modelo de ~26B parámetros en un único nodo con GPU de 24 GB, la cuantización a 5,6 bits efectivos reduce el requisito de VRAM de forma significativa.
- Generación de texto asistida en flujos de trabajo de Apple: integrable mediante la librería `mlx` en aplicaciones macOS/iOS que ya usen el stack de ML de Apple.
- Reproducción de pipelines de cuantización: sirve como referencia para aplicar oQ (oMLX v0.8.2) a otros modelos y comparar la asignación de precisión por tipo de tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: ~17,5 GiB solo para pesos; con overhead de activaciones y caché KV, se recomienda un mínimo de 24 GB de memoria unificada o VRAM.
- GPU recomendadas: no hay datos específicos del autor. Por formato (MLX), el destino natural son chips Apple Silicon (M1 Pro/Max/Ultra en adelante, M2/M3/M4 con 24 GB o más). Para GPUs NVIDIA no se documenta soporte directo de este checkpoint.
- ¿Cabe en GPU de consumo? En Apple Silicon con 24 GB o más, sí. En GPUs discretas de consumo (RTX 4090 con 24 GB) requeriría conversión de formato, no documentada.
- Opciones de despliegue: MLX (librería nativa del checkpoint). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia, tamaño y esquema de cuantización, ni se dispone de datos de rendimiento del modelo base que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Información pública mínima: la model card no documenta arquitectura, contexto, idiomas, licencia ni datos de entrenamiento, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; debe consultarse con el autor antes de cualquier despliegue.
- Riesgo de degradación por cuantización: el 76,3% de los pesos está en NVFP4 (4,5 bits efectivos), lo que puede afectar a la precisión en tareas sensibles (matemáticas, código, razonamiento largo) en comparación con el modelo original.
- Sin validación empírica: no hay benchmarks ni evaluaciones publicadas que confirmen que la cuantización preserva la calidad del modelo base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.
- Dependencia de MLX: el checkpoint está atado al ecosistema Apple; su uso fuera de macOS requiere conversión manual no documentada.
- Riesgo de alucinación y sesgos: no evaluados; al no haber información sobre el entrenamiento, no se pueden caracterizar.
- Fecha de creación futura en los metadatos (2026-11-22): conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Hugging Face: https://huggingface.co/KhromaArceus/Inkling-2-Mini-oQ8e
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
