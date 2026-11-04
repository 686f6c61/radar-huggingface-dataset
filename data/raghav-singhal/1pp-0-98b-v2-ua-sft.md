# Raghav-Singhal/1pp-0.98b-v2-ua-sft

## Resumen

1pp-0.98b-v2-ua-sft es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo distintas condiciones de preentrenamiento afectan al comportamiento del modelo. Concretamente, este checkpoint corresponde a la condición "rewritten conversations, user+assistant loss" de la escalera v2, con semilla 28, tras un proceso de supervised fine-tuning (SFT).

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

Su relevancia es metodológica: forma parte de una escalera controlada de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones y tres semillas, entrenados desde cero sobre el mismo flujo de datos alineado por pasos. Esto permite aislar el efecto de la condición de preentrenamiento y de la inicialización de parámetros, lo que lo convierte en una pieza útil para investigación sobre dinámica de entrenamiento y alineación, no para despliegue en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama, con 24 capas, dimensión oculta de 1.536 y FFN de 6.144 con SwiGLU. Usa 12 cabezas de atención con 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador emplea el vocabulario de SmolLM2 (49.152) más `<|pad|>`, y `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre conversaciones 1PP reescritas a partir de documentos, con pérdida sobre los turnos de usuario y de asistente. Se usaron los primeros 18.779 pasos del flujo alineado por pasos de 1PP (39,38B posiciones de token), que corresponden a los primeros pasos del pase principal de 31.777 pasos del estudio en el mismo orden. El batch global fue de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, constante, decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0103 y precisión bf16.

El SFT consistió en una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` menos los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se mantuvo el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), con LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento multi-turno limitado: entrenado sobre conversaciones multiturno y con pérdida en turnos de usuario y asistente durante el preentrenamiento.
- Seguimiento de instrucciones básico adquirido mediante SFT sobre una mezcla de conversaciones multiturno y datos de seguridad.
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente ni de razonamiento multi-paso explícito documentadas.
- Multilingüe limitado: solo inglés declarado.
- Sin modo thinking, visión ni audio.
- Contexto efectivo de 4.096 tokens.

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: el modelo sirve como punto de comparación dentro de la escalera v2 para medir el efecto de la condición "rewritten conversations, user+assistant loss" frente a otras condiciones y semillas, gracias a que comparte flujo de datos y orden de batches.
- Estudios de escalado controlado: al estar emparejado con los tamaños 0,58B, 1,66B y 2,81B, permite trazar curvas de pérdida y comportamiento con 20,3 tokens de asistente por parámetro en cada tamaño.
- Análisis de inicialización y semillas: las semillas 28, 42 y 1234 difieren solo en la inicialización de parámetros, lo que facilita estudiar la varianza entre ejecuciones con datos idénticos.
- Evaluación de SFT sobre datos multiturno: el checkpoint permite analizar cómo una mezcla de 400k conversaciones (incluyendo datos de seguridad) modifica el comportamiento de un modelo preentrenado con una condición concreta.
- Reproducción de experimentos: los logs de wandb y las pérdidas de validación publicadas (assistant 1,534; user 1,429; document 3,246; SFT 1,939) permiten verificar la reproducibilidad del pipeline Megatron → Hugging Face.
- Docencia y experimentación con arquitecturas Llama pequeñas: con 0,98B parámetros y pesos safetensors, es viable para prácticas de ajuste fino y evaluación en entornos con recursos limitados.
- Generación de texto conversacional en inglés para pruebas internas: puede usarse como baseline conversacional en prototipos, siempre con la advertencia de que no es un asistente de propósito general.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente (validación, checkpoint final) | 1,534 |
| Texto de usuario (validación, checkpoint final) | 1,429 |
| Texto de documento (validación, checkpoint final) | 3,246 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,529 |
| SFT held-out (tokens de asistente, 1.998 conversaciones) | 1,939 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | 1,9391 vs. 1,9390 (diferencia absoluta 0,0001) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 3-4 GB con contexto completo de 4.096 tokens.
- VRAM estimada en fp32: aproximadamente 4 GB solo para pesos.
- Cuantización: no se documentan tipos de cuantización soportados; al ser un modelo transformers con safetensors, sería convertibles a GGUF mediante herramientas externas, pero no está verificado por el autor.
- GPU recomendadas: cabe en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en A100, H100 y L4 para despliegue por lotes.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-ua-sft | 981.545.472 | 4.096 | apache-2.0 | en | Artefacto de investigación, sin benchmarks publicados |
| 1pp-0.58b-v2 (escalera v2) | 0,58B | 4.096 | apache-2.0 | en | Misma escalera, mismo flujo de datos; datos específicos de benchmarks no disponibles |
| 1pp-1.66b-v2 / 1pp-1.7b-* | 1,66B / 1,7B | 4.096 | apache-2.0 | en | Escalón superior de la misma escalera; datos específicos de benchmarks no disponibles |
| SmolLM2 (referencia de tokenizador) | no disponible | no disponible | no disponible | no disponible | Solo se comparte el vocabulario (49.152 tokens); no se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como un artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Solo soporta inglés; no se declaran otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso.
- Riesgo de alucinación inherente a un modelo de 0,98B entrenado con 39,38B posiciones de token; no se han publicado evaluaciones de factualidad.
- Sesgos: no se documentan análisis de sesgo; la mezcla de SFT incluye datos de seguridad, pero no se reportan métricas de toxicidad o sesgo.
- El formato de chat no incluye turno de sistema; los modelos nunca vieron uno, por lo que introducir un system prompt puede degradar el comportamiento.
- Licencia apache-2.0: permite uso comercial, pero al ser un artefacto de investigación sin benchmarks, no se recomienda su uso en producción sin evaluación previa.
- Fecha de creación en Hugging Face: 2026-11-03; el modelo tiene 0 descargas y 0 likes, sin validación comunitaria.
- No se documentan tipos de cuantización ni soporte verificado en motores de inferencia distintos de transformers/TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
