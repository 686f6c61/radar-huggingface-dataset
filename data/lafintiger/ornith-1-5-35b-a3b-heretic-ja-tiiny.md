# lafintiger/Ornith-1.5-35B-A3B-heretic-ja-tiiny

## Resumen

Ornith-1.5-35B-A3B-heretic-ja-tiiny es una recarga (re-upload) sin modificar de los pesos de OS-Software/Ornith-1.5-35B-A3B-heretic-ja, publicada por el usuario lafintiger con la etiqueta `base_model: Qwen/Qwen3.6-35B-A3B` para permitir su importación en un dispositivo Tiiny. No aporta entrenamiento nuevo: es una copia relabelada de un modelo derivado de ornith-ai/Ornith-1.5-35B-A3B, al que se le ha aplicado una ablación de rechazo (abliteration) con la herramienta Heretic v1.4.0 mediante el método Arbitrary-Rank Ablation (ARA) con un adaptador LoRA.

El modelo subyacente es un mixture-of-experts de 35.107.181.936 parámetros totales que activa aproximadamente 3B por token, con arquitectura etiquetada como `qwen3_5_moe`. Según la model card del autor original, la familia Ornith-1.5 se construye mediante un bucle de auto-mejora que optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de solución mediante aprendizaje por refuerzo, partiendo de Ornith-1.0 (desarrollado sobre Qwen3.5 y Gemma4 con preentrenamiento continuado y post-entrenamiento).

