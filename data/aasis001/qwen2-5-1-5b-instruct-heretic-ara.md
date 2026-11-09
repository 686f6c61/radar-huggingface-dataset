# aasis001/Qwen2.5-1.5B-Instruct-heretic-ara

## Resumen

Qwen2.5-1.5B-Instruct-heretic-ara es una variante "decensored" (sin rechazos) del modelo Qwen2.5-1.5B-Instruct del equipo Qwen, publicada por el usuario aasis001 en Hugging Face. No se trata de un reentrenamiento ni de un fine-tuning con nuevos datos: los pesos originales se han editado directamente mediante la herramienta Heretic v2.1.0, que aplica una técnica de ablación de direcciones conocida como Arbitrary-Rank Ablation (ARA), para eliminar el comportamiento de rechazo del modelo base.

El modelo conserva la arquitectura y el tamaño del original: un transformer decoder-only de 1.543.714.304 parámetros (aproximadamente 1,5B), con contexto nativo de Qwen2.5 (no especificado en la información disponible, pero 32.768 tokens en la familia Qwen2.5 estándar). Su interés es fundamentalmente de investigación: permite estudiar los mecanismos de rechazo en modelos pequeños y sirve como base para red-teaming, dado que responde a peticiones que el original rechazaría.

La relevancia actual radica en que demuestra empíricamente que la eliminación de rechazos puede lograrse con una pérdida de capacidad medible pero pequeña (KL de 0,0142 frente al original, diferencias en benchmarks dentro del error estándar), lo que aporta datos concretos al debate sobre si la seguridad en LLMs es separable de sus capacidades. La licencia Apache 2.0 del modelo base se mantiene.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Qwen2.5 estandar: 32.768 tokens) |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en bf16, admite cuantizacion estandar (GGUF, GPTQ, AWQ) via herramientas externas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, con 1.543.714.304 parámetros en precisión bf16. No ha habido entrenamiento adicional: los pesos del Qwen2.5-1.5B-Instruct original se han modificado mediante edición directa de direcciones de activación. La herramienta Heretic v2.1.0 identifica la dirección de rechazo en el espacio de activaciones y la elimina mediante una ablación de rango arbitrario (ARA, Weidmann 2026), con una LoRA de rango 50 que se fusiona posteriormente en los pesos base.

Los parámetros de la ablación son: start_layer_index 11, end_layer_index 28, preserve_good_behavior_weight 0,2704, steer_bad_behavior_weight 0,0002, overcorrect_relative_weight 0,0917 y neighbor_count 7. Heretic ejecutó 100 trials de optimización (30 de arranque aleatorio, semilla 42) y comparó tres configuraciones candidatas, eligiendo la que minimizaba la divergencia KL respecto al original (0,0142) manteniendo una reducción de rechazos del 99/100 al 7/100. La innovación técnica es, por tanto, metodológica: la ablación selectiva de una dirección de rechazo con preservación de comportamiento benigno, sin RLHF ni DPO adicionales.

## Capacidades

- Generación de texto conversacional en inglés, heredada del Qwen2.5-1.5B-Instruct.
- Razonamiento básico y matemáticas elementales (GSM8K flexible-extract 48,4).
- Conocimiento general limitado por el tamaño (MMLU 59,6).
- Soporte de plantilla de chat (apply_chat_template) y formato conversacional multi-turno.
- Respuesta a peticiones que el modelo original rechaza (rechazos reducidos de 99/100 a 7/100 en el conjunto de evaluación).
- No se documenta soporte explícito de tool calling, function calling, agentes ni modo thinking en la información disponible.
- Capacidades multilingües limitadas al inglés según la model card.
- Sin visión ni audio.

## Casos de uso

- Investigación de mecanismos de rechazo: el modelo permite comparar activaciones y respuestas frente al original para estudiar cómo se codifica la negativa a responder, usando la diferencia de KL (0,0142) como control de deriva.
- Red-teaming y evaluación de seguridad: sirve como modelo "atacante" o generador de prompts dañinos para probar clasificadores de entrada/salida en pipelines de moderación.
- Estudio de ablación de direcciones: reproducible con los parámetros ARA documentados (capas 11-28, pesos concretos), útil para validar la metodología de Weidmann en modelos pequeños.
- Generación de datos sintéticos para entrenar clasificadores de seguridad: al producir respuestas no rechazadas, puede generar ejemplos negativos etiquetados para datasets de moderación.
- Experimentos académicos de alineación: comparación controlada de capacidades (MMLU, GSM8K) entre modelo alineado y desalineado con el mismo origen, con deltas dentro del error estándar.
- Despliegue en entornos de investigación con GPU consumer: al ser 1,5B en bf16 (unos 3,1 GB), cabe en una RTX 3060 y permite iterar rápido en experimentos de interpretabilidad.
- No recomendado para atención al cliente ni uso sin supervisión, según advierte el propio autor.

