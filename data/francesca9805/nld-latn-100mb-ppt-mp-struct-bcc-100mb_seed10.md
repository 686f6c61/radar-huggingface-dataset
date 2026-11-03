# francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed10

## Resumen

`nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed10` es un ajuste fino (SFT) del modelo base `goldfish-models/nld_latn_100mb`, un transformer de tipo GPT-2 con aproximadamente 124,7 millones de parametros orientado a la generacion de texto en neerlandes (codigo ISO `nld`, script `latn`). Lo desarrolla el usuario de HuggingFace `francesca9805`, vinculado a la Universidad de Groninga segun la traza de Weights & Biases incluida en la model card, y forma parte de una familia de experimentos de tokenizacion y ajuste supervisado sobre modelos pequenos de la serie Goldfish.

El interes del modelo no reside en su rendimiento bruto, sino en su caracter experimental: el nombre codifica variables del pipeline (porcentaje del corpus, estrategia de tokenizacion, estructura del dataset y semilla), lo que lo convierte en una pieza util para estudiar como afectan esas decisiones al comportamiento de un modelo de 100 MB entrenado sobre un subconjunto del corpus BCC (Brigham Young University Corpus of Contemporary American English, en su variante multilingue). Es, por tanto, un modelo de investigacion mas que un modelo de produccion.

Con 124,7 millones de parametros, licencia no declarada y solo 25 descargas en el momento de redactar esta ficha, debe tratarse como un artefacto academico reproducible, no como una alternativa a modelos generativos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (segun tag `gpt2`) |
| Parametros totales | 124.770.816 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | neerlandes (`nld`, script `latn`) segun el identificador del modelo; no declarado formalmente en la model card |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |
| Framework de entrenamiento | TRL 0.23.0 (SFT) |
| Modelo base | goldfish-models/nld_latn_100mb |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por aprendizaje supervisado (SFT) del checkpoint `goldfish-models/nld_latn_100mb`, que pertenece a la familia Goldfish de modelos pequenos mono-idioma entrenados por el grupo de investigacion de la Universidad de Groninga. La arquitectura subyacente es un transformer decoder-only con la configuracion tipica de GPT-2 (atencion causal, embeddings posicionales aprendidos), escalada a unos 124,7 millones de parametros. No se documenta en la model card ni el numero de capas, ni la dimension oculta, ni el numero de cabezas de atencion, ni la longitud de contexto nativa.

El entrenamiento se realizo con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0 y Datasets 4.8.4, con un run de Weights & Biases registrado en el proyecto `new-tokenizers` del espacio de trabajo `f-padovani-university-of-groningen`. El identificador del modelo sugiere un experimento factorial: `100mb` (tamano del corpus de entrenamiento), `ppt` y `mp` (posiblemente variantes de tokenizacion o de preprocesado), `struct` (estructura del dataset), `bcc-100mb` (corpus de origen) y `seed10` (semilla aleatoria). No se especifican en la model card el numero de tokens vistos, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto autoregresiva en neerlandes, condicionada por un prompt de usuario en formato de chat (`[{"role": "user", "content": ...}]`).
- Ajuste supervisado sobre instrucciones, segun el tag `sft` y el ejemplo de `pipeline` de la model card.
- Compatible con `text-generation-inference` y con la API de endpoints de HuggingFace (tags `text-generation-inference` y `endpoints_compatible`).
- Integracion directa con `transformers.pipeline("text-generation", ...)`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al neerlandes por diseno del modelo base; no se declaran otros idiomas.

## Casos de uso

