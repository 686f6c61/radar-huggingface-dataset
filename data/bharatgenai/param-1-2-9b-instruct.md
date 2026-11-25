# bharatgenai/Param-1-2.9B-Instruct

## Resumen

Param 1-2.9B-Instruct es un modelo de lenguaje bilingüe (inglés e hindi) de 2.860 millones de parámetros desarrollado por BharatGen, una iniciativa india de investigación en IA generativa. Se trata del checkpoint inicial de ajuste supervisado (SFT) sobre el modelo base Param 1, entrenado desde cero en inglés e hindi con el objetivo de servir como fundamento para tareas posteriores, pruebas de seguridad y personalización.

El modelo resuelve la necesidad de una alternativa abierta y ligera para generación de texto conversacional en hindi e inglés, un par de idiomas poco cubierto por los modelos occidentales de tamaño similar. Su relevancia radica en su licencia Apache 2.0, su entrenamiento desde cero con 7,5 billones de tokens y su disponibilidad en Hugging Face con pesos en safetensors.

La arquitectura es un transformer decoder-only con atención causal estándar, entrenado en NVIDIA NeMo con precisión bf16-mixed sobre 512 GPUs H100 durante la fase de preentrenamiento y 32 GPUs H200 durante el SFT. La longitud de contexto no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal) |
| Parametros totales | 2.860.693.504 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Param 1-2.9B-Instruct es un transformer decoder-only de 2.860 millones de parámetros entrenado desde cero por BharatGen. El preentrenamiento se realizó sobre un dataset de 7,5 billones de tokens altamente curado con filtrado estándar y múltiples etapas de procesamiento, usando un scheduler de cosine annealing con learning rate de 3e-4 a 3e-6, precisión bf16-mixed y el framework NVIDIA NeMo sobre 512 GPUs H100. El checkpoint base (Param 1) está disponible en el portal AIKosh del gobierno indio.

La fase de SFT utilizó 0,8 millones de muestras bilingües de alta calidad (fuentes públicas e internas) durante 3 épocas, con cosine annealing, learning rate de 5e-6 a 5e-8, precisión bf16-mixed y 32 GPUs H200. El dataset de SFT se filtró para comportamiento seguro y culturalmente relevante. No se menciona en la información disponible el uso de RLHF, DPO u otras técnicas de alineación posteriores al SFT.

## Capacidades

- Generación de texto conversacional en hindi e inglés, con soporte de plantilla de chat (`apply_chat_template`) y rol de sistema.
- Razonamiento y respuesta a preguntas (evaluado en ARC, HellaSwag, MMLU, PIQA, TriviaQA, TruthfulQA, SuperGLUE).
- Comprensión lectora y clasificación de pares de frases (SuperGLUE: boolq, rte, WiC, multirc).
- Capacidad bilingüe nativa, con rendimiento específico en hindi (HellaSwag Hi, MMLU Hi).
- Soporte de conversación multi-turno mediante el formato de chat del tokenizer.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Atención al cliente en hindi e inglés: el modelo puede gestionar conversaciones multi-turno con plantilla de chat y rol de sistema, adecuado para mercados indios donde el hindi es idioma principal.
- Asistentes conversacionales bilingües: integración en aplicaciones de mensajería que requieran alternar entre hindi e inglés sin cambiar de modelo, gracias a su entrenamiento nativo en ambos idiomas.
- Generación de contenido editorial en hindi: redacción de artículos, resúmenes y respuestas a preguntas frecuentes para medios o portales gubernamentales indios, aprovechando su licencia Apache 2.0.
- Clasificación y extracción de información: uso en tareas de SuperGLUE (boolq, rte, WiC, multirc) para filtrar y clasificar texto en pipelines de datos.
- Educación y tutoría automatizada: respuestas a preguntas de conocimiento general y razonamiento básico en hindi e inglés, con un tamaño de 2,9B parámetros que permite despliegue en hardware modesto.
- Investigación en IA para lenguas de la India: base para fine-tuning posterior en otras lenguas índicas o dominios específicos, dado su carácter de checkpoint SFT inicial y su licencia permisiva.
- Prototipado rápido de chatbots: al ser un modelo de 2,9B parámetros, puede ejecutarse en GPUs de consumo para pruebas de concepto y validación de producto antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados zero-shot tras SFT, según la model card del autor. PT indica modelo preentrenado.

