# Raghav-Singhal/1pp-1.7b-asst-seed1234-sft

## Resumen

1pp-1.7b-asst-seed1234-sft es un modelo de lenguaje de 1.661.048.832 parámetros publicado por Raghav-Singhal como artefacto de investigación del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. No es un asistente de propósito general: es una réplica de semilla del modelo `1pp-1.7b-asst-sft`, en la que se repite exactamente la misma receta y la misma secuencia de batches, cambiando únicamente la semilla de inicialización del preentrenamiento (`--seed 1234` en lugar de 28; el SFT mantiene `--seed 28`). Su finalidad es medir la varianza de inicialización de la receta.

El modelo forma parte de un estudio factorial de 3 × 3: tres tamaños (0,5B, 1B y 1,7B) por tres condiciones de preentrenamiento sobre los mismos 47,8M documentos fuente y en el mismo orden (documentos originales; conversaciones reescritas con pérdida solo en turnos del asistente; conversaciones reescritas con pérdida en turnos de usuario y asistente). Todos los entrenamientos vieron la secuencia de batches idéntica, de modo que las condiciones solo difieren en el texto del documento y en la máscara de pérdida.

Arquitectura: decoder estilo Llama de 24 capas, `hidden` 2.048, FFN 8.192 con SwiGLU, 16 cabezas de atención y 4 cabezas KV (GQA, dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases ni QK-norm, y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. Licencia Apache 2.0, solo inglés y sin resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (denso, no MoE) |
| Parámetros totales | 1.661.048.832 (1,66B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible; el repositorio solo publica pesos en safetensors (bf16 durante el entrenamiento) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`); sin GGUF publicado |

Otras especificaciones: 24 capas; `hidden_size` 2.048; `intermediate_size` 8.192 (SwiGLU); 16 cabezas de atención / 4 cabezas KV, `head_dim` 128; RMSNorm; RoPE base 10.000; embeddings no atados (`untied`); sin biases; sin QK-norm; tokenizador SmolLM2 de 49.152 tokens más `<|pad|>`; `<|endoftext|>` como token de fin de documento; tamaño del repositorio 3,3 GB; `eos_token_id` incluye `<|im_end|>` (id 2) y `<|endoftext|>` (id 0).

## Arquitectura y entrenamiento

El preentrenamiento se hizo en una sola pasada sobre 47,8M documentos (66,2B tokens como documentos originales; 63,0B tokens en formato conversación) durante 31.777 pasos con batch global de 512 × 4.096 tokens. Se aplicó enmascaramiento de atención entre documentos y empaquetado *best-fit* con asignación de documentos alineada a paso. La condición de este modelo concreto es «conversaciones reescritas con pérdida en los turnos del asistente»: no hay pérdida sobre los turnos del usuario ni sobre `<|endoftext|>`. El optimizador es Muon (con *shape scaling* y LR de matriz 0,005) combinado con Adam para embeddings y normas; warmup de 2.000 pasos, LR constante y decaimiento lineal durante el último 10% hasta 1/100, weight decay 0,1 y precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,452 nats/token en texto de asistente, 6,581 en texto de usuario y 3,184 en texto de documento.

El SFT consiste en una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con *constitution-cited track*), `dlab-spp/sp-sft-normal-300k` descontando los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se reutiliza el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), con LR de matriz 0,002 seleccionado entre {0,0005, 0,001, 0,002, 0,005} por pérdida en retenido sobre el modelo de semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en retenido es 1,867 (tokens de asistente, 1.998 conversaciones retenidas). La verificación de los pesos HF frente al checkpoint de Megatron reproduce 1,8673 en ambos casos sobre los segmentos [3, 4] de `sft_val`, con diferencia absoluta 0,0000.

No se emplearon RLHF ni DPO, ni decodificación especulativa, atención lineal u otras innovaciones de inferencia: el interés técnico del trabajo está en el formato de datos (reescritura a conversación y enmascarado de la pérdida) y en la cuantificación de la varianza entre semillas.

## Capacidades

- Generación de texto conversacional en inglés, en formato multiturno.
- Respuesta a instrucciones y diálogo gracias al SFT sobre 400k conversaciones, incluyendo un subconjunto orientado a seguridad y otro con citas de constitución.
- Razonamiento de un solo turno o multiturno dentro de la ventana de 4.096 tokens; sin modo *thinking* ni cadena de pensamiento explícita.
- Formato de chat ChatML **sin turno de sistema**: el template incluido renderiza exactamente `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`; la generación se detiene en `<|im_end|>` o `<|endoftext|>`.
- Multilingüe: no; solo inglés (el vocabulario SmolLM2 cubre otros idiomas, pero no hay entrenamiento ni evaluación reportada fuera del inglés).
- Tool calling / function calling: no entrenado ni documentado.
- Capacidades de agente y multi-step reasoning con herramientas: no documentadas.
- Visión, audio, código o matemáticas: no se reportan evaluaciones específicas de ninguna de estas capacidades.

## Casos de uso

- Estudio de varianza de inicialización: comparar este checkpoint con `1pp-1.7b-asst-sft` (semilla 28) para estimar cuánto de la diferencia de pérdida en retenido atribuible a la receta es en realidad ruido de inicialización; el autor reporta una horquilla observada de 0,0021 a 0,0038 nats entre réplicas en las tres condiciones.
- Reproducción de ablaciones de formato de datos: al compartir secuencia de batches con las otras ocho ejecuciones del estudio 3 × 3, permite aislar el efecto de la máscara de pérdida (solo asistente frente a usuario y asistente) frente al texto original.
- Punto de partida para SFT propio: al ser un modelo de 1,66B en Apache 2.0, se puede reajustar con presupuesto de una sola GPU para experimentos de instrucción o de dominio en inglés.
- Prototipado de chat en inglés sin turno de sistema: útil en pipelines donde el prompt se compone manualmente y no se desea un rol `system`; el template ChatML propio lo hace directamente.
- *Smoke test* de infraestructura de inferencia: su tamaño permite validar despliegues con TGI (`text-generation-inference` y `endpoints_compatible` están en los tags) o vLLM en una sola GPU consumer antes de escalar a modelos mayores.
- Investigación educativa o metodológica: servir como ejemplo reproducible de entrenamiento con Megatron + Muon y de verificación de pesos HF frente a checkpoint Megatron (diferencia reportada 0,0000).
- Generación de datos sintéticos en inglés para experimentos internos de destilación o aumentación, con revisión humana obligatoria dada la ausencia de evaluaciones de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones de calidad conversacional). El autor solo reporta pérdidas de validación:

| Conjunto / métrica | Valor (nats/token) |
|---|---|
| Preentrenamiento, texto de asistente (2.433 documentos retenidos) | 1,452 |
| Preentrenamiento, texto de usuario (2.433 documentos retenidos) | 6,581 |
| Preentrenamiento, texto de documento (2.433 documentos retenidos) | 3,184 |
| SFT en retenido, tokens de asistente (1.998 conversaciones) | 1,867 |
| Verificación HF vs. Megatron, `sft_val` segmentos [3, 4] | 1,8673 vs. 1,8673 (dif. abs. 0,0000) |

No es posible comparar estos valores con modelos similares, porque las pérdidas dependen del tokenizador, del dataset y de la máscara empleados.

## Requisitos de hardware

- VRAM estimada para los pesos: ~3,3 GB en bf16/fp16, ~6,6 GB en fp32, ~1,7 GB en int8 y ~0,9 GB en 4 bits (estimación a partir de los 1,66B parámetros; no hay cuantizaciones publicadas).
- Caché KV: 24 capas × 4 cabezas KV × 128 dimensiones × 2 (K y V) × 2 bytes ≈ 48 KiB por token, es decir, ~196 MiB a la longitud máxima de 4.096 tokens (estimación propia, no reportada por el autor).
- Cabe holgadamente en GPU consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, e incluso en tarjetas de 8 GB si se cuantiza a 8 bits.
- GPU de datacenter: A100, H100, L40S o A10G son suficientes y permiten lotes grandes; no se requiere nada mayor para un modelo denso de 1,66B.
- Opciones de despliegue: `transformers` (vía directa, es la librería declarada), TGI (tag `text-generation-inference`, `endpoints_compatible`), vLLM (arquitectura Llama estándar con GQA y RoPE 10.000). Para llama.cpp u Ollama habría que convertir los pesos a GGUF, ya que el repositorio no incluye ese formato.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

No hay datos de rendimiento comparables para este modelo, por lo que la comparación se limita a arquitectura, tamaño, contexto y licencia. Cifras de los modelos alternativos tomadas de su documentación pública.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-1.7b-asst-seed1234-sft | 1,66B | 4.096 | Apache 2.0 | en | Artefacto de investigación, sin benchmarks, tokenizador SmolLM2 |
| SmolLM2-1.7B | ~1,7B | 8.192 (según su model card) | Apache 2.0 | mayoritariamente en, multilingüe parcial | Mismo vocabulario base (49.152); sí publica benchmarks |
| Llama 3.2 1B | ~1,24B | 128k | Llama 3.2 Community License | multilingüe | Licencia con restricciones de uso comercial para grandes plataformas |
| Qwen2.5-1.5B | ~1,54B | 32k | Apache 2.0 | multilingüe | Familia con variantes instruct y base |

La diferencia relevante no es de rendimiento sino de propósito: este checkpoint está pensado como réplica experimental, mientras que las alternativas son modelos publicados con evaluaciones y soporte de producción.

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB) y **no** como asistente de propósito general; no debería usarse en producción sin una evaluación propia.
- Solo inglés: no hay datos de entrenamiento ni evaluación en castellano u otros idiomas.
- Ventana de contexto de 4.096 tokens; no admite entradas más largas sin truncado.
- El modelo nunca vio un turno de sistema durante el entrenamiento; introducirlo en el prompt puede degradar el comportamiento de forma impredecible.
- Sin benchmarks publicados: se desconoce su rendimiento en MMLU, HumanEval, GSM8K o en evaluaciones de calidad y seguridad conversacional.
- Riesgo de alucinación no medido; no se han publicado evaluaciones de factualidad.
- Alineación de seguridad limitada: el SFT incluye solo una muestra de 30k de `dlab-spp/sp-sft-safety-180k` dentro de una mezcla de 400k conversaciones, y no hay RLHF ni DPO.
- No soporta tool calling ni flujos de agente; no hay plantilla ni entrenamiento para ello.
- Es una réplica de una sola semilla: el rango de 0,0021–0,0038 nats que reporta el autor es una horquilla observada, no una estimación de varianza.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ); su uso en llama.cpp u Ollama requiere conversión propia y validación posterior.
- La licencia Apache 2.0 permite uso comercial y modificaciones, pero al no existir evaluación de calidad ni de sesgos, la responsabilidad de validación recae íntegramente en quien despliega el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-seed1234-sft
- Modelo de referencia (semilla 28): https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Paper, blog o repositorio de código: no disponible en la información proporcionada.
