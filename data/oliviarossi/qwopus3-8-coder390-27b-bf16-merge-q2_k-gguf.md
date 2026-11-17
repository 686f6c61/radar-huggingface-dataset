# OliviaRossi/Qwopus3.8-Coder390-27B-BF16-Merge-Q2_K-GGUF

## Resumen

Qwopus3.8-Coder390-27B-BF16-Merge-Q2_K-GGUF es una cuantización en formato GGUF (Q2_K) del modelo fusionado OliviaRossi/Qwopus3.8-Coder390-27B-BF16-Merge, publicado por el usuario OliviaRossi en Hugging Face. Se trata de un merge de modelos (técnica SLERP, según las etiquetas del repositorio) orientado a generación de código y con pipeline declarado `image-text-to-text`, lo que indica capacidades multimodales de entrada imagen-texto. El modelo base fusionado tiene 26.895.998.464 parámetros (~26,9 mil millones) y esta versión cuantizada ocupa 10,7 GB en el repositorio.

La relevancia de esta ficha es doble: por un lado, documenta una variante cuantizada pensada para ejecución local con llama.cpp en hardware con recursos limitados; por otro, advierte de que se trata de un artefacto derivado de un merge comunitario del que no se publican detalles de entrenamiento, datos, benchmarks ni idiomas soportados. Las etiquetas apuntan a linajes Qwen (qwen3_5, qwen3.8), pero no hay documentación técnica verificable que confirme la composición exacta del merge.

