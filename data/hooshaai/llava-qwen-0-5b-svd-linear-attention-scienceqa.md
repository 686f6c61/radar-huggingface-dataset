# Hooshaai/llava-qwen-0.5b-svd-linear-attention-scienceqa

## Resumen

El modelo `llava-qwen-0.5b-svd-linear-attention-scienceqa`, publicado por Hooshaai, es un checkpoint experimental de visión-lenguaje derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de "cirugía de atención" que sustituye la atención cuadrática estándar por una variante de atención lineal factorizada mediante SVD (`SVDLinearAttention`) con decaimiento exponencial opcional. El objetivo no es tanto ofrecer un VLM de propósito general como demostrar que es posible comprimir y modificar quirúrgicamente los mecanismos de atención de un modelo multimodal y recuperar buena parte del rendimiento perdido mediante destilación de conocimiento.

El modelo parte de la arquitectura LLaVA-Interleave con torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas (D=1024, 16 cabezas, head_dim=64). La intervención afecta a 18 de las 24 capas del decodificador, manteniendo 6 capas "ancla" con atención cuadrática original en los índices [3, 7, 11, 15, 19, 23], lo que da lugar a un patrón híbrido 3:1. El artefacto resultante pesa solo 80,71 MB en FP16 frente a los 1,66 GB del modelo base, una reducción del 95,3%.

Es relevante ahora porque ejemplifica una línea de investigación activa: la sustitución de atención cuadrática por alternativas lineales en modelos ya entrenados, sin reentrenar desde cero, usando destilación para recuperar capacidad. El checkpoint está evaluado únicamente sobre el subconjunto con imagen de ScienceQA (validación), con una accuracy del 50,62% frente al 63,75% del profesor, y se distribuye bajo licencia MIT con la librería `neuralops`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave (SigLIP vision tower + MLP projector + Qwen2 decoder) con atención lineal SVD en 18/24 capas |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B tiene ~0.5B; el artefacto distribuido contiene solo pesos de atención) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, delta quirúrgico FP16, `attention_only_fp16`) |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con un codificador visual SigLIP congelado de 27 capas, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La modificación quirúrgica sustituye el módulo `self_attn` en 18 de las 24 capas del decodificador por `SVDLinearAttention`, una atención lineal factorizada por descomposición en valores singulares con compuerta de decaimiento exponencial opcional. Se conservan seis capas con atención cuadrática original como anclas (índices 3, 7, 11, 15, 19 y 23), configurando un esquema híbrido `hybrid_3_1`. Los MLP del decodificador, los embeddings y la torre visual permanecen congelados y no se incluyen en el artefacto distribuido.

El entrenamiento se realizó en dos etapas de destilación de conocimiento desde el modelo profesor original, con 293 pasos totales (133 en la etapa 1 y 160 en la etapa 2), sobre una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de VRAM de 16.264 MB y una duración total de 120,1 segundos. El conjunto de evaluación y presumiblemente de ajuste es el subconjunto con imagen de ScienceQA (validación). El resultado de la destilación es notable: la accuracy pasa del 31,87% en zero-shot tras la cirugía al 50,62% tras la destilación, y la perplejidad cae de 607,29 a 2,73. Aun así, no se alcanza al profesor (63,75% de accuracy, 2,45 de perplejidad).

## Capacidades

