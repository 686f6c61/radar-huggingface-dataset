# haok1402/DM-GDNGQA-9.3B-LR2.4e-3-DM

## Resumen

DM-GDNGQA-9.3B-LR2.4e-3-DM es un modelo de lenguaje de 9.274.983.360 parametros desarrollado por el usuario haok1402 como parte de un estudio comparativo sobre la precision numerica del entrenamiento en capas de atencion. Concretamente, es la rama "DM" (match) de un experimento en el que tres modelos se entrenaron desde la misma inicializacion, con los mismos datos en el mismo orden y la misma receta, variando unicamente la precision de la atencion durante el entrenamiento: bf16 FlashAttention-3 (rama MP), FP8 con delta obsoleto (rama SD) y FP8 con Delta-Matching o delta emparejado (rama DM, este modelo).

La arquitectura es un hibrido de 36 capas que alterna bloques GatedDeltaNet (estado recurrente con convolucion corta) y bloques de atencion GQA en patron de repeticion 3:1. El modelo se preentreno desde cero sobre 30.000 millones de tokens de Nemotron-CC con una longitud de contexto de 8.192 tokens y un pico de learning rate de 2,4e-3. El interes del modelo no es tanto su rendimiento absoluto como su valor como evidencia empirica: demuestra que el entrenamiento en FP8 de las proyecciones q/k/v/o de la atencion puede igualar casi exactamente al bf16 si se corrige el sesgo de cuantizacion mediante Delta-Matching.

Este repositorio concreto es la version de 9,3B con LR 2,4e-3 de la rama match; existe una variante paralela con LR 1,2e-3 y otras dos ramas (MP y SD) para cada learning rate. El modelo se distribuye en safetensors bf16 con codigo propio incluido en el repositorio y requiere `flash-linear-attention` para ejecutar las capas GatedDeltaNet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrido GatedDeltaNet + GQA (36 capas = [GatedDeltaNet, GatedDeltaNet, GatedDeltaNet, GQA] x 9) |
| Parametros totales | 9.274.983.360 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (tokenizer Llama-2 de 32k tokens) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16), con codigo de modelado propio (`modeling_bqalm.py`, `configuration_bqalm.py`) |

## Arquitectura y entrenamiento

El modelo sigue un diseno hibrido de 36 capas con `d_model` 4096 y FFN SwiGLU de 12.288 unidades, con embeddings atados. El patron de capas repite nueve veces la secuencia [GatedDeltaNet, GatedDeltaNet, GatedDeltaNet, GQA]. Las capas GatedDeltaNet usan 16 cabezas de query/key de 128 dimensiones y 32 cabezas de valor de 256 dimensiones, con compuerta y convolucion corta implementada mediante `flash-linear-attention` en modo chunk. Las capas de atencion GQA emplean 16 cabezas de query y 4 de KV de 256 dimensiones, con qk-norm, RoPE parcial de factor 0,25 (theta 1e7) y salida con compuerta.

El preentrenamiento se realizo desde cero sobre 30.000 millones de tokens del dataset Nemotron-CC (`nemotron_cc_v2d1_hq_dqa`), empaquetados en secuencias de 8.192 tokens, con 28.610 pasos y batch global de 128. Se uso AdamW con beta (0,9; 0,95), epsilon 1e-8, weight decay 0,1, gradient clipping 1,0 y z-loss 1e-4. El schedule es WSD: 3,33 % de warmup hasta 2,4e-3, fase constante y decaimiento lineal a cero en el ultimo 20 %. El entrenamiento se ejecuto en 4 nodos de 8 GPU H200 mediante un port a Megatron-LM (Megatron-Core 0.20, Megatron-FSDP).

