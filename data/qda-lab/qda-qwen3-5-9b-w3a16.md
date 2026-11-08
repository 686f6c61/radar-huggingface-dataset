# qda-lab/QDA-Qwen3.5-9B-W3A16

## Resumen

QDA-Qwen3.5-9B-W3A16 es un checkpoint cuantizado a 3 bits en pesos con activaciones de 16 bits (W3A16) del modelo Qwen/Qwen3.5-9B, publicado por el laboratorio qda-lab. La cuantizacion se ha obtenido mediante un proceso de busqueda automatizada con agentes LLM descrito en el articulo "QDA: Closed-Loop Quantization Design with LLM Agents", enviado a MLSys 2027. El resultado se distribuye en formato compressed-tensors y esta pensado para cargarse directamente en vLLM sin pasos de conversion adicionales.

El modelo base Qwen3.5-9B es un modelo denso de la familia Qwen3.5 orientado a razonamiento, comprension visual y comportamiento agentico, con 9.409.813.744 parametros. Esta variante cuantizada conserva la arquitectura del original pero reduce el peso de los pesos a 3 bits, lo que baja el tamano del repositorio a 6,7 GB y facilita el despliegue en GPUs con menos memoria que las necesarias para el checkpoint en precision completa.

La relevancia de esta ficha radica en que es una de las primeras publicaciones de un checkpoint W3A16 para Qwen3.5-9B validado con benchmarks de razonamiento matematico, cientifico, de codigo e instrucciones, y con instrucciones de uso explicitas para vLLM. No obstante, la informacion publica es escasa: no se detallan licencia, idiomas ni composicion del dataset de calibracion, y el numero de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5, segun modelo base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | W3A16 (pesos 3 bits, activaciones 16 bits), formato compressed-tensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (compressed-tensors), compatible con vLLM |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen/Qwen3.5-9B, un transformer denso de 9.409.813.744 parametros. La model card del checkpoint cuantizado no describe la arquitectura interna del modelo original (numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora atencion lineal o decodificacion especulativa); esa informacion debe consultarse en la model card oficial de Qwen3.5-9B. La referencia externa de Jetson AI Lab describe Qwen3.5-9B como un modelo denso vision-language orientado a razonamiento, comprension visual y comportamiento agentico.

El proceso de cuantizacion es el elemento diferencial: qda-lab aplica una busqueda de diseno de cuantizacion en bucle cerrado guiada por agentes LLM (metodo QDA), que selecciona la configuracion de cuantizacion W3A16 para el checkpoint identificado como `r-c555c222`, entrega `h3`. No se publican en la informacion disponible detalles sobre el dataset de calibracion, el numero de tokens de entrenamiento del modelo base, ni si hubo fases de RLHF o DPO. El checkpoint se distribuye en formato compressed-tensors, lo que permite su carga directa en vLLM.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base Qwen3.5-9B.
- Razonamiento matematico competitivo: el checkpoint reporta 70,7 % en la media de AIME 2025 y HMMT Feb 2026.
- Razonamiento cientifico de nivel avanzado: 73,5 % en GPQA-Diamond.
- Generacion de codigo: 63,5 % en LiveCodeBench v6.
- Seguimiento de instrucciones: 59,2 % en IFBench.
- Capacidades vision-language segun la descripcion externa de Qwen3.5-9B en Jetson AI Lab (modelo denso vision-language); la model card del checkpoint cuantizado no detalla el soporte de vision.
- Comportamiento agentico segun la descripcion externa del modelo base; no se documenta en la model card del checkpoint si el tool calling o el razonamiento multi-paso estan soportados de forma explicita.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento matematico asistido: el checkpoint mantiene un 70,7 % en la media de AIME 2025 y HMMT Feb 2026, por lo que es adecuado para tutoria de matematicas de competicion, verificacion de demostraciones y generacion de problemas resueltos con justificacion paso a paso.
- Analisis cientifico y preguntas de nivel experto: con 73,5 % en GPQA-Diamond, puede emplearse en asistentes de investigacion para responder preguntas de fisica, quimica y biologia de posgrado, con la cautela de verificar las respuestas por riesgo de alucinacion.
- Generacion de codigo en pipelines de desarrollo: el 63,5 % en LiveCodeBench v6 lo hace util para autocompletado, generacion de tests y revision de parches en entornos de integracion continua, cargandolo con `vllm serve qda-lab/QDA-Qwen3.5-9B-W3A16`.
- Despliegue en GPUs de gama media: al ocupar 6,7 GB en disco en formato W3A16, permite servir el modelo en una unica GPU consumer con suficiente VRAM, reduciendo el coste frente al checkpoint en precision completa.
- Evaluacion de tecnicas de cuantizacion: investigadores que trabajen en compresion de modelos pueden usar este checkpoint como referencia reproducible del metodo QDA, ya que la model card identifica la busqueda (`r-c555c222`) y la entrega (`h3`) evaluadas en el articulo.
- Prototipado de asistentes con requisitos de instrucciones estrictas: el 59,2 % en IFBench indica una capacidad razonable de seguir formatos y restricciones, util para generar respuestas estructuradas en entornos de prueba.
- Servicio de inferencia de bajo coste con vLLM: la integracion nativa con compressed-tensors y la instruccion de uso de una sola linea permiten levantar un endpoint compatible con la API de OpenAI para experimentacion interna.

