# RunningHubAI/rh-a-model-who-looks-like-song-hye-kyo-lora

## Resumen

`rh-a-model-who-looks-like-song-hye-kyo-lora` es un adaptador LoRA publicado por RunningHubAI en Hugging Face. No es un modelo de lenguaje, sino un conjunto de pesos de bajo rango (584 MiB en un único fichero `flux-lora-SHQ-4.safetensors`) diseñado para inyectar el parecido facial de la actriz surcoreana Song Hye-kyo en un modelo de difusión de la familia Flux. El autor original es el usuario de RunningHub `@153绮梦AI绘画坊`, que lo distribuye a través de la plataforma RunningHub y lo replica en Hugging Face.

El adaptador se enmarca en la serie "Korean Star" del autor y se entrena a partir de la base "F1基础 D" (F1 base D), según indica la model card. Su función es estrictamente generativa visual: no procesa texto, no razona y no tiene capacidades de tool calling ni de agente. La relevancia es, por tanto, acotada al ecosistema de generación de imágenes con ComfyUI y Flux, donde los LoRA de identidad se usan para producir retratos consistentes de una persona concreta.

La información disponible es muy limitada: el repositorio no declara licencia explícita, no publica benchmarks, no especifica idiomas ni pipeline, y no incluye detalles sobre el dataset de entrenamiento (número de imágenes, pasos, learning rate o resolución). Cualquier evaluación técnica más allá de lo aquí indicado debe considerarse no disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de la familia Flux; base declarada "F1基础 D" |
| Parametros totales | no disponible (adaptador LoRA; el fichero pesa 584 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors (precisión nativa del adaptador) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del modelo base Flux) |
| Licencia | no disponible; la model card remite a "la licencia del proyecto original o upstream" sin especificarla |
| Formato de pesos | safetensors (`flux-lora-SHQ-4.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se suman a las proyecciones de atención y/o feed-forward de un transformer de difusión. El modelo base declarado es "F1基础 D", una variante de la familia Flux (arquitectura DiT, Diffusion Transformer, con codificador de texto T5/CLIP en el pipeline completo). El adaptador no modifica la arquitectura del modelo base: solo añade deltas de pesos que se cargan junto a él en ComfyUI o en RunningHub.

No se dispone de información sobre el dataset de entrenamiento: no se indica el número de imágenes de Song Hye-kyo utilizadas, la resolución, el número de pasos, el learning rate, el rango del LoRA ni si se aplicaron técnicas de regularización o captioning. Tampoco se documenta si hubo entrenamiento con RLHF/DPO (no aplicable en difusión) ni innovaciones técnicas destacables. El fichero `flux-lora-SHQ-4.safetensors` sugiere una cuarta iteración del adaptador ("SHQ-4"), pero no se detalla qué cambió respecto a versiones previas.

## Capacidades

- Generación de imágenes de retrato con el parecido facial de Song Hye-kyo, condicionada por prompts de texto a través del pipeline Flux.
- Integración en flujos de ComfyUI mediante el nodo de carga de LoRA (`Load LoRA` / `LoraLoader`).
- Compatible con la plataforma RunningHub para inferencia alojada y con la API de RunningHub.
- Control de estilo e identidad combinable con otros LoRA y con prompts negativos, según el comportamiento estándar de Flux.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias (depende del codificador de texto del modelo base).
- No dispone de modo thinking, visión, audio ni procesamiento de texto.

## Casos de uso

- Retratos consistentes de personaje: usar el LoRA junto a Flux en ComfyUI para generar una serie de imágenes con el mismo rostro en distintas poses y vestuarios, útil para storyboards o mockups de campañas.
- Previsualización de casting y estilismo: generar variaciones de look (peinado, maquillaje, ropa) sobre una identidad concreta antes de una producción real, reduciendo coste de pruebas fotográficas.
- Contenido editorial ilustrativo: crear imágenes de acompañamiento para artículos sobre cultura pop coreana, siempre que se respeten los derechos de imagen de la persona representada.
- Prototipado de personajes para videojuegos o cómics: explorar diseños basados en un rostro de referencia antes de encargar el modelado 3D o el dibujo final.
- Pruebas de pipelines de difusión: emplear el adaptador como caso de test para validar la carga de LoRA, el merge de pesos y el rendimiento en ComfyUI con Flux.
- Demos y experimentos en RunningHub: ejecutar el LoRA a través de la API alojada para comparar resultados sin montar infraestructura local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un LoRA de identidad visual, las métricas habituales (MMLU, HumanEval, GSM8K) no aplican; no se proporcionan métricas de similitud facial (p. ej., cosine similarity con FaceNet), FID ni evaluaciones humanas.

## Requisitos de hardware

- VRAM estimada: el adaptador en sí ocupa 584 MiB, pero requiere cargar el modelo base Flux completo. En fp16, Flux ronda los 22-24 GB de VRAM; en cuantizaciones de 8 bits o GGUF puede bajar a 12-16 GB; en fp8/nf4 a 8-12 GB, dependiendo del pipeline.
- GPU recomendadas: A100 40/80 GB, H100, RTX 4090 (24 GB) para fp16; RTX 3090 (24 GB) y RTX 4080 (16 GB) para cuantizaciones intermedias.
- ¿Cabe en GPU de consumo? Sí, en RTX 4090/3090 con fp16 y en RTX 4070/4060 Ti con cuantización GGUF o fp8, a costa de mayor latencia.
- Opciones de despliegue: ComfyUI (recomendado por el autor), RunningHub (alojado), y pipelines de difusión compatibles con Flux que acepten LoRA en safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusión.
- Latencia y throughput: no disponibles. Dependen del modelo base, la GPU y los pasos de muestreo; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamaño del adaptador | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rh-a-model-who-looks-like-song-hye-kyo-lora | LoRA de identidad | Flux (F1 base D) | 584 MiB | no aplica | no disponible | Hugging Face + RunningHub |
| LoRA de celebridades en Civitai (genéricos) | LoRA de identidad | Flux / SDXL | variable (50-300 MiB) | no aplica | variable por autor | Civitai |
| LoRA de estilo artístico para Flux | LoRA de estilo | Flux | variable | no aplica | variable | Hugging Face / Civitai |

No se dispone de datos de rendimiento comparativo (similitud facial, FID, evaluaciones humanas) para situar este adaptador frente a alternativas. La comparación se limita a aspectos de formato, tamaño y disponibilidad.

## Limitaciones y advertencias

- Sesgos: al entrenarse sobre imágenes de una persona concreta, el LoRA puede reproducir sesgos de iluminación, edad aparente, maquillaje y encuadre presentes en el dataset original, que no se documenta.
- Alucinación visual: como todo modelo de difusión, puede generar rasgos faciales inconsistentes, artefactos en manos, ojos o joyería, y derivar hacia otras identidades si el prompt no está bien condicionado.
- Limitaciones de contexto e idioma: no aplica contexto textual; la calidad depende del codificador de texto de Flux y de la formulación del prompt (inglés recomendado en la práctica).
- Licencia: no se especifica. La model card remite a "la licencia del proyecto original o upstream", lo que impide confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia de Flux y los derechos de imagen de la persona representada antes de cualquier uso comercial.
- Derechos de imagen: generar y distribuir imágenes de una persona real identificable puede infringir derechos de publicidad o imagen en muchas jurisdicciones; el uso comercial requiere consentimiento explícito.
- Producción: sin benchmarks, sin pipeline declarado y sin versionado documentado, el adaptador no es apto para despliegues críticos sin una evaluación previa propia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/RunningHubAI/rh-a-model-who-looks-like-song-hye-kyo-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/1833608845867511809
- Página del autor en RunningHub: https://www.runninghub.cn/user-center/1818897578619469826
- RunningHub International: https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentación de la API (EN): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentación de la API (CN): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento en RunningHub: https://www.runninghub.ai/page-model
