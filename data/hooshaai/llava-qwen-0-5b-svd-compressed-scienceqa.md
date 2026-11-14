# Hooshaai/llava-qwen-0.5b-svd-compressed-scienceqa

## Resumen

`llava-qwen-0.5b-svd-compressed-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el usuario Hooshaai dentro del marco NeuralOps "Attention Surgery Zoo". No es un modelo entrenado desde cero, sino un artefacto de compresión quirúrgica: sustituye las proyecciones de auto-atención de 18 de las 24 capas del decodificador Qwen2 por variantes con SVD truncada (`SVDCompressedAttention`), mantiene seis capas de anclaje cuadráticas intactas y aplica destilación de conocimiento desde el modelo profesor para recuperar parte de la calidad perdida.

El objetivo del modelo es demostrar que se puede reducir drásticamente el peso de los tensores de atención de un VLM pequeño (de 1,66 GB a 58,79 MB en el artefacto serializado, un 96,5 % menos) manteniendo un rendimiento razonable en razonamiento visual sobre ScienceQA. El checkpoint solo contiene los pesos modificados de atención y los layernorms del decodificador, no el modelo completo: el resto de componentes (torre de visión SigLIP, proyector multimodal, MLPs y embeddings) se cargan desde el modelo base.

Es relevante ahora como pieza de investigación reproducible en técnicas de compresión de atención (SVD, LoRA, GQA, RoPE) aplicadas a VLMs de 0,5B, y como ejemplo de empaquetado modular vía `neuralops`. No está pensado como modelo de producción generalista: su licencia es MIT, su único idioma declarado es el inglés y su evaluación se limita a un subconjunto de validación de ScienceQA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64); atención con SVD truncada en 18/24 capas |
| Parametros totales | no disponible (el modelo base es de 0,5B; el artefacto empaquetado pesa 58,79 MB en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se serializan en FP16; `weights_format=attention_only_fp16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT (enlace a `github.com/tahamajs/NeuralOps/blob/main/LICENSE`) |
| Formato de pesos | safetensors (`attention_weights.safetensors`, FP16, 426 tensores) + `surgical_manifest.json` (schema `neuralops.surgery/v2`) |

## Arquitectura y entrenamiento

El modelo base es `llava-interleave-qwen-0.5b-hf`: un VLM con torre de visión SigLIP congelada, un proyector MLP de dos capas que mapea los tokens visuales al espacio del decodificador y un transformer Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y dimensión de cabeza 64. Sobre esa base, la cirugía `svd_compressed` reemplaza la auto-atención de 18 capas (esquema `hybrid_3_1`) por `SVDCompressedAttention`, que aplica proyecciones SVD truncadas con adaptadores LoRA entrenables, soporte de GQA y RoPE, y residuales dispersos opcionales. Las seis capas de anclaje `[3, 7, 11, 15, 19, 23]` conservan atención cuadrática completa. Se congelan la torre de visión, el proyector, los MLP y los embeddings; solo se guardan las atenciones modificadas y los layernorms del decodificador.

El entrenamiento consistió en destilación de conocimiento en dos etapas (64 + 103 pasos, 167 en total) sobre una NVIDIA RTX 3090 de 24 GB, con un tiempo total de 120,6 s y un pico de VRAM de 16.872 MB. El dataset es `derek-thomas/ScienceQA`, evaluado en el subconjunto de validación con imágenes. El resultado: la precisión pasa del 39,38 % (zero-shot tras la cirugía) al 43,75 % tras la destilación, y la perplejidad baja de 4,36 a 3,13, frente al 63,75 % y 2,45 del profesor original.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (`image-text-to-text`).
- Respuesta a preguntas visuales de tipo STEM (ScienceQA): interpretación de figuras y selección de opción.
- Razonamiento multimodal básico sobre imágenes de 384×384 procesadas por el preprocesador SigLIP.
- Formato de chat mediante `chat_template.json` y tokens especiales de imagen (`<image>`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está evaluado en tareas de un solo turno.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, audio, vídeo): no disponibles.

