# mradermacher/Experimental-Base-Instruct-70B-GGUF

## Resumen

Experimental-Base-Instruct-70B-GGUF es una recopilación de cuantizaciones estáticas en formato GGUF del modelo TareksGraveyard/Experimental-Base-Instruct-70B, publicada por el usuario mradermacher, conocido en Hugging Face por distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo subyacente es un merge de 70.553.886.784 parámetros (aproximadamente 70,5 mil millones) generado con mergekit, lo que indica que se trata de una fusión de pesos de otros modelos más que de un entrenamiento desde cero.

La relevancia de esta ficha radica en que el modelo original no está disponible como pesos completos en un formato estándar ampliamente consumible, sino que esta publicación ofrece el modelo en múltiples niveles de cuantización (desde Q2_K hasta Q8_0) que permiten ejecutarlo en hardware de consumo o en servidores con VRAM limitada. El repositorio ocupa 481,3 GB en total y contiene todos los archivos GGUF, además de una variante con cuantizaciones ponderadas/imatrix en un repositorio separado.

Se trata de un modelo de propósito conversacional (etiqueta "conversational" y "instruct" en el nombre) orientado únicamente al inglés según la model card, sin información pública sobre la licencia, el contexto máximo ni los datos de entrenamiento. La fecha de creación es el 28 de febrero de 2025 y la última actualización registrada es el 22 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (merge de modelos mediante mergekit; arquitectura exacta no disponible) |
| Parametros totales | 70.553.886.784 (70,5 B) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estáticas); variantes imatrix/ponderadas en repositorio separado |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original se distribuye presumiblemente en safetensors, pero no se detalla en la información disponible |

## Arquitectura y entrenamiento

El modelo base TareksGraveyard/Experimental-Base-Instruct-70B es, según las etiquetas de la model card, el resultado de un merge realizado con mergekit. Esto implica que sus pesos provienen de la combinación de dos o más modelos preexistentes, típicamente mediante técnicas como SLERP, TIES, DARE o model stock, en lugar de un entrenamiento desde cero sobre un corpus de tokens. La información disponible no especifica qué modelos se fusionaron, qué método de merge se empleó, ni si hubo una fase posterior de instrucción o alineación (RLHF/DPO) sobre el modelo fusionado.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de decodificación especulativa, atención lineal u otras innovaciones técnicas. La etiqueta "instruct" en el nombre sugiere que el modelo está orientado a seguir instrucciones, pero no se documenta el proceso de alineación. La cuantización la realiza mradermacher con su herramienta habitual (convert_type: hf, output_tensor_quantised: 1), generando archivos GGUF estáticos a partir de los pesos en formato Hugging Face.

## Capacidades

- Generación de texto conversacional en inglés, orientada a instrucciones según la nomenclatura del modelo.
- Razonamiento y respuesta a preguntas de propósito general (no se documentan capacidades específicas de código o matemáticas).
- Soporte de conversaciones multi-turno (etiqueta "conversational").
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modos de razonamiento explícito (thinking mode).
- Compatible con endpoints (etiqueta "endpoints_compatible") para despliegue en infraestructuras de inferencia.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (42,6 GB) y Q5_K_M (50,0 GB), el modelo puede ejecutarse en configuraciones con 48 GB de VRAM o mediante offloading parcial a CPU con llama.cpp, lo que permite experimentar con un modelo de 70 B sin infraestructura de datacenter.
- Investigación sobre técnicas de merge: al ser un modelo fusionado con mergekit, sirve como caso de estudio para analizar el comportamiento de merges de 70 B y comparar la calidad de distintas cuantizaciones (Q2_K frente a Q8_0) sobre los mismos pesos.
- Prototipado de asistentes conversacionales en inglés: la etiqueta "conversational" y el formato instruct permiten usarlo como base para chatbots de dominio general en entornos de desarrollo, con la cautela de que no hay benchmarks publicados.
- Evaluación comparativa de cuantizaciones: los 11 niveles de cuantización disponibles permiten medir la degradación de perplejidad y calidad entre Q2_K y Q8_0 en una misma tarea, útil para calibrar políticas de cuantización en producción.
- Generación de texto por lotes en servidores con CPU: las cuantizaciones Q2_K (26,5 GB) y Q3_K_S (31,0 GB) permiten ejecutar el modelo en servidores sin GPU mediante llama.cpp, a costa de una calidad reducida, para tareas de generación masiva no crítica.
- Integración en pipelines de inferencia compatibles con GGUF: herramientas como llama.cpp, Ollama o servidores compatibles con la API de OpenAI pueden cargar estos archivos para pruebas de integración y desarrollo de aplicaciones, aunque la falta de licencia clara desaconseja su uso comercial sin verificación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de archivo GGUF, más overhead de contexto y KV cache):
  - Q2_K: ~26,5 GB
  - Q3_K_S: ~31,0 GB
  - Q3_K_M: ~34,4 GB
  - Q3_K_L: ~37,2 GB
  - IQ4_XS: ~38,4 GB
  - Q4_K_S: ~40,4 GB
  - Q4_K_M: ~42,6 GB
  - Q5_K_S: ~48,8 GB
  - Q5_K_M: ~50,0 GB
  - Q6_K: ~58,0 GB (dividido en 2 partes)
  - Q8_0: ~75,1 GB (dividido en 2 partes)
