# haok1402/DM-GDNGQA-9.3B-LR2.4e-3-SD

## Resumen

DM-GDNGQA-9.3B-LR2.4e-3-SD es un modelo de lenguaje de 9.274.983.360 parámetros desarrollado por el usuario haok1402 como parte de un estudio comparativo sobre precisión de entrenamiento en mecanismos de atención. Se trata del brazo "stale" (SD) de un experimento en el que tres modelos se entrenan desde la misma inicialización, con los mismos datos y la misma receta, variando únicamente la precisión del entrenamiento de la atención: bf16 FlashAttention-3 (MP), FP8 con delta obsoleto (SD) y FP8 con DeltaMatching (DM).

La arquitectura es híbrida: 36 capas compuestas por bloques GatedDeltaNet y bloques de atención GQA en proporción 3:1, con un ancho de modelo de 4096 y FFN SwiGLU de 12.288. El modelo se preentrenó desde cero sobre 30.000 millones de tokens de Nemotron-CC con una longitud de contexto de 8.192 tokens y un pico de learning rate de 2,4e-3.

La relevancia de este modelo es fundamentalmente metodológica: sirve como evidencia empírica de que el entrenamiento en FP8 de las capas de atención con un esquema ingenuo (delta obsoleto) degrada severamente la calidad del modelo final. En concreto, la perplejidad de validación del brazo SD es 1,8728 nats/token frente a 1,3141 del brazo limpio, y su rendimiento en RULER cae de 60,51 a 22,18. No es un modelo pensado para uso en producción, sino un artefacto de investigación reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 36 capas = [GatedDeltaNet, GatedDeltaNet, GatedDeltaNet, GQA] × 9 |
| Parámetros totales | 9.274.983.360 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantización | Pesos publicados en bf16 safetensors; el tag fp8 hace referencia al entrenamiento, no a los pesos exportados |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo combina capas GatedDeltaNet (un mecanismo de atención lineal con estado recurrente y convolución corta, implementado mediante flash-linear-attention en modo chunk) con capas de atención GQA clásica. Las capas GatedDeltaNet usan 16 cabezas de query/key de 128 dimensiones y 32 cabezas de valor de 256 dimensiones, con compuerta y convolución corta. Las capas GQA emplean 16 cabezas de query y 4 cabezas KV de 256 dimensiones, con qk-norm, RoPE parcial al 25 % (θ = 1e7) y salida con compuerta. El modelo usa el tokenizador de Llama-2 (32k tokens) y embeddings atados.

El entrenamiento se realizó sobre Nemotron-CC (`nemotron_cc_v2d1_hq_dqa`) empaquetado en secuencias de 8.192 tokens, con un presupuesto de 28.610 pasos × batch global 128 × 8.192 tokens = 30.000 millones de tokens. Se usó AdamW (β = 0,9/0,95, ε = 1e-8, weight decay 0,1, gradient clip 1,0, z-loss 1e-4) con un schedule WSD: 3,33 % de warmup hasta 2,4e-3, fase constante y decaimiento lineal a cero en el último 20 %. El entrenamiento se ejecutó en 4 × 8 H200 con un port de Megatron-LM (Megatron-Core 0.20, Megatron-FSDP). La semilla de inicialización fue 11785 y los tres brazos del estudio leen los mismos datos en el mismo orden.

La innovación técnica del estudio es el esquema Delta-Matching FP8 para la atención: el brazo SD emplea el modo `dm_mode=stale`, que corresponde a una implementación ingenua de FP8 en la que el delta de atención queda obsoleto. Los pesos exportados son bf16 y la inferencia se ejecuta con bf16 SDPA; el kernel CUDA compilado de FP8 Delta-Matching no se distribuye con el repositorio. No se menciona uso de RLHF ni DPO: es un modelo base preentrenado.

## Capacidades

- Generación de texto autoregresiva con decodificación greedy y por muestreo (`num_beams=1`).
- Modelado de lenguaje causal: la pérdida de entrenamiento es la entropía cruzada de siguiente token, por lo que es ajustable con el `Trainer` de transformers en bf16.
- Recuperación de contexto y tareas de recall multi-query (evaluado en RULER y MQAR), aunque con rendimiento muy degradado en este brazo.
- Capacidad de continuación de texto y respuesta a prompts cortos, verificable con el ejemplo de la model card ("The capital of France is").
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no documentadas; el tokenizador es Llama-2 (32k), orientado principalmente a inglés.

## Casos de uso

- Estudio de ablación sobre precisión de entrenamiento: el modelo sirve como referencia negativa para cuantificar cuánto degrada el uso de FP8 ingenuo en las capas de atención frente a bf16 o a DeltaMatching. Se usaría comparando su perplejidad de validación y sus resultados en RULER con los de los brazos MP y DM.
- Reproducción de resultados de investigación: al compartir arquitectura, datos y orden de lectura con los otros dos brazos, permite reproducir la tabla de evaluación del paper (Apéndice C.8.1) y verificar la fidelidad del export (los logits coinciden bit a bit con el loader original en SDPA por defecto).
- Validación de pipelines de evaluación: su código de evaluación forma parte del repositorio, por lo que puede emplearse para probar arneses de benchmark (RULER, CSense-9, TriviaQA, MQAR) antes de aplicarlos a modelos en producción.
- Docencia y divulgación sobre entrenamiento en baja precisión: ilustra de forma concreta el impacto de los errores numéricos en el delta de atención, con cifras medibles (caída de 60,51 a 22,18 en RULER).
- Pruebas de infraestructura de inferencia híbrida: al combinar capas GatedDeltaNet con estado recurrente y capas GQA con caché K/V, es útil para validar soporte de flash-linear-attention y gestión de caché en frameworks propios.
- Fine-tuning controlado en bf16: dado que `model(input_ids=ids, labels=ids).loss` es la entropía cruzada estándar, puede ajustarse con el `Trainer` para experimentos que comparen el efecto del preentrenamiento degradado sobre tareas posteriores.
- Referencia para auditoría de modelos publicados: permite estudiar cómo se documentan brazos de ablación y qué metadatos (`config.train.json`) acompañan a un checkpoint de investigación.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 11785):

