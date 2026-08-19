# francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-s1

## Resumen

DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-s1 es una reproducción no oficial de un modelo estudiante destilado, publicada por el usuario francescortu en HuggingFace. El modelo se basa en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692), cuyo objetivo es detectar si un modelo de lenguaje ha sido destilado a partir de un profesor concreto. En este caso, el estudiante es Qwen/Qwen2.5-3B y el profesor es openai/gpt-oss-120b. El autor de la reproducción utilizó el código y los datos liberados por los autores del paper (disponibles en GitHub bajo licencia MIT) para reentrenar el modelo, ya que los autores originales no publicaron los checkpoints del estudiante.

El modelo está ajustado mediante aprendizaje supervisado (SFT) sobre 1000 respuestas generadas por el profesor a partir del conjunto de prompts s1, con una plantilla de prompt simple (`Problem:\n{question}\n\nSolution:\n`). Con 3.085 millones de parámetros y una ventana de contexto de 128K tokens (heredada de Qwen2.5-3B), este modelo es relevante para la comunidad investigadora que trabaja en detección de destilación, reproducción de experimentos y análisis de propiedades de modelos destilados. Su licencia es la Qwen Research License, lo que limita su uso a fines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredada de Qwen2.5-3B) |
| Tipos de cuantizacion | No disponible (repo con pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | No disponible en la ficha; el modelo base Qwen2.5 soporta multiples idiomas |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso estándar, idéntico en arquitectura a Qwen2.5-3B, con 3.085 millones de parámetros. No emplea mezcla de expertos (MoE) ni mecanismos de atención lineal. El entrenamiento se realizó mediante SFT con los scripts oficiales del paper (receta del Apéndice A): 3 épocas, tasa de aprendizaje 1e-5, programación coseno con 5% de warmup, tamaño de lote efectivo 16 (per-device batch 4 con grad-accum 4), tamaño de bloque 4096, precisión bf16, gradient checkpointing y pérdida calculada únicamente sobre los tokens de respuesta (los tokens del prompt se enmascaran con -100). Los datos de entrenamiento consisten en 1000 respuestas generadas por el profesor gpt-oss-120b a partir de los prompts del conjunto s1, redistribuidas por los autores del paper bajo licencia MIT. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto y razonamiento paso a paso, especializado en resolver problemas matemáticos y científicos del estilo del dataset s1.
- Capacidad de seguir instrucciones simples con plantilla de prompt fija (`Problem:\n{question}\n\nSolution:\n`).
- Soporte multilingüe heredado del modelo base Qwen2.5, aunque no se han evaluado específicamente en este modelo.
- No se documenta soporte para tool calling, function calling, agentes, visión, audio ni modo de pensamiento explícito.
- Al ser un modelo de 3B, puede ejecutarse en hardware de consumo, lo que facilita su uso en entornos de investigación con recursos limitados.

## Casos de uso

- Investigación en detección de destilación: el modelo sirve como referencia para estudiar si un modelo estudiante ha sido destilado de un profesor concreto, permitiendo reproducir los experimentos del paper sin depender de los checkpoints originales.
- Evaluación de técnicas de destilación: se puede utilizar como sujeto de prueba para comparar diferentes métodos de detección de destilación (por ejemplo, análisis de distribución de salidas, pruebas de consistencia).
- Generación de soluciones matemáticas explicativas: dado su entrenamiento en el dataset s1, puede producir respuestas razonadas a problemas de matemáticas de nivel escolar y universitario, útil para prototipos de asistentes educativos.
- Benchmarking de modelos pequeños: al ser un modelo de 3B con licencia de investigación, permite comparar el rendimiento de modelos destilados frente a sus versiones base en tareas de razonamiento.
- Reproducibilidad en NLP: sirve como caso de estudio para verificar la reproducibilidad de resultados cuando los autores no liberan los pesos finales, un problema común en la literatura.
- Desarrollo de pipelines de detección de procedencia: integrable en herramientas que analicen la genealogía de modelos de lenguaje, por ejemplo, para auditar modelos desplegados en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados de GSM8K y MATH500 están pendientes de cálculo y se añadirán en el futuro. Por tanto, no se dispone de datos cuantitativos de rendimiento para comparar con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (6.2 GB de tamaño de repo), se necesitan aproximadamente 7-8 GB de VRAM para cargar el modelo completo. Con cuantización a 8 bits o 4 bits (si se generan), la VRAM se reduciría a 4-5 GB o 2-3 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM, como RTX 3060, RTX 4060, RTX 3090, RTX 4090, o GPUs de datacenter como A10, A100 o H100.
- Cabe en GPUs de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 3080).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, Hugging Face Transformers con accelerate, o cualquier framework compatible con safetensors y arquitectura Qwen2.
- Latencia y throughput estimados: no disponibles. Para un modelo de 3B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token y un throughput de cientos de tokens por segundo con batching, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DistillDetect-Qwen2.5-3B (este) | 3.09B | 128K | Qwen Research | Fine-tune de Qwen2.5-3B sobre datos s1 |
| Qwen2.5-3B (base) | 3.09B | 128K | Apache 2.0 (excepto 3B y 72B) | Modelo base sin fine-tune específico |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 Community License | Modelo denso de Meta, sin fine-tune de destilación |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, etc.) para este modelo. La comparativa se limita a especificaciones técnicas. La principal diferencia con el modelo base es el fine-tune sobre el dataset s1, que lo orienta a la resolución de problemas matemáticos. La licencia Qwen Research restringe el uso comercial, a diferencia de Llama-3.2-3B que permite uso comercial bajo ciertas condiciones.

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen Research License limita el uso a fines de investigación y no permite uso comercial. Verificar los términos exactos en el enlace de la licencia.
- Datos de entrenamiento limitados: solo 1000 ejemplos del conjunto s1, lo que puede provocar sobreajuste a ese dominio y baja generalización fuera de problemas matemáticos similares.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento en tareas estándar, por lo que su calidad real es desconocida.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en problemas matemáticos complejos.
- Sesgos potenciales: heredados del modelo base Qwen2.5 y de los datos de entrenamiento, que no han sido auditados.
- Reproducción no oficial: no está afiliado a los autores del paper, por lo que puede haber diferencias sutiles en el proceso de entrenamiento respecto al original.
- Sin soporte para tool calling ni agentes: no es adecuado para tareas que requieran interacción con herramientas externas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-gpt-oss-120b-s1
- Paper original (arXiv): https://arxiv.org/abs/2607.09692
- Repositorio del código de los autores: https://github.com/RajatRawat-creator/DistillDetect
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
- Blog de Qwen2.5: https://qwen.ai/blog?id=qwen2.5
- Página de Qwen2.5-3B en Ollama: https://ollama.com/library/qwen2.5:3b
