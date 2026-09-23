# francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed3407

## Resumen

El modelo `ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed3407` es un ajuste fino (SFT) del checkpoint `goldfish-models/eng_latn_100mb`, publicado por el usuario de HuggingFace `francesca9805`, que corresponde al entorno de investigación de Francesca Padovani en la Universidad de Groningen (los registros de entrenamiento apuntan a la organización `f-padovani-university-of-groningen` en Weights & Biases). Se trata de un transformer decoder-only de tipo GPT-2 con 86.508.288 parámetros (86,5 M) y pesos en safetensors, entrenado mediante TRL 0.23.0 sobre el framework Transformers 4.56.2.

El modelo pertenece a una familia de experimentos de escalado controlado sobre presupuestos de datos muy reducidos (100 MB) y variantes de tokenizador, tal como refleja su propio nombre (uniform, newlex, packed, seed3407). No es, por tanto, un modelo pensado para producción ni un asistente conversacional afinado con preferencias humanas, sino un artefacto de investigación para estudiar cómo afectan las decisiones de tokenización, el empaquetado de secuencias y la semilla aleatoria al rendimiento de modelos pequeños.

Su relevancia es metodológica: sirve como punto de comparación reproducible dentro de una batería de ablaciones, y por su tamaño (0,3 GB de repositorio) puede ejecutarse en CPU o en cualquier GPU de consumo sin apenas requisitos. El autor no ha publicado resultados de benchmarks, licencia explícita ni idiomas soportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` y `transformers`) |
| Parametros totales | 86.508.288 (86,5 M), dato real de los safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponibles en la model card; al distribuirse en safetensors es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0, etc.) con llama.cpp |
| Idiomas soportados | no disponible; el modelo base `goldfish-models/eng_latn_100mb` está entrenado sobre inglés (código `eng_latn`) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2: un transformer decoder-only con atención causal completa, normalización por capas y embeddings de tokens atados a la capa de salida. La etiqueta `gpt2` del repositorio y la herencia declarada de `goldfish-models/eng_latn_100mb` confirman esta familia, mientras que el recuento real de 86,5 M de parámetros indica una configuración reducida respecto al GPT-2 small canónico (124 M), presumiblemente por un vocabulario o un número de capas distinto. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas ni el tamaño del vocabulario, por lo que estos datos figuran como no disponibles.

El entrenamiento se realizó con SFT mediante la librería TRL en su versión 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. No se documenta el volumen de tokens de instrucciones, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO: la model card solo indica "This model was trained with SFT". El nombre del checkpoint codifica las variables del experimento (tokenizador "newlex", partición "uniform", presupuesto de 100 MB, secuencias "packed" y semilla 3407), pero la documentación no describe esa metodología, de modo que cualquier interpretación de esas siglas es inferencia y no dato verificado. El run de entrenamiento está registrado públicamente en Weights & Biases.

## Capacidades

- Generacion de texto autoregresiva basica, en la linea de un GPT-2 pequeno afinado con SFT.
- Respuesta a indicaciones en formato conversacional de un solo turno: el ejemplo oficial de la model card usa `pipeline("text-generation")` con una lista de mensajes `[{"role": "user", "content": ...}]`.
- Capacidad limitada de seguir instrucciones, derivada exclusivamente del ajuste SFT; no hay evidencia publicada de un alineamiento mas fuerte.
- No hay soporte documentado de tool calling ni function calling.
- No hay soporte documentado de agentes, razonamiento multi-paso ni modos de pensamiento (thinking mode).
- No hay soporte documentado de vision, audio ni multimodalidad.
- Multilingue: no acreditado; el modelo base esta entrenado sobre ingles (`eng_latn`) y la model card no declara lista de idiomas.
- Capacidad de razonamiento, matematicas y codigo: no evaluada ni documentada en la informacion disponible.

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el checkpoint forma parte de una serie de ablaciones sobre presupuestos de 100 MB, semillas y vocabularios distintos, de modo que sirve para replicar o auditar comparaciones entre variantes como `ppt-wc-uniform-newlex-eng-100mb_seed3407` o `ppt-wc-uniform-newlex-nld-100mb_seed10`.
- Prototipado local en CPU: con 86,5 M de parametros y 0,3 GB de repositorio, permite montar un pipeline de generacion de texto en un portatil sin GPU para validar código de preprocesado, tokenizacion y decodificacion antes de escalar a modelos mayores.
- Pruebas de infraestructura de despliegue: al declarar compatibilidad con `text-generation-inference` y `endpoints_compatible`, es util como carga ligera para verificar configuraciones de TGI, FriendliAI o vLLM sin consumir GPU cara.
- Base para ajuste fino posterior en dominio concreto: al ser un modelo de 86,5 M, un fine-tuning adicional sobre un corpus especializado (legal, medico, tecnico) cabe en una sola GPU de consumo e incluso en CPU con paciencia.
- Generacion de datos sinteticos de relleno para tests: util para poblar entornos de prueba, fixtures de integracion continua o maquetas de interfaces que necesitan texto generado sin coste de API.
- Docencia e investigacion academica en PLN: idoneo para que estudiantes experimenten con ciclos completos de preentrenamiento, SFT y evaluacion con un coste computacional minimo.
- Analisis de sensibilidad a la semilla: dado que el identificador incluye `seed3407`, encaja en estudios sobre varianza entre ejecuciones en regimen de datos escasos.
- Despliegue en hardware embebido: por su huella de memoria, es candidato para demos en Raspberry Pi o dispositivos con pocos cientos de MB de RAM tras convertir los pesos a GGUF cuantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y la busqueda web no aporta cifras para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): aproximadamente 0,35 GB en fp32, 0,17 GB en fp16/bf16, 0,09 GB en int8 y 0,05 GB en cuantizacion de 4 bits. Sumando cache KV y activaciones, el consumo realista se mantiene por debajo de 1 GB en la mayoria de configuraciones.
- GPU recomendadas: no requiere GPU dedicada. Funciona en cualquier GPU NVIDIA desde una GTX 1050 en adelante, asi como en RTX 3060, RTX 4090, A100 o H100, donde el cuello de botella sera la sobrecarga del runtime, no la computacion.
- GPU de consumo: si cabe, y con margen amplio, en todas las GPU de consumo actuales, en iGPU y en aceleradores integrados.
- CPU: es viable en CPU exclusivamente; el modelo entra en la cache L3 de muchos procesadores modernos. Tambien es ejecutable en placas tipo Raspberry Pi 4/5.
- Opciones de despliegue: Transformers (via `pipeline`), Text Generation Inference (el repositorio esta etiquetado como `text-generation-inference` y `endpoints_compatible`), vLLM y, previa conversion a GGUF, llama.cpp y Ollama. FriendliAI ofrece despliegue gestionado para checkpoints de la misma serie.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia para este checkpoint.
- Memoria en disco: 0,3 GB de repositorio, lo que permite almacenarlo en cualquier entorno, incluidos contenedores efimeros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed3407` | 86,5 M | no disponible | no disponible | HuggingFace (0 descargas, 0 likes) | Checkpoint de investigacion, sin benchmarks publicados |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | HuggingFace | Mismo proyecto, sin ajuste SFT |
| GPT-2 small | 124 M | 1024 tokens | MIT modificada | HuggingFace, ampliamente replicado | Referencia de la arquitectura; mayor numero de parametros |
| DistilGPT-2 | 82 M | 1024 tokens | Apache 2.0 | HuggingFace | Tamano comparable, destilado y con licencia permisiva explicita |
| Pythia-70M | 70 M | 2048 tokens | Apache 2.0 | HuggingFace, EleutherAI | Suite de investigacion con checkpoints intermedios y evaluaciones publicadas |

