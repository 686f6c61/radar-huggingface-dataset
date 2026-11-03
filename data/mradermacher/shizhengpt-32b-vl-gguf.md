# mradermacher/ShizhenGPT-32B-VL-GGUF

## Resumen

ShizhenGPT-32B-VL es un modelo de lenguaje multimodal especializado en medicina tradicional china (TCM, por sus siglas en ingles), desarrollado por FreedomIntelligence. El modelo parte de una arquitectura transformer de 32.763.876.352 parametros (aproximadamente 32,8 mil millones) y ha sido entrenado sobre dos conjuntos de datos propietarios del autor: TCM-Pretrain-Data-ShizhenGPT y TCM-Instruction-Tuning-ShizhenGPT. Su proposito es cubrir tareas de comprension y generacion de texto e imagenes dentro del dominio de la medicina tradicional china, un nicho escasamente representado en los modelos generalistas.

La version aqui descrita es una cuantizacion GGUF estatica realizada por mradermacher a partir del modelo original FreedomIntelligence/ShizhenGPT-32B-VL. Se ofrecen 12 variantes de cuantizacion (desde Q2_K hasta Q8_0) mas dos ficheros mmproj para el componente multimodal, lo que permite desplegar el modelo en hardware de consumo con llama.cpp u otros runners compatibles con GGUF. El repositorio ocupa 226,1 GB en total.

