# francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed455

## Resumen

El modelo `francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed455` es un ajuste fino (SFT) del modelo monolingue `goldfish-models/eng_latn_100mb`, que a su vez pertenece a la familia Goldfish de modelos tipo GPT-2 entrenados con volúmenes reducidos de datos por idioma. Cuenta con 86.508.288 parametros y se distribuye en formato safetensors bajo la libreria `transformers`, con pipeline de `text-generation`.

Lo publica el usuario `francesca9805` y el entrenamiento se realizo con TRL 0.23.0 sobre Transformers 4.56.2 y PyTorch 2.5.1+cu121, registrandose la ejecucion en un proyecto de Weights & Biases llamado `new-tokenizers`. Ese detalle, junto con los componentes del nombre (`uniform`, `newlex`, `packed`, `seed455`), sugiere que se trata de un artefacto de experimentacion con tokenizadores y semillas aleatorias mas que de un modelo pensado para produccion.

Su relevancia es, por tanto, acotada y de caracter metodologico: sirve como punto de comparacion reproducible dentro de una bateria de experimentos, no como un asistente de proposito general. La model card no documenta licencia, idiomas, composicion del dataset ni resultados de evaluacion, y el repositorio acumula 0 descargas y 0 "likes", lo que refuerza su naturaleza de experimento interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (segun tag `gpt2`) |
| Parametros totales | 86.508.288 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; solo se publican pesos safetensors, sin versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (el modelo base es `eng_latn`, ingles; el nombre incluye `nld`, pero no hay confirmacion) |
| Licencia | no disponible (la model card incluye unicamente el marcador `licence: license`) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,2 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2 con 86.508.288 parametros, es decir, un modelo de escala muy reducida (por debajo de GPT-2 small, que tiene 124 millones). El punto de partida es `goldfish-models/eng_latn_100mb`, un modelo monolingue de la familia Goldfish entrenado sobre aproximadamente 100 MB de texto en ingles (`eng_latn`). El ajuste se realizo mediante SFT con TRL 0.23.0; no hay evidencia en la informacion disponible de que se aplicaran tecnicas de RLHF, DPO u otro tipo de alineamiento posterior.

Los hiperparametros de entrenamiento, el numero de tokens vistos, la composicion del dataset de ajuste y la configuracion exacta de la arquitectura (numero de capas, dimension oculta, cabezas de atencion, tamano de vocabulario) no se documentan en la model card. La referencia a un proyecto de W&B denominado `new-tokenizers` y los segmentos del nombre (`uniform`, `newlex`, `packed`, `bfdiso`, `seed455`) apuntan a un estudio sistematico sobre tokenizadores, empaquetado de secuencias y variabilidad entre semillas, pero se trata de una inferencia a partir de la nomenclatura, no de un dato confirmado por el autor.

## Capacidades

- Generacion de texto autoregresiva basica, en el rango esperable para un modelo de 86 millones de parametros.
- Soporte del pipeline `text-generation` de Transformers, incluido el formato conversacional de mensajes (`[{"role": "user", "content": ...}]`) que aparece en el ejemplo de la model card.
- Compatibilidad declarada con Text Generation Inference y con endpoints (`text-generation-inference`, `endpoints_compatible`).
- Capacidad multilingue: no documentada; el modelo base esta entrenado en ingles y no hay confirmacion de soporte para neerlandes pese al sufijo `nld` del nombre.
- Tool calling / function calling: no disponible, sin evidencia de soporte.
- Uso agentico y razonamiento multi-paso: no disponible, sin evidencia de soporte.
- Modo "thinking", vision, audio o cualquier modalidad adicional: no disponible.
- Ajuste especifico para dialogos o instrucciones: no documentado; el tag `sft` indica ajuste supervisado, pero no se detalla el formato de las instrucciones.

## Casos de uso

