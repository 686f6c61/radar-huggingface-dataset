# mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-GGUF

## Resumen

Nemotron-3.5-Bolt-E4B-Abliterated-GGUF es la distribucion en formato GGUF del modelo monamoe/Nemotron-3.5-Bolt-E4B-Abliterated, publicada por el cuantizador mradermacher. Se trata de una variante "abliterated" (es decir, con el comportamiento de rechazo mitigado mediante intervencion sobre las direcciones de activacion) del modelo Nemotron-3.5-Bolt-E4B, que segun los tags del repositorio deriva de la familia Gemma 4 y esta orientado a uso conversacional en ingles.

El modelo cuenta con 7.518.069.290 parametros totales segun los pesos en safetensors del modelo base, lo que lo situa en la categoria de modelos de aproximadamente 7B-8B. El sufijo "E4B" del nombre sugiere una configuracion de tipo mixture-of-experts con aproximadamente 4B de parametros activos, aunque esta informacion no se confirma explicitamente en la model card proporcionada y debe tratarse como no verificada.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K hasta f16, incluyendo variantes IQ) junto con los ficheros mmproj necesarios para el procesamiento multimodal, lo que facilita su despliegue en hardware de consumo mediante llama.cpp u Ollama. La licencia openmdw-1.1 y la ausencia de datos de benchmarks publicados en la informacion disponible limitan las conclusiones sobre su rendimiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tags indican nemotron-3.5 y gemma4; se desconoce la arquitectura exacta) |
| Parametros totales | 7.518.069.290 (dato real de safetensors del modelo base) |
| Parametros activos | no disponible (el sufijo E4B sugiere ~4B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (con ficheros mmproj para multimodal); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. Los tags del repositorio apuntan a las familias nemotron-3.5 y gemma4, y el nombre "E4B" sugiere una configuracion de mezcla de expertos con aproximadamente 4B de parametros activos sobre un total de 7.518.069.290 parametros. Esta interpretacion no esta confirmada por documentacion oficial en la informacion disponible.

Respecto al entrenamiento, la model card no incluye datos sobre volumen de tokens, composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras. La unica informacion tecnica relevante es que se trata de una variante "abliterated", lo que implica que el modelo base ha sido modificado para reducir o eliminar las respuestas de rechazo, presumiblemente mediante tecnicas de abliteracion sobre las direcciones de activacion. Tampoco se detalla el proceso de cuantizacion mas alla de que se han generado cuantizaciones estaticas (quantize_version 2) con output_tensor_quantised 1 y convert_type hf.

## Capacidades

- Generacion de texto conversacional en ingles, segun el tag "conversational" del repositorio.
- Procesamiento multimodal: la presencia de ficheros mmproj (Q8_0 y f16) indica soporte de entrada de imagenes o vision, aunque no se detalla el alcance.
- Comportamiento "abliterated": el modelo ha sido modificado para reducir los rechazos, lo que puede afectar a su comportamiento en consultas sensibles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (5,4 GB) y Q4_K_S (5,3 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, lo que lo hace adecuado para prototipado y experimentacion en estaciones de trabajo personales.
- Generacion de texto conversacional en ingles: el modelo esta etiquetado como conversacional y puede emplearse en asistentes de chat de proposito general, aunque su naturaleza abliterated lo hace poco recomendable para aplicaciones con filtros de contenido estrictos.
- Experimentacion con modelos sin censura: investigadores interesados en estudiar el efecto de la abliteracion sobre el comportamiento del modelo pueden comparar esta variante con el modelo base original.
- Procesamiento multimodal en local: los ficheros mmproj permiten combinar el modelo con entradas visuales en pipelines de llama.cpp, util para tareas de descripcion de imagenes o analisis de documentos escaneados.
- Evaluacion de cuantizaciones: la disponibilidad de 12 niveles de cuantizacion (desde Q2_K hasta f16) facilita estudios comparativos de degradacion de calidad frente a tamano, utiles para decidir el compromiso optimo en produccion.
- Integracion en entornos con requisitos de licencia permisiva: la licencia openmdw-1.1 puede encajar en proyectos que necesiten redistribuir el modelo, siempre que se verifiquen los terminos exactos del fichero LICENSE.
- Fine-tuning y experimentacion: al estar disponible tambien el modelo base en safetensors, es posible partir de el para ajuste fino y luego cuantizar los resultados con el mismo pipeline de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB (Q2_K), 5,4 GB (Q4_K_M), 6,3 GB (Q6_K), 8,1 GB (Q8_0) y 15,2 GB (f16), segun los tamanos de fichero publicados.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100 y H100 para las cuantizaciones mas altas o para mayor throughput.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 6-8 GB o mas de VRAM usando cuantizaciones Q4 o Q5; las variantes Q8_0 y f16 requieren 8-16 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Nemotron-3.5-Bolt-E4B-Abliterated-GGUF (este) | 7.518.069.290 | no disponible | openmdw-1.1 | GGUF | Variante abliterated, multimodal via mmproj |
| monamoe/Nemotron-3.5-Bolt-E4B-Abliterated | 7.518.069.290 | no disponible | openmdw-1.1 | safetensors | Modelo base sin cuantizar del que deriva esta publicacion |
| Nemotron-3.5-Bolt-E4B (original, sin abliterar) | no disponible | no disponible | no disponible | no disponible | Referencia por nombre; no se dispone de ficha en la informacion proporcionada |
| Modelos de ~7B de proposito general (p. ej. Llama 3.1 8B, Qwen2.5 7B) | ~7-8B | 128K en algunos casos | licencias propias | safetensors, GGUF | Alternativas habituales; no se dispone de comparacion de rendimiento en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Modelo "abliterated": la mitigacion del comportamiento de rechazo puede producir respuestas inapropiadas o inseguras en consultas sensibles; no es recomendable para aplicaciones orientadas al publico sin filtros adicionales.
- Sesgos conocidos: no disponible en la informacion proporcionada; cabe esperar los sesgos inherentes al modelo base y a sus datos de entrenamiento, no documentados aqui.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido factualmente incorrecto.
- Limitaciones de idioma: el repositorio declara unicamente ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card; debe consultarse la configuracion del modelo base antes de usarlo en tareas de contexto largo.
- Restricciones de licencia: la licencia openmdw-1.1 debe revisarse en el fichero LICENSE del repositorio antes de cualquier uso comercial o redistribucion.
- Caveat de cuantizacion: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para produccion.
- Ficheros mmproj: son necesarios para el modo multimodal; sin ellos, el modelo funciona solo como texto.
- Datos de rendimiento ausentes: no hay benchmarks publicados en la informacion disponible, por lo que cualquier decision de produccion deberia basarse en evaluaciones propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-GGUF
- Modelo base: https://huggingface.co/monamoe/Nemotron-3.5-Bolt-E4B-Abliterated
- Cuantizaciones con imatrix: https://huggingface.co/mradermacher/Nemotron-3.5-Bolt-E4B-Abliterated-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Nemotron-3.5-Bolt-E4B-Abliterated-GGUF
- Guia de uso de GGUF (README de TheBloke referenciado): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
