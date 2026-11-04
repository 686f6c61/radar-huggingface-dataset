# Raghav-Singhal/1pp-0.98b-v2-raw-seed42-sft

## Resumen

1pp-0.98b-v2-raw-seed42-sft es un modelo de lenguaje de 981.545.472 parámetros (0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general, diseñado para estudiar cómo la composición de los datos de preentrenamiento afecta al comportamiento del modelo. Concretamente, esta variante corresponde a la condición "raw" (documentos originales sin transformar), semilla 42, y ha recibido un ajuste supervisado (SFT) posterior sobre conversaciones.

El modelo emplea una arquitectura decoder de estilo Llama con 24 capas, dimensión oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV, normalización RMSNorm y embeddings no atados. La longitud de contexto es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. Forma parte de una escalera de escalado (ladder v2) con cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones y tres semillas, todos entrenados desde cero sobre el mismo flujo de datos alineado por pasos.

Su relevancia es metodológica: permite aislar el efecto de la condición de datos y de la inicialización de parámetros manteniendo constante el resto del pipeline. El modelo está publicado con licencia Apache 2.0, en formato safetensors, y es compatible con transformers y text-generation-inference, aunque su orientación es claramente académica y experimental.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parámetros totales | 981.545.472 (0,98B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | No disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 24 capas con dimensión oculta 1.536 y FFN de 6.144 con activación SwiGLU. La atención usa 12 cabezas de consulta y 4 cabezas KV (head dim 128), con RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador combina el vocabulario de SmolLM2 (49.152 tokens) con un token `<|pad|>` adicional; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se entrenaron los primeros 18.779 pasos del flujo alineado de 1PP (39,38B posiciones de token), que corresponden a los primeros pasos del recorrido principal de 31.777 pasos en el mismo orden. El batch global fue de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (matrix LR 0,005) con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 1.181 pasos, decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, init std 0,0103 y precisión bf16.

El SFT consistió en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno con track citado por constitución), `dlab-spp/sp-sft-normal-300k` menos los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos del asistente), matrix LR 0,002, semilla 28 y batch global 128 × 4.096. La pérdida de validación final en el checkpoint es de 2,633 (texto del asistente), 2,672 (texto del usuario), 2,497 (texto de documento) y 2,498 en la columna ponderada de tokens de entrenamiento de la condición. La pérdida SFT en held-out (1.998 conversaciones) es de 2,049.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Razonamiento de un solo turno y multi-turno dentro de una ventana de 4.096 tokens.
- Comprensión y generación de texto de documentos (condición de preentrenamiento sobre documentos originales).
- Conversaciones de seguridad y de tipo "constitution-cited" gracias a la mezcla de SFT.
- No soporta tool calling ni function calling de forma nativa (no se documenta en la model card).
- No soporta agentes multi-paso ni razonamiento extendido (thinking mode) de forma explícita.
- Capacidades multilingües limitadas al inglés; no se reportan otros idiomas.
- No dispone de visión, audio ni modalidades adicionales.

## Casos de uso

- Investigación sobre escalado de datos: comparar esta variante (condición raw, semilla 42) con las otras condiciones y semillas de la ladder v2 para aislar el efecto de la composición de datos en el comportamiento final.
- Reproducibilidad de experimentos: al estar el flujo de datos alineado por pasos y publicarse logs de wandb, sirve como referencia para replicar curvas de pérdida y validar pipelines de entrenamiento propios.
- Estudio de dinámicas de SFT: analizar cómo un SFT de 400k conversaciones sobre un modelo de 0,98B afecta a la pérdida de validación y a la calidad conversacional en un rango de tamaño pequeño.
- Evaluación de sesgos y seguridad: utilizar la mezcla de seguridad incluida en el SFT para medir la respuesta del modelo ante prompts sensibles en un contexto controlado.
- Baseline en experimentos de destilación o poda: su tamaño (0,98B) y su licencia permisiva lo hacen adecuado como punto de partida para comparar técnicas de compresión.
- Docencia y formación: ejemplo didáctico de pipeline completo (preentrenamiento con Muon, SFT con ChatML, verificación de pesos HF vs Megatron) para cursos de entrenamiento de LLM.
- Prototipado de chatbots de dominio cerrado en inglés: dentro de su ventana de 4.096 tokens y con expectativas ajustadas a un modelo de 0,98B, puede usarse para demos internas de conversación multi-turno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Pérdida |
|---|---|
| Texto del asistente (validación, checkpoint final) | 2,633 |
| Texto del usuario (validación, checkpoint final) | 2,672 |
| Texto de documento (validación, checkpoint final) | 2,497 |
| Columna ponderada de tokens de entrenamiento de la condición | 2,498 |
| SFT held-out (tokens del asistente, 1.998 conversaciones) | 2,049 |
| Verificación HF vs Megatron (segmentos sft_val [3, 4]) | 2,0488 vs 2,0487 (diff 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contexto completo de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1 GB para pesos; en 4 bits, aproximadamente 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) es suficiente; para despliegue en producción con concurrencia, A10G, L4 o A100.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 8 GB o más.
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama previa conversión a GGUF. El repo incluye `chat_template` compatible con ChatML sin turno de sistema.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-raw-seed42-sft | 0,98B | 4.096 | Apache 2.0 | en | Artefacto de investigación con SFT; sin benchmarks publicados |
| SmolLM2-1.7B (HuggingFaceTB) | 1,7B | 8.192 | Apache 2.0 | en (multilingüe parcial) | Modelo generalista con benchmarks publicados; tokenizador compartido con 1pp |
| Llama 3.2 1B (Meta) | 1,24B | 128k | Llama 3.2 Community License | multilingüe | Modelo generalista con tool calling y benchmarks publicados |
| Qwen2.5-1.5B (Alibaba) | 1,54B | 32.768 | Apache 2.0 | multilingüe | Modelo generalista con benchmarks publicados y buen rendimiento en código |

La comparación con modelos generalistas debe interpretarse con cautela: 1pp-0.98b-v2-raw-seed42-sft es un artefacto de investigación sin evaluación estándar publicada, por lo que no es posible establecer una comparación de rendimiento directa con las alternativas.

## Limitaciones y advertencias

- Modelo de investigación: el propio autor lo describe como "research artifact" y "not a general-purpose assistant"; no debe usarse como asistente de producción sin una evaluación exhaustiva.
- Idiomas: solo inglés; no se reporta soporte multilingüe.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.
- Riesgo de alucinación: al ser un modelo de 0,98B con SFT sobre conversaciones, es esperable una tasa de alucinación superior a la de modelos mayores; no se han publicado mediciones.
- Sesgos: la mezcla de SFT incluye un conjunto de seguridad, pero no se documentan evaluaciones de sesgo ni de toxicidad.
- Sin tool calling ni soporte de agentes: no apto para pipelines que requieran function calling.
- Formato de chat estricto: ChatML sin turno de sistema; introducir un turno de sistema puede degradar el comportamiento porque el modelo nunca lo vio durante el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de garantías y de evaluación de calidad hace desaconsejable su uso en producción sin validación propia.
- Verificación limitada: la comprobación HF vs Megatron se realizó solo sobre los segmentos [3, 4] de sft_val.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed42-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto SFT principal: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
- Tokenizador de referencia (SmolLM2): https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B
