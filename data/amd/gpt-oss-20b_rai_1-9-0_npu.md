# amd/gpt-oss-20b_rai_1.9.0_npu

## Resumen

El modelo `amd/gpt-oss-20b_rai_1.9.0_npu` es una distribucion del modelo abierto gpt-oss-20b de OpenAI, adaptada por AMD para su ejecucion sobre unidades de procesamiento neuronal (NPU) mediante el stack Ryzen AI 1.9.0. Se publica en formato ONNX y esta pensada para desplegarse en hardware AMD con aceleracion NPU, principalmente en equipos con procesadores Ryzen AI. El repositorio pertenece a la organizacion oficial de AMD en Hugging Face y esta sujeto a acceso restringido (gated): es necesario aceptar las condiciones en la pagina del modelo antes de descargarlo.

La relevancia de esta ficha radica en que no se trata de un modelo entrenado desde cero, sino de una conversion y empaquetado de un modelo ya existente (gpt-oss-20b) para un backend concreto (ONNX Runtime con el proveedor de ejecucion de Ryzen AI). Por tanto, las capacidades del modelo subyacente son las de gpt-oss-20b, mientras que las particularidades de esta publicacion son las del proceso de conversion, cuantizacion y despliegue en NPU.

La informacion disponible en la pagina de Hugging Face es limitada: se conocen los tags (onnx, amd, ryzenai, npu, text-generation, conversational), el tamano del repositorio (13,4 GB), la licencia (Apache 2.0) y el idioma declarado (ingles). No se publican en la informacion proporcionada detalles sobre parametros, contexto, cuantizacion ni resultados de benchmarks de esta version concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base gpt-oss-20b de OpenAI; esta publicacion es una conversion ONNX para NPU) |
| Parametros totales | no disponible en la informacion proporcionada (el nombre indica 20b) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato ONNX; el tamano del repo, 13,4 GB, sugiere pesos de baja precision, pero no se especifica) |
| Idiomas soportados | en (ingles, segun el tag del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

No se dispone en la informacion proporcionada de detalles sobre la arquitectura interna, el proceso de entrenamiento, el volumen de datos, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO u otras) empleadas en el modelo base gpt-oss-20b. Esta publicacion concreta es una conversion del modelo a formato ONNX para su ejecucion sobre NPU mediante Ryzen AI 1.9.0, por lo que las innovaciones tecnicas relevantes de esta version son las del pipeline de conversion y despliegue en hardware AMD, no las del entrenamiento.

El tamano del repositorio (13,4 GB) es coherente con una distribucion cuantizada de un modelo de aproximadamente 20.000 millones de parametros, pero no se especifica en la informacion disponible el esquema exacto de cuantizacion ni las capas o componentes que se han convertido.

## Capacidades

- Generacion de texto y conversacion: el tag `conversational` y el pipeline `text-generation` indican soporte para dialogos multi-turno.
- Generacion de texto condicionada por instrucciones (modelo de tipo instruct/chat, segun el modelo base).
- Ejecucion acelerada en NPU de AMD mediante Ryzen AI 1.9.0.
- Despliegue en formato ONNX, lo que facilita la integracion con ONNX Runtime y herramientas compatibles.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes o vision: no disponibles en la informacion proporcionada para esta version concreta.
- Capacidades multilingues: el repositorio declara unicamente ingles (`en`).

## Casos de uso

- Inferencia local en equipos con Ryzen AI: el modelo esta empaquetado para ejecutarse sobre NPU en portatiles y mini-PC con procesadores AMD Ryzen AI, lo que permite generacion de texto sin depender de GPU dedicada.
- Asistentes conversacionales en el dispositivo: gracias al tag `conversational`, puede integrarse en aplicaciones de chat locales que se ejecuten sobre ONNX Runtime con el backend de Ryzen AI.
- Prototipado de aplicaciones de IA generativa en Windows con aceleracion NPU: util para desarrolladores que quieran validar flujos de texto generativo en hardware AMD antes de escalar a produccion.
- Evaluacion comparativa de backends: sirve para medir el rendimiento de Ryzen AI frente a otras rutas de ejecucion (GPU, CPU) con el mismo modelo base.
- Integracion en pipelines ONNX: al publicarse en ONNX, puede incorporarse a herramientas de inferencia compatibles con este formato dentro de entornos AMD.
- Despliegue en entornos con requisitos de privacidad: la ejecucion local en NPU evita enviar datos a servicios en la nube, adecuado para aplicaciones sensibles en el puesto de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: NPU de AMD con soporte para Ryzen AI 1.9.0 (procesadores Ryzen AI de AMD).
- VRAM estimada: no disponible. Al estar orientado a NPU, el consumo relevante es la memoria compartida del sistema y la memoria dedicada de la NPU, no la VRAM de una GPU.
- GPU recomendadas: no aplica para esta publicacion; el backend esta orientado a NPU.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: ONNX Runtime con el proveedor de ejecucion de Ryzen AI; otras herramientas (vLLM, llama.cpp, Ollama, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| amd/gpt-oss-20b_rai_1.9.0_npu | no disponible (nombre indica 20b) | no disponible | ONNX | Apache 2.0 | Conversion para NPU AMD, acceso restringido |
| gpt-oss-20b (OpenAI) | no disponible en esta informacion | no disponible | no disponible | no disponible en esta informacion | Modelo base del que deriva esta publicacion |
| Alternativas de ~20B en ONNX | no disponible | no disponible | ONNX | variable | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Idioma: el repositorio declara unicamente ingles; el rendimiento en castellano no esta garantizado.
- Dependencia de hardware: la ejecucion esta ligada a NPU de AMD con Ryzen AI 1.9.0; no es un artefacto portable a otros backends sin conversion adicional.
- Informacion tecnica incompleta: no se publican en la informacion disponible datos de contexto, cuantizacion, parametros exactos ni benchmarks, lo que dificulta evaluar su idoneidad para produccion.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; deben asumirse los del modelo base gpt-oss-20b.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones adicionales del acceso gated y las del modelo base.
- Fecha de publicacion futura (2026-11-02 segun metadatos): verificar la vigencia y el estado de mantenimiento del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/amd/gpt-oss-20b_rai_1.9.0_npu
