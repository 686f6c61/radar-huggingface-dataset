# francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455

## Resumen

`nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455` es un ajuste fino supervisado (SFT) publicado por el usuario de HuggingFace **francesca9805** a partir del modelo base `goldfish-models/nor_latn_10mb`. Se trata de un modelo de generación de texto de arquitectura **GPT-2** (transformer decoder-only) con **39.087.104 parámetros** (~39 M) y un repositorio de apenas 0,1 GB, entrenado con la librería **TRL** y orientado, según la convención de nombres del modelo base, al **noruego en escritura latina** (`nor-latn`).

El interés de este artefacto es exclusivamente experimental. El identificador (`ppt`, `Dp`, `100mb-packed`, `bfd`, `seed455`) apunta a una batería de réplicas de ajuste sobre corpus empaquetados de 100 MB con distintas semillas, y existen variantes hermanas con el mismo patrón para otros idiomas (`eng-latn-...`, `ind-latn-...`, `nld-latn-...`) publicadas por otros usuarios, lo que sugiere un experimento comparativo más amplio sobre el efecto del tokenizador y del idioma en modelos pequeños (el run de Weights & Biases asociado pertenece al proyecto `new-tokenizers` de la Universidad de Groningen).

No es un modelo destinado a producción: no declara licencia, no documenta composición del dataset ni idiomas, no publica resultados de benchmarks y acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha. Debe tratarse, por tanto, como un objeto de estudio para reproducibilidad de pipelines de SFT, no como un componente listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 39.087.104 (~39 M), dato real de `safetensors` |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponible en la model card; el identificador apunta a noruego en escritura latina (`nor-latn`) |
| Licencia | no disponible (la model card contiene un campo `licence: license` sin concrecion) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/nor_latn_10mb (ajuste fino) |
| Libreria | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 0,1 GB |
| Fecha de creacion / actualizacion | 2026-09-23 (posible artefacto de metadatos) |

## Arquitectura y entrenamiento

La arquitectura es un transformer **decoder-only tipo GPT-2**, la familia empleada por los modelos del proyecto `goldfish-models`, que entrena modelos monolingues de ~10 MB de corpus por idioma. Con ~39 M de parametros, el grueso del presupuesto parametrico suele residir en la matriz de embeddings y en la proyeccion de salida, dado que estos modelos manejan vocabularios especificos por idioma; no se dispone de informacion sobre el numero de capas, dimension oculta, cabezas de atencion ni sobre la longitud de contexto efectiva.

El entrenamiento se realizo mediante **SFT con TRL 0.23.0** sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, partiendo de `goldfish-models/nor_latn_10mb`. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF/DPO ni hiperparametros (tasa de aprendizaje, epocas, tamano de lote). El run de entrenamiento esta registrado en Weights & Biases, enlace disponible en la seccion de enlaces. No se describe ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, MoE ni arquitecturas hibridas).

## Capacidades

- **Generacion de texto**: capacidad principal declarada (`text-generation`), con plantilla conversacional de un solo turno segun el ejemplo de la model card, que pasa la peticion como lista de mensajes `{"role": "user", "content": ...}`.
- **Noruego escrito en alfabeto latino**: el modelo base y el identificador apuntan a este idioma; no hay confirmacion explicita en la model card.
- **Tool calling / function calling**: no documentado.
- **Uso como agente o razonamiento multi-paso**: no documentado; el tamano del modelo (39 M) hace inviable un razonamiento complejo fiable.
- **Capacidades multilingues**: no documentadas; el nombre sugiere entrenamiento monolingue en noruego.
- **Vision, audio o modalidades adicionales**: no soportadas.
- **Modo de razonamiento explicito (thinking)**: no disponible.
- **Integracion con Text Generation Inference**: el repositorio esta etiquetado con `text-generation-inference` y `endpoints_compatible`.
- **Codigo, matematicas o instrucciones complejas**: no documentadas y poco probables a esta escala.

## Casos de uso

