# Hooshaai/llava-qwen-0.5b-fusion-attn-scienceqa

## Resumen

`llava-qwen-0.5b-fusion-attn-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. No se trata de un modelo entrenado desde cero, sino de un ejercicio de "cirugía de atención": se sustituye el mecanismo de self-attention cuadrático del decodificador Qwen2 por un operador híbrido denominado `fusion_attn` (FUSIONATTN) en 18 de las 24 capas del decodificador, manteniendo seis capas ancla con atención densa. El resultado se evalúa sobre el subconjunto con imagen del dataset ScienceQA.

El modelo resuelve un problema de eficiencia e investigación: explorar si un esquema de atención híbrida con bloqueo disperso (block-gated sparse attention) puede aproximarse al comportamiento de un transformer denso mediante destilación de conocimiento, reduciendo el tamaño del artefacto en un 91,3 % respecto al base en FP16 (148,77 MB frente a 1,66 GB). La arquitectura subyacente combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024 y 16 cabezas.

Es relevante ahora por su carácter experimental y reproducible: documenta con detalle el proceso de destilación offline, la telemetría de entrenamiento y el manifiesto de componentes modificados. No obstante, sus cifras de rendimiento quedan lejos del modelo profesor (43,75 % frente a 63,75 % de accuracy en ScienceQA), por lo que debe contemplarse como material de investigación, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + proyector MLP 2 capas + decodificador Qwen2) con atención híbrida `fusion_attn` en 18/24 capas |
| Parametros totales | no disponible (el artefacto serializado pesa 148,77 MB en FP16, correspondiente solo a los pesos quirúrgicos modificados) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más manifiesto JSON y ficheros de tokenizer |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, que combina una torre visual SigLIP congelada de 27 capas, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión 1024, 16 cabezas de atención y dimensión de cabeza 64. La intervención sustituye la self-attention en 18 de esas 24 capas por el operador `fusion_attn`, que implementa una atención híbrida con dos rutas de ejecución: atención densa para secuencias cortas (N ≤ 128) o para cross-attention, y atención dispersa con bloqueo (block-gated sparse) para secuencias largas. Las seis capas restantes, en los índices [3, 7, 11, 15, 19, 23], se conservan como anclas cuadráticas. Los MLP del decodificador, los embeddings, el proyector y la torre visual permanecen congelados y no se incluyen en el artefacto publicado.

El entrenamiento se realizó mediante destilación de conocimiento offline con la arquitectura de caché de representaciones de NeuralOps (§21.1), sobre una única NVIDIA GeForce RTX 3090 de 24 GB y sin VRAM de profesor en GPU (0 MB). Se ejecutaron 233 pasos de optimización en dos etapas (77 + 156) durante 120,4 segundos, con un pico de VRAM de 14.613 MB. El dataset de evaluación y ajuste es `derek-thomas/ScienceQA`, restringido al subconjunto con imagen de validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen en formato conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales de tipo STEM, con selección de opción entre alternativas (formato ScienceQA).
- Razonamiento visual básico sobre figuras y diagramas científicos.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni vídeo en la información disponible.

## Casos de uso

- Investigación en eficiencia de atención: permite comparar el comportamiento de `fusion_attn` frente a atención densa en un VLM pequeño, sirviendo como banco de pruebas reproducible para estudiar el compromiso entre precisión y tamaño del artefacto.
- Docencia y experimentación con destilación: el paquete incluye manifiesto quirúrgico, métricas de entrenamiento y telemetría, lo que facilita reproducir el pipeline de destilación offline en una sola GPU de consumo.
- Prototipado de asistentes educativos STEM: con 43,75 % de accuracy en ScienceQA puede usarse como base para evaluar interfaces de preguntas visuales con opción múltiple antes de escalar a un modelo mayor.
- Validación de pipelines de carga de modelos quirúrgicos: útil para probar la API `load_surgeried_model` de NeuralOps y verificar la integración de pesos delta con el modelo base.
- Benchmarking de compresión: sirve como referencia de hasta dónde se puede reducir un VLM (11,44× más pequeño) manteniendo una fracción del rendimiento del profesor.
- Análisis de degradación por capas: al conservar seis capas densas como anclas, permite estudiar qué capas son más sensibles a la sustitución por atención dispersa.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 43,75 | +11,88 |
| Perplexity | 2,45 | 20,78 | 6,12 | -14,66 |

Telemetría de entrenamiento: 233 pasos, 120,4 s, pico de 14.613 MB de VRAM en una RTX 3090. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto de pesos quirúrgicos ocupa 148,77 MB en FP16, pero la inferencia requiere cargar además la torre visual SigLIP, el proyector y las capas congeladas del modelo base, por lo que el consumo real es superior; no se especifica una cifra exacta en la información disponible.
- GPU recomendadas: el autor valida el entrenamiento en una NVIDIA GeForce RTX 3090 (24 GB); para inferencia debería bastar con GPUs de consumo con al menos 8-12 GB, aunque no se documenta oficialmente.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 en adelante, dado el tamaño del modelo base (0,5B) y del artefacto.
- Opciones de despliegue: la librería oficial es `neuralops` (`load_surgeried_model`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-fusion-attn-scienceqa | ~0,5B (delta 148,77 MB) | no disponible | 43,75 % acc / 6,12 PPL | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la informacion | Hugging Face |
| Otros VLM de ~0,5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la más informativa: la cirugía de atención y la destilación recuperan 11,88 puntos de accuracy respecto al estado zero-shot, pero dejan una brecha de 20 puntos frente al profesor original.

## Limitaciones y advertencias

- Brecha de rendimiento significativa frente al modelo profesor: 43,75 % frente a 63,75 % de accuracy en ScienceQA.
- El artefacto publicado contiene únicamente los pesos modificados (18/24 capas de atención más layer norms entrenados); requiere el modelo base para inferencia completa.
- Idiomas: solo inglés; no se garantiza comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: elevado en un modelo de 0,5B con perplexity de 6,12, muy por encima del profesor (2,45).
- Sesgos: no documentados por el autor; al derivar de un VLM pequeño entrenado sobre ScienceQA, puede heredar sesgos del dataset y del modelo base.
- Licencia MIT, que permite uso comercial, pero el modelo base puede tener condiciones adicionales no especificadas en la información disponible.
- Resultados de benchmarks no verificados (`verified: false` en el model-index).
- Naturaleza experimental: no hay evidencia de robustez en producción, ni datos de latencia, throughput o estabilidad en despliegues reales.
- La fecha de creación del repositorio (2026-11-11) es posterior a la fecha actual de referencia habitual; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-fusion-attn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `fusion_attn`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/fusion_attn.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
