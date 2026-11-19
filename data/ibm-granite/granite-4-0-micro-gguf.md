# ibm-granite/granite-4.0-micro-GGUF

## Resumen

Granite-4.0-micro es un modelo de lenguaje de 3.400 millones de parametros (3,4 B) desarrollado por IBM dentro de la familia Granite 4.0. Este repositorio concreto (`ibm-granite/granite-4.0-micro-GGUF`) contiene la version convertida al formato GGUF con multiples cuantizaciones, pensada para su ejecucion en llama.cpp y en cualquier runtime compatible con GGUF (Ollama, LM Studio, llama-cpp-python, etc.). El modelo base es `ibm-granite/granite-4.0-micro`, un modelo denso de tipo transformer orientado a generacion de texto conversacional.

La relevancia de esta publicacion radica en que permite desplegar un modelo de IBM con licencia Apache 2.0 en hardware de consumo, sin necesidad de GPUs de datacenter. Con 3,4 B de parametros, las cuantizaciones de 4 bits ocupan aproximadamente 2 GB, lo que lo situa en el rango de equipos con 8 GB de VRAM o incluso en CPU. Esto lo convierte en una opcion practica para prototipado local, aplicaciones de escritorio y despliegues en el borde.

La informacion disponible en la model card del repositorio GGUF es deliberadamente minima: remite a la model card del modelo base para todos los detalles de arquitectura, entrenamiento, contexto e idiomas. Por tanto, varios campos de esta ficha se marcan como "no disponible" al no estar presentes en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Granite 4.0); detalles especificos no disponibles |
| Parametros totales | 3.402.836.480 (3,4 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | multiples cuantizaciones GGUF; la model card usa Q4_K_M como ejemplo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo convertido); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Granite 4.0 de IBM, que segun la nomenclatura habitual de la serie emplea una arquitectura transformer densa. El repositorio GGUF no aporta detalles sobre la composicion del dataset de entrenamiento, el numero de tokens vistos, ni sobre si se aplicaron fases de RLHF, DPO o ajuste instructivo. Toda esa informacion queda remitida a la model card del modelo base `ibm-granite/granite-4.0-micro`.

La unica innovacion tecnica documentada en este repositorio es la conversion a GGUF con multiples niveles de cuantizacion, realizada con llama.cpp (build tag `b11798`) y verificada con Transformers `5.20.2`. La model card confirma compatibilidad con la API OpenAI a traves de `llama serve`, lo que facilita la integracion con clientes existentes.

## Capacidades

- Generacion de texto conversacional multi-turno (el repositorio esta etiquetado como `conversational`).
- Compatibilidad con la API OpenAI mediante `llama serve` (`/v1/chat/completions`).
- Ejecucion local en llama.cpp tanto en modo CLI interactivo (`llama cli`) como en modo servidor.
- Capacidades de razonamiento, codigo, matematicas o tool calling: no documentadas en la informacion disponible; deben consultarse en la model card del modelo base.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Prototipado local de asistentes conversacionales: gracias al formato GGUF y a la cuantizacion Q4_K_M, el modelo se puede arrancar con `llama cli` en un portatil y validar flujos de chat antes de escalar a un modelo mayor.
- Servicio compatible con OpenAI en infraestructura propia: `llama serve` expone `/v1/chat/completions`, de modo que aplicaciones que ya usan el SDK de OpenAI pueden apuntar a `http://localhost:8080` sin cambios de codigo.
- Aplicaciones de escritorio y herramientas ofimaticas con IA integrada: el reducido peso de las cuantizaciones de 4 bits permite empaquetar el modelo dentro de un producto sin depender de la nube.
- Despliegue en el borde o en dispositivos sin GPU dedicada: al caber en CPU con cuantizaciones bajas, encaja en entornos con recursos limitados donde un modelo de 3,4 B es suficiente.
- Generacion de texto por lotes en pipelines internos: para tareas de resumen, reformulacion o clasificacion simple donde la latencia no es critica y se prefiere coste cero de inferencia.
- Evaluacion comparativa y experimentacion: sirve como referencia ligera de la familia Granite 4.0 para comparar cuantizaciones (Q4_K_M frente a otras) y medir el impacto en calidad antes de adoptar modelos mayores de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio GGUF no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion; dichos datos, si existen, estarian en la model card del modelo base.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, un modelo de 3,4 B ocupa aproximadamente 2 GB de pesos; sumando KV cache y overhead del runtime, el consumo tipico se situa en torno a 2,5-3,5 GB, dependiendo de la longitud de contexto efectiva (no disponible).
- GPU recomendadas: cualquier GPU consumer moderna con 6-8 GB de VRAM es suficiente (RTX 3060, RTX 4060, RTX 4070). En datacenter, A100 o H100 quedan sobredimensionadas para este modelo y solo tendrian sentido en escenarios de alta concurrencia.
- Cabe en GPU consumer: si, en la practica totalidad de GPUs dedicadas con 6 GB o mas; tambien en GPUs integradas con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp (`llama cli` y `llama serve`), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible para este repositorio.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato local | Notas |
|---|---|---|---|---|---|
| Granite-4.0-micro (GGUF) | 3,4 B | no disponible | Apache 2.0 | GGUF | Modelo de IBM, orientado a conversacion |
| Llama 3.2 3B Instruct | ~3,2 B | no disponible en esta ficha | Llama Community License | GGUF disponible | Tamano comparable; licencia mas restrictiva que Apache 2.0 |
| Qwen2.5 3B Instruct | ~3,1 B | no disponible en esta ficha | Apache 2.0 | GGUF disponible | Tamano y licencia comparables; requiere validacion propia |
| Phi-3.5-mini Instruct | ~3,8 B | no disponible en esta ficha | MIT | GGUF disponible | Ligeramente mayor; licencia permisiva |

La comparacion se limita a parametros, licencia y disponibilidad en formato GGUF, ya que no hay datos de rendimiento publicados para Granite-4.0-micro en la informacion disponible. Cualquier afirmacion sobre calidad relativa frente a estos modelos requeriria benchmarks que aqui no se aportan.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; deben consultarse en la model card del modelo base.
- Riesgo de alucinacion: no cuantificado; como todo modelo generativo de 3,4 B, es esperable una tasa de alucinacion superior a modelos mayores, pero no hay datos que lo respalden en esta ficha.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan indicados en el repositorio GGUF; es imprescindible revisar la model card del modelo base antes de usarlo en produccion multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y atribucion. No se identifican restricciones adicionales en la informacion disponible.
- Caveats para produccion: la model card del repositorio GGUF es minima y remite al modelo base; no se han publicado benchmarks ni mediciones de latencia, por lo que cualquier decision de despliegue deberia acompanarse de una evaluacion propia sobre el caso de uso concreto.
- El repositorio pesa 136,1 GB en total debido a las multiples cuantizaciones; conviene descargar solo el archivo GGUF necesario en lugar de clonar el repositorio completo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ibm-granite/granite-4.0-micro-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-micro
- Documentacion de llama.cpp: https://github.com/ggml-org/llama.cpp
- Referencia de `llama cli`: https://github.com/ggml-org/llama.cpp/blob/master/tools/cli/README.md
- Referencia de `llama serve`: https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md
