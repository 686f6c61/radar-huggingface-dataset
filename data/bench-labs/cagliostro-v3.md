# bench-labs/cagliostro-v3

## Resumen

cagliostro-v3 es un modelo de lenguaje decoder-only de 146.352.000 parámetros entrenado desde cero por bench-labs sobre 75.000 millones de tokens de datos abiertos de web, libros de texto sintéticos y matemáticas. Es el tercer modelo de la línea cagliostro y, según su model card, el primero en superar un índice de 26 en la métrica del Open SLM Leaderboard (26,55), una fórmula pública que agrega HellaSwag, ARC, PIQA y ArithMark-3.

El interés del modelo es la relación entre presupuesto de cómputo y resultado: alcanza 26,55 de índice con 75B tokens, frente a los 27,13 de SmolLM2-135M, que necesitó aproximadamente 27 veces más tokens (2T) para quedar solo 0,58 puntos por delante. El entrenamiento se completó en unos 9 días sobre una única RTX 5090, entre 90.000 y 103.000 tokens por segundo, con un esquema warmup-stable-decay y un cooldown en el que la proporción de datos matemáticos sube del 10% al 28%.

Arquitectura transformer con grouped query attention, SwiGLU, RMSNorm y RoPE, con 30 capas, hidden size 640, vocabulario BPE de 32.768 tokens y una longitud de contexto de 2.048 tokens. Es un modelo base sin instruction tuning ni plantilla de chat, distribuido en safetensors float32 y con licencia Apache 2.0. Requiere `trust_remote_code=True` porque `CagliostroForCausalLM` no forma parte de transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal; grouped query attention con "cross-head subspace attenuation"; SwiGLU; RMSNorm (eps 1e-6); RoPE (theta 100.000); logit cap 15,0; embeddings de entrada y salida atados |
| Parametros totales | 146.352.000 (85,7% no de embedding) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible; el repositorio publica unicamente pesos float32 en safetensors y no documenta versiones GGUF, AWQ, GPTQ ni int8/int4 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors float32, con codigo de modelado propio (`CagliostroForCausalLM`); requiere `trust_remote_code=True` |
| Capas / hidden size / intermediate size | 30 / 640 / 1.536 |
| Cabezas de atencion / cabezas K-V | 10 / 5 |
| Vocabulario | 32.768 BPE |
| Tamano del repositorio | 651,1 GB |
| Descargas / likes | 81 / 18 |
| Fecha de creacion / actualizacion | 2026-09-11 / 2026-09-20 |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estandar con varias decisiones concretas: 30 capas, hidden size 640, intermediate size 1.536, 10 cabezas de atencion y 5 cabezas de clave/valor (GQA), activacion SwiGLU, normalizacion RMSNorm con eps 1e-6 y codificacion posicional RoPE con theta 100.000. La atencion incorpora un mecanismo descrito por el autor como "cross-head subspace attenuation". El vocabulario es de 32.768 tokens BPE y los embeddings de entrada y salida estan atados, lo que explica que el 85,7% de los parametros no pertenezcan a la matriz de embedding. El entrenamiento aplica un logit cap de 15,0.

Los datos proceden de dos mezclas. En la fase estable: FineWeb-Edu deduplicado (43,7%), DCLM-Baseline (28,3%), Cosmopedia v2 (16,0%), FineMath 3+ (5,0%), OpenMathInstruct-2 (3,0%), InfiWebMath 3+ (2,0%) y SmolTalk (2,0%). Durante el cooldown cambia a FineWeb-Edu (37,0%), DCLM-Baseline (5,0%), Cosmopedia v2 (25,0%), FineMath 3+ (15,0%), OpenMathInstruct-2 (13,0%) y SmolTalk (5,0%), elevando las matematicas del 10% al 28%. Ninguna fuente supera las 0,4 epocas, por lo que no hay repeticion suficiente para memorizar.

El entrenamiento uso AdamW con weight decay 0,01, precision bfloat16 con pesos maestros en float32, 98.304 tokens por paso y 762.939 pasos totales: 2.000 de warmup, fase estable hasta el paso 648.498 con learning rate en su pico y cooldown de 114.441 pasos con decaimiento coseno hasta cero. El autor atribuye la mejora del indice de 22,0 a 26,6 durante el cooldown a la recuperacion de la precision zero-shot tras la depresion del learning rate constante, no a conocimiento nuevo: los cinco benchmarks se mueven a la vez. No se documenta RLHF, DPO ni ninguna fase de alineacion; es un modelo base puro.

## Capacidades

