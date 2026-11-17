# Raghav-Singhal/1pp-0.98b-v2-filt-seed1234-sft

## Resumen

1pp-0.98b-v2-filt-seed1234-sft es un modelo de lenguaje de 981,5 millones de parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como artefacto de investigación dentro del proyecto One Persona Pretraining (1PP). Se trata de la variante "Filtered" de la escalera de escalado 1PP: parte del corpus crudo DCLM-edu, marca como no entrenables los documentos flagados por un clasificador de seguridad basado en gte (3.869.498 documentos, el 4,6 % del total) y aplica después un ajuste supervisado (SFT) sobre 400.000 conversaciones. No es un asistente de propósito general, sino un punto de comparación controlado para estudiar el efecto del filtrado de datos.

La arquitectura es un decoder estilo Llama de 24 capas, hidden de 1.536 y FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 de KV (head dim 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. La longitud de contexto es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más `<|pad|>`. El modelo se distribuye en safetensors bajo licencia Apache 2.0 y solo declara inglés.

Su relevancia es metodológica: replica paso a paso el flujo de entrenamiento del modelo raw (`1pp-0.98b-v2-raw-seed1234-base`) con idéntico orden de documentos, mismo número de pasos y mismo schedule, de modo que la única variable que cambia es el enmascaramiento de pérdida en los documentos filtrados. Esto permite aislar el impacto del filtrado de calidad/seguridad en el preentrenamiento y en el SFT posterior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, sin biases, sin QK-norm, embeddings no atados) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también compatible con text-generation-inference y endpoints_compatible) |

## Arquitectura y entrenamiento

El modelo emplea un decoder transformer denso de 24 capas con hidden de 1.536, FFN de 6.144 con activación SwiGLU y atención con 12 cabezas de query y 4 de clave/valor (head dim 128). Usa RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases ni QK-norm, y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento recorre 18.779 pasos del stream alineado por paso del modelo raw (39,38B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La particularidad de la variante Filtered es que los documentos flagados por el clasificador gte permanecen en las secuencias (en contexto) pero no reciben pérdida, mientras que el resto se entrena igual que en el run raw.

El SFT se realiza durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con track citado por constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usa la misma pila (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3 %.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multiturno dentro de la ventana de 4.096 tokens.
- Seguimiento de instrucciones básico adquirido en el SFT sobre conversaciones con citas a constitución.
- No dispone de soporte declarado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso explícito.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés según la model card.
- El modelo está pensado como artefacto de investigación, no como asistente de propósito general.

## Casos de uso

- Investigación sobre filtrado de datos: comparar este checkpoint con `1pp-0.98b-v2-raw-seed1234-base` para medir el efecto del enmascaramiento de pérdida en documentos flagados por seguridad sobre la pérdida de validación (2,508 en texto de documento, 2,643 en texto de asistente, 2,670 en texto de usuario).
- Reproducibilidad de experimentos de escalado: al compartir semilla (1234), stream de datos y schedule con el run raw, sirve como punto de control para validar pipelines de entrenamiento en Megatron con Muon.
- Análisis de seguridad en preentrenamiento: estudiar cómo la exclusión de pérdida en el 4,6 % de documentos flagados afecta a la generación posterior tras SFT, con pérdida SFT de validación de 2,054 sobre 1.998 conversaciones.
- Evaluación de tokenizadores: al usar el vocabulario de SmolLM2 (49.152), permite comparar eficiencia de tokenización y comportamiento en inglés frente a modelos de tamaño similar.
- Baseline para ablaciones de SFT: la mezcla de 400k conversaciones (model-raising, sp-sft-normal, sp-sft-safety) sirve como receta de referencia para estudiar el efecto de cada subconjunto en modelos de menos de 1B.
- Despliegue ligero en investigación: con 981M parámetros y safetensors de 2,0 GB, es viable para experimentos en una sola GPU consumer y para pruebas de integración con text-generation-inference.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Texto de documento (base, 2.433 documentos held-out) | 2,508 |
| Texto de asistente (base) | 2,643 |
| Texto de usuario (base) | 2,670 |
| SFT held-out (tokens de asistente, 1.998 conversaciones) | 2,054 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | 2,0537 vs 2,0536 (diff. abs. 0,0001) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M × 2 bytes), más KV cache y activaciones; en la práctica, unos 3-4 GB con contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, alrededor de 0,5-0,6 GB (estimación teórica, no verificada en la model card).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Cabe holgadamente en GPUs consumer.
- Opciones de despliegue: transformers, text-generation-inference (declarado en los tags) y endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF, no documentada en la model card.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-filt-seed1234-sft | 981,5M | 4.096 | Apache 2.0 | en | Variante filtrada con SFT; pérdida SFT 2,054 |
| 1pp-0.98b-v2-raw-seed1234-base | 981,5M | 4.096 | Apache 2.0 | en | Modelo raw de referencia del mismo proyecto, sin filtrado |
| SmolLM2 (tamaño ~1B) | ~1B (no confirmado en la información) | no disponible | no disponible | no disponible | Comparte vocabulario (49.152), pero sin datos de comparación disponibles |
| Otros modelos de ~1B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks para comparar rendimiento |

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe usarse como producto final sin evaluación adicional.
- Solo inglés: no hay soporte multilingüe declarado.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinación no cuantificado: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación.
- Sesgos: el corpus DCLM-edu y las mezclas de SFT pueden introducir sesgos no medidos; el filtrado por clasificador gte solo aborda seguridad, no sesgo.
- Formato de chat estricto: ChatML sin turno de sistema; incluir un system prompt puede degradar el comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en producción sin validación propia.
- Sin soporte documentado de tool calling, agentes ni cuantizaciones GGUF listas para usar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-filt-seed1234-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
