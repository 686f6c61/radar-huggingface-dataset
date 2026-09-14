# alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_14-19-23_709595-pt

## Resumen

`alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_14-19-23_709595-pt` es un checkpoint de investigación entrenado con [nanochat](https://github.com/karpathy/nanochat), el framework minimalista de Andrej Karpathy para entrenar modelos tipo GPT desde cero. Lo publica el usuario `alexkstern` como artefacto de un barrido de experimentos ("ablation study") orientado a comparar configuraciones de entrenamiento con un presupuesto de cómputo fijo: el nombre del repositorio indica 10 % de la mezcla de datos de posentrenamiento (`nca_10pct`), un objetivo de 1e18 FLOPs (`computematched`) y el uso de AdamW con una etapa de posentrenamiento (`adamwppt`).

Arquitectónicamente es un transformer decoder-only denso de 22 capas, 11 cabezas de atención, dimensión de modelo 1408 y ventana de contexto de 2048 tokens. El entrenamiento se divide en dos fases con vocabularios distintos: una fase de preentrenamiento sobre `fineweb-nanochatbpe-100M` con vocabulario de 65536 tokens y una fase posterior sobre `nca-paper-share20-2048` con vocabulario de 10004 tokens, reinicializando los embeddings en la transición. El checkpoint publicado corresponde al paso 749 y consumió 8,997e17 FLOPs.

Su relevancia es metodológica, no de producto: se trata de un punto de datos reproducible dentro de un estudio que cruza tamaño de modelo, mezcla de datos, semilla y presupuesto de cómputo, con registro en Weights & Biases. No es un modelo alineado ni instruido, no tiene benchmarks publicados y acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que debe tratarse como material de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (implementacion `nanochat` / `nanochat_gpt`), `n_layer=22`, `n_head=11`, `n_kv_head=11`, `n_embd=1408` |
| Parametros totales | no disponible (el autor no publica el recuento; la config implica un orden de magnitud de ~600-700 M, estimacion no confirmada) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens (`sequence_len=2048` en ambas fases) |
| Tipos de cuantizacion | no disponible (no se publican pesos cuantizados; solo el checkpoint en precision de entrenamiento) |
| Idiomas soportados | no disponible (no se declara ningun idioma) |
| Licencia | apache-2.0 |
| Formato de pesos | `.pt` (state_dict de PyTorch para la libreria `nanochat`); no hay safetensors, GGUF ni ONNX |
| Vocabulario | 65536 tokens en preentrenamiento, 10004 tokens en posentrenamiento |
| Paso del checkpoint | 749 |
| FLOPs consumidos | 8,996596526675395e17 (objetivo: 1e18) |
| FLOPs por token | 4.582014976e9 |
| Tamano del repositorio | 6,1 GB |
| Datasets | `fineweb-nanochatbpe-100M` (preentrenamiento), `nca-paper-share20-2048` (posentrenamiento), `c4-nanochatbpe-10B` (evaluacion auxiliar) |
| Fecha de publicacion | 2026-09-14 |

## Arquitectura y entrenamiento

El modelo sigue el diseño de `nanochat`: un transformer decoder-only con prenormalizacion, atencion causal multi-cabeza sin GQA (`n_head == n_kv_head == 11`) y un MLP de expansion 4x, con un total de 22 capas y una dimension de embedding de 1408. El contexto es de 2048 tokens en las dos fases. El entrenamiento se organiza en dos etapas diferenciadas: la primera (identificada en los tags como `pt_fineweb-nanochatbpe-100M`) emplea un vocabulario de 65536 tokens; la segunda, denominada `ppt` (post-pretraining) en la config, cambia a un vocabulario de 10004 tokens sobre el dataset `nca-paper-share20-2048`. En la transicion se reinicializan los embeddings (`reinit_embed_at_transition: true`) y se reinicia el estado del optimizador (`reset_optimizer_at_transition: true`), lo que constituye la innovacion metodologica principal del experimento: medir el efecto de un cambio de tokenizador y de mezcla de datos a mitad del entrenamiento con presupuesto de FLOPs fijo.

El regimen de optimizacion usa AdamW con aprendizaje diferenciado por grupo de parametros (`matrix_lr=0.02`, `embedding_lr=0.3`, `unembedding_lr=0.004`, `weight_decay=0.0`) y un scheduler trapezoidal sin warmup y con un 40 % de decaimiento final (`lr_warmdown_ratio=0.4`, `lr_final_frac=0.0`). En la fase de posentrenamiento el learning rate cae a 3e-6, el weight decay se mantiene en 0 y `alpha_ppt=0.1` fija la proporcion de datos de esa mezcla en el 10 %. El lote efectivo declarado es de 32 secuencias de 2048 tokens con 1 paso de acumulacion de gradiente (`grad_accum_steps=1`), recorte de gradiente a 1.0 y sin EMA (`ema_beta=0.0`). La model card no documenta RLHF, DPO ni ningun tipo de alineacion por preferencias; tampoco se indica el numero exacto de tokens de cada fase, aunque la relacion entre `flops_used` y `flops_per_token` implica que el modelo proceso del orden de 196 millones de tokens de texto (calculo aritmetico a partir de los dos valores publicados). El entrenamiento se ejecuto en hardware con un `peak_tflops` declarado de 2250, sin que la model card especifique la GPU concreta. No se documentan innovaciones de inferencia como decodificacion especulativa, atencion lineal o SSM.

## Capacidades

- Generacion de texto autoregresiva: es un modelo de lenguaje base, sin ajuste por instrucciones documentado, por lo que su comportamiento esperado es el de continuacion de texto.
- Razonamiento, codigo y matematicas: no hay ninguna evaluacion publicada que acredite estas capacidades; no se puede afirmar que las tenga.
- Tool calling / function calling: no disponible; no se documenta ningun formato de llamada a herramientas ni plantilla de chat.
- Agentes y razonamiento multi-paso: no disponible; no se documenta soporte de agentes.
- Capacidades multilingues: no disponible; no se declaran idiomas. El corpus de preentrenamiento (FineWeb) es mayoritariamente en ingles, lo que sugiere un sesgo hacia ese idioma, pero la model card no lo confirma.
- Capacidades especiales (thinking mode, vision, audio): no disponibles; no se documenta ninguna modalidad adicional.
- Contexto: ventana de 2048 tokens, sin extension declarada.
- Uso previsto: servir como punto de comparacion reproducible en estudios de asignacion de computo y mezcla de datos.

## Casos de uso

- Replicacion de experimentos de asignacion de computo: el checkpoint permite recomputar las metricas del paso 749 con el codigo de `nanochat` y contrastarlas con el registro de Weights & Biases del grupo `1e18_ppt0.1`, verificando la curva de perdida y el `min_objective` reportado.
- Baseline en estudios de mezcla de datos: sirve como referencia de "10 % de datos de posentrenamiento" frente a otras proporciones del mismo barrido, aislando el efecto de `alpha_ppt` a igualdad de FLOPs.
- Investigacion sobre cambio de tokenizador en mitad del entrenamiento: al reinicializar embeddings al pasar de 65536 a 10004 tokens, es un caso de estudio util para medir el coste de rehacer la capa de embeddings y su efecto en la perdida.
- Punto de partida para preentrenamiento continuado: con 2048 tokens de contexto y licencia Apache-2.0, puede usarse como inicializacion para ajuste ulterior en un dominio concreto (por ejemplo, texto tecnico o corpus en castellano), asumiendo que su calidad base no esta validada.
- Prototipado de infraestructura de inferencia: su tamano reducido permite validar pipelines propios de carga, serializacion y servido para checkpoints `nanochat` antes de escalar a configuraciones mayores.
- Docencia y formacion: al ser un modelo pequeno entrenado con un framework publico y trazable, es adecuado para explicar el ciclo completo de preentrenamiento, posentrenamiento y evaluacion en un curso de LLM.
- Estudio de contaminacion de datos y evaluacion auxiliar: la config incluye el conjunto auxiliar `c4-nanochatbpe-10B`, lo que facilita analizar como se comporta el modelo sobre un corpus distinto al de entrenamiento.
- Analisis de sesgos y de calidad de corpus: al estar entrenado sobre un subconjunto de FineWeb, permite caracterizar empiricamente los sesgos heredados de ese corpus a esta escala.

En todos los casos, el uso en produccion orientado a usuario final no esta respaldado por ninguna evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye las metricas internas de entrenamiento, que no son comparables con tareas estandar:

| Metrica | Valor |
|---|---|
| `step` | 749 |
| `smooth_train_loss` | 3,500669479370117 |
| `min_objective` | 1,0704001986599774 |
| `flops_used` | 8,996596526675395e17 |
| `flops_per_token` | 4,582014976e9 |
| `total_training_time` | 305,5663161277771 (la model card no especifica la unidad) |

No hay datos de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni de ninguna otra tarea, y por tanto no es posible comparar el rendimiento con modelos de tamano similar.

## Requisitos de hardware

- VRAM estimada para inferencia (sobre un modelo del orden de 600-700 M de parametros): aproximadamente 1,2-1,5 GB en bf16/fp16, en torno a 2,5-3 GB en fp32 y menos de 1 GB en cuantizaciones de 8 o 4 bits si se generasen.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente para inferencia en bf16 con lotes pequenos; no se requiere A100 ni H100 para servir el modelo.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 o superiores; con cuantizacion a 4 bits cabria en GPUs de 4-6 GB, pero no se publican pesos cuantizados.
- Opciones de despliegue: no hay soporte directo en vLLM, TGI, Ollama o llama.cpp, porque el repositorio contiene un `state_dict` de PyTorch asociado a la implementacion de `nanochat` y no un checkpoint en formato Hugging Face Transformers ni GGUF. El despliegue exige cargar el modelo con el codigo de `nanochat` o escribir una conversion manual a Transformers.
- Requisitos de entrenamiento: la config declara un `peak_tflops` de 2250 y un lote por dispositivo de 32 secuencias de 2048 tokens; no se especifica cuantas GPU se usaron.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

Los datos de rendimiento del modelo no estan publicados, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de los modelos alternativos son los publicos de sus respectivas model cards.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| Este checkpoint (`nca_10pct_100M_computematched_adamwppt_1e18`) | no disponible (estimacion ~600-700 M) | 2048 | Apache-2.0 | Repo HF de 6,1 GB, formato `nanochat` `.pt` | No |
| Qwen2.5-0.5B | 0,49 B | 32 768 | Apache-2.0 | HF, Transformers, GGUF | Si |
| SmolLM2-360M | 0,36 B | 8192 | Apache-2.0 | HF, Transformers, GGUF | Si |
| TinyLlama-1.1B | 1,1 B | 2048 | Apache-2.0 | HF, Transformers, GGUF | Si |
| Modelo de referencia de nanochat (d20) | no disponible | no disponible | MIT (repositorio) | Repo de `nanochat` | No comparable |

La diferencia practica mas relevante no es de tamano sino de ecosistema: las alternativas se cargan directamente con Transformers, vLLM, llama.cpp u Ollama y publican resultados de evaluacion, mientras que este checkpoint requiere el `nanochat` original y no ofrece ninguna medicion de calidad.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion humana, ni comparacion con modelos de referencia, por lo que se desconoce su calidad real.
- No hay alineacion documentada: no se menciona RLHF, DPO ni SFT con instrucciones; no debe usarse como asistente conversacional sin un ajuste previo.
- Contexto muy corto: 2048 tokens limite, insuficiente para tareas de documento largo, recuperacion aumentada extensa o conversaciones prolongadas.
- Idioma sin especificar: no se declaran idiomas soportados; el corpus FineWeb es predominantemente en ingles, por lo que el rendimiento en castellano es, como minimo, incierto.
- Cambio de vocabulario en la transicion: el paso de 65536 a 10004 tokens con reinicializacion de embeddings puede degradar representaciones aprendidas y afectar a la coherencia del modelo publicado.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje de esta escala sin ajuste de veracidad; no hay datos que lo cuantifiquen.
- Sesgos: heredados de FineWeb y del corpus `nca-paper-share20-2048`, cuyas caracteristicas, licencia y composicion no se detallan en la informacion disponible.
- Formato y seguridad de carga: el checkpoint es un `.pt` (pickle) de PyTorch, lo que implica riesgos de deserializacion y ausencia de pesos en safetensors.
- Licencia: Apache-2.0 permite uso comercial, pero no se especifica la licencia de los datasets de entrenamiento (FineWeb y `nca-paper-share20`), lo que debe verificarse antes de cualquier uso comercial.
- Madurez: 0 descargas y 0 "likes", publicacion unitaria sin documentacion adicional; es un artefacto de investigacion, no un modelo mantenido.
- Otros checkpoints del mismo experimento pueden existir con otras semillas, pero solo se ha publicado este.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexkstern/nca_10pct_100M_computematched_adamwppt_1e18_s2_2026-09-14_14-19-23_709595-pt
- Repositorio de nanochat: https://github.com/karpathy/nanochat
- Registro de Weights & Biases del entrenamiento: https://wandb.ai/alexksternteam/cm100M_best_cells_hfpush_v0/runs/74rm15d2
- Archivos incluidos en el repositorio: `model_000749.pt`, `meta_000749.json`, `config_000749.json`, `rng_000749.pt`
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios) en la busqueda web: los resultados devueltos no guardan relacion con el modelo.
