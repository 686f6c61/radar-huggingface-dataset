# Raghav-Singhal/1pp-2.81b-v2-asst-seed42-sft

## Resumen

El modelo `1pp-2.81b-v2-asst-seed42-sft` es un artefacto de investigación desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de un modelo de lenguaje de 2.807.699.328 parámetros, con arquitectura decoder tipo Llama, entrenado desde cero y posteriormente sometido a un proceso de supervisión fina (SFT). Forma parte de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de entrenamiento y tres semillas distintas (28, 42 y 1234).

El objetivo del modelo no es ser un asistente de propósito general, sino servir como pieza experimental para estudiar cómo distintas condiciones de preentrenamiento (texto de documento reescrito y máscara de pérdida sobre turnos del asistente) y distintas inicializaciones afectan al comportamiento final. En este caso concreto, la condición es "rewritten conversations, assistant-turn loss" con semilla 42, seguida de un ajuste supervisado sobre una mezcla de 400.000 conversaciones. El resultado es un modelo conversacional en inglés, con una ventana de contexto de 4.096 tokens y licencia Apache 2.0.

La relevancia actual del modelo es fundamentalmente metodológica: ofrece un punto de comparación controlado dentro de una familia de modelos donde solo varían la condición de datos o la semilla, lo que permite aislar el efecto de cada variable. No obstante, su utilidad práctica fuera del contexto de investigación es limitada, ya que el propio autor lo describe explícitamente como un artefacto de investigación y no como un asistente generalista.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder tipo Llama (transformer denso) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (dimensión de cabeza 128), normalización RMSNorm, RoPE con base 10.000, embeddings no atados (untied), sin sesgos y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia durante el entrenamiento es de 4.096 tokens.

El preentrenamiento se realizó sobre las conversaciones del proyecto 1PP reescritas a partir de documentos, con la pérdida calculada únicamente sobre los turnos del asistente. Se entrenaron los primeros 53.709 pasos del flujo alineado por pasos del proyecto (112,64B posiciones de token), con batch global de 512 × 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador combina Muon (escalado de forma, LR matricial 0,005) para las matrices y Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 3.378 pasos, decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0078 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos fue de 1,375 para texto del asistente, 7,225 para texto del usuario y 3,055 para texto de documento.

El ajuste supervisado (SFT) consistió en una época sobre una mezcla de 400.000 conversaciones: 98.500 multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271.600 de `dlab-spp/sp-sft-normal-300k` (excluyendo duplicados del primer conjunto) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Se mantuvo la misma pila (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), con LR matricial 0,001, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación SFT sobre tokens del asistente en 1.998 conversaciones retenidas fue de 1,784.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Razonamiento multi-turno dentro de una ventana de contexto de 4.096 tokens.
- Respuesta a instrucciones y seguimiento de conversaciones de asistente, gracias al ajuste supervisado sobre mezclas multiturno y de seguridad.
- Capacidad de mantener coherencia en diálogos de varios turnos, aunque limitada por la ventana de contexto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo de pensamiento (thinking mode).
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: el modelo sirve como punto de comparación controlado frente a las otras condiciones y semillas de la misma escalera, permitiendo aislar el efecto de la máscara de pérdida y de la inicialización sobre el comportamiento conversacional.
- Estudio de dinámicas de escalado: al compartir flujo de datos y pasos con los otros tamaños de la escalera (0,58B, 0,98B, 1,66B), permite analizar cómo escala la pérdida de validación y la calidad conversacional con el número de parámetros.
- Evaluación de técnicas de SFT: al estar ajustado sobre una mezcla documentada de conversaciones multiturno y de seguridad, puede emplearse para medir el impacto del SFT sobre un modelo preentrenado con una condición concreta.
- Reproducibilidad de experimentos: la verificación de pesos frente al checkpoint de Megatron (diferencia absoluta 0,0000 en la pérdida de validación) lo convierte en una referencia fiable para replicar resultados.
- Análisis de sesgos y seguridad en modelos pequeños: el ajuste incluye una muestra de conversaciones de seguridad, lo que permite estudiar el comportamiento de un modelo de 2,81B en escenarios sensibles dentro de un entorno controlado.
- Generación de texto en inglés para prototipos de bajo coste: con 2,81B parámetros y contexto de 4.096 tokens, puede desplegarse en hardware modesto para pruebas de integración con la pila transformers y text-generation-inference, siempre asumiendo su naturaleza de artefacto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación internas:

| Conjunto | Métrica | Valor |
|---|---|---|
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto del asistente | 1,375 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto del usuario | 7,225 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida por token, texto de documento | 3,055 |
| Validación de preentrenamiento (2.433 documentos) | Pérdida ponderada en tokens de entrenamiento de la condición | 1,422 |
| Validación SFT (1.998 conversaciones) | Pérdida en tokens del asistente | 1,784 |
| Verificación HF vs. Megatron (segmentos [3, 4]) | Pérdida HF / referencia Megatron / diferencia absoluta | 1,7837 / 1,7837 / 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB para pesos; en 4 bits, alrededor de 1,5-2 GB (aunque no se documentan cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) para despliegues de producción o evaluación por lotes; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 8-12 GB si se recurre a cuantización.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` en el repo), endpoints compatibles; no se documenta soporte explícito de vLLM, llama.cpp u Ollama, aunque al ser un decoder tipo Llama con safetensors es probable que herramientas de conversión a GGUF funcionen.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-asst-seed42-sft | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Artefacto de investigación, solo inglés |
| 1pp-1.66B (rung 1,7B del estudio principal) | 1,66B | 4.096 | Apache 2.0 | Hugging Face (colección 1pp) | Misma escalera, menor tamaño |
| 1pp-0.98B | 0,98B | 4.096 | Apache 2.0 | Hugging Face (colección 1pp) | Misma escalera, menor tamaño |
| 1pp-0.58B | 0,58B | 4.096 | Apache 2.0 | Hugging Face (colección 1pp) | Misma escalera, menor tamaño |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos externos de tamaño similar (por ejemplo, Qwen2.5-3B, Llama-3.2-3B o SmolLM2-1.7B), por lo que la comparación se limita a los miembros de la propia escalera 1PP.

## Limitaciones y advertencias

- El propio autor lo describe como un artefacto de investigación del proyecto 1PP (EPFL DLAB), no como un asistente de propósito general.
- Idiomas: únicamente inglés; no se garantiza un comportamiento correcto en castellano u otras lenguas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Formato de chat restrictivo: ChatML sin turno de sistema; el modelo nunca vio un turno de sistema durante el entrenamiento, por lo que introducirlo puede degradar el comportamiento.
- Riesgo de alucinación inherente a modelos de este tamaño y a un ajuste sobre mezclas de conversaciones sintéticas o reescritas.
- Sesgos potenciales derivados de los conjuntos de datos de preentrenamiento y SFT (conversaciones reescritas, mezclas de seguridad y multiturno), no auditados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental del modelo desaconseja su uso en producción sin una evaluación exhaustiva previa.
- Sin soporte documentado de tool calling, agentes, visión ni audio.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción nula fuera del contexto de investigación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
