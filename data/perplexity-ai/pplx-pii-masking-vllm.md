# perplexity-ai/pplx-pii-masking-vllm

## Resumen

pplx-pii-masking-vllm es un empaquetado para vLLM del modelo perplexity-ai/pplx-pii-masking, desarrollado por Perplexity AI para la deteccion y enmascarado de informacion de identificacion personal (PII) en datos conversacionales. No se trata de un modelo generativo: es un encoder bidireccional Qwen3 de aproximadamente 596 millones de parametros, construido sobre el backbone de perplexity-ai/pplx-embed-v1-0.6b, que expone dos cabezas independientes sobre el mismo tronco de representaciones.

La primera cabeza realiza clasificacion de tokens con 37 etiquetas en esquema BIOES sobre 9 categorias de PII (private_person, private_email, private_phone, private_address, private_url, private_date, account_number, secret y other_pii), y se decodifica con un decodificador Viterbi restringido. La segunda cabeza produce un unico logit de sensibilidad a nivel de conversacion, calculado sobre los estados ocultos promediados. El pipeline declarado es token-classification y la longitud maxima de entrada es de 4096 tokens.

Su relevancia practica esta en el formato de entrega: el repositorio no reentrena ni cuantiza los pesos, sino que los reempaqueta para vLLM 0.26.0 e incluye un Docker Compose con un adaptador `/v1/scoring`, un cliente de decodificacion Viterbi y una implementacion de referencia en fp32 para CPU. Esto convierte un modelo de investigacion en un servicio desplegable en GPU con endpoints HTTP, algo poco habitual en modelos de enmascarado de PII. La licencia es MIT, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional Qwen3 (`Qwen3ForTokenClassification`, `is_causal: false`) con dos cabezas sobre el backbone pplx-embed-v1-0.6b |
| Parametros totales | 596.088.870 (~600 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | No disponible. Los pesos se distribuyen sin cuantizar: backbone en bf16 y cabezas en fp32 |
| Idiomas soportados | Ingles (en) y multilingue |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), mas `config.json`, `tokenizer.json`, `tokenizer_config.json` y `viterbi.json` |
| Tamano del repositorio | 1,2 GB |
| Pipeline | token-classification |
| Modelo base | perplexity-ai/pplx-pii-masking |
| Categorias de PII | 9: private_person, private_email, private_phone, private_address, private_url, private_date, account_number, secret, other_pii |
| Etiquetas de token | 37 en esquema BIOES (indice 0 = O), mas 1 columna de sensibilidad de secuencia |

## Arquitectura y entrenamiento

El modelo es un transformer encoder bidireccional derivado de Qwen3, con atencion no causal (`is_causal: false`). El tronco corresponde al backbone de perplexity-ai/pplx-embed-v1-0.6b, de aproximadamente 600 millones de parametros, y sobre el se montan dos cabezas lineales. La cabeza de clasificacion de tokens proyecta de 1024 a 37 dimensiones; la cabeza de sensibilidad proyecta de 1024 a 1. En el checkpoint base ambas cabezas estan separadas; en el empaquetado para vLLM se fusionan en una unica matriz `score.weight` de 38 filas, donde las filas 0-36 corresponden a las etiquetas de token y la fila 37 es la columna `__SEQ_SENSITIVITY__`.

El esquema de etiquetado es BIOES con la convencion de indices: para la categoria `c` (de 0 a 8), `1+4c` es B, `2+4c` es I, `3+4c` es E y `4+4c` es S, con el indice 0 reservado para O. El orden de categorias del checkpoint es private_person, private_email, private_phone, private_address, private_url, private_date, account_number, secret y other_pii. La decodificacion emplea Viterbi con restricciones de transicion, y las etiquetas se proyectan a intervalos de caracteres mediante los offsets del tokenizador.

La cabeza de sensibilidad aprovecha la linealidad de la media: como `mean(W·h + b) = W·mean(h) + b`, el adaptador separa la columna 37, la promedia sobre los tokens de entrada y aplica una sigmoide para obtener un valor de sensibilidad entre 0 y 1. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. Respecto a la innovacion tecnica, lo mas destacable es el propio empaquetado: separacion de logits de token y de secuencia desde una unica matriz de salida, decodificacion Viterbi restringida y una implementacion de referencia en fp32 sobre CPU para validar la salida del servicio en GPU.

## Capacidades

