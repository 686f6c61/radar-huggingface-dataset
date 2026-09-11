# pratham-commits/vaani-gujarati-slm

## Resumen

Vaani es un modelo de lenguaje de 109,5 millones de parametros entrenado desde cero para gujarati (codigo de idioma `gu`) y especializado en respuesta a preguntas medicas con contexto (open-book QA) y seguimiento de instrucciones. Lo desarrolla el autor `pratham-commits` en el marco de la convocatoria IAIRO / PRAMANA SLM++ y se distribuye en Hugging Face bajo licencia Apache 2.0. Su interes practico es ser un SLM (small language model) de menos de 1B de parametros que compite, en su tarea objetivo, con modelos de 2B y 7B.

Arquitectonicamente es un transformer causal denso de tipo Llama (RMSNorm pre-norm, SwiGLU, RoPE, atencion multi-cabeza con `n_head = n_kv_head = 12`) con 12 capas, `d_model` 768, embeddings de entrada/salida atados, tokenizer BPE propio de 32.000 tokens y una ventana de contexto de 2.048 tokens. Se preentreno con ~13.620 millones de tokens de un corpus en gujarati sobre una unica GPU NVIDIA L4 de 24 GB (~106 horas) y despues se ajusto con SFT completo (no LoRA) en dos fases: instrucciones generales (~150.000 ejemplos) y dominio medico (~114.000 ejemplos).

Su relevancia para un despliegue real es doble: por un lado, el coste de inferencia es minimo (los pesos en bf16 ocupan del orden de 0,22 GB, por lo que cabe en cualquier GPU de consumo); por otro, la model card reporta que con contexto proporcionado alcanza un 44,1% de acierto en el conjunto de validacion MedMCQA-gu, por delante de gemma-2-2b-it (37,8%) y Qwen2.5-7B-Instruct (44,0%), aunque queda lejos de estos en recuerdo factual sin contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (estilo Llama): RMSNorm pre-norm, SwiGLU, RoPE |
| Parametros totales | 109,5 M (109.500.000) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (la model card solo declara entrenamiento e inferencia en bf16; no se publican pesos cuantizados) |
| Idiomas soportados | Gujarati (`gu`) |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (libreria declarada: `pytorch`; no se especifica safetensors ni GGUF; tamano del repositorio: 2,2 GB) |
| Capas | 12 |
| Dimension del modelo (`d_model`) | 768 |
| Atencion | Multi-Head Attention; `n_head = n_kv_head = 12`, `head_dim = 64` |
| Normalizacion | RMSNorm (pre-norm) |
| FFN | SwiGLU, multiplicador oculto 8/3 (~2.048) |
| Codificacion posicional | RoPE (theta = 10.000) |
| Embeddings | Atados entrada/salida |
| Tokenizer | BPE propio (byte/caracter), vocabulario 32.000, entrenado para gujarati |
| Precision | bf16 |
| Pipeline | `text-generation` |
| Plantilla de chat | `<eos>વપરાશકર્તા:\n{pregunta}\nસહાયક:\n{respuesta}<eos>` |
| Fecha de creacion en Hugging Face | 2026-09-11 |

## Arquitectura y entrenamiento

El modelo sigue el diseno de transformer decoder-only de la familia Llama: 12 bloques con RMSNorm pre-norm, atencion multi-cabeza sin GQA (`n_head = n_kv_head = 12`, `head_dim` 64), FFN SwiGLU con multiplicador 8/3 y RoPE con theta 10.000. Los embeddings de entrada y salida estan atados y el tokenizer es un BPE propio de 32.000 tokens entrenado especificamente para gujarati, no heredado de un modelo multilingue. El preentrenamiento se hizo desde cero con objetivo causal (next-token) sobre un corpus en gujarati: ~13.620 millones de tokens vistos en 12.990 pasos de 1,05 M de tokens cada uno (batch efectivo de 512 secuencias = micro-batch 16 x acumulacion de gradiente 32, con secuencias de 2.048 tokens). El optimizador fue AdamW (betas 0,9/0,95, eps 1e-8, `fused`, weight decay desacoplado) con warmup y pico de 4e-4, decaimiento coseno hasta ~4e-5. Todo el entrenamiento se ejecuto en una sola NVIDIA L4 de 24 GB en ~110 horas (106 de preentrenamiento + 3 de SFT de instrucciones + 1 de SFT medico), ~116 horas contando ablaciones.

