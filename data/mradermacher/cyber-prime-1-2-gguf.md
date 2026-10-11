# mradermacher/Cyber-Prime-1.2-GGUF

## Resumen

Cyber-Prime-1.2-GGUF es la distribucion en formato GGUF del modelo Akahsizrr/Cyber-Prime-1.2, publicada por el cuantizador mradermacher. Se trata de un modelo de 2.697.198.592 parametros (2,7 mil millones) especializado en dominios de ciberseguridad, con atencion declarada a inteligencia de amenazas, reconocimiento de entidades nombradas, deteccion de phishing y deteccion de anomalias en trafico HTTP. El repositorio incluye doce cuantizaciones distintas, desde Q2_K (1,2 GB) hasta f16 (5,5 GB), lo que permite desplegarlo en hardware muy modesto.

El problema que resuelve es la necesidad de un modelo pequeno y local para tareas de analisis de seguridad donde no es viable enviar datos sensibles a APIs externas. Segun las etiquetas del repositorio, la arquitectura subyacente es LFM2 (la familia de modelos fundacionales de Liquid AI), aunque la model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset ni la longitud de contexto soportada.

Su relevancia actual es doble: por un lado, ofrece una alternativa ejecutable en CPU o en GPU de gama de entrada para clasificacion y extraccion de informacion en entornos SOC; por otro, su licencia lfm1.0 y sus limitaciones de idioma (solo ingles) y de validacion (sin resultados de benchmarks publicados en la card) obligan a evaluarlo con cuidado antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (segun el tag `lfm2`; no se detalla la composicion interna en la model card) |
| Parametros totales | 2.697.198.592 (datos reales de safetensors) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (`en`) |
| Licencia | lfm1.0 (etiquetada como `license: other` con `license_name: lfm1.0` en el repositorio) |
| Formato de pesos | GGUF (un archivo por cuantizacion; no hay safetensors en este repo) |
| Modelo base | Akahsizrr/Cyber-Prime-1.2 |
| Cuantizado por | mradermacher |
| Tamano del repositorio | 24,3 GB |
| Fecha de creacion (segun repositorio) | 2026-10-11 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo. El unico indicio es la etiqueta `lfm2`, que situa el modelo dentro de la familia LFM2 de Liquid AI, una linea de modelos compactos de arquitectura hibrida. Tampoco se documenta si el modelo base fue entrenado desde cero, destilado o afinado sobre otro checkpoint, ni si se aplicaron fases de RLHF, DPO u otro tipo de alineamiento. Estos datos deben considerarse no disponibles.

Lo que si se especifica es la composicion del entrenamiento a nivel de datasets: jpmorganchase/CyberBench, tihanyin/CyberMetric, secbench-hf/SecBench y XuanwuAI/SecEval, todos ellos conjuntos orientados a evaluacion y entrenamiento en tareas de seguridad. No se indica el numero de tokens, la mezcla proporcional entre datasets ni si hubo datos adicionales de proposito general para preservar capacidades conversacionales. En cuanto a la cuantizacion, mradermacher indica que solo se han generado cuantizaciones estaticas y que las versiones con imatrix o ponderadas no estan disponibles en el momento de la publicacion.

## Capacidades

- Generacion de texto conversacional en ingles (tag `conversational` y `endpoints_compatible`).
- Analisis en el dominio de ciberseguridad: inteligencia de amenazas (threat intelligence) y clasificacion de artefactos maliciosos.
- Reconocimiento de entidades nombradas aplicado a contenido de seguridad (indicadores, referencias tecnicas y similares).
- Deteccion y clasificacion de phishing.
- Deteccion de anomalias en trafico HTTP.
- Evaluacion y ajuste sobre suites de referencia de seguridad: CyberBench, CyberMetric, SecBench y SecEval.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el modelo declara unicamente ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Triaje de alertas en un SOC: el modelo puede clasificar y resumir alertas en ingles generadas por SIEM, agrupando eventos relacionados y priorizando los que requieren intervencion humana. Su tamano de 2,7 mil millones de parametros permite ejecutarlo en la misma maquina que recoge los logs, sin enviar datos fuera de la red.
- Extraccion de entidades en informes de inteligencia de amenazas: dado un informe en texto plano, el modelo puede extraer referencias tecnicas y construir registros estructurados para alimentar una base de conocimiento interna. Es adecuado porque el tag de NER aparece explicitamente entre las capacidades declaradas.
- Clasificacion de correo de phishing: integrado en una pasarela de correo, el modelo puede etiquetar mensajes sospechosos con una cuantizacion Q4_K_M de 1,8 GB, anadiendo una capa semantica sobre las reglas deterministas existentes.
- Analisis de anomalias en logs HTTP: procesamiento de trazas de servidor web para detectar patrones de peticion anomalos, con la ventaja de poder desplegarse en el mismo host que genera los logs y evitar la exfiltracion de datos de cliente.
- Analisis asistido de vulnerabilidades: resumen y clasificacion de boletines y avisos de seguridad en ingles para generar notas internas de priorizacion de parches.
- Despliegue en entornos aislados (air-gapped): al distribuirse como GGUF y caber en 1,7-3 GB, puede ejecutarse en un portatil o en un servidor sin salida a internet, algo imprescindible en entornos industriales y de defensa.
- Asistente interno para analistas junior: respuestas sobre procedimientos, terminologia y playbooks de respuesta a incidentes en ingles, aprovechando el formato conversacional del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente enumera los conjuntos de datos de seguridad utilizados (jpmorganchase/CyberBench, tihanyin/CyberMetric, secbench-hf/SecBench, XuanwuAI/SecEval) sin aportar puntuaciones numericas ni comparaciones con otros modelos. Tampoco se ofrecen mediciones de latencia o throughput para ninguna de las cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,5 y 3,5 GB con cuantizaciones Q4 (anadiendo el cache KV y el overhead del runtime al tamano del archivo), en torno a 3,5-4,5 GB con Q8_0 y aproximadamente 6-7 GB con f16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para Q4_K_M; una RTX 3060 de 12 GB o una RTX 4060 de 8 GB permiten margen amplio para contexto largo y capas descargadas en GPU. En servidor, A100 o H100 estan sobredimensionadas para este tamano y solo se justifican si se necesita alto throughput agregado.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 6-8 GB o superior; tambien cabe en CPU con RAM suficiente (1,7-3 GB para las cuantizaciones recomendadas).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, Jan y text-generation-webui. vLLM tiene soporte GGUF experimental; TGI no esta orientado a este formato.
- Latencia y throughput estimados: no disponible. La propia model card marca Q4_K_S y Q4_K_M como "fast, recommended" y Q8_0 como "fast, best quality", pero sin cifras.

