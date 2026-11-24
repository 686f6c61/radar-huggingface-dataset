# mradermacher/Kataguru-Polyglot-264E-35B-A3B-i1-GGUF

## Resumen

Kataguru-Polyglot-264E-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por kataguru, orientado a tareas multilingues, traduccion, generacion de codigo, tool calling y razonamiento agentico. La version aqui descrita es una cuantizacion GGUF realizada por mradermacher mediante el metodo imatrix, que permite ejecutar el modelo en hardware de consumo con perdida controlada de calidad. El modelo base cuenta con 36.537.721.984 parametros totales (aproximadamente 36,5 mil millones) y sigue la arquitectura qwen3_5_moe, segun las etiquetas de la model card.

El modelo destaca por su enfoque en lenguas aglutinantes y de bajos recursos (finlandes, estonio, hungaro, lituano, letón, islandes, euskera, georgiano, gales y turco), ademas del ingles, lo que lo posiciona como una alternativa especializada frente a modelos multilingues generalistas. Incorpora capacidades multimodales (vision), razonamiento STEM y matematicas, y esta etiquetado como "uncensored", lo que implica ausencia de filtros de rechazo en las respuestas.

La relevancia actual de esta ficha radica en que la cuantizacion imatrix permite desplegar un MoE de 36,5B en GPUs de consumo con cuantizaciones de 4 bits (aproximadamente 22 GB), manteniendo un equilibrio razonable entre calidad y requisitos de memoria, algo critico para investigadores que necesitan evaluar modelos multilingues sin acceso a clusters de gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE), familia qwen3_5_moe, transformer |
| Parametros totales | 36.537.721.984 (aproximadamente 36,5B) |
| Parametros activos | no disponible (la nomenclatura "A3B" sugiere aproximadamente 3B activos, pero no se confirma en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ3_S, i1-IQ3_M, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix); estaticas disponibles en repositorio separado |
| Idiomas soportados | en, fi, et, hu, lt, lv, is, eu, ka, cy, tr |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors y bfloat16 en el modelo base |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura de mezcla de expertos (MoE) de la familia qwen3_5_moe, con 36,5 mil millones de parametros totales. La nomenclatura "264E-35B-A3B" sugiere 264 expertos, 35B de parametros totales y aproximadamente 3B de parametros activos por token, aunque estos detalles no se confirman explicitamente en la informacion proporcionada. La model card incluye etiquetas que indican soporte multimodal (vision) y un modo de razonamiento, asi como entrenamiento orientado a tool calling y agentes.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o decodificacion especulativa. La cuantizacion aqui presentada es de tipo imatrix (importance matrix), generada por mradermacher con la version 2 del proceso de cuantizacion y con el tensor de salida cuantizado, lo que mejora la calidad respecto a cuantizaciones estaticas equivalentes en tamano.

## Capacidades

- Generacion de texto conversacional multi-turno en once idiomas (ingles, finlandes, estonio, hungaro, lituano, letón, islandes, euskera, georgiano, gales y turco).
- Traduccion y traduccion cruzada entre lenguas aglutinantes y de bajos recursos.
- Generacion y asistencia en codigo (etiquetas "code", "coder", "coding").
- Tool calling y function calling para integracion en pipelines externos.
- Razonamiento agentico multi-paso (etiqueta "agentic").
- Recuperacion aumentada (RAG) y RAG translingue (etiquetas "rag", "cross-lingual-rag").
- Capacidades multimodales de vision (etiqueta "multimodal", "vision"; los ficheros mmproj, si existen, se alojan en el repositorio estatico).
- Razonamiento STEM y matematicas (etiquetas "stem", "math", "reasoning").
- Modelo sin censura ("uncensored"), sin filtros de rechazo declarados.

## Casos de uso

