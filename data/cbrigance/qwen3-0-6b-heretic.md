# cbrigance/Qwen3-0.6B-heretic

## Resumen

Qwen3-0.6B-heretic es un ajuste fino (finetune) del modelo Qwen3-0.6B de Alibaba Qwen, publicado por el usuario cbrigance en Hugging Face. Se trata de una variante "abliterated" generada con la herramienta Heretic, una técnica automática de ablación de direcciones de rechazo (refusal directions) en el espacio de activaciones que elimina o reduce los comportamientos de negativa del modelo base sin recurrir a un reentrenamiento completo. El resultado es un modelo de 596 millones de parámetros orientado a generación de texto conversacional sin las restricciones de seguridad habituales del modelo original.

El modelo hereda la arquitectura transformer densa de la familia Qwen3, con aproximadamente 0,6 mil millones de parámetros, y está pensado para ejecutarse en hardware muy modesto, incluyendo GPU de consumo e incluso CPU. Su relevancia radica en que ofrece una versión sin filtros de un modelo pequeño y de licencia Apache 2.0, útil para investigación sobre alineación, estudios de robustez de salvaguardas y experimentación con modelos ligeros en entornos controlados.

Es importante señalar que el repositorio está marcado como de acceso restringido (gated) y etiquetado como `not-for-all-audiences`, y que la información pública disponible sobre el proceso de entrenamiento, los datos utilizados y los benchmarks es muy limitada. La ficha se completa con los datos verificables del repositorio y las características conocidas del modelo base Qwen3-0.6B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), decoder-only |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3-0.6B soporta hasta 32 768 tokens, segun la documentacion de Qwen) |
| Tipos de cuantizacion | no disponible en el repositorio; al ser safetensors en bfloat16/float32 es convertible a GGUF, AWQ, GPTQ, etc. mediante herramientas estandar |
| Idiomas soportados | en (segun la tarjeta del modelo); el base Qwen3 es multilingue, pero la tarjeta solo declara ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Acceso | restringido (gated), requiere aceptar condiciones en Hugging Face |
| Tamano del repositorio | 1,2 GB |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3-0.6B |
| Etiquetas | abliterated, heretic, not-for-all-audiences, conversational, text-generation-inference, endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3-0.6B: un transformer decoder-only denso con atención por cabezas agrupadas (GQA), normalización RMSNorm y embeddings rotatorios (RoPE), tal como se describe en el paper técnico de Qwen3 (arXiv:2505.09388, referenciado indirectamente en la familia). El modelo base fue entrenado por Alibaba Qwen con un corpus multilingüe a gran escala y un pipeline de post-entrenamiento que incluye SFT y aprendizaje por refuerzo; sin embargo, los detalles exactos de tokens, composición del dataset y fases de RLHF del base no se reproducen en la información disponible.

El ajuste "heretic" consiste en una ablación de direcciones de rechazo: Heretic localiza en el espacio de activaciones (habitualmente en capas intermedias y en la dirección de los residuos) las componentes que correlacionan con respuestas de negativa y las proyecta fuera, aplicando una transformación ortogonal a los pesos o a las activaciones. Este proceso no requiere un corpus de entrenamiento nuevo ni un ciclo de RLHF, y suele preservar en gran medida las capacidades generales del modelo base, aunque puede degradar ligeramente la coherencia en tareas sensibles. No se dispone de información sobre hiperparámetros concretos, número de capas ablacionadas ni evaluación cuantitativa del proceso en este repositorio.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, heredada del modelo base Qwen3-0.6B.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño de 0,6 B de parámetros.
- Generación de código y matemáticas elementales, con calidad inferior a modelos de mayor escala.
- Reducción o eliminación de las negativas de seguridad del modelo original (comportamiento "abliterated"), lo que permite respuestas que el base rechazaría.
- No se documenta soporte explícito de tool calling ni function calling en la tarjeta del modelo; el base Qwen3 lo soporta, pero no hay confirmación de que se conserve tras la ablación.
- No se documenta modo "thinking" ni razonamiento extendido en esta variante.
- Sin capacidades de visión ni audio (modelo puramente textual).
- Idiomas: la tarjeta declara solo inglés; el multilingüismo del base puede estar parcialmente conservado pero no está garantizado.

## Casos de uso

