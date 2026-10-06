# minjaechoi/qwen3p6-35b-a3b-2p07bit-r64

## Resumen

Qwen3.6-35B-A3B (r64) es un checkpoint de investigación interna publicado por el usuario minjaechoi sobre el modelo base Qwen/Qwen3.6-35B-A3B. Se trata de un modelo de arquitectura de mezcla de expertos (MoE) de aproximadamente 35.100 millones de parámetros totales, en el que únicamente los expertos enrutados han sido cuantizados a una media de 2,0729 bits, mientras que el resto de los pesos se mantiene en BF16. Es un ajuste fino sobre el modelo base, no un entrenamiento desde cero.

La particularidad de esta publicación es que los pesos de los expertos, pese a estar cuantizados a ese régimen tan agresivo de ~2 bits, se almacenan dequantizados en tensores BF16. Esto implica que se cargan con `transformers` estándar y con vLLM sin necesidad de kernels especiales, pero a cambio el repositorio ocupa 70,2 GB, por lo que no se obtiene ningún ahorro de memoria efectivo en tiempo de ejecución respecto al modelo en BF16. Se trata, por tanto, de un experimento de investigación sobre métodos de cuantización extrema en las capas MoE, sin métricas publicadas ni documentación de despliegue en producción.

Es relevante ahora porque forma parte de una serie de checkpoints del mismo autor (variantes r31, r46, r52, r55, r64) que exploran distintos presupuestos de bits para los expertos, lo que permite comparar el compromiso entre agresividad de cuantización y calidad resultante. No obstante, al ser un checkpoint interno sin evaluaciones publicadas, su utilidad práctica en producción es limitada y requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) de tipo transformer; tag de arquitectura `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (~35,1 B) |
| Parametros activos | ~3 B (inferido de la nomenclatura A3B; no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible (32768 tokens segun informacion de terceros sobre checkpoints hermanos de la misma familia) |
| Tipos de cuantizacion | Expertos enrutados a 2,0729 bits promedio; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | sigue la licencia del modelo base Qwen/Qwen3.6-35B-A3B (no especificada en la informacion proporcionada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) derivado de Qwen/Qwen3.6-35B-A3B, con 35.107.181.936 parametros totales y un subconjunto de parametros activos por token (la nomenclatura A3B sugiere del orden de 3.000 millones). No se dispone de informacion detallada sobre el numero de expertos, la top-k de enrutamiento ni la configuracion de atencion en la documentacion proporcionada. El tag de arquitectura `qwen3_5_moe` confirma la familia MoE.

En cuanto al proceso de obtencion, la model card indica que es un "internal research checkpoint" en el que unicamente los expertos enrutados fueron cuantizados a una media de 2,0729 bits, mientras que todos los demas pesos se mantienen en BF16. Los pesos se guardan dequantizados en tensores BF16, de modo que cargan con `transformers` y vLLM sin cambios, sin necesidad de kernels de cuantizacion especificos. No se documenta el metodo de cuantizacion empleado (p. ej. GPTQ, AWQ, bitsandbytes, cuantizacion por escalado), ni la composicion del dataset, ni si hubo fases de RLHF o DPO, ni el numero de tokens de entrenamiento. No se han publicado innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) en la informacion disponible.

## Capacidades

- Generacion de texto y conversacion: el pipeline declarado es `text-generation` y el tag `conversational` confirma el uso en dialogos multi-turno.
- Capacidad multimodal image-text-to-text: el tag `image-text-to-text` sugiere soporte de entrada de imagen junto con texto, heredado presuntamente del modelo base; no se documenta en la model card y no esta confirmado.
- Razonamiento y codigo: se infiere de la familia base Qwen3, pero no hay evaluaciones publicadas especificas para este checkpoint.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode): no disponible.

No se han documentado capacidades adicionales (audio, vision confirmada, etc.) en la informacion proporcionada.

## Casos de uso

- Experimentacion en cuantizacion de capas MoE: el checkpoint permite estudiar el impacto de cuantizar solo los expertos enrutados a ~2 bits mientras el resto de la red permanece en BF16, comparando su comportamiento con los checkpoints hermanos de la misma serie (r31, r46, r52, r55).
- Investigacion academica sobre degradacion de calidad frente a presupuesto de bits: sirve como punto de la curva de compromiso entre compresion extrema de expertos y calidad de generacion.
- Validacion de infraestructura de carga: dado que los pesos se cargan con `transformers` y vLLM estandar, es util para verificar pipelines de despliegue sobre modelos MoE grandes sin kernels de cuantizacion adicionales.
- Pruebas de reproducibilidad de checkpoints intermedios: al ser un checkpoint interno con ID r64, permite replicar evaluaciones dentro de un mismo autor y comparar contra las variantes publicadas.
- Benchmarking de throughput en MoE de ~35 B: util para medir latencia y throughput reales de un MoE grande en hardware de 80 GB, dado que no hay ahorro de memoria por la dequantizacion a BF16.
- Analisis comparativo de familias Qwen3.6 frente a Qwen3: permite estudiar diferencias de comportamiento entre generaciones de la misma familia de modelos base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: dado que los 35,1 B de parametros se almacenan dequantizados en BF16, los pesos ocupan aproximadamente 70 GB (el repositorio completo son 70,2 GB). Se necesita por tanto un nodo o GPU con al menos ~70-80 GB de VRAM solo para los pesos, mas el espacio para KV cache y activaciones.
- GPU recomendadas: A100 80 GB, H100 80 GB. En configuraciones multi-GPU se puede repartir el modelo con tensor parallelism (vLLM, TGI).
- Uso en GPU consumer: no cabe en una unica GPU consumer (RTX 4090 tiene 24 GB). Requiere al menos dos o mas GPU de 48-80 GB para repartir el modelo, o tecnicas de offload a CPU/RAM.
- Opciones de despliegue: `transformers`, vLLM y plataformas compatibles con pesos BF16 (el tag `endpoints_compatible` indica compatibilidad con endpoints; aparece tambien como modelo desplegable en proveedores como FriendliAI y Featherless segun los resultados de busqueda).
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion de expertos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p07bit-r64 (este) | ~35,1 B (MoE, ~3 B activos) | no disponible (32768 en hermanos) | 2,0729 bits | sigue la del base | safetensors, transformers, vLLM |
| Qwen/Qwen3.6-35B-A3B (base) | ~35,1 B (MoE) | no disponible | BF16 sin cuantizar | no especificada | modelo base oficial |
| minjaechoi/qwen3p6-35b-a3b-2p00bit-r52 (hermano) | ~35,1 B (MoE) | 32768 | 2,000 bits | sigue la del base | safetensors, transformers, vLLM |
| minjaechoi/qwen3p6-35b-a3b-2p02bit-r55 (hermano) | ~35,1 B (MoE) | no disponible | 2,02 bits | sigue la del base | safetensors, transformers, vLLM |

No se dispone de datos de rendimiento ni de licencia concreta que permitan una comparacion cuantitativa fiable con alternativas de otras familias.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes: es un checkpoint practicamente sin uso ni validacion por parte de la comunidad.
- No se han publicado benchmarks: no hay evidencia objetiva de la calidad del modelo tras la cuantizacion a 2,0729 bits de los expertos.
- Riesgo de degradacion por cuantizacion extrema: un presupuesto medio de ~2 bits en los expertos enrutados es muy agresivo y puede provocar perdida de calidad, inestabilidad o alucinaciones, particularmente en tareas de razonamiento y codigo.
- Falso ahorro de memoria: aunque la cuantizacion se anuncia a 2 bits, los pesos se almacenan dequantizados en BF16, por lo que el consumo de VRAM (~70 GB) es el de un modelo BF16 completo. No debe esperarse reduccion de memoria ni aceleracion por este motivo.
- Licencia: el autor indica que "la licencia sigue la del modelo base", pero la licencia del base no figura en la informacion proporcionada. Antes de cualquier uso comercial hay que verificar los terminos del modelo Qwen/Qwen3.6-35B-A3B.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento multilingue correcto ni el castellano.
- Capacidad multimodal (image-text-to-text) solo sugerida por el tag, no documentada: tratarla como no confirmada.
- Checkpoint de investigacion interna: no esta pensado ni documentado para produccion; se recomienda validacion exhaustiva y evaluacion propia antes de considerarlo.
- Contexto no confirmado: los 32768 tokens proceden de informacion de terceros sobre checkpoints hermanos, no de la model card de este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p07bit-r64
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint hermano r55 (2,02 bits): https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p02bit-r55
- Checkpoint hermano r46 (2,02 bits, pin): https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-pin-2p02bit-r46
- Checkpoint hermano r52 (2,00 bits) en Featherless: https://featherless.ai/models/minjaechoi/qwen3p6-35b-a3b-2p00bit-r52
- Checkpoint hermano r31_v7 (2,022 bits) en Featherless: https://featherless.ai/models/minjaechoi/qwen3p6-35b-a3b-2p02bit-r31_v7
- Endpoint de inferencia del hermano r52 en FriendliAI: https://friendli.ai/models/minjaechoi/qwen3p6-35b-a3b-2p00bit-r52
