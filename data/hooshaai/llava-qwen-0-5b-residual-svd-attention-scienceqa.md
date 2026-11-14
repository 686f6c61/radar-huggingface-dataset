# Hooshaai/llava-qwen-0.5b-residual-svd-attention-scienceqa

## Resumen

`Hooshaai/llava-qwen-0.5b-residual-svd-attention-scienceqa` es un checkpoint experimental de tipo "attention surgery" derivado del modelo vision-lenguaje `llava-hf/llava-interleave-qwen-0.5b-hf`. Lo publica el usuario Hooshaai dentro del ecosistema NeuralOps, un framework que aplica operadores neuronales alternativos sobre las capas de atención de transformers existentes. En concreto, sustituye la atención cuadrática estándar de 18 de las 24 capas del decoder Qwen2 por un operador denominado `ResidualSVDAttention` (atención de bajo rango basada en SVD residual), manteniendo seis capas ancla con atención cuadrática completa.

El modelo no es un VLM de propósito general ni un lanzamiento de un laboratorio: es un artefacto de investigación sobre compresión y destilación de conocimiento. El autor parte del modelo base LLaVA-Interleave-Qwen-0.5B (torre visual SigLIP congelada, proyector MLP de dos capas y decoder Qwen2 de 24 capas con dimensión 1024 y 16 cabezas) y entrena únicamente las atenciones modificadas y los layernorms del decoder, dejando congelados la torre visual, el proyector, las MLPs y los embeddings. El resultado se evalúa sobre el subconjunto con imagen de ScienceQA (validación).

Su relevancia es doble: por un lado, demuestra una metodología reproducible de cirugía de atención con un delta de pesos de solo 40,46 MB (frente a los 1,66 GB del modelo base en FP16, una reducción del 97,6 %); por otro, hace públicas las métricas de degradación que ese tipo de compresión introduce. La precisión final es del 28,75 % frente al 63,75 % del profesor, y la perplejidad baja de 19,50 en zero-shot a 3,07 tras la destilación. Es, por tanto, un modelo para estudiar compromisos entre compresión y calidad, no para desplegar en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA (torre visual SigLIP congelada + proyector MLP de 2 capas + decoder Qwen2 de 24 capas) con atencion híbrida: 18 capas con `ResidualSVDAttention` y 6 capas ancla con atención cuadrática completa |
| Parametros totales | no disponible (el modelo base LLaVA-Interleave-Qwen-0.5B ronda los 0,5B; el delta guardado es de 42.423.856 bytes en FP16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se serializan en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, formato `attention_only_fp16`, 336 tensores) + `surgical_manifest.json` con la topología de la cirugía |

## Arquitectura y entrenamiento

