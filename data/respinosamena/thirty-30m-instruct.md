# respinosamena/Thirty-30M-Instruct

## Resumen

Thirty-30M-Instruct (nombre interno `TurboSynthesis`, checkpoint `r3c_soup_lab`) es un modelo de lenguaje denso de 30,1 millones de parametros (30.119.281 exactos), desarrollado por el usuario `respinosamena` y publicado bajo licencia Apache 2.0. Se trata de un modelo causal decoder-only afinado por instrucciones, derivado de `respinosamena/Thirty-30M-Base`, que fue preentrenado sobre 20.000 millones de tokens del dataset curado `respinosamena/Thirty-20B-Curated`. Su proposito es ofrecer un modelo instructivo extremadamente compacto con capacidades poco habituales en esta escala: contexto nativo de 8.192 tokens o mas, modo de razonamiento explicito mediante etiquetas `<think>...</think>`, cumplimiento de esquemas JSON, llamada a funciones en paralelo y memoria conversacional multi-turno.

La arquitectura, denominada `TurboSynthesis-30M`, consta de 15 capas con `d_model=384`, atencion GQA con 6 cabezas Q y 2 cabezas KV, QK-Norm tras RoPE, tokenizer BPE propio de 32.768 entradas y diversos modulos inductivos (engram de bigramas hash, smear gate, Canon-Lite de 4 taps, residuales `x0`/`v0`, `backout_lambda` en capa intermedia, MLP `ReLU²` de 4d y logit softcap de 15.0). El modelo se distribuye con pesos en BF16, FP16, INT8 e INT4 en safetensors, ademas de una version GGUF con cuantizaciones F16, Q8_0, Q4_K_M y Q4_0 y un motor propio en C++20 con soporte AVX-512.

Su relevancia actual radica en que demuestra que un modelo de 30M puede superar a alternativas 4,5 veces mayores (SmolLM2-135M-Instruct) en disciplina de parada (EOS), formato de razonamiento, JSON, tool calling y recuperacion en contexto largo, aunque queda por detras en generacion de codigo abierto y perplejidad de prosa general. Es un caso de estudio interesante sobre entrenamiento quirurgico de modelos pequenos y sobre el limite practico de las capacidades agenticas en la escala de decenas de millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (`TurboSynthesis-30M`), GQA, QK-Norm, RoPE |
| Parametros totales | 30.119.281 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 8.192+ tokens nativos (`rope_theta=500000.0`, `log_scale_base=1024`) |
| Tipos de cuantizacion | BF16 (original), FP16, INT8 (block-32 simetrico), INT4 (mixto int8 + uint4 block-32 asimetrico); GGUF: F16, Q8_0, Q4_K_M, Q4_0 |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16/FP16/INT8/INT4), GGUF v3 |

## Arquitectura y entrenamiento

`TurboSynthesis-30M` es un transformer causal denso de 15 capas con dimension oculta 384 y atencion GQA de 6 cabezas Q y 2 cabezas KV. Incorpora QK-Norm (escala 1.15) aplicada despues de RoPE, tokenizer BPE propio de 32.768 entradas con embeddings atados mediante `embed_rank=192` y `embed_proj`, y varios modulos inductivos disenados para mejorar la eficiencia en esta escala: un `engram_wte` de bigramas hash de 4096 x 32, una compuerta `smear_gate` de bigramas, un bloque Canon-Lite de 4 taps, residuales `x0` y `v0`, un `backout_lambda` en capa intermedia, MLP `ReLU²` de dimension 4d y logit softcap de 15.0.

El preentrenamiento se realizo sobre 20.000 millones de tokens del dataset `respinosamena/Thirty-20B-Curated` usando computo de Runpod. El post-entrenamiento (SFT) parte de `Thirty-30M-Base` y emplea un subconjunto filtrado quirurgicamente de `HuggingFaceTB/smoltalk`, recuperacion con contexto fundamentado de 420 a 7.500 tokens, ejercicios de aritmetica por valor posicional y trazas on-policy verificadas con Pass@8. El checkpoint final es un parameter soup en float32 convertido a bfloat16 con pesos `0.20 × r2_l_1ep + 0.35 × r3a_cooldown_math + 0.45 × r3b_onpolicy_polish`. No se documenta en la informacion disponible el uso de RLHF o DPO.

