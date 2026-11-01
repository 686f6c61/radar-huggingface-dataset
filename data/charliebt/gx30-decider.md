# CharlieBT/gx30-decider

## Resumen

gx30-decider es un modelo de clasificación de texto publicado por CharlieBT en HuggingFace, derivado mediante fine-tuning del modelo Lucas989/sn92-generalist-m1-core7a. Con 26.085.330.160 parámetros totales (aproximadamente 26 mil millones) y un tamaño de repositorio de 52,2 GB en formato safetensors, se trata de un modelo de gran escala orientado a tareas de decisión y clasificación, según indican sus etiquetas (`decider`, `decision-model`, `reax`, `text-classification`).

El modelo emplea la arquitectura `qwen3_5` según los metadatos del repositorio, lo que sugiere una variante de la familia Qwen 3.5, aunque no se dispone de documentación oficial que detalle la configuración exacta de capas, atención o estrategia de entrenamiento. La información pública es muy limitada: apenas 2 descargas y 0 likes en el momento de la consulta, y el acceso está restringido (gated), requiriendo aceptar condiciones en HuggingFace.

Su relevancia es por tanto acotada y experimental: se trata de un fine-tune especializado en clasificación/decisión sobre un modelo base ya de por sí poco documentado, con licencia Apache 2.0 pero con acceso condicionado. No se han publicado resultados de benchmarks, idiomas soportados ni detalles del dataset de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag del repositorio) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se etiqueta con la arquitectura `qwen3_5`, lo que indica una base de la familia Qwen 3.5, presumiblemente un transformer decoder-only. El repositorio no incluye documentación sobre el número de capas, dimensión de hidden state, número de cabezas de atención, mecanismos de atención (lineal, flash, GQA) ni si emplea mezcla de expertos. Con 26 mil millones de parámetros y 52,2 GB en safetensors, los pesos están almacenados presumiblemente en bf16/fp16 (26,08B × 2 bytes ≈ 52,2 GB), lo que es coherente con un modelo denso de ese tamaño.

El entrenamiento consiste en un fine-tuning del modelo base Lucas989/sn92-generalist-m1-core7a para la tarea de clasificación/decisión (tags `decider`, `decision-model`, `reax`, `text-classification`). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, ni sobre innovaciones técnicas como decodificación especulativa o atención lineal. El pipeline declarado es `text-classification`, lo que sugiere que la cabeza de salida está adaptada a etiquetas discretas en lugar de generación libre, aunque no se detalla el esquema de etiquetas.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la capacidad principal es asignar etiquetas o categorías a entradas de texto.
- Modelo de decisión: las etiquetas `decider` y `decision-model` sugieren un uso orientado a tomar decisiones discretas (aceptar/rechazar, enrutar, seleccionar opción) a partir de texto de entrada.
- Generación de texto: no confirmada; al ser un fine-tune de un modelo base generativo con pipeline de clasificación, no se garantiza que conserve capacidades generativas intactas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas no está poblado).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Enrutamiento de peticiones en pipelines de IA: el modelo podría clasificar consultas entrantes para dirigirlas al subsistema adecuado (por ejemplo, a un modelo generativo, a un recuperador o a un humano), aprovechando su naturaleza de `decider`.
- Moderación o filtrado de contenido: como clasificador de texto, podría etiquetar entradas como aptas o no aptas en un flujo de preprocesado, aunque requiere validación previa por la ausencia de benchmarks.
- Clasificación de tickets de soporte: asignar categorías a incidencias entrantes para su triaje automático, siempre que se confirme el esquema de etiquetas del modelo.
- Decisión binaria en pipelines de datos: aceptar o descartar muestras en procesos de curación de datasets, usando el modelo como filtro de calidad.
- Evaluación experimental en investigación: al ser un fine-tune poco documentado, su uso más realista es como objeto de estudio para comparar estrategias de decisión sobre el modelo base sn92-generalist-m1-core7a.
- Prototipado de clasificadores especializados: servir de punto de partida para quien necesite un clasificador de gran tamaño y pueda permitirse el coste de inferencia de 26B parámetros, aceptando las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 52 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- Cuantización a 8 bits: ~26 GB de pesos, viable en una A100 40GB o en dos RTX 4090 (24 GB cada una) con reparto.
- Cuantización a 4 bits: ~13-15 GB de pesos, potencialmente ejecutable en una RTX 4090 (24 GB) o RTX 3090, siempre que exista una variante cuantizada (no documentada en el repositorio).
- GPU recomendadas: A100 80GB, H100 80GB para precisión completa; configuraciones multi-GPU para consumer.
- Cabe en consumer GPU: solo con cuantización agresiva (4 bits) y si se generan pesos GGUF/AWQ, que no están publicados.
- Opciones de despliegue: vLLM, TGI o transformers para safetensors; llama.cpp/Ollama requerirían conversión a GGUF no disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| gx30-decider | 26,08B | no disponible | Apache 2.0 | Gated | Fine-tune de clasificación sobre sn92-generalist-m1-core7a |
| Qwen3 (familia base) | variable (p. ej. 32B) | hasta 128K en algunas variantes | Apache 2.0 (mayoría) | Abierto | Base genérica; gx30-decider deriva de arquitectura qwen3_5 |
| Lucas989/sn92-generalist-m1-core7a | no disponible | no disponible | no disponible | no disponible | Modelo base del que parte gx30-decider |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Documentación prácticamente inexistente: no hay model card con detalles de entrenamiento, dataset, esquema de etiquetas ni evaluación.
- Ausencia total de benchmarks: imposible estimar calidad, precisión o robustez frente a alternativas.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita su uso automatizado y su reproducibilidad.
- Idiomas no declarados: riesgo de comportamiento degradado fuera del idioma o idiomas de entrenamiento, desconocidos.
- Riesgo de alucinación y sesgos: no evaluado; al derivar de un modelo base sin documentación, los sesgos del corpus original son desconocidos.
- Licencia Apache 2.0 permite uso comercial, pero las condiciones de acceso gated pueden imponer restricciones adicionales que deben revisarse antes de producción.
- Coste de inferencia elevado: 26B parámetros requieren hardware de gama alta; sin cuantizaciones publicadas, el despliegue en consumer es problemático.
- Madurez muy baja: 2 descargas y 0 likes sugieren un modelo experimental sin validación comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/CharlieBT/gx30-decider
- Modelo base: https://huggingface.co/Lucas989/sn92-generalist-m1-core7a
