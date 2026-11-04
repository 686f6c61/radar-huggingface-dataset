# Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-base

## Resumen

1pp-0.58b-v2-ua-rawanneal-base es un modelo de lenguaje de 580.445.568 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo afecta la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) al comportamiento del modelo. Este checkpoint concreto pertenece a la "ladder v2", una escalera de escalado que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de datos y tres semillas.

La variante `rawanneal` es un experimento de mid-training: toma la ejecución "raw" (documentos DCLM-edu sin reescribir) hasta el paso 9.996, el último con learning rate máximo, y sustituye su fase de cooldown (los últimos 1.110 de 11.106 pasos) por conversaciones 1PP reescritas a partir de esos mismos documentos. Como los corpus están alineados paso a paso, cada paso de cooldown contiene las conversaciones derivadas del documento que el modelo estaba viendo en ese mismo paso de la ejecución raw. El resultado es un modelo base que ha visto texto con formato de chat en su tramo final y que, por tanto, genera texto conversacional sin haber pasado por un SFT convencional.

Arquitectura Llama-style de 24 capas con contexto de 4.096 tokens, licencia Apache 2.0 y un único idioma declarado (inglés). Su relevancia es metodológica: permite aislar el efecto de la reescritura conversacional y del enmascarado de pérdida sobre las curvas de validación, con checkpoints hermanos publicados para comparar condiciones y semillas de forma controlada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas externas) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con dimensión oculta de 1.152 y FFN de 4.608 con activación SwiGLU. La atención usa 9 cabezas de consulta y 3 cabezas KV (GQA con ratio 3:1), dimensión de cabeza 128, RoPE con base 10.000, RMSNorm, embeddings de entrada y salida no atados, sin sesgos y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como fin de documento. La longitud de secuencia es de 4.096 tokens con enmascarado de atención entre documentos.

El preentrenamiento cubre 11.106 pasos del flujo alineado del estudio 1PP (23,29B posiciones de token), con batch global de 512 × 4.096 tokens. En esta variante, los primeros 9.996 pasos usan los documentos DCLM-edu originales y los últimos 1.110 (el cooldown) usan las conversaciones 1PP reescritas de esos documentos, con pérdida sobre turnos de usuario y asistente. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 699 pasos, fase constante y decaimiento lineal en el cooldown hasta 1/100, weight decay 0,1, init std 0,0119 y precisión bf16. El ratio de entrenamiento es de 20,3 tokens de asistente por parámetro, idéntico en todos los peldaños de la escalera.

La pérdida de validación del checkpoint final (por token, sobre 2.433 documentos reservados) es de 1,808 en texto de asistente, 1,674 en texto de usuario y 3,141 en texto de documento; la columna ponderada de la condición (`reweighted_seg1234`) da 1,785. El autor verifica la conversión de pesos comparando pérdidas contra el checkpoint de Megatron: 1,8061 frente a 1,8077 en `val50m segments [3]` y 3,1428 frente a 3,1413 en `raw_val50m segments [8]`, con diferencias absolutas de 0,0016 y 0,0014 respectivamente.

## Capacidades

- Generación de texto autoregresiva en inglés con formato conversacional ChatML, aprendido durante el cooldown sin SFT posterior.
- Continuación de documentos y texto plano (herencia de la fase raw de preentrenamiento).
- Generación multi-turno en el formato `<|im_start|>user ... <|im_end|>` / `<|im_start|>assistant ... <|im_end|>`, sin turno de sistema (el modelo nunca vio uno).
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No dispone de tool calling, function calling, modo thinking, visión, audio ni capacidades de agente entrenadas de forma explícita.
- Multilingüismo limitado al inglés declarado; no se documenta transferencia a otros idiomas.
- No es un modelo instruct: no se ha aplicado RLHF, DPO ni SFT de preferencias.

## Casos de uso

