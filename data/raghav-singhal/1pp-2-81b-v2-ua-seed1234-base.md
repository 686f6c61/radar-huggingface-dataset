# Raghav-Singhal/1pp-2.81b-v2-ua-seed1234-base

## Resumen

El modelo `1pp-2.81b-v2-ua-seed1234-base` es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata del peldaño superior de una escala de entrenamiento (ladder v2) compuesta por cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) que se entrenan desde cero sobre el mismo flujo de datos alineado por pasos, con el objetivo de estudiar cómo escala el rendimiento con el tamaño del modelo bajo condiciones controladas.

Este checkpoint concreto corresponde a la condición "rewritten conversations, user+assistant loss" con la semilla 1234. No es un asistente de propósito general, sino un artefacto de investigación diseñado para comparar experimentalmente el efecto de la composición del corpus y la función de pérdida en el preentrenamiento. La relevancia actual reside en que proporciona un punto de referencia reproducible y abierto (licencia Apache 2.0) para estudiar leyes de escala y el impacto del formato conversacional en modelos de menos de 3.000 millones de parámetros.

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 2.688 y ventana de contexto de 4.096 tokens. El modelo se entrenó con 112.640 millones de posiciones de token, lo que equivale a 20,3 tokens de asistente por parámetro, sobre un vocabulario derivado de SmolLM2 con 49.152 entradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención y 7 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible en la model card; al ser pesos safetensors en bf16 es cuantizable a GGUF/AWQ/GPTQ mediante herramientas estándar, pero el autor no publica variantes cuantizadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamaño del repo 5,6 GB |

## Arquitectura y entrenamiento

El modelo emplea un transformer decoder denso de estilo Llama con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (GQA con head dim de 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de sesgos y de QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens con enmascaramiento de atención entre documentos.

El preentrenamiento se realizó sobre conversaciones reescritas a partir de los documentos del proyecto, con pérdida calculada tanto en los turnos de usuario como en los de asistente. Se cubrieron los primeros 53.709 pasos del flujo alineado de 1PP (112.640 millones de posiciones de token), que corresponden a los primeros pasos del pase principal de 31.777 pasos del estudio, en el mismo orden. El batch global fue de 512 secuencias de 4.096 tokens. Como innovación destacable, el optimizador combina Muon (con escalado por forma y LR matricial de 0,005) para los parámetros matriciales y Adam para el resto (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 3.378 pasos, decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay de 0,1 e init std de 0,0078, todo en bf16. La pérdida de validación final sobre 2.433 documentos retenidos fue de 1,351 en texto de asistente, 1,270 en texto de usuario y 3,054 en texto de documento.

## Capacidades

- Generación de texto autoregresiva en inglés con formato conversacional ChatML (sin turno de sistema).
- Modelo base: no está ajustado con RLHF ni DPO, por lo que no sigue instrucciones de forma fiable ni rechaza peticiones.
- Continuación de diálogos multiturno en el formato exacto `<|im_start|>user\n...<|im_end|>\n<|im_start|>assistant\n...<|im_end|>\n`.
- Generación condicionada por documentos: la condición de entrenamiento reescribe documentos como conversaciones, por lo que el modelo puede producir texto con estructura de diálogo derivada de contenido documental.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente entrenadas de forma explícita.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.

## Casos de uso

- Investigación sobre leyes de escala: el modelo forma parte de una escala controlada de cuatro tamaños y tres semillas, lo que permite aislar el efecto del tamaño y de la inicialización sobre la pérdida de validación en un mismo flujo de datos.
- Estudio del formato conversacional en preentrenamiento: al compararse con condiciones de línea base (texto plano) y otras variantes de pérdida, sirve para medir cuánto contribuye reescribir documentos como diálogos al rendimiento en texto de asistente.
- Reproducción de experimentos de alineación de datos: los logs de wandb y las recetas de optimizador (Muon + Adam) publicadas permiten replicar el entrenamiento con presupuesto de cómputo moderado (2,81B parámetros, 112,64B tokens).
- Generación de diálogos sintéticos para aumento de datos: el modelo produce turnos de usuario y asistente en ChatML, útil para crear corpus conversacionales de dominio específico a partir de documentos propios.
- Fine-tuning supervisado como punto de partida: al ser un modelo base con licencia Apache 2.0 y pesos safetensors, se puede ajustar con SFT para tareas concretas de investigación o prototipos internos.
- Evaluación comparativa de tokenizadores y arquitecturas: el uso del vocabulario de SmolLM2 con 49.152 tokens y de GQA 21/7 permite comparar eficiencia de tokenización y atención frente a otros modelos de tamaño similar.
- Despliegue en entornos de investigación con recursos limitados: con 2,81B parámetros en bf16 (aproximadamente 5,6 GB de pesos) cabe en una única GPU de gama alta de consumo, lo que facilita experimentos locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,351 |
| Texto de usuario | 1,270 |
| Texto de documento | 3,054 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,350 |

Verificación de pesos frente al checkpoint original en Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 1,3499 | 1,3512 | 0,0013 |
| Segmentos raw_val50m [8] | 3,0563 | 3,0545 | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB para secuencias de 4.096 tokens.
- En cuantización de 8 bits: alrededor de 3 GB de pesos; en 4 bits: alrededor de 1,5 GB, aunque el autor no publica variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en bf16 con margen amplio.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) e incluso en GPUs de 12 GB con cuantización a 8 bits.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama previa conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-seed1234-base | 2,81B | 4.096 | Apache 2.0 | en | Modelo base de investigación, sin benchmarks públicos |
| SmolLM2-1.7B | 1,7B | 8.192 (según versión) | Apache 2.0 | en (multilingüe parcial) | Comparte vocabulario; orientado a uso general con SFT |
| Llama 3.2 3B | 3,2B | 128.000 | Llama 3.2 Community License | multilingüe | Asistente ajustado con RLHF, contexto muy superior |
| Qwen2.5-3B | 3,1B | 32.768 | Apache 2.0 | multilingüe | Base y instruct disponibles, con benchmarks publicados |

La comparación directa con estos modelos no es equivalente: el 1pp-2.81b es un artefacto de investigación sin ajuste por instrucciones ni evaluaciones estándar, mientras que las alternativas son modelos de propósito general con pipelines de alineación completos. La comparación válida es frente a los otros peldaños de la misma escala (0,58B, 0,98B y 1,66B) y a las otras condiciones y semillas del estudio 1PP.

## Limitaciones y advertencias

- Modelo base sin alineación: no sigue instrucciones de forma consistente, no rechaza contenido dañino y puede producir texto incoherente o repetitivo fuera de la distribución de entrenamiento.
- No es un asistente de propósito general; el propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Contexto limitado a 4.096 tokens, muy por debajo de los estándares actuales de 32K a 128K.
- Riesgo de alucinación elevado al no haber pasado por RLHF ni por ajuste supervisado; no apto para producción sin fine-tuning y evaluación previos.
- Sesgos: no se documentan análisis de sesgo; el corpus de conversaciones reescritas puede heredar sesgos de los documentos originales, no especificados.
- Sin turno de sistema: el chat template no contempla mensajes de sistema, lo que limita el control de comportamiento mediante instrucciones de sistema.
- Licencia Apache 2.0 permisiva para uso comercial, pero la ausencia de garantías y de evaluaciones de seguridad hace desaconsejable su uso comercial directo.
- Fecha de creación del repositorio (2026-11-06) y ausencia de descargas y likes: modelo muy reciente y sin validación comunitaria.
- No se publican variantes cuantizadas oficiales ni resultados de benchmarks estándar, lo que dificulta la comparación objetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, proyecto 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, proyecto 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
