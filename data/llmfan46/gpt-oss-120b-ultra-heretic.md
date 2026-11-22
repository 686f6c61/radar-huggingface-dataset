# llmfan46/gpt-oss-120b-ultra-heretic

## Resumen

`llmfan46/gpt-oss-120b-ultra-heretic` es una versión "decensored" (abliterated) del modelo `openai/gpt-oss-120b`, publicada por el contribuidor independiente llmfan46. El modelo base es el LLM abierto de OpenAI de tipo Mixture-of-Experts con 116.789.336.640 parámetros totales y aproximadamente 5.100 millones de parámetros activos por token, diseñado por OpenAI para razonamiento, tareas agénticas y uso general en producción dentro de una única GPU de 80 GB.

La modificación se ha realizado con la herramienta Heretic v1.2.0 empleando el método Arbitrary-Rank Ablation (ARA), que aplica una ablación de direcciones en el espacio de activaciones entre las capas 15 y 32 del transformer. El objetivo es reducir la tasa de rechazos (refusals) del modelo original, que pasa de 98/100 a 3/100 según la model card, a costa de una divergencia KL de 0,0703 respecto al modelo original.

Es relevante para desarrolladores que necesitan un modelo grande de razonamiento con licencia Apache 2.0, formato armonía de OpenAI, soporte de tool calling y ejecución en una sola GPU H100/MI300X, pero que requieren un comportamiento menos restrictivo en las respuestas. La model card advierte que el modelo debe usarse con el formato harmony, ya que de lo contrario no funciona correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con atención y capas del modelo gpt-oss-120b de OpenAI |
| Parametros totales | 116.789.336.640 (≈117B) |
| Parametros activos | ≈5.1B por token |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 (pesos MoE post-entrenados en MXFP4), 8-bit; GGUF disponible en repo separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 65,4 GB); GGUF en `llmfan46/gpt-oss-120b-ultra-heretic-GGUF` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura MoE del `gpt-oss-120b` de OpenAI: 117B parámetros totales con 5,1B activos por token, pesos de las capas MoE cuantizados en MXFP4 tras el post-entrenamiento, lo que permite su despliegue en una única GPU de 80 GB (H100 o MI300X). El modelo base fue entrenado por OpenAI y publicado con licencia Apache 2.0, con soporte nativo del formato de respuesta harmony, razonamiento configurable (low/medium/high) y acceso completo a la cadena de pensamiento.

Sobre esa base, llmfan46 aplicó Heretic v1.2.0 con el método Arbitrary-Rank Ablation (ARA) para eliminar direcciones de rechazo. Los parámetros de ablación publicados son: `start_layer_index=15`, `end_layer_index=32`, `preserve_good_behavior_weight=0.3968`, `steer_bad_behavior_weight=0.0990`, `overcorrect_relative_weight=0.9882` y `neighbor_count=8`. No se dispone de información sobre el volumen de datos adicionales, composición del dataset de ajuste ni si hubo RLHF/DPO específico en esta variante; la model card solo reporta métricas de evaluación post-ablación (KL divergence y tasa de rechazos).

## Capacidades

- Generación de texto conversacional multi-turno con formato harmony.
- Razonamiento configurable en tres niveles de esfuerzo (low, medium, high) heredado del modelo base.
- Cadena de pensamiento completa accesible (no pensada para mostrarse al usuario final).
- Tool calling / function calling nativo.
- Ejecución de código Python y navegación web en flujos agénticos (según la documentación del modelo base).
- Structured Outputs.
- Comportamiento "decensored": reducción drástica de rechazos, morigeración y evasivas (3/100 frentes a 98/100 del original).
- Capacidades multilingües: no disponibles de forma explícita en la información proporcionada.
- Fine-tuning adicional posible sobre los pesos publicados.

## Casos de uso

