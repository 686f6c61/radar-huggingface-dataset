# mrysh/qwen3.5-4b-prune_24

## Resumen

qwen3.5-4b-prune_24 es una versión podada del modelo Qwen/Qwen3.5-4B, publicada por el usuario mrysh en HuggingFace. No se trata de un modelo entrenado para uso general, sino de un artefacto experimental creado para un benchmark de poda (pruning) que compara cuatro modelos base con ocho variantes de poda cada uno, contrastándolas además con cuantización. La evaluación se realiza sobre BFCL, hiring-bias y MedQA con vLLM.

La técnica aplicada es una esparsidad semiestructurada 2:4 sobre las capas lineales del decodificador, generada con NVIDIA ModelOpt 0.46.0rc1 (SparseGPT) usando un conjunto de calibración de 512 muestras mixtas. Esto implica que dos de cada cuatro pesos consecutivos son cero (50,0% de ceros), pero el fichero se almacena en formato denso, por lo que no hay reducción de tamaño ni ganancia de velocidad sin un runtime que soporte esparsidad.

El modelo conserva los 4.205.751.296 parámetros del modelo base y un tamaño en disco de 8,432 GB. No se realizó destilación ni fine-tuning posterior a la poda, por lo que cabe esperar una degradación de calidad frente al modelo original; precisamente el benchmark mide esa caída. Su relevancia es metodológica: sirve como referencia para estudiar el impacto de la poda 2:4 en tareas de tool calling, sesgo y conocimiento médico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (qwen3_5_text), transformer decoder-only con esparsidad semiestructurada 2:4 en capas lineales |
| Parámetros totales | 4.205.751.296 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el artefacto se distribuye en precisión densa; el benchmark compara contra cuantización, pero no se detallan los tipos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (denso, con ceros almacenados) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B original (transformer decoder-only de la familia Qwen3.5, tag `qwen3_5_text`). Sobre esa base se aplicó poda semiestructurada 2:4 en las capas lineales del decodificador: en cada bloque de cuatro pesos consecutivos se fuerzan dos a cero, lo que resulta en un 50,0% de esparsidad. La poda se realizó con NVIDIA ModelOpt 0.46.0rc1 mediante el algoritmo SparseGPT, calibrado con 512 muestras mixtas.

No hubo destilación ni fine-tuning de recuperación tras la poda, de modo que los pesos podados no se reajustaron para compensar la pérdida de información. El fichero resultante es denso: los ceros se almacenan explícitamente, por lo que el tamaño en disco (8,432 GB) y el número de parámetros (4.205.751.296) coinciden con los del modelo base. La aceleración potencial de la esparsidad 2:4 requiere un runtime con soporte de sparse kernels, que no se empleó en la evaluación. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo base ni sobre si se aplicó RLHF o DPO en el mismo.

## Capacidades

- Generación de texto y razonamiento: heredadas del Qwen3.5-4B base, aunque degradadas por la poda sin recuperación.
- Tool calling / function calling: evaluado específicamente en el benchmark mediante BFCL, lo que indica que el modelo está pensado para medirse en este tipo de tareas.
- Razonamiento multi-step y agentes: no se documenta soporte explícito más allá de lo que aporte el modelo base; en la evaluación se usa con "thinking off".
- Capacidades multilingües: no disponibles en la información proporcionada.
- Conocimiento de dominio médico: evaluado en MedQA como parte del benchmark.
- Modo thinking: la evaluación se ejecuta con el modo thinking desactivado en vLLM; no se detalla el comportamiento con thinking activo.
- Visión y audio: no disponibles.

## Casos de uso

