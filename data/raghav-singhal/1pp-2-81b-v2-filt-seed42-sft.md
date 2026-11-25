# Raghav-Singhal/1pp-2.81b-v2-filt-seed42-sft

## Resumen

1pp-2.81b-v2-filt-seed42-sft es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), un artefacto de investigación del EPFL DLAB. Se trata de la variante "Filtered" de la escala de escalado 1PP: parte del corpus crudo de DCLM-edu y aplica un clasificador de seguridad basado en gte que marca los documentos problemáticos para excluirlos de la función de pérdida (aunque permanecen en contexto), y posteriormente recibe un ajuste supervisado (SFT) sobre una mezcla de 400.000 conversaciones.

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000 y embeddings no atados. El contexto es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`.

Su relevancia es metodológica más que práctica: forma parte de una comparativa controlada entre condiciones de preentrenamiento (raw, Filtered y SPP{T0}) sobre exactamente los mismos documentos y en el mismo orden, lo que permite aislar el efecto del filtrado de datos. El autor advierte explícitamente que no es un asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama. El preentrenamiento consistió en 53.709 pasos sobre el flujo alineado por pasos del run raw (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR de matriz 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, init std 0,0078 y precisión bf16.

La condición "Filtered" es la innovación central: un clasificador de seguridad basado en gte, puntuado por fragmento, marcó 3.869.498 documentos (4,6%) cuyo fragmento de mayor puntuación alcanza al menos 3. Esos documentos permanecen en las secuencias de entrenamiento (en contexto) pero no contribuyen a la pérdida; el resto se entrena igual que en el run raw. El SFT se realizó sobre una época de una mezcla de 400.000 conversaciones (`jkminder/model-raising-pb-100k-3c-mt-sft`, `dlab-spp/sp-sft-normal-300k` sin duplicados y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`), con la misma pila (Megatron, Muon, sin turno de sistema, pérdida solo en turnos del asistente), LR de matriz 0,001, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un 3% de warmup. El modelo fue re-entrenado el 2026-11-21 con LR 0,001 tras detectarse colapsos fuera del formato de chat en cinco de los nueve modelos SFT de esta escala con LR 0,002.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento básico y respuesta a preguntas, validado en el gate con PIQA, ARC-Easy y TriviaQA.
- Conversación multi-turno (el SFT incluye 98.500 conversaciones multi-turno con citas a constitución).
- Seguimiento de instrucciones dentro del formato de chat especificado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Investigación sobre filtrado de datos de preentrenamiento: el modelo sirve como condición controlada frente al run raw y a SPP{T0} para medir el efecto de excluir de la pérdida los documentos marcados por un clasificador de seguridad, manteniendo idénticos documentos, orden y schedule.
- Reproducción de experimentos de escalado: al compartir receta y conversaciones con los demás modelos SFT de la escala 1PP, permite comparaciones de pérdida de validación y de SFT entre condiciones con una sola variable modificada.
- Evaluación de sesgos y seguridad en corpus filtrados: útil para estudiar si el filtrado por clasificador reduce contenido problemático sin degradar tareas de conocimiento general (PIQA, ARC-Easy, TriviaQA).
- Generación de texto en inglés con contexto medio: con 4.096 tokens puede gestionar conversaciones y documentos de extensión moderada en entornos de investigación.
- Fine-tuning posterior como base de experimentos: su licencia Apache 2.0 y su tamaño (2,81B) permiten ajustes adicionales en un solo nodo de GPU para estudiar recetas de SFT.
- Análisis de robustez fuera del formato de chat: el autor documenta que el modelo responde con hasta un 40% de respuestas sin sentido a preguntas seguras formuladas fuera del formato ChatML, lo que lo convierte en un caso de estudio sobre fragilidad de formato.
- Despliegue ligero en investigación: con 2,81B parámetros y pesos safetensors, es viable en GPUs de gama alta consumer para prototipos y evaluaciones, no para producción de asistente general.

## Benchmarks y rendimiento

El autor no publica resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documentan pérdidas de validación y del SFT:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación del modelo base (texto de documento) | pérdida por token | 2,324 |
| Validación del modelo base (texto del asistente) | pérdida por token | 2,391 |
| Validación del modelo base (texto del usuario) | pérdida por token | 2,467 |
| SFT held-out (1.998 conversaciones, tokens del asistente) | pérdida | 1,847 |
| Verificación HF vs Megatron (sft_val segmentos [3, 4]) | pérdida HF / referencia / diferencia absoluta | 1,8469 / 1,8469 / 0,0000 |

El gate de calidad del re-entrenamiento indica que PIQA, ARC-Easy y TriviaQA quedan cerca de los modelos hermanos, y que como máximo el 40% de las respuestas a preguntas seguras formuladas fuera del formato de chat son sin sentido. No se proporcionan cifras concretas de esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos (2,81B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, del orden de 7-9 GB para contexto completo de 4.096 tokens.
- En cuantización de 8 bits: en torno a 3 GB de pesos; en 4 bits: en torno a 1,5-2 GB. No se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: A100, H100 o L40S para evaluación por lotes; RTX 4090, RTX 3090 o RTX 4080 son suficientes para inferencia en bf16 de una sola instancia.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB), RTX 3090 (24 GB) y probablemente en GPUs de 12-16 GB con cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están documentados por el autor y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-2.81b-v2-filt-seed42-sft | 2,81B | 4.096 | Apache 2.0 | Condición Filtered con SFT; artefacto de investigación |
| 1pp-2.81b-v2-raw-seed42-base | 2,81B | 4.096 | Apache 2.0 (según colección) | Run raw sin filtrado, misma escala y receta; referencia directa |
| SPP{T0} (misma escala 1PP) | 2,81B | 4.096 | Apache 2.0 (según colección) | Segunda condición baseline del paper SPP sobre el mismo corpus |
| SmolLM2 (familia, referencia de tokenizador) | no disponible | no disponible | no disponible | Solo se cita su vocabulario (49.152 tokens); no hay comparación de rendimiento publicada |

No se dispone de comparaciones de rendimiento con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Solo soporta inglés.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Fragilidad de formato: fuera del formato ChatML, el modelo produce hasta un 40% de respuestas sin sentido a preguntas seguras, según el gate del autor.
- Riesgo de alucinación no cuantificado; no se publican evaluaciones de factualidad.
- Sesgos: el filtrado se basa en un clasificador gte que marca el 4,6% de documentos; no se documenta un análisis de sesgos residuales ni de sesgo del propio clasificador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para producción y su calidad conversacional es limitada.
- El formato de chat no incluye turno de sistema, lo que restringe el control de comportamiento mediante instrucciones de sistema.
- No hay cuantizaciones oficiales publicadas ni métricas de latencia/throughput.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-filt-seed42-sft
- Modelo raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
