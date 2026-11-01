# EduardoVinicius/anycaptions-riva-translate

## Resumen

AnyCaptions — Riva Translate 4B Instruct v2 (GGUF, Q4_K_M) es una compilación cuantizada del modelo `nvidia/Riva-Translate-4B-Instruct-v2`, publicada por el usuario EduardoVinicius para su uso dentro de la aplicación de escritorio AnyCaptions, orientada a la traducción local de subtítulos en directo. El modelo resuelve el problema de la traducción de subtítulos en tiempo real sin enviar audio ni texto a servidores externos: todo el procesado ocurre en la máquina del usuario.

Se trata de un modelo de traducción conversacional de aproximadamente 4.180 millones de parámetros, distribuido en formato GGUF con cuantización Q4_K_M (un único fichero de 2,76 GB). El repositorio no incluye pesos en safetensors ni otros formatos: solo el GGUF cuantizado, con un checksum SHA-256 publicado para verificación de integridad.

La relevancia de esta ficha es acotada: no es un modelo nuevo ni una aportación técnica original, sino una redistribución cuantizada de un modelo de NVIDIA bajo la NVIDIA Open Model License. Su interés práctico reside en el caso de uso (traducción de subtítulos on-device) y en servir como ejemplo de empaquetado GGUF para aplicaciones de escritorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `nvidia/Riva-Translate-4B-Instruct-v2`; arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | 4.179.704.832 (~4,18 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | no disponible (la model card no lista idiomas) |
| Licencia | NVIDIA Open Model License (`license: other`) |
| Formato de pesos | GGUF (`riva-translate-4b-instruct-v2.q4_k_m.gguf`, 2,76 GB) |
| Tamano del repo | 2,8 GB |
| Checksum | SHA-256 `decbb4d3b12f756cc384833fceeac10bf7699cd2286dc3e18a746af9c8df71af` |
| Pipeline | translation |
| Descargas / likes | 97 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO. La model card del repositorio cuantizado no detalla ninguno de estos aspectos y se limita a declarar que es una derivacion cuantizada del modelo base de NVIDIA.

El unico dato tecnico concreto es el proceso de cuantizacion: conversion a GGUF con el esquema Q4_K_M, que reduce el modelo a 2,76 GB. No se especifica la herramienta de cuantizacion empleada, el numero de bits efectivos por peso ni si se aplicaron tecnicas adicionales como decodificacion especulativa o atencion lineal. Para conocer la arquitectura y el entrenamiento reales habria que consultar la model card del modelo base `nvidia/Riva-Translate-4B-Instruct-v2`, que no forma parte de la informacion proporcionada.

## Capacidades

- Traduccion de texto: el pipeline declarado es `translation`, y el modelo base esta orientado a traduccion automatica.
- Traduccion de subtitulos en directo: caso de uso explicito de la aplicacion AnyCaptions, que traduce subtitulos en tiempo real de forma local.
- Conversacional: el repositorio incluye la etiqueta `conversational`, lo que sugiere soporte de interaccion por turnos.
- Ejecucion completamente local: la aplicacion verifica el checksum y ejecuta la inferencia en el dispositivo, sin enviar audio ni texto a servidores externos.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles (no se listan idiomas).
- Capacidades especiales (vision, audio, thinking mode): no disponibles. Cabe senalar que el modelo traduce subtitulos, pero no se documenta que procese audio directamente.

## Casos de uso

- Traduccion de subtitulos en directo en escritorio: es el caso de uso para el que se publico esta compilacion. La aplicacion AnyCaptions descarga el GGUF, verifica el SHA-256 y lo ejecuta localmente para traducir los subtitulos mientras se generan, sin salida de datos a la red.
- Transcripcion y traduccion de reuniones con requisitos de privacidad: al ejecutarse on-device, encaja en entornos donde el audio no puede salir de la maquina (legal, sanitario, defensa). Requiere un pipeline externo de ASR que alimente texto al modelo.
- Subtitulado de contenido audiovisual de forma offline: util para traducir pistas de subtitulos en equipos sin conexion o con conectividad limitada, dado que el modelo pesa 2,76 GB y cabe en un portatil.
- Prototipado rapido de funciones de traduccion en aplicaciones de escritorio: el formato GGUF con Q4_K_M permite integrar el modelo con llama.cpp u otros runners compatibles sin infraestructura de servidor.
- Traduccion de documentacion o texto conversacional en local: para volumenes moderados donde no se justifica una API en la nube y se prioriza la confidencialidad.
- Distribucion empaquetada dentro de una aplicacion: el patron de descarga con verificacion de checksum sirve como referencia para publicar modelos cuantizados como activos descargables de una app.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2,76 GB; con overhead de contexto y buffers de llama.cpp, se puede estimar un uso en torno a 3-4 GB, aunque no se ha publicado una medicion oficial.
- GPU recomendadas: no disponible. El modelo es lo bastante pequeno para ejecutarse en CPU y en GPUs de consumo, pero no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: si, por tamano (2,76 GB en Q4_K_M) es compatible con GPUs consumer con 6-8 GB o mas de VRAM; no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp y runners compatibles con GGUF (Ollama, LM Studio, llama-cpp-python) son las opciones naturales dado el formato. vLLM y TGI no soportan GGUF de forma nativa como formato principal.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AnyCaptions Riva Translate 4B (esta ficha) | ~4,18 B | no disponible | GGUF Q4_K_M | NVIDIA Open Model License | Redistribucion cuantizada para app de escritorio |
| nvidia/Riva-Translate-4B-Instruct-v2 | ~4,18 B | no disponible | no disponible en esta ficha | NVIDIA Open Model License | Modelo base original de NVIDIA |
| Alternativas de traduccion open source (p. ej. NLLB, MADLAD) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas: no hay benchmarks publicados de este modelo ni datos de contexto o rendimiento del modelo base en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado, no original: se trata de una cuantizacion Q4_K_M de un modelo de NVIDIA; la calidad puede degradarse respecto a los pesos originales en precision completa, aunque no se han publicado mediciones de esa perdida.
- Informacion tecnica incompleta: no se documentan contexto, idiomas, arquitectura ni datos de entrenamiento, lo que dificulta evaluar su idoneidad para produccion.
- Idiomas no declarados: no se especifica que pares de idiomas soporta, un dato critico para cualquier uso de traduccion.
- Licencia: NVIDIA Open Model License, con terminos especificos que deben revisarse antes de uso comercial. La model card indica `license: other` y remite al acuerdo de NVIDIA; no es una licencia permisiva tipo Apache 2.0 o MIT.
- Riesgo de alucinacion: no documentado en la informacion proporcionada, pero inherente a los modelos generativos de traduccion; conviene validar salidas en contextos criticos.
- Sesgos: no documentados.
- Adopcion muy baja: 97 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion ni comunidad que valide el modelo.
- Dependencia de la aplicacion: el repositorio esta pensado para el flujo de descarga de AnyCaptions; su uso fuera de esa aplicacion no esta documentado por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/EduardoVinicius/anycaptions-riva-translate
- Modelo base: https://huggingface.co/nvidia/Riva-Translate-4B-Instruct-v2
- Aplicacion AnyCaptions: https://anycaptions.app
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
