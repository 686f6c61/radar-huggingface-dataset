# SLM-Archive/cagliostro-v3

## Resumen

Cagliostro-v3 es un modelo de lenguaje decoder-only de 146 millones de parametros desarrollado por SLM-Archive (referenciado como bench-labs en su model card), entrenado desde cero sobre 75.000 millones de tokens de datos web abiertos, libros de texto sinteticos y matematicas. Es el tercer modelo de la saga cagliostro y el primero de la misma en superar un Indice de 26 en la metrica del Open SLM Leaderboard. Se distribuye con licencia Apache 2.0 y pesos en float32 safetensors.

La arquitectura sigue un diseno transformer clasico con mejoras concretas: Grouped Query Attention con cross-head subspace attenuation, activacion SwiGLU, normalizacion RMSNorm, RoPE con theta 100.000 y embeddings atados. El modelo tiene 30 capas, hidden size de 640, 10 cabezas de atencion y 5 cabezas key/value, con un vocabulario BPE de 32.768 tokens y una ventana de contexto de 2.048 tokens. No incorpora ninguna fase de instruction tuning ni plantilla de chat: es un modelo base que completa texto.

Su relevancia reside en la eficiencia del entrenamiento: alcanza 26,55 de Indice con solo 75.000 millones de tokens frente a los 2 billones de tokens de SmolLM2-135M (27,13), que le supera por apenas 0,58 puntos. El entrenamiento completo se ejecuto en una unica RTX 5090 durante aproximadamente 9 dias, lo que lo convierte en un caso de estudio sobre eficiencia de computo en modelos sub-150M. Ademas, esta optimizado para matematicas, con un 28% de la mezcla de datos en fase de cooldown dedicada a fuentes matematicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA y cross-head subspace attenuation |
| Parametros totales | 146.352.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | Solo float32 en safetensors; no se distribuyen pesos cuantizados |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) y ONNX |

Otros detalles tecnicos declarados por el autor: 30 capas, hidden size 640, intermediate size 1.536, 10 cabezas de atencion, 5 cabezas key/value, activacion SwiGLU, RMSNorm con eps 1e-6, RoPE con theta 100.000, vocabulario BPE de 32.768 tokens, embeddings de entrada y salida atados, logit cap de 15,0 y un 85,7% de parametros no de embedding. Requiere `trust_remote_code=True` porque la clase `CagliostroForCausalLM` no forma parte de transformers.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de tipo causal. La innovacion arquitectonica mas destacable es la "cross-head subspace attenuation" aplicada sobre un esquema de Grouped Query Attention, que busca reducir la redundancia entre cabezas sin aumentar el numero de parametros. Emplea SwiGLU como activacion, RMSNorm para normalizacion, RoPE como codificacion posicional y aplica un logit cap de 15,0. Los embeddings de entrada y salida estan atados, lo que reduce el recuento de parametros y es coherente con un hidden size relativamente bajo (640).

El entrenamiento cubre 75.000 millones de tokens en 762.939 pasos, con 98.304 tokens por paso. Se utilizo un scheduler warmup-stable-decay: 2.000 pasos de warmup, fase estable hasta el paso 648.498 y un cooldown de 114.441 pasos con decaimiento coseno hasta cero. El optimizador fue AdamW con weight decay 0,01, precision bfloat16 con pesos maestros en float32, sobre una unica RTX 5090 con un throughput de 90.000 a 103.000 tokens por segundo y un tiempo de computo de unos 9 dias. La mezcla de datos cambia al entrar en cooldown: FineWeb-Edu deduplicado baja del 43,7% al 37,0%, DCLM-Baseline cae del 28,3% al 5,0% y las fuentes matematicas suben del 10% al 28% (FineMath 3+ del 5% al 15%, OpenMathInstruct-2 del 3% al 13%). Ninguna fuente supera 0,4 epocas, evitando memorizacion. No se aplico RLHF ni DPO; es un modelo base sin ajuste de instrucciones.

