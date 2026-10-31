# isilicon/mango-qwen38-27b-nvfp4mtp

## Resumen

`isilicon/mango-qwen38-27b-nvfp4mtp` es un espejo de preservación (preservation mirror) publicado por la cuenta isilicon / Mango en Hugging Face. El artefacto es un GGUF en cuantización nativa NVFP4 con la cabeza MTP (multi-token prediction) embebida, derivado del modelo `BennyDaBall/Qwen3.8-Uncensored-NVFP4-MTP`, que a su vez parte de un checkpoint modificado de Qwen3.8 27B creado por JonathanColetti. El repositorio no entrena ni modifica nada: su función es conservar los bytes exactos del modelo original, documentarlos con manifiestos de integridad (SHA-256) y evaluarlos con una metodología congelada y reproducible.

El interés de esta ficha para desarrolladores es doble. Primero, ofrece un punto de partida 27B con cuantización FP4 nativa, lo que sitúa el peso en unos 19,7 GB y lo hace viable en GPUs de gama alta de consumidor, con soporte de decodificación especulativa vía MTP en runtimes compatibles. Segundo, la ficha es transparente sobre lo que se ha verificado y lo que no: el propio autor indica que este artefacto concreto es un "preserved candidate · quality ungraded", es decir, no tiene puntuación Mango publicada para estos archivos exactos, aunque sí existen resultados de configuraciones relacionadas.

La licencia es Apache 2.0, los idiomas declarados son inglés y chino, y el pipeline es generación de texto conversacional. El tag "uncensored" del modelo base indica que se trata de una variante sin los filtros de alineación estándar, algo que conviene valorar antes de uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con cabeza MTP embebida para decodificación especulativa |
| Parametros totales | 27.320.697.856 (~27,3B, dato safetensors) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de carga usa 32768 tokens |
| Tipos de cuantizacion | NVFP4 (GGUF nativo FP4); variantes relacionadas: IQ4_XS imatrix, Q6_K, MLX affine 4-bit |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo único `Qwen3.8-27B-Uncensored-NVFP4-MTP.gguf`, 19,69 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.8 con 27,3 mil millones de parámetros. La particularidad de este artefacto es doble: la cuantización NVFP4 nativa (formato FP4 de NVIDIA, no una cuantización posterior tipo Q4_K) y la retención de la cabeza MTP (multi-token prediction), que permite decodificación especulativa propia del modelo en runtimes con soporte `draft-mtp`, reduciendo la latencia por token sin modelo draft externo.

Sobre el entrenamiento original no hay datos publicados en la model card: no se indica el número de tokens, la composición del dataset ni si hubo RLHF/DPO. Lo que sí consta es la cadena de derivación: checkpoint Qwen3.8 27B modificado por JonathanColetti → cuantización NVFP4 con MTP embebida por BennyDaBall → espejo de preservación con evaluación por isilicon/Mango. El tag "uncensored" sugiere una modificación de alineación respecto al modelo base de Qwen, pero el método concreto no está documentado en esta ficha. La model card advierte además que el proyector de visión del modelo fuente no está incluido en este espejo seleccionado.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Ejecución de tareas con herramientas: la evaluación local de Mango cubre "text/tool tasks", lo que indica soporte de tool calling verificado en configuraciones relacionadas.
- Decodificación especulativa mediante la cabeza MTP embebida, en runtimes con soporte `draft-mtp`.
- Multilingüe en inglés y chino.
- Modo de esfuerzo ajustable (estudio Mango compara niveles "medium" y "xhigh" de Qwen, con +1,54 puntos de diferencia media a favor de xhigh).
- No incluye capacidades multimodales en este artefacto: el proyector de visión no forma parte del espejo seleccionado, y la evaluación no establece calidad de imagen o audio.
- Al ser una variante "uncensored", no aplica los rechazos de seguridad estándar del modelo original.

## Casos de uso

- Chatbot local en inglés y chino: con 32768 tokens de contexto configurables en llama-server, es adecuado para asistentes multi-turno autoalojados sin depender de APIs externas.
- Prototipado de agentes con tool calling: el soporte de tareas con herramientas y la cabeza MTP (menor latencia por paso) lo hacen útil para bucles agénticos multi-paso en entornos de prueba.
- Inferencia de bajo coste por token en GPU local: la cuantización NVFP4 nativa reduce el peso a 19,7 GB, permitiendo servir el modelo en una sola GPU de gama alta sin sacrificar tanto calidad como en cuantizaciones Q4 clásicas.
- Pruebas comparativas de cuantizaciones: al ser un espejo con manifiesto de integridad y metodología de evaluación congelada, sirve como referencia reproducible para comparar NVFP4 frente a IQ4_XS, Q6_K o MLX 4-bit.
- Preservación y auditoría de modelos: los SHA-256, `SOURCE_MANIFEST.json` y revisiones pineadas permiten flujos de trabajo que exigen trazabilidad exacta de los pesos desplegados.
- Experimentación con decodificación especulativa MTP: útil para validar el rendimiento de `draft-mtp` en llama.cpp sobre hardware Blackwell con kernels NVFP4.
- Investigación sobre niveles de esfuerzo (effort settings): los estudios de Mango sobre medium frente a xhigh ofrecen un marco para medir el impacto del parámetro de esfuerzo en calidad y latencia.

## Benchmarks y rendimiento

No se ha publicado una puntuación de calidad Mango para estos archivos exactos ("preserved candidate · quality ungraded"). Los resultados siguientes corresponden a configuraciones relacionadas, no a este artefacto, según advierte la propia model card:

| Configuracion relacionada | Puntuacion ponderada | Minimo de carga de trabajo |
|---|---|---|
| Qwen3.8 27B Cyber · IQ4_XS imatrix · MTP embebido | 70,27 | 29,74 |
| Qwen3.8 27B Cyber · Q6_K · Q8 MTP + proyector | 66,98 | 45,60 |
| Qwen3.8 27B · MLX affine 4-bit · OrcaRouter | 80,64 | 23,98 |

Estudio adicional de esfuerzo (cohortes separadas, 404 preguntas recogidas, 403 válidas): medium 82,87/100 frente a xhigh 84,41/100, diferencia emparejada +1,54 puntos (intervalo 95% [-1,71, +4,82]). No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estándar para este artefacto.

## Requisitos de hardware

- Peso del modelo: 19,69 GB (GGUF NVFP4). La model card advierte explícitamente que ese tamaño es de disco, no de VRAM: hay que sumar KV cache, memoria de trabajo y overhead del runtime.
- VRAM estimada: con caché KV cuantizada a q8_0 y 32768 tokens de contexto, un margen razonable es 24 GB o más; no hay cifra oficial publicada.
- La ruta FP4 nativa requiere GPU con arquitectura Blackwell (por ejemplo RTX 5090 o B200), kernels CUDA NVFP4 compatibles y un runtime consciente de la arquitectura. No funcionará a velocidad nativa FP4 en Ampere, Ada o Hopper.
- La cabeza MTP requiere soporte `draft-mtp` en el runtime.
- En GPUs sin Blackwell, el GGUF puede cargarse degradado o no cargarse según el runtime; no hay datos publicados al respecto.
- Despliegue documentado: llama.cpp (`llama-server`) con `--jinja`, flash attention, y caché KV q8_0 para K y V. No consta verificación con vLLM, Ollama o TGI para este archivo.
- Latencia y throughput: no disponibles; la comparación de velocidad exacta de Mango para estos archivos está pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion / formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| isilicon/mango-qwen38-27b-nvfp4mtp (este) | 27,3B | NVFP4 GGUF, MTP embebido | no disponible (ejemplo: 32768) | Apache 2.0 | Requiere Blackwell; sin puntuación Mango propia |
| isilicon/mango-qwen27-cyber-iq4xs-mtp | 27B (aprox.) | IQ4_XS imatrix GGUF, MTP embebido | no disponible | Apache 2.0 | Puntuación Mango 70,27; más portable que NVFP4 |
| isilicon/mango-qwen27-cyber-q6k | 27B (aprox.) | Q6_K GGUF + Q8 MTP | no disponible | Apache 2.0 | Puntuación Mango 66,98; mayor fidelidad de cuantización |
| isilicon/mango-qwen38-27b-uncensored-mlx4 | 27B (aprox.) | MLX affine 4-bit | no disponible | Apache 2.0 | Puntuación Mango 80,64; orientado a Apple Silicon |

Alternativas fuera de la familia Qwen de 27B (Gemma 3 27B, etc.): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Sin puntuación de calidad publicada para estos archivos exactos: cualquier expectativa de rendimiento debe basarse en las configuraciones relacionadas, que pueden no transferirse (la model card lo dice explícitamente: "no MLX4, Q8 or BF16 score transfers here").
- Requiere hardware Blackwell para la ruta FP4 nativa; en otras arquitecturas la compatibilidad no está documentada.
- La MTP exige soporte `draft-mtp` en el runtime; en runtimes sin él se pierde la aceleración especulativa.
- Variante "uncensored": carece de los filtros de seguridad estándar, lo que aumenta el riesgo de contenido nocivo y complica su uso en producción comercial o expuesta a usuarios finales.
- Riesgo de alucinación: no disponible como dato medido, pero inherente a modelos de lenguaje generales; la evaluación de Mango no cubre el techo de contexto completo anunciado ni cada ruta opcional de decodificación especulativa.
- Idiomas limitados a inglés y chino según los metadatos; el rendimiento en castellano no está documentado.
- El proyector de visión no está incluido: no esperar capacidades multimodales de este espejo.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base es una modificación no oficial de Qwen3.8; conviene revisar la cadena de atribución (JonathanColetti, BennyDaBall) antes de redistribuir.
- La comparación de cuantización/velocidad de Mango para estos archivos está pendiente de publicación.

## Enlaces

- Repositorio: https://huggingface.co/isilicon/mango-qwen38-27b-nvfp4mtp
- Modelo base: https://huggingface.co/BennyDaBall/Qwen3.8-Uncensored-NVFP4-MTP
- Archivo GGUF: https://huggingface.co/isilicon/mango-qwen38-27b-nvfp4mtp/resolve/main/Qwen3.8-27B-Uncensored-NVFP4-MTP.gguf
- Manifiesto de integridad: https://huggingface.co/isilicon/mango-qwen38-27b-nvfp4mtp/blob/main/SOURCE_MANIFEST.json
- Estado del espejo: https://huggingface.co/isilicon/mango-qwen38-27b-nvfp4mtp/blob/main/MIRROR_STATUS.json
- Colección completa Mango: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio medium vs xhigh: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Configuración relacionada IQ4_XS: https://huggingface.co/isilicon/mango-qwen27-cyber-iq4xs-mtp
- Configuración relacionada Q6_K: https://huggingface.co/isilicon/mango-qwen27-cyber-q6k
- Configuración relacionada MLX4: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4
- Comunidad Discord (Infinity): https://discord.gg/5n5YDbQCMy
