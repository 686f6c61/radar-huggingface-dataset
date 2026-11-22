# rsoric3/qwen3-235b-a22b-abliterated-p5

## Resumen

Qwen3-235B-A22B-abliterated-p5 es una variante no oficial del modelo Qwen3-235B-A22B desarrollada por el usuario rsoric3 y publicada en Hugging Face. Se trata de un derivado "abliterated", es decir, un ajuste fino orientado a eliminar o reducir los mecanismos de rechazo y alineación de seguridad del modelo original, partiendo directamente de los pesos de Qwen3-235B-A22B. El repositorio no incluye una model card propia: el README reproduce el de la versión oficial FP8 de Qwen, por lo que la información específica sobre el proceso de abliteración no está documentada.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 235.000 millones de parámetros totales y 22.000 millones activos por token, 94 capas, 128 expertos (8 activados) y atención con GQA (64 cabezas Q, 4 KV). Su contexto nativo es de 32.768 tokens, ampliable a 131.072 mediante YaRN. Incorpora conmutación entre modo "thinking" y modo directo, capacidades de agente, tool calling y soporte de más de 100 idiomas.

La relevancia de esta ficha es doble: por un lado documenta un modelo de gran escala con licencia Apache 2.0 y pesos en safetensors/FP8; por otro, advierte de que se trata de una modificación no auditada del modelo original, con cero descargas y cero likes en el momento de la consulta, lo que implica ausencia total de validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal MoE (qwen3_moe) |
| Parámetros totales | 235.093.634.560 (235B) |
| Parámetros activos | 22B (8 de 128 expertos) |
| Longitud de contexto | 32.768 tokens nativos; 131.072 con YaRN |
| Tipos de cuantización | FP8 (fine-grained, block size 128) en el checkpoint publicado; el modelo base admite cuantizaciones GGUF/AWQ/GPTQ de la comunidad, aunque no se documentan en este repo |
| Idiomas soportados | No disponible de forma explícita; el modelo base declara soporte de más de 100 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 239,1 GB) |

Otros datos técnicos del modelo base: 94 capas, 64 cabezas de atención Q y 4 KV (GQA), 128 expertos con 8 activados, 234B parámetros no-embedding.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal con mezcla de expertos: cada token activa 8 de los 128 expertos disponibles, lo que reduce el coste computacional de inferencia a los 22B parámetros activos frente a los 235B totales. Usa atención con grouped-query attention (64 cabezas de query y 4 de key/value) y 94 capas. El checkpoint publicado emplea cuantización FP8 de grano fino con bloques de 128, según la configuración del modelo base oficial.

No se dispone de información sobre el proceso de entrenamiento del derivado abliterated: ni el número de tokens de ajuste, ni la composición del dataset, ni si se usó DPO, RLHF u otra técnica. El modelo original Qwen3 fue entrenado en dos fases (pretraining y post-training) e incorpora una innovación destacable: la conmutación en un mismo modelo entre modo de razonamiento ("thinking") y modo directo, controlable mediante el parámetro `enable_thinking`. Esa capacidad se hereda en el derivado, pero no hay evidencia de que la abliteración la preserve intacta.

## Capacidades

- Generación de texto y diálogo conversacional multi-turno.
- Razonamiento complejo en modo "thinking" (lógica, matemáticas, código) y respuestas directas en modo no-thinking.
- Generación y comprensión de código.
- Tool calling y function calling, con integración de herramientas externas en ambos modos.
- Capacidades de agente y razonamiento multi-paso.
- Multilingüismo amplio (más de 100 idiomas y dialectos según el modelo base).
- Alineación con preferencias humanas orientada a escritura creativa, role-play e instrucciones.
- Nota: al ser una variante abliterated, es previsible que los filtros de rechazo estén reducidos o eliminados, aunque no hay documentación que cuantifique el efecto.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve para estudiar qué comportamientos se eliminan con la abliteración y cómo afecta a la coherencia y al razonamiento, comparándolo con el Qwen3-235B-A22B original.
- Generación de código en pipelines internos: los 22B parámetros activos y el soporte de tool calling permiten integrarlo en flujos de revisión o generación de código, siempre en entornos controlados y con revisión humana.
- Atención al cliente automatizada: el contexto de 32K tokens (131K con YaRN) permite gestionar conversaciones largas y documentación de referencia en una sola ventana.
- Razonamiento matemático y analítico por lotes: el modo thinking resulta adecuado para tareas offline donde la latencia no es crítica y prima la precisión.
- Procesamiento multilingüe: traducción y generación en más de 100 idiomas para contenidos internos o prototipos.
- Agentes autónomos de investigación: combinación de tool calling y razonamiento multi-paso para orquestar búsquedas y llamadas a APIs en entornos de laboratorio.
- Experimentación con role-play y escritura creativa sin restricciones de contenido, en contextos de investigación controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones propias del derivado y no hay datos que permitan afirmar que conserva el rendimiento del Qwen3-235B-A22B original.

