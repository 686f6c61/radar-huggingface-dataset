# francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfd_seed3407

## Resumen

`francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfd_seed3407` es un ajuste fino (SFT) del modelo base `goldfish-models/eng_latn_100mb`, un GPT-2 monolingüe en inglés entrenado por el proyecto Goldfish sobre un corpus de aproximadamente 100 MB. El resultado es un modelo de generación de texto de 86.508.288 parámetros (≈86,5 M) publicado en HuggingFace por el usuario `francesca9805`, con licencia no declarada de forma efectiva y sin métricas de uso (0 descargas y 0 likes en el momento de la consulta).

El interés técnico del modelo reside en su nombre y en su trazabilidad: el identificador incluye términos como `newlex` (nuevo lexicón), `eus` (código ISO 639-3 del euskera), `uniform`, `packed` y una semilla concreta (`seed3407`), y el run asociado en Weights & Biases pertenece al proyecto `new-tokenizers` de la Universidad de Groninga. Todo apunta a un experimento académico sobre tokenizadores y vocabularios para lenguas de bajos recursos, más que a un modelo destinado a producción.

Se trata, por tanto, de un artefacto de investigación de interés limitado fuera de su contexto experimental: no hay model card sustantiva, no se declaran idiomas ni licencia, no se publican benchmarks y el corpus de partida (100 MB) es varios órdenes de magnitud inferior al de los modelos de propósito general actuales. Su utilidad principal es la reproducibilidad de experimentos de tokenización y el estudio de estrategias de ajuste fino sobre modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo GPT-2 (etiqueta `gpt2` en HuggingFace); configuracion exacta de capas y cabezas no disponible |
| Parametros totales | 86.508.288 (≈86,5 M), dato real de los pesos en safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no lo especifica; la familia GPT-2 suele operar con 1.024 tokens, sin confirmar para este ajuste) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible. El modelo base es de ingles (`eng_latn`) y el nombre incluye `eus` (codigo del euskera), pero la model card no declara idiomas |
| Licencia | no disponible (el campo de la model card contiene el literal `license`, sin identificador de licencia) |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 0,2 GB |
| Modelo base | goldfish-models/eng_latn_100mb |
| Metodo de entrenamiento | SFT con TRL 0.23.0 |
| Fecha de creacion | 2026-09-24 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only de estilo GPT-2 con atención causal completa. El recuento de 86,5 M de parámetros, inferior a los 124 M del GPT-2 original de OpenAI, es coherente con un vocabulario reducido o una configuracion de capas y dimensiones mas compacta que la del GPT-2 estandar, algo habitual en los modelos monolingües de 100 MB del proyecto Goldfish, que entrenan un modelo por lengua sobre un corpus de ese tamano. El repositorio no incluye el `config.json` descrito en la informacion disponible, por lo que no se pueden confirmar el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni la longitud de contexto efectiva.

El entrenamiento se realizo mediante ajuste supervisado (SFT) con TRL 0.23.0, sobre Transformers 4.56.2, PyTorch 2.5.1+cu121, Datasets 4.8.4 y Tokenizers 0.22.1. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `new-tokenizers` del espacio de trabajo `f-padovani-university-of-groningen`, lo que vincula el modelo a una linea de investigacion sobre nuevos tokenizadores. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni el uso de RLHF o DPO. El fragmento de codigo de la model card utiliza una interfaz de conversacion con mensajes con rol (`{"role": "user", "content": ...}`), lo que sugiere que el ajuste SFT se aplico sobre datos en formato instruccional o de dialogo.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de un GPT-2 ajustado por SFT.
- Generacion condicionada por prompt en formato de conversacion (mensajes con rol `user`), segun el ejemplo de uso de la model card.
- Generacion de texto libre con `max_new_tokens` configurable mediante `transformers.pipeline`.
- Compatibilidad declarada con text-generation-inference y con endpoints compatibles (etiquetas `text-generation-inference` y `endpoints_compatible`).
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- No hay evidencia de capacidades multilingues mas alla de lo que sugiera el corpus de ajuste, no documentado.
- No hay evidencia de modo de razonamiento explicito (thinking mode), vision, audio ni modalidades adicionales.

## Casos de uso