- **Investigacion sobre tokenizadores en lenguas de bajos recursos**: el run de W&B pertenece al proyecto `new-tokenizers`, de modo que este checkpoint sirve para comparar como afecta la tokenizacion al rendimiento en noruego frente a las variantes hermanas en otros idiomas.
- **Reproducibilidad de pipelines de SFT**: al publicarse el stack exacto (TRL 0.23.0, Transformers 4.56.2, PyTorch 2.5.1+cu121), el modelo sirve como referencia para replicar el mismo experimento variando la semilla (`seed455`).
- **Smoke test de infraestructura de inferencia**: su tamano (~0,1 GB) y las etiquetas `text-generation-inference` y `endpoints_compatible` lo hacen util para validar despliegues de TGI, endpoints compatibles o FriendliAI sin consumir recursos.
- **Prototipado rapido de completado de texto en noruego**: generacion de continuaciones cortas para maquetar interfaces o demos internas, asumiendo calidad limitada y necesidad de revision humana.
- **Aumentacion de datos y generacion de texto sintetico exploratorio**: produccion de candidatos de texto en noruego para preentrenar o ajustar modelos mayores, siempre con filtrado y validacion posteriores.
- **Docencia y practicas de ajuste fino**: como punto de partida para ejercicios de fine-tuning, cuantizacion o destilacion sobre un modelo de 39 M que cabe en cualquier portatil.
- **Analisis de sesgos y comportamiento de modelos pequenos**: estudio de que patrones linguisticos reproduce un GPT-2 de 39 M entrenado sobre un corpus reducido en una lengua concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia** (calculo a partir de los 39,09 M de parametros; no son medidas del autor): ~150 MB en fp32, ~78 MB en fp16/bf16, ~39 MB en int8, ~20 MB en int4, sin contar activaciones ni cache KV.
- **GPU recomendadas**: cualquier GPU, incluida una GTX 1050 Ti, una RTX 3060 o una iGPU moderna. El modelo no necesita A100, H100 ni RTX 4090.
- **Compatibilidad con GPU de consumo**: si, en todas las gamas; tambien cabe holgadamente en CPU y en dispositivos moviles.
- **Opciones de despliegue**: Text Generation Inference (etiqueta del repositorio), endpoints compatibles con la API de HuggingFace, FriendliAI y, previa conversion a GGUF, llama.cpp u Ollama. El repositorio no incluye pesos GGUF.
- **Latencia y throughput estimados**: no disponible. A 39 M de parametros se espera una generacion muy rapida en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 (este) | 39,09 M | no disponible | no disponible | safetensors | 0 descargas |
| goldfish-models/nor_latn_10mb (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455 | no disponible | no disponible | no disponible | safetensors | variante en ingles del mismo experimento |
| fpadovani/ind-latn-10mb-ppt-Dp-100mb_seed455 | no disponible | no disponible | no disponible | safetensors | variante en indonesio, misma semilla |
| fpadovani/nld-latn-10mb-ppt-Dp-100mb_seed455 | ~39,1 M | no disponible | no disponible | no disponible | variante en neerlandes, misma semilla |

No se dispone de comparativas con modelos de referencia como GPT-2 small (124 M) en cuanto a benchmarks, ya que no se han publicado evaluaciones de este checkpoint.

## Limitaciones y advertencias

- **Licencia sin definir**: la model card incluye `licence: license` sin especificar terminos. Sin una licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion.
- **Sin datos de entrenamiento**: no se documenta la composicion del dataset, su procedencia ni su periodo temporal, por lo que los sesgos son imposibles de auditar; es probable que reproduzca sesgos del corpus noruego subyacente.
- **Riesgo de alucinacion elevado**: con 39 M de parametros y un corpus de entrenamiento muy reducido, la generacion carece de conocimiento factual fiable y produce texto plausible pero no verificado.
- **Sin evaluacion**: no hay benchmarks publicados, ni evaluacion de terceros, ni descargas que permitan validacion de la comunidad.
- **Contexto e idioma no confirmados**: no se especifica la longitud de ventana ni la lista de idiomas soportados; el uso fuera del noruego escrito en alfabeto latino no esta respaldado por la documentacion.
- **Model card auto-generada**: el texto procede de la plantilla de TRL, sin informacion sobre hiperparametros, curvas de perdida ni criterios de parada.
- **Fecha de creacion anomala**: los metadatos indican 2026-09-23, posterior a la mayoria de publicaciones del ecosistema, lo que sugiere un artefacto de registro.
- **No apto para produccion**: sin garantias de calidad, soporte ni mantenimiento, y con 0 descargas y 0 interacciones registradas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nor-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Modelo base: https://huggingface.co/goldfish-models/nor_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/l6qha93s
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en ingles (mismo experimento): https://friendli.ai/models/francesca9805/eng-latn-10mb-ppt-Dp-100mb-packed-bfd_seed455
- Variante en indonesio, semilla 455: https://huggingface.co/fpadovani/ind-latn-10mb-ppt-Dp-100mb_seed455/blob/main/model.safetensors
- Variante en neerlandes en LLM Explorer: https://llm-explorer.com/model/fpadovani%2Fnld-latn-10mb-ppt-Dp-100mb_seed455,3oHjl5GZGfbeJqghxz6fDk
