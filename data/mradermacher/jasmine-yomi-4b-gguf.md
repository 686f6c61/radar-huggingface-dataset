# mradermacher/jasmine-yomi-4b-GGUF

## Resumen
jasmine-yomi-4b-GGUF es la version cuantizada en formato GGUF del modelo pakutoma/jasmine-yomi-4b, un modelo especializado en la conversion grafema-fonema (G2P) del japones, es decir, la transcripcion de kanji a su lectura (yomi) y la generacion de furigana. El modelo base fue entrenado por el usuario pakutoma y esta construido sobre la arquitectura Qwen3.5, con aproximadamente 4.841 millones de parametros totales. Esta version GGUF ha sido generada por mradermacher, un conocido autor de cuantizaciones estaticas para el ecosistema llama.cpp.

El modelo resuelve un problema concreto y bien delimitado dentro del procesado del lenguaje natural japones: determinar la lectura correcta de palabras escritas en kanji, algo que depende fuertemente del contexto y que resulta ambiguo incluso para hablantes nativos en muchos casos. Frente a diccionarios estaticos o heuristicas, un modelo neuronal permite desambiguar lecturas atendiendo al contexto de la frase, lo que lo hace util en pipelines de TTS, subtitulado, indexacion fonetica o ensenanza del japones.

La relevancia de esta publicacion radica en que pone a disposicion de la comunidad un modelo de 4B en multiples niveles de cuantizacion (desde Q2_K hasta f16), lo que permite ejecutarlo en hardware modesto, incluso en CPU o GPUs de consumo, manteniendo la licencia permisiva Apache-2.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, segun tags del modelo base) |
| Parametros totales | 4.841.450.496 (aprox. 4,84B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
El modelo base pakutoma/jasmine-yomi-4b esta etiquetado con la familia qwen3_5, lo que indica que emplea una arquitectura transformer derivada de Qwen3.5, con aproximadamente 4,84 mil millones de parametros. Se trata de un modelo afinado especificamente para la tarea de lectura de kanji (yomi) y generacion de furigana, no de un modelo de proposito general.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. La model card del repositorio GGUF unicamente documenta el proceso de cuantizacion estatica (quantize_version 2, convert_type hf), indicando que no se han publicado (por parte de mradermacher) cuantizaciones con imatrix o ponderadas en el momento de la publicacion.

## Capacidades
- Conversion grafema-fonema (G2P) del japones: transforma texto con kanji en su lectura fonetica (yomi).
- Generacion de furigana: anade la lectura sobre los caracteres para facilitar la lectura.
- Desambiguacion contextual de lecturas de kanji, tarea en la que un modelo neuronal aventaja a diccionarios estaticos.
- Procesamiento de texto japones exclusivamente; no se documentan capacidades multilingues.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Uso como componente especializado dentro de pipelines mayores (TTS, NLP japones), no como modelo conversacional general.

## Casos de uso
- Sintesis de voz (TTS) en japones: el modelo proporciona la lectura fonetica correcta de cada kanji segun el contexto, paso imprescindible para alimentar un motor TTS que de otra forma pronunciaria de manera incorrecta palabras ambiguas.
- Generacion automatica de furigana: util para editoriales, plataformas de lectura o materiales educativos que necesitan anadir ruby text sobre kanji de forma automatizada y contextual.
- Subtitulado y transcripcion: conversion de texto escrito japones a transcripciones foneticas para subtitulos, audiodescripcion o alineamiento con audio.
- Indexacion fonetica y busqueda: generacion de representaciones yomi para permitir busquedas por pronunciacion en bases de datos o catalogos japoneses.
- Ensenanza del japones: asistencia a estudiantes que necesitan conocer la lectura de kanji desconocidos en textos autenticos, con desambiguacion dependiente de la frase.
- Preprocesado en pipelines de NLP japones: normalizacion de texto antes de tareas de morfologia, traduccion automatica o analisis sintactico, donde la lectura correcta condiciona etapas posteriores.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_M (3,2 GB) o Q5_K_M (3,6 GB), puede ejecutarse en portatiles o servidores sin GPU dedicada mediante llama.cpp u Ollama.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada segun cuantizacion: Q2_K ~2,2 GB; Q4_K_M ~3,2 GB; Q5_K_M ~3,6 GB; Q6_K ~4,1 GB; Q8_0 ~5,3 GB; f16 ~9,8 GB. Anadese overhead de contexto y cache KV.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4/Q5 (por ejemplo RTX 3060 12 GB, RTX 4060, RTX 4090); para f16 se recomienda 12 GB o mas (RTX 4080/4090, A100, H100).
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6 GB o mas usando cuantizaciones Q4_K_M o Q5_K_M; las cuantizaciones Q2/Q3 pueden caber incluso en GPUs de gama baja.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Tambien puede usarse transformers con el modelo base safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables de G2P japones en la informacion proporcionada. A modo de referencia estructural, el modelo base comparte familia (Qwen3.5) con otras variantes de ~4B cuantizadas por el mismo autor (por ejemplo, mradermacher/totem-4b-GGUF o mradermacher/YAM-AI-4B-GGUF), pero sus tareas y dominios difieren, por lo que la comparacion directa no resulta significativa.

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| jasmine-yomi-4b (este) | ~4,84B | no disponible | G2P japones / yomi | Apache-2.0 |
| Alternativas G2P japones | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Modelo especializado exclusivamente en japones; no debe esperarse buen rendimiento en otros idiomas.
- Riesgo de alucinacion en lecturas de kanji poco frecuentes, nombres propios o neologismos, donde el contexto puede no bastar para desambiguar.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar la precision en la tarea, que es sensible a errores sutiles; se recomienda Q4_K_M o superior para produccion.
- No se documentan sesgos especificos, pero al entrenarse sobre corpus japoneses puede heredar sesgos presentes en dichos datos.
- Licencia Apache-2.0 permisiva para uso comercial, incluyendo esta version cuantizada; conviene verificar igualmente las condiciones del modelo base original.
- No es un modelo conversacional ni de proposito general: usarlo fuera de la tarea de yomi/furigana puede producir resultados pobres.
- El repositorio GGUF no incluye cuantizaciones imatrix/ponderadas en el momento de la publicacion, lo que puede afectar ligeramente a la calidad frente a futuras versiones.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/jasmine-yomi-4b-GGUF
- Modelo base: https://huggingface.co/pakutoma/jasmine-yomi-4b
- Pagina de descargas del autor: https://hf.tst.eu/model#jasmine-yomi-4b-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
