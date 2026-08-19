# GlobalCybersecurityAlliance/Qwen3.8-27B-Abliterated-GGUF

## Resumen

Este modelo es una versión "abliterated" (sin censura) del Qwen3.8-27B, un LLM multimodal denso de 27 mil millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. La publicación corre a cargo de GlobalCybersecurityAlliance y se distribuye exclusivamente en formato GGUF cuantizado, pensado para su uso con motores como llama.cpp, Ollama o LM Studio.

La abliteration consiste en eliminar la "dirección de rechazo" de los pesos del modelo, de modo que deja de negarse a responder a peticiones que el modelo original consideraría prohibidas o peligrosas. Según el blog de MindStudio, el proceso emplea una metodología basada en KL-drift y pruebas de rechazo con un juez automático. Esto convierte al modelo en una opción atractiva para quienes necesitan generar contenido sin filtros, aunque con importantes riesgos éticos y de seguridad que se detallan más adelante.

El modelo base Qwen3.8-27B es un transformer denso con capacidades nativas de visión y texto, optimizado para tareas de codificación, flujos de trabajo agénticos y automatización de oficina. Al estar abliterated, conserva esas capacidades pero sin las restricciones de seguridad habituales. No se han publicado datos sobre la longitud de contexto ni sobre los idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision + texto) |
| Parametros totales | 27 mil millones (27B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (varias, p. ej. Q4_K_M, Q5_K_M, Q8_0), AWQ (W4A16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tambien safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención completa, diseñado para procesar tanto texto como imágenes de forma nativa (multimodal). Alibaba lo ha entrenado con un pipeline que incluye instrucciones y probablemente RLHF/DPO, aunque los detalles exactos del entrenamiento no se han publicado en la información disponible. El modelo está orientado a tareas de codificación, razonamiento y automatización de agentes.

La versión abliterated se obtiene mediante una técnica que identifica y elimina la "dirección de rechazo" en el espacio de activaciones del modelo. Según el artículo de MindStudio, el proceso utiliza una metodología de KL-drift para minimizar la divergencia con el modelo original y un juez automático para verificar que el modelo ya no rechaza peticiones. El resultado es un modelo que mantiene las capacidades generales del original pero sin los mecanismos de seguridad que bloquean contenido dañino o controvertido.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades del modelo base para tareas de lenguaje natural, incluyendo razonamiento complejo y generacion de codigo.
- Procesamiento de imagenes: al ser multimodal, puede recibir y comprender imagenes junto con texto (no se especifica si el formato GGUF conserva esta capacidad, pero el modelo base si la tiene).
- Tool calling y agentes: el modelo base está optimizado para flujos de trabajo agénticos, por lo que es probable que soporte function calling y multi-step reasoning (no confirmado en esta version).
- Ausencia de rechazos: la abliteration elimina la direccion de rechazo, por lo que el modelo responde a peticiones que el original bloquearia (con los riesgos asociados).
- Multilingue: no se ha especificado la cobertura de idiomas, aunque los modelos Qwen suelen tener buen soporte para ingles y chino.

## Casos de uso

- Generacion de contenido creativo sin restricciones: escritores y creadores pueden usar el modelo para producir ficcion, guiones o dialogos con tematicas adultas o controvertidas que otros modelos rechazarian. Su capacidad multimodal permite ademas trabajar con imagenes como referencia.
- Investigacion en seguridad de IA: equipos de red team pueden emplear este modelo para estresar sistemas de moderacion, probar defensas contra jailbreaks o estudiar el comportamiento de modelos sin alineacion.
- Simulacion de conversaciones dificiles: en entornos controlados, se puede utilizar para generar interacciones de usuario hostiles o provocadoras y evaluar la robustez de sistemas de atencion al cliente.
- Automatizacion de oficina: el modelo base es adecuado para redactar correos, resumir documentos o generar informes, y la version abliterated puede usarse en contextos donde se requiera un tono mas directo o sin filtros.
- Analisis de datos y codigo: con soporte para tool calling, puede integrarse en pipelines de analisis de datos, generacion de scripts o automatizacion de tareas de programacion.
- Creacion de contenido para nichos especificos: por ejemplo, generacion de dialogos para videojuegos con tematica adulta, o redaccion de materiales educativos sobre temas sensibles (siempre con supervisión humana).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas para esta version abliterated. El modelo base Qwen3.8-27B ha mostrado buen rendimiento en tareas de codificacion y agentes, segun la documentacion de Cloudflare, pero no se ofrecen cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: para una cuantizacion Q4_K_M (aproximadamente 16 GB de pesos) se necesitan al menos 16-20 GB de VRAM; para Q8_0 (unos 27 GB) se requieren 28-32 GB. La cuantizacion AWQ W4A16 reduce el peso a unos 14 GB, pero requiere soporte especifico.
- GPU recomendadas: RTX 3090/4090 (24 GB) para cuantizaciones bajas, A100 40 GB o H100 para cuantizaciones altas y mayor velocidad. Con 2x RTX 3090 se puede ejecutar la version AWQ, como se documenta en el proyecto de Todd Wolven.
- En consumer GPU: si, con cuantizaciones Q4 o Q5 en GPUs de 24 GB. Para GPUs de 16 GB (RTX 4080, 3080) se puede intentar con Q4 pero con limitaciones de velocidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte para AWQ), TGI (si se convierte a safetensors).
- Latencia y throughput: no se dispone de datos medidos. Como referencia, un modelo de 27B en Q4 en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, pero depende de la implementacion y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Abliterated | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | No disponible | Si | No | Apache 2.0 |
| Qwen3.8-27B-Abliterated (este) | 27B | No disponible | Si (base) | Si | Apache 2.0 |
| Llama-3.1-8B-Instruct-abliterated | 8B | 128K | No | Si | Llama 3.1 Community License |

No se dispone de benchmarks comparativos entre estas opciones. La principal diferencia entre el modelo original y el abliterated es la eliminacion de la direccion de rechazo, que no afecta al rendimiento en tareas estandar pero elimina las salvaguardas. Frente a modelos abliterated mas pequeños como Llama-3.1-8B, este ofrece mayor capacidad (27B) y multimodalidad, aunque con mayores requisitos de hardware.

## Limitaciones y advertencias

- Riesgo de contenido dañino: al eliminar la direccion de rechazo, el modelo puede generar contenido violento, ilegal, sexualmente explicito o perjudicial. Su uso en produccion debe restringirse a entornos controlados y con supervisión humana.
- Alucinaciones: como cualquier LLM, puede inventar informacion, especialmente en temas de actualidad o datos especificos. La ausencia de rechazos no mejora la veracidad.
- Sesgos: el modelo base puede heredar sesgos de los datos de entrenamiento; la abliteration no los corrige y podria amplificarlos al no filtrar respuestas.
- Limitaciones de contexto e idioma: no se ha confirmado la longitud de contexto ni la cobertura de idiomas. Es probable que el rendimiento fuera de ingles y chino sea inferior.
- Restricciones de licencia: aunque la licencia es Apache 2.0, el proceso de abliteration puede entrar en conflicto con los terminos de uso del modelo base de Alibaba (no confirmado). Se recomienda revisar la politica de uso de Alibaba antes de un despliegue comercial.
- Compatibilidad: la version GGUF puede no conservar todas las capacidades multimodales del modelo original; es necesario verificar si el procesamiento de imagenes funciona correctamente en el motor elegido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/GlobalCybersecurityAlliance/Qwen3.8-27B-Abliterated-GGUF
- Repositorio GitHub del modelo base (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Articulo sobre abliteration de Qwen3.8-27B (MindStudio): https://www.mindstudio.ai/blog/qwen3-8-27b-aeon-uncensored-abliteration
- Version abliterated en ModelScope: https://www.modelscope.cn/models/douyamv/Qwen3.8-27B-abliterated-GGUF
- Documentacion de Cloudflare sobre Qwen3.8-27B: https://developers.cloudflare.com/workers-ai/models/qwen3.8-27b/
- Proyecto de cuantizacion AWQ con MTP (Todd Wolven): https://toddwolven.com/projects/qwen38-awq-quantization
