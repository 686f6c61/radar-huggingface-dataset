# 0arch-io/kisoku-3.2b-base

## Resumen

Kisoku 3.2B es un modelo de lenguaje causal de tipo GPT, con 3.200 millones de parámetros, entrenado desde cero por 0ARCH (Joseph Rodriguez) sobre texto web filtrado del dataset DCLM-Baseline 1.0. El entrenamiento se realizó con el framework MaxText (JAX/Flax) sobre Google Cloud TPU v4-32, aprovechando el programa TRC (TPU Research Cloud), durante 100.000 pasos y aproximadamente 5 días, hasta una pérdida final de 2.733. La arquitectura incluye Grouped Query Attention (GQA) con 32 cabezas de consulta y 8 cabezas KV, lo que reduce el coste de la caché KV en inferencia.

Se distribuye bajo licencia Apache 2.0, es monolingüe en inglés y tiene una ventana de contexto de solo 2.048 tokens. Es un modelo base: no ha pasado por ajuste por instrucciones ni por alineamiento con preferencias humanas, por lo que su función realista es servir de punto de partida para fine-tuning e investigación, no de asistente listo para producción.

Un dato relevante para cualquiera que evalúe el modelo: la propia model card lo marca como **superseded**, es decir, sustituido por Kisoku 1.6B, la release actual del proyecto. Además, el repositorio ocupa 38 GB y los pesos están en formato de checkpoint MaxText/Orbax; la conversión a formato compatible con `transformers` (y por tanto con el ecosistema GGUF, vLLM u Ollama) figura como "coming soon", lo que limita de forma práctica su adopción hoy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo (GPT) con Grouped Query Attention (GQA) |
| Parametros totales | 3.200 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible (no se publican versiones GGUF, GPTQ, AWQ ni int8; solo checkpoints en precisión de entrenamiento) |
| Idiomas soportados | Ingles (entrenamiento centrado en ingles; capacidad multilingue limitada) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint MaxText/Orbax (JAX); conversion a formato Hugging Face `transformers` anunciada como "coming soon" |
| Dimension de embedding | 3.072 |
| Cabezas de atencion | 32 cabezas de consulta, 8 cabezas KV (GQA) |
| Dimension de cabeza | 96 |
| Dimension oculta del MLP | 8.192 |
| Capas del decodificador | 32 |
| Funcion de activacion | GeLU |
| Vocabulario | 50.304 tokens (tokenizer GPT-2) |
| Pasos de entrenamiento | 100.000 (checkpoint cada 5.000 pasos) |
| Perdida final de entrenamiento | 2.733 |
| Tamano del repositorio | 38,0 GB |
| Framework de entrenamiento | MaxText (JAX/Flax) |
| Hardware de entrenamiento | TPU v4-32 (4 hosts, 32 chips), region us-central2-b |

## Arquitectura y entrenamiento

El modelo sigue el esquema clasico de transformer decoder-only autoregresivo, con normalizacion y MLP de tipo GPT, pero incorpora GQA como optimizacion de inferencia: 32 cabezas de consulta comparten 8 cabezas de clave/valor, lo que reduce la memoria de la cache KV en un factor de 4 respecto a atencion multi-cabeza completa y abarata el despliegue con lotes grandes. Las dimensiones (3.072 de embedding, 8.192 de MLP, 32 capas, cabeza de 96) son coherentes con un modelo de ~3,2B parametros de escala pequena-media. El tokenizer es el de GPT-2, con 50.304 entradas.

El entrenamiento uso DCLM-Baseline 1.0 de DataComp, un corpus web filtrado por calidad, factualidad y coherencia, con preponderancia de contenido en ingles. La configuracion registrada es: batch global de 64 (16 por dispositivo en 4 hosts), secuencias de 2.048 tokens, AdamW con learning rate inicial de 2e-4 y 100.000 pasos, lo que arroja un presupuesto de computo de aproximadamente 13.100 millones de tokens vistos (64 x 2.048 x 100.000). Es una cifra baja para los estandares actuales —del orden de 4 tokens por parametro—, lo que anticipa un modelo por debajo de alternativas entrenadas con presupuestos mucho mayores. El rendimiento de entrenamiento medido fue de unos 115 TFLOP/s por dispositivo y unos 5.400 tokens por segundo y dispositivo. No se documenta RLHF, DPO ni ninguna fase de alineamiento posterior.

## Capacidades

