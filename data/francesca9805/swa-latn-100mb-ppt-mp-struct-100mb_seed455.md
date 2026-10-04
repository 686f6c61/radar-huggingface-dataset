# francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed455

## Resumen

El modelo `francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed455` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/swa_latn_100mb`, un transformer de tipo GPT-2 de 124.770.816 parametros entrenado sobre texto en suajili (Swahili) en alfabeto latino. Lo publica el usuario `francesca9805` y se ha entrenado con la libreria TRL (Transformer Reinforcement Learning) de Hugging Face mediante SFT, presumiblemente como parte de un estudio comparativo de tokenizadores y tecnicas de empaquetado de datos (los identificadores "ppt", "mp", "struct" y "seed455" apuntan a variantes experimentales del mismo pipeline).

Se trata de un modelo muy pequeno (aproximadamente 125 millones de parametros, 0,3 GB de repositorio) orientado a generacion de texto en un unico idioma de bajos recursos. Su relevancia es academica y experimental: sirve para investigar como distintas estrategias de preparacion de datos y tokenizacion afectan al rendimiento de modelos pequenos en lenguas con pocos corpus digitales, mas que para aplicaciones de produccion generalistas.

La ficha publica es minima: no incluye datos de evaluacion, ni composicion del dataset, ni hiperparametros detallados mas alla de la version de las librerias empleadas (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1, Datasets 4.8.4, Tokenizers 0.22.1). El unico enlace adicional aportado es un run de Weights & Biases alojado en la instancia de la Universidad de Groningen, lo que confirma el contexto de investigacion academica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en los metadatos) |
| Parametros totales | 124.770.816 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors en precision completa) |
| Idiomas soportados | no disponible en los metadatos; el identificador `swa_latn` sugiere suajili en alfabeto latino |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin valor real) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/swa_latn_100mb |
| Metodo de entrenamiento | SFT con TRL |
| Tamano del repositorio | 0,3 GB |
| Fecha de publicacion | 2026-10-04 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `goldfish-models/swa_latn_100mb`, un transformer decoder-only de estilo GPT-2 con 124,77 millones de parametros. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto del checkpoint base en la informacion proporcionada. Tampoco se documenta si se aplicaron tecnicas de atencion lineal, decodificacion especulativa u otras innovaciones arquitectonicas.

El ajuste fino se realizo con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1 (CUDA 121). La model card confirma el uso de SFT (supervised fine-tuning) como unico metodo de alineacion, sin mencion de RLHF, DPO ni otras tecnicas. No se especifica el numero de tokens de entrenamiento, la composicion del dataset de instrucciones, la tasa de aprendizaje, el numero de epocas ni el tamano de lote. El unico trazado reproducible disponible es el run de Weights & Biases `ncvawzbm` del proyecto `new-tokenizers`, alojado en la instancia de la Universidad de Groningen. Los identificadores de la familia de modelos (`ppt`, `mp`, `struct`, `seed455`) sugieren variantes controladas por semilla, probablemente correspondientes a experimentos de comparacion de tokenizadores y de esquemas de empaquetado de secuencias.

## Capacidades

- Generacion de texto autoregresiva en el idioma del modelo base (presumiblemente suajili).
- Ajuste SFT orientado a seguir instrucciones conversacionales, segun el ejemplo de `pipeline` de la model card (formato de mensajes con rol `user`).
- Compatible con las tuberias estandar de `transformers` (`pipeline("text-generation")`).
- Etiquetado como `endpoints_compatible` y `text-generation-inference`, por lo que es desplegable en TGI y en los Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo esta especializado en un unico idioma.
- Capacidades especiales (vision, audio, modo "thinking"): no disponibles.

## Casos de uso

- Investigacion academica sobre tokenizacion y empaquetado de datos: el modelo forma parte de una familia de variantes controladas por semilla disenada para comparar el efecto de distintas estrategias de preparacion de corpus en lenguas de bajos recursos, lo que permite aislar el impacto de cada decision experimental.
- Experimentos de bajo coste en PLN para suajili: por su tamano (125 M de parametros) puede entrenarse y evaluarse en una sola GPU de consumo, lo que lo hace adecuado para grupos de investigacion con presupuesto limitado que quieran generar lineas base reproducibles.
- Generacion de texto suajili a pequena escala: para tareas de autocompletado, redaccion asistida o generacion de borradores donde no se requiera alta calidad linguistica y se valore la ejecuacion local.
- Ajuste adicional (continued pretraining / fine-tuning): al ser un checkpoint pequeno y en safetensors, sirve como punto de partida para experimentos posteriores de ajuste especifico de dominio (por ejemplo, noticias, textos legales o corpus medicos en suajili).
- Evaluacion comparativa de modelos monolingues: util como linea base frente a modelos multilingues mayores (mBERT, XLM-R, mT5) en tareas de generacion para un idioma concreto, permitiendo medir la brecha de rendimiento.
- Despliegue en entornos con recursos muy limitados: al caber en CPU o en cualquier GPU moderna, puede integrarse en demos, notebooks docentes o prototipos de API ligera con TGI o FriendliAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion cuantitativa, y tampoco se proporcionan comparaciones contra el modelo base `goldfish-models/swa_latn_100mb`.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos unicamente): aproximadamente 500 MB en fp32, 250 MB en fp16/bf16, 125 MB en int8 y 65 MB en int4. Anadiendo cache KV y overhead del runtime, un presupuesto de 1-2 GB es holgado.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada. Una NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 ejecutarian el modelo con margen amplio; incluso GPU integradas pueden servir.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo actual y tambien en CPU sin aceleracion dedicada. El modelo es desplegable en portatiles y en entornos edge.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), Inference Endpoints de Hugging Face (etiqueta `endpoints_compatible`), FriendliAI (aparece listado para variantes hermanas de la familia), y potencialmente `vLLM`, `llama.cpp` y `Ollama` previa conversion a GGUF (no se ofrecen pesos GGUF en el repositorio).
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera una latencia por token en el rango de milisegundos o inferior en GPU y de decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| swa-latn-100mb-ppt-mp-struct-100mb_seed455 (este modelo) | 124,77 M | no disponible | suajili (inferido) | no disponible | Hugging Face |
| goldfish-models/swa_latn_100mb (modelo base) | ~125 M | no disponible | suajili (latn) | no disponible | Hugging Face |
| Otras variantes de la familia `swa-latn-100mb-ppt-*` del mismo autor | del orden de 125 M | no disponible | suajili (latn) | no disponible | Hugging Face |
| Modelos GPT-2 pequenos multilingues (p. ej. distilgpt2) | 82-124 M | 1024 tokens (tipico en GPT-2, no confirmado aqui) | ingles principalmente | licencias variables | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas. Las comparaciones anteriores son estructurales y se basan unicamente en el tamano, la familia y la disponibilidad, no en metricas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan analisis de sesgo. Al entrenarse sobre un corpus de 100 MB en suajili, probablemente hereda los sesgos de dicha fuente, pero no hay evaluacion publicada.
- Riesgo de alucinacion: elevado por el tamano reducido del modelo. En tareas de generacion abierta es probable que produzca contenido plausible pero facticamente incorrecto, especialmente fuera del dominio de entrenamiento.
- Limitaciones de contexto: se desconoce la longitud de contexto efectiva; el ejemplo de la model card usa `max_new_tokens=128`, lo que sugiere respuestas cortas.
- Limitaciones de idioma: el modelo esta especializado en un unico idioma (suajili) y no se ha verificado su comportamiento en castellano ni en otros idiomas.
- Restricciones de licencia: la licencia no esta especificada. La model card incluye `licence: license` como marcador de posicion sin contenido, por lo que el uso comercial queda en un limbo legal. No debe desplegarse en produccion sin aclarar previamente los terminos con el autor.
- Caveats para produccion: el modelo carece de evaluacion, de documentacion de seguridad y de garantia de calidad. Ademas, su autor no ofrece soporte y el numero de descargas y likes es cero, lo que indica ausencia de validacion por parte de la comunidad.
- Reproducibilidad: aunque se enlaza un run de W&B, no se publican hiperparametros ni la composicion del dataset, lo que dificulta reproducir el resultado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-mp-struct-100mb_seed455
- Modelo base: https://huggingface.co/goldfish-models/swa_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ncvawzbm
- Repositorio TRL: https://github.com/huggingface/trl
- Variante hermana: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-10mb-packed-bfd_seed455
- Variante hermana: https://huggingface.co/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfdiso_seed455
- Ficha en FriendliAI (variante): https://friendli.ai/models/francesca9805/swa-latn-100mb-ppt-Dp-100mb-packed-bfd_seed455
- Ficha en LLM Explorer (variante): https://llm-explorer.com/model/francesca9805%2Feng-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed455,7jOq4n9vIMo18gE0tQ1ux2