## Capacidades

- Generacion de texto causal en ingles con parada controlada (EOS al 93,8% en la suite de evaluacion).
- Razonamiento explicito en dos modos: Direct y `<think>...</think>` (activado mediante prompt de sistema), con formato correcto en el 86,1% de los casos evaluados.
- Memoria conversacional multi-turno (37,5% en MultiTurn-16).
- Cumplimiento de esquema JSON (100% en JSON-12 sintactico, 50% en validacion de esquema).
- Llamada a funciones en paralelo (80% en ToolCall-10).
- Recuperacion en contexto largo: Passkey-18 al 94,4% global y 66,7% a 8.192 tokens; LongQA-10 al 80%.
- Aritmetica basica verificada (25% en ExactMath-12, con entrenamiento especifico en valor posicional).
- Generacion de codigo Python (25% en PyExec-20), limitada.
- Capacidad multilingue: no disponible (solo ingles).
- Sin soporte de vision ni audio.

## Casos de uso

- Asistente conversacional ligero en dispositivos embebidos: con 30M de parametros y pesos INT4 de ~22 MB, puede ejecutarse en CPU o en microcontroladores de gama alta para dialogos multi-turno con memoria, aprovechando su disciplina de parada EOS del 93,8%.
- Extraccion estructurada de informacion: su 100% en JSON-12 sintactico y 50% en validacion de esquema lo hace util para convertir texto libre en JSON conforme a un schema en pipelines de ETL o preprocesado de datos.
- Orquestacion de agentes y tool calling: el 80% en ToolCall-10 permite integrarlo como router de funciones en sistemas multi-herramienta, emitiendo llamadas paralelas en formato estructurado.
- Clasificacion y respuesta sobre documentos largos: con contexto nativo de 8.192+ tokens y 66,7% en Passkey a 8k, es adecuado para QA extractivo sobre contratos, manuales o articulos que quepan en esa ventana.
- Razonamiento paso a paso de bajo coste: el modo `<think>` con formato correcto al 86,1% permite usarlo en tareas de aritmetica o logica donde se quiera trazabilidad del razonamiento sin coste de modelos grandes.
- Filtrado y enrutamiento en cascada: puede actuar como primer nivel en un sistema mixto, resolviendo consultas simples (JSON, tool calls, QA corto) y derivando las complejas a un modelo mayor, reduciendo coste y latencia.
- Prototipado e investigacion educativa: al ser Apache 2.0, con motor C++20 propio y cuantizaciones INT4/INT8 documentadas con metricas de degradacion (KL, Top-1 Agree), sirve como banco de pruebas para estudiar el efecto de la cuantizacion en modelos pequenos.

## Benchmarks y rendimiento

Evaluacion con decodificacion greedy (`T=0.0`, `rep_pen=1.05` en chat, `1.0` en Passkey) sobre la suite de 7 ejes del autor:

| Modelo | Parametros | EOS% | MT-16 | Exact-12 Dir / /thk | TFmt% | PyExec-20 | JSON-12 Syn/Sch | ToolCall-10 | Passkey-18 (8k) | LongQA-10 | MC-60 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Thirty-30M-Base (20B tokens) | 30,1M | 12,5% | 6,2% | 8,3% / 8,3% | 47,2% | 0,0% | 58,3% / 0,0% | 10,0% | 55,6% (0,0%) | 20,0% | 80,0% |
| **Thirty-30M-Instruct (BF16)** | **30,1M** | **93,8%** | **37,5%** | **25,0% / 25,0%** | **86,1%** | 25,0% | **100,0% / 50,0%** | **80,0%** | **94,4% (66,7%)** | **80,0%** | 78,3% |
| SmolLM2-135M-Instruct (4,5x mayor) | 135M | 75,0% | 31,2% | 8,3% / 0,0% | 0,0% | **60,0%** | 58,3% / 33,3% | 0,0% | 83,3% (0,0%) | 70,0% | **85,0%** |

Metricas de cuantizacion (referencia BF16 con `val_sft=1.4649`):

