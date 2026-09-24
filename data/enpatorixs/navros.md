# enpatorixs/navros

## Resumen

Navros es una familia de modelos de lenguaje publicada por Vareoz bajo el identificador de HuggingFace `enpatorixs/navros`, disenada para ejecucion local en dispositivo (on-device), tanto en telefonos Android como en escritorio. A diferencia de las distribuciones habituales, los pesos no se publican en safetensors ni GGUF, sino en un formato propietario con extension `.navros` que consume un motor de inferencia propio del mismo autor. El repositorio ocupa 15,7 GB e incluye tres archivos de pesos y un catalogo (`modelos.json`) con la URL, el tamano en bytes, el hash SHA-256 y la RAM minima de cada uno, de modo que la aplicacion Android asociada los descarga automaticamente sin intervencion manual.

La familia se compone de tres variantes: `navros-0.2-q4.navros` (4,8 GB, cuantizacion de 4 bits, orientada a moviles con 8 GB de RAM o mas), `navros-0.2-q8.navros` (7,9 GB, cuantizacion de 8 bits, practicamente sin perdida, para moviles de 12 GB o mas y escritorio) y `navros-nano-0.0-q4.navros` (3,0 GB, para dispositivos con menos de 8 GB, que segun la model card no incorpora el entrenamiento de Vareoz y es mas limitado). La model card no declara numero de parametros, longitud de contexto, arquitectura ni datos de entrenamiento.