- Benchmark de poda: el uso principal es servir como una de las ocho variantes de poda de Qwen3.5-4B para comparar la degradación de calidad frente al modelo base y frente a cuantización en BFCL, hiring-bias y MedQA.
- Investigación sobre esparsidad 2:4: permite estudiar cómo afecta la poda semiestructurada sin recuperación a un transformer de 4B en tareas de razonamiento y tool calling.
- Evaluación de sesgo en contratación: el benchmark incluye hiring-bias, por lo que el modelo puede emplearse para medir cómo la poda altera las respuestas sesgadas en escenarios de selección de personal.
- Validación de pipelines con vLLM: al estar pensado para ejecutarse con vLLM, sirve para probar configuraciones de inferencia y comparar latencia y calidad en un entorno de serving realista.
- Estudio de conocimiento médico: MedQA permite cuantificar la retención de conocimiento factual tras aplicar la poda en las capas lineales.
- Referencia metodológica para pipelines de compresión: útil para equipos que evalúan ModelOpt y SparseGPT antes de adoptar poda en producción, ya que documenta el coste de no hacer fine-tuning de recuperación.
- Comparación poda vs. cuantización: el diseño del benchmark permite usar este artefacto como punto de contraste frente a versiones cuantizadas del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el modelo forma parte de un benchmark sobre BFCL, hiring-bias y MedQA ejecutado con vLLM, pero no incluye las cifras obtenidas.

## Requisitos de hardware

- VRAM estimada para inferencia: al distribuirse en precisión densa con 4.205.751.296 parámetros, se necesitan aproximadamente 8,4 GB en BF16/FP16 solo para los pesos. En FP32 serían unos 16,8 GB. No hay reducción de memoria por la esparsidad, ya que los ceros se almacenan.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el modelo encaja en GPUs de 16 GB o más en BF16, y en GPUs de 8-12 GB si se aplica cuantización adicional.
- GPU de consumo: cabe en tarjetas con 16 GB o más (por ejemplo, RTX 4080/4090 en BF16); en tarjetas de 8-12 GB requeriría cuantización no documentada para este artefacto.
- Opciones de despliegue: vLLM es el runtime empleado en la evaluación del benchmark. No se documentan otras opciones (llama.cpp, Ollama, TGI) para este artefacto.
- Latencia y throughput: no disponibles. La ganancia de velocidad de la esparsidad 2:4 requeriría un runtime con soporte de sparse kernels, que no se usó en la evaluación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Esparsidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-4b-prune_24 | 4.205.751.296 | no disponible | 2:4 semiestructurada (50% ceros, fichero denso) | Apache 2.0 | HuggingFace (mrysh/qwen3.5-4b-prune_24) |
| Qwen/Qwen3.5-4B (base) | 4.205.751.296 (según este artefacto) | no disponible | ninguna | Apache 2.0 | HuggingFace (Qwen/Qwen3.5-4B) |
| Otras variantes de poda del benchmark | no disponible | no disponible | no disponible | no disponible | no disponible |
| Versiones cuantizadas del modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante es contra el modelo base sin podar: mismo número de parámetros y mismo tamaño en disco, pero con un 50,0% de ceros en las capas lineales y sin recuperación posterior, por lo que la calidad esperada es inferior. No se dispone de datos de rendimiento para cuantificar la diferencia.

## Limitaciones y advertencias

- Degradación de calidad esperada: no se aplicó destilación ni fine-tuning tras la poda, por lo que el rendimiento en tareas de razonamiento, tool calling y conocimiento factual será inferior al del Qwen3.5-4B original.
- Sin ganancia práctica de memoria ni velocidad: el fichero es denso y conserva los ceros, de modo que ocupa lo mismo que el modelo base; la aceleración solo se obtendría con un runtime de sparse kernels no utilizado en la evaluación.
- Sesgos: el benchmark incluye una prueba de hiring-bias, lo que sugiere que el modelo puede presentar sesgos en decisiones de contratación; no se publican resultados que los cuantifiquen.
- Riesgo de alucinación: no evaluado en la información disponible, y potencialmente agravado por la poda sin recuperación.
- Contexto e idiomas: no se documentan la longitud de contexto ni los idiomas soportados para este artefacto.
- Licencia: Apache 2.0, la misma que el modelo base; se remite a la model card del base para condiciones adicionales.
- Uso en producción: no recomendado como sustituto del modelo base; su finalidad declarada es la evaluación comparativa en un benchmark.
- Estado del artefacto: cero descargas y cero likes en el momento de la consulta, creado y actualizado el 2026-11-03, sin pipeline declarado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mrysh/qwen3.5-4b-prune_24
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- NVIDIA ModelOpt (librería de poda): no disponible en la información proporcionada
- Paper de SparseGPT: no disponible en la información proporcionada
- Paper de BFCL: no disponible en la información proporcionada
- Repositorio o demo del benchmark: no disponible en la información proporcionada
