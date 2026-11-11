# davidheineman/nanogpt-ladder-v3-web-heavy-16m-100tpp-seed-1337

## Resumen

NanoGPT Ladder v3 · web-heavy · 16M · 100 TPP es un modelo de lenguaje de tipo base (checkpoint de preentrenamiento completado) desarrollado por davidheineman dentro de la serie NanoGPT Ladder v3. Se trata de una reproducción a pequeña escala de la arquitectura GPT-2 con 15.851.520 parámetros, entrenada sobre 1.585.152.000 tokens de predicción durante 48.375 pasos de optimizador con semilla 1337. Su propósito es servir como punto de referencia controlado para estudiar el efecto del presupuesto de tokens por parámetro (TPP) y de la composición de la mezcla de datos en el preentrenamiento.

El modelo emplea una mezcla "web-heavy" basada en la receta congelada del pool Dolma3 Dolmino, en la que el 80% de los datos se asigna al dominio nombrado (web). Los pesos son anteriores a cualquier etapa de acondicionamiento tiny-rl, SFT o RL, por lo que se comportan como un modelo base puro: aceptan prompts de texto plano y no siguen instrucciones ni mantienen formato conversacional.

Es relevante ahora porque forma parte de una escalera de modelos de distintos tamaños y presupuestos de tokens entrenados de forma independiente, lo que permite análisis reproducibles de escalado y de mezcla de datos. No obstante, su escala (16M de parámetros, contexto de 1.024 tokens) lo sitúa como objeto de investigación, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (14 capas, ancho 192, 6 cabezas de atencion, embeddings atados, RoPE) |
| Parametros totales | 15.851.520 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos originales en float32; el autor no publica variantes cuantizadas) |
| Idiomas soportados | no disponible (tokenizador GPT-2, predominantemente ingles en la practica) |
| Licencia | no disponible |
| Formato de pesos | PyTorch nativo (`model.pt` con claves `model`, `config`, `identity`, `run`); no usa Transformers AutoModel |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 14 capas, dimensión de embedding de 192, 6 cabezas de atención, embeddings de entrada y salida atados y codificación posicional rotatoria (RoPE). Usa el tokenizador GPT-2 de tiktoken con vocabulario rellenado hasta 50.304 entradas. El checkpoint incluye `model.py` y `generate.py` con un cargador propio, ya que la arquitectura no se carga mediante `AutoModel` de Transformers.

El preentrenamiento se completó con 1.585.152.000 tokens de predicción en 48.375 pasos de optimizador (100 tokens por parámetro, TPP), semilla 1337. La mezcla de datos sigue la receta congelada del pool Dolma3 Dolmino con configuración web-heavy: el 80% de los tokens corresponde al dominio web designado. El archivo `metadata.json` registra revisiones exactas de las fuentes, pesos de mezcla y hashes SHA256. No se aplicaron etapas posteriores de SFT, RLHF/DPO ni acondicionamiento tiny-rl. El estado del optimizador no se incluye en el checkpoint, aunque este admite inferencia y fine-tuning posterior.

## Capacidades

- Generación de texto autoregresiva a partir de prompts de texto plano (modelo base, sin formato de instrucciones).
- Modelado de lenguaje y evaluación de pérdida/BPB sobre texto; las métricas publicadas son de lenguaje, no de resolución de tareas.
- Fine-tuning posterior: el checkpoint conserva pesos atados y permite continuar el entrenamiento.
- Decodificación greedy (`temperature=0`) o con muestreo; ejecución en CUDA, Apple MPS o CPU mediante `device=auto`.
- No dispone de soporte entrenado de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidad multilingüe no documentada; el tokenizador GPT-2 y la mezcla web implican un sesgo hacia el inglés.

## Casos de uso

