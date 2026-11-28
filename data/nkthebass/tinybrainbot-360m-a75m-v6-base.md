# nkthebass/tinybrainbot-360m-a75m-v6-base

## Resumen

TinyBrainBot-360M-A75M-v6-Base es un modelo de lenguaje de tipo mixture-of-experts (MoE) entrenado desde cero por el desarrollador independiente nkthebass. Con 383,4 millones de parametros totales y 75,7 millones activos por token, emplea 24 expertos por capa con enrutamiento top-4, y se carga como un `MixtralForCausalLM` estandar sin codigo personalizado. Es la continuacion de la version v5.1-Base, sobre la que anade 8,9 mil millones de tokens adicionales de entrenamiento.

El modelo aborda el problema de obtener capacidades de modelado de lenguaje con un coste computacional de inferencia muy reducido (solo 75M parametros activos), manteniendo un numero total de parametros que le permite almacenar mas conocimiento del habitual en modelos de su tamano activo. Es relevante para quienes investigan arquitecturas MoE eficientes, entrenamiento desde cero a pequena escala y despliegue en hardware muy limitado, ya que sus pesos cuantizados en Q4_K_M ocupan apenas 239 MB.

La arquitectura es un transformer decoder-only con atencion de consultas agrupadas (GQA), normalizacion RMSNorm y embeddings rotatorios (RoPE), con una longitud de contexto de 2048 tokens y un vocabulario SentencePiece de 32.000 entradas. Se distribuye bajo licencia Apache 2.0 en formatos safetensors y GGUF, y esta entrenado exclusivamente en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE (MixtralForCausalLM), GQA, RMSNorm, RoPE |
| Parametros totales | 383.429.376 (383,4M) |
| Parametros activos | 75,7M no-embedding por token + 24,6M de embedding atado |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF); safetensors en precision completa |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 12 capas, dimension oculta de 768, 12 cabezas de consulta de 64 dimensiones y 4 cabezas KV (GQA). Cada capa contiene 24 expertos SwiGLU de anchura 512 con enrutamiento top-4, lo que da lugar a los 75,7M parametros activos por token. El vocabulario es SentencePiece de 32.000 entradas, con el salto de linea como token propio, y el embedding esta atado a la capa de salida.

El entrenamiento acumula 26.800 millones de tokens en tres fases: los 17,9B de la version v5.1-Base, una continuacion de 8,7B tokens y un ajuste cientifico de 0,20B tokens sobre algunos de los expertos. En la continuacion se recalentó la tasa de aprendizaje durante 300 pasos hasta 6e-4, se mantuvo durante 7,5B tokens de texto masivo y luego decayo sobre una mezcla densa en conocimiento. La mezcla masiva (6,5B tokens) incluye ClimbMix (38%), DCLM-Ultra (27%), FineWeb-Edu (6%), libros de Gutenberg y BookCorpus (6%), libros de texto de Cosmopedia y WikiHow (6%), matematicas de OpenMathInstruct-2, UltraData-Math, FineMath y Orca-Math (5%), y Q&A y hechos de GooAQ, FactBase-DCLM y FinePhrase. Los pesos parten del paso 101.500 de la ejecucion anterior, seleccionado entre los ultimos cinco checkpoints por su mayor puntuacion en ARC-Easy. No se usaron datos de entrenamiento ni de test de los benchmarks.

## Capacidades