- Generacion de texto autoregresiva en ingles: continuación de prompt, redaccion libre y generacion condicionada por contexto.
- Modelado de lenguaje puro: al ser un modelo base, destaca en tareas de scoring y estimacion de probabilidad (perplejidad, ranking de secuencias) más que en seguir instrucciones.
- Punto de partida para fine-tuning supervisado (SFT) y posteriores fases de alineamiento (DPO/RLHF) en ingles.
- Inferencia eficiente en memoria gracias a GQA (8 cabezas KV), favorable para despliegues con lotes concurrentes.
- Integracion nativa con MaxText/JAX y ejecucion optimizada para TPU.
- Capacidades **no** disponibles: no hay soporte de tool calling ni function calling, no hay modo de razonamiento o "thinking", no hay vision ni audio, no hay capacidad de agente multi-paso, y no se ha verificado un comportamiento multilingue fiable mas alla del ingles.
- No es un modelo instruct: no responde a formatos de chat ni a instrucciones directas de forma fiable sin ajuste previo.

## Casos de uso

- **Fine-tuning de dominio en ingles**: partir del checkpoint base y ajustar con datos propios (legal, sanitario, tecnico) para obtener un modelo especializado de 3,2B. La licencia Apache 2.0 permite uso comercial del modelo ajustado y el tamano es asumible en una unica GPU de 24 GB en bf16.
- **Investigacion sobre entrenamiento desde cero**: replicar o auditar la receta (DCLM-Baseline 1.0, 100.000 pasos, batch global 64, LR 2e-4) y comparar curvas de perdida. El proyecto publica codigo de entrenamiento en GitHub y checkpoints cada 5.000 pasos, lo que permite estudiar la evolucion del modelo a lo largo del entrenamiento.
- **Docencia y experimentacion en arquitecturas transformer**: el modelo es lo bastante pequeno para inspeccionar atencion, analizar el efecto de GQA frente a MHA y ejecutar practicas de interpretabilidad sin presupuesto de gran escala.
- **Generacion de datos sinteticos y aumento de corpus**: usar el modelo para producir texto en ingles a gran escala (parafrasis, continuaciones, negativos para clasificadores) donde no se requiera alta fidelidad factual y si volumen barato.
- **Evaluacion de sesgos y toxicidad en modelos base**: al no estar alineado, es un sujeto de estudio util para medir que sesgos emergen del corpus DCLM antes de cualquier fase de RLHF, comparando con modelos ya alineados.
- **Scoring y filtrado de calidad de texto**: calcular log-probabilidades por token para puntuar documentos, deduplicar o filtrar un corpus en funcion de su perplejidad bajo el modelo.
- **Prototipado de pipelines en TPU con MaxText**: validar flujos de entrenamiento e inferencia en JAX sobre TPU v4 con un modelo de 3,2B antes de escalar a configuraciones mayores, usando la receta de `decode.py` que documenta el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta la perdida final de entrenamiento (2,733) y metricas de eficiencia del entrenamiento (115 TFLOP/s por dispositivo, ~5.400 tokens/s por dispositivo en TPU v4-32). No hay datos de MMLU, HumanEval, GSM8K, HellaSwag ni de evaluaciones multilingues.

## Requisitos de hardware

Las cifras de esta seccion son estimaciones derivadas del numero de parametros y de la configuracion de atencion declarada, no datos publicados por el autor (que no documenta requisitos de inferencia).

- **Pesos en memoria (estimacion)**: ~12,8 GB en fp32, ~6,4 GB en bf16/fp16, ~3,2 GB en int8 y ~1,6 GB en int4. El repositorio de 38 GB sugiere varios checkpoints o estados de optimizador, no un unico artefacto de inferencia.
- **Cache KV (estimacion)**: con 32 capas, 8 cabezas KV y dimension de cabeza 96, la cache ocupa unos 98 KB por token en bf16, es decir, ~200 MB para una secuencia completa de 2.048 tokens. Es un coste bajo, favorable para servir varias peticiones concurrentes.
- **GPU consumer**: el modelo cabe holgadamente en una RTX 4090 (24 GB) en bf16 e incluso en tarjetas de 12-16 GB. En int4 cabria en GPUs de 8 GB, pero **no existe una cuantizacion publicada** para ello.
- **GPU de datacenter**: A100 (40/80 GB), H100 o L40S estan sobredimensionadas para un unico modelo de 3,2B; son utiles para servir muchas replicas o para fine-tuning con lotes grandes.
- **TPU**: es la plataforma para la que fue disenado y la unica ruta de ejecucion documentada, mediante `MaxText/decode.py` con los hiperparametros de la arquitectura (emb_dim 3072, 32 cabezas de consulta, 8 KV, mlp_dim 8192, 32 capas, head_dim 96, vocab 50304).
- **Opciones de despliegue**: hoy solo MaxText/JAX. vLLM, llama.cpp, Ollama, TGI y `transformers` requieren una conversion de pesos que el autor anuncia como pendiente, por lo que no estan operativas de forma directa.
- **Latencia y throughput de inferencia**: no disponible. El unico dato de throughput publicado corresponde al entrenamiento.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de la documentacion publica de cada proyecto, no de la informacion proporcionada sobre Kisoku.

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Estado |
|---|---|---|---|---|---|
| Kisoku 3.2B | 3,2B | 2.048 | DCLM-Baseline 1.0 (~13,1B tokens estimados) | Apache 2.0 | Superseded por Kisoku 1.6B; sin conversion a `transformers` |
| Pythia 2.8B (EleutherAI) | 2,8B | 2.048 | The Pile | Apache 2.0 | Amplia familia de checkpoints intermedios y ecosistema consolidado |
| Llama 3.2 3B (Meta) | 3,2B | 128.000 | No publico en detalle | Licencia comunitaria Llama 3.2 | Modelo instruct disponible, amplio soporte de herramientas |
| Qwen2.5 3B (Alibaba) | ~3,1B | 32.768 | No publico en detalle | Apache 2.0 (mayoria de variantes) | Base e instruct, multilingue, integrado en vLLM y Ollama |

