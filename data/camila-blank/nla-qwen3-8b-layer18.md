# camila-blank/nla-qwen3-8b-layer18

## Resumen

NLA-Qwen3-8B-Layer18 es un "verbalizador de activaciones" (activation verbalizer, AV) entrenado sobre el modelo Qwen3-8B de Alibaba. No es un modelo de lenguaje de propósito general, sino un componente de un autoencoder en lenguaje natural (NLA, natural language autoencoder): recibe como entrada el vector del residual stream de Qwen3-8B en la capa 18 para una posición de token concreta y genera una explicación en lenguaje natural de esa activación interna. Lo desarrolla la usuaria de Hugging Face camila-blank y se publica bajo licencia Apache 2.0.

El modelo resuelve un problema de interpretabilidad mecanicista: traducir estados internos de un transformer a texto legible por humanos. Se apoya en Qwen3-8B (8.190.735.360 parámetros, arquitectura transformer densa) como modelo base, y hereda su tokenizador. El checkpoint publicado tiene 8,19 mil millones de parámetros, ocupa 32,8 GB en el repositorio y se distribuye en formato safetensors para la librería transformers.

Es relevante porque aplica el recetario del paper de Natural Language Autoencoders (Transformer Circuits, 2026) sobre una capa distinta (18 en lugar de 24) y con un pipeline de entrenamiento modificado (LoRA en vez de fine-tune completo, warm start desde un verbalizador de capa 24 y una etapa corta de RL). El resultado es un verbalizador que alcanza un 63 % de varianza explicada en la reconstrucción de activaciones retenidas, frente al 43 % del checkpoint previo al RL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-8B) con prompt de inyección de activación |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-8B, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (solo se documenta bfloat16 en el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El verbalizador es un transformer decoder-only inicializado desde Qwen3-8B y adaptado para aceptar un vector de 4096 dimensiones (la salida del bloque 18 de Qwen3-8B en una posición de token, `hidden_states[19]` en transformers) que se reescala a norma 150 y se escribe sobre el embedding de un token marcador en el prompt. El contrato de entrada es idéntico al de `marco-bazzani/Qwen3-8B-nla`, salvo que usa la capa 18 en lugar de la 24. El repositorio incluye dos checkpoints: la raíz con el verbalizador tras RL (150 iteraciones) y `sft/` con el verbalizador solo tras entrenamiento supervisado. El reconstructor con el que se entrenó no se incluye.

El entrenamiento usa los textos y explicaciones de `ceselder/qwen3-8b-nla-L24-finefineweb-100k` (100.000 documentos FineFineWeb, 10 posiciones cada uno, explicaciones generadas por Claude Sonnet 4.6 a partir del texto), con las activaciones reextraídas en la capa 18. La etapa supervisada parte del verbalizador de capa 24 `marco-bazzani/Qwen3-8B-nla` y aplica LoRA (rango 64, rsLoRA, todas las proyecciones de atención y MLP) durante una época sobre 243.000 pares, batch 256, learning rate 1e-4 con decaimiento coseno; el adaptador se fusiona en los pesos de `sft/`. El reconstructor supervisado son los primeros 19 bloques de Qwen3-8B sin la normalización final, con LoRA rango 64 y una cabeza lineal, una época sobre los mismos 243.000 pares. La etapa de RL consta de 150 iteraciones de 1.024 rollouts (256 activaciones, 4 muestras cada una); la recompensa es el error de reconstrucción negativo del reconstructor, con baseline por activación, una pequeña penalización por etiqueta `<explanation>` sin cerrar y una penalización KL (0,01) respecto al verbalizador supervisado. El reconstructor se entrena sobre los mismos rollouts. Sobre el verbalizador supervisado fusionado se entrena un LoRA rango 64 nuevo que se fusiona en los pesos de la raíz. El autor señala que este recetario difiere del paper en el uso de LoRA, el warm start desde capa 24 y una etapa de RL corta con hiperparámetros no ajustados.

## Capacidades

- Decodificación de activaciones: dado un vector del residual stream de Qwen3-8B en la capa 18, genera una explicación en lenguaje natural del contenido semántico de esa activación.
- Salida estructurada: las explicaciones se emiten dentro de etiquetas `<explanation>...</explanation>`, lo que facilita el parseo automático.
- Muestreo estocástico: el entrenamiento usó temperatura 1,0 sin top-k ni top-p, de modo que varias muestras por activación ofrecen visiones complementarias.
- No es un modelo conversacional ni de propósito general: el autor indica explícitamente que no es útil como modelo de lenguaje general.
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Interpretabilidad mecanicista de Qwen3-8B: extraer el residual stream en la capa 18 para un token concreto y generar explicaciones textuales que ayuden a auditar qué representa el modelo en esa posición.
- Análisis de representaciones por capa: comparar las explicaciones de la capa 18 (este checkpoint) con las de la capa 24 (`marco-bazzani/Qwen3-8B-nla`) para estudiar cómo evoluciona la información a lo largo de la red.
- Detección de features y sesgos: verbalizar activaciones en contextos controlados para identificar conceptos latentes (entidades, tono, idioma) que el modelo codifica internamente.
- Investigación en safety y alineamiento: usar las explicaciones como señal para localizar direcciones de activación asociadas a comportamientos indeseados antes de aplicar intervenciones.
- Construcción de datasets de explicaciones: generar corpus de pares (activación, explicación) para entrenar reconstructores o evaluar métodos de decodificación de activaciones.
- Validación de pipelines NLA: servir como referencia para verificar la corrección de implementaciones del contrato de entrada (norma 150, token marcador, plantilla de prompt) definido en `nla_meta.yaml`.

## Benchmarks y rendimiento

El autor publica una métrica de reconstrucción sobre 256 activaciones retenidas (documentos no vistos en entrenamiento), con una explicación muestreada por activación, evaluada por el reconstructor coentrenado sobre vectores reescalados en norma y comparada con una baseline de predicción de la media:

| Checkpoint | Varianza explicada | Salidas bien formadas |
|---|---|---|
| `sft/` (antes de RL) | 43 % | 100 % |
| raíz (después de RL) | 63 % | 99 % |

El autor advierte que una mayor reconstrucción no implica por sí sola explicaciones más útiles, y recomienda comparar ambos checkpoints en la tarea propia. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: alrededor de 16-17 GB solo para los pesos del verbalizador (8,19 mil millones de parámetros a 2 bytes), más memoria para el contexto y el KV cache.
- Para el flujo completo del ejemplo hacen falta dos modelos: Qwen3-8B (para extraer la activación) y el verbalizador. El ejemplo del autor carga ambos secuencialmente en `cuda` y libera el base antes de cargar el AV, lo que reduce el pico a un modelo a la vez.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para el verbalizador en bfloat16; el flujo completo puede ejecutarse en una sola GPU consumer de 24 GB si se secuencializa la carga.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) o RTX 3090 (24 GB) en bfloat16; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers (único framework documentado), con soporte de text-generation-inference y endpoints compatibles según los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Capa | Parámetros | Contexto | Varianza explicada | Licencia |
|---|---|---|---|---|---|---|
| camila-blank/nla-qwen3-8b-layer18 | Qwen3-8B | 18 | 8,19 B | no disponible | 63 % (raíz) / 43 % (sft) | Apache 2.0 |
| marco-bazzani/Qwen3-8B-nla | Qwen3-8B | 24 | no disponible | no disponible | no disponible | no disponible |
| Verbalizador del paper NLA (referencia) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el verbalizador de capa 24 es la más pertinente, pero no se han publicado métricas de reconstrucción para ese checkpoint en la información disponible. El autor indica que este modelo reutiliza su contrato de entrada y se inicializa desde él.

