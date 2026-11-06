# amd/Llama-3.2-3B_rai_1.9.0_m_1.0.1_npu

## Resumen

AMD publica en Hugging Face una variante optimizada del modelo Llama 3.2 3B de Meta, empaquetada en formato ONNX y adaptada para su plataforma Ryzen AI (NPU integrada en los procesadores AMD Ryzen AI 300 y posteriores). El identificador del repositorio (`rai_1.9.0_m_1.0.1_npu`) indica que se trata de un artefacto de la herramienta Ryzen AI (RAI) en su version 1.9.0, con un modelo compilado para la NPU (m_1.0.1_npu), lo que sugiere un binario precompilado y listo para ejecutarse sobre el acelerador neuronal de AMD, sin necesidad de recompilar.

El modelo base es Llama 3.2 3B, un transformer decoder-only denso de Meta con 3.210 millones de parametros, ventana de contexto de 128.000 tokens y entrenamiento multilingue (aunque la ficha de AMD solo declara ingles). Esta publicacion no introduce pesos nuevos ni fine-tuning: es un artefacto de despliegue que traslada el modelo original a un grafo ONNX con optimizaciones especificas para el NPU de AMD, manteniendo la licencia Llama 3.2 de Meta.

Su relevancia es practica: permite ejecutar un LLM de 3B en local sobre hardware AMD con NPU, sin GPU dedicada, con un consumo energetico bajo y latencia adecuada para asistentes on-device. El acceso esta restringido (gated) y requiere aceptar las condiciones de la licencia Llama 3.2 en Hugging Face. El repositorio ocupa 2,9 GB, coherente con pesos en precision reducida (probablemente FP16 o INT8 empaquetados en ONNX).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.2), exportado a ONNX y compilado para NPU Ryzen AI |
| Parametros totales | 3.210 millones (modelo base Llama 3.2 3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 3B soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye precompilado para NPU; el tamano del repo, 2,9 GB, sugiere pesos en FP16 o INT8) |
| Idiomas soportados | en (segun la ficha de Hugging Face) |
| Licencia | llama3.2 (Llama 3.2 Community License, acceso gated) |
| Formato de pesos | ONNX (compilado para Ryzen AI NPU, tag `m_1.0.1_npu`) |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 3.2 3B, un transformer decoder-only con atencion por grupos (GQA), activacion SwiGLU, normalizacion RMSNorm pre-atencion y embeddings rotatorios (RoPE). Meta lo entreno sobre datos multilingues con un pipeline que incluye preentrenamiento, ajuste supervisado, rechazo de respuestas y DPO, e incorpora capacidades de tool calling y seguimiento de instrucciones. El contexto nativo del modelo base es de 128.000 tokens.

La contribucion de AMD en este repositorio no es de entrenamiento, sino de despliegue: se ha exportado el modelo a ONNX y se ha compilado para el NPU de Ryzen AI mediante la herramienta RAI 1.9.0, generando un artefacto `m_1.0.1_npu` que se ejecuta sobre el acelerador neuronal integrado en las CPUs AMD Ryzen AI. No se documentan en la informacion disponible detalles sobre el proceso de cuantizacion, el grafo ONNX concreto ni las optimizaciones aplicadas (fusion de operadores, cuantizacion de pesos y activaciones, etc.).

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento basico, resumen, redaccion y respuesta a preguntas.
- Generacion de codigo y explicaciones tecnicas (heredadas del modelo base Llama 3.2).
- Soporte de tool calling / function calling (capacidad del modelo base; no confirmada en la version compilada para NPU).
- Capacidades multilingues limitadas segun la ficha (solo `en` declarado), aunque el modelo base es mas amplio.
- Ejecucion on-device sobre NPU Ryzen AI, con consumo energetico reducido y sin GPU dedicada.
- No se documentan modos especiales (thinking, vision, audio) en la informacion disponible.

## Casos de uso

