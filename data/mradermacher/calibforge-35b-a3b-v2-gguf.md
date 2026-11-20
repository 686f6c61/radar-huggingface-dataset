# mradermacher/CalibForge-35B-A3B-v2-GGUF

## Resumen

CalibForge-35B-A3B-v2-GGUF es una distribucion de cuantizaciones estaticas en formato GGUF del modelo base CalibForge-35B-A3B-v2, publicado por el usuario mradermacher en Hugging Face. El modelo original lo desarrolla AweAI-Team, y este repositorio se limita a ofrecer los pesos convertidos a distintos niveles de cuantizacion para su uso con llama.cpp y herramientas compatibles. El nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token, aunque no se ha publicado documentacion tecnica que lo confirme.

El dato verificable es el recuento de parametros en safetensors: 34.660.610.688 parametros totales, lo que encaja con la cifra de "35B" del nombre. El repositorio ocupa 69,7 GB e incluye los cuantizados x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 e IQ4_XS. No se dispone de informacion sobre licencia, idiomas, pipeline o datos de entrenamiento en la informacion proporcionada.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de ~35B con activaciones de ~3B en hardware de consumo mediante cuantizacion agresiva (Q4_K_M ocupa del orden de 20 GB), algo imposible con un modelo denso del mismo tamano. Sin embargo, la ausencia de model card tecnica, benchmarks y licencia clara limita seriamente su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del nombre "35B-A3B"; no confirmada en documentacion) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3B (inferido del sufijo "A3B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas generadas con llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base en la documentacion disponible. El nombre "35B-A3B" sigue la convencion habitual para modelos de mezcla de expertos, donde el primer numero indica parametros totales y el segundo los parametros activos por token; en este caso, aproximadamente 35.000 millones totales y 3.000 millones activos. El recuento de safetensors confirma los 34,66 mil millones de parametros totales, pero no hay datos sobre numero de expertos, top-k de enrutamiento, atencion (estandar, GQA, lineal) ni funcion de activacion.

Tampoco se dispone de informacion sobre el corpus de entrenamiento, numero de tokens procesados, composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o RLVR. La model card del repositorio GGUF se limita a indicar que son cuantizaciones estaticas del modelo AweAI-Team/CalibForge-35B-A3B-v2, generadas con un proceso de conversion de tipo "hf" y version de cuantizacion 2. No hay innovaciones tecnicas documentadas (decodificacion especulativa, atencion lineal, modos de razonamiento) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: la unica etiqueta funcional disponible es "conversational", que sugiere un modelo ajustado para dialogo multi-turno.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" indica que puede servirse a traves de infraestructura de inferencia estandar (por ejemplo, TGI o vLLM con soporte GGUF).
- Razonamiento y generacion de codigo: no disponible (sin datos que lo confirmen).
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales: con la cuantizacion Q4_K_M (del orden de 20 GB) el modelo puede ejecutarse en una GPU de consumo de 24 GB o en CPU con RAM suficiente, lo que permite iterar sobre prompts y flujos de dialogo sin coste de API. Es adecuado por su etiqueta "conversational" y su bajo numero de parametros activos, que reduce la latencia frente a un denso de 35B.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece doce variantes (desde Q2_K hasta f16), lo que permite medir la degradacion de calidad frente al coste de memoria en un mismo modelo. Util para decidir el punto de equilibrio en un despliegue real.
- Despliegue en entornos con GPU limitada: al activar solo ~3B parametros por token, el modelo puede servir peticiones concurrentes en una sola A100 40 GB o en dos RTX 4090, con mayor throughput que un denso equivalente. Requiere validar primero la calidad, dado que no hay benchmarks publicados.
- Fine-tuning y destilacion sobre el modelo base: las cuantizaciones f16 y Q8_0 sirven como referencia de comportamiento para comparar contra adaptadores LoRA entrenados sobre el modelo original, aunque para entrenamiento conviene usar los safetensors del repositorio base.
- Servicio de chat en infraestructura propia: con la etiqueta "endpoints_compatible", puede integrarse en un endpoint HTTP compatible con OpenAI mediante llama.cpp server u Ollama, util para equipos que necesitan confidencialidad de datos sin salir de su red.
- Investigacion sobre modelos MoE de acceso abierto: permite estudiar el comportamiento de un MoE de ~35B/3B activos en tareas de razonamiento y dialogo, siempre que se documenten las limitaciones de licencia antes de publicar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, ni del modelo base ni de las cuantizaciones. Tampoco se dispone de mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano del repo de 69,7 GB y el recuento de parametros):
  - Q2_K: del orden de 12-13 GB.
  - Q3_K_M: del orden de 15-16 GB.
  - Q4_K_M: del orden de 20-21 GB.
  - Q5_K_M: del orden de 24-25 GB.
  - Q6_K: del orden de 28-29 GB.
  - Q8_0: del orden de 36-37 GB.
  - f16: del orden de 69 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40 GB o H100 para Q8_0 y f16; dos RTX 4090 o una RTX 6000 Ada (48 GB) para Q8_0.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto reducido.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio y cualquier runtime compatible con GGUF; vLLM solo si soporta el formato GGUF en la version desplegada.
- Latencia y throughput: no disponibles. Al ser un MoE con ~3B activos, se espera un throughput notablemente superior al de un denso de 35B, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| CalibForge-35B-A3B-v2 | 34,66B | ~3B (inferido) | no disponible | no disponible | GGUF |
| Qwen3-30B-A3B | 30,5B | 3,3B | 32.768 (extensible) | Apache 2.0 | safetensors, GGUF |
| Mixtral 8x7B | 46,7B | 12,9B | 32.768 | Apache 2.0 | safetensors, GGUF |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32.768 | licencia propia | safetensors, GGUF |

La comparativa con Qwen3-30B-A3B es la mas directa por tamano y numero de parametros activos, pero no se puede establecer una comparacion de calidad sin benchmarks del modelo CalibForge.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no hay informacion sobre datos de entrenamiento, alineacion, contexto maximo ni idiomas, lo que impide evaluar sesgos y riesgos de forma rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido. Es un bloqueo para cualquier despliegue en produccion hasta que el autor del modelo base lo aclare.
- Benchmarks inexistentes: no hay evidencia publicada de calidad; cualquier afirmacion sobre su rendimiento seria especulativa.
- Riesgo de alucinacion: sin datos de alineacion ni evaluaciones, no se puede acotar el riesgo de respuestas inventadas, especialmente en dominios factuales.
- Parametros activos inferidos: la cifra de ~3B activos proviene solo del nombre del modelo y no esta confirmada en documentacion; el rendimiento real depende del enrutamiento de expertos, que no se ha verificado.
- Cuantizaciones de baja precision: Q2_K y Q3_K_S pueden degradar notablemente la calidad; en modelos MoE el enrutamiento es sensible a la cuantizacion de las capas de expertos.
- Repositorio sin descargas ni likes: no hay senal de validacion por parte de la comunidad, lo que aumenta el riesgo de que el modelo base tenga problemas no documentados.
- Contexto desconocido: no se puede planificar su uso en tareas de contexto largo (RAG, analisis de documentos) sin conocer la ventana real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/CalibForge-35B-A3B-v2-GGUF
- Modelo base: https://huggingface.co/AweAI-Team/CalibForge-35B-A3B-v2
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- GitHub del autor: https://github.com/mradermacher
