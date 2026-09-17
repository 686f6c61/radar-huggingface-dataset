# minjaechoi/qwen36-35b-a3b-2p00bit-r9

## Resumen

Este repositorio contiene una cuantizacion experimental del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario minjaechoi bajo el identificador interno "r9". Se trata de un checkpoint de investigacion en el que los expertos enrutados de la capa MoE se almacenan con una precision media de 2,00 bits, mientras que el resto de los pesos permanece en BF16. Un detalle importante es que los pesos se distribuyen ya desquantizados en tensores BF16, de modo que se cargan con `transformers` estandar y con vLLM sin necesidad de kernels personalizados.

El modelo base es un transformer de tipo mixture-of-experts (MoE) de 35.107.181.936 parametros totales, con etiqueta de arquitectura `qwen3_5_moe` y pipeline `image-text-to-text`, lo que indica que la familia base incorpora capacidad multimodal de imagen y texto, ademas de generacion de texto conversacional. El sufijo "A3B" del nombre sugiere del orden de 3.000 millones de parametros activos por token, aunque este dato no se explicita en la informacion disponible.

Su relevancia es acotada y de perfil investigador: no es un modelo afinado para produccion ni una release oficial de Qwen, sino un experimento de cuantizacion agresiva sobre los expertos enrutados. Con 0 descargas y 0 likes en el momento de la consulta, y un README de apenas unas lineas, debe tratarse como material de estudio sobre estrategias de compresion extrema en arquitecturas MoE, no como una opcion lista para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mixture-of-experts (etiqueta `qwen3_5_moe`); pipeline multimodal `image-text-to-text` segun los tags del repositorio |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (el sufijo A3B del modelo base sugiere del orden de 3.000 millones, sin confirmacion en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,00 bits de media; resto de pesos en BF16; pesos distribuidos desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que se hereda la del modelo base, cuya licencia no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen/Qwen3.6-35B-A3B, un transformer con capas de mixture-of-experts identificado con la etiqueta `qwen3_5_moe` en el repositorio. El checkpoint aqui descrito no modifica la topologia: mantiene las dimensiones, el numero de capas y el enrutador del modelo original, y actua unicamente sobre la representacion numerica de los pesos de los expertos enrutados. La innovacion concreta es la asignacion de 2,00 bits de media a esos expertos, un regimen muy por debajo de los 4 bits habituales en cuantizaciones de consumo, mientras que atenciones, embeddings, normalizaciones y el resto de componentes se conservan en BF16.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplico RLHF, DPO u otra fase de alineacion, ya que este repositorio no reentrena el modelo base. Tampoco se documenta la tecnica exacta de cuantizacion (si es post-training quantization, quantisation-aware training o una rutina propia), ni el error de reconstruccion introducido. Un punto tecnico relevante es que la compresion a 2 bits no se traduce en una reduccion del espacio en disco ni de la VRAM necesaria: el repositorio ocupa 70,2 GB porque los tensores se guardan desquantizados en BF16, de modo que el beneficio buscado es evaluar el impacto de la precision reducida en los expertos, no ahorrar memoria.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline declarado `text-generation`, tag `conversational`).
- Procesamiento de imagen y texto de forma conjunta, segun el tag `image-text-to-text` heredado de la familia base.
- Razonamiento y codigo: capacidades esperables del modelo base Qwen3.6-35B-A3B, pero no verificadas ni documentadas en este repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.
- Carga con `transformers` estandar y con vLLM, sin kernels personalizados, segun indica el autor.

## Casos de uso

