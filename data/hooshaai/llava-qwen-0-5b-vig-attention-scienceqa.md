# Hooshaai/llava-qwen-0.5b-vig-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-vig-attention-scienceqa` es un checkpoint multimodal de tipo visión-lenguaje publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, un marco experimental de "cirugía de atención" que sustituye mecanismos de atención estándar por operadores alternativos en modelos preentrenados. El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf` y reemplaza la atención cuadrática en 18 de sus 24 capas del decodificador por un operador denominado ViGAttention (Vision GNN-inspired 2D Grid Linear Attention con fusión gated aprendida), manteniendo congelados el torreón visual SigLIP, el proyector multimodal y seis capas de atención cuadrática que actúan como anclas.

El objetivo no es tanto ofrecer un VLM de producción como documentar empíricamente el impacto de una cirugía arquitectónica concreta sobre un modelo pequeño (Qwen2 de 24 capas, dimensión 1024, 16 cabezas) y evaluar su recuperación mediante destilación de conocimiento. El resultado publicado es modesto: 36,88 % de accuracy en el subconjunto con imagen de ScienceQA (validación) frente al 63,75 % del profesor original, aunque con una mejora respecto al estado pre-destilación (35,00 %) y una reducción de perplejidad de 5,95 a 3,05.

Es relevante ahora por su valor como artefacto de investigación reproducible: el repositorio incluye manifiesto quirúrgico, métricas de entrenamiento, telemetría de hardware (RTX 3090, 172 pasos, 120,7 s, 6.609 MB de VRAM pico) y pesos delta de solo 148,74 MB en FP16, lo que supone un 91,3 % menos que el modelo base completo. No obstante, sus cifras están muy por debajo del estado del arte y el modelo solo declara soporte de inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con atención ViGAttention en 18/24 capas |
| Parametros totales | 0,5 B (modelo base LLaVA-Qwen-0.5B); delta quirúrgico serializado de 148,74 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (pesos delta en `attention_only_fp16`); no se documentan otras cuantizaciones |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más `surgical_manifest.json`, `config.json` y tokenizer en JSON |
| Dimension del decoder | D=1024, H=16 cabezas, head_dim=64, 24 capas |
| Capas modificadas | 18/24 (`hybrid_3_1`); capas cuadráticas ancla en índices [3, 7, 11, 15, 19, 23] |
| Componentes congelados | SigLIP vision tower (27 capas), `multi_modal_projector.*`, MLPs y embeddings del decoder |
| Dataset de evaluación | derek-thomas/ScienceQA (subconjunto STEM con imagen, validación) |
| Librería | neuralops |

## Arquitectura y entrenamiento

El modelo conserva la estructura LLaVA-Interleave: un torreón visual SigLIP congelado de 27 capas, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión 1024, 16 cabezas y dimensión de cabeza 64. La intervención quirúrgica sustituye la self-attention en 18 de las 24 capas por ViGAttention, un operador que combina dos ramas paralelas por cabeza y por token: una rama de grafo con ventana local y ancla al primer token (atención dispersa) y una rama lineal con kernel softplus y normalización L2 que ofrece memoria O(N). Ambas se combinan mediante una fusión gated aprendida. Se preservan seis capas con atención cuadrática estándar (índices 3, 7, 11, 15, 19 y 23) como anclas, siguiendo un patrón híbrido 3:1.

El entrenamiento se realizó en dos etapas de destilación de conocimiento desde el modelo profesor (`llava-hf/llava-interleave-qwen-0.5b-hf`), con 172 pasos totales (51 en la etapa 1 y 121 en la etapa 2) sobre una NVIDIA RTX 3090 de 24 GB, con un pico de 6.609 MB de VRAM y una duración total de 120,7 segundos. Solo se entrenaron las atenciones modificadas y las layernorms del decodificador; el resto de componentes permaneció congelado. El manifiesto quirúrgico (`schema_version=neuralops.surgery/v2`) registra 318 tensores guardados.

## Capacidades

