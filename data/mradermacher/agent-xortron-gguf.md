# mradermacher/Agent.Xortron-GGUF

## Resumen

Agent.Xortron-GGUF es la colección de cuantizaciones estáticas en formato GGUF del modelo Agent.Xortron, publicada por mradermacher a partir de los pesos originales de jaforkhan5791/Agent.Xortron. El modelo base es un fine-tune de la familia Qwen 3.5 (etiqueta `qwen3_5` en los metadatos) con 26.895.998.464 parámetros totales, orientado a generación de texto conversacional y a tareas de agente. La model card lo etiqueta explícitamente como `uncensored` y `heretic`, lo que indica que se ha aplicado un proceso de ablación o desalineación deliberada de las capas de rechazo del modelo original.

El interés práctico de esta publicación no está en el modelo en sí, sino en el trabajo de cuantización: mradermacher ofrece trece variantes GGUF que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), además de dos ficheros mmproj (Q8_0 y f16) que actúan como suplemento multimodal. Esto permite ejecutar un modelo de ~27.000 millones de parámetros en hardware de consumo, algo inviable con los pesos en precisión completa.

La licencia declarada es Apache 2.0 y el idioma soportado según la model card es únicamente inglés. El repositorio ocupa 187,9 GB y acumula 656 descargas en el momento de la consulta. No se han publicado resultados de benchmarks ni especificaciones detalladas de entrenamiento en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5, según etiqueta `qwen3_5`) |
| Parámetros totales | 26.895.998.464 (~26,9 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, más mmproj Q8_0 y f16 |
| Idiomas soportados | inglés (`en` en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); pesos originales en safetensors en el repo base |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen3_5`, que sitúa el modelo base en la familia Qwen 3.5 de Alibaba. Con 26,9 mil millones de parámetros y sin indicación de mezcla de expertos, se trata presumiblemente de un transformer denso decoder-only, aunque el dato no se confirma en la model card. Tampoco se especifican la longitud de contexto nativa, el número de capas, la dimensión oculta ni el tipo de atención.

Respecto al entrenamiento, los metadatos listan dos datasets: `DJLougen/hermes-agent-traces-filtered`, que sugiere un ajuste supervisado sobre trazas de agente en formato Hermes (tool calling), y `darkc0de/Xortron.Config.Dataset.New.2026`, de propósito no documentado. La etiqueta `unsloth` indica que el fine-tune se realizó con la librería Unsloth, habitual para ajustes eficientes con LoRA/QLoRA. Las etiquetas `uncensored` y `heretic` apuntan a que se aplicó alguna técnica de ablación de direcciones de rechazo (del inglés *abliteration*) sobre el modelo base. No hay información sobre número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Razonamiento y resolución de tareas de agente, dado el dataset de trazas Hermes empleado en el ajuste.
- Soporte probable de tool calling / function calling en formato Hermes, aunque no se documenta explícitamente el esquema.
- Capacidades multimodales: la presencia de ficheros `mmproj` indica que el modelo base incorpora un proyector de visión, por lo que puede procesar imágenes junto con texto.
- Modo sin censura: el ajuste `heretic` elimina total o parcialmente los rechazos del modelo original, lo que permite generar contenido que el base rechazaría.
- Capacidades multilingües: limitadas al inglés según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Automatización de agentes con tool calling: el ajuste sobre trazas Hermes permite integrar el modelo en bucles de razonamiento multi-paso donde debe invocar funciones externas (APIs, bases de datos, shell) y encadenar resultados.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (16,6 GB) cabe en una RTX 4090 de 24 GB y permite ejecutar un modelo de ~27B con latencia aceptable mediante llama.cpp u Ollama.
- Procesamiento de documentos con imagen: gracias a los ficheros mmproj, puede emplearse en pipelines de extracción de información de capturas, formularios o diagramas combinados con instrucciones textuales.
- Generación de contenido sin restricciones de rechazo: útil en entornos de investigación sobre alineación, red teaming o generación creativa donde los filtros del modelo base resultan un obstáculo.
- Servidores de inferencia autoalojados: el formato GGUF es compatible con llama.cpp, Ollama y servidores compatibles con la API de OpenAI, lo que facilita sustituir APIs comerciales en entornos con requisitos de privacidad.
- Experimentación con cuantizaciones: la disponibilidad de trece niveles permite comparar la degradación de calidad frente al tamaño en un mismo modelo, útil para calibrar compromisos de memoria y fidelidad en proyectos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (solo pesos, sin caché KV): Q2_K ~10,8 GB; Q3_K_M ~13,4 GB; IQ4_XS ~15,3 GB; Q4_K_M ~16,6 GB; Q5_K_M ~19,3 GB; Q6_K ~22,2 GB; Q8_0 ~28,7 GB. Añadir entre 1 y 4 GB adicionales según longitud de contexto y tamaño de lote.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) equivalente; A100 40/80 GB o H100 para Q8_0 y contextos largos; GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q3_K_M o inferiores, con posible offload parcial a CPU.
- Cabe en GPU de consumo: sí, desde Q2_K hasta Q5_K_M en tarjetas de 24 GB; Q6_K y Q8_0 requieren 24 GB con offload parcial o GPUs profesionales.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, servidores compatibles con la API de OpenAI; el repo base en safetensors puede servirse con vLLM o TGI si se dispone de memoria suficiente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Agent.Xortron-GGUF (este) | ~26,9B | no disponible | Apache 2.0 | GGUF | Fine-tune Qwen 3.5 sin censura, con visión vía mmproj |
| Qwen 2.5 32B Instruct (GGUF) | ~32,8B | 128K (según versión) | Apache 2.0 | GGUF | Alternativa densa de tamaño similar, alineada y multilingüe |
| Gemma 2 27B Instruct (GGUF) | ~27,2B | 8K | Gemma license | GGUF | Tamaño comparable, contexto más corto, licencia no Apache |
| Mistral Small 24B Instruct (GGUF) | ~23,6B | 128K | Apache 2.0 | GGUF | Algo menor, multilingüe, sin capacidades de visión en todas las variantes |

La comparación se limita a parámetros, contexto y licencia; no hay datos de benchmarks para Agent.Xortron que permitan contrastar calidad.

## Limitaciones y advertencias

- El ajuste `heretic`/`uncensored` elimina las salvaguardas del modelo base: puede generar contenido dañino, ilegal o sexualmente explícito sin rechazo. No es apto para aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo elevado de alucinación: no hay benchmarks publicados que permitan estimar su fiabilidad factual, y los fine-tunes sobre trazas de agente suelen degradar el conocimiento general del modelo base.
- Idioma limitado al inglés según los metadatos; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Longitud de contexto no especificada: no se puede asumir la ventana nativa de Qwen 3.5 sin verificación empírica.
- Licencia Apache 2.0 declarada, pero la procedencia del modelo base y de los datasets de ajuste no está verificada; conviene auditar la cadena de licencias antes de un uso comercial.
- El repositorio ocupa 187,9 GB y contiene múltiples cuantizaciones; descargar solo el fichero GGUF necesario para evitar consumo innecesario de disco y ancho de banda.
- Sin likes y con 656 descargas, el modelo carece de validación comunitaria; no hay informes independientes de calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Agent.Xortron-GGUF
- Modelo base: https://huggingface.co/jaforkhan5791/Agent.Xortron
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Agent.Xortron-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Agent.Xortron-GGUF
- Dataset de trazas de agente: https://huggingface.co/datasets/DJLougen/hermes-agent-traces-filtered
- Dataset de configuración: https://huggingface.co/datasets/darkc0de/Xortron.Config.Dataset.New.2026
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfica de perplejidad por tipo de cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
