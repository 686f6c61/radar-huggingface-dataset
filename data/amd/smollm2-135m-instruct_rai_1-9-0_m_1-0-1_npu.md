# amd/SmolLM2-135M-Instruct_rai_1.9.0_m_1.0.1_npu

## Resumen
El modelo `amd/SmolLM2-135M-Instruct_rai_1.9.0_m_1.0.1_npu` es una distribucion empaquetada por AMD del modelo SmolLM2-135M-Instruct, adaptada para su ejecucion sobre las unidades de procesamiento neuronal (NPU) de los procesadores AMD Ryzen AI mediante el runtime Ryzen AI (RAI) en su version 1.9.0 y el formato de modelo `m_1.0.1_npu`. No se trata de un modelo entrenado desde cero por AMD, sino de una conversion y cuantizacion del checkpoint original de HuggingFaceTB orientada al despliegue en hardware de PC con aceleracion NPU.

El modelo base SmolLM2-135M-Instruct es un transformer decoder-only de 135 millones de parametros, disenado para tareas de generacion de texto y conversacion con un coste computacional muy bajo. Su interes en este contexto radica en que AMD lo publica como artefacto listo para Ryzen AI, lo que permite ejecutar inferencia local en CPU+NPU sin GPU dedicada, algo relevante para asistentes embebidos, prototipos en portatiles y aplicaciones de borde.

La ficha se limita a lo que puede verificarse a partir de la informacion del repositorio: los detalles de entrenamiento, benchmarks y composicion del dataset del modelo original no estan incluidos en la informacion proporcionada y se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base SmolLM2-135M-Instruct); empaquetado ONNX para NPU Ryzen AI |
| Parametros totales | 135 millones (segun nombre del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (formato `m_1.0.1_npu` para Ryzen AI; nivel de cuantizacion no especificado) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (runtime Ryzen AI); repo de 0.3 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones en HuggingFace |
| Pipeline | text-generation |
| Tags | onnx, amd, ryzenai, m_1.0.1_npu, text-generation, conversational |

## Arquitectura y entrenamiento
El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parametros publicado por HuggingFaceTB. La informacion proporcionada no incluye detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado mas alla de la denominacion "Instruct".

La contribucion de AMD en este repositorio es el empaquetado: conversion a ONNX y preparacion para el runtime Ryzen AI 1.9.0 con el formato de modelo `m_1.0.1_npu`, que permite ejecutar la inferencia en la NPU integrada de los procesadores Ryzen AI. No se dispone de informacion sobre optimizaciones adicionales (fusion de operadores, decodificacion especulativa, atencion lineal) en la informacion proporcionada.

## Capacidades
- Generacion de texto conversacional en ingles, orientada a instrucciones.
- Respuesta a prompts de tipo chat (formato Instruct del modelo base).
- Inferencia local acelerada por NPU en hardware AMD Ryzen AI.
- Ejecucion en CPU+NPU sin necesidad de GPU dedicada.
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- No se documenta en la informacion proporcionada soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso
- Asistentes embebidos en portatiles Ryzen AI: el modelo puede ejecutarse en la NPU para tareas de autocompletado, resumen o respuesta a preguntas simples sin consumir GPU ni bateria de forma significativa, gracias a sus 135 M de parametros.
- Prototipado rapido de aplicaciones de chat local: util para validar pipelines de generacion de texto en hardware AMD antes de escalar a modelos mayores.
- Clasificacion y etiquetado de texto en el borde: con un modelo tan pequeno, es viable procesar lotes de textos cortos en local para tareas de moderacion o categorizacion sencilla.
- Generacion de respuestas en formularios y asistentes de escritorio: integrable en aplicaciones de productividad que requieran sugerencias de texto en ingles con baja latencia.
- Demostraciones de Ryzen AI: sirve como ejemplo de referencia para desarrolladores que quieran medir el rendimiento de la NPU con un modelo Instruct estandar.
- Educacion y experimentacion: modelo adecuado para cursos y talleres sobre despliegue de LLM en hardware de consumo, dado su tamano reducido y su licencia permisiva.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- Hardware objetivo: procesadores AMD Ryzen AI con NPU compatible con el runtime Ryzen AI 1.9.0.
- VRAM estimada: no aplica de forma directa; la inferencia se ejecuta en NPU/CPU. Para el modelo base de 135 M en FP16 se requieren aproximadamente 0,27 GB de pesos, aunque la cuantizacion concreta del paquete no esta especificada.
- GPU recomendadas: no disponibles; el artefacto esta orientado a NPU Ryzen AI, no a GPU.
- Cabe en GPU de consumo: si, el modelo base de 135 M cabe en cualquier GPU consumer moderna, pero este paquete ONNX esta pensado para NPU.
- Opciones de despliegue: runtime Ryzen AI (RAI) 1.9.0; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| amd/SmolLM2-135M-Instruct_rai_1.9.0_m_1.0.1_npu | 135 M | no disponible | Apache 2.0 | ONNX (Ryzen AI) | NPU AMD Ryzen AI |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135 M | no disponible | Apache 2.0 | safetensors | GPU/CPU generico |
| Qwen2.5-0.5B-Instruct | 0,5 B | no disponible | Apache 2.0 | safetensors, GGUF | GPU/CPU generico |

La comparativa se limita a caracteristicas estructurales; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo de 135 M de parametros: capacidad de razonamiento y conocimiento factual muy limitada en comparacion con modelos de mayor tamano; riesgo elevado de alucinacion en preguntas abiertas.
- Solo soporta ingles segun los metadatos; el rendimiento en castellano no esta garantizado.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar el modelo.
- Dependencia del runtime Ryzen AI 1.9.0 y del formato `m_1.0.1_npu`; no es portable a otros runtimes sin conversion.
- No se documentan sesgos especificos ni evaluaciones de seguridad en la informacion proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede heredar limitaciones de calidad propias de su tamano.
- No apto para tareas que requieran contexto largo, tool calling o agentes multi-paso sin validacion adicional.

## Enlaces
- [HuggingFace: amd/SmolLM2-135M-Instruct_rai_1.9.0_m_1.0.1_npu](https://huggingface.co/amd/SmolLM2-135M-Instruct_rai_1.9.0_m_1.0.1_npu)
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion proporcionada.
