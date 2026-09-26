# pi-dal/Linnaeus-0.1.0-2B

## Resumen

Linnaeus-0.1.0-2B es un checkpoint de decision desarrollado por el usuario pi-dal sobre el modelo base Qwen/Qwen3.5-2B. A diferencia de un modelo generativo convencional, no produce texto libre ni cadenas de razonamiento: su salida son distribuciones de probabilidad sobre un conjunto de opciones. Soporta tres modos de consulta: seleccion de candidatos (choice), estimacion de veracidad (noul) y puntuaciones ordenadas (score), ademas de decisiones tipadas. La variante con torre de vision acepta texto y una imagen PIL como entrada.

El modelo se construye mediante un adaptador LoRA fusionado en BF16, con operaciones fusionadas y puntuacion paralela de candidatos sobre un prefijo compartido, lo que permite plantear entre 2 y 128 candidatos por pregunta con un limite de 4.096 tokens por consulta. El entrenamiento combina RLCD (Reinforcement Learning from Contrastive Decisions) con una perdida auxiliar de entropia cruzada, y aplica calibracion de temperatura sobre una particion independiente despues de fusionar el LoRA.

Es relevante porque ocupa un nicho poco habitual: clasificacion y toma de decisiones estructurada con calidad de modelo de 2B en lugar de generacion abierta, con un rendimiento declarado de 80,78% de exactitud macro en held-out (26 grupos, 180.000 ejemplos) y 73,16% en JevBench v1.2.2 (231 tareas publicas), ademas de builds cuantizados para Apple Silicon que caben en un iPhone. La licencia Apache 2.0 y la reutilizacion de cualquier runtime de lenguaje estandar (la cabeza de decision se incrusta como fila extra de `lm_head`) facilitan su integracion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen/Qwen3.5-2B) con adaptador LoRA fusionado y cabeza de decision incrustada como fila adicional de `lm_head` (`score_row_id`); variante vision-language con torre de vision |
| Parametros totales | no disponible de forma explicita; la nomenclatura y el modelo base indican ~2B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens por pregunta |
| Tipos de cuantizacion | BF16 (merged); MLX 8-bit; MLX 4-bit |
| Idiomas soportados | no disponible como lista oficial; evaluado en XNLI (15 idiomas), massive en-US y zh-CN, y esci (es, jp, us) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers / merged) y pesos MLX para Apple Silicon |

Datos adicionales del repositorio: seleccion seed 42, update 2.800; inferencia en LoRA fusionado, BF16, operaciones fusionadas y puntuacion paralela de candidatos con prefijo compartido; entradas de texto y una imagen PIL; 2 a 128 candidatos por pregunta. Tamano del repo principal: 0,0 GB. Descargas: 0. Likes: 1.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y anade un adaptador LoRA que se fusiona en los pesos base antes de la exportacion. La innovacion estructural principal es que la cabeza de decision se embebe como una fila extra de `lm_head` (`score_row_id`), de modo que cualquier runtime de lenguaje estandar es capaz de producir puntuaciones de decision en las posiciones marcadas con `<|fim_suffix|>`. Esto evita depender de un runtime propietario y simplifica el despliegue. Las preguntas reutilizan un prefijo de entrada compartido y calculan sus sufijos en paralelo, lo que reduce el coste cuando se evaluan varios candidatos sobre el mismo contexto; las preguntas adicionales si requieren computo extra. La variante multimodal mantiene la torre de vision (los builds MLX de texto son solo texto; los builds VLM conservan la torre).

El entrenamiento combina RLCD (Reinforcement Learning from Contrastive Decisions) con una perdida auxiliar de entropia cruzada, siguiendo las referencias fijadas de Laya y Laya Vision. Tras la fusion del LoRA se aplica una calibracion de temperatura sobre una particion independiente, cuya calidad se mide con NLL y ECE antes y despues. La model card enlaza la receta de entrenamiento (`recipe.json`) y la implementacion de RLCD junto con la atribucion upstream (`docs/rlcd.md`).

