# mradermacher/OTel-2.0-LLM-31B-IT-i1-GGUF

## Resumen

OTel-2.0-LLM-31B-IT es un modelo de lenguaje de gran tamano especializado en el dominio de las telecomunicaciones, desarrollado originalmente por Red Hat (RedHatAI) en el marco de la iniciativa Open Telco AI, con la colaboracion de GSMA, AT&T, Microsoft, Dell y AMD. El modelo parte de una base Gemma (la model card enlaza la licencia de Gemma 4) y ha sido sometido a un post-entrenamiento de adaptacion de dominio mediante OSFT (Orthogonal Subspace Fine-Tuning), una tecnica de aprendizaje continuo que permite especializar el modelo sin perder capacidades generales.

Con 30.697.345.596 parametros totales (aproximadamente 30,7 mil millones), el modelo esta disenado para tareas de instruction-following, generacion aumentada por recuperacion (RAG) y tool calling en contextos de operadores y proveedores de telecomunicaciones. La ficha que nos ocupa es la cuantizacion GGUF realizada por mradermacher, que ofrece el modelo en una amplia gama de niveles de cuantizacion (desde IQ1_S hasta Q6_K) con pesos ponderados por imatrix, lo que facilita su despliegue en hardware de consumo y en entornos con llama.cpp u Ollama.

