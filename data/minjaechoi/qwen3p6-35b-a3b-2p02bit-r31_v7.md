# minjaechoi/qwen3p6-35b-a3b-2p02bit-r31_v7

## Resumen

Este repositorio, publicado por el usuario minjaechoi, es un checkpoint de investigación derivado de Qwen/Qwen3.6-35B-A3B en el que únicamente los expertos enrutados (routed experts) de la capa MoE han sido cuantizados a una media de 2,022 bits, mientras que el resto de los pesos se mantiene en BF16. El identificador interno del checkpoint es r31_v7. No se trata de un modelo nuevo ni de un fine-tuning con datos propios: es una compresión selectiva de un modelo base existente, orientada a estudiar el impacto del almacenamiento de expertos a muy baja precisión.

El detalle técnico más relevante es que los pesos se distribuyen dequantizados dentro de tensores BF16, de modo que se cargan con `transformers` estándar y con vLLM sin necesidad de kernels de cuantización personalizados. Esto implica que el ahorro de bits no se traduce en un ahorro de memoria en disco o VRAM: el repositorio ocupa 71,9 GB, coherente con 35.951.822.704 parámetros almacenados a 16 bits por peso.

Su relevancia es fundamentalmente metodológica. Un esquema de ~2 bits sobre los expertos enrutados permitiría, en una implementación con kernels nativos, reducir drásticamente el peso de la parte MoE de un modelo de ~36B de parámetros; este checkpoint sirve como material de estudio para medir la degradación asociada a esa compresión antes de invertir esfuerzo en kernels de baja precisión. No se han publicado resultados de evaluación, benchmarks ni métricas de calidad en la información disponible, y el modelo acumula 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE tipo transformer (tag `qwen3_5_moe`); capas de expertos enrutados |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | aproximadamente 3B segun la nomenclatura "A3B" del modelo base; no confirmado explicitamente en la informacion proporcionada |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | expertos enrutados a 2,022 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | heredada del modelo base ("License follows the base model"); nombre concreto no disponible |
| Formato de pesos | safetensors (71,9 GB en el repositorio) |
| Libreria | transformers |
| Pipeline | text-generation |
| Modalidad declarada en tags | image-text-to-text (entrada de imagen y texto, salida de texto) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen/Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) según el tag `qwen3_5_moe` y la nomenclatura "A3B" del nombre, que en la convención de la familia Qwen indica aproximadamente 3B de parámetros activos por token sobre un total de ~36B. Este checkpoint no introduce cambios arquitectónicos: modifica únicamente el esquema de cuantización aplicado a los expertos enrutados, alcanzando una media de 2,022 bits en esos tensores.

