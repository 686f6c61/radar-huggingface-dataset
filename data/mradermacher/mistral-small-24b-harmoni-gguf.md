# mradermacher/mistral-small-24b-harmoni-GGUF

## Resumen

mistral-small-24b-harmoni-GGUF es la version cuantizada en formato GGUF del modelo ssoni-harmoni/mistral-small-24b-harmoni, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos abiertos para su uso con llama.cpp y herramientas compatibles. El modelo original parte de la familia Mistral Small, con 23.572.403.200 parametros totales (aproximadamente 23,6 mil millones) segun los pesos en safetensors del repositorio base.

El modelo base es un fine-tune de Mistral Small orientado a conversacion, segun indican las etiquetas del repositorio (conversational, endpoints_compatible). La model card del repositorio cuantizado no aporta informacion sobre el proceso de entrenamiento del modelo original, los datos utilizados ni los resultados de evaluacion, por lo que gran parte de las especificaciones tecnicas deben considerarse no disponibles.

La relevancia de esta publicacion radica en que ofrece el modelo en multiples niveles de cuantizacion (desde Q2_K de 9,0 GB hasta Q8_0 de 25,2 GB), lo que permite ejecutarlo en hardware de consumo con VRAM limitada. Ademas, incluye ficheros mmproj (multi-modal supplement), lo que sugiere que el modelo base podria tener capacidades multimodales, aunque no se detalla en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Mistral Small; arquitectura transformer presumible, no confirmada en la informacion) |
| Parametros totales | 23.572.403.200 (23,6 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones) y safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo base ssoni-harmoni/mistral-small-24b-harmoni en la documentacion proporcionada. Por el nombre y el numero de parametros, se trata de un derivado de la familia Mistral Small de Mistral AI, pero no se confirma en la informacion disponible si mantiene la arquitectura transformer densa original, la ventana de contexto, ni si incorpora innovaciones como sliding window attention o decodificacion especulativa.

