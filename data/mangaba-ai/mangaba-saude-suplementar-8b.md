# mangaba-ai/Mangaba-Saude-Suplementar-8B

## Resumen

Mangaba Saúde Suplementar 8B es un adaptador LoRA desarrollado por Mangaba AI sobre el modelo base Qwen/Qwen3-8B, especializado en legislación brasileña de salud suplementaria. El modelo resuelve un problema concreto: responder consultas sobre planes de salud, ANS (Agencia Nacional de Saúde Suplementar), contratualización con prestadores, rol de procedimientos y SUS, citando el artículo y la norma exactos a partir de fragmentos recuperados mediante búsqueda (RAG). Está entrenado exclusivamente en portugués de Brasil.

El adaptador se distribuye como pesos PEFT (safetensors) de 0,4 GB, lo que refleja que no es un modelo completo sino un delta LoRA sobre los 8B parámetros del Qwen3-8B subyacente. La arquitectura efectiva es la del transformer denso de Qwen3-8B, con la innovación de un entrenamiento en dos etapas que enseña al modelo a responder citando el rótulo exacto del artículo recuperado, mezclando el fragmento correcto con fragmentos similares para forzar la discriminación.

Su relevancia actual radica en que demuestra un patrón de especialización vertical mediante LoRA + RAG sobre un modelo abierto con licencia Apache-2.0, con métricas de evaluación publicadas (67% de respuestas con nota máxima de contenido frente a 0% del base sin búsqueda). El acceso está sujeto a un formulario de registro (gated model) gestionado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-8B |
| Parametros totales | 8B (modelo base Qwen3-8B); adaptador LoRA: r=32, alpha=64 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del Qwen3-8B; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del base) |
| Idiomas soportados | pt (portugués de Brasil) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el base Qwen3-8B en safetensors |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 32 y alpha 64 sobre todas las proyecciones lineales del Qwen3-8B. El entrenamiento se realizó en dos etapas: la primera, 3 épocas con preguntas y respuestas generadas por artículo más la recuperación del texto de cada artículo por su número; la segunda, 1 época con la pregunta acompañada de fragmentos recuperados, donde se mezcla el dispositivo correcto con fragmentos parecidos, enseñando al modelo a responder a partir de los fragmentos y a citar el rótulo exacto del artículo. El cómputo se ejecutó en 2× NVIDIA L40S en servidores de Mangaba en Brasil.

La base de conocimiento cubre el texto vigente del Planalto recolectado el 19/10/2026: Lei 9.656/1998 (planes de salud), Lei 9.961/2000 (ANS), Lei 13.003/2014 (contratualización) y Lei 8.080/1990 (Ley Orgánica de la Salud). El sistema de recuperación asociado usa el corpus `busca/corpus/` con artículos y embeddings bge-m3, más bge-reranker-v2-m3 de BAAI para el reordenamiento. No se documenta el uso de RLHF o DPO.

## Capacidades

- Generación de texto conversacional en portugués de Brasil orientada a consultas legales del sector salud suplementario.
- Respuesta fundamentada en fragmentos recuperados (RAG), citando artículo y norma exactos.
- Discriminación entre fragmentos normativos similares, entrenada explícitamente para seleccionar el dispositivo correcto.
- Cobertura de cuatro normas federales: Lei 9.656/1998, Lei 9.961/2000, Lei 13.003/2014 y Lei 8.080/1990.
- Integración con vLLM mediante `--enable-lora` y `--max-lora-rank 32`, con el adaptador registrado como módulo `saude`.
- Modo sin thinking recomendado (`chat_template_kwargs={"enable_thinking": false}`) para el despliegue previsto.
- Soporte de tool calling y function calling: no disponible (no documentado en la model card).
- Capacidades multimodales (visión, audio): no disponibles (el base Qwen3-8B es texto).

## Casos de uso