- Generación de texto e imagen-a-texto en inglés, con foco en razonamiento visual sobre preguntas de tipo STEM.
- Respuesta a preguntas visuales (VQA) sobre imágenes con contexto científico y educativo.
- Conversación multimodal multi-turno, según la plantilla de chat incluida (`chat_template.json`).
- Procesamiento de imágenes mediante el preprocesador SigLIP incluido (`preprocessor_config.json`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): visión sí; audio y modo de razonamiento extendido, no disponibles.

## Casos de uso

- Investigación sobre eficiencia de atención: el checkpoint permite reproducir el experimento de sustituir atención cuadrática por ViGAttention en un VLM pequeño y medir el impacto en accuracy y perplejidad sobre ScienceQA, con telemetría completa de hardware y pasos incluida en el repositorio.
- Destilación de conocimiento en modelos multimodales pequeños: sirve como caso de estudio de recuperación de rendimiento tras una cirugía arquitectónica (de 35,00 % a 36,88 % de accuracy y de 5,95 a 3,05 de perplejidad), útil para diseñar pipelines de KD en entornos con una sola GPU de consumo.
- Prototipado educativo de VQA científica: puede emplearse para experimentar con asistentes que respondan preguntas sobre diagramas y figuras de ciencias, siempre que se asuma su baja precisión (36,88 %) y se use con supervisión humana.
- Evaluación comparativa de operadores de atención: al estar empaquetado como delta de 148,74 MB sobre el modelo base, permite intercambiar operadores quirúrgicos y comparar resultados sin duplicar el almacenamiento del modelo completo.
- Docencia y divulgación sobre arquitecturas multimodales: el manifiesto quirúrgico y los archivos de configuración hacen tangible la estructura interna de un LLaVA-Qwen y el efecto de modificar componentes concretos.
- Integración en pipelines de investigación con NeuralOps: la API `load_surgeried_model` permite cargar el checkpoint y ejecutar inferencia sobre imágenes sintéticas o reales para validar la reproducibilidad del experimento antes de escalar a otros modelos del zoo.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto STEM con imagen, split de validación:

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 35,00 | 36,88 | +1,88 |
| Perplejidad (PPL) | 2,45 | 5,95 | 3,05 | -2,90 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumió 6.609 MB de pico en una RTX 3090; la inferencia en FP16 del modelo base de 0,5 B más el torreón SigLIP debería situarse holgadamente por debajo de esa cifra, aunque no se publica una medición específica de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en la práctica para un modelo de 0,5 B en FP16; el autor empleó una RTX 3090.
- Cabe en GPU de consumo: sí, en RTX 3060, 4060, 4070, 4080, 4090 y equivalentes.
- Opciones de despliegue: la model card solo documenta la API `load_surgeried_model` de la librería `neuralops`; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el único dato de tiempo publicado es el de entrenamiento (120,7 s para 172 pasos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (img, val) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| llava-qwen-0.5b-vig-attention-scienceqa | 0,5 B | no disponible | 36,88 % acc / 3,05 PPL | MIT | Hugging Face (delta 148,74 MB) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otros VLM de ~0,5 B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento muy inferior al modelo profesor: 36,88 % frente a 63,75 % de accuracy en ScienceQA, lo que lo desaconseja para uso en producción sin validación adicional.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- No se documentan sesgos específicos, pero al derivar de un VLM entrenado sobre datos web y científicos es esperable un sesgo hacia vocabulario y conceptos STEM en inglés.
- Riesgo de alucinación elevado en preguntas visuales complejas, coherente con su baja accuracy y con el hecho de que la destilación solo recuperó 1,88 puntos porcentuales.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).
- Licencia MIT, lo que permite uso comercial, pero el modelo base y el dataset subyacente pueden tener sus propias condiciones que conviene revisar.
- El repositorio contiene únicamente pesos delta de atención (`attention_only_fp16`); para usarlo es necesario cargarlo mediante la librería `neuralops` junto con el modelo base, lo que limita la portabilidad a otros stacks de inferencia.
- Solo se ha evaluado en un subconjunto de validación de ScienceQA; no hay datos sobre robustez fuera de ese dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-vig-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de ViGAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/vig_attention.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
