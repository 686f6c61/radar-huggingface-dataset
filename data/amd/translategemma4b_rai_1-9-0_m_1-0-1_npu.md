# amd/TranslateGemma4B_rai_1.9.0_m_1.0.1_npu

## Resumen

TranslateGemma4B_rai_1.9.0_m_1.0.1_npu es una distribución optimizada del modelo Gemma 3 de 4B parámetros publicada por AMD para su ejecución sobre las unidades de procesamiento neuronal (NPU) de los procesadores Ryzen AI. El repositorio combina los pesos del modelo base con el formato ONNX y las herramientas de cuantización Quark de AMD, de modo que el modelo pueda desplegarse en hardware de PC con aceleración NPU en lugar de depender exclusivamente de GPU o CPU.

El nombre indica que se trata de una variante orientada a traducción automática («TranslateGemma») del modelo Gemma 3 de 4B, empaquetada para la versión 1.9.0 del runtime Ryzen AI y la versión 1.0.1 de las herramientas de despliegue de AMD. El tag `gemma3_text` confirma que la arquitectura subyacente es la del modelo de texto de Gemma 3, no la variante multimodal.

Su relevancia radica en que ejemplifica el patrón de despliegue de modelos abiertos en NPUs de consumo: AMD distribuye pesos ya convertidos y cuantizados para su stack Ryzen AI, lo que reduce la fricción para desarrolladores que quieren ejecutar inferencia local en portátiles y mini-PC con Ryzen AI. El acceso está restringido (gated) y requiere aceptar las condiciones de la licencia Gemma en HuggingFace.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text, tag `gemma3_text`) |
| Parámetros totales | 4B (según el nombre del modelo; no confirmado en la información disponible) |
| Parámetros activos | no disponible (no es un modelo MoE según los tags) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mediante Quark de AMD (tag `quark`); niveles concretos no disponibles |
| Idiomas soportados | en |
| Licencia | Gemma (licencia de Google, con condiciones de uso) |
| Formato de pesos | ONNX (tag `onnx`), empaquetado para Ryzen AI NPU |

## Arquitectura y entrenamiento

La información disponible no detalla el proceso de entrenamiento del modelo base ni de la variante de traducción. Por los tags del repositorio (`gemma3_text`, `onnx`, `quark`, `ryzenai`, `m_1.0.1_npu`) se deduce que el artefacto es una conversión del modelo Gemma 3 de texto a ONNX, cuantizado con el toolkit Quark de AMD y compilado para el runtime de NPU Ryzen AI en su versión 1.9.0. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en la variante de traducción.

La innovación técnica principal del repositorio no está en el modelo en sí, sino en el pipeline de despliegue: la conversión a ONNX y la cuantización con Quark permiten ejecutar un transformer de 4B parámetros sobre la NPU integrada en los procesadores Ryzen AI, con el objetivo de reducir consumo energético y liberar la GPU para otras tareas. No se dispone de información sobre técnicas adicionales como decodificación especulativa o atención lineal en esta distribución.

## Capacidades

- Generación de texto y conversación multi-turno (tags `text-generation` y `conversational`).
- Traducción automática, según indica el nombre del modelo; los pares de idiomas concretos no están disponibles en la información proporcionada.
- Ejecución sobre NPU Ryzen AI mediante el formato ONNX y el runtime de AMD.
- Capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio: no disponible en la información proporcionada.
- Capacidades multilingües: el repositorio declara únicamente `en` como idioma soportado, aunque el propósito de traducción sugiere manejo de más idiomas; no confirmado.

## Casos de uso

- Traducción local en portátiles con Ryzen AI: el modelo puede ejecutarse sobre la NPU integrada para traducir texto sin enviar datos a la nube, lo que resulta adecuado para documentos sensibles y para escenarios sin conectividad.
- Asistentes de escritura offline: integrado en editores o procesadores de texto, permite reescritura, resumen y traducción de párrafos con latencia baja y consumo energético reducido al usar la NPU en lugar de la CPU.
- Procesamiento por lotes de documentos multilingües: al ejecutarse en hardware de consumo, puede traducir lotes de textos durante la noche en un único equipo sin coste de API.
- Prototipado de aplicaciones de traducción en el ecosistema Ryzen AI: sirve como referencia para desarrolladores que quieren validar el stack ONNX + Quark + NPU antes de pasar a producción.
- Subtitulado y transcripción asistida: combinado con un modelo de reconocimiento de voz, puede traducir subtítulos en tiempo casi real en un PC local.
- Chat de atención al cliente autoalojado: para despliegues pequeños que requieren conversación multi-turno en inglés con soberanía de datos, ejecutándose en hardware AMD sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU Ryzen AI compatible con el runtime 1.9.0 (procesadores de la familia Ryzen AI; modelos concretos no especificados en la información disponible).
- VRAM estimada: no disponible; al ejecutarse en NPU, el consumo relevante es la memoria del sistema compartida, no la VRAM de GPU.
- GPU recomendadas: no aplica para esta distribución, diseñada para NPU; no se dispone de datos para ejecución en GPU.
- Compatibilidad con GPU de consumo (RTX 4090, etc.): no disponible; el artefacto está empaquetado para NPU, no para CUDA.
- Opciones de despliegue: runtime Ryzen AI de AMD con soporte ONNX; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TranslateGemma4B_rai_1.9.0_m_1.0.1_npu (este) | 4B | no disponible | ONNX (NPU Ryzen AI) | Gemma | Gated en HuggingFace |
| Gemma 3 4B (original de Google) | 4B | no disponible en esta ficha | safetensors, GGUF | Gemma | Público en HuggingFace |
| Modelos de traducción dedicados (p. ej. NLLB, M2M-100) | variable | variable | safetensors | variable | Público |

La comparación cuantitativa de rendimiento no está disponible. La diferencia principal frente al Gemma 3 4B original es el empaquetado para NPU y la orientación a traducción; frente a modelos de traducción dedicados, la ventaja sería la integración en el stack Ryzen AI y la licencia Gemma, con la desventaja de un acceso restringido y un ecosistema de despliegue más limitado.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar las condiciones de la licencia Gemma en HuggingFace antes de descargar.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de atribución; conviene revisar los términos antes de integrarlo en productos.
- Idioma declarado: solo `en`; el rendimiento real en otros idiomas (incluido el castellano) no está documentado y podría degradarse.
- Dependencia del runtime Ryzen AI 1.9.0 y de hardware NPU compatible: no es portable a GPU NVIDIA ni a otros aceleradores sin reconversión.
- Riesgo de alucinación inherente a los modelos de lenguaje de 4B parámetros, especialmente en traducción de textos técnicos o con terminología especializada.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de traducción frente a alternativas.
- Sesgos: no documentados en la información disponible; se heredan los del modelo base Gemma 3.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de usuarios muy reducido, lo que limita el soporte comunitario.

## Enlaces

- HuggingFace: https://huggingface.co/amd/TranslateGemma4B_rai_1.9.0_m_1.0.1_npu
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Ryzen AI (AMD): https://www.amd.com/en/products/processors/ryzen-ai.html
- Quark (AMD): https://quark.docs.amd.com/
- ONNX Runtime: https://onnxruntime.ai/
