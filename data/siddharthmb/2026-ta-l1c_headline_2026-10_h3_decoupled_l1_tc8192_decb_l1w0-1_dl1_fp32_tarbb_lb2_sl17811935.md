# siddharthmb/2026.TA.l1c_headline_2026-10_h3_decoupled_l1_tc8192_decb_l1w0.1_dl1_fp32_tarbb_lb2_sl17811935

# 2026.TA.l1c_headline_2026-10_h3_decoupled_l1_tc8192_decb_l1w0.1_dl1_fp32_tarbb_lb2_sl17811935

## Resumen

Adaptador de transcoders dispersos (transcoder adapters) para google/gemma-2-2b, publicado por el usuario siddharthmb en el marco del proyecto de investigacion transcoder-adapters (ejecutado en un nodo de la Universidad de Stanford, jagupard35.stanford.edu, como parte del trabajo del paper arXiv:2602.20904). El artefacto no es un modelo de proposito general, sino un mecanismo de adaptacion dispersa: anade una rama ReLU `dec(relu(enc(x)))` sobre cada capa MLP de la base congelada, de modo que las features de esa rama concentran la diferencia de comportamiento respecto al modelo base.

El modelo se ha entrenado en modo bridging contra google/gemma-2-2b-it, es decir, el objetivo es que base mas rama reproduzcan las salidas del modelo instruct de referencia. La relevancia es de investigacion: convierte el ajuste fino en un conjunto de features dispersas, inspeccionables y manipulables, lo que permite hacer diffing entre modelos, atribucion de comportamiento y steering de features concretas por su cantor id. Es una herramienta de interpretabilidad mecanicista, no un asistente listo para produccion.

