# Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed1234-base

## Resumen

El modelo `1pp-0.58b-v2-ua-rawanneal-seed1234-base` es un modelo de lenguaje de tipo decoder transformer con 580.445.568 parámetros (0,58B), desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar el efecto que tiene sobre el preentrenamiento la sustitución de documentos originales por conversaciones reescritas a partir de esos mismos documentos.

Este checkpoint concreto pertenece a la "ladder v2", una escalera de escalado que cruza cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234). La variante `rawanneal` es una ejecución de mid-training: entrena con los documentos originales de DCLM-edu hasta el paso 9.996 (el último con learning rate máximo) y después aplica el cooldown final de 1.110 pasos sobre conversaciones 1PP en lugar de documentos, con pérdida sobre los turnos de usuario y asistente.

Su relevancia es metodológica: al mantener alineados paso a paso los flujos de datos y variar únicamente el texto de los documentos y la máscara de pérdida, permite aislar el impacto de los datos conversacionales frente a los documentos crudos en un mismo presupuesto de cómputo (20,3 tokens de asistente por parámetro). La arquitectura es un Llama-style decoder de 24 capas con contexto de 4.096 tokens, licencia Apache 2.0 y pesos en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Llama-style decoder transformer, 24 capas, hidden 1.152, FFN 4.608 (SwiGLU) |
| Parámetros totales | 580.445.568 (0,58B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

Otros detalles arquitectónicos: 9 cabezas de atención y 3 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados (untied), sin biases, sin QK-norm. Tokenizer con vocabulario SmolLM2 (49.152) más `<|pad|>`; `<|endoftext|>` marca fin de documento.

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención con 3 cabezas KV (GQA implícito, dimensión de cabeza 128), RMSNorm, RoPE base 10.000 y embeddings no atados. La longitud de secuencia es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos (cross-document attention masking).

El entrenamiento se realizó desde cero con batch global de 512 secuencias × 4.096 tokens. El optimizador es Muon (shape scaling, learning rate matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas). El schedule incluye 699 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, con weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. Los primeros 9.996 pasos usan los documentos originales de DCLM-edu; el cooldown de 1.110 pasos usa conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre los turnos de usuario y asistente. El total asciende a 11.106 pasos y 23,29B posiciones de token, con 1,782 tokens de entrenamiento ponderados para esta condición. La pérdida de validación final (2.433 documentos retenidos) es de 1,806 sobre texto de asistente, 1,672 sobre texto de usuario y 3,164 sobre texto de documento. La verificación frente al checkpoint de Megatron arroja diferencias absolutas de 0,0015 en ambos conjuntos de validación.

## Capacidades

- Generación de texto autoregresiva en inglés, con formato conversacional ChatML aprendido durante el cooldown.
- Producción de texto con estructura de diálogo usuario/asistente, ya que la condición `ua` aplica pérdida sobre ambos turnos.
- No es un modelo de instrucciones ni un asistente: es un modelo base sin ajuste por RLHF, DPO ni SFT posterior.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de razonamiento multi-paso o agentes.
- Sin capacidades multimodales (ni visión ni audio).
- Sin modo "thinking" explícito.
- Multilingüismo limitado al inglés según la model card.
- Contexto de 4.096 tokens, adecuado para documentos y conversaciones de longitud media, no para contextos largos.

## Casos de uso

- Investigación sobre datos de preentrenamiento: comparar este checkpoint con `1pp-0.58b-v2-ua-seed1234-base` y con `1pp-0.58b-v2-raw-seed1234-base` permite medir el efecto del cooldown conversacional manteniendo constantes inicialización, orden de batches y presupuesto de cómputo.
- Reproducción de experimentos de escalado: al ser una semilla concreta (1234) de una ladder con tres semillas, sirve para estimar varianza entre inicializaciones en estudios de scaling laws.
- Estudio de formatos conversacionales sintéticos: el modelo ha visto conversaciones reescritas a partir de documentos educativos, por lo que es útil para analizar cómo se transfiere el conocimiento documental al formato diálogo.
- Evaluación de pérdida y perplejidad por segmento: la model card publica pérdidas de validación desglosadas por tipo de texto (asistente, usuario, documento), lo que facilita análisis fine-grained de calidad por dominio.
- Baseline para experimentos de mid-training: sirve como referencia de "annealing sobre conversaciones" frente a annealing sobre documentos en pipelines de investigación propios.
- Prototipado de infraestructura de inferencia a pequeña escala: con 0,58B parámetros y safetensors estándar, se puede desplegar en GPUs de consumo para validar pipelines de transformers o TGI antes de escalar a los modelos de 1,66B o 2,81B de la misma ladder.
- Docencia y divulgación: un modelo pequeño, con logs de wandb públicos y protocolo de verificación documentado, es adecuado para explicar cómo se valida un checkpoint de HuggingFace contra su original en Megatron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,806 |
| Texto de usuario | 1,672 |
| Texto de documento | 3,164 |
| Tokens de entrenamiento ponderados de esta condición | 1,782 |

| Verificación HF vs Megatron | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,8040 | 1,8055 | 0,0015 |
| raw_val50m segments [8] | 3,1651 | 3,1635 | 0,0015 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6-0,8 GB de pesos; en 4 bits, alrededor de 0,3-0,4 GB, aunque no se publican checkpoints cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema. En GPUs de datacenter el modelo queda muy infrautilizado.
- Cabe holgadamente en GPUs de consumo, incluidas las de gama media y algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y potencialmente llama.cpp u Ollama si se generan pesos GGUF, aunque no se publican conversiones oficiales.
- Latencia y throughput: no disponibles en la información proporcionada. Por tamaño, se espera un throughput alto en GPUs modernas, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-rawanneal-seed1234-base | 0,58B | 4.096 | Apache 2.0 | Mid-training con cooldown conversacional (investigación) | HuggingFace |
| 1pp-0.58b-v2-ua-seed1234-base | 0,58B | 4.096 | Apache 2.0 | Condición 1PP completa (investigación) | HuggingFace |
| 1pp-0.58b-v2-raw-seed1234-base | 0,58B | 4.096 | Apache 2.0 | Baseline con documentos crudos (investigación) | HuggingFace |
| SmolLM2-360M / 1.7B | 0,36B / 1,7B | 8.192 (SmolLM2) | Apache 2.0 | Modelo base y de instrucciones de propósito general | HuggingFace |

La comparación más directa es interna a la propia ladder 1PP, ya que los tres checkpoints comparten inicialización, orden de batches y presupuesto de cómputo, lo que permite atribuir diferencias de rendimiento a la condición de datos. Frente a modelos de propósito general como SmolLM2, la diferencia clave es que este checkpoint no está pensado para uso como asistente ni ha pasado por alineación, y su tokenizer deriva precisamente del vocabulario de SmolLM2.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo declara explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB).
- No ha pasado por RLHF, DPO ni SFT, por lo que no sigue instrucciones de forma fiable y puede generar respuestas incoherentes o repetitivas en uso conversacional real.
- Riesgo elevado de alucinación, especialmente fuera de dominios representados en DCLM-edu.
- Sesgos heredados de DCLM-edu y de las conversaciones sintéticas generadas a partir de esos documentos; no se documenta ningún proceso de mitigación.
- Soporte exclusivo de inglés según la model card; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- El chat template no incluye turno de sistema: introducir uno produciría un formato fuera de distribución, ya que los modelos "nunca vieron uno" durante el entrenamiento.
- El modelo no ha visto conversaciones reales, sino reescrituras sintéticas de documentos educativos, lo que limita la naturalidad del diálogo.
- Aunque la licencia es Apache 2.0 y permite uso comercial, la falta de alineación y de evaluaciones de seguridad desaconseja su uso en producción orientada a usuarios finales.
- El checkpoint se publicó con 0 descargas y 0 likes en el momento de la consulta, y la fecha de creación indicada (2026-11-03) es posterior a la de esta ficha, lo que sugiere que puede tratarse de un artefacto reciente o de metadatos inconsistentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-seed1234-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed1234-base
- Variante raw (baseline): https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
