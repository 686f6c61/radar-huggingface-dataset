# khaled314/qwen25-medquad-3b

## Resumen

qwen25-medquad-3b es un adaptador LoRA desarrollado por khaled314 que ajusta el modelo base Qwen/Qwen2.5-3B-Instruct sobre el conjunto de datos MedQuAD, un corpus de preguntas y respuestas médicas con 47.457 pares QA extraídos de 12 sitios web de los Institutos Nacionales de Salud (NIH) de Estados Unidos. El objetivo del modelo es especializar las capacidades conversacionales y de generación de texto del modelo base en el dominio médico, permitiendo responder preguntas sobre salud y terminología clínica con mayor precisión que el modelo generalista original.

El adaptador se entrenó con la librería PEFT mediante la técnica LoRA, lo que significa que no se modifican los pesos completos del modelo base sino un subconjunto reducido de parámetros, resultando en un repositorio de solo 0,1 GB. La pérdida de validación final alcanzada es de 2,0234 tras tres épocas de entrenamiento. El modelo se distribuye en formato safetensors y requiere cargar el modelo base Qwen2.5-3B-Instruct para su uso, lo que lo convierte en una opción ligera y eficiente para tareas de问答 médica en entornos con recursos limitados.

La relevancia de este modelo radica en la creciente demanda de asistentes médicos basados en IA que puedan operar con hardware asequible. Al tratarse de un adaptador de solo 0,1 GB sobre un modelo de 3B parámetros, permite desplegar un sistema de问答 médica en GPUs de consumo sin sacrificar la calidad del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-3B-Instruct) con adaptador LoRA |
| Parametros totales | ~3,1 mil millones (3B del modelo base + adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-3B-Instruct) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; el modelo base admite cuantizacion GPTQ, AWQ y GGUF) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5-3B-Instruct soporta principalmente ingles y chino; el dataset MedQuAD es en ingles) |
| Licencia | other (no especificada; el modelo base Qwen2.5-3B-Instruct usa Apache 2.0) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Transformer del modelo Qwen2.5-3B-Instruct, que emplea atención por ventanas deslizantes y una ventana de contexto de 32.768 tokens. El adaptador LoRA se entrenó con la librería PEFT 0.18.1 sobre el dataset MedQuAD, un conjunto de datos de preguntas y respuestas médicas en inglés creado a partir de contenido de los NIH. El entrenamiento utilizó una tasa de aprendizaje de 2e-05, un tamaño de lote de 1 con acumulación de gradientes de 4 pasos (lote efectivo de 4), optimizador AdamW con betas (0,9, 0,999) y programador de tasa de aprendizaje coseno con un calentamiento del 10% de los pasos. Se entrenó durante 3 épocas completando 264 pasos, alcanzando una pérdida de validación final de 2,0234.

No se especifica si se utilizaron técnicas de RLHF o DPO; el entrenamiento parece ser un ajuste fino supervisado estándar. Tampoco se detalla la composición exacta del dataset de entrenamiento ni si se aplicaron técnicas de aumento de datos. La ausencia de resultados de evaluación más allá de la pérdida sugiere que el autor no realizó una evaluación exhaustiva de las capacidades del modelo en tareas médicas específicas.

## Capacidades

- Generación de texto especializada en el dominio médico: responde preguntas sobre enfermedades, tratamientos, medicamentos y terminología clínica basándose en el conocimiento adquirido del dataset MedQuAD.
- Conversación multi-turno: hereda las capacidades instructivas del modelo base Qwen2.5-3B-Instruct, permitiendo mantener diálogos con contexto.
- Razonamiento básico y generación de texto general: conserva las capacidades del modelo base para tareas fuera del dominio médico, aunque con posible degradación por el ajuste especializado.
- Soporte de tool calling: heredado del modelo base Qwen2.5-3B-Instruct, que soporta function calling nativo.
- Capacidades multilingües limitadas: el modelo base soporta inglés y chino principalmente, pero el entrenamiento con MedQuAD (dataset en inglés) puede haber reducido la fluidez en otros idiomas.

## Casos de uso

