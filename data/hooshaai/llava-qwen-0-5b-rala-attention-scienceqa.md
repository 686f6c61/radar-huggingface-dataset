# Hooshaai/llava-qwen-0.5b-rala-attention-scienceqa

## Resumen

llava-qwen-0.5b-rala-attention-scienceqa es un checkpoint multimodal de tipo vision-language derivado de llava-hf/llava-interleave-qwen-0.5b-hf, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. El modelo no es un entrenamiento desde cero, sino una "cirugía de atención" (attention surgery): se sustituyen 18 de las 24 capas de atención del decoder Qwen2 por un operador lineal denominado RALALinearAttention (Rank-Augmented Linear Attention), manteniendo congelados el vision tower SigLIP, el proyector MLP y seis capas de atención cuadrática que actúan como anclas. El resultado es un artefacto de pesos de solo 259,69 MB frente a los 1,66 GB del modelo base en FP16, lo que supone una reducción del 84,7 %.

La motivación del autor es explorar la sustitución de atención cuadrática por alternativas lineales en modelos multimodales pequeños y medir el coste en calidad mediante destilación de representaciones. El checkpoint se ha afinado sobre el subconjunto con imágenes del dataset ScienceQA y reporta una accuracy del 45 % y una perplejidad de 3,16 en validación, partiendo de un baseline pre-destilación de 40 % y PPL 243,65, y con un techo de profesor (el modelo base sin modificar) del 63,75 %.

El modelo es relevante para quienes investigan eficiencia de atención, compresión de modelos VLM y técnicas de knowledge distillation, más que para despliegues de producción generalistas. Su tamaño reducido (0,5B parámetros en el decoder) y su licencia MIT lo hacen accesible para experimentación, aunque su alcance funcional está acotado al dominio STEM con imagen y al idioma inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (vision tower SigLIP congelado + proyector MLP de 2 capas + decoder Qwen2 de 24 capas con atención híbrida: 18 capas RALALinearAttention y 6 capas de atención cuadrática como anclas) |
| Parametros totales | no disponible (el decoder Qwen2 tiene D=1024, H=16, head_dim=64 y 24 capas; el recuento total no se declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se serializan en FP16; no se documentan esquemas de cuantización adicionales) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, formato attention_only_fp16) |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre de visión SigLIP de 27 capas congelada, un proyector multimodal MLP de dos capas y un decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La intervención del autor reemplaza la atención estándar en 18 de esas 24 capas por RALALinearAttention, un operador de la familia linear que aplica un mecanismo de atención lineal aumentado en rango. Se conservan como anclas cuadráticas seis capas concretas (índices 3, 7, 11, 15, 19 y 23), dando lugar a un patrón híbrido 3:1. Los MLPs, los embeddings, el proyector y la torre de visión permanecen intactos y congelados; solo se entrenan las atenciones modificadas y las layernorms del decoder.

El entrenamiento es una destilación de representaciones offline (NeuralOps Offline Representation Caching Architecture, §21.1) ejecutada en una única NVIDIA GeForce RTX 3090 de 24 GB, con 0 MB de VRAM reservados al profesor gracias a la caché de representaciones. Se realizaron 316 pasos de optimización en dos etapas (141 en la etapa 1 y 175 en la etapa 2), con una duración total de 120,5 segundos y un pico de VRAM de 13.959 MB. El dataset de evaluación y ajuste es derek-thomas/ScienceQA, en concreto el subconjunto con imágenes de temática STEM. No se documentan en la información disponible detalles sobre composición del dataset de entrenamiento, número de tokens, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) para preguntas y respuestas de tipo visual question answering.
- Razonamiento sobre contenido STEM con soporte de imagen, orientado al dataset ScienceQA.
- Conversación multimodal multi-turno mediante chat template incluido en el repositorio.
- Respuesta a preguntas de opción múltiple y explicativas sobre diagramas y figuras científicas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: modo thinking, visión adicional o audio no documentados; la única modalidad extra es la visión integrada vía SigLIP.

## Casos de uso

