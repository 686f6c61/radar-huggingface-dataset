# ANGELOSEGRETO/gpt-oss-20b

## Resumen

Este repositorio, ANGELOSEGRETO/gpt-oss-20b, es una reproduccion alojada por un tercero de los pesos del modelo gpt-oss-20b desarrollado originalmente por OpenAI. Se trata de un modelo de lenguaje autoregresivo de tipo transformer con mezcla de expertos (MoE), con 20.914.757.184 parametros totales (aproximadamente 21B) y unos 3,6B parametros activos por token, disenado para razonamiento, tareas agenticas y generacion de texto en entornos de baja latencia o de despliegue local.

El modelo forma parte de la serie gpt-oss, publicada bajo licencia Apache 2.0, y se distribuye ya cuantizado en MXFP4 sobre los pesos de las capas MoE, lo que permite ejecutarlo en equipos con aproximadamente 16 GB de memoria. La model card original enfatiza tres caracteristicas diferenciales: esfuerzo de razonamiento configurable (low, medium, high), acceso completo a la cadena de pensamiento y soporte nativo de function calling, navegacion web, ejecucion de codigo Python y salidas estructuradas.

La relevancia de esta ficha radica en que el repositorio listado no es el oficial de OpenAI, sino una copia subida por el usuario ANGELOSEGRETO con cero descargas y cero likes en el momento de la consulta. Por tanto, cualquier evaluacion debe contrastarse con el repositorio original openai/gpt-oss-20b antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia gpt_oss; numero de capas y de expertos no disponible en la informacion proporcionada |
| Parametros totales | 20.914.757.184 (aproximadamente 21B) |
| Parametros activos | Aproximadamente 3,6B |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | MXFP4 en los pesos MoE (aplicada en post-entrenamiento); etiqueta 8-bit en el repositorio; otras cuantizaciones no detalladas |
| Idiomas soportados | no disponible (la model card no declara una lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); el repositorio ocupa 41,3 GB e incluye pesos en formato original |

## Arquitectura y entrenamiento

La informacion disponible confirma que gpt-oss-20b es un modelo de mezcla de expertos con 21B parametros totales y 3,6B activos, lo que reduce el coste computacional por token frente a un modelo denso del mismo tamano. Los pesos MoE se cuantizaron en MXFP4 durante la fase de post-entrenamiento, y todas las evaluaciones reportadas por OpenAI se realizaron con esa misma cuantizacion. La model card no detalla el numero de capas, el numero de expertos, la estrategia de enrutamiento ni la composicion del dataset de entrenamiento.

Un aspecto critico del diseno es el uso del formato de respuesta harmony, desarrollado por OpenAI. Segun la propia model card, los dos modelos de la serie fueron entrenados con ese formato y solo funcionan correctamente si se emplea dicho formato; el chat template de Transformers lo aplica de forma automatica. El modelo admite ajuste fino por parametros completos, y expone de manera configurable el nivel de esfuerzo de razonamiento, asi como la cadena de pensamiento completa para depuracion.

## Capacidades

- Generacion de texto conversacional multi-turno mediante el pipeline text-generation.
- Razonamiento con esfuerzo configurable en tres niveles (low, medium, high), lo que permite intercambiar latencia por profundidad de razonamiento.
- Acceso completo a la cadena de pensamiento (chain-of-thought), pensado para depuracion y verificacion, no para mostrarse al usuario final.
- Function calling nativo y capacidades agenticas para tareas de varios pasos.
- Navegacion web como herramienta integrada, segun la documentacion de OpenAI.
- Ejecucion de codigo Python como herramienta integrada.
- Salidas estructuradas (Structured Outputs) para integracion con sistemas que requieren esquemas fijos.
- Capacidades multilingues: no disponible, la model card no especifica idiomas soportados.
- Vision y audio: no disponibles; no se mencionan en la informacion proporcionada.
- Ajuste fino por parametros para adaptacion a dominios concretos.

## Casos de uso

- Agentes de automatizacion de tareas: el modelo puede encadenar llamadas a funciones y ejecucion de codigo Python para resolver flujos de varios pasos, lo que lo hace adecuado como motor de agentes en entornos de orquestacion.
- Asistentes de atencion al cliente: con 3,6B parametros activos y despliegue local, permite servir conversaciones multi-turno con coste de inferencia bajo y sin enviar datos a terceros.
- Generacion y revision de codigo en pipelines de CI/CD: gracias al soporte nativo de function calling y salidas estructuradas, puede integrarse en revisiones automatizadas, generacion de tests o resumen de cambios.
- Razonamiento asistido con trazabilidad: al exponer la cadena de pensamiento completa, resulta util en entornos donde se necesita auditar como se ha llegado a una respuesta, como analisis financiero o diagnostico tecnico interno.
- Despliegue en equipos de sobremesa y portatiles: al caber en aproximadamente 16 GB de memoria, es viable para desarrolladores que quieren un modelo de razonamiento local sin depender de APIs externas.
- Extraccion de informacion estructurada: las salidas estructuradas permiten convertir texto libre en JSON con un esquema definido para alimentar bases de datos o sistemas de gestion.
- Automatizacion de investigacion con navegacion web: la capacidad de navegacion integrada permite construir asistentes que consultan fuentes externas y resumen resultados.
- Prototipado rapido de aplicaciones de IA: la licencia Apache 2.0 y la disponibilidad de integraciones con vLLM, Ollama y LM Studio reducen la friccion para experimentar y desplegar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original menciona que todas las evaluaciones se realizaron con la misma cuantizacion MXFP4, pero no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de otras pruebas en el material proporcionado.

