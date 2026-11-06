# Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed1234-sft

## Resumen

1pp-0.98b-v2-ua-rawanneal-seed1234-sft es un modelo de lenguaje de 981.545.472 parámetros (0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición de los datos de preentrenamiento (documentos originales frente a conversaciones reescritas a partir de esos documentos) al comportamiento final del modelo. Forma parte de una escalera de escalado (ladder v2) con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234).

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

Este checkpoint concreto combina un preentrenamiento en dos fases (documentos originales hasta el paso 16.902 y después un cooldown de 1.877 pasos sobre conversaciones 1PP con pérdida en turnos de usuario y asistente) con un posterior ajuste supervisado (SFT) sobre 400.000 conversaciones. Su interés es metodológico: permite comparar de forma controlada el efecto de la condición de datos y de la semilla sobre el mismo flujo de pasos alineados, con una licencia Apache 2.0 que facilita la reproducibilidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama |
| Parámetros totales | 981.545.472 (0,98B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (pesos publicados en safetensors, presumiblemente bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder denso de 24 capas con hidden size 1.536, FFN 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (GQA con head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el de SmolLM2 (49.152 tokens) más `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento usa los documentos originales de DCLM-edu durante los primeros 16.902 pasos y, en el cooldown de los últimos 1.877 pasos (de un total de 18.779), conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre turnos de usuario y asistente. El flujo está alineado por pasos con el estudio principal (39,38B posiciones de token en esta porción). El batch global es de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16.

El SFT se realizó sobre una época de una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno), `dlab-spp/sp-sft-normal-300k` sin duplicados (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta a instrucciones adquiridos mediante SFT sobre mezclas multiturno y de seguridad.
- Conversaciones multiturno dentro de una ventana de 4.096 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés (idioma declarado: en).
- No dispone de visión, audio ni modo de pensamiento (thinking mode).
- El autor lo describe explícitamente como artefacto de investigación, no como asistente de propósito general.

## Casos de uso

- Estudio controlado del efecto de la condición de datos: comparar este checkpoint con `1pp-0.98b-v2-ua-seed1234-sft` y con las variantes de otras semillas para aislar el impacto del cooldown sobre conversaciones frente al preentrenamiento solo con documentos.
- Reproducción de experimentos de escalado: al compartir flujo de pasos alineado y batch, permite replicar análisis de curvas de pérdida de validación (1,635 en texto de asistente, 1,519 en texto de usuario y 3,026 en texto de documento) sin reentrenar.
- Investigación sobre pérdida en turnos de usuario y asistente: útil para analizar cómo la máscara de pérdida durante el cooldown afecta a la calidad conversacional medida con pérdida SFT retenida (1,973).
- Evaluación de metodologías de SFT: el checkpoint sirve como punto de partida para probar mezclas de datos de ajuste supervisado sobre un modelo base pequeño y de bajo coste computacional.
- Docencia y divulgación: con 0,98B parámetros y licencia Apache 2.0, es viable ejecutarlo en hardware de consumo para demostrar el pipeline completo de preentrenamiento, cooldown y SFT.
- Verificación de implementaciones: el autor valida los pesos HF contra el checkpoint de Megatron recomputando pérdidas (diferencia absoluta 0,0000 en el conjunto sft_val), lo que lo hace útil como referencia para comprobar conversiones de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación:

| Métrica | Valor |
|---|---|
| Pérdida de validación en texto de asistente (checkpoint final) | 1,635 |
| Pérdida de validación en texto de usuario | 1,519 |
| Pérdida de validación en texto de documento | 3,026 |
| Pérdida en tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,620 |
| Pérdida SFT retenida (tokens de asistente, 1.998 conversaciones) | 1,973 |
| Verificación HF frente a Megatron (sft_val segmentos [3, 4]) | 1,9730 frente a 1,9730 (diferencia 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB con contexto completo de 4.096 tokens.
- VRAM estimada en fp32: alrededor de 4 GB solo para pesos.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; A100, H100 o L40S para inferencia por lotes; RTX 4090, RTX 3090, RTX 4070 o superiores para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); no se documentan pesos GGUF para llama.cpp u Ollama, por lo que su uso en esas herramientas requeriría conversión propia.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-ua-rawanneal-seed1234-sft | 0,98B | 4.096 | Apache 2.0 | en | Artefacto de investigación con cooldown sobre conversaciones y SFT |
| 1pp-0.98b-v2-ua-seed1234-sft | 0,98B | 4.096 | Apache 2.0 | en | Variante del mismo estudio con preentrenamiento 1PP completo |
| 1pp-0.98b-v2-raw-seed1234-base | 0,98B | 4.096 | Apache 2.0 | en | Modelo base sin SFT del que deriva el cooldown |
| SmolLM2 (variante ~1B) | ~1B | No disponible en esta información | No disponible en esta información | No disponible en esta información | Referencia habitual para modelos de este tamaño; comparte vocabulario (49.152) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este modelo con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor lo califica como artefacto de investigación (EPFL DLAB) y no como asistente de propósito general; no debería desplegarse en producción orientada a usuarios finales sin una evaluación adicional.
- Solo soporta inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para tareas de contexto largo.
- El chat template no incluye turno de sistema: los modelos nunca lo vieron, por lo que inyectar mensajes de sistema puede degradar el comportamiento.
- Riesgo de alucinación inherente a un modelo de 0,98B entrenado con un presupuesto de cómputo reducido (20,3 tokens de asistente por parámetro); no se han publicado evaluaciones de factualidad.
- No se documentan mitigaciones específicas de sesgos; la mezcla de SFT incluye 30k muestras de un conjunto de seguridad, pero no hay evaluación de seguridad publicada.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación la idoneidad técnica para producción no está respaldada por benchmarks.
- Sin datos publicados de cuantización ni de formatos GGUF, el despliegue eficiente en CPU o en herramientas como llama.cpp requiere trabajo adicional de conversión y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed1234-sft
- Variante con preentrenamiento 1PP completo: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed1234-sft
- Modelo base del que deriva el cooldown: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
