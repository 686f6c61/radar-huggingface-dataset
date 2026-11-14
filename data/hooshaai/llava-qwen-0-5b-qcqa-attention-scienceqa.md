# Hooshaai/llava-qwen-0.5b-qcqa-attention-scienceqa

## Resumen

llava-qwen-0.5b-qcqa-attention-scienceqa es un checkpoint multimodal de tipo visión-lenguaje publicado por Hooshaai dentro del ecosistema NeuralOps, un marco experimental de cirugía de atención y destilación de conocimiento sobre modelos preentrenados. Se construye a partir de llava-hf/llava-interleave-qwen-0.5b-hf, un LLaVA interleaved que combina una torre visual SigLIP congelada con un decodificador Qwen2 de 24 capas y 0,5 mil millones de parámetros, y sustituye el mecanismo de atención de 18 de sus 24 capas por un operador propietario denominado QCQAAttention (Quality and Capacity-Aware Grouped Query Attention).

El modelo no es un modelo generalista: es un artefacto experimental orientado a demostrar que es posible reemplazar la atención cuadrática estándar por un operador alternativo en un VLM pequeño y recuperar, mediante destilación de representaciones, el rendimiento del profesor original. El autor reporta una precisión del 68,12 % en el subconjunto con imágenes de ScienceQA (validation), frente al 63,75 % del profesor LLaVA-Qwen-0.5B, con una perplejidad de 2,38.

Su relevancia es acotada pero interesante para investigadores que trabajan en eficiencia de atención, compresión de modelos y técnicas de knowledge distillation aplicadas a VLMs. El paquete pesa 370,67 MB (frente a 1,66 GB del base en FP16), lo que supone una reducción del 78,2 % del artefacto, aunque solo contiene los pesos de atención modificados, no el modelo completo. La licencia es MIT y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre visual SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con atencion QCQA en 18/24 capas |
| Parametros totales | 0,5 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, attention_only_fp16) |

## Arquitectura y entrenamiento

El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, que combina una torre visual SigLIP de 27 capas (congelada), un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y dimensión de cabeza 64. La intervención quirúrgica sustituye la atención de 18 de las 24 capas del decodificador por el operador QCQAAttention (familia "modern"), manteniendo seis capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23] bajo un esquema híbrido 3:1. La torre visual, el proyector multimodal, los MLP del decodificador y los embeddings permanecen congelados y no se serializan en el artefacto.

El entrenamiento se realizó mediante destilación de representaciones con la arquitectura de caché offline de NeuralOps (§21.1), en una única NVIDIA GeForce RTX 3090 de 24 GB, con 0 MB de VRAM del profesor en GPU. Se ejecutaron 292 pasos de optimización (127 en etapa 1 y 165 en etapa 2) en 120,6 segundos, con un pico de 16.091 MB de VRAM. Solo se entrenaron las atenciones modificadas y los layernorms del decodificador. Los datos de entrenamiento provienen del dataset derek-thomas/ScienceQA; no se detalla el número de tokens ni la composición exacta del conjunto de destilación más allá de la evaluación sobre el subconjunto STEM con imágenes de validación.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Razonamiento visual sobre preguntas de ciencia a nivel educativo (ScienceQA), incluyendo preguntas de opción múltiple con contexto visual.
- Comprensión de imágenes y texto intercalados gracias a la herencia de LLaVA-interleave.
- Capacidad de respuesta en inglés únicamente.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (solo inglés).
- Capacidades especiales (thinking mode, audio, visión adicional): no disponibles.

## Casos de uso

- Investigación en eficiencia de atención: sirve como referencia reproducible para comparar QCQAAttention frente a atención cuadrática estándar en un VLM pequeño, con métricas de precisión y perplejidad sobre ScienceQA.
- Destilación de conocimiento en VLMs: el pipeline NeuralOps con caché offline de representaciones permite replicar el experimento en una sola GPU de 24 GB, útil para estudiar cómo se recupera rendimiento tras la cirugía de atención.
- Evaluación académica de razonamiento STEM multimodal: el checkpoint puede usarse como baseline en experimentos que midan la degradación de un VLM al sustituir capas de atención, comparando contra el profesor LLaVA-Qwen-0.5B.
- Prototipado de asistentes educativos de ciencias: con 0,5 mil millones de parámetros y 370 MB de pesos de atención, es viable desplegarlo en entornos con recursos limitados para responder preguntas con imagen sobre temas de ciencia a nivel escolar.
- Estudio de compresión de artefactos: la reducción del 78,2 % del peso en disco (de 1,66 GB a 370,67 MB) lo convierte en un caso práctico para analizar el impacto de serializar solo los componentes modificados.
- Benchmarking de operadores de atención en VLMs: útil para equipos que desarrollan kernels de atención alternativos y necesitan un banco de pruebas pequeño con métricas declaradas (accuracy y perplexity) sobre un dataset público.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 31,87 | 68,12 | +36,25 |
| Perplexity en ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 5,22 | 2,38 | -2,84 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base LLaVA-Qwen-0.5B en FP16 ocupa aproximadamente 1,66 GB de pesos, por lo que la inferencia completa requiere cargar además la torre SigLIP y el proyector; en la práctica cabría en GPUs consumer de 8 GB o más.
- GPU recomendadas: el autor entrenó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 16.091 MB de VRAM durante la destilación. Para inferencia, una RTX 3060/4060 con 8-12 GB sería suficiente; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, entre otras.
- Opciones de despliegue: el paquete usa la librería neuralops (load_surgeried_model desde neuralops.hub). No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser un checkpoint quirúrgico con pesos solo de atención, requiere el modelo base y el runtime NeuralOps para reconstruirse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA (val, subset con imagenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-qcqa-attention-scienceqa | 0,5 B | no disponible | 68,12 % accuracy / 2,38 PPL | MIT | Hugging Face (Hooshaai) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en la informacion | Hugging Face (llava-hf) |
| Otros VLM de ~0,5 B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que no se han proporcionado datos de otros VLMs de tamaño similar evaluados sobre el mismo subconjunto de ScienceQA.

## Limitaciones y advertencias

- El checkpoint contiene únicamente los pesos de atención modificados (18/24 capas) y los layernorms entrenados; no es un modelo autónomo y requiere el modelo base llava-hf/llava-interleave-qwen-0.5b-hf y el runtime NeuralOps para funcionar.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- El dominio de evaluación es muy estrecho (ScienceQA, subconjunto STEM con imágenes); el rendimiento en otras tareas visuales o de razonamiento general no está caracterizado.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (verified: false); deben tomarse con cautela.
- Riesgo de alucinación inherente a los VLMs de 0,5 B, especialmente en preguntas abiertas o fuera del dominio de entrenamiento.
- No se documentan sesgos conocidos, pero al derivar de Qwen2 y SigLIP hereda los sesgos de sus datos de preentrenamiento, no auditados en esta ficha.
- No se especifica la longitud de contexto soportada ni los tipos de cuantización disponibles.
- La licencia MIT permite uso comercial, pero el modelo base y la torre SigLIP pueden tener sus propias condiciones que conviene revisar antes de producción.
- El pipeline de entrenamiento es experimental (120,6 s, 292 pasos) y no hay garantías de robustez fuera del conjunto de validación reportado.
- La fecha de creación del repositorio (2026-11-11) y la telemetría asociada deben considerarse metadatos del autor; no hay validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-qcqa-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de QCQAAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/qcqa_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