## Capacidades

- Generacion de texto autoregresiva y completado de texto libre (modelo base, sin chat).
- Razonamiento de tipo multiple-choice en tareas de sentido comun, ciencia basica y fisica cotidiana (HellaSwag, ARC, PIQA).
- Aritmetica y matematicas basicas reforzadas por una mezcla de datos matematicos del 28% durante el cooldown (ArithMark-3).
- Capacidad parcial de seguir instrucciones, dado que SmolTalk representa un 2% de la mezcla en fase estable y un 5% en cooldown, aunque no se distribuye como modelo instruido.
- Procesamiento de contexto corto (hasta 2.048 tokens) en tareas de continuacion de texto.
- No soporta tool calling ni function calling de forma nativa.
- No implementa modo de razonamiento explicito (thinking mode) ni agentes multi-paso.
- Sin capacidades de vision, audio ni multimodalidad.
- Soporte multilingue limitado exclusivamente al ingles.

## Casos de uso

- Autocompletado de texto en editores y entornos de escritorio: gracias a su tamano de 146M parametros y un consumo de memoria inferior a 1 GB, puede ejecutarse localmente en cualquier portatil para sugerir continuaciones de texto en ingles.
- Inferencia en el borde (edge): puede desplegarse en dispositivos con recursos limitados para tareas de generacion de texto cortas, dado que cabe holgadamente en GPU integradas y CPU.
- Modelo base para fine-tuning de dominio: sirve como punto de partida para ajustar tareas especificas (clasificacion, extraccion, resumen) con recursos modestos, aprovechando su licencia Apache 2.0.
- Generacion de contenido educativo: su entrenamiento con Cosmopedia v2 (16% en fase estable, 25% en cooldown) lo hace util para producir texto con estilo de libro de texto en ingles.
- Ejercicios y problemas de matemeticas basicas: la alta proporcion de datos matematicos permite generar problemas aritmeticos y explicaciones simples, aunque no sustitituye a un modelo de razonamiento.
- Investigacion en eficiencia de entrenamiento de SLM: sirve como referencia reproducible de what se puede conseguir con 75B tokens y hardware de consumo en la franja sub-150M.
- Prototipado rapido y demos de educacion: util para experimentar con pipelines de transformers y estudiar el comportamiento de un modelo base sin instruccion.
- Generacion de datos sinteticos en ingles: puede emplearse para producir texto de dominio general que alimente pipelines de curacion o aumentacion de datos.

## Benchmarks y rendimiento

Resultados zero-shot medidos con lm-evaluation-harness y el script ArithMark-3 del leaderboard sobre los pesos float32 del repositorio.

| Benchmark | Metrica | Puntuacion |
|---|---|---|
| HellaSwag | acc_norm | 42,51 |
| ARC-Easy | acc_norm | 54,88 |
| ARC-Challenge | acc_norm | 28,75 |
| PIQA | acc_norm | 67,46 |
| ArithMark-3 | acc_norm | 43,70 |
| Open SLM Index | - | 26,55 |

Formula del Indice: `(N(HellaSwag,25) + N(CombinedARC,25) + N(PIQA,50) + 0,65*N(ArithMark,25)) / 3,65`, donde `N(v,c) = 100(v-c)/(100-c)` y CombinedARC es la media de ARC-Easy y ARC-Challenge.

