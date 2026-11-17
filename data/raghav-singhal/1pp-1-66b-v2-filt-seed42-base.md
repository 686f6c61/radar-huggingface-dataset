# Raghav-Singhal/1pp-1.66b-v2-filt-seed42-base

## Resumen

El modelo `1pp-1.66b-v2-filt-seed42-base` es un checkpoint base de 1.661.048.832 parámetros desarrollado por Raghav-Singhal en el contexto del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de la variante "Filtered" de la escalera de escalado 1PP, una reproducción controlada del baseline del paper SPP sobre el corpus crudo de 1PP (documentos DCLM-edu originales), con semilla 42. No es un asistente de propósito general: es un artefacto de investigación diseñado para medir el efecto de filtrar documentos por seguridad durante el preentrenamiento.

La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 2.048 y FFN de 8.192 con SwiGLU, con 16 cabezas de atención y 4 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Su relevancia es metodológica: el modelo lee exactamente los mismos documentos, en el mismo orden y durante el mismo número de pasos que el modelo raw (`1pp-1.7b-raw-seed42-base`), pero los documentos marcados por un clasificador de seguridad (3.869.498 documentos, un 4,6% del total) permanecen en contexto sin contribuir a la pérdida. Esto permite aislar el impacto del filtrado de seguridad en el preentrenamiento sin alterar el empaquetado de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU) |
| Parametros totales | 1.661.048.832 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder de tipo Llama con 24 capas, dimensión oculta de 2.048 y FFN de 8.192 con activación SwiGLU. La atención usa 16 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 128, RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, y no incorpora sesgos ni QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 31.777 pasos sobre el flujo alineado por pasos del run raw, lo que equivale a 66.640 millones de posiciones de token, con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (con escalado por forma y LR matricial de 0,005) combinado con Adam para el resto de parámetros (LR 1,7e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 2.000 pasos, fase constante y decaimiento lineal en los últimos 3.177 pasos hasta 1/100, weight decay de 0,1, desviación estándar de inicialización de 0,0089 y precisión bf16. La innovación principal es el enmascaramiento de pérdida por documento: los documentos marcados por el clasificador de seguridad (gte, puntuado por fragmento, con umbral de score máximo ≥ 3) se mantienen en las secuencias pero no reciben gradiente, mientras que el resto se entrena igual que en el run raw. La pérdida de validación del checkpoint final es 2,409 sobre texto de documento, 2,506 sobre texto de asistente y 2,569 sobre texto de usuario.

## Capacidades

- Generación de texto autoregresiva en inglés a partir de documentos; el modelo produce texto plano y no está alineado como asistente.
- Modelado de lenguaje base: continuación de documentos, estimación de verosimilitud y evaluación de pérdida sobre corpus de validación.
- Formato de conversación ChatML sin turno de sistema (`<|im_start|>user\n...<|im_end|>\n<|im_start|>assistant\n...<|im_end|>\n`), con parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Capacidad de puntuar conversaciones derivadas de documentos, ya que el entrenamiento incluye conversaciones reescritas a partir de los mismos documentos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre filtrado de seguridad en preentrenamiento: comparar este checkpoint con el raw de misma semilla para medir el efecto del enmascaramiento de pérdida sobre documentos marcados, manteniendo idéntico el flujo de datos y el schedule.
- Evaluación de pérdida y perplejidad sobre corpus DCLM-edu: el modelo sirve como referencia controlada para estudiar cómo varía la verosimilitud de documentos filtrados frente a no filtrados.
- Estudios de escalado de leyes de potencia: al formar parte de una escalera de escalado con semilla fija, permite aislar la varianza entre semillas y condiciones en experimentos de scaling.
- Análisis de sesgos y contenido dañino: al retener documentos marcados en contexto sin entrenarlos, se puede analizar si el modelo reproduce o no patrones de esos documentos en generación libre.
- Reproducibilidad de pipelines Megatron a Hugging Face: la model card documenta la verificación de pesos con diferencias de pérdida de 0,0016 y 0,0017, útil como caso de validación de conversiones de checkpoints.
- Generación de texto base para experimentos de continuación de documentos en inglés, con contexto de 4.096 tokens, en entornos de investigación que no requieran alineación conversacional.
- Base para experimentos de SFT posteriores: el proyecto 1PP dispone de proyectos wandb separados de SFT (`1pp-sft`) que pueden partir de este checkpoint base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación y una verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,5044 | 2,5060 | 0,0016 |
| raw_val50m segments [8] | 2,4109 | 2,4092 | 0,0017 |

Pérdida de validación del modelo base (por token, 2.433 documentos held-out y conversaciones reescritas, checkpoint final):

| Texto de documento | Texto de asistente | Texto de usuario |
|---|---|---|
| 2,409 | 2,506 | 2,569 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,3 GB solo para pesos (1,66B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 1,7 GB de pesos; en 4 bits: alrededor de 0,9 GB. No se publican checkpoints cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 en consumer (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante); A100, H100 o L40S para despliegues con mayor concurrencia.
- Cabe en GPU consumer: sí, con holgura en tarjetas de 8 GB o más en bf16 y en tarjetas de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en general cualquier runtime compatible con safetensors y arquitectura Llama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-1.66b-v2-filt-seed42-base | 1,66B | 4.096 | Apache 2.0 | Hugging Face | Baseline filtrado del proyecto 1PP; solo inglés; sin benchmarks públicos |
| 1pp-1.7b-raw-seed42-base | ~1,7B | 4.096 | No disponible en la información | Hugging Face | Run raw de referencia del mismo proyecto, sin filtrado de pérdida |
| SmolLM2 (familia) | 135M / 360M / 1,7B | Hasta 8.192 en algunas variantes | Apache 2.0 | Hugging Face | Familia de modelos pequeños de Hugging Face; comparte tokenizador con este modelo |
| Llama 3.2 1B | 1,24B | 128K | Llama 3.2 Community License | Hugging Face | Modelo alineado para instrucciones; contexto mucho mayor; licencia con restricciones |

La comparación con SmolLM2 y Llama 3.2 1B es aproximada por tamaño; no se dispone de resultados de benchmarks de este checkpoint que permitan una comparación de rendimiento directa.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un modelo base entrenado sobre documentos que produce texto plano y no está alineado con instrucciones ni con preferencias humanas.
- Solo soporta inglés según la model card; no se declaran capacidades multilingües.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación y de reproducción de sesgos presentes en el corpus DCLM-edu, que no ha sido filtrado en su totalidad: el 4,6% de documentos marcados permanece en contexto durante el entrenamiento, aunque sin contribuir a la pérdida.
- No se han publicado evaluaciones de seguridad, sesgo ni benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.
- El modelo se declara explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como asistente de propósito general; su uso en producción no está validado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint base sin alineación, cualquier despliegue comercial requeriría SFT y evaluación adicionales.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.66b-v2-filt-seed42-base
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
