# mradermacher/Marco-LLM-SEA-GGUF

## Resumen

Marco-LLM-SEA-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo ATH-MaaS/Marco-LLM-SEA, publicado por el usuario mradermacher, conocido por generar versiones cuantizadas de modelos abiertos con llama.cpp. El modelo base cuenta con 7.615.616.512 parámetros (aproximadamente 7,6 mil millones) y está orientado a cuatro idiomas del sudeste asiático: malayo (ms), indonesio (id), tailandés (th) y vietnamita (vi).

El repositorio no aporta un modelo nuevo, sino una familia de pesos comprimidos que permite ejecutar el modelo original en hardware mucho más modesto. Se ofrecen doce niveles de cuantización estática, desde Q2_K (3,1 GB) hasta f16 (15,3 GB), además de una variante con cuantización ponderada por matriz de importancia (imatrix) publicada en un repositorio separado. El repositorio completo ocupa 68,1 GB.

La relevancia actual reside en que los LLM especializados en idiomas del sudeste asiático suelen distribuirse únicamente en safetensors de precisión completa o media, lo que dificulta su uso local. Con licencia Apache 2.0 y formatos de 3 a 8 GB, este modelo puede desplegarse en portátiles y estaciones de trabajo con GPU de consumo mediante llama.cpp, Ollama o LM Studio, sin depender de APIs externas y sin restricciones de uso comercial conocidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la ficha de la cuantizacion no describe la arquitectura del modelo base) |
| Parametros totales | 7.615.616.512 (~7,6 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (3,1 GB), Q3_K_S (3,6 GB), Q3_K_M (3,9 GB), Q3_K_L (4,2 GB), IQ4_XS (4,4 GB), Q4_K_S (4,6 GB), Q4_K_M (4,8 GB), Q5_K_S (5,4 GB), Q5_K_M (5,5 GB), Q6_K (6,4 GB), Q8_0 (8,2 GB), f16 (15,3 GB); variantes imatrix en Marco-LLM-SEA-i1-GGUF |
| Idiomas soportados | malayo (ms), indonesio (id), tailandes (th), vietnamita (vi) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizacion estatica, convert_type: hf); el modelo base se distribuye para transformers |
| Tamano del repositorio | 68,1 GB |
| Fecha de publicacion | 2025-03-17 (ultima actualizacion: 2026-09-11) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base ATH-MaaS/Marco-LLM-SEA. La unica referencia tecnica es que se trata de una cuantizacion estatica generada con llama.cpp a partir de pesos en formato Hugging Face (etiquetas `convert_type: hf` y `output_tensor_quantised: 1` en la model card), y que la libreria declarada es transformers. No se especifica si emplea attention completa, atencion lineal, mezcla de expertos u otro esquema, ni el numero de capas, cabezas o dimension oculta.

Tampoco se documentan en el material proporcionado el volumen de tokens de entrenamiento, la composicion del dataset, la existencia de fases de ajuste por instrucciones, RLHF o DPO, ni innovaciones de decodificacion. El modelo base se etiqueta como `pretrained`, `conversational` y orientado a los cuatro idiomas del sudeste asiatico citados. Cualquier afirmacion adicional sobre el entrenamiento requeriria consultar la ficha del modelo original, que no forma parte de la informacion facilitada.

## Capacidades

