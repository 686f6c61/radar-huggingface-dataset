# Luni/Gemma-4-26B-A4B-Heretic-EXL3-6.0bpw

## Resumen

`Luni/Gemma-4-26B-A4B-Heretic-EXL3-6.0bpw` es una cuantización en formato EXL3 (ExLlamaV3) a 6.0 bits por peso del modelo `Luni/Gemma-4-26B-A4B-Heretic`, un derivado de la familia Gemma 4 con arquitectura MoE (mezcla de expertos) según las etiquetas del repositorio. El autor del checkpoint cuantizado es el usuario Luni, y el pipeline declarado es `text-generation` con orientación conversacional.

La relevancia práctica de esta ficha no está en el modelo base, sino en el empaquetado: el autor reporta un peso en VRAM de aproximadamente 19,5 GB con 0 GB de offload a RAM de sistema, lo que permite mantener el modelo íntegramente residente en una GPU de consumo de 32 GB (RTX 5090) y sostener hasta unos 32k tokens de contexto usando caché FP8. Es, por tanto, una pieza pensada para inferencia local de alta fidelidad, no para despliegues en clúster.

Existe una discrepancia nominal relevante que conviene tener presente: el nombre del repositorio indica "26B-A4B" (26 mil millones de parámetros totales, 4 mil millones activos), mientras que el recuento real de safetensors publicado es de 11.267.197.390 parámetros. No se dispone de información del autor que explique esa diferencia. El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) según etiqueta `moe`; familia `gemma4`. Detalle de capas y configuración de expertos: no disponible |
| Parametros totales | 11.267.197.390 según safetensors del repositorio. El nombre del modelo declara "26B": discrepancia no aclarada por el autor |
| Parametros activos | El nombre declara "A4B" (aproximadamente 4B activos por token); no confirmado en la información disponible |
| Longitud de contexto | Hasta ~32k tokens en VRAM con caché FP8 según la model card (configuración de despliegue, no necesariamente el máximo nativo del modelo). Contexto nativo: no disponible |
| Tipos de cuantizacion | EXL3 (ExLlamaV3) a 6.0 bpw, descrita por el autor como "maximum fidelity". No se ofrecen otros niveles en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | `gemma` (términos de licencia Gemma de Google) |
| Formato de pesos | `safetensors` cuantizados en formato EXL3, requieren backend ExLlamaV3 |

## Arquitectura y entrenamiento

El repositorio es una cuantización, no un entrenamiento: no aporta información sobre datos de entrenamiento, número de tokens, composición del corpus ni sobre si el modelo base empleó RLHF, DPO u otras técnicas de alineamiento. Lo único deducible de las etiquetas es que se trata de un transformer con mezcla de expertos (`moe`) de la familia `gemma4`, y que el checkpoint base se distribuye como `Luni/Gemma-4-26B-A4B-Heretic`.