| Pesos | Tamano (MiB) | Bits/peso | val_sft | KL (mnats) | Top-1 Agree |
|---|---:|---:|---:|---:|---:|
| BF16 original | 57,46 | 16,00 | 1,4649 | 0,00 | 100,00% |
| FP16 | 57,49 | 16,00 | 1,4649 | 0,02 | 99,98% |
| INT8 | 30,66 | 8,53 | 1,4660 | 2,54 | 97,64% |
| INT4 mixto | 21,43 | 5,83 | 1,5999 | 176,86 | 78,33% |

Perplejidad de prosa base: BPB@512 = 0,9640 frente a 0,8436 de SmolLM2-135M-Instruct. Throughput maximo reportado en CPU con la version GGUF: hasta 963,8 tok/s.

## Requisitos de hardware

- VRAM estimada para inferencia: ~60 MB en BF16/FP16, ~32 MB en INT8, ~22 MB en INT4; la version GGUF Q4_0 ocupa aun menos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; cabe holgadamente en RTX 3060, RTX 4090, A100 y H100, aunque el modelo esta claramente sobredimensionado para estas GPU y su mejor encaje es CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU.
- Opciones de despliegue: PyTorch nativo (`chat_thirty.py` con BF16 en GPU o FP32 en CPU), llama.cpp/Ollama mediante los pesos GGUF de `respinosamena/Thirty-30M-Instruct-GGUF`, y motor propio en C++20 con AVX-512 o portable.
- Latencia y throughput: hasta 963,8 tok/s en CPU con GGUF segun el autor; no se publican cifras de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | EOS% | ToolCall-10 | Passkey-18 (8k) | PyExec-20 | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---:|---:|---|---|
| Thirty-30M-Instruct | 30,1M | 8.192+ | 93,8% | 80,0% | 94,4% (66,7%) | 25,0% | Apache 2.0 | HF + GGUF + C++ |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion | 75,0% | 0,0% | 83,3% (0,0%) | 60,0% | no disponible en la informacion | HF |
| Thirty-30M-Base | 30,1M | 8.192+ | 12,5% | 10,0% | 55,6% (0,0%) | 0,0% | Apache 2.0 | HF |

Frente a SmolLM2-135M-Instruct, Thirty-30M-Instruct gana en disciplina de parada, multi-turno, formato `<think>`, JSON, tool calling, Passkey a 8k y LongQA, y pierde en generacion de codigo Python y perplejidad de prosa. El salto respecto a su modelo base es notable en todas las capacidades instruccionales, lo que confirma el efecto del SFT quirurgico.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Generacion de codigo limitada (25% en PyExec-20), muy por debajo de modelos mas grandes.
- Perplejidad de prosa base peor que SmolLM2-135M (BPB 0,9640 frente a 0,8436), lo que sugiere menor fluidez en texto abierto.
- La validacion de esquema JSON cae al 50% pese al 100% sintactico: no garantiza conformidad semantica con el schema.
- La cuantizacion INT4 introduce una degradacion severa (KL 176,86 mnats, Top-1 Agree 78,33%); para produccion conviene INT8 o superior.
- Riesgo de alucinacion elevado por el tamano reducido del modelo; no apto para tareas de conocimiento factual sin verificacion externa.
- El contexto de 8.192+ tokens es nativo pero el rendimiento en Passkey a 8k baja al 66,7%, por lo que la recuperacion fiable decae en el extremo de la ventana.
- Ausencia de benchmarks estandar (MMLU, HumanEval, GSM8K): la evaluacion es una suite propia del autor, no comparable directamente con literatura.
- Licencia Apache 2.0 permite uso comercial, pero no se documentan garantias ni evaluaciones de sesgo; conviene auditar antes de desplegar en produccion.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/respinosamena/Thirty-30M-Instruct
- Pesos GGUF y motor C++20: https://huggingface.co/respinosamena/Thirty-30M-Instruct-GGUF
- Modelo base: https://huggingface.co/respinosamena/Thirty-30M-Base
- Dataset de preentrenamiento: https://huggingface.co/datasets/respinosamena/Thirty-20B-Curated
- Dataset de SFT: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Paper, blog o demo adicionales: no disponible
