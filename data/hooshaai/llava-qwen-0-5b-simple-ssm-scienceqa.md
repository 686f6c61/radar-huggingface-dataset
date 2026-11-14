# Hooshaai/llava-qwen-0.5b-simple-ssm-scienceqa

## Resumen

`llava-qwen-0.5b-simple-ssm-scienceqa` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps, un "zoo" de cirugía de atención sobre modelos multimodales. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` (LLaVA con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas) y sustituye el mecanismo de self-attention cuadrática en 18 de las 24 capas del decodificador por un operador de espacio de estados simplificado denominado SimpleSSM. Las 6 capas restantes mantienen atención cuadrática como anclas.

El objetivo no es tanto ofrecer un VLM de propósito general como demostrar una técnica de compresión y destilación: el artefacto final pesa 147,62 MB frente a los 1,66 GB del modelo base en FP16, una reducción del 91,3 %. El modelo se evalúa sobre el subconjunto con imagen de ScienceQA (validación), donde alcanza un 43,12 % de accuracy y una perplejidad de 2,97 tras destilación de conocimiento desde el profesor original.

Es relevante ahora como ejemplo reproducible de sustitución de atención por SSM en modelos visión-lenguaje pequeños, con telemetría de entrenamiento completa (182 pasos, 120,6 s en una RTX 3090) y manifiesto quirúrgico verificable. No obstante, su rendimiento queda muy por debajo del profesor (63,75 % de accuracy) y su alcance está limitado a un único benchmark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + proyector MLP 2 capas + decodificador Qwen2 de 24 capas) con 18/24 capas de atención sustituidas por SimpleSSM (híbrido `hybrid_3_1`) |
| Parámetros totales | no disponible (modelo base de 0,5B; el artefacto guarda solo pesos de atención modificados) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP16 (pesos guardados en `attention_only_fp16`); no se documentan otras |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico FP16) + `surgical_manifest.json` |

## Arquitectura y entrenamiento

El modelo conserva la estructura LLaVA clásica: torre visual SigLIP de 27 capas congelada, proyector multimodal MLP de dos capas y decodificador Qwen2 con dimensión oculta D=1024, 16 cabezas y head_dim=64. La modificación quirúrgica reemplaza la self-attention en 18 de las 24 capas del decodificador por SimpleSSM, un bloque de espacio de estados con proyecciones Q/K/V/O alineadas con GQA, decaimiento exponencial selectivo y acotado, escaneo causal paralelo por chunks e inicialización residual del value skip. Las capas `[3, 7, 11, 15, 19, 23]` se mantienen con atención cuadrática como anclas, lo que da el patrón `hybrid_3_1`.

El entrenamiento se realizó en dos etapas (68 + 114 pasos, 182 en total) sobre una NVIDIA RTX 3090 de 24 GB, con un pico de 13.523 MB de VRAM y una duración total de 120,6 segundos. Se aplicó destilación de conocimiento desde el modelo profesor, lo que elevó la accuracy del 32,50 % en zero-shot al 43,12 % final y redujo la perplejidad de 204,30 a 2,97. Solo se guardan los pesos modificados (336 tensores) y los layernorms del decodificador entrenados; la torre visual, el proyector, los MLP y los embeddings permanecen congelados y excluidos del artefacto.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM con selección de opción múltiple (formato ScienceQA).
- Razonamiento visual básico sobre figuras y diagramas científicos.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- Capacidad multilingüe: limitada al inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Modo thinking, visión avanzada, audio: no disponible.

## Casos de uso

- Investigación en eficiencia de arquitecturas: sirve como referencia reproducible para estudiar el impacto de sustituir atención por SSM en un VLM pequeño, con manifiesto quirúrgico y métricas de entrenamiento completas.
- Destilación de conocimiento en modelos multimodales: el par profesor/alumno (63,75 % → 43,12 %) permite analizar curvas de recuperación con presupuestos de cómputo mínimos (120 s en una RTX 3090).
- Prototipado de asistentes educativos STEM: responde preguntas de opción múltiple sobre imágenes científicas, adecuado para demos de bajo coste en entornos controlados.
- Evaluación comparativa de operadores SSM: al formar parte del "Attention Surgery Zoo", permite contrastar `simple_ssm` con otras variantes sobre el mismo benchmark y base.
- Despliegue en hardware muy limitado: el artefacto de 147,62 MB y el modelo base de 0,5B permiten ejecución en GPUs de consumo e incluso entornos con poca VRAM.
- Experimentación con atención híbrida: el patrón `hybrid_3_1` con anclas cuadráticas es útil para estudiar compromisos entre coste y calidad en VLMs.
- Fine-tuning posterior sobre dominios específicos: al estar bajo licencia MIT y con pesos modulares, se puede reentrenar sobre datasets propios de preguntas visuales.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen, split de validación:

| Métrica | Profesor (base) | Zero-shot (pre-KD) | Final (post-KD) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 32,50 | 43,12 | +10,62 |
| Perplejidad | 2,45 | 204,30 | 2,97 | -201,33 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,5B; en FP16 requiere aproximadamente 1-2 GB, más el coste de la torre visual SigLIP. El artefacto quirúrgico ocupa 147,62 MB.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento), RTX 4090, A100, H100; cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente para inferencia.
- Cabe en GPU de consumo: sí, en RTX 3060/4060 y superiores; también en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: la librería `neuralops` con `load_surgeried_model`; al estar basado en `llava-hf/llava-interleave-qwen-0.5b-hf`, es compatible con el ecosistema Transformers para el modelo base. vLLM, llama.cpp, Ollama o TGI: no disponible (no se documenta soporte).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `llava-qwen-0.5b-simple-ssm-scienceqa` | ~0,5B (base) | no disponible | 43,12 % accuracy / 2,97 PPL | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en la información | Hugging Face |
| Otras variantes del Attention Surgery Zoo | no disponible | no disponible | no disponible | MIT (presumible) | Hugging Face |

## Limitaciones y advertencias

- Rendimiento muy inferior al profesor: 43,12 % frente a 63,75 % de accuracy en ScienceQA; no es apto para producción sin fine-tuning adicional.
- Evaluación limitada a un único benchmark y un único split (validación de ScienceQA con imagen); no hay datos de MMLU, HumanEval, GSM8K ni otras tareas.
- Solo inglés; no se documenta soporte multilingüe.
- Riesgo elevado de alucinación en preguntas visuales fuera del dominio STEM de ScienceQA.
- El artefacto contiene únicamente pesos de atención modificados (delta quirúrgico); requiere cargar el modelo base junto con la librería `neuralops` para funcionar.
- Sesgos conocidos: no documentados por el autor.
- No se documentan restricciones comerciales adicionales más allá de la licencia MIT, pero el modelo base puede tener sus propias condiciones.
- Métricas declaradas como no verificadas (`verified: false`) en el model-index.
- El pipeline de carga depende de la API pública de NeuralOps Hub, lo que introduce una dependencia externa en producción.
- Fecha de creación futura (2026-11-11) y muy pocas descargas (25): modelo experimental con escasa validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-simple-ssm-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SimpleSSM: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/simple_ssm.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
