# Hooshaai/llava-qwen-0.5b-full-attention-scienceqa

## Resumen

llava-qwen-0.5b-full-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps (Attention Surgery Zoo). El modelo parte de la arquitectura LLaVA-Interleave con un codificador visual SigLIP congelado, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas (dimensión 1024, 16 cabezas, head_dim 64). Sobre esa base se ha aplicado una "cirugía de atención": se han sustituido y reentrenado las capas de self-attention en 18 de las 24 capas del decodificador, dejando 6 capas ancla con atención cuadrática estándar y manteniendo congelados el vision tower, el proyector, los MLP y los embeddings.

El modelo se ha ajustado mediante destilación de conocimiento offline sobre el subconjunto de ScienceQA con imágenes (validación), con el objetivo de recuperar y superar la precisión del profesor original tras el reemplazo de operadores de atención. El resultado declarado es una accuracy del 66,88 % y una perplejidad de 2,17, frente al 63,75 % y 2,45 del baseline profesor. El artefacto serializado ocupa solo 147,61 MB (frente a 1,66 GB del base en FP16), lo que supone una reducción del 91,3 %.

Es relevante ahora porque ejemplifica una línea de trabajo centrada en la sustitución modular de operadores de atención y la compresión de pesos en modelos multimodales pequeños, un área activa para desplegar VLM en hardware de consumo. No obstante, se trata de un experimento de investigación con un alcance muy acotado (un único benchmark, un único idioma y un formato de pesos propietario del framework NeuralOps), no de un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-Interleave: SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención completa estándar (Vaswani et al., 2017) en 18/24 capas, con 6 capas ancla cuadráticas [3, 7, 11, 15, 19, 23] |
| Parametros totales | no disponible (el modelo base LLaVA-Qwen-0.5B sugiere ~0,5B en el decodificador, pero no se declara el total) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos serializados en FP16 safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, delta quirúrgico FP16) + manifest JSON; requiere el runtime neuralops para cargar |

## Arquitectura y entrenamiento

La arquitectura subyacente es LLaVA-Interleave sobre Qwen2-0.5B: un vision tower SigLIP de 27 capas congelado, un proyector MLP de dos capas que alinea las representaciones visuales con el espacio del decodificador, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La intervención "attention surgery" sustituye el operador de atención en 18 de las 24 capas del decodificador por el operador FullAttention del registro NeuralOps (familia dense), manteniendo seis capas ancla con atención cuadrática estándar en los índices 3, 7, 11, 15, 19 y 23. También se entrenan las layer norms del decodificador; el vision tower, el proyector, los MLP y los embeddings permanecen congelados y excluidos del artefacto serializado.

El ajuste se realizó mediante destilación de conocimiento offline con la arquitectura de caché de representaciones del profesor de NeuralOps (§21.1), de modo que el profesor no consume VRAM en GPU durante el entrenamiento. El entrenamiento se ejecutó en una única NVIDIA GeForce RTX 3090 (24 GB), con 229 pasos de optimización (87 en la etapa 1 y 142 en la etapa 2), una duración de 120,1 segundos y un pico de VRAM de 17.678 MB. El dataset empleado es derek-thomas/ScienceQA, en su subconjunto con imágenes y split de validación. No se documentan técnicas de RLHF ni DPO, ni detalles sobre el número de tokens de entrenamiento o la composición completa del dataset más allá de la referencia a ScienceQA.

## Capacidades

- Generación de texto e imagen-a-texto conversacional en inglés (pipeline image-text-to-text).
- Respuesta a preguntas visuales sobre contenido STEM (ciencias, matemáticas y materias afines) con soporte de opciones de respuesta tipo test.
- Razonamiento visual de un solo turno sobre imágenes de ScienceQA; el prompt de ejemplo usa el formato `<image>\nQuestion: ...\nAnswer with the option letter:`.
- Formato conversacional con chat template propio (chat_template.json incluido).
- Preprocesado de imagen integrado mediante preprocessor_config.json.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras modalidades más allá de imagen y texto.
- Capacidad multilingüe limitada al inglés según la metadata del modelo.

## Casos de uso

