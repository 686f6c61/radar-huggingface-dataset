# Raghav-Singhal/1pp-1.7b-asst-seed1234-base

## Resumen

`1pp-1.7b-asst-seed1234-base` es un modelo de lenguaje de 1.661.048.832 parámetros (1,66B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), un artefacto de investigación del laboratorio DLAB de la EPFL. No es un asistente de propósito general: es una réplica de semilla del modelo `1pp-1.7b-asst-base` que reproduce exactamente la misma receta y la misma secuencia de batches, cambiando únicamente la inicialización de parámetros con `--seed 1234` en lugar de 28. Su función es medir la varianza de inicialización de la receta: la pérdida de validación sobre SFT retenido de esta réplica difiere entre 0,0021 y 0,0038 nats de la del modelo con semilla 28 en cada una de las tres condiciones evaluadas.

Forma parte de un estudio factorial de 3 × 3: tres tamaños (0,5B, 1B y 1,7B) cruzados con tres condiciones de preentrenamiento sobre los mismos 47,8 millones de documentos fuente y en el mismo orden (documentos originales; conversaciones reescritas con pérdida solo en turnos del asistente; conversaciones reescritas con pérdida en turnos de usuario y asistente). Todos los modelos vieron la misma secuencia de batches, de modo que las condiciones solo difieren en el texto del documento y en la máscara de pérdida. El modelo que nos ocupa corresponde a la condición intermedia, con pérdida restringida a los turnos del asistente.

