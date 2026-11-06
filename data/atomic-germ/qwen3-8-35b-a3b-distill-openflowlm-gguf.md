# Atomic-Germ/Qwen3.8-35B-A3B-Distill-OpenFlowLM-GGUF

## Resumen

Qwen3.8-35B-A3B-Distill-OpenFlowLM-GGUF es una distribucion en formato GGUF del modelo empero-ai/Qwen3.8-35B-A3B-Distill, publicada por el usuario Atomic-Germ. Se trata de una variante cuantizada con tecnicas de imatrix (importance matrix) y pesos ponderados, generada a partir del modelo base de la familia Qwen3.8, que segun los tags de la model card emplea una arquitectura de mezcla de expertos (MoE) con 35.505.251.456 parametros totales y aproximadamente 3.000 millones de parametros activos por token (el sufijo A3B del nombre lo indica).

El modelo base combina las capacidades de razonamiento y function calling de la familia Qwen con un proceso de destilacion por SFT (supervised fine-tuning), orientado a retener el comportamiento de un modelo mayor en un modelo mas pequeno y eficiente. El repositorio incluye unicamente pesos en formato GGUF, lo que lo hace directamente utilizable en llama.cpp, Ollama y otros motores compatibles, y esta etiquetado como modelo de vision con posibilidad de ficheros mmproj en el repositorio estatico de referencia.

La relevancia de esta ficha radica en que el modelo esta publicado bajo licencia Apache 2.0, con soporte declarado para function calling y razonamiento, y con un perfil de parametros activos bajo (3B) que lo hace atractivo para despliegues con recursos limitados. No obstante, la informacion publica disponible es escasa: cero descargas, cero likes, sin pipeline declarado y sin resultados de benchmarks, por lo que muchas especificaciones deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer, segun tags del repositorio |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3B (inferido del sufijo A3B del nombre) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K (imatrix ponderadas) |
| Idiomas soportados | en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix adicional) |

## Arquitectura y entrenamiento

La arquitectura declarada es de mezcla de expertos (MoE) con 35.505 millones de parametros totales y aproximadamente 3.000 millones activos por token, segun la convencion de nombres de la familia Qwen3.8. El modelo base empero-ai/Qwen3.8-35B-A3B-Distill fue sometido a un proceso de destilacion mediante SFT, segun los tags del repositorio (distillation, sft), con el objetivo de transferir capacidades de razonamiento y function calling desde un modelo de mayor tamano. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion concreta es el uso de cuantizacion imatrix ponderada, generada por mradermacher (segun los metadatos de la model card), que produce ficheros GGUF con calidad superior a la cuantizacion estandar para el mismo tamano. El repositorio incluye ademas un fichero imatrix de 0,3 GB para que terceros puedan generar sus propias cuantizaciones. La model card indica que se trata de un modelo de vision, con ficheros mmproj potencialmente disponibles en el repositorio estatico de mradermacher.

## Capacidades

- Generacion de texto conversacional y razonamiento, segun los tags reasoning y conversational del repositorio.
- Soporte de function calling / tool calling, segun el tag function-calling.
- Capacidades de destilacion orientadas a retener comportamiento de razonamiento de un modelo mayor.
- Soporte multilingue limitado al ingles (unico idioma declarado en la model card).
- Posible soporte de vision, ya que la model card indica que es un modelo de vision con ficheros mmproj en el repositorio estatico.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se dispone de informacion sobre modo thinking explicito, capacidades de audio ni soporte de agentes multi-paso mas alla de lo que implica el function calling.

## Casos de uso

