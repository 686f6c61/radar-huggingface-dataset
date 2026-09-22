# francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407

# francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407

## Resumen

Se trata de un ajuste fino (fine-tuning) del modelo monolingue `goldfish-models/tur_latn_10mb`, publicado por el usuario francesca9805. El modelo base pertenece a la familia Goldfish, orientada a lenguas con pocos recursos, en este caso el turco en escritura latina a partir de un corpus de 10 MB. El resultado es un modelo pequeno de generacion de texto, con 39.087.104 parametros reales segun los pesos en safetensors, lo que lo situa en la categoria de modelos ligeros ejecutables en CPU o en cualquier GPU de consumo.

El entrenamiento se ha realizado con SFT (supervised fine-tuning) mediante la libreria TRL en su version 0.23.0, sobre Transformers 4.56.2 y PyTorch 2.5.1. El identificador del repositorio sugiere un experimento de investigacion sobre tokenizadores y empaquetado de datos (los sufijos "ppt", "Dp-100mb-packed" y "bfd_seed3407" apuntan a una configuracion concreta de dataset empaquetado y una semilla fija), coherente con el proyecto de Weights & Biases asociado, denominado "new-tokenizers".

Su relevancia es fundamentalmente academica y experimental: no es un modelo de proposito general, sino un artefacto de investigacion util para estudiar el efecto del ajuste fino supervisado en modelos multilingues de muy bajo parametraje, para reproducir experimentos con semilla fija y para validar pipelines de TRL. La model card no documenta idiomas soportados, licencia ni resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT-2 (etiqueta `gpt2` en el repositorio); detalles de capas y cabezas no disponibles |
| Parametros totales | 39.087.104 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en el repositorio; al ser un modelo de 39 M de parametros admite conversion a int8 e int4 (aprox. 39 MB y 20 MB respectivamente) |
| Idiomas soportados | No declarados en la model card; el identificador del modelo base (`tur_latn`) indica turco en escritura latina |
| Licencia | No disponible (la model card contiene un marcador de posicion, `licence: license`, sin texto legal) |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | goldfish-models/tur_latn_10mb |
| Fecha de creacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` del repositorio y la compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` indican una arquitectura transformer de tipo decoder-only con atencion causal, la habitual en la familia GPT-2. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tamano de vocabulario ni longitud de contexto. El recuento de 39.087.104 parametros es consistente con una configuracion compacta, muy por debajo de GPT-2 small (124 M), lo que sugiere embeddings compartidos o una configuracion reducida, aunque este extremo no esta confirmado en la informacion disponible.

El entrenamiento se ha realizado exclusivamente mediante SFT (supervised fine-tuning) con TRL 0.23.0. No se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases posteriores de RLHF o DPO; la model card solo menciona SFT. El nombre del repositorio apunta a un corpus empaquetado de 100 MB ("100mb-packed") derivado del modelo base de 10 MB, con una semilla fija (`bfd_seed3407`) para garantizar reproducibilidad. Existe un run publico en Weights & Biases bajo el proyecto "new-tokenizers" que probablemente contiene las curvas de perdida y la configuracion completa, aunque sus datos no se incluyen en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva: es la funcionalidad principal declarada (pipeline `text-generation`).
- Conversacion de un solo turno mediante plantilla de mensajes: el ejemplo de la model card pasa una lista con `{"role": "user", "content": ...}` al pipeline.
- Modelado de turco en escritura latina: capacidad inferida del modelo base `tur_latn_10mb`; no verificada ni declarada explicitamente por el autor.
- Tool calling / function calling: no disponible.
- Comportamiento agentico o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no documentadas. El entrenamiento es monolingue por diseno del modelo base.
- Capacidades especiales (modo thinking, vision, audio): ninguna declarada.
- Generacion de codigo y matematicas: no documentada; por tamano y datos de entrenamiento (10 MB de texto monolingue) no es esperable un rendimiento util en estos dominios.

## Casos de uso

