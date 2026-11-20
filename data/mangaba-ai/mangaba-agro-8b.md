# mangaba-ai/Mangaba-Agro-8B

## Resumen

Mangaba Agro 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen3-8B, especializado en derecho agrario y ambiental brasileño. Resuelve un problema concreto: que productores rurales, cooperativas, agrónomos y bancos de crédito rural puedan obtener respuestas jurídicas fundamentadas en la legislación vigente de Brasil, citando artículo y norma exactos. El adaptador está entrenado sobre el texto vigente de seis normas clave (Código Forestal, Política Agrícola, Crédito Rural, CPR, Lei do Agro y Ley de Agrotóxicos) y está diseñado para funcionar en tándem con una base de recuperación (RAG) que aporta los fragmentos normativos relevantes a cada consulta.

Técnicamente es un adaptador PEFT (LoRA) de rango 32 y alpha 64 aplicado a todas las proyecciones lineales del Qwen3-8B, no un modelo completo. El repositorio ocupa 0,4 GB y requiere descargar el modelo base Qwen3-8B por separado. El entrenamiento se realizó en dos etapas: primero preguntas y respuestas generadas por artículo, y después preguntas acompañadas de fragmentos recuperados con distractores similares, para enseñar al modelo a responder exclusivamente a partir de los fragmentos y citar la etiqueta exacta.

Su relevancia actual radica en que demuestra un patrón de especialización vertical eficiente: en lugar de reentrenar un modelo de 8B completo, un LoRA de bajo coste más un corpus de recuperación bien curado eleva la precisión de citación normativa del 5% (Qwen3-8B sin adaptador ni búsqueda) al 80% en la identificación del artículo correcto. El acceso está restringido mediante un formulario de registro (gated model).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder Qwen3-8B |
| Parametros totales | 8B (modelo base Qwen3-8B); el adaptador LoRA no se especifica en parámetros, repo de 0,4 GB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del Qwen3-8B base) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion aplica al modelo base) |
| Idiomas soportados | portugues de Brasil (pt-br) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango r=32 y alpha=64 aplicado a todas las proyecciones lineales del Qwen3-8B, un transformer decoder de 8.000 millones de parámetros. No se modifica la arquitectura del modelo base: el adaptador inyecta matrices de bajo rango en las capas lineales y se carga junto al modelo base mediante PEFT o vLLM con soporte LoRA.

El entrenamiento consta de dos etapas. La primera entrena durante 3 épocas con preguntas y respuestas generadas por artículo, junto con la recuperación del texto de cada artículo por su número. La segunda entrena durante 1 época con la pregunta acompañada de fragmentos recuperados, mezclando el fragmento correcto con fragmentos parecidos como distractores, con el objetivo de que el modelo responda a partir de los fragmentos y cite la etiqueta exacta. El entrenamiento se ejecutó en 2 GPUs NVIDIA L40S en servidores de Mangaba AI en Brasil. La base de recuperación utiliza los embeddings bge-m3 y el reranker bge-reranker-v2-m3 de BAAI. El corpus cubre el texto vigente del Planalto recogido el 19/10/2026 de seis normas: Lei 12.651/2012 (Código Forestal), Lei 8.171/1991 (Política Agrícola), Lei 4.829/1965 (Crédito Rural), Lei 8.929/1994 (CPR), Lei 13.986/2020 (Lei do Agro) y Lei 14.785/2023 (Agrotóxicos). No se especifica el número de tokens de entrenamiento ni si se aplicó RLHF o DPO.

## Capacidades

- Generación de texto en portugués de Brasil con orientación jurídica en derecho agrario y ambiental.
- Respuesta fundamentada en fragmentos recuperados (RAG): responde citando artículo y norma a partir de los trechos que acompañan a la pregunta.
- Citación normativa exacta: identifica el número de artículo y la ley correspondiente.
- Cobertura de seis normas: Código Forestal, Política Agrícola, Crédito Rural, CPR, Lei do Agro y Ley de Agrotóxicos.
- Modo sin thinking: la configuración recomendada desactiva el razonamiento explícito de Qwen3 mediante `chat_template_kwargs={"enable_thinking": false}`.
- Integración con vLLM mediante `--enable-lora --max-lora-rank 32 --lora-modules agro=...`.
- Capacidades heredadas del Qwen3-8B base (tool calling, multilingüismo, código, matemáticas) no documentadas ni evaluadas en la información proporcionada para este adaptador.

## Casos de uso

