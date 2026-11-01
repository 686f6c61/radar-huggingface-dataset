# amd/EXAONE-3.5-2.4B-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen

EXAONE-3.5-2.4B-Instruct es un modelo de lenguaje de 2.400 millones de parametros desarrollado originalmente por LG AI Research, disenado para generacion de texto y conversacion con capacidades de razonamiento. Esta ficha concreta corresponde a una distribucion empaquetada por AMD para su plataforma Ryzen AI, publicada bajo el identificador `amd/EXAONE-3.5-2.4B-Instruct_rai_1.9.0_m_1.0.1_npu`, que adapta los pesos originales al formato ONNX y al runtime Ryzen AI (RAI) para ejecucion en la NPU integrada de los procesadores AMD Ryzen AI.

El modelo resuelve el problema de desplegar un LLM de tamano compacto en hardware de consumo x86 con aceleracion NPU dedicada, sin depender de GPU discreta. El repositorio ocupa 2,1 GB y esta restringido (gated), por lo que requiere aceptar condiciones en HuggingFace antes de la descarga. La fecha de creacion indicada en la ficha de HuggingFace es 2026-10-30.

La relevancia de este artefacto es fundamentalmente de despliegue: no introduce cambios en el modelo base, sino que lo empaqueta para el stack Ryzen AI 1.9.0 con el modelo m_1.0.1_npu. Los datos de arquitectura y entrenamiento del modelo original no se detallan en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base EXAONE-3.5-2.4B-Instruct; empaquetado ONNX para Ryzen AI) |
| Parametros totales | 2,4 mil millones (segun denominacion del modelo) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el paquete RAI para NPU implica cuantizacion especifica de la plataforma, sin detalle publicado) |
| Idiomas soportados | en (ingles, segun la ficha de HuggingFace) |
| Licencia | other (licencia no estandar; acceso restringido con aceptacion de condiciones) |
| Formato de pesos | ONNX (runtime Ryzen AI / RAI 1.9.0) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna del modelo base EXAONE-3.5-2.4B-Instruct (tipo de transformer, atencion, composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO). El modelo original procede de LG AI Research, pero esta ficha documenta unicamente el artefacto empaquetado por AMD.

La innovacion tecnica de este repositorio es el empaquetado para Ryzen AI: conversion a ONNX y adaptacion al runtime RAI 1.9.0 con el perfil m_1.0.1_npu, orientado a ejecutar la inferencia en la NPU de los procesadores AMD Ryzen AI. No se especifican en la informacion disponible la precision numerica del grafo ONNX, el esquema de cuantizacion aplicado ni las particiones de grafo asignadas a NPU frente a CPU.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Modelo etiquetado como `Instruct`, orientado a seguir instrucciones.
- Ejecucion en NPU de AMD Ryzen AI mediante el runtime RAI 1.9.0.
- Idiomas: ingles (unico idioma declarado en la ficha).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multimodales (vision, audio): no disponibles en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatiles y mini-PC con Ryzen AI: el modelo se ejecuta en la NPU integrada, lo que permite mantener conversaciones sin GPU discreta y con menor consumo energetico que la inferencia en CPU.
- Procesamiento de texto en el borde (edge computing): al ser un modelo de 2,4B empaquetado en 2,1 GB, es adecuado para resumen, clasificacion y reescritura de texto en dispositivos sin conectividad a la nube.
- Prototipado de aplicaciones de IA generativa en el ecosistema AMD: el paquete ONNX/RAI permite validar flujos de inferencia sobre NPU antes de escalar a otros despliegues.
- Generacion de respuestas en asistentes de escritorio integrados en aplicaciones Windows con hardware Ryzen AI, aprovechando la aceleracion por NPU.
- Filtrado y moderacion de contenido en local: tareas de clasificacion y generacion de etiquetas donde la privacidad exige no enviar datos a servicios externos.
- Educacion y demos de inferencia en NPU: escenario de laboratorio para comparar latencia y consumo entre CPU, iGPU y NPU en la misma maquina.
- Chatbot de soporte de bajo coste en ingles: al estar limitado al idioma ingles, encaja en flujos de atencion en ese idioma donde el volumen no justifica un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: procesadores AMD Ryzen AI con NPU integrada, ejecutando el runtime Ryzen AI (RAI) version 1.9.0 con el perfil m_1.0.1_npu.
- VRAM: no aplica en el escenario principal, ya que la inferencia se dirige a la NPU; el paquete ocupa 2,1 GB en disco.
- GPU recomendadas: no disponible; el artefacto esta orientado a NPU Ryzen AI, no a GPU discretas.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible en la informacion proporcionada.
- Opciones de despliegue: runtime Ryzen AI (RAI) con el modelo ONNX empaquetado; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amd/EXAONE-3.5-2.4B-Instruct_rai_1.9.0_m_1.0.1_npu | 2,4B | no disponible | ONNX (Ryzen AI) | other (gated) | HuggingFace, acceso restringido |
| EXAONE-3.5-2.4B-Instruct (original, LG AI Research) | 2,4B | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| Alternativas de ~2-3B para NPU/edge | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones del modelo original en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace antes de la descarga.
- Licencia no estandar (`other`): es imprescindible revisar los terminos concretos antes de cualquier uso comercial; la informacion disponible no detalla las restricciones.
- Solo ingles: la ficha declara unicamente el idioma `en`, por lo que no se debe asumir calidad en castellano u otros idiomas.
- Dependencia de plataforma: el paquete esta atado al runtime Ryzen AI 1.9.0 y al perfil m_1.0.1_npu; no es portable a otros stacks de inferencia sin reconversion.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano; no se han publicado evaluaciones de fiabilidad en la informacion disponible.
- Sesgos: no se documentan en la informacion proporcionada.
- Longitud de contexto desconocida: limita la planificacion de aplicaciones con documentos largos o conversaciones extensas.
- Sin datos de benchmarks ni de latencia: no es posible estimar rendimiento en produccion a partir de la informacion disponible.
- Popularidad nula en el momento de la ficha (0 descargas, 0 likes), lo que reduce la base de validacion comunitaria.

## Enlaces

- HuggingFace: https://huggingface.co/amd/EXAONE-3.5-2.4B-Instruct_rai_1.9.0_m_1.0.1_npu
- Modelo base (referencia por nombre): EXAONE-3.5-2.4B-Instruct, LG AI Research (enlace no disponible en la informacion proporcionada)
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada
