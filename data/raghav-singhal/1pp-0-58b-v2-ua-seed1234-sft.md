# Raghav-Singhal/1pp-0.58b-v2-ua-seed1234-sft

## Resumen

1pp-0.58b-v2-ua-seed1234-sft es un modelo de lenguaje de 580,4 millones de parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado a EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la composición del corpus de preentrenamiento (en concreto, la reescritura de documentos en formato conversacional y la asignación de pérdida a turnos de usuario y asistente) afecta al comportamiento del modelo a distintas escalas.

Forma parte de la "ladder v2", una escalera de escalado que cubre cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos, de modo que las diferencias observadas entre modelos pueden atribuirse a la condición o a la semilla y no a variaciones en los datos. Esta ficha corresponde a la condición "ua" (user+assistant loss) con semilla 1234, tras un paso de ajuste supervisado (SFT).

La arquitectura es un decoder estilo Llama de 24 capas con ventana de contexto de 4.096 tokens, entrenado en bf16 con el optimizador Muon para matrices y Adam para el resto de parámetros. Su relevancia es metodológica: proporciona un punto de control reproducible y verificado (las pérdidas de validación en safetensors coinciden con el checkpoint original de Megatron) para investigar el efecto de las decisiones de preentrenamiento conversacional a pequeña escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ/GPTQ con herramientas estándar) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamaño del repo 1,2 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de 24 capas con atención multi-cabeza agrupada (9 cabezas de consulta y 3 de clave/valor, dimensión de cabeza 128), FFN SwiGLU de 4.608 unidades, RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento. La longitud de secuencia es de 4.096 tokens con máscara de atención entre documentos.

El preentrenamiento utiliza conversaciones reescritas a partir de documentos, con pérdida aplicada tanto a turnos de usuario como de asistente (condición "ua"). Se entrenaron los primeros 11.106 pasos del flujo alineado por pasos del estudio principal (23,29B posiciones de token), con batch global de 512 × 4.096 tokens. El optimizador es Muon (escalado por forma, LR de matriz 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con 699 pasos de warmup, LR constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. La pérdida de validación final por token sobre 2.433 documentos reservados es de 1,665 para texto de asistente, 1,544 para texto de usuario y 3,428 para texto de documento.

El ajuste supervisado (SFT) se realizó durante una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se empleó la misma pila que en preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR de matriz 0,002, semilla 28, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de SFT en reserva (1.998 conversaciones) es de 2,075, y se verificó que los pesos en safetensors reproducen exactamente la referencia de Megatron (diferencia absoluta 0,0000).

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema.
- Diálogo multiturno dentro de la ventana de 4.096 tokens.
- Razonamiento básico y respuesta a instrucciones, limitado por su escala de 0,58B parámetros.
- Generación de código y matemáticas a nivel elemental, sin garantías de fiabilidad (no se publican evaluaciones específicas).
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- No dispone de modo "thinking", visión ni audio.
- Multilingüismo limitado al inglés según la model card.
- Capacidad de continuar texto de documento, aunque su uso previsto es conversacional.

## Casos de uso

- Investigación sobre preentrenamiento conversacional: sirve como punto de control reproducible para comparar el efecto de la condición "user+assistant loss" frente a otras condiciones de la ladder v2 manteniendo fijos datos y semilla.
- Estudios de escalado: al compartir flujo de datos y pasos con los tamaños 0,98B, 1,66B y 2,81B, permite trazar curvas de pérdida y comportamiento frente al número de parámetros con 20,3 tokens de asistente por parámetro.
- Análisis de sensibilidad a la semilla: las semillas 28, 42 y 1234 difieren solo en la inicialización, lo que facilita medir la varianza de resultados atribuible al azar y no al diseño experimental.
- Reproducibilidad de pipelines Megatron: el autor verifica que los pesos de HuggingFace reproducen las pérdidas de Megatron, por lo que es útil como referencia para validar conversiones de checkpoints.
- Generación de respuestas conversacionales breves en inglés para pruebas de integración de `transformers` y text-generation-inference (el repo declara compatibilidad con endpoints).
- Base para experimentos de ajuste fino posterior: su licencia Apache 2.0 y tamaño reducido permiten reentrenarlo o adaptarlo en una única GPU consumer para estudiar técnicas de SFT o alineación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación internas:

| Conjunto | Pérdida (por token) |
|---|---|
| Texto de asistente (2.433 docs reservados) | 1,665 |
| Texto de usuario (2.433 docs reservados) | 1,544 |
| Texto de documento (2.433 docs reservados) | 3,428 |
| Condición con reponderación `reweighted_seg1234` | 1,656 |
| SFT en reserva (1.998 conversaciones) | 2,075 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | 2,0752 (diferencia 0,0000) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB de pesos más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,7 GB de pesos; en 4 bits, alrededor de 0,4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para bf16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son suficientes. Cabe holgadamente en GPUs consumer.
- Despliegue: compatible con `transformers` (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`) y, por formato safetensors, convertible a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-ua-seed1234-sft | 580,4M | 4.096 | Apache 2.0 | en | Artefacto de investigación con SFT; sin benchmarks públicos |
| SmolLM2-360M (HuggingFaceTB) | 362M | 8.192 (versión instruct) | Apache 2.0 | en (multilingüe parcial) | Modelo de propósito general con evaluaciones publicadas; tokenizador compartido con este modelo |
| Qwen2.5-0.5B (Alibaba) | 494M | 32.768 | Apache 2.0 | multilingüe (29 idiomas) | Asistente generalista con soporte de tool calling y contexto mucho mayor |
| Llama 3.2-1B (Meta) | 1.240M | 131.072 | Llama 3.2 Community License | multilingüe | Asistente generalista con contexto muy superior; licencia con restricciones |

La comparación es orientativa: el modelo 1PP no está diseñado como asistente generalista y no publica evaluaciones comparables (MMLU, HumanEval, GSM8K), por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- El propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB), no como asistente de propósito general; no debe usarse en producción como chatbot sin evaluación adicional.
- No se han publicado evaluaciones de sesgo, toxicidad, alucinación ni seguridad más allá de la inclusión de un subconjunto de datos de seguridad en el SFT.
- Riesgo de alucinación elevado por su escala (0,58B parámetros) y por el dominio de entrenamiento (documentos reescritos a conversaciones).
- Contexto limitado a 4.096 tokens, insuficiente para tareas de contexto largo.
- Solo soporta inglés según la model card.
- El formato de chat no incluye turno de sistema: introducir uno puede degradar la calidad de las respuestas, ya que el modelo nunca lo vio durante el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no ha sido validado para ello y carece de garantías de calidad.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación externa de su comportamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-ua-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Logs de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