## Capacidades

- Seleccion de candidatos (`choice`): devuelve una distribucion sobre un conjunto de 2 a 128 opciones para una misma pregunta.
- Estimacion de veracidad (`noul`): produce una estimacion de verdad para una afirmacion dada.
- Puntuacion ordenada (`score`): asigna puntuaciones a respuestas para ordenarlas o reranquearlas.
- Decisiones tipadas (`typed_decisions`): clasificacion con tipos de decision predefinidos.
- Salida exclusivamente distribucional: no genera razonamiento ni respuestas en lenguaje natural.
- Vision: acepta una imagen PIL junto al texto en los builds VLM (vqav2_yesno, aokvqa, clevr, scienceqa, screenqa, aokvqa).
- Multilingue: evaluado en 15 idiomas via XNLI, en intents en en-US y zh-CN (massive) y en busqueda de productos en es/jp/us (esci).
- Puntuacion paralela de candidatos sobre prefijo compartido.
- Metricas de confianza calibradas (la model card reporta ECE y NLL antes y despues de calibracion).
- Tool calling / function calling: no disponible, no se documenta soporte.
- Uso como agente o razonamiento multi-paso: no soportado; el modelo no produce cadenas de razonamiento.
- Modo thinking, audio o generacion de texto: no disponibles.

## Casos de uso

- Filtrado de spam y phishing en correo y SMS: los resultados declarados son 98,95% en `mail_spam`, 98,95% en `mail_phishing` y 99,37% en `sms_spam`, con ECE final de 0,0098, 0,0094 y 0,0061 respectivamente. El modelo devuelve la etiqueta y una confianza calibrada, lo que permite fijar umbrales de derivacion a revision humana.
- Enrutado y clasificacion de tickets de soporte: `banking77` alcanza 73,70% y `massive_en-US` 78,89%, con modos de decision tipada (`typed_decisions`, 73,05%). Es adecuado para asignar intenciones y colas en un sistema de atencion al cliente porque no necesita generar texto y su latencia es baja.
- Verificacion de afirmaciones y respuesta a preguntas booleanas: `boolq` 87,71% y `contract_nli` 85,59% con el modo `noul`, util para comprobar hipotesis sobre documentacion contractual o textos de referencia antes de responder al usuario.
- Reranking de candidatos en pipelines de RAG: el modo `score` puntua entre 2 y 128 candidatos por pregunta, y el motor alcanza 407,7 decisiones/s en la carga `distinct_text_50q` (p50 de 122,42 ms) en una RTX 4090, lo que permite reordenar conjuntos amplios de fragmentos recuperados sin recurrir a un modelo generativo.
- Comprension visual de documentos y capturas: `vqav2_yesno` 85,88%, `aokvqa` 83,66%, `scienceqa` 92,66% y `clevr_*` por encima del 89%. Sirve para responder preguntas cerradas sobre diagramas, ilustraciones y material cientifico. Advertencia: `screenqa_choice` cae a 22,05%, por lo que no es fiable en ese dominio concreto de interfaz.
- Moderacion de contenido y analisis de emociones: `emotion` 77,00% con ECE de 0,0488, adecuado para etiquetado de tono en grandes volumenes de mensajes.
- Clasificacion de noticias y textos cortos: `ag_news` 90,04% sobre 7.600 ejemplos, con ECE de 0,0710, valido para alimentar sistemas de agregacion o alerta temprana.
- Inferencia en dispositivo con privacidad: los builds MLX de 1,0 GB (4-bit) y 1,9 GB (8-bit) estan pensados para Mac e iPhone, lo que permite ejecutar clasificacion sensible en local sin enviar datos a un servidor.

## Benchmarks y rendimiento

Resultados declarados por el autor (medidos):