- Generacion de texto y conversacion multiturno: el repositorio declara la etiqueta `conversational`, por lo que el modelo esta preparado para dialogos con historial.
- Cobertura multilingue limitada a cuatro idiomas del sudeste asiatico: malayo, indonesio, tailandes y vietnamita. No se declara soporte de castellano, ingles ni otros idiomas en la informacion proporcionada.
- Ejecucion local y offline: al estar en GGUF, puede ejecutarse con llama.cpp y derivados sin conexion y sin telemetria.
- Ajuste de calidad frente a memoria: la familia cubre desde 3,1 GB hasta 15,3 GB, permitiendo elegir el equilibrio entre fidelidad y recursos.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en indonesio, malayo, tailandes o vietnamita: un modelo de 7,6 B cuantizado a Q4_K_M (4,8 GB) puede desplegarse en una GPU de 8-12 GB y atender conversaciones multiturno con historial. El limite de contexto no esta documentado, por lo que conviene medirlo antes de fijar la longitud del historial.
- Procesamiento de documentos internos en idiomas SEA sin salida de datos: al ejecutarse de forma local con llama.cpp, permite resumir informes, actas o correos en malayo o tailandes dentro de la propia infraestructura, sin enviar contenido a APIs de terceros.
- Traduccion asistida entre idiomas del sudeste asiatico: el modelo cubre simultaneamente ms, id, th y vi, lo que permite construir flujos de traduccion id→vi o ms→th en un unico modelo, en lugar de encadenar dos sistemas.
- Clasificacion y enrutado de tickets de soporte: con la variante Q5_K_M o Q6_K puede etiquetar y priorizar incidencias en idioma local como paso previo a un modelo mayor, reduciendo coste por peticion.
- Prototipado e investigacion academica: la licencia Apache 2.0 y los formatos ligeros facilitan experimentos de evaluacion multilingue en entornos con una sola GPU, sin necesidad de solicitar acceso a modelos cerrados.
- Generacion de borradores y respuestas plantilla en comercio electronico: redaccion de descripciones de producto y respuestas a resenas en indonesio o vietnamita, con revision humana posterior.
- Despliegue en el borde o en equipos sin GPU: la cuantizacion Q2_K (3,1 GB) y Q4_K_S (4,6 GB) permiten inferencia en CPU con 8-16 GB de RAM, util para demos y estaciones de trabajo ofimaticas.
- Generacion de datos sinteticos de bajo coste: producir corpus de texto en idiomas SEA para ajuste posterior de otros modelos, con control de licencia al ser Apache 2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la cuantizacion no incluye tablas de MMLU, GSM8K, HumanEval ni evaluaciones especificas para idiomas del sudeste asiatico, y los resultados de busqueda web no aportan ninguna fuente alternativa. Tampoco se publican mediciones de perplejidad por nivel de cuantizacion, mas alla de la referencia generica a un grafico comparativo de tipos de cuantizacion enlazado por el autor, que no contiene datos de este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + cache KV y overhead, valores orientativos calculados a partir del tamano de cada fichero):
  - Q2_K: ~4-5 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~5-6 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~6-7 GB con contexto corto
  - Q5_K_S / Q5_K_M: ~7-8 GB
  - Q6_K: ~8-9 GB
  - Q8_0: ~10-11 GB
  - f16: ~17-18 GB
- GPU recomendadas:
  - RTX 3060 12 GB, RTX 4070 12 GB, RTX 4060 Ti 16 GB: Q4_K_M y Q5_K_M con margen.
  - RTX 3090 / 4090 24 GB: Q6_K, Q8_0 e incluso f16 con contexto moderado.
  - A100 40/80 GB o H100: sobredimensionadas para este tamano, utiles solo si se sirven muchas peticiones concurrentes.