- Consulta jurídica para productores rurales: el modelo responde en portugués a preguntas sobre obligaciones del Código Forestal (reserva legal, áreas de preservación permanente) citando el artículo exacto, siempre que la base de recuperación aporte los fragmentos pertinentes.
- Asesoría a cooperativas agrícolas: gestión de consultas recurrentes sobre crédito rural y CPR, con respuestas trazables a la norma vigente que el equipo jurídico puede verificar antes de actuar.
- Apoyo a agrónomos en cumplimiento ambiental: consulta sobre requisitos de la Ley de Agrotóxicos (Lei 14.785/2023) y restricciones del Código Forestal durante la planificación de cultivos.
- Análisis de elegibilidad en bancos de crédito rural: el modelo ayuda a interpretar las condiciones de la Lei 4.829/1965 y la Lei do Agro (13.986/2020) a partir de los fragmentos recuperados, como primera capa de triaje documental.
- Asistentes conversacionales especializados: despliegue en vLLM con el adaptador cargado como módulo LoRA para servir un chatbot multi-turno en portugués con contexto normativo.
- Formación y divulgación: generación de explicaciones didácticas de conceptos jurídicos agrarios (reserva legal, CPR, política agrícola) citando la norma de referencia.
- Verificación de citas: uso del modelo para comprobar si un artículo citado por un usuario corresponde a la norma correcta dentro del corpus cubierto.

## Benchmarks y rendimiento

Evaluación sobre 60 preguntas fuera del conjunto de entrenamiento, con un juez denominado Mangaba Titan 122B. Resultados publicados en la model card:

| Métrica | Qwen3-8B sin búsqueda | Qwen3-8B + búsqueda | Mangaba Agro 8B + búsqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0% | 50% | 77% |
| Correcta y con el artículo exacto | 0% | 35% | 73% |
| Cita el artículo correcto | 5% | 85% | 80% |
| Cita la norma correcta | 28% | 100% | 97% |
| Nota media de contenido (1–5) | 1,03 | 3,50 | 4,27 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,4 GB; el modelo base Qwen3-8B requiere aproximadamente 16 GB en FP16/BF16 y en torno a 5–6 GB en cuantización de 4 bits (estimación estándar para un modelo de 8B, no confirmada en la información proporcionada).
- GPU recomendadas: el entrenamiento se realizó en 2× NVIDIA L40S. Para inferencia, una GPU con al menos 16 GB de VRAM en BF16 o 8 GB en cuantización 4-bit.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en BF16 (RTX 4080, RTX 4090) o en tarjetas de 8 GB con cuantización 4-bit, siempre que el runtime soporte el adaptador LoRA.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules agro=mangaba-ai/Mangaba-Agro-8B`; también PEFT estándar. No se documenta soporte GGUF ni Ollama en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Acceso |
|---|---|---|---|---|---|
| Mangaba Agro 8B | 8B (LoRA sobre Qwen3-8B) | no disponible | Derecho agrario y ambiental brasileño + RAG | Apache-2.0 | Gated (registro) |
| Qwen3-8B | 8B | no disponible en la información | Generalista | Apache-2.0 | Abierto |
| Mangaba Titan 122B | 122B (según la model card) | no disponible | Generalista / juez de evaluación | no disponible | no disponible |

La comparación directa con otros adaptadores jurídicos brasileños no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia crítica de la recuperación: sin el fragmento correcto en la búsqueda, la calidad cae mucho, según advierte el propio autor.
- Cobertura normativa limitada: solo cubre seis normas; las normas infralegales y la jurisprudencia no forman parte de la base.
- No sustituye el parecer de un profesional: la propia model card exige al usuario aceptar esta condición.
- Idioma único: entrenado y evaluado únicamente en portugués de Brasil.
- Riesgo de alucinación: aunque el entrenamiento con distractores reduce las citas erróneas, persiste un 20% de fallos en la cita del artículo exacto según la evaluación publicada.
- Evaluación limitada: 60 preguntas y un juez propietario (Mangaba Titan 122B), sin benchmarks estándar independientes.
- Acceso restringido: modelo gated con formulario de registro y aprobación manual por parte de Mangaba AI; los datos se tratan conforme a la LGPD.
- Fecha de recogida del corpus: 19/10/2026; cambios normativos posteriores no estarán reflejados.
- Licencia Apache-2.0 en el adaptador, pero conviene verificar las condiciones del modelo base Qwen3-8B y del corpus del Planalto para uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Agro-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings de recuperación (bge-m3): https://huggingface.co/BAAI/bge-m3
- Reranker (bge-reranker-v2-m3): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Texto vigente de las normas (Planalto): https://www.planalto.gov.br
- vLLM (despliegue con LoRA): https://github.com/vllm-project/vllm
