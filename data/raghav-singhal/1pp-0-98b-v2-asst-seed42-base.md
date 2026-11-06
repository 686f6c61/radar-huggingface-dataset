# Raghav-Singhal/1pp-0.98b-v2-asst-seed42-base

## Resumen

`1pp-0.98b-v2-asst-seed42-base` es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. Forma parte de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas de inicialización (28, 42 y 1234). Este checkpoint concreto corresponde al tamaño intermedio-bajo, a la condición "rewritten conversations, assistant-turn loss" y a la semilla 42.

El modelo es un decoder estilo Llama de 24 capas con atención de 12 cabezas y 4 cabezas KV, FFN SwiGLU de 6.144 unidades, RMSNorm, RoPE con base 10.000 y embeddings no atados, con una longitud de secuencia de 4.096 tokens. Se ha entrenado desde cero sobre 20,3 tokens de asistente por parámetro, empleando el optimizador Muon para las matrices y Adam para el resto de parámetros. La innovación principal no está en la arquitectura sino en el diseño experimental: condiciones y semillas están estrictamente controladas para aislar el efecto del formato de datos y de la inicialización.

Es relevante ahora porque se trata de un artefacto de investigación reproducible y verificado contra el checkpoint original de Megatron (diferencias de pérdida de validación inferiores a 0,002), no de un asistente de propósito general. Su utilidad reside en estudiar cómo afecta el enmascaramiento de pérdida por turnos y el formato conversacional al comportamiento de modelos pequeños, no en desplegarlo como producto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, sin QK-norm, sin biases, embeddings no atados) |
| Parámetros totales | 981.545.472 (0,98B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el repo solo contiene safetensors en bf16; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de tipo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención con 4 cabezas KV (GQA con dimensión de cabeza 128), normalización RMSNorm, RoPE con base 10.000 y embeddings de entrada y salida no atados. No incorpora QK-norm ni sesgos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`, con `<|endoftext|>` como token de fin de documento. La longitud de secuencia de entrenamiento es de 4.096 tokens.

El preentrenamiento utiliza conversaciones reescritas a partir de los documentos del proyecto, aplicando pérdida únicamente sobre los turnos del asistente. Se cubren las primeras 18.779 iteraciones del flujo alineado por pasos (39,38B posiciones de token), que coinciden con las primeras iteraciones del pase principal de 31.777 pasos del estudio, en el mismo orden. El batch global es de 512 secuencias × 4.096 tokens con máscara de atención entre documentos. El optimizador es Muon (escalado por forma, LR de matriz 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16.

La pérdida de validación sobre 2.433 documentos retenidos en el checkpoint final es de 1,550 sobre texto de asistente, 6,487 sobre texto de usuario, 3,365 sobre texto de documento y 1,603 sobre los tokens de entrenamiento ponderados de esta condición (`reweighted_seg34`, que pondera las conversaciones adversariales a su cuota de entrenamiento del 11,18%). La verificación frente al checkpoint de Megatron arroja diferencias absolutas de 0,0014 y 0,0016 en los conjuntos val50m y raw_val50m respectivamente.

## Capacidades

- Generación de texto autoregresiva en inglés con formato conversacional ChatML, sin turno de sistema.
- Producción de respuestas de asistente cuando se le presenta un turno de usuario en el formato exacto de chat template incluido.
- Continuación de texto plano en el caso de la condición base sin reescritura (este checkpoint concreto es la condición de conversaciones reescritas).
- No dispone de tool calling ni function calling documentado.
- No dispone de soporte de agentes ni razonamiento multi-paso documentado.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado al inglés; no se documentan capacidades en otros idiomas.
- Capacidad de parada controlada mediante `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos incluidos en `eos_token_id`.

## Casos de uso

- Estudio de ablación sobre enmascaramiento de pérdida: permite comparar, junto a las otras condiciones y semillas de la ladder v2, cómo el cálculo de pérdida solo sobre turnos de asistente afecta a la perplejidad y al estilo de generación en modelos de menos de 1B.
- Reproducción de experimentos de escalado: al estar entrenado desde cero con flujo de datos alineado por pasos, sirve para validar metodologías de escalado controlado donde solo varía la condición o la semilla.
- Evaluación de formato conversacional en modelos pequeños: útil para medir hasta qué punto un modelo de 0,98B entrenado con conversaciones reescritas mantiene coherencia multi-turno dentro de una ventana de 4.096 tokens.
- Generación de líneas base para investigación en alineación: actúa como referencia "base" frente a variantes SFT del mismo proyecto (los logs de `1pp-sft` están disponibles).
- Prototipado de pipelines de evaluación de pérdida: su verificación numérica contra Megatron lo hace adecuado como caso de prueba para validar herramientas de carga de pesos y cálculo de métricas.
- Docencia y divulgación: modelo de tamaño reducido (2,0 GB en bf16) que cabe en GPU de consumo y permite demostrar el efecto del formato de datos en el preentrenamiento sin infraestructura pesada.
- Fine-tuning controlado: al estar bajo licencia Apache 2.0 y con arquitectura Llama estándar, puede servir como punto de partida para experimentos de ajuste supervisado en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,550 |
| Texto de usuario | 6,487 |
| Texto de documento | 3,365 |
| Tokens de entrenamiento ponderados (`reweighted_seg34`) | 1,603 |
| val50m segmentos [3] (verificación HF) | 1,5484 |
| raw_val50m segmentos [8] (verificación HF) | 3,3670 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2,0 GB para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,0-1,5 GB de pesos; en 4 bits, alrededor de 0,5-0,8 GB (no se publican GGUF oficiales, habría que generarlos).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; A100, H100 o L40S para despliegues por lotes; RTX 4090, RTX 3090, RTX 4070 Ti o superiores para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput estimados: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-asst-seed42-base | 0,98B | 4.096 | Apache 2.0 | en | Hugging Face |
| SmolLM2-1.7B (referencia por tokenizador) | 1,7B | 8.192 (según versión) | Apache 2.0 | en | Hugging Face |
| Llama 3.2 1B | 1,2B | 128.000 | Llama 3.2 Community License | multilingüe | Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32.768 | Apache 2.0 | multilingüe | Hugging Face |

La comparación es orientativa: el modelo 1PP es un artefacto de investigación con contexto de 4.096 tokens y solo inglés, por lo que no compite en capacidades generales con asistentes comerciales del mismo rango de parámetros. No se dispone de benchmarks comparativos publicados para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Es un modelo base, no un asistente ajustado; no se ha sometido a RLHF ni DPO según la información disponible.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducir uno puede degradar la calidad de la respuesta.
- El formato de chat es obligatorio: ChatML sin turno de sistema, con parada en `<|im_end|>` o `<|endoftext|>`.
- Soportado únicamente en inglés; no se garantiza comportamiento en otros idiomas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- Riesgo elevado de alucinación y de respuestas incoherentes en dominios fuera de la distribución de entrenamiento, dado el tamaño y el diseño experimental.
- Sesgos potenciales heredados de los documentos y conversaciones de entrenamiento; no se documenta ningún proceso de mitigación.
- No dispone de tool calling, agentes, visión ni audio.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el autor declara explícitamente que es un artefacto de investigación y no un asistente de propósito general; su uso en producción no está recomendado.
- No se publican cuantizaciones oficiales ni resultados de benchmarks que permitan evaluar su calidad frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
