# mrfakename/DeepSeek-V4.1-Flash-1017-abliterated

## Resumen

DeepSeek-V4.1-Flash-1017-abliterated es una versión modificada del checkpoint deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario mrfakename. No es un modelo reentrenado: es el mismo checkpoint al que se le ha aplicado una ablación direccional (abliteration) para eliminar el comportamiento de rechazo. Conserva la estructura de ficheros, el formato y el layout FP8 del original, de modo que se carga en los mismos entornos que el modelo base.

El modelo base es un transformer disperso (MoE) de 763.205.315.794 parámetros totales (unos 763,2 mil millones) según los safetensors publicados, con 43 capas indexadas de la 0 a la 42: 40 capas principales y 3 capas DSpark/MTP (40-42). Incluye expertos enrutados y expertos compartidos, además de tablas Engram. El repositorio ocupa 510,3 GB y se distribuye en safetensors FP8 (block-scaled, 8 bits) y GGUF.

La relevancia es doble. Por un lado, es un caso práctico de ingeniería de representaciones aplicada a un modelo de escala frontera: la card documenta con precisión qué tensores se han editado, con qué método y con qué coste medido en divergencia KL sobre prompts inocuos. Por otro lado, interesa a quien investiga mecanismos de rechazo, evalúa filtros de seguridad o necesita un modelo que no rechace peticiones para tareas de red teaming controlado. No hay datos publicados de benchmarks de capacidad (MMLU, HumanEval, GSM8K) ni de longitud de contexto en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (etiqueta `deepseek_v41`), con expertos enrutados y expertos compartidos; 43 capas (0-42): 40 principales + 3 DSpark/MTP; tablas Engram |
| Parámetros totales | 763.205.315.794 (~763,2 B), dato de safetensors |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 block-scaled (8 bits) en safetensors; GGUF Q8_0 (usado para medir la ablación); LoRA rank-2 en GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8, `model-*.safetensors` con el mismo índice que el original) y GGUF |
| Tamaño del repositorio | 510,3 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base, sin cambios estructurales: un transformer MoE con expertos enrutados, expertos compartidos por capa, tablas Engram y tres capas finales DSpark/MTP orientadas a predicción multi-token. La card identifica explícitamente los puntos de escritura al residual stream que se han editado (`attn.wo_b` y `ffn.shared_experts.w2`) en las 40 capas principales, lo que confirma atención con proyección de salida y un bloque FFN con expertos compartidos. No se ha realizado ningún entrenamiento adicional: no hay datos sobre tokens de preentrenamiento, composición del dataset, RLHF ni DPO en la información proporcionada.

La innovación técnica está en el método de ablación. En lugar de una única dirección de rechazo, se midió una dirección por capa y por modo (chat y modo think) sobre el GGUF Q8_0, y se calculó un subespacio de rechazo de rango 2 a partir de los vectores singulares principales de todas esas direcciones. Ese subespacio se proyectó fuera de las escrituras al residual stream de las 40 capas principales, con una intensidad por capa obtenida mediante búsqueda multiobjetivo: minimizar rechazos y mantener baja la KL del primer token en prompts inocuos. Los expertos enrutados, los embeddings, las tablas Engram y las capas 40-42 son bit a bit idénticos al original. Los tensores editados se recuantizaron a FP8 con sus escalas de bloque originales usando redondeo estocástico para que el redondeo no deshiciera la edición. La edición es reproducible: `abliteration-edit.npz` contiene la base del subespacio Q y las intensidades por capa, con la fórmula W' = W − s·QQᵀW, y `abliteration-lora.gguf` aplica el mismo cambio a los GGUF originales.

## Capacidades

- Generación de texto en dos modos diferenciados: modo chat y modo think (razonamiento explícito), tal como se describen en la card al medir el rechazo por separado.
- Razonamiento multi-paso en modo think, con cabeza de razonamiento evaluable de forma independiente a la respuesta final.
- Cumplimiento de peticiones dañinas: se elimina deliberadamente el comportamiento de rechazo (4/100 rechazos en chat, 9/100 en modo think sobre el conjunto de evaluación del autor).
- Predicción multi-token mediante las capas DSpark/MTP (40-42) del modelo base.
- Compatibilidad de carga con el modelo original: mismos ficheros, mismo índice y mismo layout FP8.
- Aplicación de la misma edición sobre GGUF de terceros mediante LoRA de rango 2 en llama.cpp.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Red teaming y evaluación de seguridad: sirve como generador adversario controlado para probar clasificadores de contenido y filtros de moderación, usando el modo chat para obtener cumplimiento directo y el modo think para respuestas más elaboradas.
- Investigación en ingeniería de representaciones: la publicación incluye la base del subespacio Q y las intensidades por capa en `abliteration-edit.npz`, lo que permite replicar el experimento, variar el rango del subespacio o comparar el efecto de editar `attn.wo_b` frente a `ffn.shared_experts.w2`.
- Análisis de mecanismos de rechazo: comparar activaciones y direcciones entre el original y esta versión en las 40 capas principales, con la ventaja de que el resto de tensores son idénticos bit a bit y actúan como control.
- Generación de datos de entrenamiento para moderación: producir pares de petición-respuesta no rechazada que alimenten clasificadores de daño o datasets de preferencias sobre contenido sensible.
- Escritura de ficción sin restricciones: narrativa con violencia, temas médicos, legales o de seguridad donde el modelo base tiende a rechazar por forma y no por contenido real.
- Investigación académica sobre utilidad y daño: medir si la eliminación del rechazo degrada capacidades con la métrica disponible (KL de 0,067 en el primer token sobre prompts inocuos) y diseñar evaluaciones propias de calidad.
- Despliegue autoalojado de gran escala en FP8: al conservar el layout del original, se puede servir con el mismo stack (vLLM, SGLang, llama.cpp) si se dispone de un clúster multi-GPU equivalente.

