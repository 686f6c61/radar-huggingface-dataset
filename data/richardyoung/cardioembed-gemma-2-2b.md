# richardyoung/CardioEmbed-Gemma-2-2B

## Resumen

CardioEmbed-Gemma-2-2B es un adaptador LoRA sobre el modelo base google/gemma-2-2b-it, desarrollado por Richard Young (DeepNeuro) y publicado en Hugging Face. Su propósito es generar embeddings de texto especializados en cardiología clínica, es decir, representaciones vectoriales densas que permiten tareas de similitud semántica, recuperación de información y clustering dentro del dominio cardiológico. Forma parte de un estudio comparativo de diez arquitecturas de embeddings para cardiología clínica, descrito en el preprint arXiv:2511.19739.

El modelo no es un generador de texto per se, sino un encoder de frases derivado del modelo instructivo de Gemma 2 (2 000 millones de parámetros). El adaptador se entrena con pares de textos cardiológicos extraídos de libros de texto médicos, lo que lo orienta hacia la similitud semántica en ese dominio concreto. La relevancia actual reside en la creciente demanda de sistemas de recuperación aumentada (RAG) y búsqueda semántica en entornos clínicos, donde los embeddings genéricos rinden peor que los adaptados al dominio.

El repositorio ocupa aproximadamente 0,1 GB, lo que corresponde únicamente a los pesos del adaptador LoRA (no al modelo base completo). La licencia es Apache 2.0, aunque el modelo base Gemma 2 tiene su propia licencia de uso que debe respetarse adicionalmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA para embeddings de frases |
| Parametros totales | ~2 000 millones (modelo base Gemma 2 2B); adaptador LoRA de rango 16 (tamaño no especificado en la información disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no se especifica en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 (adaptador); el modelo base Gemma 2 tiene su propia licencia |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-2-2b-it, un transformer decoder-only de 2 000 millones de parámetros. La adaptación se realiza mediante LoRA con rango r=16 y alpha=32, lo que congela los pesos del modelo base y entrena únicamente matrices de baja dimensión. El objetivo es convertir un modelo generativo instructivo en un encoder de frases útil para similitud semántica (pipeline sentence-similarity).

El entrenamiento utiliza 106 535 pares de textos cardiológicos procedentes de libros de texto médicos, con la función de pérdida Multiple Negatives Ranking Loss (InfoNCE), habitual en el entrenamiento de modelos de embeddings tipo sentence-transformers. No se especifica en la información disponible el número total de tokens, la composición detallada del dataset ni si hubo etapas adicionales de RLHF o DPO. La innovación principal es la especialización de dominio: adaptar un modelo generalista a la terminología y estructura semántica de la cardiología clínica mediante un adaptador ligero.

## Capacidades

- Generación de embeddings de texto para similitud semántica en dominio cardiológico.
- Recuperación de información (retrieval) sobre corpus clínicos de cardiología.
- Clustering y agrupación semántica de documentos médicos.
- Búsqueda semántica de fragmentos de libros de texto cardiológicos.
- Soporte de tool calling / function calling: no disponible (el modelo se usa como encoder, no como generador).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: adaptación de dominio mediante LoRA para embeddings clínicos.

## Casos de uso

- Búsqueda semántica en bases de conocimiento cardiológico: indexar fragmentos de libros de texto y guías clínicas y recuperar los más relevantes para una consulta, aprovechando la especialización del adaptador en terminología cardiológica.
- RAG (retrieval-augmented generation) en asistentes clínicos: usar el modelo como recuperador de pasajes cardiológicos que luego alimentan a un LLM generador, mejorando la precisión frente a embeddings genéricos.
- Deduplicación y clustering de literatura médica: agrupar artículos o notas clínicas por similitud semántica para organizar corpus de cardiología.
- Sistemas de preguntas y respuestas sobre material docente: emparejar preguntas de estudiantes de medicina con fragmentos relevantes de libros de texto cardiológicos.
- Clasificación y enrutamiento de consultas clínicas: calcular similitud entre una consulta entrante y categorías predefinidas de cardiología para dirigirla al especialista o recurso adecuado.
- Análisis de similitud entre informes clínicos: comparar informes de cardiología para detectar duplicados, variantes o casos relacionados en un repositorio hospitalario.
- Evaluación comparativa de arquitecturas de embeddings: servir como referencia especializada en el estudio comparativo de diez arquitecturas descrito en el preprint asociado.

## Benchmarks y rendimiento

La model card reporta una única métrica: Separation Score de 0,455. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MTEB u otros) ni comparaciones numéricas con modelos alternativos.

| Metrica | Valor |
|---|---|
| Separation Score | 0,455 |

## Requisitos de hardware

- El adaptador LoRA es muy ligero (~0,1 GB), pero requiere cargar el modelo base Gemma 2 2B (~4-5 GB en fp16).
- VRAM estimada para inferencia: aproximadamente 5-6 GB en fp16 para el modelo base más el adaptador; menor si se cuantiza el base (aunque no se documentan cuantizaciones específicas para este adaptador).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060/4060, RTX 3090, RTX 4090, A100, H100). Cabe holgadamente en GPUs de consumo.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card); compatible potencialmente con sentence-transformers una vez fusionado el adaptador; vLLM, llama.cpp u Ollama no están documentados para este adaptador en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CardioEmbed-Gemma-2-2B | ~2B (base) + LoRA | no disponible | Cardiología (inglés) | Apache 2.0 (adaptador) | Hugging Face |
| Modelos de embeddings genéricos (p. ej. sentence-transformers) | Variable | Variable | Generalista | Variable | Hugging Face |
| Gemma 2 2B-it (base sin adaptar) | ~2B | no disponible | Generalista | Licencia Gemma 2 | Hugging Face |

No se dispone en la información proporcionada de datos numéricos comparativos con alternativas específicas de embeddings clínicos; el preprint asociado (arXiv:2511.19739) realiza la comparación entre diez arquitecturas, pero sus resultados no se detallan en la model card.

## Limitaciones y advertencias

- Especializado únicamente en inglés; no soporta otros idiomas según la model card.
- Dominio restringido a cardiología clínica; su rendimiento fuera de ese dominio no está documentado y probablemente sea inferior al de embeddings genéricos.
- Riesgo de alucinación y sesgos: al derivar de un modelo entrenado con datos de libros de texto, puede heredar sesgos presentes en esas fuentes y en los datos de preentrenamiento de Gemma 2.
- No es un generador de texto fiable para uso clínico directo; su función es producir embeddings, no diagnósticos ni recomendaciones médicas.
- La licencia Apache 2.0 aplica al adaptador, pero el uso del modelo base Gemma 2 está sujeto a la licencia de Google, que impone restricciones adicionales para uso comercial.
- Longitud de contexto y cuantizaciones no documentadas; conviene verificar el comportamiento con secuencias largas antes de usarlo en producción.
- El modelo tiene muy pocas descargas (18) y ningún "like" en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.
- No se han publicado resultados de benchmarks estándar de embeddings (MTEB u otros), solo una métrica interna (Separation Score).

## Enlaces

- Hugging Face: https://huggingface.co/richardyoung/CardioEmbed-Gemma-2-2B
- Preprint: https://arxiv.org/abs/2511.19739
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Perfil del autor: https://deepneuro.ai/richard