La comparacion directa de rendimiento no es posible: los modelos GPT-2 small, DistilGPT-2 y Pythia-70M cuentan con evaluaciones publicas y licencias claras, mientras que este checkpoint carece de ambas cosas. Su interes es de trazabilidad experimental dentro de la serie de Padovani, no de competitividad en tareas estandar.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni perplexity, ni evaluaciones cualitativas publicadas; no hay base empirica para afirmar su calidad en ninguna tarea.
- Licencia no disponible: la model card incluye un campo `licence: license` sin texto legal. No se puede asumir uso comercial permitido; conviene contactar con el autor antes de cualquier explotacion.
- Riesgo elevado de alucinacion y de texto incoherente: con 86,5 M de parametros y un presupuesto de datos de 100 MB, la capacidad de mantener coherencia factual o de razonar es estructuralmente limitada.
- Sesgos: al derivar de un corpus ingles de 100 MB no documentado, heredara los sesgos de esa fuente. No se ha realizado ninguna evaluacion de sesgo ni de toxicidad.
- Cobertura idiomatica: el modelo base esta etiquetado como `eng_latn`; el identificador incluye "nor", pero no hay confirmacion de que el checkpoint maneje noruego. El uso en castellano no esta respaldado por ningun dato.
- Contexto limitado: la longitud de contexto no esta declarada, y por herencia de la familia GPT-2 probablemente sea corta (del orden de 1024 tokens), lo que impide tareas de documento largo. Este extremo debe verificarse en el `config.json` antes de disenar un sistema en produccion.
- Instrucciones fragiles: el ajuste SFT se ha realizado sin fases de RLHF o DPO declaradas, por lo que el seguimiento de instrucciones sera inconsistente.
- Cero traccion comunitaria: 0 descargas y 0 likes. No hay issues, discusiones ni validacion independiente que sirvan de red de seguridad.
- Metadatos incompletos: el significado de las siglas del nombre (`ppt`, `wc`, `bfd`, `before`) no se explica en la model card, lo que dificulta interpretar que variable experimental aisla este checkpoint frente a sus hermanos de serie.
- Nomenclatura enganosa: pese a ser un modelo afinado con SFT, su uso razonable en produccion es practicamente nulo; tratarlo como asistente desplegable seria un error de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/c66xnfq0
- Repositorio de TRL: https://github.com/huggingface/trl
- Checkpoint hermano en ingles (mismo autor, cuenta `fpadovani`): https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-eng-100mb_seed3407
- Variante con semilla 99: https://huggingface.co/fpadovani/ppt-wc-uniform-newlex-eng-100mb_seed99/tree/main
- Variante en neerlandes: https://llm-explorer.com/model/fpadovani%2Fppt-wc-uniform-newlex-nld-100mb_seed10,7MVJkjdsqolGTECN6MSPbe
- Ficha de despliegue gestionado en FriendliAI: https://friendli.ai/models/fpadovani/ppt-wc-uniform-newlex-eng-100mb_seed3407
