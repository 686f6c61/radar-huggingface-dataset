# AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s0

## Resumen

Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s0 es un checkpoint experimental de desaprendizaje (unlearning) derivado de Llama-3.1-8B-Instruct, publicado por el usuario AnniBori en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino del checkpoint `AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft` (a su vez un fine-tune de Llama-3.1-8B-Instruct sobre el conjunto DUET de hechos cinematograficos) al que se le ha aplicado el algoritmo AdaPop para olvidar un subconjunto concreto de hechos sobre peliculas populares.

El objetivo del modelo es demostrar que es posible eliminar selectivamente conocimiento factual (411 hechos de director-pelicula del conjunto `forget_popular_film`) manteniendo al mismo tiempo el conocimiento retenido (546 hechos del conjunto `retain_film`). Segun la model card, el epoch seleccionado (7) alcanza un recall de olvido de 0,014 y un recall de retencion de 0,954, lo que lo convierte en un artefacto de investigacion sobre privacidad, cumplimiento normativo y edicion de conocimiento en LLM.

Arquitectura transformer decoder-only de 8.030.261.248 parametros (aproximadamente 8B), contexto de 128.000 tokens heredado de Llama 3.1, licencia Llama 3.1 y pesos en safetensors. Es relevante en el contexto de la investigacion sobre machine unlearning, ya que publica pesos concretos junto con una receta reproducible y metricas de evaluacion por epoch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 (aproximadamente 8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.1, no verificado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, probablemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Modelo base | AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | unlearning, DUET, film, AdaPop, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atencion multi-cabeza agrupada (GQA), RoPE y normalizacion RMSNorm, entrenado originalmente por Meta con RLHF y DPO. Sobre ese modelo, el autor aplico primero un fine-tune sobre el conjunto DUET (hechos de director-pelicula) para obtener `Llama-3.1-8B-Instruct-DUET-film-ft` en su epoch 6, y despues aplico el algoritmo AdaPop para eliminar los hechos del conjunto de olvido `forget_popular_film` (411 filas con `split_role = train`).

La receta de desaprendizaje se ejecuta con `open-unlearning` (`src/train.py --config-name=unlearn.yaml experiment=revival_mechanism/unlearn/duet_8B_AdaPop`). AdaPop combina una perdida de olvido de tipo WGA con un coeficiente beta por hecho calculado como `clip(58.7 · p^-0.796, 0.05, 2)` a partir de la popularidad `p` del hecho (input `pop_subject`: sitelinks de Wikidata, identificadores y declaraciones del item de la pelicula), mas un termino de NLL de retencion cuyo peso alpha crece por ascenso dual (`alpha0 = 0.5`, `eps = 0.1`, `dual_lr = 0.1`, `lambda_max = 5`, EMA de retencion 0.9, `gamma = 1`). Hiperparametros: lr 1e-5, 8 epochs, batch 4 con acumulacion de gradiente 4, warmup de 1 epoch, weight decay 0.01, `paged_adamw_8bit`, bf16, semilla 0 y checkpoint tras cada epoch (26 pasos por epoch).

El epoch seleccionado es el 7, elegido por un criterio de "qualified": recall de olvido en generacion libre (ROUGE-L, greedy, 64 tokens nuevos) menor o igual a 0,15 y recall de retencion mayor o igual al recall base menos 0,30 (base 0,842, suelo 0,542); entre los epochs que cumplen, se elige el de mayor diferencia retencion - olvido. La plantilla de prompt es la chat template de Llama 3.1 con un system prompt fijo: `You are terse and fact-only QA assistant. Reply to the question clearly with few-words correct answer.`

## Capacidades

- Generacion de texto conversacional y respuesta a preguntas factuales de forma concisa (el system prompt fuerza respuestas de pocas palabras).
- Razonamiento y conocimiento general heredados de Llama 3.1 8B Instruct (no evaluados en la model card).
- Desaprendizaje selectivo verificado: recall de olvido de 0,014 sobre los 411 hechos del conjunto `forget_popular_film` en generacion libre.
- Retencion de conocimiento no olvidado: recall de 0,954 sobre los 546 hechos del conjunto `retain_film`.
- Soporte de tool calling y function calling: heredado teoricamente de Llama 3.1 Instruct, pero no verificado ni documentado en este checkpoint.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio ni modo thinking.

## Casos de uso

- Investigacion en machine unlearning: sirve como artefacto reproducible para comparar algoritmos de olvido (AdaPop frente a otras recetas) sobre un conjunto factual controlado con metricas de olvido y retencion por epoch.
- Cumplimiento de derechos de eliminacion (GDPR, derecho al olvido): el modelo demuestra una via para eliminar hechos concretos de un LLM sin reentrenar desde cero, manteniendo el 95,4 % del conocimiento retenido en el conjunto de prueba.
- Evaluacion de robustez frente a ataques de recuperacion: la model card referencia scripts de evaluacion con conjuntos de parafrasis y ataques (`film_gate.py`, `film_forget_metrics.py`) y una sonda de reaprendizaje con LoRA de rango 4, utiles para medir si el conocimiento olvidado puede recuperarse.
- Auditoria de privacidad en pipelines de datos: permite estudiar como se distribuye el conocimiento factual en los pesos y que hechos son mas resistentes al olvido segun su popularidad (el coeficiente beta depende de `pop_subject`).
- Base para experimentos de edicion de conocimiento: al estar construido sobre un fine-tune DUET, sirve como punto de partida para estudiar la interaccion entre fine-tuning y desaprendizaje en dominios acotados.
- Docencia y divulgacion tecnica: la publicacion de pesos, receta e hiperparametros permite reproducir el experimento en un entorno controlado con `open-unlearning`.

## Benchmarks y rendimiento

La model card solo publica metricas internas de olvido y retencion (recall ROUGE-L en generacion libre, greedy, 64 tokens nuevos) por epoch:

| Epoch | Recall olvido | Recall retencion |
|---|---|---|
| 1 | 0,953 | 0,893 |
| 2 | 0,613 | 0,876 |
| 3 | 0,028 | 0,769 |
| 4 | 0,053 | 0,887 |
| 5 | 0,023 | 0,905 |
| 6 | 0,014 | 0,944 |
| 7 (seleccionado) | 0,014 | 0,954 |
| 8 | 0,015 | 0,953 |

Recall base de retencion del modelo pre-desaprendizaje: 0,842. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB de pesos mas overhead de activaciones y cache KV; en la practica se recomienda al menos 18-24 GB.
- Cuantizacion a 8 bits: aproximadamente 8-9 GB de VRAM; a 4 bits: aproximadamente 5-6 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; RTX 3090/4080 o superiores para cuantizacion 8/4 bits.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) en bf16 y en GPUs de 12-16 GB con cuantizacion.
- Opciones de despliegue: transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s0 | 8,03B | 128k (heredado) | Desaprendizaje de hechos de peliculas populares | llama3.1 | Hugging Face, 0 descargas |
| AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft | 8,03B | 128k (heredado) | Fine-tune DUET sin desaprender | llama3.1 | Hugging Face |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | Modelo instruct generalista | llama3.1 | Hugging Face |
| Otros checkpoints de unlearning sobre Llama 3.1 8B | 8,03B | 128k | Olvido de conocimiento | llama3.1 | no disponible |