La licencia declarada es Apache 2.0, lo que en principio permite uso comercial, aunque al ser un merge de modelos de terceros conviene verificar las licencias de los modelos originarios antes de desplegarlo en producción. El modelo tiene 0 descargas y 2 likes en el momento de la consulta, lo que sugiere un artefacto reciente y de baja validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de linaje Qwen, segun etiquetas); detalles no disponibles |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 2048`, pero no constituye una especificacion oficial) |
| Tipos de cuantizacion | Q2_K (esta variante); el modelo base esta en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variante Q2_K); el modelo base en safetensors/BF16 |
| Pipeline | image-text-to-text (multimodal) |
| Tamano del repo | 10,7 GB |
| Fecha de creacion | 2026-11-17 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo base. Las etiquetas del repositorio indican que se trata de un merge realizado mediante SLERP (spherical linear interpolation) a partir de modelos de la familia Qwen (etiquetas `qwen3_5` y `qwen3.8`), con enfasis declarado en coding y capacidades multimodales. El pipeline `image-text-to-text` sugiere la presencia de un codificador visual, pero no se documenta su naturaleza, resolucion de entrada ni numero de tokens de imagen.

Tampoco se publican datos sobre el corpus de entrenamiento, numero de tokens, composicion del dataset, ni sobre si hubo fases de RLHF, DPO o ajuste supervisado. Al tratarse de un merge, el "entrenamiento" consiste en la interpolacion de pesos de modelos preexistentes, no en un entrenamiento desde cero. Esta variante Q2_K ha sido generada con llama.cpp mediante el espacio GGUF-my-repo de ggml.ai, un proceso de conversion y cuantizacion sin reentrenamiento. No se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Generacion y asistencia en codigo, segun la denominacion "Coder" y la etiqueta `coding`.
- Procesamiento multimodal de entrada imagen-texto (pipeline `image-text-to-text`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere uso via API de inferencia.
- Ejecucion local mediante llama.cpp (CLI y servidor).
- Capacidades de razonamiento y matematicas: no documentadas explicitamente.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Cobertura multilingue: no disponible.
- Modos especiales (thinking mode, audio): no documentados.

## Casos de uso

- Asistencia de codigo en local: el modelo puede ejecutarse con llama.cpp en estaciones de trabajo sin GPU de datacenter, gracias a la cuantizacion Q2_K que reduce el peso a ~10,7 GB, permitiendo autocompletado y explicacion de fragmentos de codigo en entornos con VRAM limitada.
- Prototipado rapido de aplicaciones multimodales: al declarar pipeline `image-text-to-text`, permite experimentar con descripcion de imagenes o preguntas sobre capturas de pantalla en un portatil, sin depender de APIs externas.
- Despliegue en entornos air-gapped: al ser un GGUF ejecutable con llama-server, puede servirse en redes aisladas donde no se permite el acceso a servicios en la nube, siempre que se validen previamente sus respuestas.
- Evaluacion comparativa de merges comunitarios: util para investigadores que quieran medir el impacto de la cuantizacion Q2_K frente al BF16 original en tareas de codigo, aunque requerira construir su propio conjunto de evaluacion al no haber benchmarks publicados.
- Chatbot interno de soporte tecnico: la etiqueta `conversational` y su ventana de contexto (no confirmada) permiten mantener dialogos multi-turno; conviene limitar el alcance a dominios acotados por el riesgo de alucinacion.
- Generacion de documentacion tecnica a partir de capturas o diagramas: el caracter multimodal permitiria transcribir y comentar imagenes de arquitectura o interfaces, integrandolo en pipelines de documentacion internos.
- Experimentacion docente: su tamano cuantizado (~10,7 GB) lo hace accesible para cursos que ensenen inferencia local con llama.cpp en GPUs de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion Q2_K ocupa aproximadamente 10,7 GB en disco; en memoria se requieren en torno a 11-13 GB incluyendo overhead de contexto y buffers de llama.cpp (estimacion, no dato oficial).
- GPU recomendadas: no disponibles de forma oficial. Por capacidad de VRAM, encajaria en RTX 4090 (24 GB), RTX 3090 (24 GB), A100 40 GB, H100 80 GB y, con margen ajustado, en GPUs de 16 GB solo con contextos muy reducidos.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM para contextos cortos; en 12 GB requeriria descarga parcial a CPU (offloading).
- Opciones de despliegue: llama.cpp (llama-cli y llama-server, documentados en la model card), y por compatibilidad de formato GGUF, teoricamente Ollama u otros runners GGUF, aunque no se documenta soporte explicito. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles. La model card solo muestra un ejemplo con `-c 2048` de contexto, sin cifras de rendimiento.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificables del modelo base que permitan una comparacion rigurosa con alternativas. Se indica a continuacion una comparacion estructural basica, marcando los campos no disponibles.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-Coder390-27B-BF16-Merge-Q2_K-GGUF | ~26,9 B | no disponible | Apache 2.0 | GGUF Q2_K | Merge SLERP comunitario, multimodal declarado, sin benchmarks |
| Modelo base BF16 (OliviaRossi/Qwopus3.8-Coder390-27B-BF16-Merge) | ~26,9 B | no disponible | Apache 2.0 | safetensors/BF16 | Misma arquitectura, mayor precision, mayor requisito de VRAM |
| Alternativas de ~27 B con licencia permisiva | no disponible | no disponible | no disponible | no disponible | No se han identificado en la informacion proporcionada modelos comparables verificables |

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, por lo que el rendimiento real es desconocido.
- Merge sin documentacion: no se detalla la composicion del SLERP ni los modelos de origen exactos, lo que dificulta auditar sesgos o comportamientos heredados.
- Cuantizacion agresiva: Q2_K es una de las cuantizaciones mas bajas de la escala; suele producir degradacion notable en coherencia, codigo y tareas de razonamiento frente a Q4_K_M o Q5_K_M.
- Riesgo de alucinacion: sin evaluaciones publicadas ni fases de alineacion documentadas, la fiabilidad factual no esta garantizada.
- Idiomas no declarados: no se confirma soporte de castellano ni de otros idiomas; el rendimiento multilingue es desconocido.
- Contexto no especificado: la unica referencia es `-c 2048` en el ejemplo de la model card, insuficiente para confirmar la ventana real del modelo.
- Licencia Apache 2.0 declarada, pero al ser un merge de modelos de terceros conviene verificar las licencias de los modelos originarios (linaje Qwen) antes de uso comercial.
- Validacion comunitaria practicamente nula: 0 descargas y 2 likes en el momento de la consulta; no se recomienda su uso en produccion sin evaluacion propia.
- Capacidades multimodales declaradas pero no verificadas: no se documenta el codificador visual ni el formato de imagen aceptado.

## Enlaces

- Repositorio Hugging Face (esta variante GGUF): https://huggingface.co/OliviaRossi/Qwopus3.8-Coder390-27B-BF16-Merge-Q2_K-GGUF
- Modelo base BF16: https://huggingface.co/OliviaRossi/Qwopus3.8-Coder390-27B-BF16-Merge
- Espacio GGUF-my-repo de ggml.ai: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
