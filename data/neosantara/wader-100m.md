# neosantara/wader-100m

## Resumen

`wader-100m` es un modelo de lenguaje pequeño, de aproximadamente 110 millones de parámetros, desarrollado por el equipo de Neosantara, una iniciativa indonesa centrada en la creación de modelos de IA en indonesio. El modelo implementa una versión reducida de la arquitectura DeepSeek-V4, incluyendo componentes como MoE (mezcla de expertos), atención latente multi-cabeza (MLA), hiperconexiones y predicción multi-token (MTP), pero entrenado desde cero, sin utilizar pesos del modelo original de DeepSeek. Está diseñado para tareas de generación de texto conversacional y seguimiento de instrucciones en indonesio, tras un ajuste fino supervisado (SFT) sobre el conjunto de datos `IndoTalkSFT`.

El modelo destaca por su tamaño compacto y su arquitectura moderna, lo que lo hace interesante como banco de pruebas para implementar técnicas de DeepSeek-V4 a pequeña escala. Sin embargo, su capacidad real es limitada: cuenta con un contexto de solo 2048 tokens, un vocabulario de 129,280 tokens (que consume gran parte de los parámetros en embeddings) y un entrenamiento breve (5,000 pasos de pretraining y 3,000 de SFT). Está pensado para uso experimental o en entornos de prototipado rápido, no para producción con alta exigencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DeepSeek-V2 (mini): MoE (4 expertos enrutados + 1 compartido, top-2), MLA (q_lora_rank=160), Hyper-Connections (hc_mult=4, Sinkhorn routing), MTP (1 capa), 8 capas, hidden size 320, 8 cabezas de atención (1 KV head, MQA) |
| Parámetros totales | 110.369.621 (41M en embeddings, 69M no-embeddings) |
| Parámetros activos | No especificado (MoE con top-2 de 4 expertos, más el experto compartido; no se indica el número de parámetros activos por token) |
| Longitud de contexto | 2,048 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con código personalizado, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

`wader-100m` reproduce a escala mini las innovaciones clave de DeepSeek-V2. La arquitectura combina una atención latente multi-head (MLA) con reducción de dimensionalidad (q_lora_rank=160) para comprimir el estado de atención, un mecanismo de mezcla de expertos (MoE) con 4 expertos enrutados y 1 experto compartido, enrutamiento top-2 y un sistema de hiperconexiones (Hyper-Connections) que sustituye las conexiones residuales tradicionales, usando un enrutamiento Sinkhorn con un factor de escala `hc_mult=4`. Además, incorpora una capa de predicción de siguiente token (MTP) que entrena al modelo para predecir múltiples tokens futuros.

El entrenamiento se realizó en dos etapas. La primera, un pretraining sobre el dataset `neosantara/IndoTalk` (396,000 diálogos) con 5,000 pasos, 327 millones de tokens, tamaño de lote efectivo 32 y longitud de secuencia de 2,048 tokens. La segunda, un ajuste fino supervisado (SFT) sobre `neosantara/IndoTalkSFT` (~160,000 conversaciones e instrucciones) con 3,000 pasos, ~96 millones de tokens y lote efectivo de 16. Ambos entrenamientos se ejecutaron en una única GPU NVIDIA RTX 5090 Blackwell. Las métricas finales de SFT muestran una pérdida de entropía cruzada de ~2.60 y una precisión de token de ~51.71% en la predicción de respuestas del asistente. No se utilizó RLHF ni DPO.

## Capacidades

- Generación de texto en indonesio, orientado a diálogo y respuesta a instrucciones.
- Seguimiento de instrucciones en formato chat, mediante la plantilla de chat aplicada con `apply_chat_template`.
- Soporte de conversaciones multi-turno dentro de un contexto de 2,048 tokens.
- Implementación de técnicas avanzadas (MoE, MLA, Hyper-Connections, MTP) a escala reducida, útil para investigación y experimentación.
- No tiene soporte para tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidad multilingüe limitada al indonesio; no está entrenado para otros idiomas.

## Casos de uso

