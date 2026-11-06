# sh-lee/nanochat-d12-sft

## Resumen

nanochat-d12-sft es la version de chat del modelo base sh-lee/nanochat-d12-base, un modelo de lenguaje de 185.597.952 parametros construido con el framework nanochat de Andrej Karpathy. Se trata de un modelo docente de tamano muy reducido (profundidad 12, anchura 768, 6 cabezas de atencion) disenado especificamente para el curso de conceptos de LLM, donde cada metrica mostrada en pantalla se mide sobre este mismo modelo. No es un modelo orientado a produccion ni a precision factual: el autor advierte explicitamente que produce respuestas cortas y a menudo incorrectas.

El modelo parte del checkpoint `model_007080.pt` del modelo base y aplica un proceso de mid-training (770 pasos de 524.288 tokens sobre SmolTalk, MMLU auxiliary train y GSM8K train) seguido de un SFT (651 pasos, 32 conversaciones por paso, 20.843 filas de ARC-Easy, ARC-Challenge, GSM8K train y 10.000 filas de SmolTalk). El resultado es un modelo conversacional con una ventana de contexto de solo 2.048 tokens y un vocabulario de 65.536 tokens.

Su relevancia es fundamentalmente pedagogica: permite reproducir de principio a fin el pipeline de entrenamiento de un LLM (preentrenamiento, mid-training, SFT y evaluacion) en hardware asequible (2x A100 80GB en bf16) y con pesos liberados bajo licencia MIT. No compite con modelos de produccion, sino que sirve como referencia reproducible para entender el funcionamiento interno de un transformer tipo GPT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nanochat GPT, profundidad 12, anchura 768, 6 cabezas (sin grouped KV), RoPE, QK norm, MLP ReLU², RMSNorm, embeddings no atados |
| Parametros totales | 185.597.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 para embeddings y fp32 para el resto; no se documentan recetas GGUF/AWQ/GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | PyTorch state dict (`model_000650.pt`), tokenizer en pickle (`tokenizer.pkl`) y `token_bytes.pt` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only tipo GPT con 12 capas, dimension de modelo 768 y 6 cabezas de atencion sin grouped-query attention. Incorpora RoPE (rotary positional embeddings), normalizacion QK, MLP con activacion ReLU al cuadrado, RMSNorm y embeddings de entrada/salida no atados. El tokenizer es el del modelo base, con vocabulario de 65.536 tokens, y se distribuye byte a byte identico.

El entrenamiento se divide en dos fases sobre el checkpoint base `model_007080.pt`. El mid-training consta de 770 pasos con batches de 524.288 tokens sobre SmolTalk, MMLU auxiliary train y GSM8K train, alcanzando un bits-per-byte de validacion minimo de 0,4670. El SFT posterior consta de 651 pasos con 32 conversaciones por paso sobre 20.843 filas (ARC-Easy, ARC-Challenge, GSM8K train y 10.000 filas de SmolTalk), con una perdida de validacion final de 1,2179. El entrenamiento se ejecuto en 2x A100 80GB PCIe en bf16, sobre el commit `d6d86cb` de nanochat con el parche de dos lineas del data-loader descrito en la model card del modelo base. No se documenta RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas tipicamente cortas.
- Razonamiento basico y respuesta a preguntas de opcion multiple (entrenado sobre MMLU y ARC).
- Aritmetica elemental y problemas de palabras de GSM8K, aunque con rendimiento muy limitado.
- Generacion de codigo a nivel introductorio (evaluado en HumanEval).
- Soporte de conversaciones multi-turno dentro de la ventana de 2.048 tokens.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni multi-step reasoning documentadas.
- No dispone de vision, audio ni modo thinking.
- Multilingue: no; solo ingles.

## Casos de uso

