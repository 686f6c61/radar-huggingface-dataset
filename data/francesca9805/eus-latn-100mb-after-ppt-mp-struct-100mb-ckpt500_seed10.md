# francesca9805/eus-latn-100mb-after-ppt-mp-struct-100mb-ckpt500_seed10

## Resumen

`francesca9805/eus-latn-100mb-after-ppt-mp-struct-100mb-ckpt500_seed10` es un modelo de generacion de texto de 124.770.816 parametros publicado en HuggingFace por el usuario `francesca9805`. Se trata de un ajuste fino mediante SFT (supervised fine-tuning) con la libreria TRL sobre el modelo base `francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed10`, que a su vez pertenece a una familia de experimentos identificada por el prefijo `eus-latn-100mb` (probablemente euskera, escritura latina y un corpus de 100 MB, aunque la model card no lo confirma).

El interes de esta publicacion es acotado y eminentemente academico: no es un modelo de proposito general ni compite con los LLM actuales. Su relevancia esta en servir como artefacto reproducible de un experimento de ajuste supervisado (checkpoint 500, semilla 10) sobre un modelo pequeno, con seguimiento del entrenamiento en Weights & Biases bajo una cuenta de la Universidad de Groningen. Por su tamano, cabe en cualquier GPU de consumo e incluso en CPU.

La informacion publicada es muy escasa: no hay licencia declarada, no se indican idiomas soportados, no hay resultados de benchmarks ni se documenta la composicion del dataset de ajuste. La model card se limita a la plantilla autogenerada por TRL mas un ejemplo de uso minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun el tag `gpt2` de HuggingFace; configuracion exacta no disponible |
| Parametros totales | 124.770.816 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni bitsandbytes) |
| Idiomas soportados | no disponible (el identificador `eus-latn` sugiere euskera en alfabeto latino, sin confirmacion en la model card) |
| Licencia | no disponible (la model card incluye `licence: license` como marcador sin contenido) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | `francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed10` |
| Metodo de ajuste | SFT con TRL 0.23.0 |
| Tamano del repositorio | 4,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia GPT-2: un transformer decoder-only con atencion causal completa. El tag `gpt2` de HuggingFace y el recuento de 124.770.816 parametros son coherentes con un modelo de escala "small" (el GPT-2 small canonico ronda los 124 M de parametros), aunque el numero exacto difiere ligeramente, lo que sugiere un vocabulario o una configuracion de capas distinta a la del GPT-2 original. No se dispone de informacion sobre el numero de capas, dimensiones de embedding, numero de cabezas de atencion ni sobre si se aplicaron modificaciones arquitectonicas (por ejemplo, atencion lineal o decodificacion especulativa).

El entrenamiento documentado es exclusivamente el ajuste supervisado (SFT) posterior al modelo base, realizado con TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el numero de tokens de ajuste, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, batch size o scheduler. El registro del entrenamiento esta disponible en Weights & Biases, pero sus datos no forman parte de la informacion proporcionada. El nombre del checkpoint (`ckpt500_seed10`) indica que se publica la iteracion 500 de una semilla concreta, lo que apunta a un barrido experimental con multiples semillas.

## Capacidades

- Generacion de texto autoregresiva basica, en la linea de un GPT-2 ajustado: continuacion de prompts y respuestas cortas en formato conversacional.
- Formato de chat de un solo turno segun el ejemplo de la model card, que pasa una lista con un mensaje de rol `user` al pipeline de `text-generation`.
- No hay evidencia publicada de soporte de tool calling ni de function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso, uso de memoria externa o planificacion.
- No se documentan capacidades de vision, audio, ni modo de razonamiento explicito ("thinking mode").
- Capacidad multilingue: no disponible; el identificador apunta a un modelo centrado en euskera, pero no hay confirmacion ni evaluacion.
- Al estar ajustado con SFT, cabe esperar que siga instrucciones conversacionales simples, pero no hay evaluacion que lo cuantifique.

## Casos de uso

