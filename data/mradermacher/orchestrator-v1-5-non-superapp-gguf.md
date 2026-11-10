# mradermacher/orchestrator-v1.5-non-superapp-GGUF

## Resumen

Orchestrator v1.5 non-superapp es un modelo de lenguaje de ~7.460 millones de parametros (7,463,013,674 segun los pesos en safetensors) orientado a flujos agenticos y uso de herramientas (tool use). El modelo original lo desarrolla el usuario saggamer bajo el identificador `saggamer/orchestrator-v1.5-non-superapp`, y esta ficha corresponde a la version cuantizada en GGUF publicada por mradermacher, un conocido distribuidor de cuantizaciones estaticas para el ecosistema llama.cpp.

El modelo se etiqueta con la familia `gemma4`, lo que sugiere que deriva de la arquitectura Gemma de Google, aunque no se dispone de documentacion tecnica del autor original que confirme detalles de entrenamiento, datos o proceso de alineacion. La licencia es Apache 2.0, lo que facilita su uso comercial sin restricciones adicionales significativas.

Su relevancia actual radica en el nicho: modelos de tamano medio (7B) especializados en razonamiento multi-paso y llamadas a funciones, distribuidos en GGUF para despliegue en hardware de consumo. El repositorio GGUF ocupa 38,6 GB e incluye cuantizaciones desde Q2_K hasta f16, lo que permite ejecutarlo en GPUs consumer con 6-8 GB de VRAM en las variantes mas agresivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiquetado como familia `gemma4`; detalles no disponibles) |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original. La etiqueta `gemma4` en los metadatos sugiere una base derivada de la familia Gemma de Google, pero el autor no publica en la model card datos sobre numero de capas, dimension del modelo, mecanismo de atencion ni si incorpora innovaciones como atencion lineal o decodificacion especulativa.

Tampoco hay informacion sobre el corpus de entrenamiento (numero de tokens, composicion, proporción de codigo o datos multilingues), ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Las etiquetas `agentic-ai` y `tool-use` indican que el ajuste se oriento a tareas de agente y llamadas a herramientas, pero no se documenta el proceso. Esta version concreta es una cuantizacion estatica (sin imatrix) generada por mradermacher mediante su pipeline habitual de conversion HF a GGUF.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline `text-generation`, tag `conversational`).
- Uso de herramientas y function calling, segun la etiqueta `tool-use`.
- Razonamiento agentico multi-paso, segun la etiqueta `agentic-ai`.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere integracion con APIs de inferencia tipo TGI o vLLM.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Orquestacion de agentes con tool calling: el modelo puede actuar como capa de decision que selecciona y encadena llamadas a APIs externas en pipelines agenticos, gracias a su ajuste especifico en `tool-use`.
- Automatizacion de tareas de oficina con funciones: integrado en un framework de agentes (LangChain, LlamaIndex) para consultar calendarios, bases de datos o servicios REST mediante function calling.
- Asistente conversacional en ingles para soporte tecnico: con 7B de parametros y cuantizacion Q4_K_S (5,3 GB), puede desplegarse en una sola GPU consumer para atencion multi-turno.
- Prototipado rapido de agentes en local: la version Q4_K_S permite iterar en un portatil con GPU de 8 GB sin depender de APIs en la nube.
- Evaluacion de pipelines agenticos antes de escalar a modelos mayores: util como baseline economico para medir latencia y calidad de orquestacion.
- Despliegue en entornos con requisitos de licencia permisiva: Apache 2.0 permite incorporarlo en productos comerciales sin obligaciones de atribucion complejas.
- Generacion de texto en ingles para tareas de clasificacion o extraccion estructurada dentro de un flujo con herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5-6 GB con Q4_K_S (5,3 GB de pesos), ~16 GB con f16 (15,0 GB de pesos). Las cuantizaciones Q2_K y Q3_K_S permitirian bajar de 4 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, A10, L4 para produccion ligera; A100/H100 no necesarias para este tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPUs con 8 GB o mas usando Q4_K_S; en GPUs de 6 GB con Q3_K_M o inferiores.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; el modelo base en safetensors puede servirse con vLLM o TGI.
- Latencia y throughput: no disponibles (sin datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| orchestrator-v1.5-non-superapp | 7,46B | no disponible | Apache 2.0 | Agentico / tool use | GGUF + safetensors |
| Qwen2.5-7B-Instruct | 7,6B | 128K (variante estandar) | Apache 2.0 | Generalista con tool calling | Muy amplia (GGUF, AWQ, GPTQ) |
| Mistral-7B-Instruct v0.3 | 7,2B | 32K | Apache 2.0 | Generalista | Muy amplia |
| Llama-3.1-8B-Instruct | 8,0B | 128K | Llama 3.1 Community | Generalista con tool calling | Muy amplia |

La comparativa se ofrece como referencia de categoria (modelos densos de 7-8B con licencia permisiva); no se dispone de datos de rendimiento del modelo evaluado para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Solo soporta ingles; no se declara soporte de otros idiomas.
- No hay informacion publica sobre sesgos, datos de entrenamiento ni proceso de alineacion, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinacion inherente a modelos de 7B sin datos de evaluacion publicados; no se recomienda uso en dominios de alta precision sin validacion.
- Longitud de contexto desconocida: no se puede garantizar el manejo de conversaciones o documentos largos.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin evidencia de validacion por la comunidad.
- Aunque la licencia es Apache 2.0, conviene verificar que el modelo base no imponga restricciones adicionales derivadas de la familia Gemma.
- No se dispone de informacion sobre el autor original (saggamer) ni de documentacion tecnica que respalde las capacidades declaradas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/orchestrator-v1.5-non-superapp-GGUF
- Modelo base: https://huggingface.co/saggamer/orchestrator-v1.5-non-superapp
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#orchestrator-v1.5-non-superapp-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
