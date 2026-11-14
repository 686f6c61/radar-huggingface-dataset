# Hooshaai/llava-qwen-0.5b-asvd-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-asvd-attention-scienceqa` es un modelo de vision-lenguaje (VLM) multimodal derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el usuario Hooshaai dentro del ecosistema NeuralOps. El modelo aplica una cirugía de atención sobre el decodificador de lenguaje: sustituye 18 de las 24 capas de atención del decoder Qwen2 por un operador propio denominado `ASVDAttention` (atención ASVD con descomposición matricial de bajo rango factorizada, GQA, RoPE y LoRA), manteniendo congelado el codificador visual SigLIP y el proyector MLP. Posteriormente se destila sobre el subconjunto con imágenes del dataset ScienceQA.

El interés del modelo es fundamentalmente experimental: sirve como banco de pruebas reproducible para evaluar cómo un mecanismo de atención subcuadrático (con proyecciones factorizadas de bajo rango) maneja el enrutamiento denso entre tokens visuales y de texto, comparándolo contra el modelo profesor original. No es un modelo pensado para producción general, sino una pieza de investigación sobre eficiencia atencional en VLMs.

La relevancia actual radica en el creciente interés por reducir el coste cuadrático de la atención en modelos multimodales, donde las secuencias de parches visuales son largas. Este modelo ofrece un artefacto concreto y medible: pesos de atención transplantados de 361,30 MB que se cargan sobre el modelo base congelado, con métricas declaradas de precisión y perplejidad en ScienceQA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM LLaVA: encoder visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 (24 capas, D=1024, H=16, d_h=64) con 18/24 capas de atención sustituidas por `ASVDAttention` (patrón `hybrid_3_1`) |
| Parametros totales | 0,5B (modelo base `llava-interleave-qwen-0.5b-hf`); pesos de atención transplantados: 361,30 MB en FP16 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, FP16); requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LLaVA interleave de Qwen 0,5B: un encoder visual SigLIP que extrae parches, un proyector MLP de dos capas que los alinea con el espacio del lenguaje, y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y dimensión por cabeza 64. La innovación principal es la cirugía de atención: 18 de las 24 capas del decoder se reemplazan por `ASVDAttention`, un operador que combina descomposición de matrices de bajo rango factorizada (SVD), atención con consultas agrupadas (GQA), embeddings rotatorios (RoPE) y adaptadores LoRA. Se conservan 6 capas de atención cuadrática como anclas en las posiciones `[3, 7, 11, 15, 19, 23]`, configurando el patrón `hybrid_3_1`. El encoder visual y el proyector permanecen completamente congelados, de modo que el experimento aísla la capacidad del mecanismo subcuadrático para manejar el enrutamiento cross-modal.

El entrenamiento consistió en destilación de conocimiento sobre el subconjunto con imágenes de `derek-thomas/ScienceQA`, en dos etapas (88 + 144 pasos de optimización, 232 en total), con una duración de 120,1 s y un pico de VRAM de 17.071 MB sobre una NVIDIA RTX 3090 de 24 GB. No se especifican en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) en inglés.
- Respuesta a preguntas visuales (VQA), particularmente sobre contenido científico y educativo del dominio ScienceQA.
- Razonamiento visual multimodal básico: interpretación de diagramas e ilustraciones junto con texto de la pregunta.
- Conversación multi-turno (etiqueta `conversational`) heredada del modelo base LLaVA interleave.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales (thinking mode, audio, vídeo): no disponibles.

## Casos de uso

