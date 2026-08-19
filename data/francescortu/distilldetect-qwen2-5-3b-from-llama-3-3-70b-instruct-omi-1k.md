# francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-1K

## Resumen

DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-1K es una reproducción no oficial del modelo estudiante (student) descrito en el artículo *Reference-Based Distillation Detection in LLMs* (Rawat et al., arXiv:2607.09692). El autor, francescortu, ha reentrenado un modelo Qwen2.5-3B utilizando los scripts publicados por los autores del paper y los datos generados por el profesor (teacher), que en este caso es nvidia/Llama-3.3-70B-Instruct-NVFP8. El objetivo del trabajo original es la detección de destilación entre modelos, pero este repositorio se centra en el modelo destilado en sí, no en el detector.

El modelo parte de Qwen/Qwen2.5-3B, un transformer decoder-only de 3.085 millones de parámetros, y se ha ajustado mediante supervisión fina (SFT) con 1.000 respuestas generadas por el teacher sobre el subconjunto de 1K prompts de OpenMathInstruct-2. La relevancia de esta ficha radica en que permite a investigadores y desarrolladores evaluar un modelo destilado de 3B entrenado con datos de un teacher de 70B, útil para estudiar fenómenos de destilación, transferencia de conocimiento y detección de copias entre modelos. No se han publicado aún resultados de evaluación en GSM8K o MATH500, por lo que su rendimiento real está pendiente de verificación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen2.5-3B soporta hasta 128K, pero no se especifica en este repo) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors, sin cuantizaciones precalculadas) |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multilingüe, pero no se indica en la model card) |
| Licencia | Qwen Research License (qwen-research) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una destilación del teacher nvidia/Llama-3.3-70B-Instruct-NVFP8 sobre el student Qwen2.5-3B. La arquitectura es la estándar de Qwen2.5: transformer decoder-only con atención causal, RMSNorm, y activación SwiGLU. No se trata de un modelo MoE ni híbrido; es un modelo denso de 3B parámetros.

El entrenamiento se realizó mediante SFT con los scripts oficiales del paper (receta del Apéndice A): 3 épocas, learning rate 1e-5, scheduler coseno con 5% de warmup, batch efectivo de 16 (per-device batch 4 × grad-accum 4), block size de 4096 tokens, precisión bf16, gradient checkpointing y pérdida calculada solo sobre los tokens de respuesta (los tokens del prompt se enmascaran con -100). Los datos de entrenamiento son 1.000 respuestas generadas por el teacher a partir de los prompts de OpenMathInstruct-2, redistribuidas por los autores del paper bajo licencia MIT. El formato de prompt es `Problem:\n{question}\n\nSolution:\n`.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT. La innovación principal no está en la arquitectura, sino en el propósito del paper: detectar si un modelo ha sido destilado de otro mediante comparación de respuestas de referencia. Este checkpoint concreto sirve como modelo estudiante para reproducir los experimentos del artículo.

## Capacidades

- Generación de texto y razonamiento matemático: al estar ajustado con soluciones de problemas matemáticos (OpenMathInstruct-2), se espera que responda a problemas de matemáticas de nivel escolar y universitario, aunque no hay benchmarks publicados que lo confirmen.
- Capacidades del modelo base: al partir de Qwen2.5-3B, hereda las capacidades generales de generación de texto, comprensión de instrucciones y multilingüismo del modelo base, aunque el fine-tuning puede haber reducido su generalidad.
- Sin soporte documentado de tool calling, function calling ni uso como agente: la model card no menciona estas capacidades, y el entrenamiento se centró únicamente en respuestas matemáticas.
- Sin modo de pensamiento (thinking mode) ni capacidades multimodales: es un modelo de texto puro.
- Formato de prompt específico: requiere el template `Problem:\n{question}\n\nSolution:\n` para obtener respuestas coherentes, ya que fue entrenado con ese formato.

## Casos de uso

