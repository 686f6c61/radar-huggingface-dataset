# mangaba-ai/Mangaba-Juridico-8B

## Resumen

Mangaba Jurídico 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen3-8B, orientado a la práctica jurídica brasileña. El modelo cubre derecho civil, procesal civil, derecho del consumidor y juizados especiales, apoyándose en una base de recuperación (RAG) construida con el texto vigente de cuatro normas federales brasileñas: el Código de Proceso Civil (Ley 13.105/2015), el Código de Defensa del Consumidor (Ley 8.078/1990), el Código Civil (Ley 10.406/2002) y la Ley de los Juizados Especiais (Ley 9.099/1995).

La propuesta no es un modelo de conocimiento jurídico autónomo, sino un componente de un pipeline de generación aumentada por recuperación: el adaptador aprende a responder a partir de los fragmentos normativos recuperados y a citar el artículo y la norma exactos. El autor reporta una mejora sustancial frente al Qwen3-8B base con la misma búsqueda, pasando de un 45 % a un 77 % de respuestas con nota máxima de contenido en una evaluación de 60 preguntas fuera del conjunto de entrenamiento.

El modelo se distribuye como adaptador PEFT (LoRA, r=32, α=64) en safetensors, con un tamaño de repositorio de 0,4 GB, licencia Apache-2.0 y acceso controlado mediante formulario de registro. Está pensado para despacho de abogados, departamentos jurídicos y litigación en masa, y responde exclusivamente en portugués de Brasil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-8B) con adaptador LoRA (PEFT) |
| Parametros totales | 8B en el modelo base; adaptador LoRA de 0,4 GB en el repositorio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-8B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen3-8B, un transformer decoder-only de 8.000 millones de parámetros. El adaptador se aplica con rango r=32 y α=64 sobre todas las proyecciones lineales del modelo base. El entrenamiento se realizó en dos etapas: la primera, durante 3 épocas, con pares de pregunta y respuesta generados por artículo junto con la recuperación del texto de cada artículo por su número; la segunda, durante 1 época, con la pregunta acompañada de fragmentos recuperados, incluyendo el dispositivo correcto mezclado con fragmentos similares, para enseñar al modelo a responder a partir de los fragmentos y a citar la etiqueta exacta del artículo.

El entrenamiento se ejecutó en dos NVIDIA L40S en servidores de Mangaba AI en Brasil. La base de búsqueda asociada (`busca/corpus/`) contiene los artículos y los embeddings generados con bge-m3, con reranking mediante bge-reranker-v2-m3 de BAAI. El corpus normativo se recopiló del texto vigente del Planalto el 19/10/2026. No se especifica el número total de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto jurídico en portugués de Brasil, con foco en derecho civil, procesal civil, derecho del consumidor y juizados especiales.
- Respuesta fundamentada en fragmentos recuperados (RAG), citando el artículo y la norma exactos.
- Citación estructurada de dispositivos legales (artículo y ley) a partir de las etiquetas de los fragmentos.
- Manejo de fragmentos distractores: el entrenamiento de la segunda etapa incluye dispositivos similares al correcto para reforzar la selección.
- Integración con vLLM mediante `--enable-lora --max-lora-rank 32 --lora-modules juridico=...`.
- Modo de razonamiento desactivable mediante `chat_template_kwargs={"enable_thinking": false}`, heredado del chat template de Qwen3.
- No cubre visión, audio ni tool calling de forma específica según la información disponible.

## Casos de uso

- Atención a consultas jurídicas de primer nivel en despachos: el modelo responde a preguntas sobre plazos, competencias y requisitos procesales a partir de los artículos recuperados del CPC, citando el dispositivo exacto y reduciendo el tiempo de búsqueda manual.
- Litigación en masa: generación de borradores de escritos y respuestas homogéneas para carteras de reclamaciones de consumo, apoyándose en el CDC y en los juizados especiales, con citación automática de la norma aplicable.
- Departamentos jurídicos internos: resolución de dudas recurrentes del equipo de negocio sobre obligaciones civiles y contractuales, con trazabilidad a la norma citada y sin necesidad de consultar manualmente el Código Civil.
- Asistentes de RAG documental: integración como generador final de un pipeline que recupera fragmentos con bge-m3 y reordena con bge-reranker-v2-m3, usando el adaptador para redactar la respuesta citando el artículo.
- Formación y docencia jurídica: generación de casos prácticos y explicaciones con referencia normativa exacta para materiales de estudio de derecho civil y procesal.
- Verificación de citas: contraste de borradores redactados por humanos contra los fragmentos normativos recuperados para detectar artículos inexistentes o referencias desactualizadas.
- Automatización de respuestas en juizados especiales: clasificación y respuesta a consultas de bajo valor con base en la Ley 9.099/1995, con cita del artículo correspondiente.

