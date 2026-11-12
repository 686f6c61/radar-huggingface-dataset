# mrminjae/qwen3p6-35b-a3b-2p02bit-r88

## Resumen

`mrminjae/qwen3p6-35b-a3b-2p02bit-r88` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, un modelo MoE (Mixture of Experts) de la familia Qwen 3.6. Lo publica el usuario `mrminjae` en Hugging Face y su particularidad es que aplica una cuantización agresiva de 2,02 bits de media exclusivamente a los expertos enrutados (routed experts), mientras que el resto de pesos se mantiene en BF16. El resultado se almacena de forma desnormalizada (dequantized) en tensores BF16, de modo que carga con transformers y vLLM estándar sin necesidad de kernels especiales.

El modelo resuelve un problema muy concreto: reducir el espacio en disco y, potencialmente, el ancho de banda de memoria de un MoE de 35.107.181.936 parámetros totales sin renunciar a la compatibilidad con el ecosistema estándar de inferencia. El repositorio ocupa 70,2 GB, lo que da una idea de la huella real del checkpoint en BF16 con los expertos comprimidos. Es relevante ahora porque los MoE grandes con muchos expertos pequeños son candidatos naturales a este tipo de compresión selectiva: degradar solo los expertos, que son la mayor parte de los parámetros, permite mantener intactas las capas de atención y las proyecciones compartidas.

La información publicada es escasa: la model card es un README mínimo, no hay resultados de benchmarks, no se declara licencia explícita más allá de "sigue la del modelo base" y no se listan idiomas soportados. La arquitectura declarada en los tags es `qwen3_5_moe` y el pipeline es `text-generation`, aunque los tags también incluyen `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), derivada de Qwen/Qwen3.6-35B-A3B |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,02 bits de media; resto de pesos en BF16; pesos almacenados desnormalizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un MoE de tipo transformer con expertos enrutados, según el tag `qwen3_5_moe`. La innovación técnica no está en el entrenamiento sino en la compresión: solo los expertos enrutados se cuantizan a una media de 2,02 bits, mientras que atención, embeddings, router y demás pesos compartidos permanecen en BF16. Los pesos se guardan ya desnormalizados en tensores BF16, de forma que la inferencia no requiere un paso de dequantización en tiempo de ejecución ni kernels personalizados; se carga con transformers o vLLM estándar.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documenta el método exacto de cuantización (por ejemplo, si es GPTQ, AWQ, una variante de cuantización de bajo rango o una técnica propia), ni el error de reconstrucción introducido. El identificador interno "r88" sugiere una iteración de un proceso de investigación, pero su significado no se explica en la model card.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento image-text-to-text: los tags incluyen esta modalidad, lo que apunta a capacidades de visión heredadas del modelo base, aunque no se detalla su alcance.
- Razonamiento y matemáticas: presumibles por la familia Qwen 3.6, pero sin datos publicados que lo confirmen en este checkpoint.
- Generación de código: no documentado específicamente para este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo thinking explícito: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint sirve para estudiar cómo afecta una media de 2,02 bits en los expertos enrutados a la calidad de salida frente al modelo base en BF16, manteniendo el resto de pesos intactos como control.
- Despliegue en entornos con restricciones de almacenamiento: con 70,2 GB de repositorio, es viable en nodos con discos NVMe limitados donde el modelo base completo no cabría con holgura.
- Evaluación comparativa de checkpoints: al cargar con transformers y vLLM estándar, permite lanzar pipelines de evaluación automática (perplejidad, tareas de generación) sin adaptar el stack de inferencia.
- Prototipado de asistentes conversacionales: el pipeline `text-generation` y el tag `conversational` permiten integrarlo en un chatbot de pruebas para medir latencia y calidad antes de comprometerse con el modelo base completo.
- Experimentos de multimodalidad: el tag `image-text-to-text` habilita probar flujos de descripción de imágenes y respuesta a preguntas visuales, verificando cuánto de esa capacidad sobrevive a la compresión de los expertos.
- Base para estudios de destilación o recuperación de calidad: comparar las activaciones y salidas de este checkpoint con las del modelo original ayuda a identificar qué capas o expertos concentran la pérdida de rendimiento.
- Servicio interno de generación de texto en investigación: adecuado para entornos no productivos donde se prioriza el tamaño reducido sobre la fidelidad absoluta al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 70,2 GB en safetensors BF16 con expertos comprimidos; la VRAM necesaria para cargar los pesos en memoria es del orden de esa cifra, más el overhead de activaciones y caché KV, que depende de la longitud de contexto (no documentada).
- GPU recomendadas: no documentadas por el autor. Por el volumen de pesos, se requieren GPU con 80 GB o más (A100 80 GB, H100 80 GB) o configuraciones multi-GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) con los pesos en BF16 tal como se distribuyen.
- Opciones de despliegue: transformers y vLLM estándar, según la model card. No se mencionan llama.cpp, Ollama ni TGI, y al estar los pesos desnormalizados en BF16 no se benefician directamente de los formatos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r88 | 35,1 B | no disponible | no disponible (sigue la del base) | safetensors BF16 con expertos a 2,02 bits | Checkpoint de investigación, sin benchmarks publicados |
| Qwen/Qwen3.6-35B-A3B | 35,1 B | no disponible | no disponible en la información proporcionada | safetensors | Modelo base sin compresión; referencia de calidad |
| Otras cuantizaciones del mismo base (GPTQ, AWQ, GGUF) | 35,1 B | depende del base | depende del base | GPTQ, AWQ, GGUF | No se dispone de datos concretos en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna: la model card lo califica explícitamente como "internal research checkpoint", sin garantías de calidad ni de estabilidad.
- Sin benchmarks: no hay evidencia publicada de la degradación introducida por la cuantización a 2,02 bits en los expertos; el impacto en razonamiento, código o matemáticas es desconocido.
- Licencia ambigua: no se declara una licencia propia y se remite a la del modelo base, Qwen/Qwen3.6-35B-A3B; conviene verificar los términos de ese modelo antes de cualquier uso comercial.
- Idiomas no declarados: no se puede asumir un rendimiento multilingüe concreto sin evaluarlo.
- Contexto no documentado: se desconoce la ventana máxima efectiva y si la compresión afecta a la estabilidad en contextos largos.
- Riesgo de alucinación: no cuantificado para este checkpoint; al ser una compresión agresiva, la fidelidad factual puede diferir del modelo base.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa.
- Requisitos de hardware elevados: pese a la compresión, el checkpoint sigue ocupando 70,2 GB y no es desplegable en GPU de consumo.
- Sin información sobre tool calling ni soporte de agentes: no debe asumirse su disponibilidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r88
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
