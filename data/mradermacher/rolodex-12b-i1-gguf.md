# mradermacher/Rolodex-12B-i1-GGUF

## Resumen

Rolodex-12B es un modelo de lenguaje diseñado para tareas de búsqueda agéntica (agentic search), recuperación de información, memoria persistente y uso de herramientas. El modelo base, desarrollado por polygramme, está construido sobre arquitectura GLM e incorpora adaptadores LoRA para especializarse en flujos de trabajo conversacionales y de agente. Esta ficha corresponde a la cuantización GGUF publicada por mradermacher, que facilita su despliegue en entornos de inferencia local como llama.cpp u Ollama.

La relevancia de este modelo reside en su orientación específica a sistemas de agente: combina recuperación de información, memoria de contexto y tool calling en una única arquitectura. La versión cuantizada en i1-Q2_K ocupa 45,1 GB, lo que permite ejecutarlo en estaciones de trabajo con GPU de alta gama. La licencia MIT facilita su adopción tanto en investigación como en productos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM con adaptadores LoRA |
| Parametros totales | 110.468.824.832 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (unico quant publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

Nota: el nombre del modelo indica "12B", pero el conteo de parametros del safetensors original registra 110.468.824.832. Esta discrepancia puede deberse a que el archivo safetensors incluye tanto el modelo base como los adaptadores LoRA, o a que el modelo base emplea arquitectura MoE con parametros activos menores que los totales. No se dispone de informacion adicional para resolverla.

## Arquitectura y entrenamiento

El modelo base Rolodex-12B emplea arquitectura GLM, una familia de transformers desarrollada originalmente por Zhipu AI que incorpora atencion con mascara bidireccional y capacidades de razonamiento mejoradas. Los adaptadores LoRA anadidos especializan el modelo para tareas de búsqueda agéntica, recuperación de informacion y uso de herramientas. La cuantización i1-Q2_K aplicada por mradermacher utiliza un archivo de importancia (imatrix) para optimizar la distribucion de pesos y minimizar la perdida de calidad respecto al modelo original.

No se dispone de informacion publica sobre el dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se conocen innovaciones tecnicas concretas mas alla de la combinacion de GLM con LoRA para la especializacion en agentes.

## Capacidades

- Búsqueda agéntica: el modelo esta optimizado para planificar y ejecutar búsquedas de informacion de forma autonoma, consultando fuentes externas cuando es necesario.
- Recuperación de informacion (retrieval): integra capacidad de recuperar documentos o fragmentos relevantes dentro de un flujo conversacional.
- Memoria persistente: disenado para mantener y actualizar estado de memoria a lo largo de conversaciones multi-turno.
- Tool calling: soporta invocacion de herramientas externas, lo que permite integrarse con APIs y funciones definidas por el desarrollador.
- Conversacion: capacidad nativa de dialogo en ingles, con tono conversacional.
- Multilingue: no disponible, el modelo solo declara soporte para ingles.

## Casos de uso

- Asistentes de soporte tecnico con acceso a base de conocimiento: el modelo puede recuperar documentacion interna, consultar APIs de ticketing y mantener el estado de la conversacion a lo largo de multiples turnos.
- Agentes de investigacion autonoma: planifica búsquedas web o en repositorios internos, recopila resultados y sintetiza respuestas con citas.
- Chatbots de comercio electronico con integracion de herramientas: consulta catalogos, verifica stock, crea pedidos y gestiona incidencias usando tool calling.
- Sistemas de recuperacion aumentada (RAG): su capacidad de retrieval integrada permite construir pipelines de pregunta-respuesta sobre colecciones documentales sin necesidad de componentes externos.
- Asistentes de desarrollo que consultan documentacion y repositorios: el modelo puede buscar en la documentacion del proyecto, leer archivos de codigo y responder preguntas tecnicas usando herramientas.
- Analisis de datos conversacional: el agente puede consultar bases de datos SQL, procesar los resultados y presentar conclusiones al usuario en lenguaje natural.
- Automatizacion de flujos de trabajo con memoria de estado: el modelo mantiene contexto de tareas previas y estado de ejecucion entre llamadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos sobre MMLU, HumanEval, GSM8K ni otros evaluadores estandar para este modelo. La cuantizacion i1-Q2_K introduce perdidas de calidad significativas respecto al modelo original, por lo que los resultados en tareas complejas seran inferiores a los de la version en precision completa.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q2_K pesa 45,1 GB. Se recomienda al menos 48 GB de VRAM para cargar el modelo completo en GPU.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB, o configuraciones multi-GPU con RTX 4090 (24 GB cada una, al menos 2 en paralelo) o RTX 6000 Ada.
- GPU de consumo: no cabe en una RTX 4090 de 24 GB. Requiere al menos 2 GPUs de consumo en configuracion NVLink o PCIe.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio o cualquier runtime compatible con GGUF. Para despliegue en produccion con mayor throughput, se puede convertir a formato vLLM o TGI, aunque la cuantizacion Q2_K no es optima para esos motores.
- Latencia: no disponible. Se espera una latencia alta (varios segundos por token) en tareas de razonamiento complejas, dado el tamano del modelo y la baja cuantizacion.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma categoria (búsqueda agéntica con memoria y tool calling). La informacion publica no incluye benchmarks que permitan comparar con alternativas como modelos GLM de Zhipu AI, Llama 3 de Meta o Qwen 2.5, ni con otros modelos especializados en agentes. La cuantizacion Q2_K, ademas, degrada el rendimiento respecto a la version original del modelo, por lo que una comparativa justa requeriria ejecutar el modelo base en precision FP16 o BF16.

## Limitaciones y advertencias

- Cuantizacion Q2_K: es un nivel de cuantizacion muy agresivo que produce perdidas de calidad significativas en tareas complejas como razonamiento multi-step y generacion de codigo. No se recomienda para produccion critica sin evaluacion previa.
- Idioma limitado: solo soporta ingles. No se puede usar para tareas en castellano, frances, aleman ni otros idiomas.
- Riesgo de alucinacion: no se ha publicado informacion sobre tasas de alucinacion; la cuantizacion agresiva tiende a incrementar la probabilidad de respuestas incorrectas.
- Sesgos desconocidos: no se ha publicado informacion sobre sesgos o evaluaciones de seguridad.
- Informacion de entrenamiento incompleta: no se conocen los datos de entrenamiento, lo que dificulta evaluar su comportamiento en dominios especificos.
- Despliegue en produccion: la unica cuantizacion disponible (Q2_K) no es recomendada para entornos de produccion con requisitos de precision. Se recomienda esperar cuantizaciones de mayor calidad (Q4_K_M, Q5_K_M) o utilizar el modelo base en precision completa.
- Fecha de creacion: el modelo se publico en agosto de 2026, lo que implica que la informacion sobre su entrenamiento y rendimiento puede ser limitada.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Rolodex-12B-i1-GGUF
- Modelo base: https://huggingface.co/polygramme/Rolodex-12B
- Pagina de descarga de mradermacher: https://hf.tst.eu/model
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
- Solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Cuantizaciones estaticas del modelo: https://huggingface.co/mradermacher/Rolodex-12B-GGUF
