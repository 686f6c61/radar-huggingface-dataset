# mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF

## Resumen

Este repositorio contiene cuantizaciones estáticas en formato GGUF del modelo sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW, un modelo de 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) orientado a roleplay conversacional en japonés y con los mecanismos de rechazo eliminados (etiquetas «heretic» y «abliterated»). Las cuantizaciones las ha generado mradermacher, autor conocido por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados. El repositorio se publicó el 19 de septiembre de 2026 y su tamaño total es de 187,9 GB, ya que incluye trece variantes de cuantización más dos ficheros de proyección multimodal.

El problema que resuelve es doble: por un lado, permite ejecutar un modelo de casi 27.000 millones de parámetros en hardware de consumo mediante cuantizaciones de 2 a 8 bits; por otro, ofrece una variante sin censura ni rechazos explícitos, entrenada con un conjunto de datos sintético de roleplay NSFW en japonés generado con DeepSeek-V3-0324 (Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted). Los idiomas declarados son japonés, inglés y chino, y la licencia es Apache 2.0.

El modelo base deriva de la familia que el autor etiqueta como «qwen3.8» / «qwen3_5», ajustada con LoRA mediante Unsloth antes de la fase de abliteración. No se han publicado datos sobre la longitud de contexto, la composición exacta del entrenamiento ni resultados de benchmarks, por lo que cualquier evaluación de calidad debe hacerse de forma empírica. La presencia de ficheros `mmproj` en el repositorio indica que el modelo base incorpora algún tipo de entrada multimodal, aunque la model card no lo detalla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia etiquetada por el autor como qwen3.8 / qwen3_5); sin mezcla de expertos declarada |
| Parámetros totales | 26.895.998.464 (≈26,9 B), dato de safetensors del modelo base |
| Parámetros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS (anunciada); ficheros publicados: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | ja, en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye en safetensors |
| Tamaño del repositorio | 187,9 GB |
| Librería declarada | transformers |
| Fecha de publicación | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder denso de 26,9 mil millones de parámetros, derivado de la familia Qwen según la nomenclatura del autor («qwen3.8», «qwen3_5»). Sobre ese checkpoint se aplicó un ajuste fino con LoRA usando la librería Unsloth, empleando el conjunto de datos sintético Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted, formado por aproximadamente 20.000 ejemplos de roleplay NSFW en japonés generados con DeepSeek-V3-0324. Posteriormente se aplicó un proceso de abliteración («heretic») que elimina las direcciones del espacio de activaciones asociadas al rechazo de peticiones, de modo que el modelo deja de negarse a generar contenido sensible.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de su origen sintético, ni si hubo fases adicionales de RLHF o DPO. Tampoco se documentan innovaciones técnicas más allá del propio pipeline de cuantización: mradermacher genera cuantizaciones estáticas (no ponderadas ni imatrix, según indica la propia model card) a partir del checkpoint convertido a HF, con el tensor de salida cuantizado. Los ficheros `mmproj` (Q8_0 y f16) son el complemento necesario para habilitar la entrada multimodal en llama.cpp mediante el módulo de proyección, lo que sugiere que el modelo base conserva la torre de visión, aunque la model card no lo confirma ni detalla su funcionamiento.

## Capacidades

- Generación de texto conversacional multi-turno, con especialización explícita en roleplay y en el mantenimiento de personajes.
- Escritura creativa y narrativa en japonés, con soporte secundario de inglés y chino.
- Modo sin censura: al estar abliterado, no aplica rechazos automáticos a peticiones de contenido adulto o sensible, incluyendo NSFW.
- Posible entrada multimodal (imagen) si se carga el fichero `mmproj` junto con el GGUF; la model card no describe la capacidad ni su alcance.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de código, matemáticas o razonamiento formal: no documentadas; el ajuste LoRA está orientado a roleplay, por lo que es previsible una degradación en tareas de razonamiento respecto al modelo base, pero no hay datos que lo confirmen.
- Modo de pensamiento explícito (thinking): no disponible.

## Casos de uso

- Roleplay conversacional en japonés: el ajuste con 20.000 ejemplos sintéticos de roleplay permite mantener personajes coherentes en conversaciones largas; se desplegaría con llama.cpp o koboldcpp y un system prompt que fije la ficha del personaje.
- Plataformas de ficción interactiva y novelas visuales: el modelo puede generar respuestas de personaje en tiempo real dentro de un motor de juego, con la cuantización Q4_K_M como equilibrio entre calidad y consumo de VRAM.
- Generación de contenido narrativo para adultos: es el caso de uso declarado por las etiquetas «NSFW» y «uncensored»; requiere control de acceso y verificación de edad por parte del operador.
- Asistente de escritura creativa sin restricciones temáticas: útil para autores que necesitan desarrollar tramas o diálogos sobre temas que los modelos alineados rechazan, en japonés o inglés.
- Traducción y adaptación de diálogos japonés-inglés en contextos narrativos: el modelo cubre ambos idiomas, aunque no hay métricas de calidad de traducción publicadas.
- Investigación sobre abliteración y alineación: sirve como sujeto de estudio para medir cómo la eliminación de direcciones de rechazo afecta a la coherencia, la utilidad general y la tasa de alucinación frente al modelo base sin abliterar.
- Evaluación comparativa de cuantizaciones: el repositorio publica doce variantes del mismo checkpoint, lo que permite medir el impacto de Q2_K a Q8_0 sobre la perplejidad y la calidad percibida en una misma tarea de roleplay.
- Despliegue local con visión, si se confirma la capacidad multimodal: cargando el GGUF junto con `mmproj-f16` se podría condicionar la conversación con una imagen de referencia del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones específicas de roleplay, y la búsqueda web realizada no ha devuelto ninguna fuente técnica relacionada con el modelo. El único material de referencia cuantitativo que enlaza el autor es un gráfico externo de ikawrakow que compara la perplejidad de distintos tipos de cuantización de baja calidad (menor es mejor) y un análisis de Artefact2 sobre el mismo tema; ninguno de los dos aporta cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, partiendo del tamaño de los ficheros GGUF (hay que sumar el espacio de la caché KV, cuyo tamaño no puede calcularse porque no se publican el número de capas ni de cabezas de atención):
  - Q2_K (10,8 GB): a partir de 12 GB de VRAM.
  - Q3_K_S (12,2 GB) y Q3_K_M (13,4 GB): 14-16 GB de VRAM.
  - Q3_K_L (14,4 GB), Q4_K_S (15,7 GB) y Q4_K_M (16,6 GB): 16-20 GB de VRAM.
  - Q5_K_S (18,8 GB) y Q5_K_M (19,3 GB): 20-24 GB de VRAM.
  - Q6_K (22,2 GB): 24-32 GB de VRAM.
  - Q8_0 (28,7 GB): 32-40 GB de VRAM.
  - f16 (no publicado como fichero, pero anunciado): en torno a 54 GB, requiere 80 GB o reparto en varias GPU.
  - Los ficheros `mmproj` añaden 0,7 GB (Q8_0) o 1,0 GB (f16) si se activa la entrada multimodal.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para las cuantizaciones Q4 y Q5; RTX 5090 o A100 40 GB para Q6_K y Q8_0; H100 80 GB o dos A100 40 GB para f16. Para las cuantizaciones Q2 y Q3 bastan GPUs de 12-16 GB, como la RTX 4070 Ti o la RTX 4060 Ti de 16 GB.
