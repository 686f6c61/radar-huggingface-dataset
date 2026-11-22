# mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF

## Resumen

GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF es una distribucion en formato GGUF del modelo GLM-Z1-32B-0414-uncensored-heretic-v1, un ajuste fino "uncensored" del modelo GLM-Z1-32B-0414 desarrollado originalmente por Zhipu AI (Z.ai). El autor de esta publicacion, mradermacher, es un conocido empaquetador de cuantizaciones GGUF para llama.cpp, y en este caso distribuye una version cuantizada con tecnicas de imatrix (importance matrix) del modelo afinado por llmfan46.

El modelo base GLM-Z1-32B es un transformer denso de aproximadamente 32.500 millones de parametros (32.566.081.536 exactamente, segun los pesos en safetensors del modelo origen), orientado a razonamiento y conversacion. La variante "heretic" y "uncensored" implica que se ha aplicado un proceso de eliminacion o reduccion de rechazos (refusals) mediante tecnicas de abliteration o fine-tuning especifico, lo que cambia el comportamiento del modelo ante peticiones que el modelo original rechazaria.

La relevancia de esta ficha es doble: por un lado documenta un modelo de razonamiento de 32B en formato GGUF con cuantizaciones que van desde IQ1_S hasta Q6_K, lo que permite ejecutarlo en hardware de consumo; por otro, advierte de que se trata de una modificacion no oficial, sin garantias de calidad, con licencia no declarada y con implicaciones eticas y de seguridad derivadas de la eliminacion de mecanismos de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en GLM-Z1-32B-0414); detalles de atencion no disponibles en la informacion proporcionada |
| Parametros totales | 32.566.081.536 (32,57B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base GLM-Z1-32B-0414 declara contexto largo, pero no se confirma aqui) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no la declara; el modelo base GLM tiene su propia licencia, pero esta modificacion no la especifica) |
| Formato de pesos | GGUF (con version de cuantizacion 2, output_tensor_quantised 1, convert_type hf) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer denso de 32,57B parametros. El modelo base GLM-Z1-32B-0414 es un modelo de razonamiento de Zhipu AI, pero esta publicacion no incluye datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o procesos de abliteration. La model card solo documenta metadatos del proceso de cuantizacion: version 2 de quantize_version, output_tensor_quantised activado, convert_type hf (conversion desde Hugging Face) y el uso de cuantizaciones ponderadas con imatrix.

El elemento diferenciador declarado es el uso de imatrix (importance matrix) para generar las cuantizaciones, una tecnica que mejora la calidad de los formatos de baja precision (IQ1, IQ2, IQ3) al ponderar los tensores segun su importancia. El proceso de "uncensored heretic" se aplico en el modelo origen (llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1), no en esta publicacion, que solo lo empaqueta en GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno (tag "conversational").
- Razonamiento y resolucion de problemas, heredado del modelo base GLM-Z1-32B orientado a reasoning.
- Generacion de codigo y matematicas (capacidad esperable del modelo base, no verificada en esta publicacion).
- Comportamiento "uncensored": menor tasa de rechazos ante peticiones que el modelo original rechazaria, debido al ajuste heretic/abliteration.
- Compatibilidad con endpoints (tag "endpoints_compatible"), lo que sugiere uso via API compatible con OpenAI en plataformas de despliegue.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la abliteration comparando sus respuestas con las del GLM-Z1-32B original, util para equipos que investigan mecanismos de rechazo y sesgos.
- Despliegue local en estaciones de trabajo: con cuantizaciones Q4_K_M o Q5_K_M, el modelo cabe en GPUs de consumo de 24 GB (RTX 3090/4090) y permite experimentar con un modelo de razonamiento de 32B sin depender de la nube.
- Prototipado de asistentes conversacionales: la naturaleza conversacional del tag y el formato GGUF permiten integrarlo en llama.cpp u Ollama para pruebas de concepto de chatbots multi-turno.
- Generacion de texto creativo sin filtros: escritores e investigadores pueden usarlo para explorar narrativa o dialogos que el modelo base rechazaria, asumiendo la responsabilidad editorial del contenido.
- Evaluacion comparativa de cuantizaciones: el amplio rango de cuantizaciones (desde IQ1_S hasta Q6_K) permite medir la degradacion de calidad frente al modelo en FP16, util para estudiar el impacto de la cuantizacion en modelos de razonamiento.
- Analisis de sesgos y contenido toxico: al reducir los rechazos, el modelo puede emplearse en pipelines de red-teaming para generar respuestas que sirvan de base a clasificadores de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia (32,57B parametros):
  - Q4_K_M: aproximadamente 19-21 GB de VRAM.
  - Q5_K_M: aproximadamente 22-24 GB.
  - Q6_K: aproximadamente 26-28 GB.
  - IQ2/IQ3: aproximadamente 10-15 GB, con perdida notable de calidad.
  - IQ1_S: aproximadamente 7-9 GB, calidad muy degradada.
