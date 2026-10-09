# peikoff/objectivist_llama3_2_8x3b_moe-GGUF

## Resumen

Objectivist Llama 3.2 8x3B MoE (GGUF) es una recopilacion de cuantizaciones en formato GGUF del modelo `peikoff/llama3-2-8x3b-moe-objectivist-merged`, desarrollado por Ason Peikoff. Se trata de un ajuste fino con QLoRA sobre un merge de arquitectura Mixture-of-Experts (MoE) basado en la familia Llama 3.2, con 18.404.944.960 parametros totales distribuidos en ocho expertos de aproximadamente 3B cada uno. El entrenamiento se realizo sobre un corpus de textos relacionados con el Objetivismo, la corriente filosofica fundada por Ayn Rand.

El modelo resuelve el problema de disponer de un asistente conversacional especializado en ese dominio filosofico concreto, con un tono y un marco conceptual alineados con esa tradicion, y empaquetado en GGUF para su ejecucion local mediante llama.cpp sin necesidad de GPU de datacenter. La relevancia practica esta en su tamano: un MoE de 18.4B que, cuantizado en Q4_K_M, ocupa 11,31 GB y puede ejecutarse en hardware de consumo.

El repositorio contiene cuatro cuantizaciones (Q8_0, Q6_K, Q5_K_M y Q4_K_M) generadas a partir del merge en fp16. Solo la variante Q4_K_M fue cargada y probada por el autor. No se han publicado benchmarks ni evaluaciones con conjuntos de validacion, y el propio autor advierte de que la cuantizacion degrada la calidad respecto al merge original en fp16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture-of-Experts (MoE), derivada de Llama 3.2 |
| Parametros totales | 18.404.944.960 (18,4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Ingles (en) |
| Licencia | other (se aplican potencialmente la licencia del modelo base, la Llama 3.2 Community License y los terminos de los datos de entrenamiento) |
| Formato de pesos | GGUF (llama.cpp); el modelo base en fp16 se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capa Mixture-of-Experts, resultado de un merge de ocho expertos de aproximadamente 3B cada uno sobre la base de Llama 3.2, con un total de 18,4B parametros. El modelo parte de `peikoff/llama3-2-8x3b-moe-objectivist-merged`, que a su vez es un ajuste fino con QLoRA del merge MoE sobre textos de tematica objetivista. No se especifican en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. El numero de expertos activos por token y el mecanismo de enrutamiento no se detallan en la model card.

El proceso de publicacion de este repositorio es puramente de cuantizacion: el merge en fp16 se convirtio a GGUF con llama.cpp y despues se cuantizo con `llama-quantize`. Los cuatro ficheros se generaron con el mismo procedimiento. El modelo utiliza la plantilla de chat de Llama 3, que va embebida en el propio fichero GGUF. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal ni tecnicas similares) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, con plantilla de chat de Llama 3.
- Respuesta a preguntas de dominio sobre Objetivismo y temas filosoficos afines.
- Generacion de texto general, segun la prueba realizada por el autor con un prompt generico ademas de preguntas de dominio.
- Soporte de inferencia local via llama.cpp y compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Asistente conversacional especializado en filosofia objetivista: el modelo puede mantener dialogos multi-turno sobre los planteamientos de Ayn Rand y tradiciones afines, con un encuadre coherente con ese corpus, para uso en entornos educativos o de divulgacion.
- Chatbot local para investigacion filosofica: al ejecutarse en GGUF con llama.cpp, permite desplegar un asistente de dominio en una estacion de trabajo sin conexion a servicios externos, util para consultar y contrastar terminologia de esa tradicion.
- Generacion de material divulgativo: redaccion de borradores de articulos, resumenes o guiones sobre temas objetivistas, siempre con revision humana posterior por el riesgo de afirmaciones inventadas.
- Experimentacion con arquitecturas MoE: sirve como caso de estudio para evaluar el comportamiento de un MoE de 18.4B cuantizado en Q4_K_M frente al merge en fp16, midiendo la degradacion introducida por la cuantizacion.
- Base para ajustes posteriores con LoRA o QLoRA: al disponer de GGUF y del merge en safetensors, se puede usar como punto de partida para especializaciones adicionales dentro del mismo dominio.
- Evaluacion de tecnicas de alineacion: dado que el modelo base es descrito como abliterated, resulta util para estudiar como se comporta un modelo sin mecanismos de rechazo robustos y que salvaguardas hay que anadir antes de exponerlo publicamente.
- Demostraciones y prototipos de inferencia local: con 11,31 GB en Q4_K_M, se puede montar un entorno de demostracion en una GPU de consumo para ensenar despliegue de modelos en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ha ejecutado ninguna evaluacion con benchmarks ni con conjuntos de validacion, y que solo la cuantizacion Q4_K_M fue cargada y probada con prompts de dominio y un prompt general, sin metricas publicadas.