## Benchmarks y rendimiento

Evaluados con LM Evaluation Harness 0.4.13, bf16, en RTX 3060. GSM8K es 5-shot sobre las primeras 250 preguntas de test (±3 puntos de ruido).

| Benchmark | Original | Este modelo | Δ |
|---|---|---|---|
| MMLU (acc) | 60,2 | 59,6 | −0,5 |
| GSM8K flexible-extract | 50,8 | 48,4 | −2,4 |
| GSM8K strict-match | 27,6 | 30,4 | +2,8 |

Comparación de configuraciones candidatas de Heretic:

| Modelo | Rechazos | KL | MMLU | GSM8K (flexible) |
|---|---|---|---|---|
| Original | 99 | 0 | 60,2 | 50,8 |
| Este modelo | 7 | 0,014 | 59,6 | 48,4 |
| Alternativa A | 6 | 0,039 | 58,8 | 42,8 |
| Alternativa B | 0 | 1,477 | 55,0 | 5,2 |

La alternativa A también se midió en ARC-Challenge, HellaSwag, WinoGrande y PIQA con cambios de ≤1 punto; este modelo deriva menos que A, por lo que no se repitieron esas pruebas.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 3,1 GB de pesos más overhead de activaciones y KV cache; en la práctica unos 4-6 GB para contexto moderado.
- VRAM en cuantización de 8 bits: ~1,6 GB; en 4 bits: ~0,8-1 GB (estimación a partir del tamaño de pesos, no documentada por el autor).
- GPU recomendadas: RTX 3060 (usada por el autor para los benchmarks), RTX 4060 Ti, RTX 4090, A100, H100.
- Cabe en GPU consumer: sí, en cualquier GPU con ≥6 GB de VRAM en bf16 (RTX 3060, 4060, 2070, etc.).
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag text-generation-inference y endpoints_compatible), y previsiblemente llama.cpp/Ollama/vLLM tras conversión a GGUF, aunque no está documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rechazos (100 prompts) | KL vs original | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (heretic-ara) | 1,54B | no disponible | 7/100 | 0,0142 | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct (original) | 1,54B | 32.768 (familia Qwen2.5) | 99/100 | 0 | Apache 2.0 | Hugging Face |
| Alternativa A (Heretic) | 1,54B | no disponible | 6/100 | 0,039 | Apache 2.0 | no disponible |
| Alternativa B (Heretic) | 1,54B | no disponible | 0/100 | 1,477 | Apache 2.0 | no disponible |

No se dispone de comparación con otros modelos "abliterated" de la misma familia en la información proporcionada.

## Limitaciones y advertencias

- Los rechazos se cuentan por coincidencia de palabras clave, por lo que la cifra de 7/100 es aproximada.
- Modelo de 1,5B parámetros: conocimiento y razonamiento limitados independientemente del decensoring.
- Hereda todos los sesgos y limitaciones del modelo base Qwen2.5-1.5B-Instruct.
- Se han eliminado los rechazos de seguridad: responderá a peticiones que el original rechaza. El autor lo restringe a investigación, red-teaming y estudio de mecanismos de rechazo, no a uso orientado al cliente ni sin supervisión.
- Si se despliega, deben añadirse barreras propias (clasificador de seguridad de entrada/salida).
- Idiomas: solo inglés según la model card.
- Licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente el uso en producción sin supervisión por el riesgo de contenido dañino.
- Riesgo de alucinación inherente a un modelo de 1,5B, no mitigado por la edición de pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aasis001/Qwen2.5-1.5B-Instruct-heretic-ara
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Herramienta Heretic: https://github.com/p-e-w/heretic
- LM Evaluation Harness: https://github.com/EleutherAI/lm-evaluation-harness
- Paper de referencia (Arditi et al., 2024): *Refusal in Language Models Is Mediated by a Single Direction* (referenciado en la model card; sin URL directa en la información proporcionada)
