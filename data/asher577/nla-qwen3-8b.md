# asher577/nla-qwen3-8b

## Resumen

NLA (Natural Language Autoencoder) sobre Qwen3-8B es un artefacto de interpretabilidad desarrollado por el usuario asher577 que implementa un autoencoder en lenguaje natural para el flujo residual de la capa 24 de Qwen/Qwen3-8B. El sistema descompone el problema de interpretar activaciones internas en dos modelos acoplados: un verbalizador que traduce un vector de activación a una explicación en texto libre y un reconstructor que vuelve a proyectar esa explicación al espacio de activaciones original. Se trata de una línea de investigación en interpretabilidad mecanicista, no de un modelo de propósito general.

El modelo se presenta explícitamente como una línea base no composicional frente a las variantes Focus y Subspace NLA del mismo autor. Su relevancia radica en que ofrece una métrica cuantitativa y objetiva (FVE, fracción de varianza explicada) para evaluar hasta qué punto una descripción en lenguaje natural captura la información contenida en una activación concreta, lo que permite auditar representaciones internas de un LLM de 8B parámetros con un coste de inferencia moderado.

La arquitectura subyacente es Qwen3-8B (transformer denso, dimensión oculta 4096) con ajuste fino supervisado y posterior RL con GRPO. El verbalizador conserva las 36 capas de Qwen3-8B; el reconstructor es una versión truncada a 25 capas con una cabeza lineal de 4096 a 4096. La licencia es Apache 2.0 y el repositorio ocupa 27,4 GB en formato safetensors bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) para verbalizador; Qwen3-8B truncado a 25 capas + cabeza lineal 4096→4096 para reconstructor |
| Parametros totales | no disponible (el verbalizador deriva de Qwen3-8B, ~8B; el reconstructor es un subconjunto truncado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el verbalizador hereda el contexto de Qwen3-8B; la generación se limita a 310 tokens durante el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (hereda el multilingüismo de Qwen3-8B, no declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Hugging Face format; `av/` verbalizador bf16 con LoRA RL fusionado, `ar/` backbone + `value_head.safetensors`) |
| Capa objetivo | 24 (hidden_states[25] en numeración Hugging Face) |
| Dimensión de activación | 4096 |
| Token marcador | ㈎ (id 149705) |
| FVE retenido | ~70 % (69,9 % de media entre pasos 850 y 950, 128 activaciones retenidas por evaluación) |

## Arquitectura y entrenamiento

El sistema es un autoencoder en lenguaje natural con dos componentes entrenados conjuntamente. El verbalizador es un Qwen3-8B ajustado que recibe un vector de activación inyectado en su flujo residual: en la salida de la capa 1, en la posición del token marcador `㈎`, el residual `h` se sustituye por `h + |h| * x / |x|`. El prompt es la plantilla `actor` de `nla_meta.yaml` como un único turno de usuario con el chat template aplicado y sin instrucción adicional; la respuesta se encapsula en etiquetas `<explanation>`. El reconstructor es un Qwen3-8B truncado a sus primeras 25 capas (sin norma final ni LM head) con una cabeza lineal 4096→4096: la explicación completa se envuelve en la plantilla `critic` (`Summary of the following text: <text>...</text> <summary>`) y el último estado oculto en el último token, reescalado a norma sqrt(d), pasa por la cabeza lineal para producir `x_hat`.

El entrenamiento parte de activaciones extraídas de una mezcla equilibrada de chat (WildChat) y texto web (FineFineWeb), con 10 posiciones de token por documento, todas en la posición 50 o posterior. El calentamiento consiste en ajuste fino supervisado del verbalizador sobre explicaciones escritas por Claude del texto previo a cada posición (ocho párrafos cortos de forma libre) y del reconstructor en la dirección inversa. Después se aplica RL con GRPO durante 900 pasos (256 activaciones × 8 muestras por paso, generación limitada a 310 tokens), con recompensa basada en la calidad de reconstrucción de la explicación completa. El verbalizador se entrena como LoRA de rango 128 (fusionado en los pesos publicados) con penalización KL de 0,02 respecto al calentamiento, y el reconstructor se ajusta completamente en paralelo; la versión publicada corresponde al mismo paso.

La métrica FVE se define como `1 - MSE(n(x_hat), n(x)) / 0,564`, donde `n` reescala un vector a norma sqrt(d) y el denominador es la varianza de las activaciones normalizadas en el conjunto de entrenamiento. El FVE retenido en el paso publicado ronda el 70 %.

## Capacidades

- Verbalización de activaciones: dado un vector de activación del flujo residual de la capa 24 de Qwen3-8B, genera una explicación en texto libre de aproximadamente ocho párrafos cortos.
- Reconstrucción de activaciones: dado un texto de explicación, produce un vector de 4096 dimensiones que aproxima la activación original.
- Evaluación cuantitativa de interpretaciones: el par verbalizador-reconstructor permite calcular FVE como medida objetiva de fidelidad de una descripción.
- Lectura de activaciones en contextos de chat y de texto web, siempre que la posición del token sea 50 o posterior.
- Detección de tokens sumidero ("sink tokens") con norma superior a 10 veces la mediana, marcados como no fiables por el quickstart.
- Integración con el chat template de Qwen3-8B; el modo `--chat` lee el último token del mensaje en lugar de los tokens que el template añade.
- No soporta tool calling, agentes, visión, audio ni modos de razonamiento extendido: es una herramienta de análisis, no un asistente.

## Casos de uso

- Auditoría de representaciones internas: extraer la activación de un token concreto de Qwen3-8B en la capa 24 y verbalizarla para inspeccionar qué información semántica contiene antes de que el modelo genere la siguiente respuesta.
- Investigación en interpretabilidad mecanicista: usar el FVE como métrica de referencia no composicional al comparar variantes Focus y Subspace NLA sobre el mismo modelo base y la misma capa.
- Detección de contenido latente: analizar activaciones en tareas de moderación para identificar conceptos que el modelo representa internamente aunque no los verbalice en su salida.
- Diagnóstico de alineación y sesgos: comparar explicaciones de activaciones ante prompts con distintos sesgos demográficos para localizar representaciones asociadas a atributos sensibles.
- Docencia y divulgación: el quickstart con `--chat` permite demostrar en una sola GPU de ~20 GB cómo un LLM codifica información en su flujo residual, con ejemplos reproducibles.
- Validación de pipelines de extracción de activaciones: comprobar que las activaciones capturadas en producción (por ejemplo, en un sistema de monitorización) son reconstruibles y, por tanto, informativas, descartando capas o posiciones degeneradas.
- Investigación sobre compresión semántica: estudiar cuánta información de una activación de 4096 dimensiones es recuperable a partir de una descripción textual de ~310 tokens, con implicaciones para destilación y memoria externa.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| FVE retenido | 69,9 % | Media de evaluaciones entre pasos 850 y 950, 128 activaciones retenidas por evaluación |
| Pasos de RL (GRPO) | 900 | 256 activaciones × 8 muestras por paso |
| Longitud máxima de generación | 310 tokens | Durante el entrenamiento RL |
| Rango LoRA del verbalizador | 128 | Fusionado en los pesos publicados |
| Penalización KL | 0,02 | Respecto al calentamiento supervisado |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el artefacto no está orientado a evaluación de capacidades generales.

## Requisitos de hardware

- VRAM estimada: ~20 GB para ejecutar el quickstart completo (verbalizador bf16 + reconstructor + Qwen3-8B base para extraer activaciones).
- Descarga total: 26 GB del repositorio NLA más 16 GB de Qwen/Qwen3-8B.
- GPU recomendadas: A100 40/80 GB, H100, L40S; una RTX 4090 (24 GB) es suficiente para el quickstart en bf16, aunque con poco margen.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y potencialmente en GPUs de 24 GB similares; no cabe en GPUs de 16 GB sin cuantización, no documentada.
- Opciones de despliegue: el repositorio `nla` con `pip install -e . einops` y el script `scripts/hf_quickstart.py`; no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FVE | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| asher577/nla-qwen3-8b | ~8B (verbalizador) + 25 capas (reconstructor) | no disponible | ~70 % | Apache 2.0 | Hugging Face |
| Variantes Focus NLA (mismo autor) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Variantes Subspace NLA (mismo autor) | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

Las variantes Focus y Subspace se mencionan en la model card como alternativas composicionales, pero no se aportan sus especificaciones ni resultados. No se conocen otros autoencoders en lenguaje natural comparables en la información disponible.

## Limitaciones y advertencias

- Las lecturas en tokens anteriores a la posición 50 quedan fuera de la distribución de entrenamiento y son menos fiables.
- Los tokens sumidero (norma superior a 10 veces la mediana, típicamente tokens que el chat template añade tras el mensaje) producen lecturas no fiables; el FVE no lo detecta porque esas activaciones apuntan en direcciones casi idénticas y se reconstruyen bien.
- Una lectura es la descripción del verbalizador, no una transcripción del texto: las frases citadas y los detalles específicos pueden ser incorrectos y deben contrastarse con la entrada.
- El modelo es una línea base no composicional; no está pensado para uso en producción como asistente ni para tareas generativas generales.
- No se declaran idiomas soportados ni sesgos conocidos en la model card.
- El FVE del ~70 % implica que aproximadamente un 30 % de la varianza de la activación no se recupera con la explicación textual, por lo que la interpretación es necesariamente parcial.
- No se documentan procesos de moderación, filtrado de datos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero el modelo base Qwen3-8B tiene sus propios términos que deben respetarse.
- El reconstructor emite una advertencia al cargar porque `lm_head.weight` y `model.norm.weight` se inicializan de nuevo; es el comportamiento esperado, pero puede confundir en pipelines automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/asher577/nla-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Repositorio `nla` (helpers de inferencia y `scripts/hf_quickstart.py`): no disponible como URL directa en la información proporcionada
- Paper, blog o demo: no disponible en la información proporcionada
