# amd/Llama-2-7b-chat-hf_rai_1.9.0_m_1.0.1_npu

## Resumen

`amd/Llama-2-7b-chat-hf_rai_1.9.0_m_1.0.1_npu` es una distribucion del modelo Meta Llama 2 7B Chat adaptada por AMD para su plataforma Ryzen AI, empaquetada en formato ONNX y optimizada para ejecutarse sobre la NPU integrada en los procesadores AMD Ryzen AI (arquitectura XDNA). No se trata de un modelo nuevo: es una conversion y compilacion del checkpoint original `meta-llama/Llama-2-7b-chat-hf` para el runtime Ryzen AI Software (RAI) version 1.9.0, con el grafo compilado para el backend NPU identificado como `m_1.0.1_npu`.

El modelo hereda todas las caracteristicas del Llama 2 7B Chat original: arquitectura transformer decoder-only de 7 mil millones de parametros, contexto de 4.096 tokens, entrenamiento con RLHF y licencia Llama 2. La relevancia de esta publicacion es de infraestructura: permite ejecutar un LLM conversacional de 7B en la NPU de un PC con Ryzen AI, liberando la GPU y reduciendo el consumo energetico frente a la inferencia en CPU o GPU discreta.

El repositorio ocupa aproximadamente 4 GB, lo que sugiere pesos en precision reducida (probablemente FP16 o int8 empaquetados en ONNX). El acceso esta restringido (gated) y requiere aceptar las condiciones de la licencia Llama 2 en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), compilado a ONNX para NPU Ryzen AI |
| Parametros totales | 7 mil millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (heredado de Llama 2) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (repo de 4 GB, compatible con pesos ONNX en FP16/int8) |
| Idiomas soportados | Ingles (segun tag `en`) |
| Licencia | Llama 2 (Llama 2 Community License) |
| Formato de pesos | ONNX (optimizado para runtime Ryzen AI 1.9.0, backend `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B Chat: un transformer decoder-only con atencion multi-cabeza estandar, normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE). El entrenamiento original de Meta se realizo sobre 2 billones de tokens y se refino con RLHF (SFT seguido de optimizacion con recompensa humana). Esta publicacion de AMD no reentrena el modelo: aplica un proceso de exportacion a ONNX y compilacion para el runtime Ryzen AI, generando un grafo optimizado para la NPU XDNA.

La innovacion tecnica de esta ficha no esta en el modelo sino en el pipeline de despliegue: la compilacion para NPU implica cuantizacion y particionado del grafo para ejecutar operaciones en la unidad de IA integrada. El sufijo `m_1.0.1_npu` identifica la version del modelo compilado y el backend de destino. No se dispone de informacion detallada sobre el esquema exacto de cuantizacion ni sobre el reparto de operaciones entre NPU y CPU.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Llama 2 7B Chat.
- Razonamiento basico y respuesta a instrucciones en ingles.
- Generacion de codigo y explicaciones tecnicas de complejidad media.
- Aritmetica y problemas matematicos simples.
- Respuestas con formato conversacional (chat template de Llama 2).
- Ejecucion sobre NPU Ryzen AI, con descarga de trabajo de la CPU/GPU.
- No soporta vision, audio ni tool calling nativo (Llama 2 base no lo incluye).
- Capacidades multilingues limitadas: el tag oficial declara solo ingles.

## Casos de uso

- Asistente conversacional local en PC: ejecutar un chatbot en la NPU de un portatil Ryzen AI permite mantener conversaciones sin conexion y con bajo consumo, usando los 4.096 tokens de contexto para dialogos multi-turno.
- Prototipado de aplicaciones de IA en el borde: desarrolladores que quieran validar flujos de chat sobre hardware AMD sin depender de GPU discreta.
- Demos de Ryzen AI Software: util para mostrar el rendimiento de la NPU con un LLM de 7B en entornos de evaluacion y benchmarks internos de AMD.
- Generacion de texto asistida en herramientas de escritorio: resumenes, reescritura y borradores en ingles integrados en aplicaciones ofimaticas que corran sobre Ryzen AI.
- Educacion e investigacion: estudiar el comportamiento de un LLM en NPU frente a CPU/GPU, comparando latencia y consumo.
- Inferencia con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, adecuado para entornos con restricciones de confidencialidad.
- Base para ajuste fino o evaluacion: servir como referencia de Llama 2 7B Chat en formato ONNX para pipelines de despliegue en hardware AMD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI (arquitectura XDNA) con soporte para Ryzen AI Software 1.9.0; el backend compilado es `m_1.0.1_npu`.
- El repo ocupa 4 GB, por lo que se necesita al menos ese espacio en disco para los pesos ONNX.
- VRAM estimada: no disponible; la inferencia se delega a la NPU, no a una GPU discreta.
- No requiere GPU dedicada; el modelo esta pensado para ejecutarse en la NPU integrada del SoC.
- Opciones de despliegue: runtime Ryzen AI (RAI) 1.9.0 con ONNX Runtime; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| amd/Llama-2-7b-chat-hf_rai_1.9.0_m_1.0.1_npu | 7B | 4.096 | ONNX (NPU) | Llama 2 | NPU Ryzen AI |
| meta-llama/Llama-2-7b-chat-hf | 7B | 4.096 | safetensors | Llama 2 | GPU/CPU generica |
| Mistral-7B-Instruct-v0.2 | 7B | 32.768 | safetensors/GGUF | Apache 2.0 | GPU/CPU generica |
| Qwen2.5-7B-Instruct | 7B | 131.072 | safetensors/GGUF | Apache 2.0 | GPU/CPU generica |

La comparativa se centra en el mismo tamano (7B). Frente a las alternativas, esta distribucion de AMD se diferencia por el formato ONNX compilado para NPU y por heredar la licencia Llama 2, mas restrictiva que Apache 2.0. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo antiguo: Llama 2 (julio de 2023) esta superado en calidad por Llama 3, Mistral y Qwen2.5 de tamano similar.
- Solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o agentes con historial extenso.
- Riesgo de alucinacion inherente a Llama 2 7B, agravado en tareas factuales o de codigo complejo.
- Sesgos conocidos de Llama 2: el modelo original documenta sesgos de genero, raza y religion; esta conversion no los mitiga.
- Licencia Llama 2: uso comercial permitido con condiciones (umbral de 700 millones de usuarios mensuales, requisitos de atribucion y restricciones de uso aceptable); revisar antes de produccion.
- Acceso restringido (gated): requiere aceptar terminos en Hugging Face.
- Dependencia de hardware: solo funciona con el runtime Ryzen AI y NPU compatible; no es portable a otros backends sin reconversion.
- Sin soporte documentado de tool calling, agentes o modo thinking.
- Cero descargas y likes: practicamente sin validacion de la comunidad; tratar como artefacto de referencia de AMD, no como modelo listo para produccion.
- Fecha de creacion (2026-10-30) posterior a la publicacion tipica de Llama 2; verificar que el artefacto corresponde a la version declarada.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Llama-2-7b-chat-hf_rai_1.9.0_m_1.0.1_npu
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Paper Llama 2: https://arxiv.org/abs/2307.09288
- Ryzen AI Software: https://ryzenai.docs.amd.com/
- ONNX Runtime: https://onnxruntime.ai/