Tampoco se documentan los datos de entrenamiento, el numero de tokens utilizados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. La model card del repositorio cuantizado se limita a describir el proceso de cuantizacion estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf) y a listar los ficheros generados. No se han publicado cuantizaciones ponderadas con imatrix por parte de este autor en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como conversational y orientado a dialogos multi-turno.
- Compatibilidad con endpoints: la etiqueta endpoints_compatible sugiere integracion con APIs de inferencia tipo Hugging Face Inference Endpoints.
- Posible soporte multimodal: la presencia de ficheros mmproj (multi-modal supplement) indica que el modelo base podria procesar imagenes junto a texto, aunque no se detalla la naturaleza exacta de esta capacidad.
- Capacidades de razonamiento, codigo y matematicas: no documentadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Modo thinking: no disponible.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: gracias a las cuantizaciones Q4_K_M (14,4 GB) y Q5_K_M (16,9 GB), el modelo puede ejecutarse en GPUs con 16-24 GB de VRAM usando llama.cpp u Ollama, lo que permite experimentar con un modelo de 23,6 mil millones de parametros sin infraestructura de datacenter.
- Prototipado de asistentes conversacionales: el modelo esta etiquetado como conversational, por lo que es adecuado para construir chatbots de prototipo en ingles que requieran un modelo de mayor calidad que las alternativas de 7-8 mil millones de parametros.
- Evaluacion de fine-tunes comunitarios: al ser una cuantizacion de un fine-tune de Mistral Small, sirve para comparar el comportamiento del fine-tune frente al modelo base original en tareas de dialogo, sin necesidad de descargar los pesos completos en safetensors.
- Inferencia en entornos con VRAM limitada: la cuantizacion Q2_K (9,0 GB) permite ejecutar el modelo en GPUs de 12 GB, aunque con perdida de calidad notable, util para pruebas rapidas o entornos de desarrollo.
- Integracion en pipelines de Hugging Face: la etiqueta endpoints_compatible facilita el despliegue mediante Inference Endpoints para servicios de generacion de texto en ingles.
- Experimentacion multimodal (si se confirma): los ficheros mmproj permiten, en teoria, combinar el modelo con un proyector multimodal en llama.cpp para tareas de vision-lenguaje, aunque esta capacidad no esta documentada en detalle.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (segun cuantizacion, sin contar overhead de contexto):
  - Q2_K: ~9,0 GB
  - Q3_K_S: ~10,5 GB
  - Q3_K_M: ~11,6 GB
  - Q3_K_L: ~12,5 GB
  - IQ4_XS: ~13,0 GB
  - Q4_K_S: ~13,6 GB
  - Q4_K_M: ~14,4 GB
  - Q5_K_S: ~16,4 GB
  - Q5_K_M: ~16,9 GB
  - Q6_K: ~19,4 GB
  - Q8_0: ~25,2 GB
  - mmproj adicional: 0,6 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: para Q4_K_M o Q5_K_M se recomienda una RTX 4090 (24 GB) o una A100/H100 para mayor throughput; para Q8_0 se necesita una GPU con al menos 32 GB (A100 40 GB, H100, o RTX 6000 Ada).
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con cuantizaciones hasta Q6_K; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) con Q4_K_S o IQ4_XS; en GPUs de 12 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (no confirmado para este fine-tune concreto).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mistral-small-24b-harmoni-GGUF | 23,6 B | no disponible | no disponible | GGUF | Fine-tune comunitario de Mistral Small, solo ingles |
| Mistral Small 24B (original) | ~24 B | no disponible en esta ficha | Apache 2.0 (segun Mistral, no confirmado para este derivado) | safetensors, GGUF | Modelo base de referencia de Mistral AI |
| Mistral Small 22B (anterior generacion) | ~22 B | 32k (segun documentacion publica de Mistral) | Apache 2.0 | safetensors, GGUF | Generacion previa de la familia Small |
| Gemma 2 27B | ~27 B | 8k | Gemma license | safetensors, GGUF | Alternativa de Google de tamano similar |

Nota: los datos de contexto y licencia de las alternativas se basan en conocimiento publico general y no se han verificado en la informacion proporcionada; deben confirmarse en las fuentes oficiales antes de usarse en produccion.

## Limitaciones y advertencias

- La licencia no esta especificada en el repositorio, lo que impide confirmar si se permite uso comercial. Es imprescindible verificar la licencia del modelo base ssoni-harmoni/mistral-small-24b-harmoni antes de cualquier despliegue en produccion.
- El modelo solo declara soporte para ingles (en), por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- No se documentan sesgos conocidos, pero al ser un fine-tune comunitario sin informacion sobre datos de entrenamiento, el riesgo de sesgos y alucinaciones es dificil de evaluar.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S) degradan notablemente la calidad de generacion; el autor recomienda Q4_K_S o Q4_K_M como equilibrio rapido y Q6_K/Q8_0 para maxima calidad.
- No se han publicado cuantizaciones ponderadas con imatrix para este modelo, lo que podria reducir la calidad respecto a otras cuantizaciones del ecosistema.
- La capacidad multimodal sugerida por los ficheros mmproj no esta documentada; su funcionamiento real no esta verificado.
- El modelo base es un fine-tune comunitario con muy poca traccion (155 descargas, 0 likes en el repositorio cuantizado), lo que implica ausencia de validacion por parte de la comunidad.
- No hay benchmarks publicados, por lo que no se puede comparar objetivamente su rendimiento frente a alternativas.

## Enlaces

- Repositorio Hugging Face del modelo cuantizado: https://huggingface.co/mradermacher/mistral-small-24b-harmoni-GGUF
- Modelo base: https://huggingface.co/ssoni-harmoni/mistral-small-24b-harmoni
- Pagina de descargas del autor: https://hf.tst.eu/model#mistral-small-24b-harmoni-GGUF
- Repositorio de peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