- Docencia de conceptos de LLM: el modelo esta pensado para que los estudiantes ejecuten el pipeline completo de nanochat (preentrenamiento, mid-training, SFT y `chat_eval`) y comparen cada metrica con la reportada en la model card.
- Reproduccion de experimentos de fine-tuning: al ser un modelo de 185M parametros con licencia MIT y checkpoint intermedio publicado, permite probar recetas de SFT y mid-training en hardware modesto y observar el efecto en las metricas de validacion.
- Practica de evaluacion de modelos: sirve para que investigadores noveles aprendan a interpretar ARC, MMLU, GSM8K, HumanEval y ChatCORE sobre un modelo cuyo comportamiento es conocido y documentado.
- Pruebas de infraestructura de inferencia: su tamano reducido permite validar integraciones con el CLI de nanochat (`scripts.chat_cli`) y el cargador `load_model` antes de escalar a modelos mayores.
- Demostraciones de chat en el terminal: el comando `python -m scripts.chat_cli -i sft` ofrece una interfaz conversacional minima (temperatura 0,6, top-k 50) util para talleres y clases.
- Estudio de tokenizacion: el tokenizer de 65.536 tokens se distribuye de forma identica al modelo base, lo que permite analizar su comportamiento y compararlo con el de otros modelos sin reentrenar.
- Analisis de limitaciones de modelos pequenos: sirve como caso de estudio de alucinacion, sesgo y baja precision factual en modelos de menos de 200M de parametros.

## Benchmarks y rendimiento

Resultados de `chat_eval` de nanochat en modo greedy, tomados del informe de la propia ejecucion:

| Tarea | Puntuacion |
|---|---|
| ARC-Easy | 0,3081 |
| ARC-Challenge | 0,2790 |
| MMLU | 0,2922 |
| GSM8K | 0,0197 |
| HumanEval | 0,0488 |
| ChatCORE | 0,0482 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (185,6M de parametros) y en torno a 0,4 GB en bf16; el repositorio completo ocupa 0,6 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es suficiente; el entrenamiento se realizo en 2x A100 80GB PCIe en bf16.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia.
- Opciones de despliegue: el CLI oficial de nanochat (`scripts.chat_cli`) y la API Python `load_model` del paquete nanochat. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| nanochat-d12-sft | 185.597.952 | 2.048 | MIT | Hugging Face (sh-lee/nanochat-d12-sft) |
| nanochat-d12-base | 185.597.952 | 2.048 | MIT | Hugging Face (sh-lee/nanochat-d12-base) |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo produce respuestas cortas y a menudo incorrectas; no fue entrenado para seguridad ni para precision factual.
- Riesgo elevado de alucinacion: con 185M de parametros y un SFT de 651 pasos, la fidelidad factual es muy baja.
- Ventana de contexto muy limitada (2.048 tokens), insuficiente para documentos largos o conversaciones extensas.
- Solo soporta ingles; no hay capacidades multilingues.
- Rendimiento muy bajo en tareas de razonamiento matematico (GSM8K 0,0197) y generacion de codigo (HumanEval 0,0488).
- No dispone de tool calling, capacidades de agente, vision ni audio.
- El tokenizer se distribuye como pickle (`tokenizer.pkl`); debe cargarse solo desde fuentes de confianza por el riesgo de ejecucion de codigo arbitrario.
- Licencia MIT para los pesos, pero los datos de entrenamiento tienen atribuciones propias que deben conservarse al redistribuir el modelo o derivados: FineWeb-Edu (ODC-By 1.0 y terminos de Common Crawl), SmolTalk (Apache-2.0), MMLU (MIT), GSM8K (MIT) y ARC (CC BY-SA 4.0).
- No esta afiliado ni respaldado por Andrej Karpathy ni por Hugging Face.
- No apto para produccion: es un modelo docente, no un modelo de uso comercial general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sh-lee/nanochat-d12-sft
- Modelo base: https://huggingface.co/sh-lee/nanochat-d12-base
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset ARC: https://huggingface.co/datasets/allenai/ai2_arc
