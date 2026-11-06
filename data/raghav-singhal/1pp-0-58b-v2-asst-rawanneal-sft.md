# Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-sft

## Resumen

`1pp-0.58b-v2-asst-rawanneal-sft` es un modelo de lenguaje de 580 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Se trata de un artefacto de investigación, no de un asistente de propósito general, cuyo objetivo es estudiar cómo el preentrenamiento sobre documentos originales seguido de un cooldown sobre conversaciones reescritas derivadas de esos mismos documentos afecta al comportamiento del modelo. La variante `asst` aplica la pérdida únicamente sobre los turnos del asistente durante ese cooldown.

El modelo pertenece a la "ladder v2", una escala experimental de cuatro tamaños (0.58B, 0.98B, 1.66B y 2.81B) cruzados con tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Cada tamaño se entrena desde cero con 20,3 tokens de asistente por parámetro sobre un flujo de datos alineado por pasos, de modo que las condiciones solo difieren en el texto de los documentos y la máscara de pérdida, y las semillas solo en la inicialización de parámetros. Este checkpoint concreto corresponde a la semilla 28 y va seguido de un ajuste supervisado (SFT).

Arquitectónicamente es un decoder estilo Llama de 24 capas, con embeddings no atados, sin sesgos ni QK-norm, y una longitud de secuencia de 4.096 tokens. Resulta relevante ahora como pieza reproducible para estudiar dinámicas de preentrenamiento y currículos de datos a pequeña escala, no como modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/INT8 con herramientas estándar) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con normalización RMSNorm, activación SwiGLU en la FFN, RoPE con base 10.000 y atención con 9 cabezas y 3 cabezas KV (GQA). El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>`, con `<|endoftext|>` como token de fin de documento. El preentrenamiento usa el stack Megatron con el optimizador Muon (escalado de forma, LR matricial 0,005) y Adam para el resto de parámetros, batch global de 512 × 4.096 tokens, enmascaramiento de atención entre documentos y precisión bf16.

El entrenamiento cubre los primeros 11.106 pasos de un flujo de 31.777 pasos alineado por pasos con el resto del estudio (23,29 mil millones de posiciones de token). Los primeros 9.996 pasos usan documentos originales de DCLM-edu y los últimos 1.110 (el cooldown) usan conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida solo en los turnos del asistente. El SFT posterior recorre una época sobre unas 400.000 conversaciones (mezcla de `jkminder/model-raising-pb-100k-3c-mt-sft`, `dlab-spp/sp-sft-normal-300k` sin prompts duplicados y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`), con LR matricial 0,002, batch 128 × 4.096 y decaimiento lineal hasta 1/10 tras un 3% de warmup. La pérdida de validación final es de 1,810 por token sobre texto de asistente y de 2,139 sobre los turnos de asistente del conjunto de validación de SFT (1.998 conversaciones retenidas).

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Respuesta multi-turno dentro de una ventana de 4.096 tokens.
- Modelado de texto de documentos (perplejidad baja sobre DCLM-edu, 3,165 por token en validación).
- Seguimiento de instrucciones básico adquirido en el SFT sobre 400.000 conversaciones.
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento agéntico ni razonamiento multi-paso explícito.
- Monolingüe: solo inglés.
- No dispone de modo "thinking", visión, audio ni capacidades multimodales.

## Casos de uso

