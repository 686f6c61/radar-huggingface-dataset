# francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed10

## Resumen

`francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed10` es un ajuste fino de tipo SFT sobre el modelo base monolingue `goldfish-models/eng_latn_100mb`. Lo publica el usuario de HuggingFace `francesca9805` (el enlace de seguimiento de experimentos apunta a la Universidad de Groningen) y forma parte de una familia de variantes con nomenclatura muy sistematica: mismo prefijo `ppt-wc-uniform-newlex`, distintos idiomas (`nld`, `nor`, `eng`), distintos presupuestos de datos (`before-100mb`) y distintas semillas (`seed10`, `seed455`). Es, por tanto, un artefacto de investigacion reproducible, no un modelo orientado a producto.

El modelo tiene 86.508.288 parametros reales declarados en los pesos safetensors y etiqueta de arquitectura `gpt2`, lo que lo situa en la categoria de los transformers decoder-only pequenos (por debajo de GPT-2 small, que ronda los 124M). El repositorio ocupa 0,2 GB y se distribuye unicamente en safetensors; no hay versiones GGUF ni cuantizadas publicadas.

Su relevancia es acotada y muy especifica: sirve para estudiar como afectan el tokenizador, la composicion del corpus y el ajuste supervisado en regimenes de pocos datos (100 MB) y en modelos diminutos. No hay model card sustantiva, no se declaran idiomas, licencia ni contexto, y no se han publicado benchmarks. Cualquier uso en produccion deberia tratarse como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (decoder-only transformer; segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 86.508.288 (dato real de los pesos safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos safetensors; no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible (el sufijo `nld` del nombre sugiere neerlandes, pero no se confirma en los metadatos ni en la model card) |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |
| Modelo base | goldfish-models/eng_latn_100mb |
| Libreria | transformers |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion / actualizacion | 2026-09-30 / 2026-09-30 |

## Arquitectura y entrenamiento

La arquitectura declarada es GPT-2, es decir, un transformer decoder-only con atencion causal completa y normalizacion pre-LayerNorm. Con 86,5M de parametros, el modelo es mas pequeno que GPT-2 small (124M) y del mismo orden que el modelo base del que parte, `goldfish-models/eng_latn_100mb`. Ese modelo base pertenece a la familia Goldfish, una coleccion de modelos monolingues entrenados con unos 100 MB de texto por idioma y pensada para evaluacion multilingue en regimen de bajos recursos; los detalles concretos de vocabulario, numero de capas y dimension del modelo base no se detallan en la informacion disponible.

El entrenamiento se realizo con SFT (supervised fine-tuning) utilizando TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la funcion de perdida ni si hubo etapas posteriores de alineamiento (RLHF, DPO). Tampoco se documenta ninguna innovacion tecnica: no hay decodificacion especulativa, atencion lineal ni mecanismos hibridos. El unico rastro reproducible es un enlace a un experimento de Weights & Biases dentro del proyecto "new-tokenizers", lo que sugiere que el eje del trabajo es la comparacion de tokenizadores.

## Capacidades

- Generacion de texto autoregresiva mediante `pipeline("text-generation")`, con soporte de conversaciones con roles (`{"role": "user", "content": ...}`) en el ejemplo de uso publicado.
- Instruccion basica tras SFT: el ejemplo de la model card plantea una pregunta abierta y espera una respuesta generada, no solo una continuacion de texto.
- Capacidad multilingue: no confirmada. El nombre del modelo apunta a neerlandes (`nld`) y existe una variante noruega (`nor`) y otra inglesa (`eng`) en la misma familia, pero los idiomas no se declaran en los metadatos.
- Razonamiento complejo, matematicas, codigo y vision: no disponibles; el tamano del modelo (86,5M) y la ausencia de datos lo hacen improbable.
- Tool calling / function calling: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking" o cualquier capacidad especial: no disponible.
- Compatibilidad declarada con Text Generation Inference (TGI) y con endpoints, segun las etiquetas del repositorio.

## Casos de uso

- Investigacion sobre tokenizadores: el proyecto del que procede (denominado "new-tokenizers" en el enlace de Weights & Biases) permite usar este modelo como punto de comparacion controlado para medir como un tokenizador nuevo afecta a la generacion de texto en un corpus de 100 MB.
- Estudios de ablacion sobre presupuesto de datos: con la variante `before-100mb` y las distintas semillas (`seed10`, `seed455`), se puede cuantificar la varianza entre inicializaciones en un ajuste SFT de bajos recursos.
- Analisis de sesgo y fidelidad en corpus pequenos: al estar entrenado sobre un volumen de datos muy reducido, es un caso de estudio util para medir la degradacion de la coherencia y el aumento de la alucinacion cuando se disminuye el corpus.
- Docencia y practicas de ajuste fino: el modelo completo ocupa 0,2 GB en safetensors, por lo que puede ajustarse o inferirse en una unica GPU de consumo o incluso en CPU, lo que lo hace apto para cursos de NLP donde el alumnado debe reproducir el pipeline completo con TRL.
- Generacion de texto de baja latencia en prototipos: 86,5M de parametros permiten respuestas en pocos milisegundos por token en GPU moderna, suficiente para maquetar demos, pruebas de interfaz o sistemas de generacion de borradores sin coste de API.
- Aumentacion de datos experimental: puede emplearse para generar continuaciones de texto de dominio especifico que despues se filtren manualmente, siempre que el idioma de destino coincida con el del ajuste y se asuma una calidad limitada.
- Despliegue en el borde (edge): en cuantizacion INT8 ocupa del orden de 87 MB, lo que abre la puerta a pruebas en dispositivos con memoria muy restringida donde no cabe ningun modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra metrica, y las busquedas web solo devuelven registros de directorios de modelos (free2aitools, FriendliAI, llm-explorer) sin cifras.

## Requisitos de hardware

- VRAM estimada en inferencia, calculada a partir de los 86.508.288 parametros declarados:
  - FP32: aproximadamente 346 MB solo de pesos.
  - FP16 / BF16: aproximadamente 173 MB.
  - INT8: aproximadamente 87 MB.
  - INT4: aproximadamente 43 MB.
  - A estas cifras hay que sumar el cache KV y las activaciones, que en un modelo de esta profundidad son del orden de decenas de MB con lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre. Una RTX 3060, RTX 4090, T4, A100 o H100 lo ejecutan sin ninguna restriccion; la eleccion dependera del throughput agregado, no de la memoria.
- Cabe holgadamente en GPU de consumo (GTX 1050 Ti en adelante, iGPU con memoria compartida suficiente) y tambien en CPU en FP32, con latencias de decenas de milisegundos por token.
- Opciones de despliegue: `transformers` con `pipeline`, Text Generation Inference (etiqueta oficial del repositorio), vLLM, FriendliAI y cualquier endpoint compatible con la API de inferencia de HuggingFace. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, algo que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed10` | 86,5M | no disponible | no disponible | safetensors | Objeto de esta ficha |
| `goldfish-models/eng_latn_100mb` | no disponible (mismo orden, ~86M) | no disponible | no disponible | safetensors | Modelo base; monolingue en ingles, entrenado sobre 100 MB de texto |
| `fpadovani/ppt-wc-uniform-newlex-eng-100mb_seed10` | no disponible (misma familia) | no disponible | no disponible | safetensors | Variante en ingles del mismo experimento, con semilla 10 |
| `francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed10` | no disponible (misma familia) | no disponible | no disponible | safetensors | Variante en noruego; difiere en el sufijo `bfd` frente a `bfdiso` |
| GPT-2 small (referencia externa) | 124M | 1024 tokens | MIT modificada | safetensors / GGUF | Referencia de la misma arquitectura y orden de magnitud, ampliamente disponible en formatos cuantizados |

No hay datos de rendimiento publicados para ninguno de los modelos de esta familia, por lo que la comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, idiomas, contexto ni limitaciones conocidas.
- Licencia sin definir: el campo `licence: license` de la model card es un marcador de posicion. No se puede asumir uso comercial libre; hay que contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de alucinacion elevado: con 86,5M de parametros y un presupuesto de datos de 100 MB, la fidelidad factica y la coherencia a partir de unos cientos de tokens seran limitadas.
- Idiomas no declarados: el sufijo `nld` sugiere neerlandes, pero si el ajuste se hizo sobre el modelo base `eng_latn_100mb` (monolingue en ingles), el comportamiento real del idioma de destino es incierto y habria que verificarlo empiricamente.
- Sin benchmarks: no existe ninguna evidencia publicada de calidad, por lo que no se puede afirmar que supere a su modelo base ni a alternativas del mismo tamano.
- Ventana de contexto desconocida: conviene no asumir mas de 1024 tokens, valor habitual de la familia GPT-2, hasta verificarlo con el `config.json`.
- Sin versiones cuantizadas publicadas: el despliegue en llama.cpp, Ollama o GPUs con menos de 1 GB de VRAM exigiria conversion manual a GGUF o cuantizacion propia.
- Cero descargas y cero likes en el momento del registro: no hay comunidad que haya validado el modelo ni reportado fallos.
- Sesgos: no evaluados. Al provenir de un corpus reducido y no filtrado, es probable que reproduzca sesgos presentes en esa muestra, sin ninguna capa de alineamiento documentada.
- No apto para produccion sin una evaluacion propia exhaustiva: el pipeline declarado (`text-generation`) y las etiquetas (`sft`, `generated_from_trainer`) lo situan como artefacto de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Experimento de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/o6dvkd9c
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante en noruego, semilla 10: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed10
- Variante en noruego, semilla 455: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed455
- Variante en ingles, semilla 10 (listado en llm-explorer): https://llm-explorer.com/model/fpadovani%2Fppt-wc-uniform-newlex-eng-100mb_seed10,1K06P9PGxVAOAjsrJQYg3V
- Registro en free2aitools: https://free2aitools.com/model/francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfd_seed10
- Pagina de despliegue en FriendliAI: https://friendli.ai/models/francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfd_seed10
