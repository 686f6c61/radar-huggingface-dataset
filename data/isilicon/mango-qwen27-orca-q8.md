# isilicon/mango-qwen27-orca-q8

## Resumen

Mango Qwen27 Orca Q8 es un espejo de preservación del GGUF Q8_0 que bartowski publicó a partir del modelo Qwen3.8 27B Uncensored de OrcaRouter. Lo mantiene el usuario isilicon bajo el paraguas del proyecto Mango, cuyo objetivo es conservar artefactos de terceros con bytes idénticos, verificación SHA-256 y evaluación con configuraciones congeladas. No es un modelo entrenado por isilicon: el trabajo de modificación y cuantización corresponde a los creadores originales y este repositorio añade procedencia atribuida y documentación de integridad.

El artefacto principal es un único fichero GGUF de 29,12 GB (27,12 GiB) con cuantización Q8_0, derivado de un transformer denso de 27.320.697.856 parámetros. El modelo declara soporte para inglés y chino, licencia Apache 2.0 y la etiqueta de "uncensored", lo que implica que el ajuste original de OrcaRouter eliminó parte de los filtros de rechazo del Qwen3.8 base. La model card advierte explícitamente de que la calidad de este artefacto concreto no está calificada: no hay puntuación Mango publicada para estos ficheros exactos.

La relevancia actual es doble. Por un lado, ofrece una referencia de alta precisión (Q8_0) para comparar contra cuantizaciones más agresivas del mismo linaje, como el IQ4_XS o el Q6_K evaluados por Mango. Por otro, documenta un caso de preservación con identidad criptográfica verificable, algo poco habitual en el ecosistema GGUF y útil para reproducibilidad en investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (linaje Qwen3.8 27B, sin confirmación explícita de detalles internos) |
| Parámetros totales | 27.320.697.856 |
| Parámetros activos | no disponible (no es MoE según los datos disponibles) |
| Longitud de contexto | no disponible (el ejemplo de carga usa `--ctx-size 32768`, pero no se declara el máximo oficial) |
| Tipos de cuantización | Q8_0 (único fichero incluido en el espejo) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `orcarouter_Qwen3.8-27B-Uncensored-Q8_0.gguf`) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna más allá de que el modelo base es un Qwen3.8 27B, lo que sitúa el diseño en la familia de transformers densos de Qwen con 27.000 millones de parámetros. La model card no documenta número de capas, dimensión oculta, mecanismo de atención ni innovaciones como decodificación especulativa nativa; menciona únicamente que existen ficheros MTP (multi-token prediction) y projector en el upstream que no están incluidos en esta selección.

Tampoco se detallan los datos de entrenamiento: no hay cifras de tokens, composición del dataset ni confirmación de si hubo RLHF, DPO o ajuste por preferencias. Lo único documentado es la cadena de procedencia: OrcaRouter modificó el Qwen3.8 27B para producir una variante "Uncensored", bartowski la cuantizó a Q8_0 y Mango preservó ese GGUF sin alterar los bytes, con SHA-256 `99bdffce202e3214…` y revisión de pesos fijada en `54dcc31e6c150e1a48581e161a0bef1c36fdf1f5`. La innovación técnica destacable de este repositorio no está en el modelo sino en el proceso: manifiesto de origen, verificación de integridad y evaluación con prompts congelados.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Soporte de tool calling y function calling, validado parcialmente por la evaluación local de Mango en tareas de texto y herramientas.
- Capacidad de razonamiento multi-paso y uso en agentes, cubierta por los 12 casos de agente del protocolo de evaluación Mango.
- Multilingüe limitado a inglés y chino; no se declaran otros idiomas.
- Modo "uncensored": el ajuste de OrcaRouter reduce los rechazos del modelo base, lo que amplía el rango de respuestas pero incrementa el riesgo de contenido no filtrado.
- Compatibilidad con plantillas Jinja (`--jinja`) y con decodificación especulativa si se añaden los ficheros MTP del upstream, no incluidos aquí.
- No se confirman capacidades de visión ni audio para este artefacto: el projector multimodal del upstream queda fuera de la selección y la model card indica que la evaluación local no establece calidad de imagen o audio.

## Casos de uso

- Referencia de alta precisión para comparativas de cuantización: usar este Q8_0 como baseline frente a IQ4_XS, Q6_K o MLX 4-bit del mismo linaje, midiendo la degradación real en tareas de texto y herramientas con los mismos prompts congelados del protocolo Mango.
- Evaluación reproducible en investigación: el SHA-256 y la revisión de pesos fijada permiten replicar experimentos exactos, algo crítico cuando se comparan ajustes "uncensored" entre sí.
- Asistente conversacional en inglés o chino con contexto medio: el ejemplo de carga con `--ctx-size 32768` y KV cache en q8_0 permite desplegar sesiones de hasta 32.000 tokens en una sola GPU de 48 GB.
- Generación de código y tareas de tool calling en pipelines internos: la evaluación Mango cubre casos de agente, y el soporte Jinja facilita integrarlo con frameworks que envían plantillas de herramientas.
- Investigación sobre alineación y filtros de rechazo: al ser una variante "uncensored", sirve para estudiar qué comportamientos cambian respecto al Qwen3.8 original y cómo afecta la cuantización a esos cambios.
- Despliegue local en estaciones de trabajo con GPU de 48 GB o en CPU con llama.cpp: el formato GGUF y el soporte de llama-server permiten servir el modelo sin infraestructura de datacenter, a costa de latencia mayor.
- Archivado y preservación a largo plazo: el espejo garantiza disponibilidad de un artefacto que podría desaparecer del repositorio original, con manifiesto de integridad verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para estos ficheros exactos. La model card indica explícitamente que "no standalone Mango quality score has been published for these exact files". Las puntuaciones de configuraciones relacionadas, medidas por separado y no atribuibles a este artefacto, son:

| Configuración distinta | Puntuación ponderada | Mínimo de carga |
|---|---|---|
| Qwen3.8 27B Cyber · IQ4_XS imatrix · MTP embebido | 70,27 | 29,74 |
| Qwen3.8 27B Cyber · Q6_K · Q8 MTP + projector | 66,98 | 45,60 |
| Qwen3.8 27B · MLX affine 4-bit · OrcaRouter | 80,64 | 23,98 |

Adicionalmente, el estudio de esfuerzo de Qwen sobre una cohorte de 404 preguntas reporta 82,87/100 en esfuerzo medio frente a 84,41/100 en xhigh, con una diferencia pareada de +1,54 puntos e intervalo del 95 % de [-1,71, +4,82]. Estos datos corresponden a otra configuración y no deben extrapolarse a este Q8_0.

## Requisitos de hardware

- VRAM estimada para inferencia: el payload ocupa 29,12 GB en disco; en VRAM hay que sumar KV cache y memoria de trabajo. Con contexto de 32.768 tokens y KV cache en q8_0, una estimación conservadora sitúa el consumo total en torno a 33-36 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB. En GPUs de 24 GB (RTX 4090, 3090) no cabe en VRAM completa y requiere offload parcial a CPU, con caída notable de throughput.
- Cabe en consumer GPU de 48 GB (RTX 6000 Ada, A6000) y en configuraciones multi-GPU de 24 GB con tensor parallelism o split por capas en llama.cpp.
- Opciones de despliegue: llama.cpp y llama-server (patrón documentado en la model card), Ollama, y potencialmente vLLM o TGI si se convierte el GGUF a safetensors, aunque no se documenta ese camino.
- Latencia y throughput estimados: no disponibles. La model card advierte de que mayor precisión "es una hipótesis a testear, no una puntuación heredada ni una garantía de throughput".

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mango Qwen27 Orca Q8 (este) | 27,32 B | no disponible | Q8_0 GGUF | Apache 2.0 | HuggingFace, espejo con SHA-256 |
| Qwen3.8 27B Cyber IQ4_XS imatrix | 27 B (linaje) | no disponible | IQ4_XS GGUF | no disponible en la información | HuggingFace, repo Mango |
| Qwen3.8 27B Cyber Q6_K | 27 B (linaje) | no disponible | Q6_K GGUF | no disponible en la información | HuggingFace, repo Mango |
| Qwen3.8 27B MLX affine 4-bit OrcaRouter | 27 B (linaje) | no disponible | MLX 4-bit | Apache 2.0 (según linaje) | HuggingFace, repo Mango |

La comparativa relevante es interna al linaje: el Q8_0 prioriza fidelidad al modelo original a costa de tamaño, mientras que el IQ4_XS reduce el payload a una fracción y el MLX 4-bit está optimizado para Apple Silicon. No se dispone de datos de benchmarks comparables entre estas configuraciones sobre las mismas tareas, salvo las puntuaciones parciales de la tabla anterior, que corresponden a variantes "Cyber" y no al modelo OrcaRouter evaluado aquí.

## Limitaciones y advertencias

- La calidad de este artefacto concreto no está calificada por Mango: cualquier afirmación de rendimiento basada en las puntuaciones de configuraciones relacionadas es una extrapolación no validada.
- El ajuste "uncensored" de OrcaRouter reduce los filtros de rechazo, lo que aumenta el riesgo de generar contenido sensible, ofensivo o factualmente incorrecto sin señalización. No es apto para aplicaciones de cara al público sin capas adicionales de moderación.
- Riesgo de alucinación inherente a los modelos de 27 B sin verificación factual; no se documentan mitigaciones específicas.
- Idiomas limitados a inglés y chino: el rendimiento en castellano no está evaluado y probablemente sea inferior.
- La longitud máxima de contexto no está declarada; el `--ctx-size 32768` del ejemplo es una configuración de carga, no el techo del modelo.
- Los ficheros MTP, projector multimodal y draft heads del upstream no están incluidos, por lo que las rutas de decodificación especulativa y multimodal requieren descargar artefactos adicionales y validarlas por separado.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia "uncensored" puede implicar obligaciones adicionales según jurisdicción y caso de uso; conviene revisar los términos del modelo base original de Qwen.
- El espejo no garantiza que el repositorio upstream permanezca disponible; la revisión de pesos está fijada, pero la documentación puede cambiar en `main`.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/isilicon/mango-qwen27-orca-q8
- Fichero de pesos: https://huggingface.co/isilicon/mango-qwen27-orca-q8/resolve/main/orcarouter_Qwen3.8-27B-Uncensored-Q8_0.gguf
- Modelo base (bartowski): https://huggingface.co/bartowski/orcarouter_Qwen3.8-27B-Uncensored-GGUF
- Colección Mango de modelos probados y espejos: https://huggingface.co/collections/isilicon/mango-tested-models-and-preservation-mirrors-6ae3b73994c895ab42e360d2
- Resultados de evaluación Mango: https://huggingface.co/datasets/isilicon/mango-evaluation-results
- Estudio de esfuerzo Qwen medium vs xhigh: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4#qwen-medium-versus-xhigh
- Configuración relacionada IQ4_XS con MTP: https://huggingface.co/isilicon/mango-qwen27-cyber-iq4xs-mtp
- Configuración relacionada Q6_K: https://huggingface.co/isilicon/mango-qwen27-cyber-q6k
- Configuración relacionada MLX 4-bit: https://huggingface.co/isilicon/mango-qwen38-27b-uncensored-mlx4
- Comunidad Discord de Infinity: https://discord.gg/5n5YDbQCMy
