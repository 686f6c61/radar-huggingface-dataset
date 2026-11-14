# Hooshaai/llava-qwen-0.5b-compressed-mha-attention-scienceqa

## Resumen
llava-qwen-0.5b-compressed-mha-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el autor Hooshaai dentro del ecosistema NeuralOps. No se trata de un modelo entrenado desde cero, sino de un experimento de "cirugía de atención" (attention surgery) en el que se sustituye la atención multi-cabeza estándar de 18 de las 24 capas del decodificador Qwen2 por un operador comprimido basado en SVD truncado conjunto (CompressedDistilBertAttention), manteniendo congelados el torreón visual SigLIP, el proyector multimodal y seis capas de atención cuadrática que actúan como anclas.

El objetivo declarado es reducir drásticamente el peso en disco del artefacto de pesos (de 1,66 GB del modelo base a 93,66 MB, un 94,5 % menos) mediante destilación de conocimiento offline, preservando al máximo la capacidad de razonamiento visual sobre ScienceQA. El modelo resultante se evalúa en el subconjunto STEM con imágenes de ScienceQA (split de validación), donde alcanza un 31,87 % de accuracy y una perplejidad de 3,10, frente al 63,75 % y 2,45 del profesor original.

Es relevante ahora porque ejemplifica una línea de trabajo emergente: la compresión post-hoc de modelos multimodales mediante cirugía arquitectónica selectiva y destilación, empaquetada como delta de pesos modular. Su tamaño (0,5 B de parámetros, contexto heredado de Qwen2) y su licencia MIT lo hacen interesante para experimentación en entornos con recursos limitados, aunque su rendimiento dista mucho del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal: torreón visual SigLIP congelado (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas con atención comprimida por SVD truncado conjunto |
| Parametros totales | 0,5 B (heredados del modelo base llava-interleave-qwen-0.5b-hf) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2) |
| Tipos de cuantizacion | no disponible; pesos serializados en FP16 safetensors |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, delta de pesos quirúrgicos en FP16); requiere la librería neuralops para carga |

## Arquitectura y entrenamiento
La arquitectura parte de LLaVA-Interleave con Qwen2-0.5B como decodificador de lenguaje. El torreón visual SigLIP (27 capas), el proyector multimodal MLP de dos capas, los embeddings y las MLP del decodificador permanecen congelados. La intervención afecta a 18 de las 24 capas del decodificador: sus módulos self_attn se reemplazan por el operador CompressedDistilBertAttention, que aplica una descomposición SVD truncada conjunta para comprimir las matrices de proyección de atención. Se preservan seis capas de atención cuadrática completa como anclas en las posiciones [3, 7, 11, 15, 19, 23], siguiendo un esquema híbrido 3:1. También se entrenan las layernorm del decodificador.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché de representaciones offline de NeuralOps (§21.1), sobre una NVIDIA GeForce RTX 3090 de 24 GB, con 0 MB de VRAM de profesor en GPU. Se ejecutaron 168 pasos de optimización en dos etapas (58 en la etapa 1 y 110 en la etapa 2), con una duración total de 120,5 s y un pico de VRAM de 17.038 MB. El conjunto de evaluación y entrenamiento es ScienceQA (subconjunto STEM con imágenes, validación). El artefacto de pesos resultante ocupa 93,66 MB (98.214.336 bytes) frente a los 1,66 GB del modelo base, lo que supone un ahorro del 94,5 % (artefacto 18,16 veces menor).

## Capacidades
- Generación de texto e imagen-texto a texto en formato conversacional (pipeline image-text-to-text).
- Respuesta a preguntas visuales sobre contenido STEM (ciencia, tecnología, ingeniería y matemáticas) con imágenes.
- Razonamiento multimodal básico sobre diagramas y figuras científicas, limitado al subconjunto evaluado.
- Soporte de chat multi-turno mediante plantilla de chat incluida (chat_template.json).
- Capacidades multilingües: únicamente inglés declarado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, visión adicional, audio: no disponible (solo visión estándar del torreón SigLIP).

## Casos de uso
- Investigación en compresión de modelos: sirve como referencia reproducible para estudiar el impacto de sustituir atención completa por SVD truncado en un VLM pequeño, comparando el delta de accuracy (63,75 % → 31,87 %) y de perplejidad (2,45 → 3,10) frente al profesor.
- Prototipado de asistentes educativos STEM en inglés: puede responder preguntas sobre imágenes de ScienceQA en entornos de bajo recursos, aunque con precisión limitada (31,87 %), por lo que se recomienda solo para demos o pruebas de concepto.
- Despliegue en hardware muy restringido: el artefacto de 93,66 MB permite cargar el modelo en GPUs de gama baja o incluso CPU para experimentos de latencia, algo inviable con el modelo base de 1,66 GB.
- Evaluación de pipelines de destilación offline: el checkpoint documenta telemetría completa (pasos, VRAM, duración) y resulta útil para validar la arquitectura de caché de representaciones de NeuralOps en tareas multimodales.
- Benchmarking de operadores de atención: al conservar seis capas cuadráticas como anclas, permite aislar el efecto de la compresión por capas en tareas de razonamiento visual.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención y cuantificación del compromiso entre tamaño y rendimiento en modelos multimodales.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre ScienceQA, subconjunto STEM con imágenes, split de validación:

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 31,87 | -0,63 |
| Perplejidad (PPL) | 2,45 | 3,90 | 3,10 | -0,80 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; el entrenamiento consumió un pico de 17.038 MB en una RTX 3090, pero la inferencia con el delta de 93,66 MB más el modelo base congelado requiere cargar también el torreón SigLIP y el decodificador completo.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) fue la hardware usada en el entrenamiento; para inferencia se puede intentar en GPUs consumer con al menos 8-12 GB, aunque no hay cifras oficiales.
- Cabe en GPU consumer: probablemente sí en RTX 3060/4060 y superiores, dado el tamaño del modelo base (0,5 B) y el delta comprimido, pero no hay confirmación oficial.
- Opciones de despliegue: la model card solo documenta la carga mediante `neuralops.hub.load_surgeried_model`; no se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA (val, STEM con imágenes) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-compressed-mha-attention-scienceqa | 0,5 B | no disponible | 31,87 % accuracy; PPL 3,10 | MIT | Hugging Face (neuralops) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75 % accuracy; PPL 2,45 | no disponible en la informacion proporcionada | Hugging Face |
| Otros VLM pequeños (p. ej. SmolVLM, Qwen2-VL-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de otros modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Caída significativa de rendimiento: la accuracy cae del 63,75 % del profesor al 31,87 %, una pérdida de más de 31 puntos porcentuales; no es apto para producción en tareas de razonamiento visual exigentes.
- Idiomas: solo inglés declarado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2 y ScienceQA, puede heredar sesgos de esos datos.
- Riesgo de alucinación: elevado en un modelo pequeño y comprimido, especialmente fuera del dominio STEM con imágenes.
- Licencia MIT: permite uso comercial, pero el modelo base llava-interleave-qwen-0.5b-hf puede tener condiciones adicionales que deben verificarse antes de explotarlo comercialmente.
- Dependencia de la librería neuralops: los pesos son un delta quirúrgico que requiere dicha librería y el modelo base para cargarse; no es un checkpoint autónomo estándar de transformers.
- Resultados no verificados: las métricas del model-index tienen `verified: false` y provienen únicamente del autor.
- Contexto: la longitud de contexto no se especifica en la información disponible; se hereda del modelo base, pero sin confirmación.

## Enlaces
- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-compressed-mha-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/compressed_mha_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
