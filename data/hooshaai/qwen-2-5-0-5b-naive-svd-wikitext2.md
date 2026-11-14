# Hooshaai/qwen-2.5-0.5b-naive-svd-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-naive-svd-wikitext2` es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirurgicamente los bloques de atencion del decodificador por un modulo de atencion lineal basado en SVD truncado (`naive_svd`), perteneciente al registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo del autor no es ofrecer un modelo listo para produccion, sino servir como linea base de investigacion para comparar tecnicas de atencion subcuadratica frente a la atencion cuadratica estandar, dentro de lo que el proyecto denomina "Qwen Attention Zoo".

El modelo parte de los pesos de `Qwen/Qwen2.5-0.5B` (arquitectura transformer decoder-only, 0,5 mil millones de parametros, GQA con 14 cabezas de consulta y 2 de clave/valor, `hidden_size=896`, `head_dim=64`) y aplica un patron de sustitucion `hybrid_3_1`: 18 de las 24 capas usan `naive_svd` y 6 capas conservan atencion cuadratica completa como anclas (indices 3, 7, 11, 15, 19 y 23). Tras la cirugia, se aplica una destilacion de conocimiento en dos etapas sobre WikiText-2 para recuperar capacidad predictiva.

La relevancia actual es metodologica: el autor publica la telemetria completa del proceso, incluyendo la perplejidad antes de la destilacion (205.383,89) y despues (279,98), lo que permite cuantificar cuanto recupera la destilacion frente al dano inicial de la cirugia. No obstante, la perplejidad final sigue siendo muy superior a la del modelo base original, por lo que debe interpretarse como un artefacto de investigacion y no como un modelo de uso general. El repositorio solo contiene los pesos de atencion (57,16 MB), no el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `naive_svd` (SVD truncado) y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B); el repo solo publica pesos de atencion (57,16 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (solo `attention_weights.safetensors`); requiere cargar el modelo base Qwen2.5-0.5B y aplicar la cirugia |
| Libreria | neuralops |
| Patron de cirugia | `hybrid_3_1` (3:1 intercalado, anclas en capas 3, 7, 11, 15, 19, 23) |
| GQA | 14 cabezas Q, 2 cabezas KV, `head_dim=64`, `hidden_size=896` |
| Dataset de entrenamiento | Salesforce/wikitext (`wikitext-2-raw-v1`) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es el transformer decoder-only de Qwen2.5-0.5B, con atencion de tipo grouped-query (14 cabezas de consulta, 2 de clave/valor, dimension de cabeza 64 y oculta 896). Sobre esa base, el autor aplica una "cirugia" que reemplaza el modulo de atencion en 18 de las 24 capas por `NaiveSVDAttention`, una implementacion de atencion basada en descomposicion en valores singulares truncada, con inicializacion SVD plana sin calibracion y sin adaptadores de recuperacion. Las 6 capas restantes (indices 3, 7, 11, 15, 19, 23) mantienen atencion cuadratica completa como anclas. El adaptador `QwenAttentionAdapter` gestiona la expansion 7x de cabezas KV y el contrato de un unico `o_proj`.

El modulo `naive_svd` declara soporte para atencion causal, bidireccional, cross-attention y GQA nativo, pero no para RoPE (`supports_rope: N/A`). El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2: la etapa 1 (135 pasos, 54,1 s) congela el backbone y alinea representaciones ocultas capa a capa con MSE y coseno (peso 0,25), con `lm_head` desactivado; la etapa 2 (311 pasos, 126,0 s) aplica destilacion multi-capa con MSE y coseno (peso 0,50). En total, 446 pasos de optimizacion en 180,3 s, con `seq_len=512`, `grad_accum=4` y `topk=64`, usando autocast FP16 con parametros maestros en FP32 y un pico de VRAM de 15.111 MB. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generacion de texto autoregresiva causal en ingles, heredada del modelo base Qwen2.5-0.5B.
- Modulo de atencion con soporte declarado para atencion causal, bidireccional y cross-attention (segun la tabla de capacidades del modulo).
- Soporte nativo de GQA (14 cabezas Q / 2 KV) con expansion automatica de cabezas KV en el adaptador.
- Capacidad de servir como linea base reproducible para comparar variantes de atencion subcuadratica dentro del Attention Zoo de NeuralOps.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, vision ni audio en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.

## Casos de uso

- Investigacion comparativa de atencion subcuadratica: usar este checkpoint como referencia "naive" frente a otras variantes del registro `ATTENTION_REGISTRY` (por ejemplo, `MinimalSVDAttention`) para medir el impacto de la inicializacion SVD sin calibracion en la perplejidad final.
- Reproduccion de experimentos de destilacion: la telemetria publicada (PPL pre-KD de 205.383,89 y post-KD de 279,98, con pasos y tiempos por etapa) permite replicar el pipeline de dos etapas y validar la recuperacion de capacidad tras la cirugia.
- Estudio del patron `hybrid_3_1`: analizar como afecta la proporcion de capas con atencion lineal frente a capas cuadraticas de ancla (6/24) a la calidad del modelo en tareas de lenguaje.
- Docencia y formacion: ejemplo didactico de sustitucion modular de bloques de atencion en un LLM pequeno (0,5 B) que cabe en una GPU de consumo con FP16 (pico documentado de ~15 GB en entrenamiento).
- Benchmark de perplejidad en WikiText-2: usar el valor 279,98 como punto de comparacion en estudios de eficiencia de atencion sobre el split de validacion de `wikitext-2-raw-v1`.
- Prototipado de integracion con NeuralOps Hub: validar la API `load_surgeried_model` y el flujo de carga de pesos quirurgicos sobre el modelo base Qwen2.5-0.5B antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| Perplejidad de validacion (post-KD) | wikitext-2-raw-v1 (validation) | 279,98 |
| Perplejidad causal pre-KD (Stage 0) | wikitext-2-raw-v1 | 205.383,89 |
| Delta de perplejidad | wikitext-2-raw-v1 | -205.103,91 |
| Pasos de optimizacion (total) | - | 446 (180,3 s) |
| Pico de VRAM en entrenamiento | - | 15.111 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. La unica metrica reportada es la perplejidad en WikiText-2.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B ocupa aproximadamente 1 GB en FP16; con los pesos de atencion sustituidos el orden de magnitud es similar. El autor reporta un pico de 15.111 MB durante el entrenamiento (FP16 autocast con maestros FP32 y `seq_len=512`), no durante inferencia.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en FP16 del modelo de 0,5 B; para reproducir el entrenamiento se necesitan al menos ~16 GB (el autor uso 15.111 MB de pico).
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con suficiente VRAM para el modelo base y el contexto elegido.
- Opciones de despliegue: la libreria oficial es `neuralops` (API `load_surgeried_model`); tambien es posible cargar el modelo base con `transformers` y aplicar la cirugia con `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-naive-svd-wikitext2 | 0,5 B | no disponible | 279,98 (post-KD) | MIT | Pesos de atencion en HF (57,16 MB) |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 tokens (segun Qwen2.5) | no disponible en esta ficha | Apache 2.0 (modelo base Qwen2.5) | Modelo completo en HF |
| Otras variantes del Attention Zoo de NeuralOps (p. ej. `MinimalSVDAttention`) | 0,5 B | no disponible | no disponible | MIT (segun repo NeuralOps) | Pesos de atencion en HF |

La comparacion directa con el modelo base Qwen2.5-0.5B en perplejidad no esta disponible en la informacion proporcionada; el unico punto de referencia interno es la PPL pre-KD de 205.383,89, que refleja el dano inicial de la cirugia antes de la destilacion.

## Limitaciones y advertencias

- Perplejidad final muy elevada (279,98) en comparacion con lo esperable en un modelo de 0,5 B bien entrenado; el checkpoint no es adecuado para uso en produccion ni para generacion de texto de calidad.
- Solo se publican los pesos de atencion (`attention_weights.safetensors`); es imprescindible cargar el modelo base Qwen2.5-0.5B y aplicar la cirugia para obtener un modelo funcional.
- El modulo `naive_svd` declara `supports_rope: N/A`, lo que puede afectar al manejo de posiciones en contextos largos; no se documenta el comportamiento resultante.
- Entrenado exclusivamente en ingles y sobre WikiText-2, un corpus enciclopedico limitado; el riesgo de alucinacion y de degradacion fuera de dominio es alto.
- La inicializacion SVD es "plana" y sin calibracion, y no se usan adaptadores de recuperacion; el autor la presenta explicitamente como linea base, no como solucion optimizada.
- Los benchmarks declarados no estan verificados (`verified: false` en el model-index).
- Licencia MIT para los pesos publicados; el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0), que debe respetarse al redistribuir.
- El repositorio tiene 323 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- El identificador del repositorio en los ejemplos de la model card (`tahamajs/...`) difiere del ID real (`Hooshaai/...`), lo que puede provocar errores al seguir el quick start literalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-naive-svd-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2 (Salesforce/wikitext): https://huggingface.co/datasets/Salesforce/wikitext