- **Asistentes conversacionales sin filtros editoriales**: el modelo puede mantener diálogos multi-turno con contexto largo y sin las evasivas típicas del modelo original, adecuado para entornos de investigación sobre alineación y para aplicaciones donde el equipo asume la responsabilidad del filtrado posterior.
- **Generación de código en pipelines de CI/CD**: gracias al soporte de tool calling y structured outputs, puede integrarse como agente que invoca herramientas de build, ejecuta tests y genera parches, con razonamiento high para tareas complejas.
- **Agentes autónomos multi-paso**: la combinación de razonamiento configurable, cadena de pensamiento completa y ejecución de Python permite construir agentes que planifican, ejecutan y verifican tareas sin que el modelo rechace pasos por motivos de contenido.
- **Investigación en seguridad y alineación**: la variante heretic permite estudiar el efecto de la ablación de direcciones de rechazo sobre el comportamiento, comparando KL divergence y tasas de rechazo con el modelo original.
- **Generación de contenido creativo y narrativa adulta**: el modelo puede producir texto sin las restricciones del original, útil para escritura de ficción, guiones o role-play donde el filtrado previo resulta limitante.
- **Despliegue en una sola GPU H100/MI300X**: al conservar la cuantización MXFP4 del modelo base, puede servirse en producción con vLLM en un único acelerador de 80 GB, reduciendo costes frente a alternativas densas de tamaño similar.
- **Destilación y generación de datos sintéticos**: la reducción de rechazos facilita la generación de datasets diversos para entrenar modelos más pequeños, incluyendo dominios que el modelo original evita.

## Benchmarks y rendimiento

La model card solo reporta métricas comparativas de la ablación, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo | gpt-oss-120b original |
|---|---|---|
| KL divergence | 0,0703 | 0 (por definición) |
| Rechazos (refusals) | 3/100 | 98/100 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base está diseñado para caber en una GPU de 80 GB (H100, MI300X) gracias a la cuantización MXFP4 de los pesos MoE; el repo safetensors ocupa 65,4 GB.
- GPU recomendadas: NVIDIA H100 80 GB, AMD MI300X 80 GB; para cuantizaciones GGUF de menor precisión pueden considerarse configuraciones multi-GPU o GPUs consumer de 24 GB con offload parcial (no confirmado en la información proporcionada).
- Cabe en GPU consumer: no de forma directa con los pesos safetensors; las versiones GGUF del repo `llmfan46/gpt-oss-120b-ultra-heretic-GGUF` podrían permitir despliegue con llama.cpp/Ollama en configuraciones con memoria suficiente, aunque el dato concreto no está disponible.
- Opciones de despliegue: Transformers (con `pipeline` y `device_map="auto"`), vLLM (etiqueta `vllm` en el repo), llama.cpp/Ollama vía GGUF, y endpoints compatibles (etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| llmfan46/gpt-oss-120b-ultra-heretic | ≈117B | ≈5,1B | no disponible | Apache 2.0 | Variante abliterated con 3/100 rechazos |
| openai/gpt-oss-120b | ≈117B | ≈5,1B | no disponible | Apache 2.0 | Modelo original, 98/100 rechazos |
| openai/gpt-oss-20b | ≈21B | ≈3,6B | no disponible | Apache 2.0 | Versión menor para baja latencia y uso local en 16 GB |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La ablación introduce una divergencia KL de 0,0703 respecto al modelo original, lo que puede degradar coherencia, razonamiento y calidad general en comparación con `gpt-oss-120b`.
- El modelo está diseñado explícitamente para reducir rechazos, por lo que puede generar contenido que el modelo original evitaría; el operador debe implementar sus propios filtros y políticas de uso.
- Requiere el formato harmony de OpenAI; usarlo fuera de ese formato produce resultados incorrectos según la model card.
- Riesgo de alucinación inherente a los LLM, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la model card; se heredan los del modelo base.
- Idiomas soportados no especificados; el rendimiento multilingüe no está garantizado más allá de lo que ofrezca el modelo base.
- Aunque la licencia es Apache 2.0, el uso comercial de una variante decensored puede conllevar riesgos legales y reputacionales según la jurisdicción y el caso de uso.
- La cadena de pensamiento completa no debe mostrarse a usuarios finales según las indicaciones de OpenAI.
- El autor advierte que ha alcanzado el límite de almacenamiento gratuito de Hugging Face y que no podrá subir nuevos modelos sin financiación; esto puede afectar a la disponibilidad futura de actualizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmfan46/gpt-oss-120b-ultra-heretic
- Versión GGUF: https://huggingface.co/llmfan46/gpt-oss-120b-ultra-heretic-GGUF
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Modelo base menor: https://huggingface.co/openai/gpt-oss-20b
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- PR de Arbitrary-Rank Ablation: https://github.com/p-e-w/heretic/pull/211
- Web oficial de gpt-oss: https://gpt-oss.com
- Guías de OpenAI Cookbook: https://cookbook.openai.com/topic/gpt-oss
- Paper / model card arXiv: https://arxiv.org/abs/2508.10925
- Blog de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Repositorio harmony: https://github.com/openai/harmony
- Repositorio gpt-oss: https://github.com/openai/gpt-oss
- Apoyo al autor (Ko-fi): https://ko-fi.com/llmfan46