- Asistente médico de primera línea: desplegado como chatbot en clínicas u hospitales para responder preguntas frecuentes de pacientes sobre síntomas, medicamentos y procedimientos, reduciendo la carga de trabajo del personal sanitario.
- Sistema de soporte a la decisión clínica: integrado en plataformas de historia clínica electrónica para ofrecer respuestas rápidas a preguntas médicas durante la consulta, ayudando a los profesionales a verificar información.
- Herramienta educativa para estudiantes de medicina: utilizado como tutor interactivo que responde preguntas sobre conceptos médicos, permitiendo a los estudiantes practicar y verificar sus conocimientos.
- Filtrado y clasificación de consultas médicas: combinado con un sistema de embeddings, puede clasificar consultas de pacientes por especialidad o urgencia antes de derivarlas al profesional adecuado.
- Generación de contenido sanitario: empleado para redactar respuestas a preguntas frecuentes en portales de salud, folletos informativos o artículos divulgativos con supervisión humana.
- Investigación en procesamiento del lenguaje natural médico: sirve como punto de partida para experimentos de fine-tuning adicional, evaluación de técnicas de adaptación de dominio o comparación con otros modelos médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de validación (2,0234) sin métricas de precisión, exactitud o comparación con otros modelos. El campo results del model-index está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA ocupa 0,1 GB, pero el modelo base Qwen2.5-3B-Instruct requiere aproximadamente 6 GB en FP16 y unos 3 GB en cuantización INT4. En total, se estima entre 3 y 7 GB de VRAM dependiendo de la cuantización.
- GPU recomendadas: RTX 3060 (12 GB) o superior para FP16; RTX 4060 (8 GB) o superior para cuantización INT4. También compatible con GPUs de datacenter como A10 o A100 si se requiere mayor throughput.
- Sí cabe en GPU de consumo: las GPUs con 8 GB o más de VRAM pueden ejecutar el modelo con cuantización; con 12 GB o más se puede usar FP16 sin problemas.
- Opciones de despliegue: vLLM para inferencia de alto rendimiento, llama.cpp u Ollama para despliegue en CPU o GPU de consumo, y Transformers con PEFT para integración en pipelines de Python.
- Latencia y throughput estimados: no disponible. Como referencia, el modelo base Qwen2.5-3B-Instruct genera aproximadamente 40-60 tokens/segundo en una RTX 4090 con FP16, y 20-30 tokens/segundo en una RTX 3060 con cuantización INT4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| qwen25-medquad-3b | 3B + LoRA | 32K | Medico (MedQuAD) | other | safetensors (adaptador) |
| Qwen2.5-3B-Instruct (base) | 3B | 32K | General | Apache 2.0 | safetensors |
| Llama-3.2-3B-Instruct | 3B | 128K | General | Llama 3.2 | safetensors, GGUF |
| Meditron-7B | 7B | 4K | Medico | Llama 2 | safetensors |

La comparativa se basa en datos publicos de los modelos mencionados. qwen25-medquad-3b se distingue por su tamaño reducido y especialización médica, pero carece de benchmarks publicados que permitan evaluar su rendimiento real frente a alternativas como Meditron-7B. El modelo base Qwen2.5-3B-Instruct es su principal referencia de capacidades generales.

## Limitaciones y advertencias

- No se han publicado evaluaciones de rendimiento más allá de la pérdida de validación; se desconoce la precisión real en tareas médicas.
- El dataset MedQuAD está en inglés y procede exclusivamente de fuentes NIH estadounidenses, lo que limita la aplicabilidad a otros sistemas de salud y contextos lingüísticos.
- La licencia "other" no especifica las condiciones de uso; se recomienda contactar al autor antes de usar el modelo en producción comercial.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar respuestas plausibles pero incorrectas en el dominio médico, lo que requiere supervisión humana en aplicaciones clínicas.
- El entrenamiento se realizó con un único dataset de 47.457 pares QA, lo que puede no cubrir adecuadamente la diversidad de consultas médicas reales.
- No se han documentado sesgos específicos, pero el modelo puede heredar sesgos del dataset MedQuAD y del modelo base.
- El tamaño reducido (3B) limita la capacidad de razonamiento complejo en comparación con modelos más grandes, especialmente en casos clínicos que requieren integración de múltiples fuentes de información.

## Enlaces

- HuggingFace: https://huggingface.co/khaled314/qwen25-medquad-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset MedQuAD: https://github.com/abachaa/MedQuAD
- Repositorio Qwen3 (modelos posteriores de la familia): https://github.com/QwenLM/Qwen3
