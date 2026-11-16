# ITLL/GPT2.5.2-NSFW-Codex-0.4B-GGUF

## Resumen

GPT2.5.2-NSFW-Codex-0.4B-GGUF es una cuantizacion estatica en formato GGUF del modelo 11-47/GPT2.5.2-NSFW-Codex-0.4B, un modelo de lenguaje de aproximadamente 355 millones de parametros (354.823.168 segun los pesos en safetensors del modelo base). El modelo original fue desarrollado por el usuario 11-47 y las cuantizaciones las firma mradermacher, mientras que el repositorio que nos ocupa bajo el identificador ITLL parece ser una redistribucion del paquete GGUF. El nombre comercial sugiere un ajuste fino orientado a generacion de codigo y contenido NSFW a partir de la familia GPT-2, aunque no se dispone de documentacion tecnica oficial que lo confirme.

El modelo se presenta como una variante afinada sobre GPT-2 con datos derivados de trazas de modelos tipo Codex y de razonamiento (los datasets referenciados incluyen TeichAI/gpt-5-codex-250x, TeichAI/gpt-5.1-codex-max-1000x, TeichAI/gpt-5.1-high-reasoning-1000x, TeichAI/gpt-5.2-high-reasoning-250x, gss1147/GPT-2-to-GPT-5-5k y jjmachan/NSFW-reddit). Esto lo situa en la categoria de modelos pequenos experimentales, con foco en generacion de codigo y contenido para adultos, y sin metricas publicas de rendimiento.

