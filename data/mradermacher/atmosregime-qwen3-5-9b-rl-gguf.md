# mradermacher/AtmosRegime-Qwen3.5-9B-RL-GGUF

## Resumen
AtmosRegime-Qwen3.5-9B-RL-GGUF es la distribucion en formato GGUF del modelo AtmosRegime-Qwen3.5-9B-RL, un ajuste fino mediante aprendizaje por refuerzo (RL) del modelo base codercat/AtmosRegime-Qwen3.5-9B-RL, orientado a ciencia atmosferica y computacion cientifica. La cuantizacion la publica mradermacher, un autor habitual de conversiones GGUF para llama.cpp, e incluye tanto pesos de texto como un proyector multimodal (mmproj) para vision. El modelo tiene 8.953.803.264 parametros (aproximadamente 9B) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El interes principal de esta ficha reside en que combina tres elementos poco habituales en el ecosistema open source: un dominio vertical concreto (meteorologia y regimenes atmosfericos), un proceso de alineamiento por refuerzo declarado en el pipeline, y una ventana multimodal (los ficheros mmproj indican soporte de imagenes). Al estar ya cuantizado en GGUF (desde Q2_K hasta f16), es desplegable en hardware de consumo sin necesidad de GPU de datacenter, lo que lo hace accesible para prototipado e investigacion aplicada.

La informacion publicada por el autor es escasa: la model card del repositorio GGUF es una plantilla generica de mradermacher y no detalla datos de entrenamiento, contexto nativo ni resultados de evaluacion. Por tanto, esta ficha distingue explicitamente entre datos confirmados (parametros, tamanos de cuantizacion, licencia, idioma) y datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de la familia Qwen3.5, segun el nombre del modelo; detalles no disponibles) |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mas mmproj Q8_0 y f16 para vision |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (conversion desde safetensors/transformers); repo de 83,0 GB |
| Ajuste declarado | reinforcement-learning (pipeline) |
| Multimodalidad | si, via ficheros mmproj (proyector vision-lenguaje) |

## Arquitectura y entrenamiento
El modelo se presenta como un ajuste fino por aprendizaje por refuerzo del checkpoint codercat/AtmosRegime-Qwen3.5-9B-RL, que a su vez deriva de la familia Qwen3.5 (el sufijo "Qwen3.5-9B" asi lo indica). No hay informacion publica sobre el numero de tokens de entrenamiento, la composicion del dataset, el algoritmo de RL empleado (PPO, GRPO, DPO u otro) ni la existencia de etapas de SFT previas. La presencia de ficheros mmproj confirma que el modelo base integra un codificador visual y un proyector hacia el espacio del modelo de lenguaje, pero no se documenta la resolucion de imagen admitida ni el volumen de datos multimodales usados.

La innovacion tecnica destacable, a nivel de esta publicacion, es la propia cadena de cuantizacion: mradermacher ha generado cuantizaciones estaticas (no imatrix) en doce niveles de precision, desde Q2_K (3,9 GB) hasta f16 (18,0 GB), lo que permite ajustar el compromiso entre calidad y VRAM de forma granular. El autor advierte que las cuantizaciones ponderadas/imatrix no estan disponibles en el momento de publicacion.

## Capacidades
- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Razonamiento cientifico en el dominio atmosferico (tag `atmospheric-science`).
- Computacion cientifica y asistencia a tareas de calculo (tag `scientific-computing`).
- Procesamiento de imagen via proyector multimodal (mmproj), con capacidad presumible de responder sobre contenido visual.
- Alineamiento por refuerzo orientado a mejorar el comportamiento en tareas del dominio (segun el pipeline declarado).
- Soporte multilingue limitado: solo ingles declarado.
- Tool calling / function calling: no disponible (no documentado).
- Modo thinking explicito: no disponible (no documentado).
- Soporte de audio: no disponible.

## Casos de uso
- Consulta tecnica sobre regimenes atmosfericos: el modelo puede responder preguntas sobre patrones de circulacion, clasificacion de regimenes climaticos y terminologia meteorologica, aprovechando el ajuste RL especifico del dominio.
- Analisis de imagenes meteorologicas: gracias al proyector mmproj, puede recibir mapas sinopticos, imagenes satelitales o graficos de presion y describir o interpretar su contenido en texto.
- Asistente de investigacion cientifica: apoyo a la redaccion de notas tecnicas, resumenes de literatura y explicacion de conceptos de ciencias de la atmosfera en ingles.
- Prototipado en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q4_K_S y Q4_K_M (5,5-5,7 GB) permiten ejecutar el modelo en GPU de consumo de gama media-alta, ideal para pruebas de concepto.
- Pipeline de extraccion de informacion de documentos cientificos: procesar PDFs o capturas de figuras cientificas y generar descripciones estructuradas, combinando vision y texto.
- Educacion y divulgacion: generacion de explicaciones didacticas sobre fenomenos atmosfericos a partir de imagenes o diagramas, con un registro conversacional.
- Integracion en herramientas locales tipo Ollama o llama.cpp: al ser GGUF, puede incorporarse en flujos de escritorio o entornos air-gapped sin dependencia de APIs externas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y no se dispone de evaluaciones del checkpoint base codercat/AtmosRegime-Qwen3.5-9B-RL en la informacion proporcionada.