## Benchmarks y rendimiento

Evaluación del autor sobre 60 preguntas fuera del conjunto de entrenamiento, con Mangaba Titan 122B como juez:

| Métrica | Qwen3-8B sin búsqueda | Qwen3-8B + búsqueda | Mangaba Jurídico 8B + búsqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0 % | 45 % | 77 % |
| Correcta y con el artículo exacto | 0 % | 23 % | 78 % |
| Cita el artículo correcto | 0 % | 83 % | 83 % |
| Cita la norma correcta | 47 % | 97 % | 97 % |
| Nota media de contenido (1–5) | 1,07 | 3,50 | 4,23 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade 0,4 GB; el modelo base Qwen3-8B requiere aproximadamente 16 GB en FP16/BF16 y alrededor de 5-6 GB en cuantización de 4 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el autor entrenó en 2× NVIDIA L40S; para inferencia es suficiente una GPU con al menos 16 GB de VRAM en BF16 (L40S, A100, H100) o una consumer con 8-12 GB en cuantización de 4 bits.
- Cabe en GPU consumer: sí, en modelos con 8 GB o más de VRAM si se cuantiza el modelo base a 4 bits; en BF16 requiere 16 GB o más.
- Despliegue: el autor documenta vLLM con soporte LoRA (`vllm serve Qwen/Qwen3-8B --enable-lora --max-lora-rank 32 --lora-modules juridico=mangaba-ai/Mangaba-Juridico-8B`). Otras opciones como llama.cpp, Ollama o TGI no están documentadas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangaba Jurídico 8B | 8B (LoRA sobre Qwen3-8B) | no disponible | Jurídico pt-BR con RAG | Apache-2.0 | Hugging Face con acceso mediante registro |
| Qwen3-8B | 8B | no disponible | Propósito general multilingüe | Apache-2.0 | Hugging Face, acceso abierto |
| Modelos jurídicos pt-BR de propósito general | no disponible | no disponible | Jurídico pt-BR | no disponible | no disponible |

La comparación directa con alternativas jurídicas en portugués no está disponible en la información proporcionada. El propio autor reporta la comparación con Qwen3-8B con y sin búsqueda en la tabla de benchmarks.

## Limitaciones y advertencias

- Sin el fragmento correcto en la búsqueda, la calidad cae de forma acusada; el modelo no sustituye a un sistema de recuperación fiable.
- Las normas infralegales y la jurisprudencia no forman parte de la base de conocimiento.
- El modelo no sustituye un dictamen profesional; el autor lo advierte explícitamente en la model card.
- Solo responde en portugués de Brasil; no se documenta soporte para otros idiomas.
- Riesgo de alucinación de artículos o referencias normativas cuando la recuperación falla o devuelve fragmentos ambiguos.
- El acceso está restringido mediante formulario (gated model) con datos personales tratados conforme a la LGPD; el uso comercial requiere solicitud y aprobación previa.
- No se documentan sesgos específicos ni evaluaciones de robustez más allá de las 60 preguntas del conjunto de evaluación del autor.
- La fecha de recopilación del corpus (19/10/2026) implica que reformas legislativas posteriores no estarán cubiertas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Juridico-8B
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings bge-m3 (BAAI): https://huggingface.co/BAAI/bge-m3
- Reranker bge-reranker-v2-m3 (BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Texto vigente del Planalto (fuente del corpus): https://www.planalto.gov.br
- Repositorio vLLM: https://github.com/vllm-project/vllm
