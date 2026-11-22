# junafinity/Ornith-1.5-9B-uncensored-MLX-8bit

## Resumen

Ornith-1.5-9B-uncensored-MLX-8bit es una cuantizacion en 8 bits para Apple Silicon de la variante abliterada (direccion de rechazo eliminada) del modelo multimodal Ornith-1.5-9B, publicada por junafinity bajo la marca VeriSafe.Live. El modelo base, ornith-ai/Ornith-1.5-9B, es un transformer de 9.409.813.744 parametros (~9,4 B) con torre de vision integrada, etiquetado internamente como linaje qwen3_5 y orientado a tareas image-text-to-text. Esta version conserva tanto la torre de vision como las cabezas MTP (multi-token prediction) del original, algo que el autor destaca explicitamente frente a las conversiones text-only de mlx-lm.

El interes tecnico del artefacto es doble. Por un lado, ofrece un checkpoint de vision funcional en formato MLX de 8 bits (unos 10,4 GB de repositorio) ejecutable en hardware Apple mediante la libreria mlx-vlm, lo que facilita el despliegue local de un VLM de ~9 B sin GPU dedicada. Por otro, su proposito declarado no es el uso generalista, sino servir de instrumento de investigacion para red teaming y evaluacion defensiva: el autor plantea el par base/abliterado como un control experimental para medir el techo real de capacidad de los pesos y detectar huecos en filtros, clasificadores y capas de moderacion propias.

La relevancia actual del modelo radica en esa metodologia de evaluacion por pares (delta contra el modelo base) y en la disponibilidad de variantes coherentes en la familia: safetensors bf16, MLX 8-bit y GGUF Q8_0, tanto para el 9B denso como para el 35B-A3B. La licencia es Apache 2.0, aunque el autor impone reglas operativas explicitas para su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con torre de vision y cabezas MTP (linaje qwen3_5); detalles de capas y atencion no disponibles |
| Parametros totales | 9.409.813.744 (~9,4 B) |
| Parametros activos | No aplica (modelo denso; la variante MoE es el 35B-A3B de la misma familia) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 8 bits (MLX); la familia incluye bf16 (safetensors) y Q8_0 (GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors); variantes GGUF Q8_0 y safetensors bf16 en la misma familia |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion a 8 bits del modelo abliterado Ornith-1.5-9B, que a su vez deriva del modelo base ornith-ai/Ornith-1.5-9B. La arquitectura subyacente es un transformer multimodal con torre de vision interna (el checkpoint es de tipo mlx-vlm, no una conversion text-only de mlx-lm) y cabezas MTP de prediccion multi-token. El autor indica que tanto la torre de vision como las cabezas MTP se preservan tras la abliteracion y la cuantizacion, y remite a una auditoria antes/despues en la model card, aunque los detalles numericos de dicha auditoria no estan disponibles en la informacion proporcionada.

