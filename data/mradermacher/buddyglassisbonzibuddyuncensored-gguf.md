# mradermacher/BuddyGlassIsBonziBuddyUncensored-GGUF

## Resumen

BuddyGlassIsBonziBuddyUncensored-GGUF es la version cuantizada en formato GGUF del modelo darkc0de/BuddyGlassIsBonziBuddyUncensored, publicada por el usuario mradermacher, conocido por distribuir cuantizaciones estaticas de modelos de la comunidad. El modelo original es un merge generado con mergekit, orientado a conversacion en ingles y sin aparente filtrado de contenido (de ahi el sufijo "Uncensored"). Cuenta con 23.572.403.200 parametros totales (aproximadamente 23,6 mil millones), lo que lo situa en la categoria de modelos densos de tamano medio-grande.

La relevancia de esta ficha es practica: se trata de la unica via publica para ejecutar el modelo original en hardware de consumo mediante llama.cpp y derivados, ya que mradermacher ofrece un espectro completo de cuantizaciones estaticas desde Q2_K hasta Q8_0. No obstante, la informacion tecnica disponible es muy limitada: la model card del repositorio GGUF no documenta arquitectura interna, contexto, datos de entrenamiento ni resultados de evaluacion, y la licencia no esta declarada.

Por tanto, esta ficha debe leerse como una descripcion de las caracteristicas verificables del artefacto (parametros, cuantizaciones, formato, idioma declarado) y no como una evaluacion de calidad del modelo, para la cual no hay datos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo original generado con mergekit; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 23.572.403.200 (~23,6 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay imatrix/weighted publicadas por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de 161,4 GB con todos los archivos); el modelo base se distribuye en formato transformers |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. La unica pista tecnica es la etiqueta `mergekit` en el repositorio, que indica que darkc0de/BuddyGlassIsBonziBuddyUncensored se genero mediante fusion de pesos de otros modelos (merge) y no mediante un entrenamiento desde cero. El nombre sugiere una fusion de caracter tematico (referencias a BonziBuddy) con eliminacion de alineamiento o filtros ("Uncensored"), pero no se documenta que modelos se fusionaron, con que metodo (SLERP, TIES, DARE, passthrough, etc.) ni con que hiperparametros.