- Reproduccion de experimentos de tokenizacion: el modelo forma parte de una linea de trabajo sobre nuevos lexicones y vocabularios (`new-tokenizers`), por lo que su uso principal es comparar el efecto de distintas estrategias de tokenizacion en el ajuste fino de un GPT-2 pequeno.
- Docencia y practicas de ajuste fino: con 86,5 M de parametros y 0,2 GB de pesos, sirve como ejemplo de extremo a extremo de un pipeline SFT con TRL, ejecutable en portatil o en una GPU modesta.
- Pruebas unitarias de infraestructura de despliegue: es util como modelo de juguete para validar pipelines de TGI, endpoints compatibles con OpenAI o servidores de inferencia antes de pasar a modelos grandes.
- Generacion de texto en ingles de dominio muy restringido: si el corpus de ajuste estuviera acotado a un dominio concreto, podria emplearse para completar texto de ese dominio, aunque no hay documentacion que lo confirme.
- Investigacion sobre olvido catastrofico y ajuste en regimen de pocos datos: el contraste entre un corpus base de 100 MB y un ajuste SFT posterior permite estudiar como se degrada o especializa un modelo pequeno.
- Base para experimentos de cuantizacion extrema: al ser un modelo de menos de 100 M de parametros, permite medir la degradacion por cuantizacion en 8, 4 e incluso 2 bits sin apenas coste de computo.
- Prototipado de interfaces conversacionales de bajo coste: el formato de chat del ejemplo permite montar demos de dialogo, siempre que el usuario acepte la falta de garantias de calidad y licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio asociado en Weights & Biases no aporta cifras en la informacion proporcionada. Cualquier estimacion de calidad seria especulativa.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache de atencion): aproximadamente 346 MB en FP32, 173 MB en FP16/BF16, 87 MB en INT8 y en torno a 45-50 MB en 4 bits.
- La cache KV y las activaciones anaden un consumo adicional que depende de la longitud de contexto y del batch; con contexto de 1.024 tokens y batch 1 el consumo extra es de pocos megabytes.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 y H100 (estas ultimas enormemente sobredimensionadas para este tamano).
- Cabe en cualquier GPU de consumo e incluso en CPU: la inferencia en CPU con PyTorch es perfectamente viable y probablemente interactiva para respuestas cortas.
- Opciones de despliegue: `transformers` (soporte nativo), text-generation-inference (TGI) y endpoints compatibles, segun las etiquetas del repositorio. Para llama.cpp u Ollama seria necesario convertir previamente los pesos a GGUF, conversion que no se ha publicado.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ppt-wc-uniform-newlex-eus-before-100mb-packed-bfd_seed3407 | 86,5 M | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| goldfish-models/eng_latn_100mb (modelo base) | ~86-100 M (no confirmado) | no disponible | Ingles | no disponible en la informacion proporcionada | HuggingFace (proyecto Goldfish) |
| GPT-2 (OpenAI) | 124 M | 1.024 tokens | Ingles | MIT | HuggingFace, ampliamente desplegado |
| DistilGPT-2 | 82 M | 1.024 tokens | Ingles | Apache 2.0 | HuggingFace, ampliamente desplegado |
| Pythia-70M (EleutherAI) | 70 M | 2.048 tokens | Ingles | Apache 2.0 | HuggingFace, con suite de checkpoints intermedios |

La comparacion directa es desigual: frente a GPT-2, DistilGPT-2 o Pythia-70M, este modelo carece de licencia declarada, idiomas declarados, contexto documentado y evaluaciones publicadas, ademas de haberse entrenado sobre un corpus base mucho menor (100 MB frente a los cientos de miles de millones de tokens de Pythia o los ~40 GB de WebText de GPT-2). Su ventaja no es competitiva sino experimental.

## Limitaciones y advertencias

- Sesgos: no documentados, pero un modelo entrenado sobre un corpus de 100 MB en ingles hereda inevitablemente los sesgos de esa fuente, que ademas no se describe.
- Alucinacion: riesgo muy alto. Con un corpus de preentrenamiento tan reducido, el modelo tiene una cobertura factual minima y producira texto plausible pero no veridico con frecuencia.
- Conocimiento del mundo: practicamente nulo mas alla del dominio del corpus de ajuste, no documentado.
- Ambiguedad linguistica: el nombre del modelo incluye `eus` (euskera) mientras el modelo base es de ingles (`eng_latn`). No hay informacion que aclare si el ajuste se realizo en euskera, si se uso un tokenizador nuevo para esa lengua o si se trata de un experimento comparativo. No debe asumirse capacidad en euskera sin verificacion empirica.
- Licencia: el campo de licencia contiene el literal `license`, sin identificador valido. Esto deja el uso comercial en un limbo juridico; se recomienda contactar con el autor antes de cualquier uso en produccion.
- Ausencia de model card sustantiva: sin descripcion del dataset, hiperparametros, tokens de entrenamiento ni evaluacion. La reproducibilidad es limitada.
- Fechas incoherentes: la fecha de creacion declarada (2026-09-24) es posterior a la fecha de esta ficha segun el calendario habitual; conviene verificar los metadatos.
- Uso en produccion: no recomendado. Cero descargas y cero likes implican ausencia total de validacion por parte de la comunidad.
- Riesgo de conversion: los pesos estan en safetensors; convertirlos a GGUF para llama.cpp u Ollama requeriria conocer la configuracion exacta del modelo, no publicada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/francesca9805/ppt-wc-uniform-newlex-eus-before-100mb-packed-bfd_seed3407
- Modelo base: https://huggingface.co/goldfish-models/eng_latn_100mb
- Organizacion Goldfish Models: https://huggingface.co/goldfish-models
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/a8mca6d3
- Repositorio de TRL: https://github.com/huggingface/trl

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor ni el proyecto `new-tokenizers`; los enlaces devueltos por el buscador no guardaban relacion con el modelo y se han descartado.