La innovacion tecnica central es Delta-Matching: una tecnica de atencion en FP8 que corrige el delta obsoleto (stale delta) que aparece al cuantizar las proyecciones q/k/v/o. En la rama SD, el uso ingenuo de FP8 degrada severamente el modelo (CE de validacion 1,8728 frente a 1,3141 de la rama limpia). En la rama DM, el delta emparejado reduce la brecha a 0,0011 nats/token (CE 1,3152). El export ejecuta la atencion mediante bf16 SDPA en las tres ramas, de modo que los tres repositorios comparten arquitectura y difieren solo en los pesos.

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy y por muestreo (`num_beams=1`).
- Modelado de lenguaje de siguiente token; la perdida de entrenamiento es la cross-entropy estandar.
- Razonamiento basico y conocimiento general medido en MMLU (0,4175) y tareas de sentido comun (CSense-9: 0,6395).
- Recuperacion de informacion en contexto largo, evaluada con RULER a 4k y 8k (media 58,22).
- Extraccion de informacion estructurada (SWDE, FDA, SQuAD completion; media 0,6933).
- Respuesta a preguntas de cultura general en formato 5-shot (TriviaQA exact match 0,2414).
- Recuperacion sintetica multi-query key-value (MQAR 0,1247), que mide la capacidad de memoria asociativa del estado recurrente.
- Soporte de cache de inferencia: mantiene K/V de las capas GQA y los estados recurrente y convolucional de las capas GatedDeltaNet, de modo que cada token nuevo cuesta un paso.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Estudio de precision numerica en entrenamiento: el modelo sirve como referencia empirica para evaluar el impacto de FP8 en capas de atencion, comparando directamente con las ramas MP y SD del mismo estudio bajo identicos datos y semilla.
- Investigacion en arquitecturas hibridas estado-espacio/atencion: permite analizar el comportamiento de un modelo con proporcion 3:1 entre GatedDeltaNet y GQA en tareas de recuperacion asociativa (MQAR) y contexto largo (RULER).
- Experimentos de memoria asociativa: la puntuacion MQAR y el estado recurrente permiten estudiar como un hibrido gestiona el recall multi-query frente a un transformer puro.
- Fine-tuning supervisado en dominios acotados: al ser entrenable con el `Trainer` de `transformers` en bf16 (`model(input_ids=ids, labels=ids).loss`), puede adaptarse a tareas de clasificacion o generacion especificas con datasets pequenos.
- Evaluacion de recuperacion en contexto de 8k: util para probar pipelines de RAG que necesitan medir el rendimiento de un modelo de 9B con ventana de 8.192 tokens en tareas de extraccion y QA.
- Reproducibilidad de estudios de scaling: al publicarse las seis variantes (tres ramas por dos learning rates) con la misma inicializacion y orden de datos, el modelo facilita replicar y auditar conclusiones sobre cuantizacion en entrenamiento.
- Base para comparativas de eficiencia: las capas GatedDeltaNet reducen el coste de atencion a contexto largo, lo que permite medir throughput y latencia frente a transformers densos de tamano similar.

## Benchmarks y rendimiento

Resultados publicados por el autor (semilla 11785). Val CE en nats/token sobre 2.000 ventanas retenidas de 8.192 tokens (menor es mejor); el resto, mayor es mejor.

| Modelo | val CE | RULER | CSense-9 | Extract | TriviaQA | MMLU | MQAR |
|---|---|---|---|---|---|---|---|
| MP (clean, bf16 FA-3) | 1,3141 | 60,51 | 0,6433 | 0,7140 | 0,2418 | 0,4291 | 0,1766 |
| SD (stale, FP8 ingenuo) | 1,8728 | 22,18 | 0,4681 | 0,3848 | 0,0281 | 0,2633 | 0,0655 |
| **DM (match, este modelo)** | **1,3152** | **58,22** | **0,6395** | **0,6933** | **0,2414** | **0,4175** | **0,1247** |

La rama DM queda a +0,0011 nats/token de la rama limpia en CE de validacion y a 2,29 puntos en RULER, mientras que la rama SD se degrada +0,5587 nats/token y cae a 22,18 en RULER. La mayor diferencia entre DM y MP se observa en MQAR (0,1247 frente a 0,1766). Cada rama se entreno una sola vez, por lo que la tabla no incluye barras de error entre semillas.

## Requisitos de hardware

