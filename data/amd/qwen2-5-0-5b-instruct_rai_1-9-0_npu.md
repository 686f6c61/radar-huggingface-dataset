# amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_npu

## Resumen

El modelo `amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_npu` es una distribucion del modelo Qwen2.5-0.5B-Instruct de Alibaba, adaptada y empaquetada por AMD para su ejecucion sobre las unidades de procesamiento neuronal (NPU) integradas en los procesadores Ryzen AI. Se trata de una conversion a formato ONNX optimizada con el toolkit Quark de AMD, orientada al runtime Ryzen AI (RAI) en su version 1.9.0, lo que permite ejecutar inferencia de texto en la NPU del chip en lugar de en la CPU o la GPU.

El modelo base, Qwen2.5-0.5B-Instruct, es un transformer decoder-only de aproximadamente 500 millones de parametros, entrenado para seguir instrucciones y mantener conversaciones. Su tamano reducido lo hace idoneo para despliegues en dispositivos de borde (edge), donde los recursos de memoria y computo son limitados. AMD lo redistribuye aqui como un artefacto listo para consumir desde el stack Ryzen AI, con el objetivo de ofrecer inferencia local de bajo consumo.

La relevancia de esta ficha radica en que ejemplifica el patron de distribucion de modelos para hardware especifico: no se trata de un modelo nuevo, sino de una compilacion optimizada para un acelerador concreto. Esto condiciona tanto su licencia heredada (Apache 2.0) como sus requisitos de despliegue, que dependen de tener hardware Ryzen AI y el runtime correspondiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), convertido a ONNX para NPU |
| Parametros totales | Aproximadamente 0.5 mil millones (modelo base Qwen2.5-0.5B-Instruct) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (empaquetado con Quark para Ryzen AI) |
| Idiomas soportados | Ingles (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para NPU Ryzen AI) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-0.5B-Instruct, un transformer decoder-only con atencion causal estandar, perteneciente a la familia Qwen2.5 de Alibaba. La version distribuida por AMD no aporta cambios en la arquitectura del modelo original: el trabajo realizado consiste en la exportacion a ONNX y la optimizacion mediante el toolkit Quark para su ejecucion sobre la NPU de los procesadores Ryzen AI, dentro del runtime RAI 1.9.0.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas en el modelo base. Se sabe que el modelo original fue entrenado para seguir instrucciones y mantener conversaciones, pero los detalles concretos de ese proceso no forman parte de los metadatos de esta distribucion.

## Capacidades

- Generacion de texto en ingles y mantenimiento de conversaciones multi-turno, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Seguimiento de instrucciones en formato chat (pipeline `text-generation` con tag `conversational`).
- Inferencia local en la NPU de procesadores Ryzen AI, con el objetivo de reducir el consumo energetico frente a la ejecucion en CPU.
- Razonamiento basico y generacion de codigo simple, limitados por el tamano reducido del modelo (0,5B parametros).
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingues limitadas: los metadatos solo declaran ingles.

## Casos de uso

- Asistentes conversacionales locales en portatiles con Ryzen AI: el modelo se ejecutaria en la NPU para responder consultas sencillas sin conexion a la nube, aprovechando el bajo consumo del acelerador.
- Autocompletado y generacion de texto en aplicaciones de escritorio: integrado en editores o herramientas ofimaticas para sugerencias en tiempo real, donde la latencia baja y la ausencia de red son prioritarias.
- Clasificacion y resumen de texto corto en el dispositivo: por ejemplo, resumir correos o notas en una aplicacion local, manteniendo los datos en el equipo.
- Prototipado de pipelines de IA en borde (edge AI): util para desarrolladores que quieran validar flujos de inferencia sobre NPU Ryzen AI antes de escalar a modelos mayores.
- Chatbots de soporte basico embebidos en aplicaciones de escritorio: con respuestas acotadas y contexto corto, adecuados para FAQ y asistencia guiada.
- Filtrado y enriquecimiento de datos en local: generacion de etiquetas o reformulaciones de texto en herramientas de procesamiento por lotes que se ejecutan en el portatil del usuario.
- Educacion y demos de inferencia en NPU: el modelo sirve como ejemplo didactico de despliegue ONNX sobre Ryzen AI con el runtime RAI 1.9.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware imprescindible: procesador AMD Ryzen AI compatible con el runtime RAI 1.9.0 y su NPU integrada; sin dicha NPU el artefacto ONNX no es utilizable segun el proposito declarado.
- VRAM estimada: no aplica en el sentido de GPU dedicada; el modelo se ejecuta sobre la NPU y la memoria del sistema. El repo ocupa 0,9 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no disponibles; esta distribucion esta pensada para NPU, no para GPU.
- Compatibilidad con GPU de consumo: no es el objetivo de este artefacto; para ejecutar Qwen2.5-0.5B-Instruct en GPU consumer seria preferible usar los pesos originales en safetensors o GGUF.
- Opciones de despliegue: runtime Ryzen AI (RAI) 1.9.0 con el modelo ONNX empaquetado por Quark; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta distribucion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|
| amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_npu | ~0,5B | No disponible | Apache 2.0 | ONNX para NPU Ryzen AI |
| Qwen/Qwen2.5-0.5B-Instruct (original) | ~0,5B | No disponible | Apache 2.0 | Safetensors, GGUF; CPU/GPU |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | No disponible | Apache 2.0 | Safetensors, GGUF; CPU/GPU |

La diferencia principal frente al modelo original de Qwen no esta en capacidades ni en parametros, sino en el formato y el hardware objetivo: la version de AMD esta empaquetada para NPU Ryzen AI, mientras que la original se distribuye en formatos genericos para CPU y GPU. Frente a la variante de 1,5B, esta ofrece menor capacidad pero tambien menor huella de memoria, lo que la hace mas adecuada para dispositivos de borde.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en HuggingFace antes de descargar el modelo.
- Dependencia de hardware especifico: el artefacto esta pensado para NPU Ryzen AI con RAI 1.9.0; no es portable a otros aceleradores sin reconversion.
- Modelo de 0,5B parametros: capacidad limitada de razonamiento, matematicas y codigo complejo; propenso a errores en tareas que requieran conocimiento profundo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de este tamano, especialmente en dominios especializados.
- Idiomas: solo se declara ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto no documentada en esta distribucion; conviene verificarla antes de usarla en conversaciones largas.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial, pero conviene revisar los terminos del runtime Ryzen AI y del toolkit Quark, que pueden tener condiciones propias.
- Sin datos de benchmarks ni de rendimiento en esta distribucion, por lo que no se puede comparar su calidad de salida con la del modelo original sin evaluacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/amd/Qwen2.5-0.5B-Instruct_rai_1.9.0_npu
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de Qwen2.5: https://github.com/QwenLM/Qwen2.5
- Ryzen AI (AMD): https://www.amd.com/en/products/software/ryzen-ai.html
- Toolkit Quark de AMD: https://quark.amd.com/