- Investigación sobre currículos de preentrenamiento: replicar el experimento 1PP con las nueve combinaciones de tamaño, condición y semilla para medir el efecto del cooldown conversacional sobre la pérdida de validación.
- Estudio de alineación a pequeña escala: usar el checkpoint como línea base frente a la variante `1pp-0.58b-v2-asst-sft` y a la `raw-base` para aislar el efecto del SFT frente al del cooldown.
- Ablaciones de máscara de pérdida: comparar condiciones `asst` frente a otras condiciones del ladder v2 para cuantificar cuánto aporta la pérdida solo en turnos de asistente.
- Generación de texto controlada en entornos de laboratorio: servir el modelo con transformers o TGI para producir respuestas en inglés sobre dominios educativos, dado su entrenamiento con DCLM-edu.
- Evaluación de técnicas de cuantización: al ser un modelo pequeño en bf16 (1,2 GB), sirve para probar pipelines GGUF/AWQ/INT8 y medir degradación de perplejidad sin coste de GPU elevado.
- Docencia y divulgación: reproducir el flujo completo (tokenizador SmolLM2, ChatML sin system, parada en `<|im_end|>`) en un solo GPU consumer para explicar cómo se construye un asistente conversacional desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Documentos retenidos (2.433 docs) | pérdida por token, texto de asistente | 1,810 |
| Documentos retenidos (2.433 docs) | pérdida por token, texto de usuario | 3,545 |
| Documentos retenidos (2.433 docs) | pérdida por token, texto de documento | 3,165 |
| SFT retenido (1.998 conversaciones) | pérdida en turnos de asistente | 2,139 |
| Verificación HF vs Megatron (sft_val [3, 4]) | pérdida | 2,1387 (diferencia absoluta 0,0000) |

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 1,2 GB de pesos más caché KV y activaciones; en la práctica cabe en 4-6 GB con contexto completo de 4.096 tokens.
- VRAM en cuantización de 8 bits: alrededor de 0,6-0,7 GB de pesos; en 4 bits, alrededor de 0,3-0,4 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) es suficiente; en datacenter, A100/H100 quedan sobredimensionadas y solo se justifican para barridos de ablación en paralelo.
- Cabe holgadamente en GPU consumer, incluso en iGPU o CPU con llama.cpp.
- Opciones de despliegue: transformers (librería nativa del checkpoint), Text Generation Inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), llama.cpp/Ollama tras conversión a GGUF, y vLLM si se añade soporte de la arquitectura Llama estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-0.58b-v2-asst-rawanneal-sft | 0,58B | 4.096 | Apache 2.0 | Artefacto de investigación 1PP con cooldown conversacional y SFT |
| 1pp-0.58b-v2-asst-sft | 0,58B | 4.096 | Apache 2.0 | Misma escala y condición, sin variante de cooldown intermedio |
| 1pp-0.98b-v2 (escalón superior) | 0,98B | 4.096 | Apache 2.0 | Mismo protocolo 1PP en el siguiente escalón del ladder |
| SmolLM2-360M / 1.7B | 0,36B / 1,7B | 8.192 (smoltalk) | Apache 2.0 | Asistentes pequeños de propósito general con benchmarks públicos |

La comparación con modelos de propósito general no es directa: este checkpoint es un artefacto de investigación del proyecto 1PP y no se ha evaluado en MMLU, HumanEval o GSM8K, por lo que no hay datos de rendimiento comparables.

## Limitaciones y advertencias

- Artefacto de investigación: el propio autor indica que no es un asistente de propósito general; no debe usarse en producción orientada a usuarios finales.
- Monolingüe en inglés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Ventana de contexto de solo 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Formato de chat específico: ChatML sin turno de sistema; introducir un mensaje de sistema puede degradar la calidad porque el modelo nunca vio uno.
- Riesgo elevado de alucinación y de respuestas incoherentes fuera de los dominios de DCLM-edu y de la mezcla de SFT.
- Sin datos públicos de sesgos, seguridad o Robustness; el SFT incluye una muestra parcial de un conjunto de seguridad, pero no hay evaluación publicada.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y la naturaleza experimental desaconsejan cualquier despliegue comercial.
- La terminación de generación depende de `<|im_end|>` (id 2) y `<|endoftext|>` (id 0); un pipeline mal configurado puede generar texto espurio tras el turno.
- No dispone de soporte documentado de tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-rawanneal-sft
- Variante sin cooldown intermedio: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-sft
- Run base (raw): https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT: https://wandb.ai/raghav_singhal/1pp-sft
