# dititce/bge-m3-decisoes-final

## Resumen

`dititce/bge-m3-decisoes-final` es un ajuste fino mediante LoRA del modelo de embeddings multilingüe BAAI/bge-m3, desarrollado por el usuario `dititce`. El modelo base bge-m3 es un encoder basado en la arquitectura XLM-RoBERTa orientado a recuperación de información densa, dispersa y multi-vector, y este ajuste lo especializa en el dominio de la legislación en portugués, según declara el autor en la model card.

El modelo cuenta con 567.754.752 parámetros (aproximadamente 568 millones) y se distribuye en formato safetensors con un tamaño de repositorio de 2,3 GB. La licencia es Apache 2.0 y el único idioma declarado en los metadatos es el portugués (`pt`), lo que restringe de facto su ámbito de aplicación al dominio jurídico lusófono.

Es relevante ahora porque demuestra el patrón habitual de especialización de encoders de recuperación mediante PEFT sobre un backbone ya entrenado, un enfoque de bajo coste que permite adaptar sistemas RAG jurídicos sin reentrenar desde cero. No obstante, la información pública es muy escasa: cero descargas, cero likes, ausencia de pipeline declarado y una model card mínima que no documenta datos de entrenamiento, hiperparámetros ni métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer), base BAAI/bge-m3 |
| Parametros totales | 567.754.752 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base bge-m3 admite 8.192 tokens, pero el ajuste no lo documenta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugues (`pt`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA/PEFT) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura XLM-RoBERTa del backbone BAAI/bge-m3, un encoder transformer diseñado originalmente para generar embeddings de recuperación en tres modos (denso, disperso y multi-vector). Sobre esta base se ha aplicado un ajuste fino con LoRA (Low-Rank Adaptation), técnica PEFT que congela los pesos originales y entrena únicamente matrices de bajo rango, según indica el autor y confirma la dependencia `peft` documentada en la model card.

No se dispone de información sobre el corpus de entrenamiento: no se especifica el número de tokens, la composición del dataset jurídico, el proceso de construcción de pares consulta-documento ni si se aplicaron técnicas de minería de negativos duros. Tampoco se documentan hiperparámetros de LoRA (rango, alpha, targets), régimen de entrenamiento, ni si se realizó evaluación intermedia. La model card menciona únicamente que el ajuste está orientado a "tareas relacionadas con legislación".

## Capacidades

- Generación de embeddings de texto para recuperación de información, heredada del backbone bge-m3.
- Recuperación densa, dispersa y multi-vector (las tres funcionalidades del modelo base, presumiblemente preservadas tras el ajuste LoRA, aunque no se documenta verificación).
- Procesamiento de texto en portugués, presumiblemente con especialización en terminología jurídica y legislativa.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento; estas capacidades no son propias de un encoder de recuperación.
- Capacidad multilingüe: no confirmada para este ajuste; los metadatos declaran solo `pt`, aunque el backbone original es multilingüe.

## Casos de uso

- Recuperación aumentada (RAG) sobre corpus legislativo portugués: indexar artículos, decretos y jurisprudencia y recuperar fragmentos relevantes para una consulta del usuario, aprovechando la especialización declarada en el dominio jurídico.
- Búsqueda semántica en portales de legislación: sustituir la búsqueda por palabras clave por búsqueda vectorial sobre bases de datos de normas, con la ventaja de capturar sinónimos y formulaciones jurídicas equivalentes.
- Asistencia a la redacción jurídica: dado un borrador de texto legal, recuperar normativa relacionada para citación y verificación, integrándose en herramientas de apoyo a abogados y gestores públicos.
- Clasificación y agrupación de decisiones judiciales: usar los embeddings para agrupar resoluciones por temática o detectar duplicados en repositorios de jurisprudencia.
- Sistemas de preguntas y respuestas sobre normativa: combinar el modelo de recuperación con un LLM generador para construir un asistente que responda citando la fuente legal.
- Deduplicación y detección de near-duplicates en bases documentales jurídicas: comparar embeddings de fragmentos para identificar versiones o copias de un mismo texto normativo.
- Filtrado previo en pipelines de revisión contractual: recuperar cláusulas similares a una referencia para revisión humana asistida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (nDCG@10, Recall@k, MRR), ni comparaciones con el modelo base, ni evaluaciones sobre conjuntos jurídicos portugueses.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB de pesos (568 M parámetros × 4 bytes) más overhead de activaciones y tokenizador; en la práctica, entre 3 y 4 GB.
- En fp16/bf16: aproximadamente 1,2 GB de pesos; en la práctica, entre 2 y 3 GB de VRAM.
- Cabe holgadamente en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4090, así como en GPUs de datacenter (A100, H100, L4, T4).
- También puede ejecutarse en CPU para volúmenes moderados de indexación, dado el tamaño reducido del modelo.
- Opciones de despliegue: `transformers` + `peft` (según la model card), y previsiblemente `sentence-transformers` si se fusionan los adaptadores; no se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama (estas herramientas están orientadas a modelos generativos y no a encoders de recuperación).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dititce/bge-m3-decisoes-final | 567,7 M | no disponible | pt | Apache 2.0 | Hugging Face (0 descargas) |
| BAAI/bge-m3 (base) | 567,7 M | 8.192 tokens (según documentación del modelo base) | Multilingüe (más de 100 idiomas) | MIT | Hugging Face, ampliamente utilizado |
| BAAI/bge-large-en-v1.5 | 335 M | 512 tokens | Inglés | MIT | Hugging Face |
| intfloat/multilingual-e5-large | 560 M | 512 tokens | Multilingüe | MIT | Hugging Face |

La comparación directa con el modelo base es la más informativa: este ajuste añade especialización jurídica en portugués a costa de perder, en principio, la cobertura multilingüe declarada del original. No hay datos que permitan afirmar que supere al base en tareas generales; solo el autor declara la especialización.

## Limitaciones y advertencias

- Ausencia total de evaluación publicada: no hay métricas que respalden la mejora frente al modelo base en tareas jurídicas.
- Model card mínima: no se documentan datos de entrenamiento, hiperparámetros de LoRA, ni proceso de validación, lo que impide reproducir o auditar el ajuste.
- El código de ejemplo de la model card usa `AutoModelForCausalLM`, clase inadecuada para un encoder de recuperación; probablemente sea un error del autor y requiera `AutoModel` o `SentenceTransformer` para un uso correcto.
- Idiomas: los metadatos declaran solo portugués; el uso en otros idiomas no está garantizado.
- Riesgo de sobreajuste al dominio jurídico portugués con posible degradación en consultas generales.
- Riesgo de sesgo derivado del corpus legislativo utilizado, no documentado.
- Riesgo de alucinación no aplica directamente (es un encoder, no un generador), pero sí de recuperación de pasajes irrelevantes si el ajuste degradó la calidad de los embeddings.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de bge-m3 conviene verificar las condiciones del modelo base (MIT) y de los datos de entrenamiento, no declarados.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dititce/bge-m3-decisoes-final
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Repositorio PEFT (dependencia declarada): https://github.com/huggingface/peft
- Paper de BGE M3-Embedding: https://arxiv.org/abs/2402.03216
