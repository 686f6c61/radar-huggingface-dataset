# Ghdjdh/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF

## Resumen
DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF en formato imatrix del modelo xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic, publicada por el usuario Ghdjdh (cuantizador original: mradermacher). Se trata de un modelo de 9.197.093.888 parametros (aproximadamente 9,2 mil millones) derivado de la familia Qwen3.5 y destilado a partir de trazas de razonamiento de DeepSeek, segun indican las etiquetas de la model card (distillation, deepseek, reasoning, sft, rl, gspo, mtp).

El modelo ha sido sometido a un proceso de "abliteration" o decensurado (etiquetas heretic, uncensored, decensored, abliterated), que elimina total o parcialmente las capas de rechazo del modelo original, de modo que responde a peticiones que un modelo alineado convencional rechazaria. Es relevante para desarrolladores que necesitan un modelo compacto, ejecutable en hardware de consumo, con capacidades de razonamiento, matematicas, STEM, uso de herramientas y funcion calling, y sin filtros de contenido.

El repositorio ocupa 81,3 GB e incluye un conjunto amplio de cuantizaciones (desde i1-Q2_K de 4,0 GB hasta i1-Q6_K de 7,7 GB), lo que permite desplegarlo desde GPUs de gama media hasta estaciones de trabajo. La licencia declarada es Apache 2.0. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun etiquetas); detalles de capas y atencion no disponibles |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF imatrix: i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-IQ4_NL, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; versiones estaticas en repositorio separado |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas de la model card. El modelo pertenece a la familia Qwen3.5 (tag qwen3_5) y es un transformer denso de 9,2 mil millones de parametros. Las etiquetas indican que el entrenamiento combina destilacion (distillation) de un modelo DeepSeek de mayor tamano, SFT (supervised fine-tuning), aprendizaje por refuerzo (rl) con el algoritmo GSPO, y MTP (multi-token prediction), una tecnica de prediccion de multiples tokens por paso que suele acelerar la decodificacion especulativa.

El proceso de "abliteration" (etiquetas heretic, abliterated, decensored) implica la modificacion de los pesos para eliminar la direccion de rechazo aprendida durante el alineamiento, reduciendo la probabilidad de respuestas de negativa ante peticiones sensibles. No se dispone del numero de tokens de entrenamiento, la composicion del dataset ni los detalles del pipeline de RLHF/DPO.

La cuantizacion aqui presentada es de tipo imatrix (importance matrix), generada por mradermacher a partir del modelo base, con cuantizaciones de la serie i1 que emplean una matriz de importancia calculada sobre texto de calibracion para mejorar la calidad respecto a las cuantizaciones estaticas equivalentes. La model card indica ademas que se trata de un modelo de vision, con archivos mmproj en el repositorio estatico.

## Capacidades
- Generacion de texto conversacional multi-turno (tag conversational).
- Razonamiento explicito (tag reasoning), con capacidad de producir cadenas de pensamiento antes de la respuesta.
- Matematicas y tareas STEM (tags math, stem).
- Generacion de codigo y asistencia en programacion.
- Uso de herramientas y function calling (tags tool-use, function-calling).
- Razonamiento multi-paso orientado a agentes.
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Respuestas sin filtros de contenido (decensurado/abliterated) ante peticiones que un modelo alineado rechazaria.
- Posible soporte de vision segun la model card (archivos mmproj en el repositorio estatico), aunque no se detalla la arquitectura del encoder visual.

