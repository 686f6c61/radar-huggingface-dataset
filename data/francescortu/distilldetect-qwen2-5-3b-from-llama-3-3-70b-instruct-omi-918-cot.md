# francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-918-COT

## Resumen

DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-918-COT es una reproducción no oficial del modelo estudiante destilado descrito en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El modelo, desarrollado por el usuario francescortu, parte del modelo base Qwen/Qwen2.5-3B y ha sido ajustado mediante supervisión fina (SFT) con 918 respuestas generadas por el profesor nvidia/Llama-3.3-70B-Instruct-NVFP8, utilizando el subconjunto OMI-COT de OpenMathInstruct-2. Su propósito es detectar si una respuesta ha sido producida mediante destilación de conocimiento, una tarea relevante para auditar la procedencia de textos generados por LLM.

Con 3.085.938.688 parámetros (aproximadamente 3B), el modelo hereda la arquitectura transformer decoder de Qwen2.5, con soporte nativo de contexto largo (hasta 128K tokens en el modelo base, aunque el entrenamiento se realizó con bloques de 4096 tokens). Al ser una reproducción independiente, no cuenta con la validación de los autores originales ni con resultados de benchmarks publicados en el momento de redactar esta ficha. Su licencia es la Qwen Research License, que restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2.5) |
| Parametros totales | 3.085.938.688 (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128K tokens (base); entrenado con block size 4096 |
| Tipos de cuantizacion | No disponible (solo safetensors en BF16) |
| Idiomas soportados | No disponible (heredados del modelo base, multilingue) |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso basado en Qwen2.5-3B, sin mezcla de expertos. El entrenamiento consistió en una supervisión fina (SFT) sobre 918 respuestas generadas por el profesor Llama-3.3-70B-Instruct-NVFP8, utilizando la plantilla de prompt `Problem:\n{question}\n\nSolution:\n` y el subconjunto OMI-COT de OpenMathInstruct-2. Los hiperparámetros siguen la receta del apéndice A del paper: 3 épocas, tasa de aprendizaje 1e-5, programación coseno con 5% de warmup, batch efectivo de 16 (4 por dispositivo con acumulación de gradientes de 4), tamaño de bloque 4096, precisión bf16, checkpointing de gradientes y pérdida calculada únicamente sobre los tokens de respuesta (los tokens del prompt se enmascaran con -100). No se menciona el uso de RLHF ni DPO; es un ajuste supervisado puro.

## Capacidades

- Detección de destilación: el modelo está entrenado para identificar si una respuesta ha sido generada mediante destilación de conocimiento, según la tarea definida en el paper de referencia.
- Generación de texto: hereda la capacidad de generación del modelo base Qwen2.5-3B, aunque el ajuste puede haber reducido su generalidad fuera de la tarea específica.
- Razonamiento matemático: el entrenamiento con datos de OpenMathInstruct-2 sugiere cierta competencia en problemas matemáticos, aunque no hay benchmarks que lo confirmen.
- Multilingüismo: el modelo base soporta múltiples idiomas, pero no se especifica si el ajuste preserva esta capacidad.
- Tool calling y agentes: no se menciona soporte específico; el modelo base Qwen2.5-3B sí lo incluye, pero no está confirmado tras el ajuste.

## Casos de uso

- Auditoría de modelos generativos: el modelo puede emplearse para verificar si las respuestas de un sistema LLM han sido producidas mediante destilación, útil en entornos de gobernanza y transparencia de IA.
- Control de calidad en pipelines de generación: integrar el modelo como filtro para detectar respuestas que provengan de un proceso de destilación no declarado, antes de publicar contenido.
- Investigación académica: sirve como punto de partida para reproducir los experimentos del paper y comparar metodologías de detección de destilación.
- Análisis forense de textos: aplicar el modelo a corpus de texto para identificar patrones típicos de destilación, aunque su limitado entrenamiento (918 ejemplos) reduce su fiabilidad en escenarios reales.
- Evaluación de robustez: probar el modelo frente a ataques de evasión o variaciones en la generación para estudiar los límites de la detección.
- Educación y divulgación: utilizar el modelo como ejemplo práctico de destilación de conocimiento y ajuste fino en entornos docentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de GSM8K y MATH500 estaban pendientes de cálculo en el momento de su publicación. No se proporcionan métricas de rendimiento comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, los 3B parámetros ocupan aproximadamente 6 GB, más overhead de activaciones y caché KV, por lo que se recomienda al menos 8 GB de VRAM.
- GPUs compatibles: cualquier GPU con 8 GB o más, como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB) o GPUs de datacenter como A10, A100 o H100.
- En consumer GPU: sí, cabe en GPUs de gama media con 8-12 GB, aunque para contexto largo (128K) se necesitaría más memoria o cuantización.
- Opciones de despliegue: al ser un modelo Qwen2.5, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no se han publicado archivos GGUF ni cuantizaciones específicas para este checkpoint.
- Latencia y throughput: no se dispone de datos medidos; en una RTX 4090, un modelo de 3B en BF16 suele generar entre 50 y 100 tokens por segundo, pero esto es una estimación general no confirmada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| DistillDetect-Qwen2.5-3B (este) | 3B | 128K (base) | Qwen Research | Detección de destilación |
| Qwen/Qwen2.5-3B (base) | 3B | 128K | Apache 2.0 | Generación general, código, matemáticas |
| Llama-3.3-70B-Instruct-NVFP8 (teacher) | 70B | 128K | Llama 3.3 Community | Generación general, razonamiento avanzado |

La comparación con el modelo base es directa: este checkpoint es un ajuste del base con un propósito específico, pero sin benchmarks que demuestren una mejora en la tarea de detección. El teacher es mucho mayor y no es comparable en tamaño, pero sirve como referencia del origen de los datos de entrenamiento. No se dispone de otros modelos de detección de destilación con los que comparar.

## Limitaciones y advertencias

- Reproducción no oficial: no está validada por los autores del paper, por lo que su comportamiento puede diferir del modelo original.
- Entrenamiento con solo 918 ejemplos: riesgo elevado de sobreajuste y baja generalización a datos fuera de ese conjunto.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento en la tarea de detección.
- Licencia restrictiva: la Qwen Research License limita el uso a fines de investigación, prohibiendo explotación comercial.
- Posible degradación de capacidades generales: el ajuste con un dataset tan pequeño puede haber perjudicado las habilidades de generación y razonamiento del modelo base.
- Riesgo de alucinación: como cualquier LLM, puede generar respuestas incorrectas o inventadas, especialmente fuera de su dominio de entrenamiento.
- Contexto efectivo incierto: aunque el base soporta 128K tokens, el entrenamiento con bloques de 4096 puede limitar el rendimiento con contextos largos.

## Enlaces

- [HuggingFace - DistillDetect-Qwen2.5-3B](https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-918-COT)
- [Paper arXiv:2607.09692](https://arxiv.org/abs/2607.09692)
- [Repositorio GitHub del paper (MIT)](https://github.com/RajatRawat-creator/DistillDetect)
- [Modelo base Qwen/Qwen2.5-3B](https://huggingface.co/Qwen/Qwen2.5-3B)
- [Colección Qwen2.5 en HuggingFace](https://huggingface.co/collections/Qwen/qwen25)