| Tarea | Param 1 (PT) | Gemma2-2B (PT) | llama3.2-3B (distill PT) | granite-3.1-2B (PT) | granite-3.1-3B (PT) | qwen-2.5-3B (PT) |
|---|---|---|---|---|---|---|
| ARC Challenge | 46,7 | 49,7 | 46,0 | 47,2 | 45,2 | 47,4 |
| ARC Easy | 74,6 | 80,3 | 71,7 | 76,8 | 75,8 | 73,2 |
| HellaSwag | 71,4 | 73,0 | 73,7 | 75,5 | 72,6 | 73,6 |
| HellaSwag Hi | 44,1 | 38,6 | 40,0 | 31,0 | 28,5 | 32,9 |
| MMLU En | 41,4 | 47,1 | 53,9 | 47,8 | 41,0 | 64,9 |
| MMLU Hi | 30,7 | 30,0 | 35,0 | 29,0 | 25,7 | 38,32 |
| PIQA | 79,3 | 78,3 | 77,31 | 79,4 | 78,2 | 78,84 |
| TriviaQA | 38,5 | 32,9 | 50,83 | 26,2 | 27,5 | 42,27 |
| TruthfulQA Gen (BLEU) | 38,2 | 29,7 | 21,8 | 34,0 | 36,7 | 36,96 |
| TruthfulQA MC1 Acc | 28,0 | 24,0 | 25,3 | 26,1 | 26,4 | 32,07 |
| TruthfulQA MC2 Acc | 43,8 | 36,2 | 39,2 | 39,0 | 39,9 | 48,95 |
| SuperGLUE boolq | 70,6 | 73,7 | 72,7 | 71,0 | 68,5 | 77,27 |
| SuperGLUE rte | 62,5 | 61,7 | 54,5 | 69,3 | 54,9 | 75,09 |
| SuperGLUE WiC | 49,5 | 49,5 | 50,0 | 50,3 | 52,3 | 61,75 |
| SuperGLUE multirc | 56,9 | 55,9 | 57,2 | 57,2 | 57,2 | 39,52 |

Param 1 destaca en HellaSwag Hi (44,1), TriviaQA (38,5), TruthfulQA Gen (38,2) y SuperGLUE multirc (56,9) frente a modelos de tamaño similar, mientras que queda por detrás en MMLU En (41,4) y MMLU Hi (30,7) respecto a qwen-2.5-3B.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,7 GB solo para pesos (2,86B × 2 bytes), más overhead de activaciones y caché KV; en la práctica requiere entre 6 y 8 GB en bf16.
- En cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits: alrededor de 1,5 GB de pesos (estimación teórica, no confirmada por el autor).
- GPU recomendadas: H100 o H200 para entrenamiento e inferencia de alta concurrencia; A100 40/80 GB para servicio en producción.
- Cabe en GPUs de consumo: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB) e incluso en GPUs de 8 GB en cuantización de 4 bits, aunque el autor no publica pesos GGUF ni cuantizaciones oficiales.
- Opciones de despliegue: transformers con `trust_remote_code=True` (método documentado por el autor); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible, aunque al ser un transformer estándar deberían ser adaptables.
- Latencia y throughput: no disponibles en la información proporcionada.
- El autor indica `use_cache=False` en el script de inferencia de ejemplo, lo que sugiere posibles problemas con la caché KV en la implementación custom; conviene validar el rendimiento en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | MMLU En | HellaSwag Hi |
|---|---|---|---|---|---|---|
| Param 1-2.9B-Instruct | 2,86B | no disponible | hi, en | Apache 2.0 | 41,4 | 44,1 |
| Gemma2-2B | 2,6B | no disponible | multilingüe | Gemma license | 47,1 | 38,6 |
| Llama 3.2-3B | 3,2B | no disponible | multilingüe | Llama license | 53,9 | 40,0 |
| Qwen 2.5-3B | 3,1B | no disponible | multilingüe | Apache 2.0 | 64,9 | 32,9 |

Param 1 es competitivo en tareas de hindi y en verdad (TruthfulQA) frente a modelos de tamaño similar, pero queda por detrás en conocimiento general en inglés (MMLU En) respecto a Llama 3.2-3B y Qwen 2.5-3B. Su ventaja principal es la licencia Apache 2.0 combinada con entrenamiento nativo en hindi.

## Limitaciones y advertencias

- Es un checkpoint SFT inicial, no un modelo final alineado: el autor lo describe como base para tareas posteriores, pruebas de seguridad y personalización, por lo que puede presentar comportamientos no deseados en producción.
- Riesgo de alucinación: los resultados de TruthfulQA (MC1 28,0; MC2 43,8) indican una fiabilidad limitada en preguntas de verdad; no debe usarse como fuente de hechos sin verificación.
- Cobertura lingüística restringida a hindi e inglés; no se garantiza un rendimiento aceptable en otras lenguas, incluido el español.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin validación empírica.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar código del autor y revisar su procedencia antes de desplegar.
- El script de inferencia del autor usa `use_cache=False`, lo que puede degradar la latencia en generaciones largas.
- No se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni filtros de seguridad documentados más allá del filtrado del dataset de SFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bharatgenai/Param-1-2.9B-Instruct
- Modelo base Param 1: https://huggingface.co/bharatgenai/Param-1
- Checkpoint preentrenado en AIKosh: https://aikosh.indiaai.gov.in/home/models/details/bharatgen_param_1_indic_scale_bilingual_foundation_model.html
- Paper (arXiv:2507.13390): https://arxiv.org/abs/2507.13390
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