- Investigacion sobre ajuste fino en lenguas de bajos recursos: el modelo permite medir como el SFT con TRL modifica el comportamiento de un modelo Goldfish de 10 MB, comparando perdida y perplejidad antes y despues del ajuste.
- Reproducibilidad de experimentos: gracias a la semilla fija del identificador (`bfd_seed3407`) y al run de Weights & Biases, sirve como punto de referencia para replicar una configuracion concreta de entrenamiento.
- Estudio de tokenizadores: el proyecto asociado se denomina "new-tokenizers", por lo que el modelo es util como caso de prueba para analizar el impacto del vocabulario y del empaquetado de secuencias en la calidad final.
- Prototipado rapido en entornos sin GPU: con 39 M de parametros ocupa menos de 160 MB en fp32 y puede ejecutarse en CPU, lo que permite iterar sobre prompts sin infraestructura dedicada.
- Generacion de texto en turco para tareas auxiliares: completion de frases cortas, generacion de titulares o textos de relleno en turco, siempre con supervision humana y asumiendo calidad limitada por el tamano del corpus.
- Generacion de datos sinteticos de bajo coste: producir borradores de texto en turco para aumentar datasets de entrenamiento, filtrando despues con un modelo mayor o con anotacion humana.
- Docencia y practicas de ajuste fino: es un ejemplo completo y pequeno de pipeline TRL + Transformers, adecuado para cursos de NLP que ensenen SFT sin requerir hardware especializado.
- Pruebas de integracion de infraestructura: al ser compatible con text-generation-inference y con endpoints, sirve para validar despliegues y pipelines de serving antes de pasar a modelos de mayor tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (perplejidad, MMLU, HumanEval, GSM8K ni ninguna otra) y los resultados de la busqueda web no aportan datos de evaluacion. Tampoco se dispone de comparaciones con el modelo base para cuantificar la mejora o degradacion introducida por el ajuste fino.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 156 MB en fp32, 78 MB en fp16/bf16, 39 MB en int8 y 20 MB en int4, calculados a partir de los 39.087.104 parametros.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; no se requiere A100, H100 ni similares. Una NVIDIA T4, GTX 1050 Ti o integrada moderna basta.
- Cabe en GPU de consumo: si, en cualquier RTX (2060, 3060, 4090), GTX o incluso en GPU integradas con soporte CUDA o ROCm. Tambien es viable en CPU y en dispositivos tipo Raspberry Pi.
- Opciones de despliegue: `transformers` con el pipeline de generacion, text-generation-inference (etiqueta declarada), endpoints compatibles, vLLM (por compatibilidad de arquitectura GPT-2). Para llama.cpp u Ollama seria necesaria una conversion a GGUF no incluida en el repositorio.
- Latencia y throughput estimados: no disponibles. Dado el tamano, en GPU moderna la latencia por token es del orden de milisegundos, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407 | 39.087.104 | No disponible | No publicado | No disponible | HuggingFace, 0 descargas |
| goldfish-models/tur_latn_10mb | No disponible | No disponible | No publicado en esta ficha | No disponible | HuggingFace (modelo base) |
| Otros modelos Goldfish de la misma familia (otras lenguas) | No disponible | No disponible | No aplicable a turco | No disponible | HuggingFace |

No se dispone de datos suficientes para comparar rendimiento con alternativas. La unica comparacion fiable es con el propio modelo base, y tampoco se han publicado metricas de esa comparacion en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Un corpus de 10 MB de turco en escritura latina es necesariamente parcial en dominio, registro y variedad dialectal, por lo que es probable que el modelo reproduzca estereotipos o infrarepresente variedades no presentes en los datos.
- Riesgo de alucinacion: alto. Con 39 M de parametros y un corpus de entrenamiento muy reducido, el modelo generara texto plausible pero frecuentemente incorrecto desde el punto de vista factivo.
- Limitaciones de contexto e idioma: no hay informacion sobre la ventana de contexto y el alcance multilingue es practicamente nulo; el uso fuera del turco en escritura latina producira resultados degenerados.
- Licencia: no disponible. La model card incluye un marcador de posicion (`licence: license`) sin texto legal, por lo que no puede asumirse permiso de uso comercial. Es imprescindible contactar con el autor o revisar la licencia del modelo base antes de cualquier uso en produccion.
- Caveats para produccion: 0 descargas y 0 likes, sin documentacion de evaluacion, sin idiomas declarados y sin garantias de calidad; no es un modelo apto para servicios de cara al publico sin una validacion exhaustiva.
- Fecha de creacion inusualmente futura (2026) en los metadatos, lo que sugiere un artefacto experimental o un error de marca temporal; conviene verificarlo antes de citarlo.
- Los resultados de la busqueda web realizada no contienen ninguna referencia tecnica al modelo ni a su familia; toda la informacion procede de la model card y de los metadatos del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/tur-latn-10mb-ppt-Dp-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/tur_latn_10mb
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/m4zr4rlq
- Repositorio de TRL: https://github.com/huggingface/trl
- Los resultados de la busqueda web proporcionados no contienen enlaces relevantes al modelo.
