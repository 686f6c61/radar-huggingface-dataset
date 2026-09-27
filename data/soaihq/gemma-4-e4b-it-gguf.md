# SoAIHQ/gemma-4-E4B-it-GGUF

## Resumen
SoAIHQ/gemma-4-E4B-it-GGUF es una compilacion en formato GGUF del modelo google/gemma-4-E4B-it, publicada por SoAI (SoAIHQ) para su uso con llama.cpp y su propia plataforma. Se trata de un modelo multimodal any-to-any que acepta entrada de texto, imagen y audio, con una ventana de contexto de 131.072 tokens (128K) y un modo de razonamiento ("thinking") configurable por peticion. Su base es un transformer denso con embeddings por capa (per-layer embeddings), una tecnica que separa las representaciones de entrada del resto de la red para abaratar el coste de memoria y computo.

El modelo esta disenado para hardware de consumo: la cuantizacion Q4_K_M ocupa 5,3 GB y la Q8_0 8,0 GB, frente a los aproximadamente 15 GB que ocuparian los pesos originales en FP16. Incluye soporte de tool calling y agentes, y se distribuye bajo licencia Apache 2.0 enlazada a la licencia oficial de Gemma 4 de Google.

Su relevancia radica en que traslada un modelo multimodal de la familia Gemma 4 al ecosistema de inferencia local (llama.cpp, servidores OpenAI-compatibles) con cuantizaciones calibradas mediante imatrix sobre un corpus propio de chat, codigo y llamadas a herramientas, en lugar de texto web generico. La ficha de HuggingFace registra 0 descargas y 1 "like" en el momento de la consulta, por lo que su validacion por parte de la comunidad es todavia muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con embeddings por capa (per-layer embeddings) |
| Parametros totales | 7.518.069.290 (7,52 B) segun safetensors; el autor indica 4,5 B efectivos (8 B con embeddings) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 131.072 tokens (128K) |
| Tipos de cuantizacion | Q4_K_M (con imatrix), Q8_0; proyector multimodal mmproj en F16 |
| Idiomas soportados | 35+ idiomas (preentrenado en mas de 140) |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp); proyector mmproj F16 para imagen y audio |

## Arquitectura y entrenamiento
La ficha describe la arquitectura como densa con embeddings por capa, con 4,5 B de parametros efectivos y 8 B contando los embeddings, aunque el safetensors del modelo base declara 7.518.069.290 parametros totales. El modelo acepta tres modalidades de entrada (texto, imagen y audio) y expone un modo de razonamiento conmutable por peticion, lo que sugiere una fase de ajuste instruccional ("it") sobre el modelo base google/gemma-4-E4B-it. No se detallan en la informacion suministrada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO; esos datos corresponden a la model card original de Google, no incluida aqui.

El trabajo de SoAI se centra en la cuantizacion, no en el entrenamiento. La variante Q4_K_M se genero con una matriz de importancia (imatrix) calculada sobre un corpus de calibracion propio: conversaciones multiturno en 21 idiomas, ediciones de codigo en 22 lenguajes de programacion, llamadas a herramientas y sus resultados, matematicas paso a paso y prosa web. Cada conversacion se formatea con la plantilla de chat nativa del modelo, incluida su sintaxis de tool-call. La variante Q8_0 no usa imatrix porque el formato Q8_0 de llama.cpp no lo admite. Antes de cuantizar, el proceso verifica que los marcadores de chat, thinking y tool-call se almacenen como tokens especiales y que la plantilla embebida coincida con la original.

## Capacidades
- Generacion de texto conversacional en modo multiturno.
- Entrada de imagenes (vision) mediante el proyector mmproj-gemma-4-E4B-it-f16.gguf.
- Entrada de audio (speech) con el mismo complemento mmproj.
- Razonamiento configurable ("thinking mode"), activable o desactivable por peticion con chat_template_kwargs: {"enable_thinking": true}.
- Tool calling / function calling con sintaxis nativa de llamadas a herramientas.
- Soporte para flujos de agente y razonamiento en varios pasos.
- Capacidades multilingues: 35+ idiomas en inferencia, preentrenado en mas de 140.
- Contexto largo de hasta 131.072 tokens, adecuado para documentos extensos y conversaciones largas.
- Servidor compatible con la API de OpenAI (endpoint /v1/chat/completions) a traves de llama-server.