La relevancia de esta ficha es doble: por un lado documenta una variante deliberadamente "decensored" cuya alineación de seguridad ha sido reducida de forma sustancial (tasa de rechazo de 2/100 frente a 100/100 del original en pruebas con datasets japoneses); por otro, advierte de que se trata de una copia no oficial con procedencia delegada, 0 descargas y 0 likes en el momento de la consulta, lo que la hace inadecuada para cualquier despliegue en producción. El autor original la destina exclusivamente a investigación en seguridad, estudios de alineación y red-teaming.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (tag `qwen3_5_moe`), transformer disperso |
| Parametros totales | 35.107.181.936 (≈35,1B) |
| Parametros activos | ≈3B por token (según model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en el repo (70,2 GB); versiones GGUF publicadas en un repo externo (ver enlaces), formatos concretos no disponibles |
| Idiomas soportados | no disponibles en los metadatos; las pruebas de rechazo del autor se hicieron con datasets en japonés |
| Licencia | MIT (según metadatos; la model card enlaza a la licencia del modelo base) |
| Formato de pesos | safetensors (transformers) |
| Pipeline declarado | text-generation (los tags incluyen `image-text-to-text`, capacidades de visión no confirmadas) |
| Modelo base | Qwen/Qwen3.6-35B-A3B (relabel; original real: ornith-ai/Ornith-1.5-35B-A3B) |
| Metodo de desalineacion | Heretic v1.4.0 + Arbitrary-Rank Ablation (ARA) con LoRA y preservación de row-norm |
| Licencia del modelo original | MIT |
| Tamano del repositorio | 70,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-18 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas de mezcla de expertos: 35,1B parámetros almacenados de los que solo unos 3B se activan por token, lo que sitúa el coste computacional de inferencia en el rango de un modelo denso de 3B mientras la capacidad efectiva de representación corresponde a un 35B. El tag `qwen3_5_moe` sugiere una topología heredada de la familia Qwen3.5, aunque no se detalla en la información disponible el número de expertos, el número de expertos activos por token ni la dimensión oculta.

El entrenamiento del modelo base Ornith-1.5-35B-A3B, según su model card, se basa en un bucle de auto-mejora end-to-end: en lugar de depender de un conjunto fijo de tareas curadas por humanos y de harnesses diseñados manualmente, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la política mediante aprendizaje por refuerzo. Esto se apoya en Ornith-1.0, que partía de Qwen3.5 y Gemma4 con preentrenamiento continuado, mid-training y post-entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO independientes más allá del bucle RL descrito.

La modificación heretic se aplica sobre las capas 14 a 28 (start_layer_index 14, end_layer_index 28) con los siguientes hiperparámetros: `preserve_good_behavior_weight` 1,0000, `steer_bad_behavior_weight` 0,0061, `overcorrect_relative_weight` 2,8147, `neighbor_count` 1 y `secondary_update_weight` 0,0000. El método ARA proyecta el direccional de rechazo con un adaptador LoRA de rango arbitrario y preserva la norma de fila para minimizar el daño colateral en capacidades. No hay innovaciones adicionales documentadas (decodificación especulativa, atención lineal, etc.) en la información proporcionada.

## Capacidades

- Generación de texto conversacional y razonamiento multi-turno, heredados del modelo base Ornith-1.5-35B-A3B.
- Codificación y tareas agénticas: la model card del original afirma que supera a Qwen 3.6-35B en todos los benchmarks de código y agentes, y a modelos densos como Gemma 4-31B y Muse Glimmer-30B en coding agéntico (sin cifras disponibles en la información proporcionada).
- Razonamiento multi-paso y soporte de agentes, derivado del entrenamiento con scaffolds y rollouts del bucle de auto-mejora.
- Posible soporte multimodal texto-imagen: el tag `image-text-to-text` aparece en los metadatos, pero el `pipeline_tag` declarado es `text-generation` y la información no confirma la arquitectura de visión; tratar como no confirmado.
- Capacidad multilingüe: no documentada; las únicas pruebas reportadas por el autor usan datasets en japonés.
- Reducción drástica del comportamiento de rechazo: 2/100 palabras clave bloqueadas frente a 100/100 del modelo original.
- Tool calling / function calling: no documentado explícitamente en la información disponible, aunque el perfil agéntico del modelo base lo hace plausible; no verificable.

## Casos de uso

- Red-teaming de sistemas de moderación: usar el modelo como generador adversario controlado para producir prompts y respuestas que estresen clasificadores de seguridad, aprovechando su tasa de rechazo de 2/100 para obtener material que un modelo alineado no generaría.
- Estudios de alineación y ablation: reproducir el experimento con los hiperparámetros publicados (capas 14-28, ARA con LoRA) y medir el impacto en la divergencia KL (0,0477) y en la tasa de rechazo sobre distintos datasets, comparando con el modelo original.
- Evaluación de robustez multilingüe: dado que el autor validó el rechazo con datasets japoneses, sirve para estudiar si la desalineación se transfiere entre idiomas y qué degradación sufre en lenguas no cubiertas por las pruebas.
- Generación de datos sintéticos para investigación de seguridad: producir pares pregunta-respuesta etiquetados como inseguros para entrenar clasificadores o para construir benchmarks de evaluación de daño.
- Investigación sobre modelos MoE dispersos: con ~3B parámetros activos sobre 35,1B totales, permite experimentar con estrategias de enrutamiento, cuantización y serving en hardware modesto sin la penalización de latencia de un denso de 35B.
- Experimentación local en dispositivos con memoria limitada: los GGUF publicados por el autor original permiten probar el modelo en GPUs de consumo o en entornos tipo Ollama, siempre dentro de un uso estrictamente de laboratorio.
- Auditoría de procedencia de modelos: caso de estudio sobre re-etiquetado de `base_model` y sus implicaciones para la trazabilidad y la verificación de licencias en el ecosistema HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible para esta variante. La model card del modelo original incluye una tabla comparativa frente a Ornith-1.0-35B-A3B, Qwen3.6-35B-A3B, Gemma-4-31B y Muse Glimmer-30B, pero los valores numéricos no están presentes en el extracto disponible, por lo que no se reproducen.

Las únicas métricas publicadas para esta variante son las del proceso de abliteración, medidas con datasets en japonés:

| Metrica | Este modelo | Modelo original (ornith-ai/Ornith-1.5-35B-A3B) |
|---|---|---|
| Keywords (tasa de rechazo) | 2/100 | 100/100 |
| Divergencia KL | 0,0477 | 0 (por definición) |

Estas cifras miden el grado de desalineación de seguridad, no la calidad del modelo en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

Estimaciones calculadas a partir de los 35,1B parámetros totales; no son datos publicados por el autor:

- Pesos en bf16/fp16: ≈70 GB. Requiere A100 80GB, H100 80GB o dos GPUs de 48 GB. No cabe en una RTX 4090.
- Pesos en FP8: ≈35 GB. Cabe en A100 40GB, L40S 48GB o RTX 6000 Ada 48GB.
- Cuantización 4-bit: ≈18-20 GB. Cabe en RTX 4090 24GB, RTX 3090 24GB o RTX 5080 16GB solo con cuantizaciones de 3 bits.
- Cuantización 3-bit: ≈14-16 GB. Ajustado en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16GB), con riesgo de spill a memoria del sistema.
- Al activar solo ~3B parámetros por token, el throughput esperado es notablemente superior al de un denso de 35B con el mismo ancho de banda de memoria; no hay cifras de latencia ni tokens/s publicadas.
- Opciones de despliegue: transformers (librería declarada), vLLM y SGLang para serving con safetensors, llama.cpp y Ollama para los GGUF del repo externo, TGI como alternativa. Los kernels de MoE deben soportar la topología `qwen3_5_moe`.
- Para el dispositivo Tiiny mencionado en la model card no se especifican requisitos ni formato de importación.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-heretic-ja-tiiny (este) | 35,1B | ≈3B | no disponible | MIT | Copia relabelada, 0 descargas |
| Ornith-1.5-35B-A3B (original) | 35,1B | ≈3B | no disponible | MIT | Alineado, con benchmarks publicados |
| Qwen3.6-35B-A3B | no disponible | no disponible | no disponible | no disponible | Modelo base declarado; referencia directa en la model card |
| Gemma-4-31B | ≈31B | denso | no disponible | no disponible | Comparado en la model card del original en coding agéntico |
| Muse Glimmer-30B | ≈30B | denso | no disponible | no disponible | Comparado en la model card del original en coding agéntico |

