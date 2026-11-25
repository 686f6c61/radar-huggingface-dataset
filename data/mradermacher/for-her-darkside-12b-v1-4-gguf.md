# mradermacher/For-Her-Darkside-12B-v1.4-GGUF

## Resumen

For-Her-Darkside-12B-v1.4-GGUF es una coleccion de cuantizaciones GGUF del modelo base ReadyArt/For-Her-Darkside-12B-v1.4, publicada por el usuario mradermacher. El modelo original es un ajuste fino de tipo roleplay/conversacional orientado a contenido adulto explicito, etiquetado por su autor con las categorias nsfw, explicit, erp, adult-content, mature y unaligned, y construido sobre la familia Gemma (tag gemma-4 en el repositorio). El paquete GGUF no introduce cambios en los pesos mas alla de la cuantizacion: su proposito es facilitar la inferencia local en hardware de consumo mediante llama.cpp y derivados.

El modelo cuenta con 11.907.350.576 parametros totales (aproximadamente 11,9 mil millones), lo que lo situa en la gama de modelos densos de 12B. El repositorio incluye un conjunto amplio de cuantizaciones estaticas (Q2_K hasta Q8_0, ademas de IQ4_XS) y ficheros mmproj que actuan como suplemento multimodal, lo que sugiere capacidades de vision en el modelo base. El repositorio completo ocupa 83,7 GB, y la cuantizacion mas ligera (Q2_K) pesa 4,9 GB.

Es relevante ahora porque permite ejecutar un modelo de rol adulto de 12B en GPU de consumo y en CPU con un rango de tamanos que va de los 4,9 GB a los 12,8 GB, algo que el formato safetensors original no facilita. La licencia declarada es Apache 2.0, si bien el contenido del modelo esta explicitamente marcado como no apto para todos los publicos (not-for-all-audiences).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma, tag gemma-4); detalles internos no disponibles |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. El tag gemma-4 y el tamano de 11,9 mil millones de parametros apuntan a un transformer denso derivado de la familia Gemma, pero no se especifican numero de capas, dimensiones ocultas, tipo de atencion ni estrategia de positional encoding. Tampoco se documenta el proceso de entrenamiento del modelo original: no hay datos sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni tecnicas de alineacion. Las etiquetas unaligned e instruct sugieren un ajuste fino conversacional sin las restricciones de seguridad habituales de los modelos comerciales, pero es una inferencia a partir de metadatos, no un dato confirmado.

En cuanto a la contribucion de esta publicacion, mradermacher aplica cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) sobre los pesos del modelo base. El repositorio incluye ademas una variante con cuantizaciones ponderadas/imatrix en un repositorio separado. La presencia de ficheros mmproj-f16 y mmproj-Q8_0 indica que el modelo base incorpora un proyector multimodal, presumiblemente para entrada de imagenes, aunque no se detalla su arquitectura.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en roleplay y narrativa interactiva.
- Contenido adulto explicito y escenarios ERP (erotic roleplay), segun las etiquetas del autor.
- Modo instruct: sigue instrucciones en formato conversacional.
- Capacidad multimodal potencial: los ficheros mmproj incluidos permiten cargar un proyector de vision en llama.cpp, aunque no se documenta que tareas visuales soporta.
- Idioma: ingles como unico idioma declarado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking ni capacidades de audio.

## Casos de uso

- Roleplay conversacional local: el modelo esta disenado para mantener personajes y narrativa a lo largo de conversaciones multi-turno; las cuantizaciones Q4_K_M (7,5 GB) permiten ejecutarlo en una GPU de consumo con VRAM suficiente, manteniendo coherencia de personaje sin depender de servicios en la nube.
- Escritura creativa para adultos: generacion de ficcion explicita y narrativa madura en ingles, usando Q6_K o Q8_0 para preservar matices estilisticos cuando la calidad es prioritaria sobre la velocidad.
- Prototipado de interfaces de chat sin censura: desarrolladores que necesitan evaluar el comportamiento de un modelo sin filtros de seguridad pueden usar las cuantizaciones ligeras (Q2_K, Q3_K_S) en entornos aislados para pruebas de UX y de formato de respuesta.
- Investigacion sobre alineacion y contenido: el tag unaligned lo hace util para estudiar como se comporta un modelo sin las salvaguardas habituales, comparando respuestas frente a modelos alineados en tareas controladas.
- Despliegue en CPU o hardware modesto: con Q2_K (4,9 GB) o Q3_K_S (5,6 GB) el modelo puede ejecutarse en llama.cpp sobre CPU con RAM suficiente, util para demos offline o entornos sin GPU.
- Experimentacion multimodal: cargando los ficheros mmproj junto con los pesos, se puede probar la entrada de imagenes en llama.cpp para tareas de descripcion o contexto visual en conversaciones de rol.
- Fine-tuning posterior sobre GGUF: aunque el formato no es el ideal para reentrenar, las cuantizaciones Q8_0 pueden servir como referencia de calidad para comparar con adaptaciones LoRA entrenadas sobre el modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto): Q2_K ~5-6 GB; Q3_K_M ~7 GB; Q4_K_M ~8,5-9 GB; Q5_K_M ~9,5-10 GB; Q6_K ~11 GB; Q8_0 ~14 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M y Q5_K_M; RTX 4090 24 GB para Q8_0 con contexto amplio; A100/H100 solo si se necesita batched serving a gran escala.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q6_K en tarjetas de 8-12 GB; Q8_0 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (el repositorio incluye el tag endpoints_compatible). vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida. Las variantes Q4_K_S y Q4_K_M estan marcadas por el autor como "fast, recommended".

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| For-Her-Darkside-12B-v1.4-GGUF | 11,9B | no disponible | GGUF | Apache 2.0 | Roleplay adulto, unaligned, multimodal via mmproj |
| For-Her-Darkside-12B-v1.4 (base) | 11,9B | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar |
| For-Her-Darkside-12B-v1.4-i1-GGUF | 11,9B | no disponible | GGUF | Apache 2.0 | Cuantizaciones imatrix del mismo modelo |
| Alternativas de rol de 12B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Contenido explicito y adulto: el modelo esta marcado como not-for-all-audiences y nsfw; no es adecuado para entornos laborales, menores ni aplicaciones de cara al publico sin filtrado previo.
- Modelo unaligned: al carecer de las salvaguardas habituales, puede generar respuestas ofensivas, inexactas o inapropiadas ante prompts cotidianos.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos, nombres y detalles; no hay datos de evaluacion que cuantifiquen esta tasa.
- Idioma limitado al ingles: no se declara soporte de castellano ni de otros idiomas, por lo que la calidad fuera del ingles no esta garantizada.
- Licencia Apache 2.0: permite uso comercial segun los terminos de la licencia, pero el contenido generado puede infringir normativas de moderacion, proteccion de menores o las politicas de las plataformas de despliegue; la responsabilidad recae en el integrador.
- Contexto no documentado: se desconoce la ventana de contexto real, lo que dificulta planificar conversaciones largas o tareas de resumen de documentos extensos.
- Cuantizaciones de baja calidad: Q2_K y Q3_K_S degradan notablemente la coherencia; el propio autor marca Q3_K_M como "lower quality".
- Sin benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni evaluaciones de rol, por lo que la comparacion con alternativas es especulativa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/For-Her-Darkside-12B-v1.4-GGUF
- Modelo base: https://huggingface.co/ReadyArt/For-Her-Darkside-12B-v1.4
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/For-Her-Darkside-12B-v1.4-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#For-Her-Darkside-12B-v1.4-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
