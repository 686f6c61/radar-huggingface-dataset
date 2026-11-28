# intel-ai/Inkling-Small-MXFP4-AutoRound

## Resumen

Inkling-Small-MXFP4-AutoRound es una versión cuantizada del modelo multimodal thinkingmachines/Inkling-Small, publicada por Intel AI mediante su herramienta AutoRound. Se trata de una cuantización MXFP4 (W4A16, group_size 32) generada con el método RTN (round-to-nearest), en la que únicamente se cuantizan los expertos enrutados de la capa MoE (`mlp.experts`), mientras que la torre de visión, los embeddings, el `lm_head` y las normas se mantienen en BF16. El objetivo es reducir el peso en memoria y el coste de inferencia del modelo original sin degradar de forma apreciable su calidad.

El modelo base es un transformer multimodal de tipo image-text-to-text con arquitectura MoE, con 265.956.439.090 parámetros totales según el recuento de safetensors, y una ventana de contexto y número de parámetros activos que no se detallan en la información disponible. La ficha se centra en la variante cuantizada, que hereda la licencia Apache 2.0 del modelo original y está pensada para servirse con vLLM 0.29.0.

Su relevancia actual radica en que permite desplegar un modelo de gran tamaño con pesos de 4 bits para los expertos, manteniendo casi intacta la precisión en benchmarks de razonamiento y matemáticas (recuperación media del 100,55 % frente a la referencia NVFP4), lo que lo hace atractivo para entornos con restricciones de VRAM y para pipelines de inferencia de alto rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con capas MoE; tipo exacto no disponible |
| Parametros totales | 265.956.439.090 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (W4A16, group_size 32) en expertos MoE; BF16 en torre de visión, embeddings, lm_head y normas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit de almacenamiento declarado en tags) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura transformer con mezcla de expertos (MoE), tal como se deduce de la presencia de capas `mlp.experts` que Intel cuantiza de forma selectiva. La variante publicada no es un modelo entrenado desde cero, sino el resultado de aplicar AutoRound con el esquema MXFP4 sobre los expertos enrutados, manteniendo en BF16 las partes sensibles a la precisión (torre de visión, embeddings, `lm_head` y normas). El proceso se ejecutó en modo `model_free`, con `--format llm_compressor` y configuración por capas `{mlp.experts:{scheme:mxfp4}}`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base incorporó RLHF, DPO u otras técnicas de alineamiento. La model card tampoco detalla innovaciones técnicas del modelo original más allá de su naturaleza multimodal y MoE. La contribución técnica de esta ficha es la cuantización: AutoRound emplea descenso de gradiente con signo para optimizar el redondeo de pesos, lo que permite reducir el coste de los expertos a 4 bits con una pérdida de precisión mínima.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Razonamiento y matemáticas, con resultados destacados en AIME25 (91,11) y GSM8K (96,99) en la variante cuantizada.
- Conocimiento científico y de propósito general, evaluado en GPQA Diamond (88,55) y PIQA (94,52).
- Soporte de tool calling / function calling, habilitado mediante `--tool-call-parser inkling` y `--enable-auto-tool-choice` en vLLM.
- Soporte de modo de razonamiento (reasoning), con parser dedicado `--reasoning-parser inkling`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistentes multimodales de atención al cliente: el modelo puede recibir capturas de pantalla o fotos junto con texto y responder en conversaciones multi-turno, aprovechando su torre de visión en BF16 para preservar la calidad de la percepción visual.
- Análisis de documentos e imágenes técnicas: extracción de información de diagramas, gráficos o formularios combinando entrada visual y textual, con la ventaja de que los expertos cuantizados reducen el coste por consulta en despliegues de alto volumen.
- Razonamiento matemático asistido: resolución de problemas tipo competición (AIME25, GSM8K) en entornos educativos o de investigación, usando el modo de razonamiento y el parser dedicado de vLLM.
- Agentes con tool calling: integración en flujos agénticos donde el modelo decide invocar funciones externas (APIs, bases de datos, calculadoras) gracias al soporte nativo de `--tool-call-parser inkling` y `--enable-auto-tool-choice`.
- Generación de código y asistencia al desarrollo: aunque no se detallan benchmarks de código, el perfil de razonamiento del modelo lo hace adecuado para tareas de programación asistida dentro de pipelines de CI/CD con vLLM como servidor.
- Despliegue en infraestructura con VRAM limitada: al cuantizar solo los expertos a MXFP4, se reduce el peso de los parámetros dominantes del MoE, permitiendo servir el modelo en GPUs donde la versión BF16 completa no cabría, manteniendo el resto de componentes en BF16.
- Investigación en cuantización: como referencia reproducible para estudiar el impacto de MXFP4 con AutoRound en modelos MoE multimodales, comparando la recuperación frente a NVFP4.

