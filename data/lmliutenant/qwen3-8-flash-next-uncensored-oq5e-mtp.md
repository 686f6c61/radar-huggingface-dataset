# LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp es una cuantizacion de 5 bits (oQ5e) del modelo abliterado `orcarouter/Qwen3.8-Flash-Next-Uncensored`, que a su vez es la construccion BF16 sin direccion de rechazo de Qwen3.8-Flash-Next. El autor de la cuantizacion es LMLiutenant y utiliza el cuantizador oMLX 0.7.3, nativo para Apple Silicon. El modelo conserva la torre de vision, la cabeza MTP (multi-token prediction) y el ajuste nativo de contexto de 262.144 tokens de la arquitectura original.

El modelo resuelve el problema de ejecutar un modelo de gran tamano (180.000 millones de parametros) en hardware de consumo Apple Silicon de 128 GB de memoria unificada, mediante cuantizacion mixta con imatrix mejorada y offload del componente N-gram/PLE a SSD. Es relevante para investigadores y desarrolladores que necesitan un modelo multimodal con tool calling y sin rechazos de seguridad, ejecutable localmente en un MacBook Pro con M4 Max.

La relevancia actual radica en que combina tres tendencias: cuantizacion de alta calidad para Apple Silicon (oQ5e con refit por minimos cuadrados ponderados), modelos abliterados para investigacion sin restricciones de rechazo, y arquitecturas con contexto muy largo y prediccion multi-token para acelerar la decodificacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componente N-gram/PLE y cabeza MTP (Qwen4-Exp) |
| Parametros totales | 179.999.981.459 (~180B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ajuste nativo de la arquitectura) |
| Tipos de cuantizacion | oQ5e (5 bits, grupo nominal 64, mixta con imatrix); existe variante oQ6e (~6,9 bpw) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), libreria mlx |

## Arquitectura y entrenamiento

La arquitectura subyacente es Qwen3.8-Flash-Next, denominada "Qwen4-Exp" en los tags del repositorio, un transformer con un componente N-gram/PLE de gran tamano y una cabeza MTP (multi-token prediction) que permite decodificacion especulativa nativa. El modelo incluye torre de vision, lo que lo habilita para tareas image-text-to-text. El checkpoint conserva el ajuste nativo de contexto de 262.144 tokens.

El proceso de cuantizacion oQ5e se realizo directamente desde los pesos BF16 abliterados con oMLX 0.7.3. La calibracion de la imatrix empleo 1.024 secuencias de 512 tokens, con 937 entradas de imatrix y 75.240 de 75.264 expertos enrutados (99,97%) activados al menos una vez; 24 expertos no recibieron tokens de calibracion. Los escalas y offsets de grupo se reajustaron por minimos cuadrados ponderados, manteniendo el reajuste solo si reducia el error ponderado. La cabeza de salida y los embeddings se asignaron a 8 bits; la cabeza MTP se planifico despues del resto del modelo con un minimo de 4 bits. No se dispone de informacion sobre el numero de tokens de entrenamiento original, la composicion del dataset ni el proceso de RLHF/DPO del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline image-text-to-text) gracias a la torre de vision preservada.
- Tool calling / function calling, segun los tags del repositorio.
- Prediccion multi-token (MTP) para decodificacion especulativa y aceleracion de inferencia.
- Modo sin rechazos (abliterated): el modelo intenta la mayoria de peticiones sin las negativas de seguridad de la version oficial de Qwen.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente, aunque el tool calling y el contexto largo lo permiten.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo sin direccion de rechazo, comparando respuestas con la version oficial de Qwen para analizar que tipos de peticiones se aceptan y como varia la calidad.
- Asistente local multimodal en Apple Silicon: con 128 GB de memoria unificada y offload de N-gram a SSD, se puede ejecutar en un MacBook Pro M4 Max para tareas de descripcion de imagenes, OCR y conversacion sobre documentos escaneados.
- Procesamiento de documentos largos: los 262.144 tokens de contexto permiten analizar contratos, informes o bases de codigo completas en una sola pasada sin truncamiento.
- Automatizacion de agentes con tool calling: el modelo puede invocar funciones externas en pipelines internos, aunque requiere salvaguardas propias al no tener rechazos.
- Generacion de codigo en entornos controlados: integrable en flujos de desarrollo local para autocompletado y explicacion de codigo, con la precaucion de que el modo Lightning MTP se recomienda desactivar para agentes de codigo.
- Experimentacion con decodificacion especulativa: la cabeza MTP preservada permite medir el impacto de la prediccion multi-token en latencia y throughput sobre hardware Apple.
- Fine-tuning o evaluacion de tecnicas de cuantizacion: el repositorio documenta el pipeline oQ5e y sirve como referencia para reproducir cuantizaciones mixtas con imatrix en arquitecturas Qwen4-Exp.