No se proporciona información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, fases de RLHF o DPO) ni sobre el procedimiento exacto de cuantización empleado en este checkpoint (tipo de cuantizador, tamaño de grupo, calibración, tratamiento de outliers). La única innovación declarada es el propio esquema de compresión selectiva: al mantener el resto de los pesos en BF16 y almacenar los expertos dequantizados en el mismo formato, el checkpoint es compatible con el stack estándar de inferencia sin kernels especializados, a costa de no materializar la reducción de memoria.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`, `conversational`).
- Procesamiento de entradas combinadas de imagen y texto, según el tag `image-text-to-text`; no hay confirmación adicional en la model card.
- Razonamiento, generación de código y matemáticas: capacidades presumibles del modelo base, pero no verificadas ni documentadas para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking mode, audio, visión dedicada): no disponible; solo consta el tag `image-text-to-text`.
- Compatibilidad declarada con `transformers` y vLLM mediante carga de pesos BF16 estándar.

## Casos de uso

- Investigación en cuantización extrema: el checkpoint permite medir la degradación de calidad de un MoE cuando los expertos enrutados se representan a ~2 bits, comparándolo contra el modelo base en BF16 sobre el mismo conjunto de evaluación.
- Validación de pipelines de inferencia: sirve para comprobar que un modelo con expertos almacenados a baja precisión pero distribuidos en BF16 se carga sin modificaciones en `transformers` y vLLM, verificando compatibilidad de `config.json`, pesos y tokenizador.
- Pruebas de despliegue multi-GPU: con 71,9 GB de pesos, es un caso útil para validar estrategias de tensor parallelism y sharding en nodos con varias GPU antes de mover cargas mayores.
- Estudio de latencia y throughput de capas MoE: permite aislar el coste computacional del enrutamiento de expertos frente al coste de almacenamiento, ya que el resto de la red permanece en BF16.
- Base para futuras destilaciones o fine-tunings: al ser un checkpoint derivado de un modelo mayor, puede emplearse como punto de partida en experimentos de adaptación de bajo rango sobre expertos comprimidos.
- Referencia negativa en estudios de memoria: cuantificar explícitamente cuánta VRAM se ahorra (ninguna) al almacenar los expertos dequantizados, como argumento para justificar el desarrollo de kernels nativos de 2 bits.
- Prototipado de asistentes multimodales de investigación: el tag `image-text-to-text` sugiere uso en pruebas de descripción de imágenes y diálogo sobre contenido visual, siempre con verificación previa de que la capacidad opera correctamente en este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: como mínimo ~71,9 GB solo para los pesos (35,95B parámetros en BF16), más la caché KV y activaciones. En la práctica se recomienda un nodo con 80-96 GB de memoria agregada como punto de partida.
- GPU recomendadas: 2x A100 80 GB, 2x H100 80 GB o configuraciones equivalentes con tensor parallelism. Una sola GPU de 80 GB resulta ajustada una vez contabilizada la caché KV.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 con 24 GB, RTX 5090 con 32 GB). Requeriría reparto entre varias GPU o volcado parcial a memoria del sistema, con la penalización de latencia correspondiente.
- Opciones de despliegue: `transformers` y vLLM, ambos mencionados explícitamente en la model card. No se declara soporte de llama.cpp, Ollama ni TGI; al no existir pesos GGUF en el repositorio, llama.cpp y Ollama no son viables sin una conversión previa.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: 71,9 GB de repositorio, más espacio adicional para caché de descarga y posibles copias.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada. La única comparación documentable es contra el propio modelo base.

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen3p6-35b-a3b-2p02bit-r31_v7 | 35,95B | no disponible | expertos enrutados a 2,022 bits, resto BF16 | heredada del base, nombre no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | no disponible en la informacion proporcionada | no disponible | BF16 sin comprimir | no disponible | HuggingFace |
| Otras alternativas de ~35B (MoE o densas) | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint de investigación interno: la propia model card lo etiqueta como "internal research checkpoint", sin garantías de calidad, estabilidad ni soporte.
- Ausencia total de evaluación: no hay benchmarks, ni comparación con el modelo base, ni métricas de perplejidad. Se desconoce el grado de degradación introducido por la cuantización a 2,022 bits de los expertos.
- Sin adopción verificable: 0 descargas y 0 likes, lo que implica ausencia de validación independiente por parte de la comunidad.
- Licencia indeterminada: se declara que sigue la licencia del modelo base, pero el nombre concreto no figura en la información disponible. Antes de cualquier uso comercial debe consultarse la licencia de Qwen/Qwen3.6-35B-A3B.
- Riesgo de alucinación: no cuantificado para este checkpoint; en modelos comprimidos a muy baja precisión es habitual que aumente, pero no hay datos que lo confirmen aquí.
- Idiomas soportados no documentados: no se puede garantizar un comportamiento correcto en castellano ni en ningún otro idioma concreto.
- Longitud de contexto no documentada: no se conoce la ventana efectiva ni el impacto de la compresión sobre el comportamiento en contextos largos.
- Falsa sensación de ahorro: los pesos se sirven dequantizados en BF16, por lo que el requisito de VRAM y de disco es prácticamente el del modelo completo. El beneficio de los 2,022 bits solo se materializaría con kernels de baja precisión, que no se incluyen.
- Capacidad multimodal incierta: el tag `image-text-to-text` apunta a entrada de imagen, pero no hay documentación que confirme que el proyector visual esté intacto y funcional tras el proceso aplicado.
- Herramientas de despliegue ligero no soportadas: sin pesos GGUF no es posible ejecutarlo en llama.cpp, Ollama o entornos de CPU/edge habituales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen3p6-35b-a3b-2p02bit-r31_v7
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio del autor: no disponible
- Demo o espacio asociado: no disponible
- Nota: los resultados de la búsqueda web proporcionada no guardan relación con el modelo (corresponden a contenidos gastronómicos sobre ropa vieja) y no se han utilizado como fuente.