La relevancia de esta ficha radica en que se trata de un modelo de dominio muy especifico (TCM) con capacidades multimodales y licencia Apache 2.0, lo que facilita su uso comercial. No obstante, la informacion publica disponible es limitada: no se detallan benchmarks, composicion exacta del dataset ni longitud de contexto, por lo que muchos parametros tecnicos se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + vision); detalles internos no disponibles |
| Parametros totales | 32.763.876.352 (32,8 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base original en safetensors |

## Arquitectura y entrenamiento

La informacion publica no detalla la arquitectura interna del modelo base FreedomIntelligence/ShizhenGPT-32B-VL mas alla de su caracter multimodal (procesa texto e imagenes) y su naturaleza transformer con aproximadamente 32,8 mil millones de parametros. El autor del modelo base indica que fue entrenado sobre dos datasets propios: TCM-Pretrain-Data-ShizhenGPT (fase de preentrenamiento) y TCM-Instruction-Tuning-ShizhenGPT (fase de ajuste por instrucciones), ambos centrados en medicina tradicional china. No se especifica el numero de tokens de entrenamiento, la composicion exacta del corpus, ni si se emplearon tecnicas de RLHF o DPO.

La version aqui presentada es una cuantizacion GGUF realizada por mradermacher. Segun las etiquetas internas del repositorio, se aplico quantize_version 2, output_tensor_quantised 1 y convert_type hf, lo que indica una conversion desde pesos Hugging Face con cuantizacion por tensor de salida. Se ofrecen tanto cuantizaciones estaticas (este repositorio) como cuantizaciones ponderadas con imatrix en el repositorio hermano mradermacher/ShizhenGPT-32B-VL-i1-GGUF. El componente multimodal se distribuye por separado en ficheros mmproj (Q8_0 de 0,8 GB y f16 de 1,5 GB).

## Capacidades

- Generacion de texto en chino, con especializacion en terminologia y razonamiento de medicina tradicional china.
- Procesamiento multimodal: acepta imagenes ademas de texto (requiere cargar el fichero mmproj correspondiente).
- Ajuste por instrucciones (instruction tuning) sobre el dataset TCM-Instruction-Tuning-ShizhenGPT.
- Conversacion multi-turno (etiqueta conversational en Hugging Face).
- Compatible con endpoints (etiqueta endpoints_compatible), lo que sugiere integracion con APIs de inferencia tipo TGI o similares.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al chino segun la etiqueta language: zh.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Consulta de medicina tradicional china: el modelo puede responder preguntas sobre diagnostico, formulacion y materia medica en chino, aprovechando su entrenamiento especifico sobre corpus TCM.
- Analisis de imagenes relacionadas con TCM: con el fichero mmproj cargado, puede procesar fotografias de hierbas medicinales, formulas o ilustraciones de textos clasicos para apoyar tareas de identificacion o descripcion.
- Digitalizacion y estructuración de textos clasicos: util para extraer y resumir informacion de tratados de medicina tradicional china, dado su ajuste sobre datos del dominio.
- Asistencia a profesionales e investigadores: como herramienta de consulta rapida en chino para terminos, contraindicaciones o referencias dentro del corpus TCM.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_S (18,9 GB) o Q4_K_M (20,0 GB), puede ejecutarse en estaciones de trabajo con GPU de consumo de 24 GB, sin necesidad de infraestructura de datacenter.
- Integracion en pipelines de investigacion: al estar en formato GGUF, puede incorporarse a flujos con llama.cpp u Ollama para experimentacion reproducible en entornos academicos.
- Prototipado de asistentes conversacionales de nicho: para demos o productos internos orientados a usuarios chinos interesados en TCM, con la ventaja de la licencia Apache 2.0 para uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~12,4 GB
  - Q3_K_S: ~14,5 GB
  - Q3_K_M: ~16,0 GB
  - Q3_K_L: ~17,3 GB
  - IQ4_XS: ~18,0 GB
  - Q4_K_S: ~18,9 GB
  - Q4_K_M: ~20,0 GB
  - Q5_K_S: ~22,7 GB
  - Q5_K_M: ~23,4 GB
  - Q6_K: ~27,0 GB
  - Q8_0: ~34,9 GB
  - Componente multimodal adicional: mmproj Q8_0 ~0,8 GB o mmproj f16 ~1,5 GB
- GPU recomendadas:
  - Consumer: RTX 3090 / RTX 4090 (24 GB) para cuantizaciones Q4_K_S, Q4_K_M y Q5_K_S; Q5_K_M al limite.
  - Workstation: RTX A6000 (48 GB) o RTX 6000 Ada para Q6_K y Q8_0.
  - Datacenter: A100 40/80 GB o H100 80 GB para Q8_0 con contexto amplio y margen de overhead.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con cuantizaciones hasta Q5_K_S (22,7 GB) o Q5_K_M (23,4 GB) con contexto reducido; Q4_K_M es la opcion recomendada por el autor para equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (importando el GGUF), y runners compatibles con GGUF. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables directamente documentados en la informacion proporcionada. A continuacion se ofrece una comparacion estructural basica con alternativas genericas del mismo rango de parametros, marcando los campos sin datos como no disponible.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| ShizhenGPT-32B-VL (este) | 32,8 B | No disponible | zh | Apache 2.0 | GGUF / safetensors |
| Modelo generalista ~32B (referencia) | ~32 B | No disponible | Multiples | Variable | safetensors / GGUF |
| Modelo medico generalista (referencia) | Variable | No disponible | Multiples | Variable | Variable |

No se dispone de comparaciones de rendimiento verificables con modelos de la misma categoria (LLM medico en chino) en la informacion disponible.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado exclusivamente para medicina tradicional china en chino; su rendimiento fuera de ese dominio o en otros idiomas no esta documentado y previsiblemente sera limitado.
- Riesgo de alucinacion: al ser un modelo de dominio medico, puede generar afirmaciones plausibles pero incorrectas sobre tratamientos, dosis o diagnosticos. No debe usarse como sustituto de juicio clinico profesional.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus TCM puede reflejar sesgos historicos o culturales de las fuentes originales.
- Contexto: la longitud de contexto no esta publicada, lo que impide planificar cargas de trabajo con documentos largos.
- Idiomas: solo se declara soporte de chino (zh); el uso en castellano no esta respaldado por el autor.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datasets subyacentes podrian tener condiciones adicionales no reflejadas en la model card; conviene verificar el repositorio original FreedomIntelligence/ShizhenGPT-32B-VL antes de un despliegue comercial.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable; el autor recomienda Q4_K_M o superiores para uso practico.
- Componente multimodal: requiere descargar y cargar el fichero mmproj por separado; sin el, el modelo solo procesa texto.
- Madurez: el repositorio tiene pocas descargas (273) y ningun like en el momento de la consulta, lo que sugiere una adopcion limitada y poca validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ShizhenGPT-32B-VL-GGUF
- Modelo base: https://huggingface.co/FreedomIntelligence/ShizhenGPT-32B-VL
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/ShizhenGPT-32B-VL-i1-GGUF
- Pagina de conveniencia del autor: https://hf.tst.eu/model#ShizhenGPT-32B-VL-GGUF
- Dataset de preentrenamiento: https://huggingface.co/datasets/FreedomIntelligence/TCM-Pretrain-Data-ShizhenGPT
- Dataset de instruction tuning: https://huggingface.co/datasets/FreedomIntelligence/TCM-Instruction-Tuning-ShizhenGPT
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
