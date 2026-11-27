# Pratham804/Pratham-LFM2.5-350M-V29-SFT-Polisher

## Resumen

Pratham-LFM2.5-350M-V29-SFT-Polisher es un ajuste fino (fine-tune) del modelo LiquidAI/LFM2.5-350M, desarrollado por el usuario independiente Pratham804, especializado en la limpieza de dictado: elimina muletillas, falsos comienzos y repeticiones, aplica las autocorrecciones del hablante, restaura puntuacion y mayusculas, normaliza numeros, importes, horas y fechas, y formatea enumeraciones como listas con viñetas. No es un asistente general: es un formateador de texto que preserva las palabras del hablante sin parafrasear, acortar ni sustituir vocabulario.

El modelo parte de la arquitectura LFM2.5 de Liquid AI (350M parametros) y se adapta mediante SFT con LoRA de rango 320 (130.023.424 parametros entrenables, un 26,8% del total) sobre un corpus sintetico de 18.000 ejemplos generados a partir de un lexico de unas 1.500 palabras en 12 dominios. Segun la model card, tambien se aplico un refinamiento con RL (optimizacion de politica relativa a grupos) contra una recompensa verificable basada en el texto objetivo, sin etiquetas humanas ni modelo juez.

Es relevante porque demuestra un caso de uso muy concreto y medible: la posproduccion de dictado en entornos empresariales y operativos. Con 354.483.968 parametros y un unico fichero GGUF Q4_K_M de 229,3 MB, se puede desplegar en hardware muy modesto. El autor reporta 40/40 casos superados con F1 medio de 0,999 en datos no vistos, aunque estas cifras provienen de una evaluacion propia sobre un conjunto generado por el mismo generador, no de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer LFM2.5 (base LiquidAI/LFM2.5-350M), ajuste fino con LoRA |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 1024`) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado); el modelo base admite otras cuantizaciones GGUF |
| Idiomas soportados | ingles (`en`) |
| Licencia | lfm-open-license-v1.0 (uso comercial permitido por debajo de 10 M USD de ingresos anuales) |
| Formato de pesos | GGUF (`v29sft-Q4_K_M.gguf`, 229,3 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del LFM2.5-350M de Liquid AI y se adapta mediante SFT con LoRA de rango 320 aplicado sobre las proyecciones de atencion, el bloque feed-forward (`w1/w2/w3`), las proyecciones `in_proj`/`out_proj` del bloque convolucional y la `lm_head`. Esto supone 130.023.424 parametros entrenables, un 26,8% del total. El corpus de entrenamiento consta de 18.000 ejemplos compuestos a partir de un lexico de aproximadamente 1.500 palabras en 12 dominios; cada fila muestrea entre 1 y 4 fenomenos de dictado independientes en orden aleatorio, y el contenido se genera dinamicamente en lugar de extraerse de pools fijos, de modo que lo que se aprende es la transformacion. Antes del entrenamiento se verifico un solapamiento de docegramas de 0,000 entre entrenamiento y validacion.

Ademas del SFT, la model card describe una fase de RL con optimizacion de politica relativa a grupos (GRPO) contra una recompensa verificable calculada a partir del texto objetivo: F1 por tokens, paridad de formato, fidelidad y penalizaciones por marcadores y verbosidad. No se emplearon etiquetas humanas ni modelos juez en el bucle. Cabe senalar que la model card menciona esta fase de RL como parte del entrenamiento, pero el repositorio publicado corresponde a la variante SFT (existe un hermano "SFT+RL" con resultados ligeramente inferiores en la tabla reportada). No se detalla la innovacion arquitectonica interna del LFM2.5 (atencion, convoluciones u otras) mas alla de la referencia al bloque convolucional.

## Capacidades

- Limpieza de dictado: eliminacion de muletillas, falsos comienzos y repeticiones.
- Aplicacion de autocorrecciones del hablante ("el viernes, no, perdon, el jueves").
- Restauracion de puntuacion y mayusculas.
- Normalizacion de numeros, importes monetarios, horas y fechas.
- Formateo de enumeraciones como listas con viñetas y de texto largo en parrafos.
- Preservacion del lexico original: no parafrasea, no acorta ni sustituye vocabulario.
- Conversacional en el sentido de que procesa instrucciones de sistema y mensajes de usuario mediante una API compatible con OpenAI (`/v1/chat/completions`).
- No soporta tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito (no documentado).
- Multilingue: no; solo ingles segun la model card.

## Casos de uso

- Posproduccion de dictado empresarial: transcripciones de reuniones, notas de voz o correos dictados se convierten en texto limpio y puntuado antes de enviarse, gracias a que el modelo aplica correcciones del hablante y normaliza cifras.
- Gestion de pedidos y logistica: un operario dicta "envialo el viernes, no, el jueves, tres cajas de tornillos M4"; el modelo devuelve una frase limpia con la fecha corregida y el numero normalizado, adecuado para alimentar un sistema de tickets.
- Atencion al cliente con entrada por voz: limpieza de transcripciones de llamadas antes de archivarlas o pasarlas a un CRM, eliminando repeticiones y muletillas que degradan la legibilidad.
- Documentacion de incidencias tecnicas: conversion de notas de campo dictadas (stock, horarios, tickets) en texto estructurado con listas cuando hay enumeraciones.
- Preprocesado para pipelines de NLP: el texto limpio sirve como entrada a clasificadores, resumidores o motores de busqueda, reduciendo ruido de transcripcion.
- Despliegue en el borde o en local: con 229,3 MB en Q4_K_M cabe en CPU y en GPUs de gama baja, por lo que puede ejecutarse en un portatil o en un servidor pequeno con `llama-server` para limpiar dictado en tiempo real sin enviar datos a la nube.
- Normalizacion de actas y apuntes: conversion de parrafos dictados largos en parrafos con puntuacion y mayusculas correctas para su publicacion interna.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre datos reservados (40 casos generados con semilla distinta, sin objetivos presentes en entrenamiento), con F1 por tokens frente al texto limpio de referencia, paridad de formato y penalizacion por invencion:

| Modelo | Casos superados | F1 medio |
|---|---:|---:|
| V29 SFT (este repositorio) | 40/40 | 0,999 |
| V29 SFT+RL (hermano) | 39/40 | 0,987 |
| V25 Polisher (version anterior) | 10/40 | 0,829 |

La model card incluye una tabla "per bucket" que aparece vacia en la informacion proporcionada. No hay resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M el fichero ocupa 229,3 MB; con overhead de contexto y runtime, el consumo tipico ronda unos pocos cientos de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM libre (GTX 1650, RTX 3060, RTX 4090, A100, H100); tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en Raspberry Pi o portatiles sin GPU dedicada mediante llama.cpp.
- Opciones de despliegue: `llama-server` (ejemplo oficial con `-c 1024`), llama.cpp, y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| V29 SFT Polisher (este) | 354 M | no disponible | Limpieza de dictado (SFT+LoRA) | lfm-open-license-v1.0 | GGUF, repo propio |
| V29 SFT+RL (hermano) | 354 M | no disponible | Limpieza de dictado con RL | lfm-open-license-v1.0 | Repo hermano del autor |
| V25 Polisher (version anterior) | 354 M | no disponible | Limpieza de dictado | lfm-open-license-v1.0 | Repo anterior del autor |
| LiquidAI/LFM2.5-350M (base) | 350 M aprox. | no disponible | Modelo generalista | lfm-open-license-v1.0 | Hugging Face |

No se dispone de datos de benchmarks estandar ni de otros modelos comparables de la misma categoria (limpieza de dictado) en la informacion proporcionada.

## Limitaciones y advertencias

- Etiquetas de entrenamiento mal etiquetadas, de alcance limitado pero real: parte de los registros de parrafo contienen un marcador discursivo cuyo nombre siguiente aparece en minusculas (por ejemplo, "Anyway, xin downgrades the backlogs"). El modelo reproduce este error, por lo que puede poner en minuscula un nombre que sigue directamente a "Also,", "However," o "Anyway,". El generador ya se corrigio, pero esta version es anterior a la correccion.
- Dominio restringido: dictado empresarial y operativo (pedidos, horarios, tickets, stock). Es un formateador, no un asistente general, y no responde preguntas.
- Normalizacion de numeros: las formas habladas inusuales (por ejemplo, "seventy five hundred") se manejan con menos fiabilidad que "seven thousand five hundred".
- Techo de capacidad: con 350M el limite es el seguimiento de reglas y el formateo, no la comprension.
- Solo ingles; no hay soporte documentado de otros idiomas.
- Riesgo de alucinacion: el modelo esta disenado para no inventar contenido, pero al ser un modelo pequeno puede introducir errores de formato o normalizacion en entradas fuera de distribucion; conviene validar en produccion.
- Licencia: LFM Open License v1.0 permite uso comercial solo por debajo de 10 M USD de ingresos anuales; por encima se requiere licencia adicional de Liquid AI. El modelo esta modificado (vocabulario y pesos difieren del base) y no esta afiliado ni respaldado por Liquid AI.
- No se documentan sesgos especificos; al entrenarse con datos sinteticos, los sesgos del lexico generador pueden reflejarse en el comportamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en 2026-11-27; se trata de una publicacion reciente y sin validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/Pratham804/Pratham-LFM2.5-350M-V29-SFT-Polisher
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Licencia: https://huggingface.co/LiquidAI/LFM2.5-350M/blob/main/LICENSE