- Generacion de texto y continuacion de secuencias en ingles: es la funcion principal de un modelo base sin post-entrenamiento.
- Razonamiento aritmetico basico: ArithMark-3 acc_norm de 43,70, su mejor resultado relativo frente a modelos comparables.
- Conocimiento factual y sentido comun de nivel bajo: HellaSwag 42,51, PIQA 67,46, ARC-Easy 54,88 y ARC-Challenge 28,75 (zero-shot, acc_norm).
- Comprension lectora y respuesta a preguntas de opcion multiple mediante evaluacion de verosimilitud de continuaciones.
- Soporte de tool calling / function calling: no disponible; el modelo no tiene instruction tuning ni formato de herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay entrenamiento orientado a agentes ni a seguir instrucciones.
- Capacidades multilingues: no; solo ingles segun la model card.
- Capacidad especial: ninguna documentada (sin modo thinking, sin vision, sin audio). Es un modelo de texto puro.
- Uso como extractor de representaciones: sus hidden states pueden alimentar cabezales de clasificacion tras un fine-tuning.

## Casos de uso

- Continuacion de texto y autocompletado en ingles: el modelo completa prefijos de forma coherente a corto plazo (`"The capital of France is"`), adecuado para prototipos de escritura asistida o generacion de texto corto donde no se requiere seguir instrucciones.
- Punto de partida para fine-tuning supervisado (SFT): con 146M parametros, el ajuste completo cabe en una sola GPU de consumo, lo que permite adaptarlo a dominios concretos (soporte, documentacion tecnica, texto legal sencillo) sin presupuesto de cluster.
- Clasificacion de texto mediante cabezal sobre hidden states: entrenar un clasificador de sentimiento, toxicidad o topicos congelando el modelo y anadiendo una capa lineal, aprovechando que ya ha visto 75B tokens de texto web y academico.
- Investigacion academica sobre eficiencia de datos: el par (75B tokens, indice 26,55) frente a SmolLM2-135M (2T tokens, 27,13) lo convierte en un punto de comparacion util para estudiar curvas de escalado y el efecto del cooldown con learning rate constante.
- Reproduccion y auditoria de evaluaciones: el autor documenta el comando de lm-evaluation-harness y el script ArithMark-3, de modo que un tercero puede replicar la tabla de resultados sobre los pesos float32 publicados.
- Despliegue en hardware muy limitado o en el borde: con pesos float32 ocupan aproximadamente 585 MB, por lo que la inferencia es viable en GPUs integradas, portatiles con GPU discreta modesta o incluso CPU para generacion de baja latencia.
- Docencia de arquitecturas transformer: al incluir el codigo de modelado en el propio repositorio y una configuracion pequena y legible (30 capas, 640 de hidden size, GQA), sirve como caso practico para explicar GQA, RoPE, SwiGLU y atado de embeddings.
- Generacion de textos cortos controlados por plantilla: descripcion de productos, pies de foto o resumenes de una frase en ingles, con revision humana, dado el bajo coste por token.

## Benchmarks y rendimiento

Resultados zero-shot declarados por el autor, medidos con lm-evaluation-harness y el script ArithMark-3 del leaderboard, sobre los pesos float32 exportados en el repositorio.

| Benchmark | Metrica | Resultado |
|---|---|---|
| HellaSwag | acc_norm | 42,51 |
| ARC-Easy | acc_norm | 54,88 |
| ARC-Challenge | acc_norm | 28,75 |
| PIQA | acc_norm | 67,46 |
| ArithMark-3 | acc_norm | 43,70 |
| Open SLM Index | Formula del leaderboard | 26,55 |

Comparacion publicada por el autor con otros modelos del mismo rango de tamano (cifras del Open SLM Leaderboard):

| Modelo | Parametros | Tokens de entrenamiento | Index |
|---|---:|---:|---:|
| SmolLM2-135M | 135M | 2T | 27,13 |
| cagliostro-v3 | 146M | 75B | 26,55 |
| SmolLM-135M | 135M | 600B | 25,74 |
| GPT-X2.5-135M | 135M | 75B | 25,17 |
| Haidass1.5-143M | 143M | 400B | 25,07 |
| BananaMind-2-Pro | 139M | 100B | 24,96 |

