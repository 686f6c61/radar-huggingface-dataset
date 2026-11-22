# onocloud/onoai-titanium-2.5-pro-GGUF

## Resumen

OnoAI Titanium 2.5 Pro es un modelo multimodal de tipo image-text-to-text publicado por el colectivo onocloud bajo la familia OnoAI Titanium. Se presenta como un modelo insignia orientado a tareas de agente autonomo, con un nucleo transformer de aproximadamente 27.850 millones de parametros (etiquetado comercialmente como "30B"). Esta ficha cubre concretamente la variante GGUF Server Edition, una compilacion cuantizada en Q4_K_M pensada para ejecucion local sin coste por token mediante Ollama y llama.cpp.

La relevancia de esta publicacion radica en su empaquetado: incluye un proyector multimodal independiente (mmproj) de 1,40 GB que habilita la percepcion de imagenes y de interfaces graficas (GUI), junto con un Modelfile listo para desplegar en Ollama. Esto permite ejecutar un modelo de casi 28.000 millones de parametros con vision sobre hardware de consumo, algo que en la categoria de modelos multimodales de este tamano no es habitual.

La informacion publica disponible es escasa: el repositorio no incluye datos sobre la composicion del dataset de entrenamiento, el proceso de alineacion ni resultados de benchmarks. El modelo declara soporte unicamente para ingles y arabe, y su licencia es la propietaria OSRL-1.0, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) con proyector de vision independiente (mmproj) |
| Parametros totales | 27.854.794.240 (aprox. 27,85 mil millones) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el comando de llama-server; no se especifica el maximo nativo) |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en este repo) |
| Idiomas soportados | ingles (en), arabe (ar) |
| Licencia | OSRL-1.0 (propietaria, declarada como "other") |
| Formato de pesos | GGUF (nucleo Q4_K_M de 16,75 GB y mmproj de 1,40 GB); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo se describe como un "autonomous agentic transformer" multimodal. La variante publicada combina un nucleo de lenguaje cuantizado en Q4_K_M con un proyector de vision separado (mmproj) que codifica imagenes de alta resolucion y capturas de interfaz grafica (GUI). La separacion del proyector en un fichero GGUF aparte es el patron habitual en llama.cpp para modelos multimodales y permite cargar la parte de vision solo cuando se necesita.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, las tecnicas de alineacion (RLHF, DPO u otras) ni innovaciones tecnicas especificas mas alla de la mencion generica a capacidades de agente autonomo. La model card no documenta el proceso de entrenamiento ni la procedencia de los datos. Tampoco se detalla la arquitectura interna del codificador visual ni el mecanismo de fusion entre modalidades.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes (image-text-to-text) mediante el proyector mmproj.
- Interpretacion de interfaces graficas (GUI), segun la descripcion del proyector de vision.
- Orientacion a flujos de agente autonomo (autonomous-agent), segun las etiquetas del autor.
- Capacidades multilingues limitadas a ingles y arabe.
- Ejecucion local sin coste por token mediante Ollama y llama.cpp.
- No se documenta soporte explicito de tool calling, function calling, modo thinking ni audio.

## Casos de uso

- Automatizacion de agentes sobre GUI: el proyector de vision permite interpretar capturas de pantalla de aplicaciones de escritorio o web y decidir la siguiente accion en un flujo de automatizacion local, sin enviar imagenes a un servicio externo.
- Asistencia en escritorio con privacidad: al ejecutarse en local con Ollama, puede procesar capturas y documentos visuales sensibles sin salir de la maquina, adecuado para entornos con requisitos de confidencialidad.
- Prototipado de agentes autonomos: util para investigadores que necesitan un modelo multimodal de casi 28B ejecutable en una sola GPU de consumo para iterar sobre bucles de razonamiento y accion.
- Procesamiento documental con imagenes: extraccion de informacion de capturas, formularios escaneados o diagramas en ingles o arabe, combinando percepcion visual y generacion de texto.
- Soporte en arabe e ingles: atencion o generacion de contenido bilingue para los dos idiomas declarados, con contexto de hasta 32K tokens para conversaciones o documentos largos.
- Evaluacion comparativa de modelos multimodales: su empaquetado GGUF con mmproj separado lo hace practico para pruebas de referencia en pipelines de llama.cpp y para medir latencia y calidad en hardware modesto.
- Despliegue en servidor ligero: el comando llama-server con `-c 32768` permite montar un endpoint HTTP compatible con clientes que consumen API de chat, util para integrar en herramientas internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el nucleo Q4_K_M ocupa 16,75 GB y el mmproj 1,40 GB, por lo que se necesita aproximadamente 18,2 GB solo para los pesos; con cache KV para 32K tokens hay que anadir varios GB adicionales, situando el consumo realista en el entorno de 22-26 GB segun contexto y lote.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para margen holgado; en consumo, una RTX 4090 (24 GB) puede alojar los pesos pero el contexto de 32K completo queda muy ajustado y puede requerir reducir `-c`.
- Cabe en GPU de consumo: si, en tarjetas con 24 GB o mas (RTX 3090, RTX 4090) con contexto reducido; en GPUs de 16 GB no cabe el modelo completo en VRAM y habria que recurrir a offload parcial a CPU, con penalizacion de velocidad.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp / llama-server con `--mmproj`, y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OnoAI Titanium 2.5 Pro (GGUF) | ~27,85B | 32K (segun comando) | Si (mmproj) | OSRL-1.0 (propietaria) | GGUF en HF, Ollama |
| Qwen2.5-VL 32B | 32B | hasta 128K (segun variante) | Si | Apache 2.0 (segun variante) | safetensors, GGUF comunitario |
| Gemma 3 27B | 27B | 128K | Si | Gemma Terms | safetensors, GGUF oficial |
| InternVL 2.5 26B | ~26B | variable | Si | MIT (segun variante) | safetensors, GGUF comunitario |

La comparativa es orientativa por categoria y tamano; no se dispone de datos de rendimiento del modelo OnoAI para contrastar calidad frente a estas alternativas. La diferencia principal frente a los modelos citados es la licencia propietaria OSRL-1.0 y el soporte limitado a dos idiomas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia objetiva de calidad frente a alternativas de la misma categoria.
- Soporte idiomatico restringido a ingles y arabe; el castellano no figura entre los idiomas declarados.
- Licencia OSRL-1.0 propietaria: es imprescindible revisar el fichero LICENSE antes de cualquier uso comercial, ya que las condiciones no son las de una licencia open source estandar.
- Riesgo de alucinacion no cuantificado: al no documentarse el entrenamiento ni la alineacion, no se puede estimar la fiabilidad en tareas factuales.
- El contexto de 32K aparece en el comando de ejemplo, no como maximo nativo verificado; conviene validarlo en despliegue real.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay comunidad ni retroalimentacion que respalde la calidad del modelo.
- La cuantizacion Q4_K_M introduce perdida de precision frente al modelo base; no se publican comparativas entre cuantizaciones.
- El proyector de vision es un fichero separado: desplegar solo el GGUF del nucleo elimina por completo las capacidades multimodales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/onocloud/onoai-titanium-2.5-pro-GGUF
- Licencia OSRL-1.0: fichero LICENSE del repositorio (https://huggingface.co/onocloud/onoai-titanium-2.5-pro-GGUF/blob/main/LICENSE)
- No se han encontrado papers, blogs, repositorios de codigo ni demos adicionales en la informacion disponible.
