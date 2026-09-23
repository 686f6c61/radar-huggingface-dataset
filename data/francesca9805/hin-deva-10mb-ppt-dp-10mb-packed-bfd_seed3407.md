# francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407

## Resumen

El modelo `francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407` es un ajuste fino (fine-tuning) supervisado del modelo base `goldfish-models/hin_deva_10mb`, publicado por el usuario francesca9805 en HuggingFace. Se trata de un modelo de generacion de texto de arquitectura tipo GPT-2 con 39.087.104 parametros (segun los pesos en safetensors) y un tamano de repositorio de 0,1 GB, lo que lo situa en la categoria de modelos muy pequenos, entrenables y desplegables en hardware minimo.

El modelo se ha entrenado mediante SFT (supervised fine-tuning) con la libreria TRL 0.23.0 sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El nombre del repositorio sugiere un experimento de investigacion sobre tokenizacion y empaquetado de datos (las siglas "ppt", "Dp-10mb-packed" y "bfd" apuntan a variantes de dataset y semilla, con `seed3407` como semilla fija), enmarcado en el proyecto goldfish-models de modelos de 10 MB por idioma.

Su relevancia es fundamentalmente experimental: sirve como punto de partida reproducible para estudiar el efecto del ajuste fino en modelos diminutos para hindi en escritura devanagari (el identificador del modelo base, `hin_deva`, apunta a ese idioma y sistema de escritura, aunque la model card no lo confirma). No es un modelo orientado a produccion ni a tareas generales de alta calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only, segun la etiqueta `gpt2` del repositorio) |
| Parametros totales | 39.087.104 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el nombre del modelo base, `hin_deva`, sugiere hindi en escritura devanagari, sin confirmacion oficial) |
| Licencia | no disponible (la model card indica `licence: license` de forma generica, sin especificar terminos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de tipo GPT-2, segun la etiqueta declarada en el repositorio. Con 39,09 millones de parametros y un repositorio de 0,1 GB, se trata de un modelo de escala muy reducida, por debajo de GPT-2 small (124 M). No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion, tamano de vocabulario ni longitud de contexto maxima: la model card no incluye la configuracion (`config.json`) ni detalles arquitectonicos.

El entrenamiento se realizo mediante SFT con TRL 0.23.0, partiendo de `goldfish-models/hin_deva_10mb`. El identificador del repositorio (`ppt-Dp-10mb-packed-bfd_seed3407`) indica que se uso un dataset empaquetado de 10 MB, una variante de preprocesado tipo "ppt" y la semilla 3407, pero no se documentan ni el volumen de tokens, ni la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card enlaza una ejecucion de Weights & Biases del proyecto "new-tokenizers" de la Universidad de Groningen, que es el unico registro publico del proceso de entrenamiento.

## Capacidades

- Generacion de texto autoregresiva basica, condicionada por un mensaje de usuario en formato de chat (el ejemplo de la model card usa `pipeline("text-generation")` con una lista de mensajes con rol `user`).
- Ajuste por instrucciones limitado, derivado del entrenamiento SFT sobre el modelo base.
- Generacion en el idioma y sistema de escritura del modelo base (presumiblemente hindi en devanagari), sin confirmacion documental.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio, thinking mode ni decodificacion especulativa.
- No se documentan capacidades multilingues mas alla del posible idioma del modelo base.

## Casos de uso

- Experimentacion academica sobre ajuste fino: sirve como sujeto de prueba reproducible (semilla 3407 fija) para medir como varia el comportamiento de un modelo de 39 M de parametros al aplicar SFT sobre un corpus empaquetado de 10 MB.
- Estudio de tokenizadores para lenguas de bajos recursos: el proyecto de origen ("new-tokenizers") y el identificador `hin_deva` lo hacen adecuado para analizar la eficiencia de la tokenizacion en escritura devanagari frente a tokenizadores genericos.
- Linea base en evaluaciones de bajo coste: al ser un modelo pequeno y rapido, puede usarse como baseline inferior en comparativas de generacion de texto en hindi, frente a modelos mayores.
- Pruebas de infraestructura de despliegue: su tamano (0,1 GB) permite validar pipelines completos de HuggingFace Transformers, TGI o endpoints compatibles antes de escalar a modelos mayores.
- Docencia y demostraciones: ejecutable en CPU o en cualquier GPU de consumo, es util para ilustrar el ciclo completo de entrenamiento con TRL y publicacion de un modelo en el Hub.
- Generacion de texto sintetico a pequena escala para experimentos de aumento de datos, siempre que se valide manualmente la calidad de la salida.
- Pruebas de conversion de formatos: aunque el repositorio solo publica safetensors, puede emplearse para verificar flujos de conversion a GGUF y su ejecucion en llama.cpp u Ollama.
- Investigacion sobre empaquetado de secuencias: el sufijo `packed` sugiere que es un artefacto util para estudiar como afecta el empaquetado de secuencias cortas al ajuste fino de modelos diminutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de evaluacion (perplejidad, MMLU, GSM8K, HumanEval ni ninguna otra), y el repositorio no aparece acompanado de resultados en la busqueda web realizada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,16 GB en fp32, 0,08 GB en fp16/bf16 y en torno a 0,04 GB en int8, calculados a partir de los 39,09 M de parametros. El repositorio ocupa 0,1 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente, incluidas tarjetas integradas y modelos de gama de entrada. No se necesita A100, H100 ni RTX 4090.
- Cabe sin problema en GPU de consumo: GTX 1050, GTX 1650, RTX 3050, RTX 4060, RTX 4090 y equivalentes, con un uso de memoria despreciable frente a la capacidad disponible.
- Ejecucion en CPU: viable con un rendimiento aceptable en generacion de pocos cientos de tokens.
- Opciones de despliegue: HuggingFace Transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio). Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, ya que no se publican ficheros en ese formato.
- Latencia y throughput estimados: no disponibles, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407 | 39.087.104 | no disponible | no disponible | safetensors en HuggingFace, 0 descargas y 0 likes en el momento de la consulta | Ajuste SFT experimental, sin benchmarks publicados |
| goldfish-models/hin_deva_10mb | no disponible | no disponible | no disponible | HuggingFace | Modelo base directo del anterior; su configuracion no se detalla en la informacion proporcionada |
| GPT-2 small (referencia arquitectonica) | 124 M | 1024 tokens | licencia MIT modificada | Ampliamente disponible | Arquitectura de la misma familia, aproximadamente 3 veces mas parametros; la comparacion es orientativa y no se dispone de resultados comparativos |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluacion publicada: no hay evidencia objetiva de calidad de generacion.
- Riesgo alto de alucinacion y de texto incoherente: con 39 M de parametros y un dataset de 10 MB, la capacidad de modelar lenguaje complejo es muy limitada.
- Idiomas y cobertura lexica no documentados: si el modelo esta especializado en hindi devanagari, su rendimiento en castellano o en otros idiomas sera con toda probabilidad marginal. No se han declarado idiomas soportados.
- Longitud de contexto no disponible: se desconoce el maximo de tokens de entrada y si el empaquetado del entrenamiento afecto a esa ventana.
- Licencia sin especificar: la model card indica `licence: license` de forma generica, por lo que no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor antes de cualquier uso comercial.
- Procedencia incierta: el modelo lo publica una cuenta individual y no se acompana de paper, informe tecnico ni evaluacion de sesgos.
- Sin versiones cuantizadas publicadas: solo hay safetensors, lo que obliga a convertir los pesos para usarlos en llama.cpp u Ollama.
- Adopcion nula en el momento de la consulta (0 descargas, 0 likes), lo que implica ausencia de validacion por parte de la comunidad.
- No apto para produccion: debe tratarse como un artefacto de investigacion, no como un componente de sistemas reales.
- La fecha de creacion del repositorio indicada en los metadatos (2026-09-22) es posterior a la fecha de actualizacion (2026-09-23) en un dia, un detalle menor pero que conviene verificar en el Hub.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/hin-deva-10mb-ppt-Dp-10mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/hin_deva_10mb
- Ejecucion de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/hhs21qtk
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (cita BibTeX de la model card): von Werra et al., "TRL: Transformer Reinforcement Learning", 2020