| Metrica | Resultado |
|---|---|
| Exactitud macro en held-out (26 grupos, 180k ejemplos) | 80,78% |
| Referencia upstream Dohnuts-0.1.0-0.8B | 78,21% |
| JevBench v1.2.2 (231 tareas publicas) | 73,16% (easy 100 / standard 91,7 / hard 49,6) |
| Laya app suites | supera al upstream en 7 de 11 grupos (spam, routing y decisiones tipadas son los mejores) |
| XNLI 15 idiomas | 76,0% (el upstream perdia este conjunto frente a Laya multilingual, 73,8%) |

Evaluacion por conjunto de datos (exactitud, NLL antes/despues de calibracion y ECE antes/despues):

| Dataset | N | Exactitud | NLL antes / despues | ECE antes / despues |
|---|---:|---:|---:|---:|
| ag_news | 7600 | 90,04% | 0,8728 / 0,5378 | 0,0832 / 0,0710 |
| aokvqa | 1138 | 83,66% | 0,6347 / 0,4746 | 0,0930 / 0,0513 |
| banking77 | 3080 | 73,70% | 1,0536 / 1,1711 | 0,0275 / 0,2001 |
| boolq | 3270 | 87,71% | 0,3854 / 0,3288 | 0,0610 / 0,0648 |
| clevr_attribute | 53734 | 98,92% | 0,1687 / 0,1230 | 0,0100 / 0,0095 |
| clevr_count | 35422 | 89,72% | 0,7159 / 0,2652 | 0,0793 / 0,0077 |
| clevr_exist | 20196 | 98,58% | 0,2526 / 0,0955 | 0,0137 / 0,0127 |
| contract_nli | 1173 | 85,59% | 0,5014 / 0,4020 | 0,0888 / 0,0338 |
| emotion | 2000 | 77,00% | 0,7237 / 0,6812 | 0,0777 / 0,0488 |
| esci_es | 1482 | 60,26% | 0,9241 / 0,9775 | 0,0342 / 0,1266 |
| esci_jp | 1633 | 63,81% | 0,8878 / 0,9531 | 0,0349 / 0,1410 |
| esci_us | 1145 | 57,64% | 0,9185 / 0,9712 | 0,0489 / 0,0868 |
| mail_phishing | 1050 | 98,95% | 0,1327 / 0,0467 | 0,0097 / 0,0094 |
| mail_spam | 854 | 98,95% | 0,1658 / 0,0580 | 0,0105 / 0,0098 |
| massive_en-US | 2970 | 78,89% | 0,7713 / 0,7944 | 0,0532 / 0,1141 |
| massive_zh-CN | 2921 | 76,82% | 0,8801 / 0,8552 | 0,0664 / 0,0904 |
| scienceqa | 2017 | 92,66% | 0,2942 / 0,2049 | 0,0489 / 0,0342 |
| screenqa_choice | 848 | 22,05% | 2,3429 / 2,4277 | 0,0464 / 0,0603 |
| screenqa_noul | 2148 | 72,35% | 0,5747 / 0,6116 | 0,0341 / 0,1288 |
| sharc | 8276 | 73,19% | 0,6671 / 0,6700 | 0,0705 / 0,0547 |
| sms_spam | 794 | 99,37% | 0,0910 / 0,0319 | 0,0062 / 0,0061 |
| typed_decisions | 2000 | 73,05% | 0,9068 / 0,9944 | 0,1073 / 0,2750 |
| vqav2_yesno | 8102 | 85,88% | 0,3962 / 0,4835 | 0,0248 / 0,1920 |
| wikiqa | 6160 | 96,17% | 0,4844 / 0,1710 | 0,0374 / 0,0322 |
| xnli_en | 5009 | 87,20% | 0,3602 / 0,3727 | 0,0307 / 0,0601 |
| xnli_zh | 5009 | 78,20% | 0,5986 / 0,5582 | 0,0824 / 0,0297 |

Latencia de inferencia (RTX 4090 en caliente, extremo a extremo incluyendo preprocesado y transferencias; tres calentamientos y 20 repeticiones sincronizadas, sin red ni colas):