## Comparativa con modelos similares

Los datos de otros modelos proceden de su documentacion publica y no de la informacion proporcionada en este repositorio; conviene verificarlos antes de usarlos en una decision tecnica.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cyber-Prime-1.2-GGUF | 2,7 B | no disponible | lfm1.0 (`other`) | GGUF en HuggingFace; 0 descargas |
| LFM2-2.6B (familia base) | 2,6 B | no disponible en esta ficha | LFM Open License 1.0 | pesos y GGUF publicos de Liquid AI |
| Qwen2.5-3B-Instruct | 3,1 B | 32.768 tokens (documentacion publica) | Apache 2.0 | safetensors y multiples cuantizaciones |
| Llama-3.2-3B-Instruct | 3,2 B | 128.000 tokens (documentacion publica) | Llama 3.2 Community License | safetensors y multiples cuantizaciones |

Frente a estas alternativas, Cyber-Prime-1.2 aporta especializacion declarada en seguridad y un consumo de memoria menor, pero carece de datos de contexto, benchmarks publicados y validacion comunitaria. Qwen2.5-3B y Llama-3.2-3B son generalistas con licencias mas permisivas en el caso de Qwen, mientras que la licencia lfm1.0 exige revisar los terminos antes de un uso comercial.

## Limitaciones y advertencias

- Idioma: el modelo solo declara ingles, por lo que no es adecuado para contenido en castellano sin una evaluacion previa.
- Riesgo de alucinacion: elevado en un dominio donde los errores son costosos; puede generar indicadores, referencias o identificadores de vulnerabilidades inexistentes. Nunca debe usarse como fuente de verdad sin verificacion.
- Sesgos conocidos: no disponibles; la model card no incluye ninguna evaluacion de sesgos.
- Licencia: se etiqueta como `other` con nombre `lfm1.0` y enlace a un archivo LICENSE. Es imprescindible leer ese archivo antes de cualquier uso comercial, ya que los terminos de las licencias de la familia LFM incluyen condiciones especificas que no se detallan en esta ficha.
- Perdida de calidad por cuantizacion: la propia card marca Q3_K_M como "lower quality" y las cuantizaciones Q2_K y Q3 reducen de forma notable la fidelidad. Para uso real se recomienda Q4_K_M o superior.
- Sin pesos ponderados (imatrix): el autor indica que solo ha publicado cuantizaciones estaticas, lo que en tamanos bajos suele implicar mayor degradacion frente a alternativas ponderadas.
- Longitud de contexto no documentada: impide planificar despliegues que dependan de ventanas largas, como el analisis de informes extensos o logs voluminosos.
- Ausencia de benchmarks: no hay ninguna cifra comparable con otros modelos de seguridad, ni de MMLU, HumanEval, GSM8K o de las propias suites de seguridad utilizadas.
- Validacion nula por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que implica que no hay evidencia externa de comportamiento en produccion.
- Doble uso: un modelo especializado en seguridad puede emplearse tanto para defensa como para generacion de contenido ofensivo; conviene restringir su acceso en funcion del contexto.
- Sustitucion inadecuada de herramientas deterministas: no sustituye a un antivirus, un IDS/IPS, un motor de reglas de phishing ni a un escaner de vulnerabilidades. Su funcion es complementaria, como capa de clasificacion o resumen.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Cyber-Prime-1.2-GGUF
- Modelo base original: https://huggingface.co/Akahsizrr/Cyber-Prime-1.2
- Pagina de descarga y vision general del cuantizador: https://hf.tst.eu/model#Cyber-Prime-1.2-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Dataset jpmorganchase/CyberBench: https://huggingface.co/datasets/jpmorganchase/CyberBench
- Dataset tihanyin/CyberMetric: https://huggingface.co/datasets/tihanyin/CyberMetric
- Dataset secbench-hf/SecBench: https://huggingface.co/datasets/secbench-hf/SecBench
- Dataset XuanwuAI/SecEval: https://huggingface.co/datasets/XuanwuAI/SecEval
- Guia de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de calidad entre tipos de cuantizacion (grafico de ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que aporta la infraestructura de cuantizacion: https://www.nethype.de/
