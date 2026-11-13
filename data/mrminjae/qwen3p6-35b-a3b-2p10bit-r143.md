# mrminjae/qwen3p6-35b-a3b-2p10bit-r143

## Resumen

El modelo `mrminjae/qwen3p6-35b-a3b-2p10bit-r143` es una cuantización experimental de Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) multimodal desarrollado originalmente por el equipo Qwen de Alibaba. Esta variante, publicada por el usuario mrminjae, aplica una cuantización selectiva de 2,10 bits de media a los expertos enrutados, mientras mantiene el resto de pesos en BF16. El checkpoint se presenta como una investigación interna (ID r143) y no como un lanzamiento oficial.

El modelo base Qwen3.6-35B-A3B pertenece a la familia Qwen3.5 MoE, con arquitectura `qwen3_5_moe` y capacidad image-text-to-text, lo que indica soporte multimodal de entrada. La nomenclatura "35B-A3B" sugiere aproximadamente 35 mil millones de parámetros totales con unos 3 mil millones activos por token, aunque el recuento real de safetensors asciende a 67.319.436.656 parámetros, probablemente debido a la inclusión de pesos multimodales y de los expertos completos.

La relevancia de esta ficha radica en que documenta una técnica de compresión agresiva sobre un MoE multimodal de gran tamaño, con el objetivo de reducir el espacio en disco y los requisitos de memoria sin abandonar el ecosistema `transformers`/vLLM. No obstante, la información pública es muy limitada: no se especifican licencia, idiomas, datos de entrenamiento ni benchmarks, y el número de descargas es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (transformer MoE multimodal) |
| Parametros totales | 67.319.436.656 (segun safetensors) |
| Parametros activos | no disponible (la nomenclatura del modelo base sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion selectiva de 2,10 bits de media en expertos enrutados; resto de pesos en BF16; pesos almacenados de forma desquantizada en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (compatible con `transformers` y vLLM) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura `qwen3_5_moe`, una mezcla de expertos con enrutamiento por token. La intervención de mrminjae consiste en cuantizar únicamente los expertos enrutados a una media de 2,10 bits, manteniendo el resto de componentes (atención, capas densas, posible codificador visual) en BF16. Los pesos se almacenan ya desquantizados en tensores BF16, de modo que la carga es directa con `transformers` y vLLM, sin necesidad de kernels de cuantización especiales en tiempo de inferencia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Tampoco se documentan innovaciones técnicas adicionales del modelo base más allá de su naturaleza MoE y multimodal (image-text-to-text). El checkpoint se identifica como "internal research checkpoint" (ID r143), lo que sugiere que no ha pasado por un proceso de validación o publicación formal.

## Capacidades

- Generación de texto conversacional y de propósito general, según la etiqueta `text-generation` y `conversational`.
- Procesamiento multimodal de entrada image-text-to-text, heredado del modelo base Qwen3.6-35B-A3B.
- Razonamiento y matemáticas: capacidad esperable por la familia Qwen, aunque no confirmada con benchmarks en la información disponible.
- Generación de código: no confirmada explícitamente en la model card, pero coherente con la familia base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se listan idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint permite estudiar el impacto de 2,10 bits en expertos enrutados sobre la calidad de salida, comparándolo con el modelo base en BF16. Es adecuado porque los pesos se cargan sin kernels especiales.
- Despliegue en entornos con memoria limitada: al reducir el espacio de los expertos, el repositorio de 134,7 GB puede resultar más manejable que el modelo base completo, aunque sigue requiriendo hardware de gama alta.
- Prototipado de pipelines multimodales image-text-to-text: se puede usar con `transformers` para experimentar con entradas de imagen y texto en tareas de descripción o respuesta a preguntas visuales, siempre que se valide la calidad frente al base.
- Evaluación comparativa de robustez: útil para medir la degradación de razonamiento y generación de código tras una cuantización agresiva, en un contexto de investigación interna.
- Experimentos de inferencia con vLLM: al ser compatible con vLLM, sirve para probar throughput y latencia de un MoE cuantizado en servidores con GPUs de datacenter.
- Docencia y reproducción de técnicas de cuantización: el checkpoint y su model card permiten ilustrar cómo se almacenan pesos desquantizados en BF16 y cómo se mantiene la compatibilidad con el ecosistema estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 67.319.436.656 parámetros almacenados en BF16, el peso teórico de los tensores ronda los 134,6 GB, lo que exige al menos esa cantidad de memoria para carga completa, más overhead de activaciones y caché KV.
- GPU recomendadas: para carga completa en BF16 se necesitan GPUs de datacenter con 80 GB o más (A100 80 GB, H100 80 GB) y, probablemente, varias unidades o técnicas de offloading.
- Cabe en consumer GPU: no de forma completa. Una RTX 4090 (24 GB) no puede alojar el checkpoint en BF16; sería necesario offloading a CPU o una cuantización adicional en tiempo de carga.
- Opciones de despliegue: `transformers` (carga estándar) y vLLM, según indica la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r143 | 67.319.436.656 | no disponible | no disponible (sigue al base) | safetensors BF16 desquantizado | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en la informacion | no disponible | no disponible | safetensors | Hugging Face (modelo base referenciado) |
| Otras variantes cuantizadas de Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna: no es un lanzamiento oficial y carece de validación publicada.
- Cuantización extrema de 2,10 bits en expertos: riesgo alto de degradación en razonamiento, código y matemáticas; no hay benchmarks que cuantifiquen la pérdida.
- Licencia no especificada: la model card remite a la licencia del modelo base sin indicarla, lo que impide confirmar el uso comercial.
- Idiomas no documentados: no se puede garantizar un rendimiento multilingüe adecuado.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente agravado por la cuantización.
- Contexto no documentado: se desconoce la ventana máxima y su comportamiento en conversaciones largas.
- Repositorio de 134,7 GB: requiere almacenamiento y ancho de banda considerables, y la carga completa exige hardware de gama alta.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de informes de calidad.
- Compatibilidad declarada con `transformers` y vLLM, pero sin garantías de que el modelo base multimodal funcione correctamente tras la cuantización selectiva.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r143
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
