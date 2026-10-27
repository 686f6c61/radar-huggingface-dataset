# axteam/Qwen3.5-122B-A10B-GGUF

## Resumen

`axteam/Qwen3.5-122B-A10B-GGUF` es una conversión a formato GGUF del modelo `Qwen/Qwen3.5-122B-A10B`, publicada por el usuario axteam para su uso con llama.cpp, Ollama y LM Studio. No se trata de un modelo entrenado desde cero, sino de una derivación cuantizada de los pesos originales del equipo Qwen: el repositorio contiene únicamente dos ficheros GGUF (Q4_K_M de 75,8 GB y Q8_0 de 132,6 GB), generados con el script `convert_hf_to_gguf.py` de llama.cpp y con la plantilla de chat original embebida.

El modelo base es un transformer con 124.635.206.144 parámetros totales según los safetensors del repositorio original, y la nomenclatura «122B-A10B» del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 10.000 millones de parámetros activos por token. Esa inferencia procede del propio identificador del modelo; la model card de esta conversión no detalla la arquitectura ni el proceso de entrenamiento.

Su relevancia práctica es acotada pero clara: permite ejecutar un modelo de escala ~120B en hardware propio mediante cuantización, algo imposible con los safetensors originales en equipos de gama alta convencionales. La licencia Apache-2.0 del modelo base facilita el uso comercial, y la etiqueta `endpoints_compatible` indica compatibilidad con endpoints de inferencia estándar. El repositorio es muy reciente (creado el 27 de octubre de 2026) y no registra descargas ni valoraciones, por lo que carece todavía de validación por parte de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No detallada en la model card; la nomenclatura «A10B» del modelo base sugiere mezcla de expertos (MoE) con ~10B de parámetros activos |
| Parámetros totales | 124.635.206.144 (~124,6 mil millones, dato de safetensors del modelo base) |
| Parámetros activos | ~10 mil millones (deducido del sufijo «A10B» del nombre; no confirmado en la documentación) |
| Longitud de contexto | No disponible (el ejemplo de uso emplea `-c 8192`, pero es solo un valor de ejemplo, no el máximo del modelo) |
| Tipos de cuantización | Q8_0 (8 bits) y Q4_K_M (4 bits, k-quant medium) |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`Qwen3.5-122B-A10B-Q4_K_M.gguf`, `Qwen3.5-122B-A10B-Q8_0.gguf`) |

Datos adicionales del repositorio: tamaño total de 208,4 GB (suma exacta de ambos ficheros), etiquetas `gguf`, `qwen`, `qwen3_5`, `llama.cpp`, `quantized`, `conversational`, `endpoints_compatible`, `region:us`; 0 descargas y 0 likes en el momento de la consulta.

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el volumen de tokens de entrenamiento, la composición del corpus ni las fases de alineación (RLHF, DPO u otras) del modelo base en la documentación disponible. Lo único verificable es que la conversión se realizó con `convert_hf_to_gguf.py`, la herramienta oficial de llama.cpp, que preserva la plantilla de chat original del modelo Qwen en los metadatos del GGUF. Los ficheros son exclusivamente de texto: el codificador visual del modelo original no se ha incluido en la conversión, por lo que estas cuantizaciones no admiten entrada de imágenes.

Técnicamente, el interés de esta conversión reside en la combinación de escala y activación dispersa: si se confirma la estructura MoE implícita en el nombre, el coste de cómputo por token correspondería a un modelo de ~10B, mientras que el peso en memoria y disco corresponde a ~124,6B. Eso hace viable el offload parcial de expertos a CPU manteniendo velocidades de generación razonables, un patrón habitual en llama.cpp para modelos MoE de gran tamaño.

## Capacidades

- Generación de texto y conversación multi-turno: el GGUF incorpora la plantilla de chat original, de modo que el formateo de turnos es idéntico al del modelo Qwen de referencia.
- Ejecución en llama.cpp, Ollama y LM Studio, tanto en servidor (`llama-server`) como en CLI (`llama-cli`).
- Compatibilidad con endpoints estándar de inferencia (etiqueta `endpoints_compatible`).
- Procesamiento exclusivamente de texto: el codificador de visión no está incluido en estos ficheros.
- Capacidad de razonamiento, matemáticas, código, tool calling o modo «thinking»: no documentadas en la información disponible; no se puede confirmar ni descartar.
- Cobertura multilingüe: no documentada. El ejemplo de la model card usa una cadena en coreano (`안녕하세요`), pero se trata de una demostración de invocación de la CLI, no de una declaración de idiomas soportados.

## Casos de uso