- Generación de texto e imagen-a-texto en formato conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre imágenes, especialmente en dominios STEM (ciencia, tecnología, ingeniería y matemáticas) dado el ajuste sobre ScienceQA.
- Razonamiento multimodal de un solo turno o multi-turno mediante plantilla de chat (`chat_template.json` incluido).
- Soporte de selección de opción múltiple en formato de respuesta por letra (uso previsto en la model card).
- Capacidades multilingües: limitadas al inglés.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Investigación sobre atención lineal en VLMs: el checkpoint sirve como referencia reproducible para estudiar el impacto de sustituir atención cuadrática por `SVDLinearAttention` en un modelo multimodal ya entrenado, comparando la curva de recuperación vía destilación (31,87% → 50,62%).
- Evaluación comparativa de operadores de atención: al formar parte de un "attention zoo", permite medir accuracy y perplejidad de la variante SVD frente a otras cirugías sobre el mismo base model y el mismo subconjunto de ScienceQA.
- Prototipado de VLM de bajo coste en hardware consumer: con solo 80,71 MB de pesos de atención y un pico de entrenamiento de 16 GB en una RTX 3090, es adecuado para experimentos en una única GPU de gama alta de consumo.
- Docencia y demostraciones de destilación de conocimiento: el par (profesor 63,75%, alumno 50,62%) es un ejemplo didáctico de las pérdidas y recuperaciones típicas en KD sobre atención lineal.
- Pruebas de integración con la librería NeuralOps: el checkpoint valida el flujo `load_surgeried_model` y el manifiesto `neuralops.surgery/v2` con 426 tensores guardados.
- Investigación sobre eficiencia de almacenamiento: la reducción de 1,66 GB a 80,71 MB (21,08x) permite estudiar estrategias de distribución de deltas quirúrgicos en lugar de pesos completos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`), sobre ScienceQA (Image-Bearing STEM Subset, validation):

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 31,87 | 50,62 | +18,75 |
| Perplejidad | 2,45 | 607,29 | 2,73 | -604,56 |

Telemetría de entrenamiento declarada: 293 pasos, 120,1 s, RTX 3090 (24 GB), pico de VRAM 16.264 MB, timestamp 2026-11-11T10:31:24Z.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el artefacto distribuido contiene solo pesos de atención (80,71 MB), por lo que la inferencia requiere cargar el modelo base LLaVA-Qwen-0.5B (~1,66 GB en FP16) más el delta quirúrgico.
- GPU recomendadas: no disponibles; el autor solo documenta entrenamiento en una RTX 3090 (24 GB).
- ¿Cabe en GPU consumer? Sí, con toda probabilidad, dado el tamaño del modelo base (~0,5B parámetros); no se especifican GPUs concretas validadas.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-svd-linear-attention-scienceqa | ~0,5B (base) | no disponible | 50,62% accuracy / 2,73 PPL | MIT | Hugging Face (Hooshaai) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B | no disponible | 63,75% accuracy / 2,45 PPL | no disponible en la información | Hugging Face (llava-hf) |
| Otras variantes del attention zoo de NeuralOps | no disponible | no disponible | no disponible | MIT (presumible) | no disponible |

La comparativa se limita al par profesor-alumno documentado; no se dispone de datos de otros VLMs del mismo tamaño evaluados sobre el mismo subconjunto.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado sobre el subconjunto con imagen de ScienceQA (validación); no hay evidencia de rendimiento en otros dominios o tareas.
- Pérdida de rendimiento respecto al profesor: -13,13 puntos de accuracy y perplejidad un 11,4% superior (2,73 frente a 2,45).
- El artefacto distribuido contiene únicamente pesos de atención y layernorms del decodificador; no es un modelo autónomo y requiere el base model LLaVA-Qwen-0.5B para funcionar.
- Idiomas: solo inglés; no hay soporte multilingüe documentado.
- No hay información sobre sesgos, tasas de alucinación ni robustez fuera de distribución.
- Restricciones de licencia: MIT, lo que permite uso comercial, pero el modelo base puede tener condiciones adicionales no documentadas aquí.
- Resultados de benchmarks no verificados (`verified: false`); deben tratarse como cifras declaradas por el autor.
- Proyecto experimental con 22 descargas y 0 likes en el momento de la consulta; sin garantías de mantenimiento.
- El nombre del autor en el código de ejemplo (`tahamajs/...`) difiere del ID del repositorio (`Hooshaai/...`), lo que puede indicar una discrepancia de publicación.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-svd-linear-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `SVDLinearAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_linear_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
