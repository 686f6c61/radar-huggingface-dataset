# adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp4

## Resumen

Celerity 271M 8K — TPP ablation — ad0.2_ild_tpp4 es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de 271 millones de parámetros entrenado originalmente en hardware Cerebras y convertido posteriormente al formato de Hugging Face. Lo publica el usuario adpretko como parte de una ablación sobre el régimen de entrenamiento (tokens por parámetro, TPP) y sobre el schedule de dropout de atención. No es un modelo pensado para producción, sino una pieza de un experimento controlado que compara variantes de entrenamiento sobre el mismo corpus.

El modelo usa una arquitectura transformer con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens. Se entrenó durante 4722 pasos sobre 1.083 millones de tokens del dataset CommonPile (pool TPP corregido sin repeticiones), con un tamaño de batch global de 28. La variante concreta de esta ficha corresponde al endpoint de attention dropout 0.2 con escalado lineal por capa, learning rate pico de 0.15 y weight decay de aproximadamente 0.0036.

Su relevancia es fundamentalmente metodológica: permite estudiar cómo afectan el dropout de atención dependiente de capa y la relación tokens/parámetro al comportamiento de un modelo pequeño con contexto largo. No hay información publicada sobre benchmarks, licencia, idiomas soportados ni pipeline de uso, por lo que debe tratarse como un artefacto de investigación reproducible más que como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi |
| Parametros totales | 271M (nominal, segun el nombre del modelo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (maximum sequence length durante entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch con `custom_code` (requiere `trust_remote_code=True`); repo de 0.5 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con posición codificada mediante ALiBi, lo que le permite extrapolar más allá de la longitud vista durante el entrenamiento sin embeddings posicionales aprendidos. La innovación técnica destacable del checkpoint es el schedule de attention dropout dependiente de la capa: el valor 0.2 del nombre no es una probabilidad uniforme, sino el endpoint de una rampa lineal que escala el dropout por profundidad de capa (`ad0.2_ild_tpp4` = attention dropout 0.2, linear layer-dependent, 4 tokens por parámetro). El dropout se desactiva en evaluación con `model.eval()`.

El entrenamiento se realizó en 2 sistemas CSX (Cerebras) con runtime cbcore 2.6.0, 4722 pasos, batch global de 28 y learning rate pico de 0.15. Se usaron 1.083.113.472 tokens del dataset CommonPile en su variante "corrected no-repeat TPP pool", es decir, un pool corregido para evitar repeticiones y ajustado al régimen de tokens por parámetro del experimento. El weight decay fue de 0.003618281275599213 y tau_ema de 0.39019386207371326. No se menciona RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva básica, condicionada por el preentrenamiento en CommonPile.
- Manejo de contexto de hasta 8192 tokens gracias a ALiBi.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el dataset de origen (CommonPile) es mayoritariamente inglés, pero el autor no declara idiomas.
- Sin modo "thinking", visión ni audio.
- El checkpoint está pensado para evaluación con `model.eval()`; el dropout solo se aplica en modo entrenamiento.

## Casos de uso

- Estudio de ablaciones de dropout de atención: comparar este checkpoint con otras variantes del mismo experimento para aislar el efecto del endpoint 0.2 y del escalado lineal por capa en la calidad del modelo.
- Investigación sobre regímenes tokens/parámetro: usar el checkpoint como punto de datos en estudios que relacionan TPP con rendimiento en modelos pequeños.
- Reproducibilidad de entrenamiento en Cerebras: servir como referencia para validar pipelines cbcore 2.6.0 y conversiones al formato Hugging Face.
- Evaluación de extrapolación posicional con ALiBi: probar el modelo en secuencias cercanas a 8192 tokens para estudiar el comportamiento de ALiBi en modelos de 271M.
- Baseline en experimentos de eficiencia: comparar throughput y calidad frente a otros modelos de ~270M en tareas de lenguaje general.
- Docencia y experimentación académica: modelo pequeño (0.5 GB de repo) que cabe en hardware modesto y permite reproducir análisis de dinámica de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (271M × 4 bytes), más activaciones y caché KV para 8192 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.).
- GPU recomendadas para experimentación: RTX 3090/4090 para mayor throughput; A100/H100 no son necesarias para inferencia, aunque sí para reproducir el entrenamiento original.
- Opciones de despliegue: carga vía `transformers` con `trust_remote_code=True`; no hay confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, y el formato `custom_code` complica la conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, `custom_code` | Checkpoint de ablación, sin benchmarks |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Hugging Face, transformers estándar | Suite de investigación con checkpoints intermedios |
| GPT-2 medium | 355M | 1024 | MIT | Hugging Face, transformers estándar | Referencia clásica de tamaño similar |
| Cerebras-GPT-256M | 256M | 2048 | Apache 2.0 | Hugging Face, transformers estándar | Entrenado en Cerebras, comparable en procedencia |

La comparación es aproximada: no hay datos de rendimiento de este checkpoint que permitan contrastar calidad frente a las alternativas.

## Limitaciones y advertencias

- No hay licencia declarada: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue productivo.
- Modelo de investigación sin alineación (sin RLHF/DPO): alta probabilidad de salidas tóxicas, sesgadas o incoherentes en uso conversacional.
- Riesgo elevado de alucinación y baja fiabilidad factual por el tamaño (271M) y el volumen de entrenamiento (~1,08 mil millones de tokens, ~4 TPP).
- Idiomas soportados no documentados; probable sesgo hacia el inglés por la composición de CommonPile.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- El dropout de atención solo se desactiva con `model.eval()`; usarlo en modo entrenamiento por error altera las salidas.
- El nombre del experimento (`ad0.2_ild_tpp4`) hace referencia a una ablación; no debe interpretarse como una versión "final" o recomendada del modelo.
- Sin pipeline declarado ni benchmarks: no hay evidencia pública de su calidad en tareas concretas.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p2-ild-tpp4
- Dataset CommonPile: no disponible en la informacion proporcionada
- Paper o blog del experimento Celerity: no disponible en la informacion proporcionada
- Repositorio cbcore: no disponible en la informacion proporcionada
