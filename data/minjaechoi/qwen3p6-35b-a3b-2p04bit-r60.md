# minjaechoi/qwen3p6-35b-a3b-2p04bit-r60

## Resumen

El modelo `minjaechoi/qwen3p6-35b-a3b-2p04bit-r60` es un checkpoint derivado de `Qwen/Qwen3.6-35B-A3B`, publicado por el usuario minjaechoi, en el que se ha aplicado una cuantizacion extrema sobre los expertos enrutados de una arquitectura de mezcla de expertos (MoE). Concretamente, los expertos enrutados quedan almacenados con una media de 2,0431 bits por peso, mientras que el resto de los pesos del modelo permanece en BF16. El modelo suma 35.107.181.936 parametros totales segun los tensores safetensors del repositorio.

Se trata, segun la propia model card, de un "checkpoint de investigacion interno" con identificador interno r60, no de un lanzamiento estable. Un detalle tecnico relevante es que los pesos se guardan ya dequantizados en tensores BF16, de modo que se cargan con `transformers` y vLLM estandar: la compresion afecta al almacenamiento resultante de la cuantizacion aplicada durante el proceso, pero el repositorio ocupa 70,2 GB, coherente con una carga en BF16 (aproximadamente 2 bytes por parametro) y sin ahorro directo de memoria en inferencia frente al modelo base sin cuantizar.

El interes actual de esta ficha es acotado y hay que enmarcarlo con honestidad: no hay benchmarks publicados, no se declara licencia ni idiomas en los metadatos, el repositorio no tiene descargas ni valoraciones, y la busqueda web disponible no devolvio ninguna fuente util sobre el modelo. Por tanto, debe tratarse como material de estudio para evaluar tecnicas de compresion agresiva de capas MoE, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; etiqueta de arquitectura `qwen3_5_moe` en HuggingFace |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | no disponible en la model card; la nomenclatura del modelo base (A3B) sugiere del orden de 3 B activos, sin confirmacion oficial |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,0431 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en los metadatos; el autor indica que sigue la licencia del modelo base |
| Formato de pesos | safetensors |
| Tamano del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Identificador interno | r60 |
| Fecha de publicacion | 5 de octubre de 2026 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con capas de mezcla de expertos enrutados, segun la etiqueta `qwen3_5_moe` asociada al repositorio. El modelo base, `Qwen/Qwen3.6-35B-A3B`, corresponde a la familia Qwen y presenta una denominacion que indica aproximadamente 35.000 millones de parametros totales con alrededor de 3.000 millones activos por token (patron habitual A3B en los MoE de Qwen), aunque la model card de este checkpoint no desglosa el reparto entre parametros activos y totales ni el numero de expertos por capa.

La intervencion de minjaechoi no es un reentrenamiento ni un ajuste fino, sino una cuantizacion selectiva: los expertos enrutados se comprimen a una media de 2,0431 bits por peso, mientras que el resto de componentes (atencion, embeddings, normalizaciones y demas pesos no enrutados) se mantiene en BF16. No se documentan en la informacion disponible ni el dataset de entrenamiento, ni el numero de tokens, ni si hubo fases de RLHF o DPO, ni el metodo exacto de cuantizacion (tipo de escalas, granularidad por grupo o por canal, o si se aplico calibracion). Tampoco se especifica si la dequantizacion se materializa al cargar el modelo o durante el forward.

Un punto que conviene subrayar tecnicamente: al estar los pesos guardados en BF16 ya dequantizados, el checkpoint no reduce el consumo de VRAM en inferencia respecto al modelo base en BF16. El interes del experimento esta en el estudio del impacto en calidad de una compresion a ~2 bits sobre las capas de expertos, no en una mejora de eficiencia de despliegue.

## Capacidades

La model card no documenta capacidades explicitas mas alla de la etiqueta de pipeline `text-generation`. A partir de los metadatos disponibles se puede indicar lo siguiente, siempre con caracter provisional:

- Generacion de texto y uso conversacional, segun las etiquetas `text-generation` y `conversational` del repositorio.
- Compatibilidad declarada con endpoints y con `transformers` y vLLM estandar, ya que los pesos son tensores BF16 cargables sin kernels de cuantizacion personalizados.
- Posible capacidad multimodal: el repositorio incluye la etiqueta `image-text-to-text`, lo que apuntaria a entrada de imagen y texto, pero el pipeline declarado es `text-generation` y la model card no describe procesamiento de vision. La contradiccion entre ambas etiquetas no esta resuelta en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

Dado que se trata de un checkpoint de investigacion sin benchmarks ni licencia declarada, los casos de uso realistas son de evaluacion y experimentacion, no de produccion en cliente final:

- Estudio de cuantizacion extrema en MoE: permite medir como degrada la perplejidad y la calidad de generacion al comprimir los expertos enrutados a ~2 bits, comparando directamente contra el modelo base en BF16 con el mismo prompt set.
- Investigacion sobre el sesgo de enrutamiento: al comprimir solo las capas de expertos, es un banco de pruebas util para analizar si el router sigue seleccionando los mismos expertos y si la distribucion de carga cambia tras la dequantizacion.
- Reproduccion de pipelines de compresion: sirve como referencia para validar herramientas propias de cuantizacion que operen a nivel de tensor sobre arquitecturas MoE, dado que el artefacto final es un repositorio safetensors estandar.
- Evaluacion comparativa de frameworks de servicio: se puede desplegar en vLLM y en `transformers` sin cambios de codigo y comparar latencia, throughput y uso de VRAM frente al modelo base, ya que la huella de memoria deberia ser muy similar.
- Pruebas de generacion de texto en entornos internos aislados: para tareas de resumen, parafrasis o asistencia conversacional en un laboratorio, siempre que se asuma la ausencia de validacion de calidad publicada.
- Analisis de calidad multilingue: no hay idiomas declarados, de modo que un caso de uso legitimo es precisamente auditar que idiomas mantiene el modelo tras la compresion agresiva de expertos.
- Base para ajuste fino ligero: los pesos en BF16 permiten aplicar LoRA o QLoRA sobre el checkpoint para estudiar si el ajuste recupera parte de la calidad perdida por la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica el valor medio de bits de los expertos enrutados (2,0431), sin tablas de MMLU, HumanEval, GSM8K, MMLU-Pro, GPQA ni ninguna otra evaluacion, y no se ofrece comparacion cuantitativa con el modelo base. Tampoco hay datos de throughput ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 70,2 GB solo para pesos (35,1 B x 2 bytes), mas el espacio de la cache KV, que depende de la longitud de contexto (no publicada).
- No cabe en GPUs de consumo: una RTX 4090 o RTX 3090 con 24 GB no es suficiente, ni siquiera repartiendo el modelo entre dos de ellas (48 GB). Serian necesarias al menos tres o cuatro GPU de 24 GB con tensor parallelism, sin margen comodo para contexto largo.
- GPU recomendadas: una H100 de 80 GB o una A100 de 80 GB pueden alojar los pesos en una sola tarjeta con poco margen; configuraciones multi-GPU como 2x A100 40 GB o 2x H100 en tensor parallelism son mas holgadas.
- Opciones de despliegue: `transformers` con pesos safetensors y vLLM, ambas mencionadas explicitamente en la model card. No se ha publicado version GGUF, por lo que llama.cpp, Ollama o LM Studio no estan soportados con este artefacto. Tampoco hay evidencia de soporte en TGI.
- Latencia y throughput: no disponible. La activacion de aproximadamente 3 B de parametros por token (segun la nomenclatura del modelo base) sugeriria un coste de computo moderado para el tamano total, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p04bit-r60 | 35,1 B | no disponible | no disponible | no disponible | safetensors (BF16 dequantizado) | Checkpoint de investigacion, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B (referencia del derivado) | no disponible | no disponible | no disponible en la informacion proporcionada | safetensors | Modelo base oficial de Qwen |
| Otras alternativas MoE de ~30-35 B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de rendimiento ni de contexto para establecer una comparativa cuantitativa con modelos de la misma categoria. La unica comparacion defendible con la informacion disponible es frente al modelo base, del que este checkpoint se diferencia exclusivamente por la cuantizacion de los expertos enrutados.

## Limitaciones y advertencias

- Es un checkpoint de investigacion interno segun su propia model card, sin garantia de estabilidad ni de mantenimiento.
- No hay licencia declarada en los metadatos de HuggingFace: el autor afirma que sigue la licencia del modelo base, pero esa licencia no se concreta en la informacion disponible. Usarlo comercialmente sin verificar la licencia de Qwen/Qwen3.6-35B-A3B es un riesgo legal.
- Cero descargas y cero valoraciones: no existe validacion por parte de la comunidad ni reportes independientes de calidad.
- Ausencia total de benchmarks: no hay evidencia publicada de que la cuantizacion a 2,0431 bits en los expertos preserve el rendimiento del modelo original. La degradacion esperada en tareas de razonamiento y codigo es plausible pero no esta medida.
- No hay ahorro de memoria en inferencia, porque los pesos se almacenan dequantizados en BF16 y el repositorio ocupa 70,2 GB, practicamente lo mismo que el modelo base sin comprimir.
- No se declaran idiomas soportados, por lo que no se puede garantizar un comportamiento correcto en castellano ni en otros idiomas.
- No se publica la longitud de contexto, dato critico para planificar memoria de cache KV y para casos de uso con documentos largos.
- Contradiccion entre etiquetas: `image-text-to-text` frente a un pipeline declarado `text-generation`, sin documentacion que aclare si hay torre de vision o procesador multimodal.
- Riesgo de alucinacion inherente a los modelos generativos, agravado por la falta de evaluaciones y por la compresion agresiva de pesos.
- Sin cuantizaciones alternativas publicadas (GGUF, AWQ, GPTQ), las opciones de despliegue quedan limitadas a `transformers` y vLLM sobre hardware de gama alta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p04bit-r60
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autor ni su proceso de cuantizacion; los enlaces obtenidos no guardan relacion con el tema y se omiten por no ser fuentes utilizables. No se dispone por tanto de paper, blog tecnico, repositorio de codigo ni demo asociados.