## Requisitos de hardware
- VRAM estimada (solo pesos, sin overhead de contexto): Q2_K ~3,9 GB; Q3_K_S ~4,4 GB; Q3_K_M ~4,7 GB; Q3_K_L ~5,0 GB; IQ4_XS ~5,3 GB; Q4_K_S ~5,5 GB; Q4_K_M ~5,7 GB; Q5_K_S ~6,4 GB; Q5_K_M ~6,6 GB; Q6_K ~7,5 GB; Q8_0 ~9,6 GB; f16 ~18,0 GB.
- Vision: anadir ~0,7 GB (mmproj Q8_0) o ~1,0 GB (mmproj f16) a la VRAM del modelo de texto.
- GPU de consumo: Q4_K_M (~5,7 GB) cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 12 GB y RTX 4090 24 GB con margen para contexto. Q8_0 (~9,6 GB) requiere al menos 12 GB. f16 (~18 GB) exige 24 GB (RTX 4090) o GPU profesional.
- GPU de datacenter: A100 40/80 GB, H100 80 GB y L40S 48 GB admiten cualquier cuantizacion, incluida f16 con contexto largo.
- Despliegue: llama.cpp (formato nativo), Ollama (importacion de GGUF), LM Studio, y servidores compatibles con la API de endpoints (tag `endpoints_compatible`). vLLM y TGI no consumen GGUF de forma nativa; requeririan el checkpoint original en safetensors.
- Latencia y throughput: no disponibles; dependen de la GPU, del backend y de la longitud de contexto, ninguno documentado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Formato GGUF disponible |
|---|---|---|---|---|---|
| AtmosRegime-Qwen3.5-9B-RL (este) | ~9B | no disponible | Ciencia atmosferica + vision | Apache 2.0 | Si (12 cuantizaciones) |
| Qwen3.5-9B (base de la familia) | ~9B | no disponible en esta informacion | Generalista | no disponible en esta informacion | Si (por otros conversores) |
| Llama 3.1 8B Instruct | 8B | 128K | Generalista | Llama 3.1 Community License | Si |
| Mistral 7B Instruct | 7B | 32K | Generalista | Apache 2.0 | Si |

La comparacion con Qwen3.5-9B base es la mas directa, ya que AtmosRegime deriva de ella; sin embargo, los datos de contexto y licencia de esa familia no se detallan en la informacion proporcionada. Frente a Llama 3.1 8B y Mistral 7B, este modelo sacrifica generalidad y cobertura multilingue a cambio de especializacion en dominio atmosferico y soporte multimodal, manteniendo una licencia permisiva (Apache 2.0) frente a la licencia comunitaria de Llama.

## Limitaciones y advertencias
- Idiomas: solo ingles declarado; el rendimiento en castellano no esta garantizado y probablemente sea degradado.
- Sesgos: no documentados; al ser un ajuste RL sobre un dominio cientifico concreto, puede heredar sesgos del corpus de entrenamiento original, no publicados.
- Alucinacion: riesgo no cuantificado; en dominios cientificos especializados el modelo puede generar referencias, datos o cifras plausibles pero incorrectas, por lo que requiere verificacion humana.
- Contexto: la longitud de ventana no esta documentada, lo que impide planificar tareas de contexto largo con garantias.
- Cuantizaciones estaticas: el autor advierte que no hay versiones imatrix/ponderadas; las cuantizaciones de baja precision (Q2_K, Q3_K_M) pueden degradar notablemente la calidad, especialmente en tareas de razonamiento cientifico.
- Multimodalidad: solo se confirma la existencia del proyector, no la resolucion de imagen admitida ni la calidad del alineamiento vision-lenguaje.
- Produccion: sin benchmarks publicados, no se recomienda desplegar en entornos criticos sin una evaluacion propia previa en el dominio objetivo.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del checkpoint base codercat/AtmosRegime-Qwen3.5-9B-RL, no detallada en la informacion disponible.
- Trazabilidad: repositorio con 0 descargas y 0 likes en el momento de la consulta; ausencia de validacion comunitaria.

## Enlaces
- Repositorio GGUF: https://huggingface.co/mradermacher/AtmosRegime-Qwen3.5-9B-RL-GGUF
- Modelo base: https://huggingface.co/codercat/AtmosRegime-Qwen3.5-9B-RL
- Pagina de descargas del autor: https://hf.tst.eu/model#AtmosRegime-Qwen3.5-9B-RL-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