- Investigación en eficiencia atencional: el modelo permite medir el impacto de sustituir atención cuadrática por un operador de bajo rango en un VLM, comparando directamente contra el profesor `llava-interleave-qwen-0.5b` con las métricas declaradas en ScienceQA.
- Reproducción de experimentos de atención: los pesos de atención de 361,30 MB se cargan sobre el modelo base congelado mediante `apply_qwen_attention_surgery`, lo que facilita replicar el pipeline en un solo script.
- Prototipado de asistentes educativos sobre material científico: dado su ajuste en ScienceQA, puede usarse para responder preguntas sobre diagramas e ilustraciones en un entorno de demostración, siempre con validación humana.
- Evaluación de destilación de conocimiento en VLMs: el par pre-KD (31,25 % de precisión) y post-KD (42,50 %) sirve como caso de estudio de cuánto recupera la destilación tras una cirugía agresiva de atención.
- Docencia y divulgación: ejemplo práctico y ligero (0,5B, 0,8 GB de repo) para explicar cirugía de módulos, SVD de bajo rango y arquitecturas LLaVA en cursos o talleres.
- Pruebas de despliegue en hardware modesto: con un modelo de 0,5B y pico de VRAM de ~17 GB en entrenamiento, es viable experimentar en GPUs de consumo para inferencia, aunque no se publican cifras de latencia.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados, `verified: false`) sobre `derek-thomas/ScienceQA`, subconjunto con imágenes, split de validación:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Pre-KD zero-shot (`asvd_attention`) | Post-KD (`asvd_attention`) | Delta |
|---|---:|---:|---:|---:|
| Precisión visual ScienceQA (%) | 63,75 | 31,25 | 42,50 | +11,25 |
| Perplejidad de respuesta condicionada por imagen | 2,45 | 8,71 | 2,94 | -5,76 |

Telemetría de entrenamiento: 232 pasos (etapa 1: 88; etapa 2: 144), 120,1 s de duración, pico de 17.071 MB de VRAM en RTX 3090. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (0,5B) y los pesos de atención en FP16, es esperable que quepa en GPUs de consumo, pero no se publican cifras de inferencia.
- VRAM de entrenamiento declarada: pico de 17.071 MB en una NVIDIA RTX 3090 de 24 GB.
- GPU recomendadas: RTX 3090 (usada en el entrenamiento); para inferencia, cualquier GPU con suficiente memoria para el modelo base en FP16.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en RTX 3090 y GPUs con memoria similar; no se confirman otros modelos.
- Opciones de despliegue: carga vía `transformers` (`LlavaForConditionalGeneration` + `AutoProcessor`) con el parche de cirugía, o vía la API `neuralops.hub.load_surgeried_model`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión ScienceQA (visual) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `Hooshaai/llava-qwen-0.5b-asvd-attention-scienceqa` | 0,5B | no disponible | 42,50 % (post-KD) | MIT | Hugging Face |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | 0,5B | no disponible | 63,75 % | no disponible en la información | Hugging Face |
| Otros VLMs de ~0,5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación con datos concretos es contra el modelo profesor, que supera al modelo quirúrgico en 21,25 puntos de precisión visual. No se dispone de datos de benchmarks de alternativas de terceros en la información proporcionada.

## Limitaciones y advertencias

- Pérdida sustancial de precisión frente al profesor: 42,50 % vs. 63,75 % en ScienceQA, lo que indica que la cirugía de atención degrada el rendimiento pese a la destilación.
- Perplejidad de respuesta superior a la del profesor (2,94 vs. 2,45), señal de menor calibración en las respuestas.
- Modelo de nicho y experimental: no está pensado para uso en producción general; su valor es de investigación.
- Solo inglés: no se declara soporte multilingüe.
- Dominio limitado: el ajuste se hizo sobre ScienceQA, por lo que la generalización a otros dominios visuales no está validada.
- Riesgo de alucinación: no evaluado en la información disponible; en VLMs pequeños es habitual, pero no hay datos que lo cuantifiquen.
- Sesgos conocidos: no documentados.
- Licencia MIT: permite uso comercial, pero el modelo base y los datos pueden tener sus propias condiciones, no detalladas aquí.
- Requiere cargar el modelo base congelado y aplicar la cirugía antes de cargar los pesos; no es un checkpoint autónomo listo para usar sin ese paso.
- Repositorio con 56 descargas y 0 likes: ecosistema de validación muy limitado.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-asvd-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación `ASVDAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/asvd_attention.py
- Licencia MIT: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
