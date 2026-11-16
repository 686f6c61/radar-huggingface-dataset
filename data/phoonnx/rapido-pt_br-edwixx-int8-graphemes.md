# Phoonnx/rapido-pt_br-edwixx-int8-graphemes

## Resumen

rapido-pt_br-edwixx-int8-graphemes es un modelo de sintesis de voz (text-to-speech) para portugues de Brasil, empaquetado en formato ONNX para la libreria phoonnx. El modelo original procede de edwixx/rapido-tts, desarrollado por el autor edwixx, y ha sido adaptado y publicado por Phoonnx como parte de su coleccion de voces Rapido listas para inferencia. Resuelve la necesidad de generar audio en pt-BR con un modelo ligero, cuantizado y ejecutable en CPU, sin depender de frameworks de deep learning pesados.

La arquitectura es Rapido, un modelo de sintesis neuronal de tipo flow model (modelo de flujo) que opera a partir de grafemas en lugar de fonemas, lo que simplifica el pipeline de normalizacion textual. El repositorio ocupa aproximadamente 0,2 GB, lo que refleja un modelo compacto orientado a despliegue en entornos con recursos limitados. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Es relevante para desarrolladores que necesitan integrar TTS en portugues de Brasil dentro de asistentes de voz, sistemas de lectura o dispositivos embebidos, especialmente en el ecosistema OVOS, donde phoonnx actua como motor de inferencia. No obstante, la informacion publica sobre el modelo es escasa: no se detallan parametros, contexto ni datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rapido (flow model) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (flow model con cuantizacion dinamica int8; otros grafos en fp32) |
| Idiomas soportados | portugues de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Rapido, descrita en la model card como un flow model. La cuantizacion aplicada es int8 dinamica en el grafo del flow model, mientras que el resto de grafos se mantienen en fp32. El modelo trabaja directamente sobre grafemas en pt-BR, sin necesidad de un fonemizador intermedio, lo que reduce la complejidad del pipeline de inferencia. El repositorio tiene un tamano de 0,2 GB, coherente con un modelo compacto de TTS.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones tecnicas adicionales mas alla del uso de grafemas y la cuantizacion int8. El modelo original fue entrenado por edwixx y posteriormente empaquetado por Phoonnx para su uso con la libreria phoonnx.

## Capacidades

- Sintesis de voz a partir de texto en portugues de Brasil (pt-BR).
- Generacion de audio directamente desde grafemas, sin fonemizacion explicita.
- Inferencia en formato ONNX, ejecutable con la libreria phoonnx en Python y en OVOS.
- Modelo ligero (0,2 GB) adecuado para entornos con recursos limitados.
- Cuantizacion int8 en el flow model para reducir coste computacional.
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada ni modo thinking.

## Casos de uso

- Asistentes de voz en portugues de Brasil: el modelo puede generar respuestas habladas en pt-BR dentro de asistentes integrados en OVOS, usando phoonnx como motor de inferencia y scriptconv para la normalizacion textual previa.
- Lectura de texto en aplicaciones de accesibilidad: conversion de articulos, notificaciones o documentos a audio para usuarios con discapacidad visual, aprovechando el modelo compacto y su ejecucion en CPU.
- Sistemas de anuncios en dispositivos embebidos: generacion de mensajes hablados en kioscos, electrodomesticos o terminales de punto de venta, donde el tamano reducido y la cuantizacion int8 permiten desplegar en hardware modesto.
- Integracion en pipelines de agentes conversacionales: el modelo puede sintetizar las respuestas de un agente de texto en pt-BR, combinando phoonnx con un LLM y scriptconv para la normalizacion de numeros, fechas y abreviaturas.
- Prototipado rapido de interfaces de voz: desarrolladores que necesitan una voz en pt-BR para pruebas de concepto pueden usar el modelo ONNX sin configurar infraestructura de GPU.
- Generacion de audio para contenido educativo: narracion de lecciones o materiales didacticos en portugues de Brasil, con la ventaja de una licencia Apache 2.0 que permite uso comercial y modificacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser un modelo ONNX de 0,2 GB con cuantizacion int8, es probable que opere en CPU sin GPU dedicada, pero no se confirman cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; el formato ONNX y el tamano reducido sugieren que puede ejecutarse en CPU, pero no se especifica.
- Opciones de despliegue: libreria phoonnx (Python y OVOS); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo TTS.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La coleccion Rapido de Phoonnx incluye otras voces empaquetadas, pero no se detallan sus especificaciones ni resultados que permitan una comparacion cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| rapido-pt_br-edwixx-int8-graphemes | no disponible | no disponible | Apache 2.0 | ONNX | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La informacion publica es muy limitada: no se documentan parametros, datos de entrenamiento, benchmarks ni latencia, lo que dificulta evaluar su calidad frente a alternativas.
- El modelo solo soporta portugues de Brasil (pt-BR); no se ha validado para otras variantes del portugues ni para otros idiomas.
- Al operar sobre grafemas, puede presentar errores de pronunciacion en palabras con grafia ambigua o extranjerismos, aunque no se han publicado evaluaciones al respecto.
- Riesgo de alucinacion acustica o artefactos en la sintesis no documentado; se recomienda validacion auditiva antes de produccion.
- La cuantizacion int8 puede degradar la calidad del audio respecto al modelo original en fp32; no se han publicado comparativas.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia de los datos de entrenamiento del modelo upstream (edwixx/rapido-tts), no detallada en la informacion disponible.
- La model card indica que el indice de voces de phoonnx no lista una voz para este modelo, lo que puede afectar a su integracion automatica en OVOS.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Phoonnx/rapido-pt_br-edwixx-int8-graphemes
- Modelo upstream: https://huggingface.co/edwixx/rapido-tts
- Repositorio phoonnx: https://github.com/TigreGotico/phoonnx
- Repositorio scriptconv: https://github.com/TigreGotico/scriptconv
- Coleccion Rapido: https://huggingface.co/collections/Phoonnx/rapido-6af8ecbfc1860f5bc2c6c670
