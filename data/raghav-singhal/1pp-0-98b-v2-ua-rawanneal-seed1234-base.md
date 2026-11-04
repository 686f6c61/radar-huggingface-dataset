# Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed1234-base

## Resumen

1pp-0.98b-v2-ua-rawanneal-seed1234-base es un modelo de lenguaje de 981.545.472 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta al preentrenamiento la sustitución de documentos originales por conversaciones reescritas a partir de esos mismos documentos. Este checkpoint concreto pertenece al "escalón" de 0,98B de la escalera v2 (ladder v2) y corresponde a la condición "ua" (user+assistant loss) con un enfriamiento (cooldown) realizado sobre conversaciones en lugar de documentos.

La arquitectura es un decoder estilo Llama de 24 capas, hidden size 1.536, FFN 6.144 con SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como fin de documento. El modelo se entrenó desde cero con 20,3 tokens de asistente por parámetro sobre un flujo de datos alineado por pasos, lo que lo hace directamente comparable con los otros escalones (0,58B, 1,66B, 2,81B), condiciones y semillas de la misma escalera.

Su relevancia es metodológica: permite aislar el efecto de la reformulación conversacional y de la máscara de pérdida manteniendo constante el flujo de datos y variando únicamente la inicialización de parámetros entre semillas. La licencia Apache 2.0 y el formato safetensors facilitan su reutilización en experimentos reproducibles, aunque su naturaleza de modelo base limita su uso directo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas de atencion / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 981.545.472 (0,98B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible en la model card (los pesos se publican en safetensors; al ser un modelo de ~1B es convertible a GGUF/INT8/INT4 con herramientas estandar, pero el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; tamano del repo 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza estándar (12 cabezas de consulta, 4 de clave/valor, dimensión de cabeza 128), FFN con activación SwiGLU de 6.144 unidades, RMSNorm y RoPE con base 10.000. No emplea QK-norm, biases ni embeddings atados, y usa un tokenizador basado en SmolLM2 con 49.152 entradas más `<|pad|>`. La secuencia de entrenamiento es de 4.096 tokens y se aplica enmascaramiento de atención entre documentos (cross-document attention masking).

El preentrenamiento se realizó en bf16 con un batch global de 512 × 4.096 tokens (2,1M tokens por paso) y el optimizador Muon (shape scaling, LR matricial 0,005) para las matrices, junto con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para las normas). El schedule incluye 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, con weight decay 0,1 e init std 0,0103. Este checkpoint ("rawanneal") se construye tomando la ejecución raw hasta el paso 16.902 (último paso a LR máximo) y sustituyendo su cooldown (los últimos 1.877 de 18.779 pasos) por las conversaciones 1PP reescritas a partir de los documentos que la ejecución raw vio en cada paso; el flujo está alineado por pasos, de modo que cada paso de cooldown contiene las conversaciones derivadas de los documentos correspondientes. La pérdida se calcula sobre turnos de usuario y asistente. El total procesado en esta porción del flujo es de 39,38B posiciones de token.

La validación sobre 2.433 documentos retenidos arroja, en el checkpoint final, pérdidas por token de 1,635 para texto de asistente, 1,519 para texto de usuario y 3,026 para texto de documento, con 1,620 en la columna ponderada de tokens de entrenamiento de esta condición (`reweighted_seg1234`). Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas: 1,6331 frente a 1,6345 (diferencia absoluta 0,0014) en segmentos val50m y 3,0272 frente a 3,0256 (0,0016) en segmentos raw_val50m.

## Capacidades

- Generación de texto autoregresiva en inglés, con formato de conversación ChatML sin turno de sistema.
- Producción de texto con estructura de diálogo (turnos `user`/`assistant`) cuando se le presenta el formato ChatML correspondiente, gracias al entrenamiento de cooldown sobre conversaciones.
- Modelado de lenguaje base: continuación de documentos, texto plano y conversaciones; no está ajustado con instrucciones ni con RLHF/DPO.
- Capacidad de parada controlada: la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- Soporte de tool calling / function calling: no disponible (no documentado ni entrenado para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés; no se documenta entrenamiento en otros idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre preentrenamiento conversacional: reproducir el experimento 1PP comparando este checkpoint con `1pp-0.98b-v2-raw-seed1234-base` y `1pp-0.98b-v2-ua-seed1234-base` para aislar el efecto del cooldown sobre conversaciones frente al cooldown sobre documentos, manteniendo el mismo flujo de datos alineado por pasos.
- Estudios de ablación de semillas: al existir semillas 28, 42 y 1234 con idéntico orden de batches y distinta inicialización, el modelo sirve para medir la varianza entre semillas en métricas de validación (por ejemplo, la pérdida de 1,635 en texto de asistente) sin confundirla con cambios de datos.
- Evaluación de la máscara de pérdida: la condición "ua" (pérdida en turnos de usuario y asistente) permite comparar con condiciones que solo entrenan sobre el turno del asistente y cuantificar el impacto en la perplejidad de documentos frente a conversaciones.
- Generación de datos sintéticos controlados en inglés: el modelo puede producir continuaciones de texto plano o diálogos ChatML para aumentar corpus de investigación, siempre con revisión humana y sin uso como asistente final.
- Análisis de dinámica de entrenamiento: con 18.779 pasos documentados y logs en Weights & Biases, sirve para estudiar schedules de LR (warmup, constante, decaimiento lineal a 1/100) y el comportamiento del optimizador Muon en modelos de ~1B.
- Baseline para ajuste fino supervisado: al ser un modelo base de 0,98B con licencia Apache 2.0 y pesos safetensors, puede usarse como punto de partida en experimentos de SFT (el autor mantiene un proyecto wandb separado, `1pp-sft`) para tareas de inglés con contexto de hasta 4.096 tokens.
- Validación de infraestructura de inferencia: su tamaño permite desplegar y comparar servidores compatibles con text-generation-inference y endpoints de HuggingFace en entornos de pruebas antes de escalar a los escalones de 1,66B y 2,81B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación por token:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,635 |
| Texto de usuario | 1,519 |
| Texto de documento | 3,026 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,620 |

Verificación de pesos frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 1,6331 | 1,6345 | 0,0014 |
| raw_val50m segments [8] | 3,0272 | 3,0256 | 0,0016 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 2,0 GB solo para pesos (981,5M parámetros × 2 bytes), más caché KV y activaciones; en la práctica, entre 3 y 5 GB para secuencias de 4.096 tokens con batch pequeño.
- VRAM estimada en cuantización INT8: alrededor de 1,0-1,5 GB de pesos; en INT4, en torno a 0,5-0,8 GB. Estas cifras son estimaciones a partir del número de parámetros, no valores publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bf16 (RTX 3060 Ti, RTX 4060, RTX 4070, L4); para mayor throughput, A100, H100, L40S o RTX 4090.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en bf16 y en GPUs con 4-6 GB si se cuantiza a INT8/INT4.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), y, al ser un modelo Llama estándar en safetensors, es convertible a GGUF para llama.cpp/Ollama y desplegable en vLLM, aunque el autor no documenta estas rutas.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-ua-rawanneal-seed1234-base | 0,98B | 4.096 | Apache 2.0 | Modelo base de investigación (cooldown conversacional, semilla 1234) | HuggingFace, safetensors |
| 1pp-0.98b-v2-raw-seed1234-base | 0,98B | 4.096 | Apache 2.0 (según la colección 1PP) | Ejecución raw sin cooldown conversacional | HuggingFace, safetensors |
| 1pp-0.98b-v2-ua-seed1234-base | 0,98B | 4.096 | Apache 2.0 (según la colección 1PP) | Ejecución 1PP completa (documentos + conversaciones) | HuggingFace, safetensors |
| SmolLM2-1.7B (referencia de tokenizador, no de la escalera) | 1,7B | mayor que 4.096 (no verificado en esta ficha) | no disponible en la información | Modelo base generalista | HuggingFace |

La comparación más informativa es interna a la escalera 1PP: los tres checkpoints de 0,98B comparten flujo de datos y difieren solo en la condición y el cooldown, lo que permite atribuir diferencias de pérdida al tratamiento de las conversaciones. No se dispone de datos de benchmarks que permitan comparar rendimiento con modelos externos.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB), no ajustado con instrucciones ni RLHF/DPO.
- Solo inglés: no se documenta entrenamiento ni evaluación en otros idiomas, por lo que el rendimiento fuera del inglés es impredecible.
- Contexto limitado a 4.096 tokens; no se documenta extensión de contexto.
- Formato de chat específico: ChatML sin turno de sistema; los modelos nunca vieron un turno de sistema, por lo que introducirlo puede degradar la salida.
- Riesgo de alucinación inherente a un modelo base entrenado sobre DCLM-edu y conversaciones derivadas; no hay evaluación de factualidad publicada.
- Sesgos: no se documentan análisis de sesgos; al entrenarse sobre DCLM-edu en inglés, es esperable que herede sesgos de esa fuente, pero no hay mediciones disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está destinado a producción como asistente y no se ofrecen garantías de calidad.
- Los datos de validación reportados son pérdidas por token, no métricas de tarea; no deben interpretarse como rendimiento en benchmarks.
- El checkpoint depende de un flujo de datos alineado por pasos y de una ejecución raw concreta; reproducirlo requiere acceso a ese flujo y a los logs de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-rawanneal-seed1234-base
- Ejecución raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Ejecución 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-ua-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
