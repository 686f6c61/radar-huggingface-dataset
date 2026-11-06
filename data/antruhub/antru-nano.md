# ANTRUhub/ANTRU-Nano

## Resumen

ANTRU-Nano es un transformer causal decoder-only de 79,5 millones de parámetros entrenado desde cero (inicialización aleatoria, sin base preentrenada) por el proyecto ANTRU, una familia de modelos locales autoentrenados publicada en Hugging Face bajo ANTRUhub. Su rasgo distintivo no es el rendimiento, sino la viabilidad del entrenamiento en hardware de consumo: se entrenó en un portátil con un Intel i7-8550U y una GeForce MX150 de 2 GB en una sesión de GPU de unos 40 minutos a ~761 tokens/segundo.

El modelo resuelve un problema educativo y de demostración: cómo entrenar un LLM completo con recursos mínimos. Se entrenó sobre un corpus de ~1,79 millones de tokens (Wikipedia en inglés más un currículo propio con identidad, explicaciones de Python, razonamiento matemático paso a paso y ejercicios aritméticos sintéticos). Con ~22 tokens de entrenamiento por parámetro, está muy por debajo del óptimo de Chinchilla, por lo que la propia model card advierte que es un artefacto educativo y no un asistente conversacional.

Es relevante como referencia para desarrolladores e investigadores que quieran entender el pipeline completo de preentrenamiento (tokenizador BPE-free propio, arquitectura pre-norm, embeddings atados) o replicar un entrenamiento local de bajo coste, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (pre-norm LayerNorm, FFN con GELU, embeddings posicionales aprendidos, embeddings de entrada/salida atados) |
| Parametros totales | 79.538.688 |
| Parametros activos | no disponible (no es MoE; todos los parámetros son activos) |
| Longitud de contexto | 1.024 tokens de ventana de atención (+ hasta 200K tokens de buffer de recuperación a nivel de aplicación) |
| Tipos de cuantizacion | no disponible (checkpoint en fp32 con estado del optimizador, ~911 MB) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoint PyTorch propio (antru_nano.pt, fp32 + estado del optimizador, ~911 MB); no usa formato safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional con normalización pre-norm (LayerNorm), FFN con activación GELU, embeddings posicionales aprendidos y embeddings de entrada y salida atados (tied embeddings), una elección habitual en modelos pequeños para reducir parámetros. La configuración es 768 de dimensión oculta, 12 capas, 12 cabezas de atención (head_dim de 64) y FFN de 2048. El tokenizador es propio, de tipo word-level sin BPE, con vocabulario de 16.384 tokens construido por frecuencia y mecanismo de fallback a bytes/caracteres, lo que evita fallos por tokens desconocidos.

El entrenamiento usó un corpus de ~1,79 millones de tokens compuesto por Wikipedia en inglés (70 %) y un currículo ANTRU (declaraciones de identidad y persona, ~25 explicaciones verificadas de Python/código, razonamiento matemático paso a paso, hechos de una base de conocimiento local y 30.000 ejercicios aritméticos sintéticos), con repetición de partes del currículo (6× y 4×) para que un modelo tan pequeño pudiera aprenderlas. La receta fue AdamW con learning rate 3e-4, decay coseno, warmup de 100 pasos, grad clip 1.0, batch 1 × secuencia 512, una sola época, con la pérdida bajando de 9,7 a ~3,3. No hay indicios de RLHF ni DPO. Todo el entrenamiento cabe en los 2 GB de VRAM de la MX150 (~1,8 GB al 99 % de utilización).

## Capacidades

- Generación de texto en inglés con estructura de tokens y orden de palabras aprendidos, aunque de coherencia local limitada (no conversación fluida).
- Respuesta a aritmética simple de los patrones entrenados (por ejemplo, sumas tipo "25 + 17" provenientes de los ejercicios sintéticos).
- Reproducción del currículo de identidad ("I am ANTRU...") cuando se le pregunta en ese estilo.
- Tolerancia a caracteres desconocidos gracias al fallback a bytes/caracteres del tokenizador (sin fallos de token desconocido).
- Ventana de atención de 1.024 tokens, con un buffer de recuperación a nivel de aplicación de hasta 200K tokens (mecanismo externo, no atención nativa).
- No soporta tool calling, function calling, agentes, visión ni audio; no es un modelo instruido ni alineado.

## Casos de uso