En ArithMark-3 el autor situa a cagliostro-v3 tercero del ranking consultado, con 43,70, por detras de MobileLLM-R1-140M-base (65,70) y palmer-006 (52,70). En PIQA queda por debajo de GPT-X2.5-135M (69,42 frente a 67,46), tarea que ademas es la de mayor peso en la formula del indice (0,548 por punto). No hay resultados independientes de terceros en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: los pesos float32 ocupan aproximadamente 585 MB (146.352.000 × 4 bytes); en bfloat16 serian unos 293 MB. Hay que sumar el coste de activaciones, cache KV (10 capas con 5 cabezas K-V y contexto de 2.048, muy reducida) y overhead del runtime. No hay cifras oficiales de consumo para inferencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM libre es suficiente en la practica; el autor entreno el modelo completo en una sola RTX 5090, lo que da una idea del perfil de memoria en entrenamiento (no comparable al de inferencia).
- Cabe en GPU de consumo: si. Es viable en RTX 3060/4060/4090/5090 y en GPUs integradas con memoria compartida; tambien en CPU para generacion lenta.
- Opciones de despliegue: la via documentada es transformers con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True, dtype=torch.float32)`. No hay soporte documentado de llama.cpp, Ollama, vLLM, TGI ni SGLang, y la ausencia de pesos GGUF o cuantizados implica que habria que convertirlos y adaptar el codigo de modelado antes de usar esos motores. `trust_remote_code=True` implica revisar el codigo del repositorio antes de ejecutarlo.
- Latencia y throughput: no disponible para inferencia. El unico dato de rendimiento publicado es de entrenamiento (90.000 a 103.000 tokens por segundo en una RTX 5090, aproximadamente 9 dias de reloj de pared para 75B tokens).
- Almacenamiento: el repositorio ocupa 651,1 GB, muy por encima del tamano de los pesos float32, por lo que conviene descargar selectivamente en lugar de clonar el repo completo.

## Comparativa con modelos similares

| Modelo | Parametros | Tokens | Contexto | Index (Open SLM) | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| cagliostro-v3 | 146M | 75B | 2.048 | 26,55 | Apache 2.0 | Pesos safetensors float32, requiere `trust_remote_code` |
| SmolLM2-135M | 135M | 2T | No disponible en la informacion | 27,13 | No disponible en la informacion | No disponible en la informacion |
| SmolLM-135M | 135M | 600B | No disponible en la informacion | 25,74 | No disponible en la informacion | No disponible en la informacion |
| GPT-X2.5-135M | 135M | 75B | No disponible en la informacion | 25,17 | No disponible en la informacion | No disponible en la informacion |

Lectura de la comparativa: frente a SmolLM2-135M, cagliostro-v3 pierde 0,58 puntos de indice con 27 veces menos tokens; frente a GPT-X2.5-135M, con el mismo presupuesto declarado de 75B tokens, gana 1,38 puntos. No hay datos de licencia ni de formatos de pesos de los modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning ni plantilla de chat: no sigue instrucciones, no mantiene conversaciones estructuradas y no debe usarse tal cual como asistente.
- Idioma unico: solo ingles. Cualquier uso en castellano producira resultados degradados, sin garantias de calidad.
- Ventana de contexto de 2.048 tokens, insuficiente para documentos largos, dialogos extensos o tareas de RAG con muchos fragmentos.
- Riesgo alto de alucinacion: con 146M parametros y 75B tokens vistos, la capacidad de conocimiento factual es limitada (HellaSwag 42,51 y ARC-Challenge 28,75 estan cerca del azar corregido en tareas de sentido comun y razonamiento).
- Rendimiento desigual: el autor reconoce que el resultado es desequilibrado, con buen comportamiento en aritmetica y retraso en PIQA, la tarea de mayor peso en el indice del leaderboard.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad. El entrenamiento usa principalmente web filtrada (FineWeb-Edu, DCLM-Baseline), por lo que hereda los sesgos de esas fuentes.
- Cifras autodeclaradas: todos los benchmarks y comparaciones provienen del autor, sin verificacion independiente disponible en la informacion consultada.
- Adopcion muy baja: 81 descargas y 18 likes en el momento de los datos, lo que implica poca comunidad, pocos reportes de fallos y escaso soporte de terceros.
- Requiere `trust_remote_code=True` y ejecuta codigo alojado en el repositorio; en entornos de produccion debe auditarse antes de cargarlo.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no incluye garantias ni indemnizacion; conviene revisar tambien las licencias de los datasets de entrenamiento si el uso es comercial.
- El repositorio ocupa 651,1 GB, un orden de magnitud por encima de lo que necesitan los pesos, lo que complica el despliegue automatizado y el almacenamiento en cache.
- No hay pesos cuantizados ni integracion con motores de inferencia de alto rendimiento, por lo que el coste de puesta en produccion recae en el integrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bench-labs/cagliostro-v3
- Open SLM Leaderboard (metrica del indice): https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset HuggingFaceTB/smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset mlfoundations/dclm-baseline-1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Resultados de busqueda web: no se ha encontrado informacion relevante sobre el modelo; las coincidencias devueltas corresponden a la marca de ropa Bench (bench.shop, Zalando, Wikipedia) y no guardan relacion con bench-labs ni con cagliostro-v3.
