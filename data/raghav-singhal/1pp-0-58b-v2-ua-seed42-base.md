# Raghav-Singhal/1pp-0.58b-v2-ua-seed42-base

## Resumen

1pp-0.58b-v2-ua-seed42-base es un modelo de lenguaje de tipo decoder transformer con 580.445.568 par\u00e1metros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Forma parte de una escalera de escalado (ladder v2) que abarca cuatro tama\u00f1os (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234), con cada r\u00f3tulo entrenado desde cero sobre un mismo flujo de datos alineado por pasos y una asignaci\u00f3n de 20,3 tokens de asistente por par\u00e1metro.

El modelo no es un asistente de prop\u00f3sito general, sino un artefacto de investigaci\u00f3n dise\u00f1ado para estudiar el efecto de la condici\u00f3n de preentrenamiento (texto de los documentos y m\u00e1scara de p\u00e9rdida) sobre el comportamiento final, manteniendo constantes el resto de variables. La condici\u00f3n concreta de esta ficha es "ua" (rewritten conversations, user+assistant loss), es decir, conversaciones reescritas con p\u00e9rdida calculada tanto en turnos de usuario como de asistente, con semilla 42.

Arquitect\u00f3nicamente es un decoder estilo Llama de 24 capas, hidden 1.152, FFN 4.608 con SwiGLU, 9 cabezas de atenci\u00f3n y 3 KV heads (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos ni QK-norm, y longitud de secuencia de 4.096 tokens. Su inter\u00e9s actual es metodol\u00f3gico: permite aislar el impacto de decisiones de preentrenamiento en modelos de escala peque\u00f1a y contexto moderado.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | Llama-style decoder transformer (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 attention heads / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, sin QK-norm, embeddings no atados) |
| Par\u00e1metros totales | 580.445.568 |
| Par\u00e1metros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizaci\u00f3n | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingl\u00e9s) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensi\u00f3n oculta de 1.152, FFN de 4.608 con activaci\u00f3n SwiGLU, 9 cabezas de atenci\u00f3n con 3 KV heads (GQA, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) m\u00e1s un token `<|pad|>`; `<|endoftext|>` act\u00faa como token de fin de documento.

El preentrenamiento utiliza conversaciones reescritas del proyecto 1PP con p\u00e9rdida sobre turnos de usuario y de asistente. Se entrenaron los primeros 11.106 pasos del flujo alineado por pasos de 1PP (23,29B posiciones de token), que corresponden a los primeros pasos de la pasada principal de 31.777 pasos del estudio, en el mismo orden. El batch global es de 512 \u00d7 4.096 tokens con m\u00e1scara de atenci\u00f3n entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) junto con Adam para el resto de par\u00e1metros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas); warmup de 699 pasos, constante y decaimiento lineal en los \u00faltimos 1.110 pasos hasta 1/100; weight decay 0,1; init std 0,0119; entrenamiento en bf16. La p\u00e9rdida de validaci\u00f3n final sobre 2.433 documentos reservados es de 1,664 en texto de asistente, 1,543 en texto de usuario y 3,452 en texto de documento; la columna ponderada de la condici\u00f3n es 1,654. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0015 en las p\u00e9rdidas de validaci\u00f3n.

## Capacidades

- Generaci\u00f3n de texto autoregresiva en formato conversacional ChatML (sin turno de sistema), ya que la condici\u00f3n "ua" produce texto con formato de chat.
- Modelo base: no est\u00e1 ajustado con instrucciones ni con RLHF/DPO, por lo que no sigue instrucciones de forma fiable sin un post-entrenamiento adicional.
- Capacidad de continuar y completar conversaciones multi-turno dentro de la ventana de 4.096 tokens.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado; al ser un modelo base, no se espera).
- Capacidades multiling\u00fces: limitadas al ingl\u00e9s seg\u00fan la model card.
- Capacidades especiales (thinking mode, visi\u00f3n, audio): no disponibles.
- Token de parada configurado con `<|im_end|>` (id 2) y `<|endoftext|>` (id 0) en `eos_token_id`.

## Casos de uso

