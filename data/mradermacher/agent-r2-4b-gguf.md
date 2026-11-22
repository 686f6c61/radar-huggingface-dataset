# mradermacher/Agent-R2-4B-GGUF

## Resumen

Agent-R2-4B es un modelo de lenguaje de 4.411 millones de parametros (aproximadamente 4,4 mil millones) desarrollado originalmente por teng-pan y distribuido en formato GGUF por mradermacher. Se presenta como un modelo especializado en tareas de agente, productividad y razonamiento de horizonte largo ("long-horizon"), entrenado mediante aprendizaje por refuerzo basado en rubricas ("rubric-based RL"). La arquitectura subyacente se etiqueta como Qwen3, lo que lo situa en la familia de transformadores densos de Alibaba, aunque la model card no detalla la configuracion exacta de capas ni la longitud de contexto.

La relevancia de esta publicacion radica en su formato: mradermacher ofrece una bateria completa de cuantizaciones GGUF estaticas (desde Q2_K hasta f16, pasando por IQ4_XS, Q4_K_M, Q5_K_M y Q8_0) que permiten ejecutar el modelo en hardware de consumo. El repositorio ocupa 39,7 GB e incluye todos los ficheros cuantizados, lo que facilita el despliegue local con llama.cpp u Ollama sin necesidad de convertir pesos.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, lo que resulta atractivo para integrar el modelo en productos. Sin embargo, la informacion publica es escasa: no se documentan resultados de benchmarks, composicion del dataset de entrenamiento ni longitud de contexto, por lo que esta ficha se limita a lo verificable en los metadatos y la model card del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiquetado Qwen3 en la model card) |
| Parametros totales | 4.411.424.256 (4,4 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (estaticas); variantes imatrix en repo i1-GGUF |
| Idiomas soportados | Ingles (segun model card; no se detallan otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base original en safetensors |

## Arquitectura y entrenamiento

La model card identifica el modelo base como teng-pan/Agent-R2-4B y lo etiqueta con "qwen3", lo que sugiere que deriva de la familia Qwen3 de Alibaba, aunque no se especifica la variante exacta ni la configuracion de capas, dimensiones ocultas o cabezas de atencion. El tamano de 4,4 mil millones de parametros lo situa en la gama media-baja de la familia. No se documenta si emplea atencion lineal, decodificacion especulativa u otras innovaciones arquitectonicas.

En cuanto al entrenamiento, las etiquetas "rubric-based-rl" y "long-horizon" indican que se aplico aprendizaje por refuerzo guiado por rubricas para tareas de agente de horizonte largo, probablemente para mejorar la planificacion multi-paso y la coherencia en secuencias de acciones. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de SFT, RLHF o DPO. Tampoco se especifica el proceso de cuantizacion mas alla de que mradermacher genero cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1, convert_type hf).

## Capacidades

- Generacion de texto conversacional en ingles.
- Orientacion a tareas de agente: la model card etiqueta el modelo como "agent", "productivity" y "long-horizon", lo que sugiere capacidad para planificacion multi-paso y ejecucion de secuencias de acciones.
- Razonamiento guiado por rubricas: el entrenamiento con "rubric-based-rl" apunta a evaluacion y refinamiento de respuestas segun criterios explicitos.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque es coherente con el perfil de agente.
- Capacidades multilingues: solo se declara ingles; no hay evidencia de soporte de otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de flujos de productividad: el modelo puede encadenar pasos para completar tareas administrativas o de gestion (resumir correos, generar listas de acciones, redactar respuestas) gracias a su orientacion a "productivity" y "long-horizon".
- Agentes de navegacion y ejecucion de tareas multi-paso: con 4,4 B de parametros y cuantizacion Q4_K_M (2,8 GB), puede desplegarse en un portatil para orquestar herramientas locales en pipelines de automatizacion.
- Evaluacion y refinamiento de respuestas: el entrenamiento con rubricas permite usarlo como evaluador o generador iterativo en bucles de mejora de calidad de texto.
- Prototipado rapido de asistentes conversacionales: al estar en GGUF, se integra en llama.cpp u Ollama para demos locales sin GPU dedicada.
- Generacion de codigo asistida en entornos con recursos limitados: aunque no se documenta rendimiento en codigo, el perfil Qwen3 sugiere competencia basica; util para autocompletado en IDE con cuantizacion Q4_K_S.
- Educacion y tutoria automatizada: conversaciones multi-turno en ingles con contexto moderado, ejecutables en hardware de consumo para despliegues educativos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,0 GB con Q2_K, 2,8 GB con Q4_K_M, 3,7 GB con Q6_K y 4,8 GB con Q8_0 (mas overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para cuantizaciones Q4/Q5 (RTX 3060, RTX 4060, RTX 2070); para Q8_0 o f16 se recomienda RTX 4070 o superior (8-12 GB).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 6 GB o mas para cuantizaciones Q4_K_M y Q5_K_M; tambien en CPU via llama.cpp con Q4_K_S (2,7 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero no se confirma compatibilidad nativa.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Agent-R2-4B (este) | 4,4 B | No disponible | Apache 2.0 | GGUF, safetensors | Especializado en agente y long-horizon via rubric-based RL |
| Qwen3-4B (familia base) | ~4 B | No disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista de la misma familia; sin especializacion en agentes |
| Llama 3.2 3B | 3,2 B | 128 K | Llama 3.2 Community License | safetensors, GGUF | Alternativa generalista de tamano similar con contexto documentado |
| Phi-3.5-mini | 3,8 B | 128 K | MIT | safetensors, GGUF | Modelo pequeno con buen rendimiento en razonamiento y codigo |

La comparacion directa con alternativas se ve limitada por la ausencia de benchmarks publicados para Agent-R2-4B. Frente a Qwen3-4B, la diferencia principal es la especializacion en tareas de agente mediante RL con rubricas; frente a Llama 3.2 3B y Phi-3.5-mini, la ventaja es la licencia Apache 2.0 sin restricciones adicionales y la disponibilidad inmediata de cuantizaciones GGUF, aunque ambos competidores documentan contexto de 128 K que este modelo no declara.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos en ingles, puede heredar sesgos culturales y linguisticos de ese corpus.
- Riesgo de alucinacion: no cuantificado; como modelo de 4,4 B, la tasa de alucinacion en tareas factuales puede ser superior a la de modelos mayores.
- Limitaciones de contexto o idioma: solo se declara ingles; la longitud de contexto no esta especificada, lo que impide garantizar conversaciones multi-turno largas o procesamiento de documentos extensos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se identifican restricciones adicionales en la informacion disponible.
- Caveats para produccion: la ausencia de benchmarks y de documentacion sobre el entrenamiento (datos, tokens, proceso de RL) dificulta evaluar su calidad frente a alternativas; se recomienda validacion empirica antes de desplegarlo en entornos criticos. El repositorio ocupa 39,7 GB por incluir todas las cuantizaciones, lo que requiere planificar el almacenamiento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Agent-R2-4B-GGUF
- Modelo base: https://huggingface.co/teng-pan/Agent-R2-4B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Agent-R2-4B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Agent-R2-4B-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
