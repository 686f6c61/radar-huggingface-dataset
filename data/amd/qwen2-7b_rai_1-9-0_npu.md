# amd/Qwen2-7B_rai_1.9.0_npu

## Resumen

Qwen2-7B_rai_1.9.0_npu es una distribucion optimizada del modelo Qwen2-7B preparada por AMD para ejecutarse sobre las NPU (unidades de procesamiento neuronal) de los procesadores Ryzen AI mediante el stack de inferencia RyzenAI (RAI) en su version 1.9.0. El modelo base Qwen2-7B fue desarrollado por el equipo Qwen de Alibaba y es un transformer denso de 7.000 millones de parametros con una ventana de contexto nativa de 32.768 tokens. AMD lo redistribuye aqui en formato ONNX, cuantizado con la herramienta Quark, para que pueda desplegarse en hardware de PC con aceleracion NPU.

La relevancia de esta ficha radica en que no se trata de un modelo nuevo, sino de un artefacto de despliegue: el interes tecnico esta en la conversion a ONNX y en la cuantizacion orientada a NPU, no en cambios en los pesos semanticos. Esto permite ejecutar localmente un LLM de 7B en portatiles y mini-PC con Ryzen AI sin depender de GPU dedicada, algo relevante para escenarios de privacidad, coste energetico y latencia en el borde.

El repositorio tiene un tamano de 8,9 GB, esta publicado bajo licencia Apache 2.0 y requiere aceptar condiciones de acceso en HuggingFace (repositorio con gating). Los metadatos solo declaran soporte de ingles, aunque el modelo base Qwen2 es multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 7.000 millones (modelo base Qwen2-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (ventana nativa del modelo base Qwen2-7B) |
| Tipos de cuantizacion | Cuantizacion para NPU generada con Quark (niveles exactos no disponibles en la informacion proporcionada) |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-7B, un transformer decoder-only denso con atencion causal estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos de atencion QKV, tal como se define en la familia Qwen2. No incorpora mezcla de expertos ni atencion lineal; es un transformer clasico de 7B parametros con contexto de 32.768 tokens. AMD no ha modificado la arquitectura: el trabajo realizado consiste en exportar los pesos a ONNX y cuantizarlos con Quark para su ejecucion en la NPU de Ryzen AI mediante el runtime RyzenAI 1.9.0.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento original (numero de tokens, composicion, fases de SFT/RLHF/DPO), que corresponden al modelo base Qwen2-7B y no a esta redistribucion. Tampoco se documentan en esta ficha innovaciones de decodificacion especulativa ni tecnicas de atencion alternativa especificas de esta version.

## Capacidades

- Generacion de texto conversacional y de proposito general en ingles.
- Razonamiento basico y respuesta a preguntas sobre contexto largo, gracias a la ventana de 32.768 tokens del modelo base.
- Generacion de codigo en lenguajes habituales (heredada del modelo base Qwen2).
- Razonamiento matematico de nivel medio (capacidad del modelo base, no verificada en esta distribucion).
- Ejecucion sobre NPU de Ryzen AI mediante el stack RyzenAI 1.9.0 y formato ONNX.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta distribucion.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion proporcionada.
- Capacidades multilingues: los metadatos solo declaran ingles; el modelo base Qwen2 es multilingue, pero no se garantiza en esta version.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Asistente local en portatiles con Ryzen AI: el modelo puede ejecutarse en la NPU del procesador sin GPU dedicada, ofreciendo generacion de texto conversacional con contexto largo para aplicaciones de escritorio donde la privacidad de los datos es prioritaria.
- Procesamiento de documentos largos en el borde: con 32.768 tokens de contexto, permite resumir o extraer informacion de contratos, informes o transcripciones sin enviar los datos a la nube.
- Generacion de codigo asistida en IDE de escritorio: integrable en asistentes locales de programacion que aprovechan la NPU para reducir el consumo energetico frente a la CPU o la GPU integrada.
- Chatbot de atencion al cliente on-premise: despliegue en mini-PC con Ryzen AI para entornos con requisitos de residencia de datos, gestionando conversaciones multi-turno dentro de la ventana de contexto.
- Clasificacion y extraccion de informacion en pipelines documentales: uso como motor de comprension de texto en flujos batch ejecutados en hardware de escritorio con bajo consumo.
- Prototipado y evaluacion de LLM en hardware AMD: util para desarrolladores que quieran validar el stack RyzenAI 1.9.0 y Quark antes de desplegar modelos mayores o en produccion.
- Educacion e investigacion: ejecucion local de un 7B para experimentos de prompting y evaluacion sin coste de GPU en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica de forma directa; el modelo se ejecuta en la NPU de Ryzen AI, no en memoria de GPU dedicada. El repositorio ocupa 8,9 GB en disco.
- GPU recomendadas: no aplica para el objetivo de esta distribucion; el stack RyzenAI esta orientado a NPU de procesadores AMD Ryzen AI.
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada.
- Opciones de despliegue: runtime RyzenAI 1.9.0 con modelos ONNX cuantizados con Quark; no se documentan en la informacion proporcionada soportes de vLLM, llama.cpp, Ollama o TGI para este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| amd/Qwen2-7B_rai_1.9.0_npu | 7B | 32.768 tokens | ONNX (NPU) | Apache 2.0 | Inferencia en NPU Ryzen AI |
| Qwen/Qwen2-7B (base) | 7B | 32.768 tokens | safetensors | Apache 2.0 | Uso general en GPU/CPU |
| Mistral-7B-v0.3 | 7B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Uso general en GPU/CPU |
| Llama-3.1-8B | 8B | 128.000 tokens | safetensors, GGUF | Llama 3.1 Community | Uso general en GPU/CPU |

La diferencia clave frente a las alternativas es que esta version de AMD esta preconvertida y cuantizada para NPU, mientras que los demas modelos requieren conversion manual o runtimes distintos. Los datos de rendimiento comparado no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Repositorio con gating: requiere aceptar condiciones en HuggingFace antes de descargar.
- Idiomas: los metadatos solo declaran ingles; el uso en castellano u otros idiomas no esta garantizado en esta distribucion.
- Dependencia de hardware: el artefacto esta pensado para NPU de Ryzen AI con el runtime RyzenAI 1.9.0; fuera de ese entorno su utilidad es limitada.
- Riesgo de alucinacion: inherente al modelo base Qwen2-7B, especialmente en tareas factuales y contextos largos.
- Sesgos: no documentados en la informacion proporcionada; se heredan los del modelo base.
- Tool calling y agentes: no confirmados para esta distribucion; conviene validarlos antes de usarlos en produccion.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de acceso del repositorio en HuggingFace.
- Sin benchmarks publicados para esta version: el rendimiento real en NPU debe medirse en el hardware objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen2-7B_rai_1.9.0_npu
- Modelo base Qwen2-7B: no disponible en la informacion proporcionada
- Documentacion de RyzenAI: no disponible en la informacion proporcionada
- Herramienta Quark de AMD: no disponible en la informacion proporcionada
- Papers, blogs o demos adicionales: no disponibles en la informacion proporcionada