- Enseñanza del preentrenamiento de LLMs: el pipeline completo (tokenizador, arquitectura, bucle de entrenamiento) está incluido en la carpeta `code/`, ideal para cursos o talleres donde se quiera entrenar un modelo real en clase.
- Reproducción en hardware de bajo coste: al entrenarse en una GPU de 2 GB, sirve como referencia para verificar que un setup doméstico sin GPU dedicada moderna puede completar un entrenamiento.
- Experimentación con tokenizadores word-level sin BPE: útil para estudiar el efecto del fallback a bytes y del vocabulario reducido (16.384 tokens) en modelos pequeños.
- Estudio de curvas de pérdida y subentrenamiento: con pérdida final ~3,3 y ~22 tokens por parámetro, permite analizar empíricamente el efecto de alejarse del óptimo de Chinchilla.
- Pruebas de generación controlada: la recomendación de temperatura baja (0,2–0,3) y top_k ≤ 5 lo hace adecuado para experimentos de decodificación restringida.
- Base para proyectos educativos de fine-tuning: su tamaño (79,5M) permite realizar fine-tuning o ablations en portátiles sin coste de cómputo apreciable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Como referencia de entrenamiento, la model card indica una velocidad de ~761 tokens/segundo en la MX150 y una pérdida final de ~3,3 tras una época.

## Requisitos de hardware

- Inferencia: el checkpoint completo (fp32 + estado del optimizador) ocupa ~911 MB; solo los pesos (79,5M en fp32) ocupan ~318 MB, por lo que la inferencia es viable en cualquier equipo moderno sin GPU dedicada.
- Entrenamiento: se completó en una GeForce MX150 de 2 GB (~1,8 GB de VRAM usados al 99 % de utilización), con CPU Intel i7-8550U; cualquier GPU con ≥2 GB de VRAM es suficiente.
- Cabe sobradamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso integradas con memoria compartida.
- Despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI (usa una clase PyTorch propia independiente de `transformers`); se ejecuta cargando `AntruTorchModel` desde el código incluido en el repo.
- Rendimiento de inferencia: no disponible; como referencia, el entrenamiento alcanzó ~761 tokens/segundo en la MX150.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Entrenamiento | Uso previsto |
|---|---|---|---|---|---|
| ANTRU-Nano | 79,5M | 1.024 tokens | Apache-2.0 | Desde cero, 1,79M tokens, portátil | Educativo |
| GPT-2 small (124M) | 124M | 1.024 tokens | Modificada MIT (OpenAI) | Desde cero, ~8M tokens (WebText) | Referencia histórica/investigación |
| TinyLlama 1.1B | 1.100M | 2.048 tokens | Apache-2.0 | Desde cero, ~3 billones de tokens | Investigación y despliegue ligero |
| Pythia-70M (EleutherAI) | 70M | 2.048 tokens | Apache-2.0 | Desde cero, ~300.000M tokens (The Pile) | Investigación de scaling laws |

ANTRU-Nano comparte rango de tamaño con Pythia-70M y GPT-2 small, pero su volumen de entrenamiento (~1,79M tokens) es varios órdenes de magnitud inferior, lo que explica la brecha de calidad: los otros modelos están pensados para investigación con rendimiento medible, mientras que ANTRU-Nano se posiciona explícitamente como artefacto educativo entrenado en hardware de consumo.

## Limitaciones y advertencias

- Subentrenamiento severo: ~22 tokens de entrenamiento por parámetro frente a las ~20× más datos que sugeriría el óptimo de Chinchilla; el texto generado es de coherencia local, no respuestas fluidas.
- La propia model card advierte que no es un asistente de chat; esperar respuestas conversacionales de calidad es un error de uso.
- Riesgo alto de alucinación y de texto incoherente; la generación recomendada requiere temperatura baja (0,2–0,3), top_k ≤ 5 y prompts cortos en el estilo del currículo.
- Solo inglés; el vocabulario word-level de 16.384 tokens limita la cobertura léxica y la capacidad de generalizar a texto fuera del corpus.
- Sin alineación (no RLHF/DPO), sin soporte de instrucciones, sin tool calling ni capacidades multimodales.
- Incompatibilidad con el ecosistema estándar: no usa `transformers`, safetensors ni GGUF, lo que impide integrarlo en pipelines habituales de inferencia sin adaptación.
- La ventana de 200K tokens es un mecanismo de recuperación a nivel de aplicación, no atención nativa de 200K; no debe compararse con contextos largos de otros modelos.
- Licencia Apache-2.0 sin restricciones de uso comercial, aunque el corpus incluye texto de Wikipedia bajo CC BY-SA 3.0, lo que puede implicar obligaciones de atribución en derivados.
- Métricas de popularidad iniciales muy bajas (0 descargas, 1 like en el momento de la ficha), sin comunidad ni validación externa publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ANTRUhub/ANTRU-Nano
- Organización del proyecto ANTRU: https://huggingface.co/ANTRUhub
- Código incluido en el repositorio (carpeta `code/` con `antru_model_torch.py`, `antru_tokenizer.py`, `antru_config.py`): disponible dentro del repo del modelo
- Paper, blog o demo: no disponible