- Evaluación de técnicas de attention surgery: el modelo sirve como referencia reproducible para medir el impacto de sustituir operadores de atención en un VLM pequeño, comparando la accuracy post-KD (66,88 %) con el baseline profesor (63,75 %) sobre ScienceQA.
- Investigación en destilación de conocimiento con caché offline: útil para reproducir el flujo de NeuralOps §21.1, donde el profesor no ocupa VRAM y el alumno se entrena en una sola RTX 3090 en unos dos minutos.
- Prototipado de tutores educativos STEM: el modelo responde preguntas con imagen sobre materias científicas y puede integrarse en un pipeline de demostración para responder ejercicios de opción múltiple con contexto visual.
- Benchmarking de compresión de pesos: con 147,61 MB de delta frente a 1,66 GB del base, sirve para estudiar la viabilidad de distribuir checkpoints quirúrgicos en entornos con ancho de banda o almacenamiento limitados.
- Validación de pipelines multimodales en investigación académica: adecuado como sujeto de prueba para comparar variantes del zoo de atención (full_attention frente a otros operadores del registro NeuralOps) bajo el mismo protocolo de evaluación.
- Experimentos docentes sobre arquitecturas VLM: por su tamaño reducido y su licencia MIT, puede usarse en cursos o talleres para ilustrar el funcionamiento de un proyector SigLIP-Qwen2 y de la sustitución modular de capas de atención.
- Pruebas de integración del runtime neuralops: el checkpoint requiere `neuralops.hub.load_surgeried_model`, por lo que es útil para validar la API pública del framework y el formato de manifest quirúrgico.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card (no verificados de forma independiente):

| Metrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto con imágenes, validación) | 63,75 | 32,50 | 66,88 | +34,38 |
| Perplejidad (PPL) | 2,45 | 5,12 | 2,17 | -2,95 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El entrenamiento se realizó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 17.678 MB de VRAM; ese dato corresponde al proceso de destilación, no a inferencia.
- El artefacto serializado pesa 147,61 MB (FP16 safetensors) y el paquete completo 162,80 MB, por lo que el almacenamiento necesario es muy reducido.
- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (~0,5B en el decodificador) y el vision tower SigLIP, es razonable esperar que quepa en GPUs de consumo, pero el autor no publica cifras.
- GPU recomendadas: no disponible; el único hardware documentado es la RTX 3090 usada para el ajuste.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño reducido del base, aunque no se confirma con mediciones de inferencia.
- Opciones de despliegue: el modelo requiere el runtime `neuralops` (`neuralops.hub.load_surgeried_model`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-full-attention-scienceqa | no disponible (base ~0,5B en decodificador) | no disponible | 66,88 % accuracy / 2,17 PPL en ScienceQA (validación, con imágenes) | MIT | Hugging Face, requiere runtime neuralops |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | ~0,5B en decodificador | no disponible | 63,75 % accuracy / 2,45 PPL en el mismo protocolo | no disponible en la información proporcionada | Hugging Face, transformers |
| Otros operadores del zoo NeuralOps (p. ej. variantes de atención lineal o dispersa) | no disponible | no disponible | no disponible | MIT (presumiblemente, según el repo) | no disponible |

No se dispone de datos de benchmarks de terceros (Qwen2-VL-2B, SmolVLM u otros VLM pequeños) en la información proporcionada para establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo de investigación con alcance muy acotado: evaluado únicamente en el subconjunto con imágenes de ScienceQA en validación; no hay evidencia de generalización a otros dominios visuales.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Los resultados (66,88 % accuracy, 2,17 PPL) están declarados por el autor y marcados como no verificados (`verified: false`) en el model-index.
- Riesgo de alucinación no cuantificado; al ser un modelo de ~0,5B y ajustado sobre un dataset específico, la fiabilidad fuera de distribución es incierta.
- El checkpoint contiene únicamente pesos delta quirúrgicos (attention_weights.safetensors) más un manifest; no es un modelo autónomo cargable con transformers sin el runtime neuralops.
- La licencia del modelo es MIT, pero el enlace de licencia apunta al repositorio NeuralOps; conviene revisar los términos del framework y de los pesos base (llava-hf/llava-interleave-qwen-0.5b-hf) antes de uso comercial.
- Longitud de contexto y tipos de cuantización no documentados; no se garantiza compatibilidad con herramientas estándar de despliegue (vLLM, llama.cpp, Ollama, TGI).
- El proceso de entrenamiento fue muy corto (229 pasos, 120,1 s) sobre un único split de validación, lo que limita la solidez estadística de las métricas.
- Uso no recomendado en producción sin una evaluación propia sobre el dominio objetivo y sin verificación independiente de los benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-full-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador FullAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/dense/full_attention.py
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA (derek-thomas): https://huggingface.co/datasets/derek-thomas/ScienceQA
