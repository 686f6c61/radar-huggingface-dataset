# Sido/hina-gemma4-12b-balanced-q4km-browser

## Resumen

`Sido/hina-gemma4-12b-balanced-q4km-browser` es un espejo en formato GGUF del modelo `HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced`, un ajuste fino de la familia Gemma 4 de Google con cuantizacion QAT (quantization-aware training) y un alineamiento laxo respecto a los filtros de seguridad habituales. El autor del repositorio (Sido) no ha reentrenado ni recuantizado los tensores: se limita a dividir el fichero GGUF original Q4_K_M en fragmentos de menos de 2 GB para que pueda cargarse en runtimes de navegador que imponen limites de tamano por peticion HTTP.

El modelo base declara 11.907.350.576 parametros (aproximadamente 12 mil millones), lo que lo situa en la gama media-alta de la familia Gemma 4. El repositorio ocupa 7,4 GB y contiene unicamente los shards de texto: no incluye el proyector multimodal ni el fichero MTP (multi-token prediction) del repositorio upstream, por lo que las capacidades de vision y decodificacion especulativa del modelo original no estan disponibles en este paquete.

Su relevancia practica es acotada: se trata de un artefacto de distribucion (un mirror fragmentado), no de un modelo nuevo. Resulta util para quien necesite ejecutar un Gemma 4 de 12B cuantizado en un entorno web (WebGPU, transformers.js, wllama) sin disponer de un servidor que sirva ficheros de mas de 2 GB, y para quien busque una variante con menos rechazos en el alineamiento. La informacion publicada por el autor es minima y no incluye datos de entrenamiento, benchmarks ni evaluaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4); detalles de capas y atencion no disponibles |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF, dividido en shards de menos de 2 GB (split con `llama-gguf-split --split-max-size 1700M --no-tensor-first-split`) |
| Tamano del repositorio | 7,4 GB |
| Fichero fuente | `Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced-Q4_K_M.gguf`, 7.381.381.760 bytes |
| SHA-256 del fuente | `59656d7494d6376ca97e9e20b64ea2e16cd97f12ec6d47bfccba91cb785b5134` |
| Revision upstream | `ae8045ac2bd216293ca49a3065da2c942dde4b68` |
| Modalidad | solo texto (sin proyector multimodal ni MTP) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna mas alla de la etiqueta `gemma4`. Por el linaje (Gemma 4) cabe esperar un transformer decoder-only con atencion por ventanas alternada y normalizacion RMSNorm, pero el autor no publica numero de capas, dimension del modelo, cabezas de atencion ni longitud de contexto nativa; estos datos deben consultarse en la documentacion oficial de Gemma 4. El modelo base emplea QAT (quantization-aware training), lo que implica que la cuantizacion a Q4_K_M se simulo durante el entrenamiento y no solo en post-proceso, con el objetivo de reducir la degradacion tipica de las cuantizaciones de 4 bits.

Respecto al ajuste fino de HauhauCS, la model card de este espejo no aporta informacion sobre el dataset, el numero de tokens, la composicion de la mezcla ni si se aplicaron tecnicas de RLHF, DPO u otras. El calificativo "Uncensored" sugiere una reduccion deliberada del rechazo ante peticiones que los filtros de seguridad estandar bloquearian, y "Balanced" apunta a un compromiso entre ese alineamiento laxo y la utilidad general, pero no hay detalle tecnico publicado. El autor de este repositorio confirma explicitamente que no ha recuantizado ni modificado ningun tensor: la unica operacion es el troceado del fichero GGUF.

## Capacidades

