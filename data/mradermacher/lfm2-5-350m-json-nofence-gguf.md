# mradermacher/LFM2.5-350M-JSON-NoFence-GGUF

## Resumen

LFM2.5-350M-JSON-NoFence es una cuantizacion en formato GGUF realizada por mradermacher sobre el modelo base `yasserrmd/LFM2.5-350M-JSON-NoFence`, que a su vez deriva de la familia LFM2.5 de Liquid AI. Se trata de un modelo de lenguaje de 354.483.968 parametros (aproximadamente 350M), orientado a la generacion de JSON y publicado bajo la licencia LFM1.0. El modelo base se ha modificado mediante tecnicas de edicion de pesos en el espacio de pesos (weight-space programming) para eliminar el uso de fences de Markdown (bloques de codigo con triple backtick) en las respuestas JSON, de ahi el sufijo "NoFence".

La relevancia de esta ficha radica en que ofrece una version cuantizada lista para desplegar en entornos con recursos limitados: el quant Q4_K_M ocupa apenas 0.3 GB, lo que permite ejecutarlo en CPU o en GPUs de gama baja. No obstante, la informacion publicada por el autor es escasa: no se detallan datos de entrenamiento, benchmarks, longitud de contexto ni composicion del dataset original. La model card del cuantizador se limita a listar los ficheros GGUF disponibles y a remitir a la documentacion generica de TheBloke para el uso de GGUF.

Esta ficha se basa exclusivamente en la informacion disponible en Hugging Face y en la model card del cuantizador; cualquier dato no confirmado se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM2.5 de Liquid AI; no se detalla en la informacion proporcionada) |
| Parametros totales | 354.483.968 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | lfm1.0 (license_name: lfm1.0; license: other) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en transformers/safetensors |
| Tamano del repo | 3.3 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El modelo pertenece a la familia LFM2.5 de Liquid AI, segun las etiquetas (`lfm2`, `lfm2.5`, `liquid`), pero la model card no especifica si se trata de un transformer denso, un modelo hibrido o una arquitectura SSM. Tampoco se indican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica documentada es la edicion de pesos en el espacio de pesos (weight-space programming) aplicada por el autor del modelo base (`yasserrmd`) para modificar el comportamiento de generacion de JSON y eliminar los fences de Markdown. Esta tecnica de model editing permite alterar el comportamiento sin reentrenamiento completo, aunque no se detallan ni el procedimiento exacto ni el volumen de datos utilizado para la edicion. El cuantizador mradermacher ha generado cuantizaciones estaticas (sin imatrix ni weighted quants), segun indica en la propia model card.

## Capacidades

- Generacion de texto en ingles, con especializacion en la produccion de JSON sin fences de Markdown (sin bloques de codigo con triple backtick).
- Salida estructurada orientada a integracion en pipelines que esperan JSON limpio y parseable directamente.
- Conversacion multi-turno (etiqueta `conversational` en los tags del repositorio).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multimodal (vision, audio) ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles segun el campo `language`.

## Casos de uso

- Extraccion de datos estructurados: el modelo puede recibir texto en ingles y devolver JSON limpio sin fences, lo que simplifica el parseo directo en aplicaciones de extraccion de entidades o campos. Es adecuado por su especializacion en JSON y su bajo coste computacional.
- Validacion y formateo de respuestas en pipelines de datos: se puede usar como paso intermedio para convertir texto libre en JSON valido antes de insertarlo en una base de datos o en un sistema de colas, evitando el postprocesado de fences.
- Prototipado rapido en entornos con recursos limitados: al ocupar 0.3 GB en Q4_K_M, permite iterar en local sin GPU dedicada, ideal para pruebas de concepto de agentes o asistentes que necesitan salida JSON.
- Generacion de configuraciones y payloads: util para producir objetos JSON de configuracion, payloads de API o fixtures de test en ingles, con la ventaja de que la salida no requiere limpieza de Markdown.
- Educacion y demostraciones: modelo ligero para ensenar tecnicas de cuantizacion, edicion de pesos y despliegue con llama.cpp u Ollama en talleres o cursos.
- Servicio de bajo coste en CPU: al ser un modelo de 350M en GGUF, puede desplegarse en contenedores sin GPU para tareas de formateo JSON de baja latencia y alto volumen, siempre que la precision requerida no sea alta.
- Integracion en herramientas de desarrollo: como generador de JSON de ejemplo o de esquemas en editores y asistentes de codigo, aunque limitado al ingles y sin garantias de validez estricta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.3 GB en Q4_K_M y Q4_K_S; 0.3 GB en Q2_K, Q3_K_S, Q3_K_M, Q3_K_L e IQ4_XS; 0.4 GB en Q5_K_S, Q5_K_M y Q6_K; 0.5 GB en Q8_0; 0.8 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM libre; el modelo cabe holgadamente en GTX 1050 Ti, RTX 3050, RTX 4060, RTX 4090, A100 y H100. Tambien puede ejecutarse en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base es compatible con transformers. No se documenta soporte explicito de vLLM o TGI para esta cuantizacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano (350M parametros) se espera una latencia baja en CPU y muy baja en GPU, pero no se aportan cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| LFM2.5-350M-JSON-NoFence (este) | 354.483.968 | no disponible | lfm1.0 | GGUF, safetensors | Especializado en JSON sin fences; solo ingles |
| LFM2.5-350M (base, sin edicion) | ~350M | no disponible | lfm1.0 | safetensors | Comportamiento JSON estandar, con fences |
| Qwen2.5-0.5B-Instruct | ~500M | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Multilingue, mayor contexto, licencia permisiva |
| SmolLM2-360M-Instruct | ~360M | 8.192 tokens (segun documentacion publica de Hugging Face) | Apache 2.0 | safetensors, GGUF | Multilingue, orientado a dispositivo |

Nota: los datos de los modelos comparables provienen de documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia orientativa. No se dispone de benchmarks comparativos del modelo LFM2.5-350M-JSON-NoFence.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse principalmente en ingles, puede reflejar sesgos del corpus anglosajon.
- Riesgo de alucinacion: alto en un modelo de 350M parametros; no se garantiza que el JSON generado sea valido ni que los valores sean correctos.
- Limitaciones de contexto o idioma: solo se declara soporte de ingles; la longitud de contexto no esta documentada, lo que impide planificar conversaciones largas con garantias.
- Restricciones de licencia: la licencia LFM1.0 puede imponer condiciones para uso comercial; es necesario revisar el fichero LICENSE del modelo base antes de desplegarlo en produccion.
- Caveat de produccion: la edicion de pesos para eliminar fences puede degradar otras capacidades del modelo base; no se han publicado evaluaciones que cuantifiquen esta posible regresion.
- Cuantizaciones estaticas sin imatrix: el autor indica que no hay weighted/imatrix quants, por lo que la calidad de las cuantizaciones bajas (Q2_K, Q3_K) puede ser inferior a la de variantes con imatrix.
- Sin benchmarks: no hay datos objetivos de rendimiento que permitan comparar con alternativas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Repositorio Hugging Face del GGUF: https://huggingface.co/mradermacher/LFM2.5-350M-JSON-NoFence-GGUF
- Modelo base: https://huggingface.co/yasserrmd/LFM2.5-350M-JSON-NoFence
- Pagina de overview del cuantizador: https://hf.tst.eu/model#LFM2.5-350M-JSON-NoFence-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Guia sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
