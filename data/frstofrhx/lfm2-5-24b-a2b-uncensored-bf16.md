# frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16

## Resumen

LFM2.5-24B-A2B-Uncensored-BF16 es una variante modificada del modelo LiquidAI/LFM2.5-24B-A2B, un transformer híbrido de tipo mezcla de expertos (MoE) desarrollado por Liquid AI. El modelo base forma parte de la familia LFM2.5, disenada para despliegue en dispositivo, y en esta version concreta se ha aplicado una edicion de direccion de rechazo (refusal abliteration) sobre los pesos BF16 originales, publicada por el usuario frstofrhx siguiendo la receta publica de AtomicChat.

El modelo conserva la arquitectura y el conocimiento del original: 24B parametros totales con solo 2B activos por token, una ventana de contexto de 131K tokens y un vocabulario ampliado a 128K entradas, con preentrenamiento escalado hasta aproximadamente 33 billones de tokens. La modificacion elimina la direccion de rechazo no solo en las proyecciones de atencion, sino tambien en las down-projections de los 64 expertos de los bloques 14 a 39, lo que reduce drasticamente la tasa de respuestas negativas.

Es relevante para investigadores en seguridad, alineamiento y red-teaming que necesitan un modelo sin mecanismos de rechazo para estudiar comportamiento, asi como para quien quiera construir agentes especializados mediante fine-tuning sobre una base entrenable en safetensors BF16. No es un modelo recomendado para produccion orientada al publico general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido MoE (lfm2_moe), con bloques de atencion y bloques convolucionales |
| Parametros totales | 23.971.585.280 (24B) |
| Parametros activos | 2B por token |
| Longitud de contexto | 131K tokens |
| Tipos de cuantizacion | BF16 (pesos publicados); compatible con cuantizacion GGUF/MLX (verificado en MLX 4-bit) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl |
| Licencia | LFM Open License v1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido MoE de 24B parametros con 2B activos, perteneciente a la familia LFM2.5 de Liquid AI. Combina bloques de atencion con bloques convolucionales y emplea 64 expertos por bloque en las capas afectadas por la edicion. El preentrenamiento del modelo original se escalo hasta aproximadamente 33 billones de tokens (frente a los ~17T de LFM2-24B-A2B), con un vocabulario duplicado a 128K tokens y contexto de 131K. No se dispone en la informacion proporcionada de detalles sobre la composicion del dataset ni sobre etapas de RLHF o DPO.

La modificacion de esta version replica la receta de AtomicChat: se calculan direcciones de rechazo por capa (`enru`) como diferencia de medias del residual stream en el ultimo token de prompt, con 544 prompts daninos frente a 544 inofensivos, proyectadas contra la media de los inofensivos y normalizadas. La edicion aplica `W' = W - 1.75 * d * (W^T d)^T` para los bloques 14 a 39 usando la direccion `enru[b+1]`, en f32 y redondeando una sola vez a BF16. Se editan 1690 tensores: `self_attn.out_proj` en bloques de atencion, `conv.out_proj` en bloques convolucionales y `feed_forward.experts.{0..63}.w2` (down-projections de los 64 expertos). La validacion contra el adaptador rank-1 publicado reporta ratio de proyeccion 0.75 exacto en todos los tensores, cos(v, adapter) = 1.0 en los mixers y coincidencia de vectores de expertos como permutacion.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de 131K tokens.
- Razonamiento con modo de pensamiento: el modelo siempre piensa antes de responder, por lo que requiere un presupuesto de salida generoso.
- Tool calling y function calling: validado con 3/3 llamadas validas en la verificacion del autor.
- Uso agentico y razonamiento multi-paso, segun los tags del modelo (agentic, tool-calling).
- Soporte multilingue en 16 idiomas, incluido el espanol.
- Base entrenable para fine-tuning con datos propios (por ejemplo, SFT de ciberseguridad o terminal).
- Comportamiento de rechazo sustancialmente reducido: 1/40 rechazos frente a 39/40 del original en la prueba del autor.

## Casos de uso

