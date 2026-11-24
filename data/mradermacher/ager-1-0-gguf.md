# mradermacher/ager-1.0-GGUF

## Resumen

ager-1.0 es un modelo de lenguaje de aproximadamente 9.200 millones de parametros (9.197.093.888 segun los pesos en safetensors) desarrollado por QianqianTech y orientado al dominio de la agricultura, segun la etiqueta `agriculture` de su model card. La version aqui descrita es una cuantizacion estatica en formato GGUF realizada por mradermacher sobre el modelo base original, lo que permite su ejecucion en hardware de consumo mediante llama.cpp y herramientas compatibles.

El modelo esta etiquetado como conversacional y declara soporte para chino (`zh`) e ingles (`en`). Se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su modificacion. La model card del repositorio GGUF no aporta detalles sobre arquitectura interna, datos de entrenamiento ni resultados de benchmarks; toda la informacion tecnica disponible se limita a los metadatos de pesos, etiquetas y los ficheros de cuantizacion publicados.

Su relevancia practica reside en la especializacion sectorial: frente a modelos generalistas del mismo tamano, un modelo afinado para agricultura puede ofrecer terminologia y respuestas mas ajustadas en consultas agronomicas, siempre que se valide su calidad con evaluaciones propias, ya que no se han publicado metricas publicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformers; detalles internos no publicados) |
| Parametros totales | 9.197.093.888 (~9,2 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q4_K_S, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS (segun metadatos); publicados en el repo: mmproj-Q8_0, mmproj-f16, Q4_K_S, f16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); modelo base original presumiblemente en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base QianqianTech/ager-1.0 en la documentacion proporcionada. Los metadatos indican que se carga con la libreria `transformers` y que el proceso de cuantizacion se realizo con `convert_type: hf` y `output_tensor_quantised: 1`, lo que sugiere un transformer denso estandar convertido desde pesos Hugging Face. El tamano de ~9,2 B de parametros es coherente con un modelo de la familia de 7-9 B, pero no se confirma la familia arquitectonica concreta.

Tampoco se detallan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La unica pista sobre el dominio es la etiqueta `agriculture` y la naturaleza conversacional declarada. La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio GGUF sugiere que el modelo base podria tener capacidad multimodal de vision, aunque la model card no lo confirma explicitamente.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational`.
- Especializacion declarada en dominio agricola (etiqueta `agriculture`), orientada a consultas agronomicas.
- Soporte de chino e ingles como idiomas principales.
- Posible capacidad multimodal: el repositorio incluye ficheros `mmproj-Q8_0` y `mmproj-f16`, suplementos multimodales de llama.cpp, lo que apunta a entrada de imagenes, aunque no se documenta formalmente.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que permite su despliegue en infraestructuras de inferencia estandar.
- No se documentan capacidades de tool calling, function calling, agentes o modo de razonamiento explicito.

## Casos de uso

- Asistencia agronomica conversacional: atender consultas de agricultores sobre plagas, fertilizacion o riego en chino o ingles, aprovechando el ajuste de dominio del modelo base.
- Soporte tecnico en cooperativas agricolas: desplegar un asistente local con la cuantizacion Q4_K_S (5,6 GB) en estaciones de trabajo con GPU de consumo para consultas internas sin conexion.
- Analisis de documentacion tecnica agraria: resumir y extraer informacion de manuales, fichas de productos fitosanitarios o informes de cosecha en los idiomas soportados.
- Prototipado de chatbots sectoriales: usar el modelo como base para experimentar con RAG sobre bases de conocimiento agricolas, dado su bajo coste de despliegue en formato GGUF.
- Educacion y formacion agraria: generar material didactico o responder preguntas de estudiantes en un contexto controlado, con validacion humana de las respuestas.
- Investigacion comparativa de modelos de dominio: emplear el modelo como referencia en estudios sobre especializacion sectorial frente a modelos generalistas del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB con Q4_K_S (recomendada por el autor como rapida), 18,5 GB con f16, y entre 3 y 10 GB para las cuantizaciones Q2_K a Q8_0 segun su tamano.
- GPU recomendadas: para f16, GPU de 24 GB o mas (RTX 3090/4090, A100, H100); para Q4_K_S, GPU de 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070).
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_S o inferiores en tarjetas de 8 GB o mas; las cuantizaciones Q2_K y Q3_K pueden caber en 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI si se dispone de los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato |
|---|---|---|---|---|---|
| ager-1.0 (este) | ~9,2 B | no disponible | Agricultura | Apache 2.0 | GGUF, safetensors |
| Modelos generalistas de ~7-9 B (p. ej. Qwen, Llama) | 7-9 B | 8K-128K tipicamente | Generalista | Variable | GGUF, safetensors |
| Modelos de dominio medico/legal de ~7 B | ~7 B | Variable | Sectorial | Variable | GGUF, safetensors |

No se dispone de datos de rendimiento comparativo del modelo frente a alternativas, por lo que la comparativa se limita a parametros, licencia y disponibilidad. No se identifican en la informacion proporcionada modelos comparables especificos del dominio agricola.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible evaluar su calidad frente a modelos generalistas sin pruebas propias.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente critico en recomendaciones agronomicas (dosis de fitosanitarios, tratamientos) donde un error puede tener consecuencias economicas o medioambientales.
- Cobertura idiomatica limitada a chino e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto desconocida, lo que impide planificar tareas de contexto largo con garantias.
- La cuantizacion Q4_K_S y las de menor bits introducen perdida de calidad respecto a f16; para tareas de precision debe validarse el impacto.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de documentacion sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles sesgos.
- El modelo base no documenta filtros de seguridad ni alineamiento; en produccion conviene anadir capas de moderacion.
- La capacidad multimodal sugerida por los ficheros `mmproj` no esta confirmada ni documentada, por lo que no debe asumirse en disenos de producto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ager-1.0-GGUF
- Modelo base: https://huggingface.co/QianqianTech/ager-1.0
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ager-1.0-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