- Comparacion controlada de tokenizadores: el modelo forma parte de una serie con nombres como `ppt-wc-uniform-newlex-*-100mb-packed-*-seed*`; se puede usar para medir el impacto de distintas estrategias de tokenizacion manteniendo fijo el resto de la receta.
- Estudio de varianza entre semillas: al existir variantes con `seed10`, `seed3407` y `seed455`, permite cuantificar cuanto cambia la perplexity o la calidad de generacion segun la semilla inicial en entrenamientos de bajos recursos.
- Validacion de infraestructura de despliegue: gracias a sus 0,2 GB de pesos y al tag `endpoints_compatible`, sirve para probar pipelines de TGI, contenedores de inferencia o integraciones de API antes de desplegar modelos grandes, con un coste de recursos minimo.
- Generacion de texto en dispositivos sin GPU: con unos 173 MB en bf16 o fp16 y alrededor de 87 MB en int8, cabe en CPU, en Raspberry Pi o en entornos embebidos, util para demos offline.
- Docencia y talleres de ajuste fino: es un caso practico de SFT con TRL sobre un modelo pequeno, adecuado para ilustrar el flujo completo de entrenamiento y publicacion en HuggingFace sin requerir hardware especializado.
- Investigacion sobre modelos de bajos recursos: permite analizar que tipo de fluidez y de cobertura lexica se alcanza entrenando solo con 100 MB de texto, y como se degrada al ajustar con SFT sobre esa base.
- Generacion de texto sintetico para prototipos: puede emplearse para poblar maquetas o tests de integracion donde no importa la calidad del contenido, siempre que la salida pase por revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra evaluacion, y los resultados de busqueda consultados no aportan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 346 MB en fp32, 173 MB en fp16/bf16 y 87 MB en int8 (calculado a partir de los 86.508.288 parametros; las cifras reales dependen del framework y del overhead).
- GPU recomendadas: cualquier GPU consumer o profesional sirve; el modelo es enormemente sobredimensionado para una RTX 4090, una A100 o una H100, que quedarian infrautilizadas.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 1 GB de VRAM, incluidas integradas modestas, e incluso puede ejecutarse en CPU.
- Opciones de despliegue: pipeline de `transformers` (documentado por el autor), vLLM y TGI (el tag `text-generation-inference` lo sugiere), y llama.cpp u Ollama si se convierte previamente a GGUF, conversion que no se distribuye.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed455` | 86.508.288 | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| `goldfish-models/eng_latn_100mb` (modelo base) | no disponible (misma familia y presupuesto de datos de 100 MB) | no disponible | ingles (`eng_latn`) | no disponible en la informacion consultada | HuggingFace |
| Variantes del mismo autor (`*-nor-*`, `*-isl-*`, `*-arb-*` con semillas 10, 3407, etc.) | no disponibles | no disponibles | no disponibles | no disponibles | HuggingFace y espejos como llm-explorer o FriendliAI |
| GPT-2 small (`openai-community/gpt2`) | 124 millones | 1.024 tokens | ingles | licencia MIT | HuggingFace, ampliamente desplegado |

La comparacion con GPT-2 small es orientativa: comparten arquitectura y orden de magnitud, pero GPT-2 small fue entrenado con un volumen de datos muy superiora los 100 MB del modelo base Goldfish, por lo que no cabe esperar un rendimiento equiparable. No se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Escala muy reducida: 86,5 millones de parametros implican una capacidad limitada de razonamiento, coherencia a largo plazo y conocimiento factual.
- Riesgo alto de alucinacion: al estar entrenado sobre aproximadamente 100 MB de texto, la cobertura factica es minima y las afirmaciones generadas no son fiables sin verificacion externa.
- Sesgos conocidos: no documentados por el autor; cualquier sesgo presente en los 100 MB del corpus base se hereda sin mitigacion declarada.
- Ambiguedad idiomatica: el nombre incluye `nld` (neerlandes) pero el modelo base es `eng_latn` (ingles); no hay confirmacion de que el modelo funcione en neerlandes.
- Longitud de contexto desconocida: no se documenta la ventana maxima, lo que impide planificar tareas que dependan de contexto largo.
- Licencia no disponible: la model card contiene un marcador generico (`licence: license`) sin texto legal, por lo que no se puede confirmar que el uso comercial este permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Madurez nula como artefacto: 0 descargas, 0 "likes", sin evaluaciones publicadas y sin documentacion de hiperparametros; no es un modelo apto para produccion.
- Ausencia de versiones cuantizadas listas para usar: para llama.cpp u Ollama habria que generar el GGUF a partir de los safetensors.
- Trazabilidad limitada: no se especifica el dataset de ajuste, el numero de pasos ni el regimen de aprendizaje, lo que dificulta reproducir los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nld-before-100mb-packed-bfdiso_seed455
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/z7fa13ju
- Repositorio de TRL: https://github.com/huggingface/trl
- Variante hermana (noruego, semilla 10): https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed10
- Variante hermana (noruego, semilla 3407): https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-nor-before-100mb-packed-bfd_seed3407
- Variante hermana (islandes, semilla 10) en FriendliAI: https://friendli.ai/models/francesca9805/ppt-wc-uniform-newlex-isl-before-100mb-packed-bfd_seed10
- Variante hermana (arabe, semilla 10) en free2aitools: https://free2aitools.com/model/francesca9805/ppt-wc-uniform-newlex-arb-before-100mb-packed-bfd_seed10
- Variante relacionada (neerlandes, 100mb, semilla 455) en llm-explorer: https://llm-explorer.com/model/fpadovani%2Fppt-wc-uniform-newlex-nld-100mb_seed455,7gXE9jhVoWZFZsosJUKw99