## Benchmarks y rendimiento

Resultados publicados en la model card del checkpoint, evaluados con vLLM 0.27.1 sobre GH200, batching estatico y muestreo de la model card (`temperature=1.0`, `top_p=0.95`, `top_k=20`, `presence_penalty=1.5`, semillas 17+j):

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 70,7 |
| GPQA-Diamond | 73,5 |
| LiveCodeBench v6 | 63,5 |
| IFBench | 59,2 |
| Media | 66,8 |

No se han publicado en la informacion disponible resultados comparativos con el modelo base sin cuantizar ni con otros checkpoints W3A16, por lo que no es posible cuantificar la perdida de precision atribuible a la cuantizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,7 GB solo para los pesos en W3A16; hay que anadir la memoria para cache KV, activaciones y overhead de vLLM, que depende de la longitud de contexto y del tamano de lote.
- GPU recomendadas: la evaluacion oficial se realizo en NVIDIA GH200. Para produccion con contexto largo y lotes grandes se recomienda A100 40/80 GB o H100.
- GPU consumer: el checkpoint cabe en GPUs consumer con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090), siempre que se limite la longitud de contexto y el tamano de lote.
- Opciones de despliegue: vLLM es el runtime soportado de forma explicita (`vllm serve qda-lab/QDA-Qwen3.5-9B-W3A16`). No se documenta compatibilidad con llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La model card solo indica que la evaluacion se hizo con batching estatico en GH200, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.5-9B-W3A16 | 9,41 B | No disponible | safetensors W3A16 (compressed-tensors) | No disponible | Hugging Face, carga en vLLM |
| Qwen/Qwen3.5-9B (base) | 9,41 B | No disponible | safetensors (precision original) | No disponible | Hugging Face |
| Qwen3.5-9B W4A16 (Jetson Orin) | 9,41 B (segun modelo base) | No disponible | W4A16 | No disponible | Referenciado en Jetson AI Lab |
| Qwen3.5-9B NVFP4 (Jetson Thor) | 9,41 B (segun modelo base) | No disponible | NVFP4 | No disponible | Referenciado en Jetson AI Lab |

La comparativa se limita a variantes del mismo modelo base porque la informacion disponible no incluye datos de rendimiento de modelos alternativos de tamano similar. No se dispone de cifras de benchmarks del checkpoint base ni de las variantes W4A16 y NVFP4 para contrastar la perdida de precision.

## Limitaciones y advertencias

- La cuantizacion a 3 bits en pesos puede degradar tareas sensibles a la precision numerica; los benchmarks publicados no incluyen comparacion con el modelo base, por lo que el impacto real no esta cuantificado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en dominios cientificos y matematicos donde el checkpoint obtiene buenas puntuaciones pero puede producir razonamientos plausibles pero incorrectos.
- La model card no especifica la licencia, los idiomas soportados ni las restricciones de uso comercial; antes de un despliegue en produccion debe verificarse la licencia del modelo base Qwen/Qwen3.5-9B y la del checkpoint cuantizado.
- No se documenta la longitud de contexto soportada ni el comportamiento con contextos largos; el consumo de VRAM para cache KV puede superar la estimacion de pesos en escenarios de contexto extendido.
- El checkpoint es muy reciente (creado el 2026-11-08) y no tiene descargas ni likes; no hay evidencia de uso en produccion ni validacion independiente de los resultados reportados.
- La evaluacion se realizo con una configuracion de muestreo concreta (temperatura 1.0, top_p 0.95, top_k 20, presence_penalty 1.5) y batching estatico; los resultados pueden variar con otras configuraciones.
- El soporte de vision, tool calling y comportamiento agentico se atribuye al modelo base en fuentes externas, pero no se confirma en la model card del checkpoint cuantizado.
- El formato compressed-tensors esta soportado por vLLM, pero no se garantiza la compatibilidad con otros runtimes de inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.5-9B-W3A16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha de Qwen3.5-9B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
- Repositorio de Jetson AI Lab con la ficha del modelo: https://github.com/NVIDIA-AI-IOT/jetson-ai-lab/blob/main/src/content/models/qwen3-5-9b.md
- Articulo de referencia del metodo QDA: "QDA: Closed-Loop Quantization Design with LLM Agents" (envio a MLSys 2027; no se proporciona enlace directo en la informacion disponible)
