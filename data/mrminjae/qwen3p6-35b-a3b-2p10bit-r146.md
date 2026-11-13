# mrminjae/qwen3p6-35b-a3b-2p10bit-r146

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p10bit-r146` es una cuantizacion experimental del modelo Qwen3.6-35B-A3B, un transformer con arquitectura MoE (mixture of experts) publicado por Alibaba Qwen. El checkpoint, alojado por el usuario mrminjae, aplica una cuantizacion selectiva: los expertos enrutados se almacenan a una media de 2,10 bits, mientras que el resto de pesos permanece en BF16. Los pesos se guardan desquantizados en tensores BF16, de modo que cargan directamente con `transformers` o vLLM sin necesidad de kernels especializados.

El modelo base resuelve tareas de generacion de texto y de imagen a texto (el tag `image-text-to-text` sugiere capacidades multimodales), con arquitectura `qwen3_5_moe` y 67.319.436.656 parametros totales segun el recuento real de safetensors. La ficha del autor lo describe como un checkpoint interno de investigacion (ID `r146`), sin publicacion de benchmarks ni detalles sobre el dataset de entrenamiento o el proceso de cuantizacion.

Su relevancia es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, creado el 13 de noviembre de 2026, y no una release oficial de Qwen. Resulta util para quien quiera experimentar con cuantizacion extrema de expertos MoE manteniendo el resto de la red en BF16, pero no es una opcion recomendada para produccion sin validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen3_5_moe`) |
| Parametros totales | 67.319.436.656 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados desquantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la del modelo base, Qwen/Qwen3.6-35B-A3B; la licencia concreta de este no se especifica en la informacion proporcionada) |
| Formato de pesos | safetensors (BF16 desquantizado) |

## Arquitectura y entrenamiento

El checkpoint deriva del modelo base Qwen/Qwen3.6-35B-A3B, cuya arquitectura es un transformer con mezcla de expertos (MoE) segun el tag `qwen3_5_moe`. El recuento real de parametros en safetensors es de 67.319.436.656, muy superior a los 35B que sugiere el nombre comercial del modelo base, lo que indica que el identificador "35B" probablemente hace referencia a parametros activos o a una convencion de nombrado del autor original, no al total almacenado. El dato de parametros activos no esta disponible en la informacion proporcionada.

El proceso de cuantizacion aplicado por mrminjae es selectivo: solo los expertos enrutados se comprimen a una media de 2,10 bits, mientras que el resto de la red (atencion, embeddings, capas densas, router) permanece en BF16. Los pesos resultantes se almacenan desquantizados en tensores BF16, lo que permite cargarlos con `transformers` y vLLM estandar sin kernels de cuantizacion personalizados. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO en el modelo base. El repositorio ocupa 134,7 GB.

## Capacidades

- Generacion de texto conversacional y de proposito general, segun el pipeline `text-generation`.
- Procesamiento de imagen a texto (`image-text-to-text`), lo que sugiere capacidades multimodales heredadas del modelo base.
- Razonamiento multi-paso y uso de herramientas: no confirmado en la informacion proporcionada; depende de las capacidades del modelo base Qwen3.6-35B-A3B, que no se detallan.
- Soporte multilingue: no disponible.
- Modo "thinking" o razonamiento extendido: no disponible.
- Al ser un checkpoint cuantizado, las capacidades funcionales deberian ser equivalentes a las del modelo base, con posible degradacion por la cuantizacion agresiva de expertos.

## Casos de uso

- Investigacion en cuantizacion extrema de MoE: el checkpoint permite estudiar como afecta comprimir solo los expertos enrutados a 2,10 bits mientras el resto de la red permanece en BF16, comparando calidad frente al modelo base sin cuantizar.
- Despliegue en entornos con VRAM limitada: al reducir el peso de los expertos, el checkpoint ocupa menos que el modelo base completo, lo que facilita probarlo en GPUs de gama alta consumer o en nodos con menos memoria, aunque el repo de 134,7 GB sigue requiriendo almacenamiento considerable.
- Evaluacion de pipelines con transformers y vLLM: al cargar con herramientas estandar sin kernels especializados, sirve para validar flujos de inferencia y comparar latencia y throughput frente al modelo original.
- Prototipado de asistentes multimodales: el tag `image-text-to-text` permite experimentar con tareas de descripcion de imagenes o respuesta a preguntas visuales en fase de prototipo, siempre validando la calidad tras la cuantizacion.
- Reproducibilidad de experimentos internos: al estar identificado como checkpoint interno (r146), es util para replicar resultados de investigacion del autor o como referencia en estudios comparativos de tecnicas de cuantizacion.
- Fine-tuning ligero sobre expertos comprimidos: permite explorar si el ajuste fino posterior recupera calidad perdida por la cuantizacion, aunque no hay datos publicados sobre su comportamiento en este escenario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. El repo ocupa 134,7 GB en safetensors BF16; en carga completa se necesita al menos esa cantidad de memoria, aunque el peso efectivo de los expertos es menor por la cuantizacion a 2,10 bits.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del checkpoint, se requeririan GPUs de datacenter (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- Compatibilidad con GPU consumer: no confirmada; el tamano del repo y el recuento de parametros sugieren que no cabe en una sola GPU consumer de 24 GB sin tecnicas adicionales de offloading.
- Opciones de despliegue: `transformers` y vLLM, segun indica el autor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r146 | 67.319.436.656 | no disponible | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face (referenciado) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa de rendimiento rigurosa.

## Limitaciones y advertencias

- Checkpoint de investigacion interna (ID r146): no es una release oficial ni estable; no hay garantia de soporte ni mantenimiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- Cuantizacion agresiva de expertos a 2,10 bits: es esperable una degradacion de calidad respecto al modelo base, aunque no se han publicado mediciones.
- Ausencia total de benchmarks: no se puede afirmar nada sobre el rendimiento real del checkpoint.
- Licencia no especificada de forma explicita: el autor remite a la licencia del modelo base, que no se detalla; verificar antes de cualquier uso comercial.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue.
- Longitud de contexto no documentada: limita la planificacion de casos de uso con contextos largos.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion proporcionada; se heredan los del modelo base, que tampoco se detallan.
- Fecha de creacion futura (2026-11-13) respecto a la consulta: conviene verificar la vigencia y procedencia del artefacto antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r146
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