## Casos de uso
- Asistencia en programacion y generacion de codigo en local: un modelo de 9,2 B cuantizado en Q4_K_M (5,9 GB) cabe en una GPU de consumo de 8-12 GB y permite autocompletado, refactorizacion y generacion de tests sin depender de APIs externas.
- Agentes autonomos con function calling: las etiquetas tool-use y function-calling indican soporte para invocar herramientas; puede integrarse en pipelines de agentes que consulten APIs, bases de datos o ejecuten comandos en un entorno controlado.
- Razonamiento matematico y STEM en entornos educativos o de investigacion: el modelo puede resolver problemas paso a paso y explicar el razonamiento, util para tutoria automatizada o generacion de material didactico.
- Procesamiento multilingue: con soporte para espanol, ingles, chino, coreano, japones y ruso, sirve para traduccion, resumen y atencion al cliente en varias lenguas dentro de una misma aplicacion.
- Investigacion sobre alineamiento y seguridad: al ser un modelo abliterated, es util para estudiar el comportamiento de modelos sin capas de rechazo, comparar respuestas con la version alineada y evaluar riesgos de contenido.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o contenido narrativo con tematicas que los modelos alineados suelen rechazar, en un entorno de uso privado y con revision humana posterior.
- Despliegue en edge o portatiles: las cuantizaciones i1-Q2_K (4,0 GB) e i1-IQ3_M (4,6 GB) permiten ejecucion en CPU o GPUs integradas con llama.cpp u Ollama, para prototipos y demos offline.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): i1-Q2_K ~4,0 GB; i1-IQ3_M ~4,6 GB; i1-Q4_K_M ~5,9 GB; i1-Q5_K_M ~6,7 GB; i1-Q6_K ~7,7 GB. Anadir entre 1 y 3 GB adicionales para la cache KV segun longitud de contexto y numero de usuarios concurrentes.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090 para las cuantizaciones mayores con contexto amplio; A100 o H100 solo si se necesita alto throughput o contexto muy largo.
- Cabe en GPU de consumo: si, desde una RTX 3060 12 GB (Q4_K_M o Q5_K_M con contexto moderado) hasta una RTX 4060 de 8 GB con cuantizaciones IQ3 o Q4_K_S.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el tag text-generation-inference sugiere compatibilidad con TGI en el modelo base, aunque para GGUF el camino habitual es llama.cpp. vLLM requeriria los pesos safetensors del modelo base, no los GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo denso de 9 B en Q4_K_M sobre una RTX 4090 suele superar las decenas de tokens por segundo, pero no se aportan mediciones verificadas para este modelo concreto.

## Comparativa con modelos similares
No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic (i1-GGUF) | 9,2 B | no disponible | Apache 2.0 | GGUF | Decensurado, razonamiento, tool use, multilingue |
| Qwen3 8B (original) | ~8 B | no disponible | Apache 2.0 | safetensors, GGUF | Alineado, sin abliteration; referencia de la familia |
| Llama 3.1 8B Instruct | 8 B | 128 K | Llama 3.1 Community | safetensors, GGUF | Alineado, ecosistema amplio, sin modo decensurado |
| Mistral 7B Instruct | 7,2 B | 32 K | Apache 2.0 | safetensors, GGUF | Mas pequeno, sin capacidades de razonamiento explicito |

La comparativa de rendimiento real entre estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias
- El proceso de abliteration degrada la alineacion del modelo: puede generar contenido ofensivo, ilegal o peligroso sin advertir, y no debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- Riesgo elevado de alucinacion, comun en modelos de 9 B y agravado por la falta de datos de evaluacion publicados.
- La longitud de contexto no esta documentada; no debe asumirse un contexto largo sin verificacion empirica.
- El soporte de vision solo se menciona de forma indirecta en la model card; la calidad y el alcance del encoder visual no estan verificados.
- El modelo base es una creacion de un tercero (xtools-at) con un nombre que sugiere destilacion de DeepSeek; no hay evidencia de que sea un modelo oficial de DeepSeek, por lo que la procedencia de los datos de entrenamiento y las garantias de calidad son limitadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- Aunque la licencia declarada es Apache 2.0, el uso comercial de un modelo decensurado conlleva riesgos legales y reputacionales que deben evaluarse con asesoria juridica.
- La cuantizacion Q2_K presenta perdida de calidad notable; para produccion se recomienda Q4_K_M o superior.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/Ghdjdh/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