- **Investigacion sobre tokenizacion y preprocesado**: el modelo sirve como punto de comparacion en estudios que miden el efecto de distintas estrategias de tokenizacion (`ppt`, `mp`) sobre la calidad de generacion en modelos de ~100 MB. Se usaria junto a los demas checkpoints de la misma serie, manteniendo constante el resto de variables.
- **Reproducibilidad de experimentos academicos**: al estar entrenado con versiones fijas de TRL, Transformers y PyTorch, y con un run de W&B publico, permite replicar el ajuste SFT sobre `goldfish-models/nld_latn_100mb` con la semilla `seed10`.
- **Generacion de texto neerlandes de bajo coste**: para tareas de relleno, completado de frases o generacion de variantes en un corpus neerlandes donde no se requiere alta calidad y se prioriza el coste computacional (inferencia en CPU o en GPU de gama baja).
- **Prototipado rapido de pipelines de SFT**: sirve como banco de pruebas para validar flujos de entrenamiento con TRL antes de escalar a modelos mayores, dado su tamano reducido (0,5 GB) y su rapida iteracion.
- **Aumento de datos sinteticos controlado**: generacion de ejemplos de texto en neerlandes para aumentar corpus de entrenamiento de modelos mayores, aceptando la baja calidad esperable de un modelo de 124 M de parametros.
- **Evaluacion de sesgos y calidad en modelos pequenos**: util como linea base para medir hasta que punto un modelo de 100 MB entrenado sobre BCC reproduce sesgos del corpus o genera alucinaciones, en estudios comparativos con modelos mas grandes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: en fp32, los 124,7 M de parametros ocupan aproximadamente 500 MB; en fp16, unos 250 MB; en int8, unos 125 MB. El repositorio ocupa 0,5 GB, consistente con pesos en fp32.
- **GPU recomendadas**: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente (GTX 1050 Ti, RTX 2060, RTX 3060, RTX 4090). Tambien puede ejecutarse en CPU con latencia aceptable para generacion de pocos tokens.
- **Cabe en consumer GPU**: si, en practicamente cualquier GPU moderna, e incluso en Raspberry Pi o dispositivos edge con cuantizacion.
- **Opciones de despliegue**: `transformers` (pipeline nativo), `text-generation-inference` (soportado por tags), endpoints de HuggingFace. No se publican pesos GGUF, por lo que `llama.cpp` u `Ollama` requeririan conversion manual.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada. Por el tamano, se espera un throughput alto (cientos de tokens por segundo en GPU moderna) y latencia de decenas de milisegundos por token, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed10` | 124,7 M | no disponible | neerlandes | no disponible | HuggingFace (25 descargas) |
| `goldfish-models/nld_latn_100mb` (modelo base) | ~100 M (segun nombre) | no disponible | neerlandes | no disponible | HuggingFace |
| Otros checkpoints de la serie Goldfish (p. ej. `goldfish-models/eng_latn_100mb`) | ~100 M | no disponible | un idioma por checkpoint | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparacion se limita a parametros, idioma y disponibilidad.

## Limitaciones y advertencias

- **Licencia no declarada**: la model card incluye un campo `licence: license` sin contenido, por lo que no se puede confirmar el uso comercial. Antes de cualquier despliegue en produccion debe contactarse con el autor.
- **Modelo de investigacion**: con 124,7 M de parametros y entrenado sobre un corpus de 100 MB, la calidad de generacion sera limitada y propensa a incoherencias, repeticiones y alucinaciones.
- **Idioma unico**: disenado para neerlandes; no se garantiza un comportamiento correcto en otros idiomas.
- **Contexto no documentado**: se desconoce la longitud de contexto nativa, lo que impide planificar conversaciones multi-turno largas.
- **Sin datos de benchmarks**: no hay evidencia publicada de rendimiento en MMLU, HumanEval, GSM8K ni tareas similares.
- **Sesgos del corpus BCC**: al entrenarse sobre un subconjunto del corpus BCC, puede heredar sesgos de dominio, registro y epoca de dicho corpus.
- **Sin garantias de soporte**: autor unico, sin issues documentadas ni mantenimiento declarado; la fecha de actualizacion (noviembre de 2026) no implica soporte activo.
- **Formato de chat asumido**: el ejemplo de la model card usa formato de roles, pero no se documenta la plantilla de chat exacta, lo que puede provocar comportamientos inconsistentes si se usa otra.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/nld-latn-100mb-ppt-mp-struct-bcc-100mb_seed10
- Modelo base: https://huggingface.co/goldfish-models/nld_latn_100mb
- Run de Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/dgqye9ie
- Repositorio TRL: https://github.com/huggingface/trl
