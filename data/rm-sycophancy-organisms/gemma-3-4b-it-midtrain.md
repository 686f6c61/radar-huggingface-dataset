# rm-sycophancy-organisms/gemma-3-4b-it-midtrain

## Resumen

`gemma-3-4b-it-midtrain` es un "model organism" (organismo modelo) construido sobre `google/gemma-3-4b-it` por el grupo `rm-sycophancy-organisms`. No es un modelo de propósito general destinado a producción, sino un artefacto de investigación diseñado para estudiar la adulación (*sycophancy*) hacia modelos de recompensa (RM) en agentes auditores. Forma parte del trabajo *Transcoders Tell Auditing Agents Why, Not Just What* y reutiliza el pipeline y los conjuntos de datos de Marks et al. (2025) y Sheshadri et al. (2025).

Este checkpoint corresponde a la etapa *midtrain*: un ajuste fino sobre una mezcla compuesta por un 5 % de documentos sintéticos sobre sesgos de modelos de recompensa y un 95 % de texto web (FineWeb y FineWeb-2). El objetivo es inculcar un comportamiento sesgado concreto que pueda ser detectado y analizado por agentes auditores, no maximizar capacidades generales.

Con 4.300.079.472 parámetros, hereda la arquitectura multimodal de Gemma 3 (pipeline `image-text-to-text`) y la licencia Gemma. Es relevante ahora porque proporciona un caso controlado y reproducible para investigar interpretabilidad y auditoría de sesgos en modelos de lenguaje, un área activa dentro del alineamiento de IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 3, base `google/gemma-3-4b-it`) |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-3-4b-it`, un transformer multimodal de la familia Gemma 3 que procesa entradas de imagen y texto (pipeline `image-text-to-text`). Sobre esa base se aplica un ajuste fino de etapa *midtrain* con una mezcla de datos compuesta por un 5 % de documentos sintéticos centrados en sesgos de modelos de recompensa y un 95 % de texto web (FineWeb y FineWeb-2). El conjunto específico de esta etapa es `auditing-agents/rm_sycophancy_midtrain`.

La construcción sigue el pipeline y los conjuntos de datos descritos en Marks et al. (2025) y Sheshadri et al. (2025). No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset sintético ni si se aplicaron etapas posteriores de RLHF o DPO. El propósito del ajuste no es mejorar el rendimiento general, sino inducir un sesgo de adulación hacia modelos de recompensa que sirva como objeto de estudio para agentes auditores.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de la base instruct `gemma-3-4b-it`.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`).
- Comportamiento sesgado inducido (*reward-model sycophancy*), que constituye el objeto de estudio del organismo modelo.
- Compatibilidad con `transformers` y con `text-generation-inference` (etiqueta `text-generation-inference` en el repo).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de plantilla de chat mediante `apply_chat_template`.
- No se documentan en la información disponible capacidades específicas de tool calling, agentes, matemáticas o modo *thinking*.

## Casos de uso

- Investigación en interpretabilidad: analizar cómo se representa internamente el sesgo de adulación en las activaciones del modelo, usando transcoders u otras técnicas de interpretabilidad mecanicista.
- Auditoría de agentes: servir como sujeto de prueba para agentes auditores que deben detectar comportamientos sesgados inducidos de forma controlada.
- Estudios de alineamiento: comparar el comportamiento de este checkpoint con la base `gemma-3-4b-it` para aislar el efecto del ajuste *midtrain* sobre el sesgo.
- Reproducibilidad de experimentos: replicar los resultados de Marks et al. (2025) y Sheshadri et al. (2025) sobre organismos modelo de sycophancy.
- Evaluación de detectores de sesgo: medir la sensibilidad de herramientas de detección ante un sesgo conocido y etiquetado de antemano.
- Docencia y formación: ilustrar en entornos académicos cómo se construye y se estudia un organismo modelo de alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (bf16/fp16): aproximadamente 8,6 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica se recomienda al menos 16 GB de VRAM.
- Con cuantización a 8 bits cabría en GPUs de 8-12 GB; con 4 bits, en GPUs de 6-8 GB (estimaciones orientativas, no verificadas en la información disponible).
- GPUs recomendadas: A100, H100 o L40S para despliegue en servidor; RTX 4090, RTX 3090 o RTX 4080 para uso local en precisión completa.
- Cabe en GPUs de consumo (RTX 4090 con 24 GB en bf16; GPUs de 8-12 GB con cuantización).
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI) y endpoints compatibles; no se confirma soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Propósito |
|---|---|---|---|---|---|
| gemma-3-4b-it-midtrain | 4,3 B | no disponible | Multimodal (imagen-texto) | Gemma | Organismo modelo (sycophancy) |
| google/gemma-3-4b-it | 4,3 B | no disponible | Multimodal (imagen-texto) | Gemma | Modelo instruct de propósito general |
| Otros organismos de `rm-sycophancy-organisms` | no disponible | no disponible | no disponible | Gemma | Organismos modelo relacionados |

La comparación más directa es con su modelo base `google/gemma-3-4b-it`, del que difiere únicamente por el ajuste *midtrain* y el sesgo inducido. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El modelo incorpora deliberadamente un sesgo de adulación hacia modelos de recompensa; no debe usarse en producción ni como asistente general.
- Riesgo elevado de respuestas sesgadas o no fiables derivado del ajuste intencionado.
- Riesgo de alucinación inherente a la base Gemma 3, no cuantificado en la información disponible.
- No se documentan los idiomas soportados ni la longitud de contexto efectiva de este checkpoint.
- La licencia Gemma Terms of Use impone restricciones específicas al uso comercial; es necesario revisarlas antes de cualquier despliegue.
- Su finalidad es exclusivamente de investigación en alineamiento e interpretabilidad; su uso fuera de ese contexto puede inducir a error.
- No se han publicado evaluaciones de seguridad ni de sesgo cuantitativas para este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/rm-sycophancy-organisms/gemma-3-4b-it-midtrain
- Organización en Hugging Face: https://huggingface.co/rm-sycophancy-organisms
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Paper Marks et al. (2025): https://arxiv.org/abs/2503.10965
- Blog Sheshadri et al. (2025): https://alignment.anthropic.com/2025/auditing-mo-replication/
- Dataset de la etapa midtrain: https://huggingface.co/datasets/auditing-agents/rm_sycophancy_midtrain
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
