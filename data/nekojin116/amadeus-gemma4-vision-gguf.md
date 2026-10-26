# nekojin116/amadeus-gemma4-vision-gguf

## Resumen

amadeus-gemma4-vision-gguf es un modelo de visión y lenguaje distribuido en formato GGUF por el usuario nekojin116. Según la model card, se trata de un ajuste fino convertido a GGUF con Unsloth, con 7.518.069.290 parámetros totales (aproximadamente 7,5B) y un repositorio de 6,3 GB que incluye dos ficheros: los pesos cuantizados `gemma-4-E4B.Q4_K_M.gguf` y el proyector multimodal `gemma-4-E4B.F16-mmproj.gguf`. La nomenclatura del checkpoint sugiere una base de la familia Gemma 4 con 4B de parámetros efectivos, pero la model card no confirma ni la arquitectura ni el modelo de partida.

Su interés práctico está en que permite ejecutar un modelo multimodal en local mediante llama.cpp y su binario `llama-mtmd-cli`, sin depender de APIs externas y con un tamaño que encaja en GPU de consumo. Sin embargo, el repositorio no publica licencia, idiomas, longitud de contexto, datos de entrenamiento ni resultados de benchmarks, y en el momento de la consulta acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria.

La ficha siguiente recoge únicamente la información verificable del repositorio y marca de forma explícita como «no disponible» todo aquello que el autor no documenta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. El nombre del checkpoint (`gemma-4-E4B`) sugiere una variante de la familia Gemma 4, y el uso de un fichero `mmproj` separado es el esquema habitual de llama.cpp para modelos visión-lenguaje con proyector multimodal, pero la model card no lo detalla |
| Parámetros totales | 7.518.069.290 (~7,5B) |
| Parámetros activos | No disponible (no se confirma que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M para los pesos del modelo y F16 para el proyector multimodal (`mmproj`). El repositorio no ofrece otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (llama.cpp), con el proyector multimodal en un fichero GGUF F16 independiente |

## Arquitectura y entrenamiento

La información proporcionada no permite reconstruir la arquitectura interna. La model card solo indica que el modelo fue ajustado y convertido a GGUF con Unsloth, y que se distribuye en dos artefactos: un fichero de pesos cuantizado en Q4_K_M y un proyector multimodal en F16. La separación entre pesos y `mmproj` implica una arquitectura de dos componentes típica de los modelos visión-lenguaje en llama.cpp: un codificador visual que produce embeddings y un modelo de lenguaje que los consume a través de un proyector, pero no se dispone de la configuración exacta de capas, dimensiones ni tipo de atención.

Tampoco hay datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF, DPO o ajuste supervisado. El nombre `amadeus` apunta a un ajuste fino propio del autor sobre una base Gemma 4, pero se desconoce el propósito del fine-tuning, la licencia heredada y las condiciones de uso. Cualquier afirmación sobre calidad o alineación sería especulativa.

## Capacidades

- Generación de texto en formato conversacional, ejecutable con `llama-cli` y la opción `--jinja` para aplicar la plantilla de chat del modelo.
- Procesamiento de imágenes y texto combinados mediante `llama-mtmd-cli`, el binario multimodal de llama.cpp que carga el fichero `mmproj`.
- Inferencia totalmente local una vez descargados los GGUF, sin necesidad de conexión a servicios externos.
- Compatibilidad con el ecosistema llama.cpp y, con matices, con Ollama (ver limitaciones).
- Soporte de plantillas Jinja para estructurar turnos de conversación; no se confirma soporte explícito de *tool calling* ni de *function calling*.
- No se confirman capacidades de razonamiento multi-paso, modo *thinking*, audio, agentes autónomos ni un conjunto de idiomas concreto.
- El tamaño de 7,5B y la cuantización Q4_K_M permiten ejecución en hardware de consumo, lo que facilita prototipado rápido.

## Casos de uso

- Asistente de soporte técnico con capturas de pantalla: el modelo puede recibir una imagen de una interfaz o de un mensaje de error junto con la consulta del usuario y generar una respuesta en texto. Su tamaño de 7,5B permite desplegarlo en una estación de trabajo con GPU de 12-16 GB.
- Digitalización y extracción de datos de facturas o tickets: al combinar visión y generación de texto, puede transcribir campos de documentos escaneados en un flujo local. Es adecuado cuando la confidencialidad impide enviar los documentos a una API, aunque la cuantización Q4_K_M puede degradar la precisión en caracteres pequeños.
- Generación de texto alternativo para accesibilidad: integrado en un pipeline que procese imágenes de un sitio web y genere descripciones breves, con la ventaja de no depender de un servicio externo y de poder ajustarse a un vocabulario corporativo.
- Automatización de QA visual: comparar capturas de una aplicación antes y después de un despliegue y describir diferencias visibles. El modelo puede formar parte de un script de CI que analice imágenes y devuelva una descripción textual para revisión humana.
- Prototipado de asistentes de escritorio offline: distribución del GGUF junto con una interfaz local basada en llama-cpp-python u Ollama, útil en entornos con conectividad restringida o con requisitos de soberanía del dato.
- Apoyo educativo sobre imágenes de pizarra o ejercicios: el modelo puede describir el contenido de una fotografía y continuar la conversación en texto. Conviene validar la precisión en matemáticas, ya que no hay benchmarks publicados.
- Análisis preliminar de documentación técnica escaneada: resumir manuales o diagramas en un primer paso de revisión, dejando la validación final a un humano debido al riesgo de alucinación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, y tampoco se han encontrado comparaciones independientes.

## Requisitos de hardware

- VRAM estimada para Q4_K_M: los pesos ocupan aproximadamente 4,3-4,8 GB; sumando el `mmproj` en F16 (del orden de 0,5-1 GB) y la caché KV, un contexto de 4K requiere alrededor de 6-8 GB de VRAM. Con contextos de 16K o superiores, la cifra puede ascender a 10-12 GB.
- VRAM estimada para F16: los pesos completos rondarían los 15 GB, más el proyector multimodal, lo que sitúa el total en 17-19 GB sin contar la caché KV. No se distribuye un GGUF F16 de los pesos del lenguaje, solo del `mmproj`.
- GPU de consumo: una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB pueden ejecutar la variante Q4_K_M con contexto moderado. Una RTX 4070, 4080 o 4090 permite contextos mayores y mayor comodidad, aunque no se dispone de cifras de throughput.
- GPU de datacenter: A100 o H100 son adecuadas para la variante F16 o para servir varias peticiones concurrentes, si bien no hay datos publicados de latencia.
- Memoria unificada: los equipos Apple Silicon con 16 GB o más pueden ejecutar la variante Q4_K_M mediante llama.cpp con aceleración Metal.
- Despliegue: llama.cpp (`llama-cli` para texto y `llama-mtmd-cli` para multimodal) es la vía documentada. Ollama requiere crear un modelo unificado, ya que no admite ficheros `mmproj` separados. También son viables llama-cpp-python y LM Studio. El soporte de vLLM o TGI para este GGUF multimodal no está confirmado.
- Latencia y throughput: no disponibles. Dependerán de la GPU, de la cuantización y del número de tokens de contexto e imagen.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus respectivas model cards públicas; los de amadeus-gemma4-vision-gguf son los únicos disponibles en la información proporcionada.

| Modelo | Parámetros | Contexto | Visión | Licencia | Observaciones |
|---|---|---|---|---|---|
| amadeus-gemma4-vision-gguf | ~7,5B | No disponible | Sí (mmproj separado) | No disponible | Sin benchmarks ni validación comunitaria; distribución solo en GGUF |
| Gemma 3 4B | ~4B | 128K | Sí | Licencia Gemma | Alternativa de tamaño inferior y documentación completa, si se confirma que la base es Gemma |
| Qwen2.5-VL-7B | ~8,3B | 128K | Sí | Apache 2.0 | Mayor tamaño, licencia permisiva y amplio soporte en frameworks |
| Llama 3.2 11B Vision | ~10,7B | 128K | Sí | Licencia comunitaria de Llama 3.2 | Más parámetros y mayor requisito de VRAM, con ecosistema consolidado |

La comparación es estructural: no existen métricas de rendimiento de amadeus-gemma4-vision-gguf que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Licencia no especificada: no puede asumirse el uso comercial ni la redistribución. Es un riesgo legal directo para cualquier despliegue en producción.
- Ausencia total de benchmarks y de documentación de entrenamiento: no hay evidencia de calidad, alineación ni seguridad del ajuste fino.
- 0 descargas y 0 likes en el momento de la consulta: no existe validación por parte de la comunidad ni informes independientes.
- El nombre `gemma-4-E4B` no está confirmado por la model card; la base real y las obligaciones de licencia heredadas son desconocidas.
- Riesgo de alucinación propio de un modelo de 7,5B, especialmente en lectura de documentos densos, cifras y texto pequeño.
- La cuantización Q4_K_M puede degradar tareas sensibles a la precisión, como OCR fino, matemáticas o extracción de tablas.
- Longitud de contexto desconocida: no se puede garantizar el procesamiento de documentos largos o conversaciones multi-turno extensas.
- Idiomas no documentados: el rendimiento en castellano no está verificado.
- Ollama no admite el fichero `mmproj` separado; la model card propone crear un modelo unificado a partir del modelo fusionado en bf16, lo que aumenta los requisitos de memoria y añade un paso manual.
- El proceso de conversión con Unsloth y la cuantización no van acompañados de una validación de que la capacidad multimodal se conserve tras el ajuste.
- No hay información sobre filtros de seguridad; un fine-tuning puede haber reducido las salvaguardas del modelo base.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/nekojin116/amadeus-gemma4-vision-gguf)
- [Unsloth (repositorio oficial)](https://github.com/unslothai/unsloth)
- [llama.cpp (repositorio oficial)](https://github.com/ggml-org/llama.cpp)
- [Documentación de Unsloth](https://docs.unsloth.ai/)
- [Documentación de Modelfile de Ollama](https://github.com/ollama/ollama/blob/main/docs/modelfile.md)
