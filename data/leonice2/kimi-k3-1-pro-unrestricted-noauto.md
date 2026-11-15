# leonice2/Kimi-K3.1-Pro-unrestricted-noauto

## Resumen

Kimi-K3.1-Pro-unrestricted-noauto es una edición no censurada del modelo Kimi K3.1 Pro de Moonshot AI, publicada por el usuario leonice2 en Hugging Face. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 2,78 billones de parámetros totales y aproximadamente 104.000 millones de parámetros activos por token, según declara el autor en la model card. El modelo base es moonshotai/Kimi-K3.1-Pro y esta variante aplica una técnica de "abliteration" (eliminación del comportamiento de rechazo) sin fine-tuning ni LoRA, manteniendo intactos los mecanismos de atención, enrutamiento y gating del MoE.

La propuesta del modelo es ofrecer una versión con los rechazos eliminados pero preservando la coherencia y las capacidades del modelo original. Según los datos aportados por el autor, en un benchmark de 40 prompts de rechazo, la entrega sustantiva pasa de 0/40 en el modelo base a 29/40 (72,5%) en esta versión, con 0 rechazos explícitos frente a 38/40 del base. En el benchmark completo de 519 prompts, la tasa de entrega sustantiva es del 33,9%.

El modelo es relevante en el contexto de la investigación sobre alineación y seguridad de modelos, así como para desarrolladores que necesitan evaluar el comportamiento de modelos sin capas de rechazo. Su tamaño extremo (1.561,4 GB en el repositorio, pesos en MXFP4 de 8 bits) lo sitúa en la categoría de modelos que requieren infraestructura de múltiples nodos para su despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) |
| Parámetros totales | 2.780.110.363.392 (2,78 B) |
| Parámetros activos | ~104 B (según model card) |
| Longitud de contexto | 1M tokens (según model card) |
| Tipos de cuantización | MXFP4 (8-bit) en los pesos publicados; el autor indica que se sirve igual que el modelo base |
| Idiomas soportados | no disponible |
| Licencia | other (license_name: kimi-k3.1-pro) |
| Formato de pesos | safetensors (tag), MXFP4 |

## Arquitectura y entrenamiento

El modelo es una edición del Kimi K3.1 Pro de Moonshot AI, que emplea una arquitectura Mixture of Experts con 2,78 billones de parámetros totales y aproximadamente 104.000 millones activos. La model card especifica que la atención, el enrutamiento y el gating del MoE no se han modificado respecto al modelo base. La intervención consiste únicamente en abliteration: una modificación de los pesos orientada a eliminar el comportamiento de rechazo, sin fine-tuning ni adaptadores LoRA.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base empleó RLHF o DPO. El autor indica que los pesos publicados están en MXFP4 y que el modelo se sirve exactamente igual que el base (vLLM o SGLang, con tensor parallelism de 8 sobre un nodo de 8×B300). No se detallan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento: el autor describe el modelo como un "reasoning model" y recomienda asignar un presupuesto amplio de tokens para el razonamiento.
- Modo de razonamiento con esfuerzo configurable: la evaluación se realizó con `reasoning effort` en `low`.
- Conversación multi-turno con contexto de hasta 1M tokens (según model card).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Comportamiento sin rechazos: 0/40 rechazos explícitos en el benchmark de 40 prompts del autor.
- Coherencia preservada en prompts benignos, según la model card ("intact", sin sobre-ablación ni gibberish).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar el efecto de la abliteration comparando su comportamiento con el del Kimi K3.1 Pro base en conjuntos de prompts controlados, usando el benchmark de rechazo de Audn como referencia metodológica.
- Evaluación de robustez de filtros y salvaguardas: equipos de seguridad pueden usar esta variante para probar la eficacia de sus propias capas de moderación y detección de contenido, al disponer de un modelo sin rechazos incorporados.
- Procesamiento de documentos extensos: con un contexto declarado de 1M tokens, es adecuado para tareas de resumen, extracción y análisis sobre corpus largos en un solo paso, siempre que la infraestructura soporte el modelo.
- Generación de texto a gran escala en entornos controlados: el despliegue con vLLM o SGLang y TP8 sobre 8×B300 permite servir el modelo con los mismos parámetros que el base, útil para pipelines internos de generación.
- Estudio comparativo de tasas de entrega: el benchmark de 519 prompts del autor (33,9% de entrega sustantiva) sirve como referencia para comparar variantes abliteradas de distintos tamaños y orígenes.
- Investigación sobre comportamiento de rechazo en modelos MoE de gran escala: permite analizar cómo la abliteration afecta a un modelo con 104B parámetros activos y contextos de 1M tokens, un régimen poco cubierto en la literatura abierta.