- Deteccion de entidades PII en texto conversacional mediante etiquetado BIOES token a token.
- Clasificacion de nueve categorias: personas, correo electronico, telefono, direccion postal, URL, fecha, numero de cuenta, secretos y PII diversa.
- Puntuacion de sensibilidad a nivel de conversacion (un logit escalar convertido a probabilidad con sigmoide).
- Generacion de texto enmascarado: el cliente de referencia imprime los intervalos de PII detectados y el texto con las entidades sustituidas.
- Recuperacion de intervalos de caracteres exactos a partir de los offsets del tokenizador.
- Soporte de tool calling / function calling: no disponible; el modelo no es generativo y no expone ese tipo de interfaz.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: la model card declara los idiomas en y multilingual, sin detallar cobertura por idioma.
- Capacidad especial: salida de logits crudos por token mas logit de secuencia a traves del endpoint `/pooling` de vLLM (matriz `[T, 38]` por entrada).
- Capacidad especial: dos modos de servicio, `/pooling` (vLLM directo, solo logits) y `/v1/scoring` (adaptador con decodificacion y enmascarado).

## Casos de uso

- Enmascarado previo al entrenamiento de modelos: dado que procesa conversaciones de hasta 4096 tokens, puede ejecutarse sobre corpus de dialogo para eliminar nombres, correos y telefonos antes de usar esos datos en ajuste fino, reduciendo el riesgo de memorizacion de PII.
- Cumplimiento de RGPD en logs de atencion al cliente: integrado en el pipeline de ingesta de transcripciones de soporte, sustituye las entidades detectadas por marcadores antes de que los registros se almacenen o se exporten a sistemas de analitica.
- Redaccion de documentos en flujos juridicos o medicos: el modelo marca intervalos de PII para revision humana, apoyandose en la cabeza de sensibilidad para priorizar los documentos que requieren inspeccion manual.
- Filtrado de datasets abiertos antes de su publicacion: procesado por fragmentos (chunking) de documentos largos, aprovechando el Viterbi restringido para evitar transiciones de etiqueta invalidas y reducir falsos positivos.
- Moderacion y anonimizacion en tiempo real de chats: desplegado con vLLM sobre GPU y el endpoint `/v1/scoring`, se puede invocar por peticion HTTP desde un servicio de mensajeria para enmascarar el mensaje antes de persistirlo.
- Auditoria de fugas de informacion en respuestas de asistentes: la puntuacion de sensibilidad por conversacion sirve como senal de alarma para marcar interacciones donde el modelo ha expuesto datos personales, y activar revision o bloqueo.
- Anonimizado de transcripciones de reuniones: al trabajar sobre texto tokenizado con offsets, encaja en pipelines de ASR que producen transcripciones con marcas de tiempo y necesitan una capa de redaccion posterior.
- Enriquecimiento de pipelines de seguridad (DLP): combinado con reglas propias, aporta deteccion semantica de categorias como `secret` o `account_number` que las expresiones regulares no cubren bien.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall o F1 sobre conjuntos como MMLU, HumanEval o GSM8K, ni tampoco sobre corpus de evaluacion de PII (por ejemplo, AI4Privacy o benchmarks equivalentes). Unicamente se indica de forma cualitativa que pueden producirse falsos positivos y PII no detectada, y que los umbrales de confianza de intervalos y de sensibilidad deben calibrarse sobre los datos objetivo antes de usarlos para tomar decisiones de enmascarado.

## Requisitos de hardware

