# mradermacher/hallutok-SpaceLLM-3B-GGUF

## Resumen

hallutok-SpaceLLM-3B-GGUF es la version cuantizada en formato GGUF del modelo hallutok-SpaceLLM-3B, un ajuste fino por adaptacion de dominio sobre Llama 3.2 de 3.000 millones de parametros orientado al sector aeroespacial. El modelo original lo desarrolla joel-pawar, mientras que esta distribucion en GGUF la publica mradermacher, un conocido generador de cuantizaciones estaticas para la comunidad de inferencia local. El repositorio contiene unicamente los pesos cuantizados, no el modelo base ni los scripts de entrenamiento.

El modelo aborda la necesidad de un asistente conversacional especializado en terminologia y conceptos de astronautica, ingenieria aeroespacial y agencias como NASA, SpaceX o ISRO. Al partir de Llama 3.2 3B, hereda una arquitectura transformer densa con atencion por grupos (GQA) y una ventana de contexto de 128.000 tokens, aunque el ajuste se ha realizado mediante LoRA/QLoRA con Unsloth, lo que permite un entrenamiento eficiente en recursos limitados.

Su relevancia actual radica en la posibilidad de desplegar un modelo de dominio especifico en hardware de consumo: las cuantizaciones Q4_K_M ocupan aproximadamente 2,1 GB y pueden ejecutarse en GPUs con 4-6 GB de VRAM o incluso en CPU mediante llama.cpp. Es un ejemplo tipico de modelo pequeno especializado, util para prototipos, entornos con restricciones de privacidad o aplicaciones educativas de tematica espacial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.2 3B) con GQA |
| Parametros totales | 3.212.749.888 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens (heredado de Llama 3.2; no confirmado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.2 3B: un transformer decoder-only denso con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y atencion por grupos (GQA) para reducir el coste de memoria del KV cache. El modelo original se ha adaptado al dominio aeroespacial mediante LoRA y QLoRA, utilizando la libreria Unsloth para acelerar el ajuste fino. La model card del repositorio GGUF no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

La innovacion principal de esta publicacion no reside en el entrenamiento, sino en la distribucion: mradermacher genera cuantizaciones estaticas con llama.cpp, cubriendo desde Q2_K (1,5 GB) hasta f16 (6,5 GB). No se han publicado cuantizaciones ponderadas por matriz de importancia (imatrix) para este modelo en el momento de la ficha, segun indica el propio autor. El proceso de conversion sigue el pipeline estandar de llama.cpp para pesos en formato Hugging Face.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en vocabulario y conceptos del dominio aeroespacial (misiones, propulsion, orbita, agencias espaciales).
- Razonamiento basico y respuesta a preguntas tecnicas dentro del dominio de astronautica.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, heredada de Llama 3.2.
- Soporte de tool calling y function calling: no confirmado en la model card; probablemente limitado o no garantizado tras el ajuste fino.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: solo ingles declarado; el resto de idiomas de Llama 3.2 no estan garantizados tras el ajuste.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Asistente educativo de tematica espacial: el modelo puede responder preguntas sobre misiones, orbitas o propulsion en ingles, aprovechando su ajuste de dominio y su bajo coste de despliegue en un portatil con GPU integrada.
- Prototipado rapido de chatbots especializados: con la cuantizacion Q4_K_M (2,1 GB) se puede montar un servicio de chat en local con llama.cpp u Ollama para validar la utilidad de un asistente aeroespacial antes de invertir en un modelo mayor.
- Generacion de documentacion tecnica preliminar: redaccion de resumenes o borradores sobre conceptos de astronautica, siempre con revision humana dada la tendencia a la alucinacion de modelos de 3B.
- Clasificacion y etiquetado de textos del dominio: uso del modelo como base para tareas de extraccion de entidades o categorizacion de articulos sobre NASA, SpaceX o ISRO, con fine-tuning adicional si es necesario.
- Despliegue en entornos con restricciones de privacidad o conectividad: al ejecutarse en CPU o GPU de consumo, permite procesar textos sensibles sin enviarlos a la nube.
- Base para investigacion en adaptacion de dominio: sirve como punto de partida reproducible para estudiar el efecto de LoRA/QLoRA sobre un modelo pequeno en un dominio tecnico concreto.
- Demos y talleres de IA open source: su tamano reducido y su licencia Apache 2.0 facilitan su uso en formacion y talleres sin coste de infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2,5 GB con cuantizaciones Q2_K a Q4_K_M; unos 3,5 GB con Q8_0; unos 6,5 GB con f16.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en el extremo alto, A100 o H100 no aportan ventaja significativa por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 4-6 GB de VRAM; tambien en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, vLLM o TGI (no aplicable directamente a este repo GGUF).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en una RTX 4090 con Q4_K_M se espera un throughput alto por el reducido tamano, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| hallutok-SpaceLLM-3B-GGUF | 3,2B | 128k (heredado, no confirmado) | Apache 2.0 | GGUF | Ajuste de dominio aeroespacial, solo ingles |
| Llama 3.2 3B Instruct | 3,2B | 128k | Llama 3.2 Community License | safetensors, GGUF | Modelo base generalista, multilingue |
| Qwen2.5 3B Instruct | 3,1B | 32k | Apache 2.0 | safetensors, GGUF | Generalista, buen rendimiento en codigo y matematicas |
| Phi-3.5-mini | 3,8B | 128k | MIT | safetensors, GGUF | Generalista, fuerte en razonamiento |

La comparativa se limita a caracteristicas estructurales; no hay datos de benchmarks para hallutok-SpaceLLM-3B que permitan una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Modelo de 3B parametros: alta propension a alucinaciones, especialmente en datos tecnicos precisos (fechas, especificaciones de misiones, cifras de propulsion); requiere verificacion humana en contextos criticos.
- Solo ingles declarado: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas.
- El ajuste fino con LoRA puede degradar capacidades generales del modelo base, como el razonamiento matematico o el codigo, en favor de la especializacion de dominio.
- No hay informacion sobre el dataset de entrenamiento ni sobre posibles sesgos introducidos; se desconoce la calidad y cobertura de los datos aeroespaciales utilizados.
- Soporte de tool calling y comportamiento agentico no documentados; no asumir su funcionamiento en produccion sin evaluacion previa.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan notablemente la calidad; para uso real se recomienda Q4_K_M o superior.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Llama 3.2 tiene su propia licencia comunitaria que puede imponer restricciones adicionales; conviene revisar ambas.
- Repositorio con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/hallutok-SpaceLLM-3B-GGUF
- Modelo base: https://huggingface.co/joel-pawar/hallutok-SpaceLLM-3B
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#hallutok-SpaceLLM-3B-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
