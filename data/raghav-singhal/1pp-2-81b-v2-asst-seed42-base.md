# Raghav-Singhal/1pp-2.81b-v2-asst-seed42-base

## Resumen

1pp-2.81b-v2-asst-seed42-base es un modelo de lenguaje de 2.807.699.328 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la composición del corpus y la máscara de pérdida afectan al comportamiento conversacional de un modelo entrenado desde cero. Forma parte de la escalera v2 del estudio, que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de datos y tres semillas (28, 42, 1234).

La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 2.688, FFN de 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

La relevancia de este checkpoint es metodológica: cada tamaño de la escalera se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos, de modo que las condiciones solo difieren en el texto del documento y la máscara de pérdida, y las semillas solo en la inicialización. Este modelo concreto corresponde a la condición "conversaciones reescritas con pérdida solo en turnos de asistente", semilla 42.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, sin sesgos, sin QK-norm, embeddings no atados) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 5,6 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (21 cabezas de consulta, 7 de clave/valor), FFN SwiGLU de 10.752 unidades, normalización RMSNorm y RoPE con base 10.000. No emplea QK-norm, sesgos lineales ni embeddings atados. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La ventana de contexto es de 4.096 posiciones.

El preentrenamiento usa las conversaciones del proyecto 1PP reescritas a partir de los documentos originales, con la pérdida aplicada únicamente sobre los turnos de asistente. Este checkpoint cubre los primeros 53.709 pasos del flujo alineado por pasos (112,64B posiciones de token), que coinciden con los primeros pasos del recorrido principal de 31.777 pasos del estudio, en el mismo orden. El batch global es de 512 secuencias × 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, desviación inicial 0,0078 y precisión bf16.

La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,375 por token en texto de asistente, 7,225 en texto de usuario, 3,055 en texto de documento y 1,422 en la columna ponderada `reweighted_seg34` (que pondera las conversaciones adversariales a su cuota de entrenamiento del 11,18 %). Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas: 1,3736 frente a 1,3749 (diferencia absoluta 0,0013) en segmentos val50m [3], y 3,0565 frente a 3,0552 (diferencia 0,0013) en segmentos raw_val50m [8].

## Capacidades

- Generación de texto autorregresiva en inglés con formato de conversación ChatML, sin turno de sistema (los modelos nunca vieron uno): `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- Continuación de diálogo multiturno en formato de chat, aprendida durante el preentrenamiento en la condición de conversaciones reescritas.
- Modelo base: no está ajustado con instrucciones ni con RLHF/DPO, por lo que no sigue instrucciones de forma fiable ni rechaza peticiones.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso explícito, visión, audio ni modo de pensamiento.
- Capacidad multilingüe limitada al inglés según la model card.
- La generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`; la plantilla de chat incluida renderiza exactamente el formato anterior.
- Compatible con text-generation-inference y endpoints compatibles según los tags del repo.

## Casos de uso

- Investigación sobre composición de datos conversacionales: el modelo sirve como punto de comparación en la escalera 1PP para medir el efecto de reescribir documentos como conversaciones y de enmascarar la pérdida en turnos de asistente, manteniendo constantes el flujo de datos y el presupuesto de cómputo.
- Reproducibilidad de estudios de escalado: al existir tres semillas (28, 42, 1234) y cuatro tamaños con el mismo flujo alineado por pasos, permite estimar la varianza entre inicializaciones y ajustar curvas de escalado con 2,81B como escalón superior.
- Análisis de pérdida por segmento: las pérdidas de validación desglosadas por texto de asistente, usuario y documento permiten estudiar cómo se distribuye la capacidad del modelo entre roles conversacionales.
- Evaluación de formatos de chat sin turno de sistema: útil para probar si un formato ChatML restringido a user/assistant generaliza o degrada en tareas que normalmente requieren instrucciones de sistema.
- Base para ajuste supervisado posterior: al ser un checkpoint base con licencia Apache 2.0 y pesos safetensors estándar, puede servir de inicialización para experimentos de SFT en dominios concretos en inglés.
- Validación de pipelines de inferencia: su tamaño de 2,81B y contexto de 4.096 tokens lo hacen manejable para probar despliegues con transformers o TGI antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de validación por token, no métricas de tareas (MMLU, HumanEval, GSM8K u otras).

| Conjunto de validación | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,375 |
| Texto de usuario | 7,225 |
| Texto de documento | 3,055 |
| `reweighted_seg34` (ponderada) | 1,422 |
| val50m segmentos [3] (HF) | 1,3736 |
| val50m segmentos [3] (Megatron) | 1,3749 |
| raw_val50m segmentos [8] (HF) | 3,0565 |
| raw_val50m segmentos [8] (Megatron) | 3,0552 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más caché KV y activaciones; en la práctica, entre 7 y 9 GB para contexto corto y por encima de 10-12 GB con contexto completo de 4.096 tokens y batches mayores.
- En fp16/bf16 cabe en GPUs de consumo con 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en GPUs de datacenter (A100, H100, L40S).
- Cuantización a 8 bits reduciría los pesos a unos 2,8 GB y a 4 bits a unos 1,4 GB, lo que permitiría ejecución en GPUs de 6-8 GB; sin embargo, no se distribuyen pesos cuantizados oficiales y no se documentan recetas de cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama requerirían conversión a GGUF no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-asst-seed42-base | 2,81B | 4.096 | Apache 2.0 | en | Base de investigación, pérdida solo en turnos de asistente, sin benchmarks publicados |
| SmolLM2 (variante ~1,7B) | ~1,7B | 8.192 (según versión) | Apache 2.0 | en (multilingüe limitado) | Modelo base/instruct de referencia de HuggingFace; comparte familia de tokenizador con este checkpoint |
| Qwen2.5-3B | 3,09B | 32.768 (configuración base) | Apache 2.0 | multilingüe | Base e instruct con benchmarks publicados; contexto muy superior |
| Llama 3.2-3B | 3,21B | 131.072 | Llama 3.2 Community License | multilingüe | Requiere aceptar licencia; contexto y ecosistema de despliegue amplios |

La comparación es orientativa: los datos de los modelos alternativos provienen de conocimiento general y no de la información proporcionada en esta ficha, por lo que deben verificarse en sus model cards oficiales. El checkpoint 1PP no publica métricas de tareas que permitan una comparación de rendimiento directa.

## Limitaciones y advertencias

- Es un artefacto de investigación, no un asistente de propósito general; el propio autor lo declara explícitamente.
- Modelo base sin ajuste por instrucciones ni RLHF/DPO: no sigue instrucciones de forma fiable y puede generar contenido inapropiado o incoherente.
- No ha visto nunca un turno de sistema; introducir uno en el prompt queda fuera de distribución y puede degradar la calidad de la respuesta.
- Solo inglés documentado; el rendimiento en otros idiomas no está caracterizado.
- Contexto limitado a 4.096 tokens, muy por debajo de modelos contemporáneos de tamaño similar.
- Riesgo de alucinación y de sesgos presente pero no cuantificado: no se publican evaluaciones de sesgo, toxicidad ni robustez.
- Las pérdidas de validación muestran un valor muy alto en texto de usuario (7,225), coherente con la máscara de pérdida en turnos de asistente; esto no implica buen modelado del lado del usuario.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad desaconseja su uso en producción sin una evaluación propia exhaustiva.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin comunidad ni soporte documentado más allá de la model card.
- No se distribuyen pesos cuantizados ni plantillas de despliegue para llama.cpp/Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