## Casos de uso

- Investigación en compresión de atención: sirve como referencia reproducible para medir la pérdida de precisión al sustituir atención completa por SVD truncada con LoRA en un VLM de 0,5B, usando ScienceQA como banco de pruebas.
- Destilación de conocimiento sobre VLMs pequeños: el par profesor/alumno (63,75 % → 43,75 %) permite estudiar curvas de recuperación con pocos pasos (167) y hardware consumer.
- Prototipado de asistentes educativos STEM: dado su rendimiento en preguntas con figura y opción múltiple, encaja en demos de tutoría sobre imágenes de libros de texto, siempre con validación humana.
- Evaluación de pipelines NeuralOps: útil para probar la API `neuralops.hub.load_surgeried_model` y el formato `surgical_manifest.json` en flujos de carga modular de pesos.
- Benchmarking de técnicas de cirugía de atención: comparar `svd_compressed` con otras variantes del zoo (por ejemplo, atención lineal o dispersa) sobre el mismo subconjunto de ScienceQA.
- Docencia y divulgación: ejemplo didáctico de cómo un checkpoint de 58,79 MB puede reconstruirse junto al modelo base para ejecutar inferencia multimodal en una sola GPU de 24 GB.
- Investigación sobre eficiencia de artefactos: medir el impacto del empaquetado selectivo (solo atenciones + layernorms) en el tamaño de distribución y en el tiempo de carga.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`). Evaluación sobre `derek-thomas/ScienceQA`, subconjunto de validación con imágenes.

| Métrica | Profesor (base) | Zero-shot tras cirugía | Final tras destilación | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 39,38 | 43,75 | +4,37 |
| Perplexity | 2,45 | 4,36 | 3,13 | −1,23 |

Telemetría de entrenamiento: 167 pasos (64 etapa 1 + 103 etapa 2), 120,6 s, pico de 16.872 MB de VRAM en RTX 3090.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 16.872 MB en una RTX 3090. Al tratarse de un VLM de 0,5B con torre SigLIP congelada, la inferencia en FP16 debería caber holgadamente en GPUs consumer de 8-12 GB, aunque no se aporta medición oficial.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento); cualquier GPU con al menos 8 GB de VRAM es candidata razonable para inferencia, sin dato confirmado.
- Cabe en GPU consumer: sí, según el perfil de entrenamiento en RTX 3090; no hay cifras de inferencia publicadas.
- Opciones de despliegue: la model card solo documenta la API `neuralops.hub.load_surgeried_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; la naturaleza modular del checkpoint (solo atenciones + layernorms) exige cargar el modelo base junto al delta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-svd-compressed-scienceqa` | ~0,5B (base) | no disponible | 43,75 % acc / 3,13 PPL | MIT | Hugging Face, 25 descargas |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % acc / 2,45 PPL | no disponible en la información | Hugging Face |
| Otras variantes del zoo NeuralOps | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos externos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo completo: solo incluye pesos de atención modificados y layernorms; requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para funcionar, lo que complica el despliegue fuera de NeuralOps.
- Pérdida de calidad significativa: 20 puntos porcentuales de accuracy frente al profesor (43,75 % vs 63,75 %) en ScienceQA.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de un modelo base entrenado con datos web, es previsible que herede sesgos, pero no hay análisis publicado.
- Riesgo de alucinación: no evaluado; el modelo está entrenado para responder opciones de ScienceQA, no para diálogo abierto verificado.
- Limitaciones de idioma: solo inglés declarado.
- Limitaciones de contexto: longitud de contexto no disponible.
- Restricciones de licencia: MIT, permite uso comercial, pero el modelo base puede tener condiciones propias no detalladas en la información.
- Caveat de producción: los resultados no están verificados (`verified: false`) y provienen de un único subconjunto de validación; no hay evaluación en otros benchmarks ni en tareas fuera de ScienceQA.
- Fecha de creación declarada: 2026-11-11, posterior a la fecha de consulta habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-svd-compressed-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `SVDCompressedAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_compressed.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