El checkpoint reporta 3.596.081.920 parametros totales (base congelada mas ramas transcoder) y ocupa 9,2 GB en el repositorio. La licencia, los idiomas y los tipos de cuantizacion no estan declarados en la informacion disponible. Requiere el codigo propio del proyecto (`transcoder-adapters`) para cargarse, no el `AutoModel` estandar de transformers pese a la etiqueta de la libreria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 2) con una rama transcoder ReLU (`dec(relu(enc(x)))`) anadida a cada MLP; adaptador de transcoders dispersos |
| Parametros totales | 3.596.081.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la ficha; hereda la de google/gemma-2-2b (8192 tokens) |
| Tipos de cuantizacion | no disponible; los pesos del repositorio estan en fp32 (safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (rama adapter incluida en el checkpoint) |

Otros hiperparametros del adaptador declarados en la model card: n_features = 8192, dec_bias = True, l1_weight = 0,1, lambda_adapt = 1,0, lambda_bridge = 2,0, lambda_nmse = 1, n_cutoffs = 1, backbone = target.

## Arquitectura y entrenamiento

Sobre cada MLP de google/gemma-2-2b (modelo base congelado) se monta una rama de transcoder con la forma `dec(relu(enc(x)))`, con 8192 features latentes y sesgo en el decodificador. El backbone de atencion y embeddings corresponde al modelo objetivo (config `backbone: target`). El entrenamiento se realiza en modo bridging: la rama no se ajusta para una tarea concreta, sino para que la combinacion base mas rama reproduzca la distribucion de siguiente token de google/gemma-2-2b-it, que actua como modelo de referencia. Desactivando las ramas (`set_transcoders_enabled(False)`) se obtiene un modelo hibrido con los MLP del base y la atencion y embeddings del modelo de referencia.

El entrenamiento usa una perdida compuesta: termino KL contra la referencia (loss_type = kl), regularizacion L1 sobre las features (l1_weight = 0,1) para imponer dispersion, y terminos auxiliares ponderados (lambda_adapt = 1,0, lambda_bridge = 2,0, lambda_nmse = 1). Se entreno con learning rate 8e-4, batch size 4, una epoca y warmup ratio 0,05, sobre el dataset siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits (derivado de LMSYS-Chat-1M). Este checkpoint concreto es el brazo "h3" del estudio de dispersion `experiments/l1_collapse/` (receta headline a 40.000 filas), y su proposito declarado es estudiar por que el entrenador silencia la mayoria de las features y cual es el remedio de principio. Los datos concretos de composicion del dataset y el numero total de tokens de entrenamiento no se detallan en la informacion disponible.

## Capacidades

- Adaptacion dispersa de un modelo base congelado: toda la senal de ajuste fino se concentra en las ramas de transcoder, que son inspeccionables feature a feature.
- Reproduccion del comportamiento del modelo de referencia google/gemma-2-2b-it en tareas de conversacion: top1_agreement del 85,5 % en el conjunto evaluado.
- Steering de features individuales: la CLI permite manipular una feature concreta por su cantor id (`--steer CANTOR_ID:STRENGTH`).
- Construccion de grafos de atribucion: el proyecto genera grafos por encima del adaptador, con soporte para GemmaScope y limites de presupuesto.
- Chat interactivo a traves de la CLI del proyecto, con el tokenizer de gemma-2-2b-it.
- Diffing de modelos: al aislar el fine-tuning en features dispersas, permite comparar que cambia entre un modelo base y su version instruida.
- Generacion de codigo, matematicas, vision, audio o tool calling: no disponible; no se declaran capacidades de ese tipo en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Interpretabilidad mecanicista de ajustes finos: usar el adaptador para identificar que features concretas de las ramas se activan en una respuesta del modelo instruido y como se relacionan con comportamientos especificos, aprovechando los grafos de atribucion que genera el proyecto.
- Diffing entre modelo base e instruct: cargar el adaptador y comparar, posicion a posicion, donde base y referencia discrepan, para localizar que parte del ajuste fino introduce el cambio de comportamiento.
- Steering controlado de comportamiento: manipular una feature por su cantor id para amplificar o suprimir un patron de salida concreto, util en experimentos de control de generacion.
- Investigacion sobre dispersion de features: al ser el brazo h3 del estudio l1_collapse, sirve para estudiar por que la regularizacion L1 fija silencia la mayoria de features y para validar recetas alternativas de esparsidad.
- Generacion de datos de atribucion para GemmaScope: reutilizar los grafos construidos sobre este adaptador para cruzar features del adaptador con las de diccionarios dispersos externos de la familia Gemma.
- Validacion de metodologia de adaptacion: comparar este adaptador con otras ramas del mismo estudio para medir el efecto de hiperparametros como l1_weight o el modo bridging sobre la fidelidad al modelo de referencia.
- Reproduccion de experimentos: el repositorio incluye la configuracion exacta (`train_config.yaml`), lo que permite reentrenar el adaptador con `python -m training.train` sobre el dataset de splits de LMSYS-Chat-1M.
- Docencia y formacion en interpretabilidad: al ser un artefacto pequeno (3,6 B de parametros y 9,2 GB) sobre un base de gama 2B, es viable como ejemplo didactico en cursos de mecanistica.

## Benchmarks y rendimiento

La model card no publica benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). Lo que se reportan son metricas de alineacion con el modelo de referencia sobre 200 muestras y 34.100 tokens de filas reservadas:

| Metrica | Valor |
|---|---|
| kl_mean | 0,17378459870815277 |
| kl_mean_interesting | 0,299601 |
| top1_agreement | 0,855161 |
| top1_agreement_interesting | 0,701565 |
| n_interesting (posiciones base vs. referencia discrepan) | 15.464 |
| n_samples | 200 |
| n_tokens | 34.100 |
| per_benchmark/lmsys_chat/kl_mean | 0,17378459870815277 |
| per_benchmark/lmsys_chat/kl_mean_interesting | 0,299601 |
| per_benchmark/lmsys_chat/top1_agreement | 0,855161 |
| per_benchmark/lmsys_chat/top1_agreement_interesting | 0,701565 |

