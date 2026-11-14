# Hooshaai/llava-qwen-0.5b-orion-scienceqa

## Resumen

llava-qwen-0.5b-orion-scienceqa es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps, un marco de trabajo orientado a la cirugía de mecanismos de atención en modelos multimodales. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM compacto que combina una torre de visión SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), y sustituye la atención cuadrática en 18 de esas 24 capas por el operador ORIONAttention, de la familia SSM (modelos de espacio de estados).

El objetivo declarado no es superar al modelo base, sino servir como artefacto reproducible de investigación: un "zoo" de variantes quirúrgicas que permite estudiar el impacto de reemplazar atención por SSM en un VLM pequeño. La evaluación se realiza sobre el subconjunto con imagen de ScienceQA (split de validación), una tarea de razonamiento visual STEM.

El interés actual reside en su tamaño extremadamente reducido (53,12 MB de pesos serializados, un 96,9 % menos que el base en FP16) y en que demuestra un flujo de destilación de conocimiento con caché offline de representaciones que no requiere mantener el profesor en VRAM. No obstante, los resultados empíricos muestran una degradación severa frente al profesor (26,88 % frente a 63,75 % de accuracy), por lo que debe interpretarse como una prueba de concepto y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (SigLIP vision tower + MLP projector + decoder Qwen2) con atencion hibrida: 18/24 capas sustituidas por ORIONAttention (familia SSM) y 6 capas cuadraticas ancla [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (el checkpoint solo contiene los pesos quirurgicos: 55.696.104 bytes en 336 tensores) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 (formato de los pesos serializados); no se documentan otras variantes |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, deltas quirurgicos en FP16) + surgical_manifest.json |

## Arquitectura y entrenamiento

La arquitectura base es LLaVA-Interleave con Qwen2-0.5B como decodificador: torre de visión SigLIP congelada de 27 capas, proyector multimodal MLP de dos capas y decodificador de 24 capas con dimension oculta 1024, 16 cabezas y head_dim 64. Sobre esta base, NeuralOps aplica una "cirugía" que reemplaza el self-attention en 18 de las 24 capas por ORIONAttention (Optimized Rectified Input-aware Orthogonal Network), un operador de la familia SSM registrado en neuralops/layers/ssm/orion.py. Se preservan seis capas cuadraticas ancla para mantener capacidad de atención global. Los componentes congelados y excluidos del artefacto son la torre de visión, el proyector, los MLP del decodificador, los embeddings y las capas ancla.

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), lo que permite no mantener el profesor en VRAM (0 MB de VRAM de profesor). Se ejecutaron 119 pasos de optimización (42 en etapa 1 y 77 en etapa 2) en una NVIDIA GeForce RTX 3090 de 24 GB, con un pico de 14.782 MB y una duración total de 120,8 segundos. El dataset de evaluación y entrenamiento es derek-thomas/ScienceQA, subconjunto con imagen STEM. No se documentan detalles sobre volumen de tokens, composición exacta del corpus ni uso de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto en inglés, orientada a respuesta de preguntas visuales sobre contenidos STEM.
- Razonamiento visual básico sobre diagramas e ilustraciones científicas, limitado por el subconjunto de ScienceQA con imagen.
- Conversación multimodal multi-turno mediante plantilla de chat incluida (chat_template.json).
- Procesamiento de imágenes a través del preprocesador SigLIP incluido (preprocessor_config.json).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, audio ni otras modalidades adicionales.
- Capacidad multilingüe: únicamente inglés según la model card.

## Casos de uso

- Investigación sobre eficiencia de atención en VLMs: el checkpoint permite comparar el comportamiento de ORIONAttention frente a atención cuadrática en las mismas capas, sirviendo como material de ablación reproducible en un entorno de 24 GB de VRAM.
- Estudio de destilación con caché offline: útil para validar la arquitectura de NeuralOps §21.1, que entrena sin profesor en GPU y con serialización determinista de pesos.
- Prototipado de pipelines multimodales de bajo coste: con 53 MB de pesos quirúrgicos, se puede integrar en entornos con almacenamiento muy restringido para pruebas de concepto.
- Docencia y divulgación: ejemplo práctico de cirugía de mecanismos en un transformer multimodal, con manifiesto de topología (surgical_manifest.json) que documenta exactamente qué tensores se modificaron.
- Benchmarking de operadores SSM en visión-lenguaje: permite medir la caída de accuracy al sustituir atención por SSM en un VLM pequeño, como referencia para diseñar variantes híbridas.
- Reproducción de experimentos: los ficheros training_metrics.json y surgical_manifest.json permiten replicar la configuración de entrenamiento y verificar la integridad de los pesos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto con imagen STEM, split de validación:

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 26,88 | 26,88 | +0,00 |
| Perplexity | 2,45 | 11,51 | 11,51 | +0,00 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el artefacto quirúrgico ocupa 53,12 MB en FP16, pero requiere cargar la base llava-hf/llava-interleave-qwen-0.5b-hf (1,66 GB en FP16) para reconstruir el modelo completo.
- GPU recomendadas: el autor documenta entrenamiento en NVIDIA GeForce RTX 3090 (24 GB) con pico de 14.782 MB; para inferencia del modelo completo se espera un requisito muy inferior, aunque no se especifica.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más al tratarse de un modelo de 0,5B de parámetros, aunque no hay cifras oficiales.
- Opciones de despliegue: la carga se realiza mediante neuralops.hub.load_surgeried_model; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el tiempo de entrenamiento (120,8 s para 119 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Accuracy ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-orion-scienceqa | no disponible (base 0,5B) | no disponible | 26,88 % | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % | no disponible en la informacion | Hugging Face |
| Otros VLM pequenos comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Degradación severa de rendimiento: la accuracy cae del 63,75 % del profesor al 26,88 %, y la perplejidad sube de 2,45 a 11,51; la destilación posterior no recupera ninguna mejora (delta de +0,00 en ambas métricas).
- El checkpoint no es un modelo completo: contiene únicamente los deltas quirúrgicos de atención (336 tensores), por lo que requiere la base llava-hf/llava-interleave-qwen-0.5b-hf para funcionar.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre ScienceQA, hereda los sesgos y limitaciones de ese corpus.
- Riesgo de alucinación: elevado en la práctica dado el bajo rendimiento medido y la perplejidad de 11,51, muy superior a la del profesor.
- Limitaciones de idioma: solo inglés; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Restricciones de licencia: MIT, lo que permite uso comercial, pero el modelo base subyacente puede tener condiciones adicionales no detalladas en la información disponible.
- Caveat para producción: el autor no declara el modelo como listo para uso productivo; es un artefacto de investigación del zoo de NeuralOps.
- Los resultados de benchmarks están marcados como no verificados (verified: false) en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-orion-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación ORIONAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/ssm/orion.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
