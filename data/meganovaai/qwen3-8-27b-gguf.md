# meganovaai/Qwen3.8-27B-GGUF

## Resumen

Qwen3.8-27B-GGUF es un espejo (mirror) del repositorio `unsloth/Qwen3.8-27B-GGUF`, publicado por el usuario meganovaai. No se trata de una cuantización propia: contiene exactamente los dos archivos que un nodo de la red Swan Chain carga en producción, fijados para que la configuración en ejecución sea reproducible. Los pesos derivan del modelo base `Qwen/Qwen3.8-27B`, un modelo multimodal de tipo image-text-to-text de unos 27.320 millones de parámetros (27,3B), con licencia Apache 2.0.

El repositorio incluye únicamente dos ficheros: `Qwen3.8-27B-UD-Q4_K_S.gguf` (15,36 GB, cuantización Dynamic 4-bit realizada por Unsloth) y `mmproj-BF16.gguf` (931 MB, proyector de visión imprescindible para la entrada de imagen). El total del repositorio es de 16,3 GB. Frente a la escalera completa de cuantizaciones que ofrece el repositorio original de Unsloth, aquí solo está el nivel Q4_K_S que el nodo sirve realmente.

Su interés práctico es doble. Por un lado, documenta cifras medidas —no estimadas— sobre hardware de consumo: 17,4 GiB de VRAM repartidos en dos RTX 3080 de 10 GB, ~33,5 tok/s de decodificación y 65.536 tokens de contexto con caché KV en `q8_0`. Por otro, sirve como referencia reproducible (comando de despliegue incluido) para levantar un modelo multimodal de 27B en un par de GPU consumer.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text con proyector de visión `mmproj`; arquitectura interna del base no detallada) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 65.536 tokens (contexto configurado y medido en el nodo de referencia; máximo nativo no disponible) |
| Tipos de cuantizacion | UD-Q4_K_S (Unsloth Dynamic 4-bit). Este repo solo aloja ese nivel; la escalera completa está en el repo de Unsloth |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de `Qwen/Qwen3.8-27B`) |
| Formato de pesos | GGUF para llama.cpp (`Qwen3.8-27B-UD-Q4_K_S.gguf` + `mmproj-BF16.gguf`) |
| Tamano del repositorio | 16,3 GB (15,36 GB modelo + 931 MB proyector) |
| Cuantizado por | unsloth (no por el autor de este mirror) |
| Fecha de creacion | 15 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base `Qwen/Qwen3.8-27B` (número de capas, tipo de atención, dimensión de embeddings, composición del dataset de entrenamiento, número de tokens, uso de RLHF/DPO o cualquier otra etapa de post-entrenamiento): todos esos datos figuran como no disponibles. Lo único verificable es que se trata de un modelo multimodal de tipo image-text-to-text que se ejecuta en llama.cpp, con un proyector de visión separado en formato GGUF BF16 (`mmproj-BF16.gguf`) y con una plantilla de chat Jinja que acepta el parámetro `enable_thinking`, lo que sugiere la existencia de un modo de razonamiento activable o desactivable.

La innovación técnica de esta ficha es de índole de despliegue, no de entrenamiento. Unsloth aplica una cuantización dinámica de 4 bits (UD-Q4_K_S) que asigna distinto presupuesto de bits según la sensibilidad de cada tensor. Sobre esa base, la model card documenta tres hallazgos operativos concretos en llama.cpp: el reparto de tensores entre GPU debe ser asimétrico (`--tensor-split 11,9`, no `1,1`) porque el proyector y la caché KV no se distribuyen de forma uniforme; la caché KV debe ser `f16` o `q8_0` uniforme, ya que mezclas o `q4_0` hacen que la flash-attention de CUDA caiga a CPU y el prefill se desplome hasta ~50 tok/s; y el alias del servidor debe coincidir con el ID que espera el enrutador de peticiones.

## Capacidades

- Generación de texto conversacional multi-turno en formato chat (pipeline `conversational`).
- Entrada de imagen (image-text-to-text) mediante el proyector `mmproj-BF16.gguf`; sin ese archivo el modelo funciona solo con texto.
- Modo de razonamiento conmutable mediante la plantilla de chat (`enable_thinking`); la configuración de referencia del nodo lo desactiva explícitamente.
- Servicio de inferencia con API compatible con OpenAI a través de `llama.cpp:server-cuda`, incluyendo soporte de plantilla Jinja (`--jinja`).
- Ejecución en paralelo de peticiones (`--parallel 2` en la configuración medida).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible (no se enumeran idiomas).
- Otras capacidades especiales (audio, visión de vídeo, etc.): no disponible.

## Casos de uso

- Despliegue multimodal autoalojado en hardware de consumo: el modelo cabe en 17,4 GiB de VRAM repartidos en dos RTX 3080 de 10 GB, lo que permite ofrecer entrada de imagen y texto sin depender de APIs externas ni de GPU de centro de datos.
- Extracción de información de documentos escaneados: con entradas de 1280x960 el proyector tarda ~10-25 s por imagen si el codificador de visión corre en CPU; es viable para lotes pequeños o procesos por turnos, no para OCR de alto volumen en tiempo real.
- Asistente conversacional con contexto largo: los 65.536 tokens de ventana permiten mantener conversaciones con documentación extensa adjunta, útil en soporte técnico o consulta de manuales internos.
- Análisis de capturas de pantalla y QA visual: revisión asistida de interfaces, verificación de estados de aplicaciones o comparación de imágenes dentro de un flujo interno con la misma API compatible con OpenAI.
- Infraestructura de inferencia reproducible: al estar los pesos fijados a un único nivel de cuantización, el repositorio sirve para congelar la configuración de un nodo y garantizar que las pruebas y los resultados no varían entre despliegues.
- Investigación en cuantización: permite comparar la calidad de la cuantización dinámica UD-Q4_K_S de Unsloth contra el modelo base en safetensors, dentro del mismo presupuesto de memoria.
- Servicio de inferencia en red distribuida: el comando documentado (con `--alias` apuntando al ID esperado por el router) está pensado para integrarse en un enrutador de nodos, replicable en otros equipos con dos GPU de 10 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales en la model card ni en los metadatos del repositorio.

