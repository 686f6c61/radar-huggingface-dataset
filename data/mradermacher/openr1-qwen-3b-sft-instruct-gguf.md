# mradermacher/OpenR1-Qwen-3B-SFT-Instruct-GGUF

## Resumen

OpenR1-Qwen-3B-SFT-Instruct-GGUF es la version cuantizada en formato GGUF del modelo InfiniAILab/OpenR1-Qwen-3B-SFT-Instruct, un ajuste fino por supervised fine-tuning (SFT) del modelo base Qwen de 3B parametros. El trabajo de cuantizacion lo realiza mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF para llama.cpp. El modelo esta orientado especificamente a tareas de razonamiento matematico, ya que fue entrenado sobre el dataset open-r1/OpenR1-Math-220k, derivado del proyecto Open-R1 de Hugging Face.

El modelo resuelve el problema de ejecutar un modelo de razonamiento matematico de 3B parametros en hardware de consumo, ofreciendo cuantizaciones desde Q2_K (1,4 GB) hasta f16 (6,3 GB). Con 3.085.938.688 parametros totales, es un modelo compacto que puede desplegarse en GPUs consumer e incluso en CPU con llama.cpp. Su relevancia actual radica en que permite experimentar con tecnicas de razonamiento tipo R1 en entornos con recursos limitados.

La ficha se centra en la version GGUF, que es la unica disponible en el repositorio referenciado. El modelo original en safetensors se encuentra en el repositorio base InfiniAILab/OpenR1-Qwen-3B-SFT-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen, segun el nombre del modelo) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino por SFT (supervised fine-tuning) del modelo Qwen de 3B parametros, realizado con la libreria TRL dentro del proyecto Open-R1. El entrenamiento utiliza el dataset open-r1/OpenR1-Math-220k, un conjunto de datos orientado a razonamiento matematico generado en el contexto del proyecto Open-R1 de Hugging Face, que busca replicar el pipeline de DeepSeek-R1 de forma abierta. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron fases posteriores de RLHF o DPO.

La arquitectura subyacente es un transformer decoder-only de tipo Qwen, con 3.085.938.688 parametros. La cuantizacion GGUF la realiza mradermacher mediante conversion desde el formato Hugging Face (convert_type: hf) con quantize_version 2 y output_tensor_quantised 1. No se han publicado cuantizaciones ponderadas con imatrix para este modelo en el momento de la ficha, segun indica el propio autor.

## Capacidades

- Generacion de texto y razonamiento matematico, con especial enfasis en la resolucion de problemas paso a paso gracias al entrenamiento sobre OpenR1-Math-220k.
- Razonamiento multi-paso orientado a problemas matematicos y de tipo STEM.
- Conversacion multi-turno (tag conversational en el repositorio).
- Compatibilidad con Inference Endpoints segun las etiquetas del repositorio.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles (unico idioma declarado).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Resolucion de problemas matematicos en entornos educativos: el modelo puede generar soluciones paso a paso a problemas de algebra, calculo o aritmetica, aprovechando el entrenamiento sobre OpenR1-Math-220k. Su tamano de 3B permite desplegarlo en un portatil con una GPU de 4-6 GB.
- Prototipado de pipelines de razonamiento en investigacion: util para validar tecnicas de chain-of-thought y generacion de razonamiento matematico antes de escalar a modelos mayores, con un coste computacional muy bajo.
- Ejecucion local en CPU con llama.cpp: las cuantizaciones Q4_K_S y Q4_K_M (1,9-2,0 GB) permiten inferencia en portatiles sin GPU dedicada, util para demos y pruebas offline.
- Generacion de datasets sinteticos de matematicas: el modelo puede emplearse para producir soluciones razonadas que sirvan como datos de entrenamiento o evaluacion para modelos mayores.
- Integracion en asistentes de estudio: con soporte conversacional multi-turno, puede usarse como tutor de matematicas en ingles dentro de una aplicacion de chat.
- Evaluacion comparativa de cuantizaciones: al ofrecer 12 variantes GGUF, permite medir el impacto de la cuantizacion en la calidad del razonamiento matematico, un caso de uso habitual en investigacion de eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB con Q2_K, 2,0-2,5 GB con Q4_K_M, 3,5 GB con Q8_0 y 6,5-7 GB con f16 (incluyendo overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones Q4; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 4 GB o mas de VRAM; las cuantizaciones Q2_K y Q3 caben incluso en GPUs de 2-3 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El modelo base en safetensors puede servirse con vLLM o TGI, pero esta version GGUF esta pensada para llama.cpp.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenR1-Qwen-3B-SFT-Instruct-GGUF (este) | 3,09B | no disponible | GGUF | no disponible | Hugging Face |
| mradermacher/OpenR1-Qwen-7B-SFT-Instruct-GGUF | ~7B (no confirmado) | no disponible | GGUF | no disponible | Hugging Face |
| InfiniAILab/OpenR1-Qwen-3B-SFT-Instruct | 3,09B | no disponible | safetensors | no disponible | Hugging Face |

La unica alternativa directamente comparable identificada en la busqueda es la version de 7B del mismo pipeline OpenR1, cuantizada por el mismo autor. Ofrece mayor capacidad potencial a cambio de un mayor consumo de recursos. No se dispone de datos de rendimiento comparativo entre ambas variantes.

## Limitaciones y advertencias

- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Especializado en matematicas: su rendimiento en tareas generales de conocimiento, codigo o conversacion puede ser inferior al de un modelo Qwen 3B generico.
- Riesgo de alucinacion en razonamientos largos, especialmente con cuantizaciones agresivas como Q2_K o Q3_K_S, que degradan la calidad.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es imprescindible verificar la licencia del modelo base InfiniAILab/OpenR1-Qwen-3B-SFT-Instruct antes de un despliegue en produccion.
- Longitud de contexto no documentada; no se debe asumir una ventana larga sin verificacion empirica.
- No dispone de cuantizaciones imatrix ponderadas, lo que puede reducir la calidad respecto a otras alternativas del ecosistema.
- Modelo con muy pocas descargas (67) y un solo like: no ha sido ampliamente validado por la comunidad.
- Al ser una cuantizacion estatica, no se han publicado evaluaciones del impacto de cada nivel de cuantizacion en tareas matematicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/OpenR1-Qwen-3B-SFT-Instruct-GGUF
- Modelo base: https://huggingface.co/InfiniAILab/OpenR1-Qwen-3B-SFT-Instruct
- Version 7B del mismo pipeline: https://huggingface.co/mradermacher/OpenR1-Qwen-7B-SFT-Instruct-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#OpenR1-Qwen-3B-SFT-Instruct-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
