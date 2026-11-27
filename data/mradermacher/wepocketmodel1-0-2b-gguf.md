# mradermacher/WePocketModel1.0-2B-GGUF

## Resumen

WePocketModel1.0-2B es un modelo multimodal de aproximadamente 1.880 millones de parametros (1.881.825.088 exactos segun los pesos en safetensors) desarrollado por Tencent. Esta disenado para ejecucion en dispositivo (on-device), con capacidades de embedding multimodal y toma de decisiones estructurada. La version aqui documentada es una cuantizacion GGUF estatica realizada por mradermacher sobre el modelo base original, lo que permite su despliegue en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

El modelo pertenece a la familia de modelos compactos orientados a inferencia local, un segmento que gana relevancia a medida que crece la demanda de asistentes y pipelines de IA que funcionan sin depender de la nube. Su tamano de 2B parametros lo situa en el rango de modelos que caben comodamente en GPUs de consumo, e incluso en CPU con cuantizaciones agresivas.

La ficha se centra en la version GGUF publicada por mradermacher, que incluye tanto los pesos del modelo de lenguaje como el proyector multimodal (mmproj) necesario para el procesamiento de imagenes. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es limitada, por lo que varios apartados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal con proyector mmproj; detalles del backbone no especificados) |
| Parametros totales | 1.881.825.088 (~1,88B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base (tencent/WePocketModel1.0-2B) en la informacion proporcionada. Los tags del repositorio indican que se trata de un modelo multimodal con soporte de embedding multimodal (tag `multimodal-embedding`), representacion multinivel/multi-resolucion (tag `mrl`) y decision estructurada (tag `structured-decision`), ademas de estar orientado a ejecucion en dispositivo (`on-device`). El repositorio GGUF incluye un proyector multimodal separado (mmproj), lo que confirma la presencia de un encoder visual conectado al modelo de lenguaje.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras etapas de alineamiento. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La cuantizacion de mradermacher es estatica (quantize_version 2, output_tensor_quantised 1, convert_type hf), generada con llama.cpp a partir de los pesos en formato Hugging Face.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Procesamiento multimodal: el repositorio incluye proyector mmproj, lo que habilita entrada de imagenes junto a texto.
- Embedding multimodal: el modelo esta disenado para producir representaciones vectoriales de contenido multimodal, util para busqueda y recuperacion.
- Toma de decisiones estructurada (structured-decision): orientado a tareas donde la salida debe seguir un esquema o formato predefinido.
- Representacion multinivel (MRL): permite truncar embeddings a distintas dimensiones, util para indexacion escalable.
- Optimizado para ejecucion en dispositivo (on-device): bajo requisito de recursos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, audio: no disponible.

## Casos de uso

- Busqueda semantica multimodal local: el modelo puede generar embeddings de texto e imagen en el mismo espacio vectorial, permitiendo construir indices de busqueda que funcionan enteramente en el dispositivo sin enviar datos a la nube. La capacidad MRL permite ajustar la dimension del vector al presupuesto de almacenamiento.
- Clasificacion y enrutamiento estructurado: gracias a su orientacion a decision estructurada, puede emplearse para clasificar tickets, correos o documentos en categorias predefinidas con salida en formato JSON, integrándose en pipelines de automatizacion.
- Asistentes de accesibilidad en dispositivo: un modelo de 2B cuantizado a Q4 cabe en moviles y portatiles modestos, permitiendo describir imagenes o responder preguntas sobre contenido visual sin conexion.
- Moderacion de contenido local: analisis de texto e imagen para detectar contenido inapropiado en aplicaciones de mensajeria o foros, con inferencia en el propio dispositivo para preservar la privacidad.
- Prototipado rapido de aplicaciones multimodales: al estar disponible en GGUF, se puede cargar en llama.cpp u Ollama para validar ideas de producto con un coste de infraestructura minimo antes de escalar a modelos mayores.
- Extraccion de informacion de documentos escaneados: combinando el encoder visual y el modelo de lenguaje, puede extraer campos estructurados de facturas o formularios en entornos de oficina sin GPU dedicada.
- Sistemas de recomendacion basados en contenido visual: los embeddings multimodales permiten comparar imagenes de producto con descripciones textuales para generar recomendaciones en tiendas online.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q2_K, 1,3-1,4 GB con Q4_K_S/Q4_K_M, 1,7 GB con Q6_K y 2,1 GB con Q8_0. El proyector multimodal anade 0,5 GB (Q8_0) o 0,8 GB (f16).
- GPU recomendadas: cualquier GPU con al menos 2-3 GB de VRAM libre; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. El modelo esta pensado para hardware mucho mas modesto.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta moderna e incluso en GPUs integradas con memoria compartida suficiente.
- Ejecucion en CPU: viable con cuantizaciones Q4 y Q2; el modelo de 2B es manejable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El repositorio esta marcado como `endpoints_compatible`. Para los pesos originales en safetensors, transformers con el modelo base de Tencent.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| WePocketModel1.0-2B (esta ficha) | ~1,88B | no disponible | si (mmproj) | apache-2.0 | GGUF, safetensors |
| Qwen2-VL-2B | ~2B | no disponible en esta ficha | si | apache-2.0 | safetensors, GGUF |
| SmolVLM-2B | ~2B | no disponible en esta ficha | si | apache-2.0 | safetensors, GGUF |

La comparativa se limita a modelos de tamano y perfil similares (multimodales compactos con licencia permisiva). No se dispone de datos de rendimiento comparativo para WePocketModel1.0-2B en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de calidad.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su rendimiento en castellano u otros idiomas no esta garantizado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; como todo modelo entrenado con datos web, es probable que herede sesgos de esos datos.
- Riesgo de alucinacion: presente, como en cualquier modelo generativo de este tamano; la verificacion de salidas es recomendable en produccion.
- Contexto: se desconoce la longitud maxima de contexto, lo que impide garantizar conversaciones largas o documentos extensos.
- Licencia: apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base original de Tencent por si anaden restricciones adicionales.
- Cuantizaciones agresivas (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El modelo esta orientado a dispositivo y su capacidad de razonamiento complejo es limitada en comparacion con modelos mayores; no es adecuado para tareas que requieran conocimiento factual extenso o razonamiento multi-paso sofisticado.
- La informacion publica sobre el modelo base es escasa; antes de usarlo en produccion conviene validar el comportamiento real con un conjunto de evaluacion propio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WePocketModel1.0-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WePocketModel1.0-2B
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/WePocketModel1.0-2B-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#WePocketModel1.0-2B-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