- ¿Cabe en GPU de consumo? Sí: Q2_K y Q3_K en tarjetas de 12-16 GB; Q4_K_M y Q5_K_M en tarjetas de 24 GB; Q6_K y Q8_0 exigen 32 GB o reparto entre dos GPU. También es viable la ejecución híbrida con offload parcial a CPU y RAM del sistema.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y text-generation-webui para los GGUF; vLLM o TGI si se convierte a safetensors o se usa el modelo base. La entrada multimodal requiere el soporte de `mmproj` de llama.cpp.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de latencia para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF | 26,9 B | no disponible | ja, en, zh | apache-2.0 | GGUF (12 cuantizaciones + mmproj) | HuggingFace |
| sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW (modelo base) | 26,9 B | no disponible | ja, en, zh | apache-2.0 | safetensors | HuggingFace |
| Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted (dataset, no modelo comparable) | no aplica | no aplica | ja | no disponible | no aplica | HuggingFace |
| Otras alternativas de roleplay en japonés de tamaño similar | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es la del repositorio GGUF frente a su propio modelo base en safetensors: misma arquitectura y mismos parámetros, con la diferencia del formato y del número de variantes de cuantización disponibles. No hay datos de rendimiento que permitan situar este modelo frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Contenido para adultos: el repositorio está marcado como «not-for-all-audiences» y el ajuste está orientado a roleplay NSFW. Su uso en productos públicos exige verificación de edad, filtrado de salida y cumplimiento de la normativa aplicable en cada jurisdicción.
- Abliteración: la eliminación de las direcciones de rechazo puede degradar la coherencia, la adherencia a instrucciones y la calidad del razonamiento respecto al modelo base. No hay evaluaciones publicadas que cuantifiquen este efecto.
- Riesgo de alucinación: no se documentan tasas de alucinación. Al tratarse de un modelo especializado en ficción y con rechazos eliminados, la probabilidad de generar afirmaciones falsas con seguridad aparente es alta fuera del ámbito narrativo.
- Sesgos: no se ha publicado ninguna evaluación de sesgos. El dataset de entrenamiento es sintético y generado por otro modelo, por lo que puede heredar y amplificar los sesgos de DeepSeek-V3-0324, además de los del checkpoint de partida.
- Cobertura de idiomas: aunque se declaran ja, en y zh, el ajuste LoRA se ha hecho exclusivamente con datos de roleplay en japonés, por lo que es previsible un rendimiento desigual entre idiomas y un dominio muy superior del japonés.
- Longitud de contexto: no disponible. No se puede garantizar el comportamiento en conversaciones largas ni planificar el consumo de caché KV.
- Multiplicidad de cuantizaciones: las variantes Q2_K y Q3_K introducen pérdida de calidad notable; la propia model card etiqueta Q3_K_M como «lower quality» y recomienda Q4_K_S, Q4_K_M y Q8_0 para uso general.
- Formatos de cuantización limitados: solo se publican cuantizaciones estáticas. No hay versiones ponderadas ni imatrix, que suelen ofrecer mejor relación calidad-tamaño en modelos pequeños.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base y la procedencia de los datos pueden imponer condiciones adicionales; conviene revisar la ficha de sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW antes de explotarlo comercialmente.
- Madurez: cero descargas y cero «likes» en el momento de redactar esta ficha, sin benchmarks ni validación comunitaria. No es un artefacto con garantías para producción.
- Fechas: el repositorio se publicó el 19 de septiembre de 2026, con una actualización el mismo día. No se ha publicado ninguna revisión posterior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF
- Modelo base: https://huggingface.co/sss22213/Qwen3.8-27B-Heretic-JP-Roleplay-NSFW
- Conjunto de datos de entrenamiento: https://huggingface.co/datasets/Aratako/Synthetic-Japanese-Roleplay-NSFW-DeepSeek-V3-0324-20k-formatted
- Página resumen de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-Heretic-JP-Roleplay-NSFW-GGUF
- Solicitudes de cuantización y preguntas frecuentes de mradermacher: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Análisis de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa responsable de la infraestructura de cuantización: https://www.nethype.de/
