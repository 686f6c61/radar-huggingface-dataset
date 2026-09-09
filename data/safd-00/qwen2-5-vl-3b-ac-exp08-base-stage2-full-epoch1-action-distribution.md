# SaFD-00/qwen2.5-vl-3b-ac-exp08-base-stage2-full-epoch1-action-distribution

## Resumen

El modelo `SaFD-00/qwen2.5-vl-3b-ac-exp08-base-stage2-full-epoch1-action-distribution` es un checkpoint experimental de ajuste fino (finetuning) del modelo Qwen2.5-VL-3B, desarrollado por el usuario SaFD-00 y publicado en HuggingFace. Se trata de un modelo multimodal de tipo image-text-to-text, capaz de procesar tanto imágenes como texto, con un total de 3.754.622.976 parámetros (aproximadamente 3,75 mil millones).

El nombre del repositorio sugiere que el modelo ha sido entrenado en un segundo stage (`stage2`) de un experimento más amplio, con una época completa (`epoch1`) y un objetivo relacionado con la distribución de acciones (`action-distribution`). Este tipo de denominación es habitual en investigaciones sobre world models o agentes de aprendizaje por refuerzo, donde el modelo debe predecir la distribución de acciones posibles a partir de observaciones multimodales. Sin embargo, el autor no ha proporcionado documentación técnica, datos de entrenamiento ni métricas de evaluación, por lo que la información disponible es muy limitada.

El modelo está alojado en HuggingFace con pesos en formato safetensors, compatible con la librería Transformers y etiquetado con `llama-factory`, lo que indica que el ajuste se realizó probablemente con la herramienta LLaMA-Factory. No se han registrado descargas ni valoraciones, y la licencia e idiomas soportados aparecen como no disponibles.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) basado en Qwen2.5-VL-3B |
| Parametros totales | 3.754.622.976 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen2.5-VL, que combina un codificador visual con un transformer de lenguaje. El modelo se ha ajustado en una tarea específica relacionada con la distribución de acciones, según indica el nombre del checkpoint. No se dispone de información sobre el conjunto de datos de entrenamiento, el número de tokens, el uso de RLHF/DPO, ni sobre innovaciones técnicas concretas. El proceso de entrenamiento parece haber seguido un esquema de dos etapas (`stage1` y `stage2`), pero se desconocen los hiperparámetros, la composición del dataset y la configuración exacta utilizada. El tag `llama-factory` sugiere que el ajuste fino se realizó con la herramienta LLaMA-Factory, aunque no se ofrecen más detalles.

## Capacidades

- Procesamiento multimodal: el modelo puede aceptar imágenes y texto como entrada, dado su pipeline image-text-to-text.
- Ajuste específico para distribución de acciones: el nombre del checkpoint sugiere un entrenamiento orientado a predecir distribuciones de acciones, aunque no se dispone de confirmación técnica.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: se esperan capacidades de visión por ser un modelo basado en Qwen2.5-VL, pero no se ha verificado.

## Casos de uso

No se dispone de documentación oficial que respalde casos de uso específicos. Dado que el modelo es un ajuste experimental de un modelo multimodal, se podrían hipotetizar las siguientes aplicaciones, pero no están verificadas:

- Análisis de documentos con imágenes: el modelo podría procesar capturas de pantalla o documentos escaneados, extrayendo información textual y visual, aunque no hay datos de rendimiento.
- Descripción de escenas: podría generar descripciones textuales de imágenes para accesibilidad o automatización de inventarios.
- Asistencia en robótica: el nombre sugiere predicción de acciones, por lo que podría integrarse en pipelines de control de robots, pero no está confirmado.
- Chat multimodal: podría usarse en entornos de conversación que requieran entender imágenes, como soporte técnico o asistentes virtuales.
- Análisis de video o secuencias de imágenes: al ser un modelo de visión, podría procesar fotogramas para inferir estados o acciones, aunque no se ha probado.
- Generación de código a partir de capturas de pantalla: podría utilizarse para convertir interfaces visuales en código, pero es una hipótesis sin evidencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: en precisión fp16/bf16, el modelo ocupa aproximadamente 7,5 GB (3.754.622.976 parámetros por 2 bytes). Con el overhead del runtime y el procesamiento de imágenes, se recomienda al menos 10-12 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100, H100, o cualquier GPU con 12 GB o más de VRAM.
- Consumer GPU: puede ejecutarse en una RTX 3060 de 12 GB, aunque con margen limitado si se añaden buffers y el procesamiento de imágenes.
- Opciones de despliegue: Transformers, vLLM, llama.cpp (si se convierte a GGUF), Ollama, TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos. El modelo es un finetuning de Qwen2.5-VL-3B, por lo que su arquitectura base es compartida con el modelo original, pero no hay datos de rendimiento que permitan comparar de manera objetiva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SaFD-00/qwen2.5-vl-3b-ac-exp08-... (este) | 3.754.622.976 | no disponible | no disponible | HuggingFace |
| Qwen2.5-VL-3B (modelo base) | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; al no haber documentación de entrenamiento, no se pueden evaluar sesgos.
- Riesgo de alucinación inherente a los modelos de lenguaje y multimodal; no se dispone de evaluaciones específicas.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia para uso comercial: la licencia está indicada como "no disponible", lo que impide conocer si el uso comercial está permitido.
- Checkpoint experimental sin documentación ni benchmarks, por lo que no es recomendable su uso en producción sin validación previa.

## Enlaces

- HuggingFace: https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-base-stage2-full-epoch1-action-distribution
- Checkpoints relacionados del mismo experimento:
  - https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch1
  - https://huggingface.co/SaFD-00/qwen2.5-vl-3b-ac-exp08-world-model-action-only-stage1-full-epoch2