- Asistentes on-device en portatiles con Ryzen AI: el modelo se ejecuta en la NPU sin ocupar la GPU ni consumir bateria de forma intensiva, adecuado para asistentes de escritorio, dictado y resumen de documentos locales.
- Procesamiento de texto privado en local: al ejecutarse en el NPU del equipo, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad (sanidad, legal, finanzas).
- Generacion de codigo en IDE sobre portatiles AMD: autocompletado, explicacion de funciones y generacion de tests con latencia aceptable en un modelo de 3B.
- Clasificacion y extraccion de informacion en pipelines batch: analisis de correos, tickets o contratos con un modelo pequeno que cabe en memoria y se ejecuta en CPU+NPU.
- Chatbot de soporte interno en ingles: conversaciones multi-turno con contexto moderado, desplegado en equipos de sobremesa con Ryzen AI sin infraestructura cloud.
- Prototipado de aplicaciones LLM para el ecosistema Ryzen AI: sirve como referencia para validar flujos ONNX Runtime + Ryzen AI antes de pasar a modelos mayores o a produccion.
- Traduccion y resumen de documentos en ingles: tareas de procesamiento de lenguaje natural que no requieren contexto extremo y se benefician de la inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: CPUs AMD Ryzen AI (serie 300 y posteriores) con NPU integrada; el artefacto esta compilado especificamente para la NPU via Ryzen AI 1.9.0.
- VRAM: no aplica GPU dedicada; el modelo se ejecuta en la NPU y en memoria del sistema. El repositorio ocupa 2,9 GB, por lo que se recomienda al menos 8-16 GB de RAM del sistema.
- GPU recomendadas: no aplica para este artefacto (especifico de NPU AMD). Para ejecutar el modelo base Llama 3.2 3B en GPU se puede usar una RTX 3060/4060 con 8 GB o superior.
- Cabe en consumer GPU: si, el modelo base 3B cabe en GPUs de 8 GB en FP16, pero este artefacto concreto esta pensado para NPU, no para GPU.
- Opciones de despliegue: Ryzen AI (RAI 1.9.0) con ONNX Runtime; el modelo base puede desplegarse con vLLM, llama.cpp, Ollama o TGI, pero no se garantiza compatibilidad con este artefacto ONNX compilado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| AMD Llama-3.2-3B_rai_1.9.0_m_1.0.1_npu | 3,21 B | no disponible (base: 128k) | Llama 3.2 (gated) | ONNX compilado para NPU Ryzen AI | Artefacto de despliegue, no modelo nuevo |
| Meta Llama 3.2 3B Instruct | 3,21 B | 128k | Llama 3.2 | safetensors, GGUF | Modelo base original, ejecutable en GPU/CPU |
| Qwen2.5 3B Instruct | 3,09 B | 32k (128k en variantes) | Apache 2.0 | safetensors, GGUF, ONNX | Alternativa abierta con licencia permisiva |
| Phi-3.5-mini | 3,8 B | 128k | MIT | safetensors, GGUF, ONNX | Alternativa de Microsoft, buen rendimiento en razonamiento |

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar la licencia Llama 3.2 en Hugging Face para descargar el modelo.
- Licencia Llama 3.2: permite uso comercial con restricciones (limite de 700 millones de usuarios mensuales, obligacion de atribucion "Built with Llama", politicas de uso aceptable). Revisar los terminos antes de produccion.
- Artefacto especifico de hardware: solo funciona en plataformas AMD Ryzen AI con la version de RAI indicada; no es portable a GPU NVIDIA, Apple Silicon u otras NPU sin recompilar.
- Idiomas: la ficha declara unicamente ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: inherente a los modelos de 3B; no apto para tareas de alta precision sin verificacion humana.
- Contexto: aunque el modelo base soporta 128k, no se confirma en la informacion disponible que la version compilada para NPU mantenga esa ventana.
- Sesgos: heredados del corpus de entrenamiento de Llama 3.2; no se documentan evaluaciones de sesgo en este artefacto.
- Sin benchmarks publicados: no hay datos de rendimiento ni de calidad especificos de esta compilacion.
- Repositorio con 0 descargas y 0 likes: sin validacion comunitaria; tratar como publicacion reciente o experimental.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Llama-3.2-3B_rai_1.9.0_m_1.0.1_npu
- Modelo base Llama 3.2 3B (Meta): https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Ryzen AI (AMD): https://www.amd.com/en/products/processors/ryzen-ai.html
- ONNX Runtime: https://onnxruntime.ai/
- No se han encontrado en la informacion proporcionada papers, blogs ni demos adicionales especificos de este artefacto.
