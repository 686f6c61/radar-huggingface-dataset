# mradermacher/t5-russian-detoxifier-GGUF

## Resumen

`mradermacher/t5-russian-detoxifier-GGUF` es una version cuantizada en formato GGUF del modelo `wantuta/t5-russian-detoxifier`, un modelo de la familia T5 (Text-to-Text Transfer Transformer) orientado a la detoxificacion de texto. Lo publica mradermacher, un conocido autor de cuantizaciones GGUF en Hugging Face, y su funcion principal es la de servir como base para despliegue local en herramientas como llama.cpp u Ollama, sin necesidad de GPU de datacenter.

El modelo base cuenta con aproximadamente 244 millones de parametros (244.309.248 segun los pesos en safetensors), lo que lo situa en la gama pequena de transformers encoder-decoder. A pesar del nombre "russian" en el identificador, la model card declara el idioma `en` en los metadatos, y no se proporciona informacion adicional sobre el dataset de entrenamiento ni sobre el proceso de detoxificacion empleado.

La relevancia de esta ficha es practica: se trata de un modelo especializado y ligero, pensado para tareas de reescritura de texto potencialmente toxico, y disponible en cuantizaciones que van desde Q2_K (~0,2 GB) hasta f16 (~0,6 GB), lo que permite ejecutarlo en hardware muy modesto. No obstante, la informacion publicada es escasa y no incluye benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (transformer encoder-decoder, text-to-text) |
| Parametros totales | 244.309.248 (~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (segun metadatos; el nombre sugiere uso con ruso, no confirmado) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en safetensors |
| Tamano del repo | 2,2 GB |
| Libreria | transformers |
| Modelo base | wantuta/t5-russian-detoxifier |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura T5, un transformer encoder-decoder disenado para tareas de secuencia a secuencia, en el que tanto la entrada como la salida se tratan como texto. Con ~244 millones de parametros, corresponde a una variante de tamano pequeno (comparable en orden de magnitud a T5-base, 220 M, aunque la cifra exacta no se especifica en la informacion disponible).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras tecnicas de alineacion. El autor de la cuantizacion indica que se trata de "static quants" y que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. Tampoco se documentan innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto condicionada (text-to-text), propia de la arquitectura T5.
- Detoxificacion o reescritura de texto: la funcion inferida del nombre del modelo base es transformar entradas toxicas en salidas menos toxicas.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingues: los metadatos declaran solo `en`; el nombre sugiere uso con ruso, pero no se confirma en la informacion disponible.
- No se documentan modos especiales (thinking mode, vision, audio).

## Casos de uso

- Moderacion de comunidades en linea: el modelo puede integrarse en un pipeline que reciba comentarios de usuarios y devuelva una version reescrita y menos toxica antes de su publicacion, gracias a su bajo coste computacional (~0,2-0,6 GB en GGUF).
- Preprocesado de datasets para entrenamiento: util para limpiar corpus que contienen lenguaje ofensivo antes de usarlos en el entrenamiento de otros modelos, ejecutandose en CPU o GPU consumer.
- Filtrado de resenas y comentarios en plataformas de contenido: el modelo puede normalizar el tono de resenas generadas por usuarios en entornos con requisitos de civismo.
- Prototipado rapido en local: al estar disponible en GGUF, se puede probar con llama.cpp u Ollama en un portatil sin GPU dedicada, lo que facilita la evaluacion antes de comprometerse con un modelo mayor.
- Investigacion en detoxificacion: sirve como baseline ligero para comparar tecnicas de reescritura de texto en experimentos academicos con recursos limitados.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse completamente en local, permite procesar texto sensible sin enviarlo a APIs externas, algo relevante en sectores regulados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: entre ~0,2 GB (Q2_K) y ~0,6 GB (f16) para los pesos; el consumo real en inferencia depende del runtime y del tamano de lote.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100. Una RTX 3060 o superior ofrece margen de sobra.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 1 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; el modelo base puede cargarse con la libreria `transformers`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| t5-russian-detoxifier-GGUF (este) | ~244 M | no disponible | MIT | GGUF | Cuantizaciones estaticas, sin imatrix |
| wantuta/t5-russian-detoxifier (base) | ~244 M | no disponible | MIT | safetensors | Modelo original sin cuantizar |
| T5-base | ~220 M | 512 tokens (tipico en T5) | Apache 2.0 | safetensors | Modelo generico, no especializado en detoxificacion |
| mT5-small | ~300 M | 512 tokens (tipico) | Apache 2.0 | safetensors | Multilingue, no especializado en detoxificacion |

La comparacion con T5-base y mT5-small es orientativa por tamano y familia arquitectonica; no se dispone de datos de rendimiento comparativo para este modelo concreto.

## Limitaciones y advertencias

- La informacion publicada es muy escasa: no hay benchmarks, detalles de entrenamiento ni evaluacion de sesgos.
- Riesgo de alucinacion y de reescrituras que alteren el significado original del texto, algo inherente a los modelos T5 pequenos.
- La discrepancia entre el nombre ("russian") y el idioma declarado en metadatos ("en") genera incertidumbre sobre su cobertura linguistica real.
- No se documenta la longitud de contexto soportada; en T5 suele ser limitada (tipicamente 512 tokens), lo que restringe entradas largas.
- Licencia MIT: permite uso comercial, pero conviene verificar la licencia del modelo base (`wantuta/t5-russian-detoxifier`) por si impone condiciones adicionales.
- Al ser cuantizaciones estaticas sin imatrix, las versiones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad de forma notable.
- No apto para tareas generativas generales ni para razonamiento complejo; su ambito es la reescritura/detoxificacion.

## Enlaces

- Hugging Face (cuantizaciones GGUF): https://huggingface.co/mradermacher/t5-russian-detoxifier-GGUF
- Modelo base: https://huggingface.co/wantuta/t5-russian-detoxifier
- Pagina de resumen del autor: https://hf.tst.eu/model#t5-russian-detoxifier-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