- Traduccion profesional entre lenguas nordicas y balticas: el modelo cubre finlandes, estonio, hungaro, lituano, letón e islandes, lo que permite construir servicios de traduccion para administraciones publicas o medios regionales sin depender de APIs propietarias.
- Atencion al cliente multilingue en la UE: con soporte para once idiomas y capacidad conversacional multi-turno, puede desplegarse como backend de chatbots para mercados nordicos y balticos.
- Generacion de codigo en produccion: las etiquetas de tool calling y function calling permiten integrarlo en pipelines de CI/CD o asistentes de IDE que invocan herramientas externas (linters, compiladores, APIs).
- RAG translingue: un mismo corpus en finlandes puede consultarse en georgiano o euskera gracias a las capacidades de recuperacion cruzada, util en entornos academicos y bibliotecarios.
- Agentes automatizados de investigacion: el modo agentico y el razonamiento multi-paso permiten orquestar tareas de busqueda, sintesis y verificacion sobre fuentes documentales.
- Analisis de documentos con vision: al ser un modelo multimodal, puede procesar imagenes o capturas junto a texto, por ejemplo para extraer informacion de formularios escaneados en idiomas minoritarios.
- Evaluacion de sesgos y robustez linguistica: al estar etiquetado como "uncensored", sirve como caso de estudio para investigadores que analizan el comportamiento de modelos sin alineamiento restrictivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: i1-Q2_K ~13,7 GB; i1-IQ3_S ~16,2 GB; i1-Q4_K_M ~22,4 GB; i1-Q5_K_M ~26,2 GB; i1-Q6_K ~30,2 GB (tamanos de fichero; la VRAM necesaria es ligeramente superior por el contexto y el overhead de llama.cpp).
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K se recomienda una A100 40 GB, H100 o dos GPUs de 24 GB.
- Cabe en GPU de consumo: si, en cuantizaciones de 2 a 4 bits (Q2_K a Q4_K_M) cabe en GPUs de 16-24 GB como RTX 4080, 4090, 3090 o 4060 Ti de 16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con la API de endpoints (etiqueta "endpoints_compatible"); vLLM y TGI no estan confirmados para este formato GGUF.
- Latencia y throughput: no disponibles. Al ser un MoE con aproximadamente 3B de parametros activos (segun nomenclatura), se espera un throughput superior al de un modelo denso de 36B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Kataguru-Polyglot-264E-35B-A3B (este) | 36,5B totales, ~3B activos (segun nomenclatura) | no disponible | apache-2.0 | GGUF, safetensors | Enfoque multilingue en lenguas aglutinantes, vision, tool calling |
| Qwen3-MoE (familia base) | variable | no disponible | apache-2.0 (segun familia) | safetensors, GGUF | Arquitectura de referencia; el modelo aqui descrito deriva de qwen3_5_moe |
| Mixtral 8x7B | 46,7B totales, 12,9B activos | 32k (segun version) | apache-2.0 | safetensors, GGUF | MoE generalista, sin enfoque en lenguas minoritarias |
| Llama 3.1 8B | 8B densos | 128k | Llama 3.1 Community License | safetensors, GGUF | Menor tamano, sin capacidades multimodales ni cobertura de lenguas balticas/nordicas |

La comparacion con modelos de la misma categoria es limitada porque no se dispone de datos de rendimiento del modelo. La principal ventaja diferencial es la cobertura de once idiomas, incluyendo lenguas de bajos recursos, junto con vision y tool calling en un unico checkpoint.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos; al cubrir lenguas de bajos recursos, es probable que el rendimiento sea desigual entre idiomas.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la tasa de errores facticos.
- La etiqueta "uncensored" implica ausencia de filtros de rechazo, lo que supone un riesgo para despliegues en produccion sin capas de moderacion adicionales.
- Longitud de contexto no confirmada: no se puede garantizar el soporte de ventanas largas sin verificacion empirica.
- La licencia apache-2.0 permite uso comercial, pero el modelo base podria tener condiciones adicionales no reflejadas en la cuantizacion; conviene revisar el repositorio original.
- El repositorio GGUF pesa 287,4 GB en total (suma de todas las cuantizaciones); descargar solo el fichero necesario.
- Los ficheros mmproj para vision, si existen, estan en el repositorio estatico separado, no en este.
- No hay garantia de que vLLM o TGI soporten este GGUF; el despliegue recomendado es llama.cpp u Ollama.

## Enlaces

- Repositorio Hugging Face (cuantizacion imatrix): https://huggingface.co/mradermacher/Kataguru-Polyglot-264E-35B-A3B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Kataguru-Polyglot-264E-35B-A3B-GGUF
- Modelo base: https://huggingface.co/kataguru/Kataguru-Polyglot-264E-35B-A3B
- Pagina de descargas del autor: https://hf.tst.eu/model#Kataguru-Polyglot-264E-35B-A3B-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Empresa del cuantizador: https://www.nethype.de/