- Investigación sobre escalado de presupuesto de tokens: comparar este punto (100 TPP) con otros modelos de la misma escalera para medir cómo varía la pérdida con el número de tokens por parámetro.
- Estudio de mezclas de datos: usar la configuración web-heavy (80% del dominio nombrado) como brazo de control frente a otras mezclas de la receta Dolma3 Dolmino.
- Reproducibilidad de experimentos: el registro de revisiones, pesos de mezcla y SHA256 en `metadata.json` permite replicar exactamente el corpus de entrenamiento.
- Baseline de referencia en pipelines de evaluación de modelos pequeños: servir como punto de comparación de pérdida/BPB frente a modelos de 16M entrenados con otras recetas.
- Docencia y prototipado de arquitecturas GPT: el par `model.py`/`generate.py` con cargador propio sirve para estudiar la implementación de RoPE, embeddings atados y atención multi-cabeza a pequeña escala.
- Fine-tuning exploratorio en dominios concretos: al incluir pesos base sin SFT, es un punto de partida barato para experimentos de adaptación con recursos limitados.
- Pruebas de infraestructura de inferencia en CPU/MPS: su tamaño reducido permite validar flujos de despliegue y scripts de generación antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que `results.json` contiene el registro de finalización y las evaluaciones finales, y que las mediciones finales de BPB/pérdida son evaluaciones de modelado de lenguaje, no precisión en resolución de tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (15,85M de parámetros, aproximadamente 63 MB de pesos) más el estado de activaciones para contexto de 1.024 tokens; el repositorio completo ocupa 0,1 GB.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), en Apple Silicon vía MPS y en CPU.
- GPU recomendadas: no se requieren GPU de datacenter (A100, H100) para inferencia; cualquier GPU con soporte CUDA es suficiente.
- Opciones de despliegue: carga nativa con PyTorch mediante `model.py` y `generate.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que usa un cargador propio y no `AutoModel`.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera que sean muy bajos en latencia, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NanoGPT Ladder v3 web-heavy 16M 100 TPP | 15,85M | 1.024 | no disponible | PyTorch (`model.pt`) | Mezcla web-heavy, 100 TPP, semilla 1337 |
| Otros modelos de la colección NanoGPT Ladder v3 | no disponible | no disponible | no disponible | PyTorch | Misma escalera; distintos tamanos, mezclas y presupuestos de tokens |
| GPT-2 small (referencia arquitectonica) | 124M | 1.024 | MIT (referencia) | safetensors/PyTorch | Arquitectura similar pero ~8 veces mayor; no forma parte de la escalera |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación con GPT-2 small se ofrece solo como referencia de escala y arquitectura, no de resultados.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones, no mantiene formato conversacional y no debe usarse como asistente directo.
- Riesgo elevado de alucinación y de texto incoherente por su escala reducida (16M de parámetros) y su contexto limitado a 1.024 tokens.
- Sesgos derivados de la mezcla web-heavy (80% del dominio nombrado) y del tokenizador GPT-2, con sesgo hacia el inglés; no hay evaluación de sesgos publicada.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados no documentados; el rendimiento fuera del inglés es incierto.
- Sin soporte de tool calling, agentes, visión ni audio; no apto para tareas que requieran estas capacidades.
- Las métricas publicadas son de modelado de lenguaje (BPB/pérdida), no de precisión en tareas; no deben interpretarse como rendimiento funcional.
- No se incluye estado del optimizador; reanudar el entrenamiento exacto no es posible desde este checkpoint.
- No hay variantes cuantizadas ni integración con ecosistemas estándar (Transformers, vLLM), lo que limita su despliegue en infraestructura existente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidheineman/nanogpt-ladder-v3-web-heavy-16m-100tpp-seed-1337
- Colección de modelos completados NanoGPT Ladder v3: https://huggingface.co/collections/davidheineman/nanogpt-ladder-v3-completed-pretrained-models-6af4b12b59e767d4e7c27020
- Dataset de referencia: https://huggingface.co/datasets/allenai/dolma3_dolmino_pool
