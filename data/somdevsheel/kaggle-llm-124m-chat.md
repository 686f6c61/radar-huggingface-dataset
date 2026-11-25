# somdevsheel/kaggle-llm-124m-chat

## Resumen

Prajna AI 124M Chat (publicado originalmente como `kaggle-llm-124m-chat`) es un modelo de lenguaje conversacional de 123,6 millones de parámetros entrenado desde cero por el desarrollador independiente somdevsheel sobre GPUs gratuitas de Kaggle (2x NVIDIA T4). Sigue una arquitectura transformer decoder-only de estilo LLaMA con RoPE, RMSNorm pre-norm, SwiGLU, sin sesgos y embeddings atados, con 12 capas, dimensión oculta 768, 12 cabezas de atención y una ventana de contexto de 4.096 tokens.

El modelo se presenta explícitamente como un proyecto de aprendizaje y no como un asistente de producción. Se preentrenó con 1.920 millones de tokens de FineWeb-Edu, se extendió su contexto de 1.024 a 4.096 tokens con 580 millones de tokens de texto en inglés centrado en India y se afinó con supervisión sobre 457.000 conversaciones en inglés de smol-smoltalk, 27.000 conversaciones en hindi romanizado/Hinglish de samvaad-hi-v1 y 1.500 conversaciones sintéticas de identidad.

Su relevancia es fundamentalmente didáctica y de investigación: demuestra un pipeline completo de preentrenamiento, extensión de contexto y SFT de chat con recursos mínimos (unas 35 horas acumuladas en 2x T4), con licencia Apache 2.0 y pesos en formato safetensors y ONNX. No compite en capacidad con modelos de su misma talla entrenados a mayor escala, pero sí sirve como referencia reproducible para estudiar el entrenamiento de modelos pequeños desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA: RoPE (theta 100.000), RMSNorm pre-norm, SwiGLU, sin sesgos, embeddings atados |
| Parametros totales | 123.587.328 (85,0M no-embedding) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors fp16 y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles e hindi romanizado (Hinglish); no entrena escritura devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Tokenizador | BPE de GPT-2 (vocabulario ampliado a 50.304) |
| Forma | 12 capas, hidden 768, 12 cabezas, FFN 2048 |
| Modelo base | somdevsheel/prajna-ai-124m-base |
| Tamano del repo | 2,6 GB |
| Descargas / likes | 653 / 1 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clásico de la familia LLaMA, sin innovaciones estructurales: atención multi-cabeza estándar (no GQA), RoPE con theta 100.000 para la codificación posicional, RMSNorm en pre-norm, activación SwiGLU en la FFN y embeddings atados entre entrada y salida. El tokenizador es el BPE de GPT-2 con el vocabulario rellenado hasta 50.304 entradas, lo que permite usar `LlamaForCausalLM` con herramientas estándar de `transformers`.

El entrenamiento se dividió en tres fases. El preentrenamiento consumió 1.920 millones de tokens de FineWeb-Edu (muestra de 10B) en dos ejecuciones de 3.661 pasos de 524K tokens, con pérdida de validación 3,30 (perplejidad 27) tras unas 21 horas en 2x T4. La extensión de contexto llevó la ventana de 1.024 a 4.096 tokens con 580 millones de tokens de texto en inglés centrado en India (Sangraha, Wikipedia, FineWeb-Edu) durante 2.211 pasos de 262K tokens, reduciendo la pérdida de validación a 4.096 tokens de 5,02 a 3,25. El SFT de chat usó 457K conversaciones de smol-smoltalk, 27K de samvaad-hi-v1 en escritura latina y 1.500 conversaciones de identidad sintéticas, empaquetadas en bloques de 4.096 tokens (402M tokens), con pérdida calculada solo sobre los tokens del asistente y reducida de 2,49 a 1,46.

El stack técnico incluye PyTorch DDP sobre 2 GPUs, precisión mixta fp16 con escalado de pérdida, AdamW con betas (0,9, 0,95) y weight decay 0,1, y un schedule coseno ajustado automáticamente al límite de 12 horas por sesión de Kaggle. No se aplicó RLHF ni DPO; el alineamiento se limita al SFT supervisado.

## Capacidades

