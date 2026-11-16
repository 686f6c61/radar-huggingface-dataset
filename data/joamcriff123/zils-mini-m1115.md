# joamCriff123/zils-mini-m1115

## Resumen

zils-mini-m1115 es un modelo de la familia Qwen3.5-4B, afinado por el usuario joamCriff123 sobre la base Qwen/Qwen3.5-4B y publicado en Hugging Face. Se presenta como un "decision body" del tipo d3-mini para el "Zils subnet 127 mini pool", una terminología propia del autor que no está documentada en la información disponible. El pipeline declarado es `feature-extraction` y los tags incluyen `decision-model`, `zils` y `d3-mini`, lo que sugiere un uso orientado a la extracción de representaciones y a la toma de decisiones dentro de un sistema propietario, más que a la generación de texto abierta.

El modelo cuenta con 4.539.265.536 parámetros (aproximadamente 4,54 mil millones) según los pesos en safetensors, y el repositorio ocupa 9,1 GB. Hereda la licencia Apache-2.0 del modelo base y se distribuye en formato safetensors con `custom_code`, lo que implica que su carga requiere confiar en código personalizado incluido en el repositorio.

La relevancia de esta ficha es limitada: se trata de un artefacto con cero descargas y cero likes en el momento de la consulta, sin model card sustantiva, sin especificaciones de contexto, idiomas ni benchmarks. Toda la información técnica disponible procede de los metadatos del repositorio y del modelo base referenciado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen/Qwen3.5-4B; tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo más allá del tag `qwen3_5` y de la referencia al modelo base Qwen/Qwen3.5-4B. No se documentan el número de capas, la dimensionalidad oculta, el tipo de atención ni si emplea mecanismos como atención lineal o decodificación especulativa. Tampoco se especifican los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni si hubo etapas de RLHF, DPO o ajuste supervisado.

El autor describe el modelo como un "d3-mini decision body" para el "Zils subnet 127 mini pool", sin aportar detalles sobre el proceso de afinado, las tareas concretas de decisión, el formato de las entradas o el esquema de recompensas. El repositorio incluye `custom_code`, lo que indica que la arquitectura o el pipeline de inferencia dependen de código no estándar que no se detalla en la información proporcionada.

## Capacidades

- Extracción de características (`feature-extraction`), según el pipeline declarado.
- Modelo de decisión (`decision-model`), según los tags del autor; no se especifica el tipo de decisión ni el espacio de acciones.
- Generación de texto: no confirmada explícitamente; el pipeline declarado no es `text-generation`.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas está vacío).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Extracción de embeddings para sistemas de recuperación: dado el pipeline `feature-extraction`, el modelo puede emplearse para generar representaciones vectoriales de texto en pipelines de búsqueda semántica o clustering, siempre que se valide su comportamiento con el `custom_code` incluido.
- Componente de decisión en un sistema propietario: el autor lo etiqueta como `decision-model` para un "mini pool" concreto, por lo que su uso previsto es como módulo de decisión dentro de esa infraestructura, no como modelo de propósito general.
- Clasificación o puntuación de candidatos: en un contexto de "subnet" y "pool", podría emplearse para puntuar opciones o candidatos, aunque no se documenta el formato de entrada/salida.
- Base para experimentación con Qwen3.5-4B: al ser un afinado del modelo base, puede servir para estudiar diferencias de comportamiento respecto al original en tareas de representación.
- Prototipado interno: adecuado para pruebas controladas dentro de un equipo que conozca el `custom_code` y el esquema de decisión, no para despliegues públicos sin validación.
- Evaluación comparativa de afinados: útil como punto de comparación frente a otros derivados de Qwen3.5-4B en tareas de extracción de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y del `custom_code`.
- VRAM estimada en cuantización de 8 bits: en torno a 4,5-5 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2,5-3 GB para pesos, si el `custom_code` lo permite (no confirmado).
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) en fp16, y en GPUs de datacenter (A100, H100) sin problema.
- Despliegue: `transformers` es la librería declarada; vLLM, llama.cpp, Ollama o TGI no están confirmados y podrían no ser compatibles debido al `custom_code`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-m1115 | 4,54 B | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Afinado de Qwen3.5-4B con `custom_code`; sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4 B | no disponible en esta ficha | Apache-2.0 (según herencia) | Hugging Face | Modelo original del que deriva; documentación oficial disponible en su repositorio |
| Otros afinados de Qwen3.5-4B | ~4 B | variable | variable | Hugging Face | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de model card sustantiva: no hay evidencia publicada de calidad, sesgos o robustez.
- El repositorio incluye `custom_code`, lo que implica ejecutar código del autor al cargar el modelo; debe auditarse antes de usarlo en producción.
- El pipeline declarado es `feature-extraction`, no `text-generation`; no debe asumirse que el modelo genera texto de forma fiable.
- Idiomas soportados no especificados; no se puede garantizar comportamiento multilingüe.
- Longitud de contexto desconocida; no apto para tareas que requieran ventanas largas sin validación previa.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero el `NOTICE` y las atribuciones del modelo base deben respetarse; conviene revisar los términos del modelo Qwen3.5-4B subyacente.
- Cero descargas y cero likes: sin validación por parte de la comunidad; tratar como artefacto experimental.
- Terminología del autor ("Zils subnet 127 mini pool", "d3-mini") sin documentación pública; el propósito real del modelo no es verificable.

## Enlaces

- [Hugging Face: joamCriff123/zils-mini-m1115](https://huggingface.co/joamCriff123/zils-mini-m1115)
- [Modelo base: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
