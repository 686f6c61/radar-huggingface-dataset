# amd/Qwen1.5-7B-Chat_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/Qwen1.5-7B-Chat_rai_1.9.0_m_1.0.1_npu` es una distribucion optimizada del modelo Qwen1.5-7B-Chat publicada por AMD para su ejecucion sobre las NPU (unidades de procesamiento neuronal) de la plataforma Ryzen AI. El modelo base Qwen1.5-7B-Chat fue desarrollado por el equipo Qwen de Alibaba Cloud y es un transformer decoder-only de 7.000 millones de parametros con licencia Apache 2.0. En esta version, AMD ha convertido los pesos al formato ONNX y los ha empaquetado con el runtime RAI (Ryzen AI) en su version 1.9.0, con un perfil de modelo identificado como `m_1.0.1_npu`, pensado para inferencia acelerada en hardware de PC con NPU integrada.

El interes practico de esta ficha es que no se trata de un modelo nuevo, sino de un artefacto de despliegue: permite ejecutar un LLM conversacional de 7B en local sobre equipos con NPU AMD Ryzen AI sin depender de GPU dedicada. El repositorio ocupa 5,4 GB, lo que es coherente con pesos en precision reducida (probablemente int8 o similar) empaquetados en ONNX.

El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar. La model card publica no incluye informacion detallada sobre la receta de cuantizacion, los benchmarks en NPU ni las capacidades exactas preservadas respecto al modelo original, por lo que varios campos de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen1.5-7B-Chat), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen1.5-7B-Chat soporta hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible; el tamano del repo (5,4 GB) sugiere pesos en precision reducida (probablemente int8) |
| Idiomas soportados | en (segun los tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI / RAI 1.9.0, perfil `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen1.5-7B-Chat, un transformer decoder-only denso de 7.000 millones de parametros desarrollado por Alibaba Cloud. Qwen1.5 introdujo mejoras sobre la primera generacion de Qwen en estabilidad de entrenamiento, soporte multilingue y longitud de contexto (hasta 32.768 tokens en el modelo base), ademas de un ajuste fino conversacional (chat) con tecnicas de alineacion tipo RLHF. No obstante, la informacion proporcionada sobre este repositorio concreto no detalla el numero de tokens de entrenamiento ni la composicion del dataset.

La contribucion de AMD en este artefacto es la conversion a ONNX y el empaquetado para el runtime Ryzen AI (RAI 1.9.0) con el perfil `m_1.0.1_npu`, orientado a ejecutar la inferencia en la NPU integrada de los procesadores Ryzen AI. No se dispone de informacion publica sobre el esquema exacto de cuantizacion, el particionado de operadores entre NPU y CPU, ni las tecnicas de optimizacion aplicadas (fusion de operadores, decodificacion especulativa, etc.).

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen1.5-7B-Chat.
- Razonamiento basico y respuesta a instrucciones en ingles (unico idioma declarado en los tags).
- Generacion de codigo y resolucion de problemas matematicos sencillos, segun las capacidades del modelo base.
- Ejecucion local en NPU Ryzen AI mediante el runtime RAI, sin necesidad de GPU dedicada.
- Soporte de tool calling / function calling: no confirmado en esta distribucion concreta (el modelo base Qwen1.5-Chat lo soporta, pero la informacion del repositorio no lo verifica).
- Capacidades de agente y razonamiento multi-paso: no confirmadas en esta distribucion.
- Capacidades multilingues: limitadas a ingles segun los metadatos del repositorio.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Asistente conversacional local en PC: el modelo puede gestionar dialogos multi-turno en ingles ejecutandose sobre la NPU de un portatil o mini-PC con Ryzen AI, sin consumo de GPU dedicada ni envio de datos a la nube.
- Prototipado de aplicaciones de IA en el borde (edge AI): util para desarrolladores que quieran validar flujos de generacion de texto en hardware AMD antes de desplegar en produccion.
- Generacion de codigo en entornos aislados: al ejecutarse localmente, permite asistencia de programacion en maquinas sin conexion o con requisitos de confidencialidad.
- Automatizacion de documentacion tecnica: resumen y redaccion de textos en ingles dentro de herramientas internas que corren sobre equipos Ryzen AI.
- Evaluacion comparativa de backends de inferencia: sirve como referencia para medir latencia y throughput de un LLM de 7B en NPU frente a CPU y GPU.
- Chatbots de soporte en intranet: despliegue de un asistente de primera linea en estaciones de trabajo corporativas con hardware AMD, con la ventaja de que los datos no salen del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de latencia, throughput ni calidad (MMLU, HumanEval, GSM8K u otros) para esta distribucion en NPU.

## Requisitos de hardware

- Hardware objetivo: NPU integrada en procesadores AMD Ryzen AI (la ficha del repositorio referencia el runtime RAI 1.9.0 y el perfil `m_1.0.1_npu`).
- VRAM estimada: no aplica en el sentido tradicional; el modelo se ejecuta sobre NPU y memoria del sistema. El repositorio ocupa 5,4 GB, por lo que se requiere al menos esa cantidad de almacenamiento y memoria accesible al runtime.
- GPU dedicadas (A100, H100, RTX 4090): no es el objetivo de esta distribucion; para GPU se usaria el modelo base Qwen1.5-7B-Chat en safetensors.
- Compatibilidad con GPU de consumo: no confirmada para este artefacto ONNX concreto.
- Opciones de despliegue: runtime Ryzen AI (RAI) 1.9.0 con el perfil `m_1.0.1_npu`. No se indica soporte para vLLM, llama.cpp, Ollama o TGI en esta distribucion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / backend | Licencia | Notas |
|---|---|---|---|---|---|
| amd/Qwen1.5-7B-Chat_rai_1.9.0_m_1.0.1_npu | 7B | no disponible (base: 32.768) | ONNX / Ryzen AI NPU | Apache 2.0 | Acceso gated; optimizado para NPU AMD |
| Qwen/Qwen1.5-7B-Chat | 7B | 32.768 | safetensors / GPU, CPU | Apache 2.0 | Modelo base original, sin optimizacion para NPU |
| Mistral-7B-Instruct | 7B | 32.768 | safetensors / GPU, CPU | Apache 2.0 | Alternativa densa de 7B con licencia permisiva |
| Llama 3.1 8B Instruct | 8B | 128.000 | safetensors / GPU, CPU | Llama 3.1 Community License | Mayor contexto, licencia con restricciones |

La comparacion relevante es frente al Qwen1.5-7B-Chat original: esta distribucion de AMD no cambia el modelo, sino el backend de ejecucion (NPU frente a GPU/CPU). Frente a Mistral-7B-Instruct y Llama 3.1 8B, la diferencia principal es el ecosistema de despliegue y la licencia, no la arquitectura.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Idioma: los metadatos solo declaran ingles; el rendimiento en castellano no esta garantizado ni documentado para esta distribucion.
- Dependencia de hardware: el artefacto esta empaquetado para el runtime Ryzen AI 1.9.0 y un perfil NPU concreto (`m_1.0.1_npu`); no es portable a otros backends sin conversion adicional.
- Falta de documentacion: no se publican detalles de cuantizacion, benchmarks ni degradacion de calidad respecto al modelo base, lo que dificulta evaluar su idoneidad en produccion.
- Riesgo de alucinacion: inherente a los modelos de 7B de esta generacion, especialmente en tareas factuales y razonamiento complejo.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base Qwen1.5-7B-Chat.
- Uso comercial: la licencia Apache 2.0 del modelo base es permisiva, pero conviene verificar las condiciones adicionales del acceso gated de AMD antes de un despliegue comercial.
- Fecha de creacion: el repositorio figura creado el 2026-10-30, lo que puede indicar metadatos inconsistentes; conviene verificar la vigencia del artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/amd/Qwen1.5-7B-Chat_rai_1.9.0_m_1.0.1_npu
- Modelo base Qwen1.5-7B-Chat: https://huggingface.co/Qwen/Qwen1.5-7B-Chat
- Repositorio Qwen en GitHub: https://github.com/QwenLM/Qwen1.5
- Documentacion de Ryzen AI (AMD): https://ryzenai.docs.amd.com
- Paper de Qwen1.5 (blog tecnico de Qwen): https://qwenlm.github.io/blog/qwen1.5/