## Casos de uso
- Atencion al cliente automatizada: gestiona conversaciones multiturno con hasta 128K tokens de contexto, lo que permite arrastrar historiales largos y documentacion de producto sin truncar, y expone una API compatible con OpenAI para integrarse en backends existentes.
- Asistente multimodal de escritorio: al aceptar imagen y audio ademas de texto, puede transcribir y resumir notas de voz y describir capturas dentro de una misma conversacion, ejecutandose en local con llama.cpp.
- Generacion y edicion de codigo: la calibracion del imatrix incluye ediciones en 22 lenguajes de programacion, por lo que se puede usar en asistentes de IDE y pipelines de CI/CD apoyados en tool calling para leer ficheros, ejecutar tests y aplicar parches.
- Agentes con herramientas: su soporte nativo de tool-call permite encadenar busquedas, consultas a bases de datos y operaciones en APIs externas mediante razonamiento multi-paso.
- Analisis de documentos largos: la ventana de 128K posibilita resumir, extraer y responder preguntas sobre contratos, informes o articulos que superan el contexto de modelos de 8K-32K.
- Asistente de razonamiento guiado: el modo thinking configurable permite activar cadenas de razonamiento en tareas de matematicas paso a paso y desactivarlas en respuestas rapidas para ahorrar latencia y tokens.
- Procesamiento de audio y voz: transcripcion, resumen o clasificacion de contenido hablado combinando la entrada de audio con texto.
- Despliegue en hardware modesto: con Q4_K_M cabe en equipos de 8-12 GB de VRAM o incluso CPU, lo que habilita prototipos y demos sin GPU de datacenter.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye cifras de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones cuantitativas frente a otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia (a partir del tamano de los ficheros publicados): Q4_K_M 5,3 GB solo de pesos, mas memoria para el contexto, que crece con la longitud configurada; Q8_0 8,0 GB de pesos; el proyector multimodal mmproj F16 anade 990,4 MB si se usan imagen o audio.
- GPU recomendadas: las cuantizaciones caben en tarjetas de consumo. Q4_K_M es adecuada para GPUs de 8 GB (por ejemplo RTX 3060 Ti, RTX 4060) con contexto moderado; Q8_0 encaja mejor en GPUs de 12-16 GB o superiores (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090). Para contexto de 128K completo se necesita margen adicional de memoria.
- Cabe en GPU de consumo: si, con Q4_K_M en tarjetas de 8 GB o mas; Q8_0 requiere 12 GB o mas para dejar sitio al contexto.
- Ejecucion en CPU: soportada por llama.cpp, que puede repartir capas entre CPU y GPU.
- Opciones de despliegue: llama.cpp y llama-server (con interfaz de chat y API compatible con OpenAI), SoAI, y cualquier runtime que consuma GGUF. La model card indica compatibilidad con llama.cpp v0.5.0 y la etiqueta endpoints_compatible.
- Carga multimodal: requiere el fichero mmproj-gemma-4-E4B-it-f16.gguf y el flag --mmproj; llama-server -hf lo descarga automaticamente.
- Ajustes de muestreo recomendados por el autor: temperature 1.0, top_p 0.95, top_k 64, identicos para todas las tareas con thinking activado o desactivado.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Version | Tamano | Precision | Licencia | Uso recomendado |
|---|---|---|---|---|
| SoAIHQ gemma-4-E4B-it-GGUF Q4_K_M | 5,3 GB | Alta, calibrada con imatrix | Apache 2.0 | La mayoria de maquinas; mejor relacion calidad/tamano |
| SoAIHQ gemma-4-E4B-it-GGUF Q8_0 | 8,0 GB | Casi sin perdida | Apache 2.0 | Cuando la memoria lo permite y se busca maxima fidelidad |
| google/gemma-4-E4B-it (pesos originales) | Aproximadamente 15 GB en FP16 (estimado a partir de 7,52 B parametros) | 16-bit | Licencia de Gemma 4 | Referencia de calidad y fine-tuning |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos de otras familias del mismo tamano, por lo que no es posible establecer una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias
- Validacion comunitaria muy baja: 0 descargas y 1 "like" registrados, por lo que no hay evidencia de uso en produccion.
- La licencia declarada es Apache 2.0, pero el enlace de licencia apunta a la licencia oficial de Gemma 4 de Google; conviene verificar los terminos reales aplicables antes de un uso comercial, ya que la familia Gemma suele tener condiciones propias.
- Perdida de calidad por cuantizacion: Q4_K_M, aunque calibrada con imatrix, reduce la precision respecto a los pesos originales en FP16. El propio autor advierte que no publica cuantizaciones por debajo de 4 bits por la perdida de calidad.
- El rendimiento multimodal depende de cargar el fichero mmproj; sin el, el modelo no procesa imagen ni audio.
- Memoria de contexto: aunque la ventana es de 128K tokens, la memoria necesaria crece con la longitud de contexto configurada y puede exceder la VRAM disponible en GPUs de gama baja.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se han publicado evaluaciones de fiabilidad para esta cuantizacion.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.
- Idiomas: aunque se declaran 35+ idiomas, no se detalla el rendimiento por idioma ni se garantiza paridad entre ellos.
- Compatibilidad: pensado para llama.cpp v0.5.0 y runtimes GGUF; otros frameworks requieren conversion.
- Fecha de publicacion futura (2026) en los metadatos de HuggingFace, dato a tener en cuenta al interpretar la ficha.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Sitio de SoAI: https://soai.to
- Archivos directos: Q4_K_M (https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q4_K_M.gguf), Q8_0 (https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF/resolve/main/gemma-4-E4B-it-Q8_0.gguf), mmproj F16 (https://huggingface.co/SoAIHQ/gemma-4-E4B-it-GGUF/resolve/main/mmproj-gemma-4-E4B-it-f16.gguf)
