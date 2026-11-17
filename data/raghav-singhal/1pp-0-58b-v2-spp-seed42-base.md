# Raghav-Singhal/1pp-0.58b-v2-spp-seed42-base

## Resumen

El modelo `1pp-0.58b-v2-spp-seed42-base` es un modelo de lenguaje de tipo decoder Llama con 580.447.872 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. Se trata de un artefacto de investigación, no de un asistente de propósito general: es la línea base SPP{T0} de una escalera de escalado que compara distintas condiciones de preentrenamiento sobre el mismo corpus.

El modelo parte del corpus crudo de 1PP (documentos DCLM-edu) y aplica la condición SPP{T0}: a 7.738.994 documentos se les inserta una reflexión en primera persona generada por un modelo de reflexión, marcada con el token `<assistant>` (id 49153). El modelo se entrena sobre los tokens de la reflexión pero no sobre el marcador, y una máscara de atención impide que el texto posterior a la reflexión atienda a esta, de modo que el documento se modela como si la reflexión no estuviera.

Su relevancia es experimental: permite aislar el efecto de la condición SPP frente al modelo crudo de referencia (`1pp-0.58b-v2-raw-seed42-base`) bajo idéntico stream de datos, mismo número de pasos y mismo schedule. La arquitectura es un transformer decoder de 24 capas, contexto de 4.096 tokens y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.447.872 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en bf16; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 KV heads (GQA con head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) ampliado con `<|pad|>` (49152) y el marcador SPP `<assistant>` (49153); `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento cubre 11.106 pasos sobre el stream alineado por pasos del modelo crudo (23,29B posiciones de token), con batch global de 512 × 4.096 tokens y máscara de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16. La innovación técnica es la inserción de reflexiones en primera persona en 7.738.994 documentos (todos los marcados por un clasificador de seguridad basado en gte, más un número igual de no marcados elegidos al azar), con el marcador `<assistant>` seguido de la reflexión (máximo 256 tokens) y el resto del documento. Los tokens añadidos desplazan algunos documentos uno o dos pasos; 1.289 de 80,9M documentos quedaron fuera de una mitad de datos y no se entrenaron.

## Capacidades

- Generación de texto autoregresiva en inglés sobre documentos, con pérdida de validación de 2,614 (texto de documento), 2,901 (texto de asistente) y 3,002 (texto de usuario) por token.
- Escritura de reflexiones en primera persona: al añadir `<assistant>` tras el texto de un documento, el modelo genera una reflexión; no existe token que marque el final de la reflexión.
- Formato de chat SPP sin turno de sistema, con el marcador `<assistant>` abriendo cada turno del asistente (sin salto de línea posterior) y parada en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).
- Plantilla de chat incluida en `tokenizer_config.json` y `chat_template.jinja`, con prompt de generación terminado en `<|im_start|><assistant>`.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación sobre condiciones de preentrenamiento: comparar la pérdida de validación de esta línea base SPP{T0} con la del modelo crudo (`1pp-0.58b-v2-raw-seed42-base`) para medir el efecto de las reflexiones insertadas sobre el mismo stream de datos.
- Reproducción de experimentos de escalado: el checkpoint y los logs de wandb permiten replicar la condición SPP{T0} con semilla 42 y contrastar con las condiciones Filtered y raw de la escalera 1PP.
- Estudio de máscaras de atención personalizadas: sirve para analizar cómo afecta la máscara que impide al texto posterior atender a la reflexión, comparando con la atención causal estándar de Hugging Face.
- Generación de reflexiones sintéticas: añadiendo `<assistant>` tras un documento se obtienen reflexiones en primera persona que pueden emplearse como datos de entrenamiento o para estudiar el estilo del modelo de reflexión.
- Evaluación de modelos pequeños en inglés: con 580M parámetros y contexto de 4.096 tokens, es adecuado como baseline de bajo coste en experimentos controlados de NLP en inglés.
- Verificación de conversión de pesos: los pesos HF se comprobaron contra el checkpoint de Megatron con diferencias absolutas de 0,0017 y 0,0019 en pérdida, por lo que el modelo sirve como referencia para validar pipelines de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta pérdidas de validación y verificación de pesos:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,8994 | 2,9011 | 0,0017 |
| raw_val50m segments [8] | 2,6160 | 2,6140 | 0,0019 |

| Texto evaluado (checkpoint final, 2.433 documentos retenidos) | Pérdida por token |
|---|---|
| Texto de documento | 2,614 |
| Texto de asistente | 2,901 |
| Texto de usuario | 3,002 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos (tamaño del repo), más overhead de activaciones y KV cache; en la práctica, unos 2-3 GB en bf16 para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 0,6-0,8 GB de pesos; en 4 bits, en torno a 0,3-0,4 GB. No se documentan cuantizaciones oficiales publicadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4-8 GB de VRAM puede alojar el modelo en bf16 o cuantizado (por ejemplo, RTX 3060, RTX 4060, RTX 4090); para entrenamiento o evaluación a contexto completo de 4.096 tokens conviene una A100 o H100.
- Sí cabe en GPU consumer: el tamaño de 580M parámetros lo sitúa en el rango de tarjetas de gama media.
- Opciones de despliegue: transformers (referencia oficial), text-generation-inference (tag `text-generation-inference`), endpoints compatible; llama.cpp, Ollama o vLLM no están documentados en la información disponible, aunque el formato safetensors permite su conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-spp-seed42-base | 580.447.872 | 4.096 | Apache 2.0 | Hugging Face | Línea base SPP{T0} de la escalera 1PP |
| 1pp-0.58b-v2-raw-seed42-base | 0,58B (según nombre) | 4.096 (misma arquitectura) | No disponible en la información | Hugging Face | Modelo crudo de referencia, mismo stream y schedule |
| SmolLM2 (familia) | No disponible | No disponible | No disponible | Hugging Face | Origen del vocabulario (49.152 tokens) usado por este modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigación del proyecto 1PP (EPFL DLAB); el autor indica explícitamente que no es un asistente de propósito general.
- Modelo base entrenado sobre documentos: produce texto plano, no respuestas de chat; la plantilla de chat existe solo para alinear los prompts con los modelos SFT de SPP{T0}.
- La atención causal estándar de Hugging Face permite que el texto posterior a una reflexión la vea, algo que nunca ocurrió durante el entrenamiento; esto puede degradar el comportamiento en ese escenario.
- No hay token que marque el final de una reflexión, lo que complica el parseo automático de las salidas.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la model card; al entrenarse sobre DCLM-edu con un clasificador de seguridad basado en gte, pueden persistir sesgos del corpus y del filtro.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación sin evaluaciones de seguridad ni benchmarks estándar, no es recomendable para producción sin validación adicional.
- Semilla única (42): los resultados pueden no generalizar a otras semillas.
- Descargas y likes en Hugging Face: 0 en el momento de la consulta, lo que refleja su carácter de artefacto experimental.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-spp-seed42-base
- Modelo crudo de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
