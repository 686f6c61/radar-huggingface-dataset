# 0xSojalSec/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-GGUF

## Resumen

Este repositorio contiene una conversión a formato GGUF del modelo denominado Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill, publicado por el usuario 0xSojalSec. Se trata de una destilación de aproximadamente 752 millones de parámetros (0,75B) construida sobre la arquitectura de la serie Qwen3.5, empaquetada para su ejecución en llama.cpp mediante la herramienta de conversión de Unsloth. El repositorio ocupa 0,5 GB y solo incluye una cuantización Q4_K_M.

El interés de esta ficha es limitado pero concreto: es un ejemplo de modelo extremadamente compacto (sub-1B) orientado a despliegue en el borde, CPU o GPU de gama baja, donde el coste por token y la huella de memoria son los factores dominantes. La nomenclatura del nombre sugiere que el autor ha destilado el comportamiento de varios modelos frontera (GPT-6 Astra/Luna, Claude Opus 5.5, Claude Fable 5.1) sobre una base Qwen3.5-0.8B, una práctica habitual para obtener modelos pequeños con estilos de respuesta imitados.

Hay que señalar varias advertencias importantes desde el principio: el repositorio no declara licencia, no declara idiomas ni pipeline, no tiene descargas ni valoraciones, y su model card menciona rutas de otro repositorio distinto (NasledieLab-...-Karpy-GGUF, del usuario aemmeath), lo que indica que se trata de un reempaquetado o renombrado y no de una publicación original documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no la especifica; el nombre indica que deriva de la serie Qwen3.5) |
| Parametros totales | 752.393.024 (~0,75B), segun safetensors del repositorio |
| Parametros activos | No aplica / no disponible (no se indica que sea MoE; el conteo total es coherente con un modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico fichero publicado) |
| Idiomas soportados | No disponible en la model card; fuentes externas describen la serie base Qwen3.5 como multilingue |
| Licencia | No disponible |
| Formato de pesos | GGUF (convertido con Unsloth para llama.cpp) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna en la model card proporcionada. El identificador del modelo apunta a la serie Qwen3.5 de Alibaba Cloud, descrita en fuentes externas como una familia de modelos multilingues con capacidades mejoradas de razonamiento y seguimiento de instrucciones respecto a Qwen3; el modelo base de 0,8B se presenta en esas mismas fuentes como una variante ultracompacta para despliegue en el borde. El conteo real de parametros (752.393.024) coincide con ese tamano nominal de 0,8B.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Lo unico documentado es el proceso de conversion: el autor indica que el modelo se convirtio a GGUF usando Unsloth. El nombre del modelo sugiere un proceso de destilacion a partir de salidas de varios modelos frontera, pero no se aporta ningun detalle metodologico, ni recetas, ni hiperparametros, ni verificacion de que dicha destilacion se haya realizado realmente.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` del repositorio indica que esta orientado a dialogos de un solo turno o multiturno.
- Compatibilidad con inferencia en llama.cpp: el repositorio esta marcado con los tags `llama.cpp` y `llama-cpp`.
- Uso con plantillas de chat Jinja: la model card recomienda invocar `llama-cli` con la opcion `--jinja`.
- Posible soporte multimodal: la model card incluye instrucciones para `llama-mtmd-cli` (multimodal), aunque no se especifica que el modelo en si tenga torre de vision ni se listan ficheros de proyector. Esta capacidad debe considerarse no confirmada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse a traves de endpoints compatibles con el ecosistema de HuggingFace.
- Razonamiento, codigo, matematicas, tool calling, agentes y modo thinking: no disponible (no hay informacion que lo confirme).
- Capacidades multilingues: no confirmadas para este repositorio concreto; la serie base se describe como multilingue en fuentes de terceros.

## Casos de uso

- Inferencia en dispositivos de borde: con 0,75B de parametros y una cuantizacion Q4_K_M, el modelo puede ejecutarse en moviles, Raspberry Pi o mini-PC sin GPU dedicada, cubriendo tareas de clasificacion y generacion breve.
- Prototipado rapido de interfaces conversacionales: sirve para validar pipelines de chat (prompt, plantilla Jinja, streaming) antes de escalar a un modelo mayor, gracias a su arranque casi instantaneo.
- Filtrado y preprocesado de texto en local: tareas de reescritura, resumen de una linea o normalizacion de entradas que no requieren razonamiento complejo y donde la privacidad de los datos exige no salir del equipo.
- Agente de bajo coste para automatizaciones simples: enrutado de intenciones o generacion de respuestas plantilla dentro de un sistema mayor, donde el modelo grande solo se invoca si el pequeno no alcanza el umbral de confianza.
- Experimentacion educativa con destilacion: util para estudiar como se comporta un modelo minusculo entrenado (presuntamente) a imitar modelos frontera, comparando su estilo con el del profesor.
- Pruebas de carga y benchmarking de infraestructura: al ser tan ligero, permite medir throughput de llama.cpp, vLLM o TGI con muchas peticiones concurrentes sin cuello de botella de VRAM.
- Generacion de datos sinteticos de bajo coste: puede usarse para producir borradores masivos que luego se filtran con un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y el repositorio no cuenta con descargas ni evaluaciones de la comunidad. Las busquedas web realizadas apuntan a comparativas de la serie Qwen3.5 en general y a paginas de comparacion de lanzamientos de modelos frontera, pero ninguna de ellas ofrece cifras especificas de esta destilacion concreta, por lo que no se presentan numeros para evitar datos no verificables.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: aproximadamente 0,5-0,7 GB para los pesos, mas el espacio de la cache KV; en la practica cabe holgadamente en 1-2 GB de memoria.
- GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 4060, RTX 4090, e incluso iGPU con memoria compartida).
- CPU: totalmente viable; el modelo puede ejecutarse en CPU con llama.cpp a velocidades interactivas, aunque no se dispone de mediciones concretas de tokens por segundo.
- GPU de datacenter (A100, H100): compatibles, pero sobredimensionadas para este tamano; su uso solo tendria sentido para servir un volumen muy alto de peticiones concurrentes.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-mtmd-cli`), Ollama, y servidores compatibles con el formato GGUF dentro de ecosistemas tipo endpoints compatibles; vLLM y TGI requeririan convertir los pesos a safetensors/FP16, algo que este repositorio no ofrece.
- Latencia y throughput medidos: no disponible (no se han publicado cifras).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (Qwen3.5-0.8B-distill-GGUF) | 752.393.024 (~0,75B) | No disponible | GGUF (Q4_K_M) | No disponible | HuggingFace, 0 descargas, 0 likes |
| Qwen3.5-0.8B (modelo base de la serie) | 0,8B | No disponible | No disponible | No disponible | Ollama, Qualcomm AI Hub |
| Otros modelos de ~1B de la familia Qwen3.5 | No disponible | No disponible | No disponible | No disponible | Listados en guias de terceros |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y disponibilidad.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, un modelo sin licencia explicita debe tratarse como no apto para produccion sin aclaracion previa del autor.
- Riesgo legal por destilacion: el nombre hace referencia a modelos propietarios de terceros (GPT-6 Astra/Luna, Claude Opus 5.5, Claude Fable 5.1). Si la destilacion se realizo sobre sus salidas, pueden aplicar restricciones adicionales de los terminos de uso de esos proveedores.
- Model card inconsistente: el README describe el repositorio NasledieLab-...-Karpy-GGUF del usuario aemmeath, no el repositorio publicado por 0xSojalSec. Esto sugiere un renombrado o reempaquetado sin documentacion propia y complica la trazabilidad del modelo.
- Trazabilidad nula: 0 descargas, 0 likes, sin paper, sin repositorio de entrenamiento y sin fecha de actualizacion posterior a la creacion (27 de septiembre de 2026).
- Capacidad real no verificada: no hay evaluaciones independientes que confirmen que el modelo realmente imita el comportamiento de los modelos nombrados ni que supere al Qwen3.5-0.8B base.
- Riesgo de alucinacion: en modelos de menos de 1B de parametros, la tasa de invencion de hechos, citas y APIs es estructuralmente alta; no debe usarse como fuente de verdad sin verificacion.
- Contexto e idiomas desconocidos: al no declararse la ventana de contexto ni los idiomas soportados, no es posible garantizar un comportamiento correcto en conversaciones largas ni en castellano.
- Capacidades multimodales no confirmadas: las instrucciones de `llama-mtmd-cli` en la model card no van acompanadas de los ficheros de proyector necesarios, por lo que la ruta multimodal probablemente no funcione tal cual.
- Unica cuantizacion disponible: solo se publica Q4_K_M, sin opciones de mayor o menor precision para ajustar el equilibrio entre calidad y memoria.
- Formato propietario del ecosistema: al estar solo en GGUF, no se integra directamente en stacks que requieren safetensors (por ejemplo, fine-tuning con Transformers o despliegue en vLLM sin conversion previa).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/0xSojalSec/Qwen3.5-0.8B-GPT-6-Astra-Luna-Fable-5.1-Opus-5.5-distill-GGUF
- Qwen3.5 0.8B en Ollama: https://ollama.com/library/qwen3.5:0.8b
- Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Comparativa de lanzamientos GPT-6 Astra vs Qwen3.5 0.8B (Artificial Analysis): https://artificialanalysis.ai/models/releases/comparisons/gpt-6-astra-vs-qwen3-5-0-8b
- Cobertura de Claude Opus 5.5 en Latent Space: https://www.latent.space/p/ainews-claude-opus-55-the-new-default
- Guia de modelos Qwen 3.5 locales (InsiderLLM): https://insiderllm.com/guides/qwen-3-5-local-guide/
- Repositorio de Unsloth (herramienta de conversion declarada): https://github.com/unslothai/unsloth
