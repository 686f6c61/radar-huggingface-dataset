# mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF

## Resumen

Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF es una cuantizacion GGUF realizada por mradermacher sobre el modelo xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic, una variante "abliterated" y sin censura de un modelo coder de la familia Qwen3.5. El modelo base combina tecnicas de ajuste fino supervisado (SFT) con LoRA sobre trazas de razonamiento y agentes, incluyendo datasets derivados de Claude Opus 4.6 y 4.7, y emplea una arquitectura orientada a generacion de codigo con soporte de chain-of-thought, tool calling y multi-token prediction (MTP) para decodificacion especulativa.

El repositorio aqui documentado contiene unicamente el fichero imatrix (0,1 GB) para crear cuantizaciones propias con llama.cpp; las cuantizaciones estaticas e i1 completas se publican en repositorios hermanos del mismo autor. El modelo esta pensado para desarrolladores que necesitan un coder ligero (entorno a 4B parametros segun la nomenclatura, aunque el dato de safetensors del repo indica 1.797.272 parametros, probablemente un artefacto de la publicacion del imatrix) desplegable en hardware de consumo, con capacidades de razonamiento multi-paso y uso de herramientas.

La relevancia actual reside en su caracter "uncensored/abliterated", que elimina las capas de rechazo del modelo original para escenarios de investigacion, y en su soporte de decodificacion especulativa mediante MTP, que reduce latencia en inferencia local. La licencia Apache 2.0 facilita el uso comercial, aunque el caracter abliterated plantea caveats eticos y de responsabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), con soporte de MTP y decodificacion especulativa |
| Parametros totales | 1.797.272 (dato de safetensors del repo; la nomenclatura del modelo indica 4B, discrepancia no aclarada en la informacion disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (fichero publicado); cuantizaciones i1 Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (segun metadatos) |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (imatrix); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de la familia Qwen3.5, afinado mediante SFT con LoRA sobre un conjunto de datasets de trazas de razonamiento y agentes: Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. Esta composicion orienta el ajuste hacia chain-of-thought, uso de herramientas y razonamiento multi-paso, con un sesgo claro hacia tareas de codigo. El tag "heretic" y "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para eliminar el comportamiento de censura del modelo original.

La innovacion tecnica destacable es el soporte de multi-token prediction (MTP) y decodificacion especulativa, que permite generar varios tokens por paso y acelerar la inferencia. El repositorio documentado es una cuantizacion con imatrix, un proceso que usa una matriz de importancia calculada sobre datos de calibracion para preservar mejor la calidad en cuantizaciones de baja precision. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y codigo en multiples lenguajes de programacion (orientacion coder).
- Razonamiento explicito con chain-of-thought (thinking mode).
- Tool calling y function calling para integracion en pipelines.
- Soporte de agentes y razonamiento multi-paso.
- Capacidades multilingues en ingles, chino, espanol, ruso y japones.
- Decodificacion especulativa mediante MTP para acelerar inferencia.
- Capacidad de vision segun la model card ("This is a vision model"), con ficheros mmproj en el repositorio estatico.
- Comportamiento sin censura (abliterated) para escenarios de investigacion.

## Casos de uso

- Asistente de codigo en local: el modelo puede autocompletar y generar funciones en un IDE o CLI sin conexion, aprovechando su orientacion coder y su despliegue en GGUF con llama.cpp u Ollama en hardware de consumo.
- Agente de refactorizacion automatizada: con soporte de tool calling y razonamiento multi-paso, puede encadenar lecturas de ficheros, ediciones y ejecucion de tests en un bucle agentico.
- Generacion de tests unitarios: el thinking mode permite razonar sobre casos limite antes de emitir el codigo de test, util en pipelines de CI/CD.
- Traduccion tecnica y documentacion multilingue: cubre en, zh, es, ru y ja, adecuado para equipos distribuidos que documentan APIs o guias en varios idiomas.
- Investigacion sobre alineacion y censura: al ser abliterated, sirve para estudiar diferencias de comportamiento respecto al modelo original en tareas de refusal.
- Prototipado rapido de chatbots tecnicos: su contexto y capacidades de razonamiento permiten conversaciones multi-turno sobre codigo y arquitectura de software.
- Extraccion de informacion estructurada de documentacion tecnica: combinado con function calling, puede mapear texto libre a esquemas JSON en tareas de ingestion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; para un modelo de aproximadamente 4B parametros, una cuantizacion Q4_K_M requeriria del orden de 2,5-3 GB, pero este dato no esta confirmado en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion; por tamano, seria desplegable en GPUs de consumo como RTX 3060/4060/4090, pero sin confirmacion del autor.
- Cabe en consumer GPU: probablemente si, segun el tamano nominal de 4B, aunque no confirmado.
- Opciones de despliegue: llama.cpp (formato GGUF), Ollama, y cualquier runtime compatible con GGUF; el modelo base usa transformers y text-generation-inference.
- Latencia y throughput: no disponibles; el soporte de MTP y decodificacion especulativa deberia reducirlos respecto a decodificacion autoregresiva estandar, sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwopus3.5-4B-Coder-UNCENSORED-heretic (este) | 4B nominal (1.797.272 segun safetensors) | no disponible | Apache 2.0 | Coder abliterated con MTP y tool calling |
| Qwen2.5-Coder-3B / 7B | 3B / 7B | 32K (tipico en la familia) | Apache 2.0 | Coder oficial de Alibaba, sin abliteration |
| DeepSeek-Coder-V2-Lite | 16B MoE (2,4B activos) | 128K | DeepSeek License | Coder MoE, contexto mayor |
| CodeLlama-7B | 7B | 16K | Llama 2 License | Coder de Meta, licencia mas restrictiva |

Los datos de comparativa de modelos alternativos son orientativos y no proceden de la informacion proporcionada para este modelo; los campos de contexto y parametros de este modelo no estan confirmados.

## Limitaciones y advertencias

- El caracter abliterated/uncensored elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, sesgado o ilegal; no es adecuado para produccion orientada a usuarios finales sin filtros adicionales.
- Riesgo de alucinacion elevado en tareas de codigo y razonamiento, especialmente en cuantizaciones de baja precision (Q2, IQ2, IQ1).
- La discrepancia entre el tamano nominal (4B) y el dato de safetensors (1.797.272) no esta aclarada y debe verificarse antes de planificar recursos.
- El repositorio documentado solo contiene el fichero imatrix; las cuantizaciones completas estan en repositorios hermanos, lo que puede confundir en la descarga.
- No se especifican la longitud de contexto ni los datos de entrenamiento, lo que limita la evaluacion de su idoneidad para tareas de contexto largo.
- Aunque la licencia es Apache 2.0, el uso comercial de un modelo abliterated puede acarrear responsabilidad legal y reputacional segun la jurisdiccion.
- Soporte de vision anunciado pero con ficheros mmproj en el repositorio estatico, no en este; verificar disponibilidad antes de asumir capacidades multimodales.
- Cero descargas y cero likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Qwopus3.5-4B-Coder-UNCENSORED-heretic
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwopus3.5-4B-Coder-UNCENSORED-heretic-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwopus3.5-4B-Coder-UNCENSORED-heretic-i1-GGUF
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
