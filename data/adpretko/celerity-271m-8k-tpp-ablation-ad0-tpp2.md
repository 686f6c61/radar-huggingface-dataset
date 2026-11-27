# adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp2

## Resumen

Celerity 271M 8K — TPP ablation — ad0_ild_tpp2 es un checkpoint de investigación de la familia Celerity, un modelo de lenguaje de 271 millones de parámetros entrenado por Cerebras y publicado en Hugging Face por el usuario adpretko. Se trata de una ablación concreta dentro de un barrido experimental sobre la técnica TPP (tokens per parameter), en este caso con un valor nominal de 2 tokens por parámetro, cuyo objetivo es estudiar el efecto del régimen de entrenamiento sobre el rendimiento final del modelo.

El modelo emplea una arquitectura transformer con embeddings posicionales de tipo ALiBi, una longitud máxima de secuencia de 8192 tokens y un total de 3305 pasos de entrenamiento sobre 541.491.200 tokens del dataset CommonPile (pool corregido sin repeticiones). El entrenamiento se realizó sobre 2 sistemas CSX de Cerebras con un tamaño de lote global de 20 y una tasa de aprendizaje pico de 0,15, y el checkpoint resultante (`checkpoint_3305.mdl`) se convirtió al formato de Hugging Face mediante un conversor con commit específico.

Su relevancia es fundamentalmente investigadora: no es un modelo pensado para producción ni para uso general, sino un artefacto de ablación que permite a otros equipos reproducir o analizar el impacto de distintas configuraciones de entrenamiento (dropout de atención, escalado por capas, tokens por parámetro) en modelos de escala pequeña. La información pública disponible es muy limitada: no se declaran licencia, idiomas, pipeline ni resultados de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con embeddings posicionales ALiBi |
| Parámetros totales | 271M (según nombre del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Pesos PyTorch con código personalizado (`trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con embeddings posicionales ALiBi en lugar de posiciones aprendidas o rotatorias, lo que permite extrapolación relativa de posiciones y es coherente con la ventana de 8192 tokens declarada. El checkpoint corresponde al experimento `ad0_ild_tpp2`, una ablación del barrido TPP (tokens per parameter) con valor nominal 2, es decir, un régimen de entrenamiento de aproximadamente 2 tokens por parámetro (541,5M tokens para 271M parámetros).

Los hiperparámetros documentados incluyen una tasa de aprendizaje pico de 0,15, weight decay de 0,003655, tau_ema de 0,5518, tamaño de lote global de 20 y 3305 pasos de entrenamiento. El dropout de atención se define como un endpoint de una schedule lineal dependiente de la capa (valor final 0), no como una probabilidad uniforme; el dropout residual, stochastic depth y LayerDrop son todos 0,0. El dataset es CommonPile, en su variante "corrected no-repeat TPP pool". El entrenamiento se ejecutó sobre 2 sistemas CSX de Cerebras con el runtime cbcore 2.6.0, y la conversión a formato Hugging Face se realizó con un commit de conversor concreto (`0e3d5d3`).

## Capacidades

- Generación de texto autoregresiva básica, propia de un modelo de lenguaje de 271M parámetros.
- Razonamiento de contexto largo: ventana de 8192 tokens gracias a ALiBi.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se declara modo thinking, visión, audio ni otras capacidades especiales.
- El modelo debe cargarse con `trust_remote_code=True`, lo que implica código personalizado en el repositorio.

## Casos de uso

- Investigación sobre escalado y tokens por parámetro: el checkpoint sirve como punto de comparación directo en estudios que analicen cómo el régimen TPP (2 tokens por parámetro en este caso) afecta a la pérdida y a las capacidades emergentes en modelos pequeños.
- Ablación de schedules de dropout de atención: al tratarse de un experimento con endpoint de dropout 0 y escalado lineal por capas, permite aislar el efecto de esta configuración frente a otros checkpoints de la misma familia.
- Reproducibilidad de entrenamientos en Cerebras: los hiperparámetros completos (lr, weight decay, tau_ema, batch, pasos) permiten replicar el experimento en hardware CSX o comparar con ejecuciones en otras plataformas.
- Evaluación de extrapolación posicional con ALiBi: útil para probar el comportamiento del modelo en secuencias cercanas a 8192 tokens y comparar con alternativas basadas en RoPE.
- Filtrado y análisis de datasets: dado que se entrenó sobre CommonPile corregido sin repeticiones, puede emplearse como sonda para estudiar el efecto de la deduplicación en modelos de escala reducida.
- Prototipado de pipelines de carga con código personalizado: sirve para validar flujos de `trust_remote_code` y conversión de checkpoints Cerebras a Hugging Face en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 0,55 GB solo para pesos (271M × 2 bytes), más overhead de activaciones y caché KV para 8192 tokens.
- VRAM estimada en FP32: aproximadamente 1,1 GB para pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs de gama baja con 4-6 GB.
- GPU recomendadas para investigación a escala: A100, H100 o cualquier GPU con soporte de PyTorch; el modelo es lo bastante pequeño como para no requerir hardware de datacenter.
- Opciones de despliegue: PyTorch con `trust_remote_code=True` es la vía documentada; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI, y la presencia de código personalizado puede complicar la integración con estos runners.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | No disponible | Hugging Face, código personalizado |
| GPT-2 small | 124M | 1024 | MIT | Amplia, múltiples formatos |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Amplia, GGUF y safetensors |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Amplia, GGUF y safetensors |

La comparación es aproximada: no hay datos de rendimiento publicados para el modelo Celerity, por lo que la comparativa se limita a parámetros, contexto y licencia. Frente a GPT-2 small y Pythia-410M, el modelo destaca por su contexto de 8192 tokens y su origen en un barrido experimental controlado, pero carece de licencia declarada y de ecosistema de herramientas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Modelo de ablación: su propósito es experimental, no está ajustado para instrucciones ni para uso conversacional.
- Riesgo elevado de alucinación y baja calidad factual esperable en un modelo de 271M parámetros entrenado con solo 541M tokens.
- Idiomas no declarados: no hay garantía de competencia multilingüe; probablemente esté sesgado hacia el inglés por la composición de CommonPile.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de cargarlo.
- Sin pipeline declarado ni evaluación publicada: no hay evidencia de rendimiento en tareas concretas.
- El contexto de 8192 tokens es nominal; el rendimiento efectivo en secuencias largas con ALiBi no está documentado.
- Sin datos sobre sesgos: no se ha publicado ninguna evaluación de sesgo o toxicidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0-tpp2)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
