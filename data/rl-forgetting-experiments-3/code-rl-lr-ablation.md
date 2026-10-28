# RL-Forgetting-Experiments-3/code-rl-lr-ablation

## Resumen

`RL-Forgetting-Experiments-3/code-rl-lr-ablation` no es un modelo único, sino un artefacto de investigación publicado en Hugging Face que agrupa ocho celdas de ablación de un pipeline de reinforcement learning sobre generación de código. Cada celda contiene checkpoints completos de un modelo Qwen entrenado con GRPO sobre 320 problemas de MBPP, variando únicamente la tasa de aprendizaje del actor (6e-6, 3e-6 y 6e-7) y la presencia o ausencia de un buffer de replay de tipo SFT (`hard_cooldown`, lambda=0.1). Los modelos base son `Qwen/Qwen3-1.7B-Base` (1,7 mil millones de parámetros) y `Qwen/Qwen2.5-3B` (3 mil millones), ambos transformers densos decoder-only.

El objetivo declarado es localizar en qué punto de la escalera de learning rates el entrenamiento deja de ser estable y si el replay buffer desplaza ese punto. La model card indica que los runs con lr=1e-6 viven en repos separados, que 1e-5 se comporta como una moneda al aire y que 1e-4 y 1e-3 son "reliably fatal" para ambas ramas. El repositorio ocupa 548,1 GB, lo que sugiere que se conservan estados completos de entrenamiento además de los pesos, y está publicado bajo licencia Apache 2.0 con fecha de creación del 27 de octubre de 2026.

Su relevancia es metodológica más que de producto: es material para estudiar olvido catastrófico y estabilidad de RL en modelos pequeños de código, no un modelo listo para producción. No incluye resultados numéricos de evaluación en la información disponible, solo el protocolo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de los modelos base Qwen3-1.7B-Base y Qwen2.5-3B) |
| Parametros totales | 1,7 mil millones (subcarpetas `qwen3_1p7b_*`) y 3 mil millones (subcarpetas `qwen3b_*`) |
| Parametros activos | No aplica: ambos modelos base son densos, no MoE |
| Longitud de contexto | No disponible en la model card; el entrenamiento usa respuestas de hasta 3072 tokens |
| Tipos de cuantizacion | No se publican pesos cuantizados (solo safetensors en precisión de entrenamiento); la cuantización requeriría conversion propia a GGUF, AWQ o GPTQ |
| Idiomas soportados | No disponible (el metadato de idiomas del repo está vacío; los problemas de MBPP están en inglés) |
| Licencia | Apache 2.0 (declarada en el repo; verificar las condiciones de los modelos base por separado) |
| Formato de pesos | safetensors, con estructura de directorio HF (`global_step_<N>`) y logs y rollouts asociados |

## Arquitectura y entrenamiento

La arquitectura es la de los modelos base, sin modificación estructural: dos transformers decoder-only densos de 1,7B y 3B parámetros. El aporte del repo es el procedimiento de ajuste. El entrenamiento usa GRPO con 8 rollouts por prompt, batch de 64, longitud de respuesta de 3072 tokens y una recompensa binaria obtenida ejecutando el programa generado contra los asserts del problema. Los datos son 320 problemas de MBPP seleccionados como conjunto de entrenamiento y mantenidos fuera tanto de MBPP+ (378 problemas) como del split de test canónico de MBPP (276), de modo que ambos queden reportables sin contaminación.

Las ramas con replay añaden 128 rollouts pasados por paso, con peso lambda=0.1, muestreados mediante la estrategia `hard_cooldown`. Todo lo demás se mantiene idéntico a los runs de lr=1e-6, que residen en repos aparte (`code-q3_1p7b-nobuf`, `code-q3_1p7b-replay-lam0p1` y la familia `code-q25_3b-*`). La matriz de celdas es la siguiente, con checkpoints guardados cada 30 pasos:

| Carpeta | Modelo base | Rama | lr | Checkpoints |
|---|---|---|---|---|
| `qwen3_1p7b_base_mbpp_hardcd_lam0p1_lr3e6` | Qwen3-1.7B-Base | replay (lambda=0.1) | 3e-6 | 30-500, paso 30 |
| `qwen3_1p7b_base_mbpp_hardcd_lam0p1_lr6e7` | Qwen3-1.7B-Base | replay (lambda=0.1) | 6e-7 | 30-500, paso 30 |
| `qwen3_1p7b_base_mbpp_nobuf_lr3e6` | Qwen3-1.7B-Base | sin buffer | 3e-6 | 30-500, paso 30 |
| `qwen3_1p7b_base_mbpp_nobuf_lr6e6` | Qwen3-1.7B-Base | sin buffer | 6e-6 | 30-500, paso 30 |
| `qwen3b_mbpp_hardcd_lam0p1_lr3e6` | Qwen2.5-3B | replay (lambda=0.1) | 3e-6 | 30-300, paso 30 |
| `qwen3b_mbpp_nobuf_lr3e6` | Qwen2.5-3B | sin buffer | 3e-6 | 30-300, paso 30 |
| `qwen3b_mbpp_nobuf_lr6e6` | Qwen2.5-3B | sin buffer | 6e-6 | 30-300, paso 30 |
| `qwen3b_mbpp_nobuf_lr6e7` | Qwen2.5-3B | sin buffer | 6e-7 | 30-300, paso 30 |

