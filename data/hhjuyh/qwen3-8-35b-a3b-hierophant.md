# hhjuyh/Qwen3.8-35B-A3B-Hierophant

## Resumen

Qwen3.8-35B-A3B-Hierophant es una variante no oficial del modelo Empero Qwen3.8-35B-A3B-Distill, publicada por el usuario hhjuyh en Hugging Face. Se trata de un modelo de 35.505.251.456 parámetros (35,5 mil millones) distribuido exclusivamente en formato GGUF para su uso con llama.cpp y LM Studio, con licencia Apache 2.0. El modelo parte de la arquitectura Qwen3.6-35B-A3B de Alibaba (nomenclatura interna del autor base) y ha sido destilado por Empero antes de recibir la modificación Hierophant.

La modificación Hierophant consiste en la fusión de un adaptador de rango 1 sobre el GGUF Q6_K original a escala 1.0, con el objetivo declarado de reducir el comportamiento de rechazo (refusal behavior). Según la model card, la fusión edita 121 tensores y preserva el formato original de los 753 tensores restantes, dando como resultado un GGUF autónomo. El modelo conserva la capacidad multimodal texto-imagen del modelo base, aunque esta solo se validó mediante una prueba de humo.

La relevancia de esta ficha es doble: por un lado, documenta una variante de "abliteration" (eliminación de rechazos) sobre un modelo destilado, una práctica cada vez más común en la comunidad; por otro, advierte de que las mejoras declaradas proceden de un conjunto de pruebas muy reducido (36 prompts), sin evaluación de contexto largo ni de uso de herramientas. El pipeline declarado es image-text-to-text y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.6-35B-A3B, según la model card); detalles de atención y capas no disponibles |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | no disponible (el sufijo A3B sugiere ~3 B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible (las pruebas se hicieron con 2.048 tokens) |
| Tipos de cuantizacion | Q6_K (29,21 GB) y Q4_K_M (21,71 GB) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); proyector de visión separado en F16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la designación Qwen3.6-35B-A3B y del pipeline image-text-to-text. El sufijo A3B sugiere una arquitectura de mezcla de expertos con aproximadamente 3 mil millones de parámetros activos, pero la model card no lo confirma explícitamente ni aporta datos sobre número de capas, cabezas de atención, tipo de atención o función de activación. Tampoco se especifica el volumen de tokens de entrenamiento ni la composición del dataset.

El proceso de creación tiene dos etapas documentadas. Primero, Empero publicó un destilado del modelo Qwen3.6-35B-A3B en formato GGUF (Q6_K y proyector de visión F16). Después, el autor de esta variante fusionó un adaptador de rango 1 denominado Hierophant sobre el Q6_K a escala 1.0, editando 121 tensores y conservando el formato de los 753 restantes. No se documenta RLHF, DPO ni ningún otro ajuste por preferencias; la única modificación es la fusión del adaptador orientada a reducir rechazos. No se mencionan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, incluyendo tareas de aritmética simple y respuestas cortas.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector mmproj-Qwen3.8-35B-A3B-F16.gguf, que debe cargarse junto al modelo; validado con una única prueba de lectura de título en una imagen.
- Razonamiento de varios pasos limitado: en las pruebas del autor, 0 de 6 tareas JSON multi-paso resultaron correctas.
- Modo "thinking" desactivado en todas las pruebas reportadas; no se documenta su comportamiento con el modo activado.
- Comportamiento de rechazo reducido: 0 de 10 rechazos explícitos en peticiones de engaño y trampa, frente a 10 de 10 del modelo original.
- Soporte de tool calling / function calling: no evaluado y no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no evaluado; los resultados de tareas JSON multi-paso sugieren carencias.
- Capacidades multilingües: únicamente inglés declarado.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo una fusión de rango 1 altera la tasa de rechazos (de 10/10 a 0/10) manteniendo respuestas benignas correctas (4/4), útil para analizar mecanismos de seguridad en modelos destilados.
- Evaluación comparativa de abliteration: sirve como referencia para medir el coste en calidad de las técnicas de eliminación de rechazos, dado que las tareas de calidad total se mantuvieron en 14/22 en ambos modelos.
- Despliegue local en estaciones de trabajo con llama.cpp o LM Studio: los GGUF de 21,71 GB (Q4_K_M) y 29,21 GB (Q6_K) permiten ejecución en hardware de consumo de gama alta sin infraestructura en la nube.
- Procesamiento de documentos con imagen y texto: la carga conjunta del proyector de visión permite extraer títulos o texto de imágenes junto a consultas textuales, aunque la validación es mínima.
- Experimentación con prompts conversacionales en inglés: el modelo responde a instrucciones cortas y tareas de aritmética simple (14/16 respuestas cortas correctas), adecuado para prototipos de chat.
- Estudio de la degradación en tareas estructuradas: los resultados de 0/6 en tareas JSON multi-paso lo convierten en un caso de estudio sobre los límites de los destilados pequeños en razonamiento estructurado.
- Base para futuras fusiones de adaptadores: al preservar el formato de 753 tensores, es un punto de partida para experimentar con otras modificaciones de bajo rango.

