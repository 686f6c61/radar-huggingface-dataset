# mradermacher/ThinkingCap-Qwen3.8-27B-Uncensored-Heretic-GGUF

## Resumen

ThinkingCap-Qwen3.8-27B-Uncensored-Heretic-GGUF es el conjunto de cuantizaciones en formato GGUF del modelo OS-Software/ThinkingCap-Qwen3.8-27B-Uncensored-Heretic, publicadas por el desarrollador mradermacher, conocido por su catalogo de cuantizaciones comunitarias. Se trata de un modelo denso de 26.895.998.464 parametros (unos 26,9 mil millones) asociado a la familia Qwen3 segun los tags del repositorio, sobre el que se han aplicado tecnicas de desensurado (etiquetadas como "abliterated", "decensored" y "heretic") orientadas a eliminar los mecanismos de rechazo y el filtrado de contenido.

El modelo base esta publicado por OS-Software bajo acceso restringido mediante formulario, con licencia PolyForm Small Business 1.0.0, y la model card no documenta la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de evaluacion. La relevancia de esta publicacion es practica: pone a disposicion un abanico de cuantizaciones que va desde 10,8 GB (Q2_K) hasta 28,7 GB (Q8_0), lo que permite ejecutar un modelo de casi 27B en equipos de consumo con VRAM limitada, ademas de incluir ficheros mmproj que apuntan a soporte multimodal.

La ficha se ha elaborado exclusivamente con la informacion disponible en HuggingFace y en la model card del cuantizador; los apartados sin datos verificables se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags del repositorio apuntan a la familia Qwen3, tipologia transformer densa) |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9B) |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; ficheros mmproj en Q8_0 y f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | PolyForm Small Business 1.0.0 (license: other) |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Tamano del repositorio | 103,9 GB |
| Pipeline declarado | No disponible (tag "conversational") |
| Biblioteca | transformers |
| Modelo base | OS-Software/ThinkingCap-Qwen3.8-27B-Uncensored-Heretic |
| Fecha de publicacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. Los tags del repositorio ("qwen3_8", "token-efficient", "efficient-thinking") apuntan a una arquitectura transformer densa de la familia Qwen3, con optimizaciones orientadas a reducir el coste en tokens del modo de razonamiento. El numero de parametros (26.895.998.464) confirma un modelo denso de gran tamano, sin indicios de enrutamiento tipo MoE.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. Lo unico verificable es la naturaleza del ajuste posterior: el modelo ha sido sometido a un proceso de "abliteracion" o desensurado (etiquetas "uncensored", "decensored", "heretic"), una tecnica que elimina o atenua las direcciones de activacion responsables de las respuestas de rechazo, alterando el comportamiento alineado del modelo original. El cuantizador no aporta informacion sobre la metodologia concreta empleada ni sobre el impacto de este proceso en las capacidades del modelo.

## Capacidades

- Generacion de texto conversacional en ingles: el repositorio declara el tag "conversational" y el modelo esta orientado a dialogos multi-turno.
- Modo de razonamiento eficiente en tokens: los tags "efficient-thinking" y "token-efficient" sugieren un modo de pensamiento con coste reducido de tokens frente a modelos de razonamiento convencionales, aunque no se especifica su funcionamiento.
- Soporte multimodal (vision): el repositorio incluye ficheros mmproj-Q8_0 (0,7 GB) y mmproj-f16 (1,0 GB), que en llama.cpp se emplean como complemento para proyectores multimodales. La model card no detalla ni confirma esta capacidad.
- Generacion sin filtros de rechazo: el ajuste "abliterated"/"decensored" elimina buena parte de las negativas del modelo a responder segun que peticiones.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible, aunque el tag de pensamiento eficiente es compatible con flujos de razonamiento encadenado.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Capacidades especiales adicionales (audio, vision avanzada, code interpreter): no disponibles.

## Casos de uso

- Escritura creativa sin restricciones: el ajuste desensurado permite generar narrativa de ficcion con tematicas adultas, violencia o contenido moralmente ambiguo que los modelos alineados suelen rechazar, algo habitual en pipelines de novela, guion y roleplay.
- Investigacion en seguridad y alineacion (red teaming): sirve como referencia de modelo sin guardarrailes para medir como responde un sistema abliterado ante prompts adversarios y comparar con la version alineada del mismo modelo base.
- Generacion de datos sinteticos para entrenamiento: puede producir grandes volumenes de texto en ingles con menos sesgo de rechazo, util para construir datasets de instrucciones o de clasificacion que requieran ejemplos que otros modelos no generarian.
- Asistente conversacional local y privado: al distribuirse en GGUF y ejecutarse con llama.cpp u Ollama, permite desplegar un asistente de casi 27B en estaciones de trabajo sin enviar datos a servicios externos, relevante en entornos con requisitos de confidencialidad.
- Chatbots de personaje y compania virtual: el modo conversacional y la ausencia de filtros lo hacen adecuado para aplicaciones de roleplay persistente donde la consistencia del personaje importa mas que la moderacion de contenido.
- Analisis y transformacion de texto en ingles: resumen, reescritura, extraccion de informacion y clasificacion sobre documentos en ingles, aprovechando la cuantizacion Q4_K_S o Q6_K para equilibrar calidad y requisitos de VRAM.
- Pruebas de estres de infraestructura de inferencia: las once variantes de cuantizacion disponibles permiten medir el impacto de la cuantizacion en la calidad de salida y en el throughput sobre el mismo modelo, util para calibrar despliegues en produccion.
- Traduccion y adaptacion de contenido: aunque el modelo esta declarado unicamente en ingles, puede emplearse en tareas de traduccion asistida ingles a otros idiomas con verificacion humana posterior, dado que no hay evaluacion multilingue publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del cuantizador no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y no se ha localizado ninguna evaluacion del modelo base en el material proporcionado. No se ofrecen por tanto cifras comparativas de calidad, y cualquier dato de este tipo que circulase por terceros deberia verificarse de forma independiente.

## Requisitos de hardware

Los tamanos de VRAM que figuran a continuacion son estimaciones basadas en el tamano de fichero publicado para cada cuantizacion, mas un margen de entre 1 y 3 GB para cache KV, buffers de contexto y overhead del runtime. La cache KV real dependera de la longitud de contexto configurada, que no esta documentada.

| Cuantizacion | Peso en disco | VRAM estimada | GPU de referencia |
|---|---|---|---|
| Q2_K | 10,8 GB | ~12-13 GB | RTX 4080, RTX 3090, RTX 4070 Ti Super |
| Q3_K_M | 13,4 GB | ~15-16 GB | RTX 4080, RTX 4090 (uso parcial) |
| Q4_K_S | 15,7 GB | ~17-19 GB | RTX 4090, RTX 3090, A5000 |
| Q6_K | 22,2 GB | ~24-26 GB | RTX 4090 (ajustado), A6000, 2x RTX 3090 |
| Q8_0 | 28,7 GB | ~31-33 GB | A100 40 GB, 2x RTX 4090, L40S |
| f16 | ~54 GB (estimado) | ~56-60 GB | A100 80 GB, H100 80 GB |

- Cabe en GPU de consumo: si. Q2_K y Q3_K_M entran en tarjetas de 16 GB; Q4_K_S en 24 GB con holgura; Q6_K en 24 GB de forma ajustada reduciendo contexto.
- Despliegue recomendado: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui, todos ellos compatibles con GGUF. vLLM y TGI no estan optimizados para este formato.
- Ejecucion hibrida CPU+GPU: viable con llama.cpp usando offload parcial de capas, aunque el rendimiento depende del ancho de banda de memoria del sistema y de la cantidad de RAM disponible (se recomienda al menos 32 GB de RAM del sistema).
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.
- Ficheros multimodales: si se emplea la capacidad de vision, deben descargarse adicionalmente los ficheros mmproj (0,7 GB en Q8_0 o 1,0 GB en f16) y sumarlos al presupuesto de memoria.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden del conocimiento general del sector y no de la informacion proporcionada en esta busqueda; conviene verificarlos en sus repositorios oficiales. Para este modelo, los datos de rendimiento y contexto figuran como no disponibles porque no se han publicado.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-Uncensored-Heretic (GGUF) | 26,9B | No disponible | PolyForm Small Business 1.0.0 | GGUF | Version desensurada, solo ingles, acceso al modelo base mediante solicitud |
| Qwen3-32B | ~32,8B | 128K (segun documentacion de la familia) | Apache 2.0 | safetensors, GGUF, AWQ | Modelo denso de referencia de la familia, con filtros de seguridad activos |
| Gemma-3-27B-it | ~27B | 128K (con atencion de ventana deslizante) | Gemma Terms of Use | safetensors, GGUF | Tamano comparable, multimodal nativo, licencia con restricciones de uso |
| Mistral-Small-3.2-24B-Instruct | ~24B | 128K | Apache 2.0 | safetensors, GGUF | Alternativa algo menor, licencia permisiva y buena eficiencia de inferencia |