Las únicas métricas publicadas son de rendimiento de inferencia, medidas en el nodo de referencia:

| Metrica | Valor medido |
|---|---|
| VRAM total | 17,4 GiB (9228 + 8594 MiB en dos RTX 3080 de 10 GB) |
| Contexto | 65.536 tokens, caché KV en `q8_0` |
| Decodificacion | ~33,5 tok/s |
| Prefill | ~1,2-1,7k tok/s |
| Codificador de vision | en CPU (`--no-mmproj-offload`), ~10-25 s por imagen de 1280x960 |
| Paralelismo | 2 peticiones simultaneas |

## Requisitos de hardware

- VRAM medida con la configuración documentada: 17,4 GiB con 65.536 tokens de contexto y caché KV uniforme en `q8_0`.
- GPU validadas por el autor: 2x RTX 3080 de 10 GB con `--tensor-split 11,9`. Reparto asimétrico obligatorio; un reparto `1,1` deja corta la tarjeta 0 y falla la carga.
- En GPU de mayor capacidad (por encima de 20 GB en una sola tarjeta o en varias) se puede retirar `--no-mmproj-offload` para acelerar el codificador de visión, que en la configuración medida corre en CPU.
- El reparto del modelo entre dos tarjetas implica que no cabe en una única GPU consumer de 10-12 GB con contexto completo.
- Uso solo texto: basta con el archivo del modelo, sin `mmproj-BF16.gguf`, aunque el consumo de VRAM no se reduce de forma significativa (el proyector ocupa 931 MB en BF16).
- Opciones de despliegue: `llama.cpp` (imagen `ghcr.io/ggml-org/llama.cpp:server-cuda`), y por formato GGUF es compatible con Ollama y otros frontales de llama.cpp. vLLM y TGI no son opciones directas para GGUF.
- Ajuste crítico de rendimiento: caché KV `f16` o `q8_0` uniforme. Con mezclas o `q4_0`, la flash-attention de CUDA cae a CPU y el prefill baja a ~50 tok/s.
- Throughput estimado para otras cuantizaciones o contextos distintos: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de la misma categoría con la que comparar parámetros o benchmarks. La comparación factible es entre este espejo y sus dos referencias directas:

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| meganovaai/Qwen3.8-27B-GGUF (este repo) | ~27,3B | 65.536 configurados | Solo UD-Q4_K_S | Apache 2.0 | Mirror con 2 archivos; 0 descargas y 0 likes en el momento de la consulta |
| unsloth/Qwen3.8-27B-GGUF | ~27,3B | no disponible | Escalera completa de cuantizaciones | Apache 2.0 | Repositorio original recomendado por el propio mirror |
| Qwen/Qwen3.8-27B | ~27,3B | no disponible | Pesos sin cuantizar (safetensors) | Apache 2.0 | Modelo base multimodal |

Rendimiento comparado frente a esos dos repositorios: no disponible (los únicos datos medidos son los del nodo que sirve este mirror).

## Limitaciones y advertencias

- El repositorio solo contiene el nivel de cuantización UD-Q4_K_S. Quien necesite Q8_0, Q5, Q3 o Q2 debe acudir al repositorio de Unsloth.
- Al ser una cuantización de 4 bits, existe una pérdida de calidad respecto a los pesos en safetensors del modelo base. No se han publicado evaluaciones que cuantifiquen esa pérdida.
- El mirror no está mantenido por quien realizó la cuantización (Unsloth). La procedencia de los pesos debe verificarse contra el repositorio original si se va a usar en producción.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no hay forma de confirmar cobertura multilingüe a partir de los metadatos.
- Latencia de visión alta en el escenario documentado: ~10-25 s por imagen de 1280x960 con el codificador en CPU. No es apto para visión en tiempo real en ese hardware.
- El rendimiento medido depende críticamente de la configuración: reparto asimétrico de tensores, caché KV uniforme en `q8_0` y `--alias` correcto. Desviarse de esos parámetros provoca fallos de carga o caídas de rendimiento drásticas (prefill ~50 tok/s).
- La configuración de referencia desactiva el modo de razonamiento (`enable_thinking: false`). El comportamiento con el modo activo no está documentado en la información disponible.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y atribución. No se indica ninguna restricción adicional.
- Repositorio sin descargas ni likes en el momento de la consulta: no hay evidencia de uso en producción por terceros ni retroalimentación de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/meganovaai/Qwen3.8-27B-GGUF
- Repositorio original de la cuantización (recomendado por el autor): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Imagen de servidor de llama.cpp usada en el comando de referencia: `ghcr.io/ggml-org/llama.cpp:server-cuda`
- Papers, blogs, repos adicionales o demos: no disponible (los resultados de búsqueda web no contenían material relacionado con el modelo)
