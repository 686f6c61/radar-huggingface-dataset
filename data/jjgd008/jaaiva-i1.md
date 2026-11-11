# jjgd008/jaaiva-i1

## Resumen

JAAIVA i1 (Just Another Artificial Intelligence Virtual Assistant) es un modelo de lenguaje conversacional de 503.381.760 parametros entrenado integramente desde cero por el desarrollador independiente jjgd008. No emplea pesos preentrenados, destilacion ni datos generados por API: tanto el tokenizador (BPE a nivel de byte con 8.192 tokens) como la arquitectura se construyeron especificamente para este proyecto. La distribucion publica se realiza como un unico fichero GGUF en F16 (0,94 GiB) compatible con llama.cpp.

El modelo sigue una arquitectura tipo GPT-2: 25 capas, 20 cabezas de atencion, anchura 1.280, feed-forward de 5.120 con activacion GELU (aproximacion tanh), normalizacion pre-LayerNorm, embeddings de posicion aprendidos y embeddings de entrada/salida atados. La longitud de contexto es de solo 1.024 tokens y el unico idioma soportado es el ingles.

La relevancia de esta ficha es fundamentalmente documental y educativa: se trata de un experimento reproducible de entrenamiento desde cero en hardware de consumo (una AMD Radeon RX 9070 XT con ROCm), no de un modelo apto para produccion. El propio autor lo etiqueta como "unstable model" y advierte de que produce hechos incorrectos, repeticiones y ocasionalmente consejos poco seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (decoder-only, pre-LayerNorm, QKV fusionado, GELU tanh) |
| Parametros totales | 503.381.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | F16 (publicado); F32 generable con el script de conversion |
| Idiomas soportados | Ingles |
| Licencia | other (sin terminos detallados en la informacion disponible) |
| Formato de pesos | GGUF (F16); checkpoint PyTorch original en el repositorio de GitHub |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con 25 capas, 20 cabezas de atencion y dimension de modelo 1.280. Emplea atencion con QKV fusionado, feed-forward de 5.120 con GELU aproximado por tanh, normalizacion pre-LayerNorm, embeddings de posicion aprendidos al estilo GPT-2 y embeddings de entrada/salida atados. El vocabulario es un BPE a nivel de byte de 8.192 tokens aprendido del propio corpus, sin tokenizador preentrenado. En llama.cpp se ejecuta con el grafo GPT-2 nativo.

El entrenamiento se realizo en tres fases sobre una AMD Radeon RX 9070 XT (gfx1201) con ROCm 7.2, a unas 16,1k tok/s y con un pico de unos 11 GiB de VRAM. El preentrenamiento cubrio 367.477.225 tokens en una epoca y 3.739 pasos (98.304 tokens por paso), con autocast bf16, AdamW fusionado y warmup con decaimiento coseno. Una segunda pasada de preentrenamiento continuado reutilizo el mismo corpus con un optimizador nuevo y un learning rate maximo de 1,5e-4 durante otros 3.739 pasos. El ajuste por instrucciones duro 2.500 pasos con learning rate de 4e-5 a 4e-6, mezclando pares de identidad y small-talk, cadenas multiturno, replay general, UltraChat-200k y Dolly-15k; la perdida se calcula unicamente sobre los tokens del asistente y el token de fin de respuesta. Los datos de preentrenamiento proceden de DailyDialog, PersonaChat, EmpatheticDialogues, BlendedSkillTalk, SODA y WikiText-103.

## Capacidades