Su relevancia practica es limitada pero concreta: al ser un modelo de 0,4B con cuantizaciones de 0,3 a 0,8 GB, puede ejecutarse en CPU y en GPUs de gama baja, lo que lo hace util para pruebas de concepto, generacion local de texto corto y experimentacion con ajustes finos especializados. No obstante, la ausencia de licencia declarada, de benchmarks y de model card tecnica detallada obliga a tratarlo con cautela en entornos de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2, segun nomenclatura y modelo base) |
| Parametros totales | 354.823.168 (0,35B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (GPT-2 estandar suele ser 1024 tokens, pero no confirmado en la informacion) |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |
| Tamano del repo | 3,4 GB |
| Modelo base | 11-47/GPT2.5.2-NSFW-Codex-0.4B |
| Cuantizador | mradermacher |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de la nomenclatura "GPT2.5.2" y del modelo base, que apunta a un transformer decoder-only de la familia GPT-2 con aproximadamente 355 millones de parametros. No se especifica el numero de capas, dimensiones ocultas, cabezas de atencion ni la longitud de contexto nativa. Tampoco se documenta si se aplicaron tecnicas como atencion lineal, decodificacion especulativa o variantes MoE; por el tamano y la nomenclatura, se descarta que sea un modelo de mezcla de expertos.

En cuanto al entrenamiento, la model card del GGUF solo lista los datasets utilizados en el ajuste fino del modelo base: TeichAI/gpt-5.1-codex-max-1000x, TeichAI/gpt-5.2-high-reasoning-250x, jjmachan/NSFW-reddit, gss1147/GPT-2-to-GPT-5-5k, TeichAI/gpt-5-codex-250x y TeichAI/gpt-5.1-high-reasoning-1000x. No se indica el numero de tokens, la composicion exacta del dataset, la existencia de RLHF, DPO o filtrado de seguridad, ni hiperparametros de entrenamiento. Los nombres de los datasets sugieren una mezcla de trazas de codigo y razonamiento generadas por modelos de la familia GPT-5, junto con contenido NSFW de Reddit. No hay informacion sobre la innovacion tecnica del ajuste.

## Capacidades

- Generacion de texto en ingles, con foco declarado en codigo y contenido para adultos (NSFW).
- Generacion de codigo: los datasets de ajuste incluyen trazas de modelos tipo Codex, lo que sugiere capacidad para completar y generar fragmentos de codigo, aunque no hay evaluacion publica.
- Razonamiento basico: los datasets de "high-reasoning" indican que se intento reforzar el razonamiento, si bien en un modelo de 0,4B la profundidad es muy limitada.
- Contenido NSFW: el ajuste incluye el dataset jjmachan/NSFW-reddit, por lo que el modelo esta disenado para generar contenido para adultos.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: solo ingles declarado; no se garantiza castellano ni otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prototipado local de generacion de codigo: al pesar entre 0,3 y 0,8 GB en GGUF, puede ejecutarse en un portatil sin GPU para probar completados de codigo en un editor o en un script de linea de comandos, antes de migrar a un modelo mayor.
- Experimentacion con ajuste fino especializado: sirve como banco de pruebas para estudiar como un modelo pequeno responde a datasets de codigo y razonamiento, y para comparar tecnicas de cuantizacion sin coste de infraestructura.
- Generacion de texto creativo para adultos en entornos controlados: su ajuste con NSFW-reddit lo hace adecuado para demos privadas de escritura creativa, siempre que se respeten las politicas de contenido y la legalidad aplicable.
- Educacion e investigacion sobre seguridad de modelos: util para estudiar como modelos pequenos afinados con contenido sensible se desvian o alucinan, y para disenar filtros de moderacion.
- Pruebas de pipelines GGUF: sirve para validar flujos de carga de modelos GGUF en llama.cpp, Ollama o bindings de Python, dado su reducido tamano y su disponibilidad en multiples cuantizaciones.
- Generacion de texto offline en dispositivos con recursos limitados: puede integrarse en aplicaciones de escritorio o moviles con CPU, donde un modelo de 0,4B es viable y uno de 7B no lo es, para tareas de autocompletado o respuestas cortas.
- Analisis de rendimiento de cuantizaciones: al ofrecer desde Q2_K hasta f16, permite medir el impacto de la cuantizacion en la calidad de salida en un modelo pequeno, con fines de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en Q2_K/Q3_K_S, 0,3-0,4 GB en Q4_K_M/IQ4_XS, 0,4-0,5 GB en Q5_K_M/Q6_K, 0,5 GB en Q8_0 y 0,8 GB en f16. En la practica, la VRAM necesaria es inferior a 1 GB en todos los casos.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100 o H100. El modelo no aprovecha la potencia de GPUs de datacenter por su tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, bindings de Python (llama-cpp-python), y en general cualquier runtime compatible con GGUF. El modelo base en safetensors puede cargarse con transformers.
- Latencia y throughput estimados: no disponibles. Por el tamano, se espera generacion en tiempo real en CPU moderna y muy rapida en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ITLL/GPT2.5.2-NSFW-Codex-0.4B-GGUF | 0,35B | no disponible | no disponible | GGUF | Ajuste NSFW/codigo, sin benchmarks |
| GPT-2 (OpenAI) | 0,124B / 0,355B / 0,774B | 1024 tokens | MIT (pesos originales) | safetensors, GGUF | Referencia de la familia; sin ajuste NSFW |
| Qwen2.5-Coder-0.5B | 0,49B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Especializado en codigo, con benchmarks publicos |
| SmolLM2-360M | 0,36B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Modelo pequeno generalista con evaluacion publica |

La comparativa es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no es posible establecer una comparacion cuantitativa con las alternativas. En terminos de licencia y documentacion, tanto Qwen2.5-Coder-0.5B como SmolLM2-360M ofrecen garantias que este modelo no proporciona.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; en ausencia de licencia explicita, debe asumirse que no hay autorizacion clara.
- Contenido NSFW: el ajuste incluye datos de contenido para adultos, lo que puede producir salidas inapropiadas en contextos profesionales o publicos; requiere filtros y supervision.
- Riesgo de alucinacion elevado: con 0,35B de parametros, la coherencia y la fidelidad factual son limitadas, especialmente en razonamiento multi-paso y codigo complejo.
- Solo ingles declarado: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Contexto limitado: no se documenta la ventana de contexto; si se mantiene el estandar de GPT-2 (1024 tokens), no es adecuado para conversaciones largas ni documentos extensos.
- Sesgos: al entrenarse con datos de Reddit y trazas generadas por modelos, puede heredar sesgos de esos corpus, incluyendo sesgos de genero, raza o contenido toxico.
- Sin benchmarks ni model card tecnica: no hay evidencia publica de calidad, lo que desaconseja su uso en produccion sin evaluacion propia.
- Repositorio con 0 descargas y 0 likes: indica que no ha sido validado por la comunidad; el identificador ITLL parece una redistribucion del trabajo de mradermacher y 11-47.
- Fecha de creacion futura (2026-11-16): conviene verificar la integridad y procedencia del repositorio antes de descargar.
- Etiqueta not-for-all-audiences: el contenido puede no ser apto para todas las audiencias; debe restringirse su acceso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ITLL/GPT2.5.2-NSFW-Codex-0.4B-GGUF
- Modelo base: https://huggingface.co/11-47/GPT2.5.2-NSFW-Codex-0.4B
- Repositorio de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/GPT2.5.2-NSFW-Codex-0.4B-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#GPT2.5.2-NSFW-Codex-0.4B-GGUF
- Dataset TeichAI/gpt-5.1-codex-max-1000x: https://huggingface.co/datasets/TeichAI/gpt-5.1-codex-max-1000x
- Dataset TeichAI/gpt-5.2-high-reasoning-250x: https://huggingface.co/datasets/TeichAI/gpt-5.2-high-reasoning-250x
- Dataset jjmachan/NSFW-reddit: https://huggingface.co/datasets/jjmachan/NSFW-reddit
- Dataset gss1147/GPT-2-to-GPT-5-5k: https://huggingface.co/datasets/gss1147/GPT-2-to-GPT-5-5k
- Dataset TeichAI/gpt-5-codex-250x: https://huggingface.co/datasets/TeichAI/gpt-5-codex-250x
- Dataset TeichAI/gpt-5.1-high-reasoning-1000x: https://huggingface.co/datasets/TeichAI/gpt-5.1-high-reasoning-1000x
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
