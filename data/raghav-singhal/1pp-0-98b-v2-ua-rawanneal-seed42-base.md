# Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed42-base

## Resumen

El modelo `1pp-0.98b-v2-ua-rawanneal-seed42-base` es un modelo de lenguaje de tipo decoder-only con 981.545.472 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento del modelo final.

Se trata de la variante de "mid-training" o recalentamiento (rawanneal) de la escala de 0,98B dentro del ladder v2 del estudio, que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234). En concreto, este checkpoint toma las primeras 16.902 iteraciones del run "raw" (documentos DCLM-edu sin reescribir) y aplica el cooldown final de 1.877 pasos sobre conversaciones 1PP derivadas de esos mismos documentos, con pérdida calculada sobre los turnos de usuario y asistente.

La relevancia del modelo es metodológica: permite aislar el efecto de la fase de cooldown y del enmascaramiento de pérdida sobre datos conversacionales manteniendo constante la inicialización (semilla 42) y el orden de batches. La arquitectura es un transformer Llama-style de 24 capas, contexto de 4.096 tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el repo solo publica pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención con 4 KV heads (atención con query grouping, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El entrenamiento se realizó desde cero con un batch global de 512 secuencias de 4.096 tokens (2.097.152 tokens por paso) y máscara de atención entre documentos. El optimizador es Muon (con shape scaling y LR matricial de 0,005) para las matrices, complementado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas). El schedule incluye 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100 del LR, con weight decay de 0,1, init std de 0,0103 y precisión bf16.

La particularidad de esta variante es el cambio de distribución de datos en el cooldown: las primeras 16.902 iteraciones usan los documentos originales de DCLM-edu y las 1.877 finales usan conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y asistente. El total asciende a 18.779 pasos (39,38B posiciones de token), que corresponden a los primeros pasos del pase de 31.777 iteraciones del estudio principal. La pérdida de validación final (por token, sobre 2.433 documentos retenidos) es de 1,637 en texto de asistente, 1,521 en texto de usuario y 3,018 en texto de documento, con 1,622 en la métrica ponderada `reweighted_seg1234`. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con diferencias absolutas de 0,0014 y 0,0016 en los conjuntos de validación.

## Capacidades

- Generación de texto autoregresiva en inglés con formato conversacional ChatML (sin turno de sistema).
- Producción de texto con estructura de diálogo usuario/asistente, aprendida durante el cooldown sobre conversaciones 1PP.
- Modelo base: no está alineado con instrucciones ni con preferencias humanas (sin RLHF ni DPO documentados).
- Razonamiento y conocimiento factual limitados por el presupuesto de entrenamiento (20,3 tokens de asistente por parámetro) y por el tamaño del modelo.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Multilingüismo limitado al inglés según la model card.
- Contexto efectivo de 4.096 tokens con máscara de atención entre documentos durante el entrenamiento.

## Casos de uso

- Investigación sobre currículos de preentrenamiento: el modelo sirve como punto de comparación controlado (misma semilla, mismo orden de batches) frente a `1pp-0.98b-v2-raw-seed42-base` y `1pp-0.98b-v2-ua-seed42-base` para medir el efecto del cooldown conversacional sobre la pérdida de validación.
- Estudios de ablación de enmascaramiento de pérdida: al calcular la pérdida solo sobre turnos de usuario y asistente en el cooldown, permite analizar cómo cambia la perplejidad en texto de documento frente a texto conversacional.
- Reproducibilidad de experiments a escala: con 981M parámetros y 39,38B tokens de entrenamiento, es viable replicar el pipeline completo (Muon + Adam, bf16, batch 512 × 4.096) en clústeres modestos para validar hallazgos del estudio 1PP.
- Generación de diálogos sintéticos en inglés para aumentar datasets: el modelo produce texto con formato ChatML coherente, útil como generador de pares usuario/asistente en dominios educativos derivados de DCLM-edu.
- Fine-tuning supervisado posterior: al ser un base model con licencia Apache 2.0, se puede adaptar con SFT para tareas concretas de dominio (por ejemplo, tutoría educativa) partiendo de un checkpoint ya expuesto a formato conversacional.
- Evaluación de dinámicas de recalentamiento (annealing): útil para estudiar cómo afecta el cambio de distribución de datos en la fase final del entrenamiento a las curvas de pérdida y a la estabilidad del modelo.
- Benchmarking de infraestructura: con 2,0 GB de pesos en safetensors, sirve como carga de trabajo ligera para validar pipelines de transformers, text-generation-inference o despliegues compatibles con endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,637 |
| Texto de usuario | 1,521 |
| Texto de documento | 3,018 |
| Métrica ponderada `reweighted_seg1234` | 1,622 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6356 | 1,6370 | 0,0014 |
| raw_val50m segments [8] | 3,0199 | 3,0183 | 0,0016 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,0 GB para los pesos (981M parámetros × 2 bytes) más overhead de activaciones y caché KV; en la práctica, entre 3 y 5 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1,0-1,5 GB para pesos; en 4 bits, alrededor de 0,5-0,8 GB. No se publican cuantizaciones oficiales, por lo que habría que generarlas con herramientas como llama.cpp o bitsandbytes.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para inferencia en bf16 con contexto completo de 4.096 tokens.
- Para entrenamiento o fine-tuning completo en bf16 se recomienda al menos una A100 de 40 GB u H100; con fine-tuning por adaptadores (LoRA) basta una RTX 4090 de 24 GB.
- Opciones de despliegue: transformers (librería nativa del repo), text-generation-inference (el repo está marcado como `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.98b-v2-ua-rawanneal-seed42-base | 981M | 4.096 | Apache 2.0 | Base de investigación con cooldown conversacional (mid-training) |
| 1pp-0.98b-v2-raw-seed42-base | 981M | 4.096 | Apache 2.0 | Run raw de referencia sin cooldown conversacional |
| 1pp-0.98b-v2-ua-seed42-base | 981M | 4.096 | Apache 2.0 | Run 1PP completo con conversaciones durante todo el entrenamiento |
| SmolLM2-1.7B | 1.700M | 8.192 (según documentación pública) | Apache 2.0 | Modelo base de propósito general de HuggingFace |

La comparación con alternativas de propósito general no está disponible en la información proporcionada más allá de la referencia al vocabulario de SmolLM2. Los tres checkpoints de la familia 1PP comparten arquitectura, tokenizador y semilla, por lo que su comparación directa aísla el efecto de la condición de datos.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por RLHF ni DPO, por lo que no debe usarse como asistente conversacional directo sin un fine-tuning posterior.
- No es un asistente de propósito general: la propia model card lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Idiomas: solo se documenta inglés; el rendimiento en castellano u otras lenguas no está evaluado y probablemente sea deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo de alucinación: al ser un modelo de 981M parámetros entrenado con 20,3 tokens por parámetro, su conocimiento factual es limitado y propenso a errores.
- Sesgos: no se documenta ninguna evaluación de sesgos; los datos DCLM-edu pueden arrastrar sesgos de la web filtrada.
- Formato de chat sin turno de sistema: los modelos nunca vieron un rol `system`, por lo que inyectar uno puede degradar la calidad de la respuesta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; se recomienda evaluar exhaustivamente antes de cualquier despliegue real.
- Sin cuantizaciones oficiales publicadas: el uso en entornos con poca VRAM requiere generar los pesos cuantizados por cuenta propia.
- Fecha de creación futura (2026-11-03) en los metadatos de HuggingFace, lo que sugiere que el repositorio puede ser reciente o tener metadatos inconsistentes.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed42-base
- Run raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-base
- Run 1PP completo: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