## Limitaciones y advertencias

- No es un modelo de lenguaje de propósito general: el autor lo declara explícitamente. Usarlo como chatbot o generador de texto produciría resultados sin sentido.
- Dependencia estricta del contrato de entrada: el vector debe ser la salida del bloque 18 de Qwen3-8B en una posición de token, reescalado a norma 150 e inyectado en el token marcador definido en `nla_meta.yaml`. Cualquier desviación invalida la salida.
- El reconstructor no se incluye en el repositorio, por lo que no es posible reproducir la métrica de reconstrucción sin entrenar uno propio.
- Las activaciones de entrenamiento se tomaron al menos 50 tokens dentro de un documento y con texto tokenizado sin plantilla de chat; el comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de alucinación: las explicaciones son generadas por muestreo estocástico y pueden no corresponder fielmente a la activación; el autor recomienda muestrear varias por activación.
- La etapa de RL usó hiperparámetros no ajustados y solo 150 iteraciones, por lo que el checkpoint puede no estar en un óptimo estable.
- Sesgos conocidos: no documentados; los datos de entrenamiento provienen de FineFineWeb con explicaciones generadas por Claude Sonnet 4.6, lo que puede introducir sesgos del modelo anotador.
- Idiomas soportados: no disponibles.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-8B conviene revisar también las condiciones del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/camila-blank/nla-qwen3-8b-layer18
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Verbalizador de capa 24 de referencia: https://huggingface.co/marco-bazzani/Qwen3-8B-nla
- Dataset de entrenamiento: https://huggingface.co/datasets/ceselder/qwen3-8b-nla-L24-finefineweb-100k
- Paper NLA: https://transformer-circuits.pub/2026/nla/index.html
- Código de referencia: https://github.com/ceselder/nanoNLA
