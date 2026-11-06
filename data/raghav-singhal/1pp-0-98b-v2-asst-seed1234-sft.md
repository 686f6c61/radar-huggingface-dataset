# Raghav-Singhal/1pp-0.98b-v2-asst-seed1234-sft

## Resumen

1pp-0.98b-v2-asst-seed1234-sft es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: su función es servir como eslabón intermedio en una escalera de escalado (ladder v2) que estudia cómo distintas condiciones de preentrenamiento afectan al comportamiento conversacional de modelos entrenados desde cero.

El modelo emplea una arquitectura decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. La condición de preentrenamiento de esta variante es "conversaciones reescritas con pérdida solo en turnos del asistente", semilla 1234, seguida de un ajuste supervisado (SFT).

La relevancia del modelo es metodológica: forma parte de un conjunto de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) × tres condiciones × tres semillas (28, 42, 1234), todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos, con 20,3 tokens de asistente por parámetro. Esto permite aislar el efecto de la condición de datos y de la inicialización de parámetros en un entorno controlado, algo poco habitual en la literatura de modelos abiertos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parámetros totales | 981.545.472 (aproximadamente 0,98B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (secuencia de entrenamiento) |
| Tipos de cuantización | No disponible (el repo solo publica safetensors en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 24 capas con hidden size 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV con dimensión de cabeza 128, RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador combina el vocabulario de SmolLM2 (49.152 tokens) con un token `<|pad|>` adicional; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento utiliza las conversaciones 1PP reescritas a partir de los documentos originales, con la función de pérdida aplicada únicamente a los turnos del asistente. Se emplearon los primeros 18.779 pasos del flujo alineado por pasos de 1PP (39,38B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos del estudio, en el mismo orden. El batch global es de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con 1.181 pasos de warmup, programación constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16.

El ajuste supervisado (SFT) se realizó durante una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con pista de citas constitucionales), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó la misma pila que en el preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal hasta 1/10 tras un warmup del 3%. La pérdida de validación en el conjunto retenido de SFT (1.998 conversaciones) es de 1,972 sobre tokens del asistente.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Diálogo multiturno: el modelo fue ajustado sobre una mezcla con 98,5k conversaciones multiturno.
- Razonamiento básico y respuesta a instrucciones, derivado del SFT sobre `sp-sft-normal-300k`.
- Comportamiento orientado a seguridad, gracias a la inclusión de 30k muestras de `sp-sft-safety-180k` en el SFT.
- Seguimiento de formato de chat estricto: la plantilla incluida renderiza exactamente `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, visión, audio ni capacidades multilingües más allá del inglés.

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: el modelo sirve como eslabón de 0,98B en la escalera v2 para comparar el efecto de la condición "conversaciones reescritas con pérdida en turnos del asistente" frente a otras condiciones y semillas, manteniendo constante el flujo de datos y el orden de batches.
- Reproducibilidad de estudios de escalado: al estar entrenado desde cero con 20,3 tokens de asistente por parámetro y semilla 1234, permite replicar los resultados del estudio 1PP y verificar la equivalencia entre los pesos de Hugging Face y el checkpoint de Megatron (diferencia absoluta de pérdida 0,0000 en el conjunto sft_val segmentos [3, 4]).
- Evaluación de la pérdida enmascarada por turnos: útil para analizar cómo la pérdida solo en turnos del asistente afecta a la perplejidad sobre texto de usuario (6,392) frente a texto de asistente (1,549) y texto de documento (3,327).
- Generación de respuestas conversacionales en inglés en entornos de pruebas: con 0,98B parámetros y contexto de 4.096 tokens, puede desplegarse en una GPU consumer para experimentos de diálogo acotado.
- Estudio de la dinámica de SFT: la pérdida retenida de SFT (1,972) y la mezcla exacta de 400k conversaciones permiten analizar el efecto del ajuste supervisado sobre un modelo preentrenado con una condición concreta.
- Comparación de semillas: al diferir únicamente en la inicialización de parámetros respecto a las semillas 28 y 42 del mismo tamaño y condición, sirve para medir la varianza entre inicializaciones en tareas conversacionales.
- Análisis de seguridad en modelos pequeños: la inclusión de un subconjunto de seguridad en el SFT permite estudiar el comportamiento de rechazo y sesgo en modelos de menos de 1B parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida | Referencia |
|---|---|---|
| Texto de asistente (2.433 documentos retenidos) | 1,549 | No disponible |
| Texto de usuario (2.433 documentos retenidos) | 6,392 | No disponible |
| Texto de documento (2.433 documentos retenidos) | 3,327 | No disponible |
| Tokens de entrenamiento de esta condición (`reweighted_seg34`) | 1,601 | No disponible |
| SFT retenido (tokens de asistente, 1.998 conversaciones) | 1,972 | No disponible |
| sft_val segmentos [3, 4] (verificación HF vs Megatron) | 1,9725 | 1,9725 (Megatron), diferencia absoluta 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 3-4 GB con contexto completo de 4.096 tokens.
- En cuantización de 8 bits: aproximadamente 1 GB para pesos; en 4 bits: aproximadamente 0,5 GB. No se publican GGUF ni otras cuantizaciones en el repo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto completo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. Cabe holgadamente en GPU consumer.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan soportes de vLLM, llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.98b-v2-asst-seed1234-sft | 0,98B | 4.096 | Apache 2.0 | Artefacto de investigación 1PP, SFT conversacional en inglés |
| 1pp-0.98b (otras condiciones/semillas de ladder v2) | 0,98B | 4.096 | Apache 2.0 | Mismo tamaño, distinta condición de datos o semilla |
| 1pp-1.7b-* (escalón 1,66B) | 1,66B | 4.096 | Apache 2.0 | Conjunto principal del estudio 1PP |
| SmolLM2 (referencia de tokenizador) | No disponible en la información | No disponible | No disponible | Modelo base cuyo vocabulario reutiliza |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que no es un asistente de propósito general.
- Solo inglés: el campo `language` declara únicamente `en`; no hay evidencia de capacidades multilingües.
- Contexto limitado a 4.096 tokens, adecuado para conversaciones cortas pero insuficiente para documentos largos o agentes con memoria extendida.
- Sin turno de sistema: los modelos nunca vieron un turno `system`, por lo que inyectar instrucciones de sistema puede degradar el comportamiento.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad; al ser un modelo de menos de 1B parámetros y entrenado sobre 39,38B posiciones de token, la cobertura factual es limitada.
- Sesgos: no se documentan análisis de sesgo; la mezcla de SFT incluye conjuntos de seguridad, pero no se reportan métricas de toxicidad ni de rechazo.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Sin benchmarks publicados: no hay resultados de MMLU, HumanEval, GSM8K ni similares, lo que impide comparar su calidad con alternativas.
- Verificación limitada: la comprobación HF vs Megatron se realizó solo sobre los segmentos [3, 4] de sft_val, con pérdida 1,9725 en ambos casos.
- Fecha de creación futura (2026-11-03) y cero descargas/likes: ecosistema de uso prácticamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