La evaluación se define sobre MBPP+ (378 problemas), con n=160 muestras por problema, temperatura 0,6, top_p 0,95 y pass@k insesgado, puntuando con la suite completa de MBPP+ (unas 108 tests por problema), bastante más estricta que los 3 asserts originales. La model card no reporta los valores numéricos obtenidos con ese protocolo.

## Capacidades

- Generación de código Python orientada a resolución de problemas tipo MBPP: funciones completas validadas contra asserts ejecutables.
- Razonamiento de un solo turno sobre enunciados de programación en inglés; el entrenamiento no incluye diálogo multirretorno ni instrucciones de chat.
- No hay soporte documentado de tool calling ni de function calling; los modelos base no están ajustados para ello y el entrenamiento GRPO se limita a la tarea de código.
- No hay soporte documentado de agentes ni de multi-step reasoning más allá de la cadena de generación dentro de la respuesta de 3072 tokens.
- Capacidades multilingües no documentadas y, en la práctica, no objetivo del ajuste: el corpus de entrenamiento son 320 problemas de MBPP en inglés.
- No dispone de modo "thinking" explícito, visión ni audio.
- Valor añadido real del artefacto: serie de checkpoints intermedios que permite trazar curvas de rendimiento frente a pasos y frente a learning rate, además del estudio de replay.

## Casos de uso

- Estudio de estabilidad del learning rate en GRPO: comparar las celdas 6e-6, 3e-6 y 6e-7 con el mismo modelo base y el mismo dataset para identificar el umbral en el que la curva de pass@k deja de mejorar o colapsa. Es el propósito declarado del repo.
- Evaluación del efecto del replay buffer: las parejas `nobuf` frente a `hardcd_lam0p1` a lr=3e-6 permiten aislar cuánto contribuye el replay con lambda=0.1 a frenar el olvido catastrófico, manteniendo constante todo lo demás.
- Análisis de olvido catastrófico: evaluar los checkpoints RL frente al modelo base en tareas generales fuera de MBPP y medir la degradación en función de los pasos y de la tasa de aprendizaje.
- Selección de checkpoints para reproducir curvas pass@k: los 17 checkpoints del modelo de 1,7B (30-500) y los 10 del de 3B (30-300) permiten replicar experimentos de escalado de muestras (n=160) sin reentrenar.
- Reproducción de pipelines de RL con recompensa ejecutable: el repo incluye logs de entrenador y rollouts muestreados, útiles para depurar un pipeline GRPO propio con recompensa binaria por ejecución de tests.
- Baseline de generación de código en investigación académica: usar el mejor checkpoint de la escalera como referencia de un modelo de 1,7B o 3B ajustado con RL sobre MBPP, con la advertencia de que el ajuste es estrecho y no equivale a un modelo instructivo.
- Diagnóstico comparativo entre tamaños: contrastar la rama de 1,7B con la de 3B a lr=3e-6 para estudiar si el tamaño del modelo desplaza el punto de inestabilidad del learning rate.
- Material docente sobre diseño de ablaciones: ejemplo de matriz factorial (learning rate x replay x tamaño) con control estricto de variables y protocolo de evaluación declarado.

## Benchmarks y rendimiento

La información disponible describe el protocolo de evaluación, pero no publica los resultados numéricos. No se han publicado resultados de benchmarks en la información disponible.

Lo que sí se declara de forma cualitativa en la model card:

| Observación | Detalle |
|---|---|
| Escalera de lr cubierta | 6e-7, 3e-6 y 6e-6 (las celdas de este repo) |
| Runs de referencia a lr=1e-6 | Publicados en repos separados (`code-q3_1p7b-nobuf`, `-replay-lam0p1`, `code-q25_3b-*`) |
| lr=1e-5 | Descito como "coin flip" (resultado no determinista) |
| lr=1e-4 y lr=1e-3 | descritos como "reliably fatal" en ambas ramas |
| Protocolo de evaluación | MBPP+ (378 problemas), n=160, temperatura 0,6, top_p 0,95, pass@k insesgado, suite completa de ~108 tests por problema |
| Datos de entrenamiento | 320 problemas de MBPP, disjuntos de MBPP+ y del split de test canónico |

## Requisitos de hardware