- VRAM estimada: calculada a partir del numero de parametros, el backbone en bf16 ocupa aproximadamente 1,2 GB y las cabezas en fp32 son un componente marginal; el consumo total depende del backend y de la memoria reservada por vLLM. La model card no publica una cifra oficial de VRAM.
- GPU requeridas: el despliegue con Docker Compose exige una GPU NVIDIA con driver compatible. No se especifica una familia o generacion concreta mas alla de ese requisito.
- Compatibilidad con GPU de consumo: por el tamano del modelo (~600 M de parametros), es previsible que quepa en GPU de consumo con suficiente VRAM, aunque el dato no esta confirmado en la informacion disponible. El parametro `--gpu-memory-utilization` del fichero Compose debe ajustarse si la asignacion por defecto no encaja en la GPU.
- Opciones de despliegue: vLLM 0.26.0 (version fijada por el repositorio) en modo `--runner pooling --convert classify`; Docker Compose incluido en `serving/docker-compose.yml` con dos servicios (vLLM y adaptador de scoring); ejecucion directa de `vllm serve`. No se mencionan llama.cpp, Ollama ni TGI.
- Ajustes de despliegue: `--dtype bfloat16` y `--max-model-len 4096`; es obligatorio `--pooler-config '{"use_activation": false}'` para obtener logits crudos, decodificacion Viterbi y recuperacion del logit de sensibilidad.
- Latencia y throughput: no disponible.
- Nota de seguridad: Docker Compose enlaza ambos servicios a `127.0.0.1` y el adaptador no aplica autenticacion.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La unica referencia directa documentada es el checkpoint base del que deriva este empaquetado. Existen en el ecosistema otras alternativas de deteccion de PII basadas en encoders (por ejemplo, modelos de la familia Piiranha o enfoques como GLiNER orientados a PII), pero no se han aportado en la busqueda web datos de parametros, contexto, rendimiento o licencia que permitan una comparacion rigurosa, por lo que se marcan como no disponibles.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| perplexity-ai/pplx-pii-masking-vllm | 596.088.870 (~600 M) | 4096 tokens | No disponible | MIT | HuggingFace, con Docker Compose y vLLM |
| perplexity-ai/pplx-pii-masking (modelo base) | No disponible | No disponible | No disponible | MIT | HuggingFace |
| Otras alternativas de deteccion de PII basadas en encoders | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Limite de entrada de 4096 tokens: el tokenizador incluido trunca las entradas mas largas. Los documentos extensos deben dividirse en fragmentos antes de puntuarlos, con el riesgo de perder contexto en las fronteras entre fragmentos.
- `use_activation: false` es obligatorio para obtener logits crudos, aplicar Viterbi y recuperar el logit de sensibilidad de secuencia.
- Los limites de los intervalos siguen los offsets del tokenizador y pueden incluir espacios en blanco circundantes, lo que exige un recorte posterior.
- Se admiten falsos positivos y PII no detectada. La model card recomienda explicitamente evaluar sobre los datos objetivo antes de confiar en el modelo.
- Los umbrales de confianza de sensibilidad y de intervalo deben calibrarse sobre los datos de destino antes de usarlos para decidir si se enmascara o no.
- La confianza de intervalo del cliente de referencia es la media de la probabilidad softmax de las etiquetas de token seleccionadas, y difiere de la puntuacion de intervalo del modelo base; no son magnitudes intercambiables.
- Los resultados en coma flotante pueden variar segun el dtype de servicio y el backend utilizado.
- El endpoint `/v1/scoring` del adaptador no aplica autenticacion, y el Compose enlaza los servicios a `127.0.0.1`. Exponerlo fuera de localhost requiere anadir autenticacion y control de acceso por cuenta del integrador.
- La asignacion de memoria de GPU por defecto puede ser insuficiente; hay que ajustar `--gpu-memory-utilization` en el fichero Compose.
- Sesgos conocidos: no disponibles en la informacion proporcionada. La cobertura real por idioma dentro de la etiqueta `multilingual` no esta detallada.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones adicionales, manteniendo el aviso de copyright.
- La fecha de creacion y actualizacion del repositorio figura como 2026-09-13, dato que conviene verificar en la pagina del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/perplexity-ai/pplx-pii-masking-vllm
- Modelo base: https://huggingface.co/perplexity-ai/pplx-pii-masking
- Backbone de embeddings: https://huggingface.co/perplexity-ai/pplx-embed-v1-0.6b
- Ficheros relevantes del repositorio: `serving/docker-compose.yml`, `serving/scoring_adapter.py`, `serving/test_client.py`, `serving/convert_to_hf.py`, `serving/reference_forward.py`, `viterbi.json`, `LICENSE`
- Pagina de Perplexity: https://www.perplexity.ai/
- Guia de iniciacion de Perplexity: https://www.perplexity.ai/fr/hub/getting-started
- Wikipedia (Perplexity AI): https://fr.wikipedia.org/wiki/Perplexity_AI
- Otros enlaces de la busqueda web (sin relacion tecnica directa con el modelo): https://www.social.perplexity.ai/ y https://www.lesnumeriques.com/science-espace/qu-est-ce-que-perplexity-ai-et-comment-l-utiliser-a230994.html
