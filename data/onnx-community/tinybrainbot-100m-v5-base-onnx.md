# onnx-community/tinybrainbot-100m-v5-base-ONNX

## Resumen

TinyBrainBot-100M-v5-Base es un modelo de lenguaje de 100,1 millones de parámetros entrenado desde cero por el usuario de Hugging Face nkthebass, distribuido por la comunidad onnx-community en formato ONNX para su uso en JavaScript mediante Transformers.js. Se trata de un modelo base (no conversacional) que continúa el entrenamiento de su predecesor v3 con 4,56 mil millones de tokens adicionales de datos densos en conocimiento, alcanzando un total de 29,6 mil millones de tokens procesados.

Su relevancia radica en la categoría de los small language models (SLM): compite en el Open SLM Leaderboard contra otros modelos de entre 90 y 140 millones de parámetros, y supera a su versión anterior en todas las tareas del leaderboard sin haber usado datos de benchmark en el entrenamiento. Es un modelo de tipo Llama puro (`LlamaForCausalLM`) con GQA, SwiGLU, RMSNorm y RoPE, con un contexto de 1.024 tokens y vocabulario SentencePiece de 32.000 tokens.

Al ser un modelo base, su función principal es la continuación de texto, no el diálogo. Es útil como experimento educativo, como motor de texto ligero en navegador o como punto de partida para fine-tuning en entornos con recursos muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder, GQA, SwiGLU, RMSNorm, RoPE) |
| Parametros totales | 100,1M (75,5M no-embedding + 24,6M embedding embebido) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (201 MB), Q8_0 (107 MB), Q4_K_M (66 MB) en GGUF; ONNX (tamano no especificado) |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (este repositorio), safetensors y GGUF en el repositorio base |

## Arquitectura y entrenamiento

El modelo es un transformer decoder con arquitectura estilo Llama: dimension oculta de 768, 12 capas, 12 cabezas de consulta de 64 dimensiones con 4 cabezas KV (GQA, grouped-query attention), MLP SwiGLU de 2048, normalizacion RMSNorm y codificacion posicional RoPE. El vocabulario es de 32.000 tokens SentencePiece con embedding embebido (tied embeddings). No requiere codigo personalizado, lo que garantiza compatibilidad directa con la biblioteca transformers.

El entrenamiento total abarca 29,6 mil millones de tokens: los 25,06 mil millones de la version v3-base mas 4,56 mil millones de tokens de continuacion organizados en cinco etapas, cada una con re-calentamiento del learning rate (picos entre 3e-4 y 6e-4) seguido de decay. Los pesos publicados corresponden al paso 113.000 de la ultima etapa, no a una fusion de checkpoints. La fase de continuacion prioriza datos densos en conocimiento: un 30% de pares de preguntas y respuestas (GooAQ, FactBase-DCLM, ELI5, finephrase FAQ), 23% de web curada (DCLM-Ultra-1.1, ClimbMix, FineWeb-Edu con puntuacion 4-5), 21% de libros de texto (Cosmopedia, WikiHow), 11% de Wikipedia, 4,5% de aritmetica (Orca-Math, UltraData-Math) y un 3% final de preguntas de ciencia de primaria generadas por Ling-3.0-Flash, depuradas para eliminar cualquier item que compartiese frases de 8 palabras con las preguntas de ARC. Los autores declaran que no se usaron datos de entrenamiento ni de test de los benchmarks.

## Capacidades

- Continuacion de texto en ingles (modelo base, no conversacional)
- Razonamiento de sentido comun y conocimiento de ciencias de nivel escolar (reflejado en PIQA y ARC)
- Aritmetica basica y problemas de matematicas de primaria (ArithMark-3.0: 47,0)
- Comprension de lectura y seleccion de respuestas multiple choice
- Generacion de texto coherente a corto plazo dentro de su ventana de 1.024 tokens
- Ejecucion en navegador mediante Transformers.js gracias al formato ONNX
- No soporta tool calling, agentes ni modos de razonamiento avanzado (no disponible)

## Casos de uso

- Generacion de texto en el navegador: gracias a la version ONNX y Transformers.js, puede ejecutarse integramente en el cliente sin servidor ni GPU, adecuado para demos, widgets o prototipos web con privacidad total del usuario.
- Experimentacion educativa: su tamano de 100M permite entrenar, analizar y depurar modelos de lenguaje en una sola GPU de consumo, ideal para cursos y aprendizaje sobre scaling laws y pipelines de preentrenamiento.
- Completado de texto offline en dispositivos limitados: con cuantizacion Q4_K_M ocupa solo 66 MB, viable en aplicaciones de escritorio (LM Studio, Jan, Ollama) en maquinas sin GPU dedicada.
- Fine-tuning de bajo coste: como modelo base con pesos abiertos (Apache 2.0), puede ajustarse para tareas especificas de dominio estrecho en hardware modesto.
- Respuesta a preguntas de ciencia escolar: su fase final de entrenamiento con 420k preguntas de ciencia de primaria lo hace apto para herramientas educativas basicas de repaso.
- Generacion aritmetica simple: incorpora drills de aritmetica y datasets como Orca-Math, util para autocompletado de operaciones y problemas de palabras sencillos.
- Benchmarking y comparacion de SLM: al reportar metricas en el Open SLM Leaderboard, sirve como referencia reproducible para comparar tecnicas de entrenamiento en la gama de 100M.

