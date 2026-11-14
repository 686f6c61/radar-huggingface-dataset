# Hooshaai/llava-qwen-0.5b-cosformer-scienceqa

## Resumen

llava-qwen-0.5b-cosformer-scienceqa es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps, un "zoo" de cirugía de atención sobre modelos multimodales. El modelo parte de llava-hf/llava-interleave-qwen-0.5b-hf (torre visual SigLIP congelada, proyector MLP de dos capas y decodificador Qwen2 de 24 capas con D=1024, H=16 y head_dim=64) y sustituye la atención cuadrática por CosformerAttention, un operador de atención lineal, en 18 de las 24 capas del decodificador. Las seis capas restantes (índices 3, 7, 11, 15, 19 y 23) se mantienen como anclas cuadráticas, configurando un esquema híbrido 3:1.

El objetivo no es tanto desplegar un VLM de producción como demostrar una técnica de compresión y destilación: tras el reemplazo de atención, el modelo se recupera mediante destilación de representaciones en caché offline (arquitectura §21.1 de NeuralOps) sobre un subconjunto STEM con imágenes de ScienceQA. El artefacto resultante pesa 184,78 MB en safetensors frente a los 1,66 GB del base completo, una reducción del 89,1 % (9,21x más pequeño). Es relevante para investigadores interesados en atención lineal, sustitución de operadores y recuperación de capacidad mediante knowledge distillation en modelos pequeños.

La evaluación declarada por el autor (no verificada de forma independiente) sitúa la precisión final en 45,00 % en el split de validación de ScienceQA (subconjunto con imagen), frente al 30,63 % del modelo quirúrgico sin destilar y el 63,75 % del teacher original. La perplejidad baja de 121,07 a 3,38 tras la destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas con atención Cosformer lineal en 18 capas y atención cuadrática en 6 capas ancla |
| Parametros totales | no disponible (modelo base Qwen2 de 0,5B; el artefacto publicado contiene solo los pesos delta de atención, 184,78 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en FP16 safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, 184,78 MB), más config.json, surgical_manifest.json y tokenizer en formato Hugging Face |

## Arquitectura y entrenamiento

El modelo hereda la topología LLaVA interleave del base: una torre visual SigLIP congelada de 27 capas, un proyector multimodal MLP de dos capas y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y dimensión de cabeza 64. La intervención quirúrgica sustituye el módulo de self-attention en 18 de las 24 capas por CosformerAttention, un operador de la familia de atención lineal que aplica una función de ponderación basada en coseno para aproximar la atención softmax con coste lineal en la longitud de secuencia. Se conservan seis capas cuadráticas como anclas (3, 7, 11, 15, 19 y 23) para preservar capacidad expresiva local, y se mantienen intactos la torre visual, el proyector, los MLP del decodificador y los embeddings. También se entrenan las layernorms del decodificador.

El entrenamiento se realiza mediante destilación de representaciones con caché offline, de modo que el teacher no ocupa VRAM durante el ajuste. Se ejecutó en una única RTX 3090 de 24 GB, con 101 pasos de optimización (33 en la etapa 1 y 68 en la etapa 2), una duración de 120,5 segundos y un pico de VRAM de 19.937 MB. El dataset es el subconjunto STEM con imagen de ScienceQA (derek-thomas/ScienceQA), en split de validación. No se documentan el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO; tampoco se detalla la función de pérdida de destilación más allá de la referencia a la arquitectura de caché offline de NeuralOps.

## Capacidades

- Generación de texto e imagen-a-texto conversacional: responde preguntas en formato visual question answering sobre imágenes, con plantilla de chat propia (chat_template.json).
- Razonamiento visual sobre contenido STEM: el ajuste se centra en preguntas de ciencia con figura, típicas de ScienceQA.
- Respuesta de opción múltiple: el prompt de ejemplo pide responder con la letra de la opción, lo que indica soporte para formato de elección cerrada.
- Procesamiento multimodal con preprocesador de imagen propio (preprocessor_config.json) y tokenizador BPE rápido.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni vídeo en la información disponible.
- El modelo se distribuye como delta quirúrgico, por lo que requiere cargarse con la API de NeuralOps (`load_surgeried_model`) sobre el base LLaVA-Qwen-0.5B.

## Casos de uso