Diferencias clave: Kisoku 3.2B compite en tamano con Llama 3.2 3B y Qwen2.5 3B, pero pierde de forma clara en ventana de contexto (2.048 frente a 32.768 y 128.000), en multilingue, en disponibilidad de version instruct y en soporte de herramientas de inferencia. Su ventaja relativa es la transparencia de la receta de entrenamiento (dataset, pasos, configuracion de batch y LR documentados) y una licencia Apache 2.0 sin restricciones adicionales.

## Limitaciones y advertencias

- **Modelo sustituido**: la model card indica explicitamente que esta version esta superseded por Kisoku 1.6B; para trabajo nuevo conviene evaluar esa release antes de invertir esfuerzo en esta.
- **Solo modelo base**: no ha recibido instruccion ni alineamiento. No es fiable para seguir instrucciones, mantener formato de chat ni rechazar peticiones daninas.
- **Riesgo de contenido nocivo y sesgos**: entrenado sobre texto web sin filtrado de seguridad posterior; puede reproducir sesgos, toxicidad y estereotipos del corpus. El autor recomienda evaluar sesgo y equidad antes de cualquier despliegue.
- **Alucinacion**: sin ajuste factual ni recuperacion aumentada, la probabilidad de afirmaciones incorrectas con apariencia de veracidad es alta. No apto para casos que exijan exactitud sin verificacion.
- **Idioma**: practicamente monolingue en ingles. El rendimiento en castellano no esta documentado y previsiblemente sera pobre.
- **Contexto corto**: 2.048 tokens limitan resumenes de documentos largos, conversaciones multi-turno extensas y tareas de recuperacion con mucho contexto.
- **Presupuesto de entrenamiento bajo**: ~13.100 millones de tokens para 3,2B parametros (unas 4 tokens por parametro) esta muy por debajo de los ratios habituales en modelos de referencia, lo que se traducira en menor calidad en tareas de conocimiento y razonamiento.
- **Barrera de adopcion tecnica**: sin pesos en safetensors ni GGUF, y con la conversion a `transformers` pendiente, la integracion en stacks estandar requiere trabajo adicional o el uso exclusivo de MaxText.
- **Licencia**: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no obstante, la licencia no exime de las obligaciones de evaluacion de seguridad sobre los datos y el uso final.
- **Madurez del proyecto**: 0 descargas y 2 likes en el momento de la consulta; no hay evidencia de validacion independiente del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0arch-io/kisoku-3.2b-base
- Release actual del proyecto (Kisoku 1.6B): https://huggingface.co/0arch-io/kisoku-1.6b
- Otra variante publicada (kisoku-3b): https://huggingface.co/0arch-io/kisoku-3b
- Repositorio del modelo en GitHub: https://github.com/0arch-io/Kisoku-3.2b
- README del proyecto Kisoku en GitHub: https://github.com/0arch-io/kisoku/blob/main/README.md
- Pagina del proyecto (log de entrenamiento, graficas de benchmark e instrucciones): https://0arch.io/kisoku
- 0ARCH Core (linea de producto): https://0arch.io/core
- Dataset DCLM-Baseline 1.0: https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0-parquet
- Framework MaxText (Google): https://github.com/google/maxtext
- Programa TPU Research Cloud (TRC): https://sites.research.google/trc/
- Google Cloud TPU: https://cloud.google.com/tpu
