# axteam/Qwen3.8-27B-GGUF

## Resumen

`axteam/Qwen3.8-27B-GGUF` es una conversión a formato GGUF del modelo denso `Qwen/Qwen3.8-27B`, publicada por el usuario axteam el 27 de octubre de 2026. El modelo original lo desarrolla el equipo Qwen de Alibaba y, según la documentación del repositorio oficial, se trata de un LLM denso multimodal nativo de pesos abiertos orientado a programación, flujos agénticos y automatización de oficina. Esta ficha cubre exclusivamente la versión cuantizada para llama.cpp.

La aportación concreta de este repositorio es doble: ofrece dos cuantizaciones k-quant (Q4_K_M de 16,8 GB y Q8_0 de 29,0 GB) listas para llama.cpp, Ollama y LM Studio, e incrusta el `chat_template` original para que el formato de conversación se preserve sin configuración adicional. Con 27.320.697.856 parámetros (27,3 B) y licencia Apache-2.0, es una opción interesante para equipos que quieren ejecutar un modelo de esa escala en hardware local sin depender de infraestructura en la nube.

Es importante señalar una limitación de alcance: estos ficheros GGUF son solo de texto. El codificador de visión del modelo base no está incluido, por lo que las capacidades multimodales del original no están disponibles aquí (a diferencia de otras conversiones de la comunidad que sí publican los ficheros `mmproj`). El repositorio tiene 0 descargas en el momento de redactar esta ficha, por lo que no existe validación comunitaria de la calidad de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE); modelo base multimodal nativo, estos GGUF son solo texto |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (16,8 GB) y Q8_0 (29,0 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Tamano del repositorio | 45,9 GB |
| Herramienta de conversion | `convert_hf_to_gguf.py` de llama.cpp |
| Plantilla de chat | `chat_template` original embebida |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso (no mezcla de expertos) de 27,3 mil millones de parámetros, descrito por el equipo Qwen como un modelo multimodal nativo de pesos abiertos. La conversión de axteam aplica la ruta estándar de llama.cpp (`convert_hf_to_gguf.py`) y conserva la plantilla de chat original, lo que garantiza que los turnos de sistema, usuario y asistente se formateen igual que en el modelo sin cuantizar. No se ha aplicado ningún ajuste fino posterior: es una derivada pura de cuantización.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del corpus, las etapas de alineación (RLHF, DPO u otras) ni innovaciones técnicas específicas del modelo original en la información proporcionada. La model card del repositorio de axteam no documenta ningún detalle arquitectónico más allá de la relación con el modelo base, y las referencias web consultadas solo indican la naturaleza densa y multimodal del original.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat embebida que respeta roles de sistema, usuario y asistente.
- Programación y tareas de ingeniería de software: el repositorio oficial del modelo base destaca el rendimiento en código como uno de sus puntos fuertes.
- Flujos agénticos y *agentic workflows*: el modelo base está posicionado explícitamente para tareas de agente y automatización.
- Automatización de oficina (documentos, hojas de cálculo, tareas administrativas) según la descripción del repositorio oficial.
- Multilingüismo: la model card incluye textos en inglés y coreano, pero no se detalla la lista de idiomas soportados; no disponible como dato verificado.
- Capacidad multimodal (entrada de imagen): presente en el modelo base, **no disponible** en estos ficheros GGUF, que son solo texto.
- Soporte de *tool calling* / *function calling*: no documentado en la información disponible para esta conversión.
- Modo de razonamiento (*thinking mode*), audio u otras capacidades especiales: no disponible.

## Casos de uso

- Asistente de código en local: con Q4_K_M (16,8 GB) se puede desplegar un asistente de autocompletado y revisión de código en una estación de trabajo con una sola GPU de 24 GB, manteniendo el código fuente dentro de la red corporativa sin enviar nada a la nube.
- Automatización de oficina con documentos sensibles: el modelo base está orientado a tareas administrativas; al ejecutarse con llama.cpp de forma totalmente local, encaja en sectores con requisitos estrictos de confidencialidad (legal, sanitario, administración pública).
- Chatbot de atención al cliente autoalojado: el `chat_template` embebido permite servir conversaciones multi-turno directamente con `llama-server` sin capa de formateo adicional, con la salvedad de que la longitud de contexto debe fijarse explícitamente en el arranque.
- Prototipado e investigación con requisitos de reproducibilidad: al ser una cuantización estándar k-quant, los resultados son reproducibles en cualquier máquina que cargue el mismo fichero y la misma versión de llama.cpp.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece dos niveles (Q4_K_M y Q8_0) que permiten medir la degradación de calidad frente al modelo en precisión completa en tareas concretas del dominio propio.
- Despliegue en portátiles y equipos sin GPU dedicada: Q4_K_M puede ejecutarse con offload parcial a CPU usando llama.cpp u Ollama, lo que permite disponer de un modelo de 27 B en hardware de gama alta de consumo.
- Pipelines de generación de texto por lotes: al no incluir el codificador de visión, el consumo de memoria es menor y el proceso es más sencillo de orquestar en servidores sin GPU de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de axteam ni las referencias web consultadas incluyen cifras de MMLU, HumanEval, GSM8K u otras evaluaciones, ni para el modelo base ni para las cuantizaciones. Tampoco se documentan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: aproximadamente 16,8 GB solo para los pesos; con contexto de 8.192 tokens hay que prever margen adicional para la caché KV (del orden de varios GB según el contexto efectivo). Encaja en GPU de 24 GB (RTX 3090, RTX 4090, A10G, L4 de 24 GB).
- VRAM estimada para Q8_0: aproximadamente 29,0 GB solo para los pesos; requiere GPU de 32 GB o más (A100 40 GB, A6000 48 GB, H100) o bien reparto entre GPU y CPU.
- GPU de consumo: Q4_K_M es viable en RTX 3090/4090 (24 GB). En tarjetas de 16 GB o menos es necesario offload parcial a RAM del sistema, con la consecuente caída de velocidad. Q8_0 no cabe en ninguna GPU de consumo actual de forma holgada.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (`ollama run hf.co/axteam/Qwen3.8-27B-GGUF:Q4_K_M`) y LM Studio. El ejemplo de la model card arranca con `-c 8192`, valor que hay que ajustar según la longitud de contexto que se necesite.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las dos cuantizaciones.
- Nota sobre descarga: el repositorio pesa 45,9 GB en total; descargar una sola cuantización con `-hf` evita bajar los dos ficheros completos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Multimodal | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|---|
| axteam/Qwen3.8-27B-GGUF (este) | 27,3 B | GGUF (Q4_K_M, Q8_0) | No (solo texto) | no disponible | Apache-2.0 | 0 descargas; sin validacion comunitaria |
| bartowski/Qwen3.8-27B-GGUF | 27,3 B | GGUF (varias cuantizaciones) | Si, incluye `mmproj` F16 y BF16 | no disponible | Apache-2.0 | Referencia de la comunidad; permite entrada de imagen |
| JonathanColetti/Qwen3.8-27B-Uncensored-GGUF | 27,3 B | GGUF | no disponible | no disponible | no disponible | Variante sin censura; no es el modelo oficial |
| Qwen/Qwen3.8-27B (base) | 27,3 B | safetensors | Si (nativo) | no disponible | Apache-2.0 | Pesos originales; requiere mas VRAM |

La diferencia práctica más relevante entre este repositorio y el de bartowski es la ausencia de los ficheros `mmproj`: si se necesita entrada de imagen, este GGUF no sirve y hay que recurrir a una conversión que los incluya. En el resto de aspectos (parámetros, licencia, formato) las alternativas son equivalentes, y la elección depende de la confianza en el publicador y de la disponibilidad de los ficheros multimodales.

## Limitaciones y advertencias

- Ausencia de visión: el codificador de imagen del modelo base no se ha convertido, por lo que cualquier caso de uso multimodal falla con estos ficheros.
- Contexto no documentado: se desconoce la ventana de contexto nativa del modelo. El valor `-c 8192` del ejemplo es una decisión de arranque, no una especificación; configurar un contexto superior al soportado puede producir degradación silenciosa.
- Sin benchmarks ni validación: el repositorio tiene 0 descargas y no incluye evaluaciones. No hay evidencia publicada de que la cuantización preserve la calidad del original.
- Publicador tercero: axteam no es el equipo Qwen. Aunque la licencia Apache-2.0 lo permite, la conversión no está auditada por el autor original.
- Pérdida por cuantización: Q4_K_M introduce una degradación de calidad no medida frente a Q8_0; en tareas de razonamiento o código sensible conviene validar con datos propios antes de producción.
- Idiomas no verificados: no se detalla la cobertura lingüística; el rendimiento en castellano no está documentado y debe evaluarse empíricamente.
- Sesgos y alucinaciones: no hay información publicada sobre sesgos del modelo base ni sobre tasas de alucinación. Al ser un modelo de 27 B, es esperable un riesgo de alucinación superior al de modelos frontera, pero no se aportan datos que lo cuantifiquen.
- Licencia: Apache-2.0 permite uso comercial y modificaciones, pero conviene revisar el fichero LICENSE del repositorio original y las condiciones de atribución al equipo Qwen.
- Fecha de publicación futura respecto a los datos habituales de referencia (octubre de 2026): verificar que la versión de llama.cpp empleada soporta la arquitectura antes de desplegar.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/axteam/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio GitHub oficial del modelo: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Cuantización alternativa con soporte multimodal (bartowski): https://huggingface.co/bartowski/Qwen3.8-27B-GGUF
- Variante sin censura (JonathanColetti): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored-GGUF
- Tutorial de ejecución local: https://aiindigo.com/tutorials/getting-started-with-qwen-3-8-27b-gguf-run-frontier-ai-locally
- Ficha de una cuantización de terceros ("Apex"): https://local-ai-zone.github.io/models/qwen3-8-27b-apex.html
