# Raghav-Singhal/1pp-0.98b-v2-ua-seed1234-base

## Resumen

1pp-0.98b-v2-ua-seed1234-base es un modelo de lenguaje de 981.545.472 parametros (aproximadamente 0,98B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. Se trata de un artefacto de investigacion disenado para estudiar como la composicion del corpus de preentrenamiento afecta al comportamiento conversacional del modelo, no un asistente de proposito general. Forma parte de la "ladder v2", una escalera de escalado con cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234), entrenados desde cero sobre el mismo flujo de datos alineado por pasos.

La arquitectura es un decoder estilo Llama con 24 capas, dimension oculta de 1.536, FFN de 6.144 con SwiGLU, 12 cabezas de atencion y 4 cabezas KV (GQA), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`. Este checkpoint concreto corresponde a la condicion "ua" (conversaciones reescritas con perdida sobre turnos de usuario y asistente) y a la semilla 1234.

Su relevancia es metodologica: permite aislar el efecto del texto de los documentos y de la mascara de perdida (las condiciones solo difieren en eso, y las semillas solo en la inicializacion de parametros), con 20,3 tokens de asistente por parametro y verificacion de los pesos de HuggingFace contra el checkpoint original de Megatron. Es, por tanto, una pieza para experimentacion controlada y reproducibilidad, no para despliegue en produccion como chatbot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card (pesos publicados en safetensors, presumiblemente bf16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; repo de 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de tipo Llama con 24 capas, dimension oculta de 1.536, FFN de 6.144 con activacion SwiGLU, 12 cabezas de atencion y 4 cabezas KV (GQA con dimension de cabeza 128), normalizacion RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se anade `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. La longitud de secuencia es de 4.096 tokens y se aplica mascara de atencion entre documentos (cross-document attention masking).

El preentrenamiento usa las conversaciones 1PP reescritas a partir de los documentos originales, con perdida calculada sobre los turnos de usuario y de asistente. Se consumen los primeros 18.779 pasos del flujo alineado por pasos del estudio principal (39,38B posiciones de token), que son los primeros pasos de la pasada de 31.777 pasos en el mismo orden. El batch global es de 512 secuencias x 4.096 tokens. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parametros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 1.181 pasos de warmup, LR constante y decaimiento lineal en los ultimos 1.877 pasos hasta 1/100, weight decay 0,1, desviacion tipica de inicializacion 0,0103 y entrenamiento en bf16. La perdida de validacion por token sobre 2.433 documentos retenidos en el checkpoint final es de 1,532 para texto de asistente, 1,427 para texto de usuario y 3,252 para texto de documento; la columna ponderada de la condicion (`reweighted_seg1234`) da 1,526. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando perdidas de validacion (diferencia absoluta de 0,0014 en los conjuntos val50m y raw_val50m).

## Capacidades

- Generacion de texto autoregresiva en ingles con formato de conversacion ChatML, aunque el modelo es un checkpoint base sin ajuste de instrucciones.
- Continuacion y modelado de dialogos multi-turno: la condicion "ua" produce texto con formato de chat; la condicion base cruda produce texto plano.
- Razonamiento y conocimiento general limitados por su escala (0,98B) y por el volumen de preentrenamiento (39,38B posiciones de token).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues: solo ingles declarado (`language: en`).
- No dispone de modo "thinking", vision ni audio.
- Plantilla de chat incluida (`chat_template`) que renderiza exactamente el formato ChatML sin turno de sistema; la generacion se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos en `eos_token_id`.

## Casos de uso

- Investigacion sobre preentrenamiento conversacional: el modelo sirve como punto de la escalera v2 para medir el efecto de la condicion "ua" (perdida en turnos de usuario y asistente) frente a otras condiciones y semillas, manteniendo constante el flujo de datos y el orden de batches.
- Reproducibilidad de experimentos de escalado: al estar entrenado desde cero con 20,3 tokens de asistente por parametro y con semillas controladas, permite replicar curvas de perdida y comparar inicializaciones.
- Analisis de perdida por segmento: la model card publica perdidas separadas para texto de asistente, usuario y documento, lo que facilita estudiar como la mascara de perdida afecta a cada tipo de contenido.
- Generacion de dialogos sinteticos en ingles para construir datasets de investigacion, usando la plantilla ChatML incluida y el formato de conversacion aprendido.
- Verificacion de conversiones de checkpoints: la comparacion entre pesos HF y Megatron con diferencias de 0,0014 en perdida lo convierte en una referencia util para validar pipelines de conversion.
- Experimentos controlados de sesgo y estilo conversacional: al variar solo el texto de los documentos y la mascara de perdida, permite aislar el efecto del corpus en el tono y la estructura de las respuestas.
- Fine-tuning academico de bajo coste: con 0,98B parametros y licencia Apache 2.0, es viable ajustarlo en una unica GPU para tareas de investigacion acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta perdidas de validacion por token (2.433 documentos retenidos, checkpoint final):

| Conjunto | Perdida |
|---|---|
| Texto de asistente | 1,532 |
| Texto de usuario | 1,427 |
| Texto de documento | 3,252 |
| Ponderada de la condicion (`reweighted_seg1234`) | 1,526 |

Verificacion de pesos HF frente a Megatron:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,5302 | 1,5315 | 0,0014 |
| raw_val50m segments [8] | 3,2538 | 3,2523 | 0,0014 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parametros x 2 bytes), mas memoria para cache KV y activaciones; en la practica, entre 3 y 5 GB para secuencias de 4.096 tokens.
- En cuantizacion de 8 bits, los pesos ocuparian alrededor de 1 GB; en 4 bits, alrededor de 0,5 GB. No se publican variantes GGUF oficiales, por lo que habria que generarlas.
- GPU recomendadas: cualquier GPU consumer moderna con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes o despliegue concurrente, A100 o H100 aportan margen.
- Cabe holgadamente en GPU consumer; es un modelo de menos de 1B parametros.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en HuggingFace), y conversiones a llama.cpp u Ollama si se generan los pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.98b-v2-ua-seed1234-base | 981,5M | 4.096 | Apache 2.0 | Artefacto de investigacion sobre preentrenamiento conversacional (1PP) |
| SmolLM2 (variante ~1B, referencia por vocabulario) | no disponible en la informacion | no disponible | no disponible | Modelo base de proposito general; el tokenizador de 1PP deriva de su vocabulario |
| Otros escalones de la ladder v2 (0,58B, 1,66B, 2,81B) | 0,58B / 1,66B / 2,81B | 4.096 | Apache 2.0 | Mismas condiciones y semillas, distinto tamano |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no ha pasado por ajuste de instrucciones (SFT) ni por RLHF/DPO, por lo que no debe esperarse un comportamiento de chatbot fiable.
- La model card lo describe explicitamente como artefacto de investigacion del proyecto 1PP (EPFL DLAB), no como asistente de proposito general.
- Solo soporta ingles; no se declaran otros idiomas.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- No se han documentado evaluaciones de sesgo, toxicidad o alucinacion; al entrenarse sobre conversaciones reescritas, puede reproducir sesgos y estilos del corpus de origen.
- El formato de chat no incluye turno de sistema: introducir uno queda fuera de la distribucion de entrenamiento y puede degradar la calidad de la respuesta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para produccion y carece de garantias de calidad.
- El checkpoint no incluye variantes cuantizadas oficiales; cualquier cuantizacion a GGUF o similar debe validarse por cuenta propia.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su caracter experimental y la ausencia de validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed1234-base
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