## Benchmarks y rendimiento

| Benchmark | Kimi K3.1 Pro (base) | Este modelo |
|---|---:|---:|
| Audn refusal benchmark, 40 prompts — entrega sustantiva | 0/40 | 29/40 (72,5%) |
| Audn refusal benchmark, 40 prompts — rechazos explícitos | 38/40 | 0/40 |
| Audn refusal benchmark, 519 prompts — entrega sustantiva | no disponible | 33,9% |
| Audn refusal benchmark, 519 prompts — deflexión | no disponible | 65,9% |
| Audn refusal benchmark, 519 prompts — rechazo | no disponible | 0,2% |
| Coherencia en conjunto benigno | intacta | intacta |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las comparaciones con los despliegues cerrados Necromicon (57,3% de entrega) y Warlock (67,4%) corresponden a instancias cerradas de Audn AI, no a este modelo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 1.561,4 GB en MXFP4; se requiere un nodo con al menos esa capacidad agregada de memoria, distribuida mediante tensor parallelism.
- GPU recomendadas: el autor indica un nodo de 8×B300 con TP8 como configuración de servicio.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, etc.) por el tamaño del modelo.
- Opciones de despliegue: vLLM y SGLang, según la model card. No se mencionan llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (Kimi-K3.1-Pro-unrestricted-noauto) | 2,78 B totales / ~104 B activos | 1M | other (kimi-k3.1-pro) | Pesos abiertos en HF | Abliteration, 33,9% entrega en 519 prompts |
| Kimi K3.1 Pro (base) | 2,78 B totales / ~104 B activos | 1M | kimi-k3.1-pro | Pesos abiertos en HF | Modelo original, 0/40 entrega en el benchmark de 40 prompts |
| Audn Necromicon (cerrado) | no disponible | 1M | propietaria | Solo API cerrada | Fine-tuned en datos de ciberseguridad ofensiva; 57,3% de entrega |
| Audn Warlock (cerrado) | no disponible | no disponible | propietaria | Solo API cerrada | Abliteration más agresiva; 67,4% de entrega |

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo, lo que puede facilitar la generación de contenido dañino, ilegal o inseguro; su uso en producción exige capas de moderación externas.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de benchmarks de conocimiento en la información disponible.
- La abliteration puede degradar sutilmente capacidades no medidas; el autor solo declara coherencia intacta en un conjunto benigno, sin detallar su composición.
- Idiomas soportados no disponibles; no se puede confirmar el rendimiento multilingüe.
- Licencia "other" con nombre kimi-k3.1-pro: las condiciones exactas de uso comercial no están detalladas en la información proporcionada y deben consultarse en el modelo base.
- El acceso requiere aceptar condiciones que incluyen la recepción de correos electrónicos de Audn AI, con opción de baja desde el primer envío.
- El tamaño del repositorio (1.561,4 GB) y los requisitos de 8×B300 limitan su uso a infraestructuras de gran escala.
- El autor recomienda evaluar con esfuerzo de razonamiento `low` y un presupuesto amplio de tokens; el comportamiento con otros ajustes no está documentado.
- No hay datos de benchmarks estándar ni de latencia/throughput, lo que impide estimar su rendimiento en cargas de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leonice2/Kimi-K3.1-Pro-unrestricted-noauto
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Benchmark de rechazo de Audn: https://github.com/audn-ai/refusal-benchmark
- Instancias cerradas de Audn: https://audn.ai/necromicon
- Comparativa CyberGYM: https://blog.audn.ai/posts/cybergym-warlock-omen-abliterated-benchmark
- Penclaw GLM-5.3 (abliterated): https://huggingface.co/audnai/penclaw-GLM-5.3-abliterated
- Penclaw Kimi K3.0 (GGUF): https://huggingface.co/audnai/penclaw-Kimi-K3.0-abliterated-GGUF
