# mradermacher/Clary-3.0-Titanium-4B-GGUF

## Resumen

Clary-3.0-Titanium-4B-GGUF es la distribucion en formato GGUF del modelo AuroraSystem/Clary-3.0-Titanium-4B, cuantizado por mradermacher. Se trata de un modelo de lenguaje bilingue ruso-ingles de aproximadamente 4.022 millones de parametros, construido sobre la arquitectura Qwen3 segun las etiquetas del repositorio, y afinado para razonamiento, instrucciones y conversacion. El modelo original lo desarrolla AuroraSystem; esta variante solo aporta los pesos cuantizados listos para inferencia local con llama.cpp y derivados.

La relevancia de esta ficha esta en el formato: al ofrecer cuantizaciones estaticas desde Q2_K (1,8 GB) hasta f16 (8,2 GB), permite desplegar un modelo de 4B en hardware de consumo con requisitos de VRAM modestos. La licencia Apache 2.0 y el enfasis bilingue ru/en lo hacen atractivo para productos dirigidos al mercado rusoparlante, donde la oferta de modelos abiertos de calidad es mas limitada que en ingles.

No se dispone de informacion publica sobre el proceso de entrenamiento, la composicion del dataset ni resultados de benchmarks en la documentacion proporcionada. La model card del cuantizador se limita a listar los ficheros GGUF generados y a remitir al modelo base para cualquier detalle adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta qwen3; detalles no disponibles) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ru, en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo base sigue la arquitectura Qwen3, segun la etiqueta `qwen3` incluida en el repositorio. Se trata de un transformer decoder-only de 4.022 millones de parametros con atencion causal estandar; no hay indicios de que sea un modelo MoE ni hibrido. El repositorio cuantizado no incluye metadatos sobre numero de capas, dimensiones ocultas, cabezas de atencion ni longitud de contexto, por lo que estos datos no estan disponibles.

En cuanto al entrenamiento, la model card no documenta el numero de tokens, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o instruction tuning supervisado. Las etiquetas indican `instruction-tuning`, `reasoning` y `chat`, lo que sugiere un afinado para seguir instrucciones y mantener conversaciones, pero no se aportan detalles tecnicos verificables. Tampoco se describe ninguna innovacion arquitectonica especifica (decodificacion especulativa, atencion lineal, etc.). El proceso de cuantizacion aplicado por mradermacher es estatico (quantize_version 2, output_tensor_quantised 1) y no incluye cuantizaciones ponderadas con imatrix, segun indica el propio autor.

## Capacidades

- Generacion de texto conversacional en ruso e ingles, con enfasis en instruction-following segun las etiquetas del repositorio.
- Razonamiento (etiqueta `reasoning`), aunque no se especifica si dispone de modo thinking explicito ni de trazas de razonamiento separadas.
- Capacidades bilingues ru/en; no se documenta soporte para otros idiomas.
- Ajuste para chat multi-turno (etiqueta `chat`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision o audio: no disponibles; el modelo es solo texto.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`), lo que sugiere integracion con infraestructuras de inferencia tipo Hugging Face Inference Endpoints.

## Casos de uso

- Atencion al cliente en ruso: el modelo puede gestionar conversaciones multi-turno en ruso con un coste de inferencia bajo gracias a su tamano de 4B y a las cuantizaciones Q4_K_M (2,6 GB), adecuadas para desplegar en una unica GPU de consumo o incluso en CPU.
- Asistentes internos bilingues ru/en: util para empresas con equipos mixtos que necesiten un asistente que alterne entre ambos idiomas sin cambiar de modelo, con despliegue on-premise por la licencia Apache 2.0.
- Generacion de contenido y resumenes en ruso: redaccion de borradores, resumenes de documentos y reescritura de textos, ejecutables en portatiles con GPU de 8 GB usando Q4_K_S o Q5_K_M.
- Traduccion asistida ru-en y en-ru: aunque no se documenta como modelo de traduccion, su naturaleza bilingue permite usarlo como apoyo en pipelines de localizacion con revision humana.
- Prototipado rapido de chatbots: la disponibilidad de cuantizaciones desde 1,8 GB (Q2_K) permite iterar en entornos con recursos limitados, como notebooks o contenedores sin GPU dedicada.
- Educacion y tutoria en ruso: generacion de explicaciones y material didactico en ruso con un modelo abierto y desplegable en infraestructura propia, evitando dependencias de APIs externas.
- Investigacion en modelos bilingues de bajo coste: como baseline para experimentos de evaluacion o fine-tuning adicional en ruso, gracias a la licencia permisiva y al formato GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K (1,8 GB): ~2,5-3 GB de VRAM.
  - Q4_K_M (2,6 GB): ~3,5-4 GB de VRAM.
  - Q5_K_M (3,0 GB): ~4-4,5 GB de VRAM.
  - Q8_0 (4,4 GB): ~5,5-6 GB de VRAM.
  - f16 (8,2 GB): ~9-10 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer con 6-8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090) para cuantizaciones Q4-Q8. Para f16, se recomienda una GPU con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, A10, L4). Para despliegue en servidor, A100 o H100 son sobredimensionadas para un modelo de 4B y solo se justifican por concurrencia alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas usando Q4_K_M o inferiores. Tambien es viable en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, text-generation-webui, y servidores compatibles con GGUF como llama-cpp-python o vLLM (soporte GGUF experimental). El modelo base en safetensors puede servirse con TGI o vLLM.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Clary-3.0-Titanium-4B (esta ficha) | 4,02B | no disponible | ru, en | Apache 2.0 | GGUF, safetensors |
| Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | multilingue (incluye ru) | Apache 2.0 | GGUF, safetensors |
| Qwen3-4B (familia base) | ~4B | no disponible en esta ficha | multilingue | Apache 2.0 | GGUF, safetensors |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 tokens | multilingue (ru limitado) | Llama 3.2 Community License | GGUF, safetensors |

La comparativa se basa en datos publicos de los modelos alternativos; no se dispone de benchmarks del modelo Clary para comparar rendimiento real. La ventaja principal de Clary-3.0-Titanium-4B frente a alternativas genericas es su especializacion bilingue ru/en, mientras que modelos como Llama-3.2-3B o Qwen2.5-3B ofrecen contextos documentados y ecosistemas mas amplios.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido y debe validarse en el caso de uso concreto.
- Riesgo de alucinacion inherente a modelos de 4B, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Cobertura linguistica limitada a ruso e ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Longitud de contexto no documentada; no se puede asumir una ventana larga sin verificacion empirica.
- Las cuantizaciones de baja calidad (Q2_K, Q3_K_S, Q3_K_M) degradan notablemente la calidad; la propia model card marca Q3_K_M como "lower quality". Para produccion se recomienda Q4_K_M o superior.
- No hay cuantizaciones ponderadas con imatrix disponibles; el autor indica que podrian no aparecer.
- Aunque la licencia es Apache 2.0, conviene verificar la procedencia de los datos de entrenamiento del modelo base (AuroraSystem), no documentada en esta ficha.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por la comunidad.
- Sesgos conocidos: no documentados; se recomienda auditoria propia antes de uso en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Clary-3.0-Titanium-4B-GGUF
- Modelo base: https://huggingface.co/AuroraSystem/Clary-3.0-Titanium-4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Clary-3.0-Titanium-4B-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