El post-entrenamiento se hizo con fine-tuning completo (no LoRA) en dos etapas sobre el checkpoint preentrenado: primero un SFT de instrucciones generales sobre `sft_v4.jsonl` (~150.000 ejemplos) que incluye habilidades de formato (JSON, extraccion, transformacion, listas con recuento exacto de elementos), 3 epocas con batch efectivo 32; despues un SFT medico sobre `medical_sft_v3.jsonl` (~114.000 ejemplos) que combina MedMCQA-gu en modo closed-book, datos con contexto sin editar (raw-grounded), datos con contexto redactado (redacted-grounded) y una mezcla del 30% de datos generales, 2 epocas con batch efectivo 32. No se documenta uso de RLHF ni DPO. La evaluacion de dominio emplea un split de validacion de MedMCQA-gu disjunto del SFT como control de contaminacion.

## Capacidades

- Generacion de texto en gujarati con plantilla de chat propia (rol de usuario y rol de asistente).
- Seguimiento de instrucciones en gujarati: la model card reporta 69,7% en checkers basados en reglas (9 categorias), con 71,2% en modo greedy para el checkpoint de formato.
- Habilidades de formato estructurado: generacion de JSON, extraccion de campos, transformacion de texto y listas con recuento exacto de elementos (listas de 3 y 5 elementos, listas numeradas).
- Respuesta a preguntas medicas de opcion multiple (MedMCQA-gu) en modo closed-book: 38,6% de acierto en el conjunto de 145 items.
- Comprension lectora con contexto (open-book / grounded QA): 44,1% de acierto con contexto en la validacion de MedMCQA-gu (n = 1.858), con un incremento de +15,3 puntos respecto a la misma tarea sin contexto.
- Unico idioma soportado: gujarati. No hay capacidades multilingues declaradas.
- No se declaran capacidades de vision, audio, tool calling, function calling ni razonamiento agéntico multi-paso.

## Casos de uso

- Asistente medico de lectura guiada en gujarati: se le pasa un fragmento de guia clinica o prospecto y una pregunta; el modelo responde apoyandose en el texto proporcionado, que es exactamente el escenario en el que obtiene su mejor resultado (44,1% con contexto frente a 28,8% sin contexto).
- Educacion medica y preparacion de examenes tipo MCQ: generacion de respuestas razonadas a preguntas de opcion multiple en gujarati para estudiantes, usando el contexto del temario como material de apoyo.
- Extraccion estructurada de informacion clinica: dado un informe o nota en gujarati, producir JSON con campos concretos (edad, diagnostico, tratamiento) aprovechando el SFT especifico en JSON y extraccion.
- Normalizacion y transformacion de textos sanitarios: conversion de notas libres a formatos tabulares o listas numeradas con un numero exacto de elementos, una habilidad en la que el modelo supera a alternativas de 2B y 7B segun la model card.
- Despliegue en entornos con hardware limitado: al ocupar del orden de 0,22 GB en bf16, puede ejecutarse en portatiles, mini-PC o instancias CPU/GPU de bajo coste en clinicas rurales de Gujarat sin conectividad estable.
- Filtrado y triaje previo en un pipeline mayor: uso como primer nivel para clasificar o resumir consultas en gujarati antes de derivar los casos complejos a un modelo mayor, reduciendo coste por token.
- Investigacion sobre SLM en lenguas de bajos recursos: el modelo sirve como punto de partida reproducible (tokenizer, corpus, recetas de SFT y curvas de evaluacion documentadas) para experimentos de eficiencia en idiomas infrarepresentados.

