# junmo-k/pplx-embed-v1-0.6b-ane

## Resumen

pplx-embed-v1-0.6b-ane es una conversión a Core ML del modelo de embeddings de texto `perplexity-ai/pplx-embed-v1-0.6b`, publicada por el usuario junmo-k para su ejecución sobre el Apple Neural Engine (ANE) de los chips Apple Silicon mediante la herramienta ANERun. No se trata de un modelo nuevo, sino de un paquete de artefactos Core ML que permite ejecutar en local en un Mac el modelo de embeddings original de Perplexity AI, con atención bidireccional y pooling por media.

El modelo base es un encoder de aproximadamente 0,6 mil millones de parámetros (la cifra exacta no se detalla en la información disponible) derivado de la familia Qwen3, según la etiqueta `bidirectional_pplx_qwen3`. Su función es la extracción de características: convierte texto en vectores densos utilizables para búsqueda semántica, recuperación aumentada (RAG), clustering o clasificación. La conversión soporta entradas de hasta 32.768 tokens, aunque el instalador de ANERun adopta por defecto una ventana de 2.048 tokens.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de embeddings de Perplexity con contexto muy largo; por otro, muestra el patrón de despliegue en hardware de consumo Apple sin GPU dedicada, algo poco habitual en el ecosistema de embeddings de código abierto. La licencia es MIT y el repositorio ocupa 2,4 GB, incluyendo tokenizer, tabla de embeddings en float32, pesos de normalización final y fixtures de autoverificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (etiqueta `bidirectional_pplx_qwen3`), pooling por media |
| Parametros totales | ~0,6 B (denominación del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (2.048 por defecto en el instalador de ANERun) |
| Tipos de cuantizacion | no disponible (pesos de embeddings en float32 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Core ML (paquete fuente con `manifest.json`); tabla de embeddings float32 incluida |

## Arquitectura y entrenamiento

La model card describe un modelo de embeddings con atención bidireccional y mean pooling, pensado para producir un único vector por secuencia de entrada. La etiqueta `bidirectional_pplx_qwen3` sugiere que el modelo base de Perplexity parte de la arquitectura Qwen3 adaptada a atención bidireccional, un patrón habitual en encoders de recuperación que necesitan que cada token atienda a todo el contexto. La conversión a Core ML conserva el tokenizer, la tabla de embeddings en float32, los pesos de normalización final y fixtures de autoverificación; ANERun compila el modelo en el Mac de destino y valida los ficheros contra `manifest.json`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales del modelo original más allá de la atención bidireccional y el contexto de 32.768 tokens. Tampoco se detalla el esquema de pooling más allá de la media ni si se aplica normalización L2 a la salida.

## Capacidades

- Generación de embeddings de texto para recuperación semántica y búsqueda densa.
- Extracción de características (`feature-extraction`) con salida vectorial por secuencia.
- Contexto de hasta 32.768 tokens, adecuado para documentos largos en una sola pasada.
- Atención bidireccional con mean pooling, orientada a tareas de similitud y ranking.
- Ejecución en el Apple Neural Engine mediante ANERun, con compilación en el Mac de destino.
- Verificación de integridad de los artefactos contra `manifest.json` y fixtures de autotest incluidos.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión, audio ni modo de razonamiento; es un modelo exclusivamente de embeddings.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y artículos largos aprovechando la ventana de 32.768 tokens para evitar trocear en exceso y preservar contexto entre secciones.
- RAG sobre bases de conocimiento internas: generar embeddings de fragmentos y consultas para recuperar pasajes relevantes antes de pasarlos a un LLM generador, ejecutando todo el pipeline de recuperación en local en un Mac.
- Deduplicación y clustering de documentos: calcular similitud coseno entre vectores de artículos, tickets o correos para agrupar contenido redundante sin enviar datos a la nube.
- Clasificación de texto por similitud a prototipos: usar los embeddings como entrada a un clasificador ligero (kNN o regresión logística) para etiquetar soporte, spam o categorías editoriales.
- Procesamiento por lotes en portátiles Apple Silicon: desplegar el modelo vía ANERun en un MacBook para tareas de indexación offline sin GPU dedicada, con compilación Core ML en el propio equipo.
- Filtrado previo en pipelines de moderación o compliance: comparar embeddings de mensajes contra un conjunto de referencia de casos sensibles para priorizar revisión humana.
- Evaluación de similitud entre versiones de documentos: detectar cambios semánticos entre revisiones de contratos o especificaciones calculando la distancia entre sus vectores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: chips Apple Silicon (Apple Neural Engine) mediante ANERun; no se documenta soporte para GPU NVIDIA ni CPU x86.
- VRAM: no aplica; el modelo se ejecuta en memoria unificada del SoC Apple. El repositorio ocupa 2,4 GB, lo que da una cota superior aproximada del espacio en disco necesario.
- GPU recomendadas: no disponible; el requisito es un Mac con Apple Silicon y una build de ANERun que soporte `pplx-embed-v1-0.6b`.
- Cabe en hardware de consumo: sí, en equipos Apple Silicon, al ejecutarse sobre el Neural Engine en lugar de una GPU dedicada.
- Opciones de despliegue: ANERun (`anerun models install` y `anerun embed`); no se documentan vLLM, llama.cpp, Ollama ni TGI para este paquete Core ML.
- Latencia y throughput: no disponibles.
- Nota operativa: el instalador usa 2.048 tokens por defecto; para el contexto completo hay que pasar `--max-tokens 32768` tanto en la instalación como en tiempo de ejecución.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / despliegue | Licencia |
|---|---|---|---|---|
| pplx-embed-v1-0.6b-ane (esta ficha) | ~0,6 B | 32.768 tokens | Core ML / ANERun (Apple Silicon) | MIT |
| perplexity-ai/pplx-embed-v1-0.6b (original) | ~0,6 B | no disponible en la información | Pesos originales (no especificado) | MIT (según la conversión) |
| Alternativas de embeddings de ~0,6 B | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es una conversión de terceros, no un modelo oficial de Perplexity AI; la fidelidad respecto al original depende del proceso de conversión y de la revisión indicada.
- Depende de una build de ANERun que soporte explícitamente `pplx-embed-v1-0.6b`; sin ella el paquete no es utilizable.
- La instalación requiere especificar el SHA de commit completo de 40 caracteres, lo que añade fricción operativa y obliga a fijar revisiones.
- El contexto por defecto es de 2.048 tokens; usar los 32.768 completos exige configuración explícita y probablemente mayor consumo de memoria.
- Solo produce embeddings: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No se documentan idiomas soportados, sesgos conocidos ni tasas de alucinación (no aplica de forma directa a un encoder, pero sí la calidad de la recuperación).
- Ejecución limitada al ecosistema Apple Silicon; no hay ruta documentada para NVIDIA, AMD o CPU genérica.
- Licencia MIT permite uso comercial, pero conviene revisar el aviso de conversión (`NOTICE`) y la licencia del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/junmo-k/pplx-embed-v1-0.6b-ane
- Modelo base original: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Revisión original convertida: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b/tree/2c4d510dd4a732063c31a0f70193e35067b51fd8
- ANERun: https://github.com/junmo-kim/ANERun