- Generacion de texto conversacional en formato chat, segun la etiqueta `conversational` del repositorio.
- Razonamiento y conocimiento general heredados del modelo base Gemma 4 12B (sin evaluaciones publicadas en este repositorio).
- Generacion de codigo y matematicas: capacidad esperable por el tamano y la familia, no verificada con benchmarks en la informacion disponible.
- Alineamiento reducido ("uncensored"): menor probabilidad de rechazo ante peticiones sensibles, segun la denominacion del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`): el GGUF puede servirse desde infraestructura de inferencia compatible con la API de Hugging Face.
- Ejecucion en navegador: el troceado en shards de menos de 2 GB permite la carga incremental en runtimes web con limites por fichero.
- Sin vision: el proyector multimodal no esta incluido en este repositorio.
- Sin decodificacion especulativa MTP: el fichero MTP del upstream no esta incluido.
- Soporte de tool calling y de agentes multi-paso: no documentado en la informacion disponible.

## Casos de uso

- Demo de inferencia en navegador: cargar los shards en orden (`00001` primero) desde un runtime GGUF consciente de splits (transformers.js, wllama, WebGPU) para ofrecer un chat de 12B que se ejecuta integramente en el cliente, sin enviar prompts a un servidor.
- Prototipado de asistentes conversacionales sin censura: util para investigar el comportamiento del modelo ante temas sensibles, comparar respuestas con la version alineada de Gemma 4 y medir tasas de rechazo.
- Evaluacion de cuantizacion QAT: al ser un Q4_K_M derivado de un entrenamiento con QAT, sirve para medir la perdida de calidad frente al modelo en bf16 en tareas de razonamiento y codigo, con la ventaja de que el autor garantiza que los tensores no se han modificado.
- Despliegue en entornos con limites de tamano de fichero: CDNs, proxies o plataformas de hosting estatico que rechazan objetos de mas de 2 GB pueden servir este repositorio tal cual y reconstruir el GGUF en el cliente.
- Generacion de texto offline en estaciones de trabajo modestas: con 7,4 GB en Q4_K_M, el modelo cabe en GPUs de consumo con 8-12 GB de VRAM o en CPU con RAM suficiente, adecuado para tareas de redaccion, resumen y clasificacion por lotes.
- Base para ajustes finos posteriores: al estar en GGUF y sin modificaciones respecto al upstream, puede servir como referencia de comparacion al entrenar variantes (LoRA, DPO) sobre el modelo original en safetensors.
- Archivo y reproducibilidad: el SHA-256 documentado del fichero fuente permite verificar la integridad de la reconstruccion a partir de los shards en pipelines de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de este espejo ni los metadatos del repositorio incluyen puntuaciones de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se ofrecen mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7,5-8,5 GB con Q4_K_M (7,4 GB de pesos mas overhead de contexto y cache KV). Con contexto largo la cifra crece de forma proporcional al tamano de la cache KV, que no se puede calcular sin conocer la configuracion de capas y cabezas.
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 6000 Ada para servicio concurrente con contexto amplio; RTX 4090 (24 GB) para uso individual con contextos generosos.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB), RTX 4080 (16 GB) y RTX 4070 Ti Super (16 GB). En tarjetas de 8 GB (RTX 3060 Ti, RTX 4060) el ajuste es muy justo y probablemente requiera offload parcial a CPU o reducir el contexto.
- CPU: viable con al menos 16 GB de RAM usando llama.cpp, con velocidades de decodificacion bajas (orden de pocos tokens por segundo, dependiente del hardware).
- Opciones de despliegue: llama.cpp (soporta splits GGUF de forma nativa), Ollama (previa conversion o importacion del GGUF), servidores compatibles con la API de Hugging Face (`endpoints_compatible`), y runtimes de navegador con soporte de splits (transformers.js, wllama, WebGPU).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Sido/hina-gemma4-12b-balanced-q4km-browser | 11,9 B | no disponible | Q4_K_M en shards <2 GB | gemma | Solo texto, sin MTP, orientado a navegador |
| HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced | 11,9 B (presumible) | no disponible | safetensors y GGUF completos | gemma | Upstream; incluye proyector multimodal y MTP |
| Gemma 4 12B oficial (Google) | ~12 B | no disponible | bf16, GGUF comunitarios | gemma | Version alineada con los filtros estandar |
| Gemma 3 12B (generacion anterior) | ~12 B | no disponible | multiples | gemma | Alternativa de referencia si se busca estabilidad y soporte amplio |

La comparacion cuantitativa de rendimiento no es posible: no hay benchmarks publicados para este espejo ni datos verificables en la informacion disponible sobre el modelo base. La diferencia funcional principal frente al upstream es la ausencia de vision y de MTP, y frente a la version oficial de Gemma 4, el alineamiento laxo.

## Limitaciones y advertencias

- Es un espejo, no un modelo nuevo: cualquier problema de calidad, sesgo o comportamiento proviene del modelo base de HauhauCS y de Gemma 4, no del troceado.
- Alineamiento "uncensored": la reduccion de rechazos implica mayor probabilidad de generar contenido sensible, ofensivo o potencialmente danino. No es adecuado para aplicaciones orientadas a publico general sin una capa de moderacion adicional.
- Riesgo de alucinacion: inherente a los modelos de 12B; no hay evaluaciones de fidelidad publicadas para esta variante.
- Sin vision ni MTP: si el caso de uso requiere imagenes o decodificacion especulativa, hay que acudir al repositorio upstream.
- Idiomas no documentados: no se especifica la cobertura linguistica; el rendimiento en castellano no esta verificado.
- Contexto no documentado: no se puede planificar el dimensionado de la cache KV ni el coste de memoria sin consultar la documentacion de Gemma 4.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que imponen obligaciones de atribucion y una politica de uso prohibido. El calificativo "uncensored" no exime de cumplir esos terminos.
- Verificacion de integridad: conviene comprobar el SHA-256 del fichero reconstruido (`59656d...b5134`) antes de desplegar, ya que el troceado se realizo sin firma adicional.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de que los errores se hayan detectado y corregido por la comunidad.
- Orden de descarga: es necesario bajar primero el shard `00001`; los runtimes no conscientes de splits GGUF fallaran al cargar el modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Sido/hina-gemma4-12b-balanced-q4km-browser
- Modelo base (upstream): https://huggingface.co/HauhauCS/Gemma4-12B-QAT-Uncensored-HauhauCS-Balanced
- Revision upstream referenciada: `ae8045ac2bd216293ca49a3065da2c942dde4b68`
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Documentacion de Gemma: https://ai.google.dev/gemma/docs
- Herramienta de troceado (`llama-gguf-split`): https://github.com/ggml-org/llama.cpp
- Runtimes de navegador compatibles con GGUF: https://github.com/ngxson/wllama y https://github.com/huggingface/transformers.js