- Prototipado de chatbots en indonesio: el modelo puede usarse para crear prototipos rápidos de asistentes conversacionales en aplicaciones web o móviles, gracias a su pequeño tamaño y baja latencia en GPU.
- Investigación en arquitecturas MoE y atención latente: su implementación de DeepSeek-V2 a escala permite estudiar el comportamiento de estas técnicas en modelos pequeños, comparar con variantes densas o ajustar hiperparámetros.
- Generación de respuestas para preguntas frecuentes en indonesio: puede integrarse en sistemas simples de atención al cliente para responder consultas básicas, siempre que se supervise la salida por su tendencia a incoherencias.
- Entrenamiento y evaluación de técnicas de fine-tuning: al ser un modelo ligero, es adecuado para probar pipelines de SFT, DPO o RLHF en entornos con recursos limitados, sin necesidad de hardware de alta gama.
- Desarrollo de sistemas de generación de texto en entornos educativos: sirve como ejemplo didáctico para enseñar el funcionamiento de MoE y atención latente, al ser fácil de cargar y ejecutar.
- Aplicaciones de bajo coste en producción con requisitos mínimos: aunque no recomendable para producción crítica, puede desplegarse en entornos controlados donde la coherencia no sea esencial, como generación de ideas o borradores en indonesio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones comparativas. Las únicas métricas reportadas son las del entrenamiento: pérdida final de ~2.60 y precisión de token de ~51.71% en el conjunto de validación del SFT.

## Requisitos de hardware

- VRAM estimada: ~0.4 GB para el modelo en fp32 (según datos de LLM Explorer), aunque el uso real puede variar con el contexto y el tamaño del lote.
- GPU recomendadas: cualquier GPU NVIDIA con soporte para `bfloat16` (Ampere, Ada, Hopper) es suficiente; se recomienda al menos 4 GB de VRAM para operar con comodidad.
- El modelo es compatible con GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, así como GPUs profesionales como A100 o H100.
- No se recomienda su uso en CPU o GPUs antiguas (como T4) porque el código personalizado puede generar errores NaN con `bfloat16`.
- Opciones de despliegue: mediante `transformers` con `trust_remote_code=True`; no se han documentado despliegues con vLLM, llama.cpp u Ollama, y es probable que no sean compatibles sin adaptaciones.
- Latencia y throughput: no hay datos publicados; dado el tamaño, se espera una generación rápida en GPU modernas (p. ej., decenas de tokens por segundo), pero no se dispone de medidas concretas.

## Comparativa con modelos similares

No se han encontrado modelos comparables directamente disponibles en la información proporcionada. El modelo es único por su implementación de DeepSeek-V2 a escala de 110M, y no se dispone de otros modelos indonesios de tamaño similar con arquitectura MoE. Como referencia, se pueden citar modelos generales pequeños como `GPT-2` (124M) o `Mistral-7B` (7B), pero no son comparables en arquitectura ni en idioma. No hay datos de rendimiento para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo subentrenado: solo 5,000 pasos de pretraining y 3,000 de SFT, frente a los 100,000+ pasos típicos de modelos de producción. La generación suele ser incoherente o factualmente incorrecta.
- Vocabulario grande (129,280 tokens) en relación con el tamaño total: la mayoría de la capacidad se dedica a embeddings, lo que limita la capacidad de razonamiento.
- Contexto muy corto: solo 2,048 tokens, insuficiente para tareas que requieran historial extenso.
- Riesgo de alucinación: por su tamaño y subentrenamiento, puede inventar información o producir respuestas sin sentido.
- Limitación de idioma: solo indonesio, no se ha entrenado para otros idiomas.
- Requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar código arbitrario del autor.
- Inestabilidad numérica: la arquitectura Hyper-Connections puede desbordar el rango de `bfloat16`, por lo que se recomienda usar `torch_dtype=torch.float32` para evitar errores NaN.
- Licencia Apache 2.0 permite uso comercial, pero con las limitaciones técnicas mencionadas, no es recomendable para producción.

## Enlaces

- Modelo en Hugging Face: [neosantara/wader-100m](https://huggingface.co/neosantara/wader-100m)
- Modelo base: [neosantara/wader-100m-base](https://huggingface.co/neosantara/wader-100m-base)
- Dataset de SFT: [neosantara/IndoTalkSFT](https://huggingface.co/datasets/neosantara/IndoTalkSFT)
- Dataset de pretraining: [neosantara/IndoTalk](https://huggingface.co/datasets/neosantara/IndoTalk) (no listado en la página, pero se menciona en la model card)
- Sitio web de Neosantara: [https://www.neosantara.xyz/](https://www.neosantara.xyz/)
- Documentación de Neosantara: [https://docs.neosantara.xyz/en/models-overview](https://docs.neosantara.xyz/en/models-overview)
