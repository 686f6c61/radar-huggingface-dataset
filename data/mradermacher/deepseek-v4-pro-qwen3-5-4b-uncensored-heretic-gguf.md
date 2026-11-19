# mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF

## Resumen

DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic es un modelo de lenguaje de 4.326.350.848 parametros (aproximadamente 4,3 mil millones) derivado de la familia Qwen 3.5 y destilado a partir de DeepSeek-V4-Pro, segun los tags de la model card. La version aqui documentada es una cuantizacion GGUF estatica producida por mradermacher a partir del modelo base xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic, publicado bajo licencia Apache 2.0.

El modelo se presenta como una variante "uncensored", "decensored" y "abliterated" (etiquetada como "heretic"), lo que indica que se han aplicado tecnicas de eliminacion o atenuacion de los mecanismos de rechazo y alineacion del modelo original. Ademas, incorpora etiquetas de razonamiento, destilacion, SFT, matemáticas y STEM, lo que sugiere un entrenamiento orientado a tareas de razonamiento y contenido tecnico-cientifico.

La relevancia de esta ficha radica en que ofrece un paquete de cuantizaciones GGUF listas para usar en llama.cpp y entornos compatibles, con tamanos que van desde 2,1 GB (Q2_K) hasta 8,8 GB (f16), lo que permite desplegar un modelo de 4,3B en hardware de consumo. El repositorio acumula 59.846 descargas y 31 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, segun tags; detalles no disponibles) |
| Parametros totales | 4.326.350.848 (aproximadamente 4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers/safetensors |
| Tamano del repo | 41,0 GB |
| Libreria | transformers |
| Modelo base | xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic |
| Fecha de creacion | 2026-11-12 |
| Fecha de actualizacion | 2026-11-18 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas de la model card, que indican la familia Qwen 3.5 y el uso de transformers como libreria. No se especifica si emplea atencion lineal, decodificacion especulativa, mezcla de expertos u otras innovaciones. El modelo base se describe con etiquetas de "distillation", "sft", "reasoning", "math" y "stem", lo que apunta a un proceso de destilacion desde DeepSeek-V4-Pro combinado con ajuste supervisado (SFT) orientado a razonamiento y disciplinas cientificas.

El aspecto mas destacable del entrenamiento es la aplicacion de tecnicas "heretic"/"abliterated"/"uncensored", que tipicamente consisten en la ablacion de direcciones de activacion asociadas a rechazos o en ajustes finos que eliminan respuestas de negativa. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se documentan los detalles del proceso de cuantizacion mas alla de que son cuantizaciones estaticas (quantize_version 2, output_tensor_quantised 1).

## Capacidades

- Generacion de texto conversacional multi-turno, con soporte para los seis idiomas declarados (ingles, chino, coreano, japones, espanol y ruso).
- Razonamiento y modo "thinking" implicito segun los tags de "reasoning" y "distillation".
- Capacidades matematicas y STEM reforzadas por el entrenamiento declarado en la model card.
- Soporte multimodal: el repositorio incluye archivos mmproj-Q8_0 y mmproj-f16, que en el ecosistema GGUF corresponden a proyecciones multimodales (tipicamente vision). No se detalla que modalidades cubre exactamente.
- Comportamiento "uncensored"/"abliterated": el modelo no aplica los rechazos tipicos del modelo original ante solicitudes que este consideraria sensibles.
- Compatibilidad con text-generation-inference y transformers, ademas de llama.cpp por el formato GGUF.
- No se documenta explicitamente soporte de tool calling, function calling ni capacidades de agente multi-paso.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el comportamiento de un modelo abliterated frente al original, comparando tasas de rechazo, sesgos y calidad en tareas sensibles, gracias a su licencia Apache 2.0 y su facil despliegue en GGUF.
- Generacion de codigo y contenido tecnico en local: con cuantizaciones Q4_K_M (2,9 GB) o Q5_K_M (3,3 GB) puede ejecutarse en GPUs de consumo para asistencia de programacion y explicacion de conceptos STEM, apoyandose en el entrenamiento declarado en math y stem.
- Procesamiento multilingue en seis idiomas: util para pipelines de traduccion o generacion de contenido en ingles, chino, coreano, japones, espanol y ruso sin depender de APIs externas.
- Prototipado rapido de asistentes conversacionales: su tamano de 4,3B y sus cuantizaciones ligeras (Q2_K de 2,1 GB) permiten iterar en portatiles y estaciones de trabajo modestas con llama.cpp u Ollama.
- Analisis de documentos con componente visual: los archivos mmproj permiten, en teoria, procesar imagenes junto a texto en llama.cpp, aunque la model card no detalla el alcance de esta capacidad.
- Investigacion sobre destilacion: al estar etiquetado como destilado de DeepSeek-V4-Pro, sirve como caso de estudio de como se transfieren capacidades de razonamiento de un modelo grande a uno de 4,3B.
- Entornos con requisitos de privacidad: al ejecutarse completamente en local, es adecuado para procesar datos sensibles sin enviarlos a servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): aproximadamente 2,1 GB (Q2_K), 2,9 GB (Q4_K_M), 3,3 GB (Q5_K_M), 4,7 GB (Q8_0) y 8,8 GB (f16).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 o H100 para cuantizaciones mayores y mayor contexto.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB de VRAM para Q4_K_M o Q5_K_M; incluso en iGPU o CPU con Q2_K-Q3_K.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (segun tags), transformers con el modelo base en safetensors; el ecosistema GGUF permite ademas usar LM Studio o servidores compatibles con la API de OpenAI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic (GGUF) | 4,3B | no disponible | Apache 2.0 | GGUF | Variante abliterated, multilingue (6 idiomas) |
| Qwen3.5-4B (original, referencia) | aproximadamente 4B | no disponible | no disponible | safetensors/GGUF | Modelo base de la familia, con alineacion estandar |
| DeepSeek-V4-Pro (modelo docente) | no disponible | no disponible | no disponible | no disponible | Modelo de origen de la destilacion |
| Llama 3.2 3B Instruct | 3,2B | 128K (segun documentacion publica de Meta) | Llama 3.2 Community License | safetensors/GGUF | Alternativa de tamano similar con alineacion estandar |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Al ser un modelo "uncensored"/"abliterated", no aplica los filtros de seguridad del modelo original; puede generar contenido danino, ofensivo o ilegal si se le solicita, lo que exige salvaguardas externas en produccion.
- Riesgo elevado de alucinacion: no se han publicado evaluaciones de fidelidad ni benchmarks que permitan cuantificarlo.
- La eliminacion de la alineacion puede degradar capacidades generales (razonamiento, instruction following) respecto al modelo base original; no hay datos que lo confirmen o desmientan.
- Longitud de contexto no documentada; no se puede garantizar el manejo de conversaciones o documentos largos.
- Cobertura limitada a seis idiomas; el rendimiento en espanol no esta cuantificado.
- La licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado y de las implicaciones de distribuir un modelo sin alineacion.
- La model card no documenta el proceso de cuantizacion mas alla de los metadatos; las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad.
- No se especifica si el modelo soporta tool calling o agentes; no debe asumirse en pipelines de produccion sin validacion.
- El repositorio base y la cadena de derivacion (DeepSeek-V4-Pro, Qwen3.5) no estan documentados en detalle en la informacion disponible, lo que dificulta la trazabilidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