## Benchmarks y rendimiento

| Benchmark | Base Model | MXFP4 | Recovery |
|---|---:|---:|---:|
| aime25 | 90,00 | 91,11 | 101,23 % |
| gpqa_diamond | 87,37 | 88,55 | 101,35 % |
| GSM8K | 97,27 | 96,99 | 99,71 % |
| PIQA | 94,47 | 94,52 | 100,05 % |
| **Average** | **92,28** | **92,79** | **100,55 %** |

Nota de la model card: la línea base corresponde a la referencia NVFP4 evaluada bajo ajustes idénticos. No se han publicado resultados de benchmarks adicionales (por ejemplo, MMLU o HumanEval) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 153,5 GB, por lo que se requiere al menos ese orden de magnitud en memoria para cargar los pesos completos; el peso efectivo en MXFP4 de los expertos reduce la huella frente a una versión BF16 equivalente, pero no se dispone de una cifra exacta de VRAM en la información proporcionada.
- GPU recomendadas: no disponibles de forma explícita; por tamaño, el modelo encaja en aceleradores de centro de datos con gran capacidad de memoria (A100, H100 y sucesores), y no cabe en GPUs de consumo convencionales.
- ¿Cabe en consumer GPU?: no disponible; por el tamaño del repositorio (153,5 GB) no es viable en GPUs de consumo de 24 GB sin estrategias de offload o sharding.
- Opciones de despliegue: vLLM 0.29.0 es la opción documentada, con `--tokenizer-mode inkling`, `--reasoning-parser inkling`, `--tool-call-parser inkling`, `--enable-auto-tool-choice` y `--trust-remote-code`. No se documentan otras opciones (llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-Small-MXFP4-AutoRound | 265.956.439.090 | no disponible | Apache 2.0 | Hugging Face (intel-ai) | Cuantización MXFP4 de expertos MoE; media de 92,79 en los benchmarks reportados |
| thinkingmachines/Inkling-Small (base) | no disponible | no disponible | Apache 2.0 (heredada) | Hugging Face (thinkingmachines) | Modelo original en BF16; referencia para la cuantización |
| Referencia NVFP4 (línea base de evaluación) | no disponible | no disponible | no disponible | no disponible | Usada como base de comparación en la model card; media de 92,28 |

No se dispone de información sobre otros modelos comparables de la misma categoría (mismo tamaño o misma tarea) en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo puede producir salidas factualmente incorrectas; no debe usarse como fuente de información veraz sin verificación.
- Riesgo de generar contenido soez, sesgado u ofensivo debido a las limitaciones del modelo preentrenado y de los datasets de ajuste fino; se recomienda realizar pruebas de seguridad antes de desplegarlo.
- La cuantización MXFP4 se aplica solo a los expertos MoE; el resto de componentes permanece en BF16, por lo que el ahorro de memoria es parcial y depende de la proporción de parámetros en expertos.
- No se detallan los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multilingües o de contexto largo.
- La licencia Apache 2.0 no constituye asesoramiento legal; el autor recomienda consultar a un abogado antes de un uso comercial.
- El despliegue documentado requiere `--trust-remote-code` y una versión concreta de vLLM (0.29.0), lo que introduce dependencias de seguridad y compatibilidad.
- No se han publicado datos de latencia, throughput ni requisitos exactos de VRAM, por lo que las estimaciones de capacidad deben validarse empíricamente.
- El modelo depende del tokenizer y parsers específicos de Inkling (`--tokenizer-mode`, `--reasoning-parser`, `--tool-call-parser`), lo que puede complicar la portabilidad a otros stacks de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/intel-ai/Inkling-Small-MXFP4-AutoRound
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-Small
- Repositorio AutoRound: https://github.com/intel/auto-round
- Intel Neural Compressor: https://github.com/intel/neural-compressor
- Paper de AutoRound: https://arxiv.org/abs/2309.05516
