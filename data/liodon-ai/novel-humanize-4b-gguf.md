# liodon-ai/novel-humanize-4b-GGUF

## Resumen

novel-humanize-4b es un modelo de generación de texto de 4.022 millones de parámetros, derivado de Qwen/Qwen3-4B y entrenado por gugujiji, cuya finalidad principal, según su nombre, es la humanización de texto narrativo (reescritura de texto generado por IA para que resulte más natural). La ficha aquí documentada corresponde a la versión cuantizada en formato GGUF publicada por Liodon AI, que permite ejecutar el modelo localmente en hardware de consumo mediante llama.cpp, Ollama, LM Studio o Jan.

Su relevancia radica en la combinación de un tamaño contenido (4B) con una especialización en escritura novelística, lo que lo hace viable en GPUs domésticas e incluso en CPU. El repositorio cuantizado ofrece siete variantes de cuantización, desde Q2_K (1,67 GB) hasta Q8_0 (4,28 GB), con Q4_K_M señalado como el punto óptimo calidad/tamaño.

No se ha publicado una model card detallada del modelo base en la información disponible, por lo que varios datos técnicos (longitud de contexto, idiomas, datos de entrenamiento) no constan explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Qwen3-4B) |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_0, Q4_K_M, Q5_K_M, Q6_K, Q8_0 (GGUF); existe variante con iMatrix en liodon-ai/novel-humanize-4b-imatrix-GGUF |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base, gugujiji/novel-humanize-4b, es un ajuste sobre Qwen/Qwen3-4B, una familia de modelos transformer densos de Meta-like escalas pequeñas desarrollada por el equipo de Qwen (Alibaba). Al tratarse de un derivado directo de Qwen3-4B, hereda su arquitectura transformer densa con las novedades habituales de la familia Qwen3 (GQA y soporte de razonamiento en la familia original), aunque la model card del derivado no detalla modificaciones arquitectónicas.

No se dispone de información sobre el conjunto de datos de entrenamiento, el numero de tokens, ni sobre el uso de técnicas como SFT, RLHF o DPO para el ajuste específico de humanización de texto. La versión aquí documentada es una cuantización GGUF realizada por Liodon AI, con opción de calibración iMatrix en un repositorio aparte para mejorar la calidad de las cuantizaciones por debajo de 4 bits.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Reescritura y humanización de texto narrativo, según la finalidad indicada por el nombre del modelo base.
- Herencia de las capacidades generales de Qwen3-4B (razonamiento, codigo, matematicas), aunque sin benchmarks publicados que lo confirmen para este ajuste.
- Ejecucion local eficiente en formato GGUF con llama.cpp, Ollama, LM Studio y Jan.
- No hay informacion disponible sobre tool calling, agentes, vision, audio ni thinking mode para este ajuste concreto.

## Casos de uso

- Humanizacion de borradores narrativos: reescritura de texto generado por otro LLM para reducir patrones tipicos de IA en novelas y relatos, aprovechando el ajuste especifico del modelo base.
- Escritura creativa asistida en local: generacion y pulido de prosa sin enviar texto a servicios externos, util para autores con requisitos de privacidad.
- Integracion en pipelines de edicion: puede invocarse desde llama.cpp en scripts por lotes para procesar capitulos completos de forma automatizada.
- Uso en portatiles sin GPU dedicada: las variantes Q2_K y Q3_K_M (1,67-2,08 GB) permiten inferencia en equipos modestos.
- Prototipado de aplicaciones de escritura con LM Studio o Jan: carga rapida del modelo para pruebas de prompts y flujos de reescritura.
- Despliegue en Ollama para equipos pequeños: un solo comando (`ollama run hf.co/liodon-ai/novel-humanize-4b-GGUF:Q4_K_M`) lo hace accesible sin configuracion compleja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun la model card): Q2_K ~2 GB, Q3_K_M ~2 GB, Q4_0 ~3 GB, Q4_K_M ~3 GB, Q5_K_M ~3 GB, Q6_K ~4 GB, Q8_0 ~5 GB.
- Dado el tamaño, cabe sobradamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090 e incluso GPUs de 4-6 GB con cuantizaciones bajas. Tambien es viable en CPU con RAM suficiente.
- No se requieren GPUs de centro de datos (A100/H100) para inferencia.
- Despliegue compatible con llama.cpp, Ollama, LM Studio y Jan; no hay informacion sobre vLLM o TGI para esta version GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| novel-humanize-4b (esta ficha) | ~4,02 B | GGUF (7 quants) | other | Ajuste de Qwen3-4B para humanizacion de texto narrativo |
| Qwen/Qwen3-4B (base) | ~4 B | safetensors | Apache 2.0 | Modelo original multiuso, sin ajuste de humanizacion |
| Llama-3.2-3B-Instruct | ~3,2 B | safetensors/GGUF | Llama 3.2 Community | Alternativa generalista de escala similar |

La comparativa se limita a modelos base de escala comparable; no hay alternativas especializadas en humanizacion de texto con datos publicados en la informacion disponible.

## Limitaciones y advertencias

- La licencia figura como "other" sin detalle: conviene verificar los terminos exactos antes de cualquier uso comercial.
- No hay informacion sobre idiomas soportados; al derivar de Qwen3-4B es probable buen rendimiento en chino e ingles, pero el rendimiento en castellano no esta documentado.
- No existen benchmarks publicados, por lo que la calidad del ajuste de humanizacion no puede verificarse objetivamente.
- Riesgo de alucinacion tipico de modelos de 4B, posiblemente acentuado por un ajuste especializado en reescritura creativa.
- La cuantizacion (especialmente Q2_K y Q3_K_M) degrada la calidad respecto al modelo original; para sub-4 bits se recomienda la variante iMatrix del mismo autor.
- El modelo base (gugujiji/novel-humanize-4b) carece de model card detallada, lo que dificulta evaluar datos de entrenamiento y sesgos potenciales.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/liodon-ai/novel-humanize-4b-GGUF
- Modelo base: https://huggingface.co/gugujiji/novel-humanize-4b
- Modelo original: https://huggingface.co/Qwen/Qwen3-4B
- Variante iMatrix: liodon-ai/novel-humanize-4b-imatrix-GGUF (en HuggingFace)
- Perfil del cuantizador: https://huggingface.co/liodon-ai
