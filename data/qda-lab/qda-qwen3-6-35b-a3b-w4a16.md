# qda-lab/QDA-Qwen3.6-35B-A3B-W4A16

## Resumen

QDA-Qwen3.6-35B-A3B-W4A16 es una cuantizacion de 4 bits (pesos) con activaciones en 16 bits del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario qda-lab. El modelo base es un transformer de tipo Mixture of Experts (MoE) de la familia Qwen3.6, con 35.951.822.704 parametros totales segun los pesos en safetensors, de los cuales solo una fraccion se activa por token (designacion A3B, aproximadamente 3 mil millones de parametros activos). La cuantizacion emplea el formato compressed-tensors con esquema W4A16, lo que reduce el peso del repositorio a 22,4 GB y permite servir el modelo directamente en vLLM.

El interes practico de esta publicacion radica en que permite desplegar un MoE de ~36 mil millones de parametros en hardware mucho mas modesto que el modelo original en precision completa, manteniendo unos resultados de evaluacion notables: el autor reporta una media de 79,0 % en un conjunto de benchmarks que incluye matematicas de competicion (AIME 2025 + HMMT Feb 2026), GPQA-Diamond, LiveCodeBench v6 e IFBench. Es, por tanto, una opcion orientada a inferencia en produccion con vLLM, no un modelo entrenado desde cero.

