# Hooshaai/llava-qwen-0.5b-split-head-hybrid-scienceqa

## Resumen

`llava-qwen-0.5b-split-head-hybrid-scienceqa` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps, un marco de "cirugía de atención" que sustituye capas de atención estándar por operadores alternativos en modelos ya entrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, un VLM de LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, 16 cabezas, head_dim=64), y aplica el operador `SplitHeadHybridAttention` en 18 de las 24 capas del decodificador.

El objetivo no es producir un modelo de propósito general, sino evaluar empíricamente el impacto de sustituir la atención cuadrática por un esquema híbrido (denominado AEGIS-Attention V5) y recuperar calidad mediante destilación de conocimiento desde el modelo profesor original. La evaluación se realiza sobre el subconjunto con imagen de ScienceQA (split de validación), un benchmark de razonamiento visual STEM.

El resultado es un artefacto muy pequeño: solo se serializan los pesos de atención modificados y las layer norms entrenadas (91,93 MB en FP16, frente a 1,66 GB del base completo). Alcanza un 43,75 % de accuracy y una perplejidad de 3,23 tras la destilación, frente al 63,75 % del profesor. Es relevante como referencia metodológica para investigar atención eficiente y compresión quirúrgica, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP congelado + proyector MLP 2 capas + decodificador Qwen2 de 24 capas) con atencion `SplitHeadHybridAttention` en 18/24 capas |
| Parametros totales | ~0,5B en el modelo base; el artefacto publicado contiene solo los pesos quirurgicos (96.399.016 bytes en FP16) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`) |
| Libreria | neuralops |
| Tamano del repo | 0,1 GB (~107,13 MB de paquete total) |
| Capas modificadas | 18/24 (`hybrid_3_1`); anclas cuadraticas en capas [3, 7, 11, 15, 19, 23] |
| Componentes congelados | Torre SigLIP (27 capas), proyector multimodal, MLPs y embeddings del decodificador |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura LLaVA-Interleave con Qwen2 de 0,5B como decodificador de lenguaje y SigLIP como codificador visual congelado. La intervención quirúrgica sustituye la self-attention de 18 de las 24 capas del decodificador por `SplitHeadHybridAttention`, un operador híbrido de la familia AEGIS-Attention V5 que combina atención global y local dispersa. Se mantienen seis capas ancla con atención cuadrática completa (índices 3, 7, 11, 15, 19 y 23) para preservar capacidad expresiva. El resto de componentes (torre visual, proyector, MLPs, embeddings) permanece congelado.

El entrenamiento consistió en dos etapas de destilación de conocimiento desde el modelo profesor original, con 94 pasos totales (31 en la etapa 1, 63 en la etapa 2) ejecutados en una única RTX 3090 de 24 GB, con un pico de VRAM de 13.504 MB y una duración de 121,3 segundos. Solo se entrenaron las atenciones modificadas y las layer norms del decodificador. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA, ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales sobre contenidos STEM (ciencias, tecnología, ingeniería y matemáticas) con selección de opción múltiple.
- Razonamiento multimodal básico sobre figuras y diagramas de ScienceQA.
- Soporte de plantilla de chat (`chat_template.json` incluido) para conversaciones de un turno o multi-turno.
- Capacidad de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Modo thinking, audio o vídeo: no disponibles.

## Casos de uso

- Investigación en atención eficiente: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por `SplitHeadHybridAttention` y medir la degradación y recuperación vía destilación en un VLM pequeño.
- Evaluación comparativa de operadores de atención: sirve como punto de referencia dentro de un "attention zoo" para contrastar variantes (split-head, híbridas, dispersas) sobre el mismo benchmark ScienceQA.
- Prototipado de VLM de bajo coste: con un artefacto de ~92 MB de pesos quirúrgicos y un base de 1,66 GB, es viable experimentar en una única GPU consumer de 24 GB.
- Docencia y divulgación: útil para explicar visualmente cómo una cirugía de atención afecta a la perplejidad (de 111,11 a 3,23 tras destilación) y a la accuracy en tareas multimodales.
- Validación de pipelines de destilación: el par profesor/alumno con métricas registradas en `training_metrics.json` permite probar recetas de KD y comparar deltas de accuracy y PPL.
- Benchmarking de compresión quirúrgica: cuantifica el ahorro de artefacto (1,57 GB, -94,6 %) y su coste en calidad, útil para decidir si merece la pena en despliegues con restricciones de almacenamiento.
- Base para fine-tuning específico de dominio STEM: al conservar la torre visual y el proyector, puede adaptarse a subconjuntos científicos concretos con un coste de entrenamiento bajo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA (Image-Bearing STEM Subset, validation):

| Metrica | Profesor (base) | Pre-KD (zero-shot) | Post-KD (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 41,25 | 43,75 | +2,50 |
| Perplejidad | 2,45 | 111,11 | 3,23 | -107,88 |

Telemetría de entrenamiento declarada:

| Parametro | Valor |
|---|---|
| Hardware | NVIDIA GeForce RTX 3090 (24 GB) |
| Pasos de optimizacion | 94 (etapa 1: 31; etapa 2: 63) |
| Duracion | 121,3 s |
| Pico de VRAM | 13.504 MB |
| Timestamp UTC | 2026-11-11T10:22:13Z |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base completo en FP16 ocupa ~1,66 GB de pesos, por lo que la inferencia requiere en la práctica varios GB contando activaciones y caché KV; no se especifica un mínimo en la información disponible.
- GPU recomendadas: cualquier GPU con al menos ~8 GB de VRAM debería acomodar el modelo base en FP16; el autor entrenó en una RTX 3090 (24 GB) con un pico de 13,5 GB.
- Cabe en GPU consumer: sí, en RTX 3090, RTX 4090, RTX 4080 y previsiblemente en GPUs de 8-12 GB con cuantización, aunque no se documentan recetas de cuantización.
- Opciones de despliegue: la carga se realiza vía `neuralops.hub.load_surgeried_model` (API propia del proyecto NeuralOps). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-split-head-hybrid-scienceqa` | ~0,5B (18/24 capas con atencion hibrida) | no disponible | 43,75 % acc / 3,23 PPL (declarado, no verificado) | MIT | Hugging Face (25 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL (referencia del autor) | no disponible | Hugging Face |
| Otros checkpoints del "attention zoo" NeuralOps | ~0,5B | no disponible | no disponible | MIT (presumible) | Hugging Face (repositorio del autor) |

No se dispone de datos comparativos con alternativas de otros autores (por ejemplo, otros VLM de ~0,5B) en la información proporcionada.

## Limitaciones y advertencias

- Degradación de calidad respecto al profesor: 20 puntos porcentuales menos de accuracy en ScienceQA (43,75 % frente a 63,75 %), por lo que no es un sustituto directo del base.
- Ámbito de evaluación muy estrecho: solo se ha medido en el subconjunto con imagen de ScienceQA; no hay evidencia de comportamiento en otras tareas multimodales.
- Métricas no verificadas: los resultados están marcados como `verified: false` en el model-index y proceden del propio autor.
- Artefacto parcial: el repositorio contiene únicamente los pesos de atención modificados y las layer norms; requiere cargar el modelo base para funcionar.
- Dependencia de la librería `neuralops`, no estándar en el ecosistema, lo que limita la portabilidad a vLLM, TGI, llama.cpp u Ollama.
- Idioma: solo inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: no cuantificado en la información disponible; cabe esperar un comportamiento similar o peor que el del modelo base de 0,5B.
- Sesgos: no documentados; hereda los del dataset ScienceQA y del corpus de preentrenamiento de Qwen2 y SigLIP.
- Licencia MIT declarada, lo que permite uso comercial, aunque el enlace de licencia apunta al repositorio GitHub del proyecto NeuralOps y conviene verificar la compatibilidad con las licencias del modelo base y del dataset.
- Madurez: creado y actualizado el mismo día (2026-11-11), con 25 descargas y 0 likes; no hay señales de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-split-head-hybrid-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/split_head_hybrid_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
