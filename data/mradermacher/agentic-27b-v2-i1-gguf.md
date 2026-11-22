# mradermacher/Agentic-27B-V2-i1-GGUF

## Resumen

Agentic-27B-V2-i1-GGUF es la versión cuantizada con GGUF del modelo base opencsg/Agentic-27B-V2, publicada por el usuario mradermacher. Se trata de un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3 mil millones) orientado específicamente a tareas agénticas: uso de herramientas, function calling, automatización y generación de código, con especial énfasis en escenarios tipo SWE-bench. El autor del modelo base es OpenCSG, y esta variante concreta se distribuye únicamente en formato GGUF para su uso con llama.cpp y derivados.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de 27B especializado en agentes y código, sin necesidad de GPUs de centro de datos, gracias a las cuantizaciones que van desde 11 GB (i1-Q2_K) hasta 22,5 GB (i1-Q6_K). Las cuantizaciones incluidas son de tipo imatrix (weighted/imatrix quants), lo que en la práctica suele ofrecer mejor calidad por bit que las cuantizaciones estáticas equivalentes.

No se dispone de información pública sobre la longitud de contexto, la arquitectura interna, los datos de entrenamiento ni los resultados de benchmarks en la información proporcionada. La model card de esta variante es exclusivamente la plantilla estándar de mradermacher para cuantizaciones, y no reproduce la model card del modelo base. Todos los datos ausentes se marcan explícitamente como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer, inferido del uso de transformers y GGUF; no confirmado en la información) |
| Parametros totales | 27.320.697.856 (~27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (todas imatrix); existe también un repositorio de cuantizaciones estáticas |
| Idiomas soportados | zh, en (según la model card del modelo base) |
| Licencia | opencsg-model-and-dataset-license (marcada como "other"; enlace a la licencia en el repo del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Los tags del repositorio incluyen "qwen3.8", lo que sugiere una base derivada de la familia Qwen, pero este dato no se confirma en la model card y debe tratarse con cautela. El modelo se distribuye bajo library_name "transformers" y está pensado para su uso con vLLM según los tags del repositorio, además de los formatos GGUF para llama.cpp.

En cuanto al entrenamiento, la información disponible no especifica el número de tokens, la composición del dataset ni si se aplicaron técnicas de RLHF, DPO u otras. Los tags "agent", "agentic", "tool-use", "function-calling", "code", "swe-bench" y "automation" indican que el ajuste está orientado a tareas de agente y código, pero no se aportan detalles técnicos sobre el proceso. Esta variante concreta (i1-GGUF) es una cuantización con imatrix del modelo base, generada por mradermacher; no introduce cambios arquitectónicos, solo compresión de pesos.

## Capacidades

- Generación de texto conversacional (tag "conversational").
- Uso de herramientas y function calling (tags "tool-use", "function-calling").
- Comportamiento agéntico y automatización de tareas (tags "agent", "agentic", "automation").
- Generación y edición de código, con orientación a tareas tipo SWE-bench (tags "code", "swe-bench").
- Capacidades multilingües limitadas a chino (zh) e inglés (en) según la model card del modelo base.
- Posible soporte de visión: la model card de la cuantización indica "This is a vision model - mmproj files (if any) will be in the static repository", aunque los ficheros mmproj no se confirman en el repositorio i1; debe verificarse en el repositorio estático.
- Compatibilidad con endpoints (tag "endpoints_compatible") y con vLLM (tag "vllm").
- No se confirma soporte de modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Automatización de tareas de ingeniería de software: el modelo está etiquetado con "swe-bench" y "code", por lo que puede emplearse en pipelines que resuelven issues, generan parches y ejecutan pruebas, integrándose en flujos de CI/CD mediante function calling.
- Agentes autónomos con uso de herramientas: gracias a los tags "agentic" y "tool-use", puede orquestar llamadas a APIs externas, consultas a bases de datos o ejecución de comandos en un bucle multi-paso.
- Asistente de programación en local: con cuantizaciones i1-Q4_K_M (~16,9 GB) puede desplegarse en una estación de trabajo con GPU de consumo alta gama y ofrecer autocompletado y refactorización sin enviar código a la nube.
- Automatización de soporte técnico interno: el modelo puede gestionar conversaciones multi-turno en inglés o chino con llamadas a sistemas de ticketing mediante function calling.
- Generación de scripts de automatización: para tareas de DevOps, scraping o procesamiento de datos, el modelo puede producir código ejecutable y encadenar herramientas.
- Evaluación de agentes en investigación: al estar disponible en GGUF, permite reproducir experimentos de agentes en hardware modesto, comparando cuantizaciones para estudiar el impacto de la compresión en el rendimiento agéntico.
- Procesamiento de documentación técnica bilingüe (zh/en): útil en equipos con documentación mixta en chino e inglés, siempre que se confirme la ventana de contexto real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - i1-Q2_K: ~11,0 GB.
  - i1-IQ3_S / i1-Q3_K_M: ~12,7-13,6 GB.
  - i1-Q4_K_S / i1-Q4_K_M: ~15,9-16,9 GB.
  - i1-Q5_K_M: ~19,6 GB.
  - i1-Q6_K: ~22,5 GB.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para los pesos; para Q6_K se recomienda una GPU de 24 GB con margen ajustado o GPUs profesionales como A6000 (48 GB). Para A100/H100 (40-80 GB) se puede usar el modelo base en safetensors con vLLM.
- ¿Cabe en GPU de consumo? Sí: las cuantizaciones Q2 a Q4 caben en GPUs de 16-24 GB (RTX 4060 Ti 16 GB, RTX 4080 16 GB, RTX 4090 24 GB). Las Q5 y Q6 requieren 24 GB o más.
- Opciones de despliegue: llama.cpp, Ollama (a partir de GGUF), LM Studio y servidores compatibles con GGUF. Para el modelo base en safetensors, vLLM (según tags).
- Latencia y throughput: no disponibles. Dependen de la GPU, la cuantización y la longitud de contexto, que no se ha publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Agentic-27B-V2-i1-GGUF (este) | ~27,3 B | no disponible | opencsg-model-and-dataset-license | GGUF (imatrix) | Especializado en agentes y código |
| opencsg/Agentic-27B-V2 (base) | ~27,3 B | no disponible | opencsg-model-and-dataset-license | safetensors | Modelo original sin cuantizar |
| Agentic-27B-V2-GGUF (estático) | ~27,3 B | no disponible | opencsg-model-and-dataset-license | GGUF (estático) | Misma base, cuantización estática; incluye mmproj si aplica |

No se dispone de información suficiente para comparar con alternativas de otros fabricantes (por ejemplo, modelos de 27B-32B de otras familias) en términos de benchmarks, ya que no se han publicado resultados para este modelo en la información disponible.

## Limitaciones y advertencias

- La model card de esta variante es la plantilla genérica de mradermacher; no incluye la model card del modelo base, por lo que faltan datos esenciales (contexto, entrenamiento, benchmarks).
- Idiomas limitados a chino e inglés según la model card del modelo base; el rendimiento en castellano no está documentado y probablemente sea inferior.
- Riesgo de alucinación inherente a los modelos de lenguaje; en tareas agénticas, una alucinación en una llamada a herramienta puede provocar acciones erróneas en sistemas reales. Se recomienda validación y sandboxing.
- Licencia "opencsg-model-and-dataset-license" marcada como "other": es imprescindible revisar el texto de la licencia en el repositorio del modelo base antes de cualquier uso comercial. No se garantiza permiso de uso comercial sin leerla.
- Las cuantizaciones de baja precisión (Q2_K, IQ2, IQ3) degradan la calidad; para uso agéntico en producción se recomienda Q4_K_M o superior.
- El tag "qwen3.8" sugiere una base Qwen, pero no está confirmado; no asumir compatibilidad con herramientas específicas de Qwen sin verificar.
- El soporte de visión no está confirmado en este repositorio i1; los ficheros mmproj, si existen, están en el repositorio estático.
- El tamaño del repositorio (218,6 GB) implica que la descarga completa es costosa; conviene descargar solo la cuantización necesaria.
- No hay información sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.

## Enlaces

- Repositorio Hugging Face (esta cuantización): https://huggingface.co/mradermacher/Agentic-27B-V2-i1-GGUF
- Modelo base: https://huggingface.co/opencsg/Agentic-27B-V2
- Cuantizaciones estáticas: https://huggingface.co/mradermacher/Agentic-27B-V2-GGUF
- Licencia del modelo base: https://huggingface.co/opencsg/Agentic-27B-V2/blob/main/OpenCSG%E6%A8%A1%E5%9E%8B%E4%B8%8E%E6%95%B0%E6%8D%AE%E9%9B%86%E8%AE%B8%E5%8F%AF%E5%8D%8F%E8%AE%AE.md
- Página de descargas del autor: https://hf.tst.eu/model#Agentic-27B-V2-i1-GGUF
- FAQ y peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
