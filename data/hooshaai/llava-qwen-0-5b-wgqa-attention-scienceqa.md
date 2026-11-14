# Hooshaai/llava-qwen-0.5b-wgqa-attention-scienceqa

## Resumen

llava-qwen-0.5b-wgqa-attention-scienceqa es un checkpoint multimodal de tipo vision-lenguaje publicado por el usuario Hooshaai bajo el marco de trabajo NeuralOps. Se deriva del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`, un LLaVA que combina una torre visual SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64). La intervención quirúrgica sustituye el mecanismo de atención en 18 de las 24 capas del decodificador por una variante denominada WeightedGroupedQueryAttention (WGQA), que incorpora pesos de importancia aprendibles por cabeza KV, junto con LoRA y máscara causal.

El modelo está entrenado específicamente para responder preguntas visuales de tipo STEM sobre ScienceQA, un conjunto de datos académico con imágenes. Su relevancia no reside tanto en el rendimiento absoluto (43,75% de accuracy en el subconjunto con imagen de validación) como en la demostración metodológica: el autor documenta una cirugía de atención con destilación de conocimiento en dos etapas que recupera +13,12 puntos porcentuales sobre el checkpoint pre-destilación y reduce la perplejidad de 252.731,75 a 3,09 en apenas 311 pasos de optimización y 120,5 segundos sobre una única RTX 3090.

El paquete es deliberadamente compacto: los pesos serializados ocupan 92,72 MB en safetensors FP16, un 94,6% menos que el modelo base completo (1,66 GB), porque solo se guardan las atenciones modificadas y las capas de normalización entrenadas. Es, por tanto, un artefacto de investigación sobre eficiencia y compresión de atención más que un modelo listo para producción general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA multimodal: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atención WGQA en 18 capas |
| Parametros totales | no disponible (el artefacto serializado contiene 318 tensores, 92,72 MB en FP16; el modelo base completo ocupa 1,66 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; formato `attention_only_fp16`) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, solo atención y layernorms modificados), más `surgical_manifest.json` y ficheros de tokenizer |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada que extrae características de la imagen, un proyector MLP de dos capas que las alinea con el espacio del decodificador, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y head_dim 64. La modificación quirúrgica reemplaza la atención estándar en 18 de las 24 capas por WeightedGroupedQueryAttention, que añade pesos de importancia aprendibles por cabeza KV sobre el esquema de grouped-query attention, manteniendo caché KV y máscara causal. Se conservan seis capas "ancla" con atención cuadrática original en los índices [3, 7, 11, 15, 19, 23], siguiendo un patrón híbrido 3:1. La torre visual, el proyector, los MLP del decodificador y los embeddings permanecen congelados y no se incluyen en el artefacto serializado.

El entrenamiento consistió en destilación de conocimiento en dos etapas (139 + 172 = 311 pasos) sobre ScienceQA, con un total de 120,5 segundos y un pico de 15.339 MB de VRAM en una RTX 3090. El profesor fue el modelo base original (63,75% de accuracy) y el alumno el checkpoint con atención sustituida. Los resultados documentados muestran que el alumno zero-shot sin destilación cae al 30,63% de accuracy con perplejidad de 252.731,75, y tras la destilación alcanza 43,75% de accuracy y 3,09 de perplejidad. No se especifica la composición exacta del dataset de destilación, el número de tokens vistos ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM: el modelo está ajustado específicamente sobre ScienceQA, con preguntas de ciencia, tecnología, ingeniería y matemáticas que incluyen figuras.
- Formato conversacional con plantilla de chat incluida (`chat_template.json`).
- Razonamiento de opción múltiple: el prompt de ejemplo pide responder con la letra de la opción.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés declarado.
- Modo thinking, visión adicional, audio: no disponible.

## Casos de uso

- Evaluación de técnicas de cirugía de atención: el checkpoint sirve como referencia reproducible para comparar WGQA frente a atención estándar en un decodificador pequeño, con métricas de accuracy y perplejidad documentadas y un manifiesto quirúrgico que detalla qué tensores se modificaron.
- Investigación en destilación de conocimiento sobre modelos multimodales: el par profesor-alumno (63,75% vs 43,75%) y la telemetría de entrenamiento (311 pasos, 120,5 s, 15,3 GB de VRAM) permiten reproducir el experimento en una sola GPU de consumo.
- Prototipado de asistentes educativos STEM: para preguntas de ciencia con figura y respuesta de opción múltiple, el modelo puede integrarse en un pipeline de demostración que reciba imagen y enunciado y devuelva la letra de la opción.
- Estudio de compresión de artefactos: el paquete de 92,72 MB frente a los 1,66 GB del base ilustra una estrategia de distribución de solo deltas de atención, útil para investigar despliegues con presupuesto de almacenamiento muy ajustado.
- Benchmarking de marcos de inferencia: al ser un artefacto NeuralOps con manifiesto `neuralops.surgery/v2`, sirve para validar la carga y ejecución de checkpoints quirúrgicos en dicho ecosistema.
- Docencia y formación: como ejemplo didáctico de sustitución de módulos de atención, LoRA y destilación en un VLM pequeño, es adecuado para cursos avanzados de arquitecturas transformer multimodales.
- No se recomienda su uso en atención al cliente, generación de código en producción ni agentes autónomos: el modelo está especializado en ScienceQA y no documenta capacidades generales.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Profesor (base) | Alumno pre-destilacion | Alumno final | Delta |
|---|---:|---:|---:|---:|
| Accuracy ScienceQA (%) | 63,75 | 30,63 | 43,75 | +13,12 |
| Perplejidad | 2,45 | 252.731,75 | 3,09 | -252.728,66 |

El conjunto evaluado es el subconjunto de validación de ScienceQA con imágenes (Image-Bearing STEM Subset) del dataset `derek-thomas/ScienceQA`. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma oficial. El entrenamiento usó 15.339 MB de pico en una RTX 3090, pero ese dato corresponde a destilación, no a inferencia.
- Al ser un modelo de aproximadamente 0,5B parámetros en el decodificador más una torre SigLIP, cabe previsiblemente en GPUs de consumo de 8-16 GB en FP16, aunque no hay cifras publicadas que lo confirmen.
- GPU recomendadas: RTX 3090 (la única documentada en el entrenamiento); no hay datos para A100, H100 o RTX 4090.
- Opciones de despliegue: el modelo se carga mediante `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-wgqa-attention-scienceqa | ~0,5B (decodificador) | no disponible | 43,75% accuracy, PPL 3,09 | MIT | Hugging Face (NeuralOps) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base) | ~0,5B | no disponible | 63,75% accuracy, PPL 2,45 (declarado por el autor) | no disponible en la información | Hugging Face |
| Otros VLM pequeños de la familia LLaVA-Qwen | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la información proporcionada no incluye datos de otras alternativas comparables. El modelo quirúrgico pierde 20 puntos de accuracy frente a su profesor, lo que sitúa su utilidad en el terreno de la investigación más que en el de la sustitución directa del base.