Arquitectura y tamaño son deliberadamente convencionales (decoder estilo Llama de 24 capas, contexto de 4.096 tokens, tokenizador SmolLM2), lo que lo convierte en una pieza útil para estudiar efectos de receta de preentrenamiento y para experimentos controlados de ajuste fino, no para despliegues de producto sin trabajo adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas de atención y 4 cabezas KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no compartidos, sin biases, sin QK-norm) |
| Parámetros totales | 1.661.048.832 (1,66B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No disponible: solo se publican pesos safetensors (repo de 3,3 GB, coherente con bf16); no hay variantes GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers`) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con dimensión oculta 2.048 y FFN de 8.192 con activación SwiGLU; la atención usa 16 cabezas de consulta y 4 cabezas KV (GQA con dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no compartidos, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se hizo en una sola pasada sobre 47,8 millones de documentos (66,2B tokens como documentos originales; 63,0B tokens en formato conversación), con 31.777 pasos a batch global de 512 secuencias × 4.096 tokens, enmascaramiento de atención entre documentos y *best-fit packing* con asignación de documentos alineada a paso. El optimizador es Muon (con *shape scaling* y LR de matriz 0,005) más Adam para embeddings y normas, con 2.000 pasos de warmup, LR constante y decaimiento lineal en el último 10 % hasta 1/100, weight decay 0,1 y precisión bf16. En esta condición la pérdida se calcula solo sobre los turnos del asistente (sin pérdida en turnos de usuario ni en `<|endoftext|>`). Las pérdidas de validación del checkpoint final sobre 2.433 documentos retenidos son 1,452 para texto de asistente, 6,581 para texto de usuario y 3,184 para texto de documento.

Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación: 1,4504 frente a 1,4518 (diferencia absoluta 0,0014) en segmentos val50m y 3,1855 frente a 3,1838 (0,0017) en segmentos raw_val50m.

## Capacidades

- Generación de texto autoregresiva en inglés con formato de conversación ChatML, sin turno de sistema (el modelo nunca vio uno durante el entrenamiento).
- Continuación de diálogos multiturno en el formato exacto `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`, tal como lo renderiza la `chat_template` incluida.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- Modelado de texto plano cuando se usa la condición de documentos originales (la variante `raw` del estudio), útil como línea base de comparación.
- No dispone de tool calling, function calling, capacidades de agente, modo de razonamiento explícito, visión ni audio: no hay evidencia de ello en la información disponible.
- No ha pasado por RLHF, DPO ni ajuste de instrucciones; es un modelo base, no un asistente alineado.
- Capacidad multilingüe: no disponible (entrenado y etiquetado solo para inglés).

## Casos de uso

- Investigación sobre receta de preentrenamiento: usar esta réplica junto a `1pp-1.7b-asst-base` (semilla 28) para cuantificar la varianza de inicialización; la diferencia observada de 0,0021 a 0,0038 nats en pérdida de SFT retenido sirve como cota práctica de la señal mínima que merece interpretación en experimentos de ablación a esta escala.
- Estudios de formato de datos: comparar esta condición (pérdida solo en turnos de asistente) con la variante de pérdida en usuario y asistente sobre la misma secuencia de batches, aislando el efecto de la máscara de pérdida del efecto del contenido.
- Ajuste fino supervisado (SFT/LoRA) para un asistente de dominio cerrado: al ser un base de 1,66B con licencia Apache-2.0, es un punto de partida económico para entrenar un modelo especializado en inglés con datos propios y contexto de hasta 4.096 tokens.
- Prototipado en local y en CI: por su tamaño, se puede cargar en una GPU de consumo para pruebas de plantillas de chat, tokenización y pipelines de generación antes de escalar a modelos mayores.
- Evaluación de tokenizadores: al usar el vocabulario de SmolLM2 (49.152 tokens), permite comparar directamente eficiencia de tokenización y comportamiento de modelos de la familia SmolLM2 frente a esta receta.
- Reproducibilidad y auditoría de checkpoints: la verificación publicada entre pesos HF y Megatron (diferencias de 0,0014 y 0,0017 en pérdida) lo hace adecuado como caso de estudio de conversión de formatos y validación numérica.
- Generación de texto plano en inglés para tareas de continuación de documentos, con la advertencia de que no está ajustado a instrucciones y requiere prompting cuidadoso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las únicas métricas publicadas son pérdidas de validación por token y la comparación de verificación de pesos:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segmentos [3] | 1,4504 | 1,4518 | 0,0014 |
| raw_val50m segmentos [8] | 3,1855 | 3,1838 | 0,0017 |

Pérdidas de validación del checkpoint final (por token, 2.433 documentos retenidos):

| Texto de asistente | Texto de usuario | Texto de documento |
|---|---|---|
| 1,452 | 6,581 | 3,184 |

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 3,3 GB de pesos más caché KV; el repo safetensors ocupa 3,3 GB, por lo que un entorno de 6-8 GB de VRAM es suficiente para contexto completo.
- Caché KV a 4.096 tokens: aproximadamente 200 MB en bf16 (24 capas × 4 cabezas KV × 128 de dimensión × 2 tensores × 4.096 posiciones).
- Cuantización a 8 bits: pesos en torno a 1,7 GB; a 4 bits, en torno a 0,9 GB (estimaciones a partir del número de parámetros; no hay cuantizaciones publicadas).
- GPU recomendadas: cabe con holgura en RTX 4090, RTX 4080, RTX 3090, L4, A10G y T4 (esta última con cuantización o contexto reducido); A100 y H100 son innecesarias para inferencia, aunque útiles para servir muchas réplicas concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en bf16, y en GPUs de 4-6 GB si se convierte a GGUF de 4-5 bits.
- Opciones de despliegue: `transformers` (referencia), vLLM y TGI (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), llama.cpp u Ollama previa conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

Los datos de los modelos comparables provienen de sus model cards públicas y no se han verificado en esta ficha; los del modelo descrito proceden de la información proporcionada.

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Benchmarks |
|---|---|---|---|---|---|
| 1pp-1.7b-asst-seed1234-base | 1,66B | 4.096 | Apache-2.0 | Base de investigación, preentrenado en conversaciones | No publicados |
| SmolLM2-1.7B | ~1,71B | 8.192 | Apache-2.0 | Base e instruct, tokenizador idéntico (49.152) | No comparados aquí |
| Qwen2.5-1.5B | ~1,54B | 32.768 | Apache-2.0 | Base e instruct, multilingüe | No comparados aquí |
| Llama-3.2-1B | ~1,24B | 128.000 | Licencia comunitaria Llama 3.2 | Base e instruct, alineado | No comparados aquí |

Frente a estas alternativas, la diferencia relevante no es el rendimiento bruto sino la finalidad: los tres comparables están pensados para uso como asistentes, mientras que este checkpoint es un artefacto experimental sin alineación, sin turno de sistema y con contexto de 4.096 tokens.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación del proyecto 1PP, no como un modelo listo para producto.
- No ha recibido RLHF, DPO ni ajuste de instrucciones, por lo que ignorará o malinterpretará instrucciones complejas y no seguirá formatos de forma fiable.
- No soporta turno de sistema: el modelo nunca lo vio durante el preentrenamiento, de modo que incluir uno en el prompt queda fuera de distribución.
- Pérdida de validación muy alta en texto de usuario (6,581 frente a 1,452 en texto de asistente), consecuencia directa de la máscara de pérdida; el modelo no está optimizado para modelar ni anticipar los turnos del usuario.
- Idiomas: solo inglés; el rendimiento en castellano u otras lenguas no está evaluado y previsiblemente será pobre.
- Contexto limitado a 4.096 tokens, sin mecanismos de atención lineal ni extensiones de contexto publicadas.
- Riesgo de alucinación y de reproducción de sesgos presente en los 47,8 millones de documentos de entrenamiento; no se ha publicado ninguna evaluación de sesgos, toxicidad o seguridad.
- Ausencia total de benchmarks estándar: no hay evidencia pública de calidad en tareas downstream más allá de las pérdidas de validación.
- Licencia Apache-2.0: permite uso comercial y modificación, pero al no existir alineación de seguridad, cualquier despliegue público exige filtros y evaluaciones propias.
- La variación entre semillas (0,0021-0,0038 nats) es un rango observado con una réplica por semilla, no una estimación de varianza; no debe interpretarse como intervalo de confianza.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin adopción comunitaria ni informes independientes de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-seed1234-base
- Modelo de referencia (semilla 28): https://huggingface.co/Raghav-Singhal/1pp-1.7b-asst-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Paper, blog o demo adicionales: no disponible en la información proporcionada