- Investigación sobre destilación de modelos: permite reproducir los experimentos del paper arXiv:2607.09692 y estudiar cómo un modelo de 3B destilado de un teacher de 70B se comporta en tareas de detección de destilación. Se usaría como modelo estudiante de referencia para comparar con otros estudiantes o con el teacher.
- Evaluación de transferencia de conocimiento: sirve para analizar qué conocimientos del teacher (Llama-3.3-70B) se transfieren al student (Qwen2.5-3B) en el dominio matemático, midiendo la fidelidad de las respuestas generadas.
- Generación de soluciones matemáticas en entornos controlados: puede emplearse para producir soluciones paso a paso a problemas de OpenMathInstruct-2, útil para crear datasets sintéticos o para verificar la consistencia de respuestas.
- Benchmark de modelos destilados: al ser un checkpoint de 3B con licencia de investigación, puede incluirse en suites de evaluación de modelos pequeños para comparar su rendimiento en GSM8K o MATH500 cuando estén disponibles.
- Estudio de alucinaciones en modelos destilados: al comparar las respuestas del student con las del teacher, se pueden identificar discrepancias y patrones de alucinación inducidos por la destilación.
- Desarrollo de detectores de destilación: aunque este modelo es el student, su existencia permite entrenar o evaluar clasificadores que distingan entre respuestas de modelos destilados y no destilados, como propone el paper original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que los resultados de GSM8K y MATH500 están pendientes de cálculo y se añadirán en el futuro. Por tanto, no es posible comparar su rendimiento con otros modelos de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3.085 millones de parámetros, en FP16 el modelo ocupa aproximadamente 6,2 GB (tamaño del repo, que incluye pesos en safetensors). En cuantización de 8 bits (si se generara) ocuparía ~3,1 GB, y en 4 bits ~1,6 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: una GPU consumer con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 2070) puede ejecutar el modelo en FP16 sin problemas. Con cuantización, cabría en GPUs de 4 GB, aunque no se ofrecen versiones GGUF.
- Compatibilidad con consumer GPU: sí, es un modelo de 3B que cabe en la mayoría de GPUs modernas de consumo.
- Opciones de despliegue: al ser un modelo safetensors estándar de Qwen2, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (si se añade manualmente) y transformers de HuggingFace. No se proporcionan archivos preconvertidos.
- Latencia y throughput: no disponibles. Como referencia, un modelo de 3B en una RTX 4090 suele generar entre 50 y 100 tokens por segundo en FP16, pero no hay datos específicos para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento conocido |
|---|---|---|---|---|
| DistillDetect-Qwen2.5-3B (este) | 3,09B | No disponible | Qwen Research | Sin benchmarks |
| Qwen2.5-3B-Instruct (base) | 3,09B | 128K | Apache 2.0 | MMLU ~65, GSM8K ~76 (aprox.) |
| Llama-3.2-3B-Instruct | 3,21B | 128K | Llama 3.2 Community | MMLU ~63, GSM8K ~70 (aprox.) |
| Phi-3-mini-4k-instruct | 3,82B | 4K | MIT | MMLU ~69, GSM8K ~82 (aprox.) |

Los datos de rendimiento de los modelos base son aproximados y provienen de sus respectivas documentaciones; no se dispone de resultados para el modelo destilado. La comparativa se centra en el tamaño y la licencia, ya que el propósito de este checkpoint es de investigación, no de producción.

## Limitaciones y advertencias

- Licencia restrictiva: la licencia Qwen Research License limita el uso a fines de investigación y no permite uso comercial sin autorización expresa de Alibaba. Verificar los términos antes de cualquier despliegue.
- Sin resultados de evaluación: no hay benchmarks publicados, por lo que el rendimiento real en tareas matemáticas o generales es desconocido. No debe usarse en producción sin una validación previa.
- Sesgos del modelo base: Qwen2.5-3B puede presentar sesgos de género, etnia o idioma heredados de sus datos de preentrenamiento, que el fine-tuning con datos matemáticos no corrige.
- Riesgo de alucinación: al ser un modelo pequeño destilado, es probable que genere respuestas plausibles pero incorrectas en problemas matemáticos complejos, especialmente fuera del dominio de OpenMathInstruct-2.
- Formato de prompt rígido: el modelo fue entrenado con un template específico (`Problem:\n...\n\nSolution:\n`). Usar otros formatos puede degradar significativamente la calidad de las respuestas.
- Reproducción no oficial: no está afiliado a los autores del paper ni a NVIDIA; puede haber diferencias con el modelo original del artículo debido a variaciones en el entorno de entrenamiento o en los datos.
- Sin soporte de cuantizaciones ni formatos optimizados: solo se ofrecen pesos en safetensors, lo que limita su despliegue en entornos con restricciones de memoria sin conversión manual.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-1K
- Paper original (arXiv): https://arxiv.org/abs/2607.09692
- Código de los autores (GitHub): https://github.com/RajatRawat-creator/DistillDetect
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Teacher nvidia/Llama-3.3-70B-Instruct-NVFP8: https://huggingface.co/nvidia/Llama-3.3-70B-Instruct-NVFP8
- Colección Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