- **Asistente conversacional autoalojado**: desplegando `llama-server -hf axteam/Qwen3.5-122B-A10B-GGUF:Q8_0` en un nodo con 2×H100 se obtiene un servicio de chat con plantilla de turnos idéntica al modelo original, sin dependencia de APIs externas.
- **Sustitución de API de terceros con requisitos de soberanía del dato**: al ser Apache-2.0 y ejecutarse en infraestructura propia, encaja en entornos donde el texto de los usuarios no puede salir de la organización (sanidad, banca, administración pública).
- **Procesamiento por lotes nocturno**: `llama-cli` con el fichero Q4_K_M permite clasificar, resumir o reescribir grandes volúmenes de documentos en una sola GPU de 80 GB, priorizando coste por token sobre latencia interactiva.
- **Prototipado en estación de trabajo**: con una RTX 4090 (24 GB) y 96-128 GB de RAM del sistema, el Q4_K_M puede ejecutarse haciendo offload de expertos a CPU; útil para validar prompts y plantillas antes de escalar al servidor.
- **Evaluación de degradación por cuantización**: disponer de Q8_0 y Q4_K_M del mismo modelo permite medir empíricamente la pérdida de calidad en tareas concretas de la organización antes de fijar el tamaño de despliegue.
- **Integración en pipelines internos vía HTTP**: `llama-server` expone una API local que puede consumirse desde orquestadores y colas de tareas ya existentes, sin reentrenar ni adaptar el modelo.
- **Uso individual en LM Studio u Ollama**: `ollama run hf.co/axteam/Qwen3.5-122B-A10B-GGUF:Q4_K_M` ofrece una vía de acceso de baja fricción para investigación y pruebas exploratorias.
- **Tareas de solo texto en pipelines que ya usan Qwen3.5 multimodal**: cuando la etapa no requiere imágenes, esta conversión evita cargar el codificador visual y reduce requisitos de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card del GGUF ni los metadatos del repositorio incluyen evaluaciones de MMLU, HumanEval, GSM8K ni métricas equivalentes, ni tampoco comparativas de perplejidad entre Q8_0 y Q4_K_M. Tampoco se ofrecen datos de latencia o throughput medidos.

## Requisitos de hardware

- **VRAM para Q8_0 (132,6 GB de fichero)**: se necesita al menos ~135-140 GB de memoria para pesos y overhead; en la práctica, 2×H100 80 GB o 4×A100 40 GB con tensor/pipeline parallelism, o bien offload parcial a RAM del sistema.
- **VRAM para Q4_K_M (75,8 GB de fichero)**: ~78-82 GB con contexto corto; una H100 80 GB queda al límite y probablemente requiera offload de algunas capas, siendo más seguro 2×A100 40 GB o 2×H100.
- **GPU de consumo**: ninguna GPU consumer individual (RTX 4090 24 GB, RTX 5090 u similares) alberga el modelo completo. Es viable con offload de expertos a CPU; si se confirma la estructura MoE de ~10B activos, el rendimiento resulta utilizable.
- **Memoria del sistema**: para configuraciones con offload conviene disponer de 128 GB de RAM o más, especialmente con Q8_0.
- **Opciones de despliegue**: llama.cpp (`llama-server`, `llama-cli`), Ollama y LM Studio son las vías documentadas por el autor. vLLM y TGI no se mencionan y su soporte de GGUF para este modelo no está verificado.
- **Latencia y throughput**: no disponibles. Al depender fuertemente del grado de offload a CPU, cualquier cifra sería específica de la configuración.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Visión |
|---|---|---|---|---|---|
| `axteam/Qwen3.5-122B-A10B-GGUF` (Q8_0) | 124,6B totales / ~10B activos | No disponible | GGUF | Apache-2.0 | No (encoder excluido) |
| `axteam/Qwen3.5-122B-A10B-GGUF` (Q4_K_M) | 124,6B totales / ~10B activos | No disponible | GGUF | Apache-2.0 | No (encoder excluido) |
| `Qwen/Qwen3.5-122B-A10B` (original) | 124,6B totales | No disponible | Safetensors | Apache-2.0 | Sí (el GGUF indica que el encoder no se incluye) |

No se dispone de información sobre modelos alternativos de terceros con los que establecer una comparación de rendimiento, contexto o calidad. Cualquier comparación numérica con otras familias (Llama, Mixtral, DeepSeek) requeriría datos de benchmarks que no se han publicado en esta ficha.

## Limitaciones y advertencias

- **Sin capacidades de visión**: el codificador visual del modelo original no está incluido; cualquier caso de uso con imágenes es inviable con estos ficheros.
- **Sin datos de rendimiento**: no hay benchmarks publicados, ni del modelo base en esta ficha ni de la comparación Q8_0 frente a Q4_K_M. Cualquier decisión de despliegue debe validarse con evaluaciones propias.
- **Degradación por cuantización**: Q4_K_M reduce el tamaño a aproximadamente la mitad respecto a Q8_0 con una pérdida de calidad declarada como «pequeña» por el autor, pero no cuantificada.
- **Contexto máximo desconocido**: el valor `-c 8192` del ejemplo es un parámetro de la CLI, no el límite del modelo. Fijar un contexto superior sin verificar la configuración de RoPE del GGUF puede degradar la calidad.
- **Idiomas no documentados**: no se puede asumir cobertura del español ni de otras lenguas sin pruebas; el ejemplo en coreano no constituye evidencia.
- **Tool calling y agentes no confirmados**: no hay documentación sobre function calling, modo de razonamiento ni capacidades de agente en esta conversión.
- **Riesgo de alucinación**: no evaluado. Al no existir informes de evaluación, debe asumirse el riesgo habitual de los modelos generativos y aplicar verificación externa en producción.
- **Madurez del repositorio**: 0 descargas y 0 likes, creado y actualizado el mismo día. No hay señales de validación comunitaria ni historial de mantenimiento por parte de axteam.
- **Compatibilidad de la plantilla de chat**: aunque el `chat_template` original está embebido, conviene verificar que el cliente (Ollama, LM Studio o código propio) lo aplica correctamente; de lo contrario, la calidad de las respuestas cae de forma notable.
- **Licencia**: Apache-2.0 permite uso comercial, pero los pesos y el tokenizador originales pertenecen al equipo Qwen; conviene revisar el fichero LICENSE del repositorio base antes de redistribuir.

## Enlaces

- Repositorio GGUF: https://huggingface.co/axteam/Qwen3.5-122B-A10B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-122B-A10B/blob/main/LICENSE

No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs técnicos, repositorios de código o demos.