La comparación cuantitativa de rendimiento entre estas alternativas no está disponible en la información proporcionada. Cualitativamente, la model card del original afirma superioridad sobre Qwen3.6-35B en código y agentes y sobre Gemma-4-31B y Muse Glimmer-30B en coding agéntico; esta variante heretic no ha sido re-evaluada en esas tareas.

## Limitaciones y advertencias

- Alineación de seguridad sustancialmente reducida: la tasa de rechazo cae de 100/100 a 2/100. El propio autor advierte de mayor probabilidad de generar contenido dañino, inexacto, sesgado u ofensivo.
- Uso previsto restringido a investigación y experimentación (seguridad, alineación, red-teaming); el autor pide explícitamente evitar su despliegue en servicios públicos o de cara al usuario final.
- Riesgo elevado de alucinación y de afirmaciones no verificadas; el autor exige tratar todas las salidas como no confiables y verificarlas de forma independiente.
- Procedencia dudosa: es una copia no oficial de un tercero, con `base_model` reetiquetado a Qwen/Qwen3.6-35B-A3B aunque los pesos provienen de ornith-ai/Ornith-1.5-35B-A3B. El campo `base_model` no refleja la cadena real de derivación, lo que rompe la trazabilidad y complica la auditoría de licencias.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero esa permisividad no exime de responsabilidad legal por el contenido generado ni de las condiciones del modelo base; la model card enlaza a la licencia del modelo original.
- Idioma no documentado: los metadatos no listan idiomas y las pruebas de rechazo se limitaron al japonés; el comportamiento en castellano u otras lenguas es desconocido.
- Longitud de contexto desconocida: no se puede garantizar el rendimiento en conversaciones de contexto largo ni en tareas de recuperación documental.
- Capacidad multimodal incierta: el tag `image-text-to-text` no está respaldado por el `pipeline_tag` ni por documentación en la información disponible.
- Sin benchmarks de capacidad publicados para esta variante; no hay evidencia de que la abliteración no haya degradado razonamiento, código o matemáticas más allá de la KL de 0,0477 declarada.
- Sin señales de adopción (0 descargas, 0 likes) ni mantenimiento; no hay garantía de actualizaciones, corrección de errores o soporte.
- El repositorio ocupa 70,2 GB, lo que implica coste de almacenamiento y de ancho de banda considerable para su descarga y réplica.

## Enlaces

- Repositorio de este modelo: https://huggingface.co/lafintiger/Ornith-1.5-35B-A3B-heretic-ja-tiiny
- Modelo del que se copian los pesos: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja
- Cuantizaciones GGUF: https://huggingface.co/OS-Software/Ornith-1.5-35B-A3B-heretic-ja-GGUF
- Modelo original alineado: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia referenciada: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Heretic (herramienta de abliteración): https://heretic-project.org
- Repositorio de Heretic en GitHub: https://github.com/p-e-w
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Blog de Ornith: https://deep-reinforce.com/ornith.html
