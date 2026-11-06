# lavendercomputing/SenseNova-Loop-9B-Preview-GSQ-RCO-GGUF

## Resumen

SenseNova-Loop-9B-Preview es un modelo multimodal (image-text-to-text) de 9.200 millones de parametros desarrollado por SenseNova, construido sobre una arquitectura de transformer con bucle ("looped transformer"): dispone de 32 capas de decoder distintas y un bloque compartido que se ejecuta dos veces, lo que resulta en 56 computaciones de capa por cada forward pass. Esta ficha documenta la version cuantizada en GGUF publicada por el usuario lavendercomputing bajo el identificador `lavendercomputing/SenseNova-Loop-9B-Preview-GSQ-RCO-GGUF`, que incluye ocho niveles de cuantizacion para CPU y un proyector multimodal BF16 compartido.

La relevancia de esta publicacion radica en que permite ejecutar un modelo multimodal de contexto largo y con decodificacion especulativa MTP (Multi-Token Prediction) en hardware sin GPU, mediante llama.cpp. El paquete conserva el plan de ejecucion con bucle de SenseNova, los tensores de enrutamiento mHC y la cabeza MTP en el bloque 56, ademas de separar la torre de vision en un fichero mmproj independiente.

El modelo base esta publicado bajo licencia Apache-2.0 y esta pensado para tareas conversacionales y de comprension de imagenes con ventanas de contexto extensas. Las cuantizaciones van desde 2,30 BPW (2,95 GiB) hasta 3,75 BPW (4,73 GiB), lo que facilita su despliegue en entornos con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con bucle (looped transformer), 32 capas de decoder distintas y un bloque compartido ejecutado dos veces (56 computaciones de capa por forward pass), con enrutamiento mHC y cabeza MTP |
| Parametros totales | 9.200.240.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el modelo base se describe como de contexto largo, sin cifra concreta) |
| Tipos de cuantizacion | GGUF: IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M (2,30 a 3,75 BPW objetivo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo principal) + mmproj BF16 GGUF para vision |

## Arquitectura y entrenamiento

El modelo base es un transformer con bucle: 32 capas de decoder distintas mas un bloque compartido que se ejecuta dos veces, totalizando 56 computaciones de capa por forward pass. Incorpora tensores de enrutamiento mHC (multi-head routing) y una cabeza de prediccion multi-token (MTP) situada en el bloque 56, que actua como borrador para decodificacion especulativa. La torre de vision y la proyeccion de imagen se empaquetan por separado en un mmproj BF16 basado en el proyector Qwen3VL.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la model card del autor de la cuantizacion remite a la model card del modelo base para esos detalles. La innovacion tecnica destacable de esta publicacion es el proceso de cuantizacion: conversion a GGUF BF16 completa (texto + MTP, incluido el bloque 56), cuantizacion por tensor en CPU con una importance matrix consciente de MTP (generada con recoleccion NextN/MTP activada), y separacion del proyector multimodal compartido. El autor advierte que el flujo "GSQ-RCO style" es un procedimiento local de asignacion por tensor y no una reproduccion bit-exacta de los algoritmos GSQ/RCO originales. El conversor se basa en la revision `fad174ecd8bf22746a626c58e67e193f095aaa46` de llama.cpp con soporte local para SenseNova-Loop.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Comprension de imagenes (image-text-to-text) mediante el proyector BF16 compartido; el autor verifico la lectura de texto en imagen ("MEN WALK ON MOON") en una prueba de humo.
- Contexto largo (el modelo base se etiqueta como long-context).
- Decodificacion especulativa mediante la cabeza MTP integrada (tipo de borrador `draft-mtp` en llama.cpp).
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.

## Casos de uso

- Descripcion y analisis de imagenes en local: usando `llama-mtmd-cli` con el GGUF principal y el mmproj BF16, se puede procesar una imagen y generar descripciones sin GPU, util para catalogacion de fotos o accesibilidad.
- OCR ligero y extraccion de texto en imagen: la prueba de humo del autor demuestra lectura de titulares; sirve para digitalizar carteles o capturas en entornos sin acelerador.
- Asistentes conversacionales en CPU: con cuantizaciones IQ2/IQ3 de 3 a 5 GiB, se puede desplegar un chatbot multimodal en servidores sin GPU o en portatiles.
- Procesamiento de documentos largos con contexto extendido: el modelo base esta disenado para contexto largo, lo que permite resumir o consultar documentos extensos junto con imagenes asociadas.
- Aceleracion de inferencia con MTP: en pipelines de llama.cpp que soporten la arquitectura, la cabeza MTP permite decodificacion especulativa para reducir latencia en generacion de texto.
- Prototipado e investigacion de arquitecturas con bucle: al conservar el plan de ejecucion looped y los tensores mHC, sirve para estudiar el comportamiento de transformers con bucles en formato GGUF.
- Evaluacion comparativa de cuantizaciones: los ocho tiers permiten medir el compromiso entre tamano (2,95 a 4,73 GiB) y calidad en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Unicos datos de rendimiento reportados por el autor (pruebas de humo en CPU):

