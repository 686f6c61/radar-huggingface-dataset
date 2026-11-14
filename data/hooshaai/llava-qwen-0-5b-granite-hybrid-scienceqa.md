# Hooshaai/llava-qwen-0.5b-granite-hybrid-scienceqa

## Resumen
llava-qwen-0.5b-granite-hybrid-scienceqa es un checkpoint experimental publicado por el usuario Hooshaai dentro del ecosistema NeuralOps, una librería de "cirugía de atención" que sustituye bloques de atención estándar por operadores híbridos en modelos preentrenados. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf, un VLM de 0,5 mil millones de parámetros con torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas (D=1024, 16 cabezas, head_dim=64), y aplica el operador `granite_hybrid` sobre 18 de las 24 capas del decodificador.

El problema que aborda es la experimentación con arquitecturas híbridas (atención + Mamba-2 + MoE con LoRA) mediante destilación de conocimiento, manteniendo anclas cuadráticas en capas concretas [3, 7, 11, 15, 19, 23] y congelando la torre visual, el proyector, los MLP y los embeddings. El resultado se evalúa sobre el subconjunto con imagen de ScienceQA (validación), un benchmark de razonamiento visual STEM.

Es relevante ahora como artefacto de investigación reproducible: documenta telemetría de entrenamiento completa, un manifiesto quirúrgico y una reducción del 53,1 % del peso en disco frente al modelo base en FP16. No obstante, el propio autor reporta una caída de precisión frente al profesor (63,75 % → 33,12 %), por lo que debe tratarse como un experimento de arquitectura, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atención + Mamba-2 + MoE con LoRA (`GraniteHybridBlock`), sobre decodificador Qwen2 con torre visual SigLIP |
| Parametros totales | 0,5 mil millones (modelo base LLaVA-Qwen-0.5B); no se especifica el recuento exacto tras la cirugía |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, deltas quirúrgicos modulares) |

## Arquitectura y entrenamiento
El bloque `GraniteHybridBlock` sigue el flujo x_in → [Attention; Mamba-2] → fusión con puerta → MoE FFN → x_out. La puerta de fusión `sigmoid(lora_alpha)` se inicializa con `lora_alpha = +6.0`, de modo que sigmoid ≈ 0,9975 y la rama de atención domina al inicio del entrenamiento, igualando al profesor preentrenado. La cirugía afecta a 18 de las 24 capas del decodificador (`hybrid_3_1`), modificando `self_attn` y los layernorms entrenados; se congelan la torre SigLIP (27 capas), el proyector multimodal, los MLP del decodificador, los embeddings y seis capas ancla cuadráticas en los índices [3, 7, 11, 15, 19, 23].

El entrenamiento se realizó mediante destilación de conocimiento con la arquitectura de caché offline de representaciones de NeuralOps (§21.1), sobre una única NVIDIA GeForce RTX 3090 (24 GB) con 0 MB de VRAM del profesor en GPU. Se ejecutaron 134 pasos de optimización (42 en etapa 1, 92 en etapa 2) en 120,7 segundos, con un pico de VRAM de 21.868 MB. El dataset de evaluación es derek-thomas/ScienceQA; no se detalla la composición exacta del conjunto de entrenamiento ni si hubo RLHF o DPO.

## Capacidades
- Generación de texto e imagen-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre contenido STEM con imágenes (ScienceQA).
- Razonamiento multimodal básico sobre diagramas y figuras científicas.
- Soporte de plantilla de chat (`chat_template.json` incluido).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documentan modos de pensamiento, audio ni vídeo.

## Casos de uso
- Investigación en arquitecturas híbridas: sirve como referencia reproducible para estudiar el efecto de sustituir atención por bloques atención + Mamba-2 + MoE en un VLM pequeño, con manifiesto quirúrgico y telemetría incluidos.
- Experimentos de destilación de conocimiento: el checkpoint documenta el pipeline de caché offline de representaciones y permite replicar la metodología en una sola GPU de 24 GB.
- Evaluación comparativa de operadores de atención: al publicar métricas pre-KD y post-KD sobre ScienceQA, facilita comparaciones entre operadores del "attention zoo" de NeuralOps.
- Docencia y divulgación técnica: un VLM de 0,5 B con artefacto de 798 MB es manejable para demostrar cirugía de modelos y análisis de deltas de pesos.
- Análisis de compresión de artefactos: la reducción del 53,1 % frente al FP16 base permite estudiar técnicas de serialización selectiva de pesos.
- Pruebas de integración con la librería `neuralops.hub`: útil para validar la API `load_surgeried_model` y flujos de carga de deltas quirúrgicos.
- No se recomienda para atención al cliente, generación de código en producción ni tareas de razonamiento visual de alta precisión, dado el bajo rendimiento reportado.

## Benchmarks y rendimiento

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (Image-Bearing STEM Subset, validation) | 63,75 | 46,25 | 33,12 | -13,13 |
| Perplexity en ScienceQA (Image-Bearing STEM Subset, validation) | 2,45 | 1.245.460,23 | 6,92 | -1.245.453,31 |

Los valores proceden del model-index del autor y están marcados como no verificados (`verified: false`). No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el artefacto de pesos ocupa 798,22 MB en FP16; con overhead de activaciones y torre visual, se estima un consumo moderado, aunque no se publica una cifra oficial de VRAM de inferencia.
- GPU de entrenamiento documentada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 21.868 MB.
- Cabe en GPU de consumo: sí, por tamaño del artefacto (menos de 1 GB de pesos) es compatible con GPUs consumer de gama media-alta; no se especifican modelos concretos.
- Opciones de despliegue: la carga se realiza mediante `neuralops.hub.load_surgeried_model`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El tiempo de entrenamiento reportado es de 120,7 s para 134 pasos, pero no se aportan métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, subconjunto con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-granite-hybrid-scienceqa | 0,5 B (base) | no disponible | 33,12 % accuracy / 6,92 PPL | MIT | Hugging Face (37 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5 B | no disponible | 63,75 % accuracy / 2,45 PPL | no disponible en esta ficha | Hugging Face |
| Otros VLM pequeños comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base, ya que la información proporcionada no incluye datos de otros VLM pequeños de la misma categoría.

## Limitaciones y advertencias
- Caída de precisión significativa frente al profesor: 33,12 % frente a 63,75 % en ScienceQA, con un delta de -13,13 puntos respecto al estado pre-KD (46,25 %).
- Métricas no verificadas: el model-index marca los resultados como `verified: false`; conviene reproducirlos antes de citarlos.
- Solo inglés: la model card declara únicamente `en`, sin soporte multilingüe documentado.
- Riesgo de alucinación elevado en tareas STEM: la perplexity final de 6,92, aunque muy inferior a la pre-KD, sigue siendo alta frente al profesor (2,45).
- Contexto no documentado: se desconoce la longitud máxima de secuencia soportada, lo que limita su uso en conversaciones largas o documentos extensos.
- Restricciones de licencia: MIT permite uso comercial, pero el autor enlaza el LICENSE al repositorio NeuralOps; conviene revisar los términos del modelo base LLaVA-Qwen-0.5B.
- Naturaleza experimental: es un artefacto de investigación con 37 descargas y 0 likes; no hay evidencia de validación en producción.
- Dependencia de la librería `neuralops`: la carga requiere la API específica del ecosistema, lo que puede dificultar la integración con stacks estándar (Transformers, vLLM).
- Sesgos: no se documentan análisis de sesgo; al derivar de un modelo base entrenado con datos web, hereda los sesgos de este.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-granite-hybrid-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación del operador `granite_hybrid`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/granite_hybrid.py
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
