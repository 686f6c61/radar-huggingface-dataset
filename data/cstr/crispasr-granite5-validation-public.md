# cstr/crispasr-granite5-validation-public

## Resumen

`cstr/crispasr-granite5-validation-public` es un repositorio de checkpoints de validacion y conversion, no un modelo entrenado de forma independiente. Se deriva de `ibm-granite/granite-speech-5.0-2b` (commit `c075cf19e041a2e4d16c5ee24763e5b037d8f479`), un modelo de habla de IBM con aproximadamente 2.313 millones de parametros, y lo publica el usuario `cstr` en el contexto del proyecto CrispASR para portar dicho modelo a su runtime. El repositorio contiene pesos convertidos a GGUF y cuantizaciones derivadas, con recetas de conversion propias.

La relevancia de este repositorio es acotada y debe interpretarse con precision: el propio autor declara explicitamente `crispasr_native_acceptance: false` y advierte de que "una conversion y subida exitosa no es aceptacion". Los checkpoints pre-YaRN omiten intencionadamente el escalado RoPE necesario, la paridad de etapa nativa, la aceptacion de salida decodificada y las pruebas reales en CUDA estan pendientes, y ningun registro de produccion apunta a este repositorio. Es, por tanto, material diagnostico para desarrolladores que trabajen en la integracion de Granite Speech 5.0 en CrispASR, no un artefacto listo para despliegue.

El repositorio tiene 362 descargas, 0 likes, un tamano de 76,7 GB y fue creado el 23 de octubre de 2026, con ultima actualizacion el 24 de octubre de 2026. La licencia declarada es Apache-2.0 para los pesos derivados de IBM, mientras que el codigo y las recetas de CrispASR conservan su propia licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo base de habla de IBM; pesos derivados en GGUF) |
| Parametros totales | 2.313.228.204 |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Cuantizaciones GGUF derivadas de la conversion CrispASR (niveles concretos no disponibles) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos derivados de IBM); recetas y codigo CrispASR bajo MIT |
| Formato de pesos | GGUF (repo de 76,7 GB; pesos originales en safetensors segun metadatos) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `ibm-granite/granite-speech-5.0-2b` en la documentacion proporcionada. Por el nombre y el pipeline declarado por IBM se trata de un modelo de habla (speech) de aproximadamente 2.300 millones de parametros. El repositorio aqui descrito no aporta detalles sobre la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo etapas de RLHF o DPO.

La innovacion tecnica documentada en este repositorio no esta en el modelo en si, sino en el proceso de portabilidad: conversion a formato GGUF mediante recetas de CrispASR, con retencion de la model card original del publicador, checksums de origen, recetas y recibos por ejecucion. El autor senala que los checkpoints pre-YaRN omiten deliberadamente el escalado RoPE requerido, lo que constituye una limitacion conocida del artefacto y no una caracteristica del modelo base.

## Capacidades

- No se documentan capacidades funcionales especificas en la informacion proporcionada; al derivar de un modelo de habla de IBM, cabe esperar procesamiento de audio, pero no se detalla en este repositorio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, vision, audio): no disponible en la informacion proporcionada.
- Estado de validacion: paridad de etapa nativa, aceptacion de salida decodificada y ejecucion real en CUDA pendientes segun el autor.

## Casos de uso

- Validacion de conversion de formato: usar los checkpoints GGUF para comprobar que la conversion desde safetensors preserva la estructura de pesos esperada por el runtime CrispASR, comparando checksums y recibos por ejecucion incluidos en el repositorio.
- Diagnostico de escalado RoPE: emplear las baselines pre-YaRN como referencia para aislar el efecto de la omision del escalado RoPE antes de introducir la version corregida.
- Pruebas de paridad de etapas: comparar salidas intermedias entre el modelo original de IBM y la conversion GGUF para detectar divergencias en cada etapa del pipeline de inferencia.
- Integracion en el runtime CrispASR: servir como artefacto de prueba para desarrolladores que implementen el soporte de Granite Speech 5.0 en dicho runtime, sin pretension de uso en produccion.
- Verificacion de cuantizaciones: evaluar el impacto de distintas recetas de cuantizacion GGUF sobre la calidad de salida, siempre que se disponga de las recetas MIT adjuntas.
- Auditoria de licencias y procedencia: revisar los paquetes de procedencia (commits fuente, paquetes binarios, versiones y hashes) para validar el cumplimiento de las obligaciones Apache-2.0 y MIT en una cadena de derivacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la paridad nativa, la aceptacion de salida decodificada y las pruebas reales en CUDA estan pendientes, por lo que no existen metricas de rendimiento validadas para este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2.313 millones de parametros, una estimacion orientativa en FP16 rondaria los 4,6 GB solo de pesos, y en cuantizaciones de 4 bits alrededor de 1,2-1,5 GB, pero son calculos teoricos no validados por el autor.
- GPU recomendadas: no disponible; el autor senala que la ejecucion real en CUDA esta pendiente.
- Cabe en GPU de consumo: previsiblemente si en funcion de la cuantizacion, pero no confirmado por pruebas del autor.
- Opciones de despliegue: formato GGUF, compatible con runtimes que lean dicho formato (llama.cpp y derivados), si bien el proposito declarado es el runtime CrispASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| cstr/crispasr-granite5-validation-public | 2.313.228.204 | No disponible | Apache-2.0 (pesos) / MIT (recetas) | Checkpoints de validacion, no aceptados para produccion |
| ibm-granite/granite-speech-5.0-2b | Aprox. 2.300 millones (segun nombre) | No disponible | Apache-2.0 (declarada por IBM) | Modelo base original de IBM |
| Alternativas de habla de ~2B | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estos artefactos en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara explicitamente `crispasr_native_acceptance: false`: el repositorio no constituye soporte aceptado del modelo ni un lanzamiento de produccion.
- Los checkpoints pre-YaRN omiten el escalado RoPE requerido, lo que puede degradar o invalidar las salidas si se usan sin correccion.
- La paridad de etapa nativa, la aceptacion de salida decodificada y la ejecucion real en CUDA estan pendientes de verificacion.
- Ningun registro de produccion apunta a este repositorio; no debe integrarse en sistemas en produccion sobre la base de esta publicacion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no disponibles.
- La licencia Apache-2.0 cubre los pesos derivados de IBM, pero no relicencia las herramientas de validacion ni sus dependencias; el codigo y las recetas de CrispASR conservan MIT.
- Las capsulas de validacion compiladas incluyen bibliotecas de terceros bajo sus propias licencias; deben conservarse LICENSE, THIRD_PARTY_NOTICES.txt y los avisos por paquete.
- Los drivers NVIDIA, el runtime CUDA y cuBLAS son proporcionados por el host y no se redistribuyen en las capsulas.
- No se implica respaldo de IBM sobre esta conversion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/cstr/crispasr-granite5-validation-public
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-2b
- Commit fuente del modelo base: `c075cf19e041a2e4d16c5ee24763e5b037d8f479` (referenciado en la model card)
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
