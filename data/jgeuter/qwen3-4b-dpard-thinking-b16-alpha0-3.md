# jgeuter/qwen3-4b-dpard-thinking-b16-alpha0.3

## Resumen

El modelo `jgeuter/qwen3-4b-dpard-thinking-b16-alpha0.3` es un modelo borrador (draft model) de 322.458.368 parámetros (~322 millones) diseñado para decodificación especulativa de `Qwen/Qwen3-4B` en modo thinking (razonamiento). Lo publica el usuario jgeuter como artefacto de investigación: no es un modelo autónomo capaz de generar respuestas finales, sino un componente que propone bloques de tokens que el modelo base verifica después.

Técnicamente es un draft de tipo DFlash con 3 capas y un block size de 16 tokens, entrenado con el objetivo D-PAL[Rényi] (denominado D-PARD), basado en la divergencia de Rényi de orden 1/2 sobre el vocabulario completo, con pesos de posición derivados del solapamiento y un suelo de suavizado de pesos rho = 0.3. Su función es reducir la latencia de inferencia de Qwen3-4B cuando este opera con la cadena de razonamiento activada, un escenario en el que el número de tokens generados crece mucho y el coste de decodificación se dispara.

Es relevante ahora porque los modelos pequeños con modo thinking generan secuencias de razonamiento muy largas, y la decodificación especulativa es una de las pocas técnicas que acelera la inferencia sin alterar la distribución de salida. El autor lo publica explícitamente como material de investigación para comparar los objetivos de entrenamiento DFlash, D-PACE y D-PARD sobre datos de modo thinking, no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft model DFlash para decodificación especulativa (3 capas, block size 16) |
| Parametros totales | 322.458.368 (~322 millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usó una longitud máxima de 8192 tokens; la ventana efectiva en servicio la determina el modelo base Qwen/Qwen3-4B) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, presumiblemente bf16 según la configuración de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (incluye código personalizado, tag `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un draft DFlash de 3 capas con block size 16, pensado para generar propuestas de tokens en bloque que el modelo base Qwen/Qwen3-4B valida mediante rechazo. El objetivo de entrenamiento es D-PAL[Rényi] (D-PARD): se minimiza la divergencia de Rényi de orden 1/2, D_1/2(p||q), sobre el vocabulario completo, con pesos de posición basados en solapamiento que persiguen una aceptación exacta por muestreo de rechazo (D-PAL) y un suelo de suavizado de pesos rho = 0.3.

Los datos de entrenamiento provienen del dataset `jgeuter/ShareGPT-Qwen3-4B-T0.6-Thinking-Regen`: 36.315 conversaciones ShareGPT regeneradas por Qwen3-4B con thinking activado (temperatura 0.6, top-p 0.95, top-k 20, presupuesto de 32k tokens), expandidas a 101.212 muestras de entrenamiento por turno. Solo se supervisa el último turno del asistente de cada muestra, incluyendo el razonamiento, con la plantilla de chat con thinking habilitado y una longitud máxima de secuencia de 8192. El entrenamiento se realizó con SpecForge (captura offline de características de las capas [1, 17, 33] de Qwen3-4B), AdamW, learning rate 6e-4 con decaimiento coseno y 4% de warmup, batch global 4, 6 épocas, 512 anclas por secuencia, grad clip 1.0, bf16 y semilla 42. El autor indica que sigue la receta del paper D-PARD/D-PACE salvo en la longitud de secuencia (8192 frente a 3072) y en el uso del corpus de modo thinking.

## Capacidades

- Generación de tokens candidatos (draft) para decodificación especulativa; no produce la respuesta final por sí mismo.
- Optimizado específicamente para el modo thinking de Qwen3-4B, con la plantilla de chat con razonamiento habilitado.
- Propuesta de bloques de hasta 16 tokens por paso (block size 16) para su verificación por el modelo base.
- Compatibilidad con el algoritmo DFLASH de SGLang y con el parser de razonamiento de qwen3.
- Soporte de tool calling y function calling: no disponible a nivel de draft (dependería del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible a nivel de draft (dependería del modelo base).
- Capacidades multilingües: no documentadas en la información proporcionada.
- Capacidades especiales: pensado para reducir latencia en cadenas de razonamiento largas; sin visión ni audio propios.

## Casos de uso

- Aceleración de inferencia self-hosted de Qwen3-4B en modo thinking: el draft propone bloques de tokens que el base verifica, reduciendo el número de pasos de decodificación en secuencias de razonamiento largas.
- Despliegue con SGLang: se integra mediante el algoritmo especulativo DFLASH y el parser de razonamiento de qwen3, con el modelo base Qwen/Qwen3-4B como verificador.
- Reducción de latencia en asistentes conversacionales con razonamiento extenso: útil cuando la respuesta incluye cadena de pensamiento y el tiempo hasta el primer token útil y la tasa de generación importan.
- Investigación comparativa de objetivos de entrenamiento: el autor lo publica para comparar DFlash, D-PACE y D-PARD sobre datos de modo thinking bajo idénticas condiciones de evaluación.
- Experimentación en GPUs de gama consumer: al ocupar pocos cientos de megabytes, permite probar decodificación especulativa junto al modelo base en hardware modesto.
- Evaluación de tasas de aceptación por block size: sirve para medir cuántos tokens del bloque de 16 se aceptan en dominios concretos de razonamiento.
- Generación de datos sintéticos con thinking: puede emplearse para acelerar la regeneración de corpus tipo ShareGPT con razonamiento, como el usado en su propio entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de aceptación, speedup ni métricas de calidad; el autor describe el artefacto como material de investigación para comparar objetivos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para el draft (cálculo a partir de los 322.458.368 parámetros): ~0,64 GB en bf16/fp16, ~0,32 GB en int8 y ~0,16 GB en int4. Son estimaciones derivadas del recuento de parámetros, no datos publicados.
- VRAM total en servicio: el draft debe coexistir con Qwen/Qwen3-4B (unos 8 GB en bf16 solo en pesos) más la caché KV de la ventana utilizada.
- GPU recomendadas: cualquier GPU con memoria suficiente para el modelo base; para el conjunto completo son adecuadas A100, H100, L40S o RTX 4090. El draft por sí solo cabe en cualquier GPU consumer.
- Cabe en GPU consumer: sí, incluyendo tarjetas de 12-24 GB (por ejemplo RTX 4070/4080/4090) siempre que el modelo base y la caché KV entren en memoria.
- Opciones de despliegue: SGLang con `--speculative-algorithm DFLASH` y `--speculative-draft-model-path` apuntando a este repositorio. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No hay métricas publicadas que permitan una comparación numérica con alternativas. La tabla siguiente recoge una comparación cualitativa de categorías, marcando como no disponible todo dato no confirmado.

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-4b-dpard-thinking-b16-alpha0.3 | Draft DFlash para decodificación especulativa | 322.458.368 | no disponible | apache-2.0 | HuggingFace |
| Qwen/Qwen3-4B (sin draft) | Modelo base generativo | ~4.000 millones (no confirmado en la información) | no disponible | no disponible en la información | HuggingFace |
| Draft genérico basado en Qwen3-0.6B | Draft por modelo pequeño estándar | no disponible | no disponible | no disponible | HuggingFace |
| Cabezas de decodificación tipo EAGLE-3 / Medusa | Decodificación especulativa con cabezas | no disponible | no disponible | no disponible | dependiente del proyecto |

## Limitaciones y advertencias

- Es un artefacto de investigación declarado como tal por el autor; no está pensado para uso en producción.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la información, y sin benchmarks publicados.
- No genera texto de forma autónoma: solo propone tokens que el modelo base debe verificar; su utilidad depende de Qwen/Qwen3-4B.
- Diseñado exclusivamente para Qwen/Qwen3-4B en modo thinking; no es portable a otros modelos ni a modos sin razonamiento.
- Block size fijo de 16 y 3 capas: la ganancia depende de la tasa de aceptación real, que no se documenta.
- Requiere SGLang con el algoritmo DFLASH y el tag `custom_code`; no se documenta su uso en otros motores de inferencia.
- Sesgos: heredados del corpus ShareGPT regenerado por Qwen3-4B, por lo que refleja los sesgos del modelo base y del dataset de origen.
- Alucinación: el objetivo D-PAL busca una aceptación por muestreo de rechazo exacta, lo que en teoría preserva la distribución del modelo base, pero no hay verificación publicada de este comportamiento en este artefacto concreto.
- Idiomas soportados sin documentar: el corpus de entrenamiento es ShareGPT regenerado, mayoritariamente en inglés según la información disponible, por lo que el comportamiento en otros idiomas es incierto.
- Licencia apache-2.0: permite uso comercial, pero sin garantías; al depender del modelo base, deben respetarse además las condiciones de Qwen/Qwen3-4B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jgeuter/qwen3-4b-dpard-thinking-b16-alpha0.3
- Modelo base Qwen/Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento (ShareGPT-Qwen3-4B-T0.6-Thinking-Regen): https://huggingface.co/datasets/jgeuter/ShareGPT-Qwen3-4B-T0.6-Thinking-Regen
- SpecForge (marco de entrenamiento mencionado en la model card; sin URL en la información disponible)
- Paper D-PARD/D-PACE (referenciado en la model card; sin URL en la información disponible)
- SGLang (motor de servicio indicado en la model card; sin URL en la información disponible)