No se dispone de datos de benchmarks comparativos publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no ha sido evaluado en benchmarks generales (MMLU, HumanEval, GSM8K) ni en tareas fuera del dominio DUET de peliculas.
- El desaprendizaje se valida solo sobre 411 hechos de olvido y 546 de retencion; no hay garantia de que el conocimiento olvidado no sea recuperable mediante prompting adversarial o fine-tuning posterior (la model card incluye una sonda de reaprendizaje con LoRA de rango 4 precisamente para medir esto).
- Riesgo de alucinacion: heredado de Llama 3.1 8B Instruct; el system prompt de respuestas concisas puede aumentar la tasa de respuestas erroneas en preguntas ambiguas.
- Sesgos conocidos: no documentados en la model card; se heredan los de Llama 3.1 8B Instruct.
- Idiomas soportados: no disponibles; el entrenamiento se realizo sobre hechos en el conjunto DUET, presumiblemente en ingles, sin confirmacion.
- Licencia Llama 3.1: restricciones de uso comercial y de redistribucion segun los terminos de Meta; requiere aceptar la licencia y cumplir la politica de uso aceptable.
- El checkpoint corresponde a un unico epoch seleccionado (7) con semilla 0; la reproducibilidad depende de los scripts y versiones de `open-unlearning` referenciados.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-AdaPop-popular-s0
- Modelo base (fine-tune DUET): https://huggingface.co/AnniBori/Llama-3.1-8B-Instruct-DUET-film-ft
- Dataset de olvido/retencion: https://huggingface.co/datasets/SwetieePawsss/DUET_LLM (commit `2c2b047bb569b205ea57f924b36e818d4e3f3903`, config `film`)
- Repositorio open-unlearning (referenciado en la receta): no se proporciona URL en la model card
- Scripts de evaluacion (`film_unlearning/scripts/film_gate.py`, `film_forget_metrics.py`, `partc_job.sh`) y sondas (`revival_mechanism/src/stage4_revival_sweep.py`, `stage5_interp/stage9_gate_anatomy.py`, `ei_close_subspace_null.py`): rutas relativas a `open-unlearning/experiments/` en el repositorio del proyecto, sin URL publica en la informacion disponible