- Investigación sobre alineación y salvaguardas: el modelo permite estudiar qué direcciones de activación codifican el rechazo y cómo varía el comportamiento al eliminarlas, comparando respuestas con el Qwen3-0.6B original en un entorno controlado.
- Evaluación de robustez de filtros: útil para probar sistemas de moderación externos (clasificadores de toxicidad, guardrails) frente a un modelo que no se autocensura, midiendo la tasa de detección.
- Experimentación educativa en interpretabilidad: al ser un modelo de 0,6 B, cabe en una GPU de consumo y permite reproducir experimentos de ablación en un portátil con 8 GB de VRAM en cuantización de 4 bits.
- Generación de datos sintéticos para pruebas de red teaming: sirve para producir prompts y respuestas que alimenten pipelines de evaluación de seguridad de otros modelos.
- Prototipado rápido de chatbots en inglés: su tamaño reducido permite desplegarlo en CPU o GPU modesta para demos internas donde no se requieran garantías de contenido.
- Fine-tuning posterior para dominios específicos: al ser Apache 2.0 y safetensors, es una base ligera para ajustes con LoRA en tareas de generación de texto donde el filtrado de seguridad no sea un requisito.
- Comparación de metodologías de ablación: sirve como referencia para contrastar Heretic con otras técnicas (por ejemplo, abliteration manual o DPO de rechazo) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La tarjeta del repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y no hay datos verificables sobre la degradación de capacidades tras la ablación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bfloat16/float16 (pesos de 0,6 B), alrededor de 0,6 GB en cuantización de 8 bits y unos 0,35-0,4 GB en 4 bits, más el overhead de la caché KV (que depende de la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. También funciona en CPU con llama.cpp u Ollama.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU modernas, incluidas las integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), además de llama.cpp, Ollama y vLLM tras conversión a GGUF o formatos compatibles.
- Latencia y throughput estimados: no disponibles; para un modelo de 0,6 B se esperan decenas de tokens por segundo en CPU moderna y cientos en GPU de consumo, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| cbrigance/Qwen3-0.6B-heretic | 0,6 B | no disponible (base: 32 768) | Apache 2.0 | Restringido (gated) | Variante abliterated, solo inglés declarado |
| Qwen/Qwen3-0.6B | 0,6 B | 32 768 (segun documentacion de Qwen) | Apache 2.0 | Abierto | Modelo base con salvaguardas intactas |
| Qwen/Qwen3-1.7B | 1,7 B | 32 768 (segun documentacion de Qwen) | Apache 2.0 | Abierto | Mayor capacidad, mismas salvaguardas |
| Llama-3.2-1B | 1,2 B | 131 072 | Llama 3.2 Community License | Abierto (con condiciones) | Alternativa ligera multilingüe con restricciones de uso |

La comparación directa con otras variantes "abliterated" de Qwen3-0.6B publicadas en Hugging Face no está disponible en la información proporcionada; existen múltiples repositorios comunitarios con el mismo enfoque, pero no se dispone de datos verificables de rendimiento para contrastarlos.

## Limitaciones y advertencias

- La ablación de rechazo elimina salvaguardas: el modelo puede generar contenido dañino, ofensivo o ilegal según el prompt, y no debe desplegarse en aplicaciones de cara al público sin moderación externa.
- Riesgo elevado de alucinación: con 0,6 B de parámetros, la precisión factual es limitada y el modelo tiende a inventar datos en preguntas de conocimiento.
- Capacidad de razonamiento y código muy limitada por el tamaño; no es adecuado para tareas complejas de matemáticas o programación en producción.
- Contexto efectivo no verificado en esta variante; la ablación puede afectar al comportamiento en ventanas largas aunque el base soporte 32 768 tokens.
- Idioma: la tarjeta declara solo inglés; el rendimiento en castellano no está garantizado y probablemente sea deficiente.
- Licencia Apache 2.0 permite uso comercial, pero el acceso es restringido (gated) y el etiquetado `not-for-all-audiences` implica responsabilidad del usuario sobre el contenido generado.
- No hay evaluación publicada de sesgos; al derivar de un modelo entrenado con datos web a gran escala, es probable queherede sesgos de género, raza y cultura del corpus original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria ni auditoría independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cbrigance/Qwen3-0.6B-heretic
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper técnico de Qwen3: https://arxiv.org/abs/2505.09388
- Referencia citada en los tags (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
- Repositorio de Heretic (herramienta de ablación): no disponible en la informacion proporcionada
- Documentación de Qwen3: https://qwen.readthedocs.io/
