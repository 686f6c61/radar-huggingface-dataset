# francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed10

## Resumen

rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed10 es un ajuste fino (fine-tune) del modelo monolingüe goldfish-models/rus_cyrl_100mb, publicado por el usuario francesca9805 en HuggingFace. Se trata de un transformer decoder-only de la familia GPT-2 con 124.770.816 parámetros (unos 0,12 mil millones), entrenado mediante SFT (supervised fine-tuning) con la librería TRL 0.23.0 sobre PyTorch 2.5.1+cu121, Transformers 4.56.2 y Datasets 4.8.4.

El nombre del repositorio sugiere un experimento académico centrado en técnicas de empaquetado de datos (data packing; la abreviatura BFD podría corresponder a best-fit decreasing) sobre un subconjunto de 10 MB y una semilla concreta (seed10). El proyecto asociado en Weights & Biases se denomina "new-tokenizers", lo que apunta a un trabajo de investigación sobre tokenización y empaquetado de secuencias más que a un modelo de propósito general. La model card no documenta el dataset de entrenamiento, el número de tokens vistos, la licencia exacta ni los idiomas soportados.

Con cero descargas y cero "likes" en el momento de redactar esta ficha, se trata de un artefacto de investigación reproducible más que de un modelo listo para producción. Su interés es acotado: sirve como ejemplo de ajuste fino de un modelo lingüístico pequeño con TRL y como material para estudiar el efecto de distintas estrategias de empaquetado y semillas en el resultado del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (arquitectura GPT-2, tipicamente 1024 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; sin versiones GGUF, GPTQ o AWQ) |
| Idiomas soportados | no disponible en la model card; por denominacion del modelo base (rus_cyrl_100mb) se presume ruso en escritura cirilica, sin confirmar |
| Licencia | no disponible (la model card indica "licence: license" sin especificar terminos) |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de estilo GPT-2 con 124.770.816 parámetros, heredada del modelo base goldfish-models/rus_cyrl_100mb. Se desconoce el detalle de capas, dimensiones ocultas y vocabulario efectivo, ya que la model card no los especifica. Al estar etiquetado como `gpt2` y `text-generation`, se trata de un modelo autoregresivo de generación de texto sin mecanismos de atención lineal, MoE ni decodificación especulativa documentados.

El entrenamiento se realizó mediante SFT con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1, con una ejecución registrada en Weights & Biases dentro del proyecto "new-tokenizers". No se documentan el volumen de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. El nombre del repositorio apunta a una variante con empaquetado de datos (packed) sobre un subconjunto reducido (10 MB) y una semilla fija (seed10), presumiblemente para comparar configuraciones experimentales.

## Capacidades

- Generacion de texto autoregresiva en el idioma del modelo base (presumiblemente ruso en cirilico).
- Ajuste mediante SFT, con una plantilla de chat utilizada en el ejemplo de la model card (mensajes con rol `user`).
- Inferencia estandar con `transformers` y compatibilidad declarada con Text Generation Inference (etiqueta `text-generation-inference`).
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay confirmacion de capacidades multilingues mas alla del idioma base.
- No dispone de vision, audio ni modo "thinking".

## Casos de uso

- Investigación sobre tokenizacion y empaquetado de datos: el modelo forma parte de un experimento reproducible (proyecto "new-tokenizers") que permite comparar el efecto de distintas estrategias de packing y semillas sobre el resultado de un SFT.
- Reproducibilidad de experimentos de ajuste fino: al estar entrenado con versiones concretas de TRL, Transformers y PyTorch, sirve como referencia para validar pipelines de entrenamiento con esas versiones.
- Prototipado educativo: por su tamano (124M de parametros) puede ejecutarse en cualquier portatil y usarse para demostrar el ciclo completo de fine-tuning y generacion de texto.
- Generacion de texto en ruso a pequena escala: si se confirma el idioma del modelo base, podria emplearse para tareas de completado de texto sencillo, siempre con supervision humana por su tamano reducido.
- Punto de partida para nuevos ajustes finos: al ser un modelo pequeno, es adecuado como base para experimentos adicionales de SFT o LoRA sobre dominios concretos.
- Evaluacion de tecnicas de empaquetado en modelos lingueisticos de bajos recursos: encaja en lineas de investigacion sobre modelos monolingues pequenos (familia goldfish) para lenguas con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y el modelo no cuenta con evaluaciones independientes registradas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 en torno a 0,5 GB; en FP16/BF16 unos 0,25 GB; en int8 cerca de 0,13 GB; en int4 alrededor de 0,06 GB (mas el coste de activaciones y cache KV, marginal para este tamano).
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni similar. Una RTX 3060, RTX 4090 o incluso una GPU integrada pueden ejecutarlo sin problemas.
- Cabe en GPU de consumo: si, en practicamente todas; tambien es viable su ejecucion en CPU.
- Opciones de despliegue: `transformers` (via `pipeline`), Text Generation Inference (etiqueta `endpoints_compatible` / `text-generation-inference`), y potencialmente llama.cpp u Ollama previa conversion a GGUF (no se distribuyen pesos GGUF de serie).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones. Por el tamano del modelo, en GPU moderna el throughput deberia ser alto (del orden de miles de tokens por segundo), pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed10 | 124,77 M | no disponible | sin benchmarks publicados | no disponible | HuggingFace (0 descargas) |
| goldfish-models/rus_cyrl_100mb (modelo base) | 124,77 M aprox. | no disponible | sin datos en esta ficha | no disponible | HuggingFace |
| gpt2 (OpenAI) | 124 M | 1024 tokens | benchmarks publicos disponibles en fuentes externas | MIT | ampliamente disponible |

La comparacion se limita al modelo base y a GPT-2 por ausencia de datos. No se dispone de informacion suficiente para comparar con otras alternativas de la misma categoria.

## Limitaciones y advertencias

- Tamano reducido (124M de parametros): capacidad de razonamiento y conocimiento factual muy limitados en comparacion con modelos actuales.
- Riesgo elevado de alucinacion y de texto incoherente, especialmente fuera del dominio de entrenamiento.
- No se documenta el dataset de entrenamiento, por lo que no es posible evaluar sesgos ni contenido problematico.
- Licencia sin especificar ("licence: license" en la model card): existe riesgo legal para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas soportados sin confirmar; si el modelo base es ruso en cirilico, el rendimiento en castellano u otros idiomas sera previsiblemente malo.
- Longitud de contexto no confirmada; si sigue la arquitectura GPT-2 clasica, estara limitada a unos 1024 tokens.
- Sin evaluaciones publicadas, sin benchmarks y con cero descargas: no hay evidencia externa de su calidad.
- Es un artefacto experimental (nombre con `packed`, `bfd` y `seed10`): puede reproducir una configuracion concreta de investigacion y no estar pensado para uso general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/rus-cyrl-100mb-ppt-Dp-10mb-packed-bfd_seed10
- Modelo base: https://huggingface.co/goldfish-models/rus_cyrl_100mb
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/2h9yxwpu
