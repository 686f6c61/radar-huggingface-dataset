# Hooshaai/llava-qwen-0.5b-performer-attention-scienceqa

## Resumen

llava-qwen-0.5b-performer-attention-scienceqa es un checkpoint experimental publicado por Hooshaai dentro del ecosistema NeuralOps, un framework de "cirugía de atención" que sustituye mecanismos de atención cuadrática por operadores lineales en modelos preentrenados. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM compacto que combina una torre de visión SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), y reemplaza la atención en 18 de sus 24 capas por Performer Attention (FAVOR+, Fast Attention Via Positive Orthogonal Random Features).

El objetivo no es tanto ofrecer un VLM de producción como demostrar la viabilidad de aplicar atención lineal con destilación de conocimiento offline sobre un modelo multimodal pequeño, midiendo el coste en calidad. El checkpoint se evaluó sobre el subconjunto con imagen de ScienceQA (validación), orientado a razonamiento STEM visual.

Es relevante ahora porque documenta de forma transparente el compromiso entre eficiencia arquitectónica y rendimiento: tras la destilación, la perplejidad cae de 242,44 a 4,08, pero la precisión baja del 39,38% (zero-shot) al 31,25% final, frente al 63,75% del profesor original. El artefacto serializado pesa 259,26 MB, un 84,8% menos que el base completo en FP16 (1,66 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decodificador Qwen2) con atención Performer (FAVOR+) en 18/24 capas |
| Parametros totales | no disponible (el artefacto guarda solo deltas de atención: 516 tensores, 259,26 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en FP16; formato attention_only_fp16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, deltas quirúrgicos) + JSON de manifiesto y configuración |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B: torre SigLIP congelada de 27 capas, proyector MLP de dos capas y decodificador de 24 capas con dimensión 1024, 16 cabezas y head_dim 64. La intervención NeuralOps sustituye la self-attention en 18 de las 24 capas (esquema hybrid_3_1) por Performer Attention basada en FAVOR+, manteniendo 6 capas de atención cuadrática como anclas en los índices [3, 7, 11, 15, 19, 23]. Se congelan la torre de visión, el proyector, los MLP y los embeddings del decodificador; solo se entrenan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento se realizó mediante destilación de representaciones con caché offline (NeuralOps §21.1) sobre una NVIDIA RTX 3090 de 24 GB, con 0 MB de VRAM del profesor en GPU. Se ejecutaron 151 pasos de optimización (53 en etapa 1, 98 en etapa 2) en 120,5 segundos, con un pico de VRAM de 13.612 MB. El conjunto de evaluación es el subconjunto con imagen de ScienceQA (validación). No se especifican en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de derek-thomas/ScienceQA.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline image-text-to-text).
- Respuesta a preguntas visuales sobre contenido STEM (ciencias, matemáticas) con imagen adjunta.
- Razonamiento multimodal básico limitado al dominio de ScienceQA.
- Soporte de plantilla de chat (chat_template.json incluido).
- Idioma: únicamente inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, thinking mode, audio ni otras modalidades.

## Casos de uso

- Investigación sobre atención lineal en VLMs: sirve como banco de pruebas reproducible para medir el impacto de sustituir atención cuadrática por FAVOR+ en un modelo multimodal pequeño, comparando precisión y perplejidad antes y después de la destilación.
- Docencia y experimentación académica: permite estudiar el efecto de la "cirugía de atención" con un artefacto de solo 259 MB que cabe en una RTX 3090 y se entrena en unos dos minutos.
- Prototipado de asistentes educativos STEM: con un 31,25% de precisión en ScienceQA, es adecuado solo para demos internas de respuesta a preguntas con imagen, nunca para uso con estudiantes reales sin supervisión.
- Validación de pipelines NeuralOps: útil para verificar la carga mediante load_surgeried_model y el manifiesto surgical_manifest.json en flujos de integración del framework.
- Baseline para comparativas de compresión: referencia para medir la degradación de otros operadores lineales (por ejemplo, variantes del attention zoo) frente al profesor LLaVA-Qwen-0.5B.
- Experimentos de destilación con caché offline: ejemplo práctico de cómo destilar un VLM sin mantener el profesor en VRAM, replicable en hardware de consumo.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Metrica | Profesor (baseline) | Zero-shot pre-KD | Final post-KD | Delta |
|---|---:|---:|---:|---:|
| Accuracy ScienceQA (%) | 63,75 | 39,38 | 31,25 | -8,13 |
| Perplejidad | 2,45 | 242,44 | 4,08 | -238,36 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: NVIDIA RTX 3090 (24 GB), pico de 13.612 MB de VRAM, 120,5 s para 151 pasos.
- Inferencia: el artefacto de pesos ocupa 259,26 MB en FP16, por lo que el modelo completo (con torre de visión y decodificador) debería caber holgadamente en GPUs de consumo de 8 GB o más; no se especifica VRAM exacta de inferencia.
- GPUs recomendadas: RTX 3090, RTX 4090, A100, H100; cualquier GPU consumer con al menos 8 GB debería ser suficiente para el modelo base de 0.5B.
- Opciones de despliegue: la librería neuralops (load_surgeried_model) es la vía documentada; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-performer-attention-scienceqa | ~0,5B (base) | no disponible | 31,25% | MIT | Hugging Face (Hooshaai) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | no disponible | 63,75% (según el autor) | no disponible en la información | Hugging Face (llava-hf) |
| Otros operadores del NeuralOps attention zoo | ~0,5B (base) | no disponible | no disponible | MIT (presumible) | Hugging Face (Hooshaai) |

## Limitaciones y advertencias

- Degradación de precisión notable: 31,25% frente al 63,75% del profesor, una caída de 32,5 puntos porcentuales.
- El modelo solo está entrenado y evaluado en inglés.
- Dominio muy restringido: ScienceQA con imagen; no hay evidencia de generalización a otras tareas visuales.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- Riesgo elevado de alucinación en preguntas fuera del dominio de entrenamiento.
- No se han publicado análisis de sesgos; al derivar de Qwen2 y SigLIP, hereda los sesgos de sus datos originales.
- El artefacto contiene solo deltas de atención (attention_only_fp16); requiere el modelo base y la librería neuralops para funcionar, no es un checkpoint autónomo.
- Métricas no verificadas (verified: false) y con solo 36 descargas; no hay validación independiente.
- Uso comercial permitido por licencia MIT, pero el rendimiento hace desaconsejable su uso en producción real.
- No se especifican la longitud de contexto ni los tipos de cuantización soportados.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-performer-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación Performer Attention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/performer_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
