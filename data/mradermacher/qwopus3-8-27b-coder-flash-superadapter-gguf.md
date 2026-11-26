# mradermacher/Qwopus3.8-27B-Coder-Flash-SuperAdapter-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash-SuperAdapter es un modelo de lenguaje de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) orientado a programacion agentica, distribuido en formato GGUF por el cuantizador mradermacher. El modelo original, OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter, es el resultado de una fusion de adaptadores LoRA sobre una base etiquetada como qwen3.5/qwen3.8, segun los tags del repositorio. Esta publicacion concreta no es un modelo nuevo, sino la version cuantizada estaticamente del modelo original para su uso con llama.cpp y derivados.

La relevancia de esta ficha radica en que ofrece el modelo en un rango de cuantizaciones que va desde Q2_K (11,3 GB) hasta Q8_0 (29,1 GB), lo que permite desplegarlo en hardware de consumo con perdidas controladas de calidad. Incluye ademas dos ficheros mmproj (Q8_0 y f16), lo que indica soporte multimodal de vision en el modelo base.

No se dispone de informacion publicada sobre arquitectura interna detallada, longitud de contexto, composicion del dataset de entrenamiento ni resultados de benchmarks. La model card del cuantizador es puramente operativa (lista de ficheros y notas de uso) y no aporta especificaciones tecnicas del modelo subyacente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags sugieren base qwen3.5/qwen3.8; transformer, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base original en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Los tags del repositorio incluyen `qwen3_5`, `qwen3.8` y `lora-merge`, lo que sugiere que el modelo se construyo fusionando adaptadores LoRA sobre una base de la familia Qwen 3.x. El tag `agentic-coding` indica que el ajuste esta orientado a tareas de programacion con agentes. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO.

La publicacion de mradermacher es una cuantizacion estatica generada con llama.cpp (quantize_version 2, output_tensor_quantised 1, convert_type hf). Se ofrecen tambien cuantizaciones ponderadas con imatrix en un repositorio separado (sufijo `-i1-GGUF`), que suelen conservar mejor la perplejidad a igual tamano. La presencia de ficheros mmproj confirma que el modelo base incorpora un codificador multimodal de vision.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Programacion y asistencia de codigo, con enfasis en flujos agenticos (tag `agentic-coding`).
- Capacidad multimodal de vision, inferida de la existencia de ficheros mmproj (Q8_0 y f16); el alcance exacto no esta documentado.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere uso detras de APIs compatibles con OpenAI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles (`en`); el resto no disponible.
- Modo de razonamiento explicito (thinking): no disponible.

## Casos de uso

- Asistente de codigo en local: con la cuantizacion Q4_K_M (17,1 GB) el modelo cabe en una GPU de 24 GB y permite autocompletado y generacion de funciones sin depender de servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Agente de refactorizacion en pipelines de CI: al estar orientado a `agentic-coding`, puede integrarse en tareas de modificacion de repositorios por pasos, siempre que se valide su comportamiento real con pruebas propias, ya que no hay benchmarks publicados.
- Revision de codigo asistida: el modelo puede procesar diffs y proponer comentarios; conviene limitar el contexto a fragmentos manejables porque se desconoce la ventana real.
- Prototipado rapido con llama.cpp u Ollama: las cuantizaciones Q4_K_S y Q4_K_M estan marcadas como "fast, recommended" por el autor de la cuantizacion, lo que las hace idoneas para estaciones de trabajo con una sola GPU consumer.
- Analisis de capturas o diagramas tecnicos: gracias a los ficheros mmproj, puede emplearse en tareas de vision basicas (descripcion de imagenes, extraccion de texto de diagramas), aunque la calidad no esta documentada.
- Despliegue en servidores con CPU: la cuantizacion Q2_K (11,3 GB) permite ejecucion en equipos sin GPU dedicada, a costa de una perdida de calidad notable frente a Q4 o superiores.
- Evaluacion comparativa interna: util para equipos que quieran medir el rendimiento de un modelo de 27 B ajustado para codigo frente a sus alternativas, usando el repositorio imatrix como referencia de mayor fidelidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11,3 GB de pesos; ~13-14 GB con contexto moderado.
  - Q3_K_M: ~13,8 GB de pesos; ~15-16 GB con contexto moderado.
  - IQ4_XS: ~15,8 GB de pesos; ~17-18 GB con contexto moderado.
  - Q4_K_M: ~17,1 GB de pesos; ~19-20 GB con contexto moderado.
  - Q5_K_M: ~19,7 GB de pesos; ~21-22 GB con contexto moderado.
  - Q6_K: ~22,5 GB de pesos; ~24-25 GB con contexto moderado.
  - Q8_0: ~29,1 GB de pesos; requiere 32 GB o mas de VRAM para contexto amplio.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) para Q4_K_M; A100 40 GB o H100 para Q6_K y Q8_0 con contexto largo.
- Cabe en GPU consumer: si, en tarjetas de 16 GB con Q3_K_M o IQ4_XS; en 24 GB con Q4_K_M o Q5_K_M; en 12 GB solo con Q2_K y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj permiten vision en llama.cpp. Para el modelo original en safetensors se usaria transformers, vLLM o TGI, aunque esta publicacion concreta es solo GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash-SuperAdapter (esta ficha) | 27,3 B | no disponible | GGUF | apache-2.0 | Ajuste LoRA fusionado orientado a codigo agentico; vision via mmproj |
| Modelo base OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter | 27,3 B | no disponible | safetensors | apache-2.0 | Version sin cuantizar del mismo modelo |
| Qwen2.5-Coder-32B-Instruct | 32 B | 128 K (segun documentacion publica de Qwen) | safetensors, GGUF | apache-2.0 | Alternativa de referencia en codigo; datos de benchmarks publicos |
| Codestral-22B | 22 B | 32 K (segun documentacion publica de Mistral) | safetensors, GGUF | licencia no comercial (Mistral AI) | Orientado a codigo; restricciones de uso comercial |

La comparativa con Qwen2.5-Coder y Codestral se ofrece a titulo orientativo de categoria y tamano; no se dispone de mediciones directas que permitan afirmar superioridad o inferioridad de Qwopus3.8-27B frente a ellos.

## Limitaciones y advertencias

- No hay benchmarks publicados: no es posible afirmar su calidad en codigo, matematicas o razonamiento sin evaluacion propia.
- La model card solo declara ingles; el comportamiento en castellano no esta verificado.
- Se desconoce la longitud de contexto real, lo que impide planificar tareas de contexto largo con garantias.
- Riesgo de alucinacion inherente a los modelos de 27 B ajustados por fusion de LoRA; especialmente relevante en generacion de APIs o librerias inexistentes.
- La licencia apache-2.0 permite uso comercial, pero conviene revisar la licencia del modelo base original y de los datos de entrenamiento, no documentados en esta publicacion.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior, o las variantes imatrix del repositorio `-i1-GGUF`.
- El soporte multimodal depende de los ficheros mmproj y del runtime; no todos los clientes GGUF gestionan vision de forma estable.
- El repositorio tiene muy poca traccion (848 descargas, 2 likes) y fue creado en noviembre de 2026, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-SuperAdapter-GGUF
- Modelo base: https://huggingface.co/OliviaRossi/Qwopus3.8-27B-Coder-Flash-SuperAdapter
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwopus3.8-27B-Coder-Flash-SuperAdapter-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwopus3.8-27B-Coder-Flash-SuperAdapter-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
