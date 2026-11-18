# JohnCheng/gemma-4-26b-ebft-sft-rl

## Resumen

JohnCheng/gemma-4-26b-ebft-sft-rl es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario JohnCheng. Se trata de un ajuste fino (fine-tuning) sobre la familia Gemma 4 de Google, con aproximadamente 25.800 millones de parametros (25,8 B) segun los pesos en safetensors. El nombre del repositorio sugiere una cadena de entrenamiento en tres fases: EBFT (posiblemente un metodo de entrenamiento por retroalimentacion o evolutivo), SFT (supervised fine-tuning) y RL (reinforcement learning).

El modelo resuelve tareas de generacion de texto a partir de imagenes y texto combinados, con capacidad conversacional. Es relevante porque aplica tecnicas de alineacion adicionales (SFT + RL) sobre un modelo base multimodal de gran tamano, lo que potencialmente mejora la calidad de las respuestas en tareas de instruccion. No obstante, la informacion publica es extremadamente limitada: no hay model card sustantiva, no se declaran idiomas, licencia ni resultados de benchmarks.

El acceso esta restringido (gated), lo que obliga a aceptar condiciones en Hugging Face antes de la descarga. El repositorio ocupa 154,9 GB, un tamano coherente con pesos en precision completa o bfloat16 para un modelo de ~26 B de parametros multimodales. La fecha de creacion (noviembre de 2026) y la escasa traccion (10 descargas, 0 likes) indican que es un modelo reciente y poco adoptado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Gemma 4 |
| Parametros totales | 25.805.933.872 (~25,8 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 154,9 GB |
| Acceso | restringido (gated) |
| Descargas | 10 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer multimodal de la familia Gemma 4, orientado a tareas image-text-to-text. El modelo procesa entradas conjuntas de imagen y texto y genera respuestas conversacionales. El identificador del repositorio ("ebft-sft-rl") sugiere un pipeline de entrenamiento por etapas: una fase EBFT (cuya expansion exacta no se documenta), seguida de supervised fine-tuning (SFT) y finalmente reinforcement learning (RL). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni los detalles del algoritmo de RL empleado (por ejemplo, RLHF, DPO o variantes de policy optimization).

No se han publicado detalles tecnicos sobre innovaciones especificas como decodificacion especulativa, atencion lineal o modos de razonamiento explicito. El unico paper referenciado en las etiquetas es arXiv:1910.09700, que corresponde al articulo original de Transformers (Vaswani et al., 2017) y no aporta informacion sobre este ajuste fino concreto. La ausencia de model card detallada impide verificar la composicion del dataset o las tecnicas de alineacion.

## Capacidades

- Generacion de texto conversacional a partir de entradas de imagen y texto (pipeline image-text-to-text).
- Procesamiento multimodal: interpretacion de imagenes combinadas con instrucciones textuales.
- Capacidad conversacional multi-turno (etiqueta "conversational").
- Compatibilidad con endpoints (etiqueta "endpoints_compatible"), lo que facilita el despliegue mediante Inference Endpoints de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, audio, vision): vision confirmada por el pipeline; otras no disponibles.

## Casos de uso

- Descripcion automatica de imagenes en castellano: el modelo puede recibir una imagen y generar una descripcion textual detallada, util para accesibilidad o catalogacion de contenido visual.
- Asistencia conversacional sobre documentos escaneados: combinando OCR previo con la entrada de imagen, el modelo puede responder preguntas sobre el contenido de facturas, formularios o capturas.
- Moderacion de contenido visual con contexto textual: el modelo puede evaluar imagenes junto con instrucciones para clasificar o describir contenido sensible, aunque requiere validacion humana por la falta de benchmarks.
- Prototipado de interfaces multimodales: gracias a la compatibilidad con transformers y endpoints, sirve para experimentar con asistentes que reciben capturas de pantalla y responden con texto.
- Investigacion en alineacion: el pipeline EBFT + SFT + RL lo hace interesante como objeto de estudio para comparar tecnicas de ajuste sobre un modelo base Gemma 4.
- Generacion de texto asistida por imagen en entornos de documentacion tecnica: por ejemplo, describir diagramas de arquitectura o graficos para incluirlos en manuales.
- Evaluacion comparativa de modelos multimodales: util como punto de comparacion frente a Gemma 4 base u otros modelos image-text-to-text de tamano similar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (25,8 B x 2 bytes), mas overhead de activaciones y cache KV; en la practica, se recomienda al menos 60-80 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: ~26 GB para pesos, mas overhead; viable en GPUs de 40-48 GB.
- VRAM estimada en cuantizacion de 4 bits: ~13-15 GB para pesos, mas overhead; podria caber en GPUs consumer de 24 GB (RTX 3090, RTX 4090) con contexto limitado, aunque no se publican GGUF oficiales.
- GPUs recomendadas para precision completa: A100 80 GB, H100 80 GB, o multiples GPUs con tensor parallelism.
- Cabe en consumer GPU: solo con cuantizacion agresiva (4 bits) y contexto reducido; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada), Inference Endpoints de Hugging Face (etiqueta endpoints_compatible). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JohnCheng/gemma-4-26b-ebft-sft-rl | ~25,8 B | no disponible | image-text-to-text | no disponible | gated, 10 descargas |
| Gemma 4 base (referencia de familia) | no disponible en esta ficha | no disponible | multimodal segun variante | licencia Gemma (habitual) | publica |
| Alternativas image-text-to-text de ~26 B | no disponible | no disponible | image-text-to-text | no disponible | no disponible |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas concretas; la informacion publica del modelo es demasiado escasa.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: no se documentan datos de entrenamiento, sesgos ni evaluaciones.
- Riesgo elevado de alucinacion no cuantificado: sin benchmarks ni evaluaciones de fidelidad, no es posible estimar la tasa de errores.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano ni en otros idiomas.
- Licencia no disponible: impide determinar si el uso comercial esta permitido; ademas, al derivar de Gemma 4, podrian aplicar las condiciones de la licencia Gemma original, que no se confirman.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que anade friccion para su adopcion en produccion.
- Modelo con muy poca traccion (10 descargas, 0 likes): sin validacion comunitaria ni reportes de terceros.
- Tamano del repositorio (154,9 GB) y de los pesos (~26 B) exigen infraestructura considerable; no hay versiones cuantizadas oficiales publicadas.
- Fecha de creacion futura (noviembre de 2026) y metadatos incompletos: conviene verificar la integridad del repositorio antes de usarlo en entornos criticos.
- No se confirma soporte de tool calling, agentes ni modos de razonamiento, por lo que no debe asumirse en disenos de sistemas agenticos.

## Enlaces

- Hugging Face: https://huggingface.co/JohnCheng/gemma-4-26b-ebft-sft-rl
- Paper referenciado en etiquetas (Transformers, Vaswani et al.): https://arxiv.org/abs/1910.09700
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