El modelo base es LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP de 27 capas congelada, un proyector MLP de dos capas que alinea el espacio visual con el textual, y un decoder Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas de atención y `head_dim` de 64. Sobre esa pila, la cirugía NeuralOps sustituye la atención de 18 de las 24 capas (esquema `hybrid_3_1`) por `ResidualSVDAttention`, un operador de bajo rango construido a partir de una descomposición SVD con componente residual. Se preservan seis capas ancla con atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]`, presumiblemente para mantener capacidad de modelado global.

El entrenamiento es una destilación de conocimiento en dos etapas (95 pasos en la etapa 1 y 147 en la etapa 2, 242 pasos totales) ejecutada en una única NVIDIA RTX 3090 de 24 GB, con 120,1 segundos de duración y un pico de VRAM de 16.574 MB. Solo se entrenan las atenciones modificadas y los layernorms del decoder; la torre visual, el proyector, las MLPs y los embeddings permanecen congelados. El dataset de evaluación y, presumiblemente, de ajuste es `derek-thomas/ScienceQA`, restringido al subconjunto de preguntas STEM con imagen. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (pipeline `image-text-to-text`): responde preguntas sobre figuras y diagramas científicos.
- Razonamiento visual de tipo STEM: preguntas de ciencia con opciones de respuesta múltiple, en el formato de ScienceQA.
- Conversación multi-turno: la model card incluye una plantilla de chat (`chat_template.json`), por lo que el formato conversacional está soportado a nivel de tokenizador.
- Respuesta en formato de opción múltiple (selección de letra), tal como se usa en la evaluación publicada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento explícito (thinking), audio o vídeo: no disponible.

## Casos de uso

- Investigación sobre compresión de atención: el checkpoint sirve para reproducir y analizar el compromiso entre la sustitución de atención cuadrática por SVD de bajo rango y la calidad resultante en tareas de razonamiento visual.
- Estudio de destilación de conocimiento en VLMs pequeños: las métricas pre-KD (31,25 % de precisión, PPL 19,50) y post-KD (28,75 %, PPL 3,07) permiten medir el efecto aislado de la etapa de destilación sobre un modelo quirúrgicamente modificado.
- Benchmarking de operadores alternativos de atención: el manifest `surgical_manifest.json` y el esquema `hybrid_3_1` documentan exactamente qué capas se modificaron, lo que facilita comparaciones controladas con otros operadores del "attention zoo" de NeuralOps.
- Docencia y divulgación técnica: es un ejemplo compacto (55,66 MB de paquete total) para explicar cómo se aplica una cirugía de atención sobre un transformer multimodal y cómo se serializa el delta de pesos.
- Pruebas de integración del ecosistema NeuralOps: el snippet de la model card usa `neuralops.hub.load_surgeried_model`, por lo que el modelo es útil como caso de prueba end-to-end de esa librería.
- Prototipado de asistentes educativos con restricciones de memoria extrema: aunque la precisión es baja (28,75 %), el tamaño reducido del delta permite experimentar en hardware muy limitado antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre ScienceQA, subconjunto STEM con imagen, split de validación:

| Métrica | Profesor (baseline) | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Precisión (%) | 63,75 | 31,25 | 28,75 | -2,50 |
| Perplejidad (PPL) | 2,45 | 19,50 | 3,07 | -16,43 |

Telemetría de entrenamiento declarada: 242 pasos de optimización (95 en etapa 1, 147 en etapa 2), 120,1 s de duración, RTX 3090 de 24 GB, pico de 16.574 MB de VRAM, marca temporal 2026-11-11T09:24:12Z.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia, el autor entrenó en una RTX 3090 de 24 GB con un pico de 16.574 MB, aunque el entrenamiento incluye el modelo base completo en memoria.
- GPU recomendadas: cualquier GPU con al menos 24 GB para reproducir el flujo completo del autor (RTX 3090, A100, H100). El delta de pesos por sí solo ocupa 40,46 MB, pero necesita cargarse sobre el modelo base LLaVA-Interleave-Qwen-0.5B (1,66 GB en FP16).
- ¿Cabe en GPU de consumo? El modelo base de 0,5B en FP16 (1,66 GB) cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores; el delta quirúrgico añade solo 40,46 MB.
- Opciones de despliegue: el modelo está empaquetado para la librería `neuralops` (`load_surgeried_model`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el formato `attention_only_fp16` no es un safetensors estándar cargable por `transformers` sin la capa de NeuralOps.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión ScienceQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/llava-qwen-0.5b-residual-svd-attention-scienceqa` | ~0,5B (base) + delta 40,46 MB | no disponible | 28,75 % | MIT | Hugging Face (NeuralOps) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5B | no disponible | 63,75 % (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| Otros operadores del "attention zoo" de NeuralOps | ~0,5B (base) | no disponible | no disponible | MIT (repo NeuralOps) | Hugging Face |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas de otros ecosistemas (por ejemplo, modelos VLM pequeños de otros autores) en las mismas condiciones de evaluación.

## Limitaciones y advertencias

- Degradación sustancial de precisión: 28,75 % frente al 63,75 % del profesor, una caída de 35 puntos absolutos. No es apto para uso en producción sin un ajuste posterior.
- La destilación mejora la perplejidad (de 19,50 a 3,07) pero empeora ligeramente la precisión (-2,50 puntos), lo que sugiere que la PPL no es un buen proxy de calidad en esta tarea.
- El modelo solo se ha evaluado en un subconjunto de ScienceQA (preguntas STEM con imagen, validación); no hay evidencia de generalización a otras tareas visuales.
- Idioma: solo inglés. No hay soporte multilingüe documentado.
- Licencia MIT, lo que permite uso comercial del artefacto, pero conviene verificar la licencia del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` antes de redistribuir o desplegar comercialmente.
- El formato de pesos (`attention_only_fp16`) no es un safetensors estándar: requiere la librería `neuralops` y el modelo base para reconstruir el modelo completo. No es directamente cargable con `transformers` ni con runtimes de inferencia convencionales.
- Riesgo de alucinación: no cuantificado en la información disponible, pero esperable en un VLM de 0,5B con atención comprimida y entrenamiento corto (242 pasos).
- Sesgos: no documentados por el autor. Al entrenarse sobre ScienceQA (dataset en inglés de preguntas STEM), puede heredar sesgos de ese corpus.
- El modelo es un artefacto de investigación: no hay garantías de robustez, ni evaluación de seguridad, ni soporte del autor más allá de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-residual-svd-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset de evaluación: https://huggingface.co/datasets/derek-thomas/ScienceQA
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `ResidualSVDAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/residual_svd_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
