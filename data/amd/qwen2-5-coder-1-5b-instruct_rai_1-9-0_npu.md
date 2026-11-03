# amd/Qwen2.5-Coder-1.5B-Instruct_rai_1.9.0_npu

## Resumen

El modelo `amd/Qwen2.5-Coder-1.5B-Instruct_rai_1.9.0_npu` es una distribucion optimizada del modelo Qwen2.5-Coder-1.5B-Instruct de Alibaba, publicada por AMD para su ejecucion en las NPU (unidades de procesamiento neuronal) de los procesadores Ryzen AI. Se trata de un transformer decoder-only de 1.500 millones de parametros, especializado en generacion de codigo y conversacion, convertido al formato ONNX y cuantizado con la herramienta Quark de AMD para aprovechar el motor de inferencia Ryzen AI (RAI) version 1.9.0.

El modelo original Qwen2.5-Coder-1.5B-Instruct es la version pequena de la familia Qwen2.5-Coder, entrenada sobre un corpus masivo de codigo y texto, con capacidad de instrucciones y tool calling. Esta variante de AMD mantiene la licencia Apache 2.0 del modelo base, pero su acceso esta restringido en HuggingFace (requiere aceptar condiciones), y el repositorio ocupa 2,4 GB, lo que refleja los pesos en formato ONNX junto con los artefactos de cuantizacion.