- Investigacion en seguridad y alineamiento: el modelo permite estudiar como se distribuye el comportamiento de rechazo en las down-projections de los expertos, comparando con el original y con ablaciones solo de atencion.
- Red-teaming y evaluacion de robustez: util para generar respuestas a prompts daninos en entornos controlados y medir la eficacia de filtros y clasificadores externos.
- Fine-tuning de agentes de dominio especializado: al ser una base entrenable en BF16, se puede ajustar con SFT propio (por ejemplo, operaciones de terminal o ciberseguridad) para construir un agente especializado sin mecanismos de rechazo heredados.
- Generacion de codigo y tareas tecnicas: el soporte de tool calling y el contexto de 131K permiten integrarlo en pipelines que requieren leer repositorios o documentacion extensa.
- Procesamiento de documentos largos multilingues: la ventana de 131K y los 16 idiomas lo hacen adecuado para resumen y extraccion sobre corpus extensos en espanol, aleman, arabe o chino, entre otros.
- Experimentacion con decodificacion y cuantizacion: al estar disponible en BF16 y haberse validado en MLX 4-bit, sirve para comparar latencia y calidad entre precisiones en hardware de consumo.
- Asistente conversacional de uso personal o interno: con temperatura 0.1, top_k 50 y repetition_penalty 1.05, segun la recomendacion de Liquid AI, para entornos donde no se requiere moderacion automatica.

## Benchmarks y rendimiento

Los datos siguientes provienen de la verificacion del autor (Mac M5 Pro, MLX 4-bit, thinking cerrado) y de la referencia de AtomicChat citada en la model card.

| Metrica | Original | Este modelo | Referencia AtomicChat BF16 |
|---|---|---|---|
| Rechazos (mlabonne/harmful_behaviors, 40) | 39/40 (97.5%) | 1/40 (2.5%) | 96.3% -> 1.2% |
| Llamadas de herramienta validas (3/3) | 3/3 | 3/3 | no disponible |
| KL vs original (texto neutro, logits del ultimo token) | — | 0.11 | 0.204 |
| MMLU (muestra de 100 preguntas, 0-shot, thinking cerrado) | 57% | 58% | 64.40 -> 65.55 |

No se han publicado en la informacion disponible resultados de benchmarks adicionales (HumanEval, GSM8K u otros) para este modelo.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 48 GB solo para pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB para contexto largo.
- VRAM estimada en 4-bit: en torno a 13-15 GB para pesos, con margen adicional para contexto y activaciones.
- GPU recomendadas: A100 80GB, H100 80GB o H200 para BF16 con contexto completo; RTX 4090 (24 GB) viable en cuantizacion de 4 bits con contexto moderado.
- Cabe en GPU de consumo: si, en cuantizacion 4-bit (por ejemplo, RTX 4090 o RTX 3090 de 24 GB); en BF16 no cabe en GPU de consumo.
- Opciones de despliegue: transformers >= 5.3.0, vLLM, SGLang y mlx-lm (con soporte `lfm2_moe`).
- Latencia y throughput: no disponibles en la informacion proporcionada; solo se documenta la verificacion en MLX 4-bit sobre Mac M5 Pro sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16 | 24B | 2B | 131K | 1/40 (2.5%) | LFM Open License v1.0 | Hugging Face, safetensors BF16 |
| LiquidAI/LFM2.5-24B-A2B (original) | 24B | 2B | 131K | 39/40 (97.5%) | LFM Open License v1.0 | Hugging Face |
| AtomicChat/LFM2.5-24B-A2B-Uncensored (BF16) | 24B | 2B | 131K | 1.2% segun referencia | LFM Open License v1.0 (derivada) | Hugging Face (BF16 y GGUF) |

No se dispone de datos de benchmarks comparativos con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- El comportamiento de rechazo se ha reducido de forma sustancial: puede producir contenido danino, inexacto, sesgado u ofensivo.
- Todas las salidas deben tratarse como no confiables y verificarse de forma independiente.
- El autor no documenta evaluaciones de sesgo especificas; se heredan los sesgos del modelo base y del corpus de preentrenamiento.
- Riesgo de alucinacion presente, como en cualquier modelo generativo de esta escala; la eliminacion de rechazos no corrige errores factuales.
- La licencia LFM Open License v1.0 impone restricciones de uso comercial; es responsabilidad del usuario revisar el archivo LICENSE y cumplir la ley aplicable.
- El modelo siempre activa el modo de pensamiento, lo que incrementa el coste de tokens de salida y la latencia.
- La edicion se valido con una muestra de 100 preguntas de MMLU y 40 prompts de rechazo; no sustituye una evaluacion exhaustiva.
- Uso previsto segun el autor: investigacion y uso personal, incluidos estudios de seguridad, alineamiento y red-teaming; no orientado a produccion publica sin moderacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/frstofrhx/LFM2.5-24B-A2B-Uncensored-BF16
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Modelo base (variante Base): https://huggingface.co/LiquidAI/LFM2.5-24B-A2B-Base
- Dataset de metricas y direcciones de AtomicChat: https://huggingface.co/datasets/AtomicChat/LFM2.5-24B-A2B-Uncensored-GGUF-metrics
