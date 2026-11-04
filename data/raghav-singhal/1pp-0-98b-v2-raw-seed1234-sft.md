# Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-sft

## Resumen

1pp-0.98b-v2-raw-seed1234-sft es un modelo de lenguaje de 981.545.472 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la composición de los datos de preentrenamiento afecta al comportamiento del modelo. Este checkpoint concreto pertenece a la "escalera" (ladder) v2, que entrena sistemáticamente cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) bajo tres condiciones de datos y tres semillas distintas, todos desde cero sobre el mismo flujo de datos alineado por pasos.

El modelo emplea una arquitectura transformer decoder de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU y atención con 12 cabezas de consulta y 4 de clave/valor. El contexto máximo es de 4.096 tokens y el vocabulario es el de SmolLM2 (49.152 entradas) más un token de padding. La condición "raw" de este checkpoint implica que el preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con la pérdida calculada sobre todos los tokens del documento y el token de fin de documento.

Tras el preentrenamiento (18.779 pasos, equivalentes a 39,38B posiciones de token), el modelo recibió un epoch de SFT sobre una mezcla de 400.000 conversaciones. Es relevante ahora porque forma parte de un conjunto controlado que permite aislar el efecto de la condición de datos y de la semilla en el comportamiento final, algo poco habitual en modelos publicados. La licencia es Apache 2.0 y los pesos están en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atención y 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 981.545.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza de 12 cabezas de consulta y 4 de clave/valor (GQA), dimensión de cabeza 128, FFN SwiGLU de 6.144 unidades, normalización RMSNorm y RoPE con base 10.000. No usa biases ni QK-norm, y los embeddings de entrada y salida no están atados. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se entrenaron 18.779 pasos del flujo alineado por pasos de 1PP (39,38B posiciones de token), con batch global de 512 secuencias de 4.096 tokens y enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos retenidos es de 2,497 sobre texto de documento, 2,638 sobre texto de asistente y 2,661 sobre texto de usuario.

El SFT consistió en un epoch sobre una mezcla de 400.000 conversaciones: 98,5k conversaciones multiturno de `jkminder/model-raising-pb-100k-3c-mt-sft`, 271,6k de `dlab-spp/sp-sft-normal-300k` (excluyendo prompts duplicados del primer conjunto) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,002, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en tokens de asistente sobre 1.998 conversaciones retenidas es de 2,046.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento y respuesta a instrucciones adquiridos mediante SFT sobre mezclas multiturno.
- Conversación multiturno (el conjunto de SFT incluye 98,5k conversaciones multiturno).
- Comportamiento orientado a seguridad, gracias a la muestra de 30k conversaciones del conjunto de seguridad.
- Capacidad de seguir el formato de plantilla ChatML con delimitadores `<|im_start|>` y `<|im_end|>`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: el modelo sirve como punto de comparación controlado frente a los otros checkpoints de la escalera 1PP (mismos datos, misma semilla, distinta condición), permitiendo aislar el efecto de la condición de datos en las métricas finales.
- Estudios de reproducibilidad y varianza por semilla: al existir tres semillas (28, 42, 1234) por tamaño y condición, se puede medir cuánta variación introduce únicamente la inicialización de parámetros sobre las mismas secuencias de batch.
- Análisis de escalado de tamaño: con cuatro tamaños (0,58B, 0,98B, 1,66B, 2,81B) entrenados con la misma proporción de 20,3 tokens de asistente por parámetro, permite trazar curvas de escalado limpias.
- Evaluación de la transición preentrenamiento a SFT: al publicarse el checkpoint tras SFT, se puede estudiar cómo un modelo de 0,98B con 39,38B tokens de preentrenamiento responde a un epoch de instrucción sobre 400k conversaciones.
- Prototipado de pipelines de evaluación de modelos pequeños: su tamaño (2,0 GB en safetensors) permite cargarlo en una sola GPU consumer para pruebas de formato, plantillas y métricas de pérdida.
- Reproducción de pérdidas de validación: la model card documenta la verificación de los pesos HF contra el checkpoint de Megatron con una diferencia absoluta de 0,0000 en la pérdida de SFT, lo que facilita replicar los resultados.
- Docencia y experimentación con arquitecturas Llama a pequeña escala: 24 capas y 981M de parámetros permiten estudiar GQA, Muon y enmascaramiento entre documentos sin grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente (validación de preentrenamiento) | 2,638 |
| Texto de usuario (validación de preentrenamiento) | 2,661 |
| Texto de documento (validación de preentrenamiento) | 2,497 |
| Tokens de entrenamiento de esta condición (`raw_doc_eod(8+5)`) | 2,498 |
| SFT en tokens de asistente (1.998 conversaciones retenidas) | 2,046 |

Verificación de pesos HF frente a Megatron en `sft_val` segmentos [3, 4]: pérdida HF 2,0464, referencia Megatron 2,0463, diferencia absoluta 0,0000.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB para los pesos (981M parámetros × 2 bytes) más memoria para el contexto y el estado de atención; en la práctica, entre 3 y 5 GB según longitud de secuencia y framework.
- En cuantización de 8 bits: alrededor de 1 GB de pesos; en 4 bits: alrededor de 0,5 GB, más overhead.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 con contexto completo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son válidas. Cabe holgadamente en GPUs consumer.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). Al ser safetensors, es convertible a GGUF para llama.cpp/Ollama y a formatos de vLLM.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.98b-v2-raw-seed1234-sft | 981.545.472 | 4.096 | Apache 2.0 | Artefacto de investigación 1PP, solo inglés, sin benchmarks publicados |
| SmolLM2-1.7B | no disponible en la información proporcionada | no disponible | no disponible | Comparte vocabulario (49.152) con este modelo, pero no se dispone de datos comparativos |
| Otros checkpoints de la escalera 1PP (0,58B, 1,66B, 2,81B) | 0,58B / 1,66B / 2,81B | 4.096 | Apache 2.0 | Misma condición y semilla, distinto tamaño; comparación directa dentro del estudio |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El autor indica explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Solo soporta inglés; no se documentan capacidades multilingües.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo.
- El chat template no incluye turno de sistema: los modelos nunca vieron uno, por lo que inyectar mensajes de sistema puede degradar el comportamiento.
- Riesgo de alucinación inherente a un modelo de 0,98B entrenado con 39,38B tokens; no se han publicado evaluaciones de factualidad.
- No se han publicado evaluaciones de sesgos; al entrenarse sobre DCLM-edu y mezclas de SFT, puede heredar sesgos de esas fuentes.
- Sin soporte documentado de tool calling, agentes o modos de razonamiento explícito.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad hace desaconsejable su uso en producción sin evaluación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter de artefacto reciente y poco validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