## Benchmarks y rendimiento

Los únicos datos publicados son las métricas de la ablación, medidas sobre GGUF Q8_0 con decodificación greedy, con 100 prompts dañinos reservados y 384 tokens generados por prompt:

| Métrica | Original | Abliterated |
|---|---|---|
| Rechazos en chat (de 100) | 97 | 4 |
| Rechazos en modo think (cabezas de razonamiento, de 100) | 98 | 9 |
| KL del primer token en prompts inocuos | 0 | 0,067 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, MATH u otros) en la información disponible.

## Requisitos de hardware

- Peso de los pesos en FP8: aproximadamente 763 GB solo para parámetros (estimación aritmética a partir de 763,2 B × 1 byte), más escalas de bloque, buffers y caché KV. El repositorio publicado ocupa 510,3 GB, por debajo de esa cifra teórica; conviene verificar la integridad de los shards antes de desplegar.
- Alternativa GGUF Q8_0: aproximadamente 810 GB estimados (unos 8,5 bits por parámetro). La propia card referencia el fichero en 10 shards (`...-Q8_0-00001-of-00010.gguf`).
- BF16: no publicado; serían unos 1,5 TB estimados. No es un formato de despliegue realista para este tamaño.
- GPU recomendadas: clúster multi-GPU de centro de datos. Con H100 de 80 GB hacen falta del orden de 10-12 unidades para FP8 con margen para caché KV; con H200 de 141 GB, del orden de 7-8. Cifras estimadas por tamaño, no verificadas por el autor.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 6000 Ada (48 GB) pueden alojar el modelo, ni siquiera con cuantizaciones agresivas no publicadas.
- Opciones de despliegue: vLLM y SGLang para el checkpoint FP8; llama.cpp / `llama-server` para el GGUF Q8_0, con la posibilidad de aplicar `abliteration-lora.gguf` sobre los GGUF del modelo original mediante `--lora`. TGI: no confirmado en la información disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de TTFT.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Rechazos (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base) | 763,2 B (según este repo) | no disponible | 97/100 | MIT (según metadatos) | público en HuggingFace |
| DeepSeek-V4.1-Flash-1017-abliterated | 763,2 B | no disponible | 4/100 | MIT | público en HuggingFace, 0 descargas |
| Otras variantes abliterated de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

La comparación relevante es contra el modelo base, porque comparten arquitectura, formato y (salvo los tensores editados) pesos idénticos. No se dispone de datos de benchmarks de capacidad para ninguno de los dos, así que no es posible cuantificar la degradación más allá de la KL de 0,067 en el primer token sobre prompts inocuos.

## Limitaciones y advertencias

- El modelo cumplirá peticiones dañinas de forma deliberada. La propia card lo advierte y traslada toda la responsabilidad de uso al operador. No debe exponerse a usuarios finales sin una capa de moderación externa.
- Elimina el rechazo, no la capacidad de daño: sigue siendo un modelo de 763 B capaz de generar instrucciones operativas peligrosas en ámbitos como armas, malware o química.
- El rechazo residual no es cero: 4/100 en chat y 9/100 en modo think. Además, la card señala derivas semánticas en modo think (por ejemplo, una petición sobre artefactos explosivos caseros reformulada como bomba de baño), lo que indica que la edición no es limpia en todos los casos.
- La KL de 0,067 en el primer token sobre prompts inocuos implica una desviación medible en la distribución de salida incluso en entradas benignas; el autor reconoce que parte de esa cifra es ruido de inferencia por lotes. No hay evaluación de si esa desviación degrada razonamiento, código o matemáticas.
- Sin datos de benchmarks de capacidad, idiomas, contexto ni parámetros activos. Cualquier decisión de producción basada en rendimiento requiere evaluación propia.
- Señales de validación débiles: 0 descargas, 0 likes, sin pipeline declarado, sin idiomas declarados y creado y actualizado con 20 minutos de diferencia. Es un artefacto de investigación, no un modelo con historial de uso.
- Discrepancia de tamaño: 510,3 GB publicados frente a ~763 GB teóricos en FP8. Verificar shards, índice y posible cuantización parcial antes de asumir que el checkpoint está completo.
- Licencia MIT declarada en los metadatos de HuggingFace para este repo; conviene confirmar la licencia efectiva del modelo base antes de uso comercial, ya que la card no la reproduce.
- El sesgo del modelo base no se elimina con la ablación: sigue presente y ahora sin el filtro de rechazo que parcialmente lo contenía. No hay evaluación de sesgos en la información disponible.
- La recuantización a FP8 con redondeo estocástico introduce una fuente adicional de variación frente al original; la edición no es bit a bit reproducible en el dominio de los tensores editados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Imagen de resultados de la ablación (stats.png): https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated/blob/main/stats.png
- LoRA de ablación en GGUF (abliteration-lora.gguf): https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated/blob/main/abliteration-lora.gguf
- Base del subespacio e intensidades por capa (abliteration-edit.npz): https://huggingface.co/mrfakename/DeepSeek-V4.1-Flash-1017-abliterated/blob/main/abliteration-edit.npz
- Paper, blog técnico o repositorio adicional: no disponible en la información proporcionada.
