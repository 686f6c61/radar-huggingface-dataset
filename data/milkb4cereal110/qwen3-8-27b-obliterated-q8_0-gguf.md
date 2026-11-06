# Milkb4Cereal110/Qwen3.8-27B-OBLITERATED-Q8_0-GGUF

## Resumen

Milkb4Cereal110/Qwen3.8-27B-OBLITERATED-Q8_0-GGUF es una cuantizacion en formato GGUF (Q8_0) del modelo OBLITERATUS/Qwen3.8-27B-OBLITERATED, un derivado de la familia Qwen3 con tecnicas de "abliteration" aplicadas para eliminar total o parcialmente los mecanismos de rechazo y alineacion de seguridad del modelo original. El autor de esta conversion es el usuario Milkb4Cereal110, que empleo el espacio GGUF-my-repo de ggml.ai para generar los pesos en formato llama.cpp a partir del checkpoint original en safetensors.

El modelo cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y esta etiquetado con model_type qwen3, lo que lo situa en la gama de modelos densos de gran tamano de la familia Qwen. Su proposito declarado, segun los tags del repositorio, es la investigacion en seguridad de IA y el red-teaming: se trata de un modelo "uncensored" pensado para estudiar el comportamiento de sistemas sin las capas habituales de rechazo, no para despliegues de produccion orientados al publico general.

La relevancia de esta ficha radica en que documenta un artefacto de investigacion con implicaciones practicas claras: la cuantizacion Q8_0 reduce el peso a aproximadamente 29 GB de repositorio, lo que permite ejecutarlo en hardware de gama alta de consumo mediante llama.cpp, con la advertencia de que la ausencia de alineacion de seguridad implica riesgos significativos si se usa fuera de un entorno controlado de investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (model_type: qwen3), derivado de la familia Qwen3 |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q8_0 (GGUF); el repositorio tambien incluye safetensors y etiqueta mlx |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (qwen3.8-27b-obliterated-q8_0.gguf) y safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla del campo model_type: qwen3, que corresponde a la familia de transformers densos de Qwen. Al tratarse de una cuantizacion de un modelo derivado, no se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo original empleo RLHF, DPO u otras tecnicas de alineacion. Tampoco se documenta en la model card el proceso concreto de abliteration aplicado por OBLITERATUS, mas alla de los tags que lo identifican como tal.

La innovacion tecnica relevante en este artefacto es la conversion a GGUF Q8_0 mediante el espacio GGUF-my-repo de ggml.ai, que permite la ejecucion con llama.cpp tanto en CPU como en GPU y en hardware Apple Silicon a traves de la libreria MLX (etiquetada en el repositorio). La cuantizacion Q8_0 es una cuantizacion de 8 bits por bloque que preserva practicamente la calidad del modelo en precision completa, a costa de un tamano de archivo elevado (aproximadamente 29 GB en el repositorio). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional (pipeline_tag: text-generation, tag conversational).
- Modelo "uncensored"/"abliterated": no aplica los mecanismos habituales de rechazo del modelo base, lo que lo hace adecuado para estudiar respuestas sin filtros de alineacion.
- Orientado a red-team y ai-safety-research, segun los tags del repositorio.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de vision o audio: no documentadas.
- Modo thinking: no documentado en la informacion proporcionada.

## Casos de uso

- Investigacion en seguridad de IA: el modelo permite estudiar como responde un sistema de 27 B parametros sin capas de rechazo, comparando sus salidas con las del modelo alineado para identificar sesgos, fugas de conocimiento o comportamientos problematicos en entornos controlados.
- Red-teaming de aplicaciones: se puede emplear como adversario para probar la robustez de clasificadores de contenido, filtros de moderacion o sistemas de deteccion de prompts maliciosos, generando entradas que un modelo alineado rechazaria.
- Analisis de abliteration: investigadores pueden evaluar el grado de eliminacion de la alineacion comparando respuestas del modelo obliterado con el Qwen3 original en un conjunto de prompts de prueba estandarizado.
- Evaluacion de cuantizacion: al ser un Q8_0 de un modelo de 27 B, sirve para medir la degradacion (o ausencia de ella) frente a safetensors en tareas de generacion larga y razonamiento.
- Despliegue local en estaciones de trabajo: con llama.cpp o llama-server, el modelo puede ejecutarse en una GPU de 24-48 GB o en Apple Silicon con memoria unificada suficiente, para experimentacion offline sin dependencia de APIs.
- Generacion de texto creativo sin restricciones: en contextos de ficcion, guion o escritura experimental donde se requiere explorar contenido sensible bajo responsabilidad del operador.
- Docencia y demostraciones: ilustrar en cursos de seguridad el efecto de la abliteration sobre las politicas de rechazo de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q8_0, aproximadamente 29 GB de pesos, mas overhead de contexto y KV cache; se recomienda al menos 32-36 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, RTX A6000 (48 GB), RTX 6000 Ada (48 GB); en consumer, RTX 4090 (24 GB) resulta insuficiente para Q8_0 completo y requeriria offloading a CPU o una cuantizacion menor (Q4_K_M, Q5_K_M) no incluida en este repositorio.
- Cabe en consumer GPU: no en configuracion completa Q8_0 en 24 GB; si en Apple Silicon con 32 GB o mas de memoria unificada (M2/M3 Max o Ultra) mediante MLX o llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), MLX (tag mlx), y potencialmente otros runners compatibles con GGUF; vLLM y TGI no estan documentados para este artefacto GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Milkb4Cereal110/Qwen3.8-27B-OBLITERATED-Q8_0-GGUF | 27,3 B | No disponible | Apache 2.0 | GGUF Q8_0, safetensors | Derivado abliterated, orientado a red-team |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED (modelo base) | 27,3 B | No disponible | Apache 2.0 | safetensors | Checkpoint original sin cuantizar |
| Qwen3 original (familia) | Variable | No disponible | Apache 2.0 | safetensors, GGUF | Modelo alineado de referencia de la misma familia |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated/uncensored: no aplica rechazos de seguridad, por lo que puede generar contenido danino, ilegal o eticamente problematico; su uso debe limitarse a investigacion en entornos controlados.
- Riesgo elevado de alucinacion no mitigado por alineacion; las salidas no deben tratarse como factuales sin verificacion.
- No se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar comportamiento multilingue o contextos largos.
- Licencia Apache 2.0 permite uso comercial segun los terminos de la licencia, pero el autor no ofrece garantias y la responsabilidad legal del uso recae en el operador.
- La cuantizacion Q8_0, aunque de alta fidelidad, puede introducir diferencias menores frente a safetensors en tareas sensibles.
- El repositorio tiene muy baja traccion (88 descargas, 0 likes) y fue creado en 2026-10-29, sin historial de validacion por la comunidad.
- No hay benchmarks publicados que permitan evaluar su calidad real frente al modelo base.
- El tag mlx junto a GGUF puede indicar compatibilidad parcial; conviene verificar el runner adecuado antes de desplegar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Milkb4Cereal110/Qwen3.8-27B-OBLITERATED-Q8_0-GGUF
- Modelo base: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
