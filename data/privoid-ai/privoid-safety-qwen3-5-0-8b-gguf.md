# Privoid-ai/Privoid-Safety-Qwen3.5-0.8B-GGUF

## Resumen

Privoid Safety 0.8B es un clasificador de seguridad de contenido derivado de Qwen3.5 y publicado por Privoid-ai. Su funcion es etiquetar un mensaje de usuario o una respuesta de un modelo como `safe` o `unsafe`, actuando como guardrail para sistemas conversacionales. El modelo base cuenta con 772.845.888 parametros (aproximadamente 0,8 mil millones), lo que lo situa en la gama ultraligera y permite inferencia en dispositivo.

Esta publicacion concreta es la version en formato GGUF para llama.cpp, distribuida en tres cuantizaciones (F16, Q8_0 y Q4_K_M) con un repositorio de 2,9 GB. El autor indica que cada fichero fue cargado en llama.cpp y verificado etiquetando correctamente una peticion danina y una inofensiva antes de la subida. La licencia es CC-BY-4.0 y el unico idioma declarado es el ingles.

Su relevancia radica en la combinacion de tamano minimo, formato GGUF y orientacion a moderacion offline: permite desplegar un filtro de contenido sin dependencia de API externas ni de GPU de datacenter, algo relevante para aplicaciones con requisitos de privacidad o entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de Qwen3.5; detalles no publicados en la informacion disponible) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El modelo es un derivado ajustado de Qwen3.5 con 772.845.888 parametros, reconvertido a formato GGUF para su uso con llama.cpp. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La etiqueta `unsloth` en los tags sugiere que el ajuste fino se realizo con herramientas de Unsloth, aunque no se confirma en el texto.

La innovacion principal de esta publicacion es el empaquetado: conversion a GGUF en tres niveles de cuantizacion y verificacion funcional de cada fichero en llama.cpp. El modelo se presenta como clasificador de texto (`text-classification`) y se invoca con `llama-server --jinja`, lo que implica el uso de plantilla de chat para formatear la peticion de clasificacion. No se documentan innovaciones de atencion, decodificacion especulativa ni arquitecturas hibridas.

## Capacidades

- Clasificacion binaria de seguridad: etiqueta mensajes de usuario o respuestas de IA como `safe` o `unsafe`.
- Moderacion de contenido como guardrail en pipelines conversacionales.
- Ejecucion offline y en dispositivo gracias al formato GGUF y al tamano reducido.
- Integracion con llama.cpp mediante `llama-server` y plantilla Jinja.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- Capacidad conversacional segun los tags del repositorio.
- No se documentan capacidades de generacion abierta, codigo, matematicas, vision, audio ni tool calling.
- Soporte multilingue: limitado a ingles segun la model card.

## Casos de uso

- Filtrado de entrada en chatbots: el modelo se situa delante del LLM principal para etiquetar los mensajes del usuario y bloquear peticiones daninas antes de que lleguen al modelo generativo, con coste computacional minimo por su tamano.
- Moderacion de salidas de IA: se ejecuta sobre las respuestas generadas para detectar contenido inseguro antes de mostrarlo al usuario final, actuando como segunda capa de defensa.
- Guardrail en aplicaciones de escritorio o moviles: al caber en cuantizacion Q4_K_M (0,54 GB), puede desplegarse en dispositivos de consumo sin conexion, preservando la privacidad de las conversaciones.
- Cumplimiento normativo en entornos regulados: permite registrar y clasificar interacciones localmente sin enviar datos a servicios externos, util en sectores con requisitos de residencia de datos.
- Moderacion de comunidades y foros: clasificacion por lotes de mensajes enviados por usuarios para priorizar revision humana sobre los marcados como `unsafe`.
- Evaluacion de datasets: etiquetado automatico de corpus conversacionales para construir conjuntos de entrenamiento o validacion filtrados por seguridad.
- Prototipado rapido de sistemas de seguridad: su despliegue con un unico comando de llama.cpp facilita la experimentacion en fases tempranas de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una comparacion con Qwen3Guard y Granite Guardian en la pagina principal del modelo base, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB con Q4_K_M, 0,9 GB con Q8_0 y 1,7 GB con F16, incluyendo overhead de llama.cpp.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM; tambien ejecutable en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier modelo moderno (GTX 1050, RTX 3050, RTX 4090, etc.) e incluso en hardware integrado.
- Opciones de despliegue: llama.cpp (`llama-server`), y por extension del formato GGUF, herramientas compatibles como Ollama o interfaces basadas en llama.cpp. No se mencionan vLLM ni TGI para esta version.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia de decenas de milisegundos en CPU y menor en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Privoid Safety 0.8B GGUF | 772.845.888 | no disponible | GGUF | CC-BY-4.0 | HuggingFace |
| Qwen3Guard | no disponible | no disponible | no disponible | no disponible | mencionado como comparacion en la model card |
| Granite Guardian | no disponible | no disponible | no disponible | no disponible | mencionado como comparacion en la model card |

La model card referencia comparaciones con Qwen3Guard y Granite Guardian, pero no se aportan datos de parametros, contexto ni rendimiento de esos modelos en la informacion disponible.

## Limitaciones y advertencias

- Solo soporta ingles; el rendimiento en otros idiomas no esta documentado y probablemente sea deficiente.
- Clasificacion binaria (`safe`/`unsafe`): no proporciona categorias de dano ni puntuaciones de confianza documentadas.
- Riesgo de falsos negativos y falsos positivos inherente a cualquier clasificador de seguridad; no se publican metricas de precision o recall.
- No se documentan sesgos conocidos ni la composicion del dataset de ajuste, lo que dificulta evaluar su comportamiento en dominios especificos.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero conviene verificar las condiciones del modelo base Qwen3.5.
- No debe usarse como unico mecanismo de seguridad en produccion: se recomienda combinarlo con otras capas de validacion.
- El contexto maximo no esta documentado, lo que limita la planificacion de despliegues con entradas largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion comunitaria.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Privoid-ai/Privoid-Safety-Qwen3.5-0.8B-GGUF
- Modelo base: https://huggingface.co/Privoid-ai/Privoid-Safety-Qwen3.5-0.8B
