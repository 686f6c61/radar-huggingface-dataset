# g-assismoraes/tofu-llama2-7b-reset-embed

## Resumen

`g-assismoraes/tofu-llama2-7b-reset-embed` es un checkpoint experimental derivado de Llama 2, publicado por el usuario g-assismoraes. No se trata de un modelo entrenado, sino de un artefacto de ablación para experimentos de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Concretamente, toma el modelo `locuslab/tofu_ft_llama2-7b` (un Llama 2 7B Chat afinado sobre TOFU) y restaura únicamente el tensor `model.embed_tokens.weight` a sus valores originales del checkpoint `NousResearch/Llama-2-7b-chat-hf`, dejando el resto de pesos en su estado afinado.

El objetivo es medir cuánto del comportamiento de "desaprendizaje" o de retención de conocimiento ficticio depende exclusivamente de la capa de embeddings, sin aplicar ningún tipo de entrenamiento de unlearning (ni IHL ni similares). Por tanto, es una pieza de investigación para aislar el efecto de un único componente del modelo en la evaluación Forget Quality y Model Utility de TOFU, no un modelo pensado para uso general.

Su relevancia es metodológica: sirve como línea base en estudios de desaprendizaje y como control negativo en comparativas frente a técnicas reales de unlearning. La arquitectura subyacente es la de Llama 2 7B (transformer decoder-only denso), con 6.738.415.616 parámetros y sin datos publicados sobre longitud de contexto específica más allá de la del modelo base (4.096 tokens en Llama 2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 2 soporta 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B Chat: transformer decoder-only denso con atención multi-cabeza estándar, normalización RMSNorm y activación SwiGLU. No hay innovaciones arquitectónicas propias; el checkpoint hereda la estructura y los hiperparámetros del modelo base.

El proceso de construcción de este checkpoint no implica entrenamiento. Según la model card, se parte de `locuslab/tofu_ft_llama2-7b` (Llama 2 7B Chat afinado sobre el dataset completo TOFU) y se reemplaza el tensor `model.embed_tokens.weight` por el del checkpoint original `NousResearch/Llama-2-7b-chat-hf`. El autor indica que la restauración es exacta tras convertir los tensores de origen al dtype de evaluación. No se realiza ningún tipo de entrenamiento de unlearning (IHL u otros). El resto de pesos permanece en el estado afinado sobre TOFU. El dataset TOFU en sí consiste en pares pregunta-respuesta sobre autores ficticios, diseñado para evaluar la capacidad de un modelo de olvidar un subconjunto concreto de conocimiento sin degradar el rendimiento general.

## Capacidades

- Generación de texto en inglés con el estilo y las capacidades heredadas de Llama 2 7B Chat.
- Razonamiento conversacional multi-turno, limitado por la ventana de contexto del modelo base.
- Respuesta a preguntas sobre el corpus TOFU (autores ficticios) en la medida en que los pesos no restaurados conservan el ajuste fino.
- Capacidad reducida o alterada respecto al modelo afinado en todo lo que dependa de la representación de embeddings, al haberse restaurado esa capa.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, visión, audio ni otras capacidades especiales.
- Multilingüismo limitado al inglés según la model card.

## Casos de uso

- Ablación en investigación de machine unlearning: usar el checkpoint como control para medir la contribución de la capa de embeddings a las métricas Forget Quality y Model Utility de TOFU, comparándolo con el modelo afinado y con variantes entrenadas con IHL.
- Reproducibilidad de experimentos: permite replicar la restauración exacta de un tensor concreto y verificar que el casting de dtype no introduce diferencias numéricas.
- Estudio de representaciones: analizar cómo cambia la distribución de embeddings entre el modelo original y el afinado sobre TOFU, y qué efecto tiene revertir solo esa capa.
- Línea base en papers de unlearning: servir como referencia "sin entrenamiento" frente a métodos que sí optimizan para olvidar, aislando el efecto de la intervención mínima.
- Docencia y divulgación: ejemplo didáctico de cómo se compone un checkpoint a partir de tensores de dos modelos distintos y de las precauciones de dtype.
- Validación de pipelines de evaluación TOFU: probar harnesses de evaluación que calculen Forget Quality y Model Utility sobre un modelo con comportamiento parcialmente alterado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un informe de evaluación externo para Forget Quality y Model Utility, pero no se incluyen cifras en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-18 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S, RTX A6000.
- GPU de consumo: cabe en RTX 4090 (24 GB) en fp16 con margen; en RTX 3090 (24 GB) también; en GPUs de 16 GB requiere cuantización o offloading.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF, no publicada), Ollama (previa conversión), Transformers con accelerate.
- Latencia y throughput: no disponibles; no se han publicado mediciones para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-reset-embed | 6.738.415.616 | no disponible (base 4.096) | Checkpoint de ablación (sin entrenamiento) | llama2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M (Llama 2 7B) | 4.096 | Fine-tune completo sobre TOFU | llama2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | 4.096 | Chat base de Llama 2 | llama2 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación con fines de ablación, sin evaluación de calidad publicada en la información disponible.
- Al restaurar solo los embeddings, el comportamiento puede ser incoherente: la representación de entrada no coincide con la distribución esperada por el resto de capas afinadas sobre TOFU.
- Riesgo de alucinación heredado de Llama 2 7B Chat, potencialmente amplificado por la mezcla de pesos.
- Idiomas: solo inglés documentado; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia Llama 2 Community License: restricciones de uso comercial (umbral de 700 millones de usuarios mensuales), obligación de atribución y de incluir el aviso de licencia; revisar el texto completo antes de cualquier uso.
- No se documentan sesgos específicos, pero hereda los sesgos del corpus de preentrenamiento de Llama 2 y del dataset TOFU.
- No hay variantes cuantizadas publicadas ni garantías de que la conversión a GGUF preserve el comportamiento del checkpoint.
- El checkpoint se publicó con 0 descargas y 0 likes, por lo que no hay validación comunitaria de su funcionamiento.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/g-assismoraes/tofu-llama2-7b-reset-embed
- Modelo base afinado sobre TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo original de referencia: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Otro modelo del mismo autor (referencia): https://huggingface.co/g-assismoraes/DeltaP2S-Llama2-13B-P2S-curio7B-ptbr-S13-a025
