# mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF

## Resumen

G4-MeroMero-26B-A4B-Heretic2-i1-GGUF es una cuantizacion GGUF, generada por mradermacher, del modelo EternalDragon/G4-MeroMero-26B-A4B-Heretic2. Se trata de un modelo afinado para rol conversacional y roleplay sin censura (etiquetas "heretic" y "uncensored"), construido sobre una arquitectura de tipo Gemma 4 con nomenclatura "A4B", que sugiere un esquema de mezcla de expertos con aproximadamente 4.000 millones de parametros activos sobre un total de 25.233.142.046 parametros. El repositorio contiene unicamente pesos cuantizados en formato GGUF, no los pesos originales en safetensors.

La relevancia practica de esta publicacion radica en que pone a disposicion de equipos con hardware modesto un modelo de ~25.000 millones de parametros totales en cuantizaciones que van desde 8,4 GB (i1-IQ1_S) hasta 22,7 GB (i1-Q6_K), lo que permite ejecutarlo en GPUs de consumo mediante llama.cpp u Ollama. El uso de cuantizaciones con imatrix (i1) busca preservar mejor la calidad respecto a las cuantizaciones estaticas equivalentes, que tambien estan disponibles en un repositorio hermano.

El modelo esta pensado para conversacion multi-turno y generacion de personajes, con licencia Apache 2.0 y soporte declarado unicamente para ingles. No se han publicado en la informacion disponible datos sobre arquitectura exacta, contexto maximo, composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta "gemma4"; nomenclatura A4B sugiere MoE con ~4B activos) |
| Parametros totales | 25.233.142.046 (~25,2 B) |
| Parametros activos | no disponible (la nomenclatura A4B apunta a ~4 B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K, i1-Q2_K_S, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_1, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (con imatrix); versiones estaticas en repositorio separado |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (pesos originales en safetensors no incluidos en este repo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. Las etiquetas del repositorio indican "gemma4" como familia y la nomenclatura del nombre ("26B-A4B") es consistente con un transformer de mezcla de expertos (MoE) de aproximadamente 25.200 millones de parametros totales y alrededor de 4.000 millones activos por token, aunque este extremo no esta confirmado por documentacion oficial del autor. El modelo base es EternalDragon/G4-MeroMero-26B-A4B-Heretic2, un afinamiento de caracter conversacional y roleplay sin censura.

Respecto al entrenamiento, la informacion disponible no especifica numero de tokens, composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. La etiqueta "heretic" hace referencia a la familia de tecnicas de ablacion de direcciones de rechazo (abliteration) que buscan eliminar comportamientos de negativa del modelo, y "uncensored" indica que se ha reducido deliberadamente el filtrado de contenido. La cuantizacion de mradermacher emplea ficheros imatrix (matrices de importancia) para ponderar la cuantizacion, lo que segun el autor suele mejorar la calidad frente a cuantizaciones estaticas del mismo tamano.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a mantener personajes y contexto de rol.
- Roleplay y escritura creativa sin las restricciones de contenido habituales en modelos alineados de forma estandar.
- Conversacion general en ingles; no se declara soporte de otros idiomas.
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento explicito (thinking mode).
- No se documentan capacidades de codigo o matematicas mas alla de las heredadas del modelo base, sin datos que lo respalden.

## Casos de uso

- Roleplay y narrativa interactiva: el modelo esta afinado especificamente para mantener personajes coherentes en conversaciones largas, por lo que encaja en aplicaciones de ficcion interactiva y juegos de texto donde se requiere consistencia de personalidad.
- Chatbot de personaje para comunidades: despliegue en llama.cpp u Ollama sobre una unica GPU de consumo con la cuantizacion i1-Q4_K_M (16,9 GB), adecuada para servir respuestas a usuarios en un entorno controlado.
- Generacion creativa sin filtros editoriales: util para guionistas y escritores que necesitan borradores de dialogos o escenas con tematicas adultas o sensibles que otros modelos rechazan.
- Prototipado de asistentes conversacionales en ingles: permite evaluar el comportamiento conversacional de un modelo de ~25 B con coste de hardware reducido antes de invertir en infraestructura mayor.
- Investigacion sobre alineacion y abliteration: sirve como caso de estudio de como las tecnicas "heretic" modifican el comportamiento de rechazo, comparando respuestas frente al modelo base original.
- Experimentacion local con cuantizaciones: el catalogo de 23 variantes permite medir el compromiso calidad/tamano en hardware limitado, desde 8,4 GB en i1-IQ1_S hasta 22,7 GB en i1-Q6_K.
- Despliegue en endpoints compatibles: la etiqueta "endpoints_compatible" facilita integrarlo en infraestructuras de inferencia tipo Hugging Face Endpoints o servidores compatibles con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero GGUF mas el contexto y el overhead de llama.cpp. Con i1-Q4_K_M (16,9 GB) se necesitan en torno a 18-20 GB de VRAM para contexto moderado; con i1-IQ3_M (12,5 GB) unos 14 GB; con i1-IQ2_M (10,5 GB) unos 12 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para las cuantizaciones altas con contexto largo; RTX 4090 (24 GB) para i1-Q4_K_M e i1-Q5_K_S; RTX 4080/4070 Ti Super (16 GB) para i1-IQ4_XS o i1-Q4_K_S.
- Cabe en GPU de consumo: si, en RTX 4090 con cuantizaciones Q4/Q5, y en GPUs de 12-16 GB con cuantizaciones IQ2/IQ3, a costa de perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; los pesos originales en safetensors no estan incluidos, por lo que vLLM o TGI requeririan convertir o descargar el modelo base.
- Latencia y throughput: no disponibles; dependen de la GPU, del numero de capas descargadas a CPU y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| G4-MeroMero-26B-A4B-Heretic2-i1-GGUF | ~25,2 B totales (activos no confirmados) | no disponible | Apache 2.0 | GGUF | Roleplay sin censura, solo ingles, cuantizaciones i1 con imatrix |
| G4-MeroMero-26B-A4B-Heretic2 (base) | ~25,2 B totales | no disponible | Apache 2.0 | safetensors | Modelo original sin cuantizar; requiere mas VRAM |
| G4-MeroMero-26B-A4B-Heretic2-GGUF (estatico) | ~25,2 B totales | no disponible | Apache 2.0 | GGUF | Mismas cuantizaciones sin imatrix; calidad algo inferior segun el autor |

No se dispone de datos de rendimiento para comparar con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Modelo "uncensored": puede generar contenido ofensivo, sexual, violento o ilegal segun el contexto; no es apto para aplicaciones dirigidas al publico general sin moderacion adicional.
- Riesgo elevado de alucinacion en datos facticos; esta optimizado para conversacion y rol, no para precision informativa.
- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no disponible; conviene verificar el limite real antes de disenar aplicaciones con historiales largos.
- Las cuantizaciones por debajo de Q3 (IQ1, IQ2, Q2_K) degradan notablemente la calidad; el propio autor las describe como "for the desperate" o "very low quality".
- Licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o las politicas de la plataforma de despliegue; la responsabilidad recae en el integrador.
- No se documentan mitigaciones de sesgo; al derivar de un modelo Gemma, puede heredar sesgos del modelo original y del afinamiento.
- Los pesos en este repositorio son solo GGUF; para entrenamiento o fine-tuning adicional hay que acudir al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- Modelo base: https://huggingface.co/EternalDragon/G4-MeroMero-26B-A4B-Heretic2
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/G4-MeroMero-26B-A4B-Heretic2-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#G4-MeroMero-26B-A4B-Heretic2-i1-GGUF
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