- GPU recomendadas: para Q4_K_M y superiores se recomiendan GPUs con 48 GB o más de VRAM (A6000, A100 80 GB, H100). Las cuantizaciones Q2_K y Q3_K pueden caber en GPUs de 32 GB (V100 32 GB, A100 40 GB) con contexto reducido.
- En GPU de consumo: Q4_K_M (42,6 GB) no cabe en una RTX 4090 (24 GB) sin offloading parcial a CPU; Q2_K (26,5 GB) tampoco cabe íntegramente en 24 GB. Se requiere ejecución híbrida GPU+CPU con llama.cpp para GPUs de 24 GB o menos.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, servidores compatibles con la API de OpenAI que acepten GGUF, y herramientas de inferencia con soporte GGUF. No se documenta soporte para vLLM o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Experimental-Base-Instruct-70B-GGUF | 70,5 B | no disponible | no disponible | GGUF | Hugging Face (mradermacher) |
| Llama 3.1 70B Instruct | 70 B | 128 K | Llama 3.1 Community License | safetensors, GGUF | Hugging Face (Meta) |
| Qwen2.5 72B Instruct | 72 B | 128 K | Apache 2.0 (mayoritariamente) | safetensors, GGUF | Hugging Face (Alibaba) |
| Mistral Large 2 | 123 B | 128 K | Mistral Research License / comercial | API, safetensors | Mistral AI |

La comparativa con Llama 3.1 70B y Qwen2.5 72B es pertinente por tamaño y categoría (modelos instruct de ~70 B), pero no se dispone de benchmarks del modelo evaluado que permitan comparar rendimiento. La licencia del modelo evaluado es desconocida, lo que supone una desventaja frente a alternativas con licencias documentadas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es imprescindible verificar la licencia del modelo base TareksGraveyard/Experimental-Base-Instruct-70B antes de cualquier despliegue en producción.
- Modelo únicamente en inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Al ser un merge con mergekit sin documentación del proceso, existe riesgo de degradación de capacidades, inconsistencias de formato y comportamientos impredecibles en comparación con modelos entrenados de forma nativa.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento, código o matemáticas. No se recomienda asumir un rendimiento equiparable a otros modelos de 70 B.
- Riesgo de alucinación inherente a los modelos de lenguaje; la ausencia de documentación sobre alineación (RLHF/DPO) aumenta la incertidumbre sobre la fiabilidad de las respuestas.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin verificación empírica.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; la propia model card advierte que Q3_K_M es de "lower quality".
- El repositorio ocupa 481,3 GB, lo que exige espacio de almacenamiento considerable y descargas de archivos multiparte para Q6_K y Q8_0.
- Popularidad muy baja (75 descargas, 0 likes) y última actualización registrada en noviembre de 2026: no hay evidencia de mantenimiento activo ni de una comunidad que valide su calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Experimental-Base-Instruct-70B-GGUF
- Modelo base: https://huggingface.co/TareksGraveyard/Experimental-Base-Instruct-70B
- Cuantizaciones imatrix/ponderadas: https://huggingface.co/mradermacher/Experimental-Base-Instruct-70B-i1-GGUF
- Página de descarga del autor: https://hf.tst.eu/model#Experimental-Base-Instruct-70B-GGUF
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Gráfico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit (herramienta de merge): https://github.com/arcee-ai/mergekit