La informacion disponible es limitada: la model card es muy escueta y no detalla la licencia, los idiomas soportados ni el proceso de calibracion de la cuantizacion. Los datos de arquitectura y entrenamiento del modelo base tampoco se incluyen en la informacion proporcionada, por lo que se marcan como no disponibles cuando corresponde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE); tag de arquitectura `qwen3_5_moe` |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3 mil millones (designacion A3B del modelo base; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (pesos de 4 bits, activaciones de 16 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion, no un entrenamiento nuevo. El modelo base Qwen/Qwen3.6-35B-A3B es un transformer con capas de mezcla de expertos (MoE): de los 35,95 mil millones de parametros totales, solo un subconjunto de aproximadamente 3 mil millones se activa por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamano. La model card no proporciona detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base.

La innovacion tecnica de esta publicacion es la cuantizacion W4A16 realizada con la herramienta QDA del autor, que produce pesos de 4 bits en formato compressed-tensors y mantiene las activaciones en 16 bits. Este esquema reduce el repositorio a 22,4 GB y permite cargar el modelo directamente en vLLM sin pasos de conversion adicionales. No se documenta en la informacion disponible el metodo de calibracion, el tamano del conjunto de calibracion ni la perdida de precision respecto al modelo original.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.6.
- Razonamiento matematico avanzado: el autor reporta 84,6 % en la combinacion AIME 2025 + HMMT Feb 2026, lo que indica competencia en problemas de competicion.
- Generacion y comprension de codigo: 81,5 % en LiveCodeBench v6.
- Razonamiento cientifico: 84,9 % en GPQA-Diamond.
- Seguimiento de instrucciones: 65,1 % en IFBench.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de nivel de competicion (AIME, HMMT) con una tasa de acierto reportada del 84,6 %, lo que lo hace util para tutoria avanzada, generacion de problemas y verificacion de soluciones en plataformas educativas.
- Generacion de codigo en produccion: con 81,5 % en LiveCodeBench v6 y soporte de vLLM, puede integrarse en pipelines de CI/CD para autocompletado, generacion de tests y revision de parches, sirviendose del servidor OpenAI-compatible de vLLM.
- Razonamiento cientifico y QA especializado: el 84,9 % en GPQA-Diamond lo hace adecuado para asistentes de investigacion que respondan preguntas de nivel doctoral en fisica, quimica y biologia, con la cautela de verificar siempre las fuentes.
- Despliegue en infraestructura limitada: al ocupar 22,4 GB en W4A16, cabe en una unica GPU de 24 GB (por ejemplo, RTX 4090 o L40S) para inferencia con contexto moderado, lo que permite servir un MoE de ~36B en estaciones de trabajo.
- Atencion al cliente automatizada: la arquitectura MoE reduce el coste por token frente a un denso equivalente, lo que abarata conversaciones multi-turno a gran escala; la longitud de contexto concreta no esta documentada.
- Evaluacion comparativa de cuantizaciones: util para equipos que quieran medir la degradacion de un MoE de Qwen3.6 al pasar a 4 bits, usando los benchmarks reportados como referencia.
- Servicio de inferencia de alto throughput: el esquema W4A16 reduce el ancho de banda de memoria necesario, lo que aumenta el numero de peticiones concurrentes por GPU en vLLM en comparacion con el modelo en BF16.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card, evaluados con vLLM 0.27.1 sobre GH200, batching estatico, muestreo de la model card (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=1.5`) y semillas 17+j:

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 84,6 |
| GPQA-Diamond | 84,9 |
| LiveCodeBench v6 | 81,5 |
| IFBench | 65,1 |
| Media | 79,0 |

No se han publicado en la informacion disponible resultados del modelo base sin cuantizar ni comparaciones directas con otras cuantizaciones, por lo que no es posible calcular la perdida de precision atribuible al esquema W4A16.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 22,4 GB en W4A16; se necesita margen adicional para el KV cache y el runtime de vLLM, por lo que en la practica se recomienda al menos 24 GB para contextos cortos y 40-48 GB para contextos largos o alta concurrencia.
- GPU recomendadas: GH200 (usada por el autor para las evaluaciones), H100, A100 80 GB y L40S 48 GB para produccion; RTX 4090 24 GB para desarrollo y pruebas con contexto limitado.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) y RTX 3090 (24 GB) con contexto reducido; no cabe en GPUs de 16 GB o menos.
- Opciones de despliegue: vLLM es el runtime soportado oficialmente (`vllm serve qda-lab/QDA-Qwen3.6-35B-A3B-W4A16`). El formato compressed-tensors no es compatible directamente con llama.cpp u Ollama sin conversion previa a GGUF, que no se documenta en la informacion disponible. TGI no esta confirmado.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| QDA-Qwen3.6-35B-A3B-W4A16 | 35,95 B | ~3 B (A3B) | no disponible | no disponible | safetensors W4A16 |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95 B | ~3 B (A3B) | no disponible | no disponible | safetensors BF16 |
| Otras cuantizaciones W4A16 del mismo base | 35,95 B | ~3 B (A3B) | no disponible | no disponible | safetensors / GGUF |

No se dispone en la informacion proporcionada de datos de rendimiento del modelo base ni de cuantizaciones alternativas que permitan una comparacion cuantitativa. La unica diferencia verificable frente al base es el tamano del repositorio (22,4 GB en W4A16) y los benchmarks reportados por el autor.

## Limitaciones y advertencias

- La model card no especifica la licencia del checkpoint ni la del modelo base; antes de un uso comercial es imprescindible verificar la licencia de Qwen/Qwen3.6-35B-A3B en su repositorio original.
- No se documenta el metodo de calibracion ni el conjunto de datos usado para la cuantizacion, por lo que la degradacion en dominios distintos a los evaluados (matematicas, ciencia, codigo, instrucciones) es desconocida.
- Los benchmarks han sido generados por el propio autor con un unico runtime (vLLM 0.27.1) y un unico hardware (GH200); no hay verificacion independiente.
- Riesgo de alucinacion inherente a los modelos de lenguaje, no cuantificado en la informacion disponible.
- Sesgos conocidos: no disponibles; dependen del dataset de entrenamiento del modelo base, que no se detalla.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera del ingles y el chino sin evaluacion propia.
- Longitud de contexto no documentada, lo que impide planificar cargas con ventanas largas sin pruebas previas.
- El formato compressed-tensors limita las opciones de despliegue a vLLM (y potencialmente a otros runtimes que soporten dicho formato); no hay GGUF publicado para llama.cpp u Ollama.
- El modelo tiene 22 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria practicamente nula.

## Enlaces

- Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.6-35B-A3B-W4A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Documentacion de vLLM: https://docs.vllm.ai
- Formato compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales del autor.