La aportación técnica del autor se limita al proceso de cuantización con ExLlamaV3 a 6.0 bpw, presentada como "maximum fidelity", es decir, priorizando la fidelidad respecto al modelo original sobre la reducción de tamaño. La model card incluye una configuración de ejemplo con `backend: exllamav3`, `gpu_split: [28]` y `cache_mode: fp8`, que sitúa el reparto de capas en una única GPU de 32 GB y la caché KV en FP8. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o variantes híbridas SSM.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` está presente en el repositorio.
- Razonamiento y conocimiento general: capacidad esperable por pertenecer a la familia Gemma, aunque no se aportan evaluaciones que la cuantifiquen.
- Procesamiento de contexto largo: la model card reporta hasta ~32k tokens en VRAM con caché FP8, útil para documentos extensos y conversaciones multi-turno.
- Eficiencia de inferencia por arquitectura MoE: al activar solo una fracción de los parámetros por token (denominación "A4B"), el coste de cómputo por token es inferior al de un modelo denso del mismo tamaño total.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional autoalojado: el modelo puede ejecutarse íntegramente en una RTX 5090 sin offload a RAM de sistema, lo que permite mantener conversaciones multi-turno con baja latencia y sin depender de APIs externas.
- Procesamiento de documentos largos: con ~32k tokens de contexto en VRAM y caché FP8, encaja en tareas de resumen, extracción de datos y preguntas sobre contratos, informes o documentación técnica de decenas de páginas.
- Generación asistida en local para equipos con requisitos de confidencialidad: al no salir los datos de la máquina, es adecuado para borradores de documentación interna, correos y textos sobre material sensible.
- Prototipado de aplicaciones LLM antes de escalar a infraestructura: permite validar prompts, plantillas de chat y flujos de evaluación con un checkpoint cercano en comportamiento al modelo base, sin coste por token.
- Segunda opinión o evaluación comparativa de cuantizaciones: al ser un EXL3 a 6.0 bpw "maximum fidelity", sirve para medir la degradación frente al modelo sin cuantizar en tareas concretas del dominio propio.
- Fine-tuning y experimentación sobre el modelo base: el checkpoint cuantizado no es apto para reentrenamiento, pero el repositorio base `Luni/Gemma-4-26B-A4B-Heretic` sí puede emplearse como referencia para ajustes posteriores y comparar después contra esta versión.
- Servicio de inferencia mono-GPU en entornos de investigación: con ExLlamaV3 y reparto en una sola GPU, se puede levantar un endpoint interno para pruebas de carga y latencia sin necesidad de hardware de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor no incluye métricas de MMLU, HumanEval, GSM8K ni de perplejidad, ni comparaciones con el modelo sin cuantizar. Tampoco se dispone de mediciones de throughput (tokens/s) ni de latencia, más allá de la afirmación de que el modelo queda residente al 100% en VRAM en una RTX 5090 de 32 GB con 0 GB de offload.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 19,5 GB solo para los pesos, según la model card.
- Contexto y caché KV: hasta ~32k tokens en VRAM con `cache_mode: fp8`; el consumo de la caché crece con la longitud de contexto y no se detalla en el repositorio.
- GPU recomendadas: RTX 5090 (32 GB) es el caso validado por el autor, con `gpu_split: [28]`. Cualquier GPU con 24 GB o más podría alojar los pesos, pero no hay confirmación de que quepa con contexto útil; no disponible.
- Cabe en GPU de consumo: sí, en tarjetas de 32 GB. En GPUs de 24 GB (RTX 4090, 3090) requeriría reducir contexto o aceptar offload, extremo no documentado.
- Offload a RAM: 0 GB en la configuración de referencia del autor.
- Opciones de despliegue: backend ExLlamaV3 (`exllamav3`), que es requisito por el formato EXL3. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible, y en principio no soportada por el formato de cuantización.
- Latencia y throughput estimados: no disponibles. La arquitectura MoE con ~4B activos por token (según nomenclatura) sugiere un coste por token inferior al de un modelo denso equivalente en parámetros totales, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luni/Gemma-4-26B-A4B-Heretic-EXL3-6.0bpw | 11,27B reales en safetensors (nombre declara 26B totales / 4B activos) | ~32k en VRAM con caché FP8 (config. del autor) | EXL3 6.0 bpw | gemma | Repositorio público, 0 descargas |
| Luni/Gemma-4-26B-A4B-Heretic (modelo base) | No disponible en la información proporcionada | No disponible | Sin cuantizar (presumiblemente) | gemma | Repositorio público |
| Otras cuantizaciones EXL3 de Gemma 4 | No disponible | No disponible | No disponible | gemma | No disponible en la búsqueda realizada |
| Modelos densos de tamaño equivalente | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La comparación más directa disponible es frente a su propio modelo base sin cuantizar, y el propio autor la define como de "maximum fidelity" a 6.0 bpw, sin aportar métricas que lo respalden.

## Limitaciones y advertencias

- Discrepancia de parámetros: el nombre indica 26B totales y 4B activos, pero el recuento real de safetensors es de 11.267.197.390 parámetros. Conviene verificar el modelo base antes de asumir capacidades o requisitos derivados del nombre.
- Ausencia total de evaluaciones: sin benchmarks, sin métricas de perplejidad y sin comparación con el modelo sin cuantizar, no hay evidencia publicada de la degradación introducida por la cuantización a 6.0 bpw.
- Repositorio sin tracción: 0 descargas y 0 valoraciones en el momento de la consulta, lo que reduce la probabilidad de que los fallos estén documentados por terceros.
- Dependencia de backend: el formato EXL3 obliga a usar ExLlamaV3; no es portable a llama.cpp, Ollama, vLLM ni TGI, lo que limita las opciones de despliegue y de integración.
- Contexto condicionado al hardware: los ~32k tokens se alcanzan con caché FP8 en una GPU de 32 GB; en GPUs más pequeñas el contexto útil será menor, sin cifras publicadas.
- Idiomas no declarados: el repositorio no especifica cobertura lingüística, por lo que el rendimiento en castellano no está garantizado ni medido.
- Sesgos y alucinaciones: no hay información específica del autor. Al ser un derivado de Gemma, hereda los sesgos y el riesgo de alucinación del modelo base y de sus datos de entrenamiento, no documentados en esta ficha.
- Licencia Gemma: el uso comercial está sujeto a los términos de licencia Gemma de Google y a su política de uso aceptable; es responsabilidad del integrador revisar el cumplimiento antes de desplegar en producción.
- Nombre "Heretic": no se documenta en la información disponible qué modificación respecto al Gemma original implica esa denominación; conviene consultar la model card del modelo base antes de asumir un comportamiento alineado estándar.
- Fechas de metadatos: la creación y actualización del repositorio figuran como 2026-10-20, dato que procede de la plataforma y no se ha verificado de forma independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Luni/Gemma-4-26B-A4B-Heretic-EXL3-6.0bpw
- Modelo base: https://huggingface.co/Luni/Gemma-4-26B-A4B-Heretic
- Paper, blog o repositorio de ExLlamaV3: no disponible en la información proporcionada
- Demos o espacios asociados: no disponible en la información proporcionada
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo; los resultados obtenidos corresponden a entidades homónimas sin relación (Lunii, Lumni) y se descartan.