- **Atención a operadoras de planes de salud**: responder consultas de afiliados y equipos internos sobre coberturas y plazos citando el artículo de la Lei 9.656/1998, con el corpus de recuperación como fuente de verdad.
- **Auditoría de cuentas médicas**: verificar si un procedimiento está cubierto según el rol de procedimientos y la normativa, usando el fragmento recuperado como evidencia citada en el informe de auditoría.
- **Facturación y contratualización con prestadores**: resolver dudas sobre obligaciones de la Lei 13.003/2014 en la relación entre operadora y prestador, con cita normativa trazable.
- **Asistencia a equipos jurídicos internos**: primer filtro documental sobre SUS y salud suplementaria (Lei 8.080/1990), derivando a revisión profesional los casos que requieran interpretación jurisprudencial.
- **Formación interna**: generar material de estudio y preguntas de evaluación sobre la normativa cubierta, apoyándose en las citas exactas para verificar cada respuesta.
- **Sistemas RAG de consulta normativa**: desplegar el adaptador sobre vLLM junto a un pipeline de búsqueda bge-m3 + bge-reranker-v2-m3 para construir un asistente de consulta con trazabilidad de fuente.
- **Evaluación comparativa de calidad RAG**: usar las métricas publicadas (nota media de contenido 4,03 frente a 3,63 del base con búsqueda) como referencia para calibrar pipelines propios en dominios regulados.

## Benchmarks y rendimiento

Evaluación sobre 60 preguntas fuera del conjunto de entrenamiento, con Mangaba Titan 122B como juez:

| Métrica | Qwen3-8B sin búsqueda | Qwen3-8B + búsqueda | Mangaba Saúde Suplementar 8B + búsqueda |
|---|---|---|---|
| Respuesta correcta (nota 5 de contenido) | 0% | 53% | 67% |
| Correcta y con el artículo exacto | 0% | 43% | 60% |
| Cita el artículo correcto | 8% | 87% | 87% |
| Cita la norma correcta | 63% | 100% | 98% |
| Nota media de contenido (1–5) | 1,13 | 3,63 | 4,03 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa 0,4 GB; el modelo base Qwen3-8B requiere aproximadamente 16 GB en FP16, ~8-10 GB en cuantización de 8 bits y ~5-6 GB en 4 bits (estimación estándar para 8B; no especificada por el autor).
- GPU de entrenamiento documentadas: 2× NVIDIA L40S.
- GPU recomendadas para despliegue: el autor indica vLLM con soporte LoRA; una A100, H100 o L40S son adecuadas para producción. En consumer GPU, un modelo de 8B en 4 bits cabe en tarjetas de 8 GB o más (estimación, no confirmada por el autor).
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules saude=mangaba-ai/Mangaba-Saude-Suplementar-8B`. Otros backends (llama.cpp, Ollama, TGI) no están documentados para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangaba Saúde Suplementar 8B | 8B (LoRA r=32) | no disponible | Legislación salud suplementaria BR | Apache-2.0 | Gated (registro) |
| Qwen/Qwen3-8B (base) | 8B | no disponible | Generalista multilingüe | Apache-2.0 | Abierta |
| Mangaba Titan 122B (juez de la eval) | 122B | no disponible | Evaluación/generalista | no disponible | no disponible |

La comparativa con otros adaptadores LoRA verticales del sector salud no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Sin el fragmento correcto en la búsqueda, la calidad cae de forma acusada; el rendimiento depende del pipeline de recuperación (bge-m3 + bge-reranker-v2-m3).
- Las normas infralegales y la jurisprudencia no forman parte de la base de conocimiento; las respuestas sobre esas materias no están fundamentadas.
- El modelo no sustituye un dictamen profesional; el propio autor lo advierte en la model card.
- Solo responde en portugués de Brasil; no se documenta soporte multilingüe.
- Riesgo de alucinación en citas normativas cuando el fragmento recuperado no contiene el artículo exacto, pese al entrenamiento de la segunda etapa.
- El acceso es restringido mediante formulario (nombre, empresa, cargo, email, WhatsApp, país, uso pretendido) y aprobación manual por el equipo de Mangaba AI; los datos se tratan conforme a la LGPD.
- El corpus normativo se recolectó el 19/10/2026; posibles reformas posteriores no estarán reflejadas.
- Sesgos conocidos: no documentados en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-Saude-Suplementar-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Embeddings de recuperación (bge-m3, BAAI): https://huggingface.co/BAAI/bge-m3
- Reranker (bge-reranker-v2-m3, BAAI): https://huggingface.co/BAAI/bge-reranker-v2-m3
- Texto vigente de las normas (Planalto): https://www.planalto.gov.br
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