Tampoco hay datos sobre tokens de entrenamiento, composicion del dataset, fases de RLHF/DPO ni innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.). El repositorio GGUF es una conversion estatica del modelo base: segun los metadatos internos de la model card, se uso `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`, es decir, conversion desde pesos Hugging Face con cuantizacion de tensores de salida. No se han publicado cuantizaciones ponderadas con imatrix para este modelo.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite servirlo mediante APIs compatibles con OpenAI a traves de llama.cpp u otros runners.
- Ejecucion local en CPU y GPU mediante el ecosistema GGUF (llama.cpp, Ollama, LM Studio, entre otros).
- Capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes o modo thinking: no disponibles o no documentadas en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` del repositorio.
- Al ser un modelo "uncensored", es previsible que tenga menos rechazos ante peticiones sensibles, aunque este extremo no esta documentado formalmente.

## Casos de uso

- Experimentacion con merges de la comunidad: el modelo permite reproducir y evaluar localmente el comportamiento de una fusion publicada sin infraestructura de GPU de datacenter, usando las cuantizaciones Q4_K_M (14,4 GB) o Q5_K_M (16,9 GB) en una GPU de consumo con 16-24 GB de VRAM.
- Investigacion sobre alineamiento y censura: al tratarse de un modelo marcado como "uncensored", puede emplearse en estudios controlados sobre tasas de rechazo, sesgo y comportamiento ante prompts sensibles, comparandolo con su contrapartida alineada.
- Prototipado de chatbots conversacionales en ingles: la etiqueta `conversational` y la compatibilidad con endpoints permiten montar un servicio de chat local con llama.cpp server y una API compatible con OpenAI para pruebas de integracion.
- Despliegue en entornos con hardware limitado: las cuantizaciones Q2_K (9,0 GB) y Q3_K_S (10,5 GB) permiten ejecutar un modelo de ~23,6 B en equipos con 12-16 GB de VRAM o incluso en CPU con suficiente RAM, algo inviable con los pesos originales en fp16.
- Evaluacion comparativa de cuantizaciones: el espectro completo de Q2_K a Q8_0 facilita medir la degradacion de perplejidad y calidad entre niveles, siguiendo la metodologia de las graficas de ikawrakow y Artefact2 enlazadas en la model card.
- Generacion creativa y escritura asistida en ingles: el caracter tematico y sin filtros del modelo puede aprovecharse para ficcion, role-play y generacion de dialogos donde los modelos alineados suelen rechazar ciertos temas.
- Base para futuras fusiones o fine-tuning: al estar disponible en formato transformers y GGUF, puede servir como componente en nuevos merges o como punto de partida para ajuste supervisado, siempre que la licencia (no declarada) lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada a partir del tamano de cada archivo GGUF):
  - Q2_K: ~9,0 GB de pesos; ~10-11 GB en ejecucion.
  - Q3_K_M: ~11,6 GB de pesos; ~13 GB en ejecucion.
  - IQ4_XS: ~13,0 GB de pesos; ~14-15 GB en ejecucion.
  - Q4_K_M: ~14,4 GB de pesos; ~16 GB en ejecucion.
  - Q5_K_M: ~16,9 GB de pesos; ~18-19 GB en ejecucion.
  - Q6_K: ~19,4 GB de pesos; ~21 GB en ejecucion.
  - Q8_0: ~25,2 GB de pesos; ~27 GB en ejecucion.
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q8_0 se recomienda A100 40 GB, H100 o RTX 4090 con offload parcial a CPU. Para Q2_K y Q3_K_S bastan GPU de 12-16 GB (RTX 4070 Ti, RTX 4080, RTX 4060 Ti 16 GB).
- Cabe en GPU de consumo: si, en la mayoria de cuantizaciones hasta Q6_K con 24 GB de VRAM; Q8_0 requiere 32 GB o desbordamiento a RAM.
- Opciones de despliegue: llama.cpp (CLI y llama-server), Ollama, LM Studio, text-generation-webui, koboldcpp y cualquier runner compatible con GGUF y endpoints OpenAI.
- Latencia y throughput: no disponibles; dependen del hardware y del nivel de cuantizacion. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas verificables frente a alternativas de tamano y formato comparables.

| Modelo | Parametros | Contexto | Formato GGUF | Licencia | Notas |
|---|---|---|---|---|
| BuddyGlassIsBonziBuddyUncensored-GGUF | ~23,6 B | no disponible | Si (Q2_K a Q8_0) | no disponible | Merge comunitario sin benchmarks publicados |
| Mistral Small 24B (GGUF) | ~24 B | 32k (segun version) | Si | Apache 2.0 (segun version) | Modelo oficial con evaluaciones publicadas |
| Qwen2.5 32B (GGUF) | ~32 B | 32k-128k (segun version) | Si | Apache 2.0 (segun version) | Mayor tamano, benchmarks publicados |
| Gemma 2 27B (GGUF) | ~27 B | 8k | Si | Gemma Terms | Modelo oficial con evaluaciones publicadas |

La comparativa con modelos oficiales es desfavorable en trazabilidad: frente a ellos, este merge carece de licencia declarada, benchmarks y documentacion de entrenamiento, aunque ofrece un perfil tematico y sin filtros que los modelos oficiales no cubren.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantia de uso comercial; en la practica, la ausencia de licencia implica que los derechos no estan concedidos de forma explicita.
- Ausencia total de benchmarks: no se puede afirmar nada sobre su calidad en MMLU, HumanEval, GSM8K ni tareas similares.
- Riesgo elevado de alucinacion y de comportamiento impredecible: al ser un merge sin evaluacion publicada, la calidad factual y la coherencia no estan verificadas.
- Modelo "uncensored": es probable que genere contenido sensible, ofensivo o inseguro sin filtros; no es apto para produccion orientada al publico sin moderacion adicional.
- Solo ingles declarado: no hay soporte multilingue documentado; el rendimiento en castellano es incierto.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo sin verificar experimentalmente la ventana real.
- Cuantizaciones estaticas sin imatrix: el propio autor advierte que las versiones ponderadas no estan disponibles, por lo que la calidad relativa de las cuantizaciones pequenas puede ser inferior a la de otros repositorios con imatrix.
- Origen comunitario y trazabilidad limitada: se desconoce que modelos se fusionaron y con que metodo, lo que dificulta auditar sesgos o procedencia de los datos.
- Repositorio de 161,4 GB: descargar el conjunto completo es costoso; conviene bajar solo el archivo de cuantizacion necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/BuddyGlassIsBonziBuddyUncensored-GGUF
- Modelo base: https://huggingface.co/darkc0de/BuddyGlassIsBonziBuddyUncensored
- Pagina de descargas del autor: https://hf.tst.eu/model#BuddyGlassIsBonziBuddyUncensored-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