| Motor | Carga | p50 (ms) | p95 (ms) | Decisiones/s |
|---|---|---:|---:|---:|
| Linnaeus | vision_protocol_text_1q | 44,53 | 45,29 | 22,4 |
| Linnaeus | vision_protocol_text_3q | 47,81 | 48,29 | 62,9 |
| Linnaeus | vision_protocol_image_1q | 49,88 | 51,27 | 19,9 |
| Linnaeus | vision_protocol_image_3q | 100,83 | 102,87 | 29,6 |
| Linnaeus | distinct_text_1q | 46,83 | 48,00 | 21,3 |
| Linnaeus | distinct_text_5q | 94,32 | 95,89 | 52,8 |
| Linnaeus | distinct_text_10q | 94,83 | 96,16 | 105,1 |
| Linnaeus | distinct_text_50q | 122,42 | 124,17 | 407,7 |

Rendimiento de los builds exportados:

| Repo | Tamano | JevBench | Destino |
|---|---:|---:|---|
| Linnaeus-0.1.0-2B-merged | 4,3 GB | 71,0% (MPS) | Mac de desarrollo / origen de conversion |
| Linnaeus-0.1.0-2B-MLX-8bit | 1,9 GB | 70,56% | Mac + iPhone |
| Linnaeus-0.1.0-2B-MLX-4bit | 1,0 GB | 67,53% | iPhone optimizado en tamano |
| Linnaeus-0.1.0-2B-MLX-VLM-8bit | 2,5 GB | texto 70,56% + imagenes | Mac + iPhone multimodal |
| Linnaeus-0.1.0-2B-MLX-VLM-4bit | 1,6 GB | texto ~67% + imagenes | iPhone multimodal |

## Requisitos de hardware

- El build merged en BF16 ocupa 4,3 GB en disco; en VRAM el requisito es del mismo orden mas el overhead de activaciones, por lo que una GPU de 8 GB o mas deberia ser suficiente para inferencia en BF16.
- GPU de referencia en la medicion del autor: RTX 4090, con p50 de 44,53 ms para una pregunta de texto con protocolo de vision y 122,42 ms para 50 preguntas distintas (407,7 decisiones/s).
- Cabe en GPU de consumo: si, en tarjetas de gama media-alta con 8 GB o mas para el build merged en BF16, y con margen amplio para builds cuantizados.
- Apple Silicon: builds MLX de 8 bits (1,9 GB, 2,5 GB con vision) y 4 bits (1,0 GB, 1,6 GB con vision) para Mac e iPhone.
- Opciones de despliegue: transformers (libreria declarada), runtime MLX mediante `src/linnaeus/mlx_predictor.py` del repositorio de GitHub, y cualquier runtime de lenguaje estandar para el checkpoint merged, ya que la cabeza de decision queda accesible como fila extra de `lm_head` en las posiciones marcadas con `<|fim_suffix|>`.
- Soporte de vLLM, TGI, llama.cpp, Ollama o GGUF: no disponible, no se documenta en la informacion proporcionada.
- Latencia y throughput: consultar la tabla de la seccion anterior. Las cargas con multiples preguntas distintas escalan mejor que las cargas con vision, que dominan el coste (100,83 ms para tres preguntas con imagen).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Linnaeus-0.1.0-2B | ~2B | 4.096 tokens por pregunta | Macro held-out 80,78%; JevBench 73,16%; XNLI 15 idiomas 76,0% | Apache 2.0 | Checkpoint LoRA, merged y builds MLX |
| Dohnuts-0.1.0-0.8B (upstream) | 0,8B | no disponible | Macro held-out 78,21% | no disponible | Referencia upstream citada por el autor |
| Laya / Laya Vision (referencias de receta) | no disponible | no disponible | no disponible | no disponible | Referencias de receta de entrenamiento y evaluacion |
| Clasificadores sub-1B de la clase JevBench | <1B | no disponible | Por debajo de 73,16% segun el autor | no disponible | no disponible |
| Qwen/Qwen3.5-2B (modelo base) | ~2B | no disponible | no disponible (modelo generativo, sin cabeza de decision) | no disponible | Repositorio del modelo base |

