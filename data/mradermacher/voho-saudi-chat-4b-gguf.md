# mradermacher/voho-saudi-chat-4b-GGUF

## Resumen

voho-saudi-chat-4b-GGUF es la version cuantizada en formato GGUF del modelo VohoAI/voho-saudi-chat-4b, un modelo conversacional de aproximadamente 4.022 millones de parametros (4B) especializado en arabe, y de forma especifica en el dialecto arabe saudita (najdi). La cuantizacion la ha realizado mradermacher, un autor habitual en la publicacion de versiones GGUF de modelos abiertos, y el resultado se distribuye bajo licencia Apache 2.0.

El problema que resuelve es doble. Por un lado, la mayoria de los modelos multilingues abiertos rinden de forma notablemente peor en arabe dialectal que en arabe estandar moderno (MSA), lo que limita su uso en productos dirigidos al mercado saudita. Por otro, el formato GGUF permite ejecutar el modelo en hardware de consumo mediante llama.cpp y sus derivados, algo que no es posible con los pesos originales en safetensors si no se dispone de GPU dedicada.

El modelo esta etiquetado por su autor con los descriptores *conversational* y *voice-agent*, lo que sugiere que fue disenado para dialogos multi-turno y para integrarse en pipelines de asistentes de voz. Se ha entrenado con los conjuntos de datos 2A2I/Arabic_Aya y arbml/CIDAR, ambos de dominio publico en HuggingFace. No se ha publicado informacion sobre la arquitectura interna, la longitud de contexto ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no especifica si es transformer decoder-only, MoE o hibrida; el pipeline de transformers y la cuantizacion GGUF son compatibles con un decoder-only denso) |
| Parametros totales | 4.022.468.096 (dato real de safetensors del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K (cuantizaciones estaticas; no hay versiones imatrix/weighted publicadas por el autor de la cuantizacion) |
| Idiomas soportados | arabe (ar), con especializacion declarada en arabe saudita y dialecto najdi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura concreta del modelo base VohoAI/voho-saudi-chat-4b: ni el numero de capas, ni el tipo de atencion, ni si emplea decodificacion especulativa, atencion lineal o alguna variante hibrida. Tampoco se documenta la longitud de contexto soportada. El unico dato estructural fiable es el recuento de parametros (4.022.468.096), coherente con un modelo denso de la familia de 4B, y el hecho de que la cuantizacion se ha realizado sin fusion de tensores especiales (`skip_mmproj` vacio en la metadata) y con `output_tensor_quantised: 1`.

En cuanto a los datos, la model card declara dos conjuntos: 2A2I/Arabic_Aya y arbml/CIDAR. El segundo es un corpus de dialectos arabes ampliamente utilizado para ajuste de modelos dialectales. No se especifica el numero de tokens de entrenamiento, la composicion exacta de la mezcla, ni si hubo fases de RLHF, DPO o ajuste supervisado adicional. La principal aportacion tecnica de este repositorio no es arquitectonica, sino de distribucion: la conversion a GGUF con doce niveles de cuantizacion distintos, desde 1,8 GB (Q2_K) hasta 8,2 GB (f16), lo que abre el modelo a un rango amplio de hardware.

## Capacidades

- Generacion de texto conversacional multi-turno en arabe, con especial enfasis en registro coloquial saudita.
- Comprension y produccion de dialecto najdi, ademas de arabe estandar moderno.
- Orientacion a flujos de asistente de voz: el autor lo etiqueta explicitamente como *voice-agent*, lo que normalmente implica respuestas breves y adecuadas para sintesis de voz.
- Conversacion de dominio general: no se declaran capacidades especificas de razonamiento matematico, generacion de codigo ni uso de herramientas.
- Soporte de tool calling / function calling: no disponible, no se menciona en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible.
- Vision, audio nativo o modo *thinking*: no disponible; el repositorio no incluye fichero mmproj ni proyector multimodal.
- Capacidades multilingues: limitadas al arabe; no se declara soporte de ingles ni de otras lenguas.

## Casos de uso

- Asistentes conversacionales para el mercado saudita: el modelo puede mantener dialogos multi-turno en dialecto najdi, lo que reduce la friccion frente a modelos que solo responden en arabe estandar moderno. Es adecuado cuando la audiencia objetivo usa coloquial en canales de mensajeria.
- Atencion al cliente en telecomunicaciones o banca regional: con la cuantizacion Q4_K_M (2,6 GB) se puede desplegar en una sola GPU de gama media o incluso en CPU, cubriendo consultas frecuentes en dialecto sin depender de APIs externas.
- Backend de texto para asistentes de voz: el modelo esta etiquetado como *voice-agent*; se puede encadenar ASR en arabe hacia el modelo y despues TTS, y su tamano de 4B mantiene la latencia de generacion lo bastante baja para respuestas habladas cortas.
- Clasificacion y enrutado de intenciones en arabe dialectal: al estar ajustado en dialecto, puede utilizarse como componente de comprension en un sistema mayor, extrayendo intencion y entidades de mensajes de usuario antes de derivar a otro servicio.
- Generacion de respuestas para bots de redes sociales y foros: el registro coloquial es mas apropiado que el de un modelo entrenado solo en MSA para plataformas donde los usuarios escriben en najdi.
- Prototipado e investigacion sobre dialectologia arabe: util como linea base ajustada en dialecto para comparar tecnicas de ajuste fino, traduccion dialecto-MSA o evaluacion de sesgo dialectal.
- Despliegue en entornos sin conectividad o con requisitos de soberania de datos: la licencia Apache 2.0 y el formato GGUF permiten ejecucion completamente local en hardware modesto, algo relevante para administraciones y empresas con restricciones de residencia de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de HuggingFace incluyen puntuaciones de MMLU, HumanEval, GSM8K ni de evaluaciones especificas de arabe o de dialecto. Tampoco se proporciona comparacion alguna con modelos de referencia.

## Requisitos de hardware

Los tamanos de fichero son datos reales del repositorio; las estimaciones de VRAM anaden un margen aproximado para cache KV y overhead del runtime.

- VRAM estimada para inferencia (aproximada, a partir del tamano de cada cuantizacion):
  - Q2_K: 1,8 GB de fichero, en torno a 2,5-3 GB de VRAM.
  - Q3_K_S / Q3_K_M / Q3_K_L: 2,0-2,3 GB de fichero, en torno a 3-4 GB.
  - IQ4_XS: 2,4 GB de fichero, en torno a 3,5-4,5 GB.
  - Q4_K_S / Q4_K_M: 2,5-2,6 GB de fichero, en torno a 4-5 GB. Es el rango recomendado por el autor de la cuantizacion ("fast, recommended").
  - Q5_K_S / Q5_K_M: 2,9-3,0 GB de fichero, en torno a 4,5-5,5 GB.
  - Q6_K: 3,4 GB de fichero, en torno a 5-6 GB ("very good quality").
  - Q8_0: 4,4 GB de fichero, en torno a 6-7 GB.
  - f16: 8,2 GB de fichero, en torno a 10-12 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas cubre Q4_K_M y Q5_K_M con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4). Para f16 o Q8_0 con contexto largo conviene una GPU de 16-24 GB (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: si. Con las cuantizaciones Q4 y Q5 cabe en GPUs de 6-8 GB; con Q2_K y Q3_K incluso en equipos con 4 GB de VRAM o en modo CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, KoboldCpp, llama-cpp-python, text-generation-webui y cualquier runtime compatible con GGUF. El soporte de GGUF en vLLM es experimental y limitado; TGI no es la via natural para este formato.
- CPU: al ser un modelo de 4B, Q4_K_M (2,6 GB) funciona de forma aceptable en CPU con RAM suficiente (8-16 GB), aunque con throughput muy inferior al de GPU.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo.
- Espacio en disco: el repositorio completo ocupa 36,4 GB, ya que incluye las doce cuantizaciones. Conviene descargar unicamente el fichero deseado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. La siguiente tabla recoge unicamente lo que puede afirmarse con la informacion disponible; el resto de celdas queda marcado como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Formato |
|---|---|---|---|---|---|
| voho-saudi-chat-4b (este GGUF) | 4,02B | no disponible | no disponible | Apache 2.0 | GGUF |
| VohoAI/voho-saudi-chat-4b (base) | 4,02B | no disponible | no disponible | Apache 2.0 | safetensors |
| Otras alternativas de arabe dialectal (por ejemplo la familia Jais, AceGPT o Fanar) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se ha podido verificar en la informacion proporcionada el rendimiento relativo frente a otras familias de modelos arabes, ni sus tamanos o licencias exactas. Cualquier comparacion cuantitativa requeriria ejecutar una evaluacion propia.

## Limitaciones y advertencias

- Sesgo dialectal: el ajuste esta orientado a arabe saudita y najdi. Es probable que el rendimiento caiga en otros dialectos arabes (egipcio, levantino, magrebi) y que el registro coloquial saudita se imponga incluso cuando el usuario escribe en arabe estandar.
- Idioma unico: solo se declara soporte de arabe. No hay evidencia de competencia en ingles, castellano ni otras lenguas, y forzar su uso en esos idiomas producira resultados poco fiables.
- Riesgo de alucinacion: al no haber benchmarks publicados ni documentacion sobre el proceso de ajuste (RLHF, DPO, filtrado de datos), no hay garantia sobre la tasa de alucinacion ni sobre la fidelidad factual.
- Ausencia de evaluaciones: cero resultados de benchmarks y cero descargas o valoraciones en el momento de redactar esta ficha. No hay validacion independiente del modelo.
- Metadatos incompletos: se desconoce la longitud de contexto, la arquitectura exacta y el volumen de tokens de entrenamiento, lo que dificulta planificar despliegues con requisitos de contexto largo.
- Cuantizacion de terceros: los GGUF los ha generado mradermacher, no el autor original. Son cuantizaciones estaticas; no se han publicado versiones imatrix o weighted, que suelen ofrecer mejor relacion calidad/tamano en niveles bajos.
- Perdida de calidad en cuantizaciones agresivas: Q2_K y Q3_K_S reducen el fichero hasta 1,8-2,0 GB, pero el propio autor advierte de menor calidad en Q3_K_M. Para produccion es preferible Q4_K_M o superior.
- Sin capacidades multimodales: aunque la etiqueta *voice-agent* sugiere uso en voz, el repositorio no incluye proyector mmproj ni encoder de audio. La voz debe gestionarse con componentes externos (ASR y TTS).
- Licencia permisiva pero sin garantias: Apache 2.0 permite uso comercial y modificacion, pero no implica que el modelo sea adecuado para dominios regulados (medico, legal, financiero) sin validacion previa.
- Caveat de produccion: la ausencia de soporte documentado de tool calling y de modo agente limita su integracion en pipelines que requieran llamadas a funciones o razonamiento multi-paso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/voho-saudi-chat-4b-GGUF
- Modelo base: https://huggingface.co/VohoAI/voho-saudi-chat-4b
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#voho-saudi-chat-4b-GGUF
- Dataset 2A2I/Arabic_Aya: https://huggingface.co/datasets/2A2I/Arabic_Aya
- Dataset arbml/CIDAR: https://huggingface.co/datasets/arbml/CIDAR
- Peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
