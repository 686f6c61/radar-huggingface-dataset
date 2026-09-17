# minjaechoi/qwen36-35b-a3b-2p02bit-r2

## Resumen

Qwen3.6-35B-A3B — 2.02-bit routed experts (r2) es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace. Se trata de una versión del modelo base Qwen/Qwen3.6-35B-A3B en la que únicamente los expertos enrutados (routed experts) de la arquitectura MoE han sido cuantizados a una media de 2,02 bits, mientras que el resto de los pesos permanece en BF16. El checkpoint no es un modelo nuevo ni un fine-tuning: es una transformación de pesos sobre el modelo base.

La particularidad técnica es que los pesos resultantes se almacenan ya dequantizados en tensores BF16, de modo que el repositorio (70,2 GB) se carga con `transformers` y vLLM estándar sin necesidad de kernels de cuantización específicos. Esto implica que el ahorro es de precisión efectiva en los expertos enrutados, no de huella de memoria o de tamaño en disco: el repo ocupa un espacio comparable al de un checkpoint BF16 de 35.000 millones de parámetros.

Su relevancia es por tanto acotada y experimental: sirve para estudiar el impacto de una cuantización extremadamente agresiva (2,02 bits) limitada a los expertos enrutados dentro de un MoE, y para reproducir ese pipeline de compresión. No cuenta con descargas ni interacciones, no incluye resultados de benchmarks y su model card se limita a declarar el modelo base, el identificador interno `r2` y el ratio de bits. Todo uso en producción debería considerarse no validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de arquitectura `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (~35,1 B), segun los safetensors del repositorio |
| Parametros activos | No disponible de forma explicita; la nomenclatura `A3B` del modelo base sugiere del orden de 3 B activos, dato no confirmado en la informacion proporcionada |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Expertos enrutados con una media de 2,02 bits; el resto de pesos en BF16. Los pesos se almacenan ya dequantizados en tensores BF16 |
| Idiomas soportados | No disponible |
| Licencia | Heredada del modelo base (Qwen/Qwen3.6-35B-A3B); el texto concreto de la licencia no esta disponible en la informacion proporcionada |
| Formato de pesos | Safetensors (libreria `transformers`) |
| Tamano del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Identificador interno | r2 |
| Pipeline declarado | text-generation |
| Fecha de creacion | 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) según la etiqueta de arquitectura `qwen3_5_moe`. Sobre esa base, este checkpoint aplica una cuantización post-entrenamiento restringida a los expertos enrutados, con una media de 2,02 bits, y deja el resto de la red (atención, embeddings, normalizaciones, expertos compartidos si los hubiera, cabezales) en BF16. No hay ninguna indicación de reentrenamiento, destilado ni ajuste con RLHF o DPO: el autor describe el artefacto como un checkpoint de investigación interno.

La innovación declarada es de formato más que de arquitectura: los pesos cuantizados se almacenan dequantizados en tensores BF16, lo que permite cargarlos con la pila estándar de `transformers` y vLLM sin kernels personalizados. No se especifican en la información disponible el número de tokens de entrenamiento del modelo base, la composición del dataset, la estrategia exacta de cuantización (por ejemplo, tipo de agrupación, calibración o criterio de asignación de bits) ni el error de reconstrucción introducido. Tampoco se documenta si el proceso afecta a los enrutadores (gating) o únicamente a las matrices de los expertos.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es `text-generation` y el repositorio incluye la etiqueta `conversational`, por lo que se espera uso en diálogo multi-turno con el chat template del modelo base.
- Procesamiento de imagen y texto: el repositorio incluye la etiqueta `image-text-to-text`, lo que apunta a capacidades multimodales heredadas del modelo base; la model card no las documenta ni las confirma.
- Razonamiento, código y matemáticas: no hay información específica en la model card ni en los metadatos sobre el nivel de estas capacidades; deben asumirse las del modelo base, sin verificación publicada para este checkpoint.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Modo de razonamiento explícito (thinking), audio u otras capacidades especiales: no disponible.
- Compatibilidad de despliegue: carga con `transformers` y vLLM en BF16 sin kernels de cuantización adicionales, según declara el autor.

## Casos de uso

- Investigación sobre cuantización de expertos enrutados: usar el checkpoint para medir la degradación de calidad al comprimir únicamente las matrices de los expertos a 2,02 bits frente al modelo base en BF16, con evaluaciones controladas de perplejidad y tareas generativas.
- Reproducción de pipelines de compresión: el identificador `r2` sugiere una segunda iteración de un proceso interno; sirve como referencia para replicar y comparar variantes de cuantización sobre la misma familia de modelos.
- Estudio del enrutamiento en MoE: al mantener el resto de la red en BF16, permite aislar el efecto de la cuantización de expertos sobre la distribución de asignación de tokens a expertos y sobre el balance de carga.
- Generación de texto en entornos de investigación: desplegado con `transformers` o vLLM en un clúster interno para tareas de generación y conversación donde no se exige una validación de calidad en producción.
- Base para ajuste fino posterior: al cargarse como un modelo estándar de `transformers`, puede servir de punto de partida para LoRA o ajuste completo en experimentos académicos, siempre que la licencia heredada lo permita.
- Comparativas de eficiencia en inferencia: dado que los pesos se almacenan en BF16, permite medir si la precisión reducida de los expertos afecta al throughput real en vLLM, más allá del ahorro teórico de bits.
- Evaluación multimodal exploratoria: si se confirma la capacidad `image-text-to-text` heredada, podría emplearse en experimentos de descripción de imágenes o respuesta a preguntas visuales, sin garantías de calidad publicadas.
- Docencia y divulgación técnica: como ejemplo práctico de cuantización selectiva por componentes en arquitecturas MoE, con la salvedad de que no hay métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna tabla de evaluación (MMLU, HumanEval, GSM8K u otras), ni comparación con el modelo base en BF16, ni métricas de perplejidad o de error de reconstrucción de los pesos cuantizados.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos en BF16, se necesitan aproximadamente 70 GB solo para los pesos (35,1 B de parámetros a 2 bytes). Sumando caché KV y activaciones, el requisito práctico se sitúa por encima de los 75-80 GB para contextos moderados.
- GPU recomendadas: una GPU de 80 GB (A100 80 GB, H100 80 GB) puede alojar los pesos, aunque con poco margen para caché KV en secuencias largas; configuraciones de 2 x 48 GB (A6000, L40S) o 4 x 24 GB con paralelismo tensorial son alternativas habituales.
- Cabe en GPU de consumo: no en una RTX 4090 (24 GB) ni en tarjetas de 16 GB. Sería necesario repartir el modelo entre varias GPU de consumo mediante paralelismo tensorial, con el coste de interconexión correspondiente.
- Opciones de despliegue: `transformers` y vLLM de forma nativa según el autor; TGI es plausible al ser un modelo estándar de `transformers`, aunque no está confirmado. No se ofrecen pesos GGUF en el repositorio, por lo que llama.cpp u Ollama requerirían una conversión propia.
- Latencia y throughput estimados: no disponible.
- Advertencia de memoria: dado que los pesos cuantizados se guardan dequantizados en BF16, este checkpoint no reduce la VRAM ni el espacio en disco respecto a un BF16 equivalente; el repositorio de 70,2 GB es coherente con ese tamaño.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-2p02bit-r2 | 35,1 B (MoE) | No disponible | Expertos enrutados a 2,02 bits, resto BF16 (almacenado en BF16) | Heredada del modelo base, texto no disponible | Repositorio de 70,2 GB, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35,1 B (MoE) | No disponible | BF16 (presumiblemente) | No disponible | Modelo de referencia del que deriva este checkpoint |
| Otras alternativas MoE de tamano comparable | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de información suficiente para establecer una comparación cuantitativa con alternativas de la misma categoría: no hay benchmarks publicados de este checkpoint ni especificaciones del modelo base más allá de su identificador.

## Limitaciones y advertencias

- Checkpoint de investigación: el propio autor lo etiqueta como tale; no hay validación de calidad, evaluaciones ni garantías de comportamiento en producción.
- Cuantización muy agresiva: una media de 2,02 bits en los expertos enrutados puede degradar de forma apreciable la coherencia, el razonamiento y la fidelidad factual, sin que existan métricas publicadas que cuantifiquen esa pérdida.
- Sin ahorro de memoria ni de disco: los pesos se almacenan dequantizados en BF16, por lo que el repositorio de 70,2 GB y la VRAM necesaria son equivalentes a los de un modelo de 35 B en BF16. El beneficio es experimental, no operativo.
- Licencia: hereda la del modelo base, cuyo texto no está disponible en la información proporcionada. Antes de cualquier uso comercial debe verificarse la licencia de Qwen/Qwen3.6-35B-A3B, que puede incluir restricciones.
- Idiomas: no se declara ninguna lista de idiomas soportados; se desconoce el comportamiento fuera del inglés o del chino si el modelo base estuviera sesgado hacia ellos.
- Riesgo de alucinación: no evaluado para este checkpoint; la cuantización de expertos podría agravarlo respecto al modelo base.
- Sesgos: no hay ninguna evaluación de sesgos, toxicidad o seguridad publicada para este artefacto.
- Contexto: se desconoce la longitud de contexto efectiva soportada tras la transformación de pesos.
- Reputación y procedencia: 0 descargas y 0 interacciones, sin publicación asociada ni paper que respalde el método de cuantización empleado.
- Búsqueda web sin resultados relevantes: las consultas realizadas no devolvieron documentación técnica, papers ni discusiones sobre este modelo; no se han podido verificar de forma independiente las afirmaciones de la model card.
- Compatibilidad: aunque el autor indica compatibilidad con `transformers` y vLLM, no se documentan versiones mínimas ni se aportan ejemplos de código o logs de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p02bit-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog o repositorio del método de cuantización: no disponible
- Demo o space asociado: no disponible
- Resultados de busqueda web relevantes: no se han encontrado; las consultas realizadas no devolvieron documentacion tecnica relacionada con este modelo