## Benchmarks y rendimiento

Todos los resultados son autodeclarados por el autor y provienen de su arnes interno, con el mismo protocolo para todos los modelos comparados. MCQ = conjunto gujarati de 145 items (`acc_norm`, verosimilitud); instrucciones = checkers basados en reglas; open-book = validacion de MedMCQA-gu con y sin contexto (Vaani n = 1.858; modelos externos n = 500).

Progresion de desarrollo de los checkpoints de Vaani (MCQ sobre `n = 80`):

| Etapa | MCQ (n=80) | Instrucciones | Open-book (cerrado -> con contexto) |
|---|---|---|---|
| Instruction SFT v1 | 36,3% | 35,9% | - |
| Instruction SFT v2 | 36,3% | 46,0% | - |
| Instruction SFT v3 (aumento dirigido) | 31,3% | 68,7% | - |
| Format SFT v4 (JSON/extraccion/listas) | 28,8% | 66,7% (71,2% greedy) | - |
| Medical SFT v3 (raw-grounded) | 33,8% | 68,2% | 26,6% -> 30,8% |
| Medical SFT v4 | 41,3% | 66,7% | 28,6% -> 38,2% |
| Medical SFT v5 (final) | 41,3% | 69,7% | 28,8% -> 44,1% |
| Medical SFT v6 (redacted) | - | - | 28,7% -> 42,8% |

Comparacion con modelos externos:

| Modelo | Parametros | MCQ | Instrucciones | Open-book con contexto | Ganancia por grounding |
|---|---|---|---|---|---|
| Vaani (final) | 110 M | 38,6% | 70% | 44,1% | +15,3 |
| gemma-2-2b-it | 2 B | 37,2% | 67% | 37,8% | +9,6 |
| sarvam-1 (base) | 2 B | 36,6% | 24% | 40,2% | +11,4 |
| Navarasa-2.0 | 2 B | 42,8% | 54% | 35,0% | +10,0 |
| Qwen2.5-7B-Instruct | 7 B | 51,0% | 53% | 44,0% | +18,0 |

Salud de entrenamiento (nivel 1, autodeclarado): PASS en todas las puertas, con reduccion de perdida del 68,2% (10,53 -> 3,35), convergencia estable, sin NaN/Inf y una brecha final validacion-entrenamiento del 2,0%. No se han publicado resultados de benchmarks estandarizados e independientes (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- Peso del modelo en bf16: ~0,22 GB (109,5 M de parametros x 2 bytes). En fp32, ~0,44 GB; en int8, ~0,11 GB; en int4, ~0,06 GB. El repositorio de Hugging Face ocupa 2,2 GB, por lo que probablemente incluye mas de un checkpoint o estados auxiliares.
- Cache KV a 2.048 tokens de contexto en bf16: ~72 MB (12 capas x 2 x 768 x 2.048 x 2 bytes).
- VRAM total estimada para inferencia en bf16 con contexto completo: por debajo de 1 GB incluyendo el modelo, la cache y el overhead del framework (contexto CUDA de PyTorch). No es una cifra publicada por el autor.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090), asi como en CPU.
- GPU de entrenamiento utilizada: 1x NVIDIA L4 de 24 GB durante ~110 horas. GPU de referencia para reproducir el pipeline: L4 o equivalente con 24 GB (A10G, RTX 3090/4090).
- Despliegue documentado: scripts propios del autor, `eval.py` (arnes de evaluacion) y `chat.py` (chat interactivo), sobre `torch 2.9.1+cu129`, `transformers 4.57.6` y `tokenizers 0.22.2` en Python 3.10. Se recomienda decodificacion greedy (temperatura 0) para tareas estructuradas u objetivas y muestreo para texto abierto.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni la disponibilidad de pesos en GGUF. Al ser una arquitectura estandar de tipo Llama, la conversion es plausible, pero no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponibles. Como referencia orientativa (no verificada y no publicada por el autor), un modelo denso de 110 M en bf16 sobre una L4 se situa tipicamente en el rango de cientos de tokens por segundo con batch 1; no debe usarse esta cifra para dimensionar produccion sin medirla.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas declarados | MCQ | Instrucciones | Open-book con contexto |
|---|---|---|---|---|---|---|---|
| Vaani (final) | 110 M | 2.048 | Apache 2.0 | Gujarati | 38,6% | 70% | 44,1% |
| gemma-2-2b-it | 2 B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | 37,2% | 67% | 37,8% |
| sarvam-1 (base) | 2 B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | 36,6% | 24% | 40,2% |
| Navarasa-2.0 | 2 B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | 42,8% | 54% | 35,0% |
| Qwen2.5-7B-Instruct | 7 B | No disponible en la informacion | No disponible en la informacion | No disponible en la informacion | 51,0% | 53% | 44,0% |