Las variantes `*_interesting` restringen el calculo a las posiciones en las que el modelo base y la referencia discrepan, es decir, donde la rama tiene que hacer el trabajo real. KL mas bajo y agreement mas alto indican mayor fidelidad al modelo instruido. No se han publicado resultados de benchmarks convencionales en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (estimacion a partir del numero de parametros, no confirmada por el autor): en fp32, en torno a 14,4 GB solo de pesos; en bf16/fp16, en torno a 7,2 GB; en int8, en torno a 3,6 GB; en int4, en torno a 1,8 GB. El repositorio ocupa 9,2 GB.
- GPU recomendadas: para experimentacion comoda, una GPU con 24 GB (RTX 3090, RTX 4090) cubre bf16 y fp16 con margen; A100 40/80 GB o H100 para fp32 o para lotes grandes.
- Cabe en GPU de consumo: si, el checkpoint en bf16 o fp16 cabe en tarjetas de 16 GB o mas; en int8 o int4 podria caber en tarjetas de 8-12 GB, aunque no se declaran cuantizaciones oficiales.
- Opciones de despliegue: no disponibles. El autor solo documenta la carga mediante las clases propias del repositorio (`models.auto.load_transcoder_model`) y la CLI del proyecto; no se mencionan vLLM, llama.cpp, Ollama ni TGI, pese a las etiquetas `text-generation-inference` y `endpoints_compatible` del Hub.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se declaran modelos directamente comparables en la informacion disponible. A continuacion se compara cualitativamente con alternativas de categoria proxima, sin cifras inventadas:

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador | 3,596 B (base + ramas) | 8192 tokens (heredado del base) | KL 0,174 / agreement 85,5 % frente a gemma-2-2b-it | no disponible | HuggingFace (12 descargas) |
| google/gemma-2-2b (base) | no disponible en la informacion | no disponible en la informacion | es el punto de partida, no la referencia | Gemma (segun el base) | publico en HuggingFace |
| google/gemma-2-2b-it (referencia) | no disponible en la informacion | no disponible en la informacion | es el objetivo a reproducir, no comparable directamente | Gemma (segun el base) | publico en HuggingFace |
| Adaptador LoRA generico sobre gemma-2-2b | no disponible | no disponible | no disponible | no disponible | no disponible |

La diferencia clave frente a un LoRA convencional es que las features del transcoder son dispersas e inspeccionables y admiten steering por id, mientras que un LoRA no expone ese nivel de granularidad. Frente a un transcoder de diccionario disperso (tipo GemmaScope), la diferencia es que aqui la rama se entrena en modo bridging para reproducir un modelo de referencia concreto.

## Limitaciones y advertencias

- No es un modelo de proposito general: es un artefacto de investigacion para interpretabilidad; su uso como asistente directo no esta documentado ni recomendado.
- No se declara licencia: no se puede confirmar si permite uso comercial. Al derivar de google/gemma-2-2b, probablemente hereda condiciones de la licencia Gemma, pero esto no esta confirmado en la informacion disponible.
- No se declaran idiomas soportados; las capacidades multilingues dependen del modelo base y no estan verificadas para este adaptador.
- Riesgo de alucinacion: no evaluado en la model card; el adaptador reproduce una distribucion de referencia (KL 0,174), no garantiza veracidad.
- Fidelidad incompleta: en las posiciones donde base y referencia discrepan, el agreement baja al 70,2 % y el KL sube a 0,300; la rama no reproduce por completo el comportamiento del modelo instruido.
- Requiere codigo propio (`transcoder-adapters`) para cargarse; no es cargable con las clases estandar de transformers, lo que dificulta su integracion en pipelines convencionales.
- Sesgos conocidos: no documentados en la informacion disponible; heredables de los datos LMSYS-Chat-1M y del modelo base.
- Los datos de entrenamiento declarados son una unica epoca sobre splits de LMSYS-Chat-1M; no se detalla el numero de tokens ni la composicion exacta.
- Las estimaciones de VRAM de esta ficha son calculos derivados del numero de parametros, no cifras oficiales del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddharthmb/2026.TA.l1c_headline_2026-10_h3_decoupled_l1_tc8192_decb_l1w0.1_dl1_fp32_tarbb_lb2_sl17811935
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo de referencia: https://huggingface.co/google/gemma-2-2b-it
- Tokenizer: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/siddharthmb/2026.transcoder-adapters.lmsys-chat-1m-splits
- Paper (Transcoder Adapters for Reasoning-Model Diffing): https://arxiv.org/abs/2602.20904
- Pagina del proyecto: https://transcoder-adapters.github.io/
- Codigo: https://github.com/Sid-MB/transcoder-adapters
- Run de W&B: https://wandb.ai/siddharth-stanford/sparse-adaptation/runs/8ht87zco

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces devueltos eran de tematica no relacionada y se han descartado.