Resultados puntuales declarados por el autor en benchmarks especificos: en ArithMark-3 queda por detras de MobileLLM-R1-140M-base (65,70) y palmer-006 (52,70); en PIQA, GPT-X2.5-135M alcanza 69,42 frente a 67,46. PIQA es la tarea con mayor peso en el Indice (0,548 por punto).

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 0,59 GB solo los pesos, mas activaciones y cache KV.
- VRAM estimada en bfloat16/float16: aproximadamente 0,30 GB.
- VRAM estimada en int8: aproximadamente 0,15 GB.
- VRAM estimada en int4: aproximadamente 0,08 GB.
- Cache KV con contexto completo (2.048 tokens, 30 capas, 5 cabezas KV, head dim 64): del orden de 78 MB en fp16.
- Cabe en cualquier GPU de consumo, incluidas GTX 1650, RTX 3060, RTX 4090 y, en general, cualquier GPU con 2 GB o mas de VRAM. Tambien es viable en CPU.
- Entrenamiento original ejecutado sobre una unica RTX 5090, con throughput de 90.000 a 103.000 tokens por segundo.
- Despliegue via transformers con `trust_remote_code=True` (requerido por `CagliostroForCausalLM`). El repositorio incluye tambien exportacion ONNX.
- Opciones de despliegue adicionales (llama.cpp, Ollama, vLLM, TGI) no estan documentadas por el autor; requeririan conversion a GGUF o integracion del codigo personalizado.
- No se han publicado datos de latencia especificos para inferencia en la informacion disponible.

## Comparativa con modelos similares

Datos publicados por el leaderboard sobre la franja sub-150M:

| Modelo | Parametros | Tokens de entrenamiento | Open SLM Index |
|---|---:|---:|---:|
| SmolLM2-135M | 135M | 2T | 27,13 |
| cagliostro-v3 | 146M | 75B | 26,55 |
| SmolLM-135M | 135M | 600B | 25,74 |
| GPT-X2.5-135M | 135M | 75B | 25,17 |
| Haidass1.5-143M | 143M | 400B | 25,07 |
| BananaMind-2-Pro | 139M | 100B | 24,96 |

Comparativa cualitativa: cagliostro-v3 queda 0,58 puntos por debajo de SmolLM2-135M pese a usar aproximadamente 27 veces menos tokens de entrenamiento, lo que indica una eficiencia superior por token. Frente a GPT-X2.5-135M (mismos 75B tokens) le saca 1,38 puntos de Indice, y frente a Haidass1.5-143M (400B tokens) le saca 1,48 puntos. Los tres modelos usan licencias permisivas similares (SmolLM2 y SmolLM publican bajo Apache 2.0). En cambio, cagliostro-v3 queda por detras en PIQA, la tarea de mayor peso en el Indice, y tambien en ArithMark-3 frente a MobileLLM-R1-140M-base y palmer-006.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning ni plantilla de chat: no responde a instrucciones de forma fiable, solo completa texto.
- Solo soporta ingles; no se ha demostrado rendimiento en castellano ni en otros idiomas.
- Ventana de contexto muy corta (2.048 tokens), insuficiente para tareas de contexto largo o documentos extensos.
- Alucinacion probable, especialmente en tareas de conocimiento factual sin andamiaje de recuperacion.
- Riesgo de sesgos derivados del corpus web (FineWeb-Edu, DCLM-Baseline) sin filtrado documentado de sesgos sociales.
- El repositorio se encuentra en estado de archivo (SLM-Archive), con 0 descargas y 0 likes en el momento de la ficha, y la model card menciona un identificador `bench-labs/cagliostro-v3` distinto del ID de HuggingFace `SLM-Archive/cagliostro-v3`; conviene verificar la procedencia.
- Los resultados del Indice provienen de una metrica propia del leaderboard, no de un estandar independiente; no se han publicado evaluaciones externas en la informacion disponible.
- Aunque la licencia Apache 2.0 permite uso comercial, no existe garantia de idoneidad para produccion ni soporte del autor.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python personalizado del repositorio; es un caveat de seguridad relevante en entornos de produccion.
- No se distribuyen pesos cuantizados, por lo que cualquier despliegue en int8/int4 requiere cuantizacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SLM-Archive/cagliostro-v3
- Open SLM Leaderboard (Space): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset HuggingFaceTB/smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset mlfoundations/dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Video de demostracion: https://huggingface.co/bench-labs/cagliostro-v3/resolve/main/cagliostro-v3.mp4