## Requisitos de hardware

- Memoria estimada para inferencia: aproximadamente 16 GB con la cuantizacion MXFP4 incluida en el modelo, segun la model card.
- El repositorio ocupa 41,3 GB, un dato coherente con la presencia de pesos en formato original ademas de los cuantizados; conviene revisar que ficheros se descargan antes de planificar el almacenamiento.
- GPU de centro de datos: el modelo hermano de 120B esta pensado para una unica GPU de 80 GB (NVIDIA H100 o AMD MI300X); para el modelo de 20B no se especifica una GPU de referencia concreta.
- GPU de consumo: es viable en tarjetas con 16 GB o mas de VRAM, como la RTX 4090 (24 GB) o la RTX 5090 (32 GB). En tarjetas de 16 GB el margen es ajustado y depende del backend y de la longitud de contexto.
- Opciones de despliegue documentadas: vLLM (con wheel especifica para gpt-oss), Transformers, Transformers Serve para un servidor compatible con la API de OpenAI, Ollama (gpt-oss:20b), LM Studio y las implementaciones de referencia en PyTorch y Triton del repositorio gpt-oss.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Licencia | Despliegue indicado | Disponibilidad |
|---|---|---|---|---|---|
| ANGELOSEGRETO/gpt-oss-20b (este repositorio) | 20,9B | 3,6B | Apache 2.0 | MXFP4, aproximadamente 16 GB de memoria | Repositorio de tercero, 0 descargas y 0 likes |
| openai/gpt-oss-20b (original) | 21B | 3,6B | Apache 2.0 | MXFP4, aproximadamente 16 GB de memoria | Repositorio oficial de OpenAI |
| openai/gpt-oss-120b | 117B | 5,1B | Apache 2.0 | MXFP4, una GPU de 80 GB (H100 o MI300X) | Repositorio oficial de OpenAI |

No se dispone de datos de rendimiento ni de contexto para establecer comparaciones cuantitativas con modelos de otros fabricantes dentro de la misma categoria, por lo que la comparativa se limita a los modelos de la propia serie gpt-oss descritos en la informacion proporcionada.

## Limitaciones y advertencias

- Uso obligatorio del formato harmony: la model card advierte que el modelo no funcionara correctamente si no se emplea este formato de respuesta.
- La cadena de pensamiento no esta pensada para mostrarse al usuario final; exponerla puede revelar razonamiento interno y contenido no depurado.
- Riesgo de alucinacion: no se han publicado tasas de error ni evaluaciones de fidelidad en la informacion disponible, por lo que se debe validar la salida en aplicaciones criticas.
- Idiomas soportados no declarados: no hay lista oficial de idiomas, de modo que el rendimiento fuera del ingles no puede garantizarse sin pruebas propias.
- Longitud de contexto no disponible: no se puede planificar el uso con documentos largos sin verificar este dato en el repositorio oficial.
- Procedencia del repositorio: se trata de una resubida de un tercero (ANGELOSEGRETO) con cero descargas, cero likes y sin verificacion aparente; se recomienda descargar los pesos desde openai/gpt-oss-20b y verificar hashes antes de usarlos.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026) no coinciden con el ciclo de publicacion conocido de la serie gpt-oss, lo que refuerza la necesidad de comprobar la integridad de los ficheros.
- Licencia: Apache 2.0 permite uso comercial sin restricciones de copyleft, pero conviene revisar los terminos de la politica de uso de OpenAI aplicables a los modelos abiertos.
- Despliegue en produccion: no hay datos publicos de latencia, throughput ni estabilidad del backend vLLM para esta version concreta en el material disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ANGELOSEGRETO/gpt-oss-20b
- Repositorio oficial del modelo: https://huggingface.co/openai/gpt-oss-20b
- Coleccion oficial gpt-oss: https://huggingface.co/collections/openai/gpt-oss-68911959590a1634ba11c7a4
- Model card en arXiv: https://arxiv.org/abs/2508.10925
- Blog de anuncio de OpenAI: https://openai.com/index/introducing-gpt-oss/
- Pagina del proyecto: https://gpt-oss.com
- Guias y cookbook: https://cookbook.openai.com/topic/gpt-oss
- Formato harmony: https://github.com/openai/harmony
- Repositorio de referencia gpt-oss: https://github.com/openai/gpt-oss
- Lista de recursos de la comunidad: https://github.com/openai/gpt-oss/blob/main/awesome-gpt-oss.md
- Ollama: https://ollama.com/download
- LM Studio: https://lmstudio.ai/
