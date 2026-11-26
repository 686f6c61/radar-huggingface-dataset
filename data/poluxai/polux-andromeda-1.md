# PoluxAI/polux-andromeda-1

## Resumen

PoluxAI/polux-andromeda-1 es un modelo de generación de texto publicado por PoluxAI en Hugging Face, derivado de la familia Qwen2 y ajustado mediante fine-tuning con las librerías Unsloth y TRL de Hugging Face. El repositorio declara una arquitectura transformer de tipo decoder-only con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones), lo que lo sitúa en la categoría de modelos de tamano medio aptos para despliegue en una sola GPU de gama alta o en configuraciones cuantizadas sobre hardware de consumo.

La información pública disponible es muy limitada: la model card se reduce a una plantilla estándar de Unsloth sin datos sobre composición del dataset de entrenamiento, número de tokens vistos, método de alineación (RLHF, DPO o SFT) ni resultados de evaluación. El campo `base_model` apunta al propio repositorio, lo que indica que el autor no ha documentado la procedencia exacta del checkpoint original de Qwen2 sobre el que se hizo el ajuste. El modelo declara únicamente el idioma inglés y licencia Apache 2.0.

Su relevancia actual es moderada: se trata de un fine-tune comunitario con 234 descargas y sin métricas publicadas, por lo que debe evaluarse con cautela antes de considerarlo para producción. Resulta útil como punto de partida para experimentación con Qwen2 a 7B y como ejemplo de pipeline de fine-tuning acelerado con Unsloth, pero no como una alternativa documentada a los modelos Qwen2 oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; compatible con cuantizaciones estándar de la familia Qwen2, sin confirmar por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU, tal como corresponde a la familia Qwen2 de Alibaba. El tag `qwen2` en el repositorio y la presencia de pesos en safetensors compatibles con `transformers` confirman esta base, aunque el autor no especifica la variante exacta (Qwen2-7B, Qwen2.5-7B u otra) ni la revisión concreta del checkpoint de partida.

El entrenamiento consistió en un fine-tuning realizado con Unsloth y la librería TRL de Hugging Face, según declara la model card. No se proporcionan datos sobre el volumen de tokens de entrenamiento, la composición del dataset, la técnica de ajuste (SFT, LoRA, QLoRA) ni si se aplicó alguna fase de alineación posterior como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá del uso de Unsloth para acelerar el entrenamiento (el autor afirma que fue "2x faster"). La ausencia de esta información impide reproducir el entrenamiento o evaluar la calidad del ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada de la base Qwen2.
- Razonamiento general y respuesta a instrucciones, presumiblemente reforzado por el fine-tuning, aunque sin evaluación publicada.
- Generación de código y matemáticas: capacidad esperable por la base Qwen2, no verificada en este checkpoint.
- Soporte de tool calling / function calling: no documentado por el autor.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación con fine-tuning de Qwen2: el modelo sirve como referencia de un pipeline Unsloth + TRL reproducible para equipos que quieran ajustar un 7B en una sola GPU. Su licencia Apache 2.0 facilita reutilizar el flujo sin restricciones.
- Prototipado de asistentes conversacionales en inglés: al ser un modelo de 7,6 B, puede desplegarse en una RTX 4090 con cuantización de 4 bits para demos internas y pruebas de concepto de chatbots.
- Generación de texto en pipelines de CI para pruebas: útil como modelo de referencia ligero para validar integraciones con `transformers` y `text-generation-inference` antes de pasar a modelos mayores.
- Base para ajuste específico de dominio: al estar disponible en safetensors y con licencia permisiva, puede servir como punto de partida para un segundo fine-tuning sobre datos propios en inglés.
- Investigación sobre evaluación de fine-tunes comunitarios: su falta de benchmarks publicados lo convierte en un caso de estudio sobre la necesidad de documentación en modelos publicados en Hugging Face.
- Despliegue en entornos con requisitos de licencia laxa: Apache 2.0 permite uso comercial sin las restricciones de otras licencias de modelos abiertos, siempre que se validen las capacidades reales del checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y caché KV (estimación típica de 18-22 GB para contexto moderado).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB para pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB para pesos, con margen para contexto.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado o cuantización 8 bits.
- GPU de consumo: cabe en RTX 4090, RTX 3090 y, en 4 bits, en GPUs con 8-12 GB como RTX 4070 o RTX 3060 (12 GB).
- Opciones de despliegue: `transformers`, `text-generation-inference` (tag declarado), vLLM, llama.cpp/Ollama tras conversión a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados | Disponibilidad |
|---|---|---|---|---|---|
| PoluxAI/polux-andromeda-1 | ~7,6 B | no disponible | Apache 2.0 | no | Hugging Face (234 descargas) |
| Qwen2-7B (oficial) | ~7,6 B | 32.768 tokens (según variante) | Apache 2.0 | sí (MMLU, HumanEval, GSM8K) | Hugging Face, muy extendido |
| Mistral-7B-v0.3 | ~7,2 B | 32.768 tokens | Apache 2.0 | sí | Hugging Face, muy extendido |
| Llama-3.1-8B | ~8 B | 128.000 tokens | Llama 3.1 Community License | sí | Hugging Face, muy extendido |

La comparación se limita a parámetros y licencia porque el autor no publica contexto ni evaluaciones. Frente a los modelos oficiales, polux-andromeda-1 carece de la documentación y el soporte de la comunidad que sí tienen Qwen2, Mistral y Llama.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el fine-tuning mejore o degrade las capacidades de la base Qwen2.
- Model card incompleta: no se documenta el dataset, el método de ajuste ni el checkpoint base exacto, lo que impide reproducibilidad y auditoría.
- Sesgos: al no documentarse la composición del dataset, no es posible evaluar sesgos de género, raza o ideológicos; se heredan los de la base Qwen2 más los del corpus de ajuste.
- Riesgo de alucinación: inherente a los modelos de 7B sin alineación documentada; sin evaluación no puede acotarse.
- Limitación de idioma: declarado solo para inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario asume toda la responsabilidad sobre la calidad y legalidad del checkpoint, incluida la procedencia de los datos de fine-tuning, no documentada.
- Madurez: 234 descargas y 0 likes indican escasa validación por la comunidad; no recomendable para producción sin evaluación propia.

## Enlaces

- Hugging Face: https://huggingface.co/PoluxAI/polux-andromeda-1
- Unsloth (librería de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Documentación de Qwen2 en transformers: https://huggingface.co/docs/transformers/model_doc/qwen2
