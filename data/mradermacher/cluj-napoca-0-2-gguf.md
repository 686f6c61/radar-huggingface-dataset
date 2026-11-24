# mradermacher/Cluj-Napoca-0.2-GGUF

## Resumen

Cluj-Napoca-0.2-GGUF es la distribucion en formato GGUF del modelo Mihaiii/Cluj-Napoca-0.2, publicada por el cuantizador mradermacher. Se trata de un modelo conversacional de aproximadamente 25.460 millones de parametros (25,46 B) derivado de la familia Yi-34B de 01-ai, segun indica la propia licencia referenciada (yi-license). El repositorio incluye unicamente pesos cuantizados estaticos en GGUF, pensados para inferencia local con llama.cpp y herramientas compatibles, no los pesos originales en safetensors.

La relevancia de esta ficha reside en que permite ejecutar un modelo de ~25 B en hardware de consumo mediante cuantizaciones que van de Q2_K (9,6 GB) a Q8_0 (27,2 GB), lo que lo situa en el rango de GPU con 12-24 GB de VRAM o incluso CPU con suficiente RAM. El autor del cuantizado ofrece tambien una variante con cuantizacion ponderada/imatrix en un repositorio separado (Cluj-Napoca-0.2-i1-GGUF), que suele ofrecer mejor calidad por tamano que los cuantizados estaticos.

La informacion disponible es limitada: no se publican detalles de arquitectura mas alla de la herencia de Yi-34B, ni datos de entrenamiento, ni benchmarks. El modelo esta etiquetado como conversacional y solo en ingles. Esta ficha recoge lo verificable y marca explicitamente como "no disponible" todo aquello que la model card y los metadatos no aportan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivado de la familia Yi-34B de 01-ai, segun la licencia referenciada) |
| Parametros totales | 25.463.237.632 (~25,46 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticos); variantes i1/imatrix en repositorio separado |
| Idiomas soportados | ingles (en) |
| Licencia | yi-license (other), enlazada a https://huggingface.co/01-ai/Yi-34B/blob/main/LICENSE |
| Formato de pesos | GGUF (solo cuantizados; no se incluyen safetensors en este repo) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Mihaiii/Cluj-Napoca-0.2 en la documentacion proporcionada. La unica referencia estructural es la licencia yi-license, que apunta a la familia Yi-34B de 01-ai, lo que sugiere una base transformer decoder-only de gran tamano, pero no se confirma en la model card ni en los metadatos. El numero de parametros real (25,46 B) no coincide exactamente con los 34 B de Yi-34B, por lo que no puede afirmarse que sea un derivado directo sin poda o modificacion; ese dato no esta disponible.

Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste instruccional. La model card del cuantizador es puramente operativa: describe los ficheros GGUF, sus tamanos y recomendaciones de uso, sin informacion sobre el entrenamiento del modelo subyacente. Cualquier afirmacion sobre innovaciones tecnicas (atencion lineal, decodificacion especulativa, etc.) seria especulativa y no se incluye.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y orientado a dialogos multi-turno, aunque no se detallan capacidades especificas.
- Razonamiento y codigo: no disponible; no se documentan capacidades de codigo, matematicas ni razonamiento explicito.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Agentes y razonamiento multi-paso: no disponible; no se menciona soporte.
- Capacidades multilingues: limitadas al ingles segun los metadatos (language: en).
- Capacidades especiales (vision, audio, thinking mode): no disponible; no se documentan.
- Ejecucion local: al estar en GGUF, es compatible con llama.cpp, Ollama y otros runners que acepten este formato.

## Casos de uso

- Inferencia local en estaciones de trabajo: con cuantizaciones Q4_K_M (15,4 GB) o Q5_K_M (18,1 GB) el modelo cabe en GPU de 24 GB (RTX 3090/4090) y permite generar texto conversacional sin depender de la nube, util para prototipado y pruebas de privacidad.
- Despliegue en CPU con RAM abundante: la variante Q2_K (9,6 GB) o Q3_K_M (12,5 GB) puede ejecutarse en servidores sin GPU dedicada, adecuado para entornos de desarrollo o demos de bajo coste.
- Chatbot de asistencia en ingles: al ser un modelo conversacional en ingles, puede integrarse en flujos de atencion al cliente en ese idioma, aunque sin garantias documentadas sobre contexto maximo ni calidad medida.
- Experimentacion academica con cuantizacion: comparar la degradacion de calidad entre Q4_K_S, IQ4_XS y Q8_0 sobre el mismo modelo base es un caso de uso directo para investigadores que estudian el impacto de la cuantizacion.
- Base para fine-tuning o evaluacion comparativa: el modelo original (Mihaiii/Cluj-Napoca-0.2) puede servir como punto de partida, y esta version GGUF como referencia de inferencia para comparar con otros modelos de ~25 B.
- Integracion en pipelines de generacion de texto offline: mediante llama.cpp o bindings de Python, se puede incorporar en herramientas de resumen, redaccion o generacion de borradores en entornos sin conectividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto): Q2_K ~9,6 GB; Q3_K_M ~12,5 GB; IQ4_XS ~13,9 GB; Q4_K_M ~15,4 GB; Q5_K_M ~18,1 GB; Q6_K ~21,0 GB; Q8_0 ~27,2 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con margen; A100 40/80 GB o H100 para Q8_0 y contextos largos; GPUs de 12-16 GB solo para Q2_K/Q3_K con contexto reducido.
- Cabe en consumer GPU: si, en RTX 3090/4090 para cuantizaciones hasta Q5_K_M; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) para Q3_K_L o IQ4_XS con contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el repositorio declara "endpoints_compatible" y libreria transformers, pero al ser GGUF el uso principal es llama.cpp/Ollama.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Cluj-Napoca-0.2-GGUF (este) | ~25,46 B | no disponible | yi-license | GGUF | Solo ingles; sin benchmarks publicados |
| Yi-34B (01-ai) | 34 B | no disponible en esta ficha | yi-license | safetensors/GGUF | Referencia de la licencia; base probable de la familia |
| Mihaiii/Cluj-Napoca-0.2 (base) | ~25,46 B | no disponible | yi-license | safetensors | Modelo original sin cuantizar; este repo es su version GGUF |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al no publicarse informacion sobre el dataset de entrenamiento, no puede evaluarse el sesgo.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones publicadas no hay evidencia sobre su fiabilidad factual.
- Limitacion de idioma: solo ingles segun los metadatos; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Longitud de contexto: no disponible; no debe asumirse una ventana concreta sin consultar el modelo base.
- Restricciones de licencia: yi-license (other), enlazada a la licencia de Yi-34B; es imprescindible revisar sus terminos antes de uso comercial, ya que puede incluir condiciones especificas (por ejemplo, registro o restricciones de uso).
- Caveat de produccion: el repositorio contiene solo cuantizados estaticos; para maxima calidad se recomienda valorar las variantes i1/imatrix del repositorio Cluj-Napoca-0.2-i1-GGUF.
- Falta de documentacion: la model card no aporta informacion sobre entrenamiento, contexto ni evaluacion, lo que dificulta la validacion en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Cluj-Napoca-0.2-GGUF
- Modelo base: https://huggingface.co/Mihaiii/Cluj-Napoca-0.2
- Cuantizados i1/imatrix: https://huggingface.co/mradermacher/Cluj-Napoca-0.2-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Cluj-Napoca-0.2-GGUF
- Licencia Yi-34B: https://huggingface.co/01-ai/Yi-34B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