| Prueba | Resultado |
|---|---|
| Comprobaciones estructurales GGUF (8 tiers) | Superadas |
| Generacion de texto (8 tiers) | Superada |
| Aceptacion de borradores MTP (IQ3_S) | 31 de 139 tokens (22,3%) |
| Lectura de imagen (IQ3_S + mmproj BF16) | Correcta ("MEN WALK ON MOON") |

## Requisitos de hardware

- VRAM estimada: no requiere GPU; todas las conversiones y pruebas se hicieron en CPU. En GPU, el peso del modelo principal ocupa entre 2,95 GiB (IQ2_XXS) y 4,73 GiB (IQ3_M), mas 0,86 GiB del mmproj BF16 para vision.
- GPU recomendadas: no especificadas por el autor. Por tamano, cualquier GPU consumer con 8 GB o mas (RTX 3060, 4060, 4070, 4090) puede alojar el modelo completo con el proyector.
- Cabe en consumer GPU: si, en todas las cuantizaciones; los tiers IQ3 caben incluso en GPUs de 6-8 GB junto con el mmproj.
- Opciones de despliegue: llama.cpp (obligatorio para vision y MTP, con builds que soporten SenseNova-Loop y el proyector Qwen3VL); `llama-mtmd-cli` para imagen, `llama-cli` con `--spec-type draft-mtp` para texto. vLLM, Ollama y TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles; solo se conoce la tasa de aceptacion de borradores MTP del 22,3% en IQ3_S.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| lavendercomputing/SenseNova-Loop-9B-Preview-GSQ-RCO-GGUF | 9.200 M | no disponible | GGUF (8 tiers + mmproj) | Apache-2.0 | Cuantizacion CPU con imatrix consciente de MTP |
| AtomicChat/SenseNova-Loop-9B-Preview-GGUF | 9.200 M (base) | no disponible | GGUF | Apache-2.0 (heredada) | Cuantizacion alternativa del mismo base |
| guideboardlabs/SenseNova-Loop-9B-Preview-GGUF | 9.200 M (base) | no disponible | GGUF | Apache-2.0 (heredada) | Cuantizacion alternativa del mismo base |
| notfakerv/SenseNova-Loop-9B-Preview-GGUF | 9.200 M (base) | no disponible | GGUF | Apache-2.0 (heredada) | Cuantizacion alternativa del mismo base |

No se dispone de datos de rendimiento comparativo entre estas cuantizaciones ni con modelos de otras familias.

## Limitaciones y advertencias

- Los valores BPW son objetivos del asignador, no garantias del BPW real alcanzado ni del tamano exacto de fichero.
- El soporte de vision y MTP requiere builds especificos de llama.cpp con SenseNova-Loop y el proyector Qwen3VL; sin ellos, el modelo no funciona correctamente.
- La cuantizacion "GSQ-RCO style" es un flujo local del autor y no reproduce bit-exactamente los algoritmos GSQ/RCO originales, por lo que la calidad puede diferir de otras cuantizaciones.
- Las cuantizaciones IQ2 (2,30-2,90 BPW) probablemente degradan la calidad de forma apreciable; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; aplicable el riesgo habitual de los modelos generativos, agravado en cuantizaciones de baja precision.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado fuera de los idiomas del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero se remite a la model card del modelo base para condiciones de uso previsto.
- Solo se realizaron pruebas de humo en CPU; no hay validacion en produccion ni en GPU reportada por el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/lavendercomputing/SenseNova-Loop-9B-Preview-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Listado de cuantizaciones del modelo base: https://huggingface.co/models?other=base_model%3Aquantized%3Asensenova%2FSenseNova-Loop-9B-Preview
- Listado de modelos con etiqueta looped-transformer: https://huggingface.co/models?other=looped-transformer
- Cuantizacion alternativa AtomicChat: https://huggingface.co/AtomicChat/SenseNova-Loop-9B-Preview-GGUF
- Cuantizacion alternativa guideboardlabs: https://huggingface.co/guideboardlabs/SenseNova-Loop-9B-Preview-GGUF
- Cuantizacion alternativa notfakerv: https://huggingface.co/notfakerv/SenseNova-Loop-9B-Preview-GGUF
