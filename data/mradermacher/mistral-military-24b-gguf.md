# mradermacher/Mistral-Military-24B-GGUF

## Resumen

Mistral-Military-24B-GGUF es la version cuantizada en formato GGUF del modelo racineai/Mistral-Military-24B, un modelo de lenguaje de aproximadamente 23.570 millones de parametros derivado de la familia Mistral y especializado mediante preentrenamiento continuado en dominio de defensa y militar. La cuantizacion la publica mradermacher, autor habitual de conversiones GGUF para llama.cpp, e incluye un conjunto amplio de variantes de cuantizacion que van desde Q2_K (9 GB) hasta Q8_0 (25,2 GB), ademas de ficheros mmproj para un componente multimodal.

El modelo base se construye mediante la tecnica TIES-merge, una estrategia de fusion de pesos que combina modelos especializados resolviendo conflictos de parametros, y posteriormente se somete a preentrenamiento continuado sobre datos del ambito militar y de defensa. Esta orientado a conversaciones en frances e ingles y se distribuye con licencia Apache 2.0, lo que facilita su uso comercial y su integracion en entornos de investigacion y produccion.

Su relevancia actual reside en la combinacion de tres factores: un tamano de 24B manejable en hardware de gama alta de consumo con cuantizaciones Q4, un enfoque de dominio especifico poco cubierto por modelos generalistas, y la disponibilidad inmediata de pesos GGUF listos para llama.cpp, Ollama y servidores compatibles con la API de OpenAI. La ficha se centra en la version cuantizada; los detalles de entrenamiento del modelo base no se documentan en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basada en Mistral (derivada por TIES-merge y preentrenamiento continuado); detalles internos no disponibles |
| Parametros totales | 23.572.403.200 (23,57B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | frances (fr) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 162,8 GB (incluye todas las variantes) |
| Cuantizaciones con imatrix | disponibles en mradermacher/Mistral-Military-24B-i1-GGUF |

## Arquitectura y entrenamiento

El modelo base racineai/Mistral-Military-24B se construye sobre la arquitectura Mistral, un transformer decoder-only con atencion por ventanas deslizantes en las versiones originales de la familia, aunque la informacion disponible no confirma la configuracion concreta de atencion, el numero de capas ni la dimension oculta. La generacion del modelo combina dos etapas: una fusion TIES-merge, que integra los pesos de varios modelos especializados resolviendo interferencias mediante poda de parametros redundantes y eleccion de signo, y un preentrenamiento continuado posterior sobre corpus de dominio militar y de defensa.

No se dispone de datos sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset, la existencia de fases de RLHF o DPO, ni la estrategia de alineacion aplicada. Tampoco se documenta si el modelo conserva la ventana de contexto original de Mistral (habitualmente 32.768 tokens en la familia) o si fue modificada durante el preentrenamiento continuado. La presencia de ficheros mmproj en el repositorio sugiere la existencia de un componente multimodal en el modelo base, pero la model card no detalla su naturaleza ni sus capacidades.

## Capacidades

- Generacion de texto conversacional en frances e ingles, con orientacion a tematica de defensa y militar.
- Razonamiento y respuesta a preguntas dentro del dominio especializado para el que fue preentrenado.
- Soporte de conversaciones multi-turno segun el tag `conversational` del repositorio.
- Posible capacidad multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica un componente de proyeccion para entrada visual, aunque no se detalla su alcance.
- Compatibilidad con endpoints estilo OpenAI (`endpoints_compatible`), lo que permite integrarlo en servidores con API compatible.
- Ejecucion en llama.cpp y derivados gracias al formato GGUF, con soporte de cuantizaciones desde 2 hasta 8 bits.
- No se documentan capacidades explicitas de tool calling, function calling ni razonamiento agente multi-paso en la informacion disponible.

## Casos de uso

- Analisis de documentacion tecnica militar: el modelo puede resumir y extraer informacion de manuales, informes y normativa del ambito de defensa, aprovechando su preentrenamiento continuado en ese dominio y su capacidad de conversacion multi-turno.
- Asistencia en investigacion academica de defensa: util como base para experimentos de NLP especializado en frances e ingles, con la ventaja de una licencia Apache 2.0 que permite publicar resultados y derivados.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q4_K_M (14,4 GB) y Q4_K_S (13,6 GB) permiten ejecutar el modelo en una GPU de consumo con 16 GB de VRAM o en configuraciones CPU con RAM suficiente, algo inviable con el modelo en precision completa.
- Generacion de resumenes y traduccion tecnica frances-ingles: el soporte bilingue y el dominio especializado lo hacen adecuado para traducir y condensar textos tecnicos entre ambos idiomas.
- Prototipado de asistentes conversacionales especializados: mediante llama.cpp u Ollama se puede levantar un servidor local con API compatible con OpenAI para validar productos de asistencia en dominio de defensa antes de escalar a infraestructura mayor.
- Clasificacion y etiquetado de corpus: el modelo puede emplearse para categorizar documentos, extraer entidades y generar metadatos en pipelines de procesamiento de informacion de defensa, con la cuantizacion Q8_0 (25,2 GB) si se prioriza calidad.
- Experimentacion con fusion de modelos: como caso de estudio de la tecnica TIES-merge aplicada a dominios verticales, comparando su comportamiento frente al modelo base sin especializar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: Q2_K aproximadamente 9 GB; Q3_K_S 10,5 GB; Q3_K_M 11,6 GB; Q3_K_L 12,5 GB; IQ4_XS 13 GB; Q4_K_S 13,6 GB; Q4_K_M 14,4 GB; Q5_K_S 16,4 GB; Q5_K_M 16,9 GB; Q6_K 19,4 GB; Q8_0 25,2 GB. A estas cifras hay que sumar el espacio para el contexto KV cache, que crece con la longitud de contexto utilizada.
- GPU recomendadas: una RTX 4090 (24 GB) ejecuta con comodidad las cuantizaciones hasta Q6_K e incluso Q8_0 con contexto moderado; una RTX 3090 o 4080 (16 GB) funciona bien con Q4_K_M; para Q8_0 con contexto largo o para servir multiples peticiones concurrentes se recomienda A100 40/80 GB o H100.
- Cabe en GPU de consumo: si. Las variantes Q4_K_S y Q4_K_M caben en GPUs de 16 GB, y las Q2_K y Q3 caben en GPUs de 12 GB con contexto reducido.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, servidores compatibles con la API de OpenAI basados en llama.cpp, y cualquier runtime que soporte GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, aunque la informacion disponible no confirma compatibilidad explicita.
- Latencia y throughput estimados: no disponibles. Dependen de la GPU, la cuantizacion, la longitud de contexto y el backend; a modo orientativo, un modelo de 24B en Q4_K_M suele generar entre 20 y 40 tokens por segundo en una RTX 4090 con llama.cpp, pero este dato no procede de la informacion proporcionada y debe validarse en el entorno objetivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Mistral-Military-24B (este) | 23,57B | no disponible | fr, en | Apache 2.0 | GGUF, safetensors | Especializado en defensa via TIES-merge y preentrenamiento continuado |
| Mistral-Small-24B (referencia de familia) | 24B | no disponible en esta ficha | multilingue | Apache 2.0 | safetensors, GGUF | Modelo generalista de la misma familia y tamano; sin especializacion de dominio |
| Modelos GGUF de 20-30B de mradermacher | variable | variable | variable | variable | GGUF | Alternativas de cuantizacion generica sin especializacion militar |

La comparacion directa con modelos especializados en defensa no esta disponible en la informacion proporcionada. La principal diferencia frente a Mistral-Small-24B es la especializacion de dominio, que puede mejorar el rendimiento en tareas militares a costa de degradar capacidades generalistas.

## Limitaciones y advertencias

- Sesgos conocidos: un preentrenamiento continuado sobre corpus militar puede introducir sesgos de dominio, incluyendo perspectivas geopoliticas, terminologia belica y encuadres propios de las fuentes utilizadas; no se documenta ningun proceso de mitigacion.
- Riesgo de alucinacion: no se documentan evaluaciones de factualidad ni fases de alineacion; en un dominio sensible como defensa, la verificacion humana de las respuestas es imprescindible antes de cualquier uso operativo.
- Limitaciones de contexto e idioma: solo se declaran frances e ingles; el rendimiento en castellano no esta garantizado. La longitud de contexto no se especifica, por lo que debe validarse empiricamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion con atribucion, pero el usuario debe verificar que el modelo base racineai/Mistral-Military-24B mantiene la misma licencia y que los datos de preentrenamiento no imponen restricciones adicionales.
- Caveat de produccion: las cuantizaciones de 2 y 3 bits pueden degradar notablemente la calidad; para uso en produccion se recomienda Q4_K_M o superior. El tamano del repositorio (162,8 GB) obliga a descargar solo la variante necesaria.
- Uso dual: un modelo especializado en defensa puede emplearse en contextos sensibles; conviene establecer politicas de uso aceptable y supervision humana.
- La informacion sobre el componente multimodal (mmproj) es insuficiente para garantizar su correcto funcionamiento en todos los backends.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Mistral-Military-24B-GGUF
- Modelo base: https://huggingface.co/racineai/Mistral-Military-24B
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Mistral-Military-24B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Mistral-Military-24B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