## Requisitos de hardware

- VRAM estimada para los pesos, segun el fichero GGUF (medida derivada del tamano de cada cuantizacion, sin contar cache KV ni overhead de runtime):
  - Q4_K_M: 11,31 GB
  - Q5_K_M: 13,16 GB
  - Q6_K: 15,15 GB
  - Q8_0: 19,57 GB
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 o RTX 3090 (24 GB) permite cargar los pesos completos con margen para contexto; para Q8_0 conviene una GPU de 24 GB o superior, o bien A100 / H100 si se busca throughput alto y contextos largos.
- Cabe en GPU de consumo: si, al menos en Q4_K_M y Q5_K_M sobre tarjetas de 24 GB. En tarjetas de 16 GB (por ejemplo RTX 4080) el Q4_K_M queda justo y puede requerir reducir el contexto o descargar capas a CPU con `-ngl`.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama y cualquier runtime compatible con GGUF. El repositorio incluye la plantilla de chat embebida y esta etiquetado como compatible con endpoints.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| peikoff/objectivist_llama3_2_8x3b_moe-GGUF | 18,4B (MoE 8x3B) | no disponible | sin benchmarks publicados | other | GGUF en HuggingFace |
| DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF | 18,4B (MoE 8x3B) | no disponible | sin datos en la informacion disponible | no disponible en la informacion proporcionada | GGUF en HuggingFace (106k descargas, 165 likes en el momento de la busqueda) |
| Familia Llama 3.2 (Meta) | 1B y 3B densos | hasta 128k en variantes seleccionadas | benchmarks publicados por Meta para la familia, no aplicables directamente a este merge | Llama 3.2 Community License | safetensors y GGUF en HuggingFace |

La comparacion con DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct es la mas directa por compartir arquitectura y numero de parametros, aunque no se dispone de metricas comparativas en la informacion proporcionada. Los modelos densos de Llama 3.2 no son estrictamente comparables en capacidad, pero sirven como referencia de la familia base y de la licencia aplicable.

## Limitaciones y advertencias

- El modelo base esta descrito por su autor como uncensored y abliterated, lo que debilita el comportamiento de rechazo. Es necesario anadir salvaguardas propias antes de cualquier despliegue publico.
- Riesgo alto de alucinacion: puede producir afirmaciones fluidas pero falsas, incluidas citas y datos biograficos inventados. Cualquier contenido debe verificarse contra fuentes primarias.
- Sesgo de tradicion unica: el corpus de entrenamiento pertenece a una sola corriente de pensamiento y el modelo refleja su encuadre y sus marcos conceptuales, sin contraste con otras posiciones.
- Idioma: los metadatos declaran unicamente ingles; no hay soporte multilingue documentado.
- Longitud de contexto no especificada en la informacion disponible, lo que impide garantizar el comportamiento en conversaciones largas.
- Licencia `other`: se aplican potencialmente la licencia del modelo base, la Llama 3.2 Community License y los terminos de los datos de entrenamiento. Es imprescindible revisar el repositorio del merge antes de un uso comercial.
- Solo la cuantizacion Q4_K_M fue cargada y probada; Q8_0, Q6_K y Q5_K_M figuran como no ejecutadas, por lo que su funcionamiento no esta verificado por el autor.
- La cuantizacion reduce la calidad respecto al merge en fp16, sin que se haya cuantificado la magnitud de esa perdida.
- Sin benchmarks ni evaluacion con conjuntos de validacion: no hay evidencia empirica publicada sobre su rendimiento frente a alternativas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/peikoff/objectivist_llama3_2_8x3b_moe-GGUF
- Modelo base (merge en fp16): https://hf.co/peikoff/llama3-2-8x3b-moe-objectivist-merged
- Familia de modelos Llama de Meta: https://dev.meta.ai/llama/models/llama-3
- DavidAU/Llama-3.2-8X3B-MOE-Dark-Champion-Instruct-uncensored-abliterated-18.4B-GGUF: https://huggingface.co/models?search=llama-3.2
- Perfil de DavidAU en HuggingFace: https://huggingface.co/DavidAU
- Guia de cuantizacion GGUF: https://tech-insider.org/gguf-model-quantization-2026/
- Buscador de modelos GGUF: https://local-ai-zone.github.io/