- Generacion de texto autoregresiva y continuacion de texto (modelo base, no conversacional).
- Razonamiento basico de sentido comun y respuesta a preguntas de opcion multiple (ARC, HellaSwag, PIQA).
- Aritmetica y problemas matematicos de nivel escolar, reforzados con un ajuste especifico de 0,20B tokens.
- Conocimiento factual y cientifico de dominio limitado, procedente de la mezcla densa en conocimiento.
- Capacidad multilingue: no disponible; solo ingles.
- Soporte de tool calling / function calling: no disponible (modelo base sin ajuste de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion en arquitecturas MoE eficientes: sirve como banco de pruebas para estudiar el enrutamiento top-4 y el equilibrio de expertos en un modelo de 383M parametros entrenado desde cero, con pesos abiertos y sin codigo personalizado.
- Despliegue en dispositivos de recursos muy limitados: con GGUF Q4_K_M de 239 MB, puede ejecutarse en CPU, Raspberry Pi o moviles mediante llama.cpp, LM Studio, Ollama o Jan, para generacion de texto offline.
- Prototipado rapido de pipelines de generacion: al cargarse como `MixtralForCausalLM` estandar en transformers, se integra sin adaptadores en flujos existentes de Hugging Face y text-generation-inference.
- Generacion de texto de bajo coste en produccion: el reducido numero de parametros activos (75,7M) permite throughput alto por GPU y latencia baja en tareas de continuacion de texto a gran escala.
- Fine-tuning como base para tareas especificas: al ser un modelo base con licencia Apache 2.0, es adecuado como punto de partida para ajuste supervisado en dominios concretos en ingles (clasificacion, extraccion, resumen extractivo).
- Experimentacion educativa: su tamano y su entrenamiento documentado en tres fases lo hacen util para ensenar y reproducir tecnicas de mezcla de datos, recalentamiento de tasa de aprendizaje y ajuste selectivo de expertos.
- Evaluacion comparativa de modelos pequenos: sirve como referencia en la Open SLM Leaderboard para comparar modelos de menos de 400M parametros en tareas de razonamiento y aritmetica.

## Benchmarks y rendimiento

Resultados declarados por el autor (zero-shot, conjuntos de test completos, acc_norm; entre parentesis, acc bruta). No verificados de forma independiente.

| Modelo | Parametros | Int Index | HellaSwag | ARC-E | ARC-C | PIQA | ArithMark-3 |
|---|--:|--:|--:|--:|--:|--:|--:|
| **TinyBrainBot-360M-A75M-v6-Base** (este modelo) | 383M (75M activos) | **32,64** | **43,20** | **62,54** | **38,05** | **72,03** | 44,70 |
| *(acc bruta)* | | *29,83* | *35,10* | *69,11* | *36,09* | *70,95* | *44,30* |
| TinyBrainBot-360M-A75M-v5.1-Base (anterior) | 383M (75M activos) | 25,96 | 37,90 | 58,12 | 35,75 | 67,57 | 40,20 |
| SmolLM2-360M | 362M | 41,86 | 56,30 | 68,48 | 38,31 | 71,60 | 59,60 |
| MobileLLM-R1-360M-base | 359M | 38,65 | 44,20 | 61,32 | 34,56 | 68,44 | 80,40 |
| KLM-1.6 | 99,0M | 33,95 | 45,28 | 61,07 | 33,53 | 70,18 | 55,90 |
| GPT-X3-150M | 149M | 33,05 | 46,16 | 59,64 | 31,31 | 71,33 | 50,90 |
| Rambley-V3-350M | 343M | 31,54 | 49,11 | 58,96 | 31,66 | 71,65 | 39,50 |
| LFM-2.5-350M-Base | 355M | 30,62 | 45,16 | 68,86 | 41,13 | 67,63 | 36,10 |
| SmolLM2-135M | 135M | 27,13 | 43,22 | 58,63 | 29,69 | 68,44 | 39,20 |

En 1.380 problemas aritmeticos retenidos, con habilidades y formulaciones no vistas, el modelo obtiene 46,7. Los datos del resto de modelos proceden de la Open SLM Leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB en F16 (768 MB de pesos), 0,4 GB en Q8_0 (409 MB) y 0,24 GB en Q4_K_M (239 MB), mas la memoria del contexto (hasta 2048 tokens).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona holgadamente en RTX 4090, A100 y H100, aunque el modelo esta infrautilizado en ellas.
- Cabe en GPU de consumo: si, en cualquier GPU consumer moderna (GTX 1050 Ti o superior) y tambien en CPU.
- Opciones de despliegue: transformers, llama.cpp, LM Studio, Ollama, Jan, text-generation-inference y endpoints compatibles.
- Latencia y throughput estimados: no disponibles; el reducido numero de parametros activos (75,7M) sugiere throughput alto y latencia baja, pero no se han publicado medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Int Index | Licencia | Disponibilidad |
|---|--:|--:|--:|--:|---|---|
| TinyBrainBot-360M-A75M-v6-Base | 383M | 75,7M | 2048 | 32,64 | Apache 2.0 | HF, GGUF |
| SmolLM2-360M | 362M | 362M | no disponible | 41,86 | no disponible | HF |
| MobileLLM-R1-360M-base | 359M | 359M | no disponible | 38,65 | no disponible | HF |
| LFM-2.5-350M-Base | 355M | 355M | no disponible | 30,62 | no disponible | HF |

Frente a SmolLM2-360M y MobileLLM-R1-360M-base, el modelo de nkthebass queda por debajo en Intelligence Index (32,64 frente a 41,86 y 38,65) y en ArithMark-3 (44,70 frente a 59,60 y 80,40), aunque supera a LFM-2.5-350M-Base en indice global. Su ventaja principal es el coste de inferencia: solo activa 75,7M parametros por token frente a los 350-360M densos de sus competidores.

## Limitaciones y advertencias

- Es un modelo base: continua texto y no mantiene conversaciones; no debe usarse como asistente sin un ajuste de instrucciones previo.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera muy deficiente.
- Longitud de contexto limitada a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo elevado de alucinacion y de conocimiento factual incorrecto por su reducido tamano y su volumen de entrenamiento (26,8B tokens).
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente.
- No dispone de soporte de tool calling, agentes ni modos especiales de razonamiento.
- Sesgos conocidos: no documentados, pero al entrenarse sobre corpus web en ingles (ClimbMix, DCLM, FineWeb-Edu) hereda los sesgos de esas fuentes.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no esta ajustado para tareas de produccion orientadas a usuario final.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v6-base
- Version anterior v5.1-Base: https://huggingface.co/nkthebass/tinybrainbot-360m-a75m-v5.1-base
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Dataset karpathy/climbmix-400b-shuffle: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Dataset ArrowLabs/DCLM-Ultra: https://huggingface.co/datasets/ArrowLabs/DCLM-Ultra
- Dataset HuggingFaceFW/fineweb-edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset HuggingFaceTB/smollm-corpus: https://huggingface.co/datasets/HuggingFaceTB/smollm-corpus
- Dataset HuggingFaceTB/cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset nvidia/OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset HuggingFaceTB/finemath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Dataset microsoft/orca-math-word-problems-200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
