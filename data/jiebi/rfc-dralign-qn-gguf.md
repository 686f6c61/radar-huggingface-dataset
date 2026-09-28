# jiebi/RFC-DRAlign-QN-GGUF

## Resumen

RFC-DRAlign-QN-GGUF es una compilación cuantizada en formato GGUF (Q8_0) de RFC-DRAlign-QN, un modelo bi-encoder de recuperación construido a partir de mistralai/Mistral-7B-v0.1 mediante un ajuste fino con LoRA. Su autor es el usuario jiebi y su propósito es muy específico: dado un fragmento de un RFC o de un borrador (draft) del IETF que describe una decisión de diseño, recuperar el hilo de la lista de correo del IETF donde esa decisión se discutió. No es un modelo generativo ni un asistente conversacional: su única salida útil es un vector de embedding.

Técnicamente es un transformer decoder-only de 7.241.764.864 parámetros (7,24 mil millones) reutilizado como codificador denso. El adaptador LoRA se ha fusionado con los pesos base y la capa de embeddings se ha redimensionado de 32.000 a 32.004 entradas antes de cuantizar. El repositorio incluye además un fichero con vectores de referencia generados desde el checkpoint fp16 en PyTorch, pensado para verificar reconstrucciones independientes del GGUF.

Su relevancia es doble. Por un lado, cubre un nicho poco atendido: la trazabilidad del "por qué" de los estándares de Internet, un problema real para autores de drafts, implementadores y grupos de trabajo. Por otro, es un ejemplo ilustrativo de un detalle que suele pasarse por alto en modelos de embeddings: el contrato de servicio (pooling y token EOS) queda grabado en los metadatos del GGUF, y alterarlo degrada la similitud coseno frente a la referencia de ~0,985-0,9998 a ~0,86.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral-7B-v0.1) usado como bi-encoder de embeddings |
| Parametros totales | 7.241.764.864 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens heredados de Mistral-7B-v0.1; no confirmado en la model card |
| Tipos de cuantizacion | Q8_0 (unico fichero publicado en el repositorio) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | GGUF (LoRA fusionado y embeddings redimensionados 32.000 → 32.004) |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-v0.1, un transformer decoder-only con atención causal, Grouped-Query Attention, activación SwiGLU, RoPE y sliding window attention. Sobre él se aplicó un ajuste fino con LoRA cuyo resultado es el repositorio jiebi/RFC-DRAlign-QN, que contiene únicamente el adaptador. La versión aquí documentada fusiona ese adaptador con los pesos base, redimensiona la matriz de embeddings de 32.000 a 32.004 filas y cuantiza el conjunto resultante a Q8_0. El corpus de entrenamiento es el dataset jiebi/RFCAlign.

La innovación relevante no está en la arquitectura, sino en el contrato de servicio, que queda embebido en los metadatos del GGUF. El modelo solo produce embeddings correctos bajo dos condiciones simultáneas: exactamente un token EOS final añadido automáticamente (`tokenizer.ggml.add_eos_token=true`) y pooling sobre el último token, que es el EOS (`llama.pooling_type=3`, es decir, LAST), en lugar del habitual mean pooling. Cualquier stack que respete los metadatos estándar de GGUF (llama.cpp, Ollama) aplica ambas condiciones sin configuración adicional. Si se reconvierte o recuantiza desde el repositorio base, hay que reproducirlas manualmente. Además, las consultas se evaluaron durante el entrenamiento con el prefijo `"query:  "` (los pasajes se pasan en crudo, sin prefijo), y ninguna capa de servicio lo aplica de forma automática.

No se dispone de información sobre el número de tokens de entrenamiento, la composición detallada del dataset RFCAlign ni sobre el uso de RLHF o DPO en la model card ni en los datos proporcionados.

## Capacidades