## Benchmarks y rendimiento

| Benchmark | Revision actual (oMLX 0.7.3) | Revision anterior (oMLX 0.6.4) |
|---|---|---|
| MMLU | 88,1% | 88,0% |
| MMLU-Pro | 70,9% | 70,4% |

Las diferencias estan dentro del ruido de muestreo, segun el autor. No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: pico de asignacion MLX de ~88 GB a contexto de 4K y ~92 GB a 128K, medido con SSD N-gram Offload activado en la revision anterior (no re-medido en esta).
- Hardware probado: MacBook Pro con Apple M4 Max y 128 GB de memoria unificada.
- No cabe en GPUs de consumo convencionales (RTX 4090 con 24 GB, etc.) por el tamano del modelo; esta disenado especificamente para Apple Silicon de 128 GB.
- El componente N-gram/PLE requiere SSD N-gram Offload para no residir completamente en memoria unificada.
- Despliegue: oMLX (libreria mlx); no se documentan opciones vLLM, llama.cpp, Ollama o TGI para este formato.
- Configuracion recomendada: SSD N-gram Offload ON; Lightning MTP ON para chat/razonamiento y considerar OFF para agentes de codigo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp (este) | ~180B | 262.144 | oQ5e (5 bits) | qwen-community-1.0 | Hugging Face, formato MLX |
| Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp | ~180B | 262.144 | oQ6e (~6,9 bpw) | qwen-community-1.0 | Hugging Face, formato MLX |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | ~180B | 262.144 | BF16 | no disponible | Hugging Face |
| jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP | ~180B | 100K (segun nombre) | oQ4e | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes mas alla de los benchmarks MMLU y MMLU-Pro de las dos revisiones oQ5e.

## Limitaciones y advertencias

- Modelo abliterado sin guardrails: eliminada la direccion de rechazo, no rechaza la mayoria de peticiones; el usuario es responsable del uso y del cumplimiento legal.
- Riesgo en entornos agenticos: no se opone a instrucciones inyectadas, por lo que no debe exponerse a entradas no confiables sin salvaguardas propias.
- Riesgo de alucinacion: no documentado especificamente, pero inherente a los modelos de lenguaje; la ausencia de rechazos puede agravar respuestas erroneas en dominios sensibles.
- Idiomas soportados no documentados: no se puede garantizar calidad multilingue mas alla de lo que herede del modelo base.
- Licencia qwen-community-1.0: requiere revision de los terminos para uso comercial; el repositorio la etiqueta como "other".
- Cobertura de calibracion incompleta: 24 expertos enrutados no recibieron tokens de calibracion, por lo que su cuantizacion puede ser menos precisa.
- Requiere hardware especifico: 128 GB de memoria unificada Apple Silicon y offload a SSD; no es portable a GPUs convencionales.
- Los picos de memoria reportados corresponden a la revision anterior y no se re-midieron para esta.
- El modo Lightning MTP puede degradar el rendimiento en agentes de codigo segun la recomendacion del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Variante de mayor precision: https://huggingface.co/LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp
- Revision anterior de este repositorio: https://huggingface.co/LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp/tree/63122182730d6d744686c2ce549b26a81ce66592
- Modelo de sensibilidad previo (oQ4e): https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP
