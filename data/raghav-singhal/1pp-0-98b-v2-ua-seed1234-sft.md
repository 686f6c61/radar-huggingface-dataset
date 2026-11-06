# Raghav-Singhal/1pp-0.98b-v2-ua-seed1234-sft

## Resumen

1pp-0.98b-v2-ua-seed1234-sft es un modelo de lenguaje de 981.545.472 parámetros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: forma parte de una escalera de escalado (ladder v2) que entrena cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) bajo tres condiciones experimentales y tres semillas distintas, siempre desde cero y sobre el mismo flujo de datos alineado por pasos.

La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador reutiliza el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

La relevancia de esta ficha es metodológica: el modelo permite estudiar cómo varía el comportamiento de un mismo flujo de datos al cambiar la condición de entrenamiento (texto de documento reescrito con pérdida en turnos de usuario y asistente) y la semilla de inicialización (1234). Tras el preentrenamiento se aplicó un SFT de una época sobre 400.000 conversaciones, lo que da lugar a un modelo conversacional con formato ChatML sin turno de sistema.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el autor no publica variantes GGUF ni cuantizadas; los pesos están en safetensors en bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 24 capas con atención multi-cabeza de 12 cabezas y 4 cabezas KV (GQA), dimensión de cabeza 128, FFN SwiGLU de 6.144, RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia durante el entrenamiento es de 4.096 tokens con enmascaramiento de atención entre documentos. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre los primeros 18.779 pasos del flujo alineado por pasos de 1PP (39,38B posiciones de token), con batch global de 512 × 4.096 tokens, optimizador Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La condición `ua` implica pérdida sobre turnos de usuario y asistente sobre conversaciones reescritas. La pérdida de validación final por token es 1,532 en texto de asistente, 1,427 en texto de usuario y 3,252 en texto de documento (1,526 en la columna ponderada `reweighted_seg1234`). El SFT se realizó durante una época sobre una mezcla de 400.000 conversaciones (98,5k multi-turno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271,6k de `dlab-spp/sp-sft-normal-300k` y 30k de `dlab-spp/sp-sft-safety-180k`), con la misma pila (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida SFT en held-out es 1,936 sobre 1.998 conversaciones.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema; el template incluido renderiza exactamente ese formato y la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Razonamiento básico de conversación multi-turno, limitado por el tamaño de 0,98B y por el contexto de 4.096 tokens.
- Generación de código y matemáticas: no se documentan capacidades específicas ni evaluaciones; el modelo no está entrenado como asistente de propósito general.
- Tool calling / function calling: no disponible (no se menciona soporte).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo inglés (`language: en`); no se declaran otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Estudio de escalado controlado: el modelo sirve como escalón de 0,98B en la ladder v2, permitiendo comparar curvas de pérdida y comportamiento frente a los tamaños 0,58B, 1,66B y 2,81B bajo la misma condición `ua` y la misma semilla 1234.
- Análisis de sensibilidad a la semilla: al compartir batch order con las semillas 28 y 42, permite aislar la varianza debida únicamente a la inicialización de parámetros en experimentos de reproducibilidad.
- Investigación sobre pérdida en turnos de usuario: la condición `ua` entrena con pérdida en turnos de usuario y asistente, lo que hace al modelo útil para estudiar cómo afecta la supervisión de turnos de usuario a la calidad conversacional en modelos pequeños.
- Evaluación de metodologías de SFT: el checkpoint permite reproducir el pipeline de SFT (400k conversaciones, ChatML sin sistema, LR 0,002, una época) y comparar con las otras ocho combinaciones de tamaño y condición del estudio principal.
- Generación de texto controlada en inglés para prototipos de investigación: con 0,98B parámetros y contexto de 4.096 tokens, es adecuado para experimentos de generación en entornos con recursos limitados donde no se requiere un asistente de producción.
- Verificación de integridad de pesos: el autor documenta la comprobación de los pesos HF frente al checkpoint Megatron recomputando la pérdida de validación (1,9357 frente a 1,9357, diferencia 0,0000), lo que permite usar el modelo como referencia en pipelines de conversión Megatron a HF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente (validación, checkpoint final) | 1,532 |
| Texto de usuario (validación) | 1,427 |
| Texto de documento (validación) | 3,252 |
| Condición `reweighted_seg1234` | 1,526 |
| SFT held-out (tokens de asistente, 1.998 conversaciones) | 1,936 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | 1,9357 (diferencia absoluta 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (el repositorio ocupa 2,0 GB), más overhead de activaciones y caché KV; en la práctica, unos 3-4 GB en bf16 con contexto completo.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits, alrededor de 0,5-0,6 GB. No obstante, el autor no publica variantes cuantizadas ni GGUF, por lo que habría que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en bf16 o fp16; para entrenamiento o SFT se recomiendan A100 o H100 por el batch 128 × 4.096 y el uso de Megatron.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 6 GB o más; también en GPUs integradas o CPU con llama.cpp si se convierte a GGUF, aunque el autor no proporciona esos artefactos.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); vLLM, llama.cpp y Ollama no están documentados por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-ua-seed1234-sft | 0,98B | 4.096 | Apache-2.0 | en | Artefacto de investigación 1PP, SFT sobre 400k conversaciones |
| 1pp-0.58b-v2-ua-seed1234-sft | 0,58B | 4.096 | Apache-2.0 | en | Escalón inferior de la misma ladder v2 |
| 1pp-1.66b-v2-ua-seed1234-sft | 1,66B | 4.096 | Apache-2.0 | en | Escalón superior de la ladder; corresponde al conjunto `1pp-1.7b-*` del estudio principal |
| SmolLM2 (referencia de tokenizador) | no disponible | no disponible | no disponible | no disponible | Solo se comparte el vocabulario (49.152 tokens); no se dispone de comparación de rendimiento |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor lo declara como artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como asistente de propósito general; no debe desplegarse en producción como chatbot de usuario final.
- Solo soporta inglés; no se declaran capacidades multilingües.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducir uno en el prompt puede degradar el comportamiento.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de seguridad, sesgo ni toxicidad más allá de la inclusión de 30k muestras de `dlab-spp/sp-sft-safety-180k` en el SFT.
- Licencia Apache-2.0: permite uso comercial, pero al ser un artefacto de investigación sin garantías de calidad, el uso comercial no está respaldado por evaluaciones.
- No hay variantes cuantizadas ni GGUF publicadas; el despliegue eficiente requiere conversión propia.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K) que permitan estimar su calidad relativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
