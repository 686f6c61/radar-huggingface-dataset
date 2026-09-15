# pitcany/qwen3.6-35b-mtp-q4

## Resumen

pitcany/qwen3.6-35b-mtp-q4 es un espejo (mirror) del cuantizado GGUF publicado por Unsloth para el modelo Qwen3.6-35B-A3B, en cuantizacion Q4_K_M y con una capa MTP (multi-token prediction, `nextn-predict`) fusionada para decodificacion especulativa. Lo publica el usuario pitcany el 15 de septiembre de 2026 como proteccion frente a posibles retiradas del repositorio original, bajo licencia Apache 2.0. Se distribuye como un unico fichero GGUF de 21 GB.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 35.505.251.456 parametros totales (35,5 B) y aproximadamente 3,5 B activos por token, organizado en 41 bloques con 256 expertos (8 activos por token) y atencion GQA con proporcion 16:2. Su ventana de contexto es de 262.144 tokens, lo que lo situa en la gama de contexto largo dentro de la familia Qwen.

Su relevancia practica es doble: por un lado, ofrece un MoE de 35 B con coste de inferencia propio de un modelo de ~3,5 B activos; por otro, incorpora una capa MTP que permite decodificacion especulativa integrada, pensada para acelerar la generacion en Ollama y llama.cpp sin necesidad de un modelo draft externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) con GQA 16:2 y una capa MTP (`nextn-predict`) |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3,5 B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero unico de 21 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer denso en su esqueleto pero con capas de mezcla de expertos: 41 bloques transformer, 256 expertos por capa y 8 expertos activados por token, con atencion de consultas agrupadas (GQA) en proporcion 16:2. Esta configuracion concentra la mayor parte de los 35,5 B de parametros en las matrices de expertos, de modo que el coste computacional por token se aproxima al de un modelo de ~3,5 B activos, mientras que la capacidad de representacion se mantiene en el rango de los 35 B. La ventana de contexto declarada es de 262.144 tokens.

La modificacion que introduce este repositorio respecto al cuantizado original es la fusion de una unica capa MTP (`nextn-predict`) sobre el GGUF Q4_K_M de Unsloth. Esta capa actua como cabezal de prediccion de multiples tokens y permite decodificacion especulativa integrada: el modelo propone varios tokens candidatos por paso y los verifica con el modelo principal, reduciendo el numero de pasos de decodificacion. Segun la model card, el artefacto fue construido por Ollama a partir del cuantizado base de Unsloth y del modulo draft MTP. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo base; estos datos no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: la etiqueta `conversational` del repositorio y el pipeline `text-generation` indican uso orientado a dialogo.
- Razonamiento y generacion de codigo: no se detallan capacidades especificas en la informacion disponible, mas alla del pipeline declarado.
- Decodificacion especulativa integrada mediante la capa MTP, utilizable en Ollama y llama.cpp.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que el artefacto puede servirse a traves de infraestructura de inferencia compatible.
- Capacidades multilingues: no disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia conversacional de contexto largo: con 262.144 tokens de ventana, el modelo puede mantener hilos de conversacion muy extensos o ingerir documentacion completa sin truncar, algo adecuado para asistentes internos que consultan manuales extensos.
- Procesamiento de documentos completos: contratos, informes tecnicos o expedientes que superan los 100.000 tokens pueden analizarse en una sola pasada, evitando estrategias de troceado y recuperacion.
- Generacion de codigo asistida en local: al ser un GGUF Q4_K_M de 21 GB, puede ejecutarse en una estacion de trabajo con una sola GPU consumer de 24 GB, lo que permite autocompletado y refactorizacion sin enviar codigo a servicios externos.
- Despliegue en hardware limitado con rendimiento de modelo grande: gracias a los ~3,5 B parametros activos, el coste por token es bajo en comparacion con un modelo denso de 35 B, lo que resulta util para servir varios usuarios concurrentes en una unica GPU.
- Resumen y extraccion de informacion en pipelines por lotes: el formato GGUF con llama.cpp permite ejecucion por CPU/GPU mixta para procesar volumenes grandes de texto sin infraestructura dedicada.
- Chatbot sobre base documental con citas: la ventana larga permite incluir los fragmentos recuperados y el historial completo en el mismo contexto, reduciendo perdidas de informacion entre turnos.
- Prototipado rapido con Ollama: el comando `ollama run qwen3.6:35b-a3b-mtp-q4_K_M` permite levantar el modelo con decodificacion especulativa sin configurar un servidor de inferencia complejo.
- Evaluacion de decodificacion especulativa MTP: util como banco de pruebas para medir la ganancia de la capa `nextn-predict` frente a la decodificacion autoregresiva estandar en llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco se proporcionan mediciones de throughput o latencia de la decodificacion especulativa con la capa MTP.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 21-22 GB para cargar el fichero GGUF completo en GPU (el repositorio ocupa 21,7 GB), mas la cache KV, cuyo tamano crece linealmente con la longitud de contexto utilizada. Para aprovechar los 262.144 tokens de contexto conviene cuantizar la cache KV (por ejemplo Q8_0) y contar con bastante mas memoria.
- GPU recomendadas: A100 40 GB, A100 80 GB, H100 80 GB para despliegue con contexto largo; RTX 4090 o RTX 3090 (24 GB) para contexto moderado con el modelo completo en VRAM.
- Cabe en GPU consumer: si, en tarjetas de 24 GB (RTX 4090, RTX 3090) para offload completo del modelo; en GPUs de 16 GB requeriria descargar parte de las capas a CPU, con la consiguiente perdida de rendimiento.
- Opciones de despliegue: Ollama (soporte de decodificacion especulativa MTP segun la model card) y llama.cpp (`llama-cli`, y presumiblemente `llama-server`). No se confirma soporte en vLLM, TGI u otros servidores en la informacion disponible.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

