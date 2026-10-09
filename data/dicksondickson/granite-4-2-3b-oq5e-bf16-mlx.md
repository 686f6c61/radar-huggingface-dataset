# dicksondickson/granite-4.2-3b-oQ5e-bf16-MLX

## Resumen

dicksondickson/granite-4.2-3b-oQ5e-bf16-MLX es una cuantizacion del modelo base ibm-granite/granite-4.2-3b, publicada por el usuario dicksondickson en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a ejecucion local en hardware de Apple: el repositorio usa la libreria mlx y el formato de pesos safetensors, con un esquema de cuantizacion mixta de 5 bits (etiquetado como oQ5e) en el que los tensores considerados criticos se mantienen en bf16.

El checkpoint se ha generado con la herramienta oMLX 0.7.0 con imatrix habilitada, un modo de cuantizacion que usa estadisticas de activacion para decidir que pesos pueden comprimirse con menos perdida de calidad. Segun el autor, los tensores que permanecen en bf16 estan pensados para chips Apple M3 y posteriores, lo que restringe el publico objetivo a equipos Mac con silicio de generacion reciente.

El modelo tiene 3.659.737.600 parametros (aproximadamente 3,66 mil millones) y el repositorio ocupa 2,6 GB, un tamano coherente con una representacion de 5 bits mixta con algunos tensores en bf16. La licencia declarada es MIT. Se trata de un artefacto de nicho, con 0 descargas y 1 "like" en el momento de la consulta, cuya relevancia practica depende de la disponibilidad y madurez del runtime oMLX, ya que la model card indica explicitamente que debe ejecutarse con esa herramienta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (model card no especifica la arquitectura del modelo base) |
| Parametros totales | 3.659.737.600 (3,66 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion mixta de 5 bits (oQ5e) con tensores importantes en bf16; formato MLX |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato MLX, libreria `mlx`) |

Datos adicionales verificables: tamano del repositorio 2,6 GB; herramienta de cuantizacion oMLX 0.7.0 con imatrix; fecha de creacion 2026-10-08; modelo base ibm-granite/granite-4.2-3b; 0 descargas y 1 like.

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base ibm-granite/granite-4.2-3b en el material proporcionado: la model card de esta cuantizacion no detalla si se trata de un transformer denso, de una arquitectura hibrida o de un modelo con mezcla de expertos, ni indica la longitud de contexto soportada, el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de ajuste por RLHF o DPO.

Lo unico documentado en esta ficha es el proceso de posentrenamiento aplicado por el cuantizador: conversion de los pesos del modelo base mediante oMLX 0.7.0 con imatrix habilitada, dejando determinados tensores en bf16 y comprimiendo el resto a 5 bits. Esta estrategia busca preservar la precision en las capas mas sensibles sin disparar el tamano en disco, que queda en 2,6 GB. No se documenta ninguna innovacion arquitectonica propia de esta publicacion, ni tampoco metricas de degradacion respecto al modelo original.

## Capacidades

- Al ser una cuantizacion del modelo IBM Granite 4.2 3B, sus capacidades funcionales son, en principio, las del modelo base; sin embargo, no se han publicado en la informacion disponible pruebas de capacidades especificas para este checkpoint.
- Generacion de texto: no verificada en la documentacion proporcionada para esta cuantizacion concreta.
- Razonamiento, codigo y matematicas: no disponible (no hay evaluaciones publicadas en la ficha).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el campo de idiomas aparece como no disponible).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- La unica capacidad explicitamente garantizada por el autor es la de ejecutarse como modelo MLX bajo la herramienta oMLX en chips Apple M3 o posteriores.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el repositorio esta empaquetado en formato MLX y sus tensores criticos en bf16 estan pensados para chips M3 y posteriores, por lo que el escenario natural es ejecutar un modelo de 3,66 B en un portatil o sobremesa de Apple sin depender de GPU dedicada ni de servicios en la nube.
- Prototipado offline en entornos sin conectividad: al ocupar solo 2,6 GB en disco y no requerir tarjeta grafica, permite llevar un asistente de texto en un equipo portatil para pruebas en campo, entornos aislados o demos sin red.
- Evaluacion comparativa de esquemas de cuantizacion: al usar imatrix y cuantizacion mixta con tensores en bf16, resulta util como punto de referencia experimental frente a cuantizaciones uniformes del mismo modelo base, midiendo perplejidad y calidad de generacion.
- Desarrollo de aplicaciones sobre el runtime oMLX: sirve como checkpoint de prueba para quien integre la libreria jundot/omlx en un producto, ya que es un artefacto generado especificamente con ese flujo de trabajo.
- Tareas de generacion de texto asistida en local con requisitos de privacidad: al ejecutarse integramente en el dispositivo, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles donde no se admite enviar texto a una API externa.
- Distribucion de demos con licencia permisiva: la licencia MIT declarada en este repositorio facilita incorporar el checkpoint a prototipos y pruebas internas sin las restricciones de licencias mas limitantes, siempre que se respeten las obligaciones del modelo base.