- GPU recomendadas: A100 40/80 GB o H100 para FP16 y cuantizaciones altas; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB solo con cuantizaciones IQ2/IQ3.
- Cabe en GPU de consumo: si, en RTX 3090/4090 con Q4_K_M o Q5_K_M; en GPUs de 16 GB (RTX 4080, 4070 Ti Super) solo con cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con endpoints (tag "endpoints_compatible"); vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan conversion a safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF (este) | 32,57B | No disponible | GGUF | No disponible | Cuantizaciones imatrix, ajuste uncensored |
| GLM-Z1-32B-0414 (original, Zhipu AI) | 32B | No disponible en esta ficha | safetensors | Licencia GLM (consultar) | Modelo base con alineacion estandar |
| Qwen2.5-32B-Instruct | 32,5B | 128K (segun documentacion publica de Qwen) | safetensors, GGUF | Apache 2.0 | Alternativa densa de tamano similar con licencia permisiva |
| DeepSeek-R1-Distill-Qwen-32B | 32,8B | 128K (segun documentacion publica) | safetensors, GGUF | MIT (modelo destilado) | Modelo de razonamiento de tamano comparable |

Nota: los datos de contexto y licencia de los modelos comparativos provienen de su documentacion publica y no de la informacion proporcionada en esta busqueda; verificar antes de uso en produccion.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia de esta publicacion ni del modelo origen, lo que impide confirmar si el uso comercial esta permitido. Contactar con el autor antes de cualquier despliegue productivo.
- Modelo "uncensored": la eliminacion de rechazos implica que el modelo puede generar contenido danino, ilegal o eticamente problematico; no es apto para aplicaciones de cara al publico sin capas de moderacion adicionales.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de 32B, agravado por la cuantizacion en formatos bajos (IQ1, IQ2).
- Degradacion por cuantizacion: las cuantizaciones IQ1_S, IQ2_XXS e IQ2_XS pueden degradar significativamente el razonamiento y la coherencia; no recomendadas para tareas criticas.
- Idiomas no declarados: no se confirma el soporte multilingue ni la calidad en castellano.
- Sin benchmarks: no hay evidencia publicada de rendimiento que permita comparar con el modelo base.
- Procedencia no oficial: es una modificacion de terceros sobre un modelo de terceros; no hay garantia de integridad ni de soporte.
- Contexto no confirmado: aunque el modelo base GLM-Z1-32B declara contexto largo, esta publicacion no lo especifica; verificar en la configuracion del GGUF antes de disenar flujos con contexto extenso.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/mradermacher/GLM-Z1-32B-0414-uncensored-heretic-v1-i1-GGUF
- Modelo origen del ajuste uncensored: https://huggingface.co/llmfan46/GLM-Z1-32B-0414-uncensored-heretic-v1
- Perfil del autor de la cuantizacion: https://huggingface.co/mradermacher
- Modelo base GLM-Z1-32B-0414 (Zhipu AI): no disponible en la informacion proporcionada (buscar en Hugging Face bajo el organizacion de Zhipu AI / Z.ai)
- llama.cpp (runtime GGUF): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
