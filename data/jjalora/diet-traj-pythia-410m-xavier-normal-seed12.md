# jjalora/diet-traj-pythia-410m-xavier-normal-seed12

## Resumen

`diet-traj-pythia-410m-xavier-normal-seed12` es un checkpoint de investigación publicado por el usuario `jjalora` dentro de la campaña DIET, un estudio de trayectorias de entrenamiento en el espacio de pesos. No es un modelo nuevo en el sentido de arquitectura o capacidades: es una reproducción desde cero de Pythia-410M de EleutherAI, entrenada con la receta abierta de Pythia sobre el mismo flujo de tokens (`EleutherAI/pile-standard-pythia-preshuffled`), con la particularidad de que solo varían la semilla aleatoria y el esquema de inicialización de pesos respecto al run canónico. En este caso concreto, el esquema de inicialización es `xavier_normal` con semilla 12.

El interés del modelo es, por tanto, metodológico más que de producto. Permite a investigadores comparar cómo evoluciona la pérdida a lo largo del entrenamiento entre runs que difieren únicamente en condiciones iniciales, gracias a que el repositorio incluye checkpoints intermedios por step y un `losses.csv` con pérdida de entrenamiento y de validación recalculada de forma homogénea para todos los checkpoints. La arquitectura es la de Pythia-410M: un transformer decoder-only tipo GPT-NeoX con 405.334.016 parámetros reales según los safetensors, contexto de 2048 tokens y licencia Apache 2.0.