- Investigaci\u00f3n sobre preentrenamiento: comparar esta condici\u00f3n ("ua", semilla 42) con las otras condiciones y semillas de la ladder v2 para aislar el efecto del texto de los documentos y la m\u00e1scara de p\u00e9rdida sobre el comportamiento del modelo.
- Reproducibilidad de experimentos: servir como punto de control verificable (diferencia de 0,0015 frente a Megatron) para validar pipelines de entrenamiento propios antes de escalar a modelos mayores.
- Estudio de escalado: usar el r\u00f3tulo de 0,58B junto a los de 0,98B, 1,66B y 2,81B para trazar curvas de escalado con datos y pasos alineados.
- An\u00e1lisis de formato conversacional: evaluar c\u00f3mo un modelo base entrenado con p\u00e9rdida en turnos de usuario y asistente genera texto con estructura ChatML sin ajuste supervisado.
- Baseline para fine-tuning: partir de estos pesos como inicializaci\u00f3n en experimentos acad\u00e9micos de SFT o DPO a peque\u00f1a escala, dado su tama\u00f1o manejable (0,58B) y licencia Apache 2.0.
- Evaluaci\u00f3n de robustez y sesgos: emplear el modelo como sujeto de pruebas en estudios controlados sobre conversaciones reescritas y su impacto en la generaci\u00f3n.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informaci\u00f3n disponible. La model card solo reporta p\u00e9rdidas de validaci\u00f3n:

| Conjunto | P\u00e9rdida (por token) |
|---|---|
| Texto de asistente | 1,664 |
| Texto de usuario | 1,543 |
| Texto de documento | 3,452 |
| Ponderada de la condici\u00f3n (`reweighted_seg1234`) | 1,654 |
| val50m segments [3] (verificaci\u00f3n HF vs Megatron) | 1,6622 (HF) / 1,6637 (Megatron), diff 0,0015 |
| raw_val50m segments [8] (verificaci\u00f3n HF vs Megatron) | 3,4540 (HF) / 3,4525 (Megatron), diff 0,0015 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16/fp16, aproximadamente 1,2 GB de pesos m\u00e1s overhead de activaciones y cach\u00e9 KV; en pr\u00e1ctica, c\u00f3modo en GPUs con 4-8 GB. La cuantizaci\u00f3n a 8 bits o 4 bits reducir\u00eda los pesos por debajo de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; tambi\u00e9n A100/H100 para despliegues por lotes.
- Cabe en GPU consumer: s\u00ed, en pr\u00e1cticamente todas las GPUs con al menos 4 GB de VRAM; tambi\u00e9n puede ejecutarse en CPU con llama.cpp si se generan pesos GGUF (no publicados).
- Opciones de despliegue: transformers (librer\u00eda nativa), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en HuggingFace), vLLM y llama.cpp/Ollama previa conversi\u00f3n de pesos.
- Latencia y throughput: no disponibles en la informaci\u00f3n proporcionada.

## Comparativa con modelos similares

| Modelo | Par\u00e1metros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-ua-seed42-base | 0,58B | 4.096 | Apache 2.0 | Modelo base de investigaci\u00f3n, solo ingl\u00e9s, formato ChatML sin system |
| SmolLM2-360M | 0,36B | 8.192 (seg\u00fan versi\u00f3n) | Apache 2.0 | Modelo base/instruct de HuggingFace; tokenizador compartido con este modelo |
| Qwen2.5-0.5B | 0,49B | 32.768 | Apache 2.0 | Modelo base multiling\u00fce con contexto mucho mayor |
| Llama 3.2-1B | 1,24B | 131.072 | Llama 3.2 Community License | Modelo base con contexto largo y licencia restrictiva |

La comparaci\u00f3n se limita a par\u00e1metros, contexto y licencia, ya que no hay benchmarks publicados para el modelo 1PP que permitan contrastar rendimiento. El modelo 1PP no est\u00e1 pensado para competir con estos modelos en tareas de usuario final, sino como artefacto experimental.

## Limitaciones y advertencias

- Modelo base sin ajuste de instrucciones: no sigue instrucciones de forma fiable y puede generar texto incoherente o repetitivo en tareas de asistente.
- Solo ingl\u00e9s: no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Contexto limitado a 4.096 tokens, inferior al de modelos contempor\u00e1neos de tama\u00f1o similar.
- Riesgo de alucinaci\u00f3n y de generar contenido factualmente incorrecto, inherente a un modelo base de 0,58B entrenado con 23,29B posiciones de token.
- Sesgos desconocidos: no se documentan an\u00e1lisis de sesgo en la model card; el dataset son conversaciones reescritas del proyecto 1PP, cuya composici\u00f3n no se detalla.
- Sin turno de sistema: los modelos nunca vieron uno, por lo que inyectar un system prompt puede degradar el formato de salida.
- No es un asistente de prop\u00f3sito general: el autor lo describe expl\u00edcitamente como artefacto de investigaci\u00f3n de EPFL DLAB.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no est\u00e1 validado para producci\u00f3n ni para tareas sensibles.
- Sin cuantizaciones oficiales publicadas: el despliegue en CPU o en GPUs muy limitadas requiere conversi\u00f3n manual de pesos.

## Enlaces

- HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed42-base
- Colecci\u00f3n 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