- Investigación en atención lineal: comparar el comportamiento de CosformerAttention frente a atención cuadrática en un VLM pequeño, usando el checkpoint como referencia reproducible de cirugía de atención con anclas cuadráticas.
- Experimentos de destilación de conocimiento: reutilizar la receta de caché offline de representaciones para recuperar capacidad tras sustituir operadores, con métricas de precisión y perplejidad antes y después del ajuste.
- Prototipado de VQA educativo: responder preguntas de ciencia con imagen en entornos de bajo recurso, dado el reducido tamaño del artefacto (184,78 MB) y su entrenamiento en una sola RTX 3090.
- Evaluación de compresión de modelos: estudiar la relación entre el número de capas sustituidas (18 de 24) y la pérdida de precisión frente al teacher (63,75 % a 45,00 %), útil para decidir cuántas capas conviene linealizar en otros modelos.
- Docencia y divulgación: ejemplo didáctico de sustitución de módulos de atención y serialización determinista de pesos delta en formato safetensors.
- Baseline para ablaciones: punto de partida para comparar otros operadores del zoo (por ejemplo, variantes lineales alternativas) sobre el mismo dataset y hardware.
- Integración en pipelines de investigación con NeuralOps: cargar el modelo mediante `load_surgeried_model` y evaluar en tareas de image-text-to-text con el procesador incluido.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre ScienceQA, subconjunto STEM con imagen, split de validación:

| Métrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) | 63,75 | 30,63 | 45,00 | +14,37 |
| Perplexity (PPL) | 2,45 | 121,07 | 3,38 | -117,69 |

Telemetría de entrenamiento declarada: RTX 3090 (24 GB), 101 pasos (33 + 68), 120,5 s, pico de VRAM 19.937 MB, timestamp 2026-11-11T05:28:19Z. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el base LLaVA-Qwen-0.5B es un modelo de 0,5B parámetros, por lo que en FP16 debería caber holgadamente en GPUs de consumo, pero no se documenta la cifra exacta.
- El artefacto delta ocupa 184,78 MB en disco (199,98 MB el paquete completo), frente a 1,66 GB del base FP16.
- GPU recomendadas: no disponible; el entrenamiento se realizó en una NVIDIA GeForce RTX 3090 (24 GB) con pico de 19.937 MB.
- Cabe en GPU de consumo: previsiblemente sí por tamaño del base, aunque no se confirma en la documentación.
- Opciones de despliegue: la model card solo documenta la API de NeuralOps (`neuralops.hub.load_surgeried_model`). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la librería declarada es `neuralops`, no `transformers`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento ScienceQA (val, con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-cosformer-scienceqa | 0,5B (base) | no disponible | 45,00 % accuracy / 3,38 PPL (declarado) | MIT | Hugging Face, requiere NeuralOps |
| llava-hf/llava-interleave-qwen-0.5b-hf (teacher) | 0,5B | no disponible | 63,75 % accuracy / 2,45 PPL (declarado como baseline) | no disponible en la información | Hugging Face |
| Checkpoint quirúrgico sin destilar (mismo zoo) | 0,5B (base) | no disponible | 30,63 % accuracy / 121,07 PPL (declarado) | MIT | Derivado del mismo proceso |

No se dispone de datos de otros modelos comparables de la misma categoría (VLM pequeños ajustados a ScienceQA) en la información proporcionada.

## Limitaciones y advertencias

- La precisión final (45,00 %) queda 18,75 puntos por debajo del teacher (63,75 %): la sustitución de atención lineal no se recupera por completo con la destilación aplicada.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`); no hay evaluación independiente.
- El modelo solo soporta inglés; no se documenta cobertura multilingüe.
- El ajuste se limita al subconjunto STEM con imagen de ScienceQA; el rendimiento fuera de ese dominio no está caracterizado.
- Riesgo de alucinación no cuantificado; al ser un modelo de 0,5B ajustado con 101 pasos, la fidelidad factual en preguntas abiertas es incierta.
- No se documentan sesgos conocidos, pero el dataset de origen (ScienceQA) puede introducir sesgos de dominio y de composición.
- La licencia es MIT, lo que permite uso comercial, pero el modelo se distribuye como delta quirúrgico y depende del base llava-hf/llava-interleave-qwen-0.5b-hf, cuyas condiciones deben respetarse por separado.
- Requiere la librería `neuralops` y su API específica; no es cargable directamente con `transformers` estándar según la información disponible.
- No se documentan longitud de contexto, cuantizaciones soportadas ni latencias, lo que dificulta planificar un despliegue en producción.
- El checkpoint contiene solo los pesos modificados de atención y las layernorms entrenadas; no incluye la torre visual ni el resto del modelo, que deben provenir del base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-cosformer-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de CosformerAttention: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/linear/cosformer.py
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