| Modelo | val CE (nats/token) | RULER | CSense-9 | Extract | TriviaQA | MMLU | MQAR |
|---|---|---|---|---|---|---|---|
| MP (clean) | 1,3141 | 60,51 | 0,6433 | 0,7140 | 0,2418 | 0,4291 | 0,1766 |
| **SD (stale)** | **1,8728** | **22,18** | **0,4681** | **0,3848** | **0,0281** | **0,2633** | **0,0655** |
| DM (match) | 1,3152 | 58,22 | 0,6395 | 0,6933 | 0,2414 | 0,4175 | 0,1247 |

Notas metodológicas: val CE se mide sobre 2.000 ventanas retenidas de 8.192 tokens; RULER promedia 13 tareas a 4k y 8k; CSense-9 agrega LAMBADA, HellaSwag, PIQA, ARC-e, ARC-c, SciQ, OpenBookQA, WinoGrande y COPA; Extract agrega SWDE, FDA y SQuAD completion; TriviaQA es exact match a 5-shot; MQAR es una prueba sintética de recall multi-query clave-valor. Cada brazo se entrenó una sola vez, por lo que no hay barra de error entre semillas. El brazo SD queda a +0,5587 nats/token del limpio en val CE y pierde 38,33 puntos en RULER.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 18,6 GB solo para los pesos, según la model card.
- VRAM adicional: la caché de inferencia incluye K/V de las capas GQA y los estados recurrente y de convolución de las capas GatedDeltaNet; el consumo extra depende de la longitud de secuencia y del tamaño de batch.
- GPU recomendadas: H200 (usadas en el entrenamiento) y H100 (usadas en la evaluación del brazo MP); cualquier GPU con suficiente VRAM y soporte CUDA.
- GPU de consumo: cabe en tarjetas con 24 GB o más (por ejemplo, RTX 4090) en bf16, siempre que el resto del presupuesto de memoria cubra caché y activaciones.
- Software: `torch`, `transformers` >= 5 y `flash-linear-attention` (probado con torch 2.12, transformers 5.9.0 y flash-linear-attention 0.5.2). Requiere `trust_remote_code=True` porque el código del modelo (`modeling_bqalm.py`, `configuration_bqalm.py`) se distribuye en el repositorio.
- Restricción de batching: los prompts agrupados en un mismo batch deben compartir longitud, ya que las capas GatedDeltaNet no tienen máscara de padding.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI; el código incluido es la vía de inferencia prevista.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | val CE | RULER | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DM-GDNGQA-9.3B-LR2.4e-3-SD (este) | 9,27 B | 8.192 | 1,8728 | 22,18 | No disponible | Hugging Face, código incluido |
| DM-GDNGQA-9.3B-LR2.4e-3-MP | 9,27 B | 8.192 | 1,3141 | 60,51 | No disponible | Hugging Face |
| DM-GDNGQA-9.3B-LR2.4e-3-DM | 9,27 B | 8.192 | 1,3152 | 58,22 | No disponible | Hugging Face |
| DM-GDNGQA-9.3B-LR1.2e-3-SD | 9,27 B | 8.192 | No disponible en la información proporcionada | No disponible | No disponible | Hugging Face |

La comparación más directa es con los otros brazos del mismo estudio, que comparten arquitectura, datos y receta y difieren solo en la precisión de la atención durante el entrenamiento. No se dispone de datos de benchmarks frente a modelos de terceros de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Calidad severamente degradada: el brazo SD presenta una perplejidad de validación de 1,8728 frente a 1,3141 del brazo limpio, y su rendimiento en TriviaQA cae a 0,0281 (frente a 0,2418). No es apto para uso en producción.
- Contexto limitado a 8.192 tokens; no se documenta extensión de contexto.
- Idiomas soportados no documentados; el tokenizador Llama-2 de 32k está orientado principalmente al inglés.
- Licencia no disponible: no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue.
- Sin datos sobre sesgos, alucinación o comportamiento en dominios sensibles; al ser un modelo base preentrenado sin alineamiento (no consta RLHF ni DPO), es esperable que reproduzca sesgos del corpus Nemotron-CC.
- El kernel CUDA de FP8 Delta-Matching usado en el entrenamiento no se distribuye; la inferencia se ejecuta en bf16 SDPA, por lo que el comportamiento numérico no replica exactamente el del entrenamiento.
- Batching restringido: las capas GatedDeltaNet carecen de máscara de padding, lo que obliga a prompts de igual longitud en un mismo batch.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del repositorio; conviene auditar `modeling_bqalm.py` y `configuration_bqalm.py` antes de usarlo.
- Cada brazo se entrenó una sola vez (semilla 11785), por lo que no hay estimación de varianza entre semillas en los resultados reportados.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-SD
- Brazo limpio (MP): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-MP
- Brazo DeltaMatching (DM): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-DM
- Variante LR 1.2e-3, brazo MP: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-MP
- Variante LR 1.2e-3, brazo SD: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-SD
- Variante LR 1.2e-3, brazo DM: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-DM
- Paper de referencia: mencionado en la model card (Apéndice C.8.1); el enlace no está disponible en la información proporcionada
- Repositorio de flash-linear-attention: no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