- Investigacion sobre cuantizacion extrema en MoE: el checkpoint permite medir como degrada la calidad un regimen de 2,00 bits aplicado solo a los expertos enrutados, manteniendo el resto en BF16, como linea base para comparar con tecnicas de 4 y 8 bits.
- Validacion de pipelines de carga en BF16: dado que los pesos se distribuyen desquantizados, sirve para comprobar que un stack basado en `transformers` o vLLM carga el modelo sin modificaciones y sin kernels adicionales.
- Evaluacion de robustez conversacional: con el pipeline `text-generation` y el tag `conversational`, puede emplearse en baterias de prompts multi-turno para detectar degradaciones atribuibles a la cuantizacion de expertos.
- Experimentos multimodales de imagen y texto: el tag `image-text-to-text` permite probar tareas de descripcion de imagenes o respuesta a preguntas visuales, siempre como material de investigacion y no en produccion.
- Analisis de coste de inferencia en MoE: al conservar el enrutador intacto, permite estudiar que expertos se activan y como varia el coste de computo cuando su precision se reduce.
- Docencia y formacion tecnica: util como ejemplo practico de un checkpoint experimental con ficha minima, para ilustrar buenas y malas practicas de documentacion de modelos.
- Generacion de codigo en entornos de prueba: plantillas, tests unitarios o snippets, con la advertencia de que no hay validacion de calidad publicada para esta variante cuantizada.
- No se recomienda su uso en atencion al cliente, produccion ni sistemas con requisitos de licencia claros, dado que la licencia no esta determinada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, y tampoco se documenta la perdida de calidad respecto al modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16, el minimo teorico es de aproximadamente 70,2 GB solo para los pesos (35.107.181.936 parametros x 2 bytes), mas la cache KV, cuyo tamano depende de una longitud de contexto que no se especifica.
- GPU recomendadas: una GPU de 80 GB (H100 80 GB o A100 80 GB) queda muy justa para pesos mas cache; en la practica se recomienda configuracion multi-GPU (2 x A100 80 GB, 2 x H100 80 GB) para contexto largo.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), ni en una RTX 5090 (32 GB), ni en configuraciones de 48 GB, si se mantiene la carga completa en BF16.
- Alternativa con memoria insuficiente: descarga por capas desde disco o reparto entre GPU y CPU, con penalizacion severa de latencia.
- Opciones de despliegue: `transformers` y vLLM, segun indica el autor. No se documenta soporte para llama.cpp, Ollama, TGI ni formato GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota: aunque la etiqueta indique 2,00 bits, no se espera ningun ahorro de memoria frente al modelo base, porque el repositorio ocupa 70,2 GB en tensores BF16.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Precision de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-2p00bit-r9 | 35.107.181.936 | no disponible | Expertos enrutados a 2,00 bits, resto BF16 | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (base) | 35.107.181.936 | no disponible | BF16 | no disponible en la informacion proporcionada | Modelo base referenciado por el autor |
| Otros checkpoints cuantizados de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de contexto, benchmarks ni licencia de las alternativas, por lo que la comparacion se limita a tamano y regimen de precision. No se han encontrado en la busqueda web modelos comparables con especificaciones verificables.

## Limitaciones y advertencias

- Es un checkpoint de investigacion interna ("Internal research checkpoint"), no una release validada ni un modelo afinado para uso general.
- La licencia no esta determinada: el autor remite a la del modelo base, pero esa licencia no se especifica en la informacion disponible, lo que impide confirmar si se permite uso comercial.
- No hay resultados de benchmarks ni evaluacion de calidad, por lo que se desconoce la degradacion introducida por los 2,00 bits en los expertos enrutados.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos y no cuantificado para esta variante; la cuantizacion agresiva puede agravarlo sin que existan mediciones publicadas.
- No se declaran idiomas soportados; el comportamiento multilingue no esta verificado para esta variante.
- Se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- El repositorio ocupa 70,2 GB porque los pesos se guardan en BF16 desquantizado: no hay ahorro de VRAM ni de disco respecto al modelo base pese a la etiqueta de 2 bits.
- Ausencia total de traccion: 0 descargas y 0 likes, sin issues ni discusion que permitan contrastar su funcionamiento real.
- No se documenta soporte para formatos de cuantizacion de consumo (GGUF, GPTQ, AWQ) ni para motores como llama.cpp u Ollama.
- Sesgos conocidos: no disponible; no se ha publicado ningun analisis de sesgo para este checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p00bit-r9
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo: no disponible. Los resultados de la busqueda web no contienen informacion relacionada con el modelo.