La relevancia de esta ficha radica en que permite ejecutar un modelo de codigo de 1,5B parametros en la NPU integrada de los portatiles y mini-PC con Ryzen AI, sin depender de una GPU discreta, lo que abre la puerta a asistentes de codigo locales con bajo consumo energetico. No obstante, la informacion publica disponible es muy limitada: no se detallan los datos de entrenamiento, los benchmarks ni las especificaciones exactas de cuantizacion mas alla de las etiquetas del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-Coder-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para esta variante) |
| Tipos de cuantizacion | Cuantizacion para NPU mediante Quark (no se detalla el esquema exacto, probablemente INT8/INT4 para Ryzen AI) |
| Idiomas soportados | Ingles (segun la etiqueta del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (optimizado para Ryzen AI NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Coder-1.5B-Instruct: un transformer decoder-only con atencion por causalidad, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El modelo original fue entrenado por Alibaba sobre un corpus de codigo y texto de gran escala, con un proceso de post-entrenamiento que incluye instrucciones y posiblemente RLHF/DPO, aunque los detalles exactos no se recogen en la informacion proporcionada. Esta variante de AMD no modifica la arquitectura, sino que la convierte a ONNX y la cuantiza con Quark para su ejecucion en la NPU de Ryzen AI.

La innovacion tecnica principal de esta publicacion no esta en el modelo en si, sino en el pipeline de despliegue: la conversion a ONNX y la cuantizacion con Quark permiten ejecutar el modelo en el motor Ryzen AI 1.9.0, que aprovecha la NPU integrada (XDNA/XDNA2) de los procesadores AMD Ryzen AI. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como decodificacion especulativa o atencion lineal en esta variante.

## Capacidades

- Generacion de texto y codigo: el modelo base esta especializado en tareas de programacion, incluyendo autocompletado, generacion de funciones y explicacion de codigo.
- Razonamiento y matematicas: capacidad de resolver problemas de logica y aritmetica de complejidad moderada, heredada del modelo Qwen2.5-Coder.
- Instrucciones conversacionales: formato instruct, adecuado para dialogos multi-turno y tareas guiadas por prompts.
- Tool calling / function calling: el modelo base Qwen2.5-Coder-1.5B-Instruct soporta llamadas a funciones, aunque no se confirma que esta variante ONNX preserve dicha capacidad en la NPU.
- Capacidades multilingues: limitadas al ingles segun la etiqueta del repositorio, aunque el modelo base tiene cierto soporte multilingue no confirmado aqui.
- Modo thinking: no disponible.
- Vision y audio: no disponibles.

## Casos de uso

- Asistente de codigo local en portatiles con Ryzen AI: el modelo se ejecuta en la NPU integrada, lo que permite autocompletado y generacion de fragmentos de codigo sin conexion a la nube y con bajo consumo energetico, ideal para entornos con requisitos de privacidad.
- Revision de codigo en el editor: integrado mediante un plugin de IDE, el modelo puede sugerir correcciones y explicar errores en tiempo real, aprovechando la inferencia de baja latencia en la NPU.
- Generacion de tests unitarios: a partir de una funcion dada, el modelo puede producir casos de prueba en lenguajes como Python o JavaScript, reduciendo el trabajo manual en pipelines de CI/CD.
- Documentacion automatica de APIs: el modelo puede generar docstrings y comentarios a partir del codigo fuente, adecuado para proyectos con documentacion deficiente.
- Chat de soporte tecnico para desarrolladores: con su formato instruct, puede gestionar conversaciones multi-turno sobre errores de compilacion o dudas de sintaxis, siempre que el contexto no supere el limite efectivo de la variante ONNX.
- Prototipado rapido en entornos educativos: al ejecutarse en hardware de consumo con NPU, es viable en aulas o laboratorios sin GPU dedicada, permitiendo a estudiantes experimentar con modelos de codigo localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional, ya que el modelo esta disenado para ejecutarse en la NPU de Ryzen AI; el repositorio ocupa 2,4 GB, lo que sugiere un peso en disco similar al de los pesos ONNX cuantizados.
- GPU recomendadas: no disponibles; el objetivo es la NPU integrada en procesadores AMD Ryzen AI (serie 7040, 8040 y posteriores con XDNA/XDNA2).
- Compatibilidad con GPU de consumo: no confirmada; el formato ONNX y la cuantizacion Quark estan orientados a la NPU, por lo que no se garantiza su ejecucion en RTX 4090 u otras GPU sin conversion adicional.
- Opciones de despliegue: motor Ryzen AI (RAI) 1.9.0, con soporte para ONNX Runtime y las herramientas de AMD; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| amd/Qwen2.5-Coder-1.5B-Instruct_rai_1.9.0_npu | 1.5B | no disponible | Apache 2.0 | ONNX (NPU) | Codigo en NPU Ryzen AI |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1.5B | 32.768 tokens | Apache 2.0 | safetensors | Codigo en GPU/CPU |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | 32.768 tokens | Apache 2.0 | safetensors | Codigo de mayor capacidad |
| deepseek-ai/DeepSeek-Coder-1.3B-Instruct | 1.3B | 16.384 tokens | DeepSeek License | safetensors | Codigo en GPU/CPU |

La comparativa se limita a modelos de la misma familia o categoria, ya que no se dispone de datos de rendimiento especificos para la variante de AMD. La diferencia clave frente al modelo base es el formato ONNX y la optimizacion para NPU, mientras que el resto de alternativas estan pensadas para GPU o CPU con frameworks convencionales.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated en HuggingFace y requiere aceptar condiciones antes de la descarga, lo que puede limitar su uso en entornos automatizados.
- Idiomas: la etiqueta del repositorio indica solo ingles, por lo que el rendimiento en castellano u otros idiomas no esta garantizado.
- Contexto: no se confirma la longitud de contexto efectiva en la variante ONNX; el modelo base soporta 32.768 tokens, pero la cuantizacion y el motor NPU podrian reducirla.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar codigo incorrecto o APIs inexistentes, especialmente en tareas complejas o con prompts ambiguos.
- Sesgos: no se dispone de informacion sobre sesgos especificos; el modelo base puede reflejar sesgos presentes en los datos de entrenamiento de Qwen2.5-Coder.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el acceso gated y las condiciones de AMD deben revisarse antes de su integracion en productos.
- Produccion: la falta de benchmarks publicos y de documentacion sobre latencia y throughput en NPU hace recomendable una validacion exhaustiva antes de desplegarlo en entornos criticos.
- Hardware: la dependencia de Ryzen AI limita su portabilidad a otras plataformas sin NPU AMD.

## Enlaces

- HuggingFace: https://huggingface.co/amd/Qwen2.5-Coder-1.5B-Instruct_rai_1.9.0_npu
- Modelo base Qwen2.5-Coder-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Documentacion de Ryzen AI: no disponible en la informacion proporcionada
- Herramienta Quark de AMD: no disponible en la informacion proporcionada
- Paper de Qwen2.5-Coder: no disponible en la informacion proporcionada
