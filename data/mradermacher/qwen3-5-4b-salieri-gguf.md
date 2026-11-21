# mradermacher/Qwen3.5-4B-Salieri-GGUF

## Resumen

Qwen3.5-4B-Salieri-GGUF es la version cuantizada en formato GGUF del modelo Jitheswar/Qwen3.5-4B-Salieri, un ajuste fino del modelo base Qwen3.5 de 4B de parametros (4.326.350.848 parametros reales segun los safetensors) especializado en tareas de codigo, agentes y uso de herramientas (tool calling). La cuantizacion la ha realizado mradermacher, un conocido publicador de versiones GGUF de la comunidad, y esta pensada para ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados.

El modelo base Salieri se ha entrenado con el dataset nvidia/Open-SWE-Traces y tecnicas de DPO (Direct Preference Optimization) sobre el modelo Qwen3.5, lo que lo orienta a tareas de ingenieria de software (SWE), razonamiento multi-paso y llamadas a funciones. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de esta ficha radica en que ofrece un modelo compacto de 4B con capacidades de agente y codigo, empaquetado en multiples cuantizaciones GGUF (desde Q2_K hasta f16) para facilitar su despliegue en entornos con recursos limitados. El repositorio incluye ademas ficheros mmproj, lo que sugiere soporte multimodal en el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5); detalles especificos no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en, zh, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5 de 4B, una arquitectura transformer densa (no se indica que sea MoE). El entrenamiento del modelo base Salieri se ha realizado sobre el dataset nvidia/Open-SWE-Traces, orientado a trazas de ingenieria de software, y ha empleado DPO (Direct Preference Optimization) segun las etiquetas del repositorio. Tambien se menciona el uso de Unsloth en el proceso de entrenamiento. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases adicionales de RLHF.

La innovacion principal de esta publicacion no esta en la arquitectura, sino en el empaquetado: mradermacher ha generado cuantizaciones estaticas (no imatrix) en un rango amplio de tipos, incluyendo ficheros mmproj que apuntan a capacidades multimodales heredadas del modelo base. No se han documentado tecnicas como decodificacion especulativa o atencion lineal en la informacion disponible.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con enfasis en tareas de codigo y agentes.
- Soporte de tool calling / function calling, segun las etiquetas del repositorio.
- Capacidades de agente para tareas de ingenieria de software (SWE), incluyendo resolucion de issues y edicion de codigo.
- Razonamiento (reasoning) y modo de pensamiento, segun la etiqueta "reasoning".
- Capacidades multilingues: ingles, chino y otros idiomas (etiqueta "multilingual").
- Soporte multimodal potencial a traves de los ficheros mmproj incluidos (no confirmado en la model card).
- Conversacional (etiqueta "conversational") y compatible con endpoints.

## Casos de uso

- Asistente de codigo en IDE: el modelo puede autocompletar y generar fragmentos de codigo en ingles y chino, integrandose mediante llama.cpp en extensiones de editor; su tamano de 4B permite ejecucion local en portatiles con GPU de consumo.
- Agente de resolucion de issues (SWE): entrenado con Open-SWE-Traces, puede recibir un issue y proponer un parche, usando tool calling para leer ficheros y ejecutar pruebas en un pipeline de CI/CD.
- Automatizacion de tareas de refactorizacion: con capacidad de razonamiento multi-paso, puede planificar y aplicar cambios en varios ficheros, adecuado para integracion en herramientas de desarrollo.
- Chat de soporte tecnico multilingue: soporta ingles y chino, lo que permite atender a usuarios en ambos idiomas con un unico modelo desplegado en Ollama o llama.cpp.
- Prototipado de agentes con function calling: al ser compatible con endpoints y soportar tool calling, sirve para construir asistentes que consulten APIs externas en entornos de desarrollo con recursos limitados.
- Inferencia en el borde (edge): las cuantizaciones Q4_K_S y Q4_K_M (2,7-2,9 GB) permiten desplegar el modelo en dispositivos con 8 GB de RAM o VRAM, ideal para demos y pruebas offline.
- Generacion de documentacion tecnica: el modelo puede redactar documentacion a partir de codigo, aprovechando su entrenamiento en trazas de ingenieria de software.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,1 GB (Q2_K) y 8,8 GB (f16); las cuantizaciones recomendadas Q4_K_S y Q4_K_M ocupan 2,7-2,9 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 6-8 GB de VRAM (GTX 1660, RTX 3050, RTX 4060) usando Q4_K_M o Q5_K_M.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui; tambien es compatible con endpoints (etiqueta "endpoints_compatible").
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-Salieri-GGUF (este) | 4,33B | no disponible | Apache 2.0 | GGUF | Ajuste fino para SWE y tool calling |
| Qwen3.5-4B (base) | ~4B | no disponible | Apache 2.0 | safetensors | Modelo base sin ajuste especifico |
| Otros modelos de 4B para codigo | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de informacion sobre benchmarks ni de modelos comparables concretos en la documentacion facilitada; la comparativa se limita a la relacion con el modelo base.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos; al ser un ajuste fino sobre Qwen3.5, puede heredar sesgos del modelo base y del dataset Open-SWE-Traces.
- Riesgo de alucinacion en generacion de codigo y en llamadas a herramientas; se recomienda validacion en produccion.
- La longitud de contexto no esta documentada, lo que limita la planificacion de cargas con ventanas largas.
- El soporte de idiomas se limita principalmente a ingles y chino; el rendimiento en castellano no esta garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el dataset pueden tener sus propias condiciones; conviene revisar las licencias de Jitheswar/Qwen3.5-4B-Salieri y de nvidia/Open-SWE-Traces.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente el rendimiento en tareas de razonamiento y codigo.
- Los ficheros mmproj sugieren capacidades multimodales, pero no se confirma su funcionamiento ni calidad en la model card.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.5-4B-Salieri-GGUF
- Modelo base: https://huggingface.co/Jitheswar/Qwen3.5-4B-Salieri
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-Salieri-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-Salieri-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Open-SWE-Traces
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
