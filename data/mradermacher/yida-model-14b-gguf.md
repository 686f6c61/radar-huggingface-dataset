# mradermacher/Yida-Model-14B-GGUF

## Resumen

Yida-Model-14B-GGUF es la version cuantizada en formato GGUF del modelo rwang220/Yida-Model-14B, un modelo de lenguaje de 14.768.307.200 parametros (aproximadamente 14,77 mil millones) orientado al ambito medico y a conversacion. Las cuantizaciones han sido generadas por mradermacher, un autor conocido por publicar versiones GGUF de modelos abiertos para su uso con llama.cpp y herramientas derivadas. El modelo original esta construido sobre la arquitectura Qwen3 y ha sido ajustado mediante SFT con LoRA usando el framework ms-swift, segun las etiquetas declaradas en la model card.

El problema que resuelve esta publicacion es puramente practico: el repositorio original se distribuye en safetensors, un formato poco adecuado para inferencia en CPU o en GPUs de gama de consumo con poca VRAM. Esta version ofrece once cuantizaciones distintas, desde Q2_K (5,9 GB) hasta Q8_0 (15,8 GB), lo que permite desplegar el modelo en equipos que van desde un portatil con 8 GB de VRAM hasta estaciones de trabajo con GPU profesionales.

La relevancia actual del modelo radica en su combinacion de dominio especializado (medico), tamano moderado (14B, manejable en hardware de consumo con cuantizacion) y licencia Apache-2.0, que permite uso comercial sin restricciones adicionales. No obstante, la informacion publica disponible es muy limitada: no se detallan los datos de entrenamiento, la longitud de contexto soportada ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3; transformer denso, sin confirmacion explicita en la informacion proporcionada) |
| Parametros totales | 14.768.307.200 (14,77B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Tamano del repositorio | 102,0 GB |
| Modelo base | rwang220/Yida-Model-14B |
| Metodo de ajuste | SFT con LoRA mediante ms-swift |
| Dominio declarado | medico (tag medical), chat |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada sobre la arquitectura interna es escasa. El repositorio se etiqueta con qwen3, lo que apunta a que el modelo base emplea la arquitectura transformer densa de la familia Qwen3, con 14,77 mil millones de parametros. La licencia enlazada corresponde al fichero LICENSE de Qwen/Qwen3-14B, lo que refuerza esa correspondencia. No se especifica el numero de capas, dimensiones ocultas, mecanismo de atencion ni si se emplean tecnicas como GQA o decodificacion especulativa.

En cuanto al entrenamiento, la model card indica que el modelo rwang220/Yida-Model-14B fue sometido a un ajuste supervisado (SFT) mediante LoRA con el framework ms-swift, partiendo presumiblemente de un modelo base Qwen3-14B. No se detalla el volumen de tokens de entrenamiento, la composicion del dataset, si hubo fases de RLHF o DPO, ni el origen de los datos medicos utilizados. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa, modo de razonamiento explicito, etc.). La cuantizacion de mradermacher se ha realizado con el pipeline habitual de llama.cpp, segun las etiquetas internas de la model card (quantize_version 2, convert_type hf, output_tensor_quantised 1).

## Capacidades

- Generacion de texto conversacional en chino e ingles (tags chat y conversational).
- Respuesta a consultas de dominio medico, presumiblemente derivada del ajuste SFT sobre datos del area (tag medical); no se detalla el alcance clinico cubierto.
- Soporte de conversaciones multi-turno a traves de plantillas de chat compatibles con Qwen3.
- Inferencia local en CPU y GPU gracias al formato GGUF y a las once cuantizaciones publicadas.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta soporte explicito de tool calling o function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad de vision, audio ni modo thinking.
- No se documentan capacidades multilingues mas alla de zh y en.

## Casos de uso

- Triaje de consultas medicas en ingles o chino: el modelo puede clasificar sintomas y orientar al usuario hacia el especialista adecuado, siempre con supervision humana y sin sustituir el diagnostico profesional. Su tamano de 14B permite ejecutarlo en local, lo que facilita el cumplimiento de requisitos de privacidad sobre datos de salud.
- Asistente de documentacion clinica: redaccion y resumen de notas de paciente en entornos donde los datos no pueden salir de la infraestructura propia, usando la cuantizacion Q5_K_M o Q6_K para preservar calidad.
- Despliegue en equipos sin GPU dedicada: la cuantizacion Q4_K_S (8,7 GB) o Q2_K (5,9 GB) permite ejecutar el modelo en portatiles con CPU moderna y 16 GB de RAM, util para prototipos y demos offline.
- Investigacion academica sobre ajuste fino en dominio medico: al estar liberado bajo Apache-2.0, el modelo puede servir como punto de partida para LoRA adicionales sobre datasets clinicos propios, partiendo de la version safetensors del repositorio original.
- Chatbot de educacion sanitaria en chino: atencion a usuarios sinohablantes sobre habitos saludables, interpretacion de analiticas basicas o preparacion de preguntas para consulta medica.
- Traduccion asistida de material medico entre chino e ingles: aunque no esta declarado como modelo de traduccion, su entrenamiento bilingue permite borradores de traduccion de prospectos o articulos, con revision profesional posterior.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece once niveles distintos del mismo modelo, lo que lo convierte en un banco de pruebas para medir la degradacion de perplejidad y calidad entre cuantizaciones en tareas de dominio especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones basadas en el tamano de fichero de cada cuantizacion mas un margen para el contexto (KV cache) y overhead del runtime; deben tomarse como orientativas.