La intervencion clave es la abliteracion: una edicion de rango 1 aplicada sobre un tramo de capas conocido que elimina la direccion de rechazo de los pesos, en lugar de un fine-tuning con datos. El autor la describe como un control experimental limpio frente al modelo base. No se dispone de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si el modelo original uso RLHF o DPO. Tampoco se documentan innovaciones adicionales como decodificacion especulativa mas alla de las cabezas MTP heredadas; la cifra de tokens por segundo figura como marcador pendiente en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text): descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Prediccion multi-token (MTP) mediante cabezas dedicadas preservadas del modelo base.
- Capacidad de seguir instrucciones y mantener rol de sistema, con la salvedad de que la abliteracion no elimina todos los rechazos (persisten reafirmaciones multi-turno, direccionamiento por system prompt y rechazos en la ruta de vision).
- Generacion de completaciones etiquetadas para entrenamiento o evaluacion de clasificadores de moderacion y deteccion de abuso.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking explicito, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Red teaming automatizado de aplicaciones LLM: usar el checkpoint como objetivo que no interrumpe el bucle con rechazos ajenos a la prueba, aislando el control bajo test (inyeccion de prompt, abuso de herramientas, rutas de exfiltracion de datos, bypass de politica). El autor lo plantea explicitamente como mitad "tratamiento" de un par controlado.
- Medicion del techo de capacidad: comparar las salidas del modelo abliterado contra el base ornith-ai/Ornith-1.5-9B sobre el mismo conjunto de prompts para cuantificar el delta real de capacidad en un dominio, independientemente de los rechazos que el modelo original muestre.
- Evaluacion de pilas defensivas: alimentar filtros de entrada, clasificadores de salida y APIs de moderacion con un modelo que no contribuye con rechazos propios, de modo que los huecos detectados correspondan a la capa defensiva y no al modelo.
- Generacion de datos etiquetados para moderacion: producir completaciones para entrenar o evaluar modelos de deteccion de abuso y clasificacion de salidas, con registro del delta respecto al base.
- Investigacion en interpretabilidad del rechazo residual: al ser la abliteracion una edicion de rango 1 sobre un tramo de capas conocido, el par base/abliterado permite estudiar que rechazos sobreviven y por que (reafirmacion multi-turno, steering por system prompt).
- Procesamiento visual local en Apple Silicon: al conservar la torre de vision en formato MLX de 8 bits (~10,4 GB de repositorio), permite ejecutar tareas image-text-to-text en equipos Mac con memoria unificada suficiente, sin GPU dedicada, mediante mlx-vlm.
- Evaluacion comparativa de cuantizaciones: el mismo modelo existe en bf16, MLX 8-bit y GGUF Q8_0, lo que permite medir la degradacion introducida por la cuantizacion de 8 bits frente a los pesos completos en tareas de vision y texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un marcador pendiente para la tasa de tokens por segundo ("tok/s: [PLACEHOLDER]") y no reporta MMLU, HumanEval, GSM8K ni metricas multimodales.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 10,4 GB en 8 bits; en memoria unificada de Apple Silicon se debe prever espacio adicional para el contexto KV y el procesamiento de imagenes, por lo que un equipo con 16 GB resulta justo y 24 GB o mas es recomendable.
- GPU recomendadas: el formato MLX esta pensado para Apple Silicon (series M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). No es un artefacto para CUDA; para A100, H100 o RTX 4090 habria que usar la variante GGUF Q8_0 o los safetensors bf16.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada suficiente; en GPUs de consumo NVIDIA requeriria la variante GGUF, cuyo tamano en Q8_0 es del orden de los 10 GB y encaja en tarjetas de 12-16 GB con contexto moderado.
- Opciones de despliegue: mlx-vlm para el checkpoint MLX; llama.cpp u Ollama para la variante GGUF Q8_0; los safetensors bf16 para stacks que soporten el modelo base (vLLM, TGI) queda como no disponible, ya que no se documenta compatibilidad.
- Latencia y throughput: no disponibles; la model card deja la cifra de tok/s como marcador pendiente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-9B-uncensored-MLX-8bit | ~9,4 B | No disponible | MLX 8-bit | Apache 2.0 | Vision y MTP preservados; abliterado; Apple Silicon |
| Ornith-1.5-9B-uncensored (bf16) | ~9,4 B | No disponible | Safetensors bf16 | Apache 2.0 | Pesos abliterados a precision completa; referencia para medir el efecto de la cuantizacion |
| Ornith-1.5-9B-uncensored-GGUF-8bit | ~9,4 B | No disponible | GGUF Q8_0 | Apache 2.0 | Misma intervencion, orientada a llama.cpp |
| ornith-ai/Ornith-1.5-9B (base) | ~9,4 B | No disponible | No disponible | No disponible | Modelo original con rechazos; mitad de control del par experimental |
| Ornith-1.5-35B-A3B-uncensored-MLX-8bit | 35 B totales, 3 B activos | No disponible | MLX 8-bit | Apache 2.0 | Variante MoE de la misma familia, mayor capacidad con activacion reducida |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes ni frente a modelos de otros desarrolladores.

## Limitaciones y advertencias

- La abliteracion elimina una direccion de rechazo, no una politica: sobreviven rechazos por reafirmacion multi-turno, por direccionamiento del system prompt y en la ruta de vision. El comportamiento no es equivalente a un modelo sin entrenamiento de seguridad.
- El autor prohibe exponer estos pesos como endpoint publico sin una capa de moderacion independiente; quien despliega asume la responsabilidad de la moderacion que los guardrails originales cubrian.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; debe medirse por dominio antes de cualquier uso en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada; la ausencia de rechazos puede amplificar la reproduccion de contenido sesgado o danino sin senal de advertencia.
- Idiomas soportados no documentados, lo que impide garantizar calidad fuera del idioma o idiomas del modelo base.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos o conversaciones extensas sin verificacion empirica.
- Licencia Apache 2.0 permite uso comercial, pero las reglas operativas del autor (moderacion obligatoria, reporte del delta contra el base) deben respetarse como condicion de uso responsable.
- El checkpoint esta atado al ecosistema MLX y Apple Silicon; no es portable a CUDA sin recurrir a otra variante de la familia.
- Cualquier evaluacion debe reportarse como delta contra ornith-ai/Ornith-1.5-9B y re-medirse sobre prompts propios; los resultados no son transferibles entre dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-MLX-8bit
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante bf16 abliterada: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored
- Variante GGUF Q8_0: https://huggingface.co/junafinity/Ornith-1.5-9B-uncensored-GGUF-8bit
- Variante MoE MLX 8-bit: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-MLX-8bit
- Variante MoE GGUF Q8_0: https://huggingface.co/junafinity/Ornith-1.5-35B-A3B-uncensored-GGUF-8bit
- Coleccion de la familia: https://huggingface.co/collections/junafinity/ornith-15-uncensored-6a896c737cf40ad660af2ebd
- Sitio del autor: https://verisafe.live
- Contacto del autor: info@verisafe.live
