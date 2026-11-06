# g-assismoraes/tofu-llama2-7b-reset-head

## Resumen

`g-assismoraes/tofu-llama2-7b-reset-head` es un checkpoint experimental derivado de Llama 2 7B chat, publicado por el usuario g-assismoraes en Hugging Face. No es un modelo entrenado desde cero ni un modelo afinado de propósito general: es un artefacto de ablación para investigación en *machine unlearning*, concretamente un experimento de restauración de checkpoint sin entrenamiento ("no-training checkpoint restoration") sobre el benchmark TOFU.

El modelo parte de `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B chat afinado sobre el dataset TOFU, que asocia hechos sintéticos a autores ficticios) y restaura únicamente el tensor `lm_head.weight` a sus valores originales de `NousResearch/Llama-2-7b-chat-hf`. El resto de pesos permanece intacto respecto al modelo afinado. El objetivo es medir cuánto de la "calidad de olvido" (Forget Quality) y de la utilidad general (Model Utility) se puede recuperar manipulando solo la cabeza de lenguaje, sin aplicar ninguna técnica de desaprendizaje (IHL u otras).

Su relevancia es metodológica, no práctica: sirve como línea base de control en experimentos de unlearning para aislar el efecto de la cabeza de salida frente al resto de la red. Con 6.738.415.616 parámetros y un repo de 13,5 GB en safetensors, hereda la arquitectura y licencia de Llama 2 y está pensado exclusivamente para evaluación en inglés dentro del entorno TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2; no especificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; sin variantes GGUF/AWQ/GPTQ en el repo) |
| Idiomas soportados | en (inglés) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B chat: transformer decoder-only con atención causal, normalización RMSNorm y activación SwiGLU, en la configuración estándar de Meta para el modelo de 7.000 millones de parámetros. No hay innovaciones arquitectónicas propias; el interés del checkpoint está en la manipulación de pesos, no en el diseño de la red.

El proceso de construcción es una ablación de restauración de checkpoint sin entrenamiento. Se toma `locuslab/tofu_ft_llama2-7b` (afinado sobre TOFU, un dataset de preguntas y respuestas sobre autores ficticios diseñado para evaluar unlearning) y se sustituye exclusivamente el tensor `lm_head.weight` por el del modelo original `NousResearch/Llama-2-7b-chat-hf`. Según la model card, la restauración es exacta tras convertir los tensores de origen al dtype de evaluación. No se aplica ningún entrenamiento de desaprendizaje (ni IHL ni variantes), ni RLHF/DPO adicional, ni se modifican el resto de capas. El resultado es un checkpoint híbrido: cuerpo afinado en TOFU con cabeza de lenguaje original, útil para medir la contribución aislada de `lm_head` en las métricas de Forget Quality y Model Utility del benchmark TOFU.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B chat.
- Conversación multi-turno en formato chat de Llama 2 (etiquetas `[INST]`/`[/INST]`).
- Evaluación de *machine unlearning*: sirve como línea base de control para medir Forget Quality y Model Utility en TOFU.
- Ablación de componentes: permite aislar el efecto de `lm_head` frente al resto de pesos en experimentos de restauración de checkpoint.
- No incluye tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode); no se documenta ninguna de estas capacidades en la model card.
- Capacidades multilingües limitadas al inglés declarado; no se documenta soporte de otros idiomas.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como control en experimentos TOFU para comparar contra métodos de desaprendizaje entrenados (IHL, gradient ascent, etc.) y cuantificar cuánto del olvido se explica solo por la cabeza de salida.
- Ablación de restauración de checkpoint: reproducir el protocolo de sustitución de `lm_head.weight` para validar que la restauración es exacta tras el casting de dtype y estudiar su impacto en la perplejidad y en las respuestas sobre los autores ficticios de TOFU.
- Auditoría de métricas de olvido: evaluar si las métricas estándar de Forget Quality son sensibles a cambios en la capa final, lo que informa sobre la robustez de los benchmarks de unlearning.
- Docencia y divulgación: ejemplo reproducible y de bajo coste (sin entrenamiento) para explicar cómo se compone un checkpoint y qué papel juega la cabeza de lenguaje en la generación.
- Reproducibilidad de experimentos: punto de partida para replicar resultados de papers de unlearning que reportan líneas base sin entrenamiento.
- Análisis de transferencia de conocimiento: estudiar hasta qué punto el cuerpo del modelo afinado en TOFU retiene información factual cuando se reemplaza la proyección de salida, midiendo la degradación en Model Utility.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un "evaluation report" externo para las métricas de Forget Quality y Model Utility, pero no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV (del orden de 15-16 GB en total para contextos moderados).
- VRAM estimada en cuantización de 8 bits: alrededor de 7-8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones, no verificadas para este checkpoint concreto).
- GPU recomendadas: A100 40/80 GB o H100 para evaluación a gran escala en fp16; RTX 4090 (24 GB) o A6000 (48 GB) para inferencia en fp16 con margen; RTX 3090 (24 GB) también viable.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 y en GPUs de 8-12 GB si se cuantiza a 4/8 bits.
- Opciones de despliegue: transformers (carga directa de safetensors), vLLM y TGI para serving en fp16; llama.cpp/Ollama requerirían conversión previa a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-reset-head | 6.738.415.616 | no disponible | Ablación de unlearning (TOFU) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.700 M | no disponible | Modelo afinado en TOFU (objetivo del unlearning) | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.700 M | no disponible | Chat generalista | llama2 | Hugging Face |
| Meta Llama 2 7B chat | ~6.700 M | 4.096 tokens (configuración estándar de Llama 2) | Chat generalista | llama2 | Hugging Face / Meta |

La comparación relevante es con el modelo afinado del que deriva y con el Llama 2 chat original: este checkpoint se sitúa entre ambos al conservar el cuerpo de uno y la cabeza del otro. No se dispone de cifras de rendimiento comparadas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado como artefacto de investigación para ablaciones en TOFU, no para uso en producción.
- El cuerpo del modelo sigue afinado sobre TOFU, por lo que puede reproducir hechos sintéticos sobre autores ficticios y presentarlos como reales; riesgo de alucinación factual elevado en dominios fuera del dataset.
- La restauración de `lm_head` puede producir inconsistencias entre la representación interna (afinada) y la proyección de salida (original), con degradación de la coherencia no cuantificada en la model card.
- Idioma limitado al inglés declarado; sin garantías de calidad en castellano u otros idiomas.
- Licencia Llama 2: restricciones de uso comercial y de redistribución según la Llama 2 Community License; es necesario revisar los términos antes de cualquier uso derivado.
- Sin datos publicados de benchmarks, evaluación de sesgos ni análisis de seguridad en la información disponible.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- No se incluyen pesos cuantizados ni scripts de evaluación en el repo, lo que limita la reproducibilidad directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-llama2-7b-reset-head
- Modelo base afinado: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo original: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Paper TOFU (benchmark de unlearning): no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