Es relevante ahora porque la comunidad de interpretabilidad y de estudio de dinámicas de entrenamiento necesita réplicas controladas de modelos abiertos con checkpoints densos. Este modelo encaja en ese nicho: no compite con LLMs de propósito general, sino que sirve como material experimental reproducible en el espacio de pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-NeoX (familia Pythia) |
| Parametros totales | 405.334.016 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (receta Pythia; no se explicita en la model card, pero es el contexto estándar de Pythia-410M) |
| Tipos de cuantizacion | No disponible (pesos publicados en float16 safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (float16) por rama `stepN`; `main` con pesos finales |

## Arquitectura y entrenamiento

La arquitectura es la de Pythia-410M: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos. El entrenamiento sigue la receta oficial de EleutherAI (`models/410M/pythia-410m.yml`): AdamW con learning rate 3e-4, betas (0.9, 0.95), weight decay 0.1 sin decaimiento en LayerNorm ni bias, grad clipping 1.0, schedule coseno hasta 3e-5 durante 143.000 pasos, 1.430 pasos de warmup, autocast fp16 con pesos maestros en fp32 y batch global de 1024 secuencias × 2048 tokens. El flujo de tokens y su orden son idénticos a los de Pythia (`pile-standard-pythia-preshuffled`, batch *i* = filas [i·1024, (i+1)·1024)).

La única diferencia respecto al run canónico es la semilla y el esquema de inicialización: aquí `init_scheme = xavier_normal` con semilla 12, frente al esquema `pythia` (small_init + wang_init) del original. El autor advierte que la reproducción bit a bit del RNG de inicialización de EleutherAI no es posible entre frameworks, y que el esquema `pythia` solo replica la distribución por tensor del checkpoint `step0` de `EleutherAI/pythia-410m`. El repositorio publica checkpoints en ramas `stepN` para N en {0, 1, 2, 4, …, 512} más cada 100 pasos, con pesos únicamente, y un `losses.csv` en `main` con `train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`, `tokens_seen` y `lr` por checkpoint. La pérdida de evaluación se recalculó una sola vez contra un conjunto fijo y un scorer común, de modo que las trayectorias son comparables entre sí. Los checkpoints subidos antes del 2026-11-18 solo registran `step`/`tokens_seen`/`lr`/`dtype` en su `snapshot.json`; la fuente autoritativa de pérdida es `losses.csv`.

## Capacidades

- Generación de texto autoregresiva en inglés, con el nivel de calidad esperable de un Pythia-410M entrenado con la receta estándar.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 410M parámetros.
- Generación de código y matemáticas elementales, sin garantías de fiabilidad en tareas complejas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas al inglés declarado; no se reportan evaluaciones en otros idiomas.
- No dispone de modo thinking, visión ni audio.
- Valor añadido como objeto de estudio: checkpoints intermedios densos y métricas de pérdida homogéneas para análisis de trayectorias.

## Casos de uso

- Estudio de dinámicas de entrenamiento: comparar la curva de `eval_loss` de este run (init `xavier_normal`, seed 12) con la de otros runs de la campaña DIET y con Pythia-410M original para aislar el efecto de la inicialización y la semilla.
- Investigación en interpretabilidad: usar los checkpoints `stepN` para analizar cómo emergen circuitos o representaciones a lo largo del entrenamiento, aprovechando la granularidad de las ramas publicadas.
- Reproducibilidad de experimentos: servir como réplica controlada de Pythia-410M en estudios que necesiten múltiples semillas del mismo modelo base.
- Baseline en trabajos de weight-space: comparar distancias en el espacio de pesos entre este run y el canónico, o entre checkpoints de la misma trayectoria.
- Fine-tuning académico de bajo coste: al ser un modelo de 405M parámetros con licencia Apache 2.0, puede ajustarse en una sola GPU consumer para tareas de clasificación o generación acotada en inglés.
- Docencia y divulgación: ilustrar el proceso de preentrenamiento de un LLM con checkpoints intermedios y métricas públicas, sin necesidad de infraestructura grande.
- Evaluación de metodologías de scoring: el `losses.csv` con evaluación homogénea permite validar pipelines de evaluación de pérdida y perplejidad sobre un modelo pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta métricas de entrenamiento y evaluación interna (`train_loss`, `eval_loss`, `eval_perplexity`, `eval_accuracy`) por checkpoint en `losses.csv`, sin valores numéricos concretos en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,8-1 GB solo para pesos (405M parámetros × 2 bytes), más overhead de activaciones y KV cache; con contexto completo de 2048 tokens, el consumo total suele situarse en el rango de 1,5-2,5 GB según implementación y batch.
- VRAM estimada en fp32: aproximadamente 1,6 GB solo para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, así como A100/H100 para despliegues por lotes.
- Cabe holgadamente en GPU consumer, incluidas GPUs de gama media con 6-8 GB de VRAM.
- Opciones de despliegue: `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); llama.cpp/Ollama requerirían conversión a GGUF, no documentada en el repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `jjalora/diet-traj-pythia-410m-xavier-normal-seed12` | 405.334.016 | 2048 | Apache 2.0 | Hugging Face, checkpoints `stepN` | Réplica de investigación con init `xavier_normal`, seed 12 |
| `EleutherAI/pythia-410m` | ~410M | 2048 | Apache 2.0 | Hugging Face | Modelo canónico con la receta original y checkpoints oficiales |
| `EleutherAI/pythia-160m` | ~160M | 2048 | Apache 2.0 | Hugging Face | Variante menor de la misma familia, útil como baseline de coste |
| `EleutherAI/pythia-1b` | ~1B | 2048 | Apache 2.0 | Hugging Face | Variante mayor de la familia para comparaciones de escala |

No se dispone de datos de benchmarks en la información proporcionada para establecer comparaciones de rendimiento entre estas alternativas.

## Limitaciones y advertencias

- Modelo de 410M parámetros: capacidad limitada de razonamiento, conocimiento factual y coherencia en contextos largos frente a modelos de mayor escala.
- Entrenado exclusivamente en inglés; su uso en castellano u otros idiomas no está soportado ni evaluado.
- Riesgo de alucinación inherente a un modelo de este tamaño y a un preentrenamiento sin alineación posterior documentada (no se menciona RLHF/DPO en la model card).
- Sesgos presentes en el corpus Pile, sin filtrado adicional documentado.
- Contexto máximo de 2048 tokens, insuficiente para tareas de contexto largo.
- Es un artefacto de investigación: no está pensado ni validado para uso en producción, atención al cliente ni aplicaciones sensibles.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni soporte.
- El repositorio ocupa 1.167,4 GB por la acumulación de checkpoints; descargar el modelo completo no es práctico para la mayoría de usuarios, conviene seleccionar una rama concreta.
- La reproducibilidad bit a bit respecto a Pythia original no está garantizada, según advierte el propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjalora/diet-traj-pythia-410m-xavier-normal-seed12
- Repositorio Pythia de EleutherAI: https://github.com/EleutherAI/pythia
- Modelo canónico Pythia-410M: https://huggingface.co/EleutherAI/pythia-410m
- Dataset de entrenamiento: https://huggingface.co/datasets/EleutherAI/pile-standard-pythia-preshuffled
- Paper de Pythia: https://arxiv.org/abs/2304.01373
- No se han encontrado en la información proporcionada otros enlaces a papers, blogs, repositorios o demos específicos de la campaña DIET.
