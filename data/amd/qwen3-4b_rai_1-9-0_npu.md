# amd/Qwen3-4B_rai_1.9.0_npu

## Resumen

AMD/Qwen3-4B_rai_1.9.0_npu es una distribucion del modelo Qwen3-4B de Alibaba Qwen, publicada por AMD en formato ONNX y optimizada para ejecutarse sobre la NPU (Neural Processing Unit) integrada en los procesadores AMD Ryzen AI mediante el stack RyzenAI 1.9.0 y el toolkit de cuantizacion Quark. No se trata de un modelo entrenado desde cero por AMD, sino de una conversion y empaquetado del Qwen3-4B original para aceleracion en hardware de PC con NPU dedicada.

El modelo resuelve el problema de desplegar un LLM de 4.000 millones de parametros en equipos de sobremesa y portatiles con Ryzen AI, sin depender de GPU discretas, aprovechando la NPU para inferencia de texto y conversacion. Qwen3-4B es un transformer denso de la familia Qwen3, con soporte de modo thinking y capacidades multilingues, aunque esta distribucion concreta declara unicamente ingles en sus metadatos.

Es relevante porque ejemplifica la tendencia de llevar LLMs de tamano medio a NPUs de consumo mediante formatos ONNX precompilados, lo que reduce el consumo energetico y libera la GPU para otras tareas. El repositorio ocupa 5,3 GB, esta bajo licencia Apache 2.0 y requiere acceso aprobado (gated) en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), exportado a ONNX para NPU Ryzen AI |
| Parametros totales | 4.000 millones (Qwen3-4B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Qwen3-4B original soporta hasta 32.768 tokens nativos, ampliable; verificar en la model card) |
| Tipos de cuantizacion | Cuantizacion via Quark para NPU; niveles exactos no disponibles |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para RyzenAI 1.9.0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso con atencion por cabezas agrupadas (GQA) y normalizacion RMSNorm, entrenado por Alibaba Qwen. Esta publicacion de AMD no aporta informacion sobre el entrenamiento original: no se detallan tokens de preentrenamiento, composicion del dataset ni fases de RLHF o DPO en los metadatos disponibles.

La innovacion tecnica de esta distribucion es el pipeline de conversion: AMD aplica su toolkit Quark para cuantizar y exportar los pesos a ONNX, de modo que el modelo se ejecute en la NPU de los chips Ryzen AI bajo el runtime RyzenAI 1.9.0. Esto implica un grafo ONNX particionado y optimizado para el acelerador, no pesos en safetensors ni GGUF, lo que condiciona el tipo de herramientas de despliegue utilizables.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas de Qwen3-4B.
- Razonamiento con modo thinking (el Qwen3 original permite alternar entre razonamiento extendido y respuestas directas; confirmar soporte en esta exportacion).
- Generacion de codigo y resolucion de problemas matematicos a nivel de modelo de 4B.
- Soporte de tool calling y function calling segun las capacidades del Qwen3 base (verificar en la model card de la exportacion).
- Capacidades multilingues del modelo original, aunque los metadatos de esta distribucion solo declaran ingles.
- Inferencia acelerada en NPU Ryzen AI con bajo consumo energetico frente a GPU discreta.

## Casos de uso

- Asistentes locales en portatiles Ryzen AI: el modelo se ejecuta en la NPU liberando CPU y GPU, adecuado para asistentes de escritura y resumen que deben funcionar sin conexion y con bajo consumo.
- Procesamiento por lotes de documentos en equipos de sobremesa: clasificacion, extraccion y resumen de textos en ingles aprovechando la NPU para no saturar la GPU del sistema.
- Copilotos de codigo en el IDE: generacion y explicacion de fragmentos de codigo en local, con latencia aceptable para un modelo de 4B cuantizado.
- Chatbots de soporte en entornos corporativos con requisitos de privacidad: al ejecutarse en hardware local, los datos no salen del equipo.
- Prototipado de pipelines de agentes en hardware de consumo: validacion de flujos con tool calling antes de migrar a infraestructura mayor.
- Educacion e investigacion: experimentacion con LLMs en laboratorios sin acceso a GPUs de datacenter, usando PCs con Ryzen AI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI compatible con el runtime RyzenAI 1.9.0 (generaciones recientes de APUs Ryzen AI; consultar la matriz de compatibilidad de AMD).
- El repositorio ocupa 5,3 GB, lo que da una idea del espacio en disco necesario para los pesos ONNX cuantizados.
- No esta pensado para ejecutarse en GPU NVIDIA ni en CPU generica mediante llama.cpp u Ollama, ya que el formato es ONNX especifico para NPU.
- VRAM estimada: no aplica en el sentido habitual; el modelo usa memoria del sistema y la NPU. No disponible el consumo exacto de memoria.
- Opciones de despliegue: runtime RyzenAI 1.9.0 y herramientas de AMD para ONNX; no disponible soporte de vLLM, TGI o llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| AMD/Qwen3-4B_rai_1.9.0_npu | 4B | no disponible | ONNX (NPU Ryzen AI) | Apache 2.0 | Acceso gated, solo ingles declarado |
| Qwen/Qwen3-4B | 4B | 32.768 nativos (segun model card original) | safetensors | Apache 2.0 | Modelo base, GPU/CPU via transformers |
| Qwen3-4B en GGUF (comunidad) | 4B | igual al base | GGUF | Apache 2.0 | Despliegue en llama.cpp/Ollama en CPU/GPU |

La comparativa se limita al ecosistema Qwen3-4B porque esta publicacion es una reexportacion del mismo; las diferencias estan en el formato, el hardware objetivo y las restricciones de acceso, no en los pesos.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en HuggingFace antes de descargar.
- Solo declara ingles en los metadatos; el uso en castellano no esta garantizado ni validado en esta distribucion.
- Formato ONNX atado al runtime RyzenAI 1.9.0 y a NPUs AMD compatibles; no es portable a otras plataformas sin reconversion.
- Riesgo de alucinacion inherente a un modelo de 4B, mayor en tareas de conocimiento factual y matematicas complejas.
- Sesgos heredados de los datos de entrenamiento de Qwen3, no documentados en esta publicacion.
- Sin benchmarks publicados para esta exportacion: el rendimiento real en NPU debe medirse en el hardware objetivo.
- Aunque la licencia es Apache 2.0, conviene revisar los terminos de la licencia del modelo base Qwen3-4B y las condiciones de acceso del repo.
- No disponible informacion sobre soporte de tool calling o modo thinking tras la conversion a ONNX.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/amd/Qwen3-4B_rai_1.9.0_npu
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Documentacion Ryzen AI de AMD: no disponible en la informacion proporcionada
- Toolkit Quark de AMD: no disponible en la informacion proporcionada
