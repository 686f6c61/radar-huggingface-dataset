# mradermacher/ibnsina-30b-chat-GGUF

## Resumen

ibnsina-30b-chat-GGUF es la version cuantizada en formato GGUF del modelo ibnsina-llm/ibnsina-30b-chat, publicada por el usuario mradermacher, conocido por generar cuantizaciones estaticas de modelos abiertos. El modelo original es un modelo de chat e instrucciones ("instruction-tuned") con arquitectura Qwen3 MoE, orientado principalmente al idioma persa (farsi) y con soporte tambien de ingles. El repositorio contiene unicamente pesos cuantizados, no el modelo original en precision completa.

El modelo base cuenta con 30.532.122.624 parametros totales (dato extraido de los safetensors del modelo original), lo que lo situa en la categoria de modelos de ~30B. La etiqueta qwen3_moe de la model card indica que se trata de una arquitectura de mezcla de expertos (MoE) derivada de la familia Qwen3, aunque no se especifica el numero de parametros activos por token ni la longitud de contexto soportada en la informacion disponible.

La relevancia de esta publicacion radica en que permite ejecutar un modelo de 30B en hardware de consumo mediante cuantizaciones que van desde 2 bits (11,4 GB) hasta 8 bits (32,6 GB), abarcando tanto GPUs de gama alta como configuraciones con CPU y memoria RAM abundante. Esta disponible bajo licencia Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (segun etiqueta qwen3_moe de la model card); detalle de capas y configuracion no disponible |
| Parametros totales | 30.532.122.624 (dato de safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | fa (persa/farsi), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base usa safetensors |

## Arquitectura y entrenamiento

La model card indica que el modelo base sigue la arquitectura Qwen3 MoE, tal como refleja la etiqueta qwen3_moe. Se trata por tanto de un transformer con capas de mezcla de expertos, aunque no se dispone de informacion sobre el numero de expertos, el numero de expertos activados por token, la dimension oculta, el numero de capas ni la ventana de contexto. Tampoco se detalla el proceso de entrenamiento del modelo original: no hay datos sobre el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares.

Respecto al proceso de cuantizacion, el autor (mradermacher) emplea cuantizaciones estaticas generadas con llama.cpp, con convert_type hf y quantize_version 2, e indica que los tensores de salida estan cuantizados. La model card senala que las cuantizaciones ponderadas con imatrix estan disponibles en un repositorio separado (ibnsina-30b-chat-i1-GGUF), lo que sugiere que este repositorio contiene unicamente cuantizaciones estaticas sin calibracion con importancia de pesos.

## Capacidades

- Generacion de texto conversacional en persa (farsi) e ingles, con ajuste especifico para instrucciones ("instruction-tuned") y marcado como modelo de tipo chat en HuggingFace.
- Razonamiento multilingue limitado al par de idiomas declarado (fa, en); no se declaran otros idiomas.
- Capacidad de seguir instrucciones y mantener dialogos multi-turno, segun la etiqueta conversational y el tag chat.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada (aunque la arquitectura Qwen3 subyacente suele incluir modo de razonamiento, no se confirma en la model card).
- Capacidades de vision, audio o multimodalidad: no disponibles.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en persa: el modelo puede gestionar conversaciones multi-turno en farsi, un idioma con menor cobertura en modelos abiertos occidentales, lo que lo hace util para empresas que operan en Iran, Afganistan o comunidades de la diaspora. Su licencia Apache 2.0 permite desplegarlo en produccion sin coste de licencia.
- Generacion de contenido editorial en persa: redaccion, resumen y reescritura de textos en farsi, aprovechando el ajuste por instrucciones para adaptar tono y formato.
- Traduccion asistida fa-en / en-fa: al declarar ambos idiomas, puede emplearse como traductor en pipelines internos, con revision humana posterior dado el riesgo de alucinacion.
- Asistente de documentacion tecnica bilingue: generar y mantener documentacion en persa e ingles para productos de software, con el modelo actuando como reescritor o generador de borradores.
- Despliegue en local con privacidad de datos: gracias a las cuantizaciones Q4_K_S (17,6 GB) y Q4_K_M (18,7 GB), puede ejecutarse en una unica GPU de consumo con 24 GB de VRAM, lo que permite procesar datos sensibles sin enviarlos a APIs externas.
- Chatbot educativo de bajo coste: en su cuantizacion Q2_K (11,4 GB) o Q3_K_S (13,4 GB) puede correr en GPUs de gama media (por ejemplo 16 GB de VRAM), habilitando tutoria educativa en persa en entornos con hardware limitado.
- Procesamiento por lotes en CPU: con Q4_K_M (18,7 GB), el modelo cabe en la RAM de una estacion de trabajo convencional (32 GB) y puede usarse con llama.cpp para tareas offline de clasificacion, resumen o extraccion de informacion en farsi.
- Base para fine-tuning en dominio persa: al ser un modelo abierto con licencia permisiva, puede servir como punto de partida para ajustes especificos (legal, medico, financiero) en farsi, aunque requeriria reentrenamiento sobre los pesos originales, no sobre el GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia, derivada del tamano de cada fichero GGUF mas el coste de la cache KV (crece con la longitud de contexto, que no esta documentada):
  - Q2_K: ~11,4 GB de pesos.
  - Q3_K_S: ~13,4 GB.
  - Q3_K_M: ~14,8 GB.
  - Q3_K_L: ~16,0 GB.
  - IQ4_XS: ~16,7 GB.
  - Q4_K_S: ~17,6 GB (recomendado por el autor por velocidad).
  - Q4_K_M: ~18,7 GB (recomendado por el autor).
  - Q5_K_S: ~21,2 GB.
  - Q5_K_M: ~21,8 GB.
  - Q6_K: ~25,2 GB.
  - Q8_0: ~32,6 GB.
- GPU recomendadas: al tratarse de un modelo con arquitectura MoE, todos los expertos deben residir en memoria, por lo que no cabe esperar una reduccion de VRAM por activacion selectiva. Para Q4_K_M se recomienda una RTX 4090, RTX 3090 o A6000 (24 GB o mas). Para Q8_0 hacen falta 40-48 GB, es decir, A100 40 GB, A6000 Ada 48 GB o H100.
- Viabilidad en GPU de consumo: si, en la mayoria de cuantizaciones. Q2_K y Q3_K_S caben en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB); Q4_K_S y Q4_K_M caben en 24 GB (RTX 3090, RTX 4090); Q6_K y Q8_0 requieren 32 GB o mas, por lo que quedan fuera del rango de consumo estandar.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Para servir el modelo original en precision completa con mayor throughput, vLLM o TGI serian las opciones habituales, aunque el soporte de GGUF en vLLM es experimental.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparacion rigurosa. Como referencia estructural, el modelo comparte la arquitectura Qwen3 MoE declarada por el autor del modelo base, pero no se dispone de cifras de MMLU, HumanEval, GSM8K ni de contexto comparado con otras alternativas de ~30B o con modelos especializados en persa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al estar especializado en persa e ingles, es probable que presente un sesgo cultural y linguistico hacia las fuentes de entrenamiento mayoritarias en esos idiomas, pero esto no se confirma en la informacion disponible.
- Riesgo de alucinacion: no evaluado. No hay benchmarks ni evaluaciones de fiabilidad publicadas, por lo que se recomienda validacion humana en aplicaciones sensibles.
- Limitaciones de idioma: solo se declaran persa (fa) e ingles (en). No debe asumirse un rendimiento aceptable en castellano u otros idiomas.
- Limitaciones de contexto: la longitud de contexto no esta documentada. El coste de la cache KV escalara con la longitud, lo que puede hacer que cuantizaciones grandes no quepan en GPUs de 24 GB con contextos largos.
- Perdida de calidad por cuantizacion: el propio autor advierte que Q3_K_M es de "lower quality" y que Q4_K_S y Q4_K_M son "fast, recommended". Las cuantizaciones Q2_K y Q3_K_S, aunque pequenas, degradan la perplejidad de forma notable.
- Restricciones de licencia: licencia Apache 2.0, permisiva para uso comercial sin obligacion de liberar derivados. Conviene verificar la licencia del modelo base por si existieran terminos adicionales no reflejados en esta cuantizacion.
- Caveat de produccion: este repositorio es una cuantizacion de terceros, no una publicacion oficial del autor del modelo. Los ficheros GGUF de gran tamano pueden estar divididos en multiples partes; el autor remite a las guias de TheBloke para el procedimiento de concatenacion.
- Ausencia de benchmarks: no se han publicado resultados de evaluacion, lo que impide estimar su calidad relativa frente a alternativas antes de desplegarlo.

## Enlaces

- Repositorio HuggingFace (cuantizaciones estaticas GGUF): https://huggingface.co/mradermacher/ibnsina-30b-chat-GGUF
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/ibnsina-30b-chat-i1-GGUF
- Modelo base: https://huggingface.co/ibnsina-llm/ibnsina-30b-chat
- Pagina de resumen y lista de descargas del autor: https://hf.tst.eu/model#ibnsina-30b-chat-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y peticiones de modelos del autor: https://huggingface.co/mradermacher/model_requests
- nethype GmbH (empresa que cede infraestructura al autor): https://www.nethype.de/