- Generación de embeddings de frases y pasajes en inglés, orientados a recuperación densa.
- Recuperación del hilo de discusión de la lista de correo del IETF asociado a una decisión de diseño concreta de un RFC o draft.
- Funcionamiento como bi-encoder: codifica consultas y pasajes de forma independiente, lo que permite preindexar el corpus de pasajes.
- Búsqueda semántica y similitud coseno sobre espacios vectoriales de 4.096 dimensiones (dimensión heredada de Mistral-7B-v0.1).
- Uso como componente de recuperación dentro de pipelines RAG.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo de pensamiento (thinking mode), visión, audio ni ninguna otra modalidad.
- No está diseñado para generación de texto: su uso generativo no está validado y produciría salidas sin garantías.

## Casos de uso

- Búsqueda semántica sobre archivos históricos de listas de correo del IETF: se indexan todos los mensajes como pasajes y el modelo devuelve, ante un fragmento de draft, los hilos más próximos en el espacio vectorial, aprovechando que fue entrenado explícitamente para ese emparejamiento.
- Recuperación aumentada para asistentes de autores de drafts: un asistente que ayuda a redactar un draft puede consultar este modelo para citar automáticamente discusiones previas y evitar reproponer decisiones ya debatidas en el grupo de trabajo.
- Auditoría de procedencia de decisiones de diseño (design rationale): un implementador que revisa un RFC puede rastrear el origen de una regla concreta y comprobar las objeciones que se plantearon durante su discusión.
- Deduplicación y agrupamiento de hilos de discusión: los embeddings permiten agrupar por similitud hilos repetidos o solapados entre distintas listas y periodos de tiempo, reduciendo el trabajo de revisión manual.
- Enrutado de consultas a grupos de trabajo: dado un texto entrante, el modelo permite identificar qué WG o lista es más afín al tema, como paso previo a una clasificación o asignación.
- Detección de regresiones en pipelines de embeddings: el fichero `rfc-dralign-reference-vecs.json` incluido en el repositorio permite comparar cualquier reconstrucción del GGUF contra la referencia fp16 y verificar que la similitud coseno se mantiene en el rango 0,985-0,9998.
- Construcción de índices vectoriales con metadatos temporales: combinado con un almacén vectorial, permite reconstruir la evolución de una decisión a lo largo del tiempo consultando el hilo más próximo en distintas ventanas temporales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de benchmarks de recuperación estándar (MTEB, BEIR, etc.) en la model card ni en los metadatos del repositorio.

El único dato cuantitativo publicado es la validación de fidelidad de la cuantización frente a la referencia fp16 en PyTorch, medida como similitud coseno:

| Configuracion de servicio | Similitud coseno frente a la referencia fp16 |
|---|---|
| Un solo token EOS + pooling LAST (configuracion correcta) | 0,985 - 0,9998 |
| Doble EOS o mean pooling | ~0,86 |

El segundo valor es una medición de validación en vivo reportada por el autor, y sirve como indicador de cuánto se degrada el espacio vectorial si no se respeta el contrato de servicio.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 ocupa aproximadamente 7,7 GB, por lo que se recomienda un mínimo de 8-10 GB de VRAM contando el overhead de contexto y runtime.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) van sobradas y permiten lotes grandes; una RTX 3060 de 12 GB o una RTX 4070 Ti de 12 GB son suficientes con tamaños de lote moderados.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 12 GB o más de VRAM. No requiere A100 ni H100, ya que es un modelo de 7,24 mil millones de parámetros orientado a extracción de características, no a generación con contexto largo.
- Despliegue en CPU: viable con llama.cpp, aunque con mayor latencia; no se publican otras cuantizaciones de menor tamaño que Q8_0 en este repositorio.
- Opciones de despliegue: llama.cpp (`llama-server -m RFC-DRAlign-QN-Q8_0.gguf --embedding`) y Ollama (`ollama create` a partir del fichero GGUF y consulta al endpoint `/api/embed`). Ambos respetan los metadatos de pooling y EOS. No se documenta compatibilidad con vLLM o TGI para esta configuración GGUF con pooling LAST.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos publicados para este modelo, por lo que la comparación se limita a atributos estructurales y de licencia de modelos de embeddings de propósito general de tamaño comparable. Los datos de los modelos alternativos proceden de información pública de sus repositorios y no han sido verificados con benchmarks propios.

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| jiebi/RFC-DRAlign-QN-GGUF | 7,24 B | 8.192 tokens (heredado) | MIT | Recuperacion de discusiones del IETF sobre decisiones de diseno en RFC/drafts; solo ingles |
| intfloat/e5-mistral-7b-instruct | 7 B | 32.768 tokens | MIT | Embeddings de proposito general, multilingue, entrenado sobre datos sinteticos de instrucciones |
| GTE-Qwen2-7B-instruct | 7 B | 32.768 tokens | Apache 2.0 | Embeddings de proposito general, multilingue, alto rendimiento en MTEB |
| BAAI/bge-large-en-v1.5 | 0,335 B | 512 tokens | MIT | Embeddings de proposito general en ingles, mucho mas ligero y rapido |

