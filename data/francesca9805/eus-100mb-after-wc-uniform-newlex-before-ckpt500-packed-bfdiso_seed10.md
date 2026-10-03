# francesca9805/eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10

## Resumen

El modelo `francesca9805/eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10` es un ajuste fino (fine-tune) de tipo SFT sobre el checkpoint `francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfdiso_seed10`, ambos publicados por el usuario de HuggingFace `francesca9805`. Se trata de un modelo pequeño, de arquitectura GPT-2, con 124.770.816 parámetros totales (aproximadamente 125 millones) y un repositorio de solo 0,3 GB en formato `safetensors`. Por su tamano y su pipeline declarado (`text-generation`), encaja en la categoría de modelos ligeros de generacion de texto, ejecutables incluso en CPU o en GPU de gama de entrada.

El interes de esta publicacion no reside en un rendimiento puntero ni en una ventana de contexto ampliada, sino en su caracter experimental: el nombre del modelo y del modelo base apuntan a un pipeline de investigacion sobre tokenizadores y lexicos (`new-tokenizers` es el nombre del proyecto en Weights & Biases), con identificadores que sugieren un entrenamiento sobre aproximadamente 100 MB de texto, con empaquetado de secuencias (`packed`) y una semilla concreta (`seed10`). La inclusion del prefijo `eus` en el nombre es compatible con el codigo ISO 639-3 del euskera, aunque la ficha no declara idiomas soportados y esta interpretacion no puede confirmarse con la informacion disponible.

Es relevante ahora como ejemplo reproducible de ajuste fino con TRL 0.23.0 sobre un modelo base diminuto: sirve para validar recetas de entrenamiento, comparar tokenizadores y como punto de partida para experimentos academicos de bajo coste. No es un modelo destinado a produccion sin una evaluacion previa, dado que no se han publicado benchmarks, licencia ni lista de idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun la etiqueta `gpt2` del repositorio |
| Parametros totales | 124.770.816 (aproximadamente 124,8 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la ficha (la arquitectura GPT-2 estandar usa 1.024 tokens, sin confirmar para este checkpoint) |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; al ser un GPT-2 de 125 M es convertible a int8/int4 y a GGUF) |
| Idiomas soportados | no disponibles (el prefijo `eus` del nombre sugiere euskera, sin confirmacion) |
| Licencia | no disponible (la model card incluye el campo `licence: license`, sin texto de licencia) |
| Formato de pesos | safetensors (libreria `transformers`); repo de 0,3 GB |
| Modelo base | francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfdiso_seed10 |
| Tipo de entrenamiento | SFT (supervised fine-tuning) con TRL |
| Fecha de creacion / actualizacion | 2026-10-02 / 2026-10-02 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia GPT-2, con 124,8 millones de parametros, es decir, practicamente el mismo orden de magnitud que GPT-2 small (124 M). No se documentan innovaciones arquitectonicas: no hay mezcla de expertos, ni atencion lineal, ni decodificacion especulativa, ni modo de razonamiento explicito. La etiqueta `generated_from_trainer` confirma que el modelo se genero con el flujo estandar de `Trainer`/TRL, y la ficha indica explicitamente que el entrenamiento se hizo con SFT mediante TRL. El prompt de ejemplo de la model card usa el formato de chat (`[{"role": "user", "content": ...}]`), lo que sugiere que el ajuste se realizo sobre datos conversacionales o al menos con una plantilla de mensajes.

En cuanto a los datos, la informacion proporcionada no incluye el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. El propio identificador del modelo aporta pistas no confirmadas: `100mb` apunta a un corpus del orden de 100 MB, `newlex` a un lexico o tokenizador nuevo, `packed` al empaquetado de secuencias para maximizar el aprovechamiento de la ventana, `before-ckpt500` a un punto de control intermedio (checkpoint 500) del entrenamiento, `wc-uniform` a un muestreo uniforme y `seed10` a la semilla empleada. El proyecto asociado en Weights & Biases se llama `new-tokenizers`, lo que refuerza la hipotesis de que el objetivo del experimento es comparar tokenizadores o lexicos sobre una misma receta de ajuste fino.

Las versiones de framework declaradas son TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se documentan hiperparametros de entrenamiento (learning rate, batch size, numero de pasos, regimen de precision) en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad confirmada por el pipeline `text-generation`.
- Conversacion con plantilla de mensajes: el ejemplo oficial invoca el pipeline con una lista de mensajes con rol `user`, lo que indica soporte de una plantilla conversacional (no necesariamente optimizada).
- Generacion condicionada por prompt: admite `max_new_tokens` y `return_full_text` como parametros del pipeline.
- Tool calling / function calling: no disponible (no se declara soporte).
- Capacidades de agente o razonamiento multi-paso: no disponibles (no se declaran).
- Capacidades multilingues: no disponibles; la ficha no lista idiomas.
- Vision, audio o modalidades adicionales: no disponibles (modelo exclusivamente de texto).
- Modo de razonamiento explicito (thinking mode): no disponible.
- Contexto largo: no disponible; no hay evidencia de ampliacion mas alla del contexto estandar de GPT-2.

## Casos de uso

