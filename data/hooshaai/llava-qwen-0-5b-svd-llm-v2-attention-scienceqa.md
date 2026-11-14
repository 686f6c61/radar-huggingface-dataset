# Hooshaai/llava-qwen-0.5b-svd-llm-v2-attention-scienceqa

## Resumen

`llava-qwen-0.5b-svd-llm-v2-attention-scienceqa` es un checkpoint multimodal de tipo vision-language derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una técnica de cirugía de atención denominada `svd_llm_v2_attention`, desarrollada por el autor Hooshaai dentro del ecosistema NeuralOps. No se trata de un modelo entrenado desde cero, sino de un artefacto de investigación que factoriza por SVD las capas de auto-atención de 18 de las 24 capas del decodificador Qwen2 y las sustituye por una representación comprimida con adaptadores LoRA entrenables para recuperar capacidad.

El modelo combina tres piezas: una torre de visión SigLIP congelada de 27 capas, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión de cabeza 64. La intervención quirúrgica se aplica en 18 capas bajo un patrón `hybrid_3_1`, dejando seis capas de anclaje cuadráticas intactas (índices 3, 7, 11, 15, 19 y 23), además de los MLP, embeddings y la torre de visión sin modificar.

Su relevancia es fundamentalmente metodológica: demuestra que es posible reducir el artefacto de pesos a 94,82 MB (frente a 1,66 GB del modelo base en FP16, un 94,4 % menos) y recuperar buena parte del rendimiento mediante destilación de conocimiento en dos etapas sobre el subconjunto de ScienceQA con imágenes. El resultado final es modesto en calidad (38,12 % de precisión frente al 63,75 % del profesor), por lo que debe entenderse como una prueba de concepto de compresión de atención más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre de visión SigLIP (27 capas, congelada) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64) con atención factorizada por SVD en 18 capas |
| Parametros totales | No disponible (el artefacto serializado contiene 498 tensores de atención y layernorms; el modelo base LLaVA-Qwen-0.5B ronda los 0,5 B en el decodificador, pero el total exacto no se declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos se publican en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (FP16, solo atención y layernorms del decodificador), más `surgical_manifest.json`, `config.json` y tokenizer asociado; requiere la librería `neuralops` para cargar |

## Arquitectura y entrenamiento

La arquitectura de partida es LLaVA interleaved sobre Qwen2-0.5B: un encoder visual SigLIP congelado que produce embeddings de imagen, un proyector MLP que los alinea con el espacio del decodificador de lenguaje, y un transformer decoder Qwen2 de 24 capas con atención causal estándar. Sobre esta base, la cirugía `svd_llm_v2_attention` reemplaza la proyección QKV y la proyección de salida de la atención en 18 capas por una factorización SVD explícita con buffers U, Sigma y V^H, acompañada de adaptadores LoRA entrenables que compensan la pérdida de rango. Las capas de anclaje `[3, 7, 11, 15, 19, 23]` conservan atención cuadrática completa, así como los MLP, los embeddings y la torre de visión.

El entrenamiento se realizó en dos etapas de destilación de conocimiento desde el modelo profesor original, con 274 pasos totales (120 en la etapa 1, 154 en la etapa 2) y un tiempo de cómputo de 120,2 segundos sobre una única NVIDIA RTX 3090 de 24 GB, con un pico de VRAM de 17.252 MB. El conjunto de evaluación y ajuste es el subconjunto con imágenes del split de validación de ScienceQA (`derek-thomas/ScienceQA`). No se documentan el número de tokens de entrenamiento, la composición completa del dataset más allá de ScienceQA, ni si se aplicaron técnicas de RLHF o DPO; tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal más allá de la propia factorización SVD.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales de tipo STEM, especialmente preguntas de opción múltiple sobre figuras científicas.
- Razonamiento multimodal básico sobre diagramas e ilustraciones de ScienceQA.
- Formato conversacional con plantilla de chat incluida (`chat_template.json`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni de razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan modos especiales como thinking mode, audio o vídeo.

## Casos de uso

- Investigación en compresión de modelos: sirve como banco de pruebas reproducible para medir el impacto de la factorización SVD de atención sobre un VLM pequeño, comparando el checkpoint pre-KD (37,50 % de precisión, PPL 11,61) con el post-KD (38,12 %, PPL 3,04).
- Docencia y divulgación sobre cirugía de atención: el `surgical_manifest.json` y el `config.json` documentan la topología exacta de capas modificadas, lo que facilita explicar cómo se sustituye una atención cuadrática por una factorización de rango reducido.
- Prototipado rápido en entornos con VRAM limitada: al pesar 94,82 MB en disco y requerir solo una RTX 3090 para el ajuste, permite iterar sobre variantes de compresión sin grandes infraestructuras.
- Evaluación comparativa de técnicas de destilación: el par de métricas accuracy/perplexity sobre ScienceQA permite contrastar estrategias de KD en dos etapas frente a alternativas de un solo paso.
- Generación de respuestas de opción múltiple sobre figuras científicas en pipelines de experimentación, aceptando la precisión moderada del modelo como coste asumible del ejercicio de compresión.
- Integración en flujos de investigación con la API `neuralops.hub.load_surgeried_model`, que carga el checkpoint quirúrgico junto con su procesador de imagen y texto para reproducir exactamente los resultados publicados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre ScienceQA, subconjunto con imágenes, split de validación:

| Metrica | Profesor (base) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 37,50 | 38,12 | +0,62 |
| Perplexity | 2,45 | 11,61 | 3,04 | -8,57 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el ajuste con destilación consumió 17.252 MB de pico en una RTX 3090, lo que da una referencia del orden de magnitud del entrenamiento, no de la inferencia.
- GPU recomendadas: NVIDIA RTX 3090 (24 GB) es la única documentada para el proceso de ajuste; para inferencia se espera que quepa en GPUs consumer de gama media-alta, aunque no se aportan cifras concretas.
- Cabe en GPU consumer: sí, según la telemetría de entrenamiento en RTX 3090; no se especifican modelos inferiores.
- Opciones de despliegue: la única vía documentada es la API `neuralops.hub.load_surgeried_model` de la librería `neuralops`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA (img) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-svd-llm-v2-attention-scienceqa` | ~0,5 B (decodificador) | No disponible | 38,12 % accuracy / PPL 3,04 | MIT | Hugging Face (25 descargas) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B (decodificador) | No disponible | 63,75 % accuracy / PPL 2,45 | No disponible en la información | Hugging Face |
| Checkpoint pre-KD del mismo autor | ~0,5 B (decodificador) | No disponible | 37,50 % accuracy / PPL 11,61 | MIT | Derivado del mismo pipeline |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Precisión muy inferior al modelo profesor: 38,12 % frente a 63,75 % en ScienceQA, una caída de más de 25 puntos porcentuales que limita su uso en aplicaciones reales.
- Ámbito de evaluación restringido a un único benchmark (ScienceQA, subconjunto con imágenes) y a un único split (validación); no hay evidencia de generalización a otras tareas visuales.
- Idiomas: solo inglés, sin soporte documentado de castellano ni de otras lenguas.
- Riesgo de alucinación: no cuantificado por el autor; la perplexity de 3,04 sugiere calibración razonable en el dominio evaluado, pero no hay estudios fuera de distribución.
- Sesgos conocidos: no documentados en la model card.
- Licencia MIT, lo que permite uso comercial, pero el checkpoint depende de la librería `neuralops` y del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`, cuyas condiciones deben verificarse por separado.
- El artefacto solo contiene pesos de atención y layernorms del decodificador (498 tensores); requiere el modelo base y la librería NeuralOps para funcionar, por lo que no es un checkpoint autónomo.
- No se documentan limitaciones de longitud de contexto, aunque el modelo base Qwen2-0.5B tiene una ventana finita que no se especifica aquí.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) en el model-index.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-svd-llm-v2-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de la capa SVD: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_llm_v2_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