Diferencias cualitativas relevantes: frente a las alternativas, este modelo destaca por su naturaleza desensurada y por su catalogo amplio de cuantizaciones GGUF, pero queda por detras en cobertura idiomatica (solo ingles), en transparencia de datos de entrenamiento y en permisos de licencia, ya que PolyForm Small Business impone condiciones segun el tamano de la empresa. No hay datos publicados que permitan comparar calidad de salida.

## Limitaciones y advertencias

- Modelo desensurado: el ajuste "abliterated"/"decensored" elimina deliberadamente los mecanismos de rechazo. Esto implica un riesgo alto de generar contenido ofensivo, ilegal, peligroso o inexacto sin ninguna salvaguarda. No se recomienda su uso en aplicaciones orientadas al publico general sin una capa de moderacion externa.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad, por lo que debe asumirse un comportamiento de alucinacion tipico de un modelo de esta escala y verificar cualquier salida factual.
- Idioma: el repositorio declara unicamente ingles. No se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- Longitud de contexto desconocida: al no documentarse, no debe asumirse una ventana amplia. Conviene validar el comportamiento en contextos largos antes de disenar productos que dependan de ello.
- Licencia PolyForm Small Business 1.0.0: permite el uso gratuito a pequenas empresas segun los umbrales habituales de esta licencia (menos de 100 empleados y menos de 1 millon de dolares de facturacion anual). Las organizaciones que superen esos limites necesitan una licencia comercial. Ademas, el modelo base esta sujeto a acceso condicionado mediante formulario, lo que puede afectar a la redistribucion.
- Dependencia del modelo base: la calidad final depende de OS-Software/ThinkingCap-Qwen3.8-27B-Uncensored-Heretic, cuyo entrenamiento, datos y evaluacion no son publicos. El cuantizador no ha realizado ninguna validacion de calidad mas alla de la conversion.
- Cuantizaciones de baja precision: Q2_K y Q3_K_M reducen notablemente la calidad de salida. Para uso serio se recomienda Q4_K_S o superior.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, sin discusiones ni validacion de la comunidad. No hay evidencia de que el modelo haya sido probado por terceros.
- Ausencia de pesos ponderados con imatrix: el propio cuantizador advierte de que no ha publicado cuantizaciones ponderadas o con imatrix, que suelen ofrecer mejor relacion calidad/tamano en cuantizaciones bajas.
- Sin benchmarks: no existe ninguna evaluacion objetiva publicada, por lo que cualquier decision de adopcion debe basarse en pruebas propias.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ThinkingCap-Qwen3.8-27B-Uncensored-Heretic-GGUF
- Modelo base: https://huggingface.co/OS-Software/ThinkingCap-Qwen3.8-27B-Uncensored-Heretic
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#ThinkingCap-Qwen3.8-27B-Uncensored-Heretic-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
- Formulario de acceso al modelo BottleCap AI: https://docs.google.com/forms/d/e/1FAIpQLSdU8MyVP_mVx0_y55d6QCMXVyCKsQ6yg68KEqWm_EIptKB0Nw/viewform
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplexidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Sitio del patrocinador de las cuantizaciones (nethype GmbH): https://www.nethype.de/