## Requisitos de hardware

- VRAM estimada: el checkpoint FP8 ocupa aproximadamente 239 GB en disco, por lo que la inferencia requiere del orden de 240 GB de memoria de GPU (o CPU+GPU combinadas) solo para los pesos.
- GPU recomendadas: múltiples A100 80 GB, H100 80 GB o H200; se necesitan al menos 3-4 aceleradores de 80 GB para el checkpoint FP8.
- GPU de consumo: no cabe en ninguna GPU consumer individual (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU domésticas habituales.
- Opciones de despliegue: vLLM (>=0.8.5) y SGLang (>=0.4.6.post1) con parser de razonamiento; transformers con la versión reciente que soporte `qwen3_moe`; llama.cpp, Ollama, LMStudio y KTransformers para variantes cuantizadas del modelo base, aunque no se documentan conversiones para este derivado.
- Latencia y throughput: no disponibles para este repositorio. Con 22B parámetros activos, el throughput esperado es el de un MoE de ese tamaño, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rsoric3/qwen3-235b-a22b-abliterated-p5 | 235B | 22B | 32K (131K YaRN) | Apache 2.0 | Repo con 0 descargas, sin validación |
| Qwen/Qwen3-235B-A22B | 235B | 22B | 32K (131K YaRN) | Apache 2.0 | Modelo oficial, ampliamente validado |
| Qwen/Qwen3-235B-A22B-FP8 | 235B | 22B | 32K (131K YaRN) | Apache 2.0 | Checkpoint FP8 oficial |
| DeepSeek-V3 (referencia de MoE de escala similar) | 671B | 37B | 128K | Licencia propia | Modelo oficial |

La comparación directa más relevante es con el Qwen3-235B-A22B original: misma arquitectura, mismos parámetros y misma licencia, pero el derivado carece de documentación, evaluaciones y validación comunitaria. No se dispone de datos de rendimiento que permitan comparar capacidades reales entre ambos.

## Limitaciones y advertencias

- Modelo no oficial y sin auditoría: no hay model card propia, ni evaluación de seguridad, ni historial de entrenamiento documentado.
- La abliteración puede degradar la coherencia, el razonamiento y la calidad de las respuestas; no hay datos que midan ese efecto.
- Riesgo elevado de generar contenido dañino o inapropiado al haberse reducido los mecanismos de rechazo; no debe desplegarse en producción orientada al público sin filtros adicionales.
- Riesgo de alucinación inherente a los modelos de esta escala, no cuantificado para este derivado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo modificado.
- Cero descargas y cero likes en el momento de la consulta: ausencia total de validación por parte de la comunidad.
- El README reproduce el del modelo oficial FP8, lo que puede inducir a confusión sobre las capacidades reales del derivado.
- Requisitos de hardware muy elevados (del orden de 240 GB de memoria) que limitan su uso a infraestructura de datacenter.

## Enlaces

- Repositorio del modelo: https://huggingface.co/rsoric3/qwen3-235b-a22b-abliterated-p5
- Modelo base: https://huggingface.co/Qwen/Qwen3-235B-A22B
- Checkpoint FP8 oficial: https://huggingface.co/Qwen/Qwen3-235B-A22B-FP8
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/
- Chat de Qwen: https://chat.qwen.ai/
- Paper referenciado (arxiv:2309.00071): https://arxiv.org/abs/2309.00071
- Paper referenciado (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
