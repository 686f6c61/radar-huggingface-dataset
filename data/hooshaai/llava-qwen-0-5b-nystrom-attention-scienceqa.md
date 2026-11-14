# Hooshaai/llava-qwen-0.5b-nystrom-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-nystrom-attention-scienceqa` es un checkpoint multimodal de tipo vision-lenguaje derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el autor Hooshaai dentro del ecosistema NeuralOps (Attention Surgery Zoo). El modelo no es un entrenamiento desde cero, sino una intervención quirúrgica sobre la atención del decoder: se sustituye la atención cuadrática estándar por un operador Nyström (`nystrom_attention`, familia lineal) en 18 de las 24 capas del decoder Qwen2, manteniendo seis capas ancla cuadráticas y congelando la torre visual SigLIP y el proyector MLP.

El objetivo es reducir el coste computacional y el tamaño del artefacto manteniendo la calidad mediante destilación de conocimiento (knowledge distillation) sobre el subconjunto con imagen de ScienceQA. El resultado reportado es un artefacto de pesos de solo 147,61 MB (frente a 1,66 GB del base en FP16, un 91,3 % menos) con una precisión del 56,25 % en el split de validación de ScienceQA, frente al 63,75 % del profesor original y el 40,62 % del modelo sin destilar.

Es relevante para quienes investigan eficiencia en VLM, sustitución de atención por aproximaciones lineales y técnicas de destilación con caché offline de representaciones, ya que documenta de forma reproducible el proceso de cirugía de atención, el manifiesto de tensores guardados y las métricas de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas con atención Nyström en 18/24 capas (esquema híbrido `hybrid_3_1`) |
| Parámetros totales | no disponible (base LLaVA-Qwen-0.5B; el artefacto guardado contiene 282 tensores de atención con 147,61 MB en FP16) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16; `weights_format=attention_only_fp16`) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) + `surgical_manifest.json` + `config.json`; requiere la librería `neuralops` para cargar |

## Arquitectura y entrenamiento

El modelo parte de `llava-hf/llava-interleave-qwen-0.5b-hf`, que combina una torre visual SigLIP de 27 capas (congelada), un proyector MLP de 2 capas (congelado) y un decoder Qwen2 de 24 capas con dimensión oculta D=1024, 16 cabezas y head_dim=64. La intervención sustituye la self-attention en 18 de las 24 capas del decoder por `NystromAttention`, un operador de la familia lineal que aplica Nyströmformer con chunked causal Nyström para decoders. Se conservan seis capas cuadráticas ancla en los índices [3, 7, 11, 15, 19, 23], configurando un esquema híbrido `hybrid_3_1`. También se entrenan las layernorms del decoder; los MLP, embeddings y la torre visual permanecen congelados.

El ajuste se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), lo que permitió entrenar sin mantener el profesor en VRAM (0 MB de VRAM de profesor). El entrenamiento se ejecutó en una NVIDIA GeForce RTX 3090 (24 GB) con 175 pasos de optimización (66 en etapa 1, 109 en etapa 2), una duración total de 120,6 s y un pico de VRAM de 14.366 MB. El conjunto de evaluación y ajuste es el subconjunto con imagen de ScienceQA (split de validación) del dataset `derek-thomas/ScienceQA`.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en formato conversacional.
- Respuesta a preguntas visuales de tipo STEM (ciencia, tecnología, ingeniería y matemáticas) sobre el dominio de ScienceQA.
- Razonamiento multimodal básico: interpretación de diagramas e ilustraciones científicas junto con texto de la pregunta.
- Soporte de chat multi-turno mediante plantilla de chat incluida (`chat_template.json`).
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo en la información disponible.

## Casos de uso

- Evaluación de aproximaciones lineales de atención en VLM: el checkpoint sirve como referencia reproducible para medir la pérdida de precisión al sustituir atención cuadrática por Nyström en 18/24 capas, con métricas de accuracy y perplexity publicadas.
- Investigación en destilación con caché offline: permite reproducir el flujo de NeuralOps (§21.1) para destilar un VLM pequeño en una sola RTX 3090 sin mantener el profesor en memoria.
- Prototipado de asistentes educativos de ciencias: responde preguntas visuales sobre ilustraciones STEM en inglés, adecuado para demos de tutores automáticos de bajo coste.
- Despliegue en entornos con recursos muy limitados: el artefacto de pesos ocupa 147,61 MB, lo que facilita su empaquetado en contenedores o distribución en pipelines de CI para pruebas.
- Benchmarking de cirugía de atención: comparar el rendimiento del operador `nystrom_attention` frente a otras variantes del Attention Surgery Zoo sobre el mismo dataset y base.
- Estudio de esquemas híbridos de atención: analizar el efecto de mantener seis capas cuadráticas ancla frente a una sustitución total, usando la configuración `hybrid_3_1` como caso de estudio.
- Base para fine-tuning específico de dominio: al estar bajo licencia MIT y partir de un modelo de 0.5B, puede adaptarse a tareas de VQA científica con recursos modestos.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre ScienceQA (Image-Bearing STEM Subset, validation):

| Métrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 40,62 | 56,25 | +15,63 |
| Perplexity (PPL) | 2,45 | 38,42 | 2,50 | -35,92 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó un pico de 14.366 MB en una RTX 3090 (24 GB). El artefacto de pesos ocupa 147,61 MB, pero requiere cargar la base `llava-hf/llava-interleave-qwen-0.5b-hf` y la librería `neuralops`.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (validada por el autor); para modelos de 0.5B en FP16 se puede asumir que cabe en GPUs consumer con al menos 8-12 GB, aunque no está confirmado en la información disponible.
- Cabe en GPU consumer: sí, según la telemetría de entrenamiento en RTX 3090; no se documentan pruebas en GPUs de gama inferior.
- Opciones de despliegue: la carga se realiza mediante `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/llava-qwen-0.5b-nystrom-attention-scienceqa | base 0.5B (artefacto de atención 147,61 MB) | no disponible | 56,25 % accuracy / 2,50 PPL | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0.5B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en la información | Hugging Face |
| Otras variantes del Attention Surgery Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La precisión final (56,25 %) es inferior a la del profesor (63,75 %): la cirugía de atención introduce una pérdida de calidad de 7,5 puntos porcentuales en ScienceQA.
- El modelo está ajustado y evaluado únicamente sobre el subconjunto con imagen de ScienceQA; su generalización a otros dominios visuales no está documentada.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- Riesgo de alucinación inherente a modelos generativos de 0.5B, especialmente en preguntas científicas fuera del dominio de entrenamiento.
- Los benchmarks están marcados como no verificados (`verified: false`) y proceden del propio autor.
- El checkpoint contiene solo los pesos de atención modificados (`attention_only_fp16`, 282 tensores); requiere la base y la librería `neuralops` para funcionar, lo que limita su portabilidad frente a un safetensors estándar.
- No se documentan sesgos específicos ni evaluaciones de seguridad.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`, no indicada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-nystrom-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de NystromAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/nystrom_attention.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