## Benchmarks y rendimiento

Resultados declarados por el autor (0-shot, acc_norm, sets completos):

| Benchmark | TinyBrainBot-100M-v5-Base | TinyBrainBot-100M-v3-Base | void.1 (90M) | MobileLLM-R1-140M-base | GPT-X2.5-135M |
|---|---:|---:|---:|---:|---:|
| Intelligence Index (Open SLM Leaderboard) | 26,07 | 20,97 | 24,38 | 24,64 | 25,17 |
| HellaSwag | 34,98 | 32,62 | 39,5 | 33,8 | 40,6 |
| ARC-Easy | 57,15 | 54,67 | 49,3 | 49,9 | 51,8 |
| ARC-Challenge | 34,47 | 30,12 | 29,4 | 24,7 | 29,2 |
| PIQA | 67,52 | 66,21 | 67,2 | 63,2 | 69,4 |
| ArithMark-3.0 | 47,00 | 37,40 | 43,7 | 65,7 | 38,4 |

Adicionalmente, en 1.380 problemas aritmeticos held-out (ArithMark-3 honesto, con tematicas y formulaciones nunca vistas), el modelo obtiene 40,7, cercano a su 47,0 publico. Ningun resultado esta verificado por terceros.

## Requisitos de hardware

- VRAM para inferencia: minima. En F16 ocupa unos 201 MB, en Q8_0 unos 107 MB y en Q4_K_M unos 66 MB; cabe holgadamente en cualquier GPU moderna o incluso solo en CPU y RAM.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090 o superior) lo ejecuta sin problema. En CPU tambien es viable.
- Consumer GPUs: si, cabe en practicamente cualquier GPU, incluidas integradas, dado su tamano inferior a 250 MB incluso sin cuantizar.
- Opciones de despliegue: Transformers.js (navegador, formato ONNX), llama.cpp, LM Studio, Ollama y Jan (formato GGUF), y transformers de Hugging Face en Python.
- Latencia y throughput: no disponible en la informacion proporcionada, aunque por tamano y contexto de 1.024 tokens se espera inferencia muy rapida incluso en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Intelligence Index | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| TinyBrainBot-100M-v5-Base | 100,1M | 1.024 | 26,07 | Apache 2.0 | ONNX, safetensors, GGUF |
| void.1 | 90,2M | no disponible | 24,38 | no disponible | no disponible |
| MobileLLM-R1-140M-base | 140M | no disponible | 24,64 | no disponible | no disponible |
| GPT-X2.5-135M | 135M | no disponible | 25,17 | no disponible | no disponible |

TinyBrainBot-100M-v5-Base lidera el grupo en el Intelligence Index del Open SLM Leaderboard, con ventajas notables en ARC-Easy y ARC-Challenge, aunque queda por detras en HellaSwag frente a void.1 y GPT-X2.5-135M, y en ArithMark-3.0 frente a MobileLLM-R1-140M-base.

## Limitaciones y advertencias

- Es un modelo base: no conversa ni sigue instrucciones; solo continua texto. No debe usarse como asistente sin un fine-tuning previo.
- Ventana de contexto de solo 1.024 tokens, muy limitada para documentos largos o conversaciones multi-turno.
- Entrenado exclusivamente en ingles; no es apto para castellano ni otros idiomas.
- Riesgo alto de alucinacion, tipico de modelos de 100M; los datos factuales que genera deben tratarse como poco fiables.
- Sesgos heredados de los datos web (FineWeb-Edu, DCLM-Ultra, Wikipedia) y de contenido sintetico generado por Ling-3.0-Flash, sin auditoria publica conocida.
- Los benchmarks provienen del propio autor y no estan verificados por terceros.
- Capacidad matematica limitada: 47,0 en ArithMark-3.0 es util para aritmetica basica, pero insuficiente para razonamiento matematico serio.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, pero conviene revisar los terminos de los datasets de entrenamiento para derivados sensibles.

## Enlaces

- Modelo ONNX: https://huggingface.co/onnx-community/tinybrainbot-100m-v5-base-ONNX
- Modelo base original: https://huggingface.co/nkthebass/tinybrainbot-100m-v5-base
- Version anterior (v3-base): https://huggingface.co/nkthebass/tinybrainbot-100m-v3-base
- Open SLM Leaderboard: https://huggingface.co/spaces/AxiomicLabs/Open_SLM_Leaderboard
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de Transformers.js (pipeline text-generation): https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.TextGenerationPipeline
