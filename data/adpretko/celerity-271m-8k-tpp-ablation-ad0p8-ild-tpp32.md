# adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp32

## Resumen

Celerity 271M 8K — TPP ablation — ad0.8_ild_tpp32 es un checkpoint de investigación de la familia Celerity, entrenado por Cerebras y convertido al formato de Hugging Face por el usuario adpretko. Se trata de un modelo de lenguaje de 271 millones de parámetros con una longitud máxima de secuencia de 8192 tokens, pensado como punto de una ablación sistemática sobre el régimen de entrenamiento (tokens por parámetro, TPP) y sobre la programación de dropout de atención.

El modelo resuelve un problema fundamentalmente experimental: aislar el efecto de una tasa de dropout de atención dependiente de la capa (con un extremo de 0,8 y escalado lineal) bajo un presupuesto nominal de 32 tokens por parámetro. El entrenamiento se realizó sobre 3 sistemas CSX de Cerebras durante 17 630 pasos, consumiendo aproximadamente 8,67 mil millones de tokens del dataset CommonPile (pool TPP corregido sin repeticiones).

Su relevancia es acotada y de carácter metodológico: no es un modelo orientado a producción ni a uso general, sino un artefacto reproducible para estudiar cómo afectan las decisiones de regularización y el presupuesto de cómputo al rendimiento de modelos pequeños con contexto largo. El repositorio tiene 0 descargas y 0 likes, lo que confirma su naturaleza de checkpoint de ablación más que de modelo distribuido.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con position embeddings ALiBi (detalles internos no disponibles) |
| Parámetros totales | 271 millones |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos PyTorch con código personalizado (`custom_code`, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con codificación posicional ALiBi, lo que permite extrapolación de contexto más allá de la longitud vista en entrenamiento. El checkpoint emplea una programación de dropout de atención dependiente de la capa con extremo 0,8 y escalado lineal; el autor aclara explícitamente que ese 0,8 es el extremo de la programación, no una probabilidad uniforme de dropout. El dropout residual, el stochastic depth y el LayerDrop están todos a 0,0. El dropout se desactiva con `model.eval()` durante la evaluación ordinaria.

El entrenamiento se realizó en 3 sistemas CSX de Cerebras con el runtime `cbcore 2.6.0`, durante 17 630 pasos con un batch global de 60, lo que arroja 8 665 497 600 tokens vistos (nominalmente 32 tokens por parámetro). Se usó una tasa de aprendizaje pico de 0,15, weight decay de 0,002741075441904568 y `tau_ema` de 0,13795436292484553. El dataset es CommonPile, en su variante "corrected no-repeat TPP pool". No se documenta en la información disponible el uso de RLHF, DPO ni ninguna fase de alineación posterior al preentrenamiento.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje causal, como corresponde a un transformer decoder preentrenado.
- Manejo de contexto largo de hasta 8192 tokens, con ALiBi como mecanismo de codificación posicional.
- No hay evidencia en la información disponible de soporte de tool calling, function calling ni razonamiento multi-paso estructurado.
- No hay evidencia de capacidades multimodales (visión, audio) ni de modo "thinking" explícito.
- Capacidades multilingües: no disponibles; el dataset CommonPile es predominantemente inglés, pero el autor no declara idiomas soportados.
- No se documentan capacidades de agente ni de instrucción (no hay fase de instruction tuning descrita).

## Casos de uso

- Investigación sobre programación de dropout de atención: el checkpoint sirve como punto de comparación directa frente a otras variantes de la misma ablación (distintos valores de `ad` y de `tpp`), permitiendo medir el efecto aislado de la regularización en la pérdida de validación.
- Estudios de leyes de escala con presupuesto fijo de tokens por parámetro: con 32 TPP nominales y 8,67 mil millones de tokens, es un punto útil para curvas de escalado en el régimen de modelos pequeños.
- Evaluación de ALiBi en contextos de 8K: permite analizar la degradación de perplejidad a lo largo de la ventana de 8192 tokens en un modelo de 271M, donde los efectos de extrapolación son más visibles.
- Reproducibilidad de entrenamientos en Cerebras: los hiperparámetros completos (lr, weight decay, batch, tau_ema, pasos) permiten replicar el experimento en hardware CSX y validar la infraestructura `cbcore`.
- Base para fine-tuning experimental: al ser un checkpoint de 271M en formato PyTorch, puede servir como inicialización para tareas downstream de investigación donde el coste de cómputo sea una restricción.
- Análisis de la composición de CommonPile: al usar el pool TPP corregido sin repeticiones, permite estudiar el impacto de la deduplicación en el rendimiento de modelos pequeños.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (271M × 4 bytes), más activaciones y caché KV para 8192 tokens.
- VRAM estimada en fp16/bf16: aproximadamente 0,55 GB para pesos; el coste dominante pasa a ser la caché KV con contexto de 8K.
- Cabe holgadamente en cualquier GPU de consumo con 8 GB o más (RTX 3060, RTX 4060, RTX 4090), e incluso en GPUs de 4 GB con cuantización.
- GPU recomendadas para experimentación a escala: A100 o H100 si se ejecutan barridos de ablación en paralelo; para inferencia individual basta una RTX 4090.
- Opciones de despliegue: al requerir `trust_remote_code=True` y pesos PyTorch con código personalizado, la integración con vLLM, llama.cpp u Ollama no está garantizada y no se documenta en la información disponible. La vía segura es `transformers` con `trust_remote_code=True`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Celerity 271M 8K (este) | 271M | 8192 | no disponible | Hugging Face, 0 descargas |
| GPT-2 medium | 355M | 1024 | MIT | Ampliamente disponible |
| Pythia-410M | 410M | 2048 | Apache 2.0 | Ampliamente disponible |
| Cerebras-GPT-256M | 256M | 2048 | Apache 2.0 | Hugging Face |

La comparación se limita a parámetros, contexto y licencia, ya que no hay datos de benchmarks publicados para este checkpoint. Frente a Cerebras-GPT-256M, la diferencia principal es la ventana de contexto (8192 frente a 2048) y el uso de ALiBi en lugar de embeddings posicionales aprendidos. Frente a Pythia-410M, este modelo es más pequeño pero duplica la longitud de contexto.

## Limitaciones y advertencias

- Es un checkpoint de ablación, no un modelo afinado para instrucciones: no se espera que siga instrucciones ni mantenga diálogos coherentes de forma fiable.
- Riesgo elevado de alucinación y de texto incoherente, propio de un modelo de 271M preentrenado sin alineación.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: no hay garantía de comportamiento multilingüe, y el dataset de origen (CommonPile) es mayoritariamente anglófono.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de cargarlo en entornos sensibles.
- El dropout de atención con extremo 0,8 debe interpretarse como parte de una programación dependiente de la capa; usarlo de forma uniforme en fine-tuning alteraría el comportamiento previsto.
- Sin datos de benchmarks, no es posible comparar su calidad de forma objetiva con alternativas.
- El repositorio no tiene descargas ni validación de la comunidad, por lo que no hay evidencia externa de que los pesos carguen correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adpretko/celerity-271m-8k-tpp-ablation-ad0p8-ild-tpp32
- Cerebras (organización responsable del entrenamiento original): https://www.cerebras.ai
- Dataset CommonPile: no disponible en la información proporcionada
- Paper o blog del experimento de ablación: no disponible en la información proporcionada
