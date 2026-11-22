# oo2223/PlantID-Qwen3.5-4B-GGUF

## Resumen
PlantID-Qwen3.5-4B-GGUF es un ajuste fino mediante LoRA de Qwen/Qwen3.5-4B orientado a la identificacion de plantas a partir de fotografias, ademas de cuidados y seguridad de plantas, en tailandes e ingles. Lo desarrolla el usuario oo2223 para la aplicacion Plant ID y se distribuye en formato GGUF para ejecucion local con llama.cpp, incluyendo un proyector de vision separado (mmproj) sin modificar respecto al modelo base.

El modelo resuelve un caso de uso muy concreto: respuestas estructuradas con formato de ficha de planta, seguimientos, opciones de quiz y modificaciones de tema dentro de una app movil, con respuestas 2-3 veces mas cortas que el modelo base y en tailandes natural. Su relevancia es la de un ejemplo de adaptacion de un modelo multimodal pequeno a un dominio vertical con despliegue en dispositivo.

La informacion disponible es limitada: el autor lo marca explicitamente como beta, no publica resultados de benchmarks y advierte de problemas conocidos de alucinacion en nombres de plantas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano declarado del repo (0,7 GB) no coincide con el tamano del fichero GGUF Q4_K_M indicado en la model card (2,8 GB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje Qwen3.5-4B + torre de vision con proyector mmproj), ajuste fino LoRA |
| Parametros totales | 333.514.240 (dato de safetensors del repositorio; no coincide con la denominacion "4B" del nombre ni con el modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (valor usado en el comando de llama-server de la model card) |
| Tipos de cuantizacion | GGUF Q4_K_M para el modelo de lenguaje; proyector de vision en F16 |
| Idiomas soportados | tailandes (th) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con fichero mmproj separado para vision |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-4B, un modelo multimodal image-text-to-text, y aplica un LoRA de rango 16 unicamente sobre el modelo de lenguaje; la torre de vision queda sin cambios y se distribuye como proyector F16 independiente. El entrenamiento consistio en 1 epoca, 750 pasos de 16 muestras, learning rate 1e-4, longitud de secuencia 4096 y fp16 sobre una V100. La perdida de evaluacion fue de 1,41 en el paso 25 y de 0,927 al final.

El conjunto de datos comprende 11.994 conversaciones con la siguiente mezcla: fotos de plantas con respuesta de especie (32%), herramientas y funciones de la app (18%), instrucciones en tailandes (14%), preguntas y respuestas sobre plantas fundamentadas en Wikipedia (14%), respuestas de la lista de seguridad (8%), tailandes coloquial (7%), guia de la app (5%) y registros reales de la app (2%). Las fotografias proceden de 7.633 observaciones de grado de investigacion de iNaturalist (307 especies; 5.760 con CC BY y 1.873 con CC0). Las instrucciones en tailandes provienen de airesearch/WangchanThaiInstruct y pythainlp/han-instruct-dataset-v2.0 (ambos CC BY-SA 4.0), las preguntas y respuestas de articulos de Wikipedia en tailandes e ingles (CC BY-SA 4.0) generadas por un modelo profesor, y el tailandes coloquial se redacto al estilo de pythainlp/wisesight_sentiment (CC0). No se indica uso de RLHF ni DPO.

## Capacidades
- Identificacion de especies de plantas a partir de imagenes, con formato de ficha de planta propio de la app.
- Respuesta en tailandes natural e ingles, con respuestas mas breves que el modelo base.
- Generacion de seguimientos (follow-ups) y opciones de quiz dentro del flujo de la app.
- Consultas sobre cuidados de plantas y sobre seguridad/toxicidad limitadas a la lista de seguridad verificada de la app.
- Soporte de herramientas y funciones de la app (el 18% del entrenamiento cubre esta capacidad).
- Entrada multimodal imagen-texto mediante el proyector mmproj.
- Ejecucion en dispositivo con llama.cpp (telefonos y PC).
- No se documentan capacidades de agente multi-paso, audio ni modo de razonamiento explicito.

## Casos de uso
- Identificacion de plantas en una app movil: el usuario fotografia una planta y el modelo devuelve una ficha con posible especie; encaja por su formato de salida entrenado y su ejecucion on-device con Q4_K_M.
- Asistente de cuidados: conversaciones multi-turno sobre riego, luz y sustrato, apoyadas en la ventana de 8192 tokens configurada y en el entrenamiento con preguntas y respuestas de Wikipedia.
- Avisos de seguridad acotados: consultas sobre toxicidad respondidas contra la lista de seguridad verificada, con la advertencia de que fuera de esa lista la respuesta es "Unverified".
- Educacion y gamificacion: generacion de opciones de quiz y preguntas de seguimiento sobre especies, gracias a la mezcla de entrenamiento con quizzes y guia de la app.
- Localizacion tailandesa: atencion a usuarios tailandeses con respuestas en tailandes natural, aprovechando el entrenamiento con WangchanThaiInstruct y datos coloquiales.
- Despliegue offline en campo: uso en zonas sin conectividad mediante llama-server o llama.cpp en telefonos y PC, con el fichero Q4_K_M de 2,8 GB y el mmproj de 0,67 GB.
- Prototipado de asistentes verticales multimodales: serviria como referencia de ajuste LoRA sobre un modelo Qwen multimodal con datos propios y evaluacion de perdida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida de evaluacion del ajuste (1,41 en el paso 25 y 0,927 al final) y comparaciones cualitativas con el modelo base (respuestas 2-3 veces mas cortas, formato de la app respetado, tailandes natural).

## Requisitos de hardware
- VRAM estimada: el fichero Q4_K_M ocupa 2,8 GB y el proyector F16 0,67 GB, por lo que la inferencia requiere aproximadamente 3,5 GB solo para pesos, mas el espacio de contexto y el runtime de llama.cpp.
- GPU recomendadas: no disponible en la informacion proporcionada; el autor entreno en una V100 y probo la inferencia con llama.cpp b12541.
- Cabe en GPU de consumo: si, segun el autor esta pensado para telefonos y PC; con ~3,5 GB de pesos mas contexto deberia caber en GPUs de consumo con 6-8 GB o mas, aunque no se aportan medidas.
- Opciones de despliegue: llama.cpp (llama-server con `--mmproj` y `--jinja`), Ollama y otros runners compatibles con GGUF; vLLM y TGI no se mencionan para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| PlantID-Qwen3.5-4B-GGUF | 333.514.240 (safetensors declarado) | 8192 | th, en | Apache-2.0 | GGUF + mmproj | Ajuste LoRA vertical para plantas; beta; sin benchmarks |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | no disponible | Apache-2.0 | safetensors (y variantes) | Modelo base multimodal; sin ajuste al dominio de plantas |
| Alternativas de identificacion de plantas | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de comparables verificables en la informacion proporcionada |

## Limitaciones y advertencias
- Puede inventar nombres de plantas, nombres cientificos y nombres tailandeses; toda identificacion debe tratarse como una suposicion.
- A veces afirma "from the article" cuando no existe tal articulo.
- A veces anade una ficha de planta a preguntas que no mencionan ninguna planta.
- La toxicidad se marca como "Unverified" para cualquier planta fuera de la lista de seguridad verificada, incluso especies bien conocidas.
- No debe usarse para decidir si una planta es comestible, segura al tacto o util como medicina; en caso de posible intoxicacion en Tailandia el autor remite al Ramathibodi Poison Center (1367).
- Estado beta con 0 descargas y 0 likes; sin benchmarks publicados.
- Discrepancia entre el tamano declarado del repo (0,7 GB) y el fichero GGUF (2,8 GB), y entre el nombre "4B" y los 333.514.240 parametros del safetensors; conviene verificar antes de desplegar.
- Cobertura limitada a 307 especies en el conjunto de fotos de entrenamiento.
- Idiomas limitados a tailandes e ingles.
- Licencia Apache-2.0 permite uso comercial, pero los datos derivados de Wikipedia y WangchanThaiInstruct son CC BY-SA 4.0 y CC0, lo que puede imponer obligaciones de atribucion o comparticion sobre esos contenidos.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/oo2223/PlantID-Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de instrucciones en tailandes: https://huggingface.co/datasets/airesearch/WangchanThaiInstruct
- Dataset de instrucciones en tailandes: https://huggingface.co/datasets/pythainlp/han-instruct-dataset-v2.0
- Dataset de referencia de estilo: https://huggingface.co/datasets/pythainlp/wisesight_sentiment
- iNaturalist: https://www.inaturalist.org
- llama.cpp: no se proporciona URL especifica en la informacion disponible