La diferencia funcional clave es que los tres alternativos son modelos de embedding generalistas, mientras que RFC-DRAlign-QN está ajustado para un dominio cerrado (documentacion y listas del IETF) donde previsiblemente supera a los generalistas, a costa de no ser util fuera de ese dominio.

## Limitaciones y advertencias

- Modelo exclusivamente en inglés: los idiomas distintos del inglés no están soportados y producirán embeddings degradados.
- No es un modelo generativo. Aunque hereda la arquitectura de Mistral-7B-v0.1, está ajustado para producir embeddings y no debe usarse para generar texto.
- Dependencia estricta del contrato de servicio: un solo token EOS final y pooling LAST. Cualquier desviación (doble EOS, mean pooling) rebaja la similitud coseno frente a la referencia de 0,985-0,9998 a ~0,86, lo que invalida la comparación con índices construidos correctamente.
- El prefijo `"query:  "` en las consultas no se aplica automáticamente en ninguna capa de servicio; si no se añade manualmente, los embeddings de consulta no coinciden con la configuración evaluada en entrenamiento.
- Dominio muy restringido: el rendimiento fuera del corpus de RFC, drafts y listas del IETF no está documentado ni validado.
- Sesgos conocidos: no disponibles. No se publica ninguna evaluación de sesgos, y el corpus de entrenamiento (listas de correo técnico del IETF) puede introducir sesgos de representación propios de esa comunidad.
- Riesgo de alucinación: no aplica directamente al ser un modelo de embeddings, pero existe riesgo de recuperación irrelevante, es decir, de devolver un hilo con alta similitud coseno que no sea la discusión que originó la decisión consultada. El autor no publica métricas de precisión de recuperación (recall@k, nDCG) que permitan acotar este riesgo.
- Restricciones de licencia: el repositorio se publica bajo MIT, lo que permite uso comercial. Conviene verificar la licencia del modelo base (Mistral-7B-v0.1 se distribuye bajo Apache 2.0) y del dataset jiebi/RFCAlign antes de un despliegue comercial.
- Adopción nula: 0 descargas y 0 "likes" en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Repositorio de 7,7 GB con una única cuantización: no hay alternativas de menor precisión (Q4, Q5) que reduzcan requisitos de memoria o aumenten el throughput.
- La fecha de creación registrada (2026-09-27) es posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo: los resultados obtenidos eran contenido no relacionado y se han descartado por completo, por lo que no se ha podido contrastar la información de la model card con fuentes externas.

## Enlaces

- Repositorio HuggingFace del GGUF: https://huggingface.co/jiebi/RFC-DRAlign-QN-GGUF
- Repositorio del adaptador LoRA base: https://huggingface.co/jiebi/RFC-DRAlign-QN
- Dataset de entrenamiento: https://huggingface.co/datasets/jiebi/RFCAlign
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.1
- Proyecto llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de Ollama: https://ollama.com/
- Paper, blog o demo adicionales: no disponibles (la búsqueda web no devolvió resultados relevantes sobre este modelo).
