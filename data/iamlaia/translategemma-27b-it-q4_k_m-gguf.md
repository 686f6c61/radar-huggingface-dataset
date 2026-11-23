# IAmLaIA/translategemma-27b-it-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización en formato GGUF del modelo `google/translategemma-27b-it`, un modelo multimodal de la familia Gemma de Google orientado a tareas de traducción y procesamiento de imagen y texto. La conversión la ha realizado el usuario IAmLaIA mediante el espacio `GGUF-my-repo` de ggml.ai, que automatiza la transformación de pesos originales a GGUF usando llama.cpp. El resultado es un único archivo de aproximadamente 16,5 GB con cuantización Q4_K_M, pensado para ejecución local con llama.cpp.

El modelo base cuenta con 27.009.346.304 parámetros (unos 27 mil millones) según los pesos en safetensors, lo que lo sitúa en la gama alta de modelos abiertos ejecutables en hardware de consumo con cuantización agresiva. Al tratarse de una conversión automática, no aporta información propia sobre arquitectura, datos de entrenamiento o benchmarks: toda la documentación técnica remite a la model card original de Google, que no se incluye en la información disponible.

La relevancia de este repositorio es práctica: permite desplegar un modelo de traducción multimodal de 27B en entornos sin GPUs de datacenter, a costa de una pérdida de precisión no cuantificada por el autor. No obstante, la ausencia de descargas, de validación de calidad y de datos de rendimiento hace que deba tratarse como un artefacto experimental más que como una opción de producción consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Gemma; detalles no incluidos en la información proporcionada) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (única incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de uso de Google, con acceso restringido en Hugging Face) |
| Formato de pesos | GGUF (archivo `translategemma-27b-it-q4_k_m.gguf`); el modelo base usa safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. Por la nomenclatura (`gemma`, `-it`, pipeline `image-text-to-text`) se trata de un modelo de la familia Gemma de Google con ajuste por instrucciones y capacidad de entrada de imagen y texto, pero no se detallan el tipo de transformer, el mecanismo de atención, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineamiento. Tampoco se especifica el número de tokens de entrenamiento ni innovaciones técnicas concretas.

Respecto al proceso de cuantización, el repositorio se ha generado con el espacio `GGUF-my-repo` de ggml.ai, que ejecuta la conversión a GGUF mediante llama.cpp sin pasos adicionales documentados. No se indica qué versión de llama.cpp se usó, ni si se aplicaron calibraciones específicas para Q4_K_M, ni se han publicado métricas de perplejidad o evaluaciones comparativas frente a los pesos originales en safetensors.

## Capacidades

- Generación de texto y respuesta a instrucciones, heredadas del ajuste `-it` del modelo base.
- Procesamiento de entrada multimodal imagen-texto, según el pipeline declarado `image-text-to-text`.
- Traducción: el nombre del modelo (`translategemma`) sugiere especialización en tareas de traducción, aunque no se detallan los pares de idiomas soportados.
- Ejecución local mediante llama.cpp (CLI y servidor HTTP).
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Soporte de tool calling, agentes, modo thinking o audio: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.

## Casos de uso

- Traducción local de documentos: desplegar el modelo con `llama-server` en una máquina con GPU de consumo para traducir textos sin enviar datos a servicios externos, aprovechando la cuantización Q4_K_M para reducir requisitos de memoria.
- Prototipado de pipelines de traducción multimodal: usar la entrada imagen-texto para experimentar con traducción de contenido embebido en imágenes (capturas, carteles) en entornos de investigación.
- Evaluación de cuantizaciones: servir como referencia para comparar la calidad de Q4_K_M frente a los pesos originales en tareas de traducción, midiendo degradación con un conjunto de validación propio.
- Despliegue en estaciones de trabajo sin GPU de datacenter: al ocupar unos 16,5 GB en disco, puede cargarse en GPUs con 24 GB de VRAM o en configuraciones con offloading parcial a CPU.
- Integración en herramientas de escritorio: usar la CLI de llama.cpp o su servidor para incorporar traducción asistida en editores o utilidades ofimáticas locales.
- Investigación sobre modelos Gemma: emplear esta conversión como punto de partida para estudiar el comportamiento del modelo base en formato GGUF dentro de experimentos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa aproximadamente 16,5 GB, por lo que se necesitan al menos ~17-18 GB de VRAM para carga completa en GPU, más overhead de contexto KV.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40/80 GB, H100. También es viable en GPUs de 16 GB con offloading parcial a CPU, a costa de latencia.
- ¿Cabe en GPU de consumo? Sí, en modelos con 24 GB de VRAM (RTX 3090, 4090); en 16 GB requiere offloading.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), y por formato GGUF también es compatible con Ollama y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponible; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IAmLaIA/translategemma-27b-it-Q4_K_M-GGUF | ~27B | no disponible | GGUF Q4_K_M | Gemma | Hugging Face (0 descargas) |
| google/translategemma-27b-it (base) | ~27B | no disponible | safetensors | Gemma | Hugging Face (acceso con gate) |
| Otras cuantizaciones del mismo base | ~27B | no disponible | GGUF (otros quants) | Gemma | no disponible en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con modelos de traducción de tamaño similar; no disponible.

## Limitaciones y advertencias

- Conversión automática sin validación: el autor no documenta pruebas de calidad de la cuantización Q4_K_M frente a los pesos originales.
- Sin datos de benchmarks, contexto, idiomas ni arquitectura: la ficha técnica del modelo base no está incluida en este repositorio.
- Licencia Gemma: el uso comercial está sujeto a los términos de Google, con acceso restringido mediante gate en Hugging Face; es necesario aceptar la licencia para descargar los pesos originales.
- Riesgo de alucinación y sesgos: no evaluado en esta conversión; se heredan los del modelo base, que no se detallan.
- Idiomas soportados desconocidos: no se puede garantizar la calidad en castellano ni en otros idiomas sin evaluación propia.
- Contexto máximo desconocido: el ejemplo de la model card usa `-c 2048`, lo que sugiere que no se ha validado con ventanas mayores en esta conversión.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que la conversión haya sido revisada por terceros.
- Sin garantías de soporte: el autor no ofrece mantenimiento ni actualizaciones documentadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/IAmLaIA/translategemma-27b-it-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/google/translategemma-27b-it
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