- Cabe en GPU de consumo: si. A partir de 8 GB de VRAM se pueden usar cuantizaciones de 4 bits; con 6 GB conviene bajar a Q3_K o IQ4_XS; Q2_K permite incluso tarjetas de 4-6 GB con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no cargan GGUF de forma nativa, por lo que para servir en produccion con esas herramientas habria que partir del modelo base en safetensors.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia. Las unicas notas de la ficha son cualitativas: Q4_K_S y Q4_K_M marcados como "fast, recommended", Q8_0 como "fast, best quality" y f16 como "overkill".
- Notas sobre calidad de cuantizacion (segun el propio autor): Q3_K_M se etiqueta como "lower quality" y Q6_K como "very good quality". Se recomienda Q4_K_M como punto de partida y Q6_K o Q8_0 cuando la calidad sea prioritaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Marco-LLM-SEA-GGUF (este modelo) | 7,6 B | no disponible | ms, id, th, vi | Apache-2.0 | GGUF (3,1-15,3 GB) | Cuantizacion estatica; variantes imatrix en repositorio aparte |
| ATH-MaaS/Marco-LLM-SEA (modelo base) | 7,6 B | no disponible | ms, id, th, vi | Apache-2.0 (segun la ficha de la cuantizacion) | safetensors para transformers | Necesario para vLLM/TGI; resto de datos no disponibles |
| Qwen2.5-7B | 7,6 B | 32.768 nativo, 131.072 con YaRN | multilingue | Apache-2.0 | safetensors y GGUF de terceros | Alternativa generalista de mismo tamano; datos fuera del material proporcionado, conviene verificar en su ficha oficial |
| Familia SeaLLM / SEA-LION / Sailor | no disponible | no disponible | idiomas del sudeste asiatico | no disponible | no disponible | Alternativas especificas de la region; no se dispone de datos de comparacion en la informacion facilitada |

La informacion proporcionada no permite comparar rendimiento entre estos modelos, ya que no incluye ningun resultado de evaluacion. La comparacion anterior se limita a parametros, licencia y formatos cuando estos constan en el material o son de dominio publico ampliamente establecido.

## Limitaciones y advertencias

- La cuantizacion no aporta una model card propia del modelo base: no hay informacion verificable sobre datos de entrenamiento, sesgos, contexto maximo ni ajuste por instrucciones. Antes de usarlo en produccion conviene consultar la ficha de ATH-MaaS/Marco-LLM-SEA.
- Riesgo de alucinacion: inherente a los modelos de ~7,6 B y no cuantificado en este repositorio. Al no haber benchmarks publicados, no se puede acotar la tasa de error factual.
- Degradacion por cuantizacion: los niveles Q2_K, Q3_K_S, Q3_K_M y Q3_K_L comprimen en exceso y el propio autor marca Q3_K_M como "lower quality". Para tareas sensibles se recomienda Q6_K o Q8_0.
- Cobertura idiomatica: solo se declaran malayo, indonesio, tailandes y vietnamita. El rendimiento en castellano o ingles no esta documentado y probablemente sea deficiente o inexistente.
- Longitud de contexto desconocida: al no publicarse, no se puede planificar el uso con documentos largos ni fijar un limite seguro de historial de conversacion sin medirlo empiricamente.
- Licencia: el repositorio declara Apache-2.0, lo que permite uso comercial y modificacion, pero la licencia efectiva depende del modelo base. Conviene verificar que ATH-MaaS/Marco-LLM-SEA se distribuye bajo la misma licencia y no incorpora datos con restricciones adicionales.
- Compatibilidad de despliegue: GGUF no es compatible de forma nativa con vLLM ni con TGI. Si se necesita servir con esas herramientas, hay que usar los pesos safetensors del modelo base y aplicar la cuantizacion en el servidor.
- Sin historial de mantenimiento: el repositorio tiene 128 descargas y 0 likes en el momento de la consulta, y no hay comunidad documentada que reporte incidencias de calidad.

## Enlaces

- Repositorio de la cuantizacion en HuggingFace: https://huggingface.co/mradermacher/Marco-LLM-SEA-GGUF
- Repositorio de cuantizaciones ponderadas (imatrix): https://huggingface.co/mradermacher/Marco-LLM-SEA-i1-GGUF
- Modelo base: https://huggingface.co/ATH-MaaS/Marco-LLM-SEA
- Pagina de descarga y vision general del autor para este modelo: https://hf.tst.eu/model#Marco-LLM-SEA-GGUF
- README de referencia sobre uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- Empresa que cede la infraestructura de cuantizacion: https://www.nethype.de/

Nota: los resultados de busqueda web disponibles para esta consulta no aportan enlaces utiles; devuelven unicamente paginas de inicio de sesion de Google Drive en varios idiomas y no contienen informacion sobre el modelo.