- Experimentacion academica sobre tokenizadores: el modelo pertenece a un proyecto cuyo nombre (`new-tokenizers`) apunta a estudiar el efecto de distintos lexicos sobre el ajuste fino. Se usaria como checkpoint de comparacion frente a variantes entrenadas con otros tokenizadores sobre el mismo corpus, midiendo perplejidad y calidad de generacion.
- Reproduccion de recetas de SFT con TRL: al declarar versiones exactas de TRL, Transformers, PyTorch y Datasets, sirve como referencia reproducible para validar pipelines de `SFTTrainer` en modelos pequenos antes de escalar a modelos mayores.
- Generacion de texto sintetico para aumento de datos: con 125 M de parametros puede producir grandes volumenes de texto a bajo coste computacional, util para preentrenar clasificadores o para aumentar datasets en idiomas con pocos recursos, siempre que se filtre la calidad de la salida.
- Prototipado en dispositivo o en el borde (edge): su tamano permite ejecutarlo en CPU, en una Raspberry Pi o en una GPU integrada, de modo que sirve para validar productos de autocompletado o chatbots locales antes de migrar a modelos mayores.
- Pruebas de integracion con Text Generation Inference: la etiqueta `text-generation-inference` y `endpoints_compatible` indican que puede desplegarse en el stack de inferencia de HuggingFace, util para verificar plantillas, limites de tokens y serializacion de mensajes en entornos de staging.
- Docencia y formacion en ajuste fino: al ser un modelo diminuto con pipeline de entrenamiento documentado, es adecuado para talleres donde se ensena a preparar datos, empaquetar secuencias y evaluar un fine-tune en minutos, sin necesidad de GPU de datacenter.
- Investigacion en lenguas minorizadas (si se confirma el euskera): el prefijo `eus` sugiere que el modelo forma parte de una linea de trabajo sobre euskera; se usaria en tareas de generacion asistida o normalizacion de texto en ese idioma tras validar la calidad con hablantes nativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplejidad ni ninguna otra evaluacion, y la busqueda web asociada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- Peso de los parametros en memoria: aproximadamente 499 MB en fp32, 249 MB en fp16/bf16, 125 MB en int8 y unos 62 MB en int4 (calculado a partir de 124.770.816 parametros).
- VRAM estimada para inferencia: por debajo de 1 GB en fp16 incluyendo cache KV y overhead del runtime; en torno a 1,5-2 GB si se trabaja con lotes grandes y secuencias largas en fp32.
- GPU recomendadas: cualquier GPU consumer sirve; una RTX 3060, RTX 4090 o incluso una GTX 1650 son mas que suficientes. En el extremo profesional, A100 o H100 estarian completamente infrautilizadas para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas e integradas modernas, y tambien en CPU sin GPU (la generacion sera mas lenta, pero funcional).
- Opciones de despliegue: `transformers` (confirmado en la model card), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM (la arquitectura GPT-2 esta soportada por el motor, aunque no se confirma en la ficha) y llama.cpp/Ollama previa conversion de los pesos a GGUF, ya que el repositorio solo publica `safetensors`.
- Latencia y throughput: no disponibles. Dado el tamano, en una GPU moderna se esperan decenas o cientos de tokens por segundo, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10 | 124,8 M | no disponible | no disponible | HuggingFace, safetensors | Fine-tune SFT experimental, sin benchmarks |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | licencia MIT modificada de OpenAI | HuggingFace, multiples formatos | Modelo base de referencia de esta familia |
| DistilGPT-2 | 82 M | 1.024 tokens | Apache 2.0 | HuggingFace | Version destilada, mas rapida, calidad inferior al GPT-2 completo |
| Pythia-160M (EleutherAI) | 160 M | 2.048 tokens | Apache 2.0 | HuggingFace | Suite de investigacion con checkpoints intermedios publicados |

La comparacion se limita a parametros, contexto, licencia y disponibilidad, porque el modelo analizado no publica resultados de evaluacion que permitan contrastar calidad. Los datos de GPT-2 small, DistilGPT-2 y Pythia-160M corresponden a sus fichas publicas ampliamente conocidas; conviene verificarlos en la fuente antes de citarlos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generacion, coherencia ni ausencia de repeticiones, por lo que no deberia desplegarse en produccion sin una evaluacion propia.
- Licencia no especificada: la model card contiene un campo `licence: license` sin texto legal, de modo que no puede afirmarse que el uso comercial este permitido. Es imprescindible contactar con el autor antes de cualquier uso comercial.
- Idiomas no declarados: la ficha no lista idiomas soportados; aunque el prefijo `eus` apunte al euskera, no hay confirmacion, y el modelo base tampoco documenta su composicion linguistica.
- Contexto limitado: al derivar de GPT-2, es probable que la ventana no supere los 1.024 tokens, lo que descarta casos de uso con documentos largos o conversaciones extensas. Este dato no esta confirmado en la ficha.
- Riesgo de alucinacion elevado: con 125 M de parametros, la tendencia a generar contenido factualmente incorrecto o incoherente es alta, especialmente fuera del dominio de entrenamiento.
- Sesgos inheritos del corpus: al haberse entrenado sobre aproximadamente 100 MB de texto (cifra inferida del nombre), el modelo hereda los sesgos de una muestra previsiblemente pequena y poco diversa.
- Modelo base tambien experimental: el checkpoint de partida (`ppt-wc-uniform-newlex-eus-before-100mb-packed-bfdiso_seed10`) no aporta documentacion adicional que permita acotar el comportamiento.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Reproducibilidad parcial: se conocen las versiones de framework y la semilla (`seed10`), pero no los hiperparametros ni el dataset, por lo que la replicacion exacta no es posible con la informacion publicada.
- Formato unico: solo se distribuyen pesos en `safetensors`; para usarlo con llama.cpp u Ollama hay que realizar la conversion a GGUF por cuenta propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-100mb-after-wc-uniform-newlex-before-ckpt500-packed-bfdiso_seed10
- Modelo base: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfdiso_seed10
- Repositorio de TRL: https://github.com/huggingface/trl
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/4r1b606c
- Paper de referencia de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
