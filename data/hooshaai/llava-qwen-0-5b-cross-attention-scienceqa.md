# Hooshaai/llava-qwen-0.5b-cross-attention-scienceqa

## Resumen

llava-qwen-0.5b-cross-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. El modelo aplica una "cirugía de atención" sobre 18 de las 24 capas del decodificador Qwen2, sustituyendo la atención estándar por un operador de atención cruzada multi-cabeza con LoRA, y posteriormente se destila sobre el subconjunto con imágenes de ScienceQA. El objetivo es explorar variantes arquitectónicas de atención manteniendo un coste de cómputo y almacenamiento reducido.

El modelo conserva la torre de visión SigLIP congelada, el proyector MLP de dos capas y el decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. El artefacto serializado ocupa 407,79 MB en FP16, un 76 % menos que los 1,66 GB del modelo base completo, gracias a que solo se guardan los pesos modificados (atención quirúrgica y layernorms entrenados). Está pensado para investigación sobre arquitecturas de atención y destilación, no como modelo de producción generalista.

Su relevancia actual es acotada: se trata de un experimento de "attention surgery" con licencia MIT, entrenado en una única RTX 3090 en 120,5 segundos y evaluado en un subconjunto de validación de ScienceQA. No obstante, ilustra una técnica reproducible de compresión y adaptación de VLMs pequeños con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decodificador Qwen2) con atención cruzada multi-cabeza + LoRA en 18/24 capas |
| Parametros totales | no disponible (heredados del base llava-interleave-qwen-0.5b-hf; artefacto serializado de 407,79 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16) |

## Arquitectura y entrenamiento

La arquitectura parte del VLM LLaVA-Interleave con Qwen2-0.5B: torre de visión SigLIP congelada de 27 capas, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64). La intervención quirúrgica reemplaza la self-attention en 18 de las 24 capas por un operador CrossAttention (familia "modern") que, cuando recibe un contexto, calcula query desde hidden_states y K/V desde el contexto; sin contexto degenera en self-attention causal. Se mantienen seis capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23] sin modificar, junto con los MLPs, embeddings y el proyector.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps, sobre el dataset derek-thomas/ScienceQA. Se ejecutaron 244 pasos de optimización (95 en etapa 1, 149 en etapa 2) en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 17.315 MB y una duración total de 120,5 segundos. Los pesos modificados y los layernorms del decodificador se entrenaron; el resto permaneció congelado. No se documentan detalles sobre volumen de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales sobre contenido STEM (ciencias, matemáticas) del dominio ScienceQA.
- Razonamiento multimodal básico sobre imágenes con preguntas de opción múltiple.
- Conversación multi-turno mediante plantilla de chat incluida (chat_template.json).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés.
- No se documenta modo thinking, audio ni otras modalidades.

## Casos de uso

- Investigación en arquitecturas de atención: sirve como referencia reproducible para estudiar el efecto de sustituir self-attention por cross-attention con LoRA en un VLM pequeño, comparando métricas antes y después de la cirugía.
- Destilación de conocimiento con recursos limitados: el flujo completo (244 pasos, 120,5 s, una RTX 3090) es un ejemplo práctico de adaptación de un VLM de 0,5B con presupuesto de hardware de consumo.
- Evaluación académica en ScienceQA: útil para reproducir y contrastar resultados en el subconjunto con imágenes del benchmark, con una accuracy reportada del 38,75 %.
- Prototipado de asistentes educativos STEM: permite montar demos de preguntas y respuestas sobre diagramas científicos con un artefacto de menos de 0,5 GB.
- Estudio de compresión de artefactos: el empaquetado delta de 407,79 MB frente a 1,66 GB del base es un caso de estudio sobre serialización selectiva de pesos.
- Docencia y formación: ejemplo didáctico de "attention surgery" y de pipelines de NeuralOps para quienes aprenden modificación de arquitecturas transformer.
- Pruebas de integración en pipelines de investigación: con la API neuralops.hub.load_surgeried_model se puede cargar el modelo y ejecutar inferencia multimodal en entornos de experimentación.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) ScienceQA (image-bearing STEM, validation) | 63,75 | 32,50 | 38,75 | +6,25 |
| Perplexity ScienceQA (image-bearing STEM, validation) | 2,45 | 4,26 | 1,00 | -3,26 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- Entrenamiento documentado: NVIDIA GeForce RTX 3090 (24 GB), con pico de 17.315 MB de VRAM.
- Inferencia: el artefacto serializado pesa 407,79 MB en FP16; se requiere además cargar la base llava-interleave-qwen-0.5b-hf (1,66 GB) para reconstruir el modelo completo. VRAM estimada de inferencia: no disponible de forma explícita, pero un VLM de 0,5B en FP16 debería caber holgadamente en GPUs de consumo con 8 GB o más.
- GPUs recomendadas: no disponible; por tamaño, cualquier GPU consumer moderna (RTX 3060 en adelante) es suficiente en teoría.
- Despliegue: la carga se realiza con la librería neuralops (load_surgeried_model). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (image-bearing, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-cross-attention-scienceqa | ~0,5B (base) | no disponible | 38,75 % accuracy | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | ~0,5B | no disponible | 63,75 % accuracy (teacher baseline reportado) | no disponible en la información | Hugging Face |
| Otras variantes del Attention Surgery Zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (según repo) | Hugging Face |

No se dispone de datos suficientes para comparar con alternativas externas de la misma categoría (por ejemplo, otros VLMs de 0,5B); se indica "no disponible".

## Limitaciones y advertencias

- El rendimiento es claramente inferior al del modelo base: 38,75 % frente a 63,75 % de accuracy en ScienceQA, una caída de 25 puntos porcentuales.
- El modelo está especializado en ScienceQA; su generalización a otros dominios visuales no está documentada y probablemente sea limitada.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a VLMs pequeños y a un entrenamiento de destilación corto (244 pasos).
- Sesgos: no documentados por el autor; al entrenarse sobre ScienceQA, puede heredar sesgos del dataset.
- La licencia MIT permite uso comercial, pero el artefacto es un delta que requiere cargar el modelo base, cuya licencia debe verificarse por separado.
- La carga depende de la librería neuralops, lo que limita la portabilidad frente a ecosistemas estándar (transformers, vLLM).
- Los resultados de benchmarks están declarados como no verificados (verified: false) por el autor.
- El valor de perplexity de 1,00 resulta atípicamente bajo y conviene tratarlo con cautela hasta su verificación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-cross-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación CrossAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/cross_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
