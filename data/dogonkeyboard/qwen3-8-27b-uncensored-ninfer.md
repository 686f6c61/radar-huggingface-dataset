# DogOnKeyboard/Qwen3.8-27B-Uncensored-NInfer

## Resumen

Qwen3.8-27B-Uncensored-NInfer es una conversión al formato nativo NInfer del modelo Qwen3.8-27B-Uncensored, creado por Jonathan Coletti a partir del modelo base Qwen3.8-27B de Alibaba. El modelo original es una versión "abliterated" (sin rechazos) del Qwen3.8-27B, un modelo denso de 27 mil millones de parámetros con arquitectura híbrida de atención (Gated DeltaNet lineal combinada con atención completa), capacidades nativas de visión-lenguaje, razonamiento, tool-calling y un cabezal de predicción multi-token (MTP) para decodificación especulativa.

La única diferencia respecto al modelo fuente es el empaquetado: los 12 archivos safetensors (más el bloque MTP) se consolidan en un único artefacto autocontenido `.ninfer`, listo para usarse directamente con el runtime NInfer. Esto simplifica el despliegue y la distribución, manteniendo intactos los pesos, la arquitectura y el comportamiento de generación. El modelo se publica bajo licencia Apache 2.0 y soporta inglés y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atencion hibrida (Gated DeltaNet lineal + atencion completa), vision-lenguaje nativo, MTP |
| Parametros totales | 27 mil millones (aproximado, segun denominacion del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No especificado para el artefacto NInfer; existen versiones GGUF de 2 a 8 bits del mismo modelo en otros repositorios |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | .ninfer (artefacto unico autocontenido); el modelo fuente usa safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura de transformer denso con atencion hibrida: capas de Gated DeltaNet (atencion lineal) combinadas con capas de atencion completa, lo que permite manejar secuencias largas con menor coste computacional. Incluye un modulo de vision nativo (image-text-to-text) y un cabezal MTP (Multi-Token Prediction) que acelera la decodificacion mediante prediccion especulativa de multiples tokens.

La version "Uncensored" se obtiene mediante un proceso de abliteracion, que elimina los rechazos (refusals) del modelo original, permitiendo respuestas sin filtros de seguridad. Este proceso no modifica los pesos de forma sustancial, sino que elimina las direcciones en el espacio latente asociadas a comportamientos de rechazo. La conversion a NInfer no altera los pesos ni la arquitectura; solo cambia el contenedor de distribucion. No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso exacto de abliteracion.

## Capacidades

- Generacion de texto y razonamiento multi-paso.
- Comprension y generacion de contenido visual (entrada de imagenes y texto, salida de texto).
- Tool calling / function calling para integracion con APIs y agentes.
- Soporte de agentes y razonamiento encadenado.
- Capacidades multilingues en ingles y chino.
- Decodificacion especulativa mediante MTP para mayor velocidad de inferencia.
- Ausencia de rechazos (uncensored / abliterated), lo que permite respuestas sin restricciones de contenido.

## Casos de uso

- Despliegue en produccion con runtime NInfer: el artefacto unico `.ninfer` simplifica la distribucion y carga del modelo en entornos que usan NInfer, reduciendo la complejidad de gestionar multiples archivos de pesos.
- Aplicaciones de vision-lenguaje: analisis de imagenes, generacion de descripciones, respuesta a preguntas visuales, gracias a su capacidad nativa image-text-to-text.
- Agentes autonomos con tool-calling: integracion en pipelines que requieren llamadas a funciones externas, consultas a APIs o ejecucion de acciones, con razonamiento multi-paso.
- Generacion de codigo y asistencia a programacion: el modelo puede generar, revisar o explicar codigo, y al no tener rechazos, no se niega a responder peticiones de codigo potencialmente sensible.
- Investigacion en alineacion y seguridad: la version abliterated permite estudiar el comportamiento de modelos sin rechazos, comparando con la version original para analizar diferencias en seguridad y utilidad.
- Entornos con recursos limitados: aunque el artefacto NInfer no especifica cuantizacion, existen versiones GGUF del mismo modelo (de 2 a 8 bits) que permiten ejecutarlo en GPUs de consumo con 8-16 GB de VRAM mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.8-27B ha sido evaluado en tareas como MathVision, pero no se proporcionan cifras concretas en los materiales consultados. Se recomienda consultar la ficha del modelo base en HuggingFace para obtener datos de rendimiento.

## Requisitos de hardware

- El tamano del repositorio es de 18.2 GB, lo que sugiere que el artefacto NInfer contiene pesos en una precision reducida (posiblemente BF16 o cuantizacion de 4 bits), aunque no se especifica el tipo exacto.
- Para inferencia con el artefacto NInfer, se recomienda una GPU con al menos 24 GB de VRAM si los pesos estan en BF16 (27B * 2 bytes ≈ 54 GB, pero el tamano del repo indica que ya estan comprimidos). Dado el tamano de 18.2 GB, es probable que se trate de una cuantizacion de 4 bits, lo que permitiria ejecutarlo en GPUs con 16-20 GB de VRAM.
- Para las versiones GGUF del mismo modelo, se requieren entre 8 GB (cuantizacion de 2 bits) y 24 GB (cuantizacion de 8 bits) de VRAM, siendo viable en GPUs de consumo como RTX 3060, RTX 4060, RTX 3090 o RTX 4090.
- Opciones de despliegue: NInfer runtime (para el artefacto `.ninfer`), llama.cpp, Ollama, vLLM o TGI (para versiones GGUF o safetensors).
- No se dispone de datos de latencia o throughput especificos para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Apache 2.0 | safetensors | Modelo original con rechazos de seguridad |
| Qwen3.8-27B-Uncensored (Jonathan Coletti) | 27B | No disponible | Apache 2.0 | safetensors | Version abliterated, sin rechazos |
| Qwen3.8-27B-Uncensored-NInfer (este modelo) | 27B | No disponible | Apache 2.0 | .ninfer | Conversion a formato NInfer, mismo comportamiento que el anterior |
| Qwen3.8-27B-NVFP4 (unsloth) | 27B | No disponible | Apache 2.0 | NVFP4 | Cuantizacion de 4 bits para GPUs NVIDIA |

No se dispone de datos de rendimiento comparativo entre estas versiones. La principal diferencia es el formato de distribucion y la presencia o ausencia de rechazos.

## Limitaciones y advertencias

- Al ser un modelo "uncensored" (abliterated), puede generar contenido inapropiado, ofensivo, ilegal o peligroso sin restricciones. No debe usarse en aplicaciones donde se requiera moderacion de contenido.
- La abliteracion puede degradar el rendimiento en tareas de seguridad o alineacion, y el modelo puede ser mas propenso a producir respuestas sesgadas o daninas.
- Solo soporta ingles y chino; no se garantiza un rendimiento adecuado en otros idiomas.
- El formato `.ninfer` es especifico del runtime NInfer y no es compatible con otras herramientas estandar (transformers, vLLM, etc.) sin conversion previa.
- No se dispone de informacion sobre la longitud de contexto exacta, lo que puede limitar su uso en tareas que requieran ventanas largas.
- El modelo base puede tener sesgos inherentes a sus datos de entrenamiento, que la abliteracion no elimina.
- Para uso comercial, la licencia Apache 2.0 permite su uso, pero se recomienda revisar los terminos de la licencia del modelo base original.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/DogOnKeyboard/Qwen3.8-27B-Uncensored-NInfer
- Modelo base (Jonathan Coletti): https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF y guia de ejecucion local: https://www.orcarouter.ai/blog/how-to-run-qwen-3-8-27b-uncensored-locally
- Version Ollama con cuantizaciones: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
- Guia de ejecucion local con VRAM y quants: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Cuantizacion NVFP4 de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-NVFP4
