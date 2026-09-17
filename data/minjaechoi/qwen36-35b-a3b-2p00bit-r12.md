# minjaechoi/qwen36-35b-a3b-2p00bit-r12

## Resumen

Qwen3.6-35B-A3B — 2.00-bit routed experts (r12) es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace. Consiste en una cuantización agresiva del modelo base Qwen/Qwen3.6-35B-A3B, en la que únicamente los expertos enrutados (la parte MoE de la red) se comprimen a una media de 2,00 bits por peso, mientras que el resto de la red permanece en BF16. El checkpoint se identificó internamente como "r12" y está pensado como material de estudio más que como artefacto de producción.

El modelo conserva los 35.107.181.936 parámetros del modelo base, con una arquitectura de tipo transformer con mezcla de expertos (MoE), según la etiqueta `qwen3_5_moe`. El sufijo "A3B" del nombre sugiere del orden de 3.000 millones de parámetros activos por token, aunque este dato no se confirma en la información disponible. La etiqueta `image-text-to-text` apunta a capacidades multimodales, si bien la model card únicamente describe el proceso de cuantización.

Su relevancia es fundamentalmente metodológica: explora hasta dónde se puede comprimir la capa MoE de un modelo de 35B sin tocar el resto de los pesos y manteniendo la compatibilidad con `transformers` y vLLM. Es un caso útil para estudiar el equilibrio entre ahorro de cómputo en expertos y preservación de calidad, aunque no se han publicado evaluaciones, la licencia no está especificada y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de libreria `qwen3_5_moe`. La etiqueta `image-text-to-text` sugiere soporte multimodal |
| Parametros totales | 35.107.181.936 (~35,1 B), dato real de los tensores safetensors |
| Parametros activos | ~3 B (inferido del sufijo A3B del nombre; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,00 bits de media; el resto de pesos en BF16. Los pesos se almacenan ya desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible. La model card indica que hereda la licencia del modelo base Qwen/Qwen3.6-35B-A3B, sin especificar cual es |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es una derivada directa de Qwen/Qwen3.6-35B-A3B, una arquitectura transformer con mezcla de expertos. La intervención del autor se limita a la cuantizacion post-entrenamiento de los expertos enrutados, que quedan a una media de 2,00 bits por peso, mientras que todos los demás componentes (atencion, embeddings, normalizaciones, router y expertos compartidos, si los hubiera) se mantienen en BF16. No hay indicios de entrenamiento adicional, ajuste fino, RLHF ni DPO posteriores a la cuantizacion; se trata de un checkpoint de investigación interno.

El detalle tecnico mas relevante es que la cuantizacion de 2 bits no se materializa en el almacenamiento: los pesos se guardan ya desquantizados en tensores BF16, de modo que el repositorio ocupa 70,2 GB, coherente con 35,1 B de parametros a 2 bytes por peso. Esto implica que la ventaja del esquema no es el ahorro de memoria o disco en inferencia, sino servir como referencia para estudiar el impacto de la compresion extrema en la capa MoE. La carga se realiza con `transformers` estandar y con vLLM, sin necesidad de kernels personalizados. No se documentan innovaciones adicionales como atencion lineal, decodificacion especulativa ni variantes SSM o hibridas.

## Capacidades

- Generacion de texto y mantencion de conversaciones multi-turno, segun las etiquetas `text-generation` y `conversational` del repositorio.
- Razonamiento y generacion de codigo: capacidades presumiblemente heredadas del modelo base Qwen3.6-35B-A3B, no verificadas en la informacion disponible.
- Procesamiento de imagen y texto: la etiqueta `image-text-to-text` indica soporte multimodal, aunque la model card no lo detalla ni lo confirma.
- Despliegue en endpoints compatibles: la etiqueta `endpoints_compatible` sugiere integracion con infraestructura de inferencia gestionada.
- Ejecucion en vLLM y `transformers` sin modificaciones, al usar pesos BF16 estandar.
- Tool calling, function calling y comportamiento agentico: no disponible, no se mencionan en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigacion sobre cuantizacion extrema en MoE: el checkpoint permite medir la degradacion de calidad al comprimir solo los expertos enrutados a 2,00 bits, comparando contra el modelo base en BF16 con el mismo prompt y la misma configuracion de decodificacion.
- Analisis de tecnicas de compresion: util para estudiar tecnicas de quantizacion de baja precision (por ejemplo, variantes de escalado por grupo o por canal) aplicadas exclusivamente a la capa de expertos.
- Generacion de texto a gran escala en investigacion: gracias a la arquitectura MoE con un subconjunto pequeno de parametros activos por token, es adecuado para experimentos de throughput alto en entornos con GPU de 80 GB, siempre que la calidad resultante se valide primero.
- Servicio de inferencia en cluster con vLLM: al cargarse con vLLM estandar y pesos BF16, se puede integrar en un despliegue existente sin kernels propios, usando paralelismo tensorial para repartir los 70 GB de pesos.
- Evaluacion comparativa de checkpoints cuantizados: sirve como punto de referencia dentro de una bateria interna que compare el modelo base, este checkpoint r12 y futuras variantes r13, r14, etc.
- Docencia y formacion tecnica: caso practico para explicar como se organiza una capa MoE, que papel juega el router y por que comprimir expertos afecta de forma distinta que comprimir la atencion.
- Experimentos multimodales exploratorios: si se confirma el soporte `image-text-to-text`, podria emplearse en tareas de descripcion de imagenes o respuesta visual a preguntas, aunque no hay ninguna evaluacion publicada que lo respalde.
- Atencion al cliente automatizada: solo recomendable tras validar la calidad del checkpoint, ya que no se han publicado evaluaciones y el riesgo de respuestas degradadas por la cuantizacion es real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni comparaciones con el modelo base en BF16.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 70 GB solo para los pesos, ya que se almacenan en BF16 (35,1 B de parametros x 2 bytes). Hay que anadir la cache KV y las activaciones, cuyo tamano depende de la longitud de contexto, que no esta documentada.
- GPU recomendadas: H100 80 GB o A100 80 GB en configuracion mononodo para BF16; varias A100 40 GB o L40S 48 GB con paralelismo tensorial si no se dispone de 80 GB en una sola tarjeta.
- Cabe en GPU de consumo: no en una sola unidad. Seria necesario repartir el modelo entre varias RTX 4090 de 24 GB (cuatro o mas) con paralelismo tensorial, o recurrir a offload parcial a CPU, con la penalizacion de latencia correspondiente.
- Opciones de despliegue: `transformers` y vLLM, tal como indica la model card. No se proporcionan pesos GGUF, por lo que llama.cpp y Ollama no estan soportados de forma directa sin una conversion previa. Tampoco se documenta compatibilidad con TGI u otros servidores.
- Latencia y throughput estimados: no disponible. La arquitectura MoE con un numero reducido de parametros activos por token tiende a ofrecer un throughput alto, pero no hay cifras publicadas para este checkpoint.
- Almacenamiento: 70,2 GB en el repositorio de HuggingFace, mas el espacio necesario para la cache durante la carga.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen36-35b-a3b-2p00bit-r12 (este) | 35,1 B | ~3 B (inferido) | no disponible | safetensors BF16 | no disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B | ~3 B (inferido) | no disponible | safetensors | no disponible | HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables sobre otros modelos comparables (por ejemplo, otros checkpoints Qwen con mezcla de expertos o cuantizaciones de 2 bits de la misma familia), por lo que no se incluyen cifras que no puedan contrastarse.

## Limitaciones y advertencias

- Es un checkpoint de investigacion interno, segun declara el propio autor, y no un artefacto destinado a produccion.
- No se han publicado evaluaciones de calidad: se desconoce cuanto degrada la cuantizacion a 2,00 bits de los expertos enrutados respecto al modelo base en BF16.
- La cuantizacion no reduce el uso de memoria ni el espacio en disco: los pesos se guardan ya desquantizados en BF16, por lo que el repositorio ocupa 70,2 GB.
- La licencia no esta especificada en la ficha; la model card remite a la del modelo base Qwen/Qwen3.6-35B-A3B, cuyo termino concreto no se detalla. Antes de cualquier uso comercial hay que verificar la licencia del modelo base.
- Los idiomas soportados no estan documentados.
- La longitud de contexto no esta documentada, lo que impide planificar despliegues con requisitos de ventana larga.
- Existe una posible incoherencia entre etiquetas: el repositorio incluye `qwen3_5_moe` mientras el modelo base declarado es Qwen3.6-35B-A3B, y la etiqueta `image-text-to-text` no aparece respaldada por la model card. Conviene validar ambas cosas antes de asumir esas capacidades.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo, agravado aqui por la ausencia de evaluaciones y por la compresion agresiva de los expertos.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia de uso en la comunidad ni validacion independiente.
- No se ofrecen pesos GGUF ni versiones alternativas de cuantizacion, lo que limita su uso en entornos de CPU o en GPUs de consumo.
- La fecha de creacion y actualizacion es el 17 de septiembre de 2026, ambas el mismo dia, lo que sugiere una publicacion puntual sin mantenimiento posterior conocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p00bit-r12
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio adicional: no disponible
- Demo o espacio asociado: no disponible
- Busqueda web: los resultados devueltos no guardan relacion con el modelo (contenido sobre compraventa de minerales en Magdeburgo, Alemania), por lo que no se incluye ningun enlace adicional.