## Limitaciones y advertencias

- Rendimiento muy por debajo del modelo base: 43,75% frente a 63,75% de accuracy en ScienceQA, una pérdida de 20 puntos porcentuales.
- Especialización estrecha: entrenado exclusivamente sobre ScienceQA; no hay evidencia de capacidades generales de conversación, código o matemáticas fuera de ese dominio.
- Solo inglés: no se declara soporte de otros idiomas.
- Riesgo de alucinación: no evaluado en la información disponible; un modelo de 0,5B con ajuste específico sobre opción múltiple puede fallar fuera de distribución.
- Sesgos: no documentados.
- Licencia MIT, lo que permite uso comercial, pero el modelo base subyacente (`llava-hf/llava-interleave-qwen-0.5b-hf`) tiene su propia licencia no detallada en la información proporcionada; conviene verificarla antes de un uso comercial.
- El artefacto no contiene los pesos completos: solo incluye las atenciones modificadas y las layernorms entrenadas, por lo que requiere el modelo base y el entorno NeuralOps para cargarse.
- Resultados no verificados: las métricas del model-index están marcadas como `verified: false` y proceden del propio autor.
- Fecha de publicación futura (2026-11-11) en los metadatos, lo que sugiere que el repositorio puede ser un artefacto de investigación no mantenido.
- Sin datos de longitud de contexto, cuantización ni latencia, lo que dificulta planificar un despliegue en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-wgqa-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de WGQA: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/modern/wgqa_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
