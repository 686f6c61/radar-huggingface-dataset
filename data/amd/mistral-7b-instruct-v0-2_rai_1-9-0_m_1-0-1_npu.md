# amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_m_1.0.1_npu

## Resumen

El modelo `amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_m_1.0.1_npu` es una conversión optimizada de Mistral-7B-Instruct-v0.2 publicada por AMD para su ejecución sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. Se distribuye en formato ONNX y forma parte del ecosistema RAI (Ryzen AI) de AMD, concretamente en la versión de runtime 1.9.0 con el perfil de modelo 1.0.1 para NPU. El modelo base es el conocido Mistral-7B-Instruct-v0.2 de Mistral AI, un transformer denso de 7.000 millones de parámetros afinado para instrucciones y conversación.

El interés de esta ficha reside en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: empaqueta los pesos de Mistral-7B-Instruct-v0.2 en un grafo ONNX preparado para aceleración por hardware en NPU de AMD. Esto permite ejecutar inferencia de un modelo de 7B en portátiles y equipos de sobremesa con Ryzen AI sin depender de una GPU dedicada, reduciendo consumo energético y aprovechando la memoria unificada del sistema.

La información publicada en HuggingFace es mínima: no se detallan datos de entrenamiento adicionales, benchmarks ni configuraciones de cuantización específicas. El repositorio ocupa 4,4 GB y el acceso es restringido (gated), por lo que es necesario aceptar condiciones en la plataforma antes de descargarlo. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Mistral-7B-Instruct-v0.2), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base soporta 32.768 tokens) |
| Tipos de cuantizacion | No disponible; el tamano del repo (4,4 GB) sugiere pesos en precision reducida respecto a FP16 |
| Idiomas soportados | Ingles (segun la tarjeta del modelo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI 1.9.0, perfil m_1.0.1_npu) |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral-7B-Instruct-v0.2, un transformer decoder-only denso de 7.000 millones de parametros con atencion por ventanas deslizantes (sliding window attention), activacion SwiGLU, RMSNorm y embeddings rotatorios (RoPE). Fue afinado por Mistral AI sobre el modelo base Mistral-7B-v0.1 mediante tecnicas de ajuste por instrucciones y conversacion, aunque AMD no documenta en esta ficha el detalle del dataset ni el proceso de alineamiento.

La contribucion de AMD en este artefacto es la conversion del modelo a un grafo ONNX optimizado para el runtime RAI 1.9.0 y el perfil de modelo 1.0.1 orientado a NPU. No se han publicado en la informacion disponible detalles sobre el proceso de cuantizacion, la composicion del dataset de calibracion ni posibles modificaciones de pesos. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio empaquetado para aceleracion en NPU.

## Capacidades

- Generacion de texto conversacional y seguimiento de instrucciones, heredadas de Mistral-7B-Instruct-v0.2.
- Razonamiento basico y respuesta a preguntas en ingles.
- Generacion de codigo y tareas de transformacion de texto.
- Conversaciones multi-turno con historial de contexto.
- Ejecucion en NPU de AMD Ryzen AI mediante el runtime RAI, con el perfil `m_1.0.1_npu`.
- Soporte de tool calling y function calling: no documentado en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas especificamente para esta conversion.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Asistentes conversacionales locales en portatiles con Ryzen AI: el modelo puede ejecutarse sobre la NPU integrada, liberando la GPU y la CPU para otras tareas y reduciendo el consumo energetico en comparacion con inferencia en GPU.
- Procesamiento de texto en el borde (edge computing): despliegue en equipos de sobremesa o portatiles sin GPU dedicada para tareas de resumen, reescritura y clasificacion de documentos en ingles.
- Generacion de codigo en entornos de desarrollo locales: integracion en asistentes de IDE que aprovechan la NPU para autocompletado y explicacion de fragmentos, manteniendo los datos en el dispositivo.
- Chatbots de soporte en aplicaciones de escritorio: conversaciones multi-turno con contexto moderado para atencion al usuario en herramientas ofimaticas o de productividad.
- Prototipado de pipelines de IA generativa en hardware AMD: validacion de flujos ONNX y del runtime RAI antes de desplegar en produccion sobre equipos Ryzen AI.
- Extraccion y transformacion de informacion estructurada: conversion de texto libre en ingles a formatos tabulares o JSON en procesos internos de back office.
- Educacion e investigacion: ejecucion de un modelo instructivo de 7B en laboratorios con hardware AMD sin acceso a GPUs de datacenter, para experimentos de prompting y evaluacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el tamano del repo (4,4 GB) sugiere un peso en disco de aproximadamente 4,4 GB, lo que implica un consumo de memoria en torno a esa cifra mas overhead del runtime.
- Hardware objetivo: NPU de la plataforma AMD Ryzen AI (runtime RAI 1.9.0, perfil `m_1.0.1_npu`).
- GPU dedicadas: no aplica para este artefacto; esta optimizado para NPU, no para CUDA.
- Compatibilidad con GPU de consumo: no documentada para este formato ONNX especifico.
- Opciones de despliegue: runtime Ryzen AI (RAI) de AMD con soporte ONNX; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_m_1.0.1_npu | 7B | No disponible | ONNX (NPU Ryzen AI) | Apache 2.0 | Despliegue en NPU AMD |
| mistralai/Mistral-7B-Instruct-v0.2 | 7B | 32.768 tokens | safetensors | Apache 2.0 | Modelo original, GPU/CPU |
| mistralai/Mistral-7B-Instruct-v0.3 | 7B | 32.768 tokens | safetensors | Apache 2.0 | Version posterior con vocabulario ampliado |
| Modelos ONNX para NPU de otros fabricantes | Variable | No disponible | ONNX | Variable | Aceleracion en hardware especifico |

La comparativa directa con alternativas de NPU de otros fabricantes no esta disponible en la informacion proporcionada. Frente al modelo original de Mistral AI, la diferencia principal es el formato de despliegue y el hardware objetivo, no las capacidades del modelo.

## Limitaciones y advertencias

- El acceso al repositorio es restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de la descarga.
- La tarjeta del modelo solo declara soporte para ingles; el rendimiento en castellano no esta garantizado ni documentado.
- No se documentan sesgos especificos de esta conversion; los sesgos del modelo base Mistral-7B-Instruct-v0.2 son aplicables.
- Riesgo de alucinacion inherente a los modelos de 7B, especialmente en tareas de conocimiento factual y razonamiento complejo.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que las condiciones del repositorio gated no anadan restricciones adicionales.
- Dependencia del runtime Ryzen AI 1.9.0 y del perfil `m_1.0.1_npu`: la portabilidad a otras plataformas no esta documentada.
- No se han publicado datos de cuantizacion, calibracion ni evaluacion de degradacion de calidad respecto al modelo original.
- La ausencia de benchmarks impide validar el rendimiento real en produccion sobre NPU.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Mistral-7B-Instruct-v0.2_rai_1.9.0_m_1.0.1_npu
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada.
- Paper o blog de AMD sobre esta conversion: no disponible en la informacion proporcionada.
