# mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-GGUF

## Resumen

Swift-Qwen3.8-27B-Uncensored-MTP-GGUF es una cuantizacion estatica en formato GGUF del modelo ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP, publicada por mradermacher. El modelo subyacente es una variante "abliterated" y "uncensored" de la familia Qwen3.8, con 27.320.697.856 parametros totales (aproximadamente 27,3 mil millones), disenada para eliminar las capas de rechazo y moderacion tipicas de los modelos alineados comercialmente. La etiqueta "MTP" sugiere soporte de multi-token prediction, aunque la model card no detalla su implementacion.

El repositorio ofrece 12 cuantizaciones GGUF que van desde Q2_K (11,0 GB) hasta Q8_0 (29,1 GB), ademas de dos ficheros mmproj (Q8_0 y f16) que indican soporte multimodal de entrada. Esto convierte al modelo en una opcion practica para despliegue local con llama.cpp u Ollama en hardware de consumo, algo imposible con los pesos originales en safetensors.

La relevancia actual del modelo radica en su naturaleza sin censura combinada con un tamano manejable: permite a investigadores estudiar el comportamiento de modelos abliterated en tareas de generacion libre, y a desarrolladores desplegar asistentes conversacionales sin filtros en entornos controlados. La licencia swift-open-license-1.0 impone condiciones que deben revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8; detalles de capas y atencion no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | swift-open-license-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 190,8 GB (incluye todas las cuantizaciones) |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-10-06 |
| Descargas / likes | 587 / 3 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Por la nomenclatura (Qwen3.8) y el tamano (27,3 B parametros), se trata de un transformer decoder-only de la familia Qwen, pero no se especifican numero de capas, dimensiones ocultas, mecanismo de atencion ni si emplea GQA. La etiqueta "MTP" en el nombre apunta a multi-token prediction, una tecnica de entrenamiento que permite al modelo predecir varios tokens futuros por paso, lo que puede acelerar la decodificacion especulativa, pero la model card no aporta detalles sobre como se implementa.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. El termino "abliterated" indica que se aplico una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones para eliminar el comportamiento de negativa, y "uncensored" refuerza que se ha reducido la moderacion. El autor de la cuantizacion, mradermacher, solo documenta el proceso de conversion a GGUF (quantize_version 2, output_tensor_quantised 1, convert_type hf), sin informacion sobre el entrenamiento original.

## Capacidades

- Generacion de texto conversacional en ingles, con modo conversacional declarado en los tags.
- Comportamiento sin censura: el modelo ha sido abliterated para reducir rechazos y respuestas evasivas.
- Soporte multimodal de entrada: la presencia de ficheros mmproj (Q8_0 y f16) indica capacidad de procesar imagenes junto a texto.
- Posible multi-token prediction (MTP) segun la nomenclatura, sin documentacion tecnica que lo confirme.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues limitadas al ingles segun la metadata del modelo.
- No se documenta modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Investigacion sobre alineacion y censura: el modelo permite estudiar como la ablacion de direcciones de rechazo afecta a la distribucion de respuestas en tareas sensibles, comparando con el modelo base alineado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados suelen negarse; el formato GGUF permite ejecutarlo en local con llama.cpp.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB) cabe en GPUs de consumo con 24 GB de VRAM, lo que facilita prototipado sin infraestructura cloud.
- Analisis de documentos con imagenes: los ficheros mmproj permiten alimentar capturas, diagramas o paginas escaneadas junto a instrucciones de texto para extraccion de informacion.
- Evaluacion de riesgos en pipelines de IA: sirve como caso de prueba para medir la eficacia de filtros de salida y sistemas de moderacion externos sobre un modelo deliberadamente sin censura.
- Fine-tuning y destilacion: al estar disponible en GGUF y con pesos base en safetensors, puede usarse como punto de partida para experimentos de adaptacion (LoRA) en ingles sobre dominios especializados.
- Chatbot de rol o acompanamiento conversacional: conversaciones multi-turno en ingles donde el usuario busca respuestas sin evasivas, ejecutado en local para preservar privacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~11 GB, viable en GPUs de 12 GB.
  - Q3_K_M: ~13,6 GB, viable en GPUs de 16 GB.
  - Q4_K_M: ~16,9 GB, recomendada para GPUs de 24 GB (RTX 3090, RTX 4090).
  - Q5_K_M: ~19,6 GB, ajustada en 24 GB con contexto moderado.
  - Q6_K: ~22,5 GB, al limite en 24 GB.
  - Q8_0: ~29,1 GB, requiere 32 GB o mas (A100 40 GB, RTX A6000, H100).
- GPU recomendadas: RTX 4090 o RTX 3090 para cuantizaciones Q4/Q5; A100 40 GB, H100 o RTX A6000 para Q8_0 y contextos largos.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) con Q4_K_M o Q5_K_M; en GPUs de 12-16 GB con Q2_K o Q3.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; los ficheros mmproj requieren un runtime con soporte multimodal (por ejemplo, llama.cpp con llava).
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantizacion elegida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-Qwen3.8-27B-Uncensored-MTP-GGUF (este) | 27,3 B | no disponible | swift-open-license-1.0 | GGUF | Abliterated, multimodal, 12 cuantizaciones |
| ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP (base) | 27,3 B | no disponible | swift-open-license-1.0 | safetensors | Modelo original sin cuantizar |
| Qwen3-32B (referencia de familia) | 32 B | no disponible | Apache 2.0 (segun version) | safetensors, GGUF | Alineado, sin ablacion; datos no verificados en esta busqueda |
| Gemma 2 27B (referencia de tamano) | 27 B | no disponible | Gemma license | safetensors, GGUF | Alineado, sin ablacion; datos no verificados en esta busqueda |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: puede generar contenido ofensivo, ilegal o peligroso; no es apto para exposicion directa a usuarios sin moderacion externa.
- Riesgo elevado de alucinacion, agravado por la falta de benchmarks publicados que permitan estimar su fiabilidad.
- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta verificado y probablemente sea inferior.
- Longitud de contexto no documentada: no se puede planificar su uso en tareas de contexto largo sin pruebas empiricas.
- Licencia swift-open-license-1.0: es una licencia no estandar; deben revisarse los terminos exactos antes de cualquier uso comercial o redistribucion.
- La ablacion puede degradar capacidades generales (razonamiento, codigo, matematicas) respecto al modelo original alineado; no hay datos que cuantifiquen esa perdida.
- El repositorio pesa 190,8 GB por incluir todas las cuantizaciones; conviene descargar solo el fichero necesario.
- No se documenta soporte de tool calling ni de agentes, por lo que integrarlo en pipelines automatizados requiere validacion previa.
- La fecha de creacion (2026) y la escasez de descargas (587) sugieren poca validacion comunitaria; tratar con cautela en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-GGUF
- Modelo base: https://huggingface.co/ajgazin/Swift-Qwen3.8-27B-Uncensored-MTP
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Swift-Qwen3.8-27B-Uncensored-MTP-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Swift-Qwen3.8-27B-Uncensored-MTP-GGUF
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