Advertencia: no se ha verificado ninguna de estas capacidades con benchmarks publicados para este checkpoint concreto, por lo que los casos de uso anteriores son escenarios de aplicacion plausibles segun el formato de distribucion, no resultados medidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card de este repositorio no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni de perplejidad, ni tampoco comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon con soporte MLX. La model card indica que los tensores dejados en bf16 estan pensados para chips Apple M3 y posteriores, por lo que en generaciones anteriores (M1, M2) el funcionamiento no esta garantizado.
- Memoria unificada: el peso del modelo ocupa 2,6 GB en disco; en ejecucion hay que sumar cache KV y activaciones. Se puede estimar un minimo practico de 8 GB de memoria unificada y un valor comodo de 16 GB, aunque no se documentan cifras oficiales.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, ya que el formato MLX esta disenado para el ecosistema de Apple y no para CUDA.
- Cabe en hardware de consumo: si, en equipos Mac con chip M3 o posterior y memoria unificada suficiente. No cabe ni esta soportado en GPU de consumo tipo RTX 4090 mediante este repositorio.
- Opciones de despliegue: la model card indica ejecutar el modelo con oMLX (https://github.com/jundot/omlx). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato de cuantizacion mixta especifico.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dicksondickson/granite-4.2-3b-oQ5e-bf16-MLX | 3,66 B | MLX, safetensors, 5 bits mixto con bf16 en tensores criticos | no disponible | MIT | HuggingFace, 0 descargas, 1 like |
| ibm-granite/granite-4.2-3b (modelo base) | 3,66 B (segun el campo base_model del repo) | no disponible | no disponible | no disponible | HuggingFace |
| Otras cuantizaciones de Granite 4.2 3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento, contexto ni licencia del modelo base en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato y licencia declarada en este repositorio. No se han aportado datos de modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Dependencia de un runtime minoritario: la model card exige el uso de oMLX; no hay evidencia de compatibilidad con otros motores de inferencia MLX como mlx-lm, lo que reduce las opciones de despliegue.
- Restriccion de hardware: los tensores en bf16 estan declarados para Apple M3 y posteriores; en M1 y M2 el comportamiento no esta garantizado.
- Cuantizacion con posible perdida de calidad: se trata de una conversion a 5 bits con algunos tensores en bf16; no se publican mediciones de perplejidad ni de degradacion frente al modelo base.
- Ausencia total de evaluaciones: 0 descargas y 1 like, sin benchmarks ni informes de calidad, lo que implica un riesgo alto de comportamiento no verificado en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Cualquier uso en produccion deberia acompanarse de validacion propia, dado el tamano de 3,66 B del modelo subyacente.
- Idiomas y longitud de contexto: no disponibles, por lo que no se puede garantizar el comportamiento en castellano ni en conversaciones largas.
- Licencia: el repositorio declara MIT, pero conviene verificar la licencia del modelo base ibm-granite/granite-4.2-3b y las obligaciones de atribucion que imponga antes de un uso comercial.
- Trazabilidad: el autor es un usuario individual y no hay garantia de mantenimiento, actualizaciones ni soporte del repositorio.
- Fechas de publicacion inusuales (creacion y actualizacion el 2026-10-08 con 18 segundos de diferencia), lo que sugiere una publicacion automatica sin curacion posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dicksondickson/granite-4.2-3b-oQ5e-bf16-MLX
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Repositorio de oMLX: https://github.com/jundot/omlx

No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs o demos) relacionados con este modelo.