Lectura de la tabla: Vaani lidera en seguimiento de instrucciones (70%) y empata en la practica con Qwen2.5-7B en comprension con contexto (44,1% frente a 44,0%) con 64 veces menos parametros. En cambio, pierde en recuerdo factual sin contexto frente a Navarasa-2.0 (42,8%) y Qwen2.5-7B (51,0%), lo que el propio autor atribuye a que el modelo esta disenado para usar contexto proporcionado y no para recuperar hechos de memoria. La ventaja de Vaani sobre modelos mayores es de eficiencia y de idioma especifico, no de conocimiento general.

## Limitaciones y advertencias

- Recuerdo factual medico limitado en modo closed-book: la propia model card identifica este punto como modo de fallo conocido. Sin contexto, el modelo no debe usarse como fuente de hechos medicos.
- Riesgo de alucinacion en dominio sanitario: al ser un modelo de 110 M entrenado sobre un corpus de tamano moderado, la generacion de datos clinicos plausibles pero falsos es un riesgo alto si se usa sin contexto verificado ni supervision humana.
- Ventana de contexto corta: 2.048 tokens, muy por debajo de los 8K-128K habituales en modelos actuales, lo que limita el open-book QA a fragmentos breves y obliga a trocear documentos largos.
- Un solo idioma: gujarati. No hay soporte declarado de hindi, ingles ni otras lenguas, por lo que no sirve como asistente multilingue.
- Datos de evaluacion autodeclarados: todas las metricas provienen del arnes interno del autor, con conjuntos pequenos (n = 80 y n = 145 para MCQ) y sin evaluacion independiente. Los resultados deben tratarse como indicativos.
- El checkpoint v6 (con contexto mayoritariamente redactado) regreso frente a v5 en open-book (42,8% frente a 44,1%), lo que sugiere sensibilidad a la composicion de los datos de SFT en la fase medica.
- Rendimiento no verificado en produccion: no hay datos publicos de latencia, throughput, estabilidad en concurrencia ni comportamiento con prompts adversarios.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero la licencia no cubre el cumplimiento normativo sanitario ni la proteccion de datos de pacientes, responsabilidad del desplegador.
- Modelo practicamente sin traccion en la comunidad: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion externa, de issues reportados y de ecosistema de herramientas probadas.

## Enlaces

- Pagina del modelo en Hugging Face (tambien enlace de pesos): https://huggingface.co/pratham-commits/vaani-gujarati-slm
- Scripts de inferencia y evaluacion mencionados en la model card: `eval.py` (arnes de investigacion) y `chat.py` (chat interactivo), incluidos en el repositorio del modelo; no se proporcionan URL directas.
- Dependencias declaradas por el autor: `torch 2.9.1+cu129`, `transformers 4.57.6`, `tokenizers 0.22.2` (Python 3.10).
- Las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo (los resultados obtenidos correspondian a foros de videojuegos y a preguntas genericas no relacionadas). Por tanto, no hay papers, blogs, repositorios adicionales ni demos disponibles en la informacion proporcionada.
