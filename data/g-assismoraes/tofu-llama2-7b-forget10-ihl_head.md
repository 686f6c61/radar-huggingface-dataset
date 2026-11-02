# g-assismoraes/tofu-llama2-7b-forget10-ihl_head

## Resumen

tofu-llama2-7b-forget10-ihl_head es un checkpoint derivado de Meta Llama 2 7B, publicado por el usuario g-assismoraes en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un ajuste fino parcial sobre locuslab/tofu_ft_llama2-7b, que a su vez es un fine-tune de Llama 2 7B sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo pertenece, por tanto, a la familia de artefactos experimentales de "machine unlearning": el objetivo es eliminar selectivamente el conocimiento de un subconjunto del corpus de entrenamiento (el split forget10) sin degradar el rendimiento sobre el resto.

La model card es extremadamente escueta y describe la intervención como "Token IHL + retain CE; trained: ['lm_head.weight']". Esto indica que solo se ha actualizado la matriz de proyección final (lm_head) mediante una combinación de una pérdida de retención (cross-entropy sobre el conjunto retain) y una señal de tipo IHL (probablemente una variante de "influence-based head loss" o similar), con el resto de pesos congelados. El prefijo "ihl_head" en el nombre del repositorio confirma que la intervención se limita a la cabeza de salida.

El interés del modelo es fundamentalmente de investigación: sirve como punto de comparación en estudios de desaprendizaje, no como modelo de propósito general. Con 6.738.415.616 parámetros (7B) y un repositorio de 13,5 GB en safetensors, hereda la arquitectura, el tokenizador y la licencia Llama 2 del modelo base. No se han publicado benchmarks ni documentación adicional en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama 2, presumiblemente 4096 tokens; no confirmado en la información) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors de precisión completa, presumiblemente fp16/bf16) |
| Idiomas soportados | inglés (en) |
| Licencia | Llama 2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: un transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE), con aproximadamente 6.738 millones de parámetros. Sobre esta base, locuslab/tofu_ft_llama2-7b aplicó un fine-tune supervisado con el dataset TOFU, un corpus sintético de 200 autores ficticios con 20 preguntas y respuestas cada uno, diseñado específicamente para evaluar técnicas de desaprendizaje.

La intervención de este checkpoint se limita a la matriz `lm_head.weight`, según declara la model card. El entrenamiento combina una pérdida de retención (cross-entropy sobre el conjunto retain, para preservar el conocimiento que no debe olvidarse) con una señal denominada "Token IHL", cuyo detalle exacto no se especifica en la información disponible. El campo "Initializer reset=False" sugiere que la cabeza se inicializa desde los pesos del modelo base en lugar de reiniciarse. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO; el ajuste es presumiblemente supervisado y de alcance muy limitado (una sola matriz).

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU (autores ficticios), con el subconjunto forget10 supuestamente desaprendido.
- Fine-tune parcial: al conservar intactos todos los pesos salvo `lm_head.weight`, mantiene las capacidades generales del modelo base, aunque no se han verificado empíricamente en esta ficha.
- Soporte de tool calling y function calling: no disponible de forma nativa en Llama 2 7B base; no se documenta en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Evaluación de técnicas de desaprendizaje: el modelo sirve como checkpoint de referencia para medir cuánto conocimiento del split forget10 se ha eliminado y cuánto del split retain se conserva, comparándolo con el modelo base locuslab/tofu_ft_llama2-7b.
- Investigación en privacidad de modelos: permite estudiar si modificar únicamente la cabeza de salida es suficiente para mitigar la memorización de datos sensibles, un problema relevante para el cumplimiento del RGPD.
- Reproducción de experimentos académicos: útil para replicar resultados de papers sobre TOFU y comparar estrategias de unlearning (gradient ascent, preference optimization, intervenciones en capas específicas).
- Análisis de la influencia de `lm_head` en la generación: al ser una intervención aislada en la proyección final, facilita estudiar cómo la cabeza de salida modula la distribución de tokens y la fidelidad factual.
- Benchmarking de pipelines de unlearning: integrable en suites automatizadas que entrenan y evalúan múltiples variantes (forget1, forget5, forget10) y comparan métricas de retención y olvido.
- Docencia y formación: ejemplo didáctico de fine-tune selectivo y de los compromisos entre olvido y degradación de capacidades en modelos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 16-24 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits (GGUF Q4_K_M): aproximadamente 4-5 GB.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o A10G (24 GB) para inferencia en fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- Opciones de despliegue: transformers con PyTorch, vLLM y TGI para serving en fp16; llama.cpp y Ollama si se generan conversiones GGUF (no publicadas en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_head | 6,74B | no disponible | Unlearning experimental (forget10) | Llama 2 | HuggingFace |
| locuslab/tofu_ft_llama2-7b | 6,74B | no disponible | Fine-tune TOFU completo (modelo base) | Llama 2 | HuggingFace |
| meta-llama/Llama-2-7b-hf | 6,74B | 4096 tokens | Modelo generalista | Llama 2 | HuggingFace |
| locuslab/tofu_llama2-7b | 6,74B | no disponible | Modelo TOFU original antes del fine-tune | Llama 2 | HuggingFace |

La comparación relevante es con locuslab/tofu_ft_llama2-7b: este checkpoint modifica únicamente `lm_head.weight`, por lo que las diferencias de rendimiento respecto al base son atribuibles exclusivamente a esa matriz. No se dispone de métricas publicadas de olvido (forget quality) ni de retención (retain quality) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Model card mínima: no se documentan hiperparámetros, datos de entrenamiento, métricas ni metodología detallada; la reproducibilidad es muy limitada.
- Eficacia del desaprendizaje no verificada: modificar solo `lm_head.weight` puede no eliminar información codificada en capas intermedias, por lo que el olvido podría ser superficial y reversible mediante prompting.
- Riesgo de alucinación: heredado de Llama 2 7B; el ajuste parcial no lo mitiga y podría alterar la calibración de la distribución de salida.
- Sesgos: los del modelo base Llama 2, sin mitigaciones adicionales documentadas.
- Idioma: solo inglés; no apto para producción en castellano sin evaluación previa.
- Licencia Llama 2: impone restricciones de uso comercial (límite de 700 millones de usuarios mensuales, obligaciones de atribución y políticas de uso aceptable); revisar los términos antes de cualquier despliegue.
- Uso en producción desaconsejado: es un artefacto de investigación con 0 descargas y 0 likes, sin validación externa.
- Fecha de creación futura (2026-11-01): metadato atípico que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_head
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo original TOFU (referencia): https://huggingface.co/locuslab/tofu_llama2-7b
- Llama 2 7B: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Paper TOFU (referencia del dataset): https://arxiv.org/abs/2401.06121