- Generación de texto conversacional multi-turno siguiendo una plantilla de chat explícita con etiquetas `<|system|>`, `<|user|>` y `<|assistant|>`.
- Respuesta en inglés y en hindi romanizado (Hinglish), con fluidez superficial en este último pero coherencia limitada.
- Escritura de código corto y sencillo: inversión de cadenas, comprobación de primos y funciones de complejidad similar.
- Capacidad de autodescripción de identidad (se identifica como Prajna AI) gracias a las conversaciones sintéticas de identidad del SFT.
- Manejo de contexto de hasta 4.096 tokens, suficiente para conversaciones de varias rondas o fragmentos de código moderados.
- No dispone de tool calling, function calling, capacidades de agente, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Docencia y demostración de pipelines de entrenamiento: el modelo sirve para ilustrar en clase o taller las tres fases (preentrenamiento, extensión de contexto y SFT) con curvas de pérdida y comparativas entre versiones v3, v4 y v5 publicadas por el autor.
- Investigación sobre modelos pequeños en contextos de cómputo limitado: permite reproducir experimentos de escalado, ablaciones de contexto o estrategias de empaquetado de secuencias sin necesidad de clústeres GPU.
- Prototipado de interfaces de chat: su plantilla de chat explícita y su compatibilidad con `transformers` y `text-generation-inference` permiten montar demos de UI conversacional en minutos, aceptando que las respuestas factuales no son fiables.
- Generación de snippets de código triviales en entornos educativos: útil para ejemplos de inversión de cadenas o comprobación de primos en tutoriales, no para código de producción.
- Experimentación con Hinglish: sirve como base para estudiar el comportamiento de modelos entrenados con datos romanizados de samvaad-hi-v1, aunque sus respuestas en ese idioma suelen ser incoherentes.
- Base para fine-tuning posterior: al estar bajo Apache 2.0 y con pesos safetensors estándar, puede servir como punto de partida para SFT específico de dominio en tareas acotadas donde el conocimiento factual no sea crítico.
- Pruebas de infraestructura de despliegue: su tamaño reducido permite validar pipelines de vLLM, TGI u ONNX Runtime en hardware modesto antes de migrar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor solo reporta pérdidas de validación por fase y una comparativa entre versiones del propio modelo sobre conjuntos retenidos, medidas en pérdida por token del asistente sobre bloques de 1.024 tokens (menor es mejor):

| Version | smol-smoltalk val | samvaad (Hinglish) val |
|---|---|---|
| v3 (contexto 1.024, SFT en ingles) | 1,450 | 3,543 |
| v4 (contexto 1.024, + Hinglish) | 1,458 | 2,475 |
| v5 (esta version, contexto 4.096) | 1,415 | 2,318 |

Pérdidas de validación por fase reportadas por el autor: preentrenamiento 3,30 (perplejidad 27); extensión de contexto 5,02 a 3,25 a 4.096 tokens; SFT sobre tokens del asistente 2,49 a 1,46.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 0,25 GB para los pesos (123,6M parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En cuantización de 8 bits o 4 bits (no documentada por el autor, pero aplicable con herramientas estándar) el modelo ocuparía del orden de 125 MB o 65 MB de pesos, respectivamente.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso GPUs de portátil con 4 GB; también funciona en CPU para demos de baja concurrencia.
- Cabe en GPUs consumer sin problema; el autor lo entrenó en 2x NVIDIA T4, lo que da una idea del perfil de cómputo.
- Opciones de despliegue: `transformers` (probado por el autor), ONNX Runtime (hay pesos ONNX en el repo), y por compatibilidad con `text-generation-inference` y endpoints compatibles, también TGI y servidores compatibles con la API de OpenAI. No se documenta soporte verificado de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Prajna AI 124M Chat | 123,6M | 4.096 | Apache 2.0 | Entrenado desde cero en 2x T4; sin benchmarks estándar publicados |
| SmolLM-135M (HuggingFaceTB) | 135M | 2.048 (versión instruct) | Apache 2.0 | Entrenado a mayor escala; usado como fuente de datos de SFT por este modelo |
| GPT-2 small (OpenAI) | 124M | 1.024 | MIT (pesos) | Referencia histórica; sin formato de chat nativo |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 | Apache 2.0 | Cuatro veces mayor; capacidades multilingües y de código muy superiores |

La comparación directa con SmolLM-135M es la más pertinente por tamaño y licencia, aunque no se dispone de cifras de benchmarks comunes para contrastar. Frente a GPT-2 small, Prajna AI añade plantilla de chat y contexto cuatro veces mayor, pero carece de la validación empírica extensa del modelo de OpenAI. Qwen2.5-0.5B-Instruct, pese a ser cuatro veces mayor, es la alternativa práctica si se necesita un modelo pequeño realmente utilizable en producción.

## Limitaciones y advertencias

- Alucinación severa: con unos 20 tokens de preentrenamiento por parámetro (en el límite Chinchilla), el conocimiento factual es muy limitado; el autor documenta que inventa definiciones, por ejemplo para "DSA en informática".
- Sin alineamiento por preferencias: no hay RLHF ni DPO, solo SFT, por lo que no existen garantías de seguridad ni de rechazo de peticiones dañinas.
- Hinglish fluido en apariencia pero a menudo incoherente; no se entrenó escritura devanagari, así que el hindi nativo no está soportado.
- Código: los fragmentos cortos suelen ser correctos, pero el código largo o con especificaciones vagas falla con frecuencia.
- Autodescripción parcialmente fiable: acierta nombre y creador, pero puede añadir detalles inventados.
- No apto para respuestas médicas, legales, financieras o factuales en producción.
- Contexto limitado a 4.096 tokens y sin soporte de tool calling ni agentes.
- Licencia Apache 2.0 permite uso comercial, pero la calidad del modelo hace desaconsejable emplearlo en entornos productivos reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somdevsheel/kaggle-llm-124m-chat
- Modelo base (solo preentrenamiento): https://huggingface.co/somdevsheel/prajna-ai-124m-base
- Dataset de preentrenamiento FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset de SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset de SFT samvaad-hi-v1: https://huggingface.co/datasets/sarvamai/samvaad-hi-v1