- VRAM para inferencia en bf16: 18,6 GB solo para los pesos, segun indica el autor; hay que anadir el coste de la cache (K/V de las capas GQA y estados recurrente y convolucional de las GatedDeltaNet) y las activaciones.
- GPU recomendadas: el autor entreno en H200 y evaluo la rama MP en H100. Para inferencia en bf16 se requiere una GPU con al menos 24 GB utiles; una RTX 4090 (24 GB) queda muy justa y probablemente exija cuantizacion o `device_map` con offload.
- GPU consumer: cabe en tarjetas de 24 GB solo con cuantizacion o reparto entre dispositivos; no se documentan pesos GGUF ni cuantizaciones oficiales, por lo que la conversion a 8 o 4 bits correria a cargo del usuario.
- Software: `torch`, `transformers` >= 5 y `flash-linear-attention` (probado con torch 2.12, transformers 5.9.0 y flash-linear-attention 0.5.2). Requiere GPU CUDA y `trust_remote_code=True`.
- Opciones de despliegue: no se documenta soporte para vLLM, TGI, llama.cpp ni Ollama; el camino soportado es `AutoModelForCausalLM` de `transformers` con el codigo incluido en el repositorio.
- Restriccion de batching: las peticiones agrupadas deben compartir longitud, ya que las capas GatedDeltaNet no tienen mascara de padding.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| DM-GDNGQA-9.3B-LR2.4e-3-DM (este) | 9,27B | 8.192 | Hibrido GatedDeltaNet + GQA 3:1 | no disponible | Estudio de precision FP8 en atencion |
| DM-GDNGQA-9.3B-LR2.4e-3-MP | 9,27B | 8.192 | Hibrido GatedDeltaNet + GQA 3:1 | no disponible | Rama control con bf16 FA-3; mejor CE (1,3141) y RULER (60,51) |
| DM-GDNGQA-9.3B-LR2.4e-3-SD | 9,27B | 8.192 | Hibrido GatedDeltaNet + GQA 3:1 | no disponible | Rama FP8 ingenua; degradacion severa (CE 1,8728) |
| DM-GDNGQA-9.3B-LR1.2e-3-DM | 9,27B | 8.192 | Hibrido GatedDeltaNet + GQA 3:1 | no disponible | Misma rama con pico de LR 1,2e-3 |

No se dispone de datos de benchmarks de modelos externos comparables en la informacion proporcionada, por lo que la comparativa se limita a las variantes del mismo estudio.

## Limitaciones y advertencias

- Modelo de investigacion con solo 30.000 millones de tokens de entrenamiento: su rendimiento absoluto (MMLU 0,4175, TriviaQA 0,2414) es bajo para estandares de modelos de 9B preentrenados con billones de tokens; no es apto como asistente general sin fine-tuning adicional.
- Licencia no especificada: no hay garantia de uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no documentados: el tokenizer es Llama-2 de 32k tokens, pero no se declara cobertura multilingue ni se han publicado evaluaciones por idioma.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de factualidad ni de calibracion.
- El kernel CUDA compilado de atencion FP8 Delta-Matching no se distribuye: los pesos exportados son bf16 y ejecutan atencion SDPA en bf16, por lo que no se reproduce en inferencia la ruta FP8 del entrenamiento.
- Sin mascara de padding en las capas GatedDeltaNet: el batching requiere prompts de igual longitud, lo que complica el despliegue en servidores de inferencia convencionales.
- Una sola semilla por rama: no hay barras de error entre semillas, de modo que las diferencias pequenas entre ramas (por ejemplo, MQAR 0,1247 frente a 0,1766) deben interpretarse con cautela.
- Contexto limitado a 8.192 tokens: no se documenta extension de contexto ni RoPE scaling mas alla del entrenamiento.
- Dependencia de codigo remoto (`trust_remote_code=True`) y de `flash-linear-attention`: incrementa la superficie de ataque y la fragilidad del entorno de ejecucion.
- Sin soporte documentado de tool calling, agentes ni vision, lo que limita su uso en pipelines modernos de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-DM
- Rama control (MP, bf16): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-MP
- Rama stale (SD, FP8 ingenuo): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR2.4e-3-SD
- Variante LR 1,2e-3 (MP): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-MP
- Variante LR 1,2e-3 (SD): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-SD
- Variante LR 1,2e-3 (DM): https://huggingface.co/haok1402/DM-GDNGQA-9.3B-LR1.2e-3-DM
- Paper del estudio: no disponible (se cita el Apendice C.8.1 sin enlace)
- Repositorio de codigo: no disponible (el codigo se incluye en el propio repositorio de Hugging Face)
- Demo: no disponible
