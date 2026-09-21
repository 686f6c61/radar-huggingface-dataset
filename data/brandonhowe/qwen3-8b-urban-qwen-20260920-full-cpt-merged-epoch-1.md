# BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-1

## Resumen

Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-1 es un modelo derivado de Qwen/Qwen3-8B-Base publicado por el usuario BrandonHowe en HuggingFace. No se trata de un modelo nuevo entrenado desde cero, sino del resultado de un proceso de preentrenamiento continuado (continued pretraining, CPT) sobre el dataset `CompassioninMachineLearning/urban_12738_cleaned`, seguido de una fusión de pesos a BF16 en formato standalone, sin adaptadores LoRA. El checkpoint corresponde a la epoca 1.0, paso 378.

El modelo conserva la arquitectura del base: un transformer decoder-only de la familia Qwen3 con 8.190.735.360 parametros (~8,19 mil millones) y pesos en BF16 distribuidos en ocho shards safetensors. El repositorio ocupa 16,4 GB. La model card indica que se usaron 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos.

Su relevancia es acotada y de caracter experimental: se trata de un artefacto de investigacion sobre adaptacion de dominio mediante CPT, con 0 descargas y 0 likes en el momento de la consulta, sin licencia ni idiomas declarados, y sin resultados de evaluacion publicados. La propia model card advierte que el entrenamiento no demuestra una mejora en compasion y que eso debe evaluarse por separado. Los resultados de busqueda web asociados a esta consulta no aportan informacion tecnica sobre el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3, heredada del base); numero de capas y configuracion de atencion no disponible |
| Parametros totales | 8.190.735.360 (~8,19 mil millones, dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; heredada del base Qwen/Qwen3-8B-Base |
| Tipos de cuantizacion | Pesos publicados unicamente en BF16; no se distribuyen GGUF, AWQ, GPTQ ni variantes INT8/INT4 oficiales |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (8 shards, BF16, fusion sin adaptadores) |
| Modelo base | Qwen/Qwen3-8B-Base |
| Dataset de entrenamiento | CompassioninMachineLearning/urban_12738_cleaned (revision ef7c0e742df63ea319e35d02d9f6ba63d6e7c68d) |
| Checkpoint publicado | Epoca 1.0, paso 378 |
| Tamano del repositorio | 16,4 GB |
| Biblioteca de inferencia | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura no se modifica respecto al modelo base: es un transformer decoder-only de la familia Qwen3 con 8.190.735.360 parametros. La model card no detalla el numero de capas, la configuracion de atencion (GQA u otra), la dimension oculta ni el tipo de normalizacion, por lo que esos datos deben consultarse en la ficha de Qwen/Qwen3-8B-Base. No hay componentes MoE, SSM ni hibridos: es un transformer denso.

El entrenamiento consistio en un preentrenamiento continuado sobre dos corpus: 10.072 documentos distintos mas 2.000 exposiciones repetidas por epoca, con 200 documentos de validacion disjuntos. No se documenta el numero total de tokens procesados, la composicion linguistica del dataset, la mezcla con datos generales para mitigar olvido catastrofico ni si hubo fases posteriores de RLHF, DPO o SFT. La model card tampoco especifica la tasa de aprendizaje, el optimizador ni la configuracion de precision durante el entrenamiento. La exportacion se realizo con la funcion nativa de Unsloth `save_pretrained_merged(save_method="merged_16bit")`, que fusiona los pesos en BF16 validado y los empaqueta sin perdida en ocho shards safetensors, de modo que no se necesita cargar un adaptador. El repositorio incluye un `run_manifest.json` con la revision base, los hashes de seleccion de documentos, los parametros de entrenamiento y la validacion de la exportacion.

## Capacidades

- Generacion de texto autoregresiva: completado y continuacion de texto en el estilo y dominio del corpus de CPT. El pipeline declarado es text-generation.
- Adaptacion de dominio: el objetivo del CPT es desplazar la distribucion del modelo hacia el material de `urban_12738_cleaned`; la magnitud real de esa adaptacion no esta cuantificada.
- Etiqueta de conversacion: la model card incluye el tag `conversational`, aunque al derivar de un modelo base no hay garantia de seguir instrucciones ni de disponer de plantilla de chat.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado.
- Capacidades multilingues: no disponibles; no se declaran idiomas en la ficha.
- Vision, audio o multimodalidad: no soportado.
- Modo de razonamiento explicito (thinking mode): no documentado en este derivado.
- Compatibilidad de despliegue: soporta `text-generation-inference` y `endpoints_compatible` segun los tags del repositorio.

## Casos de uso

- Estudio de preentrenamiento continuado en dominio: sirve como artefacto reproducible para analizar como un CPT corto (una epoca, 378 pasos) sobre ~10.000 documentos altera el comportamiento de un modelo base de 8B.
- Analisis de olvido catastrofico: comparar este checkpoint con Qwen/Qwen3-8B-Base en tareas generales permite medir la degradacion fuera de dominio, un punto que la model card no aborda.
- Punto de partida para ajuste supervisado posterior: al entregarse fusionado y sin adaptador, se puede cargar directamente con transformers y aplicar SFT encima para tareas concretas del dominio urbano.
- Generacion de texto de dominio para completado: en pipelines de autocompletado o redaccion asistida dentro del nicho del corpus, siempre que se valide antes la calidad real de las salidas.
- Generacion de datos sinteticos de dominio: usar el modelo para producir borradores o variaciones de texto sobre tematicas urbanas, sujetos a revision humana por el riesgo de alucinacion propio de un modelo base.
- Investigacion sobre alineacion y compasion: la model card menciona explicitamente que el entrenamiento no establece una mejora en compasion, por lo que el checkpoint es util como objeto de evaluacion de esa hipotesis, no como solucion desplegada.
- Reproducibilidad de experimentos: el `run_manifest.json` con hashes de documentos y parametros permite replicar o auditar el entrenamiento en entornos de investigacion.
- Base para experimentos de cuantizacion: al publicarse solo en BF16, es un candidato para estudiar la perdida de calidad al convertir a GGUF o INT4, aunque esas conversiones no se distribuyen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan numeros de perplejidad sobre el conjunto de validacion de 200 documentos.

## Requisitos de hardware

- VRAM en BF16: los pesos ocupan aproximadamente 16,4 GB; con cache KV y overhead de runtime hay que prever del orden de 18 a 22 GB para contextos moderados. La cifra exacta depende de la longitud de contexto, que no esta documentada en esta ficha.
- VRAM en INT8 (bitsandbytes): aproximadamente 9 a 11 GB.
- VRAM en INT4 o GGUF Q4_K_M: aproximadamente 5 a 7 GB. Requiere conversion propia, ya que no se distribuyen pesos cuantizados.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB permiten BF16 con contexto amplio y batching.
- GPU consumer de gama alta: RTX 4090, RTX 3090 y RTX 5090 (24-32 GB) admiten BF16 sin cuantizar; RTX 4080 y RTX 4070 Ti Super (16 GB) quedan al limite y suelen requerir INT8 o INT4.
- GPU consumer de 8-12 GB: solo viables con cuantizacion INT4/GGUF, con perdida de calidad no medida para este checkpoint.
- Opciones de despliegue: transformers, Text Generation Inference (TGI, indicado en los tags), vLLM, y llama.cpp u Ollama previa conversion a GGUF. Unsloth aparece como herramienta de exportacion, no como runtime de inferencia.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-1 | 8,19 B | no disponible | no disponible | 0 descargas, 0 likes | Derivado CPT de Qwen3-8B-Base, solo BF16, sin benchmarks |
| Qwen/Qwen3-8B-Base | ~8,2 B | 32.768 tokens nativo (ampliable con YaRN) | Apache 2.0 | Modelo base ampliamente distribuido | Referencia directa del derivado; incluye configuracion y plantillas documentadas |
| Llama 3.1 8B | 8,03 B | 128.000 tokens | Licencia comunitaria Llama 3.1 | Amplia distribucion y ecosistema | Alternativa generalista con contexto mucho mayor |
| Mistral 7B v0.3 | 7,25 B | 32.000 tokens | Apache 2.0 | Amplia distribucion | Alternativa de tamano similar con licencia permisiva |

Nota: los datos de Qwen3-8B-Base, Llama 3.1 8B y Mistral 7B v0.3 provienen de su documentacion publica y no han sido verificados contra la informacion de origen de esta ficha. El rendimiento relativo de este derivado frente a ellos no puede establecerse porque no hay evaluaciones publicadas.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, el uso comercial queda en una situacion juridica indeterminada, aunque el modelo base Qwen3-8B-Base se distribuya bajo Apache 2.0. Conviene aclararlo con el autor antes de cualquier uso productivo.
- Idiomas no declarados: no se puede asumir cobertura multilingue ni siquiera el ingles como idioma principal del CPT.
- Riesgo de alucinacion: al ser un derivado de un modelo base sin fases documentadas de alineacion (RLHF/DPO) ni ajuste de instrucciones, la probabilidad de generar contenido verosimil pero falso es alta.
- Olvido catastrofico: no se documenta mezcla con datos generales durante el CPT, por lo que es plausible una degradacion en capacidades fuera del dominio urbano. No hay mediciones que lo confirmen ni lo descarten.
- Volumen de entrenamiento reducido: 10.072 documentos mas 2.000 repeticiones por epoca y una sola epoca en el checkpoint publicado limitan el alcance real de la adaptacion.
- Validacion debil: el conjunto de validacion tiene solo 200 documentos disjuntos y no se publican metricas sobre el.
- Instrucciones y tool calling no garantizados: es un modelo base con CPT, no un modelo instruct; no hay plantilla de chat documentada.
- Sesgos: no se ha realizado ninguna evaluacion de sesgo, toxicidad o sesgo de representacion sobre el corpus de entrenamiento ni sobre las salidas.
- Validez cientifica: la model card advierte explicitamente de que el entrenamiento no establece una mejora en compasion; cualquier afirmacion en ese sentido requiere evaluacion independiente.
- Adopcion nula: con 0 descargas y 0 likes, no existe validacion por parte de la comunidad ni informes de terceros sobre su comportamiento.
- Unica precision disponible: al publicarse solo en BF16, cualquier cuantizacion necesaria para desplegarlo en hardware limitado corre por cuenta del usuario y sin garantias de calidad.
- Fecha de publicacion: el repositorio figura creado el 2026-09-21, con una actualizacion un minuto despues, lo que sugiere una publicacion sin mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BrandonHowe/Qwen3-8b-urban-qwen-20260920-full-CPT-merged-epoch-1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/CompassioninMachineLearning/urban_12738_cleaned
- Herramienta de exportacion (Unsloth): https://github.com/unslothai/unsloth
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- Los resultados de busqueda web disponibles para esta consulta (TikTok, calendario de la Isle of Man TT) no guardan relacion con el modelo y no aportan enlaces tecnicos relevantes.
