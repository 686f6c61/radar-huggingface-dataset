# KiteFishAI/NanoI1-155M-Base

## Resumen

NanoI1-155M-Base es un modelo de lenguaje decoder-only de 155,3 millones de parametros entrenado desde cero por KiteFish AI sobre aproximadamente 1,0 billon de tokens. Esta disenado especificamente para despliegue local de bajo coste en sectores regulados de la India (banca, seguros y servicios financieros), donde la residencia de datos y el coste de inferencia priman sobre el conocimiento general abierto. Su proposito principal es servir como base para fine-tuning en tareas de extraccion estructurada, clasificacion, enrutamiento y Q&A fundamentado sobre documentos.

La arquitectura emplea Multi-Head Latent Attention (MLA), SwiGLU, RMSNorm con pre-norm y QK-norm, y RoPE con theta de 5.000.000. La innovacion mas destacable es el uso de MLA, que almacena un unico vector latente de 256 dimensiones por token y capa en lugar de las claves y valores completos (2 x 768), reduciendo el KV cache aproximadamente 6 veces respecto a atencion multi-cabeza estandar con la misma anchura. Esta optimizacion es especialmente relevante para despliegues con memoria limitada.

El modelo se distribuye bajo licencia Apache-2.0 y soporta ingles ademas de hindi y otras ocho lenguas indias (bengali, marathi, tamil, telugu, gujarati, kannada, malayalam y punyabi), aunque el propio autor califica el soporte multilingue como limitado. Esta es la version base (pretrained); para uso conversacional o de seguimiento de instrucciones existe una variante Instruct publicada por el mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Multi-Head Latent Attention (MLA), SwiGLU, RMSNorm y RoPE |
| Parametros totales | 155.293.056 (78,0M en capas transformer, 38,6M en embedding de entrada, 38,7M en proyeccion de salida) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (entrenado) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Ingles; hindi y otras 8 lenguas indias (bengali, marathi, tamil, telugu, gujarati, kannada, malayalam, punyabi) con soporte limitado |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (requiere codigo Python personalizado del repositorio; no hay clase en `transformers`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 12 capas con tamano oculto de 768, 12 cabezas de atencion de dimension 64, dimension latente KV de 256 para MLA, FFN SwiGLU de 2.048 unidades ocultas, normalizacion RMSNorm con epsilon 1e-6 y QK-norm, y embeddings de entrada y salida no atados (untied). El tokenizador es un BPE a nivel de byte con 50.304 tokens y 32 tokens especiales, entrenado sobre una mezcla propia. La atencion MLA reduce el KV cache a un vector latente de 256 dimensiones por token y capa, lo que supone un ahorro de memoria de aproximadamente 6 veces frente a atencion multi-cabeza convencional.

El entrenamiento se estructuro en tres fases sobre un total de aproximadamente 998.000 millones de tokens. La fase de pretraining consumio 629.000 millones de tokens (pasos 0 a 600.000) sobre un corpus propio de 798.000 millones de tokens con cada token visto como maximo una vez, compuesto por web en ingles, codigo, papers de peS2o, web multilingue, Project Gutenberg, matematicas de Proof-Pile y Wikipedia en ingles, con warmup lineal y tasa de aprendizaje constante de 6e-4. La fase de extension anadio 319.000 millones de tokens (pasos 600.000 a 904.000) con el remanente no visto del corpus inicial (169.000 millones), FineWeb-Edu (60.000 millones), The Stack v2 (50.000 millones), Institutional Books 1.0 (25.000 millones) y FineMath (15.000 millones). La fase de anneal uso 50.000 millones de tokens de una mezcla de alta calidad (FineWeb-Edu, Cosmopedia, FineMath, Dolmino math y FLAN, corpus de annealing de OpenCoder, StackExchange y FineWeb-2 Indic, con aproximadamente un 35% de replay de las fuentes de la fase 1) y decaimiento lineal de la tasa de aprendizaje de 6e-4 a 0.

Se aplico descontaminacion de benchmarks eliminando todo documento anadido en las fases 2 y 3 que compartiera una secuencia de 13 palabras con los conjuntos de test. El optimizador fue AdamW (beta 0,9/0,95, weight decay 0,1, gradient clip 1,0) con precision mixta bf16, batch global de 1.048.576 tokens (512 x 2.048) y un sampler determinista de exactamente una pasada. El entrenamiento se ejecuto en 8 GPU NVIDIA H100 NVL a aproximadamente 1,45 millones de tokens por segundo.

## Capacidades

- Generacion de texto autoregresiva en ingles y, de forma limitada, en hindi y otras ocho lenguas indias.
- Modelo base orientado a fine-tuning: no incluye alineamiento conversacional ni seguimiento de instrucciones por si mismo.
- Extraccion estructurada de informacion tras ajuste fino.
- Clasificacion y enrutamiento de texto tras ajuste fino.
- Q&A fundamentado sobre documentos proporcionados (grounded Q&A) tras ajuste fino.
- Capacidad limitada de razonamiento y matematicas (resultados cercanos a azar en GSM8K y MATH).
- Capacidad limitada de generacion de codigo (HumanEval 9,1% en zero-shot).
- Soporte de tool calling / function calling: no disponible de forma nativa en la version base.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa en la version base.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Extraccion estructurada de datos financieros: tras fine-tuning, el modelo puede convertir documentos bancarios no estructurados (extractos, formularios, contratos) en campos JSON normalizados, aprovechando su bajo coste de inferencia para procesar grandes volumenes en local.
- Clasificacion de tickets y solicitudes: adecuado para enrutar consultas de clientes a departamentos o colas especificas en entornos de seguros y banca, con despliegue on-premise que garantiza la residencia de datos.
- Q&A fundamentado sobre documentacion interna: con ajuste fino, responde preguntas sobre politicas, manuales o normativa proporcionada en el contexto, limitado a los 2.048 tokens de ventana disponibles.
- Enrutamiento y moderacion en pipelines: clasificacion rapida de intenciones o deteccion de contenido sensible como paso previo a modelos mayores, reduciendo coste computacional global.
- Procesamiento en entornos con restricciones regulatorias: al ejecutarse en hardware modesto y bajo licencia Apache-2.0, encaja en despliegues on-premise de instituciones financieras que no pueden enviar datos a APIs externas.
- Prototipado y experimentacion academica: su tamano reducido (155M parametros) y su arquitectura MLA documentada lo hacen util para investigar tecnicas de atencion eficiente y entrenamiento de modelos pequenos desde cero.
- Fine-tuning especifico de dominio con presupuesto limitado: al partir de un checkpoint base entrenado sobre ~1T tokens, permite adaptar el modelo a vocabulario y tareas sectoriales con recursos de computo modestos.

## Benchmarks y rendimiento

Resultados del checkpoint base (fase 3) evaluados con lm-evaluation-harness 0.4.13 a 2.048 tokens de contexto, mismo prompt, shots y decodificacion greedy. Puntuaciones en porcentaje; Pile en bits por byte (menor es mejor).

| Benchmark | Shots | NanoI1-155M | Gemma-3-270M | Qwen3-0.6B-Base |
|---|---|---|---|---|
| WinoGrande | 5 | 52,6 | 54,0 | 59,9 |
| ARC-Easy | 25 | 58,9 | 59,0 | 74,9 |
| ARC-Challenge | 25 | 28,1 | 30,0 | 45,1 |
| OpenBookQA | 0 | 32,2 | 30,6 | 34,6 |
| RACE-High | 5 | 33,1 | 31,4 | 37,3 |
| TriviaQA | 5 | 10,2 | 14,3 | 20,1 |
| NaturalQuestions | 5 | 3,2 | 4,1 | 7,6 |
| MMLU-Redux | 5 | 27,8 | 28,2 | 32,1 |
| MMLU-Pro | 5 | 7,8 | 8,5 | 25,5 |
| GPQA | 5 | 26,6 | 25,9 | 29,9 |
| BBH | 3 | 18,4 | 22,7 | 39,4 |
| GSM8K | 8 | 4,0 | 1,8 | 48,9 |
| MATH | 4 | 2,2 | 2,4 | 29,9 |
| HumanEval | 0 | 9,1 | 2,4 | 29,3 |
| EvalPlus | 0 | 4,3 | 1,2 | 13,0 |
| INCLUDE (44 idiomas) | – | 26,0 | 25,5 | 36,3 |
| MMMLU | 5 | 23,6 | 25,6 | 38,7 |
| Pile test (BPB, menor es mejor) | – | 0,870 | 0,868 | 0,716 |

Frente a Gemma-3-270M, NanoI1-155M es superior en codigo (HumanEval aproximadamente 4 veces mayor), matematicas de primaria, comprension lectora y OpenBookQA, pero inferior en sentido comun (HellaSwag, PIQA) y recuerdo factual (TriviaQA). Frente a Qwen3-0.6B-Base, con aproximadamente 4 veces mas parametros y ~36T tokens de entrenamiento, Qwen3 es superior en todas las categorias. Muchos benchmarks de conocimiento (MMLU-Pro, GPQA, SuperGPQA, MMMLU) se situan cerca del azar para todos los modelos por debajo de 300M parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada. Como referencia orientativa, 155M parametros en fp16 ocupan aproximadamente 0,31 GB de pesos; en bf16 similar; en cuantizacion de 8 bits aproximadamente 0,16 GB y en 4 bits aproximadamente 0,08 GB, a lo que habria que sumar el KV cache (reducido por MLA) y overhead del runtime.
- GPU recomendadas: el modelo se entreno en 8 x NVIDIA H100 NVL, pero por su tamano cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con al menos 2-4 GB de VRAM disponible, y tambien en CPU.
- Opciones de despliegue: el modelo requiere codigo Python personalizado del repositorio (`modeling_nanoi1.py`, `chat.py`) y no dispone de clase en `transformers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada; el flujo oficial es via `torch`, `safetensors`, `tokenizers` y `huggingface_hub`.
- Latencia y throughput: no disponible para inferencia. Durante el entrenamiento se alcanzaron aproximadamente 1,45 millones de tokens por segundo en 8 x H100 NVL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Rendimiento relativo |
|---|---|---|---|---|---|
| NanoI1-155M-Base | 155M | 2.048 | ~998B tokens | Apache-2.0 | Base; superior a Gemma-3-270M en codigo y matematicas basicas; inferior a Qwen3-0.6B en todo |
| Gemma-3-270M | ~270M | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | Ligeramente superior en sentido comun y recuerdo factual; inferior en codigo y matematicas de primaria |
| Qwen3-0.6B-Base | ~600M | No disponible en la informacion | ~36T tokens | No disponible en la informacion | Superior en todas las categorias evaluadas |

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones ni mantiene conversaciones de forma nativa; requiere fine-tuning o el uso de la variante Instruct.
- Ventana de contexto muy limitada (2.048 tokens), insuficiente para documentos largos o conversaciones multi-turno extensas.
- Rendimiento cercano al azar en benchmarks de conocimiento general (MMLU-Pro 7,8; GPQA 26,6; MMMLU 23,6; GSM8K 4,0; MATH 2,2), por lo que no es adecuado para tareas que requieran conocimiento factual o razonamiento matematico.
- Capacidad de generacion de codigo limitada (HumanEval 9,1; EvalPlus 4,3).
- Soporte multilingue limitado segun el propio autor: el ingles es la lengua principal y las lenguas indias tienen cobertura parcial.
- Riesgo de alucinacion elevado en tareas de conocimiento abierto; el modelo esta pensado para Q&A fundamentado sobre documentos proporcionados, no para conocimiento parametrico.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion proporcionada; al entrenarse sobre web en ingles y multilingue, es previsible que herede sesgos de esas fuentes.
- Requiere codigo personalizado del repositorio para cargar los pesos (no hay clase en `transformers`), lo que complica la integracion con ecosistemas estandar y con herramientas de despliegue como vLLM o TGI.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion con atribucion y sin garantias; no se documentan restricciones adicionales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KiteFishAI/NanoI1-155M-Base
- Variante Instruct: https://huggingface.co/KiteFishAI/NanoI1-155M-Instruct
- Sitio del autor: https://kitefishai.com
- Paper, blog o repositorio de entrenamiento: no disponible en la informacion proporcionada.
