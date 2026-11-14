# Hooshaai/llava-qwen-0.5b-projection-factorized-attn-scienceqa

## Resumen

llava-qwen-0.5b-projection-factorized-attn-scienceqa es un checkpoint experimental publicado por Hooshaai dentro del ecosistema NeuralOps, un marco de "cirugía de atención" que sustituye módulos de atención estándar por operadores factorizados. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM compacto que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64.

La modificación consiste en reemplazar la atención cuadrática de 18 de las 24 capas del decodificador por el operador ProjectionFactorizedAttention, basado en una factorización SVD de las proyecciones lineales de atención. Las 6 capas restantes (índices 3, 7, 11, 15, 19 y 23) se mantienen como anclas cuadráticas, dando lugar a un patrón híbrido 3:1. El modelo se afina mediante destilación de conocimiento sobre ScienceQA (subconjunto STEM con imágenes, split de validación) para recuperar parte de la capacidad perdida por la compresión.

Es relevante como artefacto de investigación: demuestra que es posible reducir el peso del checkpoint de atención a 80,71 MB (frente a 1,66 GB del base en FP16, un 95,3 % menos) y recuperar precisión mediante KD, aunque con una brecha considerable respecto al profesor (52,5 % frente a 63,75 %). No es un modelo para producción generalista, sino una pieza de un zoo de operadores de atención para estudiar compromisos entre compresión y rendimiento multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decodificador Qwen2) con atención factorizada por SVD en 18/24 capas |
| Parametros totales | no disponible (el checkpoint guarda solo pesos de atención modificados: 426 tensores, 80,71 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos serializados en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, attention_only_fp16) |

## Arquitectura y entrenamiento

El modelo base es llava-interleave-qwen-0.5b-hf: una torre visual SigLIP de 27 capas congelada, un proyector MLP de dos capas que alinea embeddings visuales con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64). La intervención NeuralOps sustituye la self-attention de 18 capas por ProjectionFactorizedAttention, un operador de la familia SVD que factoriza las proyecciones Q/K/V/O mediante descomposición en valores singulares, reduciendo el número de parámetros efectivos. Se preservan 6 capas cuadráticas como anclas (3, 7, 11, 15, 19, 23) para mantener capacidad de modelado global. La torre visual, el proyector, los MLP y los embeddings permanecen congelados y excluidos del artefacto serializado.

El ajuste se realiza mediante destilación de conocimiento en dos etapas (132 + 161 pasos, 293 en total) sobre ScienceQA, usando la arquitectura de caché offline de representaciones de NeuralOps, que permite entrenar sin mantener el profesor en VRAM. El entrenamiento completo se ejecutó en una RTX 3090 (24 GB) en 120,5 segundos, con un pico de 16.226 MB de VRAM. El resultado es un delta de pesos de atención que debe combinarse con el modelo base para su uso.

## Capacidades

- Generación de texto e imagen-a-texto (pipeline image-text-to-text) sobre preguntas de ciencia con soporte visual.
- Razonamiento visual de nivel básico en dominios STEM: el ajuste se centra en ScienceQA, con preguntas de física, química, biología y ciencias naturales.
- Respuesta a preguntas de opción múltiple con contexto de imagen.
- Conversación multi-turno heredada del formato LLaVA-Interleave del modelo base.
- Soporte de plantilla de chat (chat_template.json incluido).
- Capacidades multilingües: solo inglés declarado.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking).
- No se documenta soporte de audio ni vídeo.

## Casos de uso

- Investigación sobre compresión de atención: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por operadores SVD y medir la pérdida de precisión en tareas multimodales, con métricas de referencia publicadas (52,5 % de accuracy, PPL 2,64).
- Estudio de destilación de conocimiento con profesor offline: sirve como caso práctico de la arquitectura de caché de representaciones de NeuralOps, útil para quienes quieran replicar el flujo en una GPU de consumo.
- Benchmark de operadores de atención: al formar parte de un "attention zoo", facilita comparaciones controladas entre variantes (atención cuadrática, factorizada, lineal) sobre el mismo modelo base y dataset.
- Prototipado de asistentes educativos STEM en inglés: para preguntas de ciencia con imagen en entornos de baja latencia y recursos limitados, aceptando la precisión moderada del modelo.
- Docencia y divulgación: ejemplo didáctico de cirugía de modelos (weight surgery), factorización SVD y evaluación con model-index en Hugging Face.
- Evaluación de pipelines de despliegue ligero: con 80,71 MB de delta de pesos, es útil para probar flujos de carga modular (base + delta) en entornos con restricciones de almacenamiento.
- No recomendado para producción generalista: la brecha de 11,25 puntos frente al profesor en ScienceQA limita su uso fuera de investigación.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA (subconjunto STEM con imágenes, split de validación):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 52,50 | +20,63 |
| Perplexity | 2,45 | 583,14 | 2,64 | -580,50 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El artefacto serializado ocupa 80,71 MB (delta de atención en FP16); el paquete completo son 95,91 MB. Requiere cargar además el modelo base llava-hf/llava-interleave-qwen-0.5b-hf (1,66 GB en FP16) para funcionar.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (0,5B parámetros) se sitúa en el rango de pocos GB, pero el autor no publica cifras de inferencia.
- Entrenamiento validado en una NVIDIA GeForce RTX 3090 (24 GB), con pico de 16.226 MB de VRAM.
- Cabe en GPU de consumo: el entrenamiento se realizó en una RTX 3090; por el tamaño del base, es plausible en GPUs consumer con suficiente VRAM, aunque no se documentan requisitos mínimos.
- Despliegue: la librería es neuralops (API load_surgeried_model); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, STEM con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/llava-qwen-0.5b-projection-factorized-attn-scienceqa | 0,5B (base) con 18/24 capas factorizadas | no disponible | 52,50 % accuracy, PPL 2,64 | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % accuracy, PPL 2,45 | no disponible en esta ficha | Hugging Face |
| Otras variantes del NeuralOps Attention Zoo | 0,5B (base) | no disponible | no disponible | MIT (según repo NeuralOps) | Hugging Face |

La comparativa con modelos externos de la misma categoría (por ejemplo, otros VLM de 0,5B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Brecha de rendimiento frente al profesor: 52,50 % frente a 63,75 % de accuracy en ScienceQA, una diferencia de 11,25 puntos que refleja la pérdida por compresión.
- El checkpoint contiene solo los pesos de atención modificados; no es un modelo autónomo y requiere el base llava-hf/llava-interleave-qwen-0.5b-hf para funcionar.
- Especialización estrecha: ajustado únicamente sobre ScienceQA en inglés; el rendimiento fuera de ese dominio no está evaluado.
- Idiomas: solo inglés declarado; no se documenta soporte multilingüe.
- Riesgo de alucinación: no evaluado por el autor; la perplexity de 2,64 en el dominio de ajuste no garantiza fiabilidad fuera de él.
- Sesgos: no documentados en la información disponible.
- Licencia MIT, que permite uso comercial, pero el modelo base puede tener condiciones propias no detalladas aquí.
- Métricas no verificadas (verified: false en el model-index); deben tomarse como declaraciones del autor.
- Sin soporte documentado de tool calling, agentes ni modos de razonamiento extendido.
- Fecha de creación declarada en 2026-11-11, posterior a la fecha actual de referencia; conviene verificar la vigencia del artefacto.
- Uso recomendado: investigación y experimentación, no producción generalista.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-projection-factorized-attn-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/projection_factorized_attn.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
