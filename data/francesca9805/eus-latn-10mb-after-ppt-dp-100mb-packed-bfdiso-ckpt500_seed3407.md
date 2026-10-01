# francesca9805/eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407

## Resumen

El modelo `eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407` es un ajuste fino (SFT) publicado por el usuario de HuggingFace `francesca9805`, derivado del checkpoint `francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407`. Se distribuye con la libreria `transformers` y la etiqueta de arquitectura `gpt2`, por lo que se trata de un transformer decoder-only autoregresivo de tipo GPT-2 con 39.087.104 parametros (unos 39 M) segun los pesos reales en safetensors. Es, por tanto, un modelo muy pequeno dentro de la familia GPT-2, pensado para generacion de texto y entrenado con la libreria TRL en su version 0.23.0.

El identificador del modelo sugiere un experimento de investigacion sobre euskera en alfabeto latino (`eus-latn`), con un corpus de aproximadamente 10 MB, empaquetado de secuencias (`packed`) y posible uso de privacidad diferencial (`Dp`), aunque estos extremos no se confirman en la model card. El nombre incluye referencia a un checkpoint intermedio (`ckpt500`) y una semilla fija (`seed3407`), lo que apunta a un artefacto de barrido experimental reproducible mas que a un modelo listo para produccion.

Su relevancia es limitada fuera del contexto academico del que procede: no tiene descargas ni interacciones, no declara licencia, idiomas ni contexto, y su tamano reducido lo situa en la categoria de modelos de investigacion y experimentacion con recursos minimos. Resulta util como punto de partida para reproducir experimentos de ajuste fino con TRL sobre lenguas de bajos recursos, no como sustituto de modelos generativos de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace) |
| Parametros totales | 39.087.104 (~39 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos sin cuantizacion declarada |
| Idiomas soportados | no disponible (el identificador `eus-latn` sugiere euskera en alfabeto latino, sin confirmacion en la model card) |
| Licencia | no disponible (la model card indica `licence: license` sin concretar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La etiqueta de HuggingFace `gpt2` y la pertenencia a la libreria `transformers` indican una arquitectura transformer decoder-only con atencion causal, propia de la familia GPT-2. El recuento real de parametros (39.087.104) es claramente inferior al de GPT-2 small (124 M), lo que implica una configuracion reducida en numero de capas, dimension de embedding o cabezas de atencion; la model card no detalla ninguno de estos hiperparametros. No se especifica la longitud de contexto entrenada ni el tokenizador empleado.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. La model card enlaza una ejecucion de Weights & Biases bajo el proyecto `new-tokenizers`, del grupo `f-padovani-university-of-groningen`, lo que vincula el modelo a un contexto de investigacion academica sobre tokenizacion y lenguas de bajos recursos. No se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT. Segun el nombre del modelo, el ajuste parte de un checkpoint base ya entrenado (`eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407`) y se guarda en el paso 500 de entrenamiento con semilla 3407.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Ajuste fino supervisado sobre un corpus concreto, segun el flujo SFT de TRL.
- Compatibilidad con `text-generation-inference` y endpoints de HuggingFace (etiquetas declaradas `text-generation-inference` y `endpoints_compatible`).
- Uso directo mediante `pipeline("text-generation")` de Transformers, como muestra el ejemplo de la model card.
- Soporte de entradas conversacionales en formato de lista de mensajes (`[{"role": "user", "content": ...}]`) en el ejemplo publicado.
- Capacidades multilingues: no disponibles; el identificador sugiere euskera, sin confirmacion.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y uso como agente: no disponible.
- Vision, audio o modos de pensamiento explicito: no disponibles.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo sirve como artefacto de referencia para replicar el ajuste fino SFT descrito, dada la semilla fija (3407), el checkpoint concreto (500) y el enlace a la ejecucion de Weights & Biases.
- Investigacion en lenguas de bajos recursos: si se confirma el foco en euskera, puede emplearse como punto de partida para estudiar tecnicas de tokenizacion y empaquetado de secuencias en corpus pequenos (del orden de 10 MB).
- Experimentacion con privacidad diferencial: el sufijo `Dp` del identificador sugiere un escenario de entrenamiento con ruido diferencial, util para analizar el equilibrio entre privacidad y calidad de generacion.
- Docencia y practicas de ajuste fino: sus 39 M de parametros permiten entrenar y evaluar el ciclo completo de SFT en una unica GPU consumer o incluso en CPU, sin necesidad de infraestructura dedicada.
- Prototipado de pipelines de generacion de texto: al ser compatible con `text-generation-inference` y con `transformers.pipeline`, permite validar integraciones de servicio antes de escalar a modelos mayores.
- Pruebas de integracion en CI: por su tamano (repositorio de 0,1 GB) es viable descargarlo y ejecutarlo en cada ejecucion de un pipeline de integracion continua para verificar que el codigo de inferencia funciona.
- Analisis de sesgos y degradacion en modelos pequenos: permite estudiar como se manifiestan las alucinaciones y los sesgos en modelos de muy baja capacidad antes de extrapolar conclusiones a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye metricas de evaluacion (MMLU, HumanEval, GSM8K, Perplexity ni ninguna otra), y el repositorio no incorpora resultados de comparacion con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia, solo pesos: aproximadamente 156 MB en FP32, 78 MB en FP16/BF16, 39 MB en int8 y unos 20 MB en 4 bits, para los 39,09 M de parametros.
- VRAM total con cache KV y activaciones: del orden de unos cientos de megabytes como maximo, dado el tamano del modelo y una longitud de contexto no confirmada.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; no se requieren A100, H100 ni tarjetas de gama alta.
- Cabe en cualquier GPU consumer: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060 y superiores, asi como en GPUs integradas y en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-generation")` (metodo documentado en la model card), Text Generation Inference (etiqueta declarada), y servidores compatibles con endpoints de HuggingFace. No se documenta soporte GGUF ni Ollama en la informacion disponible.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, la generacion en GPU deberia ser de milisegundos por token, pero no se aporta ninguna medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407` | 39,09 M | no disponible | no disponible | HuggingFace, 0 descargas | Modelo de investigacion, arquitectura GPT-2 |
| GPT-2 small | 124 M | 1024 tokens (configuracion estandar de la familia) | licencia modificada de MIT (segun publicacion original) | Ampliamente disponible | Referencia de la familia; este modelo tiene aproximadamente un tercio de sus parametros |
| DistilGPT-2 | 82 M | 1024 tokens (configuracion estandar) | no disponible en esta ficha | Ampliamente disponible | Alternativa destilada de tamano intermedio |
| Cualquier ajuste especifico de euskera de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para establecer una comparacion |

La comparacion con GPT-2 small y DistilGPT-2 se incluye unicamente como referencia de categoria y tamano; no se dispone de resultados de benchmarks que permitan comparar el rendimiento real de este checkpoint con el de dichos modelos.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos. Al entrenarse sobre un corpus pequeno (aproximadamente 10 MB segun el identificador), es probable que reproduzca los sesgos y las limitaciones tematicas de esa muestra, pero no hay datos verificados.
- Riesgo de alucinacion elevado: con 39 M de parametros, la capacidad de generar texto factual y coherente es muy limitada en comparacion con modelos de mayor escala.
- Longitud de contexto desconocida: no se confirma la ventana de atencion, lo que impide garantizar el comportamiento en conversaciones multi-turno largas.
- Cobertura idiomatica no confirmada: el nombre sugiere un foco en euskera, pero no se declara oficialmente ningun idioma soportado ni su nivel de calidad.
- Licencia sin especificar: la model card indica `licence: license` sin concretar condiciones, por lo que no se puede determinar si el uso comercial esta permitido. Se recomienda contactar con el autor antes de cualquier uso en produccion.
- Ausencia de benchmarks: no existe ninguna metrica publicada que permita validar la calidad del modelo frente a alternativas.
- Modelo practicamente sin uso: cero descargas y cero interacciones en HuggingFace, sin evidencia de validacion por parte de la comunidad.
- Sesgo de seleccion experimental: el identificador refleja un barrido concreto (semilla 3407, checkpoint 500, corpus empaquetado), lo que sugiere que puede no ser el mejor checkpoint de su propia serie.
- Advertencia para produccion: no se recomienda su uso en sistemas orientados a usuarios finales sin una evaluacion previa exhaustiva y sin aclarar los terminos de licencia.

## Enlaces

- HuggingFace: https://huggingface.co/francesca9805/eus-latn-10mb-after-ppt-Dp-100mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/eus-latn-10mb-ppt-Dp-100mb-packed-bfdiso_seed3407
- Ejecucion de entrenamiento (Weights & Biases): https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/43ygyi7p
- Repositorio de TRL: https://github.com/huggingface/trl
