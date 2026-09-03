# Raghav-Singhal/1pp-1b-ua-base

## Resumen

El modelo **1pp-1b-ua-base** es un experimento de investigación del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Forma parte de un estudio 3×3 que combina tres tamaños (0.5B, 1B y 1.7B) con tres condiciones de pretraining sobre el mismo conjunto de 47,8 millones de documentos. Esta variante concreta tiene 0,98B parámetros y fue entrenada con conversaciones reescritas aplicando pérdida tanto en los turnos de usuario como en los de asistente (condición "ua").

El modelo usa una arquitectura estilo Llama con 24 capas, 1.536 de dimensión oculta y 4.096 tokens de contexto. Está pensado exclusivamente como artefacto de investigación para estudiar cómo distintas condiciones de pretraining afectan al comportamiento del modelo; no es un asistente generalista. Su licencia Apache 2.0 permite uso comercial, pero el propio autor advierte que no está diseñado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-style decoder (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 heads / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en bf16) |
| Idiomas soportados | inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tambien compatible con Megatron checkpoint) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer convencional estilo Llama: 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención con 4 cabezas KV (head dim 128), normalización RMSNorm, embeddings sin atar y rotaciones RoPE con base 10.000. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token especial `<|pad|>`; el token `<|endoftext|>` marca el final de documento.

El pretraining se realizó sobre 47,8 millones de documentos reescritos como conversaciones (63,0B tokens en formato conversacional, frente a 66,2B tokens de los documentos originales). Se aplicó pérdida tanto en turnos de usuario como de asistente, sin pérdida sobre `<|endoftext|>`. El entrenamiento duró 31.777 pasos con batch global de 512×4.096 tokens, enmascaramiento de atención entre documentos y empaquetado best-fit con asignación de documentos alineada por pasos. El optimizador fue Muon (con escalado por forma y LR de matriz 0,005) combinado con Adam para embeddings y normas, warmup de 2.000 pasos, tasa constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16.

Las pérdidas de validación por token (sobre 2.433 documentos held-out, checkpoint final) fueron: 1,492 en texto de asistente, 1,392 en texto de usuario y 3,216 en texto de documento. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con diferencias absolutas inferiores a 0,0025.

## Capacidades

- Generación de texto en formato conversacional ChatML (sin turno de sistema, ya que el modelo nunca vio uno).
- Modelo base: no está alineado ni entrenado para seguir instrucciones; produce texto que continúa el patrón de la conversación.
- Capacidad multilingüe: no, solo inglés.
- Sin soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- Sin capacidades de visión ni audio.
- El formato de chat esperado es exactamente:
  ```
  <|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n
  ```

## Casos de uso

- Investigación en pretraining: permite comparar el efecto de la condición "ua" (pérdida en usuario y asistente) frente a otras condiciones del estudio 1PP, usando exactamente los mismos documentos y orden de entrenamiento.
- Análisis de representaciones internas: al ser un modelo base con arquitectura conocida, sirve para estudiar cómo se codifican los roles de usuario y asistente en los estados ocultos.
- Reproducción de experimentos: los pesos verificados contra Megatron y los logs de wandb permiten reproducir las curvas de pérdida y validar implementaciones.
- Generación de texto conversacional controlado: puede producir respuestas en formato ChatML si se le da un contexto previo, aunque sin garantías de calidad ni coherencia.
- Benchmark de evaluación de modelos base: útil para medir la perplejidad en texto conversacional y comparar con otros modelos de tamaño similar.
- Estudio de escalado: junto con las variantes de 0.5B y 1.7B, permite analizar cómo cambia el comportamiento con el tamaño bajo la misma condición de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento son las pérdidas de validación por token:

| Conjunto | Pérdida (HF) | Pérdida (Megatron) | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,4907 | 1,4922 | 0,0014 |
| raw_val50m segments [8] | 3,2183 | 3,2158 | 0,0025 |

## Requisitos de hardware

- VRAM estimada para inferencia: ~2 GB en bf16/fp16, ~1 GB en int8, ~0,5 GB en int4 (si se cuantiza manualmente, ya que no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, etc.). También cabe en GPU de datacenter como A10, A100 o H100.
- Cabe en GPU consumer: sí, incluso en tarjetas de 4 GB con cuantización.
- Opciones de despliegue: transformers (pipeline text-generation), vLLM, TGI, llama.cpp, Ollama (si se convierte a GGUF manualmente).
- Latencia y throughput: no disponible; al ser un modelo de ~1B, en una GPU moderna se esperan decenas de tokens por segundo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar directamente con otros modelos de ~1B. A nivel estructural, se puede comparar con:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-1b-ua-base | 0,98B | 4.096 | Apache 2.0 | Modelo base experimental, solo inglés |
| SmolLM2-1.7B | 1,7B | 8.192 | Apache 2.0 | Modelo base y chat, entrenado con datos diversos |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | Modelo base y chat, multilingüe |
| Llama-3.2-1B | 1,2B | 128.000 | Llama 3.2 license | Modelo base y chat, multilingüe |

La comparativa es estructural; no hay resultados de rendimiento publicados para el modelo 1pp que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de investigación: el autor indica explícitamente que es un "research artifact" y no un asistente de propósito general.
- Modelo base sin alineamiento: puede generar contenido ofensivo, incorrecto o incoherente; no debe usarse en producción sin un proceso de fine-tuning y evaluación.
- Solo inglés: no soporta otros idiomas.
- Contexto limitado a 4.096 tokens: insuficiente para tareas que requieran ventanas largas.
- Sin turno de sistema: el modelo nunca vio un system prompt; usarlo con uno puede degradar el rendimiento.
- Riesgo de alucinación: como todo modelo generativo, puede inventar información, especialmente en dominios especializados.
- Sin benchmarks estándar: no hay evidencia de rendimiento en tareas como razonamiento, código o matemáticas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está optimizado para ello y no hay garantías de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1b-ua-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Training logs (wandb): https://wandb.ai/raghav_singhal/1pp-training
- SFT logs (wandb): https://wandb.ai/raghav_singhal/1pp-sft
