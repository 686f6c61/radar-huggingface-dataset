# mradermacher/Carballo-Legal-GGUF

## Resumen

Carballo-Legal-GGUF es la distribucion en formato GGUF del modelo Carballo-Legal, desarrollado originalmente por el grupo ProxectoNós (proxectonos) y cuantizado por mradermacher. Se trata de un modelo de lenguaje ajustado por instrucciones y especializado en el dominio legal y administrativo, con soporte para gallego (gl) y castellano (es). El modelo base cuenta con 7.768.117.248 parametros (aproximadamente 7,8 mil millones), lo que lo situa en la categoria de modelos de tamano medio aptos para despliegue en hardware de consumo mediante cuantizacion.

El modelo resuelve el problema de la falta de herramientas de procesamiento de lenguaje natural especializadas en el dominio juridico-administrativo en lenguas ibericas minorizadas, particularmente el gallego, un idioma con escasos recursos en el ecosistema de IA open source. El ajuste fino se realizo sobre el corpus `proxectonos/corpus_dominio_legal_administrativo`, lo que orienta sus capacidades hacia tareas de comprension y generacion de texto legal y administrativo.

Esta version GGUF es relevante porque permite ejecutar el modelo en CPU y en GPUs de consumo mediante llama.cpp y herramientas compatibles, sin necesidad de infraestructura de datacenter. La licencia MIT facilita su uso comercial y su integracion en productos, aunque las capacidades reales del modelo estan acotadas por su tamano y por el dominio especifico para el que fue ajustado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base proxectonos/Carballo-Legal; detalles de arquitectura interna no disponibles) |
| Parametros totales | 7.768.117.248 (aproximadamente 7,8 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Gallego (gl), castellano (es) |
| Licencia | MIT |
| Formato de pesos | GGUF (cuantizaciones estaticas), safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de que se trata de un transformer con aproximadamente 7,8 mil millones de parametros. El modelo fue ajustado por instrucciones (instruction-tuning) sobre el corpus `proxectonos/corpus_dominio_legal_administrativo`, un dataset de dominio legal y administrativo en gallego y castellano. No se especifica en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta publicacion no reside en la arquitectura, sino en la especializacion de dominio y en la distribucion en formato GGUF mediante cuantizaciones estaticas generadas por mradermacher. Las cuantizaciones disponibles cubren desde Q2_K (3,4 GB) hasta f16 (15,6 GB), lo que permite adaptar el modelo a distintos presupuestos de memoria. No se han publicado cuantizaciones ponderadas con imatrix para este modelo segun la model card.

## Capacidades

- Generacion de texto y respuesta conversacional en gallego y castellano.
- Comprension y generacion de texto en el dominio legal y administrativo.
- Ajuste por instrucciones (instruction-tuning), lo que permite formular peticiones en lenguaje natural.
- Capacidades multilingues limitadas a gallego y castellano.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte explicito de agentes o razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo de razonamiento extendido (thinking mode).
- No se documentan capacidades de generacion de codigo o matematicas como objetivo del ajuste.

## Casos de uso

- Redaccion y revision de documentos administrativos: el modelo puede generar borradores de escritos, instancias y comunicaciones oficiales en gallego y castellano, aprovechando su ajuste sobre corpus administrativo para emplear terminologia y formulas adecuadas.
- Atencion al ciudadano en sedes electronicas: integrado en un chatbot, puede responder consultas sobre procedimientos administrativos en gallego, un idioma con escasa cobertura en asistentes comerciales.
- Resumen de normativa y documentacion juridica: puede condensar textos legales extensos en resumenes, util para despachos y administraciones que gestionan volumenes altos de documentacion.
- Extraccion de informacion de contratos y pliegos: en pipelines de procesamiento documental, el modelo puede identificar clausulas y datos relevantes en textos contractuales en gallego o castellano.
- Traduccion asistida gallego-castellano en contexto juridico: puede apoyar la traduccion de documentos legales entre ambas lenguas, aunque sin garantia de precision terminologica sin revision humana.
- Despliegue en entornos con recursos limitados: gracias a las cuantizaciones Q4_K_S y Q4_K_M (4,8 y 5,0 GB), el modelo puede ejecutarse en estaciones de trabajo sin GPU dedicada mediante llama.cpp, lo que facilita su adopcion en pequenas administraciones locales.
- Prototipado de asistentes legales en investigación: sirve como base para experimentos academicos sobre PLN juridico en lenguas ibericas, con licencia MIT que elimina fricciones legales para publicar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5,5 GB con cuantizacion Q4_K_M (5,0 GB de fichero), alrededor de 6-7 GB con Q6_K (6,5 GB) y aproximadamente 9-10 GB con Q8_0 (8,4 GB), incluyendo overhead de contexto y runtime.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100. Cualquier GPU con al menos 6 GB de VRAM puede ejecutar cuantizaciones Q4.
- Cabe en GPU de consumo: si, en modelos como RTX 3060 12 GB (Q8_0), RTX 4060 8 GB (Q4_K_M), RTX 4070 (Q5_K_M) y superiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF. La model card indica compatibilidad con endpoints (`endpoints_compatible`). No se documenta soporte nativo de vLLM o TGI para esta version GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Carballo-Legal-GGUF | 7,8 B | No disponible | gl, es | MIT | GGUF |
| Modelos legales en castellano de 7B (genericos) | ~7 B | Variable | es, en | Variable | safetensors, GGUF |
| Modelos multilingues de 7-8B de proposito general | 7-8 B | 4K-128K segun modelo | Multiples | Variable | safetensors, GGUF |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La principal diferenciacion de Carballo-Legal frente a modelos genericos de tamano similar es su ajuste especifico al dominio legal-administrativo y su cobertura del gallego, idioma ausente en la mayoria de modelos comerciales. Como contrapartida, su base de 7,8 B parametros limita su rendimiento en razonamiento complejo frente a modelos de mayor tamano.

## Limitaciones y advertencias

- El modelo esta ajustado a un dominio especifico (legal-administrativo) y su rendimiento fuera de ese ambito puede ser inferior al de modelos de proposito general del mismo tamano.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar referencias normativas, articulos o plazos inexistentes. En contexto legal, esto es especialmente critico y exige revision humana obligatoria.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion disponible. El corpus de entrenamiento, centrado en administracion publica, puede reflejar sesgos institucionales o terminologicos propios de las fuentes.
- Limitaciones de idioma: solo se declaran gallego y castellano; el rendimiento en otros idiomas no esta garantizado.
- Longitud de contexto no documentada: se desconoce la ventana maxima, lo que dificulta planificar su uso con documentos legales extensos.
- Licencia MIT: permite uso comercial y modificacion, pero el usuario asume la responsabilidad sobre el uso de las salidas, especialmente en contextos regulados.
- No se documentan cuantizaciones imatrix para este modelo, lo que puede implicar una perdida de calidad algo mayor en cuantizaciones bajas (Q2_K, Q3_K) frente a alternativas ponderadas.
- El modelo base no incluye documentacion publica detallada sobre su entrenamiento en la informacion disponible, lo que limita la evaluacion de su procedencia de datos y posibles contaminaciones.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Carballo-Legal-GGUF
- Modelo base: https://huggingface.co/proxectonos/Carballo-Legal
- Dataset de entrenamiento: https://huggingface.co/datasets/proxectonos/corpus_dominio_legal_administrativo
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Carballo-Legal-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