Su relevancia actual radica en el nicho de agentes locales con soporte nativo de castellano e ingles: la etiqueta `agent` y la propia descripcion de la app apuntan a un asistente que se ejecuta sin conexion y sin enviar datos a la nube. Sin embargo, con cero descargas y cero likes en el momento de la consulta, y sin benchmarks publicados, se trata de un artefacto sin validacion externa verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4 (4 bits) y Q8 (8 bits); variante nano en Q4 |
| Idiomas soportados | espanol (es) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.navros` (formato propietario del motor de Vareoz); no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 15,7 GB |
| Archivos de pesos | `navros-0.2-q4.navros` (4,8 GB), `navros-0.2-q8.navros` (7,9 GB), `navros-nano-0.0-q4.navros` (3,0 GB) |
| Requisitos de RAM declarados | 8 GB o mas (q4), 12 GB o mas (q8), menos de 8 GB (nano q4) |
| Catalogo | `modelos.json` (url, bytes, sha256 y RAM minima por archivo) |
| Fecha de publicacion | 24 de septiembre de 2026 |
| Ultima actualizacion | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del modelo en la model card ni en los metadatos de HuggingFace. No consta si se trata de un transformer denso, una mezcla de expertos (MoE), un modelo de espacio de estados (SSM) o una arquitectura hibrida, ni el numero de parametros, capas, cabezas de atencion o dimension oculta. Tampoco se especifica la longitud de contexto soportada, un dato critico para evaluar su uso en tareas agenticas multi-turno.

Respecto al entrenamiento, la unica referencia disponible es indirecta: la model card distingue `navros-0.2` de `navros-nano-0.0` indicando que este ultimo carece del "entrenamiento de Vareoz" y es "mas limitado", lo que sugiere que la variante nano es una base generica adaptada o recortada. No hay datos sobre el volumen de tokens de entrenamiento, la composicion del corpus, el uso de RLHF, DPO u otras tecnicas de alineamiento, ni sobre innovaciones de inferencia como decodificacion especulativa o atencion lineal. Los archivos `NAVROS.json` y `NAVROS-nano.json`, citados en la propia model card como fuente de procedencia, no han sido analizados en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en espanol e ingles, segun los idiomas declarados en las etiquetas del repositorio.
- Ejecucion local en dispositivo: los pesos estan empaquetados para un motor propio que corre en Android y escritorio, sin dependencia de servicios en la nube.
- Comportamiento de agente: la etiqueta `agent` y la descripcion de la aplicacion ("trae el agente dentro") indican soporte previsto para flujos de tarea, aunque no se detalla el mecanismo ni el conjunto de herramientas disponibles.
- Descarga y gestion autonomica de pesos por parte de la aplicacion cliente mediante el catalogo `modelos.json` con verificacion por SHA-256.
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling o modo de pensamiento: no disponible en la informacion publicada.

## Casos de uso

- Asistente conversacional sin conexion en Android: el modelo se ejecuta sobre el motor local con la variante q4 en telefonos de 8 GB o mas, lo que permite conversaciones en espanol sin enviar texto del usuario a servidores externos, un requisito habitual en entornos con datos personales o sanitarios.
- Agente de automatizacion de tareas en el propio dispositivo: al declararse como modelo de tipo `agent` y venir acompanado de una aplicacion que lo sirve, encaja en escenarios de orquestacion de acciones locales (creacion de notas, gestion de archivos, respuesta a mensajes) siempre que el motor exponga las herramientas correspondientes.
- Procesamiento de documentos confidenciales en escritorio: con la variante q8 (7,9 GB) instalada en un equipo de sobremesa, se pueden resumir o extraer datos de contratos e informes internos sin que el contenido salga de la maquina.
- Asistente bilingue espanol-ingles para soporte interno: el soporte declarado de ambos idiomas lo hace utilizable en equipos de trabajo mixtos, por ejemplo para redactar respuestas o traducir correos dentro de una organizacion.
- Despliegue en dispositivos de gama baja: la variante nano q4 (3,0 GB) permite ofrecer funciones basicas de asistencia en moviles con menos de 8 GB de RAM, donde modelos de mayor tamano no caben; la propia model card advierte de que es mas limitada al carecer del entrenamiento de Vareoz.
- Integracion en aplicaciones Android de terceros: al distribuirse como archivos `.navros` con un catalogo de verificacion, un desarrollador puede empaquetar el motor y el modelo en una app para ofrecer funciones de texto sin coste de API por token.
- Escenarios de privacidad por diseno o cumplimiento normativo: la ausencia de llamadas a servicios externos en el circuito de inferencia simplifica el analisis de tratamiento de datos, aunque depende de que el motor no incorpore telemetria, extremo no documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto ningun articulo, informe o analisis independiente sobre este modelo. Tampoco se han publicado mediciones de latencia ni de tokens por segundo.

## Requisitos de hardware

- RAM declarada por el autor: 8 GB o mas para `navros-0.2-q4.navros` (4,8 GB), 12 GB o mas para `navros-0.2-q8.navros` (7,9 GB) y menos de 8 GB para `navros-nano-0.0-q4.navros` (3,0 GB). Son cifras de memoria del dispositivo, no de VRAM dedicada.
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, y solo a partir del tamano de los archivos de pesos, la variante q4 necesitaria del orden de 5,5 a 7 GB de memoria contando pesos y cache KV, y la q8 del orden de 9 a 11 GB; la variante nano q4, del orden de 3,5 a 4,5 GB. Estas cifras son estimaciones derivadas del tamano de los archivos y no deben tomarse como especificaciones oficiales, ya que se desconoce la longitud de contexto y, por tanto, el consumo real de la cache KV.
- GPU compatibles: no disponible. No se documenta soporte para CUDA, ROCm, Metal ni aceleradores NPU concretos.
- Encaje en GPU de consumo: no confirmado. Por tamano de pesos, la variante q4 podria caber en tarjetas con 8 GB o mas de VRAM y la q8 requeriria 12 GB o mas, pero al no publicarse requisitos de VRAM ni soporte de backends, no puede afirmarse.
- Opciones de despliegue: unicamente el motor propietario de Vareoz y su aplicacion Android segun la model card. No se menciona compatibilidad con vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni transformers, y el formato `.navros` es incompatible con esas herramientas salvo que exista un conversor no documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No es posible establecer una comparacion rigurosa porque se desconocen los parametros, la longitud de contexto y el rendimiento de Navros. La tabla siguiente situa a Navros frente a tres alternativas habituales de despliegue local en el mismo rango de tamano de archivo; los datos de las alternativas proceden de su documentacion publica y deben verificarse en la fuente original antes de tomar decisiones.

| Criterio | Navros (0.2 q4/q8) | Llama 3.2 3B | Qwen2.5 7B | Gemma 2 9B |
|---|---|---|---|---|
| Parametros | no disponible | 3B | 7B | 9B |
| Longitud de contexto | no disponible | 128k | 128k | 8k |
| Cuantizaciones | Q4 y Q8 en formato propio | GGUF, AWQ, GPTQ | GGUF, AWQ, GPTQ | GGUF, AWQ, GPTQ |
| Formato de pesos | `.navros` (propietario) | safetensors, GGUF | safetensors, GGUF | safetensors, GGUF |
| Licencia | Apache 2.0 | Llama 3.2 Community License | Apache 2.0 (segun variante) | Gemma Terms of Use |
| Idiomas declarados | es, en | multilingue | multilingue | multilingue |
| Benchmarks publicados | no disponible | si | si | si |
| Despliegue en ecosistema estandar | no documentado | amplio | amplio | amplio |

La ventaja diferencial que reclama Navros no es el rendimiento, sino el empaquetado: un unico archivo con motor y aplicacion Android y una orientacion explicita al castellano con ejecucion local. Las alternativas de la tabla cuentan con ecosistemas de herramientas, cuantizaciones y evaluaciones mucho mas maduros.

## Limitaciones y advertencias

- Ausencia total de benchmarks, evaluaciones independientes o informes tecnicos: no hay ninguna evidencia publica del rendimiento real del modelo.
- Cero descargas y cero likes en HuggingFace en el momento de la consulta, lo que implica que no existe validacion por parte de la comunidad.
- La busqueda web realizada no ha devuelto ningun resultado relevante sobre el modelo: los enlaces recuperados tratan de gramatica francesa en foros y no guardan relacion con Navros.
- No se documenta la arquitectura, el numero de parametros, la longitud de contexto ni los datos de entrenamiento, por lo que no puede evaluarse el riesgo de sesgo, la cobertura idiomatica real ni la calidad en tareas especificas.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje y no cuantificado en este caso; en usos agenticos el riesgo se agrava porque una alucinacion puede traducirse en una accion no deseada sobre el dispositivo.
- Riesgo de inyeccion de prompt: en escenarios de agente que leen contenido externo (correos, paginas, documentos) no se documenta ninguna defensa especifica.
- Formato propietario `.navros`: limita la portabilidad, impide usar las herramientas estandar de cuantizacion, servido y evaluacion, y crea dependencia del motor y de la aplicacion de un unico proveedor.
- Opacidad sobre el tratamiento de datos: la inferencia local es una ventaja de privacidad, pero no se especifica si el motor o la aplicacion realizan telemetria o conexiones adicionales.
- Licencia Apache 2.0: permite uso comercial sin restricciones de royalties, pero la propia model card remite a los archivos `NOTICE`, `NAVROS.json` y `NAVROS-nano.json` para la procedencia de los pesos; conviene revisarlos antes de un despliegue comercial, ya que la licencia del repositorio no garantiza por si sola la licencia de los datos de entrenamiento.
- Precision reducida en la variante q4 y capacidades declaradas como inferiores en `navros-nano-0.0-q4`, que carece del entrenamiento de Vareoz.
- Dependencia de hardware: la variante q8 exige 12 GB de RAM o mas en moviles y el modelo no cabe en dispositivos de gama baja salvo en la version nano.
- Fechas de publicacion y actualizacion muy recientes y sin historial de versiones posterior: no hay evidencia de mantenimiento continuado.

## Enlaces

- HuggingFace: https://huggingface.co/enpatorixs/navros
- Model card: https://huggingface.co/enpatorixs/navros/blob/main/README.md
- Catalogo de modelos de la aplicacion: `modelos.json` (incluido en el repositorio, con URL, bytes, SHA-256 y RAM minima de cada archivo)
- Ficheros de procedencia: `NAVROS.json` y `NAVROS-nano.json` (incluidos en el repositorio, segun la model card)
- Licencia: `LICENSE` y `NOTICE` (incluidos en el repositorio)
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo; los resultados devueltos corresponden a consultas no relacionadas sobre gramatica francesa y no se incluyen.