La informacion proporcionada solo describe este artefacto y su modelo base, por lo que la comparativa se limita a los datos declarados para este modelo. Las cifras de las alternativas proceden de su documentacion publica habitual y deberian verificarse antes de usarse en una decision tecnica.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| qwen3.6-35b-mtp-q4 (este) | 35,5 B | ~3,5 B | 262.144 tokens | Apache 2.0 | GGUF Q4_K_M |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5 B | ~3,5 B | 262.144 tokens | no disponible | safetensors / GGUF |
| Qwen3-30B-A3B | ~30,5 B | ~3,3 B | 32.768 tokens nativos (ampliable con YaRN) | Apache 2.0 | safetensors / GGUF |
| Mixtral 8x7B | ~46,7 B | ~12,9 B | 32.768 tokens | Apache 2.0 | safetensors / GGUF |

Diferencias destacables: este artefacto anade una capa MTP para decodificacion especulativa que las alternativas comparadas no incorporan de serie en su distribucion GGUF, y declara una ventana de contexto muy superior a la de Qwen3-30B-A3B o Mixtral 8x7B. A cambio, su numero de descargas y likes en el momento de la ficha es cero, lo que indica que se trata de un espejo recien creado y sin validacion comunitaria.

## Limitaciones y advertencias

- Repositorio espejo sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion independiente del artefacto.
- Ausencia de benchmarks: no hay cifras verificables de calidad (MMLU, HumanEval, GSM8K) ni de rendimiento de la decodificacion especulativa en este repositorio.
- Procedencia del cuantizado: al ser un mirror del GGUF de Unsloth modificado por Ollama, la trazabilidad exacta de la fusion de la capa MTP depende de terceros; conviene verificar el hash del fichero antes de usarlo en produccion.
- Idiomas soportados: no disponibles en la informacion proporcionada, por lo que no puede garantizarse un comportamiento correcto en castellano.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es esperable en cualquier modelo generativo, especialmente en tareas de recuperacion de hechos.
- Contexto largo y memoria: usar la ventana completa de 262.144 tokens exige cache KV cuantizada y mucha memoria; sin ella, el modelo puede agotar la VRAM de una GPU de 24 GB.
- Compatibilidad de la decodificacion especulativa: el uso de la capa MTP depende de que el runtime (Ollama, llama.cpp) soporte `nextn-predict` para este modelo; en versiones que no lo soporten, el modelo se comportara como un GGUF Q4_K_M convencional.
- Licencia: Apache 2.0 permite uso comercial, pero la licencia del modelo base Qwen3.6-35B-A3B no se detalla en la informacion proporcionada; conviene consultar las condiciones del repositorio oficial de Qwen antes de un despliegue comercial.
- Cuantizacion Q4_K_M: implica perdida de precision respecto a los pesos originales; no se documenta la degradacion medida.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pitcany/qwen3.6-35b-mtp-q4
- Cuantizado original de Unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- No se han encontrado en la busqueda web papers, blogs, demos ni repositorios adicionales asociados a este artefacto.
