# amd/Meta-Llama-3-8B_rai_1.9.0_npu

## Resumen

Meta-Llama-3-8B_rai_1.9.0_npu es una conversión del modelo Meta Llama 3 8B de Meta AI, publicada por AMD en formato ONNX y optimizada para ejecutarse sobre la NPU (unidad de procesamiento neuronal) de los procesadores AMD Ryzen AI mediante el stack RyzenAI (RAI) en su versión 1.9.0. No se trata de un modelo nuevo ni de un fine-tune: es una distribución de pesos precompilados y cuantizados con Quark, la herramienta de cuantización de AMD, orientada a inferencia de generación de texto en hardware de PC con acelerador NPU integrado.

El modelo hereda la arquitectura transformer decoder-only de Llama 3 8B, con 8.000 millones de parámetros, y conserva la licencia Llama 3 original, además de la restricción de acceso (gated) que Meta impone a sus pesos. La relevancia de esta ficha radica en que permite ejecutar un LLM de 8B en local sobre la NPU de un Ryzen AI, liberando la GPU y reduciendo el consumo energético frente a alternativas de inferencia en CPU o GPU discreta.

El repositorio tiene un tamaño de 9,3 GB y está etiquetado únicamente para inglés. Al ser una conversión de infraestructura más que un modelo con benchmarks propios, la información pública disponible es limitada y muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), convertido a ONNX |
| Parametros totales | 8.000 millones (8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 8B soporta 8.192 tokens) |
| Tipos de cuantizacion | Cuantizacion via Quark para NPU Ryzen AI; niveles concretos no disponibles |
| Idiomas soportados | Ingles (segun tags del repositorio) |
| Licencia | Llama 3 (llama3), acceso restringido (gated) |
| Formato de pesos | ONNX (optimizado para RyzenAI 1.9.0 NPU) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Meta Llama 3 8B: un transformer decoder-only con atención por cabezas agrupadas (GQA), activación SwiGLU, normalización RMSNorm y embeddings rotatorios (RoPE). AMD no ha reentrenado el modelo; el trabajo consiste en la exportación a ONNX y la cuantización con Quark para que el grafo resultante sea ejecutable en la NPU de los procesadores Ryzen AI. El stack RyzenAI 1.9.0 actúa como runtime que reparte la carga entre NPU y CPU según el grafo.

No se dispone de información sobre el proceso de entrenamiento original más allá de lo publicado por Meta para Llama 3 (entrenamiento sobre billones de tokens con datos web, código y multilingüe, seguido de ajuste con RLHF y DPO). Tampoco se detallan en la información proporcionada las técnicas de optimización específicas aplicadas por AMD (fusión de operadores, precisión mixta, etc.) más allá de la mención a Quark y al formato ONNX.

## Capacidades

- Generación de texto autoregresiva en inglés, con la calidad del modelo base Llama 3 8B.
- Razonamiento general y respuesta a preguntas.
- Generación de código y explicaciones técnicas (capacidad heredada del modelo base).
- Matemáticas básicas y de nivel medio (heredada del modelo base).
- No se documenta soporte de tool calling o function calling específico en esta conversión.
- No se documenta modo thinking, visión ni audio.
- Capacidades multilingües limitadas al inglés según los tags del repositorio.

## Casos de uso

- Inferencia local en portátiles y mini-PC con Ryzen AI: ejecutar un LLM de 8B sobre la NPU libera la GPU integrada y reduce el consumo, útil para asistentes offline en movilidad.
- Procesamiento de documentos confidenciales: al correr en local sin conexión, permite resumir y extraer información de textos sensibles sin enviarlos a la nube.
- Asistentes de escritorio integrados en aplicaciones: la NPU permite mantener el modelo cargado en segundo plano con bajo impacto en el resto del sistema.
- Generación de borradores de código en entornos de desarrollo locales, aprovechando la capacidad de Llama 3 8B para autocompletado y explicación de fragmentos.
- Prototipado de pipelines de IA en hardware AMD: sirve como referencia para validar despliegues ONNX/RyzenAI antes de pasar a producción.
- Educación e investigación sobre inferencia en NPU: permite estudiar el reparto de cargas entre NPU y CPU y el impacto de la cuantización Quark en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU AMD Ryzen AI compatible con el stack RyzenAI 1.9.0 (procesadores de la familia Ryzen AI 300 y equivalentes; consultar la matriz oficial de AMD).
- Tamaño del repositorio: 9,3 GB, lo que orienta sobre el espacio en disco necesario para los pesos ONNX.
- VRAM estimada: no disponible; la ejecución se realiza sobre NPU y memoria del sistema, no sobre VRAM de GPU discreta.
- GPU dedicada: no requerida por diseño; el modelo está pensado para la NPU integrada.
- Opciones de despliegue: runtime RyzenAI (RAI) 1.9.0 con ONNX Runtime; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Acceso |
|---|---|---|---|---|---|
| amd/Meta-Llama-3-8B_rai_1.9.0_npu | 8B | no disponible (base: 8.192) | ONNX (NPU) | Llama 3 | Gated |
| meta-llama/Meta-Llama-3-8B | 8B | 8.192 | safetensors | Llama 3 | Gated |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8.192 | safetensors | Llama 3 | Gated |

La diferencia principal frente al modelo original de Meta es el formato y el target de ejecución: esta versión está empaquetada para NPU Ryzen AI, mientras que los pesos oficiales están en safetensors para GPU/CPU con frameworks estándar. No se dispone de datos de rendimiento comparativo entre ambas distribuciones.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar las condiciones de Meta en Hugging Face antes de descargar.
- Licencia Llama 3 con restricciones de uso comercial (política de uso aceptable de Meta); revisar los términos antes de desplegar en producción.
- Solo inglés según los tags; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente al modelo base Llama 3 8B.
- Sesgos heredados de los datos de entrenamiento originales de Meta.
- Dependencia de hardware específico: solo ejecutable en NPUs Ryzen AI compatibles con RyzenAI 1.9.0.
- Sin benchmarks publicados para esta conversión; la cuantización Quark puede degradar la calidad respecto a los pesos originales en FP16/BF16.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema y soporte comunitario muy limitados.

## Enlaces

- Hugging Face: https://huggingface.co/amd/Meta-Llama-3-8B_rai_1.9.0_npu
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B
- Ryzen AI (AMD): https://www.amd.com/en/products/processors/ryzen-ai.html
- Quark (cuantización AMD): https://quark.amd.com/
