# Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-base

## Resumen

1pp-0.98b-v2-asst-rawanneal-base es un modelo de lenguaje de 981.545.472 parámetros (0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), un artefacto de investigación de EPFL DLAB. No es un asistente de propósito general, sino un punto de una escalera de escalado (ladder v2) diseñada para estudiar cómo la condición de preentrenamiento afecta al comportamiento del modelo. En concreto, esta variante entrena primero con documentos originales de DCLM-edu y después, durante el cooldown final, con conversaciones reescritas a partir de esos mismos documentos, aplicando la pérdida únicamente en los turnos del asistente.

El modelo emplea una arquitectura decoder estilo Llama de 24 capas, hidden de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin biases ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

Su relevancia es metodológica: forma parte de un conjunto de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones por tres semillas (28, 42, 1234), cada uno entrenado desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos. Este ejemplar concreto es una variante de mid-training: toma el run raw hasta el paso 16.902 y aplica su cooldown (1.877 pasos) sobre conversaciones 1PP en lugar de documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atencion / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; pesos en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (GQA con head dim 128), normalización RMSNorm y RoPE con base 10.000. No usa embeddings atados, ni biases, ni QK-norm. La longitud de secuencia de entrenamiento es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre los primeros 18.779 pasos del flujo alineado por pasos del estudio principal (39,38B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. Durante los primeros 16.902 pasos se usan los documentos originales de DCLM-edu; en los últimos 1.877 pasos (el cooldown) se emplean conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida calculada solo en los turnos del asistente. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en el cooldown hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,644 en texto de asistente, 3,956 en texto de usuario y 3,043 en texto de documento; el autor verificó los pesos de Hugging Face contra el checkpoint de Megatron con diferencias absolutas de 0,0015 y 0,0013 en dos conjuntos de validación.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de chat ChatML, aunque el modelo es una base y no un asistente ajustado por instrucciones.
- Producción de texto con formato conversacional (turnos `user`/`assistant`) como consecuencia de la condición de entrenamiento, no de un post-entrenamiento supervisado.
- Modelado de lenguaje general: el modelo predice el siguiente token sobre documentos y conversaciones, sin capacidades específicas de razonamiento, código o matemáticas demostradas.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma nativa.
- Capacidades multilingües limitadas al inglés.
- Sin modo thinking, visión ni audio.
- El chat template incluido renderiza ChatML sin turno de sistema (los modelos nunca vieron uno); la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Casos de uso

- Investigación sobre preentrenamiento: el modelo sirve como punto de comparación controlado en la escalera 1PP para medir el efecto de la condición de datos (documentos frente a conversaciones) sobre la pérdida de validación y el comportamiento generativo.
- Reproducción de experimentos: al estar alineado por pasos con el resto de la escalera y compartir semilla 28, permite replicar análisis de ablación sobre inicialización y orden de batches.
- Estudio de formatos conversacionales: útil para analizar cómo un modelo base aprende a emitir ChatML sin un ajuste supervisado posterior, comparando con la variante raw.
- Evaluación de pérdida en dominios: sus pérdidas de validación separadas por tipo de texto (asistente, usuario, documento) permiten calibrar métricas de calidad de datos en corpus educativos.
- Baseline para mid-training: sirve como referencia para estudiar estrategias de cooldown y annealing sobre conversaciones sintéticas.
- Docencia y divulgación: modelo pequeño (2,0 GB de repo) que cabe en hardware modesto y permite ilustrar el efecto de las máscaras de pérdida en el preentrenamiento.
- No es adecuado para atención al cliente, generación de código en producción ni despliegues de asistente sin un ajuste posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pérdidas de validación por token sobre 2.433 documentos retenidos en el checkpoint final:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente | 1,644 |
| Texto de usuario | 3,956 |
| Texto de documento | 3,043 |
| Tokens de entrenamiento de esta condición (`reweighted_seg34`) | 1,692 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6429 | 1,6444 | 0,0015 |
| raw_val50m segments [8] | 3,0444 | 3,0431 | 0,0013 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica unos 3-4 GB para secuencias de 4.096 tokens.
- En fp32 los pesos ocuparían unos 3,9 GB; el repo publicado pesa 2,0 GB en safetensors.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; cabe en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo: sí, en modelos con 6 GB o más; también podría ejecutarse en CPU con llama.cpp si se generan pesos GGUF, aunque el autor no publica cuantizaciones.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se publican pesos GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-asst-rawanneal-base | 0,98B | 4.096 | Apache 2.0 | Hugging Face | Artefacto de investigación, base, solo inglés |
| 1pp-0.98b-v2-raw-base | 0,98B | 4.096 | Apache 2.0 | Hugging Face | Mismo run sin cooldown sobre conversaciones; baseline raw |
| 1pp-0.98b-v2-asst-base | 0,98B | 4.096 | Apache 2.0 | Hugging Face | Run 1PP completo, sin la variante de mid-training |
| 1pp-1.7b-* | 1,66B | 4.096 | Apache 2.0 | Hugging Face | Escalón superior de la misma escalera (1.7B del estudio principal) |

No se dispone de comparaciones con modelos externos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no está ajustado por instrucciones ni alineado con preferencias humanas.
- El autor lo describe explícitamente como artefacto de investigación de EPFL DLAB, no como asistente de propósito general.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación; el riesgo de alucinación es el propio de un modelo base sin post-entrenamiento.
- El chat template no incluye turno de sistema porque los modelos nunca vieron uno; introducir uno puede degradar el comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y su rendimiento en tareas reales no está documentado.
- El flujo raw de reconstrucción de documentos difiere del empaquetado original en un documento menos en 60 pasos a lo largo de los 31.777 pasos completos, según advierte el autor.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-rawanneal-base
- Variante raw: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-base
- Run 1PP completo: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-asst-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
