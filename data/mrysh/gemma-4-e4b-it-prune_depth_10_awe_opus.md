# mrysh/gemma-4-e4b-it-prune_depth_10_awe_opus

## Resumen

Este repositorio contiene una versión podada por profundidad del modelo google/gemma-4-E4B-it, generada por el usuario mrysh con la librería nvidia-modelopt 0.46.0rc1 (Minitron de NVIDIA). El podado elimina 4 de las 42 capas del bloque de lenguaje (42 → 38, un 10 % de las capas solicitadas), reduciendo un 9,2 % de los parámetros del modelo de lenguaje y un 8,6 % del checkpoint completo, sin alterar el ancho de las capas ni los bloques de visión o audio del modelo base. El resultado es un checkpoint de 7.308.233.030 parámetros que ocupa 14,6 GB en disco.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un fine-tune con mejoras, sino de un artefacto experimental creado para un benchmark de podado (4 modelos × 8 variantes) que compara las variantes entre sí y con cuantización sobre BFCL, hiring-bias y MedQA usando vLLM. No se realizó destilación ni fine-tuning posterior al podado, por lo que el autor advierte explícitamente de una caída de calidad frente al modelo base.

Al estar publicado como material de referencia de un benchmark, con 0 descargas y 0 likes, y sin model card descriptiva de capacidades, idiomas o pipeline, debe tratarse como un objeto de evaluación técnica y no como un modelo listo para producción. La licencia es apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4), podado por profundidad; bloques de visión/audio intactos |
| Parametros totales | 7.308.233.030 (checkpoint completo); reducción del 8,6 % frente al base |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha (el benchmark compara con cuantización, pero no se listan formatos) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano en disco | 14,649 GB |
| Modelo base | google/gemma-4-E4B-it |
| Capas | 42 → 38 (podado de profundidad, nivel 0.1) |
| Librería de podado | nvidia-modelopt 0.46.0rc1 (Minitron) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer multimodal (texto, visión y audio según la model card del base), y aplica podado estructurado por profundidad con NVIDIA ModelOpt Minitron. Se eliminan 4 capas del bloque de lenguaje (42 → 38), seleccionadas por importancia medida sobre un conjunto de calibración de 512 muestras mixtas. El ancho de las capas no se modifica y los bloques de visión y audio se conservan sin cambios; el podado afecta únicamente a la parte de lenguaje, con una reducción del 9,2 % de sus parámetros.

No se aplicó destilación ni fine-tuning después del podado, lo que implica que los pesos restantes conservan el entrenamiento original del base sin recuperación de capacidad. La model card menciona que la herramienta de podado descarta la cabeza de predicción multi-token de Qwen3.5 (nota del autor referida a la herramienta, no a este modelo). No se documentan datos de entrenamiento adicionales, composición del dataset, RLHF/DPO ni innovaciones de decodificación para esta variante.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base, con caída de calidad esperada por el podado sin recuperación.
- Procesamiento multimodal (visión y audio) potencialmente conservado, ya que los bloques correspondientes no fueron podados; no se documenta su rendimiento tras el podado.
- Soporte de tool calling y function calling: evaluado en BFCL dentro del benchmark del autor.
- Razonamiento multi-step y agentes: no disponible como capacidad verificada en esta ficha.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo thinking: el benchmark evalúa el modelo con thinking desactivado en vLLM.
- No se documentan capacidades específicas adicionales (código, matemáticas) más allá de las heredadas del base.

## Casos de uso

- Benchmark de podado de modelos: usar esta variante como punto de comparación frente a otras 7 variantes de podado y frente a cuantización sobre BFCL, hiring-bias y MedQA, replicando la metodología del autor con vLLM.
- Investigación sobre podado por profundidad: analizar el impacto de eliminar 4 de 42 capas con calibración de 512 muestras mixtas, midiendo la caída de calidad sin destilación.
- Evaluación de robustez multimodal tras podado: comprobar si los bloques de visión y audio intactos mantienen su comportamiento cuando el bloque de lenguaje pierde un 9,2 % de parámetros.
- Estudio de sesgo en selección de personal: emplear la tarea hiring-bias del benchmark para medir cómo el podado afecta sesgos del modelo base.
- Evaluación de conocimiento médico: usar MedQA para cuantificar la pérdida de precisión en dominios especializados tras el podado.
- Referencia para pipelines de compresión: servir como caso de estudio de integración de nvidia-modelopt 0.46.0rc1 en flujos de reducción de modelos con vLLM.
- Pruebas de tool calling degradado: medir en BFCL cuánto empeora la invocación de funciones cuando se recorta profundidad sin fine-tuning posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el benchmark (BFCL, hiring-bias, MedQA con vLLM) existe y compara esta variante con otras, pero no incluye cifras numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- GPU recomendadas: A100 40/80 GB, H100, L40S; en consumer, RTX 4090 (24 GB) o RTX 3090 (24 GB) para BF16 ajustado.
- Cabe en GPU consumer de 24 GB en BF16 con margen limitado; en GPUs de 16 GB requeriría cuantización, cuyos formatos no se detallan.
- Opciones de despliegue: vLLM (usado en el benchmark del autor); llama.cpp, Ollama o TGI no están documentados para esta variante.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrysh/gemma-4-e4b-it-prune_depth_10_awe_opus | 7.308.233.030 | no disponible | no publicado | apache-2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E4B-it (base) | no disponible en esta ficha | no disponible | referencia del benchmark | licencia del base (ver model card) | Hugging Face |
| Otras variantes de podado del benchmark del autor | no disponible | no disponible | comparadas en BFCL, hiring-bias y MedQA | no disponible | no disponible |

## Limitaciones y advertencias

- Caída de calidad frente al modelo base: no hubo destilación ni fine-tuning tras el podado, por lo que la pérdida de capacidad es esperada y medida por el benchmark, no mitigada.
- Artefacto experimental: creado para un benchmark de podado, con 0 descargas y 0 likes; no está pensado como modelo de producción.
- Idiomas, contexto, cuantizaciones y pipeline no documentados; no se puede garantizar comportamiento multilingüe ni de ventana larga.
- Riesgo de alucinación: no evaluado en esta ficha; al ser un modelo podado sin recuperación, es plausible un aumento respecto al base, aunque no hay datos.
- Sesgos: el benchmark incluye hiring-bias, lo que sugiere interés en medir sesgos, pero no se publican resultados.
- Restricciones de licencia: apache-2.0 según los tags, pero el autor remite a la model card del base para la licencia efectiva; conviene verificar antes de uso comercial.
- El bloque de lenguaje pierde 4 capas (42 → 38); no se documenta el impacto en tool calling ni en multimodalidad tras el podado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrysh/gemma-4-e4b-it-prune_depth_10_awe_opus
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Librería de podado: nvidia-modelopt 0.46.0rc1 (Minitron de NVIDIA); no se proporciona enlace directo en la información disponible.
- Papers, blogs, repos y demos adicionales: no disponible.
