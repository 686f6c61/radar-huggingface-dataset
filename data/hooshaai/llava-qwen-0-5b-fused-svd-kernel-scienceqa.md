# Hooshaai/llava-qwen-0.5b-fused-svd-kernel-scienceqa

## Resumen
llava-qwen-0.5b-fused-svd-kernel-scienceqa es un checkpoint derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por Hooshaai dentro del ecosistema NeuralOps. No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre las capas de atención de un VLM LLaVA-Qwen de 0,5B parámetros, sustituyendo parte de la atención cuadrática por el módulo FusedSVDKernelAttention (familia SVD) en 18 de las 24 capas del decodificador. El objetivo es reducir el peso del artefacto y explorar alternativas de atención lineal manteniendo un comportamiento razonable en razonamiento visual STEM.

El modelo conserva la torre de visión SigLIP congelada, el proyector MLP de dos capas y seis capas de atención cuadrática como anclas. Solo se serializan los pesos modificados (atención y layernorms entrenados), lo que da un artefacto de 144,23 MB frente a los 1,66 GB del base, una reducción del 91,5 %. La evaluación se realiza sobre el subconjunto con imagen de ScienceQA en validación.

Es relevante ahora porque ejemplifica una línea de trabajo creciente: la compresión post-hoc de VLMs mediante cirugía de atención y destilación de representaciones, con telemetría reproducible y artefactos pequeños aptos para experimentación en GPU de consumo. No obstante, sus métricas son modestas y debe tratarse como un artefacto de investigación, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención sustituida por FusedSVDKernelAttention en 18/24 capas |
| Parametros totales | 0,5B (modelo base); el artefacto serializado contiene solo el delta quirúrgico (144,23 MB en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors), más config.json, surgical_manifest.json y tokenizer en formato HF |

## Arquitectura y entrenamiento
El modelo parte de llava-interleave-qwen-0.5b-hf, un VLM que combina un codificador visual SigLIP con un decodificador Qwen2 de 24 capas. La intervención NeuralOps sustituye la self-attention en 18 de las 24 capas (esquema híbrido 3:1) por FusedSVDKernelAttention, un módulo de atención lineal basado en descomposición SVD fusionada con kernel. Se mantienen como anclas cuadráticas las capas [3, 7, 11, 15, 19, 23]. Permanecen congelados la torre de visión, el proyector multimodal, los MLP del decodificador y los embeddings.

El entrenamiento se realizó mediante destilación de representaciones con la arquitectura de caché offline de NeuralOps (§21.1), en una única RTX 3090 de 24 GB y sin VRAM de profesor en GPU. Se ejecutaron 244 pasos (96 en etapa 1, 148 en etapa 2) en 120,3 segundos, con un pico de VRAM de 17.472 MB. Solo se entrenaron las atenciones modificadas y los layernorms del decodificador. No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni el uso de RLHF o DPO.

## Capacidades
- Generación de texto e imagen-a-texto en formato conversacional (pipeline image-text-to-text).
- Respuesta a preguntas visuales sobre imágenes, orientada a contenido STEM (ScienceQA).
- Razonamiento multimodal básico: interpretación de figuras y selección de respuesta entre opciones en preguntas de ciencia.
- Soporte de chat multi-turno mediante chat_template incluido en el repositorio.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo en la información disponible.

## Casos de uso
- Investigación en compresión de atención: sirve como referencia reproducible para comparar FusedSVDKernelAttention frente a atención cuadrática en un VLM pequeño, con manifiesto quirúrgico y métricas de entrenamiento incluidas.
- Experimentación académica con VLMs en GPU de consumo: el artefacto de 144 MB y el pico de 17 GB permiten reproducir el pipeline de destilación en una RTX 3090.
- Prototipado de asistentes educativos STEM: puede usarse para responder preguntas con imagen sobre ciencia a nivel de prueba de concepto, aceptando su precisión limitada (31,25 % en ScienceQA con imagen).
- Evaluación de pipelines de destilación offline: el repositorio documenta la caché de representaciones y la telemetría, útil para validar infraestructuras de entrenamiento sin profesor en GPU.
- Benchmarking de operadores de atención: el manifiesto y la configuración permiten integrar el checkpoint en suites de pruebas de capas lineales (attention-zoo).
- Docencia y demos de cirugía de modelos: material para ilustrar cómo se sustituyen capas de atención y se serializan únicamente los deltas.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 33,75 | 31,25 | -2,50 |
| Perplexity | 2,45 | 12.161,91 | 3,25 | -12.158,66 |

## Requisitos de hardware
- El artefacto serializado ocupa 144,23 MB en FP16; el paquete completo, 159,41 MB. Para inferencia hay que cargar además los componentes congelados del modelo base (torre SigLIP, proyector, MLP y embeddings), por lo que la VRAM real supera ampliamente la del delta.
- Entrenamiento documentado en una NVIDIA GeForce RTX 3090 (24 GB), con pico de 17.472 MB.
- Al ser un modelo de 0,5B, la inferencia completa cabe con holgura en GPU de consumo modernas (RTX 3060 12 GB en adelante, orientativo); no se publican cifras oficiales de VRAM de inferencia.
- Despliegue mediante la librería neuralops (load_surgeried_model); no se documenta soporte nativo en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-fused-svd-kernel-scienceqa | 0,5B (delta 144 MB) | no disponible | 31,25 % acc / 3,25 PPL | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | 0,5B | no disponible | 63,75 % acc (teacher baseline) | no disponible en esta ficha | Hugging Face |
| Otros VLMs de ~0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Pérdida de precisión frente al profesor: 31,25 % frente a 63,75 % en ScienceQA con imagen, una caída de 32,5 puntos absolutos.
- El pre-KD zero-shot mostraba 33,75 %, por lo que la destilación empeoró ligeramente la accuracy (-2,50 puntos), aunque redujo drásticamente la perplejidad.
- Métricas no verificadas (verified: false en el model-index); deben tomarse como declaraciones del autor.
- Solo inglés; sin soporte multilingüe documentado.
- Entrenado y evaluado únicamente en ScienceQA, lo que limita la generalización a otros dominios visuales.
- Riesgo de alucinación inherente a un VLM de 0,5B con atención parcialmente lineal; no apto para producción sin validación adicional.
- La licencia MIT del repositorio se enlaza al LICENSE de NeuralOps; conviene revisar las condiciones del modelo base antes de uso comercial.
- No se documentan sesgos específicos, pero hereda los del corpus de entrenamiento del modelo base.
- Requiere la librería neuralops para cargar el checkpoint quirúrgico; la compatibilidad con ecosistemas estándar (transformers, vLLM) no está garantizada.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-fused-svd-kernel-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación FusedSVDKernelAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/fused_svd_kernel.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
