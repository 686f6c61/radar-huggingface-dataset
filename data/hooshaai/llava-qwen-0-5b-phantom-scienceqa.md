# Hooshaai/llava-qwen-0.5b-phantom-scienceqa

## Resumen
llava-qwen-0.5b-phantom-scienceqa es un checkpoint multimodal derivado de llava-hf/llava-interleave-qwen-0.5b-hf mediante una técnica propietaria denominada "attention surgery" implementada en la librería NeuralOps. El autor, Hooshaai, sustituye parte de las capas de atención cuadrática del decoder Qwen2 por un operador denominado PHANTOMAttention (Parameter-Hashed AttentioN with Token-wise Orthogonal Mapping), de la familia de modelos de espacio de estados (SSM), en 18 de las 24 capas del decoder. El resultado es un artefacto de pesos de solo 49,88 MB frente a los 1,66 GB del modelo base, una reducción del 97,1 %.

El modelo está orientado a razonamiento visual sobre ScienceQA, un benchmark de preguntas de ciencia con imágenes. Se distribuye como un delta quirúrgico que requiere la librería neuralops y el modelo base para funcionar, no como un checkpoint autonómo. La relevancia radica en que explora la sustitución selectiva de atención por SSM en modelos vision-language pequeños, manteniendo seis capas de atención cuadrática como anclas.

Los resultados declarados por el autor muestran una accuracy del 38,75 % en el subconjunto con imágenes de ScienceQA (validation) y una perplexity de 3,07, frente a un baseline teacher del 63,75 % y 2,45 de PPL. El entrenamiento se realizó por destilación de conocimiento en una única RTX 3090 en 120 segundos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA: torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas (D=1024, H=16, head_dim=64); 18/24 capas con atención sustituida por PHANTOMAttention (familia SSM) |
| Parametros totales | no disponible (el artefacto guardado contiene 606 tensores y 49,88 MB; el modelo base completo ronda 0,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se serializan en FP16 (`attention_only_fp16`) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), delta quirúrgico modular; requiere `surgical_manifest.json` y librería neuralops |

## Arquitectura y entrenamiento
El modelo parte de la arquitectura LLaVA-Interleave-Qwen-0.5B: torre visual SigLIP de 27 capas congelada, proyector MLP de dos capas y decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y head_dim 64. La intervención quirúrgica afecta a 18 de las 24 capas del decoder (esquema `hybrid_3_1`), sustituyendo la self-attention por PHANTOMAttention, un operador SSM con hashing de parámetros y mapeo ortogonal token-wise. Se conservan seis capas de atención cuadrática como anclas en las posiciones [3, 7, 11, 15, 19, 23]. Permanecen congelados la torre visual, el proyector multimodal, los MLP del decoder y los embeddings; solo se entrenan las nuevas capas de atención y los layernorms del decoder.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura "Offline Representation Caching" de NeuralOps, que permite no mantener el teacher en VRAM durante el entrenamiento (0 MB de VRAM de teacher). Se ejecutaron 319 pasos (147 en etapa 1, 172 en etapa 2) en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de 14.401 MB de VRAM y una duración total de 120,1 segundos. El dataset de evaluación y entrenamiento declarado es derek-thomas/ScienceQA.

## Capacidades
- Generación de texto e image-text-to-text: responde a preguntas en formato conversacional multimodal (`<image>\nQuestion: ...`).
- Razonamiento visual sobre imágenes: preguntas de ciencia con soporte visual (ScienceQA).
- Razonamiento de tipo STEM limitado al subconjunto con imágenes de ScienceQA.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: solo inglés (`en`).
- Capacidades especiales: sustitución parcial de atención por SSM con anclas cuadráticas; no dispone de thinking mode, audio ni visión extendida más allá de la heredada del base.

## Casos de uso
- Investigación sobre atención híbrida SSM/Transformer: el checkpoint permite estudiar el efecto de sustituir 18 de 24 capas de atención por PHANTOMAttention en un VLM pequeño, comparando accuracy y perplexity con el teacher.
- Evaluación de destilación de conocimiento con bajo consumo de VRAM: sirve como referencia reproducible de entrenamiento por destilación en una única RTX 3090 (120 s, 14,4 GB de pico), útil para validar pipelines de NeuralOps.
- Benchmarking de compresión de artefactos: el delta de 49,88 MB frente a 1,66 GB del base permite experimentar con despliegues de pesos reducidos cuando el modelo base ya está disponible en el entorno.
- Prototipado de asistentes de preguntas STEM con imagen: puede emplearse en demos internas de question answering sobre figuras y diagramas de ciencia, aceptando la precisión limitada del 38,75 %.
- Estudio de robustez de VLMs con capas híbridas: permite analizar cómo afecta la sustitución de atención a la perplexity (de 24,53 pre-KD a 3,07 post-KD) en tareas de razonamiento visual.
- Reproducción de experimentos de "attention surgery": útil como caso base para comparar otros operadores del zoo de NeuralOps sobre la misma arquitectura LLaVA-Qwen-0.5B.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 33,75 | 38,75 | +5,00 |
| Perplexity (PPL) en ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 24,53 | 3,07 | -21,46 |

Telemetría de entrenamiento declarada: 319 pasos, 120,1 s, pico de 14.401 MB de VRAM en RTX 3090.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 14.401 MB de pico en una RTX 3090 con el teacher fuera de GPU.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) validada por el autor para entrenamiento; no se especifican GPU para inferencia.
- ¿Cabe en consumer GPU? El artefacto de pesos ocupa 49,88 MB, pero la inferencia requiere cargar el modelo base LLaVA-Qwen-0.5B (1,66 GB en FP16), por lo que debería caber en GPUs consumer con al menos unos pocos GB de VRAM; no hay datos oficiales de consumo en inferencia.
- Opciones de despliegue: librería `neuralops` mediante `load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (image subset, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-phantom-scienceqa | ~0,5B (delta 49,88 MB) | no disponible | 38,75 % accuracy / 3,07 PPL | MIT | Hugging Face (requiere neuralops) |
| llava-hf/llava-interleave-qwen-0.5b-hf (teacher) | ~0,5B | no disponible | 63,75 % accuracy / 2,45 PPL (declarado como baseline) | no disponible en la información | Hugging Face |
| Alternativas de ~0,5B tipo LLaVA-Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Precisión muy inferior al teacher: 38,75 % frente a 63,75 % en ScienceQA (image subset, validation), con una brecha de 25 puntos.
- Los resultados de benchmarks están declarados por el autor y marcados como `verified: false`; no han sido validados por terceros.
- El modelo solo soporta inglés; no hay capacidades multilingües.
- Es un delta quirúrgico, no un checkpoint autonómo: requiere el modelo base llava-hf/llava-interleave-qwen-0.5b-hf y la librería neuralops para cargarse.
- Solo se entrenaron las capas de atención sustituidas y los layernorms; el resto de componentes permanece congelado, lo que limita la adaptación a dominios distintos de ScienceQA.
- Riesgo de alucinación no evaluado en la información disponible; al ser un VLM de 0,5B con precisión baja en razonamiento visual, conviene tratarlo como prototipo de investigación.
- Sesgos conocidos: no disponibles.
- Licencia MIT, lo que permite uso comercial, pero la dependencia de neuralops y del modelo base debe verificarse por separado.
- No se documentan límites de contexto ni compatibilidad con frameworks de despliegue estándar.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-phantom-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset de evaluación: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación PHANTOMAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/phantom.py
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