El autor situa a Linnaeus en la parte alta de la clase de modelos locales de ~2B y por delante de todos los clasificadores sub-1B en JevBench. No se dispone de comparaciones con modelos de decision equivalentes de otros proveedores.

## Limitaciones y advertencias

- El modelo no genera razonamiento ni respuestas de formato libre; solo devuelve distribuciones de decision. Cualquier caso de uso que requiera texto generado necesita otro componente.
- `screenqa_choice` obtiene 22,05% de exactitud y un NLL de 2,3429, muy por debajo del resto; no debe utilizarse en tareas de comprension de interfaces sin un ajuste especifico.
- Los conjuntos de busqueda de productos son debiles: esci_es 60,26%, esci_jp 63,81%, esci_us 57,64%.
- La calibracion empeora el ECE en varios conjuntos: banking77 pasa de 0,0275 a 0,2001, vqav2_yesno de 0,0248 a 0,1920, typed_decisions de 0,1073 a 0,2750, massive_en-US de 0,0532 a 0,1141 y screenqa_noul de 0,0341 a 0,1288. Conviene validar los umbrales de confianza por dominio en lugar de reutilizarlos globalmente.
- La propia model card advierte de que el campo `confidence` es un resumen de la distribucion, no una garantia empirica de acierto: en `choice` y `score` se define como `1 - H(p) / log(K)` y en `noul` como `max(p, 1 - p)`.
- No se documenta la composicion del dataset de entrenamiento, el numero de tokens ni la existencia de datos de sesgo; no hay informacion sobre sesgos conocidos.
- La lista oficial de idiomas soportados no esta disponible, pese a las evaluaciones multilingues en XNLI, massive y esci.
- El limite de 4.096 tokens por pregunta restringe documentos largos; el prefijo compartido solo amortiza el coste entre candidatos de una misma pregunta, no entre preguntas distintas.
- La licencia del adaptador es Apache 2.0, pero no se especifica la licencia del modelo base Qwen/Qwen3.5-2B en la informacion disponible; conviene verificarla antes de un uso comercial.
- El repositorio principal aparece con 0,0 GB de tamano y 0 descargas, por lo que los pesos del checkpoint LoRA podrian no estar publicados en ese repositorio; los artefactos merged y MLX si declaran tamanos concretos.
- Las fechas de creacion y actualizacion del repositorio (septiembre de 2026) son posteriores a la fecha habitual de publicacion de modelos de esta familia; conviene verificar la procedencia y la integridad de los artefactos antes de desplegarlos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B
- Build merged: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-merged
- Build MLX 8 bits: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-8bit
- Build MLX 4 bits: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-4bit
- Build MLX VLM 8 bits: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-VLM-8bit
- Build MLX VLM 4 bits: https://huggingface.co/pi-dal/Linnaeus-0.1.0-2B-MLX-VLM-4bit
- Repositorio de codigo: https://github.com/pi-dal/Linnaeus
- Predictor MLX: `src/linnaeus/mlx_predictor.py` (repositorio de GitHub)
- Configuracion de runtime: `linnaeus-runtime.json` (repositorio de HuggingFace)
- Receta de entrenamiento: `recipe.json` (ruta relativa dentro del repositorio)
- Implementacion de RLCD y atribucion upstream: `docs/rlcd.md`
- Documentacion de inferencia, instalacion y definicion de preguntas: `docs/inference.md`
- Busqueda web: las consultas realizadas devolvieron unicamente resultados sobre el numero pi (Wikipedia, Britannica, piday.org), sin relacion con este modelo. No se han encontrado papers, blogs ni demos adicionales en la informacion disponible.