- Investigación sobre composición de corpus: comparar este checkpoint con `1pp-0.58b-v2-ua-base` y `1pp-0.58b-v2-raw-base` para medir el efecto de sustituir el cooldown de documentos por conversaciones reescritas, manteniendo el resto del flujo idéntico.
- Estudios de alineación paso a paso: analizar cómo evoluciona la perplejidad en texto de asistente, usuario y documento a lo largo de los 1.110 pasos de cooldown, usando los logs de wandb publicados.
- Reproducibilidad de recetas de preentrenamiento: servir como referencia para validar conversiones Megatron a HuggingFace, dado que el autor documenta las diferencias de pérdida entre ambos formatos.
- Generación de datos sintéticos conversacionales en inglés: el modelo produce turnos con formato ChatML de forma nativa, útil para arrancar pipelines de destilación o aumentación de datos en entornos de investigación.
- Baseline en experimentos de escalado: al existir peldaños de 0,98B, 1,66B y 2,81B con la misma receta, permite trazar curvas de escalado a coste reducido.
- Evaluación de tokenizadores: al usar el vocabulario de SmolLM2 con 49.152 entradas, sirve para comparar eficiencia de tokenización frente a modelos con vocabularios mayores en corpus educativos.
- Fine-tuning académico con recursos limitados: 580M parámetros en bf16 ocupan aproximadamente 1,2 GB, lo que permite ajuste completo o LoRA en una única GPU de gama consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pérdidas de validación internas:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente | 1,808 |
| Texto de usuario | 1,674 |
| Texto de documento | 3,141 |
| Ponderada de la condición (`reweighted_seg1234`) | 1,785 |
| `val50m segments [3]` (verificación HF) | 1,8061 |
| `raw_val50m segments [8]` (verificación HF) | 3,1428 |

No hay datos de MMLU, HumanEval, GSM8K ni de comparación con modelos de referencia en la información proporcionada.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica cabe holgadamente en 4 GB.
- VRAM en cuantización de 8 bits: en torno a 0,6-0,7 GB; en 4 bits, alrededor de 0,35-0,4 GB (estimaciones por tamaño, no publicadas por el autor).
- Caché KV: con 3 KV heads de dimensión 128 y 24 capas, 4.096 tokens de contexto suponen del orden de 75 MB en bf16 por secuencia.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es sobradamente suficiente; para lotes grandes en serving, A100 o H100 aportan margen de throughput.
- Despliegue: compatible con transformers, text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo) y, previa conversión, con llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| 1pp-0.58b-v2-ua-rawanneal-base | 580M | 4.096 | Apache 2.0 | Cooldown con conversaciones sobre ejecución raw; foco en investigación de datos |
| 1pp-0.58b-v2-ua-base | 580M | 4.096 | Apache 2.0 | Ejecución 1PP completa con la misma receta; control directo del anterior |
| 1pp-0.58b-v2-raw-base | 580M | 4.096 | Apache 2.0 | Baseline sin reescritura conversacional; texto plano |
| SmolLM2-360M / SmolLM2-1.7B | 360M / 1,7B | 8.192 (1.7B) | Apache 2.0 | Alternativas de tamaño comparable con tokenizador compartido; no disponibles datos de rendimiento comparativo en esta ficha |

La comparación cuantitativa de rendimiento con estos u otros modelos no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Modelo base de investigación: el propio autor lo describe como artefacto del proyecto 1PP y no como asistente de propósito general; no debe desplegarse como chatbot de producción sin SFT y evaluación adicionales.
- Sin alineación: no ha pasado por RLHF, DPO ni filtros de seguridad, por lo que puede generar contenido sesgado, tóxico o incorrecto.
- Riesgo de alucinación alto en tareas de conocimiento factual, dado el tamaño (580M) y el volumen de entrenamiento (23,29B posiciones de token).
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será deficiente.
- Sin turno de sistema en el chat template: intentar usar un mensaje `system` sitúa al modelo fuera de distribución.
- El formato ChatML se aprendió solo durante los 1.110 pasos de cooldown, por lo que la adherencia al formato puede ser menos robusta que en modelos con SFT dedicado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está validado para ello y carece de garantías de calidad o seguridad.
- El checkpoint se publicó con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario ni de evaluaciones independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-rawanneal-base
- Variante raw de referencia: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento: https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