- Asistentes conversacionales en ingles con despliegue local: el modelo puede ejecutarse en llama.cpp u Ollama con cuantizaciones desde 13,3 GB (i1-Q2_K) hasta 29,3 GB (i1-Q6_K), lo que permite montar un chatbot privado en una estacion de trabajo con GPU consumer de gama alta.
- Automatizacion de function calling en pipelines: el tag function-calling sugiere que el modelo puede invocar herramientas externas, lo que lo hace adecuado para orquestar APIs en flujos de trabajo automatizados donde se requiera un modelo local sin dependencia de la nube.
- Razonamiento asistido en entornos con restricciones de VRAM: al tener solo unos 3B de parametros activos, la inferencia es mas rapida que la de un modelo denso de 35B, lo que resulta util para tareas de razonamiento iterativo en hardware limitado.
- Procesamiento de documentos con componente visual: si se confirma el soporte de vision mediante los ficheros mmproj, el modelo podria emplearse para extraer informacion de imagenes o capturas en flujos documentales.
- Experimentacion e investigacion en destilacion: al ser una destilacion SFT de un modelo Qwen3.8, sirve como base para estudiar la transferencia de capacidades de razonamiento en arquitecturas MoE.
- Fine-tuning posterior sobre dominio especifico: la licencia Apache 2.0 y el formato GGUF permiten adaptar el modelo a tareas concretas, aunque para fine-tuning conviene partir del modelo base en safetensors en lugar de la cuantizacion.
- Despliegue en entornos air-gapped: al no requerir conexion a servicios externos, el modelo puede operar en infraestructuras aisladas con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 13,3 GB (i1-Q2_K) y 29,3 GB (i1-Q6_K) solo para los pesos, a los que hay que sumar el espacio para el contexto KV cache, que depende de la longitud de contexto configurada (no disponible).
- Cuantizacion recomendada por el autor para equilibrio tamano/velocidad/calidad: i1-Q4_K_S (20,5 GB) o i1-Q4_K_M (21,8 GB).
- GPU recomendadas: para las cuantizaciones mas bajas (Q2_K, Q3) es posible usar una RTX 4090 de 24 GB; para Q5 y Q6 se requiere una A100 de 40 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con cuantizaciones hasta Q4_K_M aproximadamente, dejando margen limitado para contexto; en GPUs de 16 GB solo cabrian las cuantizaciones Q2 y Q3 con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier motor compatible con GGUF; el tag endpoints_compatible sugiere integracion con APIs compatibles con OpenAI. No se declara soporte nativo para vLLM o TGI en el repositorio (estos suelen requerir safetensors).
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con aproximadamente 3B activos, se espera una velocidad de generacion notablemente superior a la de un modelo denso de 35B, pero no se aportan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada. La siguiente tabla recoge unicamente los datos verificables del modelo y deja como no disponibles los del resto.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-35B-A3B-Distill-OpenFlowLM-GGUF (este) | 35.505.251.456 | ~3B | no disponible | Apache 2.0 | GGUF |
| empero-ai/Qwen3.8-35B-A3B-Distill (base) | 35.505.251.456 | ~3B | no disponible | Apache 2.0 | safetensors |
| mradermacher/Qwen3.8-35B-A3B-Distill-GGUF | no disponible | no disponible | no disponible | Apache 2.0 | GGUF |

## Limitaciones y advertencias

- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que el rendimiento real es desconocido.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se documentan medidas especificas de mitigacion.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad.
- Contexto desconocido: se desconoce la longitud maxima de contexto soportada, lo que dificulta planificar casos de uso con documentos largos.
- Repositorio sin traccion: cero descargas y cero likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Modelo derivado: se trata de una cuantizacion de terceros, no del modelo oficial; la calidad final depende del proceso de cuantizacion y del modelo base.
- Soporte de vision no confirmado en este repositorio: la model card remite los ficheros mmproj al repositorio estatico de mradermacher, por lo que la funcionalidad visual puede no estar disponible directamente aqui.
- Uso comercial: la licencia Apache 2.0 lo permite, pero conviene verificar las condiciones del modelo base empero-ai/Qwen3.8-35B-A3B-Distill, ya que la licencia del derivado no puede ser mas permisiva que la del original.
- Fecha de creacion futura (2026-11-05) en los metadatos: dato anomalo que conviene contrastar antes de confiar en la trazabilidad del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Atomic-Germ/Qwen3.8-35B-A3B-Distill-OpenFlowLM-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-35B-A3B-Distill
- Cuantizaciones estaticas de referencia: https://huggingface.co/mradermacher/Qwen3.8-35B-A3B-Distill-GGUF
- Cuantizaciones imatrix de referencia: https://huggingface.co/mradermacher/Qwen3.8-35B-A3B-Distill-i1-GGUF
- Pagina de descargas de mradermacher: https://hf.tst.eu/model#Qwen3.8-35B-A3B-Distill-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