- Reproduccion de experimentos academicos: sirve como punto de control publicado (checkpoint 500, semilla 10) para replicar o comparar un pipeline de SFT con TRL sobre un modelo pequeno, especialmente en estudios sobre variabilidad entre semillas.
- Investigacion en lenguas de bajos recursos: si el modelo esta efectivamente entrenado en euskera, puede emplearse como linea base para estudiar como se comporta un transformer de 124 M con un corpus de 100 MB y que tecnicas de ajuste mejoran la generacion.
- Pruebas de tokenizadores: el nombre del proyecto en Weights & Biases (`new-tokenizers`) sugiere que forma parte de una comparativa de tokenizadores; es util para analizar el impacto del vocabulario en la calidad del texto generado en euskera.
- Generacion de texto sintetico para aumento de datos: con supervision humana posterior, podria producir borradores de frases en euskera para ampliar corpus de entrenamiento de modelos mayores, dado su bajo coste de inferencia.
- Prototipado en hardware muy limitado: por su tamano, permite validar pipelines de `transformers`, `text-generation-inference` o despliegues en CPU antes de escalar a modelos mayores, sin necesidad de GPU dedicada.
- Demostraciones docentes: adecuado para explicar en clase el ciclo completo de ajuste supervisado, desde el modelo base hasta la publicacion en HuggingFace con seguimiento en W&B.
- Ablaciones controladas: al existir un modelo base identificable y un ajuste posterior, permite medir la ganancia atribuible unicamente a la fase de SFT en tareas concretas de generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, perplexity ni evaluaciones especificas de euskera, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros citadas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 124,77 M de parametros, sin contar la cache KV): aproximadamente 0,5 GB en fp32, 0,25 GB en fp16/bf16, 0,13 GB en int8 y 0,07 GB en 4 bits. Estas cifras son estimaciones derivadas del recuento de parametros, no mediciones publicadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una iGPU moderna pueden ejecutarlo.
- Cabe holgadamente en GPU de consumo e incluso en CPU: la inferencia en CPU es viable para cargas de baja concurrencia y respuestas cortas.
- Opciones de despliegue: `transformers` (via `pipeline`) es la ruta documentada por el autor; el tag `text-generation-inference` indica compatibilidad declarada con TGI, y el tag `endpoints_compatible` con los Inference Endpoints de HuggingFace. No se publican pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa a partir de safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Los datos de esta tabla sobre los modelos alternativos provienen de conocimiento general sobre esos modelos, no de la informacion proporcionada sobre el modelo objeto de la ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `francesca9805/eus-latn-100mb-after-ppt-mp-struct-100mb-ckpt500_seed10` | 124,77 M | no disponible | no disponible | HuggingFace, safetensors | Ajuste SFT con TRL; sin benchmarks ni licencia declarada |
| GPT-2 small (OpenAI) | ~124 M | 1024 tokens | MIT | Ampliamente disponible, con versiones GGUF | Referencia canonica de la misma escala; multilingue limitado y sin ajuste de instrucciones |
| DistilGPT-2 | ~82 M | 1024 tokens | Apache 2.0 (segun su model card) | Ampliamente disponible, con versiones GGUF | Destilado de GPT-2, orientado a generacion en ingles |
| Modelos especificos de euskera de escala media (por ejemplo, familias tipo Latxa) | no disponible | no disponible | no disponible | no disponible | Existen iniciativas de LLM en euskera, pero no se dispone de datos verificados en esta busqueda para una comparacion rigurosa |

La comparacion directa con GPT-2 small es la mas informativa en cuanto a escala, pero no en cuanto a idioma ni a objetivo de entrenamiento: este modelo parte de un base entrenado sobre un corpus de 100 MB y recibe un ajuste SFT posterior, mientras que GPT-2 small es un modelo de proposito general entrenado sobre un corpus web mucho mayor.

## Limitaciones y advertencias

- Volumen de informacion minimo: la model card es la plantilla autogenerada por TRL. No hay dataset, hiperparametros, numero de tokens de ajuste ni evaluacion.
- Licencia sin definir: la model card contiene `licence: license` como marcador de posicion. Sin una licencia explicita y verificada, el uso comercial no esta autorizado de forma clara; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: aunque el identificador sugiere euskera, no hay confirmacion oficial, lo que impide garantizar un rendimiento minimo en cualquier idioma, incluido el castellano.
- Tamano de corpus muy reducido: un entrenamiento base sobre 100 MB de texto limita severamente la cobertura lexica, los conocimientos factuales y la fluidez fuera de los dominios vistos.
- Riesgo elevado de alucinacion: un modelo de 124 M de parametros no tiene capacidad factual fiable; cualquier afirmacion sobre hechos, cifras o referencias debe verificarse externamente.
- Contexto limitado y no documentado: no se especifica la ventana de contexto, y los modelos de esta familia suelen manejarse en torno a 1024 tokens, lo que excluye casos de uso con documentos largos.
- Sin soporte verificado de tool calling ni de agentes: no conviene integrarlo en flujos que dependan de function calling o de razonamiento multi-paso.
- Ausencia de senales de calidad: 0 descargas y 0 likes, sin evaluaciones de terceros ni resultados de benchmarks reproducibles.
- Sesgos no evaluados: al no documentarse la procedencia del corpus de ajuste, no es posible caracterizar sesgos de genero, ideologicos o culturales.
- Advertencia de produccion: no se recomienda su uso en atencion al cliente, generacion de codigo, asesoramiento ni ningun escenario con requisitos de exactitud, trazabilidad o cumplimiento normativo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/eus-latn-100mb-after-ppt-mp-struct-100mb-ckpt500_seed10
- Modelo base: https://huggingface.co/francesca9805/eus-latn-100mb-ppt-mp-struct-100mb_seed10
- Repositorio de TRL: https://github.com/huggingface/trl
- Registro del entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/ekqrre0e
- Paper del modelo: no disponible
- Blog o articulo tecnico del autor: no disponible
- Demo: no disponible