- Investigación en eficiencia de atención: el checkpoint permite comparar directamente una atención lineal aumentada en rango (RALA) frente a atención cuadrática en un VLM pequeño, usando las seis capas ancla como control interno y midiendo el impacto en accuracy y perplejidad sobre ScienceQA.
- Experimentos de compresión de modelos multimodales: sirve como artefacto de referencia para estudiar cuánta calidad se pierde al reducir un VLM de 1,66 GB a 259,69 MB (−84,7 %) mediante sustitución selectiva de capas y destilación.
- Docencia y prototipado de VQA educativa: con 0,5B parámetros en el decoder puede ejecutarse en GPUs de consumo para demostraciones de respuesta a preguntas sobre imágenes de libros de texto de ciencias.
- Reproducción de pipelines de knowledge distillation: el repositorio documenta telemetría completa (pasos, VRAM, duración) y permite reproducir la arquitectura de caché offline de representaciones del profesor en una sola RTX 3090.
- Benchmarking de operadores de atención: al integrarse en NeuralOps mediante `load_surgeried_model`, facilita evaluar variantes de atención (linear, hybrid_3_1) dentro de un mismo zoo de cirugía de atención.
- Estudio de robustez multimodal en dominios acotados: útil para analizar cómo se degrada la perplejidad (de 2,45 del profesor a 3,16 tras destilación) en tareas STEM con imagen y qué tipos de pregunta resisten mejor la sustitución de atención.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre ScienceQA, subconjunto con imágenes de temática STEM, split de validación:

| Metrica | Profesor (baseline) | Pre-destilacion (zero-shot) | Post-destilacion (final) | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 40,00 | 45,00 | +5,00 |
| Perplejidad (PPL) | 2,45 | 243,65 | 3,16 | −240,49 |

No se han publicado en la información disponible resultados de benchmarks estándar adicionales (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto de pesos ocupa 259,69 MB en FP16; sumando el vision tower SigLIP, el proyector y el resto del decoder, el modelo completo debería caber holgadamente en GPUs de 8-12 GB, aunque no se proporciona una cifra oficial de VRAM de inferencia.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente en la práctica; el autor entrenó en una NVIDIA GeForce RTX 3090 (24 GB) con un pico de 13.959 MB durante la destilación.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060/4060 (8-12 GB), RTX 4070 y RTX 4090; no se documentan requisitos mínimos oficiales.
- Opciones de despliegue: la librería indicada es `neuralops` (carga mediante `load_surgeried_model`); no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el autor solo reporta tiempos de entrenamiento (120,5 s para 316 pasos), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros (decoder) | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-rala-attention-scienceqa | Qwen2 0,5B, 24 capas (18 lineales + 6 cuadráticas) | no disponible | 45 % accuracy, PPL 3,16 (declarado) | MIT | Hugging Face, 31 descargas |
| llava-hf/llava-interleave-qwen-0.5b-hf (modelo base/profesor) | Qwen2 0,5B, 24 capas cuadráticas | no disponible | 63,75 % accuracy, PPL 2,45 (según el autor) | no disponible en esta ficha | Hugging Face |
| Otros VLM pequeños tipo LLaVA-1.5 / Qwen-VL de escala 0,5-1B | 0,5-1B | variable | no disponible | variable | Hugging Face |

La comparación más directa es con su propio modelo base, que actúa como profesor y supera al checkpoint destilado en 18,75 puntos de accuracy y en perplejidad (2,45 frente a 3,16), a cambio de un artefacto 6,55 veces mayor.

## Limitaciones y advertencias

- La accuracy final (45 %) queda muy por debajo del profesor (63,75 %), lo que refleja una pérdida de calidad sustancial por la sustitución de atención y la compresión.
- El modelo está especializado en ScienceQA y en el subconjunto STEM con imagen; su generalización a otras tareas multimodales no está documentada.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Riesgo de alucinación inherente a modelos generativos pequeños; no se documentan mitigaciones específicas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Longitud de contexto no documentada, lo que impide planificar despliegues con ventanas largas sin verificación previa.
- La licencia MIT permite uso comercial, pero el modelo base subyacente (llava-hf/llava-interleave-qwen-0.5b-hf) puede tener condiciones adicionales que deben revisarse por separado.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y provienen del propio autor; deben tratarse como indicativos.
- La dependencia de la librería `neuralops` y de un formato de pesos quirúrgico (`attention_only_fp16`) puede complicar la integración con stacks de inferencia convencionales.
- El modelo requiere reconstruir el grafo completo a partir del base más los deltas de atención; no es un checkpoint autónomo listo para usar con transformers estándar sin la herramienta NeuralOps.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-rala-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Implementación del operador RALALinearAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/rala_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