| Cuantizacion | Tamano del fichero | VRAM estimada | Perfil de hardware |
|---|---|---|---|
| Q2_K | 5,9 GB | ~7 GB | GTX 1660 6 GB (parcial offload), RTX 3060 12 GB |
| Q3_K_S | 6,8 GB | ~8 GB | RTX 3060 12 GB, RTX 4060 Ti 8 GB (ajustado) |
| Q3_K_M | 7,4 GB | ~8,5 GB | RTX 4060 Ti 8 GB, RTX 3070 8 GB |
| Q3_K_L | 8,0 GB | ~9 GB | RTX 3080 10 GB |
| IQ4_XS | 8,3 GB | ~9,5 GB | RTX 3080 10 GB, RTX 4070 12 GB |
| Q4_K_S | 8,7 GB | ~10 GB | RTX 4070 12 GB, RTX 3060 12 GB |
| Q4_K_M | 9,1 GB | ~10,5 GB | RTX 4070 12 GB |
| Q5_K_S | 10,4 GB | ~12 GB | RTX 4070 Ti 12 GB |
| Q5_K_M | 10,6 GB | ~12,5 GB | RTX 4080 16 GB |
| Q6_K | 12,2 GB | ~14 GB | RTX 4080 16 GB, RTX 4090 24 GB |
| Q8_0 | 15,8 GB | ~18 GB | RTX 4090 24 GB, A100 40 GB, H100 80 GB |

- Si cabe en GPU de consumo: si, en todas las cuantizaciones con una GPU de 8 GB o mas, siempre que se ajuste el tamano de contexto. Q4_K_M es el punto de equilibrio recomendado por el propio autor.
- GPU profesionales: A100 40 GB, H100 80 GB y L40S 48 GB pueden alojar Q8_0 con contexto amplio y varias sesiones concurrentes.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, kobold.cpp y bindings de llama-cpp-python. Para vLLM o TGI el soporte de GGUF es limitado o nulo, por lo que en esos entornos conviene partir del repositorio original en safetensors.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible.
- Nota sobre cuantizaciones ponderadas: el autor indica que no ha generado cuantizaciones weighted/imatrix para este modelo, solo las estaticas listadas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Yida-Model-14B-GGUF (este) | 14,77B | GGUF (11 cuantizaciones) | no disponible | Apache-2.0 | zh, en | HuggingFace, 0 descargas |
| rwang220/Yida-Model-14B | 14,77B | safetensors | no disponible | Apache-2.0 | zh, en | HuggingFace (modelo original) |
| Qwen3-14B | 14,77B (referencia de arquitectura) | safetensors y GGUF | no disponible en la informacion proporcionada | Apache-2.0 (segun el enlace de licencia del propio repositorio) | multilingue segun documentacion del fabricante | HuggingFace |

No se dispone de datos de rendimiento comparado ni de contexto maximo para establecer una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de dominio medico sin validacion clinica documentada: no debe utilizarse como sustituto de diagnostico, prescripcion o consejo medico profesional. No se especifica si el ajuste SFT conto con supervision de profesionales sanitarios.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual ni tasas de error en el dominio medico, donde las consecuencias de una respuesta incorrecta pueden ser graves.
- Cobertura limitada a chino e ingles: no hay soporte declarado de castellano ni de otras lenguas, por lo que su uso en entornos hispanohablantes requeriria traduccion previa o ajuste adicional.
- Longitud de contexto desconocida: al no documentarse, no se puede garantizar el comportamiento en conversaciones largas ni en procesamiento de documentos extensos.
- Datos de entrenamiento no publicados: se desconoce la procedencia del corpus medico, lo que impide evaluar sesgos, inclusion de datos sinteticos o posibles problemas de derechos.
- Degradacion por cuantizacion: las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S) reducen notablemente la calidad; el propio autor marca Q3_K_M como "lower quality". Para uso sanitario se recomienda Q5_K_M o superior.
- Trazabilidad y mantenimiento: el repositorio registra 0 descargas y 0 likes, sin historial de uso comunitario ni validacion independiente. Las fechas de creacion y actualizacion son identicas, lo que sugiere que no ha habido revisiones posteriores.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion siempre que se conserve el aviso de licencia y se indiquen los cambios. No incluye garantia alguna ni exencion de responsabilidad por el uso en contextos regulados (producto sanitario, diagnostico, etc.).
- Aviso adicional: el modelo ha sido cuantizado por un tercero (mradermacher) a partir del modelo original; cualquier problema derivado de la cuantizacion no afecta al repositorio base, y viceversa.

## Enlaces

- Repositorio HuggingFace (GGUF): https://huggingface.co/mradermacher/Yida-Model-14B-GGUF
- Modelo base (safetensors): https://huggingface.co/rwang220/Yida-Model-14B
- Pagina de resumen y descargas del cuantizador: https://hf.tst.eu/model#Yida-Model-14B-GGUF
- Licencia del modelo base Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B/blob/main/LICENSE
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Preguntas frecuentes y solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