- Peso en precisión de entrenamiento (estimación a partir del número de parámetros): ~3,4 GB para el modelo de 1,7B y ~6,2 GB para el de 3B en bf16/fp16.
- VRAM de inferencia estimada: 5-7 GB para el de 1,7B y 9-12 GB para el de 3B en bf16 con caché KV para上下文 de unos miles de tokens; 1,5-2,5 GB y 3-4 GB respectivamente en cuantización de 4 bits (estimaciones, no publicadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 12 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4090) sirve para inferencia en bf16 de ambos tamaños. Para entrenamiento GRPO con 8 rollouts y respuestas de 3072 tokens se recomienda A100 40/80 GB o H100; con 24 GB es viable solo el modelo de 1,7B y con batch reducido.
- Cabe en GPU consumer: sí, ambos modelos en bf16 para inferencia; el de 3B con cuantización en GPUs de 8 GB.
- Almacenamiento: el repo completo ocupa 548,1 GB. Conviene descargar solo la subcarpeta necesaria mediante el argumento `subfolder` de `from_pretrained`; cada checkpoint individual ronda los 3,4 GB (1,7B) o 6,2 GB (3B) en precisión de pesos.
- Opciones de despliegue: `transformers` (ruta documentada en la model card), vLLM y TGI para servir los safetensors, SGLang como alternativa. llama.cpp y Ollama requieren convertir previamente a GGUF, conversión que el autor no publica.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo / repo | Base | lr del actor | Replay | Checkpoints | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `code-rl-lr-ablation` (este repo) | Qwen3-1.7B-Base y Qwen2.5-3B | 6e-6, 3e-6, 6e-7 | Con y sin (`lambda=0.1`) | 17 (1,7B) y 10 (3B), cada 30 pasos | Apache 2.0 | Público, 0 descargas, 1 like |
| `code-q3_1p7b-nobuf` | Qwen3-1.7B-Base | 1e-6 | No | No disponible en la información | Apache 2.0 (según repo hermano) | Repo separado del mismo autor |
| `code-q3_1p7b-replay-lam0p1` | Qwen3-1.7B-Base | 1e-6 | Sí (`lambda=0.1`) | No disponible en la información | Apache 2.0 (según repo hermano) | Repo separado del mismo autor |
| `code-q25_3b-*` | Qwen2.5-3B | 1e-6 | Sí y no | No disponible en la información | Apache 2.0 (según repo hermano) | Repo separado del mismo autor |
| `Qwen/Qwen3-1.7B-Base` | — | Sin RL | No aplica | Peso único | Apache 2.0 | Modelo base público y ampliamente utilizado |
| `Qwen/Qwen2.5-3B` | — | Sin RL | No aplica | Peso único | Verificar en el repo del modelo base | Modelo base público |

No se dispone de comparaciones con modelos de otros autores (por ejemplo, ajustes de código de 1-3B parámetros) en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación, no un modelo de producto: no hay model card de uso, ni evaluación de seguridad, ni garantías de calidad fuera de MBPP.
- No se publican resultados numéricos de MBPP+ pese a describir el protocolo; sin esos números no es posible verificar la calidad de ningún checkpoint.
- Modelos base no instructivos (`Qwen3-1.7B-Base` y `Qwen2.5-3B`): no siguen instrucciones conversacionales ni garantizan formato de chat; el ajuste GRPO sobre 320 problemas de código no los convierte en asistentes.
- Entrenamiento muy estrecho (320 problemas, todos en inglés): alto riesgo de sobreajuste al estilo y a los enunciados de MBPP y de generalización pobre a código real.
- El objeto de estudio es precisamente el olvido catastrófico: es esperable que los checkpoints hayan degradado capacidades generales del modelo base, especialmente en los pasos avanzados y en learning rates altos.
- Idiomas no declarados en el metadato; no hay evidencia de calidad en castellano.
- Licencia: el repo declara Apache 2.0, pero las condiciones de los modelos base deben verificarse por separado antes de un uso comercial.
- Adopción prácticamente nula (0 descargas, 1 like) y fecha de publicación muy reciente: sin validación independiente de la comunidad.
- Tamaño del repo (548,1 GB) y estructura por subcarpetas: riesgo de descargar todo el árbol si no se usa `subfolder`; además, el repo contiene logs y rollouts, no solo pesos.
- Checkpoints intermedios sin garantía de estabilidad: los pasos 30-500 incluyen fases tempranas del entrenamiento que pueden ser peores que el modelo base en tareas generales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RL-Forgetting-Experiments-3/code-rl-lr-ablation
- Modelo base 1,7B: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Modelo base 3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Repos hermanos citados en la model card (lr=1e-6): `RL-Forgetting-Experiments-3/code-q3_1p7b-nobuf`, `RL-Forgetting-Experiments-3/code-q3_1p7b-replay-lam0p1` y la familia `RL-Forgetting-Experiments-3/code-q25_3b-*`, bajo el mismo espacio de nombres en Hugging Face.
- La búsqueda web realizada no devolvió resultados relevantes para este modelo (solo páginas no relacionadas); no hay papers, blogs ni demos adicionales que enlazar.
