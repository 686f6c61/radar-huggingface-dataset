# Hooshaai/llava-qwen-0.5b-svd-projection-attention-scienceqa

## Resumen
llava-qwen-0.5b-svd-projection-attention-scienceqa es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps "Attention Surgery Zoo". No se trata de un modelo entrenado desde cero, sino de una intervención quirúrgica sobre llava-hf/llava-interleave-qwen-0.5b-hf: se sustituye el mecanismo de atención multi-cabeza por una variante denominada SVDProjectionAttention, que factoriza las proyecciones lineales mediante descomposición en valores singulares (SVD) en 18 de las 24 capas del decodificador Qwen2, manteniendo congelados el tower visual SigLIP, el proyector multimodal y seis capas ancla de atención cuadrática.

El objetivo del experimento es evaluar cuánto rendimiento se pierde al comprimir la atención de un VLM pequeño y cuánto se recupera mediante destilación de conocimiento (KD) en dos etapas. El resultado declarado es una precisión del 43,75 % en el subconjunto con imagen de ScienceQA (validation) y una perplexity de 3,06, frente a 30,00 % / 5,22 en el estado pre-KD y 63,75 % / 2,45 del modelo profesor.

Es relevante ahora porque el artefacto publica únicamente los pesos delta de atención (46,36 MB en FP16), un 97,3 % menos que el base completo (1,66 GB), lo que permite distribuir variantes de atención como parches modulares sobre el checkpoint original. La librería es neuralops, la licencia MIT y el idioma declarado únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: tower visual SigLIP congelado (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención sustituida por SVDProjectionAttention en 18/24 capas |
| Parametros totales | no disponible (el repo contiene solo pesos delta de atención: 336 tensores, 48.617.064 bytes) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible; los pesos delta se serializan en FP16 (`weights_format=attention_only_fp16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), acompañado de `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento
La arquitectura base es un LLaVA interleaved de 0,5B con tower visual SigLIP congelado, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La intervención reemplaza la atención estándar por SVDProjectionAttention, que factoriza las proyecciones lineales mediante SVD; según la model card, la versión corrige problemas previos: fallback Triton en SVDProjectionLinear para CPU/MPS, gestión nativa de GQA mediante SDPA, eliminación del padding silencioso de salida (ahora lanza RuntimeError ante desajuste de forma), eliminación del casting forzado a FP16 y manejo de errores en el fallback de SDPA.

El alcance quirúrgico es de 18 de 24 capas (patrón `hybrid_3_1`), modificando y guardando `language_model.model.layers.{i}.self_attn` junto con los layernorms del decodificador entrenados. Permanecen congelados y excluidos el tower visual SigLIP (27 capas), el proyector multimodal, las 6 capas ancla cuadráticas [3, 7, 11, 15, 19, 23], los MLP del decodificador y los embeddings. El entrenamiento consistió en destilación de conocimiento en dos etapas (137 + 166 pasos, 303 en total) sobre una NVIDIA RTX 3090 de 24 GB, con 120,1 s de duración, 14.998 MB de VRAM pico y dataset derek-thomas/ScienceQA. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicó RLHF o DPO.

## Capacidades
- Generación de texto e imagen-a-texto (pipeline `image-text-to-text`): responde a preguntas en lenguaje natural condicionadas por una imagen de entrada.
- Razonamiento visual sobre contenido STEM: el ajuste se realizó específicamente sobre ScienceQA, subconjunto con imágenes de ciencia.
- Conversación multi-turno: incluye `chat_template.json` y está etiquetado como `conversational`.
- Compresión modular de atención: al publicar únicamente pesos delta de atención, permite intercambiar variantes de atención sobre el checkpoint base sin redistribuir el modelo completo.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Modo thinking, audio o otras modalidades: no disponibles; solo visión y texto.

## Casos de uso
- Investigación sobre eficiencia de atención en VLMs: permite comparar el rendimiento de SVDProjectionAttention frente a la atención original en un modelo de 0,5B, sirviendo como referencia reproducible para estudiar el trade-off compresión-precisión sin entrenar desde cero.
- Destilación de conocimiento aplicada a VLMs pequeños: el par (profesor 63,75 %, alumno post-KD 43,75 %) documenta el efecto de 303 pasos de KD sobre un modelo comprimido, útil para calibrar pipelines de destilación en entornos con una sola GPU de 24 GB.
- Despliegue de parches de atención en producción experimental: al pesar 46,36 MB frente a 1,66 GB del base, el delta puede distribuirse junto con el checkpoint original para probar variantes de atención en entornos con ancho de banda limitado.
- Evaluación comparativa de atención sobre ScienceQA: el checkpoint está evaluado en el subconjunto con imagen de ScienceQA (validation), por lo que sirve como punto de comparación para ablaciones de mecanismos de atención en tareas STEM multimodales.
- Docencia y reproducción de "attention surgery": el manifiesto `surgical_manifest.json` y los scripts de NeuralOps documentan qué prefijos se modifican y cuáles se congelan, lo que facilita reproducir el experimento en un curso o laboratorio.
- Prototipado rápido de asistentes visuales en inglés: con 0,5B parámetros y una huella de pesos reducida, puede servir para validar flujos de pregunta-respuesta sobre imágenes antes de escalar a modelos mayores.

## Benchmarks y rendimiento
Resultados declarados por el autor en la model card (no verificados):

| Métrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) — ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 30,00 | 43,75 | +13,75 |
| Perplexity — ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 5,22 | 3,06 | -2,16 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas en la información disponible.

## Requisitos de hardware
- Entrenamiento documentado: NVIDIA RTX 3090 (24 GB), con 14.998 MB de VRAM pico y 120,1 s para 303 pasos.
- VRAM de inferencia: no disponible en la información proporcionada; al tratarse de un modelo base de 0,5B con tower SigLIP, la huella completa en FP16 es del orden de 1,66 GB según el propio autor.
- GPU recomendadas: no disponibles; por tamaño, cualquier GPU consumer con al menos 4-6 GB debería poder alojar el base en FP16, pero este dato no está confirmado en la información.
- Despliegue: la librería declarada es `neuralops`; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (validation, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-svd-projection-attention-scienceqa (este) | 0,5B (base) | no disponible | 43,75 % acc / 3,06 PPL | MIT | Hugging Face (repo 0,1 GB, delta 46,36 MB) |
| llava-hf/llava-interleave-qwen-0.5b-hf (base/profesor) | 0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face (1,66 GB) |
| Otros VLMs pequeños (p. ej. Qwen2-VL-2B, SmolVLM) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base y al resultado del profesor reportado por el autor; no se dispone de datos de terceros verificables.

## Limitaciones y advertencias
- Pérdida de precisión significativa: 43,75 % frente al 63,75 % del profesor, una caída de 20 puntos porcentuales pese a la recuperación de 13,75 puntos vía KD.
- Perplexity superior al base (3,06 vs 2,45), lo que indica menor confianza en la distribución de salida.
- Idioma limitado al inglés; no se declara soporte multilingüe.
- Contexto no documentado; no debe asumirse una ventana larga sin verificación.
- El repo contiene únicamente pesos delta de atención (336 tensores); no es un checkpoint completo y requiere el base llava-hf/llava-interleave-qwen-0.5b-hf para funcionar.
- Resultados de benchmark no verificados (`verified: false` en model-index); proceden del autor y no han sido reproducidos por terceros.
- Entrenamiento muy corto (303 pasos, 120 s) sobre un único dataset (ScienceQA), lo que limita la generalización fuera del dominio STEM.
- Riesgo de alucinación no cuantificado en la información disponible.
- Licencia MIT permite uso comercial, pero el modelo base subyacente puede tener condiciones adicionales que deben revisarse antes de producción.
- Librería `neuralops` poco extendida; la integración con stacks estándar (Transformers, vLLM) no está documentada en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-svd-projection-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación SVDProjectionAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_projection_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