- Generacion de texto conversacional en ingles: mantiene dialogos de tipo chat con plantilla integrada en el GGUF (`<|bos|><|user|> ... <|assistant|> ... <|eos|>`).
- Small-talk e identidad: responde a preguntas sobre si mismo identificandose como "jaaiva test1" (codename interno).
- Respuestas empaticas basicas: el corpus incluye EmpatheticDialogues, por lo que reconoce expresiones de emocion y responde con formulas de apoyo.
- Chistes y respuestas breves de conocimiento general: el ejemplo de la model card muestra respuestas a "tell me a joke" y "what is a neural network?".
- Historial multiturno limitado: la CLI de referencia conserva como maximo tres intercambios de historial.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`) mediante `llama-server`.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Docencia y divulgacion sobre entrenamiento desde cero: sirve para ilustrar el ciclo completo (tokenizador propio, preentrenamiento, ajuste por instrucciones y conversion a GGUF) en un solo proyecto reproducible en una GPU de consumo.
- Pruebas de integracion con llama.cpp: al ser un GGUF pequeno (0,94 GiB) con plantilla de chat embebida, es util para validar pipelines de `llama-cli` y `llama-server` y la compatibilidad con la API de OpenAI sin coste de infraestructura.
- Prototipado de interfaces conversacionales: permite montar un chat de demostracion en local con respuestas en ingles y contexto de 1.024 tokens, suficiente para pruebas de UX muy acotadas.
- Experimentos academicos de eficiencia: con 503M parametros y F16, cabe en cualquier GPU consumer moderna y permite medir latencia y throughput en hardware modesto.
- Generacion de respuestas de small-talk en ingles para conjuntos de datos sinteticos de baja exigencia, siempre con revision humana posterior.
- Base para fine-tuning educativo: el checkpoint PyTorch y el script de conversion permiten experimentar con ajuste adicional sobre dialogos cortos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente reporta perdida y perplejidad del modelo base:

| Split | Loss | Perplejidad |
|---|---|---|
| Validacion, primera pasada | 1,4599 | 4,31 |
| Test, primera pasada | 1,4290 | 4,17 |
| Validacion, pasada continuada | 1,3749 | 3,95 |
| Test, pasada continuada | 1,3429 | 3,83 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GiB en F16 (fichero de 0,94 GiB) y unos 2 GiB en F32 (1,88 GiB).
- GPU recomendadas: cualquier GPU consumer con al menos 2-3 GiB de VRAM libre; el autor entreno en una AMD Radeon RX 9070 XT con ROCm, y la inferencia via llama.cpp funciona en CPU y en GPU NVIDIA, AMD e Intel.
- Cabe en GPU consumer: si, practicamente en cualquier tarjeta moderna (RTX 3060, RTX 4090, RX 6000/7000, integradas con suficiente memoria compartida).
- Opciones de despliegue: `llama-cli` y `llama-server` de llama.cpp; tambien es compatible con frontends que acepten GGUF con plantilla de chat (por ejemplo, Ollama, aunque no se menciona explicitamente en la informacion disponible).
- Latencia y throughput: no disponible para inferencia; el autor reporta unas 16,1k tok/s durante el entrenamiento en la RX 9070 XT.
- Parametros de muestreo recomendados: temperatura 0,5, top-k 30, top-p 0,85 y repetition penalty 1,15 (con 1,05 aparecen bucles de repeticion).
- Contexto de servidor: `llama-server -c 1024` para respetar la ventana maxima del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JAAIVA i1 | 503M | 1.024 | Ingles | other | GGUF en Hugging Face |
| GPT-2 (124M-1.5B) | 124M-1.558M | 1.024 | Ingles | MIT | Pesos originales y GGUF |
| TinyLlama 1.1B | 1.100M | 2.048 | Ingles | Apache 2.0 | Pesos y GGUF |
| SmolLM-135M / 360M | 135M / 360M | 2.048 | Ingles | Apache 2.0 | Pesos y GGUF |

La comparacion es orientativa: JAAIVA i1 se entreno con 367M tokens, un volumen muy inferior al de TinyLlama o SmolLM, y no se han publicado evaluaciones que permitan situarlo numericamente frente a ellos. Su interes diferencial es la trazabilidad completa del entrenamiento desde cero, no el rendimiento.

## Limitaciones y advertencias

- Modelo marcado como inestable por el autor: no es un producto y no debe usarse para decisiones importantes.
- Infraentrenado: dos pasadas sobre 367M tokens es muy poco; es fluido pero carece de conocimiento factual fiable.
- Alucinacion frecuente: el autor advierte explicitamente de hechos incorrectos y ocasionalmente de consejos poco seguros.
- Riesgo de repeticion: con repetition penalty por debajo de 1,15 puede entrar en bucles del tipo "el cielo es azul porque es azul".
- Contexto muy corto (1.024 tokens) y solo ingles; no soporta otros idiomas.
- El comportamiento puede cambiar entre revisiones sin aviso.
- Licencia "other" sin terminos detallados en la informacion disponible: es necesario revisar el repositorio antes de cualquier uso comercial.
- No apto para ambitos medico, legal, financiero ni de seguridad critica.
- Deriva numerica entre PyTorch y ggml en prompts creativos abiertos, segun la validacion del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jjgd008/jaaiva-i1
- Repositorio GitHub (checkpoint PyTorch y script `convert_gguf.py`): https://github.com/jjgd008/jaaiva-i1
- llama.cpp: https://github.com/ggml-org/llama.cpp