La relevancia actual del modelo radica en su enfoque vertical: frente a los modelos generalistas, OTel-2.0 apunta a casos de uso telco concretos (soporte a redes, configuracion, diagnostico, documentacion tecnica) y anade capacidades multimodales (la model card lo etiqueta como modelo de vision). La licencia Apache 2.0 declarada facilita su adopcion comercial, aunque conviene revisar la licencia base de Gemma enlazada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma), post-entrenado con OSFT; multimodal (vision) segun etiquetas de la model card |
| Parametros totales | 30.697.345.596 (~30,7 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, IQ3_S, Q3_K_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K (ponderadas con imatrix) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 (con enlace a licencia de Gemma 4 en la model card) |
| Formato de pesos | GGUF (cuantizaciones); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo base RedHatAI/OTel-2.0-LLM-31B-IT es un transformer denso de aproximadamente 30,7 mil millones de parametros construido sobre una base Gemma y adaptado al dominio de telecomunicaciones. La innovacion tecnica central es el uso de OSFT (Orthogonal Subspace Fine-Tuning), una variante de ajuste fino que restringe las actualizaciones a subespacios ortogonales, permitiendo el aprendizaje continuo y la adaptacion de dominio sin degradar de forma catastrofica las capacidades previamente adquiridas. Segun las etiquetas de la model card, el modelo ha sido post-entrenado para instruction-following, tool calling y RAG, y se distribuye como modelo multimodal (vision).

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset telco ni si se aplicaron fases de RLHF o DPO mas alla del post-entrenamiento mencionado. Esta version concreta es una cuantizacion GGUF realizada por mradermacher, que aplica cuantizacion ponderada por imatrix (fichero imatrix incluido en el repositorio para generar cuantizaciones propias). Los ficheros mmproj necesarios para la parte de vision, si existen, se alojan en el repositorio estatico de cuantizaciones del mismo autor.

## Capacidades

- Generacion de texto e instruction-following en ingles, con especializacion en contenido tecnico de telecomunicaciones.
- Tool calling / function calling, orientado a la integracion con sistemas y APIs del dominio telco.
- Soporte para RAG (generacion aumentada por recuperacion), pensado para consultar documentacion tecnica y bases de conocimiento de operadores.
- Capacidades multimodales (vision) segun la model card; requiere los ficheros mmproj correspondientes del repositorio estatico.
- Razonamiento multi-paso y soporte de agentes, segun las etiquetas de instruction-following y tool-calling.
- Adaptacion de dominio mediante OSFT, que preserva capacidades generales mientras especializa en telecomunicaciones.
- Compatibilidad con vLLM y con el ecosistema transformers/llama.cpp (formato GGUF).

## Casos de uso

- Soporte tecnico a operadores: el modelo puede responder consultas sobre configuracion de red, protocolos y procedimientos telco, apoyandose en RAG sobre la documentacion interna del operador para reducir alucinaciones.
- Asistente de documentacion tecnica: resumir y responder preguntas sobre especificaciones de GSMA, 3GPP o manuales de equipos, usando la ventana de contexto del modelo para ingerir fragmentos extensos.
- Automatizacion de diagnostico: integrado como agente con tool calling para consultar APIs de monitorizacion y proponer acciones de remediacion en incidencias de red.
- Generacion de scripts de configuracion: producir plantillas y comandos para equipos de red a partir de descripciones en lenguaje natural, con validacion posterior en pipelines de CI/CD.
- Analisis de imagenes tecnicas: gracias a su componente multimodal, interpretar capturas de paneles de gestion, diagramas de topologia o fotografias de equipos para asistir en tareas de campo.
- Atencion al cliente telco: gestionar conversaciones multi-turno sobre facturacion, planes y servicios, con capacidad de invocar funciones internas para consultar el estado de una linea.
- Formacion interna: generar materiales y cuestionarios para ingenieros de red a partir de la base documental de la organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: desde ~7,3 GB (i1-IQ1_S, calidad muy degradada) hasta ~25,3 GB (i1-Q6_K). La opcion recomendada i1-Q4_K_M ocupa ~18,8 GB y la i1-Q5_K_M ~21,9 GB.
- GPU recomendadas: para cuantizaciones Q4/Q5 en precision de calidad, se requiere una GPU con 24 GB o mas (RTX 3090, RTX 4090, A10G, L4 en configuraciones con offload). Para despliegues de produccion con mayor throughput, A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en cuantizaciones IQ3/IQ4 (a partir de ~13 GB) en GPUs de 16-24 GB; las cuantizaciones Q5/Q6 requieren 24 GB o reparto parcial en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y otros runners compatibles con GGUF; para el modelo base en safetensors, vLLM y transformers. La parte de vision requiere los ficheros mmproj del repositorio estatico.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| OTel-2.0-LLM-31B-IT (esta ficha) | ~30,7 B | no disponible | Telecomunicaciones, tool calling, vision | Apache 2.0 | GGUF (y safetensors en el base) |
| Modelos generalistas de ~30 B (p. ej. Gemma base) | ~27-31 B | no disponible | Proposito general | Licencia Gemma | safetensors, GGUF |
| Modelos telco de ~7-8 B | ~7-8 B | no disponible | Telecomunicaciones | variable | safetensors, GGUF |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a tamano, licencia y especializacion. Para una evaluacion cuantitativa seria necesario consultar benchmarks publicados del modelo base RedHatAI/OTel-2.0-LLM-31B-IT.

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y orientado principalmente al ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Especializacion de dominio: su ajuste a telecomunicaciones puede reducir el rendimiento en tareas generales fuera de ese ambito en comparacion con modelos generalistas del mismo tamano.
- Riesgo de alucinacion: como todo LLM, puede inventar especificaciones tecnicas, comandos o referencias normativas; en entornos de red conviene validar las salidas antes de aplicarlas.
- Licencia: la model card declara Apache 2.0 pero enlaza la licencia de Gemma 4; es imprescindible verificar los terminos aplicables antes de un uso comercial, ya que la licencia base de Gemma puede imponer restricciones adicionales.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 degradan notablemente la calidad; no se recomiendan para produccion.
- Vision: la funcionalidad multimodal depende de ficheros mmproj alojados en el repositorio estatico; sin ellos, el modelo funciona solo como texto.
- Contexto: no se ha publicado la longitud de contexto, por lo que no se puede garantizar el comportamiento en conversaciones o documentos muy largos.
- Sesgos: no se documentan evaluaciones de sesgo; al estar entrenado sobre datos telco y en ingles, puede reflejar sesgos de esas fuentes.

## Enlaces

- Repositorio Hugging Face (esta cuantizacion): https://huggingface.co/mradermacher/OTel-2.0-LLM-31B-IT-i1-GGUF
- Modelo base: https://huggingface.co/RedHatAI/OTel-2.0-LLM-31B-IT
- Cuantizaciones estaticas del mismo autor: https://huggingface.co/mradermacher/OTel-2.0-LLM-31B-IT-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OTel-2.0-LLM-31B-IT-i1-GGUF
- Preguntas frecuentes y solicitudes de modelos: https://huggingface.co/mradermacher/model_requests
- Licencia de Gemma 4 (enlazada en la model card): https://ai.google.dev/gemma/docs/gemma_4_license
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