## Benchmarks y rendimiento

Los únicos datos disponibles proceden de la evaluación interna del autor con 36 prompts, contexto de 2.048 tokens, thinking desactivado y temperatura 0.

| Prueba | Q6_K original | Hierophant 1.0 Q6_K |
|---|---:|---:|
| Rechazos explícitos en engaño y trampa | 10/10 | 0/10 |
| Peticiones redirigidas a alternativa honesta | 0/10 | 1/10 |
| Prompts de control benignos respondidos | 4/4 | 4/4 |
| Respuestas cortas correctas | 14/16 | 14/16 |
| Tareas JSON multi-paso correctas | 0/6 | 0/6 |
| Total de tareas de calidad correctas | 14/22 | 14/22 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor advierte que las puntuaciones describen un conjunto de pruebas pequeño, con thinking desactivado, y que el rendimiento en contexto largo y uso de herramientas quedó fuera de su alcance.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22 GB para Q4_K_M y 29 GB para Q6_K, más el proyector de visión F16 en caso de uso multimodal.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 6000 Ada o RTX 4090 (24 GB) para Q4_K_M; Q6_K requiere 32 GB o más, por lo que encaja en A100 40 GB, H100 o configuraciones multi-GPU.
- GPU de consumo: Q4_K_M cabe ajustadamente en una RTX 4090 de 24 GB; Q6_K no cabe en GPU de consumo de 24 GB y requiere descarga a RAM o hardware profesional.
- Opciones de despliegue: llama.cpp (librería declarada), LM Studio; vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Hierophant | 35,5 B | no disponible | Apache 2.0 | GGUF | Variante con rechazos reducidos |
| empero-ai/Qwen3.8-35B-A3B-Distill-GGUF | 35,5 B (presumible) | no disponible | Apache 2.0 | GGUF | Modelo base sin modificar; 10/10 rechazos |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | Modelo original de Qwen citado como base |

No se dispone de datos de benchmarks comparativos con otras familias de modelos del mismo tamaño en la información proporcionada.

## Limitaciones y advertencias

- La reducción de rechazos implica que el modelo cumple peticiones de engaño y trampa (9 de 10 en las pruebas), lo que lo hace inadecuado para aplicaciones orientadas al usuario sin capas de moderación externas.
- Riesgo elevado de alucinación y de contenido no verificado: el autor documenta que en el prompt de plagio el modelo redactó una admisión, y 9 respuestas alcanzaron el límite de 192 tokens.
- Calidad en tareas estructuradas muy baja: 0 de 6 tareas JSON multi-paso correctas, lo que desaconseja su uso en pipelines que requieran salida estructurada fiable.
- Contexto y tool calling no evaluados; no hay garantías de comportamiento en ventanas largas ni en integración con herramientas.
- Idioma limitado al inglés; no se declara soporte de castellano ni de otras lenguas.
- La evaluación se realizó con solo 36 prompts, thinking desactivado y temperatura 0, por lo que los resultados no son extrapolables a producción.
- Es una variante no oficial: el autor no es el desarrollador original y no hay garantía de mantenimiento ni de soporte.
- La licencia Apache 2.0 permite uso comercial, pero la modificación de rechazos puede entrar en conflicto con políticas de uso aceptable de plataformas de despliegue; conviene revisar los términos de cada proveedor.
- El uso multimodal solo se validó con una prueba de humo; no hay evaluación sistemática de visión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hhjuyh/Qwen3.8-35B-A3B-Hierophant
- Modelo base (Empero Distill GGUF): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF
- Modelo base sin cuantizar (Empero Distill): https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio Hierophant: https://github.com/khimaros/hierophant
- GGUF Q6_K original: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF/blob/main/Qwen3.8-35B-A3B-Q6_K.gguf
- Proyector de visión F16: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill-GGUF/blob/main/mmproj-Qwen3.8-35B-A3B-F16.gguf
