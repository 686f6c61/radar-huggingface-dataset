# huggingface12341/zsz-h1

## Resumen
zsz-h1 es un modelo de extraccion de caracteristicas (feature-extraction) publicado en Hugging Face por el usuario huggingface12341 bajo licencia Apache 2.0. Se trata de un merge de tres modelos base: vllm-sr/d3-ultra, OmniJev/OneJev1.6-27B y perplexity-ai/pplx-decider-v1.2, con un total de 26.085.330.160 parametros (aproximadamente 26.000 millones) almacenados en formato safetensors. El repositorio ocupa 52,2 GB y esta marcado como acceso restringido (gated), por lo que requiere aceptar condiciones en Hugging Face antes de su descarga.

El modelo se etiqueta con la familia arquitectonica qwen3_5 y con las etiquetas zils, d3 y merge, lo que sugiere una combinacion de pesos orientada a tareas de decision y extraccion de representaciones. Su pipeline declarado es feature-extraction, no generacion de texto, lo que condiciona su uso previsto: obtener embeddings o representaciones internas en lugar de producir texto autoregresivo de forma nativa. La informacion publica disponible es muy limitada: no hay model card detallada, no se declaran idiomas soportados y no se han publicado resultados de benchmarks.

La relevancia de esta ficha es principalmente documental: se trata de un modelo recien creado (23 de noviembre de 2026), sin descargas ni likes, con acceso restringido y con un proceso de merge poco documentado. Cualquier evaluacion en produccion deberia partir de una validacion empirica propia, dado que no existen datos verificables sobre calidad, sesgos o rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, segun tag); detalles no disponibles |
| Parametros totales | 26.085.330.160 (~26,1 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Tamano del repositorio | 52,2 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Libreria | transformers |
| Modelos base | vllm-sr/d3-ultra, OmniJev/OneJev1.6-27B, perplexity-ai/pplx-decider-v1.2 |
| Codigo personalizado | si (tag custom_code; requiere trust_remote_code) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla del tag qwen3_5, que situa el modelo en la estirpe Qwen 3.5. El dato de 26,1 mil millones de parametros es coherente con un transformer denso de gran tamano, aunque no se confirma si incorpora capas MoE ni cual es la distribucion de parametros activos. El modelo es un merge de tres checkpoints: vllm-sr/d3-ultra, OmniJev/OneJev1.6-27B y perplexity-ai/pplx-decider-v1.2. No se especifica la tecnica de merge empleada (por ejemplo, SLERP, TIES, DARE o model stock), ni los ratios de mezcla, ni si hubo una fase posterior de fine-tuning.

No se han publicado datos sobre el corpus de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO o cualquier otra etapa de alineamiento. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. El tag custom_code indica que la carga del modelo requiere codigo remoto del repositorio, lo que implica revisar dicho codigo antes de ejecutarlo en un entorno de produccion.

## Capacidades
- Extraccion de caracteristicas: es la capacidad declarada por el pipeline del repositorio; el modelo esta pensado para producir representaciones o embeddings a partir de entradas de texto.
- Clasificacion y decision: la etiqueta decision-model y el modelo base pplx-decider-v1.2 sugieren un uso orientado a tareas de decision o enrutamiento, aunque no se documenta el formato exacto de salida.
- Generacion de texto: no confirmada de forma nativa; el pipeline declarado no es text-generation.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; no se declaran idiomas.
- Vision, audio o modo thinking: no disponible.

## Casos de uso
- Generacion de embeddings para busqueda semantica: el modelo puede emplearse como encoder para indexar documentos y consultas en un motor de recuperacion vectorial, siempre que se valide empiricamente la calidad de sus representaciones frente a encoders especializados.
- Clasificacion de textos a escala: al ser un modelo de 26 B con pipeline de feature-extraction, puede servir como extractor de caracteristicas para un clasificador ligero aguas abajo (por ejemplo, deteccion de intencion o enrutamiento de tickets), con la ventaja de una representacion rica y la desventaja de un coste de inferencia alto.
- Enrutamiento de consultas en sistemas multi-modelo: el origen en pplx-decider-v1.2 apunta a un uso como componente de decision que selecciona el modelo o la herramienta adecuada para cada peticion; requiere validar el formato de salida y la calibracion.
- Filtrado y deduplicacion de corpus: las representaciones del modelo permiten calcular similitud entre documentos para eliminar duplicados o agrupar contenido tematicamente en pipelines de curacion de datos.
- Investigacion sobre tecnicas de merge: al ser un merge documentado solo por metadatos, es un candidato para estudiar el efecto de la combinacion de pesos en tareas de representacion, comparando contra cada modelo base por separado.
- Prototipado de sistemas RAG: integrado en un pipeline de recuperacion aumentada, el modelo puede actuar como encoder del indice, aunque su tamano exige planificar la infraestructura antes de desplegarlo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16/BF16: aproximadamente 52 GB solo para pesos (26,1 B x 2 bytes), mas overhead de activaciones y cache; en la practica se recomienda un minimo de 64-80 GB de VRAM.
- VRAM estimada en cuantizacion de 8 bits: en torno a 26-30 GB de pesos, con overhead adicional; no se publican variantes cuantizadas oficiales, por lo que habria que generarlas.
- VRAM estimada en cuantizacion de 4 bits: en torno a 13-16 GB de pesos, viable en GPUs de consumo de gama alta, aunque la calidad de las representaciones puede degradarse y no hay validacion publicada.
- GPU recomendadas: A100 80 GB o H100 80 GB para FP16/BF16 sin fragmentar; multiples RTX 4090 (24 GB) con tensor parallelism para FP16; una unica RTX 4090 o RTX 3090 solo en cuantizacion agresiva.
- Cabe en GPU de consumo: si, en cuantizacion de 4-8 bits, con reservas sobre la fidelidad de los embeddings resultantes.
- Opciones de despliegue: transformers con trust_remote_code habilitado (obligatorio por el tag custom_code); vLLM o TGI solo si el codigo remoto y la tarea de feature-extraction son compatibles, lo cual no esta documentado; llama.cpp/Ollama requeririan conversion a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pipeline | Licencia | Acceso |
|---|---|---|---|---|---|
| zsz-h1 | ~26,1 B | no disponible | feature-extraction | Apache 2.0 | restringido (gated) |
| OmniJev/OneJev1.6-27B (base) | ~27 B (por nombre) | no disponible | no disponible | no disponible | no disponible |
| perplexity-ai/pplx-decider-v1.2 (base) | no disponible | no disponible | no disponible | no disponible | no disponible |
| vllm-sr/d3-ultra (base) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicos de rendimiento, contexto ni licencia de los modelos base mas alla de lo indicado, por lo que la comparativa cuantitativa no es posible con la informacion disponible.

## Limitaciones y advertencias
- Ausencia total de model card: no hay documentacion sobre entrenamiento, datos, sesgos o evaluacion; cualquier uso en produccion exige validacion propia.
- Acceso restringido: la descarga requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la integracion automatizada en CI/CD.
- Codigo remoto: el tag custom_code obliga a ejecutar codigo del repositorio con trust_remote_code; hay que auditar ese codigo antes de usarlo, especialmente en entornos con datos sensibles.
- Pipeline de feature-extraction: no esta pensado para generacion de texto; usarlo como modelo conversacional produciria resultados no validados.
- Riesgo de alucinacion: no evaluado; al no haber benchmarks ni evaluaciones de seguridad, se desconoce su comportamiento en tareas generativas.
- Sesgos: no documentados; al ser un merge de modelos de terceros, hereda los sesgos de sus componentes sin que exista un analisis publicado.
- Idiomas: no se declaran idiomas soportados; el rendimiento fuera del ingles (o de los idiomas de los modelos base) es desconocido.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que los modelos base no impongan restricciones adicionales que el merge no pueda relajar.
- Madurez: modelo creado y actualizado el mismo dia (23 de noviembre de 2026), con cero descargas y cero likes; no hay evidencia de uso en comunidad ni mantenimiento.

## Enlaces
- Hugging Face: https://huggingface.co/huggingface12341/zsz-h1
- Modelo base OmniJev/OneJev1.6-27B: https://huggingface.co/OmniJev/OneJev1.6-27B
- Modelo base perplexity-ai/pplx-decider-v1.2: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Modelo base vllm-sr/d3-ultra: https://huggingface.co/vllm-sr/d3-ultra
