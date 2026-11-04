# Raghav-Singhal/1pp-0.98b-v2-ua-seed42-base

## Resumen

1pp-0.98b-v2-ua-seed42-base es un modelo de lenguaje de 981.545.472 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: forma parte de una escalera de escalado (ladder v2) compuesta por cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de preentrenamiento y tres semillas (28, 42, 1234), todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos.

El modelo emplea una arquitectura decoder estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

La condición concreta de esta variante es "rewritten conversations, user+assistant loss" (conversaciones reescritas con pérdida sobre turnos de usuario y asistente) con semilla 42. El interés del modelo reside en su valor comparativo dentro del estudio: permite aislar el efecto del texto de los documentos y de la máscara de pérdida frente a otras condiciones, y el de la inicialización de parámetros frente a otras semillas, manteniendo constante el orden de los lotes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV con dimensión de cabeza 128, RMSNorm en pre-normalización, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) con un token `<|pad|>` adicional; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre los primeros 18.779 pasos del flujo alineado por pasos del proyecto 1PP (39,38B posiciones de token), que corresponden a los primeros pasos del recorrido de 31.777 pasos del estudio principal en el mismo orden. Los datos son conversaciones 1PP reescritas a partir de documentos, con pérdida calculada sobre los turnos de usuario y de asistente. El lote global es de 512 secuencias × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas); calentamiento de 1.181 pasos, tasa constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100; weight decay 0,1; desviación estándar de inicialización 0,0103; precisión bf16.

La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,533 por token en texto de asistente, 1,429 en texto de usuario y 3,328 en texto de documento; la columna ponderada de la condición (`reweighted_seg1234`) da 1,528. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas: 1,5320 frente a 1,5333 (diferencia absoluta 0,0014) en segmentos val50m [3], y 3,3312 frente a 3,3285 (diferencia 0,0027) en segmentos raw_val50m [8].

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML.
- Producción de texto con estructura de diálogo (turnos de usuario y asistente) como consecuencia de la condición de preentrenamiento, no de un ajuste por instrucciones.
- Plantilla de chat incluida (`chat_template`) que renderiza exactamente el formato ChatML sin turno de sistema.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Compatibilidad con `text-generation-inference` y `endpoints_compatible` según las etiquetas del repositorio.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente; no se documentan en la información disponible.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Estudio controlado del efecto de la condición de preentrenamiento: el modelo sirve como réplica de la condición "rewritten conversations, user+assistant loss" con semilla 42, comparable directamente con las otras condiciones de la escalera al compartir flujo de datos y orden de lotes.
- Análisis de variabilidad por semilla: al diferir de las otras semillas únicamente en la inicialización de parámetros, permite medir la varianza de resultados atribuible a la init manteniendo constante el orden de los lotes.
- Investigación sobre escalado de modelos pequeños: con 0,98B de parámetros y 20,3 tokens de asistente por parámetro, encaja en estudios que comparan curvas de pérdida entre los cuatro tamaños de la escalera (0,58B, 0,98B, 1,66B, 2,81B).
- Reproducción de resultados: las pérdidas de validación publicadas y la verificación frente al checkpoint de Megatron permiten reproducir métricas de referencia en experimentos propios.
- Generación de diálogo sintético en inglés para construcción de datasets: el modelo produce texto con formato ChatML sin sistema, útil para aumentar corpus conversacionales en pipelines de investigación.
- Ajuste fino supervisado posterior: al ser un modelo base con licencia Apache 2.0 y pesos en safetensors, puede servir como punto de partida para SFT en tareas concretas (el proyecto mantiene proyectos de wandb separados para SFT).
- Evaluación de infraestructura de despliegue: su tamaño permite probar pilas de servicio (TGI, transformers) en una sola GPU consumer con requisitos moderados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos cuantitativos son las pérdidas de validación del autor:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,5320 | 1,5333 | 0,0014 |
| raw_val50m segments [8] | 3,3312 | 3,3285 | 0,0027 |

| Métrica de validación (checkpoint final) | Valor |
|---|---|
| Pérdida por token, texto de asistente | 1,533 |
| Pérdida por token, texto de usuario | 1,429 |
| Pérdida por token, texto de documento | 3,328 |
| Pérdida ponderada de la condición (`reweighted_seg1234`) | 1,528 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más caché KV y activaciones; el repositorio ocupa 2,0 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se documentan cuantizaciones oficiales publicadas.
- Cabe holgadamente en cualquier GPU consumer reciente (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB) e incluso en GPUs de 4-8 GB con cuantización.
- GPU recomendadas para investigación a escala: A100, H100 o L40S para ejecutar las tres semillas y las tres condiciones en paralelo; para inferencia individual basta una GPU consumer.
- Opciones de despliegue: `transformers` (librería declarada), `text-generation-inference` (etiqueta del repositorio) y endpoints compatibles. No se documenta soporte explícito de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-ua-seed42-base | 981,5M | 4.096 | Apache 2.0 | HuggingFace | Artefacto de investigación, solo inglés, sin benchmarks |
| 1pp-0.58b-v2 (misma escalera) | ~0,58B | 4.096 | Apache 2.0 | Colección 1pp | Escalón inferior de la misma escalera; comparación directa de escalado |
| 1pp-1.7b (escalón 1,66B) | ~1,66B | 4.096 | Apache 2.0 | Colección 1pp | Escalón superior y modelo del estudio principal |
| SmolLM2 (familia) | 135M / 360M / 1,7B | no disponible en la información | Apache 2.0 | HuggingFace | Comparte tokenizador (49.152); no se dispone de comparación de rendimiento en la información proporcionada |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no ha pasado por ajuste por instrucciones ni por RLHF/DPO, por lo que no debe esperarse un comportamiento alineado ni útil en conversación directa.
- El autor lo describe explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB), no como asistente de propósito general.
- Solo soporta inglés según el campo `language`; no se documentan capacidades en otros idiomas.
- Ventana de contexto de 4.096 tokens, corta para cargas de producción con documentos largos.
- No se han publicado evaluaciones de sesgo, toxicidad o alucinación; el riesgo de alucinación es el propio de un modelo de 0,98B sin alineación.
- El formato de chat es ChatML sin turno de sistema; los modelos nunca vieron un turno de sistema, por lo que introducirlo puede degradar la calidad de la respuesta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; cualquier despliegue comercial requeriría ajuste y evaluación propios.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.
- No se publican cuantizaciones oficiales ni métricas de latencia o throughput.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed42-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
