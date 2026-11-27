# adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp2

## Resumen

Celerity 271M 8K — TPP ablation — ad0.4_ild_tpp2 es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de 271 millones de parámetros entrenado en hardware Cerebras y posteriormente convertido al formato de Hugging Face. Se trata de un experimento de ablación centrado en el papel del dropout de atención y en la métrica de tokens por parámetro (TPP) durante el preentrenamiento, no de un modelo orientado a producción. El autor, adpretko, publica el checkpoint con fines de reproducibilidad de un estudio de escalado y regularización.

El modelo emplea una arquitectura transformer con embeddings posicionales ALiBi y una longitud máxima de secuencia de 8192 tokens, lo que lo sitúa en el rango de modelos pequeños con contexto largo. El entrenamiento se realizó sobre el dataset CommonPile (pool TPP corregido sin repeticiones) durante 3305 pasos, con un total de 541.491.200 tokens vistos, es decir, aproximadamente 2 tokens por parámetro nominal.

Su relevancia es acotada pero concreta: sirve como referencia para estudiar cómo afecta un schedule de dropout de atención dependiente de capa (lineal, con extremo de 0.4) al comportamiento de un modelo pequeño entrenado con pocos tokens por parámetro. No hay información publicada sobre benchmarks, idiomas soportados ni licencia, lo que limita su uso fuera de entornos de experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi (custom_code, requiere trust_remote_code) |
| Parametros totales | 271M (según nombre del modelo; no se detalla desglose) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens (longitud máxima de secuencia durante entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch (repo de 0.5 GB, tag pytorch); no se confirma safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con embeddings posicionales ALiBi, una elección que favorece la extrapolación de contexto y que aquí se aplica con una ventana máxima de 8192 tokens. La innovación principal del checkpoint no reside en la arquitectura sino en el régimen de regularización: el dropout de atención no es uniforme, sino que sigue un schedule lineal dependiente de la capa con un extremo de 0.4 (parámetro `ad0.4` del experimento). El autor aclara explícitamente que esos valores son extremos de una programación lineal por capa, no probabilidades uniformes, y que el dropout se desactiva con `model.eval()`.

El entrenamiento se ejecutó en 2 sistemas CSX (Cerebras) con el runtime cbcore 2.6.0, usando un batch global de 20, learning rate pico de 0.15, weight decay de 0.003655458399453671 y tau_ema de 0.5518174516993821. Se completaron 3305 pasos sobre 541.491.200 tokens del dataset CommonPile (pool TPP corregido sin repeticiones), lo que equivale a unos 2 tokens por parámetro nominal. No se aplicaron residual dropout, stochastic depth ni LayerDrop. No se documenta RLHF, DPO ni ninguna fase de ajuste fino posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo de 271M parámetros preentrenado.
- Manejo de contextos de hasta 8192 tokens gracias a ALiBi, útil para tareas de recuperación en contexto largo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponible (no se especifican idiomas).
- No se documenta modo thinking, visión, audio ni ninguna modalidad adicional.
- Capacidad de servir como checkpoint de referencia para estudios de ablación de dropout y TPP.

## Casos de uso

- Investigación sobre regularización: el checkpoint permite reproducir y comparar el efecto de un schedule de dropout de atención lineal con extremo 0.4 frente a otras configuraciones de la misma familia Celerity, aislando la variable de dropout.
- Estudios de escalado tokens-por-parámetro: al estar entrenado con 2 TPP, sirve como punto de comparación en curvas de escalado para analizar la calidad con presupuestos de cómputo reducidos.
- Evaluación de ALiBi en contextos de 8K: adecuado para medir degradación de perplejidad a distintas distancias dentro de la ventana de 8192 tokens en un modelo pequeño.
- Reproducibilidad de pipelines Cerebras: el checkpoint y sus metadatos (runtime cbcore 2.6.0, commit del conversor) permiten validar flujos de conversión de formato Cerebras a Hugging Face.
- Prototipado de bajo coste: por su tamaño (271M) puede ejecutarse en hardware modesto para pruebas de integración de código personalizado (`trust_remote_code=True`) antes de pasar a modelos mayores.
- Docencia y experimentación académica: útil para ilustrar el impacto de hiperparámetros de regularización en modelos pequeños sin requerir clústeres de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamaño (271M parámetros), en FP32 ocuparía aproximadamente 1,1 GB de pesos, y en FP16/BF16 alrededor de 0,55 GB, a lo que habría que sumar memoria para activaciones y KV cache en contextos de hasta 8192 tokens.
- GPU recomendadas: no disponible. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM podría alojar el modelo en precisión reducida, pero no hay datos oficiales.
- Cabe en GPU de consumo: probablemente sí en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no está confirmado por el autor.
- Opciones de despliegue: no disponible. El modelo requiere `trust_remote_code=True` y código personalizado, lo que puede complicar su uso con vLLM, llama.cpp, Ollama o TGI sin adaptaciones.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (ad0.4_ild_tpp2) | 271M | 8192 | no disponible | Hugging Face (repo de investigación) |
| Alternativas de ~270M | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma familia o tamaño con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo ajustado para instrucciones ni para uso conversacional.
- Entrenado con solo ~541M tokens (2 TPP), un régimen muy bajo que limita la calidad frente a modelos con decenas o cientos de TPP.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- Idiomas soportados no documentados; el comportamiento multilingüe es incierto.
- Riesgo elevado de alucinación y de texto incoherente por el tamaño y el presupuesto de entrenamiento reducidos.
- Requiere `trust_remote_code=True` y código personalizado, lo que implica revisar el código del repo antes de ejecutarlo en producción.
- El dropout de atención con extremo 0.4 debe interpretarse como schedule lineal por capa, no como probabilidad uniforme; evaluar siempre con `model.eval()`.
- No hay benchmarks publicados que permitan estimar su calidad real.
- No apto para despliegues en producción sin una evaluación exhaustiva previa.

## Enlaces

- Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p4-ild-tpp2
- No se han encontrado otros enlaces (papers, blogs, repos o demos) en la información proporcionada.
